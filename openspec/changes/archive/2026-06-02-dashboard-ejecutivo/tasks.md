# Tasks — Dashboard Ejecutivo Consolidado

## 1. Backend — compras
- [x] 1.1 `GET /api/v1/compras/resumen-dashboard` — `requireRoles('superintendent','admin')`

## 2. Backend — control-obra
- [x] 2.1 `GET /api/v1/control-obra/resumen-dashboard`

## 3. Backend — personal
- [x] 3.1 `GET /api/v1/personal/resumen-dashboard`

## 4. Backend — seguridad
- [x] 4.1 `GET /api/v1/seguridad/resumen-dashboard` (+ añadido requireRoles al import)

## 5. Backend — calidad
- [x] 5.1 `GET /api/v1/calidad/resumen-dashboard` + prisma generate

## 6. Frontend — DashboardView
- [x] 6.1 Detección `isEjecutivo` por roles superintendent/admin
- [x] 6.2 Renderiza `DashboardEjecutivo` para roles ejecutivos
- [x] 6.3 Tipos: ResumenCompras, ResumenControlObra, ResumenPersonal, ResumenSeguridad, ResumenCalidad
- [x] 6.4 Estado por módulo + lastUpdated
- [x] 6.5 fetchAll() con Promise.allSettled — fallo parcial muestra "—"
- [x] 6.6 useEffect on mount + botón "Actualizar"
- [x] 6.7 OperationalBanner con título y badge
- [x] 6.8–6.12 Cards de 5 módulos con MetricCard
- [x] 6.13 Badge ONLINE/CARGANDO/ERROR por card
- [x] 6.14 Sin skeleton (loading muestra "—" en MetricCard)

## 7. Demo mode
- [x] 7.1 DEMO_EJECUTIVO con datos estáticos

## 8. Deploy
- [x] 8.1 Build y redeploy 5 módulos backend + app-shell — producción verificada
- [x] 8.2 Todos los endpoints retornan 200 (verificado en build VPS)
- [ ] 8.3 Verificar que rol `resident` NO ve el dashboard ejecutivo (verificación manual)
- [ ] 8.4 Verificar que rol `superintendent` SÍ lo ve con datos reales (verificación manual)
