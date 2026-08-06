## Context

`docker/Caddyfile` es el único bloque que maneja `iretum.com, www.iretum.com` y hace
`reverse_proxy app-shell:80`. Todo el tráfico público (frontend + las 13 APIs, que
`nginx.conf` dentro de `app-shell` enruta internamente) pasa por este único punto de
entrada. No existe hoy ningún directorio de headers de seguridad, ni en Caddy ni en
`helmet` (no es dependencia de ningún microservicio). El módulo de Personal/RH tiene
un lector de código QR por cámara del navegador (asistencia por QR, ver memoria
`hallazgo-asistencia-qr-decorativo-sin-facial` — ya resuelto, la cámara es real), así
que cualquier `Permissions-Policy` no puede bloquear `camera` de forma global.

## Goals / Non-Goals

**Goals:**
- Agregar los headers de seguridad HTTP estándar (HSTS, nosniff, frame-ancestors,
  referrer-policy, permissions-policy) en el único punto de entrada, sin tocar
  microservicios.
- No romper ningún flujo existente de la SPA (build de Vite, fetch a los 13 APIs,
  lector de cámara QR).

**Non-Goals:**
- No se implementa `Content-Security-Policy` bloqueante en esta iteración — se dejan
  las decisiones de CSP documentadas como pregunta abierta y, si se implementa, se
  hace primero en modo `Content-Security-Policy-Report-Only` para medir impacto
  antes de bloquear nada.
- No se agrega `helmet` a los microservicios en este change.
- No se cambia el comportamiento de `encode gzip zstd` ni el `reverse_proxy` actual.

## Decisions

**1. Headers en Caddy, no en cada microservicio (`helmet`).** Alternativa
considerada: agregar `helmet` en los 13 `main.ts`. Se descarta como primer paso
porque duplicaría configuración 13 veces para un resultado idéntico al de un único
bloque en Caddy, que además cubre cualquier respuesta servida directamente por
`app-shell` (assets estáticos) que `helmet` en un microservicio de backend no
cubriría de todos modos.

**2. HSTS con `max-age` largo pero sin `preload` inicialmente.** Se usa
`Strict-Transport-Security: max-age=31536000; includeSubDomains` (1 año). No se
agrega `preload` en esta iteración porque enviarlo a la lista de precarga de
navegadores es effectivamente irreversible durante meses — se deja como paso
posterior una vez confirmado que HTTPS es estable en todos los subdominios.

**3. `X-Frame-Options: DENY` + no usar `frame-ancestors` en CSP todavía.** El ERP no
tiene ningún caso de uso legítimo de ser embebido en un `<iframe>` de otro sitio.
`DENY` es más simple que definir CSP completo solo para este propósito.

**4. `Permissions-Policy` restrictiva por defecto, con excepción explícita para
`camera=(self)`** (usado por el lector QR de asistencia) y `geolocation=()`,
`microphone=()`, `payment=()` deshabilitados — el ERP no usa ninguno de esos.

**5. CSP se deja fuera de esta iteración (Non-Goal), no se improvisa.** Un CSP mal
armado en una SPA con Vite (que puede requerir `'unsafe-inline'` para estilos
inyectados según configuración de build) es la forma más común de romper una
aplicación en producción con headers de seguridad. Se prefiere entregar el resto de
headers (bajo riesgo, alto valor) ahora, y tratar CSP como su propio change con
`Report-Only` primero.

## Risks / Trade-offs

- [Riesgo] HSTS con `includeSubDomains` podría afectar algún subdominio futuro que
  no esté listo para HTTPS → Mitigación: hoy solo existen `iretum.com` y
  `www.iretum.com`, ambos ya sirven por HTTPS vía Caddy automático.
- [Riesgo] `Permissions-Policy` con `camera=(self)` demasiado angosto si el lector
  QR se abre desde un `<iframe>` interno → Mitigación: verificar en el flujo de
  pruebas manuales (tarea de `tasks.md`) que el lector QR sigue funcionando tras el
  despliegue.
- [Trade-off] No incluir CSP en esta iteración deja sin cubrir el vector de XSS que
  CSP normalmente mitiga → aceptado conscientemente; se prioriza no romper
  producción sobre cobertura completa en el primer paso.

## Open Questions

- ¿Se quiere programar un change de seguimiento para `Content-Security-Policy`
  en modo `Report-Only`, o se considera suficiente el resto de headers por ahora?
