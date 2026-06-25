## ADDED Requirements

### Requirement: GET /api/v1/compras/dashboard
El microservicio compras SHALL exponer `GET /api/v1/compras/dashboard` que retorna KPIs agregados del proyecto activo en una sola respuesta.

Response shape:
```json
{
  "kpis": {
    "total_requisiciones": number,
    "pendiente_aprobacion": number,
    "lista_cotizar": number,
    "cotizando": number,
    "pendiente_gt": number,
    "ocs_emitidas": number,
    "ocs_pendientes_recibir": number
  },
  "alertas": [
    { "tipo": "cotizacion_vencida", "req_id": string, "folio": string, "dias_vencida": number }
  ],
  "actividad_reciente": [
    { "id": string, "folio": string, "concepto": string, "estado": string, "updated_at": string }
  ]
}
```

#### Scenario: Dashboard con datos del proyecto
- **WHEN** usuario compras hace `GET /api/v1/compras/dashboard`
- **THEN** retorna 200 con KPIs calculados para el proyecto activo del token

#### Scenario: Alertas de cotización vencida
- **WHEN** existen `SolicitudCotizacion` con `alerta_plazo = true`
- **THEN** aparecen en `alertas[]` con `tipo: "cotizacion_vencida"` y los días de retraso

#### Scenario: Actividad reciente
- **WHEN** se solicita el dashboard
- **THEN** `actividad_reciente` contiene las últimas 5 `Requisicion` modificadas, ordenadas por `updated_at DESC`
