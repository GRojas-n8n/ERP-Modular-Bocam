## 1. Test que reproduce el bug (primero, en rojo)

- [x] 1.1 En `apps/finanzas/test/e2e/seguridad.e2e.test.ts`,
      `testLimitExceededPresupuesto`: cambiar `roles: ['finance']` a
      `roles: ['finanzas']` (el rol real) — confirmado en rojo contra el
      código actual: `FIN_FORBIDDEN` en vez de `FIN_LIMIT_EXCEEDED`.
- [x] 1.2 Igual en `apps/finanzas/test/e2e/idempotencia.e2e.test.ts`,
      `buildFinanceToken` — confirmado que con el token `['finanzas']` el
      endpoint `POST /pagos` (uno de los 6 afectados) también fallaba
      antes del fix.

## 2. Fix

- [x] 2.1 `apps/finanzas/src/main.ts` línea ~231 (`POST /presupuestos`):
      `'finance'` → `'finanzas'` en `rolesAutorizados` y en el mensaje de
      error.
- [x] 2.2 Línea ~331 (`POST /movimientos`): mismo cambio.
- [x] 2.3 Línea ~487 (`POST /transferencias-presupuestales`): mismo
      cambio.
- [x] 2.4 Línea ~1074 (`POST /pagos`): mismo cambio.
- [x] 2.5 Línea ~1199 (`POST /pagos/bulk`): mismo cambio.
- [x] 2.6 Línea ~1260 (`PATCH /pagos/:id/pagar`): `'finance'` →
      `'finanzas'` en `rolesAutorizados` y en el mensaje de error.
      → Verificado con grep: 0 ocurrencias de `'finance'` restantes en
      `apps/finanzas/src/main.ts`.

## 3. Verificación

- [x] 3.1 Tests de la sección 1 en verde.
- [x] 3.2 `tsc --noEmit` en `apps/finanzas` limpio.
- [x] 3.3 Suite completa de tests de `finanzas` (2 e2e + 5 integration)
      en verde, sin regresión.
- [x] 3.4 CI (`backend-e2e`) detectó que 9 tests de integración de OTROS
      servicios (`apps/control-proyectos`, `apps/contabilidad`) construían
      su token de prueba con `roles: ['finance']` para simular a un
      usuario de Finanzas llamando a los 6 endpoints ahora corregidos —
      quedaron en rojo tras el fix (403). Corregidos:
      `apps/control-proyectos/test/integration/finanzas.pago-registrado.integration.test.ts`
      y 8 archivos en `apps/contabilidad/test/integration/` (`finanzas.pago-registrado`,
      `finanzas.transferencia`, `finanzas.pago-cfdi.conciliacion`,
      `finanzas.pago-sat-externo`, `finanzas.pago-sat-worker`,
      `finanzas.pago-sat-banco.conciliacion`, `finanzas.banco-lote.conciliacion`,
      `finanzas.banco-archivo.conciliacion`) → `roles: ['finanzas']`.
      6 de estos archivos reusan el mismo token para además llamar
      `POST /api/v1/contabilidad/asientos/:id/conciliar-cfdi`, que tiene su
      propio gate `requireRoles('admin', 'finance')` en
      `apps/contabilidad/src/main.ts:1948` — bug análogo pero en otro
      servicio, fuera de alcance de este change (ver design.md). Para no
      romper esos 6 tests sin arreglar el bug de contabilidad, sus tokens
      quedaron con `roles: ['finanzas', 'finance']` (ambos), con comentario
      explicando por qué. Verificado `tsc --noEmit` limpio en
      `apps/contabilidad` y `apps/control-proyectos`, y los 8 tests +
      el de control-proyectos en verde tras el ajuste (32+9 = 41 tests
      totales entre los 3 servicios tocados).

## 4. Cierre

- [x] 4.1 PR contra `main`, CI verde, merge.
      → PR #76 mergeado (squash `a4b28e7`). Primer intento de CI falló
      (9 tests de otros servicios con el rol ficticio 'finance' — ver
      3.4); segundo commit lo corrigió, CI verde.
- [x] 4.2 Redeploy VPS de `finanzas` (build + `up -d`, sin migración).
      → Hecho 2026-07-16: build limpio, contenedor recreado, healthy,
      logs limpios (conectado a RabbitMQ, sin errores de arranque).
