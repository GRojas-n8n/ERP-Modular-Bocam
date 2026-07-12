## 1. Confirmar el bug

- [x] 1.1 Correr `node -r ts-node/register/transpile-only
      test/integration/saldo-partida.integration.test.ts` en
      `apps/gerencia-tecnica` y confirmar que `test_comprometer_actualiza_saldo`
      falla con `AssertionError: expected 'LIBRE' to equal 'LIMITADO'`.
      Confirmado.
- [x] 1.2 Confirmar por lectura de código que `calcularEstadoTope`
      (`apps/gerencia-tecnica/src/main.ts:1910-1915`) es correcto respecto
      al spec `presupuesto-tope-partida` (LIBRE >20%, LIMITADO 1%-20%,
      BLOQUEADO ≤0%) — el bug está en el test, no en producción.
      Confirmado: `pct = disponible/aprobado; if (pct < 0.20) LIMITADO;
      else LIBRE` coincide exactamente con el spec.

## 2. Corregir el test

- [x] 2.1 En `test_comprometer_actualiza_saldo`
      (`saldo-partida.integration.test.ts`), cambiar el monto comprometido
      de 50,000 a 85,000 (presupuesto de 100,000 → 15,000 disponibles →
      15%, dentro del rango LIMITADO).
- [x] 2.2 Actualizar las aserciones de `monto_comprometido` (50,000 →
      85,000) y `monto_disponible` (50,000 → 15,000) para reflejar los
      montos nuevos. La aserción de `estado_tope === 'LIMITADO'` no
      cambia de valor esperado, pero ahora sí corresponde matemáticamente.
- [x] 2.3 Re-correr el test y confirmar que pasa en verde.
      Confirmado: "✓ POST /comprometer actualiza monto_comprometido y
      estado_tope".

## 3. Verificación de regresión

- [x] 3.1 Correr la suite completa de
      `saldo-partida.integration.test.ts` (todas las funciones, no solo la
      corregida) y confirmar 0 regresiones. 9/9 ok.
- [x] 3.2 `npx tsc --noEmit -p apps/gerencia-tecnica/tsconfig.json` limpio.

## 4. Cierre

- [ ] 4.1 Abrir PR contra `main` desde branch
      `fix/test-saldo-partida-limitado`.
