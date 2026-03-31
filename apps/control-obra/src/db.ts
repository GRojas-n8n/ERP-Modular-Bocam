import { PrismaClient } from './generated/prisma';

/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Módulo: Control de Obra
 * Capa: Datos (Prisma con Inyección RLS)
 *
 * Wrapper que inyecta variables de sesión en PostgreSQL antes de cada
 * transacción, activando las políticas RLS de aislamiento Multi-Tenant.
 * ---------------------------------------------------------------------------
 */

const controlObraDatabaseUrl = process.env.CONTROL_OBRA_DATABASE_URL || process.env.DATABASE_URL;
const basePrisma = new PrismaClient({
  ...(controlObraDatabaseUrl
    ? {
        datasources: {
          db: {
            url: controlObraDatabaseUrl,
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

/**
 * Ejecuta operaciones dentro de una transacción con RLS activo.
 * El tenant_id y proyecto_id se inyectan como SET LOCAL en PostgreSQL.
 */
export async function createTenantContext<T>(
  context: SecurityContext,
  callback: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  return await basePrisma.$transaction(async (tx: any) => {
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
