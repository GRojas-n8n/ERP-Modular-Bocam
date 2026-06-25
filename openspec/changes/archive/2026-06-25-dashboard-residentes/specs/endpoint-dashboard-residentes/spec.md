# endpoint-dashboard-residentes

## Interface

```
GET /api/v1/control-obra/dashboard/residente?proyectoId=<uuid>
Headers: Authorization: Bearer <jwt>
Roles: residente, admin

Response 200:
{
  "evaluaciones_pendientes": 2,    // cuadros donde soy evaluador técnico y estado = EN_EVALUACION
  "mis_requisiciones": {
    "pendientes": 4,               // mis reqs en estado PENDIENTE o RECHAZADA
    "aprobadas_mes": 7
  },
  "ocs_por_recibir": [
    {
      "oc_id": "uuid",
      "folio": "OC-2026-012",
      "proveedor": "Materiales SA",
      "monto": 85000.00,
      "estado": "EMITIDA",
      "fecha_estimada": "2026-06-28T00:00:00Z"
    }
  ],
  "alertas": [
    {
      "tipo": "OC_VENCIDA",
      "folio": "OC-2026-008",
      "mensaje": "OC con fecha de entrega vencida hace 2 días"
    }
  ],
  "parcial": false
}
```

## Logic

- `evaluaciones_pendientes`: BD local de control-obra — comparativas asignadas al userId con estado `EN_EVALUACION_TECNICA`
- `mis_requisiciones`: BD local — requisiciones donde `creado_por = userId`
- `ocs_por_recibir`: llama a `http://compras:3002/api/v1/compras/ordenes-compra?proyectoId=X&estado=EMITIDA,PARCIALMENTE_RECIBIDA` (backend-to-backend, propagando Authorization)
- Si Compras falla: retorna `ocs_por_recibir: []` y `parcial: true`
- Alerta `OC_VENCIDA`: OCs con `tiempo_entrega_estimado` en el pasado y estado ≠ RECIBIDA
