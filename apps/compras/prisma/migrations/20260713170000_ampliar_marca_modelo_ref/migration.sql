-- Amplía comparativas_lineas.marca_modelo_ref de VARCHAR(100) a VARCHAR(200)
-- para igualar el límite real de requisiciones_items.especificacion_marca_modelo
-- (origen del valor al crear el cuadro). Causaba error 500 en POST /comparativas
-- para marcas/modelos de más de 100 caracteres. Ampliar un VARCHAR en PostgreSQL
-- no reescribe la tabla, aditivo y seguro.

-- AlterTable
ALTER TABLE "comparativas_lineas" ALTER COLUMN "marca_modelo_ref" TYPE VARCHAR(200);
