-- Migration: libro_bancario
-- Ver openspec/changes/libro-bancario (M6).
-- Un movimiento por cada cambio de saldo de una cuenta bancaria, con tipo, origen, origen_id y saldo antes/después.
-- tesoreria.ts escribe el movimiento en la misma sentencia que el UPDATE de la cuenta (CTE), así que no hay saldo
-- sin movimiento ni movimiento sin saldo. Inmutable por trigger. RLS habilitado y forzado, por tenant (igual que
-- cuentas_bancarias: las cuentas son de la empresa y las comparten los proyectos).
-- El saldo inicial de las cuentas existentes NO se carga aquí: producción migra como bocam_app con RLS forzado y
-- vería 0 cuentas. Se carga con scripts/finanzas/saldo-inicial-libro-bancario.sql (simulación y luego aplicar=1).
-- IDEMPOTENTE: en CI `prisma db push` crea la tabla antes de este SQL.
-- Rollback: rollback.sql (mismo directorio).

BEGIN;

CREATE TABLE IF NOT EXISTS "movimientos_bancarios" (
  "id_movimiento"   UUID           NOT NULL DEFAULT gen_random_uuid(),
  "secuencia"       BIGSERIAL      NOT NULL,
  "tenant_id"       UUID           NOT NULL,
  "cuenta_id"       UUID           NOT NULL,
  "proyecto_id"     UUID,
  "tipo"            VARCHAR(10)    NOT NULL,
  "origen"          VARCHAR(20)    NOT NULL,
  "origen_id"       UUID           NOT NULL,
  "referencia"      VARCHAR(100),
  "motivo"          VARCHAR(500),
  "monto"           DECIMAL(18, 2) NOT NULL,
  "saldo_anterior"  DECIMAL(18, 2) NOT NULL,
  "saldo_posterior" DECIMAL(18, 2) NOT NULL,
  "usuario_id"      UUID,
  "created_at"      TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "movimientos_bancarios_pkey" PRIMARY KEY ("id_movimiento")
);

CREATE UNIQUE INDEX IF NOT EXISTS "uq_movimientos_bancarios_origen" ON "movimientos_bancarios" ("tenant_id", "origen", "origen_id");
CREATE UNIQUE INDEX IF NOT EXISTS "uq_movimientos_bancarios_secuencia" ON "movimientos_bancarios" ("secuencia");
CREATE INDEX IF NOT EXISTS "movimientos_bancarios_cuenta_secuencia_idx" ON "movimientos_bancarios" ("tenant_id", "cuenta_id", "secuencia" DESC);
-- Folio de ajuste único por cuenta: el reintento del mismo ajuste no lo duplica.
CREATE UNIQUE INDEX IF NOT EXISTS "uq_movimientos_bancarios_ajuste_folio" ON "movimientos_bancarios" ("tenant_id", "cuenta_id", "referencia")
  WHERE "origen" = 'AJUSTE';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint c JOIN pg_namespace n ON n.oid = c.connamespace
                  WHERE c.conname = 'movimientos_bancarios_cuenta_id_fkey' AND n.nspname = current_schema()) THEN
    ALTER TABLE "movimientos_bancarios" ADD CONSTRAINT "movimientos_bancarios_cuenta_id_fkey"
      FOREIGN KEY ("cuenta_id") REFERENCES "cuentas_bancarias" ("id_cuenta") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint c JOIN pg_namespace n ON n.oid = c.connamespace
                  WHERE c.conname = 'ck_movimientos_bancarios_monto' AND n.nspname = current_schema()) THEN
    ALTER TABLE "movimientos_bancarios" ADD CONSTRAINT "ck_movimientos_bancarios_monto" CHECK ("monto" > 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint c JOIN pg_namespace n ON n.oid = c.connamespace
                  WHERE c.conname = 'ck_movimientos_bancarios_tipo' AND n.nspname = current_schema()) THEN
    ALTER TABLE "movimientos_bancarios" ADD CONSTRAINT "ck_movimientos_bancarios_tipo" CHECK ("tipo" IN ('CARGO', 'ABONO'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint c JOIN pg_namespace n ON n.oid = c.connamespace
                  WHERE c.conname = 'ck_movimientos_bancarios_origen' AND n.nspname = current_schema()) THEN
    ALTER TABLE "movimientos_bancarios" ADD CONSTRAINT "ck_movimientos_bancarios_origen"
      CHECK ("origen" IN ('SALDO_INICIAL', 'AJUSTE', 'EGRESO_OC', 'PAGO_PROGRAMADO', 'NOMINA', 'COBRO_CXC'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint c JOIN pg_namespace n ON n.oid = c.connamespace
                  WHERE c.conname = 'ck_movimientos_bancarios_saldo' AND n.nspname = current_schema()) THEN
    ALTER TABLE "movimientos_bancarios" ADD CONSTRAINT "ck_movimientos_bancarios_saldo" CHECK (
      "saldo_posterior" = "saldo_anterior" + CASE WHEN "tipo" = 'ABONO' THEN "monto" ELSE -"monto" END);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint c JOIN pg_namespace n ON n.oid = c.connamespace
                  WHERE c.conname = 'ck_movimientos_bancarios_ajuste' AND n.nspname = current_schema()) THEN
    ALTER TABLE "movimientos_bancarios" ADD CONSTRAINT "ck_movimientos_bancarios_ajuste" CHECK (
      "origen" <> 'AJUSTE' OR ("referencia" IS NOT NULL AND "motivo" IS NOT NULL AND length(btrim("motivo")) >= 10));
  END IF;
END $$;

-- Inmutable: una corrección es otro movimiento (AJUSTE), nunca un UPDATE o DELETE.
CREATE OR REPLACE FUNCTION movimientos_bancarios_inmutable() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'movimientos_bancarios es inmutable: registra un ajuste en lugar de % ', TG_OP
    USING ERRCODE = 'restrict_violation';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_movimientos_bancarios_inmutable ON "movimientos_bancarios";
CREATE TRIGGER trg_movimientos_bancarios_inmutable
  BEFORE UPDATE OR DELETE ON "movimientos_bancarios"
  FOR EACH ROW EXECUTE FUNCTION movimientos_bancarios_inmutable();

ALTER TABLE "movimientos_bancarios" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "movimientos_bancarios" FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS rls_movimientos_bancarios_select ON "movimientos_bancarios";
CREATE POLICY rls_movimientos_bancarios_select ON "movimientos_bancarios"
    FOR SELECT USING (tenant_id = current_tenant_id());

DROP POLICY IF EXISTS rls_movimientos_bancarios_insert ON "movimientos_bancarios";
CREATE POLICY rls_movimientos_bancarios_insert ON "movimientos_bancarios"
    FOR INSERT WITH CHECK (tenant_id = current_tenant_id());

COMMIT;
