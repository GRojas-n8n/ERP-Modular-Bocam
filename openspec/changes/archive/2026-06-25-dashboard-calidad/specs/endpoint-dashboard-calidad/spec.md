# endpoint-dashboard-calidad

## Interface

```
GET /api/v1/calidad/dashboard?proyectoId=<uuid>
Headers: Authorization: Bearer <jwt>
Roles: calidad, director, admin

Response 200:
{
  "ncs_abiertas": 5,
  "ncs_vencidas": 2,              // NC con fecha_limite_cierre < hoy y estado != CERRADA
  "auditorias_programadas": 1,    // auditorías con fecha en los próximos 30 días
  "indice_calidad": 87.5,         // % de NCs cerradas en tiempo / total NCs del período
  "distribucion_ncs": [
    { "tipo": "MAYOR", "count": 2 },
    { "tipo": "MENOR", "count": 3 },
    { "tipo": "OBSERVACION", "count": 7 }
  ],
  "alertas": [
    {
      "nc_id": "uuid",
      "folio": "NC-2026-018",
      "descripcion": "No conformidad mayor vencida hace 3 días",
      "severidad": "critica"
    }
  ],
  "reciente": [
    {
      "tipo": "NC_CERRADA",
      "folio": "NC-2026-015",
      "fecha": "2026-06-22T09:00:00Z"
    }
  ]
}
```

## Logic

- Todo desde BD propia de `calidad` — sin llamadas cross-service
- `ncs_vencidas`: `SELECT count(*) FROM no_conformidades WHERE fecha_limite_cierre < NOW() AND estado != 'CERRADA' AND proyecto_id = ?`
- `indice_calidad`: NCs cerradas dentro del plazo / total NCs del mes × 100
- `auditorias_programadas`: auditorías con `fecha_programada BETWEEN NOW() AND NOW() + INTERVAL '30 days'`
- Alerta `critica` para NCs mayores vencidas
