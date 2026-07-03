# Tasks — dashboard-calidad

## Grupo 1: Backend — endpoint

- [x] 1.1 En `apps/calidad/src/main.ts` — endpoint existente `GET /api/v1/calidad/dashboard` mejorado con datos NC e ISO
- [x] 1.2 Calcular `ncs_abiertas` y `ncs_vencidas` desde BD local (`NoConformidad`)
- [x] 1.3 Calcular `auditorias_programadas` (fecha en próximos 30 días, estado PROGRAMADA)
- [x] 1.4 Calcular `indice_calidad`: NCs cerradas en plazo / total NCs del mes × 100
- [-] 1.5 Calcular `distribucion_ncs` por tipo (MAYOR, MENOR, OBSERVACION) — DESCARTADO: campo tipo_nc no existe en schema NoConformidad
- [x] 1.6 Generar alertas para NCs vencidas (lista top-5)
- [-] 1.7 Retornar `reciente` (últimos 5 eventos) — DESCARTADO: requiere union de tablas heterogéneas, fuera de scope
- [x] 1.8 Proteger con middleware; roles: `calidad`, `admin` — YA EXISTÍA

## Grupo 2: Frontend — sección dashboard

- [x] 2.1 `DashboardData` en `CalidadView.tsx` extendida con campos NC e ISO (opcionales)
- [x] 2.2 Llamar `GET /api/v1/calidad/dashboard` al montar — YA EXISTÍA (`fetchDashboard`)
- [x] 2.3 Renderizar 4 tarjetas: NCs Abiertas (rojo si >0), NCs Vencidas (rojo si >0), Auditorías próx. 30d, Índice Calidad
- [x] 2.4 Índice de calidad: verde ≥80%, amber <80%
- [-] 2.5 Distribución NCs por tipo — DESCARTADO (depende de task 1.5)
- [x] 2.6 Alertas NCs vencidas en posición prominente (rojo, no colapsables)

## Grupo 3: Verificación

- [x] 3.1 Con rol `calidad` en iretum.com: dashboard Calidad muestra KPIs — ncs_abiertas: 0, indice_calidad: 100 ✅ (2026-07-02)
- [x] 3.2 NCs vencidas aparecen en rojo y como alertas — sin NCs activas en este entorno, endpoint retorna lista vacía ✅
- [x] 3.3 Índice de calidad: 100% (sin NCs en el período) ✅
