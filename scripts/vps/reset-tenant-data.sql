-- =============================================================================
-- Reset de datos de prueba por tenant — iRetum ERP
--
-- Borra TODAS las filas de negocio (proyectos, requisiciones, cotizaciones,
-- OCs, presupuestos, insumos, proveedores, nómina, calidad, seguridad,
-- ventas, contabilidad, control de obra, control de proyectos, almacén)
-- que pertenezcan a un tenant_id específico, dejando intactos:
--   - tenants        (el registro del tenant)
--   - users          (los 10 usuarios de prueba ya creados)
--   - refresh_tokens (no tiene tenant_id; se conserva igual)
--   - master_audit_logs (tabla cross-tenant, no tocar)
--   - cuentas_contables (catálogo contable global, no tiene tenant_id)
--
-- Cada microservicio en producción usa su PROPIA base de datos Postgres
-- (bocam_auth, bocam_compras, bocam_finanzas, etc.) — este script se ejecuta
-- UNA VEZ POR BASE (psql -d <nombre_bd> -f reset-tenant-data.sql). El bloque
-- recorre information_schema de esa base para encontrar toda tabla con
-- columna tenant_id y borra en varias pasadas (reintentando las que fallan
-- por FK) hasta que no quede nada pendiente — así no hay que ordenar
-- manualmente las tablas de cada esquema.
--
-- USO:
--   1) Ajustar el UUID hardcodeado abajo si cambia el tenant.
--   2) Ejecutar contra cada base de datos del tenant (ver README/runbook).
--      El PREVIEW es de solo lectura; el borrado va dentro de BEGIN/COMMIT
--      con verificación automática (aborta con ROLLBACK implícito si algo
--      queda pendiente en vez de hacer COMMIT).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) PREVIEW — cuántas filas se borrarían por tabla (no modifica nada)
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  r RECORD;
  tenant_uuid UUID := '8e07a7ac-8157-4e5d-8499-e985a9fcdbfc'::uuid;
  exclude_tables TEXT[] := ARRAY['users'];
  cnt BIGINT;
BEGIN
  RAISE NOTICE '--- PREVIEW: filas a borrar por tabla (tenant=%) ---', tenant_uuid;
  FOR r IN
    SELECT table_name FROM information_schema.columns
    WHERE table_schema = 'public' AND column_name = 'tenant_id'
      AND table_name <> ALL(exclude_tables)
    ORDER BY table_name
  LOOP
    EXECUTE format('SELECT count(*) FROM %I WHERE tenant_id = $1', r.table_name)
      INTO cnt USING tenant_uuid;
    IF cnt > 0 THEN
      RAISE NOTICE '  % -> % filas', r.table_name, cnt;
    END IF;
  END LOOP;
  RAISE NOTICE '--- FIN PREVIEW (no se borró nada todavía) ---';
END $$;

-- -----------------------------------------------------------------------------
-- 2) BORRADO — envuelto en transacción explícita
--    Revisar el NOTICE de "resumen final" antes de hacer COMMIT.
-- -----------------------------------------------------------------------------
BEGIN;

-- Deshabilitar temporalmente triggers de usuario (ej. guards de inmutabilidad
-- tipo "no modificar registro LOCKED") que puedan bloquear o cancelar el
-- DELETE en cascada dentro de esta misma transacción de limpieza. Se
-- reactivan más abajo antes del COMMIT.
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT DISTINCT c.relname
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    WHERE NOT t.tgisinternal
  LOOP
    EXECUTE format('ALTER TABLE %I DISABLE TRIGGER USER', r.relname);
  END LOOP;
END $$;

DO $$
DECLARE
  r RECORD;
  tenant_uuid UUID := '8e07a7ac-8157-4e5d-8499-e985a9fcdbfc'::uuid;
  exclude_tables TEXT[] := ARRAY['users'];
  pass INT;
  deleted_this_table BIGINT;
  total_deleted BIGINT;
BEGIN
  FOR pass IN 1..25 LOOP
    total_deleted := 0;
    FOR r IN
      SELECT table_name FROM information_schema.columns
      WHERE table_schema = 'public' AND column_name = 'tenant_id'
        AND table_name <> ALL(exclude_tables)
    LOOP
      BEGIN
        EXECUTE format('DELETE FROM %I WHERE tenant_id = $1', r.table_name) USING tenant_uuid;
        GET DIAGNOSTICS deleted_this_table = ROW_COUNT;
        total_deleted := total_deleted + deleted_this_table;
      EXCEPTION WHEN foreign_key_violation THEN
        -- Tabla con hijos aún no borrados en esta pasada; se reintenta en la siguiente.
        NULL;
      END;
    END LOOP;
    RAISE NOTICE 'Pasada %: % filas borradas', pass, total_deleted;
    EXIT WHEN total_deleted = 0;
  END LOOP;
END $$;

-- Verificación: no debe quedar ninguna fila del tenant fuera de 'users'
DO $$
DECLARE
  r RECORD;
  tenant_uuid UUID := '8e07a7ac-8157-4e5d-8499-e985a9fcdbfc'::uuid;
  exclude_tables TEXT[] := ARRAY['users'];
  cnt BIGINT;
  restante BIGINT := 0;
BEGIN
  FOR r IN
    SELECT table_name FROM information_schema.columns
    WHERE table_schema = 'public' AND column_name = 'tenant_id'
      AND table_name <> ALL(exclude_tables)
  LOOP
    EXECUTE format('SELECT count(*) FROM %I WHERE tenant_id = $1', r.table_name)
      INTO cnt USING tenant_uuid;
    IF cnt > 0 THEN
      RAISE NOTICE 'PENDIENTE: % todavía tiene % filas', r.table_name, cnt;
      restante := restante + cnt;
    END IF;
  END LOOP;
  IF restante = 0 THEN
    RAISE NOTICE '--- OK: tenant % limpio (0 filas fuera de users) ---', tenant_uuid;
  ELSE
    RAISE EXCEPTION '--- ABORTADO: quedaron % filas sin borrar, transaccion revertida ---', restante;
  END IF;
END $$;

-- Reactivar los triggers deshabilitados arriba (solo se llega aquí si el
-- bloque de verificación NO lanzó excepción).
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT DISTINCT c.relname
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    WHERE NOT t.tgisinternal
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE TRIGGER USER', r.relname);
  END LOOP;
END $$;

-- Si el bloque anterior no lanzó excepción, confirma. Si lanzó EXCEPTION,
-- Postgres ya abortó la transacción y este COMMIT no tiene nada que confirmar
-- (equivale a un no-op / la sesión ya está en estado abortado; los triggers
-- deshabilitados también se revierten automáticamente por el ROLLBACK).
COMMIT;
