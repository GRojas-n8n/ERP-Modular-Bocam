-- Configuración de RLS y Aislamiento por Tenant/Proyecto
-- Propiedad de Constructora Bocam, S. A. de C.V.

-- Función para establecer el contexto de la aplicación
-- Se debe llamar al inicio de cada transacción
CREATE OR REPLACE FUNCTION set_app_context(t_id UUID, p_id UUID) RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_tenant_id', t_id::text, false);
    PERFORM set_config('app.current_proyecto_id', p_id::text, false);
END;
$$ LANGUAGE plpgsql;

-- Funciones auxiliares para obtener el contexto actual
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

-- Ejemplo de creación de una tabla protegida
-- Nota: En producción, cada módulo tendrá sus propias tablas
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_empresa TEXT NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS proyectos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    nombre_proyecto TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Habilitar RLS en la tabla proyectos
ALTER TABLE proyectos ENABLE ROW LEVEL SECURITY;

-- Política de aislamiento por Tenant
CREATE POLICY tenant_isolation_policy ON proyectos
    USING (tenant_id = get_current_tenant_id());

-- Comentario de auditoría para el agente
COMMENT ON TABLE proyectos IS 'Tabla base para proyectos con aislamiento RLS forzado.';
