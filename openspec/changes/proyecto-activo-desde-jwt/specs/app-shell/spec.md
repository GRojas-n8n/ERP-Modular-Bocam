## MODIFIED Requirements

### Requirement: El proyecto activo de la pantalla SHALL coincidir con el del JWT
Al iniciar sesión y al recargar, el proyecto activo SHALL ser el `proyecto_id` del JWT cuando el usuario tiene acceso
a él. Si no lo tiene, SHALL ser el primero de su lista y el cliente SHALL alinear el JWT con `POST /auth/switch-project`.

#### Scenario: Recarga después de cambiar de proyecto
- **WHEN** el usuario eligió el segundo proyecto de su lista y recarga la página
- **THEN** la pantalla SHALL mostrar el segundo proyecto y NO SHALL llamar a `switch-project`

#### Scenario: El proyecto del JWT ya no está en su lista
- **WHEN** el JWT trae un proyecto al que el usuario ya no tiene acceso
- **THEN** la pantalla SHALL mostrar el primero de su lista y SHALL llamar a `switch-project` con ese proyecto
