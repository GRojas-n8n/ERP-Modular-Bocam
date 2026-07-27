## 1. Auditoría y diseño

- [x] 1.1 Auditoría completa de código (2 agentes + verificación directa):
      confirmados los 3 endpoints, el secreto global con fallback, la ausencia
      de verificación de `dispatch_id` en 2 de los 3, y el hallazgo crítico
      adicional (fuga de `sat_dispatch_id` en la respuesta de `claim-dispatch`).
- [x] 1.2 Confirmado por los logs de despliegue de esta sesión: ninguna
      variable `SAT_*` configurada en producción hoy — feature inactiva,
      baja la urgencia sin eliminar la necesidad del fix.
- [x] 1.3 Verificado directamente (no solo por el agente): `docker/Caddyfile`
      reenvía todo a `app-shell:80`, cuya config real es
      `apps/app-shell/nginx.conf` — confirma que estos endpoints SÍ son
      alcanzables desde `iretum.com` hoy.
- [x] 1.4 Decisión de diseño: verificar `dispatch_id` en código (Opción A),
      no tocar `rls-policies.sql` (Opción B) — ver design.md. HMAC/firma y
      secreto por-tenant evaluados y descartados para este change.

## 2. Implementación

- [x] 2.1 Nuevo `apps/contabilidad/src/sat-callback-auth.ts`:
      `getSatCallbackSecret()` sin fallback, `safeSecretEquals()` en tiempo
      constante (SHA-256 + `timingSafeEqual`), `requireSatCallbackSecret()`
      middleware.
- [x] 2.2 `apps/contabilidad/src/types.ts` — `dispatch_id` requerido en
      `SatValidationCallbackRequest`.
- [x] 2.3 `apps/contabilidad/src/main.ts`:
      - `assertDispatchOwnership()` nueva, verifica contra `sat_dispatch_id`
        Y `sat_last_completed_dispatch_id`.
      - Llamada dentro de `registerSatFailure` (siempre) y
        `applySatValidationResult` (condicional a que `dispatch_id` esté
        presente — necesario porque esa función también la usa la ruta
        manual `validar-sat`, JWT-protegida, sin concepto de dispatch;
        hallazgo hecho durante la implementación, ver design.md Riesgos).
      - Middleware de `INTEGRATION_CALLBACK_PATHS` reescrito para exigir
        `requireSatCallbackSecret` en el mismo punto que exime JWT.
      - Eliminados los 3 bloques de autenticación duplicados.
      - Validación de `dispatch_id` requerido agregada al body de `callback`
        y `failure-callback`.
      - Branch `SAT_DISPATCH_MISMATCH` → 404 (mismo código que "no
        encontrado") en ambos `catch`, con log del lado servidor.
      - `sat_dispatch_id` eliminado de la respuesta de `claim-dispatch`.
- [x] 2.4 `apps/contabilidad/src/sat-worker.ts` — usa el import en vez de la
      función duplicada.
- [x] 2.5 `apps/app-shell/nginx.conf` — bloque `deny` para
      `/api/v1/contabilidad/integraciones/`, confirmado antes que
      `CONTABILIDAD_BASE_URL` apunta a la red interna de Docker
      (`.env.vps.example`), no a este nginx.
- [x] 2.6 `tsc --noEmit` limpio en `apps/contabilidad` (encontró y corrigió el
      conflicto con la ruta manual `validar-sat` antes de cerrar la tarea).

## 3. Tests

- [x] 3.1 Arreglado `finanzas.pago-sat-externo.integration.test.ts` (agregado
      `dispatch_id` faltante en el body simulado).
- [x] 3.2 Nuevo `test/unit/sat-callback-auth.test.ts` — 8 aserciones,
      **ejecutado y en verde** (sin infraestructura), incluye la prueba de
      regresión del `RangeError` de `timingSafeEqual` con longitudes
      distintas.
- [x] 3.3 Nuevo `test/integration/sat-callback-auth.integration.test.ts` — 7
      casos (forja con dispatch_id inventado, dispatch_id correcto, rama
      `sat_last_completed_dispatch_id`, dispatch_id faltante, secreto
      incorrecto/ausente, claim-dispatch ya no filtra el token,
      failure-callback con dispatch_id inventado). **Escrito y commiteado,
      no ejecutado** — sin Postgres local en esta sesión (decisión confirmada
      con el usuario).

## 4. Cierre

- [x] 4.1 Commit (`c597939`) + push a `origin main`.
- [x] 4.2 Precondición operativa registrada: no configurar
      `SAT_CALLBACK_SHARED_SECRET` en producción ni levantar el perfil `sat`
      hasta correr `sat-callback-auth.integration.test.ts` en verde al menos
      una vez.
- [x] 4.3 Memoria actualizada marcando este hallazgo (documentado
      originalmente como no-objetivo del fix de RLS de `contabilidad`) como
      resuelto.
