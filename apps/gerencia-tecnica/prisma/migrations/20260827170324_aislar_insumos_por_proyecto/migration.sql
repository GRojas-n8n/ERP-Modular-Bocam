-- DropIndex
DROP INDEX "insumos_tenant_id_clave_key";

-- AlterTable
ALTER TABLE "insumos" ADD COLUMN     "proyecto_id" UUID;

-- CreateIndex
CREATE INDEX "idx_insumo_tenant_proyecto" ON "insumos"("tenant_id", "proyecto_id");

-- CreateIndex
CREATE UNIQUE INDEX "insumos_tenant_id_proyecto_id_clave_key" ON "insumos"("tenant_id", "proyecto_id", "clave");
