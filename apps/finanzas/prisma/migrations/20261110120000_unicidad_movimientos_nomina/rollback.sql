-- Rollback: unicidad_movimientos_nomina.
BEGIN;
DROP INDEX IF EXISTS "uq_movimiento_nomina";
COMMIT;
