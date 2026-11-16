-- Rollback de 20260930180000_outbox_eventos_finanzas (no lo ejecuta Prisma; se aplica a mano con autorizacion).
-- Transaccional. SE NEGARA a borrar la tabla si hay eventos PENDIENTE o ERROR: nunca se eliminan eventos pendientes.
-- Antes de revertir: volver FINANZAS_EVENT_MODE a `direct`, dejar que el despachador vacie lo pendiente (o reenviarlo) y
-- comprobar que no quedan filas PENDIENTE/ERROR. Las filas PUBLICADO son historial y se pierden con la tabla.

BEGIN;

DO $$
DECLARE pendientes BIGINT;
BEGIN
  IF to_regclass('outbox_eventos') IS NOT NULL THEN
    EXECUTE 'SELECT count(*) FROM "outbox_eventos" WHERE "estado" <> ''PUBLICADO''' INTO pendientes;
    IF pendientes > 0 THEN
      RAISE EXCEPTION 'ROLLBACK_ABORTADO: hay % eventos PENDIENTE/ERROR en outbox_eventos; no se eliminan eventos pendientes', pendientes;
    END IF;
  END IF;
END $$;

DROP TABLE IF EXISTS "outbox_eventos";

COMMIT;
