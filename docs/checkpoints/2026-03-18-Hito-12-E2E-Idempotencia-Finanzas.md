# Hito 12: E2E de idempotencia en Finanzas

Fecha: 2026-03-18

## Objetivo

Validar que los endpoints financieros críticos no dupliquen efectos al recibir reintentos del mismo request.

## Cobertura implementada

Archivo:

- `apps/finanzas/test/e2e/idempotencia.e2e.test.ts`

Escenarios cubiertos:

- `POST /api/v1/finanzas/comprometer-fondos`
- `POST /api/v1/finanzas/liberar-fondos`
- `POST /api/v1/finanzas/pagos`

## Validaciones comprobadas

### Comprometer fondos

Se envió el mismo request dos veces para la misma OC.

Resultado validado:

- solo se crea un movimiento `COMPROMISO`
- el segundo request responde con `idempotente: true`
- los saldos del presupuesto cambian una sola vez

### Liberar fondos

Se envió el mismo request dos veces para la misma OC con compromiso previo.

Resultado validado:

- solo se crea un movimiento `LIBERACION`
- el segundo request responde con `idempotente: true`
- `monto_comprometido` baja una sola vez
- `monto_disponible` regresa correctamente al saldo esperado

### Programar pagos

Se envió el mismo request dos veces con la misma referencia funcional:

- `referencia_modulo`
- `referencia_entidad`
- `referencia_id`

Resultado validado:

- solo se crea un `programa_pagos`
- ambos requests devuelven el mismo `id_pago`

## Ajustes realizados

- `apps/finanzas/test/e2e/idempotencia.e2e.test.ts`
  - nueva suite de pruebas
- `apps/finanzas/package.json`
  - nuevo script `test:e2e:idempotencia`
- `package.json`
  - nuevo script raíz `test:e2e:idempotencia`

## Validación ejecutada

Compilación:

- `npx tsc --noEmit -p apps/finanzas/tsconfig.json`

Pruebas:

```bash
npm run test:e2e:idempotencia -w @bocam/finanzas
npm run test:e2e:idempotencia
```

Resultado:

- todas las pruebas pasan

## Hallazgo menor

En `POST /api/v1/finanzas/pagos` no se duplica el registro, pero sí se repite el log:

- `[Finanzas] ✅ Pago programado: ...`

Esto ocurre porque el `console.log` actual se ejecuta aunque el endpoint devuelva un registro ya existente. No rompe la idempotencia funcional, pero sí puede confundir observabilidad si no se corrige después.

## Estado resultante

El hardening financiero sube de nivel:

- ya hay cobertura E2E para RBAC y límites
- ya hay cobertura E2E para reconciliación
- ya hay cobertura E2E para idempotencia de reintentos financieros

## Siguiente paso recomendado

El siguiente hito natural es observabilidad y operación:

1. logs estructurados con `tenant_id`, `proyecto_id` y correlation id
2. distinguir en logs y métricas cuándo una operación fue `idempotente`
3. dashboard de pendientes de reconciliación y errores de saga
4. llevar E2E críticas al pipeline CI
