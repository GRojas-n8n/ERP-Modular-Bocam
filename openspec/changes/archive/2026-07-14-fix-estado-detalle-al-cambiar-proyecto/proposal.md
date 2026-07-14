## Why

Al cambiar de proyecto activo, `ComprasView.tsx` vuelve a ejecutar `fetchData()`
(`useEffect(() => { fetchData(); }, [currentProjectId])`), repoblando
`comparativas`/`requisiciones`/`pendientesEval`/`pendientesGT` con los datos del proyecto
nuevo — pero `activeReqId` (qué cuadro comparativo está abierto en la vista de detalle)
nunca se limpia. Confirmado en producción (2026-07-13, usuario con rol `residencia`,
probando el cambio entre dos proyectos reales): si el usuario está viendo el detalle de un
cuadro y cambia de proyecto, `activeReqId` sigue apuntando a un `requisicion_id` que ya no
existe en los datos recién cargados del proyecto nuevo — la vista de detalle
(`activeReqId ? (...) : (...)`) intenta renderizar con `comp`/`req` inexistentes
(`if (!req || !comp) return null`), quedando en una pantalla en blanco/atorada en vez de
volver a la lista. Además, durante la ventana asíncrona del refetch, puede mostrarse
brevemente una mezcla de datos del proyecto anterior.

Confirmado en logs de backend: cada llamada individual (`GET /comparativas/pendientes-evaluacion`,
`GET /comparativas/:id`, etc.) sí filtra correctamente por `proyecto_id` del JWT activo — no
hay fuga de datos en el backend. El problema es enteramente de estado de UI no reseteado.

## What Changes

- `ComprasView.tsx` limpia `activeReqId` (vuelve a `null`) y `comparativaModo` (vuelve a
  `'compras'`) cada vez que cambia `currentProjectId` — el usuario siempre vuelve a la
  lista de requisiciones del proyecto nuevo al cambiar de proyecto, nunca se queda en un
  detalle stale de otro proyecto.
- Sin cambios de backend — confirmado que el filtrado por proyecto ya es correcto ahí.

## Capabilities

### New Capabilities

- `navegacion-multi-proyecto-compras`: comportamiento de `ComprasView` al cambiar de
  proyecto activo — no existía una capability formal en `openspec/specs/` para esto.

### Modified Capabilities

(ninguna)

## Impact

- **Frontend únicamente**: `apps/app-shell/src/views/ComprasView.tsx`.
- Afecta a cualquier usuario con acceso a más de un proyecto (Residentes, Gerentes
  Técnicos, Compras) que cambie de proyecto activo mientras tiene un cuadro comparativo
  abierto — bloqueaba al Residente para evaluar técnicamente tras cambiar de proyecto.
