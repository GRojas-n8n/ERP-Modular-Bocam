## ADDED Requirements

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
