-- Migration: blindar_compromiso_oc
-- Ver openspec/changes/blindar-compromiso-oc-concurrencia-y-orden-eventos.
--
-- 1. Comprobación previa: ABORTA si ya existen COMPROMISO o LIBERACION duplicados por OC.
--    No borra ni corrige filas; la limpieza de datos, si hiciera falta, se decide aparte.
-- 2. Índice único parcial: como máximo un COMPROMISO y una LIBERACION por (tenant, OC).
--    Se limita a compras/OrdenCompra porque el endpoint genérico de movimientos y la nómina
--    también usan estos tipos con otras referencias y no comparten esta regla.
--    (Sin CONCURRENTLY: prisma migrate deploy ejecuta el archivo en un solo lote y la tabla es pequeña.)
-- 3. Tombstone de cancelación: registra la cancelación de una OC cuya creación aún no se procesó.
--    Única por (tenant, OC), RLS habilitado y forzado, inmutable (sin UPDATE/DELETE) y sin TTL.
--
-- Rollback: rollback.sql (mismo directorio). Prisma no ejecuta migraciones inversas.

-- --- 1. Comprobación previa de duplicados ------------------------------------
DO $$
DECLARE
  dup_compromiso BIGINT;
  dup_liberacion BIGINT;
BEGIN
  SELECT count(*) INTO dup_compromiso FROM (
    SELECT 1 FROM "movimientos_presupuestales"
    WHERE "tipo" = 'COMPROMISO' AND "referencia_modulo" = 'compras' AND "referencia_entidad" = 'OrdenCompra' AND "referencia_id" IS NOT NULL
    GROUP BY "tenant_id", "referencia_modulo", "referencia_entidad", "referencia_id", "tipo"
    HAVING count(*) > 1
  ) d;

  SELECT count(*) INTO dup_liberacion FROM (
    SELECT 1 FROM "movimientos_presupuestales"
    WHERE "tipo" = 'LIBERACION' AND "referencia_modulo" = 'compras' AND "referencia_entidad" = 'OrdenCompra' AND "referencia_id" IS NOT NULL
    GROUP BY "tenant_id", "referencia_modulo", "referencia_entidad", "referencia_id", "tipo"
    HAVING count(*) > 1
  ) d;

  IF dup_compromiso > 0 OR dup_liberacion > 0 THEN
    RAISE EXCEPTION 'MIGRACION_ABORTADA: existen OC con movimientos duplicados (COMPROMISO: % grupos, LIBERACION: % grupos). No se modificó ningún dato. Resolver los duplicados antes de aplicar esta migración.', dup_compromiso, dup_liberacion;
  END IF;
END $$;

-- --- 2. Índice único parcial ------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS "uq_movimiento_oc_compromiso_liberacion"
  ON "movimientos_presupuestales" ("tenant_id", "referencia_modulo", "referencia_entidad", "referencia_id", "tipo")
  WHERE "tipo" IN ('COMPROMISO', 'LIBERACION')
    AND "referencia_modulo" = 'compras'
    AND "referencia_entidad" = 'OrdenCompra'
    AND "referencia_id" IS NOT NULL;

-- --- 3. Tombstone de cancelación de OC --------------------------------------
CREATE TABLE IF NOT EXISTS "oc_cancelaciones_tombstone" (
  "tenant_id"   UUID NOT NULL,
  "oc_id"       UUID NOT NULL,
  "proyecto_id" UUID NOT NULL,
  "oc_codigo"   VARCHAR(50),
  "origen"      VARCHAR(30) NOT NULL,
  "usuario_id"  UUID NOT NULL,
  "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "oc_cancelaciones_tombstone_pkey" PRIMARY KEY ("tenant_id", "oc_id")
);

-- Funciones auxiliares de RLS (definición idéntica a prisma/rls-policies.sql; idempotentes).
CREATE OR REPLACE FUNCTION current_tenant_id() RETURNS UUID AS $$
BEGIN
    RETURN current_setting('app.current_tenant_id', true)::UUID;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION current_proyecto_id() RETURNS UUID AS $$
BEGIN
    RETURN current_setting('app.current_proyecto_id', true)::UUID;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

ALTER TABLE "oc_cancelaciones_tombstone" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "oc_cancelaciones_tombstone" FORCE ROW LEVEL SECURITY;

-- Patrón Estricto (tenant + proyecto), como movimientos_presupuestales. Sin políticas de UPDATE/DELETE:
-- bajo FORCE RLS un tombstone no se puede modificar ni borrar desde la aplicación.
DROP POLICY IF EXISTS rls_oc_tombstone_select ON "oc_cancelaciones_tombstone";
CREATE POLICY rls_oc_tombstone_select ON "oc_cancelaciones_tombstone"
    FOR SELECT USING (
        tenant_id = current_tenant_id()
        AND proyecto_id = current_proyecto_id()
    );

DROP POLICY IF EXISTS rls_oc_tombstone_insert ON "oc_cancelaciones_tombstone";
CREATE POLICY rls_oc_tombstone_insert ON "oc_cancelaciones_tombstone"
    FOR INSERT WITH CHECK (
        tenant_id = current_tenant_id()
        AND proyecto_id = current_proyecto_id()
    );
