# Tasks — pagos-ordenes-compra

## Grupo 1: Schema — apps/finanzas

- [x] 1.1 En `apps/finanzas/prisma/schema.prisma` — modelos `CuentaBancaria`, `ProyectoFinanzas`, `PagoOC`, `DetallePagoOC` agregados
- [ ] 1.2 Ejecutar `npx prisma migrate dev --name add_pagos_oc` en `apps/finanzas` — PENDIENTE VPS (BD no disponible localmente)
- [x] 1.3 En `apps/compras/prisma/schema.prisma` — campo `estado_pago String @default("PENDIENTE_PAGO")` en `OrdenCompra`
- [ ] 1.4 Ejecutar `npx prisma migrate dev --name add_estado_pago_oc` en `apps/compras` — PENDIENTE VPS

## Grupo 2: Backend — Cuentas Bancarias (apps/finanzas)

- [x] 2.1 `GET /api/v1/finanzas/cuentas-bancarias` — lista activas del tenant
- [x] 2.2 `POST /api/v1/finanzas/cuentas-bancarias` — crear cuenta con saldo inicial
- [x] 2.3 `PATCH /api/v1/finanzas/cuentas-bancarias/:id` — editar cuenta
- [x] 2.4 `DELETE /api/v1/finanzas/cuentas-bancarias/:id` — soft delete; 409 si tiene pagos

## Grupo 3: Backend — Anticipo (apps/finanzas)

- [x] 3.1 `GET /api/v1/finanzas/proyectos/:proyectoId/anticipo` — saldo anticipo del proyecto
- [x] 3.2 `POST /api/v1/finanzas/proyectos/:proyectoId/anticipo` — crear/actualizar monto anticipo (upsert)

## Grupo 4: Backend — Pagos (apps/finanzas)

- [x] 4.1 `GET /api/v1/finanzas/pagos-oc?proyectoId=&proveedorId=` — lista de pagos con detalles
- [x] 4.2 `POST /api/v1/finanzas/pagos-oc` — crear pago multi-OC con transacción Prisma (validar saldo fuente, descontar, crear PagoOC + DetallePagoOC)
- [x] 4.3 `GET /api/v1/finanzas/pagos-oc/:id` — detalle de pago
- [x] 4.4 Publicar eventos RabbitMQ: `finanzas.oc_pagada_total` / `finanzas.oc_pagada_parcial`

## Grupo 5: Backend — Suscriptor en Compras

- [x] 5.1 Handler `handleOcPagadaTotalEvent` → `UPDATE ordenes_compra SET estado_pago = 'PAGADA'`
- [x] 5.2 Handler `handleOcPagadaParcialEvent` → `UPDATE ordenes_compra SET estado_pago = 'PAGO_PARCIAL'`
- [x] 5.3 Suscriptores registrados en `startServer()` para ambos eventos
- [ ] 5.4 Tabla `eventos_procesados` o check idempotente — DIFERIDO (la lógica actual aplica siempre sin idempotencia)

## Grupo 6: Frontend — FinanzasView

- [x] 6.1 Sección "Pagos de OCs" en `FinanzasView.tsx` con tabla de pagos
- [x] 6.2 Tabla de pagos: fecha, referencia, fuente, OCs cubiertas, total
- [x] 6.3 Botón "Registrar Pago" → modal
- [x] 6.4 Modal: fuente (anticipo/cuenta), tipo pago, referencia, concepto, fecha
- [x] 6.5 Modal: campo ID de OC + código OC (pendiente selector visual de OCs)
- [x] 6.6 Modal: campo monto_aplicado por OC
- [x] 6.7 Validación del lado servidor: saldo fuente; error mostrado en modal
- [x] 6.8 `POST /api/v1/finanzas/pagos-oc` al confirmar → recarga lista

## Grupo 7: Frontend — badge estado_pago en OCs

- [x] 7.1 `OrdenCompraEnComparativa` extendida con `estado_pago?` en `ComparativaDetail.tsx`
- [x] 7.2 Badge `estado_pago` en header de cada OC: verde="Pagada", amber="Pago parcial", solo si ≠ PENDIENTE_PAGO

## Grupo 8: Infra

- [ ] 8.1 Verificar docker-compose.vps.yml — PENDIENTE DEPLOY
- [ ] 8.2 Ejecutar migraciones en VPS — PENDIENTE DEPLOY

## Grupo 9: Verificación E2E

- [ ] 9.1-9.8 Verificación en iretum.com — PENDIENTE DEPLOY (requiere migraciones en VPS)
