import prisma from '../db';

export class ClienteService {
  async crearCliente(data: {
    tenant_id: string;
    rfc_tax_id: string;
    razon_social: string;
    tercero_id?: string;
    email_contacto?: string;
    telefono?: string;
    estatus?: string;
  }) {
    return prisma.cliente.create({ data });
  }

  async listarClientes(tenantId: string) {
    return prisma.cliente.findMany({
      where: { tenant_id: tenantId },
      orderBy: { razon_social: 'asc' },
    });
  }
}
