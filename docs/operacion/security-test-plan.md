# Security Test Plan

## Objetivo
Definir un plan de pruebas de seguridad para el despliegue del ERP Modular BOCAM en el VPS Hostinger, con foco en:
- autenticacion
- autorizacion RBAC
- aislamiento multi-tenant
- aislamiento multi-proyecto
- endurecimiento de infraestructura
- seguridad intermodular
- validacion operativa antes de abrir el entorno a pruebas de usuarios

## Alcance
Este plan cubre:
- `auth`
- `gerencia-tecnica`
- `compras`
- `finanzas`
- `control-obra`
- `contabilidad`
- `personal`
- `seguridad`
- `app-shell`
- `postgres`
- `rabbitmq`
- `redis`
- reverse proxy (`caddy` o `nginx`)

## Prerrequisitos
- El stack ya debe estar desplegado en staging VPS.
- Todos los `/health` deben responder.
- Debe existir un tenant de pruebas.
- Deben existir al menos dos proyectos del mismo tenant.
- Deben existir al menos dos tenants de prueba.
- Deben existir usuarios con roles distintos:
  - `admin`
  - `finance`
  - `procurement`
  - `resident`
  - `superintendent`

## Datos de prueba recomendados
### Tenant A
- Proyecto A1
- Proyecto A2
- Usuario admin tenant A
- Usuario finance tenant A
- Usuario procurement tenant A
- Usuario resident solo Proyecto A1

### Tenant B
- Proyecto B1
- Usuario admin tenant B

## Estrategia
Las pruebas se ejecutan en este orden:
1. Infraestructura y superficie expuesta
2. TLS y reverse proxy
3. Auth y JWT
4. RBAC
5. Multi-tenant
6. Multi-proyecto
7. RLS y capa de datos
8. Seguridad intermodular
9. Logs y secretos
10. Resiliencia operativa

## Matriz de pruebas

### 1. Infraestructura y red
#### Caso INF-01: Puertos publicos minimos
Objetivo:
Validar que solo `22`, `80` y `443` esten expuestos publicamente.

Comandos sugeridos:
```bash
ss -tulpen
ufw status
```

Resultado esperado:
- No deben estar publicos `5432`, `5672`, `6379`, `3001-3008`.

#### Caso INF-02: Servicios internos no accesibles desde internet
Objetivo:
Confirmar que Postgres, RabbitMQ y Redis no son accesibles externamente.

Resultado esperado:
- Conexion externa rechazada o imposible.

### 2. TLS y reverse proxy
#### Caso TLS-01: HTTPS activo
Comandos:
```bash
curl -I https://ERP.DOMINIO
```

Resultado esperado:
- Respuesta `200`, `301` o `302` valida.
- Certificado valido.

#### Caso TLS-02: Redirect HTTP a HTTPS
Comandos:
```bash
curl -I http://ERP.DOMINIO
```

Resultado esperado:
- Redireccion a HTTPS.

#### Caso TLS-03: Cabeceras seguras
Validar al menos:
- `Strict-Transport-Security`
- `X-Content-Type-Options`
- `Referrer-Policy`

### 3. Auth y JWT
#### Caso AUTH-01: Login exitoso
Objetivo:
Obtener JWT valido con usuario autorizado.

Resultado esperado:
- `access_token` emitido
- `refresh_token` emitido
- JWT con `tenant_id`, `proyecto_id`, `roles`, `projects`

#### Caso AUTH-02: Login con credenciales invalidas
Resultado esperado:
- `401`
- sin fuga de informacion sensible

#### Caso AUTH-03: Request sin token
Resultado esperado:
- `401`
- codigo de error consistente

#### Caso AUTH-04: Token malformado
Resultado esperado:
- `401`

#### Caso AUTH-05: Token expirado
Resultado esperado:
- `401`
- mensaje de sesion expirada

#### Caso AUTH-06: Refresh token revocado
Resultado esperado:
- `401`
- no se emite nuevo access token

#### Caso AUTH-07: Usuario inactivo
Resultado esperado:
- login rechazado o refresh rechazado

### 4. RBAC
#### Caso RBAC-01: Usuario sin rol suficiente no puede mutar
Probar:
- crear OC sin rol de compras
- crear presupuesto sin rol financiero

Resultado esperado:
- `403`

#### Caso RBAC-02: Límite financiero respetado
Probar en Finanzas:
- usuario con limite bajo intenta aprobar monto mayor

Resultado esperado:
- rechazo por limite de aprobacion

#### Caso RBAC-03: Rol de proyecto no escala a tenant completo
Objetivo:
Confirmar que un usuario de proyecto no accede a otros proyectos del mismo tenant.

Resultado esperado:
- `403` o lista vacia segun el endpoint

### 5. Aislamiento multi-tenant
#### Caso TEN-01: Tenant A no ve datos de Tenant B
Probar con:
- compras
- finanzas
- control-obra
- contabilidad

Resultado esperado:
- cero registros de tenant ajeno

#### Caso TEN-02: Tenant A no muta datos de Tenant B
Intentar actualizar o cancelar una entidad de otro tenant.

Resultado esperado:
- rechazo o no encontrado

#### Caso TEN-03: Eventos no mezclan tenants
Publicar eventos de tenant A y verificar que no afecten datos de tenant B.

Resultado esperado:
- aislamiento total por `tenant_id`

### 6. Aislamiento multi-proyecto
#### Caso PROJ-01: Usuario de Proyecto A1 no ve Proyecto A2
Resultado esperado:
- `403` o datos vacios

#### Caso PROJ-02: Usuario de Proyecto A1 no muta Proyecto A2
Resultado esperado:
- rechazo de acceso

#### Caso PROJ-03: `tenant_id` y `proyecto_id` del body no deben mandar
Objetivo:
Enviar payload con IDs falsos distintos al JWT.

Resultado esperado:
- el backend usa contexto del JWT
- la escritura queda en el proyecto del token o es rechazada

### 7. RLS y capa de datos
#### Caso RLS-01: Tablas protegidas por RLS
Objetivo:
Validar que RLS esta activada en tablas del modulo.

Comando sugerido:
```bash
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
JOIN pg_class ON pg_class.relname = pg_tables.tablename
WHERE schemaname = 'public';
```

Resultado esperado:
- tablas criticas con `rowsecurity = true`

#### Caso RLS-02: Consulta sin contexto falla o no devuelve datos
Objetivo:
Comprobar que una consulta sin `set_config` no puede saltarse aislamiento.

Resultado esperado:
- error, cero registros o bloqueo segun configuracion

#### Caso RLS-03: `FORCE ROW LEVEL SECURITY`
Resultado esperado:
- tablas criticas con RLS forzada cuando aplique

### 8. Seguridad intermodular
#### Caso INT-01: Compras consulta a Finanzas con contexto valido
Resultado esperado:
- request interna autorizada
- correlacion correcta

#### Caso INT-02: Evento sin `tenant_id` o `proyecto_id` es rechazado
Resultado esperado:
- el consumidor ignora o marca error

#### Caso INT-03: Idempotencia en eventos duplicados
Objetivo:
Reenviar evento terminal varias veces.

Resultado esperado:
- una sola mutacion final

#### Caso INT-04: Caida temporal de Contabilidad no rompe Compras
Objetivo:
Detener contabilidad y ejecutar flujo en compras.

Resultado esperado:
- compras sigue operando
- contabilidad procesa luego via cola

### 9. Logs, secretos y observabilidad
#### Caso LOG-01: No se imprimen secretos
Revisar logs de:
- auth
- finanzas
- compras
- contabilidad

Resultado esperado:
- no aparece `JWT_SECRET`
- no aparecen passwords
- no aparecen tokens completos

#### Caso LOG-02: Logs con contexto suficiente
Resultado esperado:
- `correlation_id`
- `tenant_id`
- `proyecto_id`
- accion o endpoint

### 10. Resiliencia y operacion
#### Caso OPS-01: Reinicio controlado de servicios
Probar reiniciar `finanzas` y validar recuperacion.

Resultado esperado:
- servicio vuelve sano
- no quedan errores persistentes

#### Caso OPS-02: Backup inicial disponible
Resultado esperado:
- archivos de backup por modulo existen

#### Caso OPS-03: Smoke tests post deploy
Resultado esperado:
- todos los endpoints health responden

## Checklist de ejecucion
- [ ] INF-01
- [ ] INF-02
- [ ] TLS-01
- [ ] TLS-02
- [ ] TLS-03
- [ ] AUTH-01
- [ ] AUTH-02
- [ ] AUTH-03
- [ ] AUTH-04
- [ ] AUTH-05
- [ ] AUTH-06
- [ ] AUTH-07
- [ ] RBAC-01
- [ ] RBAC-02
- [ ] RBAC-03
- [ ] TEN-01
- [ ] TEN-02
- [ ] TEN-03
- [ ] PROJ-01
- [ ] PROJ-02
- [ ] PROJ-03
- [ ] RLS-01
- [ ] RLS-02
- [ ] RLS-03
- [ ] INT-01
- [ ] INT-02
- [ ] INT-03
- [ ] INT-04
- [ ] LOG-01
- [ ] LOG-02
- [ ] OPS-01
- [ ] OPS-02
- [ ] OPS-03

## Evidencia requerida
Guardar evidencia de cada corrida en:
- GitHub Issues
- comentarios de PR
- `docs/checkpoints/` si la validacion corresponde a un hito importante

La evidencia minima por corrida debe incluir:
- fecha
- entorno
- commit o rama desplegada
- casos ejecutados
- casos fallidos
- riesgos detectados
- decision tomada

## Criterio de aprobacion para staging utilizable
Se considera que el staging del VPS esta listo para pruebas internas cuando:
- no hay puertos sensibles expuestos
- HTTPS esta operativo
- login y refresh funcionan
- no hay fuga entre tenants
- no hay fuga entre proyectos
- RLS esta operativa en modulos criticos
- flujos Compras -> Finanzas -> Contabilidad funcionan
- no se exponen secretos en logs
