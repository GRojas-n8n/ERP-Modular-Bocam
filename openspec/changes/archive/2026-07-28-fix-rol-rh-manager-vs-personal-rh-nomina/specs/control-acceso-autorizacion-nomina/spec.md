## ADDED Requirements

### Requirement: Autorizar y pagar pre-nómina SHALL verificar el rol real 'personal_rh'
SHALL verificar que `securityContext.roles` incluya `'admin'` o `'personal_rh'` al autorizar (`PATCH /api/v1/personal/prenominas/:id/autorizar`) o marcar como pagada (`PATCH /api/v1/personal/prenominas/:id/pagar`) una pre-nómina — `'personal_rh'` es el rol real asignado a los usuarios de RH, no `'rh_manager'`.

#### Scenario: Usuario con rol personal_rh autoriza una pre-nómina CALCULADA
- **WHEN** un usuario cuyo `roles` incluye `'personal_rh'` envía
  `PATCH /api/v1/personal/prenominas/:id/autorizar` sobre una pre-nómina en
  estado `CALCULADA`
- **THEN** la respuesta no es 403 por motivo de rol y la pre-nómina
  transiciona a `AUTORIZADA`

#### Scenario: Usuario con rol personal_rh marca una pre-nómina AUTORIZADA como pagada
- **WHEN** un usuario cuyo `roles` incluye `'personal_rh'` envía
  `PATCH /api/v1/personal/prenominas/:id/pagar` sobre una pre-nómina en
  estado `AUTORIZADA`
- **THEN** la respuesta no es 403 por motivo de rol y la pre-nómina
  transiciona a `PAGADA`

#### Scenario: Usuario sin rol autorizado no puede autorizar ni pagar
- **WHEN** un usuario cuyo `roles` no incluye `'admin'` ni `'personal_rh'`
  envía cualquiera de las dos peticiones anteriores
- **THEN** la respuesta es 403 con código `PER_FORBIDDEN`
