-- Change fix-ingresos-almacen-por-recepcion-oc: idempotencia de los INGRESOS por recepción de OC.

-- AlterTable
ALTER TABLE "movimientos_almacen" ADD COLUMN "recepcion_id" UUID,
ADD COLUMN "recepcion_item_id" UUID;

-- CreateTable
CREATE TABLE "eventos_procesados" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "event_type" VARCHAR(100) NOT NULL,
    "procesado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eventos_procesados_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uq_evento_procesado" ON "eventos_procesados"("tenant_id", "event_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_mov_recepcion_item" ON "movimientos_almacen"("tenant_id", "proyecto_id", "recepcion_id", "recepcion_item_id");
