# endpoint-dashboard-rrhh

## Interface

```
GET /api/v1/personal/dashboard
Headers: Authorization: Bearer <jwt>
Roles: rrhh, admin

Response 200:
{
  "empleados_activos": 45,
  "asistencia_hoy": {
    "presentes": 38,
    "ausentes": 7,
    "porcentaje": 84.4
  },
  "incidencias_pendientes": 3,     // incidencias sin resolver (permisos, faltas, etc.)
  "nomina_proximo_corte": "2026-06-30T00:00:00Z",
  "alertas": [
    {
      "tipo": "AUSENCIA_INJUSTIFICADA",
      "empleado": "Juan Pérez",
      "dias": 2,
      "mensaje": "2 días de ausencia injustificada"
    }
  ],
  "distribucion_jornada": [
    { "tipo": "COMPLETA", "count": 30 },
    { "tipo": "POR_HORAS", "count": 10 },
    { "tipo": "DESTAJO", "count": 5 }
  ]
}
```

## Logic

- Todo nativo de `apps/personal` — sin llamadas cross-service
- `empleados_activos`: `SELECT count(*) FROM empleados WHERE estado = 'ACTIVO' AND tenant_id = ?`
- `asistencia_hoy`: registros de asistencia con `fecha = CURRENT_DATE` por tenant (calculado en tiempo real, no cacheado)
- `incidencias_pendientes`: incidencias con estado `PENDIENTE` o `EN_REVISION`
- `nomina_proximo_corte`: fecha del próximo corte de nómina configurado en el sistema
- Alerta `AUSENCIA_INJUSTIFICADA`: empleados con ≥ 2 días ausencia injustificada consecutivos
