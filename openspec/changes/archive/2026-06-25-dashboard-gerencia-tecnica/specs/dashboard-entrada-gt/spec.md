# dashboard-entrada-gt

## UI Location

`apps/app-shell/src/views/GTView.tsx` (o `GerenciaTecnicaView.tsx`) — sección superior antes del listado de cuadros.

## Layout

```
┌─────────────────────────────────────────────────────────┐
│  Dashboard — Gerencia Técnica               [mes actual] │
├──────────┬──────────┬───────────────┬──────────────────┤
│ Pendientes│En Eval.  │Aprobados/mes  │Monto Comprometido│
│    3      │    5     │     8         │  $1,250,000      │
│ ⚠ revisar │ técnica  │               │  MXN             │
└──────────┴──────────┴───────────────┴──────────────────┘

[Alertas — si alertas.length > 0]
┌─────────────────────────────────────────────────────────┐
│ ⚠ CMP-001 · Edificio Torre A · Esperando 6 días        │
└─────────────────────────────────────────────────────────┘
```

## Behavior

- Llama `GET /api/v1/gerencia-tecnica/dashboard` al montar
- Spinner mientras carga, error silencioso si falla (no rompe la vista)
- Tarjeta "Pendientes" con badge rojo si `pendientes_revision > 0`
- Si `parcial: true`, muestra banner amarillo "Datos parcialmente disponibles"
- Click en tarjeta "Pendientes" → scroll/filtro al listado de cuadros EN_APROBACION_GT
- Solo visible para rol `gerencia_tecnica` y `admin`
