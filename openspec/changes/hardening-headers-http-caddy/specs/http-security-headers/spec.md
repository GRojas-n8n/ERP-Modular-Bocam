## ADDED Requirements

### Requirement: Toda respuesta HTTP pública SHALL incluir headers de seguridad estándar
`docker/Caddyfile` SHALL agregar, para todo el tráfico de `iretum.com` y `www.iretum.com`, los headers `Strict-Transport-Security` (con `includeSubDomains`), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, y `Permissions-Policy` restrictiva por defecto, sin depender de que cada microservicio los agregue individualmente.

#### Scenario: Respuesta servida a través de Caddy
- **WHEN** un cliente hace una petición HTTPS a `iretum.com` o `www.iretum.com`, sin importar si la respuesta la sirve `app-shell` (assets estáticos) o cualquiera de los 13 microservicios vía el proxy interno
- **THEN** la respuesta SHALL incluir `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin` y `Permissions-Policy`

#### Scenario: Lector de código QR de asistencia
- **WHEN** el módulo de Personal/RH abre el lector de cámara para escanear la credencial QR de un empleado
- **THEN** el `Permissions-Policy` SHALL permitir `camera=(self)` explícitamente, sin bloquear el acceso a la cámara del propio origen `iretum.com`
