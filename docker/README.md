# docker/

Archivos de infraestructura Docker del ERP iRetum (Compose, Caddyfile, Dockerfiles
compartidos, scripts de entrypoint).

## Headers de seguridad HTTP (Caddyfile)

`Caddyfile` aplica en el único punto de entrada público (`iretum.com`,
`www.iretum.com`) los headers estándar: `Strict-Transport-Security`,
`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` y
`Permissions-Policy` (openspec: `hardening-headers-http-caddy`).

**Pendiente a propósito, no olvidado:** `Content-Security-Policy` queda fuera de
ese change. Un CSP mal armado en una SPA con Vite (que puede requerir
`'unsafe-inline'` según la config de build) es la forma más común de romper una
aplicación en producción con headers de seguridad. Antes de agregarlo:

1. Desplegarlo primero en modo `Content-Security-Policy-Report-Only` para medir
   impacto real sin bloquear nada.
2. Confirmar que no rompe el build de Vite ni el lector de código QR por cámara
   (Personal/RH, `camera=(self)` en `Permissions-Policy`).
3. Solo entonces pasar a un CSP bloqueante.

Debe quedar como un change de OpenSpec propio — no improvisarlo dentro de otro
cambio.
