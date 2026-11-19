-- Rellena el beneficiario de las pólizas PASIVO_PROYECTADO que guardaron el id del proveedor en vez de su nombre
-- (openspec: contabilidad-beneficiario-pasivo-proyectado). Contabilidad no lee la base de Compras: los nombres
-- llegan en /tmp/proveedores.csv exportado de Compras. Simulación por defecto; aplica solo con -v aplicar=1.
-- Uso: psql -U "$PGU" -d "$CON_DB" -v schema="$CON_SCHEMA" [-v aplicar=1] -f backfill-beneficiario-pasivo-proyectado.sql
\set ON_ERROR_STOP on
\if :{?aplicar}
\else
  \set aplicar 0
\endif
SET search_path TO :"schema";
BEGIN;
CREATE TEMP TABLE carga_proveedores (tenant_id uuid, id_proveedor uuid, razon_social text) ON COMMIT DROP;
\copy carga_proveedores FROM '/tmp/proveedores.csv' CSV HEADER
\echo 'Pólizas PASIVO_PROYECTADO cuyo beneficiario es el id de un proveedor (se actualizarían):'
SELECT a.folio_poliza, a.beneficiario AS beneficiario_actual, left(p.razon_social, 255) AS beneficiario_nuevo
  FROM asientos_contables a
  JOIN carga_proveedores p ON p.tenant_id = a.tenant_id AND p.id_proveedor::text = a.beneficiario
 WHERE a.tipo_poliza = 'PASIVO_PROYECTADO'
 ORDER BY a.created_at;
\if :aplicar
UPDATE asientos_contables a
   SET beneficiario = left(p.razon_social, 255), updated_at = now()
  FROM carga_proveedores p
 WHERE a.tipo_poliza = 'PASIVO_PROYECTADO'
   AND p.tenant_id = a.tenant_id
   AND p.id_proveedor::text = a.beneficiario
   AND coalesce(trim(p.razon_social), '') <> '';
\echo 'APLICADO.'
COMMIT;
\else
\echo 'SIMULACIÓN: no se cambió nada. Para aplicar, repetir con -v aplicar=1.'
ROLLBACK;
\endif
