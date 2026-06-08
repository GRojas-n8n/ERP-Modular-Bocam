-- Migration: add_proveedor_campos_v2_y_documentos
-- Adds logistics/credit/segmentation fields to proveedores and creates documentos_proveedor table

-- Add new columns to proveedores (all nullable or with defaults to avoid breaking existing rows)
ALTER TABLE "proveedores"
  ADD COLUMN IF NOT EXISTS "ciudad" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "tipo_ubicacion" VARCHAR(20) NOT NULL DEFAULT 'LOCAL',
  ADD COLUMN IF NOT EXISTS "entrega_en_sitio" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "estatus_credito" VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
  ADD COLUMN IF NOT EXISTS "limite_credito" DECIMAL(18,2),
  ADD COLUMN IF NOT EXISTS "tipo_proveedor" VARCHAR(20) NOT NULL DEFAULT 'NACIONAL',
  ADD COLUMN IF NOT EXISTS "calificacion_desempeno" DECIMAL(3,2);

-- Create documentos_proveedor table
CREATE TABLE IF NOT EXISTS "documentos_proveedor" (
  "id_doc"        UUID         NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id"     UUID         NOT NULL,
  "proveedor_id"  UUID         NOT NULL,
  "tipo_doc"      VARCHAR(20)  NOT NULL,
  "nombre_doc"    VARCHAR(255) NOT NULL,
  "ruta_archivo"  TEXT         NOT NULL,
  "mime_type"     VARCHAR(100) NOT NULL,
  "tamano_bytes"  INTEGER      NOT NULL,
  "subido_por"    UUID         NOT NULL,
  "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "documentos_proveedor_pkey" PRIMARY KEY ("id_doc")
);

-- FK constraint
ALTER TABLE "documentos_proveedor"
  ADD CONSTRAINT "documentos_proveedor_proveedor_id_fkey"
  FOREIGN KEY ("proveedor_id")
  REFERENCES "proveedores"("id_proveedor")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Index for tenant+proveedor lookups
CREATE INDEX IF NOT EXISTS "documentos_proveedor_tenant_id_proveedor_id_idx"
  ON "documentos_proveedor"("tenant_id", "proveedor_id");

