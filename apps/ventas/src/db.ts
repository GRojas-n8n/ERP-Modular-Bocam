import { PrismaClient } from './generated/prisma';

/**
 * -----------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Módulo: Ventas
 * Capa: Datos (Prisma con Inyección RLS)
 * -----------------------------------------------------------------------------
 */

const ventasDatabaseUrl = process.env.VENTAS_DATABASE_URL || process.env.DATABASE_URL;
const basePrisma = new PrismaClient({
  ...(ventasDatabaseUrl
    ? {
        datasources: {
          db: {
            url: ventasDatabaseUrl,
          },
        },
      }
    : {}),
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export interface SecurityContext {
  tenantId: string;
  proyectoId: string;
  userId: string;
}

export async function createTenantContext<T>(
  context: SecurityContext,
  callback: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  return await basePrisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      SELECT set_config('app.current_tenant_id', ${context.tenantId}, true)
    `;
    await tx.$executeRaw`
      SELECT set_config('app.current_proyecto_id', ${context.proyectoId}, true)
    `;
    await tx.$executeRaw`
      SELECT set_config('app.current_user_id', ${context.userId}, true)
    `;

    return await callback(tx as unknown as PrismaClient);
  });
}

export default basePrisma;
