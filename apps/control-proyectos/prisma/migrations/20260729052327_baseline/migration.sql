-- CreateTable
CREATE TABLE "programacion_obra" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "concepto_id" UUID NOT NULL,
    "concepto_clave" VARCHAR(100) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha_inicio_plan" DATE NOT NULL,
    "fecha_fin_plan" DATE NOT NULL,
    "curva_programada" JSONB NOT NULL,
    "fecha_inicio_real" DATE,
    "fecha_fin_real" DATE,
    "pct_avance_real" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "cpi" DECIMAL(6,4),
    "spi" DECIMAL(6,4),
    "eac" DECIMAL(18,2),
    "bac" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "programacion_obra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alertas_proyecto" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "concepto_id" UUID,
    "tipo" VARCHAR(50) NOT NULL,
    "severidad" VARCHAR(10) NOT NULL,
    "titulo" VARCHAR(200) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "datos" JSONB NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'ACTIVA',
    "nota_cp" TEXT,
    "resuelta_en" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "alertas_proyecto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proyecciones_cierre" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "fecha_calculo" DATE NOT NULL,
    "bac" DECIMAL(18,2) NOT NULL,
    "pv" DECIMAL(18,2) NOT NULL,
    "ev" DECIMAL(18,2) NOT NULL,
    "ac" DECIMAL(18,2) NOT NULL,
    "cpi" DECIMAL(6,4) NOT NULL,
    "spi" DECIMAL(6,4) NOT NULL,
    "cv" DECIMAL(18,2) NOT NULL,
    "sv" DECIMAL(18,2) NOT NULL,
    "eac" DECIMAL(18,2) NOT NULL,
    "etc" DECIMAL(18,2) NOT NULL,
    "vac" DECIMAL(18,2) NOT NULL,
    "fecha_fin_plan" DATE,
    "fecha_fin_proyectada" DATE,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proyecciones_cierre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bitacoras_obra" (
    "id_bitacora" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "numero_entrada" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "frente_trabajo" VARCHAR(100) NOT NULL,
    "turno" TEXT NOT NULL DEFAULT 'DIURNO',
    "clima" VARCHAR(50),
    "temperatura_c" DECIMAL(4,1),
    "actividades_realizadas" TEXT NOT NULL,
    "personal_en_sitio" INTEGER NOT NULL DEFAULT 0,
    "incidencias" TEXT,
    "material_recibido" TEXT,
    "observaciones" TEXT,
    "residente_id" UUID NOT NULL,
    "residente_nombre" VARCHAR(200) NOT NULL,
    "superintendente_id" UUID,
    "estado" TEXT NOT NULL DEFAULT 'BORRADOR',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bitacoras_obra_pkey" PRIMARY KEY ("id_bitacora")
);

-- CreateTable
CREATE TABLE "avances_fisicos" (
    "id_avance" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "concepto_presupuesto" VARCHAR(100) NOT NULL,
    "descripcion_concepto" VARCHAR(500) NOT NULL,
    "cantidad_presupuestada" DECIMAL(18,4) NOT NULL,
    "cantidad_anterior" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "cantidad_periodo" DECIMAL(18,4) NOT NULL,
    "cantidad_acumulada" DECIMAL(18,4) NOT NULL,
    "unidad" VARCHAR(20) NOT NULL,
    "precio_unitario" DECIMAL(18,4) NOT NULL,
    "importe_periodo" DECIMAL(18,2) NOT NULL,
    "importe_acumulado" DECIMAL(18,2) NOT NULL,
    "porcentaje_avance" DECIMAL(5,2) NOT NULL,
    "periodo_inicio" DATE NOT NULL,
    "periodo_fin" DATE NOT NULL,
    "registrado_por_id" UUID NOT NULL,
    "registrado_por_nombre" VARCHAR(200) NOT NULL,
    "validado_por_id" UUID,
    "validado_por_nombre" VARCHAR(200),
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "estimacion_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avances_fisicos_pkey" PRIMARY KEY ("id_avance")
);

-- CreateTable
CREATE TABLE "materiales_consumidos_obra" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "concepto_id" UUID NOT NULL,
    "movimiento_almacen_id" UUID NOT NULL,
    "insumo_id" UUID NOT NULL,
    "insumo_clave" VARCHAR(50),
    "insumo_nombre" VARCHAR(255),
    "cantidad" DECIMAL(18,4) NOT NULL,
    "unidad" VARCHAR(20) NOT NULL,
    "costo_unitario" DECIMAL(18,2),
    "costo_total" DECIMAL(18,2),
    "fecha" DATE NOT NULL DEFAULT CURRENT_DATE,
    "frente_trabajo" VARCHAR(100),
    "registrado_por" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "materiales_consumidos_obra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estimaciones" (
    "id_estimacion" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "numero_estimacion" INTEGER NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "periodo_inicio" DATE NOT NULL,
    "periodo_fin" DATE NOT NULL,
    "subtotal" DECIMAL(18,2) NOT NULL,
    "retencion_fondo_garantia" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "amortizacion_anticipo" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "iva" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "total_neto" DECIMAL(18,2) NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'BORRADOR',
    "elaborado_por_id" UUID NOT NULL,
    "elaborado_por_nombre" VARCHAR(200) NOT NULL,
    "revisado_por_id" UUID,
    "revisado_por_nombre" VARCHAR(200),
    "aprobado_por_id" UUID,
    "aprobado_por_nombre" VARCHAR(200),
    "fecha_aprobacion" TIMESTAMP(3),
    "notas" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estimaciones_pkey" PRIMARY KEY ("id_estimacion")
);

-- CreateIndex
CREATE INDEX "idx_prog_proyecto" ON "programacion_obra"("tenant_id", "proyecto_id");

-- CreateIndex
CREATE UNIQUE INDEX "programacion_obra_tenant_id_proyecto_id_concepto_id_key" ON "programacion_obra"("tenant_id", "proyecto_id", "concepto_id");

-- CreateIndex
CREATE INDEX "idx_alerta_proyecto_estado" ON "alertas_proyecto"("tenant_id", "proyecto_id", "estado");

-- CreateIndex
CREATE INDEX "idx_alerta_proyecto_tipo" ON "alertas_proyecto"("tenant_id", "proyecto_id", "tipo");

-- CreateIndex
CREATE INDEX "idx_proyeccion_fecha" ON "proyecciones_cierre"("tenant_id", "proyecto_id", "fecha_calculo");

-- CreateIndex
CREATE INDEX "bitacoras_obra_tenant_id_proyecto_id_idx" ON "bitacoras_obra"("tenant_id", "proyecto_id");

-- CreateIndex
CREATE INDEX "bitacoras_obra_tenant_id_proyecto_id_fecha_idx" ON "bitacoras_obra"("tenant_id", "proyecto_id", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "bitacoras_obra_tenant_id_proyecto_id_numero_entrada_key" ON "bitacoras_obra"("tenant_id", "proyecto_id", "numero_entrada");

-- CreateIndex
CREATE INDEX "avances_fisicos_tenant_id_proyecto_id_idx" ON "avances_fisicos"("tenant_id", "proyecto_id");

-- CreateIndex
CREATE INDEX "avances_fisicos_tenant_id_proyecto_id_estado_idx" ON "avances_fisicos"("tenant_id", "proyecto_id", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "materiales_consumidos_obra_movimiento_almacen_id_key" ON "materiales_consumidos_obra"("movimiento_almacen_id");

-- CreateIndex
CREATE INDEX "idx_mat_consumido_concepto" ON "materiales_consumidos_obra"("tenant_id", "proyecto_id", "concepto_id");

-- CreateIndex
CREATE INDEX "estimaciones_tenant_id_proyecto_id_idx" ON "estimaciones"("tenant_id", "proyecto_id");

-- CreateIndex
CREATE INDEX "estimaciones_tenant_id_proyecto_id_estado_idx" ON "estimaciones"("tenant_id", "proyecto_id", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "estimaciones_tenant_id_proyecto_id_numero_estimacion_key" ON "estimaciones"("tenant_id", "proyecto_id", "numero_estimacion");

-- CreateIndex
CREATE UNIQUE INDEX "estimaciones_tenant_id_codigo_key" ON "estimaciones"("tenant_id", "codigo");

-- AddForeignKey
ALTER TABLE "avances_fisicos" ADD CONSTRAINT "avances_fisicos_estimacion_id_fkey" FOREIGN KEY ("estimacion_id") REFERENCES "estimaciones"("id_estimacion") ON DELETE SET NULL ON UPDATE CASCADE;

