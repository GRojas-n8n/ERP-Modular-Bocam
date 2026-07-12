# dashboard-entrada-control-obra

## UI Location

`apps/app-shell/src/views/ControlObraView.tsx` — sección superior.

## Layout

```
┌──────────────────────────────────────────────────────────────┐
│ Dashboard — Control de Obra              [proyecto activo]    │
├───────────────────────────────────────────────────────────────┤
│ Avance General                                                 │
│ Físico:     ████████░░ 42.5%                                  │
│ Financiero: ███████░░░ 38.0%   ✓ +4.5% adelantado            │
├────────────────────┬────────────────┬─────────────────────────┤
│ Semáforo WBS       │ Riesgos Activos │ Estimaciones Pdte       │
│ ● ESTRUCTURAS 60%  │      3          │        2                │
│ ● ACABADOS    20%  │  ⚠ revisar      │   aprobar               │
│ ● INST.ELEC.  35%  │                 │                         │
└────────────────────┴────────────────┴─────────────────────────┘

[Alertas]
⚠ ACABADOS: avance financiero supera físico en 15%
```

## Behavior

- Consume `GET /api/v1/control-proyectos/dashboard-obra` (endpoint fusionado
  en `control-proyectos`; antes `GET /api/v1/control-obra/dashboard`) al
  montar, sin cambios visuales respecto al comportamiento previo
- Barra de avance: física en verde, financiera en azul; si financiero > físico mostrar diferencia en rojo
- Semáforo WBS: punto ● verde/amarillo/rojo según estado del endpoint
- Si `parcial: true`: banner "Datos financieros no disponibles (Finanzas offline)"
- Solo visible para rol `director`, `control_obra` y `admin`
