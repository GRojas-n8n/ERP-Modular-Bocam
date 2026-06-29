-- Control de Proyectos — Tablas iniciales
-- Ejecutar en bocam_control_proyectos DB

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabla: programacion_obra
CREATE TABLE IF NOT EXISTS programacion_obra (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL,
  proyecto_id         UUID NOT NULL,
  concepto_id         UUID NOT NULL,
  concepto_clave      VARCHAR(100) NOT NULL,
  descripcion         TEXT NOT NULL,
  fecha_inicio_plan   DATE NOT NULL,
  fecha_fin_plan      DATE NOT NULL,
  curva_programada    JSONB NOT NULL DEFAULT '[]',
  fecha_inicio_real   DATE,
  fecha_fin_real      DATE,
  pct_avance_real     DECIMAL(5,2) NOT NULL DEFAULT 0,
  cpi                 DECIMAL(6,4),
  spi                 DECIMAL(6,4),
  eac                 DECIMAL(18,2),
  bac                 DECIMAL(18,2) NOT NULL DEFAULT 0,
  estado              VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, proyecto_id, concepto_id)
);
CREATE INDEX IF NOT EXISTS idx_prog_proyecto ON programacion_obra (tenant_id, proyecto_id);

-- Tabla: alertas_proyecto
CREATE TABLE IF NOT EXISTS alertas_proyecto (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL,
  proyecto_id   UUID NOT NULL,
  concepto_id   UUID,
  tipo          VARCHAR(50) NOT NULL,
  severidad     VARCHAR(10) NOT NULL,
  titulo        VARCHAR(200) NOT NULL,
  descripcion   TEXT NOT NULL,
  datos         JSONB NOT NULL DEFAULT '{}',
  estado        VARCHAR(20) NOT NULL DEFAULT 'ACTIVA',
  nota_cp       TEXT,
  resuelta_en   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_alerta_proyecto_estado ON alertas_proyecto (tenant_id, proyecto_id, estado);
CREATE INDEX IF NOT EXISTS idx_alerta_proyecto_tipo   ON alertas_proyecto (tenant_id, proyecto_id, tipo);

-- Tabla: proyecciones_cierre
CREATE TABLE IF NOT EXISTS proyecciones_cierre (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL,
  proyecto_id           UUID NOT NULL,
  fecha_calculo         DATE NOT NULL,
  bac                   DECIMAL(18,2) NOT NULL,
  pv                    DECIMAL(18,2) NOT NULL,
  ev                    DECIMAL(18,2) NOT NULL,
  ac                    DECIMAL(18,2) NOT NULL,
  cpi                   DECIMAL(6,4) NOT NULL,
  spi                   DECIMAL(6,4) NOT NULL,
  cv                    DECIMAL(18,2) NOT NULL,
  sv                    DECIMAL(18,2) NOT NULL,
  eac                   DECIMAL(18,2) NOT NULL,
  etc                   DECIMAL(18,2) NOT NULL,
  vac                   DECIMAL(18,2) NOT NULL,
  fecha_fin_plan        DATE,
  fecha_fin_proyectada  DATE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_proyeccion_fecha ON proyecciones_cierre (tenant_id, proyecto_id, fecha_calculo);
