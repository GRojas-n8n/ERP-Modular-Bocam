-- AlterTable
ALTER TABLE "avances_fisicos" ADD COLUMN     "concepto_id" UUID;

-- CreateIndex
CREATE INDEX "avances_fisicos_tenant_id_proyecto_id_concepto_id_idx" ON "avances_fisicos"("tenant_id", "proyecto_id", "concepto_id");
