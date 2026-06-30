
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
 * Model ItemInventario
 * 
 */
export type ItemInventario = $Result.DefaultSelection<Prisma.$ItemInventarioPayload>
/**
 * Model MovimientoAlmacen
 * 
 */
export type MovimientoAlmacen = $Result.DefaultSelection<Prisma.$MovimientoAlmacenPayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more ItemInventarios
 * const itemInventarios = await prisma.itemInventario.findMany()
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
   * // Fetch zero or more ItemInventarios
   * const itemInventarios = await prisma.itemInventario.findMany()
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
   * `prisma.itemInventario`: Exposes CRUD operations for the **ItemInventario** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ItemInventarios
    * const itemInventarios = await prisma.itemInventario.findMany()
    * ```
    */
  get itemInventario(): Prisma.ItemInventarioDelegate<ExtArgs>;

  /**
   * `prisma.movimientoAlmacen`: Exposes CRUD operations for the **MovimientoAlmacen** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MovimientoAlmacens
    * const movimientoAlmacens = await prisma.movimientoAlmacen.findMany()
    * ```
    */
  get movimientoAlmacen(): Prisma.MovimientoAlmacenDelegate<ExtArgs>;
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
    ItemInventario: 'ItemInventario',
    MovimientoAlmacen: 'MovimientoAlmacen'
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
      modelProps: "itemInventario" | "movimientoAlmacen"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      ItemInventario: {
        payload: Prisma.$ItemInventarioPayload<ExtArgs>
        fields: Prisma.ItemInventarioFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ItemInventarioFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemInventarioPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ItemInventarioFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemInventarioPayload>
          }
          findFirst: {
            args: Prisma.ItemInventarioFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemInventarioPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ItemInventarioFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemInventarioPayload>
          }
          findMany: {
            args: Prisma.ItemInventarioFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemInventarioPayload>[]
          }
          create: {
            args: Prisma.ItemInventarioCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemInventarioPayload>
          }
          createMany: {
            args: Prisma.ItemInventarioCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ItemInventarioCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemInventarioPayload>[]
          }
          delete: {
            args: Prisma.ItemInventarioDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemInventarioPayload>
          }
          update: {
            args: Prisma.ItemInventarioUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemInventarioPayload>
          }
          deleteMany: {
            args: Prisma.ItemInventarioDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ItemInventarioUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ItemInventarioUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemInventarioPayload>
          }
          aggregate: {
            args: Prisma.ItemInventarioAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateItemInventario>
          }
          groupBy: {
            args: Prisma.ItemInventarioGroupByArgs<ExtArgs>
            result: $Utils.Optional<ItemInventarioGroupByOutputType>[]
          }
          count: {
            args: Prisma.ItemInventarioCountArgs<ExtArgs>
            result: $Utils.Optional<ItemInventarioCountAggregateOutputType> | number
          }
        }
      }
      MovimientoAlmacen: {
        payload: Prisma.$MovimientoAlmacenPayload<ExtArgs>
        fields: Prisma.MovimientoAlmacenFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MovimientoAlmacenFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MovimientoAlmacenPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MovimientoAlmacenFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MovimientoAlmacenPayload>
          }
          findFirst: {
            args: Prisma.MovimientoAlmacenFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MovimientoAlmacenPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MovimientoAlmacenFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MovimientoAlmacenPayload>
          }
          findMany: {
            args: Prisma.MovimientoAlmacenFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MovimientoAlmacenPayload>[]
          }
          create: {
            args: Prisma.MovimientoAlmacenCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MovimientoAlmacenPayload>
          }
          createMany: {
            args: Prisma.MovimientoAlmacenCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MovimientoAlmacenCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MovimientoAlmacenPayload>[]
          }
          delete: {
            args: Prisma.MovimientoAlmacenDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MovimientoAlmacenPayload>
          }
          update: {
            args: Prisma.MovimientoAlmacenUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MovimientoAlmacenPayload>
          }
          deleteMany: {
            args: Prisma.MovimientoAlmacenDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MovimientoAlmacenUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.MovimientoAlmacenUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MovimientoAlmacenPayload>
          }
          aggregate: {
            args: Prisma.MovimientoAlmacenAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMovimientoAlmacen>
          }
          groupBy: {
            args: Prisma.MovimientoAlmacenGroupByArgs<ExtArgs>
            result: $Utils.Optional<MovimientoAlmacenGroupByOutputType>[]
          }
          count: {
            args: Prisma.MovimientoAlmacenCountArgs<ExtArgs>
            result: $Utils.Optional<MovimientoAlmacenCountAggregateOutputType> | number
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
   * Count Type ItemInventarioCountOutputType
   */

  export type ItemInventarioCountOutputType = {
    movimientos: number
  }

  export type ItemInventarioCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    movimientos?: boolean | ItemInventarioCountOutputTypeCountMovimientosArgs
  }

  // Custom InputTypes
  /**
   * ItemInventarioCountOutputType without action
   */
  export type ItemInventarioCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemInventarioCountOutputType
     */
    select?: ItemInventarioCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ItemInventarioCountOutputType without action
   */
  export type ItemInventarioCountOutputTypeCountMovimientosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MovimientoAlmacenWhereInput
  }


  /**
   * Models
   */

  /**
   * Model ItemInventario
   */

  export type AggregateItemInventario = {
    _count: ItemInventarioCountAggregateOutputType | null
    _avg: ItemInventarioAvgAggregateOutputType | null
    _sum: ItemInventarioSumAggregateOutputType | null
    _min: ItemInventarioMinAggregateOutputType | null
    _max: ItemInventarioMaxAggregateOutputType | null
  }

  export type ItemInventarioAvgAggregateOutputType = {
    stock_actual: Decimal | null
    stock_minimo: Decimal | null
  }

  export type ItemInventarioSumAggregateOutputType = {
    stock_actual: Decimal | null
    stock_minimo: Decimal | null
  }

  export type ItemInventarioMinAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    proyecto_id: string | null
    insumo_id: string | null
    clave: string | null
    descripcion: string | null
    unidad: string | null
    categoria: string | null
    stock_actual: Decimal | null
    stock_minimo: Decimal | null
    ubicacion: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type ItemInventarioMaxAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    proyecto_id: string | null
    insumo_id: string | null
    clave: string | null
    descripcion: string | null
    unidad: string | null
    categoria: string | null
    stock_actual: Decimal | null
    stock_minimo: Decimal | null
    ubicacion: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type ItemInventarioCountAggregateOutputType = {
    id: number
    tenant_id: number
    proyecto_id: number
    insumo_id: number
    clave: number
    descripcion: number
    unidad: number
    categoria: number
    stock_actual: number
    stock_minimo: number
    ubicacion: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type ItemInventarioAvgAggregateInputType = {
    stock_actual?: true
    stock_minimo?: true
  }

  export type ItemInventarioSumAggregateInputType = {
    stock_actual?: true
    stock_minimo?: true
  }

  export type ItemInventarioMinAggregateInputType = {
    id?: true
    tenant_id?: true
    proyecto_id?: true
    insumo_id?: true
    clave?: true
    descripcion?: true
    unidad?: true
    categoria?: true
    stock_actual?: true
    stock_minimo?: true
    ubicacion?: true
    created_at?: true
    updated_at?: true
  }

  export type ItemInventarioMaxAggregateInputType = {
    id?: true
    tenant_id?: true
    proyecto_id?: true
    insumo_id?: true
    clave?: true
    descripcion?: true
    unidad?: true
    categoria?: true
    stock_actual?: true
    stock_minimo?: true
    ubicacion?: true
    created_at?: true
    updated_at?: true
  }

  export type ItemInventarioCountAggregateInputType = {
    id?: true
    tenant_id?: true
    proyecto_id?: true
    insumo_id?: true
    clave?: true
    descripcion?: true
    unidad?: true
    categoria?: true
    stock_actual?: true
    stock_minimo?: true
    ubicacion?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type ItemInventarioAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ItemInventario to aggregate.
     */
    where?: ItemInventarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ItemInventarios to fetch.
     */
    orderBy?: ItemInventarioOrderByWithRelationInput | ItemInventarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ItemInventarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ItemInventarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ItemInventarios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ItemInventarios
    **/
    _count?: true | ItemInventarioCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ItemInventarioAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ItemInventarioSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ItemInventarioMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ItemInventarioMaxAggregateInputType
  }

  export type GetItemInventarioAggregateType<T extends ItemInventarioAggregateArgs> = {
        [P in keyof T & keyof AggregateItemInventario]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateItemInventario[P]>
      : GetScalarType<T[P], AggregateItemInventario[P]>
  }




  export type ItemInventarioGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ItemInventarioWhereInput
    orderBy?: ItemInventarioOrderByWithAggregationInput | ItemInventarioOrderByWithAggregationInput[]
    by: ItemInventarioScalarFieldEnum[] | ItemInventarioScalarFieldEnum
    having?: ItemInventarioScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ItemInventarioCountAggregateInputType | true
    _avg?: ItemInventarioAvgAggregateInputType
    _sum?: ItemInventarioSumAggregateInputType
    _min?: ItemInventarioMinAggregateInputType
    _max?: ItemInventarioMaxAggregateInputType
  }

  export type ItemInventarioGroupByOutputType = {
    id: string
    tenant_id: string
    proyecto_id: string
    insumo_id: string | null
    clave: string
    descripcion: string
    unidad: string
    categoria: string
    stock_actual: Decimal
    stock_minimo: Decimal
    ubicacion: string | null
    created_at: Date
    updated_at: Date
    _count: ItemInventarioCountAggregateOutputType | null
    _avg: ItemInventarioAvgAggregateOutputType | null
    _sum: ItemInventarioSumAggregateOutputType | null
    _min: ItemInventarioMinAggregateOutputType | null
    _max: ItemInventarioMaxAggregateOutputType | null
  }

  type GetItemInventarioGroupByPayload<T extends ItemInventarioGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ItemInventarioGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ItemInventarioGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ItemInventarioGroupByOutputType[P]>
            : GetScalarType<T[P], ItemInventarioGroupByOutputType[P]>
        }
      >
    >


  export type ItemInventarioSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    insumo_id?: boolean
    clave?: boolean
    descripcion?: boolean
    unidad?: boolean
    categoria?: boolean
    stock_actual?: boolean
    stock_minimo?: boolean
    ubicacion?: boolean
    created_at?: boolean
    updated_at?: boolean
    movimientos?: boolean | ItemInventario$movimientosArgs<ExtArgs>
    _count?: boolean | ItemInventarioCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["itemInventario"]>

  export type ItemInventarioSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    insumo_id?: boolean
    clave?: boolean
    descripcion?: boolean
    unidad?: boolean
    categoria?: boolean
    stock_actual?: boolean
    stock_minimo?: boolean
    ubicacion?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["itemInventario"]>

  export type ItemInventarioSelectScalar = {
    id?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    insumo_id?: boolean
    clave?: boolean
    descripcion?: boolean
    unidad?: boolean
    categoria?: boolean
    stock_actual?: boolean
    stock_minimo?: boolean
    ubicacion?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type ItemInventarioInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    movimientos?: boolean | ItemInventario$movimientosArgs<ExtArgs>
    _count?: boolean | ItemInventarioCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ItemInventarioIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $ItemInventarioPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ItemInventario"
    objects: {
      movimientos: Prisma.$MovimientoAlmacenPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenant_id: string
      proyecto_id: string
      insumo_id: string | null
      clave: string
      descripcion: string
      unidad: string
      categoria: string
      stock_actual: Prisma.Decimal
      stock_minimo: Prisma.Decimal
      ubicacion: string | null
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["itemInventario"]>
    composites: {}
  }

  type ItemInventarioGetPayload<S extends boolean | null | undefined | ItemInventarioDefaultArgs> = $Result.GetResult<Prisma.$ItemInventarioPayload, S>

  type ItemInventarioCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ItemInventarioFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ItemInventarioCountAggregateInputType | true
    }

  export interface ItemInventarioDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ItemInventario'], meta: { name: 'ItemInventario' } }
    /**
     * Find zero or one ItemInventario that matches the filter.
     * @param {ItemInventarioFindUniqueArgs} args - Arguments to find a ItemInventario
     * @example
     * // Get one ItemInventario
     * const itemInventario = await prisma.itemInventario.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ItemInventarioFindUniqueArgs>(args: SelectSubset<T, ItemInventarioFindUniqueArgs<ExtArgs>>): Prisma__ItemInventarioClient<$Result.GetResult<Prisma.$ItemInventarioPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ItemInventario that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ItemInventarioFindUniqueOrThrowArgs} args - Arguments to find a ItemInventario
     * @example
     * // Get one ItemInventario
     * const itemInventario = await prisma.itemInventario.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ItemInventarioFindUniqueOrThrowArgs>(args: SelectSubset<T, ItemInventarioFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ItemInventarioClient<$Result.GetResult<Prisma.$ItemInventarioPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ItemInventario that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ItemInventarioFindFirstArgs} args - Arguments to find a ItemInventario
     * @example
     * // Get one ItemInventario
     * const itemInventario = await prisma.itemInventario.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ItemInventarioFindFirstArgs>(args?: SelectSubset<T, ItemInventarioFindFirstArgs<ExtArgs>>): Prisma__ItemInventarioClient<$Result.GetResult<Prisma.$ItemInventarioPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ItemInventario that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ItemInventarioFindFirstOrThrowArgs} args - Arguments to find a ItemInventario
     * @example
     * // Get one ItemInventario
     * const itemInventario = await prisma.itemInventario.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ItemInventarioFindFirstOrThrowArgs>(args?: SelectSubset<T, ItemInventarioFindFirstOrThrowArgs<ExtArgs>>): Prisma__ItemInventarioClient<$Result.GetResult<Prisma.$ItemInventarioPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ItemInventarios that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ItemInventarioFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ItemInventarios
     * const itemInventarios = await prisma.itemInventario.findMany()
     * 
     * // Get first 10 ItemInventarios
     * const itemInventarios = await prisma.itemInventario.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const itemInventarioWithIdOnly = await prisma.itemInventario.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ItemInventarioFindManyArgs>(args?: SelectSubset<T, ItemInventarioFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ItemInventarioPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ItemInventario.
     * @param {ItemInventarioCreateArgs} args - Arguments to create a ItemInventario.
     * @example
     * // Create one ItemInventario
     * const ItemInventario = await prisma.itemInventario.create({
     *   data: {
     *     // ... data to create a ItemInventario
     *   }
     * })
     * 
     */
    create<T extends ItemInventarioCreateArgs>(args: SelectSubset<T, ItemInventarioCreateArgs<ExtArgs>>): Prisma__ItemInventarioClient<$Result.GetResult<Prisma.$ItemInventarioPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ItemInventarios.
     * @param {ItemInventarioCreateManyArgs} args - Arguments to create many ItemInventarios.
     * @example
     * // Create many ItemInventarios
     * const itemInventario = await prisma.itemInventario.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ItemInventarioCreateManyArgs>(args?: SelectSubset<T, ItemInventarioCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ItemInventarios and returns the data saved in the database.
     * @param {ItemInventarioCreateManyAndReturnArgs} args - Arguments to create many ItemInventarios.
     * @example
     * // Create many ItemInventarios
     * const itemInventario = await prisma.itemInventario.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ItemInventarios and only return the `id`
     * const itemInventarioWithIdOnly = await prisma.itemInventario.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ItemInventarioCreateManyAndReturnArgs>(args?: SelectSubset<T, ItemInventarioCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ItemInventarioPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ItemInventario.
     * @param {ItemInventarioDeleteArgs} args - Arguments to delete one ItemInventario.
     * @example
     * // Delete one ItemInventario
     * const ItemInventario = await prisma.itemInventario.delete({
     *   where: {
     *     // ... filter to delete one ItemInventario
     *   }
     * })
     * 
     */
    delete<T extends ItemInventarioDeleteArgs>(args: SelectSubset<T, ItemInventarioDeleteArgs<ExtArgs>>): Prisma__ItemInventarioClient<$Result.GetResult<Prisma.$ItemInventarioPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ItemInventario.
     * @param {ItemInventarioUpdateArgs} args - Arguments to update one ItemInventario.
     * @example
     * // Update one ItemInventario
     * const itemInventario = await prisma.itemInventario.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ItemInventarioUpdateArgs>(args: SelectSubset<T, ItemInventarioUpdateArgs<ExtArgs>>): Prisma__ItemInventarioClient<$Result.GetResult<Prisma.$ItemInventarioPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ItemInventarios.
     * @param {ItemInventarioDeleteManyArgs} args - Arguments to filter ItemInventarios to delete.
     * @example
     * // Delete a few ItemInventarios
     * const { count } = await prisma.itemInventario.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ItemInventarioDeleteManyArgs>(args?: SelectSubset<T, ItemInventarioDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ItemInventarios.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ItemInventarioUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ItemInventarios
     * const itemInventario = await prisma.itemInventario.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ItemInventarioUpdateManyArgs>(args: SelectSubset<T, ItemInventarioUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ItemInventario.
     * @param {ItemInventarioUpsertArgs} args - Arguments to update or create a ItemInventario.
     * @example
     * // Update or create a ItemInventario
     * const itemInventario = await prisma.itemInventario.upsert({
     *   create: {
     *     // ... data to create a ItemInventario
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ItemInventario we want to update
     *   }
     * })
     */
    upsert<T extends ItemInventarioUpsertArgs>(args: SelectSubset<T, ItemInventarioUpsertArgs<ExtArgs>>): Prisma__ItemInventarioClient<$Result.GetResult<Prisma.$ItemInventarioPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ItemInventarios.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ItemInventarioCountArgs} args - Arguments to filter ItemInventarios to count.
     * @example
     * // Count the number of ItemInventarios
     * const count = await prisma.itemInventario.count({
     *   where: {
     *     // ... the filter for the ItemInventarios we want to count
     *   }
     * })
    **/
    count<T extends ItemInventarioCountArgs>(
      args?: Subset<T, ItemInventarioCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ItemInventarioCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ItemInventario.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ItemInventarioAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ItemInventarioAggregateArgs>(args: Subset<T, ItemInventarioAggregateArgs>): Prisma.PrismaPromise<GetItemInventarioAggregateType<T>>

    /**
     * Group by ItemInventario.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ItemInventarioGroupByArgs} args - Group by arguments.
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
      T extends ItemInventarioGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ItemInventarioGroupByArgs['orderBy'] }
        : { orderBy?: ItemInventarioGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ItemInventarioGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetItemInventarioGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ItemInventario model
   */
  readonly fields: ItemInventarioFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ItemInventario.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ItemInventarioClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    movimientos<T extends ItemInventario$movimientosArgs<ExtArgs> = {}>(args?: Subset<T, ItemInventario$movimientosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MovimientoAlmacenPayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the ItemInventario model
   */ 
  interface ItemInventarioFieldRefs {
    readonly id: FieldRef<"ItemInventario", 'String'>
    readonly tenant_id: FieldRef<"ItemInventario", 'String'>
    readonly proyecto_id: FieldRef<"ItemInventario", 'String'>
    readonly insumo_id: FieldRef<"ItemInventario", 'String'>
    readonly clave: FieldRef<"ItemInventario", 'String'>
    readonly descripcion: FieldRef<"ItemInventario", 'String'>
    readonly unidad: FieldRef<"ItemInventario", 'String'>
    readonly categoria: FieldRef<"ItemInventario", 'String'>
    readonly stock_actual: FieldRef<"ItemInventario", 'Decimal'>
    readonly stock_minimo: FieldRef<"ItemInventario", 'Decimal'>
    readonly ubicacion: FieldRef<"ItemInventario", 'String'>
    readonly created_at: FieldRef<"ItemInventario", 'DateTime'>
    readonly updated_at: FieldRef<"ItemInventario", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ItemInventario findUnique
   */
  export type ItemInventarioFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemInventario
     */
    select?: ItemInventarioSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemInventarioInclude<ExtArgs> | null
    /**
     * Filter, which ItemInventario to fetch.
     */
    where: ItemInventarioWhereUniqueInput
  }

  /**
   * ItemInventario findUniqueOrThrow
   */
  export type ItemInventarioFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemInventario
     */
    select?: ItemInventarioSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemInventarioInclude<ExtArgs> | null
    /**
     * Filter, which ItemInventario to fetch.
     */
    where: ItemInventarioWhereUniqueInput
  }

  /**
   * ItemInventario findFirst
   */
  export type ItemInventarioFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemInventario
     */
    select?: ItemInventarioSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemInventarioInclude<ExtArgs> | null
    /**
     * Filter, which ItemInventario to fetch.
     */
    where?: ItemInventarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ItemInventarios to fetch.
     */
    orderBy?: ItemInventarioOrderByWithRelationInput | ItemInventarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ItemInventarios.
     */
    cursor?: ItemInventarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ItemInventarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ItemInventarios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ItemInventarios.
     */
    distinct?: ItemInventarioScalarFieldEnum | ItemInventarioScalarFieldEnum[]
  }

  /**
   * ItemInventario findFirstOrThrow
   */
  export type ItemInventarioFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemInventario
     */
    select?: ItemInventarioSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemInventarioInclude<ExtArgs> | null
    /**
     * Filter, which ItemInventario to fetch.
     */
    where?: ItemInventarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ItemInventarios to fetch.
     */
    orderBy?: ItemInventarioOrderByWithRelationInput | ItemInventarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ItemInventarios.
     */
    cursor?: ItemInventarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ItemInventarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ItemInventarios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ItemInventarios.
     */
    distinct?: ItemInventarioScalarFieldEnum | ItemInventarioScalarFieldEnum[]
  }

  /**
   * ItemInventario findMany
   */
  export type ItemInventarioFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemInventario
     */
    select?: ItemInventarioSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemInventarioInclude<ExtArgs> | null
    /**
     * Filter, which ItemInventarios to fetch.
     */
    where?: ItemInventarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ItemInventarios to fetch.
     */
    orderBy?: ItemInventarioOrderByWithRelationInput | ItemInventarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ItemInventarios.
     */
    cursor?: ItemInventarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ItemInventarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ItemInventarios.
     */
    skip?: number
    distinct?: ItemInventarioScalarFieldEnum | ItemInventarioScalarFieldEnum[]
  }

  /**
   * ItemInventario create
   */
  export type ItemInventarioCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemInventario
     */
    select?: ItemInventarioSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemInventarioInclude<ExtArgs> | null
    /**
     * The data needed to create a ItemInventario.
     */
    data: XOR<ItemInventarioCreateInput, ItemInventarioUncheckedCreateInput>
  }

  /**
   * ItemInventario createMany
   */
  export type ItemInventarioCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ItemInventarios.
     */
    data: ItemInventarioCreateManyInput | ItemInventarioCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ItemInventario createManyAndReturn
   */
  export type ItemInventarioCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemInventario
     */
    select?: ItemInventarioSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ItemInventarios.
     */
    data: ItemInventarioCreateManyInput | ItemInventarioCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ItemInventario update
   */
  export type ItemInventarioUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemInventario
     */
    select?: ItemInventarioSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemInventarioInclude<ExtArgs> | null
    /**
     * The data needed to update a ItemInventario.
     */
    data: XOR<ItemInventarioUpdateInput, ItemInventarioUncheckedUpdateInput>
    /**
     * Choose, which ItemInventario to update.
     */
    where: ItemInventarioWhereUniqueInput
  }

  /**
   * ItemInventario updateMany
   */
  export type ItemInventarioUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ItemInventarios.
     */
    data: XOR<ItemInventarioUpdateManyMutationInput, ItemInventarioUncheckedUpdateManyInput>
    /**
     * Filter which ItemInventarios to update
     */
    where?: ItemInventarioWhereInput
  }

  /**
   * ItemInventario upsert
   */
  export type ItemInventarioUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemInventario
     */
    select?: ItemInventarioSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemInventarioInclude<ExtArgs> | null
    /**
     * The filter to search for the ItemInventario to update in case it exists.
     */
    where: ItemInventarioWhereUniqueInput
    /**
     * In case the ItemInventario found by the `where` argument doesn't exist, create a new ItemInventario with this data.
     */
    create: XOR<ItemInventarioCreateInput, ItemInventarioUncheckedCreateInput>
    /**
     * In case the ItemInventario was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ItemInventarioUpdateInput, ItemInventarioUncheckedUpdateInput>
  }

  /**
   * ItemInventario delete
   */
  export type ItemInventarioDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemInventario
     */
    select?: ItemInventarioSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemInventarioInclude<ExtArgs> | null
    /**
     * Filter which ItemInventario to delete.
     */
    where: ItemInventarioWhereUniqueInput
  }

  /**
   * ItemInventario deleteMany
   */
  export type ItemInventarioDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ItemInventarios to delete
     */
    where?: ItemInventarioWhereInput
  }

  /**
   * ItemInventario.movimientos
   */
  export type ItemInventario$movimientosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MovimientoAlmacen
     */
    select?: MovimientoAlmacenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MovimientoAlmacenInclude<ExtArgs> | null
    where?: MovimientoAlmacenWhereInput
    orderBy?: MovimientoAlmacenOrderByWithRelationInput | MovimientoAlmacenOrderByWithRelationInput[]
    cursor?: MovimientoAlmacenWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MovimientoAlmacenScalarFieldEnum | MovimientoAlmacenScalarFieldEnum[]
  }

  /**
   * ItemInventario without action
   */
  export type ItemInventarioDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemInventario
     */
    select?: ItemInventarioSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemInventarioInclude<ExtArgs> | null
  }


  /**
   * Model MovimientoAlmacen
   */

  export type AggregateMovimientoAlmacen = {
    _count: MovimientoAlmacenCountAggregateOutputType | null
    _avg: MovimientoAlmacenAvgAggregateOutputType | null
    _sum: MovimientoAlmacenSumAggregateOutputType | null
    _min: MovimientoAlmacenMinAggregateOutputType | null
    _max: MovimientoAlmacenMaxAggregateOutputType | null
  }

  export type MovimientoAlmacenAvgAggregateOutputType = {
    cantidad: Decimal | null
  }

  export type MovimientoAlmacenSumAggregateOutputType = {
    cantidad: Decimal | null
  }

  export type MovimientoAlmacenMinAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    proyecto_id: string | null
    item_id: string | null
    tipo: string | null
    cantidad: Decimal | null
    unidad: string | null
    origen: string | null
    destino: string | null
    responsable: string | null
    referencia: string | null
    fecha: Date | null
    concepto_id: string | null
    concepto_clave: string | null
    frente_trabajo: string | null
    oc_item_id: string | null
  }

  export type MovimientoAlmacenMaxAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    proyecto_id: string | null
    item_id: string | null
    tipo: string | null
    cantidad: Decimal | null
    unidad: string | null
    origen: string | null
    destino: string | null
    responsable: string | null
    referencia: string | null
    fecha: Date | null
    concepto_id: string | null
    concepto_clave: string | null
    frente_trabajo: string | null
    oc_item_id: string | null
  }

  export type MovimientoAlmacenCountAggregateOutputType = {
    id: number
    tenant_id: number
    proyecto_id: number
    item_id: number
    tipo: number
    cantidad: number
    unidad: number
    origen: number
    destino: number
    responsable: number
    referencia: number
    fecha: number
    concepto_id: number
    concepto_clave: number
    frente_trabajo: number
    oc_item_id: number
    _all: number
  }


  export type MovimientoAlmacenAvgAggregateInputType = {
    cantidad?: true
  }

  export type MovimientoAlmacenSumAggregateInputType = {
    cantidad?: true
  }

  export type MovimientoAlmacenMinAggregateInputType = {
    id?: true
    tenant_id?: true
    proyecto_id?: true
    item_id?: true
    tipo?: true
    cantidad?: true
    unidad?: true
    origen?: true
    destino?: true
    responsable?: true
    referencia?: true
    fecha?: true
    concepto_id?: true
    concepto_clave?: true
    frente_trabajo?: true
    oc_item_id?: true
  }

  export type MovimientoAlmacenMaxAggregateInputType = {
    id?: true
    tenant_id?: true
    proyecto_id?: true
    item_id?: true
    tipo?: true
    cantidad?: true
    unidad?: true
    origen?: true
    destino?: true
    responsable?: true
    referencia?: true
    fecha?: true
    concepto_id?: true
    concepto_clave?: true
    frente_trabajo?: true
    oc_item_id?: true
  }

  export type MovimientoAlmacenCountAggregateInputType = {
    id?: true
    tenant_id?: true
    proyecto_id?: true
    item_id?: true
    tipo?: true
    cantidad?: true
    unidad?: true
    origen?: true
    destino?: true
    responsable?: true
    referencia?: true
    fecha?: true
    concepto_id?: true
    concepto_clave?: true
    frente_trabajo?: true
    oc_item_id?: true
    _all?: true
  }

  export type MovimientoAlmacenAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MovimientoAlmacen to aggregate.
     */
    where?: MovimientoAlmacenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MovimientoAlmacens to fetch.
     */
    orderBy?: MovimientoAlmacenOrderByWithRelationInput | MovimientoAlmacenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MovimientoAlmacenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MovimientoAlmacens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MovimientoAlmacens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MovimientoAlmacens
    **/
    _count?: true | MovimientoAlmacenCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: MovimientoAlmacenAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: MovimientoAlmacenSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MovimientoAlmacenMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MovimientoAlmacenMaxAggregateInputType
  }

  export type GetMovimientoAlmacenAggregateType<T extends MovimientoAlmacenAggregateArgs> = {
        [P in keyof T & keyof AggregateMovimientoAlmacen]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMovimientoAlmacen[P]>
      : GetScalarType<T[P], AggregateMovimientoAlmacen[P]>
  }




  export type MovimientoAlmacenGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MovimientoAlmacenWhereInput
    orderBy?: MovimientoAlmacenOrderByWithAggregationInput | MovimientoAlmacenOrderByWithAggregationInput[]
    by: MovimientoAlmacenScalarFieldEnum[] | MovimientoAlmacenScalarFieldEnum
    having?: MovimientoAlmacenScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MovimientoAlmacenCountAggregateInputType | true
    _avg?: MovimientoAlmacenAvgAggregateInputType
    _sum?: MovimientoAlmacenSumAggregateInputType
    _min?: MovimientoAlmacenMinAggregateInputType
    _max?: MovimientoAlmacenMaxAggregateInputType
  }

  export type MovimientoAlmacenGroupByOutputType = {
    id: string
    tenant_id: string
    proyecto_id: string
    item_id: string
    tipo: string
    cantidad: Decimal
    unidad: string
    origen: string | null
    destino: string | null
    responsable: string | null
    referencia: string | null
    fecha: Date
    concepto_id: string | null
    concepto_clave: string | null
    frente_trabajo: string | null
    oc_item_id: string | null
    _count: MovimientoAlmacenCountAggregateOutputType | null
    _avg: MovimientoAlmacenAvgAggregateOutputType | null
    _sum: MovimientoAlmacenSumAggregateOutputType | null
    _min: MovimientoAlmacenMinAggregateOutputType | null
    _max: MovimientoAlmacenMaxAggregateOutputType | null
  }

  type GetMovimientoAlmacenGroupByPayload<T extends MovimientoAlmacenGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MovimientoAlmacenGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MovimientoAlmacenGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MovimientoAlmacenGroupByOutputType[P]>
            : GetScalarType<T[P], MovimientoAlmacenGroupByOutputType[P]>
        }
      >
    >


  export type MovimientoAlmacenSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    item_id?: boolean
    tipo?: boolean
    cantidad?: boolean
    unidad?: boolean
    origen?: boolean
    destino?: boolean
    responsable?: boolean
    referencia?: boolean
    fecha?: boolean
    concepto_id?: boolean
    concepto_clave?: boolean
    frente_trabajo?: boolean
    oc_item_id?: boolean
    item?: boolean | ItemInventarioDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["movimientoAlmacen"]>

  export type MovimientoAlmacenSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    item_id?: boolean
    tipo?: boolean
    cantidad?: boolean
    unidad?: boolean
    origen?: boolean
    destino?: boolean
    responsable?: boolean
    referencia?: boolean
    fecha?: boolean
    concepto_id?: boolean
    concepto_clave?: boolean
    frente_trabajo?: boolean
    oc_item_id?: boolean
    item?: boolean | ItemInventarioDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["movimientoAlmacen"]>

  export type MovimientoAlmacenSelectScalar = {
    id?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    item_id?: boolean
    tipo?: boolean
    cantidad?: boolean
    unidad?: boolean
    origen?: boolean
    destino?: boolean
    responsable?: boolean
    referencia?: boolean
    fecha?: boolean
    concepto_id?: boolean
    concepto_clave?: boolean
    frente_trabajo?: boolean
    oc_item_id?: boolean
  }

  export type MovimientoAlmacenInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    item?: boolean | ItemInventarioDefaultArgs<ExtArgs>
  }
  export type MovimientoAlmacenIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    item?: boolean | ItemInventarioDefaultArgs<ExtArgs>
  }

  export type $MovimientoAlmacenPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MovimientoAlmacen"
    objects: {
      item: Prisma.$ItemInventarioPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenant_id: string
      proyecto_id: string
      item_id: string
      tipo: string
      cantidad: Prisma.Decimal
      unidad: string
      origen: string | null
      destino: string | null
      responsable: string | null
      referencia: string | null
      fecha: Date
      concepto_id: string | null
      concepto_clave: string | null
      frente_trabajo: string | null
      oc_item_id: string | null
    }, ExtArgs["result"]["movimientoAlmacen"]>
    composites: {}
  }

  type MovimientoAlmacenGetPayload<S extends boolean | null | undefined | MovimientoAlmacenDefaultArgs> = $Result.GetResult<Prisma.$MovimientoAlmacenPayload, S>

  type MovimientoAlmacenCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<MovimientoAlmacenFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: MovimientoAlmacenCountAggregateInputType | true
    }

  export interface MovimientoAlmacenDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MovimientoAlmacen'], meta: { name: 'MovimientoAlmacen' } }
    /**
     * Find zero or one MovimientoAlmacen that matches the filter.
     * @param {MovimientoAlmacenFindUniqueArgs} args - Arguments to find a MovimientoAlmacen
     * @example
     * // Get one MovimientoAlmacen
     * const movimientoAlmacen = await prisma.movimientoAlmacen.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MovimientoAlmacenFindUniqueArgs>(args: SelectSubset<T, MovimientoAlmacenFindUniqueArgs<ExtArgs>>): Prisma__MovimientoAlmacenClient<$Result.GetResult<Prisma.$MovimientoAlmacenPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one MovimientoAlmacen that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {MovimientoAlmacenFindUniqueOrThrowArgs} args - Arguments to find a MovimientoAlmacen
     * @example
     * // Get one MovimientoAlmacen
     * const movimientoAlmacen = await prisma.movimientoAlmacen.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MovimientoAlmacenFindUniqueOrThrowArgs>(args: SelectSubset<T, MovimientoAlmacenFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MovimientoAlmacenClient<$Result.GetResult<Prisma.$MovimientoAlmacenPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first MovimientoAlmacen that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MovimientoAlmacenFindFirstArgs} args - Arguments to find a MovimientoAlmacen
     * @example
     * // Get one MovimientoAlmacen
     * const movimientoAlmacen = await prisma.movimientoAlmacen.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MovimientoAlmacenFindFirstArgs>(args?: SelectSubset<T, MovimientoAlmacenFindFirstArgs<ExtArgs>>): Prisma__MovimientoAlmacenClient<$Result.GetResult<Prisma.$MovimientoAlmacenPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first MovimientoAlmacen that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MovimientoAlmacenFindFirstOrThrowArgs} args - Arguments to find a MovimientoAlmacen
     * @example
     * // Get one MovimientoAlmacen
     * const movimientoAlmacen = await prisma.movimientoAlmacen.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MovimientoAlmacenFindFirstOrThrowArgs>(args?: SelectSubset<T, MovimientoAlmacenFindFirstOrThrowArgs<ExtArgs>>): Prisma__MovimientoAlmacenClient<$Result.GetResult<Prisma.$MovimientoAlmacenPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more MovimientoAlmacens that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MovimientoAlmacenFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MovimientoAlmacens
     * const movimientoAlmacens = await prisma.movimientoAlmacen.findMany()
     * 
     * // Get first 10 MovimientoAlmacens
     * const movimientoAlmacens = await prisma.movimientoAlmacen.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const movimientoAlmacenWithIdOnly = await prisma.movimientoAlmacen.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MovimientoAlmacenFindManyArgs>(args?: SelectSubset<T, MovimientoAlmacenFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MovimientoAlmacenPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a MovimientoAlmacen.
     * @param {MovimientoAlmacenCreateArgs} args - Arguments to create a MovimientoAlmacen.
     * @example
     * // Create one MovimientoAlmacen
     * const MovimientoAlmacen = await prisma.movimientoAlmacen.create({
     *   data: {
     *     // ... data to create a MovimientoAlmacen
     *   }
     * })
     * 
     */
    create<T extends MovimientoAlmacenCreateArgs>(args: SelectSubset<T, MovimientoAlmacenCreateArgs<ExtArgs>>): Prisma__MovimientoAlmacenClient<$Result.GetResult<Prisma.$MovimientoAlmacenPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many MovimientoAlmacens.
     * @param {MovimientoAlmacenCreateManyArgs} args - Arguments to create many MovimientoAlmacens.
     * @example
     * // Create many MovimientoAlmacens
     * const movimientoAlmacen = await prisma.movimientoAlmacen.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MovimientoAlmacenCreateManyArgs>(args?: SelectSubset<T, MovimientoAlmacenCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MovimientoAlmacens and returns the data saved in the database.
     * @param {MovimientoAlmacenCreateManyAndReturnArgs} args - Arguments to create many MovimientoAlmacens.
     * @example
     * // Create many MovimientoAlmacens
     * const movimientoAlmacen = await prisma.movimientoAlmacen.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MovimientoAlmacens and only return the `id`
     * const movimientoAlmacenWithIdOnly = await prisma.movimientoAlmacen.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MovimientoAlmacenCreateManyAndReturnArgs>(args?: SelectSubset<T, MovimientoAlmacenCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MovimientoAlmacenPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a MovimientoAlmacen.
     * @param {MovimientoAlmacenDeleteArgs} args - Arguments to delete one MovimientoAlmacen.
     * @example
     * // Delete one MovimientoAlmacen
     * const MovimientoAlmacen = await prisma.movimientoAlmacen.delete({
     *   where: {
     *     // ... filter to delete one MovimientoAlmacen
     *   }
     * })
     * 
     */
    delete<T extends MovimientoAlmacenDeleteArgs>(args: SelectSubset<T, MovimientoAlmacenDeleteArgs<ExtArgs>>): Prisma__MovimientoAlmacenClient<$Result.GetResult<Prisma.$MovimientoAlmacenPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one MovimientoAlmacen.
     * @param {MovimientoAlmacenUpdateArgs} args - Arguments to update one MovimientoAlmacen.
     * @example
     * // Update one MovimientoAlmacen
     * const movimientoAlmacen = await prisma.movimientoAlmacen.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MovimientoAlmacenUpdateArgs>(args: SelectSubset<T, MovimientoAlmacenUpdateArgs<ExtArgs>>): Prisma__MovimientoAlmacenClient<$Result.GetResult<Prisma.$MovimientoAlmacenPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more MovimientoAlmacens.
     * @param {MovimientoAlmacenDeleteManyArgs} args - Arguments to filter MovimientoAlmacens to delete.
     * @example
     * // Delete a few MovimientoAlmacens
     * const { count } = await prisma.movimientoAlmacen.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MovimientoAlmacenDeleteManyArgs>(args?: SelectSubset<T, MovimientoAlmacenDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MovimientoAlmacens.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MovimientoAlmacenUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MovimientoAlmacens
     * const movimientoAlmacen = await prisma.movimientoAlmacen.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MovimientoAlmacenUpdateManyArgs>(args: SelectSubset<T, MovimientoAlmacenUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one MovimientoAlmacen.
     * @param {MovimientoAlmacenUpsertArgs} args - Arguments to update or create a MovimientoAlmacen.
     * @example
     * // Update or create a MovimientoAlmacen
     * const movimientoAlmacen = await prisma.movimientoAlmacen.upsert({
     *   create: {
     *     // ... data to create a MovimientoAlmacen
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MovimientoAlmacen we want to update
     *   }
     * })
     */
    upsert<T extends MovimientoAlmacenUpsertArgs>(args: SelectSubset<T, MovimientoAlmacenUpsertArgs<ExtArgs>>): Prisma__MovimientoAlmacenClient<$Result.GetResult<Prisma.$MovimientoAlmacenPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of MovimientoAlmacens.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MovimientoAlmacenCountArgs} args - Arguments to filter MovimientoAlmacens to count.
     * @example
     * // Count the number of MovimientoAlmacens
     * const count = await prisma.movimientoAlmacen.count({
     *   where: {
     *     // ... the filter for the MovimientoAlmacens we want to count
     *   }
     * })
    **/
    count<T extends MovimientoAlmacenCountArgs>(
      args?: Subset<T, MovimientoAlmacenCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MovimientoAlmacenCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MovimientoAlmacen.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MovimientoAlmacenAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends MovimientoAlmacenAggregateArgs>(args: Subset<T, MovimientoAlmacenAggregateArgs>): Prisma.PrismaPromise<GetMovimientoAlmacenAggregateType<T>>

    /**
     * Group by MovimientoAlmacen.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MovimientoAlmacenGroupByArgs} args - Group by arguments.
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
      T extends MovimientoAlmacenGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MovimientoAlmacenGroupByArgs['orderBy'] }
        : { orderBy?: MovimientoAlmacenGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, MovimientoAlmacenGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMovimientoAlmacenGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MovimientoAlmacen model
   */
  readonly fields: MovimientoAlmacenFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MovimientoAlmacen.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MovimientoAlmacenClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    item<T extends ItemInventarioDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ItemInventarioDefaultArgs<ExtArgs>>): Prisma__ItemInventarioClient<$Result.GetResult<Prisma.$ItemInventarioPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
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
   * Fields of the MovimientoAlmacen model
   */ 
  interface MovimientoAlmacenFieldRefs {
    readonly id: FieldRef<"MovimientoAlmacen", 'String'>
    readonly tenant_id: FieldRef<"MovimientoAlmacen", 'String'>
    readonly proyecto_id: FieldRef<"MovimientoAlmacen", 'String'>
    readonly item_id: FieldRef<"MovimientoAlmacen", 'String'>
    readonly tipo: FieldRef<"MovimientoAlmacen", 'String'>
    readonly cantidad: FieldRef<"MovimientoAlmacen", 'Decimal'>
    readonly unidad: FieldRef<"MovimientoAlmacen", 'String'>
    readonly origen: FieldRef<"MovimientoAlmacen", 'String'>
    readonly destino: FieldRef<"MovimientoAlmacen", 'String'>
    readonly responsable: FieldRef<"MovimientoAlmacen", 'String'>
    readonly referencia: FieldRef<"MovimientoAlmacen", 'String'>
    readonly fecha: FieldRef<"MovimientoAlmacen", 'DateTime'>
    readonly concepto_id: FieldRef<"MovimientoAlmacen", 'String'>
    readonly concepto_clave: FieldRef<"MovimientoAlmacen", 'String'>
    readonly frente_trabajo: FieldRef<"MovimientoAlmacen", 'String'>
    readonly oc_item_id: FieldRef<"MovimientoAlmacen", 'String'>
  }
    

  // Custom InputTypes
  /**
   * MovimientoAlmacen findUnique
   */
  export type MovimientoAlmacenFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MovimientoAlmacen
     */
    select?: MovimientoAlmacenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MovimientoAlmacenInclude<ExtArgs> | null
    /**
     * Filter, which MovimientoAlmacen to fetch.
     */
    where: MovimientoAlmacenWhereUniqueInput
  }

  /**
   * MovimientoAlmacen findUniqueOrThrow
   */
  export type MovimientoAlmacenFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MovimientoAlmacen
     */
    select?: MovimientoAlmacenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MovimientoAlmacenInclude<ExtArgs> | null
    /**
     * Filter, which MovimientoAlmacen to fetch.
     */
    where: MovimientoAlmacenWhereUniqueInput
  }

  /**
   * MovimientoAlmacen findFirst
   */
  export type MovimientoAlmacenFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MovimientoAlmacen
     */
    select?: MovimientoAlmacenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MovimientoAlmacenInclude<ExtArgs> | null
    /**
     * Filter, which MovimientoAlmacen to fetch.
     */
    where?: MovimientoAlmacenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MovimientoAlmacens to fetch.
     */
    orderBy?: MovimientoAlmacenOrderByWithRelationInput | MovimientoAlmacenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MovimientoAlmacens.
     */
    cursor?: MovimientoAlmacenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MovimientoAlmacens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MovimientoAlmacens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MovimientoAlmacens.
     */
    distinct?: MovimientoAlmacenScalarFieldEnum | MovimientoAlmacenScalarFieldEnum[]
  }

  /**
   * MovimientoAlmacen findFirstOrThrow
   */
  export type MovimientoAlmacenFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MovimientoAlmacen
     */
    select?: MovimientoAlmacenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MovimientoAlmacenInclude<ExtArgs> | null
    /**
     * Filter, which MovimientoAlmacen to fetch.
     */
    where?: MovimientoAlmacenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MovimientoAlmacens to fetch.
     */
    orderBy?: MovimientoAlmacenOrderByWithRelationInput | MovimientoAlmacenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MovimientoAlmacens.
     */
    cursor?: MovimientoAlmacenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MovimientoAlmacens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MovimientoAlmacens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MovimientoAlmacens.
     */
    distinct?: MovimientoAlmacenScalarFieldEnum | MovimientoAlmacenScalarFieldEnum[]
  }

  /**
   * MovimientoAlmacen findMany
   */
  export type MovimientoAlmacenFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MovimientoAlmacen
     */
    select?: MovimientoAlmacenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MovimientoAlmacenInclude<ExtArgs> | null
    /**
     * Filter, which MovimientoAlmacens to fetch.
     */
    where?: MovimientoAlmacenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MovimientoAlmacens to fetch.
     */
    orderBy?: MovimientoAlmacenOrderByWithRelationInput | MovimientoAlmacenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MovimientoAlmacens.
     */
    cursor?: MovimientoAlmacenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MovimientoAlmacens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MovimientoAlmacens.
     */
    skip?: number
    distinct?: MovimientoAlmacenScalarFieldEnum | MovimientoAlmacenScalarFieldEnum[]
  }

  /**
   * MovimientoAlmacen create
   */
  export type MovimientoAlmacenCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MovimientoAlmacen
     */
    select?: MovimientoAlmacenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MovimientoAlmacenInclude<ExtArgs> | null
    /**
     * The data needed to create a MovimientoAlmacen.
     */
    data: XOR<MovimientoAlmacenCreateInput, MovimientoAlmacenUncheckedCreateInput>
  }

  /**
   * MovimientoAlmacen createMany
   */
  export type MovimientoAlmacenCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MovimientoAlmacens.
     */
    data: MovimientoAlmacenCreateManyInput | MovimientoAlmacenCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MovimientoAlmacen createManyAndReturn
   */
  export type MovimientoAlmacenCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MovimientoAlmacen
     */
    select?: MovimientoAlmacenSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many MovimientoAlmacens.
     */
    data: MovimientoAlmacenCreateManyInput | MovimientoAlmacenCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MovimientoAlmacenIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * MovimientoAlmacen update
   */
  export type MovimientoAlmacenUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MovimientoAlmacen
     */
    select?: MovimientoAlmacenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MovimientoAlmacenInclude<ExtArgs> | null
    /**
     * The data needed to update a MovimientoAlmacen.
     */
    data: XOR<MovimientoAlmacenUpdateInput, MovimientoAlmacenUncheckedUpdateInput>
    /**
     * Choose, which MovimientoAlmacen to update.
     */
    where: MovimientoAlmacenWhereUniqueInput
  }

  /**
   * MovimientoAlmacen updateMany
   */
  export type MovimientoAlmacenUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MovimientoAlmacens.
     */
    data: XOR<MovimientoAlmacenUpdateManyMutationInput, MovimientoAlmacenUncheckedUpdateManyInput>
    /**
     * Filter which MovimientoAlmacens to update
     */
    where?: MovimientoAlmacenWhereInput
  }

  /**
   * MovimientoAlmacen upsert
   */
  export type MovimientoAlmacenUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MovimientoAlmacen
     */
    select?: MovimientoAlmacenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MovimientoAlmacenInclude<ExtArgs> | null
    /**
     * The filter to search for the MovimientoAlmacen to update in case it exists.
     */
    where: MovimientoAlmacenWhereUniqueInput
    /**
     * In case the MovimientoAlmacen found by the `where` argument doesn't exist, create a new MovimientoAlmacen with this data.
     */
    create: XOR<MovimientoAlmacenCreateInput, MovimientoAlmacenUncheckedCreateInput>
    /**
     * In case the MovimientoAlmacen was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MovimientoAlmacenUpdateInput, MovimientoAlmacenUncheckedUpdateInput>
  }

  /**
   * MovimientoAlmacen delete
   */
  export type MovimientoAlmacenDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MovimientoAlmacen
     */
    select?: MovimientoAlmacenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MovimientoAlmacenInclude<ExtArgs> | null
    /**
     * Filter which MovimientoAlmacen to delete.
     */
    where: MovimientoAlmacenWhereUniqueInput
  }

  /**
   * MovimientoAlmacen deleteMany
   */
  export type MovimientoAlmacenDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MovimientoAlmacens to delete
     */
    where?: MovimientoAlmacenWhereInput
  }

  /**
   * MovimientoAlmacen without action
   */
  export type MovimientoAlmacenDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MovimientoAlmacen
     */
    select?: MovimientoAlmacenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MovimientoAlmacenInclude<ExtArgs> | null
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


  export const ItemInventarioScalarFieldEnum: {
    id: 'id',
    tenant_id: 'tenant_id',
    proyecto_id: 'proyecto_id',
    insumo_id: 'insumo_id',
    clave: 'clave',
    descripcion: 'descripcion',
    unidad: 'unidad',
    categoria: 'categoria',
    stock_actual: 'stock_actual',
    stock_minimo: 'stock_minimo',
    ubicacion: 'ubicacion',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type ItemInventarioScalarFieldEnum = (typeof ItemInventarioScalarFieldEnum)[keyof typeof ItemInventarioScalarFieldEnum]


  export const MovimientoAlmacenScalarFieldEnum: {
    id: 'id',
    tenant_id: 'tenant_id',
    proyecto_id: 'proyecto_id',
    item_id: 'item_id',
    tipo: 'tipo',
    cantidad: 'cantidad',
    unidad: 'unidad',
    origen: 'origen',
    destino: 'destino',
    responsable: 'responsable',
    referencia: 'referencia',
    fecha: 'fecha',
    concepto_id: 'concepto_id',
    concepto_clave: 'concepto_clave',
    frente_trabajo: 'frente_trabajo',
    oc_item_id: 'oc_item_id'
  };

  export type MovimientoAlmacenScalarFieldEnum = (typeof MovimientoAlmacenScalarFieldEnum)[keyof typeof MovimientoAlmacenScalarFieldEnum]


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


  export type ItemInventarioWhereInput = {
    AND?: ItemInventarioWhereInput | ItemInventarioWhereInput[]
    OR?: ItemInventarioWhereInput[]
    NOT?: ItemInventarioWhereInput | ItemInventarioWhereInput[]
    id?: UuidFilter<"ItemInventario"> | string
    tenant_id?: UuidFilter<"ItemInventario"> | string
    proyecto_id?: UuidFilter<"ItemInventario"> | string
    insumo_id?: UuidNullableFilter<"ItemInventario"> | string | null
    clave?: StringFilter<"ItemInventario"> | string
    descripcion?: StringFilter<"ItemInventario"> | string
    unidad?: StringFilter<"ItemInventario"> | string
    categoria?: StringFilter<"ItemInventario"> | string
    stock_actual?: DecimalFilter<"ItemInventario"> | Decimal | DecimalJsLike | number | string
    stock_minimo?: DecimalFilter<"ItemInventario"> | Decimal | DecimalJsLike | number | string
    ubicacion?: StringNullableFilter<"ItemInventario"> | string | null
    created_at?: DateTimeFilter<"ItemInventario"> | Date | string
    updated_at?: DateTimeFilter<"ItemInventario"> | Date | string
    movimientos?: MovimientoAlmacenListRelationFilter
  }

  export type ItemInventarioOrderByWithRelationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    insumo_id?: SortOrderInput | SortOrder
    clave?: SortOrder
    descripcion?: SortOrder
    unidad?: SortOrder
    categoria?: SortOrder
    stock_actual?: SortOrder
    stock_minimo?: SortOrder
    ubicacion?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    movimientos?: MovimientoAlmacenOrderByRelationAggregateInput
  }

  export type ItemInventarioWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ItemInventarioWhereInput | ItemInventarioWhereInput[]
    OR?: ItemInventarioWhereInput[]
    NOT?: ItemInventarioWhereInput | ItemInventarioWhereInput[]
    tenant_id?: UuidFilter<"ItemInventario"> | string
    proyecto_id?: UuidFilter<"ItemInventario"> | string
    insumo_id?: UuidNullableFilter<"ItemInventario"> | string | null
    clave?: StringFilter<"ItemInventario"> | string
    descripcion?: StringFilter<"ItemInventario"> | string
    unidad?: StringFilter<"ItemInventario"> | string
    categoria?: StringFilter<"ItemInventario"> | string
    stock_actual?: DecimalFilter<"ItemInventario"> | Decimal | DecimalJsLike | number | string
    stock_minimo?: DecimalFilter<"ItemInventario"> | Decimal | DecimalJsLike | number | string
    ubicacion?: StringNullableFilter<"ItemInventario"> | string | null
    created_at?: DateTimeFilter<"ItemInventario"> | Date | string
    updated_at?: DateTimeFilter<"ItemInventario"> | Date | string
    movimientos?: MovimientoAlmacenListRelationFilter
  }, "id">

  export type ItemInventarioOrderByWithAggregationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    insumo_id?: SortOrderInput | SortOrder
    clave?: SortOrder
    descripcion?: SortOrder
    unidad?: SortOrder
    categoria?: SortOrder
    stock_actual?: SortOrder
    stock_minimo?: SortOrder
    ubicacion?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: ItemInventarioCountOrderByAggregateInput
    _avg?: ItemInventarioAvgOrderByAggregateInput
    _max?: ItemInventarioMaxOrderByAggregateInput
    _min?: ItemInventarioMinOrderByAggregateInput
    _sum?: ItemInventarioSumOrderByAggregateInput
  }

  export type ItemInventarioScalarWhereWithAggregatesInput = {
    AND?: ItemInventarioScalarWhereWithAggregatesInput | ItemInventarioScalarWhereWithAggregatesInput[]
    OR?: ItemInventarioScalarWhereWithAggregatesInput[]
    NOT?: ItemInventarioScalarWhereWithAggregatesInput | ItemInventarioScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"ItemInventario"> | string
    tenant_id?: UuidWithAggregatesFilter<"ItemInventario"> | string
    proyecto_id?: UuidWithAggregatesFilter<"ItemInventario"> | string
    insumo_id?: UuidNullableWithAggregatesFilter<"ItemInventario"> | string | null
    clave?: StringWithAggregatesFilter<"ItemInventario"> | string
    descripcion?: StringWithAggregatesFilter<"ItemInventario"> | string
    unidad?: StringWithAggregatesFilter<"ItemInventario"> | string
    categoria?: StringWithAggregatesFilter<"ItemInventario"> | string
    stock_actual?: DecimalWithAggregatesFilter<"ItemInventario"> | Decimal | DecimalJsLike | number | string
    stock_minimo?: DecimalWithAggregatesFilter<"ItemInventario"> | Decimal | DecimalJsLike | number | string
    ubicacion?: StringNullableWithAggregatesFilter<"ItemInventario"> | string | null
    created_at?: DateTimeWithAggregatesFilter<"ItemInventario"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"ItemInventario"> | Date | string
  }

  export type MovimientoAlmacenWhereInput = {
    AND?: MovimientoAlmacenWhereInput | MovimientoAlmacenWhereInput[]
    OR?: MovimientoAlmacenWhereInput[]
    NOT?: MovimientoAlmacenWhereInput | MovimientoAlmacenWhereInput[]
    id?: UuidFilter<"MovimientoAlmacen"> | string
    tenant_id?: UuidFilter<"MovimientoAlmacen"> | string
    proyecto_id?: UuidFilter<"MovimientoAlmacen"> | string
    item_id?: UuidFilter<"MovimientoAlmacen"> | string
    tipo?: StringFilter<"MovimientoAlmacen"> | string
    cantidad?: DecimalFilter<"MovimientoAlmacen"> | Decimal | DecimalJsLike | number | string
    unidad?: StringFilter<"MovimientoAlmacen"> | string
    origen?: StringNullableFilter<"MovimientoAlmacen"> | string | null
    destino?: StringNullableFilter<"MovimientoAlmacen"> | string | null
    responsable?: StringNullableFilter<"MovimientoAlmacen"> | string | null
    referencia?: StringNullableFilter<"MovimientoAlmacen"> | string | null
    fecha?: DateTimeFilter<"MovimientoAlmacen"> | Date | string
    concepto_id?: UuidNullableFilter<"MovimientoAlmacen"> | string | null
    concepto_clave?: StringNullableFilter<"MovimientoAlmacen"> | string | null
    frente_trabajo?: StringNullableFilter<"MovimientoAlmacen"> | string | null
    oc_item_id?: UuidNullableFilter<"MovimientoAlmacen"> | string | null
    item?: XOR<ItemInventarioRelationFilter, ItemInventarioWhereInput>
  }

  export type MovimientoAlmacenOrderByWithRelationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    item_id?: SortOrder
    tipo?: SortOrder
    cantidad?: SortOrder
    unidad?: SortOrder
    origen?: SortOrderInput | SortOrder
    destino?: SortOrderInput | SortOrder
    responsable?: SortOrderInput | SortOrder
    referencia?: SortOrderInput | SortOrder
    fecha?: SortOrder
    concepto_id?: SortOrderInput | SortOrder
    concepto_clave?: SortOrderInput | SortOrder
    frente_trabajo?: SortOrderInput | SortOrder
    oc_item_id?: SortOrderInput | SortOrder
    item?: ItemInventarioOrderByWithRelationInput
  }

  export type MovimientoAlmacenWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: MovimientoAlmacenWhereInput | MovimientoAlmacenWhereInput[]
    OR?: MovimientoAlmacenWhereInput[]
    NOT?: MovimientoAlmacenWhereInput | MovimientoAlmacenWhereInput[]
    tenant_id?: UuidFilter<"MovimientoAlmacen"> | string
    proyecto_id?: UuidFilter<"MovimientoAlmacen"> | string
    item_id?: UuidFilter<"MovimientoAlmacen"> | string
    tipo?: StringFilter<"MovimientoAlmacen"> | string
    cantidad?: DecimalFilter<"MovimientoAlmacen"> | Decimal | DecimalJsLike | number | string
    unidad?: StringFilter<"MovimientoAlmacen"> | string
    origen?: StringNullableFilter<"MovimientoAlmacen"> | string | null
    destino?: StringNullableFilter<"MovimientoAlmacen"> | string | null
    responsable?: StringNullableFilter<"MovimientoAlmacen"> | string | null
    referencia?: StringNullableFilter<"MovimientoAlmacen"> | string | null
    fecha?: DateTimeFilter<"MovimientoAlmacen"> | Date | string
    concepto_id?: UuidNullableFilter<"MovimientoAlmacen"> | string | null
    concepto_clave?: StringNullableFilter<"MovimientoAlmacen"> | string | null
    frente_trabajo?: StringNullableFilter<"MovimientoAlmacen"> | string | null
    oc_item_id?: UuidNullableFilter<"MovimientoAlmacen"> | string | null
    item?: XOR<ItemInventarioRelationFilter, ItemInventarioWhereInput>
  }, "id">

  export type MovimientoAlmacenOrderByWithAggregationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    item_id?: SortOrder
    tipo?: SortOrder
    cantidad?: SortOrder
    unidad?: SortOrder
    origen?: SortOrderInput | SortOrder
    destino?: SortOrderInput | SortOrder
    responsable?: SortOrderInput | SortOrder
    referencia?: SortOrderInput | SortOrder
    fecha?: SortOrder
    concepto_id?: SortOrderInput | SortOrder
    concepto_clave?: SortOrderInput | SortOrder
    frente_trabajo?: SortOrderInput | SortOrder
    oc_item_id?: SortOrderInput | SortOrder
    _count?: MovimientoAlmacenCountOrderByAggregateInput
    _avg?: MovimientoAlmacenAvgOrderByAggregateInput
    _max?: MovimientoAlmacenMaxOrderByAggregateInput
    _min?: MovimientoAlmacenMinOrderByAggregateInput
    _sum?: MovimientoAlmacenSumOrderByAggregateInput
  }

  export type MovimientoAlmacenScalarWhereWithAggregatesInput = {
    AND?: MovimientoAlmacenScalarWhereWithAggregatesInput | MovimientoAlmacenScalarWhereWithAggregatesInput[]
    OR?: MovimientoAlmacenScalarWhereWithAggregatesInput[]
    NOT?: MovimientoAlmacenScalarWhereWithAggregatesInput | MovimientoAlmacenScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"MovimientoAlmacen"> | string
    tenant_id?: UuidWithAggregatesFilter<"MovimientoAlmacen"> | string
    proyecto_id?: UuidWithAggregatesFilter<"MovimientoAlmacen"> | string
    item_id?: UuidWithAggregatesFilter<"MovimientoAlmacen"> | string
    tipo?: StringWithAggregatesFilter<"MovimientoAlmacen"> | string
    cantidad?: DecimalWithAggregatesFilter<"MovimientoAlmacen"> | Decimal | DecimalJsLike | number | string
    unidad?: StringWithAggregatesFilter<"MovimientoAlmacen"> | string
    origen?: StringNullableWithAggregatesFilter<"MovimientoAlmacen"> | string | null
    destino?: StringNullableWithAggregatesFilter<"MovimientoAlmacen"> | string | null
    responsable?: StringNullableWithAggregatesFilter<"MovimientoAlmacen"> | string | null
    referencia?: StringNullableWithAggregatesFilter<"MovimientoAlmacen"> | string | null
    fecha?: DateTimeWithAggregatesFilter<"MovimientoAlmacen"> | Date | string
    concepto_id?: UuidNullableWithAggregatesFilter<"MovimientoAlmacen"> | string | null
    concepto_clave?: StringNullableWithAggregatesFilter<"MovimientoAlmacen"> | string | null
    frente_trabajo?: StringNullableWithAggregatesFilter<"MovimientoAlmacen"> | string | null
    oc_item_id?: UuidNullableWithAggregatesFilter<"MovimientoAlmacen"> | string | null
  }

  export type ItemInventarioCreateInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    insumo_id?: string | null
    clave: string
    descripcion: string
    unidad: string
    categoria: string
    stock_actual?: Decimal | DecimalJsLike | number | string
    stock_minimo?: Decimal | DecimalJsLike | number | string
    ubicacion?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    movimientos?: MovimientoAlmacenCreateNestedManyWithoutItemInput
  }

  export type ItemInventarioUncheckedCreateInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    insumo_id?: string | null
    clave: string
    descripcion: string
    unidad: string
    categoria: string
    stock_actual?: Decimal | DecimalJsLike | number | string
    stock_minimo?: Decimal | DecimalJsLike | number | string
    ubicacion?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    movimientos?: MovimientoAlmacenUncheckedCreateNestedManyWithoutItemInput
  }

  export type ItemInventarioUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    insumo_id?: NullableStringFieldUpdateOperationsInput | string | null
    clave?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    unidad?: StringFieldUpdateOperationsInput | string
    categoria?: StringFieldUpdateOperationsInput | string
    stock_actual?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    stock_minimo?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    ubicacion?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    movimientos?: MovimientoAlmacenUpdateManyWithoutItemNestedInput
  }

  export type ItemInventarioUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    insumo_id?: NullableStringFieldUpdateOperationsInput | string | null
    clave?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    unidad?: StringFieldUpdateOperationsInput | string
    categoria?: StringFieldUpdateOperationsInput | string
    stock_actual?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    stock_minimo?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    ubicacion?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    movimientos?: MovimientoAlmacenUncheckedUpdateManyWithoutItemNestedInput
  }

  export type ItemInventarioCreateManyInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    insumo_id?: string | null
    clave: string
    descripcion: string
    unidad: string
    categoria: string
    stock_actual?: Decimal | DecimalJsLike | number | string
    stock_minimo?: Decimal | DecimalJsLike | number | string
    ubicacion?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ItemInventarioUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    insumo_id?: NullableStringFieldUpdateOperationsInput | string | null
    clave?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    unidad?: StringFieldUpdateOperationsInput | string
    categoria?: StringFieldUpdateOperationsInput | string
    stock_actual?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    stock_minimo?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    ubicacion?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ItemInventarioUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    insumo_id?: NullableStringFieldUpdateOperationsInput | string | null
    clave?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    unidad?: StringFieldUpdateOperationsInput | string
    categoria?: StringFieldUpdateOperationsInput | string
    stock_actual?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    stock_minimo?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    ubicacion?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MovimientoAlmacenCreateInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    tipo: string
    cantidad: Decimal | DecimalJsLike | number | string
    unidad: string
    origen?: string | null
    destino?: string | null
    responsable?: string | null
    referencia?: string | null
    fecha?: Date | string
    concepto_id?: string | null
    concepto_clave?: string | null
    frente_trabajo?: string | null
    oc_item_id?: string | null
    item: ItemInventarioCreateNestedOneWithoutMovimientosInput
  }

  export type MovimientoAlmacenUncheckedCreateInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    item_id: string
    tipo: string
    cantidad: Decimal | DecimalJsLike | number | string
    unidad: string
    origen?: string | null
    destino?: string | null
    responsable?: string | null
    referencia?: string | null
    fecha?: Date | string
    concepto_id?: string | null
    concepto_clave?: string | null
    frente_trabajo?: string | null
    oc_item_id?: string | null
  }

  export type MovimientoAlmacenUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    cantidad?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unidad?: StringFieldUpdateOperationsInput | string
    origen?: NullableStringFieldUpdateOperationsInput | string | null
    destino?: NullableStringFieldUpdateOperationsInput | string | null
    responsable?: NullableStringFieldUpdateOperationsInput | string | null
    referencia?: NullableStringFieldUpdateOperationsInput | string | null
    fecha?: DateTimeFieldUpdateOperationsInput | Date | string
    concepto_id?: NullableStringFieldUpdateOperationsInput | string | null
    concepto_clave?: NullableStringFieldUpdateOperationsInput | string | null
    frente_trabajo?: NullableStringFieldUpdateOperationsInput | string | null
    oc_item_id?: NullableStringFieldUpdateOperationsInput | string | null
    item?: ItemInventarioUpdateOneRequiredWithoutMovimientosNestedInput
  }

  export type MovimientoAlmacenUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    item_id?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    cantidad?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unidad?: StringFieldUpdateOperationsInput | string
    origen?: NullableStringFieldUpdateOperationsInput | string | null
    destino?: NullableStringFieldUpdateOperationsInput | string | null
    responsable?: NullableStringFieldUpdateOperationsInput | string | null
    referencia?: NullableStringFieldUpdateOperationsInput | string | null
    fecha?: DateTimeFieldUpdateOperationsInput | Date | string
    concepto_id?: NullableStringFieldUpdateOperationsInput | string | null
    concepto_clave?: NullableStringFieldUpdateOperationsInput | string | null
    frente_trabajo?: NullableStringFieldUpdateOperationsInput | string | null
    oc_item_id?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type MovimientoAlmacenCreateManyInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    item_id: string
    tipo: string
    cantidad: Decimal | DecimalJsLike | number | string
    unidad: string
    origen?: string | null
    destino?: string | null
    responsable?: string | null
    referencia?: string | null
    fecha?: Date | string
    concepto_id?: string | null
    concepto_clave?: string | null
    frente_trabajo?: string | null
    oc_item_id?: string | null
  }

  export type MovimientoAlmacenUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    cantidad?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unidad?: StringFieldUpdateOperationsInput | string
    origen?: NullableStringFieldUpdateOperationsInput | string | null
    destino?: NullableStringFieldUpdateOperationsInput | string | null
    responsable?: NullableStringFieldUpdateOperationsInput | string | null
    referencia?: NullableStringFieldUpdateOperationsInput | string | null
    fecha?: DateTimeFieldUpdateOperationsInput | Date | string
    concepto_id?: NullableStringFieldUpdateOperationsInput | string | null
    concepto_clave?: NullableStringFieldUpdateOperationsInput | string | null
    frente_trabajo?: NullableStringFieldUpdateOperationsInput | string | null
    oc_item_id?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type MovimientoAlmacenUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    item_id?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    cantidad?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unidad?: StringFieldUpdateOperationsInput | string
    origen?: NullableStringFieldUpdateOperationsInput | string | null
    destino?: NullableStringFieldUpdateOperationsInput | string | null
    responsable?: NullableStringFieldUpdateOperationsInput | string | null
    referencia?: NullableStringFieldUpdateOperationsInput | string | null
    fecha?: DateTimeFieldUpdateOperationsInput | Date | string
    concepto_id?: NullableStringFieldUpdateOperationsInput | string | null
    concepto_clave?: NullableStringFieldUpdateOperationsInput | string | null
    frente_trabajo?: NullableStringFieldUpdateOperationsInput | string | null
    oc_item_id?: NullableStringFieldUpdateOperationsInput | string | null
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

  export type MovimientoAlmacenListRelationFilter = {
    every?: MovimientoAlmacenWhereInput
    some?: MovimientoAlmacenWhereInput
    none?: MovimientoAlmacenWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type MovimientoAlmacenOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ItemInventarioCountOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    insumo_id?: SortOrder
    clave?: SortOrder
    descripcion?: SortOrder
    unidad?: SortOrder
    categoria?: SortOrder
    stock_actual?: SortOrder
    stock_minimo?: SortOrder
    ubicacion?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ItemInventarioAvgOrderByAggregateInput = {
    stock_actual?: SortOrder
    stock_minimo?: SortOrder
  }

  export type ItemInventarioMaxOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    insumo_id?: SortOrder
    clave?: SortOrder
    descripcion?: SortOrder
    unidad?: SortOrder
    categoria?: SortOrder
    stock_actual?: SortOrder
    stock_minimo?: SortOrder
    ubicacion?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ItemInventarioMinOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    insumo_id?: SortOrder
    clave?: SortOrder
    descripcion?: SortOrder
    unidad?: SortOrder
    categoria?: SortOrder
    stock_actual?: SortOrder
    stock_minimo?: SortOrder
    ubicacion?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ItemInventarioSumOrderByAggregateInput = {
    stock_actual?: SortOrder
    stock_minimo?: SortOrder
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

  export type ItemInventarioRelationFilter = {
    is?: ItemInventarioWhereInput
    isNot?: ItemInventarioWhereInput
  }

  export type MovimientoAlmacenCountOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    item_id?: SortOrder
    tipo?: SortOrder
    cantidad?: SortOrder
    unidad?: SortOrder
    origen?: SortOrder
    destino?: SortOrder
    responsable?: SortOrder
    referencia?: SortOrder
    fecha?: SortOrder
    concepto_id?: SortOrder
    concepto_clave?: SortOrder
    frente_trabajo?: SortOrder
    oc_item_id?: SortOrder
  }

  export type MovimientoAlmacenAvgOrderByAggregateInput = {
    cantidad?: SortOrder
  }

  export type MovimientoAlmacenMaxOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    item_id?: SortOrder
    tipo?: SortOrder
    cantidad?: SortOrder
    unidad?: SortOrder
    origen?: SortOrder
    destino?: SortOrder
    responsable?: SortOrder
    referencia?: SortOrder
    fecha?: SortOrder
    concepto_id?: SortOrder
    concepto_clave?: SortOrder
    frente_trabajo?: SortOrder
    oc_item_id?: SortOrder
  }

  export type MovimientoAlmacenMinOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    item_id?: SortOrder
    tipo?: SortOrder
    cantidad?: SortOrder
    unidad?: SortOrder
    origen?: SortOrder
    destino?: SortOrder
    responsable?: SortOrder
    referencia?: SortOrder
    fecha?: SortOrder
    concepto_id?: SortOrder
    concepto_clave?: SortOrder
    frente_trabajo?: SortOrder
    oc_item_id?: SortOrder
  }

  export type MovimientoAlmacenSumOrderByAggregateInput = {
    cantidad?: SortOrder
  }

  export type MovimientoAlmacenCreateNestedManyWithoutItemInput = {
    create?: XOR<MovimientoAlmacenCreateWithoutItemInput, MovimientoAlmacenUncheckedCreateWithoutItemInput> | MovimientoAlmacenCreateWithoutItemInput[] | MovimientoAlmacenUncheckedCreateWithoutItemInput[]
    connectOrCreate?: MovimientoAlmacenCreateOrConnectWithoutItemInput | MovimientoAlmacenCreateOrConnectWithoutItemInput[]
    createMany?: MovimientoAlmacenCreateManyItemInputEnvelope
    connect?: MovimientoAlmacenWhereUniqueInput | MovimientoAlmacenWhereUniqueInput[]
  }

  export type MovimientoAlmacenUncheckedCreateNestedManyWithoutItemInput = {
    create?: XOR<MovimientoAlmacenCreateWithoutItemInput, MovimientoAlmacenUncheckedCreateWithoutItemInput> | MovimientoAlmacenCreateWithoutItemInput[] | MovimientoAlmacenUncheckedCreateWithoutItemInput[]
    connectOrCreate?: MovimientoAlmacenCreateOrConnectWithoutItemInput | MovimientoAlmacenCreateOrConnectWithoutItemInput[]
    createMany?: MovimientoAlmacenCreateManyItemInputEnvelope
    connect?: MovimientoAlmacenWhereUniqueInput | MovimientoAlmacenWhereUniqueInput[]
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

  export type MovimientoAlmacenUpdateManyWithoutItemNestedInput = {
    create?: XOR<MovimientoAlmacenCreateWithoutItemInput, MovimientoAlmacenUncheckedCreateWithoutItemInput> | MovimientoAlmacenCreateWithoutItemInput[] | MovimientoAlmacenUncheckedCreateWithoutItemInput[]
    connectOrCreate?: MovimientoAlmacenCreateOrConnectWithoutItemInput | MovimientoAlmacenCreateOrConnectWithoutItemInput[]
    upsert?: MovimientoAlmacenUpsertWithWhereUniqueWithoutItemInput | MovimientoAlmacenUpsertWithWhereUniqueWithoutItemInput[]
    createMany?: MovimientoAlmacenCreateManyItemInputEnvelope
    set?: MovimientoAlmacenWhereUniqueInput | MovimientoAlmacenWhereUniqueInput[]
    disconnect?: MovimientoAlmacenWhereUniqueInput | MovimientoAlmacenWhereUniqueInput[]
    delete?: MovimientoAlmacenWhereUniqueInput | MovimientoAlmacenWhereUniqueInput[]
    connect?: MovimientoAlmacenWhereUniqueInput | MovimientoAlmacenWhereUniqueInput[]
    update?: MovimientoAlmacenUpdateWithWhereUniqueWithoutItemInput | MovimientoAlmacenUpdateWithWhereUniqueWithoutItemInput[]
    updateMany?: MovimientoAlmacenUpdateManyWithWhereWithoutItemInput | MovimientoAlmacenUpdateManyWithWhereWithoutItemInput[]
    deleteMany?: MovimientoAlmacenScalarWhereInput | MovimientoAlmacenScalarWhereInput[]
  }

  export type MovimientoAlmacenUncheckedUpdateManyWithoutItemNestedInput = {
    create?: XOR<MovimientoAlmacenCreateWithoutItemInput, MovimientoAlmacenUncheckedCreateWithoutItemInput> | MovimientoAlmacenCreateWithoutItemInput[] | MovimientoAlmacenUncheckedCreateWithoutItemInput[]
    connectOrCreate?: MovimientoAlmacenCreateOrConnectWithoutItemInput | MovimientoAlmacenCreateOrConnectWithoutItemInput[]
    upsert?: MovimientoAlmacenUpsertWithWhereUniqueWithoutItemInput | MovimientoAlmacenUpsertWithWhereUniqueWithoutItemInput[]
    createMany?: MovimientoAlmacenCreateManyItemInputEnvelope
    set?: MovimientoAlmacenWhereUniqueInput | MovimientoAlmacenWhereUniqueInput[]
    disconnect?: MovimientoAlmacenWhereUniqueInput | MovimientoAlmacenWhereUniqueInput[]
    delete?: MovimientoAlmacenWhereUniqueInput | MovimientoAlmacenWhereUniqueInput[]
    connect?: MovimientoAlmacenWhereUniqueInput | MovimientoAlmacenWhereUniqueInput[]
    update?: MovimientoAlmacenUpdateWithWhereUniqueWithoutItemInput | MovimientoAlmacenUpdateWithWhereUniqueWithoutItemInput[]
    updateMany?: MovimientoAlmacenUpdateManyWithWhereWithoutItemInput | MovimientoAlmacenUpdateManyWithWhereWithoutItemInput[]
    deleteMany?: MovimientoAlmacenScalarWhereInput | MovimientoAlmacenScalarWhereInput[]
  }

  export type ItemInventarioCreateNestedOneWithoutMovimientosInput = {
    create?: XOR<ItemInventarioCreateWithoutMovimientosInput, ItemInventarioUncheckedCreateWithoutMovimientosInput>
    connectOrCreate?: ItemInventarioCreateOrConnectWithoutMovimientosInput
    connect?: ItemInventarioWhereUniqueInput
  }

  export type ItemInventarioUpdateOneRequiredWithoutMovimientosNestedInput = {
    create?: XOR<ItemInventarioCreateWithoutMovimientosInput, ItemInventarioUncheckedCreateWithoutMovimientosInput>
    connectOrCreate?: ItemInventarioCreateOrConnectWithoutMovimientosInput
    upsert?: ItemInventarioUpsertWithoutMovimientosInput
    connect?: ItemInventarioWhereUniqueInput
    update?: XOR<XOR<ItemInventarioUpdateToOneWithWhereWithoutMovimientosInput, ItemInventarioUpdateWithoutMovimientosInput>, ItemInventarioUncheckedUpdateWithoutMovimientosInput>
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

  export type MovimientoAlmacenCreateWithoutItemInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    tipo: string
    cantidad: Decimal | DecimalJsLike | number | string
    unidad: string
    origen?: string | null
    destino?: string | null
    responsable?: string | null
    referencia?: string | null
    fecha?: Date | string
    concepto_id?: string | null
    concepto_clave?: string | null
    frente_trabajo?: string | null
    oc_item_id?: string | null
  }

  export type MovimientoAlmacenUncheckedCreateWithoutItemInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    tipo: string
    cantidad: Decimal | DecimalJsLike | number | string
    unidad: string
    origen?: string | null
    destino?: string | null
    responsable?: string | null
    referencia?: string | null
    fecha?: Date | string
    concepto_id?: string | null
    concepto_clave?: string | null
    frente_trabajo?: string | null
    oc_item_id?: string | null
  }

  export type MovimientoAlmacenCreateOrConnectWithoutItemInput = {
    where: MovimientoAlmacenWhereUniqueInput
    create: XOR<MovimientoAlmacenCreateWithoutItemInput, MovimientoAlmacenUncheckedCreateWithoutItemInput>
  }

  export type MovimientoAlmacenCreateManyItemInputEnvelope = {
    data: MovimientoAlmacenCreateManyItemInput | MovimientoAlmacenCreateManyItemInput[]
    skipDuplicates?: boolean
  }

  export type MovimientoAlmacenUpsertWithWhereUniqueWithoutItemInput = {
    where: MovimientoAlmacenWhereUniqueInput
    update: XOR<MovimientoAlmacenUpdateWithoutItemInput, MovimientoAlmacenUncheckedUpdateWithoutItemInput>
    create: XOR<MovimientoAlmacenCreateWithoutItemInput, MovimientoAlmacenUncheckedCreateWithoutItemInput>
  }

  export type MovimientoAlmacenUpdateWithWhereUniqueWithoutItemInput = {
    where: MovimientoAlmacenWhereUniqueInput
    data: XOR<MovimientoAlmacenUpdateWithoutItemInput, MovimientoAlmacenUncheckedUpdateWithoutItemInput>
  }

  export type MovimientoAlmacenUpdateManyWithWhereWithoutItemInput = {
    where: MovimientoAlmacenScalarWhereInput
    data: XOR<MovimientoAlmacenUpdateManyMutationInput, MovimientoAlmacenUncheckedUpdateManyWithoutItemInput>
  }

  export type MovimientoAlmacenScalarWhereInput = {
    AND?: MovimientoAlmacenScalarWhereInput | MovimientoAlmacenScalarWhereInput[]
    OR?: MovimientoAlmacenScalarWhereInput[]
    NOT?: MovimientoAlmacenScalarWhereInput | MovimientoAlmacenScalarWhereInput[]
    id?: UuidFilter<"MovimientoAlmacen"> | string
    tenant_id?: UuidFilter<"MovimientoAlmacen"> | string
    proyecto_id?: UuidFilter<"MovimientoAlmacen"> | string
    item_id?: UuidFilter<"MovimientoAlmacen"> | string
    tipo?: StringFilter<"MovimientoAlmacen"> | string
    cantidad?: DecimalFilter<"MovimientoAlmacen"> | Decimal | DecimalJsLike | number | string
    unidad?: StringFilter<"MovimientoAlmacen"> | string
    origen?: StringNullableFilter<"MovimientoAlmacen"> | string | null
    destino?: StringNullableFilter<"MovimientoAlmacen"> | string | null
    responsable?: StringNullableFilter<"MovimientoAlmacen"> | string | null
    referencia?: StringNullableFilter<"MovimientoAlmacen"> | string | null
    fecha?: DateTimeFilter<"MovimientoAlmacen"> | Date | string
    concepto_id?: UuidNullableFilter<"MovimientoAlmacen"> | string | null
    concepto_clave?: StringNullableFilter<"MovimientoAlmacen"> | string | null
    frente_trabajo?: StringNullableFilter<"MovimientoAlmacen"> | string | null
    oc_item_id?: UuidNullableFilter<"MovimientoAlmacen"> | string | null
  }

  export type ItemInventarioCreateWithoutMovimientosInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    insumo_id?: string | null
    clave: string
    descripcion: string
    unidad: string
    categoria: string
    stock_actual?: Decimal | DecimalJsLike | number | string
    stock_minimo?: Decimal | DecimalJsLike | number | string
    ubicacion?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ItemInventarioUncheckedCreateWithoutMovimientosInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    insumo_id?: string | null
    clave: string
    descripcion: string
    unidad: string
    categoria: string
    stock_actual?: Decimal | DecimalJsLike | number | string
    stock_minimo?: Decimal | DecimalJsLike | number | string
    ubicacion?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ItemInventarioCreateOrConnectWithoutMovimientosInput = {
    where: ItemInventarioWhereUniqueInput
    create: XOR<ItemInventarioCreateWithoutMovimientosInput, ItemInventarioUncheckedCreateWithoutMovimientosInput>
  }

  export type ItemInventarioUpsertWithoutMovimientosInput = {
    update: XOR<ItemInventarioUpdateWithoutMovimientosInput, ItemInventarioUncheckedUpdateWithoutMovimientosInput>
    create: XOR<ItemInventarioCreateWithoutMovimientosInput, ItemInventarioUncheckedCreateWithoutMovimientosInput>
    where?: ItemInventarioWhereInput
  }

  export type ItemInventarioUpdateToOneWithWhereWithoutMovimientosInput = {
    where?: ItemInventarioWhereInput
    data: XOR<ItemInventarioUpdateWithoutMovimientosInput, ItemInventarioUncheckedUpdateWithoutMovimientosInput>
  }

  export type ItemInventarioUpdateWithoutMovimientosInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    insumo_id?: NullableStringFieldUpdateOperationsInput | string | null
    clave?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    unidad?: StringFieldUpdateOperationsInput | string
    categoria?: StringFieldUpdateOperationsInput | string
    stock_actual?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    stock_minimo?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    ubicacion?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ItemInventarioUncheckedUpdateWithoutMovimientosInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    insumo_id?: NullableStringFieldUpdateOperationsInput | string | null
    clave?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    unidad?: StringFieldUpdateOperationsInput | string
    categoria?: StringFieldUpdateOperationsInput | string
    stock_actual?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    stock_minimo?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    ubicacion?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MovimientoAlmacenCreateManyItemInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    tipo: string
    cantidad: Decimal | DecimalJsLike | number | string
    unidad: string
    origen?: string | null
    destino?: string | null
    responsable?: string | null
    referencia?: string | null
    fecha?: Date | string
    concepto_id?: string | null
    concepto_clave?: string | null
    frente_trabajo?: string | null
    oc_item_id?: string | null
  }

  export type MovimientoAlmacenUpdateWithoutItemInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    cantidad?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unidad?: StringFieldUpdateOperationsInput | string
    origen?: NullableStringFieldUpdateOperationsInput | string | null
    destino?: NullableStringFieldUpdateOperationsInput | string | null
    responsable?: NullableStringFieldUpdateOperationsInput | string | null
    referencia?: NullableStringFieldUpdateOperationsInput | string | null
    fecha?: DateTimeFieldUpdateOperationsInput | Date | string
    concepto_id?: NullableStringFieldUpdateOperationsInput | string | null
    concepto_clave?: NullableStringFieldUpdateOperationsInput | string | null
    frente_trabajo?: NullableStringFieldUpdateOperationsInput | string | null
    oc_item_id?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type MovimientoAlmacenUncheckedUpdateWithoutItemInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    cantidad?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unidad?: StringFieldUpdateOperationsInput | string
    origen?: NullableStringFieldUpdateOperationsInput | string | null
    destino?: NullableStringFieldUpdateOperationsInput | string | null
    responsable?: NullableStringFieldUpdateOperationsInput | string | null
    referencia?: NullableStringFieldUpdateOperationsInput | string | null
    fecha?: DateTimeFieldUpdateOperationsInput | Date | string
    concepto_id?: NullableStringFieldUpdateOperationsInput | string | null
    concepto_clave?: NullableStringFieldUpdateOperationsInput | string | null
    frente_trabajo?: NullableStringFieldUpdateOperationsInput | string | null
    oc_item_id?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type MovimientoAlmacenUncheckedUpdateManyWithoutItemInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    cantidad?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unidad?: StringFieldUpdateOperationsInput | string
    origen?: NullableStringFieldUpdateOperationsInput | string | null
    destino?: NullableStringFieldUpdateOperationsInput | string | null
    responsable?: NullableStringFieldUpdateOperationsInput | string | null
    referencia?: NullableStringFieldUpdateOperationsInput | string | null
    fecha?: DateTimeFieldUpdateOperationsInput | Date | string
    concepto_id?: NullableStringFieldUpdateOperationsInput | string | null
    concepto_clave?: NullableStringFieldUpdateOperationsInput | string | null
    frente_trabajo?: NullableStringFieldUpdateOperationsInput | string | null
    oc_item_id?: NullableStringFieldUpdateOperationsInput | string | null
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use ItemInventarioCountOutputTypeDefaultArgs instead
     */
    export type ItemInventarioCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ItemInventarioCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ItemInventarioDefaultArgs instead
     */
    export type ItemInventarioArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ItemInventarioDefaultArgs<ExtArgs>
    /**
     * @deprecated Use MovimientoAlmacenDefaultArgs instead
     */
    export type MovimientoAlmacenArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = MovimientoAlmacenDefaultArgs<ExtArgs>

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