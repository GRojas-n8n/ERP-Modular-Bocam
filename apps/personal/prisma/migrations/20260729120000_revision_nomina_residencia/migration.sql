-- Migration: revision-nomina-residencia
-- Ver specs/features/01-revision-nomina-residencia.md (D2)
-- Agrega el prerequisito de revisión de Residencia antes de que RH pueda
-- autorizar el pago de una pre-nómina o de un complemento salarial.

ALTER TABLE "pre_nominas"
  ADD COLUMN "revisado_por_residencia" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "revisado_at" TIMESTAMP(3),
  ADD COLUMN "revisado_por_usuario_id" UUID;

ALTER TABLE "nominas_complementarias"
  ADD COLUMN "revisado_por_residencia" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "revisado_at" TIMESTAMP(3),
  ADD COLUMN "revisado_por_usuario_id" UUID;
