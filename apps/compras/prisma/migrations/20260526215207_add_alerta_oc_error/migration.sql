-- CreateTable
CREATE TABLE "proveedores" (
    "id_proveedor" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "rfc_tax_id" VARCHAR(20) NOT NULL,
    "razon_social" VARCHAR(255) NOT NULL,
    "email_contacto" VARCHAR(100),
    "telefono" VARCHAR(20),
    "estatus" TEXT NOT NULL DEFAULT 'ACTIVO',

    CONSTRAINT "proveedores_pkey" PRIMARY KEY ("id_proveedor")
);

-- CreateTable
CREATE TABLE "requisiciones" (
    "id_requisicion" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "fecha_solicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "solicitante_id" UUID NOT NULL,
    "prioridad" TEXT NOT NULL DEFAULT 'NORMAL',
    "estado" TEXT NOT NULL DEFAULT 'BORRADOR',
    "observaciones" TEXT,

    CONSTRAINT "requisiciones_pkey" PRIMARY KEY ("id_requisicion")
);

-- CreateTable
CREATE TABLE "requisiciones_items" (
    "id_item" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "requisicion_id" UUID NOT NULL,
    "insumo_id" UUID NOT NULL,
    "cantidad" DECIMAL(18,4) NOT NULL,
    "notas" TEXT,

    CONSTRAINT "requisiciones_items_pkey" PRIMARY KEY ("id_item")
);

-- CreateTable
CREATE TABLE "ordenes_compra" (
    "id_orden" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "proveedor_id" UUID NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "fecha_emision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" TEXT NOT NULL DEFAULT 'BORRADOR',
    "moneda" TEXT NOT NULL DEFAULT 'MXN',
    "tipo_cambio" DECIMAL(18,4) NOT NULL DEFAULT 1.0,
    "subtotal" DECIMAL(18,2) NOT NULL,
    "iva" DECIMAL(18,2) NOT NULL,
    "total" DECIMAL(18,2) NOT NULL,
    "presupuesto_id" UUID,

    CONSTRAINT "ordenes_compra_pkey" PRIMARY KEY ("id_orden")
);

-- CreateTable
CREATE TABLE "ordenes_compra_items" (
    "id_item" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "orden_id" UUID NOT NULL,
    "insumo_id" UUID NOT NULL,
    "cantidad" DECIMAL(18,4) NOT NULL,
    "precio_unitario" DECIMAL(18,4) NOT NULL,
    "importe" DECIMAL(18,2) NOT NULL,

    CONSTRAINT "ordenes_compra_items_pkey" PRIMARY KEY ("id_item")
);

-- CreateTable
CREATE TABLE "cuadros_comparativos" (
    "id_cuadro" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "requisicion_id" UUID NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" TEXT NOT NULL DEFAULT 'ABIERTO',
    "notas" TEXT,

    CONSTRAINT "cuadros_comparativos_pkey" PRIMARY KEY ("id_cuadro")
);

-- CreateTable
CREATE TABLE "comparativas_detalles" (
    "id_detalle" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "cuadro_id" UUID NOT NULL,
    "proveedor_id" UUID NOT NULL,
    "insumo_id" UUID NOT NULL,
    "precio_ofertado" DECIMAL(18,4) NOT NULL,
    "tiempo_entrega" VARCHAR(50),
    "es_ganador" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "comparativas_detalles_pkey" PRIMARY KEY ("id_detalle")
);

-- CreateTable
CREATE TABLE "alertas_oc_error" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "oc_id" UUID NOT NULL,
    "oc_codigo" VARCHAR(50) NOT NULL,
    "presupuesto_id" UUID,
    "error_message" TEXT NOT NULL,
    "resuelta" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alertas_oc_error_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventario_almacen" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "insumo_id" UUID,
    "clave" VARCHAR(50) NOT NULL,
    "descripcion" VARCHAR(255) NOT NULL,
    "unidad" VARCHAR(20) NOT NULL,
    "categoria" VARCHAR(50) NOT NULL,
    "stock_actual" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "stock_minimo" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "ubicacion" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventario_almacen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimientos_almacen" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "tipo" VARCHAR(20) NOT NULL,
    "cantidad" DECIMAL(18,4) NOT NULL,
    "unidad" VARCHAR(20) NOT NULL,
    "origen" VARCHAR(100),
    "destino" VARCHAR(100),
    "responsable" VARCHAR(100),
    "referencia" VARCHAR(50),
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimientos_almacen_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "proveedores_tenant_id_rfc_tax_id_key" ON "proveedores"("tenant_id", "rfc_tax_id");

-- CreateIndex
CREATE INDEX "requisiciones_tenant_id_proyecto_id_idx" ON "requisiciones"("tenant_id", "proyecto_id");

-- CreateIndex
CREATE UNIQUE INDEX "requisiciones_tenant_id_codigo_key" ON "requisiciones"("tenant_id", "codigo");

-- CreateIndex
CREATE INDEX "requisiciones_items_tenant_id_requisicion_id_idx" ON "requisiciones_items"("tenant_id", "requisicion_id");

-- CreateIndex
CREATE INDEX "ordenes_compra_tenant_id_proyecto_id_idx" ON "ordenes_compra"("tenant_id", "proyecto_id");

-- CreateIndex
CREATE UNIQUE INDEX "ordenes_compra_tenant_id_codigo_key" ON "ordenes_compra"("tenant_id", "codigo");

-- CreateIndex
CREATE INDEX "ordenes_compra_items_tenant_id_orden_id_idx" ON "ordenes_compra_items"("tenant_id", "orden_id");

-- CreateIndex
CREATE INDEX "cuadros_comparativos_tenant_id_proyecto_id_idx" ON "cuadros_comparativos"("tenant_id", "proyecto_id");

-- CreateIndex
CREATE UNIQUE INDEX "cuadros_comparativos_tenant_id_codigo_key" ON "cuadros_comparativos"("tenant_id", "codigo");

-- CreateIndex
CREATE INDEX "comparativas_detalles_tenant_id_cuadro_id_idx" ON "comparativas_detalles"("tenant_id", "cuadro_id");

-- CreateIndex
CREATE INDEX "alertas_oc_error_tenant_id_proyecto_id_idx" ON "alertas_oc_error"("tenant_id", "proyecto_id");

-- CreateIndex
CREATE UNIQUE INDEX "alertas_oc_error_tenant_id_oc_id_key" ON "alertas_oc_error"("tenant_id", "oc_id");

-- CreateIndex
CREATE INDEX "inventario_almacen_tenant_id_proyecto_id_idx" ON "inventario_almacen"("tenant_id", "proyecto_id");

-- CreateIndex
CREATE INDEX "movimientos_almacen_tenant_id_proyecto_id_fecha_idx" ON "movimientos_almacen"("tenant_id", "proyecto_id", "fecha");

-- AddForeignKey
ALTER TABLE "requisiciones_items" ADD CONSTRAINT "requisiciones_items_requisicion_id_fkey" FOREIGN KEY ("requisicion_id") REFERENCES "requisiciones"("id_requisicion") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_compra" ADD CONSTRAINT "ordenes_compra_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id_proveedor") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_compra_items" ADD CONSTRAINT "ordenes_compra_items_orden_id_fkey" FOREIGN KEY ("orden_id") REFERENCES "ordenes_compra"("id_orden") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comparativas_detalles" ADD CONSTRAINT "comparativas_detalles_cuadro_id_fkey" FOREIGN KEY ("cuadro_id") REFERENCES "cuadros_comparativos"("id_cuadro") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comparativas_detalles" ADD CONSTRAINT "comparativas_detalles_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id_proveedor") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_almacen" ADD CONSTRAINT "movimientos_almacen_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventario_almacen"("id") ON DELETE CASCADE ON UPDATE CASCADE;
