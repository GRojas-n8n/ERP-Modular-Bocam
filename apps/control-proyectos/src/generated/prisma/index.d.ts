
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
 * Model ProgramacionObra
 * 
 */
export type ProgramacionObra = $Result.DefaultSelection<Prisma.$ProgramacionObraPayload>
/**
 * Model AlertaProyecto
 * 
 */
export type AlertaProyecto = $Result.DefaultSelection<Prisma.$AlertaProyectoPayload>
/**
 * Model ProyeccionCierre
 * 
 */
export type ProyeccionCierre = $Result.DefaultSelection<Prisma.$ProyeccionCierrePayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more ProgramacionObras
 * const programacionObras = await prisma.programacionObra.findMany()
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
   * // Fetch zero or more ProgramacionObras
   * const programacionObras = await prisma.programacionObra.findMany()
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
   * `prisma.programacionObra`: Exposes CRUD operations for the **ProgramacionObra** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ProgramacionObras
    * const programacionObras = await prisma.programacionObra.findMany()
    * ```
    */
  get programacionObra(): Prisma.ProgramacionObraDelegate<ExtArgs>;

  /**
   * `prisma.alertaProyecto`: Exposes CRUD operations for the **AlertaProyecto** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AlertaProyectos
    * const alertaProyectos = await prisma.alertaProyecto.findMany()
    * ```
    */
  get alertaProyecto(): Prisma.AlertaProyectoDelegate<ExtArgs>;

  /**
   * `prisma.proyeccionCierre`: Exposes CRUD operations for the **ProyeccionCierre** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ProyeccionCierres
    * const proyeccionCierres = await prisma.proyeccionCierre.findMany()
    * ```
    */
  get proyeccionCierre(): Prisma.ProyeccionCierreDelegate<ExtArgs>;
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
    ProgramacionObra: 'ProgramacionObra',
    AlertaProyecto: 'AlertaProyecto',
    ProyeccionCierre: 'ProyeccionCierre'
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
      modelProps: "programacionObra" | "alertaProyecto" | "proyeccionCierre"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      ProgramacionObra: {
        payload: Prisma.$ProgramacionObraPayload<ExtArgs>
        fields: Prisma.ProgramacionObraFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProgramacionObraFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgramacionObraPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProgramacionObraFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgramacionObraPayload>
          }
          findFirst: {
            args: Prisma.ProgramacionObraFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgramacionObraPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProgramacionObraFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgramacionObraPayload>
          }
          findMany: {
            args: Prisma.ProgramacionObraFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgramacionObraPayload>[]
          }
          create: {
            args: Prisma.ProgramacionObraCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgramacionObraPayload>
          }
          createMany: {
            args: Prisma.ProgramacionObraCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProgramacionObraCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgramacionObraPayload>[]
          }
          delete: {
            args: Prisma.ProgramacionObraDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgramacionObraPayload>
          }
          update: {
            args: Prisma.ProgramacionObraUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgramacionObraPayload>
          }
          deleteMany: {
            args: Prisma.ProgramacionObraDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProgramacionObraUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ProgramacionObraUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgramacionObraPayload>
          }
          aggregate: {
            args: Prisma.ProgramacionObraAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProgramacionObra>
          }
          groupBy: {
            args: Prisma.ProgramacionObraGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProgramacionObraGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProgramacionObraCountArgs<ExtArgs>
            result: $Utils.Optional<ProgramacionObraCountAggregateOutputType> | number
          }
        }
      }
      AlertaProyecto: {
        payload: Prisma.$AlertaProyectoPayload<ExtArgs>
        fields: Prisma.AlertaProyectoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AlertaProyectoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertaProyectoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AlertaProyectoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertaProyectoPayload>
          }
          findFirst: {
            args: Prisma.AlertaProyectoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertaProyectoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AlertaProyectoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertaProyectoPayload>
          }
          findMany: {
            args: Prisma.AlertaProyectoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertaProyectoPayload>[]
          }
          create: {
            args: Prisma.AlertaProyectoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertaProyectoPayload>
          }
          createMany: {
            args: Prisma.AlertaProyectoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AlertaProyectoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertaProyectoPayload>[]
          }
          delete: {
            args: Prisma.AlertaProyectoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertaProyectoPayload>
          }
          update: {
            args: Prisma.AlertaProyectoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertaProyectoPayload>
          }
          deleteMany: {
            args: Prisma.AlertaProyectoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AlertaProyectoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AlertaProyectoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertaProyectoPayload>
          }
          aggregate: {
            args: Prisma.AlertaProyectoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAlertaProyecto>
          }
          groupBy: {
            args: Prisma.AlertaProyectoGroupByArgs<ExtArgs>
            result: $Utils.Optional<AlertaProyectoGroupByOutputType>[]
          }
          count: {
            args: Prisma.AlertaProyectoCountArgs<ExtArgs>
            result: $Utils.Optional<AlertaProyectoCountAggregateOutputType> | number
          }
        }
      }
      ProyeccionCierre: {
        payload: Prisma.$ProyeccionCierrePayload<ExtArgs>
        fields: Prisma.ProyeccionCierreFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProyeccionCierreFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProyeccionCierrePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProyeccionCierreFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProyeccionCierrePayload>
          }
          findFirst: {
            args: Prisma.ProyeccionCierreFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProyeccionCierrePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProyeccionCierreFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProyeccionCierrePayload>
          }
          findMany: {
            args: Prisma.ProyeccionCierreFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProyeccionCierrePayload>[]
          }
          create: {
            args: Prisma.ProyeccionCierreCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProyeccionCierrePayload>
          }
          createMany: {
            args: Prisma.ProyeccionCierreCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProyeccionCierreCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProyeccionCierrePayload>[]
          }
          delete: {
            args: Prisma.ProyeccionCierreDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProyeccionCierrePayload>
          }
          update: {
            args: Prisma.ProyeccionCierreUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProyeccionCierrePayload>
          }
          deleteMany: {
            args: Prisma.ProyeccionCierreDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProyeccionCierreUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ProyeccionCierreUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProyeccionCierrePayload>
          }
          aggregate: {
            args: Prisma.ProyeccionCierreAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProyeccionCierre>
          }
          groupBy: {
            args: Prisma.ProyeccionCierreGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProyeccionCierreGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProyeccionCierreCountArgs<ExtArgs>
            result: $Utils.Optional<ProyeccionCierreCountAggregateOutputType> | number
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
   * Model ProgramacionObra
   */

  export type AggregateProgramacionObra = {
    _count: ProgramacionObraCountAggregateOutputType | null
    _avg: ProgramacionObraAvgAggregateOutputType | null
    _sum: ProgramacionObraSumAggregateOutputType | null
    _min: ProgramacionObraMinAggregateOutputType | null
    _max: ProgramacionObraMaxAggregateOutputType | null
  }

  export type ProgramacionObraAvgAggregateOutputType = {
    pct_avance_real: Decimal | null
    cpi: Decimal | null
    spi: Decimal | null
    eac: Decimal | null
    bac: Decimal | null
  }

  export type ProgramacionObraSumAggregateOutputType = {
    pct_avance_real: Decimal | null
    cpi: Decimal | null
    spi: Decimal | null
    eac: Decimal | null
    bac: Decimal | null
  }

  export type ProgramacionObraMinAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    proyecto_id: string | null
    concepto_id: string | null
    concepto_clave: string | null
    descripcion: string | null
    fecha_inicio_plan: Date | null
    fecha_fin_plan: Date | null
    fecha_inicio_real: Date | null
    fecha_fin_real: Date | null
    pct_avance_real: Decimal | null
    cpi: Decimal | null
    spi: Decimal | null
    eac: Decimal | null
    bac: Decimal | null
    estado: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type ProgramacionObraMaxAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    proyecto_id: string | null
    concepto_id: string | null
    concepto_clave: string | null
    descripcion: string | null
    fecha_inicio_plan: Date | null
    fecha_fin_plan: Date | null
    fecha_inicio_real: Date | null
    fecha_fin_real: Date | null
    pct_avance_real: Decimal | null
    cpi: Decimal | null
    spi: Decimal | null
    eac: Decimal | null
    bac: Decimal | null
    estado: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type ProgramacionObraCountAggregateOutputType = {
    id: number
    tenant_id: number
    proyecto_id: number
    concepto_id: number
    concepto_clave: number
    descripcion: number
    fecha_inicio_plan: number
    fecha_fin_plan: number
    curva_programada: number
    fecha_inicio_real: number
    fecha_fin_real: number
    pct_avance_real: number
    cpi: number
    spi: number
    eac: number
    bac: number
    estado: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type ProgramacionObraAvgAggregateInputType = {
    pct_avance_real?: true
    cpi?: true
    spi?: true
    eac?: true
    bac?: true
  }

  export type ProgramacionObraSumAggregateInputType = {
    pct_avance_real?: true
    cpi?: true
    spi?: true
    eac?: true
    bac?: true
  }

  export type ProgramacionObraMinAggregateInputType = {
    id?: true
    tenant_id?: true
    proyecto_id?: true
    concepto_id?: true
    concepto_clave?: true
    descripcion?: true
    fecha_inicio_plan?: true
    fecha_fin_plan?: true
    fecha_inicio_real?: true
    fecha_fin_real?: true
    pct_avance_real?: true
    cpi?: true
    spi?: true
    eac?: true
    bac?: true
    estado?: true
    created_at?: true
    updated_at?: true
  }

  export type ProgramacionObraMaxAggregateInputType = {
    id?: true
    tenant_id?: true
    proyecto_id?: true
    concepto_id?: true
    concepto_clave?: true
    descripcion?: true
    fecha_inicio_plan?: true
    fecha_fin_plan?: true
    fecha_inicio_real?: true
    fecha_fin_real?: true
    pct_avance_real?: true
    cpi?: true
    spi?: true
    eac?: true
    bac?: true
    estado?: true
    created_at?: true
    updated_at?: true
  }

  export type ProgramacionObraCountAggregateInputType = {
    id?: true
    tenant_id?: true
    proyecto_id?: true
    concepto_id?: true
    concepto_clave?: true
    descripcion?: true
    fecha_inicio_plan?: true
    fecha_fin_plan?: true
    curva_programada?: true
    fecha_inicio_real?: true
    fecha_fin_real?: true
    pct_avance_real?: true
    cpi?: true
    spi?: true
    eac?: true
    bac?: true
    estado?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type ProgramacionObraAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProgramacionObra to aggregate.
     */
    where?: ProgramacionObraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProgramacionObras to fetch.
     */
    orderBy?: ProgramacionObraOrderByWithRelationInput | ProgramacionObraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProgramacionObraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProgramacionObras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProgramacionObras.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ProgramacionObras
    **/
    _count?: true | ProgramacionObraCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ProgramacionObraAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ProgramacionObraSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProgramacionObraMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProgramacionObraMaxAggregateInputType
  }

  export type GetProgramacionObraAggregateType<T extends ProgramacionObraAggregateArgs> = {
        [P in keyof T & keyof AggregateProgramacionObra]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProgramacionObra[P]>
      : GetScalarType<T[P], AggregateProgramacionObra[P]>
  }




  export type ProgramacionObraGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProgramacionObraWhereInput
    orderBy?: ProgramacionObraOrderByWithAggregationInput | ProgramacionObraOrderByWithAggregationInput[]
    by: ProgramacionObraScalarFieldEnum[] | ProgramacionObraScalarFieldEnum
    having?: ProgramacionObraScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProgramacionObraCountAggregateInputType | true
    _avg?: ProgramacionObraAvgAggregateInputType
    _sum?: ProgramacionObraSumAggregateInputType
    _min?: ProgramacionObraMinAggregateInputType
    _max?: ProgramacionObraMaxAggregateInputType
  }

  export type ProgramacionObraGroupByOutputType = {
    id: string
    tenant_id: string
    proyecto_id: string
    concepto_id: string
    concepto_clave: string
    descripcion: string
    fecha_inicio_plan: Date
    fecha_fin_plan: Date
    curva_programada: JsonValue
    fecha_inicio_real: Date | null
    fecha_fin_real: Date | null
    pct_avance_real: Decimal
    cpi: Decimal | null
    spi: Decimal | null
    eac: Decimal | null
    bac: Decimal
    estado: string
    created_at: Date
    updated_at: Date
    _count: ProgramacionObraCountAggregateOutputType | null
    _avg: ProgramacionObraAvgAggregateOutputType | null
    _sum: ProgramacionObraSumAggregateOutputType | null
    _min: ProgramacionObraMinAggregateOutputType | null
    _max: ProgramacionObraMaxAggregateOutputType | null
  }

  type GetProgramacionObraGroupByPayload<T extends ProgramacionObraGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProgramacionObraGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProgramacionObraGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProgramacionObraGroupByOutputType[P]>
            : GetScalarType<T[P], ProgramacionObraGroupByOutputType[P]>
        }
      >
    >


  export type ProgramacionObraSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    concepto_id?: boolean
    concepto_clave?: boolean
    descripcion?: boolean
    fecha_inicio_plan?: boolean
    fecha_fin_plan?: boolean
    curva_programada?: boolean
    fecha_inicio_real?: boolean
    fecha_fin_real?: boolean
    pct_avance_real?: boolean
    cpi?: boolean
    spi?: boolean
    eac?: boolean
    bac?: boolean
    estado?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["programacionObra"]>

  export type ProgramacionObraSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    concepto_id?: boolean
    concepto_clave?: boolean
    descripcion?: boolean
    fecha_inicio_plan?: boolean
    fecha_fin_plan?: boolean
    curva_programada?: boolean
    fecha_inicio_real?: boolean
    fecha_fin_real?: boolean
    pct_avance_real?: boolean
    cpi?: boolean
    spi?: boolean
    eac?: boolean
    bac?: boolean
    estado?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["programacionObra"]>

  export type ProgramacionObraSelectScalar = {
    id?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    concepto_id?: boolean
    concepto_clave?: boolean
    descripcion?: boolean
    fecha_inicio_plan?: boolean
    fecha_fin_plan?: boolean
    curva_programada?: boolean
    fecha_inicio_real?: boolean
    fecha_fin_real?: boolean
    pct_avance_real?: boolean
    cpi?: boolean
    spi?: boolean
    eac?: boolean
    bac?: boolean
    estado?: boolean
    created_at?: boolean
    updated_at?: boolean
  }


  export type $ProgramacionObraPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ProgramacionObra"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenant_id: string
      proyecto_id: string
      concepto_id: string
      concepto_clave: string
      descripcion: string
      fecha_inicio_plan: Date
      fecha_fin_plan: Date
      curva_programada: Prisma.JsonValue
      fecha_inicio_real: Date | null
      fecha_fin_real: Date | null
      pct_avance_real: Prisma.Decimal
      cpi: Prisma.Decimal | null
      spi: Prisma.Decimal | null
      eac: Prisma.Decimal | null
      bac: Prisma.Decimal
      estado: string
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["programacionObra"]>
    composites: {}
  }

  type ProgramacionObraGetPayload<S extends boolean | null | undefined | ProgramacionObraDefaultArgs> = $Result.GetResult<Prisma.$ProgramacionObraPayload, S>

  type ProgramacionObraCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ProgramacionObraFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ProgramacionObraCountAggregateInputType | true
    }

  export interface ProgramacionObraDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ProgramacionObra'], meta: { name: 'ProgramacionObra' } }
    /**
     * Find zero or one ProgramacionObra that matches the filter.
     * @param {ProgramacionObraFindUniqueArgs} args - Arguments to find a ProgramacionObra
     * @example
     * // Get one ProgramacionObra
     * const programacionObra = await prisma.programacionObra.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProgramacionObraFindUniqueArgs>(args: SelectSubset<T, ProgramacionObraFindUniqueArgs<ExtArgs>>): Prisma__ProgramacionObraClient<$Result.GetResult<Prisma.$ProgramacionObraPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ProgramacionObra that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ProgramacionObraFindUniqueOrThrowArgs} args - Arguments to find a ProgramacionObra
     * @example
     * // Get one ProgramacionObra
     * const programacionObra = await prisma.programacionObra.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProgramacionObraFindUniqueOrThrowArgs>(args: SelectSubset<T, ProgramacionObraFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProgramacionObraClient<$Result.GetResult<Prisma.$ProgramacionObraPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ProgramacionObra that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProgramacionObraFindFirstArgs} args - Arguments to find a ProgramacionObra
     * @example
     * // Get one ProgramacionObra
     * const programacionObra = await prisma.programacionObra.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProgramacionObraFindFirstArgs>(args?: SelectSubset<T, ProgramacionObraFindFirstArgs<ExtArgs>>): Prisma__ProgramacionObraClient<$Result.GetResult<Prisma.$ProgramacionObraPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ProgramacionObra that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProgramacionObraFindFirstOrThrowArgs} args - Arguments to find a ProgramacionObra
     * @example
     * // Get one ProgramacionObra
     * const programacionObra = await prisma.programacionObra.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProgramacionObraFindFirstOrThrowArgs>(args?: SelectSubset<T, ProgramacionObraFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProgramacionObraClient<$Result.GetResult<Prisma.$ProgramacionObraPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ProgramacionObras that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProgramacionObraFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ProgramacionObras
     * const programacionObras = await prisma.programacionObra.findMany()
     * 
     * // Get first 10 ProgramacionObras
     * const programacionObras = await prisma.programacionObra.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const programacionObraWithIdOnly = await prisma.programacionObra.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProgramacionObraFindManyArgs>(args?: SelectSubset<T, ProgramacionObraFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProgramacionObraPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ProgramacionObra.
     * @param {ProgramacionObraCreateArgs} args - Arguments to create a ProgramacionObra.
     * @example
     * // Create one ProgramacionObra
     * const ProgramacionObra = await prisma.programacionObra.create({
     *   data: {
     *     // ... data to create a ProgramacionObra
     *   }
     * })
     * 
     */
    create<T extends ProgramacionObraCreateArgs>(args: SelectSubset<T, ProgramacionObraCreateArgs<ExtArgs>>): Prisma__ProgramacionObraClient<$Result.GetResult<Prisma.$ProgramacionObraPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ProgramacionObras.
     * @param {ProgramacionObraCreateManyArgs} args - Arguments to create many ProgramacionObras.
     * @example
     * // Create many ProgramacionObras
     * const programacionObra = await prisma.programacionObra.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProgramacionObraCreateManyArgs>(args?: SelectSubset<T, ProgramacionObraCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ProgramacionObras and returns the data saved in the database.
     * @param {ProgramacionObraCreateManyAndReturnArgs} args - Arguments to create many ProgramacionObras.
     * @example
     * // Create many ProgramacionObras
     * const programacionObra = await prisma.programacionObra.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ProgramacionObras and only return the `id`
     * const programacionObraWithIdOnly = await prisma.programacionObra.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProgramacionObraCreateManyAndReturnArgs>(args?: SelectSubset<T, ProgramacionObraCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProgramacionObraPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ProgramacionObra.
     * @param {ProgramacionObraDeleteArgs} args - Arguments to delete one ProgramacionObra.
     * @example
     * // Delete one ProgramacionObra
     * const ProgramacionObra = await prisma.programacionObra.delete({
     *   where: {
     *     // ... filter to delete one ProgramacionObra
     *   }
     * })
     * 
     */
    delete<T extends ProgramacionObraDeleteArgs>(args: SelectSubset<T, ProgramacionObraDeleteArgs<ExtArgs>>): Prisma__ProgramacionObraClient<$Result.GetResult<Prisma.$ProgramacionObraPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ProgramacionObra.
     * @param {ProgramacionObraUpdateArgs} args - Arguments to update one ProgramacionObra.
     * @example
     * // Update one ProgramacionObra
     * const programacionObra = await prisma.programacionObra.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProgramacionObraUpdateArgs>(args: SelectSubset<T, ProgramacionObraUpdateArgs<ExtArgs>>): Prisma__ProgramacionObraClient<$Result.GetResult<Prisma.$ProgramacionObraPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ProgramacionObras.
     * @param {ProgramacionObraDeleteManyArgs} args - Arguments to filter ProgramacionObras to delete.
     * @example
     * // Delete a few ProgramacionObras
     * const { count } = await prisma.programacionObra.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProgramacionObraDeleteManyArgs>(args?: SelectSubset<T, ProgramacionObraDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ProgramacionObras.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProgramacionObraUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ProgramacionObras
     * const programacionObra = await prisma.programacionObra.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProgramacionObraUpdateManyArgs>(args: SelectSubset<T, ProgramacionObraUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ProgramacionObra.
     * @param {ProgramacionObraUpsertArgs} args - Arguments to update or create a ProgramacionObra.
     * @example
     * // Update or create a ProgramacionObra
     * const programacionObra = await prisma.programacionObra.upsert({
     *   create: {
     *     // ... data to create a ProgramacionObra
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ProgramacionObra we want to update
     *   }
     * })
     */
    upsert<T extends ProgramacionObraUpsertArgs>(args: SelectSubset<T, ProgramacionObraUpsertArgs<ExtArgs>>): Prisma__ProgramacionObraClient<$Result.GetResult<Prisma.$ProgramacionObraPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ProgramacionObras.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProgramacionObraCountArgs} args - Arguments to filter ProgramacionObras to count.
     * @example
     * // Count the number of ProgramacionObras
     * const count = await prisma.programacionObra.count({
     *   where: {
     *     // ... the filter for the ProgramacionObras we want to count
     *   }
     * })
    **/
    count<T extends ProgramacionObraCountArgs>(
      args?: Subset<T, ProgramacionObraCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProgramacionObraCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ProgramacionObra.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProgramacionObraAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ProgramacionObraAggregateArgs>(args: Subset<T, ProgramacionObraAggregateArgs>): Prisma.PrismaPromise<GetProgramacionObraAggregateType<T>>

    /**
     * Group by ProgramacionObra.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProgramacionObraGroupByArgs} args - Group by arguments.
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
      T extends ProgramacionObraGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProgramacionObraGroupByArgs['orderBy'] }
        : { orderBy?: ProgramacionObraGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ProgramacionObraGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProgramacionObraGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ProgramacionObra model
   */
  readonly fields: ProgramacionObraFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ProgramacionObra.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProgramacionObraClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the ProgramacionObra model
   */ 
  interface ProgramacionObraFieldRefs {
    readonly id: FieldRef<"ProgramacionObra", 'String'>
    readonly tenant_id: FieldRef<"ProgramacionObra", 'String'>
    readonly proyecto_id: FieldRef<"ProgramacionObra", 'String'>
    readonly concepto_id: FieldRef<"ProgramacionObra", 'String'>
    readonly concepto_clave: FieldRef<"ProgramacionObra", 'String'>
    readonly descripcion: FieldRef<"ProgramacionObra", 'String'>
    readonly fecha_inicio_plan: FieldRef<"ProgramacionObra", 'DateTime'>
    readonly fecha_fin_plan: FieldRef<"ProgramacionObra", 'DateTime'>
    readonly curva_programada: FieldRef<"ProgramacionObra", 'Json'>
    readonly fecha_inicio_real: FieldRef<"ProgramacionObra", 'DateTime'>
    readonly fecha_fin_real: FieldRef<"ProgramacionObra", 'DateTime'>
    readonly pct_avance_real: FieldRef<"ProgramacionObra", 'Decimal'>
    readonly cpi: FieldRef<"ProgramacionObra", 'Decimal'>
    readonly spi: FieldRef<"ProgramacionObra", 'Decimal'>
    readonly eac: FieldRef<"ProgramacionObra", 'Decimal'>
    readonly bac: FieldRef<"ProgramacionObra", 'Decimal'>
    readonly estado: FieldRef<"ProgramacionObra", 'String'>
    readonly created_at: FieldRef<"ProgramacionObra", 'DateTime'>
    readonly updated_at: FieldRef<"ProgramacionObra", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ProgramacionObra findUnique
   */
  export type ProgramacionObraFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProgramacionObra
     */
    select?: ProgramacionObraSelect<ExtArgs> | null
    /**
     * Filter, which ProgramacionObra to fetch.
     */
    where: ProgramacionObraWhereUniqueInput
  }

  /**
   * ProgramacionObra findUniqueOrThrow
   */
  export type ProgramacionObraFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProgramacionObra
     */
    select?: ProgramacionObraSelect<ExtArgs> | null
    /**
     * Filter, which ProgramacionObra to fetch.
     */
    where: ProgramacionObraWhereUniqueInput
  }

  /**
   * ProgramacionObra findFirst
   */
  export type ProgramacionObraFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProgramacionObra
     */
    select?: ProgramacionObraSelect<ExtArgs> | null
    /**
     * Filter, which ProgramacionObra to fetch.
     */
    where?: ProgramacionObraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProgramacionObras to fetch.
     */
    orderBy?: ProgramacionObraOrderByWithRelationInput | ProgramacionObraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProgramacionObras.
     */
    cursor?: ProgramacionObraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProgramacionObras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProgramacionObras.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProgramacionObras.
     */
    distinct?: ProgramacionObraScalarFieldEnum | ProgramacionObraScalarFieldEnum[]
  }

  /**
   * ProgramacionObra findFirstOrThrow
   */
  export type ProgramacionObraFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProgramacionObra
     */
    select?: ProgramacionObraSelect<ExtArgs> | null
    /**
     * Filter, which ProgramacionObra to fetch.
     */
    where?: ProgramacionObraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProgramacionObras to fetch.
     */
    orderBy?: ProgramacionObraOrderByWithRelationInput | ProgramacionObraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProgramacionObras.
     */
    cursor?: ProgramacionObraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProgramacionObras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProgramacionObras.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProgramacionObras.
     */
    distinct?: ProgramacionObraScalarFieldEnum | ProgramacionObraScalarFieldEnum[]
  }

  /**
   * ProgramacionObra findMany
   */
  export type ProgramacionObraFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProgramacionObra
     */
    select?: ProgramacionObraSelect<ExtArgs> | null
    /**
     * Filter, which ProgramacionObras to fetch.
     */
    where?: ProgramacionObraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProgramacionObras to fetch.
     */
    orderBy?: ProgramacionObraOrderByWithRelationInput | ProgramacionObraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ProgramacionObras.
     */
    cursor?: ProgramacionObraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProgramacionObras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProgramacionObras.
     */
    skip?: number
    distinct?: ProgramacionObraScalarFieldEnum | ProgramacionObraScalarFieldEnum[]
  }

  /**
   * ProgramacionObra create
   */
  export type ProgramacionObraCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProgramacionObra
     */
    select?: ProgramacionObraSelect<ExtArgs> | null
    /**
     * The data needed to create a ProgramacionObra.
     */
    data: XOR<ProgramacionObraCreateInput, ProgramacionObraUncheckedCreateInput>
  }

  /**
   * ProgramacionObra createMany
   */
  export type ProgramacionObraCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ProgramacionObras.
     */
    data: ProgramacionObraCreateManyInput | ProgramacionObraCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ProgramacionObra createManyAndReturn
   */
  export type ProgramacionObraCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProgramacionObra
     */
    select?: ProgramacionObraSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ProgramacionObras.
     */
    data: ProgramacionObraCreateManyInput | ProgramacionObraCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ProgramacionObra update
   */
  export type ProgramacionObraUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProgramacionObra
     */
    select?: ProgramacionObraSelect<ExtArgs> | null
    /**
     * The data needed to update a ProgramacionObra.
     */
    data: XOR<ProgramacionObraUpdateInput, ProgramacionObraUncheckedUpdateInput>
    /**
     * Choose, which ProgramacionObra to update.
     */
    where: ProgramacionObraWhereUniqueInput
  }

  /**
   * ProgramacionObra updateMany
   */
  export type ProgramacionObraUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ProgramacionObras.
     */
    data: XOR<ProgramacionObraUpdateManyMutationInput, ProgramacionObraUncheckedUpdateManyInput>
    /**
     * Filter which ProgramacionObras to update
     */
    where?: ProgramacionObraWhereInput
  }

  /**
   * ProgramacionObra upsert
   */
  export type ProgramacionObraUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProgramacionObra
     */
    select?: ProgramacionObraSelect<ExtArgs> | null
    /**
     * The filter to search for the ProgramacionObra to update in case it exists.
     */
    where: ProgramacionObraWhereUniqueInput
    /**
     * In case the ProgramacionObra found by the `where` argument doesn't exist, create a new ProgramacionObra with this data.
     */
    create: XOR<ProgramacionObraCreateInput, ProgramacionObraUncheckedCreateInput>
    /**
     * In case the ProgramacionObra was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProgramacionObraUpdateInput, ProgramacionObraUncheckedUpdateInput>
  }

  /**
   * ProgramacionObra delete
   */
  export type ProgramacionObraDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProgramacionObra
     */
    select?: ProgramacionObraSelect<ExtArgs> | null
    /**
     * Filter which ProgramacionObra to delete.
     */
    where: ProgramacionObraWhereUniqueInput
  }

  /**
   * ProgramacionObra deleteMany
   */
  export type ProgramacionObraDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProgramacionObras to delete
     */
    where?: ProgramacionObraWhereInput
  }

  /**
   * ProgramacionObra without action
   */
  export type ProgramacionObraDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProgramacionObra
     */
    select?: ProgramacionObraSelect<ExtArgs> | null
  }


  /**
   * Model AlertaProyecto
   */

  export type AggregateAlertaProyecto = {
    _count: AlertaProyectoCountAggregateOutputType | null
    _min: AlertaProyectoMinAggregateOutputType | null
    _max: AlertaProyectoMaxAggregateOutputType | null
  }

  export type AlertaProyectoMinAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    proyecto_id: string | null
    concepto_id: string | null
    tipo: string | null
    severidad: string | null
    titulo: string | null
    descripcion: string | null
    estado: string | null
    nota_cp: string | null
    resuelta_en: Date | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type AlertaProyectoMaxAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    proyecto_id: string | null
    concepto_id: string | null
    tipo: string | null
    severidad: string | null
    titulo: string | null
    descripcion: string | null
    estado: string | null
    nota_cp: string | null
    resuelta_en: Date | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type AlertaProyectoCountAggregateOutputType = {
    id: number
    tenant_id: number
    proyecto_id: number
    concepto_id: number
    tipo: number
    severidad: number
    titulo: number
    descripcion: number
    datos: number
    estado: number
    nota_cp: number
    resuelta_en: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type AlertaProyectoMinAggregateInputType = {
    id?: true
    tenant_id?: true
    proyecto_id?: true
    concepto_id?: true
    tipo?: true
    severidad?: true
    titulo?: true
    descripcion?: true
    estado?: true
    nota_cp?: true
    resuelta_en?: true
    created_at?: true
    updated_at?: true
  }

  export type AlertaProyectoMaxAggregateInputType = {
    id?: true
    tenant_id?: true
    proyecto_id?: true
    concepto_id?: true
    tipo?: true
    severidad?: true
    titulo?: true
    descripcion?: true
    estado?: true
    nota_cp?: true
    resuelta_en?: true
    created_at?: true
    updated_at?: true
  }

  export type AlertaProyectoCountAggregateInputType = {
    id?: true
    tenant_id?: true
    proyecto_id?: true
    concepto_id?: true
    tipo?: true
    severidad?: true
    titulo?: true
    descripcion?: true
    datos?: true
    estado?: true
    nota_cp?: true
    resuelta_en?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type AlertaProyectoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AlertaProyecto to aggregate.
     */
    where?: AlertaProyectoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AlertaProyectos to fetch.
     */
    orderBy?: AlertaProyectoOrderByWithRelationInput | AlertaProyectoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AlertaProyectoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AlertaProyectos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AlertaProyectos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AlertaProyectos
    **/
    _count?: true | AlertaProyectoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AlertaProyectoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AlertaProyectoMaxAggregateInputType
  }

  export type GetAlertaProyectoAggregateType<T extends AlertaProyectoAggregateArgs> = {
        [P in keyof T & keyof AggregateAlertaProyecto]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAlertaProyecto[P]>
      : GetScalarType<T[P], AggregateAlertaProyecto[P]>
  }




  export type AlertaProyectoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AlertaProyectoWhereInput
    orderBy?: AlertaProyectoOrderByWithAggregationInput | AlertaProyectoOrderByWithAggregationInput[]
    by: AlertaProyectoScalarFieldEnum[] | AlertaProyectoScalarFieldEnum
    having?: AlertaProyectoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AlertaProyectoCountAggregateInputType | true
    _min?: AlertaProyectoMinAggregateInputType
    _max?: AlertaProyectoMaxAggregateInputType
  }

  export type AlertaProyectoGroupByOutputType = {
    id: string
    tenant_id: string
    proyecto_id: string
    concepto_id: string | null
    tipo: string
    severidad: string
    titulo: string
    descripcion: string
    datos: JsonValue
    estado: string
    nota_cp: string | null
    resuelta_en: Date | null
    created_at: Date
    updated_at: Date
    _count: AlertaProyectoCountAggregateOutputType | null
    _min: AlertaProyectoMinAggregateOutputType | null
    _max: AlertaProyectoMaxAggregateOutputType | null
  }

  type GetAlertaProyectoGroupByPayload<T extends AlertaProyectoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AlertaProyectoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AlertaProyectoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AlertaProyectoGroupByOutputType[P]>
            : GetScalarType<T[P], AlertaProyectoGroupByOutputType[P]>
        }
      >
    >


  export type AlertaProyectoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    concepto_id?: boolean
    tipo?: boolean
    severidad?: boolean
    titulo?: boolean
    descripcion?: boolean
    datos?: boolean
    estado?: boolean
    nota_cp?: boolean
    resuelta_en?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["alertaProyecto"]>

  export type AlertaProyectoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    concepto_id?: boolean
    tipo?: boolean
    severidad?: boolean
    titulo?: boolean
    descripcion?: boolean
    datos?: boolean
    estado?: boolean
    nota_cp?: boolean
    resuelta_en?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["alertaProyecto"]>

  export type AlertaProyectoSelectScalar = {
    id?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    concepto_id?: boolean
    tipo?: boolean
    severidad?: boolean
    titulo?: boolean
    descripcion?: boolean
    datos?: boolean
    estado?: boolean
    nota_cp?: boolean
    resuelta_en?: boolean
    created_at?: boolean
    updated_at?: boolean
  }


  export type $AlertaProyectoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AlertaProyecto"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenant_id: string
      proyecto_id: string
      concepto_id: string | null
      tipo: string
      severidad: string
      titulo: string
      descripcion: string
      datos: Prisma.JsonValue
      estado: string
      nota_cp: string | null
      resuelta_en: Date | null
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["alertaProyecto"]>
    composites: {}
  }

  type AlertaProyectoGetPayload<S extends boolean | null | undefined | AlertaProyectoDefaultArgs> = $Result.GetResult<Prisma.$AlertaProyectoPayload, S>

  type AlertaProyectoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<AlertaProyectoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: AlertaProyectoCountAggregateInputType | true
    }

  export interface AlertaProyectoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AlertaProyecto'], meta: { name: 'AlertaProyecto' } }
    /**
     * Find zero or one AlertaProyecto that matches the filter.
     * @param {AlertaProyectoFindUniqueArgs} args - Arguments to find a AlertaProyecto
     * @example
     * // Get one AlertaProyecto
     * const alertaProyecto = await prisma.alertaProyecto.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AlertaProyectoFindUniqueArgs>(args: SelectSubset<T, AlertaProyectoFindUniqueArgs<ExtArgs>>): Prisma__AlertaProyectoClient<$Result.GetResult<Prisma.$AlertaProyectoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one AlertaProyecto that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {AlertaProyectoFindUniqueOrThrowArgs} args - Arguments to find a AlertaProyecto
     * @example
     * // Get one AlertaProyecto
     * const alertaProyecto = await prisma.alertaProyecto.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AlertaProyectoFindUniqueOrThrowArgs>(args: SelectSubset<T, AlertaProyectoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AlertaProyectoClient<$Result.GetResult<Prisma.$AlertaProyectoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first AlertaProyecto that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlertaProyectoFindFirstArgs} args - Arguments to find a AlertaProyecto
     * @example
     * // Get one AlertaProyecto
     * const alertaProyecto = await prisma.alertaProyecto.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AlertaProyectoFindFirstArgs>(args?: SelectSubset<T, AlertaProyectoFindFirstArgs<ExtArgs>>): Prisma__AlertaProyectoClient<$Result.GetResult<Prisma.$AlertaProyectoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first AlertaProyecto that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlertaProyectoFindFirstOrThrowArgs} args - Arguments to find a AlertaProyecto
     * @example
     * // Get one AlertaProyecto
     * const alertaProyecto = await prisma.alertaProyecto.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AlertaProyectoFindFirstOrThrowArgs>(args?: SelectSubset<T, AlertaProyectoFindFirstOrThrowArgs<ExtArgs>>): Prisma__AlertaProyectoClient<$Result.GetResult<Prisma.$AlertaProyectoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more AlertaProyectos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlertaProyectoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AlertaProyectos
     * const alertaProyectos = await prisma.alertaProyecto.findMany()
     * 
     * // Get first 10 AlertaProyectos
     * const alertaProyectos = await prisma.alertaProyecto.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const alertaProyectoWithIdOnly = await prisma.alertaProyecto.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AlertaProyectoFindManyArgs>(args?: SelectSubset<T, AlertaProyectoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AlertaProyectoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a AlertaProyecto.
     * @param {AlertaProyectoCreateArgs} args - Arguments to create a AlertaProyecto.
     * @example
     * // Create one AlertaProyecto
     * const AlertaProyecto = await prisma.alertaProyecto.create({
     *   data: {
     *     // ... data to create a AlertaProyecto
     *   }
     * })
     * 
     */
    create<T extends AlertaProyectoCreateArgs>(args: SelectSubset<T, AlertaProyectoCreateArgs<ExtArgs>>): Prisma__AlertaProyectoClient<$Result.GetResult<Prisma.$AlertaProyectoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many AlertaProyectos.
     * @param {AlertaProyectoCreateManyArgs} args - Arguments to create many AlertaProyectos.
     * @example
     * // Create many AlertaProyectos
     * const alertaProyecto = await prisma.alertaProyecto.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AlertaProyectoCreateManyArgs>(args?: SelectSubset<T, AlertaProyectoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AlertaProyectos and returns the data saved in the database.
     * @param {AlertaProyectoCreateManyAndReturnArgs} args - Arguments to create many AlertaProyectos.
     * @example
     * // Create many AlertaProyectos
     * const alertaProyecto = await prisma.alertaProyecto.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AlertaProyectos and only return the `id`
     * const alertaProyectoWithIdOnly = await prisma.alertaProyecto.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AlertaProyectoCreateManyAndReturnArgs>(args?: SelectSubset<T, AlertaProyectoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AlertaProyectoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a AlertaProyecto.
     * @param {AlertaProyectoDeleteArgs} args - Arguments to delete one AlertaProyecto.
     * @example
     * // Delete one AlertaProyecto
     * const AlertaProyecto = await prisma.alertaProyecto.delete({
     *   where: {
     *     // ... filter to delete one AlertaProyecto
     *   }
     * })
     * 
     */
    delete<T extends AlertaProyectoDeleteArgs>(args: SelectSubset<T, AlertaProyectoDeleteArgs<ExtArgs>>): Prisma__AlertaProyectoClient<$Result.GetResult<Prisma.$AlertaProyectoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one AlertaProyecto.
     * @param {AlertaProyectoUpdateArgs} args - Arguments to update one AlertaProyecto.
     * @example
     * // Update one AlertaProyecto
     * const alertaProyecto = await prisma.alertaProyecto.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AlertaProyectoUpdateArgs>(args: SelectSubset<T, AlertaProyectoUpdateArgs<ExtArgs>>): Prisma__AlertaProyectoClient<$Result.GetResult<Prisma.$AlertaProyectoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more AlertaProyectos.
     * @param {AlertaProyectoDeleteManyArgs} args - Arguments to filter AlertaProyectos to delete.
     * @example
     * // Delete a few AlertaProyectos
     * const { count } = await prisma.alertaProyecto.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AlertaProyectoDeleteManyArgs>(args?: SelectSubset<T, AlertaProyectoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AlertaProyectos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlertaProyectoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AlertaProyectos
     * const alertaProyecto = await prisma.alertaProyecto.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AlertaProyectoUpdateManyArgs>(args: SelectSubset<T, AlertaProyectoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one AlertaProyecto.
     * @param {AlertaProyectoUpsertArgs} args - Arguments to update or create a AlertaProyecto.
     * @example
     * // Update or create a AlertaProyecto
     * const alertaProyecto = await prisma.alertaProyecto.upsert({
     *   create: {
     *     // ... data to create a AlertaProyecto
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AlertaProyecto we want to update
     *   }
     * })
     */
    upsert<T extends AlertaProyectoUpsertArgs>(args: SelectSubset<T, AlertaProyectoUpsertArgs<ExtArgs>>): Prisma__AlertaProyectoClient<$Result.GetResult<Prisma.$AlertaProyectoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of AlertaProyectos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlertaProyectoCountArgs} args - Arguments to filter AlertaProyectos to count.
     * @example
     * // Count the number of AlertaProyectos
     * const count = await prisma.alertaProyecto.count({
     *   where: {
     *     // ... the filter for the AlertaProyectos we want to count
     *   }
     * })
    **/
    count<T extends AlertaProyectoCountArgs>(
      args?: Subset<T, AlertaProyectoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AlertaProyectoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AlertaProyecto.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlertaProyectoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends AlertaProyectoAggregateArgs>(args: Subset<T, AlertaProyectoAggregateArgs>): Prisma.PrismaPromise<GetAlertaProyectoAggregateType<T>>

    /**
     * Group by AlertaProyecto.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlertaProyectoGroupByArgs} args - Group by arguments.
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
      T extends AlertaProyectoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AlertaProyectoGroupByArgs['orderBy'] }
        : { orderBy?: AlertaProyectoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, AlertaProyectoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAlertaProyectoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AlertaProyecto model
   */
  readonly fields: AlertaProyectoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AlertaProyecto.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AlertaProyectoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the AlertaProyecto model
   */ 
  interface AlertaProyectoFieldRefs {
    readonly id: FieldRef<"AlertaProyecto", 'String'>
    readonly tenant_id: FieldRef<"AlertaProyecto", 'String'>
    readonly proyecto_id: FieldRef<"AlertaProyecto", 'String'>
    readonly concepto_id: FieldRef<"AlertaProyecto", 'String'>
    readonly tipo: FieldRef<"AlertaProyecto", 'String'>
    readonly severidad: FieldRef<"AlertaProyecto", 'String'>
    readonly titulo: FieldRef<"AlertaProyecto", 'String'>
    readonly descripcion: FieldRef<"AlertaProyecto", 'String'>
    readonly datos: FieldRef<"AlertaProyecto", 'Json'>
    readonly estado: FieldRef<"AlertaProyecto", 'String'>
    readonly nota_cp: FieldRef<"AlertaProyecto", 'String'>
    readonly resuelta_en: FieldRef<"AlertaProyecto", 'DateTime'>
    readonly created_at: FieldRef<"AlertaProyecto", 'DateTime'>
    readonly updated_at: FieldRef<"AlertaProyecto", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AlertaProyecto findUnique
   */
  export type AlertaProyectoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertaProyecto
     */
    select?: AlertaProyectoSelect<ExtArgs> | null
    /**
     * Filter, which AlertaProyecto to fetch.
     */
    where: AlertaProyectoWhereUniqueInput
  }

  /**
   * AlertaProyecto findUniqueOrThrow
   */
  export type AlertaProyectoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertaProyecto
     */
    select?: AlertaProyectoSelect<ExtArgs> | null
    /**
     * Filter, which AlertaProyecto to fetch.
     */
    where: AlertaProyectoWhereUniqueInput
  }

  /**
   * AlertaProyecto findFirst
   */
  export type AlertaProyectoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertaProyecto
     */
    select?: AlertaProyectoSelect<ExtArgs> | null
    /**
     * Filter, which AlertaProyecto to fetch.
     */
    where?: AlertaProyectoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AlertaProyectos to fetch.
     */
    orderBy?: AlertaProyectoOrderByWithRelationInput | AlertaProyectoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AlertaProyectos.
     */
    cursor?: AlertaProyectoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AlertaProyectos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AlertaProyectos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AlertaProyectos.
     */
    distinct?: AlertaProyectoScalarFieldEnum | AlertaProyectoScalarFieldEnum[]
  }

  /**
   * AlertaProyecto findFirstOrThrow
   */
  export type AlertaProyectoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertaProyecto
     */
    select?: AlertaProyectoSelect<ExtArgs> | null
    /**
     * Filter, which AlertaProyecto to fetch.
     */
    where?: AlertaProyectoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AlertaProyectos to fetch.
     */
    orderBy?: AlertaProyectoOrderByWithRelationInput | AlertaProyectoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AlertaProyectos.
     */
    cursor?: AlertaProyectoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AlertaProyectos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AlertaProyectos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AlertaProyectos.
     */
    distinct?: AlertaProyectoScalarFieldEnum | AlertaProyectoScalarFieldEnum[]
  }

  /**
   * AlertaProyecto findMany
   */
  export type AlertaProyectoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertaProyecto
     */
    select?: AlertaProyectoSelect<ExtArgs> | null
    /**
     * Filter, which AlertaProyectos to fetch.
     */
    where?: AlertaProyectoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AlertaProyectos to fetch.
     */
    orderBy?: AlertaProyectoOrderByWithRelationInput | AlertaProyectoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AlertaProyectos.
     */
    cursor?: AlertaProyectoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AlertaProyectos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AlertaProyectos.
     */
    skip?: number
    distinct?: AlertaProyectoScalarFieldEnum | AlertaProyectoScalarFieldEnum[]
  }

  /**
   * AlertaProyecto create
   */
  export type AlertaProyectoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertaProyecto
     */
    select?: AlertaProyectoSelect<ExtArgs> | null
    /**
     * The data needed to create a AlertaProyecto.
     */
    data: XOR<AlertaProyectoCreateInput, AlertaProyectoUncheckedCreateInput>
  }

  /**
   * AlertaProyecto createMany
   */
  export type AlertaProyectoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AlertaProyectos.
     */
    data: AlertaProyectoCreateManyInput | AlertaProyectoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AlertaProyecto createManyAndReturn
   */
  export type AlertaProyectoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertaProyecto
     */
    select?: AlertaProyectoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many AlertaProyectos.
     */
    data: AlertaProyectoCreateManyInput | AlertaProyectoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AlertaProyecto update
   */
  export type AlertaProyectoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertaProyecto
     */
    select?: AlertaProyectoSelect<ExtArgs> | null
    /**
     * The data needed to update a AlertaProyecto.
     */
    data: XOR<AlertaProyectoUpdateInput, AlertaProyectoUncheckedUpdateInput>
    /**
     * Choose, which AlertaProyecto to update.
     */
    where: AlertaProyectoWhereUniqueInput
  }

  /**
   * AlertaProyecto updateMany
   */
  export type AlertaProyectoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AlertaProyectos.
     */
    data: XOR<AlertaProyectoUpdateManyMutationInput, AlertaProyectoUncheckedUpdateManyInput>
    /**
     * Filter which AlertaProyectos to update
     */
    where?: AlertaProyectoWhereInput
  }

  /**
   * AlertaProyecto upsert
   */
  export type AlertaProyectoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertaProyecto
     */
    select?: AlertaProyectoSelect<ExtArgs> | null
    /**
     * The filter to search for the AlertaProyecto to update in case it exists.
     */
    where: AlertaProyectoWhereUniqueInput
    /**
     * In case the AlertaProyecto found by the `where` argument doesn't exist, create a new AlertaProyecto with this data.
     */
    create: XOR<AlertaProyectoCreateInput, AlertaProyectoUncheckedCreateInput>
    /**
     * In case the AlertaProyecto was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AlertaProyectoUpdateInput, AlertaProyectoUncheckedUpdateInput>
  }

  /**
   * AlertaProyecto delete
   */
  export type AlertaProyectoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertaProyecto
     */
    select?: AlertaProyectoSelect<ExtArgs> | null
    /**
     * Filter which AlertaProyecto to delete.
     */
    where: AlertaProyectoWhereUniqueInput
  }

  /**
   * AlertaProyecto deleteMany
   */
  export type AlertaProyectoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AlertaProyectos to delete
     */
    where?: AlertaProyectoWhereInput
  }

  /**
   * AlertaProyecto without action
   */
  export type AlertaProyectoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertaProyecto
     */
    select?: AlertaProyectoSelect<ExtArgs> | null
  }


  /**
   * Model ProyeccionCierre
   */

  export type AggregateProyeccionCierre = {
    _count: ProyeccionCierreCountAggregateOutputType | null
    _avg: ProyeccionCierreAvgAggregateOutputType | null
    _sum: ProyeccionCierreSumAggregateOutputType | null
    _min: ProyeccionCierreMinAggregateOutputType | null
    _max: ProyeccionCierreMaxAggregateOutputType | null
  }

  export type ProyeccionCierreAvgAggregateOutputType = {
    bac: Decimal | null
    pv: Decimal | null
    ev: Decimal | null
    ac: Decimal | null
    cpi: Decimal | null
    spi: Decimal | null
    cv: Decimal | null
    sv: Decimal | null
    eac: Decimal | null
    etc: Decimal | null
    vac: Decimal | null
  }

  export type ProyeccionCierreSumAggregateOutputType = {
    bac: Decimal | null
    pv: Decimal | null
    ev: Decimal | null
    ac: Decimal | null
    cpi: Decimal | null
    spi: Decimal | null
    cv: Decimal | null
    sv: Decimal | null
    eac: Decimal | null
    etc: Decimal | null
    vac: Decimal | null
  }

  export type ProyeccionCierreMinAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    proyecto_id: string | null
    fecha_calculo: Date | null
    bac: Decimal | null
    pv: Decimal | null
    ev: Decimal | null
    ac: Decimal | null
    cpi: Decimal | null
    spi: Decimal | null
    cv: Decimal | null
    sv: Decimal | null
    eac: Decimal | null
    etc: Decimal | null
    vac: Decimal | null
    fecha_fin_plan: Date | null
    fecha_fin_proyectada: Date | null
    created_at: Date | null
  }

  export type ProyeccionCierreMaxAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    proyecto_id: string | null
    fecha_calculo: Date | null
    bac: Decimal | null
    pv: Decimal | null
    ev: Decimal | null
    ac: Decimal | null
    cpi: Decimal | null
    spi: Decimal | null
    cv: Decimal | null
    sv: Decimal | null
    eac: Decimal | null
    etc: Decimal | null
    vac: Decimal | null
    fecha_fin_plan: Date | null
    fecha_fin_proyectada: Date | null
    created_at: Date | null
  }

  export type ProyeccionCierreCountAggregateOutputType = {
    id: number
    tenant_id: number
    proyecto_id: number
    fecha_calculo: number
    bac: number
    pv: number
    ev: number
    ac: number
    cpi: number
    spi: number
    cv: number
    sv: number
    eac: number
    etc: number
    vac: number
    fecha_fin_plan: number
    fecha_fin_proyectada: number
    created_at: number
    _all: number
  }


  export type ProyeccionCierreAvgAggregateInputType = {
    bac?: true
    pv?: true
    ev?: true
    ac?: true
    cpi?: true
    spi?: true
    cv?: true
    sv?: true
    eac?: true
    etc?: true
    vac?: true
  }

  export type ProyeccionCierreSumAggregateInputType = {
    bac?: true
    pv?: true
    ev?: true
    ac?: true
    cpi?: true
    spi?: true
    cv?: true
    sv?: true
    eac?: true
    etc?: true
    vac?: true
  }

  export type ProyeccionCierreMinAggregateInputType = {
    id?: true
    tenant_id?: true
    proyecto_id?: true
    fecha_calculo?: true
    bac?: true
    pv?: true
    ev?: true
    ac?: true
    cpi?: true
    spi?: true
    cv?: true
    sv?: true
    eac?: true
    etc?: true
    vac?: true
    fecha_fin_plan?: true
    fecha_fin_proyectada?: true
    created_at?: true
  }

  export type ProyeccionCierreMaxAggregateInputType = {
    id?: true
    tenant_id?: true
    proyecto_id?: true
    fecha_calculo?: true
    bac?: true
    pv?: true
    ev?: true
    ac?: true
    cpi?: true
    spi?: true
    cv?: true
    sv?: true
    eac?: true
    etc?: true
    vac?: true
    fecha_fin_plan?: true
    fecha_fin_proyectada?: true
    created_at?: true
  }

  export type ProyeccionCierreCountAggregateInputType = {
    id?: true
    tenant_id?: true
    proyecto_id?: true
    fecha_calculo?: true
    bac?: true
    pv?: true
    ev?: true
    ac?: true
    cpi?: true
    spi?: true
    cv?: true
    sv?: true
    eac?: true
    etc?: true
    vac?: true
    fecha_fin_plan?: true
    fecha_fin_proyectada?: true
    created_at?: true
    _all?: true
  }

  export type ProyeccionCierreAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProyeccionCierre to aggregate.
     */
    where?: ProyeccionCierreWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProyeccionCierres to fetch.
     */
    orderBy?: ProyeccionCierreOrderByWithRelationInput | ProyeccionCierreOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProyeccionCierreWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProyeccionCierres from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProyeccionCierres.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ProyeccionCierres
    **/
    _count?: true | ProyeccionCierreCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ProyeccionCierreAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ProyeccionCierreSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProyeccionCierreMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProyeccionCierreMaxAggregateInputType
  }

  export type GetProyeccionCierreAggregateType<T extends ProyeccionCierreAggregateArgs> = {
        [P in keyof T & keyof AggregateProyeccionCierre]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProyeccionCierre[P]>
      : GetScalarType<T[P], AggregateProyeccionCierre[P]>
  }




  export type ProyeccionCierreGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProyeccionCierreWhereInput
    orderBy?: ProyeccionCierreOrderByWithAggregationInput | ProyeccionCierreOrderByWithAggregationInput[]
    by: ProyeccionCierreScalarFieldEnum[] | ProyeccionCierreScalarFieldEnum
    having?: ProyeccionCierreScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProyeccionCierreCountAggregateInputType | true
    _avg?: ProyeccionCierreAvgAggregateInputType
    _sum?: ProyeccionCierreSumAggregateInputType
    _min?: ProyeccionCierreMinAggregateInputType
    _max?: ProyeccionCierreMaxAggregateInputType
  }

  export type ProyeccionCierreGroupByOutputType = {
    id: string
    tenant_id: string
    proyecto_id: string
    fecha_calculo: Date
    bac: Decimal
    pv: Decimal
    ev: Decimal
    ac: Decimal
    cpi: Decimal
    spi: Decimal
    cv: Decimal
    sv: Decimal
    eac: Decimal
    etc: Decimal
    vac: Decimal
    fecha_fin_plan: Date | null
    fecha_fin_proyectada: Date | null
    created_at: Date
    _count: ProyeccionCierreCountAggregateOutputType | null
    _avg: ProyeccionCierreAvgAggregateOutputType | null
    _sum: ProyeccionCierreSumAggregateOutputType | null
    _min: ProyeccionCierreMinAggregateOutputType | null
    _max: ProyeccionCierreMaxAggregateOutputType | null
  }

  type GetProyeccionCierreGroupByPayload<T extends ProyeccionCierreGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProyeccionCierreGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProyeccionCierreGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProyeccionCierreGroupByOutputType[P]>
            : GetScalarType<T[P], ProyeccionCierreGroupByOutputType[P]>
        }
      >
    >


  export type ProyeccionCierreSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    fecha_calculo?: boolean
    bac?: boolean
    pv?: boolean
    ev?: boolean
    ac?: boolean
    cpi?: boolean
    spi?: boolean
    cv?: boolean
    sv?: boolean
    eac?: boolean
    etc?: boolean
    vac?: boolean
    fecha_fin_plan?: boolean
    fecha_fin_proyectada?: boolean
    created_at?: boolean
  }, ExtArgs["result"]["proyeccionCierre"]>

  export type ProyeccionCierreSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    fecha_calculo?: boolean
    bac?: boolean
    pv?: boolean
    ev?: boolean
    ac?: boolean
    cpi?: boolean
    spi?: boolean
    cv?: boolean
    sv?: boolean
    eac?: boolean
    etc?: boolean
    vac?: boolean
    fecha_fin_plan?: boolean
    fecha_fin_proyectada?: boolean
    created_at?: boolean
  }, ExtArgs["result"]["proyeccionCierre"]>

  export type ProyeccionCierreSelectScalar = {
    id?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    fecha_calculo?: boolean
    bac?: boolean
    pv?: boolean
    ev?: boolean
    ac?: boolean
    cpi?: boolean
    spi?: boolean
    cv?: boolean
    sv?: boolean
    eac?: boolean
    etc?: boolean
    vac?: boolean
    fecha_fin_plan?: boolean
    fecha_fin_proyectada?: boolean
    created_at?: boolean
  }


  export type $ProyeccionCierrePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ProyeccionCierre"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenant_id: string
      proyecto_id: string
      fecha_calculo: Date
      bac: Prisma.Decimal
      pv: Prisma.Decimal
      ev: Prisma.Decimal
      ac: Prisma.Decimal
      cpi: Prisma.Decimal
      spi: Prisma.Decimal
      cv: Prisma.Decimal
      sv: Prisma.Decimal
      eac: Prisma.Decimal
      etc: Prisma.Decimal
      vac: Prisma.Decimal
      fecha_fin_plan: Date | null
      fecha_fin_proyectada: Date | null
      created_at: Date
    }, ExtArgs["result"]["proyeccionCierre"]>
    composites: {}
  }

  type ProyeccionCierreGetPayload<S extends boolean | null | undefined | ProyeccionCierreDefaultArgs> = $Result.GetResult<Prisma.$ProyeccionCierrePayload, S>

  type ProyeccionCierreCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ProyeccionCierreFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ProyeccionCierreCountAggregateInputType | true
    }

  export interface ProyeccionCierreDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ProyeccionCierre'], meta: { name: 'ProyeccionCierre' } }
    /**
     * Find zero or one ProyeccionCierre that matches the filter.
     * @param {ProyeccionCierreFindUniqueArgs} args - Arguments to find a ProyeccionCierre
     * @example
     * // Get one ProyeccionCierre
     * const proyeccionCierre = await prisma.proyeccionCierre.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProyeccionCierreFindUniqueArgs>(args: SelectSubset<T, ProyeccionCierreFindUniqueArgs<ExtArgs>>): Prisma__ProyeccionCierreClient<$Result.GetResult<Prisma.$ProyeccionCierrePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ProyeccionCierre that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ProyeccionCierreFindUniqueOrThrowArgs} args - Arguments to find a ProyeccionCierre
     * @example
     * // Get one ProyeccionCierre
     * const proyeccionCierre = await prisma.proyeccionCierre.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProyeccionCierreFindUniqueOrThrowArgs>(args: SelectSubset<T, ProyeccionCierreFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProyeccionCierreClient<$Result.GetResult<Prisma.$ProyeccionCierrePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ProyeccionCierre that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProyeccionCierreFindFirstArgs} args - Arguments to find a ProyeccionCierre
     * @example
     * // Get one ProyeccionCierre
     * const proyeccionCierre = await prisma.proyeccionCierre.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProyeccionCierreFindFirstArgs>(args?: SelectSubset<T, ProyeccionCierreFindFirstArgs<ExtArgs>>): Prisma__ProyeccionCierreClient<$Result.GetResult<Prisma.$ProyeccionCierrePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ProyeccionCierre that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProyeccionCierreFindFirstOrThrowArgs} args - Arguments to find a ProyeccionCierre
     * @example
     * // Get one ProyeccionCierre
     * const proyeccionCierre = await prisma.proyeccionCierre.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProyeccionCierreFindFirstOrThrowArgs>(args?: SelectSubset<T, ProyeccionCierreFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProyeccionCierreClient<$Result.GetResult<Prisma.$ProyeccionCierrePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ProyeccionCierres that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProyeccionCierreFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ProyeccionCierres
     * const proyeccionCierres = await prisma.proyeccionCierre.findMany()
     * 
     * // Get first 10 ProyeccionCierres
     * const proyeccionCierres = await prisma.proyeccionCierre.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const proyeccionCierreWithIdOnly = await prisma.proyeccionCierre.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProyeccionCierreFindManyArgs>(args?: SelectSubset<T, ProyeccionCierreFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProyeccionCierrePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ProyeccionCierre.
     * @param {ProyeccionCierreCreateArgs} args - Arguments to create a ProyeccionCierre.
     * @example
     * // Create one ProyeccionCierre
     * const ProyeccionCierre = await prisma.proyeccionCierre.create({
     *   data: {
     *     // ... data to create a ProyeccionCierre
     *   }
     * })
     * 
     */
    create<T extends ProyeccionCierreCreateArgs>(args: SelectSubset<T, ProyeccionCierreCreateArgs<ExtArgs>>): Prisma__ProyeccionCierreClient<$Result.GetResult<Prisma.$ProyeccionCierrePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ProyeccionCierres.
     * @param {ProyeccionCierreCreateManyArgs} args - Arguments to create many ProyeccionCierres.
     * @example
     * // Create many ProyeccionCierres
     * const proyeccionCierre = await prisma.proyeccionCierre.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProyeccionCierreCreateManyArgs>(args?: SelectSubset<T, ProyeccionCierreCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ProyeccionCierres and returns the data saved in the database.
     * @param {ProyeccionCierreCreateManyAndReturnArgs} args - Arguments to create many ProyeccionCierres.
     * @example
     * // Create many ProyeccionCierres
     * const proyeccionCierre = await prisma.proyeccionCierre.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ProyeccionCierres and only return the `id`
     * const proyeccionCierreWithIdOnly = await prisma.proyeccionCierre.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProyeccionCierreCreateManyAndReturnArgs>(args?: SelectSubset<T, ProyeccionCierreCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProyeccionCierrePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ProyeccionCierre.
     * @param {ProyeccionCierreDeleteArgs} args - Arguments to delete one ProyeccionCierre.
     * @example
     * // Delete one ProyeccionCierre
     * const ProyeccionCierre = await prisma.proyeccionCierre.delete({
     *   where: {
     *     // ... filter to delete one ProyeccionCierre
     *   }
     * })
     * 
     */
    delete<T extends ProyeccionCierreDeleteArgs>(args: SelectSubset<T, ProyeccionCierreDeleteArgs<ExtArgs>>): Prisma__ProyeccionCierreClient<$Result.GetResult<Prisma.$ProyeccionCierrePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ProyeccionCierre.
     * @param {ProyeccionCierreUpdateArgs} args - Arguments to update one ProyeccionCierre.
     * @example
     * // Update one ProyeccionCierre
     * const proyeccionCierre = await prisma.proyeccionCierre.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProyeccionCierreUpdateArgs>(args: SelectSubset<T, ProyeccionCierreUpdateArgs<ExtArgs>>): Prisma__ProyeccionCierreClient<$Result.GetResult<Prisma.$ProyeccionCierrePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ProyeccionCierres.
     * @param {ProyeccionCierreDeleteManyArgs} args - Arguments to filter ProyeccionCierres to delete.
     * @example
     * // Delete a few ProyeccionCierres
     * const { count } = await prisma.proyeccionCierre.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProyeccionCierreDeleteManyArgs>(args?: SelectSubset<T, ProyeccionCierreDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ProyeccionCierres.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProyeccionCierreUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ProyeccionCierres
     * const proyeccionCierre = await prisma.proyeccionCierre.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProyeccionCierreUpdateManyArgs>(args: SelectSubset<T, ProyeccionCierreUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ProyeccionCierre.
     * @param {ProyeccionCierreUpsertArgs} args - Arguments to update or create a ProyeccionCierre.
     * @example
     * // Update or create a ProyeccionCierre
     * const proyeccionCierre = await prisma.proyeccionCierre.upsert({
     *   create: {
     *     // ... data to create a ProyeccionCierre
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ProyeccionCierre we want to update
     *   }
     * })
     */
    upsert<T extends ProyeccionCierreUpsertArgs>(args: SelectSubset<T, ProyeccionCierreUpsertArgs<ExtArgs>>): Prisma__ProyeccionCierreClient<$Result.GetResult<Prisma.$ProyeccionCierrePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ProyeccionCierres.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProyeccionCierreCountArgs} args - Arguments to filter ProyeccionCierres to count.
     * @example
     * // Count the number of ProyeccionCierres
     * const count = await prisma.proyeccionCierre.count({
     *   where: {
     *     // ... the filter for the ProyeccionCierres we want to count
     *   }
     * })
    **/
    count<T extends ProyeccionCierreCountArgs>(
      args?: Subset<T, ProyeccionCierreCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProyeccionCierreCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ProyeccionCierre.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProyeccionCierreAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ProyeccionCierreAggregateArgs>(args: Subset<T, ProyeccionCierreAggregateArgs>): Prisma.PrismaPromise<GetProyeccionCierreAggregateType<T>>

    /**
     * Group by ProyeccionCierre.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProyeccionCierreGroupByArgs} args - Group by arguments.
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
      T extends ProyeccionCierreGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProyeccionCierreGroupByArgs['orderBy'] }
        : { orderBy?: ProyeccionCierreGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ProyeccionCierreGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProyeccionCierreGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ProyeccionCierre model
   */
  readonly fields: ProyeccionCierreFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ProyeccionCierre.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProyeccionCierreClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the ProyeccionCierre model
   */ 
  interface ProyeccionCierreFieldRefs {
    readonly id: FieldRef<"ProyeccionCierre", 'String'>
    readonly tenant_id: FieldRef<"ProyeccionCierre", 'String'>
    readonly proyecto_id: FieldRef<"ProyeccionCierre", 'String'>
    readonly fecha_calculo: FieldRef<"ProyeccionCierre", 'DateTime'>
    readonly bac: FieldRef<"ProyeccionCierre", 'Decimal'>
    readonly pv: FieldRef<"ProyeccionCierre", 'Decimal'>
    readonly ev: FieldRef<"ProyeccionCierre", 'Decimal'>
    readonly ac: FieldRef<"ProyeccionCierre", 'Decimal'>
    readonly cpi: FieldRef<"ProyeccionCierre", 'Decimal'>
    readonly spi: FieldRef<"ProyeccionCierre", 'Decimal'>
    readonly cv: FieldRef<"ProyeccionCierre", 'Decimal'>
    readonly sv: FieldRef<"ProyeccionCierre", 'Decimal'>
    readonly eac: FieldRef<"ProyeccionCierre", 'Decimal'>
    readonly etc: FieldRef<"ProyeccionCierre", 'Decimal'>
    readonly vac: FieldRef<"ProyeccionCierre", 'Decimal'>
    readonly fecha_fin_plan: FieldRef<"ProyeccionCierre", 'DateTime'>
    readonly fecha_fin_proyectada: FieldRef<"ProyeccionCierre", 'DateTime'>
    readonly created_at: FieldRef<"ProyeccionCierre", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ProyeccionCierre findUnique
   */
  export type ProyeccionCierreFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProyeccionCierre
     */
    select?: ProyeccionCierreSelect<ExtArgs> | null
    /**
     * Filter, which ProyeccionCierre to fetch.
     */
    where: ProyeccionCierreWhereUniqueInput
  }

  /**
   * ProyeccionCierre findUniqueOrThrow
   */
  export type ProyeccionCierreFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProyeccionCierre
     */
    select?: ProyeccionCierreSelect<ExtArgs> | null
    /**
     * Filter, which ProyeccionCierre to fetch.
     */
    where: ProyeccionCierreWhereUniqueInput
  }

  /**
   * ProyeccionCierre findFirst
   */
  export type ProyeccionCierreFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProyeccionCierre
     */
    select?: ProyeccionCierreSelect<ExtArgs> | null
    /**
     * Filter, which ProyeccionCierre to fetch.
     */
    where?: ProyeccionCierreWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProyeccionCierres to fetch.
     */
    orderBy?: ProyeccionCierreOrderByWithRelationInput | ProyeccionCierreOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProyeccionCierres.
     */
    cursor?: ProyeccionCierreWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProyeccionCierres from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProyeccionCierres.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProyeccionCierres.
     */
    distinct?: ProyeccionCierreScalarFieldEnum | ProyeccionCierreScalarFieldEnum[]
  }

  /**
   * ProyeccionCierre findFirstOrThrow
   */
  export type ProyeccionCierreFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProyeccionCierre
     */
    select?: ProyeccionCierreSelect<ExtArgs> | null
    /**
     * Filter, which ProyeccionCierre to fetch.
     */
    where?: ProyeccionCierreWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProyeccionCierres to fetch.
     */
    orderBy?: ProyeccionCierreOrderByWithRelationInput | ProyeccionCierreOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProyeccionCierres.
     */
    cursor?: ProyeccionCierreWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProyeccionCierres from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProyeccionCierres.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProyeccionCierres.
     */
    distinct?: ProyeccionCierreScalarFieldEnum | ProyeccionCierreScalarFieldEnum[]
  }

  /**
   * ProyeccionCierre findMany
   */
  export type ProyeccionCierreFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProyeccionCierre
     */
    select?: ProyeccionCierreSelect<ExtArgs> | null
    /**
     * Filter, which ProyeccionCierres to fetch.
     */
    where?: ProyeccionCierreWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProyeccionCierres to fetch.
     */
    orderBy?: ProyeccionCierreOrderByWithRelationInput | ProyeccionCierreOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ProyeccionCierres.
     */
    cursor?: ProyeccionCierreWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProyeccionCierres from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProyeccionCierres.
     */
    skip?: number
    distinct?: ProyeccionCierreScalarFieldEnum | ProyeccionCierreScalarFieldEnum[]
  }

  /**
   * ProyeccionCierre create
   */
  export type ProyeccionCierreCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProyeccionCierre
     */
    select?: ProyeccionCierreSelect<ExtArgs> | null
    /**
     * The data needed to create a ProyeccionCierre.
     */
    data: XOR<ProyeccionCierreCreateInput, ProyeccionCierreUncheckedCreateInput>
  }

  /**
   * ProyeccionCierre createMany
   */
  export type ProyeccionCierreCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ProyeccionCierres.
     */
    data: ProyeccionCierreCreateManyInput | ProyeccionCierreCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ProyeccionCierre createManyAndReturn
   */
  export type ProyeccionCierreCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProyeccionCierre
     */
    select?: ProyeccionCierreSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ProyeccionCierres.
     */
    data: ProyeccionCierreCreateManyInput | ProyeccionCierreCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ProyeccionCierre update
   */
  export type ProyeccionCierreUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProyeccionCierre
     */
    select?: ProyeccionCierreSelect<ExtArgs> | null
    /**
     * The data needed to update a ProyeccionCierre.
     */
    data: XOR<ProyeccionCierreUpdateInput, ProyeccionCierreUncheckedUpdateInput>
    /**
     * Choose, which ProyeccionCierre to update.
     */
    where: ProyeccionCierreWhereUniqueInput
  }

  /**
   * ProyeccionCierre updateMany
   */
  export type ProyeccionCierreUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ProyeccionCierres.
     */
    data: XOR<ProyeccionCierreUpdateManyMutationInput, ProyeccionCierreUncheckedUpdateManyInput>
    /**
     * Filter which ProyeccionCierres to update
     */
    where?: ProyeccionCierreWhereInput
  }

  /**
   * ProyeccionCierre upsert
   */
  export type ProyeccionCierreUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProyeccionCierre
     */
    select?: ProyeccionCierreSelect<ExtArgs> | null
    /**
     * The filter to search for the ProyeccionCierre to update in case it exists.
     */
    where: ProyeccionCierreWhereUniqueInput
    /**
     * In case the ProyeccionCierre found by the `where` argument doesn't exist, create a new ProyeccionCierre with this data.
     */
    create: XOR<ProyeccionCierreCreateInput, ProyeccionCierreUncheckedCreateInput>
    /**
     * In case the ProyeccionCierre was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProyeccionCierreUpdateInput, ProyeccionCierreUncheckedUpdateInput>
  }

  /**
   * ProyeccionCierre delete
   */
  export type ProyeccionCierreDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProyeccionCierre
     */
    select?: ProyeccionCierreSelect<ExtArgs> | null
    /**
     * Filter which ProyeccionCierre to delete.
     */
    where: ProyeccionCierreWhereUniqueInput
  }

  /**
   * ProyeccionCierre deleteMany
   */
  export type ProyeccionCierreDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProyeccionCierres to delete
     */
    where?: ProyeccionCierreWhereInput
  }

  /**
   * ProyeccionCierre without action
   */
  export type ProyeccionCierreDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProyeccionCierre
     */
    select?: ProyeccionCierreSelect<ExtArgs> | null
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


  export const ProgramacionObraScalarFieldEnum: {
    id: 'id',
    tenant_id: 'tenant_id',
    proyecto_id: 'proyecto_id',
    concepto_id: 'concepto_id',
    concepto_clave: 'concepto_clave',
    descripcion: 'descripcion',
    fecha_inicio_plan: 'fecha_inicio_plan',
    fecha_fin_plan: 'fecha_fin_plan',
    curva_programada: 'curva_programada',
    fecha_inicio_real: 'fecha_inicio_real',
    fecha_fin_real: 'fecha_fin_real',
    pct_avance_real: 'pct_avance_real',
    cpi: 'cpi',
    spi: 'spi',
    eac: 'eac',
    bac: 'bac',
    estado: 'estado',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type ProgramacionObraScalarFieldEnum = (typeof ProgramacionObraScalarFieldEnum)[keyof typeof ProgramacionObraScalarFieldEnum]


  export const AlertaProyectoScalarFieldEnum: {
    id: 'id',
    tenant_id: 'tenant_id',
    proyecto_id: 'proyecto_id',
    concepto_id: 'concepto_id',
    tipo: 'tipo',
    severidad: 'severidad',
    titulo: 'titulo',
    descripcion: 'descripcion',
    datos: 'datos',
    estado: 'estado',
    nota_cp: 'nota_cp',
    resuelta_en: 'resuelta_en',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type AlertaProyectoScalarFieldEnum = (typeof AlertaProyectoScalarFieldEnum)[keyof typeof AlertaProyectoScalarFieldEnum]


  export const ProyeccionCierreScalarFieldEnum: {
    id: 'id',
    tenant_id: 'tenant_id',
    proyecto_id: 'proyecto_id',
    fecha_calculo: 'fecha_calculo',
    bac: 'bac',
    pv: 'pv',
    ev: 'ev',
    ac: 'ac',
    cpi: 'cpi',
    spi: 'spi',
    cv: 'cv',
    sv: 'sv',
    eac: 'eac',
    etc: 'etc',
    vac: 'vac',
    fecha_fin_plan: 'fecha_fin_plan',
    fecha_fin_proyectada: 'fecha_fin_proyectada',
    created_at: 'created_at'
  };

  export type ProyeccionCierreScalarFieldEnum = (typeof ProyeccionCierreScalarFieldEnum)[keyof typeof ProyeccionCierreScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


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
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


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


  export type ProgramacionObraWhereInput = {
    AND?: ProgramacionObraWhereInput | ProgramacionObraWhereInput[]
    OR?: ProgramacionObraWhereInput[]
    NOT?: ProgramacionObraWhereInput | ProgramacionObraWhereInput[]
    id?: UuidFilter<"ProgramacionObra"> | string
    tenant_id?: UuidFilter<"ProgramacionObra"> | string
    proyecto_id?: UuidFilter<"ProgramacionObra"> | string
    concepto_id?: UuidFilter<"ProgramacionObra"> | string
    concepto_clave?: StringFilter<"ProgramacionObra"> | string
    descripcion?: StringFilter<"ProgramacionObra"> | string
    fecha_inicio_plan?: DateTimeFilter<"ProgramacionObra"> | Date | string
    fecha_fin_plan?: DateTimeFilter<"ProgramacionObra"> | Date | string
    curva_programada?: JsonFilter<"ProgramacionObra">
    fecha_inicio_real?: DateTimeNullableFilter<"ProgramacionObra"> | Date | string | null
    fecha_fin_real?: DateTimeNullableFilter<"ProgramacionObra"> | Date | string | null
    pct_avance_real?: DecimalFilter<"ProgramacionObra"> | Decimal | DecimalJsLike | number | string
    cpi?: DecimalNullableFilter<"ProgramacionObra"> | Decimal | DecimalJsLike | number | string | null
    spi?: DecimalNullableFilter<"ProgramacionObra"> | Decimal | DecimalJsLike | number | string | null
    eac?: DecimalNullableFilter<"ProgramacionObra"> | Decimal | DecimalJsLike | number | string | null
    bac?: DecimalFilter<"ProgramacionObra"> | Decimal | DecimalJsLike | number | string
    estado?: StringFilter<"ProgramacionObra"> | string
    created_at?: DateTimeFilter<"ProgramacionObra"> | Date | string
    updated_at?: DateTimeFilter<"ProgramacionObra"> | Date | string
  }

  export type ProgramacionObraOrderByWithRelationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    concepto_id?: SortOrder
    concepto_clave?: SortOrder
    descripcion?: SortOrder
    fecha_inicio_plan?: SortOrder
    fecha_fin_plan?: SortOrder
    curva_programada?: SortOrder
    fecha_inicio_real?: SortOrderInput | SortOrder
    fecha_fin_real?: SortOrderInput | SortOrder
    pct_avance_real?: SortOrder
    cpi?: SortOrderInput | SortOrder
    spi?: SortOrderInput | SortOrder
    eac?: SortOrderInput | SortOrder
    bac?: SortOrder
    estado?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ProgramacionObraWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tenant_id_proyecto_id_concepto_id?: ProgramacionObraTenant_idProyecto_idConcepto_idCompoundUniqueInput
    AND?: ProgramacionObraWhereInput | ProgramacionObraWhereInput[]
    OR?: ProgramacionObraWhereInput[]
    NOT?: ProgramacionObraWhereInput | ProgramacionObraWhereInput[]
    tenant_id?: UuidFilter<"ProgramacionObra"> | string
    proyecto_id?: UuidFilter<"ProgramacionObra"> | string
    concepto_id?: UuidFilter<"ProgramacionObra"> | string
    concepto_clave?: StringFilter<"ProgramacionObra"> | string
    descripcion?: StringFilter<"ProgramacionObra"> | string
    fecha_inicio_plan?: DateTimeFilter<"ProgramacionObra"> | Date | string
    fecha_fin_plan?: DateTimeFilter<"ProgramacionObra"> | Date | string
    curva_programada?: JsonFilter<"ProgramacionObra">
    fecha_inicio_real?: DateTimeNullableFilter<"ProgramacionObra"> | Date | string | null
    fecha_fin_real?: DateTimeNullableFilter<"ProgramacionObra"> | Date | string | null
    pct_avance_real?: DecimalFilter<"ProgramacionObra"> | Decimal | DecimalJsLike | number | string
    cpi?: DecimalNullableFilter<"ProgramacionObra"> | Decimal | DecimalJsLike | number | string | null
    spi?: DecimalNullableFilter<"ProgramacionObra"> | Decimal | DecimalJsLike | number | string | null
    eac?: DecimalNullableFilter<"ProgramacionObra"> | Decimal | DecimalJsLike | number | string | null
    bac?: DecimalFilter<"ProgramacionObra"> | Decimal | DecimalJsLike | number | string
    estado?: StringFilter<"ProgramacionObra"> | string
    created_at?: DateTimeFilter<"ProgramacionObra"> | Date | string
    updated_at?: DateTimeFilter<"ProgramacionObra"> | Date | string
  }, "id" | "tenant_id_proyecto_id_concepto_id">

  export type ProgramacionObraOrderByWithAggregationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    concepto_id?: SortOrder
    concepto_clave?: SortOrder
    descripcion?: SortOrder
    fecha_inicio_plan?: SortOrder
    fecha_fin_plan?: SortOrder
    curva_programada?: SortOrder
    fecha_inicio_real?: SortOrderInput | SortOrder
    fecha_fin_real?: SortOrderInput | SortOrder
    pct_avance_real?: SortOrder
    cpi?: SortOrderInput | SortOrder
    spi?: SortOrderInput | SortOrder
    eac?: SortOrderInput | SortOrder
    bac?: SortOrder
    estado?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: ProgramacionObraCountOrderByAggregateInput
    _avg?: ProgramacionObraAvgOrderByAggregateInput
    _max?: ProgramacionObraMaxOrderByAggregateInput
    _min?: ProgramacionObraMinOrderByAggregateInput
    _sum?: ProgramacionObraSumOrderByAggregateInput
  }

  export type ProgramacionObraScalarWhereWithAggregatesInput = {
    AND?: ProgramacionObraScalarWhereWithAggregatesInput | ProgramacionObraScalarWhereWithAggregatesInput[]
    OR?: ProgramacionObraScalarWhereWithAggregatesInput[]
    NOT?: ProgramacionObraScalarWhereWithAggregatesInput | ProgramacionObraScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"ProgramacionObra"> | string
    tenant_id?: UuidWithAggregatesFilter<"ProgramacionObra"> | string
    proyecto_id?: UuidWithAggregatesFilter<"ProgramacionObra"> | string
    concepto_id?: UuidWithAggregatesFilter<"ProgramacionObra"> | string
    concepto_clave?: StringWithAggregatesFilter<"ProgramacionObra"> | string
    descripcion?: StringWithAggregatesFilter<"ProgramacionObra"> | string
    fecha_inicio_plan?: DateTimeWithAggregatesFilter<"ProgramacionObra"> | Date | string
    fecha_fin_plan?: DateTimeWithAggregatesFilter<"ProgramacionObra"> | Date | string
    curva_programada?: JsonWithAggregatesFilter<"ProgramacionObra">
    fecha_inicio_real?: DateTimeNullableWithAggregatesFilter<"ProgramacionObra"> | Date | string | null
    fecha_fin_real?: DateTimeNullableWithAggregatesFilter<"ProgramacionObra"> | Date | string | null
    pct_avance_real?: DecimalWithAggregatesFilter<"ProgramacionObra"> | Decimal | DecimalJsLike | number | string
    cpi?: DecimalNullableWithAggregatesFilter<"ProgramacionObra"> | Decimal | DecimalJsLike | number | string | null
    spi?: DecimalNullableWithAggregatesFilter<"ProgramacionObra"> | Decimal | DecimalJsLike | number | string | null
    eac?: DecimalNullableWithAggregatesFilter<"ProgramacionObra"> | Decimal | DecimalJsLike | number | string | null
    bac?: DecimalWithAggregatesFilter<"ProgramacionObra"> | Decimal | DecimalJsLike | number | string
    estado?: StringWithAggregatesFilter<"ProgramacionObra"> | string
    created_at?: DateTimeWithAggregatesFilter<"ProgramacionObra"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"ProgramacionObra"> | Date | string
  }

  export type AlertaProyectoWhereInput = {
    AND?: AlertaProyectoWhereInput | AlertaProyectoWhereInput[]
    OR?: AlertaProyectoWhereInput[]
    NOT?: AlertaProyectoWhereInput | AlertaProyectoWhereInput[]
    id?: UuidFilter<"AlertaProyecto"> | string
    tenant_id?: UuidFilter<"AlertaProyecto"> | string
    proyecto_id?: UuidFilter<"AlertaProyecto"> | string
    concepto_id?: UuidNullableFilter<"AlertaProyecto"> | string | null
    tipo?: StringFilter<"AlertaProyecto"> | string
    severidad?: StringFilter<"AlertaProyecto"> | string
    titulo?: StringFilter<"AlertaProyecto"> | string
    descripcion?: StringFilter<"AlertaProyecto"> | string
    datos?: JsonFilter<"AlertaProyecto">
    estado?: StringFilter<"AlertaProyecto"> | string
    nota_cp?: StringNullableFilter<"AlertaProyecto"> | string | null
    resuelta_en?: DateTimeNullableFilter<"AlertaProyecto"> | Date | string | null
    created_at?: DateTimeFilter<"AlertaProyecto"> | Date | string
    updated_at?: DateTimeFilter<"AlertaProyecto"> | Date | string
  }

  export type AlertaProyectoOrderByWithRelationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    concepto_id?: SortOrderInput | SortOrder
    tipo?: SortOrder
    severidad?: SortOrder
    titulo?: SortOrder
    descripcion?: SortOrder
    datos?: SortOrder
    estado?: SortOrder
    nota_cp?: SortOrderInput | SortOrder
    resuelta_en?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type AlertaProyectoWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AlertaProyectoWhereInput | AlertaProyectoWhereInput[]
    OR?: AlertaProyectoWhereInput[]
    NOT?: AlertaProyectoWhereInput | AlertaProyectoWhereInput[]
    tenant_id?: UuidFilter<"AlertaProyecto"> | string
    proyecto_id?: UuidFilter<"AlertaProyecto"> | string
    concepto_id?: UuidNullableFilter<"AlertaProyecto"> | string | null
    tipo?: StringFilter<"AlertaProyecto"> | string
    severidad?: StringFilter<"AlertaProyecto"> | string
    titulo?: StringFilter<"AlertaProyecto"> | string
    descripcion?: StringFilter<"AlertaProyecto"> | string
    datos?: JsonFilter<"AlertaProyecto">
    estado?: StringFilter<"AlertaProyecto"> | string
    nota_cp?: StringNullableFilter<"AlertaProyecto"> | string | null
    resuelta_en?: DateTimeNullableFilter<"AlertaProyecto"> | Date | string | null
    created_at?: DateTimeFilter<"AlertaProyecto"> | Date | string
    updated_at?: DateTimeFilter<"AlertaProyecto"> | Date | string
  }, "id">

  export type AlertaProyectoOrderByWithAggregationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    concepto_id?: SortOrderInput | SortOrder
    tipo?: SortOrder
    severidad?: SortOrder
    titulo?: SortOrder
    descripcion?: SortOrder
    datos?: SortOrder
    estado?: SortOrder
    nota_cp?: SortOrderInput | SortOrder
    resuelta_en?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: AlertaProyectoCountOrderByAggregateInput
    _max?: AlertaProyectoMaxOrderByAggregateInput
    _min?: AlertaProyectoMinOrderByAggregateInput
  }

  export type AlertaProyectoScalarWhereWithAggregatesInput = {
    AND?: AlertaProyectoScalarWhereWithAggregatesInput | AlertaProyectoScalarWhereWithAggregatesInput[]
    OR?: AlertaProyectoScalarWhereWithAggregatesInput[]
    NOT?: AlertaProyectoScalarWhereWithAggregatesInput | AlertaProyectoScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"AlertaProyecto"> | string
    tenant_id?: UuidWithAggregatesFilter<"AlertaProyecto"> | string
    proyecto_id?: UuidWithAggregatesFilter<"AlertaProyecto"> | string
    concepto_id?: UuidNullableWithAggregatesFilter<"AlertaProyecto"> | string | null
    tipo?: StringWithAggregatesFilter<"AlertaProyecto"> | string
    severidad?: StringWithAggregatesFilter<"AlertaProyecto"> | string
    titulo?: StringWithAggregatesFilter<"AlertaProyecto"> | string
    descripcion?: StringWithAggregatesFilter<"AlertaProyecto"> | string
    datos?: JsonWithAggregatesFilter<"AlertaProyecto">
    estado?: StringWithAggregatesFilter<"AlertaProyecto"> | string
    nota_cp?: StringNullableWithAggregatesFilter<"AlertaProyecto"> | string | null
    resuelta_en?: DateTimeNullableWithAggregatesFilter<"AlertaProyecto"> | Date | string | null
    created_at?: DateTimeWithAggregatesFilter<"AlertaProyecto"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"AlertaProyecto"> | Date | string
  }

  export type ProyeccionCierreWhereInput = {
    AND?: ProyeccionCierreWhereInput | ProyeccionCierreWhereInput[]
    OR?: ProyeccionCierreWhereInput[]
    NOT?: ProyeccionCierreWhereInput | ProyeccionCierreWhereInput[]
    id?: UuidFilter<"ProyeccionCierre"> | string
    tenant_id?: UuidFilter<"ProyeccionCierre"> | string
    proyecto_id?: UuidFilter<"ProyeccionCierre"> | string
    fecha_calculo?: DateTimeFilter<"ProyeccionCierre"> | Date | string
    bac?: DecimalFilter<"ProyeccionCierre"> | Decimal | DecimalJsLike | number | string
    pv?: DecimalFilter<"ProyeccionCierre"> | Decimal | DecimalJsLike | number | string
    ev?: DecimalFilter<"ProyeccionCierre"> | Decimal | DecimalJsLike | number | string
    ac?: DecimalFilter<"ProyeccionCierre"> | Decimal | DecimalJsLike | number | string
    cpi?: DecimalFilter<"ProyeccionCierre"> | Decimal | DecimalJsLike | number | string
    spi?: DecimalFilter<"ProyeccionCierre"> | Decimal | DecimalJsLike | number | string
    cv?: DecimalFilter<"ProyeccionCierre"> | Decimal | DecimalJsLike | number | string
    sv?: DecimalFilter<"ProyeccionCierre"> | Decimal | DecimalJsLike | number | string
    eac?: DecimalFilter<"ProyeccionCierre"> | Decimal | DecimalJsLike | number | string
    etc?: DecimalFilter<"ProyeccionCierre"> | Decimal | DecimalJsLike | number | string
    vac?: DecimalFilter<"ProyeccionCierre"> | Decimal | DecimalJsLike | number | string
    fecha_fin_plan?: DateTimeNullableFilter<"ProyeccionCierre"> | Date | string | null
    fecha_fin_proyectada?: DateTimeNullableFilter<"ProyeccionCierre"> | Date | string | null
    created_at?: DateTimeFilter<"ProyeccionCierre"> | Date | string
  }

  export type ProyeccionCierreOrderByWithRelationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    fecha_calculo?: SortOrder
    bac?: SortOrder
    pv?: SortOrder
    ev?: SortOrder
    ac?: SortOrder
    cpi?: SortOrder
    spi?: SortOrder
    cv?: SortOrder
    sv?: SortOrder
    eac?: SortOrder
    etc?: SortOrder
    vac?: SortOrder
    fecha_fin_plan?: SortOrderInput | SortOrder
    fecha_fin_proyectada?: SortOrderInput | SortOrder
    created_at?: SortOrder
  }

  export type ProyeccionCierreWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ProyeccionCierreWhereInput | ProyeccionCierreWhereInput[]
    OR?: ProyeccionCierreWhereInput[]
    NOT?: ProyeccionCierreWhereInput | ProyeccionCierreWhereInput[]
    tenant_id?: UuidFilter<"ProyeccionCierre"> | string
    proyecto_id?: UuidFilter<"ProyeccionCierre"> | string
    fecha_calculo?: DateTimeFilter<"ProyeccionCierre"> | Date | string
    bac?: DecimalFilter<"ProyeccionCierre"> | Decimal | DecimalJsLike | number | string
    pv?: DecimalFilter<"ProyeccionCierre"> | Decimal | DecimalJsLike | number | string
    ev?: DecimalFilter<"ProyeccionCierre"> | Decimal | DecimalJsLike | number | string
    ac?: DecimalFilter<"ProyeccionCierre"> | Decimal | DecimalJsLike | number | string
    cpi?: DecimalFilter<"ProyeccionCierre"> | Decimal | DecimalJsLike | number | string
    spi?: DecimalFilter<"ProyeccionCierre"> | Decimal | DecimalJsLike | number | string
    cv?: DecimalFilter<"ProyeccionCierre"> | Decimal | DecimalJsLike | number | string
    sv?: DecimalFilter<"ProyeccionCierre"> | Decimal | DecimalJsLike | number | string
    eac?: DecimalFilter<"ProyeccionCierre"> | Decimal | DecimalJsLike | number | string
    etc?: DecimalFilter<"ProyeccionCierre"> | Decimal | DecimalJsLike | number | string
    vac?: DecimalFilter<"ProyeccionCierre"> | Decimal | DecimalJsLike | number | string
    fecha_fin_plan?: DateTimeNullableFilter<"ProyeccionCierre"> | Date | string | null
    fecha_fin_proyectada?: DateTimeNullableFilter<"ProyeccionCierre"> | Date | string | null
    created_at?: DateTimeFilter<"ProyeccionCierre"> | Date | string
  }, "id">

  export type ProyeccionCierreOrderByWithAggregationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    fecha_calculo?: SortOrder
    bac?: SortOrder
    pv?: SortOrder
    ev?: SortOrder
    ac?: SortOrder
    cpi?: SortOrder
    spi?: SortOrder
    cv?: SortOrder
    sv?: SortOrder
    eac?: SortOrder
    etc?: SortOrder
    vac?: SortOrder
    fecha_fin_plan?: SortOrderInput | SortOrder
    fecha_fin_proyectada?: SortOrderInput | SortOrder
    created_at?: SortOrder
    _count?: ProyeccionCierreCountOrderByAggregateInput
    _avg?: ProyeccionCierreAvgOrderByAggregateInput
    _max?: ProyeccionCierreMaxOrderByAggregateInput
    _min?: ProyeccionCierreMinOrderByAggregateInput
    _sum?: ProyeccionCierreSumOrderByAggregateInput
  }

  export type ProyeccionCierreScalarWhereWithAggregatesInput = {
    AND?: ProyeccionCierreScalarWhereWithAggregatesInput | ProyeccionCierreScalarWhereWithAggregatesInput[]
    OR?: ProyeccionCierreScalarWhereWithAggregatesInput[]
    NOT?: ProyeccionCierreScalarWhereWithAggregatesInput | ProyeccionCierreScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"ProyeccionCierre"> | string
    tenant_id?: UuidWithAggregatesFilter<"ProyeccionCierre"> | string
    proyecto_id?: UuidWithAggregatesFilter<"ProyeccionCierre"> | string
    fecha_calculo?: DateTimeWithAggregatesFilter<"ProyeccionCierre"> | Date | string
    bac?: DecimalWithAggregatesFilter<"ProyeccionCierre"> | Decimal | DecimalJsLike | number | string
    pv?: DecimalWithAggregatesFilter<"ProyeccionCierre"> | Decimal | DecimalJsLike | number | string
    ev?: DecimalWithAggregatesFilter<"ProyeccionCierre"> | Decimal | DecimalJsLike | number | string
    ac?: DecimalWithAggregatesFilter<"ProyeccionCierre"> | Decimal | DecimalJsLike | number | string
    cpi?: DecimalWithAggregatesFilter<"ProyeccionCierre"> | Decimal | DecimalJsLike | number | string
    spi?: DecimalWithAggregatesFilter<"ProyeccionCierre"> | Decimal | DecimalJsLike | number | string
    cv?: DecimalWithAggregatesFilter<"ProyeccionCierre"> | Decimal | DecimalJsLike | number | string
    sv?: DecimalWithAggregatesFilter<"ProyeccionCierre"> | Decimal | DecimalJsLike | number | string
    eac?: DecimalWithAggregatesFilter<"ProyeccionCierre"> | Decimal | DecimalJsLike | number | string
    etc?: DecimalWithAggregatesFilter<"ProyeccionCierre"> | Decimal | DecimalJsLike | number | string
    vac?: DecimalWithAggregatesFilter<"ProyeccionCierre"> | Decimal | DecimalJsLike | number | string
    fecha_fin_plan?: DateTimeNullableWithAggregatesFilter<"ProyeccionCierre"> | Date | string | null
    fecha_fin_proyectada?: DateTimeNullableWithAggregatesFilter<"ProyeccionCierre"> | Date | string | null
    created_at?: DateTimeWithAggregatesFilter<"ProyeccionCierre"> | Date | string
  }

  export type ProgramacionObraCreateInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    concepto_id: string
    concepto_clave: string
    descripcion: string
    fecha_inicio_plan: Date | string
    fecha_fin_plan: Date | string
    curva_programada: JsonNullValueInput | InputJsonValue
    fecha_inicio_real?: Date | string | null
    fecha_fin_real?: Date | string | null
    pct_avance_real?: Decimal | DecimalJsLike | number | string
    cpi?: Decimal | DecimalJsLike | number | string | null
    spi?: Decimal | DecimalJsLike | number | string | null
    eac?: Decimal | DecimalJsLike | number | string | null
    bac?: Decimal | DecimalJsLike | number | string
    estado?: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ProgramacionObraUncheckedCreateInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    concepto_id: string
    concepto_clave: string
    descripcion: string
    fecha_inicio_plan: Date | string
    fecha_fin_plan: Date | string
    curva_programada: JsonNullValueInput | InputJsonValue
    fecha_inicio_real?: Date | string | null
    fecha_fin_real?: Date | string | null
    pct_avance_real?: Decimal | DecimalJsLike | number | string
    cpi?: Decimal | DecimalJsLike | number | string | null
    spi?: Decimal | DecimalJsLike | number | string | null
    eac?: Decimal | DecimalJsLike | number | string | null
    bac?: Decimal | DecimalJsLike | number | string
    estado?: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ProgramacionObraUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    concepto_id?: StringFieldUpdateOperationsInput | string
    concepto_clave?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    fecha_inicio_plan?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_fin_plan?: DateTimeFieldUpdateOperationsInput | Date | string
    curva_programada?: JsonNullValueInput | InputJsonValue
    fecha_inicio_real?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_fin_real?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pct_avance_real?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cpi?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    spi?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    eac?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    bac?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    estado?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProgramacionObraUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    concepto_id?: StringFieldUpdateOperationsInput | string
    concepto_clave?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    fecha_inicio_plan?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_fin_plan?: DateTimeFieldUpdateOperationsInput | Date | string
    curva_programada?: JsonNullValueInput | InputJsonValue
    fecha_inicio_real?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_fin_real?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pct_avance_real?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cpi?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    spi?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    eac?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    bac?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    estado?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProgramacionObraCreateManyInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    concepto_id: string
    concepto_clave: string
    descripcion: string
    fecha_inicio_plan: Date | string
    fecha_fin_plan: Date | string
    curva_programada: JsonNullValueInput | InputJsonValue
    fecha_inicio_real?: Date | string | null
    fecha_fin_real?: Date | string | null
    pct_avance_real?: Decimal | DecimalJsLike | number | string
    cpi?: Decimal | DecimalJsLike | number | string | null
    spi?: Decimal | DecimalJsLike | number | string | null
    eac?: Decimal | DecimalJsLike | number | string | null
    bac?: Decimal | DecimalJsLike | number | string
    estado?: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ProgramacionObraUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    concepto_id?: StringFieldUpdateOperationsInput | string
    concepto_clave?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    fecha_inicio_plan?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_fin_plan?: DateTimeFieldUpdateOperationsInput | Date | string
    curva_programada?: JsonNullValueInput | InputJsonValue
    fecha_inicio_real?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_fin_real?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pct_avance_real?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cpi?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    spi?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    eac?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    bac?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    estado?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProgramacionObraUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    concepto_id?: StringFieldUpdateOperationsInput | string
    concepto_clave?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    fecha_inicio_plan?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_fin_plan?: DateTimeFieldUpdateOperationsInput | Date | string
    curva_programada?: JsonNullValueInput | InputJsonValue
    fecha_inicio_real?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_fin_real?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pct_avance_real?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cpi?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    spi?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    eac?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    bac?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    estado?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AlertaProyectoCreateInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    concepto_id?: string | null
    tipo: string
    severidad: string
    titulo: string
    descripcion: string
    datos: JsonNullValueInput | InputJsonValue
    estado?: string
    nota_cp?: string | null
    resuelta_en?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type AlertaProyectoUncheckedCreateInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    concepto_id?: string | null
    tipo: string
    severidad: string
    titulo: string
    descripcion: string
    datos: JsonNullValueInput | InputJsonValue
    estado?: string
    nota_cp?: string | null
    resuelta_en?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type AlertaProyectoUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    concepto_id?: NullableStringFieldUpdateOperationsInput | string | null
    tipo?: StringFieldUpdateOperationsInput | string
    severidad?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    datos?: JsonNullValueInput | InputJsonValue
    estado?: StringFieldUpdateOperationsInput | string
    nota_cp?: NullableStringFieldUpdateOperationsInput | string | null
    resuelta_en?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AlertaProyectoUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    concepto_id?: NullableStringFieldUpdateOperationsInput | string | null
    tipo?: StringFieldUpdateOperationsInput | string
    severidad?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    datos?: JsonNullValueInput | InputJsonValue
    estado?: StringFieldUpdateOperationsInput | string
    nota_cp?: NullableStringFieldUpdateOperationsInput | string | null
    resuelta_en?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AlertaProyectoCreateManyInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    concepto_id?: string | null
    tipo: string
    severidad: string
    titulo: string
    descripcion: string
    datos: JsonNullValueInput | InputJsonValue
    estado?: string
    nota_cp?: string | null
    resuelta_en?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type AlertaProyectoUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    concepto_id?: NullableStringFieldUpdateOperationsInput | string | null
    tipo?: StringFieldUpdateOperationsInput | string
    severidad?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    datos?: JsonNullValueInput | InputJsonValue
    estado?: StringFieldUpdateOperationsInput | string
    nota_cp?: NullableStringFieldUpdateOperationsInput | string | null
    resuelta_en?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AlertaProyectoUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    concepto_id?: NullableStringFieldUpdateOperationsInput | string | null
    tipo?: StringFieldUpdateOperationsInput | string
    severidad?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    datos?: JsonNullValueInput | InputJsonValue
    estado?: StringFieldUpdateOperationsInput | string
    nota_cp?: NullableStringFieldUpdateOperationsInput | string | null
    resuelta_en?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProyeccionCierreCreateInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    fecha_calculo: Date | string
    bac: Decimal | DecimalJsLike | number | string
    pv: Decimal | DecimalJsLike | number | string
    ev: Decimal | DecimalJsLike | number | string
    ac: Decimal | DecimalJsLike | number | string
    cpi: Decimal | DecimalJsLike | number | string
    spi: Decimal | DecimalJsLike | number | string
    cv: Decimal | DecimalJsLike | number | string
    sv: Decimal | DecimalJsLike | number | string
    eac: Decimal | DecimalJsLike | number | string
    etc: Decimal | DecimalJsLike | number | string
    vac: Decimal | DecimalJsLike | number | string
    fecha_fin_plan?: Date | string | null
    fecha_fin_proyectada?: Date | string | null
    created_at?: Date | string
  }

  export type ProyeccionCierreUncheckedCreateInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    fecha_calculo: Date | string
    bac: Decimal | DecimalJsLike | number | string
    pv: Decimal | DecimalJsLike | number | string
    ev: Decimal | DecimalJsLike | number | string
    ac: Decimal | DecimalJsLike | number | string
    cpi: Decimal | DecimalJsLike | number | string
    spi: Decimal | DecimalJsLike | number | string
    cv: Decimal | DecimalJsLike | number | string
    sv: Decimal | DecimalJsLike | number | string
    eac: Decimal | DecimalJsLike | number | string
    etc: Decimal | DecimalJsLike | number | string
    vac: Decimal | DecimalJsLike | number | string
    fecha_fin_plan?: Date | string | null
    fecha_fin_proyectada?: Date | string | null
    created_at?: Date | string
  }

  export type ProyeccionCierreUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    fecha_calculo?: DateTimeFieldUpdateOperationsInput | Date | string
    bac?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    pv?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    ev?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    ac?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cpi?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    spi?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cv?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    sv?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    eac?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    etc?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    vac?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    fecha_fin_plan?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_fin_proyectada?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProyeccionCierreUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    fecha_calculo?: DateTimeFieldUpdateOperationsInput | Date | string
    bac?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    pv?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    ev?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    ac?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cpi?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    spi?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cv?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    sv?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    eac?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    etc?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    vac?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    fecha_fin_plan?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_fin_proyectada?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProyeccionCierreCreateManyInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    fecha_calculo: Date | string
    bac: Decimal | DecimalJsLike | number | string
    pv: Decimal | DecimalJsLike | number | string
    ev: Decimal | DecimalJsLike | number | string
    ac: Decimal | DecimalJsLike | number | string
    cpi: Decimal | DecimalJsLike | number | string
    spi: Decimal | DecimalJsLike | number | string
    cv: Decimal | DecimalJsLike | number | string
    sv: Decimal | DecimalJsLike | number | string
    eac: Decimal | DecimalJsLike | number | string
    etc: Decimal | DecimalJsLike | number | string
    vac: Decimal | DecimalJsLike | number | string
    fecha_fin_plan?: Date | string | null
    fecha_fin_proyectada?: Date | string | null
    created_at?: Date | string
  }

  export type ProyeccionCierreUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    fecha_calculo?: DateTimeFieldUpdateOperationsInput | Date | string
    bac?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    pv?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    ev?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    ac?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cpi?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    spi?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cv?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    sv?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    eac?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    etc?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    vac?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    fecha_fin_plan?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_fin_proyectada?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProyeccionCierreUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    fecha_calculo?: DateTimeFieldUpdateOperationsInput | Date | string
    bac?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    pv?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    ev?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    ac?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cpi?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    spi?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cv?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    sv?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    eac?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    etc?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    vac?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    fecha_fin_plan?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_fin_proyectada?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
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
  export type JsonFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
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

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type ProgramacionObraTenant_idProyecto_idConcepto_idCompoundUniqueInput = {
    tenant_id: string
    proyecto_id: string
    concepto_id: string
  }

  export type ProgramacionObraCountOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    concepto_id?: SortOrder
    concepto_clave?: SortOrder
    descripcion?: SortOrder
    fecha_inicio_plan?: SortOrder
    fecha_fin_plan?: SortOrder
    curva_programada?: SortOrder
    fecha_inicio_real?: SortOrder
    fecha_fin_real?: SortOrder
    pct_avance_real?: SortOrder
    cpi?: SortOrder
    spi?: SortOrder
    eac?: SortOrder
    bac?: SortOrder
    estado?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ProgramacionObraAvgOrderByAggregateInput = {
    pct_avance_real?: SortOrder
    cpi?: SortOrder
    spi?: SortOrder
    eac?: SortOrder
    bac?: SortOrder
  }

  export type ProgramacionObraMaxOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    concepto_id?: SortOrder
    concepto_clave?: SortOrder
    descripcion?: SortOrder
    fecha_inicio_plan?: SortOrder
    fecha_fin_plan?: SortOrder
    fecha_inicio_real?: SortOrder
    fecha_fin_real?: SortOrder
    pct_avance_real?: SortOrder
    cpi?: SortOrder
    spi?: SortOrder
    eac?: SortOrder
    bac?: SortOrder
    estado?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ProgramacionObraMinOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    concepto_id?: SortOrder
    concepto_clave?: SortOrder
    descripcion?: SortOrder
    fecha_inicio_plan?: SortOrder
    fecha_fin_plan?: SortOrder
    fecha_inicio_real?: SortOrder
    fecha_fin_real?: SortOrder
    pct_avance_real?: SortOrder
    cpi?: SortOrder
    spi?: SortOrder
    eac?: SortOrder
    bac?: SortOrder
    estado?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ProgramacionObraSumOrderByAggregateInput = {
    pct_avance_real?: SortOrder
    cpi?: SortOrder
    spi?: SortOrder
    eac?: SortOrder
    bac?: SortOrder
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
  export type JsonWithAggregatesFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
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
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
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

  export type AlertaProyectoCountOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    concepto_id?: SortOrder
    tipo?: SortOrder
    severidad?: SortOrder
    titulo?: SortOrder
    descripcion?: SortOrder
    datos?: SortOrder
    estado?: SortOrder
    nota_cp?: SortOrder
    resuelta_en?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type AlertaProyectoMaxOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    concepto_id?: SortOrder
    tipo?: SortOrder
    severidad?: SortOrder
    titulo?: SortOrder
    descripcion?: SortOrder
    estado?: SortOrder
    nota_cp?: SortOrder
    resuelta_en?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type AlertaProyectoMinOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    concepto_id?: SortOrder
    tipo?: SortOrder
    severidad?: SortOrder
    titulo?: SortOrder
    descripcion?: SortOrder
    estado?: SortOrder
    nota_cp?: SortOrder
    resuelta_en?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
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

  export type ProyeccionCierreCountOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    fecha_calculo?: SortOrder
    bac?: SortOrder
    pv?: SortOrder
    ev?: SortOrder
    ac?: SortOrder
    cpi?: SortOrder
    spi?: SortOrder
    cv?: SortOrder
    sv?: SortOrder
    eac?: SortOrder
    etc?: SortOrder
    vac?: SortOrder
    fecha_fin_plan?: SortOrder
    fecha_fin_proyectada?: SortOrder
    created_at?: SortOrder
  }

  export type ProyeccionCierreAvgOrderByAggregateInput = {
    bac?: SortOrder
    pv?: SortOrder
    ev?: SortOrder
    ac?: SortOrder
    cpi?: SortOrder
    spi?: SortOrder
    cv?: SortOrder
    sv?: SortOrder
    eac?: SortOrder
    etc?: SortOrder
    vac?: SortOrder
  }

  export type ProyeccionCierreMaxOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    fecha_calculo?: SortOrder
    bac?: SortOrder
    pv?: SortOrder
    ev?: SortOrder
    ac?: SortOrder
    cpi?: SortOrder
    spi?: SortOrder
    cv?: SortOrder
    sv?: SortOrder
    eac?: SortOrder
    etc?: SortOrder
    vac?: SortOrder
    fecha_fin_plan?: SortOrder
    fecha_fin_proyectada?: SortOrder
    created_at?: SortOrder
  }

  export type ProyeccionCierreMinOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    fecha_calculo?: SortOrder
    bac?: SortOrder
    pv?: SortOrder
    ev?: SortOrder
    ac?: SortOrder
    cpi?: SortOrder
    spi?: SortOrder
    cv?: SortOrder
    sv?: SortOrder
    eac?: SortOrder
    etc?: SortOrder
    vac?: SortOrder
    fecha_fin_plan?: SortOrder
    fecha_fin_proyectada?: SortOrder
    created_at?: SortOrder
  }

  export type ProyeccionCierreSumOrderByAggregateInput = {
    bac?: SortOrder
    pv?: SortOrder
    ev?: SortOrder
    ac?: SortOrder
    cpi?: SortOrder
    spi?: SortOrder
    cv?: SortOrder
    sv?: SortOrder
    eac?: SortOrder
    etc?: SortOrder
    vac?: SortOrder
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
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

  export type NullableDecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string | null
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
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
  export type NestedJsonFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
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



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use ProgramacionObraDefaultArgs instead
     */
    export type ProgramacionObraArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProgramacionObraDefaultArgs<ExtArgs>
    /**
     * @deprecated Use AlertaProyectoDefaultArgs instead
     */
    export type AlertaProyectoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AlertaProyectoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ProyeccionCierreDefaultArgs instead
     */
    export type ProyeccionCierreArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProyeccionCierreDefaultArgs<ExtArgs>

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