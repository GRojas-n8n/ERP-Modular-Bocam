// -----------------------------------------------------------------------------
// Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
// Módulo: Calidad — Capa de Datos (Prisma + RLS)
// -----------------------------------------------------------------------------

import { PrismaClient } from './generated/prisma';

const calidadDatabaseUrl = process.env.CALIDAD_DATABASE_URL || process.env.DATABASE_URL;

const basePrisma = new PrismaClient({
  ...(calidadDatabaseUrl ? { datasources: { db: { url: calidadDatabaseUrl } } } : {}),
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export interface CalidadContext {
  tenantId: string;
  userId: string;
}

export async function createCalidadContext<T>(
  context: CalidadContext,
  callback: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  return await basePrisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${context.tenantId}, true)`;
    await tx.$executeRaw`SELECT set_config('app.current_proyecto_id', '', true)`;
    await tx.$executeRaw`SELECT set_config('app.current_user_id', ${context.userId}, true)`;
    return await callback(tx as unknown as PrismaClient);
  });
}

export async function disconnectDb(): Promise<void> {
  await basePrisma.$disconnect();
}

export default basePrisma;
