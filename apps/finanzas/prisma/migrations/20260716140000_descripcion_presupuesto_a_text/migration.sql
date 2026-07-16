-- Migration: descripcion_presupuesto_a_text
-- Ver openspec/changes/unificar-presupuesto-a-partidas-gt. Bug real encontrado
-- durante la migración de datos en producción: Concepto.descripcion en GT es
-- Text sin límite; PresupuestoAsignado.descripcion era VARCHAR(500), causando
-- que la sincronización fallara con partidas de descripción larga (caso real:
-- 1022 caracteres en un concepto de demolición de concreto reforzado).

ALTER TABLE "presupuestos_asignados" ALTER COLUMN "descripcion" TYPE TEXT;
