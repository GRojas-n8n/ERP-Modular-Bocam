## Grupo 1: Backend — endpoint

- [x] 1.1 En `apps/gerencia-tecnica/src/main.ts` agregar `GET /api/v1/gerencia-tecnica/dashboard` con llamada HTTP interna a `http://compras:3002/api/v1/compras/comparativas/pendientes-gt` (backend-to-backend, propagar Authorization header)
- [x] 1.2 Si Compras responde 2xx: calcular `pendientes_revision`, `en_evaluacion_tecnica`, `aprobados_este_mes`, `monto_comprometido`, `alertas` (cuadros con >3 días en EN_APROBACION_GT), `reciente`
- [x] 1.3 Si Compras falla o timeout >3s: retornar `{ pendientes_revision: 0, ..., parcial: true }`
- [x] 1.4 Proteger con middleware de auth; roles: `superintendent`, `admin`, `technical`, `gerencia_tecnica`

## Grupo 2: Frontend — sección dashboard

- [x] 2.1 En ComprasView.tsx (tab pendientes-gt), agregar estado `gtDashboardData` y fetch de `/api/v1/gerencia-tecnica/dashboard` al montar
- [x] 2.2 Llamar `GET /api/v1/gerencia-tecnica/dashboard` al montar; mostrar spinner mientras carga
- [x] 2.3 Renderizar 4 tarjetas: Pendientes Revisión (badge rojo si >0), En Evaluación Técnica, Aprobados/Mes, Monto Comprometido
- [x] 2.4 Si `alertas.length > 0`: mostrar listado de alertas (folio + proyecto + días en espera)
- [x] 2.5 Si `parcial: true`: banner amarillo "Datos parcialmente disponibles"

## Grupo 3: Verificación

- [ ] 3.1 Con rol `superintendent` en iretum.com: dashboard GT muestra KPIs reales en tab pendientes-gt
- [ ] 3.2 Si Compras está disponible: `parcial: false`, datos visibles
- [ ] 3.3 VPS: logs de gerencia-tecnica muestran llamada HTTP a compras y respuesta
