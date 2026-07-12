## Why

`apps/gerencia-tecnica/test/integration/saldo-partida.integration.test.ts`
falla en `test_comprometer_actualiza_saldo` (`AssertionError: expected
'LIBRE' to equal 'LIMITADO'`). Investigación (confirmada en una sesión SDD
anterior y re-verificada ahora) muestra que **el código de producción es
correcto** — `calcularEstadoTope` (`apps/gerencia-tecnica/src/main.ts:1910`)
implementa exactamente el umbral documentado en el spec vigente
`presupuesto-tope-partida` (LIBRE si disponible > 20% del aprobado,
LIMITADO si 1%–20%). El bug está en el test: compromete 50,000 de un
presupuesto de 100,000 (deja 50% disponible — LIBRE por definición) pero
afirma que el resultado debe ser `LIMITADO`. El test nunca ejerció de
verdad el camino `LIMITADO` que dice estar probando.

No está en ningún workflow de CI (verificado — ningún `.github/workflows/*.yml`
corre tests de `apps/gerencia-tecnica`), así que no bloquea nada hoy, pero
da falsa confianza: alguien podría revisar la suite en verde/rojo sin darse
cuenta de que la aserción, no el código, está mal.

## What Changes

- `apps/gerencia-tecnica/test/integration/saldo-partida.integration.test.ts`,
  función `test_comprometer_actualiza_saldo`: el monto comprometido pasa de
  50,000 a 85,000 (deja 15,000 disponible = 15% del presupuesto de
  100,000, dentro del rango 1%–20% que sí corresponde a `LIMITADO`). Se
  actualizan las aserciones de `monto_comprometido`/`monto_disponible` para
  reflejar los montos nuevos.
- Sin cambios de código de producción — `calcularEstadoTope` ya es correcto.

## Capabilities

### New Capabilities
- `cobertura-saldo-partida-limitado`: la suite de regresión de
  `presupuesto-tope-partida` debe incluir un escenario que realmente
  ejercite el estado `LIMITADO` (disponible entre 1% y 20%), no solo
  `LIBRE`/`BLOQUEADO`.

### Modified Capabilities
(ninguna — el requirement de comportamiento en `presupuesto-tope-partida`
ya documenta el umbral correcto; este change no cambia esa especificación,
solo corrige el test para que la verifique de verdad)

## Impact

- **Test-only**: `apps/gerencia-tecnica/test/integration/saldo-partida.integration.test.ts`.
- Sin cambios de schema, sin cambios de comportamiento observable — el
  sistema ya se comporta como dice el spec; solo se corrige la cobertura de
  test.
