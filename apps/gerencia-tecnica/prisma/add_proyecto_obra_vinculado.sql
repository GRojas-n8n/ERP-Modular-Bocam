-- GT — nueva tabla proyectos_obra_vinculados (ventas-a-obra)
-- Ejecutar en bocam_gerencia_tecnica DB

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS proyectos_obra_vinculados (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID         NOT NULL,
  proyecto_id    UUID         NOT NULL,
  cotizacion_id  UUID         NOT NULL,
  monto_contrato DECIMAL(18,2) NOT NULL,
  moneda         VARCHAR(3)   NOT NULL DEFAULT 'MXN',
  cliente_nombre VARCHAR(255) NOT NULL,
  fecha_contrato DATE         NOT NULL,
  estado         VARCHAR(30)  NOT NULL DEFAULT 'SIN_PRESUPUESTO',
  notas          VARCHAR(500),
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, cotizacion_id)
);

CREATE INDEX IF NOT EXISTS idx_pov_proyecto ON proyectos_obra_vinculados (tenant_id, proyecto_id);
