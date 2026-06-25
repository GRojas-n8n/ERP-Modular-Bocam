## Context

Finanzas tiene su propia BD con `PresupuestoAsignado`, `CuentaBancaria` (pendiente de implementar en `pagos-ordenes-compra`), y movimientos. Los datos de OCs pendientes de pago son de Compras — deben proyectarse vía RabbitMQ. Los presupuestos y saldos son nativos de Finanzas.

## Goals / Non-Goals

**Goals:** Dashboard financiero del proyecto con presupuesto, bancos y OCs por pagar.
**Non-Goals:** Contabilidad, estados de cuenta bancarios reales (solo saldo libro).

## Decisions

### D1: OCs pendientes de pago proyectadas vía evento
Finanzas se suscribe a `compras.oc_creada` y `compras.oc_recibida_total` para mantener un contador local de OCs en estado pagable. Evita llamada HTTP a Compras desde el dashboard.

### D2: Cuentas bancarias — depende de `pagos-ordenes-compra`
El dashboard de Finanzas muestra saldos de cuentas bancarias solo si el change `pagos-ordenes-compra` ya fue implementado. Si no, muestra solo presupuesto y alertas de OCs.
