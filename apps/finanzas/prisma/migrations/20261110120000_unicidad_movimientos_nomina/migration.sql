-- Migration: unicidad_movimientos_nomina
-- Ver openspec/changes/blindar-consumidores-finanzas.
--
-- ATOMICIDAD: todo dentro de BEGIN/COMMIT; cualquier fallo (incluido el precheck) revierte por completo.
-- IDEMPOTENTE: CREATE UNIQUE INDEX IF NOT EXISTS; puede re-ejecutarse sin error.
--
-- 1. Precheck: ABORTA si ya existen dos COMPROMISO o dos EJERCIDO de la misma prenómina. No borra ni corrige filas.
-- 2. uq_movimiento_nomina: como máximo un COMPROMISO y un EJERCIDO por prenómina. Con reintento y DLQ en los
--    consumidores, dos entregas simultáneas del mismo evento ya no duplican el compromiso ni el ejercido.
-- Rollback: rollback.sql (mismo directorio).

BEGIN;

DO $$
DECLARE
  dup BIGINT;
BEGIN
  SELECT count(*) INTO dup FROM (
    SELECT 1 FROM "movimientos_presupuestales"
     WHERE "referencia_modulo" = 'personal' AND "referencia_entidad" = 'PreNomina'
       AND "tipo" IN ('COMPROMISO', 'EJERCIDO') AND "referencia_id" IS NOT NULL
     GROUP BY "tenant_id", "referencia_id", "tipo"
    HAVING count(*) > 1
  ) d;
  IF dup > 0 THEN
    RAISE EXCEPTION 'unicidad_movimientos_nomina: precheck fallido (movimientos de nómina duplicados: %). Depurar antes de migrar.', dup;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "uq_movimiento_nomina"
    ON "movimientos_presupuestales" ("tenant_id", "referencia_id", "tipo")
    WHERE "referencia_modulo" = 'personal' AND "referencia_entidad" = 'PreNomina'
      AND "tipo" IN ('COMPROMISO', 'EJERCIDO') AND "referencia_id" IS NOT NULL;

COMMIT;
