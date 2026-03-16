-- ---------------------------------------------------------------------------
-- Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
-- Clasificación: Estrictamente Confidencial.
-- ---------------------------------------------------------------------------
-- Módulo: Gerencia Técnica
-- Script: Políticas RLS (Row-Level Security) Post-Migración
--
-- INSTRUCCIONES:
-- Ejecutar este script DESPUÉS de cada `prisma migrate dev --create-only`
-- ya que Prisma no soporta RLS nativamente.
-- Comando: psql -U postgres -d bocam_erp -f rls-policies.sql
-- ---------------------------------------------------------------------------

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. FUNCIONES AUXILIARES DE CONTEXTO (Idempotentes)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_current_tenant_id() RETURNS UUID AS $$
BEGIN
    RETURN current_setting('app.current_tenant_id', true)::UUID;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION get_current_proyecto_id() RETURNS UUID AS $$
BEGIN
    RETURN current_setting('app.current_proyecto_id', true)::UUID;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. HABILITAR RLS EN TABLAS DEL MÓDULO
-- ═══════════════════════════════════════════════════════════════════════════

-- Tabla: insumos (Maestra — aislamiento por tenant_id)
ALTER TABLE insumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE insumos FORCE ROW LEVEL SECURITY;

-- Tabla: presupuestos_base (Transaccional — aislamiento por tenant_id + proyecto_id)
ALTER TABLE presupuestos_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE presupuestos_base FORCE ROW LEVEL SECURITY;

-- Tabla: conceptos (Transaccional hija — hereda aislamiento)
ALTER TABLE conceptos ENABLE ROW LEVEL SECURITY;
ALTER TABLE conceptos FORCE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. POLÍTICAS DE AISLAMIENTO
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── INSUMOS ────────────────────────────────────────────────────────────────
-- Solo lectura/escritura de insumos que pertenezcan al tenant actual.
DROP POLICY IF EXISTS rls_insumos_tenant ON insumos;
CREATE POLICY rls_insumos_tenant ON insumos
    FOR ALL
    USING (tenant_id = get_current_tenant_id())
    WITH CHECK (tenant_id = get_current_tenant_id());

-- ─── PRESUPUESTOS BASE ─────────────────────────────────────────────────────
-- Aislamiento por tenant. Si hay proyecto en contexto, también filtra por proyecto.
DROP POLICY IF EXISTS rls_presupuestos_tenant ON presupuestos_base;
CREATE POLICY rls_presupuestos_tenant ON presupuestos_base
    FOR ALL
    USING (
        tenant_id = get_current_tenant_id()
        AND (
            get_current_proyecto_id() IS NULL
            OR proyecto_id = get_current_proyecto_id()
        )
    )
    WITH CHECK (
        tenant_id = get_current_tenant_id()
        AND (
            get_current_proyecto_id() IS NULL
            OR proyecto_id = get_current_proyecto_id()
        )
    );

-- ─── CONCEPTOS ──────────────────────────────────────────────────────────────
-- Misma lógica que presupuestos (hereda el aislamiento del padre).
DROP POLICY IF EXISTS rls_conceptos_tenant ON conceptos;
CREATE POLICY rls_conceptos_tenant ON conceptos
    FOR ALL
    USING (
        tenant_id = get_current_tenant_id()
        AND (
            get_current_proyecto_id() IS NULL
            OR proyecto_id = get_current_proyecto_id()
        )
    )
    WITH CHECK (
        tenant_id = get_current_tenant_id()
        AND (
            get_current_proyecto_id() IS NULL
            OR proyecto_id = get_current_proyecto_id()
        )
    );

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. COMENTARIOS DE AUDITORÍA
-- ═══════════════════════════════════════════════════════════════════════════

COMMENT ON POLICY rls_insumos_tenant ON insumos IS
    'Aislamiento Multi-Tenant por tenant_id. Módulo: Gerencia Técnica.';
COMMENT ON POLICY rls_presupuestos_tenant ON presupuestos_base IS
    'Aislamiento Multi-Tenant + Multi-Proyecto. Módulo: Gerencia Técnica.';
COMMENT ON POLICY rls_conceptos_tenant ON conceptos IS
    'Aislamiento Multi-Tenant + Multi-Proyecto (hereda de presupuesto). Módulo: Gerencia Técnica.';
