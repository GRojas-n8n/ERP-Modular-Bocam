-- Migration: add_concepto_to_detalle_pago
-- Adds nullable concepto_id and concepto_clave to detalles_pago_oc for WBS traceability

ALTER TABLE "detalles_pago_oc" ADD COLUMN IF NOT EXISTS "concepto_id" UUID;
ALTER TABLE "detalles_pago_oc" ADD COLUMN IF NOT EXISTS "concepto_clave" VARCHAR(100);

CREATE INDEX IF NOT EXISTS "detalles_pago_oc_concepto_id_idx" ON "detalles_pago_oc"("concepto_id");
