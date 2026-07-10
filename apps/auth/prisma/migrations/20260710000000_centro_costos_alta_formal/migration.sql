-- Migration: centro_costos_alta_formal
-- Ver openspec/changes/centro-costos-alta-formal.
-- Extiende "proyectos" con los componentes estructurados del código de
-- Centro de Costos (13 posiciones) y la línea base financiera/de plazos.
-- Migra los valores legacy de "estatus" al nuevo vocabulario.
-- Puramente aditiva salvo el remapeo de datos de estatus (documentado abajo).

ALTER TABLE "proyectos"
  ADD COLUMN IF NOT EXISTS "empresa_grupo"              VARCHAR(3),
  ADD COLUMN IF NOT EXISTS "anio_centro_costos"          INTEGER,
  ADD COLUMN IF NOT EXISTS "cliente_id"                  UUID,
  ADD COLUMN IF NOT EXISTS "consecutivo_centro_costos"   INTEGER,
  ADD COLUMN IF NOT EXISTS "es_especial"                 BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "tipo_especial"                VARCHAR(20),
  ADD COLUMN IF NOT EXISTS "fecha_inicio_real"           TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "fecha_firma_contrato"        TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "fecha_programada_inicio"     TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "fecha_programada_fin"        TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "monto_total_vendido"         DECIMAL(18,2),
  ADD COLUMN IF NOT EXISTS "periodo_ejecucion"           INTEGER,
  ADD COLUMN IF NOT EXISTS "periodo_ejecucion_unidad"    VARCHAR(10),
  ADD COLUMN IF NOT EXISTS "total_dias_naturales"        INTEGER,
  ADD COLUMN IF NOT EXISTS "total_dias_laborables"       INTEGER;

CREATE INDEX IF NOT EXISTS "proyectos_tenant_id_empresa_grupo_anio_centro_costos_cliente_i"
  ON "proyectos"("tenant_id", "empresa_grupo", "anio_centro_costos", "cliente_id");

-- Remapeo de vocabulario legacy de estatus (ver design.md, Decisión 5).
-- Reversible: guardar este mapeo si algún día hace falta revertir.
UPDATE "proyectos" SET "estatus" = 'ABIERTO'      WHERE "estatus" IN ('LICITACION', 'ADJUDICADO');
UPDATE "proyectos" SET "estatus" = 'EN EJECUCIÓN' WHERE "estatus" = 'CONSTRUCCION';
UPDATE "proyectos" SET "estatus" = 'EN COBRO'     WHERE "estatus" = 'CIERRE_TECNICO';
UPDATE "proyectos" SET "estatus" = 'CERRADO'      WHERE "estatus" = 'CIERRE_FINANCIERO';

ALTER TABLE "proyectos" ALTER COLUMN "estatus" SET DEFAULT 'ABIERTO';
