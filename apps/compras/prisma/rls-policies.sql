-- -----------------------------------------------------------------------------
-- Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
-- Módulo: Compras (Procuración)
-- Script: Configuración de Row-Level Security (RLS)
-- -----------------------------------------------------------------------------

-- 1. Habilitar RLS en las tablas del módulo
ALTER TABLE "proveedores" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "proveedores" FORCE ROW LEVEL SECURITY;

ALTER TABLE "requisiciones" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "requisiciones" FORCE ROW LEVEL SECURITY;

ALTER TABLE "requisiciones_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "requisiciones_items" FORCE ROW LEVEL SECURITY;

ALTER TABLE "ordenes_compra" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ordenes_compra" FORCE ROW LEVEL SECURITY;

ALTER TABLE "ordenes_compra_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ordenes_compra_items" FORCE ROW LEVEL SECURITY;

-- 2. Función auxiliar para obtener el tenant_id del contexto (si no existe)
-- Nota: En un entorno compartido, esta función se crea una sola vez en el esquema public o por módulo.
CREATE OR REPLACE FUNCTION current_tenant_id() RETURNS UUID AS $$
    SELECT current_setting('app.current_tenant_id', true)::UUID;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION current_proyecto_id() RETURNS UUID AS $$
    SELECT current_setting('app.current_proyecto_id', true)::UUID;
$$ LANGUAGE sql STABLE;

-- 3. Políticas para PROVEEDORES
-- Nota: Proveedores solo filtran por tenant_id (son compartidos entre proyectos del mismo tenant)
DROP POLICY IF EXISTS rls_proveedores_tenant ON "proveedores";
CREATE POLICY rls_proveedores_tenant ON "proveedores"
    USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

-- 4. Políticas para REQUISICIONES
-- Filtran por tenant_id Y proyecto_id (Aislamiento por Centro de Costos)
DROP POLICY IF EXISTS rls_requisiciones_context ON "requisiciones";
CREATE POLICY rls_requisiciones_context ON "requisiciones"
    USING (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id())
    WITH CHECK (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id());

-- 5. Políticas para REQUISICIONES ITEMS
DROP POLICY IF EXISTS rls_requisiciones_items_context ON "requisiciones_items";
CREATE POLICY rls_requisiciones_items_context ON "requisiciones_items"
    USING (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id())
    WITH CHECK (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id());

-- 6. Políticas para ÓRDENES DE COMPRA
DROP POLICY IF EXISTS rls_ordenes_compra_context ON "ordenes_compra";
CREATE POLICY rls_ordenes_compra_context ON "ordenes_compra"
    USING (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id())
    WITH CHECK (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id());

-- 7. Políticas para ÓRDENES DE COMPRA ITEMS
DROP POLICY IF EXISTS rls_ordenes_compra_items_context ON "ordenes_compra_items";
CREATE POLICY rls_ordenes_compra_items_context ON "ordenes_compra_items"
    USING (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id())
    WITH CHECK (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id());

-- 8. Comentarios de Auditoría
COMMENT ON POLICY rls_proveedores_tenant ON "proveedores" IS 'Aisla proveedores por constructora (Tenant)';
COMMENT ON POLICY rls_requisiciones_context ON "requisiciones" IS 'Aisla requisiciones por constructora y centro de costos';
COMMENT ON POLICY rls_ordenes_compra_context ON "ordenes_compra" IS 'Aisla OC por constructora y centro de costos';

-- 8. Políticas para CUADROS COMPARATIVOS
DROP POLICY IF EXISTS rls_cuadros_comparativos_context ON "cuadros_comparativos";
CREATE POLICY rls_cuadros_comparativos_context ON "cuadros_comparativos"
    USING (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id())
    WITH CHECK (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id());

-- 9. Políticas para COMPARATIVAS DETALLES
DROP POLICY IF EXISTS rls_comparativas_detalles_context ON "comparativas_detalles";
CREATE POLICY rls_comparativas_detalles_context ON "comparativas_detalles"
    USING (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id())
    WITH CHECK (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id());

COMMENT ON POLICY rls_cuadros_comparativos_context ON "cuadros_comparativos" IS 'Aisla cuadros comparativos por constructora y centro de costos';
