-- Catálogo de cuentas contables base (constructora SAT-compatible)
-- Ejecutar UNA VEZ tras el primer db push en VPS.
-- Idempotente: ON CONFLICT DO NOTHING

INSERT INTO cuentas_contables (id_cuenta, clave, nombre, tipo, naturaleza, nivel, activa, created_at)
VALUES
  (gen_random_uuid(), '1100', 'Bancos',                    'ACTIVO',   'DEUDORA',   1, true, NOW()),
  (gen_random_uuid(), '1200', 'Cuentas por Cobrar',        'ACTIVO',   'DEUDORA',   1, true, NOW()),
  (gen_random_uuid(), '1300', 'Inventarios',               'ACTIVO',   'DEUDORA',   1, true, NOW()),
  (gen_random_uuid(), '1400', 'Anticipos a Proveedores',   'ACTIVO',   'DEUDORA',   1, true, NOW()),
  (gen_random_uuid(), '2100', 'Cuentas por Pagar',         'PASIVO',   'ACREEDORA', 1, true, NOW()),
  (gen_random_uuid(), '2300', 'IVA Trasladado por Pagar',  'PASIVO',   'ACREEDORA', 1, true, NOW()),
  (gen_random_uuid(), '3100', 'Capital Social',            'CAPITAL',  'ACREEDORA', 1, true, NOW()),
  (gen_random_uuid(), '3200', 'Utilidades Retenidas',      'CAPITAL',  'ACREEDORA', 1, true, NOW()),
  (gen_random_uuid(), '4100', 'Ingresos por Contratos',    'INGRESO',  'ACREEDORA', 1, true, NOW()),
  (gen_random_uuid(), '5100', 'Costo Directo de Obra',     'COSTO',    'DEUDORA',   1, true, NOW()),
  (gen_random_uuid(), '5110', 'Materiales',                'COSTO',    'DEUDORA',   2, true, NOW()),
  (gen_random_uuid(), '5120', 'Mano de Obra',              'COSTO',    'DEUDORA',   2, true, NOW()),
  (gen_random_uuid(), '5130', 'Maquinaria y Equipo',       'COSTO',    'DEUDORA',   2, true, NOW()),
  (gen_random_uuid(), '5140', 'Subcontratos',              'COSTO',    'DEUDORA',   2, true, NOW()),
  (gen_random_uuid(), '6100', 'Gastos de Administración',  'GASTO',    'DEUDORA',   1, true, NOW())
ON CONFLICT (clave) DO NOTHING;
