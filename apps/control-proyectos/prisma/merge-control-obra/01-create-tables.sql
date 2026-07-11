-- =============================================================================
-- Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
-- Fusión control-obra → control-proyectos (openspec: fusionar-control-obra-a-control-proyectos)
--
-- Crea las 4 tablas migradas de bocam_control_obra dentro de
-- bocam_control_proyectos, con nombres de columna/tabla idénticos al
-- origen para que el pg_dump --data-only posterior (tarea 6.3-6.4) se
-- restaure sin transformación. NO incluye datos — solo DDL. Ejecutar
-- contra bocam_control_proyectos ANTES del pg_dump/restore de la tarea 6.
-- =============================================================================

CREATE TABLE bitacoras_obra (
  id_bitacora             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id               UUID NOT NULL,
  proyecto_id             UUID NOT NULL,
  numero_entrada          INTEGER NOT NULL,
  fecha                   DATE NOT NULL,
  frente_trabajo          VARCHAR(100) NOT NULL,
  turno                   TEXT NOT NULL DEFAULT 'DIURNO',
  clima                   VARCHAR(50),
  temperatura_c           DECIMAL(4,1),
  actividades_realizadas  TEXT NOT NULL,
  personal_en_sitio       INTEGER NOT NULL DEFAULT 0,
  incidencias             TEXT,
  material_recibido       TEXT,
  observaciones           TEXT,
  residente_id            UUID NOT NULL,
  residente_nombre        VARCHAR(200) NOT NULL,
  superintendente_id      UUID,
  estado                  TEXT NOT NULL DEFAULT 'BORRADOR',
  created_at              TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              TIMESTAMP(3) NOT NULL,
  CONSTRAINT bitacoras_obra_tenant_id_proyecto_id_numero_entrada_key UNIQUE (tenant_id, proyecto_id, numero_entrada)
);
CREATE INDEX bitacoras_obra_tenant_id_proyecto_id_idx ON bitacoras_obra (tenant_id, proyecto_id);
CREATE INDEX bitacoras_obra_tenant_id_proyecto_id_fecha_idx ON bitacoras_obra (tenant_id, proyecto_id, fecha);

CREATE TABLE estimaciones (
  id_estimacion             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID NOT NULL,
  proyecto_id               UUID NOT NULL,
  numero_estimacion         INTEGER NOT NULL,
  codigo                    VARCHAR(50) NOT NULL,
  periodo_inicio            DATE NOT NULL,
  periodo_fin               DATE NOT NULL,
  subtotal                  DECIMAL(18,2) NOT NULL,
  retencion_fondo_garantia  DECIMAL(18,2) NOT NULL DEFAULT 0,
  amortizacion_anticipo     DECIMAL(18,2) NOT NULL DEFAULT 0,
  iva                       DECIMAL(18,2) NOT NULL DEFAULT 0,
  total_neto                DECIMAL(18,2) NOT NULL,
  estado                    TEXT NOT NULL DEFAULT 'BORRADOR',
  elaborado_por_id          UUID NOT NULL,
  elaborado_por_nombre      VARCHAR(200) NOT NULL,
  revisado_por_id           UUID,
  revisado_por_nombre       VARCHAR(200),
  aprobado_por_id           UUID,
  aprobado_por_nombre       VARCHAR(200),
  fecha_aprobacion          TIMESTAMP(3),
  notas                     TEXT,
  created_at                TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at                TIMESTAMP(3) NOT NULL,
  CONSTRAINT estimaciones_tenant_id_proyecto_id_numero_estimacion_key UNIQUE (tenant_id, proyecto_id, numero_estimacion),
  CONSTRAINT estimaciones_tenant_id_codigo_key UNIQUE (tenant_id, codigo)
);
CREATE INDEX estimaciones_tenant_id_proyecto_id_idx ON estimaciones (tenant_id, proyecto_id);
CREATE INDEX estimaciones_tenant_id_proyecto_id_estado_idx ON estimaciones (tenant_id, proyecto_id, estado);

CREATE TABLE avances_fisicos (
  id_avance                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                UUID NOT NULL,
  proyecto_id              UUID NOT NULL,
  concepto_presupuesto     VARCHAR(100) NOT NULL,
  descripcion_concepto     VARCHAR(500) NOT NULL,
  cantidad_presupuestada   DECIMAL(18,4) NOT NULL,
  cantidad_anterior        DECIMAL(18,4) NOT NULL DEFAULT 0,
  cantidad_periodo         DECIMAL(18,4) NOT NULL,
  cantidad_acumulada       DECIMAL(18,4) NOT NULL,
  unidad                   VARCHAR(20) NOT NULL,
  precio_unitario          DECIMAL(18,4) NOT NULL,
  importe_periodo          DECIMAL(18,2) NOT NULL,
  importe_acumulado        DECIMAL(18,2) NOT NULL,
  porcentaje_avance        DECIMAL(5,2) NOT NULL,
  periodo_inicio           DATE NOT NULL,
  periodo_fin              DATE NOT NULL,
  registrado_por_id        UUID NOT NULL,
  registrado_por_nombre    VARCHAR(200) NOT NULL,
  validado_por_id          UUID,
  validado_por_nombre      VARCHAR(200),
  estado                   TEXT NOT NULL DEFAULT 'PENDIENTE',
  estimacion_id            UUID,
  created_at               TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at                TIMESTAMP(3) NOT NULL,
  CONSTRAINT avances_fisicos_estimacion_id_fkey FOREIGN KEY (estimacion_id) REFERENCES estimaciones(id_estimacion)
);
CREATE INDEX avances_fisicos_tenant_id_proyecto_id_idx ON avances_fisicos (tenant_id, proyecto_id);
CREATE INDEX avances_fisicos_tenant_id_proyecto_id_estado_idx ON avances_fisicos (tenant_id, proyecto_id, estado);

-- Estructura tomada directamente de la tabla REAL en bocam_control_obra
-- (no del modelo Prisma previo, que estaba desincronizado con prod — el
-- código del suscriptor almacen.salida_obra escribía contra columnas que
-- no existen; corregido como parte de esta fusión, ver schema.prisma).
CREATE TABLE materiales_consumidos_obra (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id              UUID NOT NULL,
  proyecto_id            UUID NOT NULL,
  concepto_id            UUID NOT NULL,
  movimiento_almacen_id  UUID NOT NULL,
  insumo_id              UUID NOT NULL,
  insumo_clave           VARCHAR(50),
  insumo_nombre          VARCHAR(255),
  cantidad               DECIMAL(18,4) NOT NULL,
  unidad                 VARCHAR(20) NOT NULL,
  costo_unitario         DECIMAL(18,2),
  costo_total            DECIMAL(18,2),
  fecha                  DATE NOT NULL DEFAULT CURRENT_DATE,
  frente_trabajo         VARCHAR(100),
  registrado_por         UUID,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT materiales_consumidos_obra_movimiento_almacen_id_key UNIQUE (movimiento_almacen_id)
);
CREATE INDEX idx_mat_consumido_concepto ON materiales_consumidos_obra (tenant_id, proyecto_id, concepto_id);
