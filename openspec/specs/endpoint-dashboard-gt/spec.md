# endpoint-dashboard-gt

## Interface

```
GET /api/v1/gerencia-tecnica/dashboard
Headers: Authorization: Bearer <jwt>
Roles: gerencia_tecnica, admin

Response 200:
{
  "pendientes_revision": 3,        // cuadros EN_APROBACION_GT
  "en_evaluacion_tecnica": 5,      // cuadros EVALUADO_TECNICAMENTE esperando envío a GT
  "aprobados_este_mes": 8,
  "monto_comprometido": 1250000.00,
  "alertas": [
    {
      "comparativa_id": "uuid",
      "folio": "CMP-001",
      "proyecto": "Edificio Torre A",
      "dias_en_espera": 6,
      "mensaje": "Cuadro esperando aprobación GT por 6 días"
    }
  ],
  "reciente": [
    {
      "comparativa_id": "uuid",
      "folio": "CMP-002",
      "proyecto": "Edificio Torre B",
      "estado": "APROBADO_GT",
      "fecha": "2026-06-20T10:00:00Z"
    }
  ],
  "parcial": false
}
```

## Logic

- Llama a `http://compras:3002/api/v1/compras/comparativas/pendientes-gt` (backend-to-backend) con `Authorization` del usuario propagado
- Si Compras responde 2xx: procesa y retorna data completa con `parcial: false`
- Si Compras falla o timeout (>3s): retorna `{ pendientes_revision: 0, en_evaluacion_tecnica: 0, aprobados_este_mes: 0, monto_comprometido: 0, alertas: [], reciente: [], parcial: true }`
- Alerta = cuadro en `EN_APROBACION_GT` con `updated_at` > 3 días sin cambio
