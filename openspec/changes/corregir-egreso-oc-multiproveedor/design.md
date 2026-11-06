## Contexto

Finanzas y Compras tienen bases separadas (sin JOIN cruzado). Validar cada egreso contra Compras por HTTP
acopla la disponibilidad de tesorería a Compras y no permite bloquear el saldo de la OC dentro de la
transacción del pago.

## Decisiones

1. **Proyección local en lugar de B2B síncrono.** `ocs_por_pagar` se alimenta de los eventos que Finanzas ya
   consume. Permite `SELECT ... FOR UPDATE` del saldo en la misma transacción que descuenta la cuenta.
   Trade-off: depende de que `compras.oc_creada` llegue; se mitiga con la carga inicial y con el reintento y la
   DLQ de `blindar-consumidores-finanzas`.
2. **Orden de locks fijo.** Lock de folio (`pg_advisory_xact_lock`), luego el mismo lock por OC que usa
   `compromiso-oc.ts` en orden de `oc_id`, luego `FOR UPDATE` de las filas. Egresos concurrentes y
   cancelaciones de la misma OC se serializan sin deadlock.
3. **Idempotencia natural por folio bancario.** Un folio de cheque o transferencia es único por cuenta; no se
   agrega columna `idempotency_key`. Índice único como respaldo ante carreras (P2002 → 409).
4. **Descuento atómico de la fuente.** `UPDATE ... WHERE saldo >= monto`; una cuenta de proyecto no paga OCs de
   otro proyecto; una cuenta de empresa (`proyecto_id` nulo) paga cualquier proyecto del tenant.
5. **Presupuesto.** DEVENGADO contra el COMPROMISO de la OC hasta agotarlo; el excedente es EJERCIDO directo.
   Sin compromiso (OC previa a la sincronización de partidas) solo se afecta tesorería.
6. **Límite de autoridad primero**, con suma tolerante del body, para conservar el contrato existente
   (`limite-autoridad-pagos-oc`): ninguna validación de negocio ni acceso a BD antes del límite.
7. **Migración idempotente.** En CI `prisma db push` crea la tabla antes del SQL; todo usa `IF NOT EXISTS` o
   comprobación en `pg_constraint`. Precheck que aborta ante folios o movimientos de nómina duplicados.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| OCs emitidas antes del despliegue no están en la proyección | Carga inicial desde Compras (runbook 2.6), re-ejecutable |
| OCs con `PAGO_PARCIAL` en Compras sin detalle en Finanzas | La carga las lista; el tesorero registra el abono con su folio original |
| Evento `oc_creada` perdido | Reintento y DLQ en `blindar-consumidores-finanzas`; la carga inicial puede repetirse |
