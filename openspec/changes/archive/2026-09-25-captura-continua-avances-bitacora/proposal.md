## Why

En `ControlObraView`, los paneles "Registrar Avance" (pestaña Avances Físicos) y "Nueva Entrada" de Bitácora se cierran y resetean por completo después de cada guardado exitoso. En la práctica el usuario captura varios avances de concepto o varias entradas de bitácora en la misma sesión de trabajo (por periodo o por día), y hoy debe reabrir el panel y volver a ubicar el concepto o frente de trabajo en cada repetición. Esto agrega clics evitables a una tarea que se repite varias veces seguidas por sesión.

## What Changes

- Tras guardar un avance exitosamente, el panel "Registrar Avance" permanece abierto: se limpian los campos de cantidad/periodo capturados, se muestra una confirmación breve inline, y el usuario puede capturar el siguiente concepto sin reabrir el panel.
- Tras guardar una entrada de bitácora exitosamente, el panel "Nueva Entrada" permanece abierto con el mismo comportamiento (limpieza de campos de la entrada, confirmación inline), permitiendo capturar la siguiente entrada del día sin reabrir el panel.
- Se agrega una acción explícita de "Cerrar" en ambos paneles para que el usuario termine la sesión de captura cuando lo decida.
- No cambia el contrato de las llamadas a `POST /api/v1/control-proyectos/avances` ni `POST /api/v1/control-proyectos/bitacoras` — es un cambio de comportamiento del panel en el frontend, no del backend.

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `avance-fisico-control-obra`: se agrega el requisito de que el panel "Registrar Avance" permanezca abierto tras un guardado exitoso, en vez de cerrarse.
- `bitacoras-obra`: se agrega el requisito de que el panel "Nueva Entrada" de bitácora (frontend de `ControlObraView`) permanezca abierto tras un guardado exitoso, en vez de cerrarse.

## Impact

- Código afectado: `apps/app-shell/src/views/ControlObraView.tsx` (paneles de Avances Físicos ~líneas 564-591 y Bitácora ~líneas 551-557).
- No afecta endpoints de backend ni contratos de API.
- No afecta otros módulos (cambio confinado al frontend de Control de Obra / Gerencia Técnica).
