## Why

`POST /comparativas` (crear el Cuadro Comparativo) falla con error 500 cada vez que un ítem
de la requisición tiene `especificacion_marca_modelo` de más de 100 caracteres — la columna
`ComparativaLinea.marca_modelo_ref` es `VARCHAR(100)`, pero la columna origen
`RequisicionItem.especificacion_marca_modelo` es `VARCHAR(200)` (mismatch introducido en
`marca-especificaciones-cuadro-comparativo`, PR #51, que copia el valor sin recortarlo).

Confirmado en logs de producción (2026-07-13, usuario administrador): `Invalid
prisma.comparativaLinea.upsert() invocation: The provided value for the column is too long
for the column's type` — 500 en cada intento de crear el cuadro para la requisición de
imprevistos cuyo segundo ítem tiene una marca/modelo de 109 caracteres.

**Bug compuesto, más grave**: el frontend (`openComparativa`, `ComprasView.tsx:900-904`)
tiene un `catch` silencioso que, si `POST /comparativas` falla, sigue adelante usando un ID
local falso (`comp-new-{timestamp}`) como si el cuadro se hubiera creado, sin avisar al
usuario. Todas las acciones posteriores sobre ese cuadro (guardar marca/especificaciones,
subir PDF, capturar precios) fallan también en el backend (`Inconsistent column data: Error
creating UUID... found 'o' at 2`, porque `comp-new-...` no es un UUID válido), pero como
varios de esos handlers también silencian sus errores (`catch (_) { /* silencioso */ }`), el
usuario nunca ve ningún mensaje de error — la pantalla se ve como si todo funcionara, pero
nada se persiste. Esto explica el reporte del usuario: "no hay botón para finalizar el
cuadro, el Residente no ve nada que evaluar" — el cuadro nunca existió realmente.

## What Changes

- Ampliar `ComparativaLinea.marca_modelo_ref` de `VARCHAR(100)` a `VARCHAR(200)` para que
  coincida con el límite real de `RequisicionItem.especificacion_marca_modelo` — elimina la
  causa raíz sin truncar/perder información. Migración aditiva y segura (ampliar un
  `VARCHAR` en PostgreSQL no reescribe la tabla).
- `openComparativa` (frontend) ya NO oculta el error si `POST /comparativas` falla: muestra
  un `notify()` de error explícito y no abre el cuadro con un ID falso — evita que el
  usuario trabaje sobre un cuadro fantasma sin saberlo.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `cotizacion-compras-ux`: la creación del Cuadro Comparativo debe tolerar el rango completo
  de longitud de `especificacion_marca_modelo` capturado en la requisición, y fallar de
  forma visible (no silenciosa) si la creación no puede completarse.

## Impact

- **Backend**: `apps/compras/prisma/schema.prisma` (`ComparativaLinea.marca_modelo_ref`),
  migración de Prisma.
- **Frontend**: `apps/app-shell/src/views/ComprasView.tsx` (`openComparativa`).
- Bloqueaba por completo la creación de cuadros comparativos para requisiciones de
  imprevistos con marca/modelo largo — es el hallazgo más severo de toda la sesión de
  pruebas, se prioriza sobre cualquier otro pendiente.
