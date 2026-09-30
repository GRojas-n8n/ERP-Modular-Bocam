-- Rollback de 20260930120000_blindar_compromiso_oc (no lo ejecuta Prisma; se aplica a mano con autorizacion).
-- Transaccional. No toca datos de negocio de movimientos_presupuestales: solo elimina la restriccion CHECK,
-- el indice y la tabla de tombstones.
-- Advertencia: al eliminar los tombstones se pierde el registro de cancelaciones anteriores a su creacion.
-- Las funciones current_tenant_id() / current_proyecto_id() se conservan (las usan las demas politicas RLS).

BEGIN;

ALTER TABLE "movimientos_presupuestales" DROP CONSTRAINT IF EXISTS "chk_movimiento_oc_referencia_id";

DROP INDEX IF EXISTS "uq_movimiento_oc_compromiso_liberacion";

DROP TABLE IF EXISTS "oc_cancelaciones_tombstone";

COMMIT;
