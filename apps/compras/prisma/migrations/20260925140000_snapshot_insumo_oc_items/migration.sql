-- Change fix-ingresos-almacen-por-recepcion-oc: snapshot del insumo en el renglón de la OC.
-- Migración compatible: solo agrega columnas opcionales; el código anterior sigue funcionando y las OC
-- existentes quedan con snapshot nulo (se completa en la primera recepción).

-- AlterTable
ALTER TABLE "ordenes_compra_items" ADD COLUMN "clave_snapshot" VARCHAR(50),
ADD COLUMN "descripcion_snapshot" TEXT,
ADD COLUMN "unidad_snapshot" VARCHAR(20),
ADD COLUMN "categoria_snapshot" VARCHAR(50);
