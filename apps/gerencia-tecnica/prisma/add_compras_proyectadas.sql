-- GT — nueva tabla compras_proyectadas (trazabilidad triángulo)
-- Ejecutar en bocam_gerencia_tecnica DB

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS compras_proyectadas (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID        NOT NULL,
  proyecto_id UUID        NOT NULL,
  concepto_id UUID        NOT NULL,
  insumo_id   UUID        NOT NULL,
  oc_id       UUID        NOT NULL,
  oc_codigo   VARCHAR(50) NOT NULL,
  cantidad    DECIMAL(18,4) NOT NULL,
  monto       DECIMAL(18,2) NOT NULL,
  estado      VARCHAR(20) NOT NULL DEFAULT 'VIGENTE',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (oc_id, insumo_id)
);

CREATE INDEX IF NOT EXISTS idx_compra_proyectada_concepto ON compras_proyectadas (tenant_id, proyecto_id, concepto_id);
