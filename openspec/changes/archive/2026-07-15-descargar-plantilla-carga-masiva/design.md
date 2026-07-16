## Context

Cada pantalla de carga masiva ya tiene su propia función
`construirPreviewImport*` que lee columnas vía `leerColumnaCsv(row, ...alias)`
(definido en `apps/app-shell/src/lib/csvImport.ts`). Esa lista de alias por
columna es, hoy, la única fuente de verdad de qué encabezados acepta cada
importador — no hay documentación exportable ni un lugar único donde viva
"la estructura" fuera del código.

`csvImport.ts` ya depende de `xlsx` (SheetJS) para **leer** CSV/Excel;
SheetJS también sabe **escribir** (`XLSX.utils.aoa_to_sheet` +
`XLSX.writeFile`), así que no hace falta ninguna librería nueva para generar
la plantilla.

## Goals / Non-Goals

**Goals:**
- Que el usuario pueda descargar, con un clic, un `.xlsx` con los
  encabezados exactos que el importador de Proveedores/Empleados/Clientes
  va a reconocer, más una fila de ejemplo válida.
- Una sola función compartida que genera el archivo, para que la lista de
  columnas de la plantilla nunca pueda desincronizarse del parser real
  (si mañana se agrega una columna al importador, se agrega en un solo
  lugar de la vista, no en dos).

**Non-Goals:**
- No se valida ni se sube nada — es solo generación/descarga de un archivo
  de referencia.
- No se centraliza el botón "Importar CSV/Excel" existente ni se toca su
  lógica de parseo/validación.
- No se agrega plantilla para `carga-masiva-archivos` (fichas técnicas) —
  ese es un import de PDFs/documentos, no de datos tabulares con columnas.

## Decisions

- **Formato `.xlsx`, no `.csv`.** Los usuarios de estas pantallas son de
  negocio (RRHH, Compras, Ventas) y van a abrir/editar la plantilla en
  Excel de todas formas; `.xlsx` evita problemas de codificación de
  acentos/ñ que sí pueden aparecer con `.csv` abierto directo en Excel sin
  BOM. El importador ya acepta `.xlsx` (y `.csv`), así que no se pierde
  compatibilidad.
- **Encabezados en español legible** (ej. "RFC / Tax ID", "Razón Social"),
  no el nombre snake_case interno (`rfc_tax_id`). `leerColumnaCsv` ya
  normaliza acentos/mayúsculas/conectores, así que un encabezado en
  español natural es reconocido igual que la forma técnica — y es más
  claro para quien llena el archivo a mano.
- **Una fila de ejemplo con datos válidos**, no solo encabezados vacíos, para
  que quede claro el formato esperado por columna (ej. RFC en mayúsculas,
  `calificacion_desempeno` como `4.50` no `4,50`).
- **Helper único y genérico en `csvImport.ts`**: `descargarPlantillaXlsx(
  nombreArchivo, columnas: { header: string; ejemplo?: string }[])`. Cada
  vista arma su propio arreglo de `columnas` a partir de los mismos alias
  que ya usa en su `construirPreviewImport*`, así que agregar/quitar una
  columna del importador real y olvidarse de actualizar la plantilla queda
  visible en el mismo diff (viven en el mismo archivo, líneas cercanas).
- **Botón con estilo neutro (`<button>` nativo, no el componente `Button`
  de `@bocam/ui-core`)**, igual que el patrón ya usado en
  `VentasView.tsx`/`AdminView.tsx`/`CalidadView.tsx`. Se descubrió en un
  change anterior (`fix-visibilidad-botones-guardar-subir-pdf`) que
  `<Button className="bg-...">` sin `variant` pierde su color contra
  `bg-primary` por un problema de orden de cascada en `cn()` (join de
  strings, no tailwind-merge) — usar `<button>` nativo evita heredar ese
  bug en un botón nuevo.

## Gotcha descubierta durante la implementación

`normalizarEncabezado` (en `csvImport.ts`) separa palabras solo por
espacio/guion/guion_bajo (`/[\s_-]+/`) — **no** trata `/` como separador.
Un encabezado como "RFC / Tax ID" normaliza a `rfc_/_tax_id`, que no
coincide con ningún alias reconocido (`rfc_tax_id`, `rfc`). Se verificó con
un script Node reproduciendo la función real que los 24 encabezados usados
en las 3 plantillas (Proveedores, Empleados, Clientes) normalizan
exactamente al alias esperado — evitar `/` u otros caracteres fuera de
letras/espacios/guiones en cualquier encabezado de plantilla futuro.

## Risks / Trade-offs

- [Riesgo] Si el backend cambia una regla de validación (ej. un nuevo
  formato de RFC) sin que alguien actualice la fila de ejemplo de la
  plantilla, el ejemplo podría quedar desactualizado → Mitigación: la lista
  de *columnas* no puede desincronizarse (se deriva del mismo array de
  alias que usa el parser), solo el *valor de ejemplo* es texto libre
  mantenido a mano — riesgo acotado y de bajo impacto (el ejemplo ilustra,
  no valida).
- [Riesgo] Generar `.xlsx` en el navegador con SheetJS agrega algunos KB al
  bundle si `xlsx` no estaba en el chunk de estas vistas → Mitigación:
  `xlsx` ya es dependencia cargada por `csvImport.ts` para el import
  existente, que estas mismas vistas ya importan — no hay costo adicional
  real de bundle.

## Migration Plan

Sin migración de datos ni de backend. Cambio de frontend puro. Se construye
`apps/app-shell`, se verifica que el archivo descargado abre correctamente
en Excel/LibreOffice con los encabezados y el ejemplo esperados, y se
despliega junto con el resto del build de `app-shell`.
