-- Migration: asistencia-por-jornada
-- Adds two-mode attendance tracking: JORNADA_COMPLETA (daily) and POR_HORAS (time-in/out)

-- ── Empleado: campos de jornada ───────────────────────────────────────────────
ALTER TABLE "empleados"
  ADD COLUMN "modo_asistencia"         TEXT         NOT NULL DEFAULT 'JORNADA_COMPLETA',
  ADD COLUMN "tipo_jornada"            TEXT         NOT NULL DEFAULT 'DIURNA',
  ADD COLUMN "hora_entrada_programada" VARCHAR(5),
  ADD COLUMN "hora_salida_programada"  VARCHAR(5),
  ADD COLUMN "horas_jornada"           DECIMAL(4,2) NOT NULL DEFAULT 8;

-- ── RegistroAsistencia: campos de hora entrada/salida y cálculos ──────────────
ALTER TABLE "registros_asistencia"
  ADD COLUMN "hora_entrada"     VARCHAR(5),
  ADD COLUMN "hora_salida"      VARCHAR(5),
  ADD COLUMN "horas_trabajadas" DECIMAL(4,2),
  ADD COLUMN "horas_normales"   DECIMAL(4,2),
  ADD COLUMN "horas_extra_dia"  DECIMAL(4,2),
  ADD COLUMN "origen_horas"     TEXT         NOT NULL DEFAULT 'REAL';

-- ── PreNominaDetalle: campos exclusivos para modo POR_HORAS ───────────────────
ALTER TABLE "pre_nomina_detalles"
  ADD COLUMN "horas_normales"  DECIMAL(6,2),
  ADD COLUMN "monto_he_doble"  DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN "monto_he_triple" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN "origen_horas"    TEXT          NOT NULL DEFAULT 'REAL';
