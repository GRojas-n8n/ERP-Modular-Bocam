## Context

El ciclo de pagos de construcción tiene particularidades: (1) los proyectos pueden tener un anticipo inicial que se aplica a pagos antes de usar cuentas bancarias libres; (2) un solo cheque puede pagar múltiples OCs de un mismo proveedor (o de distintos); (3) los pagos pueden ser parciales — una OC de $100k puede tener 3 pagos hasta liquidarla; (4) la empresa maneja múltiples cuentas bancarias y necesita ver de cuál cuenta salió cada pago.

El módulo de Finanzas ya existe en `apps/finanzas` (puerto 3004). Esta change extiende ese microservicio con nuevas tablas y endpoints. Compras mantiene las OCs — Finanzas solo registra los pagos contra IDs de OC que vienen de Compras.

## Goals / Non-Goals

**Goals:** Control completo del ciclo pago de OCs: cuentas bancarias, anticipos, pagos multi-OC, estado de pago por OC.
**Non-Goals:** Conciliación bancaria automática (solo saldo libro), integración con SAP/contabilidad externa, generación de CFDI.

## Decisions

### D1: Finanzas es el dueño del pago — Compras es notificado vía evento
Finanzas registra el pago en su propia BD. Publica `finanzas.oc_pagada_parcial` o `finanzas.oc_pagada_total` con `{ oc_id, monto_pagado, saldo_pendiente }`. Compras se suscribe y actualiza el campo `estado_pago` en su tabla de OCs. Esto evita llamadas HTTP cross-service desde el flujo de pago.

### D2: Anticipo como fuente de pago especial
El `monto_anticipo` del proyecto se guarda en `ProyectoFinanzas` (tabla propia de finanzas — proyección del proyecto). Al registrar un pago, el usuario elige fuente: `ANTICIPO` o una `CuentaBancaria`. El sistema valida saldo disponible antes de registrar.

### D3: Un pago agrupa N OCs (un cheque/transferencia → N OCs)
`PagoOC` tiene N `DetallePagoOC` (uno por OC). Cada detalle tiene `monto_aplicado` y `oc_id` (referencia al ID de OC en Compras, sin FK cruzada — solo UUID almacenado).

### D4: Estado de pago en OC proyectado en Compras
`estado_pago` en la tabla `ordenes_compra` de Compras se actualiza vía evento RabbitMQ. El frontend de Compras muestra el badge de estado de pago leyendo este campo local.
