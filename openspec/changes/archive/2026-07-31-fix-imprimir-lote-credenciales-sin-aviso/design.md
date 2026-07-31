## Context

`imprimir-lote` (`apps/personal/src/main.ts:1870`) intersecta `empleado_ids` recibidos con `obtenerEmpleadoIdsDelProyecto` (empleados con `AsignacionFrente` activa o `Cuadrilla` del proyecto activo) antes de resolverlos. Cuando la intersección queda vacía, Prisma compila `id_empleado: { in: [] }` y la respuesta es `200` con `data: []`. El frontend (`PersonalView.tsx:700`, `handleImprimirSeleccionados`) siempre llama `window.open('', '_blank')` y escribe el HTML de `construirHojaCredenciales(credenciales, ...)` sin mirar cuántas credenciales llegaron. El resultado es una hoja de impresión en blanco sin ningún mensaje.

## Goals / Non-Goals

**Goals:**
- El usuario debe enterarse, antes de que se abra (o en vez de abrir) una hoja vacía, de que ninguno o algunos de los empleados seleccionados fueron excluidos por no pertenecer al proyecto activo.
- El fix debe ser mínimo: no cambia el criterio de elegibilidad ni el modelo de datos.

**Non-Goals:**
- No se cambia el scoping por proyecto (`obtenerEmpleadoIdsDelProyecto`) — es el mismo patrón usado por cálculo de nómina y se considera correcto por diseño.
- No se agrega selector de proyecto en el modal de impresión ni ninguna UI nueva más allá del `notify()`.

## Decisions

- **Backend expone `excluidos`**: la respuesta de `imprimir-lote` pasa de `data: CredencialItem[]` a `data: { credenciales: CredencialItem[], excluidos: string[] }`, donde `excluidos` son los `empleado_ids` solicitados que no calificaron (no elegibles del proyecto activo). Alternativa descartada: que el frontend recalcule la exclusión comparando `empleado_ids` enviados vs. `empleado.id_empleado` recibidos — se descarta porque duplicaría en el cliente una regla de negocio (elegibilidad de proyecto) que ya vive en el backend, y porque el backend ya tiene el set completo de `elegiblesDelProyecto` calculado en el momento de la request.
- **Frontend corta el flujo si `credenciales.length === 0`**: no abre `window.open`, solo `notify({type:'error', title:'Ningún empleado seleccionado pertenece al proyecto activo'})`. Si hay exclusión parcial, abre la hoja igual (con los que sí calificaron) y agrega un `notify({type:'info', ...})` indicando cuántos quedaron fuera.
- **Sin cambio de contrato para consumidores existentes del array simple**: dado que `imprimir-lote` es un endpoint de uso exclusivo de este flujo de impresión (no hay otro consumidor conocido), envolver la respuesta en `{ credenciales, excluidos }` es un cambio de forma aceptable sin necesidad de versión de API nueva.

## Risks / Trade-offs

- [Cambiar la forma de la respuesta (`data` array → `data.credenciales`) podría romper algún otro consumidor del endpoint si existiera] → Se verificó que `imprimir-lote` solo se llama desde `handleImprimirSeleccionados` en `PersonalView.tsx`; no hay otro caller en el repo.
- [El mensaje de exclusión no explica por sí solo *por qué* un empleado no calificó (falta de asignación de proyecto es un concepto interno)] → El mensaje usa lenguaje de negocio ("no está asignado al proyecto activo") en vez de mencionar `AsignacionFrente`/`Cuadrilla`.

## Migration Plan

Sin migración de datos ni de esquema. Deploy normal del build de `personal` + `app-shell`; compatible hacia atrás porque no hay otros consumidores del endpoint.
