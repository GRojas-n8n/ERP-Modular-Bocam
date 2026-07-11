-- =============================================================================
-- Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
-- Módulo: Calidad — Row-Level Security (RLS)
--
-- NOTA: solo aislamiento por tenant_id. A diferencia de otros módulos,
-- apps/calidad/src/db.ts fija `app.current_proyecto_id` a '' siempre
-- (createCalidadContext) — el módulo es de alcance corporativo, proyecto_id
-- es opcional/nullable en documentos/no_conformidades/auditorias_internas y
-- se filtra explícitamente en main.ts a nivel de aplicación cuando aplica,
-- no vía RLS. Una política que exigiera proyecto_id devolvería 0 filas
-- siempre.
--
-- Previamente solo `documentos` y `versiones_documento` tenían política
-- (embebida en la migración inicial, usando get_current_tenant_id() —
-- funcionalmente equivalente pero fuera de este archivo rastreado). Las
-- otras 4 tablas (no_conformidades, acciones_correctivas,
-- auditorias_internas, hallazgos_auditoria) no tenían ninguna, pese a
-- usarse con .update en main.ts.
-- =============================================================================

ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE versiones_documento ENABLE ROW LEVEL SECURITY;
ALTER TABLE no_conformidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE acciones_correctivas ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditorias_internas ENABLE ROW LEVEL SECURITY;
ALTER TABLE hallazgos_auditoria ENABLE ROW LEVEL SECURITY;

ALTER TABLE documentos FORCE ROW LEVEL SECURITY;
ALTER TABLE versiones_documento FORCE ROW LEVEL SECURITY;
ALTER TABLE no_conformidades FORCE ROW LEVEL SECURITY;
ALTER TABLE acciones_correctivas FORCE ROW LEVEL SECURITY;
ALTER TABLE auditorias_internas FORCE ROW LEVEL SECURITY;
ALTER TABLE hallazgos_auditoria FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation ON documentos;
CREATE POLICY tenant_isolation_documentos ON documentos
  USING (tenant_id::text = current_setting('app.current_tenant_id', true))
  WITH CHECK (tenant_id::text = current_setting('app.current_tenant_id', true));

DROP POLICY IF EXISTS tenant_isolation ON versiones_documento;
CREATE POLICY tenant_isolation_versiones_documento ON versiones_documento
  USING (tenant_id::text = current_setting('app.current_tenant_id', true))
  WITH CHECK (tenant_id::text = current_setting('app.current_tenant_id', true));

DROP POLICY IF EXISTS tenant_isolation_nc ON no_conformidades;
CREATE POLICY tenant_isolation_nc ON no_conformidades
  USING (tenant_id::text = current_setting('app.current_tenant_id', true))
  WITH CHECK (tenant_id::text = current_setting('app.current_tenant_id', true));

DROP POLICY IF EXISTS tenant_isolation_acciones ON acciones_correctivas;
CREATE POLICY tenant_isolation_acciones ON acciones_correctivas
  USING (tenant_id::text = current_setting('app.current_tenant_id', true))
  WITH CHECK (tenant_id::text = current_setting('app.current_tenant_id', true));

DROP POLICY IF EXISTS tenant_isolation_auditorias ON auditorias_internas;
CREATE POLICY tenant_isolation_auditorias ON auditorias_internas
  USING (tenant_id::text = current_setting('app.current_tenant_id', true))
  WITH CHECK (tenant_id::text = current_setting('app.current_tenant_id', true));

DROP POLICY IF EXISTS tenant_isolation_hallazgos ON hallazgos_auditoria;
CREATE POLICY tenant_isolation_hallazgos ON hallazgos_auditoria
  USING (tenant_id::text = current_setting('app.current_tenant_id', true))
  WITH CHECK (tenant_id::text = current_setting('app.current_tenant_id', true));
