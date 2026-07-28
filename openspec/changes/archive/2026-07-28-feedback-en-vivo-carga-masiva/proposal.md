## Why

Las 3 vistas de carga masiva (Clientes en `VentasView.tsx`, Proveedores en `ComprasView.tsx`,
Empleados en `PersonalView.tsx`) comparten el mismo patrón: `handleImportFileChange` llama
`await parseCsvOrExcelFile(file)` (una sola promesa opaca que resuelve hasta terminar de leer
todo el archivo) y luego `construirPreviewImport*(rows)` (un solo paso síncrono que recorre
el arreglo completo y arma los errores por fila) antes de llamar `setFilasImport(...)` **una
sola vez** con el resultado completo. El usuario no ve ninguna fila ni ningún error hasta que
ambos pasos terminan — si el archivo tiene un typo en la fila 400, no se entera hasta que la
tabla de vista previa completa aparece de golpe, sin importar si el archivo tardó 200ms o
varios segundos en procesarse.

Investigar la librería de parseo (`apps/app-shell/src/lib/csvImport.ts`, ya migrada a
`exceljs`/`papaparse` en el change `migrar-xlsx-a-exceljs`) mostró una asimetría real: CSV vía
`Papa.parse` soporta un callback `step` nativo (una fila a la vez, streaming real, sin
necesidad de leer el archivo completo primero), pero XLSX vía `exceljs` en el navegador
requiere `wb.xlsx.load(buffer)` — el buffer completo ya está en memoria (`FileReader` lo leyó
entero) y `exceljs` lo parsea de una sola pasada; su modo streaming (`WorkbookReader`) espera
un stream tipo Node, no un `ArrayBuffer` de navegador, así que no hay forma directa de
streamear la lectura de un `.xlsx` fila por fila en este entorno sin un shim adicional.

## What Changes

- **CSV:** `parseCsvOrExcelFile`/`parseCsvOrExcelFileComoFilas`
  (`apps/app-shell/src/lib/csvImport.ts`) ganan una variante que acepta un callback
  `onFila(fila, indice)` y usa `Papa.parse(..., { step: ... })` en vez de `{ complete: ... }`
  — cada fila se entrega al callback apenas se parsea, sin esperar el archivo completo.
- **XLSX:** se mantiene `wb.xlsx.load(buffer)` (la lectura del buffer completo no se puede
  streamear en este entorno sin librerías adicionales — ver design.md), pero la fase de
  **validación** (`construirPreviewImportClientes`/`Proveedores`/`Empleados`, hoy un solo
  `rows.forEach` síncrono) pasa a procesarse en lotes pequeños con cesión al event loop entre
  lotes, para que la UI pueda pintar el progreso conforme cada lote se valida, en vez de
  bloquear hasta terminar todo el arreglo.
- Las 3 vistas (`VentasView.tsx`, `ComprasView.tsx`, `PersonalView.tsx`) actualizan
  `filasImport` incrementalmente (por fila en CSV, por lote en XLSX) en vez de con un solo
  `setFilasImport(...)` al final, y muestran el conteo de filas procesadas y errores
  encontrados hasta el momento mientras el archivo sigue procesándose.
- **NO** se cambia el formato de columnas reconocidas, los alias de encabezado
  (`leerColumnaCsv`), ni el resultado final mostrado (mismas filas, mismos errores) — el
  cambio es únicamente sobre *cuándo* el usuario ve cada fila y su error, no sobre qué se
  considera error.
- **NO** se implementa lectura streaming real de `.xlsx` (requeriría un shim de stream de
  Node en navegador) — queda documentado como limitación conocida en design.md.

## Capabilities

### New Capabilities
- `feedback-progreso-carga-masiva`: durante la carga masiva de Clientes, Proveedores o
  Empleados, el sistema SHALL mostrar cada fila y su error específico conforme se procesa,
  en vez de esperar a que el archivo completo termine de leerse y validarse.

### Modified Capabilities
(ninguna — `carga-masiva-archivos`, `carga-masiva-clientes`, `carga-masiva-proveedores`,
`carga-masiva-empleados` y `plantilla-carga-masiva` cubren el emparejamiento de columnas y el
resultado final, que no cambian de comportamiento con este change)

## Impact

- **Afectado:** `apps/app-shell/src/lib/csvImport.ts` (nueva variante de parseo con callback
  por fila para CSV; procesamiento en lotes para la validación de XLSX),
  `apps/app-shell/src/views/VentasView.tsx`, `apps/app-shell/src/views/ComprasView.tsx`,
  `apps/app-shell/src/views/PersonalView.tsx` (actualización incremental de `filasImport` +
  indicador de progreso en el panel de importación).
- **No afectado:** `apps/app-shell/src/views/InsumosView.tsx` (usa
  `parseCsvOrExcelFileComoFilas` para presupuestos OPUS con formato posicional fijo, no un
  flujo de "fila con errores" — fuera de alcance de este change), ningún endpoint de backend
  (la validación del backend al confirmar la importación no cambia).
- **Dependencias:** ninguna nueva librería — `Papa.parse` ya soporta `step` de forma nativa;
  el procesamiento en lotes de XLSX se logra con `setTimeout`/`requestAnimationFrame` ya
  disponibles en el navegador.
