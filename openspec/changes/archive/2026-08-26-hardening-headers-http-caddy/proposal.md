## Why

Una auditoría de seguridad (2026-08-06) encontró que ningún response de `iretum.com`
incluye headers de seguridad HTTP más allá del HTTPS automático que Caddy provee por
defecto. No hay `Strict-Transport-Security` (HSTS) explícito, `X-Content-Type-Options`,
`X-Frame-Options`/`frame-ancestors`, ni `Referrer-Policy`. `docker/Caddyfile` hoy solo
tiene `reverse_proxy app-shell:80` + `encode gzip zstd` — sin ningún bloque `header`.
Como Caddy es el único punto de entrada público (todo el tráfico de `iretum.com` pasa
por ahí antes de llegar a `app-shell` y de ahí a los 13 microservicios vía nginx
interno), agregar los headers en un solo lugar cubre el 100% del tráfico sin tocar
ningún microservicio individualmente.

## What Changes

- Agregar un bloque `header` en `docker/Caddyfile` con: `Strict-Transport-Security`
  (HSTS con `includeSubDomains`), `X-Content-Type-Options: nosniff`,
  `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, y
  `Permissions-Policy` restrictiva para APIs de navegador no usadas (cámara,
  micrófono, geolocalización — excepto donde el ERP los use, ver design.md por el
  lector QR de asistencia que sí necesita cámara).
- Evaluar `Content-Security-Policy` por separado en `design.md` — es el header de
  mayor riesgo de romper la SPA en producción si se configura mal (scripts inline,
  Vite, etc.), por lo que necesita más cuidado que los demás.
- **Fuera de alcance:** headers a nivel de aplicación (`helmet` en cada
  microservicio) — se evalúa en un change separado si Caddy no cubre algún caso
  (ej. respuestas servidas directamente por un microservicio sin pasar por Caddy en
  desarrollo local).

## Capabilities

### New Capabilities
- `http-security-headers`: headers de seguridad HTTP estándar aplicados en el
  proxy de entrada (Caddy) a todo el tráfico de `iretum.com`.

### Modified Capabilities
*(ninguna — no cambia ningún requisito de despliegue por microservicio, es
  configuración del proxy compartido)*

## Impact

- **Modificado:** `docker/Caddyfile` únicamente.
- **Sin cambios en:** ningún microservicio, ningún `main.ts`, ninguna dependencia
  nueva de Node — es configuración pura de Caddy.
- **Riesgo de romper la SPA:** un CSP mal configurado puede bloquear scripts/estilos
  de Vite en producción — por eso CSP se trata con cuidado adicional en `design.md`
  y se puede desplegar en modo `Content-Security-Policy-Report-Only` primero.
