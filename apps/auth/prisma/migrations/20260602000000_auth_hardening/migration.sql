-- Migration: auth_hardening
-- Creates master_audit_logs table for tracking all cross-tenant master operations.
-- No tenant_id, no RLS — this is a system-level table.

CREATE TABLE IF NOT EXISTS "master_audit_logs" (
    "id"          UUID        NOT NULL DEFAULT gen_random_uuid(),
    "accion"      VARCHAR(50) NOT NULL,
    "entity_type" VARCHAR(30) NOT NULL,
    "entity_id"   UUID,
    "ip_address"  VARCHAR(50),
    "user_agent"  VARCHAR(500),
    "payload"     JSONB,
    "status_code" INTEGER     NOT NULL,
    "error_msg"   TEXT,
    "created_at"  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT "master_audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "master_audit_logs_created_at_idx" ON "master_audit_logs"("created_at");
CREATE INDEX IF NOT EXISTS "master_audit_logs_entity_id_idx"  ON "master_audit_logs"("entity_id");
