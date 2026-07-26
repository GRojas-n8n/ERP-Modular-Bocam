# dashboard-entrada-rrhh

## UI Location

`apps/app-shell/src/views/PersonalView.tsx` (o `RRHHView.tsx`) — sección superior.

## Layout

```
┌──────────────────────────────────────────────────────────┐
│ Dashboard — Recursos Humanos                  [hoy]       │
├────────────────┬──────────────┬──────────────────────────┤
│ Empleados Act. │Asistencia Hoy│ Incidencias Pdte          │
│      45        │ 38/45  84%   │        3                  │
│                │ ████████░░   │   ⚠ revisar               │
└────────────────┴──────────────┴──────────────────────────┘

Distribución jornada:
● COMPLETA: 30   ● POR HORAS: 10   ● DESTAJO: 5

Próximo corte de nómina: 30 Jun 2026  (5 días)

[Alertas]
⚠ Juan Pérez · 2 días ausencia injustificada
⚠ 5 documento(s) por vencer/vencidos → [Ver Vencimientos]
```

## Behavior

- Barra de asistencia: verde ≥ 90%, amarillo 75-89%, rojo < 75%
- Countdown "Próximo corte": días restantes calculados desde `nomina_proximo_corte`
- No filtra por proyecto — es nivel tenant (toda la empresa)
- Solo visible para rol `rrhh` y `admin`
- Cuando el dashboard retorna una alerta `DOCUMENTO_POR_VENCER`, se muestra un renglón `⚠ N documento(s) por vencer/vencidos` con el color según su severidad (`critica` si hay al menos un documento vencido, `advertencia` si solo hay por vencer) y un enlace/botón que navega al panel de detalle "Vencimientos"; si el dashboard no retorna esta alerta, la sección no muestra ningún renglón de vencimientos
