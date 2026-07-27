## MODIFIED Requirements

### Requirement: Todo microservicio con datos propios SHALL tener base de datos inicializada
Un microservicio cuyo schema Prisma define modelos con `tenant_id` SHALL tener su propia base de datos Postgres creada, con el schema aplicado (`prisma db push` o `migrate deploy`) y las políticas RLS correspondientes aplicadas, antes de recibir tráfico real. Cuando ese microservicio tiene políticas RLS declaradas, el rol de Postgres que usa su `DATABASE_URL` en producción SHALL ser no-superusuario y SHALL tener `rolbypassrls=false` — un rol superusuario o con `BYPASSRLS` vuelve inertes las políticas RLS sin importar que estén correctamente declaradas y con `FORCE ROW LEVEL SECURITY`. Este requisito SHALL cubrir también cualquier tabla con `tenant_id` agregada DESPUÉS del despliegue inicial del microservicio (ej. por una feature nueva) — el `rls-policies.sql` del servicio SHALL extenderse cada vez que se agregue una tabla tenant-scoped, no solo mantenerse al día de su primera versión.

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

#### Scenario: Tabla catálogo global sin tenant_id dentro de un servicio tenant-scoped
- **WHEN** un microservicio con `rls-policies.sql` tiene una tabla sin columna `tenant_id` (ej. un catálogo compartido entre todos los tenants, como el plan de cuentas contable)
- **THEN** esa tabla NO SHALL recibir `ENABLE ROW LEVEL SECURITY` — hacerlo sin una política equivale, bajo `FORCE ROW LEVEL SECURITY`, a un deny-all que rompe cualquier `JOIN`/`include` contra ella — y la exclusión SHALL documentarse explícitamente con un comentario en el `rls-policies.sql` del servicio, para que una auditoría posterior no la confunda con drift sin resolver

## ADDED Requirements

### Requirement: Un middleware de autorización de proyecto no SHALL considerarse aislamiento de datos por proyecto
Un middleware que verifica que el usuario tiene acceso al `proyecto_id` de su sesión (ej. `requireProjectAccess()`) SHALL tratarse únicamente como control de acceso a la ruta solicitada, no como aislamiento de datos entre proyectos. Si el código de un endpoint no filtra explícitamente por `proyecto_id` en sus consultas, y no existe una política RLS combinada `tenant_id AND proyecto_id` sobre la tabla consultada, el servicio SHALL considerarse sin aislamiento entre proyectos del mismo tenant, incluso si el middleware de autorización está presente y funcionando correctamente.

#### Scenario: Middleware verifica acceso al proyecto pero la consulta no lo filtra
- **WHEN** un endpoint pasa por un middleware que confirma que el usuario tiene acceso al `proyecto_id` de su sesión, pero la consulta a la base de datos solo filtra por `tenant_id` y no existe política RLS combinada
- **THEN** un usuario legítimamente autorizado en el proyecto A puede leer o modificar registros del proyecto B del mismo tenant pasando el UUID de B en la ruta — esto SHALL tratarse como una brecha de aislamiento activa, no como defensa en profundidad faltante únicamente

#### Scenario: Filtro explícito o política RLS combinada presente
- **WHEN** un endpoint filtra explícitamente por `tenant_id` y `proyecto_id` en la consulta, o existe una política RLS combinada sobre la tabla
- **THEN** el aislamiento entre proyectos del mismo tenant SHALL sostenerse independientemente de qué UUID de proyecto se pase en la ruta
