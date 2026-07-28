## Context

`apps/app-shell/src/lib/csvImport.ts` hoy:

- `parseCsvTexto` (CSV): usa `Papa.parse(texto, { header: true, complete: (resultado) =>
  resolve(...) })` — modo batch, el callback `complete` solo se dispara cuando `Papa.parse`
  terminó de procesar el string completo.
- `parseCsvOrExcelFile` (XLSX): `wb.xlsx.load(buffer)` — carga el workbook completo en
  memoria de una sola llamada; no hay callback de progreso.

Las 3 vistas de carga masiva llaman `await parseCsvOrExcelFile(file)` y después
`construirPreviewImport*(rows)` — ambos son pasos síncronos/opacos desde la perspectiva de
React: `setFilasImport(...)` se llama una sola vez, con el arreglo completo ya validado.

**Asimetría real entre CSV y XLSX:** `Papa.parse` soporta un modo streaming genuino vía la
opción `step` (se invoca una vez por fila, según se parsea el string) sin cambios de
arquitectura. `exceljs`, en cambio, solo ofrece streaming real (`ExcelJS.stream.xlsx.
WorkbookReader`) sobre un stream tipo Node (`fs.ReadStream` o similar) — no sobre un
`ArrayBuffer` de navegador, que es lo que `FileReader.readAsArrayBuffer` entrega aquí. Adaptar
un `ArrayBuffer` a un stream Node-compatible en el navegador requiere un shim adicional
(`readable-stream` u otra librería), fuera de proporción para el problema real que se quiere
resolver.

## Goals / Non-Goals

**Goals:**
- El usuario ve cada fila y su error específico conforme se procesa, no solo al final —
  tanto para CSV (streaming real vía `step`) como para XLSX (streaming de la fase de
  *validación*, ya que la fase de *lectura* del buffer no se puede streamear aquí).
- El panel de importación muestra progreso (filas procesadas / total, errores encontrados
  hasta el momento) mientras el archivo se procesa.
- El resultado final (filas, errores, formato) es idéntico al actual — el cambio es de
  percepción/UX, no de qué se considera válido.

**Non-Goals:**
- No se implementa streaming real de lectura de `.xlsx` en el navegador — se documenta como
  limitación conocida (ver Risks). Si en el futuro se vuelve un problema real de rendimiento
  (archivos de decenas de miles de filas), sería un change aparte que evalúe un shim de
  stream o mover el parseo XLSX a un Web Worker.
- No se cambia `InsumosView.tsx` (presupuestos OPUS, formato posicional) — su flujo no es de
  "fila con error de validación", es de columnas fijas por posición; fuera de alcance.
- No se cambia el emparejamiento de columnas (`leerColumnaCsv`) ni las reglas de validación
  por campo (RFC duplicado, campos obligatorios, etc.) — solo cuándo se muestran.

## Decisions

**D1 — CSV: reemplazar `Papa.parse({ complete })` por `Papa.parse({ step })`, con un
callback `onFila` opcional en `parseCsvOrExcelFile`.**
`step` ya resuelve fila por fila de forma nativa en Papa Parse — no hay razón para forzar un
modo batch cuando la librería subyacente ya soporta streaming. Alternativa descartada:
mantener `complete` y solo "fingir" progreso con una barra basada en tiempo estimado — se
rechaza porque no refleja progreso real y puede terminar antes o después de lo que la barra
sugiere.

**D2 — XLSX: mantener `wb.xlsx.load(buffer)`, pero exponer la iteración de filas
(`hojaAObjetos`) como generador/callback en vez de devolver el arreglo completo de una vez.**
Aunque la *lectura* del buffer no se puede streamear sin un shim, la construcción del arreglo
de objetos (`hojaAObjetos`, ya un loop simple fila por fila sobre `ws.getRow(r)`) sí puede
ceder el control cada N filas (`await` sobre un `setTimeout(resolve, 0)`) para que React
pinte el progreso entre lotes. Esto no acelera la lectura del archivo, pero sí permite que la
fase de *validación* (`construirPreviewImport*`, que ya opera fila por fila) se muestre
progresivamente inmediatamente después de que cada lote de filas del XLSX está disponible —
que es donde el usuario realmente nota el error (fila 400 con un typo), no en la lectura cruda
del buffer.
Alternativa descartada: mover el parseo de XLSX a un Web Worker para paralelizar — se
rechaza por ahora porque agrega infraestructura (worker, serialización de mensajes) para un
problema que el procesamiento por lotes en el hilo principal ya resuelve para los tamaños de
archivo reales de este proyecto (cientos de filas, no decenas de miles).

**D3 — El tamaño de lote para XLSX y la cadencia de actualización de estado en CSV se deciden
en implementación (ej. lotes de 25-50 filas, o cada fila si el rendimiento lo permite), no se
fija aquí un número exacto.**
El objetivo es "se ve progreso visible sin trabar la UI" — el número óptimo depende de
pruebas con archivos reales del proyecto durante tasks.md, no de una decisión a priori.

**D4 — El estado de progreso vive en cada vista (`VentasView`/`ComprasView`/`PersonalView`),
no en un hook compartido nuevo.**
Las 3 vistas ya duplican el patrón `construirPreviewImport*` + `filasImport` + panel de
importación de forma independiente (sin una abstracción compartida hoy). Introducir un hook
compartido en este change mezclaría "agregar feedback en vivo" con "refactorizar 3 vistas a
una abstracción común" — dos cambios distintos. Si la duplicación molesta después, es una
refactorización aparte sin bug ni requisito nuevo que la motive.

**D5 — Hallazgo durante la implementación: `Papa.parse(string, {step})` NO cede el control
al event loop — hay que pasarle el `File` directamente, no un string ya leído.**
El diseño original (D1) asumía que `step` de Papa Parse ya era "streaming real" porque se
invoca por fila. Verificado en vivo con Playwright: pasar un **string** ya materializado en
memoria (`Papa.parse(texto, {step: ...})`, que es lo que hacía el código original vía
`leerArchivoComoTexto`) corre el callback `step` de un tirón, sin ceder el control al
navegador entre filas — un archivo de 5,000 filas terminaba de "procesarse" en ~30ms sin
ningún frame de progreso visible, exactamente el mismo problema que se quería resolver. La
razón: Papa Parse solo cede el control al event loop cuando el *input* es un `File`/`Blob`
(lee en chunks reales vía `FileReader`) — con un string ya no hay nada que "leer" en
chunks. Fix: `parseCsvArchivo` ahora recibe el `File` directamente (se eliminó el paso
intermedio `leerArchivoComoTexto` para esta ruta) y se agregó `chunkSize: 64 * 1024`
explícito — sin esto, un archivo pequeño/mediano (la mayoría de los casos reales de este
proyecto) cabe en un solo chunk por defecto y el problema se repite. Verificado en vivo tras
el fix: un CSV de 5,000 filas mostró "Procesando fila 4000… 1 error encontrado hasta el
momento" con "3999 listos" a los 30ms de iniciado, confirmando streaming real.

**D6 — Hallazgo durante la implementación: actualizar el estado de React en cada fila
individual puede colgar la pestaña con archivos grandes — se throttlea a cada 25 filas.**
Verificado en vivo: con un CSV de 80,000 filas actualizando `setFilasImport` en cada fila,
Playwright no pudo ni tomar una captura de pantalla (timeout de 30s) — la pestaña dejó de
responder. Causa: cada actualización de estado re-renderiza una tabla que crece sin
virtualización, y con miles de actualizaciones sucesivas el costo de reconciliación se
acumula. Fix: las 3 vistas ahora solo llaman `setFilasImport(...)` cada 25 filas (más una
vez al final), no en cada una — implementado inline en cada vista con un contador simple
(`contador % 25 === 0`), no como abstracción compartida (ver D4). Verificado en vivo que un
archivo de 5,000 filas ya no cuelga la pestaña y sigue mostrando progreso visible.

**Hallazgo de rendimiento (no bloqueante): XLSX es notablemente más lento que CSV para
archivos de miles de filas.** Verificado en vivo: un `.xlsx` de 3,000 filas tardó ~25-30
segundos en procesarse completo (vs. ~1 segundo para un CSV de 5,000 filas), debido al costo
de `exceljs` leyendo celda por celda (`ws.getRow(r).getCell(c).value`) más el overhead de
`setTimeout(0)` cada 25 filas (que los navegadores limitan a ~4ms mínimo tras varias
llamadas anidadas). El resultado final siempre fue correcto (conteos y filas con error
consistentes). Dado que los archivos reales de este proyecto son de cientos de filas (ver
Non-Goals), esto no bloquea el caso de uso real, pero queda documentado como limitación
conocida — si en el futuro se importan `.xlsx` de miles de filas regularmente, valdría la
pena revisar el tamaño de lote o un motor de lectura distinto para XLSX.

## Risks / Trade-offs

- [XLSX no tiene streaming real de lectura — para un archivo XLSX extremadamente grande, el
  usuario seguirá sin ver nada durante la fase de `wb.xlsx.load(buffer)` en sí, solo durante
  la validación posterior] → Mitigación: es una limitación conocida y documentada, no un bug
  oculto; los archivos reales de este proyecto son de cientos de filas, donde `load(buffer)`
  toma milisegundos — el problema real (feedback solo al final) se resuelve igual porque la
  fase de validación, que es la que tarda perceptiblemente con archivos grandes, sí se vuelve
  progresiva.
- [Actualizar el estado de React por cada fila individual en CSV podría causar demasiados
  re-renders en archivos grandes] → Mitigación: agrupar actualizaciones de estado en lotes
  pequeños (acumular N filas del callback `step`/`onFila` antes de llamar `setFilasImport`),
  no necesariamente 1 fila = 1 render; decidir la cadencia exacta en tasks.md con pruebas
  reales.
- [Cambiar de `complete` a `step` en Papa Parse cambia el flujo de manejo de errores de
  parseo (errores de sintaxis CSV)] → Mitigación: `step` recibe `results.errors` por fila
  igual que `complete` los recibe agregados — revisar en tasks.md que un CSV malformado
  sigue reportando error de forma clara, con test de regresión antes de mergear.

## Migration Plan

Sin migración de datos, cambio puramente de frontend. Ciclo normal: PR contra `main` → `tsc
-b` sobre `app-shell` → verificación manual con archivos reales de prueba (incluyendo uno con
un error deliberado en una fila avanzada, ej. fila 50 de 100) en las 3 vistas → deploy VPS del
contenedor de `app-shell`. Rollback: revertir el PR.

## Open Questions

- ¿Vale la pena, en una iteración futura, invertir en un shim de stream para XLSX si algún
  módulo empieza a importar archivos de miles de filas regularmente? No se resuelve en este
  change — se deja como nota para revisar si el patrón de uso real lo justifica.
