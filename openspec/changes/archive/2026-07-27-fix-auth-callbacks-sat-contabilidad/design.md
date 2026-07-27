## Context

`apps/contabilidad` integra con un adaptador SAT externo (validación de CFDI)
de forma asíncrona: un worker separado (`sat-worker.ts`, contenedor
`contabilidad-sat-worker`) llama SÍNCRONAMENTE hacia afuera al adaptador, y
llama DE VUELTA a la API de contabilidad (los 3 endpoints en cuestión) para
persistir el resultado. El adaptador externo nunca llama directamente a
contabilidad — el worker es el único llamador real de estos 3 endpoints.

Antes de este change: `getSatCallbackSecret()` = `SAT_CALLBACK_SHARED_SECRET
|| SAT_ADAPTER_API_KEY || ''` (colapsando dos límites de confianza distintos
en un valor), comparación `!==`, y `tenant_id`/`proyecto_id`/`id_conciliacion`
tomados del body sin verificación adicional.

## Goals / Non-Goals

**Goals:**
- Cerrar la falsificación cross-tenant: con el secreto comprometido, un
  atacante no debe poder declarar un tenant/fila arbitrarios.
- Comparación de secreto en tiempo constante, correctamente implementada
  (sin el error común de comparar `.length` primero).
- Cerrar la fuga de `sat_dispatch_id` en `claim-dispatch` — sin esto, el fix
  anterior no cierra nada.
- No introducir schema/migración/cambios a RLS.

**Non-Goals:**
- No se resuelve que el secreto sea un valor único de proceso en vez de una
  credencial por-tenant o firmada (HMAC) — evaluado y descartado, ver
  Decisión 3.
- No se pagina `GET /asientos` ni se toca ningún otro endpoint.

## Decisions

### Decisión 1: verificar `dispatch_id` en código (no tocar RLS)

`sat_dispatch_id` (`sat-<uuid4>`, generado server-side y persistido en la
fila ANTES de despachar, nunca enviado al adaptador externo) ya es
funcionalmente un token de un solo uso — solo faltaba verificarlo en 2 de los
3 endpoints (`claimSatDispatch` ya lo hacía correctamente).

Se evaluó extender `apps/contabilidad/prisma/rls-policies.sql` con un branch
`OR sat_dispatch_id = current_setting('app.sat_dispatch_lookup_id', true)`
para poder localizar la fila (y por tanto el tenant) a partir del
`dispatch_id` sin necesitar el `tenant_id` del body — se descartó:
- El predicado de autorización final es el mismo (comparar un `dispatch_id`
  guardado contra uno recibido), solo movido a SQL. No agrega seguridad real.
- Agrega un GUC nuevo cuyo único propósito es saltarse el aislamiento por
  tenant — un riesgo permanente para un archivo (`rls-policies.sql`) que se
  verificó cuidadosamente en el fix crítico de RLS de esta misma sesión.
- Requeriría una migración (índice sobre `sat_dispatch_id`, sin uno hoy) y no
  se puede verificar sin un Postgres real, que no está disponible esta
  sesión.

**Elegido**: mantener la localización por `tenant_id`+`id_conciliacion` del
body (necesario de cualquier forma — RLS exige contexto de tenant antes de
ver cualquier fila), y agregar `assertDispatchOwnership()` como verificación
post-carga dentro de la misma transacción de `createTenantContext` (sin
ventana TOCTOU entre el chequeo y la escritura).

### Decisión 2: rechazo indistinguible del "no encontrado" real

`SAT_DISPATCH_MISMATCH` se mapea al mismo código `CONT_SAT_NOT_FOUND` /
`404` que `SAT_RECONCILIATION_NOT_FOUND`. Un código distinto le confirmaría a
quien tenga el secreto comprometido que su `tenant_id`/`id_conciliacion` eran
correctos y solo falló el token — reduciendo el espacio de búsqueda del
ataque. El detalle sí se registra en el log del servidor (sin el valor del
`dispatch_id` recibido).

### Decisión 3: sin HMAC/firma, sin secreto por-tenant (por ahora)

Evaluado y descartado como parte de este change:
- **HMAC sobre el body**: defiende contra interceptación/tampering por un
  intermediario pasivo — no es la amenaza real aquí (el llamador es el
  propio worker de contabilidad; la amenaza es credencial comprometida, que
  compromete un HMAC exactamente igual que un secreto compartido).
- **Token de un solo uso independiente**: redundante — `sat_dispatch_id` ya
  cumple ese rol; construir uno nuevo sería duplicar el mecanismo en vez de
  empezar a usarlo.
- **Secreto por-tenant**: mejoraría el radio de impacto de una fuga, pero es
  un cambio de infraestructura mayor (gestión de credenciales por tenant) sin
  relación directa con el bug encontrado. Queda como posible mejora futura,
  no bloqueante.

### Decisión 4: quitar el fallback `SAT_ADAPTER_API_KEY`

Confirmado seguro: ninguna variable `SAT_*` está configurada en producción
hoy (logs de despliegue de esta sesión), ambos tests de integración
existentes ya fijan `SAT_CALLBACK_SHARED_SECRET` explícitamente, y los
`.env.*.example` ya documentan ambas variables por separado. El fallback solo
existía como conveniencia de configuración y colapsaba dos límites de
confianza (credencial saliente al adaptador vs. credencial entrante del
worker) en un valor.

### Decisión 5: comparación en tiempo constante vía hash

`crypto.timingSafeEqual` lanza `RangeError` si los buffers no miden lo mismo
— el error común de "primero comparar `.length`" tanto reintroduce el canal
lateral que se buscaba evitar como sigue siendo necesario para no toparse con
el `RangeError`. Se hashean ambos lados con SHA-256 antes de comparar, así
los buffers siempre miden 32 bytes y la función nunca lanza.

## Risks / Trade-offs

**[Riesgo] La ruta manual `POST /conciliaciones-fiscales/:id/validar-sat`
(JWT + `requireRoles('admin','finance')`) comparte la función
`applySatValidationResult` con el callback externo pero no tiene
`dispatch_id`** — descubierto durante la implementación (rompía `tsc`
inicialmente). Resuelto haciendo la verificación condicional: solo se exige
cuando `result.dispatch_id` está presente, lo cual el callback externo
garantiza en su propia validación de body ANTES de llamar a la función; la
ruta manual nunca pasa ese campo y por tanto nunca activa el chequeo — su
propio tenant/proyecto ya vienen de una sesión JWT autenticada, no de un body
sin autenticar.

**[Riesgo residual, aceptado]**: este fix cierra la falsificación
cross-tenant. Un usuario del MISMO tenant que lograra leer `sat_dispatch_id`
(hoy ningún endpoint autenticado lo proyecta) y que también tuviera el
secreto compartido podría forjar un callback para su propio tenant —
teórico hoy, motiva tratar `sat_dispatch_id` como secreto de aquí en adelante.

## Migration Plan

Sin migración de base de datos. Despliegue opcional (la integración no está
activa en producción); el código queda listo para cuando se configure
`SAT_CALLBACK_SHARED_SECRET`.

## Open Questions

Ninguna bloqueante. Ver Non-Goals del proposal para las líneas de trabajo
futuras explícitamente descartadas de este change (secreto por-tenant, HMAC).
