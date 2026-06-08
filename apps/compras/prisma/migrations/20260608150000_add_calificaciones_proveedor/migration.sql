-- Migration: add_calificaciones_proveedor
-- Sistema de calificación de desempeño de proveedores por proyecto con promedio automático

CREATE TABLE "calificaciones_proveedor" (
  "id_calificacion"        UUID         NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id"              UUID         NOT NULL,
  "proveedor_id"           UUID         NOT NULL,
  "proyecto_id"            UUID         NOT NULL,
  "proyecto_nombre"        VARCHAR(255) NOT NULL,
  "puntuacion"             DECIMAL(3,2) NOT NULL,
  "comentario"             TEXT,
  "calificado_por"         UUID         NOT NULL,
  "calificado_por_nombre"  VARCHAR(255) NOT NULL,
  "created_at"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "calificaciones_proveedor_pkey"
    PRIMARY KEY ("id_calificacion"),
  CONSTRAINT "calificaciones_proveedor_proveedor_id_fkey"
    FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id_proveedor")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "calificaciones_proveedor_tenant_proveedor_proyecto_key"
    UNIQUE ("tenant_id", "proveedor_id", "proyecto_id")
);

CREATE INDEX "calificaciones_proveedor_tenant_id_proveedor_id_idx"
  ON "calificaciones_proveedor"("tenant_id", "proveedor_id");
