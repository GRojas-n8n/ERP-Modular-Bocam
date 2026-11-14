## 1. Pruebas primero
- [x] 1.1 `libro-bancario.integration.test.ts` (8 casos): alta con saldo inicial y enmascarado; PATCH con saldo 400; ajustes (idempotencia, 409, validaciones, límite, rol, otro tenant); egreso, pago programado, nómina y cobro con su origen y libro cuadrado; 10 cargos simultáneos; consulta paginada; inmutabilidad, CHECK y migración re-ejecutable; script de saldo inicial (simulación, aplicar, re-ejecutable).

## 2. Implementar
- [x] 2.1 Modelo `MovimientoBancario`; migración `20261114120000_libro_bancario` y `rollback.sql`; RLS 9g.
- [x] 2.2 `src/tesoreria.ts`: movimiento en la misma sentencia que el saldo (CTE), alta, edición, ajuste, consulta y enmascarado.
- [x] 2.3 Origen en egreso-oc, programa-pagos, nomina-por-pagar y cuentas-por-cobrar.
- [x] 2.4 Endpoints en `main.ts`.
- [x] 2.5 `scripts/finanzas/saldo-inicial-libro-bancario.sql`.
- [x] 2.6 Script de prueba y paso de CI.

## 3. Verificar
- [x] 3.1 `tsc` del servicio; `--strict` del módulo y de la prueba; cobertura RLS estática.
- [x] 3.2 PostgreSQL 16 local: migración dos veces; CHECK; trigger también para superusuario; RLS con rol sin privilegios; 10 cargos simultáneos del CTE como `bocam_app`; script en simulación, aplicado y re-ejecutado.
- [ ] 3.3 CI en verde.
- [ ] 3.4 Producción: después del despliegue, script en simulación, revisar con Germán y aplicar.
