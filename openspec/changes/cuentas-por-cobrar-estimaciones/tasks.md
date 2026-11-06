## 1. Pruebas primero

- [x] 1.1 `cuentas-por-cobrar.integration.test.ts` (9 casos): alta e idempotencia sin pago programado; registro previo no se duplica; cobro parcial y total con abono y evento; folio idempotente y 409; cobro mayor al saldo 422; 5 cobros simultáneos (3 pasan); validaciones sin rastro; RLS y roles; migración re-ejecutable con CHECK.
- [x] 1.2 Pruebas existentes adaptadas al contrato corregido: `control-obra.event`, `control-obra.avance-validado`, `event-contracts`.

## 2. Implementar

- [x] 2.1 Modelos `CuentaPorCobrar` y `CobroCxc`; migración `20261112120000_cuentas_por_cobrar` (idempotente) y `rollback.sql`; RLS 9e en `rls-policies.sql`.
- [x] 2.2 `src/cuentas-por-cobrar.ts`; `abonarCuentaBancaria` en `tesoreria.ts`.
- [x] 2.3 Handlers de `estimacion_aprobada` y `avance_fisico_validado`; endpoints; `FinanzasEvents.COBRO_REGISTRADO`.
- [x] 2.4 `scripts/finanzas/migrar-estimaciones-a-cxc.sql` (simulación por defecto).
- [x] 2.5 Script `test:integration:cuentas-por-cobrar` y paso de CI.

## 3. Verificar

- [x] 3.1 `tsc` del servicio y `--strict` del módulo nuevo.
- [x] 3.2 PostgreSQL 16 local: migración dos veces; RLS rechaza alta en otro proyecto y oculta filas ajenas; CHECK rechaza cobrado > monto; script de datos simulado y aplicado dos veces (re-ejecutable).
- [ ] 3.3 CI en verde.
