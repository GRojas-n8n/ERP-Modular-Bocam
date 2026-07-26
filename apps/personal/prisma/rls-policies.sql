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
ALTER TABLE registros_asistencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_deducciones_empleados ENABLE ROW LEVEL SECURITY;
ALTER TABLE nominas_complementarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE nominas_complementarias_detalle ENABLE ROW LEVEL SECURITY;

-- Tablas agregadas 2026-07-26 por expediente-asignacion-periodicidad-personal
-- y credenciales-asistencia-qr-segura — nunca recibieron política (ver
-- openspec/changes/fix-rls-personal-tablas-nuevas).
ALTER TABLE asignaciones_residente ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_asistencia_proyecto ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_nomina_proyecto ENABLE ROW LEVEL SECURITY;
ALTER TABLE credenciales_empleado ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_empleado ENABLE ROW LEVEL SECURITY;

ALTER TABLE empleados FORCE ROW LEVEL SECURITY;
ALTER TABLE cuadrillas FORCE ROW LEVEL SECURITY;
ALTER TABLE asignaciones_frente FORCE ROW LEVEL SECURITY;
ALTER TABLE pre_nominas FORCE ROW LEVEL SECURITY;
ALTER TABLE pre_nomina_detalles FORCE ROW LEVEL SECURITY;
ALTER TABLE registros_asistencia FORCE ROW LEVEL SECURITY;
ALTER TABLE config_deducciones_empleados FORCE ROW LEVEL SECURITY;
ALTER TABLE nominas_complementarias FORCE ROW LEVEL SECURITY;
ALTER TABLE nominas_complementarias_detalle FORCE ROW LEVEL SECURITY;
ALTER TABLE asignaciones_residente FORCE ROW LEVEL SECURITY;
ALTER TABLE config_asistencia_proyecto FORCE ROW LEVEL SECURITY;
ALTER TABLE config_nomina_proyecto FORCE ROW LEVEL SECURITY;
ALTER TABLE credenciales_empleado FORCE ROW LEVEL SECURITY;
ALTER TABLE documentos_empleado FORCE ROW LEVEL SECURITY;

-- NOTA: cada tabla con tenant_id + proyecto_id usa UNA sola política que combina
-- ambas condiciones con AND (USING + WITH CHECK). Postgres combina políticas
-- PERMISSIVE múltiples sobre la misma tabla/comando con OR, no con AND — declarar
-- tenant e proyecto como dos políticas separadas (como estaba antes en este
-- archivo) deja pasar cualquier fila que matchee UNA de las dos condiciones,
-- filtrando entre proyectos del mismo tenant y, si el proyecto_id coincide por
-- azar, incluso entre tenants distintos. Verificado empíricamente contra Postgres
-- real antes de corregir (ver tasks.md 3.5).

-- Empleados (solo tenant, no proyecto — son compartidos entre proyectos)
DROP POLICY IF EXISTS tenant_isolation_empleados ON empleados;
CREATE POLICY tenant_isolation_empleados ON empleados
  USING (tenant_id::text = current_setting('app.current_tenant_id', true))
  WITH CHECK (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Cuadrillas (tenant + proyecto, una sola política combinada)
DROP POLICY IF EXISTS tenant_isolation_cuadrillas ON cuadrillas;
DROP POLICY IF EXISTS proyecto_isolation_cuadrillas ON cuadrillas;
CREATE POLICY isolation_cuadrillas ON cuadrillas
  USING (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    AND proyecto_id::text = current_setting('app.current_proyecto_id', true)
  )
  WITH CHECK (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    AND proyecto_id::text = current_setting('app.current_proyecto_id', true)
  );

-- Asignaciones (tenant + proyecto, una sola política combinada)
DROP POLICY IF EXISTS tenant_isolation_asignaciones ON asignaciones_frente;
DROP POLICY IF EXISTS proyecto_isolation_asignaciones ON asignaciones_frente;
CREATE POLICY isolation_asignaciones ON asignaciones_frente
  USING (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    AND proyecto_id::text = current_setting('app.current_proyecto_id', true)
  )
  WITH CHECK (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    AND proyecto_id::text = current_setting('app.current_proyecto_id', true)
  );

-- Pre-Nóminas (tenant + proyecto, una sola política combinada)
DROP POLICY IF EXISTS tenant_isolation_prenominas ON pre_nominas;
DROP POLICY IF EXISTS proyecto_isolation_prenominas ON pre_nominas;
CREATE POLICY isolation_prenominas ON pre_nominas
  USING (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    AND proyecto_id::text = current_setting('app.current_proyecto_id', true)
  )
  WITH CHECK (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    AND proyecto_id::text = current_setting('app.current_proyecto_id', true)
  );

-- Pre-Nómina Detalles (tenant + proyecto, una sola política combinada)
DROP POLICY IF EXISTS tenant_isolation_prenomina_det ON pre_nomina_detalles;
DROP POLICY IF EXISTS proyecto_isolation_prenomina_det ON pre_nomina_detalles;
CREATE POLICY isolation_prenomina_det ON pre_nomina_detalles
  USING (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    AND proyecto_id::text = current_setting('app.current_proyecto_id', true)
  )
  WITH CHECK (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    AND proyecto_id::text = current_setting('app.current_proyecto_id', true)
  );

-- Registros de Asistencia (tenant + proyecto) — sin política previa, tabla
-- usada con .upsert/.update en main.ts (registroAsistencia)
DROP POLICY IF EXISTS isolation_registros_asistencia ON registros_asistencia;
CREATE POLICY isolation_registros_asistencia ON registros_asistencia
  USING (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    AND proyecto_id::text = current_setting('app.current_proyecto_id', true)
  )
  WITH CHECK (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    AND proyecto_id::text = current_setting('app.current_proyecto_id', true)
  );

-- Config Deducciones por Empleado (solo tenant, no tiene proyecto_id) — sin
-- política previa, tabla usada con .upsert en main.ts (configDeduccionEmpleado)
DROP POLICY IF EXISTS isolation_config_deducciones ON config_deducciones_empleados;
CREATE POLICY isolation_config_deducciones ON config_deducciones_empleados
  USING (tenant_id::text = current_setting('app.current_tenant_id', true))
  WITH CHECK (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Nóminas Complementarias (tenant + proyecto) — sin política previa, tabla
-- usada con .update en main.ts (nominaComplementaria)
DROP POLICY IF EXISTS isolation_nominas_complementarias ON nominas_complementarias;
CREATE POLICY isolation_nominas_complementarias ON nominas_complementarias
  USING (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    AND proyecto_id::text = current_setting('app.current_proyecto_id', true)
  )
  WITH CHECK (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    AND proyecto_id::text = current_setting('app.current_proyecto_id', true)
  );

-- Nóminas Complementarias Detalle (no tiene proyecto_id propio, solo
-- complemento_id) — aísla vía join a nominas_complementarias, mismo patrón
-- que detalles_pago_oc en finanzas
DROP POLICY IF EXISTS isolation_nominas_complementarias_detalle ON nominas_complementarias_detalle;
CREATE POLICY isolation_nominas_complementarias_detalle ON nominas_complementarias_detalle
  USING (
    EXISTS (
      SELECT 1 FROM nominas_complementarias nc
      WHERE nc.id_complemento = nominas_complementarias_detalle.complemento_id
        AND nc.tenant_id::text = current_setting('app.current_tenant_id', true)
        AND nc.proyecto_id::text = current_setting('app.current_proyecto_id', true)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM nominas_complementarias nc
      WHERE nc.id_complemento = nominas_complementarias_detalle.complemento_id
        AND nc.tenant_id::text = current_setting('app.current_tenant_id', true)
        AND nc.proyecto_id::text = current_setting('app.current_proyecto_id', true)
    )
  );

-- =============================================================================
-- Tablas agregadas 2026-07-26 (expediente-asignacion-periodicidad-personal +
-- credenciales-asistencia-qr-segura) — ver
-- openspec/changes/fix-rls-personal-tablas-nuevas para el detalle del gap y
-- la verificación empírica que confirmó la fuga antes de este fix.
-- =============================================================================

-- Config de Asistencia por Proyecto / geofencing (tenant + proyecto)
DROP POLICY IF EXISTS isolation_config_asistencia_proyecto ON config_asistencia_proyecto;
CREATE POLICY isolation_config_asistencia_proyecto ON config_asistencia_proyecto
  USING (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    AND proyecto_id::text = current_setting('app.current_proyecto_id', true)
  )
  WITH CHECK (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    AND proyecto_id::text = current_setting('app.current_proyecto_id', true)
  );

-- Config de Nómina por Proyecto / periodicidad de pago (tenant + proyecto)
DROP POLICY IF EXISTS isolation_config_nomina_proyecto ON config_nomina_proyecto;
CREATE POLICY isolation_config_nomina_proyecto ON config_nomina_proyecto
  USING (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    AND proyecto_id::text = current_setting('app.current_proyecto_id', true)
  )
  WITH CHECK (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    AND proyecto_id::text = current_setting('app.current_proyecto_id', true)
  );

-- Asignación de Empleado a Residente(s) (solo tenant — el empleado se
-- comparte entre proyectos, mismo criterio que empleados)
DROP POLICY IF EXISTS isolation_asignaciones_residente ON asignaciones_residente;
CREATE POLICY isolation_asignaciones_residente ON asignaciones_residente
  USING (tenant_id::text = current_setting('app.current_tenant_id', true))
  WITH CHECK (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Credencial de Empleado / token QR (solo tenant — mismo criterio que
-- empleados; la credencial no está scoped a un proyecto)
DROP POLICY IF EXISTS isolation_credenciales_empleado ON credenciales_empleado;
CREATE POLICY isolation_credenciales_empleado ON credenciales_empleado
  USING (tenant_id::text = current_setting('app.current_tenant_id', true))
  WITH CHECK (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Documento de Expediente del Empleado (solo tenant — mismo criterio que
-- empleados; contiene datos personales sensibles: INE, comprobante de
-- domicilio, contratos)
DROP POLICY IF EXISTS isolation_documentos_empleado ON documentos_empleado;
CREATE POLICY isolation_documentos_empleado ON documentos_empleado
  USING (tenant_id::text = current_setting('app.current_tenant_id', true))
  WITH CHECK (tenant_id::text = current_setting('app.current_tenant_id', true));
