## ADDED Requirements

### Requirement: Sección de dashboard al entrar a Compras
`ComprasView.tsx` SHALL mostrar una sección de dashboard antes de los tabs de navegación cuando el usuario entra a `/compras`. La sección hace una sola llamada a `GET /api/v1/compras/dashboard` y renderiza: 4 KPI cards, alertas de cotizaciones vencidas (si las hay), y tabla de últimas 5 requisiciones modificadas.

KPI cards:
1. "Requisiciones" — `total_requisiciones` (slate)
2. "Pendientes aprobación" — `pendiente_aprobacion` (amber si > 0)
3. "Lista para cotizar" — `lista_cotizar` (blue)
4. "OCs emitidas" — `ocs_emitidas` (green)

#### Scenario: Dashboard carga al entrar al módulo
- **WHEN** usuario con rol compras navega a `/compras`
- **THEN** la sección de dashboard es lo primero visible, con las 4 KPI cards cargadas

#### Scenario: Alerta de cotización vencida visible
- **WHEN** `alertas` contiene items con `tipo: "cotizacion_vencida"`
- **THEN** aparece sección de alertas con cada req vencida, días de retraso, y botón que abre directamente la solicitud de cotización de esa req

#### Scenario: Sin alertas
- **WHEN** `alertas` está vacío
- **THEN** la sección de alertas no se renderiza

#### Scenario: Dashboard no bloquea los tabs
- **WHEN** la request a `/dashboard` está pendiente (loading)
- **THEN** los tabs de Requisiciones, Catálogo, etc. siguen siendo accesibles — el dashboard muestra skeleton loaders mientras carga
