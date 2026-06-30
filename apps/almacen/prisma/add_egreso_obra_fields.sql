-- Almacén — agregar campos EGRESO_OBRA a movimientos_almacen
-- Ejecutar en bocam_almacen DB

ALTER TABLE movimientos_almacen
  ADD COLUMN IF NOT EXISTS concepto_id    UUID,
  ADD COLUMN IF NOT EXISTS concepto_clave VARCHAR(100),
  ADD COLUMN IF NOT EXISTS frente_trabajo VARCHAR(100),
  ADD COLUMN IF NOT EXISTS oc_item_id     UUID;

CREATE INDEX IF NOT EXISTS idx_mov_concepto ON movimientos_almacen (tenant_id, proyecto_id, concepto_id);
