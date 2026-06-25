# Tasks — pagos-ordenes-compra

## Grupo 1: Schema — apps/finanzas

- [ ] 1.1 En `apps/finanzas/prisma/schema.prisma` agregar modelos: `CuentaBancaria`, `ProyectoFinanzas`, `PagoOC`, `DetallePagoOC` con enums `FuentePago` y `TipoPago`
- [ ] 1.2 Ejecutar `npx prisma migrate dev --name add_pagos_oc` en `apps/finanzas`
- [ ] 1.3 En `apps/compras/prisma/schema.prisma` agregar campo `estado_pago String @default("PENDIENTE_PAGO")` en `OrdenCompra`
- [ ] 1.4 Ejecutar `npx prisma migrate dev --name add_estado_pago_oc` en `apps/compras`

## Grupo 2: Backend — Cuentas Bancarias (apps/finanzas)

- [ ] 2.1 `GET /api/v1/finanzas/cuentas-bancarias` — lista activas del tenant
- [ ] 2.2 `POST /api/v1/finanzas/cuentas-bancarias` — crear cuenta con saldo inicial
- [ ] 2.3 `PATCH /api/v1/finanzas/cuentas-bancarias/:id` — editar cuenta
- [ ] 2.4 `DELETE /api/v1/finanzas/cuentas-bancarias/:id` — soft delete (activa = false); 409 si tiene pagos

## Grupo 3: Backend — Anticipo (apps/finanzas)

- [ ] 3.1 `GET /api/v1/finanzas/proyectos/:proyectoId/anticipo` — saldo anticipo del proyecto
- [ ] 3.2 `POST /api/v1/finanzas/proyectos/:proyectoId/anticipo` — crear/actualizar monto anticipo

## Grupo 4: Backend — Pagos (apps/finanzas)

- [ ] 4.1 `GET /api/v1/finanzas/pagos?proyectoId=&proveedorId=` — lista de pagos con detalles
- [ ] 4.2 `POST /api/v1/finanzas/pagos` — crear pago multi-OC:
  - Validar `monto_total = sum(detalles.monto_aplicado)`
  - Si fuente `ANTICIPO`: validar disponible, incrementar `anticipo_usado` en transacción
  - Si fuente `CUENTA_BANCARIA`: validar saldo, decrementar `cuenta.saldo` en transacción
  - Insertar `PagoOC` + `DetallePagoOC[]` en una sola transacción Prisma
- [ ] 4.3 `GET /api/v1/finanzas/pagos/:id` — detalle de pago
- [ ] 4.4 Publicar eventos RabbitMQ al completar pago:
  - Por cada detalle: calcular saldo pendiente de la OC; si saldo = 0 → `finanzas.oc_pagada_total`, si no → `finanzas.oc_pagada_parcial`

## Grupo 5: Backend — Suscriptor en Compras

- [ ] 5.1 En `apps/compras/src/main.ts` agregar suscriptor RabbitMQ para `finanzas.oc_pagada_parcial` → `UPDATE ordenes_compra SET estado_pago = 'PAGO_PARCIAL'`
- [ ] 5.2 Agregar suscriptor para `finanzas.oc_pagada_total` → `UPDATE ordenes_compra SET estado_pago = 'PAGADA'`
- [ ] 5.3 Agregar tabla `eventos_procesados` o check idempotente con `(pago_id, oc_id)` unique

## Grupo 6: Frontend — FinanzasView

- [ ] 6.1 Agregar tab o sección "Pagos de OCs" en `FinanzasView.tsx`
- [ ] 6.2 Tabla de pagos: fecha, referencia, proveedores, total, OCs cubiertas — desde `GET /api/v1/finanzas/pagos?proyectoId=`
- [ ] 6.3 Botón "Registrar Pago" → modal con formulario
- [ ] 6.4 Modal: campo fuente (anticipo/cuenta), tipo pago, referencia, concepto, fecha
- [ ] 6.5 Modal: selector de OCs con saldo pendiente (fetch OCs del proyecto desde Compras con `estado_pago != PAGADA`)
- [ ] 6.6 Modal: tabla de OCs seleccionadas con campo `monto_aplicado` editable por OC
- [ ] 6.7 Validación: suma montos = total; total ≤ saldo fuente
- [ ] 6.8 `POST /api/v1/finanzas/pagos` al confirmar → cerrar modal, recargar lista

## Grupo 7: Frontend — ComprasView (badge estado pago)

- [ ] 7.1 En el listado de OCs en `ComprasView.tsx` agregar badge de `estado_pago`:
  - `PENDIENTE_PAGO` → chip gris "Sin pago"
  - `PAGO_PARCIAL` → chip amarillo "Pago parcial"
  - `PAGADA` → chip verde "Pagada"
- [ ] 7.2 Badge solo visible si la OC está en estado `EMITIDA`, `PARCIALMENTE_RECIBIDA` o `RECIBIDA`

## Grupo 8: Infra

- [ ] 8.1 En `docker-compose.vps.yml` verificar que `apps/finanzas` tiene `DATABASE_URL` separada para la BD de finanzas (ya debe existir)
- [ ] 8.2 Ejecutar migraciones en VPS: `docker compose exec finanzas npx prisma migrate deploy` y `docker compose exec compras npx prisma migrate deploy`

## Grupo 9: Verificación E2E

- [ ] 9.1 Crear cuenta bancaria BBVA desde FinanzasView
- [ ] 9.2 Registrar anticipo $500,000 para el proyecto activo
- [ ] 9.3 Crear pago con fuente ANTICIPO cubriendo 2 OCs — verificar `anticipo_usado` se actualiza
- [ ] 9.4 Crear pago con fuente CUENTA_BANCARIA cubriendo 1 OC — verificar `cuenta.saldo` se decrementa
- [ ] 9.5 En ComprasView: OCs pagadas muestran badge verde "Pagada"
- [ ] 9.6 En ComprasView: OC con pago parcial muestra badge amarillo "Pago parcial"
- [ ] 9.7 Intentar pagar más del saldo disponible → error 422 con mensaje claro
- [ ] 9.8 VPS logs: eventos `finanzas.oc_pagada_total` y `finanzas.oc_pagada_parcial` visibles en RabbitMQ
