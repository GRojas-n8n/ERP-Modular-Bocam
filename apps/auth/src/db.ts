import { PrismaClient } from './generated/prisma';

/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Modulo: Auth (IAM)
 * Capa: Datos con contexto de tenant
 * ---------------------------------------------------------------------------
 */

const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';

const basePrisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

export interface AuthSecurityContext {
  tenantId: string;
  userId?: string;
}

export async function createTenantContext<T>(
  context: AuthSecurityContext,
  callback: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  if (!context.tenantId) {
    throw new Error(
      '[BOCAM::AUTH::DB] VIOLACION CRITICA: tenantId es obligatorio para activar RLS.'
    );
  }

  return basePrisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      SELECT set_config('app.current_tenant_id', ${context.tenantId}, true)
    `;
    await tx.$executeRaw`
      SELECT set_config('app.current_user_id', ${context.userId || SYSTEM_USER_ID}, true)
    `;

    return callback(tx as unknown as PrismaClient);
  });
}

export async function runAsSystem<T>(
  callback: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  return callback(basePrisma);
}

export async function disconnectDb(): Promise<void> {
  await basePrisma.$disconnect();
}

export default basePrisma;
