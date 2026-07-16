-- Migration: add_concepto_a_presupuesto_asignado
-- Ver openspec/changes/unificar-presupuesto-a-partidas-gt.
-- Agrega concepto_id/concepto_clave (UUID desnormalizado, sin FK cruzada) para que
-- un PresupuestoAsignado pueda sincronizarse 1:1 con una partida real de GT.
-- null = bolsa a nivel proyecto (hoy solo el capítulo MANO_OBRA).

ALTER TABLE "presupuestos_asignados" ADD COLUMN IF NOT EXISTS "concepto_id" UUID;
ALTER TABLE "presupuestos_asignados" ADD COLUMN IF NOT EXISTS "concepto_clave" VARCHAR(50);

CREATE UNIQUE INDEX IF NOT EXISTS "uq_presupuesto_concepto"
  ON "presupuestos_asignados"("tenant_id", "proyecto_id", "concepto_id");
