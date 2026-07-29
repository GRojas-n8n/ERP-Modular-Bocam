-- CreateTable
CREATE TABLE "clientes" (
    "id_cliente" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "tercero_id" UUID,
    "rfc_tax_id" VARCHAR(20) NOT NULL,
    "razon_social" VARCHAR(255) NOT NULL,
    "email_contacto" VARCHAR(100),
    "telefono" VARCHAR(20),
    "estatus" TEXT NOT NULL DEFAULT 'ACTIVO',
    "codigo_cliente" VARCHAR(3),

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id_cliente")
);

-- CreateTable
CREATE TABLE "cotizaciones" (
    "id_cotizacion" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "cliente_id" UUID NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "fecha_emision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vigencia_hasta" TIMESTAMP(3),
    "estado" TEXT NOT NULL DEFAULT 'BORRADOR',
    "moneda" TEXT NOT NULL DEFAULT 'MXN',
    "subtotal" DECIMAL(18,2) NOT NULL,
    "iva" DECIMAL(18,2) NOT NULL,
    "total" DECIMAL(18,2) NOT NULL,
    "notas" TEXT,

    CONSTRAINT "cotizaciones_pkey" PRIMARY KEY ("id_cotizacion")
);

-- CreateTable
CREATE TABLE "facturas" (
    "id_factura" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "cliente_id" UUID NOT NULL,
    "cotizacion_id" UUID,
    "codigo" VARCHAR(50) NOT NULL,
    "fecha_emision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" TEXT NOT NULL DEFAULT 'BORRADOR',
    "moneda" TEXT NOT NULL DEFAULT 'MXN',
    "subtotal" DECIMAL(18,2) NOT NULL,
    "iva" DECIMAL(18,2) NOT NULL,
    "total" DECIMAL(18,2) NOT NULL,

    CONSTRAINT "facturas_pkey" PRIMARY KEY ("id_factura")
);

-- CreateIndex
CREATE UNIQUE INDEX "clientes_tenant_id_rfc_tax_id_key" ON "clientes"("tenant_id", "rfc_tax_id");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_tenant_id_codigo_cliente_key" ON "clientes"("tenant_id", "codigo_cliente");

-- CreateIndex
CREATE INDEX "cotizaciones_tenant_id_proyecto_id_idx" ON "cotizaciones"("tenant_id", "proyecto_id");

-- CreateIndex
CREATE UNIQUE INDEX "cotizaciones_tenant_id_codigo_key" ON "cotizaciones"("tenant_id", "codigo");

-- CreateIndex
CREATE INDEX "facturas_tenant_id_proyecto_id_idx" ON "facturas"("tenant_id", "proyecto_id");

-- CreateIndex
CREATE UNIQUE INDEX "facturas_tenant_id_codigo_key" ON "facturas"("tenant_id", "codigo");

-- AddForeignKey
ALTER TABLE "cotizaciones" ADD CONSTRAINT "cotizaciones_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id_cliente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id_cliente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_cotizacion_id_fkey" FOREIGN KEY ("cotizacion_id") REFERENCES "cotizaciones"("id_cotizacion") ON DELETE SET NULL ON UPDATE CASCADE;

