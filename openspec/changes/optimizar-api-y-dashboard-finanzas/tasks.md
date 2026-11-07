## 1. Pruebas primero
- [x] 1.1 `api-dashboard.integration.test.ts` (5 casos): formato único de errores en cuentas, anticipo y pagos de OC; `/pagos` paginado sin repetidos y con el mismo orden que sin paginar; `/movimientos` descendente; filtro de proveedor en SQL; dashboard con bancos, OCs por pagar, cuentas por cobrar y alertas reales.

## 2. Implementar
- [x] 2.1 `src/paginacion.ts`; `responderPagina` y `responderError` en `main.ts`.
- [x] 2.2 Rutas de cuentas, anticipo, pagos de OC, reporte de GT, `/pagos`, `/movimientos`, dashboard y `/presupuestos/:id`.
- [x] 2.3 Script `test:integration:api-dashboard` y paso de CI.

## 3. Verificar
- [x] 3.1 `tsc` del servicio y `--strict` de `paginacion.ts`.
- [ ] 3.2 CI en verde (incluye `movimientos-por-concepto`, `rls-pagos-modo-global`, `seguridad.e2e`).
