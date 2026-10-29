-- Se ejecuta (como bocam_admin) en cada base DESPUÉS de migraciones,
-- rls-policies.sql y seeds. Igual que en el VPS (fix-rls-bypass-bocam-admin,
-- tarea 2.1): la base y todos sus objetos pasan a ser de bocam_app. Como las
-- tablas tienen FORCE ROW LEVEL SECURITY, ser dueño no salta RLS.
-- Idempotente: se puede correr las veces que haga falta.

DO $$
DECLARE r record;
BEGIN
  EXECUTE format('ALTER DATABASE %I OWNER TO bocam_app', current_database());
  EXECUTE 'ALTER SCHEMA public OWNER TO bocam_app';

  FOR r IN
    SELECT c.relname, c.relkind
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind IN ('r', 'p', 'S', 'v', 'm')
      AND pg_get_userbyid(c.relowner) <> 'bocam_app'
      -- las secuencias ligadas a una columna cambian de dueño con su tabla
      AND NOT (c.relkind = 'S' AND EXISTS (
        SELECT 1 FROM pg_depend d
        WHERE d.objid = c.oid AND d.deptype IN ('a', 'i')))
  LOOP
    EXECUTE format('ALTER %s public.%I OWNER TO bocam_app',
      CASE r.relkind
        WHEN 'S' THEN 'SEQUENCE'
        WHEN 'v' THEN 'VIEW'
        WHEN 'm' THEN 'MATERIALIZED VIEW'
        ELSE 'TABLE'
      END,
      r.relname);
  END LOOP;

  FOR r IN
    SELECT p.oid::regprocedure AS firma
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND pg_get_userbyid(p.proowner) <> 'bocam_app'
      AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.objid = p.oid AND d.deptype = 'e')
  LOOP
    EXECUTE format('ALTER ROUTINE %s OWNER TO bocam_app', r.firma);
  END LOOP;

  FOR r IN
    SELECT t.typname
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typtype = 'e'
      AND pg_get_userbyid(t.typowner) <> 'bocam_app'
  LOOP
    EXECUTE format('ALTER TYPE public.%I OWNER TO bocam_app', r.typname);
  END LOOP;
END $$;
