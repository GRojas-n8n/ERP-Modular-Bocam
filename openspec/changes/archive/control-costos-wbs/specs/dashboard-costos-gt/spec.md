# Spec: Dashboard de Costos GT

## Comportamiento esperado

### Ubicación

Nueva tab **"Control de Costos"** en `InsumosView` (módulo Gerencia Técnica), visible para roles `gerencia_tecnica`, `superintendent`, `admin`.

### Vista principal — Tabla por partida

Tabla con las siguientes columnas:

| Clave | Descripción | Presupuesto | Comprometido | Pagado | % Económico | % Físico | Estado |
|---|---|---|---|---|---|---|---|
| 01.001 | Cimentación... | $540,000 | $194,400 | $108,000 | 36% | 30% | 🟢 |
| 02.001 | Estructura... | $800,000 | $640,000 | $500,000 | 80% | 45% | 🔴 |

- **Columna Estado** muestra semáforo: 🟢 Verde / 🟡 Ámbar / 🔴 Rojo / ⚪ Sin dato
- **Click en una fila** expande el desglose por categoría de gasto para esa partida
- **Fila de totales** al fondo: suma de Presupuesto, Comprometido, Pagado, % promedio

### Filtros

- Selector de **categoría de gasto** (desplegable) — filtra las partidas que tienen comprometido en esa categoría
- Toggle **"Solo con desviación"** — muestra solo partidas 🟡 o 🔴

### Tarjetas resumen (KPIs en la parte superior)

```
┌─────────────────┬──────────────────┬────────────────┬────────────────────┐
│ Presupuesto     │ Comprometido     │ Pagado         │ Partidas en riesgo │
│ Total           │                  │                │                    │
│ $3,200,000      │ $1,450,000 (45%) │ $880,000 (28%) │ 🔴 2  🟡 3         │
└─────────────────┴──────────────────┴────────────────┴────────────────────┘
```

### Desglose expandido por partida

Al hacer clic en una fila:
```
▼ 02.001 Estructura metálica
   Categoría              Comprometido    % del total partida
   Materiales             $400,000        62.5%
   Mano de Obra Sub.      $150,000        23.4%
   Equipo Mayor           $ 90,000        14.1%
   
   Requisiciones vinculadas: REQ-2026-004, REQ-2026-007, REQ-2026-011
```

### Actualización de datos

- Botón "Actualizar" que recarga `GET /costos-wbs` y `GET /costos-categorias`
- No hay tiempo real automático — datos on-demand
