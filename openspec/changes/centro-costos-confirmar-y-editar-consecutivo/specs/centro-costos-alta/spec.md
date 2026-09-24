## MODIFIED Requirements

### Requirement: El código de Centro de Costos SHALL ensamblarse a partir de 4 componentes estructurados
El sistema SHALL construir `codigo_centro_costos` concatenando, en orden, `empresa_grupo` (3 letras), `anio_centro_costos` (4 dígitos), el `codigo_cliente` del cliente seleccionado (3 dígitos) y `consecutivo_centro_costos` (3 dígitos), para un total de exactamente 13 caracteres. El usuario NO SHALL capturar el código completo como texto libre en el caso normal: `empresa_grupo`, `anio_centro_costos` y el cliente SHALL provenir de sus campos del formulario, y el usuario SHALL poder aceptar o modificar únicamente el consecutivo (3 dígitos, entero de 1 a 999) antes de guardar. El sistema SHALL mostrar el código completo, con su consecutivo, y exigir una confirmación explícita antes de crear el registro.

#### Scenario: Alta de un centro de costos normal con código completo visible
- **WHEN** un usuario con rol autorizado selecciona empresa `HCO`, año `2018`, cliente con `codigo_cliente = "004"` (SERSSINSA), y no marca la casilla de especial
- **THEN** el sistema consulta el siguiente consecutivo disponible para ese año y cliente, muestra el código completo `HCO2018004{consecutivo}` con el consecutivo prellenado y editable, y no lo guarda hasta que el usuario confirme

#### Scenario: Confirmación antes de guardar
- **WHEN** el usuario pulsa "Guardar" en el alta de un centro de costos normal
- **THEN** el sistema muestra un paso de confirmación con el código final y las acciones "Aceptar y guardar" y "Modificar", y no envía ninguna petición de creación hasta que el usuario elija "Aceptar y guardar"

#### Scenario: El usuario modifica el consecutivo
- **WHEN** el usuario cambia el consecutivo sugerido `003` por `010` y acepta
- **THEN** el sistema crea el centro de costos con el código `HCO2018004010` y `consecutivo_centro_costos = 10`, exactamente el valor confirmado

#### Scenario: El usuario elige "Modificar" en la confirmación
- **WHEN** el usuario elige "Modificar" en el paso de confirmación
- **THEN** el sistema cierra la confirmación sin crear nada, conserva los datos capturados y enfoca el campo del consecutivo

#### Scenario: Consecutivo fuera de rango
- **WHEN** por cualquier vía se intenta crear un centro de costos con `consecutivo_centro_costos` igual a `0`, `1000`, negativo, decimal o no numérico
- **THEN** el backend rechaza la creación con un error 400 explícito, sin persistir el registro

#### Scenario: Cambio de empresa, año o cliente tras editar el consecutivo
- **WHEN** el usuario editó el consecutivo a mano y luego cambia la empresa, el año o el cliente
- **THEN** el sistema vuelve a sugerir el consecutivo para la nueva combinación y muestra un aviso de que el valor anterior se descartó

#### Scenario: Formato inválido rechazado
- **WHEN** por cualquier vía se intenta crear un centro de costos con `empresa_grupo` fuera de `['CIB','HCO','HSE','SEO']`
- **THEN** el backend rechaza la creación con un error 400 explícito, sin persistir el registro

### Requirement: El consecutivo SHALL calcularse por año y cliente, sin colisiones bajo concurrencia
El sistema SHALL calcular el consecutivo sugerido como el máximo `consecutivo_centro_costos` existente con el mismo `tenant_id`, `empresa_grupo`, `anio_centro_costos` y `cliente_id`, más uno (o `1` si no existe ninguno), dentro de una transacción, y SHALL exponer ese cálculo sin efectos secundarios mediante `GET /api/v1/auth/admin/proyectos/siguiente-consecutivo`. Cuando la petición de creación no incluya `consecutivo_centro_costos`, el sistema SHALL asignar el sugerido y reintentar el cálculo si la inserción colisiona con un código ya existente. Cuando la petición incluya `consecutivo_centro_costos`, el sistema SHALL usar exactamente ese valor sin reintentos y SHALL responder `409 ADMIN_CODIGO_DUPLICADO`, con el `consecutivo_sugerido` vigente, si el código resultante ya existe. Si el máximo existente es 999, el sistema SHALL responder `409 ADMIN_CONSECUTIVO_AGOTADO`.

#### Scenario: Primer contrato del año con un cliente
- **WHEN** no existe ningún centro de costos previo para `(anio=2026, cliente_id=X)`
- **THEN** el consecutivo sugerido es `001`

#### Scenario: Segundo contrato del mismo año y cliente
- **WHEN** ya existe un centro de costos con `(anio=2026, cliente_id=X, consecutivo=001)`
- **THEN** el consecutivo sugerido para el mismo año y cliente es `002`

#### Scenario: Consecutivos con huecos no colisionan
- **WHEN** existen los consecutivos `001`, `002` y `005` para `(anio=2026, cliente_id=X)`
- **THEN** el consecutivo sugerido es `006`

#### Scenario: La vista previa no reserva ni escribe
- **WHEN** un usuario consulta `GET /api/v1/auth/admin/proyectos/siguiente-consecutivo` dos veces seguidas sin crear nada
- **THEN** ambas respuestas devuelven el mismo consecutivo y no se crea ni modifica ningún registro

#### Scenario: Colisión por creación concurrente sin consecutivo explícito
- **WHEN** dos solicitudes de creación sin `consecutivo_centro_costos` calculan el mismo consecutivo casi simultáneamente para el mismo `(anio, cliente_id)`
- **THEN** la segunda solicitud detecta el conflicto de unicidad, recalcula el consecutivo y persiste con el siguiente valor disponible, sin crear un duplicado

#### Scenario: Consecutivo explícito ya ocupado
- **WHEN** un usuario confirma el consecutivo `003` y, entre la vista previa y el guardado, otro usuario creó `HCO2018004003`
- **THEN** el backend responde `409 ADMIN_CODIGO_DUPLICADO` con `consecutivo_sugerido = 4`, no crea el registro, y el frontend muestra el aviso, actualiza el sugerido y vuelve a pedir confirmación

#### Scenario: Consecutivo explícito libre con hueco
- **WHEN** existen `001` y `002` y el usuario confirma el consecutivo `010`
- **THEN** el backend crea el centro de costos con `consecutivo_centro_costos = 10` y el siguiente sugerido pasa a ser `011`

#### Scenario: Consecutivos agotados
- **WHEN** el máximo consecutivo existente para `(empresa, anio, cliente)` es `999`
- **THEN** la consulta y la creación sin consecutivo explícito responden `409 ADMIN_CONSECUTIVO_AGOTADO`

#### Scenario: Rol no autorizado consulta la vista previa
- **WHEN** un usuario cuyo rol no está en `['admin', 'gerencia_tecnica', 'control_proyectos']` consulta el endpoint de siguiente consecutivo
- **THEN** el backend responde 403
