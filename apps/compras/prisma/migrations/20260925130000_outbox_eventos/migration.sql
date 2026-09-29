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

-- Row Level Security en la MISMA migración que crea la tabla: no existe ventana en la que outbox_eventos sea
-- accesible sin RLS entre la migración y el workflow manual de RLS (que solo reaplica/verifica esta política).
-- Debe coincidir con el bloque OUTBOX_EVENTOS de rls-policies.sql (una prueba lo comprueba).
-- Los GUC se comparan con NULLIF(..., ''): tras una transacción con set_config(..., true) el GUC queda en ''
-- en esa conexión del pool, y ''::uuid lanzaría un error antes de evaluar la rama del despachador.
ALTER TABLE "outbox_eventos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "outbox_eventos" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rls_outbox_eventos_context ON "outbox_eventos";
CREATE POLICY rls_outbox_eventos_context ON "outbox_eventos"
    USING (
        current_setting('app.internal_worker', true) = 'outbox'
        OR (
            tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
            AND proyecto_id = NULLIF(current_setting('app.current_proyecto_id', true), '')::uuid
        )
    )
    WITH CHECK (
        current_setting('app.internal_worker', true) = 'outbox'
        OR (
            tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
            AND proyecto_id = NULLIF(current_setting('app.current_proyecto_id', true), '')::uuid
        )
    );
