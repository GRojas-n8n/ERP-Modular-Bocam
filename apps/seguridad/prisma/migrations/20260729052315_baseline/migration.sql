-- CreateTable
CREATE TABLE "incidentes" (
    "id_incidente" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "codigo" VARCHAR(30) NOT NULL,
    "tipo" VARCHAR(30) NOT NULL,
    "severidad" TEXT NOT NULL DEFAULT 'MEDIA',
    "fecha_incidente" TIMESTAMPTZ(3) NOT NULL,
    "hora_incidente" VARCHAR(5),
    "ubicacion" VARCHAR(200) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "empleado_afectado_id" UUID,
    "empleado_afectado_nombre" VARCHAR(200),
    "testigos" TEXT,
    "causa_raiz" TEXT,
    "accion_correctiva" TEXT,
    "accion_preventiva" TEXT,
    "dias_incapacidad" INTEGER NOT NULL DEFAULT 0,
    "requirio_atencion_medica" BOOLEAN NOT NULL DEFAULT false,
    "reportado_stps" BOOLEAN NOT NULL DEFAULT false,
    "estado" TEXT NOT NULL DEFAULT 'ABIERTO',
    "reportado_por" UUID NOT NULL,
    "cerrado_por" UUID,
    "fecha_cierre" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incidentes_pkey" PRIMARY KEY ("id_incidente")
);

-- CreateTable
CREATE TABLE "inspecciones_seguridad" (
    "id_inspeccion" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "codigo" VARCHAR(30) NOT NULL,
    "tipo_inspeccion" VARCHAR(100) NOT NULL,
    "fecha_inspeccion" DATE NOT NULL,
    "area_inspeccionada" VARCHAR(200) NOT NULL,
    "items_revisados" INTEGER NOT NULL DEFAULT 0,
    "items_conformes" INTEGER NOT NULL DEFAULT 0,
    "items_no_conformes" INTEGER NOT NULL DEFAULT 0,
    "porcentaje_cumplimiento" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "resultado" TEXT NOT NULL DEFAULT 'OBSERVACIONES',
    "observaciones" TEXT,
    "hallazgos" TEXT,
    "evidencia_fotos" TEXT,
    "inspector_id" UUID NOT NULL,
    "inspector_nombre" VARCHAR(200) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inspecciones_seguridad_pkey" PRIMARY KEY ("id_inspeccion")
);

-- CreateTable
CREATE TABLE "permisos_trabajo" (
    "id_permiso" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "codigo" VARCHAR(30) NOT NULL,
    "tipo_permiso" VARCHAR(30) NOT NULL,
    "area_trabajo" VARCHAR(200) NOT NULL,
    "descripcion_trabajo" TEXT NOT NULL,
    "fecha_inicio" TIMESTAMPTZ(3) NOT NULL,
    "fecha_fin" TIMESTAMPTZ(3) NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'VIGENTE',
    "epp_requerido" TEXT,
    "medidas_control" TEXT,
    "checklist_previo" BOOLEAN NOT NULL DEFAULT false,
    "solicitado_por" UUID NOT NULL,
    "solicitante_nombre" VARCHAR(200) NOT NULL,
    "autorizado_por" UUID,
    "autorizador_nombre" VARCHAR(200),
    "trabajadores" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permisos_trabajo_pkey" PRIMARY KEY ("id_permiso")
);

-- CreateTable
CREATE TABLE "capacitaciones" (
    "id_capacitacion" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "codigo" VARCHAR(30) NOT NULL,
    "titulo" VARCHAR(200) NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "instructor" VARCHAR(200) NOT NULL,
    "fecha" DATE NOT NULL,
    "duracion_horas" DECIMAL(4,1) NOT NULL,
    "ubicacion" VARCHAR(200),
    "contenido" TEXT,
    "validez_meses" INTEGER,
    "estado" TEXT NOT NULL DEFAULT 'PROGRAMADA',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "capacitaciones_pkey" PRIMARY KEY ("id_capacitacion")
);

-- CreateTable
CREATE TABLE "registros_capacitacion" (
    "id_registro" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "capacitacion_id" UUID NOT NULL,
    "empleado_id" UUID NOT NULL,
    "empleado_nombre" VARCHAR(200) NOT NULL,
    "asistio" BOOLEAN NOT NULL DEFAULT true,
    "calificacion" DECIMAL(5,2),
    "aprobado" BOOLEAN NOT NULL DEFAULT true,
    "observaciones" TEXT,

    CONSTRAINT "registros_capacitacion_pkey" PRIMARY KEY ("id_registro")
);

-- CreateTable
CREATE TABLE "epp_registros" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "empleado_id" UUID NOT NULL,
    "empleado_nombre" VARCHAR(150) NOT NULL,
    "tipo_epp" VARCHAR(100) NOT NULL,
    "descripcion" VARCHAR(255),
    "talla" VARCHAR(20),
    "fecha_entrega" TIMESTAMP(3) NOT NULL,
    "fecha_vencimiento" TIMESTAMP(3),
    "estado" VARCHAR(30) NOT NULL,
    "observaciones" TEXT,
    "entregado_por" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "epp_registros_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "incidentes_tenant_id_proyecto_id_idx" ON "incidentes"("tenant_id", "proyecto_id");

-- CreateIndex
CREATE INDEX "incidentes_tenant_id_proyecto_id_tipo_idx" ON "incidentes"("tenant_id", "proyecto_id", "tipo");

-- CreateIndex
CREATE INDEX "incidentes_tenant_id_proyecto_id_severidad_idx" ON "incidentes"("tenant_id", "proyecto_id", "severidad");

-- CreateIndex
CREATE UNIQUE INDEX "incidentes_tenant_id_codigo_key" ON "incidentes"("tenant_id", "codigo");

-- CreateIndex
CREATE INDEX "inspecciones_seguridad_tenant_id_proyecto_id_idx" ON "inspecciones_seguridad"("tenant_id", "proyecto_id");

-- CreateIndex
CREATE INDEX "inspecciones_seguridad_tenant_id_proyecto_id_resultado_idx" ON "inspecciones_seguridad"("tenant_id", "proyecto_id", "resultado");

-- CreateIndex
CREATE UNIQUE INDEX "inspecciones_seguridad_tenant_id_codigo_key" ON "inspecciones_seguridad"("tenant_id", "codigo");

-- CreateIndex
CREATE INDEX "permisos_trabajo_tenant_id_proyecto_id_idx" ON "permisos_trabajo"("tenant_id", "proyecto_id");

-- CreateIndex
CREATE INDEX "permisos_trabajo_tenant_id_proyecto_id_tipo_permiso_idx" ON "permisos_trabajo"("tenant_id", "proyecto_id", "tipo_permiso");

-- CreateIndex
CREATE UNIQUE INDEX "permisos_trabajo_tenant_id_codigo_key" ON "permisos_trabajo"("tenant_id", "codigo");

-- CreateIndex
CREATE INDEX "capacitaciones_tenant_id_proyecto_id_idx" ON "capacitaciones"("tenant_id", "proyecto_id");

-- CreateIndex
CREATE UNIQUE INDEX "capacitaciones_tenant_id_codigo_key" ON "capacitaciones"("tenant_id", "codigo");

-- CreateIndex
CREATE INDEX "registros_capacitacion_tenant_id_capacitacion_id_idx" ON "registros_capacitacion"("tenant_id", "capacitacion_id");

-- CreateIndex
CREATE INDEX "registros_capacitacion_tenant_id_empleado_id_idx" ON "registros_capacitacion"("tenant_id", "empleado_id");

-- CreateIndex
CREATE INDEX "epp_registros_tenant_id_proyecto_id_idx" ON "epp_registros"("tenant_id", "proyecto_id");

-- CreateIndex
CREATE INDEX "epp_registros_tenant_id_empleado_id_idx" ON "epp_registros"("tenant_id", "empleado_id");

-- AddForeignKey
ALTER TABLE "registros_capacitacion" ADD CONSTRAINT "registros_capacitacion_capacitacion_id_fkey" FOREIGN KEY ("capacitacion_id") REFERENCES "capacitaciones"("id_capacitacion") ON DELETE CASCADE ON UPDATE CASCADE;

