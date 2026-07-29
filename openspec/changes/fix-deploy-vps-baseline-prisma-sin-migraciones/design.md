## Context

Verificado por SSH real contra el VPS (`root@72.60.114.12`, llave
`~/.ssh/bocam_vps_key`) el 2026-07-29:

- Las 5 bases (`bocam_seguridad`, `bocam_ventas`, `bocam_contabilidad`,
  `bocam_almacen`, `bocam_control_proyectos`) NO tienen historial de
  migraciones aplicado. 4 de ellas ni siquiera tienen la tabla
  `_prisma_migrations`; `bocam_almacen` sí tiene la tabla pero **vacía**
  (0 filas) — mismo riesgo de P3005 que las otras 4 si se intentara
  `migrate deploy` hoy.
- Los nombres de tabla de los 5 `schema.prisma` locales (vía `@@map`)
  coinciden 1:1 con las tablas reales de cada base (mismo conteo, mismos
  nombres, verificado con `information_schema.tables`).
- Para `contabilidad` (la que bloquea el fix pendiente) se verificó
  además columna por columna contra `information_schema.columns`: las 5
  tablas y sus 96 columnas coinciden exactamente con lo declarado en
  `schema.prisma`. Para los otros 4 servicios se verificó a nivel de
  tabla + conteo de columnas (coincide), sin diff columna por columna
  exhaustivo — riesgo residual bajo pero no cero, ver Riesgos.
- El repo en el VPS (`/root/ERP-Modular-Bocam`) ya está en el commit
  `86f1cf3` (el `git pull` del workflow fallido sí corrió) — solo el
  contenedor de contabilidad no se reconstruyó.

## Goals / Non-Goals

**Goals:**
- Que `prisma migrate deploy` funcione sin intervención manual para los
  13 servicios backend, incluidos los 5 sin historial previo.
- No ejecutar ningún DDL contra las bases reales — solo operaciones de
  metadata (`migrate resolve --applied`).
- Desbloquear el deploy pendiente de `fix-rol-finance-conciliar-cfdi`.

**Non-Goals:**
- No se audita ni corrige contenido de datos (seeds, RLS policies) en
  este change — solo el mecanismo de tracking de migraciones.
- No se modifica el workflow `deploy-vps-backend.yml` para saltarse
  `migrate deploy` en servicios sin `migrations/` — perpetuaría el
  problema en vez de resolverlo (ver "Fuera de alcance" en proposal.md).
- No se corrige la anomalía de `bocam_almacen` (tabla `_prisma_migrations`
  vacía preexistente, origen desconocido) más allá de insertar el
  registro baseline correcto — no se investiga su causa histórica.

## Decisions

- **Generar el baseline vía `prisma migrate diff --from-empty
  --to-schema-datamodel schema.prisma --script`**, no vía `prisma db
  pull` + `migrate dev`. `db pull` introspectaría la base real
  (requeriría exponer `DATABASE_URL` de producción a la máquina local o
  correr el comando dentro del VPS); generar el baseline localmente
  desde el schema ya versionado es más simple y, dado que se verificó
  que el schema coincide con la base real, produce el mismo resultado
  sin necesitar credenciales de producción en el entorno local.
- **Aplicar el baseline con `prisma migrate resolve --applied
  <migracion>`, nunca `migrate deploy` directamente**, la primera vez
  que cada servicio pasa por este proceso. `resolve --applied` NO
  ejecuta el SQL de la migración, solo registra el nombre en
  `_prisma_migrations` como si ya se hubiera aplicado — es el mecanismo
  oficial de Prisma para "adoptar" bases preexistentes sin re-ejecutar
  DDL que ya corrió por otra vía (`db push`/SQL manual).
- **Orden de servicios**: `contabilidad` primero (desbloquea el fix ya
  commiteado y pusheado), luego los otros 4 en el orden que sea más
  cómodo — no hay dependencia entre ellos.
- **Verificación previa por servicio antes de generar cada baseline**:
  comparar tablas+columnas reales (`information_schema`) contra el
  `schema.prisma` correspondiente. Ya hecho para los 5 en esta sesión
  (ver Context) — no se repite en tasks salvo que algo cambie entre el
  diseño y la ejecución.
- **No tocar `bocam_control_obra`** (base legacy huérfana, dueña
  `bocam_admin` en vez de `bocam_app`, ya fusionada a
  `control-proyectos` según memoria `fusionar-control-obra-a-control-proyectos`) —
  fuera de alcance, no tiene contenedor activo correspondiente.

## Risks / Trade-offs

- [El `schema.prisma` local podría no reflejar un cambio de columna
  aplicado manualmente en producción que nunca se sincronizó de vuelta al
  repo] → Mitigación: verificación de tablas+columnas contra
  `information_schema` antes de generar cada baseline (ya hecha para los
  5 servicios en esta sesión); si algo no coincidiera, no se genera el
  baseline de ese servicio hasta resolver la discrepancia primero.
- [`bocam_almacen` tiene una tabla `_prisma_migrations` vacía de origen
  desconocido — un intento previo de baseline pudo quedar a medias] →
  Mitigación: el `INSERT` de `migrate resolve --applied` funciona igual
  con la tabla ya creada; se verifica que quede exactamente 1 fila
  después de la operación.
- [Ejecutar comandos contra las bases reales de producción por SSH es
  irreversible si algo sale mal] → Mitigación: `migrate resolve
  --applied` es una operación de metadata documentada como segura por
  Prisma (no DDL); se ejecuta un servicio a la vez, verificando el
  resultado (`SELECT * FROM _prisma_migrations`) antes de pasar al
  siguiente; se pausa explícitamente para confirmación del usuario antes
  de la primera ejecución real contra producción.

## Migration Plan

1. Generar localmente las 5 carpetas `migrations/<timestamp>_baseline/`
   con su `migration.sql` (sin tocar producción).
2. Commitear las 5 carpetas al repo.
3. Contra el VPS (`git pull` ya actualiza el checkout): por cada
   servicio, `docker compose -f docker-compose.vps.yml run --rm <svc>
   node_modules/.bin/prisma migrate resolve --applied
   <timestamp>_baseline --schema apps/<svc>/prisma/schema.prisma`.
4. Verificar `_prisma_migrations` tiene exactamente 1 fila
   `finished_at IS NOT NULL` por servicio.
5. Re-disparar el deploy de `contabilidad` (`workflow_dispatch` con
   `services=contabilidad`, o un nuevo push) para completar el fix de
   roles pendiente.

Rollback: si `resolve --applied` insertara un registro incorrecto,
`DELETE FROM _prisma_migrations WHERE migration_name = '<...>'` revierte
la operación sin efecto en el schema real (nunca se ejecutó DDL).
