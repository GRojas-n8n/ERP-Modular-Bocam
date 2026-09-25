-- Change fix-ingresos-almacen-por-recepcion-oc: outbox transaccional de eventos de recepción de OC.

-- CreateTable
CREATE TABLE "outbox_eventos" (
    "id_evento" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "orden_id" UUID NOT NULL,
    "recepcion_id" UUID NOT NULL,
    "event_type" VARCHAR(100) NOT NULL,
    "event_version" INTEGER NOT NULL DEFAULT 1,
    "payload" JSONB NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    "intentos" INTEGER NOT NULL DEFAULT 0,
    "proximo_intento_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimo_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publicado_en" TIMESTAMP(3),

    CONSTRAINT "outbox_eventos_pkey" PRIMARY KEY ("id_evento")
);

-- CreateIndex
CREATE INDEX "outbox_eventos_estado_proximo_intento_en_idx" ON "outbox_eventos"("estado", "proximo_intento_en");

-- CreateIndex
CREATE UNIQUE INDEX "uq_outbox_recepcion" ON "outbox_eventos"("tenant_id", "recepcion_id");
