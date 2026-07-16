## Why

Las 3 pantallas con carga masiva (Proveedores, Personal/Empleados, Clientes)
no ofrecen ninguna forma de conocer la estructura de columnas esperada antes
de intentar subir un archivo. El usuario reporta que necesita "adivinar" o
preguntar la estructura (ej. Proveedores) cada vez que quiere preparar un
archivo, lo que genera fricción y archivos rechazados por columnas mal
nombradas.

## What Changes

- Se agrega un botón "Descargar plantilla" junto a cada botón "Importar
  CSV/Excel" existente en `ComprasView.tsx` (Proveedores),
  `PersonalView.tsx` (Empleados) y `VentasView.tsx` (Clientes).
- Cada botón descarga un archivo `.xlsx` con la fila de encabezados
  exacta que el importador de esa entidad reconoce (misma lista de columnas
  y mismos alias que ya usa `leerColumnaCsv`/`construirPreviewImport*` — una
  sola fuente de verdad, no una lista duplicada a mano) más una fila de
  ejemplo con datos de muestra válidos.
- Se agrega un helper compartido en `apps/app-shell/src/lib/csvImport.ts`
  para generar y descargar la plantilla (reutiliza `xlsx`/SheetJS, ya
  dependencia del proyecto — no se agrega ninguna librería nueva).
- No cambia el comportamiento de la importación en sí (parseo, validación,
  endpoints de backend) — es una adición puramente de descarga de un
  archivo de referencia.

## Capabilities

### New Capabilities
- `plantilla-carga-masiva`: define que cada pantalla de carga masiva
  (Proveedores, Empleados, Clientes) SHALL ofrecer una plantilla descargable
  con las columnas exactas que su importador reconoce.

### Modified Capabilities
(ninguna — no cambia el comportamiento de `carga-masiva-proveedores`,
`carga-masiva-empleados` ni `carga-masiva-clientes`, solo se agrega algo
nuevo junto a ellos)

## Impact

- **Archivos afectados**: `apps/app-shell/src/lib/csvImport.ts` (nuevo
  helper), `apps/app-shell/src/views/ComprasView.tsx`,
  `apps/app-shell/src/views/PersonalView.tsx`,
  `apps/app-shell/src/views/VentasView.tsx` (botón nuevo junto al de
  importar, en cada uno).
- Sin cambios de backend, sin cambios de API, sin nueva dependencia (usa
  `xlsx` que ya está instalado y ya se usa para parsear en el mismo
  archivo `csvImport.ts`).
