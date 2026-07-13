-- Ver openspec/changes/evaluacion-economica-gt-por-proveedor.
-- Columnas aditivas, nullable (o con default), sin backfill necesario.

-- AlterTable: condiciones de crédito del proveedor (atributo fijo de catálogo)
ALTER TABLE "proveedores" ADD COLUMN "ofrece_credito" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "proveedores" ADD COLUMN "dias_credito" INTEGER;

-- AlterTable: pregunta/respuesta de la evaluación económica de Gerencia Técnica,
-- análogas a pregunta_residente/respuesta_compras pero para el flujo de GT.
ALTER TABLE "comparativas_detalles" ADD COLUMN "pregunta_gt" TEXT;
ALTER TABLE "comparativas_detalles" ADD COLUMN "respuesta_gt" TEXT;
