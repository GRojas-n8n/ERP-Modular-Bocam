-- Entorno LOCAL (docker-compose.local.yml). Replica el layout del VPS real:
-- un solo cluster Postgres con UNA BASE POR SERVICIO (tablas en public, cada
-- una con su propia _prisma_migrations) y el rol de runtime bocam_app sin
-- SUPERUSER ni BYPASSRLS. El superusuario es POSTGRES_USER (bocam_admin),
-- usado solo para migraciones, seeds y rls-policies.sql.
-- Fuente del layout: openspec/changes/archive/2026-07-11-fix-rls-bypass-bocam-admin/tasks.md

\getenv app_pw LOCAL_APP_DB_PASSWORD

CREATE ROLE bocam_app LOGIN PASSWORD :'app_pw'
  NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE;

CREATE DATABASE bocam_auth;
CREATE DATABASE bocam_gerencia_tecnica;
CREATE DATABASE bocam_compras;
CREATE DATABASE bocam_finanzas;
CREATE DATABASE bocam_personal;
CREATE DATABASE bocam_seguridad;
CREATE DATABASE bocam_ventas;
CREATE DATABASE bocam_contabilidad;
CREATE DATABASE bocam_calidad;
CREATE DATABASE bocam_almacen;
CREATE DATABASE bocam_control_proyectos;
