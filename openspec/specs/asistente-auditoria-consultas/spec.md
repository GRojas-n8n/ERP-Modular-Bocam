# asistente-auditoria-consultas Specification

## Purpose
TBD - created by archiving change asistente-ia-agente-conversacional. Update Purpose after archive.
## Requirements
### Requirement: El sistema SHALL registrar cada turno de chat que invoque tools
Todo turno de `/chat` que invoque una o más tools SHALL quedar registrado en el
sistema de observabilidad, con la información suficiente para reconstruir qué
se consultó y por quién.

#### Scenario: Turno con invocación de tools queda auditado
- **WHEN** un usuario hace una pregunta que provoca que el sistema invoque una
  o más tools
- **THEN** el sistema registra un evento de auditoría para ese turno antes de
  devolver la respuesta al usuario

### Requirement: El registro de auditoría SHALL incluir los datos mínimos de trazabilidad
Cada registro de auditoría de un turno de chat SHALL incluir: identificador del
usuario, `tenant_id`, `conversacion_id`, lista de tools invocadas, tiempo de
respuesta de cada tool, y si el resultado final fue parcial o completo.

#### Scenario: Auditoría de un turno con degradación parcial
- **WHEN** se registra un turno en el que una o más tools fallaron
- **THEN** el registro de auditoría incluye cuáles tools fallaron y cuáles
  tuvieron éxito, junto con el resto de los campos mínimos de trazabilidad

### Requirement: El sistema SHALL registrar turnos sin invocación de tools por separado
El sistema SHALL registrar como tal, distinguible de los turnos que sí
consultaron microservicios, un turno de chat que se resuelva sin invocar
ninguna tool (por ejemplo, una pregunta fuera de dominio).

#### Scenario: Turno rechazado por estar fuera de dominio
- **WHEN** el sistema responde a una pregunta fuera del dominio del ERP sin
  invocar ninguna tool
- **THEN** el registro de auditoría de ese turno indica explícitamente que no
  se invocó ninguna tool, sin quedar mezclado con los turnos que sí consultaron
  microservicios

