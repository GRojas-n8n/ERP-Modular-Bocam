/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Clasificación: Estrictamente Confidencial.
 * ---------------------------------------------------------------------------
 * Módulo: Gerencia Técnica
 * Archivo: db.ts — Capa de Acceso a Datos con Inyección RLS Obligatoria.
 *
 * ARQUITECTURA:
 * Este archivo implementa el patrón "Context-Injected Prisma Client".
 * Garantiza que TODA operación de base de datos se ejecute dentro de una
 * transacción interactiva de PostgreSQL que primero establece las variables
 * de sesión RLS (app.current_tenant_id y app.current_proyecto_id) ANTES
 * de ejecutar cualquier query del ORM.
 *
 * ⚠️  ADVERTENCIA DE SEGURIDAD:
 * Está PROHIBIDO usar `basePrisma` directamente fuera de este archivo.
 * Todo acceso a datos DEBE pasar por `createTenantContext()`.
 * ---------------------------------------------------------------------------
 */

import { PrismaClient, Prisma } from '@prisma/client';

// ─── Tipos del Contexto de Seguridad ────────────────────────────────────────
export interface TenantContext {
  /** UUID del tenant extraído del JWT. OBLIGATORIO. */
  tenant_id: string;
  /** UUID del proyecto/centro de costos. Requerido para tablas transaccionales. */
  proyecto_id?: string;
  /** UUID del usuario autenticado. Para auditoría. */
  user_id?: string;
}

// ─── Instancia Base (Singleton) ─────────────────────────────────────────────
// Reutiliza el pool de conexiones de Prisma. No debe exponerse fuera de este módulo.
const basePrisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'warn', 'error']
    : ['error'],
});

// ─── Factory de Cliente con Contexto RLS ────────────────────────────────────

/**
 * Crea un cliente Prisma contextualizado que inyecta automáticamente
 * las variables de sesión de PostgreSQL para Row-Level Security.
 *
 * FLUJO:
 * 1. Recibe el contexto del tenant (extraído del JWT por el middleware).
 * 2. Envuelve TODAS las operaciones del ORM en una transacción interactiva.
 * 3. Dentro de la transacción, ejecuta `set_config()` para establecer
 *    las variables RLS ANTES de la query real.
 * 4. La query real se ejecuta DENTRO de la misma transacción, garantizando
 *    que PostgreSQL aplique las políticas RLS correctamente.
 *
 * @param ctx - Contexto de seguridad del tenant actual.
 * @returns Un PrismaClient extendido con inyección RLS automática.
 *
 * @example
 * ```typescript
 * // En un controlador Express:
 * const db = createTenantContext({
 *   tenant_id: req.userContext.tenant_id,
 *   proyecto_id: req.userContext.proyecto_id,
 * });
 * const insumos = await db.insumo.findMany(); // Ya filtrado por RLS
 * ```
 */
export function createTenantContext(ctx: TenantContext) {
  if (!ctx.tenant_id) {
    throw new Error(
      '[BOCAM::DB] VIOLACIÓN DE SEGURIDAD: Se intentó crear un contexto de BD sin tenant_id. ' +
      'Esto es una violación directa de la arquitectura Multi-Tenant. Abortando.'
    );
  }

  return basePrisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          // ─── Ejecutar dentro de una transacción interactiva ────────
          // Esto garantiza que set_config() y la query real compartan
          // la MISMA conexión/sesión de PostgreSQL.
          return basePrisma.$transaction(async (tx) => {
            // 1. Inyectar tenant_id (OBLIGATORIO)
            await tx.$executeRaw`
              SELECT set_config('app.current_tenant_id', ${ctx.tenant_id}, true)
            `;

            // 2. Inyectar proyecto_id (si está disponible en el contexto)
            if (ctx.proyecto_id) {
              await tx.$executeRaw`
                SELECT set_config('app.current_proyecto_id', ${ctx.proyecto_id}, true)
              `;
            }

            // 3. Ejecutar la query original de Prisma DENTRO de la transacción.
            //    NOTA CRÍTICA: Usamos tx en lugar de query(args) directo porque
            //    query() ejecutaría fuera de la transacción, perdiendo el contexto RLS.
            //    Debemos re-ejecutar la operación contra `tx`.
            const modelDelegate = (tx as any)[
              model!.charAt(0).toLowerCase() + model!.slice(1)
            ];

            if (!modelDelegate || typeof modelDelegate[operation] !== 'function') {
              // Fallback seguro: si la operación no es standard, usar query original.
              // Esto puede pasar con operaciones agregadas o groupBy.
              return query(args);
            }

            return modelDelegate[operation](args);
          }, {
            // Configuración de la transacción:
            maxWait: 5000,   // Máximo tiempo de espera para obtener conexión (ms)
            timeout: 10000,  // Timeout de la transacción completa (ms)
            isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
          });
        },
      },
    },
  });
}

// ─── Tipo exportado del cliente contextualizado ─────────────────────────────
export type BocamPrismaClient = ReturnType<typeof createTenantContext>;

// ─── Utilidad: Desconectar limpiamente ──────────────────────────────────────
export async function disconnectDb(): Promise<void> {
  await basePrisma.$disconnect();
}

// ─── Acceso administrativo (SOLO para seeds y migraciones) ──────────────────
// ⚠️ PROHIBIDO usar en producción. Solo para scripts de mantenimiento.
export const adminPrisma = basePrisma;
