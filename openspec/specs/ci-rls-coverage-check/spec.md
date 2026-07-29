# ci-rls-coverage-check Specification

## Purpose
TBD - created by archiving change ci-rls-coverage-check. Update Purpose after archive.
## Requirements
### Requirement: CI SHALL detectar tablas Prisma tenant-scoped sin política RLS declarada
El sistema de CI SHALL ejecutar, en cada pull request, un chequeo estático que compare los modelos Prisma con campo `tenant_id` de cada uno de los microservicios con `prisma/schema.prisma` propio contra las tablas cubiertas por `ENABLE ROW LEVEL SECURITY` y al menos una `CREATE POLICY` en el `rls-policies.sql` de ese mismo microservicio, y SHALL fallar el check si encuentra al menos una tabla sin cobertura completa.

#### Scenario: Modelo nuevo con tenant_id sin política RLS
- **WHEN** un pull request agrega un modelo Prisma con un campo `tenant_id` a `apps/<servicio>/prisma/schema.prisma` y no agrega la `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` ni la `CREATE POLICY` correspondiente en `apps/<servicio>/prisma/rls-policies.sql`
- **THEN** el chequeo de CI falla y reporta explícitamente el nombre del servicio y de la tabla sin cobertura

#### Scenario: Modelo con tenant_id y ENABLE ROW LEVEL SECURITY pero sin ninguna política
- **WHEN** una tabla tenant-scoped tiene `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` en `rls-policies.sql` pero ningún `CREATE POLICY` la referencia
- **THEN** el chequeo de CI la reporta como cobertura incompleta, distinguiendo en el mensaje que falta la política y no solo la bandera de habilitación

#### Scenario: Modelo con tenant_id y cobertura completa
- **WHEN** una tabla tenant-scoped tiene `ENABLE ROW LEVEL SECURITY` y al menos una `CREATE POLICY` declarados en el `rls-policies.sql` de su servicio
- **THEN** el chequeo de CI no la reporta como gap

#### Scenario: Modelo catálogo sin tenant_id
- **WHEN** un modelo Prisma no tiene campo `tenant_id` (ej. un catálogo global compartido entre tenants)
- **THEN** el chequeo de CI no exige ninguna política RLS para esa tabla, sin necesidad de ninguna anotación o comentario adicional en el schema

#### Scenario: PR que no toca ningún schema.prisma ni rls-policies.sql
- **WHEN** un pull request no modifica archivos dentro de `apps/*/prisma/schema.prisma` ni `apps/*/prisma/rls-policies.sql`
- **THEN** el chequeo sigue corriendo (es determinista sobre el estado del repo, no solo sobre el diff) pero no debería reportar gaps nuevos si no había gaps antes

#### Scenario: Microservicio nuevo con base de datos propia
- **WHEN** se agrega un microservicio nuevo con su propio `apps/<servicio>/prisma/schema.prisma`
- **THEN** el chequeo lo incluye automáticamente en la siguiente corrida sin requerir cambios al script (descubrimiento dinámico vía los directorios `apps/*/prisma/`)

### Requirement: El script de chequeo SHALL ser ejecutable localmente sin dependencias de infraestructura
El script que implementa el chequeo SHALL poder ejecutarse desde la línea de comandos (`node scripts/ci/check-rls-coverage.js`) sin requerir una base de datos, variables de entorno, ni ningún servicio corriendo, para que un desarrollador pueda verificar cobertura antes de abrir un pull request.

#### Scenario: Ejecución local sin infraestructura
- **WHEN** un desarrollador ejecuta el script localmente en un checkout limpio del repo, sin Docker ni Postgres corriendo
- **THEN** el script produce el mismo resultado (lista de gaps o "sin gaps") que produciría en CI

