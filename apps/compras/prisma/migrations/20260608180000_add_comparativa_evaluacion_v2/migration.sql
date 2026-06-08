-- Migration: add_comparativa_evaluacion_v2
-- Extends CuadroComparativo with revision control, digital signature, and locking
-- Extends ComparativaDetalle with C/NC/DA/? evaluation and valor_ofrecido_spec
-- Creates AclaracionComparativa for per-cell clarifications

-- ── 1. CuadroComparativo: revisiones, firma y selección de proveedor ──────────
ALTER TABLE "cuadros_comparativos"
  ADD COLUMN IF NOT EXISTS "revision"                     VARCHAR(5)   NOT NULL DEFAULT 'A',
  ADD COLUMN IF NOT EXISTS "revision_padre_id"            UUID,
  ADD COLUMN IF NOT EXISTS "firmado_por"                  UUID,
  ADD COLUMN IF NOT EXISTS "fecha_firma"                  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "primera_opcion_proveedor_id"  UUID,
  ADD COLUMN IF NOT EXISTS "segunda_opcion_proveedor_id"  UUID;

-- ── 2. ComparativaDetalle: valor ofrecido por el proveedor (texto libre) ──────
ALTER TABLE "comparativas_detalles"
  ADD COLUMN IF NOT EXISTS "valor_ofrecido_spec" TEXT;

-- ── 3. Tabla AclaracionComparativa ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "aclaraciones_comparativa" (
  "id_aclaracion"  UUID         NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id"      UUID         NOT NULL,
  "proyecto_id"    UUID         NOT NULL,
  "cuadro_id"      UUID         NOT NULL,
  "insumo_id"      UUID         NOT NULL,
  "proveedor_id"   UUID         NOT NULL,
  "autor_id"       UUID         NOT NULL,
  "tipo"           VARCHAR(20)  NOT NULL,
  "mensaje"        TEXT         NOT NULL,
  "resuelta"       BOOLEAN      NOT NULL DEFAULT false,
  "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aclaraciones_comparativa_pkey"
    PRIMARY KEY ("id_aclaracion"),
  CONSTRAINT "aclaraciones_comparativa_cuadro_id_fkey"
    FOREIGN KEY ("cuadro_id") REFERENCES "cuadros_comparativos"("id_cuadro")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "aclaraciones_comparativa_tenant_id_cuadro_id_idx"
  ON "aclaraciones_comparativa"("tenant_id", "cuadro_id");

CREATE INDEX IF NOT EXISTS "aclaraciones_comparativa_cuadro_insumo_proveedor_idx"
  ON "aclaraciones_comparativa"("cuadro_id", "insumo_id", "proveedor_id");
