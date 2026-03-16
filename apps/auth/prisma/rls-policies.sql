-- =============================================================================
-- Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
-- Módulo: Auth (IAM) — Políticas de Seguridad a Nivel de Fila (RLS)
--
-- PROPÓSITO:
-- Garantizar que un usuario de un tenant NUNCA pueda ver datos de otro tenant,
-- incluso si hay un bug en la capa de aplicación. PostgreSQL rechazará la query.
--
-- NOTA: Las tablas están en el schema 'auth' (soberanía de datos por módulo).
-- =============================================================================

-- 1. Habilitar RLS en todas las tablas
ALTER TABLE auth.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.user_project_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

-- 2. Forzar RLS incluso para el dueño de la tabla (seguridad extra)
ALTER TABLE auth.tenants FORCE ROW LEVEL SECURITY;
ALTER TABLE auth.proyectos FORCE ROW LEVEL SECURITY;
ALTER TABLE auth.users FORCE ROW LEVEL SECURITY;
ALTER TABLE auth.user_project_access FORCE ROW LEVEL SECURITY;
ALTER TABLE auth.refresh_tokens FORCE ROW LEVEL SECURITY;

-- =============================================================================
-- POLÍTICAS POR TABLA
-- =============================================================================

-- --- TENANTS ---
-- Un usuario solo puede ver su propio tenant
CREATE POLICY tenant_isolation_select ON auth.tenants
  FOR SELECT USING (
    id_tenant::text = current_setting('app.current_tenant_id', true)
  );

CREATE POLICY tenant_isolation_insert ON auth.tenants
  FOR INSERT WITH CHECK (
    id_tenant::text = current_setting('app.current_tenant_id', true)
  );

CREATE POLICY tenant_isolation_update ON auth.tenants
  FOR UPDATE USING (
    id_tenant::text = current_setting('app.current_tenant_id', true)
  );

-- --- PROYECTOS ---
CREATE POLICY proyecto_isolation_select ON auth.proyectos
  FOR SELECT USING (
    tenant_id::text = current_setting('app.current_tenant_id', true)
  );

CREATE POLICY proyecto_isolation_insert ON auth.proyectos
  FOR INSERT WITH CHECK (
    tenant_id::text = current_setting('app.current_tenant_id', true)
  );

CREATE POLICY proyecto_isolation_update ON auth.proyectos
  FOR UPDATE USING (
    tenant_id::text = current_setting('app.current_tenant_id', true)
  );

-- --- USERS ---
CREATE POLICY user_isolation_select ON auth.users
  FOR SELECT USING (
    tenant_id::text = current_setting('app.current_tenant_id', true)
  );

CREATE POLICY user_isolation_insert ON auth.users
  FOR INSERT WITH CHECK (
    tenant_id::text = current_setting('app.current_tenant_id', true)
  );

CREATE POLICY user_isolation_update ON auth.users
  FOR UPDATE USING (
    tenant_id::text = current_setting('app.current_tenant_id', true)
  );

-- --- USER_PROJECT_ACCESS ---
-- Filtrar por el usuario actual (el join a users ya filtra por tenant)
CREATE POLICY upa_isolation_select ON auth.user_project_access
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id_usuario = user_project_access.user_id
        AND u.tenant_id::text = current_setting('app.current_tenant_id', true)
    )
  );

CREATE POLICY upa_isolation_insert ON auth.user_project_access
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id_usuario = user_project_access.user_id
        AND u.tenant_id::text = current_setting('app.current_tenant_id', true)
    )
  );

-- --- REFRESH_TOKENS ---
-- Filtrar tokens por usuario del tenant actual
CREATE POLICY rt_isolation_select ON auth.refresh_tokens
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id_usuario = refresh_tokens.user_id
        AND u.tenant_id::text = current_setting('app.current_tenant_id', true)
    )
  );

CREATE POLICY rt_isolation_insert ON auth.refresh_tokens
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id_usuario = refresh_tokens.user_id
        AND u.tenant_id::text = current_setting('app.current_tenant_id', true)
    )
  );

CREATE POLICY rt_isolation_delete ON auth.refresh_tokens
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id_usuario = refresh_tokens.user_id
        AND u.tenant_id::text = current_setting('app.current_tenant_id', true)
    )
  );

-- =============================================================================
-- NOTA: Estas políticas aplican sobre el user de PostgreSQL que use Prisma.
-- El servicio de Auth inyecta set_config('app.current_tenant_id', ...) 
-- ANTES de cada operación para activar el filtrado automático.
-- =============================================================================
