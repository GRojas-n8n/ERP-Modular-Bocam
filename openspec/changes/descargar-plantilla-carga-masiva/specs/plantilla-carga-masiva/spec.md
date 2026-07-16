## ADDED Requirements

### Requirement: Cada pantalla de carga masiva SHALL ofrecer una plantilla descargable
Las pantallas de carga masiva de Proveedores (`ComprasView.tsx`), Empleados
(`PersonalView.tsx`) y Clientes (`VentasView.tsx`) SHALL mostrar un botón
"Descargar plantilla" junto al botón "Importar CSV/Excel" existente,
visible para los mismos usuarios que ya pueden ver el botón de importar
(mismo gate de rol).

#### Scenario: Usuario con permiso de importar ve el botón de plantilla
- **WHEN** un usuario con permiso para importar Proveedores, Empleados o
  Clientes abre la pestaña correspondiente
- **THEN** ve un botón "Descargar plantilla" junto al botón "Importar
  CSV/Excel"

#### Scenario: Usuario sin permiso de importar no ve ninguno de los dos botones
- **WHEN** un usuario sin permiso para importar esa entidad abre la
  pestaña correspondiente
- **THEN** no ve ni el botón "Importar CSV/Excel" ni el botón "Descargar
  plantilla"

### Requirement: La plantilla descargada SHALL contener exactamente las columnas que el importador reconoce
El archivo `.xlsx` generado por "Descargar plantilla" SHALL tener como fila
de encabezados los mismos campos (mismo conjunto, ni más ni menos) que la
función de parseo/preview de esa entidad (`construirPreviewImportProveedores`,
`construirPreviewImportEmpleados`, `construirPreviewImportClientes`) lee vía
`leerColumnaCsv`. La lista de columnas de la plantilla SHALL derivarse del
mismo arreglo de alias que usa el parser (no SHALL mantenerse como una
lista duplicada independiente).

#### Scenario: Plantilla de Proveedores
- **WHEN** el usuario descarga la plantilla desde la pestaña de Proveedores
- **THEN** el archivo tiene encabezados para: RFC, Razón Social, Email de
  contacto, Teléfono, Tipo de proveedor, Calificación de desempeño
- **AND** cada encabezado, al normalizarse igual que `leerColumnaCsv` lo
  hace al leer un archivo subido, coincide con alguno de los alias
  reconocidos por el importador (ningún encabezado usa caracteres como `/`
  que la normalización no separa en palabras y por lo tanto rompen el
  match — ver gotcha documentada en design.md)

#### Scenario: Plantilla de Empleados
- **WHEN** el usuario descarga la plantilla desde la pestaña de Empleados
- **THEN** el archivo tiene encabezados para: Nombre, Apellido paterno,
  Apellido materno, RFC, CURP, NSS, Puesto, Categoría, Tipo de contrato,
  Fecha de ingreso, Salario diario, Teléfono, Email

#### Scenario: Plantilla de Clientes
- **WHEN** el usuario descarga la plantilla desde la pestaña de Clientes
- **THEN** el archivo tiene encabezados para: RFC, Razón Social, Email de
  contacto, Teléfono, Código de cliente

### Requirement: La plantilla SHALL incluir una fila de ejemplo con datos válidos
Cada plantilla descargada SHALL incluir, además de la fila de encabezados,
al menos una fila de datos de ejemplo que pasaría la validación del
importador correspondiente (formato correcto por columna: RFC en
mayúsculas, campos numéricos como número, etc.).

#### Scenario: Fila de ejemplo en la plantilla de Proveedores
- **WHEN** el usuario abre la plantilla descargada de Proveedores
- **THEN** ve una fila de ejemplo con un RFC válido, una razón social, y
  (si aplica) una calificación de desempeño numérica entre 0.00 y 5.00

### Requirement: Descargar la plantilla SHALL usar el mismo formato de columnas reconocido por el importador
El botón "Descargar plantilla" SHALL generar el archivo íntegramente en el
navegador (sin llamada a backend) y SHALL producir un archivo `.xlsx`
válido, abrible en Excel/LibreOffice sin errores de codificación de
acentos.

#### Scenario: Descarga sin conexión a backend
- **WHEN** el usuario hace clic en "Descargar plantilla"
- **THEN** el archivo se genera y descarga sin ninguna llamada de red a la
  API
