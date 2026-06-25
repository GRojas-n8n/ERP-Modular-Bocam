## 1. Backend — Endpoint dashboard

- [x] 1.1 En `apps/compras/src/main.ts`, implementar `GET /api/v1/compras/dashboard` que calcula en una sola función async: counts de REQs por estado (usando `groupBy` o múltiples `count` en paralelo con `Promise.all`), alertas de solicitudes vencidas (`alerta_plazo = true`), y últimas 5 REQs por `updated_at DESC`
- [x] 1.2 Verificar que el endpoint usa `createTenantContext` con `tenantId` y `proyectoId` del `securityContext` — no retorna datos de otros proyectos
- [x] 1.3 El campo `pendiente_gt` se calcula como count de `CuadroComparativo` con `estado IN ('EN_APROBACION_GT', 'EVALUADO_TECNICAMENTE')`

## 2. Frontend — Sección dashboard en ComprasView

- [x] 2.1 En `ComprasView.tsx`, agregar estado `dashboardData` y fetch a `/api/v1/compras/dashboard` en el `useEffect` inicial (en paralelo con las demás requests)
- [x] 2.2 Renderizar sección de dashboard antes de los tabs: 4 KPI cards con los valores de `kpis`, usando colores semánticos (amber si `pendiente_aprobacion > 0`, rojo si hay alertas)
- [x] 2.3 Renderizar sección de alertas (condicional) si `dashboardData.alertas.length > 0`: lista de cotizaciones vencidas con días de retraso y botón que llama `handleOpenSolicitudPanel(req)`
- [x] 2.4 Renderizar tabla de actividad reciente con las últimas 5 requisiciones: columnas Folio, Concepto, Estado (badge del ciclo), Fecha

## 3. Verificación

- [ ] 3.1 Verificar que `GET /api/v1/compras/dashboard` responde en < 500ms en producción
- [ ] 3.2 Verificar UI: dashboard visible al entrar a `/compras` con KPIs correctos
- [ ] 3.3 Verificar que los tabs siguen funcionando mientras el dashboard carga (no bloqueo)
