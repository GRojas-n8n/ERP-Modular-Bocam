export type ContextRunner<TContext, TClient> = <TResult>(
  context: TContext,
  callback: (client: TClient) => Promise<TResult>
) => Promise<TResult>;

type RecoveryResultState = 'existing' | 'created' | 'race_recovered';

export interface CreateOrRecoverResult<T> {
  record: T;
  state: RecoveryResultState;
}

export interface ApplyIdempotentMutationParams<TLoaded, TResult> {
  load: () => Promise<TLoaded>;
  idempotentResult: (loaded: TLoaded) => Promise<TResult | null>;
  apply: (loaded: TLoaded) => Promise<TResult>;
}

export interface ContextualApplyIdempotentMutationParams<TContext, TClient, TLoaded, TResult> {
  context: TContext;
  runInContext: ContextRunner<TContext, TClient>;
  load: (client: TClient) => Promise<TLoaded>;
  idempotentResult: (loaded: TLoaded, client: TClient) => Promise<TResult | null>;
  apply: (loaded: TLoaded, client: TClient) => Promise<TResult>;
}

export interface ContextualApplyTerminalMutationParams<
  TContext,
  TClient,
  TLoaded,
  TNotFoundResult,
  TIdempotentResult,
  TAppliedResult,
> {
  context: TContext;
  runInContext: ContextRunner<TContext, TClient>;
  load: (client: TClient) => Promise<TLoaded>;
  notFoundResult: (loaded: TLoaded, client: TClient) => Promise<TNotFoundResult | null>;
  idempotentResult: (loaded: TLoaded, client: TClient) => Promise<TIdempotentResult | null>;
  apply: (loaded: TLoaded, client: TClient) => Promise<TAppliedResult>;
}

export interface ContextualCreateOrRecoverParams<TContext, TClient, TRecord> {
  context: TContext;
  runInContext: ContextRunner<TContext, TClient>;
  findExisting: (client: TClient) => Promise<TRecord | null>;
  create: (client: TClient) => Promise<TRecord>;
  recoverOnUniqueViolation: (client: TClient) => Promise<TRecord | null>;
}

export type TerminalState = 'not_found' | 'idempotent' | 'applied';

export interface TerminalLogActions {
  notFound: string;
  idempotent: string;
  applied: string;
}

export interface TerminalLogContext {
  eventType?: string;
  correlationId?: string;
  tenantId?: string;
  proyectoId?: string;
}

export interface LogTerminalStateParams<TExtras extends Record<string, unknown> = Record<string, unknown>> {
  terminalState: TerminalState;
  actions: TerminalLogActions;
  context: TerminalLogContext;
  extras?: TExtras;
}

export type HttpTerminalSuccessState = 'applied' | 'idempotent' | 'accepted';

export interface TerminalHttpResponseContext {
  tenantId?: string;
  proyectoId?: string;
  correlationId?: string;
}

export interface BuildTerminalHttpResponseParams<TData, TBody> {
  terminalState: HttpTerminalSuccessState;
  data: TData;
  context: TerminalHttpResponseContext;
  buildBody: (data: TData, context: TerminalHttpResponseContext) => TBody;
  statusCodes?: Partial<Record<HttpTerminalSuccessState, number>>;
}

function isUniqueConstraintError(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === 'P2002';
}

export function logTerminalState<TExtras extends Record<string, unknown> = Record<string, unknown>>(
  params: LogTerminalStateParams<TExtras>
): void {
  const action =
    params.terminalState === 'not_found'
      ? params.actions.notFound
      : params.terminalState === 'idempotent'
        ? params.actions.idempotent
        : params.actions.applied;

  const payload = {
    action,
    event_type: params.context.eventType,
    correlation_id: params.context.correlationId,
    tenant_id: params.context.tenantId,
    proyecto_id: params.context.proyectoId,
    ...(params.extras ?? {}),
  };

  if (params.terminalState === 'not_found') {
    console.warn(JSON.stringify(payload));
    return;
  }

  console.log(JSON.stringify(payload));
}

export function buildTerminalHttpResponse<TData, TBody>(
  params: BuildTerminalHttpResponseParams<TData, TBody>
): { statusCode: number; body: TBody } {
  const statusCode =
    params.statusCodes?.[params.terminalState] ??
    (params.terminalState === 'accepted' ? 202 : 200);

  return {
    statusCode,
    body: params.buildBody(params.data, params.context),
  };
}

export async function applyIdempotentMutation<TLoaded, TResult>(
  params: ApplyIdempotentMutationParams<TLoaded, TResult>
): Promise<TResult> {
  const loaded = await params.load();
  const existing = await params.idempotentResult(loaded);
  if (existing) {
    return existing;
  }

  return await params.apply(loaded);
}

export async function applyIdempotentMutationInContext<TContext, TClient, TLoaded, TResult>(
  params: ContextualApplyIdempotentMutationParams<TContext, TClient, TLoaded, TResult>
): Promise<TResult> {
  return await params.runInContext(params.context, async (client) => {
    return await applyIdempotentMutation({
      load: async () => await params.load(client),
      idempotentResult: async (loaded) => await params.idempotentResult(loaded, client),
      apply: async (loaded) => await params.apply(loaded, client),
    });
  });
}

export async function applyTerminalMutationInContext<
  TContext,
  TClient,
  TLoaded,
  TNotFoundResult,
  TIdempotentResult,
  TAppliedResult,
>(
  params: ContextualApplyTerminalMutationParams<
    TContext,
    TClient,
    TLoaded,
    TNotFoundResult,
    TIdempotentResult,
    TAppliedResult
  >
): Promise<TNotFoundResult | TIdempotentResult | TAppliedResult> {
  return await params.runInContext(params.context, async (client) => {
    const loaded = await params.load(client);

    const notFound = await params.notFoundResult(loaded, client);
    if (notFound) {
      return notFound;
    }

    const idempotent = await params.idempotentResult(loaded, client);
    if (idempotent) {
      return idempotent;
    }

    return await params.apply(loaded, client);
  });
}

export async function createOrRecoverInContext<TContext, TClient, TRecord>(
  params: ContextualCreateOrRecoverParams<TContext, TClient, TRecord>
): Promise<CreateOrRecoverResult<TRecord>> {
  try {
    return await params.runInContext(params.context, async (client) => {
      const existing = await params.findExisting(client);
      if (existing) {
        return {
          record: existing,
          state: 'existing' as const,
        };
      }

      const created = await params.create(client);
      return {
        record: created,
        state: 'created' as const,
      };
    });
  } catch (error) {
    if (!isUniqueConstraintError(error)) {
      throw error;
    }

    const recovered = await params.runInContext(params.context, async (client) => {
      return await params.recoverOnUniqueViolation(client);
    });

    if (!recovered) {
      throw error;
    }

    return {
      record: recovered,
      state: 'race_recovered' as const,
    };
  }
}
