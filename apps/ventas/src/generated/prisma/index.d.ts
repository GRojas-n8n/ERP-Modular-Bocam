
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
 * Model Cliente
 * 
 */
export type Cliente = $Result.DefaultSelection<Prisma.$ClientePayload>
/**
 * Model Cotizacion
 * 
 */
export type Cotizacion = $Result.DefaultSelection<Prisma.$CotizacionPayload>
/**
 * Model Factura
 * 
 */
export type Factura = $Result.DefaultSelection<Prisma.$FacturaPayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Clientes
 * const clientes = await prisma.cliente.findMany()
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
   * // Fetch zero or more Clientes
   * const clientes = await prisma.cliente.findMany()
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
   * `prisma.cliente`: Exposes CRUD operations for the **Cliente** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Clientes
    * const clientes = await prisma.cliente.findMany()
    * ```
    */
  get cliente(): Prisma.ClienteDelegate<ExtArgs>;

  /**
   * `prisma.cotizacion`: Exposes CRUD operations for the **Cotizacion** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Cotizacions
    * const cotizacions = await prisma.cotizacion.findMany()
    * ```
    */
  get cotizacion(): Prisma.CotizacionDelegate<ExtArgs>;

  /**
   * `prisma.factura`: Exposes CRUD operations for the **Factura** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Facturas
    * const facturas = await prisma.factura.findMany()
    * ```
    */
  get factura(): Prisma.FacturaDelegate<ExtArgs>;
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
    Cliente: 'Cliente',
    Cotizacion: 'Cotizacion',
    Factura: 'Factura'
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
      modelProps: "cliente" | "cotizacion" | "factura"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Cliente: {
        payload: Prisma.$ClientePayload<ExtArgs>
        fields: Prisma.ClienteFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ClienteFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ClienteFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientePayload>
          }
          findFirst: {
            args: Prisma.ClienteFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ClienteFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientePayload>
          }
          findMany: {
            args: Prisma.ClienteFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientePayload>[]
          }
          create: {
            args: Prisma.ClienteCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientePayload>
          }
          createMany: {
            args: Prisma.ClienteCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ClienteCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientePayload>[]
          }
          delete: {
            args: Prisma.ClienteDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientePayload>
          }
          update: {
            args: Prisma.ClienteUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientePayload>
          }
          deleteMany: {
            args: Prisma.ClienteDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ClienteUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ClienteUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientePayload>
          }
          aggregate: {
            args: Prisma.ClienteAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCliente>
          }
          groupBy: {
            args: Prisma.ClienteGroupByArgs<ExtArgs>
            result: $Utils.Optional<ClienteGroupByOutputType>[]
          }
          count: {
            args: Prisma.ClienteCountArgs<ExtArgs>
            result: $Utils.Optional<ClienteCountAggregateOutputType> | number
          }
        }
      }
      Cotizacion: {
        payload: Prisma.$CotizacionPayload<ExtArgs>
        fields: Prisma.CotizacionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CotizacionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CotizacionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CotizacionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CotizacionPayload>
          }
          findFirst: {
            args: Prisma.CotizacionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CotizacionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CotizacionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CotizacionPayload>
          }
          findMany: {
            args: Prisma.CotizacionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CotizacionPayload>[]
          }
          create: {
            args: Prisma.CotizacionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CotizacionPayload>
          }
          createMany: {
            args: Prisma.CotizacionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CotizacionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CotizacionPayload>[]
          }
          delete: {
            args: Prisma.CotizacionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CotizacionPayload>
          }
          update: {
            args: Prisma.CotizacionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CotizacionPayload>
          }
          deleteMany: {
            args: Prisma.CotizacionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CotizacionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CotizacionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CotizacionPayload>
          }
          aggregate: {
            args: Prisma.CotizacionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCotizacion>
          }
          groupBy: {
            args: Prisma.CotizacionGroupByArgs<ExtArgs>
            result: $Utils.Optional<CotizacionGroupByOutputType>[]
          }
          count: {
            args: Prisma.CotizacionCountArgs<ExtArgs>
            result: $Utils.Optional<CotizacionCountAggregateOutputType> | number
          }
        }
      }
      Factura: {
        payload: Prisma.$FacturaPayload<ExtArgs>
        fields: Prisma.FacturaFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FacturaFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FacturaPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FacturaFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FacturaPayload>
          }
          findFirst: {
            args: Prisma.FacturaFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FacturaPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FacturaFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FacturaPayload>
          }
          findMany: {
            args: Prisma.FacturaFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FacturaPayload>[]
          }
          create: {
            args: Prisma.FacturaCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FacturaPayload>
          }
          createMany: {
            args: Prisma.FacturaCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FacturaCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FacturaPayload>[]
          }
          delete: {
            args: Prisma.FacturaDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FacturaPayload>
          }
          update: {
            args: Prisma.FacturaUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FacturaPayload>
          }
          deleteMany: {
            args: Prisma.FacturaDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FacturaUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.FacturaUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FacturaPayload>
          }
          aggregate: {
            args: Prisma.FacturaAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFactura>
          }
          groupBy: {
            args: Prisma.FacturaGroupByArgs<ExtArgs>
            result: $Utils.Optional<FacturaGroupByOutputType>[]
          }
          count: {
            args: Prisma.FacturaCountArgs<ExtArgs>
            result: $Utils.Optional<FacturaCountAggregateOutputType> | number
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
   * Count Type ClienteCountOutputType
   */

  export type ClienteCountOutputType = {
    cotizaciones: number
    facturas: number
  }

  export type ClienteCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cotizaciones?: boolean | ClienteCountOutputTypeCountCotizacionesArgs
    facturas?: boolean | ClienteCountOutputTypeCountFacturasArgs
  }

  // Custom InputTypes
  /**
   * ClienteCountOutputType without action
   */
  export type ClienteCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClienteCountOutputType
     */
    select?: ClienteCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ClienteCountOutputType without action
   */
  export type ClienteCountOutputTypeCountCotizacionesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CotizacionWhereInput
  }

  /**
   * ClienteCountOutputType without action
   */
  export type ClienteCountOutputTypeCountFacturasArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FacturaWhereInput
  }


  /**
   * Count Type CotizacionCountOutputType
   */

  export type CotizacionCountOutputType = {
    facturas: number
  }

  export type CotizacionCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    facturas?: boolean | CotizacionCountOutputTypeCountFacturasArgs
  }

  // Custom InputTypes
  /**
   * CotizacionCountOutputType without action
   */
  export type CotizacionCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CotizacionCountOutputType
     */
    select?: CotizacionCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CotizacionCountOutputType without action
   */
  export type CotizacionCountOutputTypeCountFacturasArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FacturaWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Cliente
   */

  export type AggregateCliente = {
    _count: ClienteCountAggregateOutputType | null
    _min: ClienteMinAggregateOutputType | null
    _max: ClienteMaxAggregateOutputType | null
  }

  export type ClienteMinAggregateOutputType = {
    id_cliente: string | null
    tenant_id: string | null
    tercero_id: string | null
    rfc_tax_id: string | null
    razon_social: string | null
    email_contacto: string | null
    telefono: string | null
    estatus: string | null
  }

  export type ClienteMaxAggregateOutputType = {
    id_cliente: string | null
    tenant_id: string | null
    tercero_id: string | null
    rfc_tax_id: string | null
    razon_social: string | null
    email_contacto: string | null
    telefono: string | null
    estatus: string | null
  }

  export type ClienteCountAggregateOutputType = {
    id_cliente: number
    tenant_id: number
    tercero_id: number
    rfc_tax_id: number
    razon_social: number
    email_contacto: number
    telefono: number
    estatus: number
    _all: number
  }


  export type ClienteMinAggregateInputType = {
    id_cliente?: true
    tenant_id?: true
    tercero_id?: true
    rfc_tax_id?: true
    razon_social?: true
    email_contacto?: true
    telefono?: true
    estatus?: true
  }

  export type ClienteMaxAggregateInputType = {
    id_cliente?: true
    tenant_id?: true
    tercero_id?: true
    rfc_tax_id?: true
    razon_social?: true
    email_contacto?: true
    telefono?: true
    estatus?: true
  }

  export type ClienteCountAggregateInputType = {
    id_cliente?: true
    tenant_id?: true
    tercero_id?: true
    rfc_tax_id?: true
    razon_social?: true
    email_contacto?: true
    telefono?: true
    estatus?: true
    _all?: true
  }

  export type ClienteAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Cliente to aggregate.
     */
    where?: ClienteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Clientes to fetch.
     */
    orderBy?: ClienteOrderByWithRelationInput | ClienteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ClienteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Clientes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Clientes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Clientes
    **/
    _count?: true | ClienteCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ClienteMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ClienteMaxAggregateInputType
  }

  export type GetClienteAggregateType<T extends ClienteAggregateArgs> = {
        [P in keyof T & keyof AggregateCliente]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCliente[P]>
      : GetScalarType<T[P], AggregateCliente[P]>
  }




  export type ClienteGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ClienteWhereInput
    orderBy?: ClienteOrderByWithAggregationInput | ClienteOrderByWithAggregationInput[]
    by: ClienteScalarFieldEnum[] | ClienteScalarFieldEnum
    having?: ClienteScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ClienteCountAggregateInputType | true
    _min?: ClienteMinAggregateInputType
    _max?: ClienteMaxAggregateInputType
  }

  export type ClienteGroupByOutputType = {
    id_cliente: string
    tenant_id: string
    tercero_id: string | null
    rfc_tax_id: string
    razon_social: string
    email_contacto: string | null
    telefono: string | null
    estatus: string
    _count: ClienteCountAggregateOutputType | null
    _min: ClienteMinAggregateOutputType | null
    _max: ClienteMaxAggregateOutputType | null
  }

  type GetClienteGroupByPayload<T extends ClienteGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ClienteGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ClienteGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ClienteGroupByOutputType[P]>
            : GetScalarType<T[P], ClienteGroupByOutputType[P]>
        }
      >
    >


  export type ClienteSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_cliente?: boolean
    tenant_id?: boolean
    tercero_id?: boolean
    rfc_tax_id?: boolean
    razon_social?: boolean
    email_contacto?: boolean
    telefono?: boolean
    estatus?: boolean
    cotizaciones?: boolean | Cliente$cotizacionesArgs<ExtArgs>
    facturas?: boolean | Cliente$facturasArgs<ExtArgs>
    _count?: boolean | ClienteCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cliente"]>

  export type ClienteSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_cliente?: boolean
    tenant_id?: boolean
    tercero_id?: boolean
    rfc_tax_id?: boolean
    razon_social?: boolean
    email_contacto?: boolean
    telefono?: boolean
    estatus?: boolean
  }, ExtArgs["result"]["cliente"]>

  export type ClienteSelectScalar = {
    id_cliente?: boolean
    tenant_id?: boolean
    tercero_id?: boolean
    rfc_tax_id?: boolean
    razon_social?: boolean
    email_contacto?: boolean
    telefono?: boolean
    estatus?: boolean
  }

  export type ClienteInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cotizaciones?: boolean | Cliente$cotizacionesArgs<ExtArgs>
    facturas?: boolean | Cliente$facturasArgs<ExtArgs>
    _count?: boolean | ClienteCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ClienteIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $ClientePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Cliente"
    objects: {
      cotizaciones: Prisma.$CotizacionPayload<ExtArgs>[]
      facturas: Prisma.$FacturaPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id_cliente: string
      tenant_id: string
      tercero_id: string | null
      rfc_tax_id: string
      razon_social: string
      email_contacto: string | null
      telefono: string | null
      estatus: string
    }, ExtArgs["result"]["cliente"]>
    composites: {}
  }

  type ClienteGetPayload<S extends boolean | null | undefined | ClienteDefaultArgs> = $Result.GetResult<Prisma.$ClientePayload, S>

  type ClienteCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ClienteFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ClienteCountAggregateInputType | true
    }

  export interface ClienteDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Cliente'], meta: { name: 'Cliente' } }
    /**
     * Find zero or one Cliente that matches the filter.
     * @param {ClienteFindUniqueArgs} args - Arguments to find a Cliente
     * @example
     * // Get one Cliente
     * const cliente = await prisma.cliente.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ClienteFindUniqueArgs>(args: SelectSubset<T, ClienteFindUniqueArgs<ExtArgs>>): Prisma__ClienteClient<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Cliente that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ClienteFindUniqueOrThrowArgs} args - Arguments to find a Cliente
     * @example
     * // Get one Cliente
     * const cliente = await prisma.cliente.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ClienteFindUniqueOrThrowArgs>(args: SelectSubset<T, ClienteFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ClienteClient<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Cliente that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClienteFindFirstArgs} args - Arguments to find a Cliente
     * @example
     * // Get one Cliente
     * const cliente = await prisma.cliente.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ClienteFindFirstArgs>(args?: SelectSubset<T, ClienteFindFirstArgs<ExtArgs>>): Prisma__ClienteClient<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Cliente that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClienteFindFirstOrThrowArgs} args - Arguments to find a Cliente
     * @example
     * // Get one Cliente
     * const cliente = await prisma.cliente.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ClienteFindFirstOrThrowArgs>(args?: SelectSubset<T, ClienteFindFirstOrThrowArgs<ExtArgs>>): Prisma__ClienteClient<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Clientes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClienteFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Clientes
     * const clientes = await prisma.cliente.findMany()
     * 
     * // Get first 10 Clientes
     * const clientes = await prisma.cliente.findMany({ take: 10 })
     * 
     * // Only select the `id_cliente`
     * const clienteWithId_clienteOnly = await prisma.cliente.findMany({ select: { id_cliente: true } })
     * 
     */
    findMany<T extends ClienteFindManyArgs>(args?: SelectSubset<T, ClienteFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Cliente.
     * @param {ClienteCreateArgs} args - Arguments to create a Cliente.
     * @example
     * // Create one Cliente
     * const Cliente = await prisma.cliente.create({
     *   data: {
     *     // ... data to create a Cliente
     *   }
     * })
     * 
     */
    create<T extends ClienteCreateArgs>(args: SelectSubset<T, ClienteCreateArgs<ExtArgs>>): Prisma__ClienteClient<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Clientes.
     * @param {ClienteCreateManyArgs} args - Arguments to create many Clientes.
     * @example
     * // Create many Clientes
     * const cliente = await prisma.cliente.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ClienteCreateManyArgs>(args?: SelectSubset<T, ClienteCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Clientes and returns the data saved in the database.
     * @param {ClienteCreateManyAndReturnArgs} args - Arguments to create many Clientes.
     * @example
     * // Create many Clientes
     * const cliente = await prisma.cliente.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Clientes and only return the `id_cliente`
     * const clienteWithId_clienteOnly = await prisma.cliente.createManyAndReturn({ 
     *   select: { id_cliente: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ClienteCreateManyAndReturnArgs>(args?: SelectSubset<T, ClienteCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Cliente.
     * @param {ClienteDeleteArgs} args - Arguments to delete one Cliente.
     * @example
     * // Delete one Cliente
     * const Cliente = await prisma.cliente.delete({
     *   where: {
     *     // ... filter to delete one Cliente
     *   }
     * })
     * 
     */
    delete<T extends ClienteDeleteArgs>(args: SelectSubset<T, ClienteDeleteArgs<ExtArgs>>): Prisma__ClienteClient<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Cliente.
     * @param {ClienteUpdateArgs} args - Arguments to update one Cliente.
     * @example
     * // Update one Cliente
     * const cliente = await prisma.cliente.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ClienteUpdateArgs>(args: SelectSubset<T, ClienteUpdateArgs<ExtArgs>>): Prisma__ClienteClient<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Clientes.
     * @param {ClienteDeleteManyArgs} args - Arguments to filter Clientes to delete.
     * @example
     * // Delete a few Clientes
     * const { count } = await prisma.cliente.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ClienteDeleteManyArgs>(args?: SelectSubset<T, ClienteDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Clientes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClienteUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Clientes
     * const cliente = await prisma.cliente.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ClienteUpdateManyArgs>(args: SelectSubset<T, ClienteUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Cliente.
     * @param {ClienteUpsertArgs} args - Arguments to update or create a Cliente.
     * @example
     * // Update or create a Cliente
     * const cliente = await prisma.cliente.upsert({
     *   create: {
     *     // ... data to create a Cliente
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Cliente we want to update
     *   }
     * })
     */
    upsert<T extends ClienteUpsertArgs>(args: SelectSubset<T, ClienteUpsertArgs<ExtArgs>>): Prisma__ClienteClient<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Clientes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClienteCountArgs} args - Arguments to filter Clientes to count.
     * @example
     * // Count the number of Clientes
     * const count = await prisma.cliente.count({
     *   where: {
     *     // ... the filter for the Clientes we want to count
     *   }
     * })
    **/
    count<T extends ClienteCountArgs>(
      args?: Subset<T, ClienteCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ClienteCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Cliente.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClienteAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ClienteAggregateArgs>(args: Subset<T, ClienteAggregateArgs>): Prisma.PrismaPromise<GetClienteAggregateType<T>>

    /**
     * Group by Cliente.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClienteGroupByArgs} args - Group by arguments.
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
      T extends ClienteGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ClienteGroupByArgs['orderBy'] }
        : { orderBy?: ClienteGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ClienteGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetClienteGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Cliente model
   */
  readonly fields: ClienteFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Cliente.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ClienteClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    cotizaciones<T extends Cliente$cotizacionesArgs<ExtArgs> = {}>(args?: Subset<T, Cliente$cotizacionesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CotizacionPayload<ExtArgs>, T, "findMany"> | Null>
    facturas<T extends Cliente$facturasArgs<ExtArgs> = {}>(args?: Subset<T, Cliente$facturasArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FacturaPayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the Cliente model
   */ 
  interface ClienteFieldRefs {
    readonly id_cliente: FieldRef<"Cliente", 'String'>
    readonly tenant_id: FieldRef<"Cliente", 'String'>
    readonly tercero_id: FieldRef<"Cliente", 'String'>
    readonly rfc_tax_id: FieldRef<"Cliente", 'String'>
    readonly razon_social: FieldRef<"Cliente", 'String'>
    readonly email_contacto: FieldRef<"Cliente", 'String'>
    readonly telefono: FieldRef<"Cliente", 'String'>
    readonly estatus: FieldRef<"Cliente", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Cliente findUnique
   */
  export type ClienteFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cliente
     */
    select?: ClienteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteInclude<ExtArgs> | null
    /**
     * Filter, which Cliente to fetch.
     */
    where: ClienteWhereUniqueInput
  }

  /**
   * Cliente findUniqueOrThrow
   */
  export type ClienteFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cliente
     */
    select?: ClienteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteInclude<ExtArgs> | null
    /**
     * Filter, which Cliente to fetch.
     */
    where: ClienteWhereUniqueInput
  }

  /**
   * Cliente findFirst
   */
  export type ClienteFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cliente
     */
    select?: ClienteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteInclude<ExtArgs> | null
    /**
     * Filter, which Cliente to fetch.
     */
    where?: ClienteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Clientes to fetch.
     */
    orderBy?: ClienteOrderByWithRelationInput | ClienteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Clientes.
     */
    cursor?: ClienteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Clientes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Clientes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Clientes.
     */
    distinct?: ClienteScalarFieldEnum | ClienteScalarFieldEnum[]
  }

  /**
   * Cliente findFirstOrThrow
   */
  export type ClienteFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cliente
     */
    select?: ClienteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteInclude<ExtArgs> | null
    /**
     * Filter, which Cliente to fetch.
     */
    where?: ClienteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Clientes to fetch.
     */
    orderBy?: ClienteOrderByWithRelationInput | ClienteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Clientes.
     */
    cursor?: ClienteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Clientes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Clientes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Clientes.
     */
    distinct?: ClienteScalarFieldEnum | ClienteScalarFieldEnum[]
  }

  /**
   * Cliente findMany
   */
  export type ClienteFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cliente
     */
    select?: ClienteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteInclude<ExtArgs> | null
    /**
     * Filter, which Clientes to fetch.
     */
    where?: ClienteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Clientes to fetch.
     */
    orderBy?: ClienteOrderByWithRelationInput | ClienteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Clientes.
     */
    cursor?: ClienteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Clientes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Clientes.
     */
    skip?: number
    distinct?: ClienteScalarFieldEnum | ClienteScalarFieldEnum[]
  }

  /**
   * Cliente create
   */
  export type ClienteCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cliente
     */
    select?: ClienteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteInclude<ExtArgs> | null
    /**
     * The data needed to create a Cliente.
     */
    data: XOR<ClienteCreateInput, ClienteUncheckedCreateInput>
  }

  /**
   * Cliente createMany
   */
  export type ClienteCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Clientes.
     */
    data: ClienteCreateManyInput | ClienteCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Cliente createManyAndReturn
   */
  export type ClienteCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cliente
     */
    select?: ClienteSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Clientes.
     */
    data: ClienteCreateManyInput | ClienteCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Cliente update
   */
  export type ClienteUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cliente
     */
    select?: ClienteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteInclude<ExtArgs> | null
    /**
     * The data needed to update a Cliente.
     */
    data: XOR<ClienteUpdateInput, ClienteUncheckedUpdateInput>
    /**
     * Choose, which Cliente to update.
     */
    where: ClienteWhereUniqueInput
  }

  /**
   * Cliente updateMany
   */
  export type ClienteUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Clientes.
     */
    data: XOR<ClienteUpdateManyMutationInput, ClienteUncheckedUpdateManyInput>
    /**
     * Filter which Clientes to update
     */
    where?: ClienteWhereInput
  }

  /**
   * Cliente upsert
   */
  export type ClienteUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cliente
     */
    select?: ClienteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteInclude<ExtArgs> | null
    /**
     * The filter to search for the Cliente to update in case it exists.
     */
    where: ClienteWhereUniqueInput
    /**
     * In case the Cliente found by the `where` argument doesn't exist, create a new Cliente with this data.
     */
    create: XOR<ClienteCreateInput, ClienteUncheckedCreateInput>
    /**
     * In case the Cliente was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ClienteUpdateInput, ClienteUncheckedUpdateInput>
  }

  /**
   * Cliente delete
   */
  export type ClienteDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cliente
     */
    select?: ClienteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteInclude<ExtArgs> | null
    /**
     * Filter which Cliente to delete.
     */
    where: ClienteWhereUniqueInput
  }

  /**
   * Cliente deleteMany
   */
  export type ClienteDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Clientes to delete
     */
    where?: ClienteWhereInput
  }

  /**
   * Cliente.cotizaciones
   */
  export type Cliente$cotizacionesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cotizacion
     */
    select?: CotizacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CotizacionInclude<ExtArgs> | null
    where?: CotizacionWhereInput
    orderBy?: CotizacionOrderByWithRelationInput | CotizacionOrderByWithRelationInput[]
    cursor?: CotizacionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CotizacionScalarFieldEnum | CotizacionScalarFieldEnum[]
  }

  /**
   * Cliente.facturas
   */
  export type Cliente$facturasArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Factura
     */
    select?: FacturaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FacturaInclude<ExtArgs> | null
    where?: FacturaWhereInput
    orderBy?: FacturaOrderByWithRelationInput | FacturaOrderByWithRelationInput[]
    cursor?: FacturaWhereUniqueInput
    take?: number
    skip?: number
    distinct?: FacturaScalarFieldEnum | FacturaScalarFieldEnum[]
  }

  /**
   * Cliente without action
   */
  export type ClienteDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cliente
     */
    select?: ClienteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteInclude<ExtArgs> | null
  }


  /**
   * Model Cotizacion
   */

  export type AggregateCotizacion = {
    _count: CotizacionCountAggregateOutputType | null
    _avg: CotizacionAvgAggregateOutputType | null
    _sum: CotizacionSumAggregateOutputType | null
    _min: CotizacionMinAggregateOutputType | null
    _max: CotizacionMaxAggregateOutputType | null
  }

  export type CotizacionAvgAggregateOutputType = {
    subtotal: Decimal | null
    iva: Decimal | null
    total: Decimal | null
  }

  export type CotizacionSumAggregateOutputType = {
    subtotal: Decimal | null
    iva: Decimal | null
    total: Decimal | null
  }

  export type CotizacionMinAggregateOutputType = {
    id_cotizacion: string | null
    tenant_id: string | null
    proyecto_id: string | null
    cliente_id: string | null
    codigo: string | null
    fecha_emision: Date | null
    vigencia_hasta: Date | null
    estado: string | null
    moneda: string | null
    subtotal: Decimal | null
    iva: Decimal | null
    total: Decimal | null
    notas: string | null
  }

  export type CotizacionMaxAggregateOutputType = {
    id_cotizacion: string | null
    tenant_id: string | null
    proyecto_id: string | null
    cliente_id: string | null
    codigo: string | null
    fecha_emision: Date | null
    vigencia_hasta: Date | null
    estado: string | null
    moneda: string | null
    subtotal: Decimal | null
    iva: Decimal | null
    total: Decimal | null
    notas: string | null
  }

  export type CotizacionCountAggregateOutputType = {
    id_cotizacion: number
    tenant_id: number
    proyecto_id: number
    cliente_id: number
    codigo: number
    fecha_emision: number
    vigencia_hasta: number
    estado: number
    moneda: number
    subtotal: number
    iva: number
    total: number
    notas: number
    _all: number
  }


  export type CotizacionAvgAggregateInputType = {
    subtotal?: true
    iva?: true
    total?: true
  }

  export type CotizacionSumAggregateInputType = {
    subtotal?: true
    iva?: true
    total?: true
  }

  export type CotizacionMinAggregateInputType = {
    id_cotizacion?: true
    tenant_id?: true
    proyecto_id?: true
    cliente_id?: true
    codigo?: true
    fecha_emision?: true
    vigencia_hasta?: true
    estado?: true
    moneda?: true
    subtotal?: true
    iva?: true
    total?: true
    notas?: true
  }

  export type CotizacionMaxAggregateInputType = {
    id_cotizacion?: true
    tenant_id?: true
    proyecto_id?: true
    cliente_id?: true
    codigo?: true
    fecha_emision?: true
    vigencia_hasta?: true
    estado?: true
    moneda?: true
    subtotal?: true
    iva?: true
    total?: true
    notas?: true
  }

  export type CotizacionCountAggregateInputType = {
    id_cotizacion?: true
    tenant_id?: true
    proyecto_id?: true
    cliente_id?: true
    codigo?: true
    fecha_emision?: true
    vigencia_hasta?: true
    estado?: true
    moneda?: true
    subtotal?: true
    iva?: true
    total?: true
    notas?: true
    _all?: true
  }

  export type CotizacionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Cotizacion to aggregate.
     */
    where?: CotizacionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Cotizacions to fetch.
     */
    orderBy?: CotizacionOrderByWithRelationInput | CotizacionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CotizacionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Cotizacions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Cotizacions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Cotizacions
    **/
    _count?: true | CotizacionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CotizacionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CotizacionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CotizacionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CotizacionMaxAggregateInputType
  }

  export type GetCotizacionAggregateType<T extends CotizacionAggregateArgs> = {
        [P in keyof T & keyof AggregateCotizacion]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCotizacion[P]>
      : GetScalarType<T[P], AggregateCotizacion[P]>
  }




  export type CotizacionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CotizacionWhereInput
    orderBy?: CotizacionOrderByWithAggregationInput | CotizacionOrderByWithAggregationInput[]
    by: CotizacionScalarFieldEnum[] | CotizacionScalarFieldEnum
    having?: CotizacionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CotizacionCountAggregateInputType | true
    _avg?: CotizacionAvgAggregateInputType
    _sum?: CotizacionSumAggregateInputType
    _min?: CotizacionMinAggregateInputType
    _max?: CotizacionMaxAggregateInputType
  }

  export type CotizacionGroupByOutputType = {
    id_cotizacion: string
    tenant_id: string
    proyecto_id: string
    cliente_id: string
    codigo: string
    fecha_emision: Date
    vigencia_hasta: Date | null
    estado: string
    moneda: string
    subtotal: Decimal
    iva: Decimal
    total: Decimal
    notas: string | null
    _count: CotizacionCountAggregateOutputType | null
    _avg: CotizacionAvgAggregateOutputType | null
    _sum: CotizacionSumAggregateOutputType | null
    _min: CotizacionMinAggregateOutputType | null
    _max: CotizacionMaxAggregateOutputType | null
  }

  type GetCotizacionGroupByPayload<T extends CotizacionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CotizacionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CotizacionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CotizacionGroupByOutputType[P]>
            : GetScalarType<T[P], CotizacionGroupByOutputType[P]>
        }
      >
    >


  export type CotizacionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_cotizacion?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    cliente_id?: boolean
    codigo?: boolean
    fecha_emision?: boolean
    vigencia_hasta?: boolean
    estado?: boolean
    moneda?: boolean
    subtotal?: boolean
    iva?: boolean
    total?: boolean
    notas?: boolean
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
    facturas?: boolean | Cotizacion$facturasArgs<ExtArgs>
    _count?: boolean | CotizacionCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cotizacion"]>

  export type CotizacionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_cotizacion?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    cliente_id?: boolean
    codigo?: boolean
    fecha_emision?: boolean
    vigencia_hasta?: boolean
    estado?: boolean
    moneda?: boolean
    subtotal?: boolean
    iva?: boolean
    total?: boolean
    notas?: boolean
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cotizacion"]>

  export type CotizacionSelectScalar = {
    id_cotizacion?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    cliente_id?: boolean
    codigo?: boolean
    fecha_emision?: boolean
    vigencia_hasta?: boolean
    estado?: boolean
    moneda?: boolean
    subtotal?: boolean
    iva?: boolean
    total?: boolean
    notas?: boolean
  }

  export type CotizacionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
    facturas?: boolean | Cotizacion$facturasArgs<ExtArgs>
    _count?: boolean | CotizacionCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CotizacionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
  }

  export type $CotizacionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Cotizacion"
    objects: {
      cliente: Prisma.$ClientePayload<ExtArgs>
      facturas: Prisma.$FacturaPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id_cotizacion: string
      tenant_id: string
      proyecto_id: string
      cliente_id: string
      codigo: string
      fecha_emision: Date
      vigencia_hasta: Date | null
      estado: string
      moneda: string
      subtotal: Prisma.Decimal
      iva: Prisma.Decimal
      total: Prisma.Decimal
      notas: string | null
    }, ExtArgs["result"]["cotizacion"]>
    composites: {}
  }

  type CotizacionGetPayload<S extends boolean | null | undefined | CotizacionDefaultArgs> = $Result.GetResult<Prisma.$CotizacionPayload, S>

  type CotizacionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CotizacionFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CotizacionCountAggregateInputType | true
    }

  export interface CotizacionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Cotizacion'], meta: { name: 'Cotizacion' } }
    /**
     * Find zero or one Cotizacion that matches the filter.
     * @param {CotizacionFindUniqueArgs} args - Arguments to find a Cotizacion
     * @example
     * // Get one Cotizacion
     * const cotizacion = await prisma.cotizacion.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CotizacionFindUniqueArgs>(args: SelectSubset<T, CotizacionFindUniqueArgs<ExtArgs>>): Prisma__CotizacionClient<$Result.GetResult<Prisma.$CotizacionPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Cotizacion that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CotizacionFindUniqueOrThrowArgs} args - Arguments to find a Cotizacion
     * @example
     * // Get one Cotizacion
     * const cotizacion = await prisma.cotizacion.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CotizacionFindUniqueOrThrowArgs>(args: SelectSubset<T, CotizacionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CotizacionClient<$Result.GetResult<Prisma.$CotizacionPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Cotizacion that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CotizacionFindFirstArgs} args - Arguments to find a Cotizacion
     * @example
     * // Get one Cotizacion
     * const cotizacion = await prisma.cotizacion.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CotizacionFindFirstArgs>(args?: SelectSubset<T, CotizacionFindFirstArgs<ExtArgs>>): Prisma__CotizacionClient<$Result.GetResult<Prisma.$CotizacionPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Cotizacion that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CotizacionFindFirstOrThrowArgs} args - Arguments to find a Cotizacion
     * @example
     * // Get one Cotizacion
     * const cotizacion = await prisma.cotizacion.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CotizacionFindFirstOrThrowArgs>(args?: SelectSubset<T, CotizacionFindFirstOrThrowArgs<ExtArgs>>): Prisma__CotizacionClient<$Result.GetResult<Prisma.$CotizacionPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Cotizacions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CotizacionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Cotizacions
     * const cotizacions = await prisma.cotizacion.findMany()
     * 
     * // Get first 10 Cotizacions
     * const cotizacions = await prisma.cotizacion.findMany({ take: 10 })
     * 
     * // Only select the `id_cotizacion`
     * const cotizacionWithId_cotizacionOnly = await prisma.cotizacion.findMany({ select: { id_cotizacion: true } })
     * 
     */
    findMany<T extends CotizacionFindManyArgs>(args?: SelectSubset<T, CotizacionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CotizacionPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Cotizacion.
     * @param {CotizacionCreateArgs} args - Arguments to create a Cotizacion.
     * @example
     * // Create one Cotizacion
     * const Cotizacion = await prisma.cotizacion.create({
     *   data: {
     *     // ... data to create a Cotizacion
     *   }
     * })
     * 
     */
    create<T extends CotizacionCreateArgs>(args: SelectSubset<T, CotizacionCreateArgs<ExtArgs>>): Prisma__CotizacionClient<$Result.GetResult<Prisma.$CotizacionPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Cotizacions.
     * @param {CotizacionCreateManyArgs} args - Arguments to create many Cotizacions.
     * @example
     * // Create many Cotizacions
     * const cotizacion = await prisma.cotizacion.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CotizacionCreateManyArgs>(args?: SelectSubset<T, CotizacionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Cotizacions and returns the data saved in the database.
     * @param {CotizacionCreateManyAndReturnArgs} args - Arguments to create many Cotizacions.
     * @example
     * // Create many Cotizacions
     * const cotizacion = await prisma.cotizacion.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Cotizacions and only return the `id_cotizacion`
     * const cotizacionWithId_cotizacionOnly = await prisma.cotizacion.createManyAndReturn({ 
     *   select: { id_cotizacion: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CotizacionCreateManyAndReturnArgs>(args?: SelectSubset<T, CotizacionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CotizacionPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Cotizacion.
     * @param {CotizacionDeleteArgs} args - Arguments to delete one Cotizacion.
     * @example
     * // Delete one Cotizacion
     * const Cotizacion = await prisma.cotizacion.delete({
     *   where: {
     *     // ... filter to delete one Cotizacion
     *   }
     * })
     * 
     */
    delete<T extends CotizacionDeleteArgs>(args: SelectSubset<T, CotizacionDeleteArgs<ExtArgs>>): Prisma__CotizacionClient<$Result.GetResult<Prisma.$CotizacionPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Cotizacion.
     * @param {CotizacionUpdateArgs} args - Arguments to update one Cotizacion.
     * @example
     * // Update one Cotizacion
     * const cotizacion = await prisma.cotizacion.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CotizacionUpdateArgs>(args: SelectSubset<T, CotizacionUpdateArgs<ExtArgs>>): Prisma__CotizacionClient<$Result.GetResult<Prisma.$CotizacionPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Cotizacions.
     * @param {CotizacionDeleteManyArgs} args - Arguments to filter Cotizacions to delete.
     * @example
     * // Delete a few Cotizacions
     * const { count } = await prisma.cotizacion.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CotizacionDeleteManyArgs>(args?: SelectSubset<T, CotizacionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Cotizacions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CotizacionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Cotizacions
     * const cotizacion = await prisma.cotizacion.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CotizacionUpdateManyArgs>(args: SelectSubset<T, CotizacionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Cotizacion.
     * @param {CotizacionUpsertArgs} args - Arguments to update or create a Cotizacion.
     * @example
     * // Update or create a Cotizacion
     * const cotizacion = await prisma.cotizacion.upsert({
     *   create: {
     *     // ... data to create a Cotizacion
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Cotizacion we want to update
     *   }
     * })
     */
    upsert<T extends CotizacionUpsertArgs>(args: SelectSubset<T, CotizacionUpsertArgs<ExtArgs>>): Prisma__CotizacionClient<$Result.GetResult<Prisma.$CotizacionPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Cotizacions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CotizacionCountArgs} args - Arguments to filter Cotizacions to count.
     * @example
     * // Count the number of Cotizacions
     * const count = await prisma.cotizacion.count({
     *   where: {
     *     // ... the filter for the Cotizacions we want to count
     *   }
     * })
    **/
    count<T extends CotizacionCountArgs>(
      args?: Subset<T, CotizacionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CotizacionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Cotizacion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CotizacionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends CotizacionAggregateArgs>(args: Subset<T, CotizacionAggregateArgs>): Prisma.PrismaPromise<GetCotizacionAggregateType<T>>

    /**
     * Group by Cotizacion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CotizacionGroupByArgs} args - Group by arguments.
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
      T extends CotizacionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CotizacionGroupByArgs['orderBy'] }
        : { orderBy?: CotizacionGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, CotizacionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCotizacionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Cotizacion model
   */
  readonly fields: CotizacionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Cotizacion.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CotizacionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    cliente<T extends ClienteDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ClienteDefaultArgs<ExtArgs>>): Prisma__ClienteClient<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    facturas<T extends Cotizacion$facturasArgs<ExtArgs> = {}>(args?: Subset<T, Cotizacion$facturasArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FacturaPayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the Cotizacion model
   */ 
  interface CotizacionFieldRefs {
    readonly id_cotizacion: FieldRef<"Cotizacion", 'String'>
    readonly tenant_id: FieldRef<"Cotizacion", 'String'>
    readonly proyecto_id: FieldRef<"Cotizacion", 'String'>
    readonly cliente_id: FieldRef<"Cotizacion", 'String'>
    readonly codigo: FieldRef<"Cotizacion", 'String'>
    readonly fecha_emision: FieldRef<"Cotizacion", 'DateTime'>
    readonly vigencia_hasta: FieldRef<"Cotizacion", 'DateTime'>
    readonly estado: FieldRef<"Cotizacion", 'String'>
    readonly moneda: FieldRef<"Cotizacion", 'String'>
    readonly subtotal: FieldRef<"Cotizacion", 'Decimal'>
    readonly iva: FieldRef<"Cotizacion", 'Decimal'>
    readonly total: FieldRef<"Cotizacion", 'Decimal'>
    readonly notas: FieldRef<"Cotizacion", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Cotizacion findUnique
   */
  export type CotizacionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cotizacion
     */
    select?: CotizacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CotizacionInclude<ExtArgs> | null
    /**
     * Filter, which Cotizacion to fetch.
     */
    where: CotizacionWhereUniqueInput
  }

  /**
   * Cotizacion findUniqueOrThrow
   */
  export type CotizacionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cotizacion
     */
    select?: CotizacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CotizacionInclude<ExtArgs> | null
    /**
     * Filter, which Cotizacion to fetch.
     */
    where: CotizacionWhereUniqueInput
  }

  /**
   * Cotizacion findFirst
   */
  export type CotizacionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cotizacion
     */
    select?: CotizacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CotizacionInclude<ExtArgs> | null
    /**
     * Filter, which Cotizacion to fetch.
     */
    where?: CotizacionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Cotizacions to fetch.
     */
    orderBy?: CotizacionOrderByWithRelationInput | CotizacionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Cotizacions.
     */
    cursor?: CotizacionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Cotizacions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Cotizacions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Cotizacions.
     */
    distinct?: CotizacionScalarFieldEnum | CotizacionScalarFieldEnum[]
  }

  /**
   * Cotizacion findFirstOrThrow
   */
  export type CotizacionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cotizacion
     */
    select?: CotizacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CotizacionInclude<ExtArgs> | null
    /**
     * Filter, which Cotizacion to fetch.
     */
    where?: CotizacionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Cotizacions to fetch.
     */
    orderBy?: CotizacionOrderByWithRelationInput | CotizacionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Cotizacions.
     */
    cursor?: CotizacionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Cotizacions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Cotizacions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Cotizacions.
     */
    distinct?: CotizacionScalarFieldEnum | CotizacionScalarFieldEnum[]
  }

  /**
   * Cotizacion findMany
   */
  export type CotizacionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cotizacion
     */
    select?: CotizacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CotizacionInclude<ExtArgs> | null
    /**
     * Filter, which Cotizacions to fetch.
     */
    where?: CotizacionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Cotizacions to fetch.
     */
    orderBy?: CotizacionOrderByWithRelationInput | CotizacionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Cotizacions.
     */
    cursor?: CotizacionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Cotizacions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Cotizacions.
     */
    skip?: number
    distinct?: CotizacionScalarFieldEnum | CotizacionScalarFieldEnum[]
  }

  /**
   * Cotizacion create
   */
  export type CotizacionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cotizacion
     */
    select?: CotizacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CotizacionInclude<ExtArgs> | null
    /**
     * The data needed to create a Cotizacion.
     */
    data: XOR<CotizacionCreateInput, CotizacionUncheckedCreateInput>
  }

  /**
   * Cotizacion createMany
   */
  export type CotizacionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Cotizacions.
     */
    data: CotizacionCreateManyInput | CotizacionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Cotizacion createManyAndReturn
   */
  export type CotizacionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cotizacion
     */
    select?: CotizacionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Cotizacions.
     */
    data: CotizacionCreateManyInput | CotizacionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CotizacionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Cotizacion update
   */
  export type CotizacionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cotizacion
     */
    select?: CotizacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CotizacionInclude<ExtArgs> | null
    /**
     * The data needed to update a Cotizacion.
     */
    data: XOR<CotizacionUpdateInput, CotizacionUncheckedUpdateInput>
    /**
     * Choose, which Cotizacion to update.
     */
    where: CotizacionWhereUniqueInput
  }

  /**
   * Cotizacion updateMany
   */
  export type CotizacionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Cotizacions.
     */
    data: XOR<CotizacionUpdateManyMutationInput, CotizacionUncheckedUpdateManyInput>
    /**
     * Filter which Cotizacions to update
     */
    where?: CotizacionWhereInput
  }

  /**
   * Cotizacion upsert
   */
  export type CotizacionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cotizacion
     */
    select?: CotizacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CotizacionInclude<ExtArgs> | null
    /**
     * The filter to search for the Cotizacion to update in case it exists.
     */
    where: CotizacionWhereUniqueInput
    /**
     * In case the Cotizacion found by the `where` argument doesn't exist, create a new Cotizacion with this data.
     */
    create: XOR<CotizacionCreateInput, CotizacionUncheckedCreateInput>
    /**
     * In case the Cotizacion was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CotizacionUpdateInput, CotizacionUncheckedUpdateInput>
  }

  /**
   * Cotizacion delete
   */
  export type CotizacionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cotizacion
     */
    select?: CotizacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CotizacionInclude<ExtArgs> | null
    /**
     * Filter which Cotizacion to delete.
     */
    where: CotizacionWhereUniqueInput
  }

  /**
   * Cotizacion deleteMany
   */
  export type CotizacionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Cotizacions to delete
     */
    where?: CotizacionWhereInput
  }

  /**
   * Cotizacion.facturas
   */
  export type Cotizacion$facturasArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Factura
     */
    select?: FacturaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FacturaInclude<ExtArgs> | null
    where?: FacturaWhereInput
    orderBy?: FacturaOrderByWithRelationInput | FacturaOrderByWithRelationInput[]
    cursor?: FacturaWhereUniqueInput
    take?: number
    skip?: number
    distinct?: FacturaScalarFieldEnum | FacturaScalarFieldEnum[]
  }

  /**
   * Cotizacion without action
   */
  export type CotizacionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cotizacion
     */
    select?: CotizacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CotizacionInclude<ExtArgs> | null
  }


  /**
   * Model Factura
   */

  export type AggregateFactura = {
    _count: FacturaCountAggregateOutputType | null
    _avg: FacturaAvgAggregateOutputType | null
    _sum: FacturaSumAggregateOutputType | null
    _min: FacturaMinAggregateOutputType | null
    _max: FacturaMaxAggregateOutputType | null
  }

  export type FacturaAvgAggregateOutputType = {
    subtotal: Decimal | null
    iva: Decimal | null
    total: Decimal | null
  }

  export type FacturaSumAggregateOutputType = {
    subtotal: Decimal | null
    iva: Decimal | null
    total: Decimal | null
  }

  export type FacturaMinAggregateOutputType = {
    id_factura: string | null
    tenant_id: string | null
    proyecto_id: string | null
    cliente_id: string | null
    cotizacion_id: string | null
    codigo: string | null
    fecha_emision: Date | null
    estado: string | null
    moneda: string | null
    subtotal: Decimal | null
    iva: Decimal | null
    total: Decimal | null
  }

  export type FacturaMaxAggregateOutputType = {
    id_factura: string | null
    tenant_id: string | null
    proyecto_id: string | null
    cliente_id: string | null
    cotizacion_id: string | null
    codigo: string | null
    fecha_emision: Date | null
    estado: string | null
    moneda: string | null
    subtotal: Decimal | null
    iva: Decimal | null
    total: Decimal | null
  }

  export type FacturaCountAggregateOutputType = {
    id_factura: number
    tenant_id: number
    proyecto_id: number
    cliente_id: number
    cotizacion_id: number
    codigo: number
    fecha_emision: number
    estado: number
    moneda: number
    subtotal: number
    iva: number
    total: number
    _all: number
  }


  export type FacturaAvgAggregateInputType = {
    subtotal?: true
    iva?: true
    total?: true
  }

  export type FacturaSumAggregateInputType = {
    subtotal?: true
    iva?: true
    total?: true
  }

  export type FacturaMinAggregateInputType = {
    id_factura?: true
    tenant_id?: true
    proyecto_id?: true
    cliente_id?: true
    cotizacion_id?: true
    codigo?: true
    fecha_emision?: true
    estado?: true
    moneda?: true
    subtotal?: true
    iva?: true
    total?: true
  }

  export type FacturaMaxAggregateInputType = {
    id_factura?: true
    tenant_id?: true
    proyecto_id?: true
    cliente_id?: true
    cotizacion_id?: true
    codigo?: true
    fecha_emision?: true
    estado?: true
    moneda?: true
    subtotal?: true
    iva?: true
    total?: true
  }

  export type FacturaCountAggregateInputType = {
    id_factura?: true
    tenant_id?: true
    proyecto_id?: true
    cliente_id?: true
    cotizacion_id?: true
    codigo?: true
    fecha_emision?: true
    estado?: true
    moneda?: true
    subtotal?: true
    iva?: true
    total?: true
    _all?: true
  }

  export type FacturaAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Factura to aggregate.
     */
    where?: FacturaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Facturas to fetch.
     */
    orderBy?: FacturaOrderByWithRelationInput | FacturaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FacturaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Facturas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Facturas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Facturas
    **/
    _count?: true | FacturaCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: FacturaAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: FacturaSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FacturaMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FacturaMaxAggregateInputType
  }

  export type GetFacturaAggregateType<T extends FacturaAggregateArgs> = {
        [P in keyof T & keyof AggregateFactura]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFactura[P]>
      : GetScalarType<T[P], AggregateFactura[P]>
  }




  export type FacturaGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FacturaWhereInput
    orderBy?: FacturaOrderByWithAggregationInput | FacturaOrderByWithAggregationInput[]
    by: FacturaScalarFieldEnum[] | FacturaScalarFieldEnum
    having?: FacturaScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FacturaCountAggregateInputType | true
    _avg?: FacturaAvgAggregateInputType
    _sum?: FacturaSumAggregateInputType
    _min?: FacturaMinAggregateInputType
    _max?: FacturaMaxAggregateInputType
  }

  export type FacturaGroupByOutputType = {
    id_factura: string
    tenant_id: string
    proyecto_id: string
    cliente_id: string
    cotizacion_id: string | null
    codigo: string
    fecha_emision: Date
    estado: string
    moneda: string
    subtotal: Decimal
    iva: Decimal
    total: Decimal
    _count: FacturaCountAggregateOutputType | null
    _avg: FacturaAvgAggregateOutputType | null
    _sum: FacturaSumAggregateOutputType | null
    _min: FacturaMinAggregateOutputType | null
    _max: FacturaMaxAggregateOutputType | null
  }

  type GetFacturaGroupByPayload<T extends FacturaGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FacturaGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FacturaGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FacturaGroupByOutputType[P]>
            : GetScalarType<T[P], FacturaGroupByOutputType[P]>
        }
      >
    >


  export type FacturaSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_factura?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    cliente_id?: boolean
    cotizacion_id?: boolean
    codigo?: boolean
    fecha_emision?: boolean
    estado?: boolean
    moneda?: boolean
    subtotal?: boolean
    iva?: boolean
    total?: boolean
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
    cotizacion?: boolean | Factura$cotizacionArgs<ExtArgs>
  }, ExtArgs["result"]["factura"]>

  export type FacturaSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_factura?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    cliente_id?: boolean
    cotizacion_id?: boolean
    codigo?: boolean
    fecha_emision?: boolean
    estado?: boolean
    moneda?: boolean
    subtotal?: boolean
    iva?: boolean
    total?: boolean
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
    cotizacion?: boolean | Factura$cotizacionArgs<ExtArgs>
  }, ExtArgs["result"]["factura"]>

  export type FacturaSelectScalar = {
    id_factura?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    cliente_id?: boolean
    cotizacion_id?: boolean
    codigo?: boolean
    fecha_emision?: boolean
    estado?: boolean
    moneda?: boolean
    subtotal?: boolean
    iva?: boolean
    total?: boolean
  }

  export type FacturaInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
    cotizacion?: boolean | Factura$cotizacionArgs<ExtArgs>
  }
  export type FacturaIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
    cotizacion?: boolean | Factura$cotizacionArgs<ExtArgs>
  }

  export type $FacturaPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Factura"
    objects: {
      cliente: Prisma.$ClientePayload<ExtArgs>
      cotizacion: Prisma.$CotizacionPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id_factura: string
      tenant_id: string
      proyecto_id: string
      cliente_id: string
      cotizacion_id: string | null
      codigo: string
      fecha_emision: Date
      estado: string
      moneda: string
      subtotal: Prisma.Decimal
      iva: Prisma.Decimal
      total: Prisma.Decimal
    }, ExtArgs["result"]["factura"]>
    composites: {}
  }

  type FacturaGetPayload<S extends boolean | null | undefined | FacturaDefaultArgs> = $Result.GetResult<Prisma.$FacturaPayload, S>

  type FacturaCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<FacturaFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: FacturaCountAggregateInputType | true
    }

  export interface FacturaDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Factura'], meta: { name: 'Factura' } }
    /**
     * Find zero or one Factura that matches the filter.
     * @param {FacturaFindUniqueArgs} args - Arguments to find a Factura
     * @example
     * // Get one Factura
     * const factura = await prisma.factura.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FacturaFindUniqueArgs>(args: SelectSubset<T, FacturaFindUniqueArgs<ExtArgs>>): Prisma__FacturaClient<$Result.GetResult<Prisma.$FacturaPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Factura that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {FacturaFindUniqueOrThrowArgs} args - Arguments to find a Factura
     * @example
     * // Get one Factura
     * const factura = await prisma.factura.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FacturaFindUniqueOrThrowArgs>(args: SelectSubset<T, FacturaFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FacturaClient<$Result.GetResult<Prisma.$FacturaPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Factura that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FacturaFindFirstArgs} args - Arguments to find a Factura
     * @example
     * // Get one Factura
     * const factura = await prisma.factura.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FacturaFindFirstArgs>(args?: SelectSubset<T, FacturaFindFirstArgs<ExtArgs>>): Prisma__FacturaClient<$Result.GetResult<Prisma.$FacturaPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Factura that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FacturaFindFirstOrThrowArgs} args - Arguments to find a Factura
     * @example
     * // Get one Factura
     * const factura = await prisma.factura.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FacturaFindFirstOrThrowArgs>(args?: SelectSubset<T, FacturaFindFirstOrThrowArgs<ExtArgs>>): Prisma__FacturaClient<$Result.GetResult<Prisma.$FacturaPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Facturas that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FacturaFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Facturas
     * const facturas = await prisma.factura.findMany()
     * 
     * // Get first 10 Facturas
     * const facturas = await prisma.factura.findMany({ take: 10 })
     * 
     * // Only select the `id_factura`
     * const facturaWithId_facturaOnly = await prisma.factura.findMany({ select: { id_factura: true } })
     * 
     */
    findMany<T extends FacturaFindManyArgs>(args?: SelectSubset<T, FacturaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FacturaPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Factura.
     * @param {FacturaCreateArgs} args - Arguments to create a Factura.
     * @example
     * // Create one Factura
     * const Factura = await prisma.factura.create({
     *   data: {
     *     // ... data to create a Factura
     *   }
     * })
     * 
     */
    create<T extends FacturaCreateArgs>(args: SelectSubset<T, FacturaCreateArgs<ExtArgs>>): Prisma__FacturaClient<$Result.GetResult<Prisma.$FacturaPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Facturas.
     * @param {FacturaCreateManyArgs} args - Arguments to create many Facturas.
     * @example
     * // Create many Facturas
     * const factura = await prisma.factura.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FacturaCreateManyArgs>(args?: SelectSubset<T, FacturaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Facturas and returns the data saved in the database.
     * @param {FacturaCreateManyAndReturnArgs} args - Arguments to create many Facturas.
     * @example
     * // Create many Facturas
     * const factura = await prisma.factura.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Facturas and only return the `id_factura`
     * const facturaWithId_facturaOnly = await prisma.factura.createManyAndReturn({ 
     *   select: { id_factura: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FacturaCreateManyAndReturnArgs>(args?: SelectSubset<T, FacturaCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FacturaPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Factura.
     * @param {FacturaDeleteArgs} args - Arguments to delete one Factura.
     * @example
     * // Delete one Factura
     * const Factura = await prisma.factura.delete({
     *   where: {
     *     // ... filter to delete one Factura
     *   }
     * })
     * 
     */
    delete<T extends FacturaDeleteArgs>(args: SelectSubset<T, FacturaDeleteArgs<ExtArgs>>): Prisma__FacturaClient<$Result.GetResult<Prisma.$FacturaPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Factura.
     * @param {FacturaUpdateArgs} args - Arguments to update one Factura.
     * @example
     * // Update one Factura
     * const factura = await prisma.factura.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FacturaUpdateArgs>(args: SelectSubset<T, FacturaUpdateArgs<ExtArgs>>): Prisma__FacturaClient<$Result.GetResult<Prisma.$FacturaPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Facturas.
     * @param {FacturaDeleteManyArgs} args - Arguments to filter Facturas to delete.
     * @example
     * // Delete a few Facturas
     * const { count } = await prisma.factura.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FacturaDeleteManyArgs>(args?: SelectSubset<T, FacturaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Facturas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FacturaUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Facturas
     * const factura = await prisma.factura.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FacturaUpdateManyArgs>(args: SelectSubset<T, FacturaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Factura.
     * @param {FacturaUpsertArgs} args - Arguments to update or create a Factura.
     * @example
     * // Update or create a Factura
     * const factura = await prisma.factura.upsert({
     *   create: {
     *     // ... data to create a Factura
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Factura we want to update
     *   }
     * })
     */
    upsert<T extends FacturaUpsertArgs>(args: SelectSubset<T, FacturaUpsertArgs<ExtArgs>>): Prisma__FacturaClient<$Result.GetResult<Prisma.$FacturaPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Facturas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FacturaCountArgs} args - Arguments to filter Facturas to count.
     * @example
     * // Count the number of Facturas
     * const count = await prisma.factura.count({
     *   where: {
     *     // ... the filter for the Facturas we want to count
     *   }
     * })
    **/
    count<T extends FacturaCountArgs>(
      args?: Subset<T, FacturaCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FacturaCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Factura.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FacturaAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends FacturaAggregateArgs>(args: Subset<T, FacturaAggregateArgs>): Prisma.PrismaPromise<GetFacturaAggregateType<T>>

    /**
     * Group by Factura.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FacturaGroupByArgs} args - Group by arguments.
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
      T extends FacturaGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FacturaGroupByArgs['orderBy'] }
        : { orderBy?: FacturaGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, FacturaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFacturaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Factura model
   */
  readonly fields: FacturaFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Factura.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FacturaClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    cliente<T extends ClienteDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ClienteDefaultArgs<ExtArgs>>): Prisma__ClienteClient<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    cotizacion<T extends Factura$cotizacionArgs<ExtArgs> = {}>(args?: Subset<T, Factura$cotizacionArgs<ExtArgs>>): Prisma__CotizacionClient<$Result.GetResult<Prisma.$CotizacionPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
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
   * Fields of the Factura model
   */ 
  interface FacturaFieldRefs {
    readonly id_factura: FieldRef<"Factura", 'String'>
    readonly tenant_id: FieldRef<"Factura", 'String'>
    readonly proyecto_id: FieldRef<"Factura", 'String'>
    readonly cliente_id: FieldRef<"Factura", 'String'>
    readonly cotizacion_id: FieldRef<"Factura", 'String'>
    readonly codigo: FieldRef<"Factura", 'String'>
    readonly fecha_emision: FieldRef<"Factura", 'DateTime'>
    readonly estado: FieldRef<"Factura", 'String'>
    readonly moneda: FieldRef<"Factura", 'String'>
    readonly subtotal: FieldRef<"Factura", 'Decimal'>
    readonly iva: FieldRef<"Factura", 'Decimal'>
    readonly total: FieldRef<"Factura", 'Decimal'>
  }
    

  // Custom InputTypes
  /**
   * Factura findUnique
   */
  export type FacturaFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Factura
     */
    select?: FacturaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FacturaInclude<ExtArgs> | null
    /**
     * Filter, which Factura to fetch.
     */
    where: FacturaWhereUniqueInput
  }

  /**
   * Factura findUniqueOrThrow
   */
  export type FacturaFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Factura
     */
    select?: FacturaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FacturaInclude<ExtArgs> | null
    /**
     * Filter, which Factura to fetch.
     */
    where: FacturaWhereUniqueInput
  }

  /**
   * Factura findFirst
   */
  export type FacturaFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Factura
     */
    select?: FacturaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FacturaInclude<ExtArgs> | null
    /**
     * Filter, which Factura to fetch.
     */
    where?: FacturaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Facturas to fetch.
     */
    orderBy?: FacturaOrderByWithRelationInput | FacturaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Facturas.
     */
    cursor?: FacturaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Facturas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Facturas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Facturas.
     */
    distinct?: FacturaScalarFieldEnum | FacturaScalarFieldEnum[]
  }

  /**
   * Factura findFirstOrThrow
   */
  export type FacturaFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Factura
     */
    select?: FacturaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FacturaInclude<ExtArgs> | null
    /**
     * Filter, which Factura to fetch.
     */
    where?: FacturaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Facturas to fetch.
     */
    orderBy?: FacturaOrderByWithRelationInput | FacturaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Facturas.
     */
    cursor?: FacturaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Facturas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Facturas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Facturas.
     */
    distinct?: FacturaScalarFieldEnum | FacturaScalarFieldEnum[]
  }

  /**
   * Factura findMany
   */
  export type FacturaFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Factura
     */
    select?: FacturaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FacturaInclude<ExtArgs> | null
    /**
     * Filter, which Facturas to fetch.
     */
    where?: FacturaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Facturas to fetch.
     */
    orderBy?: FacturaOrderByWithRelationInput | FacturaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Facturas.
     */
    cursor?: FacturaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Facturas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Facturas.
     */
    skip?: number
    distinct?: FacturaScalarFieldEnum | FacturaScalarFieldEnum[]
  }

  /**
   * Factura create
   */
  export type FacturaCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Factura
     */
    select?: FacturaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FacturaInclude<ExtArgs> | null
    /**
     * The data needed to create a Factura.
     */
    data: XOR<FacturaCreateInput, FacturaUncheckedCreateInput>
  }

  /**
   * Factura createMany
   */
  export type FacturaCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Facturas.
     */
    data: FacturaCreateManyInput | FacturaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Factura createManyAndReturn
   */
  export type FacturaCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Factura
     */
    select?: FacturaSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Facturas.
     */
    data: FacturaCreateManyInput | FacturaCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FacturaIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Factura update
   */
  export type FacturaUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Factura
     */
    select?: FacturaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FacturaInclude<ExtArgs> | null
    /**
     * The data needed to update a Factura.
     */
    data: XOR<FacturaUpdateInput, FacturaUncheckedUpdateInput>
    /**
     * Choose, which Factura to update.
     */
    where: FacturaWhereUniqueInput
  }

  /**
   * Factura updateMany
   */
  export type FacturaUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Facturas.
     */
    data: XOR<FacturaUpdateManyMutationInput, FacturaUncheckedUpdateManyInput>
    /**
     * Filter which Facturas to update
     */
    where?: FacturaWhereInput
  }

  /**
   * Factura upsert
   */
  export type FacturaUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Factura
     */
    select?: FacturaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FacturaInclude<ExtArgs> | null
    /**
     * The filter to search for the Factura to update in case it exists.
     */
    where: FacturaWhereUniqueInput
    /**
     * In case the Factura found by the `where` argument doesn't exist, create a new Factura with this data.
     */
    create: XOR<FacturaCreateInput, FacturaUncheckedCreateInput>
    /**
     * In case the Factura was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FacturaUpdateInput, FacturaUncheckedUpdateInput>
  }

  /**
   * Factura delete
   */
  export type FacturaDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Factura
     */
    select?: FacturaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FacturaInclude<ExtArgs> | null
    /**
     * Filter which Factura to delete.
     */
    where: FacturaWhereUniqueInput
  }

  /**
   * Factura deleteMany
   */
  export type FacturaDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Facturas to delete
     */
    where?: FacturaWhereInput
  }

  /**
   * Factura.cotizacion
   */
  export type Factura$cotizacionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cotizacion
     */
    select?: CotizacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CotizacionInclude<ExtArgs> | null
    where?: CotizacionWhereInput
  }

  /**
   * Factura without action
   */
  export type FacturaDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Factura
     */
    select?: FacturaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FacturaInclude<ExtArgs> | null
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


  export const ClienteScalarFieldEnum: {
    id_cliente: 'id_cliente',
    tenant_id: 'tenant_id',
    tercero_id: 'tercero_id',
    rfc_tax_id: 'rfc_tax_id',
    razon_social: 'razon_social',
    email_contacto: 'email_contacto',
    telefono: 'telefono',
    estatus: 'estatus'
  };

  export type ClienteScalarFieldEnum = (typeof ClienteScalarFieldEnum)[keyof typeof ClienteScalarFieldEnum]


  export const CotizacionScalarFieldEnum: {
    id_cotizacion: 'id_cotizacion',
    tenant_id: 'tenant_id',
    proyecto_id: 'proyecto_id',
    cliente_id: 'cliente_id',
    codigo: 'codigo',
    fecha_emision: 'fecha_emision',
    vigencia_hasta: 'vigencia_hasta',
    estado: 'estado',
    moneda: 'moneda',
    subtotal: 'subtotal',
    iva: 'iva',
    total: 'total',
    notas: 'notas'
  };

  export type CotizacionScalarFieldEnum = (typeof CotizacionScalarFieldEnum)[keyof typeof CotizacionScalarFieldEnum]


  export const FacturaScalarFieldEnum: {
    id_factura: 'id_factura',
    tenant_id: 'tenant_id',
    proyecto_id: 'proyecto_id',
    cliente_id: 'cliente_id',
    cotizacion_id: 'cotizacion_id',
    codigo: 'codigo',
    fecha_emision: 'fecha_emision',
    estado: 'estado',
    moneda: 'moneda',
    subtotal: 'subtotal',
    iva: 'iva',
    total: 'total'
  };

  export type FacturaScalarFieldEnum = (typeof FacturaScalarFieldEnum)[keyof typeof FacturaScalarFieldEnum]


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


  export type ClienteWhereInput = {
    AND?: ClienteWhereInput | ClienteWhereInput[]
    OR?: ClienteWhereInput[]
    NOT?: ClienteWhereInput | ClienteWhereInput[]
    id_cliente?: UuidFilter<"Cliente"> | string
    tenant_id?: UuidFilter<"Cliente"> | string
    tercero_id?: UuidNullableFilter<"Cliente"> | string | null
    rfc_tax_id?: StringFilter<"Cliente"> | string
    razon_social?: StringFilter<"Cliente"> | string
    email_contacto?: StringNullableFilter<"Cliente"> | string | null
    telefono?: StringNullableFilter<"Cliente"> | string | null
    estatus?: StringFilter<"Cliente"> | string
    cotizaciones?: CotizacionListRelationFilter
    facturas?: FacturaListRelationFilter
  }

  export type ClienteOrderByWithRelationInput = {
    id_cliente?: SortOrder
    tenant_id?: SortOrder
    tercero_id?: SortOrderInput | SortOrder
    rfc_tax_id?: SortOrder
    razon_social?: SortOrder
    email_contacto?: SortOrderInput | SortOrder
    telefono?: SortOrderInput | SortOrder
    estatus?: SortOrder
    cotizaciones?: CotizacionOrderByRelationAggregateInput
    facturas?: FacturaOrderByRelationAggregateInput
  }

  export type ClienteWhereUniqueInput = Prisma.AtLeast<{
    id_cliente?: string
    tenant_id_rfc_tax_id?: ClienteTenant_idRfc_tax_idCompoundUniqueInput
    AND?: ClienteWhereInput | ClienteWhereInput[]
    OR?: ClienteWhereInput[]
    NOT?: ClienteWhereInput | ClienteWhereInput[]
    tenant_id?: UuidFilter<"Cliente"> | string
    tercero_id?: UuidNullableFilter<"Cliente"> | string | null
    rfc_tax_id?: StringFilter<"Cliente"> | string
    razon_social?: StringFilter<"Cliente"> | string
    email_contacto?: StringNullableFilter<"Cliente"> | string | null
    telefono?: StringNullableFilter<"Cliente"> | string | null
    estatus?: StringFilter<"Cliente"> | string
    cotizaciones?: CotizacionListRelationFilter
    facturas?: FacturaListRelationFilter
  }, "id_cliente" | "tenant_id_rfc_tax_id">

  export type ClienteOrderByWithAggregationInput = {
    id_cliente?: SortOrder
    tenant_id?: SortOrder
    tercero_id?: SortOrderInput | SortOrder
    rfc_tax_id?: SortOrder
    razon_social?: SortOrder
    email_contacto?: SortOrderInput | SortOrder
    telefono?: SortOrderInput | SortOrder
    estatus?: SortOrder
    _count?: ClienteCountOrderByAggregateInput
    _max?: ClienteMaxOrderByAggregateInput
    _min?: ClienteMinOrderByAggregateInput
  }

  export type ClienteScalarWhereWithAggregatesInput = {
    AND?: ClienteScalarWhereWithAggregatesInput | ClienteScalarWhereWithAggregatesInput[]
    OR?: ClienteScalarWhereWithAggregatesInput[]
    NOT?: ClienteScalarWhereWithAggregatesInput | ClienteScalarWhereWithAggregatesInput[]
    id_cliente?: UuidWithAggregatesFilter<"Cliente"> | string
    tenant_id?: UuidWithAggregatesFilter<"Cliente"> | string
    tercero_id?: UuidNullableWithAggregatesFilter<"Cliente"> | string | null
    rfc_tax_id?: StringWithAggregatesFilter<"Cliente"> | string
    razon_social?: StringWithAggregatesFilter<"Cliente"> | string
    email_contacto?: StringNullableWithAggregatesFilter<"Cliente"> | string | null
    telefono?: StringNullableWithAggregatesFilter<"Cliente"> | string | null
    estatus?: StringWithAggregatesFilter<"Cliente"> | string
  }

  export type CotizacionWhereInput = {
    AND?: CotizacionWhereInput | CotizacionWhereInput[]
    OR?: CotizacionWhereInput[]
    NOT?: CotizacionWhereInput | CotizacionWhereInput[]
    id_cotizacion?: UuidFilter<"Cotizacion"> | string
    tenant_id?: UuidFilter<"Cotizacion"> | string
    proyecto_id?: UuidFilter<"Cotizacion"> | string
    cliente_id?: UuidFilter<"Cotizacion"> | string
    codigo?: StringFilter<"Cotizacion"> | string
    fecha_emision?: DateTimeFilter<"Cotizacion"> | Date | string
    vigencia_hasta?: DateTimeNullableFilter<"Cotizacion"> | Date | string | null
    estado?: StringFilter<"Cotizacion"> | string
    moneda?: StringFilter<"Cotizacion"> | string
    subtotal?: DecimalFilter<"Cotizacion"> | Decimal | DecimalJsLike | number | string
    iva?: DecimalFilter<"Cotizacion"> | Decimal | DecimalJsLike | number | string
    total?: DecimalFilter<"Cotizacion"> | Decimal | DecimalJsLike | number | string
    notas?: StringNullableFilter<"Cotizacion"> | string | null
    cliente?: XOR<ClienteRelationFilter, ClienteWhereInput>
    facturas?: FacturaListRelationFilter
  }

  export type CotizacionOrderByWithRelationInput = {
    id_cotizacion?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    cliente_id?: SortOrder
    codigo?: SortOrder
    fecha_emision?: SortOrder
    vigencia_hasta?: SortOrderInput | SortOrder
    estado?: SortOrder
    moneda?: SortOrder
    subtotal?: SortOrder
    iva?: SortOrder
    total?: SortOrder
    notas?: SortOrderInput | SortOrder
    cliente?: ClienteOrderByWithRelationInput
    facturas?: FacturaOrderByRelationAggregateInput
  }

  export type CotizacionWhereUniqueInput = Prisma.AtLeast<{
    id_cotizacion?: string
    tenant_id_codigo?: CotizacionTenant_idCodigoCompoundUniqueInput
    AND?: CotizacionWhereInput | CotizacionWhereInput[]
    OR?: CotizacionWhereInput[]
    NOT?: CotizacionWhereInput | CotizacionWhereInput[]
    tenant_id?: UuidFilter<"Cotizacion"> | string
    proyecto_id?: UuidFilter<"Cotizacion"> | string
    cliente_id?: UuidFilter<"Cotizacion"> | string
    codigo?: StringFilter<"Cotizacion"> | string
    fecha_emision?: DateTimeFilter<"Cotizacion"> | Date | string
    vigencia_hasta?: DateTimeNullableFilter<"Cotizacion"> | Date | string | null
    estado?: StringFilter<"Cotizacion"> | string
    moneda?: StringFilter<"Cotizacion"> | string
    subtotal?: DecimalFilter<"Cotizacion"> | Decimal | DecimalJsLike | number | string
    iva?: DecimalFilter<"Cotizacion"> | Decimal | DecimalJsLike | number | string
    total?: DecimalFilter<"Cotizacion"> | Decimal | DecimalJsLike | number | string
    notas?: StringNullableFilter<"Cotizacion"> | string | null
    cliente?: XOR<ClienteRelationFilter, ClienteWhereInput>
    facturas?: FacturaListRelationFilter
  }, "id_cotizacion" | "tenant_id_codigo">

  export type CotizacionOrderByWithAggregationInput = {
    id_cotizacion?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    cliente_id?: SortOrder
    codigo?: SortOrder
    fecha_emision?: SortOrder
    vigencia_hasta?: SortOrderInput | SortOrder
    estado?: SortOrder
    moneda?: SortOrder
    subtotal?: SortOrder
    iva?: SortOrder
    total?: SortOrder
    notas?: SortOrderInput | SortOrder
    _count?: CotizacionCountOrderByAggregateInput
    _avg?: CotizacionAvgOrderByAggregateInput
    _max?: CotizacionMaxOrderByAggregateInput
    _min?: CotizacionMinOrderByAggregateInput
    _sum?: CotizacionSumOrderByAggregateInput
  }

  export type CotizacionScalarWhereWithAggregatesInput = {
    AND?: CotizacionScalarWhereWithAggregatesInput | CotizacionScalarWhereWithAggregatesInput[]
    OR?: CotizacionScalarWhereWithAggregatesInput[]
    NOT?: CotizacionScalarWhereWithAggregatesInput | CotizacionScalarWhereWithAggregatesInput[]
    id_cotizacion?: UuidWithAggregatesFilter<"Cotizacion"> | string
    tenant_id?: UuidWithAggregatesFilter<"Cotizacion"> | string
    proyecto_id?: UuidWithAggregatesFilter<"Cotizacion"> | string
    cliente_id?: UuidWithAggregatesFilter<"Cotizacion"> | string
    codigo?: StringWithAggregatesFilter<"Cotizacion"> | string
    fecha_emision?: DateTimeWithAggregatesFilter<"Cotizacion"> | Date | string
    vigencia_hasta?: DateTimeNullableWithAggregatesFilter<"Cotizacion"> | Date | string | null
    estado?: StringWithAggregatesFilter<"Cotizacion"> | string
    moneda?: StringWithAggregatesFilter<"Cotizacion"> | string
    subtotal?: DecimalWithAggregatesFilter<"Cotizacion"> | Decimal | DecimalJsLike | number | string
    iva?: DecimalWithAggregatesFilter<"Cotizacion"> | Decimal | DecimalJsLike | number | string
    total?: DecimalWithAggregatesFilter<"Cotizacion"> | Decimal | DecimalJsLike | number | string
    notas?: StringNullableWithAggregatesFilter<"Cotizacion"> | string | null
  }

  export type FacturaWhereInput = {
    AND?: FacturaWhereInput | FacturaWhereInput[]
    OR?: FacturaWhereInput[]
    NOT?: FacturaWhereInput | FacturaWhereInput[]
    id_factura?: UuidFilter<"Factura"> | string
    tenant_id?: UuidFilter<"Factura"> | string
    proyecto_id?: UuidFilter<"Factura"> | string
    cliente_id?: UuidFilter<"Factura"> | string
    cotizacion_id?: UuidNullableFilter<"Factura"> | string | null
    codigo?: StringFilter<"Factura"> | string
    fecha_emision?: DateTimeFilter<"Factura"> | Date | string
    estado?: StringFilter<"Factura"> | string
    moneda?: StringFilter<"Factura"> | string
    subtotal?: DecimalFilter<"Factura"> | Decimal | DecimalJsLike | number | string
    iva?: DecimalFilter<"Factura"> | Decimal | DecimalJsLike | number | string
    total?: DecimalFilter<"Factura"> | Decimal | DecimalJsLike | number | string
    cliente?: XOR<ClienteRelationFilter, ClienteWhereInput>
    cotizacion?: XOR<CotizacionNullableRelationFilter, CotizacionWhereInput> | null
  }

  export type FacturaOrderByWithRelationInput = {
    id_factura?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    cliente_id?: SortOrder
    cotizacion_id?: SortOrderInput | SortOrder
    codigo?: SortOrder
    fecha_emision?: SortOrder
    estado?: SortOrder
    moneda?: SortOrder
    subtotal?: SortOrder
    iva?: SortOrder
    total?: SortOrder
    cliente?: ClienteOrderByWithRelationInput
    cotizacion?: CotizacionOrderByWithRelationInput
  }

  export type FacturaWhereUniqueInput = Prisma.AtLeast<{
    id_factura?: string
    tenant_id_codigo?: FacturaTenant_idCodigoCompoundUniqueInput
    AND?: FacturaWhereInput | FacturaWhereInput[]
    OR?: FacturaWhereInput[]
    NOT?: FacturaWhereInput | FacturaWhereInput[]
    tenant_id?: UuidFilter<"Factura"> | string
    proyecto_id?: UuidFilter<"Factura"> | string
    cliente_id?: UuidFilter<"Factura"> | string
    cotizacion_id?: UuidNullableFilter<"Factura"> | string | null
    codigo?: StringFilter<"Factura"> | string
    fecha_emision?: DateTimeFilter<"Factura"> | Date | string
    estado?: StringFilter<"Factura"> | string
    moneda?: StringFilter<"Factura"> | string
    subtotal?: DecimalFilter<"Factura"> | Decimal | DecimalJsLike | number | string
    iva?: DecimalFilter<"Factura"> | Decimal | DecimalJsLike | number | string
    total?: DecimalFilter<"Factura"> | Decimal | DecimalJsLike | number | string
    cliente?: XOR<ClienteRelationFilter, ClienteWhereInput>
    cotizacion?: XOR<CotizacionNullableRelationFilter, CotizacionWhereInput> | null
  }, "id_factura" | "tenant_id_codigo">

  export type FacturaOrderByWithAggregationInput = {
    id_factura?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    cliente_id?: SortOrder
    cotizacion_id?: SortOrderInput | SortOrder
    codigo?: SortOrder
    fecha_emision?: SortOrder
    estado?: SortOrder
    moneda?: SortOrder
    subtotal?: SortOrder
    iva?: SortOrder
    total?: SortOrder
    _count?: FacturaCountOrderByAggregateInput
    _avg?: FacturaAvgOrderByAggregateInput
    _max?: FacturaMaxOrderByAggregateInput
    _min?: FacturaMinOrderByAggregateInput
    _sum?: FacturaSumOrderByAggregateInput
  }

  export type FacturaScalarWhereWithAggregatesInput = {
    AND?: FacturaScalarWhereWithAggregatesInput | FacturaScalarWhereWithAggregatesInput[]
    OR?: FacturaScalarWhereWithAggregatesInput[]
    NOT?: FacturaScalarWhereWithAggregatesInput | FacturaScalarWhereWithAggregatesInput[]
    id_factura?: UuidWithAggregatesFilter<"Factura"> | string
    tenant_id?: UuidWithAggregatesFilter<"Factura"> | string
    proyecto_id?: UuidWithAggregatesFilter<"Factura"> | string
    cliente_id?: UuidWithAggregatesFilter<"Factura"> | string
    cotizacion_id?: UuidNullableWithAggregatesFilter<"Factura"> | string | null
    codigo?: StringWithAggregatesFilter<"Factura"> | string
    fecha_emision?: DateTimeWithAggregatesFilter<"Factura"> | Date | string
    estado?: StringWithAggregatesFilter<"Factura"> | string
    moneda?: StringWithAggregatesFilter<"Factura"> | string
    subtotal?: DecimalWithAggregatesFilter<"Factura"> | Decimal | DecimalJsLike | number | string
    iva?: DecimalWithAggregatesFilter<"Factura"> | Decimal | DecimalJsLike | number | string
    total?: DecimalWithAggregatesFilter<"Factura"> | Decimal | DecimalJsLike | number | string
  }

  export type ClienteCreateInput = {
    id_cliente?: string
    tenant_id: string
    tercero_id?: string | null
    rfc_tax_id: string
    razon_social: string
    email_contacto?: string | null
    telefono?: string | null
    estatus?: string
    cotizaciones?: CotizacionCreateNestedManyWithoutClienteInput
    facturas?: FacturaCreateNestedManyWithoutClienteInput
  }

  export type ClienteUncheckedCreateInput = {
    id_cliente?: string
    tenant_id: string
    tercero_id?: string | null
    rfc_tax_id: string
    razon_social: string
    email_contacto?: string | null
    telefono?: string | null
    estatus?: string
    cotizaciones?: CotizacionUncheckedCreateNestedManyWithoutClienteInput
    facturas?: FacturaUncheckedCreateNestedManyWithoutClienteInput
  }

  export type ClienteUpdateInput = {
    id_cliente?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    tercero_id?: NullableStringFieldUpdateOperationsInput | string | null
    rfc_tax_id?: StringFieldUpdateOperationsInput | string
    razon_social?: StringFieldUpdateOperationsInput | string
    email_contacto?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    estatus?: StringFieldUpdateOperationsInput | string
    cotizaciones?: CotizacionUpdateManyWithoutClienteNestedInput
    facturas?: FacturaUpdateManyWithoutClienteNestedInput
  }

  export type ClienteUncheckedUpdateInput = {
    id_cliente?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    tercero_id?: NullableStringFieldUpdateOperationsInput | string | null
    rfc_tax_id?: StringFieldUpdateOperationsInput | string
    razon_social?: StringFieldUpdateOperationsInput | string
    email_contacto?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    estatus?: StringFieldUpdateOperationsInput | string
    cotizaciones?: CotizacionUncheckedUpdateManyWithoutClienteNestedInput
    facturas?: FacturaUncheckedUpdateManyWithoutClienteNestedInput
  }

  export type ClienteCreateManyInput = {
    id_cliente?: string
    tenant_id: string
    tercero_id?: string | null
    rfc_tax_id: string
    razon_social: string
    email_contacto?: string | null
    telefono?: string | null
    estatus?: string
  }

  export type ClienteUpdateManyMutationInput = {
    id_cliente?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    tercero_id?: NullableStringFieldUpdateOperationsInput | string | null
    rfc_tax_id?: StringFieldUpdateOperationsInput | string
    razon_social?: StringFieldUpdateOperationsInput | string
    email_contacto?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    estatus?: StringFieldUpdateOperationsInput | string
  }

  export type ClienteUncheckedUpdateManyInput = {
    id_cliente?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    tercero_id?: NullableStringFieldUpdateOperationsInput | string | null
    rfc_tax_id?: StringFieldUpdateOperationsInput | string
    razon_social?: StringFieldUpdateOperationsInput | string
    email_contacto?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    estatus?: StringFieldUpdateOperationsInput | string
  }

  export type CotizacionCreateInput = {
    id_cotizacion?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    fecha_emision?: Date | string
    vigencia_hasta?: Date | string | null
    estado?: string
    moneda?: string
    subtotal: Decimal | DecimalJsLike | number | string
    iva: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
    notas?: string | null
    cliente: ClienteCreateNestedOneWithoutCotizacionesInput
    facturas?: FacturaCreateNestedManyWithoutCotizacionInput
  }

  export type CotizacionUncheckedCreateInput = {
    id_cotizacion?: string
    tenant_id: string
    proyecto_id: string
    cliente_id: string
    codigo: string
    fecha_emision?: Date | string
    vigencia_hasta?: Date | string | null
    estado?: string
    moneda?: string
    subtotal: Decimal | DecimalJsLike | number | string
    iva: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
    notas?: string | null
    facturas?: FacturaUncheckedCreateNestedManyWithoutCotizacionInput
  }

  export type CotizacionUpdateInput = {
    id_cotizacion?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    fecha_emision?: DateTimeFieldUpdateOperationsInput | Date | string
    vigencia_hasta?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    moneda?: StringFieldUpdateOperationsInput | string
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    iva?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    cliente?: ClienteUpdateOneRequiredWithoutCotizacionesNestedInput
    facturas?: FacturaUpdateManyWithoutCotizacionNestedInput
  }

  export type CotizacionUncheckedUpdateInput = {
    id_cotizacion?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    cliente_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    fecha_emision?: DateTimeFieldUpdateOperationsInput | Date | string
    vigencia_hasta?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    moneda?: StringFieldUpdateOperationsInput | string
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    iva?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    facturas?: FacturaUncheckedUpdateManyWithoutCotizacionNestedInput
  }

  export type CotizacionCreateManyInput = {
    id_cotizacion?: string
    tenant_id: string
    proyecto_id: string
    cliente_id: string
    codigo: string
    fecha_emision?: Date | string
    vigencia_hasta?: Date | string | null
    estado?: string
    moneda?: string
    subtotal: Decimal | DecimalJsLike | number | string
    iva: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
    notas?: string | null
  }

  export type CotizacionUpdateManyMutationInput = {
    id_cotizacion?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    fecha_emision?: DateTimeFieldUpdateOperationsInput | Date | string
    vigencia_hasta?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    moneda?: StringFieldUpdateOperationsInput | string
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    iva?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type CotizacionUncheckedUpdateManyInput = {
    id_cotizacion?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    cliente_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    fecha_emision?: DateTimeFieldUpdateOperationsInput | Date | string
    vigencia_hasta?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    moneda?: StringFieldUpdateOperationsInput | string
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    iva?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type FacturaCreateInput = {
    id_factura?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    fecha_emision?: Date | string
    estado?: string
    moneda?: string
    subtotal: Decimal | DecimalJsLike | number | string
    iva: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
    cliente: ClienteCreateNestedOneWithoutFacturasInput
    cotizacion?: CotizacionCreateNestedOneWithoutFacturasInput
  }

  export type FacturaUncheckedCreateInput = {
    id_factura?: string
    tenant_id: string
    proyecto_id: string
    cliente_id: string
    cotizacion_id?: string | null
    codigo: string
    fecha_emision?: Date | string
    estado?: string
    moneda?: string
    subtotal: Decimal | DecimalJsLike | number | string
    iva: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
  }

  export type FacturaUpdateInput = {
    id_factura?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    fecha_emision?: DateTimeFieldUpdateOperationsInput | Date | string
    estado?: StringFieldUpdateOperationsInput | string
    moneda?: StringFieldUpdateOperationsInput | string
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    iva?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cliente?: ClienteUpdateOneRequiredWithoutFacturasNestedInput
    cotizacion?: CotizacionUpdateOneWithoutFacturasNestedInput
  }

  export type FacturaUncheckedUpdateInput = {
    id_factura?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    cliente_id?: StringFieldUpdateOperationsInput | string
    cotizacion_id?: NullableStringFieldUpdateOperationsInput | string | null
    codigo?: StringFieldUpdateOperationsInput | string
    fecha_emision?: DateTimeFieldUpdateOperationsInput | Date | string
    estado?: StringFieldUpdateOperationsInput | string
    moneda?: StringFieldUpdateOperationsInput | string
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    iva?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
  }

  export type FacturaCreateManyInput = {
    id_factura?: string
    tenant_id: string
    proyecto_id: string
    cliente_id: string
    cotizacion_id?: string | null
    codigo: string
    fecha_emision?: Date | string
    estado?: string
    moneda?: string
    subtotal: Decimal | DecimalJsLike | number | string
    iva: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
  }

  export type FacturaUpdateManyMutationInput = {
    id_factura?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    fecha_emision?: DateTimeFieldUpdateOperationsInput | Date | string
    estado?: StringFieldUpdateOperationsInput | string
    moneda?: StringFieldUpdateOperationsInput | string
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    iva?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
  }

  export type FacturaUncheckedUpdateManyInput = {
    id_factura?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    cliente_id?: StringFieldUpdateOperationsInput | string
    cotizacion_id?: NullableStringFieldUpdateOperationsInput | string | null
    codigo?: StringFieldUpdateOperationsInput | string
    fecha_emision?: DateTimeFieldUpdateOperationsInput | Date | string
    estado?: StringFieldUpdateOperationsInput | string
    moneda?: StringFieldUpdateOperationsInput | string
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    iva?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
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

  export type CotizacionListRelationFilter = {
    every?: CotizacionWhereInput
    some?: CotizacionWhereInput
    none?: CotizacionWhereInput
  }

  export type FacturaListRelationFilter = {
    every?: FacturaWhereInput
    some?: FacturaWhereInput
    none?: FacturaWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type CotizacionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type FacturaOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ClienteTenant_idRfc_tax_idCompoundUniqueInput = {
    tenant_id: string
    rfc_tax_id: string
  }

  export type ClienteCountOrderByAggregateInput = {
    id_cliente?: SortOrder
    tenant_id?: SortOrder
    tercero_id?: SortOrder
    rfc_tax_id?: SortOrder
    razon_social?: SortOrder
    email_contacto?: SortOrder
    telefono?: SortOrder
    estatus?: SortOrder
  }

  export type ClienteMaxOrderByAggregateInput = {
    id_cliente?: SortOrder
    tenant_id?: SortOrder
    tercero_id?: SortOrder
    rfc_tax_id?: SortOrder
    razon_social?: SortOrder
    email_contacto?: SortOrder
    telefono?: SortOrder
    estatus?: SortOrder
  }

  export type ClienteMinOrderByAggregateInput = {
    id_cliente?: SortOrder
    tenant_id?: SortOrder
    tercero_id?: SortOrder
    rfc_tax_id?: SortOrder
    razon_social?: SortOrder
    email_contacto?: SortOrder
    telefono?: SortOrder
    estatus?: SortOrder
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

  export type ClienteRelationFilter = {
    is?: ClienteWhereInput
    isNot?: ClienteWhereInput
  }

  export type CotizacionTenant_idCodigoCompoundUniqueInput = {
    tenant_id: string
    codigo: string
  }

  export type CotizacionCountOrderByAggregateInput = {
    id_cotizacion?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    cliente_id?: SortOrder
    codigo?: SortOrder
    fecha_emision?: SortOrder
    vigencia_hasta?: SortOrder
    estado?: SortOrder
    moneda?: SortOrder
    subtotal?: SortOrder
    iva?: SortOrder
    total?: SortOrder
    notas?: SortOrder
  }

  export type CotizacionAvgOrderByAggregateInput = {
    subtotal?: SortOrder
    iva?: SortOrder
    total?: SortOrder
  }

  export type CotizacionMaxOrderByAggregateInput = {
    id_cotizacion?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    cliente_id?: SortOrder
    codigo?: SortOrder
    fecha_emision?: SortOrder
    vigencia_hasta?: SortOrder
    estado?: SortOrder
    moneda?: SortOrder
    subtotal?: SortOrder
    iva?: SortOrder
    total?: SortOrder
    notas?: SortOrder
  }

  export type CotizacionMinOrderByAggregateInput = {
    id_cotizacion?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    cliente_id?: SortOrder
    codigo?: SortOrder
    fecha_emision?: SortOrder
    vigencia_hasta?: SortOrder
    estado?: SortOrder
    moneda?: SortOrder
    subtotal?: SortOrder
    iva?: SortOrder
    total?: SortOrder
    notas?: SortOrder
  }

  export type CotizacionSumOrderByAggregateInput = {
    subtotal?: SortOrder
    iva?: SortOrder
    total?: SortOrder
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

  export type CotizacionNullableRelationFilter = {
    is?: CotizacionWhereInput | null
    isNot?: CotizacionWhereInput | null
  }

  export type FacturaTenant_idCodigoCompoundUniqueInput = {
    tenant_id: string
    codigo: string
  }

  export type FacturaCountOrderByAggregateInput = {
    id_factura?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    cliente_id?: SortOrder
    cotizacion_id?: SortOrder
    codigo?: SortOrder
    fecha_emision?: SortOrder
    estado?: SortOrder
    moneda?: SortOrder
    subtotal?: SortOrder
    iva?: SortOrder
    total?: SortOrder
  }

  export type FacturaAvgOrderByAggregateInput = {
    subtotal?: SortOrder
    iva?: SortOrder
    total?: SortOrder
  }

  export type FacturaMaxOrderByAggregateInput = {
    id_factura?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    cliente_id?: SortOrder
    cotizacion_id?: SortOrder
    codigo?: SortOrder
    fecha_emision?: SortOrder
    estado?: SortOrder
    moneda?: SortOrder
    subtotal?: SortOrder
    iva?: SortOrder
    total?: SortOrder
  }

  export type FacturaMinOrderByAggregateInput = {
    id_factura?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    cliente_id?: SortOrder
    cotizacion_id?: SortOrder
    codigo?: SortOrder
    fecha_emision?: SortOrder
    estado?: SortOrder
    moneda?: SortOrder
    subtotal?: SortOrder
    iva?: SortOrder
    total?: SortOrder
  }

  export type FacturaSumOrderByAggregateInput = {
    subtotal?: SortOrder
    iva?: SortOrder
    total?: SortOrder
  }

  export type CotizacionCreateNestedManyWithoutClienteInput = {
    create?: XOR<CotizacionCreateWithoutClienteInput, CotizacionUncheckedCreateWithoutClienteInput> | CotizacionCreateWithoutClienteInput[] | CotizacionUncheckedCreateWithoutClienteInput[]
    connectOrCreate?: CotizacionCreateOrConnectWithoutClienteInput | CotizacionCreateOrConnectWithoutClienteInput[]
    createMany?: CotizacionCreateManyClienteInputEnvelope
    connect?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
  }

  export type FacturaCreateNestedManyWithoutClienteInput = {
    create?: XOR<FacturaCreateWithoutClienteInput, FacturaUncheckedCreateWithoutClienteInput> | FacturaCreateWithoutClienteInput[] | FacturaUncheckedCreateWithoutClienteInput[]
    connectOrCreate?: FacturaCreateOrConnectWithoutClienteInput | FacturaCreateOrConnectWithoutClienteInput[]
    createMany?: FacturaCreateManyClienteInputEnvelope
    connect?: FacturaWhereUniqueInput | FacturaWhereUniqueInput[]
  }

  export type CotizacionUncheckedCreateNestedManyWithoutClienteInput = {
    create?: XOR<CotizacionCreateWithoutClienteInput, CotizacionUncheckedCreateWithoutClienteInput> | CotizacionCreateWithoutClienteInput[] | CotizacionUncheckedCreateWithoutClienteInput[]
    connectOrCreate?: CotizacionCreateOrConnectWithoutClienteInput | CotizacionCreateOrConnectWithoutClienteInput[]
    createMany?: CotizacionCreateManyClienteInputEnvelope
    connect?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
  }

  export type FacturaUncheckedCreateNestedManyWithoutClienteInput = {
    create?: XOR<FacturaCreateWithoutClienteInput, FacturaUncheckedCreateWithoutClienteInput> | FacturaCreateWithoutClienteInput[] | FacturaUncheckedCreateWithoutClienteInput[]
    connectOrCreate?: FacturaCreateOrConnectWithoutClienteInput | FacturaCreateOrConnectWithoutClienteInput[]
    createMany?: FacturaCreateManyClienteInputEnvelope
    connect?: FacturaWhereUniqueInput | FacturaWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type CotizacionUpdateManyWithoutClienteNestedInput = {
    create?: XOR<CotizacionCreateWithoutClienteInput, CotizacionUncheckedCreateWithoutClienteInput> | CotizacionCreateWithoutClienteInput[] | CotizacionUncheckedCreateWithoutClienteInput[]
    connectOrCreate?: CotizacionCreateOrConnectWithoutClienteInput | CotizacionCreateOrConnectWithoutClienteInput[]
    upsert?: CotizacionUpsertWithWhereUniqueWithoutClienteInput | CotizacionUpsertWithWhereUniqueWithoutClienteInput[]
    createMany?: CotizacionCreateManyClienteInputEnvelope
    set?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    disconnect?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    delete?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    connect?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    update?: CotizacionUpdateWithWhereUniqueWithoutClienteInput | CotizacionUpdateWithWhereUniqueWithoutClienteInput[]
    updateMany?: CotizacionUpdateManyWithWhereWithoutClienteInput | CotizacionUpdateManyWithWhereWithoutClienteInput[]
    deleteMany?: CotizacionScalarWhereInput | CotizacionScalarWhereInput[]
  }

  export type FacturaUpdateManyWithoutClienteNestedInput = {
    create?: XOR<FacturaCreateWithoutClienteInput, FacturaUncheckedCreateWithoutClienteInput> | FacturaCreateWithoutClienteInput[] | FacturaUncheckedCreateWithoutClienteInput[]
    connectOrCreate?: FacturaCreateOrConnectWithoutClienteInput | FacturaCreateOrConnectWithoutClienteInput[]
    upsert?: FacturaUpsertWithWhereUniqueWithoutClienteInput | FacturaUpsertWithWhereUniqueWithoutClienteInput[]
    createMany?: FacturaCreateManyClienteInputEnvelope
    set?: FacturaWhereUniqueInput | FacturaWhereUniqueInput[]
    disconnect?: FacturaWhereUniqueInput | FacturaWhereUniqueInput[]
    delete?: FacturaWhereUniqueInput | FacturaWhereUniqueInput[]
    connect?: FacturaWhereUniqueInput | FacturaWhereUniqueInput[]
    update?: FacturaUpdateWithWhereUniqueWithoutClienteInput | FacturaUpdateWithWhereUniqueWithoutClienteInput[]
    updateMany?: FacturaUpdateManyWithWhereWithoutClienteInput | FacturaUpdateManyWithWhereWithoutClienteInput[]
    deleteMany?: FacturaScalarWhereInput | FacturaScalarWhereInput[]
  }

  export type CotizacionUncheckedUpdateManyWithoutClienteNestedInput = {
    create?: XOR<CotizacionCreateWithoutClienteInput, CotizacionUncheckedCreateWithoutClienteInput> | CotizacionCreateWithoutClienteInput[] | CotizacionUncheckedCreateWithoutClienteInput[]
    connectOrCreate?: CotizacionCreateOrConnectWithoutClienteInput | CotizacionCreateOrConnectWithoutClienteInput[]
    upsert?: CotizacionUpsertWithWhereUniqueWithoutClienteInput | CotizacionUpsertWithWhereUniqueWithoutClienteInput[]
    createMany?: CotizacionCreateManyClienteInputEnvelope
    set?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    disconnect?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    delete?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    connect?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    update?: CotizacionUpdateWithWhereUniqueWithoutClienteInput | CotizacionUpdateWithWhereUniqueWithoutClienteInput[]
    updateMany?: CotizacionUpdateManyWithWhereWithoutClienteInput | CotizacionUpdateManyWithWhereWithoutClienteInput[]
    deleteMany?: CotizacionScalarWhereInput | CotizacionScalarWhereInput[]
  }

  export type FacturaUncheckedUpdateManyWithoutClienteNestedInput = {
    create?: XOR<FacturaCreateWithoutClienteInput, FacturaUncheckedCreateWithoutClienteInput> | FacturaCreateWithoutClienteInput[] | FacturaUncheckedCreateWithoutClienteInput[]
    connectOrCreate?: FacturaCreateOrConnectWithoutClienteInput | FacturaCreateOrConnectWithoutClienteInput[]
    upsert?: FacturaUpsertWithWhereUniqueWithoutClienteInput | FacturaUpsertWithWhereUniqueWithoutClienteInput[]
    createMany?: FacturaCreateManyClienteInputEnvelope
    set?: FacturaWhereUniqueInput | FacturaWhereUniqueInput[]
    disconnect?: FacturaWhereUniqueInput | FacturaWhereUniqueInput[]
    delete?: FacturaWhereUniqueInput | FacturaWhereUniqueInput[]
    connect?: FacturaWhereUniqueInput | FacturaWhereUniqueInput[]
    update?: FacturaUpdateWithWhereUniqueWithoutClienteInput | FacturaUpdateWithWhereUniqueWithoutClienteInput[]
    updateMany?: FacturaUpdateManyWithWhereWithoutClienteInput | FacturaUpdateManyWithWhereWithoutClienteInput[]
    deleteMany?: FacturaScalarWhereInput | FacturaScalarWhereInput[]
  }

  export type ClienteCreateNestedOneWithoutCotizacionesInput = {
    create?: XOR<ClienteCreateWithoutCotizacionesInput, ClienteUncheckedCreateWithoutCotizacionesInput>
    connectOrCreate?: ClienteCreateOrConnectWithoutCotizacionesInput
    connect?: ClienteWhereUniqueInput
  }

  export type FacturaCreateNestedManyWithoutCotizacionInput = {
    create?: XOR<FacturaCreateWithoutCotizacionInput, FacturaUncheckedCreateWithoutCotizacionInput> | FacturaCreateWithoutCotizacionInput[] | FacturaUncheckedCreateWithoutCotizacionInput[]
    connectOrCreate?: FacturaCreateOrConnectWithoutCotizacionInput | FacturaCreateOrConnectWithoutCotizacionInput[]
    createMany?: FacturaCreateManyCotizacionInputEnvelope
    connect?: FacturaWhereUniqueInput | FacturaWhereUniqueInput[]
  }

  export type FacturaUncheckedCreateNestedManyWithoutCotizacionInput = {
    create?: XOR<FacturaCreateWithoutCotizacionInput, FacturaUncheckedCreateWithoutCotizacionInput> | FacturaCreateWithoutCotizacionInput[] | FacturaUncheckedCreateWithoutCotizacionInput[]
    connectOrCreate?: FacturaCreateOrConnectWithoutCotizacionInput | FacturaCreateOrConnectWithoutCotizacionInput[]
    createMany?: FacturaCreateManyCotizacionInputEnvelope
    connect?: FacturaWhereUniqueInput | FacturaWhereUniqueInput[]
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type DecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type ClienteUpdateOneRequiredWithoutCotizacionesNestedInput = {
    create?: XOR<ClienteCreateWithoutCotizacionesInput, ClienteUncheckedCreateWithoutCotizacionesInput>
    connectOrCreate?: ClienteCreateOrConnectWithoutCotizacionesInput
    upsert?: ClienteUpsertWithoutCotizacionesInput
    connect?: ClienteWhereUniqueInput
    update?: XOR<XOR<ClienteUpdateToOneWithWhereWithoutCotizacionesInput, ClienteUpdateWithoutCotizacionesInput>, ClienteUncheckedUpdateWithoutCotizacionesInput>
  }

  export type FacturaUpdateManyWithoutCotizacionNestedInput = {
    create?: XOR<FacturaCreateWithoutCotizacionInput, FacturaUncheckedCreateWithoutCotizacionInput> | FacturaCreateWithoutCotizacionInput[] | FacturaUncheckedCreateWithoutCotizacionInput[]
    connectOrCreate?: FacturaCreateOrConnectWithoutCotizacionInput | FacturaCreateOrConnectWithoutCotizacionInput[]
    upsert?: FacturaUpsertWithWhereUniqueWithoutCotizacionInput | FacturaUpsertWithWhereUniqueWithoutCotizacionInput[]
    createMany?: FacturaCreateManyCotizacionInputEnvelope
    set?: FacturaWhereUniqueInput | FacturaWhereUniqueInput[]
    disconnect?: FacturaWhereUniqueInput | FacturaWhereUniqueInput[]
    delete?: FacturaWhereUniqueInput | FacturaWhereUniqueInput[]
    connect?: FacturaWhereUniqueInput | FacturaWhereUniqueInput[]
    update?: FacturaUpdateWithWhereUniqueWithoutCotizacionInput | FacturaUpdateWithWhereUniqueWithoutCotizacionInput[]
    updateMany?: FacturaUpdateManyWithWhereWithoutCotizacionInput | FacturaUpdateManyWithWhereWithoutCotizacionInput[]
    deleteMany?: FacturaScalarWhereInput | FacturaScalarWhereInput[]
  }

  export type FacturaUncheckedUpdateManyWithoutCotizacionNestedInput = {
    create?: XOR<FacturaCreateWithoutCotizacionInput, FacturaUncheckedCreateWithoutCotizacionInput> | FacturaCreateWithoutCotizacionInput[] | FacturaUncheckedCreateWithoutCotizacionInput[]
    connectOrCreate?: FacturaCreateOrConnectWithoutCotizacionInput | FacturaCreateOrConnectWithoutCotizacionInput[]
    upsert?: FacturaUpsertWithWhereUniqueWithoutCotizacionInput | FacturaUpsertWithWhereUniqueWithoutCotizacionInput[]
    createMany?: FacturaCreateManyCotizacionInputEnvelope
    set?: FacturaWhereUniqueInput | FacturaWhereUniqueInput[]
    disconnect?: FacturaWhereUniqueInput | FacturaWhereUniqueInput[]
    delete?: FacturaWhereUniqueInput | FacturaWhereUniqueInput[]
    connect?: FacturaWhereUniqueInput | FacturaWhereUniqueInput[]
    update?: FacturaUpdateWithWhereUniqueWithoutCotizacionInput | FacturaUpdateWithWhereUniqueWithoutCotizacionInput[]
    updateMany?: FacturaUpdateManyWithWhereWithoutCotizacionInput | FacturaUpdateManyWithWhereWithoutCotizacionInput[]
    deleteMany?: FacturaScalarWhereInput | FacturaScalarWhereInput[]
  }

  export type ClienteCreateNestedOneWithoutFacturasInput = {
    create?: XOR<ClienteCreateWithoutFacturasInput, ClienteUncheckedCreateWithoutFacturasInput>
    connectOrCreate?: ClienteCreateOrConnectWithoutFacturasInput
    connect?: ClienteWhereUniqueInput
  }

  export type CotizacionCreateNestedOneWithoutFacturasInput = {
    create?: XOR<CotizacionCreateWithoutFacturasInput, CotizacionUncheckedCreateWithoutFacturasInput>
    connectOrCreate?: CotizacionCreateOrConnectWithoutFacturasInput
    connect?: CotizacionWhereUniqueInput
  }

  export type ClienteUpdateOneRequiredWithoutFacturasNestedInput = {
    create?: XOR<ClienteCreateWithoutFacturasInput, ClienteUncheckedCreateWithoutFacturasInput>
    connectOrCreate?: ClienteCreateOrConnectWithoutFacturasInput
    upsert?: ClienteUpsertWithoutFacturasInput
    connect?: ClienteWhereUniqueInput
    update?: XOR<XOR<ClienteUpdateToOneWithWhereWithoutFacturasInput, ClienteUpdateWithoutFacturasInput>, ClienteUncheckedUpdateWithoutFacturasInput>
  }

  export type CotizacionUpdateOneWithoutFacturasNestedInput = {
    create?: XOR<CotizacionCreateWithoutFacturasInput, CotizacionUncheckedCreateWithoutFacturasInput>
    connectOrCreate?: CotizacionCreateOrConnectWithoutFacturasInput
    upsert?: CotizacionUpsertWithoutFacturasInput
    disconnect?: CotizacionWhereInput | boolean
    delete?: CotizacionWhereInput | boolean
    connect?: CotizacionWhereUniqueInput
    update?: XOR<XOR<CotizacionUpdateToOneWithWhereWithoutFacturasInput, CotizacionUpdateWithoutFacturasInput>, CotizacionUncheckedUpdateWithoutFacturasInput>
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

  export type CotizacionCreateWithoutClienteInput = {
    id_cotizacion?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    fecha_emision?: Date | string
    vigencia_hasta?: Date | string | null
    estado?: string
    moneda?: string
    subtotal: Decimal | DecimalJsLike | number | string
    iva: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
    notas?: string | null
    facturas?: FacturaCreateNestedManyWithoutCotizacionInput
  }

  export type CotizacionUncheckedCreateWithoutClienteInput = {
    id_cotizacion?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    fecha_emision?: Date | string
    vigencia_hasta?: Date | string | null
    estado?: string
    moneda?: string
    subtotal: Decimal | DecimalJsLike | number | string
    iva: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
    notas?: string | null
    facturas?: FacturaUncheckedCreateNestedManyWithoutCotizacionInput
  }

  export type CotizacionCreateOrConnectWithoutClienteInput = {
    where: CotizacionWhereUniqueInput
    create: XOR<CotizacionCreateWithoutClienteInput, CotizacionUncheckedCreateWithoutClienteInput>
  }

  export type CotizacionCreateManyClienteInputEnvelope = {
    data: CotizacionCreateManyClienteInput | CotizacionCreateManyClienteInput[]
    skipDuplicates?: boolean
  }

  export type FacturaCreateWithoutClienteInput = {
    id_factura?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    fecha_emision?: Date | string
    estado?: string
    moneda?: string
    subtotal: Decimal | DecimalJsLike | number | string
    iva: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
    cotizacion?: CotizacionCreateNestedOneWithoutFacturasInput
  }

  export type FacturaUncheckedCreateWithoutClienteInput = {
    id_factura?: string
    tenant_id: string
    proyecto_id: string
    cotizacion_id?: string | null
    codigo: string
    fecha_emision?: Date | string
    estado?: string
    moneda?: string
    subtotal: Decimal | DecimalJsLike | number | string
    iva: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
  }

  export type FacturaCreateOrConnectWithoutClienteInput = {
    where: FacturaWhereUniqueInput
    create: XOR<FacturaCreateWithoutClienteInput, FacturaUncheckedCreateWithoutClienteInput>
  }

  export type FacturaCreateManyClienteInputEnvelope = {
    data: FacturaCreateManyClienteInput | FacturaCreateManyClienteInput[]
    skipDuplicates?: boolean
  }

  export type CotizacionUpsertWithWhereUniqueWithoutClienteInput = {
    where: CotizacionWhereUniqueInput
    update: XOR<CotizacionUpdateWithoutClienteInput, CotizacionUncheckedUpdateWithoutClienteInput>
    create: XOR<CotizacionCreateWithoutClienteInput, CotizacionUncheckedCreateWithoutClienteInput>
  }

  export type CotizacionUpdateWithWhereUniqueWithoutClienteInput = {
    where: CotizacionWhereUniqueInput
    data: XOR<CotizacionUpdateWithoutClienteInput, CotizacionUncheckedUpdateWithoutClienteInput>
  }

  export type CotizacionUpdateManyWithWhereWithoutClienteInput = {
    where: CotizacionScalarWhereInput
    data: XOR<CotizacionUpdateManyMutationInput, CotizacionUncheckedUpdateManyWithoutClienteInput>
  }

  export type CotizacionScalarWhereInput = {
    AND?: CotizacionScalarWhereInput | CotizacionScalarWhereInput[]
    OR?: CotizacionScalarWhereInput[]
    NOT?: CotizacionScalarWhereInput | CotizacionScalarWhereInput[]
    id_cotizacion?: UuidFilter<"Cotizacion"> | string
    tenant_id?: UuidFilter<"Cotizacion"> | string
    proyecto_id?: UuidFilter<"Cotizacion"> | string
    cliente_id?: UuidFilter<"Cotizacion"> | string
    codigo?: StringFilter<"Cotizacion"> | string
    fecha_emision?: DateTimeFilter<"Cotizacion"> | Date | string
    vigencia_hasta?: DateTimeNullableFilter<"Cotizacion"> | Date | string | null
    estado?: StringFilter<"Cotizacion"> | string
    moneda?: StringFilter<"Cotizacion"> | string
    subtotal?: DecimalFilter<"Cotizacion"> | Decimal | DecimalJsLike | number | string
    iva?: DecimalFilter<"Cotizacion"> | Decimal | DecimalJsLike | number | string
    total?: DecimalFilter<"Cotizacion"> | Decimal | DecimalJsLike | number | string
    notas?: StringNullableFilter<"Cotizacion"> | string | null
  }

  export type FacturaUpsertWithWhereUniqueWithoutClienteInput = {
    where: FacturaWhereUniqueInput
    update: XOR<FacturaUpdateWithoutClienteInput, FacturaUncheckedUpdateWithoutClienteInput>
    create: XOR<FacturaCreateWithoutClienteInput, FacturaUncheckedCreateWithoutClienteInput>
  }

  export type FacturaUpdateWithWhereUniqueWithoutClienteInput = {
    where: FacturaWhereUniqueInput
    data: XOR<FacturaUpdateWithoutClienteInput, FacturaUncheckedUpdateWithoutClienteInput>
  }

  export type FacturaUpdateManyWithWhereWithoutClienteInput = {
    where: FacturaScalarWhereInput
    data: XOR<FacturaUpdateManyMutationInput, FacturaUncheckedUpdateManyWithoutClienteInput>
  }

  export type FacturaScalarWhereInput = {
    AND?: FacturaScalarWhereInput | FacturaScalarWhereInput[]
    OR?: FacturaScalarWhereInput[]
    NOT?: FacturaScalarWhereInput | FacturaScalarWhereInput[]
    id_factura?: UuidFilter<"Factura"> | string
    tenant_id?: UuidFilter<"Factura"> | string
    proyecto_id?: UuidFilter<"Factura"> | string
    cliente_id?: UuidFilter<"Factura"> | string
    cotizacion_id?: UuidNullableFilter<"Factura"> | string | null
    codigo?: StringFilter<"Factura"> | string
    fecha_emision?: DateTimeFilter<"Factura"> | Date | string
    estado?: StringFilter<"Factura"> | string
    moneda?: StringFilter<"Factura"> | string
    subtotal?: DecimalFilter<"Factura"> | Decimal | DecimalJsLike | number | string
    iva?: DecimalFilter<"Factura"> | Decimal | DecimalJsLike | number | string
    total?: DecimalFilter<"Factura"> | Decimal | DecimalJsLike | number | string
  }

  export type ClienteCreateWithoutCotizacionesInput = {
    id_cliente?: string
    tenant_id: string
    tercero_id?: string | null
    rfc_tax_id: string
    razon_social: string
    email_contacto?: string | null
    telefono?: string | null
    estatus?: string
    facturas?: FacturaCreateNestedManyWithoutClienteInput
  }

  export type ClienteUncheckedCreateWithoutCotizacionesInput = {
    id_cliente?: string
    tenant_id: string
    tercero_id?: string | null
    rfc_tax_id: string
    razon_social: string
    email_contacto?: string | null
    telefono?: string | null
    estatus?: string
    facturas?: FacturaUncheckedCreateNestedManyWithoutClienteInput
  }

  export type ClienteCreateOrConnectWithoutCotizacionesInput = {
    where: ClienteWhereUniqueInput
    create: XOR<ClienteCreateWithoutCotizacionesInput, ClienteUncheckedCreateWithoutCotizacionesInput>
  }

  export type FacturaCreateWithoutCotizacionInput = {
    id_factura?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    fecha_emision?: Date | string
    estado?: string
    moneda?: string
    subtotal: Decimal | DecimalJsLike | number | string
    iva: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
    cliente: ClienteCreateNestedOneWithoutFacturasInput
  }

  export type FacturaUncheckedCreateWithoutCotizacionInput = {
    id_factura?: string
    tenant_id: string
    proyecto_id: string
    cliente_id: string
    codigo: string
    fecha_emision?: Date | string
    estado?: string
    moneda?: string
    subtotal: Decimal | DecimalJsLike | number | string
    iva: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
  }

  export type FacturaCreateOrConnectWithoutCotizacionInput = {
    where: FacturaWhereUniqueInput
    create: XOR<FacturaCreateWithoutCotizacionInput, FacturaUncheckedCreateWithoutCotizacionInput>
  }

  export type FacturaCreateManyCotizacionInputEnvelope = {
    data: FacturaCreateManyCotizacionInput | FacturaCreateManyCotizacionInput[]
    skipDuplicates?: boolean
  }

  export type ClienteUpsertWithoutCotizacionesInput = {
    update: XOR<ClienteUpdateWithoutCotizacionesInput, ClienteUncheckedUpdateWithoutCotizacionesInput>
    create: XOR<ClienteCreateWithoutCotizacionesInput, ClienteUncheckedCreateWithoutCotizacionesInput>
    where?: ClienteWhereInput
  }

  export type ClienteUpdateToOneWithWhereWithoutCotizacionesInput = {
    where?: ClienteWhereInput
    data: XOR<ClienteUpdateWithoutCotizacionesInput, ClienteUncheckedUpdateWithoutCotizacionesInput>
  }

  export type ClienteUpdateWithoutCotizacionesInput = {
    id_cliente?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    tercero_id?: NullableStringFieldUpdateOperationsInput | string | null
    rfc_tax_id?: StringFieldUpdateOperationsInput | string
    razon_social?: StringFieldUpdateOperationsInput | string
    email_contacto?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    estatus?: StringFieldUpdateOperationsInput | string
    facturas?: FacturaUpdateManyWithoutClienteNestedInput
  }

  export type ClienteUncheckedUpdateWithoutCotizacionesInput = {
    id_cliente?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    tercero_id?: NullableStringFieldUpdateOperationsInput | string | null
    rfc_tax_id?: StringFieldUpdateOperationsInput | string
    razon_social?: StringFieldUpdateOperationsInput | string
    email_contacto?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    estatus?: StringFieldUpdateOperationsInput | string
    facturas?: FacturaUncheckedUpdateManyWithoutClienteNestedInput
  }

  export type FacturaUpsertWithWhereUniqueWithoutCotizacionInput = {
    where: FacturaWhereUniqueInput
    update: XOR<FacturaUpdateWithoutCotizacionInput, FacturaUncheckedUpdateWithoutCotizacionInput>
    create: XOR<FacturaCreateWithoutCotizacionInput, FacturaUncheckedCreateWithoutCotizacionInput>
  }

  export type FacturaUpdateWithWhereUniqueWithoutCotizacionInput = {
    where: FacturaWhereUniqueInput
    data: XOR<FacturaUpdateWithoutCotizacionInput, FacturaUncheckedUpdateWithoutCotizacionInput>
  }

  export type FacturaUpdateManyWithWhereWithoutCotizacionInput = {
    where: FacturaScalarWhereInput
    data: XOR<FacturaUpdateManyMutationInput, FacturaUncheckedUpdateManyWithoutCotizacionInput>
  }

  export type ClienteCreateWithoutFacturasInput = {
    id_cliente?: string
    tenant_id: string
    tercero_id?: string | null
    rfc_tax_id: string
    razon_social: string
    email_contacto?: string | null
    telefono?: string | null
    estatus?: string
    cotizaciones?: CotizacionCreateNestedManyWithoutClienteInput
  }

  export type ClienteUncheckedCreateWithoutFacturasInput = {
    id_cliente?: string
    tenant_id: string
    tercero_id?: string | null
    rfc_tax_id: string
    razon_social: string
    email_contacto?: string | null
    telefono?: string | null
    estatus?: string
    cotizaciones?: CotizacionUncheckedCreateNestedManyWithoutClienteInput
  }

  export type ClienteCreateOrConnectWithoutFacturasInput = {
    where: ClienteWhereUniqueInput
    create: XOR<ClienteCreateWithoutFacturasInput, ClienteUncheckedCreateWithoutFacturasInput>
  }

  export type CotizacionCreateWithoutFacturasInput = {
    id_cotizacion?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    fecha_emision?: Date | string
    vigencia_hasta?: Date | string | null
    estado?: string
    moneda?: string
    subtotal: Decimal | DecimalJsLike | number | string
    iva: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
    notas?: string | null
    cliente: ClienteCreateNestedOneWithoutCotizacionesInput
  }

  export type CotizacionUncheckedCreateWithoutFacturasInput = {
    id_cotizacion?: string
    tenant_id: string
    proyecto_id: string
    cliente_id: string
    codigo: string
    fecha_emision?: Date | string
    vigencia_hasta?: Date | string | null
    estado?: string
    moneda?: string
    subtotal: Decimal | DecimalJsLike | number | string
    iva: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
    notas?: string | null
  }

  export type CotizacionCreateOrConnectWithoutFacturasInput = {
    where: CotizacionWhereUniqueInput
    create: XOR<CotizacionCreateWithoutFacturasInput, CotizacionUncheckedCreateWithoutFacturasInput>
  }

  export type ClienteUpsertWithoutFacturasInput = {
    update: XOR<ClienteUpdateWithoutFacturasInput, ClienteUncheckedUpdateWithoutFacturasInput>
    create: XOR<ClienteCreateWithoutFacturasInput, ClienteUncheckedCreateWithoutFacturasInput>
    where?: ClienteWhereInput
  }

  export type ClienteUpdateToOneWithWhereWithoutFacturasInput = {
    where?: ClienteWhereInput
    data: XOR<ClienteUpdateWithoutFacturasInput, ClienteUncheckedUpdateWithoutFacturasInput>
  }

  export type ClienteUpdateWithoutFacturasInput = {
    id_cliente?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    tercero_id?: NullableStringFieldUpdateOperationsInput | string | null
    rfc_tax_id?: StringFieldUpdateOperationsInput | string
    razon_social?: StringFieldUpdateOperationsInput | string
    email_contacto?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    estatus?: StringFieldUpdateOperationsInput | string
    cotizaciones?: CotizacionUpdateManyWithoutClienteNestedInput
  }

  export type ClienteUncheckedUpdateWithoutFacturasInput = {
    id_cliente?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    tercero_id?: NullableStringFieldUpdateOperationsInput | string | null
    rfc_tax_id?: StringFieldUpdateOperationsInput | string
    razon_social?: StringFieldUpdateOperationsInput | string
    email_contacto?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    estatus?: StringFieldUpdateOperationsInput | string
    cotizaciones?: CotizacionUncheckedUpdateManyWithoutClienteNestedInput
  }

  export type CotizacionUpsertWithoutFacturasInput = {
    update: XOR<CotizacionUpdateWithoutFacturasInput, CotizacionUncheckedUpdateWithoutFacturasInput>
    create: XOR<CotizacionCreateWithoutFacturasInput, CotizacionUncheckedCreateWithoutFacturasInput>
    where?: CotizacionWhereInput
  }

  export type CotizacionUpdateToOneWithWhereWithoutFacturasInput = {
    where?: CotizacionWhereInput
    data: XOR<CotizacionUpdateWithoutFacturasInput, CotizacionUncheckedUpdateWithoutFacturasInput>
  }

  export type CotizacionUpdateWithoutFacturasInput = {
    id_cotizacion?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    fecha_emision?: DateTimeFieldUpdateOperationsInput | Date | string
    vigencia_hasta?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    moneda?: StringFieldUpdateOperationsInput | string
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    iva?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    cliente?: ClienteUpdateOneRequiredWithoutCotizacionesNestedInput
  }

  export type CotizacionUncheckedUpdateWithoutFacturasInput = {
    id_cotizacion?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    cliente_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    fecha_emision?: DateTimeFieldUpdateOperationsInput | Date | string
    vigencia_hasta?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    moneda?: StringFieldUpdateOperationsInput | string
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    iva?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type CotizacionCreateManyClienteInput = {
    id_cotizacion?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    fecha_emision?: Date | string
    vigencia_hasta?: Date | string | null
    estado?: string
    moneda?: string
    subtotal: Decimal | DecimalJsLike | number | string
    iva: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
    notas?: string | null
  }

  export type FacturaCreateManyClienteInput = {
    id_factura?: string
    tenant_id: string
    proyecto_id: string
    cotizacion_id?: string | null
    codigo: string
    fecha_emision?: Date | string
    estado?: string
    moneda?: string
    subtotal: Decimal | DecimalJsLike | number | string
    iva: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
  }

  export type CotizacionUpdateWithoutClienteInput = {
    id_cotizacion?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    fecha_emision?: DateTimeFieldUpdateOperationsInput | Date | string
    vigencia_hasta?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    moneda?: StringFieldUpdateOperationsInput | string
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    iva?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    facturas?: FacturaUpdateManyWithoutCotizacionNestedInput
  }

  export type CotizacionUncheckedUpdateWithoutClienteInput = {
    id_cotizacion?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    fecha_emision?: DateTimeFieldUpdateOperationsInput | Date | string
    vigencia_hasta?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    moneda?: StringFieldUpdateOperationsInput | string
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    iva?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    facturas?: FacturaUncheckedUpdateManyWithoutCotizacionNestedInput
  }

  export type CotizacionUncheckedUpdateManyWithoutClienteInput = {
    id_cotizacion?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    fecha_emision?: DateTimeFieldUpdateOperationsInput | Date | string
    vigencia_hasta?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    moneda?: StringFieldUpdateOperationsInput | string
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    iva?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type FacturaUpdateWithoutClienteInput = {
    id_factura?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    fecha_emision?: DateTimeFieldUpdateOperationsInput | Date | string
    estado?: StringFieldUpdateOperationsInput | string
    moneda?: StringFieldUpdateOperationsInput | string
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    iva?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cotizacion?: CotizacionUpdateOneWithoutFacturasNestedInput
  }

  export type FacturaUncheckedUpdateWithoutClienteInput = {
    id_factura?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    cotizacion_id?: NullableStringFieldUpdateOperationsInput | string | null
    codigo?: StringFieldUpdateOperationsInput | string
    fecha_emision?: DateTimeFieldUpdateOperationsInput | Date | string
    estado?: StringFieldUpdateOperationsInput | string
    moneda?: StringFieldUpdateOperationsInput | string
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    iva?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
  }

  export type FacturaUncheckedUpdateManyWithoutClienteInput = {
    id_factura?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    cotizacion_id?: NullableStringFieldUpdateOperationsInput | string | null
    codigo?: StringFieldUpdateOperationsInput | string
    fecha_emision?: DateTimeFieldUpdateOperationsInput | Date | string
    estado?: StringFieldUpdateOperationsInput | string
    moneda?: StringFieldUpdateOperationsInput | string
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    iva?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
  }

  export type FacturaCreateManyCotizacionInput = {
    id_factura?: string
    tenant_id: string
    proyecto_id: string
    cliente_id: string
    codigo: string
    fecha_emision?: Date | string
    estado?: string
    moneda?: string
    subtotal: Decimal | DecimalJsLike | number | string
    iva: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
  }

  export type FacturaUpdateWithoutCotizacionInput = {
    id_factura?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    fecha_emision?: DateTimeFieldUpdateOperationsInput | Date | string
    estado?: StringFieldUpdateOperationsInput | string
    moneda?: StringFieldUpdateOperationsInput | string
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    iva?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cliente?: ClienteUpdateOneRequiredWithoutFacturasNestedInput
  }

  export type FacturaUncheckedUpdateWithoutCotizacionInput = {
    id_factura?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    cliente_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    fecha_emision?: DateTimeFieldUpdateOperationsInput | Date | string
    estado?: StringFieldUpdateOperationsInput | string
    moneda?: StringFieldUpdateOperationsInput | string
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    iva?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
  }

  export type FacturaUncheckedUpdateManyWithoutCotizacionInput = {
    id_factura?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    cliente_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    fecha_emision?: DateTimeFieldUpdateOperationsInput | Date | string
    estado?: StringFieldUpdateOperationsInput | string
    moneda?: StringFieldUpdateOperationsInput | string
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    iva?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use ClienteCountOutputTypeDefaultArgs instead
     */
    export type ClienteCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ClienteCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CotizacionCountOutputTypeDefaultArgs instead
     */
    export type CotizacionCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CotizacionCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ClienteDefaultArgs instead
     */
    export type ClienteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ClienteDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CotizacionDefaultArgs instead
     */
    export type CotizacionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CotizacionDefaultArgs<ExtArgs>
    /**
     * @deprecated Use FacturaDefaultArgs instead
     */
    export type FacturaArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = FacturaDefaultArgs<ExtArgs>

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