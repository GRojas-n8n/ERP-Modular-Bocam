-- Migration: nominas_por_pagar
-- Ver openspec/changes/nomina-pagada-por-finanzas (M9).
-- Proyección de personal.nomina_autorizada. Finanzas la paga desde una cuenta bancaria y publica
-- finanzas.nomina_pagada; Personal marca la prenómina PAGADA. CHECK de monto y estado; un pago con referencia exige
-- cuenta. RLS habilitado y forzado, Patrón Global con Trazabilidad (igual que ocs_por_pagar).
-- IDEMPOTENTE: en CI `prisma db push` crea la tabla antes de este SQL.
-- Rollback: rollback.sql (mismo directorio).

BEGIN;

CREATE TABLE IF NOT EXISTS "nominas_por_pagar" (
  "tenant_id"           UUID           NOT NULL,
  "prenomina_id"        UUID           NOT NULL,
  "proyecto_id"         UUID           NOT NULL,
  "codigo"              VARCHAR(60)    NOT NULL,
  "periodo_inicio"      TIMESTAMP(3),
  "periodo_fin"         TIMESTAMP(3),
  "total_neto"          DECIMAL(18, 2) NOT NULL,
  "total_empleados"     INTEGER        NOT NULL DEFAULT 0,
  "estado"              VARCHAR(20)    NOT NULL DEFAULT 'POR_PAGAR',
  "cuenta_id"           UUID,
  "referencia"          VARCHAR(100),
  "fecha_pago"          TIMESTAMP(3),
  "pagado_por"          UUID,
  "efecto_presupuestal" VARCHAR(20),
  "created_at"          TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"          TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "nominas_por_pagar_pkey" PRIMARY KEY ("tenant_id", "prenomina_id")
);

CREATE INDEX IF NOT EXISTS "nominas_por_pagar_tenant_proyecto_estado_idx" ON "nominas_por_pagar" ("tenant_id", "proyecto_id", "estado");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint c JOIN pg_namespace n ON n.oid = c.connamespace
                  WHERE c.conname = 'ck_nominas_por_pagar_monto' AND n.nspname = current_schema()) THEN
    ALTER TABLE "nominas_por_pagar" ADD CONSTRAINT "ck_nominas_por_pagar_monto" CHECK ("total_neto" > 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint c JOIN pg_namespace n ON n.oid = c.connamespace
                  WHERE c.conname = 'ck_nominas_por_pagar_estado' AND n.nspname = current_schema()) THEN
    ALTER TABLE "nominas_por_pagar" ADD CONSTRAINT "ck_nominas_por_pagar_estado"
      CHECK ("estado" IN ('POR_PAGAR', 'PAGADA', 'CANCELADA'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint c JOIN pg_namespace n ON n.oid = c.connamespace
                  WHERE c.conname = 'ck_nominas_por_pagar_pagada' AND n.nspname = current_schema()) THEN
    ALTER TABLE "nominas_por_pagar" ADD CONSTRAINT "ck_nominas_por_pagar_pagada"
      CHECK ("estado" <> 'PAGADA' OR ("cuenta_id" IS NOT NULL AND "referencia" IS NOT NULL AND "fecha_pago" IS NOT NULL));
  END IF;
END $$;

ALTER TABLE "nominas_por_pagar" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "nominas_por_pagar" FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS rls_nominas_por_pagar_select ON "nominas_por_pagar";
CREATE POLICY rls_nominas_por_pagar_select ON "nominas_por_pagar"
    FOR SELECT USING (
        tenant_id = current_tenant_id()
        AND (current_proyecto_id() IS NULL OR proyecto_id = current_proyecto_id())
    );

DROP POLICY IF EXISTS rls_nominas_por_pagar_insert ON "nominas_por_pagar";
CREATE POLICY rls_nominas_por_pagar_insert ON "nominas_por_pagar"
    FOR INSERT WITH CHECK (
        tenant_id = current_tenant_id()
        AND proyecto_id = current_proyecto_id()
    );

DROP POLICY IF EXISTS rls_nominas_por_pagar_update ON "nominas_por_pagar";
CREATE POLICY rls_nominas_por_pagar_update ON "nominas_por_pagar"
    FOR UPDATE USING (
        tenant_id = current_tenant_id()
        AND proyecto_id = current_proyecto_id()
    ) WITH CHECK (
        tenant_id = current_tenant_id()
        AND proyecto_id = current_proyecto_id()
    );

COMMIT;
