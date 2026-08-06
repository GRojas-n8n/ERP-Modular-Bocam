-- Migration: add_capitulo_conceptocatalogo_unicidad_concepto
-- Ver openspec/changes/wbs-jerarquico-conceptos.
--
-- ⚠️ ADVERTENCIA (bloqueante para producción, ver design.md Decision 4 y
-- tasks.md tarea 1.1): el índice único
-- "conceptos_tenant_id_proyecto_id_presupuesto_id_clave_key" de más abajo
-- FALLARÁ si ya existen conceptos con clave duplicada dentro del mismo
-- presupuesto_id en la base real. Antes de desplegar esta migración contra
-- producción, correr:
--   SELECT tenant_id, proyecto_id, presupuesto_id, clave, COUNT(*)
--   FROM conceptos GROUP BY 1,2,3,4 HAVING COUNT(*) > 1;
-- Si aparecen filas, resolverlas con el dueño del producto ANTES de aplicar
-- esta migración. Esta tarea de investigación (1.1) sigue SIN COMPLETAR
-- contra la BD real de producción al momento de escribir esta migración.

-- AlterTable
ALTER TABLE "conceptos" ADD COLUMN     "capitulo_id" UUID;

-- CreateTable
CREATE TABLE "capitulos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "presupuesto_id" UUID NOT NULL,
    "clave" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "capitulos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conceptos_catalogo" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "clave" VARCHAR(50) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "unidad_medida" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "conceptos_catalogo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_capitulo_tenant_proyecto" ON "capitulos"("tenant_id", "proyecto_id");

-- CreateIndex
CREATE INDEX "idx_capitulo_tenant_presupuesto" ON "capitulos"("tenant_id", "presupuesto_id");

-- CreateIndex
CREATE UNIQUE INDEX "capitulos_presupuesto_id_clave_key" ON "capitulos"("presupuesto_id", "clave");

-- CreateIndex
CREATE INDEX "idx_concepto_catalogo_tenant" ON "conceptos_catalogo"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "conceptos_catalogo_tenant_id_clave_key" ON "conceptos_catalogo"("tenant_id", "clave");

-- CreateIndex
CREATE INDEX "idx_concepto_tenant_capitulo" ON "conceptos"("tenant_id", "capitulo_id");

-- CreateIndex
CREATE UNIQUE INDEX "conceptos_tenant_id_proyecto_id_presupuesto_id_clave_key" ON "conceptos"("tenant_id", "proyecto_id", "presupuesto_id", "clave");

-- AddForeignKey
ALTER TABLE "capitulos" ADD CONSTRAINT "capitulos_presupuesto_id_fkey" FOREIGN KEY ("presupuesto_id") REFERENCES "presupuestos_base"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conceptos" ADD CONSTRAINT "conceptos_capitulo_id_fkey" FOREIGN KEY ("capitulo_id") REFERENCES "capitulos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

