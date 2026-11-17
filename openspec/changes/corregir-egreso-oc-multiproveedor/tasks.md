## 1. Reproducir

- [x] 1.1 Verificado en `runtime/library.js` de Prisma 5: `$transaction` está en la lista de métodos negados del cliente transaccional; `POST /pagos-oc` falla siempre con TypeError.
- [x] 1.2 Revisión de `FinanzasView.tsx`: `proyecto_id` vacío, `proveedor_id` vacío y `saldo_oc_antes = 0` (todo abono se publica como total).

## 2. Implementar (Finanzas)

- [x] 2.1 `src/egreso-oc.ts`: validación del body, locks, `FOR UPDATE`, saldo calculado en servidor, descuento atómico, DEVENGADO por OC.
- [x] 2.2 `POST /pagos-oc` reescrito; `GET /ocs-por-pagar`; handlers de proyección en `oc_creada` y `oc_cancelada`; evento `finanzas.egreso_oc_registrado`.
- [x] 2.3 `compromiso-oc.ts`: la cancelación libera `compromiso - devengado`.
- [x] 2.4 Migración idempotente con precheck, RLS forzado, CHECKs e índice único de folio; `rollback.sql`; modelo `OcPorPagar`.
- [x] 2.5 Políticas de `ocs_por_pagar` también en `rls-policies.sql` (gate `Cobertura RLS (estática)`).
- [x] 2.6 `uq_movimiento_nomina` retirado de este change (rompía el caso 10d de `compromiso-oc-concurrencia`); pasa a `blindar-consumidores-finanzas`.

## 3. Verificar

- [x] 3.1 `tsc --noEmit` del servicio sobre `main` y sobre `main` + #191; `tsc --strict` de `egreso-oc.ts`.
- [x] 3.2 Validador del body: 11/11 casos.
- [x] 3.3 HTTP contra `main.ts` sin BD: 6/6 (límite primero, body vacío, monto negativo, proyecto distinto, OC repetida, proyecto del JWT).
- [x] 3.4 Migración en PostgreSQL 16: RLS rechaza OC de otro proyecto; CHECK rechaza sobrepago; folio duplicado rechazado; precheck aborta y revierte; idempotente tras `db push`; rollback limpio.
- [x] 3.5 Carga inicial validada con RLS forzado y re-ejecución sin duplicados.
- [x] 3.6 `npm run test:integration:egreso-oc -w @bocam/finanzas` en CI: 8/8 en verde (run 42136885192, commit 2797f53).
- [x] 3.7 `test:e2e:seguridad`, `compromiso-oc-concurrencia` (16/16), `compromiso-oc-rls` y `compromiso-oc-migracion` en verde en el mismo run, sin cambios de contrato.

## 4. Desplegar (runbook-finanzas-100, paso 2)

- [ ] 4.1 Respaldo de `bocam_finanzas` verificado.
- [ ] 4.2 `prisma migrate deploy` en `bocam-vps-finanzas`.
- [ ] 4.3 Carga inicial de `ocs_por_pagar`; registrar abonos de OCs con `PAGO_PARCIAL`.
- [ ] 4.4 Egreso real de prueba de 2 proveedores con montos de $1.00; Compras refleja `PAGO_PARCIAL` o `PAGADA`.
