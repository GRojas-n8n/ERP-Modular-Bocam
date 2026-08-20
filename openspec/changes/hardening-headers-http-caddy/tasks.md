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

**Hallazgo #1 (2026-08-20):** ni `deploy-vps.yml` (frontend) ni `deploy-vps-backend.yml` (backend) reinician o recargan el contenedor `caddy` — ambos solo reconstruyen `app-shell`/los microservicios. El `docker/Caddyfile` con los headers estaba en `main` desde hace tiempo, pero nunca llegó a producción porque nada le pedía a Caddy releer su configuración. Se creó `.github/workflows/deploy-vps-caddy.yml` para cerrar ese hueco.

**Hallazgo #2, el real bloqueante (2026-08-20):** la primera versión del workflow usaba `caddy reload`, que corría sin ningún error — pero los headers seguían sin aparecer, incluso pegándole a Caddy directo desde el propio VPS (bypass de Cloudflare, para descartar que el problema fuera ahí). Diagnóstico: `md5sum docker/Caddyfile` (repo) ≠ `md5sum /etc/caddy/Caddyfile` (dentro del contenedor) — el contenedor seguía viendo una versión del Caddyfile **sin ningún bloque `header`**. Causa: el compose monta `./docker/Caddyfile:/etc/caddy/Caddyfile:ro` como bind mount de un archivo individual, que Docker ata al *inodo* que existía al crear el contenedor. `git merge`/`checkout` reemplaza el archivo vía write-nuevo-archivo + `rename()` (no lo edita in-place), así que el inodo cambia — el contenedor quedó viendo el contenido viejo para siempre, sin importar cuántas veces se le pidiera `reload`. `caddy reload` solo le pide al proceso releer *su propio* archivo montado, que nunca cambió desde su perspectiva.

**Fix:** el workflow pasa a `docker compose up -d --force-recreate caddy` (recrea el contenedor con un bind mount fresco) en vez de `caddy reload`. Implica un corte de conexión breve (~1-2s) al liberar y volver a bindear :80/:443 — inevitable dado el problema real (no hay forma de refrescar un bind mount de archivo sin recrear el contenedor que lo tiene).

- [x] 3.1 Desplegado `docker/Caddyfile` a producción vía `deploy-vps-caddy.yml` (con el fix de `--force-recreate`, probado primero en una rama de diagnóstico separada antes de mergear a `main`).
- [x] 3.2 Verificado con `curl -I https://iretum.com` en producción — los 5 headers están presentes (`Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`). El paso de verificación del workflow también quedó en verde.
- [ ] 3.3 Verificar manualmente en `iretum.com` que login, navegación general y el lector QR de asistencia siguen funcionando. (pendiente — sigue necesitando verificación humana en navegador, el workflow no la cubre)

## 4. Seguimiento

- [x] 4.1 Documentar en el `README` de `docker/` la decisión de dejar CSP fuera de este change.
