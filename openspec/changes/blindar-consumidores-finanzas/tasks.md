## 1. Pruebas primero

- [x] 1.1 `consumidores-resilientes.integration.test.ts` parte A: 10 suscripciones con cola `.v2`, sin TTL, dead-letter, `retry` configurable y DLQ. Falla en `main` (la función no existe).
- [x] 1.2 Parte B con RabbitMQ real: falla 2 veces y se procesa al tercer intento; falla siempre y termina en `.dlq`; la cola principal no tiene `x-message-ttl`.
- [x] 1.3 `nomina-idempotencia.integration.test.ts`: tres entregas simultáneas de `nomina_autorizada` y de `nomina_pagada` producen un solo movimiento y un solo incremento; el índice rechaza duplicados directos y respeta su alcance; migración re-ejecutable.

## 2. Implementar

- [x] 2.1 `colaFinanzas` y `registrarSuscripcionesFinanzas`; `startServer` la usa.
- [x] 2.2 Migración `20261110120000_unicidad_movimientos_nomina` con precheck y rollback.
- [x] 2.3 Handlers de nómina: P2002 de `uq_movimiento_nomina` = ya procesado.
- [x] 2.4 Caso 10d actualizado; scripts y pasos de CI; runbook de operación.

## 3. Verificar

- [x] 3.1 `tsc` del servicio y de las pruebas.
- [x] 3.2 Parte A en local: 2/2.
- [x] 3.3 Migración en PostgreSQL 16: precheck aborta y revierte; dos corridas sin error; duplicado rechazado; otros tipos y entidades permitidos; rollback limpio.
- [ ] 3.4 CI en verde (incluye RabbitMQ y PostgreSQL reales).

## 4. Desplegar (lunes 9 nov, `docs/operacion/finanzas-colas-v2.md`)

- [ ] 4.1 Colas anteriores en 0 mensajes y respaldo de `bocam_finanzas`.
- [ ] 4.2 10 colas `.v2` con 1 consumidor; 7 migraciones.
- [ ] 4.3 Colas anteriores eliminadas.
