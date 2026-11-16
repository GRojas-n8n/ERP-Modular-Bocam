-- Rollback de 20261113120000_nominas_por_pagar. Solo si ninguna nómina se pagó por Finanzas.
BEGIN;
DROP TABLE IF EXISTS "nominas_por_pagar";
COMMIT;
