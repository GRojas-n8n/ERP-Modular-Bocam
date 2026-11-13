-- Mueve las estimaciones registradas como pagos programados a cuentas_por_cobrar (openspec: cuentas-por-cobrar-estimaciones, F20).
-- Uso (simulación, termina en ROLLBACK):  psql "$FIN_URL" -v schema="$FIN_SCHEMA" -f migrar-estimaciones-a-cxc.sql
-- Uso (aplicar):                          psql "$FIN_URL" -v schema="$FIN_SCHEMA" -v aplicar=1 -f migrar-estimaciones-a-cxc.sql
-- Re-ejecutable: ON CONFLICT DO NOTHING y solo toca filas que siguen abiertas.
--
-- 1. Estimaciones abiertas (PENDIENTE, PROGRAMADO, VENCIDO) → cuenta por cobrar POR_COBRAR; el pago programado pasa a CANCELADO.
-- 2. Proyecciones por avance validado abiertas → CANCELADO (el avance no es documento cobrable).
-- 3. Estimaciones ya PAGADO: NO se tocan. Afectaron el ejercido del presupuesto como si fueran gasto; se listan para
--    que el contador decida el asiento de corrección.
\set ON_ERROR_STOP on
SET search_path TO :"schema";
BEGIN;

\echo '== Antes'
SELECT referencia_entidad, estado, count(*), sum(monto_programado)::numeric(18,2) AS monto
  FROM programa_pagos
 WHERE referencia_modulo = 'control-obra'
 GROUP BY 1, 2 ORDER BY 1, 2;

DO $$
DECLARE r record; n bigint; cxc bigint := 0; canc_est bigint := 0; canc_av bigint := 0;
BEGIN
  FOR r IN SELECT DISTINCT tenant_id, proyecto_id FROM programa_pagos WHERE referencia_modulo = 'control-obra' LOOP
    PERFORM set_config('app.current_tenant_id', r.tenant_id::text, true);
    PERFORM set_config('app.current_proyecto_id', r.proyecto_id::text, true);

    INSERT INTO cuentas_por_cobrar
      (id_cxc, tenant_id, proyecto_id, origen, origen_id, codigo, concepto, presupuesto_id, monto, moneda, fecha_vencimiento, updated_at)
    SELECT gen_random_uuid(), p.tenant_id, p.proyecto_id, 'ESTIMACION', p.referencia_id::uuid,
           left(COALESCE(substring(p.concepto FROM '^Estimacion (\S+)'), 'EST-' || left(p.referencia_id::text, 8)), 60),
           left(p.concepto, 255), p.presupuesto_id, p.monto_programado, p.moneda, p.fecha_programada, now()
      FROM programa_pagos p
     WHERE p.tenant_id = r.tenant_id AND p.proyecto_id = r.proyecto_id
       AND p.referencia_modulo = 'control-obra' AND p.referencia_entidad = 'Estimacion'
       AND p.estado IN ('PENDIENTE', 'PROGRAMADO', 'VENCIDO') AND p.monto_programado > 0
    ON CONFLICT (tenant_id, origen, origen_id) DO NOTHING;
    GET DIAGNOSTICS n = ROW_COUNT; cxc := cxc + n;

    UPDATE programa_pagos SET estado = 'CANCELADO', updated_at = now()
     WHERE tenant_id = r.tenant_id AND proyecto_id = r.proyecto_id
       AND referencia_modulo = 'control-obra' AND referencia_entidad = 'Estimacion'
       AND estado IN ('PENDIENTE', 'PROGRAMADO', 'VENCIDO');
    GET DIAGNOSTICS n = ROW_COUNT; canc_est := canc_est + n;

    UPDATE programa_pagos SET estado = 'CANCELADO', updated_at = now()
     WHERE tenant_id = r.tenant_id AND proyecto_id = r.proyecto_id
       AND referencia_modulo = 'control-obra' AND referencia_entidad = 'AvanceFisicoValidado'
       AND estado IN ('PENDIENTE', 'PROGRAMADO', 'VENCIDO');
    GET DIAGNOSTICS n = ROW_COUNT; canc_av := canc_av + n;
  END LOOP;
  RAISE NOTICE 'cuentas por cobrar creadas: %, estimaciones programadas canceladas: %, proyecciones por avance canceladas: %', cxc, canc_est, canc_av;
END $$;

\echo '== Estimaciones ya PAGADO (revisión con el contador: se registraron como gasto ejercido)'
SELECT tenant_id, proyecto_id, id_pago, concepto, monto_programado, monto_pagado, fecha_pago_real
  FROM programa_pagos
 WHERE referencia_modulo = 'control-obra' AND estado = 'PAGADO'
 ORDER BY fecha_pago_real;

\echo '== Después'
SELECT referencia_entidad, estado, count(*) FROM programa_pagos WHERE referencia_modulo = 'control-obra' GROUP BY 1, 2 ORDER BY 1, 2;
SELECT estado, count(*), sum(monto)::numeric(18,2) AS monto FROM cuentas_por_cobrar GROUP BY 1;

\if :{?aplicar}
COMMIT;
\echo 'APLICADO'
\else
ROLLBACK;
\echo 'SIMULACION: nada se guardó. Repetir con -v aplicar=1 para aplicar.'
\endif
