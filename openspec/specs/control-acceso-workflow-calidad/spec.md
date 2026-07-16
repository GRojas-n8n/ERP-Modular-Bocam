# control-acceso-workflow-calidad Specification

## Purpose

Las acciones exclusivas de `admin` en los workflows de No Conformidad y
Auditoría Interna del módulo Calidad (reapertura de una NC cerrada,
cancelación de una auditoría) verifican el permiso correctamente contra
el arreglo de roles real del usuario autenticado.

## Requirements

### Requirement: Las acciones exclusivas de admin en el workflow de Calidad SHALL verificarse contra roles[]
Las acciones que el workflow de No Conformidad y de Auditoría Interna
restringen a usuarios con rol `admin` (reapertura de una NC cerrada,
cancelación de una auditoría) SHALL verificar el permiso comprobando que
`securityContext.roles` incluya `'admin'`, no un campo `rol` singular.

#### Scenario: Admin reabre una NC cerrada
- **WHEN** un usuario cuyo `roles` incluye `'admin'` envía
  `PATCH /api/v1/calidad/no-conformidades/:id` con `{ reabrir: true }`
  sobre una NC en estado `CERRADA`
- **THEN** la respuesta es 200, el estado vuelve a `ABIERTA` y
  `fecha_cierre` se limpia

#### Scenario: Usuario sin rol admin no puede reabrir una NC
- **WHEN** un usuario cuyo `roles` no incluye `'admin'` (ej. solo
  `'calidad'`) envía la misma petición de reapertura
- **THEN** la respuesta es 403 con código `REABRIR_SOLO_ADMIN`

#### Scenario: Admin cancela una auditoría
- **WHEN** un usuario cuyo `roles` incluye `'admin'` envía
  `PATCH /api/v1/calidad/auditorias/:id` con `{ estado: 'CANCELADA' }`
  sobre una auditoría en estado `PROGRAMADA` o `EN_CURSO`
- **THEN** la respuesta es 200 y el estado pasa a `CANCELADA`

#### Scenario: Usuario sin rol admin no puede cancelar una auditoría
- **WHEN** un usuario cuyo `roles` no incluye `'admin'` envía la misma
  petición de cancelación
- **THEN** la respuesta es 403
