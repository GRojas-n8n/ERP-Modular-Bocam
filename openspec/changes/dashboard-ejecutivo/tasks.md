# Tasks — Dashboard Ejecutivo Consolidado

## 1. Backend — compras

- [ ] 1.1 `GET /api/v1/compras/resumen-dashboard` — `requireRoles('superintendent','admin')`
  Retorna: `requisiciones_pendientes`, `ocs_por_emitir`, `ocs_en_proceso`, `monto_comprometido`

## 2. Backend — control-obra

- [ ] 2.1 `GET /api/v1/control-obra/resumen-dashboard`
  Retorna: `estimaciones_en_revision`, `estimaciones_aprobadas`, `avances_pendientes`

## 3. Backend — personal

- [ ] 3.1 `GET /api/v1/personal/resumen-dashboard`
  Retorna: `empleados_activos`, `cuadrillas_activas`, `prenominas_pendientes`

## 4. Backend — seguridad

- [ ] 4.1 `GET /api/v1/seguridad/resumen-dashboard`
  Retorna: `incidentes_abiertos`, `incidentes_criticos`, `permisos_vigentes`

## 5. Backend — calidad

- [ ] 5.1 `GET /api/v1/calidad/resumen-dashboard`
  Retorna: `documentos_vigentes`, `documentos_en_revision`, `versiones_pendientes`

## 6. Frontend — DashboardView

- [ ] 6.1 Detectar rol ejecutivo: `const isEjecutivo = roles.some(r => ['superintendent','admin'].includes(r))`
- [ ] 6.2 Si `isEjecutivo`: renderizar `DashboardEjecutivo` en lugar del grid de módulos
- [ ] 6.3 Tipos: `ResumenCompras`, `ResumenControlObra`, `ResumenPersonal`, `ResumenSeguridad`, `ResumenCalidad`
- [ ] 6.4 Estado: `data` (por módulo), `loading`, `error` (por módulo), `lastUpdated`
- [ ] 6.5 `fetchDashboard()`: `Promise.allSettled` con los 5 endpoints; poblar estado por módulo
- [ ] 6.6 `useEffect` on mount + botón "Actualizar"
- [ ] 6.7 `OperationalBanner` con título "Dashboard Ejecutivo" + badge proyecto activo
- [ ] 6.8 Card módulo Compras: `requisiciones_pendientes`, `ocs_en_proceso`, `monto_comprometido`
- [ ] 6.9 Card módulo Control de Obra: `estimaciones_en_revision`, `estimaciones_aprobadas`, `avances_pendientes`
- [ ] 6.10 Card módulo Personal: `empleados_activos`, `cuadrillas_activas`, `prenominas_pendientes`
- [ ] 6.11 Card módulo Seguridad HSE: `incidentes_abiertos`, `incidentes_criticos` (en rojo si > 0), `permisos_vigentes`
- [ ] 6.12 Card módulo Calidad SGC: `documentos_vigentes`, `documentos_en_revision`, `versiones_pendientes`
- [ ] 6.13 Badge por card: `ONLINE` (verde) / `CARGANDO` (gris) / `ERROR` (rojo) según resultado del fetch
- [ ] 6.14 Skeleton loader mientras `loading === true`

## 7. Demo mode

- [ ] 7.1 Si `isDemo`: usar datos estáticos `DEMO_DASHBOARD_EJECUTIVO` en `demoData.ts`

## 8. Deploy

- [ ] 8.1 Build y redeploy de los 5 módulos backend + app-shell
- [ ] 8.2 Verificar que cada endpoint retorna 200 con datos correctos
- [ ] 8.3 Verificar que rol `resident` NO ve el dashboard ejecutivo
- [ ] 8.4 Verificar que rol `superintendent` SÍ lo ve con datos reales
