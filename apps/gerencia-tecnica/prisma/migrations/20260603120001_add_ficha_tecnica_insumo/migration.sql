-- CreateTable
CREATE TABLE "fichas_tecnicas_insumo" (
    "id_ficha" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "insumo_id" UUID NOT NULL,
    "proveedor_ref" VARCHAR(100),
    "nombre_doc" VARCHAR(255) NOT NULL,
    "ruta_archivo" TEXT NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "tamano_bytes" INTEGER NOT NULL,
    "subido_por" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fichas_tecnicas_insumo_pkey" PRIMARY KEY ("id_ficha")
);

-- CreateIndex
CREATE INDEX "fichas_tecnicas_insumo_tenant_id_insumo_id_idx" ON "fichas_tecnicas_insumo"("tenant_id", "insumo_id");
