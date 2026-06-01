## ADDED Requirements

### Requirement: RH configura modo de asistencia por empleado
El sistema SHALL permitir que un usuario con rol `personal_rh` o `admin` configure el campo `modo_asistencia` en la ficha de cada empleado. Los valores válidos son `JORNADA_COMPLETA` y `POR_HORAS`. El valor por defecto SHALL ser `JORNADA_COMPLETA`.

#### Scenario: Guardar modo JORNADA_COMPLETA
- **WHEN** RH edita un empleado y selecciona `modo_asistencia = JORNADA_COMPLETA`
- **THEN** el sistema guarda el cambio y no muestra ni requiere campos de horario programado

#### Scenario: Guardar modo POR_HORAS con horario completo
- **WHEN** RH edita un empleado, selecciona `modo_asistencia = POR_HORAS` e ingresa `hora_entrada_programada`, `hora_salida_programada` y `horas_jornada`
- **THEN** el sistema guarda todos los campos y retorna el empleado actualizado

#### Scenario: Intentar guardar POR_HORAS sin horario programado
- **WHEN** RH selecciona `modo_asistencia = POR_HORAS` sin proporcionar `hora_entrada_programada` o `hora_salida_programada`
- **THEN** el sistema retorna `400` con mensaje indicando que los campos de horario son obligatorios en modo POR_HORAS

---

### Requirement: Campos de jornada visibles en PersonalView
El sistema SHALL mostrar en la ficha del empleado (PersonalView, tab `empleados`) una sección "Jornada" que contenga los controles de `modo_asistencia`, `tipo_jornada`, `hora_entrada_programada`, `hora_salida_programada` y `horas_jornada`. Los campos de horario SHALL mostrarse condicionalmente solo cuando `modo_asistencia = POR_HORAS`.

#### Scenario: Modo JORNADA_COMPLETA oculta campos de horario
- **WHEN** el usuario abre la configuración de un empleado con `modo_asistencia = JORNADA_COMPLETA`
- **THEN** los campos `hora_entrada_programada`, `hora_salida_programada` y `horas_jornada` no son visibles en la UI

#### Scenario: Modo POR_HORAS muestra campos de horario
- **WHEN** el usuario cambia `modo_asistencia` a `POR_HORAS` en la UI
- **THEN** los campos `hora_entrada_programada`, `hora_salida_programada`, `horas_jornada` y `tipo_jornada` son visibles y editables

---

### Requirement: Endpoint PATCH /empleados/:id para campos de jornada
El sistema SHALL aceptar los campos `modo_asistencia`, `tipo_jornada`, `hora_entrada_programada`, `hora_salida_programada` y `horas_jornada` en `PATCH /api/v1/personal/empleados/:id`. Requiere rol `personal_rh` o `admin`.

#### Scenario: Actualización parcial de jornada
- **WHEN** se envía `PATCH /empleados/:id` con solo `modo_asistencia: "POR_HORAS"` y los campos de horario
- **THEN** el sistema actualiza únicamente los campos enviados y retorna el empleado completo actualizado

#### Scenario: Validación de horas_jornada
- **WHEN** se envía `horas_jornada` con un valor menor a 1 o mayor a 24
- **THEN** el sistema retorna `400` con mensaje de validación
