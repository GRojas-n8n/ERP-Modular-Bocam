## Context

`calcularEstadoTope` (`apps/gerencia-tecnica/src/main.ts:1910-1915`) ya
implementa correctamente el umbral documentado en
`openspec/specs/presupuesto-tope-partida/spec.md`: `LIBRE` si
`monto_disponible` es más del 20% de `monto_aprobado`, `LIMITADO` si está
entre 1% y 20%, `BLOQUEADO` si es ≤ 0. `test_comprometer_actualiza_saldo`
compromete 50,000 de un presupuesto de 100,000 (deja 50% disponible) pero
afirma `estado_tope === 'LIMITADO'` — matemáticamente imposible con ese
umbral, ya que 50% > 20% siempre da `LIBRE`. No hay ambigüedad de diseño
aquí: es un error aritmético en el test, no una decisión de producto por
tomar.

## Goals / Non-Goals

**Goals:**
- Que `test_comprometer_actualiza_saldo` ejerza de verdad el camino
  `LIMITADO` que dice probar.

**Non-Goals:**
- No se cambia `calcularEstadoTope` ni el umbral del 20% — ya son
  correctos.
- No se agrega `test_comprometer_actualiza_saldo` a ningún workflow de CI
  en este change — fuera de alcance (`apps/gerencia-tecnica` no corre en
  CI hoy; agregarlo es una decisión de infraestructura más amplia, no
  parte de este bug-fix puntual).

## Decisions

### D1 — Ajustar el monto comprometido del test, no el umbral de producción
Cambiar el monto comprometido de 50,000 a 85,000 sobre un presupuesto de
100,000, dejando 15,000 disponibles (15% — dentro del rango 1%-20% de
`LIMITADO`). Se eligió 85,000 (no, por ejemplo, 90,000) para dejar el
resultado claramente dentro del rango sin quedar en el borde exacto del
20%, evitando fragilidad por redondeo de punto flotante en el cálculo de
porcentaje.
Alternativa descartada: cambiar la aserción a `'LIBRE'` en vez del monto —
descartada porque el nombre y el comentario de la función
(`test_comprometer_actualiza_saldo`, `'disponible < 20% → LIMITADO'`)
declaran explícitamente que la intención original era probar el camino
`LIMITADO`; cambiar la aserción en vez del monto dejaría ese camino sin
cobertura real, que es exactamente el problema que se quiere resolver.

## Risks / Trade-offs

- **[Riesgo] Ninguno relevante** — cambio de test puro, sin tocar código de
  producción ni datos existentes.

## Migration Plan

- Sin migración, sin cambios de schema.
- Branch `fix/test-saldo-partida-limitado`.
- Rollback: revertir el commit — cambio de test, sin riesgo.

## Open Questions

- Ninguna abierta.
