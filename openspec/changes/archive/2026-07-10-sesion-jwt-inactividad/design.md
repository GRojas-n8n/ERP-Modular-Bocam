## Context

Confirmado en código: `apps/app-shell/src/lib/api.ts:21-49` guarda los
tokens en `localStorage` (`iretum_access_token`, `iretum_refresh_token`).
El interceptor (`api.ts:80-143`) refresca de forma **reactiva** — solo
cuando una petición HTTP recibe 401 — sin ningún `setInterval` proactivo.
`TenantContext.tsx:93-103` escucha `iretum:session-expired` y limpia el
estado (`isAuthenticated=false`), lo que provoca el redirect a login por
render condicional, no por `navigate()`.

`apps/auth/src/main.ts:429-555` (`POST /auth/refresh`) rota el refresh
token en cada uso: revoca el usado (línea 502-505) y crea uno nuevo con
`expires_at` recalculado a `JWT_REFRESH_EXPIRATION` (default 7d) desde
`ahora`. No existe ningún campo que recuerde cuándo empezó la sesión
original — cada rotación "resetea el reloj".

## Goals / Non-Goals

**Goals:**
- Logout automático en frontend tras N minutos sin interacción real del
  usuario (no solo sin tráfico HTTP).
- Límite absoluto de duración de sesión en backend, independiente de qué
  tan activo esté el usuario.
- Configurable vía variables de entorno, sin hardcodear los minutos/horas.

**Non-Goals:**
- No se cambia el TTL del access token (15 min) ni el mecanismo de refresh
  reactivo existente.
- No se implementa un "aviso previo" (modal "tu sesión está por expirar, ¿sigues ahí?")
  en esta primera versión — el cierre es directo. Se deja como posible
  mejora futura si el negocio lo pide.
- No se toca el login/refresh de otros microservicios — todos comparten el
  mismo `apps/auth` como emisor de tokens, así que el cambio aplica
  transversalmente sin tocar cada servicio.

## Decisions

### 1. Inactividad: listeners nativos, sin librería nueva
`apps/app-shell/package.json` no tiene ninguna librería de idle-detection
(`react-idle-timer` u otra). Se implementa con `window.addEventListener`
sobre `mousemove`, `keydown`, `click`, `scroll` (con `{ passive: true }`),
cada uno reiniciando un único `setTimeout`. Al disparar: `clearTokens()` +
limpiar estado de `TenantContext` + redirect a login con mensaje distinto
al de "sesión expirada por TTL" (para que el usuario entienda la causa).
- **Alternativa descartada**: agregar `react-idle-timer` como dependencia.
  Se descarta porque el requerimiento es simple (un timer que se reinicia)
  y no justifica una dependencia nueva en un proyecto que ya evita
  librerías no esenciales en `app-shell`.
- El timeout es configurable vía `VITE_INACTIVITY_TIMEOUT_MIN` (default 15,
  igual al TTL del access token — coincidencia intencional pero
  independiente: uno es del token, el otro es de interacción del usuario).

### 2. Límite absoluto de sesión: campo propagado, no recalculado
Se agrega `sesion_iniciada_en DateTime?` a `RefreshToken`. En el **login**
(`main.ts` línea ~252) se puebla con `new Date()`. En **cada rotación**
(`main.ts` línea ~515) se copia el valor del token anterior — **no se
recalcula** — para que el reloj de "cuándo empezó esta sesión" nunca se
reinicie mientras el usuario simplemente sigue usando la app.
`POST /auth/refresh` valida `ahora - sesion_iniciada_en <= JWT_MAX_SESSION_HOURS`
(default 16h) antes de emitir el nuevo par de tokens; si se excede,
responde 401 con el mismo código `AUTH_REFRESH_INVALID` ya usado para
refresh inválido (el frontend ya sabe manejar ese código — no requiere un
código nuevo).
- **Alternativa descartada**: derivar el límite del `created_at` del primer
  `RefreshToken` de la cadena (buscar hacia atrás). Se descarta porque
  requeriría mantener una relación de "token padre" entre rotaciones
  (más complejo) cuando simplemente propagar un valor logra lo mismo.
- 16h como default: cubre una jornada laboral extendida sin permitir que la
  sesión llegue viva hasta el día siguiente. Configurable por si el negocio
  prefiere un valor distinto (ej. 8h o 24h).

### 3. Interacción entre ambos mecanismos
Son independientes y se complementan: la inactividad del frontend cierra
sesión aunque el refresh token siga siendo válido (usuario que se aleja);
el límite absoluto del backend cierra sesión aunque el usuario esté activo
sin parar (evita persistencia indefinida). Cualquiera de los dos que se
dispare primero gana.

## Risks / Trade-offs

- **[Riesgo]** Un usuario con trabajo sin guardar (formulario largo) puede
  perderlo si la inactividad lo desloguea a media captura.
  → **Mitigación**: 15 minutos es el mismo umbral que ya tiene el TTL del
    access token hoy (el usuario ya convive con esa expiración); no es un
    cambio agresivo respecto al comportamiento percibido actual. Vistas con
    formularios largos quedan fuera del alcance de este cambio (no se pide
    autoguardado aquí).
- **[Riesgo]** `JWT_MAX_SESSION_HOURS` mal configurado (muy bajo) podría
  desloguear a un usuario a medio turno de trabajo activo.
  → **Mitigación**: default conservador (16h, cubre turnos extendidos);
    configurable por entorno sin requerir cambio de código.
- **[Riesgo]** Pestañas múltiples del mismo usuario: el logout por
  inactividad en una pestaña no se propaga automáticamente a otras pestañas
  abiertas del mismo navegador (los listeners son por `window`).
  → **Mitigación**: dado que los tokens viven en `localStorage`
    (compartido entre pestañas del mismo origen), cuando la pestaña inactiva
    limpia el token, las otras pestañas lo notarán en su siguiente petición
    HTTP (401 → `iretum:session-expired`) — no es instantáneo entre
    pestañas pero no queda una sesión "zombie" indefinidamente. No se
    implementa sincronización vía `storage` event en esta primera versión.

## Open Questions
Ninguna — valores default (15 min inactividad, 16h sesión máxima) son
una decisión de producto razonable documentada arriba; ajustables sin
cambio de código si el usuario prefiere otros valores.
