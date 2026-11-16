## Why

En `InsumosView` (Gerencia Técnica), las pestañas "Control de Costos", "Control Presupuestal" y "Trazabilidad" responden variaciones de la misma pregunta (presupuestado/comprometido/pagado/comprado/consumido) para la misma partida, identificada por el mismo `concepto_id` en las tres. Hoy no hay forma de saltar de una partida en una pestaña a la misma partida en otra: el usuario debe cambiar de pestaña manualmente y volver a ubicar la clave (scroll o, tras el cambio `buscador-control-presupuestal`, retipear la búsqueda), perdiendo el contexto de lo que estaba viendo.

## What Changes

- En la tabla de "Control Presupuestal" (`ControlPresupuestalTabla`), se agrega una acción "Ver en Trazabilidad" por fila, visible solo cuando el componente recibe un callback opcional para ello (así el uso de solo lectura en `ControlObraView`/Control de Proyectos no se ve afectado si no lo necesita).
- En la tabla de "Control de Costos" (`InsumosView`, tab `control-costos`), se agrega la misma acción "Ver en Trazabilidad" por fila.
- Al hacer clic, el sistema cambia a la pestaña "Trazabilidad" y expande automáticamente la fila de esa misma partida (por `concepto_id`), sin que el usuario tenga que volver a ubicarla.
- No se agrega el camino inverso (de Trazabilidad hacia Control Presupuestal/Costos) en este cambio — se deja como posible extensión futura si se valida que también hace falta.

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `frontend-control-presupuestal`: se agrega la acción "Ver en Trazabilidad" por fila en la tabla de Control Presupuestal.
- `trazabilidad-partida-frontend`: se agrega el comportamiento de recibir un salto directo desde otra pestaña con expansión automática de la partida indicada; se aclara la distinción de nombre entre esta pestaña y el drill-down de "Movimientos" que ya documenta esta spec, para no confundirlos.

## Impact

- Código afectado: `apps/app-shell/src/components/ControlPresupuestalTabla.tsx` (nuevo prop opcional `onVerTrazabilidad`), `apps/app-shell/src/views/InsumosView.tsx` (pasa el callback desde la pestaña Control Presupuestal, agrega la acción en la pestaña Control de Costos, y agrega el estado necesario para pre-expandir la fila destino al entrar a la pestaña Trazabilidad).
- `apps/app-shell/src/views/ControlObraView.tsx` no cambia — sigue usando `ControlPresupuestalTabla` sin pasar el nuevo callback, por lo que la acción "Ver en Trazabilidad" no aparece ahí (esa vista no tiene pestaña de Trazabilidad).
- No requiere cambios de backend.
