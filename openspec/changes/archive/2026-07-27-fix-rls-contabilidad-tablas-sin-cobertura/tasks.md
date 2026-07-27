## 1. Confirmar alcance y capturar estado rojo

- [x] 1.1 Auditoría completa de código (agente Explore): 5 modelos, ~30 sitios de
      acceso a datos revisados uno por uno. Confirmado GAP-1 crítico (`main.ts:1677`,
      `findMany()` sin `where`), GAP-2 menor, GAP-3 generalizado (~12 sitios sin
      `proyecto_id`), GAP-4 bajo riesgo (12 updates ya guardados).
- [x] 1.2 Confirmado ownership `bocam_app` en las 5 tablas, sin políticas/funciones
      huérfanas preexistentes (`pg_policy`/`pg_proc` vacíos).
- [x] 1.3 Probado el leak en rojo con datos reales de producción: `BEGIN...ROLLBACK`
      con contexto de tenant A mostró 5/5 asientos (incluyendo 3 del tenant B).

## 2. Mitigación urgente: RLS

- [x] 2.1 Escrito `apps/contabilidad/prisma/rls-policies.sql` — 4 tablas
      (`asientos_contables`, `conciliaciones_fiscales`, `conciliaciones_bancarias`,
      `movimientos_poliza`) con política `tenant_id AND proyecto_id`;
      `cuentas_contables` excluida a propósito y documentada.
- [x] 2.2 Aplicado contra `bocam_contabilidad` en producción de inmediato, antes de
      cualquier otro paso — sin errores.
- [x] 2.3 Confirmado `relrowsecurity=true`/`relforcerowsecurity=true`/1 política en las
      4 tablas; `cuentas_contables` explícitamente sin RLS.
- [x] 2.4 Verificado en verde con `BEGIN...ROLLBACK` y datos reales: solo 2/2 asientos
      del tenant/proyecto propio visibles (antes 5). Verificado también cross-proyecto
      dentro del mismo tenant con una fila sintética — invisible correctamente.
- [x] 2.5 Confirmado join contra `cuentas_contables` sigue funcionando (sin error, 0
      filas porque `movimientos_poliza` está vacía — mecanismo probado, no bloqueado).
- [x] 2.6 Confirmado conteo de filas sin cambios vía `bocam_admin`
      (`asientos_contables`=5, `cuentas_contables`=16, resto=0).
- [x] 2.7 Smoke test con JWT real (antes de desplegar código): `GET /asientos` ya
      retorna solo 2 filas (RLS actuando incluso sin el `where` explícito en el
      código); `/dashboard` y `/cuentas` sin regresión.

## 3. Fix de código

- [x] 3.1 `main.ts:1677` (GAP-1) — agregado `where: { tenant_id, proyecto_id }`.
- [x] 3.2 `main.ts:110` (GAP-2, `persistMovimientosIfEligible`) — agregado
      `tenant_id`/`proyecto_id` al `count()`.
- [x] 3.3 Monitor SAT (`sat-pendientes`) — agregado `proyecto_id` al `findMany` y al
      `findFirst` anidado.
- [x] 3.4 `resolveBankReconciliationTarget`/`prevalidateBankReconciliation`/
      `reconcileBankMovement` — `proyectoId` agregado a la firma y a los 4 `where`
      internos; actualizados los 4 call sites (incluye 3 de `reconcileBankMovement` y
      1 de `prevalidateBankReconciliation` en el flujo dry-run).
- [x] 3.5 `conciliar-cfdi` — agregado `proyecto_id` a los 2 lookups (`asientoContable`,
      `conciliacionFiscal`).
- [x] 3.6 `tsc --noEmit` limpio en `apps/contabilidad`.

## 4. Tests

- [x] 4.1 `apps/contabilidad/test/integration/rls-asientos-scope.integration.test.ts`
      escrito (reproduce el escenario cross-tenant y cross-proyecto contra el endpoint
      HTTP real). **No ejecutado** — sin Postgres local en esta sesión; queda en el
      repo para correrlo cuando haya entorno local.

## 5. Deploy y cierre

- [x] 5.1 Commit (`898eec2`) + push a `origin main`.
- [x] 5.2 VPS: `git pull` + `docker compose build contabilidad` + `up -d`; contenedor
      `bocam-vps-contabilidad` healthy.
- [x] 5.3 Smoke test contra el código desplegado: `GET /asientos` retorna exactamente 2
      filas con `where` explícito; `/dashboard`, `/cuentas`, monitor SAT sin regresión.
- [x] 5.4 Memoria del hallazgo actualizada.
