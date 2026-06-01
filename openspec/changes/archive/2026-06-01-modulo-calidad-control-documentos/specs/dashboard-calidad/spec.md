# Spec: Dashboard de Calidad

## Criterios de Aceptación

### CA-1 — Endpoint de KPIs
- `GET /api/v1/calidad/dashboard` retorna en una sola llamada todos los indicadores del SGC.
- Respuesta `{ success: true, data: { ... } }` con los campos descritos en CA-2 a CA-4.

### CA-2 — Indicadores por estado de documentos
```json
{
  "documentos_por_estado": {
    "BORRADOR": 5,
    "EN_REVISION": 2,
    "VIGENTE": 34,
    "OBSOLETO": 12
  },
  "total_documentos": 53
}
```

### CA-3 — Indicadores por tipo de documento
```json
{
  "documentos_por_tipo": {
    "PLANO": 18,
    "PROCEDIMIENTO": 8,
    "INSTRUCTIVO": 4,
    "ESPECIFICACION": 6,
    "MANUAL": 3,
    "REGISTRO": 10,
    "OTRO": 4
  }
}
```

### CA-4 — Versiones pendientes de acción
```json
{
  "versiones_pendientes_revision": 2,
  "versiones_en_borrador_sin_archivo": 1
}
```
- `versiones_pendientes_revision`: versiones en estado `EN_REVISION` — requieren aprobación o rechazo.
- `versiones_en_borrador_sin_archivo`: versiones en `BORRADOR` que aún no tienen archivo adjunto.

### CA-5 — Filtrado por tenant
- Todos los conteos aplican solo al `tenant_id` del JWT.
- Si el tenant no tiene documentos aún, los valores son `0` (no null).

### CA-6 — Frontend: KPI cards en CalidadView
- El dashboard muestra 4 MetricCards superiores: Total Documentos, Vigentes, En Revisión, En Borrador.
- Debajo: dos listas resumidas — "Tipos de Documento" (barras proporcionales simples) y "Pendientes de Acción" con acceso rápido a filtrar la lista.
