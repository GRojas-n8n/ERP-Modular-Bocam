## ADDED Requirements

### Requirement: Todo microservicio backend con schema.prisma SHALL tener historial de migraciones baseline en su base real del VPS
Los 13 microservicios backend con `apps/<servicio>/prisma/schema.prisma` SHALL tener una carpeta `prisma/migrations/` con al menos una migración baseline versionada en el repo, y su base de datos real en el VPS SHALL tener esa migración registrada como aplicada en `_prisma_migrations`, de forma que el paso `prisma migrate deploy` del pipeline automatizado (`deploy-vps-backend.yml`) no falle con `P3005` la primera vez que ese servicio recibe un deploy a través de él.

#### Scenario: Servicio sin carpeta migrations recibe su primer deploy automatizado
- **WHEN** un microservicio con `schema.prisma` pero sin carpeta `migrations/` recibe un push a `main` que toca su código
- **THEN** el paso "Desplegar servicios afectados" del workflow SHALL completar `prisma migrate deploy` sin error `P3005`

#### Scenario: Base real ya poblada sin historial de migraciones
- **WHEN** la base de datos real de un microservicio en el VPS ya tiene tablas creadas (vía `db push` o SQL manual) pero su `_prisma_migrations` no tiene ninguna fila
- **THEN** SHALL existir una migración baseline registrada como aplicada (`migrate resolve --applied`) que reconcilie el estado, sin haber ejecutado DDL adicional sobre esas tablas

#### Scenario: Migración baseline generada localmente coincide con la base real
- **WHEN** se genera la migración baseline de un servicio a partir de su `schema.prisma` (`prisma migrate diff --from-empty --to-schema-datamodel`)
- **THEN** las tablas y columnas que esa migración crearía SHALL coincidir exactamente con las tablas y columnas reales de la base de producción de ese servicio (verificado contra `information_schema` antes de aplicar el baseline)

#### Scenario: Deploy futuro de un servicio ya baseline-ado
- **WHEN** un servicio con baseline ya aplicado recibe una migración nueva real (cambio de schema)
- **THEN** `prisma migrate deploy` SHALL aplicarla normalmente sin necesitar intervención manual, exactamente igual que los 8 servicios que ya tenían historial de migraciones antes de este change
