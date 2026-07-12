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
