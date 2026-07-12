# solicitud-cotizacion-proveedores Specification

## Purpose

Cubre el ciclo de Solicitud de Cotización a proveedores: qué ve Compras antes
de aprobar o cotizar una requisición, cómo se identifica al solicitante, la
separación entre notas para proveedores y notas internas, el envío de correo
a los proveedores invitados (con tema claro/oscuro), la captura de dirección
de entrega, la posibilidad de modificar proveedores invitados después del
envío inicial, y que el nombre real del proveedor (no un placeholder) se
muestre siempre.
## Requirements
### Requirement: Compras SHALL ver el detalle completo de items antes de aprobar o cotizar
Toda tarjeta de requisición visible para Compras (y para el Residente que la creó) SHALL incluir una sección expandible con cada item: insumo o descripción libre, cantidad, unidad, especificación de marca/modelo, detalle técnico y notas.

#### Scenario: Compras revisa una requisición con varios items
- **WHEN** Compras abre la lista de requisiciones y hace clic en "Ver N ítems" de
  una tarjeta
- **THEN** el sistema muestra cada item con su insumo resuelto (clave + descripción
  del catálogo), cantidad, unidad y especificaciones técnicas capturadas por el
  Residente

### Requirement: El sistema SHALL mostrar el nombre del solicitante, no su identificador
Toda tarjeta de requisición SHALL mostrar el nombre del Residente que la creó,
tomado de un snapshot capturado al momento de crear la requisición — nunca el UUID
crudo del usuario.

#### Scenario: Requisición creada por un Residente
- **WHEN** un Residente crea una requisición
- **THEN** el sistema guarda su nombre (del JWT vigente) junto con la requisición,
  y toda vista que la liste muestra ese nombre en vez del `solicitante_id`

### Requirement: El sistema SHALL distinguir notas para proveedores de notas internas
Al crear una requisición, el Residente SHALL poder capturar dos campos de texto
independientes: notas destinadas a los proveedores (visibles en la Solicitud de
Cotización y potencialmente reenviadas) y notas internas exclusivas para Compras,
que el sistema SHALL nunca incluir en ningún correo o documento enviado a un
proveedor.

#### Scenario: Nota interna nunca llega al proveedor
- **WHEN** el Residente captura una nota interna al crear la requisición y Compras
  posteriormente envía la Solicitud de Cotización a uno o más proveedores
- **THEN** el correo enviado a los proveedores no contiene el texto de la nota
  interna en ninguna parte

### Requirement: El sistema SHALL enviar un correo real a cada proveedor invitado
Al crear o actualizar una Solicitud de Cotización con proveedores seleccionados, el sistema SHALL enviar un correo electrónico a cada proveedor que tenga un `email_contacto` registrado, con: folio de la requisición, prioridad, plazo de respuesta, cada item con sus especificaciones, y las notas para proveedores. El envío SHALL ser best-effort — un fallo de correo no SHALL revertir la Solicitud de Cotización ya creada en base de datos.

#### Scenario: Proveedor con correo registrado
- **WHEN** Compras crea una Solicitud de Cotización seleccionando un proveedor con
  `email_contacto` válido
- **THEN** el sistema envía un correo HTML a ese proveedor y la respuesta del
  endpoint reporta el envío como exitoso

#### Scenario: Proveedor sin correo registrado
- **WHEN** Compras selecciona un proveedor sin `email_contacto` en su ficha
- **THEN** el sistema no intenta enviar correo a ese proveedor y reporta en la
  respuesta que quedó "sin correo registrado", sin fallar la operación completa

#### Scenario: SMTP no disponible
- **WHEN** el servidor SMTP configurado rechaza la conexión o las credenciales
- **THEN** la Solicitud de Cotización queda creada igualmente en base de datos, y el
  sistema reporta el error de envío por proveedor sin perder los datos ya
  registrados

### Requirement: El correo de Solicitud de Cotización SHALL ofrecer tema claro y tema oscuro
Compras SHALL poder elegir, al momento de enviar, entre una plantilla de tema claro
y una de tema oscuro industrial. Ambas SHALL incluir el logo de iretum y el logo de
Constructora Bocam en el encabezado.

#### Scenario: Envío con tema oscuro
- **WHEN** Compras selecciona "Oscuro" antes de enviar la Solicitud de Cotización
- **THEN** el correo recibido usa fondo oscuro industrial, incluye el aviso de
  "formato PDF obligatorio", y lista las partidas con columnas Partida /
  Descripción-Especificación / Cantidad / Unidad / Marca-Modelo

### Requirement: El Residente SHALL poder capturar una dirección de entrega
El formulario de Nueva Requisición SHALL incluir un campo opcional de dirección de
entrega. Si se captura, el sistema SHALL incluirlo en el correo de Solicitud de
Cotización enviado a los proveedores.

#### Scenario: Requisición con dirección de entrega capturada
- **WHEN** el Residente captura una dirección de entrega al crear la requisición
- **THEN** el correo de Solicitud de Cotización enviado a los proveedores incluye
  esa dirección en una sección claramente etiquetada

### Requirement: Compras SHALL poder modificar los proveedores invitados de una solicitud ya enviada
Una vez creada una Solicitud de Cotización, Compras SHALL poder reabrir la
selección de proveedores para agregar nuevos o quitar los que no han respondido,
sin perder el estado de los proveedores que ya respondieron. El PDF de cotización
de un proveedor ya NO se gestiona desde esta pantalla — se sube y persiste
exclusivamente desde el cuadro comparativo (ver capability `cotizacion-compras-ux`).

#### Scenario: Ningún proveedor cotiza — se invita a otros
- **WHEN** Compras reabre la selección de proveedores de una solicitud existente,
  desmarca proveedores en estado `PENDIENTE` y selecciona proveedores adicionales
- **THEN** el sistema quita a los proveedores desmarcados, agrega a los nuevos, y
  envía correo únicamente a los proveedores agregados — sin reenviar a quien ya
  había sido invitado

#### Scenario: Proveedor ya respondió — no se puede quitar por accidente
- **WHEN** Compras intenta desmarcar en la interfaz a un proveedor cuyo estado es
  `RESPONDIO`
- **THEN** el sistema no permite deseleccionarlo (queda bloqueado/inerte en el
  checklist) para evitar perder su cotización ya recibida

### Requirement: El sistema SHALL mostrar el nombre real del proveedor invitado
Toda vista que liste los proveedores de una Solicitud de Cotización SHALL mostrar
su razón social real, resuelta mediante una relación de datos válida — nunca un
valor de reemplazo genérico cuando el proveedor existe en el catálogo.

#### Scenario: Consultar el estado de una solicitud con proveedores invitados
- **WHEN** Compras abre una Solicitud de Cotización ya creada
- **THEN** cada proveedor listado muestra su razón social correcta, obtenida del
  catálogo de proveedores del tenant

### Requirement: El proyecto de la Solicitud de Cotización SHALL coincidir con el de la requisición
Al crear una Solicitud de Cotización a partir de una requisición, el sistema SHALL usar el `proyecto_id` de esa requisición — nunca el proyecto activo de la sesión del usuario que realiza la operación.

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

### Requirement: El panel de Solicitud de Cotización SHALL NOT ofrecer subida de PDF
El panel "Solicitud de Cotización" SHALL permitir marcar `estado` (`RESPONDIO`, `DECLINO`, `PENDIENTE`) y capturar `notas_proveedor` de un proveedor invitado, pero SHALL NOT exponer ningún control para subir o reemplazar el archivo PDF de cotización de ese proveedor. Los campos `pdf_nombre`/`pdf_ruta`/`pdf_mime` de un proveedor invitado antes de este cambio se conservan como registro histórico de solo lectura, pero dejan de poder escribirse desde este flujo.

#### Scenario: Compras marca a un proveedor como "Respondió" sin adjuntar archivo
- **WHEN** Compras cambia el estado de un proveedor invitado a `RESPONDIO` desde el
  panel de Solicitud de Cotización
- **THEN** el sistema actualiza el estado y `fecha_respuesta` sin requerir ni
  aceptar un archivo adjunto en esa misma acción

#### Scenario: Intento de acceder a un endpoint de upload retirado
- **WHEN** un cliente envía un archivo en el campo `archivo` al endpoint
  `PUT /api/v1/compras/requisiciones/:reqId/solicitud-cotizacion/proveedores/:scpId`
- **THEN** el sistema ignora el archivo recibido (no hay middleware de carga de
  archivo en esa ruta) y solo procesa `estado`/`notas_proveedor`

### Requirement: El correo de invitación a cotizar SHALL adjuntar las fichas técnicas de los insumos de la requisición
Cuando el sistema envía el correo de Solicitud de Cotización a un
proveedor invitado, SHALL adjuntar las fichas técnicas ya asociadas a
cada insumo de la requisición (si existen), para que el proveedor tenga
las especificaciones sin tener que solicitarlas por separado. Si no puede
resolver las fichas de un insumo (el servicio de Gerencia Técnica no
responde, o un archivo específico no se puede descargar), el correo SHALL
enviarse de todas formas, sin esos adjuntos faltantes.

#### Scenario: Requisición con insumos que tienen fichas técnicas
- **WHEN** Compras envía la Solicitud de Cotización de una requisición
  cuyos insumos tienen fichas técnicas registradas
- **THEN** el correo enviado a cada proveedor invitado incluye esas fichas
  como adjuntos

#### Scenario: Requisición con insumos sin ninguna ficha técnica
- **WHEN** ninguno de los insumos de la requisición tiene fichas técnicas
  registradas
- **THEN** el correo se envía normalmente, sin adjuntos adicionales (solo
  los logos inline existentes)

#### Scenario: Gerencia Técnica no responde al resolver las fichas
- **WHEN** la llamada a Gerencia Técnica para obtener las fichas técnicas
  de los insumos falla o excede el timeout
- **THEN** el correo de invitación se envía igual, sin adjuntos de fichas
  técnicas — el envío no se bloquea ni se reporta como fallido por esta
  causa

