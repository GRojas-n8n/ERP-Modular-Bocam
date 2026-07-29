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
    "concepto_id" UUID,
    "concepto_clave" VARCHAR(100),
    "frente_trabajo" VARCHAR(100),
    "oc_item_id" UUID,

    CONSTRAINT "movimientos_almacen_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inventario_almacen_tenant_id_proyecto_id_idx" ON "inventario_almacen"("tenant_id", "proyecto_id");

-- CreateIndex
CREATE INDEX "movimientos_almacen_tenant_id_proyecto_id_fecha_idx" ON "movimientos_almacen"("tenant_id", "proyecto_id", "fecha");

-- CreateIndex
CREATE INDEX "movimientos_almacen_tenant_id_proyecto_id_concepto_id_idx" ON "movimientos_almacen"("tenant_id", "proyecto_id", "concepto_id");

-- AddForeignKey
ALTER TABLE "movimientos_almacen" ADD CONSTRAINT "movimientos_almacen_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventario_almacen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

