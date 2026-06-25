## ADDED Requirements

### Requirement: KPIs de inventario en dashboard
El sistema SHALL exponer `GET /api/v1/almacen/dashboard` que retorna métricas agregadas del inventario del proyecto activo para renderizar el dashboard del módulo.

Response incluye:
- `total_items`: número total de ItemInventario
- `items_bajo_minimo`: count de items con `stock_actual < stock_minimo` y `stock_actual > 0`
- `items_agotados`: count de items con `stock_actual = 0`
- `movimientos_hoy`: count de MovimientoAlmacen con `fecha` = hoy
- `recepciones_pendientes`: count de OCs en estado `EMITIDA` o `PARCIALMENTE_RECIBIDA` (dato provisto por Compras vía endpoint interno o cacheado)
- `alertas[]`: lista de los primeros 5 items bajo mínimo, con `clave`, `descripcion`, `stock_actual`, `stock_minimo`

#### Scenario: Dashboard con datos
- **WHEN** usuario autenticado hace `GET /api/v1/almacen/dashboard`
- **THEN** el sistema retorna 200 con todos los KPIs calculados para el proyecto activo

#### Scenario: Dashboard sin items en inventario
- **WHEN** el proyecto no tiene ningún `ItemInventario`
- **THEN** todos los counts retornan 0 y `alertas: []`

### Requirement: Vista dashboard en AlmacenView
La vista `AlmacenView.tsx` SHALL mostrar al entrar al módulo (antes de seleccionar cualquier tab) un dashboard con 4 KPI cards, una lista de alertas de stock mínimo y una tabla de últimos movimientos del día.

#### Scenario: Renderizado de KPI cards
- **WHEN** usuario navega a `/almacen`
- **THEN** la vista muestra 4 cards: "Total items", "Bajo mínimo ⚠", "Agotados 🔴", "Movimientos hoy"

#### Scenario: Alerta de stock visible
- **WHEN** existen items con `stock_actual < stock_minimo`
- **THEN** aparece una sección de alertas con los items afectados y botón "Crear REQ →" que navega a Compras > Nueva Requisición

#### Scenario: Sin alertas activas
- **WHEN** todos los items tienen `stock_actual >= stock_minimo`
- **THEN** la sección de alertas no se renderiza o muestra "Sin alertas de stock"
