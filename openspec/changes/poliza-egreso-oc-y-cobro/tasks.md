## 1. Pruebas primero
- [x] 1.1 `finanzas.egreso-cobro.integration.test.ts` (4 casos): egreso de 3 proveedores con 3 cargos a 2100, abonos a 1100 y cuadre, conciliaciones e idempotencia; egreso descuadrado sin póliza; cobro con 1100/1200 idempotente; estimación con `total_neto`.

## 2. Implementar
- [x] 2.1 Tipos `EgresoOcRegistradoPayload` y `CobroRegistradoPayload`; eventos consumidos.
- [x] 2.2 `mapper.ts`: `COBRO` y `buildMovimientosEgresoOc`; `persistDefsIfEligible`.
- [x] 2.3 Handlers y suscripciones; placeholders con origen del evento.
- [x] 2.4 F27: `total_neto` en `estimacion_aprobada`.
- [x] 2.5 Script `test:integration:finanzas-egreso-cobro` y paso de CI.

## 3. Verificar
- [x] 3.1 `tsc` del servicio y de la prueba.
- [ ] 3.2 CI en verde.
- [ ] 3.3 Contador valida las cuentas de las pólizas EGRESO y COBRO.
