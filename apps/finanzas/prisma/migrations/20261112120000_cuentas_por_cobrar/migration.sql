-- Migration: cuentas_por_cobrar
-- Ver openspec/changes/cuentas-por-cobrar-estimaciones (hallazgo F20).
--
-- 1. cuentas_por_cobrar: una estimación aprobada es dinero que el cliente debe a la constructora. Alta idempotente
--    por (tenant, origen, origen_id). CHECK 0 <= cobrado <= monto y CHECK de estado.
-- 2. cobros_cxc: cada cobro abona una cuenta bancaria; folio único por tenant.
-- 3. RLS habilitado y forzado en ambas, Patrón Global con Trazabilidad (igual que ocs_por_pagar). Sin DELETE: una
--    cuenta cancelada conserva su historial; un cobro no se borra.
-- Solo estructura: mover las estimaciones ya programadas como pagos es un script aparte, con revisión del contador
-- (scripts/finanzas/migrar-estimaciones-a-cxc.sql).
-- IDEMPOTENTE: en CI `prisma db push` crea las tablas desde schema.prisma antes de este SQL.
-- Rollback: rollback.sql (mismo directorio).

BEGIN;

CREATE TABLE IF NOT EXISTS "cuentas_por_cobrar" (
  "id_cxc"            UUID           NOT NULL,
  "tenant_id"         UUID           NOT NULL,
  "proyecto_id"       UUID           NOT NULL,
  "origen"            VARCHAR(20)    NOT NULL,
  "origen_id"         UUID           NOT NULL,
  "codigo"            VARCHAR(60)    NOT NULL,
  "concepto"          VARCHAR(255)   NOT NULL,
  "presupuesto_id"    UUID,
  "monto"             DECIMAL(18, 2) NOT NULL,
  "cobrado"           DECIMAL(18, 2) NOT NULL DEFAULT 0,
  "moneda"            VARCHAR(5)     NOT NULL DEFAULT 'MXN',
  "fecha_vencimiento" TIMESTAMP(3)   NOT NULL,
  "estado"            VARCHAR(20)    NOT NULL DEFAULT 'POR_COBRAR',
  "created_at"        TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"        TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "cuentas_por_cobrar_pkey" PRIMARY KEY ("id_cxc")
);

CREATE TABLE IF NOT EXISTS "cobros_cxc" (
  "id_cobro"    UUID           NOT NULL,
  "tenant_id"   UUID           NOT NULL,
  "proyecto_id" UUID           NOT NULL,
  "cxc_id"      UUID           NOT NULL,
  "cuenta_id"   UUID           NOT NULL,
  "folio"       VARCHAR(60)    NOT NULL,
  "monto"       DECIMAL(18, 2) NOT NULL,
  "fecha_cobro" TIMESTAMP(3)   NOT NULL,
  "usuario_id"  UUID           NOT NULL,
  "created_at"  TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "cobros_cxc_pkey" PRIMARY KEY ("id_cobro")
);

CREATE UNIQUE INDEX IF NOT EXISTS "uq_cxc_origen" ON "cuentas_por_cobrar" ("tenant_id", "origen", "origen_id");
CREATE INDEX IF NOT EXISTS "cuentas_por_cobrar_tenant_proyecto_estado_idx" ON "cuentas_por_cobrar" ("tenant_id", "proyecto_id", "estado");
CREATE UNIQUE INDEX IF NOT EXISTS "uq_cobros_cxc_folio" ON "cobros_cxc" ("tenant_id", "folio");
CREATE INDEX IF NOT EXISTS "cobros_cxc_tenant_cxc_idx" ON "cobros_cxc" ("tenant_id", "cxc_id");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint c JOIN pg_namespace n ON n.oid = c.connamespace
                  WHERE c.conname = 'cobros_cxc_cxc_id_fkey' AND n.nspname = current_schema()) THEN
    ALTER TABLE "cobros_cxc" ADD CONSTRAINT "cobros_cxc_cxc_id_fkey"
      FOREIGN KEY ("cxc_id") REFERENCES "cuentas_por_cobrar"("id_cxc") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint c JOIN pg_namespace n ON n.oid = c.connamespace
                  WHERE c.conname = 'ck_cxc_montos' AND n.nspname = current_schema()) THEN
    ALTER TABLE "cuentas_por_cobrar" ADD CONSTRAINT "ck_cxc_montos"
      CHECK ("monto" > 0 AND "cobrado" >= 0 AND "cobrado" <= "monto");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint c JOIN pg_namespace n ON n.oid = c.connamespace
                  WHERE c.conname = 'ck_cxc_estado' AND n.nspname = current_schema()) THEN
    ALTER TABLE "cuentas_por_cobrar" ADD CONSTRAINT "ck_cxc_estado"
      CHECK ("estado" IN ('POR_COBRAR', 'COBRO_PARCIAL', 'COBRADA', 'CANCELADA'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint c JOIN pg_namespace n ON n.oid = c.connamespace
                  WHERE c.conname = 'ck_cxc_origen' AND n.nspname = current_schema()) THEN
    ALTER TABLE "cuentas_por_cobrar" ADD CONSTRAINT "ck_cxc_origen" CHECK ("origen" IN ('ESTIMACION'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint c JOIN pg_namespace n ON n.oid = c.connamespace
                  WHERE c.conname = 'ck_cobros_cxc_monto' AND n.nspname = current_schema()) THEN
    ALTER TABLE "cobros_cxc" ADD CONSTRAINT "ck_cobros_cxc_monto" CHECK ("monto" > 0);
  END IF;
END $$;

ALTER TABLE "cuentas_por_cobrar" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cuentas_por_cobrar" FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS rls_cxc_select ON "cuentas_por_cobrar";
CREATE POLICY rls_cxc_select ON "cuentas_por_cobrar"
    FOR SELECT USING (
        tenant_id = current_tenant_id()
        AND (current_proyecto_id() IS NULL OR proyecto_id = current_proyecto_id())
    );

DROP POLICY IF EXISTS rls_cxc_insert ON "cuentas_por_cobrar";
CREATE POLICY rls_cxc_insert ON "cuentas_por_cobrar"
    FOR INSERT WITH CHECK (
        tenant_id = current_tenant_id()
        AND proyecto_id = current_proyecto_id()
    );

DROP POLICY IF EXISTS rls_cxc_update ON "cuentas_por_cobrar";
CREATE POLICY rls_cxc_update ON "cuentas_por_cobrar"
    FOR UPDATE USING (
        tenant_id = current_tenant_id()
        AND proyecto_id = current_proyecto_id()
    ) WITH CHECK (
        tenant_id = current_tenant_id()
        AND proyecto_id = current_proyecto_id()
    );

ALTER TABLE "cobros_cxc" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cobros_cxc" FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS rls_cobros_cxc_select ON "cobros_cxc";
CREATE POLICY rls_cobros_cxc_select ON "cobros_cxc"
    FOR SELECT USING (
        tenant_id = current_tenant_id()
        AND (current_proyecto_id() IS NULL OR proyecto_id = current_proyecto_id())
    );

DROP POLICY IF EXISTS rls_cobros_cxc_insert ON "cobros_cxc";
CREATE POLICY rls_cobros_cxc_insert ON "cobros_cxc"
    FOR INSERT WITH CHECK (
        tenant_id = current_tenant_id()
        AND proyecto_id = current_proyecto_id()
    );

COMMIT;
