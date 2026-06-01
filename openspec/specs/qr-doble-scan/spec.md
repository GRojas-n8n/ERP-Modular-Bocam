## ADDED Requirements

### Requirement: QR de cuadrilla distingue entrada y salida por estado del registro
El mismo QR de cuadrilla SHALL funcionar como entrada en el primer scan del día y como salida en el segundo scan. La lógica de distinción reside en el backend: si no existe registro para empleado/fecha → es entrada; si existe con `hora_entrada` y sin `hora_salida` → es salida.

#### Scenario: Primer scan del día → entrada
- **WHEN** se recibe `POST /asistencia/registro` con `tipo_scan = 'AUTO'` y no existe registro para ese empleado/fecha
- **THEN** el sistema crea el registro con `hora_entrada = hora_actual_servidor`, `estado = PRESENTE`

#### Scenario: Segundo scan del día → salida
- **WHEN** se recibe `POST /asistencia/registro` con `tipo_scan = 'AUTO'` y ya existe registro con `hora_entrada` definida y `hora_salida = null`
- **THEN** el sistema actualiza el registro con `hora_salida = hora_actual_servidor` y calcula horas

#### Scenario: Tercer scan del mismo día → idempotente
- **WHEN** se recibe `POST /asistencia/registro` con `tipo_scan = 'AUTO'` y el registro ya tiene `hora_entrada` y `hora_salida` definidas
- **THEN** el sistema retorna el registro existente sin modificaciones (`200 OK`)

---

### Requirement: UI ResidenciaView muestra hora de entrada/salida según modo del empleado
En el tab `asistencia` de ResidenciaView, la tabla SHALL mostrar columnas `Entrada` y `Salida` para empleados `POR_HORAS` con los valores registrados o `—` si están vacíos. Para empleados `JORNADA_COMPLETA`, esas columnas SHALL mostrar `—`.

#### Scenario: Columnas de hora visibles
- **WHEN** el Residente abre el tab asistencia con registros de empleados POR_HORAS
- **THEN** las columnas `Entrada` y `Salida` muestran los valores `HH:MM` o `—`

---

### Requirement: Modal de registro manual diferencia entrada y salida por empleado
En el tab "Registro Manual" del modal QR, para empleados `POR_HORAS`, SHALL mostrarse dos campos de hora (`hora_entrada` y `hora_salida`) en lugar del toggle PRESENTE/AUSENTE. Para empleados `JORNADA_COMPLETA` SHALL mantenerse el toggle.

#### Scenario: Empleado POR_HORAS en modal manual
- **WHEN** el Residente abre el modal de registro manual con una cuadrilla mixta (algunos JORNADA_COMPLETA, otros POR_HORAS)
- **THEN** cada fila muestra el control apropiado según el `modo_asistencia` del empleado

#### Scenario: Guardar registro manual con horas
- **WHEN** el Residente completa `hora_entrada = '07:15'` y `hora_salida = '15:45'` para un empleado POR_HORAS y guarda
- **THEN** el sistema llama a `POST /asistencia/bulk` con los campos de hora y el backend calcula las horas trabajadas

---

### Requirement: Indicador visual de jornada incompleta en asistencia
El sistema SHALL mostrar un indicador visual en la tabla de asistencia cuando un empleado `POR_HORAS` tiene `hora_entrada` registrada pero no `hora_salida` al finalizar la jornada programada.

#### Scenario: Jornada sin cierre
- **WHEN** la hora actual supera `hora_salida_programada` del empleado y su registro del día no tiene `hora_salida`
- **THEN** la fila del empleado en la tabla de asistencia muestra un badge "Sin salida" en color ámbar
