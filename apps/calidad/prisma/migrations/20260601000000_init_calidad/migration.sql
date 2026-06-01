-- CreateTable
CREATE TABLE "documentos" (
    "id_documento" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "codigo" VARCHAR(30) NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "tipo" VARCHAR(30) NOT NULL,
    "descripcion" TEXT,
    "proyecto_id" UUID,
    "responsable_id" UUID NOT NULL,
    "estado_actual" TEXT NOT NULL DEFAULT 'BORRADOR',
    "version_actual" VARCHAR(10),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documentos_pkey" PRIMARY KEY ("id_documento")
);

-- CreateTable
CREATE TABLE "versiones_documento" (
    "id_version" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "documento_id" UUID NOT NULL,
    "numero_version" VARCHAR(10) NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'BORRADOR',
    "cambios" TEXT,
    "archivo_nombre" VARCHAR(255),
    "archivo_ruta" VARCHAR(500),
    "archivo_mime" VARCHAR(100),
    "archivo_tamano" INTEGER,
    "creado_por" UUID NOT NULL,
    "revisado_por" UUID,
    "aprobado_por" UUID,
    "fecha_emision" TIMESTAMP(3),
    "fecha_obsoleto" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "versiones_documento_pkey" PRIMARY KEY ("id_version")
);

-- CreateIndex
CREATE UNIQUE INDEX "documentos_tenant_id_codigo_key" ON "documentos"("tenant_id", "codigo");
CREATE INDEX "documentos_tenant_id_idx" ON "documentos"("tenant_id");
CREATE INDEX "documentos_tenant_id_tipo_idx" ON "documentos"("tenant_id", "tipo");
CREATE INDEX "documentos_tenant_id_estado_actual_idx" ON "documentos"("tenant_id", "estado_actual");

-- CreateIndex
CREATE UNIQUE INDEX "versiones_documento_documento_id_numero_version_key" ON "versiones_documento"("documento_id", "numero_version");
CREATE INDEX "versiones_documento_tenant_id_estado_idx" ON "versiones_documento"("tenant_id", "estado");
CREATE INDEX "versiones_documento_documento_id_idx" ON "versiones_documento"("documento_id");

-- AddForeignKey
ALTER TABLE "versiones_documento" ADD CONSTRAINT "versiones_documento_documento_id_fkey"
    FOREIGN KEY ("documento_id") REFERENCES "documentos"("id_documento") ON DELETE CASCADE ON UPDATE CASCADE;

-- RLS
ALTER TABLE "documentos" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "documentos"
    USING (tenant_id = get_current_tenant_id());

ALTER TABLE "versiones_documento" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "versiones_documento"
    USING (tenant_id = get_current_tenant_id());
