-- AlterTable
ALTER TABLE "requisiciones" ADD COLUMN     "cuadro_comparativo_cierre_id" UUID,
ADD COLUMN     "revision_cierre" VARCHAR(5);

-- CreateTable
CREATE TABLE "evaluaciones_especificacion" (
    "id_evaluacion" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "cuadro_id" UUID NOT NULL,
    "especificacion_id" UUID NOT NULL,
    "proveedor_id" UUID NOT NULL,
    "evaluacion_tecnica" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "comentario_tecnico" TEXT,
    "pregunta_residente" TEXT,
    "respuesta_compras" TEXT,
    "creado_por" UUID NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evaluaciones_especificacion_pkey" PRIMARY KEY ("id_evaluacion")
);

-- CreateIndex
CREATE INDEX "evaluaciones_especificacion_tenant_id_cuadro_id_idx" ON "evaluaciones_especificacion"("tenant_id", "cuadro_id");

-- CreateIndex
CREATE UNIQUE INDEX "evaluaciones_especificacion_cuadro_id_especificacion_id_p_key" ON "evaluaciones_especificacion"("cuadro_id", "especificacion_id", "proveedor_id");

-- AddForeignKey
ALTER TABLE "evaluaciones_especificacion" ADD CONSTRAINT "evaluaciones_especificacion_cuadro_id_fkey" FOREIGN KEY ("cuadro_id") REFERENCES "cuadros_comparativos"("id_cuadro") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluaciones_especificacion" ADD CONSTRAINT "evaluaciones_especificacion_especificacion_id_fkey" FOREIGN KEY ("especificacion_id") REFERENCES "especificaciones_detalle_req"("id_especificacion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluaciones_especificacion" ADD CONSTRAINT "evaluaciones_especificacion_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id_proveedor") ON DELETE RESTRICT ON UPDATE CASCADE;
