-- Trigger de inmutabilidad para cuadros_comparativos en estado LOCKED
-- Este trigger actúa como failsafe: incluso si el backend omite la validación,
-- el motor de BD rechaza cualquier UPDATE o DELETE sobre un cuadro LOCKED.
--
-- Para deshabilitar temporalmente en migraciones futuras:
--   ALTER TABLE cuadros_comparativos DISABLE TRIGGER trg_comparativa_locked;
--   -- ejecutar la migración --
--   ALTER TABLE cuadros_comparativos ENABLE TRIGGER trg_comparativa_locked;

CREATE OR REPLACE FUNCTION fn_prevent_locked_comparativa_modification()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.estado = 'LOCKED' THEN
    RAISE EXCEPTION 'cannot_modify_locked_comparativa: cuadro % está LOCKED', OLD.id_cuadro;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_comparativa_locked ON cuadros_comparativos;

CREATE TRIGGER trg_comparativa_locked
  BEFORE UPDATE OR DELETE ON cuadros_comparativos
  FOR EACH ROW EXECUTE FUNCTION fn_prevent_locked_comparativa_modification();
