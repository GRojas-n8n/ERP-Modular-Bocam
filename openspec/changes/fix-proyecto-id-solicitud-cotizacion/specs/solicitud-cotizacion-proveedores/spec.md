## ADDED Requirements

### Requirement: El proyecto de la Solicitud de Cotización SHALL coincidir con el de la requisición
Al crear una Solicitud de Cotización a partir de una requisición, el sistema
SHALL usar el `proyecto_id` de esa requisición — nunca el proyecto activo de
la sesión del usuario que realiza la operación.

#### Scenario: Usuario de Compras con proyecto activo distinto al de la requisición
- **WHEN** un usuario con rol `procurement` (acceso a nivel tenant, con un
  proyecto activo en su sesión distinto al de la requisición) envía una
  Solicitud de Cotización para una requisición de otro proyecto
- **THEN** la `SolicitudCotizacion` creada tiene el `proyecto_id` de la
  requisición, no el del proyecto activo de la sesión

#### Scenario: Usuario de Compras sin proyecto activo válido en su sesión
- **WHEN** un usuario con rol `procurement` cuya sesión no tiene ningún
  proyecto activo válido (`proyecto_id` vacío en el token) envía una Solicitud
  de Cotización
- **THEN** la `SolicitudCotizacion` se crea igualmente, con el `proyecto_id`
  correcto tomado de la requisición — la operación no falla por un campo
  vacío en la sesión del usuario

#### Scenario: Requisición inexistente o de otro tenant
- **WHEN** se intenta crear una Solicitud de Cotización para un
  `requisicion_id` que no existe o pertenece a otro tenant
- **THEN** el sistema responde con el error de "no encontrado" existente,
  sin llegar a intentar crear ninguna `SolicitudCotizacion`
