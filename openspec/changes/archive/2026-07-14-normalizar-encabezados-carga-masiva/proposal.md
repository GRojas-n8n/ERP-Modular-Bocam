## Why

Los 3 importadores de carga masiva (Clientes en `VentasView.tsx`, Proveedores en
`ComprasView.tsx`, Empleados en `PersonalView.tsx`) reconocen las columnas de un
Excel/CSV comparando el encabezado contra una lista de alias en **minúsculas exactas**
(`key.trim().toLowerCase()` comparado por `.includes()`), sin quitar acentos ni tratar
espacios/guiones como equivalentes al guion bajo de los alias (`razon_social`,
`apellido_paterno`, `fecha_ingreso`, etc.).

Confirmado en producción (2026-07-13, usuario administrador): al subir un Excel de 51
clientes con encabezado **"RAZÓN SOCIAL"** (con tilde y espacio, la forma natural en que
cualquier persona de negocio nombraría esa columna), el importador nunca la reconoce —
`razón social` ≠ `razon_social` — y marca **todas** las filas como error por falta de razón
social, aunque el dato sí está en el archivo.

## What Changes

- Nueva función compartida de emparejamiento de encabezados en
  `apps/app-shell/src/lib/csvImport.ts` que normaliza tanto el encabezado del archivo como
  los alias antes de comparar: quita acentos, pasa a minúsculas, y trata espacios/guiones
  como equivalentes al guion bajo (además de quitar conectores comunes como "de"/"del" para
  que "Fecha de Ingreso" empareje con el alias `fecha_ingreso`).
- Los 3 importadores (`leerColumnaImport` en `VentasView.tsx`,
  `leerColumnaImportProveedor` en `ComprasView.tsx`, `leerColumnaImportEmpleado` en
  `PersonalView.tsx`) usan la función compartida en vez de su copia local duplicada —
  mismos alias que ya aceptaban, ahora con comparación tolerante.
- Sin cambios de backend — el problema es puramente de lectura del archivo en el
  navegador antes de enviar los datos ya mapeados al backend.

## Capabilities

### New Capabilities

- `carga-masiva-archivos`: comportamiento compartido de lectura/emparejamiento de columnas
  de Excel/CSV para los 3 importadores (Clientes, Proveedores, Empleados). No existía una
  capability formal en `openspec/specs/` para esto (los changes
  `carga-masiva-clientes-ventas`/`carga-masiva-proveedores-compras`/
  `carga-masiva-empleados-personal` siguen activos, sin archivar); se documenta aquí por ser
  el comportamiento cross-cutting que este bug-fix corrige.

### Modified Capabilities

(ninguna)

## Impact

- **Frontend únicamente**: `apps/app-shell/src/lib/csvImport.ts` (función nueva
  compartida), `apps/app-shell/src/views/VentasView.tsx`,
  `apps/app-shell/src/views/ComprasView.tsx`, `apps/app-shell/src/views/PersonalView.tsx`.
- Afecta los 3 flujos de carga masiva en producción — bloqueaba la importación real de
  clientes del usuario administrador (51 registros, encabezados en español natural).
