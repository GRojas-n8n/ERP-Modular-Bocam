## Why

Hallazgo F21 de la auditoría de Finanzas (5 nov 2026): las 10 suscripciones de Finanzas no usaban `retry` ni
`deadLetter`. Un error transitorio del handler descartaba el evento (`nack` sin reencolar) y un evento sin consumir
más de 24 h caducaba por el `x-message-ttl` por defecto del bus. Compromisos de OC, presupuestos sincronizados de
GT y movimientos de nómina se podían perder sin rastro.

Además, la nómina era idempotente solo por "buscar antes de insertar": dos entregas simultáneas del mismo evento
duplicaban el COMPROMISO o el EJERCIDO. El índice que lo impide se retiró de `corregir-egreso-oc-multiproveedor`
porque cambiaba un contrato de prueba (caso 10d) y se trae aquí con su propio spec.

## What Changes

- `registrarSuscripcionesFinanzas(bus)`: las 10 suscripciones en una función exportada; `startServer` la llama.
- `colaFinanzas(patrón)`: cola `finanzas.<patrón>.v2` sin `x-message-ttl`, con dead-letter propio, `retry`
  (`FINANZAS_EVENTOS_MAX_INTENTOS`, 5; `FINANZAS_EVENTOS_ESPERA_MS`, 30000) y `deadLetter: true`.
- Migración `20261110120000_unicidad_movimientos_nomina`: índice único parcial `uq_movimiento_nomina`
  (un COMPROMISO y un EJERCIDO por prenómina), con precheck, idempotente y con `rollback.sql`.
- Los handlers de nómina tratan el choque con el índice (reentrega simultánea) como evento ya procesado.
- Caso 10d de `compromiso-oc-concurrencia`: el ejemplo de "otra entidad" pasa de `PreNomina` a `Estimacion`.
- Runbook `docs/operacion/finanzas-colas-v2.md`.

## Impact

- Servicio: `apps/finanzas` únicamente.
- RabbitMQ: 10 colas nuevas `.v2` (más `.retry` y `.dlq`); las 10 anteriores se eliminan tras el despliegue.
- Despliegue: lunes a primera hora, con las colas anteriores vacías.
