## Why

En la vista estándar del Dashboard (`DashboardView`, roles no-ejecutivos), la sección "Mis Proyectos" muestra un % de "Avance General" por tarjeta de proyecto que **no proviene de ningún dato real**: se calcula con una fórmula sintética basada en la posición del proyecto en el array (`35 + index * 20`). Esto hace que un proyecto recién creado, sin ningún avance físico registrado, muestre 35% de avance — información falsa que puede llevar a decisiones equivocadas y le resta credibilidad al sistema.

## What Changes

- Reemplazar el cálculo mock de avance (`DashboardView.tsx`, sección "Mis Proyectos") por el avance físico real de cada proyecto, obtenido desde `control-proyectos` (mismo dato/patrón que ya usa `DashboardEjecutivo` vía `GET /api/v1/control-proyectos/resumen-dashboard`, campo `avance_pct`).
- Cuando un proyecto no tiene avances registrados, la tarjeta debe mostrar 0% (o el estado "Sin avances registrados", igual que ya hace `DashboardEjecutivo`), nunca un valor sintético.
- Mientras el avance real está cargando, la tarjeta debe mostrar un estado de carga explícito en vez de cualquier número, para no confundirlo con un dato real.

## Capabilities

### New Capabilities
- `avance-real-tarjetas-mis-proyectos`: la sección "Mis Proyectos" del Dashboard estándar obtiene y muestra el avance físico real por proyecto (o su ausencia), en vez de un valor calculado a partir del índice del array.

### Modified Capabilities
(ninguna — no se encontró una capability existente que ya especifique el comportamiento de las tarjetas "Mis Proyectos" del Dashboard estándar; `avance-fisico-control-obra` especifica cómo se *registra* el avance, no cómo se *muestra* en este dashboard)

## Impact

- Frontend: `apps/app-shell/src/views/DashboardView.tsx` — componente `DashboardView` (líneas ~967-1012), específicamente la línea `const progress = Math.min(35 + index * 20, 100);` (línea ~978) y el fetch de datos para la sección "Mis Proyectos".
- Backend: ninguno nuevo — se reutiliza `GET /api/v1/control-proyectos/resumen-dashboard` (ya usado por `DashboardEjecutivo`, línea ~249) u otro endpoint equivalente de `control-proyectos` que exponga avance por proyecto individual.
- No afecta a `DashboardEjecutivo`, que ya usa datos reales.
