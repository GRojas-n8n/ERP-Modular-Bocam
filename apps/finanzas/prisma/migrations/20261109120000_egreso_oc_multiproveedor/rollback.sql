-- Rollback: egreso_oc_multiproveedor. Pierde la proyección ocs_por_pagar (se reconstruye con el backfill desde Compras).
BEGIN;
DROP INDEX IF EXISTS "uq_pagos_oc_folio";
DROP TABLE IF EXISTS "ocs_por_pagar";
COMMIT;
