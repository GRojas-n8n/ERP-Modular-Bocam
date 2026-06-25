# Spec: Dashboard de Costos — Control de Proyectos

## Comportamiento esperado

### Ubicación

Nueva tab **"Costos"** en `ControlObraView`, visible para roles `control_obra`, `superintendent`, `admin`.

### Vista principal — Desglose por Categoría de Gasto

Barras de progreso por categoría:

```
Materiales
Presupuesto: $1,200,000
[████████████████████░░░░░░░░░░░░░░░] 52% comprometido · 33% pagado
Comprometido: $624,000   Pagado: $396,000   Disponible: $576,000

Equipo Mayor
Presupuesto: $400,000
[██████████████████████████████░░░░░] 78% comprometido · 55% pagado
Comprometido: $312,000   Pagado: $220,000   Disponible: $88,000
⚠️ Alto consumo presupuestal
...
```

- Barra doble: azul = comprometido, verde = pagado (superpuesta)
- Alerta visual cuando comprometido > 80% del presupuesto de la categoría
- Ordenado por % comprometido descendente por defecto

### Tarjetas de resumen global

```
┌──────────────────┬───────────────────┬──────────────┬─────────────────────┐
│ Presupuesto      │ Comprometido      │ Pagado       │ % Avance Físico     │
│ Total Proyecto   │                   │              │ Global              │
│ $5,800,000       │ $2,610,000  (45%) │ $1,566,000   │ 38%                 │
└──────────────────┴───────────────────┴──────────────┴─────────────────────┘
```

### Alertas de desviación

Lista de partidas con semáforo 🔴 o 🟡 debajo de las tarjetas:

```
⚠️ Partidas con desviación de costo:

🔴 [02.001] Estructura metálica
   Económico: 80%  Físico: 45%  →  Ratio: 1.78 — Desviación crítica

🟡 [03.004] Instalaciones eléctricas
   Económico: 55%  Físico: 42%  →  Ratio: 1.31 — Monitorear
```

### Tabla de Requisiciones por Categoría

Sección expandible "Ver detalle":

| Req | Partida | Categoría | Monto OC | Estado |
|---|---|---|---|---|
| REQ-2026-004 | 02.001 Estructura | Materiales | $120,000 | OC Emitida |
| REQ-2026-007 | 02.001 Estructura | Equipo Mayor | $90,000 | OC Pagada |

Filtrable por categoría, estado (Con OC / Sin OC / Pagada), y rango de fechas.

### Actualización de datos

- Los datos cargan al entrar al tab
- Botón "Actualizar" para refrescar
