## ADDED Requirements

### Requirement: Todo microservicio con código listo SHALL tener contenedor desplegado
Un microservicio que tiene código, tests y (si aplica) migraciones de Prisma listos en
el repositorio SHALL tener un service block correspondiente en
`docker-compose.vps.yml`, desplegado y corriendo en el VPS de producción.

#### Scenario: Microservicio con código pero sin service block
- **WHEN** un microservicio tiene `apps/<servicio>/src` con endpoints implementados
  pero no existe un bloque `services.<servicio>` en `docker-compose.vps.yml`
- **THEN** se considera una brecha de despliegue y el microservicio SHALL agregarse
  al compose file antes de considerarse listo para producción

### Requirement: Todo microservicio desplegado SHALL tener ruta de entrada en el reverse proxy
Un microservicio con contenedor corriendo (`docker ps` healthy) SHALL tener una
`location /api/v1/<servicio>` correspondiente en `docker/nginx.qnap.conf` que lo
enrute correctamente.

#### Scenario: Contenedor sano sin ruta nginx
- **WHEN** un contenedor de microservicio está `healthy` pero `nginx.qnap.conf` no
  tiene una location para su prefijo de API
- **THEN** las peticiones del frontend a ese prefijo caen al `index.html` del SPA
  (200 con HTML) en vez de llegar al backend — esto SHALL detectarse como brecha
  y corregirse agregando la location faltante

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

#### Scenario: Tabla catálogo global sin tenant_id dentro de un servicio tenant-scoped
- **WHEN** un microservicio con `rls-policies.sql` tiene una tabla sin columna `tenant_id` (ej. un catálogo compartido entre todos los tenants, como el plan de cuentas contable)
- **THEN** esa tabla NO SHALL recibir `ENABLE ROW LEVEL SECURITY` — hacerlo sin una política equivale, bajo `FORCE ROW LEVEL SECURITY`, a un deny-all que rompe cualquier `JOIN`/`include` contra ella — y la exclusión SHALL documentarse explícitamente con un comentario en el `rls-policies.sql` del servicio, para que una auditoría posterior no la confunda con drift sin resolver

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

#### Scenario: Endpoint de escritura que devuelve la fila completa mutada
- **WHEN** un endpoint de escritura (`update`/`upsert`) por PK sin verificación de tenant devuelve en la respuesta la fila completa recién modificada
- **THEN** SHALL tratarse como una vulnerabilidad de lectura Y escritura combinadas en una sola petición — el atacante no solo corrompe datos de otro tenant, también los exfiltra en la misma respuesta; bajo RLS sin el chequeo de código explícito, ese endpoint SHALL responder `404` explícito ante un recurso ajeno, no un `500` derivado de un error interno de la capa de datos (ej. `P2025` de Prisma)

### Requirement: Una tabla con columna proyecto_id no SHALL asumirse tenant+proyecto sin verificar cómo el código la consulta
Al decidir el alcance de una política RLS para una tabla tenant-scoped, la presencia de una columna `proyecto_id` en el schema no SHALL bastar por sí sola para elegir una política combinada `tenant_id AND proyecto_id` — SHALL verificarse primero si el código de aplicación realmente acota sus consultas al "proyecto actual" de la sesión, o si trata la tabla como un catálogo tenant-wide (listando/escribiendo filas de múltiples `proyecto_id` dentro del mismo tenant sin acotar a uno solo). En el segundo caso, la política SHALL ser solo `tenant_id`, aunque la columna `proyecto_id` exista como dato informativo de cada fila.

#### Scenario: Tabla con proyecto_id pero consultada de forma tenant-wide
- **WHEN** una tabla tiene columna `proyecto_id` pero el código la consulta con `WHERE tenant_id = ...` sin acotar por `proyecto_id` en sus operaciones de lectura/listado principales
- **THEN** la política RLS de esa tabla SHALL ser solo `tenant_id`; aplicar una política combinada `tenant_id AND proyecto_id` SHALL considerarse un error de diseño de la política, no una mejora de seguridad, porque rompe el listado tenant-wide que el código ya provee intencionalmente

#### Scenario: Tabla con proyecto_id consultada siempre acotada a un proyecto
- **WHEN** una tabla tiene columna `proyecto_id` y el código siempre la consulta junto con `tenant_id` y `proyecto_id` (ej. vía clave única compuesta)
- **THEN** la política RLS SHALL ser combinada `tenant_id AND proyecto_id`, igual que el resto de tablas de ese tipo en el mismo servicio

### Requirement: Las integraciones backend-to-backend SHALL usar URLs de contenedor, no localhost
Cuando un microservicio llama a otro vía HTTP interno (ej. `compras` → GT para
catálogo de insumos), la variable de entorno de esa URL SHALL apuntar al nombre de
contenedor Docker del servicio destino, nunca depender del valor por defecto
hardcodeado en el código fuente.

#### Scenario: Variable de integración B2B no configurada
- **WHEN** una variable como `GT_URL` no está definida en `docker-compose.vps.yml`
  para el servicio que la consume
- **THEN** el código cae a su default (típicamente `http://localhost:<puerto>`, que
  dentro del contenedor consumidor apunta a sí mismo) y toda llamada a esa
  integración falla con error de conexión — esto SHALL detectarse como brecha y
  corregirse configurando la variable con el nombre de contenedor correcto

### Requirement: Un middleware de autorización de proyecto no SHALL considerarse aislamiento de datos por proyecto
Un middleware que verifica que el usuario tiene acceso al `proyecto_id` de su sesión (ej. `requireProjectAccess()`) SHALL tratarse únicamente como control de acceso a la ruta solicitada, no como aislamiento de datos entre proyectos. Si el código de un endpoint no filtra explícitamente por `proyecto_id` en sus consultas, y no existe una política RLS combinada `tenant_id AND proyecto_id` sobre la tabla consultada, el servicio SHALL considerarse sin aislamiento entre proyectos del mismo tenant, incluso si el middleware de autorización está presente y funcionando correctamente.

#### Scenario: Middleware verifica acceso al proyecto pero la consulta no lo filtra
- **WHEN** un endpoint pasa por un middleware que confirma que el usuario tiene acceso al `proyecto_id` de su sesión, pero la consulta a la base de datos solo filtra por `tenant_id` y no existe política RLS combinada
- **THEN** un usuario legítimamente autorizado en el proyecto A puede leer o modificar registros del proyecto B del mismo tenant pasando el UUID de B en la ruta — esto SHALL tratarse como una brecha de aislamiento activa, no como defensa en profundidad faltante únicamente

#### Scenario: Filtro explícito o política RLS combinada presente
- **WHEN** un endpoint filtra explícitamente por `tenant_id` y `proyecto_id` en la consulta, o existe una política RLS combinada sobre la tabla
- **THEN** el aislamiento entre proyectos del mismo tenant SHALL sostenerse independientemente de qué UUID de proyecto se pase en la ruta
