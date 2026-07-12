## MODIFIED Requirements

### Requirement: Sección de dashboard en la vista de Control de Obra
El sistema SHALL mostrar, en la sección superior de
`apps/app-shell/src/views/ControlObraView.tsx`, el avance general
(físico vs. financiero), el semáforo por capítulo WBS, el conteo de
riesgos activos y estimaciones pendientes, y un listado de alertas de
desviación — consumiendo el endpoint fusionado
`GET /api/v1/control-proyectos/dashboard-obra` en vez de
`GET /api/v1/control-obra/dashboard`, sin cambios visuales respecto al
comportamiento documentado previamente.

#### Scenario: Renderizado con datos completos
- **WHEN** el endpoint responde `parcial: false`
- **THEN** la vista muestra la barra de avance físico en verde, la
  financiera en azul, la diferencia en rojo si el financiero supera al
  físico, el semáforo WBS con punto verde/amarillo/rojo por capítulo, y las
  tarjetas de riesgos activos y estimaciones pendientes

#### Scenario: Datos financieros no disponibles
- **WHEN** el endpoint responde `parcial: true`
- **THEN** la vista muestra el banner "Datos financieros no disponibles
  (Finanzas offline)" sin ocultar el resto de la sección

#### Scenario: Visibilidad restringida por rol
- **WHEN** el usuario autenticado no tiene rol `director`, `control_obra`
  ni `admin`
- **THEN** la sección de dashboard no se renderiza en `ControlObraView.tsx`
