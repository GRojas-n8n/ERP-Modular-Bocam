import { PrismaClient } from './generated/prisma';

/**
 * -----------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Módulo: Compras
 * Capa: Datos (Prisma con Inyección RLS)
 * -----------------------------------------------------------------------------
 */

// Instancia base (no usar directamente en lógica de negocio para evitar bypass de RLS)
const comprasDatabaseUrl = process.env.COMPRAS_DATABASE_URL || process.env.DATABASE_URL;
const basePrisma = new PrismaClient({
  ...(comprasDatabaseUrl
    ? {
        datasources: {
          db: {
            url: comprasDatabaseUrl,
          },
        },
      }
    : {}),
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

/**
 * Interface para el contexto de seguridad inyectado desde el App Shell (via JWT/Headers)
 */
export interface SecurityContext {
  tenantId: string;
  proyectoId: string;
  userId: string;
}

/**
 * Wrapper maestro que ejecuta operaciones de base de datos dentro de una 
 * transacción que establece el contexto RLS de PostgreSQL.
 * 
 * @param context Datos de identidad (tenant_id, proyecto_id)
 * @param callback Función que recibe el cliente prisma "seguro"
 */
export async function createTenantContext<T>(
  context: SecurityContext,
  callback: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  return await basePrisma.$transaction(async (tx) => {
    // 1. Inyectar variables de sesión en PostgreSQL (Sesión de la Transacción)
    // Esto activa las políticas RLS definidas en el DDL
    await tx.$executeRaw`
      SELECT set_config('app.current_tenant_id', ${context.tenantId}, true)
    `;
    await tx.$executeRaw`
      SELECT set_config('app.current_proyecto_id', ${context.proyectoId}, true)
    `;
    await tx.$executeRaw`
      SELECT set_config('app.current_user_id', ${context.userId}, true)
    `;

    // 2. Ejecutar la lógica de negocio con el cliente transaccional
    return await callback(tx as unknown as PrismaClient);
  });
}

export default basePrisma;
