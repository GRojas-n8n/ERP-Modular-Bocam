## Why

`POST /api/v1/personal/empleados/credenciales/imprimir-lote` filtra los `empleado_ids` solicitados contra los empleados elegibles del proyecto activo (`obtenerEmpleadoIdsDelProyecto`, vía `AsignacionFrente`/`Cuadrilla`) antes de buscarlos. Si ninguno de los seleccionados califica, responde `200` con un arreglo vacío. El frontend (`handleImprimirSeleccionados`, `PersonalView.tsx`) abre la ventana de impresión con ese arreglo vacío sin comprobar su longitud ni avisar al usuario — quien ve una hoja de impresión en blanco sin ninguna explicación de por qué no salieron credenciales. Reproducido en vivo el 2026-07-29 contra el entorno local (ver memoria `hallazgo-imprimir-lote-credenciales-silencioso-sin-asignacion-proyecto`).

## What Changes

- Backend: `POST /empleados/credenciales/imprimir-lote` incluye en la respuesta los `empleado_ids` solicitados que quedaron excluidos por no ser elegibles del proyecto activo (`excluidos: string[]`), en vez de solo el arreglo de credenciales generadas.
- Frontend: `handleImprimirSeleccionados` comprueba el resultado antes de abrir la ventana de impresión:
  - Si `credenciales.length === 0`, no abre ninguna ventana y muestra `notify({type:'error', ...})` indicando que ningún empleado seleccionado está asignado al proyecto activo.
  - Si hay exclusiones parciales (`excluidos.length > 0` pero `credenciales.length > 0`), abre la hoja igual con los elegibles y muestra `notify({type:'info'|'error', ...})` indicando cuántos quedaron fuera y por qué.
- No cambia el criterio de elegibilidad en sí (scoping por proyecto activo vía `obtenerEmpleadoIdsDelProyecto`) — ese comportamiento es intencional y compartido con `calcular` de nómina; el bug es la falta de aviso, no el filtro.

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `credencial-empleado`: el requirement "Impresión en lote de una, varias o todas las credenciales de un proyecto" se extiende para exigir que el sistema informe al usuario cuando algún empleado seleccionado quedó excluido por no ser elegible del proyecto activo, en vez de generar una hoja vacía o parcial en silencio.

## Impact

- `apps/personal/src/main.ts` (handler `imprimir-lote`, línea ~1870)
- `apps/app-shell/src/views/PersonalView.tsx` (`handleImprimirSeleccionados`, línea ~700)
- `openspec/specs/credencial-empleado/spec.md` (delta spec)
- Sin cambios de esquema de BD ni de RLS.
