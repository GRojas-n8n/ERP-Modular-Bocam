-- CreateTable
CREATE TABLE "comparativas_lineas" (
    "id_linea" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "cuadro_id" UUID NOT NULL,
    "insumo_id" UUID NOT NULL,
    "marca_modelo_ref" VARCHAR(100),
    "especificaciones_requeridas" TEXT,

    CONSTRAINT "comparativas_lineas_pkey" PRIMARY KEY ("id_linea")
);

-- CreateIndex
CREATE UNIQUE INDEX "comparativas_lineas_cuadro_id_insumo_id_key" ON "comparativas_lineas"("cuadro_id", "insumo_id");

-- CreateIndex
CREATE INDEX "comparativas_lineas_tenant_id_cuadro_id_idx" ON "comparativas_lineas"("tenant_id", "cuadro_id");

-- AddForeignKey
ALTER TABLE "comparativas_lineas" ADD CONSTRAINT "comparativas_lineas_cuadro_id_fkey" FOREIGN KEY ("cuadro_id") REFERENCES "cuadros_comparativos"("id_cuadro") ON DELETE CASCADE ON UPDATE CASCADE;
