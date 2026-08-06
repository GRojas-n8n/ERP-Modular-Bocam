# control-acceso-rol-finanzas-asistente Specification

## Purpose

El endpoint de alertas predictivas del microservicio `asistente` verifica el rol real `'finanzas'` (español) asignado a los usuarios de Finanzas del sistema, no un nombre en inglés inexistente.

## Requirements

### Requirement: El endpoint de alertas predictivas SHALL reconocer el rol real 'finanzas'
`GET /api/v1/asistente/alertas-predictivas` SHALL permitir el acceso a usuarios cuyo `roles` incluya `'finanzas'` (español, el rol real asignado a los usuarios de Finanzas), no `'finance'` (inglés, un rol que no existe en el sistema).

#### Scenario: Usuario con rol finanzas consulta alertas predictivas
- **WHEN** un usuario cuyo `roles` incluye `'finanzas'` envía `GET /api/v1/asistente/alertas-predictivas`
- **THEN** la respuesta no es 403 por motivo de rol
