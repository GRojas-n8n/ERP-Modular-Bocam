import { PrismaClient } from './generated/prisma';

/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Módulo: Finanzas (Tesorería y Flujo de Caja)
 * Capa: Datos (Prisma con Inyección RLS)
 *
 * PROPÓSITO:
 * Wrapper que garantiza que TODA operación de base de datos se ejecute
 * dentro de una transacción con las variables de sesión de PostgreSQL
 * configuradas, activando así las políticas RLS definidas en el DDL.
 * ---------------------------------------------------------------------------
 */

// Instancia base (NO usar directamente en lógica de negocio para evitar bypass de RLS)
const basePrisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

/**
 * Interface para el contexto de seguridad inyectado desde el JWT verificado.
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
 * FLUJO:
 * 1. Abre transacción
 * 2. SET LOCAL app.current_tenant_id = '...'
 * 3. SET LOCAL app.current_proyecto_id = '...'
 * 4. SET LOCAL app.current_user_id = '...'
 * 5. Ejecuta callback con Prisma seguro
 * 6. Commit o Rollback automático
 *
 * @param context Datos de identidad extraídos del JWT (NUNCA del body/headers)
 * @param callback Función que recibe el cliente prisma "seguro"
 */
export async function createTenantContext<T>(
  context: SecurityContext,
  callback: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  return await basePrisma.$transaction(async (tx) => {
    // Inyectar variables de sesión en PostgreSQL (Sesión de la Transacción)
    // Esto activa las políticas RLS definidas en el DDL del schema finanzas
    await tx.$executeRawUnsafe(`SET LOCAL app.current_tenant_id = '${context.tenantId}';`);
    await tx.$executeRawUnsafe(`SET LOCAL app.current_proyecto_id = '${context.proyectoId}';`);
    await tx.$executeRawUnsafe(`SET LOCAL app.current_user_id = '${context.userId}';`);

    // Ejecutar la lógica de negocio con el cliente transaccional
    return await callback(tx as unknown as PrismaClient);
  });
}

export default basePrisma;
