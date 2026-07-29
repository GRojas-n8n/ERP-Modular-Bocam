-- CreateTable
CREATE TABLE "asientos_contables" (
    "id_asiento" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "pago_id" UUID,
    "external_event_key" VARCHAR(180),
    "referencia_funcional" VARCHAR(120),
    "evento_conciliacion_key" VARCHAR(180),
    "tipo_poliza" VARCHAR(50) NOT NULL DEFAULT 'EGRESO',
    "folio_poliza" VARCHAR(80) NOT NULL,
    "concepto" VARCHAR(500) NOT NULL,
    "monto_total" DECIMAL(18,2) NOT NULL,
    "moneda" VARCHAR(5) NOT NULL DEFAULT 'MXN',
    "fecha_poliza" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "beneficiario" VARCHAR(255) NOT NULL,
    "referencia_modulo" VARCHAR(50),
    "referencia_entidad" VARCHAR(50),
    "referencia_id" UUID,
    "estatus" VARCHAR(50) NOT NULL DEFAULT 'REGISTRADO',
    "cfdi_status" VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE',
    "bancario_status" VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE',
    "notas" TEXT,
    "conciliado_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asientos_contables_pkey" PRIMARY KEY ("id_asiento")
);

-- CreateTable
CREATE TABLE "conciliaciones_fiscales" (
    "id_conciliacion" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "asiento_id" UUID NOT NULL,
    "pago_id" UUID,
    "uuid_fiscal" VARCHAR(80),
    "serie" VARCHAR(20),
    "folio" VARCHAR(40),
    "rfc_emisor" VARCHAR(20),
    "rfc_receptor" VARCHAR(20),
    "monto_pagado" DECIMAL(18,2) NOT NULL,
    "monto_cfdi" DECIMAL(18,2),
    "moneda" VARCHAR(5) NOT NULL DEFAULT 'MXN',
    "fecha_emision" TIMESTAMP(3),
    "fecha_timbrado" TIMESTAMP(3),
    "estatus_fiscal" VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE_CFDI',
    "estatus_sat" VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE_VALIDACION',
    "fecha_validacion_sat" TIMESTAMP(3),
    "fecha_cancelacion_sat" TIMESTAMP(3),
    "ultima_verificacion_sat_at" TIMESTAMP(3),
    "sat_requested_at" TIMESTAMP(3),
    "sat_next_retry_at" TIMESTAMP(3),
    "sat_dlq_at" TIMESTAMP(3),
    "sat_retry_count" INTEGER NOT NULL DEFAULT 0,
    "sat_dispatch_id" VARCHAR(80),
    "sat_last_completed_dispatch_id" VARCHAR(80),
    "sat_processing_started_at" TIMESTAMP(3),
    "mensaje_sat" TEXT,
    "sat_last_error" TEXT,
    "fuente" VARCHAR(30) NOT NULL DEFAULT 'MANUAL',
    "fecha_conciliacion" TIMESTAMP(3),
    "notas" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conciliaciones_fiscales_pkey" PRIMARY KEY ("id_conciliacion")
);

-- CreateTable
CREATE TABLE "cuentas_contables" (
    "id_cuenta" UUID NOT NULL,
    "clave" VARCHAR(10) NOT NULL,
    "nombre" VARCHAR(120) NOT NULL,
    "tipo" VARCHAR(20) NOT NULL,
    "naturaleza" VARCHAR(10) NOT NULL,
    "padre_id" UUID,
    "nivel" INTEGER NOT NULL DEFAULT 1,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cuentas_contables_pkey" PRIMARY KEY ("id_cuenta")
);

-- CreateTable
CREATE TABLE "movimientos_poliza" (
    "id_movimiento" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "asiento_id" UUID NOT NULL,
    "cuenta_id" UUID NOT NULL,
    "descripcion" VARCHAR(500) NOT NULL,
    "cargo" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "abono" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimientos_poliza_pkey" PRIMARY KEY ("id_movimiento")
);

-- CreateTable
CREATE TABLE "conciliaciones_bancarias" (
    "id_conciliacion_bancaria" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "asiento_id" UUID NOT NULL,
    "pago_id" UUID,
    "referencia_bancaria" VARCHAR(100),
    "banco" VARCHAR(100),
    "metodo_pago" VARCHAR(50),
    "monto_pagado" DECIMAL(18,2) NOT NULL,
    "monto_banco" DECIMAL(18,2),
    "moneda" VARCHAR(5) NOT NULL DEFAULT 'MXN',
    "fecha_pago_real" TIMESTAMP(3),
    "fecha_movimiento_bancario" TIMESTAMP(3),
    "estatus_bancario" VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE_MOVIMIENTO',
    "fuente" VARCHAR(30) NOT NULL DEFAULT 'EVENTO_FINANZAS',
    "fecha_conciliacion" TIMESTAMP(3),
    "notas" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conciliaciones_bancarias_pkey" PRIMARY KEY ("id_conciliacion_bancaria")
);

-- CreateIndex
CREATE INDEX "asientos_contables_tenant_id_proyecto_id_idx" ON "asientos_contables"("tenant_id", "proyecto_id");

-- CreateIndex
CREATE INDEX "asientos_contables_tenant_id_proyecto_id_estatus_idx" ON "asientos_contables"("tenant_id", "proyecto_id", "estatus");

-- CreateIndex
CREATE INDEX "asientos_contables_tenant_id_proyecto_id_referencia_funcion_idx" ON "asientos_contables"("tenant_id", "proyecto_id", "referencia_funcional");

-- CreateIndex
CREATE UNIQUE INDEX "asientos_contables_tenant_id_external_event_key_key" ON "asientos_contables"("tenant_id", "external_event_key");

-- CreateIndex
CREATE UNIQUE INDEX "asientos_contables_tenant_id_evento_conciliacion_key_key" ON "asientos_contables"("tenant_id", "evento_conciliacion_key");

-- CreateIndex
CREATE UNIQUE INDEX "asientos_contables_tenant_id_proyecto_id_folio_poliza_key" ON "asientos_contables"("tenant_id", "proyecto_id", "folio_poliza");

-- CreateIndex
CREATE INDEX "conciliaciones_fiscales_tenant_id_proyecto_id_estatus_fisca_idx" ON "conciliaciones_fiscales"("tenant_id", "proyecto_id", "estatus_fiscal");

-- CreateIndex
CREATE INDEX "conciliaciones_fiscales_tenant_id_proyecto_id_estatus_sat_idx" ON "conciliaciones_fiscales"("tenant_id", "proyecto_id", "estatus_sat");

-- CreateIndex
CREATE INDEX "conciliaciones_fiscales_tenant_id_pago_id_idx" ON "conciliaciones_fiscales"("tenant_id", "pago_id");

-- CreateIndex
CREATE UNIQUE INDEX "conciliaciones_fiscales_tenant_id_asiento_id_key" ON "conciliaciones_fiscales"("tenant_id", "asiento_id");

-- CreateIndex
CREATE UNIQUE INDEX "conciliaciones_fiscales_tenant_id_uuid_fiscal_key" ON "conciliaciones_fiscales"("tenant_id", "uuid_fiscal");

-- CreateIndex
CREATE INDEX "cuentas_contables_tipo_activa_idx" ON "cuentas_contables"("tipo", "activa");

-- CreateIndex
CREATE UNIQUE INDEX "cuentas_contables_clave_key" ON "cuentas_contables"("clave");

-- CreateIndex
CREATE INDEX "movimientos_poliza_tenant_id_asiento_id_idx" ON "movimientos_poliza"("tenant_id", "asiento_id");

-- CreateIndex
CREATE INDEX "movimientos_poliza_tenant_id_proyecto_id_idx" ON "movimientos_poliza"("tenant_id", "proyecto_id");

-- CreateIndex
CREATE INDEX "movimientos_poliza_cuenta_id_idx" ON "movimientos_poliza"("cuenta_id");

-- CreateIndex
CREATE INDEX "conciliaciones_bancarias_tenant_id_proyecto_id_estatus_banc_idx" ON "conciliaciones_bancarias"("tenant_id", "proyecto_id", "estatus_bancario");

-- CreateIndex
CREATE INDEX "conciliaciones_bancarias_tenant_id_pago_id_idx" ON "conciliaciones_bancarias"("tenant_id", "pago_id");

-- CreateIndex
CREATE INDEX "conciliaciones_bancarias_tenant_id_referencia_bancaria_idx" ON "conciliaciones_bancarias"("tenant_id", "referencia_bancaria");

-- CreateIndex
CREATE UNIQUE INDEX "conciliaciones_bancarias_tenant_id_asiento_id_key" ON "conciliaciones_bancarias"("tenant_id", "asiento_id");

-- AddForeignKey
ALTER TABLE "movimientos_poliza" ADD CONSTRAINT "movimientos_poliza_cuenta_id_fkey" FOREIGN KEY ("cuenta_id") REFERENCES "cuentas_contables"("id_cuenta") ON DELETE RESTRICT ON UPDATE CASCADE;

