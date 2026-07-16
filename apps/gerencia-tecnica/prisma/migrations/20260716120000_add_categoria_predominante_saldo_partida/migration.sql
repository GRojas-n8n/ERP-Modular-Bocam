-- Migration: add_categoria_predominante_saldo_partida
-- Ver openspec/changes/unificar-presupuesto-a-partidas-gt.
-- Persiste el tipo de insumo predominante del APU en SaldoPartida (antes solo
-- se calculaba al vuelo en el reporte de control presupuestal), para incluirlo
-- en el evento gerencia_tecnica.saldo_partida_creado que consume Finanzas.

ALTER TABLE "saldo_partidas"
  ADD COLUMN IF NOT EXISTS "categoria_predominante" VARCHAR(20);
