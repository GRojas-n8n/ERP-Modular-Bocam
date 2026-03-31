
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
 * Model AsientoContable
 * 
 */
export type AsientoContable = $Result.DefaultSelection<Prisma.$AsientoContablePayload>
/**
 * Model ConciliacionFiscal
 * 
 */
export type ConciliacionFiscal = $Result.DefaultSelection<Prisma.$ConciliacionFiscalPayload>
/**
 * Model ConciliacionBancaria
 * 
 */
export type ConciliacionBancaria = $Result.DefaultSelection<Prisma.$ConciliacionBancariaPayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more AsientoContables
 * const asientoContables = await prisma.asientoContable.findMany()
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
   * // Fetch zero or more AsientoContables
   * const asientoContables = await prisma.asientoContable.findMany()
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
   * `prisma.asientoContable`: Exposes CRUD operations for the **AsientoContable** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AsientoContables
    * const asientoContables = await prisma.asientoContable.findMany()
    * ```
    */
  get asientoContable(): Prisma.AsientoContableDelegate<ExtArgs>;

  /**
   * `prisma.conciliacionFiscal`: Exposes CRUD operations for the **ConciliacionFiscal** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ConciliacionFiscals
    * const conciliacionFiscals = await prisma.conciliacionFiscal.findMany()
    * ```
    */
  get conciliacionFiscal(): Prisma.ConciliacionFiscalDelegate<ExtArgs>;

  /**
   * `prisma.conciliacionBancaria`: Exposes CRUD operations for the **ConciliacionBancaria** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ConciliacionBancarias
    * const conciliacionBancarias = await prisma.conciliacionBancaria.findMany()
    * ```
    */
  get conciliacionBancaria(): Prisma.ConciliacionBancariaDelegate<ExtArgs>;
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
    AsientoContable: 'AsientoContable',
    ConciliacionFiscal: 'ConciliacionFiscal',
    ConciliacionBancaria: 'ConciliacionBancaria'
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
      modelProps: "asientoContable" | "conciliacionFiscal" | "conciliacionBancaria"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      AsientoContable: {
        payload: Prisma.$AsientoContablePayload<ExtArgs>
        fields: Prisma.AsientoContableFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AsientoContableFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AsientoContablePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AsientoContableFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AsientoContablePayload>
          }
          findFirst: {
            args: Prisma.AsientoContableFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AsientoContablePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AsientoContableFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AsientoContablePayload>
          }
          findMany: {
            args: Prisma.AsientoContableFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AsientoContablePayload>[]
          }
          create: {
            args: Prisma.AsientoContableCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AsientoContablePayload>
          }
          createMany: {
            args: Prisma.AsientoContableCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AsientoContableCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AsientoContablePayload>[]
          }
          delete: {
            args: Prisma.AsientoContableDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AsientoContablePayload>
          }
          update: {
            args: Prisma.AsientoContableUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AsientoContablePayload>
          }
          deleteMany: {
            args: Prisma.AsientoContableDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AsientoContableUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AsientoContableUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AsientoContablePayload>
          }
          aggregate: {
            args: Prisma.AsientoContableAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAsientoContable>
          }
          groupBy: {
            args: Prisma.AsientoContableGroupByArgs<ExtArgs>
            result: $Utils.Optional<AsientoContableGroupByOutputType>[]
          }
          count: {
            args: Prisma.AsientoContableCountArgs<ExtArgs>
            result: $Utils.Optional<AsientoContableCountAggregateOutputType> | number
          }
        }
      }
      ConciliacionFiscal: {
        payload: Prisma.$ConciliacionFiscalPayload<ExtArgs>
        fields: Prisma.ConciliacionFiscalFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ConciliacionFiscalFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConciliacionFiscalPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ConciliacionFiscalFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConciliacionFiscalPayload>
          }
          findFirst: {
            args: Prisma.ConciliacionFiscalFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConciliacionFiscalPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ConciliacionFiscalFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConciliacionFiscalPayload>
          }
          findMany: {
            args: Prisma.ConciliacionFiscalFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConciliacionFiscalPayload>[]
          }
          create: {
            args: Prisma.ConciliacionFiscalCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConciliacionFiscalPayload>
          }
          createMany: {
            args: Prisma.ConciliacionFiscalCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ConciliacionFiscalCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConciliacionFiscalPayload>[]
          }
          delete: {
            args: Prisma.ConciliacionFiscalDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConciliacionFiscalPayload>
          }
          update: {
            args: Prisma.ConciliacionFiscalUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConciliacionFiscalPayload>
          }
          deleteMany: {
            args: Prisma.ConciliacionFiscalDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ConciliacionFiscalUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ConciliacionFiscalUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConciliacionFiscalPayload>
          }
          aggregate: {
            args: Prisma.ConciliacionFiscalAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateConciliacionFiscal>
          }
          groupBy: {
            args: Prisma.ConciliacionFiscalGroupByArgs<ExtArgs>
            result: $Utils.Optional<ConciliacionFiscalGroupByOutputType>[]
          }
          count: {
            args: Prisma.ConciliacionFiscalCountArgs<ExtArgs>
            result: $Utils.Optional<ConciliacionFiscalCountAggregateOutputType> | number
          }
        }
      }
      ConciliacionBancaria: {
        payload: Prisma.$ConciliacionBancariaPayload<ExtArgs>
        fields: Prisma.ConciliacionBancariaFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ConciliacionBancariaFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConciliacionBancariaPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ConciliacionBancariaFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConciliacionBancariaPayload>
          }
          findFirst: {
            args: Prisma.ConciliacionBancariaFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConciliacionBancariaPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ConciliacionBancariaFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConciliacionBancariaPayload>
          }
          findMany: {
            args: Prisma.ConciliacionBancariaFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConciliacionBancariaPayload>[]
          }
          create: {
            args: Prisma.ConciliacionBancariaCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConciliacionBancariaPayload>
          }
          createMany: {
            args: Prisma.ConciliacionBancariaCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ConciliacionBancariaCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConciliacionBancariaPayload>[]
          }
          delete: {
            args: Prisma.ConciliacionBancariaDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConciliacionBancariaPayload>
          }
          update: {
            args: Prisma.ConciliacionBancariaUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConciliacionBancariaPayload>
          }
          deleteMany: {
            args: Prisma.ConciliacionBancariaDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ConciliacionBancariaUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ConciliacionBancariaUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConciliacionBancariaPayload>
          }
          aggregate: {
            args: Prisma.ConciliacionBancariaAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateConciliacionBancaria>
          }
          groupBy: {
            args: Prisma.ConciliacionBancariaGroupByArgs<ExtArgs>
            result: $Utils.Optional<ConciliacionBancariaGroupByOutputType>[]
          }
          count: {
            args: Prisma.ConciliacionBancariaCountArgs<ExtArgs>
            result: $Utils.Optional<ConciliacionBancariaCountAggregateOutputType> | number
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
   * Models
   */

  /**
   * Model AsientoContable
   */

  export type AggregateAsientoContable = {
    _count: AsientoContableCountAggregateOutputType | null
    _avg: AsientoContableAvgAggregateOutputType | null
    _sum: AsientoContableSumAggregateOutputType | null
    _min: AsientoContableMinAggregateOutputType | null
    _max: AsientoContableMaxAggregateOutputType | null
  }

  export type AsientoContableAvgAggregateOutputType = {
    monto_total: Decimal | null
  }

  export type AsientoContableSumAggregateOutputType = {
    monto_total: Decimal | null
  }

  export type AsientoContableMinAggregateOutputType = {
    id_asiento: string | null
    tenant_id: string | null
    proyecto_id: string | null
    pago_id: string | null
    external_event_key: string | null
    referencia_funcional: string | null
    evento_conciliacion_key: string | null
    tipo_poliza: string | null
    folio_poliza: string | null
    concepto: string | null
    monto_total: Decimal | null
    moneda: string | null
    fecha_poliza: Date | null
    beneficiario: string | null
    referencia_modulo: string | null
    referencia_entidad: string | null
    referencia_id: string | null
    estatus: string | null
    cfdi_status: string | null
    bancario_status: string | null
    notas: string | null
    conciliado_at: Date | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type AsientoContableMaxAggregateOutputType = {
    id_asiento: string | null
    tenant_id: string | null
    proyecto_id: string | null
    pago_id: string | null
    external_event_key: string | null
    referencia_funcional: string | null
    evento_conciliacion_key: string | null
    tipo_poliza: string | null
    folio_poliza: string | null
    concepto: string | null
    monto_total: Decimal | null
    moneda: string | null
    fecha_poliza: Date | null
    beneficiario: string | null
    referencia_modulo: string | null
    referencia_entidad: string | null
    referencia_id: string | null
    estatus: string | null
    cfdi_status: string | null
    bancario_status: string | null
    notas: string | null
    conciliado_at: Date | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type AsientoContableCountAggregateOutputType = {
    id_asiento: number
    tenant_id: number
    proyecto_id: number
    pago_id: number
    external_event_key: number
    referencia_funcional: number
    evento_conciliacion_key: number
    tipo_poliza: number
    folio_poliza: number
    concepto: number
    monto_total: number
    moneda: number
    fecha_poliza: number
    beneficiario: number
    referencia_modulo: number
    referencia_entidad: number
    referencia_id: number
    estatus: number
    cfdi_status: number
    bancario_status: number
    notas: number
    conciliado_at: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type AsientoContableAvgAggregateInputType = {
    monto_total?: true
  }

  export type AsientoContableSumAggregateInputType = {
    monto_total?: true
  }

  export type AsientoContableMinAggregateInputType = {
    id_asiento?: true
    tenant_id?: true
    proyecto_id?: true
    pago_id?: true
    external_event_key?: true
    referencia_funcional?: true
    evento_conciliacion_key?: true
    tipo_poliza?: true
    folio_poliza?: true
    concepto?: true
    monto_total?: true
    moneda?: true
    fecha_poliza?: true
    beneficiario?: true
    referencia_modulo?: true
    referencia_entidad?: true
    referencia_id?: true
    estatus?: true
    cfdi_status?: true
    bancario_status?: true
    notas?: true
    conciliado_at?: true
    created_at?: true
    updated_at?: true
  }

  export type AsientoContableMaxAggregateInputType = {
    id_asiento?: true
    tenant_id?: true
    proyecto_id?: true
    pago_id?: true
    external_event_key?: true
    referencia_funcional?: true
    evento_conciliacion_key?: true
    tipo_poliza?: true
    folio_poliza?: true
    concepto?: true
    monto_total?: true
    moneda?: true
    fecha_poliza?: true
    beneficiario?: true
    referencia_modulo?: true
    referencia_entidad?: true
    referencia_id?: true
    estatus?: true
    cfdi_status?: true
    bancario_status?: true
    notas?: true
    conciliado_at?: true
    created_at?: true
    updated_at?: true
  }

  export type AsientoContableCountAggregateInputType = {
    id_asiento?: true
    tenant_id?: true
    proyecto_id?: true
    pago_id?: true
    external_event_key?: true
    referencia_funcional?: true
    evento_conciliacion_key?: true
    tipo_poliza?: true
    folio_poliza?: true
    concepto?: true
    monto_total?: true
    moneda?: true
    fecha_poliza?: true
    beneficiario?: true
    referencia_modulo?: true
    referencia_entidad?: true
    referencia_id?: true
    estatus?: true
    cfdi_status?: true
    bancario_status?: true
    notas?: true
    conciliado_at?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type AsientoContableAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AsientoContable to aggregate.
     */
    where?: AsientoContableWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AsientoContables to fetch.
     */
    orderBy?: AsientoContableOrderByWithRelationInput | AsientoContableOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AsientoContableWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AsientoContables from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AsientoContables.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AsientoContables
    **/
    _count?: true | AsientoContableCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AsientoContableAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AsientoContableSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AsientoContableMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AsientoContableMaxAggregateInputType
  }

  export type GetAsientoContableAggregateType<T extends AsientoContableAggregateArgs> = {
        [P in keyof T & keyof AggregateAsientoContable]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAsientoContable[P]>
      : GetScalarType<T[P], AggregateAsientoContable[P]>
  }




  export type AsientoContableGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AsientoContableWhereInput
    orderBy?: AsientoContableOrderByWithAggregationInput | AsientoContableOrderByWithAggregationInput[]
    by: AsientoContableScalarFieldEnum[] | AsientoContableScalarFieldEnum
    having?: AsientoContableScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AsientoContableCountAggregateInputType | true
    _avg?: AsientoContableAvgAggregateInputType
    _sum?: AsientoContableSumAggregateInputType
    _min?: AsientoContableMinAggregateInputType
    _max?: AsientoContableMaxAggregateInputType
  }

  export type AsientoContableGroupByOutputType = {
    id_asiento: string
    tenant_id: string
    proyecto_id: string
    pago_id: string | null
    external_event_key: string | null
    referencia_funcional: string | null
    evento_conciliacion_key: string | null
    tipo_poliza: string
    folio_poliza: string
    concepto: string
    monto_total: Decimal
    moneda: string
    fecha_poliza: Date
    beneficiario: string
    referencia_modulo: string | null
    referencia_entidad: string | null
    referencia_id: string | null
    estatus: string
    cfdi_status: string
    bancario_status: string
    notas: string | null
    conciliado_at: Date | null
    created_at: Date
    updated_at: Date
    _count: AsientoContableCountAggregateOutputType | null
    _avg: AsientoContableAvgAggregateOutputType | null
    _sum: AsientoContableSumAggregateOutputType | null
    _min: AsientoContableMinAggregateOutputType | null
    _max: AsientoContableMaxAggregateOutputType | null
  }

  type GetAsientoContableGroupByPayload<T extends AsientoContableGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AsientoContableGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AsientoContableGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AsientoContableGroupByOutputType[P]>
            : GetScalarType<T[P], AsientoContableGroupByOutputType[P]>
        }
      >
    >


  export type AsientoContableSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_asiento?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    pago_id?: boolean
    external_event_key?: boolean
    referencia_funcional?: boolean
    evento_conciliacion_key?: boolean
    tipo_poliza?: boolean
    folio_poliza?: boolean
    concepto?: boolean
    monto_total?: boolean
    moneda?: boolean
    fecha_poliza?: boolean
    beneficiario?: boolean
    referencia_modulo?: boolean
    referencia_entidad?: boolean
    referencia_id?: boolean
    estatus?: boolean
    cfdi_status?: boolean
    bancario_status?: boolean
    notas?: boolean
    conciliado_at?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["asientoContable"]>

  export type AsientoContableSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_asiento?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    pago_id?: boolean
    external_event_key?: boolean
    referencia_funcional?: boolean
    evento_conciliacion_key?: boolean
    tipo_poliza?: boolean
    folio_poliza?: boolean
    concepto?: boolean
    monto_total?: boolean
    moneda?: boolean
    fecha_poliza?: boolean
    beneficiario?: boolean
    referencia_modulo?: boolean
    referencia_entidad?: boolean
    referencia_id?: boolean
    estatus?: boolean
    cfdi_status?: boolean
    bancario_status?: boolean
    notas?: boolean
    conciliado_at?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["asientoContable"]>

  export type AsientoContableSelectScalar = {
    id_asiento?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    pago_id?: boolean
    external_event_key?: boolean
    referencia_funcional?: boolean
    evento_conciliacion_key?: boolean
    tipo_poliza?: boolean
    folio_poliza?: boolean
    concepto?: boolean
    monto_total?: boolean
    moneda?: boolean
    fecha_poliza?: boolean
    beneficiario?: boolean
    referencia_modulo?: boolean
    referencia_entidad?: boolean
    referencia_id?: boolean
    estatus?: boolean
    cfdi_status?: boolean
    bancario_status?: boolean
    notas?: boolean
    conciliado_at?: boolean
    created_at?: boolean
    updated_at?: boolean
  }


  export type $AsientoContablePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AsientoContable"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id_asiento: string
      tenant_id: string
      proyecto_id: string
      pago_id: string | null
      external_event_key: string | null
      referencia_funcional: string | null
      evento_conciliacion_key: string | null
      tipo_poliza: string
      folio_poliza: string
      concepto: string
      monto_total: Prisma.Decimal
      moneda: string
      fecha_poliza: Date
      beneficiario: string
      referencia_modulo: string | null
      referencia_entidad: string | null
      referencia_id: string | null
      estatus: string
      cfdi_status: string
      bancario_status: string
      notas: string | null
      conciliado_at: Date | null
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["asientoContable"]>
    composites: {}
  }

  type AsientoContableGetPayload<S extends boolean | null | undefined | AsientoContableDefaultArgs> = $Result.GetResult<Prisma.$AsientoContablePayload, S>

  type AsientoContableCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<AsientoContableFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: AsientoContableCountAggregateInputType | true
    }

  export interface AsientoContableDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AsientoContable'], meta: { name: 'AsientoContable' } }
    /**
     * Find zero or one AsientoContable that matches the filter.
     * @param {AsientoContableFindUniqueArgs} args - Arguments to find a AsientoContable
     * @example
     * // Get one AsientoContable
     * const asientoContable = await prisma.asientoContable.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AsientoContableFindUniqueArgs>(args: SelectSubset<T, AsientoContableFindUniqueArgs<ExtArgs>>): Prisma__AsientoContableClient<$Result.GetResult<Prisma.$AsientoContablePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one AsientoContable that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {AsientoContableFindUniqueOrThrowArgs} args - Arguments to find a AsientoContable
     * @example
     * // Get one AsientoContable
     * const asientoContable = await prisma.asientoContable.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AsientoContableFindUniqueOrThrowArgs>(args: SelectSubset<T, AsientoContableFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AsientoContableClient<$Result.GetResult<Prisma.$AsientoContablePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first AsientoContable that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AsientoContableFindFirstArgs} args - Arguments to find a AsientoContable
     * @example
     * // Get one AsientoContable
     * const asientoContable = await prisma.asientoContable.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AsientoContableFindFirstArgs>(args?: SelectSubset<T, AsientoContableFindFirstArgs<ExtArgs>>): Prisma__AsientoContableClient<$Result.GetResult<Prisma.$AsientoContablePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first AsientoContable that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AsientoContableFindFirstOrThrowArgs} args - Arguments to find a AsientoContable
     * @example
     * // Get one AsientoContable
     * const asientoContable = await prisma.asientoContable.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AsientoContableFindFirstOrThrowArgs>(args?: SelectSubset<T, AsientoContableFindFirstOrThrowArgs<ExtArgs>>): Prisma__AsientoContableClient<$Result.GetResult<Prisma.$AsientoContablePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more AsientoContables that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AsientoContableFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AsientoContables
     * const asientoContables = await prisma.asientoContable.findMany()
     * 
     * // Get first 10 AsientoContables
     * const asientoContables = await prisma.asientoContable.findMany({ take: 10 })
     * 
     * // Only select the `id_asiento`
     * const asientoContableWithId_asientoOnly = await prisma.asientoContable.findMany({ select: { id_asiento: true } })
     * 
     */
    findMany<T extends AsientoContableFindManyArgs>(args?: SelectSubset<T, AsientoContableFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AsientoContablePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a AsientoContable.
     * @param {AsientoContableCreateArgs} args - Arguments to create a AsientoContable.
     * @example
     * // Create one AsientoContable
     * const AsientoContable = await prisma.asientoContable.create({
     *   data: {
     *     // ... data to create a AsientoContable
     *   }
     * })
     * 
     */
    create<T extends AsientoContableCreateArgs>(args: SelectSubset<T, AsientoContableCreateArgs<ExtArgs>>): Prisma__AsientoContableClient<$Result.GetResult<Prisma.$AsientoContablePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many AsientoContables.
     * @param {AsientoContableCreateManyArgs} args - Arguments to create many AsientoContables.
     * @example
     * // Create many AsientoContables
     * const asientoContable = await prisma.asientoContable.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AsientoContableCreateManyArgs>(args?: SelectSubset<T, AsientoContableCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AsientoContables and returns the data saved in the database.
     * @param {AsientoContableCreateManyAndReturnArgs} args - Arguments to create many AsientoContables.
     * @example
     * // Create many AsientoContables
     * const asientoContable = await prisma.asientoContable.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AsientoContables and only return the `id_asiento`
     * const asientoContableWithId_asientoOnly = await prisma.asientoContable.createManyAndReturn({ 
     *   select: { id_asiento: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AsientoContableCreateManyAndReturnArgs>(args?: SelectSubset<T, AsientoContableCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AsientoContablePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a AsientoContable.
     * @param {AsientoContableDeleteArgs} args - Arguments to delete one AsientoContable.
     * @example
     * // Delete one AsientoContable
     * const AsientoContable = await prisma.asientoContable.delete({
     *   where: {
     *     // ... filter to delete one AsientoContable
     *   }
     * })
     * 
     */
    delete<T extends AsientoContableDeleteArgs>(args: SelectSubset<T, AsientoContableDeleteArgs<ExtArgs>>): Prisma__AsientoContableClient<$Result.GetResult<Prisma.$AsientoContablePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one AsientoContable.
     * @param {AsientoContableUpdateArgs} args - Arguments to update one AsientoContable.
     * @example
     * // Update one AsientoContable
     * const asientoContable = await prisma.asientoContable.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AsientoContableUpdateArgs>(args: SelectSubset<T, AsientoContableUpdateArgs<ExtArgs>>): Prisma__AsientoContableClient<$Result.GetResult<Prisma.$AsientoContablePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more AsientoContables.
     * @param {AsientoContableDeleteManyArgs} args - Arguments to filter AsientoContables to delete.
     * @example
     * // Delete a few AsientoContables
     * const { count } = await prisma.asientoContable.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AsientoContableDeleteManyArgs>(args?: SelectSubset<T, AsientoContableDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AsientoContables.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AsientoContableUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AsientoContables
     * const asientoContable = await prisma.asientoContable.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AsientoContableUpdateManyArgs>(args: SelectSubset<T, AsientoContableUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one AsientoContable.
     * @param {AsientoContableUpsertArgs} args - Arguments to update or create a AsientoContable.
     * @example
     * // Update or create a AsientoContable
     * const asientoContable = await prisma.asientoContable.upsert({
     *   create: {
     *     // ... data to create a AsientoContable
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AsientoContable we want to update
     *   }
     * })
     */
    upsert<T extends AsientoContableUpsertArgs>(args: SelectSubset<T, AsientoContableUpsertArgs<ExtArgs>>): Prisma__AsientoContableClient<$Result.GetResult<Prisma.$AsientoContablePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of AsientoContables.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AsientoContableCountArgs} args - Arguments to filter AsientoContables to count.
     * @example
     * // Count the number of AsientoContables
     * const count = await prisma.asientoContable.count({
     *   where: {
     *     // ... the filter for the AsientoContables we want to count
     *   }
     * })
    **/
    count<T extends AsientoContableCountArgs>(
      args?: Subset<T, AsientoContableCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AsientoContableCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AsientoContable.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AsientoContableAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends AsientoContableAggregateArgs>(args: Subset<T, AsientoContableAggregateArgs>): Prisma.PrismaPromise<GetAsientoContableAggregateType<T>>

    /**
     * Group by AsientoContable.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AsientoContableGroupByArgs} args - Group by arguments.
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
      T extends AsientoContableGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AsientoContableGroupByArgs['orderBy'] }
        : { orderBy?: AsientoContableGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, AsientoContableGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAsientoContableGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AsientoContable model
   */
  readonly fields: AsientoContableFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AsientoContable.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AsientoContableClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the AsientoContable model
   */ 
  interface AsientoContableFieldRefs {
    readonly id_asiento: FieldRef<"AsientoContable", 'String'>
    readonly tenant_id: FieldRef<"AsientoContable", 'String'>
    readonly proyecto_id: FieldRef<"AsientoContable", 'String'>
    readonly pago_id: FieldRef<"AsientoContable", 'String'>
    readonly external_event_key: FieldRef<"AsientoContable", 'String'>
    readonly referencia_funcional: FieldRef<"AsientoContable", 'String'>
    readonly evento_conciliacion_key: FieldRef<"AsientoContable", 'String'>
    readonly tipo_poliza: FieldRef<"AsientoContable", 'String'>
    readonly folio_poliza: FieldRef<"AsientoContable", 'String'>
    readonly concepto: FieldRef<"AsientoContable", 'String'>
    readonly monto_total: FieldRef<"AsientoContable", 'Decimal'>
    readonly moneda: FieldRef<"AsientoContable", 'String'>
    readonly fecha_poliza: FieldRef<"AsientoContable", 'DateTime'>
    readonly beneficiario: FieldRef<"AsientoContable", 'String'>
    readonly referencia_modulo: FieldRef<"AsientoContable", 'String'>
    readonly referencia_entidad: FieldRef<"AsientoContable", 'String'>
    readonly referencia_id: FieldRef<"AsientoContable", 'String'>
    readonly estatus: FieldRef<"AsientoContable", 'String'>
    readonly cfdi_status: FieldRef<"AsientoContable", 'String'>
    readonly bancario_status: FieldRef<"AsientoContable", 'String'>
    readonly notas: FieldRef<"AsientoContable", 'String'>
    readonly conciliado_at: FieldRef<"AsientoContable", 'DateTime'>
    readonly created_at: FieldRef<"AsientoContable", 'DateTime'>
    readonly updated_at: FieldRef<"AsientoContable", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AsientoContable findUnique
   */
  export type AsientoContableFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AsientoContable
     */
    select?: AsientoContableSelect<ExtArgs> | null
    /**
     * Filter, which AsientoContable to fetch.
     */
    where: AsientoContableWhereUniqueInput
  }

  /**
   * AsientoContable findUniqueOrThrow
   */
  export type AsientoContableFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AsientoContable
     */
    select?: AsientoContableSelect<ExtArgs> | null
    /**
     * Filter, which AsientoContable to fetch.
     */
    where: AsientoContableWhereUniqueInput
  }

  /**
   * AsientoContable findFirst
   */
  export type AsientoContableFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AsientoContable
     */
    select?: AsientoContableSelect<ExtArgs> | null
    /**
     * Filter, which AsientoContable to fetch.
     */
    where?: AsientoContableWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AsientoContables to fetch.
     */
    orderBy?: AsientoContableOrderByWithRelationInput | AsientoContableOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AsientoContables.
     */
    cursor?: AsientoContableWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AsientoContables from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AsientoContables.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AsientoContables.
     */
    distinct?: AsientoContableScalarFieldEnum | AsientoContableScalarFieldEnum[]
  }

  /**
   * AsientoContable findFirstOrThrow
   */
  export type AsientoContableFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AsientoContable
     */
    select?: AsientoContableSelect<ExtArgs> | null
    /**
     * Filter, which AsientoContable to fetch.
     */
    where?: AsientoContableWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AsientoContables to fetch.
     */
    orderBy?: AsientoContableOrderByWithRelationInput | AsientoContableOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AsientoContables.
     */
    cursor?: AsientoContableWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AsientoContables from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AsientoContables.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AsientoContables.
     */
    distinct?: AsientoContableScalarFieldEnum | AsientoContableScalarFieldEnum[]
  }

  /**
   * AsientoContable findMany
   */
  export type AsientoContableFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AsientoContable
     */
    select?: AsientoContableSelect<ExtArgs> | null
    /**
     * Filter, which AsientoContables to fetch.
     */
    where?: AsientoContableWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AsientoContables to fetch.
     */
    orderBy?: AsientoContableOrderByWithRelationInput | AsientoContableOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AsientoContables.
     */
    cursor?: AsientoContableWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AsientoContables from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AsientoContables.
     */
    skip?: number
    distinct?: AsientoContableScalarFieldEnum | AsientoContableScalarFieldEnum[]
  }

  /**
   * AsientoContable create
   */
  export type AsientoContableCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AsientoContable
     */
    select?: AsientoContableSelect<ExtArgs> | null
    /**
     * The data needed to create a AsientoContable.
     */
    data: XOR<AsientoContableCreateInput, AsientoContableUncheckedCreateInput>
  }

  /**
   * AsientoContable createMany
   */
  export type AsientoContableCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AsientoContables.
     */
    data: AsientoContableCreateManyInput | AsientoContableCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AsientoContable createManyAndReturn
   */
  export type AsientoContableCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AsientoContable
     */
    select?: AsientoContableSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many AsientoContables.
     */
    data: AsientoContableCreateManyInput | AsientoContableCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AsientoContable update
   */
  export type AsientoContableUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AsientoContable
     */
    select?: AsientoContableSelect<ExtArgs> | null
    /**
     * The data needed to update a AsientoContable.
     */
    data: XOR<AsientoContableUpdateInput, AsientoContableUncheckedUpdateInput>
    /**
     * Choose, which AsientoContable to update.
     */
    where: AsientoContableWhereUniqueInput
  }

  /**
   * AsientoContable updateMany
   */
  export type AsientoContableUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AsientoContables.
     */
    data: XOR<AsientoContableUpdateManyMutationInput, AsientoContableUncheckedUpdateManyInput>
    /**
     * Filter which AsientoContables to update
     */
    where?: AsientoContableWhereInput
  }

  /**
   * AsientoContable upsert
   */
  export type AsientoContableUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AsientoContable
     */
    select?: AsientoContableSelect<ExtArgs> | null
    /**
     * The filter to search for the AsientoContable to update in case it exists.
     */
    where: AsientoContableWhereUniqueInput
    /**
     * In case the AsientoContable found by the `where` argument doesn't exist, create a new AsientoContable with this data.
     */
    create: XOR<AsientoContableCreateInput, AsientoContableUncheckedCreateInput>
    /**
     * In case the AsientoContable was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AsientoContableUpdateInput, AsientoContableUncheckedUpdateInput>
  }

  /**
   * AsientoContable delete
   */
  export type AsientoContableDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AsientoContable
     */
    select?: AsientoContableSelect<ExtArgs> | null
    /**
     * Filter which AsientoContable to delete.
     */
    where: AsientoContableWhereUniqueInput
  }

  /**
   * AsientoContable deleteMany
   */
  export type AsientoContableDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AsientoContables to delete
     */
    where?: AsientoContableWhereInput
  }

  /**
   * AsientoContable without action
   */
  export type AsientoContableDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AsientoContable
     */
    select?: AsientoContableSelect<ExtArgs> | null
  }


  /**
   * Model ConciliacionFiscal
   */

  export type AggregateConciliacionFiscal = {
    _count: ConciliacionFiscalCountAggregateOutputType | null
    _avg: ConciliacionFiscalAvgAggregateOutputType | null
    _sum: ConciliacionFiscalSumAggregateOutputType | null
    _min: ConciliacionFiscalMinAggregateOutputType | null
    _max: ConciliacionFiscalMaxAggregateOutputType | null
  }

  export type ConciliacionFiscalAvgAggregateOutputType = {
    monto_pagado: Decimal | null
    monto_cfdi: Decimal | null
    sat_retry_count: number | null
  }

  export type ConciliacionFiscalSumAggregateOutputType = {
    monto_pagado: Decimal | null
    monto_cfdi: Decimal | null
    sat_retry_count: number | null
  }

  export type ConciliacionFiscalMinAggregateOutputType = {
    id_conciliacion: string | null
    tenant_id: string | null
    proyecto_id: string | null
    asiento_id: string | null
    pago_id: string | null
    uuid_fiscal: string | null
    serie: string | null
    folio: string | null
    rfc_emisor: string | null
    rfc_receptor: string | null
    monto_pagado: Decimal | null
    monto_cfdi: Decimal | null
    moneda: string | null
    fecha_emision: Date | null
    fecha_timbrado: Date | null
    estatus_fiscal: string | null
    estatus_sat: string | null
    fecha_validacion_sat: Date | null
    fecha_cancelacion_sat: Date | null
    ultima_verificacion_sat_at: Date | null
    sat_requested_at: Date | null
    sat_next_retry_at: Date | null
    sat_dlq_at: Date | null
    sat_retry_count: number | null
    sat_dispatch_id: string | null
    sat_last_completed_dispatch_id: string | null
    sat_processing_started_at: Date | null
    mensaje_sat: string | null
    sat_last_error: string | null
    fuente: string | null
    fecha_conciliacion: Date | null
    notas: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type ConciliacionFiscalMaxAggregateOutputType = {
    id_conciliacion: string | null
    tenant_id: string | null
    proyecto_id: string | null
    asiento_id: string | null
    pago_id: string | null
    uuid_fiscal: string | null
    serie: string | null
    folio: string | null
    rfc_emisor: string | null
    rfc_receptor: string | null
    monto_pagado: Decimal | null
    monto_cfdi: Decimal | null
    moneda: string | null
    fecha_emision: Date | null
    fecha_timbrado: Date | null
    estatus_fiscal: string | null
    estatus_sat: string | null
    fecha_validacion_sat: Date | null
    fecha_cancelacion_sat: Date | null
    ultima_verificacion_sat_at: Date | null
    sat_requested_at: Date | null
    sat_next_retry_at: Date | null
    sat_dlq_at: Date | null
    sat_retry_count: number | null
    sat_dispatch_id: string | null
    sat_last_completed_dispatch_id: string | null
    sat_processing_started_at: Date | null
    mensaje_sat: string | null
    sat_last_error: string | null
    fuente: string | null
    fecha_conciliacion: Date | null
    notas: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type ConciliacionFiscalCountAggregateOutputType = {
    id_conciliacion: number
    tenant_id: number
    proyecto_id: number
    asiento_id: number
    pago_id: number
    uuid_fiscal: number
    serie: number
    folio: number
    rfc_emisor: number
    rfc_receptor: number
    monto_pagado: number
    monto_cfdi: number
    moneda: number
    fecha_emision: number
    fecha_timbrado: number
    estatus_fiscal: number
    estatus_sat: number
    fecha_validacion_sat: number
    fecha_cancelacion_sat: number
    ultima_verificacion_sat_at: number
    sat_requested_at: number
    sat_next_retry_at: number
    sat_dlq_at: number
    sat_retry_count: number
    sat_dispatch_id: number
    sat_last_completed_dispatch_id: number
    sat_processing_started_at: number
    mensaje_sat: number
    sat_last_error: number
    fuente: number
    fecha_conciliacion: number
    notas: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type ConciliacionFiscalAvgAggregateInputType = {
    monto_pagado?: true
    monto_cfdi?: true
    sat_retry_count?: true
  }

  export type ConciliacionFiscalSumAggregateInputType = {
    monto_pagado?: true
    monto_cfdi?: true
    sat_retry_count?: true
  }

  export type ConciliacionFiscalMinAggregateInputType = {
    id_conciliacion?: true
    tenant_id?: true
    proyecto_id?: true
    asiento_id?: true
    pago_id?: true
    uuid_fiscal?: true
    serie?: true
    folio?: true
    rfc_emisor?: true
    rfc_receptor?: true
    monto_pagado?: true
    monto_cfdi?: true
    moneda?: true
    fecha_emision?: true
    fecha_timbrado?: true
    estatus_fiscal?: true
    estatus_sat?: true
    fecha_validacion_sat?: true
    fecha_cancelacion_sat?: true
    ultima_verificacion_sat_at?: true
    sat_requested_at?: true
    sat_next_retry_at?: true
    sat_dlq_at?: true
    sat_retry_count?: true
    sat_dispatch_id?: true
    sat_last_completed_dispatch_id?: true
    sat_processing_started_at?: true
    mensaje_sat?: true
    sat_last_error?: true
    fuente?: true
    fecha_conciliacion?: true
    notas?: true
    created_at?: true
    updated_at?: true
  }

  export type ConciliacionFiscalMaxAggregateInputType = {
    id_conciliacion?: true
    tenant_id?: true
    proyecto_id?: true
    asiento_id?: true
    pago_id?: true
    uuid_fiscal?: true
    serie?: true
    folio?: true
    rfc_emisor?: true
    rfc_receptor?: true
    monto_pagado?: true
    monto_cfdi?: true
    moneda?: true
    fecha_emision?: true
    fecha_timbrado?: true
    estatus_fiscal?: true
    estatus_sat?: true
    fecha_validacion_sat?: true
    fecha_cancelacion_sat?: true
    ultima_verificacion_sat_at?: true
    sat_requested_at?: true
    sat_next_retry_at?: true
    sat_dlq_at?: true
    sat_retry_count?: true
    sat_dispatch_id?: true
    sat_last_completed_dispatch_id?: true
    sat_processing_started_at?: true
    mensaje_sat?: true
    sat_last_error?: true
    fuente?: true
    fecha_conciliacion?: true
    notas?: true
    created_at?: true
    updated_at?: true
  }

  export type ConciliacionFiscalCountAggregateInputType = {
    id_conciliacion?: true
    tenant_id?: true
    proyecto_id?: true
    asiento_id?: true
    pago_id?: true
    uuid_fiscal?: true
    serie?: true
    folio?: true
    rfc_emisor?: true
    rfc_receptor?: true
    monto_pagado?: true
    monto_cfdi?: true
    moneda?: true
    fecha_emision?: true
    fecha_timbrado?: true
    estatus_fiscal?: true
    estatus_sat?: true
    fecha_validacion_sat?: true
    fecha_cancelacion_sat?: true
    ultima_verificacion_sat_at?: true
    sat_requested_at?: true
    sat_next_retry_at?: true
    sat_dlq_at?: true
    sat_retry_count?: true
    sat_dispatch_id?: true
    sat_last_completed_dispatch_id?: true
    sat_processing_started_at?: true
    mensaje_sat?: true
    sat_last_error?: true
    fuente?: true
    fecha_conciliacion?: true
    notas?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type ConciliacionFiscalAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ConciliacionFiscal to aggregate.
     */
    where?: ConciliacionFiscalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConciliacionFiscals to fetch.
     */
    orderBy?: ConciliacionFiscalOrderByWithRelationInput | ConciliacionFiscalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ConciliacionFiscalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConciliacionFiscals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConciliacionFiscals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ConciliacionFiscals
    **/
    _count?: true | ConciliacionFiscalCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ConciliacionFiscalAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ConciliacionFiscalSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ConciliacionFiscalMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ConciliacionFiscalMaxAggregateInputType
  }

  export type GetConciliacionFiscalAggregateType<T extends ConciliacionFiscalAggregateArgs> = {
        [P in keyof T & keyof AggregateConciliacionFiscal]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateConciliacionFiscal[P]>
      : GetScalarType<T[P], AggregateConciliacionFiscal[P]>
  }




  export type ConciliacionFiscalGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ConciliacionFiscalWhereInput
    orderBy?: ConciliacionFiscalOrderByWithAggregationInput | ConciliacionFiscalOrderByWithAggregationInput[]
    by: ConciliacionFiscalScalarFieldEnum[] | ConciliacionFiscalScalarFieldEnum
    having?: ConciliacionFiscalScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ConciliacionFiscalCountAggregateInputType | true
    _avg?: ConciliacionFiscalAvgAggregateInputType
    _sum?: ConciliacionFiscalSumAggregateInputType
    _min?: ConciliacionFiscalMinAggregateInputType
    _max?: ConciliacionFiscalMaxAggregateInputType
  }

  export type ConciliacionFiscalGroupByOutputType = {
    id_conciliacion: string
    tenant_id: string
    proyecto_id: string
    asiento_id: string
    pago_id: string | null
    uuid_fiscal: string | null
    serie: string | null
    folio: string | null
    rfc_emisor: string | null
    rfc_receptor: string | null
    monto_pagado: Decimal
    monto_cfdi: Decimal | null
    moneda: string
    fecha_emision: Date | null
    fecha_timbrado: Date | null
    estatus_fiscal: string
    estatus_sat: string
    fecha_validacion_sat: Date | null
    fecha_cancelacion_sat: Date | null
    ultima_verificacion_sat_at: Date | null
    sat_requested_at: Date | null
    sat_next_retry_at: Date | null
    sat_dlq_at: Date | null
    sat_retry_count: number
    sat_dispatch_id: string | null
    sat_last_completed_dispatch_id: string | null
    sat_processing_started_at: Date | null
    mensaje_sat: string | null
    sat_last_error: string | null
    fuente: string
    fecha_conciliacion: Date | null
    notas: string | null
    created_at: Date
    updated_at: Date
    _count: ConciliacionFiscalCountAggregateOutputType | null
    _avg: ConciliacionFiscalAvgAggregateOutputType | null
    _sum: ConciliacionFiscalSumAggregateOutputType | null
    _min: ConciliacionFiscalMinAggregateOutputType | null
    _max: ConciliacionFiscalMaxAggregateOutputType | null
  }

  type GetConciliacionFiscalGroupByPayload<T extends ConciliacionFiscalGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ConciliacionFiscalGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ConciliacionFiscalGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ConciliacionFiscalGroupByOutputType[P]>
            : GetScalarType<T[P], ConciliacionFiscalGroupByOutputType[P]>
        }
      >
    >


  export type ConciliacionFiscalSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_conciliacion?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    asiento_id?: boolean
    pago_id?: boolean
    uuid_fiscal?: boolean
    serie?: boolean
    folio?: boolean
    rfc_emisor?: boolean
    rfc_receptor?: boolean
    monto_pagado?: boolean
    monto_cfdi?: boolean
    moneda?: boolean
    fecha_emision?: boolean
    fecha_timbrado?: boolean
    estatus_fiscal?: boolean
    estatus_sat?: boolean
    fecha_validacion_sat?: boolean
    fecha_cancelacion_sat?: boolean
    ultima_verificacion_sat_at?: boolean
    sat_requested_at?: boolean
    sat_next_retry_at?: boolean
    sat_dlq_at?: boolean
    sat_retry_count?: boolean
    sat_dispatch_id?: boolean
    sat_last_completed_dispatch_id?: boolean
    sat_processing_started_at?: boolean
    mensaje_sat?: boolean
    sat_last_error?: boolean
    fuente?: boolean
    fecha_conciliacion?: boolean
    notas?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["conciliacionFiscal"]>

  export type ConciliacionFiscalSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_conciliacion?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    asiento_id?: boolean
    pago_id?: boolean
    uuid_fiscal?: boolean
    serie?: boolean
    folio?: boolean
    rfc_emisor?: boolean
    rfc_receptor?: boolean
    monto_pagado?: boolean
    monto_cfdi?: boolean
    moneda?: boolean
    fecha_emision?: boolean
    fecha_timbrado?: boolean
    estatus_fiscal?: boolean
    estatus_sat?: boolean
    fecha_validacion_sat?: boolean
    fecha_cancelacion_sat?: boolean
    ultima_verificacion_sat_at?: boolean
    sat_requested_at?: boolean
    sat_next_retry_at?: boolean
    sat_dlq_at?: boolean
    sat_retry_count?: boolean
    sat_dispatch_id?: boolean
    sat_last_completed_dispatch_id?: boolean
    sat_processing_started_at?: boolean
    mensaje_sat?: boolean
    sat_last_error?: boolean
    fuente?: boolean
    fecha_conciliacion?: boolean
    notas?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["conciliacionFiscal"]>

  export type ConciliacionFiscalSelectScalar = {
    id_conciliacion?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    asiento_id?: boolean
    pago_id?: boolean
    uuid_fiscal?: boolean
    serie?: boolean
    folio?: boolean
    rfc_emisor?: boolean
    rfc_receptor?: boolean
    monto_pagado?: boolean
    monto_cfdi?: boolean
    moneda?: boolean
    fecha_emision?: boolean
    fecha_timbrado?: boolean
    estatus_fiscal?: boolean
    estatus_sat?: boolean
    fecha_validacion_sat?: boolean
    fecha_cancelacion_sat?: boolean
    ultima_verificacion_sat_at?: boolean
    sat_requested_at?: boolean
    sat_next_retry_at?: boolean
    sat_dlq_at?: boolean
    sat_retry_count?: boolean
    sat_dispatch_id?: boolean
    sat_last_completed_dispatch_id?: boolean
    sat_processing_started_at?: boolean
    mensaje_sat?: boolean
    sat_last_error?: boolean
    fuente?: boolean
    fecha_conciliacion?: boolean
    notas?: boolean
    created_at?: boolean
    updated_at?: boolean
  }


  export type $ConciliacionFiscalPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ConciliacionFiscal"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id_conciliacion: string
      tenant_id: string
      proyecto_id: string
      asiento_id: string
      pago_id: string | null
      uuid_fiscal: string | null
      serie: string | null
      folio: string | null
      rfc_emisor: string | null
      rfc_receptor: string | null
      monto_pagado: Prisma.Decimal
      monto_cfdi: Prisma.Decimal | null
      moneda: string
      fecha_emision: Date | null
      fecha_timbrado: Date | null
      estatus_fiscal: string
      estatus_sat: string
      fecha_validacion_sat: Date | null
      fecha_cancelacion_sat: Date | null
      ultima_verificacion_sat_at: Date | null
      sat_requested_at: Date | null
      sat_next_retry_at: Date | null
      sat_dlq_at: Date | null
      sat_retry_count: number
      sat_dispatch_id: string | null
      sat_last_completed_dispatch_id: string | null
      sat_processing_started_at: Date | null
      mensaje_sat: string | null
      sat_last_error: string | null
      fuente: string
      fecha_conciliacion: Date | null
      notas: string | null
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["conciliacionFiscal"]>
    composites: {}
  }

  type ConciliacionFiscalGetPayload<S extends boolean | null | undefined | ConciliacionFiscalDefaultArgs> = $Result.GetResult<Prisma.$ConciliacionFiscalPayload, S>

  type ConciliacionFiscalCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ConciliacionFiscalFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ConciliacionFiscalCountAggregateInputType | true
    }

  export interface ConciliacionFiscalDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ConciliacionFiscal'], meta: { name: 'ConciliacionFiscal' } }
    /**
     * Find zero or one ConciliacionFiscal that matches the filter.
     * @param {ConciliacionFiscalFindUniqueArgs} args - Arguments to find a ConciliacionFiscal
     * @example
     * // Get one ConciliacionFiscal
     * const conciliacionFiscal = await prisma.conciliacionFiscal.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ConciliacionFiscalFindUniqueArgs>(args: SelectSubset<T, ConciliacionFiscalFindUniqueArgs<ExtArgs>>): Prisma__ConciliacionFiscalClient<$Result.GetResult<Prisma.$ConciliacionFiscalPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ConciliacionFiscal that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ConciliacionFiscalFindUniqueOrThrowArgs} args - Arguments to find a ConciliacionFiscal
     * @example
     * // Get one ConciliacionFiscal
     * const conciliacionFiscal = await prisma.conciliacionFiscal.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ConciliacionFiscalFindUniqueOrThrowArgs>(args: SelectSubset<T, ConciliacionFiscalFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ConciliacionFiscalClient<$Result.GetResult<Prisma.$ConciliacionFiscalPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ConciliacionFiscal that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConciliacionFiscalFindFirstArgs} args - Arguments to find a ConciliacionFiscal
     * @example
     * // Get one ConciliacionFiscal
     * const conciliacionFiscal = await prisma.conciliacionFiscal.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ConciliacionFiscalFindFirstArgs>(args?: SelectSubset<T, ConciliacionFiscalFindFirstArgs<ExtArgs>>): Prisma__ConciliacionFiscalClient<$Result.GetResult<Prisma.$ConciliacionFiscalPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ConciliacionFiscal that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConciliacionFiscalFindFirstOrThrowArgs} args - Arguments to find a ConciliacionFiscal
     * @example
     * // Get one ConciliacionFiscal
     * const conciliacionFiscal = await prisma.conciliacionFiscal.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ConciliacionFiscalFindFirstOrThrowArgs>(args?: SelectSubset<T, ConciliacionFiscalFindFirstOrThrowArgs<ExtArgs>>): Prisma__ConciliacionFiscalClient<$Result.GetResult<Prisma.$ConciliacionFiscalPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ConciliacionFiscals that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConciliacionFiscalFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ConciliacionFiscals
     * const conciliacionFiscals = await prisma.conciliacionFiscal.findMany()
     * 
     * // Get first 10 ConciliacionFiscals
     * const conciliacionFiscals = await prisma.conciliacionFiscal.findMany({ take: 10 })
     * 
     * // Only select the `id_conciliacion`
     * const conciliacionFiscalWithId_conciliacionOnly = await prisma.conciliacionFiscal.findMany({ select: { id_conciliacion: true } })
     * 
     */
    findMany<T extends ConciliacionFiscalFindManyArgs>(args?: SelectSubset<T, ConciliacionFiscalFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConciliacionFiscalPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ConciliacionFiscal.
     * @param {ConciliacionFiscalCreateArgs} args - Arguments to create a ConciliacionFiscal.
     * @example
     * // Create one ConciliacionFiscal
     * const ConciliacionFiscal = await prisma.conciliacionFiscal.create({
     *   data: {
     *     // ... data to create a ConciliacionFiscal
     *   }
     * })
     * 
     */
    create<T extends ConciliacionFiscalCreateArgs>(args: SelectSubset<T, ConciliacionFiscalCreateArgs<ExtArgs>>): Prisma__ConciliacionFiscalClient<$Result.GetResult<Prisma.$ConciliacionFiscalPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ConciliacionFiscals.
     * @param {ConciliacionFiscalCreateManyArgs} args - Arguments to create many ConciliacionFiscals.
     * @example
     * // Create many ConciliacionFiscals
     * const conciliacionFiscal = await prisma.conciliacionFiscal.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ConciliacionFiscalCreateManyArgs>(args?: SelectSubset<T, ConciliacionFiscalCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ConciliacionFiscals and returns the data saved in the database.
     * @param {ConciliacionFiscalCreateManyAndReturnArgs} args - Arguments to create many ConciliacionFiscals.
     * @example
     * // Create many ConciliacionFiscals
     * const conciliacionFiscal = await prisma.conciliacionFiscal.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ConciliacionFiscals and only return the `id_conciliacion`
     * const conciliacionFiscalWithId_conciliacionOnly = await prisma.conciliacionFiscal.createManyAndReturn({ 
     *   select: { id_conciliacion: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ConciliacionFiscalCreateManyAndReturnArgs>(args?: SelectSubset<T, ConciliacionFiscalCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConciliacionFiscalPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ConciliacionFiscal.
     * @param {ConciliacionFiscalDeleteArgs} args - Arguments to delete one ConciliacionFiscal.
     * @example
     * // Delete one ConciliacionFiscal
     * const ConciliacionFiscal = await prisma.conciliacionFiscal.delete({
     *   where: {
     *     // ... filter to delete one ConciliacionFiscal
     *   }
     * })
     * 
     */
    delete<T extends ConciliacionFiscalDeleteArgs>(args: SelectSubset<T, ConciliacionFiscalDeleteArgs<ExtArgs>>): Prisma__ConciliacionFiscalClient<$Result.GetResult<Prisma.$ConciliacionFiscalPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ConciliacionFiscal.
     * @param {ConciliacionFiscalUpdateArgs} args - Arguments to update one ConciliacionFiscal.
     * @example
     * // Update one ConciliacionFiscal
     * const conciliacionFiscal = await prisma.conciliacionFiscal.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ConciliacionFiscalUpdateArgs>(args: SelectSubset<T, ConciliacionFiscalUpdateArgs<ExtArgs>>): Prisma__ConciliacionFiscalClient<$Result.GetResult<Prisma.$ConciliacionFiscalPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ConciliacionFiscals.
     * @param {ConciliacionFiscalDeleteManyArgs} args - Arguments to filter ConciliacionFiscals to delete.
     * @example
     * // Delete a few ConciliacionFiscals
     * const { count } = await prisma.conciliacionFiscal.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ConciliacionFiscalDeleteManyArgs>(args?: SelectSubset<T, ConciliacionFiscalDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ConciliacionFiscals.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConciliacionFiscalUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ConciliacionFiscals
     * const conciliacionFiscal = await prisma.conciliacionFiscal.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ConciliacionFiscalUpdateManyArgs>(args: SelectSubset<T, ConciliacionFiscalUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ConciliacionFiscal.
     * @param {ConciliacionFiscalUpsertArgs} args - Arguments to update or create a ConciliacionFiscal.
     * @example
     * // Update or create a ConciliacionFiscal
     * const conciliacionFiscal = await prisma.conciliacionFiscal.upsert({
     *   create: {
     *     // ... data to create a ConciliacionFiscal
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ConciliacionFiscal we want to update
     *   }
     * })
     */
    upsert<T extends ConciliacionFiscalUpsertArgs>(args: SelectSubset<T, ConciliacionFiscalUpsertArgs<ExtArgs>>): Prisma__ConciliacionFiscalClient<$Result.GetResult<Prisma.$ConciliacionFiscalPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ConciliacionFiscals.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConciliacionFiscalCountArgs} args - Arguments to filter ConciliacionFiscals to count.
     * @example
     * // Count the number of ConciliacionFiscals
     * const count = await prisma.conciliacionFiscal.count({
     *   where: {
     *     // ... the filter for the ConciliacionFiscals we want to count
     *   }
     * })
    **/
    count<T extends ConciliacionFiscalCountArgs>(
      args?: Subset<T, ConciliacionFiscalCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ConciliacionFiscalCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ConciliacionFiscal.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConciliacionFiscalAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ConciliacionFiscalAggregateArgs>(args: Subset<T, ConciliacionFiscalAggregateArgs>): Prisma.PrismaPromise<GetConciliacionFiscalAggregateType<T>>

    /**
     * Group by ConciliacionFiscal.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConciliacionFiscalGroupByArgs} args - Group by arguments.
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
      T extends ConciliacionFiscalGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ConciliacionFiscalGroupByArgs['orderBy'] }
        : { orderBy?: ConciliacionFiscalGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ConciliacionFiscalGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetConciliacionFiscalGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ConciliacionFiscal model
   */
  readonly fields: ConciliacionFiscalFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ConciliacionFiscal.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ConciliacionFiscalClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the ConciliacionFiscal model
   */ 
  interface ConciliacionFiscalFieldRefs {
    readonly id_conciliacion: FieldRef<"ConciliacionFiscal", 'String'>
    readonly tenant_id: FieldRef<"ConciliacionFiscal", 'String'>
    readonly proyecto_id: FieldRef<"ConciliacionFiscal", 'String'>
    readonly asiento_id: FieldRef<"ConciliacionFiscal", 'String'>
    readonly pago_id: FieldRef<"ConciliacionFiscal", 'String'>
    readonly uuid_fiscal: FieldRef<"ConciliacionFiscal", 'String'>
    readonly serie: FieldRef<"ConciliacionFiscal", 'String'>
    readonly folio: FieldRef<"ConciliacionFiscal", 'String'>
    readonly rfc_emisor: FieldRef<"ConciliacionFiscal", 'String'>
    readonly rfc_receptor: FieldRef<"ConciliacionFiscal", 'String'>
    readonly monto_pagado: FieldRef<"ConciliacionFiscal", 'Decimal'>
    readonly monto_cfdi: FieldRef<"ConciliacionFiscal", 'Decimal'>
    readonly moneda: FieldRef<"ConciliacionFiscal", 'String'>
    readonly fecha_emision: FieldRef<"ConciliacionFiscal", 'DateTime'>
    readonly fecha_timbrado: FieldRef<"ConciliacionFiscal", 'DateTime'>
    readonly estatus_fiscal: FieldRef<"ConciliacionFiscal", 'String'>
    readonly estatus_sat: FieldRef<"ConciliacionFiscal", 'String'>
    readonly fecha_validacion_sat: FieldRef<"ConciliacionFiscal", 'DateTime'>
    readonly fecha_cancelacion_sat: FieldRef<"ConciliacionFiscal", 'DateTime'>
    readonly ultima_verificacion_sat_at: FieldRef<"ConciliacionFiscal", 'DateTime'>
    readonly sat_requested_at: FieldRef<"ConciliacionFiscal", 'DateTime'>
    readonly sat_next_retry_at: FieldRef<"ConciliacionFiscal", 'DateTime'>
    readonly sat_dlq_at: FieldRef<"ConciliacionFiscal", 'DateTime'>
    readonly sat_retry_count: FieldRef<"ConciliacionFiscal", 'Int'>
    readonly sat_dispatch_id: FieldRef<"ConciliacionFiscal", 'String'>
    readonly sat_last_completed_dispatch_id: FieldRef<"ConciliacionFiscal", 'String'>
    readonly sat_processing_started_at: FieldRef<"ConciliacionFiscal", 'DateTime'>
    readonly mensaje_sat: FieldRef<"ConciliacionFiscal", 'String'>
    readonly sat_last_error: FieldRef<"ConciliacionFiscal", 'String'>
    readonly fuente: FieldRef<"ConciliacionFiscal", 'String'>
    readonly fecha_conciliacion: FieldRef<"ConciliacionFiscal", 'DateTime'>
    readonly notas: FieldRef<"ConciliacionFiscal", 'String'>
    readonly created_at: FieldRef<"ConciliacionFiscal", 'DateTime'>
    readonly updated_at: FieldRef<"ConciliacionFiscal", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ConciliacionFiscal findUnique
   */
  export type ConciliacionFiscalFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConciliacionFiscal
     */
    select?: ConciliacionFiscalSelect<ExtArgs> | null
    /**
     * Filter, which ConciliacionFiscal to fetch.
     */
    where: ConciliacionFiscalWhereUniqueInput
  }

  /**
   * ConciliacionFiscal findUniqueOrThrow
   */
  export type ConciliacionFiscalFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConciliacionFiscal
     */
    select?: ConciliacionFiscalSelect<ExtArgs> | null
    /**
     * Filter, which ConciliacionFiscal to fetch.
     */
    where: ConciliacionFiscalWhereUniqueInput
  }

  /**
   * ConciliacionFiscal findFirst
   */
  export type ConciliacionFiscalFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConciliacionFiscal
     */
    select?: ConciliacionFiscalSelect<ExtArgs> | null
    /**
     * Filter, which ConciliacionFiscal to fetch.
     */
    where?: ConciliacionFiscalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConciliacionFiscals to fetch.
     */
    orderBy?: ConciliacionFiscalOrderByWithRelationInput | ConciliacionFiscalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ConciliacionFiscals.
     */
    cursor?: ConciliacionFiscalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConciliacionFiscals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConciliacionFiscals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ConciliacionFiscals.
     */
    distinct?: ConciliacionFiscalScalarFieldEnum | ConciliacionFiscalScalarFieldEnum[]
  }

  /**
   * ConciliacionFiscal findFirstOrThrow
   */
  export type ConciliacionFiscalFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConciliacionFiscal
     */
    select?: ConciliacionFiscalSelect<ExtArgs> | null
    /**
     * Filter, which ConciliacionFiscal to fetch.
     */
    where?: ConciliacionFiscalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConciliacionFiscals to fetch.
     */
    orderBy?: ConciliacionFiscalOrderByWithRelationInput | ConciliacionFiscalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ConciliacionFiscals.
     */
    cursor?: ConciliacionFiscalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConciliacionFiscals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConciliacionFiscals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ConciliacionFiscals.
     */
    distinct?: ConciliacionFiscalScalarFieldEnum | ConciliacionFiscalScalarFieldEnum[]
  }

  /**
   * ConciliacionFiscal findMany
   */
  export type ConciliacionFiscalFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConciliacionFiscal
     */
    select?: ConciliacionFiscalSelect<ExtArgs> | null
    /**
     * Filter, which ConciliacionFiscals to fetch.
     */
    where?: ConciliacionFiscalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConciliacionFiscals to fetch.
     */
    orderBy?: ConciliacionFiscalOrderByWithRelationInput | ConciliacionFiscalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ConciliacionFiscals.
     */
    cursor?: ConciliacionFiscalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConciliacionFiscals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConciliacionFiscals.
     */
    skip?: number
    distinct?: ConciliacionFiscalScalarFieldEnum | ConciliacionFiscalScalarFieldEnum[]
  }

  /**
   * ConciliacionFiscal create
   */
  export type ConciliacionFiscalCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConciliacionFiscal
     */
    select?: ConciliacionFiscalSelect<ExtArgs> | null
    /**
     * The data needed to create a ConciliacionFiscal.
     */
    data: XOR<ConciliacionFiscalCreateInput, ConciliacionFiscalUncheckedCreateInput>
  }

  /**
   * ConciliacionFiscal createMany
   */
  export type ConciliacionFiscalCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ConciliacionFiscals.
     */
    data: ConciliacionFiscalCreateManyInput | ConciliacionFiscalCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ConciliacionFiscal createManyAndReturn
   */
  export type ConciliacionFiscalCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConciliacionFiscal
     */
    select?: ConciliacionFiscalSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ConciliacionFiscals.
     */
    data: ConciliacionFiscalCreateManyInput | ConciliacionFiscalCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ConciliacionFiscal update
   */
  export type ConciliacionFiscalUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConciliacionFiscal
     */
    select?: ConciliacionFiscalSelect<ExtArgs> | null
    /**
     * The data needed to update a ConciliacionFiscal.
     */
    data: XOR<ConciliacionFiscalUpdateInput, ConciliacionFiscalUncheckedUpdateInput>
    /**
     * Choose, which ConciliacionFiscal to update.
     */
    where: ConciliacionFiscalWhereUniqueInput
  }

  /**
   * ConciliacionFiscal updateMany
   */
  export type ConciliacionFiscalUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ConciliacionFiscals.
     */
    data: XOR<ConciliacionFiscalUpdateManyMutationInput, ConciliacionFiscalUncheckedUpdateManyInput>
    /**
     * Filter which ConciliacionFiscals to update
     */
    where?: ConciliacionFiscalWhereInput
  }

  /**
   * ConciliacionFiscal upsert
   */
  export type ConciliacionFiscalUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConciliacionFiscal
     */
    select?: ConciliacionFiscalSelect<ExtArgs> | null
    /**
     * The filter to search for the ConciliacionFiscal to update in case it exists.
     */
    where: ConciliacionFiscalWhereUniqueInput
    /**
     * In case the ConciliacionFiscal found by the `where` argument doesn't exist, create a new ConciliacionFiscal with this data.
     */
    create: XOR<ConciliacionFiscalCreateInput, ConciliacionFiscalUncheckedCreateInput>
    /**
     * In case the ConciliacionFiscal was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ConciliacionFiscalUpdateInput, ConciliacionFiscalUncheckedUpdateInput>
  }

  /**
   * ConciliacionFiscal delete
   */
  export type ConciliacionFiscalDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConciliacionFiscal
     */
    select?: ConciliacionFiscalSelect<ExtArgs> | null
    /**
     * Filter which ConciliacionFiscal to delete.
     */
    where: ConciliacionFiscalWhereUniqueInput
  }

  /**
   * ConciliacionFiscal deleteMany
   */
  export type ConciliacionFiscalDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ConciliacionFiscals to delete
     */
    where?: ConciliacionFiscalWhereInput
  }

  /**
   * ConciliacionFiscal without action
   */
  export type ConciliacionFiscalDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConciliacionFiscal
     */
    select?: ConciliacionFiscalSelect<ExtArgs> | null
  }


  /**
   * Model ConciliacionBancaria
   */

  export type AggregateConciliacionBancaria = {
    _count: ConciliacionBancariaCountAggregateOutputType | null
    _avg: ConciliacionBancariaAvgAggregateOutputType | null
    _sum: ConciliacionBancariaSumAggregateOutputType | null
    _min: ConciliacionBancariaMinAggregateOutputType | null
    _max: ConciliacionBancariaMaxAggregateOutputType | null
  }

  export type ConciliacionBancariaAvgAggregateOutputType = {
    monto_pagado: Decimal | null
    monto_banco: Decimal | null
  }

  export type ConciliacionBancariaSumAggregateOutputType = {
    monto_pagado: Decimal | null
    monto_banco: Decimal | null
  }

  export type ConciliacionBancariaMinAggregateOutputType = {
    id_conciliacion_bancaria: string | null
    tenant_id: string | null
    proyecto_id: string | null
    asiento_id: string | null
    pago_id: string | null
    referencia_bancaria: string | null
    banco: string | null
    metodo_pago: string | null
    monto_pagado: Decimal | null
    monto_banco: Decimal | null
    moneda: string | null
    fecha_pago_real: Date | null
    fecha_movimiento_bancario: Date | null
    estatus_bancario: string | null
    fuente: string | null
    fecha_conciliacion: Date | null
    notas: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type ConciliacionBancariaMaxAggregateOutputType = {
    id_conciliacion_bancaria: string | null
    tenant_id: string | null
    proyecto_id: string | null
    asiento_id: string | null
    pago_id: string | null
    referencia_bancaria: string | null
    banco: string | null
    metodo_pago: string | null
    monto_pagado: Decimal | null
    monto_banco: Decimal | null
    moneda: string | null
    fecha_pago_real: Date | null
    fecha_movimiento_bancario: Date | null
    estatus_bancario: string | null
    fuente: string | null
    fecha_conciliacion: Date | null
    notas: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type ConciliacionBancariaCountAggregateOutputType = {
    id_conciliacion_bancaria: number
    tenant_id: number
    proyecto_id: number
    asiento_id: number
    pago_id: number
    referencia_bancaria: number
    banco: number
    metodo_pago: number
    monto_pagado: number
    monto_banco: number
    moneda: number
    fecha_pago_real: number
    fecha_movimiento_bancario: number
    estatus_bancario: number
    fuente: number
    fecha_conciliacion: number
    notas: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type ConciliacionBancariaAvgAggregateInputType = {
    monto_pagado?: true
    monto_banco?: true
  }

  export type ConciliacionBancariaSumAggregateInputType = {
    monto_pagado?: true
    monto_banco?: true
  }

  export type ConciliacionBancariaMinAggregateInputType = {
    id_conciliacion_bancaria?: true
    tenant_id?: true
    proyecto_id?: true
    asiento_id?: true
    pago_id?: true
    referencia_bancaria?: true
    banco?: true
    metodo_pago?: true
    monto_pagado?: true
    monto_banco?: true
    moneda?: true
    fecha_pago_real?: true
    fecha_movimiento_bancario?: true
    estatus_bancario?: true
    fuente?: true
    fecha_conciliacion?: true
    notas?: true
    created_at?: true
    updated_at?: true
  }

  export type ConciliacionBancariaMaxAggregateInputType = {
    id_conciliacion_bancaria?: true
    tenant_id?: true
    proyecto_id?: true
    asiento_id?: true
    pago_id?: true
    referencia_bancaria?: true
    banco?: true
    metodo_pago?: true
    monto_pagado?: true
    monto_banco?: true
    moneda?: true
    fecha_pago_real?: true
    fecha_movimiento_bancario?: true
    estatus_bancario?: true
    fuente?: true
    fecha_conciliacion?: true
    notas?: true
    created_at?: true
    updated_at?: true
  }

  export type ConciliacionBancariaCountAggregateInputType = {
    id_conciliacion_bancaria?: true
    tenant_id?: true
    proyecto_id?: true
    asiento_id?: true
    pago_id?: true
    referencia_bancaria?: true
    banco?: true
    metodo_pago?: true
    monto_pagado?: true
    monto_banco?: true
    moneda?: true
    fecha_pago_real?: true
    fecha_movimiento_bancario?: true
    estatus_bancario?: true
    fuente?: true
    fecha_conciliacion?: true
    notas?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type ConciliacionBancariaAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ConciliacionBancaria to aggregate.
     */
    where?: ConciliacionBancariaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConciliacionBancarias to fetch.
     */
    orderBy?: ConciliacionBancariaOrderByWithRelationInput | ConciliacionBancariaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ConciliacionBancariaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConciliacionBancarias from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConciliacionBancarias.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ConciliacionBancarias
    **/
    _count?: true | ConciliacionBancariaCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ConciliacionBancariaAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ConciliacionBancariaSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ConciliacionBancariaMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ConciliacionBancariaMaxAggregateInputType
  }

  export type GetConciliacionBancariaAggregateType<T extends ConciliacionBancariaAggregateArgs> = {
        [P in keyof T & keyof AggregateConciliacionBancaria]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateConciliacionBancaria[P]>
      : GetScalarType<T[P], AggregateConciliacionBancaria[P]>
  }




  export type ConciliacionBancariaGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ConciliacionBancariaWhereInput
    orderBy?: ConciliacionBancariaOrderByWithAggregationInput | ConciliacionBancariaOrderByWithAggregationInput[]
    by: ConciliacionBancariaScalarFieldEnum[] | ConciliacionBancariaScalarFieldEnum
    having?: ConciliacionBancariaScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ConciliacionBancariaCountAggregateInputType | true
    _avg?: ConciliacionBancariaAvgAggregateInputType
    _sum?: ConciliacionBancariaSumAggregateInputType
    _min?: ConciliacionBancariaMinAggregateInputType
    _max?: ConciliacionBancariaMaxAggregateInputType
  }

  export type ConciliacionBancariaGroupByOutputType = {
    id_conciliacion_bancaria: string
    tenant_id: string
    proyecto_id: string
    asiento_id: string
    pago_id: string | null
    referencia_bancaria: string | null
    banco: string | null
    metodo_pago: string | null
    monto_pagado: Decimal
    monto_banco: Decimal | null
    moneda: string
    fecha_pago_real: Date | null
    fecha_movimiento_bancario: Date | null
    estatus_bancario: string
    fuente: string
    fecha_conciliacion: Date | null
    notas: string | null
    created_at: Date
    updated_at: Date
    _count: ConciliacionBancariaCountAggregateOutputType | null
    _avg: ConciliacionBancariaAvgAggregateOutputType | null
    _sum: ConciliacionBancariaSumAggregateOutputType | null
    _min: ConciliacionBancariaMinAggregateOutputType | null
    _max: ConciliacionBancariaMaxAggregateOutputType | null
  }

  type GetConciliacionBancariaGroupByPayload<T extends ConciliacionBancariaGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ConciliacionBancariaGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ConciliacionBancariaGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ConciliacionBancariaGroupByOutputType[P]>
            : GetScalarType<T[P], ConciliacionBancariaGroupByOutputType[P]>
        }
      >
    >


  export type ConciliacionBancariaSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_conciliacion_bancaria?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    asiento_id?: boolean
    pago_id?: boolean
    referencia_bancaria?: boolean
    banco?: boolean
    metodo_pago?: boolean
    monto_pagado?: boolean
    monto_banco?: boolean
    moneda?: boolean
    fecha_pago_real?: boolean
    fecha_movimiento_bancario?: boolean
    estatus_bancario?: boolean
    fuente?: boolean
    fecha_conciliacion?: boolean
    notas?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["conciliacionBancaria"]>

  export type ConciliacionBancariaSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_conciliacion_bancaria?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    asiento_id?: boolean
    pago_id?: boolean
    referencia_bancaria?: boolean
    banco?: boolean
    metodo_pago?: boolean
    monto_pagado?: boolean
    monto_banco?: boolean
    moneda?: boolean
    fecha_pago_real?: boolean
    fecha_movimiento_bancario?: boolean
    estatus_bancario?: boolean
    fuente?: boolean
    fecha_conciliacion?: boolean
    notas?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["conciliacionBancaria"]>

  export type ConciliacionBancariaSelectScalar = {
    id_conciliacion_bancaria?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    asiento_id?: boolean
    pago_id?: boolean
    referencia_bancaria?: boolean
    banco?: boolean
    metodo_pago?: boolean
    monto_pagado?: boolean
    monto_banco?: boolean
    moneda?: boolean
    fecha_pago_real?: boolean
    fecha_movimiento_bancario?: boolean
    estatus_bancario?: boolean
    fuente?: boolean
    fecha_conciliacion?: boolean
    notas?: boolean
    created_at?: boolean
    updated_at?: boolean
  }


  export type $ConciliacionBancariaPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ConciliacionBancaria"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id_conciliacion_bancaria: string
      tenant_id: string
      proyecto_id: string
      asiento_id: string
      pago_id: string | null
      referencia_bancaria: string | null
      banco: string | null
      metodo_pago: string | null
      monto_pagado: Prisma.Decimal
      monto_banco: Prisma.Decimal | null
      moneda: string
      fecha_pago_real: Date | null
      fecha_movimiento_bancario: Date | null
      estatus_bancario: string
      fuente: string
      fecha_conciliacion: Date | null
      notas: string | null
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["conciliacionBancaria"]>
    composites: {}
  }

  type ConciliacionBancariaGetPayload<S extends boolean | null | undefined | ConciliacionBancariaDefaultArgs> = $Result.GetResult<Prisma.$ConciliacionBancariaPayload, S>

  type ConciliacionBancariaCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ConciliacionBancariaFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ConciliacionBancariaCountAggregateInputType | true
    }

  export interface ConciliacionBancariaDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ConciliacionBancaria'], meta: { name: 'ConciliacionBancaria' } }
    /**
     * Find zero or one ConciliacionBancaria that matches the filter.
     * @param {ConciliacionBancariaFindUniqueArgs} args - Arguments to find a ConciliacionBancaria
     * @example
     * // Get one ConciliacionBancaria
     * const conciliacionBancaria = await prisma.conciliacionBancaria.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ConciliacionBancariaFindUniqueArgs>(args: SelectSubset<T, ConciliacionBancariaFindUniqueArgs<ExtArgs>>): Prisma__ConciliacionBancariaClient<$Result.GetResult<Prisma.$ConciliacionBancariaPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ConciliacionBancaria that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ConciliacionBancariaFindUniqueOrThrowArgs} args - Arguments to find a ConciliacionBancaria
     * @example
     * // Get one ConciliacionBancaria
     * const conciliacionBancaria = await prisma.conciliacionBancaria.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ConciliacionBancariaFindUniqueOrThrowArgs>(args: SelectSubset<T, ConciliacionBancariaFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ConciliacionBancariaClient<$Result.GetResult<Prisma.$ConciliacionBancariaPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ConciliacionBancaria that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConciliacionBancariaFindFirstArgs} args - Arguments to find a ConciliacionBancaria
     * @example
     * // Get one ConciliacionBancaria
     * const conciliacionBancaria = await prisma.conciliacionBancaria.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ConciliacionBancariaFindFirstArgs>(args?: SelectSubset<T, ConciliacionBancariaFindFirstArgs<ExtArgs>>): Prisma__ConciliacionBancariaClient<$Result.GetResult<Prisma.$ConciliacionBancariaPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ConciliacionBancaria that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConciliacionBancariaFindFirstOrThrowArgs} args - Arguments to find a ConciliacionBancaria
     * @example
     * // Get one ConciliacionBancaria
     * const conciliacionBancaria = await prisma.conciliacionBancaria.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ConciliacionBancariaFindFirstOrThrowArgs>(args?: SelectSubset<T, ConciliacionBancariaFindFirstOrThrowArgs<ExtArgs>>): Prisma__ConciliacionBancariaClient<$Result.GetResult<Prisma.$ConciliacionBancariaPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ConciliacionBancarias that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConciliacionBancariaFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ConciliacionBancarias
     * const conciliacionBancarias = await prisma.conciliacionBancaria.findMany()
     * 
     * // Get first 10 ConciliacionBancarias
     * const conciliacionBancarias = await prisma.conciliacionBancaria.findMany({ take: 10 })
     * 
     * // Only select the `id_conciliacion_bancaria`
     * const conciliacionBancariaWithId_conciliacion_bancariaOnly = await prisma.conciliacionBancaria.findMany({ select: { id_conciliacion_bancaria: true } })
     * 
     */
    findMany<T extends ConciliacionBancariaFindManyArgs>(args?: SelectSubset<T, ConciliacionBancariaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConciliacionBancariaPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ConciliacionBancaria.
     * @param {ConciliacionBancariaCreateArgs} args - Arguments to create a ConciliacionBancaria.
     * @example
     * // Create one ConciliacionBancaria
     * const ConciliacionBancaria = await prisma.conciliacionBancaria.create({
     *   data: {
     *     // ... data to create a ConciliacionBancaria
     *   }
     * })
     * 
     */
    create<T extends ConciliacionBancariaCreateArgs>(args: SelectSubset<T, ConciliacionBancariaCreateArgs<ExtArgs>>): Prisma__ConciliacionBancariaClient<$Result.GetResult<Prisma.$ConciliacionBancariaPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ConciliacionBancarias.
     * @param {ConciliacionBancariaCreateManyArgs} args - Arguments to create many ConciliacionBancarias.
     * @example
     * // Create many ConciliacionBancarias
     * const conciliacionBancaria = await prisma.conciliacionBancaria.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ConciliacionBancariaCreateManyArgs>(args?: SelectSubset<T, ConciliacionBancariaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ConciliacionBancarias and returns the data saved in the database.
     * @param {ConciliacionBancariaCreateManyAndReturnArgs} args - Arguments to create many ConciliacionBancarias.
     * @example
     * // Create many ConciliacionBancarias
     * const conciliacionBancaria = await prisma.conciliacionBancaria.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ConciliacionBancarias and only return the `id_conciliacion_bancaria`
     * const conciliacionBancariaWithId_conciliacion_bancariaOnly = await prisma.conciliacionBancaria.createManyAndReturn({ 
     *   select: { id_conciliacion_bancaria: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ConciliacionBancariaCreateManyAndReturnArgs>(args?: SelectSubset<T, ConciliacionBancariaCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConciliacionBancariaPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ConciliacionBancaria.
     * @param {ConciliacionBancariaDeleteArgs} args - Arguments to delete one ConciliacionBancaria.
     * @example
     * // Delete one ConciliacionBancaria
     * const ConciliacionBancaria = await prisma.conciliacionBancaria.delete({
     *   where: {
     *     // ... filter to delete one ConciliacionBancaria
     *   }
     * })
     * 
     */
    delete<T extends ConciliacionBancariaDeleteArgs>(args: SelectSubset<T, ConciliacionBancariaDeleteArgs<ExtArgs>>): Prisma__ConciliacionBancariaClient<$Result.GetResult<Prisma.$ConciliacionBancariaPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ConciliacionBancaria.
     * @param {ConciliacionBancariaUpdateArgs} args - Arguments to update one ConciliacionBancaria.
     * @example
     * // Update one ConciliacionBancaria
     * const conciliacionBancaria = await prisma.conciliacionBancaria.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ConciliacionBancariaUpdateArgs>(args: SelectSubset<T, ConciliacionBancariaUpdateArgs<ExtArgs>>): Prisma__ConciliacionBancariaClient<$Result.GetResult<Prisma.$ConciliacionBancariaPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ConciliacionBancarias.
     * @param {ConciliacionBancariaDeleteManyArgs} args - Arguments to filter ConciliacionBancarias to delete.
     * @example
     * // Delete a few ConciliacionBancarias
     * const { count } = await prisma.conciliacionBancaria.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ConciliacionBancariaDeleteManyArgs>(args?: SelectSubset<T, ConciliacionBancariaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ConciliacionBancarias.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConciliacionBancariaUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ConciliacionBancarias
     * const conciliacionBancaria = await prisma.conciliacionBancaria.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ConciliacionBancariaUpdateManyArgs>(args: SelectSubset<T, ConciliacionBancariaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ConciliacionBancaria.
     * @param {ConciliacionBancariaUpsertArgs} args - Arguments to update or create a ConciliacionBancaria.
     * @example
     * // Update or create a ConciliacionBancaria
     * const conciliacionBancaria = await prisma.conciliacionBancaria.upsert({
     *   create: {
     *     // ... data to create a ConciliacionBancaria
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ConciliacionBancaria we want to update
     *   }
     * })
     */
    upsert<T extends ConciliacionBancariaUpsertArgs>(args: SelectSubset<T, ConciliacionBancariaUpsertArgs<ExtArgs>>): Prisma__ConciliacionBancariaClient<$Result.GetResult<Prisma.$ConciliacionBancariaPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ConciliacionBancarias.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConciliacionBancariaCountArgs} args - Arguments to filter ConciliacionBancarias to count.
     * @example
     * // Count the number of ConciliacionBancarias
     * const count = await prisma.conciliacionBancaria.count({
     *   where: {
     *     // ... the filter for the ConciliacionBancarias we want to count
     *   }
     * })
    **/
    count<T extends ConciliacionBancariaCountArgs>(
      args?: Subset<T, ConciliacionBancariaCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ConciliacionBancariaCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ConciliacionBancaria.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConciliacionBancariaAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ConciliacionBancariaAggregateArgs>(args: Subset<T, ConciliacionBancariaAggregateArgs>): Prisma.PrismaPromise<GetConciliacionBancariaAggregateType<T>>

    /**
     * Group by ConciliacionBancaria.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConciliacionBancariaGroupByArgs} args - Group by arguments.
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
      T extends ConciliacionBancariaGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ConciliacionBancariaGroupByArgs['orderBy'] }
        : { orderBy?: ConciliacionBancariaGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ConciliacionBancariaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetConciliacionBancariaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ConciliacionBancaria model
   */
  readonly fields: ConciliacionBancariaFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ConciliacionBancaria.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ConciliacionBancariaClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the ConciliacionBancaria model
   */ 
  interface ConciliacionBancariaFieldRefs {
    readonly id_conciliacion_bancaria: FieldRef<"ConciliacionBancaria", 'String'>
    readonly tenant_id: FieldRef<"ConciliacionBancaria", 'String'>
    readonly proyecto_id: FieldRef<"ConciliacionBancaria", 'String'>
    readonly asiento_id: FieldRef<"ConciliacionBancaria", 'String'>
    readonly pago_id: FieldRef<"ConciliacionBancaria", 'String'>
    readonly referencia_bancaria: FieldRef<"ConciliacionBancaria", 'String'>
    readonly banco: FieldRef<"ConciliacionBancaria", 'String'>
    readonly metodo_pago: FieldRef<"ConciliacionBancaria", 'String'>
    readonly monto_pagado: FieldRef<"ConciliacionBancaria", 'Decimal'>
    readonly monto_banco: FieldRef<"ConciliacionBancaria", 'Decimal'>
    readonly moneda: FieldRef<"ConciliacionBancaria", 'String'>
    readonly fecha_pago_real: FieldRef<"ConciliacionBancaria", 'DateTime'>
    readonly fecha_movimiento_bancario: FieldRef<"ConciliacionBancaria", 'DateTime'>
    readonly estatus_bancario: FieldRef<"ConciliacionBancaria", 'String'>
    readonly fuente: FieldRef<"ConciliacionBancaria", 'String'>
    readonly fecha_conciliacion: FieldRef<"ConciliacionBancaria", 'DateTime'>
    readonly notas: FieldRef<"ConciliacionBancaria", 'String'>
    readonly created_at: FieldRef<"ConciliacionBancaria", 'DateTime'>
    readonly updated_at: FieldRef<"ConciliacionBancaria", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ConciliacionBancaria findUnique
   */
  export type ConciliacionBancariaFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConciliacionBancaria
     */
    select?: ConciliacionBancariaSelect<ExtArgs> | null
    /**
     * Filter, which ConciliacionBancaria to fetch.
     */
    where: ConciliacionBancariaWhereUniqueInput
  }

  /**
   * ConciliacionBancaria findUniqueOrThrow
   */
  export type ConciliacionBancariaFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConciliacionBancaria
     */
    select?: ConciliacionBancariaSelect<ExtArgs> | null
    /**
     * Filter, which ConciliacionBancaria to fetch.
     */
    where: ConciliacionBancariaWhereUniqueInput
  }

  /**
   * ConciliacionBancaria findFirst
   */
  export type ConciliacionBancariaFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConciliacionBancaria
     */
    select?: ConciliacionBancariaSelect<ExtArgs> | null
    /**
     * Filter, which ConciliacionBancaria to fetch.
     */
    where?: ConciliacionBancariaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConciliacionBancarias to fetch.
     */
    orderBy?: ConciliacionBancariaOrderByWithRelationInput | ConciliacionBancariaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ConciliacionBancarias.
     */
    cursor?: ConciliacionBancariaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConciliacionBancarias from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConciliacionBancarias.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ConciliacionBancarias.
     */
    distinct?: ConciliacionBancariaScalarFieldEnum | ConciliacionBancariaScalarFieldEnum[]
  }

  /**
   * ConciliacionBancaria findFirstOrThrow
   */
  export type ConciliacionBancariaFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConciliacionBancaria
     */
    select?: ConciliacionBancariaSelect<ExtArgs> | null
    /**
     * Filter, which ConciliacionBancaria to fetch.
     */
    where?: ConciliacionBancariaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConciliacionBancarias to fetch.
     */
    orderBy?: ConciliacionBancariaOrderByWithRelationInput | ConciliacionBancariaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ConciliacionBancarias.
     */
    cursor?: ConciliacionBancariaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConciliacionBancarias from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConciliacionBancarias.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ConciliacionBancarias.
     */
    distinct?: ConciliacionBancariaScalarFieldEnum | ConciliacionBancariaScalarFieldEnum[]
  }

  /**
   * ConciliacionBancaria findMany
   */
  export type ConciliacionBancariaFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConciliacionBancaria
     */
    select?: ConciliacionBancariaSelect<ExtArgs> | null
    /**
     * Filter, which ConciliacionBancarias to fetch.
     */
    where?: ConciliacionBancariaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConciliacionBancarias to fetch.
     */
    orderBy?: ConciliacionBancariaOrderByWithRelationInput | ConciliacionBancariaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ConciliacionBancarias.
     */
    cursor?: ConciliacionBancariaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConciliacionBancarias from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConciliacionBancarias.
     */
    skip?: number
    distinct?: ConciliacionBancariaScalarFieldEnum | ConciliacionBancariaScalarFieldEnum[]
  }

  /**
   * ConciliacionBancaria create
   */
  export type ConciliacionBancariaCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConciliacionBancaria
     */
    select?: ConciliacionBancariaSelect<ExtArgs> | null
    /**
     * The data needed to create a ConciliacionBancaria.
     */
    data: XOR<ConciliacionBancariaCreateInput, ConciliacionBancariaUncheckedCreateInput>
  }

  /**
   * ConciliacionBancaria createMany
   */
  export type ConciliacionBancariaCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ConciliacionBancarias.
     */
    data: ConciliacionBancariaCreateManyInput | ConciliacionBancariaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ConciliacionBancaria createManyAndReturn
   */
  export type ConciliacionBancariaCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConciliacionBancaria
     */
    select?: ConciliacionBancariaSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ConciliacionBancarias.
     */
    data: ConciliacionBancariaCreateManyInput | ConciliacionBancariaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ConciliacionBancaria update
   */
  export type ConciliacionBancariaUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConciliacionBancaria
     */
    select?: ConciliacionBancariaSelect<ExtArgs> | null
    /**
     * The data needed to update a ConciliacionBancaria.
     */
    data: XOR<ConciliacionBancariaUpdateInput, ConciliacionBancariaUncheckedUpdateInput>
    /**
     * Choose, which ConciliacionBancaria to update.
     */
    where: ConciliacionBancariaWhereUniqueInput
  }

  /**
   * ConciliacionBancaria updateMany
   */
  export type ConciliacionBancariaUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ConciliacionBancarias.
     */
    data: XOR<ConciliacionBancariaUpdateManyMutationInput, ConciliacionBancariaUncheckedUpdateManyInput>
    /**
     * Filter which ConciliacionBancarias to update
     */
    where?: ConciliacionBancariaWhereInput
  }

  /**
   * ConciliacionBancaria upsert
   */
  export type ConciliacionBancariaUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConciliacionBancaria
     */
    select?: ConciliacionBancariaSelect<ExtArgs> | null
    /**
     * The filter to search for the ConciliacionBancaria to update in case it exists.
     */
    where: ConciliacionBancariaWhereUniqueInput
    /**
     * In case the ConciliacionBancaria found by the `where` argument doesn't exist, create a new ConciliacionBancaria with this data.
     */
    create: XOR<ConciliacionBancariaCreateInput, ConciliacionBancariaUncheckedCreateInput>
    /**
     * In case the ConciliacionBancaria was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ConciliacionBancariaUpdateInput, ConciliacionBancariaUncheckedUpdateInput>
  }

  /**
   * ConciliacionBancaria delete
   */
  export type ConciliacionBancariaDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConciliacionBancaria
     */
    select?: ConciliacionBancariaSelect<ExtArgs> | null
    /**
     * Filter which ConciliacionBancaria to delete.
     */
    where: ConciliacionBancariaWhereUniqueInput
  }

  /**
   * ConciliacionBancaria deleteMany
   */
  export type ConciliacionBancariaDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ConciliacionBancarias to delete
     */
    where?: ConciliacionBancariaWhereInput
  }

  /**
   * ConciliacionBancaria without action
   */
  export type ConciliacionBancariaDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConciliacionBancaria
     */
    select?: ConciliacionBancariaSelect<ExtArgs> | null
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


  export const AsientoContableScalarFieldEnum: {
    id_asiento: 'id_asiento',
    tenant_id: 'tenant_id',
    proyecto_id: 'proyecto_id',
    pago_id: 'pago_id',
    external_event_key: 'external_event_key',
    referencia_funcional: 'referencia_funcional',
    evento_conciliacion_key: 'evento_conciliacion_key',
    tipo_poliza: 'tipo_poliza',
    folio_poliza: 'folio_poliza',
    concepto: 'concepto',
    monto_total: 'monto_total',
    moneda: 'moneda',
    fecha_poliza: 'fecha_poliza',
    beneficiario: 'beneficiario',
    referencia_modulo: 'referencia_modulo',
    referencia_entidad: 'referencia_entidad',
    referencia_id: 'referencia_id',
    estatus: 'estatus',
    cfdi_status: 'cfdi_status',
    bancario_status: 'bancario_status',
    notas: 'notas',
    conciliado_at: 'conciliado_at',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type AsientoContableScalarFieldEnum = (typeof AsientoContableScalarFieldEnum)[keyof typeof AsientoContableScalarFieldEnum]


  export const ConciliacionFiscalScalarFieldEnum: {
    id_conciliacion: 'id_conciliacion',
    tenant_id: 'tenant_id',
    proyecto_id: 'proyecto_id',
    asiento_id: 'asiento_id',
    pago_id: 'pago_id',
    uuid_fiscal: 'uuid_fiscal',
    serie: 'serie',
    folio: 'folio',
    rfc_emisor: 'rfc_emisor',
    rfc_receptor: 'rfc_receptor',
    monto_pagado: 'monto_pagado',
    monto_cfdi: 'monto_cfdi',
    moneda: 'moneda',
    fecha_emision: 'fecha_emision',
    fecha_timbrado: 'fecha_timbrado',
    estatus_fiscal: 'estatus_fiscal',
    estatus_sat: 'estatus_sat',
    fecha_validacion_sat: 'fecha_validacion_sat',
    fecha_cancelacion_sat: 'fecha_cancelacion_sat',
    ultima_verificacion_sat_at: 'ultima_verificacion_sat_at',
    sat_requested_at: 'sat_requested_at',
    sat_next_retry_at: 'sat_next_retry_at',
    sat_dlq_at: 'sat_dlq_at',
    sat_retry_count: 'sat_retry_count',
    sat_dispatch_id: 'sat_dispatch_id',
    sat_last_completed_dispatch_id: 'sat_last_completed_dispatch_id',
    sat_processing_started_at: 'sat_processing_started_at',
    mensaje_sat: 'mensaje_sat',
    sat_last_error: 'sat_last_error',
    fuente: 'fuente',
    fecha_conciliacion: 'fecha_conciliacion',
    notas: 'notas',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type ConciliacionFiscalScalarFieldEnum = (typeof ConciliacionFiscalScalarFieldEnum)[keyof typeof ConciliacionFiscalScalarFieldEnum]


  export const ConciliacionBancariaScalarFieldEnum: {
    id_conciliacion_bancaria: 'id_conciliacion_bancaria',
    tenant_id: 'tenant_id',
    proyecto_id: 'proyecto_id',
    asiento_id: 'asiento_id',
    pago_id: 'pago_id',
    referencia_bancaria: 'referencia_bancaria',
    banco: 'banco',
    metodo_pago: 'metodo_pago',
    monto_pagado: 'monto_pagado',
    monto_banco: 'monto_banco',
    moneda: 'moneda',
    fecha_pago_real: 'fecha_pago_real',
    fecha_movimiento_bancario: 'fecha_movimiento_bancario',
    estatus_bancario: 'estatus_bancario',
    fuente: 'fuente',
    fecha_conciliacion: 'fecha_conciliacion',
    notas: 'notas',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type ConciliacionBancariaScalarFieldEnum = (typeof ConciliacionBancariaScalarFieldEnum)[keyof typeof ConciliacionBancariaScalarFieldEnum]


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


  export type AsientoContableWhereInput = {
    AND?: AsientoContableWhereInput | AsientoContableWhereInput[]
    OR?: AsientoContableWhereInput[]
    NOT?: AsientoContableWhereInput | AsientoContableWhereInput[]
    id_asiento?: UuidFilter<"AsientoContable"> | string
    tenant_id?: UuidFilter<"AsientoContable"> | string
    proyecto_id?: UuidFilter<"AsientoContable"> | string
    pago_id?: UuidNullableFilter<"AsientoContable"> | string | null
    external_event_key?: StringNullableFilter<"AsientoContable"> | string | null
    referencia_funcional?: StringNullableFilter<"AsientoContable"> | string | null
    evento_conciliacion_key?: StringNullableFilter<"AsientoContable"> | string | null
    tipo_poliza?: StringFilter<"AsientoContable"> | string
    folio_poliza?: StringFilter<"AsientoContable"> | string
    concepto?: StringFilter<"AsientoContable"> | string
    monto_total?: DecimalFilter<"AsientoContable"> | Decimal | DecimalJsLike | number | string
    moneda?: StringFilter<"AsientoContable"> | string
    fecha_poliza?: DateTimeFilter<"AsientoContable"> | Date | string
    beneficiario?: StringFilter<"AsientoContable"> | string
    referencia_modulo?: StringNullableFilter<"AsientoContable"> | string | null
    referencia_entidad?: StringNullableFilter<"AsientoContable"> | string | null
    referencia_id?: UuidNullableFilter<"AsientoContable"> | string | null
    estatus?: StringFilter<"AsientoContable"> | string
    cfdi_status?: StringFilter<"AsientoContable"> | string
    bancario_status?: StringFilter<"AsientoContable"> | string
    notas?: StringNullableFilter<"AsientoContable"> | string | null
    conciliado_at?: DateTimeNullableFilter<"AsientoContable"> | Date | string | null
    created_at?: DateTimeFilter<"AsientoContable"> | Date | string
    updated_at?: DateTimeFilter<"AsientoContable"> | Date | string
  }

  export type AsientoContableOrderByWithRelationInput = {
    id_asiento?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    pago_id?: SortOrderInput | SortOrder
    external_event_key?: SortOrderInput | SortOrder
    referencia_funcional?: SortOrderInput | SortOrder
    evento_conciliacion_key?: SortOrderInput | SortOrder
    tipo_poliza?: SortOrder
    folio_poliza?: SortOrder
    concepto?: SortOrder
    monto_total?: SortOrder
    moneda?: SortOrder
    fecha_poliza?: SortOrder
    beneficiario?: SortOrder
    referencia_modulo?: SortOrderInput | SortOrder
    referencia_entidad?: SortOrderInput | SortOrder
    referencia_id?: SortOrderInput | SortOrder
    estatus?: SortOrder
    cfdi_status?: SortOrder
    bancario_status?: SortOrder
    notas?: SortOrderInput | SortOrder
    conciliado_at?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type AsientoContableWhereUniqueInput = Prisma.AtLeast<{
    id_asiento?: string
    tenant_id_external_event_key?: AsientoContableTenant_idExternal_event_keyCompoundUniqueInput
    tenant_id_evento_conciliacion_key?: AsientoContableTenant_idEvento_conciliacion_keyCompoundUniqueInput
    tenant_id_proyecto_id_folio_poliza?: AsientoContableTenant_idProyecto_idFolio_polizaCompoundUniqueInput
    AND?: AsientoContableWhereInput | AsientoContableWhereInput[]
    OR?: AsientoContableWhereInput[]
    NOT?: AsientoContableWhereInput | AsientoContableWhereInput[]
    tenant_id?: UuidFilter<"AsientoContable"> | string
    proyecto_id?: UuidFilter<"AsientoContable"> | string
    pago_id?: UuidNullableFilter<"AsientoContable"> | string | null
    external_event_key?: StringNullableFilter<"AsientoContable"> | string | null
    referencia_funcional?: StringNullableFilter<"AsientoContable"> | string | null
    evento_conciliacion_key?: StringNullableFilter<"AsientoContable"> | string | null
    tipo_poliza?: StringFilter<"AsientoContable"> | string
    folio_poliza?: StringFilter<"AsientoContable"> | string
    concepto?: StringFilter<"AsientoContable"> | string
    monto_total?: DecimalFilter<"AsientoContable"> | Decimal | DecimalJsLike | number | string
    moneda?: StringFilter<"AsientoContable"> | string
    fecha_poliza?: DateTimeFilter<"AsientoContable"> | Date | string
    beneficiario?: StringFilter<"AsientoContable"> | string
    referencia_modulo?: StringNullableFilter<"AsientoContable"> | string | null
    referencia_entidad?: StringNullableFilter<"AsientoContable"> | string | null
    referencia_id?: UuidNullableFilter<"AsientoContable"> | string | null
    estatus?: StringFilter<"AsientoContable"> | string
    cfdi_status?: StringFilter<"AsientoContable"> | string
    bancario_status?: StringFilter<"AsientoContable"> | string
    notas?: StringNullableFilter<"AsientoContable"> | string | null
    conciliado_at?: DateTimeNullableFilter<"AsientoContable"> | Date | string | null
    created_at?: DateTimeFilter<"AsientoContable"> | Date | string
    updated_at?: DateTimeFilter<"AsientoContable"> | Date | string
  }, "id_asiento" | "tenant_id_external_event_key" | "tenant_id_evento_conciliacion_key" | "tenant_id_proyecto_id_folio_poliza">

  export type AsientoContableOrderByWithAggregationInput = {
    id_asiento?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    pago_id?: SortOrderInput | SortOrder
    external_event_key?: SortOrderInput | SortOrder
    referencia_funcional?: SortOrderInput | SortOrder
    evento_conciliacion_key?: SortOrderInput | SortOrder
    tipo_poliza?: SortOrder
    folio_poliza?: SortOrder
    concepto?: SortOrder
    monto_total?: SortOrder
    moneda?: SortOrder
    fecha_poliza?: SortOrder
    beneficiario?: SortOrder
    referencia_modulo?: SortOrderInput | SortOrder
    referencia_entidad?: SortOrderInput | SortOrder
    referencia_id?: SortOrderInput | SortOrder
    estatus?: SortOrder
    cfdi_status?: SortOrder
    bancario_status?: SortOrder
    notas?: SortOrderInput | SortOrder
    conciliado_at?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: AsientoContableCountOrderByAggregateInput
    _avg?: AsientoContableAvgOrderByAggregateInput
    _max?: AsientoContableMaxOrderByAggregateInput
    _min?: AsientoContableMinOrderByAggregateInput
    _sum?: AsientoContableSumOrderByAggregateInput
  }

  export type AsientoContableScalarWhereWithAggregatesInput = {
    AND?: AsientoContableScalarWhereWithAggregatesInput | AsientoContableScalarWhereWithAggregatesInput[]
    OR?: AsientoContableScalarWhereWithAggregatesInput[]
    NOT?: AsientoContableScalarWhereWithAggregatesInput | AsientoContableScalarWhereWithAggregatesInput[]
    id_asiento?: UuidWithAggregatesFilter<"AsientoContable"> | string
    tenant_id?: UuidWithAggregatesFilter<"AsientoContable"> | string
    proyecto_id?: UuidWithAggregatesFilter<"AsientoContable"> | string
    pago_id?: UuidNullableWithAggregatesFilter<"AsientoContable"> | string | null
    external_event_key?: StringNullableWithAggregatesFilter<"AsientoContable"> | string | null
    referencia_funcional?: StringNullableWithAggregatesFilter<"AsientoContable"> | string | null
    evento_conciliacion_key?: StringNullableWithAggregatesFilter<"AsientoContable"> | string | null
    tipo_poliza?: StringWithAggregatesFilter<"AsientoContable"> | string
    folio_poliza?: StringWithAggregatesFilter<"AsientoContable"> | string
    concepto?: StringWithAggregatesFilter<"AsientoContable"> | string
    monto_total?: DecimalWithAggregatesFilter<"AsientoContable"> | Decimal | DecimalJsLike | number | string
    moneda?: StringWithAggregatesFilter<"AsientoContable"> | string
    fecha_poliza?: DateTimeWithAggregatesFilter<"AsientoContable"> | Date | string
    beneficiario?: StringWithAggregatesFilter<"AsientoContable"> | string
    referencia_modulo?: StringNullableWithAggregatesFilter<"AsientoContable"> | string | null
    referencia_entidad?: StringNullableWithAggregatesFilter<"AsientoContable"> | string | null
    referencia_id?: UuidNullableWithAggregatesFilter<"AsientoContable"> | string | null
    estatus?: StringWithAggregatesFilter<"AsientoContable"> | string
    cfdi_status?: StringWithAggregatesFilter<"AsientoContable"> | string
    bancario_status?: StringWithAggregatesFilter<"AsientoContable"> | string
    notas?: StringNullableWithAggregatesFilter<"AsientoContable"> | string | null
    conciliado_at?: DateTimeNullableWithAggregatesFilter<"AsientoContable"> | Date | string | null
    created_at?: DateTimeWithAggregatesFilter<"AsientoContable"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"AsientoContable"> | Date | string
  }

  export type ConciliacionFiscalWhereInput = {
    AND?: ConciliacionFiscalWhereInput | ConciliacionFiscalWhereInput[]
    OR?: ConciliacionFiscalWhereInput[]
    NOT?: ConciliacionFiscalWhereInput | ConciliacionFiscalWhereInput[]
    id_conciliacion?: UuidFilter<"ConciliacionFiscal"> | string
    tenant_id?: UuidFilter<"ConciliacionFiscal"> | string
    proyecto_id?: UuidFilter<"ConciliacionFiscal"> | string
    asiento_id?: UuidFilter<"ConciliacionFiscal"> | string
    pago_id?: UuidNullableFilter<"ConciliacionFiscal"> | string | null
    uuid_fiscal?: StringNullableFilter<"ConciliacionFiscal"> | string | null
    serie?: StringNullableFilter<"ConciliacionFiscal"> | string | null
    folio?: StringNullableFilter<"ConciliacionFiscal"> | string | null
    rfc_emisor?: StringNullableFilter<"ConciliacionFiscal"> | string | null
    rfc_receptor?: StringNullableFilter<"ConciliacionFiscal"> | string | null
    monto_pagado?: DecimalFilter<"ConciliacionFiscal"> | Decimal | DecimalJsLike | number | string
    monto_cfdi?: DecimalNullableFilter<"ConciliacionFiscal"> | Decimal | DecimalJsLike | number | string | null
    moneda?: StringFilter<"ConciliacionFiscal"> | string
    fecha_emision?: DateTimeNullableFilter<"ConciliacionFiscal"> | Date | string | null
    fecha_timbrado?: DateTimeNullableFilter<"ConciliacionFiscal"> | Date | string | null
    estatus_fiscal?: StringFilter<"ConciliacionFiscal"> | string
    estatus_sat?: StringFilter<"ConciliacionFiscal"> | string
    fecha_validacion_sat?: DateTimeNullableFilter<"ConciliacionFiscal"> | Date | string | null
    fecha_cancelacion_sat?: DateTimeNullableFilter<"ConciliacionFiscal"> | Date | string | null
    ultima_verificacion_sat_at?: DateTimeNullableFilter<"ConciliacionFiscal"> | Date | string | null
    sat_requested_at?: DateTimeNullableFilter<"ConciliacionFiscal"> | Date | string | null
    sat_next_retry_at?: DateTimeNullableFilter<"ConciliacionFiscal"> | Date | string | null
    sat_dlq_at?: DateTimeNullableFilter<"ConciliacionFiscal"> | Date | string | null
    sat_retry_count?: IntFilter<"ConciliacionFiscal"> | number
    sat_dispatch_id?: StringNullableFilter<"ConciliacionFiscal"> | string | null
    sat_last_completed_dispatch_id?: StringNullableFilter<"ConciliacionFiscal"> | string | null
    sat_processing_started_at?: DateTimeNullableFilter<"ConciliacionFiscal"> | Date | string | null
    mensaje_sat?: StringNullableFilter<"ConciliacionFiscal"> | string | null
    sat_last_error?: StringNullableFilter<"ConciliacionFiscal"> | string | null
    fuente?: StringFilter<"ConciliacionFiscal"> | string
    fecha_conciliacion?: DateTimeNullableFilter<"ConciliacionFiscal"> | Date | string | null
    notas?: StringNullableFilter<"ConciliacionFiscal"> | string | null
    created_at?: DateTimeFilter<"ConciliacionFiscal"> | Date | string
    updated_at?: DateTimeFilter<"ConciliacionFiscal"> | Date | string
  }

  export type ConciliacionFiscalOrderByWithRelationInput = {
    id_conciliacion?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    asiento_id?: SortOrder
    pago_id?: SortOrderInput | SortOrder
    uuid_fiscal?: SortOrderInput | SortOrder
    serie?: SortOrderInput | SortOrder
    folio?: SortOrderInput | SortOrder
    rfc_emisor?: SortOrderInput | SortOrder
    rfc_receptor?: SortOrderInput | SortOrder
    monto_pagado?: SortOrder
    monto_cfdi?: SortOrderInput | SortOrder
    moneda?: SortOrder
    fecha_emision?: SortOrderInput | SortOrder
    fecha_timbrado?: SortOrderInput | SortOrder
    estatus_fiscal?: SortOrder
    estatus_sat?: SortOrder
    fecha_validacion_sat?: SortOrderInput | SortOrder
    fecha_cancelacion_sat?: SortOrderInput | SortOrder
    ultima_verificacion_sat_at?: SortOrderInput | SortOrder
    sat_requested_at?: SortOrderInput | SortOrder
    sat_next_retry_at?: SortOrderInput | SortOrder
    sat_dlq_at?: SortOrderInput | SortOrder
    sat_retry_count?: SortOrder
    sat_dispatch_id?: SortOrderInput | SortOrder
    sat_last_completed_dispatch_id?: SortOrderInput | SortOrder
    sat_processing_started_at?: SortOrderInput | SortOrder
    mensaje_sat?: SortOrderInput | SortOrder
    sat_last_error?: SortOrderInput | SortOrder
    fuente?: SortOrder
    fecha_conciliacion?: SortOrderInput | SortOrder
    notas?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ConciliacionFiscalWhereUniqueInput = Prisma.AtLeast<{
    id_conciliacion?: string
    tenant_id_asiento_id?: ConciliacionFiscalTenant_idAsiento_idCompoundUniqueInput
    tenant_id_uuid_fiscal?: ConciliacionFiscalTenant_idUuid_fiscalCompoundUniqueInput
    AND?: ConciliacionFiscalWhereInput | ConciliacionFiscalWhereInput[]
    OR?: ConciliacionFiscalWhereInput[]
    NOT?: ConciliacionFiscalWhereInput | ConciliacionFiscalWhereInput[]
    tenant_id?: UuidFilter<"ConciliacionFiscal"> | string
    proyecto_id?: UuidFilter<"ConciliacionFiscal"> | string
    asiento_id?: UuidFilter<"ConciliacionFiscal"> | string
    pago_id?: UuidNullableFilter<"ConciliacionFiscal"> | string | null
    uuid_fiscal?: StringNullableFilter<"ConciliacionFiscal"> | string | null
    serie?: StringNullableFilter<"ConciliacionFiscal"> | string | null
    folio?: StringNullableFilter<"ConciliacionFiscal"> | string | null
    rfc_emisor?: StringNullableFilter<"ConciliacionFiscal"> | string | null
    rfc_receptor?: StringNullableFilter<"ConciliacionFiscal"> | string | null
    monto_pagado?: DecimalFilter<"ConciliacionFiscal"> | Decimal | DecimalJsLike | number | string
    monto_cfdi?: DecimalNullableFilter<"ConciliacionFiscal"> | Decimal | DecimalJsLike | number | string | null
    moneda?: StringFilter<"ConciliacionFiscal"> | string
    fecha_emision?: DateTimeNullableFilter<"ConciliacionFiscal"> | Date | string | null
    fecha_timbrado?: DateTimeNullableFilter<"ConciliacionFiscal"> | Date | string | null
    estatus_fiscal?: StringFilter<"ConciliacionFiscal"> | string
    estatus_sat?: StringFilter<"ConciliacionFiscal"> | string
    fecha_validacion_sat?: DateTimeNullableFilter<"ConciliacionFiscal"> | Date | string | null
    fecha_cancelacion_sat?: DateTimeNullableFilter<"ConciliacionFiscal"> | Date | string | null
    ultima_verificacion_sat_at?: DateTimeNullableFilter<"ConciliacionFiscal"> | Date | string | null
    sat_requested_at?: DateTimeNullableFilter<"ConciliacionFiscal"> | Date | string | null
    sat_next_retry_at?: DateTimeNullableFilter<"ConciliacionFiscal"> | Date | string | null
    sat_dlq_at?: DateTimeNullableFilter<"ConciliacionFiscal"> | Date | string | null
    sat_retry_count?: IntFilter<"ConciliacionFiscal"> | number
    sat_dispatch_id?: StringNullableFilter<"ConciliacionFiscal"> | string | null
    sat_last_completed_dispatch_id?: StringNullableFilter<"ConciliacionFiscal"> | string | null
    sat_processing_started_at?: DateTimeNullableFilter<"ConciliacionFiscal"> | Date | string | null
    mensaje_sat?: StringNullableFilter<"ConciliacionFiscal"> | string | null
    sat_last_error?: StringNullableFilter<"ConciliacionFiscal"> | string | null
    fuente?: StringFilter<"ConciliacionFiscal"> | string
    fecha_conciliacion?: DateTimeNullableFilter<"ConciliacionFiscal"> | Date | string | null
    notas?: StringNullableFilter<"ConciliacionFiscal"> | string | null
    created_at?: DateTimeFilter<"ConciliacionFiscal"> | Date | string
    updated_at?: DateTimeFilter<"ConciliacionFiscal"> | Date | string
  }, "id_conciliacion" | "tenant_id_asiento_id" | "tenant_id_uuid_fiscal">

  export type ConciliacionFiscalOrderByWithAggregationInput = {
    id_conciliacion?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    asiento_id?: SortOrder
    pago_id?: SortOrderInput | SortOrder
    uuid_fiscal?: SortOrderInput | SortOrder
    serie?: SortOrderInput | SortOrder
    folio?: SortOrderInput | SortOrder
    rfc_emisor?: SortOrderInput | SortOrder
    rfc_receptor?: SortOrderInput | SortOrder
    monto_pagado?: SortOrder
    monto_cfdi?: SortOrderInput | SortOrder
    moneda?: SortOrder
    fecha_emision?: SortOrderInput | SortOrder
    fecha_timbrado?: SortOrderInput | SortOrder
    estatus_fiscal?: SortOrder
    estatus_sat?: SortOrder
    fecha_validacion_sat?: SortOrderInput | SortOrder
    fecha_cancelacion_sat?: SortOrderInput | SortOrder
    ultima_verificacion_sat_at?: SortOrderInput | SortOrder
    sat_requested_at?: SortOrderInput | SortOrder
    sat_next_retry_at?: SortOrderInput | SortOrder
    sat_dlq_at?: SortOrderInput | SortOrder
    sat_retry_count?: SortOrder
    sat_dispatch_id?: SortOrderInput | SortOrder
    sat_last_completed_dispatch_id?: SortOrderInput | SortOrder
    sat_processing_started_at?: SortOrderInput | SortOrder
    mensaje_sat?: SortOrderInput | SortOrder
    sat_last_error?: SortOrderInput | SortOrder
    fuente?: SortOrder
    fecha_conciliacion?: SortOrderInput | SortOrder
    notas?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: ConciliacionFiscalCountOrderByAggregateInput
    _avg?: ConciliacionFiscalAvgOrderByAggregateInput
    _max?: ConciliacionFiscalMaxOrderByAggregateInput
    _min?: ConciliacionFiscalMinOrderByAggregateInput
    _sum?: ConciliacionFiscalSumOrderByAggregateInput
  }

  export type ConciliacionFiscalScalarWhereWithAggregatesInput = {
    AND?: ConciliacionFiscalScalarWhereWithAggregatesInput | ConciliacionFiscalScalarWhereWithAggregatesInput[]
    OR?: ConciliacionFiscalScalarWhereWithAggregatesInput[]
    NOT?: ConciliacionFiscalScalarWhereWithAggregatesInput | ConciliacionFiscalScalarWhereWithAggregatesInput[]
    id_conciliacion?: UuidWithAggregatesFilter<"ConciliacionFiscal"> | string
    tenant_id?: UuidWithAggregatesFilter<"ConciliacionFiscal"> | string
    proyecto_id?: UuidWithAggregatesFilter<"ConciliacionFiscal"> | string
    asiento_id?: UuidWithAggregatesFilter<"ConciliacionFiscal"> | string
    pago_id?: UuidNullableWithAggregatesFilter<"ConciliacionFiscal"> | string | null
    uuid_fiscal?: StringNullableWithAggregatesFilter<"ConciliacionFiscal"> | string | null
    serie?: StringNullableWithAggregatesFilter<"ConciliacionFiscal"> | string | null
    folio?: StringNullableWithAggregatesFilter<"ConciliacionFiscal"> | string | null
    rfc_emisor?: StringNullableWithAggregatesFilter<"ConciliacionFiscal"> | string | null
    rfc_receptor?: StringNullableWithAggregatesFilter<"ConciliacionFiscal"> | string | null
    monto_pagado?: DecimalWithAggregatesFilter<"ConciliacionFiscal"> | Decimal | DecimalJsLike | number | string
    monto_cfdi?: DecimalNullableWithAggregatesFilter<"ConciliacionFiscal"> | Decimal | DecimalJsLike | number | string | null
    moneda?: StringWithAggregatesFilter<"ConciliacionFiscal"> | string
    fecha_emision?: DateTimeNullableWithAggregatesFilter<"ConciliacionFiscal"> | Date | string | null
    fecha_timbrado?: DateTimeNullableWithAggregatesFilter<"ConciliacionFiscal"> | Date | string | null
    estatus_fiscal?: StringWithAggregatesFilter<"ConciliacionFiscal"> | string
    estatus_sat?: StringWithAggregatesFilter<"ConciliacionFiscal"> | string
    fecha_validacion_sat?: DateTimeNullableWithAggregatesFilter<"ConciliacionFiscal"> | Date | string | null
    fecha_cancelacion_sat?: DateTimeNullableWithAggregatesFilter<"ConciliacionFiscal"> | Date | string | null
    ultima_verificacion_sat_at?: DateTimeNullableWithAggregatesFilter<"ConciliacionFiscal"> | Date | string | null
    sat_requested_at?: DateTimeNullableWithAggregatesFilter<"ConciliacionFiscal"> | Date | string | null
    sat_next_retry_at?: DateTimeNullableWithAggregatesFilter<"ConciliacionFiscal"> | Date | string | null
    sat_dlq_at?: DateTimeNullableWithAggregatesFilter<"ConciliacionFiscal"> | Date | string | null
    sat_retry_count?: IntWithAggregatesFilter<"ConciliacionFiscal"> | number
    sat_dispatch_id?: StringNullableWithAggregatesFilter<"ConciliacionFiscal"> | string | null
    sat_last_completed_dispatch_id?: StringNullableWithAggregatesFilter<"ConciliacionFiscal"> | string | null
    sat_processing_started_at?: DateTimeNullableWithAggregatesFilter<"ConciliacionFiscal"> | Date | string | null
    mensaje_sat?: StringNullableWithAggregatesFilter<"ConciliacionFiscal"> | string | null
    sat_last_error?: StringNullableWithAggregatesFilter<"ConciliacionFiscal"> | string | null
    fuente?: StringWithAggregatesFilter<"ConciliacionFiscal"> | string
    fecha_conciliacion?: DateTimeNullableWithAggregatesFilter<"ConciliacionFiscal"> | Date | string | null
    notas?: StringNullableWithAggregatesFilter<"ConciliacionFiscal"> | string | null
    created_at?: DateTimeWithAggregatesFilter<"ConciliacionFiscal"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"ConciliacionFiscal"> | Date | string
  }

  export type ConciliacionBancariaWhereInput = {
    AND?: ConciliacionBancariaWhereInput | ConciliacionBancariaWhereInput[]
    OR?: ConciliacionBancariaWhereInput[]
    NOT?: ConciliacionBancariaWhereInput | ConciliacionBancariaWhereInput[]
    id_conciliacion_bancaria?: UuidFilter<"ConciliacionBancaria"> | string
    tenant_id?: UuidFilter<"ConciliacionBancaria"> | string
    proyecto_id?: UuidFilter<"ConciliacionBancaria"> | string
    asiento_id?: UuidFilter<"ConciliacionBancaria"> | string
    pago_id?: UuidNullableFilter<"ConciliacionBancaria"> | string | null
    referencia_bancaria?: StringNullableFilter<"ConciliacionBancaria"> | string | null
    banco?: StringNullableFilter<"ConciliacionBancaria"> | string | null
    metodo_pago?: StringNullableFilter<"ConciliacionBancaria"> | string | null
    monto_pagado?: DecimalFilter<"ConciliacionBancaria"> | Decimal | DecimalJsLike | number | string
    monto_banco?: DecimalNullableFilter<"ConciliacionBancaria"> | Decimal | DecimalJsLike | number | string | null
    moneda?: StringFilter<"ConciliacionBancaria"> | string
    fecha_pago_real?: DateTimeNullableFilter<"ConciliacionBancaria"> | Date | string | null
    fecha_movimiento_bancario?: DateTimeNullableFilter<"ConciliacionBancaria"> | Date | string | null
    estatus_bancario?: StringFilter<"ConciliacionBancaria"> | string
    fuente?: StringFilter<"ConciliacionBancaria"> | string
    fecha_conciliacion?: DateTimeNullableFilter<"ConciliacionBancaria"> | Date | string | null
    notas?: StringNullableFilter<"ConciliacionBancaria"> | string | null
    created_at?: DateTimeFilter<"ConciliacionBancaria"> | Date | string
    updated_at?: DateTimeFilter<"ConciliacionBancaria"> | Date | string
  }

  export type ConciliacionBancariaOrderByWithRelationInput = {
    id_conciliacion_bancaria?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    asiento_id?: SortOrder
    pago_id?: SortOrderInput | SortOrder
    referencia_bancaria?: SortOrderInput | SortOrder
    banco?: SortOrderInput | SortOrder
    metodo_pago?: SortOrderInput | SortOrder
    monto_pagado?: SortOrder
    monto_banco?: SortOrderInput | SortOrder
    moneda?: SortOrder
    fecha_pago_real?: SortOrderInput | SortOrder
    fecha_movimiento_bancario?: SortOrderInput | SortOrder
    estatus_bancario?: SortOrder
    fuente?: SortOrder
    fecha_conciliacion?: SortOrderInput | SortOrder
    notas?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ConciliacionBancariaWhereUniqueInput = Prisma.AtLeast<{
    id_conciliacion_bancaria?: string
    tenant_id_asiento_id?: ConciliacionBancariaTenant_idAsiento_idCompoundUniqueInput
    AND?: ConciliacionBancariaWhereInput | ConciliacionBancariaWhereInput[]
    OR?: ConciliacionBancariaWhereInput[]
    NOT?: ConciliacionBancariaWhereInput | ConciliacionBancariaWhereInput[]
    tenant_id?: UuidFilter<"ConciliacionBancaria"> | string
    proyecto_id?: UuidFilter<"ConciliacionBancaria"> | string
    asiento_id?: UuidFilter<"ConciliacionBancaria"> | string
    pago_id?: UuidNullableFilter<"ConciliacionBancaria"> | string | null
    referencia_bancaria?: StringNullableFilter<"ConciliacionBancaria"> | string | null
    banco?: StringNullableFilter<"ConciliacionBancaria"> | string | null
    metodo_pago?: StringNullableFilter<"ConciliacionBancaria"> | string | null
    monto_pagado?: DecimalFilter<"ConciliacionBancaria"> | Decimal | DecimalJsLike | number | string
    monto_banco?: DecimalNullableFilter<"ConciliacionBancaria"> | Decimal | DecimalJsLike | number | string | null
    moneda?: StringFilter<"ConciliacionBancaria"> | string
    fecha_pago_real?: DateTimeNullableFilter<"ConciliacionBancaria"> | Date | string | null
    fecha_movimiento_bancario?: DateTimeNullableFilter<"ConciliacionBancaria"> | Date | string | null
    estatus_bancario?: StringFilter<"ConciliacionBancaria"> | string
    fuente?: StringFilter<"ConciliacionBancaria"> | string
    fecha_conciliacion?: DateTimeNullableFilter<"ConciliacionBancaria"> | Date | string | null
    notas?: StringNullableFilter<"ConciliacionBancaria"> | string | null
    created_at?: DateTimeFilter<"ConciliacionBancaria"> | Date | string
    updated_at?: DateTimeFilter<"ConciliacionBancaria"> | Date | string
  }, "id_conciliacion_bancaria" | "tenant_id_asiento_id">

  export type ConciliacionBancariaOrderByWithAggregationInput = {
    id_conciliacion_bancaria?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    asiento_id?: SortOrder
    pago_id?: SortOrderInput | SortOrder
    referencia_bancaria?: SortOrderInput | SortOrder
    banco?: SortOrderInput | SortOrder
    metodo_pago?: SortOrderInput | SortOrder
    monto_pagado?: SortOrder
    monto_banco?: SortOrderInput | SortOrder
    moneda?: SortOrder
    fecha_pago_real?: SortOrderInput | SortOrder
    fecha_movimiento_bancario?: SortOrderInput | SortOrder
    estatus_bancario?: SortOrder
    fuente?: SortOrder
    fecha_conciliacion?: SortOrderInput | SortOrder
    notas?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: ConciliacionBancariaCountOrderByAggregateInput
    _avg?: ConciliacionBancariaAvgOrderByAggregateInput
    _max?: ConciliacionBancariaMaxOrderByAggregateInput
    _min?: ConciliacionBancariaMinOrderByAggregateInput
    _sum?: ConciliacionBancariaSumOrderByAggregateInput
  }

  export type ConciliacionBancariaScalarWhereWithAggregatesInput = {
    AND?: ConciliacionBancariaScalarWhereWithAggregatesInput | ConciliacionBancariaScalarWhereWithAggregatesInput[]
    OR?: ConciliacionBancariaScalarWhereWithAggregatesInput[]
    NOT?: ConciliacionBancariaScalarWhereWithAggregatesInput | ConciliacionBancariaScalarWhereWithAggregatesInput[]
    id_conciliacion_bancaria?: UuidWithAggregatesFilter<"ConciliacionBancaria"> | string
    tenant_id?: UuidWithAggregatesFilter<"ConciliacionBancaria"> | string
    proyecto_id?: UuidWithAggregatesFilter<"ConciliacionBancaria"> | string
    asiento_id?: UuidWithAggregatesFilter<"ConciliacionBancaria"> | string
    pago_id?: UuidNullableWithAggregatesFilter<"ConciliacionBancaria"> | string | null
    referencia_bancaria?: StringNullableWithAggregatesFilter<"ConciliacionBancaria"> | string | null
    banco?: StringNullableWithAggregatesFilter<"ConciliacionBancaria"> | string | null
    metodo_pago?: StringNullableWithAggregatesFilter<"ConciliacionBancaria"> | string | null
    monto_pagado?: DecimalWithAggregatesFilter<"ConciliacionBancaria"> | Decimal | DecimalJsLike | number | string
    monto_banco?: DecimalNullableWithAggregatesFilter<"ConciliacionBancaria"> | Decimal | DecimalJsLike | number | string | null
    moneda?: StringWithAggregatesFilter<"ConciliacionBancaria"> | string
    fecha_pago_real?: DateTimeNullableWithAggregatesFilter<"ConciliacionBancaria"> | Date | string | null
    fecha_movimiento_bancario?: DateTimeNullableWithAggregatesFilter<"ConciliacionBancaria"> | Date | string | null
    estatus_bancario?: StringWithAggregatesFilter<"ConciliacionBancaria"> | string
    fuente?: StringWithAggregatesFilter<"ConciliacionBancaria"> | string
    fecha_conciliacion?: DateTimeNullableWithAggregatesFilter<"ConciliacionBancaria"> | Date | string | null
    notas?: StringNullableWithAggregatesFilter<"ConciliacionBancaria"> | string | null
    created_at?: DateTimeWithAggregatesFilter<"ConciliacionBancaria"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"ConciliacionBancaria"> | Date | string
  }

  export type AsientoContableCreateInput = {
    id_asiento?: string
    tenant_id: string
    proyecto_id: string
    pago_id?: string | null
    external_event_key?: string | null
    referencia_funcional?: string | null
    evento_conciliacion_key?: string | null
    tipo_poliza?: string
    folio_poliza: string
    concepto: string
    monto_total: Decimal | DecimalJsLike | number | string
    moneda?: string
    fecha_poliza?: Date | string
    beneficiario: string
    referencia_modulo?: string | null
    referencia_entidad?: string | null
    referencia_id?: string | null
    estatus?: string
    cfdi_status?: string
    bancario_status?: string
    notas?: string | null
    conciliado_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type AsientoContableUncheckedCreateInput = {
    id_asiento?: string
    tenant_id: string
    proyecto_id: string
    pago_id?: string | null
    external_event_key?: string | null
    referencia_funcional?: string | null
    evento_conciliacion_key?: string | null
    tipo_poliza?: string
    folio_poliza: string
    concepto: string
    monto_total: Decimal | DecimalJsLike | number | string
    moneda?: string
    fecha_poliza?: Date | string
    beneficiario: string
    referencia_modulo?: string | null
    referencia_entidad?: string | null
    referencia_id?: string | null
    estatus?: string
    cfdi_status?: string
    bancario_status?: string
    notas?: string | null
    conciliado_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type AsientoContableUpdateInput = {
    id_asiento?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    pago_id?: NullableStringFieldUpdateOperationsInput | string | null
    external_event_key?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_funcional?: NullableStringFieldUpdateOperationsInput | string | null
    evento_conciliacion_key?: NullableStringFieldUpdateOperationsInput | string | null
    tipo_poliza?: StringFieldUpdateOperationsInput | string
    folio_poliza?: StringFieldUpdateOperationsInput | string
    concepto?: StringFieldUpdateOperationsInput | string
    monto_total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    fecha_poliza?: DateTimeFieldUpdateOperationsInput | Date | string
    beneficiario?: StringFieldUpdateOperationsInput | string
    referencia_modulo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_entidad?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_id?: NullableStringFieldUpdateOperationsInput | string | null
    estatus?: StringFieldUpdateOperationsInput | string
    cfdi_status?: StringFieldUpdateOperationsInput | string
    bancario_status?: StringFieldUpdateOperationsInput | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    conciliado_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AsientoContableUncheckedUpdateInput = {
    id_asiento?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    pago_id?: NullableStringFieldUpdateOperationsInput | string | null
    external_event_key?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_funcional?: NullableStringFieldUpdateOperationsInput | string | null
    evento_conciliacion_key?: NullableStringFieldUpdateOperationsInput | string | null
    tipo_poliza?: StringFieldUpdateOperationsInput | string
    folio_poliza?: StringFieldUpdateOperationsInput | string
    concepto?: StringFieldUpdateOperationsInput | string
    monto_total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    fecha_poliza?: DateTimeFieldUpdateOperationsInput | Date | string
    beneficiario?: StringFieldUpdateOperationsInput | string
    referencia_modulo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_entidad?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_id?: NullableStringFieldUpdateOperationsInput | string | null
    estatus?: StringFieldUpdateOperationsInput | string
    cfdi_status?: StringFieldUpdateOperationsInput | string
    bancario_status?: StringFieldUpdateOperationsInput | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    conciliado_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AsientoContableCreateManyInput = {
    id_asiento?: string
    tenant_id: string
    proyecto_id: string
    pago_id?: string | null
    external_event_key?: string | null
    referencia_funcional?: string | null
    evento_conciliacion_key?: string | null
    tipo_poliza?: string
    folio_poliza: string
    concepto: string
    monto_total: Decimal | DecimalJsLike | number | string
    moneda?: string
    fecha_poliza?: Date | string
    beneficiario: string
    referencia_modulo?: string | null
    referencia_entidad?: string | null
    referencia_id?: string | null
    estatus?: string
    cfdi_status?: string
    bancario_status?: string
    notas?: string | null
    conciliado_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type AsientoContableUpdateManyMutationInput = {
    id_asiento?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    pago_id?: NullableStringFieldUpdateOperationsInput | string | null
    external_event_key?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_funcional?: NullableStringFieldUpdateOperationsInput | string | null
    evento_conciliacion_key?: NullableStringFieldUpdateOperationsInput | string | null
    tipo_poliza?: StringFieldUpdateOperationsInput | string
    folio_poliza?: StringFieldUpdateOperationsInput | string
    concepto?: StringFieldUpdateOperationsInput | string
    monto_total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    fecha_poliza?: DateTimeFieldUpdateOperationsInput | Date | string
    beneficiario?: StringFieldUpdateOperationsInput | string
    referencia_modulo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_entidad?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_id?: NullableStringFieldUpdateOperationsInput | string | null
    estatus?: StringFieldUpdateOperationsInput | string
    cfdi_status?: StringFieldUpdateOperationsInput | string
    bancario_status?: StringFieldUpdateOperationsInput | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    conciliado_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AsientoContableUncheckedUpdateManyInput = {
    id_asiento?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    pago_id?: NullableStringFieldUpdateOperationsInput | string | null
    external_event_key?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_funcional?: NullableStringFieldUpdateOperationsInput | string | null
    evento_conciliacion_key?: NullableStringFieldUpdateOperationsInput | string | null
    tipo_poliza?: StringFieldUpdateOperationsInput | string
    folio_poliza?: StringFieldUpdateOperationsInput | string
    concepto?: StringFieldUpdateOperationsInput | string
    monto_total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    fecha_poliza?: DateTimeFieldUpdateOperationsInput | Date | string
    beneficiario?: StringFieldUpdateOperationsInput | string
    referencia_modulo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_entidad?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_id?: NullableStringFieldUpdateOperationsInput | string | null
    estatus?: StringFieldUpdateOperationsInput | string
    cfdi_status?: StringFieldUpdateOperationsInput | string
    bancario_status?: StringFieldUpdateOperationsInput | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    conciliado_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConciliacionFiscalCreateInput = {
    id_conciliacion?: string
    tenant_id: string
    proyecto_id: string
    asiento_id: string
    pago_id?: string | null
    uuid_fiscal?: string | null
    serie?: string | null
    folio?: string | null
    rfc_emisor?: string | null
    rfc_receptor?: string | null
    monto_pagado: Decimal | DecimalJsLike | number | string
    monto_cfdi?: Decimal | DecimalJsLike | number | string | null
    moneda?: string
    fecha_emision?: Date | string | null
    fecha_timbrado?: Date | string | null
    estatus_fiscal?: string
    estatus_sat?: string
    fecha_validacion_sat?: Date | string | null
    fecha_cancelacion_sat?: Date | string | null
    ultima_verificacion_sat_at?: Date | string | null
    sat_requested_at?: Date | string | null
    sat_next_retry_at?: Date | string | null
    sat_dlq_at?: Date | string | null
    sat_retry_count?: number
    sat_dispatch_id?: string | null
    sat_last_completed_dispatch_id?: string | null
    sat_processing_started_at?: Date | string | null
    mensaje_sat?: string | null
    sat_last_error?: string | null
    fuente?: string
    fecha_conciliacion?: Date | string | null
    notas?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ConciliacionFiscalUncheckedCreateInput = {
    id_conciliacion?: string
    tenant_id: string
    proyecto_id: string
    asiento_id: string
    pago_id?: string | null
    uuid_fiscal?: string | null
    serie?: string | null
    folio?: string | null
    rfc_emisor?: string | null
    rfc_receptor?: string | null
    monto_pagado: Decimal | DecimalJsLike | number | string
    monto_cfdi?: Decimal | DecimalJsLike | number | string | null
    moneda?: string
    fecha_emision?: Date | string | null
    fecha_timbrado?: Date | string | null
    estatus_fiscal?: string
    estatus_sat?: string
    fecha_validacion_sat?: Date | string | null
    fecha_cancelacion_sat?: Date | string | null
    ultima_verificacion_sat_at?: Date | string | null
    sat_requested_at?: Date | string | null
    sat_next_retry_at?: Date | string | null
    sat_dlq_at?: Date | string | null
    sat_retry_count?: number
    sat_dispatch_id?: string | null
    sat_last_completed_dispatch_id?: string | null
    sat_processing_started_at?: Date | string | null
    mensaje_sat?: string | null
    sat_last_error?: string | null
    fuente?: string
    fecha_conciliacion?: Date | string | null
    notas?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ConciliacionFiscalUpdateInput = {
    id_conciliacion?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    asiento_id?: StringFieldUpdateOperationsInput | string
    pago_id?: NullableStringFieldUpdateOperationsInput | string | null
    uuid_fiscal?: NullableStringFieldUpdateOperationsInput | string | null
    serie?: NullableStringFieldUpdateOperationsInput | string | null
    folio?: NullableStringFieldUpdateOperationsInput | string | null
    rfc_emisor?: NullableStringFieldUpdateOperationsInput | string | null
    rfc_receptor?: NullableStringFieldUpdateOperationsInput | string | null
    monto_pagado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_cfdi?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    moneda?: StringFieldUpdateOperationsInput | string
    fecha_emision?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_timbrado?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estatus_fiscal?: StringFieldUpdateOperationsInput | string
    estatus_sat?: StringFieldUpdateOperationsInput | string
    fecha_validacion_sat?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_cancelacion_sat?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    ultima_verificacion_sat_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sat_requested_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sat_next_retry_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sat_dlq_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sat_retry_count?: IntFieldUpdateOperationsInput | number
    sat_dispatch_id?: NullableStringFieldUpdateOperationsInput | string | null
    sat_last_completed_dispatch_id?: NullableStringFieldUpdateOperationsInput | string | null
    sat_processing_started_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    mensaje_sat?: NullableStringFieldUpdateOperationsInput | string | null
    sat_last_error?: NullableStringFieldUpdateOperationsInput | string | null
    fuente?: StringFieldUpdateOperationsInput | string
    fecha_conciliacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConciliacionFiscalUncheckedUpdateInput = {
    id_conciliacion?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    asiento_id?: StringFieldUpdateOperationsInput | string
    pago_id?: NullableStringFieldUpdateOperationsInput | string | null
    uuid_fiscal?: NullableStringFieldUpdateOperationsInput | string | null
    serie?: NullableStringFieldUpdateOperationsInput | string | null
    folio?: NullableStringFieldUpdateOperationsInput | string | null
    rfc_emisor?: NullableStringFieldUpdateOperationsInput | string | null
    rfc_receptor?: NullableStringFieldUpdateOperationsInput | string | null
    monto_pagado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_cfdi?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    moneda?: StringFieldUpdateOperationsInput | string
    fecha_emision?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_timbrado?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estatus_fiscal?: StringFieldUpdateOperationsInput | string
    estatus_sat?: StringFieldUpdateOperationsInput | string
    fecha_validacion_sat?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_cancelacion_sat?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    ultima_verificacion_sat_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sat_requested_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sat_next_retry_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sat_dlq_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sat_retry_count?: IntFieldUpdateOperationsInput | number
    sat_dispatch_id?: NullableStringFieldUpdateOperationsInput | string | null
    sat_last_completed_dispatch_id?: NullableStringFieldUpdateOperationsInput | string | null
    sat_processing_started_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    mensaje_sat?: NullableStringFieldUpdateOperationsInput | string | null
    sat_last_error?: NullableStringFieldUpdateOperationsInput | string | null
    fuente?: StringFieldUpdateOperationsInput | string
    fecha_conciliacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConciliacionFiscalCreateManyInput = {
    id_conciliacion?: string
    tenant_id: string
    proyecto_id: string
    asiento_id: string
    pago_id?: string | null
    uuid_fiscal?: string | null
    serie?: string | null
    folio?: string | null
    rfc_emisor?: string | null
    rfc_receptor?: string | null
    monto_pagado: Decimal | DecimalJsLike | number | string
    monto_cfdi?: Decimal | DecimalJsLike | number | string | null
    moneda?: string
    fecha_emision?: Date | string | null
    fecha_timbrado?: Date | string | null
    estatus_fiscal?: string
    estatus_sat?: string
    fecha_validacion_sat?: Date | string | null
    fecha_cancelacion_sat?: Date | string | null
    ultima_verificacion_sat_at?: Date | string | null
    sat_requested_at?: Date | string | null
    sat_next_retry_at?: Date | string | null
    sat_dlq_at?: Date | string | null
    sat_retry_count?: number
    sat_dispatch_id?: string | null
    sat_last_completed_dispatch_id?: string | null
    sat_processing_started_at?: Date | string | null
    mensaje_sat?: string | null
    sat_last_error?: string | null
    fuente?: string
    fecha_conciliacion?: Date | string | null
    notas?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ConciliacionFiscalUpdateManyMutationInput = {
    id_conciliacion?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    asiento_id?: StringFieldUpdateOperationsInput | string
    pago_id?: NullableStringFieldUpdateOperationsInput | string | null
    uuid_fiscal?: NullableStringFieldUpdateOperationsInput | string | null
    serie?: NullableStringFieldUpdateOperationsInput | string | null
    folio?: NullableStringFieldUpdateOperationsInput | string | null
    rfc_emisor?: NullableStringFieldUpdateOperationsInput | string | null
    rfc_receptor?: NullableStringFieldUpdateOperationsInput | string | null
    monto_pagado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_cfdi?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    moneda?: StringFieldUpdateOperationsInput | string
    fecha_emision?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_timbrado?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estatus_fiscal?: StringFieldUpdateOperationsInput | string
    estatus_sat?: StringFieldUpdateOperationsInput | string
    fecha_validacion_sat?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_cancelacion_sat?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    ultima_verificacion_sat_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sat_requested_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sat_next_retry_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sat_dlq_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sat_retry_count?: IntFieldUpdateOperationsInput | number
    sat_dispatch_id?: NullableStringFieldUpdateOperationsInput | string | null
    sat_last_completed_dispatch_id?: NullableStringFieldUpdateOperationsInput | string | null
    sat_processing_started_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    mensaje_sat?: NullableStringFieldUpdateOperationsInput | string | null
    sat_last_error?: NullableStringFieldUpdateOperationsInput | string | null
    fuente?: StringFieldUpdateOperationsInput | string
    fecha_conciliacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConciliacionFiscalUncheckedUpdateManyInput = {
    id_conciliacion?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    asiento_id?: StringFieldUpdateOperationsInput | string
    pago_id?: NullableStringFieldUpdateOperationsInput | string | null
    uuid_fiscal?: NullableStringFieldUpdateOperationsInput | string | null
    serie?: NullableStringFieldUpdateOperationsInput | string | null
    folio?: NullableStringFieldUpdateOperationsInput | string | null
    rfc_emisor?: NullableStringFieldUpdateOperationsInput | string | null
    rfc_receptor?: NullableStringFieldUpdateOperationsInput | string | null
    monto_pagado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_cfdi?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    moneda?: StringFieldUpdateOperationsInput | string
    fecha_emision?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_timbrado?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estatus_fiscal?: StringFieldUpdateOperationsInput | string
    estatus_sat?: StringFieldUpdateOperationsInput | string
    fecha_validacion_sat?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_cancelacion_sat?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    ultima_verificacion_sat_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sat_requested_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sat_next_retry_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sat_dlq_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sat_retry_count?: IntFieldUpdateOperationsInput | number
    sat_dispatch_id?: NullableStringFieldUpdateOperationsInput | string | null
    sat_last_completed_dispatch_id?: NullableStringFieldUpdateOperationsInput | string | null
    sat_processing_started_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    mensaje_sat?: NullableStringFieldUpdateOperationsInput | string | null
    sat_last_error?: NullableStringFieldUpdateOperationsInput | string | null
    fuente?: StringFieldUpdateOperationsInput | string
    fecha_conciliacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConciliacionBancariaCreateInput = {
    id_conciliacion_bancaria?: string
    tenant_id: string
    proyecto_id: string
    asiento_id: string
    pago_id?: string | null
    referencia_bancaria?: string | null
    banco?: string | null
    metodo_pago?: string | null
    monto_pagado: Decimal | DecimalJsLike | number | string
    monto_banco?: Decimal | DecimalJsLike | number | string | null
    moneda?: string
    fecha_pago_real?: Date | string | null
    fecha_movimiento_bancario?: Date | string | null
    estatus_bancario?: string
    fuente?: string
    fecha_conciliacion?: Date | string | null
    notas?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ConciliacionBancariaUncheckedCreateInput = {
    id_conciliacion_bancaria?: string
    tenant_id: string
    proyecto_id: string
    asiento_id: string
    pago_id?: string | null
    referencia_bancaria?: string | null
    banco?: string | null
    metodo_pago?: string | null
    monto_pagado: Decimal | DecimalJsLike | number | string
    monto_banco?: Decimal | DecimalJsLike | number | string | null
    moneda?: string
    fecha_pago_real?: Date | string | null
    fecha_movimiento_bancario?: Date | string | null
    estatus_bancario?: string
    fuente?: string
    fecha_conciliacion?: Date | string | null
    notas?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ConciliacionBancariaUpdateInput = {
    id_conciliacion_bancaria?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    asiento_id?: StringFieldUpdateOperationsInput | string
    pago_id?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_bancaria?: NullableStringFieldUpdateOperationsInput | string | null
    banco?: NullableStringFieldUpdateOperationsInput | string | null
    metodo_pago?: NullableStringFieldUpdateOperationsInput | string | null
    monto_pagado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_banco?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    moneda?: StringFieldUpdateOperationsInput | string
    fecha_pago_real?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_movimiento_bancario?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estatus_bancario?: StringFieldUpdateOperationsInput | string
    fuente?: StringFieldUpdateOperationsInput | string
    fecha_conciliacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConciliacionBancariaUncheckedUpdateInput = {
    id_conciliacion_bancaria?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    asiento_id?: StringFieldUpdateOperationsInput | string
    pago_id?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_bancaria?: NullableStringFieldUpdateOperationsInput | string | null
    banco?: NullableStringFieldUpdateOperationsInput | string | null
    metodo_pago?: NullableStringFieldUpdateOperationsInput | string | null
    monto_pagado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_banco?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    moneda?: StringFieldUpdateOperationsInput | string
    fecha_pago_real?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_movimiento_bancario?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estatus_bancario?: StringFieldUpdateOperationsInput | string
    fuente?: StringFieldUpdateOperationsInput | string
    fecha_conciliacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConciliacionBancariaCreateManyInput = {
    id_conciliacion_bancaria?: string
    tenant_id: string
    proyecto_id: string
    asiento_id: string
    pago_id?: string | null
    referencia_bancaria?: string | null
    banco?: string | null
    metodo_pago?: string | null
    monto_pagado: Decimal | DecimalJsLike | number | string
    monto_banco?: Decimal | DecimalJsLike | number | string | null
    moneda?: string
    fecha_pago_real?: Date | string | null
    fecha_movimiento_bancario?: Date | string | null
    estatus_bancario?: string
    fuente?: string
    fecha_conciliacion?: Date | string | null
    notas?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ConciliacionBancariaUpdateManyMutationInput = {
    id_conciliacion_bancaria?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    asiento_id?: StringFieldUpdateOperationsInput | string
    pago_id?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_bancaria?: NullableStringFieldUpdateOperationsInput | string | null
    banco?: NullableStringFieldUpdateOperationsInput | string | null
    metodo_pago?: NullableStringFieldUpdateOperationsInput | string | null
    monto_pagado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_banco?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    moneda?: StringFieldUpdateOperationsInput | string
    fecha_pago_real?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_movimiento_bancario?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estatus_bancario?: StringFieldUpdateOperationsInput | string
    fuente?: StringFieldUpdateOperationsInput | string
    fecha_conciliacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConciliacionBancariaUncheckedUpdateManyInput = {
    id_conciliacion_bancaria?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    asiento_id?: StringFieldUpdateOperationsInput | string
    pago_id?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_bancaria?: NullableStringFieldUpdateOperationsInput | string | null
    banco?: NullableStringFieldUpdateOperationsInput | string | null
    metodo_pago?: NullableStringFieldUpdateOperationsInput | string | null
    monto_pagado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_banco?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    moneda?: StringFieldUpdateOperationsInput | string
    fecha_pago_real?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_movimiento_bancario?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estatus_bancario?: StringFieldUpdateOperationsInput | string
    fuente?: StringFieldUpdateOperationsInput | string
    fecha_conciliacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notas?: NullableStringFieldUpdateOperationsInput | string | null
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

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type AsientoContableTenant_idExternal_event_keyCompoundUniqueInput = {
    tenant_id: string
    external_event_key: string
  }

  export type AsientoContableTenant_idEvento_conciliacion_keyCompoundUniqueInput = {
    tenant_id: string
    evento_conciliacion_key: string
  }

  export type AsientoContableTenant_idProyecto_idFolio_polizaCompoundUniqueInput = {
    tenant_id: string
    proyecto_id: string
    folio_poliza: string
  }

  export type AsientoContableCountOrderByAggregateInput = {
    id_asiento?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    pago_id?: SortOrder
    external_event_key?: SortOrder
    referencia_funcional?: SortOrder
    evento_conciliacion_key?: SortOrder
    tipo_poliza?: SortOrder
    folio_poliza?: SortOrder
    concepto?: SortOrder
    monto_total?: SortOrder
    moneda?: SortOrder
    fecha_poliza?: SortOrder
    beneficiario?: SortOrder
    referencia_modulo?: SortOrder
    referencia_entidad?: SortOrder
    referencia_id?: SortOrder
    estatus?: SortOrder
    cfdi_status?: SortOrder
    bancario_status?: SortOrder
    notas?: SortOrder
    conciliado_at?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type AsientoContableAvgOrderByAggregateInput = {
    monto_total?: SortOrder
  }

  export type AsientoContableMaxOrderByAggregateInput = {
    id_asiento?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    pago_id?: SortOrder
    external_event_key?: SortOrder
    referencia_funcional?: SortOrder
    evento_conciliacion_key?: SortOrder
    tipo_poliza?: SortOrder
    folio_poliza?: SortOrder
    concepto?: SortOrder
    monto_total?: SortOrder
    moneda?: SortOrder
    fecha_poliza?: SortOrder
    beneficiario?: SortOrder
    referencia_modulo?: SortOrder
    referencia_entidad?: SortOrder
    referencia_id?: SortOrder
    estatus?: SortOrder
    cfdi_status?: SortOrder
    bancario_status?: SortOrder
    notas?: SortOrder
    conciliado_at?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type AsientoContableMinOrderByAggregateInput = {
    id_asiento?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    pago_id?: SortOrder
    external_event_key?: SortOrder
    referencia_funcional?: SortOrder
    evento_conciliacion_key?: SortOrder
    tipo_poliza?: SortOrder
    folio_poliza?: SortOrder
    concepto?: SortOrder
    monto_total?: SortOrder
    moneda?: SortOrder
    fecha_poliza?: SortOrder
    beneficiario?: SortOrder
    referencia_modulo?: SortOrder
    referencia_entidad?: SortOrder
    referencia_id?: SortOrder
    estatus?: SortOrder
    cfdi_status?: SortOrder
    bancario_status?: SortOrder
    notas?: SortOrder
    conciliado_at?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type AsientoContableSumOrderByAggregateInput = {
    monto_total?: SortOrder
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

  export type ConciliacionFiscalTenant_idAsiento_idCompoundUniqueInput = {
    tenant_id: string
    asiento_id: string
  }

  export type ConciliacionFiscalTenant_idUuid_fiscalCompoundUniqueInput = {
    tenant_id: string
    uuid_fiscal: string
  }

  export type ConciliacionFiscalCountOrderByAggregateInput = {
    id_conciliacion?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    asiento_id?: SortOrder
    pago_id?: SortOrder
    uuid_fiscal?: SortOrder
    serie?: SortOrder
    folio?: SortOrder
    rfc_emisor?: SortOrder
    rfc_receptor?: SortOrder
    monto_pagado?: SortOrder
    monto_cfdi?: SortOrder
    moneda?: SortOrder
    fecha_emision?: SortOrder
    fecha_timbrado?: SortOrder
    estatus_fiscal?: SortOrder
    estatus_sat?: SortOrder
    fecha_validacion_sat?: SortOrder
    fecha_cancelacion_sat?: SortOrder
    ultima_verificacion_sat_at?: SortOrder
    sat_requested_at?: SortOrder
    sat_next_retry_at?: SortOrder
    sat_dlq_at?: SortOrder
    sat_retry_count?: SortOrder
    sat_dispatch_id?: SortOrder
    sat_last_completed_dispatch_id?: SortOrder
    sat_processing_started_at?: SortOrder
    mensaje_sat?: SortOrder
    sat_last_error?: SortOrder
    fuente?: SortOrder
    fecha_conciliacion?: SortOrder
    notas?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ConciliacionFiscalAvgOrderByAggregateInput = {
    monto_pagado?: SortOrder
    monto_cfdi?: SortOrder
    sat_retry_count?: SortOrder
  }

  export type ConciliacionFiscalMaxOrderByAggregateInput = {
    id_conciliacion?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    asiento_id?: SortOrder
    pago_id?: SortOrder
    uuid_fiscal?: SortOrder
    serie?: SortOrder
    folio?: SortOrder
    rfc_emisor?: SortOrder
    rfc_receptor?: SortOrder
    monto_pagado?: SortOrder
    monto_cfdi?: SortOrder
    moneda?: SortOrder
    fecha_emision?: SortOrder
    fecha_timbrado?: SortOrder
    estatus_fiscal?: SortOrder
    estatus_sat?: SortOrder
    fecha_validacion_sat?: SortOrder
    fecha_cancelacion_sat?: SortOrder
    ultima_verificacion_sat_at?: SortOrder
    sat_requested_at?: SortOrder
    sat_next_retry_at?: SortOrder
    sat_dlq_at?: SortOrder
    sat_retry_count?: SortOrder
    sat_dispatch_id?: SortOrder
    sat_last_completed_dispatch_id?: SortOrder
    sat_processing_started_at?: SortOrder
    mensaje_sat?: SortOrder
    sat_last_error?: SortOrder
    fuente?: SortOrder
    fecha_conciliacion?: SortOrder
    notas?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ConciliacionFiscalMinOrderByAggregateInput = {
    id_conciliacion?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    asiento_id?: SortOrder
    pago_id?: SortOrder
    uuid_fiscal?: SortOrder
    serie?: SortOrder
    folio?: SortOrder
    rfc_emisor?: SortOrder
    rfc_receptor?: SortOrder
    monto_pagado?: SortOrder
    monto_cfdi?: SortOrder
    moneda?: SortOrder
    fecha_emision?: SortOrder
    fecha_timbrado?: SortOrder
    estatus_fiscal?: SortOrder
    estatus_sat?: SortOrder
    fecha_validacion_sat?: SortOrder
    fecha_cancelacion_sat?: SortOrder
    ultima_verificacion_sat_at?: SortOrder
    sat_requested_at?: SortOrder
    sat_next_retry_at?: SortOrder
    sat_dlq_at?: SortOrder
    sat_retry_count?: SortOrder
    sat_dispatch_id?: SortOrder
    sat_last_completed_dispatch_id?: SortOrder
    sat_processing_started_at?: SortOrder
    mensaje_sat?: SortOrder
    sat_last_error?: SortOrder
    fuente?: SortOrder
    fecha_conciliacion?: SortOrder
    notas?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ConciliacionFiscalSumOrderByAggregateInput = {
    monto_pagado?: SortOrder
    monto_cfdi?: SortOrder
    sat_retry_count?: SortOrder
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

  export type ConciliacionBancariaTenant_idAsiento_idCompoundUniqueInput = {
    tenant_id: string
    asiento_id: string
  }

  export type ConciliacionBancariaCountOrderByAggregateInput = {
    id_conciliacion_bancaria?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    asiento_id?: SortOrder
    pago_id?: SortOrder
    referencia_bancaria?: SortOrder
    banco?: SortOrder
    metodo_pago?: SortOrder
    monto_pagado?: SortOrder
    monto_banco?: SortOrder
    moneda?: SortOrder
    fecha_pago_real?: SortOrder
    fecha_movimiento_bancario?: SortOrder
    estatus_bancario?: SortOrder
    fuente?: SortOrder
    fecha_conciliacion?: SortOrder
    notas?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ConciliacionBancariaAvgOrderByAggregateInput = {
    monto_pagado?: SortOrder
    monto_banco?: SortOrder
  }

  export type ConciliacionBancariaMaxOrderByAggregateInput = {
    id_conciliacion_bancaria?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    asiento_id?: SortOrder
    pago_id?: SortOrder
    referencia_bancaria?: SortOrder
    banco?: SortOrder
    metodo_pago?: SortOrder
    monto_pagado?: SortOrder
    monto_banco?: SortOrder
    moneda?: SortOrder
    fecha_pago_real?: SortOrder
    fecha_movimiento_bancario?: SortOrder
    estatus_bancario?: SortOrder
    fuente?: SortOrder
    fecha_conciliacion?: SortOrder
    notas?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ConciliacionBancariaMinOrderByAggregateInput = {
    id_conciliacion_bancaria?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    asiento_id?: SortOrder
    pago_id?: SortOrder
    referencia_bancaria?: SortOrder
    banco?: SortOrder
    metodo_pago?: SortOrder
    monto_pagado?: SortOrder
    monto_banco?: SortOrder
    moneda?: SortOrder
    fecha_pago_real?: SortOrder
    fecha_movimiento_bancario?: SortOrder
    estatus_bancario?: SortOrder
    fuente?: SortOrder
    fecha_conciliacion?: SortOrder
    notas?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ConciliacionBancariaSumOrderByAggregateInput = {
    monto_pagado?: SortOrder
    monto_banco?: SortOrder
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
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



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use AsientoContableDefaultArgs instead
     */
    export type AsientoContableArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AsientoContableDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ConciliacionFiscalDefaultArgs instead
     */
    export type ConciliacionFiscalArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ConciliacionFiscalDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ConciliacionBancariaDefaultArgs instead
     */
    export type ConciliacionBancariaArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ConciliacionBancariaDefaultArgs<ExtArgs>

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