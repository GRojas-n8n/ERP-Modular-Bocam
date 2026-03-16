
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
 * Model PresupuestoAsignado
 * 
 */
export type PresupuestoAsignado = $Result.DefaultSelection<Prisma.$PresupuestoAsignadoPayload>
/**
 * Model MovimientoPresupuestal
 * 
 */
export type MovimientoPresupuestal = $Result.DefaultSelection<Prisma.$MovimientoPresupuestalPayload>
/**
 * Model ProgramaPagos
 * 
 */
export type ProgramaPagos = $Result.DefaultSelection<Prisma.$ProgramaPagosPayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more PresupuestoAsignados
 * const presupuestoAsignados = await prisma.presupuestoAsignado.findMany()
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
   * // Fetch zero or more PresupuestoAsignados
   * const presupuestoAsignados = await prisma.presupuestoAsignado.findMany()
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
   * `prisma.presupuestoAsignado`: Exposes CRUD operations for the **PresupuestoAsignado** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PresupuestoAsignados
    * const presupuestoAsignados = await prisma.presupuestoAsignado.findMany()
    * ```
    */
  get presupuestoAsignado(): Prisma.PresupuestoAsignadoDelegate<ExtArgs>;

  /**
   * `prisma.movimientoPresupuestal`: Exposes CRUD operations for the **MovimientoPresupuestal** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MovimientoPresupuestals
    * const movimientoPresupuestals = await prisma.movimientoPresupuestal.findMany()
    * ```
    */
  get movimientoPresupuestal(): Prisma.MovimientoPresupuestalDelegate<ExtArgs>;

  /**
   * `prisma.programaPagos`: Exposes CRUD operations for the **ProgramaPagos** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ProgramaPagos
    * const programaPagos = await prisma.programaPagos.findMany()
    * ```
    */
  get programaPagos(): Prisma.ProgramaPagosDelegate<ExtArgs>;
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
    PresupuestoAsignado: 'PresupuestoAsignado',
    MovimientoPresupuestal: 'MovimientoPresupuestal',
    ProgramaPagos: 'ProgramaPagos'
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
      modelProps: "presupuestoAsignado" | "movimientoPresupuestal" | "programaPagos"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      PresupuestoAsignado: {
        payload: Prisma.$PresupuestoAsignadoPayload<ExtArgs>
        fields: Prisma.PresupuestoAsignadoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PresupuestoAsignadoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PresupuestoAsignadoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PresupuestoAsignadoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PresupuestoAsignadoPayload>
          }
          findFirst: {
            args: Prisma.PresupuestoAsignadoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PresupuestoAsignadoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PresupuestoAsignadoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PresupuestoAsignadoPayload>
          }
          findMany: {
            args: Prisma.PresupuestoAsignadoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PresupuestoAsignadoPayload>[]
          }
          create: {
            args: Prisma.PresupuestoAsignadoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PresupuestoAsignadoPayload>
          }
          createMany: {
            args: Prisma.PresupuestoAsignadoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PresupuestoAsignadoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PresupuestoAsignadoPayload>[]
          }
          delete: {
            args: Prisma.PresupuestoAsignadoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PresupuestoAsignadoPayload>
          }
          update: {
            args: Prisma.PresupuestoAsignadoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PresupuestoAsignadoPayload>
          }
          deleteMany: {
            args: Prisma.PresupuestoAsignadoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PresupuestoAsignadoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PresupuestoAsignadoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PresupuestoAsignadoPayload>
          }
          aggregate: {
            args: Prisma.PresupuestoAsignadoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePresupuestoAsignado>
          }
          groupBy: {
            args: Prisma.PresupuestoAsignadoGroupByArgs<ExtArgs>
            result: $Utils.Optional<PresupuestoAsignadoGroupByOutputType>[]
          }
          count: {
            args: Prisma.PresupuestoAsignadoCountArgs<ExtArgs>
            result: $Utils.Optional<PresupuestoAsignadoCountAggregateOutputType> | number
          }
        }
      }
      MovimientoPresupuestal: {
        payload: Prisma.$MovimientoPresupuestalPayload<ExtArgs>
        fields: Prisma.MovimientoPresupuestalFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MovimientoPresupuestalFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MovimientoPresupuestalPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MovimientoPresupuestalFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MovimientoPresupuestalPayload>
          }
          findFirst: {
            args: Prisma.MovimientoPresupuestalFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MovimientoPresupuestalPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MovimientoPresupuestalFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MovimientoPresupuestalPayload>
          }
          findMany: {
            args: Prisma.MovimientoPresupuestalFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MovimientoPresupuestalPayload>[]
          }
          create: {
            args: Prisma.MovimientoPresupuestalCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MovimientoPresupuestalPayload>
          }
          createMany: {
            args: Prisma.MovimientoPresupuestalCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MovimientoPresupuestalCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MovimientoPresupuestalPayload>[]
          }
          delete: {
            args: Prisma.MovimientoPresupuestalDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MovimientoPresupuestalPayload>
          }
          update: {
            args: Prisma.MovimientoPresupuestalUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MovimientoPresupuestalPayload>
          }
          deleteMany: {
            args: Prisma.MovimientoPresupuestalDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MovimientoPresupuestalUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.MovimientoPresupuestalUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MovimientoPresupuestalPayload>
          }
          aggregate: {
            args: Prisma.MovimientoPresupuestalAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMovimientoPresupuestal>
          }
          groupBy: {
            args: Prisma.MovimientoPresupuestalGroupByArgs<ExtArgs>
            result: $Utils.Optional<MovimientoPresupuestalGroupByOutputType>[]
          }
          count: {
            args: Prisma.MovimientoPresupuestalCountArgs<ExtArgs>
            result: $Utils.Optional<MovimientoPresupuestalCountAggregateOutputType> | number
          }
        }
      }
      ProgramaPagos: {
        payload: Prisma.$ProgramaPagosPayload<ExtArgs>
        fields: Prisma.ProgramaPagosFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProgramaPagosFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgramaPagosPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProgramaPagosFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgramaPagosPayload>
          }
          findFirst: {
            args: Prisma.ProgramaPagosFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgramaPagosPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProgramaPagosFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgramaPagosPayload>
          }
          findMany: {
            args: Prisma.ProgramaPagosFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgramaPagosPayload>[]
          }
          create: {
            args: Prisma.ProgramaPagosCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgramaPagosPayload>
          }
          createMany: {
            args: Prisma.ProgramaPagosCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProgramaPagosCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgramaPagosPayload>[]
          }
          delete: {
            args: Prisma.ProgramaPagosDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgramaPagosPayload>
          }
          update: {
            args: Prisma.ProgramaPagosUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgramaPagosPayload>
          }
          deleteMany: {
            args: Prisma.ProgramaPagosDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProgramaPagosUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ProgramaPagosUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgramaPagosPayload>
          }
          aggregate: {
            args: Prisma.ProgramaPagosAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProgramaPagos>
          }
          groupBy: {
            args: Prisma.ProgramaPagosGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProgramaPagosGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProgramaPagosCountArgs<ExtArgs>
            result: $Utils.Optional<ProgramaPagosCountAggregateOutputType> | number
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
   * Count Type PresupuestoAsignadoCountOutputType
   */

  export type PresupuestoAsignadoCountOutputType = {
    movimientos: number
    programa_pagos: number
  }

  export type PresupuestoAsignadoCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    movimientos?: boolean | PresupuestoAsignadoCountOutputTypeCountMovimientosArgs
    programa_pagos?: boolean | PresupuestoAsignadoCountOutputTypeCountPrograma_pagosArgs
  }

  // Custom InputTypes
  /**
   * PresupuestoAsignadoCountOutputType without action
   */
  export type PresupuestoAsignadoCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PresupuestoAsignadoCountOutputType
     */
    select?: PresupuestoAsignadoCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * PresupuestoAsignadoCountOutputType without action
   */
  export type PresupuestoAsignadoCountOutputTypeCountMovimientosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MovimientoPresupuestalWhereInput
  }

  /**
   * PresupuestoAsignadoCountOutputType without action
   */
  export type PresupuestoAsignadoCountOutputTypeCountPrograma_pagosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProgramaPagosWhereInput
  }


  /**
   * Models
   */

  /**
   * Model PresupuestoAsignado
   */

  export type AggregatePresupuestoAsignado = {
    _count: PresupuestoAsignadoCountAggregateOutputType | null
    _avg: PresupuestoAsignadoAvgAggregateOutputType | null
    _sum: PresupuestoAsignadoSumAggregateOutputType | null
    _min: PresupuestoAsignadoMinAggregateOutputType | null
    _max: PresupuestoAsignadoMaxAggregateOutputType | null
  }

  export type PresupuestoAsignadoAvgAggregateOutputType = {
    monto_autorizado: Decimal | null
    monto_ejercido: Decimal | null
    monto_comprometido: Decimal | null
    monto_disponible: Decimal | null
  }

  export type PresupuestoAsignadoSumAggregateOutputType = {
    monto_autorizado: Decimal | null
    monto_ejercido: Decimal | null
    monto_comprometido: Decimal | null
    monto_disponible: Decimal | null
  }

  export type PresupuestoAsignadoMinAggregateOutputType = {
    id_presupuesto: string | null
    tenant_id: string | null
    proyecto_id: string | null
    codigo: string | null
    descripcion: string | null
    monto_autorizado: Decimal | null
    monto_ejercido: Decimal | null
    monto_comprometido: Decimal | null
    monto_disponible: Decimal | null
    moneda: string | null
    capitulo: string | null
    estatus: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type PresupuestoAsignadoMaxAggregateOutputType = {
    id_presupuesto: string | null
    tenant_id: string | null
    proyecto_id: string | null
    codigo: string | null
    descripcion: string | null
    monto_autorizado: Decimal | null
    monto_ejercido: Decimal | null
    monto_comprometido: Decimal | null
    monto_disponible: Decimal | null
    moneda: string | null
    capitulo: string | null
    estatus: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type PresupuestoAsignadoCountAggregateOutputType = {
    id_presupuesto: number
    tenant_id: number
    proyecto_id: number
    codigo: number
    descripcion: number
    monto_autorizado: number
    monto_ejercido: number
    monto_comprometido: number
    monto_disponible: number
    moneda: number
    capitulo: number
    estatus: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type PresupuestoAsignadoAvgAggregateInputType = {
    monto_autorizado?: true
    monto_ejercido?: true
    monto_comprometido?: true
    monto_disponible?: true
  }

  export type PresupuestoAsignadoSumAggregateInputType = {
    monto_autorizado?: true
    monto_ejercido?: true
    monto_comprometido?: true
    monto_disponible?: true
  }

  export type PresupuestoAsignadoMinAggregateInputType = {
    id_presupuesto?: true
    tenant_id?: true
    proyecto_id?: true
    codigo?: true
    descripcion?: true
    monto_autorizado?: true
    monto_ejercido?: true
    monto_comprometido?: true
    monto_disponible?: true
    moneda?: true
    capitulo?: true
    estatus?: true
    created_at?: true
    updated_at?: true
  }

  export type PresupuestoAsignadoMaxAggregateInputType = {
    id_presupuesto?: true
    tenant_id?: true
    proyecto_id?: true
    codigo?: true
    descripcion?: true
    monto_autorizado?: true
    monto_ejercido?: true
    monto_comprometido?: true
    monto_disponible?: true
    moneda?: true
    capitulo?: true
    estatus?: true
    created_at?: true
    updated_at?: true
  }

  export type PresupuestoAsignadoCountAggregateInputType = {
    id_presupuesto?: true
    tenant_id?: true
    proyecto_id?: true
    codigo?: true
    descripcion?: true
    monto_autorizado?: true
    monto_ejercido?: true
    monto_comprometido?: true
    monto_disponible?: true
    moneda?: true
    capitulo?: true
    estatus?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type PresupuestoAsignadoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PresupuestoAsignado to aggregate.
     */
    where?: PresupuestoAsignadoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PresupuestoAsignados to fetch.
     */
    orderBy?: PresupuestoAsignadoOrderByWithRelationInput | PresupuestoAsignadoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PresupuestoAsignadoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PresupuestoAsignados from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PresupuestoAsignados.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PresupuestoAsignados
    **/
    _count?: true | PresupuestoAsignadoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PresupuestoAsignadoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PresupuestoAsignadoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PresupuestoAsignadoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PresupuestoAsignadoMaxAggregateInputType
  }

  export type GetPresupuestoAsignadoAggregateType<T extends PresupuestoAsignadoAggregateArgs> = {
        [P in keyof T & keyof AggregatePresupuestoAsignado]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePresupuestoAsignado[P]>
      : GetScalarType<T[P], AggregatePresupuestoAsignado[P]>
  }




  export type PresupuestoAsignadoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PresupuestoAsignadoWhereInput
    orderBy?: PresupuestoAsignadoOrderByWithAggregationInput | PresupuestoAsignadoOrderByWithAggregationInput[]
    by: PresupuestoAsignadoScalarFieldEnum[] | PresupuestoAsignadoScalarFieldEnum
    having?: PresupuestoAsignadoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PresupuestoAsignadoCountAggregateInputType | true
    _avg?: PresupuestoAsignadoAvgAggregateInputType
    _sum?: PresupuestoAsignadoSumAggregateInputType
    _min?: PresupuestoAsignadoMinAggregateInputType
    _max?: PresupuestoAsignadoMaxAggregateInputType
  }

  export type PresupuestoAsignadoGroupByOutputType = {
    id_presupuesto: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    descripcion: string
    monto_autorizado: Decimal
    monto_ejercido: Decimal
    monto_comprometido: Decimal
    monto_disponible: Decimal
    moneda: string
    capitulo: string
    estatus: string
    created_at: Date
    updated_at: Date
    _count: PresupuestoAsignadoCountAggregateOutputType | null
    _avg: PresupuestoAsignadoAvgAggregateOutputType | null
    _sum: PresupuestoAsignadoSumAggregateOutputType | null
    _min: PresupuestoAsignadoMinAggregateOutputType | null
    _max: PresupuestoAsignadoMaxAggregateOutputType | null
  }

  type GetPresupuestoAsignadoGroupByPayload<T extends PresupuestoAsignadoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PresupuestoAsignadoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PresupuestoAsignadoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PresupuestoAsignadoGroupByOutputType[P]>
            : GetScalarType<T[P], PresupuestoAsignadoGroupByOutputType[P]>
        }
      >
    >


  export type PresupuestoAsignadoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_presupuesto?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    codigo?: boolean
    descripcion?: boolean
    monto_autorizado?: boolean
    monto_ejercido?: boolean
    monto_comprometido?: boolean
    monto_disponible?: boolean
    moneda?: boolean
    capitulo?: boolean
    estatus?: boolean
    created_at?: boolean
    updated_at?: boolean
    movimientos?: boolean | PresupuestoAsignado$movimientosArgs<ExtArgs>
    programa_pagos?: boolean | PresupuestoAsignado$programa_pagosArgs<ExtArgs>
    _count?: boolean | PresupuestoAsignadoCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["presupuestoAsignado"]>

  export type PresupuestoAsignadoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_presupuesto?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    codigo?: boolean
    descripcion?: boolean
    monto_autorizado?: boolean
    monto_ejercido?: boolean
    monto_comprometido?: boolean
    monto_disponible?: boolean
    moneda?: boolean
    capitulo?: boolean
    estatus?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["presupuestoAsignado"]>

  export type PresupuestoAsignadoSelectScalar = {
    id_presupuesto?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    codigo?: boolean
    descripcion?: boolean
    monto_autorizado?: boolean
    monto_ejercido?: boolean
    monto_comprometido?: boolean
    monto_disponible?: boolean
    moneda?: boolean
    capitulo?: boolean
    estatus?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type PresupuestoAsignadoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    movimientos?: boolean | PresupuestoAsignado$movimientosArgs<ExtArgs>
    programa_pagos?: boolean | PresupuestoAsignado$programa_pagosArgs<ExtArgs>
    _count?: boolean | PresupuestoAsignadoCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type PresupuestoAsignadoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $PresupuestoAsignadoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PresupuestoAsignado"
    objects: {
      movimientos: Prisma.$MovimientoPresupuestalPayload<ExtArgs>[]
      programa_pagos: Prisma.$ProgramaPagosPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id_presupuesto: string
      tenant_id: string
      proyecto_id: string
      codigo: string
      descripcion: string
      monto_autorizado: Prisma.Decimal
      monto_ejercido: Prisma.Decimal
      monto_comprometido: Prisma.Decimal
      monto_disponible: Prisma.Decimal
      moneda: string
      capitulo: string
      estatus: string
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["presupuestoAsignado"]>
    composites: {}
  }

  type PresupuestoAsignadoGetPayload<S extends boolean | null | undefined | PresupuestoAsignadoDefaultArgs> = $Result.GetResult<Prisma.$PresupuestoAsignadoPayload, S>

  type PresupuestoAsignadoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PresupuestoAsignadoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PresupuestoAsignadoCountAggregateInputType | true
    }

  export interface PresupuestoAsignadoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PresupuestoAsignado'], meta: { name: 'PresupuestoAsignado' } }
    /**
     * Find zero or one PresupuestoAsignado that matches the filter.
     * @param {PresupuestoAsignadoFindUniqueArgs} args - Arguments to find a PresupuestoAsignado
     * @example
     * // Get one PresupuestoAsignado
     * const presupuestoAsignado = await prisma.presupuestoAsignado.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PresupuestoAsignadoFindUniqueArgs>(args: SelectSubset<T, PresupuestoAsignadoFindUniqueArgs<ExtArgs>>): Prisma__PresupuestoAsignadoClient<$Result.GetResult<Prisma.$PresupuestoAsignadoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one PresupuestoAsignado that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PresupuestoAsignadoFindUniqueOrThrowArgs} args - Arguments to find a PresupuestoAsignado
     * @example
     * // Get one PresupuestoAsignado
     * const presupuestoAsignado = await prisma.presupuestoAsignado.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PresupuestoAsignadoFindUniqueOrThrowArgs>(args: SelectSubset<T, PresupuestoAsignadoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PresupuestoAsignadoClient<$Result.GetResult<Prisma.$PresupuestoAsignadoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first PresupuestoAsignado that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PresupuestoAsignadoFindFirstArgs} args - Arguments to find a PresupuestoAsignado
     * @example
     * // Get one PresupuestoAsignado
     * const presupuestoAsignado = await prisma.presupuestoAsignado.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PresupuestoAsignadoFindFirstArgs>(args?: SelectSubset<T, PresupuestoAsignadoFindFirstArgs<ExtArgs>>): Prisma__PresupuestoAsignadoClient<$Result.GetResult<Prisma.$PresupuestoAsignadoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first PresupuestoAsignado that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PresupuestoAsignadoFindFirstOrThrowArgs} args - Arguments to find a PresupuestoAsignado
     * @example
     * // Get one PresupuestoAsignado
     * const presupuestoAsignado = await prisma.presupuestoAsignado.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PresupuestoAsignadoFindFirstOrThrowArgs>(args?: SelectSubset<T, PresupuestoAsignadoFindFirstOrThrowArgs<ExtArgs>>): Prisma__PresupuestoAsignadoClient<$Result.GetResult<Prisma.$PresupuestoAsignadoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more PresupuestoAsignados that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PresupuestoAsignadoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PresupuestoAsignados
     * const presupuestoAsignados = await prisma.presupuestoAsignado.findMany()
     * 
     * // Get first 10 PresupuestoAsignados
     * const presupuestoAsignados = await prisma.presupuestoAsignado.findMany({ take: 10 })
     * 
     * // Only select the `id_presupuesto`
     * const presupuestoAsignadoWithId_presupuestoOnly = await prisma.presupuestoAsignado.findMany({ select: { id_presupuesto: true } })
     * 
     */
    findMany<T extends PresupuestoAsignadoFindManyArgs>(args?: SelectSubset<T, PresupuestoAsignadoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PresupuestoAsignadoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a PresupuestoAsignado.
     * @param {PresupuestoAsignadoCreateArgs} args - Arguments to create a PresupuestoAsignado.
     * @example
     * // Create one PresupuestoAsignado
     * const PresupuestoAsignado = await prisma.presupuestoAsignado.create({
     *   data: {
     *     // ... data to create a PresupuestoAsignado
     *   }
     * })
     * 
     */
    create<T extends PresupuestoAsignadoCreateArgs>(args: SelectSubset<T, PresupuestoAsignadoCreateArgs<ExtArgs>>): Prisma__PresupuestoAsignadoClient<$Result.GetResult<Prisma.$PresupuestoAsignadoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many PresupuestoAsignados.
     * @param {PresupuestoAsignadoCreateManyArgs} args - Arguments to create many PresupuestoAsignados.
     * @example
     * // Create many PresupuestoAsignados
     * const presupuestoAsignado = await prisma.presupuestoAsignado.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PresupuestoAsignadoCreateManyArgs>(args?: SelectSubset<T, PresupuestoAsignadoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PresupuestoAsignados and returns the data saved in the database.
     * @param {PresupuestoAsignadoCreateManyAndReturnArgs} args - Arguments to create many PresupuestoAsignados.
     * @example
     * // Create many PresupuestoAsignados
     * const presupuestoAsignado = await prisma.presupuestoAsignado.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PresupuestoAsignados and only return the `id_presupuesto`
     * const presupuestoAsignadoWithId_presupuestoOnly = await prisma.presupuestoAsignado.createManyAndReturn({ 
     *   select: { id_presupuesto: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PresupuestoAsignadoCreateManyAndReturnArgs>(args?: SelectSubset<T, PresupuestoAsignadoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PresupuestoAsignadoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a PresupuestoAsignado.
     * @param {PresupuestoAsignadoDeleteArgs} args - Arguments to delete one PresupuestoAsignado.
     * @example
     * // Delete one PresupuestoAsignado
     * const PresupuestoAsignado = await prisma.presupuestoAsignado.delete({
     *   where: {
     *     // ... filter to delete one PresupuestoAsignado
     *   }
     * })
     * 
     */
    delete<T extends PresupuestoAsignadoDeleteArgs>(args: SelectSubset<T, PresupuestoAsignadoDeleteArgs<ExtArgs>>): Prisma__PresupuestoAsignadoClient<$Result.GetResult<Prisma.$PresupuestoAsignadoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one PresupuestoAsignado.
     * @param {PresupuestoAsignadoUpdateArgs} args - Arguments to update one PresupuestoAsignado.
     * @example
     * // Update one PresupuestoAsignado
     * const presupuestoAsignado = await prisma.presupuestoAsignado.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PresupuestoAsignadoUpdateArgs>(args: SelectSubset<T, PresupuestoAsignadoUpdateArgs<ExtArgs>>): Prisma__PresupuestoAsignadoClient<$Result.GetResult<Prisma.$PresupuestoAsignadoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more PresupuestoAsignados.
     * @param {PresupuestoAsignadoDeleteManyArgs} args - Arguments to filter PresupuestoAsignados to delete.
     * @example
     * // Delete a few PresupuestoAsignados
     * const { count } = await prisma.presupuestoAsignado.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PresupuestoAsignadoDeleteManyArgs>(args?: SelectSubset<T, PresupuestoAsignadoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PresupuestoAsignados.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PresupuestoAsignadoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PresupuestoAsignados
     * const presupuestoAsignado = await prisma.presupuestoAsignado.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PresupuestoAsignadoUpdateManyArgs>(args: SelectSubset<T, PresupuestoAsignadoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PresupuestoAsignado.
     * @param {PresupuestoAsignadoUpsertArgs} args - Arguments to update or create a PresupuestoAsignado.
     * @example
     * // Update or create a PresupuestoAsignado
     * const presupuestoAsignado = await prisma.presupuestoAsignado.upsert({
     *   create: {
     *     // ... data to create a PresupuestoAsignado
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PresupuestoAsignado we want to update
     *   }
     * })
     */
    upsert<T extends PresupuestoAsignadoUpsertArgs>(args: SelectSubset<T, PresupuestoAsignadoUpsertArgs<ExtArgs>>): Prisma__PresupuestoAsignadoClient<$Result.GetResult<Prisma.$PresupuestoAsignadoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of PresupuestoAsignados.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PresupuestoAsignadoCountArgs} args - Arguments to filter PresupuestoAsignados to count.
     * @example
     * // Count the number of PresupuestoAsignados
     * const count = await prisma.presupuestoAsignado.count({
     *   where: {
     *     // ... the filter for the PresupuestoAsignados we want to count
     *   }
     * })
    **/
    count<T extends PresupuestoAsignadoCountArgs>(
      args?: Subset<T, PresupuestoAsignadoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PresupuestoAsignadoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PresupuestoAsignado.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PresupuestoAsignadoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends PresupuestoAsignadoAggregateArgs>(args: Subset<T, PresupuestoAsignadoAggregateArgs>): Prisma.PrismaPromise<GetPresupuestoAsignadoAggregateType<T>>

    /**
     * Group by PresupuestoAsignado.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PresupuestoAsignadoGroupByArgs} args - Group by arguments.
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
      T extends PresupuestoAsignadoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PresupuestoAsignadoGroupByArgs['orderBy'] }
        : { orderBy?: PresupuestoAsignadoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, PresupuestoAsignadoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPresupuestoAsignadoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PresupuestoAsignado model
   */
  readonly fields: PresupuestoAsignadoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PresupuestoAsignado.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PresupuestoAsignadoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    movimientos<T extends PresupuestoAsignado$movimientosArgs<ExtArgs> = {}>(args?: Subset<T, PresupuestoAsignado$movimientosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MovimientoPresupuestalPayload<ExtArgs>, T, "findMany"> | Null>
    programa_pagos<T extends PresupuestoAsignado$programa_pagosArgs<ExtArgs> = {}>(args?: Subset<T, PresupuestoAsignado$programa_pagosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProgramaPagosPayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the PresupuestoAsignado model
   */ 
  interface PresupuestoAsignadoFieldRefs {
    readonly id_presupuesto: FieldRef<"PresupuestoAsignado", 'String'>
    readonly tenant_id: FieldRef<"PresupuestoAsignado", 'String'>
    readonly proyecto_id: FieldRef<"PresupuestoAsignado", 'String'>
    readonly codigo: FieldRef<"PresupuestoAsignado", 'String'>
    readonly descripcion: FieldRef<"PresupuestoAsignado", 'String'>
    readonly monto_autorizado: FieldRef<"PresupuestoAsignado", 'Decimal'>
    readonly monto_ejercido: FieldRef<"PresupuestoAsignado", 'Decimal'>
    readonly monto_comprometido: FieldRef<"PresupuestoAsignado", 'Decimal'>
    readonly monto_disponible: FieldRef<"PresupuestoAsignado", 'Decimal'>
    readonly moneda: FieldRef<"PresupuestoAsignado", 'String'>
    readonly capitulo: FieldRef<"PresupuestoAsignado", 'String'>
    readonly estatus: FieldRef<"PresupuestoAsignado", 'String'>
    readonly created_at: FieldRef<"PresupuestoAsignado", 'DateTime'>
    readonly updated_at: FieldRef<"PresupuestoAsignado", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PresupuestoAsignado findUnique
   */
  export type PresupuestoAsignadoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PresupuestoAsignado
     */
    select?: PresupuestoAsignadoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PresupuestoAsignadoInclude<ExtArgs> | null
    /**
     * Filter, which PresupuestoAsignado to fetch.
     */
    where: PresupuestoAsignadoWhereUniqueInput
  }

  /**
   * PresupuestoAsignado findUniqueOrThrow
   */
  export type PresupuestoAsignadoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PresupuestoAsignado
     */
    select?: PresupuestoAsignadoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PresupuestoAsignadoInclude<ExtArgs> | null
    /**
     * Filter, which PresupuestoAsignado to fetch.
     */
    where: PresupuestoAsignadoWhereUniqueInput
  }

  /**
   * PresupuestoAsignado findFirst
   */
  export type PresupuestoAsignadoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PresupuestoAsignado
     */
    select?: PresupuestoAsignadoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PresupuestoAsignadoInclude<ExtArgs> | null
    /**
     * Filter, which PresupuestoAsignado to fetch.
     */
    where?: PresupuestoAsignadoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PresupuestoAsignados to fetch.
     */
    orderBy?: PresupuestoAsignadoOrderByWithRelationInput | PresupuestoAsignadoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PresupuestoAsignados.
     */
    cursor?: PresupuestoAsignadoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PresupuestoAsignados from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PresupuestoAsignados.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PresupuestoAsignados.
     */
    distinct?: PresupuestoAsignadoScalarFieldEnum | PresupuestoAsignadoScalarFieldEnum[]
  }

  /**
   * PresupuestoAsignado findFirstOrThrow
   */
  export type PresupuestoAsignadoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PresupuestoAsignado
     */
    select?: PresupuestoAsignadoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PresupuestoAsignadoInclude<ExtArgs> | null
    /**
     * Filter, which PresupuestoAsignado to fetch.
     */
    where?: PresupuestoAsignadoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PresupuestoAsignados to fetch.
     */
    orderBy?: PresupuestoAsignadoOrderByWithRelationInput | PresupuestoAsignadoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PresupuestoAsignados.
     */
    cursor?: PresupuestoAsignadoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PresupuestoAsignados from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PresupuestoAsignados.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PresupuestoAsignados.
     */
    distinct?: PresupuestoAsignadoScalarFieldEnum | PresupuestoAsignadoScalarFieldEnum[]
  }

  /**
   * PresupuestoAsignado findMany
   */
  export type PresupuestoAsignadoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PresupuestoAsignado
     */
    select?: PresupuestoAsignadoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PresupuestoAsignadoInclude<ExtArgs> | null
    /**
     * Filter, which PresupuestoAsignados to fetch.
     */
    where?: PresupuestoAsignadoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PresupuestoAsignados to fetch.
     */
    orderBy?: PresupuestoAsignadoOrderByWithRelationInput | PresupuestoAsignadoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PresupuestoAsignados.
     */
    cursor?: PresupuestoAsignadoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PresupuestoAsignados from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PresupuestoAsignados.
     */
    skip?: number
    distinct?: PresupuestoAsignadoScalarFieldEnum | PresupuestoAsignadoScalarFieldEnum[]
  }

  /**
   * PresupuestoAsignado create
   */
  export type PresupuestoAsignadoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PresupuestoAsignado
     */
    select?: PresupuestoAsignadoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PresupuestoAsignadoInclude<ExtArgs> | null
    /**
     * The data needed to create a PresupuestoAsignado.
     */
    data: XOR<PresupuestoAsignadoCreateInput, PresupuestoAsignadoUncheckedCreateInput>
  }

  /**
   * PresupuestoAsignado createMany
   */
  export type PresupuestoAsignadoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PresupuestoAsignados.
     */
    data: PresupuestoAsignadoCreateManyInput | PresupuestoAsignadoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PresupuestoAsignado createManyAndReturn
   */
  export type PresupuestoAsignadoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PresupuestoAsignado
     */
    select?: PresupuestoAsignadoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many PresupuestoAsignados.
     */
    data: PresupuestoAsignadoCreateManyInput | PresupuestoAsignadoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PresupuestoAsignado update
   */
  export type PresupuestoAsignadoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PresupuestoAsignado
     */
    select?: PresupuestoAsignadoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PresupuestoAsignadoInclude<ExtArgs> | null
    /**
     * The data needed to update a PresupuestoAsignado.
     */
    data: XOR<PresupuestoAsignadoUpdateInput, PresupuestoAsignadoUncheckedUpdateInput>
    /**
     * Choose, which PresupuestoAsignado to update.
     */
    where: PresupuestoAsignadoWhereUniqueInput
  }

  /**
   * PresupuestoAsignado updateMany
   */
  export type PresupuestoAsignadoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PresupuestoAsignados.
     */
    data: XOR<PresupuestoAsignadoUpdateManyMutationInput, PresupuestoAsignadoUncheckedUpdateManyInput>
    /**
     * Filter which PresupuestoAsignados to update
     */
    where?: PresupuestoAsignadoWhereInput
  }

  /**
   * PresupuestoAsignado upsert
   */
  export type PresupuestoAsignadoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PresupuestoAsignado
     */
    select?: PresupuestoAsignadoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PresupuestoAsignadoInclude<ExtArgs> | null
    /**
     * The filter to search for the PresupuestoAsignado to update in case it exists.
     */
    where: PresupuestoAsignadoWhereUniqueInput
    /**
     * In case the PresupuestoAsignado found by the `where` argument doesn't exist, create a new PresupuestoAsignado with this data.
     */
    create: XOR<PresupuestoAsignadoCreateInput, PresupuestoAsignadoUncheckedCreateInput>
    /**
     * In case the PresupuestoAsignado was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PresupuestoAsignadoUpdateInput, PresupuestoAsignadoUncheckedUpdateInput>
  }

  /**
   * PresupuestoAsignado delete
   */
  export type PresupuestoAsignadoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PresupuestoAsignado
     */
    select?: PresupuestoAsignadoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PresupuestoAsignadoInclude<ExtArgs> | null
    /**
     * Filter which PresupuestoAsignado to delete.
     */
    where: PresupuestoAsignadoWhereUniqueInput
  }

  /**
   * PresupuestoAsignado deleteMany
   */
  export type PresupuestoAsignadoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PresupuestoAsignados to delete
     */
    where?: PresupuestoAsignadoWhereInput
  }

  /**
   * PresupuestoAsignado.movimientos
   */
  export type PresupuestoAsignado$movimientosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MovimientoPresupuestal
     */
    select?: MovimientoPresupuestalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MovimientoPresupuestalInclude<ExtArgs> | null
    where?: MovimientoPresupuestalWhereInput
    orderBy?: MovimientoPresupuestalOrderByWithRelationInput | MovimientoPresupuestalOrderByWithRelationInput[]
    cursor?: MovimientoPresupuestalWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MovimientoPresupuestalScalarFieldEnum | MovimientoPresupuestalScalarFieldEnum[]
  }

  /**
   * PresupuestoAsignado.programa_pagos
   */
  export type PresupuestoAsignado$programa_pagosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProgramaPagos
     */
    select?: ProgramaPagosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProgramaPagosInclude<ExtArgs> | null
    where?: ProgramaPagosWhereInput
    orderBy?: ProgramaPagosOrderByWithRelationInput | ProgramaPagosOrderByWithRelationInput[]
    cursor?: ProgramaPagosWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ProgramaPagosScalarFieldEnum | ProgramaPagosScalarFieldEnum[]
  }

  /**
   * PresupuestoAsignado without action
   */
  export type PresupuestoAsignadoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PresupuestoAsignado
     */
    select?: PresupuestoAsignadoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PresupuestoAsignadoInclude<ExtArgs> | null
  }


  /**
   * Model MovimientoPresupuestal
   */

  export type AggregateMovimientoPresupuestal = {
    _count: MovimientoPresupuestalCountAggregateOutputType | null
    _avg: MovimientoPresupuestalAvgAggregateOutputType | null
    _sum: MovimientoPresupuestalSumAggregateOutputType | null
    _min: MovimientoPresupuestalMinAggregateOutputType | null
    _max: MovimientoPresupuestalMaxAggregateOutputType | null
  }

  export type MovimientoPresupuestalAvgAggregateOutputType = {
    monto: Decimal | null
  }

  export type MovimientoPresupuestalSumAggregateOutputType = {
    monto: Decimal | null
  }

  export type MovimientoPresupuestalMinAggregateOutputType = {
    id_movimiento: string | null
    tenant_id: string | null
    proyecto_id: string | null
    presupuesto_id: string | null
    tipo: string | null
    concepto: string | null
    monto: Decimal | null
    moneda: string | null
    referencia_modulo: string | null
    referencia_entidad: string | null
    referencia_id: string | null
    referencia_codigo: string | null
    usuario_id: string | null
    fecha_registro: Date | null
    notas: string | null
  }

  export type MovimientoPresupuestalMaxAggregateOutputType = {
    id_movimiento: string | null
    tenant_id: string | null
    proyecto_id: string | null
    presupuesto_id: string | null
    tipo: string | null
    concepto: string | null
    monto: Decimal | null
    moneda: string | null
    referencia_modulo: string | null
    referencia_entidad: string | null
    referencia_id: string | null
    referencia_codigo: string | null
    usuario_id: string | null
    fecha_registro: Date | null
    notas: string | null
  }

  export type MovimientoPresupuestalCountAggregateOutputType = {
    id_movimiento: number
    tenant_id: number
    proyecto_id: number
    presupuesto_id: number
    tipo: number
    concepto: number
    monto: number
    moneda: number
    referencia_modulo: number
    referencia_entidad: number
    referencia_id: number
    referencia_codigo: number
    usuario_id: number
    fecha_registro: number
    notas: number
    _all: number
  }


  export type MovimientoPresupuestalAvgAggregateInputType = {
    monto?: true
  }

  export type MovimientoPresupuestalSumAggregateInputType = {
    monto?: true
  }

  export type MovimientoPresupuestalMinAggregateInputType = {
    id_movimiento?: true
    tenant_id?: true
    proyecto_id?: true
    presupuesto_id?: true
    tipo?: true
    concepto?: true
    monto?: true
    moneda?: true
    referencia_modulo?: true
    referencia_entidad?: true
    referencia_id?: true
    referencia_codigo?: true
    usuario_id?: true
    fecha_registro?: true
    notas?: true
  }

  export type MovimientoPresupuestalMaxAggregateInputType = {
    id_movimiento?: true
    tenant_id?: true
    proyecto_id?: true
    presupuesto_id?: true
    tipo?: true
    concepto?: true
    monto?: true
    moneda?: true
    referencia_modulo?: true
    referencia_entidad?: true
    referencia_id?: true
    referencia_codigo?: true
    usuario_id?: true
    fecha_registro?: true
    notas?: true
  }

  export type MovimientoPresupuestalCountAggregateInputType = {
    id_movimiento?: true
    tenant_id?: true
    proyecto_id?: true
    presupuesto_id?: true
    tipo?: true
    concepto?: true
    monto?: true
    moneda?: true
    referencia_modulo?: true
    referencia_entidad?: true
    referencia_id?: true
    referencia_codigo?: true
    usuario_id?: true
    fecha_registro?: true
    notas?: true
    _all?: true
  }

  export type MovimientoPresupuestalAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MovimientoPresupuestal to aggregate.
     */
    where?: MovimientoPresupuestalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MovimientoPresupuestals to fetch.
     */
    orderBy?: MovimientoPresupuestalOrderByWithRelationInput | MovimientoPresupuestalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MovimientoPresupuestalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MovimientoPresupuestals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MovimientoPresupuestals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MovimientoPresupuestals
    **/
    _count?: true | MovimientoPresupuestalCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: MovimientoPresupuestalAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: MovimientoPresupuestalSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MovimientoPresupuestalMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MovimientoPresupuestalMaxAggregateInputType
  }

  export type GetMovimientoPresupuestalAggregateType<T extends MovimientoPresupuestalAggregateArgs> = {
        [P in keyof T & keyof AggregateMovimientoPresupuestal]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMovimientoPresupuestal[P]>
      : GetScalarType<T[P], AggregateMovimientoPresupuestal[P]>
  }




  export type MovimientoPresupuestalGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MovimientoPresupuestalWhereInput
    orderBy?: MovimientoPresupuestalOrderByWithAggregationInput | MovimientoPresupuestalOrderByWithAggregationInput[]
    by: MovimientoPresupuestalScalarFieldEnum[] | MovimientoPresupuestalScalarFieldEnum
    having?: MovimientoPresupuestalScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MovimientoPresupuestalCountAggregateInputType | true
    _avg?: MovimientoPresupuestalAvgAggregateInputType
    _sum?: MovimientoPresupuestalSumAggregateInputType
    _min?: MovimientoPresupuestalMinAggregateInputType
    _max?: MovimientoPresupuestalMaxAggregateInputType
  }

  export type MovimientoPresupuestalGroupByOutputType = {
    id_movimiento: string
    tenant_id: string
    proyecto_id: string
    presupuesto_id: string
    tipo: string
    concepto: string
    monto: Decimal
    moneda: string
    referencia_modulo: string | null
    referencia_entidad: string | null
    referencia_id: string | null
    referencia_codigo: string | null
    usuario_id: string
    fecha_registro: Date
    notas: string | null
    _count: MovimientoPresupuestalCountAggregateOutputType | null
    _avg: MovimientoPresupuestalAvgAggregateOutputType | null
    _sum: MovimientoPresupuestalSumAggregateOutputType | null
    _min: MovimientoPresupuestalMinAggregateOutputType | null
    _max: MovimientoPresupuestalMaxAggregateOutputType | null
  }

  type GetMovimientoPresupuestalGroupByPayload<T extends MovimientoPresupuestalGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MovimientoPresupuestalGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MovimientoPresupuestalGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MovimientoPresupuestalGroupByOutputType[P]>
            : GetScalarType<T[P], MovimientoPresupuestalGroupByOutputType[P]>
        }
      >
    >


  export type MovimientoPresupuestalSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_movimiento?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    presupuesto_id?: boolean
    tipo?: boolean
    concepto?: boolean
    monto?: boolean
    moneda?: boolean
    referencia_modulo?: boolean
    referencia_entidad?: boolean
    referencia_id?: boolean
    referencia_codigo?: boolean
    usuario_id?: boolean
    fecha_registro?: boolean
    notas?: boolean
    presupuesto?: boolean | PresupuestoAsignadoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["movimientoPresupuestal"]>

  export type MovimientoPresupuestalSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_movimiento?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    presupuesto_id?: boolean
    tipo?: boolean
    concepto?: boolean
    monto?: boolean
    moneda?: boolean
    referencia_modulo?: boolean
    referencia_entidad?: boolean
    referencia_id?: boolean
    referencia_codigo?: boolean
    usuario_id?: boolean
    fecha_registro?: boolean
    notas?: boolean
    presupuesto?: boolean | PresupuestoAsignadoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["movimientoPresupuestal"]>

  export type MovimientoPresupuestalSelectScalar = {
    id_movimiento?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    presupuesto_id?: boolean
    tipo?: boolean
    concepto?: boolean
    monto?: boolean
    moneda?: boolean
    referencia_modulo?: boolean
    referencia_entidad?: boolean
    referencia_id?: boolean
    referencia_codigo?: boolean
    usuario_id?: boolean
    fecha_registro?: boolean
    notas?: boolean
  }

  export type MovimientoPresupuestalInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    presupuesto?: boolean | PresupuestoAsignadoDefaultArgs<ExtArgs>
  }
  export type MovimientoPresupuestalIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    presupuesto?: boolean | PresupuestoAsignadoDefaultArgs<ExtArgs>
  }

  export type $MovimientoPresupuestalPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MovimientoPresupuestal"
    objects: {
      presupuesto: Prisma.$PresupuestoAsignadoPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id_movimiento: string
      tenant_id: string
      proyecto_id: string
      presupuesto_id: string
      tipo: string
      concepto: string
      monto: Prisma.Decimal
      moneda: string
      referencia_modulo: string | null
      referencia_entidad: string | null
      referencia_id: string | null
      referencia_codigo: string | null
      usuario_id: string
      fecha_registro: Date
      notas: string | null
    }, ExtArgs["result"]["movimientoPresupuestal"]>
    composites: {}
  }

  type MovimientoPresupuestalGetPayload<S extends boolean | null | undefined | MovimientoPresupuestalDefaultArgs> = $Result.GetResult<Prisma.$MovimientoPresupuestalPayload, S>

  type MovimientoPresupuestalCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<MovimientoPresupuestalFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: MovimientoPresupuestalCountAggregateInputType | true
    }

  export interface MovimientoPresupuestalDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MovimientoPresupuestal'], meta: { name: 'MovimientoPresupuestal' } }
    /**
     * Find zero or one MovimientoPresupuestal that matches the filter.
     * @param {MovimientoPresupuestalFindUniqueArgs} args - Arguments to find a MovimientoPresupuestal
     * @example
     * // Get one MovimientoPresupuestal
     * const movimientoPresupuestal = await prisma.movimientoPresupuestal.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MovimientoPresupuestalFindUniqueArgs>(args: SelectSubset<T, MovimientoPresupuestalFindUniqueArgs<ExtArgs>>): Prisma__MovimientoPresupuestalClient<$Result.GetResult<Prisma.$MovimientoPresupuestalPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one MovimientoPresupuestal that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {MovimientoPresupuestalFindUniqueOrThrowArgs} args - Arguments to find a MovimientoPresupuestal
     * @example
     * // Get one MovimientoPresupuestal
     * const movimientoPresupuestal = await prisma.movimientoPresupuestal.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MovimientoPresupuestalFindUniqueOrThrowArgs>(args: SelectSubset<T, MovimientoPresupuestalFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MovimientoPresupuestalClient<$Result.GetResult<Prisma.$MovimientoPresupuestalPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first MovimientoPresupuestal that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MovimientoPresupuestalFindFirstArgs} args - Arguments to find a MovimientoPresupuestal
     * @example
     * // Get one MovimientoPresupuestal
     * const movimientoPresupuestal = await prisma.movimientoPresupuestal.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MovimientoPresupuestalFindFirstArgs>(args?: SelectSubset<T, MovimientoPresupuestalFindFirstArgs<ExtArgs>>): Prisma__MovimientoPresupuestalClient<$Result.GetResult<Prisma.$MovimientoPresupuestalPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first MovimientoPresupuestal that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MovimientoPresupuestalFindFirstOrThrowArgs} args - Arguments to find a MovimientoPresupuestal
     * @example
     * // Get one MovimientoPresupuestal
     * const movimientoPresupuestal = await prisma.movimientoPresupuestal.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MovimientoPresupuestalFindFirstOrThrowArgs>(args?: SelectSubset<T, MovimientoPresupuestalFindFirstOrThrowArgs<ExtArgs>>): Prisma__MovimientoPresupuestalClient<$Result.GetResult<Prisma.$MovimientoPresupuestalPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more MovimientoPresupuestals that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MovimientoPresupuestalFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MovimientoPresupuestals
     * const movimientoPresupuestals = await prisma.movimientoPresupuestal.findMany()
     * 
     * // Get first 10 MovimientoPresupuestals
     * const movimientoPresupuestals = await prisma.movimientoPresupuestal.findMany({ take: 10 })
     * 
     * // Only select the `id_movimiento`
     * const movimientoPresupuestalWithId_movimientoOnly = await prisma.movimientoPresupuestal.findMany({ select: { id_movimiento: true } })
     * 
     */
    findMany<T extends MovimientoPresupuestalFindManyArgs>(args?: SelectSubset<T, MovimientoPresupuestalFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MovimientoPresupuestalPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a MovimientoPresupuestal.
     * @param {MovimientoPresupuestalCreateArgs} args - Arguments to create a MovimientoPresupuestal.
     * @example
     * // Create one MovimientoPresupuestal
     * const MovimientoPresupuestal = await prisma.movimientoPresupuestal.create({
     *   data: {
     *     // ... data to create a MovimientoPresupuestal
     *   }
     * })
     * 
     */
    create<T extends MovimientoPresupuestalCreateArgs>(args: SelectSubset<T, MovimientoPresupuestalCreateArgs<ExtArgs>>): Prisma__MovimientoPresupuestalClient<$Result.GetResult<Prisma.$MovimientoPresupuestalPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many MovimientoPresupuestals.
     * @param {MovimientoPresupuestalCreateManyArgs} args - Arguments to create many MovimientoPresupuestals.
     * @example
     * // Create many MovimientoPresupuestals
     * const movimientoPresupuestal = await prisma.movimientoPresupuestal.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MovimientoPresupuestalCreateManyArgs>(args?: SelectSubset<T, MovimientoPresupuestalCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MovimientoPresupuestals and returns the data saved in the database.
     * @param {MovimientoPresupuestalCreateManyAndReturnArgs} args - Arguments to create many MovimientoPresupuestals.
     * @example
     * // Create many MovimientoPresupuestals
     * const movimientoPresupuestal = await prisma.movimientoPresupuestal.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MovimientoPresupuestals and only return the `id_movimiento`
     * const movimientoPresupuestalWithId_movimientoOnly = await prisma.movimientoPresupuestal.createManyAndReturn({ 
     *   select: { id_movimiento: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MovimientoPresupuestalCreateManyAndReturnArgs>(args?: SelectSubset<T, MovimientoPresupuestalCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MovimientoPresupuestalPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a MovimientoPresupuestal.
     * @param {MovimientoPresupuestalDeleteArgs} args - Arguments to delete one MovimientoPresupuestal.
     * @example
     * // Delete one MovimientoPresupuestal
     * const MovimientoPresupuestal = await prisma.movimientoPresupuestal.delete({
     *   where: {
     *     // ... filter to delete one MovimientoPresupuestal
     *   }
     * })
     * 
     */
    delete<T extends MovimientoPresupuestalDeleteArgs>(args: SelectSubset<T, MovimientoPresupuestalDeleteArgs<ExtArgs>>): Prisma__MovimientoPresupuestalClient<$Result.GetResult<Prisma.$MovimientoPresupuestalPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one MovimientoPresupuestal.
     * @param {MovimientoPresupuestalUpdateArgs} args - Arguments to update one MovimientoPresupuestal.
     * @example
     * // Update one MovimientoPresupuestal
     * const movimientoPresupuestal = await prisma.movimientoPresupuestal.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MovimientoPresupuestalUpdateArgs>(args: SelectSubset<T, MovimientoPresupuestalUpdateArgs<ExtArgs>>): Prisma__MovimientoPresupuestalClient<$Result.GetResult<Prisma.$MovimientoPresupuestalPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more MovimientoPresupuestals.
     * @param {MovimientoPresupuestalDeleteManyArgs} args - Arguments to filter MovimientoPresupuestals to delete.
     * @example
     * // Delete a few MovimientoPresupuestals
     * const { count } = await prisma.movimientoPresupuestal.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MovimientoPresupuestalDeleteManyArgs>(args?: SelectSubset<T, MovimientoPresupuestalDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MovimientoPresupuestals.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MovimientoPresupuestalUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MovimientoPresupuestals
     * const movimientoPresupuestal = await prisma.movimientoPresupuestal.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MovimientoPresupuestalUpdateManyArgs>(args: SelectSubset<T, MovimientoPresupuestalUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one MovimientoPresupuestal.
     * @param {MovimientoPresupuestalUpsertArgs} args - Arguments to update or create a MovimientoPresupuestal.
     * @example
     * // Update or create a MovimientoPresupuestal
     * const movimientoPresupuestal = await prisma.movimientoPresupuestal.upsert({
     *   create: {
     *     // ... data to create a MovimientoPresupuestal
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MovimientoPresupuestal we want to update
     *   }
     * })
     */
    upsert<T extends MovimientoPresupuestalUpsertArgs>(args: SelectSubset<T, MovimientoPresupuestalUpsertArgs<ExtArgs>>): Prisma__MovimientoPresupuestalClient<$Result.GetResult<Prisma.$MovimientoPresupuestalPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of MovimientoPresupuestals.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MovimientoPresupuestalCountArgs} args - Arguments to filter MovimientoPresupuestals to count.
     * @example
     * // Count the number of MovimientoPresupuestals
     * const count = await prisma.movimientoPresupuestal.count({
     *   where: {
     *     // ... the filter for the MovimientoPresupuestals we want to count
     *   }
     * })
    **/
    count<T extends MovimientoPresupuestalCountArgs>(
      args?: Subset<T, MovimientoPresupuestalCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MovimientoPresupuestalCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MovimientoPresupuestal.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MovimientoPresupuestalAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends MovimientoPresupuestalAggregateArgs>(args: Subset<T, MovimientoPresupuestalAggregateArgs>): Prisma.PrismaPromise<GetMovimientoPresupuestalAggregateType<T>>

    /**
     * Group by MovimientoPresupuestal.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MovimientoPresupuestalGroupByArgs} args - Group by arguments.
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
      T extends MovimientoPresupuestalGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MovimientoPresupuestalGroupByArgs['orderBy'] }
        : { orderBy?: MovimientoPresupuestalGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, MovimientoPresupuestalGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMovimientoPresupuestalGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MovimientoPresupuestal model
   */
  readonly fields: MovimientoPresupuestalFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MovimientoPresupuestal.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MovimientoPresupuestalClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    presupuesto<T extends PresupuestoAsignadoDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PresupuestoAsignadoDefaultArgs<ExtArgs>>): Prisma__PresupuestoAsignadoClient<$Result.GetResult<Prisma.$PresupuestoAsignadoPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
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
   * Fields of the MovimientoPresupuestal model
   */ 
  interface MovimientoPresupuestalFieldRefs {
    readonly id_movimiento: FieldRef<"MovimientoPresupuestal", 'String'>
    readonly tenant_id: FieldRef<"MovimientoPresupuestal", 'String'>
    readonly proyecto_id: FieldRef<"MovimientoPresupuestal", 'String'>
    readonly presupuesto_id: FieldRef<"MovimientoPresupuestal", 'String'>
    readonly tipo: FieldRef<"MovimientoPresupuestal", 'String'>
    readonly concepto: FieldRef<"MovimientoPresupuestal", 'String'>
    readonly monto: FieldRef<"MovimientoPresupuestal", 'Decimal'>
    readonly moneda: FieldRef<"MovimientoPresupuestal", 'String'>
    readonly referencia_modulo: FieldRef<"MovimientoPresupuestal", 'String'>
    readonly referencia_entidad: FieldRef<"MovimientoPresupuestal", 'String'>
    readonly referencia_id: FieldRef<"MovimientoPresupuestal", 'String'>
    readonly referencia_codigo: FieldRef<"MovimientoPresupuestal", 'String'>
    readonly usuario_id: FieldRef<"MovimientoPresupuestal", 'String'>
    readonly fecha_registro: FieldRef<"MovimientoPresupuestal", 'DateTime'>
    readonly notas: FieldRef<"MovimientoPresupuestal", 'String'>
  }
    

  // Custom InputTypes
  /**
   * MovimientoPresupuestal findUnique
   */
  export type MovimientoPresupuestalFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MovimientoPresupuestal
     */
    select?: MovimientoPresupuestalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MovimientoPresupuestalInclude<ExtArgs> | null
    /**
     * Filter, which MovimientoPresupuestal to fetch.
     */
    where: MovimientoPresupuestalWhereUniqueInput
  }

  /**
   * MovimientoPresupuestal findUniqueOrThrow
   */
  export type MovimientoPresupuestalFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MovimientoPresupuestal
     */
    select?: MovimientoPresupuestalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MovimientoPresupuestalInclude<ExtArgs> | null
    /**
     * Filter, which MovimientoPresupuestal to fetch.
     */
    where: MovimientoPresupuestalWhereUniqueInput
  }

  /**
   * MovimientoPresupuestal findFirst
   */
  export type MovimientoPresupuestalFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MovimientoPresupuestal
     */
    select?: MovimientoPresupuestalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MovimientoPresupuestalInclude<ExtArgs> | null
    /**
     * Filter, which MovimientoPresupuestal to fetch.
     */
    where?: MovimientoPresupuestalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MovimientoPresupuestals to fetch.
     */
    orderBy?: MovimientoPresupuestalOrderByWithRelationInput | MovimientoPresupuestalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MovimientoPresupuestals.
     */
    cursor?: MovimientoPresupuestalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MovimientoPresupuestals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MovimientoPresupuestals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MovimientoPresupuestals.
     */
    distinct?: MovimientoPresupuestalScalarFieldEnum | MovimientoPresupuestalScalarFieldEnum[]
  }

  /**
   * MovimientoPresupuestal findFirstOrThrow
   */
  export type MovimientoPresupuestalFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MovimientoPresupuestal
     */
    select?: MovimientoPresupuestalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MovimientoPresupuestalInclude<ExtArgs> | null
    /**
     * Filter, which MovimientoPresupuestal to fetch.
     */
    where?: MovimientoPresupuestalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MovimientoPresupuestals to fetch.
     */
    orderBy?: MovimientoPresupuestalOrderByWithRelationInput | MovimientoPresupuestalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MovimientoPresupuestals.
     */
    cursor?: MovimientoPresupuestalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MovimientoPresupuestals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MovimientoPresupuestals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MovimientoPresupuestals.
     */
    distinct?: MovimientoPresupuestalScalarFieldEnum | MovimientoPresupuestalScalarFieldEnum[]
  }

  /**
   * MovimientoPresupuestal findMany
   */
  export type MovimientoPresupuestalFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MovimientoPresupuestal
     */
    select?: MovimientoPresupuestalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MovimientoPresupuestalInclude<ExtArgs> | null
    /**
     * Filter, which MovimientoPresupuestals to fetch.
     */
    where?: MovimientoPresupuestalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MovimientoPresupuestals to fetch.
     */
    orderBy?: MovimientoPresupuestalOrderByWithRelationInput | MovimientoPresupuestalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MovimientoPresupuestals.
     */
    cursor?: MovimientoPresupuestalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MovimientoPresupuestals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MovimientoPresupuestals.
     */
    skip?: number
    distinct?: MovimientoPresupuestalScalarFieldEnum | MovimientoPresupuestalScalarFieldEnum[]
  }

  /**
   * MovimientoPresupuestal create
   */
  export type MovimientoPresupuestalCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MovimientoPresupuestal
     */
    select?: MovimientoPresupuestalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MovimientoPresupuestalInclude<ExtArgs> | null
    /**
     * The data needed to create a MovimientoPresupuestal.
     */
    data: XOR<MovimientoPresupuestalCreateInput, MovimientoPresupuestalUncheckedCreateInput>
  }

  /**
   * MovimientoPresupuestal createMany
   */
  export type MovimientoPresupuestalCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MovimientoPresupuestals.
     */
    data: MovimientoPresupuestalCreateManyInput | MovimientoPresupuestalCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MovimientoPresupuestal createManyAndReturn
   */
  export type MovimientoPresupuestalCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MovimientoPresupuestal
     */
    select?: MovimientoPresupuestalSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many MovimientoPresupuestals.
     */
    data: MovimientoPresupuestalCreateManyInput | MovimientoPresupuestalCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MovimientoPresupuestalIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * MovimientoPresupuestal update
   */
  export type MovimientoPresupuestalUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MovimientoPresupuestal
     */
    select?: MovimientoPresupuestalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MovimientoPresupuestalInclude<ExtArgs> | null
    /**
     * The data needed to update a MovimientoPresupuestal.
     */
    data: XOR<MovimientoPresupuestalUpdateInput, MovimientoPresupuestalUncheckedUpdateInput>
    /**
     * Choose, which MovimientoPresupuestal to update.
     */
    where: MovimientoPresupuestalWhereUniqueInput
  }

  /**
   * MovimientoPresupuestal updateMany
   */
  export type MovimientoPresupuestalUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MovimientoPresupuestals.
     */
    data: XOR<MovimientoPresupuestalUpdateManyMutationInput, MovimientoPresupuestalUncheckedUpdateManyInput>
    /**
     * Filter which MovimientoPresupuestals to update
     */
    where?: MovimientoPresupuestalWhereInput
  }

  /**
   * MovimientoPresupuestal upsert
   */
  export type MovimientoPresupuestalUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MovimientoPresupuestal
     */
    select?: MovimientoPresupuestalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MovimientoPresupuestalInclude<ExtArgs> | null
    /**
     * The filter to search for the MovimientoPresupuestal to update in case it exists.
     */
    where: MovimientoPresupuestalWhereUniqueInput
    /**
     * In case the MovimientoPresupuestal found by the `where` argument doesn't exist, create a new MovimientoPresupuestal with this data.
     */
    create: XOR<MovimientoPresupuestalCreateInput, MovimientoPresupuestalUncheckedCreateInput>
    /**
     * In case the MovimientoPresupuestal was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MovimientoPresupuestalUpdateInput, MovimientoPresupuestalUncheckedUpdateInput>
  }

  /**
   * MovimientoPresupuestal delete
   */
  export type MovimientoPresupuestalDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MovimientoPresupuestal
     */
    select?: MovimientoPresupuestalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MovimientoPresupuestalInclude<ExtArgs> | null
    /**
     * Filter which MovimientoPresupuestal to delete.
     */
    where: MovimientoPresupuestalWhereUniqueInput
  }

  /**
   * MovimientoPresupuestal deleteMany
   */
  export type MovimientoPresupuestalDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MovimientoPresupuestals to delete
     */
    where?: MovimientoPresupuestalWhereInput
  }

  /**
   * MovimientoPresupuestal without action
   */
  export type MovimientoPresupuestalDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MovimientoPresupuestal
     */
    select?: MovimientoPresupuestalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MovimientoPresupuestalInclude<ExtArgs> | null
  }


  /**
   * Model ProgramaPagos
   */

  export type AggregateProgramaPagos = {
    _count: ProgramaPagosCountAggregateOutputType | null
    _avg: ProgramaPagosAvgAggregateOutputType | null
    _sum: ProgramaPagosSumAggregateOutputType | null
    _min: ProgramaPagosMinAggregateOutputType | null
    _max: ProgramaPagosMaxAggregateOutputType | null
  }

  export type ProgramaPagosAvgAggregateOutputType = {
    monto_programado: Decimal | null
    monto_pagado: Decimal | null
  }

  export type ProgramaPagosSumAggregateOutputType = {
    monto_programado: Decimal | null
    monto_pagado: Decimal | null
  }

  export type ProgramaPagosMinAggregateOutputType = {
    id_pago: string | null
    tenant_id: string | null
    proyecto_id: string | null
    presupuesto_id: string | null
    concepto: string | null
    beneficiario: string | null
    beneficiario_id: string | null
    monto_programado: Decimal | null
    monto_pagado: Decimal | null
    moneda: string | null
    fecha_programada: Date | null
    fecha_pago_real: Date | null
    estado: string | null
    referencia_modulo: string | null
    referencia_entidad: string | null
    referencia_id: string | null
    metodo_pago: string | null
    banco: string | null
    referencia_bancaria: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type ProgramaPagosMaxAggregateOutputType = {
    id_pago: string | null
    tenant_id: string | null
    proyecto_id: string | null
    presupuesto_id: string | null
    concepto: string | null
    beneficiario: string | null
    beneficiario_id: string | null
    monto_programado: Decimal | null
    monto_pagado: Decimal | null
    moneda: string | null
    fecha_programada: Date | null
    fecha_pago_real: Date | null
    estado: string | null
    referencia_modulo: string | null
    referencia_entidad: string | null
    referencia_id: string | null
    metodo_pago: string | null
    banco: string | null
    referencia_bancaria: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type ProgramaPagosCountAggregateOutputType = {
    id_pago: number
    tenant_id: number
    proyecto_id: number
    presupuesto_id: number
    concepto: number
    beneficiario: number
    beneficiario_id: number
    monto_programado: number
    monto_pagado: number
    moneda: number
    fecha_programada: number
    fecha_pago_real: number
    estado: number
    referencia_modulo: number
    referencia_entidad: number
    referencia_id: number
    metodo_pago: number
    banco: number
    referencia_bancaria: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type ProgramaPagosAvgAggregateInputType = {
    monto_programado?: true
    monto_pagado?: true
  }

  export type ProgramaPagosSumAggregateInputType = {
    monto_programado?: true
    monto_pagado?: true
  }

  export type ProgramaPagosMinAggregateInputType = {
    id_pago?: true
    tenant_id?: true
    proyecto_id?: true
    presupuesto_id?: true
    concepto?: true
    beneficiario?: true
    beneficiario_id?: true
    monto_programado?: true
    monto_pagado?: true
    moneda?: true
    fecha_programada?: true
    fecha_pago_real?: true
    estado?: true
    referencia_modulo?: true
    referencia_entidad?: true
    referencia_id?: true
    metodo_pago?: true
    banco?: true
    referencia_bancaria?: true
    created_at?: true
    updated_at?: true
  }

  export type ProgramaPagosMaxAggregateInputType = {
    id_pago?: true
    tenant_id?: true
    proyecto_id?: true
    presupuesto_id?: true
    concepto?: true
    beneficiario?: true
    beneficiario_id?: true
    monto_programado?: true
    monto_pagado?: true
    moneda?: true
    fecha_programada?: true
    fecha_pago_real?: true
    estado?: true
    referencia_modulo?: true
    referencia_entidad?: true
    referencia_id?: true
    metodo_pago?: true
    banco?: true
    referencia_bancaria?: true
    created_at?: true
    updated_at?: true
  }

  export type ProgramaPagosCountAggregateInputType = {
    id_pago?: true
    tenant_id?: true
    proyecto_id?: true
    presupuesto_id?: true
    concepto?: true
    beneficiario?: true
    beneficiario_id?: true
    monto_programado?: true
    monto_pagado?: true
    moneda?: true
    fecha_programada?: true
    fecha_pago_real?: true
    estado?: true
    referencia_modulo?: true
    referencia_entidad?: true
    referencia_id?: true
    metodo_pago?: true
    banco?: true
    referencia_bancaria?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type ProgramaPagosAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProgramaPagos to aggregate.
     */
    where?: ProgramaPagosWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProgramaPagos to fetch.
     */
    orderBy?: ProgramaPagosOrderByWithRelationInput | ProgramaPagosOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProgramaPagosWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProgramaPagos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProgramaPagos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ProgramaPagos
    **/
    _count?: true | ProgramaPagosCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ProgramaPagosAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ProgramaPagosSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProgramaPagosMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProgramaPagosMaxAggregateInputType
  }

  export type GetProgramaPagosAggregateType<T extends ProgramaPagosAggregateArgs> = {
        [P in keyof T & keyof AggregateProgramaPagos]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProgramaPagos[P]>
      : GetScalarType<T[P], AggregateProgramaPagos[P]>
  }




  export type ProgramaPagosGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProgramaPagosWhereInput
    orderBy?: ProgramaPagosOrderByWithAggregationInput | ProgramaPagosOrderByWithAggregationInput[]
    by: ProgramaPagosScalarFieldEnum[] | ProgramaPagosScalarFieldEnum
    having?: ProgramaPagosScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProgramaPagosCountAggregateInputType | true
    _avg?: ProgramaPagosAvgAggregateInputType
    _sum?: ProgramaPagosSumAggregateInputType
    _min?: ProgramaPagosMinAggregateInputType
    _max?: ProgramaPagosMaxAggregateInputType
  }

  export type ProgramaPagosGroupByOutputType = {
    id_pago: string
    tenant_id: string
    proyecto_id: string
    presupuesto_id: string
    concepto: string
    beneficiario: string
    beneficiario_id: string | null
    monto_programado: Decimal
    monto_pagado: Decimal
    moneda: string
    fecha_programada: Date
    fecha_pago_real: Date | null
    estado: string
    referencia_modulo: string | null
    referencia_entidad: string | null
    referencia_id: string | null
    metodo_pago: string | null
    banco: string | null
    referencia_bancaria: string | null
    created_at: Date
    updated_at: Date
    _count: ProgramaPagosCountAggregateOutputType | null
    _avg: ProgramaPagosAvgAggregateOutputType | null
    _sum: ProgramaPagosSumAggregateOutputType | null
    _min: ProgramaPagosMinAggregateOutputType | null
    _max: ProgramaPagosMaxAggregateOutputType | null
  }

  type GetProgramaPagosGroupByPayload<T extends ProgramaPagosGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProgramaPagosGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProgramaPagosGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProgramaPagosGroupByOutputType[P]>
            : GetScalarType<T[P], ProgramaPagosGroupByOutputType[P]>
        }
      >
    >


  export type ProgramaPagosSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_pago?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    presupuesto_id?: boolean
    concepto?: boolean
    beneficiario?: boolean
    beneficiario_id?: boolean
    monto_programado?: boolean
    monto_pagado?: boolean
    moneda?: boolean
    fecha_programada?: boolean
    fecha_pago_real?: boolean
    estado?: boolean
    referencia_modulo?: boolean
    referencia_entidad?: boolean
    referencia_id?: boolean
    metodo_pago?: boolean
    banco?: boolean
    referencia_bancaria?: boolean
    created_at?: boolean
    updated_at?: boolean
    presupuesto?: boolean | PresupuestoAsignadoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["programaPagos"]>

  export type ProgramaPagosSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_pago?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    presupuesto_id?: boolean
    concepto?: boolean
    beneficiario?: boolean
    beneficiario_id?: boolean
    monto_programado?: boolean
    monto_pagado?: boolean
    moneda?: boolean
    fecha_programada?: boolean
    fecha_pago_real?: boolean
    estado?: boolean
    referencia_modulo?: boolean
    referencia_entidad?: boolean
    referencia_id?: boolean
    metodo_pago?: boolean
    banco?: boolean
    referencia_bancaria?: boolean
    created_at?: boolean
    updated_at?: boolean
    presupuesto?: boolean | PresupuestoAsignadoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["programaPagos"]>

  export type ProgramaPagosSelectScalar = {
    id_pago?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    presupuesto_id?: boolean
    concepto?: boolean
    beneficiario?: boolean
    beneficiario_id?: boolean
    monto_programado?: boolean
    monto_pagado?: boolean
    moneda?: boolean
    fecha_programada?: boolean
    fecha_pago_real?: boolean
    estado?: boolean
    referencia_modulo?: boolean
    referencia_entidad?: boolean
    referencia_id?: boolean
    metodo_pago?: boolean
    banco?: boolean
    referencia_bancaria?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type ProgramaPagosInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    presupuesto?: boolean | PresupuestoAsignadoDefaultArgs<ExtArgs>
  }
  export type ProgramaPagosIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    presupuesto?: boolean | PresupuestoAsignadoDefaultArgs<ExtArgs>
  }

  export type $ProgramaPagosPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ProgramaPagos"
    objects: {
      presupuesto: Prisma.$PresupuestoAsignadoPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id_pago: string
      tenant_id: string
      proyecto_id: string
      presupuesto_id: string
      concepto: string
      beneficiario: string
      beneficiario_id: string | null
      monto_programado: Prisma.Decimal
      monto_pagado: Prisma.Decimal
      moneda: string
      fecha_programada: Date
      fecha_pago_real: Date | null
      estado: string
      referencia_modulo: string | null
      referencia_entidad: string | null
      referencia_id: string | null
      metodo_pago: string | null
      banco: string | null
      referencia_bancaria: string | null
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["programaPagos"]>
    composites: {}
  }

  type ProgramaPagosGetPayload<S extends boolean | null | undefined | ProgramaPagosDefaultArgs> = $Result.GetResult<Prisma.$ProgramaPagosPayload, S>

  type ProgramaPagosCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ProgramaPagosFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ProgramaPagosCountAggregateInputType | true
    }

  export interface ProgramaPagosDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ProgramaPagos'], meta: { name: 'ProgramaPagos' } }
    /**
     * Find zero or one ProgramaPagos that matches the filter.
     * @param {ProgramaPagosFindUniqueArgs} args - Arguments to find a ProgramaPagos
     * @example
     * // Get one ProgramaPagos
     * const programaPagos = await prisma.programaPagos.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProgramaPagosFindUniqueArgs>(args: SelectSubset<T, ProgramaPagosFindUniqueArgs<ExtArgs>>): Prisma__ProgramaPagosClient<$Result.GetResult<Prisma.$ProgramaPagosPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ProgramaPagos that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ProgramaPagosFindUniqueOrThrowArgs} args - Arguments to find a ProgramaPagos
     * @example
     * // Get one ProgramaPagos
     * const programaPagos = await prisma.programaPagos.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProgramaPagosFindUniqueOrThrowArgs>(args: SelectSubset<T, ProgramaPagosFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProgramaPagosClient<$Result.GetResult<Prisma.$ProgramaPagosPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ProgramaPagos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProgramaPagosFindFirstArgs} args - Arguments to find a ProgramaPagos
     * @example
     * // Get one ProgramaPagos
     * const programaPagos = await prisma.programaPagos.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProgramaPagosFindFirstArgs>(args?: SelectSubset<T, ProgramaPagosFindFirstArgs<ExtArgs>>): Prisma__ProgramaPagosClient<$Result.GetResult<Prisma.$ProgramaPagosPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ProgramaPagos that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProgramaPagosFindFirstOrThrowArgs} args - Arguments to find a ProgramaPagos
     * @example
     * // Get one ProgramaPagos
     * const programaPagos = await prisma.programaPagos.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProgramaPagosFindFirstOrThrowArgs>(args?: SelectSubset<T, ProgramaPagosFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProgramaPagosClient<$Result.GetResult<Prisma.$ProgramaPagosPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ProgramaPagos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProgramaPagosFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ProgramaPagos
     * const programaPagos = await prisma.programaPagos.findMany()
     * 
     * // Get first 10 ProgramaPagos
     * const programaPagos = await prisma.programaPagos.findMany({ take: 10 })
     * 
     * // Only select the `id_pago`
     * const programaPagosWithId_pagoOnly = await prisma.programaPagos.findMany({ select: { id_pago: true } })
     * 
     */
    findMany<T extends ProgramaPagosFindManyArgs>(args?: SelectSubset<T, ProgramaPagosFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProgramaPagosPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ProgramaPagos.
     * @param {ProgramaPagosCreateArgs} args - Arguments to create a ProgramaPagos.
     * @example
     * // Create one ProgramaPagos
     * const ProgramaPagos = await prisma.programaPagos.create({
     *   data: {
     *     // ... data to create a ProgramaPagos
     *   }
     * })
     * 
     */
    create<T extends ProgramaPagosCreateArgs>(args: SelectSubset<T, ProgramaPagosCreateArgs<ExtArgs>>): Prisma__ProgramaPagosClient<$Result.GetResult<Prisma.$ProgramaPagosPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ProgramaPagos.
     * @param {ProgramaPagosCreateManyArgs} args - Arguments to create many ProgramaPagos.
     * @example
     * // Create many ProgramaPagos
     * const programaPagos = await prisma.programaPagos.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProgramaPagosCreateManyArgs>(args?: SelectSubset<T, ProgramaPagosCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ProgramaPagos and returns the data saved in the database.
     * @param {ProgramaPagosCreateManyAndReturnArgs} args - Arguments to create many ProgramaPagos.
     * @example
     * // Create many ProgramaPagos
     * const programaPagos = await prisma.programaPagos.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ProgramaPagos and only return the `id_pago`
     * const programaPagosWithId_pagoOnly = await prisma.programaPagos.createManyAndReturn({ 
     *   select: { id_pago: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProgramaPagosCreateManyAndReturnArgs>(args?: SelectSubset<T, ProgramaPagosCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProgramaPagosPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ProgramaPagos.
     * @param {ProgramaPagosDeleteArgs} args - Arguments to delete one ProgramaPagos.
     * @example
     * // Delete one ProgramaPagos
     * const ProgramaPagos = await prisma.programaPagos.delete({
     *   where: {
     *     // ... filter to delete one ProgramaPagos
     *   }
     * })
     * 
     */
    delete<T extends ProgramaPagosDeleteArgs>(args: SelectSubset<T, ProgramaPagosDeleteArgs<ExtArgs>>): Prisma__ProgramaPagosClient<$Result.GetResult<Prisma.$ProgramaPagosPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ProgramaPagos.
     * @param {ProgramaPagosUpdateArgs} args - Arguments to update one ProgramaPagos.
     * @example
     * // Update one ProgramaPagos
     * const programaPagos = await prisma.programaPagos.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProgramaPagosUpdateArgs>(args: SelectSubset<T, ProgramaPagosUpdateArgs<ExtArgs>>): Prisma__ProgramaPagosClient<$Result.GetResult<Prisma.$ProgramaPagosPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ProgramaPagos.
     * @param {ProgramaPagosDeleteManyArgs} args - Arguments to filter ProgramaPagos to delete.
     * @example
     * // Delete a few ProgramaPagos
     * const { count } = await prisma.programaPagos.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProgramaPagosDeleteManyArgs>(args?: SelectSubset<T, ProgramaPagosDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ProgramaPagos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProgramaPagosUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ProgramaPagos
     * const programaPagos = await prisma.programaPagos.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProgramaPagosUpdateManyArgs>(args: SelectSubset<T, ProgramaPagosUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ProgramaPagos.
     * @param {ProgramaPagosUpsertArgs} args - Arguments to update or create a ProgramaPagos.
     * @example
     * // Update or create a ProgramaPagos
     * const programaPagos = await prisma.programaPagos.upsert({
     *   create: {
     *     // ... data to create a ProgramaPagos
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ProgramaPagos we want to update
     *   }
     * })
     */
    upsert<T extends ProgramaPagosUpsertArgs>(args: SelectSubset<T, ProgramaPagosUpsertArgs<ExtArgs>>): Prisma__ProgramaPagosClient<$Result.GetResult<Prisma.$ProgramaPagosPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ProgramaPagos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProgramaPagosCountArgs} args - Arguments to filter ProgramaPagos to count.
     * @example
     * // Count the number of ProgramaPagos
     * const count = await prisma.programaPagos.count({
     *   where: {
     *     // ... the filter for the ProgramaPagos we want to count
     *   }
     * })
    **/
    count<T extends ProgramaPagosCountArgs>(
      args?: Subset<T, ProgramaPagosCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProgramaPagosCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ProgramaPagos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProgramaPagosAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ProgramaPagosAggregateArgs>(args: Subset<T, ProgramaPagosAggregateArgs>): Prisma.PrismaPromise<GetProgramaPagosAggregateType<T>>

    /**
     * Group by ProgramaPagos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProgramaPagosGroupByArgs} args - Group by arguments.
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
      T extends ProgramaPagosGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProgramaPagosGroupByArgs['orderBy'] }
        : { orderBy?: ProgramaPagosGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ProgramaPagosGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProgramaPagosGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ProgramaPagos model
   */
  readonly fields: ProgramaPagosFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ProgramaPagos.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProgramaPagosClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    presupuesto<T extends PresupuestoAsignadoDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PresupuestoAsignadoDefaultArgs<ExtArgs>>): Prisma__PresupuestoAsignadoClient<$Result.GetResult<Prisma.$PresupuestoAsignadoPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
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
   * Fields of the ProgramaPagos model
   */ 
  interface ProgramaPagosFieldRefs {
    readonly id_pago: FieldRef<"ProgramaPagos", 'String'>
    readonly tenant_id: FieldRef<"ProgramaPagos", 'String'>
    readonly proyecto_id: FieldRef<"ProgramaPagos", 'String'>
    readonly presupuesto_id: FieldRef<"ProgramaPagos", 'String'>
    readonly concepto: FieldRef<"ProgramaPagos", 'String'>
    readonly beneficiario: FieldRef<"ProgramaPagos", 'String'>
    readonly beneficiario_id: FieldRef<"ProgramaPagos", 'String'>
    readonly monto_programado: FieldRef<"ProgramaPagos", 'Decimal'>
    readonly monto_pagado: FieldRef<"ProgramaPagos", 'Decimal'>
    readonly moneda: FieldRef<"ProgramaPagos", 'String'>
    readonly fecha_programada: FieldRef<"ProgramaPagos", 'DateTime'>
    readonly fecha_pago_real: FieldRef<"ProgramaPagos", 'DateTime'>
    readonly estado: FieldRef<"ProgramaPagos", 'String'>
    readonly referencia_modulo: FieldRef<"ProgramaPagos", 'String'>
    readonly referencia_entidad: FieldRef<"ProgramaPagos", 'String'>
    readonly referencia_id: FieldRef<"ProgramaPagos", 'String'>
    readonly metodo_pago: FieldRef<"ProgramaPagos", 'String'>
    readonly banco: FieldRef<"ProgramaPagos", 'String'>
    readonly referencia_bancaria: FieldRef<"ProgramaPagos", 'String'>
    readonly created_at: FieldRef<"ProgramaPagos", 'DateTime'>
    readonly updated_at: FieldRef<"ProgramaPagos", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ProgramaPagos findUnique
   */
  export type ProgramaPagosFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProgramaPagos
     */
    select?: ProgramaPagosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProgramaPagosInclude<ExtArgs> | null
    /**
     * Filter, which ProgramaPagos to fetch.
     */
    where: ProgramaPagosWhereUniqueInput
  }

  /**
   * ProgramaPagos findUniqueOrThrow
   */
  export type ProgramaPagosFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProgramaPagos
     */
    select?: ProgramaPagosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProgramaPagosInclude<ExtArgs> | null
    /**
     * Filter, which ProgramaPagos to fetch.
     */
    where: ProgramaPagosWhereUniqueInput
  }

  /**
   * ProgramaPagos findFirst
   */
  export type ProgramaPagosFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProgramaPagos
     */
    select?: ProgramaPagosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProgramaPagosInclude<ExtArgs> | null
    /**
     * Filter, which ProgramaPagos to fetch.
     */
    where?: ProgramaPagosWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProgramaPagos to fetch.
     */
    orderBy?: ProgramaPagosOrderByWithRelationInput | ProgramaPagosOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProgramaPagos.
     */
    cursor?: ProgramaPagosWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProgramaPagos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProgramaPagos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProgramaPagos.
     */
    distinct?: ProgramaPagosScalarFieldEnum | ProgramaPagosScalarFieldEnum[]
  }

  /**
   * ProgramaPagos findFirstOrThrow
   */
  export type ProgramaPagosFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProgramaPagos
     */
    select?: ProgramaPagosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProgramaPagosInclude<ExtArgs> | null
    /**
     * Filter, which ProgramaPagos to fetch.
     */
    where?: ProgramaPagosWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProgramaPagos to fetch.
     */
    orderBy?: ProgramaPagosOrderByWithRelationInput | ProgramaPagosOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProgramaPagos.
     */
    cursor?: ProgramaPagosWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProgramaPagos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProgramaPagos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProgramaPagos.
     */
    distinct?: ProgramaPagosScalarFieldEnum | ProgramaPagosScalarFieldEnum[]
  }

  /**
   * ProgramaPagos findMany
   */
  export type ProgramaPagosFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProgramaPagos
     */
    select?: ProgramaPagosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProgramaPagosInclude<ExtArgs> | null
    /**
     * Filter, which ProgramaPagos to fetch.
     */
    where?: ProgramaPagosWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProgramaPagos to fetch.
     */
    orderBy?: ProgramaPagosOrderByWithRelationInput | ProgramaPagosOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ProgramaPagos.
     */
    cursor?: ProgramaPagosWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProgramaPagos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProgramaPagos.
     */
    skip?: number
    distinct?: ProgramaPagosScalarFieldEnum | ProgramaPagosScalarFieldEnum[]
  }

  /**
   * ProgramaPagos create
   */
  export type ProgramaPagosCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProgramaPagos
     */
    select?: ProgramaPagosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProgramaPagosInclude<ExtArgs> | null
    /**
     * The data needed to create a ProgramaPagos.
     */
    data: XOR<ProgramaPagosCreateInput, ProgramaPagosUncheckedCreateInput>
  }

  /**
   * ProgramaPagos createMany
   */
  export type ProgramaPagosCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ProgramaPagos.
     */
    data: ProgramaPagosCreateManyInput | ProgramaPagosCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ProgramaPagos createManyAndReturn
   */
  export type ProgramaPagosCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProgramaPagos
     */
    select?: ProgramaPagosSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ProgramaPagos.
     */
    data: ProgramaPagosCreateManyInput | ProgramaPagosCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProgramaPagosIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ProgramaPagos update
   */
  export type ProgramaPagosUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProgramaPagos
     */
    select?: ProgramaPagosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProgramaPagosInclude<ExtArgs> | null
    /**
     * The data needed to update a ProgramaPagos.
     */
    data: XOR<ProgramaPagosUpdateInput, ProgramaPagosUncheckedUpdateInput>
    /**
     * Choose, which ProgramaPagos to update.
     */
    where: ProgramaPagosWhereUniqueInput
  }

  /**
   * ProgramaPagos updateMany
   */
  export type ProgramaPagosUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ProgramaPagos.
     */
    data: XOR<ProgramaPagosUpdateManyMutationInput, ProgramaPagosUncheckedUpdateManyInput>
    /**
     * Filter which ProgramaPagos to update
     */
    where?: ProgramaPagosWhereInput
  }

  /**
   * ProgramaPagos upsert
   */
  export type ProgramaPagosUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProgramaPagos
     */
    select?: ProgramaPagosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProgramaPagosInclude<ExtArgs> | null
    /**
     * The filter to search for the ProgramaPagos to update in case it exists.
     */
    where: ProgramaPagosWhereUniqueInput
    /**
     * In case the ProgramaPagos found by the `where` argument doesn't exist, create a new ProgramaPagos with this data.
     */
    create: XOR<ProgramaPagosCreateInput, ProgramaPagosUncheckedCreateInput>
    /**
     * In case the ProgramaPagos was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProgramaPagosUpdateInput, ProgramaPagosUncheckedUpdateInput>
  }

  /**
   * ProgramaPagos delete
   */
  export type ProgramaPagosDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProgramaPagos
     */
    select?: ProgramaPagosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProgramaPagosInclude<ExtArgs> | null
    /**
     * Filter which ProgramaPagos to delete.
     */
    where: ProgramaPagosWhereUniqueInput
  }

  /**
   * ProgramaPagos deleteMany
   */
  export type ProgramaPagosDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProgramaPagos to delete
     */
    where?: ProgramaPagosWhereInput
  }

  /**
   * ProgramaPagos without action
   */
  export type ProgramaPagosDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProgramaPagos
     */
    select?: ProgramaPagosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProgramaPagosInclude<ExtArgs> | null
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


  export const PresupuestoAsignadoScalarFieldEnum: {
    id_presupuesto: 'id_presupuesto',
    tenant_id: 'tenant_id',
    proyecto_id: 'proyecto_id',
    codigo: 'codigo',
    descripcion: 'descripcion',
    monto_autorizado: 'monto_autorizado',
    monto_ejercido: 'monto_ejercido',
    monto_comprometido: 'monto_comprometido',
    monto_disponible: 'monto_disponible',
    moneda: 'moneda',
    capitulo: 'capitulo',
    estatus: 'estatus',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type PresupuestoAsignadoScalarFieldEnum = (typeof PresupuestoAsignadoScalarFieldEnum)[keyof typeof PresupuestoAsignadoScalarFieldEnum]


  export const MovimientoPresupuestalScalarFieldEnum: {
    id_movimiento: 'id_movimiento',
    tenant_id: 'tenant_id',
    proyecto_id: 'proyecto_id',
    presupuesto_id: 'presupuesto_id',
    tipo: 'tipo',
    concepto: 'concepto',
    monto: 'monto',
    moneda: 'moneda',
    referencia_modulo: 'referencia_modulo',
    referencia_entidad: 'referencia_entidad',
    referencia_id: 'referencia_id',
    referencia_codigo: 'referencia_codigo',
    usuario_id: 'usuario_id',
    fecha_registro: 'fecha_registro',
    notas: 'notas'
  };

  export type MovimientoPresupuestalScalarFieldEnum = (typeof MovimientoPresupuestalScalarFieldEnum)[keyof typeof MovimientoPresupuestalScalarFieldEnum]


  export const ProgramaPagosScalarFieldEnum: {
    id_pago: 'id_pago',
    tenant_id: 'tenant_id',
    proyecto_id: 'proyecto_id',
    presupuesto_id: 'presupuesto_id',
    concepto: 'concepto',
    beneficiario: 'beneficiario',
    beneficiario_id: 'beneficiario_id',
    monto_programado: 'monto_programado',
    monto_pagado: 'monto_pagado',
    moneda: 'moneda',
    fecha_programada: 'fecha_programada',
    fecha_pago_real: 'fecha_pago_real',
    estado: 'estado',
    referencia_modulo: 'referencia_modulo',
    referencia_entidad: 'referencia_entidad',
    referencia_id: 'referencia_id',
    metodo_pago: 'metodo_pago',
    banco: 'banco',
    referencia_bancaria: 'referencia_bancaria',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type ProgramaPagosScalarFieldEnum = (typeof ProgramaPagosScalarFieldEnum)[keyof typeof ProgramaPagosScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


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
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'Decimal[]'
   */
  export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal[]'>
    


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
   * Deep Input Types
   */


  export type PresupuestoAsignadoWhereInput = {
    AND?: PresupuestoAsignadoWhereInput | PresupuestoAsignadoWhereInput[]
    OR?: PresupuestoAsignadoWhereInput[]
    NOT?: PresupuestoAsignadoWhereInput | PresupuestoAsignadoWhereInput[]
    id_presupuesto?: UuidFilter<"PresupuestoAsignado"> | string
    tenant_id?: UuidFilter<"PresupuestoAsignado"> | string
    proyecto_id?: UuidFilter<"PresupuestoAsignado"> | string
    codigo?: StringFilter<"PresupuestoAsignado"> | string
    descripcion?: StringFilter<"PresupuestoAsignado"> | string
    monto_autorizado?: DecimalFilter<"PresupuestoAsignado"> | Decimal | DecimalJsLike | number | string
    monto_ejercido?: DecimalFilter<"PresupuestoAsignado"> | Decimal | DecimalJsLike | number | string
    monto_comprometido?: DecimalFilter<"PresupuestoAsignado"> | Decimal | DecimalJsLike | number | string
    monto_disponible?: DecimalFilter<"PresupuestoAsignado"> | Decimal | DecimalJsLike | number | string
    moneda?: StringFilter<"PresupuestoAsignado"> | string
    capitulo?: StringFilter<"PresupuestoAsignado"> | string
    estatus?: StringFilter<"PresupuestoAsignado"> | string
    created_at?: DateTimeFilter<"PresupuestoAsignado"> | Date | string
    updated_at?: DateTimeFilter<"PresupuestoAsignado"> | Date | string
    movimientos?: MovimientoPresupuestalListRelationFilter
    programa_pagos?: ProgramaPagosListRelationFilter
  }

  export type PresupuestoAsignadoOrderByWithRelationInput = {
    id_presupuesto?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    codigo?: SortOrder
    descripcion?: SortOrder
    monto_autorizado?: SortOrder
    monto_ejercido?: SortOrder
    monto_comprometido?: SortOrder
    monto_disponible?: SortOrder
    moneda?: SortOrder
    capitulo?: SortOrder
    estatus?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    movimientos?: MovimientoPresupuestalOrderByRelationAggregateInput
    programa_pagos?: ProgramaPagosOrderByRelationAggregateInput
  }

  export type PresupuestoAsignadoWhereUniqueInput = Prisma.AtLeast<{
    id_presupuesto?: string
    tenant_id_proyecto_id_codigo?: PresupuestoAsignadoTenant_idProyecto_idCodigoCompoundUniqueInput
    AND?: PresupuestoAsignadoWhereInput | PresupuestoAsignadoWhereInput[]
    OR?: PresupuestoAsignadoWhereInput[]
    NOT?: PresupuestoAsignadoWhereInput | PresupuestoAsignadoWhereInput[]
    tenant_id?: UuidFilter<"PresupuestoAsignado"> | string
    proyecto_id?: UuidFilter<"PresupuestoAsignado"> | string
    codigo?: StringFilter<"PresupuestoAsignado"> | string
    descripcion?: StringFilter<"PresupuestoAsignado"> | string
    monto_autorizado?: DecimalFilter<"PresupuestoAsignado"> | Decimal | DecimalJsLike | number | string
    monto_ejercido?: DecimalFilter<"PresupuestoAsignado"> | Decimal | DecimalJsLike | number | string
    monto_comprometido?: DecimalFilter<"PresupuestoAsignado"> | Decimal | DecimalJsLike | number | string
    monto_disponible?: DecimalFilter<"PresupuestoAsignado"> | Decimal | DecimalJsLike | number | string
    moneda?: StringFilter<"PresupuestoAsignado"> | string
    capitulo?: StringFilter<"PresupuestoAsignado"> | string
    estatus?: StringFilter<"PresupuestoAsignado"> | string
    created_at?: DateTimeFilter<"PresupuestoAsignado"> | Date | string
    updated_at?: DateTimeFilter<"PresupuestoAsignado"> | Date | string
    movimientos?: MovimientoPresupuestalListRelationFilter
    programa_pagos?: ProgramaPagosListRelationFilter
  }, "id_presupuesto" | "tenant_id_proyecto_id_codigo">

  export type PresupuestoAsignadoOrderByWithAggregationInput = {
    id_presupuesto?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    codigo?: SortOrder
    descripcion?: SortOrder
    monto_autorizado?: SortOrder
    monto_ejercido?: SortOrder
    monto_comprometido?: SortOrder
    monto_disponible?: SortOrder
    moneda?: SortOrder
    capitulo?: SortOrder
    estatus?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: PresupuestoAsignadoCountOrderByAggregateInput
    _avg?: PresupuestoAsignadoAvgOrderByAggregateInput
    _max?: PresupuestoAsignadoMaxOrderByAggregateInput
    _min?: PresupuestoAsignadoMinOrderByAggregateInput
    _sum?: PresupuestoAsignadoSumOrderByAggregateInput
  }

  export type PresupuestoAsignadoScalarWhereWithAggregatesInput = {
    AND?: PresupuestoAsignadoScalarWhereWithAggregatesInput | PresupuestoAsignadoScalarWhereWithAggregatesInput[]
    OR?: PresupuestoAsignadoScalarWhereWithAggregatesInput[]
    NOT?: PresupuestoAsignadoScalarWhereWithAggregatesInput | PresupuestoAsignadoScalarWhereWithAggregatesInput[]
    id_presupuesto?: UuidWithAggregatesFilter<"PresupuestoAsignado"> | string
    tenant_id?: UuidWithAggregatesFilter<"PresupuestoAsignado"> | string
    proyecto_id?: UuidWithAggregatesFilter<"PresupuestoAsignado"> | string
    codigo?: StringWithAggregatesFilter<"PresupuestoAsignado"> | string
    descripcion?: StringWithAggregatesFilter<"PresupuestoAsignado"> | string
    monto_autorizado?: DecimalWithAggregatesFilter<"PresupuestoAsignado"> | Decimal | DecimalJsLike | number | string
    monto_ejercido?: DecimalWithAggregatesFilter<"PresupuestoAsignado"> | Decimal | DecimalJsLike | number | string
    monto_comprometido?: DecimalWithAggregatesFilter<"PresupuestoAsignado"> | Decimal | DecimalJsLike | number | string
    monto_disponible?: DecimalWithAggregatesFilter<"PresupuestoAsignado"> | Decimal | DecimalJsLike | number | string
    moneda?: StringWithAggregatesFilter<"PresupuestoAsignado"> | string
    capitulo?: StringWithAggregatesFilter<"PresupuestoAsignado"> | string
    estatus?: StringWithAggregatesFilter<"PresupuestoAsignado"> | string
    created_at?: DateTimeWithAggregatesFilter<"PresupuestoAsignado"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"PresupuestoAsignado"> | Date | string
  }

  export type MovimientoPresupuestalWhereInput = {
    AND?: MovimientoPresupuestalWhereInput | MovimientoPresupuestalWhereInput[]
    OR?: MovimientoPresupuestalWhereInput[]
    NOT?: MovimientoPresupuestalWhereInput | MovimientoPresupuestalWhereInput[]
    id_movimiento?: UuidFilter<"MovimientoPresupuestal"> | string
    tenant_id?: UuidFilter<"MovimientoPresupuestal"> | string
    proyecto_id?: UuidFilter<"MovimientoPresupuestal"> | string
    presupuesto_id?: UuidFilter<"MovimientoPresupuestal"> | string
    tipo?: StringFilter<"MovimientoPresupuestal"> | string
    concepto?: StringFilter<"MovimientoPresupuestal"> | string
    monto?: DecimalFilter<"MovimientoPresupuestal"> | Decimal | DecimalJsLike | number | string
    moneda?: StringFilter<"MovimientoPresupuestal"> | string
    referencia_modulo?: StringNullableFilter<"MovimientoPresupuestal"> | string | null
    referencia_entidad?: StringNullableFilter<"MovimientoPresupuestal"> | string | null
    referencia_id?: UuidNullableFilter<"MovimientoPresupuestal"> | string | null
    referencia_codigo?: StringNullableFilter<"MovimientoPresupuestal"> | string | null
    usuario_id?: UuidFilter<"MovimientoPresupuestal"> | string
    fecha_registro?: DateTimeFilter<"MovimientoPresupuestal"> | Date | string
    notas?: StringNullableFilter<"MovimientoPresupuestal"> | string | null
    presupuesto?: XOR<PresupuestoAsignadoRelationFilter, PresupuestoAsignadoWhereInput>
  }

  export type MovimientoPresupuestalOrderByWithRelationInput = {
    id_movimiento?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    presupuesto_id?: SortOrder
    tipo?: SortOrder
    concepto?: SortOrder
    monto?: SortOrder
    moneda?: SortOrder
    referencia_modulo?: SortOrderInput | SortOrder
    referencia_entidad?: SortOrderInput | SortOrder
    referencia_id?: SortOrderInput | SortOrder
    referencia_codigo?: SortOrderInput | SortOrder
    usuario_id?: SortOrder
    fecha_registro?: SortOrder
    notas?: SortOrderInput | SortOrder
    presupuesto?: PresupuestoAsignadoOrderByWithRelationInput
  }

  export type MovimientoPresupuestalWhereUniqueInput = Prisma.AtLeast<{
    id_movimiento?: string
    AND?: MovimientoPresupuestalWhereInput | MovimientoPresupuestalWhereInput[]
    OR?: MovimientoPresupuestalWhereInput[]
    NOT?: MovimientoPresupuestalWhereInput | MovimientoPresupuestalWhereInput[]
    tenant_id?: UuidFilter<"MovimientoPresupuestal"> | string
    proyecto_id?: UuidFilter<"MovimientoPresupuestal"> | string
    presupuesto_id?: UuidFilter<"MovimientoPresupuestal"> | string
    tipo?: StringFilter<"MovimientoPresupuestal"> | string
    concepto?: StringFilter<"MovimientoPresupuestal"> | string
    monto?: DecimalFilter<"MovimientoPresupuestal"> | Decimal | DecimalJsLike | number | string
    moneda?: StringFilter<"MovimientoPresupuestal"> | string
    referencia_modulo?: StringNullableFilter<"MovimientoPresupuestal"> | string | null
    referencia_entidad?: StringNullableFilter<"MovimientoPresupuestal"> | string | null
    referencia_id?: UuidNullableFilter<"MovimientoPresupuestal"> | string | null
    referencia_codigo?: StringNullableFilter<"MovimientoPresupuestal"> | string | null
    usuario_id?: UuidFilter<"MovimientoPresupuestal"> | string
    fecha_registro?: DateTimeFilter<"MovimientoPresupuestal"> | Date | string
    notas?: StringNullableFilter<"MovimientoPresupuestal"> | string | null
    presupuesto?: XOR<PresupuestoAsignadoRelationFilter, PresupuestoAsignadoWhereInput>
  }, "id_movimiento">

  export type MovimientoPresupuestalOrderByWithAggregationInput = {
    id_movimiento?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    presupuesto_id?: SortOrder
    tipo?: SortOrder
    concepto?: SortOrder
    monto?: SortOrder
    moneda?: SortOrder
    referencia_modulo?: SortOrderInput | SortOrder
    referencia_entidad?: SortOrderInput | SortOrder
    referencia_id?: SortOrderInput | SortOrder
    referencia_codigo?: SortOrderInput | SortOrder
    usuario_id?: SortOrder
    fecha_registro?: SortOrder
    notas?: SortOrderInput | SortOrder
    _count?: MovimientoPresupuestalCountOrderByAggregateInput
    _avg?: MovimientoPresupuestalAvgOrderByAggregateInput
    _max?: MovimientoPresupuestalMaxOrderByAggregateInput
    _min?: MovimientoPresupuestalMinOrderByAggregateInput
    _sum?: MovimientoPresupuestalSumOrderByAggregateInput
  }

  export type MovimientoPresupuestalScalarWhereWithAggregatesInput = {
    AND?: MovimientoPresupuestalScalarWhereWithAggregatesInput | MovimientoPresupuestalScalarWhereWithAggregatesInput[]
    OR?: MovimientoPresupuestalScalarWhereWithAggregatesInput[]
    NOT?: MovimientoPresupuestalScalarWhereWithAggregatesInput | MovimientoPresupuestalScalarWhereWithAggregatesInput[]
    id_movimiento?: UuidWithAggregatesFilter<"MovimientoPresupuestal"> | string
    tenant_id?: UuidWithAggregatesFilter<"MovimientoPresupuestal"> | string
    proyecto_id?: UuidWithAggregatesFilter<"MovimientoPresupuestal"> | string
    presupuesto_id?: UuidWithAggregatesFilter<"MovimientoPresupuestal"> | string
    tipo?: StringWithAggregatesFilter<"MovimientoPresupuestal"> | string
    concepto?: StringWithAggregatesFilter<"MovimientoPresupuestal"> | string
    monto?: DecimalWithAggregatesFilter<"MovimientoPresupuestal"> | Decimal | DecimalJsLike | number | string
    moneda?: StringWithAggregatesFilter<"MovimientoPresupuestal"> | string
    referencia_modulo?: StringNullableWithAggregatesFilter<"MovimientoPresupuestal"> | string | null
    referencia_entidad?: StringNullableWithAggregatesFilter<"MovimientoPresupuestal"> | string | null
    referencia_id?: UuidNullableWithAggregatesFilter<"MovimientoPresupuestal"> | string | null
    referencia_codigo?: StringNullableWithAggregatesFilter<"MovimientoPresupuestal"> | string | null
    usuario_id?: UuidWithAggregatesFilter<"MovimientoPresupuestal"> | string
    fecha_registro?: DateTimeWithAggregatesFilter<"MovimientoPresupuestal"> | Date | string
    notas?: StringNullableWithAggregatesFilter<"MovimientoPresupuestal"> | string | null
  }

  export type ProgramaPagosWhereInput = {
    AND?: ProgramaPagosWhereInput | ProgramaPagosWhereInput[]
    OR?: ProgramaPagosWhereInput[]
    NOT?: ProgramaPagosWhereInput | ProgramaPagosWhereInput[]
    id_pago?: UuidFilter<"ProgramaPagos"> | string
    tenant_id?: UuidFilter<"ProgramaPagos"> | string
    proyecto_id?: UuidFilter<"ProgramaPagos"> | string
    presupuesto_id?: UuidFilter<"ProgramaPagos"> | string
    concepto?: StringFilter<"ProgramaPagos"> | string
    beneficiario?: StringFilter<"ProgramaPagos"> | string
    beneficiario_id?: UuidNullableFilter<"ProgramaPagos"> | string | null
    monto_programado?: DecimalFilter<"ProgramaPagos"> | Decimal | DecimalJsLike | number | string
    monto_pagado?: DecimalFilter<"ProgramaPagos"> | Decimal | DecimalJsLike | number | string
    moneda?: StringFilter<"ProgramaPagos"> | string
    fecha_programada?: DateTimeFilter<"ProgramaPagos"> | Date | string
    fecha_pago_real?: DateTimeNullableFilter<"ProgramaPagos"> | Date | string | null
    estado?: StringFilter<"ProgramaPagos"> | string
    referencia_modulo?: StringNullableFilter<"ProgramaPagos"> | string | null
    referencia_entidad?: StringNullableFilter<"ProgramaPagos"> | string | null
    referencia_id?: UuidNullableFilter<"ProgramaPagos"> | string | null
    metodo_pago?: StringNullableFilter<"ProgramaPagos"> | string | null
    banco?: StringNullableFilter<"ProgramaPagos"> | string | null
    referencia_bancaria?: StringNullableFilter<"ProgramaPagos"> | string | null
    created_at?: DateTimeFilter<"ProgramaPagos"> | Date | string
    updated_at?: DateTimeFilter<"ProgramaPagos"> | Date | string
    presupuesto?: XOR<PresupuestoAsignadoRelationFilter, PresupuestoAsignadoWhereInput>
  }

  export type ProgramaPagosOrderByWithRelationInput = {
    id_pago?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    presupuesto_id?: SortOrder
    concepto?: SortOrder
    beneficiario?: SortOrder
    beneficiario_id?: SortOrderInput | SortOrder
    monto_programado?: SortOrder
    monto_pagado?: SortOrder
    moneda?: SortOrder
    fecha_programada?: SortOrder
    fecha_pago_real?: SortOrderInput | SortOrder
    estado?: SortOrder
    referencia_modulo?: SortOrderInput | SortOrder
    referencia_entidad?: SortOrderInput | SortOrder
    referencia_id?: SortOrderInput | SortOrder
    metodo_pago?: SortOrderInput | SortOrder
    banco?: SortOrderInput | SortOrder
    referencia_bancaria?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    presupuesto?: PresupuestoAsignadoOrderByWithRelationInput
  }

  export type ProgramaPagosWhereUniqueInput = Prisma.AtLeast<{
    id_pago?: string
    AND?: ProgramaPagosWhereInput | ProgramaPagosWhereInput[]
    OR?: ProgramaPagosWhereInput[]
    NOT?: ProgramaPagosWhereInput | ProgramaPagosWhereInput[]
    tenant_id?: UuidFilter<"ProgramaPagos"> | string
    proyecto_id?: UuidFilter<"ProgramaPagos"> | string
    presupuesto_id?: UuidFilter<"ProgramaPagos"> | string
    concepto?: StringFilter<"ProgramaPagos"> | string
    beneficiario?: StringFilter<"ProgramaPagos"> | string
    beneficiario_id?: UuidNullableFilter<"ProgramaPagos"> | string | null
    monto_programado?: DecimalFilter<"ProgramaPagos"> | Decimal | DecimalJsLike | number | string
    monto_pagado?: DecimalFilter<"ProgramaPagos"> | Decimal | DecimalJsLike | number | string
    moneda?: StringFilter<"ProgramaPagos"> | string
    fecha_programada?: DateTimeFilter<"ProgramaPagos"> | Date | string
    fecha_pago_real?: DateTimeNullableFilter<"ProgramaPagos"> | Date | string | null
    estado?: StringFilter<"ProgramaPagos"> | string
    referencia_modulo?: StringNullableFilter<"ProgramaPagos"> | string | null
    referencia_entidad?: StringNullableFilter<"ProgramaPagos"> | string | null
    referencia_id?: UuidNullableFilter<"ProgramaPagos"> | string | null
    metodo_pago?: StringNullableFilter<"ProgramaPagos"> | string | null
    banco?: StringNullableFilter<"ProgramaPagos"> | string | null
    referencia_bancaria?: StringNullableFilter<"ProgramaPagos"> | string | null
    created_at?: DateTimeFilter<"ProgramaPagos"> | Date | string
    updated_at?: DateTimeFilter<"ProgramaPagos"> | Date | string
    presupuesto?: XOR<PresupuestoAsignadoRelationFilter, PresupuestoAsignadoWhereInput>
  }, "id_pago">

  export type ProgramaPagosOrderByWithAggregationInput = {
    id_pago?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    presupuesto_id?: SortOrder
    concepto?: SortOrder
    beneficiario?: SortOrder
    beneficiario_id?: SortOrderInput | SortOrder
    monto_programado?: SortOrder
    monto_pagado?: SortOrder
    moneda?: SortOrder
    fecha_programada?: SortOrder
    fecha_pago_real?: SortOrderInput | SortOrder
    estado?: SortOrder
    referencia_modulo?: SortOrderInput | SortOrder
    referencia_entidad?: SortOrderInput | SortOrder
    referencia_id?: SortOrderInput | SortOrder
    metodo_pago?: SortOrderInput | SortOrder
    banco?: SortOrderInput | SortOrder
    referencia_bancaria?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: ProgramaPagosCountOrderByAggregateInput
    _avg?: ProgramaPagosAvgOrderByAggregateInput
    _max?: ProgramaPagosMaxOrderByAggregateInput
    _min?: ProgramaPagosMinOrderByAggregateInput
    _sum?: ProgramaPagosSumOrderByAggregateInput
  }

  export type ProgramaPagosScalarWhereWithAggregatesInput = {
    AND?: ProgramaPagosScalarWhereWithAggregatesInput | ProgramaPagosScalarWhereWithAggregatesInput[]
    OR?: ProgramaPagosScalarWhereWithAggregatesInput[]
    NOT?: ProgramaPagosScalarWhereWithAggregatesInput | ProgramaPagosScalarWhereWithAggregatesInput[]
    id_pago?: UuidWithAggregatesFilter<"ProgramaPagos"> | string
    tenant_id?: UuidWithAggregatesFilter<"ProgramaPagos"> | string
    proyecto_id?: UuidWithAggregatesFilter<"ProgramaPagos"> | string
    presupuesto_id?: UuidWithAggregatesFilter<"ProgramaPagos"> | string
    concepto?: StringWithAggregatesFilter<"ProgramaPagos"> | string
    beneficiario?: StringWithAggregatesFilter<"ProgramaPagos"> | string
    beneficiario_id?: UuidNullableWithAggregatesFilter<"ProgramaPagos"> | string | null
    monto_programado?: DecimalWithAggregatesFilter<"ProgramaPagos"> | Decimal | DecimalJsLike | number | string
    monto_pagado?: DecimalWithAggregatesFilter<"ProgramaPagos"> | Decimal | DecimalJsLike | number | string
    moneda?: StringWithAggregatesFilter<"ProgramaPagos"> | string
    fecha_programada?: DateTimeWithAggregatesFilter<"ProgramaPagos"> | Date | string
    fecha_pago_real?: DateTimeNullableWithAggregatesFilter<"ProgramaPagos"> | Date | string | null
    estado?: StringWithAggregatesFilter<"ProgramaPagos"> | string
    referencia_modulo?: StringNullableWithAggregatesFilter<"ProgramaPagos"> | string | null
    referencia_entidad?: StringNullableWithAggregatesFilter<"ProgramaPagos"> | string | null
    referencia_id?: UuidNullableWithAggregatesFilter<"ProgramaPagos"> | string | null
    metodo_pago?: StringNullableWithAggregatesFilter<"ProgramaPagos"> | string | null
    banco?: StringNullableWithAggregatesFilter<"ProgramaPagos"> | string | null
    referencia_bancaria?: StringNullableWithAggregatesFilter<"ProgramaPagos"> | string | null
    created_at?: DateTimeWithAggregatesFilter<"ProgramaPagos"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"ProgramaPagos"> | Date | string
  }

  export type PresupuestoAsignadoCreateInput = {
    id_presupuesto?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    descripcion: string
    monto_autorizado: Decimal | DecimalJsLike | number | string
    monto_ejercido?: Decimal | DecimalJsLike | number | string
    monto_comprometido?: Decimal | DecimalJsLike | number | string
    monto_disponible?: Decimal | DecimalJsLike | number | string
    moneda?: string
    capitulo?: string
    estatus?: string
    created_at?: Date | string
    updated_at?: Date | string
    movimientos?: MovimientoPresupuestalCreateNestedManyWithoutPresupuestoInput
    programa_pagos?: ProgramaPagosCreateNestedManyWithoutPresupuestoInput
  }

  export type PresupuestoAsignadoUncheckedCreateInput = {
    id_presupuesto?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    descripcion: string
    monto_autorizado: Decimal | DecimalJsLike | number | string
    monto_ejercido?: Decimal | DecimalJsLike | number | string
    monto_comprometido?: Decimal | DecimalJsLike | number | string
    monto_disponible?: Decimal | DecimalJsLike | number | string
    moneda?: string
    capitulo?: string
    estatus?: string
    created_at?: Date | string
    updated_at?: Date | string
    movimientos?: MovimientoPresupuestalUncheckedCreateNestedManyWithoutPresupuestoInput
    programa_pagos?: ProgramaPagosUncheckedCreateNestedManyWithoutPresupuestoInput
  }

  export type PresupuestoAsignadoUpdateInput = {
    id_presupuesto?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    monto_autorizado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_ejercido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_comprometido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_disponible?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    capitulo?: StringFieldUpdateOperationsInput | string
    estatus?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    movimientos?: MovimientoPresupuestalUpdateManyWithoutPresupuestoNestedInput
    programa_pagos?: ProgramaPagosUpdateManyWithoutPresupuestoNestedInput
  }

  export type PresupuestoAsignadoUncheckedUpdateInput = {
    id_presupuesto?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    monto_autorizado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_ejercido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_comprometido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_disponible?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    capitulo?: StringFieldUpdateOperationsInput | string
    estatus?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    movimientos?: MovimientoPresupuestalUncheckedUpdateManyWithoutPresupuestoNestedInput
    programa_pagos?: ProgramaPagosUncheckedUpdateManyWithoutPresupuestoNestedInput
  }

  export type PresupuestoAsignadoCreateManyInput = {
    id_presupuesto?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    descripcion: string
    monto_autorizado: Decimal | DecimalJsLike | number | string
    monto_ejercido?: Decimal | DecimalJsLike | number | string
    monto_comprometido?: Decimal | DecimalJsLike | number | string
    monto_disponible?: Decimal | DecimalJsLike | number | string
    moneda?: string
    capitulo?: string
    estatus?: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type PresupuestoAsignadoUpdateManyMutationInput = {
    id_presupuesto?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    monto_autorizado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_ejercido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_comprometido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_disponible?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    capitulo?: StringFieldUpdateOperationsInput | string
    estatus?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PresupuestoAsignadoUncheckedUpdateManyInput = {
    id_presupuesto?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    monto_autorizado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_ejercido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_comprometido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_disponible?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    capitulo?: StringFieldUpdateOperationsInput | string
    estatus?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MovimientoPresupuestalCreateInput = {
    id_movimiento?: string
    tenant_id: string
    proyecto_id: string
    tipo: string
    concepto: string
    monto: Decimal | DecimalJsLike | number | string
    moneda?: string
    referencia_modulo?: string | null
    referencia_entidad?: string | null
    referencia_id?: string | null
    referencia_codigo?: string | null
    usuario_id: string
    fecha_registro?: Date | string
    notas?: string | null
    presupuesto: PresupuestoAsignadoCreateNestedOneWithoutMovimientosInput
  }

  export type MovimientoPresupuestalUncheckedCreateInput = {
    id_movimiento?: string
    tenant_id: string
    proyecto_id: string
    presupuesto_id: string
    tipo: string
    concepto: string
    monto: Decimal | DecimalJsLike | number | string
    moneda?: string
    referencia_modulo?: string | null
    referencia_entidad?: string | null
    referencia_id?: string | null
    referencia_codigo?: string | null
    usuario_id: string
    fecha_registro?: Date | string
    notas?: string | null
  }

  export type MovimientoPresupuestalUpdateInput = {
    id_movimiento?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    concepto?: StringFieldUpdateOperationsInput | string
    monto?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    referencia_modulo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_entidad?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_id?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_codigo?: NullableStringFieldUpdateOperationsInput | string | null
    usuario_id?: StringFieldUpdateOperationsInput | string
    fecha_registro?: DateTimeFieldUpdateOperationsInput | Date | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    presupuesto?: PresupuestoAsignadoUpdateOneRequiredWithoutMovimientosNestedInput
  }

  export type MovimientoPresupuestalUncheckedUpdateInput = {
    id_movimiento?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    presupuesto_id?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    concepto?: StringFieldUpdateOperationsInput | string
    monto?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    referencia_modulo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_entidad?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_id?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_codigo?: NullableStringFieldUpdateOperationsInput | string | null
    usuario_id?: StringFieldUpdateOperationsInput | string
    fecha_registro?: DateTimeFieldUpdateOperationsInput | Date | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type MovimientoPresupuestalCreateManyInput = {
    id_movimiento?: string
    tenant_id: string
    proyecto_id: string
    presupuesto_id: string
    tipo: string
    concepto: string
    monto: Decimal | DecimalJsLike | number | string
    moneda?: string
    referencia_modulo?: string | null
    referencia_entidad?: string | null
    referencia_id?: string | null
    referencia_codigo?: string | null
    usuario_id: string
    fecha_registro?: Date | string
    notas?: string | null
  }

  export type MovimientoPresupuestalUpdateManyMutationInput = {
    id_movimiento?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    concepto?: StringFieldUpdateOperationsInput | string
    monto?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    referencia_modulo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_entidad?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_id?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_codigo?: NullableStringFieldUpdateOperationsInput | string | null
    usuario_id?: StringFieldUpdateOperationsInput | string
    fecha_registro?: DateTimeFieldUpdateOperationsInput | Date | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type MovimientoPresupuestalUncheckedUpdateManyInput = {
    id_movimiento?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    presupuesto_id?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    concepto?: StringFieldUpdateOperationsInput | string
    monto?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    referencia_modulo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_entidad?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_id?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_codigo?: NullableStringFieldUpdateOperationsInput | string | null
    usuario_id?: StringFieldUpdateOperationsInput | string
    fecha_registro?: DateTimeFieldUpdateOperationsInput | Date | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ProgramaPagosCreateInput = {
    id_pago?: string
    tenant_id: string
    proyecto_id: string
    concepto: string
    beneficiario: string
    beneficiario_id?: string | null
    monto_programado: Decimal | DecimalJsLike | number | string
    monto_pagado?: Decimal | DecimalJsLike | number | string
    moneda?: string
    fecha_programada: Date | string
    fecha_pago_real?: Date | string | null
    estado?: string
    referencia_modulo?: string | null
    referencia_entidad?: string | null
    referencia_id?: string | null
    metodo_pago?: string | null
    banco?: string | null
    referencia_bancaria?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    presupuesto: PresupuestoAsignadoCreateNestedOneWithoutPrograma_pagosInput
  }

  export type ProgramaPagosUncheckedCreateInput = {
    id_pago?: string
    tenant_id: string
    proyecto_id: string
    presupuesto_id: string
    concepto: string
    beneficiario: string
    beneficiario_id?: string | null
    monto_programado: Decimal | DecimalJsLike | number | string
    monto_pagado?: Decimal | DecimalJsLike | number | string
    moneda?: string
    fecha_programada: Date | string
    fecha_pago_real?: Date | string | null
    estado?: string
    referencia_modulo?: string | null
    referencia_entidad?: string | null
    referencia_id?: string | null
    metodo_pago?: string | null
    banco?: string | null
    referencia_bancaria?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ProgramaPagosUpdateInput = {
    id_pago?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    concepto?: StringFieldUpdateOperationsInput | string
    beneficiario?: StringFieldUpdateOperationsInput | string
    beneficiario_id?: NullableStringFieldUpdateOperationsInput | string | null
    monto_programado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_pagado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    fecha_programada?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_pago_real?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    referencia_modulo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_entidad?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_id?: NullableStringFieldUpdateOperationsInput | string | null
    metodo_pago?: NullableStringFieldUpdateOperationsInput | string | null
    banco?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_bancaria?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    presupuesto?: PresupuestoAsignadoUpdateOneRequiredWithoutPrograma_pagosNestedInput
  }

  export type ProgramaPagosUncheckedUpdateInput = {
    id_pago?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    presupuesto_id?: StringFieldUpdateOperationsInput | string
    concepto?: StringFieldUpdateOperationsInput | string
    beneficiario?: StringFieldUpdateOperationsInput | string
    beneficiario_id?: NullableStringFieldUpdateOperationsInput | string | null
    monto_programado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_pagado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    fecha_programada?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_pago_real?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    referencia_modulo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_entidad?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_id?: NullableStringFieldUpdateOperationsInput | string | null
    metodo_pago?: NullableStringFieldUpdateOperationsInput | string | null
    banco?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_bancaria?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProgramaPagosCreateManyInput = {
    id_pago?: string
    tenant_id: string
    proyecto_id: string
    presupuesto_id: string
    concepto: string
    beneficiario: string
    beneficiario_id?: string | null
    monto_programado: Decimal | DecimalJsLike | number | string
    monto_pagado?: Decimal | DecimalJsLike | number | string
    moneda?: string
    fecha_programada: Date | string
    fecha_pago_real?: Date | string | null
    estado?: string
    referencia_modulo?: string | null
    referencia_entidad?: string | null
    referencia_id?: string | null
    metodo_pago?: string | null
    banco?: string | null
    referencia_bancaria?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ProgramaPagosUpdateManyMutationInput = {
    id_pago?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    concepto?: StringFieldUpdateOperationsInput | string
    beneficiario?: StringFieldUpdateOperationsInput | string
    beneficiario_id?: NullableStringFieldUpdateOperationsInput | string | null
    monto_programado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_pagado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    fecha_programada?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_pago_real?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    referencia_modulo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_entidad?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_id?: NullableStringFieldUpdateOperationsInput | string | null
    metodo_pago?: NullableStringFieldUpdateOperationsInput | string | null
    banco?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_bancaria?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProgramaPagosUncheckedUpdateManyInput = {
    id_pago?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    presupuesto_id?: StringFieldUpdateOperationsInput | string
    concepto?: StringFieldUpdateOperationsInput | string
    beneficiario?: StringFieldUpdateOperationsInput | string
    beneficiario_id?: NullableStringFieldUpdateOperationsInput | string | null
    monto_programado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_pagado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    fecha_programada?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_pago_real?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    referencia_modulo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_entidad?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_id?: NullableStringFieldUpdateOperationsInput | string | null
    metodo_pago?: NullableStringFieldUpdateOperationsInput | string | null
    banco?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_bancaria?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
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

  export type MovimientoPresupuestalListRelationFilter = {
    every?: MovimientoPresupuestalWhereInput
    some?: MovimientoPresupuestalWhereInput
    none?: MovimientoPresupuestalWhereInput
  }

  export type ProgramaPagosListRelationFilter = {
    every?: ProgramaPagosWhereInput
    some?: ProgramaPagosWhereInput
    none?: ProgramaPagosWhereInput
  }

  export type MovimientoPresupuestalOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ProgramaPagosOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PresupuestoAsignadoTenant_idProyecto_idCodigoCompoundUniqueInput = {
    tenant_id: string
    proyecto_id: string
    codigo: string
  }

  export type PresupuestoAsignadoCountOrderByAggregateInput = {
    id_presupuesto?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    codigo?: SortOrder
    descripcion?: SortOrder
    monto_autorizado?: SortOrder
    monto_ejercido?: SortOrder
    monto_comprometido?: SortOrder
    monto_disponible?: SortOrder
    moneda?: SortOrder
    capitulo?: SortOrder
    estatus?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type PresupuestoAsignadoAvgOrderByAggregateInput = {
    monto_autorizado?: SortOrder
    monto_ejercido?: SortOrder
    monto_comprometido?: SortOrder
    monto_disponible?: SortOrder
  }

  export type PresupuestoAsignadoMaxOrderByAggregateInput = {
    id_presupuesto?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    codigo?: SortOrder
    descripcion?: SortOrder
    monto_autorizado?: SortOrder
    monto_ejercido?: SortOrder
    monto_comprometido?: SortOrder
    monto_disponible?: SortOrder
    moneda?: SortOrder
    capitulo?: SortOrder
    estatus?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type PresupuestoAsignadoMinOrderByAggregateInput = {
    id_presupuesto?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    codigo?: SortOrder
    descripcion?: SortOrder
    monto_autorizado?: SortOrder
    monto_ejercido?: SortOrder
    monto_comprometido?: SortOrder
    monto_disponible?: SortOrder
    moneda?: SortOrder
    capitulo?: SortOrder
    estatus?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type PresupuestoAsignadoSumOrderByAggregateInput = {
    monto_autorizado?: SortOrder
    monto_ejercido?: SortOrder
    monto_comprometido?: SortOrder
    monto_disponible?: SortOrder
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

  export type PresupuestoAsignadoRelationFilter = {
    is?: PresupuestoAsignadoWhereInput
    isNot?: PresupuestoAsignadoWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type MovimientoPresupuestalCountOrderByAggregateInput = {
    id_movimiento?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    presupuesto_id?: SortOrder
    tipo?: SortOrder
    concepto?: SortOrder
    monto?: SortOrder
    moneda?: SortOrder
    referencia_modulo?: SortOrder
    referencia_entidad?: SortOrder
    referencia_id?: SortOrder
    referencia_codigo?: SortOrder
    usuario_id?: SortOrder
    fecha_registro?: SortOrder
    notas?: SortOrder
  }

  export type MovimientoPresupuestalAvgOrderByAggregateInput = {
    monto?: SortOrder
  }

  export type MovimientoPresupuestalMaxOrderByAggregateInput = {
    id_movimiento?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    presupuesto_id?: SortOrder
    tipo?: SortOrder
    concepto?: SortOrder
    monto?: SortOrder
    moneda?: SortOrder
    referencia_modulo?: SortOrder
    referencia_entidad?: SortOrder
    referencia_id?: SortOrder
    referencia_codigo?: SortOrder
    usuario_id?: SortOrder
    fecha_registro?: SortOrder
    notas?: SortOrder
  }

  export type MovimientoPresupuestalMinOrderByAggregateInput = {
    id_movimiento?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    presupuesto_id?: SortOrder
    tipo?: SortOrder
    concepto?: SortOrder
    monto?: SortOrder
    moneda?: SortOrder
    referencia_modulo?: SortOrder
    referencia_entidad?: SortOrder
    referencia_id?: SortOrder
    referencia_codigo?: SortOrder
    usuario_id?: SortOrder
    fecha_registro?: SortOrder
    notas?: SortOrder
  }

  export type MovimientoPresupuestalSumOrderByAggregateInput = {
    monto?: SortOrder
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

  export type ProgramaPagosCountOrderByAggregateInput = {
    id_pago?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    presupuesto_id?: SortOrder
    concepto?: SortOrder
    beneficiario?: SortOrder
    beneficiario_id?: SortOrder
    monto_programado?: SortOrder
    monto_pagado?: SortOrder
    moneda?: SortOrder
    fecha_programada?: SortOrder
    fecha_pago_real?: SortOrder
    estado?: SortOrder
    referencia_modulo?: SortOrder
    referencia_entidad?: SortOrder
    referencia_id?: SortOrder
    metodo_pago?: SortOrder
    banco?: SortOrder
    referencia_bancaria?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ProgramaPagosAvgOrderByAggregateInput = {
    monto_programado?: SortOrder
    monto_pagado?: SortOrder
  }

  export type ProgramaPagosMaxOrderByAggregateInput = {
    id_pago?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    presupuesto_id?: SortOrder
    concepto?: SortOrder
    beneficiario?: SortOrder
    beneficiario_id?: SortOrder
    monto_programado?: SortOrder
    monto_pagado?: SortOrder
    moneda?: SortOrder
    fecha_programada?: SortOrder
    fecha_pago_real?: SortOrder
    estado?: SortOrder
    referencia_modulo?: SortOrder
    referencia_entidad?: SortOrder
    referencia_id?: SortOrder
    metodo_pago?: SortOrder
    banco?: SortOrder
    referencia_bancaria?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ProgramaPagosMinOrderByAggregateInput = {
    id_pago?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    presupuesto_id?: SortOrder
    concepto?: SortOrder
    beneficiario?: SortOrder
    beneficiario_id?: SortOrder
    monto_programado?: SortOrder
    monto_pagado?: SortOrder
    moneda?: SortOrder
    fecha_programada?: SortOrder
    fecha_pago_real?: SortOrder
    estado?: SortOrder
    referencia_modulo?: SortOrder
    referencia_entidad?: SortOrder
    referencia_id?: SortOrder
    metodo_pago?: SortOrder
    banco?: SortOrder
    referencia_bancaria?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ProgramaPagosSumOrderByAggregateInput = {
    monto_programado?: SortOrder
    monto_pagado?: SortOrder
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

  export type MovimientoPresupuestalCreateNestedManyWithoutPresupuestoInput = {
    create?: XOR<MovimientoPresupuestalCreateWithoutPresupuestoInput, MovimientoPresupuestalUncheckedCreateWithoutPresupuestoInput> | MovimientoPresupuestalCreateWithoutPresupuestoInput[] | MovimientoPresupuestalUncheckedCreateWithoutPresupuestoInput[]
    connectOrCreate?: MovimientoPresupuestalCreateOrConnectWithoutPresupuestoInput | MovimientoPresupuestalCreateOrConnectWithoutPresupuestoInput[]
    createMany?: MovimientoPresupuestalCreateManyPresupuestoInputEnvelope
    connect?: MovimientoPresupuestalWhereUniqueInput | MovimientoPresupuestalWhereUniqueInput[]
  }

  export type ProgramaPagosCreateNestedManyWithoutPresupuestoInput = {
    create?: XOR<ProgramaPagosCreateWithoutPresupuestoInput, ProgramaPagosUncheckedCreateWithoutPresupuestoInput> | ProgramaPagosCreateWithoutPresupuestoInput[] | ProgramaPagosUncheckedCreateWithoutPresupuestoInput[]
    connectOrCreate?: ProgramaPagosCreateOrConnectWithoutPresupuestoInput | ProgramaPagosCreateOrConnectWithoutPresupuestoInput[]
    createMany?: ProgramaPagosCreateManyPresupuestoInputEnvelope
    connect?: ProgramaPagosWhereUniqueInput | ProgramaPagosWhereUniqueInput[]
  }

  export type MovimientoPresupuestalUncheckedCreateNestedManyWithoutPresupuestoInput = {
    create?: XOR<MovimientoPresupuestalCreateWithoutPresupuestoInput, MovimientoPresupuestalUncheckedCreateWithoutPresupuestoInput> | MovimientoPresupuestalCreateWithoutPresupuestoInput[] | MovimientoPresupuestalUncheckedCreateWithoutPresupuestoInput[]
    connectOrCreate?: MovimientoPresupuestalCreateOrConnectWithoutPresupuestoInput | MovimientoPresupuestalCreateOrConnectWithoutPresupuestoInput[]
    createMany?: MovimientoPresupuestalCreateManyPresupuestoInputEnvelope
    connect?: MovimientoPresupuestalWhereUniqueInput | MovimientoPresupuestalWhereUniqueInput[]
  }

  export type ProgramaPagosUncheckedCreateNestedManyWithoutPresupuestoInput = {
    create?: XOR<ProgramaPagosCreateWithoutPresupuestoInput, ProgramaPagosUncheckedCreateWithoutPresupuestoInput> | ProgramaPagosCreateWithoutPresupuestoInput[] | ProgramaPagosUncheckedCreateWithoutPresupuestoInput[]
    connectOrCreate?: ProgramaPagosCreateOrConnectWithoutPresupuestoInput | ProgramaPagosCreateOrConnectWithoutPresupuestoInput[]
    createMany?: ProgramaPagosCreateManyPresupuestoInputEnvelope
    connect?: ProgramaPagosWhereUniqueInput | ProgramaPagosWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type MovimientoPresupuestalUpdateManyWithoutPresupuestoNestedInput = {
    create?: XOR<MovimientoPresupuestalCreateWithoutPresupuestoInput, MovimientoPresupuestalUncheckedCreateWithoutPresupuestoInput> | MovimientoPresupuestalCreateWithoutPresupuestoInput[] | MovimientoPresupuestalUncheckedCreateWithoutPresupuestoInput[]
    connectOrCreate?: MovimientoPresupuestalCreateOrConnectWithoutPresupuestoInput | MovimientoPresupuestalCreateOrConnectWithoutPresupuestoInput[]
    upsert?: MovimientoPresupuestalUpsertWithWhereUniqueWithoutPresupuestoInput | MovimientoPresupuestalUpsertWithWhereUniqueWithoutPresupuestoInput[]
    createMany?: MovimientoPresupuestalCreateManyPresupuestoInputEnvelope
    set?: MovimientoPresupuestalWhereUniqueInput | MovimientoPresupuestalWhereUniqueInput[]
    disconnect?: MovimientoPresupuestalWhereUniqueInput | MovimientoPresupuestalWhereUniqueInput[]
    delete?: MovimientoPresupuestalWhereUniqueInput | MovimientoPresupuestalWhereUniqueInput[]
    connect?: MovimientoPresupuestalWhereUniqueInput | MovimientoPresupuestalWhereUniqueInput[]
    update?: MovimientoPresupuestalUpdateWithWhereUniqueWithoutPresupuestoInput | MovimientoPresupuestalUpdateWithWhereUniqueWithoutPresupuestoInput[]
    updateMany?: MovimientoPresupuestalUpdateManyWithWhereWithoutPresupuestoInput | MovimientoPresupuestalUpdateManyWithWhereWithoutPresupuestoInput[]
    deleteMany?: MovimientoPresupuestalScalarWhereInput | MovimientoPresupuestalScalarWhereInput[]
  }

  export type ProgramaPagosUpdateManyWithoutPresupuestoNestedInput = {
    create?: XOR<ProgramaPagosCreateWithoutPresupuestoInput, ProgramaPagosUncheckedCreateWithoutPresupuestoInput> | ProgramaPagosCreateWithoutPresupuestoInput[] | ProgramaPagosUncheckedCreateWithoutPresupuestoInput[]
    connectOrCreate?: ProgramaPagosCreateOrConnectWithoutPresupuestoInput | ProgramaPagosCreateOrConnectWithoutPresupuestoInput[]
    upsert?: ProgramaPagosUpsertWithWhereUniqueWithoutPresupuestoInput | ProgramaPagosUpsertWithWhereUniqueWithoutPresupuestoInput[]
    createMany?: ProgramaPagosCreateManyPresupuestoInputEnvelope
    set?: ProgramaPagosWhereUniqueInput | ProgramaPagosWhereUniqueInput[]
    disconnect?: ProgramaPagosWhereUniqueInput | ProgramaPagosWhereUniqueInput[]
    delete?: ProgramaPagosWhereUniqueInput | ProgramaPagosWhereUniqueInput[]
    connect?: ProgramaPagosWhereUniqueInput | ProgramaPagosWhereUniqueInput[]
    update?: ProgramaPagosUpdateWithWhereUniqueWithoutPresupuestoInput | ProgramaPagosUpdateWithWhereUniqueWithoutPresupuestoInput[]
    updateMany?: ProgramaPagosUpdateManyWithWhereWithoutPresupuestoInput | ProgramaPagosUpdateManyWithWhereWithoutPresupuestoInput[]
    deleteMany?: ProgramaPagosScalarWhereInput | ProgramaPagosScalarWhereInput[]
  }

  export type MovimientoPresupuestalUncheckedUpdateManyWithoutPresupuestoNestedInput = {
    create?: XOR<MovimientoPresupuestalCreateWithoutPresupuestoInput, MovimientoPresupuestalUncheckedCreateWithoutPresupuestoInput> | MovimientoPresupuestalCreateWithoutPresupuestoInput[] | MovimientoPresupuestalUncheckedCreateWithoutPresupuestoInput[]
    connectOrCreate?: MovimientoPresupuestalCreateOrConnectWithoutPresupuestoInput | MovimientoPresupuestalCreateOrConnectWithoutPresupuestoInput[]
    upsert?: MovimientoPresupuestalUpsertWithWhereUniqueWithoutPresupuestoInput | MovimientoPresupuestalUpsertWithWhereUniqueWithoutPresupuestoInput[]
    createMany?: MovimientoPresupuestalCreateManyPresupuestoInputEnvelope
    set?: MovimientoPresupuestalWhereUniqueInput | MovimientoPresupuestalWhereUniqueInput[]
    disconnect?: MovimientoPresupuestalWhereUniqueInput | MovimientoPresupuestalWhereUniqueInput[]
    delete?: MovimientoPresupuestalWhereUniqueInput | MovimientoPresupuestalWhereUniqueInput[]
    connect?: MovimientoPresupuestalWhereUniqueInput | MovimientoPresupuestalWhereUniqueInput[]
    update?: MovimientoPresupuestalUpdateWithWhereUniqueWithoutPresupuestoInput | MovimientoPresupuestalUpdateWithWhereUniqueWithoutPresupuestoInput[]
    updateMany?: MovimientoPresupuestalUpdateManyWithWhereWithoutPresupuestoInput | MovimientoPresupuestalUpdateManyWithWhereWithoutPresupuestoInput[]
    deleteMany?: MovimientoPresupuestalScalarWhereInput | MovimientoPresupuestalScalarWhereInput[]
  }

  export type ProgramaPagosUncheckedUpdateManyWithoutPresupuestoNestedInput = {
    create?: XOR<ProgramaPagosCreateWithoutPresupuestoInput, ProgramaPagosUncheckedCreateWithoutPresupuestoInput> | ProgramaPagosCreateWithoutPresupuestoInput[] | ProgramaPagosUncheckedCreateWithoutPresupuestoInput[]
    connectOrCreate?: ProgramaPagosCreateOrConnectWithoutPresupuestoInput | ProgramaPagosCreateOrConnectWithoutPresupuestoInput[]
    upsert?: ProgramaPagosUpsertWithWhereUniqueWithoutPresupuestoInput | ProgramaPagosUpsertWithWhereUniqueWithoutPresupuestoInput[]
    createMany?: ProgramaPagosCreateManyPresupuestoInputEnvelope
    set?: ProgramaPagosWhereUniqueInput | ProgramaPagosWhereUniqueInput[]
    disconnect?: ProgramaPagosWhereUniqueInput | ProgramaPagosWhereUniqueInput[]
    delete?: ProgramaPagosWhereUniqueInput | ProgramaPagosWhereUniqueInput[]
    connect?: ProgramaPagosWhereUniqueInput | ProgramaPagosWhereUniqueInput[]
    update?: ProgramaPagosUpdateWithWhereUniqueWithoutPresupuestoInput | ProgramaPagosUpdateWithWhereUniqueWithoutPresupuestoInput[]
    updateMany?: ProgramaPagosUpdateManyWithWhereWithoutPresupuestoInput | ProgramaPagosUpdateManyWithWhereWithoutPresupuestoInput[]
    deleteMany?: ProgramaPagosScalarWhereInput | ProgramaPagosScalarWhereInput[]
  }

  export type PresupuestoAsignadoCreateNestedOneWithoutMovimientosInput = {
    create?: XOR<PresupuestoAsignadoCreateWithoutMovimientosInput, PresupuestoAsignadoUncheckedCreateWithoutMovimientosInput>
    connectOrCreate?: PresupuestoAsignadoCreateOrConnectWithoutMovimientosInput
    connect?: PresupuestoAsignadoWhereUniqueInput
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type PresupuestoAsignadoUpdateOneRequiredWithoutMovimientosNestedInput = {
    create?: XOR<PresupuestoAsignadoCreateWithoutMovimientosInput, PresupuestoAsignadoUncheckedCreateWithoutMovimientosInput>
    connectOrCreate?: PresupuestoAsignadoCreateOrConnectWithoutMovimientosInput
    upsert?: PresupuestoAsignadoUpsertWithoutMovimientosInput
    connect?: PresupuestoAsignadoWhereUniqueInput
    update?: XOR<XOR<PresupuestoAsignadoUpdateToOneWithWhereWithoutMovimientosInput, PresupuestoAsignadoUpdateWithoutMovimientosInput>, PresupuestoAsignadoUncheckedUpdateWithoutMovimientosInput>
  }

  export type PresupuestoAsignadoCreateNestedOneWithoutPrograma_pagosInput = {
    create?: XOR<PresupuestoAsignadoCreateWithoutPrograma_pagosInput, PresupuestoAsignadoUncheckedCreateWithoutPrograma_pagosInput>
    connectOrCreate?: PresupuestoAsignadoCreateOrConnectWithoutPrograma_pagosInput
    connect?: PresupuestoAsignadoWhereUniqueInput
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type PresupuestoAsignadoUpdateOneRequiredWithoutPrograma_pagosNestedInput = {
    create?: XOR<PresupuestoAsignadoCreateWithoutPrograma_pagosInput, PresupuestoAsignadoUncheckedCreateWithoutPrograma_pagosInput>
    connectOrCreate?: PresupuestoAsignadoCreateOrConnectWithoutPrograma_pagosInput
    upsert?: PresupuestoAsignadoUpsertWithoutPrograma_pagosInput
    connect?: PresupuestoAsignadoWhereUniqueInput
    update?: XOR<XOR<PresupuestoAsignadoUpdateToOneWithWhereWithoutPrograma_pagosInput, PresupuestoAsignadoUpdateWithoutPrograma_pagosInput>, PresupuestoAsignadoUncheckedUpdateWithoutPrograma_pagosInput>
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

  export type MovimientoPresupuestalCreateWithoutPresupuestoInput = {
    id_movimiento?: string
    tenant_id: string
    proyecto_id: string
    tipo: string
    concepto: string
    monto: Decimal | DecimalJsLike | number | string
    moneda?: string
    referencia_modulo?: string | null
    referencia_entidad?: string | null
    referencia_id?: string | null
    referencia_codigo?: string | null
    usuario_id: string
    fecha_registro?: Date | string
    notas?: string | null
  }

  export type MovimientoPresupuestalUncheckedCreateWithoutPresupuestoInput = {
    id_movimiento?: string
    tenant_id: string
    proyecto_id: string
    tipo: string
    concepto: string
    monto: Decimal | DecimalJsLike | number | string
    moneda?: string
    referencia_modulo?: string | null
    referencia_entidad?: string | null
    referencia_id?: string | null
    referencia_codigo?: string | null
    usuario_id: string
    fecha_registro?: Date | string
    notas?: string | null
  }

  export type MovimientoPresupuestalCreateOrConnectWithoutPresupuestoInput = {
    where: MovimientoPresupuestalWhereUniqueInput
    create: XOR<MovimientoPresupuestalCreateWithoutPresupuestoInput, MovimientoPresupuestalUncheckedCreateWithoutPresupuestoInput>
  }

  export type MovimientoPresupuestalCreateManyPresupuestoInputEnvelope = {
    data: MovimientoPresupuestalCreateManyPresupuestoInput | MovimientoPresupuestalCreateManyPresupuestoInput[]
    skipDuplicates?: boolean
  }

  export type ProgramaPagosCreateWithoutPresupuestoInput = {
    id_pago?: string
    tenant_id: string
    proyecto_id: string
    concepto: string
    beneficiario: string
    beneficiario_id?: string | null
    monto_programado: Decimal | DecimalJsLike | number | string
    monto_pagado?: Decimal | DecimalJsLike | number | string
    moneda?: string
    fecha_programada: Date | string
    fecha_pago_real?: Date | string | null
    estado?: string
    referencia_modulo?: string | null
    referencia_entidad?: string | null
    referencia_id?: string | null
    metodo_pago?: string | null
    banco?: string | null
    referencia_bancaria?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ProgramaPagosUncheckedCreateWithoutPresupuestoInput = {
    id_pago?: string
    tenant_id: string
    proyecto_id: string
    concepto: string
    beneficiario: string
    beneficiario_id?: string | null
    monto_programado: Decimal | DecimalJsLike | number | string
    monto_pagado?: Decimal | DecimalJsLike | number | string
    moneda?: string
    fecha_programada: Date | string
    fecha_pago_real?: Date | string | null
    estado?: string
    referencia_modulo?: string | null
    referencia_entidad?: string | null
    referencia_id?: string | null
    metodo_pago?: string | null
    banco?: string | null
    referencia_bancaria?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ProgramaPagosCreateOrConnectWithoutPresupuestoInput = {
    where: ProgramaPagosWhereUniqueInput
    create: XOR<ProgramaPagosCreateWithoutPresupuestoInput, ProgramaPagosUncheckedCreateWithoutPresupuestoInput>
  }

  export type ProgramaPagosCreateManyPresupuestoInputEnvelope = {
    data: ProgramaPagosCreateManyPresupuestoInput | ProgramaPagosCreateManyPresupuestoInput[]
    skipDuplicates?: boolean
  }

  export type MovimientoPresupuestalUpsertWithWhereUniqueWithoutPresupuestoInput = {
    where: MovimientoPresupuestalWhereUniqueInput
    update: XOR<MovimientoPresupuestalUpdateWithoutPresupuestoInput, MovimientoPresupuestalUncheckedUpdateWithoutPresupuestoInput>
    create: XOR<MovimientoPresupuestalCreateWithoutPresupuestoInput, MovimientoPresupuestalUncheckedCreateWithoutPresupuestoInput>
  }

  export type MovimientoPresupuestalUpdateWithWhereUniqueWithoutPresupuestoInput = {
    where: MovimientoPresupuestalWhereUniqueInput
    data: XOR<MovimientoPresupuestalUpdateWithoutPresupuestoInput, MovimientoPresupuestalUncheckedUpdateWithoutPresupuestoInput>
  }

  export type MovimientoPresupuestalUpdateManyWithWhereWithoutPresupuestoInput = {
    where: MovimientoPresupuestalScalarWhereInput
    data: XOR<MovimientoPresupuestalUpdateManyMutationInput, MovimientoPresupuestalUncheckedUpdateManyWithoutPresupuestoInput>
  }

  export type MovimientoPresupuestalScalarWhereInput = {
    AND?: MovimientoPresupuestalScalarWhereInput | MovimientoPresupuestalScalarWhereInput[]
    OR?: MovimientoPresupuestalScalarWhereInput[]
    NOT?: MovimientoPresupuestalScalarWhereInput | MovimientoPresupuestalScalarWhereInput[]
    id_movimiento?: UuidFilter<"MovimientoPresupuestal"> | string
    tenant_id?: UuidFilter<"MovimientoPresupuestal"> | string
    proyecto_id?: UuidFilter<"MovimientoPresupuestal"> | string
    presupuesto_id?: UuidFilter<"MovimientoPresupuestal"> | string
    tipo?: StringFilter<"MovimientoPresupuestal"> | string
    concepto?: StringFilter<"MovimientoPresupuestal"> | string
    monto?: DecimalFilter<"MovimientoPresupuestal"> | Decimal | DecimalJsLike | number | string
    moneda?: StringFilter<"MovimientoPresupuestal"> | string
    referencia_modulo?: StringNullableFilter<"MovimientoPresupuestal"> | string | null
    referencia_entidad?: StringNullableFilter<"MovimientoPresupuestal"> | string | null
    referencia_id?: UuidNullableFilter<"MovimientoPresupuestal"> | string | null
    referencia_codigo?: StringNullableFilter<"MovimientoPresupuestal"> | string | null
    usuario_id?: UuidFilter<"MovimientoPresupuestal"> | string
    fecha_registro?: DateTimeFilter<"MovimientoPresupuestal"> | Date | string
    notas?: StringNullableFilter<"MovimientoPresupuestal"> | string | null
  }

  export type ProgramaPagosUpsertWithWhereUniqueWithoutPresupuestoInput = {
    where: ProgramaPagosWhereUniqueInput
    update: XOR<ProgramaPagosUpdateWithoutPresupuestoInput, ProgramaPagosUncheckedUpdateWithoutPresupuestoInput>
    create: XOR<ProgramaPagosCreateWithoutPresupuestoInput, ProgramaPagosUncheckedCreateWithoutPresupuestoInput>
  }

  export type ProgramaPagosUpdateWithWhereUniqueWithoutPresupuestoInput = {
    where: ProgramaPagosWhereUniqueInput
    data: XOR<ProgramaPagosUpdateWithoutPresupuestoInput, ProgramaPagosUncheckedUpdateWithoutPresupuestoInput>
  }

  export type ProgramaPagosUpdateManyWithWhereWithoutPresupuestoInput = {
    where: ProgramaPagosScalarWhereInput
    data: XOR<ProgramaPagosUpdateManyMutationInput, ProgramaPagosUncheckedUpdateManyWithoutPresupuestoInput>
  }

  export type ProgramaPagosScalarWhereInput = {
    AND?: ProgramaPagosScalarWhereInput | ProgramaPagosScalarWhereInput[]
    OR?: ProgramaPagosScalarWhereInput[]
    NOT?: ProgramaPagosScalarWhereInput | ProgramaPagosScalarWhereInput[]
    id_pago?: UuidFilter<"ProgramaPagos"> | string
    tenant_id?: UuidFilter<"ProgramaPagos"> | string
    proyecto_id?: UuidFilter<"ProgramaPagos"> | string
    presupuesto_id?: UuidFilter<"ProgramaPagos"> | string
    concepto?: StringFilter<"ProgramaPagos"> | string
    beneficiario?: StringFilter<"ProgramaPagos"> | string
    beneficiario_id?: UuidNullableFilter<"ProgramaPagos"> | string | null
    monto_programado?: DecimalFilter<"ProgramaPagos"> | Decimal | DecimalJsLike | number | string
    monto_pagado?: DecimalFilter<"ProgramaPagos"> | Decimal | DecimalJsLike | number | string
    moneda?: StringFilter<"ProgramaPagos"> | string
    fecha_programada?: DateTimeFilter<"ProgramaPagos"> | Date | string
    fecha_pago_real?: DateTimeNullableFilter<"ProgramaPagos"> | Date | string | null
    estado?: StringFilter<"ProgramaPagos"> | string
    referencia_modulo?: StringNullableFilter<"ProgramaPagos"> | string | null
    referencia_entidad?: StringNullableFilter<"ProgramaPagos"> | string | null
    referencia_id?: UuidNullableFilter<"ProgramaPagos"> | string | null
    metodo_pago?: StringNullableFilter<"ProgramaPagos"> | string | null
    banco?: StringNullableFilter<"ProgramaPagos"> | string | null
    referencia_bancaria?: StringNullableFilter<"ProgramaPagos"> | string | null
    created_at?: DateTimeFilter<"ProgramaPagos"> | Date | string
    updated_at?: DateTimeFilter<"ProgramaPagos"> | Date | string
  }

  export type PresupuestoAsignadoCreateWithoutMovimientosInput = {
    id_presupuesto?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    descripcion: string
    monto_autorizado: Decimal | DecimalJsLike | number | string
    monto_ejercido?: Decimal | DecimalJsLike | number | string
    monto_comprometido?: Decimal | DecimalJsLike | number | string
    monto_disponible?: Decimal | DecimalJsLike | number | string
    moneda?: string
    capitulo?: string
    estatus?: string
    created_at?: Date | string
    updated_at?: Date | string
    programa_pagos?: ProgramaPagosCreateNestedManyWithoutPresupuestoInput
  }

  export type PresupuestoAsignadoUncheckedCreateWithoutMovimientosInput = {
    id_presupuesto?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    descripcion: string
    monto_autorizado: Decimal | DecimalJsLike | number | string
    monto_ejercido?: Decimal | DecimalJsLike | number | string
    monto_comprometido?: Decimal | DecimalJsLike | number | string
    monto_disponible?: Decimal | DecimalJsLike | number | string
    moneda?: string
    capitulo?: string
    estatus?: string
    created_at?: Date | string
    updated_at?: Date | string
    programa_pagos?: ProgramaPagosUncheckedCreateNestedManyWithoutPresupuestoInput
  }

  export type PresupuestoAsignadoCreateOrConnectWithoutMovimientosInput = {
    where: PresupuestoAsignadoWhereUniqueInput
    create: XOR<PresupuestoAsignadoCreateWithoutMovimientosInput, PresupuestoAsignadoUncheckedCreateWithoutMovimientosInput>
  }

  export type PresupuestoAsignadoUpsertWithoutMovimientosInput = {
    update: XOR<PresupuestoAsignadoUpdateWithoutMovimientosInput, PresupuestoAsignadoUncheckedUpdateWithoutMovimientosInput>
    create: XOR<PresupuestoAsignadoCreateWithoutMovimientosInput, PresupuestoAsignadoUncheckedCreateWithoutMovimientosInput>
    where?: PresupuestoAsignadoWhereInput
  }

  export type PresupuestoAsignadoUpdateToOneWithWhereWithoutMovimientosInput = {
    where?: PresupuestoAsignadoWhereInput
    data: XOR<PresupuestoAsignadoUpdateWithoutMovimientosInput, PresupuestoAsignadoUncheckedUpdateWithoutMovimientosInput>
  }

  export type PresupuestoAsignadoUpdateWithoutMovimientosInput = {
    id_presupuesto?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    monto_autorizado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_ejercido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_comprometido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_disponible?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    capitulo?: StringFieldUpdateOperationsInput | string
    estatus?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    programa_pagos?: ProgramaPagosUpdateManyWithoutPresupuestoNestedInput
  }

  export type PresupuestoAsignadoUncheckedUpdateWithoutMovimientosInput = {
    id_presupuesto?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    monto_autorizado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_ejercido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_comprometido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_disponible?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    capitulo?: StringFieldUpdateOperationsInput | string
    estatus?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    programa_pagos?: ProgramaPagosUncheckedUpdateManyWithoutPresupuestoNestedInput
  }

  export type PresupuestoAsignadoCreateWithoutPrograma_pagosInput = {
    id_presupuesto?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    descripcion: string
    monto_autorizado: Decimal | DecimalJsLike | number | string
    monto_ejercido?: Decimal | DecimalJsLike | number | string
    monto_comprometido?: Decimal | DecimalJsLike | number | string
    monto_disponible?: Decimal | DecimalJsLike | number | string
    moneda?: string
    capitulo?: string
    estatus?: string
    created_at?: Date | string
    updated_at?: Date | string
    movimientos?: MovimientoPresupuestalCreateNestedManyWithoutPresupuestoInput
  }

  export type PresupuestoAsignadoUncheckedCreateWithoutPrograma_pagosInput = {
    id_presupuesto?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    descripcion: string
    monto_autorizado: Decimal | DecimalJsLike | number | string
    monto_ejercido?: Decimal | DecimalJsLike | number | string
    monto_comprometido?: Decimal | DecimalJsLike | number | string
    monto_disponible?: Decimal | DecimalJsLike | number | string
    moneda?: string
    capitulo?: string
    estatus?: string
    created_at?: Date | string
    updated_at?: Date | string
    movimientos?: MovimientoPresupuestalUncheckedCreateNestedManyWithoutPresupuestoInput
  }

  export type PresupuestoAsignadoCreateOrConnectWithoutPrograma_pagosInput = {
    where: PresupuestoAsignadoWhereUniqueInput
    create: XOR<PresupuestoAsignadoCreateWithoutPrograma_pagosInput, PresupuestoAsignadoUncheckedCreateWithoutPrograma_pagosInput>
  }

  export type PresupuestoAsignadoUpsertWithoutPrograma_pagosInput = {
    update: XOR<PresupuestoAsignadoUpdateWithoutPrograma_pagosInput, PresupuestoAsignadoUncheckedUpdateWithoutPrograma_pagosInput>
    create: XOR<PresupuestoAsignadoCreateWithoutPrograma_pagosInput, PresupuestoAsignadoUncheckedCreateWithoutPrograma_pagosInput>
    where?: PresupuestoAsignadoWhereInput
  }

  export type PresupuestoAsignadoUpdateToOneWithWhereWithoutPrograma_pagosInput = {
    where?: PresupuestoAsignadoWhereInput
    data: XOR<PresupuestoAsignadoUpdateWithoutPrograma_pagosInput, PresupuestoAsignadoUncheckedUpdateWithoutPrograma_pagosInput>
  }

  export type PresupuestoAsignadoUpdateWithoutPrograma_pagosInput = {
    id_presupuesto?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    monto_autorizado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_ejercido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_comprometido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_disponible?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    capitulo?: StringFieldUpdateOperationsInput | string
    estatus?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    movimientos?: MovimientoPresupuestalUpdateManyWithoutPresupuestoNestedInput
  }

  export type PresupuestoAsignadoUncheckedUpdateWithoutPrograma_pagosInput = {
    id_presupuesto?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    monto_autorizado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_ejercido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_comprometido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_disponible?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    capitulo?: StringFieldUpdateOperationsInput | string
    estatus?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    movimientos?: MovimientoPresupuestalUncheckedUpdateManyWithoutPresupuestoNestedInput
  }

  export type MovimientoPresupuestalCreateManyPresupuestoInput = {
    id_movimiento?: string
    tenant_id: string
    proyecto_id: string
    tipo: string
    concepto: string
    monto: Decimal | DecimalJsLike | number | string
    moneda?: string
    referencia_modulo?: string | null
    referencia_entidad?: string | null
    referencia_id?: string | null
    referencia_codigo?: string | null
    usuario_id: string
    fecha_registro?: Date | string
    notas?: string | null
  }

  export type ProgramaPagosCreateManyPresupuestoInput = {
    id_pago?: string
    tenant_id: string
    proyecto_id: string
    concepto: string
    beneficiario: string
    beneficiario_id?: string | null
    monto_programado: Decimal | DecimalJsLike | number | string
    monto_pagado?: Decimal | DecimalJsLike | number | string
    moneda?: string
    fecha_programada: Date | string
    fecha_pago_real?: Date | string | null
    estado?: string
    referencia_modulo?: string | null
    referencia_entidad?: string | null
    referencia_id?: string | null
    metodo_pago?: string | null
    banco?: string | null
    referencia_bancaria?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type MovimientoPresupuestalUpdateWithoutPresupuestoInput = {
    id_movimiento?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    concepto?: StringFieldUpdateOperationsInput | string
    monto?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    referencia_modulo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_entidad?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_id?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_codigo?: NullableStringFieldUpdateOperationsInput | string | null
    usuario_id?: StringFieldUpdateOperationsInput | string
    fecha_registro?: DateTimeFieldUpdateOperationsInput | Date | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type MovimientoPresupuestalUncheckedUpdateWithoutPresupuestoInput = {
    id_movimiento?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    concepto?: StringFieldUpdateOperationsInput | string
    monto?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    referencia_modulo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_entidad?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_id?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_codigo?: NullableStringFieldUpdateOperationsInput | string | null
    usuario_id?: StringFieldUpdateOperationsInput | string
    fecha_registro?: DateTimeFieldUpdateOperationsInput | Date | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type MovimientoPresupuestalUncheckedUpdateManyWithoutPresupuestoInput = {
    id_movimiento?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    concepto?: StringFieldUpdateOperationsInput | string
    monto?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    referencia_modulo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_entidad?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_id?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_codigo?: NullableStringFieldUpdateOperationsInput | string | null
    usuario_id?: StringFieldUpdateOperationsInput | string
    fecha_registro?: DateTimeFieldUpdateOperationsInput | Date | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ProgramaPagosUpdateWithoutPresupuestoInput = {
    id_pago?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    concepto?: StringFieldUpdateOperationsInput | string
    beneficiario?: StringFieldUpdateOperationsInput | string
    beneficiario_id?: NullableStringFieldUpdateOperationsInput | string | null
    monto_programado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_pagado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    fecha_programada?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_pago_real?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    referencia_modulo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_entidad?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_id?: NullableStringFieldUpdateOperationsInput | string | null
    metodo_pago?: NullableStringFieldUpdateOperationsInput | string | null
    banco?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_bancaria?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProgramaPagosUncheckedUpdateWithoutPresupuestoInput = {
    id_pago?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    concepto?: StringFieldUpdateOperationsInput | string
    beneficiario?: StringFieldUpdateOperationsInput | string
    beneficiario_id?: NullableStringFieldUpdateOperationsInput | string | null
    monto_programado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_pagado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    fecha_programada?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_pago_real?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    referencia_modulo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_entidad?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_id?: NullableStringFieldUpdateOperationsInput | string | null
    metodo_pago?: NullableStringFieldUpdateOperationsInput | string | null
    banco?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_bancaria?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProgramaPagosUncheckedUpdateManyWithoutPresupuestoInput = {
    id_pago?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    concepto?: StringFieldUpdateOperationsInput | string
    beneficiario?: StringFieldUpdateOperationsInput | string
    beneficiario_id?: NullableStringFieldUpdateOperationsInput | string | null
    monto_programado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_pagado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    fecha_programada?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_pago_real?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    referencia_modulo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_entidad?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_id?: NullableStringFieldUpdateOperationsInput | string | null
    metodo_pago?: NullableStringFieldUpdateOperationsInput | string | null
    banco?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_bancaria?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use PresupuestoAsignadoCountOutputTypeDefaultArgs instead
     */
    export type PresupuestoAsignadoCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PresupuestoAsignadoCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PresupuestoAsignadoDefaultArgs instead
     */
    export type PresupuestoAsignadoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PresupuestoAsignadoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use MovimientoPresupuestalDefaultArgs instead
     */
    export type MovimientoPresupuestalArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = MovimientoPresupuestalDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ProgramaPagosDefaultArgs instead
     */
    export type ProgramaPagosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProgramaPagosDefaultArgs<ExtArgs>

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