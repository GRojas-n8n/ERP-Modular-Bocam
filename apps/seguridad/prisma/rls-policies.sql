-- =============================================================================
-- Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
-- Módulo: Seguridad / HSE
-- Archivo: rls-policies.sql
--
-- Políticas de Row-Level Security para aislamiento multi-tenant.
-- Ejecutar DESPUÉS de prisma migrate dev.
-- =============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE incidentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspecciones_seguridad ENABLE ROW LEVEL SECURITY;
ALTER TABLE permisos_trabajo ENABLE ROW LEVEL SECURITY;
ALTER TABLE capacitaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_capacitacion ENABLE ROW LEVEL SECURITY;

-- Forzar RLS incluso para el owner de la tabla
ALTER TABLE incidentes FORCE ROW LEVEL SECURITY;
ALTER TABLE inspecciones_seguridad FORCE ROW LEVEL SECURITY;
ALTER TABLE permisos_trabajo FORCE ROW LEVEL SECURITY;
ALTER TABLE capacitaciones FORCE ROW LEVEL SECURITY;
ALTER TABLE registros_capacitacion FORCE ROW LEVEL SECURITY;

-- ─── Incidentes (tenant + proyecto) ──────────────────────────────────────
CREATE POLICY tenant_isolation_incidentes ON incidentes
  USING (tenant_id::text = current_setting('app.current_tenant_id', true));
CREATE POLICY proyecto_isolation_incidentes ON incidentes
  USING (proyecto_id::text = current_setting('app.current_proyecto_id', true));

-- ─── Inspecciones (tenant + proyecto) ────────────────────────────────────
CREATE POLICY tenant_isolation_inspecciones ON inspecciones_seguridad
  USING (tenant_id::text = current_setting('app.current_tenant_id', true));
CREATE POLICY proyecto_isolation_inspecciones ON inspecciones_seguridad
  USING (proyecto_id::text = current_setting('app.current_proyecto_id', true));

-- ─── Permisos de Trabajo (tenant + proyecto) ─────────────────────────────
CREATE POLICY tenant_isolation_permisos ON permisos_trabajo
  USING (tenant_id::text = current_setting('app.current_tenant_id', true));
CREATE POLICY proyecto_isolation_permisos ON permisos_trabajo
  USING (proyecto_id::text = current_setting('app.current_proyecto_id', true));

-- ─── Capacitaciones (tenant + proyecto) ──────────────────────────────────
CREATE POLICY tenant_isolation_capacitaciones ON capacitaciones
  USING (tenant_id::text = current_setting('app.current_tenant_id', true));
CREATE POLICY proyecto_isolation_capacitaciones ON capacitaciones
  USING (proyecto_id::text = current_setting('app.current_proyecto_id', true));

-- ─── Registros de Capacitación (tenant + proyecto) ───────────────────────
CREATE POLICY tenant_isolation_reg_cap ON registros_capacitacion
  USING (tenant_id::text = current_setting('app.current_tenant_id', true));
CREATE POLICY proyecto_isolation_reg_cap ON registros_capacitacion
  USING (proyecto_id::text = current_setting('app.current_proyecto_id', true));
