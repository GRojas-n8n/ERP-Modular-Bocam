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

-- Tabla: insumos (Maestra — aislamiento por tenant_id + proyecto_id, con
-- fallback de consolidación tenant-wide para roles sin proyecto activo —
-- ver aislamiento-insumos-por-proyecto-gt)
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
-- Aislamiento por tenant. Si hay proyecto en contexto, también filtra por
-- proyecto (roles de nivel-proyecto siempre lo tienen). Sin proyecto en
-- contexto (admin/superintendent), consolida todo el tenant — mismo patrón
-- que presupuestos_base/conceptos.
DROP POLICY IF EXISTS rls_insumos_tenant ON insumos;
DROP POLICY IF EXISTS rls_insumos_context ON insumos;
CREATE POLICY rls_insumos_context ON insumos
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

COMMENT ON POLICY rls_insumos_context ON insumos IS
    'Aislamiento Multi-Tenant + Multi-Proyecto, con fallback de consolidación para roles sin proyecto activo. Módulo: Gerencia Técnica.';
COMMENT ON POLICY rls_presupuestos_tenant ON presupuestos_base IS
    'Aislamiento Multi-Tenant + Multi-Proyecto. Módulo: Gerencia Técnica.';
COMMENT ON POLICY rls_conceptos_tenant ON conceptos IS
    'Aislamiento Multi-Tenant + Multi-Proyecto (hereda de presupuesto). Módulo: Gerencia Técnica.';

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. TABLAS AGREGADAS DESPUÉS DE 2026-07-11 SIN RLS (fix-rls-gerencia-tecnica-
-- tablas-sin-cobertura, 2026-07-26). A diferencia de las 3 tablas de arriba,
-- estas políticas usan AND estricto (sin el fallback "OR ... IS NULL") — el
-- código actual siempre pasa proyecto_id a createTenantContext(), así que el
-- fallback no aplica y no debe replicarse aquí.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── CATEGORÍAS DE GASTO (tenant + proyecto) ────────────────────────────────
ALTER TABLE categorias_gasto ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_gasto FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rls_categorias_gasto_context ON categorias_gasto;
CREATE POLICY rls_categorias_gasto_context ON categorias_gasto
    FOR ALL
    USING (tenant_id = get_current_tenant_id() AND proyecto_id = get_current_proyecto_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND proyecto_id = get_current_proyecto_id());

-- ─── CONFIGURACIÓN DE COSTOS POR PROYECTO (tenant + proyecto) ───────────────
ALTER TABLE proyecto_costos_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyecto_costos_config FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rls_proyecto_costos_config_context ON proyecto_costos_config;
CREATE POLICY rls_proyecto_costos_config_context ON proyecto_costos_config
    FOR ALL
    USING (tenant_id = get_current_tenant_id() AND proyecto_id = get_current_proyecto_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND proyecto_id = get_current_proyecto_id());

-- ─── COMPOSICIÓN APU CONCEPTO×INSUMO (tenant + proyecto) ────────────────────
ALTER TABLE concepto_insumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE concepto_insumos FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rls_concepto_insumos_context ON concepto_insumos;
CREATE POLICY rls_concepto_insumos_context ON concepto_insumos
    FOR ALL
    USING (tenant_id = get_current_tenant_id() AND proyecto_id = get_current_proyecto_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND proyecto_id = get_current_proyecto_id());

-- ─── SALDO POR PARTIDA (tenant + proyecto) ──────────────────────────────────
ALTER TABLE saldo_partidas ENABLE ROW LEVEL SECURITY;
ALTER TABLE saldo_partidas FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rls_saldo_partidas_context ON saldo_partidas;
CREATE POLICY rls_saldo_partidas_context ON saldo_partidas
    FOR ALL
    USING (tenant_id = get_current_tenant_id() AND proyecto_id = get_current_proyecto_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND proyecto_id = get_current_proyecto_id());

-- ─── PROYECCIÓN DE COMPRAS (tenant + proyecto) ──────────────────────────────
ALTER TABLE compras_proyectadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE compras_proyectadas FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rls_compras_proyectadas_context ON compras_proyectadas;
CREATE POLICY rls_compras_proyectadas_context ON compras_proyectadas
    FOR ALL
    USING (tenant_id = get_current_tenant_id() AND proyecto_id = get_current_proyecto_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND proyecto_id = get_current_proyecto_id());

-- ─── FICHAS TÉCNICAS DE INSUMO (solo tenant — cuelga de insumos, compartido
-- entre proyectos; no tiene columna proyecto_id propia) ─────────────────────
ALTER TABLE fichas_tecnicas_insumo ENABLE ROW LEVEL SECURITY;
ALTER TABLE fichas_tecnicas_insumo FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rls_fichas_tecnicas_insumo_tenant ON fichas_tecnicas_insumo;
CREATE POLICY rls_fichas_tecnicas_insumo_tenant ON fichas_tecnicas_insumo
    FOR ALL
    USING (tenant_id = get_current_tenant_id())
    WITH CHECK (tenant_id = get_current_tenant_id());

-- ─── AUDIT TRAIL DE SALDO (solo tenant — no tiene columna proyecto_id
-- propia, cuelga de SaldoPartida vía saldo_partida_id) ───────────────────────
ALTER TABLE saldo_movimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE saldo_movimientos FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rls_saldo_movimientos_tenant ON saldo_movimientos;
CREATE POLICY rls_saldo_movimientos_tenant ON saldo_movimientos
    FOR ALL
    USING (tenant_id = get_current_tenant_id())
    WITH CHECK (tenant_id = get_current_tenant_id());

-- ─── TRANSFERENCIAS ENTRE PARTIDAS (solo tenant — tiene proyecto_origen_id Y
-- proyecto_destino_id, una transferencia legítimamente cruza 2 proyectos del
-- mismo tenant, no tiene un único proyecto_id propio que filtrar) ───────────
ALTER TABLE transferencia_partidas ENABLE ROW LEVEL SECURITY;
ALTER TABLE transferencia_partidas FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rls_transferencia_partidas_tenant ON transferencia_partidas;
CREATE POLICY rls_transferencia_partidas_tenant ON transferencia_partidas
    FOR ALL
    USING (tenant_id = get_current_tenant_id())
    WITH CHECK (tenant_id = get_current_tenant_id());

-- ─── VÍNCULO PROYECTO↔COTIZACIÓN DE VENTAS (solo tenant — SÍ tiene columna
-- proyecto_id, pero el código la trata como catálogo tenant-wide: GET
-- /trazabilidad/vinculos-obra lista todos los proyectos vinculados del
-- tenant sin acotar al proyecto "actual" de la sesión; una política
-- tenant+proyecto rompería ese listado) ──────────────────────────────────────
ALTER TABLE proyectos_obra_vinculados ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyectos_obra_vinculados FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rls_proyectos_obra_vinculados_tenant ON proyectos_obra_vinculados;
CREATE POLICY rls_proyectos_obra_vinculados_tenant ON proyectos_obra_vinculados
    FOR ALL
    USING (tenant_id = get_current_tenant_id())
    WITH CHECK (tenant_id = get_current_tenant_id());

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. TABLAS AGREGADAS POR wbs-jerarquico-conceptos (2026-08-06)
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── CAPÍTULOS (tenant + proyecto — cuelga de presupuestos_base, mismo
-- patrón estricto que categorias_gasto/concepto_insumos: el código siempre
-- pasa proyecto_id a createTenantContext() en los endpoints que tocan esta
-- tabla) ──────────────────────────────────────────────────────────────────
ALTER TABLE capitulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE capitulos FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rls_capitulos_context ON capitulos;
CREATE POLICY rls_capitulos_context ON capitulos
    FOR ALL
    USING (tenant_id = get_current_tenant_id() AND proyecto_id = get_current_proyecto_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND proyecto_id = get_current_proyecto_id());

-- ─── CATÁLOGO MAESTRO DE CONCEPTOS (solo tenant — reutilizable entre
-- proyectos del mismo tenant, mismo patrón que insumos) ─────────────────────
ALTER TABLE conceptos_catalogo ENABLE ROW LEVEL SECURITY;
ALTER TABLE conceptos_catalogo FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rls_conceptos_catalogo_tenant ON conceptos_catalogo;
CREATE POLICY rls_conceptos_catalogo_tenant ON conceptos_catalogo
    FOR ALL
    USING (tenant_id = get_current_tenant_id())
    WITH CHECK (tenant_id = get_current_tenant_id());

COMMENT ON POLICY rls_capitulos_context ON capitulos IS
    'Aislamiento Multi-Tenant + Multi-Proyecto (hereda de presupuesto). Módulo: Gerencia Técnica.';
COMMENT ON POLICY rls_conceptos_catalogo_tenant ON conceptos_catalogo IS
    'Aislamiento Multi-Tenant. Catálogo maestro reutilizable entre proyectos del tenant. Módulo: Gerencia Técnica.';
