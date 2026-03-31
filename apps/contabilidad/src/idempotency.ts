import type { PrismaClient } from './generated/prisma';
import { createTenantContext, type SecurityContext } from './db';
import { applyTerminalMutationInContext } from '../../../packages/tenant-idempotency/src';

type RecoveryResultState = 'existing' | 'created' | 'race_recovered';

export interface TenantScopedCreateOrRecoverParams<T> {
  context: SecurityContext;
  findExisting: (prisma: PrismaClient) => Promise<T | null>;
  create: (prisma: PrismaClient) => Promise<T>;
  recoverOnUniqueViolation: (prisma: PrismaClient) => Promise<T | null>;
}

export interface CreateOrRecoverResult<T> {
  record: T;
  state: RecoveryResultState;
}

export interface FunctionalReferenceLookupParams {
  context: SecurityContext;
  referenciaFuncional: string;
  tipoPoliza: string;
  attempts?: number;
  delayMs?: number;
}

export interface FunctionalReferenceReconciliationParams {
  context: SecurityContext;
  referenciaFuncional: string;
  tipoPoliza: string;
  reconciliationKey: string;
  noteToAppend: string;
  attempts?: number;
  delayMs?: number;
}

export interface FunctionalReferenceReconciliationResult<T> {
  asiento: T | null;
  state: 'not_found' | 'idempotent' | 'applied';
}

export interface ApplyIdempotentMutationParams<TLoaded, TResult> {
  context: SecurityContext;
  load: (prisma: PrismaClient) => Promise<TLoaded>;
  idempotentResult: (loaded: TLoaded, prisma: PrismaClient) => Promise<TResult | null>;
  apply: (loaded: TLoaded, prisma: PrismaClient) => Promise<TResult>;
}

export interface ApplyIdempotentMutationDirectParams<TLoaded, TResult> {
  load: () => Promise<TLoaded>;
  idempotentResult: (loaded: TLoaded) => Promise<TResult | null>;
  apply: (loaded: TLoaded) => Promise<TResult>;
}

function isUniqueConstraintError(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === 'P2002';
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function createOrRecoverInTenantContext<T>(
  params: TenantScopedCreateOrRecoverParams<T>
): Promise<CreateOrRecoverResult<T>> {
  try {
    return await createTenantContext(params.context, async (prisma) => {
      const existing = await params.findExisting(prisma);
      if (existing) {
        return {
          record: existing,
          state: 'existing' as const,
        };
      }

      const created = await params.create(prisma);
      return {
        record: created,
        state: 'created' as const,
      };
    });
  } catch (error) {
    if (!isUniqueConstraintError(error)) {
      throw error;
    }

    const recovered = await createTenantContext(params.context, async (prisma) => {
      return await params.recoverOnUniqueViolation(prisma);
    });

    if (!recovered) {
      throw error;
    }

    return {
      record: recovered,
      state: 'race_recovered',
    };
  }
}

export async function findAsientoByFunctionalReferenceWithRetry(
  params: FunctionalReferenceLookupParams
) {
  const attempts = params.attempts ?? 6;
  const delayMs = params.delayMs ?? 250;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const asiento = await createTenantContext(params.context, async (prisma) => {
      return await prisma.asientoContable.findFirst({
        where: {
          tenant_id: params.context.tenantId,
          referencia_funcional: params.referenciaFuncional,
          tipo_poliza: params.tipoPoliza,
        },
        orderBy: {
          created_at: 'desc',
        },
      });
    });

    if (asiento) {
      return asiento;
    }

    if (attempt < attempts - 1) {
      await delay(delayMs);
    }
  }

  return null;
}

export async function reconcileAsientoByFunctionalReference(
  params: FunctionalReferenceReconciliationParams
): Promise<FunctionalReferenceReconciliationResult<any>> {
  const attempts = params.attempts ?? 6;
  const delayMs = params.delayMs ?? 250;

  return await applyTerminalMutationInContext({
    context: params.context,
    runInContext: createTenantContext,
    load: async (prisma) => {
      for (let attempt = 0; attempt < attempts; attempt += 1) {
        const asiento = await prisma.asientoContable.findFirst({
          where: {
            tenant_id: params.context.tenantId,
            referencia_funcional: params.referenciaFuncional,
            tipo_poliza: params.tipoPoliza,
          },
          orderBy: {
            created_at: 'desc',
          },
        });

        if (asiento) {
          return asiento;
        }

        if (attempt < attempts - 1) {
          await delay(delayMs);
        }
      }

      return null;
    },
    notFoundResult: async (asiento) => {
      if (asiento) {
        return null;
      }

      return {
        asiento: null,
        state: 'not_found' as const,
      };
    },
    idempotentResult: async (asiento) => {
      if (!asiento || asiento.evento_conciliacion_key !== params.reconciliationKey) {
        return null;
      }

      return {
        asiento,
        state: 'idempotent' as const,
      };
    },
    apply: async (asiento, prisma) => {
      const updated = await prisma.asientoContable.update({
        where: {
          id_asiento: asiento!.id_asiento,
        },
        data: {
          evento_conciliacion_key: params.reconciliationKey,
          conciliado_at: new Date(),
          notas: `${asiento!.notas || ''} ${params.noteToAppend}`.trim(),
        },
      });

      return {
        asiento: updated,
        state: 'applied' as const,
      };
    },
  });
}

export async function applyIdempotentMutationInTenantContext<TLoaded, TResult>(
  params: ApplyIdempotentMutationParams<TLoaded, TResult>
): Promise<TResult> {
  return await createTenantContext(params.context, async (prisma) => {
    return await applyIdempotentMutation({
      load: async () => await params.load(prisma),
      idempotentResult: async (loaded) => await params.idempotentResult(loaded, prisma),
      apply: async (loaded) => await params.apply(loaded, prisma),
    });
  });
}

export async function applyIdempotentMutation<TLoaded, TResult>(
  params: ApplyIdempotentMutationDirectParams<TLoaded, TResult>
): Promise<TResult> {
  const loaded = await params.load();
  const existing = await params.idempotentResult(loaded);
  if (existing) {
    return existing;
  }

  return await params.apply(loaded);
}
