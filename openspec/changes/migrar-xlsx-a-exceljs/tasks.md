## 1. Dependencias

- [x] 1.1 Agregar `exceljs` (mismo rango que `apps/contabilidad`) y `papaparse` + `@types/papaparse` a `apps/app-shell/package.json`.
- [x] 1.2 Quitar `xlsx` de `apps/app-shell/package.json`.
- [x] 1.3 `npm install` en la raíz y confirmar con `npm ls xlsx` que ya no queda ninguna instancia en el árbol. Confirmado: `(empty)`. `exceljs` dedupea con la instancia ya usada por `apps/contabilidad`/`apps/reportes`.

## 2. Motor de lectura/escritura (`csvImport.ts`)

- [x] 2.1 Test escrito y en verde (`csvImport.parseo.test.ts`).
- [x] 2.2 Test escrito y en verde.
- [x] 2.3 Test escrito y en verde.
- [x] 2.4 Implementado. **Hallazgo:** `Blob.prototype.arrayBuffer()`/`.text()` no existen en el `Blob` de jsdom (entorno de test) — se mantuvo el patrón `FileReader` ya usado por el código original (funciona igual en navegador real y en jsdom) en vez de la API moderna de `File`.
- [x] 2.5 Test escrito y en verde.
- [x] 2.6 Implementado con `workbook.xlsx.writeBuffer()` + `Blob` + `<a download>` + `URL.revokeObjectURL`.
- [x] 2.7 Tests existentes de `leerColumnaCsv` (`csvImport.test.ts`, 6 tests) siguen en verde sin tocarlos.

## 3. Modo arreglo de arreglos (`InsumosView.tsx`)

- [x] 3.1 Tests agregados para `parseCsvOrExcelFileComoFilas` (motor compartido) — 3 tests en verde. **Bug real encontrado y corregido:** `row.cellCount` de exceljs excluye celdas vacías al final de la fila (a diferencia de `sheet_to_json({header:1, defval:''})`, que sí las incluye como `''`) — se corrigió usando `worksheet.columnCount` como ancho fijo de fila.
- [x] 3.2 Reescrito: `leerArchivoComoRawRows` ahora delega en `parseCsvOrExcelFileComoFilas`, misma firma de callback `onSuccess`/`onError`.
- [x] 3.3 Reescrito: `handleFileChange` (Tab 1, Catálogo de Obra) usa `parseCsvOrExcelFileComoFilas` una sola vez; el modo "objetos desde fila N" (antes una segunda llamada a `sheet_to_json` con `range`) se deriva localmente del arreglo de arreglos ya obtenido — un solo parseo del archivo en vez de dos.

## 4. Callers

- [x] 4.1 `ComprasView.tsx`: `parseCsvOrExcelFile` ya usaba `await` (era async desde el código original). `descargarPlantillaXlsx` ajustado a `onClick={() => void descargarPlantillaXlsx(...)}` (patrón `void` ya usado en el resto del codebase para promesas fire-and-forget).
- [x] 4.2 `PersonalView.tsx`: mismo ajuste.
- [x] 4.3 `VentasView.tsx`: mismo ajuste.

## 5. Verificación

- [x] 5.1 `npx tsc -b` en `app-shell` — sin errores.
- [x] 5.2 `npx vitest run` en `app-shell` — **31 archivos, 96 tests, todos en verde** (incluye toda la suite existente, no solo los tests nuevos — sin regresiones).
- [x] 5.3 `npm audit` sobre el monorepo — **0 vulnerabilidades** (antes: 4, todas de `xlsx`).
- [ ] 5.4 **Pendiente** — requiere navegador real (extensión de Chrome no disponible en esta sesión). El comportamiento está cubierto por tests automatizados con archivos `.xlsx`/`.csv` reales construidos con `exceljs`, pero falta la confirmación visual de cargar un archivo desde disco en cada vista y descargar una plantilla real.
