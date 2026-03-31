-- =============================================================================
-- Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
-- Módulo: Control de Obra
-- Archivo: rls-policies.sql
--
-- Políticas de Row-Level Security para aislamiento Multi-Tenant y 
-- Multi-Proyecto. TODAS las tablas de este módulo están protegidas.
-- =============================================================================

-- 1. Habilitar RLS en todas las tablas del módulo
ALTER TABLE bitacoras_obra ENABLE ROW LEVEL SECURITY;
ALTER TABLE avances_fisicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimaciones ENABLE ROW LEVEL SECURITY;

-- 2. Forzar RLS incluso para el dueño de la tabla
ALTER TABLE bitacoras_obra FORCE ROW LEVEL SECURITY;
ALTER TABLE avances_fisicos FORCE ROW LEVEL SECURITY;
ALTER TABLE estimaciones FORCE ROW LEVEL SECURITY;

-- =============================================================================
-- POLÍTICAS: bitacoras_obra
-- =============================================================================
CREATE POLICY tenant_isolation_bitacoras ON bitacoras_obra
  USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY proyecto_isolation_bitacoras ON bitacoras_obra
  USING (proyecto_id::text = current_setting('app.current_proyecto_id', true));

-- =============================================================================
-- POLÍTICAS: avances_fisicos
-- =============================================================================
CREATE POLICY tenant_isolation_avances ON avances_fisicos
  USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY proyecto_isolation_avances ON avances_fisicos
  USING (proyecto_id::text = current_setting('app.current_proyecto_id', true));

-- =============================================================================
-- POLÍTICAS: estimaciones
-- =============================================================================
CREATE POLICY tenant_isolation_estimaciones ON estimaciones
  USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY proyecto_isolation_estimaciones ON estimaciones
  USING (proyecto_id::text = current_setting('app.current_proyecto_id', true));
