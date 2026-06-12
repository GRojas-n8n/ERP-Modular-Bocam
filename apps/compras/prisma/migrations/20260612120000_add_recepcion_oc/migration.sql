-- CreateTable: recepciones_oc — cabecera de recepción de materiales contra OC
CREATE TABLE "recepciones_oc" (
    "id_recepcion" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "orden_id" UUID NOT NULL,
    "fecha_recepcion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recibido_por" UUID NOT NULL,
    "notas" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recepciones_oc_pkey" PRIMARY KEY ("id_recepcion")
);

-- CreateTable: recepcion_oc_items — líneas de recepción (cantidad recibida por ítem de OC)
CREATE TABLE "recepcion_oc_items" (
    "id_recepcion_item" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "recepcion_id" UUID NOT NULL,
    "orden_item_id" UUID NOT NULL,
    "cantidad_recibida" DECIMAL(18,4) NOT NULL,
    "nota_discrepancia" TEXT,

    CONSTRAINT "recepcion_oc_items_pkey" PRIMARY KEY ("id_recepcion_item")
);

-- CreateIndex
CREATE INDEX "recepciones_oc_tenant_id_orden_id_idx" ON "recepciones_oc"("tenant_id", "orden_id");

-- CreateIndex
CREATE INDEX "recepcion_oc_items_tenant_id_recepcion_id_idx" ON "recepcion_oc_items"("tenant_id", "recepcion_id");

-- AddForeignKey
ALTER TABLE "recepciones_oc" ADD CONSTRAINT "recepciones_oc_orden_id_fkey" FOREIGN KEY ("orden_id") REFERENCES "ordenes_compra"("id_orden") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recepcion_oc_items" ADD CONSTRAINT "recepcion_oc_items_recepcion_id_fkey" FOREIGN KEY ("recepcion_id") REFERENCES "recepciones_oc"("id_recepcion") ON DELETE CASCADE ON UPDATE CASCADE;
