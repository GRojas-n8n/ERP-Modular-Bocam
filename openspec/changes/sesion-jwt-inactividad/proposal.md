## Why

Hoy el access token ya expira a los 15 minutos (`JWT_ACCESS_EXPIRATION`), pero
el frontend lo renueva automáticamente y en silencio: el interceptor de
`api.ts` llama a `/api/v1/auth/refresh` en cualquier 401, y el refresh token
es *rolling* — cada uso emite uno nuevo válido otros 7 días. El resultado es
que, mientras el usuario genere al menos una petición cada 7 días, la sesión
se renueva indefinidamente sin que exista ningún mecanismo de expiración por
inactividad ni un límite absoluto de duración. Una pestaña abierta toda la
noche, o un usuario que se aleja de su escritorio sin cerrar sesión, deja la
sesión activa indefinidamente — riesgo de seguridad en equipos compartidos o
de obra.

## What Changes

- **Frontend**: nuevo listener de actividad del usuario (`mousemove`,
  `keydown`, `click`, `scroll`) con un temporizador configurable (default 15
  minutos, `VITE_INACTIVITY_TIMEOUT_MIN`). Sin actividad durante ese tiempo,
  el sistema limpia `localStorage` (access + refresh token), cierra la sesión
  en el estado de la app y redirige a la pantalla de login con un aviso
  "Tu sesión se cerró por inactividad" — sin esperar a que una petición HTTP
  falle con 401.
- **Backend `apps/auth`**: el refresh token deja de ser indefinidamente
  rolling. Se agrega `sesion_iniciada_en` a `RefreshToken`, poblado en el
  login original y **propagado sin resetear** en cada rotación. El endpoint
  `POST /api/v1/auth/refresh` rechaza la renovación si
  `ahora - sesion_iniciada_en` excede un máximo configurable
  (`JWT_MAX_SESSION_HOURS`, default 16h) — forzando un login nuevo aunque el
  usuario haya estado activo sin interrupción, para que ninguna sesión
  sobreviva de un día para otro.
- **BREAKING** (solo de comportamiento, no de contrato): sesiones que hoy
  persistirían más de `JWT_MAX_SESSION_HOURS` dejarán de renovarse
  automáticamente y exigirán volver a iniciar sesión.

## Capabilities

### New Capabilities
- `sesion-jwt-inactividad`: expiración de sesión por inactividad en frontend
  y límite absoluto de duración de sesión (independiente de actividad) en el
  refresh token de `apps/auth`.

### Modified Capabilities
(ninguna — no existe spec previo para el flujo de sesión/refresh)

## Impact

- **Backend `apps/auth`**: `prisma/schema.prisma` (`RefreshToken.sesion_iniciada_en`),
  migración aditiva, `src/main.ts` (login y refresh — poblar/propagar el
  campo, rechazar refresh fuera del máximo).
- **Frontend `apps/app-shell`**: nuevo hook/listener de inactividad (probable
  ubicación `src/context/TenantContext.tsx` o un hook dedicado
  `useInactivityLogout`), sin agregar dependencias nuevas (se implementa con
  listeners nativos — no hay ninguna librería de idle-detection instalada
  hoy).
- **Sin cambios** en el TTL del access token (15 min) ni en el mecanismo de
  refresh reactivo ya existente — este cambio es aditivo sobre ambos.
