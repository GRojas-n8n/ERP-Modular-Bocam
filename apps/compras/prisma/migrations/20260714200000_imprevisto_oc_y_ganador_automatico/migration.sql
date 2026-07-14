-- Ver openspec/changes/generar-oc-imprevisto-y-ganador-automatico.
-- Migración puramente aditiva/relajante: insumo_id pasa a nullable (ninguna fila
-- existente se ve afectada, ninguna OC ya emitida pierde su insumo_id), y se agregan
-- 3 columnas nullable para soportar items de texto libre (imprevisto) sin catálogo.

ALTER TABLE "ordenes_compra_items" ALTER COLUMN "insumo_id" DROP NOT NULL;
ALTER TABLE "ordenes_compra_items" ADD COLUMN "detalle_req_id" UUID;
ALTER TABLE "ordenes_compra_items" ADD COLUMN "descripcion_libre" TEXT;
ALTER TABLE "ordenes_compra_items" ADD COLUMN "unidad_libre" VARCHAR(20);
