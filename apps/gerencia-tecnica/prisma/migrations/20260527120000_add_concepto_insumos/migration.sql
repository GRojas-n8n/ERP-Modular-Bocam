-- ============================================================================
-- Migración: add_concepto_insumos
-- Fecha: 2026-05-27
-- Descripción:
--   Agrega la tabla `concepto_insumos` que vincula cada Concepto de un
--   presupuesto con los Insumos que lo componen, según el Análisis de
--   Precios Unitarios (APU) exportado desde OPUS.
--   Permite calcular el take-off de materiales desde el avance de obra.
-- ============================================================================

-- CreateTable
CREATE TABLE "concepto_insumos" (
    "id"             UUID            NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"      UUID            NOT NULL,
    "proyecto_id"    UUID            NOT NULL,
    "concepto_id"    UUID            NOT NULL,
    "insumo_id"      UUID            NOT NULL,
    "tipo_insumo"    "TipoInsumo"    NOT NULL,
    "cantidad"       DECIMAL(12,4)   NOT NULL,
    "rendimiento"    DECIMAL(12,4)   NOT NULL DEFAULT 0,
    "costo_unitario" DECIMAL(12,4)   NOT NULL DEFAULT 0,
    "created_at"     TIMESTAMPTZ(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"     TIMESTAMPTZ(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "concepto_insumos_pkey" PRIMARY KEY ("id")
);

-- UniqueIndex: (concepto_id, insumo_id) — upsert semántico
CREATE UNIQUE INDEX "uq_concepto_insumo"
    ON "concepto_insumos"("concepto_id", "insumo_id");

-- Index: tenant × proyecto — para queries RLS
CREATE INDEX "idx_ci_tenant_proyecto"
    ON "concepto_insumos"("tenant_id", "proyecto_id");

-- Index: tenant × concepto — para listar composición de un concepto
CREATE INDEX "idx_ci_concepto"
    ON "concepto_insumos"("tenant_id", "concepto_id");

-- ForeignKey: CASCADE — si se borra el concepto, se borran sus composiciones
ALTER TABLE "concepto_insumos"
    ADD CONSTRAINT "concepto_insumos_concepto_id_fkey"
    FOREIGN KEY ("concepto_id")
    REFERENCES "conceptos"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- ForeignKey: RESTRICT — no se puede borrar un insumo que está en uso en APUs
ALTER TABLE "concepto_insumos"
    ADD CONSTRAINT "concepto_insumos_insumo_id_fkey"
    FOREIGN KEY ("insumo_id")
    REFERENCES "insumos"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
