## Grupo 1: Backend — endpoint

- [x] 1.1 En `apps/finanzas/src/main.ts` — `GET /api/v1/finanzas/dashboard` YA EXISTÍA; mejorado con `alertas`
- [x] 1.2 Calcular `presupuesto` desde `PresupuestoAsignado` — YA EXISTÍA como `resumen_presupuestal`
- [ ] 1.3 Calcular `ocs_por_pagar` desde proyección local — DIFERIDO a `pagos-ordenes-compra`; retorna `0` por ahora
- [ ] 1.4 Calcular `cuentas_bancarias` desde tabla `CuentaBancaria` — DIFERIDO a `pagos-ordenes-compra`; retorna `[]` por ahora
- [x] 1.5 Calcular alerta `PRESUPUESTO_BAJO` si `ejercido / autorizado > 0.80`; alerta `PAGOS_VENCIDOS` si hay pagos sin procesar
- [x] 1.6 Retornar últimos 5 movimientos en `reciente` — YA EXISTÍA como `ultimos_movimientos`
- [x] 1.7 Proteger con middleware; roles: `finanzas`, `admin` — YA EXISTÍA

## Grupo 2: Frontend — sección dashboard

- [x] 2.1 `FinanzasView.tsx` — estado `dashAlertas` y parse de alertas desde dashboard response
- [x] 2.2 Llamar `GET /api/v1/finanzas/dashboard` al montar — YA EXISTÍA
- [x] 2.3 Renderizar tarjeta Presupuesto con barra de progreso — YA EXISTÍA como `stats` cards con `disponibilidad %`
- [ ] 2.4 Renderizar tarjeta OCs por Pagar — DIFERIDO a `pagos-ordenes-compra`
- [ ] 2.5 Si `cuentas_bancarias.length > 0` — DIFERIDO a `pagos-ordenes-compra`
- [x] 2.6 Si `alertas.length > 0`: mostrar alertas (PRESUPUESTO_BAJO, PAGOS_VENCIDOS) con color según severidad
- [x] 2.7 Renderizar lista `reciente` — YA EXISTÍA como `Egresos Programados` / movimientos

## Grupo 3: Verificación

- [ ] 3.1 Con rol `finanzas` en iretum.com: dashboard Finanzas muestra presupuesto PPTO-2026-001
- [ ] 3.2 Barra de progreso refleja monto ejercido real vs autorizado
- [ ] 3.3 Alerta PRESUPUESTO_BAJO aparece si ejercido > 80%
