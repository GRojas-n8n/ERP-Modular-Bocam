-- Migration: asignacion-residente-es_principal-y-prestamo
-- Ver specs/features/02-asignacion-empleados-residente-prestamos.md
-- Formaliza en una migración columnas que spec 02 aplicó localmente vía
-- `prisma db push` (AsignacionResidente.es_principal y
-- AsignacionFrente.es_prestamo) — nunca habían quedado en el historial de
-- migraciones ni se habían aplicado a ningún ambiente real.

ALTER TABLE "asignaciones_residente"
  ADD COLUMN "es_principal" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "asignaciones_frente"
  ADD COLUMN "es_prestamo" BOOLEAN NOT NULL DEFAULT false;
