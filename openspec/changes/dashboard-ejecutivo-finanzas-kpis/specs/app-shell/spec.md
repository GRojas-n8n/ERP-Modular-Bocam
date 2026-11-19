## MODIFIED Requirements

### Requirement: La tarjeta de Finanzas del dashboard ejecutivo SHALL leer el contrato estándar
La tarjeta SHALL tomar los montos de `data.kpis` de `GET /api/v1/finanzas/dashboard` y SHALL mostrar "Error" solo
cuando la petición falle o no traiga `kpis`.

#### Scenario: Respuesta 200 con kpis
- **WHEN** el servicio responde `{ kpis: { total_autorizado: 1000, ... }, alertas: [], actividad_reciente: [] }`
- **THEN** la tarjeta SHALL mostrar el estado Online y los montos, no "Error"
