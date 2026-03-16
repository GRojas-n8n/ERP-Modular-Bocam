
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
 * Model Proveedor
 * 
 */
export type Proveedor = $Result.DefaultSelection<Prisma.$ProveedorPayload>
/**
 * Model Requisicion
 * 
 */
export type Requisicion = $Result.DefaultSelection<Prisma.$RequisicionPayload>
/**
 * Model RequisicionItem
 * 
 */
export type RequisicionItem = $Result.DefaultSelection<Prisma.$RequisicionItemPayload>
/**
 * Model OrdenCompra
 * 
 */
export type OrdenCompra = $Result.DefaultSelection<Prisma.$OrdenCompraPayload>
/**
 * Model OrdenCompraItem
 * 
 */
export type OrdenCompraItem = $Result.DefaultSelection<Prisma.$OrdenCompraItemPayload>
/**
 * Model CuadroComparativo
 * 
 */
export type CuadroComparativo = $Result.DefaultSelection<Prisma.$CuadroComparativoPayload>
/**
 * Model ComparativaDetalle
 * 
 */
export type ComparativaDetalle = $Result.DefaultSelection<Prisma.$ComparativaDetallePayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Proveedors
 * const proveedors = await prisma.proveedor.findMany()
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
   * // Fetch zero or more Proveedors
   * const proveedors = await prisma.proveedor.findMany()
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
   * `prisma.proveedor`: Exposes CRUD operations for the **Proveedor** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Proveedors
    * const proveedors = await prisma.proveedor.findMany()
    * ```
    */
  get proveedor(): Prisma.ProveedorDelegate<ExtArgs>;

  /**
   * `prisma.requisicion`: Exposes CRUD operations for the **Requisicion** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Requisicions
    * const requisicions = await prisma.requisicion.findMany()
    * ```
    */
  get requisicion(): Prisma.RequisicionDelegate<ExtArgs>;

  /**
   * `prisma.requisicionItem`: Exposes CRUD operations for the **RequisicionItem** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more RequisicionItems
    * const requisicionItems = await prisma.requisicionItem.findMany()
    * ```
    */
  get requisicionItem(): Prisma.RequisicionItemDelegate<ExtArgs>;

  /**
   * `prisma.ordenCompra`: Exposes CRUD operations for the **OrdenCompra** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OrdenCompras
    * const ordenCompras = await prisma.ordenCompra.findMany()
    * ```
    */
  get ordenCompra(): Prisma.OrdenCompraDelegate<ExtArgs>;

  /**
   * `prisma.ordenCompraItem`: Exposes CRUD operations for the **OrdenCompraItem** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OrdenCompraItems
    * const ordenCompraItems = await prisma.ordenCompraItem.findMany()
    * ```
    */
  get ordenCompraItem(): Prisma.OrdenCompraItemDelegate<ExtArgs>;

  /**
   * `prisma.cuadroComparativo`: Exposes CRUD operations for the **CuadroComparativo** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CuadroComparativos
    * const cuadroComparativos = await prisma.cuadroComparativo.findMany()
    * ```
    */
  get cuadroComparativo(): Prisma.CuadroComparativoDelegate<ExtArgs>;

  /**
   * `prisma.comparativaDetalle`: Exposes CRUD operations for the **ComparativaDetalle** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ComparativaDetalles
    * const comparativaDetalles = await prisma.comparativaDetalle.findMany()
    * ```
    */
  get comparativaDetalle(): Prisma.ComparativaDetalleDelegate<ExtArgs>;
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
    Proveedor: 'Proveedor',
    Requisicion: 'Requisicion',
    RequisicionItem: 'RequisicionItem',
    OrdenCompra: 'OrdenCompra',
    OrdenCompraItem: 'OrdenCompraItem',
    CuadroComparativo: 'CuadroComparativo',
    ComparativaDetalle: 'ComparativaDetalle'
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
      modelProps: "proveedor" | "requisicion" | "requisicionItem" | "ordenCompra" | "ordenCompraItem" | "cuadroComparativo" | "comparativaDetalle"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Proveedor: {
        payload: Prisma.$ProveedorPayload<ExtArgs>
        fields: Prisma.ProveedorFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProveedorFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProveedorPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProveedorFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProveedorPayload>
          }
          findFirst: {
            args: Prisma.ProveedorFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProveedorPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProveedorFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProveedorPayload>
          }
          findMany: {
            args: Prisma.ProveedorFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProveedorPayload>[]
          }
          create: {
            args: Prisma.ProveedorCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProveedorPayload>
          }
          createMany: {
            args: Prisma.ProveedorCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProveedorCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProveedorPayload>[]
          }
          delete: {
            args: Prisma.ProveedorDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProveedorPayload>
          }
          update: {
            args: Prisma.ProveedorUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProveedorPayload>
          }
          deleteMany: {
            args: Prisma.ProveedorDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProveedorUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ProveedorUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProveedorPayload>
          }
          aggregate: {
            args: Prisma.ProveedorAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProveedor>
          }
          groupBy: {
            args: Prisma.ProveedorGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProveedorGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProveedorCountArgs<ExtArgs>
            result: $Utils.Optional<ProveedorCountAggregateOutputType> | number
          }
        }
      }
      Requisicion: {
        payload: Prisma.$RequisicionPayload<ExtArgs>
        fields: Prisma.RequisicionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RequisicionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequisicionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RequisicionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequisicionPayload>
          }
          findFirst: {
            args: Prisma.RequisicionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequisicionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RequisicionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequisicionPayload>
          }
          findMany: {
            args: Prisma.RequisicionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequisicionPayload>[]
          }
          create: {
            args: Prisma.RequisicionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequisicionPayload>
          }
          createMany: {
            args: Prisma.RequisicionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RequisicionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequisicionPayload>[]
          }
          delete: {
            args: Prisma.RequisicionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequisicionPayload>
          }
          update: {
            args: Prisma.RequisicionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequisicionPayload>
          }
          deleteMany: {
            args: Prisma.RequisicionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RequisicionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.RequisicionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequisicionPayload>
          }
          aggregate: {
            args: Prisma.RequisicionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRequisicion>
          }
          groupBy: {
            args: Prisma.RequisicionGroupByArgs<ExtArgs>
            result: $Utils.Optional<RequisicionGroupByOutputType>[]
          }
          count: {
            args: Prisma.RequisicionCountArgs<ExtArgs>
            result: $Utils.Optional<RequisicionCountAggregateOutputType> | number
          }
        }
      }
      RequisicionItem: {
        payload: Prisma.$RequisicionItemPayload<ExtArgs>
        fields: Prisma.RequisicionItemFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RequisicionItemFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequisicionItemPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RequisicionItemFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequisicionItemPayload>
          }
          findFirst: {
            args: Prisma.RequisicionItemFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequisicionItemPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RequisicionItemFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequisicionItemPayload>
          }
          findMany: {
            args: Prisma.RequisicionItemFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequisicionItemPayload>[]
          }
          create: {
            args: Prisma.RequisicionItemCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequisicionItemPayload>
          }
          createMany: {
            args: Prisma.RequisicionItemCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RequisicionItemCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequisicionItemPayload>[]
          }
          delete: {
            args: Prisma.RequisicionItemDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequisicionItemPayload>
          }
          update: {
            args: Prisma.RequisicionItemUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequisicionItemPayload>
          }
          deleteMany: {
            args: Prisma.RequisicionItemDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RequisicionItemUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.RequisicionItemUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequisicionItemPayload>
          }
          aggregate: {
            args: Prisma.RequisicionItemAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRequisicionItem>
          }
          groupBy: {
            args: Prisma.RequisicionItemGroupByArgs<ExtArgs>
            result: $Utils.Optional<RequisicionItemGroupByOutputType>[]
          }
          count: {
            args: Prisma.RequisicionItemCountArgs<ExtArgs>
            result: $Utils.Optional<RequisicionItemCountAggregateOutputType> | number
          }
        }
      }
      OrdenCompra: {
        payload: Prisma.$OrdenCompraPayload<ExtArgs>
        fields: Prisma.OrdenCompraFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OrdenCompraFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrdenCompraPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OrdenCompraFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrdenCompraPayload>
          }
          findFirst: {
            args: Prisma.OrdenCompraFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrdenCompraPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OrdenCompraFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrdenCompraPayload>
          }
          findMany: {
            args: Prisma.OrdenCompraFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrdenCompraPayload>[]
          }
          create: {
            args: Prisma.OrdenCompraCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrdenCompraPayload>
          }
          createMany: {
            args: Prisma.OrdenCompraCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OrdenCompraCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrdenCompraPayload>[]
          }
          delete: {
            args: Prisma.OrdenCompraDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrdenCompraPayload>
          }
          update: {
            args: Prisma.OrdenCompraUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrdenCompraPayload>
          }
          deleteMany: {
            args: Prisma.OrdenCompraDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OrdenCompraUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.OrdenCompraUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrdenCompraPayload>
          }
          aggregate: {
            args: Prisma.OrdenCompraAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOrdenCompra>
          }
          groupBy: {
            args: Prisma.OrdenCompraGroupByArgs<ExtArgs>
            result: $Utils.Optional<OrdenCompraGroupByOutputType>[]
          }
          count: {
            args: Prisma.OrdenCompraCountArgs<ExtArgs>
            result: $Utils.Optional<OrdenCompraCountAggregateOutputType> | number
          }
        }
      }
      OrdenCompraItem: {
        payload: Prisma.$OrdenCompraItemPayload<ExtArgs>
        fields: Prisma.OrdenCompraItemFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OrdenCompraItemFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrdenCompraItemPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OrdenCompraItemFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrdenCompraItemPayload>
          }
          findFirst: {
            args: Prisma.OrdenCompraItemFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrdenCompraItemPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OrdenCompraItemFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrdenCompraItemPayload>
          }
          findMany: {
            args: Prisma.OrdenCompraItemFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrdenCompraItemPayload>[]
          }
          create: {
            args: Prisma.OrdenCompraItemCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrdenCompraItemPayload>
          }
          createMany: {
            args: Prisma.OrdenCompraItemCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OrdenCompraItemCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrdenCompraItemPayload>[]
          }
          delete: {
            args: Prisma.OrdenCompraItemDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrdenCompraItemPayload>
          }
          update: {
            args: Prisma.OrdenCompraItemUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrdenCompraItemPayload>
          }
          deleteMany: {
            args: Prisma.OrdenCompraItemDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OrdenCompraItemUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.OrdenCompraItemUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrdenCompraItemPayload>
          }
          aggregate: {
            args: Prisma.OrdenCompraItemAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOrdenCompraItem>
          }
          groupBy: {
            args: Prisma.OrdenCompraItemGroupByArgs<ExtArgs>
            result: $Utils.Optional<OrdenCompraItemGroupByOutputType>[]
          }
          count: {
            args: Prisma.OrdenCompraItemCountArgs<ExtArgs>
            result: $Utils.Optional<OrdenCompraItemCountAggregateOutputType> | number
          }
        }
      }
      CuadroComparativo: {
        payload: Prisma.$CuadroComparativoPayload<ExtArgs>
        fields: Prisma.CuadroComparativoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CuadroComparativoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CuadroComparativoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CuadroComparativoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CuadroComparativoPayload>
          }
          findFirst: {
            args: Prisma.CuadroComparativoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CuadroComparativoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CuadroComparativoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CuadroComparativoPayload>
          }
          findMany: {
            args: Prisma.CuadroComparativoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CuadroComparativoPayload>[]
          }
          create: {
            args: Prisma.CuadroComparativoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CuadroComparativoPayload>
          }
          createMany: {
            args: Prisma.CuadroComparativoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CuadroComparativoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CuadroComparativoPayload>[]
          }
          delete: {
            args: Prisma.CuadroComparativoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CuadroComparativoPayload>
          }
          update: {
            args: Prisma.CuadroComparativoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CuadroComparativoPayload>
          }
          deleteMany: {
            args: Prisma.CuadroComparativoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CuadroComparativoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CuadroComparativoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CuadroComparativoPayload>
          }
          aggregate: {
            args: Prisma.CuadroComparativoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCuadroComparativo>
          }
          groupBy: {
            args: Prisma.CuadroComparativoGroupByArgs<ExtArgs>
            result: $Utils.Optional<CuadroComparativoGroupByOutputType>[]
          }
          count: {
            args: Prisma.CuadroComparativoCountArgs<ExtArgs>
            result: $Utils.Optional<CuadroComparativoCountAggregateOutputType> | number
          }
        }
      }
      ComparativaDetalle: {
        payload: Prisma.$ComparativaDetallePayload<ExtArgs>
        fields: Prisma.ComparativaDetalleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ComparativaDetalleFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ComparativaDetallePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ComparativaDetalleFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ComparativaDetallePayload>
          }
          findFirst: {
            args: Prisma.ComparativaDetalleFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ComparativaDetallePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ComparativaDetalleFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ComparativaDetallePayload>
          }
          findMany: {
            args: Prisma.ComparativaDetalleFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ComparativaDetallePayload>[]
          }
          create: {
            args: Prisma.ComparativaDetalleCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ComparativaDetallePayload>
          }
          createMany: {
            args: Prisma.ComparativaDetalleCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ComparativaDetalleCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ComparativaDetallePayload>[]
          }
          delete: {
            args: Prisma.ComparativaDetalleDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ComparativaDetallePayload>
          }
          update: {
            args: Prisma.ComparativaDetalleUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ComparativaDetallePayload>
          }
          deleteMany: {
            args: Prisma.ComparativaDetalleDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ComparativaDetalleUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ComparativaDetalleUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ComparativaDetallePayload>
          }
          aggregate: {
            args: Prisma.ComparativaDetalleAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateComparativaDetalle>
          }
          groupBy: {
            args: Prisma.ComparativaDetalleGroupByArgs<ExtArgs>
            result: $Utils.Optional<ComparativaDetalleGroupByOutputType>[]
          }
          count: {
            args: Prisma.ComparativaDetalleCountArgs<ExtArgs>
            result: $Utils.Optional<ComparativaDetalleCountAggregateOutputType> | number
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
   * Count Type ProveedorCountOutputType
   */

  export type ProveedorCountOutputType = {
    ordenes: number
    comparativas: number
  }

  export type ProveedorCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    ordenes?: boolean | ProveedorCountOutputTypeCountOrdenesArgs
    comparativas?: boolean | ProveedorCountOutputTypeCountComparativasArgs
  }

  // Custom InputTypes
  /**
   * ProveedorCountOutputType without action
   */
  export type ProveedorCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProveedorCountOutputType
     */
    select?: ProveedorCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ProveedorCountOutputType without action
   */
  export type ProveedorCountOutputTypeCountOrdenesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrdenCompraWhereInput
  }

  /**
   * ProveedorCountOutputType without action
   */
  export type ProveedorCountOutputTypeCountComparativasArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ComparativaDetalleWhereInput
  }


  /**
   * Count Type RequisicionCountOutputType
   */

  export type RequisicionCountOutputType = {
    items: number
  }

  export type RequisicionCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    items?: boolean | RequisicionCountOutputTypeCountItemsArgs
  }

  // Custom InputTypes
  /**
   * RequisicionCountOutputType without action
   */
  export type RequisicionCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequisicionCountOutputType
     */
    select?: RequisicionCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * RequisicionCountOutputType without action
   */
  export type RequisicionCountOutputTypeCountItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RequisicionItemWhereInput
  }


  /**
   * Count Type OrdenCompraCountOutputType
   */

  export type OrdenCompraCountOutputType = {
    items: number
  }

  export type OrdenCompraCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    items?: boolean | OrdenCompraCountOutputTypeCountItemsArgs
  }

  // Custom InputTypes
  /**
   * OrdenCompraCountOutputType without action
   */
  export type OrdenCompraCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdenCompraCountOutputType
     */
    select?: OrdenCompraCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * OrdenCompraCountOutputType without action
   */
  export type OrdenCompraCountOutputTypeCountItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrdenCompraItemWhereInput
  }


  /**
   * Count Type CuadroComparativoCountOutputType
   */

  export type CuadroComparativoCountOutputType = {
    detalles: number
  }

  export type CuadroComparativoCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    detalles?: boolean | CuadroComparativoCountOutputTypeCountDetallesArgs
  }

  // Custom InputTypes
  /**
   * CuadroComparativoCountOutputType without action
   */
  export type CuadroComparativoCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CuadroComparativoCountOutputType
     */
    select?: CuadroComparativoCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CuadroComparativoCountOutputType without action
   */
  export type CuadroComparativoCountOutputTypeCountDetallesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ComparativaDetalleWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Proveedor
   */

  export type AggregateProveedor = {
    _count: ProveedorCountAggregateOutputType | null
    _min: ProveedorMinAggregateOutputType | null
    _max: ProveedorMaxAggregateOutputType | null
  }

  export type ProveedorMinAggregateOutputType = {
    id_proveedor: string | null
    tenant_id: string | null
    rfc_tax_id: string | null
    razon_social: string | null
    email_contacto: string | null
    telefono: string | null
    estatus: string | null
  }

  export type ProveedorMaxAggregateOutputType = {
    id_proveedor: string | null
    tenant_id: string | null
    rfc_tax_id: string | null
    razon_social: string | null
    email_contacto: string | null
    telefono: string | null
    estatus: string | null
  }

  export type ProveedorCountAggregateOutputType = {
    id_proveedor: number
    tenant_id: number
    rfc_tax_id: number
    razon_social: number
    email_contacto: number
    telefono: number
    estatus: number
    _all: number
  }


  export type ProveedorMinAggregateInputType = {
    id_proveedor?: true
    tenant_id?: true
    rfc_tax_id?: true
    razon_social?: true
    email_contacto?: true
    telefono?: true
    estatus?: true
  }

  export type ProveedorMaxAggregateInputType = {
    id_proveedor?: true
    tenant_id?: true
    rfc_tax_id?: true
    razon_social?: true
    email_contacto?: true
    telefono?: true
    estatus?: true
  }

  export type ProveedorCountAggregateInputType = {
    id_proveedor?: true
    tenant_id?: true
    rfc_tax_id?: true
    razon_social?: true
    email_contacto?: true
    telefono?: true
    estatus?: true
    _all?: true
  }

  export type ProveedorAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Proveedor to aggregate.
     */
    where?: ProveedorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Proveedors to fetch.
     */
    orderBy?: ProveedorOrderByWithRelationInput | ProveedorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProveedorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Proveedors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Proveedors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Proveedors
    **/
    _count?: true | ProveedorCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProveedorMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProveedorMaxAggregateInputType
  }

  export type GetProveedorAggregateType<T extends ProveedorAggregateArgs> = {
        [P in keyof T & keyof AggregateProveedor]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProveedor[P]>
      : GetScalarType<T[P], AggregateProveedor[P]>
  }




  export type ProveedorGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProveedorWhereInput
    orderBy?: ProveedorOrderByWithAggregationInput | ProveedorOrderByWithAggregationInput[]
    by: ProveedorScalarFieldEnum[] | ProveedorScalarFieldEnum
    having?: ProveedorScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProveedorCountAggregateInputType | true
    _min?: ProveedorMinAggregateInputType
    _max?: ProveedorMaxAggregateInputType
  }

  export type ProveedorGroupByOutputType = {
    id_proveedor: string
    tenant_id: string
    rfc_tax_id: string
    razon_social: string
    email_contacto: string | null
    telefono: string | null
    estatus: string
    _count: ProveedorCountAggregateOutputType | null
    _min: ProveedorMinAggregateOutputType | null
    _max: ProveedorMaxAggregateOutputType | null
  }

  type GetProveedorGroupByPayload<T extends ProveedorGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProveedorGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProveedorGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProveedorGroupByOutputType[P]>
            : GetScalarType<T[P], ProveedorGroupByOutputType[P]>
        }
      >
    >


  export type ProveedorSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_proveedor?: boolean
    tenant_id?: boolean
    rfc_tax_id?: boolean
    razon_social?: boolean
    email_contacto?: boolean
    telefono?: boolean
    estatus?: boolean
    ordenes?: boolean | Proveedor$ordenesArgs<ExtArgs>
    comparativas?: boolean | Proveedor$comparativasArgs<ExtArgs>
    _count?: boolean | ProveedorCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["proveedor"]>

  export type ProveedorSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_proveedor?: boolean
    tenant_id?: boolean
    rfc_tax_id?: boolean
    razon_social?: boolean
    email_contacto?: boolean
    telefono?: boolean
    estatus?: boolean
  }, ExtArgs["result"]["proveedor"]>

  export type ProveedorSelectScalar = {
    id_proveedor?: boolean
    tenant_id?: boolean
    rfc_tax_id?: boolean
    razon_social?: boolean
    email_contacto?: boolean
    telefono?: boolean
    estatus?: boolean
  }

  export type ProveedorInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    ordenes?: boolean | Proveedor$ordenesArgs<ExtArgs>
    comparativas?: boolean | Proveedor$comparativasArgs<ExtArgs>
    _count?: boolean | ProveedorCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ProveedorIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $ProveedorPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Proveedor"
    objects: {
      ordenes: Prisma.$OrdenCompraPayload<ExtArgs>[]
      comparativas: Prisma.$ComparativaDetallePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id_proveedor: string
      tenant_id: string
      rfc_tax_id: string
      razon_social: string
      email_contacto: string | null
      telefono: string | null
      estatus: string
    }, ExtArgs["result"]["proveedor"]>
    composites: {}
  }

  type ProveedorGetPayload<S extends boolean | null | undefined | ProveedorDefaultArgs> = $Result.GetResult<Prisma.$ProveedorPayload, S>

  type ProveedorCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ProveedorFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ProveedorCountAggregateInputType | true
    }

  export interface ProveedorDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Proveedor'], meta: { name: 'Proveedor' } }
    /**
     * Find zero or one Proveedor that matches the filter.
     * @param {ProveedorFindUniqueArgs} args - Arguments to find a Proveedor
     * @example
     * // Get one Proveedor
     * const proveedor = await prisma.proveedor.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProveedorFindUniqueArgs>(args: SelectSubset<T, ProveedorFindUniqueArgs<ExtArgs>>): Prisma__ProveedorClient<$Result.GetResult<Prisma.$ProveedorPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Proveedor that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ProveedorFindUniqueOrThrowArgs} args - Arguments to find a Proveedor
     * @example
     * // Get one Proveedor
     * const proveedor = await prisma.proveedor.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProveedorFindUniqueOrThrowArgs>(args: SelectSubset<T, ProveedorFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProveedorClient<$Result.GetResult<Prisma.$ProveedorPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Proveedor that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProveedorFindFirstArgs} args - Arguments to find a Proveedor
     * @example
     * // Get one Proveedor
     * const proveedor = await prisma.proveedor.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProveedorFindFirstArgs>(args?: SelectSubset<T, ProveedorFindFirstArgs<ExtArgs>>): Prisma__ProveedorClient<$Result.GetResult<Prisma.$ProveedorPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Proveedor that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProveedorFindFirstOrThrowArgs} args - Arguments to find a Proveedor
     * @example
     * // Get one Proveedor
     * const proveedor = await prisma.proveedor.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProveedorFindFirstOrThrowArgs>(args?: SelectSubset<T, ProveedorFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProveedorClient<$Result.GetResult<Prisma.$ProveedorPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Proveedors that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProveedorFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Proveedors
     * const proveedors = await prisma.proveedor.findMany()
     * 
     * // Get first 10 Proveedors
     * const proveedors = await prisma.proveedor.findMany({ take: 10 })
     * 
     * // Only select the `id_proveedor`
     * const proveedorWithId_proveedorOnly = await prisma.proveedor.findMany({ select: { id_proveedor: true } })
     * 
     */
    findMany<T extends ProveedorFindManyArgs>(args?: SelectSubset<T, ProveedorFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProveedorPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Proveedor.
     * @param {ProveedorCreateArgs} args - Arguments to create a Proveedor.
     * @example
     * // Create one Proveedor
     * const Proveedor = await prisma.proveedor.create({
     *   data: {
     *     // ... data to create a Proveedor
     *   }
     * })
     * 
     */
    create<T extends ProveedorCreateArgs>(args: SelectSubset<T, ProveedorCreateArgs<ExtArgs>>): Prisma__ProveedorClient<$Result.GetResult<Prisma.$ProveedorPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Proveedors.
     * @param {ProveedorCreateManyArgs} args - Arguments to create many Proveedors.
     * @example
     * // Create many Proveedors
     * const proveedor = await prisma.proveedor.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProveedorCreateManyArgs>(args?: SelectSubset<T, ProveedorCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Proveedors and returns the data saved in the database.
     * @param {ProveedorCreateManyAndReturnArgs} args - Arguments to create many Proveedors.
     * @example
     * // Create many Proveedors
     * const proveedor = await prisma.proveedor.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Proveedors and only return the `id_proveedor`
     * const proveedorWithId_proveedorOnly = await prisma.proveedor.createManyAndReturn({ 
     *   select: { id_proveedor: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProveedorCreateManyAndReturnArgs>(args?: SelectSubset<T, ProveedorCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProveedorPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Proveedor.
     * @param {ProveedorDeleteArgs} args - Arguments to delete one Proveedor.
     * @example
     * // Delete one Proveedor
     * const Proveedor = await prisma.proveedor.delete({
     *   where: {
     *     // ... filter to delete one Proveedor
     *   }
     * })
     * 
     */
    delete<T extends ProveedorDeleteArgs>(args: SelectSubset<T, ProveedorDeleteArgs<ExtArgs>>): Prisma__ProveedorClient<$Result.GetResult<Prisma.$ProveedorPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Proveedor.
     * @param {ProveedorUpdateArgs} args - Arguments to update one Proveedor.
     * @example
     * // Update one Proveedor
     * const proveedor = await prisma.proveedor.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProveedorUpdateArgs>(args: SelectSubset<T, ProveedorUpdateArgs<ExtArgs>>): Prisma__ProveedorClient<$Result.GetResult<Prisma.$ProveedorPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Proveedors.
     * @param {ProveedorDeleteManyArgs} args - Arguments to filter Proveedors to delete.
     * @example
     * // Delete a few Proveedors
     * const { count } = await prisma.proveedor.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProveedorDeleteManyArgs>(args?: SelectSubset<T, ProveedorDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Proveedors.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProveedorUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Proveedors
     * const proveedor = await prisma.proveedor.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProveedorUpdateManyArgs>(args: SelectSubset<T, ProveedorUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Proveedor.
     * @param {ProveedorUpsertArgs} args - Arguments to update or create a Proveedor.
     * @example
     * // Update or create a Proveedor
     * const proveedor = await prisma.proveedor.upsert({
     *   create: {
     *     // ... data to create a Proveedor
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Proveedor we want to update
     *   }
     * })
     */
    upsert<T extends ProveedorUpsertArgs>(args: SelectSubset<T, ProveedorUpsertArgs<ExtArgs>>): Prisma__ProveedorClient<$Result.GetResult<Prisma.$ProveedorPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Proveedors.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProveedorCountArgs} args - Arguments to filter Proveedors to count.
     * @example
     * // Count the number of Proveedors
     * const count = await prisma.proveedor.count({
     *   where: {
     *     // ... the filter for the Proveedors we want to count
     *   }
     * })
    **/
    count<T extends ProveedorCountArgs>(
      args?: Subset<T, ProveedorCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProveedorCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Proveedor.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProveedorAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ProveedorAggregateArgs>(args: Subset<T, ProveedorAggregateArgs>): Prisma.PrismaPromise<GetProveedorAggregateType<T>>

    /**
     * Group by Proveedor.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProveedorGroupByArgs} args - Group by arguments.
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
      T extends ProveedorGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProveedorGroupByArgs['orderBy'] }
        : { orderBy?: ProveedorGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ProveedorGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProveedorGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Proveedor model
   */
  readonly fields: ProveedorFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Proveedor.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProveedorClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    ordenes<T extends Proveedor$ordenesArgs<ExtArgs> = {}>(args?: Subset<T, Proveedor$ordenesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrdenCompraPayload<ExtArgs>, T, "findMany"> | Null>
    comparativas<T extends Proveedor$comparativasArgs<ExtArgs> = {}>(args?: Subset<T, Proveedor$comparativasArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ComparativaDetallePayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the Proveedor model
   */ 
  interface ProveedorFieldRefs {
    readonly id_proveedor: FieldRef<"Proveedor", 'String'>
    readonly tenant_id: FieldRef<"Proveedor", 'String'>
    readonly rfc_tax_id: FieldRef<"Proveedor", 'String'>
    readonly razon_social: FieldRef<"Proveedor", 'String'>
    readonly email_contacto: FieldRef<"Proveedor", 'String'>
    readonly telefono: FieldRef<"Proveedor", 'String'>
    readonly estatus: FieldRef<"Proveedor", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Proveedor findUnique
   */
  export type ProveedorFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Proveedor
     */
    select?: ProveedorSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProveedorInclude<ExtArgs> | null
    /**
     * Filter, which Proveedor to fetch.
     */
    where: ProveedorWhereUniqueInput
  }

  /**
   * Proveedor findUniqueOrThrow
   */
  export type ProveedorFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Proveedor
     */
    select?: ProveedorSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProveedorInclude<ExtArgs> | null
    /**
     * Filter, which Proveedor to fetch.
     */
    where: ProveedorWhereUniqueInput
  }

  /**
   * Proveedor findFirst
   */
  export type ProveedorFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Proveedor
     */
    select?: ProveedorSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProveedorInclude<ExtArgs> | null
    /**
     * Filter, which Proveedor to fetch.
     */
    where?: ProveedorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Proveedors to fetch.
     */
    orderBy?: ProveedorOrderByWithRelationInput | ProveedorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Proveedors.
     */
    cursor?: ProveedorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Proveedors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Proveedors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Proveedors.
     */
    distinct?: ProveedorScalarFieldEnum | ProveedorScalarFieldEnum[]
  }

  /**
   * Proveedor findFirstOrThrow
   */
  export type ProveedorFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Proveedor
     */
    select?: ProveedorSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProveedorInclude<ExtArgs> | null
    /**
     * Filter, which Proveedor to fetch.
     */
    where?: ProveedorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Proveedors to fetch.
     */
    orderBy?: ProveedorOrderByWithRelationInput | ProveedorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Proveedors.
     */
    cursor?: ProveedorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Proveedors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Proveedors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Proveedors.
     */
    distinct?: ProveedorScalarFieldEnum | ProveedorScalarFieldEnum[]
  }

  /**
   * Proveedor findMany
   */
  export type ProveedorFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Proveedor
     */
    select?: ProveedorSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProveedorInclude<ExtArgs> | null
    /**
     * Filter, which Proveedors to fetch.
     */
    where?: ProveedorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Proveedors to fetch.
     */
    orderBy?: ProveedorOrderByWithRelationInput | ProveedorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Proveedors.
     */
    cursor?: ProveedorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Proveedors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Proveedors.
     */
    skip?: number
    distinct?: ProveedorScalarFieldEnum | ProveedorScalarFieldEnum[]
  }

  /**
   * Proveedor create
   */
  export type ProveedorCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Proveedor
     */
    select?: ProveedorSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProveedorInclude<ExtArgs> | null
    /**
     * The data needed to create a Proveedor.
     */
    data: XOR<ProveedorCreateInput, ProveedorUncheckedCreateInput>
  }

  /**
   * Proveedor createMany
   */
  export type ProveedorCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Proveedors.
     */
    data: ProveedorCreateManyInput | ProveedorCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Proveedor createManyAndReturn
   */
  export type ProveedorCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Proveedor
     */
    select?: ProveedorSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Proveedors.
     */
    data: ProveedorCreateManyInput | ProveedorCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Proveedor update
   */
  export type ProveedorUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Proveedor
     */
    select?: ProveedorSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProveedorInclude<ExtArgs> | null
    /**
     * The data needed to update a Proveedor.
     */
    data: XOR<ProveedorUpdateInput, ProveedorUncheckedUpdateInput>
    /**
     * Choose, which Proveedor to update.
     */
    where: ProveedorWhereUniqueInput
  }

  /**
   * Proveedor updateMany
   */
  export type ProveedorUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Proveedors.
     */
    data: XOR<ProveedorUpdateManyMutationInput, ProveedorUncheckedUpdateManyInput>
    /**
     * Filter which Proveedors to update
     */
    where?: ProveedorWhereInput
  }

  /**
   * Proveedor upsert
   */
  export type ProveedorUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Proveedor
     */
    select?: ProveedorSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProveedorInclude<ExtArgs> | null
    /**
     * The filter to search for the Proveedor to update in case it exists.
     */
    where: ProveedorWhereUniqueInput
    /**
     * In case the Proveedor found by the `where` argument doesn't exist, create a new Proveedor with this data.
     */
    create: XOR<ProveedorCreateInput, ProveedorUncheckedCreateInput>
    /**
     * In case the Proveedor was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProveedorUpdateInput, ProveedorUncheckedUpdateInput>
  }

  /**
   * Proveedor delete
   */
  export type ProveedorDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Proveedor
     */
    select?: ProveedorSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProveedorInclude<ExtArgs> | null
    /**
     * Filter which Proveedor to delete.
     */
    where: ProveedorWhereUniqueInput
  }

  /**
   * Proveedor deleteMany
   */
  export type ProveedorDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Proveedors to delete
     */
    where?: ProveedorWhereInput
  }

  /**
   * Proveedor.ordenes
   */
  export type Proveedor$ordenesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdenCompra
     */
    select?: OrdenCompraSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrdenCompraInclude<ExtArgs> | null
    where?: OrdenCompraWhereInput
    orderBy?: OrdenCompraOrderByWithRelationInput | OrdenCompraOrderByWithRelationInput[]
    cursor?: OrdenCompraWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OrdenCompraScalarFieldEnum | OrdenCompraScalarFieldEnum[]
  }

  /**
   * Proveedor.comparativas
   */
  export type Proveedor$comparativasArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ComparativaDetalle
     */
    select?: ComparativaDetalleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ComparativaDetalleInclude<ExtArgs> | null
    where?: ComparativaDetalleWhereInput
    orderBy?: ComparativaDetalleOrderByWithRelationInput | ComparativaDetalleOrderByWithRelationInput[]
    cursor?: ComparativaDetalleWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ComparativaDetalleScalarFieldEnum | ComparativaDetalleScalarFieldEnum[]
  }

  /**
   * Proveedor without action
   */
  export type ProveedorDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Proveedor
     */
    select?: ProveedorSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProveedorInclude<ExtArgs> | null
  }


  /**
   * Model Requisicion
   */

  export type AggregateRequisicion = {
    _count: RequisicionCountAggregateOutputType | null
    _min: RequisicionMinAggregateOutputType | null
    _max: RequisicionMaxAggregateOutputType | null
  }

  export type RequisicionMinAggregateOutputType = {
    id_requisicion: string | null
    tenant_id: string | null
    proyecto_id: string | null
    codigo: string | null
    fecha_solicitud: Date | null
    solicitante_id: string | null
    prioridad: string | null
    estado: string | null
    observaciones: string | null
  }

  export type RequisicionMaxAggregateOutputType = {
    id_requisicion: string | null
    tenant_id: string | null
    proyecto_id: string | null
    codigo: string | null
    fecha_solicitud: Date | null
    solicitante_id: string | null
    prioridad: string | null
    estado: string | null
    observaciones: string | null
  }

  export type RequisicionCountAggregateOutputType = {
    id_requisicion: number
    tenant_id: number
    proyecto_id: number
    codigo: number
    fecha_solicitud: number
    solicitante_id: number
    prioridad: number
    estado: number
    observaciones: number
    _all: number
  }


  export type RequisicionMinAggregateInputType = {
    id_requisicion?: true
    tenant_id?: true
    proyecto_id?: true
    codigo?: true
    fecha_solicitud?: true
    solicitante_id?: true
    prioridad?: true
    estado?: true
    observaciones?: true
  }

  export type RequisicionMaxAggregateInputType = {
    id_requisicion?: true
    tenant_id?: true
    proyecto_id?: true
    codigo?: true
    fecha_solicitud?: true
    solicitante_id?: true
    prioridad?: true
    estado?: true
    observaciones?: true
  }

  export type RequisicionCountAggregateInputType = {
    id_requisicion?: true
    tenant_id?: true
    proyecto_id?: true
    codigo?: true
    fecha_solicitud?: true
    solicitante_id?: true
    prioridad?: true
    estado?: true
    observaciones?: true
    _all?: true
  }

  export type RequisicionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Requisicion to aggregate.
     */
    where?: RequisicionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Requisicions to fetch.
     */
    orderBy?: RequisicionOrderByWithRelationInput | RequisicionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RequisicionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Requisicions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Requisicions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Requisicions
    **/
    _count?: true | RequisicionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RequisicionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RequisicionMaxAggregateInputType
  }

  export type GetRequisicionAggregateType<T extends RequisicionAggregateArgs> = {
        [P in keyof T & keyof AggregateRequisicion]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRequisicion[P]>
      : GetScalarType<T[P], AggregateRequisicion[P]>
  }




  export type RequisicionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RequisicionWhereInput
    orderBy?: RequisicionOrderByWithAggregationInput | RequisicionOrderByWithAggregationInput[]
    by: RequisicionScalarFieldEnum[] | RequisicionScalarFieldEnum
    having?: RequisicionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RequisicionCountAggregateInputType | true
    _min?: RequisicionMinAggregateInputType
    _max?: RequisicionMaxAggregateInputType
  }

  export type RequisicionGroupByOutputType = {
    id_requisicion: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    fecha_solicitud: Date
    solicitante_id: string
    prioridad: string
    estado: string
    observaciones: string | null
    _count: RequisicionCountAggregateOutputType | null
    _min: RequisicionMinAggregateOutputType | null
    _max: RequisicionMaxAggregateOutputType | null
  }

  type GetRequisicionGroupByPayload<T extends RequisicionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RequisicionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RequisicionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RequisicionGroupByOutputType[P]>
            : GetScalarType<T[P], RequisicionGroupByOutputType[P]>
        }
      >
    >


  export type RequisicionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_requisicion?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    codigo?: boolean
    fecha_solicitud?: boolean
    solicitante_id?: boolean
    prioridad?: boolean
    estado?: boolean
    observaciones?: boolean
    items?: boolean | Requisicion$itemsArgs<ExtArgs>
    _count?: boolean | RequisicionCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["requisicion"]>

  export type RequisicionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_requisicion?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    codigo?: boolean
    fecha_solicitud?: boolean
    solicitante_id?: boolean
    prioridad?: boolean
    estado?: boolean
    observaciones?: boolean
  }, ExtArgs["result"]["requisicion"]>

  export type RequisicionSelectScalar = {
    id_requisicion?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    codigo?: boolean
    fecha_solicitud?: boolean
    solicitante_id?: boolean
    prioridad?: boolean
    estado?: boolean
    observaciones?: boolean
  }

  export type RequisicionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    items?: boolean | Requisicion$itemsArgs<ExtArgs>
    _count?: boolean | RequisicionCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type RequisicionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $RequisicionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Requisicion"
    objects: {
      items: Prisma.$RequisicionItemPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id_requisicion: string
      tenant_id: string
      proyecto_id: string
      codigo: string
      fecha_solicitud: Date
      solicitante_id: string
      prioridad: string
      estado: string
      observaciones: string | null
    }, ExtArgs["result"]["requisicion"]>
    composites: {}
  }

  type RequisicionGetPayload<S extends boolean | null | undefined | RequisicionDefaultArgs> = $Result.GetResult<Prisma.$RequisicionPayload, S>

  type RequisicionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<RequisicionFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: RequisicionCountAggregateInputType | true
    }

  export interface RequisicionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Requisicion'], meta: { name: 'Requisicion' } }
    /**
     * Find zero or one Requisicion that matches the filter.
     * @param {RequisicionFindUniqueArgs} args - Arguments to find a Requisicion
     * @example
     * // Get one Requisicion
     * const requisicion = await prisma.requisicion.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RequisicionFindUniqueArgs>(args: SelectSubset<T, RequisicionFindUniqueArgs<ExtArgs>>): Prisma__RequisicionClient<$Result.GetResult<Prisma.$RequisicionPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Requisicion that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {RequisicionFindUniqueOrThrowArgs} args - Arguments to find a Requisicion
     * @example
     * // Get one Requisicion
     * const requisicion = await prisma.requisicion.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RequisicionFindUniqueOrThrowArgs>(args: SelectSubset<T, RequisicionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RequisicionClient<$Result.GetResult<Prisma.$RequisicionPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Requisicion that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequisicionFindFirstArgs} args - Arguments to find a Requisicion
     * @example
     * // Get one Requisicion
     * const requisicion = await prisma.requisicion.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RequisicionFindFirstArgs>(args?: SelectSubset<T, RequisicionFindFirstArgs<ExtArgs>>): Prisma__RequisicionClient<$Result.GetResult<Prisma.$RequisicionPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Requisicion that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequisicionFindFirstOrThrowArgs} args - Arguments to find a Requisicion
     * @example
     * // Get one Requisicion
     * const requisicion = await prisma.requisicion.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RequisicionFindFirstOrThrowArgs>(args?: SelectSubset<T, RequisicionFindFirstOrThrowArgs<ExtArgs>>): Prisma__RequisicionClient<$Result.GetResult<Prisma.$RequisicionPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Requisicions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequisicionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Requisicions
     * const requisicions = await prisma.requisicion.findMany()
     * 
     * // Get first 10 Requisicions
     * const requisicions = await prisma.requisicion.findMany({ take: 10 })
     * 
     * // Only select the `id_requisicion`
     * const requisicionWithId_requisicionOnly = await prisma.requisicion.findMany({ select: { id_requisicion: true } })
     * 
     */
    findMany<T extends RequisicionFindManyArgs>(args?: SelectSubset<T, RequisicionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RequisicionPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Requisicion.
     * @param {RequisicionCreateArgs} args - Arguments to create a Requisicion.
     * @example
     * // Create one Requisicion
     * const Requisicion = await prisma.requisicion.create({
     *   data: {
     *     // ... data to create a Requisicion
     *   }
     * })
     * 
     */
    create<T extends RequisicionCreateArgs>(args: SelectSubset<T, RequisicionCreateArgs<ExtArgs>>): Prisma__RequisicionClient<$Result.GetResult<Prisma.$RequisicionPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Requisicions.
     * @param {RequisicionCreateManyArgs} args - Arguments to create many Requisicions.
     * @example
     * // Create many Requisicions
     * const requisicion = await prisma.requisicion.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RequisicionCreateManyArgs>(args?: SelectSubset<T, RequisicionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Requisicions and returns the data saved in the database.
     * @param {RequisicionCreateManyAndReturnArgs} args - Arguments to create many Requisicions.
     * @example
     * // Create many Requisicions
     * const requisicion = await prisma.requisicion.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Requisicions and only return the `id_requisicion`
     * const requisicionWithId_requisicionOnly = await prisma.requisicion.createManyAndReturn({ 
     *   select: { id_requisicion: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RequisicionCreateManyAndReturnArgs>(args?: SelectSubset<T, RequisicionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RequisicionPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Requisicion.
     * @param {RequisicionDeleteArgs} args - Arguments to delete one Requisicion.
     * @example
     * // Delete one Requisicion
     * const Requisicion = await prisma.requisicion.delete({
     *   where: {
     *     // ... filter to delete one Requisicion
     *   }
     * })
     * 
     */
    delete<T extends RequisicionDeleteArgs>(args: SelectSubset<T, RequisicionDeleteArgs<ExtArgs>>): Prisma__RequisicionClient<$Result.GetResult<Prisma.$RequisicionPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Requisicion.
     * @param {RequisicionUpdateArgs} args - Arguments to update one Requisicion.
     * @example
     * // Update one Requisicion
     * const requisicion = await prisma.requisicion.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RequisicionUpdateArgs>(args: SelectSubset<T, RequisicionUpdateArgs<ExtArgs>>): Prisma__RequisicionClient<$Result.GetResult<Prisma.$RequisicionPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Requisicions.
     * @param {RequisicionDeleteManyArgs} args - Arguments to filter Requisicions to delete.
     * @example
     * // Delete a few Requisicions
     * const { count } = await prisma.requisicion.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RequisicionDeleteManyArgs>(args?: SelectSubset<T, RequisicionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Requisicions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequisicionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Requisicions
     * const requisicion = await prisma.requisicion.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RequisicionUpdateManyArgs>(args: SelectSubset<T, RequisicionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Requisicion.
     * @param {RequisicionUpsertArgs} args - Arguments to update or create a Requisicion.
     * @example
     * // Update or create a Requisicion
     * const requisicion = await prisma.requisicion.upsert({
     *   create: {
     *     // ... data to create a Requisicion
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Requisicion we want to update
     *   }
     * })
     */
    upsert<T extends RequisicionUpsertArgs>(args: SelectSubset<T, RequisicionUpsertArgs<ExtArgs>>): Prisma__RequisicionClient<$Result.GetResult<Prisma.$RequisicionPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Requisicions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequisicionCountArgs} args - Arguments to filter Requisicions to count.
     * @example
     * // Count the number of Requisicions
     * const count = await prisma.requisicion.count({
     *   where: {
     *     // ... the filter for the Requisicions we want to count
     *   }
     * })
    **/
    count<T extends RequisicionCountArgs>(
      args?: Subset<T, RequisicionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RequisicionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Requisicion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequisicionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends RequisicionAggregateArgs>(args: Subset<T, RequisicionAggregateArgs>): Prisma.PrismaPromise<GetRequisicionAggregateType<T>>

    /**
     * Group by Requisicion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequisicionGroupByArgs} args - Group by arguments.
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
      T extends RequisicionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RequisicionGroupByArgs['orderBy'] }
        : { orderBy?: RequisicionGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, RequisicionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRequisicionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Requisicion model
   */
  readonly fields: RequisicionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Requisicion.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RequisicionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    items<T extends Requisicion$itemsArgs<ExtArgs> = {}>(args?: Subset<T, Requisicion$itemsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RequisicionItemPayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the Requisicion model
   */ 
  interface RequisicionFieldRefs {
    readonly id_requisicion: FieldRef<"Requisicion", 'String'>
    readonly tenant_id: FieldRef<"Requisicion", 'String'>
    readonly proyecto_id: FieldRef<"Requisicion", 'String'>
    readonly codigo: FieldRef<"Requisicion", 'String'>
    readonly fecha_solicitud: FieldRef<"Requisicion", 'DateTime'>
    readonly solicitante_id: FieldRef<"Requisicion", 'String'>
    readonly prioridad: FieldRef<"Requisicion", 'String'>
    readonly estado: FieldRef<"Requisicion", 'String'>
    readonly observaciones: FieldRef<"Requisicion", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Requisicion findUnique
   */
  export type RequisicionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Requisicion
     */
    select?: RequisicionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequisicionInclude<ExtArgs> | null
    /**
     * Filter, which Requisicion to fetch.
     */
    where: RequisicionWhereUniqueInput
  }

  /**
   * Requisicion findUniqueOrThrow
   */
  export type RequisicionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Requisicion
     */
    select?: RequisicionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequisicionInclude<ExtArgs> | null
    /**
     * Filter, which Requisicion to fetch.
     */
    where: RequisicionWhereUniqueInput
  }

  /**
   * Requisicion findFirst
   */
  export type RequisicionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Requisicion
     */
    select?: RequisicionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequisicionInclude<ExtArgs> | null
    /**
     * Filter, which Requisicion to fetch.
     */
    where?: RequisicionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Requisicions to fetch.
     */
    orderBy?: RequisicionOrderByWithRelationInput | RequisicionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Requisicions.
     */
    cursor?: RequisicionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Requisicions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Requisicions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Requisicions.
     */
    distinct?: RequisicionScalarFieldEnum | RequisicionScalarFieldEnum[]
  }

  /**
   * Requisicion findFirstOrThrow
   */
  export type RequisicionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Requisicion
     */
    select?: RequisicionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequisicionInclude<ExtArgs> | null
    /**
     * Filter, which Requisicion to fetch.
     */
    where?: RequisicionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Requisicions to fetch.
     */
    orderBy?: RequisicionOrderByWithRelationInput | RequisicionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Requisicions.
     */
    cursor?: RequisicionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Requisicions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Requisicions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Requisicions.
     */
    distinct?: RequisicionScalarFieldEnum | RequisicionScalarFieldEnum[]
  }

  /**
   * Requisicion findMany
   */
  export type RequisicionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Requisicion
     */
    select?: RequisicionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequisicionInclude<ExtArgs> | null
    /**
     * Filter, which Requisicions to fetch.
     */
    where?: RequisicionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Requisicions to fetch.
     */
    orderBy?: RequisicionOrderByWithRelationInput | RequisicionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Requisicions.
     */
    cursor?: RequisicionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Requisicions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Requisicions.
     */
    skip?: number
    distinct?: RequisicionScalarFieldEnum | RequisicionScalarFieldEnum[]
  }

  /**
   * Requisicion create
   */
  export type RequisicionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Requisicion
     */
    select?: RequisicionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequisicionInclude<ExtArgs> | null
    /**
     * The data needed to create a Requisicion.
     */
    data: XOR<RequisicionCreateInput, RequisicionUncheckedCreateInput>
  }

  /**
   * Requisicion createMany
   */
  export type RequisicionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Requisicions.
     */
    data: RequisicionCreateManyInput | RequisicionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Requisicion createManyAndReturn
   */
  export type RequisicionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Requisicion
     */
    select?: RequisicionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Requisicions.
     */
    data: RequisicionCreateManyInput | RequisicionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Requisicion update
   */
  export type RequisicionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Requisicion
     */
    select?: RequisicionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequisicionInclude<ExtArgs> | null
    /**
     * The data needed to update a Requisicion.
     */
    data: XOR<RequisicionUpdateInput, RequisicionUncheckedUpdateInput>
    /**
     * Choose, which Requisicion to update.
     */
    where: RequisicionWhereUniqueInput
  }

  /**
   * Requisicion updateMany
   */
  export type RequisicionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Requisicions.
     */
    data: XOR<RequisicionUpdateManyMutationInput, RequisicionUncheckedUpdateManyInput>
    /**
     * Filter which Requisicions to update
     */
    where?: RequisicionWhereInput
  }

  /**
   * Requisicion upsert
   */
  export type RequisicionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Requisicion
     */
    select?: RequisicionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequisicionInclude<ExtArgs> | null
    /**
     * The filter to search for the Requisicion to update in case it exists.
     */
    where: RequisicionWhereUniqueInput
    /**
     * In case the Requisicion found by the `where` argument doesn't exist, create a new Requisicion with this data.
     */
    create: XOR<RequisicionCreateInput, RequisicionUncheckedCreateInput>
    /**
     * In case the Requisicion was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RequisicionUpdateInput, RequisicionUncheckedUpdateInput>
  }

  /**
   * Requisicion delete
   */
  export type RequisicionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Requisicion
     */
    select?: RequisicionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequisicionInclude<ExtArgs> | null
    /**
     * Filter which Requisicion to delete.
     */
    where: RequisicionWhereUniqueInput
  }

  /**
   * Requisicion deleteMany
   */
  export type RequisicionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Requisicions to delete
     */
    where?: RequisicionWhereInput
  }

  /**
   * Requisicion.items
   */
  export type Requisicion$itemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequisicionItem
     */
    select?: RequisicionItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequisicionItemInclude<ExtArgs> | null
    where?: RequisicionItemWhereInput
    orderBy?: RequisicionItemOrderByWithRelationInput | RequisicionItemOrderByWithRelationInput[]
    cursor?: RequisicionItemWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RequisicionItemScalarFieldEnum | RequisicionItemScalarFieldEnum[]
  }

  /**
   * Requisicion without action
   */
  export type RequisicionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Requisicion
     */
    select?: RequisicionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequisicionInclude<ExtArgs> | null
  }


  /**
   * Model RequisicionItem
   */

  export type AggregateRequisicionItem = {
    _count: RequisicionItemCountAggregateOutputType | null
    _avg: RequisicionItemAvgAggregateOutputType | null
    _sum: RequisicionItemSumAggregateOutputType | null
    _min: RequisicionItemMinAggregateOutputType | null
    _max: RequisicionItemMaxAggregateOutputType | null
  }

  export type RequisicionItemAvgAggregateOutputType = {
    cantidad: Decimal | null
  }

  export type RequisicionItemSumAggregateOutputType = {
    cantidad: Decimal | null
  }

  export type RequisicionItemMinAggregateOutputType = {
    id_item: string | null
    tenant_id: string | null
    proyecto_id: string | null
    requisicion_id: string | null
    insumo_id: string | null
    cantidad: Decimal | null
    notas: string | null
  }

  export type RequisicionItemMaxAggregateOutputType = {
    id_item: string | null
    tenant_id: string | null
    proyecto_id: string | null
    requisicion_id: string | null
    insumo_id: string | null
    cantidad: Decimal | null
    notas: string | null
  }

  export type RequisicionItemCountAggregateOutputType = {
    id_item: number
    tenant_id: number
    proyecto_id: number
    requisicion_id: number
    insumo_id: number
    cantidad: number
    notas: number
    _all: number
  }


  export type RequisicionItemAvgAggregateInputType = {
    cantidad?: true
  }

  export type RequisicionItemSumAggregateInputType = {
    cantidad?: true
  }

  export type RequisicionItemMinAggregateInputType = {
    id_item?: true
    tenant_id?: true
    proyecto_id?: true
    requisicion_id?: true
    insumo_id?: true
    cantidad?: true
    notas?: true
  }

  export type RequisicionItemMaxAggregateInputType = {
    id_item?: true
    tenant_id?: true
    proyecto_id?: true
    requisicion_id?: true
    insumo_id?: true
    cantidad?: true
    notas?: true
  }

  export type RequisicionItemCountAggregateInputType = {
    id_item?: true
    tenant_id?: true
    proyecto_id?: true
    requisicion_id?: true
    insumo_id?: true
    cantidad?: true
    notas?: true
    _all?: true
  }

  export type RequisicionItemAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RequisicionItem to aggregate.
     */
    where?: RequisicionItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RequisicionItems to fetch.
     */
    orderBy?: RequisicionItemOrderByWithRelationInput | RequisicionItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RequisicionItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RequisicionItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RequisicionItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned RequisicionItems
    **/
    _count?: true | RequisicionItemCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RequisicionItemAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RequisicionItemSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RequisicionItemMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RequisicionItemMaxAggregateInputType
  }

  export type GetRequisicionItemAggregateType<T extends RequisicionItemAggregateArgs> = {
        [P in keyof T & keyof AggregateRequisicionItem]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRequisicionItem[P]>
      : GetScalarType<T[P], AggregateRequisicionItem[P]>
  }




  export type RequisicionItemGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RequisicionItemWhereInput
    orderBy?: RequisicionItemOrderByWithAggregationInput | RequisicionItemOrderByWithAggregationInput[]
    by: RequisicionItemScalarFieldEnum[] | RequisicionItemScalarFieldEnum
    having?: RequisicionItemScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RequisicionItemCountAggregateInputType | true
    _avg?: RequisicionItemAvgAggregateInputType
    _sum?: RequisicionItemSumAggregateInputType
    _min?: RequisicionItemMinAggregateInputType
    _max?: RequisicionItemMaxAggregateInputType
  }

  export type RequisicionItemGroupByOutputType = {
    id_item: string
    tenant_id: string
    proyecto_id: string
    requisicion_id: string
    insumo_id: string
    cantidad: Decimal
    notas: string | null
    _count: RequisicionItemCountAggregateOutputType | null
    _avg: RequisicionItemAvgAggregateOutputType | null
    _sum: RequisicionItemSumAggregateOutputType | null
    _min: RequisicionItemMinAggregateOutputType | null
    _max: RequisicionItemMaxAggregateOutputType | null
  }

  type GetRequisicionItemGroupByPayload<T extends RequisicionItemGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RequisicionItemGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RequisicionItemGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RequisicionItemGroupByOutputType[P]>
            : GetScalarType<T[P], RequisicionItemGroupByOutputType[P]>
        }
      >
    >


  export type RequisicionItemSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_item?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    requisicion_id?: boolean
    insumo_id?: boolean
    cantidad?: boolean
    notas?: boolean
    requisicion?: boolean | RequisicionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["requisicionItem"]>

  export type RequisicionItemSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_item?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    requisicion_id?: boolean
    insumo_id?: boolean
    cantidad?: boolean
    notas?: boolean
    requisicion?: boolean | RequisicionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["requisicionItem"]>

  export type RequisicionItemSelectScalar = {
    id_item?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    requisicion_id?: boolean
    insumo_id?: boolean
    cantidad?: boolean
    notas?: boolean
  }

  export type RequisicionItemInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    requisicion?: boolean | RequisicionDefaultArgs<ExtArgs>
  }
  export type RequisicionItemIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    requisicion?: boolean | RequisicionDefaultArgs<ExtArgs>
  }

  export type $RequisicionItemPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "RequisicionItem"
    objects: {
      requisicion: Prisma.$RequisicionPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id_item: string
      tenant_id: string
      proyecto_id: string
      requisicion_id: string
      insumo_id: string
      cantidad: Prisma.Decimal
      notas: string | null
    }, ExtArgs["result"]["requisicionItem"]>
    composites: {}
  }

  type RequisicionItemGetPayload<S extends boolean | null | undefined | RequisicionItemDefaultArgs> = $Result.GetResult<Prisma.$RequisicionItemPayload, S>

  type RequisicionItemCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<RequisicionItemFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: RequisicionItemCountAggregateInputType | true
    }

  export interface RequisicionItemDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['RequisicionItem'], meta: { name: 'RequisicionItem' } }
    /**
     * Find zero or one RequisicionItem that matches the filter.
     * @param {RequisicionItemFindUniqueArgs} args - Arguments to find a RequisicionItem
     * @example
     * // Get one RequisicionItem
     * const requisicionItem = await prisma.requisicionItem.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RequisicionItemFindUniqueArgs>(args: SelectSubset<T, RequisicionItemFindUniqueArgs<ExtArgs>>): Prisma__RequisicionItemClient<$Result.GetResult<Prisma.$RequisicionItemPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one RequisicionItem that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {RequisicionItemFindUniqueOrThrowArgs} args - Arguments to find a RequisicionItem
     * @example
     * // Get one RequisicionItem
     * const requisicionItem = await prisma.requisicionItem.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RequisicionItemFindUniqueOrThrowArgs>(args: SelectSubset<T, RequisicionItemFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RequisicionItemClient<$Result.GetResult<Prisma.$RequisicionItemPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first RequisicionItem that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequisicionItemFindFirstArgs} args - Arguments to find a RequisicionItem
     * @example
     * // Get one RequisicionItem
     * const requisicionItem = await prisma.requisicionItem.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RequisicionItemFindFirstArgs>(args?: SelectSubset<T, RequisicionItemFindFirstArgs<ExtArgs>>): Prisma__RequisicionItemClient<$Result.GetResult<Prisma.$RequisicionItemPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first RequisicionItem that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequisicionItemFindFirstOrThrowArgs} args - Arguments to find a RequisicionItem
     * @example
     * // Get one RequisicionItem
     * const requisicionItem = await prisma.requisicionItem.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RequisicionItemFindFirstOrThrowArgs>(args?: SelectSubset<T, RequisicionItemFindFirstOrThrowArgs<ExtArgs>>): Prisma__RequisicionItemClient<$Result.GetResult<Prisma.$RequisicionItemPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more RequisicionItems that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequisicionItemFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RequisicionItems
     * const requisicionItems = await prisma.requisicionItem.findMany()
     * 
     * // Get first 10 RequisicionItems
     * const requisicionItems = await prisma.requisicionItem.findMany({ take: 10 })
     * 
     * // Only select the `id_item`
     * const requisicionItemWithId_itemOnly = await prisma.requisicionItem.findMany({ select: { id_item: true } })
     * 
     */
    findMany<T extends RequisicionItemFindManyArgs>(args?: SelectSubset<T, RequisicionItemFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RequisicionItemPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a RequisicionItem.
     * @param {RequisicionItemCreateArgs} args - Arguments to create a RequisicionItem.
     * @example
     * // Create one RequisicionItem
     * const RequisicionItem = await prisma.requisicionItem.create({
     *   data: {
     *     // ... data to create a RequisicionItem
     *   }
     * })
     * 
     */
    create<T extends RequisicionItemCreateArgs>(args: SelectSubset<T, RequisicionItemCreateArgs<ExtArgs>>): Prisma__RequisicionItemClient<$Result.GetResult<Prisma.$RequisicionItemPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many RequisicionItems.
     * @param {RequisicionItemCreateManyArgs} args - Arguments to create many RequisicionItems.
     * @example
     * // Create many RequisicionItems
     * const requisicionItem = await prisma.requisicionItem.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RequisicionItemCreateManyArgs>(args?: SelectSubset<T, RequisicionItemCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many RequisicionItems and returns the data saved in the database.
     * @param {RequisicionItemCreateManyAndReturnArgs} args - Arguments to create many RequisicionItems.
     * @example
     * // Create many RequisicionItems
     * const requisicionItem = await prisma.requisicionItem.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many RequisicionItems and only return the `id_item`
     * const requisicionItemWithId_itemOnly = await prisma.requisicionItem.createManyAndReturn({ 
     *   select: { id_item: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RequisicionItemCreateManyAndReturnArgs>(args?: SelectSubset<T, RequisicionItemCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RequisicionItemPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a RequisicionItem.
     * @param {RequisicionItemDeleteArgs} args - Arguments to delete one RequisicionItem.
     * @example
     * // Delete one RequisicionItem
     * const RequisicionItem = await prisma.requisicionItem.delete({
     *   where: {
     *     // ... filter to delete one RequisicionItem
     *   }
     * })
     * 
     */
    delete<T extends RequisicionItemDeleteArgs>(args: SelectSubset<T, RequisicionItemDeleteArgs<ExtArgs>>): Prisma__RequisicionItemClient<$Result.GetResult<Prisma.$RequisicionItemPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one RequisicionItem.
     * @param {RequisicionItemUpdateArgs} args - Arguments to update one RequisicionItem.
     * @example
     * // Update one RequisicionItem
     * const requisicionItem = await prisma.requisicionItem.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RequisicionItemUpdateArgs>(args: SelectSubset<T, RequisicionItemUpdateArgs<ExtArgs>>): Prisma__RequisicionItemClient<$Result.GetResult<Prisma.$RequisicionItemPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more RequisicionItems.
     * @param {RequisicionItemDeleteManyArgs} args - Arguments to filter RequisicionItems to delete.
     * @example
     * // Delete a few RequisicionItems
     * const { count } = await prisma.requisicionItem.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RequisicionItemDeleteManyArgs>(args?: SelectSubset<T, RequisicionItemDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RequisicionItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequisicionItemUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RequisicionItems
     * const requisicionItem = await prisma.requisicionItem.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RequisicionItemUpdateManyArgs>(args: SelectSubset<T, RequisicionItemUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one RequisicionItem.
     * @param {RequisicionItemUpsertArgs} args - Arguments to update or create a RequisicionItem.
     * @example
     * // Update or create a RequisicionItem
     * const requisicionItem = await prisma.requisicionItem.upsert({
     *   create: {
     *     // ... data to create a RequisicionItem
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RequisicionItem we want to update
     *   }
     * })
     */
    upsert<T extends RequisicionItemUpsertArgs>(args: SelectSubset<T, RequisicionItemUpsertArgs<ExtArgs>>): Prisma__RequisicionItemClient<$Result.GetResult<Prisma.$RequisicionItemPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of RequisicionItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequisicionItemCountArgs} args - Arguments to filter RequisicionItems to count.
     * @example
     * // Count the number of RequisicionItems
     * const count = await prisma.requisicionItem.count({
     *   where: {
     *     // ... the filter for the RequisicionItems we want to count
     *   }
     * })
    **/
    count<T extends RequisicionItemCountArgs>(
      args?: Subset<T, RequisicionItemCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RequisicionItemCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a RequisicionItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequisicionItemAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends RequisicionItemAggregateArgs>(args: Subset<T, RequisicionItemAggregateArgs>): Prisma.PrismaPromise<GetRequisicionItemAggregateType<T>>

    /**
     * Group by RequisicionItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequisicionItemGroupByArgs} args - Group by arguments.
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
      T extends RequisicionItemGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RequisicionItemGroupByArgs['orderBy'] }
        : { orderBy?: RequisicionItemGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, RequisicionItemGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRequisicionItemGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the RequisicionItem model
   */
  readonly fields: RequisicionItemFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for RequisicionItem.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RequisicionItemClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    requisicion<T extends RequisicionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, RequisicionDefaultArgs<ExtArgs>>): Prisma__RequisicionClient<$Result.GetResult<Prisma.$RequisicionPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
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
   * Fields of the RequisicionItem model
   */ 
  interface RequisicionItemFieldRefs {
    readonly id_item: FieldRef<"RequisicionItem", 'String'>
    readonly tenant_id: FieldRef<"RequisicionItem", 'String'>
    readonly proyecto_id: FieldRef<"RequisicionItem", 'String'>
    readonly requisicion_id: FieldRef<"RequisicionItem", 'String'>
    readonly insumo_id: FieldRef<"RequisicionItem", 'String'>
    readonly cantidad: FieldRef<"RequisicionItem", 'Decimal'>
    readonly notas: FieldRef<"RequisicionItem", 'String'>
  }
    

  // Custom InputTypes
  /**
   * RequisicionItem findUnique
   */
  export type RequisicionItemFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequisicionItem
     */
    select?: RequisicionItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequisicionItemInclude<ExtArgs> | null
    /**
     * Filter, which RequisicionItem to fetch.
     */
    where: RequisicionItemWhereUniqueInput
  }

  /**
   * RequisicionItem findUniqueOrThrow
   */
  export type RequisicionItemFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequisicionItem
     */
    select?: RequisicionItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequisicionItemInclude<ExtArgs> | null
    /**
     * Filter, which RequisicionItem to fetch.
     */
    where: RequisicionItemWhereUniqueInput
  }

  /**
   * RequisicionItem findFirst
   */
  export type RequisicionItemFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequisicionItem
     */
    select?: RequisicionItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequisicionItemInclude<ExtArgs> | null
    /**
     * Filter, which RequisicionItem to fetch.
     */
    where?: RequisicionItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RequisicionItems to fetch.
     */
    orderBy?: RequisicionItemOrderByWithRelationInput | RequisicionItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RequisicionItems.
     */
    cursor?: RequisicionItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RequisicionItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RequisicionItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RequisicionItems.
     */
    distinct?: RequisicionItemScalarFieldEnum | RequisicionItemScalarFieldEnum[]
  }

  /**
   * RequisicionItem findFirstOrThrow
   */
  export type RequisicionItemFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequisicionItem
     */
    select?: RequisicionItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequisicionItemInclude<ExtArgs> | null
    /**
     * Filter, which RequisicionItem to fetch.
     */
    where?: RequisicionItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RequisicionItems to fetch.
     */
    orderBy?: RequisicionItemOrderByWithRelationInput | RequisicionItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RequisicionItems.
     */
    cursor?: RequisicionItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RequisicionItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RequisicionItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RequisicionItems.
     */
    distinct?: RequisicionItemScalarFieldEnum | RequisicionItemScalarFieldEnum[]
  }

  /**
   * RequisicionItem findMany
   */
  export type RequisicionItemFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequisicionItem
     */
    select?: RequisicionItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequisicionItemInclude<ExtArgs> | null
    /**
     * Filter, which RequisicionItems to fetch.
     */
    where?: RequisicionItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RequisicionItems to fetch.
     */
    orderBy?: RequisicionItemOrderByWithRelationInput | RequisicionItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing RequisicionItems.
     */
    cursor?: RequisicionItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RequisicionItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RequisicionItems.
     */
    skip?: number
    distinct?: RequisicionItemScalarFieldEnum | RequisicionItemScalarFieldEnum[]
  }

  /**
   * RequisicionItem create
   */
  export type RequisicionItemCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequisicionItem
     */
    select?: RequisicionItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequisicionItemInclude<ExtArgs> | null
    /**
     * The data needed to create a RequisicionItem.
     */
    data: XOR<RequisicionItemCreateInput, RequisicionItemUncheckedCreateInput>
  }

  /**
   * RequisicionItem createMany
   */
  export type RequisicionItemCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many RequisicionItems.
     */
    data: RequisicionItemCreateManyInput | RequisicionItemCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RequisicionItem createManyAndReturn
   */
  export type RequisicionItemCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequisicionItem
     */
    select?: RequisicionItemSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many RequisicionItems.
     */
    data: RequisicionItemCreateManyInput | RequisicionItemCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequisicionItemIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * RequisicionItem update
   */
  export type RequisicionItemUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequisicionItem
     */
    select?: RequisicionItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequisicionItemInclude<ExtArgs> | null
    /**
     * The data needed to update a RequisicionItem.
     */
    data: XOR<RequisicionItemUpdateInput, RequisicionItemUncheckedUpdateInput>
    /**
     * Choose, which RequisicionItem to update.
     */
    where: RequisicionItemWhereUniqueInput
  }

  /**
   * RequisicionItem updateMany
   */
  export type RequisicionItemUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update RequisicionItems.
     */
    data: XOR<RequisicionItemUpdateManyMutationInput, RequisicionItemUncheckedUpdateManyInput>
    /**
     * Filter which RequisicionItems to update
     */
    where?: RequisicionItemWhereInput
  }

  /**
   * RequisicionItem upsert
   */
  export type RequisicionItemUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequisicionItem
     */
    select?: RequisicionItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequisicionItemInclude<ExtArgs> | null
    /**
     * The filter to search for the RequisicionItem to update in case it exists.
     */
    where: RequisicionItemWhereUniqueInput
    /**
     * In case the RequisicionItem found by the `where` argument doesn't exist, create a new RequisicionItem with this data.
     */
    create: XOR<RequisicionItemCreateInput, RequisicionItemUncheckedCreateInput>
    /**
     * In case the RequisicionItem was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RequisicionItemUpdateInput, RequisicionItemUncheckedUpdateInput>
  }

  /**
   * RequisicionItem delete
   */
  export type RequisicionItemDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequisicionItem
     */
    select?: RequisicionItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequisicionItemInclude<ExtArgs> | null
    /**
     * Filter which RequisicionItem to delete.
     */
    where: RequisicionItemWhereUniqueInput
  }

  /**
   * RequisicionItem deleteMany
   */
  export type RequisicionItemDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RequisicionItems to delete
     */
    where?: RequisicionItemWhereInput
  }

  /**
   * RequisicionItem without action
   */
  export type RequisicionItemDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequisicionItem
     */
    select?: RequisicionItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequisicionItemInclude<ExtArgs> | null
  }


  /**
   * Model OrdenCompra
   */

  export type AggregateOrdenCompra = {
    _count: OrdenCompraCountAggregateOutputType | null
    _avg: OrdenCompraAvgAggregateOutputType | null
    _sum: OrdenCompraSumAggregateOutputType | null
    _min: OrdenCompraMinAggregateOutputType | null
    _max: OrdenCompraMaxAggregateOutputType | null
  }

  export type OrdenCompraAvgAggregateOutputType = {
    tipo_cambio: Decimal | null
    subtotal: Decimal | null
    iva: Decimal | null
    total: Decimal | null
  }

  export type OrdenCompraSumAggregateOutputType = {
    tipo_cambio: Decimal | null
    subtotal: Decimal | null
    iva: Decimal | null
    total: Decimal | null
  }

  export type OrdenCompraMinAggregateOutputType = {
    id_orden: string | null
    tenant_id: string | null
    proyecto_id: string | null
    proveedor_id: string | null
    codigo: string | null
    fecha_emision: Date | null
    estado: string | null
    moneda: string | null
    tipo_cambio: Decimal | null
    subtotal: Decimal | null
    iva: Decimal | null
    total: Decimal | null
    presupuesto_id: string | null
  }

  export type OrdenCompraMaxAggregateOutputType = {
    id_orden: string | null
    tenant_id: string | null
    proyecto_id: string | null
    proveedor_id: string | null
    codigo: string | null
    fecha_emision: Date | null
    estado: string | null
    moneda: string | null
    tipo_cambio: Decimal | null
    subtotal: Decimal | null
    iva: Decimal | null
    total: Decimal | null
    presupuesto_id: string | null
  }

  export type OrdenCompraCountAggregateOutputType = {
    id_orden: number
    tenant_id: number
    proyecto_id: number
    proveedor_id: number
    codigo: number
    fecha_emision: number
    estado: number
    moneda: number
    tipo_cambio: number
    subtotal: number
    iva: number
    total: number
    presupuesto_id: number
    _all: number
  }


  export type OrdenCompraAvgAggregateInputType = {
    tipo_cambio?: true
    subtotal?: true
    iva?: true
    total?: true
  }

  export type OrdenCompraSumAggregateInputType = {
    tipo_cambio?: true
    subtotal?: true
    iva?: true
    total?: true
  }

  export type OrdenCompraMinAggregateInputType = {
    id_orden?: true
    tenant_id?: true
    proyecto_id?: true
    proveedor_id?: true
    codigo?: true
    fecha_emision?: true
    estado?: true
    moneda?: true
    tipo_cambio?: true
    subtotal?: true
    iva?: true
    total?: true
    presupuesto_id?: true
  }

  export type OrdenCompraMaxAggregateInputType = {
    id_orden?: true
    tenant_id?: true
    proyecto_id?: true
    proveedor_id?: true
    codigo?: true
    fecha_emision?: true
    estado?: true
    moneda?: true
    tipo_cambio?: true
    subtotal?: true
    iva?: true
    total?: true
    presupuesto_id?: true
  }

  export type OrdenCompraCountAggregateInputType = {
    id_orden?: true
    tenant_id?: true
    proyecto_id?: true
    proveedor_id?: true
    codigo?: true
    fecha_emision?: true
    estado?: true
    moneda?: true
    tipo_cambio?: true
    subtotal?: true
    iva?: true
    total?: true
    presupuesto_id?: true
    _all?: true
  }

  export type OrdenCompraAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OrdenCompra to aggregate.
     */
    where?: OrdenCompraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrdenCompras to fetch.
     */
    orderBy?: OrdenCompraOrderByWithRelationInput | OrdenCompraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OrdenCompraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrdenCompras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrdenCompras.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OrdenCompras
    **/
    _count?: true | OrdenCompraCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OrdenCompraAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OrdenCompraSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OrdenCompraMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OrdenCompraMaxAggregateInputType
  }

  export type GetOrdenCompraAggregateType<T extends OrdenCompraAggregateArgs> = {
        [P in keyof T & keyof AggregateOrdenCompra]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOrdenCompra[P]>
      : GetScalarType<T[P], AggregateOrdenCompra[P]>
  }




  export type OrdenCompraGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrdenCompraWhereInput
    orderBy?: OrdenCompraOrderByWithAggregationInput | OrdenCompraOrderByWithAggregationInput[]
    by: OrdenCompraScalarFieldEnum[] | OrdenCompraScalarFieldEnum
    having?: OrdenCompraScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OrdenCompraCountAggregateInputType | true
    _avg?: OrdenCompraAvgAggregateInputType
    _sum?: OrdenCompraSumAggregateInputType
    _min?: OrdenCompraMinAggregateInputType
    _max?: OrdenCompraMaxAggregateInputType
  }

  export type OrdenCompraGroupByOutputType = {
    id_orden: string
    tenant_id: string
    proyecto_id: string
    proveedor_id: string
    codigo: string
    fecha_emision: Date
    estado: string
    moneda: string
    tipo_cambio: Decimal
    subtotal: Decimal
    iva: Decimal
    total: Decimal
    presupuesto_id: string | null
    _count: OrdenCompraCountAggregateOutputType | null
    _avg: OrdenCompraAvgAggregateOutputType | null
    _sum: OrdenCompraSumAggregateOutputType | null
    _min: OrdenCompraMinAggregateOutputType | null
    _max: OrdenCompraMaxAggregateOutputType | null
  }

  type GetOrdenCompraGroupByPayload<T extends OrdenCompraGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OrdenCompraGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OrdenCompraGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OrdenCompraGroupByOutputType[P]>
            : GetScalarType<T[P], OrdenCompraGroupByOutputType[P]>
        }
      >
    >


  export type OrdenCompraSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_orden?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    proveedor_id?: boolean
    codigo?: boolean
    fecha_emision?: boolean
    estado?: boolean
    moneda?: boolean
    tipo_cambio?: boolean
    subtotal?: boolean
    iva?: boolean
    total?: boolean
    presupuesto_id?: boolean
    proveedor?: boolean | ProveedorDefaultArgs<ExtArgs>
    items?: boolean | OrdenCompra$itemsArgs<ExtArgs>
    _count?: boolean | OrdenCompraCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ordenCompra"]>

  export type OrdenCompraSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_orden?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    proveedor_id?: boolean
    codigo?: boolean
    fecha_emision?: boolean
    estado?: boolean
    moneda?: boolean
    tipo_cambio?: boolean
    subtotal?: boolean
    iva?: boolean
    total?: boolean
    presupuesto_id?: boolean
    proveedor?: boolean | ProveedorDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ordenCompra"]>

  export type OrdenCompraSelectScalar = {
    id_orden?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    proveedor_id?: boolean
    codigo?: boolean
    fecha_emision?: boolean
    estado?: boolean
    moneda?: boolean
    tipo_cambio?: boolean
    subtotal?: boolean
    iva?: boolean
    total?: boolean
    presupuesto_id?: boolean
  }

  export type OrdenCompraInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    proveedor?: boolean | ProveedorDefaultArgs<ExtArgs>
    items?: boolean | OrdenCompra$itemsArgs<ExtArgs>
    _count?: boolean | OrdenCompraCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type OrdenCompraIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    proveedor?: boolean | ProveedorDefaultArgs<ExtArgs>
  }

  export type $OrdenCompraPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OrdenCompra"
    objects: {
      proveedor: Prisma.$ProveedorPayload<ExtArgs>
      items: Prisma.$OrdenCompraItemPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id_orden: string
      tenant_id: string
      proyecto_id: string
      proveedor_id: string
      codigo: string
      fecha_emision: Date
      estado: string
      moneda: string
      tipo_cambio: Prisma.Decimal
      subtotal: Prisma.Decimal
      iva: Prisma.Decimal
      total: Prisma.Decimal
      presupuesto_id: string | null
    }, ExtArgs["result"]["ordenCompra"]>
    composites: {}
  }

  type OrdenCompraGetPayload<S extends boolean | null | undefined | OrdenCompraDefaultArgs> = $Result.GetResult<Prisma.$OrdenCompraPayload, S>

  type OrdenCompraCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<OrdenCompraFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: OrdenCompraCountAggregateInputType | true
    }

  export interface OrdenCompraDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OrdenCompra'], meta: { name: 'OrdenCompra' } }
    /**
     * Find zero or one OrdenCompra that matches the filter.
     * @param {OrdenCompraFindUniqueArgs} args - Arguments to find a OrdenCompra
     * @example
     * // Get one OrdenCompra
     * const ordenCompra = await prisma.ordenCompra.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OrdenCompraFindUniqueArgs>(args: SelectSubset<T, OrdenCompraFindUniqueArgs<ExtArgs>>): Prisma__OrdenCompraClient<$Result.GetResult<Prisma.$OrdenCompraPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one OrdenCompra that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {OrdenCompraFindUniqueOrThrowArgs} args - Arguments to find a OrdenCompra
     * @example
     * // Get one OrdenCompra
     * const ordenCompra = await prisma.ordenCompra.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OrdenCompraFindUniqueOrThrowArgs>(args: SelectSubset<T, OrdenCompraFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OrdenCompraClient<$Result.GetResult<Prisma.$OrdenCompraPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first OrdenCompra that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrdenCompraFindFirstArgs} args - Arguments to find a OrdenCompra
     * @example
     * // Get one OrdenCompra
     * const ordenCompra = await prisma.ordenCompra.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OrdenCompraFindFirstArgs>(args?: SelectSubset<T, OrdenCompraFindFirstArgs<ExtArgs>>): Prisma__OrdenCompraClient<$Result.GetResult<Prisma.$OrdenCompraPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first OrdenCompra that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrdenCompraFindFirstOrThrowArgs} args - Arguments to find a OrdenCompra
     * @example
     * // Get one OrdenCompra
     * const ordenCompra = await prisma.ordenCompra.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OrdenCompraFindFirstOrThrowArgs>(args?: SelectSubset<T, OrdenCompraFindFirstOrThrowArgs<ExtArgs>>): Prisma__OrdenCompraClient<$Result.GetResult<Prisma.$OrdenCompraPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more OrdenCompras that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrdenCompraFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OrdenCompras
     * const ordenCompras = await prisma.ordenCompra.findMany()
     * 
     * // Get first 10 OrdenCompras
     * const ordenCompras = await prisma.ordenCompra.findMany({ take: 10 })
     * 
     * // Only select the `id_orden`
     * const ordenCompraWithId_ordenOnly = await prisma.ordenCompra.findMany({ select: { id_orden: true } })
     * 
     */
    findMany<T extends OrdenCompraFindManyArgs>(args?: SelectSubset<T, OrdenCompraFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrdenCompraPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a OrdenCompra.
     * @param {OrdenCompraCreateArgs} args - Arguments to create a OrdenCompra.
     * @example
     * // Create one OrdenCompra
     * const OrdenCompra = await prisma.ordenCompra.create({
     *   data: {
     *     // ... data to create a OrdenCompra
     *   }
     * })
     * 
     */
    create<T extends OrdenCompraCreateArgs>(args: SelectSubset<T, OrdenCompraCreateArgs<ExtArgs>>): Prisma__OrdenCompraClient<$Result.GetResult<Prisma.$OrdenCompraPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many OrdenCompras.
     * @param {OrdenCompraCreateManyArgs} args - Arguments to create many OrdenCompras.
     * @example
     * // Create many OrdenCompras
     * const ordenCompra = await prisma.ordenCompra.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OrdenCompraCreateManyArgs>(args?: SelectSubset<T, OrdenCompraCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many OrdenCompras and returns the data saved in the database.
     * @param {OrdenCompraCreateManyAndReturnArgs} args - Arguments to create many OrdenCompras.
     * @example
     * // Create many OrdenCompras
     * const ordenCompra = await prisma.ordenCompra.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many OrdenCompras and only return the `id_orden`
     * const ordenCompraWithId_ordenOnly = await prisma.ordenCompra.createManyAndReturn({ 
     *   select: { id_orden: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OrdenCompraCreateManyAndReturnArgs>(args?: SelectSubset<T, OrdenCompraCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrdenCompraPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a OrdenCompra.
     * @param {OrdenCompraDeleteArgs} args - Arguments to delete one OrdenCompra.
     * @example
     * // Delete one OrdenCompra
     * const OrdenCompra = await prisma.ordenCompra.delete({
     *   where: {
     *     // ... filter to delete one OrdenCompra
     *   }
     * })
     * 
     */
    delete<T extends OrdenCompraDeleteArgs>(args: SelectSubset<T, OrdenCompraDeleteArgs<ExtArgs>>): Prisma__OrdenCompraClient<$Result.GetResult<Prisma.$OrdenCompraPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one OrdenCompra.
     * @param {OrdenCompraUpdateArgs} args - Arguments to update one OrdenCompra.
     * @example
     * // Update one OrdenCompra
     * const ordenCompra = await prisma.ordenCompra.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OrdenCompraUpdateArgs>(args: SelectSubset<T, OrdenCompraUpdateArgs<ExtArgs>>): Prisma__OrdenCompraClient<$Result.GetResult<Prisma.$OrdenCompraPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more OrdenCompras.
     * @param {OrdenCompraDeleteManyArgs} args - Arguments to filter OrdenCompras to delete.
     * @example
     * // Delete a few OrdenCompras
     * const { count } = await prisma.ordenCompra.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OrdenCompraDeleteManyArgs>(args?: SelectSubset<T, OrdenCompraDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OrdenCompras.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrdenCompraUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OrdenCompras
     * const ordenCompra = await prisma.ordenCompra.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OrdenCompraUpdateManyArgs>(args: SelectSubset<T, OrdenCompraUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one OrdenCompra.
     * @param {OrdenCompraUpsertArgs} args - Arguments to update or create a OrdenCompra.
     * @example
     * // Update or create a OrdenCompra
     * const ordenCompra = await prisma.ordenCompra.upsert({
     *   create: {
     *     // ... data to create a OrdenCompra
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OrdenCompra we want to update
     *   }
     * })
     */
    upsert<T extends OrdenCompraUpsertArgs>(args: SelectSubset<T, OrdenCompraUpsertArgs<ExtArgs>>): Prisma__OrdenCompraClient<$Result.GetResult<Prisma.$OrdenCompraPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of OrdenCompras.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrdenCompraCountArgs} args - Arguments to filter OrdenCompras to count.
     * @example
     * // Count the number of OrdenCompras
     * const count = await prisma.ordenCompra.count({
     *   where: {
     *     // ... the filter for the OrdenCompras we want to count
     *   }
     * })
    **/
    count<T extends OrdenCompraCountArgs>(
      args?: Subset<T, OrdenCompraCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OrdenCompraCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OrdenCompra.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrdenCompraAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends OrdenCompraAggregateArgs>(args: Subset<T, OrdenCompraAggregateArgs>): Prisma.PrismaPromise<GetOrdenCompraAggregateType<T>>

    /**
     * Group by OrdenCompra.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrdenCompraGroupByArgs} args - Group by arguments.
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
      T extends OrdenCompraGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OrdenCompraGroupByArgs['orderBy'] }
        : { orderBy?: OrdenCompraGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, OrdenCompraGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrdenCompraGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OrdenCompra model
   */
  readonly fields: OrdenCompraFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OrdenCompra.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OrdenCompraClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    proveedor<T extends ProveedorDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProveedorDefaultArgs<ExtArgs>>): Prisma__ProveedorClient<$Result.GetResult<Prisma.$ProveedorPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    items<T extends OrdenCompra$itemsArgs<ExtArgs> = {}>(args?: Subset<T, OrdenCompra$itemsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrdenCompraItemPayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the OrdenCompra model
   */ 
  interface OrdenCompraFieldRefs {
    readonly id_orden: FieldRef<"OrdenCompra", 'String'>
    readonly tenant_id: FieldRef<"OrdenCompra", 'String'>
    readonly proyecto_id: FieldRef<"OrdenCompra", 'String'>
    readonly proveedor_id: FieldRef<"OrdenCompra", 'String'>
    readonly codigo: FieldRef<"OrdenCompra", 'String'>
    readonly fecha_emision: FieldRef<"OrdenCompra", 'DateTime'>
    readonly estado: FieldRef<"OrdenCompra", 'String'>
    readonly moneda: FieldRef<"OrdenCompra", 'String'>
    readonly tipo_cambio: FieldRef<"OrdenCompra", 'Decimal'>
    readonly subtotal: FieldRef<"OrdenCompra", 'Decimal'>
    readonly iva: FieldRef<"OrdenCompra", 'Decimal'>
    readonly total: FieldRef<"OrdenCompra", 'Decimal'>
    readonly presupuesto_id: FieldRef<"OrdenCompra", 'String'>
  }
    

  // Custom InputTypes
  /**
   * OrdenCompra findUnique
   */
  export type OrdenCompraFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdenCompra
     */
    select?: OrdenCompraSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrdenCompraInclude<ExtArgs> | null
    /**
     * Filter, which OrdenCompra to fetch.
     */
    where: OrdenCompraWhereUniqueInput
  }

  /**
   * OrdenCompra findUniqueOrThrow
   */
  export type OrdenCompraFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdenCompra
     */
    select?: OrdenCompraSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrdenCompraInclude<ExtArgs> | null
    /**
     * Filter, which OrdenCompra to fetch.
     */
    where: OrdenCompraWhereUniqueInput
  }

  /**
   * OrdenCompra findFirst
   */
  export type OrdenCompraFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdenCompra
     */
    select?: OrdenCompraSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrdenCompraInclude<ExtArgs> | null
    /**
     * Filter, which OrdenCompra to fetch.
     */
    where?: OrdenCompraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrdenCompras to fetch.
     */
    orderBy?: OrdenCompraOrderByWithRelationInput | OrdenCompraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OrdenCompras.
     */
    cursor?: OrdenCompraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrdenCompras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrdenCompras.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OrdenCompras.
     */
    distinct?: OrdenCompraScalarFieldEnum | OrdenCompraScalarFieldEnum[]
  }

  /**
   * OrdenCompra findFirstOrThrow
   */
  export type OrdenCompraFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdenCompra
     */
    select?: OrdenCompraSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrdenCompraInclude<ExtArgs> | null
    /**
     * Filter, which OrdenCompra to fetch.
     */
    where?: OrdenCompraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrdenCompras to fetch.
     */
    orderBy?: OrdenCompraOrderByWithRelationInput | OrdenCompraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OrdenCompras.
     */
    cursor?: OrdenCompraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrdenCompras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrdenCompras.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OrdenCompras.
     */
    distinct?: OrdenCompraScalarFieldEnum | OrdenCompraScalarFieldEnum[]
  }

  /**
   * OrdenCompra findMany
   */
  export type OrdenCompraFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdenCompra
     */
    select?: OrdenCompraSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrdenCompraInclude<ExtArgs> | null
    /**
     * Filter, which OrdenCompras to fetch.
     */
    where?: OrdenCompraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrdenCompras to fetch.
     */
    orderBy?: OrdenCompraOrderByWithRelationInput | OrdenCompraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OrdenCompras.
     */
    cursor?: OrdenCompraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrdenCompras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrdenCompras.
     */
    skip?: number
    distinct?: OrdenCompraScalarFieldEnum | OrdenCompraScalarFieldEnum[]
  }

  /**
   * OrdenCompra create
   */
  export type OrdenCompraCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdenCompra
     */
    select?: OrdenCompraSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrdenCompraInclude<ExtArgs> | null
    /**
     * The data needed to create a OrdenCompra.
     */
    data: XOR<OrdenCompraCreateInput, OrdenCompraUncheckedCreateInput>
  }

  /**
   * OrdenCompra createMany
   */
  export type OrdenCompraCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OrdenCompras.
     */
    data: OrdenCompraCreateManyInput | OrdenCompraCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OrdenCompra createManyAndReturn
   */
  export type OrdenCompraCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdenCompra
     */
    select?: OrdenCompraSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many OrdenCompras.
     */
    data: OrdenCompraCreateManyInput | OrdenCompraCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrdenCompraIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * OrdenCompra update
   */
  export type OrdenCompraUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdenCompra
     */
    select?: OrdenCompraSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrdenCompraInclude<ExtArgs> | null
    /**
     * The data needed to update a OrdenCompra.
     */
    data: XOR<OrdenCompraUpdateInput, OrdenCompraUncheckedUpdateInput>
    /**
     * Choose, which OrdenCompra to update.
     */
    where: OrdenCompraWhereUniqueInput
  }

  /**
   * OrdenCompra updateMany
   */
  export type OrdenCompraUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OrdenCompras.
     */
    data: XOR<OrdenCompraUpdateManyMutationInput, OrdenCompraUncheckedUpdateManyInput>
    /**
     * Filter which OrdenCompras to update
     */
    where?: OrdenCompraWhereInput
  }

  /**
   * OrdenCompra upsert
   */
  export type OrdenCompraUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdenCompra
     */
    select?: OrdenCompraSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrdenCompraInclude<ExtArgs> | null
    /**
     * The filter to search for the OrdenCompra to update in case it exists.
     */
    where: OrdenCompraWhereUniqueInput
    /**
     * In case the OrdenCompra found by the `where` argument doesn't exist, create a new OrdenCompra with this data.
     */
    create: XOR<OrdenCompraCreateInput, OrdenCompraUncheckedCreateInput>
    /**
     * In case the OrdenCompra was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OrdenCompraUpdateInput, OrdenCompraUncheckedUpdateInput>
  }

  /**
   * OrdenCompra delete
   */
  export type OrdenCompraDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdenCompra
     */
    select?: OrdenCompraSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrdenCompraInclude<ExtArgs> | null
    /**
     * Filter which OrdenCompra to delete.
     */
    where: OrdenCompraWhereUniqueInput
  }

  /**
   * OrdenCompra deleteMany
   */
  export type OrdenCompraDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OrdenCompras to delete
     */
    where?: OrdenCompraWhereInput
  }

  /**
   * OrdenCompra.items
   */
  export type OrdenCompra$itemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdenCompraItem
     */
    select?: OrdenCompraItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrdenCompraItemInclude<ExtArgs> | null
    where?: OrdenCompraItemWhereInput
    orderBy?: OrdenCompraItemOrderByWithRelationInput | OrdenCompraItemOrderByWithRelationInput[]
    cursor?: OrdenCompraItemWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OrdenCompraItemScalarFieldEnum | OrdenCompraItemScalarFieldEnum[]
  }

  /**
   * OrdenCompra without action
   */
  export type OrdenCompraDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdenCompra
     */
    select?: OrdenCompraSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrdenCompraInclude<ExtArgs> | null
  }


  /**
   * Model OrdenCompraItem
   */

  export type AggregateOrdenCompraItem = {
    _count: OrdenCompraItemCountAggregateOutputType | null
    _avg: OrdenCompraItemAvgAggregateOutputType | null
    _sum: OrdenCompraItemSumAggregateOutputType | null
    _min: OrdenCompraItemMinAggregateOutputType | null
    _max: OrdenCompraItemMaxAggregateOutputType | null
  }

  export type OrdenCompraItemAvgAggregateOutputType = {
    cantidad: Decimal | null
    precio_unitario: Decimal | null
    importe: Decimal | null
  }

  export type OrdenCompraItemSumAggregateOutputType = {
    cantidad: Decimal | null
    precio_unitario: Decimal | null
    importe: Decimal | null
  }

  export type OrdenCompraItemMinAggregateOutputType = {
    id_item: string | null
    tenant_id: string | null
    proyecto_id: string | null
    orden_id: string | null
    insumo_id: string | null
    cantidad: Decimal | null
    precio_unitario: Decimal | null
    importe: Decimal | null
  }

  export type OrdenCompraItemMaxAggregateOutputType = {
    id_item: string | null
    tenant_id: string | null
    proyecto_id: string | null
    orden_id: string | null
    insumo_id: string | null
    cantidad: Decimal | null
    precio_unitario: Decimal | null
    importe: Decimal | null
  }

  export type OrdenCompraItemCountAggregateOutputType = {
    id_item: number
    tenant_id: number
    proyecto_id: number
    orden_id: number
    insumo_id: number
    cantidad: number
    precio_unitario: number
    importe: number
    _all: number
  }


  export type OrdenCompraItemAvgAggregateInputType = {
    cantidad?: true
    precio_unitario?: true
    importe?: true
  }

  export type OrdenCompraItemSumAggregateInputType = {
    cantidad?: true
    precio_unitario?: true
    importe?: true
  }

  export type OrdenCompraItemMinAggregateInputType = {
    id_item?: true
    tenant_id?: true
    proyecto_id?: true
    orden_id?: true
    insumo_id?: true
    cantidad?: true
    precio_unitario?: true
    importe?: true
  }

  export type OrdenCompraItemMaxAggregateInputType = {
    id_item?: true
    tenant_id?: true
    proyecto_id?: true
    orden_id?: true
    insumo_id?: true
    cantidad?: true
    precio_unitario?: true
    importe?: true
  }

  export type OrdenCompraItemCountAggregateInputType = {
    id_item?: true
    tenant_id?: true
    proyecto_id?: true
    orden_id?: true
    insumo_id?: true
    cantidad?: true
    precio_unitario?: true
    importe?: true
    _all?: true
  }

  export type OrdenCompraItemAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OrdenCompraItem to aggregate.
     */
    where?: OrdenCompraItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrdenCompraItems to fetch.
     */
    orderBy?: OrdenCompraItemOrderByWithRelationInput | OrdenCompraItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OrdenCompraItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrdenCompraItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrdenCompraItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OrdenCompraItems
    **/
    _count?: true | OrdenCompraItemCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OrdenCompraItemAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OrdenCompraItemSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OrdenCompraItemMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OrdenCompraItemMaxAggregateInputType
  }

  export type GetOrdenCompraItemAggregateType<T extends OrdenCompraItemAggregateArgs> = {
        [P in keyof T & keyof AggregateOrdenCompraItem]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOrdenCompraItem[P]>
      : GetScalarType<T[P], AggregateOrdenCompraItem[P]>
  }




  export type OrdenCompraItemGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrdenCompraItemWhereInput
    orderBy?: OrdenCompraItemOrderByWithAggregationInput | OrdenCompraItemOrderByWithAggregationInput[]
    by: OrdenCompraItemScalarFieldEnum[] | OrdenCompraItemScalarFieldEnum
    having?: OrdenCompraItemScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OrdenCompraItemCountAggregateInputType | true
    _avg?: OrdenCompraItemAvgAggregateInputType
    _sum?: OrdenCompraItemSumAggregateInputType
    _min?: OrdenCompraItemMinAggregateInputType
    _max?: OrdenCompraItemMaxAggregateInputType
  }

  export type OrdenCompraItemGroupByOutputType = {
    id_item: string
    tenant_id: string
    proyecto_id: string
    orden_id: string
    insumo_id: string
    cantidad: Decimal
    precio_unitario: Decimal
    importe: Decimal
    _count: OrdenCompraItemCountAggregateOutputType | null
    _avg: OrdenCompraItemAvgAggregateOutputType | null
    _sum: OrdenCompraItemSumAggregateOutputType | null
    _min: OrdenCompraItemMinAggregateOutputType | null
    _max: OrdenCompraItemMaxAggregateOutputType | null
  }

  type GetOrdenCompraItemGroupByPayload<T extends OrdenCompraItemGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OrdenCompraItemGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OrdenCompraItemGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OrdenCompraItemGroupByOutputType[P]>
            : GetScalarType<T[P], OrdenCompraItemGroupByOutputType[P]>
        }
      >
    >


  export type OrdenCompraItemSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_item?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    orden_id?: boolean
    insumo_id?: boolean
    cantidad?: boolean
    precio_unitario?: boolean
    importe?: boolean
    orden?: boolean | OrdenCompraDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ordenCompraItem"]>

  export type OrdenCompraItemSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_item?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    orden_id?: boolean
    insumo_id?: boolean
    cantidad?: boolean
    precio_unitario?: boolean
    importe?: boolean
    orden?: boolean | OrdenCompraDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ordenCompraItem"]>

  export type OrdenCompraItemSelectScalar = {
    id_item?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    orden_id?: boolean
    insumo_id?: boolean
    cantidad?: boolean
    precio_unitario?: boolean
    importe?: boolean
  }

  export type OrdenCompraItemInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    orden?: boolean | OrdenCompraDefaultArgs<ExtArgs>
  }
  export type OrdenCompraItemIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    orden?: boolean | OrdenCompraDefaultArgs<ExtArgs>
  }

  export type $OrdenCompraItemPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OrdenCompraItem"
    objects: {
      orden: Prisma.$OrdenCompraPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id_item: string
      tenant_id: string
      proyecto_id: string
      orden_id: string
      insumo_id: string
      cantidad: Prisma.Decimal
      precio_unitario: Prisma.Decimal
      importe: Prisma.Decimal
    }, ExtArgs["result"]["ordenCompraItem"]>
    composites: {}
  }

  type OrdenCompraItemGetPayload<S extends boolean | null | undefined | OrdenCompraItemDefaultArgs> = $Result.GetResult<Prisma.$OrdenCompraItemPayload, S>

  type OrdenCompraItemCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<OrdenCompraItemFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: OrdenCompraItemCountAggregateInputType | true
    }

  export interface OrdenCompraItemDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OrdenCompraItem'], meta: { name: 'OrdenCompraItem' } }
    /**
     * Find zero or one OrdenCompraItem that matches the filter.
     * @param {OrdenCompraItemFindUniqueArgs} args - Arguments to find a OrdenCompraItem
     * @example
     * // Get one OrdenCompraItem
     * const ordenCompraItem = await prisma.ordenCompraItem.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OrdenCompraItemFindUniqueArgs>(args: SelectSubset<T, OrdenCompraItemFindUniqueArgs<ExtArgs>>): Prisma__OrdenCompraItemClient<$Result.GetResult<Prisma.$OrdenCompraItemPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one OrdenCompraItem that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {OrdenCompraItemFindUniqueOrThrowArgs} args - Arguments to find a OrdenCompraItem
     * @example
     * // Get one OrdenCompraItem
     * const ordenCompraItem = await prisma.ordenCompraItem.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OrdenCompraItemFindUniqueOrThrowArgs>(args: SelectSubset<T, OrdenCompraItemFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OrdenCompraItemClient<$Result.GetResult<Prisma.$OrdenCompraItemPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first OrdenCompraItem that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrdenCompraItemFindFirstArgs} args - Arguments to find a OrdenCompraItem
     * @example
     * // Get one OrdenCompraItem
     * const ordenCompraItem = await prisma.ordenCompraItem.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OrdenCompraItemFindFirstArgs>(args?: SelectSubset<T, OrdenCompraItemFindFirstArgs<ExtArgs>>): Prisma__OrdenCompraItemClient<$Result.GetResult<Prisma.$OrdenCompraItemPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first OrdenCompraItem that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrdenCompraItemFindFirstOrThrowArgs} args - Arguments to find a OrdenCompraItem
     * @example
     * // Get one OrdenCompraItem
     * const ordenCompraItem = await prisma.ordenCompraItem.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OrdenCompraItemFindFirstOrThrowArgs>(args?: SelectSubset<T, OrdenCompraItemFindFirstOrThrowArgs<ExtArgs>>): Prisma__OrdenCompraItemClient<$Result.GetResult<Prisma.$OrdenCompraItemPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more OrdenCompraItems that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrdenCompraItemFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OrdenCompraItems
     * const ordenCompraItems = await prisma.ordenCompraItem.findMany()
     * 
     * // Get first 10 OrdenCompraItems
     * const ordenCompraItems = await prisma.ordenCompraItem.findMany({ take: 10 })
     * 
     * // Only select the `id_item`
     * const ordenCompraItemWithId_itemOnly = await prisma.ordenCompraItem.findMany({ select: { id_item: true } })
     * 
     */
    findMany<T extends OrdenCompraItemFindManyArgs>(args?: SelectSubset<T, OrdenCompraItemFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrdenCompraItemPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a OrdenCompraItem.
     * @param {OrdenCompraItemCreateArgs} args - Arguments to create a OrdenCompraItem.
     * @example
     * // Create one OrdenCompraItem
     * const OrdenCompraItem = await prisma.ordenCompraItem.create({
     *   data: {
     *     // ... data to create a OrdenCompraItem
     *   }
     * })
     * 
     */
    create<T extends OrdenCompraItemCreateArgs>(args: SelectSubset<T, OrdenCompraItemCreateArgs<ExtArgs>>): Prisma__OrdenCompraItemClient<$Result.GetResult<Prisma.$OrdenCompraItemPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many OrdenCompraItems.
     * @param {OrdenCompraItemCreateManyArgs} args - Arguments to create many OrdenCompraItems.
     * @example
     * // Create many OrdenCompraItems
     * const ordenCompraItem = await prisma.ordenCompraItem.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OrdenCompraItemCreateManyArgs>(args?: SelectSubset<T, OrdenCompraItemCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many OrdenCompraItems and returns the data saved in the database.
     * @param {OrdenCompraItemCreateManyAndReturnArgs} args - Arguments to create many OrdenCompraItems.
     * @example
     * // Create many OrdenCompraItems
     * const ordenCompraItem = await prisma.ordenCompraItem.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many OrdenCompraItems and only return the `id_item`
     * const ordenCompraItemWithId_itemOnly = await prisma.ordenCompraItem.createManyAndReturn({ 
     *   select: { id_item: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OrdenCompraItemCreateManyAndReturnArgs>(args?: SelectSubset<T, OrdenCompraItemCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrdenCompraItemPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a OrdenCompraItem.
     * @param {OrdenCompraItemDeleteArgs} args - Arguments to delete one OrdenCompraItem.
     * @example
     * // Delete one OrdenCompraItem
     * const OrdenCompraItem = await prisma.ordenCompraItem.delete({
     *   where: {
     *     // ... filter to delete one OrdenCompraItem
     *   }
     * })
     * 
     */
    delete<T extends OrdenCompraItemDeleteArgs>(args: SelectSubset<T, OrdenCompraItemDeleteArgs<ExtArgs>>): Prisma__OrdenCompraItemClient<$Result.GetResult<Prisma.$OrdenCompraItemPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one OrdenCompraItem.
     * @param {OrdenCompraItemUpdateArgs} args - Arguments to update one OrdenCompraItem.
     * @example
     * // Update one OrdenCompraItem
     * const ordenCompraItem = await prisma.ordenCompraItem.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OrdenCompraItemUpdateArgs>(args: SelectSubset<T, OrdenCompraItemUpdateArgs<ExtArgs>>): Prisma__OrdenCompraItemClient<$Result.GetResult<Prisma.$OrdenCompraItemPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more OrdenCompraItems.
     * @param {OrdenCompraItemDeleteManyArgs} args - Arguments to filter OrdenCompraItems to delete.
     * @example
     * // Delete a few OrdenCompraItems
     * const { count } = await prisma.ordenCompraItem.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OrdenCompraItemDeleteManyArgs>(args?: SelectSubset<T, OrdenCompraItemDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OrdenCompraItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrdenCompraItemUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OrdenCompraItems
     * const ordenCompraItem = await prisma.ordenCompraItem.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OrdenCompraItemUpdateManyArgs>(args: SelectSubset<T, OrdenCompraItemUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one OrdenCompraItem.
     * @param {OrdenCompraItemUpsertArgs} args - Arguments to update or create a OrdenCompraItem.
     * @example
     * // Update or create a OrdenCompraItem
     * const ordenCompraItem = await prisma.ordenCompraItem.upsert({
     *   create: {
     *     // ... data to create a OrdenCompraItem
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OrdenCompraItem we want to update
     *   }
     * })
     */
    upsert<T extends OrdenCompraItemUpsertArgs>(args: SelectSubset<T, OrdenCompraItemUpsertArgs<ExtArgs>>): Prisma__OrdenCompraItemClient<$Result.GetResult<Prisma.$OrdenCompraItemPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of OrdenCompraItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrdenCompraItemCountArgs} args - Arguments to filter OrdenCompraItems to count.
     * @example
     * // Count the number of OrdenCompraItems
     * const count = await prisma.ordenCompraItem.count({
     *   where: {
     *     // ... the filter for the OrdenCompraItems we want to count
     *   }
     * })
    **/
    count<T extends OrdenCompraItemCountArgs>(
      args?: Subset<T, OrdenCompraItemCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OrdenCompraItemCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OrdenCompraItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrdenCompraItemAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends OrdenCompraItemAggregateArgs>(args: Subset<T, OrdenCompraItemAggregateArgs>): Prisma.PrismaPromise<GetOrdenCompraItemAggregateType<T>>

    /**
     * Group by OrdenCompraItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrdenCompraItemGroupByArgs} args - Group by arguments.
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
      T extends OrdenCompraItemGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OrdenCompraItemGroupByArgs['orderBy'] }
        : { orderBy?: OrdenCompraItemGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, OrdenCompraItemGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrdenCompraItemGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OrdenCompraItem model
   */
  readonly fields: OrdenCompraItemFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OrdenCompraItem.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OrdenCompraItemClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    orden<T extends OrdenCompraDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrdenCompraDefaultArgs<ExtArgs>>): Prisma__OrdenCompraClient<$Result.GetResult<Prisma.$OrdenCompraPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
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
   * Fields of the OrdenCompraItem model
   */ 
  interface OrdenCompraItemFieldRefs {
    readonly id_item: FieldRef<"OrdenCompraItem", 'String'>
    readonly tenant_id: FieldRef<"OrdenCompraItem", 'String'>
    readonly proyecto_id: FieldRef<"OrdenCompraItem", 'String'>
    readonly orden_id: FieldRef<"OrdenCompraItem", 'String'>
    readonly insumo_id: FieldRef<"OrdenCompraItem", 'String'>
    readonly cantidad: FieldRef<"OrdenCompraItem", 'Decimal'>
    readonly precio_unitario: FieldRef<"OrdenCompraItem", 'Decimal'>
    readonly importe: FieldRef<"OrdenCompraItem", 'Decimal'>
  }
    

  // Custom InputTypes
  /**
   * OrdenCompraItem findUnique
   */
  export type OrdenCompraItemFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdenCompraItem
     */
    select?: OrdenCompraItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrdenCompraItemInclude<ExtArgs> | null
    /**
     * Filter, which OrdenCompraItem to fetch.
     */
    where: OrdenCompraItemWhereUniqueInput
  }

  /**
   * OrdenCompraItem findUniqueOrThrow
   */
  export type OrdenCompraItemFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdenCompraItem
     */
    select?: OrdenCompraItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrdenCompraItemInclude<ExtArgs> | null
    /**
     * Filter, which OrdenCompraItem to fetch.
     */
    where: OrdenCompraItemWhereUniqueInput
  }

  /**
   * OrdenCompraItem findFirst
   */
  export type OrdenCompraItemFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdenCompraItem
     */
    select?: OrdenCompraItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrdenCompraItemInclude<ExtArgs> | null
    /**
     * Filter, which OrdenCompraItem to fetch.
     */
    where?: OrdenCompraItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrdenCompraItems to fetch.
     */
    orderBy?: OrdenCompraItemOrderByWithRelationInput | OrdenCompraItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OrdenCompraItems.
     */
    cursor?: OrdenCompraItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrdenCompraItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrdenCompraItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OrdenCompraItems.
     */
    distinct?: OrdenCompraItemScalarFieldEnum | OrdenCompraItemScalarFieldEnum[]
  }

  /**
   * OrdenCompraItem findFirstOrThrow
   */
  export type OrdenCompraItemFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdenCompraItem
     */
    select?: OrdenCompraItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrdenCompraItemInclude<ExtArgs> | null
    /**
     * Filter, which OrdenCompraItem to fetch.
     */
    where?: OrdenCompraItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrdenCompraItems to fetch.
     */
    orderBy?: OrdenCompraItemOrderByWithRelationInput | OrdenCompraItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OrdenCompraItems.
     */
    cursor?: OrdenCompraItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrdenCompraItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrdenCompraItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OrdenCompraItems.
     */
    distinct?: OrdenCompraItemScalarFieldEnum | OrdenCompraItemScalarFieldEnum[]
  }

  /**
   * OrdenCompraItem findMany
   */
  export type OrdenCompraItemFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdenCompraItem
     */
    select?: OrdenCompraItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrdenCompraItemInclude<ExtArgs> | null
    /**
     * Filter, which OrdenCompraItems to fetch.
     */
    where?: OrdenCompraItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrdenCompraItems to fetch.
     */
    orderBy?: OrdenCompraItemOrderByWithRelationInput | OrdenCompraItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OrdenCompraItems.
     */
    cursor?: OrdenCompraItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrdenCompraItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrdenCompraItems.
     */
    skip?: number
    distinct?: OrdenCompraItemScalarFieldEnum | OrdenCompraItemScalarFieldEnum[]
  }

  /**
   * OrdenCompraItem create
   */
  export type OrdenCompraItemCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdenCompraItem
     */
    select?: OrdenCompraItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrdenCompraItemInclude<ExtArgs> | null
    /**
     * The data needed to create a OrdenCompraItem.
     */
    data: XOR<OrdenCompraItemCreateInput, OrdenCompraItemUncheckedCreateInput>
  }

  /**
   * OrdenCompraItem createMany
   */
  export type OrdenCompraItemCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OrdenCompraItems.
     */
    data: OrdenCompraItemCreateManyInput | OrdenCompraItemCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OrdenCompraItem createManyAndReturn
   */
  export type OrdenCompraItemCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdenCompraItem
     */
    select?: OrdenCompraItemSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many OrdenCompraItems.
     */
    data: OrdenCompraItemCreateManyInput | OrdenCompraItemCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrdenCompraItemIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * OrdenCompraItem update
   */
  export type OrdenCompraItemUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdenCompraItem
     */
    select?: OrdenCompraItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrdenCompraItemInclude<ExtArgs> | null
    /**
     * The data needed to update a OrdenCompraItem.
     */
    data: XOR<OrdenCompraItemUpdateInput, OrdenCompraItemUncheckedUpdateInput>
    /**
     * Choose, which OrdenCompraItem to update.
     */
    where: OrdenCompraItemWhereUniqueInput
  }

  /**
   * OrdenCompraItem updateMany
   */
  export type OrdenCompraItemUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OrdenCompraItems.
     */
    data: XOR<OrdenCompraItemUpdateManyMutationInput, OrdenCompraItemUncheckedUpdateManyInput>
    /**
     * Filter which OrdenCompraItems to update
     */
    where?: OrdenCompraItemWhereInput
  }

  /**
   * OrdenCompraItem upsert
   */
  export type OrdenCompraItemUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdenCompraItem
     */
    select?: OrdenCompraItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrdenCompraItemInclude<ExtArgs> | null
    /**
     * The filter to search for the OrdenCompraItem to update in case it exists.
     */
    where: OrdenCompraItemWhereUniqueInput
    /**
     * In case the OrdenCompraItem found by the `where` argument doesn't exist, create a new OrdenCompraItem with this data.
     */
    create: XOR<OrdenCompraItemCreateInput, OrdenCompraItemUncheckedCreateInput>
    /**
     * In case the OrdenCompraItem was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OrdenCompraItemUpdateInput, OrdenCompraItemUncheckedUpdateInput>
  }

  /**
   * OrdenCompraItem delete
   */
  export type OrdenCompraItemDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdenCompraItem
     */
    select?: OrdenCompraItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrdenCompraItemInclude<ExtArgs> | null
    /**
     * Filter which OrdenCompraItem to delete.
     */
    where: OrdenCompraItemWhereUniqueInput
  }

  /**
   * OrdenCompraItem deleteMany
   */
  export type OrdenCompraItemDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OrdenCompraItems to delete
     */
    where?: OrdenCompraItemWhereInput
  }

  /**
   * OrdenCompraItem without action
   */
  export type OrdenCompraItemDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdenCompraItem
     */
    select?: OrdenCompraItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrdenCompraItemInclude<ExtArgs> | null
  }


  /**
   * Model CuadroComparativo
   */

  export type AggregateCuadroComparativo = {
    _count: CuadroComparativoCountAggregateOutputType | null
    _min: CuadroComparativoMinAggregateOutputType | null
    _max: CuadroComparativoMaxAggregateOutputType | null
  }

  export type CuadroComparativoMinAggregateOutputType = {
    id_cuadro: string | null
    tenant_id: string | null
    proyecto_id: string | null
    requisicion_id: string | null
    codigo: string | null
    fecha_creacion: Date | null
    estado: string | null
    notas: string | null
  }

  export type CuadroComparativoMaxAggregateOutputType = {
    id_cuadro: string | null
    tenant_id: string | null
    proyecto_id: string | null
    requisicion_id: string | null
    codigo: string | null
    fecha_creacion: Date | null
    estado: string | null
    notas: string | null
  }

  export type CuadroComparativoCountAggregateOutputType = {
    id_cuadro: number
    tenant_id: number
    proyecto_id: number
    requisicion_id: number
    codigo: number
    fecha_creacion: number
    estado: number
    notas: number
    _all: number
  }


  export type CuadroComparativoMinAggregateInputType = {
    id_cuadro?: true
    tenant_id?: true
    proyecto_id?: true
    requisicion_id?: true
    codigo?: true
    fecha_creacion?: true
    estado?: true
    notas?: true
  }

  export type CuadroComparativoMaxAggregateInputType = {
    id_cuadro?: true
    tenant_id?: true
    proyecto_id?: true
    requisicion_id?: true
    codigo?: true
    fecha_creacion?: true
    estado?: true
    notas?: true
  }

  export type CuadroComparativoCountAggregateInputType = {
    id_cuadro?: true
    tenant_id?: true
    proyecto_id?: true
    requisicion_id?: true
    codigo?: true
    fecha_creacion?: true
    estado?: true
    notas?: true
    _all?: true
  }

  export type CuadroComparativoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CuadroComparativo to aggregate.
     */
    where?: CuadroComparativoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CuadroComparativos to fetch.
     */
    orderBy?: CuadroComparativoOrderByWithRelationInput | CuadroComparativoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CuadroComparativoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CuadroComparativos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CuadroComparativos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CuadroComparativos
    **/
    _count?: true | CuadroComparativoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CuadroComparativoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CuadroComparativoMaxAggregateInputType
  }

  export type GetCuadroComparativoAggregateType<T extends CuadroComparativoAggregateArgs> = {
        [P in keyof T & keyof AggregateCuadroComparativo]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCuadroComparativo[P]>
      : GetScalarType<T[P], AggregateCuadroComparativo[P]>
  }




  export type CuadroComparativoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CuadroComparativoWhereInput
    orderBy?: CuadroComparativoOrderByWithAggregationInput | CuadroComparativoOrderByWithAggregationInput[]
    by: CuadroComparativoScalarFieldEnum[] | CuadroComparativoScalarFieldEnum
    having?: CuadroComparativoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CuadroComparativoCountAggregateInputType | true
    _min?: CuadroComparativoMinAggregateInputType
    _max?: CuadroComparativoMaxAggregateInputType
  }

  export type CuadroComparativoGroupByOutputType = {
    id_cuadro: string
    tenant_id: string
    proyecto_id: string
    requisicion_id: string
    codigo: string
    fecha_creacion: Date
    estado: string
    notas: string | null
    _count: CuadroComparativoCountAggregateOutputType | null
    _min: CuadroComparativoMinAggregateOutputType | null
    _max: CuadroComparativoMaxAggregateOutputType | null
  }

  type GetCuadroComparativoGroupByPayload<T extends CuadroComparativoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CuadroComparativoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CuadroComparativoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CuadroComparativoGroupByOutputType[P]>
            : GetScalarType<T[P], CuadroComparativoGroupByOutputType[P]>
        }
      >
    >


  export type CuadroComparativoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_cuadro?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    requisicion_id?: boolean
    codigo?: boolean
    fecha_creacion?: boolean
    estado?: boolean
    notas?: boolean
    detalles?: boolean | CuadroComparativo$detallesArgs<ExtArgs>
    _count?: boolean | CuadroComparativoCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cuadroComparativo"]>

  export type CuadroComparativoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_cuadro?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    requisicion_id?: boolean
    codigo?: boolean
    fecha_creacion?: boolean
    estado?: boolean
    notas?: boolean
  }, ExtArgs["result"]["cuadroComparativo"]>

  export type CuadroComparativoSelectScalar = {
    id_cuadro?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    requisicion_id?: boolean
    codigo?: boolean
    fecha_creacion?: boolean
    estado?: boolean
    notas?: boolean
  }

  export type CuadroComparativoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    detalles?: boolean | CuadroComparativo$detallesArgs<ExtArgs>
    _count?: boolean | CuadroComparativoCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CuadroComparativoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $CuadroComparativoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CuadroComparativo"
    objects: {
      detalles: Prisma.$ComparativaDetallePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id_cuadro: string
      tenant_id: string
      proyecto_id: string
      requisicion_id: string
      codigo: string
      fecha_creacion: Date
      estado: string
      notas: string | null
    }, ExtArgs["result"]["cuadroComparativo"]>
    composites: {}
  }

  type CuadroComparativoGetPayload<S extends boolean | null | undefined | CuadroComparativoDefaultArgs> = $Result.GetResult<Prisma.$CuadroComparativoPayload, S>

  type CuadroComparativoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CuadroComparativoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CuadroComparativoCountAggregateInputType | true
    }

  export interface CuadroComparativoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CuadroComparativo'], meta: { name: 'CuadroComparativo' } }
    /**
     * Find zero or one CuadroComparativo that matches the filter.
     * @param {CuadroComparativoFindUniqueArgs} args - Arguments to find a CuadroComparativo
     * @example
     * // Get one CuadroComparativo
     * const cuadroComparativo = await prisma.cuadroComparativo.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CuadroComparativoFindUniqueArgs>(args: SelectSubset<T, CuadroComparativoFindUniqueArgs<ExtArgs>>): Prisma__CuadroComparativoClient<$Result.GetResult<Prisma.$CuadroComparativoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one CuadroComparativo that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CuadroComparativoFindUniqueOrThrowArgs} args - Arguments to find a CuadroComparativo
     * @example
     * // Get one CuadroComparativo
     * const cuadroComparativo = await prisma.cuadroComparativo.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CuadroComparativoFindUniqueOrThrowArgs>(args: SelectSubset<T, CuadroComparativoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CuadroComparativoClient<$Result.GetResult<Prisma.$CuadroComparativoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first CuadroComparativo that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CuadroComparativoFindFirstArgs} args - Arguments to find a CuadroComparativo
     * @example
     * // Get one CuadroComparativo
     * const cuadroComparativo = await prisma.cuadroComparativo.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CuadroComparativoFindFirstArgs>(args?: SelectSubset<T, CuadroComparativoFindFirstArgs<ExtArgs>>): Prisma__CuadroComparativoClient<$Result.GetResult<Prisma.$CuadroComparativoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first CuadroComparativo that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CuadroComparativoFindFirstOrThrowArgs} args - Arguments to find a CuadroComparativo
     * @example
     * // Get one CuadroComparativo
     * const cuadroComparativo = await prisma.cuadroComparativo.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CuadroComparativoFindFirstOrThrowArgs>(args?: SelectSubset<T, CuadroComparativoFindFirstOrThrowArgs<ExtArgs>>): Prisma__CuadroComparativoClient<$Result.GetResult<Prisma.$CuadroComparativoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more CuadroComparativos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CuadroComparativoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CuadroComparativos
     * const cuadroComparativos = await prisma.cuadroComparativo.findMany()
     * 
     * // Get first 10 CuadroComparativos
     * const cuadroComparativos = await prisma.cuadroComparativo.findMany({ take: 10 })
     * 
     * // Only select the `id_cuadro`
     * const cuadroComparativoWithId_cuadroOnly = await prisma.cuadroComparativo.findMany({ select: { id_cuadro: true } })
     * 
     */
    findMany<T extends CuadroComparativoFindManyArgs>(args?: SelectSubset<T, CuadroComparativoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CuadroComparativoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a CuadroComparativo.
     * @param {CuadroComparativoCreateArgs} args - Arguments to create a CuadroComparativo.
     * @example
     * // Create one CuadroComparativo
     * const CuadroComparativo = await prisma.cuadroComparativo.create({
     *   data: {
     *     // ... data to create a CuadroComparativo
     *   }
     * })
     * 
     */
    create<T extends CuadroComparativoCreateArgs>(args: SelectSubset<T, CuadroComparativoCreateArgs<ExtArgs>>): Prisma__CuadroComparativoClient<$Result.GetResult<Prisma.$CuadroComparativoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many CuadroComparativos.
     * @param {CuadroComparativoCreateManyArgs} args - Arguments to create many CuadroComparativos.
     * @example
     * // Create many CuadroComparativos
     * const cuadroComparativo = await prisma.cuadroComparativo.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CuadroComparativoCreateManyArgs>(args?: SelectSubset<T, CuadroComparativoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CuadroComparativos and returns the data saved in the database.
     * @param {CuadroComparativoCreateManyAndReturnArgs} args - Arguments to create many CuadroComparativos.
     * @example
     * // Create many CuadroComparativos
     * const cuadroComparativo = await prisma.cuadroComparativo.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CuadroComparativos and only return the `id_cuadro`
     * const cuadroComparativoWithId_cuadroOnly = await prisma.cuadroComparativo.createManyAndReturn({ 
     *   select: { id_cuadro: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CuadroComparativoCreateManyAndReturnArgs>(args?: SelectSubset<T, CuadroComparativoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CuadroComparativoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a CuadroComparativo.
     * @param {CuadroComparativoDeleteArgs} args - Arguments to delete one CuadroComparativo.
     * @example
     * // Delete one CuadroComparativo
     * const CuadroComparativo = await prisma.cuadroComparativo.delete({
     *   where: {
     *     // ... filter to delete one CuadroComparativo
     *   }
     * })
     * 
     */
    delete<T extends CuadroComparativoDeleteArgs>(args: SelectSubset<T, CuadroComparativoDeleteArgs<ExtArgs>>): Prisma__CuadroComparativoClient<$Result.GetResult<Prisma.$CuadroComparativoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one CuadroComparativo.
     * @param {CuadroComparativoUpdateArgs} args - Arguments to update one CuadroComparativo.
     * @example
     * // Update one CuadroComparativo
     * const cuadroComparativo = await prisma.cuadroComparativo.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CuadroComparativoUpdateArgs>(args: SelectSubset<T, CuadroComparativoUpdateArgs<ExtArgs>>): Prisma__CuadroComparativoClient<$Result.GetResult<Prisma.$CuadroComparativoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more CuadroComparativos.
     * @param {CuadroComparativoDeleteManyArgs} args - Arguments to filter CuadroComparativos to delete.
     * @example
     * // Delete a few CuadroComparativos
     * const { count } = await prisma.cuadroComparativo.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CuadroComparativoDeleteManyArgs>(args?: SelectSubset<T, CuadroComparativoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CuadroComparativos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CuadroComparativoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CuadroComparativos
     * const cuadroComparativo = await prisma.cuadroComparativo.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CuadroComparativoUpdateManyArgs>(args: SelectSubset<T, CuadroComparativoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one CuadroComparativo.
     * @param {CuadroComparativoUpsertArgs} args - Arguments to update or create a CuadroComparativo.
     * @example
     * // Update or create a CuadroComparativo
     * const cuadroComparativo = await prisma.cuadroComparativo.upsert({
     *   create: {
     *     // ... data to create a CuadroComparativo
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CuadroComparativo we want to update
     *   }
     * })
     */
    upsert<T extends CuadroComparativoUpsertArgs>(args: SelectSubset<T, CuadroComparativoUpsertArgs<ExtArgs>>): Prisma__CuadroComparativoClient<$Result.GetResult<Prisma.$CuadroComparativoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of CuadroComparativos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CuadroComparativoCountArgs} args - Arguments to filter CuadroComparativos to count.
     * @example
     * // Count the number of CuadroComparativos
     * const count = await prisma.cuadroComparativo.count({
     *   where: {
     *     // ... the filter for the CuadroComparativos we want to count
     *   }
     * })
    **/
    count<T extends CuadroComparativoCountArgs>(
      args?: Subset<T, CuadroComparativoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CuadroComparativoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CuadroComparativo.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CuadroComparativoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends CuadroComparativoAggregateArgs>(args: Subset<T, CuadroComparativoAggregateArgs>): Prisma.PrismaPromise<GetCuadroComparativoAggregateType<T>>

    /**
     * Group by CuadroComparativo.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CuadroComparativoGroupByArgs} args - Group by arguments.
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
      T extends CuadroComparativoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CuadroComparativoGroupByArgs['orderBy'] }
        : { orderBy?: CuadroComparativoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, CuadroComparativoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCuadroComparativoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CuadroComparativo model
   */
  readonly fields: CuadroComparativoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CuadroComparativo.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CuadroComparativoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    detalles<T extends CuadroComparativo$detallesArgs<ExtArgs> = {}>(args?: Subset<T, CuadroComparativo$detallesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ComparativaDetallePayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the CuadroComparativo model
   */ 
  interface CuadroComparativoFieldRefs {
    readonly id_cuadro: FieldRef<"CuadroComparativo", 'String'>
    readonly tenant_id: FieldRef<"CuadroComparativo", 'String'>
    readonly proyecto_id: FieldRef<"CuadroComparativo", 'String'>
    readonly requisicion_id: FieldRef<"CuadroComparativo", 'String'>
    readonly codigo: FieldRef<"CuadroComparativo", 'String'>
    readonly fecha_creacion: FieldRef<"CuadroComparativo", 'DateTime'>
    readonly estado: FieldRef<"CuadroComparativo", 'String'>
    readonly notas: FieldRef<"CuadroComparativo", 'String'>
  }
    

  // Custom InputTypes
  /**
   * CuadroComparativo findUnique
   */
  export type CuadroComparativoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CuadroComparativo
     */
    select?: CuadroComparativoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CuadroComparativoInclude<ExtArgs> | null
    /**
     * Filter, which CuadroComparativo to fetch.
     */
    where: CuadroComparativoWhereUniqueInput
  }

  /**
   * CuadroComparativo findUniqueOrThrow
   */
  export type CuadroComparativoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CuadroComparativo
     */
    select?: CuadroComparativoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CuadroComparativoInclude<ExtArgs> | null
    /**
     * Filter, which CuadroComparativo to fetch.
     */
    where: CuadroComparativoWhereUniqueInput
  }

  /**
   * CuadroComparativo findFirst
   */
  export type CuadroComparativoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CuadroComparativo
     */
    select?: CuadroComparativoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CuadroComparativoInclude<ExtArgs> | null
    /**
     * Filter, which CuadroComparativo to fetch.
     */
    where?: CuadroComparativoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CuadroComparativos to fetch.
     */
    orderBy?: CuadroComparativoOrderByWithRelationInput | CuadroComparativoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CuadroComparativos.
     */
    cursor?: CuadroComparativoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CuadroComparativos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CuadroComparativos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CuadroComparativos.
     */
    distinct?: CuadroComparativoScalarFieldEnum | CuadroComparativoScalarFieldEnum[]
  }

  /**
   * CuadroComparativo findFirstOrThrow
   */
  export type CuadroComparativoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CuadroComparativo
     */
    select?: CuadroComparativoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CuadroComparativoInclude<ExtArgs> | null
    /**
     * Filter, which CuadroComparativo to fetch.
     */
    where?: CuadroComparativoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CuadroComparativos to fetch.
     */
    orderBy?: CuadroComparativoOrderByWithRelationInput | CuadroComparativoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CuadroComparativos.
     */
    cursor?: CuadroComparativoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CuadroComparativos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CuadroComparativos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CuadroComparativos.
     */
    distinct?: CuadroComparativoScalarFieldEnum | CuadroComparativoScalarFieldEnum[]
  }

  /**
   * CuadroComparativo findMany
   */
  export type CuadroComparativoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CuadroComparativo
     */
    select?: CuadroComparativoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CuadroComparativoInclude<ExtArgs> | null
    /**
     * Filter, which CuadroComparativos to fetch.
     */
    where?: CuadroComparativoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CuadroComparativos to fetch.
     */
    orderBy?: CuadroComparativoOrderByWithRelationInput | CuadroComparativoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CuadroComparativos.
     */
    cursor?: CuadroComparativoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CuadroComparativos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CuadroComparativos.
     */
    skip?: number
    distinct?: CuadroComparativoScalarFieldEnum | CuadroComparativoScalarFieldEnum[]
  }

  /**
   * CuadroComparativo create
   */
  export type CuadroComparativoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CuadroComparativo
     */
    select?: CuadroComparativoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CuadroComparativoInclude<ExtArgs> | null
    /**
     * The data needed to create a CuadroComparativo.
     */
    data: XOR<CuadroComparativoCreateInput, CuadroComparativoUncheckedCreateInput>
  }

  /**
   * CuadroComparativo createMany
   */
  export type CuadroComparativoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CuadroComparativos.
     */
    data: CuadroComparativoCreateManyInput | CuadroComparativoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CuadroComparativo createManyAndReturn
   */
  export type CuadroComparativoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CuadroComparativo
     */
    select?: CuadroComparativoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many CuadroComparativos.
     */
    data: CuadroComparativoCreateManyInput | CuadroComparativoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CuadroComparativo update
   */
  export type CuadroComparativoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CuadroComparativo
     */
    select?: CuadroComparativoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CuadroComparativoInclude<ExtArgs> | null
    /**
     * The data needed to update a CuadroComparativo.
     */
    data: XOR<CuadroComparativoUpdateInput, CuadroComparativoUncheckedUpdateInput>
    /**
     * Choose, which CuadroComparativo to update.
     */
    where: CuadroComparativoWhereUniqueInput
  }

  /**
   * CuadroComparativo updateMany
   */
  export type CuadroComparativoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CuadroComparativos.
     */
    data: XOR<CuadroComparativoUpdateManyMutationInput, CuadroComparativoUncheckedUpdateManyInput>
    /**
     * Filter which CuadroComparativos to update
     */
    where?: CuadroComparativoWhereInput
  }

  /**
   * CuadroComparativo upsert
   */
  export type CuadroComparativoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CuadroComparativo
     */
    select?: CuadroComparativoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CuadroComparativoInclude<ExtArgs> | null
    /**
     * The filter to search for the CuadroComparativo to update in case it exists.
     */
    where: CuadroComparativoWhereUniqueInput
    /**
     * In case the CuadroComparativo found by the `where` argument doesn't exist, create a new CuadroComparativo with this data.
     */
    create: XOR<CuadroComparativoCreateInput, CuadroComparativoUncheckedCreateInput>
    /**
     * In case the CuadroComparativo was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CuadroComparativoUpdateInput, CuadroComparativoUncheckedUpdateInput>
  }

  /**
   * CuadroComparativo delete
   */
  export type CuadroComparativoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CuadroComparativo
     */
    select?: CuadroComparativoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CuadroComparativoInclude<ExtArgs> | null
    /**
     * Filter which CuadroComparativo to delete.
     */
    where: CuadroComparativoWhereUniqueInput
  }

  /**
   * CuadroComparativo deleteMany
   */
  export type CuadroComparativoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CuadroComparativos to delete
     */
    where?: CuadroComparativoWhereInput
  }

  /**
   * CuadroComparativo.detalles
   */
  export type CuadroComparativo$detallesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ComparativaDetalle
     */
    select?: ComparativaDetalleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ComparativaDetalleInclude<ExtArgs> | null
    where?: ComparativaDetalleWhereInput
    orderBy?: ComparativaDetalleOrderByWithRelationInput | ComparativaDetalleOrderByWithRelationInput[]
    cursor?: ComparativaDetalleWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ComparativaDetalleScalarFieldEnum | ComparativaDetalleScalarFieldEnum[]
  }

  /**
   * CuadroComparativo without action
   */
  export type CuadroComparativoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CuadroComparativo
     */
    select?: CuadroComparativoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CuadroComparativoInclude<ExtArgs> | null
  }


  /**
   * Model ComparativaDetalle
   */

  export type AggregateComparativaDetalle = {
    _count: ComparativaDetalleCountAggregateOutputType | null
    _avg: ComparativaDetalleAvgAggregateOutputType | null
    _sum: ComparativaDetalleSumAggregateOutputType | null
    _min: ComparativaDetalleMinAggregateOutputType | null
    _max: ComparativaDetalleMaxAggregateOutputType | null
  }

  export type ComparativaDetalleAvgAggregateOutputType = {
    precio_ofertado: Decimal | null
  }

  export type ComparativaDetalleSumAggregateOutputType = {
    precio_ofertado: Decimal | null
  }

  export type ComparativaDetalleMinAggregateOutputType = {
    id_detalle: string | null
    tenant_id: string | null
    proyecto_id: string | null
    cuadro_id: string | null
    proveedor_id: string | null
    insumo_id: string | null
    precio_ofertado: Decimal | null
    tiempo_entrega: string | null
    es_ganador: boolean | null
  }

  export type ComparativaDetalleMaxAggregateOutputType = {
    id_detalle: string | null
    tenant_id: string | null
    proyecto_id: string | null
    cuadro_id: string | null
    proveedor_id: string | null
    insumo_id: string | null
    precio_ofertado: Decimal | null
    tiempo_entrega: string | null
    es_ganador: boolean | null
  }

  export type ComparativaDetalleCountAggregateOutputType = {
    id_detalle: number
    tenant_id: number
    proyecto_id: number
    cuadro_id: number
    proveedor_id: number
    insumo_id: number
    precio_ofertado: number
    tiempo_entrega: number
    es_ganador: number
    _all: number
  }


  export type ComparativaDetalleAvgAggregateInputType = {
    precio_ofertado?: true
  }

  export type ComparativaDetalleSumAggregateInputType = {
    precio_ofertado?: true
  }

  export type ComparativaDetalleMinAggregateInputType = {
    id_detalle?: true
    tenant_id?: true
    proyecto_id?: true
    cuadro_id?: true
    proveedor_id?: true
    insumo_id?: true
    precio_ofertado?: true
    tiempo_entrega?: true
    es_ganador?: true
  }

  export type ComparativaDetalleMaxAggregateInputType = {
    id_detalle?: true
    tenant_id?: true
    proyecto_id?: true
    cuadro_id?: true
    proveedor_id?: true
    insumo_id?: true
    precio_ofertado?: true
    tiempo_entrega?: true
    es_ganador?: true
  }

  export type ComparativaDetalleCountAggregateInputType = {
    id_detalle?: true
    tenant_id?: true
    proyecto_id?: true
    cuadro_id?: true
    proveedor_id?: true
    insumo_id?: true
    precio_ofertado?: true
    tiempo_entrega?: true
    es_ganador?: true
    _all?: true
  }

  export type ComparativaDetalleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ComparativaDetalle to aggregate.
     */
    where?: ComparativaDetalleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ComparativaDetalles to fetch.
     */
    orderBy?: ComparativaDetalleOrderByWithRelationInput | ComparativaDetalleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ComparativaDetalleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ComparativaDetalles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ComparativaDetalles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ComparativaDetalles
    **/
    _count?: true | ComparativaDetalleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ComparativaDetalleAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ComparativaDetalleSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ComparativaDetalleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ComparativaDetalleMaxAggregateInputType
  }

  export type GetComparativaDetalleAggregateType<T extends ComparativaDetalleAggregateArgs> = {
        [P in keyof T & keyof AggregateComparativaDetalle]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateComparativaDetalle[P]>
      : GetScalarType<T[P], AggregateComparativaDetalle[P]>
  }




  export type ComparativaDetalleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ComparativaDetalleWhereInput
    orderBy?: ComparativaDetalleOrderByWithAggregationInput | ComparativaDetalleOrderByWithAggregationInput[]
    by: ComparativaDetalleScalarFieldEnum[] | ComparativaDetalleScalarFieldEnum
    having?: ComparativaDetalleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ComparativaDetalleCountAggregateInputType | true
    _avg?: ComparativaDetalleAvgAggregateInputType
    _sum?: ComparativaDetalleSumAggregateInputType
    _min?: ComparativaDetalleMinAggregateInputType
    _max?: ComparativaDetalleMaxAggregateInputType
  }

  export type ComparativaDetalleGroupByOutputType = {
    id_detalle: string
    tenant_id: string
    proyecto_id: string
    cuadro_id: string
    proveedor_id: string
    insumo_id: string
    precio_ofertado: Decimal
    tiempo_entrega: string | null
    es_ganador: boolean
    _count: ComparativaDetalleCountAggregateOutputType | null
    _avg: ComparativaDetalleAvgAggregateOutputType | null
    _sum: ComparativaDetalleSumAggregateOutputType | null
    _min: ComparativaDetalleMinAggregateOutputType | null
    _max: ComparativaDetalleMaxAggregateOutputType | null
  }

  type GetComparativaDetalleGroupByPayload<T extends ComparativaDetalleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ComparativaDetalleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ComparativaDetalleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ComparativaDetalleGroupByOutputType[P]>
            : GetScalarType<T[P], ComparativaDetalleGroupByOutputType[P]>
        }
      >
    >


  export type ComparativaDetalleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_detalle?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    cuadro_id?: boolean
    proveedor_id?: boolean
    insumo_id?: boolean
    precio_ofertado?: boolean
    tiempo_entrega?: boolean
    es_ganador?: boolean
    cuadro?: boolean | CuadroComparativoDefaultArgs<ExtArgs>
    proveedor?: boolean | ProveedorDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["comparativaDetalle"]>

  export type ComparativaDetalleSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_detalle?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    cuadro_id?: boolean
    proveedor_id?: boolean
    insumo_id?: boolean
    precio_ofertado?: boolean
    tiempo_entrega?: boolean
    es_ganador?: boolean
    cuadro?: boolean | CuadroComparativoDefaultArgs<ExtArgs>
    proveedor?: boolean | ProveedorDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["comparativaDetalle"]>

  export type ComparativaDetalleSelectScalar = {
    id_detalle?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    cuadro_id?: boolean
    proveedor_id?: boolean
    insumo_id?: boolean
    precio_ofertado?: boolean
    tiempo_entrega?: boolean
    es_ganador?: boolean
  }

  export type ComparativaDetalleInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cuadro?: boolean | CuadroComparativoDefaultArgs<ExtArgs>
    proveedor?: boolean | ProveedorDefaultArgs<ExtArgs>
  }
  export type ComparativaDetalleIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cuadro?: boolean | CuadroComparativoDefaultArgs<ExtArgs>
    proveedor?: boolean | ProveedorDefaultArgs<ExtArgs>
  }

  export type $ComparativaDetallePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ComparativaDetalle"
    objects: {
      cuadro: Prisma.$CuadroComparativoPayload<ExtArgs>
      proveedor: Prisma.$ProveedorPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id_detalle: string
      tenant_id: string
      proyecto_id: string
      cuadro_id: string
      proveedor_id: string
      insumo_id: string
      precio_ofertado: Prisma.Decimal
      tiempo_entrega: string | null
      es_ganador: boolean
    }, ExtArgs["result"]["comparativaDetalle"]>
    composites: {}
  }

  type ComparativaDetalleGetPayload<S extends boolean | null | undefined | ComparativaDetalleDefaultArgs> = $Result.GetResult<Prisma.$ComparativaDetallePayload, S>

  type ComparativaDetalleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ComparativaDetalleFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ComparativaDetalleCountAggregateInputType | true
    }

  export interface ComparativaDetalleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ComparativaDetalle'], meta: { name: 'ComparativaDetalle' } }
    /**
     * Find zero or one ComparativaDetalle that matches the filter.
     * @param {ComparativaDetalleFindUniqueArgs} args - Arguments to find a ComparativaDetalle
     * @example
     * // Get one ComparativaDetalle
     * const comparativaDetalle = await prisma.comparativaDetalle.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ComparativaDetalleFindUniqueArgs>(args: SelectSubset<T, ComparativaDetalleFindUniqueArgs<ExtArgs>>): Prisma__ComparativaDetalleClient<$Result.GetResult<Prisma.$ComparativaDetallePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ComparativaDetalle that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ComparativaDetalleFindUniqueOrThrowArgs} args - Arguments to find a ComparativaDetalle
     * @example
     * // Get one ComparativaDetalle
     * const comparativaDetalle = await prisma.comparativaDetalle.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ComparativaDetalleFindUniqueOrThrowArgs>(args: SelectSubset<T, ComparativaDetalleFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ComparativaDetalleClient<$Result.GetResult<Prisma.$ComparativaDetallePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ComparativaDetalle that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ComparativaDetalleFindFirstArgs} args - Arguments to find a ComparativaDetalle
     * @example
     * // Get one ComparativaDetalle
     * const comparativaDetalle = await prisma.comparativaDetalle.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ComparativaDetalleFindFirstArgs>(args?: SelectSubset<T, ComparativaDetalleFindFirstArgs<ExtArgs>>): Prisma__ComparativaDetalleClient<$Result.GetResult<Prisma.$ComparativaDetallePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ComparativaDetalle that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ComparativaDetalleFindFirstOrThrowArgs} args - Arguments to find a ComparativaDetalle
     * @example
     * // Get one ComparativaDetalle
     * const comparativaDetalle = await prisma.comparativaDetalle.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ComparativaDetalleFindFirstOrThrowArgs>(args?: SelectSubset<T, ComparativaDetalleFindFirstOrThrowArgs<ExtArgs>>): Prisma__ComparativaDetalleClient<$Result.GetResult<Prisma.$ComparativaDetallePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ComparativaDetalles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ComparativaDetalleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ComparativaDetalles
     * const comparativaDetalles = await prisma.comparativaDetalle.findMany()
     * 
     * // Get first 10 ComparativaDetalles
     * const comparativaDetalles = await prisma.comparativaDetalle.findMany({ take: 10 })
     * 
     * // Only select the `id_detalle`
     * const comparativaDetalleWithId_detalleOnly = await prisma.comparativaDetalle.findMany({ select: { id_detalle: true } })
     * 
     */
    findMany<T extends ComparativaDetalleFindManyArgs>(args?: SelectSubset<T, ComparativaDetalleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ComparativaDetallePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ComparativaDetalle.
     * @param {ComparativaDetalleCreateArgs} args - Arguments to create a ComparativaDetalle.
     * @example
     * // Create one ComparativaDetalle
     * const ComparativaDetalle = await prisma.comparativaDetalle.create({
     *   data: {
     *     // ... data to create a ComparativaDetalle
     *   }
     * })
     * 
     */
    create<T extends ComparativaDetalleCreateArgs>(args: SelectSubset<T, ComparativaDetalleCreateArgs<ExtArgs>>): Prisma__ComparativaDetalleClient<$Result.GetResult<Prisma.$ComparativaDetallePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ComparativaDetalles.
     * @param {ComparativaDetalleCreateManyArgs} args - Arguments to create many ComparativaDetalles.
     * @example
     * // Create many ComparativaDetalles
     * const comparativaDetalle = await prisma.comparativaDetalle.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ComparativaDetalleCreateManyArgs>(args?: SelectSubset<T, ComparativaDetalleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ComparativaDetalles and returns the data saved in the database.
     * @param {ComparativaDetalleCreateManyAndReturnArgs} args - Arguments to create many ComparativaDetalles.
     * @example
     * // Create many ComparativaDetalles
     * const comparativaDetalle = await prisma.comparativaDetalle.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ComparativaDetalles and only return the `id_detalle`
     * const comparativaDetalleWithId_detalleOnly = await prisma.comparativaDetalle.createManyAndReturn({ 
     *   select: { id_detalle: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ComparativaDetalleCreateManyAndReturnArgs>(args?: SelectSubset<T, ComparativaDetalleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ComparativaDetallePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ComparativaDetalle.
     * @param {ComparativaDetalleDeleteArgs} args - Arguments to delete one ComparativaDetalle.
     * @example
     * // Delete one ComparativaDetalle
     * const ComparativaDetalle = await prisma.comparativaDetalle.delete({
     *   where: {
     *     // ... filter to delete one ComparativaDetalle
     *   }
     * })
     * 
     */
    delete<T extends ComparativaDetalleDeleteArgs>(args: SelectSubset<T, ComparativaDetalleDeleteArgs<ExtArgs>>): Prisma__ComparativaDetalleClient<$Result.GetResult<Prisma.$ComparativaDetallePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ComparativaDetalle.
     * @param {ComparativaDetalleUpdateArgs} args - Arguments to update one ComparativaDetalle.
     * @example
     * // Update one ComparativaDetalle
     * const comparativaDetalle = await prisma.comparativaDetalle.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ComparativaDetalleUpdateArgs>(args: SelectSubset<T, ComparativaDetalleUpdateArgs<ExtArgs>>): Prisma__ComparativaDetalleClient<$Result.GetResult<Prisma.$ComparativaDetallePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ComparativaDetalles.
     * @param {ComparativaDetalleDeleteManyArgs} args - Arguments to filter ComparativaDetalles to delete.
     * @example
     * // Delete a few ComparativaDetalles
     * const { count } = await prisma.comparativaDetalle.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ComparativaDetalleDeleteManyArgs>(args?: SelectSubset<T, ComparativaDetalleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ComparativaDetalles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ComparativaDetalleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ComparativaDetalles
     * const comparativaDetalle = await prisma.comparativaDetalle.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ComparativaDetalleUpdateManyArgs>(args: SelectSubset<T, ComparativaDetalleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ComparativaDetalle.
     * @param {ComparativaDetalleUpsertArgs} args - Arguments to update or create a ComparativaDetalle.
     * @example
     * // Update or create a ComparativaDetalle
     * const comparativaDetalle = await prisma.comparativaDetalle.upsert({
     *   create: {
     *     // ... data to create a ComparativaDetalle
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ComparativaDetalle we want to update
     *   }
     * })
     */
    upsert<T extends ComparativaDetalleUpsertArgs>(args: SelectSubset<T, ComparativaDetalleUpsertArgs<ExtArgs>>): Prisma__ComparativaDetalleClient<$Result.GetResult<Prisma.$ComparativaDetallePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ComparativaDetalles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ComparativaDetalleCountArgs} args - Arguments to filter ComparativaDetalles to count.
     * @example
     * // Count the number of ComparativaDetalles
     * const count = await prisma.comparativaDetalle.count({
     *   where: {
     *     // ... the filter for the ComparativaDetalles we want to count
     *   }
     * })
    **/
    count<T extends ComparativaDetalleCountArgs>(
      args?: Subset<T, ComparativaDetalleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ComparativaDetalleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ComparativaDetalle.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ComparativaDetalleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ComparativaDetalleAggregateArgs>(args: Subset<T, ComparativaDetalleAggregateArgs>): Prisma.PrismaPromise<GetComparativaDetalleAggregateType<T>>

    /**
     * Group by ComparativaDetalle.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ComparativaDetalleGroupByArgs} args - Group by arguments.
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
      T extends ComparativaDetalleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ComparativaDetalleGroupByArgs['orderBy'] }
        : { orderBy?: ComparativaDetalleGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ComparativaDetalleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetComparativaDetalleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ComparativaDetalle model
   */
  readonly fields: ComparativaDetalleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ComparativaDetalle.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ComparativaDetalleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    cuadro<T extends CuadroComparativoDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CuadroComparativoDefaultArgs<ExtArgs>>): Prisma__CuadroComparativoClient<$Result.GetResult<Prisma.$CuadroComparativoPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    proveedor<T extends ProveedorDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProveedorDefaultArgs<ExtArgs>>): Prisma__ProveedorClient<$Result.GetResult<Prisma.$ProveedorPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
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
   * Fields of the ComparativaDetalle model
   */ 
  interface ComparativaDetalleFieldRefs {
    readonly id_detalle: FieldRef<"ComparativaDetalle", 'String'>
    readonly tenant_id: FieldRef<"ComparativaDetalle", 'String'>
    readonly proyecto_id: FieldRef<"ComparativaDetalle", 'String'>
    readonly cuadro_id: FieldRef<"ComparativaDetalle", 'String'>
    readonly proveedor_id: FieldRef<"ComparativaDetalle", 'String'>
    readonly insumo_id: FieldRef<"ComparativaDetalle", 'String'>
    readonly precio_ofertado: FieldRef<"ComparativaDetalle", 'Decimal'>
    readonly tiempo_entrega: FieldRef<"ComparativaDetalle", 'String'>
    readonly es_ganador: FieldRef<"ComparativaDetalle", 'Boolean'>
  }
    

  // Custom InputTypes
  /**
   * ComparativaDetalle findUnique
   */
  export type ComparativaDetalleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ComparativaDetalle
     */
    select?: ComparativaDetalleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ComparativaDetalleInclude<ExtArgs> | null
    /**
     * Filter, which ComparativaDetalle to fetch.
     */
    where: ComparativaDetalleWhereUniqueInput
  }

  /**
   * ComparativaDetalle findUniqueOrThrow
   */
  export type ComparativaDetalleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ComparativaDetalle
     */
    select?: ComparativaDetalleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ComparativaDetalleInclude<ExtArgs> | null
    /**
     * Filter, which ComparativaDetalle to fetch.
     */
    where: ComparativaDetalleWhereUniqueInput
  }

  /**
   * ComparativaDetalle findFirst
   */
  export type ComparativaDetalleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ComparativaDetalle
     */
    select?: ComparativaDetalleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ComparativaDetalleInclude<ExtArgs> | null
    /**
     * Filter, which ComparativaDetalle to fetch.
     */
    where?: ComparativaDetalleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ComparativaDetalles to fetch.
     */
    orderBy?: ComparativaDetalleOrderByWithRelationInput | ComparativaDetalleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ComparativaDetalles.
     */
    cursor?: ComparativaDetalleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ComparativaDetalles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ComparativaDetalles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ComparativaDetalles.
     */
    distinct?: ComparativaDetalleScalarFieldEnum | ComparativaDetalleScalarFieldEnum[]
  }

  /**
   * ComparativaDetalle findFirstOrThrow
   */
  export type ComparativaDetalleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ComparativaDetalle
     */
    select?: ComparativaDetalleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ComparativaDetalleInclude<ExtArgs> | null
    /**
     * Filter, which ComparativaDetalle to fetch.
     */
    where?: ComparativaDetalleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ComparativaDetalles to fetch.
     */
    orderBy?: ComparativaDetalleOrderByWithRelationInput | ComparativaDetalleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ComparativaDetalles.
     */
    cursor?: ComparativaDetalleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ComparativaDetalles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ComparativaDetalles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ComparativaDetalles.
     */
    distinct?: ComparativaDetalleScalarFieldEnum | ComparativaDetalleScalarFieldEnum[]
  }

  /**
   * ComparativaDetalle findMany
   */
  export type ComparativaDetalleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ComparativaDetalle
     */
    select?: ComparativaDetalleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ComparativaDetalleInclude<ExtArgs> | null
    /**
     * Filter, which ComparativaDetalles to fetch.
     */
    where?: ComparativaDetalleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ComparativaDetalles to fetch.
     */
    orderBy?: ComparativaDetalleOrderByWithRelationInput | ComparativaDetalleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ComparativaDetalles.
     */
    cursor?: ComparativaDetalleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ComparativaDetalles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ComparativaDetalles.
     */
    skip?: number
    distinct?: ComparativaDetalleScalarFieldEnum | ComparativaDetalleScalarFieldEnum[]
  }

  /**
   * ComparativaDetalle create
   */
  export type ComparativaDetalleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ComparativaDetalle
     */
    select?: ComparativaDetalleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ComparativaDetalleInclude<ExtArgs> | null
    /**
     * The data needed to create a ComparativaDetalle.
     */
    data: XOR<ComparativaDetalleCreateInput, ComparativaDetalleUncheckedCreateInput>
  }

  /**
   * ComparativaDetalle createMany
   */
  export type ComparativaDetalleCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ComparativaDetalles.
     */
    data: ComparativaDetalleCreateManyInput | ComparativaDetalleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ComparativaDetalle createManyAndReturn
   */
  export type ComparativaDetalleCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ComparativaDetalle
     */
    select?: ComparativaDetalleSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ComparativaDetalles.
     */
    data: ComparativaDetalleCreateManyInput | ComparativaDetalleCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ComparativaDetalleIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ComparativaDetalle update
   */
  export type ComparativaDetalleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ComparativaDetalle
     */
    select?: ComparativaDetalleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ComparativaDetalleInclude<ExtArgs> | null
    /**
     * The data needed to update a ComparativaDetalle.
     */
    data: XOR<ComparativaDetalleUpdateInput, ComparativaDetalleUncheckedUpdateInput>
    /**
     * Choose, which ComparativaDetalle to update.
     */
    where: ComparativaDetalleWhereUniqueInput
  }

  /**
   * ComparativaDetalle updateMany
   */
  export type ComparativaDetalleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ComparativaDetalles.
     */
    data: XOR<ComparativaDetalleUpdateManyMutationInput, ComparativaDetalleUncheckedUpdateManyInput>
    /**
     * Filter which ComparativaDetalles to update
     */
    where?: ComparativaDetalleWhereInput
  }

  /**
   * ComparativaDetalle upsert
   */
  export type ComparativaDetalleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ComparativaDetalle
     */
    select?: ComparativaDetalleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ComparativaDetalleInclude<ExtArgs> | null
    /**
     * The filter to search for the ComparativaDetalle to update in case it exists.
     */
    where: ComparativaDetalleWhereUniqueInput
    /**
     * In case the ComparativaDetalle found by the `where` argument doesn't exist, create a new ComparativaDetalle with this data.
     */
    create: XOR<ComparativaDetalleCreateInput, ComparativaDetalleUncheckedCreateInput>
    /**
     * In case the ComparativaDetalle was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ComparativaDetalleUpdateInput, ComparativaDetalleUncheckedUpdateInput>
  }

  /**
   * ComparativaDetalle delete
   */
  export type ComparativaDetalleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ComparativaDetalle
     */
    select?: ComparativaDetalleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ComparativaDetalleInclude<ExtArgs> | null
    /**
     * Filter which ComparativaDetalle to delete.
     */
    where: ComparativaDetalleWhereUniqueInput
  }

  /**
   * ComparativaDetalle deleteMany
   */
  export type ComparativaDetalleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ComparativaDetalles to delete
     */
    where?: ComparativaDetalleWhereInput
  }

  /**
   * ComparativaDetalle without action
   */
  export type ComparativaDetalleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ComparativaDetalle
     */
    select?: ComparativaDetalleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ComparativaDetalleInclude<ExtArgs> | null
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


  export const ProveedorScalarFieldEnum: {
    id_proveedor: 'id_proveedor',
    tenant_id: 'tenant_id',
    rfc_tax_id: 'rfc_tax_id',
    razon_social: 'razon_social',
    email_contacto: 'email_contacto',
    telefono: 'telefono',
    estatus: 'estatus'
  };

  export type ProveedorScalarFieldEnum = (typeof ProveedorScalarFieldEnum)[keyof typeof ProveedorScalarFieldEnum]


  export const RequisicionScalarFieldEnum: {
    id_requisicion: 'id_requisicion',
    tenant_id: 'tenant_id',
    proyecto_id: 'proyecto_id',
    codigo: 'codigo',
    fecha_solicitud: 'fecha_solicitud',
    solicitante_id: 'solicitante_id',
    prioridad: 'prioridad',
    estado: 'estado',
    observaciones: 'observaciones'
  };

  export type RequisicionScalarFieldEnum = (typeof RequisicionScalarFieldEnum)[keyof typeof RequisicionScalarFieldEnum]


  export const RequisicionItemScalarFieldEnum: {
    id_item: 'id_item',
    tenant_id: 'tenant_id',
    proyecto_id: 'proyecto_id',
    requisicion_id: 'requisicion_id',
    insumo_id: 'insumo_id',
    cantidad: 'cantidad',
    notas: 'notas'
  };

  export type RequisicionItemScalarFieldEnum = (typeof RequisicionItemScalarFieldEnum)[keyof typeof RequisicionItemScalarFieldEnum]


  export const OrdenCompraScalarFieldEnum: {
    id_orden: 'id_orden',
    tenant_id: 'tenant_id',
    proyecto_id: 'proyecto_id',
    proveedor_id: 'proveedor_id',
    codigo: 'codigo',
    fecha_emision: 'fecha_emision',
    estado: 'estado',
    moneda: 'moneda',
    tipo_cambio: 'tipo_cambio',
    subtotal: 'subtotal',
    iva: 'iva',
    total: 'total',
    presupuesto_id: 'presupuesto_id'
  };

  export type OrdenCompraScalarFieldEnum = (typeof OrdenCompraScalarFieldEnum)[keyof typeof OrdenCompraScalarFieldEnum]


  export const OrdenCompraItemScalarFieldEnum: {
    id_item: 'id_item',
    tenant_id: 'tenant_id',
    proyecto_id: 'proyecto_id',
    orden_id: 'orden_id',
    insumo_id: 'insumo_id',
    cantidad: 'cantidad',
    precio_unitario: 'precio_unitario',
    importe: 'importe'
  };

  export type OrdenCompraItemScalarFieldEnum = (typeof OrdenCompraItemScalarFieldEnum)[keyof typeof OrdenCompraItemScalarFieldEnum]


  export const CuadroComparativoScalarFieldEnum: {
    id_cuadro: 'id_cuadro',
    tenant_id: 'tenant_id',
    proyecto_id: 'proyecto_id',
    requisicion_id: 'requisicion_id',
    codigo: 'codigo',
    fecha_creacion: 'fecha_creacion',
    estado: 'estado',
    notas: 'notas'
  };

  export type CuadroComparativoScalarFieldEnum = (typeof CuadroComparativoScalarFieldEnum)[keyof typeof CuadroComparativoScalarFieldEnum]


  export const ComparativaDetalleScalarFieldEnum: {
    id_detalle: 'id_detalle',
    tenant_id: 'tenant_id',
    proyecto_id: 'proyecto_id',
    cuadro_id: 'cuadro_id',
    proveedor_id: 'proveedor_id',
    insumo_id: 'insumo_id',
    precio_ofertado: 'precio_ofertado',
    tiempo_entrega: 'tiempo_entrega',
    es_ganador: 'es_ganador'
  };

  export type ComparativaDetalleScalarFieldEnum = (typeof ComparativaDetalleScalarFieldEnum)[keyof typeof ComparativaDetalleScalarFieldEnum]


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
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


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


  export type ProveedorWhereInput = {
    AND?: ProveedorWhereInput | ProveedorWhereInput[]
    OR?: ProveedorWhereInput[]
    NOT?: ProveedorWhereInput | ProveedorWhereInput[]
    id_proveedor?: UuidFilter<"Proveedor"> | string
    tenant_id?: UuidFilter<"Proveedor"> | string
    rfc_tax_id?: StringFilter<"Proveedor"> | string
    razon_social?: StringFilter<"Proveedor"> | string
    email_contacto?: StringNullableFilter<"Proveedor"> | string | null
    telefono?: StringNullableFilter<"Proveedor"> | string | null
    estatus?: StringFilter<"Proveedor"> | string
    ordenes?: OrdenCompraListRelationFilter
    comparativas?: ComparativaDetalleListRelationFilter
  }

  export type ProveedorOrderByWithRelationInput = {
    id_proveedor?: SortOrder
    tenant_id?: SortOrder
    rfc_tax_id?: SortOrder
    razon_social?: SortOrder
    email_contacto?: SortOrderInput | SortOrder
    telefono?: SortOrderInput | SortOrder
    estatus?: SortOrder
    ordenes?: OrdenCompraOrderByRelationAggregateInput
    comparativas?: ComparativaDetalleOrderByRelationAggregateInput
  }

  export type ProveedorWhereUniqueInput = Prisma.AtLeast<{
    id_proveedor?: string
    tenant_id_rfc_tax_id?: ProveedorTenant_idRfc_tax_idCompoundUniqueInput
    AND?: ProveedorWhereInput | ProveedorWhereInput[]
    OR?: ProveedorWhereInput[]
    NOT?: ProveedorWhereInput | ProveedorWhereInput[]
    tenant_id?: UuidFilter<"Proveedor"> | string
    rfc_tax_id?: StringFilter<"Proveedor"> | string
    razon_social?: StringFilter<"Proveedor"> | string
    email_contacto?: StringNullableFilter<"Proveedor"> | string | null
    telefono?: StringNullableFilter<"Proveedor"> | string | null
    estatus?: StringFilter<"Proveedor"> | string
    ordenes?: OrdenCompraListRelationFilter
    comparativas?: ComparativaDetalleListRelationFilter
  }, "id_proveedor" | "tenant_id_rfc_tax_id">

  export type ProveedorOrderByWithAggregationInput = {
    id_proveedor?: SortOrder
    tenant_id?: SortOrder
    rfc_tax_id?: SortOrder
    razon_social?: SortOrder
    email_contacto?: SortOrderInput | SortOrder
    telefono?: SortOrderInput | SortOrder
    estatus?: SortOrder
    _count?: ProveedorCountOrderByAggregateInput
    _max?: ProveedorMaxOrderByAggregateInput
    _min?: ProveedorMinOrderByAggregateInput
  }

  export type ProveedorScalarWhereWithAggregatesInput = {
    AND?: ProveedorScalarWhereWithAggregatesInput | ProveedorScalarWhereWithAggregatesInput[]
    OR?: ProveedorScalarWhereWithAggregatesInput[]
    NOT?: ProveedorScalarWhereWithAggregatesInput | ProveedorScalarWhereWithAggregatesInput[]
    id_proveedor?: UuidWithAggregatesFilter<"Proveedor"> | string
    tenant_id?: UuidWithAggregatesFilter<"Proveedor"> | string
    rfc_tax_id?: StringWithAggregatesFilter<"Proveedor"> | string
    razon_social?: StringWithAggregatesFilter<"Proveedor"> | string
    email_contacto?: StringNullableWithAggregatesFilter<"Proveedor"> | string | null
    telefono?: StringNullableWithAggregatesFilter<"Proveedor"> | string | null
    estatus?: StringWithAggregatesFilter<"Proveedor"> | string
  }

  export type RequisicionWhereInput = {
    AND?: RequisicionWhereInput | RequisicionWhereInput[]
    OR?: RequisicionWhereInput[]
    NOT?: RequisicionWhereInput | RequisicionWhereInput[]
    id_requisicion?: UuidFilter<"Requisicion"> | string
    tenant_id?: UuidFilter<"Requisicion"> | string
    proyecto_id?: UuidFilter<"Requisicion"> | string
    codigo?: StringFilter<"Requisicion"> | string
    fecha_solicitud?: DateTimeFilter<"Requisicion"> | Date | string
    solicitante_id?: UuidFilter<"Requisicion"> | string
    prioridad?: StringFilter<"Requisicion"> | string
    estado?: StringFilter<"Requisicion"> | string
    observaciones?: StringNullableFilter<"Requisicion"> | string | null
    items?: RequisicionItemListRelationFilter
  }

  export type RequisicionOrderByWithRelationInput = {
    id_requisicion?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    codigo?: SortOrder
    fecha_solicitud?: SortOrder
    solicitante_id?: SortOrder
    prioridad?: SortOrder
    estado?: SortOrder
    observaciones?: SortOrderInput | SortOrder
    items?: RequisicionItemOrderByRelationAggregateInput
  }

  export type RequisicionWhereUniqueInput = Prisma.AtLeast<{
    id_requisicion?: string
    tenant_id_codigo?: RequisicionTenant_idCodigoCompoundUniqueInput
    AND?: RequisicionWhereInput | RequisicionWhereInput[]
    OR?: RequisicionWhereInput[]
    NOT?: RequisicionWhereInput | RequisicionWhereInput[]
    tenant_id?: UuidFilter<"Requisicion"> | string
    proyecto_id?: UuidFilter<"Requisicion"> | string
    codigo?: StringFilter<"Requisicion"> | string
    fecha_solicitud?: DateTimeFilter<"Requisicion"> | Date | string
    solicitante_id?: UuidFilter<"Requisicion"> | string
    prioridad?: StringFilter<"Requisicion"> | string
    estado?: StringFilter<"Requisicion"> | string
    observaciones?: StringNullableFilter<"Requisicion"> | string | null
    items?: RequisicionItemListRelationFilter
  }, "id_requisicion" | "tenant_id_codigo">

  export type RequisicionOrderByWithAggregationInput = {
    id_requisicion?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    codigo?: SortOrder
    fecha_solicitud?: SortOrder
    solicitante_id?: SortOrder
    prioridad?: SortOrder
    estado?: SortOrder
    observaciones?: SortOrderInput | SortOrder
    _count?: RequisicionCountOrderByAggregateInput
    _max?: RequisicionMaxOrderByAggregateInput
    _min?: RequisicionMinOrderByAggregateInput
  }

  export type RequisicionScalarWhereWithAggregatesInput = {
    AND?: RequisicionScalarWhereWithAggregatesInput | RequisicionScalarWhereWithAggregatesInput[]
    OR?: RequisicionScalarWhereWithAggregatesInput[]
    NOT?: RequisicionScalarWhereWithAggregatesInput | RequisicionScalarWhereWithAggregatesInput[]
    id_requisicion?: UuidWithAggregatesFilter<"Requisicion"> | string
    tenant_id?: UuidWithAggregatesFilter<"Requisicion"> | string
    proyecto_id?: UuidWithAggregatesFilter<"Requisicion"> | string
    codigo?: StringWithAggregatesFilter<"Requisicion"> | string
    fecha_solicitud?: DateTimeWithAggregatesFilter<"Requisicion"> | Date | string
    solicitante_id?: UuidWithAggregatesFilter<"Requisicion"> | string
    prioridad?: StringWithAggregatesFilter<"Requisicion"> | string
    estado?: StringWithAggregatesFilter<"Requisicion"> | string
    observaciones?: StringNullableWithAggregatesFilter<"Requisicion"> | string | null
  }

  export type RequisicionItemWhereInput = {
    AND?: RequisicionItemWhereInput | RequisicionItemWhereInput[]
    OR?: RequisicionItemWhereInput[]
    NOT?: RequisicionItemWhereInput | RequisicionItemWhereInput[]
    id_item?: UuidFilter<"RequisicionItem"> | string
    tenant_id?: UuidFilter<"RequisicionItem"> | string
    proyecto_id?: UuidFilter<"RequisicionItem"> | string
    requisicion_id?: UuidFilter<"RequisicionItem"> | string
    insumo_id?: UuidFilter<"RequisicionItem"> | string
    cantidad?: DecimalFilter<"RequisicionItem"> | Decimal | DecimalJsLike | number | string
    notas?: StringNullableFilter<"RequisicionItem"> | string | null
    requisicion?: XOR<RequisicionRelationFilter, RequisicionWhereInput>
  }

  export type RequisicionItemOrderByWithRelationInput = {
    id_item?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    requisicion_id?: SortOrder
    insumo_id?: SortOrder
    cantidad?: SortOrder
    notas?: SortOrderInput | SortOrder
    requisicion?: RequisicionOrderByWithRelationInput
  }

  export type RequisicionItemWhereUniqueInput = Prisma.AtLeast<{
    id_item?: string
    AND?: RequisicionItemWhereInput | RequisicionItemWhereInput[]
    OR?: RequisicionItemWhereInput[]
    NOT?: RequisicionItemWhereInput | RequisicionItemWhereInput[]
    tenant_id?: UuidFilter<"RequisicionItem"> | string
    proyecto_id?: UuidFilter<"RequisicionItem"> | string
    requisicion_id?: UuidFilter<"RequisicionItem"> | string
    insumo_id?: UuidFilter<"RequisicionItem"> | string
    cantidad?: DecimalFilter<"RequisicionItem"> | Decimal | DecimalJsLike | number | string
    notas?: StringNullableFilter<"RequisicionItem"> | string | null
    requisicion?: XOR<RequisicionRelationFilter, RequisicionWhereInput>
  }, "id_item">

  export type RequisicionItemOrderByWithAggregationInput = {
    id_item?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    requisicion_id?: SortOrder
    insumo_id?: SortOrder
    cantidad?: SortOrder
    notas?: SortOrderInput | SortOrder
    _count?: RequisicionItemCountOrderByAggregateInput
    _avg?: RequisicionItemAvgOrderByAggregateInput
    _max?: RequisicionItemMaxOrderByAggregateInput
    _min?: RequisicionItemMinOrderByAggregateInput
    _sum?: RequisicionItemSumOrderByAggregateInput
  }

  export type RequisicionItemScalarWhereWithAggregatesInput = {
    AND?: RequisicionItemScalarWhereWithAggregatesInput | RequisicionItemScalarWhereWithAggregatesInput[]
    OR?: RequisicionItemScalarWhereWithAggregatesInput[]
    NOT?: RequisicionItemScalarWhereWithAggregatesInput | RequisicionItemScalarWhereWithAggregatesInput[]
    id_item?: UuidWithAggregatesFilter<"RequisicionItem"> | string
    tenant_id?: UuidWithAggregatesFilter<"RequisicionItem"> | string
    proyecto_id?: UuidWithAggregatesFilter<"RequisicionItem"> | string
    requisicion_id?: UuidWithAggregatesFilter<"RequisicionItem"> | string
    insumo_id?: UuidWithAggregatesFilter<"RequisicionItem"> | string
    cantidad?: DecimalWithAggregatesFilter<"RequisicionItem"> | Decimal | DecimalJsLike | number | string
    notas?: StringNullableWithAggregatesFilter<"RequisicionItem"> | string | null
  }

  export type OrdenCompraWhereInput = {
    AND?: OrdenCompraWhereInput | OrdenCompraWhereInput[]
    OR?: OrdenCompraWhereInput[]
    NOT?: OrdenCompraWhereInput | OrdenCompraWhereInput[]
    id_orden?: UuidFilter<"OrdenCompra"> | string
    tenant_id?: UuidFilter<"OrdenCompra"> | string
    proyecto_id?: UuidFilter<"OrdenCompra"> | string
    proveedor_id?: UuidFilter<"OrdenCompra"> | string
    codigo?: StringFilter<"OrdenCompra"> | string
    fecha_emision?: DateTimeFilter<"OrdenCompra"> | Date | string
    estado?: StringFilter<"OrdenCompra"> | string
    moneda?: StringFilter<"OrdenCompra"> | string
    tipo_cambio?: DecimalFilter<"OrdenCompra"> | Decimal | DecimalJsLike | number | string
    subtotal?: DecimalFilter<"OrdenCompra"> | Decimal | DecimalJsLike | number | string
    iva?: DecimalFilter<"OrdenCompra"> | Decimal | DecimalJsLike | number | string
    total?: DecimalFilter<"OrdenCompra"> | Decimal | DecimalJsLike | number | string
    presupuesto_id?: UuidNullableFilter<"OrdenCompra"> | string | null
    proveedor?: XOR<ProveedorRelationFilter, ProveedorWhereInput>
    items?: OrdenCompraItemListRelationFilter
  }

  export type OrdenCompraOrderByWithRelationInput = {
    id_orden?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    proveedor_id?: SortOrder
    codigo?: SortOrder
    fecha_emision?: SortOrder
    estado?: SortOrder
    moneda?: SortOrder
    tipo_cambio?: SortOrder
    subtotal?: SortOrder
    iva?: SortOrder
    total?: SortOrder
    presupuesto_id?: SortOrderInput | SortOrder
    proveedor?: ProveedorOrderByWithRelationInput
    items?: OrdenCompraItemOrderByRelationAggregateInput
  }

  export type OrdenCompraWhereUniqueInput = Prisma.AtLeast<{
    id_orden?: string
    tenant_id_codigo?: OrdenCompraTenant_idCodigoCompoundUniqueInput
    AND?: OrdenCompraWhereInput | OrdenCompraWhereInput[]
    OR?: OrdenCompraWhereInput[]
    NOT?: OrdenCompraWhereInput | OrdenCompraWhereInput[]
    tenant_id?: UuidFilter<"OrdenCompra"> | string
    proyecto_id?: UuidFilter<"OrdenCompra"> | string
    proveedor_id?: UuidFilter<"OrdenCompra"> | string
    codigo?: StringFilter<"OrdenCompra"> | string
    fecha_emision?: DateTimeFilter<"OrdenCompra"> | Date | string
    estado?: StringFilter<"OrdenCompra"> | string
    moneda?: StringFilter<"OrdenCompra"> | string
    tipo_cambio?: DecimalFilter<"OrdenCompra"> | Decimal | DecimalJsLike | number | string
    subtotal?: DecimalFilter<"OrdenCompra"> | Decimal | DecimalJsLike | number | string
    iva?: DecimalFilter<"OrdenCompra"> | Decimal | DecimalJsLike | number | string
    total?: DecimalFilter<"OrdenCompra"> | Decimal | DecimalJsLike | number | string
    presupuesto_id?: UuidNullableFilter<"OrdenCompra"> | string | null
    proveedor?: XOR<ProveedorRelationFilter, ProveedorWhereInput>
    items?: OrdenCompraItemListRelationFilter
  }, "id_orden" | "tenant_id_codigo">

  export type OrdenCompraOrderByWithAggregationInput = {
    id_orden?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    proveedor_id?: SortOrder
    codigo?: SortOrder
    fecha_emision?: SortOrder
    estado?: SortOrder
    moneda?: SortOrder
    tipo_cambio?: SortOrder
    subtotal?: SortOrder
    iva?: SortOrder
    total?: SortOrder
    presupuesto_id?: SortOrderInput | SortOrder
    _count?: OrdenCompraCountOrderByAggregateInput
    _avg?: OrdenCompraAvgOrderByAggregateInput
    _max?: OrdenCompraMaxOrderByAggregateInput
    _min?: OrdenCompraMinOrderByAggregateInput
    _sum?: OrdenCompraSumOrderByAggregateInput
  }

  export type OrdenCompraScalarWhereWithAggregatesInput = {
    AND?: OrdenCompraScalarWhereWithAggregatesInput | OrdenCompraScalarWhereWithAggregatesInput[]
    OR?: OrdenCompraScalarWhereWithAggregatesInput[]
    NOT?: OrdenCompraScalarWhereWithAggregatesInput | OrdenCompraScalarWhereWithAggregatesInput[]
    id_orden?: UuidWithAggregatesFilter<"OrdenCompra"> | string
    tenant_id?: UuidWithAggregatesFilter<"OrdenCompra"> | string
    proyecto_id?: UuidWithAggregatesFilter<"OrdenCompra"> | string
    proveedor_id?: UuidWithAggregatesFilter<"OrdenCompra"> | string
    codigo?: StringWithAggregatesFilter<"OrdenCompra"> | string
    fecha_emision?: DateTimeWithAggregatesFilter<"OrdenCompra"> | Date | string
    estado?: StringWithAggregatesFilter<"OrdenCompra"> | string
    moneda?: StringWithAggregatesFilter<"OrdenCompra"> | string
    tipo_cambio?: DecimalWithAggregatesFilter<"OrdenCompra"> | Decimal | DecimalJsLike | number | string
    subtotal?: DecimalWithAggregatesFilter<"OrdenCompra"> | Decimal | DecimalJsLike | number | string
    iva?: DecimalWithAggregatesFilter<"OrdenCompra"> | Decimal | DecimalJsLike | number | string
    total?: DecimalWithAggregatesFilter<"OrdenCompra"> | Decimal | DecimalJsLike | number | string
    presupuesto_id?: UuidNullableWithAggregatesFilter<"OrdenCompra"> | string | null
  }

  export type OrdenCompraItemWhereInput = {
    AND?: OrdenCompraItemWhereInput | OrdenCompraItemWhereInput[]
    OR?: OrdenCompraItemWhereInput[]
    NOT?: OrdenCompraItemWhereInput | OrdenCompraItemWhereInput[]
    id_item?: UuidFilter<"OrdenCompraItem"> | string
    tenant_id?: UuidFilter<"OrdenCompraItem"> | string
    proyecto_id?: UuidFilter<"OrdenCompraItem"> | string
    orden_id?: UuidFilter<"OrdenCompraItem"> | string
    insumo_id?: UuidFilter<"OrdenCompraItem"> | string
    cantidad?: DecimalFilter<"OrdenCompraItem"> | Decimal | DecimalJsLike | number | string
    precio_unitario?: DecimalFilter<"OrdenCompraItem"> | Decimal | DecimalJsLike | number | string
    importe?: DecimalFilter<"OrdenCompraItem"> | Decimal | DecimalJsLike | number | string
    orden?: XOR<OrdenCompraRelationFilter, OrdenCompraWhereInput>
  }

  export type OrdenCompraItemOrderByWithRelationInput = {
    id_item?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    orden_id?: SortOrder
    insumo_id?: SortOrder
    cantidad?: SortOrder
    precio_unitario?: SortOrder
    importe?: SortOrder
    orden?: OrdenCompraOrderByWithRelationInput
  }

  export type OrdenCompraItemWhereUniqueInput = Prisma.AtLeast<{
    id_item?: string
    AND?: OrdenCompraItemWhereInput | OrdenCompraItemWhereInput[]
    OR?: OrdenCompraItemWhereInput[]
    NOT?: OrdenCompraItemWhereInput | OrdenCompraItemWhereInput[]
    tenant_id?: UuidFilter<"OrdenCompraItem"> | string
    proyecto_id?: UuidFilter<"OrdenCompraItem"> | string
    orden_id?: UuidFilter<"OrdenCompraItem"> | string
    insumo_id?: UuidFilter<"OrdenCompraItem"> | string
    cantidad?: DecimalFilter<"OrdenCompraItem"> | Decimal | DecimalJsLike | number | string
    precio_unitario?: DecimalFilter<"OrdenCompraItem"> | Decimal | DecimalJsLike | number | string
    importe?: DecimalFilter<"OrdenCompraItem"> | Decimal | DecimalJsLike | number | string
    orden?: XOR<OrdenCompraRelationFilter, OrdenCompraWhereInput>
  }, "id_item">

  export type OrdenCompraItemOrderByWithAggregationInput = {
    id_item?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    orden_id?: SortOrder
    insumo_id?: SortOrder
    cantidad?: SortOrder
    precio_unitario?: SortOrder
    importe?: SortOrder
    _count?: OrdenCompraItemCountOrderByAggregateInput
    _avg?: OrdenCompraItemAvgOrderByAggregateInput
    _max?: OrdenCompraItemMaxOrderByAggregateInput
    _min?: OrdenCompraItemMinOrderByAggregateInput
    _sum?: OrdenCompraItemSumOrderByAggregateInput
  }

  export type OrdenCompraItemScalarWhereWithAggregatesInput = {
    AND?: OrdenCompraItemScalarWhereWithAggregatesInput | OrdenCompraItemScalarWhereWithAggregatesInput[]
    OR?: OrdenCompraItemScalarWhereWithAggregatesInput[]
    NOT?: OrdenCompraItemScalarWhereWithAggregatesInput | OrdenCompraItemScalarWhereWithAggregatesInput[]
    id_item?: UuidWithAggregatesFilter<"OrdenCompraItem"> | string
    tenant_id?: UuidWithAggregatesFilter<"OrdenCompraItem"> | string
    proyecto_id?: UuidWithAggregatesFilter<"OrdenCompraItem"> | string
    orden_id?: UuidWithAggregatesFilter<"OrdenCompraItem"> | string
    insumo_id?: UuidWithAggregatesFilter<"OrdenCompraItem"> | string
    cantidad?: DecimalWithAggregatesFilter<"OrdenCompraItem"> | Decimal | DecimalJsLike | number | string
    precio_unitario?: DecimalWithAggregatesFilter<"OrdenCompraItem"> | Decimal | DecimalJsLike | number | string
    importe?: DecimalWithAggregatesFilter<"OrdenCompraItem"> | Decimal | DecimalJsLike | number | string
  }

  export type CuadroComparativoWhereInput = {
    AND?: CuadroComparativoWhereInput | CuadroComparativoWhereInput[]
    OR?: CuadroComparativoWhereInput[]
    NOT?: CuadroComparativoWhereInput | CuadroComparativoWhereInput[]
    id_cuadro?: UuidFilter<"CuadroComparativo"> | string
    tenant_id?: UuidFilter<"CuadroComparativo"> | string
    proyecto_id?: UuidFilter<"CuadroComparativo"> | string
    requisicion_id?: UuidFilter<"CuadroComparativo"> | string
    codigo?: StringFilter<"CuadroComparativo"> | string
    fecha_creacion?: DateTimeFilter<"CuadroComparativo"> | Date | string
    estado?: StringFilter<"CuadroComparativo"> | string
    notas?: StringNullableFilter<"CuadroComparativo"> | string | null
    detalles?: ComparativaDetalleListRelationFilter
  }

  export type CuadroComparativoOrderByWithRelationInput = {
    id_cuadro?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    requisicion_id?: SortOrder
    codigo?: SortOrder
    fecha_creacion?: SortOrder
    estado?: SortOrder
    notas?: SortOrderInput | SortOrder
    detalles?: ComparativaDetalleOrderByRelationAggregateInput
  }

  export type CuadroComparativoWhereUniqueInput = Prisma.AtLeast<{
    id_cuadro?: string
    tenant_id_codigo?: CuadroComparativoTenant_idCodigoCompoundUniqueInput
    AND?: CuadroComparativoWhereInput | CuadroComparativoWhereInput[]
    OR?: CuadroComparativoWhereInput[]
    NOT?: CuadroComparativoWhereInput | CuadroComparativoWhereInput[]
    tenant_id?: UuidFilter<"CuadroComparativo"> | string
    proyecto_id?: UuidFilter<"CuadroComparativo"> | string
    requisicion_id?: UuidFilter<"CuadroComparativo"> | string
    codigo?: StringFilter<"CuadroComparativo"> | string
    fecha_creacion?: DateTimeFilter<"CuadroComparativo"> | Date | string
    estado?: StringFilter<"CuadroComparativo"> | string
    notas?: StringNullableFilter<"CuadroComparativo"> | string | null
    detalles?: ComparativaDetalleListRelationFilter
  }, "id_cuadro" | "tenant_id_codigo">

  export type CuadroComparativoOrderByWithAggregationInput = {
    id_cuadro?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    requisicion_id?: SortOrder
    codigo?: SortOrder
    fecha_creacion?: SortOrder
    estado?: SortOrder
    notas?: SortOrderInput | SortOrder
    _count?: CuadroComparativoCountOrderByAggregateInput
    _max?: CuadroComparativoMaxOrderByAggregateInput
    _min?: CuadroComparativoMinOrderByAggregateInput
  }

  export type CuadroComparativoScalarWhereWithAggregatesInput = {
    AND?: CuadroComparativoScalarWhereWithAggregatesInput | CuadroComparativoScalarWhereWithAggregatesInput[]
    OR?: CuadroComparativoScalarWhereWithAggregatesInput[]
    NOT?: CuadroComparativoScalarWhereWithAggregatesInput | CuadroComparativoScalarWhereWithAggregatesInput[]
    id_cuadro?: UuidWithAggregatesFilter<"CuadroComparativo"> | string
    tenant_id?: UuidWithAggregatesFilter<"CuadroComparativo"> | string
    proyecto_id?: UuidWithAggregatesFilter<"CuadroComparativo"> | string
    requisicion_id?: UuidWithAggregatesFilter<"CuadroComparativo"> | string
    codigo?: StringWithAggregatesFilter<"CuadroComparativo"> | string
    fecha_creacion?: DateTimeWithAggregatesFilter<"CuadroComparativo"> | Date | string
    estado?: StringWithAggregatesFilter<"CuadroComparativo"> | string
    notas?: StringNullableWithAggregatesFilter<"CuadroComparativo"> | string | null
  }

  export type ComparativaDetalleWhereInput = {
    AND?: ComparativaDetalleWhereInput | ComparativaDetalleWhereInput[]
    OR?: ComparativaDetalleWhereInput[]
    NOT?: ComparativaDetalleWhereInput | ComparativaDetalleWhereInput[]
    id_detalle?: UuidFilter<"ComparativaDetalle"> | string
    tenant_id?: UuidFilter<"ComparativaDetalle"> | string
    proyecto_id?: UuidFilter<"ComparativaDetalle"> | string
    cuadro_id?: UuidFilter<"ComparativaDetalle"> | string
    proveedor_id?: UuidFilter<"ComparativaDetalle"> | string
    insumo_id?: UuidFilter<"ComparativaDetalle"> | string
    precio_ofertado?: DecimalFilter<"ComparativaDetalle"> | Decimal | DecimalJsLike | number | string
    tiempo_entrega?: StringNullableFilter<"ComparativaDetalle"> | string | null
    es_ganador?: BoolFilter<"ComparativaDetalle"> | boolean
    cuadro?: XOR<CuadroComparativoRelationFilter, CuadroComparativoWhereInput>
    proveedor?: XOR<ProveedorRelationFilter, ProveedorWhereInput>
  }

  export type ComparativaDetalleOrderByWithRelationInput = {
    id_detalle?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    cuadro_id?: SortOrder
    proveedor_id?: SortOrder
    insumo_id?: SortOrder
    precio_ofertado?: SortOrder
    tiempo_entrega?: SortOrderInput | SortOrder
    es_ganador?: SortOrder
    cuadro?: CuadroComparativoOrderByWithRelationInput
    proveedor?: ProveedorOrderByWithRelationInput
  }

  export type ComparativaDetalleWhereUniqueInput = Prisma.AtLeast<{
    id_detalle?: string
    AND?: ComparativaDetalleWhereInput | ComparativaDetalleWhereInput[]
    OR?: ComparativaDetalleWhereInput[]
    NOT?: ComparativaDetalleWhereInput | ComparativaDetalleWhereInput[]
    tenant_id?: UuidFilter<"ComparativaDetalle"> | string
    proyecto_id?: UuidFilter<"ComparativaDetalle"> | string
    cuadro_id?: UuidFilter<"ComparativaDetalle"> | string
    proveedor_id?: UuidFilter<"ComparativaDetalle"> | string
    insumo_id?: UuidFilter<"ComparativaDetalle"> | string
    precio_ofertado?: DecimalFilter<"ComparativaDetalle"> | Decimal | DecimalJsLike | number | string
    tiempo_entrega?: StringNullableFilter<"ComparativaDetalle"> | string | null
    es_ganador?: BoolFilter<"ComparativaDetalle"> | boolean
    cuadro?: XOR<CuadroComparativoRelationFilter, CuadroComparativoWhereInput>
    proveedor?: XOR<ProveedorRelationFilter, ProveedorWhereInput>
  }, "id_detalle">

  export type ComparativaDetalleOrderByWithAggregationInput = {
    id_detalle?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    cuadro_id?: SortOrder
    proveedor_id?: SortOrder
    insumo_id?: SortOrder
    precio_ofertado?: SortOrder
    tiempo_entrega?: SortOrderInput | SortOrder
    es_ganador?: SortOrder
    _count?: ComparativaDetalleCountOrderByAggregateInput
    _avg?: ComparativaDetalleAvgOrderByAggregateInput
    _max?: ComparativaDetalleMaxOrderByAggregateInput
    _min?: ComparativaDetalleMinOrderByAggregateInput
    _sum?: ComparativaDetalleSumOrderByAggregateInput
  }

  export type ComparativaDetalleScalarWhereWithAggregatesInput = {
    AND?: ComparativaDetalleScalarWhereWithAggregatesInput | ComparativaDetalleScalarWhereWithAggregatesInput[]
    OR?: ComparativaDetalleScalarWhereWithAggregatesInput[]
    NOT?: ComparativaDetalleScalarWhereWithAggregatesInput | ComparativaDetalleScalarWhereWithAggregatesInput[]
    id_detalle?: UuidWithAggregatesFilter<"ComparativaDetalle"> | string
    tenant_id?: UuidWithAggregatesFilter<"ComparativaDetalle"> | string
    proyecto_id?: UuidWithAggregatesFilter<"ComparativaDetalle"> | string
    cuadro_id?: UuidWithAggregatesFilter<"ComparativaDetalle"> | string
    proveedor_id?: UuidWithAggregatesFilter<"ComparativaDetalle"> | string
    insumo_id?: UuidWithAggregatesFilter<"ComparativaDetalle"> | string
    precio_ofertado?: DecimalWithAggregatesFilter<"ComparativaDetalle"> | Decimal | DecimalJsLike | number | string
    tiempo_entrega?: StringNullableWithAggregatesFilter<"ComparativaDetalle"> | string | null
    es_ganador?: BoolWithAggregatesFilter<"ComparativaDetalle"> | boolean
  }

  export type ProveedorCreateInput = {
    id_proveedor?: string
    tenant_id: string
    rfc_tax_id: string
    razon_social: string
    email_contacto?: string | null
    telefono?: string | null
    estatus?: string
    ordenes?: OrdenCompraCreateNestedManyWithoutProveedorInput
    comparativas?: ComparativaDetalleCreateNestedManyWithoutProveedorInput
  }

  export type ProveedorUncheckedCreateInput = {
    id_proveedor?: string
    tenant_id: string
    rfc_tax_id: string
    razon_social: string
    email_contacto?: string | null
    telefono?: string | null
    estatus?: string
    ordenes?: OrdenCompraUncheckedCreateNestedManyWithoutProveedorInput
    comparativas?: ComparativaDetalleUncheckedCreateNestedManyWithoutProveedorInput
  }

  export type ProveedorUpdateInput = {
    id_proveedor?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    rfc_tax_id?: StringFieldUpdateOperationsInput | string
    razon_social?: StringFieldUpdateOperationsInput | string
    email_contacto?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    estatus?: StringFieldUpdateOperationsInput | string
    ordenes?: OrdenCompraUpdateManyWithoutProveedorNestedInput
    comparativas?: ComparativaDetalleUpdateManyWithoutProveedorNestedInput
  }

  export type ProveedorUncheckedUpdateInput = {
    id_proveedor?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    rfc_tax_id?: StringFieldUpdateOperationsInput | string
    razon_social?: StringFieldUpdateOperationsInput | string
    email_contacto?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    estatus?: StringFieldUpdateOperationsInput | string
    ordenes?: OrdenCompraUncheckedUpdateManyWithoutProveedorNestedInput
    comparativas?: ComparativaDetalleUncheckedUpdateManyWithoutProveedorNestedInput
  }

  export type ProveedorCreateManyInput = {
    id_proveedor?: string
    tenant_id: string
    rfc_tax_id: string
    razon_social: string
    email_contacto?: string | null
    telefono?: string | null
    estatus?: string
  }

  export type ProveedorUpdateManyMutationInput = {
    id_proveedor?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    rfc_tax_id?: StringFieldUpdateOperationsInput | string
    razon_social?: StringFieldUpdateOperationsInput | string
    email_contacto?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    estatus?: StringFieldUpdateOperationsInput | string
  }

  export type ProveedorUncheckedUpdateManyInput = {
    id_proveedor?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    rfc_tax_id?: StringFieldUpdateOperationsInput | string
    razon_social?: StringFieldUpdateOperationsInput | string
    email_contacto?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    estatus?: StringFieldUpdateOperationsInput | string
  }

  export type RequisicionCreateInput = {
    id_requisicion?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    fecha_solicitud?: Date | string
    solicitante_id: string
    prioridad?: string
    estado?: string
    observaciones?: string | null
    items?: RequisicionItemCreateNestedManyWithoutRequisicionInput
  }

  export type RequisicionUncheckedCreateInput = {
    id_requisicion?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    fecha_solicitud?: Date | string
    solicitante_id: string
    prioridad?: string
    estado?: string
    observaciones?: string | null
    items?: RequisicionItemUncheckedCreateNestedManyWithoutRequisicionInput
  }

  export type RequisicionUpdateInput = {
    id_requisicion?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    fecha_solicitud?: DateTimeFieldUpdateOperationsInput | Date | string
    solicitante_id?: StringFieldUpdateOperationsInput | string
    prioridad?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    items?: RequisicionItemUpdateManyWithoutRequisicionNestedInput
  }

  export type RequisicionUncheckedUpdateInput = {
    id_requisicion?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    fecha_solicitud?: DateTimeFieldUpdateOperationsInput | Date | string
    solicitante_id?: StringFieldUpdateOperationsInput | string
    prioridad?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    items?: RequisicionItemUncheckedUpdateManyWithoutRequisicionNestedInput
  }

  export type RequisicionCreateManyInput = {
    id_requisicion?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    fecha_solicitud?: Date | string
    solicitante_id: string
    prioridad?: string
    estado?: string
    observaciones?: string | null
  }

  export type RequisicionUpdateManyMutationInput = {
    id_requisicion?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    fecha_solicitud?: DateTimeFieldUpdateOperationsInput | Date | string
    solicitante_id?: StringFieldUpdateOperationsInput | string
    prioridad?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RequisicionUncheckedUpdateManyInput = {
    id_requisicion?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    fecha_solicitud?: DateTimeFieldUpdateOperationsInput | Date | string
    solicitante_id?: StringFieldUpdateOperationsInput | string
    prioridad?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RequisicionItemCreateInput = {
    id_item?: string
    tenant_id: string
    proyecto_id: string
    insumo_id: string
    cantidad: Decimal | DecimalJsLike | number | string
    notas?: string | null
    requisicion: RequisicionCreateNestedOneWithoutItemsInput
  }

  export type RequisicionItemUncheckedCreateInput = {
    id_item?: string
    tenant_id: string
    proyecto_id: string
    requisicion_id: string
    insumo_id: string
    cantidad: Decimal | DecimalJsLike | number | string
    notas?: string | null
  }

  export type RequisicionItemUpdateInput = {
    id_item?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    insumo_id?: StringFieldUpdateOperationsInput | string
    cantidad?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    requisicion?: RequisicionUpdateOneRequiredWithoutItemsNestedInput
  }

  export type RequisicionItemUncheckedUpdateInput = {
    id_item?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    requisicion_id?: StringFieldUpdateOperationsInput | string
    insumo_id?: StringFieldUpdateOperationsInput | string
    cantidad?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RequisicionItemCreateManyInput = {
    id_item?: string
    tenant_id: string
    proyecto_id: string
    requisicion_id: string
    insumo_id: string
    cantidad: Decimal | DecimalJsLike | number | string
    notas?: string | null
  }

  export type RequisicionItemUpdateManyMutationInput = {
    id_item?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    insumo_id?: StringFieldUpdateOperationsInput | string
    cantidad?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RequisicionItemUncheckedUpdateManyInput = {
    id_item?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    requisicion_id?: StringFieldUpdateOperationsInput | string
    insumo_id?: StringFieldUpdateOperationsInput | string
    cantidad?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type OrdenCompraCreateInput = {
    id_orden?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    fecha_emision?: Date | string
    estado?: string
    moneda?: string
    tipo_cambio?: Decimal | DecimalJsLike | number | string
    subtotal: Decimal | DecimalJsLike | number | string
    iva: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
    presupuesto_id?: string | null
    proveedor: ProveedorCreateNestedOneWithoutOrdenesInput
    items?: OrdenCompraItemCreateNestedManyWithoutOrdenInput
  }

  export type OrdenCompraUncheckedCreateInput = {
    id_orden?: string
    tenant_id: string
    proyecto_id: string
    proveedor_id: string
    codigo: string
    fecha_emision?: Date | string
    estado?: string
    moneda?: string
    tipo_cambio?: Decimal | DecimalJsLike | number | string
    subtotal: Decimal | DecimalJsLike | number | string
    iva: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
    presupuesto_id?: string | null
    items?: OrdenCompraItemUncheckedCreateNestedManyWithoutOrdenInput
  }

  export type OrdenCompraUpdateInput = {
    id_orden?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    fecha_emision?: DateTimeFieldUpdateOperationsInput | Date | string
    estado?: StringFieldUpdateOperationsInput | string
    moneda?: StringFieldUpdateOperationsInput | string
    tipo_cambio?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    iva?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    presupuesto_id?: NullableStringFieldUpdateOperationsInput | string | null
    proveedor?: ProveedorUpdateOneRequiredWithoutOrdenesNestedInput
    items?: OrdenCompraItemUpdateManyWithoutOrdenNestedInput
  }

  export type OrdenCompraUncheckedUpdateInput = {
    id_orden?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    proveedor_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    fecha_emision?: DateTimeFieldUpdateOperationsInput | Date | string
    estado?: StringFieldUpdateOperationsInput | string
    moneda?: StringFieldUpdateOperationsInput | string
    tipo_cambio?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    iva?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    presupuesto_id?: NullableStringFieldUpdateOperationsInput | string | null
    items?: OrdenCompraItemUncheckedUpdateManyWithoutOrdenNestedInput
  }

  export type OrdenCompraCreateManyInput = {
    id_orden?: string
    tenant_id: string
    proyecto_id: string
    proveedor_id: string
    codigo: string
    fecha_emision?: Date | string
    estado?: string
    moneda?: string
    tipo_cambio?: Decimal | DecimalJsLike | number | string
    subtotal: Decimal | DecimalJsLike | number | string
    iva: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
    presupuesto_id?: string | null
  }

  export type OrdenCompraUpdateManyMutationInput = {
    id_orden?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    fecha_emision?: DateTimeFieldUpdateOperationsInput | Date | string
    estado?: StringFieldUpdateOperationsInput | string
    moneda?: StringFieldUpdateOperationsInput | string
    tipo_cambio?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    iva?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    presupuesto_id?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type OrdenCompraUncheckedUpdateManyInput = {
    id_orden?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    proveedor_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    fecha_emision?: DateTimeFieldUpdateOperationsInput | Date | string
    estado?: StringFieldUpdateOperationsInput | string
    moneda?: StringFieldUpdateOperationsInput | string
    tipo_cambio?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    iva?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    presupuesto_id?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type OrdenCompraItemCreateInput = {
    id_item?: string
    tenant_id: string
    proyecto_id: string
    insumo_id: string
    cantidad: Decimal | DecimalJsLike | number | string
    precio_unitario: Decimal | DecimalJsLike | number | string
    importe: Decimal | DecimalJsLike | number | string
    orden: OrdenCompraCreateNestedOneWithoutItemsInput
  }

  export type OrdenCompraItemUncheckedCreateInput = {
    id_item?: string
    tenant_id: string
    proyecto_id: string
    orden_id: string
    insumo_id: string
    cantidad: Decimal | DecimalJsLike | number | string
    precio_unitario: Decimal | DecimalJsLike | number | string
    importe: Decimal | DecimalJsLike | number | string
  }

  export type OrdenCompraItemUpdateInput = {
    id_item?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    insumo_id?: StringFieldUpdateOperationsInput | string
    cantidad?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    precio_unitario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    importe?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    orden?: OrdenCompraUpdateOneRequiredWithoutItemsNestedInput
  }

  export type OrdenCompraItemUncheckedUpdateInput = {
    id_item?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    orden_id?: StringFieldUpdateOperationsInput | string
    insumo_id?: StringFieldUpdateOperationsInput | string
    cantidad?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    precio_unitario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    importe?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
  }

  export type OrdenCompraItemCreateManyInput = {
    id_item?: string
    tenant_id: string
    proyecto_id: string
    orden_id: string
    insumo_id: string
    cantidad: Decimal | DecimalJsLike | number | string
    precio_unitario: Decimal | DecimalJsLike | number | string
    importe: Decimal | DecimalJsLike | number | string
  }

  export type OrdenCompraItemUpdateManyMutationInput = {
    id_item?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    insumo_id?: StringFieldUpdateOperationsInput | string
    cantidad?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    precio_unitario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    importe?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
  }

  export type OrdenCompraItemUncheckedUpdateManyInput = {
    id_item?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    orden_id?: StringFieldUpdateOperationsInput | string
    insumo_id?: StringFieldUpdateOperationsInput | string
    cantidad?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    precio_unitario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    importe?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
  }

  export type CuadroComparativoCreateInput = {
    id_cuadro?: string
    tenant_id: string
    proyecto_id: string
    requisicion_id: string
    codigo: string
    fecha_creacion?: Date | string
    estado?: string
    notas?: string | null
    detalles?: ComparativaDetalleCreateNestedManyWithoutCuadroInput
  }

  export type CuadroComparativoUncheckedCreateInput = {
    id_cuadro?: string
    tenant_id: string
    proyecto_id: string
    requisicion_id: string
    codigo: string
    fecha_creacion?: Date | string
    estado?: string
    notas?: string | null
    detalles?: ComparativaDetalleUncheckedCreateNestedManyWithoutCuadroInput
  }

  export type CuadroComparativoUpdateInput = {
    id_cuadro?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    requisicion_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    fecha_creacion?: DateTimeFieldUpdateOperationsInput | Date | string
    estado?: StringFieldUpdateOperationsInput | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    detalles?: ComparativaDetalleUpdateManyWithoutCuadroNestedInput
  }

  export type CuadroComparativoUncheckedUpdateInput = {
    id_cuadro?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    requisicion_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    fecha_creacion?: DateTimeFieldUpdateOperationsInput | Date | string
    estado?: StringFieldUpdateOperationsInput | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    detalles?: ComparativaDetalleUncheckedUpdateManyWithoutCuadroNestedInput
  }

  export type CuadroComparativoCreateManyInput = {
    id_cuadro?: string
    tenant_id: string
    proyecto_id: string
    requisicion_id: string
    codigo: string
    fecha_creacion?: Date | string
    estado?: string
    notas?: string | null
  }

  export type CuadroComparativoUpdateManyMutationInput = {
    id_cuadro?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    requisicion_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    fecha_creacion?: DateTimeFieldUpdateOperationsInput | Date | string
    estado?: StringFieldUpdateOperationsInput | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type CuadroComparativoUncheckedUpdateManyInput = {
    id_cuadro?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    requisicion_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    fecha_creacion?: DateTimeFieldUpdateOperationsInput | Date | string
    estado?: StringFieldUpdateOperationsInput | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ComparativaDetalleCreateInput = {
    id_detalle?: string
    tenant_id: string
    proyecto_id: string
    insumo_id: string
    precio_ofertado: Decimal | DecimalJsLike | number | string
    tiempo_entrega?: string | null
    es_ganador?: boolean
    cuadro: CuadroComparativoCreateNestedOneWithoutDetallesInput
    proveedor: ProveedorCreateNestedOneWithoutComparativasInput
  }

  export type ComparativaDetalleUncheckedCreateInput = {
    id_detalle?: string
    tenant_id: string
    proyecto_id: string
    cuadro_id: string
    proveedor_id: string
    insumo_id: string
    precio_ofertado: Decimal | DecimalJsLike | number | string
    tiempo_entrega?: string | null
    es_ganador?: boolean
  }

  export type ComparativaDetalleUpdateInput = {
    id_detalle?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    insumo_id?: StringFieldUpdateOperationsInput | string
    precio_ofertado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tiempo_entrega?: NullableStringFieldUpdateOperationsInput | string | null
    es_ganador?: BoolFieldUpdateOperationsInput | boolean
    cuadro?: CuadroComparativoUpdateOneRequiredWithoutDetallesNestedInput
    proveedor?: ProveedorUpdateOneRequiredWithoutComparativasNestedInput
  }

  export type ComparativaDetalleUncheckedUpdateInput = {
    id_detalle?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    cuadro_id?: StringFieldUpdateOperationsInput | string
    proveedor_id?: StringFieldUpdateOperationsInput | string
    insumo_id?: StringFieldUpdateOperationsInput | string
    precio_ofertado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tiempo_entrega?: NullableStringFieldUpdateOperationsInput | string | null
    es_ganador?: BoolFieldUpdateOperationsInput | boolean
  }

  export type ComparativaDetalleCreateManyInput = {
    id_detalle?: string
    tenant_id: string
    proyecto_id: string
    cuadro_id: string
    proveedor_id: string
    insumo_id: string
    precio_ofertado: Decimal | DecimalJsLike | number | string
    tiempo_entrega?: string | null
    es_ganador?: boolean
  }

  export type ComparativaDetalleUpdateManyMutationInput = {
    id_detalle?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    insumo_id?: StringFieldUpdateOperationsInput | string
    precio_ofertado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tiempo_entrega?: NullableStringFieldUpdateOperationsInput | string | null
    es_ganador?: BoolFieldUpdateOperationsInput | boolean
  }

  export type ComparativaDetalleUncheckedUpdateManyInput = {
    id_detalle?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    cuadro_id?: StringFieldUpdateOperationsInput | string
    proveedor_id?: StringFieldUpdateOperationsInput | string
    insumo_id?: StringFieldUpdateOperationsInput | string
    precio_ofertado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tiempo_entrega?: NullableStringFieldUpdateOperationsInput | string | null
    es_ganador?: BoolFieldUpdateOperationsInput | boolean
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

  export type OrdenCompraListRelationFilter = {
    every?: OrdenCompraWhereInput
    some?: OrdenCompraWhereInput
    none?: OrdenCompraWhereInput
  }

  export type ComparativaDetalleListRelationFilter = {
    every?: ComparativaDetalleWhereInput
    some?: ComparativaDetalleWhereInput
    none?: ComparativaDetalleWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type OrdenCompraOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ComparativaDetalleOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ProveedorTenant_idRfc_tax_idCompoundUniqueInput = {
    tenant_id: string
    rfc_tax_id: string
  }

  export type ProveedorCountOrderByAggregateInput = {
    id_proveedor?: SortOrder
    tenant_id?: SortOrder
    rfc_tax_id?: SortOrder
    razon_social?: SortOrder
    email_contacto?: SortOrder
    telefono?: SortOrder
    estatus?: SortOrder
  }

  export type ProveedorMaxOrderByAggregateInput = {
    id_proveedor?: SortOrder
    tenant_id?: SortOrder
    rfc_tax_id?: SortOrder
    razon_social?: SortOrder
    email_contacto?: SortOrder
    telefono?: SortOrder
    estatus?: SortOrder
  }

  export type ProveedorMinOrderByAggregateInput = {
    id_proveedor?: SortOrder
    tenant_id?: SortOrder
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

  export type RequisicionItemListRelationFilter = {
    every?: RequisicionItemWhereInput
    some?: RequisicionItemWhereInput
    none?: RequisicionItemWhereInput
  }

  export type RequisicionItemOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type RequisicionTenant_idCodigoCompoundUniqueInput = {
    tenant_id: string
    codigo: string
  }

  export type RequisicionCountOrderByAggregateInput = {
    id_requisicion?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    codigo?: SortOrder
    fecha_solicitud?: SortOrder
    solicitante_id?: SortOrder
    prioridad?: SortOrder
    estado?: SortOrder
    observaciones?: SortOrder
  }

  export type RequisicionMaxOrderByAggregateInput = {
    id_requisicion?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    codigo?: SortOrder
    fecha_solicitud?: SortOrder
    solicitante_id?: SortOrder
    prioridad?: SortOrder
    estado?: SortOrder
    observaciones?: SortOrder
  }

  export type RequisicionMinOrderByAggregateInput = {
    id_requisicion?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    codigo?: SortOrder
    fecha_solicitud?: SortOrder
    solicitante_id?: SortOrder
    prioridad?: SortOrder
    estado?: SortOrder
    observaciones?: SortOrder
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

  export type RequisicionRelationFilter = {
    is?: RequisicionWhereInput
    isNot?: RequisicionWhereInput
  }

  export type RequisicionItemCountOrderByAggregateInput = {
    id_item?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    requisicion_id?: SortOrder
    insumo_id?: SortOrder
    cantidad?: SortOrder
    notas?: SortOrder
  }

  export type RequisicionItemAvgOrderByAggregateInput = {
    cantidad?: SortOrder
  }

  export type RequisicionItemMaxOrderByAggregateInput = {
    id_item?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    requisicion_id?: SortOrder
    insumo_id?: SortOrder
    cantidad?: SortOrder
    notas?: SortOrder
  }

  export type RequisicionItemMinOrderByAggregateInput = {
    id_item?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    requisicion_id?: SortOrder
    insumo_id?: SortOrder
    cantidad?: SortOrder
    notas?: SortOrder
  }

  export type RequisicionItemSumOrderByAggregateInput = {
    cantidad?: SortOrder
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

  export type ProveedorRelationFilter = {
    is?: ProveedorWhereInput
    isNot?: ProveedorWhereInput
  }

  export type OrdenCompraItemListRelationFilter = {
    every?: OrdenCompraItemWhereInput
    some?: OrdenCompraItemWhereInput
    none?: OrdenCompraItemWhereInput
  }

  export type OrdenCompraItemOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OrdenCompraTenant_idCodigoCompoundUniqueInput = {
    tenant_id: string
    codigo: string
  }

  export type OrdenCompraCountOrderByAggregateInput = {
    id_orden?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    proveedor_id?: SortOrder
    codigo?: SortOrder
    fecha_emision?: SortOrder
    estado?: SortOrder
    moneda?: SortOrder
    tipo_cambio?: SortOrder
    subtotal?: SortOrder
    iva?: SortOrder
    total?: SortOrder
    presupuesto_id?: SortOrder
  }

  export type OrdenCompraAvgOrderByAggregateInput = {
    tipo_cambio?: SortOrder
    subtotal?: SortOrder
    iva?: SortOrder
    total?: SortOrder
  }

  export type OrdenCompraMaxOrderByAggregateInput = {
    id_orden?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    proveedor_id?: SortOrder
    codigo?: SortOrder
    fecha_emision?: SortOrder
    estado?: SortOrder
    moneda?: SortOrder
    tipo_cambio?: SortOrder
    subtotal?: SortOrder
    iva?: SortOrder
    total?: SortOrder
    presupuesto_id?: SortOrder
  }

  export type OrdenCompraMinOrderByAggregateInput = {
    id_orden?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    proveedor_id?: SortOrder
    codigo?: SortOrder
    fecha_emision?: SortOrder
    estado?: SortOrder
    moneda?: SortOrder
    tipo_cambio?: SortOrder
    subtotal?: SortOrder
    iva?: SortOrder
    total?: SortOrder
    presupuesto_id?: SortOrder
  }

  export type OrdenCompraSumOrderByAggregateInput = {
    tipo_cambio?: SortOrder
    subtotal?: SortOrder
    iva?: SortOrder
    total?: SortOrder
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

  export type OrdenCompraRelationFilter = {
    is?: OrdenCompraWhereInput
    isNot?: OrdenCompraWhereInput
  }

  export type OrdenCompraItemCountOrderByAggregateInput = {
    id_item?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    orden_id?: SortOrder
    insumo_id?: SortOrder
    cantidad?: SortOrder
    precio_unitario?: SortOrder
    importe?: SortOrder
  }

  export type OrdenCompraItemAvgOrderByAggregateInput = {
    cantidad?: SortOrder
    precio_unitario?: SortOrder
    importe?: SortOrder
  }

  export type OrdenCompraItemMaxOrderByAggregateInput = {
    id_item?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    orden_id?: SortOrder
    insumo_id?: SortOrder
    cantidad?: SortOrder
    precio_unitario?: SortOrder
    importe?: SortOrder
  }

  export type OrdenCompraItemMinOrderByAggregateInput = {
    id_item?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    orden_id?: SortOrder
    insumo_id?: SortOrder
    cantidad?: SortOrder
    precio_unitario?: SortOrder
    importe?: SortOrder
  }

  export type OrdenCompraItemSumOrderByAggregateInput = {
    cantidad?: SortOrder
    precio_unitario?: SortOrder
    importe?: SortOrder
  }

  export type CuadroComparativoTenant_idCodigoCompoundUniqueInput = {
    tenant_id: string
    codigo: string
  }

  export type CuadroComparativoCountOrderByAggregateInput = {
    id_cuadro?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    requisicion_id?: SortOrder
    codigo?: SortOrder
    fecha_creacion?: SortOrder
    estado?: SortOrder
    notas?: SortOrder
  }

  export type CuadroComparativoMaxOrderByAggregateInput = {
    id_cuadro?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    requisicion_id?: SortOrder
    codigo?: SortOrder
    fecha_creacion?: SortOrder
    estado?: SortOrder
    notas?: SortOrder
  }

  export type CuadroComparativoMinOrderByAggregateInput = {
    id_cuadro?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    requisicion_id?: SortOrder
    codigo?: SortOrder
    fecha_creacion?: SortOrder
    estado?: SortOrder
    notas?: SortOrder
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type CuadroComparativoRelationFilter = {
    is?: CuadroComparativoWhereInput
    isNot?: CuadroComparativoWhereInput
  }

  export type ComparativaDetalleCountOrderByAggregateInput = {
    id_detalle?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    cuadro_id?: SortOrder
    proveedor_id?: SortOrder
    insumo_id?: SortOrder
    precio_ofertado?: SortOrder
    tiempo_entrega?: SortOrder
    es_ganador?: SortOrder
  }

  export type ComparativaDetalleAvgOrderByAggregateInput = {
    precio_ofertado?: SortOrder
  }

  export type ComparativaDetalleMaxOrderByAggregateInput = {
    id_detalle?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    cuadro_id?: SortOrder
    proveedor_id?: SortOrder
    insumo_id?: SortOrder
    precio_ofertado?: SortOrder
    tiempo_entrega?: SortOrder
    es_ganador?: SortOrder
  }

  export type ComparativaDetalleMinOrderByAggregateInput = {
    id_detalle?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    cuadro_id?: SortOrder
    proveedor_id?: SortOrder
    insumo_id?: SortOrder
    precio_ofertado?: SortOrder
    tiempo_entrega?: SortOrder
    es_ganador?: SortOrder
  }

  export type ComparativaDetalleSumOrderByAggregateInput = {
    precio_ofertado?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type OrdenCompraCreateNestedManyWithoutProveedorInput = {
    create?: XOR<OrdenCompraCreateWithoutProveedorInput, OrdenCompraUncheckedCreateWithoutProveedorInput> | OrdenCompraCreateWithoutProveedorInput[] | OrdenCompraUncheckedCreateWithoutProveedorInput[]
    connectOrCreate?: OrdenCompraCreateOrConnectWithoutProveedorInput | OrdenCompraCreateOrConnectWithoutProveedorInput[]
    createMany?: OrdenCompraCreateManyProveedorInputEnvelope
    connect?: OrdenCompraWhereUniqueInput | OrdenCompraWhereUniqueInput[]
  }

  export type ComparativaDetalleCreateNestedManyWithoutProveedorInput = {
    create?: XOR<ComparativaDetalleCreateWithoutProveedorInput, ComparativaDetalleUncheckedCreateWithoutProveedorInput> | ComparativaDetalleCreateWithoutProveedorInput[] | ComparativaDetalleUncheckedCreateWithoutProveedorInput[]
    connectOrCreate?: ComparativaDetalleCreateOrConnectWithoutProveedorInput | ComparativaDetalleCreateOrConnectWithoutProveedorInput[]
    createMany?: ComparativaDetalleCreateManyProveedorInputEnvelope
    connect?: ComparativaDetalleWhereUniqueInput | ComparativaDetalleWhereUniqueInput[]
  }

  export type OrdenCompraUncheckedCreateNestedManyWithoutProveedorInput = {
    create?: XOR<OrdenCompraCreateWithoutProveedorInput, OrdenCompraUncheckedCreateWithoutProveedorInput> | OrdenCompraCreateWithoutProveedorInput[] | OrdenCompraUncheckedCreateWithoutProveedorInput[]
    connectOrCreate?: OrdenCompraCreateOrConnectWithoutProveedorInput | OrdenCompraCreateOrConnectWithoutProveedorInput[]
    createMany?: OrdenCompraCreateManyProveedorInputEnvelope
    connect?: OrdenCompraWhereUniqueInput | OrdenCompraWhereUniqueInput[]
  }

  export type ComparativaDetalleUncheckedCreateNestedManyWithoutProveedorInput = {
    create?: XOR<ComparativaDetalleCreateWithoutProveedorInput, ComparativaDetalleUncheckedCreateWithoutProveedorInput> | ComparativaDetalleCreateWithoutProveedorInput[] | ComparativaDetalleUncheckedCreateWithoutProveedorInput[]
    connectOrCreate?: ComparativaDetalleCreateOrConnectWithoutProveedorInput | ComparativaDetalleCreateOrConnectWithoutProveedorInput[]
    createMany?: ComparativaDetalleCreateManyProveedorInputEnvelope
    connect?: ComparativaDetalleWhereUniqueInput | ComparativaDetalleWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type OrdenCompraUpdateManyWithoutProveedorNestedInput = {
    create?: XOR<OrdenCompraCreateWithoutProveedorInput, OrdenCompraUncheckedCreateWithoutProveedorInput> | OrdenCompraCreateWithoutProveedorInput[] | OrdenCompraUncheckedCreateWithoutProveedorInput[]
    connectOrCreate?: OrdenCompraCreateOrConnectWithoutProveedorInput | OrdenCompraCreateOrConnectWithoutProveedorInput[]
    upsert?: OrdenCompraUpsertWithWhereUniqueWithoutProveedorInput | OrdenCompraUpsertWithWhereUniqueWithoutProveedorInput[]
    createMany?: OrdenCompraCreateManyProveedorInputEnvelope
    set?: OrdenCompraWhereUniqueInput | OrdenCompraWhereUniqueInput[]
    disconnect?: OrdenCompraWhereUniqueInput | OrdenCompraWhereUniqueInput[]
    delete?: OrdenCompraWhereUniqueInput | OrdenCompraWhereUniqueInput[]
    connect?: OrdenCompraWhereUniqueInput | OrdenCompraWhereUniqueInput[]
    update?: OrdenCompraUpdateWithWhereUniqueWithoutProveedorInput | OrdenCompraUpdateWithWhereUniqueWithoutProveedorInput[]
    updateMany?: OrdenCompraUpdateManyWithWhereWithoutProveedorInput | OrdenCompraUpdateManyWithWhereWithoutProveedorInput[]
    deleteMany?: OrdenCompraScalarWhereInput | OrdenCompraScalarWhereInput[]
  }

  export type ComparativaDetalleUpdateManyWithoutProveedorNestedInput = {
    create?: XOR<ComparativaDetalleCreateWithoutProveedorInput, ComparativaDetalleUncheckedCreateWithoutProveedorInput> | ComparativaDetalleCreateWithoutProveedorInput[] | ComparativaDetalleUncheckedCreateWithoutProveedorInput[]
    connectOrCreate?: ComparativaDetalleCreateOrConnectWithoutProveedorInput | ComparativaDetalleCreateOrConnectWithoutProveedorInput[]
    upsert?: ComparativaDetalleUpsertWithWhereUniqueWithoutProveedorInput | ComparativaDetalleUpsertWithWhereUniqueWithoutProveedorInput[]
    createMany?: ComparativaDetalleCreateManyProveedorInputEnvelope
    set?: ComparativaDetalleWhereUniqueInput | ComparativaDetalleWhereUniqueInput[]
    disconnect?: ComparativaDetalleWhereUniqueInput | ComparativaDetalleWhereUniqueInput[]
    delete?: ComparativaDetalleWhereUniqueInput | ComparativaDetalleWhereUniqueInput[]
    connect?: ComparativaDetalleWhereUniqueInput | ComparativaDetalleWhereUniqueInput[]
    update?: ComparativaDetalleUpdateWithWhereUniqueWithoutProveedorInput | ComparativaDetalleUpdateWithWhereUniqueWithoutProveedorInput[]
    updateMany?: ComparativaDetalleUpdateManyWithWhereWithoutProveedorInput | ComparativaDetalleUpdateManyWithWhereWithoutProveedorInput[]
    deleteMany?: ComparativaDetalleScalarWhereInput | ComparativaDetalleScalarWhereInput[]
  }

  export type OrdenCompraUncheckedUpdateManyWithoutProveedorNestedInput = {
    create?: XOR<OrdenCompraCreateWithoutProveedorInput, OrdenCompraUncheckedCreateWithoutProveedorInput> | OrdenCompraCreateWithoutProveedorInput[] | OrdenCompraUncheckedCreateWithoutProveedorInput[]
    connectOrCreate?: OrdenCompraCreateOrConnectWithoutProveedorInput | OrdenCompraCreateOrConnectWithoutProveedorInput[]
    upsert?: OrdenCompraUpsertWithWhereUniqueWithoutProveedorInput | OrdenCompraUpsertWithWhereUniqueWithoutProveedorInput[]
    createMany?: OrdenCompraCreateManyProveedorInputEnvelope
    set?: OrdenCompraWhereUniqueInput | OrdenCompraWhereUniqueInput[]
    disconnect?: OrdenCompraWhereUniqueInput | OrdenCompraWhereUniqueInput[]
    delete?: OrdenCompraWhereUniqueInput | OrdenCompraWhereUniqueInput[]
    connect?: OrdenCompraWhereUniqueInput | OrdenCompraWhereUniqueInput[]
    update?: OrdenCompraUpdateWithWhereUniqueWithoutProveedorInput | OrdenCompraUpdateWithWhereUniqueWithoutProveedorInput[]
    updateMany?: OrdenCompraUpdateManyWithWhereWithoutProveedorInput | OrdenCompraUpdateManyWithWhereWithoutProveedorInput[]
    deleteMany?: OrdenCompraScalarWhereInput | OrdenCompraScalarWhereInput[]
  }

  export type ComparativaDetalleUncheckedUpdateManyWithoutProveedorNestedInput = {
    create?: XOR<ComparativaDetalleCreateWithoutProveedorInput, ComparativaDetalleUncheckedCreateWithoutProveedorInput> | ComparativaDetalleCreateWithoutProveedorInput[] | ComparativaDetalleUncheckedCreateWithoutProveedorInput[]
    connectOrCreate?: ComparativaDetalleCreateOrConnectWithoutProveedorInput | ComparativaDetalleCreateOrConnectWithoutProveedorInput[]
    upsert?: ComparativaDetalleUpsertWithWhereUniqueWithoutProveedorInput | ComparativaDetalleUpsertWithWhereUniqueWithoutProveedorInput[]
    createMany?: ComparativaDetalleCreateManyProveedorInputEnvelope
    set?: ComparativaDetalleWhereUniqueInput | ComparativaDetalleWhereUniqueInput[]
    disconnect?: ComparativaDetalleWhereUniqueInput | ComparativaDetalleWhereUniqueInput[]
    delete?: ComparativaDetalleWhereUniqueInput | ComparativaDetalleWhereUniqueInput[]
    connect?: ComparativaDetalleWhereUniqueInput | ComparativaDetalleWhereUniqueInput[]
    update?: ComparativaDetalleUpdateWithWhereUniqueWithoutProveedorInput | ComparativaDetalleUpdateWithWhereUniqueWithoutProveedorInput[]
    updateMany?: ComparativaDetalleUpdateManyWithWhereWithoutProveedorInput | ComparativaDetalleUpdateManyWithWhereWithoutProveedorInput[]
    deleteMany?: ComparativaDetalleScalarWhereInput | ComparativaDetalleScalarWhereInput[]
  }

  export type RequisicionItemCreateNestedManyWithoutRequisicionInput = {
    create?: XOR<RequisicionItemCreateWithoutRequisicionInput, RequisicionItemUncheckedCreateWithoutRequisicionInput> | RequisicionItemCreateWithoutRequisicionInput[] | RequisicionItemUncheckedCreateWithoutRequisicionInput[]
    connectOrCreate?: RequisicionItemCreateOrConnectWithoutRequisicionInput | RequisicionItemCreateOrConnectWithoutRequisicionInput[]
    createMany?: RequisicionItemCreateManyRequisicionInputEnvelope
    connect?: RequisicionItemWhereUniqueInput | RequisicionItemWhereUniqueInput[]
  }

  export type RequisicionItemUncheckedCreateNestedManyWithoutRequisicionInput = {
    create?: XOR<RequisicionItemCreateWithoutRequisicionInput, RequisicionItemUncheckedCreateWithoutRequisicionInput> | RequisicionItemCreateWithoutRequisicionInput[] | RequisicionItemUncheckedCreateWithoutRequisicionInput[]
    connectOrCreate?: RequisicionItemCreateOrConnectWithoutRequisicionInput | RequisicionItemCreateOrConnectWithoutRequisicionInput[]
    createMany?: RequisicionItemCreateManyRequisicionInputEnvelope
    connect?: RequisicionItemWhereUniqueInput | RequisicionItemWhereUniqueInput[]
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type RequisicionItemUpdateManyWithoutRequisicionNestedInput = {
    create?: XOR<RequisicionItemCreateWithoutRequisicionInput, RequisicionItemUncheckedCreateWithoutRequisicionInput> | RequisicionItemCreateWithoutRequisicionInput[] | RequisicionItemUncheckedCreateWithoutRequisicionInput[]
    connectOrCreate?: RequisicionItemCreateOrConnectWithoutRequisicionInput | RequisicionItemCreateOrConnectWithoutRequisicionInput[]
    upsert?: RequisicionItemUpsertWithWhereUniqueWithoutRequisicionInput | RequisicionItemUpsertWithWhereUniqueWithoutRequisicionInput[]
    createMany?: RequisicionItemCreateManyRequisicionInputEnvelope
    set?: RequisicionItemWhereUniqueInput | RequisicionItemWhereUniqueInput[]
    disconnect?: RequisicionItemWhereUniqueInput | RequisicionItemWhereUniqueInput[]
    delete?: RequisicionItemWhereUniqueInput | RequisicionItemWhereUniqueInput[]
    connect?: RequisicionItemWhereUniqueInput | RequisicionItemWhereUniqueInput[]
    update?: RequisicionItemUpdateWithWhereUniqueWithoutRequisicionInput | RequisicionItemUpdateWithWhereUniqueWithoutRequisicionInput[]
    updateMany?: RequisicionItemUpdateManyWithWhereWithoutRequisicionInput | RequisicionItemUpdateManyWithWhereWithoutRequisicionInput[]
    deleteMany?: RequisicionItemScalarWhereInput | RequisicionItemScalarWhereInput[]
  }

  export type RequisicionItemUncheckedUpdateManyWithoutRequisicionNestedInput = {
    create?: XOR<RequisicionItemCreateWithoutRequisicionInput, RequisicionItemUncheckedCreateWithoutRequisicionInput> | RequisicionItemCreateWithoutRequisicionInput[] | RequisicionItemUncheckedCreateWithoutRequisicionInput[]
    connectOrCreate?: RequisicionItemCreateOrConnectWithoutRequisicionInput | RequisicionItemCreateOrConnectWithoutRequisicionInput[]
    upsert?: RequisicionItemUpsertWithWhereUniqueWithoutRequisicionInput | RequisicionItemUpsertWithWhereUniqueWithoutRequisicionInput[]
    createMany?: RequisicionItemCreateManyRequisicionInputEnvelope
    set?: RequisicionItemWhereUniqueInput | RequisicionItemWhereUniqueInput[]
    disconnect?: RequisicionItemWhereUniqueInput | RequisicionItemWhereUniqueInput[]
    delete?: RequisicionItemWhereUniqueInput | RequisicionItemWhereUniqueInput[]
    connect?: RequisicionItemWhereUniqueInput | RequisicionItemWhereUniqueInput[]
    update?: RequisicionItemUpdateWithWhereUniqueWithoutRequisicionInput | RequisicionItemUpdateWithWhereUniqueWithoutRequisicionInput[]
    updateMany?: RequisicionItemUpdateManyWithWhereWithoutRequisicionInput | RequisicionItemUpdateManyWithWhereWithoutRequisicionInput[]
    deleteMany?: RequisicionItemScalarWhereInput | RequisicionItemScalarWhereInput[]
  }

  export type RequisicionCreateNestedOneWithoutItemsInput = {
    create?: XOR<RequisicionCreateWithoutItemsInput, RequisicionUncheckedCreateWithoutItemsInput>
    connectOrCreate?: RequisicionCreateOrConnectWithoutItemsInput
    connect?: RequisicionWhereUniqueInput
  }

  export type DecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type RequisicionUpdateOneRequiredWithoutItemsNestedInput = {
    create?: XOR<RequisicionCreateWithoutItemsInput, RequisicionUncheckedCreateWithoutItemsInput>
    connectOrCreate?: RequisicionCreateOrConnectWithoutItemsInput
    upsert?: RequisicionUpsertWithoutItemsInput
    connect?: RequisicionWhereUniqueInput
    update?: XOR<XOR<RequisicionUpdateToOneWithWhereWithoutItemsInput, RequisicionUpdateWithoutItemsInput>, RequisicionUncheckedUpdateWithoutItemsInput>
  }

  export type ProveedorCreateNestedOneWithoutOrdenesInput = {
    create?: XOR<ProveedorCreateWithoutOrdenesInput, ProveedorUncheckedCreateWithoutOrdenesInput>
    connectOrCreate?: ProveedorCreateOrConnectWithoutOrdenesInput
    connect?: ProveedorWhereUniqueInput
  }

  export type OrdenCompraItemCreateNestedManyWithoutOrdenInput = {
    create?: XOR<OrdenCompraItemCreateWithoutOrdenInput, OrdenCompraItemUncheckedCreateWithoutOrdenInput> | OrdenCompraItemCreateWithoutOrdenInput[] | OrdenCompraItemUncheckedCreateWithoutOrdenInput[]
    connectOrCreate?: OrdenCompraItemCreateOrConnectWithoutOrdenInput | OrdenCompraItemCreateOrConnectWithoutOrdenInput[]
    createMany?: OrdenCompraItemCreateManyOrdenInputEnvelope
    connect?: OrdenCompraItemWhereUniqueInput | OrdenCompraItemWhereUniqueInput[]
  }

  export type OrdenCompraItemUncheckedCreateNestedManyWithoutOrdenInput = {
    create?: XOR<OrdenCompraItemCreateWithoutOrdenInput, OrdenCompraItemUncheckedCreateWithoutOrdenInput> | OrdenCompraItemCreateWithoutOrdenInput[] | OrdenCompraItemUncheckedCreateWithoutOrdenInput[]
    connectOrCreate?: OrdenCompraItemCreateOrConnectWithoutOrdenInput | OrdenCompraItemCreateOrConnectWithoutOrdenInput[]
    createMany?: OrdenCompraItemCreateManyOrdenInputEnvelope
    connect?: OrdenCompraItemWhereUniqueInput | OrdenCompraItemWhereUniqueInput[]
  }

  export type ProveedorUpdateOneRequiredWithoutOrdenesNestedInput = {
    create?: XOR<ProveedorCreateWithoutOrdenesInput, ProveedorUncheckedCreateWithoutOrdenesInput>
    connectOrCreate?: ProveedorCreateOrConnectWithoutOrdenesInput
    upsert?: ProveedorUpsertWithoutOrdenesInput
    connect?: ProveedorWhereUniqueInput
    update?: XOR<XOR<ProveedorUpdateToOneWithWhereWithoutOrdenesInput, ProveedorUpdateWithoutOrdenesInput>, ProveedorUncheckedUpdateWithoutOrdenesInput>
  }

  export type OrdenCompraItemUpdateManyWithoutOrdenNestedInput = {
    create?: XOR<OrdenCompraItemCreateWithoutOrdenInput, OrdenCompraItemUncheckedCreateWithoutOrdenInput> | OrdenCompraItemCreateWithoutOrdenInput[] | OrdenCompraItemUncheckedCreateWithoutOrdenInput[]
    connectOrCreate?: OrdenCompraItemCreateOrConnectWithoutOrdenInput | OrdenCompraItemCreateOrConnectWithoutOrdenInput[]
    upsert?: OrdenCompraItemUpsertWithWhereUniqueWithoutOrdenInput | OrdenCompraItemUpsertWithWhereUniqueWithoutOrdenInput[]
    createMany?: OrdenCompraItemCreateManyOrdenInputEnvelope
    set?: OrdenCompraItemWhereUniqueInput | OrdenCompraItemWhereUniqueInput[]
    disconnect?: OrdenCompraItemWhereUniqueInput | OrdenCompraItemWhereUniqueInput[]
    delete?: OrdenCompraItemWhereUniqueInput | OrdenCompraItemWhereUniqueInput[]
    connect?: OrdenCompraItemWhereUniqueInput | OrdenCompraItemWhereUniqueInput[]
    update?: OrdenCompraItemUpdateWithWhereUniqueWithoutOrdenInput | OrdenCompraItemUpdateWithWhereUniqueWithoutOrdenInput[]
    updateMany?: OrdenCompraItemUpdateManyWithWhereWithoutOrdenInput | OrdenCompraItemUpdateManyWithWhereWithoutOrdenInput[]
    deleteMany?: OrdenCompraItemScalarWhereInput | OrdenCompraItemScalarWhereInput[]
  }

  export type OrdenCompraItemUncheckedUpdateManyWithoutOrdenNestedInput = {
    create?: XOR<OrdenCompraItemCreateWithoutOrdenInput, OrdenCompraItemUncheckedCreateWithoutOrdenInput> | OrdenCompraItemCreateWithoutOrdenInput[] | OrdenCompraItemUncheckedCreateWithoutOrdenInput[]
    connectOrCreate?: OrdenCompraItemCreateOrConnectWithoutOrdenInput | OrdenCompraItemCreateOrConnectWithoutOrdenInput[]
    upsert?: OrdenCompraItemUpsertWithWhereUniqueWithoutOrdenInput | OrdenCompraItemUpsertWithWhereUniqueWithoutOrdenInput[]
    createMany?: OrdenCompraItemCreateManyOrdenInputEnvelope
    set?: OrdenCompraItemWhereUniqueInput | OrdenCompraItemWhereUniqueInput[]
    disconnect?: OrdenCompraItemWhereUniqueInput | OrdenCompraItemWhereUniqueInput[]
    delete?: OrdenCompraItemWhereUniqueInput | OrdenCompraItemWhereUniqueInput[]
    connect?: OrdenCompraItemWhereUniqueInput | OrdenCompraItemWhereUniqueInput[]
    update?: OrdenCompraItemUpdateWithWhereUniqueWithoutOrdenInput | OrdenCompraItemUpdateWithWhereUniqueWithoutOrdenInput[]
    updateMany?: OrdenCompraItemUpdateManyWithWhereWithoutOrdenInput | OrdenCompraItemUpdateManyWithWhereWithoutOrdenInput[]
    deleteMany?: OrdenCompraItemScalarWhereInput | OrdenCompraItemScalarWhereInput[]
  }

  export type OrdenCompraCreateNestedOneWithoutItemsInput = {
    create?: XOR<OrdenCompraCreateWithoutItemsInput, OrdenCompraUncheckedCreateWithoutItemsInput>
    connectOrCreate?: OrdenCompraCreateOrConnectWithoutItemsInput
    connect?: OrdenCompraWhereUniqueInput
  }

  export type OrdenCompraUpdateOneRequiredWithoutItemsNestedInput = {
    create?: XOR<OrdenCompraCreateWithoutItemsInput, OrdenCompraUncheckedCreateWithoutItemsInput>
    connectOrCreate?: OrdenCompraCreateOrConnectWithoutItemsInput
    upsert?: OrdenCompraUpsertWithoutItemsInput
    connect?: OrdenCompraWhereUniqueInput
    update?: XOR<XOR<OrdenCompraUpdateToOneWithWhereWithoutItemsInput, OrdenCompraUpdateWithoutItemsInput>, OrdenCompraUncheckedUpdateWithoutItemsInput>
  }

  export type ComparativaDetalleCreateNestedManyWithoutCuadroInput = {
    create?: XOR<ComparativaDetalleCreateWithoutCuadroInput, ComparativaDetalleUncheckedCreateWithoutCuadroInput> | ComparativaDetalleCreateWithoutCuadroInput[] | ComparativaDetalleUncheckedCreateWithoutCuadroInput[]
    connectOrCreate?: ComparativaDetalleCreateOrConnectWithoutCuadroInput | ComparativaDetalleCreateOrConnectWithoutCuadroInput[]
    createMany?: ComparativaDetalleCreateManyCuadroInputEnvelope
    connect?: ComparativaDetalleWhereUniqueInput | ComparativaDetalleWhereUniqueInput[]
  }

  export type ComparativaDetalleUncheckedCreateNestedManyWithoutCuadroInput = {
    create?: XOR<ComparativaDetalleCreateWithoutCuadroInput, ComparativaDetalleUncheckedCreateWithoutCuadroInput> | ComparativaDetalleCreateWithoutCuadroInput[] | ComparativaDetalleUncheckedCreateWithoutCuadroInput[]
    connectOrCreate?: ComparativaDetalleCreateOrConnectWithoutCuadroInput | ComparativaDetalleCreateOrConnectWithoutCuadroInput[]
    createMany?: ComparativaDetalleCreateManyCuadroInputEnvelope
    connect?: ComparativaDetalleWhereUniqueInput | ComparativaDetalleWhereUniqueInput[]
  }

  export type ComparativaDetalleUpdateManyWithoutCuadroNestedInput = {
    create?: XOR<ComparativaDetalleCreateWithoutCuadroInput, ComparativaDetalleUncheckedCreateWithoutCuadroInput> | ComparativaDetalleCreateWithoutCuadroInput[] | ComparativaDetalleUncheckedCreateWithoutCuadroInput[]
    connectOrCreate?: ComparativaDetalleCreateOrConnectWithoutCuadroInput | ComparativaDetalleCreateOrConnectWithoutCuadroInput[]
    upsert?: ComparativaDetalleUpsertWithWhereUniqueWithoutCuadroInput | ComparativaDetalleUpsertWithWhereUniqueWithoutCuadroInput[]
    createMany?: ComparativaDetalleCreateManyCuadroInputEnvelope
    set?: ComparativaDetalleWhereUniqueInput | ComparativaDetalleWhereUniqueInput[]
    disconnect?: ComparativaDetalleWhereUniqueInput | ComparativaDetalleWhereUniqueInput[]
    delete?: ComparativaDetalleWhereUniqueInput | ComparativaDetalleWhereUniqueInput[]
    connect?: ComparativaDetalleWhereUniqueInput | ComparativaDetalleWhereUniqueInput[]
    update?: ComparativaDetalleUpdateWithWhereUniqueWithoutCuadroInput | ComparativaDetalleUpdateWithWhereUniqueWithoutCuadroInput[]
    updateMany?: ComparativaDetalleUpdateManyWithWhereWithoutCuadroInput | ComparativaDetalleUpdateManyWithWhereWithoutCuadroInput[]
    deleteMany?: ComparativaDetalleScalarWhereInput | ComparativaDetalleScalarWhereInput[]
  }

  export type ComparativaDetalleUncheckedUpdateManyWithoutCuadroNestedInput = {
    create?: XOR<ComparativaDetalleCreateWithoutCuadroInput, ComparativaDetalleUncheckedCreateWithoutCuadroInput> | ComparativaDetalleCreateWithoutCuadroInput[] | ComparativaDetalleUncheckedCreateWithoutCuadroInput[]
    connectOrCreate?: ComparativaDetalleCreateOrConnectWithoutCuadroInput | ComparativaDetalleCreateOrConnectWithoutCuadroInput[]
    upsert?: ComparativaDetalleUpsertWithWhereUniqueWithoutCuadroInput | ComparativaDetalleUpsertWithWhereUniqueWithoutCuadroInput[]
    createMany?: ComparativaDetalleCreateManyCuadroInputEnvelope
    set?: ComparativaDetalleWhereUniqueInput | ComparativaDetalleWhereUniqueInput[]
    disconnect?: ComparativaDetalleWhereUniqueInput | ComparativaDetalleWhereUniqueInput[]
    delete?: ComparativaDetalleWhereUniqueInput | ComparativaDetalleWhereUniqueInput[]
    connect?: ComparativaDetalleWhereUniqueInput | ComparativaDetalleWhereUniqueInput[]
    update?: ComparativaDetalleUpdateWithWhereUniqueWithoutCuadroInput | ComparativaDetalleUpdateWithWhereUniqueWithoutCuadroInput[]
    updateMany?: ComparativaDetalleUpdateManyWithWhereWithoutCuadroInput | ComparativaDetalleUpdateManyWithWhereWithoutCuadroInput[]
    deleteMany?: ComparativaDetalleScalarWhereInput | ComparativaDetalleScalarWhereInput[]
  }

  export type CuadroComparativoCreateNestedOneWithoutDetallesInput = {
    create?: XOR<CuadroComparativoCreateWithoutDetallesInput, CuadroComparativoUncheckedCreateWithoutDetallesInput>
    connectOrCreate?: CuadroComparativoCreateOrConnectWithoutDetallesInput
    connect?: CuadroComparativoWhereUniqueInput
  }

  export type ProveedorCreateNestedOneWithoutComparativasInput = {
    create?: XOR<ProveedorCreateWithoutComparativasInput, ProveedorUncheckedCreateWithoutComparativasInput>
    connectOrCreate?: ProveedorCreateOrConnectWithoutComparativasInput
    connect?: ProveedorWhereUniqueInput
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type CuadroComparativoUpdateOneRequiredWithoutDetallesNestedInput = {
    create?: XOR<CuadroComparativoCreateWithoutDetallesInput, CuadroComparativoUncheckedCreateWithoutDetallesInput>
    connectOrCreate?: CuadroComparativoCreateOrConnectWithoutDetallesInput
    upsert?: CuadroComparativoUpsertWithoutDetallesInput
    connect?: CuadroComparativoWhereUniqueInput
    update?: XOR<XOR<CuadroComparativoUpdateToOneWithWhereWithoutDetallesInput, CuadroComparativoUpdateWithoutDetallesInput>, CuadroComparativoUncheckedUpdateWithoutDetallesInput>
  }

  export type ProveedorUpdateOneRequiredWithoutComparativasNestedInput = {
    create?: XOR<ProveedorCreateWithoutComparativasInput, ProveedorUncheckedCreateWithoutComparativasInput>
    connectOrCreate?: ProveedorCreateOrConnectWithoutComparativasInput
    upsert?: ProveedorUpsertWithoutComparativasInput
    connect?: ProveedorWhereUniqueInput
    update?: XOR<XOR<ProveedorUpdateToOneWithWhereWithoutComparativasInput, ProveedorUpdateWithoutComparativasInput>, ProveedorUncheckedUpdateWithoutComparativasInput>
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

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type OrdenCompraCreateWithoutProveedorInput = {
    id_orden?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    fecha_emision?: Date | string
    estado?: string
    moneda?: string
    tipo_cambio?: Decimal | DecimalJsLike | number | string
    subtotal: Decimal | DecimalJsLike | number | string
    iva: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
    presupuesto_id?: string | null
    items?: OrdenCompraItemCreateNestedManyWithoutOrdenInput
  }

  export type OrdenCompraUncheckedCreateWithoutProveedorInput = {
    id_orden?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    fecha_emision?: Date | string
    estado?: string
    moneda?: string
    tipo_cambio?: Decimal | DecimalJsLike | number | string
    subtotal: Decimal | DecimalJsLike | number | string
    iva: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
    presupuesto_id?: string | null
    items?: OrdenCompraItemUncheckedCreateNestedManyWithoutOrdenInput
  }

  export type OrdenCompraCreateOrConnectWithoutProveedorInput = {
    where: OrdenCompraWhereUniqueInput
    create: XOR<OrdenCompraCreateWithoutProveedorInput, OrdenCompraUncheckedCreateWithoutProveedorInput>
  }

  export type OrdenCompraCreateManyProveedorInputEnvelope = {
    data: OrdenCompraCreateManyProveedorInput | OrdenCompraCreateManyProveedorInput[]
    skipDuplicates?: boolean
  }

  export type ComparativaDetalleCreateWithoutProveedorInput = {
    id_detalle?: string
    tenant_id: string
    proyecto_id: string
    insumo_id: string
    precio_ofertado: Decimal | DecimalJsLike | number | string
    tiempo_entrega?: string | null
    es_ganador?: boolean
    cuadro: CuadroComparativoCreateNestedOneWithoutDetallesInput
  }

  export type ComparativaDetalleUncheckedCreateWithoutProveedorInput = {
    id_detalle?: string
    tenant_id: string
    proyecto_id: string
    cuadro_id: string
    insumo_id: string
    precio_ofertado: Decimal | DecimalJsLike | number | string
    tiempo_entrega?: string | null
    es_ganador?: boolean
  }

  export type ComparativaDetalleCreateOrConnectWithoutProveedorInput = {
    where: ComparativaDetalleWhereUniqueInput
    create: XOR<ComparativaDetalleCreateWithoutProveedorInput, ComparativaDetalleUncheckedCreateWithoutProveedorInput>
  }

  export type ComparativaDetalleCreateManyProveedorInputEnvelope = {
    data: ComparativaDetalleCreateManyProveedorInput | ComparativaDetalleCreateManyProveedorInput[]
    skipDuplicates?: boolean
  }

  export type OrdenCompraUpsertWithWhereUniqueWithoutProveedorInput = {
    where: OrdenCompraWhereUniqueInput
    update: XOR<OrdenCompraUpdateWithoutProveedorInput, OrdenCompraUncheckedUpdateWithoutProveedorInput>
    create: XOR<OrdenCompraCreateWithoutProveedorInput, OrdenCompraUncheckedCreateWithoutProveedorInput>
  }

  export type OrdenCompraUpdateWithWhereUniqueWithoutProveedorInput = {
    where: OrdenCompraWhereUniqueInput
    data: XOR<OrdenCompraUpdateWithoutProveedorInput, OrdenCompraUncheckedUpdateWithoutProveedorInput>
  }

  export type OrdenCompraUpdateManyWithWhereWithoutProveedorInput = {
    where: OrdenCompraScalarWhereInput
    data: XOR<OrdenCompraUpdateManyMutationInput, OrdenCompraUncheckedUpdateManyWithoutProveedorInput>
  }

  export type OrdenCompraScalarWhereInput = {
    AND?: OrdenCompraScalarWhereInput | OrdenCompraScalarWhereInput[]
    OR?: OrdenCompraScalarWhereInput[]
    NOT?: OrdenCompraScalarWhereInput | OrdenCompraScalarWhereInput[]
    id_orden?: UuidFilter<"OrdenCompra"> | string
    tenant_id?: UuidFilter<"OrdenCompra"> | string
    proyecto_id?: UuidFilter<"OrdenCompra"> | string
    proveedor_id?: UuidFilter<"OrdenCompra"> | string
    codigo?: StringFilter<"OrdenCompra"> | string
    fecha_emision?: DateTimeFilter<"OrdenCompra"> | Date | string
    estado?: StringFilter<"OrdenCompra"> | string
    moneda?: StringFilter<"OrdenCompra"> | string
    tipo_cambio?: DecimalFilter<"OrdenCompra"> | Decimal | DecimalJsLike | number | string
    subtotal?: DecimalFilter<"OrdenCompra"> | Decimal | DecimalJsLike | number | string
    iva?: DecimalFilter<"OrdenCompra"> | Decimal | DecimalJsLike | number | string
    total?: DecimalFilter<"OrdenCompra"> | Decimal | DecimalJsLike | number | string
    presupuesto_id?: UuidNullableFilter<"OrdenCompra"> | string | null
  }

  export type ComparativaDetalleUpsertWithWhereUniqueWithoutProveedorInput = {
    where: ComparativaDetalleWhereUniqueInput
    update: XOR<ComparativaDetalleUpdateWithoutProveedorInput, ComparativaDetalleUncheckedUpdateWithoutProveedorInput>
    create: XOR<ComparativaDetalleCreateWithoutProveedorInput, ComparativaDetalleUncheckedCreateWithoutProveedorInput>
  }

  export type ComparativaDetalleUpdateWithWhereUniqueWithoutProveedorInput = {
    where: ComparativaDetalleWhereUniqueInput
    data: XOR<ComparativaDetalleUpdateWithoutProveedorInput, ComparativaDetalleUncheckedUpdateWithoutProveedorInput>
  }

  export type ComparativaDetalleUpdateManyWithWhereWithoutProveedorInput = {
    where: ComparativaDetalleScalarWhereInput
    data: XOR<ComparativaDetalleUpdateManyMutationInput, ComparativaDetalleUncheckedUpdateManyWithoutProveedorInput>
  }

  export type ComparativaDetalleScalarWhereInput = {
    AND?: ComparativaDetalleScalarWhereInput | ComparativaDetalleScalarWhereInput[]
    OR?: ComparativaDetalleScalarWhereInput[]
    NOT?: ComparativaDetalleScalarWhereInput | ComparativaDetalleScalarWhereInput[]
    id_detalle?: UuidFilter<"ComparativaDetalle"> | string
    tenant_id?: UuidFilter<"ComparativaDetalle"> | string
    proyecto_id?: UuidFilter<"ComparativaDetalle"> | string
    cuadro_id?: UuidFilter<"ComparativaDetalle"> | string
    proveedor_id?: UuidFilter<"ComparativaDetalle"> | string
    insumo_id?: UuidFilter<"ComparativaDetalle"> | string
    precio_ofertado?: DecimalFilter<"ComparativaDetalle"> | Decimal | DecimalJsLike | number | string
    tiempo_entrega?: StringNullableFilter<"ComparativaDetalle"> | string | null
    es_ganador?: BoolFilter<"ComparativaDetalle"> | boolean
  }

  export type RequisicionItemCreateWithoutRequisicionInput = {
    id_item?: string
    tenant_id: string
    proyecto_id: string
    insumo_id: string
    cantidad: Decimal | DecimalJsLike | number | string
    notas?: string | null
  }

  export type RequisicionItemUncheckedCreateWithoutRequisicionInput = {
    id_item?: string
    tenant_id: string
    proyecto_id: string
    insumo_id: string
    cantidad: Decimal | DecimalJsLike | number | string
    notas?: string | null
  }

  export type RequisicionItemCreateOrConnectWithoutRequisicionInput = {
    where: RequisicionItemWhereUniqueInput
    create: XOR<RequisicionItemCreateWithoutRequisicionInput, RequisicionItemUncheckedCreateWithoutRequisicionInput>
  }

  export type RequisicionItemCreateManyRequisicionInputEnvelope = {
    data: RequisicionItemCreateManyRequisicionInput | RequisicionItemCreateManyRequisicionInput[]
    skipDuplicates?: boolean
  }

  export type RequisicionItemUpsertWithWhereUniqueWithoutRequisicionInput = {
    where: RequisicionItemWhereUniqueInput
    update: XOR<RequisicionItemUpdateWithoutRequisicionInput, RequisicionItemUncheckedUpdateWithoutRequisicionInput>
    create: XOR<RequisicionItemCreateWithoutRequisicionInput, RequisicionItemUncheckedCreateWithoutRequisicionInput>
  }

  export type RequisicionItemUpdateWithWhereUniqueWithoutRequisicionInput = {
    where: RequisicionItemWhereUniqueInput
    data: XOR<RequisicionItemUpdateWithoutRequisicionInput, RequisicionItemUncheckedUpdateWithoutRequisicionInput>
  }

  export type RequisicionItemUpdateManyWithWhereWithoutRequisicionInput = {
    where: RequisicionItemScalarWhereInput
    data: XOR<RequisicionItemUpdateManyMutationInput, RequisicionItemUncheckedUpdateManyWithoutRequisicionInput>
  }

  export type RequisicionItemScalarWhereInput = {
    AND?: RequisicionItemScalarWhereInput | RequisicionItemScalarWhereInput[]
    OR?: RequisicionItemScalarWhereInput[]
    NOT?: RequisicionItemScalarWhereInput | RequisicionItemScalarWhereInput[]
    id_item?: UuidFilter<"RequisicionItem"> | string
    tenant_id?: UuidFilter<"RequisicionItem"> | string
    proyecto_id?: UuidFilter<"RequisicionItem"> | string
    requisicion_id?: UuidFilter<"RequisicionItem"> | string
    insumo_id?: UuidFilter<"RequisicionItem"> | string
    cantidad?: DecimalFilter<"RequisicionItem"> | Decimal | DecimalJsLike | number | string
    notas?: StringNullableFilter<"RequisicionItem"> | string | null
  }

  export type RequisicionCreateWithoutItemsInput = {
    id_requisicion?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    fecha_solicitud?: Date | string
    solicitante_id: string
    prioridad?: string
    estado?: string
    observaciones?: string | null
  }

  export type RequisicionUncheckedCreateWithoutItemsInput = {
    id_requisicion?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    fecha_solicitud?: Date | string
    solicitante_id: string
    prioridad?: string
    estado?: string
    observaciones?: string | null
  }

  export type RequisicionCreateOrConnectWithoutItemsInput = {
    where: RequisicionWhereUniqueInput
    create: XOR<RequisicionCreateWithoutItemsInput, RequisicionUncheckedCreateWithoutItemsInput>
  }

  export type RequisicionUpsertWithoutItemsInput = {
    update: XOR<RequisicionUpdateWithoutItemsInput, RequisicionUncheckedUpdateWithoutItemsInput>
    create: XOR<RequisicionCreateWithoutItemsInput, RequisicionUncheckedCreateWithoutItemsInput>
    where?: RequisicionWhereInput
  }

  export type RequisicionUpdateToOneWithWhereWithoutItemsInput = {
    where?: RequisicionWhereInput
    data: XOR<RequisicionUpdateWithoutItemsInput, RequisicionUncheckedUpdateWithoutItemsInput>
  }

  export type RequisicionUpdateWithoutItemsInput = {
    id_requisicion?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    fecha_solicitud?: DateTimeFieldUpdateOperationsInput | Date | string
    solicitante_id?: StringFieldUpdateOperationsInput | string
    prioridad?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RequisicionUncheckedUpdateWithoutItemsInput = {
    id_requisicion?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    fecha_solicitud?: DateTimeFieldUpdateOperationsInput | Date | string
    solicitante_id?: StringFieldUpdateOperationsInput | string
    prioridad?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ProveedorCreateWithoutOrdenesInput = {
    id_proveedor?: string
    tenant_id: string
    rfc_tax_id: string
    razon_social: string
    email_contacto?: string | null
    telefono?: string | null
    estatus?: string
    comparativas?: ComparativaDetalleCreateNestedManyWithoutProveedorInput
  }

  export type ProveedorUncheckedCreateWithoutOrdenesInput = {
    id_proveedor?: string
    tenant_id: string
    rfc_tax_id: string
    razon_social: string
    email_contacto?: string | null
    telefono?: string | null
    estatus?: string
    comparativas?: ComparativaDetalleUncheckedCreateNestedManyWithoutProveedorInput
  }

  export type ProveedorCreateOrConnectWithoutOrdenesInput = {
    where: ProveedorWhereUniqueInput
    create: XOR<ProveedorCreateWithoutOrdenesInput, ProveedorUncheckedCreateWithoutOrdenesInput>
  }

  export type OrdenCompraItemCreateWithoutOrdenInput = {
    id_item?: string
    tenant_id: string
    proyecto_id: string
    insumo_id: string
    cantidad: Decimal | DecimalJsLike | number | string
    precio_unitario: Decimal | DecimalJsLike | number | string
    importe: Decimal | DecimalJsLike | number | string
  }

  export type OrdenCompraItemUncheckedCreateWithoutOrdenInput = {
    id_item?: string
    tenant_id: string
    proyecto_id: string
    insumo_id: string
    cantidad: Decimal | DecimalJsLike | number | string
    precio_unitario: Decimal | DecimalJsLike | number | string
    importe: Decimal | DecimalJsLike | number | string
  }

  export type OrdenCompraItemCreateOrConnectWithoutOrdenInput = {
    where: OrdenCompraItemWhereUniqueInput
    create: XOR<OrdenCompraItemCreateWithoutOrdenInput, OrdenCompraItemUncheckedCreateWithoutOrdenInput>
  }

  export type OrdenCompraItemCreateManyOrdenInputEnvelope = {
    data: OrdenCompraItemCreateManyOrdenInput | OrdenCompraItemCreateManyOrdenInput[]
    skipDuplicates?: boolean
  }

  export type ProveedorUpsertWithoutOrdenesInput = {
    update: XOR<ProveedorUpdateWithoutOrdenesInput, ProveedorUncheckedUpdateWithoutOrdenesInput>
    create: XOR<ProveedorCreateWithoutOrdenesInput, ProveedorUncheckedCreateWithoutOrdenesInput>
    where?: ProveedorWhereInput
  }

  export type ProveedorUpdateToOneWithWhereWithoutOrdenesInput = {
    where?: ProveedorWhereInput
    data: XOR<ProveedorUpdateWithoutOrdenesInput, ProveedorUncheckedUpdateWithoutOrdenesInput>
  }

  export type ProveedorUpdateWithoutOrdenesInput = {
    id_proveedor?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    rfc_tax_id?: StringFieldUpdateOperationsInput | string
    razon_social?: StringFieldUpdateOperationsInput | string
    email_contacto?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    estatus?: StringFieldUpdateOperationsInput | string
    comparativas?: ComparativaDetalleUpdateManyWithoutProveedorNestedInput
  }

  export type ProveedorUncheckedUpdateWithoutOrdenesInput = {
    id_proveedor?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    rfc_tax_id?: StringFieldUpdateOperationsInput | string
    razon_social?: StringFieldUpdateOperationsInput | string
    email_contacto?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    estatus?: StringFieldUpdateOperationsInput | string
    comparativas?: ComparativaDetalleUncheckedUpdateManyWithoutProveedorNestedInput
  }

  export type OrdenCompraItemUpsertWithWhereUniqueWithoutOrdenInput = {
    where: OrdenCompraItemWhereUniqueInput
    update: XOR<OrdenCompraItemUpdateWithoutOrdenInput, OrdenCompraItemUncheckedUpdateWithoutOrdenInput>
    create: XOR<OrdenCompraItemCreateWithoutOrdenInput, OrdenCompraItemUncheckedCreateWithoutOrdenInput>
  }

  export type OrdenCompraItemUpdateWithWhereUniqueWithoutOrdenInput = {
    where: OrdenCompraItemWhereUniqueInput
    data: XOR<OrdenCompraItemUpdateWithoutOrdenInput, OrdenCompraItemUncheckedUpdateWithoutOrdenInput>
  }

  export type OrdenCompraItemUpdateManyWithWhereWithoutOrdenInput = {
    where: OrdenCompraItemScalarWhereInput
    data: XOR<OrdenCompraItemUpdateManyMutationInput, OrdenCompraItemUncheckedUpdateManyWithoutOrdenInput>
  }

  export type OrdenCompraItemScalarWhereInput = {
    AND?: OrdenCompraItemScalarWhereInput | OrdenCompraItemScalarWhereInput[]
    OR?: OrdenCompraItemScalarWhereInput[]
    NOT?: OrdenCompraItemScalarWhereInput | OrdenCompraItemScalarWhereInput[]
    id_item?: UuidFilter<"OrdenCompraItem"> | string
    tenant_id?: UuidFilter<"OrdenCompraItem"> | string
    proyecto_id?: UuidFilter<"OrdenCompraItem"> | string
    orden_id?: UuidFilter<"OrdenCompraItem"> | string
    insumo_id?: UuidFilter<"OrdenCompraItem"> | string
    cantidad?: DecimalFilter<"OrdenCompraItem"> | Decimal | DecimalJsLike | number | string
    precio_unitario?: DecimalFilter<"OrdenCompraItem"> | Decimal | DecimalJsLike | number | string
    importe?: DecimalFilter<"OrdenCompraItem"> | Decimal | DecimalJsLike | number | string
  }

  export type OrdenCompraCreateWithoutItemsInput = {
    id_orden?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    fecha_emision?: Date | string
    estado?: string
    moneda?: string
    tipo_cambio?: Decimal | DecimalJsLike | number | string
    subtotal: Decimal | DecimalJsLike | number | string
    iva: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
    presupuesto_id?: string | null
    proveedor: ProveedorCreateNestedOneWithoutOrdenesInput
  }

  export type OrdenCompraUncheckedCreateWithoutItemsInput = {
    id_orden?: string
    tenant_id: string
    proyecto_id: string
    proveedor_id: string
    codigo: string
    fecha_emision?: Date | string
    estado?: string
    moneda?: string
    tipo_cambio?: Decimal | DecimalJsLike | number | string
    subtotal: Decimal | DecimalJsLike | number | string
    iva: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
    presupuesto_id?: string | null
  }

  export type OrdenCompraCreateOrConnectWithoutItemsInput = {
    where: OrdenCompraWhereUniqueInput
    create: XOR<OrdenCompraCreateWithoutItemsInput, OrdenCompraUncheckedCreateWithoutItemsInput>
  }

  export type OrdenCompraUpsertWithoutItemsInput = {
    update: XOR<OrdenCompraUpdateWithoutItemsInput, OrdenCompraUncheckedUpdateWithoutItemsInput>
    create: XOR<OrdenCompraCreateWithoutItemsInput, OrdenCompraUncheckedCreateWithoutItemsInput>
    where?: OrdenCompraWhereInput
  }

  export type OrdenCompraUpdateToOneWithWhereWithoutItemsInput = {
    where?: OrdenCompraWhereInput
    data: XOR<OrdenCompraUpdateWithoutItemsInput, OrdenCompraUncheckedUpdateWithoutItemsInput>
  }

  export type OrdenCompraUpdateWithoutItemsInput = {
    id_orden?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    fecha_emision?: DateTimeFieldUpdateOperationsInput | Date | string
    estado?: StringFieldUpdateOperationsInput | string
    moneda?: StringFieldUpdateOperationsInput | string
    tipo_cambio?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    iva?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    presupuesto_id?: NullableStringFieldUpdateOperationsInput | string | null
    proveedor?: ProveedorUpdateOneRequiredWithoutOrdenesNestedInput
  }

  export type OrdenCompraUncheckedUpdateWithoutItemsInput = {
    id_orden?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    proveedor_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    fecha_emision?: DateTimeFieldUpdateOperationsInput | Date | string
    estado?: StringFieldUpdateOperationsInput | string
    moneda?: StringFieldUpdateOperationsInput | string
    tipo_cambio?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    iva?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    presupuesto_id?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ComparativaDetalleCreateWithoutCuadroInput = {
    id_detalle?: string
    tenant_id: string
    proyecto_id: string
    insumo_id: string
    precio_ofertado: Decimal | DecimalJsLike | number | string
    tiempo_entrega?: string | null
    es_ganador?: boolean
    proveedor: ProveedorCreateNestedOneWithoutComparativasInput
  }

  export type ComparativaDetalleUncheckedCreateWithoutCuadroInput = {
    id_detalle?: string
    tenant_id: string
    proyecto_id: string
    proveedor_id: string
    insumo_id: string
    precio_ofertado: Decimal | DecimalJsLike | number | string
    tiempo_entrega?: string | null
    es_ganador?: boolean
  }

  export type ComparativaDetalleCreateOrConnectWithoutCuadroInput = {
    where: ComparativaDetalleWhereUniqueInput
    create: XOR<ComparativaDetalleCreateWithoutCuadroInput, ComparativaDetalleUncheckedCreateWithoutCuadroInput>
  }

  export type ComparativaDetalleCreateManyCuadroInputEnvelope = {
    data: ComparativaDetalleCreateManyCuadroInput | ComparativaDetalleCreateManyCuadroInput[]
    skipDuplicates?: boolean
  }

  export type ComparativaDetalleUpsertWithWhereUniqueWithoutCuadroInput = {
    where: ComparativaDetalleWhereUniqueInput
    update: XOR<ComparativaDetalleUpdateWithoutCuadroInput, ComparativaDetalleUncheckedUpdateWithoutCuadroInput>
    create: XOR<ComparativaDetalleCreateWithoutCuadroInput, ComparativaDetalleUncheckedCreateWithoutCuadroInput>
  }

  export type ComparativaDetalleUpdateWithWhereUniqueWithoutCuadroInput = {
    where: ComparativaDetalleWhereUniqueInput
    data: XOR<ComparativaDetalleUpdateWithoutCuadroInput, ComparativaDetalleUncheckedUpdateWithoutCuadroInput>
  }

  export type ComparativaDetalleUpdateManyWithWhereWithoutCuadroInput = {
    where: ComparativaDetalleScalarWhereInput
    data: XOR<ComparativaDetalleUpdateManyMutationInput, ComparativaDetalleUncheckedUpdateManyWithoutCuadroInput>
  }

  export type CuadroComparativoCreateWithoutDetallesInput = {
    id_cuadro?: string
    tenant_id: string
    proyecto_id: string
    requisicion_id: string
    codigo: string
    fecha_creacion?: Date | string
    estado?: string
    notas?: string | null
  }

  export type CuadroComparativoUncheckedCreateWithoutDetallesInput = {
    id_cuadro?: string
    tenant_id: string
    proyecto_id: string
    requisicion_id: string
    codigo: string
    fecha_creacion?: Date | string
    estado?: string
    notas?: string | null
  }

  export type CuadroComparativoCreateOrConnectWithoutDetallesInput = {
    where: CuadroComparativoWhereUniqueInput
    create: XOR<CuadroComparativoCreateWithoutDetallesInput, CuadroComparativoUncheckedCreateWithoutDetallesInput>
  }

  export type ProveedorCreateWithoutComparativasInput = {
    id_proveedor?: string
    tenant_id: string
    rfc_tax_id: string
    razon_social: string
    email_contacto?: string | null
    telefono?: string | null
    estatus?: string
    ordenes?: OrdenCompraCreateNestedManyWithoutProveedorInput
  }

  export type ProveedorUncheckedCreateWithoutComparativasInput = {
    id_proveedor?: string
    tenant_id: string
    rfc_tax_id: string
    razon_social: string
    email_contacto?: string | null
    telefono?: string | null
    estatus?: string
    ordenes?: OrdenCompraUncheckedCreateNestedManyWithoutProveedorInput
  }

  export type ProveedorCreateOrConnectWithoutComparativasInput = {
    where: ProveedorWhereUniqueInput
    create: XOR<ProveedorCreateWithoutComparativasInput, ProveedorUncheckedCreateWithoutComparativasInput>
  }

  export type CuadroComparativoUpsertWithoutDetallesInput = {
    update: XOR<CuadroComparativoUpdateWithoutDetallesInput, CuadroComparativoUncheckedUpdateWithoutDetallesInput>
    create: XOR<CuadroComparativoCreateWithoutDetallesInput, CuadroComparativoUncheckedCreateWithoutDetallesInput>
    where?: CuadroComparativoWhereInput
  }

  export type CuadroComparativoUpdateToOneWithWhereWithoutDetallesInput = {
    where?: CuadroComparativoWhereInput
    data: XOR<CuadroComparativoUpdateWithoutDetallesInput, CuadroComparativoUncheckedUpdateWithoutDetallesInput>
  }

  export type CuadroComparativoUpdateWithoutDetallesInput = {
    id_cuadro?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    requisicion_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    fecha_creacion?: DateTimeFieldUpdateOperationsInput | Date | string
    estado?: StringFieldUpdateOperationsInput | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type CuadroComparativoUncheckedUpdateWithoutDetallesInput = {
    id_cuadro?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    requisicion_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    fecha_creacion?: DateTimeFieldUpdateOperationsInput | Date | string
    estado?: StringFieldUpdateOperationsInput | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ProveedorUpsertWithoutComparativasInput = {
    update: XOR<ProveedorUpdateWithoutComparativasInput, ProveedorUncheckedUpdateWithoutComparativasInput>
    create: XOR<ProveedorCreateWithoutComparativasInput, ProveedorUncheckedCreateWithoutComparativasInput>
    where?: ProveedorWhereInput
  }

  export type ProveedorUpdateToOneWithWhereWithoutComparativasInput = {
    where?: ProveedorWhereInput
    data: XOR<ProveedorUpdateWithoutComparativasInput, ProveedorUncheckedUpdateWithoutComparativasInput>
  }

  export type ProveedorUpdateWithoutComparativasInput = {
    id_proveedor?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    rfc_tax_id?: StringFieldUpdateOperationsInput | string
    razon_social?: StringFieldUpdateOperationsInput | string
    email_contacto?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    estatus?: StringFieldUpdateOperationsInput | string
    ordenes?: OrdenCompraUpdateManyWithoutProveedorNestedInput
  }

  export type ProveedorUncheckedUpdateWithoutComparativasInput = {
    id_proveedor?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    rfc_tax_id?: StringFieldUpdateOperationsInput | string
    razon_social?: StringFieldUpdateOperationsInput | string
    email_contacto?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    estatus?: StringFieldUpdateOperationsInput | string
    ordenes?: OrdenCompraUncheckedUpdateManyWithoutProveedorNestedInput
  }

  export type OrdenCompraCreateManyProveedorInput = {
    id_orden?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    fecha_emision?: Date | string
    estado?: string
    moneda?: string
    tipo_cambio?: Decimal | DecimalJsLike | number | string
    subtotal: Decimal | DecimalJsLike | number | string
    iva: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
    presupuesto_id?: string | null
  }

  export type ComparativaDetalleCreateManyProveedorInput = {
    id_detalle?: string
    tenant_id: string
    proyecto_id: string
    cuadro_id: string
    insumo_id: string
    precio_ofertado: Decimal | DecimalJsLike | number | string
    tiempo_entrega?: string | null
    es_ganador?: boolean
  }

  export type OrdenCompraUpdateWithoutProveedorInput = {
    id_orden?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    fecha_emision?: DateTimeFieldUpdateOperationsInput | Date | string
    estado?: StringFieldUpdateOperationsInput | string
    moneda?: StringFieldUpdateOperationsInput | string
    tipo_cambio?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    iva?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    presupuesto_id?: NullableStringFieldUpdateOperationsInput | string | null
    items?: OrdenCompraItemUpdateManyWithoutOrdenNestedInput
  }

  export type OrdenCompraUncheckedUpdateWithoutProveedorInput = {
    id_orden?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    fecha_emision?: DateTimeFieldUpdateOperationsInput | Date | string
    estado?: StringFieldUpdateOperationsInput | string
    moneda?: StringFieldUpdateOperationsInput | string
    tipo_cambio?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    iva?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    presupuesto_id?: NullableStringFieldUpdateOperationsInput | string | null
    items?: OrdenCompraItemUncheckedUpdateManyWithoutOrdenNestedInput
  }

  export type OrdenCompraUncheckedUpdateManyWithoutProveedorInput = {
    id_orden?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    fecha_emision?: DateTimeFieldUpdateOperationsInput | Date | string
    estado?: StringFieldUpdateOperationsInput | string
    moneda?: StringFieldUpdateOperationsInput | string
    tipo_cambio?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    iva?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    presupuesto_id?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ComparativaDetalleUpdateWithoutProveedorInput = {
    id_detalle?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    insumo_id?: StringFieldUpdateOperationsInput | string
    precio_ofertado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tiempo_entrega?: NullableStringFieldUpdateOperationsInput | string | null
    es_ganador?: BoolFieldUpdateOperationsInput | boolean
    cuadro?: CuadroComparativoUpdateOneRequiredWithoutDetallesNestedInput
  }

  export type ComparativaDetalleUncheckedUpdateWithoutProveedorInput = {
    id_detalle?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    cuadro_id?: StringFieldUpdateOperationsInput | string
    insumo_id?: StringFieldUpdateOperationsInput | string
    precio_ofertado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tiempo_entrega?: NullableStringFieldUpdateOperationsInput | string | null
    es_ganador?: BoolFieldUpdateOperationsInput | boolean
  }

  export type ComparativaDetalleUncheckedUpdateManyWithoutProveedorInput = {
    id_detalle?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    cuadro_id?: StringFieldUpdateOperationsInput | string
    insumo_id?: StringFieldUpdateOperationsInput | string
    precio_ofertado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tiempo_entrega?: NullableStringFieldUpdateOperationsInput | string | null
    es_ganador?: BoolFieldUpdateOperationsInput | boolean
  }

  export type RequisicionItemCreateManyRequisicionInput = {
    id_item?: string
    tenant_id: string
    proyecto_id: string
    insumo_id: string
    cantidad: Decimal | DecimalJsLike | number | string
    notas?: string | null
  }

  export type RequisicionItemUpdateWithoutRequisicionInput = {
    id_item?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    insumo_id?: StringFieldUpdateOperationsInput | string
    cantidad?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RequisicionItemUncheckedUpdateWithoutRequisicionInput = {
    id_item?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    insumo_id?: StringFieldUpdateOperationsInput | string
    cantidad?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RequisicionItemUncheckedUpdateManyWithoutRequisicionInput = {
    id_item?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    insumo_id?: StringFieldUpdateOperationsInput | string
    cantidad?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type OrdenCompraItemCreateManyOrdenInput = {
    id_item?: string
    tenant_id: string
    proyecto_id: string
    insumo_id: string
    cantidad: Decimal | DecimalJsLike | number | string
    precio_unitario: Decimal | DecimalJsLike | number | string
    importe: Decimal | DecimalJsLike | number | string
  }

  export type OrdenCompraItemUpdateWithoutOrdenInput = {
    id_item?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    insumo_id?: StringFieldUpdateOperationsInput | string
    cantidad?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    precio_unitario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    importe?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
  }

  export type OrdenCompraItemUncheckedUpdateWithoutOrdenInput = {
    id_item?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    insumo_id?: StringFieldUpdateOperationsInput | string
    cantidad?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    precio_unitario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    importe?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
  }

  export type OrdenCompraItemUncheckedUpdateManyWithoutOrdenInput = {
    id_item?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    insumo_id?: StringFieldUpdateOperationsInput | string
    cantidad?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    precio_unitario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    importe?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
  }

  export type ComparativaDetalleCreateManyCuadroInput = {
    id_detalle?: string
    tenant_id: string
    proyecto_id: string
    proveedor_id: string
    insumo_id: string
    precio_ofertado: Decimal | DecimalJsLike | number | string
    tiempo_entrega?: string | null
    es_ganador?: boolean
  }

  export type ComparativaDetalleUpdateWithoutCuadroInput = {
    id_detalle?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    insumo_id?: StringFieldUpdateOperationsInput | string
    precio_ofertado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tiempo_entrega?: NullableStringFieldUpdateOperationsInput | string | null
    es_ganador?: BoolFieldUpdateOperationsInput | boolean
    proveedor?: ProveedorUpdateOneRequiredWithoutComparativasNestedInput
  }

  export type ComparativaDetalleUncheckedUpdateWithoutCuadroInput = {
    id_detalle?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    proveedor_id?: StringFieldUpdateOperationsInput | string
    insumo_id?: StringFieldUpdateOperationsInput | string
    precio_ofertado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tiempo_entrega?: NullableStringFieldUpdateOperationsInput | string | null
    es_ganador?: BoolFieldUpdateOperationsInput | boolean
  }

  export type ComparativaDetalleUncheckedUpdateManyWithoutCuadroInput = {
    id_detalle?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    proveedor_id?: StringFieldUpdateOperationsInput | string
    insumo_id?: StringFieldUpdateOperationsInput | string
    precio_ofertado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tiempo_entrega?: NullableStringFieldUpdateOperationsInput | string | null
    es_ganador?: BoolFieldUpdateOperationsInput | boolean
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use ProveedorCountOutputTypeDefaultArgs instead
     */
    export type ProveedorCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProveedorCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use RequisicionCountOutputTypeDefaultArgs instead
     */
    export type RequisicionCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = RequisicionCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use OrdenCompraCountOutputTypeDefaultArgs instead
     */
    export type OrdenCompraCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = OrdenCompraCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CuadroComparativoCountOutputTypeDefaultArgs instead
     */
    export type CuadroComparativoCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CuadroComparativoCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ProveedorDefaultArgs instead
     */
    export type ProveedorArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProveedorDefaultArgs<ExtArgs>
    /**
     * @deprecated Use RequisicionDefaultArgs instead
     */
    export type RequisicionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = RequisicionDefaultArgs<ExtArgs>
    /**
     * @deprecated Use RequisicionItemDefaultArgs instead
     */
    export type RequisicionItemArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = RequisicionItemDefaultArgs<ExtArgs>
    /**
     * @deprecated Use OrdenCompraDefaultArgs instead
     */
    export type OrdenCompraArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = OrdenCompraDefaultArgs<ExtArgs>
    /**
     * @deprecated Use OrdenCompraItemDefaultArgs instead
     */
    export type OrdenCompraItemArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = OrdenCompraItemDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CuadroComparativoDefaultArgs instead
     */
    export type CuadroComparativoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CuadroComparativoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ComparativaDetalleDefaultArgs instead
     */
    export type ComparativaDetalleArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ComparativaDetalleDefaultArgs<ExtArgs>

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