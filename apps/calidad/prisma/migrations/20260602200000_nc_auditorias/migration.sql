-- Migration: nc_auditorias
-- ISO 9001:2015 § 10.2 (No Conformidades) + § 9.2 (Auditorías Internas)

CREATE TABLE IF NOT EXISTS "no_conformidades" (
  "id_nc"            UUID         NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id"        UUID         NOT NULL,
  "proyecto_id"      UUID,
  "codigo"           VARCHAR(30)  NOT NULL,
  "titulo"           VARCHAR(255) NOT NULL,
  "descripcion"      TEXT,
  "fuente"           VARCHAR(30)  NOT NULL DEFAULT 'INTERNA',
  "estado"           VARCHAR(30)  NOT NULL DEFAULT 'ABIERTA',
  "detectado_por"    UUID         NOT NULL,
  "responsable_id"   UUID         NOT NULL,
  "fecha_deteccion"  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  "fecha_limite"     TIMESTAMPTZ,
  "fecha_cierre"     TIMESTAMPTZ,
  "causa_raiz"       TEXT,
  "created_at"       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  "updated_at"       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT "no_conformidades_pkey" PRIMARY KEY ("id_nc")
);
CREATE UNIQUE INDEX IF NOT EXISTS "no_conformidades_tenant_id_codigo_key" ON "no_conformidades"("tenant_id","codigo");
CREATE INDEX IF NOT EXISTS "idx_nc_tenant"  ON "no_conformidades"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_nc_estado"  ON "no_conformidades"("tenant_id","estado");

CREATE TABLE IF NOT EXISTS "acciones_correctivas" (
  "id_accion"        UUID         NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id"        UUID         NOT NULL,
  "nc_id"            UUID         NOT NULL,
  "descripcion"      TEXT         NOT NULL,
  "responsable_id"   UUID         NOT NULL,
  "fecha_compromiso" TIMESTAMPTZ,
  "estado"           VARCHAR(30)  NOT NULL DEFAULT 'PENDIENTE',
  "evidencia"        TEXT,
  "created_at"       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  "updated_at"       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT "acciones_correctivas_pkey" PRIMARY KEY ("id_accion"),
  CONSTRAINT "acciones_correctivas_nc_id_fkey" FOREIGN KEY ("nc_id") REFERENCES "no_conformidades"("id_nc") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "idx_ac_nc"     ON "acciones_correctivas"("nc_id");
CREATE INDEX IF NOT EXISTS "idx_ac_tenant" ON "acciones_correctivas"("tenant_id");

CREATE TABLE IF NOT EXISTS "auditorias_internas" (
  "id_auditoria"     UUID         NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id"        UUID         NOT NULL,
  "proyecto_id"      UUID,
  "codigo"           VARCHAR(30)  NOT NULL,
  "titulo"           VARCHAR(255) NOT NULL,
  "alcance"          TEXT,
  "criterios"        TEXT,
  "auditor_lider_id" UUID         NOT NULL,
  "fecha_inicio"     TIMESTAMPTZ,
  "fecha_fin"        TIMESTAMPTZ,
  "estado"           VARCHAR(30)  NOT NULL DEFAULT 'PROGRAMADA',
  "observaciones"    TEXT,
  "created_at"       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  "updated_at"       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT "auditorias_internas_pkey" PRIMARY KEY ("id_auditoria")
);
CREATE UNIQUE INDEX IF NOT EXISTS "auditorias_internas_tenant_id_codigo_key" ON "auditorias_internas"("tenant_id","codigo");
CREATE INDEX IF NOT EXISTS "idx_aud_tenant" ON "auditorias_internas"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_aud_estado" ON "auditorias_internas"("tenant_id","estado");

CREATE TABLE IF NOT EXISTS "hallazgos_auditoria" (
  "id_hallazgo"      UUID         NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id"        UUID         NOT NULL,
  "auditoria_id"     UUID         NOT NULL,
  "descripcion"      TEXT         NOT NULL,
  "tipo"             VARCHAR(20)  NOT NULL DEFAULT 'MENOR',
  "proceso_afectado" VARCHAR(100),
  "evidencia"        TEXT,
  "accion_requerida" TEXT,
  "estado"           VARCHAR(30)  NOT NULL DEFAULT 'ABIERTO',
  "created_at"       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT "hallazgos_auditoria_pkey" PRIMARY KEY ("id_hallazgo"),
  CONSTRAINT "hallazgos_auditoria_auditoria_id_fkey" FOREIGN KEY ("auditoria_id") REFERENCES "auditorias_internas"("id_auditoria") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "idx_hall_auditoria" ON "hallazgos_auditoria"("auditoria_id");
CREATE INDEX IF NOT EXISTS "idx_hall_tenant"    ON "hallazgos_auditoria"("tenant_id");
