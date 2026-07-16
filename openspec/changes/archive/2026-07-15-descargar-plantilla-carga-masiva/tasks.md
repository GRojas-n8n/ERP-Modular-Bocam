## 1. Helper compartido de generación de plantilla

- [x] 1.1 `apps/app-shell/src/lib/csvImport.ts`: agregado
      `descargarPlantillaXlsx(nombreArchivo, columnas)` usando
      `XLSX.utils.aoa_to_sheet` (fila de encabezados + fila de ejemplo) +
      `XLSX.writeFile`. Reutiliza la dependencia `xlsx` ya presente en el
      archivo — sin librería nueva.

## 2. Botón "Descargar plantilla" — Proveedores

- [x] 2.1 `apps/app-shell/src/views/ComprasView.tsx`: agregado botón
      `<button>` nativo "Descargar plantilla" junto al de "Importar
      CSV/Excel" (dentro de `puedeImportarProveedores &&`), con columnas:
      RFC, Razón Social, Email de contacto, Teléfono, Tipo de proveedor,
      Calificación de desempeño — mismos alias que
      `construirPreviewImportProveedores`.
- [x] 2.2 Fila de ejemplo con datos válidos (RFC ficticio en mayúsculas,
      razón social de ejemplo, tipo NACIONAL, calificación 4.50).

## 3. Botón "Descargar plantilla" — Empleados

- [x] 3.1 `apps/app-shell/src/views/PersonalView.tsx`: agregado botón
      `<button>` nativo "Descargar plantilla" junto al de "Importar
      CSV/Excel" (dentro de `puedeImportarEmpleados &&`), con columnas:
      Nombre, Apellido paterno, Apellido materno, RFC, CURP, NSS, Puesto,
      Categoría, Tipo de contrato, Fecha de ingreso, Salario diario,
      Teléfono, Email — mismos alias que `construirPreviewImportEmpleados`.
- [x] 3.2 Fila de ejemplo con datos válidos (salario_diario numérico, RFC
      de ejemplo, fecha en formato ISO).

## 4. Botón "Descargar plantilla" — Clientes

- [x] 4.1 `apps/app-shell/src/views/VentasView.tsx`: agregado botón
      `<button>` nativo "Descargar plantilla" junto al de "Importar
      CSV/Excel" (dentro de `tab === 'clientes' && esAdmin &&`), con
      columnas: RFC, Razón Social, Email de contacto, Teléfono, Código de
      cliente — mismos alias que `construirPreviewImportClientes`.
- [x] 4.2 Fila de ejemplo con datos válidos (código de cliente "001",
      3 dígitos, cumple `CODIGO_CLIENTE_PATTERN`).

## 5. Verificación

- [x] 5.1 `npm run build` (`tsc -b && vite build`) en `apps/app-shell`
      limpio (2172 módulos, sin errores) tanto antes como después del fix
      de la sección 6.
- [x] 5.2 Confirmado por inspección: los 3 botones nuevos usan `<button>`
      nativo, no `<Button>` de `@bocam/ui-core` — no heredan el bug de
      cascada CSS documentado en `fix-visibilidad-botones-guardar-subir-pdf`.
- [x] 5.3 Round-trip real con el paquete `xlsx` (Node, mismo motor que usa
      el navegador): se generó el `.xlsx` de Proveedores, se releyó, y los
      encabezados con acentos (Razón Social, Teléfono, Calificación de
      desempeño) sobrevivieron intactos — sin problemas de codificación.
- [x] 5.4 Confirmado con un script Node que reproduce
      `normalizarEncabezado` exactamente: los 24 encabezados usados en las
      3 plantillas (6 Proveedores + 13 Empleados + 5 Clientes) normalizan
      exactamente a uno de los alias que cada `construirPreviewImport*`
      reconoce — ni una columna de más ni de menos, ninguna desalineada.

## 6. Bug encontrado y corregido durante 5.4

- [x] 6.1 El encabezado original "RFC / Tax ID" (usado en Proveedores y
      Clientes) **no** era reconocido por el importador:
      `normalizarEncabezado` solo separa palabras por espacio/guion/guion_bajo,
      no por `/`, así que "RFC / Tax ID" normalizaba a `rfc_/_tax_id` en
      vez de `rfc_tax_id` o `rfc` — un usuario que llenara la plantilla tal
      cual y la subiera habría recibido "sin rfc_tax_id" pese a haber
      llenado el campo correctamente. Corregido a simplemente "RFC" en
      ambos archivos; reverificado con 5.4 que ahora sí matchea. Anotado
      en design.md como gotcha para futuras plantillas.

## 7. Cierre

- [x] 7.1 PR contra `main`, CI verde, merge.
      → PR #70 mergeado (squash `ceefd85`).
- [x] 7.2 Redeploy VPS de `app-shell` (build + `up -d`).
      → Hecho 2026-07-15: build limpio, contenedor recreado, healthy, smoke
      `https://iretum.com/` → HTTP 200.
