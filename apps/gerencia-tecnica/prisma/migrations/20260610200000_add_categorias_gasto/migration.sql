-- Migration: add_categorias_gasto
-- Adds: categorias_gasto table, proyecto_costos_config table,
--       categoria_gasto_id field on insumos

-- 1. Tabla de categorías de gasto por proyecto
CREATE TABLE IF NOT EXISTS "categorias_gasto" (
  "id_categoria"   UUID        NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id"      UUID        NOT NULL,
  "proyecto_id"    UUID        NOT NULL,
  "nombre"         VARCHAR(100) NOT NULL,
  "es_predefinida" BOOLEAN     NOT NULL DEFAULT false,
  "activa"         BOOLEAN     NOT NULL DEFAULT true,
  "created_at"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "categorias_gasto_pkey" PRIMARY KEY ("id_categoria")
);

CREATE INDEX IF NOT EXISTS "idx_categoria_gasto_tenant_proyecto"
  ON "categorias_gasto"("tenant_id", "proyecto_id");

-- 2. Tabla de configuración de control de costos por proyecto
CREATE TABLE IF NOT EXISTS "proyecto_costos_config" (
  "id"               UUID        NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id"        UUID        NOT NULL,
  "proyecto_id"      UUID        NOT NULL,
  "estado"           VARCHAR(20) NOT NULL DEFAULT 'CONFIGURACION',
  "activado_por"     UUID,
  "fecha_activacion" TIMESTAMPTZ,
  "created_at"       TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at"       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "proyecto_costos_config_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "uq_proyecto_costos_config"
  ON "proyecto_costos_config"("tenant_id", "proyecto_id");

CREATE INDEX IF NOT EXISTS "idx_proyecto_costos_config_tenant"
  ON "proyecto_costos_config"("tenant_id");

-- 3. Campo categoria_gasto_id en insumos (nullable)
ALTER TABLE "insumos"
  ADD COLUMN IF NOT EXISTS "categoria_gasto_id" UUID;

CREATE INDEX IF NOT EXISTS "idx_insumo_categoria"
  ON "insumos"("tenant_id", "categoria_gasto_id");
