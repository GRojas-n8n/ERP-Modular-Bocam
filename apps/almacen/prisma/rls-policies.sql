-- ---------------------------------------------------------------------------
-- Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
-- Clasificación: Estrictamente Confidencial.
-- ---------------------------------------------------------------------------
-- Módulo: Almacén (Inventario y Movimientos)
-- Script: Políticas RLS (Row-Level Security)
--
-- HISTORIA: almacen quedó explícitamente sin RLS en 2026-07-11
-- (fix-rls-bypass-bocam-admin, "higiene: solo ownership + cambio de rol").
-- Este script la cierra (fix-rls-almacen-tablas-sin-cobertura, 2026-07-27),
-- motivado por un IDOR real: PATCH /api/v1/almacen/inventario/:id
-- (apps/almacen/src/main.ts) actualizaba un ItemInventario solo por PK, sin
-- verificar tenant_id/proyecto_id, y devolvía la fila completa actualizada —
-- lee y corrompe un ítem de inventario de otro tenant en una sola petición.
--
-- Convención: misma que apps/contabilidad/prisma/rls-policies.sql —
-- current_tenant_id()/current_proyecto_id() con cuerpo plpgsql que falla
-- cerrado (RETURN NULL) si el GUC no está seteado o no es un UUID válido.
-- ---------------------------------------------------------------------------

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. FUNCIONES AUXILIARES DE CONTEXTO (idempotentes)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION current_tenant_id() RETURNS UUID AS $$
BEGIN
    RETURN current_setting('app.current_tenant_id', true)::UUID;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION current_proyecto_id() RETURNS UUID AS $$
BEGIN
    RETURN current_setting('app.current_proyecto_id', true)::UUID;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. HABILITAR Y FORZAR RLS
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE inventario_almacen ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventario_almacen FORCE ROW LEVEL SECURITY;

ALTER TABLE movimientos_almacen ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_almacen FORCE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. POLÍTICAS DE AISLAMIENTO
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── ITEMS DE INVENTARIO (tenant + proyecto) ────────────────────────────────
-- Stock físico por sitio de obra. La unicidad de `clave` ya se valida por
-- proyecto en el código (main.ts: "Ya existe un ítem con clave X en este
-- proyecto").
DROP POLICY IF EXISTS rls_inventario_almacen_context ON inventario_almacen;
CREATE POLICY rls_inventario_almacen_context ON inventario_almacen
    FOR ALL
    USING (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id())
    WITH CHECK (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id());

-- ─── MOVIMIENTOS DE ALMACÉN (tenant + proyecto) ─────────────────────────────
DROP POLICY IF EXISTS rls_movimientos_almacen_context ON movimientos_almacen;
CREATE POLICY rls_movimientos_almacen_context ON movimientos_almacen
    FOR ALL
    USING (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id())
    WITH CHECK (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id());

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. COMENTARIOS DE AUDITORÍA
-- ═══════════════════════════════════════════════════════════════════════════

COMMENT ON POLICY rls_inventario_almacen_context ON inventario_almacen IS
    'Aislamiento Multi-Tenant + Multi-Proyecto. Módulo: Almacén.';
COMMENT ON POLICY rls_movimientos_almacen_context ON movimientos_almacen IS
    'Aislamiento Multi-Tenant + Multi-Proyecto. Módulo: Almacén.';
