-- Purga transaccional de los UUID de proyecto indicados dentro de UNA base.
-- Producción usa una base por servicio y tablas en public. El wrapper ejecuta
-- primero dry-run en todas las bases y deja bocam_auth al final en modo real.
\set ON_ERROR_STOP on

BEGIN;

SELECT set_config('purga.ids', :'ids', true),
       set_config('purga.tenant', :'tenant', true),
       set_config('purga.ejecutar', :'ejecutar', true),
       set_config('purga.es_auth', :'es_auth', true);

DO $guardas$
DECLARE
  v_ids uuid[];
BEGIN
  IF current_setting('is_superuser') <> 'on' THEN
    RAISE EXCEPTION 'PURGA_SIN_SUPERUSUARIO: RLS podría ocultar filas.';
  END IF;

  v_ids := ARRAY(
    SELECT DISTINCT btrim(x)::uuid
    FROM unnest(string_to_array(current_setting('purga.ids'), ',')) x
    WHERE btrim(x) <> ''
  );
  IF coalesce(array_length(v_ids, 1), 0) = 0 THEN
    RAISE EXCEPTION 'PURGA_SIN_IDS: no se recibieron UUID de proyecto.';
  END IF;
  IF array_length(v_ids, 1) > 10 THEN
    RAISE EXCEPTION 'PURGA_DEMASIADOS_PROYECTOS: máximo 10 por corrida.';
  END IF;

  IF current_setting('purga.es_auth') = '1' THEN
    IF to_regclass('public.proyectos') IS NULL THEN
      RAISE EXCEPTION 'PURGA_AUTH_SIN_PROYECTOS: falta public.proyectos.';
    END IF;
    IF EXISTS (
      SELECT 1 FROM unnest(v_ids) id
      WHERE NOT EXISTS (
        SELECT 1 FROM public.proyectos p
        WHERE p.id_proyecto = id
          AND p.tenant_id = current_setting('purga.tenant')::uuid
      )
    ) THEN
      RAISE EXCEPTION 'PURGA_IDS_NO_PERTENECEN_TENANT: los UUID no coinciden con el tenant confirmado.';
    END IF;
  END IF;
END
$guardas$;

CREATE TEMP TABLE purga_objetivo (id_proyecto uuid PRIMARY KEY) ON COMMIT DROP;
INSERT INTO purga_objetivo
SELECT DISTINCT btrim(x)::uuid
FROM unnest(string_to_array(current_setting('purga.ids'), ',')) x
WHERE btrim(x) <> '';

CREATE TEMP TABLE purga_tablas_todas ON COMMIT DROP AS
SELECT t.table_schema AS esquema,
       t.table_name AS tabla,
       format('%I.%I', t.table_schema, t.table_name)::regclass AS rel
FROM information_schema.tables t
WHERE t.table_type = 'BASE TABLE'
  AND t.table_schema = 'public'
  AND t.table_name <> '_prisma_migrations';

CREATE TEMP TABLE purga_tablas_proyecto ON COMMIT DROP AS
SELECT a.*
FROM purga_tablas_todas a
WHERE EXISTS (
  SELECT 1 FROM information_schema.columns c
  WHERE c.table_schema = a.esquema
    AND c.table_name = a.tabla
    AND c.column_name = 'proyecto_id'
);

CREATE TEMP TABLE purga_tablas_tenant ON COMMIT DROP AS
SELECT a.*
FROM purga_tablas_todas a
WHERE EXISTS (
  SELECT 1 FROM information_schema.columns c
  WHERE c.table_schema = a.esquema
    AND c.table_name = a.tabla
    AND c.column_name = 'tenant_id'
);

CREATE TEMP TABLE purga_cols_ruta ON COMMIT DROP AS
SELECT a.rel, c.column_name AS columna
FROM purga_tablas_todas a
JOIN information_schema.columns c
  ON c.table_schema = a.esquema AND c.table_name = a.tabla
WHERE c.column_name ~* '(ruta|path)'
  AND c.data_type IN ('text', 'character varying');

CREATE TEMP TABLE purga_antes_total    (tabla text, n bigint) ON COMMIT DROP;
CREATE TEMP TABLE purga_despues_total  (tabla text, n bigint) ON COMMIT DROP;
CREATE TEMP TABLE purga_antes_proy     (tabla text, proyecto_id uuid, n bigint) ON COMMIT DROP;
CREATE TEMP TABLE purga_despues_proy   (tabla text, proyecto_id uuid, n bigint) ON COMMIT DROP;
CREATE TEMP TABLE purga_antes_tenant   (tabla text, tenant_id uuid, n bigint) ON COMMIT DROP;
CREATE TEMP TABLE purga_despues_tenant (tabla text, tenant_id uuid, n bigint) ON COMMIT DROP;
CREATE TEMP TABLE purga_rutas_antes    (valor text) ON COMMIT DROP;
CREATE TEMP TABLE purga_rutas_despues  (valor text) ON COMMIT DROP;

CREATE FUNCTION pg_temp.fotografiar(
  p_total text, p_proy text, p_tenant text, p_rutas text
) RETURNS void LANGUAGE plpgsql AS $f$
DECLARE
  t record;
  c record;
BEGIN
  FOR t IN SELECT * FROM purga_tablas_todas LOOP
    EXECUTE format(
      'INSERT INTO %I SELECT %L, count(*) FROM %s',
      p_total, t.rel::text, t.rel
    );
  END LOOP;

  FOR t IN SELECT * FROM purga_tablas_proyecto LOOP
    EXECUTE format(
      'INSERT INTO %I SELECT %L, proyecto_id, count(*) FROM %s '
      'WHERE proyecto_id IS NULL OR proyecto_id NOT IN (SELECT id_proyecto FROM purga_objetivo) '
      'GROUP BY proyecto_id',
      p_proy, t.rel::text, t.rel
    );
  END LOOP;

  FOR t IN SELECT * FROM purga_tablas_tenant LOOP
    EXECUTE format(
      'INSERT INTO %I SELECT %L, tenant_id, count(*) FROM %s '
      'WHERE tenant_id IS DISTINCT FROM %L::uuid GROUP BY tenant_id',
      p_tenant, t.rel::text, t.rel, current_setting('purga.tenant')
    );
  END LOOP;

  FOR c IN SELECT * FROM purga_cols_ruta LOOP
    EXECUTE format(
      'INSERT INTO %I SELECT DISTINCT %I FROM %s WHERE %I IS NOT NULL',
      p_rutas, c.columna, c.rel, c.columna
    );
  END LOOP;
END
$f$;

CREATE FUNCTION pg_temp.purgar_filas(
  p_tabla regclass, p_where text, p_pila oid[] DEFAULT '{}'
) RETURNS void LANGUAGE plpgsql AS $f$
DECLARE
  fk record;
  col_hija text;
  col_padre text;
BEGIN
  IF p_tabla::oid = ANY (p_pila) THEN
    RAISE EXCEPTION 'PURGA_CICLO_FK: ciclo que pasa por %.', p_tabla;
  END IF;

  FOR fk IN
    SELECT c.conname, c.conrelid::regclass AS hija, c.conkey, c.confkey
    FROM pg_constraint c
    WHERE c.contype = 'f'
      AND c.confrelid = p_tabla
      AND c.confdeltype IN ('r', 'a', 'c')
    ORDER BY c.conrelid::regclass::text, c.conname
  LOOP
    IF array_length(fk.conkey, 1) > 1 THEN
      RAISE EXCEPTION 'PURGA_FK_COMPUESTA: % de %.', fk.conname, fk.hija;
    END IF;
    SELECT attname INTO col_hija
    FROM pg_attribute WHERE attrelid = fk.hija AND attnum = fk.conkey[1];
    SELECT attname INTO col_padre
    FROM pg_attribute WHERE attrelid = p_tabla AND attnum = fk.confkey[1];

    PERFORM pg_temp.purgar_filas(
      fk.hija,
      format('%I IN (SELECT %I FROM %s WHERE %s)', col_hija, col_padre, p_tabla, p_where),
      p_pila || p_tabla::oid
    );
  END LOOP;

  EXECUTE format('DELETE FROM %s WHERE %s', p_tabla, p_where);
END
$f$;

SELECT pg_temp.fotografiar(
  'purga_antes_total', 'purga_antes_proy', 'purga_antes_tenant', 'purga_rutas_antes'
);

DO $borrar$
DECLARE
  p record;
  t record;
BEGIN
  FOR p IN SELECT id_proyecto FROM purga_objetivo ORDER BY id_proyecto LOOP
    FOR t IN SELECT rel FROM purga_tablas_proyecto ORDER BY rel::text LOOP
      PERFORM pg_temp.purgar_filas(
        t.rel, format('proyecto_id = %L::uuid', p.id_proyecto)
      );
    END LOOP;
    IF current_setting('purga.es_auth') = '1' THEN
      PERFORM pg_temp.purgar_filas(
        'public.proyectos'::regclass,
        format('id_proyecto = %L::uuid', p.id_proyecto)
      );
    END IF;
  END LOOP;
END
$borrar$;

SELECT pg_temp.fotografiar(
  'purga_despues_total', 'purga_despues_proy', 'purga_despues_tenant', 'purga_rutas_despues'
);

DO $verificar$
DECLARE
  t record;
  restantes bigint;
  dif bigint;
  quedan_auth boolean;
BEGIN
  FOR t IN SELECT * FROM purga_tablas_proyecto LOOP
    EXECUTE format(
      'SELECT count(*) FROM %s WHERE proyecto_id IN (SELECT id_proyecto FROM purga_objetivo)',
      t.rel
    ) INTO restantes;
    IF restantes > 0 THEN
      RAISE EXCEPTION 'PURGA_VERIFICACION_FALLIDA: quedan % filas en %.', restantes, t.rel;
    END IF;
  END LOOP;

  IF current_setting('purga.es_auth') = '1' THEN
    EXECUTE
      'SELECT EXISTS (SELECT 1 FROM public.proyectos '
      'WHERE id_proyecto IN (SELECT id_proyecto FROM purga_objetivo))'
      INTO quedan_auth;
    IF quedan_auth THEN
      RAISE EXCEPTION 'PURGA_VERIFICACION_FALLIDA: quedan proyectos en auth.';
    END IF;
  END IF;

  SELECT count(*) INTO dif FROM (
    (SELECT * FROM purga_antes_proy EXCEPT SELECT * FROM purga_despues_proy)
    UNION ALL
    (SELECT * FROM purga_despues_proy EXCEPT SELECT * FROM purga_antes_proy)
  ) d;
  IF dif > 0 THEN
    RAISE EXCEPTION 'PURGA_VERIFICACION_FALLIDA: cambian otros proyectos (% diferencias).', dif;
  END IF;

  SELECT count(*) INTO dif FROM (
    (SELECT * FROM purga_antes_tenant EXCEPT SELECT * FROM purga_despues_tenant)
    UNION ALL
    (SELECT * FROM purga_despues_tenant EXCEPT SELECT * FROM purga_antes_tenant)
  ) d;
  IF dif > 0 THEN
    RAISE EXCEPTION 'PURGA_VERIFICACION_FALLIDA: cambian otros tenants (% diferencias).', dif;
  END IF;
END
$verificar$;

SELECT 'MODO', current_database(),
       CASE WHEN current_setting('purga.ejecutar') = '1' THEN 'EJECUCION' ELSE 'DRY-RUN' END;

SELECT 'FILAS', current_database(), a.tabla, a.n - d.n
FROM purga_antes_total a
JOIN purga_despues_total d USING (tabla)
WHERE a.n <> d.n
ORDER BY a.tabla;

SELECT 'ARCHIVO', current_database(), valor
FROM (
  SELECT valor FROM purga_rutas_antes
  EXCEPT
  SELECT valor FROM purga_rutas_despues
) x
ORDER BY valor;

\if :ejecutar
  COMMIT;
\else
  ROLLBACK;
\endif
