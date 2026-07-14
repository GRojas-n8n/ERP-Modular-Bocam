## Context

`handleAplicarCotizacion` (`apps/app-shell/src/components/ComparativaDetail.tsx:888-922`)
recorre `comp.lineas` y para cada una busca el primer `renglonesPdf` cuya descripción
comparta un substring de 10 caracteres con la descripción de la línea (en cualquiera de los
dos sentidos). Sin match, la línea no se toca. El código no distingue "0 líneas
emparejadas" de "todas emparejadas" — siempre termina con el mismo toast de éxito.

Las descripciones a comparar vienen de dos fuentes con formato muy distinto:
- `linea.insumo_descripcion`: descripción del catálogo de insumos, o texto libre capturado
  por el Residente al crear la requisición (`descripcion_libre`, sin normalizar).
- `renglonesPdf[].descripcion`: texto extraído por el servicio de IA (`apps/asistente`)
  directamente del PDF del proveedor, con la redacción propia de cada proveedor.

No hay garantía de que ambas cadenas compartan un prefijo — de hecho, en el caso real que
motivó este bug-fix, casi seguro no lo comparten.

## Goals / Non-Goals

**Goals:**
- Un criterio de emparejamiento tolerante a diferencias de orden/redacción entre la
  descripción de la línea y la del renglón extraído del PDF.
- El usuario SIEMPRE sabe, tras "Aplicar cotización", cuántas líneas quedaron sin precio
  por falta de match — no un mensaje de éxito genérico indiferenciado.
- Mantener el comportamiento actual de persistencia del PDF como respaldo, sin cambios.

**Non-Goals:**
- No se busca una solución de matching semántico con IA (ej. otra llamada al LLM para
  decidir el emparejamiento) — el alcance es una heurística determinista, rápida, sin
  dependencias nuevas ni llamadas de red adicionales.
- No se cambia el formato de salida del servicio de extracción (`apps/asistente`), solo cómo
  el frontend usa esa salida.
- No se resuelve aquí el caso general de "requisición con múltiples ítems ambiguos entre
  sí" más allá de lo que ya cubre un mejor scoring — no hay deduplicación avanzada ni
  asignación óptima tipo bipartite-matching (ver Non-Goals → alternativa descartada abajo).

## Decisions

### D1: Reemplazar substring-de-10-caracteres por puntaje de solapamiento de tokens

Nueva función pura `emparejarRenglonesConLineas` en un módulo testeable nuevo
(`apps/app-shell/src/lib/cotizacion-pdf-match.ts`):
1. Normalizar cada descripción: minúsculas, quitar acentos (`normalize('NFD').replace(/[̀-ͯ]/g, '')`),
   quitar puntuación, tokenizar por espacios.
2. Descartar tokens de longitud ≤ 2 (stopwords típicas en español: "de", "a", "el", "la",
   "un", "en", etc. quedan naturalmente excluidas por longitud, sin necesidad de una lista
   explícita de stopwords que habría que mantener).
3. Para cada línea, calcular el puntaje contra cada renglón como el número de tokens
   compartidos (intersección de conjuntos de tokens).
4. Elegir, por línea, el renglón con mayor puntaje. Si el mejor puntaje es `0` (ningún token
   compartido), la línea queda sin match — igual que hoy, pero ahora contabilizado
   explícitamente.
5. Umbral mínimo: puntaje `>= 1` (al menos un token significativo compartido) para
   considerar match válido. No se agrega un umbral más alto (ej. proporción de tokens) para
   no introducir falsos negativos en textos cortos — un match débil pero correcto es
   preferible a forzar más captura manual de la necesaria.

**Alternativas descartadas**:
- *Distancia de edición (Levenshtein) sobre la cadena completa*: penaliza fuertemente
  reordenamientos de palabras, que son el caso común aquí (ej. "Split Inverter Mini 1
  Tonelada" vs "Mini Split Inverter de 1 Tonelada") — el solapamiento de tokens es más
  tolerante a eso a menor costo de implementación.
- *Asignación óptima bipartita (ej. algoritmo húngaro) para evitar que un mismo renglón se
  asigne a dos líneas*: sobre-ingeniería para el tamaño real de estos cuadros (máximo unos
  pocos ítems por requisición) — un simple "mejor puntaje por línea, greedy" es suficiente y
  mucho más simple de razonar y testear.

### D2: Contabilizar y comunicar líneas sin match

`handleAplicarCotizacion` cuenta cuántas líneas quedaron sin match tras `D1` y ajusta el
`notify()` final:
- 0 líneas sin match → toast de éxito actual, sin cambios: "Cotización aplicada — Precios
  del PDF aplicados al cuadro".
- Algunas líneas sin match (match parcial) → toast tipo `warning`: "Cotización aplicada
  parcialmente — N de M líneas no se pudieron relacionar automáticamente con el PDF.
  Captúralas manualmente."
- Todas las líneas sin match (como el caso real que motivó este fix) → mismo toast de
  `warning` con N = M, mensaje sigue siendo preciso sin necesitar un tercer caso especial.

El PDF se sigue persistiendo igual en los tres casos (sin cambios respecto al código actual
en `handleAplicarCotizacion:904-917`).

## Risks / Trade-offs

- **[Riesgo]** El solapamiento de tokens puede producir falsos positivos en requisiciones
  con varios ítems de descripción muy similar entre sí (ej. "Tornillo 1/4" vs "Tornillo
  3/8") si el renglón del PDF no incluye el detalle que las distingue.
  **[Mitigación]** Es el mismo riesgo que ya existía con el criterio de substring (igual de
  susceptible o peor); no es una regresión. Fuera de alcance resolverlo con más precisión —
  documentado como limitación conocida, no bloqueante para este fix.
- **[Trade-off]** Sin lista explícita de stopwords en español, palabras cortas pero
  significativas (ej. "PVC", "220V" ya tienen más de 2 caracteres así que no se filtran) se
  conservan correctamente; palabras de 1-2 letras que sí importarían en un caso extremo
  (poco realista para descripciones de insumos de construcción) se pierden — aceptable dado
  el dominio.

## Migration Plan

No aplica migración de datos (sin cambios de schema/backend). Despliegue normal de frontend
(`apps/app-shell`). Rollback: revertir el commit del PR, sin efectos secundarios en datos ya
persistidos (los PDFs de respaldo ya subidos no se ven afectados).
