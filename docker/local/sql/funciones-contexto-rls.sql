-- Funciones de contexto RLS que existen en las bases del VPS pero que ninguna
-- migración crea (las migraciones de calidad y personal fallan sin ellas en
-- una base vacía). Definición tomada de .devcontainer/init-db/01-rls-setup.sql
-- (solo las funciones, sin su tabla de ejemplo). Idempotente.
-- iretum-local.ps1 la aplica en cada base ANTES de las migraciones.

CREATE OR REPLACE FUNCTION set_app_context(t_id UUID, p_id UUID) RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_tenant_id', t_id::text, false);
    PERFORM set_config('app.current_proyecto_id', p_id::text, false);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_current_tenant_id() RETURNS UUID AS $$
BEGIN
    RETURN current_setting('app.current_tenant_id', true)::UUID;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_current_proyecto_id() RETURNS UUID AS $$
BEGIN
    RETURN current_setting('app.current_proyecto_id', true)::UUID;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
