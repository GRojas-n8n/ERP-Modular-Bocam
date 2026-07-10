## Context

`apps/compras` usa Row Level Security (RLS) en Postgres para varias tablas
(`requisiciones`, `ordenes_compra`, `cuadros_comparativos`, etc. — ver
`prisma/rls-policies.sql`), filtrando por `tenant_id` y `proyecto_id` vía
`set_config('app.current_proyecto_id', ...)` dentro de `createTenantContext`.
La tabla `solicitudes_cotizacion` **no** tiene política RLS — no aparece en
`rls-policies.sql`. El único filtro real sobre `proyecto_id` para esta tabla
es el valor que el propio código de la aplicación decide escribir.

El endpoint `POST /api/v1/compras/requisiciones/:reqId/solicitud-cotizacion`
(`main.ts:623-722`) recibe `proyectoId` del `securityContext` (derivado del
JWT del usuario — su "proyecto activo" de sesión, no necesariamente el de la
requisición que está procesando) y lo usa tal cual al crear la
`SolicitudCotizacion` (`main.ts:704`), sin haber leído el `proyecto_id` real
de la requisición (el `SELECT` en `main.ts:648-651` ni siquiera lo trae).

## Goals / Non-Goals

**Goals:**
1. `SolicitudCotizacion.proyecto_id` SHALL ser siempre el de la requisición de
   origen, sin importar el proyecto activo de la sesión del usuario.
2. Si por alguna razón el `proyecto_id` resuelto no es válido, el endpoint
   responde 400 con un mensaje claro, no un error interno de Prisma.

**Non-Goals:**
- No se agrega política RLS a `solicitudes_cotizacion` — sería un cambio de
  infraestructura de seguridad más amplio, fuera del bug reportado.
- No se cambia cómo se resuelve el `proyectoId` de `securityContext` en el
  middleware de auth (`packages/auth-middleware`) — ese es otro servicio,
  fuera del alcance de este fix puntual en `compras`.
- No se toca `createTenantContext({ proyectoId: securityContext.proyectoId })`
  — sigue usándose para el contexto RLS de sesión (afecta lectura de
  `requisiciones`, que si tiene RLS); solo cambia qué valor se escribe en el
  campo `proyecto_id` del registro creado.

## Decisions

**D1 — Seleccionar `proyecto_id` en el SELECT de la requisición y usarlo en el
`create()`, en vez de `securityContext.proyectoId`.**
Cambio mínimo y directo: la requisición ya se está leyendo en el handler
(`main.ts:648-651`) para validar que existe y pertenece al tenant — solo hace
falta incluir `proyecto_id` en el `select` y usar ese valor, no el de sesión.
Alternativa considerada — cambiar el JWT/middleware para que `procurement`
siempre tenga un `proyecto_id` válido: se descartó por ser un cambio de
alcance mucho mayor (afecta a `auth` y a todos los endpoints tenant-level, no
solo a este), y no resolvería el bug de fondo (usuario con proyecto activo
distinto al de la requisición seguiría escribiendo el proyecto equivocado).

**D2 — Validar formato UUID antes del `create()`, devolver 400 si falla.**
Defensa en profundidad: si en el futuro algún otro campo llega vacío o
corrupto, el usuario ve un mensaje de error claro ("proyecto de la requisición
inválido") en vez de un stack trace de Prisma expuesto en el frontend.

**D3 — Extraer la resolución de `proyecto_id` a una función pura testeable
(`solicitud-cotizacion-policy.ts`), en vez de un test de integración con BD
real.**
Los tests existentes de `compras` (`test/integration/*.test.ts`,
`test/e2e/*.test.ts`) requieren una base de datos Postgres local con las
migraciones del servicio aplicadas. Al intentar levantar ese entorno se
encontró que el mirror local de `docker-compose.vps.yml` corriendo en esta
máquina no tiene `.env` configurado (`COMPRAS_DATABASE_URL` vacío en el
contenedor) y su historial de migraciones está inconsistente (`prisma migrate
deploy` falla con `P3018` porque intenta aplicar una migración que asume
tablas base ya creadas). No es seguro ni apropiado intentar reparar ese
entorno local a ciegas como parte de este bug-fix — es infraestructura
preexistente de estado desconocido, no algo introducido por este cambio.
Alternativa adoptada: igual que en el fix de `auth` de hoy
(`project-access-policy.ts`), se extrae la lógica de decisión (qué
`proyecto_id` usar) a una función pura sin dependencia de Prisma/BD, testeada
con `node:test` — cubre exactamente el bug reportado (mismatch/vacío en
sesión) sin necesitar infraestructura de base de datos.

## Risks / Trade-offs

| Riesgo | Mitigación |
|---|---|
| Posible interacción con RLS si `requisiciones` sí tiene política activa en producción y el `current_proyecto_id` de sesión no coincide con el real de la requisición — el `SELECT` podría no encontrar la fila para usuarios tenant-level con otro proyecto activo | Fuera de alcance de este fix (toca `createTenantContext`/RLS, no la lectura del valor); si se confirma como problema real, es un change aparte sobre el modelo de RLS para roles tenant-level |
| El "upsert" (rama `existing`) del mismo endpoint no reescribe `proyecto_id` en el `update()` — no se ve afectado por este bug ya que no vuelve a escribir ese campo | Ninguna acción necesaria, ya es correcto |

## Migration Plan

1. Test de integración que reproduce el bug (JWT con proyecto activo distinto
   al de la requisición real) — debe fallar contra el código actual.
2. Fix en `main.ts`.
3. Verificar que el test pasa y que los tests de integración existentes de
   `compras` no se rompen.
4. **Rollback:** revertir el commit — no hay migración de datos.
