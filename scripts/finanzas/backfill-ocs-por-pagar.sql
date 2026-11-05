-- Carga inicial de ocs_por_pagar desde Compras (runbook-finanzas-100, paso 2.6). Re-ejecutable: ON CONFLICT DO NOTHING.
-- Uso: psql "$FIN_URL" -v schema="$FIN_SCHEMA" -f backfill-ocs-por-pagar.sql   (requiere /tmp/ocs.csv exportado de Compras)
\set ON_ERROR_STOP on
SET search_path TO :"schema";
BEGIN;
CREATE TEMP TABLE carga_ocs (
  tenant_id uuid, oc_id uuid, proyecto_id uuid, oc_codigo varchar(50), proveedor_id uuid,
  proveedor_nombre varchar(255), total numeric(18,2), estado text, estado_pago text
) ON COMMIT DROP;
\copy carga_ocs FROM '/tmp/ocs.csv' CSV HEADER
DO $$
DECLARE r record; n bigint; total_insertadas bigint := 0;
BEGIN
  FOR r IN SELECT DISTINCT tenant_id, proyecto_id FROM carga_ocs LOOP
    PERFORM set_config('app.current_tenant_id', r.tenant_id::text, true);
    PERFORM set_config('app.current_proyecto_id', r.proyecto_id::text, true);
    INSERT INTO ocs_por_pagar (tenant_id, oc_id, proyecto_id, oc_codigo, proveedor_id, proveedor_nombre, total)
    SELECT tenant_id, oc_id, proyecto_id, oc_codigo, proveedor_id, left(proveedor_nombre, 255), total
      FROM carga_ocs
     WHERE tenant_id = r.tenant_id AND proyecto_id = r.proyecto_id AND total > 0
    ON CONFLICT (tenant_id, oc_id) DO NOTHING;
    GET DIAGNOSTICS n = ROW_COUNT;
    total_insertadas := total_insertadas + n;
  END LOOP;
  RAISE NOTICE 'ocs_por_pagar insertadas: %', total_insertadas;
END $$;
\echo 'OCs con PAGO_PARCIAL en Compras (capturar el abono real a mano antes de habilitar la pantalla):'
SELECT tenant_id, oc_codigo, total FROM carga_ocs WHERE estado_pago = 'PAGO_PARCIAL' ORDER BY oc_codigo;
COMMIT;
