-- AlterTable
ALTER TABLE "programacion_obra" ADD COLUMN     "ac_comprometido" DECIMAL(18,2) NOT NULL DEFAULT 0,
ADD COLUMN     "ac_ejercido" DECIMAL(18,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ordenes_compra_seguimiento" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "oc_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "concepto_id" UUID NOT NULL,
    "monto_comprometido" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "monto_ejercido" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ordenes_compra_seguimiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mano_obra_proyecto" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "monto_acumulado" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "mano_obra_proyecto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos_evm_procesados" (
    "id_pago" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "tipo" VARCHAR(20) NOT NULL,
    "monto" DECIMAL(18,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagos_evm_procesados_pkey" PRIMARY KEY ("id_pago")
);

-- CreateIndex
CREATE UNIQUE INDEX "ordenes_compra_seguimiento_oc_id_key" ON "ordenes_compra_seguimiento"("oc_id");

-- CreateIndex
CREATE INDEX "idx_oc_seguimiento_concepto" ON "ordenes_compra_seguimiento"("tenant_id", "proyecto_id", "concepto_id");

-- CreateIndex
CREATE UNIQUE INDEX "mano_obra_proyecto_tenant_id_proyecto_id_key" ON "mano_obra_proyecto"("tenant_id", "proyecto_id");

-- CreateIndex
CREATE INDEX "idx_pago_evm_proyecto" ON "pagos_evm_procesados"("tenant_id", "proyecto_id");
