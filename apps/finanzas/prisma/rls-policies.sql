-- =============================================================================
-- Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
-- Módulo: Finanzas (Tesorería y Flujo de Caja) — Políticas RLS
--
-- PROPÓSITO:
-- Garantizar aislamiento total entre tenants y entre proyectos/centros de
-- costos. PostgreSQL rechazará cualquier query que no coincida con el
-- contexto de sesión, incluso si hay un bug en la capa de aplicación.
--
-- NOTA: Las tablas están en el schema 'finanzas' (soberanía de datos).
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. CREAR SCHEMA SEPARADO (si no existe)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE SCHEMA IF NOT EXISTS finanzas;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. FUNCIONES AUXILIARES (idempotentes)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION finanzas.current_tenant_id() RETURNS UUID AS $$
    SELECT current_setting('app.current_tenant_id', true)::UUID;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION finanzas.current_proyecto_id() RETURNS UUID AS $$
    SELECT current_setting('app.current_proyecto_id', true)::UUID;
$$ LANGUAGE sql STABLE;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. HABILITAR Y FORZAR RLS EN TODAS LAS TABLAS
-- ─────────────────────────────────────────────────────────────────────────────

-- Presupuestos Asignados
ALTER TABLE finanzas.presupuestos_asignados ENABLE ROW LEVEL SECURITY;
ALTER TABLE finanzas.presupuestos_asignados FORCE ROW LEVEL SECURITY;

-- Movimientos Presupuestales
ALTER TABLE finanzas.movimientos_presupuestales ENABLE ROW LEVEL SECURITY;
ALTER TABLE finanzas.movimientos_presupuestales FORCE ROW LEVEL SECURITY;

-- Programa de Pagos
ALTER TABLE finanzas.programa_pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE finanzas.programa_pagos FORCE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. POLÍTICAS: PRESUPUESTOS ASIGNADOS
-- Filtro doble: tenant_id + proyecto_id (Centro de Costos)
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS rls_presupuestos_select ON finanzas.presupuestos_asignados;
CREATE POLICY rls_presupuestos_select ON finanzas.presupuestos_asignados
    FOR SELECT USING (
        tenant_id = finanzas.current_tenant_id()
        AND proyecto_id = finanzas.current_proyecto_id()
    );

DROP POLICY IF EXISTS rls_presupuestos_insert ON finanzas.presupuestos_asignados;
CREATE POLICY rls_presupuestos_insert ON finanzas.presupuestos_asignados
    FOR INSERT WITH CHECK (
        tenant_id = finanzas.current_tenant_id()
        AND proyecto_id = finanzas.current_proyecto_id()
    );

DROP POLICY IF EXISTS rls_presupuestos_update ON finanzas.presupuestos_asignados;
CREATE POLICY rls_presupuestos_update ON finanzas.presupuestos_asignados
    FOR UPDATE USING (
        tenant_id = finanzas.current_tenant_id()
        AND proyecto_id = finanzas.current_proyecto_id()
    );

DROP POLICY IF EXISTS rls_presupuestos_delete ON finanzas.presupuestos_asignados;
CREATE POLICY rls_presupuestos_delete ON finanzas.presupuestos_asignados
    FOR DELETE USING (
        tenant_id = finanzas.current_tenant_id()
        AND proyecto_id = finanzas.current_proyecto_id()
    );

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. POLÍTICAS: MOVIMIENTOS PRESUPUESTALES
-- Filtro doble: tenant_id + proyecto_id
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS rls_movimientos_select ON finanzas.movimientos_presupuestales;
CREATE POLICY rls_movimientos_select ON finanzas.movimientos_presupuestales
    FOR SELECT USING (
        tenant_id = finanzas.current_tenant_id()
        AND proyecto_id = finanzas.current_proyecto_id()
    );

DROP POLICY IF EXISTS rls_movimientos_insert ON finanzas.movimientos_presupuestales;
CREATE POLICY rls_movimientos_insert ON finanzas.movimientos_presupuestales
    FOR INSERT WITH CHECK (
        tenant_id = finanzas.current_tenant_id()
        AND proyecto_id = finanzas.current_proyecto_id()
    );

-- Movimientos son INMUTABLES (Event-Sourcing). NO se permite UPDATE ni DELETE.
-- Si se requiere corrección, se crea un movimiento inverso (CONTRAPARTIDA).

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. POLÍTICAS: PROGRAMA DE PAGOS
-- Filtro doble: tenant_id + proyecto_id
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS rls_pagos_select ON finanzas.programa_pagos;
CREATE POLICY rls_pagos_select ON finanzas.programa_pagos
    FOR SELECT USING (
        tenant_id = finanzas.current_tenant_id()
        AND proyecto_id = finanzas.current_proyecto_id()
    );

DROP POLICY IF EXISTS rls_pagos_insert ON finanzas.programa_pagos;
CREATE POLICY rls_pagos_insert ON finanzas.programa_pagos
    FOR INSERT WITH CHECK (
        tenant_id = finanzas.current_tenant_id()
        AND proyecto_id = finanzas.current_proyecto_id()
    );

DROP POLICY IF EXISTS rls_pagos_update ON finanzas.programa_pagos;
CREATE POLICY rls_pagos_update ON finanzas.programa_pagos
    FOR UPDATE USING (
        tenant_id = finanzas.current_tenant_id()
        AND proyecto_id = finanzas.current_proyecto_id()
    );

DROP POLICY IF EXISTS rls_pagos_delete ON finanzas.programa_pagos;
CREATE POLICY rls_pagos_delete ON finanzas.programa_pagos
    FOR DELETE USING (
        tenant_id = finanzas.current_tenant_id()
        AND proyecto_id = finanzas.current_proyecto_id()
    );

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. COMENTARIOS DE AUDITORÍA
-- ─────────────────────────────────────────────────────────────────────────────
COMMENT ON POLICY rls_presupuestos_select ON finanzas.presupuestos_asignados IS 'Aisla presupuestos por constructora y centro de costos';
COMMENT ON POLICY rls_movimientos_select ON finanzas.movimientos_presupuestales IS 'Aisla movimientos presupuestales por constructora y centro de costos';
COMMENT ON POLICY rls_pagos_select ON finanzas.programa_pagos IS 'Aisla programa de pagos por constructora y centro de costos';

-- =============================================================================
-- NOTA: El servicio de Finanzas inyecta set_config('app.current_tenant_id', ...)
-- y set_config('app.current_proyecto_id', ...) ANTES de cada operación para
-- activar el filtrado automático via el wrapper createTenantContext() en db.ts.
-- =============================================================================
