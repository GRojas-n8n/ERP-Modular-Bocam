-- CreateTable
CREATE TABLE "activos" (
    "id_activo" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "numero_activo" VARCHAR(20) NOT NULL,
    "clave" VARCHAR(50) NOT NULL,
    "descripcion" VARCHAR(255) NOT NULL,
    "clasificacion" VARCHAR(20) NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'DISPONIBLE',
    "proyecto_id" UUID NOT NULL,
    "ubicacion" VARCHAR(100),
    "asignado_a_empleado_id" UUID,
    "asignado_a_empleado_nombre" VARCHAR(200),
    "fecha_alta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_baja" TIMESTAMP(3),
    "motivo_baja" VARCHAR(255),
    "valor_adquisicion" DECIMAL(18,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activos_pkey" PRIMARY KEY ("id_activo")
);

-- CreateTable
CREATE TABLE "traspasos_activos" (
    "id_traspaso" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "activo_id" UUID NOT NULL,
    "tipo" VARCHAR(20) NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    "proyecto_origen_id" UUID NOT NULL,
    "proyecto_destino_id" UUID,
    "empleado_origen_id" UUID,
    "empleado_origen_nombre" VARCHAR(200),
    "empleado_destino_id" UUID,
    "empleado_destino_nombre" VARCHAR(200),
    "solicitado_por" VARCHAR(200) NOT NULL,
    "solicitado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmado_por" VARCHAR(200),
    "rechazado_por" VARCHAR(200),
    "resuelto_en" TIMESTAMP(3),
    "notas" VARCHAR(500),

    CONSTRAINT "traspasos_activos_pkey" PRIMARY KEY ("id_traspaso")
);

-- CreateIndex
CREATE INDEX "activos_tenant_id_proyecto_id_idx" ON "activos"("tenant_id", "proyecto_id");

-- CreateIndex
CREATE UNIQUE INDEX "activos_tenant_id_numero_activo_key" ON "activos"("tenant_id", "numero_activo");

-- CreateIndex
CREATE INDEX "traspasos_activos_tenant_id_activo_id_idx" ON "traspasos_activos"("tenant_id", "activo_id");

-- CreateIndex
CREATE INDEX "traspasos_activos_tenant_id_proyecto_destino_id_estado_idx" ON "traspasos_activos"("tenant_id", "proyecto_destino_id", "estado");

-- AddForeignKey
ALTER TABLE "traspasos_activos" ADD CONSTRAINT "traspasos_activos_activo_id_fkey" FOREIGN KEY ("activo_id") REFERENCES "activos"("id_activo") ON DELETE CASCADE ON UPDATE CASCADE;

