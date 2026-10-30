## ADDED Requirements

### Requirement: Solo se ejecuta contra el entorno local
El seed SHALL abortar antes de escribir nada si la URL de la API no apunta a `localhost`/`127.0.0.1`, si el contenedor de Postgres no es `iretum-local-postgres` del proyecto compose `iretum-local`, o si `verificar-env-local.mjs` falla.

#### Scenario: API remota
- **WHEN** se ejecuta con una URL base cuyo host no es `localhost` ni `127.0.0.1`
- **THEN** termina con código distinto de 0 sin llamar a ninguna API ni a la base

#### Scenario: Postgres que no es el local
- **WHEN** el contenedor `postgres` del compose no tiene la etiqueta `com.docker.compose.project=iretum-local`
- **THEN** termina con código distinto de 0 sin borrar nada

### Requirement: Limpieza acotada al tenant de pruebas
Antes de sembrar, el seed SHALL borrar en las 11 bases todas las filas con `tenant_id` igual al tenant local de pruebas y SHALL NOT tocar filas de otros tenants.

#### Scenario: Otros tenants intactos
- **WHEN** se ejecuta el seed con datos existentes de los tenants Alfa y Beta
- **THEN** el conteo de filas de Alfa y Beta en cada base es el mismo antes y después

#### Scenario: Ejecución repetida
- **WHEN** se ejecuta el seed dos veces seguidas
- **THEN** la segunda ejecución termina sin errores y deja el mismo número de requisiciones, cuadros y OC que la primera

### Requirement: Datos sembrados por las APIs reales
El seed SHALL crear cliente, centro de costos, usuarios, insumos, catálogo, APU, presupuesto, proveedores, requisiciones, cuadros y OC llamando a los endpoints de auth, ventas, gerencia-tecnica y compras con el JWT del rol que el endpoint exige, y SHALL NOT escribir directamente en Finanzas.

#### Scenario: Nada se escribe en Finanzas
- **WHEN** termina el seed
- **THEN** toda fila del tenant de pruebas en `bocam_finanzas` proviene de un evento o llamada de otro servicio (centro de costos, saldo de partida, compromiso de OC)

### Requirement: Cuatro requisiciones en estados distintos
El seed SHALL dejar las requisiciones `REQ-LOCAL-A`, `REQ-LOCAL-B`, `REQ-LOCAL-C` y `REQ-LOCAL-D` en estos estados:

#### Scenario: Caso a — recién creada
- **WHEN** termina el seed
- **THEN** `REQ-LOCAL-A` está en `PENDIENTE` y no tiene solicitud de cotización ni cuadro

#### Scenario: Caso b — cotizada sin firmar
- **WHEN** termina el seed
- **THEN** `REQ-LOCAL-B` tiene solicitud de cotización y un cuadro en `BORRADOR` con precios de al menos 3 proveedores

#### Scenario: Caso c — firmada y seleccionada por GT con compra dividida
- **WHEN** termina el seed
- **THEN** el cuadro de `REQ-LOCAL-C` está en `APROBADO_GT`, firmado por el usuario de Residencia, y tiene renglones ganadores de 2 proveedores distintos

#### Scenario: Caso d — OC generada y enviada
- **WHEN** termina el seed
- **THEN** `REQ-LOCAL-D` está en `COMPRADA`, su OC está `EMITIDA` con `enviada_proveedor_at` no nulo, y el correo con el PDF está en Mailpit

### Requirement: Correos solo dentro de la máquina
Los correos de invitación a cotizar y de envío de OC SHALL entregarse únicamente al servicio Mailpit del entorno local.

#### Scenario: SMTP fuera de Mailpit
- **WHEN** `SMTP_HOST` en `.env.local` o `docker-compose.local.yml` apunta a un host distinto de `mailpit`
- **THEN** `verificar-env-local.mjs` bloquea el arranque
