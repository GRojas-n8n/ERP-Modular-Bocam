-- AlterTable
ALTER TABLE "insumos" ADD COLUMN     "lote_importacion_id" UUID;

-- CreateTable
CREATE TABLE "lotes_importacion" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "importado_por" UUID NOT NULL,
    "cantidad_registros" INTEGER NOT NULL DEFAULT 0,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'activo',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lotes_importacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_lote_importacion_tenant" ON "lotes_importacion"("tenant_id");

-- CreateIndex
CREATE INDEX "idx_insumo_lote_importacion" ON "insumos"("tenant_id", "lote_importacion_id");

-- AddForeignKey
ALTER TABLE "insumos" ADD CONSTRAINT "insumos_lote_importacion_id_fkey" FOREIGN KEY ("lote_importacion_id") REFERENCES "lotes_importacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

