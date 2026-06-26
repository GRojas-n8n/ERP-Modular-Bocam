# frontend-control-presupuestal

## Tab Control Presupuestal en GerenciaTecnicaView (InsumosView)

`GerenciaTecnicaView.tsx` / `InsumosView.tsx` incluye pestaña "Control Presupuestal" que llama únicamente a `GET /api/v1/gerencia-tecnica/reportes/control-presupuestal` (no cross-service en frontend).

### Scenarios

#### Scenario: Tabla de partidas cargada
- **WHEN** el CC activo tiene presupuesto aprobado
- **THEN** tabla con columnas: Clave, Descripción, Categoría, Presupuestado, Comprometido, Pagado, Disponible, % Ejercido — filas ordenadas por clave

#### Scenario: Barra de progreso por partida
- **WHEN** `pct_ejercido > 0`
- **THEN** mini barra de progreso con color: verde ≤ 70%, amarillo 71-90%, rojo > 90%

#### Scenario: Alerta de partida en riesgo
- **WHEN** `comprometido > presupuestado * 0.90`
- **THEN** fila con fondo ámbar + badge "En riesgo"

#### Scenario: Partidas sin clasificar
- **WHEN** el reporte incluye montos sin `concepto_id` (OCs/pagos legacy)
- **THEN** fila "[Sin partida]" al final con los montos sin asignar

#### Scenario: Filtro por categoría
- **WHEN** usuario selecciona categoría (TODAS / MATERIAL / MANO_DE_OBRA / EQUIPO / SUBCONTRATO / INDIRECTO)
- **THEN** tabla filtra filas por `categoria_predominante`

#### Scenario: Respuesta parcial
- **WHEN** endpoint retorna `parcial: true`
- **THEN** banner amarillo: "Datos incompletos — uno o más servicios no respondieron. Los montos mostrados pueden ser aproximados."

#### Scenario: Exportar PDF
- **WHEN** usuario clic "Exportar PDF"
- **THEN** `POST /api/v1/gerencia-tecnica/reportes/control-presupuestal/export` con `{ formato: "PDF" }` — descarga archivo vía `URL.createObjectURL`

#### Scenario: Exportar Excel
- **WHEN** usuario clic "Exportar Excel"
- **THEN** `POST /api/v1/gerencia-tecnica/reportes/control-presupuestal/export` con `{ formato: "XLSX" }` — descarga archivo

---

## Widget resumen en ComprasView

`ComprasView.tsx` muestra widget compacto en la tab de trazabilidad. Llama al mismo endpoint `/api/v1/gerencia-tecnica/reportes/control-presupuestal` desde el frontend (datos cruzados via backend GT, no via BD directa).

### Scenarios

#### Scenario: Widget muestra totales del CC activo
- **WHEN** tab trazabilidad activa y proyecto seleccionado
- **THEN** panel con: Total Presupuestado, Comprometido, Pagado, Disponible y % ejercido global

#### Scenario: Alerta global de presupuesto
- **WHEN** `total_comprometido > total_presupuestado * 0.85`
- **THEN** badge rojo "Presupuesto en riesgo"

#### Scenario: Sin presupuesto activo
- **WHEN** endpoint retorna 404
- **THEN** widget muestra "Sin presupuesto activo para este proyecto"
