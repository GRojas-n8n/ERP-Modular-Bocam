# Tasks — dashboard-rrhh

## Grupo 1: Backend — endpoint

- [x] 1.1 En `apps/personal/src/main.ts` — endpoint existente `GET /api/v1/personal/dashboard` mejorado
- [x] 1.2 Calcular `empleados_activos` — YA EXISTÍA en endpoint original
- [x] 1.3 Calcular `asistencia_hoy`: count de registros con fecha = hoy y estado PRESENTE/MEDIO_DIA/POR_HORAS
- [ ] 1.4 Calcular `incidencias_pendientes` — DIFERIDO: no existe tabla Incidencia en schema personal
- [ ] 1.5 Obtener `nomina_proximo_corte` — DIFERIDO: no existe config de corte en BD
- [ ] 1.6 Calcular alertas `AUSENCIA_INJUSTIFICADA` (días consecutivos) — DIFERIDO: requiere query compleja
- [x] 1.7 Calcular `pct_asistencia` y alerta AUSENCIAS si ausentes > 0
- [x] 1.8 Proteger con middleware; roles: `personal_rh`, `admin` — YA EXISTÍA

## Grupo 2: Frontend — sección dashboard

- [x] 2.1 En `PersonalView.tsx` — estado `dashData` con tipo completo
- [x] 2.2 Llamar `GET /api/v1/personal/dashboard` al montar (junto con otros recursos)
- [x] 2.3 Renderizar 4 tarjetas: Empleados Activos, Asistencia Hoy (con barra %), Presentes/Ausentes, Última Nómina
- [ ] 2.4 Countdown próximo corte — DIFERIDO con task 1.5
- [ ] 2.5 Distribución jornadas — DIFERIDO (agrupación por modo_asistencia pendiente de spec)
- [x] 2.6 Mostrar alertas de ausencias y pre-nómina pendiente

## Grupo 3: Verificación

- [ ] 3.1 Con rol `personal_rh` en iretum.com: dashboard RRHH muestra KPIs
- [ ] 3.2 Asistencia hoy refleja registros reales del día
- [ ] 3.3 Alertas aparecen si hay ausentes o nómina pendiente
