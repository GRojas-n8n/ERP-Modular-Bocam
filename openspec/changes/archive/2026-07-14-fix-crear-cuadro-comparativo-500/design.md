## Context

`ComparativaLinea.marca_modelo_ref` (`VARCHAR(100)`) recibe su valor de
`RequisicionItem.especificacion_marca_modelo` (`VARCHAR(200)`) desde
`marca-especificaciones-cuadro-comparativo` (PR #51). El mismatch de longitud nunca se
probó con un valor real de más de 100 caracteres — los tests de integración de ese change
usaban textos cortos.

El fallo en `POST /comparativas` se combina con manejo de errores silencioso en el frontend
(`openComparativa` y varios handlers de `ComparativaDetail.tsx`), que enmascara por completo
el problema: el usuario nunca ve un error, solo un cuadro que "funciona" en pantalla pero
nunca persiste nada.

## Goals / Non-Goals

**Goals:**
- `POST /comparativas` no falla por longitud de marca/modelo, para cualquier valor válido
  capturado en la requisición (hasta 200 caracteres).
- Si la creación del cuadro falla por cualquier otra razón, el usuario lo sabe de inmediato
  — no se abre una vista de trabajo sobre un cuadro que no existe.

**Non-Goals:**
- No se audita ni corrige aquí cada `catch` silencioso del componente
  (`handleDetalleBlur`, subida de PDF, etc.) — quedan fuera de alcance salvo el de
  `openComparativa`, que es el que causa el efecto más grave (todo el resto de acciones
  fallan en cascada porque el cuadro base nunca existió). Si aparecen más síntomas de
  errores silenciados en otros handlers, se atienden como hallazgos aparte.

## Decisions

### D1: Ampliar la columna en vez de truncar el valor

Ampliar `marca_modelo_ref` a `VARCHAR(200)` (igual que la columna origen) en vez de truncar
el texto al copiarlo. Truncar perdería información real capturada por el Residente sin
ningún beneficio — ampliar la columna es una migración trivial y segura en PostgreSQL
(`ALTER COLUMN TYPE VARCHAR(200)` sobre una columna ya `VARCHAR`, no reescribe filas).

### D2: `openComparativa` falla de forma visible, no silenciosa

Reemplazar el `catch { /* si falla, usar ID local */ }` de la creación del cuadro
(`ComprasView.tsx:900-904`) por un `catch` que muestra `notify({ type: 'error', ... })` con
el mensaje del backend y **no** abre el cuadro (no hace `setActiveReqId`/`setComparativas`
con un ID falso) — el usuario se queda en la lista de requisiciones con un error visible en
vez de entrar a una pantalla que parece funcional pero no persiste nada.

**Alternativa descartada**: mantener el fallback local pero mostrar un banner de advertencia
dentro del cuadro ("modo sin conexión"). Se descarta por complejidad — no hay un caso de uso
real donde trabajar sobre un cuadro comparativo sin backend real sea útil (a diferencia de
otros fallbacks legítimos en la app, como capturar precios manualmente cuando la IA no está
disponible).

## Risks / Trade-offs

- **[Riesgo]** Otros handlers de `ComparativaDetail.tsx` siguen teniendo `catch` silenciosos
  (documentado en Non-Goals) — un fallo distinto en, por ejemplo, guardar marca/especificaciones
  después de creado el cuadro correctamente, seguiría sin avisar al usuario.
  **[Mitigación]** El caso más grave (cuadro fantasma completo) queda cerrado con D2; el
  resto es una mejora incremental de UX a evaluar si vuelve a aparecer un síntoma similar.

## Migration Plan

Migración de Prisma aditiva (`ALTER COLUMN marca_modelo_ref TYPE VARCHAR(200)`), sin
backfill necesario — los valores existentes (todos ≤100 caracteres, porque nunca pudieron
guardarse más largos) siguen siendo válidos bajo el nuevo límite. Despliegue de backend +
frontend juntos, dado que ambos cambios atacan el mismo incidente.
