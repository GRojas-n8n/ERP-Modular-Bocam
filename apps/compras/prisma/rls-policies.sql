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
-- NOTA (fix-rls-compras-tablas-sin-cobertura, 2026-07-26): esta política ya
-- estaba declarada aquí, pero a la tabla nunca se le agregó ENABLE/FORCE ROW
-- LEVEL SECURITY — quedaba inerte en producción (relrowsecurity=false),
-- dejando una fuga cross-tenant activa porque el código de
-- cuadroComparativo.findUnique() en main.ts no filtra tenant_id por su cuenta.
ALTER TABLE "cuadros_comparativos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cuadros_comparativos" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rls_cuadros_comparativos_context ON "cuadros_comparativos";
CREATE POLICY rls_cuadros_comparativos_context ON "cuadros_comparativos"
    USING (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id())
    WITH CHECK (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id());

-- 9. Políticas para COMPARATIVAS DETALLES (mismo problema que cuadros_comparativos)
ALTER TABLE "comparativas_detalles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "comparativas_detalles" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rls_comparativas_detalles_context ON "comparativas_detalles";
CREATE POLICY rls_comparativas_detalles_context ON "comparativas_detalles"
    USING (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id())
    WITH CHECK (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id());

COMMENT ON POLICY rls_cuadros_comparativos_context ON "cuadros_comparativos" IS 'Aisla cuadros comparativos por constructora y centro de costos';

-- =============================================================================
-- 10. Tablas restantes sin cobertura, encontradas en la auditoría de
-- fix-rls-compras-tablas-sin-cobertura (2026-07-26). Nunca habían recibido
-- ENABLE ROW LEVEL SECURITY ni política — relrowsecurity=false en producción.
-- =============================================================================

-- Calificaciones de Proveedor (tenant + proyecto)
ALTER TABLE "calificaciones_proveedor" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "calificaciones_proveedor" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rls_calificaciones_proveedor_context ON "calificaciones_proveedor";
CREATE POLICY rls_calificaciones_proveedor_context ON "calificaciones_proveedor"
    USING (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id())
    WITH CHECK (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id());

-- Documentos de Proveedor (solo tenant — el proveedor se comparte entre proyectos)
ALTER TABLE "documentos_proveedor" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "documentos_proveedor" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rls_documentos_proveedor_tenant ON "documentos_proveedor";
CREATE POLICY rls_documentos_proveedor_tenant ON "documentos_proveedor"
    USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

-- Asignaciones de Extra a Concepto (tenant + proyecto)
ALTER TABLE "asignaciones_extra_concepto" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "asignaciones_extra_concepto" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rls_asignaciones_extra_concepto_context ON "asignaciones_extra_concepto";
CREATE POLICY rls_asignaciones_extra_concepto_context ON "asignaciones_extra_concepto"
    USING (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id())
    WITH CHECK (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id());

-- Recepciones de OC (tenant + proyecto)
ALTER TABLE "recepciones_oc" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "recepciones_oc" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rls_recepciones_oc_context ON "recepciones_oc";
CREATE POLICY rls_recepciones_oc_context ON "recepciones_oc"
    USING (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id())
    WITH CHECK (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id());

-- Ítems de Recepción de OC (tenant + proyecto)
ALTER TABLE "recepcion_oc_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "recepcion_oc_items" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rls_recepcion_oc_items_context ON "recepcion_oc_items";
CREATE POLICY rls_recepcion_oc_items_context ON "recepcion_oc_items"
    USING (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id())
    WITH CHECK (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id());

-- Archivos de Cotización por Proveedor en Comparativa (tenant + proyecto)
ALTER TABLE "comparativas_proveedores_archivos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "comparativas_proveedores_archivos" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rls_comparativas_proveedores_archivos_context ON "comparativas_proveedores_archivos";
CREATE POLICY rls_comparativas_proveedores_archivos_context ON "comparativas_proveedores_archivos"
    USING (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id())
    WITH CHECK (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id());

-- Auditoría de Desbloqueo de Comparativa (tenant + proyecto)
ALTER TABLE "auditoria_desbloqueo_comparativa" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "auditoria_desbloqueo_comparativa" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rls_auditoria_desbloqueo_comparativa_context ON "auditoria_desbloqueo_comparativa";
CREATE POLICY rls_auditoria_desbloqueo_comparativa_context ON "auditoria_desbloqueo_comparativa"
    USING (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id())
    WITH CHECK (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id());

-- Líneas de Comparativa (tenant + proyecto)
ALTER TABLE "comparativas_lineas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "comparativas_lineas" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rls_comparativas_lineas_context ON "comparativas_lineas";
CREATE POLICY rls_comparativas_lineas_context ON "comparativas_lineas"
    USING (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id())
    WITH CHECK (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id());

-- Aclaraciones de Comparativa (tenant + proyecto)
ALTER TABLE "aclaraciones_comparativa" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "aclaraciones_comparativa" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rls_aclaraciones_comparativa_context ON "aclaraciones_comparativa";
CREATE POLICY rls_aclaraciones_comparativa_context ON "aclaraciones_comparativa"
    USING (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id())
    WITH CHECK (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id());

-- Especificaciones de Detalle de Requisición (tenant + proyecto)
ALTER TABLE "especificaciones_detalle_req" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "especificaciones_detalle_req" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rls_especificaciones_detalle_req_context ON "especificaciones_detalle_req";
CREATE POLICY rls_especificaciones_detalle_req_context ON "especificaciones_detalle_req"
    USING (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id())
    WITH CHECK (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id());

-- Evaluaciones de Especificación (tenant + proyecto)
ALTER TABLE "evaluaciones_especificacion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "evaluaciones_especificacion" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rls_evaluaciones_especificacion_context ON "evaluaciones_especificacion";
CREATE POLICY rls_evaluaciones_especificacion_context ON "evaluaciones_especificacion"
    USING (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id())
    WITH CHECK (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id());

-- Solicitudes de Cotización (tenant + proyecto)
ALTER TABLE "solicitudes_cotizacion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "solicitudes_cotizacion" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rls_solicitudes_cotizacion_context ON "solicitudes_cotizacion";
CREATE POLICY rls_solicitudes_cotizacion_context ON "solicitudes_cotizacion"
    USING (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id())
    WITH CHECK (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id());

-- Proveedores invitados en Solicitud de Cotización (solo tenant — no tiene
-- proyecto_id propio, cuelga de SolicitudCotizacion vía solicitud_id)
ALTER TABLE "solicitudes_cotizacion_proveedores" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "solicitudes_cotizacion_proveedores" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rls_solicitudes_cotizacion_proveedores_tenant ON "solicitudes_cotizacion_proveedores";
CREATE POLICY rls_solicitudes_cotizacion_proveedores_tenant ON "solicitudes_cotizacion_proveedores"
    USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

-- Anotaciones de Especificación (solo tenant — no tiene proyecto_id propio,
-- cuelga de CuadroComparativo vía cuadro_id)
ALTER TABLE "anotaciones_especificacion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "anotaciones_especificacion" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rls_anotaciones_especificacion_tenant ON "anotaciones_especificacion";
CREATE POLICY rls_anotaciones_especificacion_tenant ON "anotaciones_especificacion"
    USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

-- Alertas de Error en OC (tenant + proyecto)
ALTER TABLE "alertas_oc_error" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "alertas_oc_error" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rls_alertas_oc_error_context ON "alertas_oc_error";
CREATE POLICY rls_alertas_oc_error_context ON "alertas_oc_error"
    USING (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id())
    WITH CHECK (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id());
