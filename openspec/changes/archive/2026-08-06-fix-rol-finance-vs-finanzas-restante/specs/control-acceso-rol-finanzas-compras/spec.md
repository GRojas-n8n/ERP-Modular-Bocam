## ADDED Requirements

### Requirement: Los endpoints de consulta de OC y proveedores en compras SHALL reconocer el rol real 'finanzas'
Los endpoints `GET /api/v1/compras/ordenes-compra/:id`, `GET /api/v1/compras/ordenes-compra/:id/recepciones`, `GET /api/v1/compras/proveedores/:id/documentos`, `GET /api/v1/compras/proveedores/:id/documentos/:did/descargar` y `GET /api/v1/compras/proveedores/:id/calificaciones` SHALL permitir el acceso a usuarios cuyo `roles` incluya `'finanzas'` (español, el rol real asignado a los usuarios de Finanzas), no `'finance'` (inglés, un rol que no existe en el sistema).

#### Scenario: Usuario con rol finanzas consulta el detalle de una orden de compra
- **WHEN** un usuario cuyo `roles` incluye `'finanzas'` envía `GET /api/v1/compras/ordenes-compra/:id`
- **THEN** la respuesta no es 403 por motivo de rol

#### Scenario: Usuario con rol finanzas consulta recepciones de una orden de compra
- **WHEN** un usuario cuyo `roles` incluye `'finanzas'` envía `GET /api/v1/compras/ordenes-compra/:id/recepciones`
- **THEN** la respuesta no es 403 por motivo de rol

#### Scenario: Usuario con rol finanzas consulta documentos y calificaciones de un proveedor
- **WHEN** un usuario cuyo `roles` incluye `'finanzas'` envía `GET /api/v1/compras/proveedores/:id/documentos`, `GET /api/v1/compras/proveedores/:id/documentos/:did/descargar` o `GET /api/v1/compras/proveedores/:id/calificaciones`
- **THEN** ninguna de las respuestas es 403 por motivo de rol
