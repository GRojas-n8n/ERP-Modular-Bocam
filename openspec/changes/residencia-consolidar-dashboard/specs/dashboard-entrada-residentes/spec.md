## MODIFIED Requirements

### Requirement: Panel superior del dashboard de residente
`apps/app-shell/src/views/ResidenciaView.tsx` SHALL mostrar, en la parte superior de la vista, un panel de KPIs alimentado por `GET /api/v1/control-proyectos/dashboard/residente` — nunca por llamadas directas a `personal` o `compras` desde el frontend para estos KPIs.

(Nota: el spec anterior decía `ResidentesView.tsx`, archivo que no existe en el código; el nombre real es `ResidenciaView.tsx`.)

El panel SHALL incluir, como mínimo, tiles para: requisiciones propias
(`mis_requisiciones`), estimaciones pendientes
(`estimaciones_pendientes`), prenóminas pendientes de revisión
(`prenominas_pendientes`) y complementos salariales pendientes de
revisión (`complementos_pendientes`), más la lista de OCs por recibir
(`ocs_por_recibir`, máximo 5, con link a la pestaña de Requisiciones) y
las alertas (`alertas`).

Si `parcial: true`, el panel SHALL mostrar una indicación visible de que
los datos son parciales, sin ocultar los tiles que sí llegaron.

Los datos completos de nómina (listado de prenóminas y complementos) SHALL cargarse de forma perezosa, solo cuando la pestaña "Nómina" está activa (`activeTab === 'nomina'`) — igual que ya ocurre para las pestañas Estimaciones, Asistencia, Mi Equipo y Requisiciones.

El `useEffect` de montaje de la vista SHALL NOT hacer llamadas directas a `personal`.

#### Scenario: Carga inicial con todos los servicios arriba
- **WHEN** un residente abre la vista y `control-proyectos`, Compras y
  `personal` responden correctamente
- **THEN** el panel muestra los 4 tiles con valores reales y la lista de
  OCs por recibir, sin que el navegador haya llamado a `personal` ni a
  `compras` directamente

#### Scenario: personal caído al momento de la carga inicial
- **WHEN** `personal` no responde durante la carga inicial
- **THEN** el panel sigue mostrando `mis_requisiciones` y
  `estimaciones_pendientes` con datos reales, los tiles de nómina
  quedan en estado "sin datos" y se muestra el indicador de datos
  parciales — la vista no se bloquea ni queda en blanco

#### Scenario: Abrir la pestaña Nómina
- **WHEN** el residente hace click en la pestaña "Nómina"
- **THEN** la vista dispara `GET /api/v1/personal/prenominas` y
  `GET /api/v1/personal/complementos` en ese momento (no antes), y
  muestra el listado completo con las acciones de "marcar revisado"
