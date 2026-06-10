-- Migration: add_evaluacion_v2_missing_fields
-- Adds the remaining fields for flujo-requisicion-evaluacion-v2:
--   veredicto + lock fields in cuadros_comparativos
--   pregunta/respuesta in comparativas_detalles
--   specs fields in requisiciones_items
--   auditoria_desbloqueo_comparativa table

-- ── 1. CuadroComparativo: veredicto del residente y proveedores sugeridos ────
ALTER TABLE "cuadros_comparativos"
  ADD COLUMN IF NOT EXISTS "veredicto_residente"  TEXT,
  ADD COLUMN IF NOT EXISTS "proveedores_sugeridos" TEXT;

-- ── 2. ComparativaDetalle: preguntas y respuestas del flujo revisión ─────────
ALTER TABLE "comparativas_detalles"
  ADD COLUMN IF NOT EXISTS "pregunta_residente" TEXT,
  ADD COLUMN IF NOT EXISTS "respuesta_compras"  TEXT;

-- ── 3. RequisicionItem: especificaciones técnicas por renglón ─────────────────
ALTER TABLE "requisiciones_items"
  ADD COLUMN IF NOT EXISTS "especificacion_marca_modelo" VARCHAR(200),
  ADD COLUMN IF NOT EXISTS "especificacion_detalle"      TEXT;

-- ── 4. Tabla AuditoriaDesbloqueoComparativa ───────────────────────────────────
CREATE TABLE IF NOT EXISTS "auditoria_desbloqueo_comparativa" (
  "id_auditoria"         UUID         NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id"            UUID         NOT NULL,
  "proyecto_id"          UUID         NOT NULL,
  "cuadro_id"            UUID         NOT NULL,
  "desbloqueado_por"     UUID         NOT NULL,
  "timestamp_desbloqueo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "justificacion"        TEXT         NOT NULL,
  CONSTRAINT "auditoria_desbloqueo_comparativa_pkey"
    PRIMARY KEY ("id_auditoria"),
  CONSTRAINT "auditoria_desbloqueo_comparativa_cuadro_id_fkey"
    FOREIGN KEY ("cuadro_id") REFERENCES "cuadros_comparativos"("id_cuadro")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "auditoria_desbloqueo_comparativa_tenant_id_cuadro_id_idx"
  ON "auditoria_desbloqueo_comparativa"("tenant_id", "cuadro_id");
