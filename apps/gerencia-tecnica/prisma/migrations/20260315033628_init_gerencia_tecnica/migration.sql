-- CreateEnum
CREATE TYPE "TipoInsumo" AS ENUM ('MATERIAL', 'MANO_DE_OBRA', 'EQUIPO', 'SUBCONTRATO', 'INDIRECTO');

-- CreateEnum
CREATE TYPE "EstadoPresupuesto" AS ENUM ('BORRADOR', 'EN_REVISION', 'LIBERADO', 'CONGELADO');

-- CreateTable
CREATE TABLE "insumos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "clave" VARCHAR(50) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "unidad_medida" VARCHAR(20) NOT NULL,
    "tipo_insumo" "TipoInsumo" NOT NULL,
    "costo_base" DECIMAL(12,4) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "insumos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "presupuestos_base" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "estado" "EstadoPresupuesto" NOT NULL DEFAULT 'BORRADOR',
    "importe_total" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "presupuestos_base_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conceptos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "presupuesto_id" UUID NOT NULL,
    "clave" VARCHAR(50) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "unidad_medida" VARCHAR(20) NOT NULL,
    "cantidad" DECIMAL(12,4) NOT NULL,
    "precio_unitario" DECIMAL(12,4) NOT NULL,
    "importe" DECIMAL(15,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "conceptos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_insumo_tenant" ON "insumos"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "insumos_tenant_id_clave_key" ON "insumos"("tenant_id", "clave");

-- CreateIndex
CREATE INDEX "idx_presupuesto_tenant_proyecto" ON "presupuestos_base"("tenant_id", "proyecto_id");

-- CreateIndex
CREATE INDEX "idx_presupuesto_tenant" ON "presupuestos_base"("tenant_id");

-- CreateIndex
CREATE INDEX "idx_concepto_tenant_proyecto" ON "conceptos"("tenant_id", "proyecto_id");

-- CreateIndex
CREATE INDEX "idx_concepto_tenant_presupuesto" ON "conceptos"("tenant_id", "presupuesto_id");

-- AddForeignKey
ALTER TABLE "conceptos" ADD CONSTRAINT "conceptos_presupuesto_id_fkey" FOREIGN KEY ("presupuesto_id") REFERENCES "presupuestos_base"("id") ON DELETE CASCADE ON UPDATE CASCADE;
