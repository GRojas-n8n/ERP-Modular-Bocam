-- Saldo inicial del libro bancario para las cuentas que ya existían antes de M6 (openspec: libro-bancario).
-- Uso (simulación, termina en ROLLBACK):  psql "$FIN_URL" -v schema="$FIN_SCHEMA" -f saldo-inicial-libro-bancario.sql
-- Uso (aplicar):                          psql "$FIN_URL" -v schema="$FIN_SCHEMA" -v aplicar=1 -f saldo-inicial-libro-bancario.sql
-- Correr como bocam_admin: recorre todos los tenants fijando app.current_tenant_id en cada uno.
-- Re-ejecutable: solo toca cuentas sin movimiento SALDO_INICIAL.
--
-- 1. Por cada cuenta sin SALDO_INICIAL: saldo_inicial = saldo actual - (abonos - cargos ya registrados en el libro).
--    Así cuadra aunque la cuenta haya movido dinero entre el despliegue y este script.
--    Se registra con saldo_anterior 0, la fecha de alta de la cuenta y secuencia NEGATIVA (-nextval, única): el libro
--    se ordena por secuencia, así que queda antes que cualquier movimiento ya registrado y la cadena
--    saldo_anterior/saldo_posterior no tiene huecos (los movimientos previos guardaron el saldo real del momento).
-- 2. Saldo inicial 0: no se registra movimiento.
-- 3. Al final lista las cuentas cuyo saldo no es igual a abonos - cargos. Debe salir vacío.
\set ON_ERROR_STOP on
SET search_path TO :"schema";
BEGIN;

\echo '== Cuentas sin saldo inicial en el libro'
SELECT c.tenant_id, c.id_cuenta, c.banco, c.alias, c.saldo,
       COALESCE(sum(CASE m.tipo WHEN 'ABONO' THEN m.monto ELSE -m.monto END), 0)::numeric(18,2) AS neto_libro
  FROM cuentas_bancarias c
  LEFT JOIN movimientos_bancarios m ON m.cuenta_id = c.id_cuenta
 WHERE NOT EXISTS (SELECT 1 FROM movimientos_bancarios s WHERE s.cuenta_id = c.id_cuenta AND s.origen = 'SALDO_INICIAL')
 GROUP BY c.tenant_id, c.id_cuenta, c.banco, c.alias, c.saldo
 ORDER BY c.tenant_id, c.banco;

DO $$
DECLARE t uuid; r record; inicial numeric(18,2); n bigint := 0; ceros bigint := 0;
BEGIN
  FOR t IN SELECT DISTINCT tenant_id FROM cuentas_bancarias LOOP
    PERFORM set_config('app.current_tenant_id', t::text, true);
    FOR r IN
      SELECT c.id_cuenta, c.proyecto_id, c.saldo, c.created_at,
             COALESCE((SELECT sum(CASE m.tipo WHEN 'ABONO' THEN m.monto ELSE -m.monto END)
                         FROM movimientos_bancarios m WHERE m.cuenta_id = c.id_cuenta), 0) AS neto
        FROM cuentas_bancarias c
       WHERE c.tenant_id = t
         AND NOT EXISTS (SELECT 1 FROM movimientos_bancarios s WHERE s.cuenta_id = c.id_cuenta AND s.origen = 'SALDO_INICIAL')
       FOR UPDATE OF c
    LOOP
      inicial := r.saldo - r.neto;
      IF inicial = 0 THEN ceros := ceros + 1; CONTINUE; END IF;
      INSERT INTO movimientos_bancarios
        (id_movimiento, secuencia, tenant_id, cuenta_id, proyecto_id, tipo, origen, origen_id, motivo, monto, saldo_anterior, saldo_posterior, created_at)
      VALUES (gen_random_uuid(), -nextval(pg_get_serial_sequence('movimientos_bancarios', 'secuencia')), t, r.id_cuenta, r.proyecto_id, CASE WHEN inicial > 0 THEN 'ABONO' ELSE 'CARGO' END,
              'SALDO_INICIAL', r.id_cuenta, 'Saldo previo al libro bancario (M6)', abs(inicial), 0, inicial, r.created_at);
      n := n + 1;
    END LOOP;
  END LOOP;
  RAISE NOTICE 'saldos iniciales registrados: %, cuentas en 0 sin movimiento: %', n, ceros;
END $$;

\echo '== Descuadres (saldo <> abonos - cargos). Debe salir vacío.'
SELECT c.tenant_id, c.id_cuenta, c.alias, c.saldo,
       COALESCE(sum(CASE m.tipo WHEN 'ABONO' THEN m.monto ELSE -m.monto END), 0)::numeric(18,2) AS neto_libro
  FROM cuentas_bancarias c
  LEFT JOIN movimientos_bancarios m ON m.cuenta_id = c.id_cuenta
 GROUP BY c.tenant_id, c.id_cuenta, c.alias, c.saldo
HAVING c.saldo <> COALESCE(sum(CASE m.tipo WHEN 'ABONO' THEN m.monto ELSE -m.monto END), 0)
 ORDER BY c.tenant_id;

\if :{?aplicar}
COMMIT;
\echo 'APLICADO'
\else
ROLLBACK;
\echo 'SIMULACION: nada se guardó. Repetir con -v aplicar=1 para aplicar.'
\endif
