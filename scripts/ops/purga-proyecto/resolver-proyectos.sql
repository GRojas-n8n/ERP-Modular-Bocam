\set ON_ERROR_STOP on

BEGIN READ ONLY;

SELECT set_config('purga.tenant', :'tenant', true),
       set_config('purga.codigos', :'codigos', true);

DO $guardas$
DECLARE
  v_codigos text[];
  v_faltan text[];
BEGIN
  IF current_setting('is_superuser') <> 'on' THEN
    RAISE EXCEPTION 'PURGA_SIN_SUPERUSUARIO: RLS podría ocultar proyectos.';
  END IF;

  v_codigos := ARRAY(
    SELECT DISTINCT btrim(x)
    FROM unnest(string_to_array(current_setting('purga.codigos'), ',')) x
    WHERE btrim(x) <> ''
  );

  IF coalesce(array_length(v_codigos, 1), 0) = 0 THEN
    RAISE EXCEPTION 'PURGA_SIN_CODIGOS: indica al menos un código.';
  END IF;
  IF array_length(v_codigos, 1) > 10 THEN
    RAISE EXCEPTION 'PURGA_DEMASIADOS_PROYECTOS: máximo 10 por corrida.';
  END IF;

  v_faltan := ARRAY(
    SELECT c
    FROM unnest(v_codigos) c
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.proyectos p
      WHERE p.tenant_id = current_setting('purga.tenant')::uuid
        AND p.codigo_centro_costos = c
    )
  );
  IF coalesce(array_length(v_faltan, 1), 0) > 0 THEN
    RAISE EXCEPTION 'PURGA_CODIGO_INEXISTENTE: %', array_to_string(v_faltan, ', ');
  END IF;
END
$guardas$;

SELECT id_proyecto, codigo_centro_costos, nombre_oficial, estatus
FROM public.proyectos
WHERE tenant_id = current_setting('purga.tenant')::uuid
  AND codigo_centro_costos = ANY (
    ARRAY(
      SELECT DISTINCT btrim(x)
      FROM unnest(string_to_array(current_setting('purga.codigos'), ',')) x
      WHERE btrim(x) <> ''
    )
  )
ORDER BY codigo_centro_costos;

ROLLBACK;
