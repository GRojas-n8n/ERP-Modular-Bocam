import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  const TENANT_ALFA_ID = '11111111-aaaa-bbbb-cccc-111111111111';
  const PROYECTO_TORRE_ID = '33333333-aaaa-bbbb-cccc-333333333333';

  console.log('🌱 Seed: Módulo Ventas');

  await prisma.factura.deleteMany({});
  await prisma.cotizacion.deleteMany({});
  await prisma.cliente.deleteMany({});

  const cliente = await prisma.cliente.create({
    data: {
      tenant_id: TENANT_ALFA_ID,
      rfc_tax_id: 'XAXX010101000',
      razon_social: 'CLIENTE DEMO S.A. DE C.V.',
      email_contacto: 'contacto@cliente.demo',
      estatus: 'ACTIVO',
    },
  });

  await prisma.cotizacion.create({
    data: {
      tenant_id: TENANT_ALFA_ID,
      proyecto_id: PROYECTO_TORRE_ID,
      cliente_id: cliente.id_cliente,
      codigo: 'COT-2026-001',
      estado: 'ENVIADA',
      subtotal: 10000,
      iva: 1600,
      total: 11600,
    },
  });

  console.log('✅ Seed Ventas completado.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
