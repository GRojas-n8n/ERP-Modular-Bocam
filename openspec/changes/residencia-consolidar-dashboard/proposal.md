## Why

`ResidenciaView.tsx` hace 31 llamadas directas a 4 microservicios distintos
(`personal` ×11, `compras` ×9, `gerencia-tecnica` ×6, `control-proyectos`
×5), contra la regla de `CLAUDE.md` "Una vista (`*View.tsx`) solo llama a
`/api/v1/{su-propio-servicio}/*`". No existe un servicio "residencia": el
rol residente opera de forma legítima sobre datos de 4 dominios distintos,
así que la mayoría de esas 31 llamadas son lecturas/escrituras por pestaña
ya avaladas por specs existentes (`residente-seleccion-insumos`,
`fichas-tecnicas-acceso-residente`) — no son el problema.

El problema real y acotado es la **carga inicial** (`useEffect` de montaje,
`ResidenciaView.tsx` líneas 540-559): pega directo a
`GET /api/v1/personal/prenominas` y `GET /api/v1/personal/complementos`
(listas completas) **incondicionalmente al montar la vista**, aunque esos
datos solo se muestran si el usuario abre la pestaña "Nómina" (que ni
siquiera es la pestaña por defecto — lo es "Estimaciones"). Es decir: se
paga el costo de un servicio caído/lento en cada carga de pantalla, para
datos que la mayoría de las veces no se van a ver. Las demás pestañas
(`estimaciones`, `asistencia`, `equipo`, `requisiciones`) ya cargan sus
datos de forma perezosa (solo cuando `activeTab` coincide) — Nómina es la
única que no sigue ese patrón.

Además, `GET /api/v1/control-proyectos/dashboard/residente` — que sí es un
agregador backend-to-backend con degradación `parcial: true` (llama a
Compras vía `Promise.allSettled`, patrón que `CLAUDE.md` cita como
ejemplo) — ya se llama en esa misma carga inicial, pero no incluye los
conteos de nómina, así que el frontend no tiene forma de mostrar "3
prenóminas pendientes" sin traer la lista completa de personal.

Por último, las specs `endpoint-dashboard-residentes` y
`dashboard-entrada-residentes` describen una implementación que ya no
existe (ruta `control-obra` en vez de `control-proyectos`, archivo
`ResidentesView.tsx` en vez de `ResidenciaView.tsx`, campo
`evaluaciones_pendientes` que el endpoint real nunca tuvo) — quedaron
desactualizadas respecto al código real y no documentan los conteos de
nómina.

## What Changes

- `apps/control-proyectos`: extender `GET /dashboard/residente` para
  incluir `prenominas_pendientes` y `complementos_pendientes` (conteos,
  no listas), obtenidos con una llamada backend-to-backend a `personal`
  (mismo patrón que la llamada existente a Compras: `axios.get` +
  `Promise.allSettled` + `timeout: 3000` + `parcial: true` si falla).
- `ResidenciaView.tsx`: quitar `GET /api/v1/personal/prenominas` y
  `GET /api/v1/personal/complementos` del `useEffect` de montaje. Esas
  llamadas se mueven a un `useEffect` gateado por
  `activeTab === 'nomina'`, con el mismo patrón ya usado por las pestañas
  `estimaciones`/`asistencia`/`equipo`/`requisiciones`. El panel superior
  (KPIs de carga inicial) pasa a leer `prenominas_pendientes` /
  `complementos_pendientes` del agregador en vez de derivarlos de las
  listas completas.
- Actualizar `openspec/specs/endpoint-dashboard-residentes/spec.md` y
  `openspec/specs/dashboard-entrada-residentes/spec.md` para reflejar la
  implementación real (ruta, archivo, forma de la respuesta) y documentar
  los nuevos campos de nómina.
- **No se toca** ninguna de las llamadas por pestaña (asistencia
  QR/bulk, mi equipo, requisiciones CRUD + selector de insumos + subida
  de fichas, catálogo de conceptos de GT) — son lecturas/escrituras
  legítimas contra el servicio dueño de ese dato, ya avaladas por
  `residente-seleccion-insumos` y `fichas-tecnicas-acceso-residente`.
  Forzarlas por un agregador de "dashboard" sería incorrecto: son
  flujos de escritura o de datos específicos de una acción, no KPIs de
  panel.
- **BREAKING**: ninguno — el endpoint del agregador solo gana campos
  nuevos; los campos existentes (`mis_requisiciones`,
  `estimaciones_pendientes`, `ocs_por_recibir`, `alertas`, `parcial`) no
  cambian.

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `endpoint-dashboard-residentes`: agrega `prenominas_pendientes` y
  `complementos_pendientes` a la respuesta, con degradación `parcial:
  true` si `personal` falla; corrige la documentación (ruta, archivo,
  forma real de la respuesta) para que deje de describir un endpoint que
  no existe.
- `dashboard-entrada-residentes`: agrega dos tiles de KPI (prenóminas y
  complementos pendientes) al panel superior, alimentados por el
  agregador — no por una llamada directa a `personal`.

## Impact

- **Código**: `apps/control-proyectos/src/main.ts` (endpoint
  `/dashboard/residente`, nueva constante `PERSONAL_URL`),
  `apps/app-shell/src/views/ResidenciaView.tsx` (mover 2 llamadas del
  montaje a un `useEffect` gateado por tab, ajustar el panel de KPIs).
- **Dependencias**: ninguna nueva — reutiliza `axios` (ya usado para la
  llamada a Compras) y el patrón `Promise.allSettled` existente.
- **Otros servicios**: `apps/personal` no requiere cambios — se
  **consume** su endpoint de listado existente (`GET
  /api/v1/personal/prenominas` / `/complementos`), backend-to-backend.
- **Reducción de llamadas cross-service desde el navegador en la carga
  inicial de Residencia**: de 3 (`personal` ×2 + `control-proyectos`
  dashboard) a 1 (`control-proyectos` dashboard, que ya hacía B2B a
  Compras y ahora también a `personal`).
