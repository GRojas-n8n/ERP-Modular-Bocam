## MODIFIED Requirements

### Requirement: El sistema SHALL distinguir notas para proveedores de notas internas
Al crear una requisición, el Residente SHALL poder capturar dos campos de texto
independientes: notas destinadas a los proveedores (visibles en la Solicitud de
Cotización y potencialmente reenviadas) y notas internas exclusivas para Compras,
que el sistema SHALL nunca incluir en ningún correo o documento enviado a un
proveedor. El panel de Solicitud de Cotización SHALL mostrar siempre el valor
vigente de `Requisicion.observaciones` al momento de abrirse — nunca un valor
capturado en una carga anterior de la pantalla que no refleje ediciones
posteriores del Residente.

#### Scenario: Nota interna nunca llega al proveedor
- **WHEN** el Residente captura una nota interna al crear la requisición y Compras
  posteriormente envía la Solicitud de Cotización a uno o más proveedores
- **THEN** el correo enviado a los proveedores no contiene el texto de la nota
  interna en ninguna parte

#### Scenario: Notas editadas por el Residente después de crear la requisición
- **WHEN** el Residente edita `Requisicion.observaciones` después de crear la
  requisición, y Compras abre el panel de Solicitud de Cotización por primera
  vez o lo reabre después de ese cambio
- **THEN** el panel muestra el valor actualizado de las observaciones, no el
  que existía al momento de una carga anterior de la pantalla

## ADDED Requirements

### Requirement: Compras con permiso de aprobar e invitar SHALL poder hacerlo en una sola acción
Para usuarios con permiso simultáneo de aprobar requisiciones e invitar proveedores (`procurement`, `admin`), el sistema SHALL ofrecer una acción única que aprueba la requisición y, solo si la aprobación resulta en estado `APROBADA`, abre directamente el panel de invitación a cotizar pre-cargado con los datos de esa requisición. Si la aprobación no resulta en `APROBADA` (por ejemplo, queda en `PENDIENTE_TRANSFERENCIA` por un gate presupuestal), el sistema SHALL mostrar el mensaje correspondiente sin abrir el panel de invitación.

#### Scenario: Aprobación exitosa abre invitación directamente
- **WHEN** un usuario `procurement` con requisición en estado `PENDIENTE`
  (o `BORRADOR`) usa la acción combinada
- **THEN** el sistema aprueba la requisición y, tras confirmar
  `estado === 'APROBADA'`, abre el panel de invitación a cotizar sin
  navegación adicional

#### Scenario: Aprobación bloqueada por gate presupuestal
- **WHEN** la aprobación de la requisición resulta en `PENDIENTE_TRANSFERENCIA`
  porque la partida está bloqueada
- **THEN** el sistema muestra el mensaje de bloqueo existente y no abre el
  panel de invitación a cotizar

#### Scenario: Usuario sin permiso de aprobar
- **WHEN** un usuario sin permiso de aprobar requisiciones (por ejemplo, un
  Residente) visualiza la requisición
- **THEN** el sistema no le ofrece la acción combinada; ve únicamente las
  acciones para las que tiene permiso, igual que hoy
