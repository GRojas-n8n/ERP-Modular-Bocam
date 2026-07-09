## ADDED Requirements

### Requirement: Compras SHALL ver el detalle completo de items antes de aprobar o cotizar
Toda tarjeta de requisición visible para Compras (y para el Residente que la creó)
SHALL incluir una sección expandible con cada item: insumo o descripción libre,
cantidad, unidad, especificación de marca/modelo, detalle técnico y notas.

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
Al crear o actualizar una Solicitud de Cotización con proveedores seleccionados, el
sistema SHALL enviar un correo electrónico a cada proveedor que tenga un
`email_contacto` registrado, con: folio de la requisición, prioridad, plazo de
respuesta, cada item con sus especificaciones, y las notas para proveedores. El
envío SHALL ser best-effort — un fallo de correo no SHALL revertir la Solicitud de
Cotización ya creada en base de datos.

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
sin perder el estado ni el PDF de los proveedores que ya respondieron.

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
