## ADDED Requirements

### Requirement: Motor de nómina usa modo_asistencia para elegir algoritmo de cálculo
Al calcular pre-nómina, el motor SHALL detectar el `modo_asistencia` de cada empleado y aplicar el algoritmo correspondiente. Empleados `JORNADA_COMPLETA` se calculan por días (comportamiento actual). Empleados `POR_HORAS` se calculan por horas reales.

#### Scenario: Empleado JORNADA_COMPLETA mantiene cálculo por días
- **WHEN** el motor procesa un empleado con `modo_asistencia = JORNADA_COMPLETA`
- **THEN** calcula `salario_base = dias_presentes × salario_diario` (sin cambios respecto al comportamiento previo)

#### Scenario: Empleado POR_HORAS usa horas reales
- **WHEN** el motor procesa un empleado con `modo_asistencia = POR_HORAS`
- **THEN** calcula `tarifa_hora = salario_diario / horas_jornada` y `salario_base = sum(horas_normales_dia) × tarifa_hora`

---

### Requirement: Acumulador semanal de horas extra para empleados POR_HORAS
El motor SHALL agrupar los `horas_extra_dia` del período por semana natural (lunes–domingo) para cada empleado `POR_HORAS`. Dentro de cada semana: las primeras 9 horas de HE son DOBLE (200%), las horas adicionales son TRIPLE (300%), conforme LFT Art. 66-68.

**Fórmulas por semana:**
```
he_doble_semana  = min(he_acum_semana, 9)
he_triple_semana = max(0, he_acum_semana − 9)
monto_he_semana  = (he_doble_semana × tarifa_hora × 2) + (he_triple_semana × tarifa_hora × 3)
```
El monto total de HE del período es la suma de `monto_he_semana` de todas las semanas involucradas.

#### Scenario: Horas extra dentro del límite doble (≤ 9h/semana)
- **WHEN** un empleado acumula 6h extra en una semana
- **THEN** el motor calcula `monto_he = 6 × tarifa_hora × 2` (todas al 200%)

#### Scenario: Horas extra superando el límite doble (> 9h/semana)
- **WHEN** un empleado acumula 12h extra en una semana
- **THEN** el motor calcula `monto_he = (9 × tarifa_hora × 2) + (3 × tarifa_hora × 3)`

#### Scenario: Período quincenal con dos semanas
- **WHEN** el período cubre dos semanas con 7h y 4h de HE respectivamente
- **THEN** el motor procesa cada semana por separado: semana 1 → 7h doble; semana 2 → 4h doble; total = 11h doble

---

### Requirement: Detalle de pre-nómina incluye origen de horas y desglose HE
El endpoint `GET /prenominas/:id/detalle` SHALL incluir en cada `PreNominaDetalle` los campos `horas_normales`, `horas_extra`, `monto_he_doble`, `monto_he_triple` y `origen_horas` para empleados `POR_HORAS`.

#### Scenario: Desglose completo en detalle de prenomina
- **WHEN** se consulta `GET /prenominas/:id/detalle` para una prenomina con empleados POR_HORAS
- **THEN** cada detalle incluye `horas_normales`, `horas_extra`, `monto_he_doble`, `monto_he_triple` además de los campos existentes

#### Scenario: Campo origen_horas indica si las horas son reales o estimadas
- **WHEN** un empleado POR_HORAS no registró salida en algún día del período
- **THEN** el detalle de ese empleado tiene `origen_horas = 'ESTIMADO'`; si todas las horas son reales, `origen_horas = 'REAL'`

---

### Requirement: Pre-nómina muestra resumen de horas en PersonalView
En la vista de detalle de pre-nómina (PersonalView, modal desglose), los empleados `POR_HORAS` SHALL mostrar columnas de `Horas Normales`, `H.Extra Doble`, `H.Extra Triple` en lugar de o adicional a la columna `Días`. Empleados `JORNADA_COMPLETA` continúan mostrando `Días`.

#### Scenario: Vista mixta con ambos modos en la misma prenomina
- **WHEN** la prenomina incluye empleados de ambos modos
- **THEN** la tabla muestra "Días" para JORNADA_COMPLETA y "Horas" para POR_HORAS con el desglose correspondiente
