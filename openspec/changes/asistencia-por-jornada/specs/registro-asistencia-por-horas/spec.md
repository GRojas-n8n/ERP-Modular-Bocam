## ADDED Requirements

### Requirement: Registro de hora de entrada
El sistema SHALL registrar `hora_entrada` en formato `HH:MM` cuando se recibe el primer scan QR o registro manual del día para un empleado con `modo_asistencia = POR_HORAS`. Si ya existe un registro para ese empleado/fecha con `hora_entrada` definida y `hora_salida` nula, el sistema SHALL interpretar el evento como salida (D2 del design).

#### Scenario: Primer scan del día registra entrada
- **WHEN** se recibe `POST /asistencia/registro` con `tipo_scan = 'AUTO'` para un empleado `POR_HORAS` sin registro previo en esa fecha
- **THEN** el sistema crea el registro con `hora_entrada = hora actual`, `estado = 'PRESENTE'`, `hora_salida = null`

#### Scenario: Registro manual de entrada con hora explícita
- **WHEN** el Residente envía `POST /asistencia/registro` con `tipo_scan = 'ENTRADA'` y `hora_entrada = '07:30'`
- **THEN** el sistema guarda `hora_entrada = '07:30'` sin calcular horas trabajadas aún

#### Scenario: Empleado JORNADA_COMPLETA ignora hora de entrada
- **WHEN** se registra asistencia para un empleado con `modo_asistencia = JORNADA_COMPLETA`
- **THEN** el sistema guarda el registro con `estado` (PRESENTE/AUSENTE) y NO almacena `hora_entrada` ni `hora_salida`

---

### Requirement: Registro de hora de salida y cálculo automático
Cuando se registra `hora_salida` para un empleado `POR_HORAS`, el sistema SHALL calcular automáticamente `horas_trabajadas`, `horas_normales` y `horas_extra_dia` y almacenarlos en el registro.

**Fórmulas:**
```
horas_trabajadas = hora_salida − hora_entrada  (en horas decimales, con +24h si salida < entrada)
horas_normales   = min(horas_trabajadas, empleado.horas_jornada)
horas_extra_dia  = max(0, horas_trabajadas − empleado.horas_jornada)
```

#### Scenario: Salida normal registra horas trabajadas
- **WHEN** se recibe `POST /asistencia/registro` con `tipo_scan = 'AUTO'` y ya existe `hora_entrada` sin `hora_salida`
- **THEN** el sistema actualiza el registro con `hora_salida`, `horas_trabajadas`, `horas_normales` y `horas_extra_dia` calculados

#### Scenario: Turno nocturno cruzando medianoche
- **WHEN** `hora_entrada = '22:00'` y `hora_salida = '06:00'` del día siguiente
- **THEN** el sistema calcula `horas_trabajadas = 8.0` sumando 24h a la salida antes del cálculo

#### Scenario: Salida antes de completar la jornada
- **WHEN** `hora_entrada = '07:00'`, `hora_salida = '12:00'` y `horas_jornada = 8`
- **THEN** `horas_trabajadas = 5.0`, `horas_normales = 5.0`, `horas_extra_dia = 0`

#### Scenario: Salida con horas extra
- **WHEN** `hora_entrada = '07:00'`, `hora_salida = '16:30'` y `horas_jornada = 8`
- **THEN** `horas_trabajadas = 9.5`, `horas_normales = 8.0`, `horas_extra_dia = 1.5`

---

### Requirement: Registro sin hora de salida al cierre del período
Si al calcular la pre-nómina un empleado `POR_HORAS` tiene registros con `hora_entrada` pero sin `hora_salida`, el motor SHALL asumir `horas_trabajadas = horas_jornada` (jornada completa) y marcar `origen_horas = 'ESTIMADO'` en el detalle.

#### Scenario: Motor asume jornada completa si falta salida
- **WHEN** el motor de nómina encuentra un registro con `hora_entrada` definida y `hora_salida = null`
- **THEN** usa `horas_normales = horas_jornada`, `horas_extra_dia = 0` y marca `origen_horas = 'ESTIMADO'`

---

### Requirement: Corrección manual de hora de entrada o salida
El sistema SHALL permitir corregir `hora_entrada`, `hora_salida` y recalcular automáticamente mediante `PATCH /asistencia/:id`. Requiere rol `personal_rh` o `admin`.

#### Scenario: Corrección recalcula horas automáticamente
- **WHEN** se envía `PATCH /asistencia/:id` con `hora_salida = '15:00'` corregida
- **THEN** el sistema actualiza `hora_salida`, recalcula `horas_trabajadas`, `horas_normales` y `horas_extra_dia`
