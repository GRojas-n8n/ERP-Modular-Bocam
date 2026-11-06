-- Rollback de 20261112120000_cuentas_por_cobrar. Solo si no hay cobros reales registrados: borra el historial.
BEGIN;
DROP TABLE IF EXISTS "cobros_cxc";
DROP TABLE IF EXISTS "cuentas_por_cobrar";
COMMIT;
