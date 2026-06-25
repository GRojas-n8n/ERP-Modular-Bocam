# Tasks — dashboard-control-obra

## Grupo 1: Backend — endpoint

- [x] 1.1 En `apps/control-obra/src/main.ts` — endpoint existente `GET /api/v1/control-obra/dashboard` mejorado con datos de avance y alertas
- [x] 1.2 Calcular `avance_general.fisico_pct` desde `AvanceFisico.aggregate({ _avg: porcentaje_avance })` (estado VALIDADO)
- [x] 1.3 Llamar `http://finanzas:3004/api/v1/finanzas/presupuestos` para `financiero_pct`; timeout 3s; si falla: `parcial: true`
- [x] 1.4 Calcular `delta_pct` (fisico_pct − financiero_pct); semáforo en alerta si delta < −5%
- [ ] 1.5 Calcular `riesgos_activos` — DIFERIDO: no existe tabla Riesgos en schema control-obra
- [x] 1.6 Calcular `estimaciones_pendientes` (estado BORRADOR o EN_REVISION)
- [x] 1.7 Generar alertas `DESVIACION_FINANCIERA` y `AVANCES_PENDIENTES`
- [x] 1.8 Proteger con middleware; roles: `director`, `control_obra`, `admin`

## Grupo 2: Frontend — sección dashboard

- [x] 2.1 En `ControlObraView.tsx` — estado `dashData` con tipo completo
- [x] 2.2 Llamar `GET /api/v1/control-obra/dashboard` al montar (junto con bitacoras/avances/estimaciones)
- [x] 2.3 Renderizar barras de avance físico (sky) y financiero (emerald) con porcentajes
- [x] 2.4 Renderizar delta: verde si > +5%, rojo si < −5%, neutro si entre ±5%
- [x] 2.5 Renderizar tarjeta Estimaciones Pendientes (amber si > 0)
- [x] 2.6 Si `parcial: true`: nota informativa al pie de las KPI cards
- [x] 2.7 Mostrar alertas con color según severidad (critica=rojo, warning=amber)

## Grupo 3: Verificación

- [ ] 3.1 Con rol `director` o `control_obra` en iretum.com: dashboard Control de Obra muestra avance
- [ ] 3.2 Barras de avance reflejan datos reales
- [ ] 3.3 Si Finanzas no responde: `parcial: true` y nota visible
