import { PrismaClient } from './generated/prisma';

const prisma = new PrismaClient();

async function main() {
  const tenantId = '11111111-aaaa-bbbb-cccc-111111111111';
  const rfc = `TEST${Date.now()}`.slice(0, 20);

  const created = await prisma.cliente.create({
    data: {
      tenant_id: tenantId,
      rfc_tax_id: rfc,
      razon_social: 'CLIENTE PRUEBA CONEXION',
      email_contacto: 'qa@bocam.local',
      estatus: 'ACTIVO',
    },
  });

  console.log('Cliente de prueba creado:', created.id_cliente);

  await prisma.cliente.delete({
    where: { id_cliente: created.id_cliente },
  });

  console.log('Cliente de prueba eliminado. Conexion OK.');
}

main()
  .catch((error) => {
    console.error('Fallo la prueba de conexion a BD:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
