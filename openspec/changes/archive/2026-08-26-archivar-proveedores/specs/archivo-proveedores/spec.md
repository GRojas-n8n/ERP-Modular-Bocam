## ADDED Requirements

### Requirement: Archivar proveedor
El sistema SHALL permitir marcar un proveedor existente como `ARCHIVADO` mediante `POST /api/v1/compras/proveedores/:id/archivar`, restringido a roles `procurement` o `admin`. La operación SHALL ser reversible y NO SHALL alterar ni eliminar ninguna fila relacionada (`ordenes`, `comparativas`, `documentos`, `calificaciones`, `solicitudes_cotizacion`, `evaluaciones_especificacion`).

#### Scenario: Archivar un proveedor activo
- **WHEN** un usuario con rol `procurement` envía `POST /api/v1/compras/proveedores/:id/archivar` para un proveedor con `estatus = 'ACTIVO'`
- **THEN** el proveedor queda con `estatus = 'ARCHIVADO'` y la respuesta es 200 con el proveedor actualizado

#### Scenario: Archivar no borra histórico
- **WHEN** se archiva un proveedor que tiene órdenes de compra y comparativas ya existentes
- **THEN** esas órdenes y comparativas siguen existiendo sin cambios y siguen referenciando al proveedor por su `id_proveedor`

#### Scenario: Rol sin permiso no puede archivar
- **WHEN** un usuario sin rol `procurement` ni `admin` envía `POST /api/v1/compras/proveedores/:id/archivar`
- **THEN** el sistema responde 403 y el `estatus` del proveedor no cambia

#### Scenario: Proveedor inexistente
- **WHEN** se envía `POST /api/v1/compras/proveedores/:id/archivar` con un `id` que no existe en el tenant actual
- **THEN** el sistema responde 404 y no crea ni modifica ningún registro

### Requirement: Activar proveedor
El sistema SHALL permitir revertir el archivado de un proveedor mediante `POST /api/v1/compras/proveedores/:id/activar`, restringido a roles `procurement` o `admin`, devolviendo `estatus` a `'ACTIVO'`.

#### Scenario: Activar un proveedor archivado
- **WHEN** un usuario con rol `admin` envía `POST /api/v1/compras/proveedores/:id/activar` para un proveedor con `estatus = 'ARCHIVADO'`
- **THEN** el proveedor queda con `estatus = 'ACTIVO'` y la respuesta es 200 con el proveedor actualizado

#### Scenario: Activar un proveedor que no estaba archivado
- **WHEN** se envía `POST /api/v1/compras/proveedores/:id/activar` para un proveedor con `estatus = 'VETADO'` o `'PENDIENTE'`
- **THEN** el sistema responde 200 y el `estatus` queda en `'ACTIVO'` (la operación es idempotente respecto al objetivo final, sin importar el estatus previo)

### Requirement: Selectores excluyen proveedores archivados por default
El listado `GET /api/v1/compras/proveedores` SHALL excluir por default los proveedores con `estatus = 'ARCHIVADO'`. SHALL aceptar un parámetro de consulta `incluir_archivados=true` que, cuando está presente, incluye también los proveedores archivados en la respuesta.

#### Scenario: Selector de Solicitud de Cotización no ofrece archivados
- **WHEN** se llama `GET /api/v1/compras/proveedores` sin parámetros, y existe al menos un proveedor con `estatus = 'ARCHIVADO'`
- **THEN** ese proveedor no aparece en la lista devuelta

#### Scenario: Vista de administración puede ver y reactivar archivados
- **WHEN** se llama `GET /api/v1/compras/proveedores?incluir_archivados=true`
- **THEN** la respuesta incluye tanto los proveedores activos/vetados/pendientes como los archivados
