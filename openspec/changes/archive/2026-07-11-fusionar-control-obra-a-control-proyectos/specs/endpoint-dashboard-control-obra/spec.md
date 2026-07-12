## MODIFIED Requirements

### Requirement: Endpoint de dashboard de Control de Obra
El sistema SHALL exponer un endpoint de dashboard con el avance físico vs.
financiero por WBS, riesgos activos, estimaciones pendientes y alertas de
desviación, bajo `GET /api/v1/control-proyectos/dashboard-obra?proyectoId=<uuid>`
(anteriormente `GET /api/v1/control-obra/dashboard`), accesible a los roles
`director`, `control_obra` y `admin`, manteniendo exactamente el mismo
shape de respuesta que tenía en `control-obra`.

#### Scenario: Consulta exitosa con Finanzas disponible
- **WHEN** un usuario con rol `director`, `control_obra` o `admin` hace
  `GET /api/v1/control-proyectos/dashboard-obra?proyectoId=<uuid>`
- **THEN** el sistema responde 200 con `avance_general.fisico_pct`
  (promedio ponderado de estimaciones aprobadas por WBS en BD local),
  `avance_general.financiero_pct` (obtenido de
  `http://finanzas:3004/api/v1/finanzas/presupuestos?proyectoId=X`),
  `avance_general.delta_pct`, `semaforo_wbs[]`, `riesgos_activos`,
  `estimaciones_pendientes`, `alertas[]` y `parcial: false`

#### Scenario: Finanzas no disponible (fail-soft)
- **WHEN** la llamada B2B a Finanzas falla o excede el timeout
- **THEN** el sistema responde 200 con `financiero_pct: null`,
  `delta_pct: null` y `parcial: true`, sin bloquear el resto de la
  respuesta

#### Scenario: Cálculo del semáforo por capítulo WBS
- **WHEN** se calcula `semaforo_wbs` para un capítulo
- **THEN** el estado es `verde` si el delta entre avance físico y
  financiero es menor a 5%, `amarillo` si está entre 5% y 15%, y `rojo` si
  el avance financiero supera al físico en más de 15%

#### Scenario: Rol no autorizado
- **WHEN** un usuario sin rol `director`, `control_obra` ni `admin` intenta
  consultar el endpoint
- **THEN** el sistema responde 403 sin exponer ningún dato del dashboard
