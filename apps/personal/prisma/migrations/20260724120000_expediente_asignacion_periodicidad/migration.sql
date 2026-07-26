-- Migration: expediente-asignacion-periodicidad-personal
-- Adds: ConfigNominaProyecto (periodicidad de pago por proyecto),
-- DocumentoEmpleado (expediente digital) y AsignacionResidente
-- (empleado <-> residente(s), historial simple).

-- ── ConfigNominaProyecto ───────────────────────────────────────────────────
CREATE TABLE "config_nomina_proyecto" (
    "id_config"         UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"         UUID NOT NULL,
    "proyecto_id"       UUID NOT NULL,
    "periodicidad_pago" TEXT NOT NULL DEFAULT 'SEMANAL',
    "configurado_por"   UUID NOT NULL,
    "updated_at"        TIMESTAMP(3) NOT NULL,
    CONSTRAINT "config_nomina_proyecto_pkey" PRIMARY KEY ("id_config")
);
CREATE UNIQUE INDEX "config_nomina_proyecto_tenant_proyecto_key" ON "config_nomina_proyecto"("tenant_id","proyecto_id");

ALTER TABLE "config_nomina_proyecto" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "config_nomina_proyecto" USING (tenant_id = get_current_tenant_id());

-- ── DocumentoEmpleado ──────────────────────────────────────────────────────
CREATE TABLE "documentos_empleado" (
    "id_documento"   UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"      UUID NOT NULL,
    "empleado_id"    UUID NOT NULL,
    "tipo_documento" TEXT NOT NULL,
    "nombre_archivo" VARCHAR(255) NOT NULL,
    "ruta_archivo"   VARCHAR(500) NOT NULL,
    "mime_type"      VARCHAR(100) NOT NULL,
    "tamano_bytes"   INTEGER NOT NULL,
    "fecha_vigencia" DATE,
    "subido_por"     UUID NOT NULL,
    "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "documentos_empleado_pkey" PRIMARY KEY ("id_documento")
);
CREATE INDEX "documentos_empleado_tenant_empleado_idx" ON "documentos_empleado"("tenant_id","empleado_id");
CREATE INDEX "documentos_empleado_tenant_vigencia_idx" ON "documentos_empleado"("tenant_id","fecha_vigencia");

ALTER TABLE "documentos_empleado" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "documentos_empleado" USING (tenant_id = get_current_tenant_id());

ALTER TABLE "documentos_empleado" ADD CONSTRAINT "documentos_empleado_empleado_id_fkey"
    FOREIGN KEY ("empleado_id") REFERENCES "empleados"("id_empleado");

-- ── AsignacionResidente ────────────────────────────────────────────────────
CREATE TABLE "asignaciones_residente" (
    "id_asignacion" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"     UUID NOT NULL,
    "empleado_id"   UUID NOT NULL,
    "residente_id"  UUID NOT NULL,
    "fecha_inicio"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_fin"     TIMESTAMP(3),
    "asignado_por"  UUID NOT NULL,
    CONSTRAINT "asignaciones_residente_pkey" PRIMARY KEY ("id_asignacion")
);
CREATE INDEX "asignaciones_residente_tenant_empleado_idx" ON "asignaciones_residente"("tenant_id","empleado_id");
CREATE INDEX "asignaciones_residente_tenant_residente_idx" ON "asignaciones_residente"("tenant_id","residente_id");

ALTER TABLE "asignaciones_residente" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "asignaciones_residente" USING (tenant_id = get_current_tenant_id());

ALTER TABLE "asignaciones_residente" ADD CONSTRAINT "asignaciones_residente_empleado_id_fkey"
    FOREIGN KEY ("empleado_id") REFERENCES "empleados"("id_empleado");
