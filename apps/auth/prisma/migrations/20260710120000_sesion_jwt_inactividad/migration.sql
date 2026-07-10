-- Migration: sesion_jwt_inactividad
-- Ver openspec/changes/sesion-jwt-inactividad.
-- Agrega sesion_iniciada_en a refresh_tokens: momento del login original de
-- la cadena de sesion, propagado sin resetear en cada rotacion, para poder
-- imponer un limite absoluto de duracion de sesion. Puramente aditiva.

ALTER TABLE "refresh_tokens"
  ADD COLUMN IF NOT EXISTS "sesion_iniciada_en" TIMESTAMP(3);
