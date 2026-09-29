## ADDED Requirements

### Requirement: Ventas SHALL tratar los Clientes como catálogo por tenant, sin exigir proyecto activo
`GET /api/v1/ventas/clientes`, `POST /api/v1/ventas/clientes` y `PUT /api/v1/ventas/clientes/:id` SHALL responder sin exigir proyecto activo ni acceso a un proyecto, para los roles `admin`, `gerencia_tecnica` y `control_proyectos`. El resto de rutas de Ventas (cotizaciones, facturas) SHALL seguir exigiéndolo.

#### Scenario: Listar clientes sin proyecto activo
- **WHEN** un usuario `gerencia_tecnica` sin proyecto activo hace `GET /api/v1/ventas/clientes`
- **THEN** la respuesta SHALL ser `200` con los clientes de su tenant

#### Scenario: Crear un cliente sin proyecto activo
- **WHEN** un usuario `admin` sin proyecto activo hace `POST /api/v1/ventas/clientes` con `rfc_tax_id` y `razon_social`
- **THEN** la respuesta SHALL ser `201` y el `rfc_tax_id` SHALL guardarse con `trim().toUpperCase()`

#### Scenario: Cotizaciones sigue exigiendo proyecto
- **WHEN** un usuario sin proyecto activo hace `GET /api/v1/ventas/cotizaciones`
- **THEN** la respuesta SHALL ser `403` (`AUTH_PROJECT_REQUIRED`)

### Requirement: El alta de cliente SHALL validar longitudes y duplicados con mensajes claros
`POST /api/v1/ventas/clientes` SHALL responder `400` si `rfc_tax_id`/`razon_social` faltan, están vacíos o exceden su límite (`rfc_tax_id` ≤ 20, `razon_social` ≤ 255, `email_contacto` ≤ 100, `telefono` ≤ 20), `409` si el RFC o el `codigo_cliente` ya existen en el tenant, y ante un error inesperado `500` con mensaje genérico, sin el texto crudo de Prisma.

#### Scenario: RFC duplicado
- **WHEN** se crea un cliente con un RFC que ya existe en el tenant
- **THEN** la respuesta SHALL ser `409` con un mensaje que lo indique

### Requirement: Un admin SHALL poder editar los datos guardados de un cliente, incluido el RFC
`PUT /api/v1/ventas/clientes/:id` SHALL permitir solo al rol `admin` modificar `rfc_tax_id`, `razon_social`, `email_contacto`, `telefono`, `codigo_cliente` y `estatus`, con las mismas validaciones del alta.

#### Scenario: Reemplazar un RFC provisional por el real
- **WHEN** un `admin` hace `PUT` con un nuevo `rfc_tax_id`
- **THEN** la respuesta SHALL ser `200` y el RFC SHALL quedar normalizado

#### Scenario: RFC nuevo ya usado por otro cliente
- **WHEN** el `PUT` usa un RFC que pertenece a otro cliente del tenant
- **THEN** la respuesta SHALL ser `409`

#### Scenario: RFC vacío o cliente inexistente
- **WHEN** el `PUT` envía `rfc_tax_id` vacío, o el id no existe
- **THEN** la respuesta SHALL ser `400`, o `404` respectivamente

#### Scenario: Rol no admin
- **WHEN** un usuario sin rol `admin` hace `PUT /api/v1/ventas/clientes/:id`
- **THEN** la respuesta SHALL ser `403`

### Requirement: La vista Ventas SHALL mostrar Clientes sin proyecto activo y permitir editarlos
`VentasView` SHALL renderizar la pestaña Clientes aunque no haya proyecto activo; las pestañas Cotizaciones y Facturas SHALL mostrar un aviso que pide seleccionar un proyecto. Un `admin` SHALL ver un botón "Editar" por cliente que abre un formulario con RFC, razón social, email, teléfono y código.

#### Scenario: Sin proyecto activo
- **WHEN** un usuario abre Ventas sin proyecto seleccionado
- **THEN** ve la lista de clientes, y al cambiar a Cotizaciones ve el aviso de proyecto requerido

### Requirement: El formulario de Centro de Costos SHALL mostrar los errores de carga y de alta de clientes
Cuando falle `GET /clientes` o el alta desde "+ Agregar Cliente", la UI SHALL mostrar el mensaje devuelto por el servidor (`message` o `error.message`) en lugar de un mensaje genérico o ninguno.

#### Scenario: Falla la carga de clientes
- **WHEN** `GET /clientes` responde con error
- **THEN** el formulario muestra el mensaje del servidor
