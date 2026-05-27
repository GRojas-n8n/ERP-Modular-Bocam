-- ============================================================================
-- Migración: add_req_imprevisto_y_aprobacion
-- Fecha: 2026-05-27
-- Descripción:
--   1. Agrega campo "tipo" a requisiciones (NORMAL | IMPREVISTO).
--   2. Hace nullable "insumo_id" en requisiciones_items para permitir
--      ítems de texto libre (imprevistos de obra sin catálogo).
--   3. Agrega campos de ítem libre: descripcion_libre, unidad_libre,
--      es_imprevisto.
-- ============================================================================

-- 1. Tipo de requisición: NORMAL (APU/catálogo) | IMPREVISTO (texto libre)
ALTER TABLE "requisiciones"
  ADD COLUMN "tipo" VARCHAR(20) NOT NULL DEFAULT 'NORMAL';

-- 2. insumo_id pasa a ser nullable — los ítems IMPREVISTO no tienen ID de catálogo
ALTER TABLE "requisiciones_items"
  ALTER COLUMN "insumo_id" DROP NOT NULL;

-- 3. Campos para ítems sin catálogo (imprevistos de obra)
ALTER TABLE "requisiciones_items"
  ADD COLUMN "descripcion_libre" TEXT,
  ADD COLUMN "unidad_libre"      VARCHAR(20),
  ADD COLUMN "es_imprevisto"     BOOLEAN NOT NULL DEFAULT false;

-- 4. Índice parcial para consultas de imprevistos por proyecto
CREATE INDEX "idx_req_imprevisto"
  ON "requisiciones"("tenant_id", "tipo")
  WHERE "tipo" = 'IMPREVISTO';
