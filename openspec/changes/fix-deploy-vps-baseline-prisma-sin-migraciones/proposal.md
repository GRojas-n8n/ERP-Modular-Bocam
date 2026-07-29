## Why

El primer deploy real de un cambio en `apps/contabilidad` a través del
pipeline automatizado nuevo (`.github/workflows/deploy-vps-backend.yml`,
commit `86f1cf3`, change `fix-rol-finance-conciliar-cfdi`) falló con
`Error P3005: The database schema is not empty`. El paso "Desplegar
servicios afectados" corre incondicionalmente `prisma migrate deploy`
para cualquier servicio con `schema.prisma` (línea 196-199 del workflow),
pero **5 de los 13 microservicios backend — `seguridad`, `ventas`,
`contabilidad`, `almacen`, `control-proyectos` — no tienen ninguna
carpeta `prisma/migrations/`**: su esquema real en el VPS se creó
siempre vía `prisma db push` + SQL manual (ej.
`apps/contabilidad/prisma/add_cuenta_2200.sql`), nunca hubo historial de
migraciones trackeado. Prisma no encuentra ninguna migración que
reconciliar contra una base ya poblada y se niega a continuar (P3005 es
justamente la protección oficial contra "aplicar migrate deploy sobre
una base no vacía sin baseline").

Esto no es específico de contabilidad ni de este fix de roles: **el
deploy automático de cualquiera de esos 5 servicios fallará exactamente
igual la próxima vez que cambien**, dejando el pipeline nuevo
efectivamente inútil para el 38% del backend. El fix de roles de
`fix-rol-finance-conciliar-cfdi` sigue sin llegar a producción por esta
causa.

## What Changes

- Para cada uno de los 5 servicios sin `migrations/`, generar una
  migración inicial ("baseline") que represente el estado actual de su
  `schema.prisma` (`prisma migrate diff --from-empty
  --to-schema-datamodel schema.prisma --script`), commitearla en
  `apps/<servicio>/prisma/migrations/<timestamp>_baseline/migration.sql`.
- Verificar, antes de generar cada baseline, que el `schema.prisma` local
  no ha divergido de la base real del VPS (los SQL manuales tipo
  `add_cuenta_2200.sql` pudieron aplicar cambios que nunca se reflejaron
  de vuelta al schema) — introspección contra la base real
  (`prisma db pull` a un schema temporal, diff manual) antes de confiar
  en el schema del repo como fuente de verdad para el baseline.
- En la base real de cada uno de los 5 servicios en el VPS, marcar la
  migración baseline como ya aplicada vía `prisma migrate resolve
  --applied <nombre>` — **esto no ejecuta ningún DDL**, solo inserta el
  registro de metadata en `_prisma_migrations`; es el procedimiento
  oficial de Prisma para "adoptar" una base de datos preexistente
  (https://pris.ly/d/migrate-baseline).
- Tras el baseline, re-ejecutar el deploy fallido de contabilidad
  (`fix-rol-finance-conciliar-cfdi`, commit `86f1cf3`) para confirmar que
  ahora sí llega a producción.
- **Fuera de alcance**: cambiar el workflow para no correr `migrate
  deploy` en servicios sin `migrations/` — se descarta porque perpetuaría
  el problema de raíz (estos 5 servicios seguirían sin historial
  trackeado) en vez de resolverlo.

## Capabilities

### New Capabilities
- `ci-deploy-vps-prisma-baseline`: los 13 microservicios backend con `schema.prisma` tienen historial de migraciones Prisma trackeado y baseline aplicado en sus bases reales del VPS, de forma que `prisma migrate deploy` en el pipeline automatizado funciona para cualquiera de ellos sin intervención manual.

### Modified Capabilities
(ninguna — `despliegue-completo-microservicios` cubre la inicialización
de una base de datos nueva vía `db push` *o* `migrate deploy`, no la
mecánica del pipeline de CI que ahora exige `migrate deploy`
incondicionalmente; es una capability distinta, no se modifica su
contrato)

## Impact

- **Código afectado:** `apps/{seguridad,ventas,contabilidad,almacen,control-proyectos}/prisma/migrations/` (carpetas nuevas).
- **Producción:** se ejecuta `prisma migrate resolve --applied` contra las 5 bases reales del VPS — operación de metadata, sin DDL, pero toca producción directamente y requiere acceso SSH real.
- **Bloquea**: el deploy pendiente de `fix-rol-finance-conciliar-cfdi` (task 4.1) depende de que este fix se complete primero.
- **Riesgo**: si el `schema.prisma` local divergió de la base real de alguno de los 5 servicios, el baseline generado no reflejaría el estado real — se verifica contra la base real antes de generar cada migración, no se asume el schema del repo como fuente de verdad.
