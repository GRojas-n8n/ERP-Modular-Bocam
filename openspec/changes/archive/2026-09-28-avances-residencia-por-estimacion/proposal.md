## Why

Pruebas del residente en el proyecto Hutchinson (registros y canalizaciones) mostraron que la pestaña "Estimaciones" de Residencia no permite evaluar el comportamiento del proyecto: no hay forma de registrar un avance propio contra lo cobrado en una estimación, no existen totales de lo contratado/estimado/cobrado/restante, y la lista de avances repite el mismo concepto una fila por cada registro, sin contexto de estimación ni periodo.

## What Changes

- Nuevo registro de avances **por estimación y por concepto**: el residente elige una estimación de referencia y captura cantidades por concepto en un solo paso (lote); el periodo se hereda de la estimación.
- Nuevos **totales** en la pestaña: contratado, estimado, cobrado y restante por cobrar (importes), con `parcial: true` si el catálogo de Gerencia Técnica no responde.
- La lista de avances se **agrupa por concepto** (una fila por concepto con acumulado y % de avance) con detalle expandible por estimación/periodo, en vez de repetir el concepto.
- Backend `control-proyectos`: nuevo campo opcional `estimacion_referencia_id` en `AvanceFisico`, endpoint `POST /avances/lote`, endpoint de resumen por concepto y de totales.
- Sin cambios en el flujo existente avance → validación → estimación ni en `POST /avances` individual (compatible hacia atrás).

## Capabilities

### New Capabilities
- `avances-residencia-por-estimacion`: registro de avances por estimación/concepto, agrupación por concepto y totales contratado/estimado/cobrado/restante.

### Modified Capabilities
- `estimaciones-avance-fisico-residente`: la pestaña Estimaciones muestra avances agrupados por concepto y KPIs de totales monetarios (hoy lista plana, un renglón por avance).

## Impact

- `apps/control-proyectos`: `prisma/schema.prisma` (migración aditiva, campo nullable), `src/main.ts` (rutas nuevas), tests Jest/Supertest.
- `apps/app-shell/src/views/residencia/EstimacionesTab.tsx` y sus tests; ayuda en `help/content/residencia.ts`.
- Backend-to-backend hacia `gerencia-tecnica` (presupuesto activo) para el monto contratado; sin cruces en frontend.
- Sin cambios a RabbitMQ salvo reutilizar `AVANCE_FISICO_REGISTRADO` por cada avance del lote.
