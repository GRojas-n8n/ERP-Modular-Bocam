-- -----------------------------------------------------------------------------
-- Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
-- Módulo: Ventas — Row-Level Security (RLS)
-- -----------------------------------------------------------------------------

ALTER TABLE "clientes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "clientes" FORCE ROW LEVEL SECURITY;

ALTER TABLE "cotizaciones" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cotizaciones" FORCE ROW LEVEL SECURITY;

ALTER TABLE "facturas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "facturas" FORCE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION current_tenant_id() RETURNS UUID AS $$
    SELECT current_setting('app.current_tenant_id', true)::UUID;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION current_proyecto_id() RETURNS UUID AS $$
    SELECT current_setting('app.current_proyecto_id', true)::UUID;
$$ LANGUAGE sql STABLE;

DROP POLICY IF EXISTS rls_clientes_tenant ON "clientes";
CREATE POLICY rls_clientes_tenant ON "clientes"
  USING (tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());

DROP POLICY IF EXISTS rls_cotizaciones_context ON "cotizaciones";
CREATE POLICY rls_cotizaciones_context ON "cotizaciones"
  USING (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id())
  WITH CHECK (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id());

DROP POLICY IF EXISTS rls_facturas_context ON "facturas";
CREATE POLICY rls_facturas_context ON "facturas"
  USING (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id())
  WITH CHECK (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id());
