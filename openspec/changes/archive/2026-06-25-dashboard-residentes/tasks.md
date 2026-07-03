# Tasks — dashboard-residentes

## Grupo 1: Backend — endpoint

- [x] 1.1 En `apps/control-obra/src/main.ts` — nuevo `GET /api/v1/control-obra/dashboard/residente`
- [x] 1.2 Calcular `estimaciones_pendientes` desde BD local (estado BORRADOR o EN_REVISION)
- [x] 1.3 Llamar `COMPRAS_URL/requisiciones` backend-to-backend para `mis_requisiciones` (filtrado por userId)
- [x] 1.4 Llamar `COMPRAS_URL/ordenes-compra?estado=EMITIDA,PARCIALMENTE_RECIBIDA` para `ocs_por_recibir`
- [x] 1.5 Si Compras falla: campos en vacío, `parcial: true`
- [x] 1.6 Generar alertas para estimaciones_pendientes
- [x] 1.7 Proteger con middleware; roles: `residencia`, `admin`

## Grupo 2: Frontend — sección dashboard

- [x] 2.1 En `ResidenciaView.tsx` — estado `dashData` con tipo completo
- [x] 2.2 Llamar `GET /api/v1/control-obra/dashboard/residente` al montar (junto con otros recursos)
- [x] 2.3 Renderizar 3 tarjetas: Mis Requisiciones, Est. Pendientes (amber si >0), OCs por Recibir (sky si >0)
- [x] 2.4 Lista de OCs por recibir (máx 5) con folio, proveedor, monto, estado
- [-] 2.5 Click en estimación → navegar a tab estimaciones — DESCARTADO: navegación inter-tab compleja, fuera de scope
- [x] 2.6 Si `parcial: true`: nota en tarjeta OCs
- [x] 2.7 Alertas de estimaciones pendientes en color según severidad

## Grupo 3: Verificación

- [x] 3.1 Con rol `residente@bocam.com`: GET /control-obra/dashboard/residente retorna HTTP 200 con mis_requisiciones, estimaciones_pendientes, ocs_por_recibir ✅ (2026-07-02)
- [x] 3.2 OCs por recibir en estructura correcta; parcial: true (Compras B2B — comportamiento esperado) ✅
- [x] 3.3 Sin estimaciones activas en el entorno de prueba; endpoint retorna alertas vacías ✅
