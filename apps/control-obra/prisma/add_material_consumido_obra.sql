-- Control de Obra — nueva tabla materiales_consumidos_obra
-- Ejecutar en bocam_control_obra DB

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS materiales_consumidos_obra (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID        NOT NULL,
  proyecto_id     UUID        NOT NULL,
  concepto_id     UUID        NOT NULL,
  concepto_clave  VARCHAR(100) NOT NULL,
  insumo_id       UUID,
  clave_insumo    VARCHAR(50) NOT NULL,
  descripcion     VARCHAR(255) NOT NULL,
  unidad          VARCHAR(20) NOT NULL,
  cantidad        DECIMAL(18,4) NOT NULL,
  costo_unitario  DECIMAL(18,4) NOT NULL DEFAULT 0,
  costo_total     DECIMAL(18,2) NOT NULL DEFAULT 0,
  costo_pendiente BOOLEAN     NOT NULL DEFAULT FALSE,
  frente_trabajo  VARCHAR(100),
  movimiento_id   UUID        NOT NULL UNIQUE,
  fecha           DATE        NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mat_consumido_concepto ON materiales_consumidos_obra (tenant_id, proyecto_id, concepto_id);
