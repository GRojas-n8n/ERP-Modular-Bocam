-- Rollback de 20261114120000_libro_bancario. Borra el historial bancario: respaldar antes con el Bloque 1.
-- Los saldos de cuentas_bancarias no cambian; solo se pierde la trazabilidad de cómo llegaron ahí.
BEGIN;
DROP TABLE IF EXISTS "movimientos_bancarios";
DROP FUNCTION IF EXISTS movimientos_bancarios_inmutable();
COMMIT;
