-- Permite líneas/detalles del Cuadro Comparativo para ítems de requisición de
-- texto libre (imprevisto, sin insumo_id de catálogo). Aditivo, sin backfill:
-- todas las filas existentes ya tienen insumo_id poblado.

-- AlterTable
ALTER TABLE "comparativas_lineas" ALTER COLUMN "insumo_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "comparativas_detalles"
  ALTER COLUMN "insumo_id" DROP NOT NULL,
  ADD COLUMN "detalle_req_id" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "comparativas_lineas_cuadro_id_detalle_req_id_key" ON "comparativas_lineas"("cuadro_id", "detalle_req_id");
