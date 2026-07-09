-- CreateTable
CREATE TABLE "comparativas_proveedores_archivos" (
    "id_archivo" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "cuadro_id" UUID NOT NULL,
    "proveedor_id" UUID NOT NULL,
    "pdf_nombre" VARCHAR(255) NOT NULL,
    "pdf_ruta" TEXT NOT NULL,
    "pdf_mime" VARCHAR(100) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comparativas_proveedores_archivos_pkey" PRIMARY KEY ("id_archivo")
);

-- CreateIndex
CREATE INDEX "comparativas_proveedores_archivos_tenant_id_cuadro_id_idx" ON "comparativas_proveedores_archivos"("tenant_id", "cuadro_id");

-- CreateIndex
CREATE UNIQUE INDEX "comparativas_proveedores_archivos_cuadro_id_proveedor_id_key" ON "comparativas_proveedores_archivos"("cuadro_id", "proveedor_id");

-- AddForeignKey
ALTER TABLE "comparativas_proveedores_archivos" ADD CONSTRAINT "comparativas_proveedores_archivos_cuadro_id_fkey" FOREIGN KEY ("cuadro_id") REFERENCES "cuadros_comparativos"("id_cuadro") ON DELETE CASCADE ON UPDATE CASCADE;
