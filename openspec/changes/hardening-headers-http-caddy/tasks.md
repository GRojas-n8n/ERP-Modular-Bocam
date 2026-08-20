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

- [ ] 3.1 Desplegar `docker/Caddyfile` a producción (recarga de Caddy, sin downtime esperado). (pendiente — deploy final)
- [ ] 3.2 Verificar con `curl -I https://iretum.com` en producción que los headers están presentes. (pendiente)
- [ ] 3.3 Verificar manualmente en `iretum.com` que login, navegación general y el lector QR de asistencia siguen funcionando. (pendiente)

## 4. Seguimiento

- [x] 4.1 Documentar en el `README` de `docker/` la decisión de dejar CSP fuera de este change.
