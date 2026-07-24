## Why

El paquete `xlsx` (SheetJS) usado en app-shell para carga masiva de
archivos y descarga de plantillas tiene 2 vulnerabilidades HIGH sin
parche disponible en el registro npm (ReDoS y Prototype Pollution) —
SheetJS dejó de publicar versiones corregidas ahí; los fixes solo
existen en su CDN propio. Son las 4 últimas alertas Dependabot abiertas
del repo. `exceljs` ya es dependencia del monorepo (usada en
`apps/contabilidad`), sin vulnerabilidades conocidas en la versión ya
instalada, y cubre el mismo caso de uso (lectura de .xlsx/.xls/CSV y
escritura de .xlsx) desde una sola librería.

## What Changes

- El motor de lectura de archivos importados (Clientes, Proveedores,
  Empleados, presupuestos OPUS en Insumos) pasa de `xlsx` a `exceljs`.
- El motor de generación de la plantilla `.xlsx` descargable pasa de
  `xlsx` a `exceljs`.
- `apps/app-shell/package.json` deja de depender de `xlsx`; usa
  `exceljs` (ya presente en el `package-lock.json` raíz).
- **BREAKING (interno, no observable):** la API interna de
  `parseCsvOrExcelFile`/`descargarPlantillaXlsx` en
  `apps/app-shell/src/lib/csvImport.ts` pasa de síncrona a asíncrona
  (exceljs es Promise-based) — cambia la firma de las funciones
  exportadas, pero el comportamiento observable para el usuario final
  (formatos aceptados, detección de encabezados, contenido de la
  plantilla) no cambia.
- Sin cambios de requirements en las capabilities existentes
  (`carga-masiva-archivos`, `carga-masiva-clientes`,
  `carga-masiva-proveedores`, `carga-masiva-empleados`,
  `plantilla-carga-masiva`) — su comportamiento observable se preserva
  exactamente; solo cambia el motor interno.

## Capabilities

### New Capabilities
- `motor-archivos-exceljs`: el motor de lectura/escritura de archivos
  Excel/CSV del frontend usa `exceljs`, no una librería con
  vulnerabilidades sin parche — cubre la paridad de comportamiento con
  el motor anterior (formatos aceptados, manejo de encabezados vía
  `header:1`, valores por defecto, generación de plantilla).

### Modified Capabilities
(ninguna — los requirements de comportamiento observable de
`carga-masiva-archivos`, `carga-masiva-clientes`,
`carga-masiva-proveedores`, `carga-masiva-empleados` y
`plantilla-carga-masiva` no cambian; los cubre `motor-archivos-exceljs`
como requisito técnico independiente)

## Impact

- **Frontend `app-shell`:** `apps/app-shell/src/lib/csvImport.ts`
  (`parseCsvOrExcelFile`, `descargarPlantillaXlsx` — pasan a async),
  `apps/app-shell/src/views/InsumosView.tsx` (2 sitios de uso directo
  de `XLSX.read`/`sheet_to_json`), y cada caller de
  `parseCsvOrExcelFile`/`descargarPlantillaXlsx` (vistas de carga
  masiva de Clientes/Proveedores/Empleados) — deben `await` donde antes
  llamaban síncrono.
- **Dependencias:** `apps/app-shell/package.json` quita `xlsx`, agrega
  `exceljs` (mismo rango que usa `apps/contabilidad` para no duplicar
  versión resuelta en el lockfile raíz).
- Sin cambios de backend, base de datos, ni contratos de API — es
  puramente client-side.
- Resuelve las 4 alertas Dependabot restantes del repo (#53, #52, #4,
  #3), dejando el árbol de dependencias sin vulnerabilidades abiertas.
