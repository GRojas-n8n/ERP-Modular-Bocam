## 1. Pruebas primero
- [x] 1.1 `EgresoMultiproveedorModal.test.tsx` (4 casos): agrupa por proveedor y solo consulta Finanzas; 3 OCs de 2 proveedores con total en vivo y body `{oc_id, monto_aplicado}`; monto mayor al saldo o sin OCs no llega al backend; muestra el error del servidor.
- [x] 1.2 `SeccionesFinanzas.test.tsx` (2 casos): cobro con validaciones y body; pago de nómina con validaciones y body.
- [x] 1.3 `FinanzasView.confirmacion-registrar-pago-oc` ajustada al selector de OCs.

## 2. Implementar
- [x] 2.1 Componentes en `src/components/finanzas/` y conexión en `FinanzasView.tsx`.
- [x] 2.2 Se eliminan la captura manual del UUID y la llamada a Compras (F9).
- [x] 2.3 Ayuda contextual.

## 3. Verificar
- [x] 3.1 `tsc -p tsconfig.app.json`; suite completa de `app-shell`: 108 archivos, 363 pruebas en verde.
- [ ] 3.2 E2E con Playwright del egreso real (M11).
