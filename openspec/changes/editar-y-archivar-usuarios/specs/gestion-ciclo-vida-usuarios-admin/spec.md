## ADDED Requirements

### Requirement: Editar email de un usuario existente
Un administrador SHALL poder cambiar el email de un usuario existente desde el modal de edición de Administración → Usuarios. El backend SHALL validar formato de email y SHALL rechazar el cambio si el nuevo email ya está en uso por otro usuario del mismo tenant.

#### Scenario: Admin cambia el email de un usuario
- **WHEN** un admin edita un usuario y envía un nuevo `email` con formato válido y no usado por otro usuario del tenant
- **THEN** el `PATCH /api/v1/auth/admin/users/:id` actualiza el email y la respuesta refleja el nuevo valor

#### Scenario: Nuevo email con formato inválido
- **WHEN** un admin envía un `email` que no tiene formato de correo válido (ej. "juan-arroba-empresa")
- **THEN** el `PATCH` responde con un error de validación y no modifica el usuario

#### Scenario: Nuevo email ya usado por otro usuario del mismo tenant
- **WHEN** un admin envía un `email` que ya pertenece a otro usuario activo o inactivo del mismo tenant
- **THEN** el `PATCH` responde `409` con un mensaje que indica que el email ya está en uso, y no modifica el usuario

#### Scenario: Editar un usuario sin cambiar el email
- **WHEN** un admin envía un `PATCH` sin el campo `email`
- **THEN** el email del usuario permanece sin cambios (comportamiento ya existente para el resto de campos opcionales)

### Requirement: Archivar un usuario desde la tabla
Un administrador SHALL poder archivar (desactivar) un usuario activo directamente desde la tabla de Administración → Usuarios, sin necesidad de abrir el modal de edición, y SHALL confirmar la acción antes de aplicarla.

#### Scenario: Admin archiva un usuario activo
- **WHEN** un admin hace clic en "Archivar" sobre un usuario con `activo: true` y confirma en el diálogo
- **THEN** el sistema envía `PATCH { activo: false }` y el usuario aparece en el listado marcado como "Inactivo"

#### Scenario: Admin cancela el archivado
- **WHEN** un admin hace clic en "Archivar" pero cancela el diálogo de confirmación
- **THEN** no se envía ninguna petición y el estado `activo` del usuario no cambia

#### Scenario: Usuario archivado no puede iniciar sesión
- **WHEN** un usuario con `activo: false` intenta iniciar sesión con sus credenciales correctas
- **THEN** el login lo rechaza (comportamiento ya existente en `apps/auth`, verificado como parte de este change)

### Requirement: Reactivar un usuario archivado
Un administrador SHALL poder reactivar un usuario previamente archivado directamente desde la tabla, sin necesidad de abrir el modal de edición.

#### Scenario: Admin reactiva un usuario archivado
- **WHEN** un admin hace clic en "Reactivar" sobre un usuario con `activo: false` y confirma en el diálogo
- **THEN** el sistema envía `PATCH { activo: true }` y el usuario deja de mostrarse como "Inactivo" y puede volver a iniciar sesión
