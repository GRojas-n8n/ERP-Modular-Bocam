## ADDED Requirements

### Requirement: Tab Control Presupuestal en GerenciaTecnicaView
`GerenciaTecnicaView.tsx` SHALL agregar una pestaña "Control Presupuestal" que muestra la tabla de partidas del reporte. La vista llama únicamente a `GET /api/v1/gerencia-tecnica/reportes/control-presupuestal?proyectoId=<cc_activo>` (no cross-service en frontend).

#### Scenario: Tabla de partidas cargada
- **WHEN** el CC activo tiene presupuesto aprobado y el reporte carga correctamente
- **THEN** se muestra tabla con columnas: Clave, Descripción, Categoría, Presupuestado, Comprometido, Pagado, Disponible, % Ejercido. Filas ordenadas por clave de concepto.

#### Scenario: Barra de progreso por partida
- **WHEN** una partida tiene `pct_ejercido > 0`
- **THEN** se muestra una mini barra de progreso (0-100%) con color: verde ≤ 70%, amarillo 71-90%, rojo > 90%

#### Scenario: Alerta de partida en riesgo
- **WHEN** `comprometido > presupuestado * 0.90` para alguna partida
- **THEN** la fila se resalta con fondo ámbar claro y badge "En riesgo"

#### Scenario: Partidas sin clasificar
- **WHEN** el reporte incluye monto comprometido o pagado sin `concepto_id` (OCs/pagos legacy)
- **THEN** se muestra una fila adicional al final: "[Sin partida]" con los montos sin asignar

#### Scenario: Filtro por categoría
- **WHEN** el usuario selecciona una categoría en el selector (TODAS / MATERIAL / MANO_DE_OBRA / EQUIPO / SUBCONTRATO / INDIRECTO)
- **THEN** la tabla filtra las filas por `categoria_predominante` de la partida

#### Scenario: Respuesta parcial
- **WHEN** el endpoint retorna `parcial: true`
- **THEN** se muestra banner amarillo: "Datos incompletos — uno o más servicios no respondieron. Los montos mostrados pueden ser aproximados."

#### Scenario: Exportar PDF
- **WHEN** el usuario hace clic en "Exportar PDF"
- **THEN** el frontend llama `POST /api/v1/gerencia-tecnica/reportes/control-presupuestal/export?formato=PDF` y el navegador descarga el archivo

#### Scenario: Exportar Excel
- **WHEN** el usuario hace clic en "Exportar Excel"
- **THEN** el frontend llama `POST /api/v1/gerencia-tecnica/reportes/control-presupuestal/export?formato=XLSX` y el navegador descarga el archivo

### Requirement: Widget resumen en ComprasView
`ComprasView.tsx` SHALL mostrar un widget compacto de control presupuestal en la tab de trazabilidad o como panel lateral. Llama al mismo endpoint `/api/v1/gerencia-tecnica/reportes/control-presupuestal` desde el frontend (el frontend de Compras puede llamar al endpoint de GT — datos cruzados via backend, no via BD directa).

#### Scenario: Widget muestra totales del CC activo
- **WHEN** la tab de trazabilidad está activa y el CC selector tiene un proyecto seleccionado
- **THEN** se muestra panel con: Total Presupuestado, Total Comprometido, Total Pagado, Disponible y % ejercido global

#### Scenario: Alerta global de presupuesto
- **WHEN** `total_comprometido > total_presupuestado * 0.85`
- **THEN** el widget muestra badge rojo "Presupuesto en riesgo" con el porcentaje comprometido

#### Scenario: Sin presupuesto activo
- **WHEN** el endpoint retorna 404 (sin presupuesto para el CC)
- **THEN** el widget muestra "Sin presupuesto activo para este proyecto"
