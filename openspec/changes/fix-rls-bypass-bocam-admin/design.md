## Context

Los 12 microservicios (`auth`, `calidad`, `compras`, `contabilidad`,
`control-obra`, `control-proyectos`, `finanzas`, `gerencia-tecnica`,
`personal`, `seguridad`, `ventas`, `almacen`) tienen cada uno su propia base
de datos Postgres en el mismo servidor (`bocam_auth`, `bocam_compras`, etc.),
pero los 12 usan el mismo rol de conexión `bocam_admin`
(`SUPERUSER`, `rolbypassrls=true`). De esos 12, **9 tienen políticas RLS
declaradas** (`rls-policies.sql`: auth, calidad, compras, control-obra,
finanzas, gerencia-tecnica, personal, seguridad, ventas) que nunca se
aplicaron de verdad porque el rol que las ejecuta las bypasea. Los otros 3
(`contabilidad`, `almacen`, `control-proyectos`) no tienen `rls-policies.sql`
todavía — ese es un gap distinto, fuera de alcance aquí (no hay política que
activar).

Cada microservicio corre en su propio contenedor Docker; las migraciones de
Prisma se aplican manualmente por SSH con
`docker exec <contenedor> npx prisma migrate deploy`, usando la misma
`DATABASE_URL` que la app en runtime — no existe hoy un rol separado para
migraciones vs. runtime.

## Goals / Non-Goals

**Goals:**
- El rol de conexión de cada microservicio deja de poder bypasear RLS.
- Las 9 políticas RLS existentes empiezan a aplicar de verdad, sin tocar su
  SQL.
- Rollout sin downtime más allá de un restart breve por contenedor, y con
  posibilidad de detenerse/revertir entre cada servicio.
- `bocam_admin` sigue disponible para operación manual (psql, backups).

**Non-Goals:**
- No se escriben políticas RLS nuevas para `contabilidad`, `almacen`,
  `control-proyectos` (gap aparte).
- No se audita ni corrige el código de cada endpoint para agregar filtro
  explícito `tenant_id`/`proyecto_id` (mitigación puntual ya aplicada en
  `envio-oc-correo-proveedores`; el resto queda pendiente de auditoría, no es
  parte de este change).
- No se crean roles separados por microservicio ni un rol distinto para
  migraciones — se mantiene un solo rol compartido (`bocam_app`), mismo
  modelo que hoy.

## Decisions

**1. Un solo rol `bocam_app` compartido por las 12 bases, no 12 roles.**
Los roles de Postgres son a nivel de clúster, no de base — un mismo login
puede tener distintos privilegios en cada base según qué objetos posea en
cada una. Usar un solo rol replica exactamente el modelo de credenciales
actual (una sola credencial "de aplicación"), minimiza el diff operativo
(una sola contraseña que rotar, una sola entrada de rol que auditar) y no fue
pedido un modelo de más privilegio mínimo por servicio. Alternativa
descartada: rol por microservicio — más "least privilege" en teoría, pero
12x superficie de credenciales a gestionar sin que el proposal lo pidiera.

**2. `bocam_app` queda como OWNER de los objetos (vía `REASSIGN OWNED BY`),
no solo con GRANTs de DML.** Las migraciones de Prisma (`ALTER TABLE`,
`CREATE TABLE`) siguen corriendo con la misma `DATABASE_URL` de la app — si
`bocam_app` no fuera owner, necesitaría un rol de migración aparte
(fuera de alcance). Ser owner + no-superusuario es exactamente lo que activa
`FORCE ROW LEVEL SECURITY` (ya declarado en cada `rls-policies.sql`): esa
cláusula solo tiene efecto sobre el dueño de la tabla cuando el dueño no es
superusuario.

**3. Rollout escalonado servicio por servicio, empezando por `compras`.**
`compras` es el único servicio con un test de integración que reproduce el
bug (`orden-compra-enviar-correo.integration.test.ts`, tarea 3.5 del change
`envio-oc-correo-proveedores`) y el único ya verificado localmente contra
Postgres real con RLS aplicado. Sirve de canario: si algo rompe (ver Riesgo
1), se detecta ahí antes de tocar los otros 8 servicios con RLS.
Orden sugerido tras `compras`: `gerencia-tecnica`, `auth`, `finanzas`,
`control-obra`, `personal`, `seguridad`, `calidad`, `ventas` — luego, con
menor urgencia (no tienen políticas RLS que activar, es solo higiene de
privilegio), `contabilidad`, `almacen`, `control-proyectos`.

**4. Reasignar ownership ANTES de cambiar `DATABASE_URL`, no al mismo
tiempo.** `REASSIGN OWNED BY` no afecta a `bocam_admin` (sigue siendo
superusuario, sigue viendo todo sin importar el dueño) — así que ese paso es
seguro de ejecutar sin coordinación con el restart del contenedor. El cambio
de `DATABASE_URL` + restart es el único paso con impacto en runtime, y es el
que se hace uno a la vez con verificación entre cada uno.

## Risks / Trade-offs

**[Riesgo 1 — el más importante] Activar RLS de verdad por primera vez puede
romper flujos legítimos que hoy "funcionan" solo porque el bypass ocultaba un
mismatch.** Las políticas actuales son `tenant_id = current_tenant_id() AND
proyecto_id = current_proyecto_id()` — asumen un `proyecto_id` de sesión
siempre válido. Si algún rol (ej. `procurement`/`admin` con vista
multi-proyecto, o una sesión sin proyecto activo) hace hoy una consulta con
`current_proyecto_id()` vacío o distinto al de los datos que espera ver, el
bypass se lo permitía; con RLS real, esa consulta devolverá 0 filas
silenciosamente (no un error) en vez de los datos esperados.
→ Mitigación: el checklist de verificación por servicio (ver tasks.md) no
solo repite el test de fuga cross-proyecto — también ejercita los flujos de
listado/dashboard normales de ese servicio con un usuario real antes de
considerarlo "verificado", específicamente buscando respuestas vacías
inesperadas.

**[Riesgo 2] `REASSIGN OWNED BY` en una base con tablas grandes podría tomar
un lock más largo de lo esperado.** → Mitigación: es un cambio de catálogo
(no reescribe filas), normalmente milisegundos; aun así se ejecuta en horario
de bajo tráfico y se mide el tiempo de cada `REASSIGN` antes de continuar al
siguiente servicio.

**[Riesgo 3] Contraseña de `bocam_app` en tránsito/almacenamiento.** →
Mitigación: se genera con el mismo mecanismo ya usado para `bocam_admin` en
este VPS, se escribe directo en el `.env` del servidor (nunca en el repo,
igual que las credenciales existentes).

**[Trade-off] Los 3 servicios sin RLS (`contabilidad`, `almacen`,
`control-proyectos`) migran de rol pero no ganan aislamiento nuevo** — se
documenta como gap aparte, no se resuelve aquí.

## Migration Plan

1. Crear `bocam_app` (`CREATE ROLE bocam_app LOGIN PASSWORD '...' NOSUPERUSER
   NOBYPASSRLS NOCREATEDB NOCREATEROLE;`) — una sola vez, a nivel de clúster.
2. Por servicio (empezando por `compras`):
   a. `\c bocam_<servicio>` → `REASSIGN OWNED BY bocam_admin TO bocam_app;`
   b. Confirmar ownership (`\dt` muestra `bocam_app` como Owner).
   c. Editar `<SERVICIO>_DATABASE_URL` en `.env` del VPS → usuario `bocam_app`.
   d. `docker compose -f docker-compose.vps.yml --profile core up -d
      <servicio>` (recrea solo ese contenedor).
   e. Verificar (ver tasks.md): health check, test de aislamiento (si
      aplica), smoke test de flujos normales del servicio.
   f. Si falla: revertir `DATABASE_URL` a `bocam_admin`, `up -d <servicio>`
      de nuevo — vuelve al estado anterior sin tocar los demás servicios.
3. Repetir 2 para el resto de los 8 servicios con RLS, luego los 3 sin RLS.

## Open Questions

- ¿Alguno de los roles de aplicación (`procurement`, `admin`,
  `superintendent`) tiene hoy un flujo real de "ver todos los proyectos de mi
  tenant sin filtrar por uno solo" que dependía implícitamente del bypass?
  No se pudo confirmar sin acceso a los flujos de negocio reales — se trata
  como Riesgo 1 y se verifica empíricamente por servicio, en vez de
  asumir la respuesta de antemano.
