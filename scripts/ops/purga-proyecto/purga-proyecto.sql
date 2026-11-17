-- ============================================================================
-- purga-proyecto.sql — eliminación DEFINITIVA de proyectos y de todos sus datos
-- en los esquemas de servicio. Herramienta operativa: NO la usa la aplicación.
--
-- Spec: openspec/changes/purga-proyectos-demo-produccion/
-- Runbook: docs/operacion/purga-proyectos-demo.md
--
-- Se ejecuta con psql como SUPERUSUARIO (si no, RLS podría ocultar filas y la
-- purga quedaría incompleta en silencio; el script lo comprueba y aborta):
--
--   psql -X -q -A -t -F'|' -v ON_ERROR_STOP=1 \
--        -v tenant=<uuid> -v codigos=<COD1,COD2> -v confirmar=<COD1,COD2> \
--        -v ejecutar=0|1 [-v esquemas=auth,compras,...] -f purga-proyecto.sql
--
--   ejecutar=0 (por defecto en el wrapper): DRY-RUN. Recorre EXACTAMENTE el mismo
--              camino que la ejecución real y hace ROLLBACK.
--   ejecutar=1: además exige que `confirmar` repita exactamente los códigos.
--
-- Salida (una fila por línea, primer campo = tipo):
--   MODO|DRY-RUN|EJECUCION
--   PROYECTO|codigo|nombre|estatus
--   FILAS|esquema.tabla|n            (filas eliminadas, incluidas las de CASCADE)
--   ARCHIVO|ruta                     (rutas de archivos que quedan huérfanas)
--
-- Todo ocurre en UNA transacción: cualquier error (o verificación fallida) deja la
-- base exactamente como estaba. Las funciones viven en pg_temp: no persiste nada.
-- ============================================================================

\set ON_ERROR_STOP on
\if :{?esquemas}
\else
  \set esquemas 'auth,compras,gerencia_tecnica,control_proyectos,finanzas,contabilidad,personal,almacen,calidad,seguridad'
\endif

BEGIN;

SELECT set_config('purga.tenant', :'tenant', true) AS p_tenant,
       set_config('purga.codigos', :'codigos', true) AS p_codigos,
       set_config('purga.confirmar', :'confirmar', true) AS p_confirmar,
       set_config('purga.ejecutar', :'ejecutar', true) AS p_ejecutar,
       set_config('purga.esquemas', :'esquemas', true) AS p_esquemas \gset

-- ─── Guardas (todas bloqueantes) ─────────────────────────────────────────────
DO $guardas$
DECLARE
  v_codigos  text[];
  v_confirma text[];
  v_faltan   text[];
BEGIN
  -- Sin superusuario, RLS ocultaría filas: un "0 filas borradas" que parece éxito.
  IF current_setting('is_superuser') <> 'on' THEN
    RAISE EXCEPTION 'PURGA_SIN_SUPERUSUARIO: la conexión no es superusuario; RLS podría ocultar filas y la purga quedaría incompleta en silencio.';
  END IF;

  v_codigos := ARRAY(SELECT DISTINCT btrim(x) FROM unnest(string_to_array(current_setting('purga.codigos'), ',')) AS x WHERE btrim(x) <> '');
  IF coalesce(array_length(v_codigos, 1), 0) = 0 THEN
    RAISE EXCEPTION 'PURGA_SIN_CODIGOS: indica al menos un código de Centro de Costos.';
  END IF;
  IF array_length(v_codigos, 1) > 10 THEN
    RAISE EXCEPTION 'PURGA_DEMASIADOS_PROYECTOS: máximo 10 proyectos por corrida (se pidieron %).', array_length(v_codigos, 1);
  END IF;

  v_faltan := ARRAY(
    SELECT c FROM unnest(v_codigos) AS c
    WHERE NOT EXISTS (
      SELECT 1 FROM auth.proyectos p
      WHERE p.tenant_id = current_setting('purga.tenant')::uuid AND p.codigo_centro_costos = c
    )
  );
  IF coalesce(array_length(v_faltan, 1), 0) > 0 THEN
    RAISE EXCEPTION 'PURGA_CODIGO_INEXISTENTE: no existen en el tenant indicado: %', array_to_string(v_faltan, ', ');
  END IF;

  IF current_setting('purga.ejecutar') = '1' THEN
    v_confirma := ARRAY(SELECT DISTINCT btrim(x) FROM unnest(string_to_array(current_setting('purga.confirmar'), ',')) AS x WHERE btrim(x) <> '');
    IF (SELECT coalesce(array_agg(x ORDER BY x), '{}') FROM unnest(v_confirma) x)
       IS DISTINCT FROM (SELECT coalesce(array_agg(x ORDER BY x), '{}') FROM unnest(v_codigos) x) THEN
      RAISE EXCEPTION 'PURGA_CONFIRMACION_NO_COINCIDE: --confirmar debe repetir exactamente los códigos solicitados.';
    END IF;
  END IF;
END
$guardas$;

-- ─── Datos de trabajo (temporales, se descartan al terminar la transacción) ──
CREATE TEMP TABLE purga_objetivo ON COMMIT DROP AS
  SELECT id_proyecto, codigo_centro_costos, nombre_oficial, estatus
  FROM auth.proyectos
  WHERE tenant_id = current_setting('purga.tenant')::uuid
    AND codigo_centro_costos = ANY (
      ARRAY(SELECT DISTINCT btrim(x) FROM unnest(string_to_array(current_setting('purga.codigos'), ',')) AS x WHERE btrim(x) <> '')
    );

-- Todas las tablas base de los esquemas de servicio (para conteos antes/después).
CREATE TEMP TABLE purga_tablas_todas ON COMMIT DROP AS
  SELECT t.table_schema AS esquema, t.table_name AS tabla,
         format('%I.%I', t.table_schema, t.table_name)::regclass AS rel
  FROM information_schema.tables t
  WHERE t.table_type = 'BASE TABLE'
    AND t.table_schema = ANY (string_to_array(current_setting('purga.esquemas'), ','));

-- Las que llevan `proyecto_id`: el punto de partida del borrado.
CREATE TEMP TABLE purga_tablas_proyecto ON COMMIT DROP AS
  SELECT a.*
  FROM purga_tablas_todas a
  WHERE EXISTS (
    SELECT 1 FROM information_schema.columns c
    WHERE c.table_schema = a.esquema AND c.table_name = a.tabla AND c.column_name = 'proyecto_id'
  );

-- Las que llevan `tenant_id`: para comprobar que ningún otro tenant se ve afectado.
CREATE TEMP TABLE purga_tablas_tenant ON COMMIT DROP AS
  SELECT a.*
  FROM purga_tablas_todas a
  WHERE EXISTS (
    SELECT 1 FROM information_schema.columns c
    WHERE c.table_schema = a.esquema AND c.table_name = a.tabla AND c.column_name = 'tenant_id'
  );

-- Columnas que guardan la ruta de un archivo (por nombre): fuente del manifiesto.
CREATE TEMP TABLE purga_cols_ruta ON COMMIT DROP AS
  SELECT a.rel, c.column_name AS columna
  FROM purga_tablas_todas a
  JOIN information_schema.columns c ON c.table_schema = a.esquema AND c.table_name = a.tabla
  WHERE c.column_name ~* '(ruta|path)'
    AND c.data_type IN ('text', 'character varying');

CREATE TEMP TABLE purga_antes_total   (esquema text, tabla text, n bigint) ON COMMIT DROP;
CREATE TEMP TABLE purga_despues_total (esquema text, tabla text, n bigint) ON COMMIT DROP;
CREATE TEMP TABLE purga_antes_proy    (esquema text, tabla text, proyecto_id uuid, n bigint) ON COMMIT DROP;
CREATE TEMP TABLE purga_despues_proy  (esquema text, tabla text, proyecto_id uuid, n bigint) ON COMMIT DROP;
CREATE TEMP TABLE purga_antes_tenant  (esquema text, tabla text, tenant_id uuid, n bigint) ON COMMIT DROP;
CREATE TEMP TABLE purga_despues_tenant(esquema text, tabla text, tenant_id uuid, n bigint) ON COMMIT DROP;
CREATE TEMP TABLE purga_rutas_antes   (valor text) ON COMMIT DROP;
CREATE TEMP TABLE purga_rutas_despues (valor text) ON COMMIT DROP;

-- ─── Funciones (pg_temp: no persisten en la base) ────────────────────────────

-- Foto de conteos: total por tabla, por proyecto (excluyendo los objetivo), por tenant
-- (excluyendo el tenant objetivo) y rutas de archivo.
CREATE FUNCTION pg_temp.fotografiar(p_total text, p_proy text, p_tenant text, p_rutas text) RETURNS void LANGUAGE plpgsql AS $f$
DECLARE t record; c record;
BEGIN
  FOR t IN SELECT * FROM purga_tablas_todas LOOP
    EXECUTE format('INSERT INTO %I SELECT %L, %L, count(*) FROM %s', p_total, t.esquema, t.tabla, t.rel);
  END LOOP;
  FOR t IN SELECT * FROM purga_tablas_proyecto LOOP
    EXECUTE format(
      'INSERT INTO %I SELECT %L, %L, proyecto_id, count(*) FROM %s WHERE proyecto_id IS NULL OR proyecto_id NOT IN (SELECT id_proyecto FROM purga_objetivo) GROUP BY proyecto_id',
      p_proy, t.esquema, t.tabla, t.rel);
  END LOOP;
  FOR t IN SELECT * FROM purga_tablas_tenant LOOP
    EXECUTE format(
      'INSERT INTO %I SELECT %L, %L, tenant_id, count(*) FROM %s WHERE tenant_id IS DISTINCT FROM %L::uuid GROUP BY tenant_id',
      p_tenant, t.esquema, t.tabla, t.rel, current_setting('purga.tenant'));
  END LOOP;
  FOR c IN SELECT * FROM purga_cols_ruta LOOP
    EXECUTE format('INSERT INTO %I SELECT DISTINCT %I FROM %s WHERE %I IS NOT NULL', p_rutas, c.columna, c.rel, c.columna);
  END LOOP;
END
$f$;

-- Borra filas de `p_tabla` que cumplen `p_where`, ANTES eliminando recursivamente las
-- filas hijas que las referencian (FK RESTRICT, NO ACTION o CASCADE): así los nietos
-- RESTRICT colgados de un hijo CASCADE no bloquean el borrado. Las FK SET NULL las
-- resuelve la base. Aborta ante ciclos o FKs compuestas: mejor fallar que borrar mal.
CREATE FUNCTION pg_temp.purgar_filas(p_tabla regclass, p_where text, p_pila oid[] DEFAULT '{}') RETURNS void LANGUAGE plpgsql AS $f$
DECLARE
  fk record;
  col_hija text;
  col_padre text;
BEGIN
  IF p_tabla::oid = ANY (p_pila) THEN
    RAISE EXCEPTION 'PURGA_CICLO_FK: ciclo de claves foráneas que pasa por %; no se puede calcular un orden de borrado seguro.', p_tabla;
  END IF;

  FOR fk IN
    SELECT c.conname, c.conrelid::regclass AS hija, c.conkey, c.confkey
    FROM pg_constraint c
    WHERE c.contype = 'f' AND c.confrelid = p_tabla AND c.confdeltype IN ('r', 'a', 'c')
    ORDER BY c.conrelid::regclass::text, c.conname
  LOOP
    IF array_length(fk.conkey, 1) > 1 THEN
      RAISE EXCEPTION 'PURGA_FK_COMPUESTA: la restricción % de % es compuesta; la herramienta no la soporta.', fk.conname, fk.hija;
    END IF;
    SELECT attname INTO col_hija  FROM pg_attribute WHERE attrelid = fk.hija AND attnum = fk.conkey[1];
    SELECT attname INTO col_padre FROM pg_attribute WHERE attrelid = p_tabla AND attnum = fk.confkey[1];
    PERFORM pg_temp.purgar_filas(
      fk.hija,
      format('%I IN (SELECT %I FROM %s WHERE %s)', col_hija, col_padre, p_tabla, p_where),
      p_pila || p_tabla::oid
    );
  END LOOP;

  EXECUTE format('DELETE FROM %s WHERE %s', p_tabla, p_where);
END
$f$;

-- ─── Fotografía previa, manifiesto de archivos y borrado ─────────────────────
SELECT pg_temp.fotografiar('purga_antes_total', 'purga_antes_proy', 'purga_antes_tenant', 'purga_rutas_antes');

DO $borrar$
DECLARE
  p record;
  t record;
BEGIN
  FOR p IN SELECT id_proyecto FROM purga_objetivo ORDER BY codigo_centro_costos LOOP
    FOR t IN SELECT rel FROM purga_tablas_proyecto ORDER BY rel::text LOOP
      PERFORM pg_temp.purgar_filas(t.rel, format('proyecto_id = %L', p.id_proyecto));
    END LOOP;
    PERFORM pg_temp.purgar_filas('auth.proyectos'::regclass, format('id_proyecto = %L', p.id_proyecto));
  END LOOP;
END
$borrar$;

SELECT pg_temp.fotografiar('purga_despues_total', 'purga_despues_proy', 'purga_despues_tenant', 'purga_rutas_despues');

-- ─── Verificación posterior: cualquier diferencia => error => rollback ───────
DO $verificar$
DECLARE
  t record;
  restantes bigint;
  dif bigint;
BEGIN
  -- (a) no queda ninguna fila del proyecto en las tablas con proyecto_id
  FOR t IN SELECT * FROM purga_tablas_proyecto LOOP
    EXECUTE format('SELECT count(*) FROM %s WHERE proyecto_id IN (SELECT id_proyecto FROM purga_objetivo)', t.rel) INTO restantes;
    IF restantes > 0 THEN
      RAISE EXCEPTION 'PURGA_VERIFICACION_FALLIDA: quedan % filas del proyecto en %.%', restantes, t.esquema, t.tabla;
    END IF;
  END LOOP;
  IF EXISTS (SELECT 1 FROM auth.proyectos WHERE id_proyecto IN (SELECT id_proyecto FROM purga_objetivo)) THEN
    RAISE EXCEPTION 'PURGA_VERIFICACION_FALLIDA: el registro del proyecto sigue existiendo en auth.proyectos';
  END IF;

  -- (b) los demás proyectos conservan exactamente sus conteos por tabla
  SELECT count(*) INTO dif FROM (
    (SELECT * FROM purga_antes_proy EXCEPT SELECT * FROM purga_despues_proy)
    UNION ALL
    (SELECT * FROM purga_despues_proy EXCEPT SELECT * FROM purga_antes_proy)
  ) d;
  IF dif > 0 THEN
    RAISE EXCEPTION 'PURGA_VERIFICACION_FALLIDA: la purga cambiaría filas de OTROS proyectos (% diferencias por tabla/proyecto); se revierte todo.', dif;
  END IF;

  -- (c) los demás tenants conservan exactamente sus conteos por tabla
  SELECT count(*) INTO dif FROM (
    (SELECT * FROM purga_antes_tenant EXCEPT SELECT * FROM purga_despues_tenant)
    UNION ALL
    (SELECT * FROM purga_despues_tenant EXCEPT SELECT * FROM purga_antes_tenant)
  ) d;
  IF dif > 0 THEN
    RAISE EXCEPTION 'PURGA_VERIFICACION_FALLIDA: la purga cambiaría filas de OTROS tenants (% diferencias); se revierte todo.', dif;
  END IF;
END
$verificar$;

-- ─── Reporte ─────────────────────────────────────────────────────────────────
SELECT 'MODO', CASE WHEN current_setting('purga.ejecutar') = '1' THEN 'EJECUCION' ELSE 'DRY-RUN' END;

SELECT 'PROYECTO', codigo_centro_costos, nombre_oficial, estatus FROM purga_objetivo ORDER BY codigo_centro_costos;

SELECT 'FILAS', a.esquema || '.' || a.tabla, a.n - d.n
FROM purga_antes_total a
JOIN purga_despues_total d USING (esquema, tabla)
WHERE a.n <> d.n
ORDER BY a.esquema, a.tabla;

SELECT 'ARCHIVO', valor
FROM (SELECT valor FROM purga_rutas_antes EXCEPT SELECT valor FROM purga_rutas_despues) x
ORDER BY valor;

\if :ejecutar
  COMMIT;
\else
  ROLLBACK;
\endif
