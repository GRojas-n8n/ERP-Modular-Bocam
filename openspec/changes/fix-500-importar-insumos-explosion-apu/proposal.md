## Why

`POST /api/v1/gerencia-tecnica/insumos/importar-lote` (`apps/gerencia-tecnica/src/main.ts:316-429`) no valida longitud de texto ni rango numérico antes de escribir a Postgres. Cuando una fila trae `clave` de más de 50 caracteres, `unidad_medida` de más de 20, o `costo_base` fuera del rango de `DECIMAL(12,4)` (máx. 99,999,999.9999), Prisma lanza un error de Postgres y el endpoint responde `500` genérico (`main.ts:423-428`) — el mismo bug ya corregido en Auth, Personal y Compras (`fix-auth-validacion-longitud-usuario`, `fix-personal-validacion-longitud-empleado`, `fix-compras-validacion-longitud-proveedor`), pero sin corregir aquí.

El Gerente Técnico reportó `500` al importar tanto la "Explosión de Insumos" como el "Análisis de Precios Unitarios (APU)" desde la pestaña Insumos — ambos flujos llaman a este mismo endpoint (`InsumosView.tsx:1497`). Los parsers de ambos archivos (`parsearArchivoAPU`, `parsearArchivoExplosion`) detectan columnas por encabezado con heurísticas de regex; si el encabezado real no matchea, caen a columnas por defecto y pueden leer el dato equivocado en `clave`/`unidad_medida` (una descripción larga en vez de un código corto), o —en el caso de APU— el fallback de `costo_base` (`InsumosView.tsx:458-464`, toma el primer número > 0 desde la columna 4) puede capturar un importe total de partida en vez de un costo unitario. Ninguno de los dos parsers valida longitud/rango antes de enviar al backend, y el backend tampoco antes de escribir a Postgres.

## What Changes

- Agregar un schema de validación de longitud y rango (zod) para los campos de `Insumo` (`clave` ≤50, `unidad_medida` ≤20, `costo_base` 0–99,999,999.9999), reutilizando el patrón `parseOrRespond` ya usado en `apps/auth`, `apps/personal` y `apps/compras`.
- Aplicar ese schema en `POST /insumos`, `PATCH /insumos/:id` y `POST /insumos/importar-lote` — en el lote, cada fila inválida se cuenta como "omitida" con el motivo (mismo mecanismo ya usado hoy para tipo/campos faltantes en `main.ts:345-363`), sin abortar el lote completo.
- Los tres endpoints dejan de exponer `error.message` crudo de Prisma en errores inesperados; responden un mensaje genérico por endpoint.
- Agregar la misma validación de longitud/rango en el frontend (`InsumosView.tsx`, cálculo de `_valido`/`_error` en `parsearArchivoAPU`/`parsearArchivoExplosion`) para que la vista previa marque estas filas como inválidas antes de enviarlas, en vez de que el usuario descubra el problema con un 500 después de confirmar.

## Capabilities

### New Capabilities
- `validacion-lote-insumos-importar`: define los límites de longitud/rango por campo para el alta, edición e importación en lote de `Insumo`, y que un fallo de validación se reporta como fila omitida (lote) o `400 VALIDATION_ERROR` (alta/edición individual) en vez de un `500` crudo de Prisma.

### Modified Capabilities
Ninguna — no existe spec previo para `POST/PATCH /insumos` ni para `importar-lote` en `openspec/specs/`.

## Impact

- `apps/gerencia-tecnica/src/main.ts`: endpoints `POST /insumos` (~L269), `POST /insumos/importar-lote` (~L316), `PATCH /insumos/:id` (~L435).
- `apps/gerencia-tecnica/src/validation/` (nuevo): `parse-or-respond.ts` + `schemas/insumo.schema.ts`.
- `apps/gerencia-tecnica/package.json`: agregar dependencia `zod` (no está presente hoy).
- `apps/app-shell/src/views/InsumosView.tsx`: `parsearArchivoAPU`, `parsearArchivoExplosion` — marcar filas con `clave`/`unidad_medida`/`costo_base` fuera de rango como `_valido: false` con `_error` descriptivo, mismo mecanismo que las validaciones de "sin descripción"/"sin costo unitario" ya existentes.
- Sin migración Prisma — los límites ya existen en `apps/gerencia-tecnica/prisma/schema.prisma` (modelo `Insumo`), solo se valida antes de escribir.
