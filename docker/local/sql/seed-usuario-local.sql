-- Usuario administrador LOCAL para entrar desde el navegador (bocam_auth).
--
-- Por qué este tenant: LoginView.tsx no pide tenant; manda siempre
-- VITE_DEFAULT_TENANT_ID, que en el build (igual al de producción) vale
-- 8e07a7ac-8157-4e5d-8499-e985a9fcdbfc. Los usuarios del seed de auth viven en
-- los tenants Alfa/Beta, así que sin esto no hay con quién entrar. Se crea un
-- tenant LOCAL con ese mismo ID (el ID ya es público en el código; aquí no hay
-- datos reales) para no tener que construir el frontend distinto a producción.
--
-- Se ejecuta como bocam_admin (superusuario, salta RLS). Idempotente.
-- Credenciales de prueba: ver LOCAL.md.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO tenants (id_tenant, nombre, plan, activo)
VALUES ('8e07a7ac-8157-4e5d-8499-e985a9fcdbfc', 'Constructora Local (pruebas)', 'ENTERPRISE', true)
ON CONFLICT (id_tenant) DO NOTHING;

INSERT INTO proyectos (id_proyecto, tenant_id, codigo_centro_costos, nombre_oficial, tipo_contrato, moneda_base, estatus)
VALUES ('aaaaaaaa-0000-4000-8000-000000000001', '8e07a7ac-8157-4e5d-8499-e985a9fcdbfc',
        'CC-LOCAL-01', 'Proyecto Local de Pruebas', 'PRECIOS_UNITARIOS', 'MXN', 'ABIERTO')
ON CONFLICT (id_proyecto) DO NOTHING;

INSERT INTO users (id_usuario, tenant_id, email, password_hash, nombre, rol_global,
                   limite_aprobacion_financiera, activo, updated_at)
VALUES ('aaaaaaaa-0000-4000-8000-0000000000ad', '8e07a7ac-8157-4e5d-8499-e985a9fcdbfc',
        'admin@iretum.local', crypt('Local.2026', gen_salt('bf', 12)), 'Admin Local',
        ARRAY['admin', 'superintendent'], 5000000, true, now())
ON CONFLICT (tenant_id, email) DO NOTHING;

INSERT INTO user_project_access (id, user_id, proyecto_id)
VALUES ('aaaaaaaa-0000-4000-8000-0000000000a1', 'aaaaaaaa-0000-4000-8000-0000000000ad',
        'aaaaaaaa-0000-4000-8000-000000000001')
ON CONFLICT (user_id, proyecto_id) DO NOTHING;
