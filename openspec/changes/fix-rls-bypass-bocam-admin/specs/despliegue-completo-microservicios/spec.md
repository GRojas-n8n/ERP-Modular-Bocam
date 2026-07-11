## MODIFIED Requirements

### Requirement: Todo microservicio con datos propios SHALL tener base de datos inicializada
Un microservicio cuyo schema Prisma define modelos con `tenant_id` SHALL tener su
propia base de datos Postgres creada, con el schema aplicado (`prisma db push` o
`migrate deploy`) y las políticas RLS correspondientes aplicadas, antes de recibir
tráfico real. Cuando ese microservicio tiene políticas RLS declaradas, el rol de
Postgres que usa su `DATABASE_URL` en producción SHALL ser no-superusuario y SHALL
tener `rolbypassrls=false` — un rol superusuario o con `BYPASSRLS` vuelve inertes
las políticas RLS sin importar que estén correctamente declaradas y con
`FORCE ROW LEVEL SECURITY`.

#### Scenario: Variable de entorno de base de datos vacía
- **WHEN** la variable `<SERVICIO>_DATABASE_URL` de un microservicio está vacía o no
  configurada en el `.env` del VPS
- **THEN** el microservicio cae al valor por defecto (`localhost` u otro fallback
  incorrecto) y toda operación que toque base de datos falla — esto SHALL detectarse
  como brecha crítica y corregirse creando la base de datos y configurando la
  variable real

#### Scenario: Rol de conexión con privilegios de bypass sobre RLS
- **WHEN** el rol usado en `<SERVICIO>_DATABASE_URL` de un microservicio con
  políticas RLS declaradas tiene `rolsuper=true` o `rolbypassrls=true`
  (verificable con `SELECT rolsuper, rolbypassrls FROM pg_roles WHERE
  rolname = '<rol_de_la_conexion>'`)
- **THEN** se considera una brecha crítica de aislamiento — las políticas RLS
  de ese microservicio no filtran ninguna consulta pese a existir en el
  schema — y SHALL corregirse migrando la conexión de ese microservicio a un
  rol sin esos privilegios, dueño de sus propios objetos
  (`REASSIGN OWNED BY <rol_anterior> TO <rol_nuevo>`)

#### Scenario: Rol de conexión correctamente restringido
- **WHEN** el rol usado en `<SERVICIO>_DATABASE_URL` de un microservicio con
  políticas RLS declaradas tiene `rolsuper=false` y `rolbypassrls=false`, y es
  dueño de las tablas sobre las que aplican esas políticas
- **THEN** las políticas RLS declaradas SHALL aplicar realmente sobre toda
  consulta hecha por ese microservicio en tiempo de ejecución
