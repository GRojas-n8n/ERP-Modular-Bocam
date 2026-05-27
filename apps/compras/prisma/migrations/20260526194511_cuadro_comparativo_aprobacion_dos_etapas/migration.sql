-- Migration: cuadro_comparativo_aprobacion_dos_etapas
-- Adds two-stage approval workflow to CuadroComparativo + ComparativaDetalle
-- Migrates existing data: ABIERTO→BORRADOR, APROBADO→APROBADO_GT

-- ── 1. CuadroComparativo: nuevos campos de auditoría ─────────────────────────
ALTER TABLE "compras"."cuadros_comparativos"
  ADD COLUMN IF NOT EXISTS "evaluacion_residente_id"  UUID,
  ADD COLUMN IF NOT EXISTS "fecha_evaluacion_tecnica" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "gerente_tecnico_id"       UUID,
  ADD COLUMN IF NOT EXISTS "fecha_aprobacion_gt"      TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "comentario_gt_general"    TEXT;

-- ── 2. ComparativaDetalle: campos de evaluación técnica y GT ──────────────────
ALTER TABLE "compras"."comparativas_detalles"
  ADD COLUMN IF NOT EXISTS "evaluacion_tecnica" VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
  ADD COLUMN IF NOT EXISTS "comentario_tecnico" TEXT,
  ADD COLUMN IF NOT EXISTS "aprobacion_gt"      VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
  ADD COLUMN IF NOT EXISTS "comentario_gt"      TEXT;

-- ── 3. Migración de datos: remapear estados existentes ───────────────────────
-- ABIERTO → BORRADOR (cuadros en edición sin flujo de aprobación iniciado)
UPDATE "compras"."cuadros_comparativos"
  SET estado = 'BORRADOR'
  WHERE estado = 'ABIERTO';

-- APROBADO → APROBADO_GT (cuadros que ya tenían aprobación implícita)
UPDATE "compras"."cuadros_comparativos"
  SET estado = 'APROBADO_GT'
  WHERE estado = 'APROBADO';

-- CERRADO permanece como CERRADO (OC ya emitida)
