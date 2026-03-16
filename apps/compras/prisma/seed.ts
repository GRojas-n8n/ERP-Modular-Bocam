import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  const TENANT_ALFA_ID = '11111111-aaaa-bbbb-cccc-111111111111';
  const PROYECTO_TORRE_ID = '33333333-aaaa-bbbb-cccc-333333333333';

  console.log('🌱 Seed: Módulo Compras');

  // 1. Limpiar datos previos
  await prisma.requisicionItem.deleteMany({});
  await prisma.requisicion.deleteMany({});
  await prisma.ordenCompraItem.deleteMany({});
  await prisma.ordenCompra.deleteMany({});
  await prisma.proveedor.deleteMany({});

  // 2. Crear Proveedores
  const prov1 = await prisma.proveedor.create({
    data: {
      tenant_id: TENANT_ALFA_ID,
      rfc_tax_id: 'CEMEX800101XYZ',
      razon_social: 'CEMEX CONCRETOS S.A. DE C.V.',
      email_contacto: 'ventas@cemex.com',
      estatus: 'APROBADO'
    }
  });

  const prov2 = await prisma.proveedor.create({
    data: {
      tenant_id: TENANT_ALFA_ID,
      rfc_tax_id: 'ACEROMEX900505ABC',
      razon_social: 'ACEROS DE MEXICO S.A.',
      email_contacto: 'contacto@aceromex.com',
      estatus: 'APROBADO'
    }
  });

  console.log('✅ Proveedores creados.');

  // 3. Crear Requisición de Prueba
  // Referencia a Insumo MAT-CEM-01 (creado en el seed de Gerencia Técnica)
  // Nota: El UUID del insumo debe coincidir con el del otro microservicio si queremos integridad real en el App Shell
  // Para propósitos de este seed, usaremos UUIDs fijos que representen insumos conocidos.
  const INSUMO_CEMENTO_ID = '55555555-aaaa-bbbb-cccc-555555555555'; // Simulado

  await prisma.requisicion.create({
    data: {
      tenant_id: TENANT_ALFA_ID,
      proyecto_id: PROYECTO_TORRE_ID,
      codigo: 'REQ-2026-T1-001',
      solicitante_id: '99999999-aaaa-bbbb-cccc-999999999999',
      prioridad: 'URGENTE',
      estado: 'PENDIENTE',
      observaciones: 'Material urgente para colado de losa nivel 5.',
      items: {
        create: [
          {
            tenant_id: TENANT_ALFA_ID,
            proyecto_id: PROYECTO_TORRE_ID,
            insumo_id: INSUMO_CEMENTO_ID,
            cantidad: 50,
            notas: 'Entrega en obra antes de las 7:00 AM'
          }
        ]
      }
    }
  });

  console.log('✅ Requisiciones de prueba creadas.');

  // 4. Crear Cuadro Comparativo
  const req = await prisma.requisicion.findFirst({ where: { codigo: 'REQ-2026-T1-001' } });
  
  if (req) {
    const cuadro = await prisma.cuadroComparativo.create({
      data: {
        tenant_id: TENANT_ALFA_ID,
        proyecto_id: PROYECTO_TORRE_ID,
        requisicion_id: req.id_requisicion,
        codigo: 'CC-2026-T1-001',
        estado: 'ABIERTO',
        notas: 'Comparativa de cemento para losa nivel 5',
        detalles: {
          create: [
            {
              tenant_id: TENANT_ALFA_ID,
              proyecto_id: PROYECTO_TORRE_ID,
              proveedor_id: prov1.id_proveedor,
              insumo_id: INSUMO_CEMENTO_ID,
              precio_ofertado: 3200.50,
              tiempo_entrega: '2 días',
              es_ganador: true
            },
            {
              tenant_id: TENANT_ALFA_ID,
              proyecto_id: PROYECTO_TORRE_ID,
              proveedor_id: prov2.id_proveedor,
              insumo_id: INSUMO_CEMENTO_ID,
              precio_ofertado: 3450.00,
              tiempo_entrega: '5 días',
              es_ganador: false
            }
          ]
        }
      }
    });
    console.log('✅ Cuadro Comparativo de prueba creado.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
