-- Migration: add_concepto_req_y_req_oc
-- Adds: concepto_id on requisiciones, requisicion_id on ordenes_compra

-- 1. Campo concepto_id en requisiciones (partida del catálogo, nullable para datos históricos)
ALTER TABLE "requisiciones"
  ADD COLUMN IF NOT EXISTS "concepto_id" UUID;

CREATE INDEX IF NOT EXISTS "idx_req_concepto"
  ON "requisiciones"("tenant_id", "concepto_id");

-- 2. Campo requisicion_id en ordenes_compra (vínculo a req origen)
ALTER TABLE "ordenes_compra"
  ADD COLUMN IF NOT EXISTS "requisicion_id" UUID;

CREATE INDEX IF NOT EXISTS "idx_oc_requisicion"
  ON "ordenes_compra"("tenant_id", "requisicion_id");
