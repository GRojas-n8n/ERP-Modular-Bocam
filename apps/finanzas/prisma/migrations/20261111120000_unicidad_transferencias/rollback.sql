-- Rollback: unicidad_transferencias.
BEGIN;
DROP INDEX IF EXISTS "uq_transferencia_presupuesto";
COMMIT;
