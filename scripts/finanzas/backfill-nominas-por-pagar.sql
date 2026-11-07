-- Carga inicial de nominas_por_pagar con las prenóminas AUTORIZADAS antes de nomina-pagada-por-finanzas.
-- Re-ejecutable: ON CONFLICT DO NOTHING.
-- 1. En la base de Personal exportar a /tmp/nominas.csv:
--    \copy (SELECT tenant_id, id_prenomina, proyecto_id, codigo, periodo_inicio, periodo_fin, total_neto, total_empleados
--           FROM pre_nominas WHERE estado = 'AUTORIZADA') TO '/tmp/nominas.csv' CSV HEADER
-- 2. Uso: psql "$FIN_URL" -v schema="$FIN_SCHEMA" -f backfill-nominas-por-pagar.sql
\set ON_ERROR_STOP on
SET search_path TO :"schema";
BEGIN;
CREATE TEMP TABLE carga_nominas (
  tenant_id uuid, prenomina_id uuid, proyecto_id uuid, codigo varchar(60), periodo_inicio timestamp, periodo_fin timestamp,
  total_neto numeric(18,2), total_empleados int
) ON COMMIT DROP;
\copy carga_nominas FROM '/tmp/nominas.csv' CSV HEADER
DO $$
DECLARE r record; n bigint; total bigint := 0;
BEGIN
  FOR r IN SELECT DISTINCT tenant_id, proyecto_id FROM carga_nominas LOOP
    PERFORM set_config('app.current_tenant_id', r.tenant_id::text, true);
    PERFORM set_config('app.current_proyecto_id', r.proyecto_id::text, true);
    INSERT INTO nominas_por_pagar (tenant_id, prenomina_id, proyecto_id, codigo, periodo_inicio, periodo_fin, total_neto, total_empleados)
    SELECT tenant_id, prenomina_id, proyecto_id, codigo, periodo_inicio, periodo_fin, total_neto, COALESCE(total_empleados, 0)
      FROM carga_nominas
     WHERE tenant_id = r.tenant_id AND proyecto_id = r.proyecto_id AND total_neto > 0
    ON CONFLICT (tenant_id, prenomina_id) DO NOTHING;
    GET DIAGNOSTICS n = ROW_COUNT;
    total := total + n;
  END LOOP;
  RAISE NOTICE 'nominas_por_pagar insertadas: %', total;
END $$;
COMMIT;
