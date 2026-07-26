# Spec: Motor IMSS/ISR

## CA-1 — Solo aplica a PLANTA y EVENTUAL con NSS
- El motor calcula IMSS únicamente para empleados con `tipo_contrato IN ('PLANTA', 'EVENTUAL')`.
- Si `aplica_imss = true` pero `nss` es null → calcular ISR normalmente, `deduccion_imss = 0`, agregar warning en el detalle.
- Empleados `SUBCONTRATO` → omitir del cálculo (no se incluyen en la pre-nómina).

## CA-2 — Días trabajados desde asistencia
- El motor consulta `GET /asistencia/resumen` para el período antes de calcular.
- Si `origen = "ESTIMADO"` (sin registros) → calcular con los días del período y marcar `PreNominaDetalle.origen_dias = 'ESTIMADO'`.
- Si `dias_trabajados = 0` y `origen = "ASISTENCIA"` → omitir al empleado (no generar detalle).

## CA-3 — Cálculo IMSS cuota obrera correcto
- Usa `UMA_DIARIO_2025 = $113.14`.
- `sbc = salario_integrado ?? salario_diario`.
- Tres conceptos (no un porcentaje plano):
  1. Enf. y Mat. proporcional: `MAX(0, (sbc - 3 × UMA) × dias × 0.004)`
  2. Invalidez y Vida: `sbc × dias × 0.00625`
  3. Cesantía y Vejez: `sbc × dias × 0.01125`
- `deduccion_imss = sum(tres conceptos)`, redondeado a 2 decimales.

## CA-4 — Cálculo ISR con tablas SAT
- Usa la tabla correspondiente al `periodo_tipo` de la `PreNomina`: `SEMANAL`, `QUINCENAL` o `MENSUAL`.
- `base_isr = total_percepciones - 50% del monto de horas_extra` (parte exenta LFT art. 93).
- `isr_bruto = cuota_fija + (base_isr - limite_inferior) × tasa_marginal` del tramo correspondiente a la tabla de la periodicidad usada.
- `subsidio` se obtiene de la tabla de subsidio correspondiente a esa misma periodicidad (`SUBSIDIO_SEMANAL`, `SUBSIDIO_QUINCENAL` o `SUBSIDIO_MENSUAL`), según percepciones totales.
- `deduccion_isr = MAX(0, isr_bruto - subsidio)`, redondeado a 2 decimales.
- SEMANAL y QUINCENAL: comportamiento previo sin cambios.
- MENSUAL (nuevo): usa la tabla ISR mensual y el subsidio mensual vigentes, calculando `dias` del período por mes calendario (no por factor aproximado).
- Si la `PreNomina` trae un `periodo_tipo` fuera de `SEMANAL`/`QUINCENAL`/`MENSUAL` → el sistema responde `400` indicando periodicidad no soportada, sin generar detalles con montos incorrectos.

## CA-5 — Horas extra LFT
- Primeras 9 horas extra acumuladas en la semana: monto = horas × (salario_diario / 8) × 2.0
- Horas a partir de la 10ª: monto = horas × (salario_diario / 8) × 3.0
- 50% del total de horas extra está exento de ISR (para el cálculo de base_isr).
- `monto_horas_extra` en `PreNominaDetalle` = monto bruto total (gravado + exento).

## CA-6 — Bandera de recálculo
- Pre-nóminas existentes en producción marcadas con `requiere_recalculo = true` deben mostrarse en la UI con badge de advertencia.
- Al recalcular una pre-nómina existente (DELETE + re-CREATE de detalles), `requiere_recalculo` pasa a `false`.
