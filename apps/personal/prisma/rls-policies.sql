-- =============================================================================
-- Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
-- Módulo: Personal / RRHH
-- Archivo: rls-policies.sql
-- =============================================================================

ALTER TABLE empleados ENABLE ROW LEVEL SECURITY;
ALTER TABLE cuadrillas ENABLE ROW LEVEL SECURITY;
ALTER TABLE asignaciones_frente ENABLE ROW LEVEL SECURITY;
ALTER TABLE pre_nominas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pre_nomina_detalles ENABLE ROW LEVEL SECURITY;

ALTER TABLE empleados FORCE ROW LEVEL SECURITY;
ALTER TABLE cuadrillas FORCE ROW LEVEL SECURITY;
ALTER TABLE asignaciones_frente FORCE ROW LEVEL SECURITY;
ALTER TABLE pre_nominas FORCE ROW LEVEL SECURITY;
ALTER TABLE pre_nomina_detalles FORCE ROW LEVEL SECURITY;

-- Empleados (solo tenant, no proyecto — son compartidos entre proyectos)
CREATE POLICY tenant_isolation_empleados ON empleados
  USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Cuadrillas (tenant + proyecto)
CREATE POLICY tenant_isolation_cuadrillas ON cuadrillas
  USING (tenant_id::text = current_setting('app.current_tenant_id', true));
CREATE POLICY proyecto_isolation_cuadrillas ON cuadrillas
  USING (proyecto_id::text = current_setting('app.current_proyecto_id', true));

-- Asignaciones (tenant + proyecto)
CREATE POLICY tenant_isolation_asignaciones ON asignaciones_frente
  USING (tenant_id::text = current_setting('app.current_tenant_id', true));
CREATE POLICY proyecto_isolation_asignaciones ON asignaciones_frente
  USING (proyecto_id::text = current_setting('app.current_proyecto_id', true));

-- Pre-Nóminas (tenant + proyecto)
CREATE POLICY tenant_isolation_prenominas ON pre_nominas
  USING (tenant_id::text = current_setting('app.current_tenant_id', true));
CREATE POLICY proyecto_isolation_prenominas ON pre_nominas
  USING (proyecto_id::text = current_setting('app.current_proyecto_id', true));

-- Pre-Nómina Detalles (tenant + proyecto)
CREATE POLICY tenant_isolation_prenomina_det ON pre_nomina_detalles
  USING (tenant_id::text = current_setting('app.current_tenant_id', true));
CREATE POLICY proyecto_isolation_prenomina_det ON pre_nomina_detalles
  USING (proyecto_id::text = current_setting('app.current_proyecto_id', true));
