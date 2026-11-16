## ADDED Requirements

### Requirement: Un usuario procurement/admin SHALL poder editar los datos guardados de un proveedor, incluido el RFC
`PUT /api/v1/compras/proveedores/:id` SHALL aceptar `rfc_tax_id` además de los campos ya editables, normalizándolo con `trim().toUpperCase()`. SHALL responder `400` si `rfc_tax_id` o `razon_social` se envían vacíos, y `409` si el RFC ya pertenece a otro proveedor del tenant (incluidos archivados).

#### Scenario: Corregir el RFC de un proveedor
- **WHEN** un usuario `procurement` hace `PUT` con un `rfc_tax_id` nuevo
- **THEN** la respuesta SHALL ser `200` con el RFC normalizado

#### Scenario: RFC duplicado
- **WHEN** el nuevo RFC pertenece a otro proveedor del tenant
- **THEN** la respuesta SHALL ser `409` con un mensaje que indica que puede estar archivado

#### Scenario: Campos vacíos
- **WHEN** el `PUT` envía `rfc_tax_id` o `razon_social` vacíos
- **THEN** la respuesta SHALL ser `400` y el registro NO SHALL modificarse

### Requirement: La UI de proveedores SHALL ofrecer alta y edición solo a roles que la API permite
`ComprasView` SHALL mostrar "Nuevo Proveedor", "Editar" y demás acciones de catálogo únicamente a `procurement` y `admin`; el campo RFC SHALL ser editable al editar; los errores del servidor SHALL mostrarse con su mensaje (`message` o `error.message`).

#### Scenario: Usuario superintendent
- **WHEN** un `superintendent` abre la pestaña Proveedores
- **THEN** ve el catálogo en solo lectura, sin botones de alta ni edición
