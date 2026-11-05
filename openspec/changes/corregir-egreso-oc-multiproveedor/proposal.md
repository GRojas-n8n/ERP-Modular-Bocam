## Why

`POST /api/v1/finanzas/pagos-oc` nunca ha registrado un pago. Llama `prisma.$transaction` dentro de
`createTenantContext`, que ya es una transacción interactiva, y Prisma 5 elimina `$transaction` del cliente
transaccional (`runtime/library.js`, lista de métodos negados). Cada llamada termina en TypeError y 500. La
prueba e2e existente solo cubre los rechazos 403 y 400, por eso no se detectó.

Además, el diseño del endpoint confiaba en el cliente: saldo de la OC, proveedor y código venían del body y
no se verificaba que las OCs pertenecieran al proyecto del egreso. La pantalla enviaba `proyecto_id` vacío,
`proveedor_id` vacío y `saldo_oc_antes = 0`, de modo que todo abono se publicaba como pago total.

Requisito de negocio que el cliente necesita: **un egreso (cheque, transferencia, SPEI o efectivo) puede
liquidar OCs de varios proveedores de cualquier giro, siempre que todas sean del mismo proyecto.**

Hallazgos que cierra (auditoría del 5 nov 2026): F0, F1 (backend), F3, F4, F5, F6, F10, F11, F12, F15
(endpoint nuevo) y F26 (cancelación con abonos liberaba el compromiso completo).

## What Changes

- **Nuevo `src/egreso-oc.ts`:** punto único de escritura del egreso, en una transacción con RLS del proyecto.
- **Proyección `ocs_por_pagar`** alimentada por `compras.oc_creada` y `compras.oc_cancelada`; fuente única de
  proyecto, proveedor y saldo de cada OC. Nuevo `GET /api/v1/finanzas/ocs-por-pagar`.
- **`POST /pagos-oc` reescrito:** el cliente solo envía `oc_id` y `monto_aplicado`; el proyecto sale del JWT;
  el límite de autoridad se sigue evaluando primero.
- **Idempotencia por folio** `(tenant, fuente, cuenta|proyecto, tipo_pago, referencia)`.
- **Presupuesto:** cada detalle pasa de comprometido a ejercido (DEVENGADO) hasta agotar el compromiso de la OC.
- **`compromiso-oc.ts`:** la cancelación libera `compromiso - devengado`.
- **Evento nuevo `finanzas.egreso_oc_registrado`** para la póliza de egreso (la consume Contabilidad en un
  change aparte).
- **Migración `20261109120000_egreso_oc_multiproveedor`:** tabla, CHECKs, RLS forzado, `uq_pagos_oc_folio`,
  `uq_movimiento_nomina`; idempotente y con precheck; `rollback.sql`.

## Impact

- Servicio: `apps/finanzas` únicamente. La pantalla (`app-shell`) y la póliza (`contabilidad`) van en sus
  propios changes: `pantalla-egreso-multiproveedor` y `poliza-egreso-y-fondeo`.
- Compras: cambio aditivo independiente (`oc-creada-con-nombre-proveedor`) para enviar `proveedor_nombre`.
- Contrato HTTP: `proveedor_id`, `proveedor_nombre`, `oc_codigo`, `saldo_oc_antes` y `saldo_oc_despues` del body
  se ignoran; respuesta 201 nuevo, 200 reintento idempotente.
- Datos: carga inicial de `ocs_por_pagar` desde Compras (runbook, paso 2.6).
