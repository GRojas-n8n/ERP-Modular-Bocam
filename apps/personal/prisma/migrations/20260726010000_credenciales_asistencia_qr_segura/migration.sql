-- Migration: credenciales-asistencia-qr-segura
-- Adds: CredencialEmpleado (token opaco revocable por empleado),
-- ConfigAsistenciaProyecto (geofencing opcional por proyecto), y
-- registros_asistencia.ultimo_scan_en (cooldown anti-rescaneo).

-- ── registros_asistencia: campo de cooldown ───────────────────────────────
ALTER TABLE "registros_asistencia"
  ADD COLUMN "ultimo_scan_en" TIMESTAMP(3);

-- ── CredencialEmpleado ─────────────────────────────────────────────────────
CREATE TABLE "credenciales_empleado" (
    "id_credencial"     UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"         UUID NOT NULL,
    "empleado_id"       UUID NOT NULL,
    "token"             VARCHAR(64) NOT NULL,
    "activa"            BOOLEAN NOT NULL DEFAULT true,
    "emitida_en"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emitida_por"       UUID NOT NULL,
    "revocada_en"       TIMESTAMP(3),
    "revocada_por"      UUID,
    "motivo_revocacion" VARCHAR(200),
    CONSTRAINT "credenciales_empleado_pkey" PRIMARY KEY ("id_credencial")
);
CREATE UNIQUE INDEX "credenciales_empleado_tenant_token_key" ON "credenciales_empleado"("tenant_id","token");
CREATE INDEX "credenciales_empleado_tenant_empleado_idx" ON "credenciales_empleado"("tenant_id","empleado_id");

ALTER TABLE "credenciales_empleado" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "credenciales_empleado" USING (tenant_id = get_current_tenant_id());

ALTER TABLE "credenciales_empleado" ADD CONSTRAINT "credenciales_empleado_empleado_id_fkey"
    FOREIGN KEY ("empleado_id") REFERENCES "empleados"("id_empleado");

-- ── ConfigAsistenciaProyecto ───────────────────────────────────────────────
CREATE TABLE "config_asistencia_proyecto" (
    "id_config"       UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"       UUID NOT NULL,
    "proyecto_id"     UUID NOT NULL,
    "lat"             DECIMAL(9,6) NOT NULL,
    "lng"             DECIMAL(9,6) NOT NULL,
    "radio_metros"    INTEGER NOT NULL DEFAULT 300,
    "configurado_por" UUID NOT NULL,
    "updated_at"      TIMESTAMP(3) NOT NULL,
    CONSTRAINT "config_asistencia_proyecto_pkey" PRIMARY KEY ("id_config")
);
CREATE UNIQUE INDEX "config_asistencia_proyecto_tenant_proyecto_key" ON "config_asistencia_proyecto"("tenant_id","proyecto_id");

ALTER TABLE "config_asistencia_proyecto" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "config_asistencia_proyecto" USING (tenant_id = get_current_tenant_id());
