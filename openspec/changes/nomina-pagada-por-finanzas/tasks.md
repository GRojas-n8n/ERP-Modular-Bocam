## 1. Pruebas primero
- [x] 1.1 `nomina-por-pagar.integration.test.ts` (7 casos): proyección idempotente con compromiso; pago con devengo, evento, reintento y 409; 3 pagos simultáneos; sin presupuesto se paga; rechazos sin efectos; `personal.nomina_pagada` sin compromiso no deja negativo; migración re-ejecutable con CHECK.

## 2. Implementar
- [x] 2.1 Modelo `NominaPorPagar`; migración `20261113120000_nominas_por_pagar` y `rollback.sql`; RLS 9f.
- [x] 2.2 `src/nomina-por-pagar.ts`; endpoints; `FinanzasEvents.NOMINA_PAGADA`.
- [x] 2.3 Proyección en `handleNominaAutorizadaEvent`; blindaje de `handleNominaPagadaEvent`.
- [x] 2.4 `scripts/finanzas/backfill-nominas-por-pagar.sql`.
- [x] 2.5 Script de prueba y paso de CI.

## 3. Verificar
- [x] 3.1 `tsc` del servicio, `--strict` del módulo y de la prueba.
- [x] 3.2 PostgreSQL 16 local: migración dos veces; CHECK de PAGADA.
- [ ] 3.3 CI en verde.
