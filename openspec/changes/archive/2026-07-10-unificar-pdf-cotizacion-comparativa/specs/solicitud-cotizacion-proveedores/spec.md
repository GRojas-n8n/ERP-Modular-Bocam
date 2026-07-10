## MODIFIED Requirements

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

## ADDED Requirements

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
