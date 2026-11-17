-- Migration: unicidad_transferencias
-- Ver openspec/changes/blindar-movimientos-y-sincronizacion-gt (hallazgo F23).
--
-- ATOMICIDAD: todo dentro de BEGIN/COMMIT; cualquier fallo (incluido el precheck) revierte por completo.
-- IDEMPOTENTE: CREATE UNIQUE INDEX IF NOT EXISTS; puede re-ejecutarse sin error.
--
-- 1. Precheck: ABORTA si una misma transferencia ya tiene dos movimientos sobre el mismo presupuesto.
-- 2. uq_transferencia_presupuesto: una transferencia_id deja como máximo un movimiento por presupuesto (salida en el
--    origen, entrada en el destino). Respaldo en BD de la idempotencia del endpoint ante reintentos simultáneos.
-- Rollback: rollback.sql (mismo directorio).

BEGIN;

DO $$
DECLARE
  dup BIGINT;
BEGIN
  SELECT count(*) INTO dup FROM (
    SELECT 1 FROM "movimientos_presupuestales"
     WHERE "referencia_modulo" = 'finanzas' AND "referencia_entidad" = 'TransferenciaPresupuestal'
       AND "tipo" = 'TRANSFERENCIA' AND "referencia_id" IS NOT NULL
     GROUP BY "tenant_id", "referencia_id", "presupuesto_id"
    HAVING count(*) > 1
  ) d;
  IF dup > 0 THEN
    RAISE EXCEPTION 'unicidad_transferencias: precheck fallido (transferencias duplicadas: %). Depurar antes de migrar.', dup;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "uq_transferencia_presupuesto"
    ON "movimientos_presupuestales" ("tenant_id", "referencia_id", "presupuesto_id")
    WHERE "referencia_modulo" = 'finanzas' AND "referencia_entidad" = 'TransferenciaPresupuestal'
      AND "tipo" = 'TRANSFERENCIA' AND "referencia_id" IS NOT NULL;

COMMIT;
