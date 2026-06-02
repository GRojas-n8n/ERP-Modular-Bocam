-- Migration: gt_version_presupuesto
-- Adds APROBADO state + aprobado_por + fecha_aprobacion to presupuestos_base.

ALTER TYPE "EstadoPresupuesto" ADD VALUE IF NOT EXISTS 'APROBADO';

ALTER TABLE "presupuestos_base"
  ADD COLUMN IF NOT EXISTS "aprobado_por"     UUID,
  ADD COLUMN IF NOT EXISTS "fecha_aprobacion" TIMESTAMPTZ;
