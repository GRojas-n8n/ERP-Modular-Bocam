## ADDED Requirements

### Requirement: El código de Centro de Costos SHALL ensamblarse a partir de 4 componentes estructurados
El sistema SHALL construir `codigo_centro_costos` concatenando, en orden, `empresa_grupo` (3 letras), `anio_centro_costos` (4 dígitos), el `codigo_cliente` del cliente seleccionado (3 dígitos) y `consecutivo_centro_costos` (3 dígitos), para un total de exactamente 13 caracteres. El usuario NO SHALL capturar este código como texto libre en el caso normal — se ensambla y se muestra de solo lectura.

#### Scenario: Alta de un centro de costos normal
- **WHEN** un usuario con rol autorizado selecciona empresa `HCO`, año `2018`, cliente con `codigo_cliente = "004"` (SERSSINSA), y no marca la casilla de especial
- **THEN** el sistema calcula el consecutivo (siguiente disponible para ese año+cliente), ensambla el código `HCO2018004{consecutivo}` y lo muestra de solo lectura antes de guardar

#### Scenario: Formato inválido rechazado
- **WHEN** por cualquier vía se intenta crear un centro de costos con `empresa_grupo` fuera de `['CIB','HCO','HSE','SEO']`
- **THEN** el backend rechaza la creación con un error 400 explícito, sin persistir el registro

### Requirement: El consecutivo SHALL calcularse por año y cliente, sin colisiones bajo concurrencia
El sistema SHALL calcular `consecutivo_centro_costos` como el conteo de centros de costos existentes con el mismo `tenant_id`, `empresa_grupo`, `anio_centro_costos` y `cliente_id`, más uno, dentro de una transacción, y SHALL reintentar el cálculo si la inserción resultante colisiona con un código ya existente.

#### Scenario: Primer contrato del año con un cliente
- **WHEN** no existe ningún centro de costos previo para `(anio=2026, cliente_id=X)`
- **THEN** el consecutivo asignado es `001`

#### Scenario: Segundo contrato del mismo año y cliente
- **WHEN** ya existe un centro de costos con `(anio=2026, cliente_id=X, consecutivo=001)`
- **THEN** el siguiente centro de costos para el mismo año y cliente recibe `consecutivo=002`

#### Scenario: Colisión por creación concurrente
- **WHEN** dos solicitudes de creación calculan el mismo consecutivo casi simultáneamente para el mismo `(anio, cliente_id)`
- **THEN** la segunda solicitud detecta el conflicto de unicidad, recalcula el consecutivo y persiste con el siguiente valor disponible, sin crear un duplicado

### Requirement: Los Centros de Costos Especiales SHALL poder omitir la máscara de 13 posiciones
El sistema SHALL permitir marcar un centro de costos como especial (`es_especial = true`) únicamente con `tipo_especial` en `['OFICINA', 'TALLER', 'ALMACÉN']`, en cuyo caso `codigo_centro_costos` SHALL aceptar texto libre sin la validación de 13 posiciones.

#### Scenario: Alta de centro de costos especial
- **WHEN** un usuario marca la casilla de especial y selecciona `tipo_especial = "OFICINA"`
- **THEN** el formulario deja de exigir empresa/año/cliente/consecutivo y permite capturar el código libremente

### Requirement: Solo admin, gerencia_tecnica y control_proyectos SHALL poder crear o editar Centros de Costos
El backend SHALL rechazar con 403 cualquier intento de `POST` o `PATCH` a `/api/v1/auth/admin/proyectos` desde un usuario cuyo rol no esté en `['admin', 'gerencia_tecnica', 'control_proyectos']`.

#### Scenario: Rol no autorizado intenta crear un centro de costos
- **WHEN** un usuario con rol `resident` o `procurement` intenta `POST /api/v1/auth/admin/proyectos`
- **THEN** el backend responde 403 sin crear el registro

#### Scenario: Rol de gerencia_tecnica autorizado
- **WHEN** un usuario con rol `gerencia_tecnica` envía una creación válida
- **THEN** el backend crea el centro de costos igual que lo haría `admin`

### Requirement: El Centro de Costos SHALL capturar línea base financiera y de plazos
Al crear o editar un Centro de Costos, el sistema SHALL exigir `fecha_inicio_real`, `fecha_firma_contrato`, `fecha_programada_inicio`, `fecha_programada_fin`, `monto_total_vendido`, `periodo_ejecucion` con su unidad (`MESES` o `SEMANAS`), `total_dias_naturales` y `total_dias_laborables`. El frontend SHALL bloquear el guardado si `fecha_programada_fin` es anterior a `fecha_programada_inicio`.

#### Scenario: Fechas programadas inconsistentes
- **WHEN** el usuario captura `fecha_programada_fin` anterior a `fecha_programada_inicio`
- **THEN** el frontend muestra un error de validación y no permite enviar el formulario

#### Scenario: Alta completa con línea base
- **WHEN** el usuario completa todos los campos financieros y de plazos con valores válidos
- **THEN** el backend persiste el centro de costos con esos valores, disponibles para reportes futuros

### Requirement: El estatus del Centro de Costos SHALL usar el vocabulario ABIERTO/EN EJECUCIÓN/EN COBRO/TERMINADO/CERRADO
El campo `estatus` SHALL aceptar únicamente `['ABIERTO', 'EN EJECUCIÓN', 'EN COBRO', 'TERMINADO', 'CERRADO']` para registros creados o editados a partir de este cambio. Los centros de costos existentes con vocabulario legacy (`LICITACION`, `ADJUDICADO`, `CONSTRUCCION`, `CIERRE_TECNICO`, `CIERRE_FINANCIERO`) SHALL migrarse automáticamente al nuevo vocabulario según el mapeo documentado, sin intervención manual.

#### Scenario: Proyecto legacy migrado
- **WHEN** se aplica la migración de datos de este cambio
- **THEN** un proyecto que tenía `estatus = "CONSTRUCCION"` queda con `estatus = "EN EJECUCIÓN"`

#### Scenario: Valor de estatus inválido rechazado
- **WHEN** se intenta guardar un centro de costos con `estatus = "CONSTRUCCION"` después de este cambio
- **THEN** el backend rechaza la escritura por no pertenecer al vocabulario vigente

### Requirement: El catálogo de clientes de Ventas SHALL exponer un código de 3 dígitos reutilizable en Centros de Costos
El modelo `Cliente` de Ventas SHALL tener un campo `codigo_cliente` único por tenant, de 3 dígitos en el rango `000`-`050`, seleccionable desde el formulario de alta de Centro de Costos. El frontend SHALL permitir crear un cliente nuevo desde un modal in-context sin perder el progreso del formulario de Centro de Costos en curso.

#### Scenario: Selección de cliente existente
- **WHEN** el usuario abre el selector de cliente en el formulario de Centro de Costos
- **THEN** ve la lista de clientes activos de Ventas con su `codigo_cliente`, y al seleccionar uno el sistema lo usa para ensamblar el código

#### Scenario: Alta de cliente nuevo sin perder el formulario en curso
- **WHEN** el usuario hace clic en "+ Agregar Cliente", completa el modal y lo guarda
- **THEN** el nuevo cliente se crea en Ventas, aparece inmediatamente seleccionado en el formulario de Centro de Costos, y ningún otro campo ya capturado del formulario se pierde
