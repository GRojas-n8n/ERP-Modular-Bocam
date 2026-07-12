-- AlterTable
-- tiempo_entrega (texto libre, nunca poblado por la UI real — ver
-- openspec/changes/fecha-entrega-estimada-por-partida) se reemplaza por
-- una fecha estructurada por partida y proveedor.
ALTER TABLE "comparativas_detalles" DROP COLUMN "tiempo_entrega",
ADD COLUMN     "fecha_entrega_estimada" TIMESTAMP(3);
