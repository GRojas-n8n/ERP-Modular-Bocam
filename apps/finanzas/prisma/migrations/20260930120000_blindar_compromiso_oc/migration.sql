-- Migration: blindar_compromiso_oc
-- Ver openspec/changes/blindar-compromiso-oc-concurrencia-y-orden-eventos.
--
-- ATOMICIDAD: todo el script va dentro de BEGIN/COMMIT. Cualquier fallo (incluido el precheck) revierte
-- por completo indice, restriccion, tabla, funciones y politicas: nunca queda un esquema parcial. La
-- transaccion explicita importa tambien para runners que ejecutan sentencia por sentencia (psql -f);
-- prisma migrate deploy / db execute ya envian el script en un solo lote.
--
-- 1. Comprobacion previa (ANTES de cualquier DDL): ABORTA si ya existen COMPROMISO o LIBERACION duplicados
--    por OC, o movimientos de OC sin referencia_id. No borra ni corrige filas; la limpieza, si hiciera
--    falta, se decide aparte.
-- 2. CHECK: un COMPROMISO/LIBERACION de compras/OrdenCompra debe traer referencia_id. Sin esto un NULL
--    evadiria el indice unico (el indice solo cubre referencia_id NOT NULL).
-- 3. Indice unico parcial: como maximo un COMPROMISO y una LIBERACION por (tenant, OC).
--    Se limita a compras/OrdenCompra (decision del titular): el endpoint generico de movimientos y la
--    nomina tambien usan estos tipos con otras referencias y no comparten esta regla.
--    (Sin CONCURRENTLY: no es posible dentro de una transaccion y la tabla es pequena.)
-- 4. Tombstone de cancelacion: registra la cancelacion de una OC cuya creacion aun no se proceso.
--    Unica por (tenant, OC), RLS habilitado y forzado, inmutable (sin UPDATE/DELETE) y sin TTL ni limpieza.
--
-- Paridad: las sentencias RLS del tombstone son identicas a las de prisma/rls-policies.sql (lo verifica
-- una prueba estatica). Rollback: rollback.sql (mismo directorio). Prisma no ejecuta migraciones inversas.

BEGIN;

-- --- 1. Comprobacion previa (antes de cualquier DDL) --------------------------------------------
DO $$
DECLARE
  dup_compromiso BIGINT;
  dup_liberacion BIGINT;
  sin_referencia BIGINT;
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

  SELECT count(*) INTO sin_referencia FROM "movimientos_presupuestales"
  WHERE "tipo" IN ('COMPROMISO', 'LIBERACION') AND "referencia_modulo" = 'compras' AND "referencia_entidad" = 'OrdenCompra'
    AND "referencia_id" IS NULL;

  IF dup_compromiso > 0 OR dup_liberacion > 0 OR sin_referencia > 0 THEN
    RAISE EXCEPTION 'MIGRACION_ABORTADA: datos previos incompatibles (COMPROMISO duplicados: % grupos, LIBERACION duplicados: % grupos, movimientos de OC sin referencia_id: % filas). No se modifico ningun dato. Resolver antes de aplicar esta migracion.', dup_compromiso, dup_liberacion, sin_referencia;
  END IF;
END $$;

-- --- 2. CHECK: referencia_id obligatorio para COMPROMISO/LIBERACION de OC ------------------------
ALTER TABLE "movimientos_presupuestales" DROP CONSTRAINT IF EXISTS "chk_movimiento_oc_referencia_id";
ALTER TABLE "movimientos_presupuestales" ADD CONSTRAINT "chk_movimiento_oc_referencia_id"
  CHECK (NOT ("tipo" IN ('COMPROMISO', 'LIBERACION') AND "referencia_modulo" = 'compras' AND "referencia_entidad" = 'OrdenCompra' AND "referencia_id" IS NULL));

-- --- 3. Indice unico parcial ---------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS "uq_movimiento_oc_compromiso_liberacion"
  ON "movimientos_presupuestales" ("tenant_id", "referencia_modulo", "referencia_entidad", "referencia_id", "tipo")
  WHERE "tipo" IN ('COMPROMISO', 'LIBERACION')
    AND "referencia_modulo" = 'compras'
    AND "referencia_entidad" = 'OrdenCompra'
    AND "referencia_id" IS NOT NULL;

-- --- 4. Tombstone de cancelacion de OC -----------------------------------------------------------
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

-- Funciones auxiliares de RLS (definicion identica a prisma/rls-policies.sql). Solo se crean si NO existen:
-- en produccion ya existen y pertenecen al rol administrador (las aplica rls-policies.sql como superusuario), y el
-- rol de runtime con el que corre prisma migrate deploy no es su duenio, por lo que un CREATE OR REPLACE fallaria.
DO $$
BEGIN
  IF to_regprocedure('current_tenant_id()') IS NULL THEN
    EXECUTE $f$
      CREATE FUNCTION current_tenant_id() RETURNS UUID AS $b$
      BEGIN
          RETURN current_setting('app.current_tenant_id', true)::UUID;
      EXCEPTION WHEN OTHERS THEN
          RETURN NULL;
      END;
      $b$ LANGUAGE plpgsql STABLE
    $f$;
  END IF;
  IF to_regprocedure('current_proyecto_id()') IS NULL THEN
    EXECUTE $f$
      CREATE FUNCTION current_proyecto_id() RETURNS UUID AS $b$
      BEGIN
          RETURN current_setting('app.current_proyecto_id', true)::UUID;
      EXCEPTION WHEN OTHERS THEN
          RETURN NULL;
      END;
      $b$ LANGUAGE plpgsql STABLE
    $f$;
  END IF;
END $$;

ALTER TABLE "oc_cancelaciones_tombstone" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "oc_cancelaciones_tombstone" FORCE ROW LEVEL SECURITY;

-- Patron Estricto (tenant + proyecto), como movimientos_presupuestales. Sin politicas de UPDATE/DELETE:
-- bajo FORCE RLS un tombstone no se puede modificar ni borrar desde la aplicacion.
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

COMMIT;
