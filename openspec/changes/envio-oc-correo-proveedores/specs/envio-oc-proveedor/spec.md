## ADDED Requirements

### Requirement: Compras SHALL ver un listado de todas las Órdenes de Compra del proyecto activo
El sistema SHALL exponer una vista dentro de Compras que liste todas las
`OrdenCompra` del proyecto activo (independiente de la comparativa que las
originó), mostrando al menos: código, proveedor, fecha de emisión, estado,
total, y si ya fue enviada por correo (fecha del último envío o "No
enviada").

#### Scenario: Compras abre el listado de Órdenes de Compra
- **WHEN** un usuario con rol `procurement` o `admin` abre la vista de
  Órdenes de Compra
- **THEN** el sistema muestra todas las OCs del proyecto activo ordenadas por
  fecha de emisión descendente, cada una con su indicador de envío

### Requirement: Compras SHALL poder seleccionar una o varias OC y enviarlas por correo en un solo paso
El listado de Órdenes de Compra SHALL permitir selección múltiple (checkbox
por fila) y una acción "Enviar por correo" que envíe las OCs seleccionadas a
sus proveedores correspondientes.

#### Scenario: Selección de una sola OC
- **WHEN** Compras selecciona una OC y confirma "Enviar por correo"
- **THEN** el sistema envía un correo al proveedor de esa OC con su PDF
  adjunto

#### Scenario: Selección de varias OC de proveedores distintos
- **WHEN** Compras selecciona 3 OCs de 2 proveedores distintos y confirma
  "Enviar por correo"
- **THEN** el sistema envía 2 correos (uno por proveedor), cada uno con el
  o los PDFs de las OCs de ese proveedor adjuntos

### Requirement: El sistema SHALL agrupar por proveedor un correo con múltiples OC adjuntas
El sistema SHALL enviar un único correo por proveedor cuando la selección
incluya más de una OC de ese mismo proveedor, con un PDF adjunto por cada OC
seleccionada — nunca un correo separado por OC hacia el mismo destinatario.

#### Scenario: Dos OC del mismo proveedor en la misma selección
- **WHEN** Compras selecciona 2 OCs cuyo `proveedor_id` es el mismo y confirma
  el envío
- **THEN** el proveedor recibe un solo correo con 2 archivos PDF adjuntos, uno
  por cada OC

### Requirement: El sistema SHALL generar el PDF de cada OC en el servidor a partir de datos persistidos
El PDF adjunto de cada OC SHALL generarse en el backend a partir de los datos
ya persistidos de la `OrdenCompra` (items, cantidades, precios), sin depender
de estado transitorio del navegador ni de la comparativa que originó la OC.

#### Scenario: Envío de una OC generada en una sesión distinta a la que envía el correo
- **WHEN** una OC fue creada en una sesión previa y un usuario distinto abre
  el listado y la envía por correo
- **THEN** el PDF adjunto refleja correctamente los items, cantidades y
  precios de esa OC, sin requerir que el remitente haya navegado antes por
  su comparativa de origen

### Requirement: El envío de correo de OC SHALL ser best-effort por proveedor
El sistema SHALL reportar en la respuesta cualquier fallo al enviar el correo
a un proveedor (SMTP no disponible, proveedor sin `email_contacto`, error al
generar el PDF de alguna de sus OCs) sin impedir el envío a los demás
proveedores del lote seleccionado, y sin revertir ninguna OC ya creada.

#### Scenario: Un proveedor del lote no tiene correo registrado
- **WHEN** Compras selecciona OCs de 2 proveedores y uno de ellos no tiene
  `email_contacto` en su ficha
- **THEN** el sistema envía correctamente al proveedor con correo válido y
  reporta al otro como "sin correo registrado", sin fallar la operación
  completa

#### Scenario: Falla la generación del PDF de una OC del lote
- **WHEN** la llamada al generador de PDF falla para una de las OCs
  seleccionadas
- **THEN** el sistema reporta esa OC como fallida en la respuesta y continúa
  procesando el resto del lote (incluyendo otras OCs del mismo proveedor si
  su PDF sí se generó)

### Requirement: El sistema SHALL registrar la fecha del último envío por OC
Al enviarse exitosamente el correo que incluye una OC, el sistema SHALL
persistir la fecha de envío y el correo destinatario en esa `OrdenCompra`, y
el listado SHALL reflejar ese estado sin necesidad de recargar manualmente
otra fuente de datos.

#### Scenario: OC enviada exitosamente
- **WHEN** el correo de una OC se envía sin error
- **THEN** el sistema persiste `enviada_proveedor_at` y
  `enviada_proveedor_email`, y el listado muestra "Enviada el {fecha}" para
  esa OC

#### Scenario: Reenvío manual explícito permitido
- **WHEN** Compras selecciona una OC que ya fue enviada previamente y confirma
  "Enviar por correo" de nuevo
- **THEN** el sistema envía el correo nuevamente sin bloquear la acción, y
  actualiza `enviada_proveedor_at` con la fecha del reenvío

### Requirement: El correo de Orden de Compra SHALL incluir el folio, el proveedor y el resumen de importes
El correo enviado SHALL mostrar, por cada OC adjunta: código de la OC, fecha
de emisión, y el subtotal/IVA/total. El asunto del correo SHALL identificar
al menos un código de OC.

#### Scenario: Correo con una sola OC adjunta
- **WHEN** se envía un correo con una única OC
- **THEN** el asunto incluye el código de esa OC y el cuerpo muestra su
  fecha de emisión y totales

#### Scenario: Correo con varias OC adjuntas al mismo proveedor
- **WHEN** se envía un correo agrupando 2 OCs del mismo proveedor
- **THEN** el cuerpo del correo lista ambos códigos de OC con su respectivo
  resumen de importes, y ambos PDFs están adjuntos
