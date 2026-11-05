-- Migration: egreso_oc_multiproveedor
-- Ver openspec/changes/corregir-egreso-oc-multiproveedor.
--
-- ATOMICIDAD: todo dentro de BEGIN/COMMIT; cualquier fallo (incluido el precheck) revierte por completo.
--
-- 1. Precheck: ABORTA si ya hay egresos con el mismo folio (tenant, fuente, cuenta|proyecto, tipo_pago, referencia)
--    o movimientos de nómina COMPROMISO/EJERCIDO duplicados por prenómina. No borra ni corrige filas.
-- 2. ocs_por_pagar: proyección local de OCs emitidas (alimentada por compras.oc_creada/oc_cancelada) con saldo
--    pagado. Es la fuente de validación de proyecto, proveedor y saldo de cada egreso. RLS habilitado y forzado,
--    Patrón Global con Trazabilidad (mismo que pagos_oc).
-- 3. uq_pagos_oc_folio: un folio bancario se registra una sola vez por cuenta (o por proyecto si es anticipo).
-- 4. uq_movimiento_nomina: como máximo un COMPROMISO y un EJERCIDO por prenómina (reentregas concurrentes).
-- IDEMPOTENTE: en CI `prisma db push` ya crea ocs_por_pagar desde schema.prisma antes de este SQL; todo usa
-- IF NOT EXISTS / comprobación en pg_constraint para poder re-ejecutarse sin error.
-- Rollback: rollback.sql (mismo directorio).

BEGIN;

DO $$
DECLARE
  dup_folio BIGINT;
  dup_nomina BIGINT;
BEGIN
  SELECT count(*) INTO dup_folio FROM (
    SELECT 1 FROM "pagos_oc"
    GROUP BY "tenant_id", "fuente", COALESCE("cuenta_id", "proyecto_id"), "tipo_pago", "referencia"
    HAVING count(*) > 1
  ) d;

  SELECT count(*) INTO dup_nomina FROM (
    SELECT 1 FROM "movimientos_presupuestales"
    WHERE "referencia_modulo" = 'personal' AND "referencia_entidad" = 'PreNomina'
      AND "tipo" IN ('COMPROMISO', 'EJERCIDO') AND "referencia_id" IS NOT NULL
    GROUP BY "tenant_id", "referencia_id", "tipo"
    HAVING count(*) > 1
  ) d;

  IF dup_folio > 0 OR dup_nomina > 0 THEN
    RAISE EXCEPTION 'egreso_oc_multiproveedor: precheck fallido (folios duplicados: %, nómina duplicada: %). Depurar antes de migrar.',
      dup_folio, dup_nomina;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "ocs_por_pagar" (
  "tenant_id"        UUID           NOT NULL,
  "oc_id"            UUID           NOT NULL,
  "proyecto_id"      UUID           NOT NULL,
  "oc_codigo"        VARCHAR(50)    NOT NULL,
  "proveedor_id"     UUID           NOT NULL,
  "proveedor_nombre" VARCHAR(255)   NOT NULL DEFAULT '',
  "concepto_id"      UUID,
  "total"            DECIMAL(18, 2) NOT NULL,
  "pagado"           DECIMAL(18, 2) NOT NULL DEFAULT 0,
  "estado"           VARCHAR(20)    NOT NULL DEFAULT 'POR_PAGAR',
  "created_at"       TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"       TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ocs_por_pagar_pkey" PRIMARY KEY ("tenant_id", "oc_id")
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint c JOIN pg_namespace n ON n.oid = c.connamespace
                  WHERE c.conname = 'ck_ocs_por_pagar_montos' AND n.nspname = current_schema()) THEN
    ALTER TABLE "ocs_por_pagar" ADD CONSTRAINT "ck_ocs_por_pagar_montos"
      CHECK ("total" > 0 AND "pagado" >= 0 AND "pagado" <= "total");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint c JOIN pg_namespace n ON n.oid = c.connamespace
                  WHERE c.conname = 'ck_ocs_por_pagar_estado' AND n.nspname = current_schema()) THEN
    ALTER TABLE "ocs_por_pagar" ADD CONSTRAINT "ck_ocs_por_pagar_estado"
      CHECK ("estado" IN ('POR_PAGAR', 'PAGO_PARCIAL', 'PAGADA', 'CANCELADA'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "ocs_por_pagar_tenant_proyecto_estado_idx" ON "ocs_por_pagar" ("tenant_id", "proyecto_id", "estado");
CREATE INDEX IF NOT EXISTS "ocs_por_pagar_tenant_proveedor_idx" ON "ocs_por_pagar" ("tenant_id", "proveedor_id");

ALTER TABLE "ocs_por_pagar" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ocs_por_pagar" FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS rls_ocs_por_pagar_select ON "ocs_por_pagar";
CREATE POLICY rls_ocs_por_pagar_select ON "ocs_por_pagar"
    FOR SELECT USING (
        tenant_id = current_tenant_id()
        AND (current_proyecto_id() IS NULL OR proyecto_id = current_proyecto_id())
    );

DROP POLICY IF EXISTS rls_ocs_por_pagar_insert ON "ocs_por_pagar";
CREATE POLICY rls_ocs_por_pagar_insert ON "ocs_por_pagar"
    FOR INSERT WITH CHECK (
        tenant_id = current_tenant_id()
        AND proyecto_id = current_proyecto_id()
    );

DROP POLICY IF EXISTS rls_ocs_por_pagar_update ON "ocs_por_pagar";
CREATE POLICY rls_ocs_por_pagar_update ON "ocs_por_pagar"
    FOR UPDATE USING (
        tenant_id = current_tenant_id()
        AND proyecto_id = current_proyecto_id()
    ) WITH CHECK (
        tenant_id = current_tenant_id()
        AND proyecto_id = current_proyecto_id()
    );

CREATE UNIQUE INDEX IF NOT EXISTS "uq_pagos_oc_folio"
    ON "pagos_oc" ("tenant_id", "fuente", (COALESCE("cuenta_id", "proyecto_id")), "tipo_pago", "referencia");

CREATE UNIQUE INDEX IF NOT EXISTS "uq_movimiento_nomina"
    ON "movimientos_presupuestales" ("tenant_id", "referencia_id", "tipo")
    WHERE "referencia_modulo" = 'personal' AND "referencia_entidad" = 'PreNomina'
      AND "tipo" IN ('COMPROMISO', 'EJERCIDO') AND "referencia_id" IS NOT NULL;

COMMIT;
