## Context

`xlsx` se usa en 3 sitios de `app-shell`, todos client-side (sin
backend involucrado): `apps/app-shell/src/lib/csvImport.ts`
(`parseCsvOrExcelFile` para carga masiva de Clientes/Proveedores/
Empleados, `descargarPlantillaXlsx` para la plantilla descargable) y 2
usos directos en `apps/app-shell/src/views/InsumosView.tsx` (carga de
presupuestos OPUS). `exceljs` ya es dependencia del monorepo
(`apps/contabilidad`), tiene build de navegador (`"browser":
"./dist/exceljs.min.js"` en su `package.json`, que Vite resuelve solo)
y su versión ya instalada (4.4.0) no tiene vulnerabilidades conocidas.

Investigué la API CSV de exceljs (`workbook.csv.read(stream)`) y
requiere un `Stream` de Node — awkward/frágil en un bundle de
navegador (dependería del shim `readable-stream` que trae exceljs como
dependencia transitiva, sin garantía de comportamiento estable en
Vite). Por eso el diseño separa el motor CSV del motor Excel.

## Goals / Non-Goals

**Goals:**
- Cero dependencia de `xlsx` en `apps/app-shell`.
- Comportamiento observable idéntico: mismos formatos aceptados
  (.csv/.txt/.xlsx/.xls), misma detección de encabezados vía
  `leerColumnaCsv` (que opera sobre filas ya parseadas, no cambia),
  mismo contenido de la plantilla descargable.
- Cero vulnerabilidades npm audit relacionadas a esta librería.

**Non-Goals:**
- No se toca `apps/contabilidad` (ya usa exceljs, sin cambios).
- No se agregan features nuevas de importación/exportación (formato
  `.xls` legado, estilos, fórmulas) — mismo alcance funcional de hoy.
- No se cambia el layout ni las columnas de ninguna vista de carga
  masiva — solo el motor interno de lectura/escritura.

## Decisions

**1. Motor separado por formato: `exceljs` para .xlsx/.xls, `papaparse` para .csv/.txt.**
En vez de forzar toda la lectura a través de la API CSV de exceljs
(basada en streams de Node, frágil en navegador), se usa `papaparse`
—librería dedicada a CSV, ~45 KB, cero vulnerabilidades en su versión
actual (5.5.4+), mantenimiento activo— para el branch `.csv`/`.txt`
que ya existe en el código (`ext === 'csv' || ext === 'txt'`), y
`exceljs` (`workbook.xlsx.load(buffer)`) solo para el branch binario
`.xlsx`/`.xls`.
- *Alternativa descartada:* usar `workbook.csv.read()` de exceljs
  para todo. Requiere construir un `Stream` de Node-like a partir de
  texto plano en el navegador (vía el shim `readable-stream`) — más
  frágil y menos testeado en bundlers que una librería CSV nativa de
  navegador, para un beneficio nulo (ya se necesita una dependencia
  nueva de todos modos si se quiere evitar ese riesgo).

**2. `parseCsvOrExcelFile`/`descargarPlantillaXlsx` pasan a async.**
exceljs es Promise-based (`workbook.xlsx.load`,
`workbook.xlsx.writeBuffer`) — no hay forma de mantener la firma
síncrona actual sin envolver en hacks. Se actualiza la firma pública
de ambas funciones a `Promise<...>` y se ajustan los 3 callers
existentes (`csvImport.ts` internamente, y los 2 sitios de
`InsumosView.tsx`) a `await`.
- *Alternativa descartada:* mantener una envoltura síncrona con
  callbacks anidados para imitar la API vieja. Añade complejidad sin
  beneficio — los callers ya están dentro de manejadores de eventos
  async (`onChange` de un `<input type="file">`), así que `await` es
  un cambio mínimo.

**3. Descarga de plantilla vía Blob + `<a download>` manual.**
`exceljs` no tiene un equivalente a `XLSX.writeFile()` (que en xlsx
dispara la descarga del navegador internamente). Se agrega un helper
pequeño: `workbook.xlsx.writeBuffer()` → `new Blob([buffer], {type:
'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})`
→ `URL.createObjectURL` → click programático en un `<a>` con
`download` → `URL.revokeObjectURL`. Patrón estándar, sin dependencias
nuevas.

**4. Paridad de opciones `header:1` / `defval:''` / `raw:false`.**
El código actual usa `sheet_to_json(ws, {header:1, defval:'', raw:false})`
(array-of-arrays, para `InsumosView.tsx`) y
`sheet_to_json(ws, {defval:'', raw:false})` (array-of-objects usando la
fila 1 como encabezados, para `csvImport.ts`). Con exceljs se
recorre `worksheet.eachRow()`/`worksheet.getRow(1).values` manualmente:
- Array-of-arrays: mapear cada `row.values` (exceljs indexa celdas
  desde 1, no 0 — hay que hacer `row.values.slice(1)`) a string,
  reemplazando `null`/`undefined` por `''` (paridad con `defval:''`).
- Array-of-objects: tomar la fila 1 como encabezados, luego cada fila
  siguiente se convierte a `Record<string, string>` con las mismas
  reglas de valor por defecto.
- `raw:false` en xlsx fuerza formato de texto (no números/fechas
  crudos) — con exceljs, convertir explícitamente cada valor de celda
  a `String(cell.value ?? '')`.

## Risks / Trade-offs

- [Paridad exacta de parseo] La lógica de conversión celda→string debe
  replicar el comportamiento de `raw:false`/`defval:''` exactamente,
  o una carga masiva real (con fechas, números, celdas vacías)
  podría comportarse distinto → Mitigación: tests unitarios que
  cubran fechas, números, celdas vacías y encabezados con acentos
  ANTES de tocar los callers reales; verificación manual con un
  archivo real de cada tipo (Clientes, Proveedores, Empleados,
  presupuesto OPUS) antes de mergear.
- [Firma async rompe callers no actualizados] Si algún caller de
  `parseCsvOrExcelFile`/`descargarPlantillaXlsx` queda sin `await`,
  TypeScript lo marca en compilación (`tsc -b` real, no
  `--noEmit`) → Mitigación: `tsc -b` en `app-shell` como parte de la
  verificación de cada tarea.
- [exceljs con mantenimiento inactivo] Sin releases recientes según
  Snyk, aunque sin CVEs abiertos en la versión usada → Mitigación:
  ninguna requerida ahora (sigue siendo estrictamente mejor que la
  situación actual con `xlsx`); registrar como seguimiento futuro si
  aparece una vulnerabilidad real.
- [Bundle size] `exceljs.min.js` (~930 KB sin gzip) es más grande que
  el build actual de `xlsx` → Mitigación: verificar que
  `InsumosView.tsx` y las vistas de carga masiva ya estén (o queden)
  en rutas con code-splitting de Vite, para que no infle el bundle
  inicial de la SPA.

## Migration Plan

- Sin backend ni base de datos involucrados — cambio 100% client-side.
- Orden: (1) agregar `exceljs`/`papaparse` a `apps/app-shell/package.json`,
  quitar `xlsx`; (2) reescribir `csvImport.ts` con tests unitarios en
  verde; (3) actualizar los 2 sitios de `InsumosView.tsx`; (4)
  verificación manual de cada flujo de carga masiva.
- Rollback: revertir el commit restaura `xlsx` — sin estado persistente
  de por medio (todo el procesamiento es en memoria del navegador).

## Open Questions

- Ninguna abierta — alcance acotado a paridad de comportamiento.
