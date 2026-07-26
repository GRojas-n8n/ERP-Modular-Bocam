## ADDED Requirements

### Requirement: RH configura la periodicidad de pago por proyecto
El sistema SHALL permitir que un usuario con rol `personal_rh` o `admin` configure, mediante un selector general por proyecto (no por empleado) — `PUT /api/v1/personal/config-nomina`, aplicando sobre el proyecto activo de su JWT (`req.securityContext.proyectoId`), igual que el resto de endpoints del servicio — la periodicidad de pago (`SEMANAL`, `QUINCENAL` o `MENSUAL`) que aplica a todos los empleados asignados a ese proyecto. El valor por defecto, cuando no se ha configurado explícitamente, SHALL ser `SEMANAL`.

#### Scenario: Configurar periodicidad mensual para un proyecto
- **WHEN** RH selecciona `periodicidad_pago = MENSUAL` para el proyecto `P1`
- **THEN** el sistema guarda la configuración en `ConfigNominaProyecto` para `P1` y la retorna al consultarla

#### Scenario: Proyecto sin configuración explícita
- **WHEN** se consulta la periodicidad de un proyecto que nunca fue configurado
- **THEN** el sistema retorna `periodicidad_pago = SEMANAL` como valor por defecto, sin requerir que exista un registro

#### Scenario: Valor de periodicidad inválido
- **WHEN** RH intenta guardar `periodicidad_pago = "ANUAL"` para un proyecto
- **THEN** el sistema responde `400` con mensaje indicando los valores válidos (`SEMANAL`, `QUINCENAL`, `MENSUAL`)

#### Scenario: Rol sin permiso intenta configurar periodicidad
- **WHEN** un usuario con rol distinto a `personal_rh`/`admin` intenta configurar la periodicidad de un proyecto
- **THEN** el sistema responde `403`

### Requirement: Empleados asignados al proyecto heredan su periodicidad automáticamente
Un empleado SHALL usar, para su cálculo de nómina, la periodicidad configurada del proyecto al que está asignado (vía `Cuadrilla.proyecto_id`, `AsignacionFrente.proyecto_id` activa, o el proyecto del Residente al que fue asignado), sin requerir configuración individual por empleado.

#### Scenario: Empleado nuevo asignado a un proyecto mensual
- **WHEN** RH asigna un empleado nuevo a un residente que participa en un proyecto con `periodicidad_pago = MENSUAL`
- **THEN** ese empleado se calcula en la siguiente corrida de nómina con periodicidad `MENSUAL`, sin que RH configure nada adicional en la ficha del empleado

#### Scenario: Empleado reasignado a un proyecto con otra periodicidad
- **WHEN** un empleado que estaba en un proyecto `SEMANAL` se reasigna a un proyecto `QUINCENAL`
- **THEN** su siguiente cálculo de nómina usa `QUINCENAL`, derivado del nuevo proyecto, sin arrastrar la periodicidad del proyecto anterior

### Requirement: Cálculo de nómina usa la periodicidad configurada del proyecto
El endpoint `POST /api/v1/personal/prenominas/calcular` SHALL dejar de aceptar `periodo_tipo` en el body. En su lugar, SHALL leer `ConfigNominaProyecto.periodicidad_pago` del `proyecto_id` de la corrida (o `SEMANAL` si no existe config) y generar la `PreNomina` de ese proyecto con ese `periodo_tipo`.

#### Scenario: Calcular con proyecto configurado
- **WHEN** RH ejecuta `calcular` para un proyecto con `periodicidad_pago = QUINCENAL` configurada
- **THEN** el sistema genera la `PreNomina` con `periodo_tipo = QUINCENAL` para todos los empleados elegibles de ese proyecto

#### Scenario: Calcular con proyecto sin configuración
- **WHEN** RH ejecuta `calcular` para un proyecto que nunca configuró periodicidad
- **THEN** el sistema genera la `PreNomina` con `periodo_tipo = SEMANAL` (default)

#### Scenario: Body incluye periodo_tipo (contrato anterior)
- **WHEN** un cliente envía `periodo_tipo` en el body de `calcular` (contrato previo a este change)
- **THEN** el sistema ignora el campo y usa la periodicidad configurada del proyecto, sin error

#### Scenario: Filtro por proyecto se aplica antes de leer la periodicidad
- **WHEN** el sistema calcula la nómina de un proyecto específico
- **THEN** primero filtra los empleados elegibles por ese `proyecto_id` (comportamiento ya existente) y luego aplica la periodicidad de `ConfigNominaProyecto` correspondiente a ese mismo proyecto

### Requirement: Cálculo de nómina filtra empleados por proyecto real, no solo por tenant
El endpoint `POST /api/v1/personal/prenominas/calcular` SHALL determinar el conjunto de empleados elegibles del proyecto como la unión de: empleados con `AsignacionFrente` en estado `ACTIVA` cuyo `proyecto_id` coincide con el de la corrida, y empleados cuyo `cuadrilla_id` referencia una `Cuadrilla` con ese mismo `proyecto_id`. SHALL dejar de considerar elegible a cualquier empleado del tenant sin esta relación de proyecto, incluso si su `estado = 'ACTIVO'`.

#### Scenario: Empleado asignado al proyecto de la corrida
- **WHEN** un empleado tiene una `AsignacionFrente` `ACTIVA` con `proyecto_id = P1` y se calcula la nómina de `P1`
- **THEN** el empleado se incluye en el cálculo

#### Scenario: Empleado asignado a otro proyecto
- **WHEN** un empleado solo tiene asignaciones `ACTIVA` con `proyecto_id = P2` y se calcula la nómina de `P1`
- **THEN** el empleado NO se incluye en el cálculo de `P1`, aunque su `estado = 'ACTIVO'` y pertenezca al mismo tenant

#### Scenario: Empleado asignado solo por cuadrilla, sin frente explícito
- **WHEN** un empleado no tiene `AsignacionFrente` pero su `cuadrilla_id` referencia una `Cuadrilla` con `proyecto_id = P1`
- **THEN** el empleado se incluye en el cálculo de la nómina de `P1`

### Requirement: Migración de periodicidad desde histórico de nómina por proyecto
Al desplegar este change, el sistema SHALL poblar `ConfigNominaProyecto` para cada proyecto con histórico de `PreNomina`, usando el `periodo_tipo` de su corrida más reciente. Proyectos sin histórico de pre-nómina SHALL quedar sin registro explícito y resolver a `SEMANAL` por el valor por defecto.

#### Scenario: Proyecto con histórico quincenal
- **WHEN** se ejecuta la migración para un proyecto cuya `PreNomina` más reciente tiene `periodo_tipo = QUINCENAL`
- **THEN** el sistema crea `ConfigNominaProyecto` con `periodicidad_pago = QUINCENAL` para ese proyecto

#### Scenario: Proyecto sin histórico de nómina
- **WHEN** se ejecuta la migración para un proyecto que nunca tuvo una `PreNomina`
- **THEN** el sistema no crea registro en `ConfigNominaProyecto`; el proyecto resuelve a `SEMANAL` por default hasta que RH lo configure explícitamente
