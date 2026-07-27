## MODIFIED Requirements

### Requirement: Todo microservicio con datos propios SHALL tener base de datos inicializada
Un microservicio cuyo schema Prisma define modelos con `tenant_id` SHALL tener su
propia base de datos Postgres creada, con el schema aplicado (`prisma db push` o
`migrate deploy`) y las políticas RLS correspondientes aplicadas, antes de recibir
tráfico real. Cuando ese microservicio tiene políticas RLS declaradas, el rol de
Postgres que usa su `DATABASE_URL` en producción SHALL ser no-superusuario y SHALL
tener `rolbypassrls=false` — un rol superusuario o con `BYPASSRLS` vuelve inertes
las políticas RLS sin importar que estén correctamente declaradas y con
`FORCE ROW LEVEL SECURITY`. Este requisito SHALL cubrir también cualquier tabla con
`tenant_id` agregada DESPUÉS del despliegue inicial del microservicio (ej. por una
feature nueva) — el `rls-policies.sql` del servicio SHALL extenderse cada vez que se
agregue una tabla tenant-scoped, no solo mantenerse al día de su primera versión.

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

#### Scenario: Tabla nueva agregada por una feature posterior al despliegue inicial
- **WHEN** una feature nueva agrega un modelo Prisma con `tenant_id` (y opcionalmente
  `proyecto_id`) a un microservicio que ya tiene `rls-policies.sql`
- **THEN** esa tabla SHALL recibir su propia política antes de considerarse la feature
  lista para producción; una tabla con `tenant_id` y `relrowsecurity=false` en
  producción SHALL tratarse como brecha de seguridad, no como pendiente de higiene

#### Scenario: Política RLS huérfana con patrón distinto al estándar del proyecto
- **WHEN** se encuentra en producción una política (`pg_policy`) sobre una tabla
  tenant-scoped que no está declarada en el `rls-policies.sql` versionado del
  servicio, o que usa un patrón de función distinto al estándar del proyecto
  (`current_setting('app.current_tenant_id', true)`)
- **THEN** SHALL tratarse como configuración fuera de control de versiones —
  eliminarse (`DROP POLICY`) y reemplazarse por la política estándar versionada, sin
  asumir que una política existente ya provee aislamiento solo porque aparece en
  `pg_policies`

## ADDED Requirements

### Requirement: El código de aplicación no SHALL depender exclusivamente de RLS para el aislamiento en operaciones de alto riesgo
El código de aplicación SHALL verificar explícitamente que la fila resuelta por clave primaria pertenece al `tenant_id` (y `proyecto_id` cuando aplique) de la sesión antes de leerla completa o modificarla — ya sea incluyendo esas columnas en el `where` de la consulta, o verificando el resultado después de un `findFirst`/`findUnique` por PK antes de actuar sobre él. RLS SHALL seguir aplicándose como capa adicional, pero SHALL NOT ser la única capa de aislamiento para estas operaciones.

#### Scenario: Operación por PK sin verificación de tenant en el código
- **WHEN** un endpoint resuelve un recurso por su clave primaria (ej.
  `findUnique({ where: { id_cuadro } })`) sin incluir `tenant_id` en el `where` ni
  verificar el resultado después
- **THEN** SHALL tratarse como una vulnerabilidad de aislamiento cross-tenant activa
  si RLS no está aplicado en esa tabla, independientemente de si RLS "debería" estar
  cubriendo el caso

#### Scenario: Operación por PK con verificación explícita
- **WHEN** un endpoint resuelve un recurso por PK y verifica que `tenant_id` (y
  `proyecto_id` cuando aplique) coincide con la sesión antes de actuar sobre él
- **THEN** una fuga cross-tenant NO SHALL depender de que RLS esté correctamente
  configurado en todo momento — el aislamiento se mantiene aunque RLS se
  deshabilite accidentalmente en el futuro
