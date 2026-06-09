-- Migration: add_solicitud_cotizacion_y_specs
-- Adds: especificaciones_detalle_req, solicitudes_cotizacion, solicitudes_cotizacion_proveedores,
--       anotaciones_especificacion, + detalle_req_id column on comparativas_lineas

-- Especificaciones técnicas por partida de requisición
CREATE TABLE "compras"."especificaciones_detalle_req" (
    "id_especificacion" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"         UUID NOT NULL,
    "proyecto_id"       UUID NOT NULL,
    "detalle_id"        UUID NOT NULL,
    "descripcion"       TEXT NOT NULL,
    "orden"             INTEGER NOT NULL DEFAULT 0,
    "created_at"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "especificaciones_detalle_req_pkey" PRIMARY KEY ("id_especificacion")
);

CREATE INDEX "especificaciones_detalle_req_tenant_id_detalle_id_idx"
    ON "compras"."especificaciones_detalle_req"("tenant_id", "detalle_id");

-- Solicitudes de cotización
CREATE TABLE "compras"."solicitudes_cotizacion" (
    "id_solicitud"    UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"       UUID NOT NULL,
    "proyecto_id"     UUID NOT NULL,
    "requisicion_id"  UUID NOT NULL,
    "dias_habiles"    INTEGER NOT NULL DEFAULT 3,
    "fecha_solicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_limite"    TIMESTAMP(3) NOT NULL,
    "creado_por"      UUID NOT NULL,
    "notas"           TEXT,
    "created_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "solicitudes_cotizacion_pkey" PRIMARY KEY ("id_solicitud")
);

CREATE UNIQUE INDEX "solicitudes_cotizacion_tenant_id_requisicion_id_key"
    ON "compras"."solicitudes_cotizacion"("tenant_id", "requisicion_id");

CREATE INDEX "solicitudes_cotizacion_tenant_id_proyecto_id_idx"
    ON "compras"."solicitudes_cotizacion"("tenant_id", "proyecto_id");

-- Proveedores por solicitud de cotización
CREATE TABLE "compras"."solicitudes_cotizacion_proveedores" (
    "id_scp"          UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"       UUID NOT NULL,
    "solicitud_id"    UUID NOT NULL,
    "proveedor_id"    UUID NOT NULL,
    "estado"          TEXT NOT NULL DEFAULT 'PENDIENTE',
    "pdf_nombre"      VARCHAR(255),
    "pdf_ruta"        TEXT,
    "pdf_mime"        VARCHAR(100),
    "notas_proveedor" TEXT,
    "fecha_respuesta" TIMESTAMP(3),
    "updated_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "solicitudes_cotizacion_proveedores_pkey" PRIMARY KEY ("id_scp"),
    CONSTRAINT "solicitudes_cotizacion_proveedores_solicitud_id_fkey"
        FOREIGN KEY ("solicitud_id")
        REFERENCES "compras"."solicitudes_cotizacion"("id_solicitud")
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "solicitudes_cotizacion_proveedores_solicitud_id_proveedor_id_key"
    ON "compras"."solicitudes_cotizacion_proveedores"("solicitud_id", "proveedor_id");

CREATE INDEX "solicitudes_cotizacion_proveedores_tenant_id_solicitud_id_idx"
    ON "compras"."solicitudes_cotizacion_proveedores"("tenant_id", "solicitud_id");

-- Anotaciones por especificación × proveedor en el cuadro comparativo
CREATE TABLE "compras"."anotaciones_especificacion" (
    "id_anotacion"      UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"         UUID NOT NULL,
    "cuadro_id"         UUID NOT NULL,
    "especificacion_id" UUID NOT NULL,
    "proveedor_id"      UUID NOT NULL,
    "tipo"              VARCHAR(20) NOT NULL,
    "texto"             TEXT NOT NULL,
    "creado_por"        UUID NOT NULL,
    "created_at"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "anotaciones_especificacion_pkey" PRIMARY KEY ("id_anotacion")
);

CREATE INDEX "anotaciones_especificacion_tenant_id_cuadro_id_idx"
    ON "compras"."anotaciones_especificacion"("tenant_id", "cuadro_id");

CREATE INDEX "anotaciones_especificacion_tenant_id_especificacion_id_idx"
    ON "compras"."anotaciones_especificacion"("tenant_id", "especificacion_id");

-- Agregar campo detalle_req_id a comparativas_lineas (nullable, retrocompatible)
ALTER TABLE "compras"."comparativas_lineas"
    ADD COLUMN "detalle_req_id" UUID;
