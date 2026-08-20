## 1. Configuración de Caddy

- [x] 1.1 Agregar bloque `header` en `docker/Caddyfile` con `Strict-Transport-Security: max-age=31536000; includeSubDomains`.
- [x] 1.2 Agregar `X-Content-Type-Options: nosniff`.
- [x] 1.3 Agregar `X-Frame-Options: DENY`.
- [x] 1.4 Agregar `Referrer-Policy: strict-origin-when-cross-origin`.
- [x] 1.5 Agregar `Permissions-Policy` con `camera=(self)` (lector QR), `geolocation=()`, `microphone=()`, `payment=()`.

## 2. Verificación local

- [x] 2.1 Confirmado con el `docker/Caddyfile` real, sin modificar: se levantó un contenedor `caddy:2-alpine` aislado (red Docker propia, backend `nginx:alpine` alias `app-shell` para satisfacer `reverse_proxy app-shell:80`, sitio adaptado a `:80` en vez de `iretum.com` para evitar el flujo ACME/TLS automático — el bloque `header` es idéntico al de producción, sin tocar). `caddy adapt` confirma el handler `headers` con los 5 valores correctos cargados desde el archivo real. `curl -I` contra el contenedor confirma los 5 headers presentes en la respuesta proxied (`Server: nginx/...` confirma que el `reverse_proxy` sigue funcionando): `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`. Contenedores y red de prueba eliminados al terminar.
- [ ] 2.2 Verificar en navegador que el lector QR de asistencia (Personal/RH) sigue pidiendo y usando la cámara con normalidad. (pendiente — junto con la verificación final en producción)
- [ ] 2.3 Verificar que la SPA carga sin errores de consola nuevos. (pendiente — junto con la verificación final en producción)

## 3. Despliegue

**Hallazgo (2026-08-20):** ni `deploy-vps.yml` (frontend) ni `deploy-vps-backend.yml` (backend) reinician o recargan el contenedor `caddy` — ambos solo reconstruyen `app-shell`/los microservicios. El `docker/Caddyfile` con los headers ya está en `main` desde el merge de `fix/finanzas-rbac-saga-fondos`, pero nunca llegó a producción porque nada le pedía a Caddy releer su configuración. Se creó `.github/workflows/deploy-vps-caddy.yml`: dispara en push a `main` sobre `docker/Caddyfile`, hace `caddy reload` (no `up -d`/recreate, para no soltar el bind en :80/:443 ni cortar sesiones activas) y verifica con `curl -I` que los 5 headers quedaron presentes antes de dar el job por bueno.

- [ ] 3.1 Desplegar `docker/Caddyfile` a producción — vía el nuevo workflow `deploy-vps-caddy.yml` (push a `main` con ese archivo, o `workflow_dispatch` manual). Pendiente de que el workflow se mergee a `main` y corra al menos una vez.
- [ ] 3.2 Verificar con `curl -I https://iretum.com` en producción que los headers están presentes. El paso 5 del workflow nuevo ya lo hace automáticamente en cada corrida; falta la primera corrida real.
- [ ] 3.3 Verificar manualmente en `iretum.com` que login, navegación general y el lector QR de asistencia siguen funcionando. (pendiente — sigue necesitando verificación humana en navegador, el workflow no la cubre)

## 4. Seguimiento

- [x] 4.1 Documentar en el `README` de `docker/` la decisión de dejar CSP fuera de este change.
