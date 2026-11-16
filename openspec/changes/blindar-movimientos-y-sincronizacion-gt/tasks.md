## 1. Pruebas primero

- [x] 1.1 `presupuesto-blindado.integration.test.ts` (9 casos): resincronización de GT con compromisos; movimientos sobre partidas de GT, TRANSFERENCIA y montos inválidos; 20 compromisos simultáneos (exactamente 10 pasan); LIBERACION/DEVENGADO acotados; transferencia que mueve autorizado; misma transferencia simultánea aplicada una vez y 409 con otro monto; transferencias simultáneas sin sobregiro; partidas de GT en transferencias; índice y migración re-ejecutable.

## 2. Implementar

- [x] 2.1 `src/montos.ts` y uso en `egreso-oc.ts`.
- [x] 2.2 `src/presupuesto-blindado.ts`.
- [x] 2.3 `POST /movimientos`, `POST /transferencias-presupuestales` y `handleSaldoPartidaCreadoEvent` delegan en el módulo.
- [x] 2.4 Migración `20261111120000_unicidad_transferencias` con precheck y rollback; script y pasos de CI.

## 3. Verificar

- [x] 3.1 `tsc` del servicio; `tsc --strict` de `presupuesto-blindado.ts`, `montos.ts` y `egreso-oc.ts`.
- [x] 3.2 PostgreSQL 16: SQL de resincronización (alta 1,000; reemisión con 300 comprometidos deja 700; reducción a 200 deja -100; sin duplicar fila); `FOR UPDATE` con arreglo de UUID; migración (precheck, dos corridas, salida y entrada permitidas, duplicado rechazado, rollback).
- [ ] 3.3 CI en verde.
