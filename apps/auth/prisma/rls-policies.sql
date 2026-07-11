-- =============================================================================
-- Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
-- Módulo: Auth (IAM) — Políticas de Seguridad a Nivel de Fila (RLS)
--
-- PROPÓSITO:
-- Garantizar que un usuario de un tenant NUNCA pueda ver datos de otro tenant,
-- incluso si hay un bug en la capa de aplicación. PostgreSQL rechazará la query.
--
-- NOTA: Las tablas viven en el schema 'public' (verificado contra producción
-- 2026-07-11 — no existe un schema 'auth' separado, a diferencia de lo que
-- decía este comentario originalmente).
-- =============================================================================

-- 1. Habilitar RLS en todas las tablas
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_project_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;

-- 2. Forzar RLS incluso para el dueño de la tabla (seguridad extra)
ALTER TABLE tenants FORCE ROW LEVEL SECURITY;
ALTER TABLE proyectos FORCE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;
ALTER TABLE user_project_access FORCE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens FORCE ROW LEVEL SECURITY;

-- =============================================================================
-- POLÍTICAS POR TABLA
-- =============================================================================

-- --- TENANTS ---
-- Un usuario solo puede ver su propio tenant
CREATE POLICY tenant_isolation_select ON tenants
  FOR SELECT USING (
    id_tenant::text = current_setting('app.current_tenant_id', true)
  );

CREATE POLICY tenant_isolation_insert ON tenants
  FOR INSERT WITH CHECK (
    id_tenant::text = current_setting('app.current_tenant_id', true)
  );

CREATE POLICY tenant_isolation_update ON tenants
  FOR UPDATE USING (
    id_tenant::text = current_setting('app.current_tenant_id', true)
  );

-- --- PROYECTOS ---
CREATE POLICY proyecto_isolation_select ON proyectos
  FOR SELECT USING (
    tenant_id::text = current_setting('app.current_tenant_id', true)
  );

CREATE POLICY proyecto_isolation_insert ON proyectos
  FOR INSERT WITH CHECK (
    tenant_id::text = current_setting('app.current_tenant_id', true)
  );

CREATE POLICY proyecto_isolation_update ON proyectos
  FOR UPDATE USING (
    tenant_id::text = current_setting('app.current_tenant_id', true)
  );

-- --- USERS ---
CREATE POLICY user_isolation_select ON users
  FOR SELECT USING (
    tenant_id::text = current_setting('app.current_tenant_id', true)
  );

CREATE POLICY user_isolation_insert ON users
  FOR INSERT WITH CHECK (
    tenant_id::text = current_setting('app.current_tenant_id', true)
  );

CREATE POLICY user_isolation_update ON users
  FOR UPDATE USING (
    tenant_id::text = current_setting('app.current_tenant_id', true)
  );

-- --- USER_PROJECT_ACCESS ---
-- Filtrar por el usuario actual (el join a users ya filtra por tenant)
CREATE POLICY upa_isolation_select ON user_project_access
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id_usuario = user_project_access.user_id
        AND u.tenant_id::text = current_setting('app.current_tenant_id', true)
    )
  );

CREATE POLICY upa_isolation_insert ON user_project_access
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id_usuario = user_project_access.user_id
        AND u.tenant_id::text = current_setting('app.current_tenant_id', true)
    )
  );

-- Falta en el script original: sin esta policy, DELETE bajo FORCE RLS
-- afecta 0 filas sin error. apps/auth/src/main.ts:827 hace
-- `userProjectAccess.deleteMany({ where: { user_id: id } })` al
-- resincronizar los proyectos asignados a un usuario — sin esta policy
-- quedarían asignaciones obsoletas/duplicadas.
CREATE POLICY upa_isolation_delete ON user_project_access
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id_usuario = user_project_access.user_id
        AND u.tenant_id::text = current_setting('app.current_tenant_id', true)
    )
  );

-- --- REFRESH_TOKENS ---
-- Filtrar tokens por usuario del tenant actual
CREATE POLICY rt_isolation_select ON refresh_tokens
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id_usuario = refresh_tokens.user_id
        AND u.tenant_id::text = current_setting('app.current_tenant_id', true)
    )
  );

CREATE POLICY rt_isolation_insert ON refresh_tokens
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id_usuario = refresh_tokens.user_id
        AND u.tenant_id::text = current_setting('app.current_tenant_id', true)
    )
  );

-- Falta en el script original: sin esta policy, UPDATE bajo FORCE RLS
-- afecta 0 filas sin error. apps/auth/src/main.ts:511 hace
-- `refreshToken.update({ data: { revoked: true } })` para revocar SIEMPRE
-- el token usado en cada refresh — sin esta policy el token nunca quedaría
-- marcado como revocado, permitiendo reutilizarlo (regresión de seguridad).
CREATE POLICY rt_isolation_update ON refresh_tokens
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id_usuario = refresh_tokens.user_id
        AND u.tenant_id::text = current_setting('app.current_tenant_id', true)
    )
  );

CREATE POLICY rt_isolation_delete ON refresh_tokens
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id_usuario = refresh_tokens.user_id
        AND u.tenant_id::text = current_setting('app.current_tenant_id', true)
    )
  );

-- =============================================================================
-- NOTA: Estas políticas aplican sobre el user de PostgreSQL que use Prisma.
-- El servicio de Auth inyecta set_config('app.current_tenant_id', ...) 
-- ANTES de cada operación para activar el filtrado automático.
-- =============================================================================
