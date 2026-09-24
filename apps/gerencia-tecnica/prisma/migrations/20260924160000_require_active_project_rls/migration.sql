-- Gerencia Técnica es una interfaz operativa por centro de costos.
-- La ausencia de proyecto deja de ampliar las lecturas a todo el tenant.

SET search_path TO gerencia_tecnica, public;

DROP POLICY IF EXISTS rls_insumos_context ON insumos;
CREATE POLICY rls_insumos_context ON insumos
    FOR ALL
    USING (
        tenant_id = get_current_tenant_id()
        AND proyecto_id = get_current_proyecto_id()
    )
    WITH CHECK (
        tenant_id = get_current_tenant_id()
        AND proyecto_id = get_current_proyecto_id()
    );

DROP POLICY IF EXISTS rls_presupuestos_tenant ON presupuestos_base;
CREATE POLICY rls_presupuestos_tenant ON presupuestos_base
    FOR ALL
    USING (
        tenant_id = get_current_tenant_id()
        AND proyecto_id = get_current_proyecto_id()
    )
    WITH CHECK (
        tenant_id = get_current_tenant_id()
        AND proyecto_id = get_current_proyecto_id()
    );

DROP POLICY IF EXISTS rls_conceptos_tenant ON conceptos;
CREATE POLICY rls_conceptos_tenant ON conceptos
    FOR ALL
    USING (
        tenant_id = get_current_tenant_id()
        AND proyecto_id = get_current_proyecto_id()
    )
    WITH CHECK (
        tenant_id = get_current_tenant_id()
        AND proyecto_id = get_current_proyecto_id()
    );

COMMENT ON POLICY rls_insumos_context ON insumos IS
    'Aislamiento Multi-Tenant + Multi-Proyecto estricto. Módulo: Gerencia Técnica.';
