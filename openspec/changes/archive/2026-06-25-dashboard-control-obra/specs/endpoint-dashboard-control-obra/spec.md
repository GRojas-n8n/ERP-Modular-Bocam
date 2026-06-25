# endpoint-dashboard-control-obra

## Interface

```
GET /api/v1/control-obra/dashboard?proyectoId=<uuid>
Headers: Authorization: Bearer <jwt>
Roles: director, control_obra, admin

Response 200:
{
  "avance_general": {
    "fisico_pct": 42.5,           // avance físico promedio ponderado de WBS
    "financiero_pct": 38.0,       // ejercido / autorizado desde Finanzas
    "delta_pct": 4.5              // fisico - financiero (positivo = adelantado)
  },
  "semaforo_wbs": [
    {
      "capitulo": "ESTRUCTURAS",
      "avance_fisico": 60.0,
      "avance_financiero": 55.0,
      "estado": "verde"           // verde|amarillo|rojo
    },
    {
      "capitulo": "ACABADOS",
      "avance_fisico": 20.0,
      "avance_financiero": 35.0,
      "estado": "rojo"            // financiero supera físico
    }
  ],
  "riesgos_activos": 3,
  "estimaciones_pendientes": 2,
  "alertas": [
    {
      "tipo": "DESVIACION_WBS",
      "capitulo": "ACABADOS",
      "mensaje": "Capítulo ACABADOS: avance financiero supera físico en 15%"
    }
  ],
  "parcial": false
}
```

## Logic

- `avance_general.fisico_pct`: promedio ponderado de estimaciones aprobadas por WBS en BD local
- `avance_general.financiero_pct`: llama a `http://finanzas:3004/api/v1/finanzas/presupuestos?proyectoId=X` (backend-to-backend) para obtener `monto_ejercido / monto_autorizado`
- Si Finanzas falla: `financiero_pct: null`, `delta_pct: null`, `parcial: true`
- `semaforo_wbs` estado: verde si delta < 5%, amarillo si 5-15%, rojo si financiero > físico + 15%
- `riesgos_activos`: count de riesgos con estado `ACTIVO` o `EN_MITIGACION` en BD local
- `estimaciones_pendientes`: estimaciones en estado `BORRADOR` o `EN_REVISION`
