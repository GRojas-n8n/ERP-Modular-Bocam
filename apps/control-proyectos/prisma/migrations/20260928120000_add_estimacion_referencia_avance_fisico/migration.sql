-- AlterTable
ALTER TABLE "avances_fisicos" ADD COLUMN     "estimacion_referencia_id" UUID;

-- CreateIndex
CREATE INDEX "avances_fisicos_est_ref_idx" ON "avances_fisicos"("tenant_id", "proyecto_id", "estimacion_referencia_id");
