## Why

Al cerrar el fix de RLS crítico de `contabilidad` (`openspec/changes/archive/2026-07-27-fix-rls-contabilidad-tablas-sin-cobertura`)
quedó documentado como no-objetivo un hallazgo separado: los 3 endpoints de
integración con el adaptador SAT externo
(`claim-dispatch`/`callback`/`failure-callback`) están exentos de JWT — su
llamador legítimo es el propio worker de contabilidad, no una sesión de
usuario — y se autenticaban solo con un secreto compartido GLOBAL
(`x-bocam-secret`), comparado con `!==` (no constante en tiempo), tomando
`tenant_id`/`proyecto_id`/`id_conciliacion` directo del body sin verificar
ningún dato adicional que ligara la petición a la fila específica que dice
representar. Con el secreto comprometido, cualquiera podía declarar
cualquier tenant y forjar una transición de estado de conciliación fiscal.

Confirmado por los logs de despliegue de esta sesión: ninguna variable
`SAT_*` está configurada en producción hoy — la vulnerabilidad es real en el
código pero la integración no está viva, bajando la urgencia sin eliminar la
necesidad de cerrarla antes de activarla.

**Hallazgo adicional descubierto al diseñar el fix**: `claim-dispatch`
regalaba el `sat_dispatch_id` real (un token de un solo uso generado
server-side, `sat-<uuid4>`, persistido en la fila antes de despachar) en su
respuesta incluso al rechazar un claim (`STALE_DISPATCH`). Verificar
`dispatch_id` en los otros 2 endpoints sin cerrar primero esta fuga no
hubiera servido de nada — un atacante lo habría cosechado ahí.

## What Changes

- Nuevo módulo `apps/contabilidad/src/sat-callback-auth.ts`: secreto sin
  fallback al secreto del adaptador externo, comparación en tiempo constante,
  middleware único montado sobre el mismo array que exime JWT.
- Nueva verificación `assertDispatchOwnership()`: el `dispatch_id` del body
  debe coincidir con el guardado en la fila (`sat_dispatch_id` o
  `sat_last_completed_dispatch_id`) antes de aplicar el callback de éxito o
  de falla — rechazo con el mismo código `404` que "no encontrado", sin señal
  distinguible.
- `claim-dispatch` deja de incluir `sat_dispatch_id` en su respuesta.
- Defensa en profundidad: bloqueo explícito de `/api/v1/contabilidad/integraciones/`
  en `apps/app-shell/nginx.conf` (el reverse proxy real de producción expone
  estas rutas a internet público hoy, aunque el llamador legítimo nunca pasa
  por ahí).
- **Sin migración de schema ni cambio a `rls-policies.sql`** — decisión de
  diseño explícita, ver `design.md`.

## Capabilities

### New Capabilities
- `integracion-sat-externa`: requisitos de seguridad para la autenticación de
  los endpoints de callback de la integración SAT (no existía spec previo
  para esta integración).

### Modified Capabilities
(ninguna)

## Impact

- **Código**: `apps/contabilidad/src/sat-callback-auth.ts` (nuevo),
  `apps/contabilidad/src/main.ts`, `apps/contabilidad/src/sat-worker.ts`,
  `apps/contabilidad/src/types.ts`, `apps/app-shell/nginx.conf`.
- **Tests**: 1 test unitario nuevo (ejecutado y en verde, sin
  infraestructura), 1 test de integración nuevo + 1 arreglado (escritos,
  commiteados, no ejecutados por falta de Postgres local esta sesión).
- **Sin redeploy forzoso**: la integración SAT no está activa en producción,
  el código queda listo para cuando se configure.
- **Precondición operativa registrada**: no configurar
  `SAT_CALLBACK_SHARED_SECRET` en producción ni levantar el perfil Docker
  `sat` hasta correr `test:integration:sat-callback-auth` en verde al menos
  una vez.

## Non-Goals

Este change no resuelve que el llamador de los 3 endpoints se identifique
únicamente por un secreto de proceso (no por-tenant, no HMAC/firma) — dado
que el llamador real es el propio worker de contabilidad (mismo despliegue),
no la amenaza de un intermediario pasivo, se evaluó y descartó introducir
HMAC en este change (ver `design.md`, Opciones C). Tampoco se pagina ni
modifica ningún otro comportamiento de la integración SAT.
