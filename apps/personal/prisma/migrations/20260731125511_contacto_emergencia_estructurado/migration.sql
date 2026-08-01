-- Divide contacto_emergencia (texto libre) en 3 campos estructurados.
-- No se elimina la columna legacy (ver design.md del change
-- estructurar-contacto-emergencia-empleado).

ALTER TABLE "empleados"
  ADD COLUMN "contacto_emergencia_nombre" VARCHAR(200),
  ADD COLUMN "contacto_emergencia_telefono" VARCHAR(30),
  ADD COLUMN "contacto_emergencia_parentesco" VARCHAR(50);

UPDATE "empleados"
  SET "contacto_emergencia_nombre" = "contacto_emergencia"
  WHERE "contacto_emergencia" IS NOT NULL;
