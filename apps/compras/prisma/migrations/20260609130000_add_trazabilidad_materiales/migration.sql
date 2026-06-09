-- Migration: add_trazabilidad_materiales
-- Adds: 3 columns on requisiciones_items + table asignaciones_extra_concepto

-- Nuevos campos en requisicion_items
-- Todos nullable para retrocompatibilidad con requisiciones existentes

ALTER TABLE "requisiciones_items"
    ADD COLUMN "cantidad_presupuestada" DECIMAL(18,4),
    ADD COLUMN "concepto_origen_id"     UUID,
    ADD COLUMN "justificacion"          TEXT;

-- Indice para consultas de trazabilidad por insumo en el proyecto
CREATE INDEX "requisiciones_items_tenant_id_proyecto_id_insumo_id_idx"
    ON "requisiciones_items"("tenant_id", "proyecto_id", "insumo_id");

-- Tabla de incisos extra
CREATE TABLE "asignaciones_extra_concepto" (
    "id_asignacion"        UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"            UUID NOT NULL,
    "proyecto_id"          UUID NOT NULL,
    "requisicion_item_id"  UUID NOT NULL,
    "concepto_id"          UUID NOT NULL,
    "concepto_clave"       VARCHAR(100) NOT NULL,
    "concepto_descripcion" TEXT NOT NULL,
    "monto_extra"          DECIMAL(18,4) NOT NULL,
    "asignado_por"         UUID NOT NULL,
    "created_at"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "asignaciones_extra_concepto_pkey" PRIMARY KEY ("id_asignacion")
);

-- Un item solo puede estar asignado a un concepto destino
CREATE UNIQUE INDEX "asignaciones_extra_concepto_tenant_id_requisicion_item_id_key"
    ON "asignaciones_extra_concepto"("tenant_id", "requisicion_item_id");

CREATE INDEX "asignaciones_extra_concepto_tenant_id_proyecto_id_idx"
    ON "asignaciones_extra_concepto"("tenant_id", "proyecto_id");

CREATE INDEX "asignaciones_extra_concepto_tenant_id_concepto_id_idx"
    ON "asignaciones_extra_concepto"("tenant_id", "concepto_id");
