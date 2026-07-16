## ADDED Requirements

### Requirement: Las acciones restringidas del módulo Finanzas SHALL verificar el rol real 'finanzas'
Crear presupuesto, registrar movimiento presupuestal, transferir
presupuesto entre partidas, programar pagos (individual y por lote) y
marcar un pago como pagado SHALL verificar que `securityContext.roles`
incluya `'admin'`, `'superintendent'` o `'finanzas'` — el rol real
asignado a los usuarios de Finanzas, no `'finance'`.

#### Scenario: Usuario con rol finanzas crea un presupuesto
- **WHEN** un usuario cuyo `roles` incluye `'finanzas'` envía
  `POST /api/v1/finanzas/presupuestos` con datos válidos
- **THEN** la respuesta es 201 y el presupuesto se crea (sujeto a
  validaciones de negocio, no de rol)

#### Scenario: Usuario sin rol autorizado no puede crear un presupuesto
- **WHEN** un usuario cuyo `roles` no incluye `'admin'`, `'superintendent'`
  ni `'finanzas'` envía la misma petición
- **THEN** la respuesta es 403 con código `FIN_FORBIDDEN`

#### Scenario: Usuario con rol finanzas registra un movimiento presupuestal
- **WHEN** un usuario cuyo `roles` incluye `'finanzas'` envía
  `POST /api/v1/finanzas/movimientos` con datos válidos
- **THEN** la respuesta no es 403 por motivo de rol

#### Scenario: Usuario con rol finanzas transfiere presupuesto entre partidas
- **WHEN** un usuario cuyo `roles` incluye `'finanzas'` envía
  `POST /api/v1/finanzas/transferencias-presupuestales` con datos válidos
- **THEN** la respuesta no es 403 por motivo de rol

#### Scenario: Usuario con rol finanzas programa un pago
- **WHEN** un usuario cuyo `roles` incluye `'finanzas'` envía
  `POST /api/v1/finanzas/pagos` o `POST /api/v1/finanzas/pagos/bulk`
- **THEN** la respuesta no es 403 por motivo de rol

#### Scenario: Usuario con rol finanzas marca un pago como pagado
- **WHEN** un usuario cuyo `roles` incluye `'finanzas'` envía
  `PATCH /api/v1/finanzas/pagos/:id/pagar`
- **THEN** la respuesta no es 403 por motivo de rol
