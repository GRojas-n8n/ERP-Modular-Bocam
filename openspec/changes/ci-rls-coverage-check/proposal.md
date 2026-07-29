## Why

El mismo gap — una tabla nueva con `tenant_id` sin política RLS — se encontró y corrigió cinco veces por separado, siempre a mano, en cinco microservicios distintos (`personal` 2026-07-26, `compras` y `gerencia-tecnica` 2026-07-26/27, `contabilidad` y `almacen` 2026-07-27). El requisito ya está documentado explícitamente en `openspec/specs/despliegue-completo-microservicios/spec.md` ("Todo microservicio con datos propios SHALL tener base de datos inicializada... el `rls-policies.sql` del servicio SHALL extenderse cada vez que se agregue una tabla tenant-scoped"), pero nada lo hace cumplir automáticamente — depende de que alguien vuelva a auditar a mano. Sin un chequeo automatizado, es cuestión de tiempo antes de que aparezca una sexta tabla sin cobertura, esta vez sin que nadie la note antes de producción.

## What Changes

- Agregar un script (`scripts/ci/check-rls-coverage.js`) que, para cada uno de los 11 microservicios con `prisma/schema.prisma` propio, compara los modelos que tienen un campo `tenant_id` contra las tablas cubiertas por `ENABLE ROW LEVEL SECURITY` + al menos una `CREATE POLICY` en su `prisma/rls-policies.sql`, y reporta cualquier tabla tenant-scoped sin cobertura.
- Agregar un paso de CI que corra este script en cada pull request y falle si encuentra al menos una tabla sin cobertura.
- El chequeo es estático (parsea `schema.prisma` y `rls-policies.sql` como texto) — no requiere una base de datos viva ni desplegar los 11 microservicios en el runner de CI, a diferencia de correr `pg_policies` contra una base real.

## Capabilities

### New Capabilities
- `ci-rls-coverage-check`: script y paso de CI que detecta tablas Prisma con `tenant_id` sin política RLS declarada en el `rls-policies.sql` de su microservicio, y falla el pull request correspondiente.

### Modified Capabilities
(ninguna — no cambia el requisito ya existente en `despliegue-completo-microservicios`, solo automatiza su verificación)

## Impact

- **Nuevo:** `scripts/ci/check-rls-coverage.js`, un job/step nuevo en CI (workflow existente o nuevo, a decidir en design.md).
- **No afecta:** `rls-policies.sql` ni `schema.prisma` de ningún microservicio — el chequeo es de solo lectura. Si el barrido histórico ya cerró todos los gaps conocidos (ver memoria), el script debe pasar en verde desde el primer commit sin requerir ningún fix adicional.
- **Fuera de alcance:** verificar que las políticas declaradas en `rls-policies.sql` realmente estén aplicadas en la base de datos de cada entorno (eso ya lo cubre el requisito de "rol de conexión sin `BYPASSRLS`" del mismo spec, y los tests de integración `rls-*.integration.test.ts` existentes) — este script solo verifica que el archivo versionado declare la política, no que se haya desplegado.
