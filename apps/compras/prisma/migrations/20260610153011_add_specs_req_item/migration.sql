-- CreateTable
CREATE TABLE "proveedores" (
    "id_proveedor" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "rfc_tax_id" VARCHAR(20) NOT NULL,
    "razon_social" VARCHAR(255) NOT NULL,
    "email_contacto" VARCHAR(100),
    "telefono" VARCHAR(20),
    "estatus" TEXT NOT NULL DEFAULT 'ACTIVO',
    "ciudad" VARCHAR(100),
    "tipo_ubicacion" VARCHAR(20) NOT NULL DEFAULT 'LOCAL',
    "entrega_en_sitio" BOOLEAN NOT NULL DEFAULT false,
    "estatus_credito" VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    "limite_credito" DECIMAL(18,2),
    "tipo_proveedor" VARCHAR(20) NOT NULL DEFAULT 'NACIONAL',
    "calificacion_desempeno" DECIMAL(3,2),

    CONSTRAINT "proveedores_pkey" PRIMARY KEY ("id_proveedor")
);

-- CreateTable
CREATE TABLE "calificaciones_proveedor" (
    "id_calificacion" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "proveedor_id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "proyecto_nombre" VARCHAR(255) NOT NULL,
    "puntuacion" DECIMAL(3,2) NOT NULL,
    "comentario" TEXT,
    "calificado_por" UUID NOT NULL,
    "calificado_por_nombre" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calificaciones_proveedor_pkey" PRIMARY KEY ("id_calificacion")
);

-- CreateTable
CREATE TABLE "documentos_proveedor" (
    "id_doc" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "proveedor_id" UUID NOT NULL,
    "tipo_doc" VARCHAR(20) NOT NULL,
    "nombre_doc" VARCHAR(255) NOT NULL,
    "ruta_archivo" TEXT NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "tamano_bytes" INTEGER NOT NULL,
    "subido_por" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documentos_proveedor_pkey" PRIMARY KEY ("id_doc")
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
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "tipo" VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    "observaciones" TEXT,

    CONSTRAINT "requisiciones_pkey" PRIMARY KEY ("id_requisicion")
);

-- CreateTable
CREATE TABLE "requisiciones_items" (
    "id_item" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "requisicion_id" UUID NOT NULL,
    "insumo_id" UUID,
    "cantidad" DECIMAL(18,4) NOT NULL,
    "notas" TEXT,
    "descripcion_libre" TEXT,
    "unidad_libre" VARCHAR(20),
    "es_imprevisto" BOOLEAN NOT NULL DEFAULT false,
    "especificacion_marca_modelo" VARCHAR(200),
    "especificacion_detalle" TEXT,
    "cantidad_presupuestada" DECIMAL(18,4),
    "concepto_origen_id" UUID,
    "justificacion" TEXT,

    CONSTRAINT "requisiciones_items_pkey" PRIMARY KEY ("id_item")
);

-- CreateTable
CREATE TABLE "asignaciones_extra_concepto" (
    "id_asignacion" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "requisicion_item_id" UUID NOT NULL,
    "concepto_id" UUID NOT NULL,
    "concepto_clave" VARCHAR(100) NOT NULL,
    "concepto_descripcion" TEXT NOT NULL,
    "monto_extra" DECIMAL(18,4) NOT NULL,
    "asignado_por" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asignaciones_extra_concepto_pkey" PRIMARY KEY ("id_asignacion")
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
    "estado" TEXT NOT NULL DEFAULT 'BORRADOR',
    "notas" TEXT,
    "revision" VARCHAR(5) NOT NULL DEFAULT 'A',
    "revision_padre_id" UUID,
    "firmado_por" UUID,
    "fecha_firma" TIMESTAMP(3),
    "primera_opcion_proveedor_id" UUID,
    "segunda_opcion_proveedor_id" UUID,
    "veredicto_residente" TEXT,
    "proveedores_sugeridos" TEXT,
    "evaluacion_residente_id" UUID,
    "fecha_evaluacion_tecnica" TIMESTAMP(3),
    "gerente_tecnico_id" UUID,
    "fecha_aprobacion_gt" TIMESTAMP(3),
    "comentario_gt_general" TEXT,

    CONSTRAINT "cuadros_comparativos_pkey" PRIMARY KEY ("id_cuadro")
);

-- CreateTable
CREATE TABLE "auditoria_desbloqueo_comparativa" (
    "id_auditoria" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "cuadro_id" UUID NOT NULL,
    "desbloqueado_por" UUID NOT NULL,
    "timestamp_desbloqueo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "justificacion" TEXT NOT NULL,

    CONSTRAINT "auditoria_desbloqueo_comparativa_pkey" PRIMARY KEY ("id_auditoria")
);

-- CreateTable
CREATE TABLE "comparativas_lineas" (
    "id_linea" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "cuadro_id" UUID NOT NULL,
    "insumo_id" UUID NOT NULL,
    "marca_modelo_ref" VARCHAR(100),
    "especificaciones_requeridas" TEXT,
    "detalle_req_id" UUID,

    CONSTRAINT "comparativas_lineas_pkey" PRIMARY KEY ("id_linea")
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
    "evaluacion_tecnica" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "comentario_tecnico" TEXT,
    "valor_ofrecido_spec" TEXT,
    "pregunta_residente" TEXT,
    "respuesta_compras" TEXT,
    "aprobacion_gt" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "comentario_gt" TEXT,

    CONSTRAINT "comparativas_detalles_pkey" PRIMARY KEY ("id_detalle")
);

-- CreateTable
CREATE TABLE "aclaraciones_comparativa" (
    "id_aclaracion" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "cuadro_id" UUID NOT NULL,
    "insumo_id" UUID NOT NULL,
    "proveedor_id" UUID NOT NULL,
    "autor_id" UUID NOT NULL,
    "tipo" VARCHAR(20) NOT NULL,
    "mensaje" TEXT NOT NULL,
    "resuelta" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aclaraciones_comparativa_pkey" PRIMARY KEY ("id_aclaracion")
);

-- CreateTable
CREATE TABLE "especificaciones_detalle_req" (
    "id_especificacion" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "detalle_id" UUID NOT NULL,
    "descripcion" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "especificaciones_detalle_req_pkey" PRIMARY KEY ("id_especificacion")
);

-- CreateTable
CREATE TABLE "solicitudes_cotizacion" (
    "id_solicitud" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "requisicion_id" UUID NOT NULL,
    "dias_habiles" INTEGER NOT NULL DEFAULT 3,
    "fecha_solicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_limite" TIMESTAMP(3) NOT NULL,
    "creado_por" UUID NOT NULL,
    "notas" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "solicitudes_cotizacion_pkey" PRIMARY KEY ("id_solicitud")
);

-- CreateTable
CREATE TABLE "solicitudes_cotizacion_proveedores" (
    "id_scp" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "solicitud_id" UUID NOT NULL,
    "proveedor_id" UUID NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "pdf_nombre" VARCHAR(255),
    "pdf_ruta" TEXT,
    "pdf_mime" VARCHAR(100),
    "notas_proveedor" TEXT,
    "fecha_respuesta" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solicitudes_cotizacion_proveedores_pkey" PRIMARY KEY ("id_scp")
);

-- CreateTable
CREATE TABLE "anotaciones_especificacion" (
    "id_anotacion" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "cuadro_id" UUID NOT NULL,
    "especificacion_id" UUID NOT NULL,
    "proveedor_id" UUID NOT NULL,
    "tipo" VARCHAR(20) NOT NULL,
    "texto" TEXT NOT NULL,
    "creado_por" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anotaciones_especificacion_pkey" PRIMARY KEY ("id_anotacion")
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
CREATE INDEX "calificaciones_proveedor_tenant_id_proveedor_id_idx" ON "calificaciones_proveedor"("tenant_id", "proveedor_id");

-- CreateIndex
CREATE UNIQUE INDEX "calificaciones_proveedor_tenant_id_proveedor_id_proyecto_id_key" ON "calificaciones_proveedor"("tenant_id", "proveedor_id", "proyecto_id");

-- CreateIndex
CREATE INDEX "documentos_proveedor_tenant_id_proveedor_id_idx" ON "documentos_proveedor"("tenant_id", "proveedor_id");

-- CreateIndex
CREATE INDEX "requisiciones_tenant_id_proyecto_id_idx" ON "requisiciones"("tenant_id", "proyecto_id");

-- CreateIndex
CREATE INDEX "requisiciones_tenant_id_tipo_idx" ON "requisiciones"("tenant_id", "tipo");

-- CreateIndex
CREATE UNIQUE INDEX "requisiciones_tenant_id_codigo_key" ON "requisiciones"("tenant_id", "codigo");

-- CreateIndex
CREATE INDEX "requisiciones_items_tenant_id_requisicion_id_idx" ON "requisiciones_items"("tenant_id", "requisicion_id");

-- CreateIndex
CREATE INDEX "requisiciones_items_tenant_id_proyecto_id_insumo_id_idx" ON "requisiciones_items"("tenant_id", "proyecto_id", "insumo_id");

-- CreateIndex
CREATE INDEX "asignaciones_extra_concepto_tenant_id_proyecto_id_idx" ON "asignaciones_extra_concepto"("tenant_id", "proyecto_id");

-- CreateIndex
CREATE INDEX "asignaciones_extra_concepto_tenant_id_concepto_id_idx" ON "asignaciones_extra_concepto"("tenant_id", "concepto_id");

-- CreateIndex
CREATE UNIQUE INDEX "asignaciones_extra_concepto_tenant_id_requisicion_item_id_key" ON "asignaciones_extra_concepto"("tenant_id", "requisicion_item_id");

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
CREATE INDEX "auditoria_desbloqueo_comparativa_tenant_id_cuadro_id_idx" ON "auditoria_desbloqueo_comparativa"("tenant_id", "cuadro_id");

-- CreateIndex
CREATE INDEX "comparativas_lineas_tenant_id_cuadro_id_idx" ON "comparativas_lineas"("tenant_id", "cuadro_id");

-- CreateIndex
CREATE UNIQUE INDEX "comparativas_lineas_cuadro_id_insumo_id_key" ON "comparativas_lineas"("cuadro_id", "insumo_id");

-- CreateIndex
CREATE INDEX "comparativas_detalles_tenant_id_cuadro_id_idx" ON "comparativas_detalles"("tenant_id", "cuadro_id");

-- CreateIndex
CREATE INDEX "aclaraciones_comparativa_tenant_id_cuadro_id_idx" ON "aclaraciones_comparativa"("tenant_id", "cuadro_id");

-- CreateIndex
CREATE INDEX "aclaraciones_comparativa_cuadro_id_insumo_id_proveedor_id_idx" ON "aclaraciones_comparativa"("cuadro_id", "insumo_id", "proveedor_id");

-- CreateIndex
CREATE INDEX "especificaciones_detalle_req_tenant_id_detalle_id_idx" ON "especificaciones_detalle_req"("tenant_id", "detalle_id");

-- CreateIndex
CREATE INDEX "solicitudes_cotizacion_tenant_id_proyecto_id_idx" ON "solicitudes_cotizacion"("tenant_id", "proyecto_id");

-- CreateIndex
CREATE UNIQUE INDEX "solicitudes_cotizacion_tenant_id_requisicion_id_key" ON "solicitudes_cotizacion"("tenant_id", "requisicion_id");

-- CreateIndex
CREATE INDEX "solicitudes_cotizacion_proveedores_tenant_id_solicitud_id_idx" ON "solicitudes_cotizacion_proveedores"("tenant_id", "solicitud_id");

-- CreateIndex
CREATE UNIQUE INDEX "solicitudes_cotizacion_proveedores_solicitud_id_proveedor_i_key" ON "solicitudes_cotizacion_proveedores"("solicitud_id", "proveedor_id");

-- CreateIndex
CREATE INDEX "anotaciones_especificacion_tenant_id_cuadro_id_idx" ON "anotaciones_especificacion"("tenant_id", "cuadro_id");

-- CreateIndex
CREATE INDEX "anotaciones_especificacion_tenant_id_especificacion_id_idx" ON "anotaciones_especificacion"("tenant_id", "especificacion_id");

-- CreateIndex
CREATE INDEX "alertas_oc_error_tenant_id_proyecto_id_idx" ON "alertas_oc_error"("tenant_id", "proyecto_id");

-- CreateIndex
CREATE UNIQUE INDEX "alertas_oc_error_tenant_id_oc_id_key" ON "alertas_oc_error"("tenant_id", "oc_id");

-- CreateIndex
CREATE INDEX "inventario_almacen_tenant_id_proyecto_id_idx" ON "inventario_almacen"("tenant_id", "proyecto_id");

-- CreateIndex
CREATE INDEX "movimientos_almacen_tenant_id_proyecto_id_fecha_idx" ON "movimientos_almacen"("tenant_id", "proyecto_id", "fecha");

-- AddForeignKey
ALTER TABLE "calificaciones_proveedor" ADD CONSTRAINT "calificaciones_proveedor_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id_proveedor") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_proveedor" ADD CONSTRAINT "documentos_proveedor_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id_proveedor") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisiciones_items" ADD CONSTRAINT "requisiciones_items_requisicion_id_fkey" FOREIGN KEY ("requisicion_id") REFERENCES "requisiciones"("id_requisicion") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_compra" ADD CONSTRAINT "ordenes_compra_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id_proveedor") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_compra_items" ADD CONSTRAINT "ordenes_compra_items_orden_id_fkey" FOREIGN KEY ("orden_id") REFERENCES "ordenes_compra"("id_orden") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria_desbloqueo_comparativa" ADD CONSTRAINT "auditoria_desbloqueo_comparativa_cuadro_id_fkey" FOREIGN KEY ("cuadro_id") REFERENCES "cuadros_comparativos"("id_cuadro") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comparativas_lineas" ADD CONSTRAINT "comparativas_lineas_cuadro_id_fkey" FOREIGN KEY ("cuadro_id") REFERENCES "cuadros_comparativos"("id_cuadro") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comparativas_detalles" ADD CONSTRAINT "comparativas_detalles_cuadro_id_fkey" FOREIGN KEY ("cuadro_id") REFERENCES "cuadros_comparativos"("id_cuadro") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comparativas_detalles" ADD CONSTRAINT "comparativas_detalles_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id_proveedor") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aclaraciones_comparativa" ADD CONSTRAINT "aclaraciones_comparativa_cuadro_id_fkey" FOREIGN KEY ("cuadro_id") REFERENCES "cuadros_comparativos"("id_cuadro") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_cotizacion_proveedores" ADD CONSTRAINT "solicitudes_cotizacion_proveedores_solicitud_id_fkey" FOREIGN KEY ("solicitud_id") REFERENCES "solicitudes_cotizacion"("id_solicitud") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_almacen" ADD CONSTRAINT "movimientos_almacen_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventario_almacen"("id") ON DELETE CASCADE ON UPDATE CASCADE;
