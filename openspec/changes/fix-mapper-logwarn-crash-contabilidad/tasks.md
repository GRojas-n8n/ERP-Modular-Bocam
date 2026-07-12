## 1. Reproducir el bug

- [x] 1.1 Aplicar `prisma db push` al schema `contabilidad` de una base local
      limpia (sin sembrar `cuentas_contables`) y correr
      `npm run test:integration:finanzas-pago-cfdi -w @bocam/contabilidad`.
      Confirmar que falla con `TypeError: Cannot read properties of null
      (reading 'securityContext')` en `packages/observability/src/index.ts`
      (`extractBaseContext`), con stack hasta `resolveCuentaId`
      (`apps/contabilidad/src/mapper.ts`).
      Confirmado (stack completo capturado agregando temporalmente
      `error.stack` al catch de `packages/event-bus/src/index.ts`, revertido
      después): `TypeError` en `extractBaseContext` → `writeStructuredLog` →
      `logWarn` → `resolveCuentaId` (`mapper.ts:53`) →
      `persistMovimientos` (`mapper.ts:93`) → `persistMovimientosIfEligible`
      (`main.ts:107`) → `handlePagoRegistradoEvent` (`main.ts:1191`).

## 2. Fix del logger en mapper.ts

- [x] 2.1 Reemplazar las 3 llamadas `logWarn(null as any, 'contabilidad',
      ...)` en `apps/contabilidad/src/mapper.ts` (`resolveCuentaId` línea
      53, `persistMovimientos` líneas 71 y 97) por `console.warn(JSON
      .stringify({ action, ...campos }))`, mismo patrón estructurado que ya
      usan los manejadores de eventos en `apps/contabilidad/src/main.ts`
      para sus warnings de `invalid_payload`.
- [x] 2.2 Quitar el import de `logWarn` de `packages/observability/src` en
      `mapper.ts` (ya no se usa en el archivo).
- [x] 2.3 Re-correr el test de 1.1 (aún sin sembrar el catálogo) y confirmar
      que ahora pasa en verde por el camino de degradación: el asiento y la
      conciliación fiscal se crean, la línea de póliza sin cuenta resuelta
      se omite silenciosamente (solo advertencia en logs, sin excepción).
      Confirmado: `ok - integracion real finanzas.pago_registrado ->
      contabilidad concilia CFDI y cierra estatus fiscal`, con 3 warnings
      estructurados en logs (`cuenta_not_found` x2, `cuenta_missing` x1) y
      sin excepción.

## 3. Sembrar el catálogo de cuentas en CI

- [x] 3.1 Agregar un paso "Seed catálogo de cuentas contables" en
      `.github/workflows/backend-e2e.yml`, inmediatamente después de "Push
      Prisma schemas", que aplique
      `apps/contabilidad/prisma/seed_catalogo_cuentas.sql` vía `psql` contra
      `postgresql://postgres:postgres@localhost:5432/bocam_ci?schema=contabilidad`.
- [x] 3.2 Verificar localmente: aplicar `seed_catalogo_cuentas.sql` a la
      base local de `contabilidad` y volver a correr
      `test:integration:finanzas-pago-cfdi`. Confirmar que ahora pasa por
      el camino feliz (las líneas de póliza SÍ se crean con su
      `cuenta_id` resuelto, no se omiten).
      Confirmado: test en verde sin ningún warning de `cuenta_not_found`/
      `cuenta_missing`, y `movimientoPoliza.count()` pasó de 0 a 2 (línea
      de cargo + línea de abono de la póliza EGRESO).

## 4. Verificación de regresión

- [x] 4.1 Correr localmente, con el catálogo sembrado, el mismo conjunto de
      tests de integración inter-módulo que corre
      `.github/workflows/backend-e2e.yml` (paso "Run inter-module RabbitMQ
      integration") para `apps/contabilidad` — confirmar 0 regresiones.
      12/12 ok (finanzas-pago, compras-oc, compras-oc-cancelada,
      finanzas-compromiso-conciliacion, finanzas-liberacion-conciliacion,
      finanzas-pago-cfdi, finanzas-sat-externo, finanzas-sat-worker,
      finanzas-sat-banco, finanzas-banco-lote, finanzas-banco-archivo,
      finanzas-transferencia).
- [x] 4.2 `npx tsc --noEmit -p apps/contabilidad/tsconfig.json` limpio.
      Sin errores.

## 5. Cierre

- [x] 5.1 Push y confirmar que el workflow `Backend E2E Criticas` pasa en
      verde en el PR (primera vez que pasa desde que se tiene registro en
      este repo, según `gh run list`).
      Confirmado: run 29176247687, `backend-e2e` pass en 2m29s, PR #39.
- [x] 5.2 Abrir PR contra `main` desde branch
      `fix/mapper-logwarn-crash-contabilidad`. PR #39 abierto.
- [ ] 5.3 Redeploy manual del contenedor `contabilidad` en el VPS tras
      mergear (backend no tiene CI/CD) — no urgente, sin incidente activo
      en producción relacionado a este bug.
