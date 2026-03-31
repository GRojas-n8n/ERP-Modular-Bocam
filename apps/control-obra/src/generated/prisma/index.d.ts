
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
 * Model BitacoraObra
 * 
 */
export type BitacoraObra = $Result.DefaultSelection<Prisma.$BitacoraObraPayload>
/**
 * Model AvanceFisico
 * 
 */
export type AvanceFisico = $Result.DefaultSelection<Prisma.$AvanceFisicoPayload>
/**
 * Model Estimacion
 * 
 */
export type Estimacion = $Result.DefaultSelection<Prisma.$EstimacionPayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more BitacoraObras
 * const bitacoraObras = await prisma.bitacoraObra.findMany()
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
   * // Fetch zero or more BitacoraObras
   * const bitacoraObras = await prisma.bitacoraObra.findMany()
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
   * `prisma.bitacoraObra`: Exposes CRUD operations for the **BitacoraObra** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more BitacoraObras
    * const bitacoraObras = await prisma.bitacoraObra.findMany()
    * ```
    */
  get bitacoraObra(): Prisma.BitacoraObraDelegate<ExtArgs>;

  /**
   * `prisma.avanceFisico`: Exposes CRUD operations for the **AvanceFisico** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AvanceFisicos
    * const avanceFisicos = await prisma.avanceFisico.findMany()
    * ```
    */
  get avanceFisico(): Prisma.AvanceFisicoDelegate<ExtArgs>;

  /**
   * `prisma.estimacion`: Exposes CRUD operations for the **Estimacion** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Estimacions
    * const estimacions = await prisma.estimacion.findMany()
    * ```
    */
  get estimacion(): Prisma.EstimacionDelegate<ExtArgs>;
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
    BitacoraObra: 'BitacoraObra',
    AvanceFisico: 'AvanceFisico',
    Estimacion: 'Estimacion'
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
      modelProps: "bitacoraObra" | "avanceFisico" | "estimacion"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      BitacoraObra: {
        payload: Prisma.$BitacoraObraPayload<ExtArgs>
        fields: Prisma.BitacoraObraFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BitacoraObraFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BitacoraObraPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BitacoraObraFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BitacoraObraPayload>
          }
          findFirst: {
            args: Prisma.BitacoraObraFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BitacoraObraPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BitacoraObraFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BitacoraObraPayload>
          }
          findMany: {
            args: Prisma.BitacoraObraFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BitacoraObraPayload>[]
          }
          create: {
            args: Prisma.BitacoraObraCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BitacoraObraPayload>
          }
          createMany: {
            args: Prisma.BitacoraObraCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.BitacoraObraCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BitacoraObraPayload>[]
          }
          delete: {
            args: Prisma.BitacoraObraDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BitacoraObraPayload>
          }
          update: {
            args: Prisma.BitacoraObraUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BitacoraObraPayload>
          }
          deleteMany: {
            args: Prisma.BitacoraObraDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BitacoraObraUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.BitacoraObraUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BitacoraObraPayload>
          }
          aggregate: {
            args: Prisma.BitacoraObraAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBitacoraObra>
          }
          groupBy: {
            args: Prisma.BitacoraObraGroupByArgs<ExtArgs>
            result: $Utils.Optional<BitacoraObraGroupByOutputType>[]
          }
          count: {
            args: Prisma.BitacoraObraCountArgs<ExtArgs>
            result: $Utils.Optional<BitacoraObraCountAggregateOutputType> | number
          }
        }
      }
      AvanceFisico: {
        payload: Prisma.$AvanceFisicoPayload<ExtArgs>
        fields: Prisma.AvanceFisicoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AvanceFisicoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AvanceFisicoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AvanceFisicoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AvanceFisicoPayload>
          }
          findFirst: {
            args: Prisma.AvanceFisicoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AvanceFisicoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AvanceFisicoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AvanceFisicoPayload>
          }
          findMany: {
            args: Prisma.AvanceFisicoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AvanceFisicoPayload>[]
          }
          create: {
            args: Prisma.AvanceFisicoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AvanceFisicoPayload>
          }
          createMany: {
            args: Prisma.AvanceFisicoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AvanceFisicoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AvanceFisicoPayload>[]
          }
          delete: {
            args: Prisma.AvanceFisicoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AvanceFisicoPayload>
          }
          update: {
            args: Prisma.AvanceFisicoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AvanceFisicoPayload>
          }
          deleteMany: {
            args: Prisma.AvanceFisicoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AvanceFisicoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AvanceFisicoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AvanceFisicoPayload>
          }
          aggregate: {
            args: Prisma.AvanceFisicoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAvanceFisico>
          }
          groupBy: {
            args: Prisma.AvanceFisicoGroupByArgs<ExtArgs>
            result: $Utils.Optional<AvanceFisicoGroupByOutputType>[]
          }
          count: {
            args: Prisma.AvanceFisicoCountArgs<ExtArgs>
            result: $Utils.Optional<AvanceFisicoCountAggregateOutputType> | number
          }
        }
      }
      Estimacion: {
        payload: Prisma.$EstimacionPayload<ExtArgs>
        fields: Prisma.EstimacionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.EstimacionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EstimacionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.EstimacionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EstimacionPayload>
          }
          findFirst: {
            args: Prisma.EstimacionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EstimacionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.EstimacionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EstimacionPayload>
          }
          findMany: {
            args: Prisma.EstimacionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EstimacionPayload>[]
          }
          create: {
            args: Prisma.EstimacionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EstimacionPayload>
          }
          createMany: {
            args: Prisma.EstimacionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.EstimacionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EstimacionPayload>[]
          }
          delete: {
            args: Prisma.EstimacionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EstimacionPayload>
          }
          update: {
            args: Prisma.EstimacionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EstimacionPayload>
          }
          deleteMany: {
            args: Prisma.EstimacionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.EstimacionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.EstimacionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EstimacionPayload>
          }
          aggregate: {
            args: Prisma.EstimacionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateEstimacion>
          }
          groupBy: {
            args: Prisma.EstimacionGroupByArgs<ExtArgs>
            result: $Utils.Optional<EstimacionGroupByOutputType>[]
          }
          count: {
            args: Prisma.EstimacionCountArgs<ExtArgs>
            result: $Utils.Optional<EstimacionCountAggregateOutputType> | number
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
   * Count Type EstimacionCountOutputType
   */

  export type EstimacionCountOutputType = {
    avances: number
  }

  export type EstimacionCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    avances?: boolean | EstimacionCountOutputTypeCountAvancesArgs
  }

  // Custom InputTypes
  /**
   * EstimacionCountOutputType without action
   */
  export type EstimacionCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EstimacionCountOutputType
     */
    select?: EstimacionCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * EstimacionCountOutputType without action
   */
  export type EstimacionCountOutputTypeCountAvancesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AvanceFisicoWhereInput
  }


  /**
   * Models
   */

  /**
   * Model BitacoraObra
   */

  export type AggregateBitacoraObra = {
    _count: BitacoraObraCountAggregateOutputType | null
    _avg: BitacoraObraAvgAggregateOutputType | null
    _sum: BitacoraObraSumAggregateOutputType | null
    _min: BitacoraObraMinAggregateOutputType | null
    _max: BitacoraObraMaxAggregateOutputType | null
  }

  export type BitacoraObraAvgAggregateOutputType = {
    numero_entrada: number | null
    temperatura_c: Decimal | null
    personal_en_sitio: number | null
  }

  export type BitacoraObraSumAggregateOutputType = {
    numero_entrada: number | null
    temperatura_c: Decimal | null
    personal_en_sitio: number | null
  }

  export type BitacoraObraMinAggregateOutputType = {
    id_bitacora: string | null
    tenant_id: string | null
    proyecto_id: string | null
    numero_entrada: number | null
    fecha: Date | null
    frente_trabajo: string | null
    turno: string | null
    clima: string | null
    temperatura_c: Decimal | null
    actividades_realizadas: string | null
    personal_en_sitio: number | null
    incidencias: string | null
    material_recibido: string | null
    observaciones: string | null
    residente_id: string | null
    residente_nombre: string | null
    superintendente_id: string | null
    estado: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type BitacoraObraMaxAggregateOutputType = {
    id_bitacora: string | null
    tenant_id: string | null
    proyecto_id: string | null
    numero_entrada: number | null
    fecha: Date | null
    frente_trabajo: string | null
    turno: string | null
    clima: string | null
    temperatura_c: Decimal | null
    actividades_realizadas: string | null
    personal_en_sitio: number | null
    incidencias: string | null
    material_recibido: string | null
    observaciones: string | null
    residente_id: string | null
    residente_nombre: string | null
    superintendente_id: string | null
    estado: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type BitacoraObraCountAggregateOutputType = {
    id_bitacora: number
    tenant_id: number
    proyecto_id: number
    numero_entrada: number
    fecha: number
    frente_trabajo: number
    turno: number
    clima: number
    temperatura_c: number
    actividades_realizadas: number
    personal_en_sitio: number
    incidencias: number
    material_recibido: number
    observaciones: number
    residente_id: number
    residente_nombre: number
    superintendente_id: number
    estado: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type BitacoraObraAvgAggregateInputType = {
    numero_entrada?: true
    temperatura_c?: true
    personal_en_sitio?: true
  }

  export type BitacoraObraSumAggregateInputType = {
    numero_entrada?: true
    temperatura_c?: true
    personal_en_sitio?: true
  }

  export type BitacoraObraMinAggregateInputType = {
    id_bitacora?: true
    tenant_id?: true
    proyecto_id?: true
    numero_entrada?: true
    fecha?: true
    frente_trabajo?: true
    turno?: true
    clima?: true
    temperatura_c?: true
    actividades_realizadas?: true
    personal_en_sitio?: true
    incidencias?: true
    material_recibido?: true
    observaciones?: true
    residente_id?: true
    residente_nombre?: true
    superintendente_id?: true
    estado?: true
    created_at?: true
    updated_at?: true
  }

  export type BitacoraObraMaxAggregateInputType = {
    id_bitacora?: true
    tenant_id?: true
    proyecto_id?: true
    numero_entrada?: true
    fecha?: true
    frente_trabajo?: true
    turno?: true
    clima?: true
    temperatura_c?: true
    actividades_realizadas?: true
    personal_en_sitio?: true
    incidencias?: true
    material_recibido?: true
    observaciones?: true
    residente_id?: true
    residente_nombre?: true
    superintendente_id?: true
    estado?: true
    created_at?: true
    updated_at?: true
  }

  export type BitacoraObraCountAggregateInputType = {
    id_bitacora?: true
    tenant_id?: true
    proyecto_id?: true
    numero_entrada?: true
    fecha?: true
    frente_trabajo?: true
    turno?: true
    clima?: true
    temperatura_c?: true
    actividades_realizadas?: true
    personal_en_sitio?: true
    incidencias?: true
    material_recibido?: true
    observaciones?: true
    residente_id?: true
    residente_nombre?: true
    superintendente_id?: true
    estado?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type BitacoraObraAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BitacoraObra to aggregate.
     */
    where?: BitacoraObraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BitacoraObras to fetch.
     */
    orderBy?: BitacoraObraOrderByWithRelationInput | BitacoraObraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BitacoraObraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BitacoraObras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BitacoraObras.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned BitacoraObras
    **/
    _count?: true | BitacoraObraCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: BitacoraObraAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: BitacoraObraSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BitacoraObraMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BitacoraObraMaxAggregateInputType
  }

  export type GetBitacoraObraAggregateType<T extends BitacoraObraAggregateArgs> = {
        [P in keyof T & keyof AggregateBitacoraObra]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBitacoraObra[P]>
      : GetScalarType<T[P], AggregateBitacoraObra[P]>
  }




  export type BitacoraObraGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BitacoraObraWhereInput
    orderBy?: BitacoraObraOrderByWithAggregationInput | BitacoraObraOrderByWithAggregationInput[]
    by: BitacoraObraScalarFieldEnum[] | BitacoraObraScalarFieldEnum
    having?: BitacoraObraScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BitacoraObraCountAggregateInputType | true
    _avg?: BitacoraObraAvgAggregateInputType
    _sum?: BitacoraObraSumAggregateInputType
    _min?: BitacoraObraMinAggregateInputType
    _max?: BitacoraObraMaxAggregateInputType
  }

  export type BitacoraObraGroupByOutputType = {
    id_bitacora: string
    tenant_id: string
    proyecto_id: string
    numero_entrada: number
    fecha: Date
    frente_trabajo: string
    turno: string
    clima: string | null
    temperatura_c: Decimal | null
    actividades_realizadas: string
    personal_en_sitio: number
    incidencias: string | null
    material_recibido: string | null
    observaciones: string | null
    residente_id: string
    residente_nombre: string
    superintendente_id: string | null
    estado: string
    created_at: Date
    updated_at: Date
    _count: BitacoraObraCountAggregateOutputType | null
    _avg: BitacoraObraAvgAggregateOutputType | null
    _sum: BitacoraObraSumAggregateOutputType | null
    _min: BitacoraObraMinAggregateOutputType | null
    _max: BitacoraObraMaxAggregateOutputType | null
  }

  type GetBitacoraObraGroupByPayload<T extends BitacoraObraGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BitacoraObraGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BitacoraObraGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BitacoraObraGroupByOutputType[P]>
            : GetScalarType<T[P], BitacoraObraGroupByOutputType[P]>
        }
      >
    >


  export type BitacoraObraSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_bitacora?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    numero_entrada?: boolean
    fecha?: boolean
    frente_trabajo?: boolean
    turno?: boolean
    clima?: boolean
    temperatura_c?: boolean
    actividades_realizadas?: boolean
    personal_en_sitio?: boolean
    incidencias?: boolean
    material_recibido?: boolean
    observaciones?: boolean
    residente_id?: boolean
    residente_nombre?: boolean
    superintendente_id?: boolean
    estado?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["bitacoraObra"]>

  export type BitacoraObraSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_bitacora?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    numero_entrada?: boolean
    fecha?: boolean
    frente_trabajo?: boolean
    turno?: boolean
    clima?: boolean
    temperatura_c?: boolean
    actividades_realizadas?: boolean
    personal_en_sitio?: boolean
    incidencias?: boolean
    material_recibido?: boolean
    observaciones?: boolean
    residente_id?: boolean
    residente_nombre?: boolean
    superintendente_id?: boolean
    estado?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["bitacoraObra"]>

  export type BitacoraObraSelectScalar = {
    id_bitacora?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    numero_entrada?: boolean
    fecha?: boolean
    frente_trabajo?: boolean
    turno?: boolean
    clima?: boolean
    temperatura_c?: boolean
    actividades_realizadas?: boolean
    personal_en_sitio?: boolean
    incidencias?: boolean
    material_recibido?: boolean
    observaciones?: boolean
    residente_id?: boolean
    residente_nombre?: boolean
    superintendente_id?: boolean
    estado?: boolean
    created_at?: boolean
    updated_at?: boolean
  }


  export type $BitacoraObraPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "BitacoraObra"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id_bitacora: string
      tenant_id: string
      proyecto_id: string
      numero_entrada: number
      fecha: Date
      frente_trabajo: string
      turno: string
      clima: string | null
      temperatura_c: Prisma.Decimal | null
      actividades_realizadas: string
      personal_en_sitio: number
      incidencias: string | null
      material_recibido: string | null
      observaciones: string | null
      residente_id: string
      residente_nombre: string
      superintendente_id: string | null
      estado: string
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["bitacoraObra"]>
    composites: {}
  }

  type BitacoraObraGetPayload<S extends boolean | null | undefined | BitacoraObraDefaultArgs> = $Result.GetResult<Prisma.$BitacoraObraPayload, S>

  type BitacoraObraCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<BitacoraObraFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: BitacoraObraCountAggregateInputType | true
    }

  export interface BitacoraObraDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['BitacoraObra'], meta: { name: 'BitacoraObra' } }
    /**
     * Find zero or one BitacoraObra that matches the filter.
     * @param {BitacoraObraFindUniqueArgs} args - Arguments to find a BitacoraObra
     * @example
     * // Get one BitacoraObra
     * const bitacoraObra = await prisma.bitacoraObra.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BitacoraObraFindUniqueArgs>(args: SelectSubset<T, BitacoraObraFindUniqueArgs<ExtArgs>>): Prisma__BitacoraObraClient<$Result.GetResult<Prisma.$BitacoraObraPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one BitacoraObra that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {BitacoraObraFindUniqueOrThrowArgs} args - Arguments to find a BitacoraObra
     * @example
     * // Get one BitacoraObra
     * const bitacoraObra = await prisma.bitacoraObra.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BitacoraObraFindUniqueOrThrowArgs>(args: SelectSubset<T, BitacoraObraFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BitacoraObraClient<$Result.GetResult<Prisma.$BitacoraObraPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first BitacoraObra that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BitacoraObraFindFirstArgs} args - Arguments to find a BitacoraObra
     * @example
     * // Get one BitacoraObra
     * const bitacoraObra = await prisma.bitacoraObra.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BitacoraObraFindFirstArgs>(args?: SelectSubset<T, BitacoraObraFindFirstArgs<ExtArgs>>): Prisma__BitacoraObraClient<$Result.GetResult<Prisma.$BitacoraObraPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first BitacoraObra that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BitacoraObraFindFirstOrThrowArgs} args - Arguments to find a BitacoraObra
     * @example
     * // Get one BitacoraObra
     * const bitacoraObra = await prisma.bitacoraObra.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BitacoraObraFindFirstOrThrowArgs>(args?: SelectSubset<T, BitacoraObraFindFirstOrThrowArgs<ExtArgs>>): Prisma__BitacoraObraClient<$Result.GetResult<Prisma.$BitacoraObraPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more BitacoraObras that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BitacoraObraFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all BitacoraObras
     * const bitacoraObras = await prisma.bitacoraObra.findMany()
     * 
     * // Get first 10 BitacoraObras
     * const bitacoraObras = await prisma.bitacoraObra.findMany({ take: 10 })
     * 
     * // Only select the `id_bitacora`
     * const bitacoraObraWithId_bitacoraOnly = await prisma.bitacoraObra.findMany({ select: { id_bitacora: true } })
     * 
     */
    findMany<T extends BitacoraObraFindManyArgs>(args?: SelectSubset<T, BitacoraObraFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BitacoraObraPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a BitacoraObra.
     * @param {BitacoraObraCreateArgs} args - Arguments to create a BitacoraObra.
     * @example
     * // Create one BitacoraObra
     * const BitacoraObra = await prisma.bitacoraObra.create({
     *   data: {
     *     // ... data to create a BitacoraObra
     *   }
     * })
     * 
     */
    create<T extends BitacoraObraCreateArgs>(args: SelectSubset<T, BitacoraObraCreateArgs<ExtArgs>>): Prisma__BitacoraObraClient<$Result.GetResult<Prisma.$BitacoraObraPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many BitacoraObras.
     * @param {BitacoraObraCreateManyArgs} args - Arguments to create many BitacoraObras.
     * @example
     * // Create many BitacoraObras
     * const bitacoraObra = await prisma.bitacoraObra.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BitacoraObraCreateManyArgs>(args?: SelectSubset<T, BitacoraObraCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many BitacoraObras and returns the data saved in the database.
     * @param {BitacoraObraCreateManyAndReturnArgs} args - Arguments to create many BitacoraObras.
     * @example
     * // Create many BitacoraObras
     * const bitacoraObra = await prisma.bitacoraObra.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many BitacoraObras and only return the `id_bitacora`
     * const bitacoraObraWithId_bitacoraOnly = await prisma.bitacoraObra.createManyAndReturn({ 
     *   select: { id_bitacora: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends BitacoraObraCreateManyAndReturnArgs>(args?: SelectSubset<T, BitacoraObraCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BitacoraObraPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a BitacoraObra.
     * @param {BitacoraObraDeleteArgs} args - Arguments to delete one BitacoraObra.
     * @example
     * // Delete one BitacoraObra
     * const BitacoraObra = await prisma.bitacoraObra.delete({
     *   where: {
     *     // ... filter to delete one BitacoraObra
     *   }
     * })
     * 
     */
    delete<T extends BitacoraObraDeleteArgs>(args: SelectSubset<T, BitacoraObraDeleteArgs<ExtArgs>>): Prisma__BitacoraObraClient<$Result.GetResult<Prisma.$BitacoraObraPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one BitacoraObra.
     * @param {BitacoraObraUpdateArgs} args - Arguments to update one BitacoraObra.
     * @example
     * // Update one BitacoraObra
     * const bitacoraObra = await prisma.bitacoraObra.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BitacoraObraUpdateArgs>(args: SelectSubset<T, BitacoraObraUpdateArgs<ExtArgs>>): Prisma__BitacoraObraClient<$Result.GetResult<Prisma.$BitacoraObraPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more BitacoraObras.
     * @param {BitacoraObraDeleteManyArgs} args - Arguments to filter BitacoraObras to delete.
     * @example
     * // Delete a few BitacoraObras
     * const { count } = await prisma.bitacoraObra.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BitacoraObraDeleteManyArgs>(args?: SelectSubset<T, BitacoraObraDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BitacoraObras.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BitacoraObraUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many BitacoraObras
     * const bitacoraObra = await prisma.bitacoraObra.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BitacoraObraUpdateManyArgs>(args: SelectSubset<T, BitacoraObraUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one BitacoraObra.
     * @param {BitacoraObraUpsertArgs} args - Arguments to update or create a BitacoraObra.
     * @example
     * // Update or create a BitacoraObra
     * const bitacoraObra = await prisma.bitacoraObra.upsert({
     *   create: {
     *     // ... data to create a BitacoraObra
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the BitacoraObra we want to update
     *   }
     * })
     */
    upsert<T extends BitacoraObraUpsertArgs>(args: SelectSubset<T, BitacoraObraUpsertArgs<ExtArgs>>): Prisma__BitacoraObraClient<$Result.GetResult<Prisma.$BitacoraObraPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of BitacoraObras.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BitacoraObraCountArgs} args - Arguments to filter BitacoraObras to count.
     * @example
     * // Count the number of BitacoraObras
     * const count = await prisma.bitacoraObra.count({
     *   where: {
     *     // ... the filter for the BitacoraObras we want to count
     *   }
     * })
    **/
    count<T extends BitacoraObraCountArgs>(
      args?: Subset<T, BitacoraObraCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BitacoraObraCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a BitacoraObra.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BitacoraObraAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends BitacoraObraAggregateArgs>(args: Subset<T, BitacoraObraAggregateArgs>): Prisma.PrismaPromise<GetBitacoraObraAggregateType<T>>

    /**
     * Group by BitacoraObra.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BitacoraObraGroupByArgs} args - Group by arguments.
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
      T extends BitacoraObraGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BitacoraObraGroupByArgs['orderBy'] }
        : { orderBy?: BitacoraObraGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, BitacoraObraGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBitacoraObraGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the BitacoraObra model
   */
  readonly fields: BitacoraObraFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for BitacoraObra.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BitacoraObraClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the BitacoraObra model
   */ 
  interface BitacoraObraFieldRefs {
    readonly id_bitacora: FieldRef<"BitacoraObra", 'String'>
    readonly tenant_id: FieldRef<"BitacoraObra", 'String'>
    readonly proyecto_id: FieldRef<"BitacoraObra", 'String'>
    readonly numero_entrada: FieldRef<"BitacoraObra", 'Int'>
    readonly fecha: FieldRef<"BitacoraObra", 'DateTime'>
    readonly frente_trabajo: FieldRef<"BitacoraObra", 'String'>
    readonly turno: FieldRef<"BitacoraObra", 'String'>
    readonly clima: FieldRef<"BitacoraObra", 'String'>
    readonly temperatura_c: FieldRef<"BitacoraObra", 'Decimal'>
    readonly actividades_realizadas: FieldRef<"BitacoraObra", 'String'>
    readonly personal_en_sitio: FieldRef<"BitacoraObra", 'Int'>
    readonly incidencias: FieldRef<"BitacoraObra", 'String'>
    readonly material_recibido: FieldRef<"BitacoraObra", 'String'>
    readonly observaciones: FieldRef<"BitacoraObra", 'String'>
    readonly residente_id: FieldRef<"BitacoraObra", 'String'>
    readonly residente_nombre: FieldRef<"BitacoraObra", 'String'>
    readonly superintendente_id: FieldRef<"BitacoraObra", 'String'>
    readonly estado: FieldRef<"BitacoraObra", 'String'>
    readonly created_at: FieldRef<"BitacoraObra", 'DateTime'>
    readonly updated_at: FieldRef<"BitacoraObra", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * BitacoraObra findUnique
   */
  export type BitacoraObraFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BitacoraObra
     */
    select?: BitacoraObraSelect<ExtArgs> | null
    /**
     * Filter, which BitacoraObra to fetch.
     */
    where: BitacoraObraWhereUniqueInput
  }

  /**
   * BitacoraObra findUniqueOrThrow
   */
  export type BitacoraObraFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BitacoraObra
     */
    select?: BitacoraObraSelect<ExtArgs> | null
    /**
     * Filter, which BitacoraObra to fetch.
     */
    where: BitacoraObraWhereUniqueInput
  }

  /**
   * BitacoraObra findFirst
   */
  export type BitacoraObraFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BitacoraObra
     */
    select?: BitacoraObraSelect<ExtArgs> | null
    /**
     * Filter, which BitacoraObra to fetch.
     */
    where?: BitacoraObraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BitacoraObras to fetch.
     */
    orderBy?: BitacoraObraOrderByWithRelationInput | BitacoraObraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BitacoraObras.
     */
    cursor?: BitacoraObraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BitacoraObras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BitacoraObras.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BitacoraObras.
     */
    distinct?: BitacoraObraScalarFieldEnum | BitacoraObraScalarFieldEnum[]
  }

  /**
   * BitacoraObra findFirstOrThrow
   */
  export type BitacoraObraFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BitacoraObra
     */
    select?: BitacoraObraSelect<ExtArgs> | null
    /**
     * Filter, which BitacoraObra to fetch.
     */
    where?: BitacoraObraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BitacoraObras to fetch.
     */
    orderBy?: BitacoraObraOrderByWithRelationInput | BitacoraObraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BitacoraObras.
     */
    cursor?: BitacoraObraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BitacoraObras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BitacoraObras.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BitacoraObras.
     */
    distinct?: BitacoraObraScalarFieldEnum | BitacoraObraScalarFieldEnum[]
  }

  /**
   * BitacoraObra findMany
   */
  export type BitacoraObraFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BitacoraObra
     */
    select?: BitacoraObraSelect<ExtArgs> | null
    /**
     * Filter, which BitacoraObras to fetch.
     */
    where?: BitacoraObraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BitacoraObras to fetch.
     */
    orderBy?: BitacoraObraOrderByWithRelationInput | BitacoraObraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing BitacoraObras.
     */
    cursor?: BitacoraObraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BitacoraObras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BitacoraObras.
     */
    skip?: number
    distinct?: BitacoraObraScalarFieldEnum | BitacoraObraScalarFieldEnum[]
  }

  /**
   * BitacoraObra create
   */
  export type BitacoraObraCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BitacoraObra
     */
    select?: BitacoraObraSelect<ExtArgs> | null
    /**
     * The data needed to create a BitacoraObra.
     */
    data: XOR<BitacoraObraCreateInput, BitacoraObraUncheckedCreateInput>
  }

  /**
   * BitacoraObra createMany
   */
  export type BitacoraObraCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many BitacoraObras.
     */
    data: BitacoraObraCreateManyInput | BitacoraObraCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * BitacoraObra createManyAndReturn
   */
  export type BitacoraObraCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BitacoraObra
     */
    select?: BitacoraObraSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many BitacoraObras.
     */
    data: BitacoraObraCreateManyInput | BitacoraObraCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * BitacoraObra update
   */
  export type BitacoraObraUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BitacoraObra
     */
    select?: BitacoraObraSelect<ExtArgs> | null
    /**
     * The data needed to update a BitacoraObra.
     */
    data: XOR<BitacoraObraUpdateInput, BitacoraObraUncheckedUpdateInput>
    /**
     * Choose, which BitacoraObra to update.
     */
    where: BitacoraObraWhereUniqueInput
  }

  /**
   * BitacoraObra updateMany
   */
  export type BitacoraObraUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update BitacoraObras.
     */
    data: XOR<BitacoraObraUpdateManyMutationInput, BitacoraObraUncheckedUpdateManyInput>
    /**
     * Filter which BitacoraObras to update
     */
    where?: BitacoraObraWhereInput
  }

  /**
   * BitacoraObra upsert
   */
  export type BitacoraObraUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BitacoraObra
     */
    select?: BitacoraObraSelect<ExtArgs> | null
    /**
     * The filter to search for the BitacoraObra to update in case it exists.
     */
    where: BitacoraObraWhereUniqueInput
    /**
     * In case the BitacoraObra found by the `where` argument doesn't exist, create a new BitacoraObra with this data.
     */
    create: XOR<BitacoraObraCreateInput, BitacoraObraUncheckedCreateInput>
    /**
     * In case the BitacoraObra was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BitacoraObraUpdateInput, BitacoraObraUncheckedUpdateInput>
  }

  /**
   * BitacoraObra delete
   */
  export type BitacoraObraDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BitacoraObra
     */
    select?: BitacoraObraSelect<ExtArgs> | null
    /**
     * Filter which BitacoraObra to delete.
     */
    where: BitacoraObraWhereUniqueInput
  }

  /**
   * BitacoraObra deleteMany
   */
  export type BitacoraObraDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BitacoraObras to delete
     */
    where?: BitacoraObraWhereInput
  }

  /**
   * BitacoraObra without action
   */
  export type BitacoraObraDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BitacoraObra
     */
    select?: BitacoraObraSelect<ExtArgs> | null
  }


  /**
   * Model AvanceFisico
   */

  export type AggregateAvanceFisico = {
    _count: AvanceFisicoCountAggregateOutputType | null
    _avg: AvanceFisicoAvgAggregateOutputType | null
    _sum: AvanceFisicoSumAggregateOutputType | null
    _min: AvanceFisicoMinAggregateOutputType | null
    _max: AvanceFisicoMaxAggregateOutputType | null
  }

  export type AvanceFisicoAvgAggregateOutputType = {
    cantidad_presupuestada: Decimal | null
    cantidad_anterior: Decimal | null
    cantidad_periodo: Decimal | null
    cantidad_acumulada: Decimal | null
    precio_unitario: Decimal | null
    importe_periodo: Decimal | null
    importe_acumulado: Decimal | null
    porcentaje_avance: Decimal | null
  }

  export type AvanceFisicoSumAggregateOutputType = {
    cantidad_presupuestada: Decimal | null
    cantidad_anterior: Decimal | null
    cantidad_periodo: Decimal | null
    cantidad_acumulada: Decimal | null
    precio_unitario: Decimal | null
    importe_periodo: Decimal | null
    importe_acumulado: Decimal | null
    porcentaje_avance: Decimal | null
  }

  export type AvanceFisicoMinAggregateOutputType = {
    id_avance: string | null
    tenant_id: string | null
    proyecto_id: string | null
    concepto_presupuesto: string | null
    descripcion_concepto: string | null
    cantidad_presupuestada: Decimal | null
    cantidad_anterior: Decimal | null
    cantidad_periodo: Decimal | null
    cantidad_acumulada: Decimal | null
    unidad: string | null
    precio_unitario: Decimal | null
    importe_periodo: Decimal | null
    importe_acumulado: Decimal | null
    porcentaje_avance: Decimal | null
    periodo_inicio: Date | null
    periodo_fin: Date | null
    registrado_por_id: string | null
    registrado_por_nombre: string | null
    validado_por_id: string | null
    validado_por_nombre: string | null
    estado: string | null
    estimacion_id: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type AvanceFisicoMaxAggregateOutputType = {
    id_avance: string | null
    tenant_id: string | null
    proyecto_id: string | null
    concepto_presupuesto: string | null
    descripcion_concepto: string | null
    cantidad_presupuestada: Decimal | null
    cantidad_anterior: Decimal | null
    cantidad_periodo: Decimal | null
    cantidad_acumulada: Decimal | null
    unidad: string | null
    precio_unitario: Decimal | null
    importe_periodo: Decimal | null
    importe_acumulado: Decimal | null
    porcentaje_avance: Decimal | null
    periodo_inicio: Date | null
    periodo_fin: Date | null
    registrado_por_id: string | null
    registrado_por_nombre: string | null
    validado_por_id: string | null
    validado_por_nombre: string | null
    estado: string | null
    estimacion_id: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type AvanceFisicoCountAggregateOutputType = {
    id_avance: number
    tenant_id: number
    proyecto_id: number
    concepto_presupuesto: number
    descripcion_concepto: number
    cantidad_presupuestada: number
    cantidad_anterior: number
    cantidad_periodo: number
    cantidad_acumulada: number
    unidad: number
    precio_unitario: number
    importe_periodo: number
    importe_acumulado: number
    porcentaje_avance: number
    periodo_inicio: number
    periodo_fin: number
    registrado_por_id: number
    registrado_por_nombre: number
    validado_por_id: number
    validado_por_nombre: number
    estado: number
    estimacion_id: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type AvanceFisicoAvgAggregateInputType = {
    cantidad_presupuestada?: true
    cantidad_anterior?: true
    cantidad_periodo?: true
    cantidad_acumulada?: true
    precio_unitario?: true
    importe_periodo?: true
    importe_acumulado?: true
    porcentaje_avance?: true
  }

  export type AvanceFisicoSumAggregateInputType = {
    cantidad_presupuestada?: true
    cantidad_anterior?: true
    cantidad_periodo?: true
    cantidad_acumulada?: true
    precio_unitario?: true
    importe_periodo?: true
    importe_acumulado?: true
    porcentaje_avance?: true
  }

  export type AvanceFisicoMinAggregateInputType = {
    id_avance?: true
    tenant_id?: true
    proyecto_id?: true
    concepto_presupuesto?: true
    descripcion_concepto?: true
    cantidad_presupuestada?: true
    cantidad_anterior?: true
    cantidad_periodo?: true
    cantidad_acumulada?: true
    unidad?: true
    precio_unitario?: true
    importe_periodo?: true
    importe_acumulado?: true
    porcentaje_avance?: true
    periodo_inicio?: true
    periodo_fin?: true
    registrado_por_id?: true
    registrado_por_nombre?: true
    validado_por_id?: true
    validado_por_nombre?: true
    estado?: true
    estimacion_id?: true
    created_at?: true
    updated_at?: true
  }

  export type AvanceFisicoMaxAggregateInputType = {
    id_avance?: true
    tenant_id?: true
    proyecto_id?: true
    concepto_presupuesto?: true
    descripcion_concepto?: true
    cantidad_presupuestada?: true
    cantidad_anterior?: true
    cantidad_periodo?: true
    cantidad_acumulada?: true
    unidad?: true
    precio_unitario?: true
    importe_periodo?: true
    importe_acumulado?: true
    porcentaje_avance?: true
    periodo_inicio?: true
    periodo_fin?: true
    registrado_por_id?: true
    registrado_por_nombre?: true
    validado_por_id?: true
    validado_por_nombre?: true
    estado?: true
    estimacion_id?: true
    created_at?: true
    updated_at?: true
  }

  export type AvanceFisicoCountAggregateInputType = {
    id_avance?: true
    tenant_id?: true
    proyecto_id?: true
    concepto_presupuesto?: true
    descripcion_concepto?: true
    cantidad_presupuestada?: true
    cantidad_anterior?: true
    cantidad_periodo?: true
    cantidad_acumulada?: true
    unidad?: true
    precio_unitario?: true
    importe_periodo?: true
    importe_acumulado?: true
    porcentaje_avance?: true
    periodo_inicio?: true
    periodo_fin?: true
    registrado_por_id?: true
    registrado_por_nombre?: true
    validado_por_id?: true
    validado_por_nombre?: true
    estado?: true
    estimacion_id?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type AvanceFisicoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AvanceFisico to aggregate.
     */
    where?: AvanceFisicoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AvanceFisicos to fetch.
     */
    orderBy?: AvanceFisicoOrderByWithRelationInput | AvanceFisicoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AvanceFisicoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AvanceFisicos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AvanceFisicos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AvanceFisicos
    **/
    _count?: true | AvanceFisicoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AvanceFisicoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AvanceFisicoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AvanceFisicoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AvanceFisicoMaxAggregateInputType
  }

  export type GetAvanceFisicoAggregateType<T extends AvanceFisicoAggregateArgs> = {
        [P in keyof T & keyof AggregateAvanceFisico]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAvanceFisico[P]>
      : GetScalarType<T[P], AggregateAvanceFisico[P]>
  }




  export type AvanceFisicoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AvanceFisicoWhereInput
    orderBy?: AvanceFisicoOrderByWithAggregationInput | AvanceFisicoOrderByWithAggregationInput[]
    by: AvanceFisicoScalarFieldEnum[] | AvanceFisicoScalarFieldEnum
    having?: AvanceFisicoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AvanceFisicoCountAggregateInputType | true
    _avg?: AvanceFisicoAvgAggregateInputType
    _sum?: AvanceFisicoSumAggregateInputType
    _min?: AvanceFisicoMinAggregateInputType
    _max?: AvanceFisicoMaxAggregateInputType
  }

  export type AvanceFisicoGroupByOutputType = {
    id_avance: string
    tenant_id: string
    proyecto_id: string
    concepto_presupuesto: string
    descripcion_concepto: string
    cantidad_presupuestada: Decimal
    cantidad_anterior: Decimal
    cantidad_periodo: Decimal
    cantidad_acumulada: Decimal
    unidad: string
    precio_unitario: Decimal
    importe_periodo: Decimal
    importe_acumulado: Decimal
    porcentaje_avance: Decimal
    periodo_inicio: Date
    periodo_fin: Date
    registrado_por_id: string
    registrado_por_nombre: string
    validado_por_id: string | null
    validado_por_nombre: string | null
    estado: string
    estimacion_id: string | null
    created_at: Date
    updated_at: Date
    _count: AvanceFisicoCountAggregateOutputType | null
    _avg: AvanceFisicoAvgAggregateOutputType | null
    _sum: AvanceFisicoSumAggregateOutputType | null
    _min: AvanceFisicoMinAggregateOutputType | null
    _max: AvanceFisicoMaxAggregateOutputType | null
  }

  type GetAvanceFisicoGroupByPayload<T extends AvanceFisicoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AvanceFisicoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AvanceFisicoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AvanceFisicoGroupByOutputType[P]>
            : GetScalarType<T[P], AvanceFisicoGroupByOutputType[P]>
        }
      >
    >


  export type AvanceFisicoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_avance?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    concepto_presupuesto?: boolean
    descripcion_concepto?: boolean
    cantidad_presupuestada?: boolean
    cantidad_anterior?: boolean
    cantidad_periodo?: boolean
    cantidad_acumulada?: boolean
    unidad?: boolean
    precio_unitario?: boolean
    importe_periodo?: boolean
    importe_acumulado?: boolean
    porcentaje_avance?: boolean
    periodo_inicio?: boolean
    periodo_fin?: boolean
    registrado_por_id?: boolean
    registrado_por_nombre?: boolean
    validado_por_id?: boolean
    validado_por_nombre?: boolean
    estado?: boolean
    estimacion_id?: boolean
    created_at?: boolean
    updated_at?: boolean
    estimacion?: boolean | AvanceFisico$estimacionArgs<ExtArgs>
  }, ExtArgs["result"]["avanceFisico"]>

  export type AvanceFisicoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_avance?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    concepto_presupuesto?: boolean
    descripcion_concepto?: boolean
    cantidad_presupuestada?: boolean
    cantidad_anterior?: boolean
    cantidad_periodo?: boolean
    cantidad_acumulada?: boolean
    unidad?: boolean
    precio_unitario?: boolean
    importe_periodo?: boolean
    importe_acumulado?: boolean
    porcentaje_avance?: boolean
    periodo_inicio?: boolean
    periodo_fin?: boolean
    registrado_por_id?: boolean
    registrado_por_nombre?: boolean
    validado_por_id?: boolean
    validado_por_nombre?: boolean
    estado?: boolean
    estimacion_id?: boolean
    created_at?: boolean
    updated_at?: boolean
    estimacion?: boolean | AvanceFisico$estimacionArgs<ExtArgs>
  }, ExtArgs["result"]["avanceFisico"]>

  export type AvanceFisicoSelectScalar = {
    id_avance?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    concepto_presupuesto?: boolean
    descripcion_concepto?: boolean
    cantidad_presupuestada?: boolean
    cantidad_anterior?: boolean
    cantidad_periodo?: boolean
    cantidad_acumulada?: boolean
    unidad?: boolean
    precio_unitario?: boolean
    importe_periodo?: boolean
    importe_acumulado?: boolean
    porcentaje_avance?: boolean
    periodo_inicio?: boolean
    periodo_fin?: boolean
    registrado_por_id?: boolean
    registrado_por_nombre?: boolean
    validado_por_id?: boolean
    validado_por_nombre?: boolean
    estado?: boolean
    estimacion_id?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type AvanceFisicoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    estimacion?: boolean | AvanceFisico$estimacionArgs<ExtArgs>
  }
  export type AvanceFisicoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    estimacion?: boolean | AvanceFisico$estimacionArgs<ExtArgs>
  }

  export type $AvanceFisicoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AvanceFisico"
    objects: {
      estimacion: Prisma.$EstimacionPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id_avance: string
      tenant_id: string
      proyecto_id: string
      concepto_presupuesto: string
      descripcion_concepto: string
      cantidad_presupuestada: Prisma.Decimal
      cantidad_anterior: Prisma.Decimal
      cantidad_periodo: Prisma.Decimal
      cantidad_acumulada: Prisma.Decimal
      unidad: string
      precio_unitario: Prisma.Decimal
      importe_periodo: Prisma.Decimal
      importe_acumulado: Prisma.Decimal
      porcentaje_avance: Prisma.Decimal
      periodo_inicio: Date
      periodo_fin: Date
      registrado_por_id: string
      registrado_por_nombre: string
      validado_por_id: string | null
      validado_por_nombre: string | null
      estado: string
      estimacion_id: string | null
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["avanceFisico"]>
    composites: {}
  }

  type AvanceFisicoGetPayload<S extends boolean | null | undefined | AvanceFisicoDefaultArgs> = $Result.GetResult<Prisma.$AvanceFisicoPayload, S>

  type AvanceFisicoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<AvanceFisicoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: AvanceFisicoCountAggregateInputType | true
    }

  export interface AvanceFisicoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AvanceFisico'], meta: { name: 'AvanceFisico' } }
    /**
     * Find zero or one AvanceFisico that matches the filter.
     * @param {AvanceFisicoFindUniqueArgs} args - Arguments to find a AvanceFisico
     * @example
     * // Get one AvanceFisico
     * const avanceFisico = await prisma.avanceFisico.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AvanceFisicoFindUniqueArgs>(args: SelectSubset<T, AvanceFisicoFindUniqueArgs<ExtArgs>>): Prisma__AvanceFisicoClient<$Result.GetResult<Prisma.$AvanceFisicoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one AvanceFisico that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {AvanceFisicoFindUniqueOrThrowArgs} args - Arguments to find a AvanceFisico
     * @example
     * // Get one AvanceFisico
     * const avanceFisico = await prisma.avanceFisico.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AvanceFisicoFindUniqueOrThrowArgs>(args: SelectSubset<T, AvanceFisicoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AvanceFisicoClient<$Result.GetResult<Prisma.$AvanceFisicoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first AvanceFisico that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AvanceFisicoFindFirstArgs} args - Arguments to find a AvanceFisico
     * @example
     * // Get one AvanceFisico
     * const avanceFisico = await prisma.avanceFisico.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AvanceFisicoFindFirstArgs>(args?: SelectSubset<T, AvanceFisicoFindFirstArgs<ExtArgs>>): Prisma__AvanceFisicoClient<$Result.GetResult<Prisma.$AvanceFisicoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first AvanceFisico that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AvanceFisicoFindFirstOrThrowArgs} args - Arguments to find a AvanceFisico
     * @example
     * // Get one AvanceFisico
     * const avanceFisico = await prisma.avanceFisico.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AvanceFisicoFindFirstOrThrowArgs>(args?: SelectSubset<T, AvanceFisicoFindFirstOrThrowArgs<ExtArgs>>): Prisma__AvanceFisicoClient<$Result.GetResult<Prisma.$AvanceFisicoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more AvanceFisicos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AvanceFisicoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AvanceFisicos
     * const avanceFisicos = await prisma.avanceFisico.findMany()
     * 
     * // Get first 10 AvanceFisicos
     * const avanceFisicos = await prisma.avanceFisico.findMany({ take: 10 })
     * 
     * // Only select the `id_avance`
     * const avanceFisicoWithId_avanceOnly = await prisma.avanceFisico.findMany({ select: { id_avance: true } })
     * 
     */
    findMany<T extends AvanceFisicoFindManyArgs>(args?: SelectSubset<T, AvanceFisicoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AvanceFisicoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a AvanceFisico.
     * @param {AvanceFisicoCreateArgs} args - Arguments to create a AvanceFisico.
     * @example
     * // Create one AvanceFisico
     * const AvanceFisico = await prisma.avanceFisico.create({
     *   data: {
     *     // ... data to create a AvanceFisico
     *   }
     * })
     * 
     */
    create<T extends AvanceFisicoCreateArgs>(args: SelectSubset<T, AvanceFisicoCreateArgs<ExtArgs>>): Prisma__AvanceFisicoClient<$Result.GetResult<Prisma.$AvanceFisicoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many AvanceFisicos.
     * @param {AvanceFisicoCreateManyArgs} args - Arguments to create many AvanceFisicos.
     * @example
     * // Create many AvanceFisicos
     * const avanceFisico = await prisma.avanceFisico.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AvanceFisicoCreateManyArgs>(args?: SelectSubset<T, AvanceFisicoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AvanceFisicos and returns the data saved in the database.
     * @param {AvanceFisicoCreateManyAndReturnArgs} args - Arguments to create many AvanceFisicos.
     * @example
     * // Create many AvanceFisicos
     * const avanceFisico = await prisma.avanceFisico.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AvanceFisicos and only return the `id_avance`
     * const avanceFisicoWithId_avanceOnly = await prisma.avanceFisico.createManyAndReturn({ 
     *   select: { id_avance: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AvanceFisicoCreateManyAndReturnArgs>(args?: SelectSubset<T, AvanceFisicoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AvanceFisicoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a AvanceFisico.
     * @param {AvanceFisicoDeleteArgs} args - Arguments to delete one AvanceFisico.
     * @example
     * // Delete one AvanceFisico
     * const AvanceFisico = await prisma.avanceFisico.delete({
     *   where: {
     *     // ... filter to delete one AvanceFisico
     *   }
     * })
     * 
     */
    delete<T extends AvanceFisicoDeleteArgs>(args: SelectSubset<T, AvanceFisicoDeleteArgs<ExtArgs>>): Prisma__AvanceFisicoClient<$Result.GetResult<Prisma.$AvanceFisicoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one AvanceFisico.
     * @param {AvanceFisicoUpdateArgs} args - Arguments to update one AvanceFisico.
     * @example
     * // Update one AvanceFisico
     * const avanceFisico = await prisma.avanceFisico.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AvanceFisicoUpdateArgs>(args: SelectSubset<T, AvanceFisicoUpdateArgs<ExtArgs>>): Prisma__AvanceFisicoClient<$Result.GetResult<Prisma.$AvanceFisicoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more AvanceFisicos.
     * @param {AvanceFisicoDeleteManyArgs} args - Arguments to filter AvanceFisicos to delete.
     * @example
     * // Delete a few AvanceFisicos
     * const { count } = await prisma.avanceFisico.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AvanceFisicoDeleteManyArgs>(args?: SelectSubset<T, AvanceFisicoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AvanceFisicos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AvanceFisicoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AvanceFisicos
     * const avanceFisico = await prisma.avanceFisico.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AvanceFisicoUpdateManyArgs>(args: SelectSubset<T, AvanceFisicoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one AvanceFisico.
     * @param {AvanceFisicoUpsertArgs} args - Arguments to update or create a AvanceFisico.
     * @example
     * // Update or create a AvanceFisico
     * const avanceFisico = await prisma.avanceFisico.upsert({
     *   create: {
     *     // ... data to create a AvanceFisico
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AvanceFisico we want to update
     *   }
     * })
     */
    upsert<T extends AvanceFisicoUpsertArgs>(args: SelectSubset<T, AvanceFisicoUpsertArgs<ExtArgs>>): Prisma__AvanceFisicoClient<$Result.GetResult<Prisma.$AvanceFisicoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of AvanceFisicos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AvanceFisicoCountArgs} args - Arguments to filter AvanceFisicos to count.
     * @example
     * // Count the number of AvanceFisicos
     * const count = await prisma.avanceFisico.count({
     *   where: {
     *     // ... the filter for the AvanceFisicos we want to count
     *   }
     * })
    **/
    count<T extends AvanceFisicoCountArgs>(
      args?: Subset<T, AvanceFisicoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AvanceFisicoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AvanceFisico.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AvanceFisicoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends AvanceFisicoAggregateArgs>(args: Subset<T, AvanceFisicoAggregateArgs>): Prisma.PrismaPromise<GetAvanceFisicoAggregateType<T>>

    /**
     * Group by AvanceFisico.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AvanceFisicoGroupByArgs} args - Group by arguments.
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
      T extends AvanceFisicoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AvanceFisicoGroupByArgs['orderBy'] }
        : { orderBy?: AvanceFisicoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, AvanceFisicoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAvanceFisicoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AvanceFisico model
   */
  readonly fields: AvanceFisicoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AvanceFisico.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AvanceFisicoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    estimacion<T extends AvanceFisico$estimacionArgs<ExtArgs> = {}>(args?: Subset<T, AvanceFisico$estimacionArgs<ExtArgs>>): Prisma__EstimacionClient<$Result.GetResult<Prisma.$EstimacionPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
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
   * Fields of the AvanceFisico model
   */ 
  interface AvanceFisicoFieldRefs {
    readonly id_avance: FieldRef<"AvanceFisico", 'String'>
    readonly tenant_id: FieldRef<"AvanceFisico", 'String'>
    readonly proyecto_id: FieldRef<"AvanceFisico", 'String'>
    readonly concepto_presupuesto: FieldRef<"AvanceFisico", 'String'>
    readonly descripcion_concepto: FieldRef<"AvanceFisico", 'String'>
    readonly cantidad_presupuestada: FieldRef<"AvanceFisico", 'Decimal'>
    readonly cantidad_anterior: FieldRef<"AvanceFisico", 'Decimal'>
    readonly cantidad_periodo: FieldRef<"AvanceFisico", 'Decimal'>
    readonly cantidad_acumulada: FieldRef<"AvanceFisico", 'Decimal'>
    readonly unidad: FieldRef<"AvanceFisico", 'String'>
    readonly precio_unitario: FieldRef<"AvanceFisico", 'Decimal'>
    readonly importe_periodo: FieldRef<"AvanceFisico", 'Decimal'>
    readonly importe_acumulado: FieldRef<"AvanceFisico", 'Decimal'>
    readonly porcentaje_avance: FieldRef<"AvanceFisico", 'Decimal'>
    readonly periodo_inicio: FieldRef<"AvanceFisico", 'DateTime'>
    readonly periodo_fin: FieldRef<"AvanceFisico", 'DateTime'>
    readonly registrado_por_id: FieldRef<"AvanceFisico", 'String'>
    readonly registrado_por_nombre: FieldRef<"AvanceFisico", 'String'>
    readonly validado_por_id: FieldRef<"AvanceFisico", 'String'>
    readonly validado_por_nombre: FieldRef<"AvanceFisico", 'String'>
    readonly estado: FieldRef<"AvanceFisico", 'String'>
    readonly estimacion_id: FieldRef<"AvanceFisico", 'String'>
    readonly created_at: FieldRef<"AvanceFisico", 'DateTime'>
    readonly updated_at: FieldRef<"AvanceFisico", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AvanceFisico findUnique
   */
  export type AvanceFisicoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AvanceFisico
     */
    select?: AvanceFisicoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AvanceFisicoInclude<ExtArgs> | null
    /**
     * Filter, which AvanceFisico to fetch.
     */
    where: AvanceFisicoWhereUniqueInput
  }

  /**
   * AvanceFisico findUniqueOrThrow
   */
  export type AvanceFisicoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AvanceFisico
     */
    select?: AvanceFisicoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AvanceFisicoInclude<ExtArgs> | null
    /**
     * Filter, which AvanceFisico to fetch.
     */
    where: AvanceFisicoWhereUniqueInput
  }

  /**
   * AvanceFisico findFirst
   */
  export type AvanceFisicoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AvanceFisico
     */
    select?: AvanceFisicoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AvanceFisicoInclude<ExtArgs> | null
    /**
     * Filter, which AvanceFisico to fetch.
     */
    where?: AvanceFisicoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AvanceFisicos to fetch.
     */
    orderBy?: AvanceFisicoOrderByWithRelationInput | AvanceFisicoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AvanceFisicos.
     */
    cursor?: AvanceFisicoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AvanceFisicos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AvanceFisicos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AvanceFisicos.
     */
    distinct?: AvanceFisicoScalarFieldEnum | AvanceFisicoScalarFieldEnum[]
  }

  /**
   * AvanceFisico findFirstOrThrow
   */
  export type AvanceFisicoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AvanceFisico
     */
    select?: AvanceFisicoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AvanceFisicoInclude<ExtArgs> | null
    /**
     * Filter, which AvanceFisico to fetch.
     */
    where?: AvanceFisicoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AvanceFisicos to fetch.
     */
    orderBy?: AvanceFisicoOrderByWithRelationInput | AvanceFisicoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AvanceFisicos.
     */
    cursor?: AvanceFisicoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AvanceFisicos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AvanceFisicos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AvanceFisicos.
     */
    distinct?: AvanceFisicoScalarFieldEnum | AvanceFisicoScalarFieldEnum[]
  }

  /**
   * AvanceFisico findMany
   */
  export type AvanceFisicoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AvanceFisico
     */
    select?: AvanceFisicoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AvanceFisicoInclude<ExtArgs> | null
    /**
     * Filter, which AvanceFisicos to fetch.
     */
    where?: AvanceFisicoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AvanceFisicos to fetch.
     */
    orderBy?: AvanceFisicoOrderByWithRelationInput | AvanceFisicoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AvanceFisicos.
     */
    cursor?: AvanceFisicoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AvanceFisicos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AvanceFisicos.
     */
    skip?: number
    distinct?: AvanceFisicoScalarFieldEnum | AvanceFisicoScalarFieldEnum[]
  }

  /**
   * AvanceFisico create
   */
  export type AvanceFisicoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AvanceFisico
     */
    select?: AvanceFisicoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AvanceFisicoInclude<ExtArgs> | null
    /**
     * The data needed to create a AvanceFisico.
     */
    data: XOR<AvanceFisicoCreateInput, AvanceFisicoUncheckedCreateInput>
  }

  /**
   * AvanceFisico createMany
   */
  export type AvanceFisicoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AvanceFisicos.
     */
    data: AvanceFisicoCreateManyInput | AvanceFisicoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AvanceFisico createManyAndReturn
   */
  export type AvanceFisicoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AvanceFisico
     */
    select?: AvanceFisicoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many AvanceFisicos.
     */
    data: AvanceFisicoCreateManyInput | AvanceFisicoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AvanceFisicoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * AvanceFisico update
   */
  export type AvanceFisicoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AvanceFisico
     */
    select?: AvanceFisicoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AvanceFisicoInclude<ExtArgs> | null
    /**
     * The data needed to update a AvanceFisico.
     */
    data: XOR<AvanceFisicoUpdateInput, AvanceFisicoUncheckedUpdateInput>
    /**
     * Choose, which AvanceFisico to update.
     */
    where: AvanceFisicoWhereUniqueInput
  }

  /**
   * AvanceFisico updateMany
   */
  export type AvanceFisicoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AvanceFisicos.
     */
    data: XOR<AvanceFisicoUpdateManyMutationInput, AvanceFisicoUncheckedUpdateManyInput>
    /**
     * Filter which AvanceFisicos to update
     */
    where?: AvanceFisicoWhereInput
  }

  /**
   * AvanceFisico upsert
   */
  export type AvanceFisicoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AvanceFisico
     */
    select?: AvanceFisicoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AvanceFisicoInclude<ExtArgs> | null
    /**
     * The filter to search for the AvanceFisico to update in case it exists.
     */
    where: AvanceFisicoWhereUniqueInput
    /**
     * In case the AvanceFisico found by the `where` argument doesn't exist, create a new AvanceFisico with this data.
     */
    create: XOR<AvanceFisicoCreateInput, AvanceFisicoUncheckedCreateInput>
    /**
     * In case the AvanceFisico was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AvanceFisicoUpdateInput, AvanceFisicoUncheckedUpdateInput>
  }

  /**
   * AvanceFisico delete
   */
  export type AvanceFisicoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AvanceFisico
     */
    select?: AvanceFisicoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AvanceFisicoInclude<ExtArgs> | null
    /**
     * Filter which AvanceFisico to delete.
     */
    where: AvanceFisicoWhereUniqueInput
  }

  /**
   * AvanceFisico deleteMany
   */
  export type AvanceFisicoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AvanceFisicos to delete
     */
    where?: AvanceFisicoWhereInput
  }

  /**
   * AvanceFisico.estimacion
   */
  export type AvanceFisico$estimacionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Estimacion
     */
    select?: EstimacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EstimacionInclude<ExtArgs> | null
    where?: EstimacionWhereInput
  }

  /**
   * AvanceFisico without action
   */
  export type AvanceFisicoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AvanceFisico
     */
    select?: AvanceFisicoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AvanceFisicoInclude<ExtArgs> | null
  }


  /**
   * Model Estimacion
   */

  export type AggregateEstimacion = {
    _count: EstimacionCountAggregateOutputType | null
    _avg: EstimacionAvgAggregateOutputType | null
    _sum: EstimacionSumAggregateOutputType | null
    _min: EstimacionMinAggregateOutputType | null
    _max: EstimacionMaxAggregateOutputType | null
  }

  export type EstimacionAvgAggregateOutputType = {
    numero_estimacion: number | null
    subtotal: Decimal | null
    retencion_fondo_garantia: Decimal | null
    amortizacion_anticipo: Decimal | null
    iva: Decimal | null
    total_neto: Decimal | null
  }

  export type EstimacionSumAggregateOutputType = {
    numero_estimacion: number | null
    subtotal: Decimal | null
    retencion_fondo_garantia: Decimal | null
    amortizacion_anticipo: Decimal | null
    iva: Decimal | null
    total_neto: Decimal | null
  }

  export type EstimacionMinAggregateOutputType = {
    id_estimacion: string | null
    tenant_id: string | null
    proyecto_id: string | null
    numero_estimacion: number | null
    codigo: string | null
    periodo_inicio: Date | null
    periodo_fin: Date | null
    subtotal: Decimal | null
    retencion_fondo_garantia: Decimal | null
    amortizacion_anticipo: Decimal | null
    iva: Decimal | null
    total_neto: Decimal | null
    estado: string | null
    elaborado_por_id: string | null
    elaborado_por_nombre: string | null
    revisado_por_id: string | null
    revisado_por_nombre: string | null
    aprobado_por_id: string | null
    aprobado_por_nombre: string | null
    fecha_aprobacion: Date | null
    notas: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type EstimacionMaxAggregateOutputType = {
    id_estimacion: string | null
    tenant_id: string | null
    proyecto_id: string | null
    numero_estimacion: number | null
    codigo: string | null
    periodo_inicio: Date | null
    periodo_fin: Date | null
    subtotal: Decimal | null
    retencion_fondo_garantia: Decimal | null
    amortizacion_anticipo: Decimal | null
    iva: Decimal | null
    total_neto: Decimal | null
    estado: string | null
    elaborado_por_id: string | null
    elaborado_por_nombre: string | null
    revisado_por_id: string | null
    revisado_por_nombre: string | null
    aprobado_por_id: string | null
    aprobado_por_nombre: string | null
    fecha_aprobacion: Date | null
    notas: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type EstimacionCountAggregateOutputType = {
    id_estimacion: number
    tenant_id: number
    proyecto_id: number
    numero_estimacion: number
    codigo: number
    periodo_inicio: number
    periodo_fin: number
    subtotal: number
    retencion_fondo_garantia: number
    amortizacion_anticipo: number
    iva: number
    total_neto: number
    estado: number
    elaborado_por_id: number
    elaborado_por_nombre: number
    revisado_por_id: number
    revisado_por_nombre: number
    aprobado_por_id: number
    aprobado_por_nombre: number
    fecha_aprobacion: number
    notas: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type EstimacionAvgAggregateInputType = {
    numero_estimacion?: true
    subtotal?: true
    retencion_fondo_garantia?: true
    amortizacion_anticipo?: true
    iva?: true
    total_neto?: true
  }

  export type EstimacionSumAggregateInputType = {
    numero_estimacion?: true
    subtotal?: true
    retencion_fondo_garantia?: true
    amortizacion_anticipo?: true
    iva?: true
    total_neto?: true
  }

  export type EstimacionMinAggregateInputType = {
    id_estimacion?: true
    tenant_id?: true
    proyecto_id?: true
    numero_estimacion?: true
    codigo?: true
    periodo_inicio?: true
    periodo_fin?: true
    subtotal?: true
    retencion_fondo_garantia?: true
    amortizacion_anticipo?: true
    iva?: true
    total_neto?: true
    estado?: true
    elaborado_por_id?: true
    elaborado_por_nombre?: true
    revisado_por_id?: true
    revisado_por_nombre?: true
    aprobado_por_id?: true
    aprobado_por_nombre?: true
    fecha_aprobacion?: true
    notas?: true
    created_at?: true
    updated_at?: true
  }

  export type EstimacionMaxAggregateInputType = {
    id_estimacion?: true
    tenant_id?: true
    proyecto_id?: true
    numero_estimacion?: true
    codigo?: true
    periodo_inicio?: true
    periodo_fin?: true
    subtotal?: true
    retencion_fondo_garantia?: true
    amortizacion_anticipo?: true
    iva?: true
    total_neto?: true
    estado?: true
    elaborado_por_id?: true
    elaborado_por_nombre?: true
    revisado_por_id?: true
    revisado_por_nombre?: true
    aprobado_por_id?: true
    aprobado_por_nombre?: true
    fecha_aprobacion?: true
    notas?: true
    created_at?: true
    updated_at?: true
  }

  export type EstimacionCountAggregateInputType = {
    id_estimacion?: true
    tenant_id?: true
    proyecto_id?: true
    numero_estimacion?: true
    codigo?: true
    periodo_inicio?: true
    periodo_fin?: true
    subtotal?: true
    retencion_fondo_garantia?: true
    amortizacion_anticipo?: true
    iva?: true
    total_neto?: true
    estado?: true
    elaborado_por_id?: true
    elaborado_por_nombre?: true
    revisado_por_id?: true
    revisado_por_nombre?: true
    aprobado_por_id?: true
    aprobado_por_nombre?: true
    fecha_aprobacion?: true
    notas?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type EstimacionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Estimacion to aggregate.
     */
    where?: EstimacionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Estimacions to fetch.
     */
    orderBy?: EstimacionOrderByWithRelationInput | EstimacionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: EstimacionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Estimacions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Estimacions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Estimacions
    **/
    _count?: true | EstimacionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: EstimacionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: EstimacionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: EstimacionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: EstimacionMaxAggregateInputType
  }

  export type GetEstimacionAggregateType<T extends EstimacionAggregateArgs> = {
        [P in keyof T & keyof AggregateEstimacion]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEstimacion[P]>
      : GetScalarType<T[P], AggregateEstimacion[P]>
  }




  export type EstimacionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EstimacionWhereInput
    orderBy?: EstimacionOrderByWithAggregationInput | EstimacionOrderByWithAggregationInput[]
    by: EstimacionScalarFieldEnum[] | EstimacionScalarFieldEnum
    having?: EstimacionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: EstimacionCountAggregateInputType | true
    _avg?: EstimacionAvgAggregateInputType
    _sum?: EstimacionSumAggregateInputType
    _min?: EstimacionMinAggregateInputType
    _max?: EstimacionMaxAggregateInputType
  }

  export type EstimacionGroupByOutputType = {
    id_estimacion: string
    tenant_id: string
    proyecto_id: string
    numero_estimacion: number
    codigo: string
    periodo_inicio: Date
    periodo_fin: Date
    subtotal: Decimal
    retencion_fondo_garantia: Decimal
    amortizacion_anticipo: Decimal
    iva: Decimal
    total_neto: Decimal
    estado: string
    elaborado_por_id: string
    elaborado_por_nombre: string
    revisado_por_id: string | null
    revisado_por_nombre: string | null
    aprobado_por_id: string | null
    aprobado_por_nombre: string | null
    fecha_aprobacion: Date | null
    notas: string | null
    created_at: Date
    updated_at: Date
    _count: EstimacionCountAggregateOutputType | null
    _avg: EstimacionAvgAggregateOutputType | null
    _sum: EstimacionSumAggregateOutputType | null
    _min: EstimacionMinAggregateOutputType | null
    _max: EstimacionMaxAggregateOutputType | null
  }

  type GetEstimacionGroupByPayload<T extends EstimacionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<EstimacionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof EstimacionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], EstimacionGroupByOutputType[P]>
            : GetScalarType<T[P], EstimacionGroupByOutputType[P]>
        }
      >
    >


  export type EstimacionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_estimacion?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    numero_estimacion?: boolean
    codigo?: boolean
    periodo_inicio?: boolean
    periodo_fin?: boolean
    subtotal?: boolean
    retencion_fondo_garantia?: boolean
    amortizacion_anticipo?: boolean
    iva?: boolean
    total_neto?: boolean
    estado?: boolean
    elaborado_por_id?: boolean
    elaborado_por_nombre?: boolean
    revisado_por_id?: boolean
    revisado_por_nombre?: boolean
    aprobado_por_id?: boolean
    aprobado_por_nombre?: boolean
    fecha_aprobacion?: boolean
    notas?: boolean
    created_at?: boolean
    updated_at?: boolean
    avances?: boolean | Estimacion$avancesArgs<ExtArgs>
    _count?: boolean | EstimacionCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["estimacion"]>

  export type EstimacionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_estimacion?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    numero_estimacion?: boolean
    codigo?: boolean
    periodo_inicio?: boolean
    periodo_fin?: boolean
    subtotal?: boolean
    retencion_fondo_garantia?: boolean
    amortizacion_anticipo?: boolean
    iva?: boolean
    total_neto?: boolean
    estado?: boolean
    elaborado_por_id?: boolean
    elaborado_por_nombre?: boolean
    revisado_por_id?: boolean
    revisado_por_nombre?: boolean
    aprobado_por_id?: boolean
    aprobado_por_nombre?: boolean
    fecha_aprobacion?: boolean
    notas?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["estimacion"]>

  export type EstimacionSelectScalar = {
    id_estimacion?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    numero_estimacion?: boolean
    codigo?: boolean
    periodo_inicio?: boolean
    periodo_fin?: boolean
    subtotal?: boolean
    retencion_fondo_garantia?: boolean
    amortizacion_anticipo?: boolean
    iva?: boolean
    total_neto?: boolean
    estado?: boolean
    elaborado_por_id?: boolean
    elaborado_por_nombre?: boolean
    revisado_por_id?: boolean
    revisado_por_nombre?: boolean
    aprobado_por_id?: boolean
    aprobado_por_nombre?: boolean
    fecha_aprobacion?: boolean
    notas?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type EstimacionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    avances?: boolean | Estimacion$avancesArgs<ExtArgs>
    _count?: boolean | EstimacionCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type EstimacionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $EstimacionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Estimacion"
    objects: {
      avances: Prisma.$AvanceFisicoPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id_estimacion: string
      tenant_id: string
      proyecto_id: string
      numero_estimacion: number
      codigo: string
      periodo_inicio: Date
      periodo_fin: Date
      subtotal: Prisma.Decimal
      retencion_fondo_garantia: Prisma.Decimal
      amortizacion_anticipo: Prisma.Decimal
      iva: Prisma.Decimal
      total_neto: Prisma.Decimal
      estado: string
      elaborado_por_id: string
      elaborado_por_nombre: string
      revisado_por_id: string | null
      revisado_por_nombre: string | null
      aprobado_por_id: string | null
      aprobado_por_nombre: string | null
      fecha_aprobacion: Date | null
      notas: string | null
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["estimacion"]>
    composites: {}
  }

  type EstimacionGetPayload<S extends boolean | null | undefined | EstimacionDefaultArgs> = $Result.GetResult<Prisma.$EstimacionPayload, S>

  type EstimacionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<EstimacionFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: EstimacionCountAggregateInputType | true
    }

  export interface EstimacionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Estimacion'], meta: { name: 'Estimacion' } }
    /**
     * Find zero or one Estimacion that matches the filter.
     * @param {EstimacionFindUniqueArgs} args - Arguments to find a Estimacion
     * @example
     * // Get one Estimacion
     * const estimacion = await prisma.estimacion.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends EstimacionFindUniqueArgs>(args: SelectSubset<T, EstimacionFindUniqueArgs<ExtArgs>>): Prisma__EstimacionClient<$Result.GetResult<Prisma.$EstimacionPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Estimacion that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {EstimacionFindUniqueOrThrowArgs} args - Arguments to find a Estimacion
     * @example
     * // Get one Estimacion
     * const estimacion = await prisma.estimacion.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends EstimacionFindUniqueOrThrowArgs>(args: SelectSubset<T, EstimacionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__EstimacionClient<$Result.GetResult<Prisma.$EstimacionPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Estimacion that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EstimacionFindFirstArgs} args - Arguments to find a Estimacion
     * @example
     * // Get one Estimacion
     * const estimacion = await prisma.estimacion.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends EstimacionFindFirstArgs>(args?: SelectSubset<T, EstimacionFindFirstArgs<ExtArgs>>): Prisma__EstimacionClient<$Result.GetResult<Prisma.$EstimacionPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Estimacion that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EstimacionFindFirstOrThrowArgs} args - Arguments to find a Estimacion
     * @example
     * // Get one Estimacion
     * const estimacion = await prisma.estimacion.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends EstimacionFindFirstOrThrowArgs>(args?: SelectSubset<T, EstimacionFindFirstOrThrowArgs<ExtArgs>>): Prisma__EstimacionClient<$Result.GetResult<Prisma.$EstimacionPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Estimacions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EstimacionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Estimacions
     * const estimacions = await prisma.estimacion.findMany()
     * 
     * // Get first 10 Estimacions
     * const estimacions = await prisma.estimacion.findMany({ take: 10 })
     * 
     * // Only select the `id_estimacion`
     * const estimacionWithId_estimacionOnly = await prisma.estimacion.findMany({ select: { id_estimacion: true } })
     * 
     */
    findMany<T extends EstimacionFindManyArgs>(args?: SelectSubset<T, EstimacionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EstimacionPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Estimacion.
     * @param {EstimacionCreateArgs} args - Arguments to create a Estimacion.
     * @example
     * // Create one Estimacion
     * const Estimacion = await prisma.estimacion.create({
     *   data: {
     *     // ... data to create a Estimacion
     *   }
     * })
     * 
     */
    create<T extends EstimacionCreateArgs>(args: SelectSubset<T, EstimacionCreateArgs<ExtArgs>>): Prisma__EstimacionClient<$Result.GetResult<Prisma.$EstimacionPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Estimacions.
     * @param {EstimacionCreateManyArgs} args - Arguments to create many Estimacions.
     * @example
     * // Create many Estimacions
     * const estimacion = await prisma.estimacion.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends EstimacionCreateManyArgs>(args?: SelectSubset<T, EstimacionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Estimacions and returns the data saved in the database.
     * @param {EstimacionCreateManyAndReturnArgs} args - Arguments to create many Estimacions.
     * @example
     * // Create many Estimacions
     * const estimacion = await prisma.estimacion.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Estimacions and only return the `id_estimacion`
     * const estimacionWithId_estimacionOnly = await prisma.estimacion.createManyAndReturn({ 
     *   select: { id_estimacion: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends EstimacionCreateManyAndReturnArgs>(args?: SelectSubset<T, EstimacionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EstimacionPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Estimacion.
     * @param {EstimacionDeleteArgs} args - Arguments to delete one Estimacion.
     * @example
     * // Delete one Estimacion
     * const Estimacion = await prisma.estimacion.delete({
     *   where: {
     *     // ... filter to delete one Estimacion
     *   }
     * })
     * 
     */
    delete<T extends EstimacionDeleteArgs>(args: SelectSubset<T, EstimacionDeleteArgs<ExtArgs>>): Prisma__EstimacionClient<$Result.GetResult<Prisma.$EstimacionPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Estimacion.
     * @param {EstimacionUpdateArgs} args - Arguments to update one Estimacion.
     * @example
     * // Update one Estimacion
     * const estimacion = await prisma.estimacion.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends EstimacionUpdateArgs>(args: SelectSubset<T, EstimacionUpdateArgs<ExtArgs>>): Prisma__EstimacionClient<$Result.GetResult<Prisma.$EstimacionPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Estimacions.
     * @param {EstimacionDeleteManyArgs} args - Arguments to filter Estimacions to delete.
     * @example
     * // Delete a few Estimacions
     * const { count } = await prisma.estimacion.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends EstimacionDeleteManyArgs>(args?: SelectSubset<T, EstimacionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Estimacions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EstimacionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Estimacions
     * const estimacion = await prisma.estimacion.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends EstimacionUpdateManyArgs>(args: SelectSubset<T, EstimacionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Estimacion.
     * @param {EstimacionUpsertArgs} args - Arguments to update or create a Estimacion.
     * @example
     * // Update or create a Estimacion
     * const estimacion = await prisma.estimacion.upsert({
     *   create: {
     *     // ... data to create a Estimacion
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Estimacion we want to update
     *   }
     * })
     */
    upsert<T extends EstimacionUpsertArgs>(args: SelectSubset<T, EstimacionUpsertArgs<ExtArgs>>): Prisma__EstimacionClient<$Result.GetResult<Prisma.$EstimacionPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Estimacions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EstimacionCountArgs} args - Arguments to filter Estimacions to count.
     * @example
     * // Count the number of Estimacions
     * const count = await prisma.estimacion.count({
     *   where: {
     *     // ... the filter for the Estimacions we want to count
     *   }
     * })
    **/
    count<T extends EstimacionCountArgs>(
      args?: Subset<T, EstimacionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], EstimacionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Estimacion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EstimacionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends EstimacionAggregateArgs>(args: Subset<T, EstimacionAggregateArgs>): Prisma.PrismaPromise<GetEstimacionAggregateType<T>>

    /**
     * Group by Estimacion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EstimacionGroupByArgs} args - Group by arguments.
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
      T extends EstimacionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: EstimacionGroupByArgs['orderBy'] }
        : { orderBy?: EstimacionGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, EstimacionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEstimacionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Estimacion model
   */
  readonly fields: EstimacionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Estimacion.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__EstimacionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    avances<T extends Estimacion$avancesArgs<ExtArgs> = {}>(args?: Subset<T, Estimacion$avancesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AvanceFisicoPayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the Estimacion model
   */ 
  interface EstimacionFieldRefs {
    readonly id_estimacion: FieldRef<"Estimacion", 'String'>
    readonly tenant_id: FieldRef<"Estimacion", 'String'>
    readonly proyecto_id: FieldRef<"Estimacion", 'String'>
    readonly numero_estimacion: FieldRef<"Estimacion", 'Int'>
    readonly codigo: FieldRef<"Estimacion", 'String'>
    readonly periodo_inicio: FieldRef<"Estimacion", 'DateTime'>
    readonly periodo_fin: FieldRef<"Estimacion", 'DateTime'>
    readonly subtotal: FieldRef<"Estimacion", 'Decimal'>
    readonly retencion_fondo_garantia: FieldRef<"Estimacion", 'Decimal'>
    readonly amortizacion_anticipo: FieldRef<"Estimacion", 'Decimal'>
    readonly iva: FieldRef<"Estimacion", 'Decimal'>
    readonly total_neto: FieldRef<"Estimacion", 'Decimal'>
    readonly estado: FieldRef<"Estimacion", 'String'>
    readonly elaborado_por_id: FieldRef<"Estimacion", 'String'>
    readonly elaborado_por_nombre: FieldRef<"Estimacion", 'String'>
    readonly revisado_por_id: FieldRef<"Estimacion", 'String'>
    readonly revisado_por_nombre: FieldRef<"Estimacion", 'String'>
    readonly aprobado_por_id: FieldRef<"Estimacion", 'String'>
    readonly aprobado_por_nombre: FieldRef<"Estimacion", 'String'>
    readonly fecha_aprobacion: FieldRef<"Estimacion", 'DateTime'>
    readonly notas: FieldRef<"Estimacion", 'String'>
    readonly created_at: FieldRef<"Estimacion", 'DateTime'>
    readonly updated_at: FieldRef<"Estimacion", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Estimacion findUnique
   */
  export type EstimacionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Estimacion
     */
    select?: EstimacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EstimacionInclude<ExtArgs> | null
    /**
     * Filter, which Estimacion to fetch.
     */
    where: EstimacionWhereUniqueInput
  }

  /**
   * Estimacion findUniqueOrThrow
   */
  export type EstimacionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Estimacion
     */
    select?: EstimacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EstimacionInclude<ExtArgs> | null
    /**
     * Filter, which Estimacion to fetch.
     */
    where: EstimacionWhereUniqueInput
  }

  /**
   * Estimacion findFirst
   */
  export type EstimacionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Estimacion
     */
    select?: EstimacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EstimacionInclude<ExtArgs> | null
    /**
     * Filter, which Estimacion to fetch.
     */
    where?: EstimacionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Estimacions to fetch.
     */
    orderBy?: EstimacionOrderByWithRelationInput | EstimacionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Estimacions.
     */
    cursor?: EstimacionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Estimacions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Estimacions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Estimacions.
     */
    distinct?: EstimacionScalarFieldEnum | EstimacionScalarFieldEnum[]
  }

  /**
   * Estimacion findFirstOrThrow
   */
  export type EstimacionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Estimacion
     */
    select?: EstimacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EstimacionInclude<ExtArgs> | null
    /**
     * Filter, which Estimacion to fetch.
     */
    where?: EstimacionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Estimacions to fetch.
     */
    orderBy?: EstimacionOrderByWithRelationInput | EstimacionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Estimacions.
     */
    cursor?: EstimacionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Estimacions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Estimacions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Estimacions.
     */
    distinct?: EstimacionScalarFieldEnum | EstimacionScalarFieldEnum[]
  }

  /**
   * Estimacion findMany
   */
  export type EstimacionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Estimacion
     */
    select?: EstimacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EstimacionInclude<ExtArgs> | null
    /**
     * Filter, which Estimacions to fetch.
     */
    where?: EstimacionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Estimacions to fetch.
     */
    orderBy?: EstimacionOrderByWithRelationInput | EstimacionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Estimacions.
     */
    cursor?: EstimacionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Estimacions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Estimacions.
     */
    skip?: number
    distinct?: EstimacionScalarFieldEnum | EstimacionScalarFieldEnum[]
  }

  /**
   * Estimacion create
   */
  export type EstimacionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Estimacion
     */
    select?: EstimacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EstimacionInclude<ExtArgs> | null
    /**
     * The data needed to create a Estimacion.
     */
    data: XOR<EstimacionCreateInput, EstimacionUncheckedCreateInput>
  }

  /**
   * Estimacion createMany
   */
  export type EstimacionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Estimacions.
     */
    data: EstimacionCreateManyInput | EstimacionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Estimacion createManyAndReturn
   */
  export type EstimacionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Estimacion
     */
    select?: EstimacionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Estimacions.
     */
    data: EstimacionCreateManyInput | EstimacionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Estimacion update
   */
  export type EstimacionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Estimacion
     */
    select?: EstimacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EstimacionInclude<ExtArgs> | null
    /**
     * The data needed to update a Estimacion.
     */
    data: XOR<EstimacionUpdateInput, EstimacionUncheckedUpdateInput>
    /**
     * Choose, which Estimacion to update.
     */
    where: EstimacionWhereUniqueInput
  }

  /**
   * Estimacion updateMany
   */
  export type EstimacionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Estimacions.
     */
    data: XOR<EstimacionUpdateManyMutationInput, EstimacionUncheckedUpdateManyInput>
    /**
     * Filter which Estimacions to update
     */
    where?: EstimacionWhereInput
  }

  /**
   * Estimacion upsert
   */
  export type EstimacionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Estimacion
     */
    select?: EstimacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EstimacionInclude<ExtArgs> | null
    /**
     * The filter to search for the Estimacion to update in case it exists.
     */
    where: EstimacionWhereUniqueInput
    /**
     * In case the Estimacion found by the `where` argument doesn't exist, create a new Estimacion with this data.
     */
    create: XOR<EstimacionCreateInput, EstimacionUncheckedCreateInput>
    /**
     * In case the Estimacion was found with the provided `where` argument, update it with this data.
     */
    update: XOR<EstimacionUpdateInput, EstimacionUncheckedUpdateInput>
  }

  /**
   * Estimacion delete
   */
  export type EstimacionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Estimacion
     */
    select?: EstimacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EstimacionInclude<ExtArgs> | null
    /**
     * Filter which Estimacion to delete.
     */
    where: EstimacionWhereUniqueInput
  }

  /**
   * Estimacion deleteMany
   */
  export type EstimacionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Estimacions to delete
     */
    where?: EstimacionWhereInput
  }

  /**
   * Estimacion.avances
   */
  export type Estimacion$avancesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AvanceFisico
     */
    select?: AvanceFisicoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AvanceFisicoInclude<ExtArgs> | null
    where?: AvanceFisicoWhereInput
    orderBy?: AvanceFisicoOrderByWithRelationInput | AvanceFisicoOrderByWithRelationInput[]
    cursor?: AvanceFisicoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AvanceFisicoScalarFieldEnum | AvanceFisicoScalarFieldEnum[]
  }

  /**
   * Estimacion without action
   */
  export type EstimacionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Estimacion
     */
    select?: EstimacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EstimacionInclude<ExtArgs> | null
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


  export const BitacoraObraScalarFieldEnum: {
    id_bitacora: 'id_bitacora',
    tenant_id: 'tenant_id',
    proyecto_id: 'proyecto_id',
    numero_entrada: 'numero_entrada',
    fecha: 'fecha',
    frente_trabajo: 'frente_trabajo',
    turno: 'turno',
    clima: 'clima',
    temperatura_c: 'temperatura_c',
    actividades_realizadas: 'actividades_realizadas',
    personal_en_sitio: 'personal_en_sitio',
    incidencias: 'incidencias',
    material_recibido: 'material_recibido',
    observaciones: 'observaciones',
    residente_id: 'residente_id',
    residente_nombre: 'residente_nombre',
    superintendente_id: 'superintendente_id',
    estado: 'estado',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type BitacoraObraScalarFieldEnum = (typeof BitacoraObraScalarFieldEnum)[keyof typeof BitacoraObraScalarFieldEnum]


  export const AvanceFisicoScalarFieldEnum: {
    id_avance: 'id_avance',
    tenant_id: 'tenant_id',
    proyecto_id: 'proyecto_id',
    concepto_presupuesto: 'concepto_presupuesto',
    descripcion_concepto: 'descripcion_concepto',
    cantidad_presupuestada: 'cantidad_presupuestada',
    cantidad_anterior: 'cantidad_anterior',
    cantidad_periodo: 'cantidad_periodo',
    cantidad_acumulada: 'cantidad_acumulada',
    unidad: 'unidad',
    precio_unitario: 'precio_unitario',
    importe_periodo: 'importe_periodo',
    importe_acumulado: 'importe_acumulado',
    porcentaje_avance: 'porcentaje_avance',
    periodo_inicio: 'periodo_inicio',
    periodo_fin: 'periodo_fin',
    registrado_por_id: 'registrado_por_id',
    registrado_por_nombre: 'registrado_por_nombre',
    validado_por_id: 'validado_por_id',
    validado_por_nombre: 'validado_por_nombre',
    estado: 'estado',
    estimacion_id: 'estimacion_id',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type AvanceFisicoScalarFieldEnum = (typeof AvanceFisicoScalarFieldEnum)[keyof typeof AvanceFisicoScalarFieldEnum]


  export const EstimacionScalarFieldEnum: {
    id_estimacion: 'id_estimacion',
    tenant_id: 'tenant_id',
    proyecto_id: 'proyecto_id',
    numero_estimacion: 'numero_estimacion',
    codigo: 'codigo',
    periodo_inicio: 'periodo_inicio',
    periodo_fin: 'periodo_fin',
    subtotal: 'subtotal',
    retencion_fondo_garantia: 'retencion_fondo_garantia',
    amortizacion_anticipo: 'amortizacion_anticipo',
    iva: 'iva',
    total_neto: 'total_neto',
    estado: 'estado',
    elaborado_por_id: 'elaborado_por_id',
    elaborado_por_nombre: 'elaborado_por_nombre',
    revisado_por_id: 'revisado_por_id',
    revisado_por_nombre: 'revisado_por_nombre',
    aprobado_por_id: 'aprobado_por_id',
    aprobado_por_nombre: 'aprobado_por_nombre',
    fecha_aprobacion: 'fecha_aprobacion',
    notas: 'notas',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type EstimacionScalarFieldEnum = (typeof EstimacionScalarFieldEnum)[keyof typeof EstimacionScalarFieldEnum]


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
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'Decimal[]'
   */
  export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal[]'>
    


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


  export type BitacoraObraWhereInput = {
    AND?: BitacoraObraWhereInput | BitacoraObraWhereInput[]
    OR?: BitacoraObraWhereInput[]
    NOT?: BitacoraObraWhereInput | BitacoraObraWhereInput[]
    id_bitacora?: UuidFilter<"BitacoraObra"> | string
    tenant_id?: UuidFilter<"BitacoraObra"> | string
    proyecto_id?: UuidFilter<"BitacoraObra"> | string
    numero_entrada?: IntFilter<"BitacoraObra"> | number
    fecha?: DateTimeFilter<"BitacoraObra"> | Date | string
    frente_trabajo?: StringFilter<"BitacoraObra"> | string
    turno?: StringFilter<"BitacoraObra"> | string
    clima?: StringNullableFilter<"BitacoraObra"> | string | null
    temperatura_c?: DecimalNullableFilter<"BitacoraObra"> | Decimal | DecimalJsLike | number | string | null
    actividades_realizadas?: StringFilter<"BitacoraObra"> | string
    personal_en_sitio?: IntFilter<"BitacoraObra"> | number
    incidencias?: StringNullableFilter<"BitacoraObra"> | string | null
    material_recibido?: StringNullableFilter<"BitacoraObra"> | string | null
    observaciones?: StringNullableFilter<"BitacoraObra"> | string | null
    residente_id?: UuidFilter<"BitacoraObra"> | string
    residente_nombre?: StringFilter<"BitacoraObra"> | string
    superintendente_id?: UuidNullableFilter<"BitacoraObra"> | string | null
    estado?: StringFilter<"BitacoraObra"> | string
    created_at?: DateTimeFilter<"BitacoraObra"> | Date | string
    updated_at?: DateTimeFilter<"BitacoraObra"> | Date | string
  }

  export type BitacoraObraOrderByWithRelationInput = {
    id_bitacora?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    numero_entrada?: SortOrder
    fecha?: SortOrder
    frente_trabajo?: SortOrder
    turno?: SortOrder
    clima?: SortOrderInput | SortOrder
    temperatura_c?: SortOrderInput | SortOrder
    actividades_realizadas?: SortOrder
    personal_en_sitio?: SortOrder
    incidencias?: SortOrderInput | SortOrder
    material_recibido?: SortOrderInput | SortOrder
    observaciones?: SortOrderInput | SortOrder
    residente_id?: SortOrder
    residente_nombre?: SortOrder
    superintendente_id?: SortOrderInput | SortOrder
    estado?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type BitacoraObraWhereUniqueInput = Prisma.AtLeast<{
    id_bitacora?: string
    tenant_id_proyecto_id_numero_entrada?: BitacoraObraTenant_idProyecto_idNumero_entradaCompoundUniqueInput
    AND?: BitacoraObraWhereInput | BitacoraObraWhereInput[]
    OR?: BitacoraObraWhereInput[]
    NOT?: BitacoraObraWhereInput | BitacoraObraWhereInput[]
    tenant_id?: UuidFilter<"BitacoraObra"> | string
    proyecto_id?: UuidFilter<"BitacoraObra"> | string
    numero_entrada?: IntFilter<"BitacoraObra"> | number
    fecha?: DateTimeFilter<"BitacoraObra"> | Date | string
    frente_trabajo?: StringFilter<"BitacoraObra"> | string
    turno?: StringFilter<"BitacoraObra"> | string
    clima?: StringNullableFilter<"BitacoraObra"> | string | null
    temperatura_c?: DecimalNullableFilter<"BitacoraObra"> | Decimal | DecimalJsLike | number | string | null
    actividades_realizadas?: StringFilter<"BitacoraObra"> | string
    personal_en_sitio?: IntFilter<"BitacoraObra"> | number
    incidencias?: StringNullableFilter<"BitacoraObra"> | string | null
    material_recibido?: StringNullableFilter<"BitacoraObra"> | string | null
    observaciones?: StringNullableFilter<"BitacoraObra"> | string | null
    residente_id?: UuidFilter<"BitacoraObra"> | string
    residente_nombre?: StringFilter<"BitacoraObra"> | string
    superintendente_id?: UuidNullableFilter<"BitacoraObra"> | string | null
    estado?: StringFilter<"BitacoraObra"> | string
    created_at?: DateTimeFilter<"BitacoraObra"> | Date | string
    updated_at?: DateTimeFilter<"BitacoraObra"> | Date | string
  }, "id_bitacora" | "tenant_id_proyecto_id_numero_entrada">

  export type BitacoraObraOrderByWithAggregationInput = {
    id_bitacora?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    numero_entrada?: SortOrder
    fecha?: SortOrder
    frente_trabajo?: SortOrder
    turno?: SortOrder
    clima?: SortOrderInput | SortOrder
    temperatura_c?: SortOrderInput | SortOrder
    actividades_realizadas?: SortOrder
    personal_en_sitio?: SortOrder
    incidencias?: SortOrderInput | SortOrder
    material_recibido?: SortOrderInput | SortOrder
    observaciones?: SortOrderInput | SortOrder
    residente_id?: SortOrder
    residente_nombre?: SortOrder
    superintendente_id?: SortOrderInput | SortOrder
    estado?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: BitacoraObraCountOrderByAggregateInput
    _avg?: BitacoraObraAvgOrderByAggregateInput
    _max?: BitacoraObraMaxOrderByAggregateInput
    _min?: BitacoraObraMinOrderByAggregateInput
    _sum?: BitacoraObraSumOrderByAggregateInput
  }

  export type BitacoraObraScalarWhereWithAggregatesInput = {
    AND?: BitacoraObraScalarWhereWithAggregatesInput | BitacoraObraScalarWhereWithAggregatesInput[]
    OR?: BitacoraObraScalarWhereWithAggregatesInput[]
    NOT?: BitacoraObraScalarWhereWithAggregatesInput | BitacoraObraScalarWhereWithAggregatesInput[]
    id_bitacora?: UuidWithAggregatesFilter<"BitacoraObra"> | string
    tenant_id?: UuidWithAggregatesFilter<"BitacoraObra"> | string
    proyecto_id?: UuidWithAggregatesFilter<"BitacoraObra"> | string
    numero_entrada?: IntWithAggregatesFilter<"BitacoraObra"> | number
    fecha?: DateTimeWithAggregatesFilter<"BitacoraObra"> | Date | string
    frente_trabajo?: StringWithAggregatesFilter<"BitacoraObra"> | string
    turno?: StringWithAggregatesFilter<"BitacoraObra"> | string
    clima?: StringNullableWithAggregatesFilter<"BitacoraObra"> | string | null
    temperatura_c?: DecimalNullableWithAggregatesFilter<"BitacoraObra"> | Decimal | DecimalJsLike | number | string | null
    actividades_realizadas?: StringWithAggregatesFilter<"BitacoraObra"> | string
    personal_en_sitio?: IntWithAggregatesFilter<"BitacoraObra"> | number
    incidencias?: StringNullableWithAggregatesFilter<"BitacoraObra"> | string | null
    material_recibido?: StringNullableWithAggregatesFilter<"BitacoraObra"> | string | null
    observaciones?: StringNullableWithAggregatesFilter<"BitacoraObra"> | string | null
    residente_id?: UuidWithAggregatesFilter<"BitacoraObra"> | string
    residente_nombre?: StringWithAggregatesFilter<"BitacoraObra"> | string
    superintendente_id?: UuidNullableWithAggregatesFilter<"BitacoraObra"> | string | null
    estado?: StringWithAggregatesFilter<"BitacoraObra"> | string
    created_at?: DateTimeWithAggregatesFilter<"BitacoraObra"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"BitacoraObra"> | Date | string
  }

  export type AvanceFisicoWhereInput = {
    AND?: AvanceFisicoWhereInput | AvanceFisicoWhereInput[]
    OR?: AvanceFisicoWhereInput[]
    NOT?: AvanceFisicoWhereInput | AvanceFisicoWhereInput[]
    id_avance?: UuidFilter<"AvanceFisico"> | string
    tenant_id?: UuidFilter<"AvanceFisico"> | string
    proyecto_id?: UuidFilter<"AvanceFisico"> | string
    concepto_presupuesto?: StringFilter<"AvanceFisico"> | string
    descripcion_concepto?: StringFilter<"AvanceFisico"> | string
    cantidad_presupuestada?: DecimalFilter<"AvanceFisico"> | Decimal | DecimalJsLike | number | string
    cantidad_anterior?: DecimalFilter<"AvanceFisico"> | Decimal | DecimalJsLike | number | string
    cantidad_periodo?: DecimalFilter<"AvanceFisico"> | Decimal | DecimalJsLike | number | string
    cantidad_acumulada?: DecimalFilter<"AvanceFisico"> | Decimal | DecimalJsLike | number | string
    unidad?: StringFilter<"AvanceFisico"> | string
    precio_unitario?: DecimalFilter<"AvanceFisico"> | Decimal | DecimalJsLike | number | string
    importe_periodo?: DecimalFilter<"AvanceFisico"> | Decimal | DecimalJsLike | number | string
    importe_acumulado?: DecimalFilter<"AvanceFisico"> | Decimal | DecimalJsLike | number | string
    porcentaje_avance?: DecimalFilter<"AvanceFisico"> | Decimal | DecimalJsLike | number | string
    periodo_inicio?: DateTimeFilter<"AvanceFisico"> | Date | string
    periodo_fin?: DateTimeFilter<"AvanceFisico"> | Date | string
    registrado_por_id?: UuidFilter<"AvanceFisico"> | string
    registrado_por_nombre?: StringFilter<"AvanceFisico"> | string
    validado_por_id?: UuidNullableFilter<"AvanceFisico"> | string | null
    validado_por_nombre?: StringNullableFilter<"AvanceFisico"> | string | null
    estado?: StringFilter<"AvanceFisico"> | string
    estimacion_id?: UuidNullableFilter<"AvanceFisico"> | string | null
    created_at?: DateTimeFilter<"AvanceFisico"> | Date | string
    updated_at?: DateTimeFilter<"AvanceFisico"> | Date | string
    estimacion?: XOR<EstimacionNullableRelationFilter, EstimacionWhereInput> | null
  }

  export type AvanceFisicoOrderByWithRelationInput = {
    id_avance?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    concepto_presupuesto?: SortOrder
    descripcion_concepto?: SortOrder
    cantidad_presupuestada?: SortOrder
    cantidad_anterior?: SortOrder
    cantidad_periodo?: SortOrder
    cantidad_acumulada?: SortOrder
    unidad?: SortOrder
    precio_unitario?: SortOrder
    importe_periodo?: SortOrder
    importe_acumulado?: SortOrder
    porcentaje_avance?: SortOrder
    periodo_inicio?: SortOrder
    periodo_fin?: SortOrder
    registrado_por_id?: SortOrder
    registrado_por_nombre?: SortOrder
    validado_por_id?: SortOrderInput | SortOrder
    validado_por_nombre?: SortOrderInput | SortOrder
    estado?: SortOrder
    estimacion_id?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    estimacion?: EstimacionOrderByWithRelationInput
  }

  export type AvanceFisicoWhereUniqueInput = Prisma.AtLeast<{
    id_avance?: string
    AND?: AvanceFisicoWhereInput | AvanceFisicoWhereInput[]
    OR?: AvanceFisicoWhereInput[]
    NOT?: AvanceFisicoWhereInput | AvanceFisicoWhereInput[]
    tenant_id?: UuidFilter<"AvanceFisico"> | string
    proyecto_id?: UuidFilter<"AvanceFisico"> | string
    concepto_presupuesto?: StringFilter<"AvanceFisico"> | string
    descripcion_concepto?: StringFilter<"AvanceFisico"> | string
    cantidad_presupuestada?: DecimalFilter<"AvanceFisico"> | Decimal | DecimalJsLike | number | string
    cantidad_anterior?: DecimalFilter<"AvanceFisico"> | Decimal | DecimalJsLike | number | string
    cantidad_periodo?: DecimalFilter<"AvanceFisico"> | Decimal | DecimalJsLike | number | string
    cantidad_acumulada?: DecimalFilter<"AvanceFisico"> | Decimal | DecimalJsLike | number | string
    unidad?: StringFilter<"AvanceFisico"> | string
    precio_unitario?: DecimalFilter<"AvanceFisico"> | Decimal | DecimalJsLike | number | string
    importe_periodo?: DecimalFilter<"AvanceFisico"> | Decimal | DecimalJsLike | number | string
    importe_acumulado?: DecimalFilter<"AvanceFisico"> | Decimal | DecimalJsLike | number | string
    porcentaje_avance?: DecimalFilter<"AvanceFisico"> | Decimal | DecimalJsLike | number | string
    periodo_inicio?: DateTimeFilter<"AvanceFisico"> | Date | string
    periodo_fin?: DateTimeFilter<"AvanceFisico"> | Date | string
    registrado_por_id?: UuidFilter<"AvanceFisico"> | string
    registrado_por_nombre?: StringFilter<"AvanceFisico"> | string
    validado_por_id?: UuidNullableFilter<"AvanceFisico"> | string | null
    validado_por_nombre?: StringNullableFilter<"AvanceFisico"> | string | null
    estado?: StringFilter<"AvanceFisico"> | string
    estimacion_id?: UuidNullableFilter<"AvanceFisico"> | string | null
    created_at?: DateTimeFilter<"AvanceFisico"> | Date | string
    updated_at?: DateTimeFilter<"AvanceFisico"> | Date | string
    estimacion?: XOR<EstimacionNullableRelationFilter, EstimacionWhereInput> | null
  }, "id_avance">

  export type AvanceFisicoOrderByWithAggregationInput = {
    id_avance?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    concepto_presupuesto?: SortOrder
    descripcion_concepto?: SortOrder
    cantidad_presupuestada?: SortOrder
    cantidad_anterior?: SortOrder
    cantidad_periodo?: SortOrder
    cantidad_acumulada?: SortOrder
    unidad?: SortOrder
    precio_unitario?: SortOrder
    importe_periodo?: SortOrder
    importe_acumulado?: SortOrder
    porcentaje_avance?: SortOrder
    periodo_inicio?: SortOrder
    periodo_fin?: SortOrder
    registrado_por_id?: SortOrder
    registrado_por_nombre?: SortOrder
    validado_por_id?: SortOrderInput | SortOrder
    validado_por_nombre?: SortOrderInput | SortOrder
    estado?: SortOrder
    estimacion_id?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: AvanceFisicoCountOrderByAggregateInput
    _avg?: AvanceFisicoAvgOrderByAggregateInput
    _max?: AvanceFisicoMaxOrderByAggregateInput
    _min?: AvanceFisicoMinOrderByAggregateInput
    _sum?: AvanceFisicoSumOrderByAggregateInput
  }

  export type AvanceFisicoScalarWhereWithAggregatesInput = {
    AND?: AvanceFisicoScalarWhereWithAggregatesInput | AvanceFisicoScalarWhereWithAggregatesInput[]
    OR?: AvanceFisicoScalarWhereWithAggregatesInput[]
    NOT?: AvanceFisicoScalarWhereWithAggregatesInput | AvanceFisicoScalarWhereWithAggregatesInput[]
    id_avance?: UuidWithAggregatesFilter<"AvanceFisico"> | string
    tenant_id?: UuidWithAggregatesFilter<"AvanceFisico"> | string
    proyecto_id?: UuidWithAggregatesFilter<"AvanceFisico"> | string
    concepto_presupuesto?: StringWithAggregatesFilter<"AvanceFisico"> | string
    descripcion_concepto?: StringWithAggregatesFilter<"AvanceFisico"> | string
    cantidad_presupuestada?: DecimalWithAggregatesFilter<"AvanceFisico"> | Decimal | DecimalJsLike | number | string
    cantidad_anterior?: DecimalWithAggregatesFilter<"AvanceFisico"> | Decimal | DecimalJsLike | number | string
    cantidad_periodo?: DecimalWithAggregatesFilter<"AvanceFisico"> | Decimal | DecimalJsLike | number | string
    cantidad_acumulada?: DecimalWithAggregatesFilter<"AvanceFisico"> | Decimal | DecimalJsLike | number | string
    unidad?: StringWithAggregatesFilter<"AvanceFisico"> | string
    precio_unitario?: DecimalWithAggregatesFilter<"AvanceFisico"> | Decimal | DecimalJsLike | number | string
    importe_periodo?: DecimalWithAggregatesFilter<"AvanceFisico"> | Decimal | DecimalJsLike | number | string
    importe_acumulado?: DecimalWithAggregatesFilter<"AvanceFisico"> | Decimal | DecimalJsLike | number | string
    porcentaje_avance?: DecimalWithAggregatesFilter<"AvanceFisico"> | Decimal | DecimalJsLike | number | string
    periodo_inicio?: DateTimeWithAggregatesFilter<"AvanceFisico"> | Date | string
    periodo_fin?: DateTimeWithAggregatesFilter<"AvanceFisico"> | Date | string
    registrado_por_id?: UuidWithAggregatesFilter<"AvanceFisico"> | string
    registrado_por_nombre?: StringWithAggregatesFilter<"AvanceFisico"> | string
    validado_por_id?: UuidNullableWithAggregatesFilter<"AvanceFisico"> | string | null
    validado_por_nombre?: StringNullableWithAggregatesFilter<"AvanceFisico"> | string | null
    estado?: StringWithAggregatesFilter<"AvanceFisico"> | string
    estimacion_id?: UuidNullableWithAggregatesFilter<"AvanceFisico"> | string | null
    created_at?: DateTimeWithAggregatesFilter<"AvanceFisico"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"AvanceFisico"> | Date | string
  }

  export type EstimacionWhereInput = {
    AND?: EstimacionWhereInput | EstimacionWhereInput[]
    OR?: EstimacionWhereInput[]
    NOT?: EstimacionWhereInput | EstimacionWhereInput[]
    id_estimacion?: UuidFilter<"Estimacion"> | string
    tenant_id?: UuidFilter<"Estimacion"> | string
    proyecto_id?: UuidFilter<"Estimacion"> | string
    numero_estimacion?: IntFilter<"Estimacion"> | number
    codigo?: StringFilter<"Estimacion"> | string
    periodo_inicio?: DateTimeFilter<"Estimacion"> | Date | string
    periodo_fin?: DateTimeFilter<"Estimacion"> | Date | string
    subtotal?: DecimalFilter<"Estimacion"> | Decimal | DecimalJsLike | number | string
    retencion_fondo_garantia?: DecimalFilter<"Estimacion"> | Decimal | DecimalJsLike | number | string
    amortizacion_anticipo?: DecimalFilter<"Estimacion"> | Decimal | DecimalJsLike | number | string
    iva?: DecimalFilter<"Estimacion"> | Decimal | DecimalJsLike | number | string
    total_neto?: DecimalFilter<"Estimacion"> | Decimal | DecimalJsLike | number | string
    estado?: StringFilter<"Estimacion"> | string
    elaborado_por_id?: UuidFilter<"Estimacion"> | string
    elaborado_por_nombre?: StringFilter<"Estimacion"> | string
    revisado_por_id?: UuidNullableFilter<"Estimacion"> | string | null
    revisado_por_nombre?: StringNullableFilter<"Estimacion"> | string | null
    aprobado_por_id?: UuidNullableFilter<"Estimacion"> | string | null
    aprobado_por_nombre?: StringNullableFilter<"Estimacion"> | string | null
    fecha_aprobacion?: DateTimeNullableFilter<"Estimacion"> | Date | string | null
    notas?: StringNullableFilter<"Estimacion"> | string | null
    created_at?: DateTimeFilter<"Estimacion"> | Date | string
    updated_at?: DateTimeFilter<"Estimacion"> | Date | string
    avances?: AvanceFisicoListRelationFilter
  }

  export type EstimacionOrderByWithRelationInput = {
    id_estimacion?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    numero_estimacion?: SortOrder
    codigo?: SortOrder
    periodo_inicio?: SortOrder
    periodo_fin?: SortOrder
    subtotal?: SortOrder
    retencion_fondo_garantia?: SortOrder
    amortizacion_anticipo?: SortOrder
    iva?: SortOrder
    total_neto?: SortOrder
    estado?: SortOrder
    elaborado_por_id?: SortOrder
    elaborado_por_nombre?: SortOrder
    revisado_por_id?: SortOrderInput | SortOrder
    revisado_por_nombre?: SortOrderInput | SortOrder
    aprobado_por_id?: SortOrderInput | SortOrder
    aprobado_por_nombre?: SortOrderInput | SortOrder
    fecha_aprobacion?: SortOrderInput | SortOrder
    notas?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    avances?: AvanceFisicoOrderByRelationAggregateInput
  }

  export type EstimacionWhereUniqueInput = Prisma.AtLeast<{
    id_estimacion?: string
    tenant_id_proyecto_id_numero_estimacion?: EstimacionTenant_idProyecto_idNumero_estimacionCompoundUniqueInput
    tenant_id_codigo?: EstimacionTenant_idCodigoCompoundUniqueInput
    AND?: EstimacionWhereInput | EstimacionWhereInput[]
    OR?: EstimacionWhereInput[]
    NOT?: EstimacionWhereInput | EstimacionWhereInput[]
    tenant_id?: UuidFilter<"Estimacion"> | string
    proyecto_id?: UuidFilter<"Estimacion"> | string
    numero_estimacion?: IntFilter<"Estimacion"> | number
    codigo?: StringFilter<"Estimacion"> | string
    periodo_inicio?: DateTimeFilter<"Estimacion"> | Date | string
    periodo_fin?: DateTimeFilter<"Estimacion"> | Date | string
    subtotal?: DecimalFilter<"Estimacion"> | Decimal | DecimalJsLike | number | string
    retencion_fondo_garantia?: DecimalFilter<"Estimacion"> | Decimal | DecimalJsLike | number | string
    amortizacion_anticipo?: DecimalFilter<"Estimacion"> | Decimal | DecimalJsLike | number | string
    iva?: DecimalFilter<"Estimacion"> | Decimal | DecimalJsLike | number | string
    total_neto?: DecimalFilter<"Estimacion"> | Decimal | DecimalJsLike | number | string
    estado?: StringFilter<"Estimacion"> | string
    elaborado_por_id?: UuidFilter<"Estimacion"> | string
    elaborado_por_nombre?: StringFilter<"Estimacion"> | string
    revisado_por_id?: UuidNullableFilter<"Estimacion"> | string | null
    revisado_por_nombre?: StringNullableFilter<"Estimacion"> | string | null
    aprobado_por_id?: UuidNullableFilter<"Estimacion"> | string | null
    aprobado_por_nombre?: StringNullableFilter<"Estimacion"> | string | null
    fecha_aprobacion?: DateTimeNullableFilter<"Estimacion"> | Date | string | null
    notas?: StringNullableFilter<"Estimacion"> | string | null
    created_at?: DateTimeFilter<"Estimacion"> | Date | string
    updated_at?: DateTimeFilter<"Estimacion"> | Date | string
    avances?: AvanceFisicoListRelationFilter
  }, "id_estimacion" | "tenant_id_proyecto_id_numero_estimacion" | "tenant_id_codigo">

  export type EstimacionOrderByWithAggregationInput = {
    id_estimacion?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    numero_estimacion?: SortOrder
    codigo?: SortOrder
    periodo_inicio?: SortOrder
    periodo_fin?: SortOrder
    subtotal?: SortOrder
    retencion_fondo_garantia?: SortOrder
    amortizacion_anticipo?: SortOrder
    iva?: SortOrder
    total_neto?: SortOrder
    estado?: SortOrder
    elaborado_por_id?: SortOrder
    elaborado_por_nombre?: SortOrder
    revisado_por_id?: SortOrderInput | SortOrder
    revisado_por_nombre?: SortOrderInput | SortOrder
    aprobado_por_id?: SortOrderInput | SortOrder
    aprobado_por_nombre?: SortOrderInput | SortOrder
    fecha_aprobacion?: SortOrderInput | SortOrder
    notas?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: EstimacionCountOrderByAggregateInput
    _avg?: EstimacionAvgOrderByAggregateInput
    _max?: EstimacionMaxOrderByAggregateInput
    _min?: EstimacionMinOrderByAggregateInput
    _sum?: EstimacionSumOrderByAggregateInput
  }

  export type EstimacionScalarWhereWithAggregatesInput = {
    AND?: EstimacionScalarWhereWithAggregatesInput | EstimacionScalarWhereWithAggregatesInput[]
    OR?: EstimacionScalarWhereWithAggregatesInput[]
    NOT?: EstimacionScalarWhereWithAggregatesInput | EstimacionScalarWhereWithAggregatesInput[]
    id_estimacion?: UuidWithAggregatesFilter<"Estimacion"> | string
    tenant_id?: UuidWithAggregatesFilter<"Estimacion"> | string
    proyecto_id?: UuidWithAggregatesFilter<"Estimacion"> | string
    numero_estimacion?: IntWithAggregatesFilter<"Estimacion"> | number
    codigo?: StringWithAggregatesFilter<"Estimacion"> | string
    periodo_inicio?: DateTimeWithAggregatesFilter<"Estimacion"> | Date | string
    periodo_fin?: DateTimeWithAggregatesFilter<"Estimacion"> | Date | string
    subtotal?: DecimalWithAggregatesFilter<"Estimacion"> | Decimal | DecimalJsLike | number | string
    retencion_fondo_garantia?: DecimalWithAggregatesFilter<"Estimacion"> | Decimal | DecimalJsLike | number | string
    amortizacion_anticipo?: DecimalWithAggregatesFilter<"Estimacion"> | Decimal | DecimalJsLike | number | string
    iva?: DecimalWithAggregatesFilter<"Estimacion"> | Decimal | DecimalJsLike | number | string
    total_neto?: DecimalWithAggregatesFilter<"Estimacion"> | Decimal | DecimalJsLike | number | string
    estado?: StringWithAggregatesFilter<"Estimacion"> | string
    elaborado_por_id?: UuidWithAggregatesFilter<"Estimacion"> | string
    elaborado_por_nombre?: StringWithAggregatesFilter<"Estimacion"> | string
    revisado_por_id?: UuidNullableWithAggregatesFilter<"Estimacion"> | string | null
    revisado_por_nombre?: StringNullableWithAggregatesFilter<"Estimacion"> | string | null
    aprobado_por_id?: UuidNullableWithAggregatesFilter<"Estimacion"> | string | null
    aprobado_por_nombre?: StringNullableWithAggregatesFilter<"Estimacion"> | string | null
    fecha_aprobacion?: DateTimeNullableWithAggregatesFilter<"Estimacion"> | Date | string | null
    notas?: StringNullableWithAggregatesFilter<"Estimacion"> | string | null
    created_at?: DateTimeWithAggregatesFilter<"Estimacion"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"Estimacion"> | Date | string
  }

  export type BitacoraObraCreateInput = {
    id_bitacora?: string
    tenant_id: string
    proyecto_id: string
    numero_entrada: number
    fecha: Date | string
    frente_trabajo: string
    turno?: string
    clima?: string | null
    temperatura_c?: Decimal | DecimalJsLike | number | string | null
    actividades_realizadas: string
    personal_en_sitio?: number
    incidencias?: string | null
    material_recibido?: string | null
    observaciones?: string | null
    residente_id: string
    residente_nombre: string
    superintendente_id?: string | null
    estado?: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type BitacoraObraUncheckedCreateInput = {
    id_bitacora?: string
    tenant_id: string
    proyecto_id: string
    numero_entrada: number
    fecha: Date | string
    frente_trabajo: string
    turno?: string
    clima?: string | null
    temperatura_c?: Decimal | DecimalJsLike | number | string | null
    actividades_realizadas: string
    personal_en_sitio?: number
    incidencias?: string | null
    material_recibido?: string | null
    observaciones?: string | null
    residente_id: string
    residente_nombre: string
    superintendente_id?: string | null
    estado?: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type BitacoraObraUpdateInput = {
    id_bitacora?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    numero_entrada?: IntFieldUpdateOperationsInput | number
    fecha?: DateTimeFieldUpdateOperationsInput | Date | string
    frente_trabajo?: StringFieldUpdateOperationsInput | string
    turno?: StringFieldUpdateOperationsInput | string
    clima?: NullableStringFieldUpdateOperationsInput | string | null
    temperatura_c?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    actividades_realizadas?: StringFieldUpdateOperationsInput | string
    personal_en_sitio?: IntFieldUpdateOperationsInput | number
    incidencias?: NullableStringFieldUpdateOperationsInput | string | null
    material_recibido?: NullableStringFieldUpdateOperationsInput | string | null
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    residente_id?: StringFieldUpdateOperationsInput | string
    residente_nombre?: StringFieldUpdateOperationsInput | string
    superintendente_id?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BitacoraObraUncheckedUpdateInput = {
    id_bitacora?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    numero_entrada?: IntFieldUpdateOperationsInput | number
    fecha?: DateTimeFieldUpdateOperationsInput | Date | string
    frente_trabajo?: StringFieldUpdateOperationsInput | string
    turno?: StringFieldUpdateOperationsInput | string
    clima?: NullableStringFieldUpdateOperationsInput | string | null
    temperatura_c?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    actividades_realizadas?: StringFieldUpdateOperationsInput | string
    personal_en_sitio?: IntFieldUpdateOperationsInput | number
    incidencias?: NullableStringFieldUpdateOperationsInput | string | null
    material_recibido?: NullableStringFieldUpdateOperationsInput | string | null
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    residente_id?: StringFieldUpdateOperationsInput | string
    residente_nombre?: StringFieldUpdateOperationsInput | string
    superintendente_id?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BitacoraObraCreateManyInput = {
    id_bitacora?: string
    tenant_id: string
    proyecto_id: string
    numero_entrada: number
    fecha: Date | string
    frente_trabajo: string
    turno?: string
    clima?: string | null
    temperatura_c?: Decimal | DecimalJsLike | number | string | null
    actividades_realizadas: string
    personal_en_sitio?: number
    incidencias?: string | null
    material_recibido?: string | null
    observaciones?: string | null
    residente_id: string
    residente_nombre: string
    superintendente_id?: string | null
    estado?: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type BitacoraObraUpdateManyMutationInput = {
    id_bitacora?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    numero_entrada?: IntFieldUpdateOperationsInput | number
    fecha?: DateTimeFieldUpdateOperationsInput | Date | string
    frente_trabajo?: StringFieldUpdateOperationsInput | string
    turno?: StringFieldUpdateOperationsInput | string
    clima?: NullableStringFieldUpdateOperationsInput | string | null
    temperatura_c?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    actividades_realizadas?: StringFieldUpdateOperationsInput | string
    personal_en_sitio?: IntFieldUpdateOperationsInput | number
    incidencias?: NullableStringFieldUpdateOperationsInput | string | null
    material_recibido?: NullableStringFieldUpdateOperationsInput | string | null
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    residente_id?: StringFieldUpdateOperationsInput | string
    residente_nombre?: StringFieldUpdateOperationsInput | string
    superintendente_id?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BitacoraObraUncheckedUpdateManyInput = {
    id_bitacora?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    numero_entrada?: IntFieldUpdateOperationsInput | number
    fecha?: DateTimeFieldUpdateOperationsInput | Date | string
    frente_trabajo?: StringFieldUpdateOperationsInput | string
    turno?: StringFieldUpdateOperationsInput | string
    clima?: NullableStringFieldUpdateOperationsInput | string | null
    temperatura_c?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    actividades_realizadas?: StringFieldUpdateOperationsInput | string
    personal_en_sitio?: IntFieldUpdateOperationsInput | number
    incidencias?: NullableStringFieldUpdateOperationsInput | string | null
    material_recibido?: NullableStringFieldUpdateOperationsInput | string | null
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    residente_id?: StringFieldUpdateOperationsInput | string
    residente_nombre?: StringFieldUpdateOperationsInput | string
    superintendente_id?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AvanceFisicoCreateInput = {
    id_avance?: string
    tenant_id: string
    proyecto_id: string
    concepto_presupuesto: string
    descripcion_concepto: string
    cantidad_presupuestada: Decimal | DecimalJsLike | number | string
    cantidad_anterior?: Decimal | DecimalJsLike | number | string
    cantidad_periodo: Decimal | DecimalJsLike | number | string
    cantidad_acumulada: Decimal | DecimalJsLike | number | string
    unidad: string
    precio_unitario: Decimal | DecimalJsLike | number | string
    importe_periodo: Decimal | DecimalJsLike | number | string
    importe_acumulado: Decimal | DecimalJsLike | number | string
    porcentaje_avance: Decimal | DecimalJsLike | number | string
    periodo_inicio: Date | string
    periodo_fin: Date | string
    registrado_por_id: string
    registrado_por_nombre: string
    validado_por_id?: string | null
    validado_por_nombre?: string | null
    estado?: string
    created_at?: Date | string
    updated_at?: Date | string
    estimacion?: EstimacionCreateNestedOneWithoutAvancesInput
  }

  export type AvanceFisicoUncheckedCreateInput = {
    id_avance?: string
    tenant_id: string
    proyecto_id: string
    concepto_presupuesto: string
    descripcion_concepto: string
    cantidad_presupuestada: Decimal | DecimalJsLike | number | string
    cantidad_anterior?: Decimal | DecimalJsLike | number | string
    cantidad_periodo: Decimal | DecimalJsLike | number | string
    cantidad_acumulada: Decimal | DecimalJsLike | number | string
    unidad: string
    precio_unitario: Decimal | DecimalJsLike | number | string
    importe_periodo: Decimal | DecimalJsLike | number | string
    importe_acumulado: Decimal | DecimalJsLike | number | string
    porcentaje_avance: Decimal | DecimalJsLike | number | string
    periodo_inicio: Date | string
    periodo_fin: Date | string
    registrado_por_id: string
    registrado_por_nombre: string
    validado_por_id?: string | null
    validado_por_nombre?: string | null
    estado?: string
    estimacion_id?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type AvanceFisicoUpdateInput = {
    id_avance?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    concepto_presupuesto?: StringFieldUpdateOperationsInput | string
    descripcion_concepto?: StringFieldUpdateOperationsInput | string
    cantidad_presupuestada?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cantidad_anterior?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cantidad_periodo?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cantidad_acumulada?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unidad?: StringFieldUpdateOperationsInput | string
    precio_unitario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    importe_periodo?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    importe_acumulado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    porcentaje_avance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    periodo_inicio?: DateTimeFieldUpdateOperationsInput | Date | string
    periodo_fin?: DateTimeFieldUpdateOperationsInput | Date | string
    registrado_por_id?: StringFieldUpdateOperationsInput | string
    registrado_por_nombre?: StringFieldUpdateOperationsInput | string
    validado_por_id?: NullableStringFieldUpdateOperationsInput | string | null
    validado_por_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    estimacion?: EstimacionUpdateOneWithoutAvancesNestedInput
  }

  export type AvanceFisicoUncheckedUpdateInput = {
    id_avance?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    concepto_presupuesto?: StringFieldUpdateOperationsInput | string
    descripcion_concepto?: StringFieldUpdateOperationsInput | string
    cantidad_presupuestada?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cantidad_anterior?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cantidad_periodo?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cantidad_acumulada?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unidad?: StringFieldUpdateOperationsInput | string
    precio_unitario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    importe_periodo?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    importe_acumulado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    porcentaje_avance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    periodo_inicio?: DateTimeFieldUpdateOperationsInput | Date | string
    periodo_fin?: DateTimeFieldUpdateOperationsInput | Date | string
    registrado_por_id?: StringFieldUpdateOperationsInput | string
    registrado_por_nombre?: StringFieldUpdateOperationsInput | string
    validado_por_id?: NullableStringFieldUpdateOperationsInput | string | null
    validado_por_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: StringFieldUpdateOperationsInput | string
    estimacion_id?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AvanceFisicoCreateManyInput = {
    id_avance?: string
    tenant_id: string
    proyecto_id: string
    concepto_presupuesto: string
    descripcion_concepto: string
    cantidad_presupuestada: Decimal | DecimalJsLike | number | string
    cantidad_anterior?: Decimal | DecimalJsLike | number | string
    cantidad_periodo: Decimal | DecimalJsLike | number | string
    cantidad_acumulada: Decimal | DecimalJsLike | number | string
    unidad: string
    precio_unitario: Decimal | DecimalJsLike | number | string
    importe_periodo: Decimal | DecimalJsLike | number | string
    importe_acumulado: Decimal | DecimalJsLike | number | string
    porcentaje_avance: Decimal | DecimalJsLike | number | string
    periodo_inicio: Date | string
    periodo_fin: Date | string
    registrado_por_id: string
    registrado_por_nombre: string
    validado_por_id?: string | null
    validado_por_nombre?: string | null
    estado?: string
    estimacion_id?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type AvanceFisicoUpdateManyMutationInput = {
    id_avance?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    concepto_presupuesto?: StringFieldUpdateOperationsInput | string
    descripcion_concepto?: StringFieldUpdateOperationsInput | string
    cantidad_presupuestada?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cantidad_anterior?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cantidad_periodo?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cantidad_acumulada?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unidad?: StringFieldUpdateOperationsInput | string
    precio_unitario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    importe_periodo?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    importe_acumulado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    porcentaje_avance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    periodo_inicio?: DateTimeFieldUpdateOperationsInput | Date | string
    periodo_fin?: DateTimeFieldUpdateOperationsInput | Date | string
    registrado_por_id?: StringFieldUpdateOperationsInput | string
    registrado_por_nombre?: StringFieldUpdateOperationsInput | string
    validado_por_id?: NullableStringFieldUpdateOperationsInput | string | null
    validado_por_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AvanceFisicoUncheckedUpdateManyInput = {
    id_avance?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    concepto_presupuesto?: StringFieldUpdateOperationsInput | string
    descripcion_concepto?: StringFieldUpdateOperationsInput | string
    cantidad_presupuestada?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cantidad_anterior?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cantidad_periodo?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cantidad_acumulada?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unidad?: StringFieldUpdateOperationsInput | string
    precio_unitario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    importe_periodo?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    importe_acumulado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    porcentaje_avance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    periodo_inicio?: DateTimeFieldUpdateOperationsInput | Date | string
    periodo_fin?: DateTimeFieldUpdateOperationsInput | Date | string
    registrado_por_id?: StringFieldUpdateOperationsInput | string
    registrado_por_nombre?: StringFieldUpdateOperationsInput | string
    validado_por_id?: NullableStringFieldUpdateOperationsInput | string | null
    validado_por_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: StringFieldUpdateOperationsInput | string
    estimacion_id?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EstimacionCreateInput = {
    id_estimacion?: string
    tenant_id: string
    proyecto_id: string
    numero_estimacion: number
    codigo: string
    periodo_inicio: Date | string
    periodo_fin: Date | string
    subtotal: Decimal | DecimalJsLike | number | string
    retencion_fondo_garantia?: Decimal | DecimalJsLike | number | string
    amortizacion_anticipo?: Decimal | DecimalJsLike | number | string
    iva?: Decimal | DecimalJsLike | number | string
    total_neto: Decimal | DecimalJsLike | number | string
    estado?: string
    elaborado_por_id: string
    elaborado_por_nombre: string
    revisado_por_id?: string | null
    revisado_por_nombre?: string | null
    aprobado_por_id?: string | null
    aprobado_por_nombre?: string | null
    fecha_aprobacion?: Date | string | null
    notas?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    avances?: AvanceFisicoCreateNestedManyWithoutEstimacionInput
  }

  export type EstimacionUncheckedCreateInput = {
    id_estimacion?: string
    tenant_id: string
    proyecto_id: string
    numero_estimacion: number
    codigo: string
    periodo_inicio: Date | string
    periodo_fin: Date | string
    subtotal: Decimal | DecimalJsLike | number | string
    retencion_fondo_garantia?: Decimal | DecimalJsLike | number | string
    amortizacion_anticipo?: Decimal | DecimalJsLike | number | string
    iva?: Decimal | DecimalJsLike | number | string
    total_neto: Decimal | DecimalJsLike | number | string
    estado?: string
    elaborado_por_id: string
    elaborado_por_nombre: string
    revisado_por_id?: string | null
    revisado_por_nombre?: string | null
    aprobado_por_id?: string | null
    aprobado_por_nombre?: string | null
    fecha_aprobacion?: Date | string | null
    notas?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    avances?: AvanceFisicoUncheckedCreateNestedManyWithoutEstimacionInput
  }

  export type EstimacionUpdateInput = {
    id_estimacion?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    numero_estimacion?: IntFieldUpdateOperationsInput | number
    codigo?: StringFieldUpdateOperationsInput | string
    periodo_inicio?: DateTimeFieldUpdateOperationsInput | Date | string
    periodo_fin?: DateTimeFieldUpdateOperationsInput | Date | string
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    retencion_fondo_garantia?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    amortizacion_anticipo?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    iva?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total_neto?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    estado?: StringFieldUpdateOperationsInput | string
    elaborado_por_id?: StringFieldUpdateOperationsInput | string
    elaborado_por_nombre?: StringFieldUpdateOperationsInput | string
    revisado_por_id?: NullableStringFieldUpdateOperationsInput | string | null
    revisado_por_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    aprobado_por_id?: NullableStringFieldUpdateOperationsInput | string | null
    aprobado_por_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_aprobacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    avances?: AvanceFisicoUpdateManyWithoutEstimacionNestedInput
  }

  export type EstimacionUncheckedUpdateInput = {
    id_estimacion?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    numero_estimacion?: IntFieldUpdateOperationsInput | number
    codigo?: StringFieldUpdateOperationsInput | string
    periodo_inicio?: DateTimeFieldUpdateOperationsInput | Date | string
    periodo_fin?: DateTimeFieldUpdateOperationsInput | Date | string
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    retencion_fondo_garantia?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    amortizacion_anticipo?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    iva?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total_neto?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    estado?: StringFieldUpdateOperationsInput | string
    elaborado_por_id?: StringFieldUpdateOperationsInput | string
    elaborado_por_nombre?: StringFieldUpdateOperationsInput | string
    revisado_por_id?: NullableStringFieldUpdateOperationsInput | string | null
    revisado_por_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    aprobado_por_id?: NullableStringFieldUpdateOperationsInput | string | null
    aprobado_por_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_aprobacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    avances?: AvanceFisicoUncheckedUpdateManyWithoutEstimacionNestedInput
  }

  export type EstimacionCreateManyInput = {
    id_estimacion?: string
    tenant_id: string
    proyecto_id: string
    numero_estimacion: number
    codigo: string
    periodo_inicio: Date | string
    periodo_fin: Date | string
    subtotal: Decimal | DecimalJsLike | number | string
    retencion_fondo_garantia?: Decimal | DecimalJsLike | number | string
    amortizacion_anticipo?: Decimal | DecimalJsLike | number | string
    iva?: Decimal | DecimalJsLike | number | string
    total_neto: Decimal | DecimalJsLike | number | string
    estado?: string
    elaborado_por_id: string
    elaborado_por_nombre: string
    revisado_por_id?: string | null
    revisado_por_nombre?: string | null
    aprobado_por_id?: string | null
    aprobado_por_nombre?: string | null
    fecha_aprobacion?: Date | string | null
    notas?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type EstimacionUpdateManyMutationInput = {
    id_estimacion?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    numero_estimacion?: IntFieldUpdateOperationsInput | number
    codigo?: StringFieldUpdateOperationsInput | string
    periodo_inicio?: DateTimeFieldUpdateOperationsInput | Date | string
    periodo_fin?: DateTimeFieldUpdateOperationsInput | Date | string
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    retencion_fondo_garantia?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    amortizacion_anticipo?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    iva?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total_neto?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    estado?: StringFieldUpdateOperationsInput | string
    elaborado_por_id?: StringFieldUpdateOperationsInput | string
    elaborado_por_nombre?: StringFieldUpdateOperationsInput | string
    revisado_por_id?: NullableStringFieldUpdateOperationsInput | string | null
    revisado_por_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    aprobado_por_id?: NullableStringFieldUpdateOperationsInput | string | null
    aprobado_por_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_aprobacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EstimacionUncheckedUpdateManyInput = {
    id_estimacion?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    numero_estimacion?: IntFieldUpdateOperationsInput | number
    codigo?: StringFieldUpdateOperationsInput | string
    periodo_inicio?: DateTimeFieldUpdateOperationsInput | Date | string
    periodo_fin?: DateTimeFieldUpdateOperationsInput | Date | string
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    retencion_fondo_garantia?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    amortizacion_anticipo?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    iva?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total_neto?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    estado?: StringFieldUpdateOperationsInput | string
    elaborado_por_id?: StringFieldUpdateOperationsInput | string
    elaborado_por_nombre?: StringFieldUpdateOperationsInput | string
    revisado_por_id?: NullableStringFieldUpdateOperationsInput | string | null
    revisado_por_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    aprobado_por_id?: NullableStringFieldUpdateOperationsInput | string | null
    aprobado_por_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_aprobacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
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

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type BitacoraObraTenant_idProyecto_idNumero_entradaCompoundUniqueInput = {
    tenant_id: string
    proyecto_id: string
    numero_entrada: number
  }

  export type BitacoraObraCountOrderByAggregateInput = {
    id_bitacora?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    numero_entrada?: SortOrder
    fecha?: SortOrder
    frente_trabajo?: SortOrder
    turno?: SortOrder
    clima?: SortOrder
    temperatura_c?: SortOrder
    actividades_realizadas?: SortOrder
    personal_en_sitio?: SortOrder
    incidencias?: SortOrder
    material_recibido?: SortOrder
    observaciones?: SortOrder
    residente_id?: SortOrder
    residente_nombre?: SortOrder
    superintendente_id?: SortOrder
    estado?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type BitacoraObraAvgOrderByAggregateInput = {
    numero_entrada?: SortOrder
    temperatura_c?: SortOrder
    personal_en_sitio?: SortOrder
  }

  export type BitacoraObraMaxOrderByAggregateInput = {
    id_bitacora?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    numero_entrada?: SortOrder
    fecha?: SortOrder
    frente_trabajo?: SortOrder
    turno?: SortOrder
    clima?: SortOrder
    temperatura_c?: SortOrder
    actividades_realizadas?: SortOrder
    personal_en_sitio?: SortOrder
    incidencias?: SortOrder
    material_recibido?: SortOrder
    observaciones?: SortOrder
    residente_id?: SortOrder
    residente_nombre?: SortOrder
    superintendente_id?: SortOrder
    estado?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type BitacoraObraMinOrderByAggregateInput = {
    id_bitacora?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    numero_entrada?: SortOrder
    fecha?: SortOrder
    frente_trabajo?: SortOrder
    turno?: SortOrder
    clima?: SortOrder
    temperatura_c?: SortOrder
    actividades_realizadas?: SortOrder
    personal_en_sitio?: SortOrder
    incidencias?: SortOrder
    material_recibido?: SortOrder
    observaciones?: SortOrder
    residente_id?: SortOrder
    residente_nombre?: SortOrder
    superintendente_id?: SortOrder
    estado?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type BitacoraObraSumOrderByAggregateInput = {
    numero_entrada?: SortOrder
    temperatura_c?: SortOrder
    personal_en_sitio?: SortOrder
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

  export type EstimacionNullableRelationFilter = {
    is?: EstimacionWhereInput | null
    isNot?: EstimacionWhereInput | null
  }

  export type AvanceFisicoCountOrderByAggregateInput = {
    id_avance?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    concepto_presupuesto?: SortOrder
    descripcion_concepto?: SortOrder
    cantidad_presupuestada?: SortOrder
    cantidad_anterior?: SortOrder
    cantidad_periodo?: SortOrder
    cantidad_acumulada?: SortOrder
    unidad?: SortOrder
    precio_unitario?: SortOrder
    importe_periodo?: SortOrder
    importe_acumulado?: SortOrder
    porcentaje_avance?: SortOrder
    periodo_inicio?: SortOrder
    periodo_fin?: SortOrder
    registrado_por_id?: SortOrder
    registrado_por_nombre?: SortOrder
    validado_por_id?: SortOrder
    validado_por_nombre?: SortOrder
    estado?: SortOrder
    estimacion_id?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type AvanceFisicoAvgOrderByAggregateInput = {
    cantidad_presupuestada?: SortOrder
    cantidad_anterior?: SortOrder
    cantidad_periodo?: SortOrder
    cantidad_acumulada?: SortOrder
    precio_unitario?: SortOrder
    importe_periodo?: SortOrder
    importe_acumulado?: SortOrder
    porcentaje_avance?: SortOrder
  }

  export type AvanceFisicoMaxOrderByAggregateInput = {
    id_avance?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    concepto_presupuesto?: SortOrder
    descripcion_concepto?: SortOrder
    cantidad_presupuestada?: SortOrder
    cantidad_anterior?: SortOrder
    cantidad_periodo?: SortOrder
    cantidad_acumulada?: SortOrder
    unidad?: SortOrder
    precio_unitario?: SortOrder
    importe_periodo?: SortOrder
    importe_acumulado?: SortOrder
    porcentaje_avance?: SortOrder
    periodo_inicio?: SortOrder
    periodo_fin?: SortOrder
    registrado_por_id?: SortOrder
    registrado_por_nombre?: SortOrder
    validado_por_id?: SortOrder
    validado_por_nombre?: SortOrder
    estado?: SortOrder
    estimacion_id?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type AvanceFisicoMinOrderByAggregateInput = {
    id_avance?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    concepto_presupuesto?: SortOrder
    descripcion_concepto?: SortOrder
    cantidad_presupuestada?: SortOrder
    cantidad_anterior?: SortOrder
    cantidad_periodo?: SortOrder
    cantidad_acumulada?: SortOrder
    unidad?: SortOrder
    precio_unitario?: SortOrder
    importe_periodo?: SortOrder
    importe_acumulado?: SortOrder
    porcentaje_avance?: SortOrder
    periodo_inicio?: SortOrder
    periodo_fin?: SortOrder
    registrado_por_id?: SortOrder
    registrado_por_nombre?: SortOrder
    validado_por_id?: SortOrder
    validado_por_nombre?: SortOrder
    estado?: SortOrder
    estimacion_id?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type AvanceFisicoSumOrderByAggregateInput = {
    cantidad_presupuestada?: SortOrder
    cantidad_anterior?: SortOrder
    cantidad_periodo?: SortOrder
    cantidad_acumulada?: SortOrder
    precio_unitario?: SortOrder
    importe_periodo?: SortOrder
    importe_acumulado?: SortOrder
    porcentaje_avance?: SortOrder
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

  export type AvanceFisicoListRelationFilter = {
    every?: AvanceFisicoWhereInput
    some?: AvanceFisicoWhereInput
    none?: AvanceFisicoWhereInput
  }

  export type AvanceFisicoOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type EstimacionTenant_idProyecto_idNumero_estimacionCompoundUniqueInput = {
    tenant_id: string
    proyecto_id: string
    numero_estimacion: number
  }

  export type EstimacionTenant_idCodigoCompoundUniqueInput = {
    tenant_id: string
    codigo: string
  }

  export type EstimacionCountOrderByAggregateInput = {
    id_estimacion?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    numero_estimacion?: SortOrder
    codigo?: SortOrder
    periodo_inicio?: SortOrder
    periodo_fin?: SortOrder
    subtotal?: SortOrder
    retencion_fondo_garantia?: SortOrder
    amortizacion_anticipo?: SortOrder
    iva?: SortOrder
    total_neto?: SortOrder
    estado?: SortOrder
    elaborado_por_id?: SortOrder
    elaborado_por_nombre?: SortOrder
    revisado_por_id?: SortOrder
    revisado_por_nombre?: SortOrder
    aprobado_por_id?: SortOrder
    aprobado_por_nombre?: SortOrder
    fecha_aprobacion?: SortOrder
    notas?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type EstimacionAvgOrderByAggregateInput = {
    numero_estimacion?: SortOrder
    subtotal?: SortOrder
    retencion_fondo_garantia?: SortOrder
    amortizacion_anticipo?: SortOrder
    iva?: SortOrder
    total_neto?: SortOrder
  }

  export type EstimacionMaxOrderByAggregateInput = {
    id_estimacion?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    numero_estimacion?: SortOrder
    codigo?: SortOrder
    periodo_inicio?: SortOrder
    periodo_fin?: SortOrder
    subtotal?: SortOrder
    retencion_fondo_garantia?: SortOrder
    amortizacion_anticipo?: SortOrder
    iva?: SortOrder
    total_neto?: SortOrder
    estado?: SortOrder
    elaborado_por_id?: SortOrder
    elaborado_por_nombre?: SortOrder
    revisado_por_id?: SortOrder
    revisado_por_nombre?: SortOrder
    aprobado_por_id?: SortOrder
    aprobado_por_nombre?: SortOrder
    fecha_aprobacion?: SortOrder
    notas?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type EstimacionMinOrderByAggregateInput = {
    id_estimacion?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    numero_estimacion?: SortOrder
    codigo?: SortOrder
    periodo_inicio?: SortOrder
    periodo_fin?: SortOrder
    subtotal?: SortOrder
    retencion_fondo_garantia?: SortOrder
    amortizacion_anticipo?: SortOrder
    iva?: SortOrder
    total_neto?: SortOrder
    estado?: SortOrder
    elaborado_por_id?: SortOrder
    elaborado_por_nombre?: SortOrder
    revisado_por_id?: SortOrder
    revisado_por_nombre?: SortOrder
    aprobado_por_id?: SortOrder
    aprobado_por_nombre?: SortOrder
    fecha_aprobacion?: SortOrder
    notas?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type EstimacionSumOrderByAggregateInput = {
    numero_estimacion?: SortOrder
    subtotal?: SortOrder
    retencion_fondo_garantia?: SortOrder
    amortizacion_anticipo?: SortOrder
    iva?: SortOrder
    total_neto?: SortOrder
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

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableDecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string | null
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type EstimacionCreateNestedOneWithoutAvancesInput = {
    create?: XOR<EstimacionCreateWithoutAvancesInput, EstimacionUncheckedCreateWithoutAvancesInput>
    connectOrCreate?: EstimacionCreateOrConnectWithoutAvancesInput
    connect?: EstimacionWhereUniqueInput
  }

  export type DecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type EstimacionUpdateOneWithoutAvancesNestedInput = {
    create?: XOR<EstimacionCreateWithoutAvancesInput, EstimacionUncheckedCreateWithoutAvancesInput>
    connectOrCreate?: EstimacionCreateOrConnectWithoutAvancesInput
    upsert?: EstimacionUpsertWithoutAvancesInput
    disconnect?: EstimacionWhereInput | boolean
    delete?: EstimacionWhereInput | boolean
    connect?: EstimacionWhereUniqueInput
    update?: XOR<XOR<EstimacionUpdateToOneWithWhereWithoutAvancesInput, EstimacionUpdateWithoutAvancesInput>, EstimacionUncheckedUpdateWithoutAvancesInput>
  }

  export type AvanceFisicoCreateNestedManyWithoutEstimacionInput = {
    create?: XOR<AvanceFisicoCreateWithoutEstimacionInput, AvanceFisicoUncheckedCreateWithoutEstimacionInput> | AvanceFisicoCreateWithoutEstimacionInput[] | AvanceFisicoUncheckedCreateWithoutEstimacionInput[]
    connectOrCreate?: AvanceFisicoCreateOrConnectWithoutEstimacionInput | AvanceFisicoCreateOrConnectWithoutEstimacionInput[]
    createMany?: AvanceFisicoCreateManyEstimacionInputEnvelope
    connect?: AvanceFisicoWhereUniqueInput | AvanceFisicoWhereUniqueInput[]
  }

  export type AvanceFisicoUncheckedCreateNestedManyWithoutEstimacionInput = {
    create?: XOR<AvanceFisicoCreateWithoutEstimacionInput, AvanceFisicoUncheckedCreateWithoutEstimacionInput> | AvanceFisicoCreateWithoutEstimacionInput[] | AvanceFisicoUncheckedCreateWithoutEstimacionInput[]
    connectOrCreate?: AvanceFisicoCreateOrConnectWithoutEstimacionInput | AvanceFisicoCreateOrConnectWithoutEstimacionInput[]
    createMany?: AvanceFisicoCreateManyEstimacionInputEnvelope
    connect?: AvanceFisicoWhereUniqueInput | AvanceFisicoWhereUniqueInput[]
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type AvanceFisicoUpdateManyWithoutEstimacionNestedInput = {
    create?: XOR<AvanceFisicoCreateWithoutEstimacionInput, AvanceFisicoUncheckedCreateWithoutEstimacionInput> | AvanceFisicoCreateWithoutEstimacionInput[] | AvanceFisicoUncheckedCreateWithoutEstimacionInput[]
    connectOrCreate?: AvanceFisicoCreateOrConnectWithoutEstimacionInput | AvanceFisicoCreateOrConnectWithoutEstimacionInput[]
    upsert?: AvanceFisicoUpsertWithWhereUniqueWithoutEstimacionInput | AvanceFisicoUpsertWithWhereUniqueWithoutEstimacionInput[]
    createMany?: AvanceFisicoCreateManyEstimacionInputEnvelope
    set?: AvanceFisicoWhereUniqueInput | AvanceFisicoWhereUniqueInput[]
    disconnect?: AvanceFisicoWhereUniqueInput | AvanceFisicoWhereUniqueInput[]
    delete?: AvanceFisicoWhereUniqueInput | AvanceFisicoWhereUniqueInput[]
    connect?: AvanceFisicoWhereUniqueInput | AvanceFisicoWhereUniqueInput[]
    update?: AvanceFisicoUpdateWithWhereUniqueWithoutEstimacionInput | AvanceFisicoUpdateWithWhereUniqueWithoutEstimacionInput[]
    updateMany?: AvanceFisicoUpdateManyWithWhereWithoutEstimacionInput | AvanceFisicoUpdateManyWithWhereWithoutEstimacionInput[]
    deleteMany?: AvanceFisicoScalarWhereInput | AvanceFisicoScalarWhereInput[]
  }

  export type AvanceFisicoUncheckedUpdateManyWithoutEstimacionNestedInput = {
    create?: XOR<AvanceFisicoCreateWithoutEstimacionInput, AvanceFisicoUncheckedCreateWithoutEstimacionInput> | AvanceFisicoCreateWithoutEstimacionInput[] | AvanceFisicoUncheckedCreateWithoutEstimacionInput[]
    connectOrCreate?: AvanceFisicoCreateOrConnectWithoutEstimacionInput | AvanceFisicoCreateOrConnectWithoutEstimacionInput[]
    upsert?: AvanceFisicoUpsertWithWhereUniqueWithoutEstimacionInput | AvanceFisicoUpsertWithWhereUniqueWithoutEstimacionInput[]
    createMany?: AvanceFisicoCreateManyEstimacionInputEnvelope
    set?: AvanceFisicoWhereUniqueInput | AvanceFisicoWhereUniqueInput[]
    disconnect?: AvanceFisicoWhereUniqueInput | AvanceFisicoWhereUniqueInput[]
    delete?: AvanceFisicoWhereUniqueInput | AvanceFisicoWhereUniqueInput[]
    connect?: AvanceFisicoWhereUniqueInput | AvanceFisicoWhereUniqueInput[]
    update?: AvanceFisicoUpdateWithWhereUniqueWithoutEstimacionInput | AvanceFisicoUpdateWithWhereUniqueWithoutEstimacionInput[]
    updateMany?: AvanceFisicoUpdateManyWithWhereWithoutEstimacionInput | AvanceFisicoUpdateManyWithWhereWithoutEstimacionInput[]
    deleteMany?: AvanceFisicoScalarWhereInput | AvanceFisicoScalarWhereInput[]
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

  export type EstimacionCreateWithoutAvancesInput = {
    id_estimacion?: string
    tenant_id: string
    proyecto_id: string
    numero_estimacion: number
    codigo: string
    periodo_inicio: Date | string
    periodo_fin: Date | string
    subtotal: Decimal | DecimalJsLike | number | string
    retencion_fondo_garantia?: Decimal | DecimalJsLike | number | string
    amortizacion_anticipo?: Decimal | DecimalJsLike | number | string
    iva?: Decimal | DecimalJsLike | number | string
    total_neto: Decimal | DecimalJsLike | number | string
    estado?: string
    elaborado_por_id: string
    elaborado_por_nombre: string
    revisado_por_id?: string | null
    revisado_por_nombre?: string | null
    aprobado_por_id?: string | null
    aprobado_por_nombre?: string | null
    fecha_aprobacion?: Date | string | null
    notas?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type EstimacionUncheckedCreateWithoutAvancesInput = {
    id_estimacion?: string
    tenant_id: string
    proyecto_id: string
    numero_estimacion: number
    codigo: string
    periodo_inicio: Date | string
    periodo_fin: Date | string
    subtotal: Decimal | DecimalJsLike | number | string
    retencion_fondo_garantia?: Decimal | DecimalJsLike | number | string
    amortizacion_anticipo?: Decimal | DecimalJsLike | number | string
    iva?: Decimal | DecimalJsLike | number | string
    total_neto: Decimal | DecimalJsLike | number | string
    estado?: string
    elaborado_por_id: string
    elaborado_por_nombre: string
    revisado_por_id?: string | null
    revisado_por_nombre?: string | null
    aprobado_por_id?: string | null
    aprobado_por_nombre?: string | null
    fecha_aprobacion?: Date | string | null
    notas?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type EstimacionCreateOrConnectWithoutAvancesInput = {
    where: EstimacionWhereUniqueInput
    create: XOR<EstimacionCreateWithoutAvancesInput, EstimacionUncheckedCreateWithoutAvancesInput>
  }

  export type EstimacionUpsertWithoutAvancesInput = {
    update: XOR<EstimacionUpdateWithoutAvancesInput, EstimacionUncheckedUpdateWithoutAvancesInput>
    create: XOR<EstimacionCreateWithoutAvancesInput, EstimacionUncheckedCreateWithoutAvancesInput>
    where?: EstimacionWhereInput
  }

  export type EstimacionUpdateToOneWithWhereWithoutAvancesInput = {
    where?: EstimacionWhereInput
    data: XOR<EstimacionUpdateWithoutAvancesInput, EstimacionUncheckedUpdateWithoutAvancesInput>
  }

  export type EstimacionUpdateWithoutAvancesInput = {
    id_estimacion?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    numero_estimacion?: IntFieldUpdateOperationsInput | number
    codigo?: StringFieldUpdateOperationsInput | string
    periodo_inicio?: DateTimeFieldUpdateOperationsInput | Date | string
    periodo_fin?: DateTimeFieldUpdateOperationsInput | Date | string
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    retencion_fondo_garantia?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    amortizacion_anticipo?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    iva?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total_neto?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    estado?: StringFieldUpdateOperationsInput | string
    elaborado_por_id?: StringFieldUpdateOperationsInput | string
    elaborado_por_nombre?: StringFieldUpdateOperationsInput | string
    revisado_por_id?: NullableStringFieldUpdateOperationsInput | string | null
    revisado_por_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    aprobado_por_id?: NullableStringFieldUpdateOperationsInput | string | null
    aprobado_por_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_aprobacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EstimacionUncheckedUpdateWithoutAvancesInput = {
    id_estimacion?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    numero_estimacion?: IntFieldUpdateOperationsInput | number
    codigo?: StringFieldUpdateOperationsInput | string
    periodo_inicio?: DateTimeFieldUpdateOperationsInput | Date | string
    periodo_fin?: DateTimeFieldUpdateOperationsInput | Date | string
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    retencion_fondo_garantia?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    amortizacion_anticipo?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    iva?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total_neto?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    estado?: StringFieldUpdateOperationsInput | string
    elaborado_por_id?: StringFieldUpdateOperationsInput | string
    elaborado_por_nombre?: StringFieldUpdateOperationsInput | string
    revisado_por_id?: NullableStringFieldUpdateOperationsInput | string | null
    revisado_por_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    aprobado_por_id?: NullableStringFieldUpdateOperationsInput | string | null
    aprobado_por_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_aprobacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AvanceFisicoCreateWithoutEstimacionInput = {
    id_avance?: string
    tenant_id: string
    proyecto_id: string
    concepto_presupuesto: string
    descripcion_concepto: string
    cantidad_presupuestada: Decimal | DecimalJsLike | number | string
    cantidad_anterior?: Decimal | DecimalJsLike | number | string
    cantidad_periodo: Decimal | DecimalJsLike | number | string
    cantidad_acumulada: Decimal | DecimalJsLike | number | string
    unidad: string
    precio_unitario: Decimal | DecimalJsLike | number | string
    importe_periodo: Decimal | DecimalJsLike | number | string
    importe_acumulado: Decimal | DecimalJsLike | number | string
    porcentaje_avance: Decimal | DecimalJsLike | number | string
    periodo_inicio: Date | string
    periodo_fin: Date | string
    registrado_por_id: string
    registrado_por_nombre: string
    validado_por_id?: string | null
    validado_por_nombre?: string | null
    estado?: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type AvanceFisicoUncheckedCreateWithoutEstimacionInput = {
    id_avance?: string
    tenant_id: string
    proyecto_id: string
    concepto_presupuesto: string
    descripcion_concepto: string
    cantidad_presupuestada: Decimal | DecimalJsLike | number | string
    cantidad_anterior?: Decimal | DecimalJsLike | number | string
    cantidad_periodo: Decimal | DecimalJsLike | number | string
    cantidad_acumulada: Decimal | DecimalJsLike | number | string
    unidad: string
    precio_unitario: Decimal | DecimalJsLike | number | string
    importe_periodo: Decimal | DecimalJsLike | number | string
    importe_acumulado: Decimal | DecimalJsLike | number | string
    porcentaje_avance: Decimal | DecimalJsLike | number | string
    periodo_inicio: Date | string
    periodo_fin: Date | string
    registrado_por_id: string
    registrado_por_nombre: string
    validado_por_id?: string | null
    validado_por_nombre?: string | null
    estado?: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type AvanceFisicoCreateOrConnectWithoutEstimacionInput = {
    where: AvanceFisicoWhereUniqueInput
    create: XOR<AvanceFisicoCreateWithoutEstimacionInput, AvanceFisicoUncheckedCreateWithoutEstimacionInput>
  }

  export type AvanceFisicoCreateManyEstimacionInputEnvelope = {
    data: AvanceFisicoCreateManyEstimacionInput | AvanceFisicoCreateManyEstimacionInput[]
    skipDuplicates?: boolean
  }

  export type AvanceFisicoUpsertWithWhereUniqueWithoutEstimacionInput = {
    where: AvanceFisicoWhereUniqueInput
    update: XOR<AvanceFisicoUpdateWithoutEstimacionInput, AvanceFisicoUncheckedUpdateWithoutEstimacionInput>
    create: XOR<AvanceFisicoCreateWithoutEstimacionInput, AvanceFisicoUncheckedCreateWithoutEstimacionInput>
  }

  export type AvanceFisicoUpdateWithWhereUniqueWithoutEstimacionInput = {
    where: AvanceFisicoWhereUniqueInput
    data: XOR<AvanceFisicoUpdateWithoutEstimacionInput, AvanceFisicoUncheckedUpdateWithoutEstimacionInput>
  }

  export type AvanceFisicoUpdateManyWithWhereWithoutEstimacionInput = {
    where: AvanceFisicoScalarWhereInput
    data: XOR<AvanceFisicoUpdateManyMutationInput, AvanceFisicoUncheckedUpdateManyWithoutEstimacionInput>
  }

  export type AvanceFisicoScalarWhereInput = {
    AND?: AvanceFisicoScalarWhereInput | AvanceFisicoScalarWhereInput[]
    OR?: AvanceFisicoScalarWhereInput[]
    NOT?: AvanceFisicoScalarWhereInput | AvanceFisicoScalarWhereInput[]
    id_avance?: UuidFilter<"AvanceFisico"> | string
    tenant_id?: UuidFilter<"AvanceFisico"> | string
    proyecto_id?: UuidFilter<"AvanceFisico"> | string
    concepto_presupuesto?: StringFilter<"AvanceFisico"> | string
    descripcion_concepto?: StringFilter<"AvanceFisico"> | string
    cantidad_presupuestada?: DecimalFilter<"AvanceFisico"> | Decimal | DecimalJsLike | number | string
    cantidad_anterior?: DecimalFilter<"AvanceFisico"> | Decimal | DecimalJsLike | number | string
    cantidad_periodo?: DecimalFilter<"AvanceFisico"> | Decimal | DecimalJsLike | number | string
    cantidad_acumulada?: DecimalFilter<"AvanceFisico"> | Decimal | DecimalJsLike | number | string
    unidad?: StringFilter<"AvanceFisico"> | string
    precio_unitario?: DecimalFilter<"AvanceFisico"> | Decimal | DecimalJsLike | number | string
    importe_periodo?: DecimalFilter<"AvanceFisico"> | Decimal | DecimalJsLike | number | string
    importe_acumulado?: DecimalFilter<"AvanceFisico"> | Decimal | DecimalJsLike | number | string
    porcentaje_avance?: DecimalFilter<"AvanceFisico"> | Decimal | DecimalJsLike | number | string
    periodo_inicio?: DateTimeFilter<"AvanceFisico"> | Date | string
    periodo_fin?: DateTimeFilter<"AvanceFisico"> | Date | string
    registrado_por_id?: UuidFilter<"AvanceFisico"> | string
    registrado_por_nombre?: StringFilter<"AvanceFisico"> | string
    validado_por_id?: UuidNullableFilter<"AvanceFisico"> | string | null
    validado_por_nombre?: StringNullableFilter<"AvanceFisico"> | string | null
    estado?: StringFilter<"AvanceFisico"> | string
    estimacion_id?: UuidNullableFilter<"AvanceFisico"> | string | null
    created_at?: DateTimeFilter<"AvanceFisico"> | Date | string
    updated_at?: DateTimeFilter<"AvanceFisico"> | Date | string
  }

  export type AvanceFisicoCreateManyEstimacionInput = {
    id_avance?: string
    tenant_id: string
    proyecto_id: string
    concepto_presupuesto: string
    descripcion_concepto: string
    cantidad_presupuestada: Decimal | DecimalJsLike | number | string
    cantidad_anterior?: Decimal | DecimalJsLike | number | string
    cantidad_periodo: Decimal | DecimalJsLike | number | string
    cantidad_acumulada: Decimal | DecimalJsLike | number | string
    unidad: string
    precio_unitario: Decimal | DecimalJsLike | number | string
    importe_periodo: Decimal | DecimalJsLike | number | string
    importe_acumulado: Decimal | DecimalJsLike | number | string
    porcentaje_avance: Decimal | DecimalJsLike | number | string
    periodo_inicio: Date | string
    periodo_fin: Date | string
    registrado_por_id: string
    registrado_por_nombre: string
    validado_por_id?: string | null
    validado_por_nombre?: string | null
    estado?: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type AvanceFisicoUpdateWithoutEstimacionInput = {
    id_avance?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    concepto_presupuesto?: StringFieldUpdateOperationsInput | string
    descripcion_concepto?: StringFieldUpdateOperationsInput | string
    cantidad_presupuestada?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cantidad_anterior?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cantidad_periodo?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cantidad_acumulada?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unidad?: StringFieldUpdateOperationsInput | string
    precio_unitario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    importe_periodo?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    importe_acumulado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    porcentaje_avance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    periodo_inicio?: DateTimeFieldUpdateOperationsInput | Date | string
    periodo_fin?: DateTimeFieldUpdateOperationsInput | Date | string
    registrado_por_id?: StringFieldUpdateOperationsInput | string
    registrado_por_nombre?: StringFieldUpdateOperationsInput | string
    validado_por_id?: NullableStringFieldUpdateOperationsInput | string | null
    validado_por_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AvanceFisicoUncheckedUpdateWithoutEstimacionInput = {
    id_avance?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    concepto_presupuesto?: StringFieldUpdateOperationsInput | string
    descripcion_concepto?: StringFieldUpdateOperationsInput | string
    cantidad_presupuestada?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cantidad_anterior?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cantidad_periodo?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cantidad_acumulada?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unidad?: StringFieldUpdateOperationsInput | string
    precio_unitario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    importe_periodo?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    importe_acumulado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    porcentaje_avance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    periodo_inicio?: DateTimeFieldUpdateOperationsInput | Date | string
    periodo_fin?: DateTimeFieldUpdateOperationsInput | Date | string
    registrado_por_id?: StringFieldUpdateOperationsInput | string
    registrado_por_nombre?: StringFieldUpdateOperationsInput | string
    validado_por_id?: NullableStringFieldUpdateOperationsInput | string | null
    validado_por_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AvanceFisicoUncheckedUpdateManyWithoutEstimacionInput = {
    id_avance?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    concepto_presupuesto?: StringFieldUpdateOperationsInput | string
    descripcion_concepto?: StringFieldUpdateOperationsInput | string
    cantidad_presupuestada?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cantidad_anterior?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cantidad_periodo?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cantidad_acumulada?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unidad?: StringFieldUpdateOperationsInput | string
    precio_unitario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    importe_periodo?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    importe_acumulado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    porcentaje_avance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    periodo_inicio?: DateTimeFieldUpdateOperationsInput | Date | string
    periodo_fin?: DateTimeFieldUpdateOperationsInput | Date | string
    registrado_por_id?: StringFieldUpdateOperationsInput | string
    registrado_por_nombre?: StringFieldUpdateOperationsInput | string
    validado_por_id?: NullableStringFieldUpdateOperationsInput | string | null
    validado_por_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use EstimacionCountOutputTypeDefaultArgs instead
     */
    export type EstimacionCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = EstimacionCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use BitacoraObraDefaultArgs instead
     */
    export type BitacoraObraArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = BitacoraObraDefaultArgs<ExtArgs>
    /**
     * @deprecated Use AvanceFisicoDefaultArgs instead
     */
    export type AvanceFisicoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AvanceFisicoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use EstimacionDefaultArgs instead
     */
    export type EstimacionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = EstimacionDefaultArgs<ExtArgs>

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