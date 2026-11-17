-- Migration: outbox_eventos_finanzas
-- Ver openspec/changes/hacer-confiables-publicadores-eventbus-criticos (lote P1, Outbox de Finanzas).
--
-- ADITIVA: solo crea una tabla nueva, indices, restricciones y politicas RLS. No toca ninguna tabla existente
-- ni datos. Mientras FINANZAS_EVENT_MODE siga en `direct` la tabla permanece vacia y nada la lee.
--
-- ATOMICIDAD: todo el script va dentro de BEGIN/COMMIT (mismo criterio que 20260930120000_blindar_compromiso_oc).
-- Es idempotente (IF NOT EXISTS / DROP ... IF EXISTS) porque el CI la aplica despues de `prisma db push`.
--
-- RLS: habilitado y FORZADO. Una sesion de aplicacion (con tenant+proyecto) solo puede LEER e INSERTAR filas de su
-- tenant y proyecto; NO puede actualizar ni borrar (la tabla es inmutable para la aplicacion). Solo el despachador,
-- con la variable de sesion interna app.internal_worker = 'outbox', puede leer todas las filas, actualizarlas
-- (estado, intentos) y borrar las PUBLICADO antiguas. Paridad con prisma/rls-policies.sql (lo verifica una prueba).
-- Rollback: rollback.sql (mismo directorio). Prisma no ejecuta migraciones inversas.

BEGIN;

CREATE TABLE IF NOT EXISTS "outbox_eventos" (
  "id_evento"          UUID NOT NULL DEFAULT gen_random_uuid(),
  "orden_global"       BIGSERIAL NOT NULL,
  "event_id"           UUID NOT NULL,
  "event_type"         VARCHAR(100) NOT NULL,
  "event_version"      INTEGER NOT NULL DEFAULT 1,
  "tenant_id"          UUID NOT NULL,
  "proyecto_id"        UUID NOT NULL,
  "aggregate_type"     VARCHAR(50) NOT NULL,
  "aggregate_id"       UUID NOT NULL,
  "aggregate_seq"      INTEGER NOT NULL,
  "usuario_id"         UUID,
  "correlation_id"     VARCHAR(100),
  "payload"            JSONB NOT NULL,
  "estado"             VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
  "intentos"           INTEGER NOT NULL DEFAULT 0,
  "proximo_intento_en" TIMESTAMPTZ(3) NOT NULL DEFAULT now(),
  "ultimo_error"       TEXT,
  "created_at"         TIMESTAMPTZ(3) NOT NULL DEFAULT now(),
  "publicado_en"       TIMESTAMPTZ(3),
  CONSTRAINT "outbox_eventos_pkey" PRIMARY KEY ("id_evento")
);

ALTER TABLE "outbox_eventos" DROP CONSTRAINT IF EXISTS "chk_outbox_estado";
ALTER TABLE "outbox_eventos" ADD CONSTRAINT "chk_outbox_estado" CHECK ("estado" IN ('PENDIENTE', 'PUBLICADO', 'ERROR'));
ALTER TABLE "outbox_eventos" DROP CONSTRAINT IF EXISTS "chk_outbox_valores";
ALTER TABLE "outbox_eventos" ADD CONSTRAINT "chk_outbox_valores" CHECK ("intentos" >= 0 AND "aggregate_seq" > 0);

-- event_id estable y unico por tenant: un mismo evento de negocio no produce dos filas.
CREATE UNIQUE INDEX IF NOT EXISTS "uq_outbox_finanzas_event" ON "outbox_eventos" ("tenant_id", "event_id");
-- Secuencia monotonica por agregado (la OC): orden determinista, protegido por el lock advisory de la OC.
CREATE UNIQUE INDEX IF NOT EXISTS "uq_outbox_finanzas_agregado_seq" ON "outbox_eventos" ("tenant_id", "aggregate_type", "aggregate_id", "aggregate_seq");
CREATE UNIQUE INDEX IF NOT EXISTS "uq_outbox_finanzas_orden_global" ON "outbox_eventos" ("orden_global");
CREATE INDEX IF NOT EXISTS "idx_outbox_finanzas_estado_proximo" ON "outbox_eventos" ("estado", "proximo_intento_en");

ALTER TABLE "outbox_eventos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "outbox_eventos" FORCE ROW LEVEL SECURITY;

-- >>> OUTBOX_EVENTOS_FINANZAS
-- Se comparan los GUC con NULLIF(..., ''): tras una transaccion con set_config(..., true) el GUC queda en ''
-- en esa conexion del pool, y ''::uuid lanzaria un error antes de evaluar la rama del despachador.
DROP POLICY IF EXISTS rls_outbox_fin_select ON "outbox_eventos";
CREATE POLICY rls_outbox_fin_select ON "outbox_eventos"
    FOR SELECT USING (
        current_setting('app.internal_worker', true) = 'outbox'
        OR (
            tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
            AND proyecto_id = NULLIF(current_setting('app.current_proyecto_id', true), '')::uuid
        )
    );

DROP POLICY IF EXISTS rls_outbox_fin_insert ON "outbox_eventos";
CREATE POLICY rls_outbox_fin_insert ON "outbox_eventos"
    FOR INSERT WITH CHECK (
        tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
        AND proyecto_id = NULLIF(current_setting('app.current_proyecto_id', true), '')::uuid
    );

DROP POLICY IF EXISTS rls_outbox_fin_worker_update ON "outbox_eventos";
CREATE POLICY rls_outbox_fin_worker_update ON "outbox_eventos"
    FOR UPDATE USING (current_setting('app.internal_worker', true) = 'outbox')
    WITH CHECK (current_setting('app.internal_worker', true) = 'outbox');

DROP POLICY IF EXISTS rls_outbox_fin_worker_delete ON "outbox_eventos";
CREATE POLICY rls_outbox_fin_worker_delete ON "outbox_eventos"
    FOR DELETE USING (current_setting('app.internal_worker', true) = 'outbox');
-- <<< OUTBOX_EVENTOS_FINANZAS

COMMIT;
