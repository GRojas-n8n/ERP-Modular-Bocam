-- CreateTable: Empleado (initial schema + salario_acordado)
CREATE TABLE "empleados" (
    "id_empleado"          UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"            UUID NOT NULL,
    "numero_empleado"      VARCHAR(20) NOT NULL,
    "nombre"               VARCHAR(150) NOT NULL,
    "apellido_paterno"     VARCHAR(100) NOT NULL,
    "apellido_materno"     VARCHAR(100),
    "rfc"                  VARCHAR(13) NOT NULL,
    "curp"                 VARCHAR(18),
    "nss"                  VARCHAR(11),
    "puesto"               VARCHAR(100) NOT NULL,
    "categoria"            TEXT NOT NULL DEFAULT 'OBRERO',
    "tipo_contrato"        TEXT NOT NULL DEFAULT 'PLANTA',
    "fecha_ingreso"        DATE NOT NULL,
    "fecha_baja"           DATE,
    "salario_diario"       DECIMAL(10,2) NOT NULL,
    "salario_integrado"    DECIMAL(10,2),
    "salario_acordado"     DECIMAL(10,2),
    "telefono"             VARCHAR(20),
    "email"                VARCHAR(100),
    "contacto_emergencia"  VARCHAR(200),
    "certificaciones"      TEXT,
    "estado"               TEXT NOT NULL DEFAULT 'ACTIVO',
    "cuadrilla_id"         UUID,
    "created_at"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"           TIMESTAMP(3) NOT NULL,
    CONSTRAINT "empleados_pkey" PRIMARY KEY ("id_empleado")
);
CREATE UNIQUE INDEX "empleados_tenant_numero_key" ON "empleados"("tenant_id","numero_empleado");
CREATE UNIQUE INDEX "empleados_tenant_rfc_key" ON "empleados"("tenant_id","rfc");
CREATE INDEX "empleados_tenant_idx" ON "empleados"("tenant_id");
CREATE INDEX "empleados_tenant_estado_idx" ON "empleados"("tenant_id","estado");

ALTER TABLE "empleados" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "empleados" USING (tenant_id = get_current_tenant_id());

-- CreateTable: Cuadrilla
CREATE TABLE "cuadrillas" (
    "id_cuadrilla"   UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"      UUID NOT NULL,
    "proyecto_id"    UUID NOT NULL,
    "nombre"         VARCHAR(100) NOT NULL,
    "codigo"         VARCHAR(20) NOT NULL,
    "especialidad"   VARCHAR(100) NOT NULL,
    "capataz_id"     UUID,
    "capataz_nombre" VARCHAR(200),
    "estado"         TEXT NOT NULL DEFAULT 'ACTIVA',
    "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"     TIMESTAMP(3) NOT NULL,
    CONSTRAINT "cuadrillas_pkey" PRIMARY KEY ("id_cuadrilla")
);
CREATE UNIQUE INDEX "cuadrillas_tenant_proyecto_codigo_key" ON "cuadrillas"("tenant_id","proyecto_id","codigo");
CREATE INDEX "cuadrillas_tenant_proyecto_idx" ON "cuadrillas"("tenant_id","proyecto_id");

ALTER TABLE "cuadrillas" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "cuadrillas" USING (tenant_id = get_current_tenant_id());

-- FK empleados -> cuadrillas
ALTER TABLE "empleados" ADD CONSTRAINT "empleados_cuadrilla_id_fkey"
    FOREIGN KEY ("cuadrilla_id") REFERENCES "cuadrillas"("id_cuadrilla") ON DELETE SET NULL;

-- CreateTable: AsignacionFrente
CREATE TABLE "asignaciones_frente" (
    "id_asignacion"  UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"      UUID NOT NULL,
    "proyecto_id"    UUID NOT NULL,
    "empleado_id"    UUID NOT NULL,
    "cuadrilla_id"   UUID,
    "frente_trabajo" VARCHAR(100) NOT NULL,
    "turno"          TEXT NOT NULL DEFAULT 'DIURNO',
    "fecha_inicio"   DATE NOT NULL,
    "fecha_fin"      DATE,
    "horas_diarias"  DECIMAL(4,2) NOT NULL DEFAULT 8,
    "estado"         TEXT NOT NULL DEFAULT 'ACTIVA',
    "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "asignaciones_frente_pkey" PRIMARY KEY ("id_asignacion")
);
CREATE INDEX "asignaciones_frente_tenant_proyecto_idx" ON "asignaciones_frente"("tenant_id","proyecto_id");
CREATE INDEX "asignaciones_frente_frente_idx" ON "asignaciones_frente"("tenant_id","proyecto_id","frente_trabajo");

ALTER TABLE "asignaciones_frente" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "asignaciones_frente" USING (tenant_id = get_current_tenant_id());

ALTER TABLE "asignaciones_frente" ADD CONSTRAINT "asignaciones_frente_empleado_id_fkey"
    FOREIGN KEY ("empleado_id") REFERENCES "empleados"("id_empleado");
ALTER TABLE "asignaciones_frente" ADD CONSTRAINT "asignaciones_frente_cuadrilla_id_fkey"
    FOREIGN KEY ("cuadrilla_id") REFERENCES "cuadrillas"("id_cuadrilla");

-- CreateTable: PreNomina (+ requiere_recalculo)
CREATE TABLE "pre_nominas" (
    "id_prenomina"       UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"          UUID NOT NULL,
    "proyecto_id"        UUID NOT NULL,
    "codigo"             VARCHAR(50) NOT NULL,
    "periodo_tipo"       TEXT NOT NULL DEFAULT 'SEMANAL',
    "periodo_inicio"     DATE NOT NULL,
    "periodo_fin"        DATE NOT NULL,
    "total_percepciones" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "total_deducciones"  DECIMAL(18,2) NOT NULL DEFAULT 0,
    "total_neto"         DECIMAL(18,2) NOT NULL DEFAULT 0,
    "total_empleados"    INTEGER NOT NULL DEFAULT 0,
    "estado"             TEXT NOT NULL DEFAULT 'BORRADOR',
    "requiere_recalculo" BOOLEAN NOT NULL DEFAULT false,
    "elaborado_por"      UUID NOT NULL,
    "autorizado_por"     UUID,
    "fecha_autorizacion" TIMESTAMP(3),
    "notas"              TEXT,
    "created_at"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"         TIMESTAMP(3) NOT NULL,
    CONSTRAINT "pre_nominas_pkey" PRIMARY KEY ("id_prenomina")
);
CREATE UNIQUE INDEX "pre_nominas_tenant_codigo_key" ON "pre_nominas"("tenant_id","codigo");
CREATE INDEX "pre_nominas_tenant_proyecto_idx" ON "pre_nominas"("tenant_id","proyecto_id");

ALTER TABLE "pre_nominas" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "pre_nominas" USING (tenant_id = get_current_tenant_id());

-- CreateTable: PreNominaDetalle (+ origen_dias)
CREATE TABLE "pre_nomina_detalles" (
    "id_detalle"         UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"          UUID NOT NULL,
    "proyecto_id"        UUID NOT NULL,
    "prenomina_id"       UUID NOT NULL,
    "empleado_id"        UUID NOT NULL,
    "origen_dias"        TEXT NOT NULL DEFAULT 'ASISTENCIA',
    "dias_trabajados"    DECIMAL(4,1) NOT NULL,
    "horas_extra"        DECIMAL(6,2) NOT NULL DEFAULT 0,
    "salario_base"       DECIMAL(10,2) NOT NULL,
    "monto_horas_extra"  DECIMAL(10,2) NOT NULL DEFAULT 0,
    "bonos"              DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_percepciones" DECIMAL(10,2) NOT NULL,
    "deduccion_imss"     DECIMAL(10,2) NOT NULL DEFAULT 0,
    "deduccion_isr"      DECIMAL(10,2) NOT NULL DEFAULT 0,
    "otras_deducciones"  DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_deducciones"  DECIMAL(10,2) NOT NULL DEFAULT 0,
    "neto_a_pagar"       DECIMAL(10,2) NOT NULL,
    CONSTRAINT "pre_nomina_detalles_pkey" PRIMARY KEY ("id_detalle")
);
CREATE INDEX "pre_nomina_detalles_tenant_prenomina_idx" ON "pre_nomina_detalles"("tenant_id","prenomina_id");

ALTER TABLE "pre_nomina_detalles" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "pre_nomina_detalles" USING (tenant_id = get_current_tenant_id());

ALTER TABLE "pre_nomina_detalles" ADD CONSTRAINT "pre_nomina_detalles_prenomina_id_fkey"
    FOREIGN KEY ("prenomina_id") REFERENCES "pre_nominas"("id_prenomina") ON DELETE CASCADE;
ALTER TABLE "pre_nomina_detalles" ADD CONSTRAINT "pre_nomina_detalles_empleado_id_fkey"
    FOREIGN KEY ("empleado_id") REFERENCES "empleados"("id_empleado");

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
CREATE UNIQUE INDEX "registros_asistencia_tenant_empleado_fecha_key" ON "registros_asistencia"("tenant_id","empleado_id","fecha");
CREATE INDEX "registros_asistencia_tenant_proyecto_fecha_idx" ON "registros_asistencia"("tenant_id","proyecto_id","fecha");
CREATE INDEX "registros_asistencia_tenant_empleado_idx" ON "registros_asistencia"("tenant_id","empleado_id");

ALTER TABLE "registros_asistencia" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "registros_asistencia" USING (tenant_id = get_current_tenant_id());

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
CREATE UNIQUE INDEX "config_deducciones_empleados_tenant_empleado_key" ON "config_deducciones_empleados"("tenant_id","empleado_id");
CREATE INDEX "config_deducciones_empleados_tenant_idx" ON "config_deducciones_empleados"("tenant_id");

ALTER TABLE "config_deducciones_empleados" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "config_deducciones_empleados" USING (tenant_id = get_current_tenant_id());

-- CreateTable: NominaComplementaria + Detalle
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
CREATE INDEX "nominas_complementarias_tenant_proyecto_idx" ON "nominas_complementarias"("tenant_id","proyecto_id");

ALTER TABLE "nominas_complementarias" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "nominas_complementarias" USING (tenant_id = get_current_tenant_id());

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
CREATE INDEX "nominas_complementarias_detalle_tenant_comp_idx" ON "nominas_complementarias_detalle"("tenant_id","complemento_id");

ALTER TABLE "nominas_complementarias_detalle" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "nominas_complementarias_detalle" USING (tenant_id = get_current_tenant_id());

ALTER TABLE "nominas_complementarias_detalle" ADD CONSTRAINT "nominas_complementarias_detalle_complemento_id_fkey"
    FOREIGN KEY ("complemento_id") REFERENCES "nominas_complementarias"("id_complemento") ON DELETE CASCADE;

-- Pases de Acceso (tabla existente en el módulo personal)
CREATE TABLE "pases_acceso" (
    "id_pase"               UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"             UUID NOT NULL,
    "proyecto_id"           UUID NOT NULL,
    "empleado_id"           UUID NOT NULL,
    "numero_pase"           VARCHAR(30) NOT NULL,
    "empleado_nombre"       VARCHAR(300),
    "tipo_acceso"           TEXT NOT NULL DEFAULT 'GENERAL',
    "fecha_emision"         DATE NOT NULL,
    "fecha_vencimiento"     DATE NOT NULL,
    "estado"                TEXT NOT NULL DEFAULT 'ACTIVO',
    "areas_autorizadas"     TEXT,
    "created_at"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pases_acceso_pkey" PRIMARY KEY ("id_pase")
);
CREATE UNIQUE INDEX "pases_acceso_tenant_numero_key" ON "pases_acceso"("tenant_id","numero_pase");
CREATE INDEX "pases_acceso_tenant_proyecto_idx" ON "pases_acceso"("tenant_id","proyecto_id");

ALTER TABLE "pases_acceso" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "pases_acceso" USING (tenant_id = get_current_tenant_id());
