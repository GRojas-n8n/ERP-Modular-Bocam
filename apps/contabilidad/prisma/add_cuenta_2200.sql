-- Contabilidad — agregar cuenta 2200 Nómina por Pagar (nomina-a-contabilidad)
-- Ejecutar en bocam_contabilidad DB

INSERT INTO cuentas_contables (id_cuenta, clave, nombre, tipo, naturaleza, nivel, activa, created_at)
VALUES (gen_random_uuid(), '2200', 'Nómina por Pagar', 'PASIVO', 'ACREEDORA', 1, true, NOW())
ON CONFLICT (clave) DO NOTHING;
