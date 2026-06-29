-- Tabla: transferencia_partidas
-- Ejecutar en bocam_gerencia_tecnica DB en VPS cuando prisma db push falla
-- por conflicto con tipo_insumo pre-existente.
CREATE TABLE IF NOT EXISTS transferencia_partidas (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id              UUID NOT NULL,
  tipo                   VARCHAR(20) NOT NULL DEFAULT 'INTERNA',

  proyecto_origen_id     UUID NOT NULL,
  concepto_origen_id     UUID,
  concepto_origen_clave  VARCHAR(100) NOT NULL,
  concepto_origen_desc   TEXT NOT NULL,

  proyecto_destino_id    UUID NOT NULL,
  concepto_destino_id    UUID NOT NULL,
  concepto_destino_clave VARCHAR(100) NOT NULL,
  concepto_destino_desc  TEXT NOT NULL,

  monto                  DECIMAL(18,2) NOT NULL,
  moneda                 VARCHAR(3) NOT NULL DEFAULT 'MXN',

  justificacion          TEXT NOT NULL,
  solicitado_por_id      UUID NOT NULL,
  solicitado_por_nombre  VARCHAR(200) NOT NULL,

  aprobado_por_id        UUID,
  aprobado_por_nombre    VARCHAR(200),
  fecha_aprobacion       TIMESTAMPTZ,

  estado                 VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
  motivo_rechazo         TEXT,
  notas_director         TEXT,

  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transferencia_origen   ON transferencia_partidas(tenant_id, proyecto_origen_id);
CREATE INDEX IF NOT EXISTS idx_transferencia_destino  ON transferencia_partidas(tenant_id, proyecto_destino_id);
CREATE INDEX IF NOT EXISTS idx_transferencia_estado   ON transferencia_partidas(tenant_id, estado);
