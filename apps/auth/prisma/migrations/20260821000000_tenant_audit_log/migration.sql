-- Migration: tenant_audit_log
-- Ver openspec/changes/auditoria-acciones-tenant.
-- Bitacora de acciones de negocio por tenant (quien hizo que, cuando),
-- proyeccion derivada de eventos ya publicados a bocam.events por
-- compras/finanzas. Tiene tenant_id (a diferencia de master_audit_logs) y
-- se protege con RLS via apps/auth/prisma/rls-policies.sql (aplicado por
-- separado, no en esta migracion — ver ese archivo).

CREATE TABLE IF NOT EXISTS "tenant_audit_logs" (
    "id"             UUID         NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"      UUID         NOT NULL,
    "proyecto_id"    UUID         NOT NULL,
    "actor_user_id"  UUID         NOT NULL,
    "event_type"     VARCHAR(100) NOT NULL,
    "entity_id"      UUID,
    "payload"        JSONB,
    "correlation_id" VARCHAR(100),
    "created_at"     TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT "tenant_audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "tenant_audit_logs_tenant_id_created_at_idx"
  ON "tenant_audit_logs"("tenant_id", "created_at");
