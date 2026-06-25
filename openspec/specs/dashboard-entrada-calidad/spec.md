# dashboard-entrada-calidad

## UI Location

`apps/app-shell/src/views/CalidadView.tsx` — sección superior.

## Layout

```
┌───────────────────────────────────────────────────────────┐
│ Dashboard — Calidad ISO 9001             [proyecto activo] │
├──────────┬────────────┬──────────────┬────────────────────┤
│NCs Abiertas│NCs Vencidas│Auditorías Pdte│ Índice Calidad    │
│    5       │    2  🔴   │      1        │     87.5%         │
│            │ CRÍTICO    │   próx. 30d   │  ████████░░       │
└──────────┴────────────┴──────────────┴────────────────────┘

Distribución NCs:
● MAYOR: 2   ● MENOR: 3   ○ OBSERVACIÓN: 7

[Alertas críticas]
🔴 NC-2026-018 · No conformidad mayor vencida hace 3 días
```

## Behavior

- Tarjeta "NCs Vencidas" en rojo si > 0 (alerta crítica ISO)
- Índice de calidad: verde ≥ 90%, amarillo 75-89%, rojo < 75%
- Alertas críticas siempre al tope, no colapsables
- Solo visible para rol `calidad`, `director`, `admin`
