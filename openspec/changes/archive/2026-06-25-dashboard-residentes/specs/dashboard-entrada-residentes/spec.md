# dashboard-entrada-residentes

## UI Location

`apps/app-shell/src/views/ResidentesView.tsx` o sección de bienvenida de Residentes — parte superior.

## Layout

```
┌─────────────────────────────────────────────────────────┐
│  Mi Panel — Residente                    [proyecto activo]│
├────────────┬───────────────┬────────────────────────────┤
│Eval. Técn. │Mis Requisic.  │ OCs por Recibir            │
│  2 pdte    │ 4 pendientes  │ • OC-2026-012 EMITIDA      │
│ ● urgente  │ 7 aprobadas   │   Materiales SA — $85k     │
│            │   este mes    │   Est. 28/Jun              │
└────────────┴───────────────┴────────────────────────────┘

[Alertas]
⚠ OC-2026-008 · Fecha de entrega vencida hace 2 días
```

## Behavior

- Lista de OCs por recibir: máximo 5 en el panel, con link "Ver todas" al tab de OCs
- Click en evaluación pendiente → navega al cuadro comparativo correspondiente
- Click en requisición pendiente → navega al listado de requisiciones filtrado por estado
- Solo visible para rol `residente` y `admin`
- Si `parcial: true`: banner amarillo "OCs: datos parciales"
