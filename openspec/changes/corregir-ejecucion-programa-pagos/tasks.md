## 1. Pruebas primero

- [x] 1.1 `programa-pagos.integration.test.ts` (9 casos): con compromiso devenga; sin compromiso ejerce; sin disponible 422 sin efectos; compromiso parcial; ejecuciones simultáneas (una pasa, la cuenta baja una vez); cuenta obligatoria y saldo insuficiente sin rastro; límite con el monto real; validaciones e idempotencia al programar; lote todo o nada.

## 2. Implementar

- [x] 2.1 `src/programa-pagos.ts`, `src/tesoreria.ts`, `src/errores.ts`.
- [x] 2.2 `POST /pagos`, `POST /pagos/bulk` y `PATCH /pagos/:id/pagar` delegan en el módulo; endpoints capturan `ErrorFinanzas`.
- [x] 2.3 `egreso-oc.ts` usa `descontarCuentaBancaria`; `ErrorEgreso` y `ErrorPresupuesto` extienden `ErrorFinanzas`.
- [x] 2.4 `cuenta_id` en `PagoRegistradoPayload`.
- [x] 2.5 Pruebas de conciliación de Contabilidad ajustadas; script y paso de CI.

## 3. Verificar

- [x] 3.1 `tsc` del servicio; `--strict` de los módulos nuevos; `tsc` de las pruebas de Finanzas y Contabilidad tocadas.
- [ ] 3.2 CI en verde (incluye `egreso-oc`, `finanzas-banco-lote` y `finanzas-banco-archivo`).
