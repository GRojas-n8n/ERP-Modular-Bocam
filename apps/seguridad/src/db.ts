import { PrismaClient } from './generated/prisma';

/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Módulo: Seguridad / HSE — Capa de Datos con RLS
 * ---------------------------------------------------------------------------
 */

const basePrisma = new PrismaClient({
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
