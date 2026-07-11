-- =============================================================================
-- Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
-- Módulo: Seguridad / HSE
-- Archivo: rls-policies.sql
--
-- Políticas de Row-Level Security para aislamiento multi-tenant.
-- Ejecutar DESPUÉS de prisma migrate dev.
--
-- NOTA: cada tabla usa UNA sola política que combina tenant_id y proyecto_id
-- con AND (USING + WITH CHECK). Postgres combina políticas PERMISSIVE
-- múltiples sobre la misma tabla/comando con OR, no con AND — declarar
-- tenant y proyecto como dos políticas separadas (como estaba antes en este
-- archivo) deja pasar cualquier fila que matchee UNA de las dos condiciones,
-- filtrando entre proyectos del mismo tenant y, si el proyecto_id coincide
-- por azar, incluso entre tenants distintos. Verificado empíricamente contra
-- Postgres real antes de corregir (ver tasks.md 3.6, mismo hallazgo que 3.5).
-- =============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE incidentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspecciones_seguridad ENABLE ROW LEVEL SECURITY;
ALTER TABLE permisos_trabajo ENABLE ROW LEVEL SECURITY;
ALTER TABLE capacitaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_capacitacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE epp_registros ENABLE ROW LEVEL SECURITY;

-- Forzar RLS incluso para el owner de la tabla
ALTER TABLE incidentes FORCE ROW LEVEL SECURITY;
ALTER TABLE inspecciones_seguridad FORCE ROW LEVEL SECURITY;
ALTER TABLE permisos_trabajo FORCE ROW LEVEL SECURITY;
ALTER TABLE capacitaciones FORCE ROW LEVEL SECURITY;
ALTER TABLE registros_capacitacion FORCE ROW LEVEL SECURITY;
ALTER TABLE epp_registros FORCE ROW LEVEL SECURITY;

-- ─── Incidentes (tenant + proyecto) ──────────────────────────────────────
DROP POLICY IF EXISTS tenant_isolation_incidentes ON incidentes;
DROP POLICY IF EXISTS proyecto_isolation_incidentes ON incidentes;
CREATE POLICY isolation_incidentes ON incidentes
  USING (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    AND proyecto_id::text = current_setting('app.current_proyecto_id', true)
  )
  WITH CHECK (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    AND proyecto_id::text = current_setting('app.current_proyecto_id', true)
  );

-- ─── Inspecciones (tenant + proyecto) ────────────────────────────────────
DROP POLICY IF EXISTS tenant_isolation_inspecciones ON inspecciones_seguridad;
DROP POLICY IF EXISTS proyecto_isolation_inspecciones ON inspecciones_seguridad;
CREATE POLICY isolation_inspecciones ON inspecciones_seguridad
  USING (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    AND proyecto_id::text = current_setting('app.current_proyecto_id', true)
  )
  WITH CHECK (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    AND proyecto_id::text = current_setting('app.current_proyecto_id', true)
  );

-- ─── Permisos de Trabajo (tenant + proyecto) ─────────────────────────────
DROP POLICY IF EXISTS tenant_isolation_permisos ON permisos_trabajo;
DROP POLICY IF EXISTS proyecto_isolation_permisos ON permisos_trabajo;
CREATE POLICY isolation_permisos ON permisos_trabajo
  USING (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    AND proyecto_id::text = current_setting('app.current_proyecto_id', true)
  )
  WITH CHECK (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    AND proyecto_id::text = current_setting('app.current_proyecto_id', true)
  );

-- ─── Capacitaciones (tenant + proyecto) ──────────────────────────────────
DROP POLICY IF EXISTS tenant_isolation_capacitaciones ON capacitaciones;
DROP POLICY IF EXISTS proyecto_isolation_capacitaciones ON capacitaciones;
CREATE POLICY isolation_capacitaciones ON capacitaciones
  USING (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    AND proyecto_id::text = current_setting('app.current_proyecto_id', true)
  )
  WITH CHECK (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    AND proyecto_id::text = current_setting('app.current_proyecto_id', true)
  );

-- ─── Registros de Capacitación (tenant + proyecto) ───────────────────────
DROP POLICY IF EXISTS tenant_isolation_reg_cap ON registros_capacitacion;
DROP POLICY IF EXISTS proyecto_isolation_reg_cap ON registros_capacitacion;
CREATE POLICY isolation_reg_cap ON registros_capacitacion
  USING (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    AND proyecto_id::text = current_setting('app.current_proyecto_id', true)
  )
  WITH CHECK (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    AND proyecto_id::text = current_setting('app.current_proyecto_id', true)
  );

-- ─── Registros de EPP (tenant + proyecto) — sin política previa, tabla
-- usada con .update en main.ts (registroEPP) ──────────────────────────────
DROP POLICY IF EXISTS isolation_epp_registros ON epp_registros;
CREATE POLICY isolation_epp_registros ON epp_registros
  USING (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    AND proyecto_id::text = current_setting('app.current_proyecto_id', true)
  )
  WITH CHECK (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    AND proyecto_id::text = current_setting('app.current_proyecto_id', true)
  );
