-- Add new fields to existing tables
ALTER TABLE "empleados" ADD COLUMN "salario_acordado" DECIMAL(10,2);

ALTER TABLE "pre_nominas" ADD COLUMN "requiere_recalculo" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "pre_nomina_detalles" ADD COLUMN "origen_dias" TEXT NOT NULL DEFAULT 'ASISTENCIA';

-- Mark existing calculated pre-nominas as needing recalculation (old incorrect rates)
UPDATE "pre_nominas" SET "requiere_recalculo" = true
WHERE estado IN ('BORRADOR', 'CALCULADA');

-- CreateTable: RegistroAsistencia
CREATE TABLE "registros_asistencia" (
    "id_registro"    UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"      UUID NOT NULL,
    "proyecto_id"    UUID NOT NULL,
    "empleado_id"    UUID NOT NULL,
    "cuadrilla_id"   UUID,
    "fecha"          DATE NOT NULL,
    "estado"         TEXT NOT NULL,
    "tipo_registro"  TEXT NOT NULL DEFAULT 'MANUAL',
    "horas_extra"    DECIMAL(4,1) NOT NULL DEFAULT 0,
    "registrado_por" UUID NOT NULL,
    "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registros_asistencia_pkey" PRIMARY KEY ("id_registro")
);

CREATE UNIQUE INDEX "registros_asistencia_tenant_empleado_fecha_key"
    ON "registros_asistencia"("tenant_id","empleado_id","fecha");
CREATE INDEX "registros_asistencia_tenant_proyecto_fecha_idx"
    ON "registros_asistencia"("tenant_id","proyecto_id","fecha");
CREATE INDEX "registros_asistencia_tenant_empleado_idx"
    ON "registros_asistencia"("tenant_id","empleado_id");

ALTER TABLE "registros_asistencia" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "registros_asistencia"
    USING (tenant_id = get_current_tenant_id());

-- CreateTable: ConfigDeduccionEmpleado
CREATE TABLE "config_deducciones_empleados" (
    "id_config"        UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"        UUID NOT NULL,
    "empleado_id"      UUID NOT NULL,
    "aplica_imss"      BOOLEAN NOT NULL DEFAULT true,
    "aplica_isr"       BOOLEAN NOT NULL DEFAULT true,
    "aplica_infonavit" BOOLEAN NOT NULL DEFAULT false,
    "infonavit_num"    VARCHAR(30),
    "infonavit_monto"  DECIMAL(10,2),
    "updated_at"       TIMESTAMP(3) NOT NULL,

    CONSTRAINT "config_deducciones_empleados_pkey" PRIMARY KEY ("id_config")
);

CREATE UNIQUE INDEX "config_deducciones_empleados_tenant_empleado_key"
    ON "config_deducciones_empleados"("tenant_id","empleado_id");
CREATE INDEX "config_deducciones_empleados_tenant_idx"
    ON "config_deducciones_empleados"("tenant_id");

ALTER TABLE "config_deducciones_empleados" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "config_deducciones_empleados"
    USING (tenant_id = get_current_tenant_id());

-- CreateTable: NominaComplementaria
CREATE TABLE "nominas_complementarias" (
    "id_complemento"    UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"         UUID NOT NULL,
    "proyecto_id"       UUID NOT NULL,
    "prenomina_id"      UUID NOT NULL,
    "codigo"            VARCHAR(30) NOT NULL,
    "periodo_inicio"    DATE NOT NULL,
    "periodo_fin"       DATE NOT NULL,
    "periodo_tipo"      TEXT NOT NULL,
    "total_complemento" DECIMAL(12,2) NOT NULL,
    "estado"            TEXT NOT NULL DEFAULT 'BORRADOR',
    "elaborado_por"     UUID NOT NULL,
    "autorizado_por"    UUID,
    "created_at"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nominas_complementarias_pkey" PRIMARY KEY ("id_complemento")
);

CREATE INDEX "nominas_complementarias_tenant_proyecto_idx"
    ON "nominas_complementarias"("tenant_id","proyecto_id");

ALTER TABLE "nominas_complementarias" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "nominas_complementarias"
    USING (tenant_id = get_current_tenant_id());

-- CreateTable: NominaComplementariaDetalle
CREATE TABLE "nominas_complementarias_detalle" (
    "id_detalle"        UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"         UUID NOT NULL,
    "complemento_id"    UUID NOT NULL,
    "empleado_id"       UUID NOT NULL,
    "dias_trabajados"   DECIMAL(4,1) NOT NULL,
    "salario_acordado"  DECIMAL(10,2) NOT NULL,
    "salario_imss_dia"  DECIMAL(10,2) NOT NULL,
    "complemento_dia"   DECIMAL(10,2) NOT NULL,
    "monto_complemento" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "nominas_complementarias_detalle_pkey" PRIMARY KEY ("id_detalle")
);

CREATE INDEX "nominas_complementarias_detalle_tenant_comp_idx"
    ON "nominas_complementarias_detalle"("tenant_id","complemento_id");

ALTER TABLE "nominas_complementarias_detalle" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "nominas_complementarias_detalle"
    USING (tenant_id = get_current_tenant_id());

ALTER TABLE "nominas_complementarias_detalle"
    ADD CONSTRAINT "nominas_complementarias_detalle_complemento_id_fkey"
    FOREIGN KEY ("complemento_id")
    REFERENCES "nominas_complementarias"("id_complemento") ON DELETE CASCADE ON UPDATE CASCADE;
