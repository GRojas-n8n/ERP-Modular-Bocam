## Context

`ComparativaDetail.tsx` renderiza "TABLA DE COTIZACIONES" como una tabla `<table>` donde
cada línea es una `<tr>`. Los renglones con especificaciones estructuradas capturadas
(`especsMap[lineaDetalleKey(linea)]`) ya agregan, hoy, una `<tr>` adicional por cada
especificación justo debajo de la línea (`{/* Sub-filas de especificaciones */}`,
`ComparativaDetail.tsx:2089`), con controles C/NC/DA/? por `(especificación, proveedor)`
directamente ahí — sin modal.

Los renglones SIN especificaciones capturadas (el "panel simple") no tienen ese desglose:
solo hay UNA evaluación por proveedor por línea (no N por especificación), y hoy se
captura en el modal `showEvalPanel` (arreglado en `fix-evaluacion-tecnica-por-proveedor`,
PR #59, para calificar por proveedor correctamente, pero sigue siendo un modal aparte).
El modelo de datos ya existe: `CotizacionLinea.evaluacionesPorProveedor`.

## Goals / Non-Goals

**Goals:**
- El Residente evalúa C/NC/DA/? por proveedor de un renglón sin specs directamente en
  "TABLA DE COTIZACIONES", sin abrir un modal.
- La tabla permanece legible por defecto — con 1-3 proveedores esto es viable, pero el
  comentario/pregunta obligatorios no caben en una celda angosta, así que se necesita un
  mecanismo de expansión (ver Decisión D1).
- El modal `showEvalPanel` se elimina una vez que la sub-fila cubre el 100% de sus casos.

**Non-Goals:**
- No se fusiona la ruta de datos del panel simple (`ComparativaDetalle.evaluacion_tecnica`
  / `PATCH /evaluar`) con la de la matriz por especificación
  (`EvaluacionEspecItem` / `PATCH /evaluar-especificaciones`) — siguen siendo dos tablas y
  dos endpoints separados en el backend; solo se unifica la interacción visual.
- No se cambia el comportamiento de firma (`todasEvaluadas`) ni el gate ya corregido en
  `fix-evaluacion-tecnica-por-proveedor` — esta interacción solo cambia CÓMO se capturan
  las mismas evaluaciones, no las reglas de negocio sobre ellas.
- Sin cambios de backend.

## Decisions

### D1: Sub-fila siempre visible, alineada por columna de proveedor (no colSpan, no toggle)

Revisando el código real de la sub-fila de especificaciones
(`ComparativaDetail.tsx:2089-2221`): NO usa un bloque `colSpan` ancho — alinea los
controles C/NC/DA/? de cada proveedor dentro de su propia `<td>`, en la misma columna
angosta (`w-36`, ~144px) donde ya viven precio y fecha de entrega. La pregunta obligatoria
para "?" ya cabe en ese ancho (`textarea` con `min-h-[44px]` dentro del `<td>` de esp.).
Esto invalida la premisa de D1 original (que asumía que un bloque por proveedor no cabía
sin `colSpan`) — si ya funciona para la matriz, funciona igual para el panel simple.

Se adopta el mismo patrón exacto: una `<tr>` adicional por línea sin especificaciones,
**siempre visible** (sin toggle "Evaluar ▾", sin estado de expansión) — igual que la
matriz ya hace incondicionalmente. Cada `<td>` de esa fila, alineado bajo la columna del
proveedor correspondiente, contiene sus botones C/NC/DA/? y (si aplica) comentario o
pregunta. Como el panel simple solo tiene 1 fila por línea (no N por especificación como
la matriz), el costo de espacio vertical es mínimo — no justifica la complejidad de un
expand/collapse.

**Alternativa descartada (versión original de este documento)**: sub-fila colapsable con
botón "Evaluar ▾" y colSpan ancho. Descartada tras revisar el patrón real de la matriz —
innecesariamente compleja para el mismo resultado.
**Alternativa descartada**: columnas siempre visibles junto al precio en la fila
principal (en vez de una fila aparte). Descartada porque mezclaría captura de precio y
evaluación técnica en la misma celda, distinto momento del flujo (Compras cotiza, Residente
evalúa después) — la fila separada ya es el patrón usado por la matriz por la misma razón.

### D2: Guardado mixto — por línea para C/NC/DA, agregado para "?"

Confirmado en `apps/compras/src/main.ts:5563` (`POST
.../revision-con-preguntas`): este endpoint **no es aditivo** — cada llamada crea un
`cuadroComparativo` nuevo por completo (nueva revisión, `revision_padre_id` apuntando al
original, el original pasa a `REVISION_SOLICITADA`). Guardar línea por línea disparando
esta llamada una vez por cada línea con "?" crearía una revisión nueva por cada una — un
cuadro roto con N revisiones fantasma en vez de una sola. Esto descarta un guardado 100%
por línea tal como se planteó inicialmente.

Diseño final:
- **Decisiones sin "?" (C/NC/DA)**: cada sub-fila expandida tiene su propio botón
  "Guardar" que llama `PATCH /comparativas/:id/evaluar` solo con las evaluaciones de esa
  línea — esta llamada sí es segura de repetir por línea (actualiza `ComparativaDetalle`
  por `id_detalle`, sin crear nada).
- **Decisiones con "?" en cualquier línea**: no se guardan al vuelo por línea. Se acumulan
  en el mismo `evalForm`/`preguntasEval` locales (ya existentes) mientras el Residente
  recorre distintas sub-filas, y un botón agregado — visible a nivel de tabla mientras
  exista al menos un "?" pendiente en cualquier línea, mismo texto/rol que el footer actual
  del modal ("Guardar y Crear Revisión") — dispara UNA sola llamada a
  `revision-con-preguntas` con todas las evaluaciones "?" (y las demás ya en `evalForm`)
  juntas, igual que hoy.

**Alternativa descartada**: guardado 100% por línea también para "?". Descartada por la
razón arriba — rompe el modelo de revisión del backend.

### D3: Eliminación del modal `showEvalPanel`

Una vez la sub-fila cubre evaluar cualquier línea sin specs, el modal se elimina por
completo (no se deja como fallback) — mantenerlo duplicaría la lógica de guardado y
confundiría cuál es la ruta "oficial".

## Risks / Trade-offs

- **[Riesgo]** Cuadros con muchos renglones sin specs y varias sub-filas expandidas a la
  vez pueden hacer la tabla larga de navegar.
  **[Mitigación]** Solo una línea puede estar expandida a la vez por defecto (acordeón),
  o se acepta scroll normal — decisión de implementación, no bloqueante para el diseño.
- **[Riesgo]** Mezclar dos mecanismos de guardado (por línea para C/NC/DA, agregado para
  "?") puede confundir al Residente sobre qué botón usar cuándo.
  **[Mitigación]** El botón "Guardar" de la sub-fila se deshabilita/oculta y se sustituye
  por el aviso "Se guardará con el resto de preguntas ↓" cuando esa línea tiene un "?" —
  un único punto de guardado visible para el caso "?", igual que ya hace el modal actual
  con su banner de aviso.

## Migration Plan

Sin cambios de backend/schema. Despliegue normal de frontend. El modal se retira en el
mismo PR que agrega la sub-fila (no hay estado intermedio con ambos activos en producción).
