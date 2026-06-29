## ADDED Requirements

### Requirement: Dashboard de calidad con KPIs de vencimiento y alertas ISO

El sistema SHALL ampliar `GET /api/v1/calidad/dashboard` para incluir, además de los KPIs de documentos existentes, los siguientes contadores de NC y auditorías: NCs vencidas, acciones correctivas vencidas, hallazgos MAYOR sin NC asociada, y auditorías en curso.

#### Scenario: Dashboard con datos completos
- **WHEN** usuario con rol `calidad`, `admin` o `superintendent` solicita `GET /api/v1/calidad/dashboard`
- **THEN** la respuesta incluye el objeto `kpis` con:
  - `documentos_vigentes: number`
  - `documentos_en_revision: number`
  - `ncs_abiertas: number` (estado ≠ CERRADA)
  - `ncs_vencidas: number` (fecha_limite < hoy AND estado ≠ CERRADA)
  - `acciones_vencidas: number` (fecha_compromiso < hoy AND estado NOT IN [COMPLETADA, VERIFICADA, CANCELADA])
  - `hallazgos_mayor_sin_nc: number` (tipo = MAYOR AND nc_id IS NULL AND estado ≠ CERRADO)
  - `auditorias_en_curso: number` (estado = EN_CURSO)
  - `auditorias_programadas: number` (estado = PROGRAMADA)

#### Scenario: Alerta NC vencida en dashboard
- **WHEN** existe al menos una NC con `fecha_limite < hoy` y estado ≠ CERRADA
- **THEN** la respuesta incluye en `alertas` un ítem con `tipo: "NC_VENCIDA"`, `count: N` y `mensaje: "N no conformidades vencidas sin cerrar"`

#### Scenario: Alerta hallazgo MAYOR sin NC
- **WHEN** existe al menos un hallazgo MAYOR con `nc_id IS NULL` y `estado ≠ CERRADO`
- **THEN** la respuesta incluye en `alertas` un ítem con `tipo: "HALLAZGO_MAYOR_SIN_NC"` y el conteo

#### Scenario: Dashboard sin alertas retorna array vacío
- **WHEN** todos los KPIs de alerta son 0
- **THEN** `alertas: []` en la respuesta
