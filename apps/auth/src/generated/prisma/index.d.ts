
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Tenant
 * 
 */
export type Tenant = $Result.DefaultSelection<Prisma.$TenantPayload>
/**
 * Model Proyecto
 * 
 */
export type Proyecto = $Result.DefaultSelection<Prisma.$ProyectoPayload>
/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model UserProjectAccess
 * 
 */
export type UserProjectAccess = $Result.DefaultSelection<Prisma.$UserProjectAccessPayload>
/**
 * Model RefreshToken
 * 
 */
export type RefreshToken = $Result.DefaultSelection<Prisma.$RefreshTokenPayload>
/**
 * Model MasterAuditLog
 * 
 */
export type MasterAuditLog = $Result.DefaultSelection<Prisma.$MasterAuditLogPayload>
/**
 * Model TenantAuditLog
 * 
 */
export type TenantAuditLog = $Result.DefaultSelection<Prisma.$TenantAuditLogPayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Tenants
 * const tenants = await prisma.tenant.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Tenants
   * const tenants = await prisma.tenant.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.tenant`: Exposes CRUD operations for the **Tenant** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tenants
    * const tenants = await prisma.tenant.findMany()
    * ```
    */
  get tenant(): Prisma.TenantDelegate<ExtArgs>;

  /**
   * `prisma.proyecto`: Exposes CRUD operations for the **Proyecto** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Proyectos
    * const proyectos = await prisma.proyecto.findMany()
    * ```
    */
  get proyecto(): Prisma.ProyectoDelegate<ExtArgs>;

  /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs>;

  /**
   * `prisma.userProjectAccess`: Exposes CRUD operations for the **UserProjectAccess** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserProjectAccesses
    * const userProjectAccesses = await prisma.userProjectAccess.findMany()
    * ```
    */
  get userProjectAccess(): Prisma.UserProjectAccessDelegate<ExtArgs>;

  /**
   * `prisma.refreshToken`: Exposes CRUD operations for the **RefreshToken** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more RefreshTokens
    * const refreshTokens = await prisma.refreshToken.findMany()
    * ```
    */
  get refreshToken(): Prisma.RefreshTokenDelegate<ExtArgs>;

  /**
   * `prisma.masterAuditLog`: Exposes CRUD operations for the **MasterAuditLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MasterAuditLogs
    * const masterAuditLogs = await prisma.masterAuditLog.findMany()
    * ```
    */
  get masterAuditLog(): Prisma.MasterAuditLogDelegate<ExtArgs>;

  /**
   * `prisma.tenantAuditLog`: Exposes CRUD operations for the **TenantAuditLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TenantAuditLogs
    * const tenantAuditLogs = await prisma.tenantAuditLog.findMany()
    * ```
    */
  get tenantAuditLog(): Prisma.TenantAuditLogDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Tenant: 'Tenant',
    Proyecto: 'Proyecto',
    User: 'User',
    UserProjectAccess: 'UserProjectAccess',
    RefreshToken: 'RefreshToken',
    MasterAuditLog: 'MasterAuditLog',
    TenantAuditLog: 'TenantAuditLog'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "tenant" | "proyecto" | "user" | "userProjectAccess" | "refreshToken" | "masterAuditLog" | "tenantAuditLog"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Tenant: {
        payload: Prisma.$TenantPayload<ExtArgs>
        fields: Prisma.TenantFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TenantFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TenantFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          findFirst: {
            args: Prisma.TenantFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TenantFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          findMany: {
            args: Prisma.TenantFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>[]
          }
          create: {
            args: Prisma.TenantCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          createMany: {
            args: Prisma.TenantCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TenantCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>[]
          }
          delete: {
            args: Prisma.TenantDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          update: {
            args: Prisma.TenantUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          deleteMany: {
            args: Prisma.TenantDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TenantUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TenantUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          aggregate: {
            args: Prisma.TenantAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTenant>
          }
          groupBy: {
            args: Prisma.TenantGroupByArgs<ExtArgs>
            result: $Utils.Optional<TenantGroupByOutputType>[]
          }
          count: {
            args: Prisma.TenantCountArgs<ExtArgs>
            result: $Utils.Optional<TenantCountAggregateOutputType> | number
          }
        }
      }
      Proyecto: {
        payload: Prisma.$ProyectoPayload<ExtArgs>
        fields: Prisma.ProyectoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProyectoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProyectoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProyectoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProyectoPayload>
          }
          findFirst: {
            args: Prisma.ProyectoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProyectoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProyectoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProyectoPayload>
          }
          findMany: {
            args: Prisma.ProyectoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProyectoPayload>[]
          }
          create: {
            args: Prisma.ProyectoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProyectoPayload>
          }
          createMany: {
            args: Prisma.ProyectoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProyectoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProyectoPayload>[]
          }
          delete: {
            args: Prisma.ProyectoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProyectoPayload>
          }
          update: {
            args: Prisma.ProyectoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProyectoPayload>
          }
          deleteMany: {
            args: Prisma.ProyectoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProyectoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ProyectoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProyectoPayload>
          }
          aggregate: {
            args: Prisma.ProyectoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProyecto>
          }
          groupBy: {
            args: Prisma.ProyectoGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProyectoGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProyectoCountArgs<ExtArgs>
            result: $Utils.Optional<ProyectoCountAggregateOutputType> | number
          }
        }
      }
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      UserProjectAccess: {
        payload: Prisma.$UserProjectAccessPayload<ExtArgs>
        fields: Prisma.UserProjectAccessFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserProjectAccessFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProjectAccessPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserProjectAccessFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProjectAccessPayload>
          }
          findFirst: {
            args: Prisma.UserProjectAccessFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProjectAccessPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserProjectAccessFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProjectAccessPayload>
          }
          findMany: {
            args: Prisma.UserProjectAccessFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProjectAccessPayload>[]
          }
          create: {
            args: Prisma.UserProjectAccessCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProjectAccessPayload>
          }
          createMany: {
            args: Prisma.UserProjectAccessCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserProjectAccessCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProjectAccessPayload>[]
          }
          delete: {
            args: Prisma.UserProjectAccessDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProjectAccessPayload>
          }
          update: {
            args: Prisma.UserProjectAccessUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProjectAccessPayload>
          }
          deleteMany: {
            args: Prisma.UserProjectAccessDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserProjectAccessUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UserProjectAccessUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProjectAccessPayload>
          }
          aggregate: {
            args: Prisma.UserProjectAccessAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserProjectAccess>
          }
          groupBy: {
            args: Prisma.UserProjectAccessGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserProjectAccessGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserProjectAccessCountArgs<ExtArgs>
            result: $Utils.Optional<UserProjectAccessCountAggregateOutputType> | number
          }
        }
      }
      RefreshToken: {
        payload: Prisma.$RefreshTokenPayload<ExtArgs>
        fields: Prisma.RefreshTokenFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RefreshTokenFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefreshTokenPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RefreshTokenFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefreshTokenPayload>
          }
          findFirst: {
            args: Prisma.RefreshTokenFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefreshTokenPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RefreshTokenFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefreshTokenPayload>
          }
          findMany: {
            args: Prisma.RefreshTokenFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefreshTokenPayload>[]
          }
          create: {
            args: Prisma.RefreshTokenCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefreshTokenPayload>
          }
          createMany: {
            args: Prisma.RefreshTokenCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RefreshTokenCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefreshTokenPayload>[]
          }
          delete: {
            args: Prisma.RefreshTokenDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefreshTokenPayload>
          }
          update: {
            args: Prisma.RefreshTokenUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefreshTokenPayload>
          }
          deleteMany: {
            args: Prisma.RefreshTokenDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RefreshTokenUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.RefreshTokenUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefreshTokenPayload>
          }
          aggregate: {
            args: Prisma.RefreshTokenAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRefreshToken>
          }
          groupBy: {
            args: Prisma.RefreshTokenGroupByArgs<ExtArgs>
            result: $Utils.Optional<RefreshTokenGroupByOutputType>[]
          }
          count: {
            args: Prisma.RefreshTokenCountArgs<ExtArgs>
            result: $Utils.Optional<RefreshTokenCountAggregateOutputType> | number
          }
        }
      }
      MasterAuditLog: {
        payload: Prisma.$MasterAuditLogPayload<ExtArgs>
        fields: Prisma.MasterAuditLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MasterAuditLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MasterAuditLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MasterAuditLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MasterAuditLogPayload>
          }
          findFirst: {
            args: Prisma.MasterAuditLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MasterAuditLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MasterAuditLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MasterAuditLogPayload>
          }
          findMany: {
            args: Prisma.MasterAuditLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MasterAuditLogPayload>[]
          }
          create: {
            args: Prisma.MasterAuditLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MasterAuditLogPayload>
          }
          createMany: {
            args: Prisma.MasterAuditLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MasterAuditLogCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MasterAuditLogPayload>[]
          }
          delete: {
            args: Prisma.MasterAuditLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MasterAuditLogPayload>
          }
          update: {
            args: Prisma.MasterAuditLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MasterAuditLogPayload>
          }
          deleteMany: {
            args: Prisma.MasterAuditLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MasterAuditLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.MasterAuditLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MasterAuditLogPayload>
          }
          aggregate: {
            args: Prisma.MasterAuditLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMasterAuditLog>
          }
          groupBy: {
            args: Prisma.MasterAuditLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<MasterAuditLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.MasterAuditLogCountArgs<ExtArgs>
            result: $Utils.Optional<MasterAuditLogCountAggregateOutputType> | number
          }
        }
      }
      TenantAuditLog: {
        payload: Prisma.$TenantAuditLogPayload<ExtArgs>
        fields: Prisma.TenantAuditLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TenantAuditLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantAuditLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TenantAuditLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantAuditLogPayload>
          }
          findFirst: {
            args: Prisma.TenantAuditLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantAuditLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TenantAuditLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantAuditLogPayload>
          }
          findMany: {
            args: Prisma.TenantAuditLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantAuditLogPayload>[]
          }
          create: {
            args: Prisma.TenantAuditLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantAuditLogPayload>
          }
          createMany: {
            args: Prisma.TenantAuditLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TenantAuditLogCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantAuditLogPayload>[]
          }
          delete: {
            args: Prisma.TenantAuditLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantAuditLogPayload>
          }
          update: {
            args: Prisma.TenantAuditLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantAuditLogPayload>
          }
          deleteMany: {
            args: Prisma.TenantAuditLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TenantAuditLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TenantAuditLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantAuditLogPayload>
          }
          aggregate: {
            args: Prisma.TenantAuditLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTenantAuditLog>
          }
          groupBy: {
            args: Prisma.TenantAuditLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<TenantAuditLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.TenantAuditLogCountArgs<ExtArgs>
            result: $Utils.Optional<TenantAuditLogCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type TenantCountOutputType
   */

  export type TenantCountOutputType = {
    usuarios: number
    proyectos: number
  }

  export type TenantCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    usuarios?: boolean | TenantCountOutputTypeCountUsuariosArgs
    proyectos?: boolean | TenantCountOutputTypeCountProyectosArgs
  }

  // Custom InputTypes
  /**
   * TenantCountOutputType without action
   */
  export type TenantCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantCountOutputType
     */
    select?: TenantCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TenantCountOutputType without action
   */
  export type TenantCountOutputTypeCountUsuariosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
  }

  /**
   * TenantCountOutputType without action
   */
  export type TenantCountOutputTypeCountProyectosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProyectoWhereInput
  }


  /**
   * Count Type ProyectoCountOutputType
   */

  export type ProyectoCountOutputType = {
    asignaciones: number
  }

  export type ProyectoCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    asignaciones?: boolean | ProyectoCountOutputTypeCountAsignacionesArgs
  }

  // Custom InputTypes
  /**
   * ProyectoCountOutputType without action
   */
  export type ProyectoCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProyectoCountOutputType
     */
    select?: ProyectoCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ProyectoCountOutputType without action
   */
  export type ProyectoCountOutputTypeCountAsignacionesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserProjectAccessWhereInput
  }


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    tokens: number
    proyectos_acceso: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tokens?: boolean | UserCountOutputTypeCountTokensArgs
    proyectos_acceso?: boolean | UserCountOutputTypeCountProyectos_accesoArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountTokensArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RefreshTokenWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountProyectos_accesoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserProjectAccessWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Tenant
   */

  export type AggregateTenant = {
    _count: TenantCountAggregateOutputType | null
    _min: TenantMinAggregateOutputType | null
    _max: TenantMaxAggregateOutputType | null
  }

  export type TenantMinAggregateOutputType = {
    id_tenant: string | null
    nombre: string | null
    rfc: string | null
    logo_url: string | null
    primary_color: string | null
    plan: string | null
    activo: boolean | null
    created_at: Date | null
  }

  export type TenantMaxAggregateOutputType = {
    id_tenant: string | null
    nombre: string | null
    rfc: string | null
    logo_url: string | null
    primary_color: string | null
    plan: string | null
    activo: boolean | null
    created_at: Date | null
  }

  export type TenantCountAggregateOutputType = {
    id_tenant: number
    nombre: number
    rfc: number
    logo_url: number
    primary_color: number
    plan: number
    activo: number
    created_at: number
    _all: number
  }


  export type TenantMinAggregateInputType = {
    id_tenant?: true
    nombre?: true
    rfc?: true
    logo_url?: true
    primary_color?: true
    plan?: true
    activo?: true
    created_at?: true
  }

  export type TenantMaxAggregateInputType = {
    id_tenant?: true
    nombre?: true
    rfc?: true
    logo_url?: true
    primary_color?: true
    plan?: true
    activo?: true
    created_at?: true
  }

  export type TenantCountAggregateInputType = {
    id_tenant?: true
    nombre?: true
    rfc?: true
    logo_url?: true
    primary_color?: true
    plan?: true
    activo?: true
    created_at?: true
    _all?: true
  }

  export type TenantAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tenant to aggregate.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Tenants
    **/
    _count?: true | TenantCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TenantMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TenantMaxAggregateInputType
  }

  export type GetTenantAggregateType<T extends TenantAggregateArgs> = {
        [P in keyof T & keyof AggregateTenant]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTenant[P]>
      : GetScalarType<T[P], AggregateTenant[P]>
  }




  export type TenantGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantWhereInput
    orderBy?: TenantOrderByWithAggregationInput | TenantOrderByWithAggregationInput[]
    by: TenantScalarFieldEnum[] | TenantScalarFieldEnum
    having?: TenantScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TenantCountAggregateInputType | true
    _min?: TenantMinAggregateInputType
    _max?: TenantMaxAggregateInputType
  }

  export type TenantGroupByOutputType = {
    id_tenant: string
    nombre: string
    rfc: string | null
    logo_url: string | null
    primary_color: string | null
    plan: string
    activo: boolean
    created_at: Date
    _count: TenantCountAggregateOutputType | null
    _min: TenantMinAggregateOutputType | null
    _max: TenantMaxAggregateOutputType | null
  }

  type GetTenantGroupByPayload<T extends TenantGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TenantGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TenantGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TenantGroupByOutputType[P]>
            : GetScalarType<T[P], TenantGroupByOutputType[P]>
        }
      >
    >


  export type TenantSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_tenant?: boolean
    nombre?: boolean
    rfc?: boolean
    logo_url?: boolean
    primary_color?: boolean
    plan?: boolean
    activo?: boolean
    created_at?: boolean
    usuarios?: boolean | Tenant$usuariosArgs<ExtArgs>
    proyectos?: boolean | Tenant$proyectosArgs<ExtArgs>
    _count?: boolean | TenantCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenant"]>

  export type TenantSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_tenant?: boolean
    nombre?: boolean
    rfc?: boolean
    logo_url?: boolean
    primary_color?: boolean
    plan?: boolean
    activo?: boolean
    created_at?: boolean
  }, ExtArgs["result"]["tenant"]>

  export type TenantSelectScalar = {
    id_tenant?: boolean
    nombre?: boolean
    rfc?: boolean
    logo_url?: boolean
    primary_color?: boolean
    plan?: boolean
    activo?: boolean
    created_at?: boolean
  }

  export type TenantInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    usuarios?: boolean | Tenant$usuariosArgs<ExtArgs>
    proyectos?: boolean | Tenant$proyectosArgs<ExtArgs>
    _count?: boolean | TenantCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TenantIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $TenantPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Tenant"
    objects: {
      usuarios: Prisma.$UserPayload<ExtArgs>[]
      proyectos: Prisma.$ProyectoPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id_tenant: string
      nombre: string
      rfc: string | null
      logo_url: string | null
      primary_color: string | null
      plan: string
      activo: boolean
      created_at: Date
    }, ExtArgs["result"]["tenant"]>
    composites: {}
  }

  type TenantGetPayload<S extends boolean | null | undefined | TenantDefaultArgs> = $Result.GetResult<Prisma.$TenantPayload, S>

  type TenantCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<TenantFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TenantCountAggregateInputType | true
    }

  export interface TenantDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Tenant'], meta: { name: 'Tenant' } }
    /**
     * Find zero or one Tenant that matches the filter.
     * @param {TenantFindUniqueArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TenantFindUniqueArgs>(args: SelectSubset<T, TenantFindUniqueArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Tenant that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {TenantFindUniqueOrThrowArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TenantFindUniqueOrThrowArgs>(args: SelectSubset<T, TenantFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Tenant that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantFindFirstArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TenantFindFirstArgs>(args?: SelectSubset<T, TenantFindFirstArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Tenant that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantFindFirstOrThrowArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TenantFindFirstOrThrowArgs>(args?: SelectSubset<T, TenantFindFirstOrThrowArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Tenants that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tenants
     * const tenants = await prisma.tenant.findMany()
     * 
     * // Get first 10 Tenants
     * const tenants = await prisma.tenant.findMany({ take: 10 })
     * 
     * // Only select the `id_tenant`
     * const tenantWithId_tenantOnly = await prisma.tenant.findMany({ select: { id_tenant: true } })
     * 
     */
    findMany<T extends TenantFindManyArgs>(args?: SelectSubset<T, TenantFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Tenant.
     * @param {TenantCreateArgs} args - Arguments to create a Tenant.
     * @example
     * // Create one Tenant
     * const Tenant = await prisma.tenant.create({
     *   data: {
     *     // ... data to create a Tenant
     *   }
     * })
     * 
     */
    create<T extends TenantCreateArgs>(args: SelectSubset<T, TenantCreateArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Tenants.
     * @param {TenantCreateManyArgs} args - Arguments to create many Tenants.
     * @example
     * // Create many Tenants
     * const tenant = await prisma.tenant.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TenantCreateManyArgs>(args?: SelectSubset<T, TenantCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Tenants and returns the data saved in the database.
     * @param {TenantCreateManyAndReturnArgs} args - Arguments to create many Tenants.
     * @example
     * // Create many Tenants
     * const tenant = await prisma.tenant.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Tenants and only return the `id_tenant`
     * const tenantWithId_tenantOnly = await prisma.tenant.createManyAndReturn({ 
     *   select: { id_tenant: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TenantCreateManyAndReturnArgs>(args?: SelectSubset<T, TenantCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Tenant.
     * @param {TenantDeleteArgs} args - Arguments to delete one Tenant.
     * @example
     * // Delete one Tenant
     * const Tenant = await prisma.tenant.delete({
     *   where: {
     *     // ... filter to delete one Tenant
     *   }
     * })
     * 
     */
    delete<T extends TenantDeleteArgs>(args: SelectSubset<T, TenantDeleteArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Tenant.
     * @param {TenantUpdateArgs} args - Arguments to update one Tenant.
     * @example
     * // Update one Tenant
     * const tenant = await prisma.tenant.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TenantUpdateArgs>(args: SelectSubset<T, TenantUpdateArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Tenants.
     * @param {TenantDeleteManyArgs} args - Arguments to filter Tenants to delete.
     * @example
     * // Delete a few Tenants
     * const { count } = await prisma.tenant.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TenantDeleteManyArgs>(args?: SelectSubset<T, TenantDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tenants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tenants
     * const tenant = await prisma.tenant.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TenantUpdateManyArgs>(args: SelectSubset<T, TenantUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Tenant.
     * @param {TenantUpsertArgs} args - Arguments to update or create a Tenant.
     * @example
     * // Update or create a Tenant
     * const tenant = await prisma.tenant.upsert({
     *   create: {
     *     // ... data to create a Tenant
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tenant we want to update
     *   }
     * })
     */
    upsert<T extends TenantUpsertArgs>(args: SelectSubset<T, TenantUpsertArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Tenants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantCountArgs} args - Arguments to filter Tenants to count.
     * @example
     * // Count the number of Tenants
     * const count = await prisma.tenant.count({
     *   where: {
     *     // ... the filter for the Tenants we want to count
     *   }
     * })
    **/
    count<T extends TenantCountArgs>(
      args?: Subset<T, TenantCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TenantCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tenant.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TenantAggregateArgs>(args: Subset<T, TenantAggregateArgs>): Prisma.PrismaPromise<GetTenantAggregateType<T>>

    /**
     * Group by Tenant.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TenantGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TenantGroupByArgs['orderBy'] }
        : { orderBy?: TenantGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TenantGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTenantGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Tenant model
   */
  readonly fields: TenantFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Tenant.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TenantClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    usuarios<T extends Tenant$usuariosArgs<ExtArgs> = {}>(args?: Subset<T, Tenant$usuariosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany"> | Null>
    proyectos<T extends Tenant$proyectosArgs<ExtArgs> = {}>(args?: Subset<T, Tenant$proyectosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProyectoPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Tenant model
   */ 
  interface TenantFieldRefs {
    readonly id_tenant: FieldRef<"Tenant", 'String'>
    readonly nombre: FieldRef<"Tenant", 'String'>
    readonly rfc: FieldRef<"Tenant", 'String'>
    readonly logo_url: FieldRef<"Tenant", 'String'>
    readonly primary_color: FieldRef<"Tenant", 'String'>
    readonly plan: FieldRef<"Tenant", 'String'>
    readonly activo: FieldRef<"Tenant", 'Boolean'>
    readonly created_at: FieldRef<"Tenant", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Tenant findUnique
   */
  export type TenantFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant findUniqueOrThrow
   */
  export type TenantFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant findFirst
   */
  export type TenantFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tenants.
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tenants.
     */
    distinct?: TenantScalarFieldEnum | TenantScalarFieldEnum[]
  }

  /**
   * Tenant findFirstOrThrow
   */
  export type TenantFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tenants.
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tenants.
     */
    distinct?: TenantScalarFieldEnum | TenantScalarFieldEnum[]
  }

  /**
   * Tenant findMany
   */
  export type TenantFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenants to fetch.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Tenants.
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    distinct?: TenantScalarFieldEnum | TenantScalarFieldEnum[]
  }

  /**
   * Tenant create
   */
  export type TenantCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * The data needed to create a Tenant.
     */
    data: XOR<TenantCreateInput, TenantUncheckedCreateInput>
  }

  /**
   * Tenant createMany
   */
  export type TenantCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Tenants.
     */
    data: TenantCreateManyInput | TenantCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Tenant createManyAndReturn
   */
  export type TenantCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Tenants.
     */
    data: TenantCreateManyInput | TenantCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Tenant update
   */
  export type TenantUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * The data needed to update a Tenant.
     */
    data: XOR<TenantUpdateInput, TenantUncheckedUpdateInput>
    /**
     * Choose, which Tenant to update.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant updateMany
   */
  export type TenantUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Tenants.
     */
    data: XOR<TenantUpdateManyMutationInput, TenantUncheckedUpdateManyInput>
    /**
     * Filter which Tenants to update
     */
    where?: TenantWhereInput
  }

  /**
   * Tenant upsert
   */
  export type TenantUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * The filter to search for the Tenant to update in case it exists.
     */
    where: TenantWhereUniqueInput
    /**
     * In case the Tenant found by the `where` argument doesn't exist, create a new Tenant with this data.
     */
    create: XOR<TenantCreateInput, TenantUncheckedCreateInput>
    /**
     * In case the Tenant was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TenantUpdateInput, TenantUncheckedUpdateInput>
  }

  /**
   * Tenant delete
   */
  export type TenantDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter which Tenant to delete.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant deleteMany
   */
  export type TenantDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tenants to delete
     */
    where?: TenantWhereInput
  }

  /**
   * Tenant.usuarios
   */
  export type Tenant$usuariosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    cursor?: UserWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * Tenant.proyectos
   */
  export type Tenant$proyectosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Proyecto
     */
    select?: ProyectoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProyectoInclude<ExtArgs> | null
    where?: ProyectoWhereInput
    orderBy?: ProyectoOrderByWithRelationInput | ProyectoOrderByWithRelationInput[]
    cursor?: ProyectoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ProyectoScalarFieldEnum | ProyectoScalarFieldEnum[]
  }

  /**
   * Tenant without action
   */
  export type TenantDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
  }


  /**
   * Model Proyecto
   */

  export type AggregateProyecto = {
    _count: ProyectoCountAggregateOutputType | null
    _avg: ProyectoAvgAggregateOutputType | null
    _sum: ProyectoSumAggregateOutputType | null
    _min: ProyectoMinAggregateOutputType | null
    _max: ProyectoMaxAggregateOutputType | null
  }

  export type ProyectoAvgAggregateOutputType = {
    anio_centro_costos: number | null
    consecutivo_centro_costos: number | null
    monto_total_vendido: Decimal | null
    periodo_ejecucion: number | null
    total_dias_naturales: number | null
    total_dias_laborables: number | null
  }

  export type ProyectoSumAggregateOutputType = {
    anio_centro_costos: number | null
    consecutivo_centro_costos: number | null
    monto_total_vendido: Decimal | null
    periodo_ejecucion: number | null
    total_dias_naturales: number | null
    total_dias_laborables: number | null
  }

  export type ProyectoMinAggregateOutputType = {
    id_proyecto: string | null
    tenant_id: string | null
    codigo_centro_costos: string | null
    nombre_oficial: string | null
    tipo_contrato: string | null
    moneda_base: string | null
    estatus: string | null
    activo: boolean | null
    created_at: Date | null
    empresa_grupo: string | null
    anio_centro_costos: number | null
    cliente_id: string | null
    consecutivo_centro_costos: number | null
    es_especial: boolean | null
    tipo_especial: string | null
    fecha_inicio_real: Date | null
    fecha_firma_contrato: Date | null
    fecha_programada_inicio: Date | null
    fecha_programada_fin: Date | null
    monto_total_vendido: Decimal | null
    periodo_ejecucion: number | null
    periodo_ejecucion_unidad: string | null
    total_dias_naturales: number | null
    total_dias_laborables: number | null
  }

  export type ProyectoMaxAggregateOutputType = {
    id_proyecto: string | null
    tenant_id: string | null
    codigo_centro_costos: string | null
    nombre_oficial: string | null
    tipo_contrato: string | null
    moneda_base: string | null
    estatus: string | null
    activo: boolean | null
    created_at: Date | null
    empresa_grupo: string | null
    anio_centro_costos: number | null
    cliente_id: string | null
    consecutivo_centro_costos: number | null
    es_especial: boolean | null
    tipo_especial: string | null
    fecha_inicio_real: Date | null
    fecha_firma_contrato: Date | null
    fecha_programada_inicio: Date | null
    fecha_programada_fin: Date | null
    monto_total_vendido: Decimal | null
    periodo_ejecucion: number | null
    periodo_ejecucion_unidad: string | null
    total_dias_naturales: number | null
    total_dias_laborables: number | null
  }

  export type ProyectoCountAggregateOutputType = {
    id_proyecto: number
    tenant_id: number
    codigo_centro_costos: number
    nombre_oficial: number
    tipo_contrato: number
    moneda_base: number
    estatus: number
    activo: number
    created_at: number
    empresa_grupo: number
    anio_centro_costos: number
    cliente_id: number
    consecutivo_centro_costos: number
    es_especial: number
    tipo_especial: number
    fecha_inicio_real: number
    fecha_firma_contrato: number
    fecha_programada_inicio: number
    fecha_programada_fin: number
    monto_total_vendido: number
    periodo_ejecucion: number
    periodo_ejecucion_unidad: number
    total_dias_naturales: number
    total_dias_laborables: number
    _all: number
  }


  export type ProyectoAvgAggregateInputType = {
    anio_centro_costos?: true
    consecutivo_centro_costos?: true
    monto_total_vendido?: true
    periodo_ejecucion?: true
    total_dias_naturales?: true
    total_dias_laborables?: true
  }

  export type ProyectoSumAggregateInputType = {
    anio_centro_costos?: true
    consecutivo_centro_costos?: true
    monto_total_vendido?: true
    periodo_ejecucion?: true
    total_dias_naturales?: true
    total_dias_laborables?: true
  }

  export type ProyectoMinAggregateInputType = {
    id_proyecto?: true
    tenant_id?: true
    codigo_centro_costos?: true
    nombre_oficial?: true
    tipo_contrato?: true
    moneda_base?: true
    estatus?: true
    activo?: true
    created_at?: true
    empresa_grupo?: true
    anio_centro_costos?: true
    cliente_id?: true
    consecutivo_centro_costos?: true
    es_especial?: true
    tipo_especial?: true
    fecha_inicio_real?: true
    fecha_firma_contrato?: true
    fecha_programada_inicio?: true
    fecha_programada_fin?: true
    monto_total_vendido?: true
    periodo_ejecucion?: true
    periodo_ejecucion_unidad?: true
    total_dias_naturales?: true
    total_dias_laborables?: true
  }

  export type ProyectoMaxAggregateInputType = {
    id_proyecto?: true
    tenant_id?: true
    codigo_centro_costos?: true
    nombre_oficial?: true
    tipo_contrato?: true
    moneda_base?: true
    estatus?: true
    activo?: true
    created_at?: true
    empresa_grupo?: true
    anio_centro_costos?: true
    cliente_id?: true
    consecutivo_centro_costos?: true
    es_especial?: true
    tipo_especial?: true
    fecha_inicio_real?: true
    fecha_firma_contrato?: true
    fecha_programada_inicio?: true
    fecha_programada_fin?: true
    monto_total_vendido?: true
    periodo_ejecucion?: true
    periodo_ejecucion_unidad?: true
    total_dias_naturales?: true
    total_dias_laborables?: true
  }

  export type ProyectoCountAggregateInputType = {
    id_proyecto?: true
    tenant_id?: true
    codigo_centro_costos?: true
    nombre_oficial?: true
    tipo_contrato?: true
    moneda_base?: true
    estatus?: true
    activo?: true
    created_at?: true
    empresa_grupo?: true
    anio_centro_costos?: true
    cliente_id?: true
    consecutivo_centro_costos?: true
    es_especial?: true
    tipo_especial?: true
    fecha_inicio_real?: true
    fecha_firma_contrato?: true
    fecha_programada_inicio?: true
    fecha_programada_fin?: true
    monto_total_vendido?: true
    periodo_ejecucion?: true
    periodo_ejecucion_unidad?: true
    total_dias_naturales?: true
    total_dias_laborables?: true
    _all?: true
  }

  export type ProyectoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Proyecto to aggregate.
     */
    where?: ProyectoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Proyectos to fetch.
     */
    orderBy?: ProyectoOrderByWithRelationInput | ProyectoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProyectoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Proyectos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Proyectos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Proyectos
    **/
    _count?: true | ProyectoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ProyectoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ProyectoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProyectoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProyectoMaxAggregateInputType
  }

  export type GetProyectoAggregateType<T extends ProyectoAggregateArgs> = {
        [P in keyof T & keyof AggregateProyecto]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProyecto[P]>
      : GetScalarType<T[P], AggregateProyecto[P]>
  }




  export type ProyectoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProyectoWhereInput
    orderBy?: ProyectoOrderByWithAggregationInput | ProyectoOrderByWithAggregationInput[]
    by: ProyectoScalarFieldEnum[] | ProyectoScalarFieldEnum
    having?: ProyectoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProyectoCountAggregateInputType | true
    _avg?: ProyectoAvgAggregateInputType
    _sum?: ProyectoSumAggregateInputType
    _min?: ProyectoMinAggregateInputType
    _max?: ProyectoMaxAggregateInputType
  }

  export type ProyectoGroupByOutputType = {
    id_proyecto: string
    tenant_id: string
    codigo_centro_costos: string
    nombre_oficial: string
    tipo_contrato: string
    moneda_base: string
    estatus: string
    activo: boolean
    created_at: Date
    empresa_grupo: string | null
    anio_centro_costos: number | null
    cliente_id: string | null
    consecutivo_centro_costos: number | null
    es_especial: boolean
    tipo_especial: string | null
    fecha_inicio_real: Date | null
    fecha_firma_contrato: Date | null
    fecha_programada_inicio: Date | null
    fecha_programada_fin: Date | null
    monto_total_vendido: Decimal | null
    periodo_ejecucion: number | null
    periodo_ejecucion_unidad: string | null
    total_dias_naturales: number | null
    total_dias_laborables: number | null
    _count: ProyectoCountAggregateOutputType | null
    _avg: ProyectoAvgAggregateOutputType | null
    _sum: ProyectoSumAggregateOutputType | null
    _min: ProyectoMinAggregateOutputType | null
    _max: ProyectoMaxAggregateOutputType | null
  }

  type GetProyectoGroupByPayload<T extends ProyectoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProyectoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProyectoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProyectoGroupByOutputType[P]>
            : GetScalarType<T[P], ProyectoGroupByOutputType[P]>
        }
      >
    >


  export type ProyectoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_proyecto?: boolean
    tenant_id?: boolean
    codigo_centro_costos?: boolean
    nombre_oficial?: boolean
    tipo_contrato?: boolean
    moneda_base?: boolean
    estatus?: boolean
    activo?: boolean
    created_at?: boolean
    empresa_grupo?: boolean
    anio_centro_costos?: boolean
    cliente_id?: boolean
    consecutivo_centro_costos?: boolean
    es_especial?: boolean
    tipo_especial?: boolean
    fecha_inicio_real?: boolean
    fecha_firma_contrato?: boolean
    fecha_programada_inicio?: boolean
    fecha_programada_fin?: boolean
    monto_total_vendido?: boolean
    periodo_ejecucion?: boolean
    periodo_ejecucion_unidad?: boolean
    total_dias_naturales?: boolean
    total_dias_laborables?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    asignaciones?: boolean | Proyecto$asignacionesArgs<ExtArgs>
    _count?: boolean | ProyectoCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["proyecto"]>

  export type ProyectoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_proyecto?: boolean
    tenant_id?: boolean
    codigo_centro_costos?: boolean
    nombre_oficial?: boolean
    tipo_contrato?: boolean
    moneda_base?: boolean
    estatus?: boolean
    activo?: boolean
    created_at?: boolean
    empresa_grupo?: boolean
    anio_centro_costos?: boolean
    cliente_id?: boolean
    consecutivo_centro_costos?: boolean
    es_especial?: boolean
    tipo_especial?: boolean
    fecha_inicio_real?: boolean
    fecha_firma_contrato?: boolean
    fecha_programada_inicio?: boolean
    fecha_programada_fin?: boolean
    monto_total_vendido?: boolean
    periodo_ejecucion?: boolean
    periodo_ejecucion_unidad?: boolean
    total_dias_naturales?: boolean
    total_dias_laborables?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["proyecto"]>

  export type ProyectoSelectScalar = {
    id_proyecto?: boolean
    tenant_id?: boolean
    codigo_centro_costos?: boolean
    nombre_oficial?: boolean
    tipo_contrato?: boolean
    moneda_base?: boolean
    estatus?: boolean
    activo?: boolean
    created_at?: boolean
    empresa_grupo?: boolean
    anio_centro_costos?: boolean
    cliente_id?: boolean
    consecutivo_centro_costos?: boolean
    es_especial?: boolean
    tipo_especial?: boolean
    fecha_inicio_real?: boolean
    fecha_firma_contrato?: boolean
    fecha_programada_inicio?: boolean
    fecha_programada_fin?: boolean
    monto_total_vendido?: boolean
    periodo_ejecucion?: boolean
    periodo_ejecucion_unidad?: boolean
    total_dias_naturales?: boolean
    total_dias_laborables?: boolean
  }

  export type ProyectoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    asignaciones?: boolean | Proyecto$asignacionesArgs<ExtArgs>
    _count?: boolean | ProyectoCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ProyectoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }

  export type $ProyectoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Proyecto"
    objects: {
      tenant: Prisma.$TenantPayload<ExtArgs>
      asignaciones: Prisma.$UserProjectAccessPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id_proyecto: string
      tenant_id: string
      codigo_centro_costos: string
      nombre_oficial: string
      tipo_contrato: string
      moneda_base: string
      estatus: string
      activo: boolean
      created_at: Date
      empresa_grupo: string | null
      anio_centro_costos: number | null
      cliente_id: string | null
      consecutivo_centro_costos: number | null
      es_especial: boolean
      tipo_especial: string | null
      fecha_inicio_real: Date | null
      fecha_firma_contrato: Date | null
      fecha_programada_inicio: Date | null
      fecha_programada_fin: Date | null
      monto_total_vendido: Prisma.Decimal | null
      periodo_ejecucion: number | null
      periodo_ejecucion_unidad: string | null
      total_dias_naturales: number | null
      total_dias_laborables: number | null
    }, ExtArgs["result"]["proyecto"]>
    composites: {}
  }

  type ProyectoGetPayload<S extends boolean | null | undefined | ProyectoDefaultArgs> = $Result.GetResult<Prisma.$ProyectoPayload, S>

  type ProyectoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ProyectoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ProyectoCountAggregateInputType | true
    }

  export interface ProyectoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Proyecto'], meta: { name: 'Proyecto' } }
    /**
     * Find zero or one Proyecto that matches the filter.
     * @param {ProyectoFindUniqueArgs} args - Arguments to find a Proyecto
     * @example
     * // Get one Proyecto
     * const proyecto = await prisma.proyecto.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProyectoFindUniqueArgs>(args: SelectSubset<T, ProyectoFindUniqueArgs<ExtArgs>>): Prisma__ProyectoClient<$Result.GetResult<Prisma.$ProyectoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Proyecto that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ProyectoFindUniqueOrThrowArgs} args - Arguments to find a Proyecto
     * @example
     * // Get one Proyecto
     * const proyecto = await prisma.proyecto.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProyectoFindUniqueOrThrowArgs>(args: SelectSubset<T, ProyectoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProyectoClient<$Result.GetResult<Prisma.$ProyectoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Proyecto that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProyectoFindFirstArgs} args - Arguments to find a Proyecto
     * @example
     * // Get one Proyecto
     * const proyecto = await prisma.proyecto.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProyectoFindFirstArgs>(args?: SelectSubset<T, ProyectoFindFirstArgs<ExtArgs>>): Prisma__ProyectoClient<$Result.GetResult<Prisma.$ProyectoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Proyecto that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProyectoFindFirstOrThrowArgs} args - Arguments to find a Proyecto
     * @example
     * // Get one Proyecto
     * const proyecto = await prisma.proyecto.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProyectoFindFirstOrThrowArgs>(args?: SelectSubset<T, ProyectoFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProyectoClient<$Result.GetResult<Prisma.$ProyectoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Proyectos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProyectoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Proyectos
     * const proyectos = await prisma.proyecto.findMany()
     * 
     * // Get first 10 Proyectos
     * const proyectos = await prisma.proyecto.findMany({ take: 10 })
     * 
     * // Only select the `id_proyecto`
     * const proyectoWithId_proyectoOnly = await prisma.proyecto.findMany({ select: { id_proyecto: true } })
     * 
     */
    findMany<T extends ProyectoFindManyArgs>(args?: SelectSubset<T, ProyectoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProyectoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Proyecto.
     * @param {ProyectoCreateArgs} args - Arguments to create a Proyecto.
     * @example
     * // Create one Proyecto
     * const Proyecto = await prisma.proyecto.create({
     *   data: {
     *     // ... data to create a Proyecto
     *   }
     * })
     * 
     */
    create<T extends ProyectoCreateArgs>(args: SelectSubset<T, ProyectoCreateArgs<ExtArgs>>): Prisma__ProyectoClient<$Result.GetResult<Prisma.$ProyectoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Proyectos.
     * @param {ProyectoCreateManyArgs} args - Arguments to create many Proyectos.
     * @example
     * // Create many Proyectos
     * const proyecto = await prisma.proyecto.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProyectoCreateManyArgs>(args?: SelectSubset<T, ProyectoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Proyectos and returns the data saved in the database.
     * @param {ProyectoCreateManyAndReturnArgs} args - Arguments to create many Proyectos.
     * @example
     * // Create many Proyectos
     * const proyecto = await prisma.proyecto.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Proyectos and only return the `id_proyecto`
     * const proyectoWithId_proyectoOnly = await prisma.proyecto.createManyAndReturn({ 
     *   select: { id_proyecto: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProyectoCreateManyAndReturnArgs>(args?: SelectSubset<T, ProyectoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProyectoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Proyecto.
     * @param {ProyectoDeleteArgs} args - Arguments to delete one Proyecto.
     * @example
     * // Delete one Proyecto
     * const Proyecto = await prisma.proyecto.delete({
     *   where: {
     *     // ... filter to delete one Proyecto
     *   }
     * })
     * 
     */
    delete<T extends ProyectoDeleteArgs>(args: SelectSubset<T, ProyectoDeleteArgs<ExtArgs>>): Prisma__ProyectoClient<$Result.GetResult<Prisma.$ProyectoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Proyecto.
     * @param {ProyectoUpdateArgs} args - Arguments to update one Proyecto.
     * @example
     * // Update one Proyecto
     * const proyecto = await prisma.proyecto.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProyectoUpdateArgs>(args: SelectSubset<T, ProyectoUpdateArgs<ExtArgs>>): Prisma__ProyectoClient<$Result.GetResult<Prisma.$ProyectoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Proyectos.
     * @param {ProyectoDeleteManyArgs} args - Arguments to filter Proyectos to delete.
     * @example
     * // Delete a few Proyectos
     * const { count } = await prisma.proyecto.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProyectoDeleteManyArgs>(args?: SelectSubset<T, ProyectoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Proyectos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProyectoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Proyectos
     * const proyecto = await prisma.proyecto.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProyectoUpdateManyArgs>(args: SelectSubset<T, ProyectoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Proyecto.
     * @param {ProyectoUpsertArgs} args - Arguments to update or create a Proyecto.
     * @example
     * // Update or create a Proyecto
     * const proyecto = await prisma.proyecto.upsert({
     *   create: {
     *     // ... data to create a Proyecto
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Proyecto we want to update
     *   }
     * })
     */
    upsert<T extends ProyectoUpsertArgs>(args: SelectSubset<T, ProyectoUpsertArgs<ExtArgs>>): Prisma__ProyectoClient<$Result.GetResult<Prisma.$ProyectoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Proyectos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProyectoCountArgs} args - Arguments to filter Proyectos to count.
     * @example
     * // Count the number of Proyectos
     * const count = await prisma.proyecto.count({
     *   where: {
     *     // ... the filter for the Proyectos we want to count
     *   }
     * })
    **/
    count<T extends ProyectoCountArgs>(
      args?: Subset<T, ProyectoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProyectoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Proyecto.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProyectoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ProyectoAggregateArgs>(args: Subset<T, ProyectoAggregateArgs>): Prisma.PrismaPromise<GetProyectoAggregateType<T>>

    /**
     * Group by Proyecto.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProyectoGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ProyectoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProyectoGroupByArgs['orderBy'] }
        : { orderBy?: ProyectoGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ProyectoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProyectoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Proyecto model
   */
  readonly fields: ProyectoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Proyecto.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProyectoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tenant<T extends TenantDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TenantDefaultArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    asignaciones<T extends Proyecto$asignacionesArgs<ExtArgs> = {}>(args?: Subset<T, Proyecto$asignacionesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserProjectAccessPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Proyecto model
   */ 
  interface ProyectoFieldRefs {
    readonly id_proyecto: FieldRef<"Proyecto", 'String'>
    readonly tenant_id: FieldRef<"Proyecto", 'String'>
    readonly codigo_centro_costos: FieldRef<"Proyecto", 'String'>
    readonly nombre_oficial: FieldRef<"Proyecto", 'String'>
    readonly tipo_contrato: FieldRef<"Proyecto", 'String'>
    readonly moneda_base: FieldRef<"Proyecto", 'String'>
    readonly estatus: FieldRef<"Proyecto", 'String'>
    readonly activo: FieldRef<"Proyecto", 'Boolean'>
    readonly created_at: FieldRef<"Proyecto", 'DateTime'>
    readonly empresa_grupo: FieldRef<"Proyecto", 'String'>
    readonly anio_centro_costos: FieldRef<"Proyecto", 'Int'>
    readonly cliente_id: FieldRef<"Proyecto", 'String'>
    readonly consecutivo_centro_costos: FieldRef<"Proyecto", 'Int'>
    readonly es_especial: FieldRef<"Proyecto", 'Boolean'>
    readonly tipo_especial: FieldRef<"Proyecto", 'String'>
    readonly fecha_inicio_real: FieldRef<"Proyecto", 'DateTime'>
    readonly fecha_firma_contrato: FieldRef<"Proyecto", 'DateTime'>
    readonly fecha_programada_inicio: FieldRef<"Proyecto", 'DateTime'>
    readonly fecha_programada_fin: FieldRef<"Proyecto", 'DateTime'>
    readonly monto_total_vendido: FieldRef<"Proyecto", 'Decimal'>
    readonly periodo_ejecucion: FieldRef<"Proyecto", 'Int'>
    readonly periodo_ejecucion_unidad: FieldRef<"Proyecto", 'String'>
    readonly total_dias_naturales: FieldRef<"Proyecto", 'Int'>
    readonly total_dias_laborables: FieldRef<"Proyecto", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * Proyecto findUnique
   */
  export type ProyectoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Proyecto
     */
    select?: ProyectoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProyectoInclude<ExtArgs> | null
    /**
     * Filter, which Proyecto to fetch.
     */
    where: ProyectoWhereUniqueInput
  }

  /**
   * Proyecto findUniqueOrThrow
   */
  export type ProyectoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Proyecto
     */
    select?: ProyectoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProyectoInclude<ExtArgs> | null
    /**
     * Filter, which Proyecto to fetch.
     */
    where: ProyectoWhereUniqueInput
  }

  /**
   * Proyecto findFirst
   */
  export type ProyectoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Proyecto
     */
    select?: ProyectoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProyectoInclude<ExtArgs> | null
    /**
     * Filter, which Proyecto to fetch.
     */
    where?: ProyectoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Proyectos to fetch.
     */
    orderBy?: ProyectoOrderByWithRelationInput | ProyectoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Proyectos.
     */
    cursor?: ProyectoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Proyectos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Proyectos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Proyectos.
     */
    distinct?: ProyectoScalarFieldEnum | ProyectoScalarFieldEnum[]
  }

  /**
   * Proyecto findFirstOrThrow
   */
  export type ProyectoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Proyecto
     */
    select?: ProyectoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProyectoInclude<ExtArgs> | null
    /**
     * Filter, which Proyecto to fetch.
     */
    where?: ProyectoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Proyectos to fetch.
     */
    orderBy?: ProyectoOrderByWithRelationInput | ProyectoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Proyectos.
     */
    cursor?: ProyectoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Proyectos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Proyectos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Proyectos.
     */
    distinct?: ProyectoScalarFieldEnum | ProyectoScalarFieldEnum[]
  }

  /**
   * Proyecto findMany
   */
  export type ProyectoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Proyecto
     */
    select?: ProyectoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProyectoInclude<ExtArgs> | null
    /**
     * Filter, which Proyectos to fetch.
     */
    where?: ProyectoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Proyectos to fetch.
     */
    orderBy?: ProyectoOrderByWithRelationInput | ProyectoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Proyectos.
     */
    cursor?: ProyectoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Proyectos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Proyectos.
     */
    skip?: number
    distinct?: ProyectoScalarFieldEnum | ProyectoScalarFieldEnum[]
  }

  /**
   * Proyecto create
   */
  export type ProyectoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Proyecto
     */
    select?: ProyectoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProyectoInclude<ExtArgs> | null
    /**
     * The data needed to create a Proyecto.
     */
    data: XOR<ProyectoCreateInput, ProyectoUncheckedCreateInput>
  }

  /**
   * Proyecto createMany
   */
  export type ProyectoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Proyectos.
     */
    data: ProyectoCreateManyInput | ProyectoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Proyecto createManyAndReturn
   */
  export type ProyectoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Proyecto
     */
    select?: ProyectoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Proyectos.
     */
    data: ProyectoCreateManyInput | ProyectoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProyectoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Proyecto update
   */
  export type ProyectoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Proyecto
     */
    select?: ProyectoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProyectoInclude<ExtArgs> | null
    /**
     * The data needed to update a Proyecto.
     */
    data: XOR<ProyectoUpdateInput, ProyectoUncheckedUpdateInput>
    /**
     * Choose, which Proyecto to update.
     */
    where: ProyectoWhereUniqueInput
  }

  /**
   * Proyecto updateMany
   */
  export type ProyectoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Proyectos.
     */
    data: XOR<ProyectoUpdateManyMutationInput, ProyectoUncheckedUpdateManyInput>
    /**
     * Filter which Proyectos to update
     */
    where?: ProyectoWhereInput
  }

  /**
   * Proyecto upsert
   */
  export type ProyectoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Proyecto
     */
    select?: ProyectoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProyectoInclude<ExtArgs> | null
    /**
     * The filter to search for the Proyecto to update in case it exists.
     */
    where: ProyectoWhereUniqueInput
    /**
     * In case the Proyecto found by the `where` argument doesn't exist, create a new Proyecto with this data.
     */
    create: XOR<ProyectoCreateInput, ProyectoUncheckedCreateInput>
    /**
     * In case the Proyecto was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProyectoUpdateInput, ProyectoUncheckedUpdateInput>
  }

  /**
   * Proyecto delete
   */
  export type ProyectoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Proyecto
     */
    select?: ProyectoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProyectoInclude<ExtArgs> | null
    /**
     * Filter which Proyecto to delete.
     */
    where: ProyectoWhereUniqueInput
  }

  /**
   * Proyecto deleteMany
   */
  export type ProyectoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Proyectos to delete
     */
    where?: ProyectoWhereInput
  }

  /**
   * Proyecto.asignaciones
   */
  export type Proyecto$asignacionesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProjectAccess
     */
    select?: UserProjectAccessSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProjectAccessInclude<ExtArgs> | null
    where?: UserProjectAccessWhereInput
    orderBy?: UserProjectAccessOrderByWithRelationInput | UserProjectAccessOrderByWithRelationInput[]
    cursor?: UserProjectAccessWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserProjectAccessScalarFieldEnum | UserProjectAccessScalarFieldEnum[]
  }

  /**
   * Proyecto without action
   */
  export type ProyectoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Proyecto
     */
    select?: ProyectoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProyectoInclude<ExtArgs> | null
  }


  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserAvgAggregateOutputType = {
    limite_aprobacion_financiera: Decimal | null
  }

  export type UserSumAggregateOutputType = {
    limite_aprobacion_financiera: Decimal | null
  }

  export type UserMinAggregateOutputType = {
    id_usuario: string | null
    tenant_id: string | null
    email: string | null
    password_hash: string | null
    nombre: string | null
    limite_aprobacion_financiera: Decimal | null
    activo: boolean | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id_usuario: string | null
    tenant_id: string | null
    email: string | null
    password_hash: string | null
    nombre: string | null
    limite_aprobacion_financiera: Decimal | null
    activo: boolean | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type UserCountAggregateOutputType = {
    id_usuario: number
    tenant_id: number
    email: number
    password_hash: number
    nombre: number
    rol_global: number
    limite_aprobacion_financiera: number
    activo: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type UserAvgAggregateInputType = {
    limite_aprobacion_financiera?: true
  }

  export type UserSumAggregateInputType = {
    limite_aprobacion_financiera?: true
  }

  export type UserMinAggregateInputType = {
    id_usuario?: true
    tenant_id?: true
    email?: true
    password_hash?: true
    nombre?: true
    limite_aprobacion_financiera?: true
    activo?: true
    created_at?: true
    updated_at?: true
  }

  export type UserMaxAggregateInputType = {
    id_usuario?: true
    tenant_id?: true
    email?: true
    password_hash?: true
    nombre?: true
    limite_aprobacion_financiera?: true
    activo?: true
    created_at?: true
    updated_at?: true
  }

  export type UserCountAggregateInputType = {
    id_usuario?: true
    tenant_id?: true
    email?: true
    password_hash?: true
    nombre?: true
    rol_global?: true
    limite_aprobacion_financiera?: true
    activo?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _avg?: UserAvgAggregateInputType
    _sum?: UserSumAggregateInputType
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id_usuario: string
    tenant_id: string
    email: string
    password_hash: string
    nombre: string
    rol_global: string[]
    limite_aprobacion_financiera: Decimal
    activo: boolean
    created_at: Date
    updated_at: Date
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_usuario?: boolean
    tenant_id?: boolean
    email?: boolean
    password_hash?: boolean
    nombre?: boolean
    rol_global?: boolean
    limite_aprobacion_financiera?: boolean
    activo?: boolean
    created_at?: boolean
    updated_at?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    tokens?: boolean | User$tokensArgs<ExtArgs>
    proyectos_acceso?: boolean | User$proyectos_accesoArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_usuario?: boolean
    tenant_id?: boolean
    email?: boolean
    password_hash?: boolean
    nombre?: boolean
    rol_global?: boolean
    limite_aprobacion_financiera?: boolean
    activo?: boolean
    created_at?: boolean
    updated_at?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id_usuario?: boolean
    tenant_id?: boolean
    email?: boolean
    password_hash?: boolean
    nombre?: boolean
    rol_global?: boolean
    limite_aprobacion_financiera?: boolean
    activo?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    tokens?: boolean | User$tokensArgs<ExtArgs>
    proyectos_acceso?: boolean | User$proyectos_accesoArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      tenant: Prisma.$TenantPayload<ExtArgs>
      tokens: Prisma.$RefreshTokenPayload<ExtArgs>[]
      proyectos_acceso: Prisma.$UserProjectAccessPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id_usuario: string
      tenant_id: string
      email: string
      password_hash: string
      nombre: string
      rol_global: string[]
      limite_aprobacion_financiera: Prisma.Decimal
      activo: boolean
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id_usuario`
     * const userWithId_usuarioOnly = await prisma.user.findMany({ select: { id_usuario: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id_usuario`
     * const userWithId_usuarioOnly = await prisma.user.createManyAndReturn({ 
     *   select: { id_usuario: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tenant<T extends TenantDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TenantDefaultArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    tokens<T extends User$tokensArgs<ExtArgs> = {}>(args?: Subset<T, User$tokensArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RefreshTokenPayload<ExtArgs>, T, "findMany"> | Null>
    proyectos_acceso<T extends User$proyectos_accesoArgs<ExtArgs> = {}>(args?: Subset<T, User$proyectos_accesoArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserProjectAccessPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */ 
  interface UserFieldRefs {
    readonly id_usuario: FieldRef<"User", 'String'>
    readonly tenant_id: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly password_hash: FieldRef<"User", 'String'>
    readonly nombre: FieldRef<"User", 'String'>
    readonly rol_global: FieldRef<"User", 'String[]'>
    readonly limite_aprobacion_financiera: FieldRef<"User", 'Decimal'>
    readonly activo: FieldRef<"User", 'Boolean'>
    readonly created_at: FieldRef<"User", 'DateTime'>
    readonly updated_at: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
  }

  /**
   * User.tokens
   */
  export type User$tokensArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RefreshToken
     */
    select?: RefreshTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RefreshTokenInclude<ExtArgs> | null
    where?: RefreshTokenWhereInput
    orderBy?: RefreshTokenOrderByWithRelationInput | RefreshTokenOrderByWithRelationInput[]
    cursor?: RefreshTokenWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RefreshTokenScalarFieldEnum | RefreshTokenScalarFieldEnum[]
  }

  /**
   * User.proyectos_acceso
   */
  export type User$proyectos_accesoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProjectAccess
     */
    select?: UserProjectAccessSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProjectAccessInclude<ExtArgs> | null
    where?: UserProjectAccessWhereInput
    orderBy?: UserProjectAccessOrderByWithRelationInput | UserProjectAccessOrderByWithRelationInput[]
    cursor?: UserProjectAccessWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserProjectAccessScalarFieldEnum | UserProjectAccessScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model UserProjectAccess
   */

  export type AggregateUserProjectAccess = {
    _count: UserProjectAccessCountAggregateOutputType | null
    _min: UserProjectAccessMinAggregateOutputType | null
    _max: UserProjectAccessMaxAggregateOutputType | null
  }

  export type UserProjectAccessMinAggregateOutputType = {
    id: string | null
    user_id: string | null
    proyecto_id: string | null
    rol_proyecto: string | null
    created_at: Date | null
  }

  export type UserProjectAccessMaxAggregateOutputType = {
    id: string | null
    user_id: string | null
    proyecto_id: string | null
    rol_proyecto: string | null
    created_at: Date | null
  }

  export type UserProjectAccessCountAggregateOutputType = {
    id: number
    user_id: number
    proyecto_id: number
    rol_proyecto: number
    created_at: number
    _all: number
  }


  export type UserProjectAccessMinAggregateInputType = {
    id?: true
    user_id?: true
    proyecto_id?: true
    rol_proyecto?: true
    created_at?: true
  }

  export type UserProjectAccessMaxAggregateInputType = {
    id?: true
    user_id?: true
    proyecto_id?: true
    rol_proyecto?: true
    created_at?: true
  }

  export type UserProjectAccessCountAggregateInputType = {
    id?: true
    user_id?: true
    proyecto_id?: true
    rol_proyecto?: true
    created_at?: true
    _all?: true
  }

  export type UserProjectAccessAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserProjectAccess to aggregate.
     */
    where?: UserProjectAccessWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserProjectAccesses to fetch.
     */
    orderBy?: UserProjectAccessOrderByWithRelationInput | UserProjectAccessOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserProjectAccessWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserProjectAccesses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserProjectAccesses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserProjectAccesses
    **/
    _count?: true | UserProjectAccessCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserProjectAccessMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserProjectAccessMaxAggregateInputType
  }

  export type GetUserProjectAccessAggregateType<T extends UserProjectAccessAggregateArgs> = {
        [P in keyof T & keyof AggregateUserProjectAccess]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserProjectAccess[P]>
      : GetScalarType<T[P], AggregateUserProjectAccess[P]>
  }




  export type UserProjectAccessGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserProjectAccessWhereInput
    orderBy?: UserProjectAccessOrderByWithAggregationInput | UserProjectAccessOrderByWithAggregationInput[]
    by: UserProjectAccessScalarFieldEnum[] | UserProjectAccessScalarFieldEnum
    having?: UserProjectAccessScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserProjectAccessCountAggregateInputType | true
    _min?: UserProjectAccessMinAggregateInputType
    _max?: UserProjectAccessMaxAggregateInputType
  }

  export type UserProjectAccessGroupByOutputType = {
    id: string
    user_id: string
    proyecto_id: string
    rol_proyecto: string | null
    created_at: Date
    _count: UserProjectAccessCountAggregateOutputType | null
    _min: UserProjectAccessMinAggregateOutputType | null
    _max: UserProjectAccessMaxAggregateOutputType | null
  }

  type GetUserProjectAccessGroupByPayload<T extends UserProjectAccessGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserProjectAccessGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserProjectAccessGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserProjectAccessGroupByOutputType[P]>
            : GetScalarType<T[P], UserProjectAccessGroupByOutputType[P]>
        }
      >
    >


  export type UserProjectAccessSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    user_id?: boolean
    proyecto_id?: boolean
    rol_proyecto?: boolean
    created_at?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    proyecto?: boolean | ProyectoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userProjectAccess"]>

  export type UserProjectAccessSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    user_id?: boolean
    proyecto_id?: boolean
    rol_proyecto?: boolean
    created_at?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    proyecto?: boolean | ProyectoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userProjectAccess"]>

  export type UserProjectAccessSelectScalar = {
    id?: boolean
    user_id?: boolean
    proyecto_id?: boolean
    rol_proyecto?: boolean
    created_at?: boolean
  }

  export type UserProjectAccessInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    proyecto?: boolean | ProyectoDefaultArgs<ExtArgs>
  }
  export type UserProjectAccessIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    proyecto?: boolean | ProyectoDefaultArgs<ExtArgs>
  }

  export type $UserProjectAccessPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserProjectAccess"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      proyecto: Prisma.$ProyectoPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      user_id: string
      proyecto_id: string
      rol_proyecto: string | null
      created_at: Date
    }, ExtArgs["result"]["userProjectAccess"]>
    composites: {}
  }

  type UserProjectAccessGetPayload<S extends boolean | null | undefined | UserProjectAccessDefaultArgs> = $Result.GetResult<Prisma.$UserProjectAccessPayload, S>

  type UserProjectAccessCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<UserProjectAccessFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: UserProjectAccessCountAggregateInputType | true
    }

  export interface UserProjectAccessDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserProjectAccess'], meta: { name: 'UserProjectAccess' } }
    /**
     * Find zero or one UserProjectAccess that matches the filter.
     * @param {UserProjectAccessFindUniqueArgs} args - Arguments to find a UserProjectAccess
     * @example
     * // Get one UserProjectAccess
     * const userProjectAccess = await prisma.userProjectAccess.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserProjectAccessFindUniqueArgs>(args: SelectSubset<T, UserProjectAccessFindUniqueArgs<ExtArgs>>): Prisma__UserProjectAccessClient<$Result.GetResult<Prisma.$UserProjectAccessPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one UserProjectAccess that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {UserProjectAccessFindUniqueOrThrowArgs} args - Arguments to find a UserProjectAccess
     * @example
     * // Get one UserProjectAccess
     * const userProjectAccess = await prisma.userProjectAccess.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserProjectAccessFindUniqueOrThrowArgs>(args: SelectSubset<T, UserProjectAccessFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserProjectAccessClient<$Result.GetResult<Prisma.$UserProjectAccessPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first UserProjectAccess that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProjectAccessFindFirstArgs} args - Arguments to find a UserProjectAccess
     * @example
     * // Get one UserProjectAccess
     * const userProjectAccess = await prisma.userProjectAccess.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserProjectAccessFindFirstArgs>(args?: SelectSubset<T, UserProjectAccessFindFirstArgs<ExtArgs>>): Prisma__UserProjectAccessClient<$Result.GetResult<Prisma.$UserProjectAccessPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first UserProjectAccess that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProjectAccessFindFirstOrThrowArgs} args - Arguments to find a UserProjectAccess
     * @example
     * // Get one UserProjectAccess
     * const userProjectAccess = await prisma.userProjectAccess.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserProjectAccessFindFirstOrThrowArgs>(args?: SelectSubset<T, UserProjectAccessFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserProjectAccessClient<$Result.GetResult<Prisma.$UserProjectAccessPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more UserProjectAccesses that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProjectAccessFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserProjectAccesses
     * const userProjectAccesses = await prisma.userProjectAccess.findMany()
     * 
     * // Get first 10 UserProjectAccesses
     * const userProjectAccesses = await prisma.userProjectAccess.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userProjectAccessWithIdOnly = await prisma.userProjectAccess.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserProjectAccessFindManyArgs>(args?: SelectSubset<T, UserProjectAccessFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserProjectAccessPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a UserProjectAccess.
     * @param {UserProjectAccessCreateArgs} args - Arguments to create a UserProjectAccess.
     * @example
     * // Create one UserProjectAccess
     * const UserProjectAccess = await prisma.userProjectAccess.create({
     *   data: {
     *     // ... data to create a UserProjectAccess
     *   }
     * })
     * 
     */
    create<T extends UserProjectAccessCreateArgs>(args: SelectSubset<T, UserProjectAccessCreateArgs<ExtArgs>>): Prisma__UserProjectAccessClient<$Result.GetResult<Prisma.$UserProjectAccessPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many UserProjectAccesses.
     * @param {UserProjectAccessCreateManyArgs} args - Arguments to create many UserProjectAccesses.
     * @example
     * // Create many UserProjectAccesses
     * const userProjectAccess = await prisma.userProjectAccess.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserProjectAccessCreateManyArgs>(args?: SelectSubset<T, UserProjectAccessCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserProjectAccesses and returns the data saved in the database.
     * @param {UserProjectAccessCreateManyAndReturnArgs} args - Arguments to create many UserProjectAccesses.
     * @example
     * // Create many UserProjectAccesses
     * const userProjectAccess = await prisma.userProjectAccess.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UserProjectAccesses and only return the `id`
     * const userProjectAccessWithIdOnly = await prisma.userProjectAccess.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserProjectAccessCreateManyAndReturnArgs>(args?: SelectSubset<T, UserProjectAccessCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserProjectAccessPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a UserProjectAccess.
     * @param {UserProjectAccessDeleteArgs} args - Arguments to delete one UserProjectAccess.
     * @example
     * // Delete one UserProjectAccess
     * const UserProjectAccess = await prisma.userProjectAccess.delete({
     *   where: {
     *     // ... filter to delete one UserProjectAccess
     *   }
     * })
     * 
     */
    delete<T extends UserProjectAccessDeleteArgs>(args: SelectSubset<T, UserProjectAccessDeleteArgs<ExtArgs>>): Prisma__UserProjectAccessClient<$Result.GetResult<Prisma.$UserProjectAccessPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one UserProjectAccess.
     * @param {UserProjectAccessUpdateArgs} args - Arguments to update one UserProjectAccess.
     * @example
     * // Update one UserProjectAccess
     * const userProjectAccess = await prisma.userProjectAccess.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserProjectAccessUpdateArgs>(args: SelectSubset<T, UserProjectAccessUpdateArgs<ExtArgs>>): Prisma__UserProjectAccessClient<$Result.GetResult<Prisma.$UserProjectAccessPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more UserProjectAccesses.
     * @param {UserProjectAccessDeleteManyArgs} args - Arguments to filter UserProjectAccesses to delete.
     * @example
     * // Delete a few UserProjectAccesses
     * const { count } = await prisma.userProjectAccess.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserProjectAccessDeleteManyArgs>(args?: SelectSubset<T, UserProjectAccessDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserProjectAccesses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProjectAccessUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserProjectAccesses
     * const userProjectAccess = await prisma.userProjectAccess.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserProjectAccessUpdateManyArgs>(args: SelectSubset<T, UserProjectAccessUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one UserProjectAccess.
     * @param {UserProjectAccessUpsertArgs} args - Arguments to update or create a UserProjectAccess.
     * @example
     * // Update or create a UserProjectAccess
     * const userProjectAccess = await prisma.userProjectAccess.upsert({
     *   create: {
     *     // ... data to create a UserProjectAccess
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserProjectAccess we want to update
     *   }
     * })
     */
    upsert<T extends UserProjectAccessUpsertArgs>(args: SelectSubset<T, UserProjectAccessUpsertArgs<ExtArgs>>): Prisma__UserProjectAccessClient<$Result.GetResult<Prisma.$UserProjectAccessPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of UserProjectAccesses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProjectAccessCountArgs} args - Arguments to filter UserProjectAccesses to count.
     * @example
     * // Count the number of UserProjectAccesses
     * const count = await prisma.userProjectAccess.count({
     *   where: {
     *     // ... the filter for the UserProjectAccesses we want to count
     *   }
     * })
    **/
    count<T extends UserProjectAccessCountArgs>(
      args?: Subset<T, UserProjectAccessCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserProjectAccessCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserProjectAccess.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProjectAccessAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserProjectAccessAggregateArgs>(args: Subset<T, UserProjectAccessAggregateArgs>): Prisma.PrismaPromise<GetUserProjectAccessAggregateType<T>>

    /**
     * Group by UserProjectAccess.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProjectAccessGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserProjectAccessGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserProjectAccessGroupByArgs['orderBy'] }
        : { orderBy?: UserProjectAccessGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserProjectAccessGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserProjectAccessGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserProjectAccess model
   */
  readonly fields: UserProjectAccessFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserProjectAccess.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserProjectAccessClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    proyecto<T extends ProyectoDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProyectoDefaultArgs<ExtArgs>>): Prisma__ProyectoClient<$Result.GetResult<Prisma.$ProyectoPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UserProjectAccess model
   */ 
  interface UserProjectAccessFieldRefs {
    readonly id: FieldRef<"UserProjectAccess", 'String'>
    readonly user_id: FieldRef<"UserProjectAccess", 'String'>
    readonly proyecto_id: FieldRef<"UserProjectAccess", 'String'>
    readonly rol_proyecto: FieldRef<"UserProjectAccess", 'String'>
    readonly created_at: FieldRef<"UserProjectAccess", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * UserProjectAccess findUnique
   */
  export type UserProjectAccessFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProjectAccess
     */
    select?: UserProjectAccessSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProjectAccessInclude<ExtArgs> | null
    /**
     * Filter, which UserProjectAccess to fetch.
     */
    where: UserProjectAccessWhereUniqueInput
  }

  /**
   * UserProjectAccess findUniqueOrThrow
   */
  export type UserProjectAccessFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProjectAccess
     */
    select?: UserProjectAccessSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProjectAccessInclude<ExtArgs> | null
    /**
     * Filter, which UserProjectAccess to fetch.
     */
    where: UserProjectAccessWhereUniqueInput
  }

  /**
   * UserProjectAccess findFirst
   */
  export type UserProjectAccessFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProjectAccess
     */
    select?: UserProjectAccessSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProjectAccessInclude<ExtArgs> | null
    /**
     * Filter, which UserProjectAccess to fetch.
     */
    where?: UserProjectAccessWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserProjectAccesses to fetch.
     */
    orderBy?: UserProjectAccessOrderByWithRelationInput | UserProjectAccessOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserProjectAccesses.
     */
    cursor?: UserProjectAccessWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserProjectAccesses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserProjectAccesses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserProjectAccesses.
     */
    distinct?: UserProjectAccessScalarFieldEnum | UserProjectAccessScalarFieldEnum[]
  }

  /**
   * UserProjectAccess findFirstOrThrow
   */
  export type UserProjectAccessFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProjectAccess
     */
    select?: UserProjectAccessSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProjectAccessInclude<ExtArgs> | null
    /**
     * Filter, which UserProjectAccess to fetch.
     */
    where?: UserProjectAccessWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserProjectAccesses to fetch.
     */
    orderBy?: UserProjectAccessOrderByWithRelationInput | UserProjectAccessOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserProjectAccesses.
     */
    cursor?: UserProjectAccessWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserProjectAccesses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserProjectAccesses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserProjectAccesses.
     */
    distinct?: UserProjectAccessScalarFieldEnum | UserProjectAccessScalarFieldEnum[]
  }

  /**
   * UserProjectAccess findMany
   */
  export type UserProjectAccessFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProjectAccess
     */
    select?: UserProjectAccessSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProjectAccessInclude<ExtArgs> | null
    /**
     * Filter, which UserProjectAccesses to fetch.
     */
    where?: UserProjectAccessWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserProjectAccesses to fetch.
     */
    orderBy?: UserProjectAccessOrderByWithRelationInput | UserProjectAccessOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserProjectAccesses.
     */
    cursor?: UserProjectAccessWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserProjectAccesses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserProjectAccesses.
     */
    skip?: number
    distinct?: UserProjectAccessScalarFieldEnum | UserProjectAccessScalarFieldEnum[]
  }

  /**
   * UserProjectAccess create
   */
  export type UserProjectAccessCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProjectAccess
     */
    select?: UserProjectAccessSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProjectAccessInclude<ExtArgs> | null
    /**
     * The data needed to create a UserProjectAccess.
     */
    data: XOR<UserProjectAccessCreateInput, UserProjectAccessUncheckedCreateInput>
  }

  /**
   * UserProjectAccess createMany
   */
  export type UserProjectAccessCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserProjectAccesses.
     */
    data: UserProjectAccessCreateManyInput | UserProjectAccessCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserProjectAccess createManyAndReturn
   */
  export type UserProjectAccessCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProjectAccess
     */
    select?: UserProjectAccessSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many UserProjectAccesses.
     */
    data: UserProjectAccessCreateManyInput | UserProjectAccessCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProjectAccessIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserProjectAccess update
   */
  export type UserProjectAccessUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProjectAccess
     */
    select?: UserProjectAccessSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProjectAccessInclude<ExtArgs> | null
    /**
     * The data needed to update a UserProjectAccess.
     */
    data: XOR<UserProjectAccessUpdateInput, UserProjectAccessUncheckedUpdateInput>
    /**
     * Choose, which UserProjectAccess to update.
     */
    where: UserProjectAccessWhereUniqueInput
  }

  /**
   * UserProjectAccess updateMany
   */
  export type UserProjectAccessUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserProjectAccesses.
     */
    data: XOR<UserProjectAccessUpdateManyMutationInput, UserProjectAccessUncheckedUpdateManyInput>
    /**
     * Filter which UserProjectAccesses to update
     */
    where?: UserProjectAccessWhereInput
  }

  /**
   * UserProjectAccess upsert
   */
  export type UserProjectAccessUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProjectAccess
     */
    select?: UserProjectAccessSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProjectAccessInclude<ExtArgs> | null
    /**
     * The filter to search for the UserProjectAccess to update in case it exists.
     */
    where: UserProjectAccessWhereUniqueInput
    /**
     * In case the UserProjectAccess found by the `where` argument doesn't exist, create a new UserProjectAccess with this data.
     */
    create: XOR<UserProjectAccessCreateInput, UserProjectAccessUncheckedCreateInput>
    /**
     * In case the UserProjectAccess was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserProjectAccessUpdateInput, UserProjectAccessUncheckedUpdateInput>
  }

  /**
   * UserProjectAccess delete
   */
  export type UserProjectAccessDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProjectAccess
     */
    select?: UserProjectAccessSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProjectAccessInclude<ExtArgs> | null
    /**
     * Filter which UserProjectAccess to delete.
     */
    where: UserProjectAccessWhereUniqueInput
  }

  /**
   * UserProjectAccess deleteMany
   */
  export type UserProjectAccessDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserProjectAccesses to delete
     */
    where?: UserProjectAccessWhereInput
  }

  /**
   * UserProjectAccess without action
   */
  export type UserProjectAccessDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProjectAccess
     */
    select?: UserProjectAccessSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProjectAccessInclude<ExtArgs> | null
  }


  /**
   * Model RefreshToken
   */

  export type AggregateRefreshToken = {
    _count: RefreshTokenCountAggregateOutputType | null
    _min: RefreshTokenMinAggregateOutputType | null
    _max: RefreshTokenMaxAggregateOutputType | null
  }

  export type RefreshTokenMinAggregateOutputType = {
    id: string | null
    user_id: string | null
    token_hash: string | null
    expires_at: Date | null
    revoked: boolean | null
    created_at: Date | null
    user_agent: string | null
    ip_address: string | null
    sesion_iniciada_en: Date | null
  }

  export type RefreshTokenMaxAggregateOutputType = {
    id: string | null
    user_id: string | null
    token_hash: string | null
    expires_at: Date | null
    revoked: boolean | null
    created_at: Date | null
    user_agent: string | null
    ip_address: string | null
    sesion_iniciada_en: Date | null
  }

  export type RefreshTokenCountAggregateOutputType = {
    id: number
    user_id: number
    token_hash: number
    expires_at: number
    revoked: number
    created_at: number
    user_agent: number
    ip_address: number
    sesion_iniciada_en: number
    _all: number
  }


  export type RefreshTokenMinAggregateInputType = {
    id?: true
    user_id?: true
    token_hash?: true
    expires_at?: true
    revoked?: true
    created_at?: true
    user_agent?: true
    ip_address?: true
    sesion_iniciada_en?: true
  }

  export type RefreshTokenMaxAggregateInputType = {
    id?: true
    user_id?: true
    token_hash?: true
    expires_at?: true
    revoked?: true
    created_at?: true
    user_agent?: true
    ip_address?: true
    sesion_iniciada_en?: true
  }

  export type RefreshTokenCountAggregateInputType = {
    id?: true
    user_id?: true
    token_hash?: true
    expires_at?: true
    revoked?: true
    created_at?: true
    user_agent?: true
    ip_address?: true
    sesion_iniciada_en?: true
    _all?: true
  }

  export type RefreshTokenAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RefreshToken to aggregate.
     */
    where?: RefreshTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RefreshTokens to fetch.
     */
    orderBy?: RefreshTokenOrderByWithRelationInput | RefreshTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RefreshTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RefreshTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RefreshTokens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned RefreshTokens
    **/
    _count?: true | RefreshTokenCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RefreshTokenMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RefreshTokenMaxAggregateInputType
  }

  export type GetRefreshTokenAggregateType<T extends RefreshTokenAggregateArgs> = {
        [P in keyof T & keyof AggregateRefreshToken]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRefreshToken[P]>
      : GetScalarType<T[P], AggregateRefreshToken[P]>
  }




  export type RefreshTokenGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RefreshTokenWhereInput
    orderBy?: RefreshTokenOrderByWithAggregationInput | RefreshTokenOrderByWithAggregationInput[]
    by: RefreshTokenScalarFieldEnum[] | RefreshTokenScalarFieldEnum
    having?: RefreshTokenScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RefreshTokenCountAggregateInputType | true
    _min?: RefreshTokenMinAggregateInputType
    _max?: RefreshTokenMaxAggregateInputType
  }

  export type RefreshTokenGroupByOutputType = {
    id: string
    user_id: string
    token_hash: string
    expires_at: Date
    revoked: boolean
    created_at: Date
    user_agent: string | null
    ip_address: string | null
    sesion_iniciada_en: Date | null
    _count: RefreshTokenCountAggregateOutputType | null
    _min: RefreshTokenMinAggregateOutputType | null
    _max: RefreshTokenMaxAggregateOutputType | null
  }

  type GetRefreshTokenGroupByPayload<T extends RefreshTokenGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RefreshTokenGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RefreshTokenGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RefreshTokenGroupByOutputType[P]>
            : GetScalarType<T[P], RefreshTokenGroupByOutputType[P]>
        }
      >
    >


  export type RefreshTokenSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    user_id?: boolean
    token_hash?: boolean
    expires_at?: boolean
    revoked?: boolean
    created_at?: boolean
    user_agent?: boolean
    ip_address?: boolean
    sesion_iniciada_en?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["refreshToken"]>

  export type RefreshTokenSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    user_id?: boolean
    token_hash?: boolean
    expires_at?: boolean
    revoked?: boolean
    created_at?: boolean
    user_agent?: boolean
    ip_address?: boolean
    sesion_iniciada_en?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["refreshToken"]>

  export type RefreshTokenSelectScalar = {
    id?: boolean
    user_id?: boolean
    token_hash?: boolean
    expires_at?: boolean
    revoked?: boolean
    created_at?: boolean
    user_agent?: boolean
    ip_address?: boolean
    sesion_iniciada_en?: boolean
  }

  export type RefreshTokenInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type RefreshTokenIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $RefreshTokenPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "RefreshToken"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      user_id: string
      token_hash: string
      expires_at: Date
      revoked: boolean
      created_at: Date
      user_agent: string | null
      ip_address: string | null
      sesion_iniciada_en: Date | null
    }, ExtArgs["result"]["refreshToken"]>
    composites: {}
  }

  type RefreshTokenGetPayload<S extends boolean | null | undefined | RefreshTokenDefaultArgs> = $Result.GetResult<Prisma.$RefreshTokenPayload, S>

  type RefreshTokenCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<RefreshTokenFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: RefreshTokenCountAggregateInputType | true
    }

  export interface RefreshTokenDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['RefreshToken'], meta: { name: 'RefreshToken' } }
    /**
     * Find zero or one RefreshToken that matches the filter.
     * @param {RefreshTokenFindUniqueArgs} args - Arguments to find a RefreshToken
     * @example
     * // Get one RefreshToken
     * const refreshToken = await prisma.refreshToken.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RefreshTokenFindUniqueArgs>(args: SelectSubset<T, RefreshTokenFindUniqueArgs<ExtArgs>>): Prisma__RefreshTokenClient<$Result.GetResult<Prisma.$RefreshTokenPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one RefreshToken that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {RefreshTokenFindUniqueOrThrowArgs} args - Arguments to find a RefreshToken
     * @example
     * // Get one RefreshToken
     * const refreshToken = await prisma.refreshToken.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RefreshTokenFindUniqueOrThrowArgs>(args: SelectSubset<T, RefreshTokenFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RefreshTokenClient<$Result.GetResult<Prisma.$RefreshTokenPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first RefreshToken that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RefreshTokenFindFirstArgs} args - Arguments to find a RefreshToken
     * @example
     * // Get one RefreshToken
     * const refreshToken = await prisma.refreshToken.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RefreshTokenFindFirstArgs>(args?: SelectSubset<T, RefreshTokenFindFirstArgs<ExtArgs>>): Prisma__RefreshTokenClient<$Result.GetResult<Prisma.$RefreshTokenPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first RefreshToken that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RefreshTokenFindFirstOrThrowArgs} args - Arguments to find a RefreshToken
     * @example
     * // Get one RefreshToken
     * const refreshToken = await prisma.refreshToken.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RefreshTokenFindFirstOrThrowArgs>(args?: SelectSubset<T, RefreshTokenFindFirstOrThrowArgs<ExtArgs>>): Prisma__RefreshTokenClient<$Result.GetResult<Prisma.$RefreshTokenPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more RefreshTokens that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RefreshTokenFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RefreshTokens
     * const refreshTokens = await prisma.refreshToken.findMany()
     * 
     * // Get first 10 RefreshTokens
     * const refreshTokens = await prisma.refreshToken.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const refreshTokenWithIdOnly = await prisma.refreshToken.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RefreshTokenFindManyArgs>(args?: SelectSubset<T, RefreshTokenFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RefreshTokenPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a RefreshToken.
     * @param {RefreshTokenCreateArgs} args - Arguments to create a RefreshToken.
     * @example
     * // Create one RefreshToken
     * const RefreshToken = await prisma.refreshToken.create({
     *   data: {
     *     // ... data to create a RefreshToken
     *   }
     * })
     * 
     */
    create<T extends RefreshTokenCreateArgs>(args: SelectSubset<T, RefreshTokenCreateArgs<ExtArgs>>): Prisma__RefreshTokenClient<$Result.GetResult<Prisma.$RefreshTokenPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many RefreshTokens.
     * @param {RefreshTokenCreateManyArgs} args - Arguments to create many RefreshTokens.
     * @example
     * // Create many RefreshTokens
     * const refreshToken = await prisma.refreshToken.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RefreshTokenCreateManyArgs>(args?: SelectSubset<T, RefreshTokenCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many RefreshTokens and returns the data saved in the database.
     * @param {RefreshTokenCreateManyAndReturnArgs} args - Arguments to create many RefreshTokens.
     * @example
     * // Create many RefreshTokens
     * const refreshToken = await prisma.refreshToken.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many RefreshTokens and only return the `id`
     * const refreshTokenWithIdOnly = await prisma.refreshToken.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RefreshTokenCreateManyAndReturnArgs>(args?: SelectSubset<T, RefreshTokenCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RefreshTokenPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a RefreshToken.
     * @param {RefreshTokenDeleteArgs} args - Arguments to delete one RefreshToken.
     * @example
     * // Delete one RefreshToken
     * const RefreshToken = await prisma.refreshToken.delete({
     *   where: {
     *     // ... filter to delete one RefreshToken
     *   }
     * })
     * 
     */
    delete<T extends RefreshTokenDeleteArgs>(args: SelectSubset<T, RefreshTokenDeleteArgs<ExtArgs>>): Prisma__RefreshTokenClient<$Result.GetResult<Prisma.$RefreshTokenPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one RefreshToken.
     * @param {RefreshTokenUpdateArgs} args - Arguments to update one RefreshToken.
     * @example
     * // Update one RefreshToken
     * const refreshToken = await prisma.refreshToken.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RefreshTokenUpdateArgs>(args: SelectSubset<T, RefreshTokenUpdateArgs<ExtArgs>>): Prisma__RefreshTokenClient<$Result.GetResult<Prisma.$RefreshTokenPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more RefreshTokens.
     * @param {RefreshTokenDeleteManyArgs} args - Arguments to filter RefreshTokens to delete.
     * @example
     * // Delete a few RefreshTokens
     * const { count } = await prisma.refreshToken.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RefreshTokenDeleteManyArgs>(args?: SelectSubset<T, RefreshTokenDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RefreshTokens.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RefreshTokenUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RefreshTokens
     * const refreshToken = await prisma.refreshToken.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RefreshTokenUpdateManyArgs>(args: SelectSubset<T, RefreshTokenUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one RefreshToken.
     * @param {RefreshTokenUpsertArgs} args - Arguments to update or create a RefreshToken.
     * @example
     * // Update or create a RefreshToken
     * const refreshToken = await prisma.refreshToken.upsert({
     *   create: {
     *     // ... data to create a RefreshToken
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RefreshToken we want to update
     *   }
     * })
     */
    upsert<T extends RefreshTokenUpsertArgs>(args: SelectSubset<T, RefreshTokenUpsertArgs<ExtArgs>>): Prisma__RefreshTokenClient<$Result.GetResult<Prisma.$RefreshTokenPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of RefreshTokens.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RefreshTokenCountArgs} args - Arguments to filter RefreshTokens to count.
     * @example
     * // Count the number of RefreshTokens
     * const count = await prisma.refreshToken.count({
     *   where: {
     *     // ... the filter for the RefreshTokens we want to count
     *   }
     * })
    **/
    count<T extends RefreshTokenCountArgs>(
      args?: Subset<T, RefreshTokenCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RefreshTokenCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a RefreshToken.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RefreshTokenAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RefreshTokenAggregateArgs>(args: Subset<T, RefreshTokenAggregateArgs>): Prisma.PrismaPromise<GetRefreshTokenAggregateType<T>>

    /**
     * Group by RefreshToken.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RefreshTokenGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RefreshTokenGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RefreshTokenGroupByArgs['orderBy'] }
        : { orderBy?: RefreshTokenGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RefreshTokenGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRefreshTokenGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the RefreshToken model
   */
  readonly fields: RefreshTokenFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for RefreshToken.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RefreshTokenClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the RefreshToken model
   */ 
  interface RefreshTokenFieldRefs {
    readonly id: FieldRef<"RefreshToken", 'String'>
    readonly user_id: FieldRef<"RefreshToken", 'String'>
    readonly token_hash: FieldRef<"RefreshToken", 'String'>
    readonly expires_at: FieldRef<"RefreshToken", 'DateTime'>
    readonly revoked: FieldRef<"RefreshToken", 'Boolean'>
    readonly created_at: FieldRef<"RefreshToken", 'DateTime'>
    readonly user_agent: FieldRef<"RefreshToken", 'String'>
    readonly ip_address: FieldRef<"RefreshToken", 'String'>
    readonly sesion_iniciada_en: FieldRef<"RefreshToken", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * RefreshToken findUnique
   */
  export type RefreshTokenFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RefreshToken
     */
    select?: RefreshTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RefreshTokenInclude<ExtArgs> | null
    /**
     * Filter, which RefreshToken to fetch.
     */
    where: RefreshTokenWhereUniqueInput
  }

  /**
   * RefreshToken findUniqueOrThrow
   */
  export type RefreshTokenFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RefreshToken
     */
    select?: RefreshTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RefreshTokenInclude<ExtArgs> | null
    /**
     * Filter, which RefreshToken to fetch.
     */
    where: RefreshTokenWhereUniqueInput
  }

  /**
   * RefreshToken findFirst
   */
  export type RefreshTokenFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RefreshToken
     */
    select?: RefreshTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RefreshTokenInclude<ExtArgs> | null
    /**
     * Filter, which RefreshToken to fetch.
     */
    where?: RefreshTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RefreshTokens to fetch.
     */
    orderBy?: RefreshTokenOrderByWithRelationInput | RefreshTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RefreshTokens.
     */
    cursor?: RefreshTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RefreshTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RefreshTokens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RefreshTokens.
     */
    distinct?: RefreshTokenScalarFieldEnum | RefreshTokenScalarFieldEnum[]
  }

  /**
   * RefreshToken findFirstOrThrow
   */
  export type RefreshTokenFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RefreshToken
     */
    select?: RefreshTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RefreshTokenInclude<ExtArgs> | null
    /**
     * Filter, which RefreshToken to fetch.
     */
    where?: RefreshTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RefreshTokens to fetch.
     */
    orderBy?: RefreshTokenOrderByWithRelationInput | RefreshTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RefreshTokens.
     */
    cursor?: RefreshTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RefreshTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RefreshTokens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RefreshTokens.
     */
    distinct?: RefreshTokenScalarFieldEnum | RefreshTokenScalarFieldEnum[]
  }

  /**
   * RefreshToken findMany
   */
  export type RefreshTokenFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RefreshToken
     */
    select?: RefreshTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RefreshTokenInclude<ExtArgs> | null
    /**
     * Filter, which RefreshTokens to fetch.
     */
    where?: RefreshTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RefreshTokens to fetch.
     */
    orderBy?: RefreshTokenOrderByWithRelationInput | RefreshTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing RefreshTokens.
     */
    cursor?: RefreshTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RefreshTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RefreshTokens.
     */
    skip?: number
    distinct?: RefreshTokenScalarFieldEnum | RefreshTokenScalarFieldEnum[]
  }

  /**
   * RefreshToken create
   */
  export type RefreshTokenCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RefreshToken
     */
    select?: RefreshTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RefreshTokenInclude<ExtArgs> | null
    /**
     * The data needed to create a RefreshToken.
     */
    data: XOR<RefreshTokenCreateInput, RefreshTokenUncheckedCreateInput>
  }

  /**
   * RefreshToken createMany
   */
  export type RefreshTokenCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many RefreshTokens.
     */
    data: RefreshTokenCreateManyInput | RefreshTokenCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RefreshToken createManyAndReturn
   */
  export type RefreshTokenCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RefreshToken
     */
    select?: RefreshTokenSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many RefreshTokens.
     */
    data: RefreshTokenCreateManyInput | RefreshTokenCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RefreshTokenIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * RefreshToken update
   */
  export type RefreshTokenUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RefreshToken
     */
    select?: RefreshTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RefreshTokenInclude<ExtArgs> | null
    /**
     * The data needed to update a RefreshToken.
     */
    data: XOR<RefreshTokenUpdateInput, RefreshTokenUncheckedUpdateInput>
    /**
     * Choose, which RefreshToken to update.
     */
    where: RefreshTokenWhereUniqueInput
  }

  /**
   * RefreshToken updateMany
   */
  export type RefreshTokenUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update RefreshTokens.
     */
    data: XOR<RefreshTokenUpdateManyMutationInput, RefreshTokenUncheckedUpdateManyInput>
    /**
     * Filter which RefreshTokens to update
     */
    where?: RefreshTokenWhereInput
  }

  /**
   * RefreshToken upsert
   */
  export type RefreshTokenUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RefreshToken
     */
    select?: RefreshTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RefreshTokenInclude<ExtArgs> | null
    /**
     * The filter to search for the RefreshToken to update in case it exists.
     */
    where: RefreshTokenWhereUniqueInput
    /**
     * In case the RefreshToken found by the `where` argument doesn't exist, create a new RefreshToken with this data.
     */
    create: XOR<RefreshTokenCreateInput, RefreshTokenUncheckedCreateInput>
    /**
     * In case the RefreshToken was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RefreshTokenUpdateInput, RefreshTokenUncheckedUpdateInput>
  }

  /**
   * RefreshToken delete
   */
  export type RefreshTokenDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RefreshToken
     */
    select?: RefreshTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RefreshTokenInclude<ExtArgs> | null
    /**
     * Filter which RefreshToken to delete.
     */
    where: RefreshTokenWhereUniqueInput
  }

  /**
   * RefreshToken deleteMany
   */
  export type RefreshTokenDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RefreshTokens to delete
     */
    where?: RefreshTokenWhereInput
  }

  /**
   * RefreshToken without action
   */
  export type RefreshTokenDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RefreshToken
     */
    select?: RefreshTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RefreshTokenInclude<ExtArgs> | null
  }


  /**
   * Model MasterAuditLog
   */

  export type AggregateMasterAuditLog = {
    _count: MasterAuditLogCountAggregateOutputType | null
    _avg: MasterAuditLogAvgAggregateOutputType | null
    _sum: MasterAuditLogSumAggregateOutputType | null
    _min: MasterAuditLogMinAggregateOutputType | null
    _max: MasterAuditLogMaxAggregateOutputType | null
  }

  export type MasterAuditLogAvgAggregateOutputType = {
    status_code: number | null
  }

  export type MasterAuditLogSumAggregateOutputType = {
    status_code: number | null
  }

  export type MasterAuditLogMinAggregateOutputType = {
    id: string | null
    accion: string | null
    entity_type: string | null
    entity_id: string | null
    ip_address: string | null
    user_agent: string | null
    status_code: number | null
    error_msg: string | null
    created_at: Date | null
  }

  export type MasterAuditLogMaxAggregateOutputType = {
    id: string | null
    accion: string | null
    entity_type: string | null
    entity_id: string | null
    ip_address: string | null
    user_agent: string | null
    status_code: number | null
    error_msg: string | null
    created_at: Date | null
  }

  export type MasterAuditLogCountAggregateOutputType = {
    id: number
    accion: number
    entity_type: number
    entity_id: number
    ip_address: number
    user_agent: number
    payload: number
    status_code: number
    error_msg: number
    created_at: number
    _all: number
  }


  export type MasterAuditLogAvgAggregateInputType = {
    status_code?: true
  }

  export type MasterAuditLogSumAggregateInputType = {
    status_code?: true
  }

  export type MasterAuditLogMinAggregateInputType = {
    id?: true
    accion?: true
    entity_type?: true
    entity_id?: true
    ip_address?: true
    user_agent?: true
    status_code?: true
    error_msg?: true
    created_at?: true
  }

  export type MasterAuditLogMaxAggregateInputType = {
    id?: true
    accion?: true
    entity_type?: true
    entity_id?: true
    ip_address?: true
    user_agent?: true
    status_code?: true
    error_msg?: true
    created_at?: true
  }

  export type MasterAuditLogCountAggregateInputType = {
    id?: true
    accion?: true
    entity_type?: true
    entity_id?: true
    ip_address?: true
    user_agent?: true
    payload?: true
    status_code?: true
    error_msg?: true
    created_at?: true
    _all?: true
  }

  export type MasterAuditLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MasterAuditLog to aggregate.
     */
    where?: MasterAuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MasterAuditLogs to fetch.
     */
    orderBy?: MasterAuditLogOrderByWithRelationInput | MasterAuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MasterAuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MasterAuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MasterAuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MasterAuditLogs
    **/
    _count?: true | MasterAuditLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: MasterAuditLogAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: MasterAuditLogSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MasterAuditLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MasterAuditLogMaxAggregateInputType
  }

  export type GetMasterAuditLogAggregateType<T extends MasterAuditLogAggregateArgs> = {
        [P in keyof T & keyof AggregateMasterAuditLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMasterAuditLog[P]>
      : GetScalarType<T[P], AggregateMasterAuditLog[P]>
  }




  export type MasterAuditLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MasterAuditLogWhereInput
    orderBy?: MasterAuditLogOrderByWithAggregationInput | MasterAuditLogOrderByWithAggregationInput[]
    by: MasterAuditLogScalarFieldEnum[] | MasterAuditLogScalarFieldEnum
    having?: MasterAuditLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MasterAuditLogCountAggregateInputType | true
    _avg?: MasterAuditLogAvgAggregateInputType
    _sum?: MasterAuditLogSumAggregateInputType
    _min?: MasterAuditLogMinAggregateInputType
    _max?: MasterAuditLogMaxAggregateInputType
  }

  export type MasterAuditLogGroupByOutputType = {
    id: string
    accion: string
    entity_type: string
    entity_id: string | null
    ip_address: string | null
    user_agent: string | null
    payload: JsonValue | null
    status_code: number
    error_msg: string | null
    created_at: Date
    _count: MasterAuditLogCountAggregateOutputType | null
    _avg: MasterAuditLogAvgAggregateOutputType | null
    _sum: MasterAuditLogSumAggregateOutputType | null
    _min: MasterAuditLogMinAggregateOutputType | null
    _max: MasterAuditLogMaxAggregateOutputType | null
  }

  type GetMasterAuditLogGroupByPayload<T extends MasterAuditLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MasterAuditLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MasterAuditLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MasterAuditLogGroupByOutputType[P]>
            : GetScalarType<T[P], MasterAuditLogGroupByOutputType[P]>
        }
      >
    >


  export type MasterAuditLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    accion?: boolean
    entity_type?: boolean
    entity_id?: boolean
    ip_address?: boolean
    user_agent?: boolean
    payload?: boolean
    status_code?: boolean
    error_msg?: boolean
    created_at?: boolean
  }, ExtArgs["result"]["masterAuditLog"]>

  export type MasterAuditLogSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    accion?: boolean
    entity_type?: boolean
    entity_id?: boolean
    ip_address?: boolean
    user_agent?: boolean
    payload?: boolean
    status_code?: boolean
    error_msg?: boolean
    created_at?: boolean
  }, ExtArgs["result"]["masterAuditLog"]>

  export type MasterAuditLogSelectScalar = {
    id?: boolean
    accion?: boolean
    entity_type?: boolean
    entity_id?: boolean
    ip_address?: boolean
    user_agent?: boolean
    payload?: boolean
    status_code?: boolean
    error_msg?: boolean
    created_at?: boolean
  }


  export type $MasterAuditLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MasterAuditLog"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      accion: string
      entity_type: string
      entity_id: string | null
      ip_address: string | null
      user_agent: string | null
      payload: Prisma.JsonValue | null
      status_code: number
      error_msg: string | null
      created_at: Date
    }, ExtArgs["result"]["masterAuditLog"]>
    composites: {}
  }

  type MasterAuditLogGetPayload<S extends boolean | null | undefined | MasterAuditLogDefaultArgs> = $Result.GetResult<Prisma.$MasterAuditLogPayload, S>

  type MasterAuditLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<MasterAuditLogFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: MasterAuditLogCountAggregateInputType | true
    }

  export interface MasterAuditLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MasterAuditLog'], meta: { name: 'MasterAuditLog' } }
    /**
     * Find zero or one MasterAuditLog that matches the filter.
     * @param {MasterAuditLogFindUniqueArgs} args - Arguments to find a MasterAuditLog
     * @example
     * // Get one MasterAuditLog
     * const masterAuditLog = await prisma.masterAuditLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MasterAuditLogFindUniqueArgs>(args: SelectSubset<T, MasterAuditLogFindUniqueArgs<ExtArgs>>): Prisma__MasterAuditLogClient<$Result.GetResult<Prisma.$MasterAuditLogPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one MasterAuditLog that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {MasterAuditLogFindUniqueOrThrowArgs} args - Arguments to find a MasterAuditLog
     * @example
     * // Get one MasterAuditLog
     * const masterAuditLog = await prisma.masterAuditLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MasterAuditLogFindUniqueOrThrowArgs>(args: SelectSubset<T, MasterAuditLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MasterAuditLogClient<$Result.GetResult<Prisma.$MasterAuditLogPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first MasterAuditLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MasterAuditLogFindFirstArgs} args - Arguments to find a MasterAuditLog
     * @example
     * // Get one MasterAuditLog
     * const masterAuditLog = await prisma.masterAuditLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MasterAuditLogFindFirstArgs>(args?: SelectSubset<T, MasterAuditLogFindFirstArgs<ExtArgs>>): Prisma__MasterAuditLogClient<$Result.GetResult<Prisma.$MasterAuditLogPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first MasterAuditLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MasterAuditLogFindFirstOrThrowArgs} args - Arguments to find a MasterAuditLog
     * @example
     * // Get one MasterAuditLog
     * const masterAuditLog = await prisma.masterAuditLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MasterAuditLogFindFirstOrThrowArgs>(args?: SelectSubset<T, MasterAuditLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__MasterAuditLogClient<$Result.GetResult<Prisma.$MasterAuditLogPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more MasterAuditLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MasterAuditLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MasterAuditLogs
     * const masterAuditLogs = await prisma.masterAuditLog.findMany()
     * 
     * // Get first 10 MasterAuditLogs
     * const masterAuditLogs = await prisma.masterAuditLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const masterAuditLogWithIdOnly = await prisma.masterAuditLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MasterAuditLogFindManyArgs>(args?: SelectSubset<T, MasterAuditLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MasterAuditLogPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a MasterAuditLog.
     * @param {MasterAuditLogCreateArgs} args - Arguments to create a MasterAuditLog.
     * @example
     * // Create one MasterAuditLog
     * const MasterAuditLog = await prisma.masterAuditLog.create({
     *   data: {
     *     // ... data to create a MasterAuditLog
     *   }
     * })
     * 
     */
    create<T extends MasterAuditLogCreateArgs>(args: SelectSubset<T, MasterAuditLogCreateArgs<ExtArgs>>): Prisma__MasterAuditLogClient<$Result.GetResult<Prisma.$MasterAuditLogPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many MasterAuditLogs.
     * @param {MasterAuditLogCreateManyArgs} args - Arguments to create many MasterAuditLogs.
     * @example
     * // Create many MasterAuditLogs
     * const masterAuditLog = await prisma.masterAuditLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MasterAuditLogCreateManyArgs>(args?: SelectSubset<T, MasterAuditLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MasterAuditLogs and returns the data saved in the database.
     * @param {MasterAuditLogCreateManyAndReturnArgs} args - Arguments to create many MasterAuditLogs.
     * @example
     * // Create many MasterAuditLogs
     * const masterAuditLog = await prisma.masterAuditLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MasterAuditLogs and only return the `id`
     * const masterAuditLogWithIdOnly = await prisma.masterAuditLog.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MasterAuditLogCreateManyAndReturnArgs>(args?: SelectSubset<T, MasterAuditLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MasterAuditLogPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a MasterAuditLog.
     * @param {MasterAuditLogDeleteArgs} args - Arguments to delete one MasterAuditLog.
     * @example
     * // Delete one MasterAuditLog
     * const MasterAuditLog = await prisma.masterAuditLog.delete({
     *   where: {
     *     // ... filter to delete one MasterAuditLog
     *   }
     * })
     * 
     */
    delete<T extends MasterAuditLogDeleteArgs>(args: SelectSubset<T, MasterAuditLogDeleteArgs<ExtArgs>>): Prisma__MasterAuditLogClient<$Result.GetResult<Prisma.$MasterAuditLogPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one MasterAuditLog.
     * @param {MasterAuditLogUpdateArgs} args - Arguments to update one MasterAuditLog.
     * @example
     * // Update one MasterAuditLog
     * const masterAuditLog = await prisma.masterAuditLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MasterAuditLogUpdateArgs>(args: SelectSubset<T, MasterAuditLogUpdateArgs<ExtArgs>>): Prisma__MasterAuditLogClient<$Result.GetResult<Prisma.$MasterAuditLogPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more MasterAuditLogs.
     * @param {MasterAuditLogDeleteManyArgs} args - Arguments to filter MasterAuditLogs to delete.
     * @example
     * // Delete a few MasterAuditLogs
     * const { count } = await prisma.masterAuditLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MasterAuditLogDeleteManyArgs>(args?: SelectSubset<T, MasterAuditLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MasterAuditLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MasterAuditLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MasterAuditLogs
     * const masterAuditLog = await prisma.masterAuditLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MasterAuditLogUpdateManyArgs>(args: SelectSubset<T, MasterAuditLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one MasterAuditLog.
     * @param {MasterAuditLogUpsertArgs} args - Arguments to update or create a MasterAuditLog.
     * @example
     * // Update or create a MasterAuditLog
     * const masterAuditLog = await prisma.masterAuditLog.upsert({
     *   create: {
     *     // ... data to create a MasterAuditLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MasterAuditLog we want to update
     *   }
     * })
     */
    upsert<T extends MasterAuditLogUpsertArgs>(args: SelectSubset<T, MasterAuditLogUpsertArgs<ExtArgs>>): Prisma__MasterAuditLogClient<$Result.GetResult<Prisma.$MasterAuditLogPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of MasterAuditLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MasterAuditLogCountArgs} args - Arguments to filter MasterAuditLogs to count.
     * @example
     * // Count the number of MasterAuditLogs
     * const count = await prisma.masterAuditLog.count({
     *   where: {
     *     // ... the filter for the MasterAuditLogs we want to count
     *   }
     * })
    **/
    count<T extends MasterAuditLogCountArgs>(
      args?: Subset<T, MasterAuditLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MasterAuditLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MasterAuditLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MasterAuditLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MasterAuditLogAggregateArgs>(args: Subset<T, MasterAuditLogAggregateArgs>): Prisma.PrismaPromise<GetMasterAuditLogAggregateType<T>>

    /**
     * Group by MasterAuditLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MasterAuditLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MasterAuditLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MasterAuditLogGroupByArgs['orderBy'] }
        : { orderBy?: MasterAuditLogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MasterAuditLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMasterAuditLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MasterAuditLog model
   */
  readonly fields: MasterAuditLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MasterAuditLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MasterAuditLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the MasterAuditLog model
   */ 
  interface MasterAuditLogFieldRefs {
    readonly id: FieldRef<"MasterAuditLog", 'String'>
    readonly accion: FieldRef<"MasterAuditLog", 'String'>
    readonly entity_type: FieldRef<"MasterAuditLog", 'String'>
    readonly entity_id: FieldRef<"MasterAuditLog", 'String'>
    readonly ip_address: FieldRef<"MasterAuditLog", 'String'>
    readonly user_agent: FieldRef<"MasterAuditLog", 'String'>
    readonly payload: FieldRef<"MasterAuditLog", 'Json'>
    readonly status_code: FieldRef<"MasterAuditLog", 'Int'>
    readonly error_msg: FieldRef<"MasterAuditLog", 'String'>
    readonly created_at: FieldRef<"MasterAuditLog", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * MasterAuditLog findUnique
   */
  export type MasterAuditLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MasterAuditLog
     */
    select?: MasterAuditLogSelect<ExtArgs> | null
    /**
     * Filter, which MasterAuditLog to fetch.
     */
    where: MasterAuditLogWhereUniqueInput
  }

  /**
   * MasterAuditLog findUniqueOrThrow
   */
  export type MasterAuditLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MasterAuditLog
     */
    select?: MasterAuditLogSelect<ExtArgs> | null
    /**
     * Filter, which MasterAuditLog to fetch.
     */
    where: MasterAuditLogWhereUniqueInput
  }

  /**
   * MasterAuditLog findFirst
   */
  export type MasterAuditLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MasterAuditLog
     */
    select?: MasterAuditLogSelect<ExtArgs> | null
    /**
     * Filter, which MasterAuditLog to fetch.
     */
    where?: MasterAuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MasterAuditLogs to fetch.
     */
    orderBy?: MasterAuditLogOrderByWithRelationInput | MasterAuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MasterAuditLogs.
     */
    cursor?: MasterAuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MasterAuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MasterAuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MasterAuditLogs.
     */
    distinct?: MasterAuditLogScalarFieldEnum | MasterAuditLogScalarFieldEnum[]
  }

  /**
   * MasterAuditLog findFirstOrThrow
   */
  export type MasterAuditLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MasterAuditLog
     */
    select?: MasterAuditLogSelect<ExtArgs> | null
    /**
     * Filter, which MasterAuditLog to fetch.
     */
    where?: MasterAuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MasterAuditLogs to fetch.
     */
    orderBy?: MasterAuditLogOrderByWithRelationInput | MasterAuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MasterAuditLogs.
     */
    cursor?: MasterAuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MasterAuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MasterAuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MasterAuditLogs.
     */
    distinct?: MasterAuditLogScalarFieldEnum | MasterAuditLogScalarFieldEnum[]
  }

  /**
   * MasterAuditLog findMany
   */
  export type MasterAuditLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MasterAuditLog
     */
    select?: MasterAuditLogSelect<ExtArgs> | null
    /**
     * Filter, which MasterAuditLogs to fetch.
     */
    where?: MasterAuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MasterAuditLogs to fetch.
     */
    orderBy?: MasterAuditLogOrderByWithRelationInput | MasterAuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MasterAuditLogs.
     */
    cursor?: MasterAuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MasterAuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MasterAuditLogs.
     */
    skip?: number
    distinct?: MasterAuditLogScalarFieldEnum | MasterAuditLogScalarFieldEnum[]
  }

  /**
   * MasterAuditLog create
   */
  export type MasterAuditLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MasterAuditLog
     */
    select?: MasterAuditLogSelect<ExtArgs> | null
    /**
     * The data needed to create a MasterAuditLog.
     */
    data: XOR<MasterAuditLogCreateInput, MasterAuditLogUncheckedCreateInput>
  }

  /**
   * MasterAuditLog createMany
   */
  export type MasterAuditLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MasterAuditLogs.
     */
    data: MasterAuditLogCreateManyInput | MasterAuditLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MasterAuditLog createManyAndReturn
   */
  export type MasterAuditLogCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MasterAuditLog
     */
    select?: MasterAuditLogSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many MasterAuditLogs.
     */
    data: MasterAuditLogCreateManyInput | MasterAuditLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MasterAuditLog update
   */
  export type MasterAuditLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MasterAuditLog
     */
    select?: MasterAuditLogSelect<ExtArgs> | null
    /**
     * The data needed to update a MasterAuditLog.
     */
    data: XOR<MasterAuditLogUpdateInput, MasterAuditLogUncheckedUpdateInput>
    /**
     * Choose, which MasterAuditLog to update.
     */
    where: MasterAuditLogWhereUniqueInput
  }

  /**
   * MasterAuditLog updateMany
   */
  export type MasterAuditLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MasterAuditLogs.
     */
    data: XOR<MasterAuditLogUpdateManyMutationInput, MasterAuditLogUncheckedUpdateManyInput>
    /**
     * Filter which MasterAuditLogs to update
     */
    where?: MasterAuditLogWhereInput
  }

  /**
   * MasterAuditLog upsert
   */
  export type MasterAuditLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MasterAuditLog
     */
    select?: MasterAuditLogSelect<ExtArgs> | null
    /**
     * The filter to search for the MasterAuditLog to update in case it exists.
     */
    where: MasterAuditLogWhereUniqueInput
    /**
     * In case the MasterAuditLog found by the `where` argument doesn't exist, create a new MasterAuditLog with this data.
     */
    create: XOR<MasterAuditLogCreateInput, MasterAuditLogUncheckedCreateInput>
    /**
     * In case the MasterAuditLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MasterAuditLogUpdateInput, MasterAuditLogUncheckedUpdateInput>
  }

  /**
   * MasterAuditLog delete
   */
  export type MasterAuditLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MasterAuditLog
     */
    select?: MasterAuditLogSelect<ExtArgs> | null
    /**
     * Filter which MasterAuditLog to delete.
     */
    where: MasterAuditLogWhereUniqueInput
  }

  /**
   * MasterAuditLog deleteMany
   */
  export type MasterAuditLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MasterAuditLogs to delete
     */
    where?: MasterAuditLogWhereInput
  }

  /**
   * MasterAuditLog without action
   */
  export type MasterAuditLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MasterAuditLog
     */
    select?: MasterAuditLogSelect<ExtArgs> | null
  }


  /**
   * Model TenantAuditLog
   */

  export type AggregateTenantAuditLog = {
    _count: TenantAuditLogCountAggregateOutputType | null
    _min: TenantAuditLogMinAggregateOutputType | null
    _max: TenantAuditLogMaxAggregateOutputType | null
  }

  export type TenantAuditLogMinAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    proyecto_id: string | null
    actor_user_id: string | null
    event_type: string | null
    entity_id: string | null
    correlation_id: string | null
    created_at: Date | null
  }

  export type TenantAuditLogMaxAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    proyecto_id: string | null
    actor_user_id: string | null
    event_type: string | null
    entity_id: string | null
    correlation_id: string | null
    created_at: Date | null
  }

  export type TenantAuditLogCountAggregateOutputType = {
    id: number
    tenant_id: number
    proyecto_id: number
    actor_user_id: number
    event_type: number
    entity_id: number
    payload: number
    correlation_id: number
    created_at: number
    _all: number
  }


  export type TenantAuditLogMinAggregateInputType = {
    id?: true
    tenant_id?: true
    proyecto_id?: true
    actor_user_id?: true
    event_type?: true
    entity_id?: true
    correlation_id?: true
    created_at?: true
  }

  export type TenantAuditLogMaxAggregateInputType = {
    id?: true
    tenant_id?: true
    proyecto_id?: true
    actor_user_id?: true
    event_type?: true
    entity_id?: true
    correlation_id?: true
    created_at?: true
  }

  export type TenantAuditLogCountAggregateInputType = {
    id?: true
    tenant_id?: true
    proyecto_id?: true
    actor_user_id?: true
    event_type?: true
    entity_id?: true
    payload?: true
    correlation_id?: true
    created_at?: true
    _all?: true
  }

  export type TenantAuditLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TenantAuditLog to aggregate.
     */
    where?: TenantAuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantAuditLogs to fetch.
     */
    orderBy?: TenantAuditLogOrderByWithRelationInput | TenantAuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TenantAuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantAuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantAuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TenantAuditLogs
    **/
    _count?: true | TenantAuditLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TenantAuditLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TenantAuditLogMaxAggregateInputType
  }

  export type GetTenantAuditLogAggregateType<T extends TenantAuditLogAggregateArgs> = {
        [P in keyof T & keyof AggregateTenantAuditLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTenantAuditLog[P]>
      : GetScalarType<T[P], AggregateTenantAuditLog[P]>
  }




  export type TenantAuditLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantAuditLogWhereInput
    orderBy?: TenantAuditLogOrderByWithAggregationInput | TenantAuditLogOrderByWithAggregationInput[]
    by: TenantAuditLogScalarFieldEnum[] | TenantAuditLogScalarFieldEnum
    having?: TenantAuditLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TenantAuditLogCountAggregateInputType | true
    _min?: TenantAuditLogMinAggregateInputType
    _max?: TenantAuditLogMaxAggregateInputType
  }

  export type TenantAuditLogGroupByOutputType = {
    id: string
    tenant_id: string
    proyecto_id: string
    actor_user_id: string
    event_type: string
    entity_id: string | null
    payload: JsonValue | null
    correlation_id: string | null
    created_at: Date
    _count: TenantAuditLogCountAggregateOutputType | null
    _min: TenantAuditLogMinAggregateOutputType | null
    _max: TenantAuditLogMaxAggregateOutputType | null
  }

  type GetTenantAuditLogGroupByPayload<T extends TenantAuditLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TenantAuditLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TenantAuditLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TenantAuditLogGroupByOutputType[P]>
            : GetScalarType<T[P], TenantAuditLogGroupByOutputType[P]>
        }
      >
    >


  export type TenantAuditLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    actor_user_id?: boolean
    event_type?: boolean
    entity_id?: boolean
    payload?: boolean
    correlation_id?: boolean
    created_at?: boolean
  }, ExtArgs["result"]["tenantAuditLog"]>

  export type TenantAuditLogSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    actor_user_id?: boolean
    event_type?: boolean
    entity_id?: boolean
    payload?: boolean
    correlation_id?: boolean
    created_at?: boolean
  }, ExtArgs["result"]["tenantAuditLog"]>

  export type TenantAuditLogSelectScalar = {
    id?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    actor_user_id?: boolean
    event_type?: boolean
    entity_id?: boolean
    payload?: boolean
    correlation_id?: boolean
    created_at?: boolean
  }


  export type $TenantAuditLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TenantAuditLog"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenant_id: string
      proyecto_id: string
      actor_user_id: string
      event_type: string
      entity_id: string | null
      payload: Prisma.JsonValue | null
      correlation_id: string | null
      created_at: Date
    }, ExtArgs["result"]["tenantAuditLog"]>
    composites: {}
  }

  type TenantAuditLogGetPayload<S extends boolean | null | undefined | TenantAuditLogDefaultArgs> = $Result.GetResult<Prisma.$TenantAuditLogPayload, S>

  type TenantAuditLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<TenantAuditLogFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TenantAuditLogCountAggregateInputType | true
    }

  export interface TenantAuditLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TenantAuditLog'], meta: { name: 'TenantAuditLog' } }
    /**
     * Find zero or one TenantAuditLog that matches the filter.
     * @param {TenantAuditLogFindUniqueArgs} args - Arguments to find a TenantAuditLog
     * @example
     * // Get one TenantAuditLog
     * const tenantAuditLog = await prisma.tenantAuditLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TenantAuditLogFindUniqueArgs>(args: SelectSubset<T, TenantAuditLogFindUniqueArgs<ExtArgs>>): Prisma__TenantAuditLogClient<$Result.GetResult<Prisma.$TenantAuditLogPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one TenantAuditLog that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {TenantAuditLogFindUniqueOrThrowArgs} args - Arguments to find a TenantAuditLog
     * @example
     * // Get one TenantAuditLog
     * const tenantAuditLog = await prisma.tenantAuditLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TenantAuditLogFindUniqueOrThrowArgs>(args: SelectSubset<T, TenantAuditLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TenantAuditLogClient<$Result.GetResult<Prisma.$TenantAuditLogPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first TenantAuditLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantAuditLogFindFirstArgs} args - Arguments to find a TenantAuditLog
     * @example
     * // Get one TenantAuditLog
     * const tenantAuditLog = await prisma.tenantAuditLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TenantAuditLogFindFirstArgs>(args?: SelectSubset<T, TenantAuditLogFindFirstArgs<ExtArgs>>): Prisma__TenantAuditLogClient<$Result.GetResult<Prisma.$TenantAuditLogPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first TenantAuditLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantAuditLogFindFirstOrThrowArgs} args - Arguments to find a TenantAuditLog
     * @example
     * // Get one TenantAuditLog
     * const tenantAuditLog = await prisma.tenantAuditLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TenantAuditLogFindFirstOrThrowArgs>(args?: SelectSubset<T, TenantAuditLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__TenantAuditLogClient<$Result.GetResult<Prisma.$TenantAuditLogPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more TenantAuditLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantAuditLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TenantAuditLogs
     * const tenantAuditLogs = await prisma.tenantAuditLog.findMany()
     * 
     * // Get first 10 TenantAuditLogs
     * const tenantAuditLogs = await prisma.tenantAuditLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tenantAuditLogWithIdOnly = await prisma.tenantAuditLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TenantAuditLogFindManyArgs>(args?: SelectSubset<T, TenantAuditLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantAuditLogPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a TenantAuditLog.
     * @param {TenantAuditLogCreateArgs} args - Arguments to create a TenantAuditLog.
     * @example
     * // Create one TenantAuditLog
     * const TenantAuditLog = await prisma.tenantAuditLog.create({
     *   data: {
     *     // ... data to create a TenantAuditLog
     *   }
     * })
     * 
     */
    create<T extends TenantAuditLogCreateArgs>(args: SelectSubset<T, TenantAuditLogCreateArgs<ExtArgs>>): Prisma__TenantAuditLogClient<$Result.GetResult<Prisma.$TenantAuditLogPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many TenantAuditLogs.
     * @param {TenantAuditLogCreateManyArgs} args - Arguments to create many TenantAuditLogs.
     * @example
     * // Create many TenantAuditLogs
     * const tenantAuditLog = await prisma.tenantAuditLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TenantAuditLogCreateManyArgs>(args?: SelectSubset<T, TenantAuditLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TenantAuditLogs and returns the data saved in the database.
     * @param {TenantAuditLogCreateManyAndReturnArgs} args - Arguments to create many TenantAuditLogs.
     * @example
     * // Create many TenantAuditLogs
     * const tenantAuditLog = await prisma.tenantAuditLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TenantAuditLogs and only return the `id`
     * const tenantAuditLogWithIdOnly = await prisma.tenantAuditLog.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TenantAuditLogCreateManyAndReturnArgs>(args?: SelectSubset<T, TenantAuditLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantAuditLogPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a TenantAuditLog.
     * @param {TenantAuditLogDeleteArgs} args - Arguments to delete one TenantAuditLog.
     * @example
     * // Delete one TenantAuditLog
     * const TenantAuditLog = await prisma.tenantAuditLog.delete({
     *   where: {
     *     // ... filter to delete one TenantAuditLog
     *   }
     * })
     * 
     */
    delete<T extends TenantAuditLogDeleteArgs>(args: SelectSubset<T, TenantAuditLogDeleteArgs<ExtArgs>>): Prisma__TenantAuditLogClient<$Result.GetResult<Prisma.$TenantAuditLogPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one TenantAuditLog.
     * @param {TenantAuditLogUpdateArgs} args - Arguments to update one TenantAuditLog.
     * @example
     * // Update one TenantAuditLog
     * const tenantAuditLog = await prisma.tenantAuditLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TenantAuditLogUpdateArgs>(args: SelectSubset<T, TenantAuditLogUpdateArgs<ExtArgs>>): Prisma__TenantAuditLogClient<$Result.GetResult<Prisma.$TenantAuditLogPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more TenantAuditLogs.
     * @param {TenantAuditLogDeleteManyArgs} args - Arguments to filter TenantAuditLogs to delete.
     * @example
     * // Delete a few TenantAuditLogs
     * const { count } = await prisma.tenantAuditLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TenantAuditLogDeleteManyArgs>(args?: SelectSubset<T, TenantAuditLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TenantAuditLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantAuditLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TenantAuditLogs
     * const tenantAuditLog = await prisma.tenantAuditLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TenantAuditLogUpdateManyArgs>(args: SelectSubset<T, TenantAuditLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one TenantAuditLog.
     * @param {TenantAuditLogUpsertArgs} args - Arguments to update or create a TenantAuditLog.
     * @example
     * // Update or create a TenantAuditLog
     * const tenantAuditLog = await prisma.tenantAuditLog.upsert({
     *   create: {
     *     // ... data to create a TenantAuditLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TenantAuditLog we want to update
     *   }
     * })
     */
    upsert<T extends TenantAuditLogUpsertArgs>(args: SelectSubset<T, TenantAuditLogUpsertArgs<ExtArgs>>): Prisma__TenantAuditLogClient<$Result.GetResult<Prisma.$TenantAuditLogPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of TenantAuditLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantAuditLogCountArgs} args - Arguments to filter TenantAuditLogs to count.
     * @example
     * // Count the number of TenantAuditLogs
     * const count = await prisma.tenantAuditLog.count({
     *   where: {
     *     // ... the filter for the TenantAuditLogs we want to count
     *   }
     * })
    **/
    count<T extends TenantAuditLogCountArgs>(
      args?: Subset<T, TenantAuditLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TenantAuditLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TenantAuditLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantAuditLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TenantAuditLogAggregateArgs>(args: Subset<T, TenantAuditLogAggregateArgs>): Prisma.PrismaPromise<GetTenantAuditLogAggregateType<T>>

    /**
     * Group by TenantAuditLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantAuditLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TenantAuditLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TenantAuditLogGroupByArgs['orderBy'] }
        : { orderBy?: TenantAuditLogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TenantAuditLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTenantAuditLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TenantAuditLog model
   */
  readonly fields: TenantAuditLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TenantAuditLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TenantAuditLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TenantAuditLog model
   */ 
  interface TenantAuditLogFieldRefs {
    readonly id: FieldRef<"TenantAuditLog", 'String'>
    readonly tenant_id: FieldRef<"TenantAuditLog", 'String'>
    readonly proyecto_id: FieldRef<"TenantAuditLog", 'String'>
    readonly actor_user_id: FieldRef<"TenantAuditLog", 'String'>
    readonly event_type: FieldRef<"TenantAuditLog", 'String'>
    readonly entity_id: FieldRef<"TenantAuditLog", 'String'>
    readonly payload: FieldRef<"TenantAuditLog", 'Json'>
    readonly correlation_id: FieldRef<"TenantAuditLog", 'String'>
    readonly created_at: FieldRef<"TenantAuditLog", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * TenantAuditLog findUnique
   */
  export type TenantAuditLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantAuditLog
     */
    select?: TenantAuditLogSelect<ExtArgs> | null
    /**
     * Filter, which TenantAuditLog to fetch.
     */
    where: TenantAuditLogWhereUniqueInput
  }

  /**
   * TenantAuditLog findUniqueOrThrow
   */
  export type TenantAuditLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantAuditLog
     */
    select?: TenantAuditLogSelect<ExtArgs> | null
    /**
     * Filter, which TenantAuditLog to fetch.
     */
    where: TenantAuditLogWhereUniqueInput
  }

  /**
   * TenantAuditLog findFirst
   */
  export type TenantAuditLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantAuditLog
     */
    select?: TenantAuditLogSelect<ExtArgs> | null
    /**
     * Filter, which TenantAuditLog to fetch.
     */
    where?: TenantAuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantAuditLogs to fetch.
     */
    orderBy?: TenantAuditLogOrderByWithRelationInput | TenantAuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TenantAuditLogs.
     */
    cursor?: TenantAuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantAuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantAuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TenantAuditLogs.
     */
    distinct?: TenantAuditLogScalarFieldEnum | TenantAuditLogScalarFieldEnum[]
  }

  /**
   * TenantAuditLog findFirstOrThrow
   */
  export type TenantAuditLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantAuditLog
     */
    select?: TenantAuditLogSelect<ExtArgs> | null
    /**
     * Filter, which TenantAuditLog to fetch.
     */
    where?: TenantAuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantAuditLogs to fetch.
     */
    orderBy?: TenantAuditLogOrderByWithRelationInput | TenantAuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TenantAuditLogs.
     */
    cursor?: TenantAuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantAuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantAuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TenantAuditLogs.
     */
    distinct?: TenantAuditLogScalarFieldEnum | TenantAuditLogScalarFieldEnum[]
  }

  /**
   * TenantAuditLog findMany
   */
  export type TenantAuditLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantAuditLog
     */
    select?: TenantAuditLogSelect<ExtArgs> | null
    /**
     * Filter, which TenantAuditLogs to fetch.
     */
    where?: TenantAuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantAuditLogs to fetch.
     */
    orderBy?: TenantAuditLogOrderByWithRelationInput | TenantAuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TenantAuditLogs.
     */
    cursor?: TenantAuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantAuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantAuditLogs.
     */
    skip?: number
    distinct?: TenantAuditLogScalarFieldEnum | TenantAuditLogScalarFieldEnum[]
  }

  /**
   * TenantAuditLog create
   */
  export type TenantAuditLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantAuditLog
     */
    select?: TenantAuditLogSelect<ExtArgs> | null
    /**
     * The data needed to create a TenantAuditLog.
     */
    data: XOR<TenantAuditLogCreateInput, TenantAuditLogUncheckedCreateInput>
  }

  /**
   * TenantAuditLog createMany
   */
  export type TenantAuditLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TenantAuditLogs.
     */
    data: TenantAuditLogCreateManyInput | TenantAuditLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TenantAuditLog createManyAndReturn
   */
  export type TenantAuditLogCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantAuditLog
     */
    select?: TenantAuditLogSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many TenantAuditLogs.
     */
    data: TenantAuditLogCreateManyInput | TenantAuditLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TenantAuditLog update
   */
  export type TenantAuditLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantAuditLog
     */
    select?: TenantAuditLogSelect<ExtArgs> | null
    /**
     * The data needed to update a TenantAuditLog.
     */
    data: XOR<TenantAuditLogUpdateInput, TenantAuditLogUncheckedUpdateInput>
    /**
     * Choose, which TenantAuditLog to update.
     */
    where: TenantAuditLogWhereUniqueInput
  }

  /**
   * TenantAuditLog updateMany
   */
  export type TenantAuditLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TenantAuditLogs.
     */
    data: XOR<TenantAuditLogUpdateManyMutationInput, TenantAuditLogUncheckedUpdateManyInput>
    /**
     * Filter which TenantAuditLogs to update
     */
    where?: TenantAuditLogWhereInput
  }

  /**
   * TenantAuditLog upsert
   */
  export type TenantAuditLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantAuditLog
     */
    select?: TenantAuditLogSelect<ExtArgs> | null
    /**
     * The filter to search for the TenantAuditLog to update in case it exists.
     */
    where: TenantAuditLogWhereUniqueInput
    /**
     * In case the TenantAuditLog found by the `where` argument doesn't exist, create a new TenantAuditLog with this data.
     */
    create: XOR<TenantAuditLogCreateInput, TenantAuditLogUncheckedCreateInput>
    /**
     * In case the TenantAuditLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TenantAuditLogUpdateInput, TenantAuditLogUncheckedUpdateInput>
  }

  /**
   * TenantAuditLog delete
   */
  export type TenantAuditLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantAuditLog
     */
    select?: TenantAuditLogSelect<ExtArgs> | null
    /**
     * Filter which TenantAuditLog to delete.
     */
    where: TenantAuditLogWhereUniqueInput
  }

  /**
   * TenantAuditLog deleteMany
   */
  export type TenantAuditLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TenantAuditLogs to delete
     */
    where?: TenantAuditLogWhereInput
  }

  /**
   * TenantAuditLog without action
   */
  export type TenantAuditLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantAuditLog
     */
    select?: TenantAuditLogSelect<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const TenantScalarFieldEnum: {
    id_tenant: 'id_tenant',
    nombre: 'nombre',
    rfc: 'rfc',
    logo_url: 'logo_url',
    primary_color: 'primary_color',
    plan: 'plan',
    activo: 'activo',
    created_at: 'created_at'
  };

  export type TenantScalarFieldEnum = (typeof TenantScalarFieldEnum)[keyof typeof TenantScalarFieldEnum]


  export const ProyectoScalarFieldEnum: {
    id_proyecto: 'id_proyecto',
    tenant_id: 'tenant_id',
    codigo_centro_costos: 'codigo_centro_costos',
    nombre_oficial: 'nombre_oficial',
    tipo_contrato: 'tipo_contrato',
    moneda_base: 'moneda_base',
    estatus: 'estatus',
    activo: 'activo',
    created_at: 'created_at',
    empresa_grupo: 'empresa_grupo',
    anio_centro_costos: 'anio_centro_costos',
    cliente_id: 'cliente_id',
    consecutivo_centro_costos: 'consecutivo_centro_costos',
    es_especial: 'es_especial',
    tipo_especial: 'tipo_especial',
    fecha_inicio_real: 'fecha_inicio_real',
    fecha_firma_contrato: 'fecha_firma_contrato',
    fecha_programada_inicio: 'fecha_programada_inicio',
    fecha_programada_fin: 'fecha_programada_fin',
    monto_total_vendido: 'monto_total_vendido',
    periodo_ejecucion: 'periodo_ejecucion',
    periodo_ejecucion_unidad: 'periodo_ejecucion_unidad',
    total_dias_naturales: 'total_dias_naturales',
    total_dias_laborables: 'total_dias_laborables'
  };

  export type ProyectoScalarFieldEnum = (typeof ProyectoScalarFieldEnum)[keyof typeof ProyectoScalarFieldEnum]


  export const UserScalarFieldEnum: {
    id_usuario: 'id_usuario',
    tenant_id: 'tenant_id',
    email: 'email',
    password_hash: 'password_hash',
    nombre: 'nombre',
    rol_global: 'rol_global',
    limite_aprobacion_financiera: 'limite_aprobacion_financiera',
    activo: 'activo',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const UserProjectAccessScalarFieldEnum: {
    id: 'id',
    user_id: 'user_id',
    proyecto_id: 'proyecto_id',
    rol_proyecto: 'rol_proyecto',
    created_at: 'created_at'
  };

  export type UserProjectAccessScalarFieldEnum = (typeof UserProjectAccessScalarFieldEnum)[keyof typeof UserProjectAccessScalarFieldEnum]


  export const RefreshTokenScalarFieldEnum: {
    id: 'id',
    user_id: 'user_id',
    token_hash: 'token_hash',
    expires_at: 'expires_at',
    revoked: 'revoked',
    created_at: 'created_at',
    user_agent: 'user_agent',
    ip_address: 'ip_address',
    sesion_iniciada_en: 'sesion_iniciada_en'
  };

  export type RefreshTokenScalarFieldEnum = (typeof RefreshTokenScalarFieldEnum)[keyof typeof RefreshTokenScalarFieldEnum]


  export const MasterAuditLogScalarFieldEnum: {
    id: 'id',
    accion: 'accion',
    entity_type: 'entity_type',
    entity_id: 'entity_id',
    ip_address: 'ip_address',
    user_agent: 'user_agent',
    payload: 'payload',
    status_code: 'status_code',
    error_msg: 'error_msg',
    created_at: 'created_at'
  };

  export type MasterAuditLogScalarFieldEnum = (typeof MasterAuditLogScalarFieldEnum)[keyof typeof MasterAuditLogScalarFieldEnum]


  export const TenantAuditLogScalarFieldEnum: {
    id: 'id',
    tenant_id: 'tenant_id',
    proyecto_id: 'proyecto_id',
    actor_user_id: 'actor_user_id',
    event_type: 'event_type',
    entity_id: 'entity_id',
    payload: 'payload',
    correlation_id: 'correlation_id',
    created_at: 'created_at'
  };

  export type TenantAuditLogScalarFieldEnum = (typeof TenantAuditLogScalarFieldEnum)[keyof typeof TenantAuditLogScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'Decimal[]'
   */
  export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type TenantWhereInput = {
    AND?: TenantWhereInput | TenantWhereInput[]
    OR?: TenantWhereInput[]
    NOT?: TenantWhereInput | TenantWhereInput[]
    id_tenant?: UuidFilter<"Tenant"> | string
    nombre?: StringFilter<"Tenant"> | string
    rfc?: StringNullableFilter<"Tenant"> | string | null
    logo_url?: StringNullableFilter<"Tenant"> | string | null
    primary_color?: StringNullableFilter<"Tenant"> | string | null
    plan?: StringFilter<"Tenant"> | string
    activo?: BoolFilter<"Tenant"> | boolean
    created_at?: DateTimeFilter<"Tenant"> | Date | string
    usuarios?: UserListRelationFilter
    proyectos?: ProyectoListRelationFilter
  }

  export type TenantOrderByWithRelationInput = {
    id_tenant?: SortOrder
    nombre?: SortOrder
    rfc?: SortOrderInput | SortOrder
    logo_url?: SortOrderInput | SortOrder
    primary_color?: SortOrderInput | SortOrder
    plan?: SortOrder
    activo?: SortOrder
    created_at?: SortOrder
    usuarios?: UserOrderByRelationAggregateInput
    proyectos?: ProyectoOrderByRelationAggregateInput
  }

  export type TenantWhereUniqueInput = Prisma.AtLeast<{
    id_tenant?: string
    AND?: TenantWhereInput | TenantWhereInput[]
    OR?: TenantWhereInput[]
    NOT?: TenantWhereInput | TenantWhereInput[]
    nombre?: StringFilter<"Tenant"> | string
    rfc?: StringNullableFilter<"Tenant"> | string | null
    logo_url?: StringNullableFilter<"Tenant"> | string | null
    primary_color?: StringNullableFilter<"Tenant"> | string | null
    plan?: StringFilter<"Tenant"> | string
    activo?: BoolFilter<"Tenant"> | boolean
    created_at?: DateTimeFilter<"Tenant"> | Date | string
    usuarios?: UserListRelationFilter
    proyectos?: ProyectoListRelationFilter
  }, "id_tenant">

  export type TenantOrderByWithAggregationInput = {
    id_tenant?: SortOrder
    nombre?: SortOrder
    rfc?: SortOrderInput | SortOrder
    logo_url?: SortOrderInput | SortOrder
    primary_color?: SortOrderInput | SortOrder
    plan?: SortOrder
    activo?: SortOrder
    created_at?: SortOrder
    _count?: TenantCountOrderByAggregateInput
    _max?: TenantMaxOrderByAggregateInput
    _min?: TenantMinOrderByAggregateInput
  }

  export type TenantScalarWhereWithAggregatesInput = {
    AND?: TenantScalarWhereWithAggregatesInput | TenantScalarWhereWithAggregatesInput[]
    OR?: TenantScalarWhereWithAggregatesInput[]
    NOT?: TenantScalarWhereWithAggregatesInput | TenantScalarWhereWithAggregatesInput[]
    id_tenant?: UuidWithAggregatesFilter<"Tenant"> | string
    nombre?: StringWithAggregatesFilter<"Tenant"> | string
    rfc?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    logo_url?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    primary_color?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    plan?: StringWithAggregatesFilter<"Tenant"> | string
    activo?: BoolWithAggregatesFilter<"Tenant"> | boolean
    created_at?: DateTimeWithAggregatesFilter<"Tenant"> | Date | string
  }

  export type ProyectoWhereInput = {
    AND?: ProyectoWhereInput | ProyectoWhereInput[]
    OR?: ProyectoWhereInput[]
    NOT?: ProyectoWhereInput | ProyectoWhereInput[]
    id_proyecto?: UuidFilter<"Proyecto"> | string
    tenant_id?: UuidFilter<"Proyecto"> | string
    codigo_centro_costos?: StringFilter<"Proyecto"> | string
    nombre_oficial?: StringFilter<"Proyecto"> | string
    tipo_contrato?: StringFilter<"Proyecto"> | string
    moneda_base?: StringFilter<"Proyecto"> | string
    estatus?: StringFilter<"Proyecto"> | string
    activo?: BoolFilter<"Proyecto"> | boolean
    created_at?: DateTimeFilter<"Proyecto"> | Date | string
    empresa_grupo?: StringNullableFilter<"Proyecto"> | string | null
    anio_centro_costos?: IntNullableFilter<"Proyecto"> | number | null
    cliente_id?: UuidNullableFilter<"Proyecto"> | string | null
    consecutivo_centro_costos?: IntNullableFilter<"Proyecto"> | number | null
    es_especial?: BoolFilter<"Proyecto"> | boolean
    tipo_especial?: StringNullableFilter<"Proyecto"> | string | null
    fecha_inicio_real?: DateTimeNullableFilter<"Proyecto"> | Date | string | null
    fecha_firma_contrato?: DateTimeNullableFilter<"Proyecto"> | Date | string | null
    fecha_programada_inicio?: DateTimeNullableFilter<"Proyecto"> | Date | string | null
    fecha_programada_fin?: DateTimeNullableFilter<"Proyecto"> | Date | string | null
    monto_total_vendido?: DecimalNullableFilter<"Proyecto"> | Decimal | DecimalJsLike | number | string | null
    periodo_ejecucion?: IntNullableFilter<"Proyecto"> | number | null
    periodo_ejecucion_unidad?: StringNullableFilter<"Proyecto"> | string | null
    total_dias_naturales?: IntNullableFilter<"Proyecto"> | number | null
    total_dias_laborables?: IntNullableFilter<"Proyecto"> | number | null
    tenant?: XOR<TenantRelationFilter, TenantWhereInput>
    asignaciones?: UserProjectAccessListRelationFilter
  }

  export type ProyectoOrderByWithRelationInput = {
    id_proyecto?: SortOrder
    tenant_id?: SortOrder
    codigo_centro_costos?: SortOrder
    nombre_oficial?: SortOrder
    tipo_contrato?: SortOrder
    moneda_base?: SortOrder
    estatus?: SortOrder
    activo?: SortOrder
    created_at?: SortOrder
    empresa_grupo?: SortOrderInput | SortOrder
    anio_centro_costos?: SortOrderInput | SortOrder
    cliente_id?: SortOrderInput | SortOrder
    consecutivo_centro_costos?: SortOrderInput | SortOrder
    es_especial?: SortOrder
    tipo_especial?: SortOrderInput | SortOrder
    fecha_inicio_real?: SortOrderInput | SortOrder
    fecha_firma_contrato?: SortOrderInput | SortOrder
    fecha_programada_inicio?: SortOrderInput | SortOrder
    fecha_programada_fin?: SortOrderInput | SortOrder
    monto_total_vendido?: SortOrderInput | SortOrder
    periodo_ejecucion?: SortOrderInput | SortOrder
    periodo_ejecucion_unidad?: SortOrderInput | SortOrder
    total_dias_naturales?: SortOrderInput | SortOrder
    total_dias_laborables?: SortOrderInput | SortOrder
    tenant?: TenantOrderByWithRelationInput
    asignaciones?: UserProjectAccessOrderByRelationAggregateInput
  }

  export type ProyectoWhereUniqueInput = Prisma.AtLeast<{
    id_proyecto?: string
    tenant_id_codigo_centro_costos?: ProyectoTenant_idCodigo_centro_costosCompoundUniqueInput
    AND?: ProyectoWhereInput | ProyectoWhereInput[]
    OR?: ProyectoWhereInput[]
    NOT?: ProyectoWhereInput | ProyectoWhereInput[]
    tenant_id?: UuidFilter<"Proyecto"> | string
    codigo_centro_costos?: StringFilter<"Proyecto"> | string
    nombre_oficial?: StringFilter<"Proyecto"> | string
    tipo_contrato?: StringFilter<"Proyecto"> | string
    moneda_base?: StringFilter<"Proyecto"> | string
    estatus?: StringFilter<"Proyecto"> | string
    activo?: BoolFilter<"Proyecto"> | boolean
    created_at?: DateTimeFilter<"Proyecto"> | Date | string
    empresa_grupo?: StringNullableFilter<"Proyecto"> | string | null
    anio_centro_costos?: IntNullableFilter<"Proyecto"> | number | null
    cliente_id?: UuidNullableFilter<"Proyecto"> | string | null
    consecutivo_centro_costos?: IntNullableFilter<"Proyecto"> | number | null
    es_especial?: BoolFilter<"Proyecto"> | boolean
    tipo_especial?: StringNullableFilter<"Proyecto"> | string | null
    fecha_inicio_real?: DateTimeNullableFilter<"Proyecto"> | Date | string | null
    fecha_firma_contrato?: DateTimeNullableFilter<"Proyecto"> | Date | string | null
    fecha_programada_inicio?: DateTimeNullableFilter<"Proyecto"> | Date | string | null
    fecha_programada_fin?: DateTimeNullableFilter<"Proyecto"> | Date | string | null
    monto_total_vendido?: DecimalNullableFilter<"Proyecto"> | Decimal | DecimalJsLike | number | string | null
    periodo_ejecucion?: IntNullableFilter<"Proyecto"> | number | null
    periodo_ejecucion_unidad?: StringNullableFilter<"Proyecto"> | string | null
    total_dias_naturales?: IntNullableFilter<"Proyecto"> | number | null
    total_dias_laborables?: IntNullableFilter<"Proyecto"> | number | null
    tenant?: XOR<TenantRelationFilter, TenantWhereInput>
    asignaciones?: UserProjectAccessListRelationFilter
  }, "id_proyecto" | "tenant_id_codigo_centro_costos">

  export type ProyectoOrderByWithAggregationInput = {
    id_proyecto?: SortOrder
    tenant_id?: SortOrder
    codigo_centro_costos?: SortOrder
    nombre_oficial?: SortOrder
    tipo_contrato?: SortOrder
    moneda_base?: SortOrder
    estatus?: SortOrder
    activo?: SortOrder
    created_at?: SortOrder
    empresa_grupo?: SortOrderInput | SortOrder
    anio_centro_costos?: SortOrderInput | SortOrder
    cliente_id?: SortOrderInput | SortOrder
    consecutivo_centro_costos?: SortOrderInput | SortOrder
    es_especial?: SortOrder
    tipo_especial?: SortOrderInput | SortOrder
    fecha_inicio_real?: SortOrderInput | SortOrder
    fecha_firma_contrato?: SortOrderInput | SortOrder
    fecha_programada_inicio?: SortOrderInput | SortOrder
    fecha_programada_fin?: SortOrderInput | SortOrder
    monto_total_vendido?: SortOrderInput | SortOrder
    periodo_ejecucion?: SortOrderInput | SortOrder
    periodo_ejecucion_unidad?: SortOrderInput | SortOrder
    total_dias_naturales?: SortOrderInput | SortOrder
    total_dias_laborables?: SortOrderInput | SortOrder
    _count?: ProyectoCountOrderByAggregateInput
    _avg?: ProyectoAvgOrderByAggregateInput
    _max?: ProyectoMaxOrderByAggregateInput
    _min?: ProyectoMinOrderByAggregateInput
    _sum?: ProyectoSumOrderByAggregateInput
  }

  export type ProyectoScalarWhereWithAggregatesInput = {
    AND?: ProyectoScalarWhereWithAggregatesInput | ProyectoScalarWhereWithAggregatesInput[]
    OR?: ProyectoScalarWhereWithAggregatesInput[]
    NOT?: ProyectoScalarWhereWithAggregatesInput | ProyectoScalarWhereWithAggregatesInput[]
    id_proyecto?: UuidWithAggregatesFilter<"Proyecto"> | string
    tenant_id?: UuidWithAggregatesFilter<"Proyecto"> | string
    codigo_centro_costos?: StringWithAggregatesFilter<"Proyecto"> | string
    nombre_oficial?: StringWithAggregatesFilter<"Proyecto"> | string
    tipo_contrato?: StringWithAggregatesFilter<"Proyecto"> | string
    moneda_base?: StringWithAggregatesFilter<"Proyecto"> | string
    estatus?: StringWithAggregatesFilter<"Proyecto"> | string
    activo?: BoolWithAggregatesFilter<"Proyecto"> | boolean
    created_at?: DateTimeWithAggregatesFilter<"Proyecto"> | Date | string
    empresa_grupo?: StringNullableWithAggregatesFilter<"Proyecto"> | string | null
    anio_centro_costos?: IntNullableWithAggregatesFilter<"Proyecto"> | number | null
    cliente_id?: UuidNullableWithAggregatesFilter<"Proyecto"> | string | null
    consecutivo_centro_costos?: IntNullableWithAggregatesFilter<"Proyecto"> | number | null
    es_especial?: BoolWithAggregatesFilter<"Proyecto"> | boolean
    tipo_especial?: StringNullableWithAggregatesFilter<"Proyecto"> | string | null
    fecha_inicio_real?: DateTimeNullableWithAggregatesFilter<"Proyecto"> | Date | string | null
    fecha_firma_contrato?: DateTimeNullableWithAggregatesFilter<"Proyecto"> | Date | string | null
    fecha_programada_inicio?: DateTimeNullableWithAggregatesFilter<"Proyecto"> | Date | string | null
    fecha_programada_fin?: DateTimeNullableWithAggregatesFilter<"Proyecto"> | Date | string | null
    monto_total_vendido?: DecimalNullableWithAggregatesFilter<"Proyecto"> | Decimal | DecimalJsLike | number | string | null
    periodo_ejecucion?: IntNullableWithAggregatesFilter<"Proyecto"> | number | null
    periodo_ejecucion_unidad?: StringNullableWithAggregatesFilter<"Proyecto"> | string | null
    total_dias_naturales?: IntNullableWithAggregatesFilter<"Proyecto"> | number | null
    total_dias_laborables?: IntNullableWithAggregatesFilter<"Proyecto"> | number | null
  }

  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id_usuario?: UuidFilter<"User"> | string
    tenant_id?: UuidFilter<"User"> | string
    email?: StringFilter<"User"> | string
    password_hash?: StringFilter<"User"> | string
    nombre?: StringFilter<"User"> | string
    rol_global?: StringNullableListFilter<"User">
    limite_aprobacion_financiera?: DecimalFilter<"User"> | Decimal | DecimalJsLike | number | string
    activo?: BoolFilter<"User"> | boolean
    created_at?: DateTimeFilter<"User"> | Date | string
    updated_at?: DateTimeFilter<"User"> | Date | string
    tenant?: XOR<TenantRelationFilter, TenantWhereInput>
    tokens?: RefreshTokenListRelationFilter
    proyectos_acceso?: UserProjectAccessListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id_usuario?: SortOrder
    tenant_id?: SortOrder
    email?: SortOrder
    password_hash?: SortOrder
    nombre?: SortOrder
    rol_global?: SortOrder
    limite_aprobacion_financiera?: SortOrder
    activo?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    tenant?: TenantOrderByWithRelationInput
    tokens?: RefreshTokenOrderByRelationAggregateInput
    proyectos_acceso?: UserProjectAccessOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id_usuario?: string
    tenant_id_email?: UserTenant_idEmailCompoundUniqueInput
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    tenant_id?: UuidFilter<"User"> | string
    email?: StringFilter<"User"> | string
    password_hash?: StringFilter<"User"> | string
    nombre?: StringFilter<"User"> | string
    rol_global?: StringNullableListFilter<"User">
    limite_aprobacion_financiera?: DecimalFilter<"User"> | Decimal | DecimalJsLike | number | string
    activo?: BoolFilter<"User"> | boolean
    created_at?: DateTimeFilter<"User"> | Date | string
    updated_at?: DateTimeFilter<"User"> | Date | string
    tenant?: XOR<TenantRelationFilter, TenantWhereInput>
    tokens?: RefreshTokenListRelationFilter
    proyectos_acceso?: UserProjectAccessListRelationFilter
  }, "id_usuario" | "tenant_id_email">

  export type UserOrderByWithAggregationInput = {
    id_usuario?: SortOrder
    tenant_id?: SortOrder
    email?: SortOrder
    password_hash?: SortOrder
    nombre?: SortOrder
    rol_global?: SortOrder
    limite_aprobacion_financiera?: SortOrder
    activo?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _avg?: UserAvgOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
    _sum?: UserSumOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id_usuario?: UuidWithAggregatesFilter<"User"> | string
    tenant_id?: UuidWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    password_hash?: StringWithAggregatesFilter<"User"> | string
    nombre?: StringWithAggregatesFilter<"User"> | string
    rol_global?: StringNullableListFilter<"User">
    limite_aprobacion_financiera?: DecimalWithAggregatesFilter<"User"> | Decimal | DecimalJsLike | number | string
    activo?: BoolWithAggregatesFilter<"User"> | boolean
    created_at?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type UserProjectAccessWhereInput = {
    AND?: UserProjectAccessWhereInput | UserProjectAccessWhereInput[]
    OR?: UserProjectAccessWhereInput[]
    NOT?: UserProjectAccessWhereInput | UserProjectAccessWhereInput[]
    id?: UuidFilter<"UserProjectAccess"> | string
    user_id?: UuidFilter<"UserProjectAccess"> | string
    proyecto_id?: UuidFilter<"UserProjectAccess"> | string
    rol_proyecto?: StringNullableFilter<"UserProjectAccess"> | string | null
    created_at?: DateTimeFilter<"UserProjectAccess"> | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput>
    proyecto?: XOR<ProyectoRelationFilter, ProyectoWhereInput>
  }

  export type UserProjectAccessOrderByWithRelationInput = {
    id?: SortOrder
    user_id?: SortOrder
    proyecto_id?: SortOrder
    rol_proyecto?: SortOrderInput | SortOrder
    created_at?: SortOrder
    user?: UserOrderByWithRelationInput
    proyecto?: ProyectoOrderByWithRelationInput
  }

  export type UserProjectAccessWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    user_id_proyecto_id?: UserProjectAccessUser_idProyecto_idCompoundUniqueInput
    AND?: UserProjectAccessWhereInput | UserProjectAccessWhereInput[]
    OR?: UserProjectAccessWhereInput[]
    NOT?: UserProjectAccessWhereInput | UserProjectAccessWhereInput[]
    user_id?: UuidFilter<"UserProjectAccess"> | string
    proyecto_id?: UuidFilter<"UserProjectAccess"> | string
    rol_proyecto?: StringNullableFilter<"UserProjectAccess"> | string | null
    created_at?: DateTimeFilter<"UserProjectAccess"> | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput>
    proyecto?: XOR<ProyectoRelationFilter, ProyectoWhereInput>
  }, "id" | "user_id_proyecto_id">

  export type UserProjectAccessOrderByWithAggregationInput = {
    id?: SortOrder
    user_id?: SortOrder
    proyecto_id?: SortOrder
    rol_proyecto?: SortOrderInput | SortOrder
    created_at?: SortOrder
    _count?: UserProjectAccessCountOrderByAggregateInput
    _max?: UserProjectAccessMaxOrderByAggregateInput
    _min?: UserProjectAccessMinOrderByAggregateInput
  }

  export type UserProjectAccessScalarWhereWithAggregatesInput = {
    AND?: UserProjectAccessScalarWhereWithAggregatesInput | UserProjectAccessScalarWhereWithAggregatesInput[]
    OR?: UserProjectAccessScalarWhereWithAggregatesInput[]
    NOT?: UserProjectAccessScalarWhereWithAggregatesInput | UserProjectAccessScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"UserProjectAccess"> | string
    user_id?: UuidWithAggregatesFilter<"UserProjectAccess"> | string
    proyecto_id?: UuidWithAggregatesFilter<"UserProjectAccess"> | string
    rol_proyecto?: StringNullableWithAggregatesFilter<"UserProjectAccess"> | string | null
    created_at?: DateTimeWithAggregatesFilter<"UserProjectAccess"> | Date | string
  }

  export type RefreshTokenWhereInput = {
    AND?: RefreshTokenWhereInput | RefreshTokenWhereInput[]
    OR?: RefreshTokenWhereInput[]
    NOT?: RefreshTokenWhereInput | RefreshTokenWhereInput[]
    id?: UuidFilter<"RefreshToken"> | string
    user_id?: UuidFilter<"RefreshToken"> | string
    token_hash?: StringFilter<"RefreshToken"> | string
    expires_at?: DateTimeFilter<"RefreshToken"> | Date | string
    revoked?: BoolFilter<"RefreshToken"> | boolean
    created_at?: DateTimeFilter<"RefreshToken"> | Date | string
    user_agent?: StringNullableFilter<"RefreshToken"> | string | null
    ip_address?: StringNullableFilter<"RefreshToken"> | string | null
    sesion_iniciada_en?: DateTimeNullableFilter<"RefreshToken"> | Date | string | null
    user?: XOR<UserRelationFilter, UserWhereInput>
  }

  export type RefreshTokenOrderByWithRelationInput = {
    id?: SortOrder
    user_id?: SortOrder
    token_hash?: SortOrder
    expires_at?: SortOrder
    revoked?: SortOrder
    created_at?: SortOrder
    user_agent?: SortOrderInput | SortOrder
    ip_address?: SortOrderInput | SortOrder
    sesion_iniciada_en?: SortOrderInput | SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type RefreshTokenWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: RefreshTokenWhereInput | RefreshTokenWhereInput[]
    OR?: RefreshTokenWhereInput[]
    NOT?: RefreshTokenWhereInput | RefreshTokenWhereInput[]
    user_id?: UuidFilter<"RefreshToken"> | string
    token_hash?: StringFilter<"RefreshToken"> | string
    expires_at?: DateTimeFilter<"RefreshToken"> | Date | string
    revoked?: BoolFilter<"RefreshToken"> | boolean
    created_at?: DateTimeFilter<"RefreshToken"> | Date | string
    user_agent?: StringNullableFilter<"RefreshToken"> | string | null
    ip_address?: StringNullableFilter<"RefreshToken"> | string | null
    sesion_iniciada_en?: DateTimeNullableFilter<"RefreshToken"> | Date | string | null
    user?: XOR<UserRelationFilter, UserWhereInput>
  }, "id">

  export type RefreshTokenOrderByWithAggregationInput = {
    id?: SortOrder
    user_id?: SortOrder
    token_hash?: SortOrder
    expires_at?: SortOrder
    revoked?: SortOrder
    created_at?: SortOrder
    user_agent?: SortOrderInput | SortOrder
    ip_address?: SortOrderInput | SortOrder
    sesion_iniciada_en?: SortOrderInput | SortOrder
    _count?: RefreshTokenCountOrderByAggregateInput
    _max?: RefreshTokenMaxOrderByAggregateInput
    _min?: RefreshTokenMinOrderByAggregateInput
  }

  export type RefreshTokenScalarWhereWithAggregatesInput = {
    AND?: RefreshTokenScalarWhereWithAggregatesInput | RefreshTokenScalarWhereWithAggregatesInput[]
    OR?: RefreshTokenScalarWhereWithAggregatesInput[]
    NOT?: RefreshTokenScalarWhereWithAggregatesInput | RefreshTokenScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"RefreshToken"> | string
    user_id?: UuidWithAggregatesFilter<"RefreshToken"> | string
    token_hash?: StringWithAggregatesFilter<"RefreshToken"> | string
    expires_at?: DateTimeWithAggregatesFilter<"RefreshToken"> | Date | string
    revoked?: BoolWithAggregatesFilter<"RefreshToken"> | boolean
    created_at?: DateTimeWithAggregatesFilter<"RefreshToken"> | Date | string
    user_agent?: StringNullableWithAggregatesFilter<"RefreshToken"> | string | null
    ip_address?: StringNullableWithAggregatesFilter<"RefreshToken"> | string | null
    sesion_iniciada_en?: DateTimeNullableWithAggregatesFilter<"RefreshToken"> | Date | string | null
  }

  export type MasterAuditLogWhereInput = {
    AND?: MasterAuditLogWhereInput | MasterAuditLogWhereInput[]
    OR?: MasterAuditLogWhereInput[]
    NOT?: MasterAuditLogWhereInput | MasterAuditLogWhereInput[]
    id?: UuidFilter<"MasterAuditLog"> | string
    accion?: StringFilter<"MasterAuditLog"> | string
    entity_type?: StringFilter<"MasterAuditLog"> | string
    entity_id?: UuidNullableFilter<"MasterAuditLog"> | string | null
    ip_address?: StringNullableFilter<"MasterAuditLog"> | string | null
    user_agent?: StringNullableFilter<"MasterAuditLog"> | string | null
    payload?: JsonNullableFilter<"MasterAuditLog">
    status_code?: IntFilter<"MasterAuditLog"> | number
    error_msg?: StringNullableFilter<"MasterAuditLog"> | string | null
    created_at?: DateTimeFilter<"MasterAuditLog"> | Date | string
  }

  export type MasterAuditLogOrderByWithRelationInput = {
    id?: SortOrder
    accion?: SortOrder
    entity_type?: SortOrder
    entity_id?: SortOrderInput | SortOrder
    ip_address?: SortOrderInput | SortOrder
    user_agent?: SortOrderInput | SortOrder
    payload?: SortOrderInput | SortOrder
    status_code?: SortOrder
    error_msg?: SortOrderInput | SortOrder
    created_at?: SortOrder
  }

  export type MasterAuditLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: MasterAuditLogWhereInput | MasterAuditLogWhereInput[]
    OR?: MasterAuditLogWhereInput[]
    NOT?: MasterAuditLogWhereInput | MasterAuditLogWhereInput[]
    accion?: StringFilter<"MasterAuditLog"> | string
    entity_type?: StringFilter<"MasterAuditLog"> | string
    entity_id?: UuidNullableFilter<"MasterAuditLog"> | string | null
    ip_address?: StringNullableFilter<"MasterAuditLog"> | string | null
    user_agent?: StringNullableFilter<"MasterAuditLog"> | string | null
    payload?: JsonNullableFilter<"MasterAuditLog">
    status_code?: IntFilter<"MasterAuditLog"> | number
    error_msg?: StringNullableFilter<"MasterAuditLog"> | string | null
    created_at?: DateTimeFilter<"MasterAuditLog"> | Date | string
  }, "id">

  export type MasterAuditLogOrderByWithAggregationInput = {
    id?: SortOrder
    accion?: SortOrder
    entity_type?: SortOrder
    entity_id?: SortOrderInput | SortOrder
    ip_address?: SortOrderInput | SortOrder
    user_agent?: SortOrderInput | SortOrder
    payload?: SortOrderInput | SortOrder
    status_code?: SortOrder
    error_msg?: SortOrderInput | SortOrder
    created_at?: SortOrder
    _count?: MasterAuditLogCountOrderByAggregateInput
    _avg?: MasterAuditLogAvgOrderByAggregateInput
    _max?: MasterAuditLogMaxOrderByAggregateInput
    _min?: MasterAuditLogMinOrderByAggregateInput
    _sum?: MasterAuditLogSumOrderByAggregateInput
  }

  export type MasterAuditLogScalarWhereWithAggregatesInput = {
    AND?: MasterAuditLogScalarWhereWithAggregatesInput | MasterAuditLogScalarWhereWithAggregatesInput[]
    OR?: MasterAuditLogScalarWhereWithAggregatesInput[]
    NOT?: MasterAuditLogScalarWhereWithAggregatesInput | MasterAuditLogScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"MasterAuditLog"> | string
    accion?: StringWithAggregatesFilter<"MasterAuditLog"> | string
    entity_type?: StringWithAggregatesFilter<"MasterAuditLog"> | string
    entity_id?: UuidNullableWithAggregatesFilter<"MasterAuditLog"> | string | null
    ip_address?: StringNullableWithAggregatesFilter<"MasterAuditLog"> | string | null
    user_agent?: StringNullableWithAggregatesFilter<"MasterAuditLog"> | string | null
    payload?: JsonNullableWithAggregatesFilter<"MasterAuditLog">
    status_code?: IntWithAggregatesFilter<"MasterAuditLog"> | number
    error_msg?: StringNullableWithAggregatesFilter<"MasterAuditLog"> | string | null
    created_at?: DateTimeWithAggregatesFilter<"MasterAuditLog"> | Date | string
  }

  export type TenantAuditLogWhereInput = {
    AND?: TenantAuditLogWhereInput | TenantAuditLogWhereInput[]
    OR?: TenantAuditLogWhereInput[]
    NOT?: TenantAuditLogWhereInput | TenantAuditLogWhereInput[]
    id?: UuidFilter<"TenantAuditLog"> | string
    tenant_id?: UuidFilter<"TenantAuditLog"> | string
    proyecto_id?: UuidFilter<"TenantAuditLog"> | string
    actor_user_id?: UuidFilter<"TenantAuditLog"> | string
    event_type?: StringFilter<"TenantAuditLog"> | string
    entity_id?: UuidNullableFilter<"TenantAuditLog"> | string | null
    payload?: JsonNullableFilter<"TenantAuditLog">
    correlation_id?: StringNullableFilter<"TenantAuditLog"> | string | null
    created_at?: DateTimeFilter<"TenantAuditLog"> | Date | string
  }

  export type TenantAuditLogOrderByWithRelationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    actor_user_id?: SortOrder
    event_type?: SortOrder
    entity_id?: SortOrderInput | SortOrder
    payload?: SortOrderInput | SortOrder
    correlation_id?: SortOrderInput | SortOrder
    created_at?: SortOrder
  }

  export type TenantAuditLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: TenantAuditLogWhereInput | TenantAuditLogWhereInput[]
    OR?: TenantAuditLogWhereInput[]
    NOT?: TenantAuditLogWhereInput | TenantAuditLogWhereInput[]
    tenant_id?: UuidFilter<"TenantAuditLog"> | string
    proyecto_id?: UuidFilter<"TenantAuditLog"> | string
    actor_user_id?: UuidFilter<"TenantAuditLog"> | string
    event_type?: StringFilter<"TenantAuditLog"> | string
    entity_id?: UuidNullableFilter<"TenantAuditLog"> | string | null
    payload?: JsonNullableFilter<"TenantAuditLog">
    correlation_id?: StringNullableFilter<"TenantAuditLog"> | string | null
    created_at?: DateTimeFilter<"TenantAuditLog"> | Date | string
  }, "id">

  export type TenantAuditLogOrderByWithAggregationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    actor_user_id?: SortOrder
    event_type?: SortOrder
    entity_id?: SortOrderInput | SortOrder
    payload?: SortOrderInput | SortOrder
    correlation_id?: SortOrderInput | SortOrder
    created_at?: SortOrder
    _count?: TenantAuditLogCountOrderByAggregateInput
    _max?: TenantAuditLogMaxOrderByAggregateInput
    _min?: TenantAuditLogMinOrderByAggregateInput
  }

  export type TenantAuditLogScalarWhereWithAggregatesInput = {
    AND?: TenantAuditLogScalarWhereWithAggregatesInput | TenantAuditLogScalarWhereWithAggregatesInput[]
    OR?: TenantAuditLogScalarWhereWithAggregatesInput[]
    NOT?: TenantAuditLogScalarWhereWithAggregatesInput | TenantAuditLogScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"TenantAuditLog"> | string
    tenant_id?: UuidWithAggregatesFilter<"TenantAuditLog"> | string
    proyecto_id?: UuidWithAggregatesFilter<"TenantAuditLog"> | string
    actor_user_id?: UuidWithAggregatesFilter<"TenantAuditLog"> | string
    event_type?: StringWithAggregatesFilter<"TenantAuditLog"> | string
    entity_id?: UuidNullableWithAggregatesFilter<"TenantAuditLog"> | string | null
    payload?: JsonNullableWithAggregatesFilter<"TenantAuditLog">
    correlation_id?: StringNullableWithAggregatesFilter<"TenantAuditLog"> | string | null
    created_at?: DateTimeWithAggregatesFilter<"TenantAuditLog"> | Date | string
  }

  export type TenantCreateInput = {
    id_tenant?: string
    nombre: string
    rfc?: string | null
    logo_url?: string | null
    primary_color?: string | null
    plan?: string
    activo?: boolean
    created_at?: Date | string
    usuarios?: UserCreateNestedManyWithoutTenantInput
    proyectos?: ProyectoCreateNestedManyWithoutTenantInput
  }

  export type TenantUncheckedCreateInput = {
    id_tenant?: string
    nombre: string
    rfc?: string | null
    logo_url?: string | null
    primary_color?: string | null
    plan?: string
    activo?: boolean
    created_at?: Date | string
    usuarios?: UserUncheckedCreateNestedManyWithoutTenantInput
    proyectos?: ProyectoUncheckedCreateNestedManyWithoutTenantInput
  }

  export type TenantUpdateInput = {
    id_tenant?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    rfc?: NullableStringFieldUpdateOperationsInput | string | null
    logo_url?: NullableStringFieldUpdateOperationsInput | string | null
    primary_color?: NullableStringFieldUpdateOperationsInput | string | null
    plan?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    usuarios?: UserUpdateManyWithoutTenantNestedInput
    proyectos?: ProyectoUpdateManyWithoutTenantNestedInput
  }

  export type TenantUncheckedUpdateInput = {
    id_tenant?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    rfc?: NullableStringFieldUpdateOperationsInput | string | null
    logo_url?: NullableStringFieldUpdateOperationsInput | string | null
    primary_color?: NullableStringFieldUpdateOperationsInput | string | null
    plan?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    usuarios?: UserUncheckedUpdateManyWithoutTenantNestedInput
    proyectos?: ProyectoUncheckedUpdateManyWithoutTenantNestedInput
  }

  export type TenantCreateManyInput = {
    id_tenant?: string
    nombre: string
    rfc?: string | null
    logo_url?: string | null
    primary_color?: string | null
    plan?: string
    activo?: boolean
    created_at?: Date | string
  }

  export type TenantUpdateManyMutationInput = {
    id_tenant?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    rfc?: NullableStringFieldUpdateOperationsInput | string | null
    logo_url?: NullableStringFieldUpdateOperationsInput | string | null
    primary_color?: NullableStringFieldUpdateOperationsInput | string | null
    plan?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantUncheckedUpdateManyInput = {
    id_tenant?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    rfc?: NullableStringFieldUpdateOperationsInput | string | null
    logo_url?: NullableStringFieldUpdateOperationsInput | string | null
    primary_color?: NullableStringFieldUpdateOperationsInput | string | null
    plan?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProyectoCreateInput = {
    id_proyecto?: string
    codigo_centro_costos: string
    nombre_oficial: string
    tipo_contrato?: string
    moneda_base?: string
    estatus?: string
    activo?: boolean
    created_at?: Date | string
    empresa_grupo?: string | null
    anio_centro_costos?: number | null
    cliente_id?: string | null
    consecutivo_centro_costos?: number | null
    es_especial?: boolean
    tipo_especial?: string | null
    fecha_inicio_real?: Date | string | null
    fecha_firma_contrato?: Date | string | null
    fecha_programada_inicio?: Date | string | null
    fecha_programada_fin?: Date | string | null
    monto_total_vendido?: Decimal | DecimalJsLike | number | string | null
    periodo_ejecucion?: number | null
    periodo_ejecucion_unidad?: string | null
    total_dias_naturales?: number | null
    total_dias_laborables?: number | null
    tenant: TenantCreateNestedOneWithoutProyectosInput
    asignaciones?: UserProjectAccessCreateNestedManyWithoutProyectoInput
  }

  export type ProyectoUncheckedCreateInput = {
    id_proyecto?: string
    tenant_id: string
    codigo_centro_costos: string
    nombre_oficial: string
    tipo_contrato?: string
    moneda_base?: string
    estatus?: string
    activo?: boolean
    created_at?: Date | string
    empresa_grupo?: string | null
    anio_centro_costos?: number | null
    cliente_id?: string | null
    consecutivo_centro_costos?: number | null
    es_especial?: boolean
    tipo_especial?: string | null
    fecha_inicio_real?: Date | string | null
    fecha_firma_contrato?: Date | string | null
    fecha_programada_inicio?: Date | string | null
    fecha_programada_fin?: Date | string | null
    monto_total_vendido?: Decimal | DecimalJsLike | number | string | null
    periodo_ejecucion?: number | null
    periodo_ejecucion_unidad?: string | null
    total_dias_naturales?: number | null
    total_dias_laborables?: number | null
    asignaciones?: UserProjectAccessUncheckedCreateNestedManyWithoutProyectoInput
  }

  export type ProyectoUpdateInput = {
    id_proyecto?: StringFieldUpdateOperationsInput | string
    codigo_centro_costos?: StringFieldUpdateOperationsInput | string
    nombre_oficial?: StringFieldUpdateOperationsInput | string
    tipo_contrato?: StringFieldUpdateOperationsInput | string
    moneda_base?: StringFieldUpdateOperationsInput | string
    estatus?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    empresa_grupo?: NullableStringFieldUpdateOperationsInput | string | null
    anio_centro_costos?: NullableIntFieldUpdateOperationsInput | number | null
    cliente_id?: NullableStringFieldUpdateOperationsInput | string | null
    consecutivo_centro_costos?: NullableIntFieldUpdateOperationsInput | number | null
    es_especial?: BoolFieldUpdateOperationsInput | boolean
    tipo_especial?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_inicio_real?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_firma_contrato?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_programada_inicio?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_programada_fin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    monto_total_vendido?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    periodo_ejecucion?: NullableIntFieldUpdateOperationsInput | number | null
    periodo_ejecucion_unidad?: NullableStringFieldUpdateOperationsInput | string | null
    total_dias_naturales?: NullableIntFieldUpdateOperationsInput | number | null
    total_dias_laborables?: NullableIntFieldUpdateOperationsInput | number | null
    tenant?: TenantUpdateOneRequiredWithoutProyectosNestedInput
    asignaciones?: UserProjectAccessUpdateManyWithoutProyectoNestedInput
  }

  export type ProyectoUncheckedUpdateInput = {
    id_proyecto?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    codigo_centro_costos?: StringFieldUpdateOperationsInput | string
    nombre_oficial?: StringFieldUpdateOperationsInput | string
    tipo_contrato?: StringFieldUpdateOperationsInput | string
    moneda_base?: StringFieldUpdateOperationsInput | string
    estatus?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    empresa_grupo?: NullableStringFieldUpdateOperationsInput | string | null
    anio_centro_costos?: NullableIntFieldUpdateOperationsInput | number | null
    cliente_id?: NullableStringFieldUpdateOperationsInput | string | null
    consecutivo_centro_costos?: NullableIntFieldUpdateOperationsInput | number | null
    es_especial?: BoolFieldUpdateOperationsInput | boolean
    tipo_especial?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_inicio_real?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_firma_contrato?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_programada_inicio?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_programada_fin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    monto_total_vendido?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    periodo_ejecucion?: NullableIntFieldUpdateOperationsInput | number | null
    periodo_ejecucion_unidad?: NullableStringFieldUpdateOperationsInput | string | null
    total_dias_naturales?: NullableIntFieldUpdateOperationsInput | number | null
    total_dias_laborables?: NullableIntFieldUpdateOperationsInput | number | null
    asignaciones?: UserProjectAccessUncheckedUpdateManyWithoutProyectoNestedInput
  }

  export type ProyectoCreateManyInput = {
    id_proyecto?: string
    tenant_id: string
    codigo_centro_costos: string
    nombre_oficial: string
    tipo_contrato?: string
    moneda_base?: string
    estatus?: string
    activo?: boolean
    created_at?: Date | string
    empresa_grupo?: string | null
    anio_centro_costos?: number | null
    cliente_id?: string | null
    consecutivo_centro_costos?: number | null
    es_especial?: boolean
    tipo_especial?: string | null
    fecha_inicio_real?: Date | string | null
    fecha_firma_contrato?: Date | string | null
    fecha_programada_inicio?: Date | string | null
    fecha_programada_fin?: Date | string | null
    monto_total_vendido?: Decimal | DecimalJsLike | number | string | null
    periodo_ejecucion?: number | null
    periodo_ejecucion_unidad?: string | null
    total_dias_naturales?: number | null
    total_dias_laborables?: number | null
  }

  export type ProyectoUpdateManyMutationInput = {
    id_proyecto?: StringFieldUpdateOperationsInput | string
    codigo_centro_costos?: StringFieldUpdateOperationsInput | string
    nombre_oficial?: StringFieldUpdateOperationsInput | string
    tipo_contrato?: StringFieldUpdateOperationsInput | string
    moneda_base?: StringFieldUpdateOperationsInput | string
    estatus?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    empresa_grupo?: NullableStringFieldUpdateOperationsInput | string | null
    anio_centro_costos?: NullableIntFieldUpdateOperationsInput | number | null
    cliente_id?: NullableStringFieldUpdateOperationsInput | string | null
    consecutivo_centro_costos?: NullableIntFieldUpdateOperationsInput | number | null
    es_especial?: BoolFieldUpdateOperationsInput | boolean
    tipo_especial?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_inicio_real?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_firma_contrato?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_programada_inicio?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_programada_fin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    monto_total_vendido?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    periodo_ejecucion?: NullableIntFieldUpdateOperationsInput | number | null
    periodo_ejecucion_unidad?: NullableStringFieldUpdateOperationsInput | string | null
    total_dias_naturales?: NullableIntFieldUpdateOperationsInput | number | null
    total_dias_laborables?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type ProyectoUncheckedUpdateManyInput = {
    id_proyecto?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    codigo_centro_costos?: StringFieldUpdateOperationsInput | string
    nombre_oficial?: StringFieldUpdateOperationsInput | string
    tipo_contrato?: StringFieldUpdateOperationsInput | string
    moneda_base?: StringFieldUpdateOperationsInput | string
    estatus?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    empresa_grupo?: NullableStringFieldUpdateOperationsInput | string | null
    anio_centro_costos?: NullableIntFieldUpdateOperationsInput | number | null
    cliente_id?: NullableStringFieldUpdateOperationsInput | string | null
    consecutivo_centro_costos?: NullableIntFieldUpdateOperationsInput | number | null
    es_especial?: BoolFieldUpdateOperationsInput | boolean
    tipo_especial?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_inicio_real?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_firma_contrato?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_programada_inicio?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_programada_fin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    monto_total_vendido?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    periodo_ejecucion?: NullableIntFieldUpdateOperationsInput | number | null
    periodo_ejecucion_unidad?: NullableStringFieldUpdateOperationsInput | string | null
    total_dias_naturales?: NullableIntFieldUpdateOperationsInput | number | null
    total_dias_laborables?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type UserCreateInput = {
    id_usuario?: string
    email: string
    password_hash: string
    nombre: string
    rol_global?: UserCreaterol_globalInput | string[]
    limite_aprobacion_financiera?: Decimal | DecimalJsLike | number | string
    activo?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    tenant: TenantCreateNestedOneWithoutUsuariosInput
    tokens?: RefreshTokenCreateNestedManyWithoutUserInput
    proyectos_acceso?: UserProjectAccessCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id_usuario?: string
    tenant_id: string
    email: string
    password_hash: string
    nombre: string
    rol_global?: UserCreaterol_globalInput | string[]
    limite_aprobacion_financiera?: Decimal | DecimalJsLike | number | string
    activo?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    tokens?: RefreshTokenUncheckedCreateNestedManyWithoutUserInput
    proyectos_acceso?: UserProjectAccessUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id_usuario?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password_hash?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    rol_global?: UserUpdaterol_globalInput | string[]
    limite_aprobacion_financiera?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutUsuariosNestedInput
    tokens?: RefreshTokenUpdateManyWithoutUserNestedInput
    proyectos_acceso?: UserProjectAccessUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id_usuario?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password_hash?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    rol_global?: UserUpdaterol_globalInput | string[]
    limite_aprobacion_financiera?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tokens?: RefreshTokenUncheckedUpdateManyWithoutUserNestedInput
    proyectos_acceso?: UserProjectAccessUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id_usuario?: string
    tenant_id: string
    email: string
    password_hash: string
    nombre: string
    rol_global?: UserCreaterol_globalInput | string[]
    limite_aprobacion_financiera?: Decimal | DecimalJsLike | number | string
    activo?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id_usuario?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password_hash?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    rol_global?: UserUpdaterol_globalInput | string[]
    limite_aprobacion_financiera?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id_usuario?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password_hash?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    rol_global?: UserUpdaterol_globalInput | string[]
    limite_aprobacion_financiera?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserProjectAccessCreateInput = {
    id?: string
    rol_proyecto?: string | null
    created_at?: Date | string
    user: UserCreateNestedOneWithoutProyectos_accesoInput
    proyecto: ProyectoCreateNestedOneWithoutAsignacionesInput
  }

  export type UserProjectAccessUncheckedCreateInput = {
    id?: string
    user_id: string
    proyecto_id: string
    rol_proyecto?: string | null
    created_at?: Date | string
  }

  export type UserProjectAccessUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    rol_proyecto?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutProyectos_accesoNestedInput
    proyecto?: ProyectoUpdateOneRequiredWithoutAsignacionesNestedInput
  }

  export type UserProjectAccessUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    rol_proyecto?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserProjectAccessCreateManyInput = {
    id?: string
    user_id: string
    proyecto_id: string
    rol_proyecto?: string | null
    created_at?: Date | string
  }

  export type UserProjectAccessUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    rol_proyecto?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserProjectAccessUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    rol_proyecto?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RefreshTokenCreateInput = {
    id?: string
    token_hash: string
    expires_at: Date | string
    revoked?: boolean
    created_at?: Date | string
    user_agent?: string | null
    ip_address?: string | null
    sesion_iniciada_en?: Date | string | null
    user: UserCreateNestedOneWithoutTokensInput
  }

  export type RefreshTokenUncheckedCreateInput = {
    id?: string
    user_id: string
    token_hash: string
    expires_at: Date | string
    revoked?: boolean
    created_at?: Date | string
    user_agent?: string | null
    ip_address?: string | null
    sesion_iniciada_en?: Date | string | null
  }

  export type RefreshTokenUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    token_hash?: StringFieldUpdateOperationsInput | string
    expires_at?: DateTimeFieldUpdateOperationsInput | Date | string
    revoked?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    user_agent?: NullableStringFieldUpdateOperationsInput | string | null
    ip_address?: NullableStringFieldUpdateOperationsInput | string | null
    sesion_iniciada_en?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    user?: UserUpdateOneRequiredWithoutTokensNestedInput
  }

  export type RefreshTokenUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    token_hash?: StringFieldUpdateOperationsInput | string
    expires_at?: DateTimeFieldUpdateOperationsInput | Date | string
    revoked?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    user_agent?: NullableStringFieldUpdateOperationsInput | string | null
    ip_address?: NullableStringFieldUpdateOperationsInput | string | null
    sesion_iniciada_en?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type RefreshTokenCreateManyInput = {
    id?: string
    user_id: string
    token_hash: string
    expires_at: Date | string
    revoked?: boolean
    created_at?: Date | string
    user_agent?: string | null
    ip_address?: string | null
    sesion_iniciada_en?: Date | string | null
  }

  export type RefreshTokenUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    token_hash?: StringFieldUpdateOperationsInput | string
    expires_at?: DateTimeFieldUpdateOperationsInput | Date | string
    revoked?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    user_agent?: NullableStringFieldUpdateOperationsInput | string | null
    ip_address?: NullableStringFieldUpdateOperationsInput | string | null
    sesion_iniciada_en?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type RefreshTokenUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    token_hash?: StringFieldUpdateOperationsInput | string
    expires_at?: DateTimeFieldUpdateOperationsInput | Date | string
    revoked?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    user_agent?: NullableStringFieldUpdateOperationsInput | string | null
    ip_address?: NullableStringFieldUpdateOperationsInput | string | null
    sesion_iniciada_en?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type MasterAuditLogCreateInput = {
    id?: string
    accion: string
    entity_type: string
    entity_id?: string | null
    ip_address?: string | null
    user_agent?: string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    status_code: number
    error_msg?: string | null
    created_at?: Date | string
  }

  export type MasterAuditLogUncheckedCreateInput = {
    id?: string
    accion: string
    entity_type: string
    entity_id?: string | null
    ip_address?: string | null
    user_agent?: string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    status_code: number
    error_msg?: string | null
    created_at?: Date | string
  }

  export type MasterAuditLogUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    accion?: StringFieldUpdateOperationsInput | string
    entity_type?: StringFieldUpdateOperationsInput | string
    entity_id?: NullableStringFieldUpdateOperationsInput | string | null
    ip_address?: NullableStringFieldUpdateOperationsInput | string | null
    user_agent?: NullableStringFieldUpdateOperationsInput | string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    status_code?: IntFieldUpdateOperationsInput | number
    error_msg?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MasterAuditLogUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    accion?: StringFieldUpdateOperationsInput | string
    entity_type?: StringFieldUpdateOperationsInput | string
    entity_id?: NullableStringFieldUpdateOperationsInput | string | null
    ip_address?: NullableStringFieldUpdateOperationsInput | string | null
    user_agent?: NullableStringFieldUpdateOperationsInput | string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    status_code?: IntFieldUpdateOperationsInput | number
    error_msg?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MasterAuditLogCreateManyInput = {
    id?: string
    accion: string
    entity_type: string
    entity_id?: string | null
    ip_address?: string | null
    user_agent?: string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    status_code: number
    error_msg?: string | null
    created_at?: Date | string
  }

  export type MasterAuditLogUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    accion?: StringFieldUpdateOperationsInput | string
    entity_type?: StringFieldUpdateOperationsInput | string
    entity_id?: NullableStringFieldUpdateOperationsInput | string | null
    ip_address?: NullableStringFieldUpdateOperationsInput | string | null
    user_agent?: NullableStringFieldUpdateOperationsInput | string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    status_code?: IntFieldUpdateOperationsInput | number
    error_msg?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MasterAuditLogUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    accion?: StringFieldUpdateOperationsInput | string
    entity_type?: StringFieldUpdateOperationsInput | string
    entity_id?: NullableStringFieldUpdateOperationsInput | string | null
    ip_address?: NullableStringFieldUpdateOperationsInput | string | null
    user_agent?: NullableStringFieldUpdateOperationsInput | string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    status_code?: IntFieldUpdateOperationsInput | number
    error_msg?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantAuditLogCreateInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    actor_user_id: string
    event_type: string
    entity_id?: string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    correlation_id?: string | null
    created_at?: Date | string
  }

  export type TenantAuditLogUncheckedCreateInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    actor_user_id: string
    event_type: string
    entity_id?: string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    correlation_id?: string | null
    created_at?: Date | string
  }

  export type TenantAuditLogUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    actor_user_id?: StringFieldUpdateOperationsInput | string
    event_type?: StringFieldUpdateOperationsInput | string
    entity_id?: NullableStringFieldUpdateOperationsInput | string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    correlation_id?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantAuditLogUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    actor_user_id?: StringFieldUpdateOperationsInput | string
    event_type?: StringFieldUpdateOperationsInput | string
    entity_id?: NullableStringFieldUpdateOperationsInput | string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    correlation_id?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantAuditLogCreateManyInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    actor_user_id: string
    event_type: string
    entity_id?: string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    correlation_id?: string | null
    created_at?: Date | string
  }

  export type TenantAuditLogUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    actor_user_id?: StringFieldUpdateOperationsInput | string
    event_type?: StringFieldUpdateOperationsInput | string
    entity_id?: NullableStringFieldUpdateOperationsInput | string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    correlation_id?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantAuditLogUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    actor_user_id?: StringFieldUpdateOperationsInput | string
    event_type?: StringFieldUpdateOperationsInput | string
    entity_id?: NullableStringFieldUpdateOperationsInput | string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    correlation_id?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidFilter<$PrismaModel> | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type UserListRelationFilter = {
    every?: UserWhereInput
    some?: UserWhereInput
    none?: UserWhereInput
  }

  export type ProyectoListRelationFilter = {
    every?: ProyectoWhereInput
    some?: ProyectoWhereInput
    none?: ProyectoWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type UserOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ProyectoOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TenantCountOrderByAggregateInput = {
    id_tenant?: SortOrder
    nombre?: SortOrder
    rfc?: SortOrder
    logo_url?: SortOrder
    primary_color?: SortOrder
    plan?: SortOrder
    activo?: SortOrder
    created_at?: SortOrder
  }

  export type TenantMaxOrderByAggregateInput = {
    id_tenant?: SortOrder
    nombre?: SortOrder
    rfc?: SortOrder
    logo_url?: SortOrder
    primary_color?: SortOrder
    plan?: SortOrder
    activo?: SortOrder
    created_at?: SortOrder
  }

  export type TenantMinOrderByAggregateInput = {
    id_tenant?: SortOrder
    nombre?: SortOrder
    rfc?: SortOrder
    logo_url?: SortOrder
    primary_color?: SortOrder
    plan?: SortOrder
    activo?: SortOrder
    created_at?: SortOrder
  }

  export type UuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type UuidNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type DecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type TenantRelationFilter = {
    is?: TenantWhereInput
    isNot?: TenantWhereInput
  }

  export type UserProjectAccessListRelationFilter = {
    every?: UserProjectAccessWhereInput
    some?: UserProjectAccessWhereInput
    none?: UserProjectAccessWhereInput
  }

  export type UserProjectAccessOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ProyectoTenant_idCodigo_centro_costosCompoundUniqueInput = {
    tenant_id: string
    codigo_centro_costos: string
  }

  export type ProyectoCountOrderByAggregateInput = {
    id_proyecto?: SortOrder
    tenant_id?: SortOrder
    codigo_centro_costos?: SortOrder
    nombre_oficial?: SortOrder
    tipo_contrato?: SortOrder
    moneda_base?: SortOrder
    estatus?: SortOrder
    activo?: SortOrder
    created_at?: SortOrder
    empresa_grupo?: SortOrder
    anio_centro_costos?: SortOrder
    cliente_id?: SortOrder
    consecutivo_centro_costos?: SortOrder
    es_especial?: SortOrder
    tipo_especial?: SortOrder
    fecha_inicio_real?: SortOrder
    fecha_firma_contrato?: SortOrder
    fecha_programada_inicio?: SortOrder
    fecha_programada_fin?: SortOrder
    monto_total_vendido?: SortOrder
    periodo_ejecucion?: SortOrder
    periodo_ejecucion_unidad?: SortOrder
    total_dias_naturales?: SortOrder
    total_dias_laborables?: SortOrder
  }

  export type ProyectoAvgOrderByAggregateInput = {
    anio_centro_costos?: SortOrder
    consecutivo_centro_costos?: SortOrder
    monto_total_vendido?: SortOrder
    periodo_ejecucion?: SortOrder
    total_dias_naturales?: SortOrder
    total_dias_laborables?: SortOrder
  }

  export type ProyectoMaxOrderByAggregateInput = {
    id_proyecto?: SortOrder
    tenant_id?: SortOrder
    codigo_centro_costos?: SortOrder
    nombre_oficial?: SortOrder
    tipo_contrato?: SortOrder
    moneda_base?: SortOrder
    estatus?: SortOrder
    activo?: SortOrder
    created_at?: SortOrder
    empresa_grupo?: SortOrder
    anio_centro_costos?: SortOrder
    cliente_id?: SortOrder
    consecutivo_centro_costos?: SortOrder
    es_especial?: SortOrder
    tipo_especial?: SortOrder
    fecha_inicio_real?: SortOrder
    fecha_firma_contrato?: SortOrder
    fecha_programada_inicio?: SortOrder
    fecha_programada_fin?: SortOrder
    monto_total_vendido?: SortOrder
    periodo_ejecucion?: SortOrder
    periodo_ejecucion_unidad?: SortOrder
    total_dias_naturales?: SortOrder
    total_dias_laborables?: SortOrder
  }

  export type ProyectoMinOrderByAggregateInput = {
    id_proyecto?: SortOrder
    tenant_id?: SortOrder
    codigo_centro_costos?: SortOrder
    nombre_oficial?: SortOrder
    tipo_contrato?: SortOrder
    moneda_base?: SortOrder
    estatus?: SortOrder
    activo?: SortOrder
    created_at?: SortOrder
    empresa_grupo?: SortOrder
    anio_centro_costos?: SortOrder
    cliente_id?: SortOrder
    consecutivo_centro_costos?: SortOrder
    es_especial?: SortOrder
    tipo_especial?: SortOrder
    fecha_inicio_real?: SortOrder
    fecha_firma_contrato?: SortOrder
    fecha_programada_inicio?: SortOrder
    fecha_programada_fin?: SortOrder
    monto_total_vendido?: SortOrder
    periodo_ejecucion?: SortOrder
    periodo_ejecucion_unidad?: SortOrder
    total_dias_naturales?: SortOrder
    total_dias_laborables?: SortOrder
  }

  export type ProyectoSumOrderByAggregateInput = {
    anio_centro_costos?: SortOrder
    consecutivo_centro_costos?: SortOrder
    monto_total_vendido?: SortOrder
    periodo_ejecucion?: SortOrder
    total_dias_naturales?: SortOrder
    total_dias_laborables?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type UuidNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type DecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type DecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type RefreshTokenListRelationFilter = {
    every?: RefreshTokenWhereInput
    some?: RefreshTokenWhereInput
    none?: RefreshTokenWhereInput
  }

  export type RefreshTokenOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserTenant_idEmailCompoundUniqueInput = {
    tenant_id: string
    email: string
  }

  export type UserCountOrderByAggregateInput = {
    id_usuario?: SortOrder
    tenant_id?: SortOrder
    email?: SortOrder
    password_hash?: SortOrder
    nombre?: SortOrder
    rol_global?: SortOrder
    limite_aprobacion_financiera?: SortOrder
    activo?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type UserAvgOrderByAggregateInput = {
    limite_aprobacion_financiera?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id_usuario?: SortOrder
    tenant_id?: SortOrder
    email?: SortOrder
    password_hash?: SortOrder
    nombre?: SortOrder
    limite_aprobacion_financiera?: SortOrder
    activo?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id_usuario?: SortOrder
    tenant_id?: SortOrder
    email?: SortOrder
    password_hash?: SortOrder
    nombre?: SortOrder
    limite_aprobacion_financiera?: SortOrder
    activo?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type UserSumOrderByAggregateInput = {
    limite_aprobacion_financiera?: SortOrder
  }

  export type DecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type UserRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type ProyectoRelationFilter = {
    is?: ProyectoWhereInput
    isNot?: ProyectoWhereInput
  }

  export type UserProjectAccessUser_idProyecto_idCompoundUniqueInput = {
    user_id: string
    proyecto_id: string
  }

  export type UserProjectAccessCountOrderByAggregateInput = {
    id?: SortOrder
    user_id?: SortOrder
    proyecto_id?: SortOrder
    rol_proyecto?: SortOrder
    created_at?: SortOrder
  }

  export type UserProjectAccessMaxOrderByAggregateInput = {
    id?: SortOrder
    user_id?: SortOrder
    proyecto_id?: SortOrder
    rol_proyecto?: SortOrder
    created_at?: SortOrder
  }

  export type UserProjectAccessMinOrderByAggregateInput = {
    id?: SortOrder
    user_id?: SortOrder
    proyecto_id?: SortOrder
    rol_proyecto?: SortOrder
    created_at?: SortOrder
  }

  export type RefreshTokenCountOrderByAggregateInput = {
    id?: SortOrder
    user_id?: SortOrder
    token_hash?: SortOrder
    expires_at?: SortOrder
    revoked?: SortOrder
    created_at?: SortOrder
    user_agent?: SortOrder
    ip_address?: SortOrder
    sesion_iniciada_en?: SortOrder
  }

  export type RefreshTokenMaxOrderByAggregateInput = {
    id?: SortOrder
    user_id?: SortOrder
    token_hash?: SortOrder
    expires_at?: SortOrder
    revoked?: SortOrder
    created_at?: SortOrder
    user_agent?: SortOrder
    ip_address?: SortOrder
    sesion_iniciada_en?: SortOrder
  }

  export type RefreshTokenMinOrderByAggregateInput = {
    id?: SortOrder
    user_id?: SortOrder
    token_hash?: SortOrder
    expires_at?: SortOrder
    revoked?: SortOrder
    created_at?: SortOrder
    user_agent?: SortOrder
    ip_address?: SortOrder
    sesion_iniciada_en?: SortOrder
  }
  export type JsonNullableFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type MasterAuditLogCountOrderByAggregateInput = {
    id?: SortOrder
    accion?: SortOrder
    entity_type?: SortOrder
    entity_id?: SortOrder
    ip_address?: SortOrder
    user_agent?: SortOrder
    payload?: SortOrder
    status_code?: SortOrder
    error_msg?: SortOrder
    created_at?: SortOrder
  }

  export type MasterAuditLogAvgOrderByAggregateInput = {
    status_code?: SortOrder
  }

  export type MasterAuditLogMaxOrderByAggregateInput = {
    id?: SortOrder
    accion?: SortOrder
    entity_type?: SortOrder
    entity_id?: SortOrder
    ip_address?: SortOrder
    user_agent?: SortOrder
    status_code?: SortOrder
    error_msg?: SortOrder
    created_at?: SortOrder
  }

  export type MasterAuditLogMinOrderByAggregateInput = {
    id?: SortOrder
    accion?: SortOrder
    entity_type?: SortOrder
    entity_id?: SortOrder
    ip_address?: SortOrder
    user_agent?: SortOrder
    status_code?: SortOrder
    error_msg?: SortOrder
    created_at?: SortOrder
  }

  export type MasterAuditLogSumOrderByAggregateInput = {
    status_code?: SortOrder
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type TenantAuditLogCountOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    actor_user_id?: SortOrder
    event_type?: SortOrder
    entity_id?: SortOrder
    payload?: SortOrder
    correlation_id?: SortOrder
    created_at?: SortOrder
  }

  export type TenantAuditLogMaxOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    actor_user_id?: SortOrder
    event_type?: SortOrder
    entity_id?: SortOrder
    correlation_id?: SortOrder
    created_at?: SortOrder
  }

  export type TenantAuditLogMinOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    actor_user_id?: SortOrder
    event_type?: SortOrder
    entity_id?: SortOrder
    correlation_id?: SortOrder
    created_at?: SortOrder
  }

  export type UserCreateNestedManyWithoutTenantInput = {
    create?: XOR<UserCreateWithoutTenantInput, UserUncheckedCreateWithoutTenantInput> | UserCreateWithoutTenantInput[] | UserUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: UserCreateOrConnectWithoutTenantInput | UserCreateOrConnectWithoutTenantInput[]
    createMany?: UserCreateManyTenantInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type ProyectoCreateNestedManyWithoutTenantInput = {
    create?: XOR<ProyectoCreateWithoutTenantInput, ProyectoUncheckedCreateWithoutTenantInput> | ProyectoCreateWithoutTenantInput[] | ProyectoUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: ProyectoCreateOrConnectWithoutTenantInput | ProyectoCreateOrConnectWithoutTenantInput[]
    createMany?: ProyectoCreateManyTenantInputEnvelope
    connect?: ProyectoWhereUniqueInput | ProyectoWhereUniqueInput[]
  }

  export type UserUncheckedCreateNestedManyWithoutTenantInput = {
    create?: XOR<UserCreateWithoutTenantInput, UserUncheckedCreateWithoutTenantInput> | UserCreateWithoutTenantInput[] | UserUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: UserCreateOrConnectWithoutTenantInput | UserCreateOrConnectWithoutTenantInput[]
    createMany?: UserCreateManyTenantInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type ProyectoUncheckedCreateNestedManyWithoutTenantInput = {
    create?: XOR<ProyectoCreateWithoutTenantInput, ProyectoUncheckedCreateWithoutTenantInput> | ProyectoCreateWithoutTenantInput[] | ProyectoUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: ProyectoCreateOrConnectWithoutTenantInput | ProyectoCreateOrConnectWithoutTenantInput[]
    createMany?: ProyectoCreateManyTenantInputEnvelope
    connect?: ProyectoWhereUniqueInput | ProyectoWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type UserUpdateManyWithoutTenantNestedInput = {
    create?: XOR<UserCreateWithoutTenantInput, UserUncheckedCreateWithoutTenantInput> | UserCreateWithoutTenantInput[] | UserUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: UserCreateOrConnectWithoutTenantInput | UserCreateOrConnectWithoutTenantInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutTenantInput | UserUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: UserCreateManyTenantInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutTenantInput | UserUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: UserUpdateManyWithWhereWithoutTenantInput | UserUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type ProyectoUpdateManyWithoutTenantNestedInput = {
    create?: XOR<ProyectoCreateWithoutTenantInput, ProyectoUncheckedCreateWithoutTenantInput> | ProyectoCreateWithoutTenantInput[] | ProyectoUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: ProyectoCreateOrConnectWithoutTenantInput | ProyectoCreateOrConnectWithoutTenantInput[]
    upsert?: ProyectoUpsertWithWhereUniqueWithoutTenantInput | ProyectoUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: ProyectoCreateManyTenantInputEnvelope
    set?: ProyectoWhereUniqueInput | ProyectoWhereUniqueInput[]
    disconnect?: ProyectoWhereUniqueInput | ProyectoWhereUniqueInput[]
    delete?: ProyectoWhereUniqueInput | ProyectoWhereUniqueInput[]
    connect?: ProyectoWhereUniqueInput | ProyectoWhereUniqueInput[]
    update?: ProyectoUpdateWithWhereUniqueWithoutTenantInput | ProyectoUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: ProyectoUpdateManyWithWhereWithoutTenantInput | ProyectoUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: ProyectoScalarWhereInput | ProyectoScalarWhereInput[]
  }

  export type UserUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: XOR<UserCreateWithoutTenantInput, UserUncheckedCreateWithoutTenantInput> | UserCreateWithoutTenantInput[] | UserUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: UserCreateOrConnectWithoutTenantInput | UserCreateOrConnectWithoutTenantInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutTenantInput | UserUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: UserCreateManyTenantInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutTenantInput | UserUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: UserUpdateManyWithWhereWithoutTenantInput | UserUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type ProyectoUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: XOR<ProyectoCreateWithoutTenantInput, ProyectoUncheckedCreateWithoutTenantInput> | ProyectoCreateWithoutTenantInput[] | ProyectoUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: ProyectoCreateOrConnectWithoutTenantInput | ProyectoCreateOrConnectWithoutTenantInput[]
    upsert?: ProyectoUpsertWithWhereUniqueWithoutTenantInput | ProyectoUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: ProyectoCreateManyTenantInputEnvelope
    set?: ProyectoWhereUniqueInput | ProyectoWhereUniqueInput[]
    disconnect?: ProyectoWhereUniqueInput | ProyectoWhereUniqueInput[]
    delete?: ProyectoWhereUniqueInput | ProyectoWhereUniqueInput[]
    connect?: ProyectoWhereUniqueInput | ProyectoWhereUniqueInput[]
    update?: ProyectoUpdateWithWhereUniqueWithoutTenantInput | ProyectoUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: ProyectoUpdateManyWithWhereWithoutTenantInput | ProyectoUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: ProyectoScalarWhereInput | ProyectoScalarWhereInput[]
  }

  export type TenantCreateNestedOneWithoutProyectosInput = {
    create?: XOR<TenantCreateWithoutProyectosInput, TenantUncheckedCreateWithoutProyectosInput>
    connectOrCreate?: TenantCreateOrConnectWithoutProyectosInput
    connect?: TenantWhereUniqueInput
  }

  export type UserProjectAccessCreateNestedManyWithoutProyectoInput = {
    create?: XOR<UserProjectAccessCreateWithoutProyectoInput, UserProjectAccessUncheckedCreateWithoutProyectoInput> | UserProjectAccessCreateWithoutProyectoInput[] | UserProjectAccessUncheckedCreateWithoutProyectoInput[]
    connectOrCreate?: UserProjectAccessCreateOrConnectWithoutProyectoInput | UserProjectAccessCreateOrConnectWithoutProyectoInput[]
    createMany?: UserProjectAccessCreateManyProyectoInputEnvelope
    connect?: UserProjectAccessWhereUniqueInput | UserProjectAccessWhereUniqueInput[]
  }

  export type UserProjectAccessUncheckedCreateNestedManyWithoutProyectoInput = {
    create?: XOR<UserProjectAccessCreateWithoutProyectoInput, UserProjectAccessUncheckedCreateWithoutProyectoInput> | UserProjectAccessCreateWithoutProyectoInput[] | UserProjectAccessUncheckedCreateWithoutProyectoInput[]
    connectOrCreate?: UserProjectAccessCreateOrConnectWithoutProyectoInput | UserProjectAccessCreateOrConnectWithoutProyectoInput[]
    createMany?: UserProjectAccessCreateManyProyectoInputEnvelope
    connect?: UserProjectAccessWhereUniqueInput | UserProjectAccessWhereUniqueInput[]
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type NullableDecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string | null
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type TenantUpdateOneRequiredWithoutProyectosNestedInput = {
    create?: XOR<TenantCreateWithoutProyectosInput, TenantUncheckedCreateWithoutProyectosInput>
    connectOrCreate?: TenantCreateOrConnectWithoutProyectosInput
    upsert?: TenantUpsertWithoutProyectosInput
    connect?: TenantWhereUniqueInput
    update?: XOR<XOR<TenantUpdateToOneWithWhereWithoutProyectosInput, TenantUpdateWithoutProyectosInput>, TenantUncheckedUpdateWithoutProyectosInput>
  }

  export type UserProjectAccessUpdateManyWithoutProyectoNestedInput = {
    create?: XOR<UserProjectAccessCreateWithoutProyectoInput, UserProjectAccessUncheckedCreateWithoutProyectoInput> | UserProjectAccessCreateWithoutProyectoInput[] | UserProjectAccessUncheckedCreateWithoutProyectoInput[]
    connectOrCreate?: UserProjectAccessCreateOrConnectWithoutProyectoInput | UserProjectAccessCreateOrConnectWithoutProyectoInput[]
    upsert?: UserProjectAccessUpsertWithWhereUniqueWithoutProyectoInput | UserProjectAccessUpsertWithWhereUniqueWithoutProyectoInput[]
    createMany?: UserProjectAccessCreateManyProyectoInputEnvelope
    set?: UserProjectAccessWhereUniqueInput | UserProjectAccessWhereUniqueInput[]
    disconnect?: UserProjectAccessWhereUniqueInput | UserProjectAccessWhereUniqueInput[]
    delete?: UserProjectAccessWhereUniqueInput | UserProjectAccessWhereUniqueInput[]
    connect?: UserProjectAccessWhereUniqueInput | UserProjectAccessWhereUniqueInput[]
    update?: UserProjectAccessUpdateWithWhereUniqueWithoutProyectoInput | UserProjectAccessUpdateWithWhereUniqueWithoutProyectoInput[]
    updateMany?: UserProjectAccessUpdateManyWithWhereWithoutProyectoInput | UserProjectAccessUpdateManyWithWhereWithoutProyectoInput[]
    deleteMany?: UserProjectAccessScalarWhereInput | UserProjectAccessScalarWhereInput[]
  }

  export type UserProjectAccessUncheckedUpdateManyWithoutProyectoNestedInput = {
    create?: XOR<UserProjectAccessCreateWithoutProyectoInput, UserProjectAccessUncheckedCreateWithoutProyectoInput> | UserProjectAccessCreateWithoutProyectoInput[] | UserProjectAccessUncheckedCreateWithoutProyectoInput[]
    connectOrCreate?: UserProjectAccessCreateOrConnectWithoutProyectoInput | UserProjectAccessCreateOrConnectWithoutProyectoInput[]
    upsert?: UserProjectAccessUpsertWithWhereUniqueWithoutProyectoInput | UserProjectAccessUpsertWithWhereUniqueWithoutProyectoInput[]
    createMany?: UserProjectAccessCreateManyProyectoInputEnvelope
    set?: UserProjectAccessWhereUniqueInput | UserProjectAccessWhereUniqueInput[]
    disconnect?: UserProjectAccessWhereUniqueInput | UserProjectAccessWhereUniqueInput[]
    delete?: UserProjectAccessWhereUniqueInput | UserProjectAccessWhereUniqueInput[]
    connect?: UserProjectAccessWhereUniqueInput | UserProjectAccessWhereUniqueInput[]
    update?: UserProjectAccessUpdateWithWhereUniqueWithoutProyectoInput | UserProjectAccessUpdateWithWhereUniqueWithoutProyectoInput[]
    updateMany?: UserProjectAccessUpdateManyWithWhereWithoutProyectoInput | UserProjectAccessUpdateManyWithWhereWithoutProyectoInput[]
    deleteMany?: UserProjectAccessScalarWhereInput | UserProjectAccessScalarWhereInput[]
  }

  export type UserCreaterol_globalInput = {
    set: string[]
  }

  export type TenantCreateNestedOneWithoutUsuariosInput = {
    create?: XOR<TenantCreateWithoutUsuariosInput, TenantUncheckedCreateWithoutUsuariosInput>
    connectOrCreate?: TenantCreateOrConnectWithoutUsuariosInput
    connect?: TenantWhereUniqueInput
  }

  export type RefreshTokenCreateNestedManyWithoutUserInput = {
    create?: XOR<RefreshTokenCreateWithoutUserInput, RefreshTokenUncheckedCreateWithoutUserInput> | RefreshTokenCreateWithoutUserInput[] | RefreshTokenUncheckedCreateWithoutUserInput[]
    connectOrCreate?: RefreshTokenCreateOrConnectWithoutUserInput | RefreshTokenCreateOrConnectWithoutUserInput[]
    createMany?: RefreshTokenCreateManyUserInputEnvelope
    connect?: RefreshTokenWhereUniqueInput | RefreshTokenWhereUniqueInput[]
  }

  export type UserProjectAccessCreateNestedManyWithoutUserInput = {
    create?: XOR<UserProjectAccessCreateWithoutUserInput, UserProjectAccessUncheckedCreateWithoutUserInput> | UserProjectAccessCreateWithoutUserInput[] | UserProjectAccessUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserProjectAccessCreateOrConnectWithoutUserInput | UserProjectAccessCreateOrConnectWithoutUserInput[]
    createMany?: UserProjectAccessCreateManyUserInputEnvelope
    connect?: UserProjectAccessWhereUniqueInput | UserProjectAccessWhereUniqueInput[]
  }

  export type RefreshTokenUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<RefreshTokenCreateWithoutUserInput, RefreshTokenUncheckedCreateWithoutUserInput> | RefreshTokenCreateWithoutUserInput[] | RefreshTokenUncheckedCreateWithoutUserInput[]
    connectOrCreate?: RefreshTokenCreateOrConnectWithoutUserInput | RefreshTokenCreateOrConnectWithoutUserInput[]
    createMany?: RefreshTokenCreateManyUserInputEnvelope
    connect?: RefreshTokenWhereUniqueInput | RefreshTokenWhereUniqueInput[]
  }

  export type UserProjectAccessUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<UserProjectAccessCreateWithoutUserInput, UserProjectAccessUncheckedCreateWithoutUserInput> | UserProjectAccessCreateWithoutUserInput[] | UserProjectAccessUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserProjectAccessCreateOrConnectWithoutUserInput | UserProjectAccessCreateOrConnectWithoutUserInput[]
    createMany?: UserProjectAccessCreateManyUserInputEnvelope
    connect?: UserProjectAccessWhereUniqueInput | UserProjectAccessWhereUniqueInput[]
  }

  export type UserUpdaterol_globalInput = {
    set?: string[]
    push?: string | string[]
  }

  export type DecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type TenantUpdateOneRequiredWithoutUsuariosNestedInput = {
    create?: XOR<TenantCreateWithoutUsuariosInput, TenantUncheckedCreateWithoutUsuariosInput>
    connectOrCreate?: TenantCreateOrConnectWithoutUsuariosInput
    upsert?: TenantUpsertWithoutUsuariosInput
    connect?: TenantWhereUniqueInput
    update?: XOR<XOR<TenantUpdateToOneWithWhereWithoutUsuariosInput, TenantUpdateWithoutUsuariosInput>, TenantUncheckedUpdateWithoutUsuariosInput>
  }

  export type RefreshTokenUpdateManyWithoutUserNestedInput = {
    create?: XOR<RefreshTokenCreateWithoutUserInput, RefreshTokenUncheckedCreateWithoutUserInput> | RefreshTokenCreateWithoutUserInput[] | RefreshTokenUncheckedCreateWithoutUserInput[]
    connectOrCreate?: RefreshTokenCreateOrConnectWithoutUserInput | RefreshTokenCreateOrConnectWithoutUserInput[]
    upsert?: RefreshTokenUpsertWithWhereUniqueWithoutUserInput | RefreshTokenUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: RefreshTokenCreateManyUserInputEnvelope
    set?: RefreshTokenWhereUniqueInput | RefreshTokenWhereUniqueInput[]
    disconnect?: RefreshTokenWhereUniqueInput | RefreshTokenWhereUniqueInput[]
    delete?: RefreshTokenWhereUniqueInput | RefreshTokenWhereUniqueInput[]
    connect?: RefreshTokenWhereUniqueInput | RefreshTokenWhereUniqueInput[]
    update?: RefreshTokenUpdateWithWhereUniqueWithoutUserInput | RefreshTokenUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: RefreshTokenUpdateManyWithWhereWithoutUserInput | RefreshTokenUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: RefreshTokenScalarWhereInput | RefreshTokenScalarWhereInput[]
  }

  export type UserProjectAccessUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserProjectAccessCreateWithoutUserInput, UserProjectAccessUncheckedCreateWithoutUserInput> | UserProjectAccessCreateWithoutUserInput[] | UserProjectAccessUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserProjectAccessCreateOrConnectWithoutUserInput | UserProjectAccessCreateOrConnectWithoutUserInput[]
    upsert?: UserProjectAccessUpsertWithWhereUniqueWithoutUserInput | UserProjectAccessUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserProjectAccessCreateManyUserInputEnvelope
    set?: UserProjectAccessWhereUniqueInput | UserProjectAccessWhereUniqueInput[]
    disconnect?: UserProjectAccessWhereUniqueInput | UserProjectAccessWhereUniqueInput[]
    delete?: UserProjectAccessWhereUniqueInput | UserProjectAccessWhereUniqueInput[]
    connect?: UserProjectAccessWhereUniqueInput | UserProjectAccessWhereUniqueInput[]
    update?: UserProjectAccessUpdateWithWhereUniqueWithoutUserInput | UserProjectAccessUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserProjectAccessUpdateManyWithWhereWithoutUserInput | UserProjectAccessUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserProjectAccessScalarWhereInput | UserProjectAccessScalarWhereInput[]
  }

  export type RefreshTokenUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<RefreshTokenCreateWithoutUserInput, RefreshTokenUncheckedCreateWithoutUserInput> | RefreshTokenCreateWithoutUserInput[] | RefreshTokenUncheckedCreateWithoutUserInput[]
    connectOrCreate?: RefreshTokenCreateOrConnectWithoutUserInput | RefreshTokenCreateOrConnectWithoutUserInput[]
    upsert?: RefreshTokenUpsertWithWhereUniqueWithoutUserInput | RefreshTokenUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: RefreshTokenCreateManyUserInputEnvelope
    set?: RefreshTokenWhereUniqueInput | RefreshTokenWhereUniqueInput[]
    disconnect?: RefreshTokenWhereUniqueInput | RefreshTokenWhereUniqueInput[]
    delete?: RefreshTokenWhereUniqueInput | RefreshTokenWhereUniqueInput[]
    connect?: RefreshTokenWhereUniqueInput | RefreshTokenWhereUniqueInput[]
    update?: RefreshTokenUpdateWithWhereUniqueWithoutUserInput | RefreshTokenUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: RefreshTokenUpdateManyWithWhereWithoutUserInput | RefreshTokenUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: RefreshTokenScalarWhereInput | RefreshTokenScalarWhereInput[]
  }

  export type UserProjectAccessUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserProjectAccessCreateWithoutUserInput, UserProjectAccessUncheckedCreateWithoutUserInput> | UserProjectAccessCreateWithoutUserInput[] | UserProjectAccessUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserProjectAccessCreateOrConnectWithoutUserInput | UserProjectAccessCreateOrConnectWithoutUserInput[]
    upsert?: UserProjectAccessUpsertWithWhereUniqueWithoutUserInput | UserProjectAccessUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserProjectAccessCreateManyUserInputEnvelope
    set?: UserProjectAccessWhereUniqueInput | UserProjectAccessWhereUniqueInput[]
    disconnect?: UserProjectAccessWhereUniqueInput | UserProjectAccessWhereUniqueInput[]
    delete?: UserProjectAccessWhereUniqueInput | UserProjectAccessWhereUniqueInput[]
    connect?: UserProjectAccessWhereUniqueInput | UserProjectAccessWhereUniqueInput[]
    update?: UserProjectAccessUpdateWithWhereUniqueWithoutUserInput | UserProjectAccessUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserProjectAccessUpdateManyWithWhereWithoutUserInput | UserProjectAccessUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserProjectAccessScalarWhereInput | UserProjectAccessScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutProyectos_accesoInput = {
    create?: XOR<UserCreateWithoutProyectos_accesoInput, UserUncheckedCreateWithoutProyectos_accesoInput>
    connectOrCreate?: UserCreateOrConnectWithoutProyectos_accesoInput
    connect?: UserWhereUniqueInput
  }

  export type ProyectoCreateNestedOneWithoutAsignacionesInput = {
    create?: XOR<ProyectoCreateWithoutAsignacionesInput, ProyectoUncheckedCreateWithoutAsignacionesInput>
    connectOrCreate?: ProyectoCreateOrConnectWithoutAsignacionesInput
    connect?: ProyectoWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutProyectos_accesoNestedInput = {
    create?: XOR<UserCreateWithoutProyectos_accesoInput, UserUncheckedCreateWithoutProyectos_accesoInput>
    connectOrCreate?: UserCreateOrConnectWithoutProyectos_accesoInput
    upsert?: UserUpsertWithoutProyectos_accesoInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutProyectos_accesoInput, UserUpdateWithoutProyectos_accesoInput>, UserUncheckedUpdateWithoutProyectos_accesoInput>
  }

  export type ProyectoUpdateOneRequiredWithoutAsignacionesNestedInput = {
    create?: XOR<ProyectoCreateWithoutAsignacionesInput, ProyectoUncheckedCreateWithoutAsignacionesInput>
    connectOrCreate?: ProyectoCreateOrConnectWithoutAsignacionesInput
    upsert?: ProyectoUpsertWithoutAsignacionesInput
    connect?: ProyectoWhereUniqueInput
    update?: XOR<XOR<ProyectoUpdateToOneWithWhereWithoutAsignacionesInput, ProyectoUpdateWithoutAsignacionesInput>, ProyectoUncheckedUpdateWithoutAsignacionesInput>
  }

  export type UserCreateNestedOneWithoutTokensInput = {
    create?: XOR<UserCreateWithoutTokensInput, UserUncheckedCreateWithoutTokensInput>
    connectOrCreate?: UserCreateOrConnectWithoutTokensInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutTokensNestedInput = {
    create?: XOR<UserCreateWithoutTokensInput, UserUncheckedCreateWithoutTokensInput>
    connectOrCreate?: UserCreateOrConnectWithoutTokensInput
    upsert?: UserUpsertWithoutTokensInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutTokensInput, UserUpdateWithoutTokensInput>, UserUncheckedUpdateWithoutTokensInput>
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NestedUuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidFilter<$PrismaModel> | string
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedUuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedUuidNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedUuidNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedDecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }

  export type NestedDecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type NestedDecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type UserCreateWithoutTenantInput = {
    id_usuario?: string
    email: string
    password_hash: string
    nombre: string
    rol_global?: UserCreaterol_globalInput | string[]
    limite_aprobacion_financiera?: Decimal | DecimalJsLike | number | string
    activo?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    tokens?: RefreshTokenCreateNestedManyWithoutUserInput
    proyectos_acceso?: UserProjectAccessCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutTenantInput = {
    id_usuario?: string
    email: string
    password_hash: string
    nombre: string
    rol_global?: UserCreaterol_globalInput | string[]
    limite_aprobacion_financiera?: Decimal | DecimalJsLike | number | string
    activo?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    tokens?: RefreshTokenUncheckedCreateNestedManyWithoutUserInput
    proyectos_acceso?: UserProjectAccessUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutTenantInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutTenantInput, UserUncheckedCreateWithoutTenantInput>
  }

  export type UserCreateManyTenantInputEnvelope = {
    data: UserCreateManyTenantInput | UserCreateManyTenantInput[]
    skipDuplicates?: boolean
  }

  export type ProyectoCreateWithoutTenantInput = {
    id_proyecto?: string
    codigo_centro_costos: string
    nombre_oficial: string
    tipo_contrato?: string
    moneda_base?: string
    estatus?: string
    activo?: boolean
    created_at?: Date | string
    empresa_grupo?: string | null
    anio_centro_costos?: number | null
    cliente_id?: string | null
    consecutivo_centro_costos?: number | null
    es_especial?: boolean
    tipo_especial?: string | null
    fecha_inicio_real?: Date | string | null
    fecha_firma_contrato?: Date | string | null
    fecha_programada_inicio?: Date | string | null
    fecha_programada_fin?: Date | string | null
    monto_total_vendido?: Decimal | DecimalJsLike | number | string | null
    periodo_ejecucion?: number | null
    periodo_ejecucion_unidad?: string | null
    total_dias_naturales?: number | null
    total_dias_laborables?: number | null
    asignaciones?: UserProjectAccessCreateNestedManyWithoutProyectoInput
  }

  export type ProyectoUncheckedCreateWithoutTenantInput = {
    id_proyecto?: string
    codigo_centro_costos: string
    nombre_oficial: string
    tipo_contrato?: string
    moneda_base?: string
    estatus?: string
    activo?: boolean
    created_at?: Date | string
    empresa_grupo?: string | null
    anio_centro_costos?: number | null
    cliente_id?: string | null
    consecutivo_centro_costos?: number | null
    es_especial?: boolean
    tipo_especial?: string | null
    fecha_inicio_real?: Date | string | null
    fecha_firma_contrato?: Date | string | null
    fecha_programada_inicio?: Date | string | null
    fecha_programada_fin?: Date | string | null
    monto_total_vendido?: Decimal | DecimalJsLike | number | string | null
    periodo_ejecucion?: number | null
    periodo_ejecucion_unidad?: string | null
    total_dias_naturales?: number | null
    total_dias_laborables?: number | null
    asignaciones?: UserProjectAccessUncheckedCreateNestedManyWithoutProyectoInput
  }

  export type ProyectoCreateOrConnectWithoutTenantInput = {
    where: ProyectoWhereUniqueInput
    create: XOR<ProyectoCreateWithoutTenantInput, ProyectoUncheckedCreateWithoutTenantInput>
  }

  export type ProyectoCreateManyTenantInputEnvelope = {
    data: ProyectoCreateManyTenantInput | ProyectoCreateManyTenantInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithWhereUniqueWithoutTenantInput = {
    where: UserWhereUniqueInput
    update: XOR<UserUpdateWithoutTenantInput, UserUncheckedUpdateWithoutTenantInput>
    create: XOR<UserCreateWithoutTenantInput, UserUncheckedCreateWithoutTenantInput>
  }

  export type UserUpdateWithWhereUniqueWithoutTenantInput = {
    where: UserWhereUniqueInput
    data: XOR<UserUpdateWithoutTenantInput, UserUncheckedUpdateWithoutTenantInput>
  }

  export type UserUpdateManyWithWhereWithoutTenantInput = {
    where: UserScalarWhereInput
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyWithoutTenantInput>
  }

  export type UserScalarWhereInput = {
    AND?: UserScalarWhereInput | UserScalarWhereInput[]
    OR?: UserScalarWhereInput[]
    NOT?: UserScalarWhereInput | UserScalarWhereInput[]
    id_usuario?: UuidFilter<"User"> | string
    tenant_id?: UuidFilter<"User"> | string
    email?: StringFilter<"User"> | string
    password_hash?: StringFilter<"User"> | string
    nombre?: StringFilter<"User"> | string
    rol_global?: StringNullableListFilter<"User">
    limite_aprobacion_financiera?: DecimalFilter<"User"> | Decimal | DecimalJsLike | number | string
    activo?: BoolFilter<"User"> | boolean
    created_at?: DateTimeFilter<"User"> | Date | string
    updated_at?: DateTimeFilter<"User"> | Date | string
  }

  export type ProyectoUpsertWithWhereUniqueWithoutTenantInput = {
    where: ProyectoWhereUniqueInput
    update: XOR<ProyectoUpdateWithoutTenantInput, ProyectoUncheckedUpdateWithoutTenantInput>
    create: XOR<ProyectoCreateWithoutTenantInput, ProyectoUncheckedCreateWithoutTenantInput>
  }

  export type ProyectoUpdateWithWhereUniqueWithoutTenantInput = {
    where: ProyectoWhereUniqueInput
    data: XOR<ProyectoUpdateWithoutTenantInput, ProyectoUncheckedUpdateWithoutTenantInput>
  }

  export type ProyectoUpdateManyWithWhereWithoutTenantInput = {
    where: ProyectoScalarWhereInput
    data: XOR<ProyectoUpdateManyMutationInput, ProyectoUncheckedUpdateManyWithoutTenantInput>
  }

  export type ProyectoScalarWhereInput = {
    AND?: ProyectoScalarWhereInput | ProyectoScalarWhereInput[]
    OR?: ProyectoScalarWhereInput[]
    NOT?: ProyectoScalarWhereInput | ProyectoScalarWhereInput[]
    id_proyecto?: UuidFilter<"Proyecto"> | string
    tenant_id?: UuidFilter<"Proyecto"> | string
    codigo_centro_costos?: StringFilter<"Proyecto"> | string
    nombre_oficial?: StringFilter<"Proyecto"> | string
    tipo_contrato?: StringFilter<"Proyecto"> | string
    moneda_base?: StringFilter<"Proyecto"> | string
    estatus?: StringFilter<"Proyecto"> | string
    activo?: BoolFilter<"Proyecto"> | boolean
    created_at?: DateTimeFilter<"Proyecto"> | Date | string
    empresa_grupo?: StringNullableFilter<"Proyecto"> | string | null
    anio_centro_costos?: IntNullableFilter<"Proyecto"> | number | null
    cliente_id?: UuidNullableFilter<"Proyecto"> | string | null
    consecutivo_centro_costos?: IntNullableFilter<"Proyecto"> | number | null
    es_especial?: BoolFilter<"Proyecto"> | boolean
    tipo_especial?: StringNullableFilter<"Proyecto"> | string | null
    fecha_inicio_real?: DateTimeNullableFilter<"Proyecto"> | Date | string | null
    fecha_firma_contrato?: DateTimeNullableFilter<"Proyecto"> | Date | string | null
    fecha_programada_inicio?: DateTimeNullableFilter<"Proyecto"> | Date | string | null
    fecha_programada_fin?: DateTimeNullableFilter<"Proyecto"> | Date | string | null
    monto_total_vendido?: DecimalNullableFilter<"Proyecto"> | Decimal | DecimalJsLike | number | string | null
    periodo_ejecucion?: IntNullableFilter<"Proyecto"> | number | null
    periodo_ejecucion_unidad?: StringNullableFilter<"Proyecto"> | string | null
    total_dias_naturales?: IntNullableFilter<"Proyecto"> | number | null
    total_dias_laborables?: IntNullableFilter<"Proyecto"> | number | null
  }

  export type TenantCreateWithoutProyectosInput = {
    id_tenant?: string
    nombre: string
    rfc?: string | null
    logo_url?: string | null
    primary_color?: string | null
    plan?: string
    activo?: boolean
    created_at?: Date | string
    usuarios?: UserCreateNestedManyWithoutTenantInput
  }

  export type TenantUncheckedCreateWithoutProyectosInput = {
    id_tenant?: string
    nombre: string
    rfc?: string | null
    logo_url?: string | null
    primary_color?: string | null
    plan?: string
    activo?: boolean
    created_at?: Date | string
    usuarios?: UserUncheckedCreateNestedManyWithoutTenantInput
  }

  export type TenantCreateOrConnectWithoutProyectosInput = {
    where: TenantWhereUniqueInput
    create: XOR<TenantCreateWithoutProyectosInput, TenantUncheckedCreateWithoutProyectosInput>
  }

  export type UserProjectAccessCreateWithoutProyectoInput = {
    id?: string
    rol_proyecto?: string | null
    created_at?: Date | string
    user: UserCreateNestedOneWithoutProyectos_accesoInput
  }

  export type UserProjectAccessUncheckedCreateWithoutProyectoInput = {
    id?: string
    user_id: string
    rol_proyecto?: string | null
    created_at?: Date | string
  }

  export type UserProjectAccessCreateOrConnectWithoutProyectoInput = {
    where: UserProjectAccessWhereUniqueInput
    create: XOR<UserProjectAccessCreateWithoutProyectoInput, UserProjectAccessUncheckedCreateWithoutProyectoInput>
  }

  export type UserProjectAccessCreateManyProyectoInputEnvelope = {
    data: UserProjectAccessCreateManyProyectoInput | UserProjectAccessCreateManyProyectoInput[]
    skipDuplicates?: boolean
  }

  export type TenantUpsertWithoutProyectosInput = {
    update: XOR<TenantUpdateWithoutProyectosInput, TenantUncheckedUpdateWithoutProyectosInput>
    create: XOR<TenantCreateWithoutProyectosInput, TenantUncheckedCreateWithoutProyectosInput>
    where?: TenantWhereInput
  }

  export type TenantUpdateToOneWithWhereWithoutProyectosInput = {
    where?: TenantWhereInput
    data: XOR<TenantUpdateWithoutProyectosInput, TenantUncheckedUpdateWithoutProyectosInput>
  }

  export type TenantUpdateWithoutProyectosInput = {
    id_tenant?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    rfc?: NullableStringFieldUpdateOperationsInput | string | null
    logo_url?: NullableStringFieldUpdateOperationsInput | string | null
    primary_color?: NullableStringFieldUpdateOperationsInput | string | null
    plan?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    usuarios?: UserUpdateManyWithoutTenantNestedInput
  }

  export type TenantUncheckedUpdateWithoutProyectosInput = {
    id_tenant?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    rfc?: NullableStringFieldUpdateOperationsInput | string | null
    logo_url?: NullableStringFieldUpdateOperationsInput | string | null
    primary_color?: NullableStringFieldUpdateOperationsInput | string | null
    plan?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    usuarios?: UserUncheckedUpdateManyWithoutTenantNestedInput
  }

  export type UserProjectAccessUpsertWithWhereUniqueWithoutProyectoInput = {
    where: UserProjectAccessWhereUniqueInput
    update: XOR<UserProjectAccessUpdateWithoutProyectoInput, UserProjectAccessUncheckedUpdateWithoutProyectoInput>
    create: XOR<UserProjectAccessCreateWithoutProyectoInput, UserProjectAccessUncheckedCreateWithoutProyectoInput>
  }

  export type UserProjectAccessUpdateWithWhereUniqueWithoutProyectoInput = {
    where: UserProjectAccessWhereUniqueInput
    data: XOR<UserProjectAccessUpdateWithoutProyectoInput, UserProjectAccessUncheckedUpdateWithoutProyectoInput>
  }

  export type UserProjectAccessUpdateManyWithWhereWithoutProyectoInput = {
    where: UserProjectAccessScalarWhereInput
    data: XOR<UserProjectAccessUpdateManyMutationInput, UserProjectAccessUncheckedUpdateManyWithoutProyectoInput>
  }

  export type UserProjectAccessScalarWhereInput = {
    AND?: UserProjectAccessScalarWhereInput | UserProjectAccessScalarWhereInput[]
    OR?: UserProjectAccessScalarWhereInput[]
    NOT?: UserProjectAccessScalarWhereInput | UserProjectAccessScalarWhereInput[]
    id?: UuidFilter<"UserProjectAccess"> | string
    user_id?: UuidFilter<"UserProjectAccess"> | string
    proyecto_id?: UuidFilter<"UserProjectAccess"> | string
    rol_proyecto?: StringNullableFilter<"UserProjectAccess"> | string | null
    created_at?: DateTimeFilter<"UserProjectAccess"> | Date | string
  }

  export type TenantCreateWithoutUsuariosInput = {
    id_tenant?: string
    nombre: string
    rfc?: string | null
    logo_url?: string | null
    primary_color?: string | null
    plan?: string
    activo?: boolean
    created_at?: Date | string
    proyectos?: ProyectoCreateNestedManyWithoutTenantInput
  }

  export type TenantUncheckedCreateWithoutUsuariosInput = {
    id_tenant?: string
    nombre: string
    rfc?: string | null
    logo_url?: string | null
    primary_color?: string | null
    plan?: string
    activo?: boolean
    created_at?: Date | string
    proyectos?: ProyectoUncheckedCreateNestedManyWithoutTenantInput
  }

  export type TenantCreateOrConnectWithoutUsuariosInput = {
    where: TenantWhereUniqueInput
    create: XOR<TenantCreateWithoutUsuariosInput, TenantUncheckedCreateWithoutUsuariosInput>
  }

  export type RefreshTokenCreateWithoutUserInput = {
    id?: string
    token_hash: string
    expires_at: Date | string
    revoked?: boolean
    created_at?: Date | string
    user_agent?: string | null
    ip_address?: string | null
    sesion_iniciada_en?: Date | string | null
  }

  export type RefreshTokenUncheckedCreateWithoutUserInput = {
    id?: string
    token_hash: string
    expires_at: Date | string
    revoked?: boolean
    created_at?: Date | string
    user_agent?: string | null
    ip_address?: string | null
    sesion_iniciada_en?: Date | string | null
  }

  export type RefreshTokenCreateOrConnectWithoutUserInput = {
    where: RefreshTokenWhereUniqueInput
    create: XOR<RefreshTokenCreateWithoutUserInput, RefreshTokenUncheckedCreateWithoutUserInput>
  }

  export type RefreshTokenCreateManyUserInputEnvelope = {
    data: RefreshTokenCreateManyUserInput | RefreshTokenCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type UserProjectAccessCreateWithoutUserInput = {
    id?: string
    rol_proyecto?: string | null
    created_at?: Date | string
    proyecto: ProyectoCreateNestedOneWithoutAsignacionesInput
  }

  export type UserProjectAccessUncheckedCreateWithoutUserInput = {
    id?: string
    proyecto_id: string
    rol_proyecto?: string | null
    created_at?: Date | string
  }

  export type UserProjectAccessCreateOrConnectWithoutUserInput = {
    where: UserProjectAccessWhereUniqueInput
    create: XOR<UserProjectAccessCreateWithoutUserInput, UserProjectAccessUncheckedCreateWithoutUserInput>
  }

  export type UserProjectAccessCreateManyUserInputEnvelope = {
    data: UserProjectAccessCreateManyUserInput | UserProjectAccessCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type TenantUpsertWithoutUsuariosInput = {
    update: XOR<TenantUpdateWithoutUsuariosInput, TenantUncheckedUpdateWithoutUsuariosInput>
    create: XOR<TenantCreateWithoutUsuariosInput, TenantUncheckedCreateWithoutUsuariosInput>
    where?: TenantWhereInput
  }

  export type TenantUpdateToOneWithWhereWithoutUsuariosInput = {
    where?: TenantWhereInput
    data: XOR<TenantUpdateWithoutUsuariosInput, TenantUncheckedUpdateWithoutUsuariosInput>
  }

  export type TenantUpdateWithoutUsuariosInput = {
    id_tenant?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    rfc?: NullableStringFieldUpdateOperationsInput | string | null
    logo_url?: NullableStringFieldUpdateOperationsInput | string | null
    primary_color?: NullableStringFieldUpdateOperationsInput | string | null
    plan?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    proyectos?: ProyectoUpdateManyWithoutTenantNestedInput
  }

  export type TenantUncheckedUpdateWithoutUsuariosInput = {
    id_tenant?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    rfc?: NullableStringFieldUpdateOperationsInput | string | null
    logo_url?: NullableStringFieldUpdateOperationsInput | string | null
    primary_color?: NullableStringFieldUpdateOperationsInput | string | null
    plan?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    proyectos?: ProyectoUncheckedUpdateManyWithoutTenantNestedInput
  }

  export type RefreshTokenUpsertWithWhereUniqueWithoutUserInput = {
    where: RefreshTokenWhereUniqueInput
    update: XOR<RefreshTokenUpdateWithoutUserInput, RefreshTokenUncheckedUpdateWithoutUserInput>
    create: XOR<RefreshTokenCreateWithoutUserInput, RefreshTokenUncheckedCreateWithoutUserInput>
  }

  export type RefreshTokenUpdateWithWhereUniqueWithoutUserInput = {
    where: RefreshTokenWhereUniqueInput
    data: XOR<RefreshTokenUpdateWithoutUserInput, RefreshTokenUncheckedUpdateWithoutUserInput>
  }

  export type RefreshTokenUpdateManyWithWhereWithoutUserInput = {
    where: RefreshTokenScalarWhereInput
    data: XOR<RefreshTokenUpdateManyMutationInput, RefreshTokenUncheckedUpdateManyWithoutUserInput>
  }

  export type RefreshTokenScalarWhereInput = {
    AND?: RefreshTokenScalarWhereInput | RefreshTokenScalarWhereInput[]
    OR?: RefreshTokenScalarWhereInput[]
    NOT?: RefreshTokenScalarWhereInput | RefreshTokenScalarWhereInput[]
    id?: UuidFilter<"RefreshToken"> | string
    user_id?: UuidFilter<"RefreshToken"> | string
    token_hash?: StringFilter<"RefreshToken"> | string
    expires_at?: DateTimeFilter<"RefreshToken"> | Date | string
    revoked?: BoolFilter<"RefreshToken"> | boolean
    created_at?: DateTimeFilter<"RefreshToken"> | Date | string
    user_agent?: StringNullableFilter<"RefreshToken"> | string | null
    ip_address?: StringNullableFilter<"RefreshToken"> | string | null
    sesion_iniciada_en?: DateTimeNullableFilter<"RefreshToken"> | Date | string | null
  }

  export type UserProjectAccessUpsertWithWhereUniqueWithoutUserInput = {
    where: UserProjectAccessWhereUniqueInput
    update: XOR<UserProjectAccessUpdateWithoutUserInput, UserProjectAccessUncheckedUpdateWithoutUserInput>
    create: XOR<UserProjectAccessCreateWithoutUserInput, UserProjectAccessUncheckedCreateWithoutUserInput>
  }

  export type UserProjectAccessUpdateWithWhereUniqueWithoutUserInput = {
    where: UserProjectAccessWhereUniqueInput
    data: XOR<UserProjectAccessUpdateWithoutUserInput, UserProjectAccessUncheckedUpdateWithoutUserInput>
  }

  export type UserProjectAccessUpdateManyWithWhereWithoutUserInput = {
    where: UserProjectAccessScalarWhereInput
    data: XOR<UserProjectAccessUpdateManyMutationInput, UserProjectAccessUncheckedUpdateManyWithoutUserInput>
  }

  export type UserCreateWithoutProyectos_accesoInput = {
    id_usuario?: string
    email: string
    password_hash: string
    nombre: string
    rol_global?: UserCreaterol_globalInput | string[]
    limite_aprobacion_financiera?: Decimal | DecimalJsLike | number | string
    activo?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    tenant: TenantCreateNestedOneWithoutUsuariosInput
    tokens?: RefreshTokenCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutProyectos_accesoInput = {
    id_usuario?: string
    tenant_id: string
    email: string
    password_hash: string
    nombre: string
    rol_global?: UserCreaterol_globalInput | string[]
    limite_aprobacion_financiera?: Decimal | DecimalJsLike | number | string
    activo?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    tokens?: RefreshTokenUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutProyectos_accesoInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutProyectos_accesoInput, UserUncheckedCreateWithoutProyectos_accesoInput>
  }

  export type ProyectoCreateWithoutAsignacionesInput = {
    id_proyecto?: string
    codigo_centro_costos: string
    nombre_oficial: string
    tipo_contrato?: string
    moneda_base?: string
    estatus?: string
    activo?: boolean
    created_at?: Date | string
    empresa_grupo?: string | null
    anio_centro_costos?: number | null
    cliente_id?: string | null
    consecutivo_centro_costos?: number | null
    es_especial?: boolean
    tipo_especial?: string | null
    fecha_inicio_real?: Date | string | null
    fecha_firma_contrato?: Date | string | null
    fecha_programada_inicio?: Date | string | null
    fecha_programada_fin?: Date | string | null
    monto_total_vendido?: Decimal | DecimalJsLike | number | string | null
    periodo_ejecucion?: number | null
    periodo_ejecucion_unidad?: string | null
    total_dias_naturales?: number | null
    total_dias_laborables?: number | null
    tenant: TenantCreateNestedOneWithoutProyectosInput
  }

  export type ProyectoUncheckedCreateWithoutAsignacionesInput = {
    id_proyecto?: string
    tenant_id: string
    codigo_centro_costos: string
    nombre_oficial: string
    tipo_contrato?: string
    moneda_base?: string
    estatus?: string
    activo?: boolean
    created_at?: Date | string
    empresa_grupo?: string | null
    anio_centro_costos?: number | null
    cliente_id?: string | null
    consecutivo_centro_costos?: number | null
    es_especial?: boolean
    tipo_especial?: string | null
    fecha_inicio_real?: Date | string | null
    fecha_firma_contrato?: Date | string | null
    fecha_programada_inicio?: Date | string | null
    fecha_programada_fin?: Date | string | null
    monto_total_vendido?: Decimal | DecimalJsLike | number | string | null
    periodo_ejecucion?: number | null
    periodo_ejecucion_unidad?: string | null
    total_dias_naturales?: number | null
    total_dias_laborables?: number | null
  }

  export type ProyectoCreateOrConnectWithoutAsignacionesInput = {
    where: ProyectoWhereUniqueInput
    create: XOR<ProyectoCreateWithoutAsignacionesInput, ProyectoUncheckedCreateWithoutAsignacionesInput>
  }

  export type UserUpsertWithoutProyectos_accesoInput = {
    update: XOR<UserUpdateWithoutProyectos_accesoInput, UserUncheckedUpdateWithoutProyectos_accesoInput>
    create: XOR<UserCreateWithoutProyectos_accesoInput, UserUncheckedCreateWithoutProyectos_accesoInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutProyectos_accesoInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutProyectos_accesoInput, UserUncheckedUpdateWithoutProyectos_accesoInput>
  }

  export type UserUpdateWithoutProyectos_accesoInput = {
    id_usuario?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password_hash?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    rol_global?: UserUpdaterol_globalInput | string[]
    limite_aprobacion_financiera?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutUsuariosNestedInput
    tokens?: RefreshTokenUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutProyectos_accesoInput = {
    id_usuario?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password_hash?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    rol_global?: UserUpdaterol_globalInput | string[]
    limite_aprobacion_financiera?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tokens?: RefreshTokenUncheckedUpdateManyWithoutUserNestedInput
  }

  export type ProyectoUpsertWithoutAsignacionesInput = {
    update: XOR<ProyectoUpdateWithoutAsignacionesInput, ProyectoUncheckedUpdateWithoutAsignacionesInput>
    create: XOR<ProyectoCreateWithoutAsignacionesInput, ProyectoUncheckedCreateWithoutAsignacionesInput>
    where?: ProyectoWhereInput
  }

  export type ProyectoUpdateToOneWithWhereWithoutAsignacionesInput = {
    where?: ProyectoWhereInput
    data: XOR<ProyectoUpdateWithoutAsignacionesInput, ProyectoUncheckedUpdateWithoutAsignacionesInput>
  }

  export type ProyectoUpdateWithoutAsignacionesInput = {
    id_proyecto?: StringFieldUpdateOperationsInput | string
    codigo_centro_costos?: StringFieldUpdateOperationsInput | string
    nombre_oficial?: StringFieldUpdateOperationsInput | string
    tipo_contrato?: StringFieldUpdateOperationsInput | string
    moneda_base?: StringFieldUpdateOperationsInput | string
    estatus?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    empresa_grupo?: NullableStringFieldUpdateOperationsInput | string | null
    anio_centro_costos?: NullableIntFieldUpdateOperationsInput | number | null
    cliente_id?: NullableStringFieldUpdateOperationsInput | string | null
    consecutivo_centro_costos?: NullableIntFieldUpdateOperationsInput | number | null
    es_especial?: BoolFieldUpdateOperationsInput | boolean
    tipo_especial?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_inicio_real?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_firma_contrato?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_programada_inicio?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_programada_fin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    monto_total_vendido?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    periodo_ejecucion?: NullableIntFieldUpdateOperationsInput | number | null
    periodo_ejecucion_unidad?: NullableStringFieldUpdateOperationsInput | string | null
    total_dias_naturales?: NullableIntFieldUpdateOperationsInput | number | null
    total_dias_laborables?: NullableIntFieldUpdateOperationsInput | number | null
    tenant?: TenantUpdateOneRequiredWithoutProyectosNestedInput
  }

  export type ProyectoUncheckedUpdateWithoutAsignacionesInput = {
    id_proyecto?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    codigo_centro_costos?: StringFieldUpdateOperationsInput | string
    nombre_oficial?: StringFieldUpdateOperationsInput | string
    tipo_contrato?: StringFieldUpdateOperationsInput | string
    moneda_base?: StringFieldUpdateOperationsInput | string
    estatus?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    empresa_grupo?: NullableStringFieldUpdateOperationsInput | string | null
    anio_centro_costos?: NullableIntFieldUpdateOperationsInput | number | null
    cliente_id?: NullableStringFieldUpdateOperationsInput | string | null
    consecutivo_centro_costos?: NullableIntFieldUpdateOperationsInput | number | null
    es_especial?: BoolFieldUpdateOperationsInput | boolean
    tipo_especial?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_inicio_real?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_firma_contrato?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_programada_inicio?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_programada_fin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    monto_total_vendido?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    periodo_ejecucion?: NullableIntFieldUpdateOperationsInput | number | null
    periodo_ejecucion_unidad?: NullableStringFieldUpdateOperationsInput | string | null
    total_dias_naturales?: NullableIntFieldUpdateOperationsInput | number | null
    total_dias_laborables?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type UserCreateWithoutTokensInput = {
    id_usuario?: string
    email: string
    password_hash: string
    nombre: string
    rol_global?: UserCreaterol_globalInput | string[]
    limite_aprobacion_financiera?: Decimal | DecimalJsLike | number | string
    activo?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    tenant: TenantCreateNestedOneWithoutUsuariosInput
    proyectos_acceso?: UserProjectAccessCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutTokensInput = {
    id_usuario?: string
    tenant_id: string
    email: string
    password_hash: string
    nombre: string
    rol_global?: UserCreaterol_globalInput | string[]
    limite_aprobacion_financiera?: Decimal | DecimalJsLike | number | string
    activo?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    proyectos_acceso?: UserProjectAccessUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutTokensInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutTokensInput, UserUncheckedCreateWithoutTokensInput>
  }

  export type UserUpsertWithoutTokensInput = {
    update: XOR<UserUpdateWithoutTokensInput, UserUncheckedUpdateWithoutTokensInput>
    create: XOR<UserCreateWithoutTokensInput, UserUncheckedCreateWithoutTokensInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutTokensInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutTokensInput, UserUncheckedUpdateWithoutTokensInput>
  }

  export type UserUpdateWithoutTokensInput = {
    id_usuario?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password_hash?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    rol_global?: UserUpdaterol_globalInput | string[]
    limite_aprobacion_financiera?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutUsuariosNestedInput
    proyectos_acceso?: UserProjectAccessUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutTokensInput = {
    id_usuario?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password_hash?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    rol_global?: UserUpdaterol_globalInput | string[]
    limite_aprobacion_financiera?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    proyectos_acceso?: UserProjectAccessUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyTenantInput = {
    id_usuario?: string
    email: string
    password_hash: string
    nombre: string
    rol_global?: UserCreaterol_globalInput | string[]
    limite_aprobacion_financiera?: Decimal | DecimalJsLike | number | string
    activo?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ProyectoCreateManyTenantInput = {
    id_proyecto?: string
    codigo_centro_costos: string
    nombre_oficial: string
    tipo_contrato?: string
    moneda_base?: string
    estatus?: string
    activo?: boolean
    created_at?: Date | string
    empresa_grupo?: string | null
    anio_centro_costos?: number | null
    cliente_id?: string | null
    consecutivo_centro_costos?: number | null
    es_especial?: boolean
    tipo_especial?: string | null
    fecha_inicio_real?: Date | string | null
    fecha_firma_contrato?: Date | string | null
    fecha_programada_inicio?: Date | string | null
    fecha_programada_fin?: Date | string | null
    monto_total_vendido?: Decimal | DecimalJsLike | number | string | null
    periodo_ejecucion?: number | null
    periodo_ejecucion_unidad?: string | null
    total_dias_naturales?: number | null
    total_dias_laborables?: number | null
  }

  export type UserUpdateWithoutTenantInput = {
    id_usuario?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password_hash?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    rol_global?: UserUpdaterol_globalInput | string[]
    limite_aprobacion_financiera?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tokens?: RefreshTokenUpdateManyWithoutUserNestedInput
    proyectos_acceso?: UserProjectAccessUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutTenantInput = {
    id_usuario?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password_hash?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    rol_global?: UserUpdaterol_globalInput | string[]
    limite_aprobacion_financiera?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tokens?: RefreshTokenUncheckedUpdateManyWithoutUserNestedInput
    proyectos_acceso?: UserProjectAccessUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateManyWithoutTenantInput = {
    id_usuario?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password_hash?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    rol_global?: UserUpdaterol_globalInput | string[]
    limite_aprobacion_financiera?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProyectoUpdateWithoutTenantInput = {
    id_proyecto?: StringFieldUpdateOperationsInput | string
    codigo_centro_costos?: StringFieldUpdateOperationsInput | string
    nombre_oficial?: StringFieldUpdateOperationsInput | string
    tipo_contrato?: StringFieldUpdateOperationsInput | string
    moneda_base?: StringFieldUpdateOperationsInput | string
    estatus?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    empresa_grupo?: NullableStringFieldUpdateOperationsInput | string | null
    anio_centro_costos?: NullableIntFieldUpdateOperationsInput | number | null
    cliente_id?: NullableStringFieldUpdateOperationsInput | string | null
    consecutivo_centro_costos?: NullableIntFieldUpdateOperationsInput | number | null
    es_especial?: BoolFieldUpdateOperationsInput | boolean
    tipo_especial?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_inicio_real?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_firma_contrato?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_programada_inicio?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_programada_fin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    monto_total_vendido?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    periodo_ejecucion?: NullableIntFieldUpdateOperationsInput | number | null
    periodo_ejecucion_unidad?: NullableStringFieldUpdateOperationsInput | string | null
    total_dias_naturales?: NullableIntFieldUpdateOperationsInput | number | null
    total_dias_laborables?: NullableIntFieldUpdateOperationsInput | number | null
    asignaciones?: UserProjectAccessUpdateManyWithoutProyectoNestedInput
  }

  export type ProyectoUncheckedUpdateWithoutTenantInput = {
    id_proyecto?: StringFieldUpdateOperationsInput | string
    codigo_centro_costos?: StringFieldUpdateOperationsInput | string
    nombre_oficial?: StringFieldUpdateOperationsInput | string
    tipo_contrato?: StringFieldUpdateOperationsInput | string
    moneda_base?: StringFieldUpdateOperationsInput | string
    estatus?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    empresa_grupo?: NullableStringFieldUpdateOperationsInput | string | null
    anio_centro_costos?: NullableIntFieldUpdateOperationsInput | number | null
    cliente_id?: NullableStringFieldUpdateOperationsInput | string | null
    consecutivo_centro_costos?: NullableIntFieldUpdateOperationsInput | number | null
    es_especial?: BoolFieldUpdateOperationsInput | boolean
    tipo_especial?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_inicio_real?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_firma_contrato?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_programada_inicio?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_programada_fin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    monto_total_vendido?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    periodo_ejecucion?: NullableIntFieldUpdateOperationsInput | number | null
    periodo_ejecucion_unidad?: NullableStringFieldUpdateOperationsInput | string | null
    total_dias_naturales?: NullableIntFieldUpdateOperationsInput | number | null
    total_dias_laborables?: NullableIntFieldUpdateOperationsInput | number | null
    asignaciones?: UserProjectAccessUncheckedUpdateManyWithoutProyectoNestedInput
  }

  export type ProyectoUncheckedUpdateManyWithoutTenantInput = {
    id_proyecto?: StringFieldUpdateOperationsInput | string
    codigo_centro_costos?: StringFieldUpdateOperationsInput | string
    nombre_oficial?: StringFieldUpdateOperationsInput | string
    tipo_contrato?: StringFieldUpdateOperationsInput | string
    moneda_base?: StringFieldUpdateOperationsInput | string
    estatus?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    empresa_grupo?: NullableStringFieldUpdateOperationsInput | string | null
    anio_centro_costos?: NullableIntFieldUpdateOperationsInput | number | null
    cliente_id?: NullableStringFieldUpdateOperationsInput | string | null
    consecutivo_centro_costos?: NullableIntFieldUpdateOperationsInput | number | null
    es_especial?: BoolFieldUpdateOperationsInput | boolean
    tipo_especial?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_inicio_real?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_firma_contrato?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_programada_inicio?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_programada_fin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    monto_total_vendido?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    periodo_ejecucion?: NullableIntFieldUpdateOperationsInput | number | null
    periodo_ejecucion_unidad?: NullableStringFieldUpdateOperationsInput | string | null
    total_dias_naturales?: NullableIntFieldUpdateOperationsInput | number | null
    total_dias_laborables?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type UserProjectAccessCreateManyProyectoInput = {
    id?: string
    user_id: string
    rol_proyecto?: string | null
    created_at?: Date | string
  }

  export type UserProjectAccessUpdateWithoutProyectoInput = {
    id?: StringFieldUpdateOperationsInput | string
    rol_proyecto?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutProyectos_accesoNestedInput
  }

  export type UserProjectAccessUncheckedUpdateWithoutProyectoInput = {
    id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    rol_proyecto?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserProjectAccessUncheckedUpdateManyWithoutProyectoInput = {
    id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    rol_proyecto?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RefreshTokenCreateManyUserInput = {
    id?: string
    token_hash: string
    expires_at: Date | string
    revoked?: boolean
    created_at?: Date | string
    user_agent?: string | null
    ip_address?: string | null
    sesion_iniciada_en?: Date | string | null
  }

  export type UserProjectAccessCreateManyUserInput = {
    id?: string
    proyecto_id: string
    rol_proyecto?: string | null
    created_at?: Date | string
  }

  export type RefreshTokenUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    token_hash?: StringFieldUpdateOperationsInput | string
    expires_at?: DateTimeFieldUpdateOperationsInput | Date | string
    revoked?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    user_agent?: NullableStringFieldUpdateOperationsInput | string | null
    ip_address?: NullableStringFieldUpdateOperationsInput | string | null
    sesion_iniciada_en?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type RefreshTokenUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    token_hash?: StringFieldUpdateOperationsInput | string
    expires_at?: DateTimeFieldUpdateOperationsInput | Date | string
    revoked?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    user_agent?: NullableStringFieldUpdateOperationsInput | string | null
    ip_address?: NullableStringFieldUpdateOperationsInput | string | null
    sesion_iniciada_en?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type RefreshTokenUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    token_hash?: StringFieldUpdateOperationsInput | string
    expires_at?: DateTimeFieldUpdateOperationsInput | Date | string
    revoked?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    user_agent?: NullableStringFieldUpdateOperationsInput | string | null
    ip_address?: NullableStringFieldUpdateOperationsInput | string | null
    sesion_iniciada_en?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UserProjectAccessUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    rol_proyecto?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    proyecto?: ProyectoUpdateOneRequiredWithoutAsignacionesNestedInput
  }

  export type UserProjectAccessUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    rol_proyecto?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserProjectAccessUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    rol_proyecto?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use TenantCountOutputTypeDefaultArgs instead
     */
    export type TenantCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TenantCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ProyectoCountOutputTypeDefaultArgs instead
     */
    export type ProyectoCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProyectoCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserCountOutputTypeDefaultArgs instead
     */
    export type UserCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TenantDefaultArgs instead
     */
    export type TenantArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TenantDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ProyectoDefaultArgs instead
     */
    export type ProyectoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProyectoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserDefaultArgs instead
     */
    export type UserArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserProjectAccessDefaultArgs instead
     */
    export type UserProjectAccessArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserProjectAccessDefaultArgs<ExtArgs>
    /**
     * @deprecated Use RefreshTokenDefaultArgs instead
     */
    export type RefreshTokenArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = RefreshTokenDefaultArgs<ExtArgs>
    /**
     * @deprecated Use MasterAuditLogDefaultArgs instead
     */
    export type MasterAuditLogArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = MasterAuditLogDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TenantAuditLogDefaultArgs instead
     */
    export type TenantAuditLogArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TenantAuditLogDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}