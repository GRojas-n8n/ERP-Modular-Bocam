
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
 * Model Empleado
 * 
 */
export type Empleado = $Result.DefaultSelection<Prisma.$EmpleadoPayload>
/**
 * Model Cuadrilla
 * 
 */
export type Cuadrilla = $Result.DefaultSelection<Prisma.$CuadrillaPayload>
/**
 * Model AsignacionFrente
 * 
 */
export type AsignacionFrente = $Result.DefaultSelection<Prisma.$AsignacionFrentePayload>
/**
 * Model PreNomina
 * 
 */
export type PreNomina = $Result.DefaultSelection<Prisma.$PreNominaPayload>
/**
 * Model PreNominaDetalle
 * 
 */
export type PreNominaDetalle = $Result.DefaultSelection<Prisma.$PreNominaDetallePayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Empleados
 * const empleados = await prisma.empleado.findMany()
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
   * // Fetch zero or more Empleados
   * const empleados = await prisma.empleado.findMany()
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
   * `prisma.empleado`: Exposes CRUD operations for the **Empleado** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Empleados
    * const empleados = await prisma.empleado.findMany()
    * ```
    */
  get empleado(): Prisma.EmpleadoDelegate<ExtArgs>;

  /**
   * `prisma.cuadrilla`: Exposes CRUD operations for the **Cuadrilla** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Cuadrillas
    * const cuadrillas = await prisma.cuadrilla.findMany()
    * ```
    */
  get cuadrilla(): Prisma.CuadrillaDelegate<ExtArgs>;

  /**
   * `prisma.asignacionFrente`: Exposes CRUD operations for the **AsignacionFrente** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AsignacionFrentes
    * const asignacionFrentes = await prisma.asignacionFrente.findMany()
    * ```
    */
  get asignacionFrente(): Prisma.AsignacionFrenteDelegate<ExtArgs>;

  /**
   * `prisma.preNomina`: Exposes CRUD operations for the **PreNomina** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PreNominas
    * const preNominas = await prisma.preNomina.findMany()
    * ```
    */
  get preNomina(): Prisma.PreNominaDelegate<ExtArgs>;

  /**
   * `prisma.preNominaDetalle`: Exposes CRUD operations for the **PreNominaDetalle** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PreNominaDetalles
    * const preNominaDetalles = await prisma.preNominaDetalle.findMany()
    * ```
    */
  get preNominaDetalle(): Prisma.PreNominaDetalleDelegate<ExtArgs>;
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
    Empleado: 'Empleado',
    Cuadrilla: 'Cuadrilla',
    AsignacionFrente: 'AsignacionFrente',
    PreNomina: 'PreNomina',
    PreNominaDetalle: 'PreNominaDetalle'
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
      modelProps: "empleado" | "cuadrilla" | "asignacionFrente" | "preNomina" | "preNominaDetalle"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Empleado: {
        payload: Prisma.$EmpleadoPayload<ExtArgs>
        fields: Prisma.EmpleadoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.EmpleadoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmpleadoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.EmpleadoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmpleadoPayload>
          }
          findFirst: {
            args: Prisma.EmpleadoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmpleadoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.EmpleadoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmpleadoPayload>
          }
          findMany: {
            args: Prisma.EmpleadoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmpleadoPayload>[]
          }
          create: {
            args: Prisma.EmpleadoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmpleadoPayload>
          }
          createMany: {
            args: Prisma.EmpleadoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.EmpleadoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmpleadoPayload>[]
          }
          delete: {
            args: Prisma.EmpleadoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmpleadoPayload>
          }
          update: {
            args: Prisma.EmpleadoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmpleadoPayload>
          }
          deleteMany: {
            args: Prisma.EmpleadoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.EmpleadoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.EmpleadoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmpleadoPayload>
          }
          aggregate: {
            args: Prisma.EmpleadoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateEmpleado>
          }
          groupBy: {
            args: Prisma.EmpleadoGroupByArgs<ExtArgs>
            result: $Utils.Optional<EmpleadoGroupByOutputType>[]
          }
          count: {
            args: Prisma.EmpleadoCountArgs<ExtArgs>
            result: $Utils.Optional<EmpleadoCountAggregateOutputType> | number
          }
        }
      }
      Cuadrilla: {
        payload: Prisma.$CuadrillaPayload<ExtArgs>
        fields: Prisma.CuadrillaFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CuadrillaFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CuadrillaPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CuadrillaFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CuadrillaPayload>
          }
          findFirst: {
            args: Prisma.CuadrillaFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CuadrillaPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CuadrillaFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CuadrillaPayload>
          }
          findMany: {
            args: Prisma.CuadrillaFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CuadrillaPayload>[]
          }
          create: {
            args: Prisma.CuadrillaCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CuadrillaPayload>
          }
          createMany: {
            args: Prisma.CuadrillaCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CuadrillaCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CuadrillaPayload>[]
          }
          delete: {
            args: Prisma.CuadrillaDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CuadrillaPayload>
          }
          update: {
            args: Prisma.CuadrillaUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CuadrillaPayload>
          }
          deleteMany: {
            args: Prisma.CuadrillaDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CuadrillaUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CuadrillaUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CuadrillaPayload>
          }
          aggregate: {
            args: Prisma.CuadrillaAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCuadrilla>
          }
          groupBy: {
            args: Prisma.CuadrillaGroupByArgs<ExtArgs>
            result: $Utils.Optional<CuadrillaGroupByOutputType>[]
          }
          count: {
            args: Prisma.CuadrillaCountArgs<ExtArgs>
            result: $Utils.Optional<CuadrillaCountAggregateOutputType> | number
          }
        }
      }
      AsignacionFrente: {
        payload: Prisma.$AsignacionFrentePayload<ExtArgs>
        fields: Prisma.AsignacionFrenteFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AsignacionFrenteFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AsignacionFrentePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AsignacionFrenteFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AsignacionFrentePayload>
          }
          findFirst: {
            args: Prisma.AsignacionFrenteFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AsignacionFrentePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AsignacionFrenteFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AsignacionFrentePayload>
          }
          findMany: {
            args: Prisma.AsignacionFrenteFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AsignacionFrentePayload>[]
          }
          create: {
            args: Prisma.AsignacionFrenteCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AsignacionFrentePayload>
          }
          createMany: {
            args: Prisma.AsignacionFrenteCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AsignacionFrenteCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AsignacionFrentePayload>[]
          }
          delete: {
            args: Prisma.AsignacionFrenteDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AsignacionFrentePayload>
          }
          update: {
            args: Prisma.AsignacionFrenteUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AsignacionFrentePayload>
          }
          deleteMany: {
            args: Prisma.AsignacionFrenteDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AsignacionFrenteUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AsignacionFrenteUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AsignacionFrentePayload>
          }
          aggregate: {
            args: Prisma.AsignacionFrenteAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAsignacionFrente>
          }
          groupBy: {
            args: Prisma.AsignacionFrenteGroupByArgs<ExtArgs>
            result: $Utils.Optional<AsignacionFrenteGroupByOutputType>[]
          }
          count: {
            args: Prisma.AsignacionFrenteCountArgs<ExtArgs>
            result: $Utils.Optional<AsignacionFrenteCountAggregateOutputType> | number
          }
        }
      }
      PreNomina: {
        payload: Prisma.$PreNominaPayload<ExtArgs>
        fields: Prisma.PreNominaFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PreNominaFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PreNominaPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PreNominaFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PreNominaPayload>
          }
          findFirst: {
            args: Prisma.PreNominaFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PreNominaPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PreNominaFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PreNominaPayload>
          }
          findMany: {
            args: Prisma.PreNominaFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PreNominaPayload>[]
          }
          create: {
            args: Prisma.PreNominaCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PreNominaPayload>
          }
          createMany: {
            args: Prisma.PreNominaCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PreNominaCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PreNominaPayload>[]
          }
          delete: {
            args: Prisma.PreNominaDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PreNominaPayload>
          }
          update: {
            args: Prisma.PreNominaUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PreNominaPayload>
          }
          deleteMany: {
            args: Prisma.PreNominaDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PreNominaUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PreNominaUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PreNominaPayload>
          }
          aggregate: {
            args: Prisma.PreNominaAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePreNomina>
          }
          groupBy: {
            args: Prisma.PreNominaGroupByArgs<ExtArgs>
            result: $Utils.Optional<PreNominaGroupByOutputType>[]
          }
          count: {
            args: Prisma.PreNominaCountArgs<ExtArgs>
            result: $Utils.Optional<PreNominaCountAggregateOutputType> | number
          }
        }
      }
      PreNominaDetalle: {
        payload: Prisma.$PreNominaDetallePayload<ExtArgs>
        fields: Prisma.PreNominaDetalleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PreNominaDetalleFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PreNominaDetallePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PreNominaDetalleFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PreNominaDetallePayload>
          }
          findFirst: {
            args: Prisma.PreNominaDetalleFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PreNominaDetallePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PreNominaDetalleFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PreNominaDetallePayload>
          }
          findMany: {
            args: Prisma.PreNominaDetalleFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PreNominaDetallePayload>[]
          }
          create: {
            args: Prisma.PreNominaDetalleCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PreNominaDetallePayload>
          }
          createMany: {
            args: Prisma.PreNominaDetalleCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PreNominaDetalleCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PreNominaDetallePayload>[]
          }
          delete: {
            args: Prisma.PreNominaDetalleDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PreNominaDetallePayload>
          }
          update: {
            args: Prisma.PreNominaDetalleUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PreNominaDetallePayload>
          }
          deleteMany: {
            args: Prisma.PreNominaDetalleDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PreNominaDetalleUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PreNominaDetalleUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PreNominaDetallePayload>
          }
          aggregate: {
            args: Prisma.PreNominaDetalleAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePreNominaDetalle>
          }
          groupBy: {
            args: Prisma.PreNominaDetalleGroupByArgs<ExtArgs>
            result: $Utils.Optional<PreNominaDetalleGroupByOutputType>[]
          }
          count: {
            args: Prisma.PreNominaDetalleCountArgs<ExtArgs>
            result: $Utils.Optional<PreNominaDetalleCountAggregateOutputType> | number
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
   * Count Type EmpleadoCountOutputType
   */

  export type EmpleadoCountOutputType = {
    asignaciones: number
    prenominas: number
  }

  export type EmpleadoCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    asignaciones?: boolean | EmpleadoCountOutputTypeCountAsignacionesArgs
    prenominas?: boolean | EmpleadoCountOutputTypeCountPrenominasArgs
  }

  // Custom InputTypes
  /**
   * EmpleadoCountOutputType without action
   */
  export type EmpleadoCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmpleadoCountOutputType
     */
    select?: EmpleadoCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * EmpleadoCountOutputType without action
   */
  export type EmpleadoCountOutputTypeCountAsignacionesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AsignacionFrenteWhereInput
  }

  /**
   * EmpleadoCountOutputType without action
   */
  export type EmpleadoCountOutputTypeCountPrenominasArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PreNominaDetalleWhereInput
  }


  /**
   * Count Type CuadrillaCountOutputType
   */

  export type CuadrillaCountOutputType = {
    miembros: number
    asignaciones: number
  }

  export type CuadrillaCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    miembros?: boolean | CuadrillaCountOutputTypeCountMiembrosArgs
    asignaciones?: boolean | CuadrillaCountOutputTypeCountAsignacionesArgs
  }

  // Custom InputTypes
  /**
   * CuadrillaCountOutputType without action
   */
  export type CuadrillaCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CuadrillaCountOutputType
     */
    select?: CuadrillaCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CuadrillaCountOutputType without action
   */
  export type CuadrillaCountOutputTypeCountMiembrosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EmpleadoWhereInput
  }

  /**
   * CuadrillaCountOutputType without action
   */
  export type CuadrillaCountOutputTypeCountAsignacionesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AsignacionFrenteWhereInput
  }


  /**
   * Count Type PreNominaCountOutputType
   */

  export type PreNominaCountOutputType = {
    detalles: number
  }

  export type PreNominaCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    detalles?: boolean | PreNominaCountOutputTypeCountDetallesArgs
  }

  // Custom InputTypes
  /**
   * PreNominaCountOutputType without action
   */
  export type PreNominaCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PreNominaCountOutputType
     */
    select?: PreNominaCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * PreNominaCountOutputType without action
   */
  export type PreNominaCountOutputTypeCountDetallesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PreNominaDetalleWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Empleado
   */

  export type AggregateEmpleado = {
    _count: EmpleadoCountAggregateOutputType | null
    _avg: EmpleadoAvgAggregateOutputType | null
    _sum: EmpleadoSumAggregateOutputType | null
    _min: EmpleadoMinAggregateOutputType | null
    _max: EmpleadoMaxAggregateOutputType | null
  }

  export type EmpleadoAvgAggregateOutputType = {
    salario_diario: Decimal | null
    salario_integrado: Decimal | null
  }

  export type EmpleadoSumAggregateOutputType = {
    salario_diario: Decimal | null
    salario_integrado: Decimal | null
  }

  export type EmpleadoMinAggregateOutputType = {
    id_empleado: string | null
    tenant_id: string | null
    numero_empleado: string | null
    nombre: string | null
    apellido_paterno: string | null
    apellido_materno: string | null
    rfc: string | null
    curp: string | null
    nss: string | null
    puesto: string | null
    categoria: string | null
    tipo_contrato: string | null
    fecha_ingreso: Date | null
    fecha_baja: Date | null
    salario_diario: Decimal | null
    salario_integrado: Decimal | null
    telefono: string | null
    email: string | null
    contacto_emergencia: string | null
    certificaciones: string | null
    estado: string | null
    cuadrilla_id: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type EmpleadoMaxAggregateOutputType = {
    id_empleado: string | null
    tenant_id: string | null
    numero_empleado: string | null
    nombre: string | null
    apellido_paterno: string | null
    apellido_materno: string | null
    rfc: string | null
    curp: string | null
    nss: string | null
    puesto: string | null
    categoria: string | null
    tipo_contrato: string | null
    fecha_ingreso: Date | null
    fecha_baja: Date | null
    salario_diario: Decimal | null
    salario_integrado: Decimal | null
    telefono: string | null
    email: string | null
    contacto_emergencia: string | null
    certificaciones: string | null
    estado: string | null
    cuadrilla_id: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type EmpleadoCountAggregateOutputType = {
    id_empleado: number
    tenant_id: number
    numero_empleado: number
    nombre: number
    apellido_paterno: number
    apellido_materno: number
    rfc: number
    curp: number
    nss: number
    puesto: number
    categoria: number
    tipo_contrato: number
    fecha_ingreso: number
    fecha_baja: number
    salario_diario: number
    salario_integrado: number
    telefono: number
    email: number
    contacto_emergencia: number
    certificaciones: number
    estado: number
    cuadrilla_id: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type EmpleadoAvgAggregateInputType = {
    salario_diario?: true
    salario_integrado?: true
  }

  export type EmpleadoSumAggregateInputType = {
    salario_diario?: true
    salario_integrado?: true
  }

  export type EmpleadoMinAggregateInputType = {
    id_empleado?: true
    tenant_id?: true
    numero_empleado?: true
    nombre?: true
    apellido_paterno?: true
    apellido_materno?: true
    rfc?: true
    curp?: true
    nss?: true
    puesto?: true
    categoria?: true
    tipo_contrato?: true
    fecha_ingreso?: true
    fecha_baja?: true
    salario_diario?: true
    salario_integrado?: true
    telefono?: true
    email?: true
    contacto_emergencia?: true
    certificaciones?: true
    estado?: true
    cuadrilla_id?: true
    created_at?: true
    updated_at?: true
  }

  export type EmpleadoMaxAggregateInputType = {
    id_empleado?: true
    tenant_id?: true
    numero_empleado?: true
    nombre?: true
    apellido_paterno?: true
    apellido_materno?: true
    rfc?: true
    curp?: true
    nss?: true
    puesto?: true
    categoria?: true
    tipo_contrato?: true
    fecha_ingreso?: true
    fecha_baja?: true
    salario_diario?: true
    salario_integrado?: true
    telefono?: true
    email?: true
    contacto_emergencia?: true
    certificaciones?: true
    estado?: true
    cuadrilla_id?: true
    created_at?: true
    updated_at?: true
  }

  export type EmpleadoCountAggregateInputType = {
    id_empleado?: true
    tenant_id?: true
    numero_empleado?: true
    nombre?: true
    apellido_paterno?: true
    apellido_materno?: true
    rfc?: true
    curp?: true
    nss?: true
    puesto?: true
    categoria?: true
    tipo_contrato?: true
    fecha_ingreso?: true
    fecha_baja?: true
    salario_diario?: true
    salario_integrado?: true
    telefono?: true
    email?: true
    contacto_emergencia?: true
    certificaciones?: true
    estado?: true
    cuadrilla_id?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type EmpleadoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Empleado to aggregate.
     */
    where?: EmpleadoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Empleados to fetch.
     */
    orderBy?: EmpleadoOrderByWithRelationInput | EmpleadoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: EmpleadoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Empleados from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Empleados.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Empleados
    **/
    _count?: true | EmpleadoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: EmpleadoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: EmpleadoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: EmpleadoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: EmpleadoMaxAggregateInputType
  }

  export type GetEmpleadoAggregateType<T extends EmpleadoAggregateArgs> = {
        [P in keyof T & keyof AggregateEmpleado]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEmpleado[P]>
      : GetScalarType<T[P], AggregateEmpleado[P]>
  }




  export type EmpleadoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EmpleadoWhereInput
    orderBy?: EmpleadoOrderByWithAggregationInput | EmpleadoOrderByWithAggregationInput[]
    by: EmpleadoScalarFieldEnum[] | EmpleadoScalarFieldEnum
    having?: EmpleadoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: EmpleadoCountAggregateInputType | true
    _avg?: EmpleadoAvgAggregateInputType
    _sum?: EmpleadoSumAggregateInputType
    _min?: EmpleadoMinAggregateInputType
    _max?: EmpleadoMaxAggregateInputType
  }

  export type EmpleadoGroupByOutputType = {
    id_empleado: string
    tenant_id: string
    numero_empleado: string
    nombre: string
    apellido_paterno: string
    apellido_materno: string | null
    rfc: string
    curp: string | null
    nss: string | null
    puesto: string
    categoria: string
    tipo_contrato: string
    fecha_ingreso: Date
    fecha_baja: Date | null
    salario_diario: Decimal
    salario_integrado: Decimal | null
    telefono: string | null
    email: string | null
    contacto_emergencia: string | null
    certificaciones: string | null
    estado: string
    cuadrilla_id: string | null
    created_at: Date
    updated_at: Date
    _count: EmpleadoCountAggregateOutputType | null
    _avg: EmpleadoAvgAggregateOutputType | null
    _sum: EmpleadoSumAggregateOutputType | null
    _min: EmpleadoMinAggregateOutputType | null
    _max: EmpleadoMaxAggregateOutputType | null
  }

  type GetEmpleadoGroupByPayload<T extends EmpleadoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<EmpleadoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof EmpleadoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], EmpleadoGroupByOutputType[P]>
            : GetScalarType<T[P], EmpleadoGroupByOutputType[P]>
        }
      >
    >


  export type EmpleadoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_empleado?: boolean
    tenant_id?: boolean
    numero_empleado?: boolean
    nombre?: boolean
    apellido_paterno?: boolean
    apellido_materno?: boolean
    rfc?: boolean
    curp?: boolean
    nss?: boolean
    puesto?: boolean
    categoria?: boolean
    tipo_contrato?: boolean
    fecha_ingreso?: boolean
    fecha_baja?: boolean
    salario_diario?: boolean
    salario_integrado?: boolean
    telefono?: boolean
    email?: boolean
    contacto_emergencia?: boolean
    certificaciones?: boolean
    estado?: boolean
    cuadrilla_id?: boolean
    created_at?: boolean
    updated_at?: boolean
    cuadrilla?: boolean | Empleado$cuadrillaArgs<ExtArgs>
    asignaciones?: boolean | Empleado$asignacionesArgs<ExtArgs>
    prenominas?: boolean | Empleado$prenominasArgs<ExtArgs>
    _count?: boolean | EmpleadoCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["empleado"]>

  export type EmpleadoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_empleado?: boolean
    tenant_id?: boolean
    numero_empleado?: boolean
    nombre?: boolean
    apellido_paterno?: boolean
    apellido_materno?: boolean
    rfc?: boolean
    curp?: boolean
    nss?: boolean
    puesto?: boolean
    categoria?: boolean
    tipo_contrato?: boolean
    fecha_ingreso?: boolean
    fecha_baja?: boolean
    salario_diario?: boolean
    salario_integrado?: boolean
    telefono?: boolean
    email?: boolean
    contacto_emergencia?: boolean
    certificaciones?: boolean
    estado?: boolean
    cuadrilla_id?: boolean
    created_at?: boolean
    updated_at?: boolean
    cuadrilla?: boolean | Empleado$cuadrillaArgs<ExtArgs>
  }, ExtArgs["result"]["empleado"]>

  export type EmpleadoSelectScalar = {
    id_empleado?: boolean
    tenant_id?: boolean
    numero_empleado?: boolean
    nombre?: boolean
    apellido_paterno?: boolean
    apellido_materno?: boolean
    rfc?: boolean
    curp?: boolean
    nss?: boolean
    puesto?: boolean
    categoria?: boolean
    tipo_contrato?: boolean
    fecha_ingreso?: boolean
    fecha_baja?: boolean
    salario_diario?: boolean
    salario_integrado?: boolean
    telefono?: boolean
    email?: boolean
    contacto_emergencia?: boolean
    certificaciones?: boolean
    estado?: boolean
    cuadrilla_id?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type EmpleadoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cuadrilla?: boolean | Empleado$cuadrillaArgs<ExtArgs>
    asignaciones?: boolean | Empleado$asignacionesArgs<ExtArgs>
    prenominas?: boolean | Empleado$prenominasArgs<ExtArgs>
    _count?: boolean | EmpleadoCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type EmpleadoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cuadrilla?: boolean | Empleado$cuadrillaArgs<ExtArgs>
  }

  export type $EmpleadoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Empleado"
    objects: {
      cuadrilla: Prisma.$CuadrillaPayload<ExtArgs> | null
      asignaciones: Prisma.$AsignacionFrentePayload<ExtArgs>[]
      prenominas: Prisma.$PreNominaDetallePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id_empleado: string
      tenant_id: string
      numero_empleado: string
      nombre: string
      apellido_paterno: string
      apellido_materno: string | null
      rfc: string
      curp: string | null
      nss: string | null
      puesto: string
      categoria: string
      tipo_contrato: string
      fecha_ingreso: Date
      fecha_baja: Date | null
      salario_diario: Prisma.Decimal
      salario_integrado: Prisma.Decimal | null
      telefono: string | null
      email: string | null
      contacto_emergencia: string | null
      certificaciones: string | null
      estado: string
      cuadrilla_id: string | null
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["empleado"]>
    composites: {}
  }

  type EmpleadoGetPayload<S extends boolean | null | undefined | EmpleadoDefaultArgs> = $Result.GetResult<Prisma.$EmpleadoPayload, S>

  type EmpleadoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<EmpleadoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: EmpleadoCountAggregateInputType | true
    }

  export interface EmpleadoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Empleado'], meta: { name: 'Empleado' } }
    /**
     * Find zero or one Empleado that matches the filter.
     * @param {EmpleadoFindUniqueArgs} args - Arguments to find a Empleado
     * @example
     * // Get one Empleado
     * const empleado = await prisma.empleado.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends EmpleadoFindUniqueArgs>(args: SelectSubset<T, EmpleadoFindUniqueArgs<ExtArgs>>): Prisma__EmpleadoClient<$Result.GetResult<Prisma.$EmpleadoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Empleado that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {EmpleadoFindUniqueOrThrowArgs} args - Arguments to find a Empleado
     * @example
     * // Get one Empleado
     * const empleado = await prisma.empleado.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends EmpleadoFindUniqueOrThrowArgs>(args: SelectSubset<T, EmpleadoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__EmpleadoClient<$Result.GetResult<Prisma.$EmpleadoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Empleado that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmpleadoFindFirstArgs} args - Arguments to find a Empleado
     * @example
     * // Get one Empleado
     * const empleado = await prisma.empleado.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends EmpleadoFindFirstArgs>(args?: SelectSubset<T, EmpleadoFindFirstArgs<ExtArgs>>): Prisma__EmpleadoClient<$Result.GetResult<Prisma.$EmpleadoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Empleado that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmpleadoFindFirstOrThrowArgs} args - Arguments to find a Empleado
     * @example
     * // Get one Empleado
     * const empleado = await prisma.empleado.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends EmpleadoFindFirstOrThrowArgs>(args?: SelectSubset<T, EmpleadoFindFirstOrThrowArgs<ExtArgs>>): Prisma__EmpleadoClient<$Result.GetResult<Prisma.$EmpleadoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Empleados that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmpleadoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Empleados
     * const empleados = await prisma.empleado.findMany()
     * 
     * // Get first 10 Empleados
     * const empleados = await prisma.empleado.findMany({ take: 10 })
     * 
     * // Only select the `id_empleado`
     * const empleadoWithId_empleadoOnly = await prisma.empleado.findMany({ select: { id_empleado: true } })
     * 
     */
    findMany<T extends EmpleadoFindManyArgs>(args?: SelectSubset<T, EmpleadoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmpleadoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Empleado.
     * @param {EmpleadoCreateArgs} args - Arguments to create a Empleado.
     * @example
     * // Create one Empleado
     * const Empleado = await prisma.empleado.create({
     *   data: {
     *     // ... data to create a Empleado
     *   }
     * })
     * 
     */
    create<T extends EmpleadoCreateArgs>(args: SelectSubset<T, EmpleadoCreateArgs<ExtArgs>>): Prisma__EmpleadoClient<$Result.GetResult<Prisma.$EmpleadoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Empleados.
     * @param {EmpleadoCreateManyArgs} args - Arguments to create many Empleados.
     * @example
     * // Create many Empleados
     * const empleado = await prisma.empleado.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends EmpleadoCreateManyArgs>(args?: SelectSubset<T, EmpleadoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Empleados and returns the data saved in the database.
     * @param {EmpleadoCreateManyAndReturnArgs} args - Arguments to create many Empleados.
     * @example
     * // Create many Empleados
     * const empleado = await prisma.empleado.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Empleados and only return the `id_empleado`
     * const empleadoWithId_empleadoOnly = await prisma.empleado.createManyAndReturn({ 
     *   select: { id_empleado: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends EmpleadoCreateManyAndReturnArgs>(args?: SelectSubset<T, EmpleadoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmpleadoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Empleado.
     * @param {EmpleadoDeleteArgs} args - Arguments to delete one Empleado.
     * @example
     * // Delete one Empleado
     * const Empleado = await prisma.empleado.delete({
     *   where: {
     *     // ... filter to delete one Empleado
     *   }
     * })
     * 
     */
    delete<T extends EmpleadoDeleteArgs>(args: SelectSubset<T, EmpleadoDeleteArgs<ExtArgs>>): Prisma__EmpleadoClient<$Result.GetResult<Prisma.$EmpleadoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Empleado.
     * @param {EmpleadoUpdateArgs} args - Arguments to update one Empleado.
     * @example
     * // Update one Empleado
     * const empleado = await prisma.empleado.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends EmpleadoUpdateArgs>(args: SelectSubset<T, EmpleadoUpdateArgs<ExtArgs>>): Prisma__EmpleadoClient<$Result.GetResult<Prisma.$EmpleadoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Empleados.
     * @param {EmpleadoDeleteManyArgs} args - Arguments to filter Empleados to delete.
     * @example
     * // Delete a few Empleados
     * const { count } = await prisma.empleado.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends EmpleadoDeleteManyArgs>(args?: SelectSubset<T, EmpleadoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Empleados.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmpleadoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Empleados
     * const empleado = await prisma.empleado.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends EmpleadoUpdateManyArgs>(args: SelectSubset<T, EmpleadoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Empleado.
     * @param {EmpleadoUpsertArgs} args - Arguments to update or create a Empleado.
     * @example
     * // Update or create a Empleado
     * const empleado = await prisma.empleado.upsert({
     *   create: {
     *     // ... data to create a Empleado
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Empleado we want to update
     *   }
     * })
     */
    upsert<T extends EmpleadoUpsertArgs>(args: SelectSubset<T, EmpleadoUpsertArgs<ExtArgs>>): Prisma__EmpleadoClient<$Result.GetResult<Prisma.$EmpleadoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Empleados.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmpleadoCountArgs} args - Arguments to filter Empleados to count.
     * @example
     * // Count the number of Empleados
     * const count = await prisma.empleado.count({
     *   where: {
     *     // ... the filter for the Empleados we want to count
     *   }
     * })
    **/
    count<T extends EmpleadoCountArgs>(
      args?: Subset<T, EmpleadoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], EmpleadoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Empleado.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmpleadoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends EmpleadoAggregateArgs>(args: Subset<T, EmpleadoAggregateArgs>): Prisma.PrismaPromise<GetEmpleadoAggregateType<T>>

    /**
     * Group by Empleado.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmpleadoGroupByArgs} args - Group by arguments.
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
      T extends EmpleadoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: EmpleadoGroupByArgs['orderBy'] }
        : { orderBy?: EmpleadoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, EmpleadoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEmpleadoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Empleado model
   */
  readonly fields: EmpleadoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Empleado.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__EmpleadoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    cuadrilla<T extends Empleado$cuadrillaArgs<ExtArgs> = {}>(args?: Subset<T, Empleado$cuadrillaArgs<ExtArgs>>): Prisma__CuadrillaClient<$Result.GetResult<Prisma.$CuadrillaPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    asignaciones<T extends Empleado$asignacionesArgs<ExtArgs> = {}>(args?: Subset<T, Empleado$asignacionesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AsignacionFrentePayload<ExtArgs>, T, "findMany"> | Null>
    prenominas<T extends Empleado$prenominasArgs<ExtArgs> = {}>(args?: Subset<T, Empleado$prenominasArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PreNominaDetallePayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the Empleado model
   */ 
  interface EmpleadoFieldRefs {
    readonly id_empleado: FieldRef<"Empleado", 'String'>
    readonly tenant_id: FieldRef<"Empleado", 'String'>
    readonly numero_empleado: FieldRef<"Empleado", 'String'>
    readonly nombre: FieldRef<"Empleado", 'String'>
    readonly apellido_paterno: FieldRef<"Empleado", 'String'>
    readonly apellido_materno: FieldRef<"Empleado", 'String'>
    readonly rfc: FieldRef<"Empleado", 'String'>
    readonly curp: FieldRef<"Empleado", 'String'>
    readonly nss: FieldRef<"Empleado", 'String'>
    readonly puesto: FieldRef<"Empleado", 'String'>
    readonly categoria: FieldRef<"Empleado", 'String'>
    readonly tipo_contrato: FieldRef<"Empleado", 'String'>
    readonly fecha_ingreso: FieldRef<"Empleado", 'DateTime'>
    readonly fecha_baja: FieldRef<"Empleado", 'DateTime'>
    readonly salario_diario: FieldRef<"Empleado", 'Decimal'>
    readonly salario_integrado: FieldRef<"Empleado", 'Decimal'>
    readonly telefono: FieldRef<"Empleado", 'String'>
    readonly email: FieldRef<"Empleado", 'String'>
    readonly contacto_emergencia: FieldRef<"Empleado", 'String'>
    readonly certificaciones: FieldRef<"Empleado", 'String'>
    readonly estado: FieldRef<"Empleado", 'String'>
    readonly cuadrilla_id: FieldRef<"Empleado", 'String'>
    readonly created_at: FieldRef<"Empleado", 'DateTime'>
    readonly updated_at: FieldRef<"Empleado", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Empleado findUnique
   */
  export type EmpleadoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Empleado
     */
    select?: EmpleadoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmpleadoInclude<ExtArgs> | null
    /**
     * Filter, which Empleado to fetch.
     */
    where: EmpleadoWhereUniqueInput
  }

  /**
   * Empleado findUniqueOrThrow
   */
  export type EmpleadoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Empleado
     */
    select?: EmpleadoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmpleadoInclude<ExtArgs> | null
    /**
     * Filter, which Empleado to fetch.
     */
    where: EmpleadoWhereUniqueInput
  }

  /**
   * Empleado findFirst
   */
  export type EmpleadoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Empleado
     */
    select?: EmpleadoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmpleadoInclude<ExtArgs> | null
    /**
     * Filter, which Empleado to fetch.
     */
    where?: EmpleadoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Empleados to fetch.
     */
    orderBy?: EmpleadoOrderByWithRelationInput | EmpleadoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Empleados.
     */
    cursor?: EmpleadoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Empleados from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Empleados.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Empleados.
     */
    distinct?: EmpleadoScalarFieldEnum | EmpleadoScalarFieldEnum[]
  }

  /**
   * Empleado findFirstOrThrow
   */
  export type EmpleadoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Empleado
     */
    select?: EmpleadoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmpleadoInclude<ExtArgs> | null
    /**
     * Filter, which Empleado to fetch.
     */
    where?: EmpleadoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Empleados to fetch.
     */
    orderBy?: EmpleadoOrderByWithRelationInput | EmpleadoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Empleados.
     */
    cursor?: EmpleadoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Empleados from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Empleados.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Empleados.
     */
    distinct?: EmpleadoScalarFieldEnum | EmpleadoScalarFieldEnum[]
  }

  /**
   * Empleado findMany
   */
  export type EmpleadoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Empleado
     */
    select?: EmpleadoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmpleadoInclude<ExtArgs> | null
    /**
     * Filter, which Empleados to fetch.
     */
    where?: EmpleadoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Empleados to fetch.
     */
    orderBy?: EmpleadoOrderByWithRelationInput | EmpleadoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Empleados.
     */
    cursor?: EmpleadoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Empleados from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Empleados.
     */
    skip?: number
    distinct?: EmpleadoScalarFieldEnum | EmpleadoScalarFieldEnum[]
  }

  /**
   * Empleado create
   */
  export type EmpleadoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Empleado
     */
    select?: EmpleadoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmpleadoInclude<ExtArgs> | null
    /**
     * The data needed to create a Empleado.
     */
    data: XOR<EmpleadoCreateInput, EmpleadoUncheckedCreateInput>
  }

  /**
   * Empleado createMany
   */
  export type EmpleadoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Empleados.
     */
    data: EmpleadoCreateManyInput | EmpleadoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Empleado createManyAndReturn
   */
  export type EmpleadoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Empleado
     */
    select?: EmpleadoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Empleados.
     */
    data: EmpleadoCreateManyInput | EmpleadoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmpleadoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Empleado update
   */
  export type EmpleadoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Empleado
     */
    select?: EmpleadoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmpleadoInclude<ExtArgs> | null
    /**
     * The data needed to update a Empleado.
     */
    data: XOR<EmpleadoUpdateInput, EmpleadoUncheckedUpdateInput>
    /**
     * Choose, which Empleado to update.
     */
    where: EmpleadoWhereUniqueInput
  }

  /**
   * Empleado updateMany
   */
  export type EmpleadoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Empleados.
     */
    data: XOR<EmpleadoUpdateManyMutationInput, EmpleadoUncheckedUpdateManyInput>
    /**
     * Filter which Empleados to update
     */
    where?: EmpleadoWhereInput
  }

  /**
   * Empleado upsert
   */
  export type EmpleadoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Empleado
     */
    select?: EmpleadoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmpleadoInclude<ExtArgs> | null
    /**
     * The filter to search for the Empleado to update in case it exists.
     */
    where: EmpleadoWhereUniqueInput
    /**
     * In case the Empleado found by the `where` argument doesn't exist, create a new Empleado with this data.
     */
    create: XOR<EmpleadoCreateInput, EmpleadoUncheckedCreateInput>
    /**
     * In case the Empleado was found with the provided `where` argument, update it with this data.
     */
    update: XOR<EmpleadoUpdateInput, EmpleadoUncheckedUpdateInput>
  }

  /**
   * Empleado delete
   */
  export type EmpleadoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Empleado
     */
    select?: EmpleadoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmpleadoInclude<ExtArgs> | null
    /**
     * Filter which Empleado to delete.
     */
    where: EmpleadoWhereUniqueInput
  }

  /**
   * Empleado deleteMany
   */
  export type EmpleadoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Empleados to delete
     */
    where?: EmpleadoWhereInput
  }

  /**
   * Empleado.cuadrilla
   */
  export type Empleado$cuadrillaArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cuadrilla
     */
    select?: CuadrillaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CuadrillaInclude<ExtArgs> | null
    where?: CuadrillaWhereInput
  }

  /**
   * Empleado.asignaciones
   */
  export type Empleado$asignacionesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AsignacionFrente
     */
    select?: AsignacionFrenteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AsignacionFrenteInclude<ExtArgs> | null
    where?: AsignacionFrenteWhereInput
    orderBy?: AsignacionFrenteOrderByWithRelationInput | AsignacionFrenteOrderByWithRelationInput[]
    cursor?: AsignacionFrenteWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AsignacionFrenteScalarFieldEnum | AsignacionFrenteScalarFieldEnum[]
  }

  /**
   * Empleado.prenominas
   */
  export type Empleado$prenominasArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PreNominaDetalle
     */
    select?: PreNominaDetalleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PreNominaDetalleInclude<ExtArgs> | null
    where?: PreNominaDetalleWhereInput
    orderBy?: PreNominaDetalleOrderByWithRelationInput | PreNominaDetalleOrderByWithRelationInput[]
    cursor?: PreNominaDetalleWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PreNominaDetalleScalarFieldEnum | PreNominaDetalleScalarFieldEnum[]
  }

  /**
   * Empleado without action
   */
  export type EmpleadoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Empleado
     */
    select?: EmpleadoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmpleadoInclude<ExtArgs> | null
  }


  /**
   * Model Cuadrilla
   */

  export type AggregateCuadrilla = {
    _count: CuadrillaCountAggregateOutputType | null
    _min: CuadrillaMinAggregateOutputType | null
    _max: CuadrillaMaxAggregateOutputType | null
  }

  export type CuadrillaMinAggregateOutputType = {
    id_cuadrilla: string | null
    tenant_id: string | null
    proyecto_id: string | null
    nombre: string | null
    codigo: string | null
    especialidad: string | null
    capataz_id: string | null
    capataz_nombre: string | null
    estado: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type CuadrillaMaxAggregateOutputType = {
    id_cuadrilla: string | null
    tenant_id: string | null
    proyecto_id: string | null
    nombre: string | null
    codigo: string | null
    especialidad: string | null
    capataz_id: string | null
    capataz_nombre: string | null
    estado: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type CuadrillaCountAggregateOutputType = {
    id_cuadrilla: number
    tenant_id: number
    proyecto_id: number
    nombre: number
    codigo: number
    especialidad: number
    capataz_id: number
    capataz_nombre: number
    estado: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type CuadrillaMinAggregateInputType = {
    id_cuadrilla?: true
    tenant_id?: true
    proyecto_id?: true
    nombre?: true
    codigo?: true
    especialidad?: true
    capataz_id?: true
    capataz_nombre?: true
    estado?: true
    created_at?: true
    updated_at?: true
  }

  export type CuadrillaMaxAggregateInputType = {
    id_cuadrilla?: true
    tenant_id?: true
    proyecto_id?: true
    nombre?: true
    codigo?: true
    especialidad?: true
    capataz_id?: true
    capataz_nombre?: true
    estado?: true
    created_at?: true
    updated_at?: true
  }

  export type CuadrillaCountAggregateInputType = {
    id_cuadrilla?: true
    tenant_id?: true
    proyecto_id?: true
    nombre?: true
    codigo?: true
    especialidad?: true
    capataz_id?: true
    capataz_nombre?: true
    estado?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type CuadrillaAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Cuadrilla to aggregate.
     */
    where?: CuadrillaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Cuadrillas to fetch.
     */
    orderBy?: CuadrillaOrderByWithRelationInput | CuadrillaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CuadrillaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Cuadrillas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Cuadrillas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Cuadrillas
    **/
    _count?: true | CuadrillaCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CuadrillaMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CuadrillaMaxAggregateInputType
  }

  export type GetCuadrillaAggregateType<T extends CuadrillaAggregateArgs> = {
        [P in keyof T & keyof AggregateCuadrilla]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCuadrilla[P]>
      : GetScalarType<T[P], AggregateCuadrilla[P]>
  }




  export type CuadrillaGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CuadrillaWhereInput
    orderBy?: CuadrillaOrderByWithAggregationInput | CuadrillaOrderByWithAggregationInput[]
    by: CuadrillaScalarFieldEnum[] | CuadrillaScalarFieldEnum
    having?: CuadrillaScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CuadrillaCountAggregateInputType | true
    _min?: CuadrillaMinAggregateInputType
    _max?: CuadrillaMaxAggregateInputType
  }

  export type CuadrillaGroupByOutputType = {
    id_cuadrilla: string
    tenant_id: string
    proyecto_id: string
    nombre: string
    codigo: string
    especialidad: string
    capataz_id: string | null
    capataz_nombre: string | null
    estado: string
    created_at: Date
    updated_at: Date
    _count: CuadrillaCountAggregateOutputType | null
    _min: CuadrillaMinAggregateOutputType | null
    _max: CuadrillaMaxAggregateOutputType | null
  }

  type GetCuadrillaGroupByPayload<T extends CuadrillaGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CuadrillaGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CuadrillaGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CuadrillaGroupByOutputType[P]>
            : GetScalarType<T[P], CuadrillaGroupByOutputType[P]>
        }
      >
    >


  export type CuadrillaSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_cuadrilla?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    nombre?: boolean
    codigo?: boolean
    especialidad?: boolean
    capataz_id?: boolean
    capataz_nombre?: boolean
    estado?: boolean
    created_at?: boolean
    updated_at?: boolean
    miembros?: boolean | Cuadrilla$miembrosArgs<ExtArgs>
    asignaciones?: boolean | Cuadrilla$asignacionesArgs<ExtArgs>
    _count?: boolean | CuadrillaCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cuadrilla"]>

  export type CuadrillaSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_cuadrilla?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    nombre?: boolean
    codigo?: boolean
    especialidad?: boolean
    capataz_id?: boolean
    capataz_nombre?: boolean
    estado?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["cuadrilla"]>

  export type CuadrillaSelectScalar = {
    id_cuadrilla?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    nombre?: boolean
    codigo?: boolean
    especialidad?: boolean
    capataz_id?: boolean
    capataz_nombre?: boolean
    estado?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type CuadrillaInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    miembros?: boolean | Cuadrilla$miembrosArgs<ExtArgs>
    asignaciones?: boolean | Cuadrilla$asignacionesArgs<ExtArgs>
    _count?: boolean | CuadrillaCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CuadrillaIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $CuadrillaPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Cuadrilla"
    objects: {
      miembros: Prisma.$EmpleadoPayload<ExtArgs>[]
      asignaciones: Prisma.$AsignacionFrentePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id_cuadrilla: string
      tenant_id: string
      proyecto_id: string
      nombre: string
      codigo: string
      especialidad: string
      capataz_id: string | null
      capataz_nombre: string | null
      estado: string
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["cuadrilla"]>
    composites: {}
  }

  type CuadrillaGetPayload<S extends boolean | null | undefined | CuadrillaDefaultArgs> = $Result.GetResult<Prisma.$CuadrillaPayload, S>

  type CuadrillaCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CuadrillaFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CuadrillaCountAggregateInputType | true
    }

  export interface CuadrillaDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Cuadrilla'], meta: { name: 'Cuadrilla' } }
    /**
     * Find zero or one Cuadrilla that matches the filter.
     * @param {CuadrillaFindUniqueArgs} args - Arguments to find a Cuadrilla
     * @example
     * // Get one Cuadrilla
     * const cuadrilla = await prisma.cuadrilla.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CuadrillaFindUniqueArgs>(args: SelectSubset<T, CuadrillaFindUniqueArgs<ExtArgs>>): Prisma__CuadrillaClient<$Result.GetResult<Prisma.$CuadrillaPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Cuadrilla that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CuadrillaFindUniqueOrThrowArgs} args - Arguments to find a Cuadrilla
     * @example
     * // Get one Cuadrilla
     * const cuadrilla = await prisma.cuadrilla.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CuadrillaFindUniqueOrThrowArgs>(args: SelectSubset<T, CuadrillaFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CuadrillaClient<$Result.GetResult<Prisma.$CuadrillaPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Cuadrilla that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CuadrillaFindFirstArgs} args - Arguments to find a Cuadrilla
     * @example
     * // Get one Cuadrilla
     * const cuadrilla = await prisma.cuadrilla.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CuadrillaFindFirstArgs>(args?: SelectSubset<T, CuadrillaFindFirstArgs<ExtArgs>>): Prisma__CuadrillaClient<$Result.GetResult<Prisma.$CuadrillaPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Cuadrilla that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CuadrillaFindFirstOrThrowArgs} args - Arguments to find a Cuadrilla
     * @example
     * // Get one Cuadrilla
     * const cuadrilla = await prisma.cuadrilla.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CuadrillaFindFirstOrThrowArgs>(args?: SelectSubset<T, CuadrillaFindFirstOrThrowArgs<ExtArgs>>): Prisma__CuadrillaClient<$Result.GetResult<Prisma.$CuadrillaPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Cuadrillas that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CuadrillaFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Cuadrillas
     * const cuadrillas = await prisma.cuadrilla.findMany()
     * 
     * // Get first 10 Cuadrillas
     * const cuadrillas = await prisma.cuadrilla.findMany({ take: 10 })
     * 
     * // Only select the `id_cuadrilla`
     * const cuadrillaWithId_cuadrillaOnly = await prisma.cuadrilla.findMany({ select: { id_cuadrilla: true } })
     * 
     */
    findMany<T extends CuadrillaFindManyArgs>(args?: SelectSubset<T, CuadrillaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CuadrillaPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Cuadrilla.
     * @param {CuadrillaCreateArgs} args - Arguments to create a Cuadrilla.
     * @example
     * // Create one Cuadrilla
     * const Cuadrilla = await prisma.cuadrilla.create({
     *   data: {
     *     // ... data to create a Cuadrilla
     *   }
     * })
     * 
     */
    create<T extends CuadrillaCreateArgs>(args: SelectSubset<T, CuadrillaCreateArgs<ExtArgs>>): Prisma__CuadrillaClient<$Result.GetResult<Prisma.$CuadrillaPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Cuadrillas.
     * @param {CuadrillaCreateManyArgs} args - Arguments to create many Cuadrillas.
     * @example
     * // Create many Cuadrillas
     * const cuadrilla = await prisma.cuadrilla.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CuadrillaCreateManyArgs>(args?: SelectSubset<T, CuadrillaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Cuadrillas and returns the data saved in the database.
     * @param {CuadrillaCreateManyAndReturnArgs} args - Arguments to create many Cuadrillas.
     * @example
     * // Create many Cuadrillas
     * const cuadrilla = await prisma.cuadrilla.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Cuadrillas and only return the `id_cuadrilla`
     * const cuadrillaWithId_cuadrillaOnly = await prisma.cuadrilla.createManyAndReturn({ 
     *   select: { id_cuadrilla: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CuadrillaCreateManyAndReturnArgs>(args?: SelectSubset<T, CuadrillaCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CuadrillaPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Cuadrilla.
     * @param {CuadrillaDeleteArgs} args - Arguments to delete one Cuadrilla.
     * @example
     * // Delete one Cuadrilla
     * const Cuadrilla = await prisma.cuadrilla.delete({
     *   where: {
     *     // ... filter to delete one Cuadrilla
     *   }
     * })
     * 
     */
    delete<T extends CuadrillaDeleteArgs>(args: SelectSubset<T, CuadrillaDeleteArgs<ExtArgs>>): Prisma__CuadrillaClient<$Result.GetResult<Prisma.$CuadrillaPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Cuadrilla.
     * @param {CuadrillaUpdateArgs} args - Arguments to update one Cuadrilla.
     * @example
     * // Update one Cuadrilla
     * const cuadrilla = await prisma.cuadrilla.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CuadrillaUpdateArgs>(args: SelectSubset<T, CuadrillaUpdateArgs<ExtArgs>>): Prisma__CuadrillaClient<$Result.GetResult<Prisma.$CuadrillaPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Cuadrillas.
     * @param {CuadrillaDeleteManyArgs} args - Arguments to filter Cuadrillas to delete.
     * @example
     * // Delete a few Cuadrillas
     * const { count } = await prisma.cuadrilla.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CuadrillaDeleteManyArgs>(args?: SelectSubset<T, CuadrillaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Cuadrillas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CuadrillaUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Cuadrillas
     * const cuadrilla = await prisma.cuadrilla.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CuadrillaUpdateManyArgs>(args: SelectSubset<T, CuadrillaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Cuadrilla.
     * @param {CuadrillaUpsertArgs} args - Arguments to update or create a Cuadrilla.
     * @example
     * // Update or create a Cuadrilla
     * const cuadrilla = await prisma.cuadrilla.upsert({
     *   create: {
     *     // ... data to create a Cuadrilla
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Cuadrilla we want to update
     *   }
     * })
     */
    upsert<T extends CuadrillaUpsertArgs>(args: SelectSubset<T, CuadrillaUpsertArgs<ExtArgs>>): Prisma__CuadrillaClient<$Result.GetResult<Prisma.$CuadrillaPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Cuadrillas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CuadrillaCountArgs} args - Arguments to filter Cuadrillas to count.
     * @example
     * // Count the number of Cuadrillas
     * const count = await prisma.cuadrilla.count({
     *   where: {
     *     // ... the filter for the Cuadrillas we want to count
     *   }
     * })
    **/
    count<T extends CuadrillaCountArgs>(
      args?: Subset<T, CuadrillaCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CuadrillaCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Cuadrilla.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CuadrillaAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends CuadrillaAggregateArgs>(args: Subset<T, CuadrillaAggregateArgs>): Prisma.PrismaPromise<GetCuadrillaAggregateType<T>>

    /**
     * Group by Cuadrilla.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CuadrillaGroupByArgs} args - Group by arguments.
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
      T extends CuadrillaGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CuadrillaGroupByArgs['orderBy'] }
        : { orderBy?: CuadrillaGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, CuadrillaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCuadrillaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Cuadrilla model
   */
  readonly fields: CuadrillaFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Cuadrilla.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CuadrillaClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    miembros<T extends Cuadrilla$miembrosArgs<ExtArgs> = {}>(args?: Subset<T, Cuadrilla$miembrosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmpleadoPayload<ExtArgs>, T, "findMany"> | Null>
    asignaciones<T extends Cuadrilla$asignacionesArgs<ExtArgs> = {}>(args?: Subset<T, Cuadrilla$asignacionesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AsignacionFrentePayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the Cuadrilla model
   */ 
  interface CuadrillaFieldRefs {
    readonly id_cuadrilla: FieldRef<"Cuadrilla", 'String'>
    readonly tenant_id: FieldRef<"Cuadrilla", 'String'>
    readonly proyecto_id: FieldRef<"Cuadrilla", 'String'>
    readonly nombre: FieldRef<"Cuadrilla", 'String'>
    readonly codigo: FieldRef<"Cuadrilla", 'String'>
    readonly especialidad: FieldRef<"Cuadrilla", 'String'>
    readonly capataz_id: FieldRef<"Cuadrilla", 'String'>
    readonly capataz_nombre: FieldRef<"Cuadrilla", 'String'>
    readonly estado: FieldRef<"Cuadrilla", 'String'>
    readonly created_at: FieldRef<"Cuadrilla", 'DateTime'>
    readonly updated_at: FieldRef<"Cuadrilla", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Cuadrilla findUnique
   */
  export type CuadrillaFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cuadrilla
     */
    select?: CuadrillaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CuadrillaInclude<ExtArgs> | null
    /**
     * Filter, which Cuadrilla to fetch.
     */
    where: CuadrillaWhereUniqueInput
  }

  /**
   * Cuadrilla findUniqueOrThrow
   */
  export type CuadrillaFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cuadrilla
     */
    select?: CuadrillaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CuadrillaInclude<ExtArgs> | null
    /**
     * Filter, which Cuadrilla to fetch.
     */
    where: CuadrillaWhereUniqueInput
  }

  /**
   * Cuadrilla findFirst
   */
  export type CuadrillaFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cuadrilla
     */
    select?: CuadrillaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CuadrillaInclude<ExtArgs> | null
    /**
     * Filter, which Cuadrilla to fetch.
     */
    where?: CuadrillaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Cuadrillas to fetch.
     */
    orderBy?: CuadrillaOrderByWithRelationInput | CuadrillaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Cuadrillas.
     */
    cursor?: CuadrillaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Cuadrillas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Cuadrillas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Cuadrillas.
     */
    distinct?: CuadrillaScalarFieldEnum | CuadrillaScalarFieldEnum[]
  }

  /**
   * Cuadrilla findFirstOrThrow
   */
  export type CuadrillaFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cuadrilla
     */
    select?: CuadrillaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CuadrillaInclude<ExtArgs> | null
    /**
     * Filter, which Cuadrilla to fetch.
     */
    where?: CuadrillaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Cuadrillas to fetch.
     */
    orderBy?: CuadrillaOrderByWithRelationInput | CuadrillaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Cuadrillas.
     */
    cursor?: CuadrillaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Cuadrillas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Cuadrillas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Cuadrillas.
     */
    distinct?: CuadrillaScalarFieldEnum | CuadrillaScalarFieldEnum[]
  }

  /**
   * Cuadrilla findMany
   */
  export type CuadrillaFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cuadrilla
     */
    select?: CuadrillaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CuadrillaInclude<ExtArgs> | null
    /**
     * Filter, which Cuadrillas to fetch.
     */
    where?: CuadrillaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Cuadrillas to fetch.
     */
    orderBy?: CuadrillaOrderByWithRelationInput | CuadrillaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Cuadrillas.
     */
    cursor?: CuadrillaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Cuadrillas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Cuadrillas.
     */
    skip?: number
    distinct?: CuadrillaScalarFieldEnum | CuadrillaScalarFieldEnum[]
  }

  /**
   * Cuadrilla create
   */
  export type CuadrillaCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cuadrilla
     */
    select?: CuadrillaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CuadrillaInclude<ExtArgs> | null
    /**
     * The data needed to create a Cuadrilla.
     */
    data: XOR<CuadrillaCreateInput, CuadrillaUncheckedCreateInput>
  }

  /**
   * Cuadrilla createMany
   */
  export type CuadrillaCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Cuadrillas.
     */
    data: CuadrillaCreateManyInput | CuadrillaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Cuadrilla createManyAndReturn
   */
  export type CuadrillaCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cuadrilla
     */
    select?: CuadrillaSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Cuadrillas.
     */
    data: CuadrillaCreateManyInput | CuadrillaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Cuadrilla update
   */
  export type CuadrillaUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cuadrilla
     */
    select?: CuadrillaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CuadrillaInclude<ExtArgs> | null
    /**
     * The data needed to update a Cuadrilla.
     */
    data: XOR<CuadrillaUpdateInput, CuadrillaUncheckedUpdateInput>
    /**
     * Choose, which Cuadrilla to update.
     */
    where: CuadrillaWhereUniqueInput
  }

  /**
   * Cuadrilla updateMany
   */
  export type CuadrillaUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Cuadrillas.
     */
    data: XOR<CuadrillaUpdateManyMutationInput, CuadrillaUncheckedUpdateManyInput>
    /**
     * Filter which Cuadrillas to update
     */
    where?: CuadrillaWhereInput
  }

  /**
   * Cuadrilla upsert
   */
  export type CuadrillaUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cuadrilla
     */
    select?: CuadrillaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CuadrillaInclude<ExtArgs> | null
    /**
     * The filter to search for the Cuadrilla to update in case it exists.
     */
    where: CuadrillaWhereUniqueInput
    /**
     * In case the Cuadrilla found by the `where` argument doesn't exist, create a new Cuadrilla with this data.
     */
    create: XOR<CuadrillaCreateInput, CuadrillaUncheckedCreateInput>
    /**
     * In case the Cuadrilla was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CuadrillaUpdateInput, CuadrillaUncheckedUpdateInput>
  }

  /**
   * Cuadrilla delete
   */
  export type CuadrillaDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cuadrilla
     */
    select?: CuadrillaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CuadrillaInclude<ExtArgs> | null
    /**
     * Filter which Cuadrilla to delete.
     */
    where: CuadrillaWhereUniqueInput
  }

  /**
   * Cuadrilla deleteMany
   */
  export type CuadrillaDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Cuadrillas to delete
     */
    where?: CuadrillaWhereInput
  }

  /**
   * Cuadrilla.miembros
   */
  export type Cuadrilla$miembrosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Empleado
     */
    select?: EmpleadoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmpleadoInclude<ExtArgs> | null
    where?: EmpleadoWhereInput
    orderBy?: EmpleadoOrderByWithRelationInput | EmpleadoOrderByWithRelationInput[]
    cursor?: EmpleadoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: EmpleadoScalarFieldEnum | EmpleadoScalarFieldEnum[]
  }

  /**
   * Cuadrilla.asignaciones
   */
  export type Cuadrilla$asignacionesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AsignacionFrente
     */
    select?: AsignacionFrenteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AsignacionFrenteInclude<ExtArgs> | null
    where?: AsignacionFrenteWhereInput
    orderBy?: AsignacionFrenteOrderByWithRelationInput | AsignacionFrenteOrderByWithRelationInput[]
    cursor?: AsignacionFrenteWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AsignacionFrenteScalarFieldEnum | AsignacionFrenteScalarFieldEnum[]
  }

  /**
   * Cuadrilla without action
   */
  export type CuadrillaDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cuadrilla
     */
    select?: CuadrillaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CuadrillaInclude<ExtArgs> | null
  }


  /**
   * Model AsignacionFrente
   */

  export type AggregateAsignacionFrente = {
    _count: AsignacionFrenteCountAggregateOutputType | null
    _avg: AsignacionFrenteAvgAggregateOutputType | null
    _sum: AsignacionFrenteSumAggregateOutputType | null
    _min: AsignacionFrenteMinAggregateOutputType | null
    _max: AsignacionFrenteMaxAggregateOutputType | null
  }

  export type AsignacionFrenteAvgAggregateOutputType = {
    horas_diarias: Decimal | null
  }

  export type AsignacionFrenteSumAggregateOutputType = {
    horas_diarias: Decimal | null
  }

  export type AsignacionFrenteMinAggregateOutputType = {
    id_asignacion: string | null
    tenant_id: string | null
    proyecto_id: string | null
    empleado_id: string | null
    cuadrilla_id: string | null
    frente_trabajo: string | null
    turno: string | null
    fecha_inicio: Date | null
    fecha_fin: Date | null
    horas_diarias: Decimal | null
    estado: string | null
    created_at: Date | null
  }

  export type AsignacionFrenteMaxAggregateOutputType = {
    id_asignacion: string | null
    tenant_id: string | null
    proyecto_id: string | null
    empleado_id: string | null
    cuadrilla_id: string | null
    frente_trabajo: string | null
    turno: string | null
    fecha_inicio: Date | null
    fecha_fin: Date | null
    horas_diarias: Decimal | null
    estado: string | null
    created_at: Date | null
  }

  export type AsignacionFrenteCountAggregateOutputType = {
    id_asignacion: number
    tenant_id: number
    proyecto_id: number
    empleado_id: number
    cuadrilla_id: number
    frente_trabajo: number
    turno: number
    fecha_inicio: number
    fecha_fin: number
    horas_diarias: number
    estado: number
    created_at: number
    _all: number
  }


  export type AsignacionFrenteAvgAggregateInputType = {
    horas_diarias?: true
  }

  export type AsignacionFrenteSumAggregateInputType = {
    horas_diarias?: true
  }

  export type AsignacionFrenteMinAggregateInputType = {
    id_asignacion?: true
    tenant_id?: true
    proyecto_id?: true
    empleado_id?: true
    cuadrilla_id?: true
    frente_trabajo?: true
    turno?: true
    fecha_inicio?: true
    fecha_fin?: true
    horas_diarias?: true
    estado?: true
    created_at?: true
  }

  export type AsignacionFrenteMaxAggregateInputType = {
    id_asignacion?: true
    tenant_id?: true
    proyecto_id?: true
    empleado_id?: true
    cuadrilla_id?: true
    frente_trabajo?: true
    turno?: true
    fecha_inicio?: true
    fecha_fin?: true
    horas_diarias?: true
    estado?: true
    created_at?: true
  }

  export type AsignacionFrenteCountAggregateInputType = {
    id_asignacion?: true
    tenant_id?: true
    proyecto_id?: true
    empleado_id?: true
    cuadrilla_id?: true
    frente_trabajo?: true
    turno?: true
    fecha_inicio?: true
    fecha_fin?: true
    horas_diarias?: true
    estado?: true
    created_at?: true
    _all?: true
  }

  export type AsignacionFrenteAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AsignacionFrente to aggregate.
     */
    where?: AsignacionFrenteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AsignacionFrentes to fetch.
     */
    orderBy?: AsignacionFrenteOrderByWithRelationInput | AsignacionFrenteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AsignacionFrenteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AsignacionFrentes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AsignacionFrentes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AsignacionFrentes
    **/
    _count?: true | AsignacionFrenteCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AsignacionFrenteAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AsignacionFrenteSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AsignacionFrenteMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AsignacionFrenteMaxAggregateInputType
  }

  export type GetAsignacionFrenteAggregateType<T extends AsignacionFrenteAggregateArgs> = {
        [P in keyof T & keyof AggregateAsignacionFrente]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAsignacionFrente[P]>
      : GetScalarType<T[P], AggregateAsignacionFrente[P]>
  }




  export type AsignacionFrenteGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AsignacionFrenteWhereInput
    orderBy?: AsignacionFrenteOrderByWithAggregationInput | AsignacionFrenteOrderByWithAggregationInput[]
    by: AsignacionFrenteScalarFieldEnum[] | AsignacionFrenteScalarFieldEnum
    having?: AsignacionFrenteScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AsignacionFrenteCountAggregateInputType | true
    _avg?: AsignacionFrenteAvgAggregateInputType
    _sum?: AsignacionFrenteSumAggregateInputType
    _min?: AsignacionFrenteMinAggregateInputType
    _max?: AsignacionFrenteMaxAggregateInputType
  }

  export type AsignacionFrenteGroupByOutputType = {
    id_asignacion: string
    tenant_id: string
    proyecto_id: string
    empleado_id: string
    cuadrilla_id: string | null
    frente_trabajo: string
    turno: string
    fecha_inicio: Date
    fecha_fin: Date | null
    horas_diarias: Decimal
    estado: string
    created_at: Date
    _count: AsignacionFrenteCountAggregateOutputType | null
    _avg: AsignacionFrenteAvgAggregateOutputType | null
    _sum: AsignacionFrenteSumAggregateOutputType | null
    _min: AsignacionFrenteMinAggregateOutputType | null
    _max: AsignacionFrenteMaxAggregateOutputType | null
  }

  type GetAsignacionFrenteGroupByPayload<T extends AsignacionFrenteGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AsignacionFrenteGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AsignacionFrenteGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AsignacionFrenteGroupByOutputType[P]>
            : GetScalarType<T[P], AsignacionFrenteGroupByOutputType[P]>
        }
      >
    >


  export type AsignacionFrenteSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_asignacion?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    empleado_id?: boolean
    cuadrilla_id?: boolean
    frente_trabajo?: boolean
    turno?: boolean
    fecha_inicio?: boolean
    fecha_fin?: boolean
    horas_diarias?: boolean
    estado?: boolean
    created_at?: boolean
    empleado?: boolean | EmpleadoDefaultArgs<ExtArgs>
    cuadrilla?: boolean | AsignacionFrente$cuadrillaArgs<ExtArgs>
  }, ExtArgs["result"]["asignacionFrente"]>

  export type AsignacionFrenteSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_asignacion?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    empleado_id?: boolean
    cuadrilla_id?: boolean
    frente_trabajo?: boolean
    turno?: boolean
    fecha_inicio?: boolean
    fecha_fin?: boolean
    horas_diarias?: boolean
    estado?: boolean
    created_at?: boolean
    empleado?: boolean | EmpleadoDefaultArgs<ExtArgs>
    cuadrilla?: boolean | AsignacionFrente$cuadrillaArgs<ExtArgs>
  }, ExtArgs["result"]["asignacionFrente"]>

  export type AsignacionFrenteSelectScalar = {
    id_asignacion?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    empleado_id?: boolean
    cuadrilla_id?: boolean
    frente_trabajo?: boolean
    turno?: boolean
    fecha_inicio?: boolean
    fecha_fin?: boolean
    horas_diarias?: boolean
    estado?: boolean
    created_at?: boolean
  }

  export type AsignacionFrenteInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    empleado?: boolean | EmpleadoDefaultArgs<ExtArgs>
    cuadrilla?: boolean | AsignacionFrente$cuadrillaArgs<ExtArgs>
  }
  export type AsignacionFrenteIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    empleado?: boolean | EmpleadoDefaultArgs<ExtArgs>
    cuadrilla?: boolean | AsignacionFrente$cuadrillaArgs<ExtArgs>
  }

  export type $AsignacionFrentePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AsignacionFrente"
    objects: {
      empleado: Prisma.$EmpleadoPayload<ExtArgs>
      cuadrilla: Prisma.$CuadrillaPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id_asignacion: string
      tenant_id: string
      proyecto_id: string
      empleado_id: string
      cuadrilla_id: string | null
      frente_trabajo: string
      turno: string
      fecha_inicio: Date
      fecha_fin: Date | null
      horas_diarias: Prisma.Decimal
      estado: string
      created_at: Date
    }, ExtArgs["result"]["asignacionFrente"]>
    composites: {}
  }

  type AsignacionFrenteGetPayload<S extends boolean | null | undefined | AsignacionFrenteDefaultArgs> = $Result.GetResult<Prisma.$AsignacionFrentePayload, S>

  type AsignacionFrenteCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<AsignacionFrenteFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: AsignacionFrenteCountAggregateInputType | true
    }

  export interface AsignacionFrenteDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AsignacionFrente'], meta: { name: 'AsignacionFrente' } }
    /**
     * Find zero or one AsignacionFrente that matches the filter.
     * @param {AsignacionFrenteFindUniqueArgs} args - Arguments to find a AsignacionFrente
     * @example
     * // Get one AsignacionFrente
     * const asignacionFrente = await prisma.asignacionFrente.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AsignacionFrenteFindUniqueArgs>(args: SelectSubset<T, AsignacionFrenteFindUniqueArgs<ExtArgs>>): Prisma__AsignacionFrenteClient<$Result.GetResult<Prisma.$AsignacionFrentePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one AsignacionFrente that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {AsignacionFrenteFindUniqueOrThrowArgs} args - Arguments to find a AsignacionFrente
     * @example
     * // Get one AsignacionFrente
     * const asignacionFrente = await prisma.asignacionFrente.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AsignacionFrenteFindUniqueOrThrowArgs>(args: SelectSubset<T, AsignacionFrenteFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AsignacionFrenteClient<$Result.GetResult<Prisma.$AsignacionFrentePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first AsignacionFrente that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AsignacionFrenteFindFirstArgs} args - Arguments to find a AsignacionFrente
     * @example
     * // Get one AsignacionFrente
     * const asignacionFrente = await prisma.asignacionFrente.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AsignacionFrenteFindFirstArgs>(args?: SelectSubset<T, AsignacionFrenteFindFirstArgs<ExtArgs>>): Prisma__AsignacionFrenteClient<$Result.GetResult<Prisma.$AsignacionFrentePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first AsignacionFrente that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AsignacionFrenteFindFirstOrThrowArgs} args - Arguments to find a AsignacionFrente
     * @example
     * // Get one AsignacionFrente
     * const asignacionFrente = await prisma.asignacionFrente.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AsignacionFrenteFindFirstOrThrowArgs>(args?: SelectSubset<T, AsignacionFrenteFindFirstOrThrowArgs<ExtArgs>>): Prisma__AsignacionFrenteClient<$Result.GetResult<Prisma.$AsignacionFrentePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more AsignacionFrentes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AsignacionFrenteFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AsignacionFrentes
     * const asignacionFrentes = await prisma.asignacionFrente.findMany()
     * 
     * // Get first 10 AsignacionFrentes
     * const asignacionFrentes = await prisma.asignacionFrente.findMany({ take: 10 })
     * 
     * // Only select the `id_asignacion`
     * const asignacionFrenteWithId_asignacionOnly = await prisma.asignacionFrente.findMany({ select: { id_asignacion: true } })
     * 
     */
    findMany<T extends AsignacionFrenteFindManyArgs>(args?: SelectSubset<T, AsignacionFrenteFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AsignacionFrentePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a AsignacionFrente.
     * @param {AsignacionFrenteCreateArgs} args - Arguments to create a AsignacionFrente.
     * @example
     * // Create one AsignacionFrente
     * const AsignacionFrente = await prisma.asignacionFrente.create({
     *   data: {
     *     // ... data to create a AsignacionFrente
     *   }
     * })
     * 
     */
    create<T extends AsignacionFrenteCreateArgs>(args: SelectSubset<T, AsignacionFrenteCreateArgs<ExtArgs>>): Prisma__AsignacionFrenteClient<$Result.GetResult<Prisma.$AsignacionFrentePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many AsignacionFrentes.
     * @param {AsignacionFrenteCreateManyArgs} args - Arguments to create many AsignacionFrentes.
     * @example
     * // Create many AsignacionFrentes
     * const asignacionFrente = await prisma.asignacionFrente.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AsignacionFrenteCreateManyArgs>(args?: SelectSubset<T, AsignacionFrenteCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AsignacionFrentes and returns the data saved in the database.
     * @param {AsignacionFrenteCreateManyAndReturnArgs} args - Arguments to create many AsignacionFrentes.
     * @example
     * // Create many AsignacionFrentes
     * const asignacionFrente = await prisma.asignacionFrente.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AsignacionFrentes and only return the `id_asignacion`
     * const asignacionFrenteWithId_asignacionOnly = await prisma.asignacionFrente.createManyAndReturn({ 
     *   select: { id_asignacion: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AsignacionFrenteCreateManyAndReturnArgs>(args?: SelectSubset<T, AsignacionFrenteCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AsignacionFrentePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a AsignacionFrente.
     * @param {AsignacionFrenteDeleteArgs} args - Arguments to delete one AsignacionFrente.
     * @example
     * // Delete one AsignacionFrente
     * const AsignacionFrente = await prisma.asignacionFrente.delete({
     *   where: {
     *     // ... filter to delete one AsignacionFrente
     *   }
     * })
     * 
     */
    delete<T extends AsignacionFrenteDeleteArgs>(args: SelectSubset<T, AsignacionFrenteDeleteArgs<ExtArgs>>): Prisma__AsignacionFrenteClient<$Result.GetResult<Prisma.$AsignacionFrentePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one AsignacionFrente.
     * @param {AsignacionFrenteUpdateArgs} args - Arguments to update one AsignacionFrente.
     * @example
     * // Update one AsignacionFrente
     * const asignacionFrente = await prisma.asignacionFrente.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AsignacionFrenteUpdateArgs>(args: SelectSubset<T, AsignacionFrenteUpdateArgs<ExtArgs>>): Prisma__AsignacionFrenteClient<$Result.GetResult<Prisma.$AsignacionFrentePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more AsignacionFrentes.
     * @param {AsignacionFrenteDeleteManyArgs} args - Arguments to filter AsignacionFrentes to delete.
     * @example
     * // Delete a few AsignacionFrentes
     * const { count } = await prisma.asignacionFrente.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AsignacionFrenteDeleteManyArgs>(args?: SelectSubset<T, AsignacionFrenteDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AsignacionFrentes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AsignacionFrenteUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AsignacionFrentes
     * const asignacionFrente = await prisma.asignacionFrente.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AsignacionFrenteUpdateManyArgs>(args: SelectSubset<T, AsignacionFrenteUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one AsignacionFrente.
     * @param {AsignacionFrenteUpsertArgs} args - Arguments to update or create a AsignacionFrente.
     * @example
     * // Update or create a AsignacionFrente
     * const asignacionFrente = await prisma.asignacionFrente.upsert({
     *   create: {
     *     // ... data to create a AsignacionFrente
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AsignacionFrente we want to update
     *   }
     * })
     */
    upsert<T extends AsignacionFrenteUpsertArgs>(args: SelectSubset<T, AsignacionFrenteUpsertArgs<ExtArgs>>): Prisma__AsignacionFrenteClient<$Result.GetResult<Prisma.$AsignacionFrentePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of AsignacionFrentes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AsignacionFrenteCountArgs} args - Arguments to filter AsignacionFrentes to count.
     * @example
     * // Count the number of AsignacionFrentes
     * const count = await prisma.asignacionFrente.count({
     *   where: {
     *     // ... the filter for the AsignacionFrentes we want to count
     *   }
     * })
    **/
    count<T extends AsignacionFrenteCountArgs>(
      args?: Subset<T, AsignacionFrenteCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AsignacionFrenteCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AsignacionFrente.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AsignacionFrenteAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends AsignacionFrenteAggregateArgs>(args: Subset<T, AsignacionFrenteAggregateArgs>): Prisma.PrismaPromise<GetAsignacionFrenteAggregateType<T>>

    /**
     * Group by AsignacionFrente.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AsignacionFrenteGroupByArgs} args - Group by arguments.
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
      T extends AsignacionFrenteGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AsignacionFrenteGroupByArgs['orderBy'] }
        : { orderBy?: AsignacionFrenteGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, AsignacionFrenteGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAsignacionFrenteGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AsignacionFrente model
   */
  readonly fields: AsignacionFrenteFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AsignacionFrente.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AsignacionFrenteClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    empleado<T extends EmpleadoDefaultArgs<ExtArgs> = {}>(args?: Subset<T, EmpleadoDefaultArgs<ExtArgs>>): Prisma__EmpleadoClient<$Result.GetResult<Prisma.$EmpleadoPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    cuadrilla<T extends AsignacionFrente$cuadrillaArgs<ExtArgs> = {}>(args?: Subset<T, AsignacionFrente$cuadrillaArgs<ExtArgs>>): Prisma__CuadrillaClient<$Result.GetResult<Prisma.$CuadrillaPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
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
   * Fields of the AsignacionFrente model
   */ 
  interface AsignacionFrenteFieldRefs {
    readonly id_asignacion: FieldRef<"AsignacionFrente", 'String'>
    readonly tenant_id: FieldRef<"AsignacionFrente", 'String'>
    readonly proyecto_id: FieldRef<"AsignacionFrente", 'String'>
    readonly empleado_id: FieldRef<"AsignacionFrente", 'String'>
    readonly cuadrilla_id: FieldRef<"AsignacionFrente", 'String'>
    readonly frente_trabajo: FieldRef<"AsignacionFrente", 'String'>
    readonly turno: FieldRef<"AsignacionFrente", 'String'>
    readonly fecha_inicio: FieldRef<"AsignacionFrente", 'DateTime'>
    readonly fecha_fin: FieldRef<"AsignacionFrente", 'DateTime'>
    readonly horas_diarias: FieldRef<"AsignacionFrente", 'Decimal'>
    readonly estado: FieldRef<"AsignacionFrente", 'String'>
    readonly created_at: FieldRef<"AsignacionFrente", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AsignacionFrente findUnique
   */
  export type AsignacionFrenteFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AsignacionFrente
     */
    select?: AsignacionFrenteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AsignacionFrenteInclude<ExtArgs> | null
    /**
     * Filter, which AsignacionFrente to fetch.
     */
    where: AsignacionFrenteWhereUniqueInput
  }

  /**
   * AsignacionFrente findUniqueOrThrow
   */
  export type AsignacionFrenteFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AsignacionFrente
     */
    select?: AsignacionFrenteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AsignacionFrenteInclude<ExtArgs> | null
    /**
     * Filter, which AsignacionFrente to fetch.
     */
    where: AsignacionFrenteWhereUniqueInput
  }

  /**
   * AsignacionFrente findFirst
   */
  export type AsignacionFrenteFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AsignacionFrente
     */
    select?: AsignacionFrenteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AsignacionFrenteInclude<ExtArgs> | null
    /**
     * Filter, which AsignacionFrente to fetch.
     */
    where?: AsignacionFrenteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AsignacionFrentes to fetch.
     */
    orderBy?: AsignacionFrenteOrderByWithRelationInput | AsignacionFrenteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AsignacionFrentes.
     */
    cursor?: AsignacionFrenteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AsignacionFrentes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AsignacionFrentes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AsignacionFrentes.
     */
    distinct?: AsignacionFrenteScalarFieldEnum | AsignacionFrenteScalarFieldEnum[]
  }

  /**
   * AsignacionFrente findFirstOrThrow
   */
  export type AsignacionFrenteFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AsignacionFrente
     */
    select?: AsignacionFrenteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AsignacionFrenteInclude<ExtArgs> | null
    /**
     * Filter, which AsignacionFrente to fetch.
     */
    where?: AsignacionFrenteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AsignacionFrentes to fetch.
     */
    orderBy?: AsignacionFrenteOrderByWithRelationInput | AsignacionFrenteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AsignacionFrentes.
     */
    cursor?: AsignacionFrenteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AsignacionFrentes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AsignacionFrentes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AsignacionFrentes.
     */
    distinct?: AsignacionFrenteScalarFieldEnum | AsignacionFrenteScalarFieldEnum[]
  }

  /**
   * AsignacionFrente findMany
   */
  export type AsignacionFrenteFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AsignacionFrente
     */
    select?: AsignacionFrenteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AsignacionFrenteInclude<ExtArgs> | null
    /**
     * Filter, which AsignacionFrentes to fetch.
     */
    where?: AsignacionFrenteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AsignacionFrentes to fetch.
     */
    orderBy?: AsignacionFrenteOrderByWithRelationInput | AsignacionFrenteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AsignacionFrentes.
     */
    cursor?: AsignacionFrenteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AsignacionFrentes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AsignacionFrentes.
     */
    skip?: number
    distinct?: AsignacionFrenteScalarFieldEnum | AsignacionFrenteScalarFieldEnum[]
  }

  /**
   * AsignacionFrente create
   */
  export type AsignacionFrenteCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AsignacionFrente
     */
    select?: AsignacionFrenteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AsignacionFrenteInclude<ExtArgs> | null
    /**
     * The data needed to create a AsignacionFrente.
     */
    data: XOR<AsignacionFrenteCreateInput, AsignacionFrenteUncheckedCreateInput>
  }

  /**
   * AsignacionFrente createMany
   */
  export type AsignacionFrenteCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AsignacionFrentes.
     */
    data: AsignacionFrenteCreateManyInput | AsignacionFrenteCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AsignacionFrente createManyAndReturn
   */
  export type AsignacionFrenteCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AsignacionFrente
     */
    select?: AsignacionFrenteSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many AsignacionFrentes.
     */
    data: AsignacionFrenteCreateManyInput | AsignacionFrenteCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AsignacionFrenteIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * AsignacionFrente update
   */
  export type AsignacionFrenteUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AsignacionFrente
     */
    select?: AsignacionFrenteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AsignacionFrenteInclude<ExtArgs> | null
    /**
     * The data needed to update a AsignacionFrente.
     */
    data: XOR<AsignacionFrenteUpdateInput, AsignacionFrenteUncheckedUpdateInput>
    /**
     * Choose, which AsignacionFrente to update.
     */
    where: AsignacionFrenteWhereUniqueInput
  }

  /**
   * AsignacionFrente updateMany
   */
  export type AsignacionFrenteUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AsignacionFrentes.
     */
    data: XOR<AsignacionFrenteUpdateManyMutationInput, AsignacionFrenteUncheckedUpdateManyInput>
    /**
     * Filter which AsignacionFrentes to update
     */
    where?: AsignacionFrenteWhereInput
  }

  /**
   * AsignacionFrente upsert
   */
  export type AsignacionFrenteUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AsignacionFrente
     */
    select?: AsignacionFrenteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AsignacionFrenteInclude<ExtArgs> | null
    /**
     * The filter to search for the AsignacionFrente to update in case it exists.
     */
    where: AsignacionFrenteWhereUniqueInput
    /**
     * In case the AsignacionFrente found by the `where` argument doesn't exist, create a new AsignacionFrente with this data.
     */
    create: XOR<AsignacionFrenteCreateInput, AsignacionFrenteUncheckedCreateInput>
    /**
     * In case the AsignacionFrente was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AsignacionFrenteUpdateInput, AsignacionFrenteUncheckedUpdateInput>
  }

  /**
   * AsignacionFrente delete
   */
  export type AsignacionFrenteDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AsignacionFrente
     */
    select?: AsignacionFrenteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AsignacionFrenteInclude<ExtArgs> | null
    /**
     * Filter which AsignacionFrente to delete.
     */
    where: AsignacionFrenteWhereUniqueInput
  }

  /**
   * AsignacionFrente deleteMany
   */
  export type AsignacionFrenteDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AsignacionFrentes to delete
     */
    where?: AsignacionFrenteWhereInput
  }

  /**
   * AsignacionFrente.cuadrilla
   */
  export type AsignacionFrente$cuadrillaArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cuadrilla
     */
    select?: CuadrillaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CuadrillaInclude<ExtArgs> | null
    where?: CuadrillaWhereInput
  }

  /**
   * AsignacionFrente without action
   */
  export type AsignacionFrenteDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AsignacionFrente
     */
    select?: AsignacionFrenteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AsignacionFrenteInclude<ExtArgs> | null
  }


  /**
   * Model PreNomina
   */

  export type AggregatePreNomina = {
    _count: PreNominaCountAggregateOutputType | null
    _avg: PreNominaAvgAggregateOutputType | null
    _sum: PreNominaSumAggregateOutputType | null
    _min: PreNominaMinAggregateOutputType | null
    _max: PreNominaMaxAggregateOutputType | null
  }

  export type PreNominaAvgAggregateOutputType = {
    total_percepciones: Decimal | null
    total_deducciones: Decimal | null
    total_neto: Decimal | null
    total_empleados: number | null
  }

  export type PreNominaSumAggregateOutputType = {
    total_percepciones: Decimal | null
    total_deducciones: Decimal | null
    total_neto: Decimal | null
    total_empleados: number | null
  }

  export type PreNominaMinAggregateOutputType = {
    id_prenomina: string | null
    tenant_id: string | null
    proyecto_id: string | null
    codigo: string | null
    periodo_tipo: string | null
    periodo_inicio: Date | null
    periodo_fin: Date | null
    total_percepciones: Decimal | null
    total_deducciones: Decimal | null
    total_neto: Decimal | null
    total_empleados: number | null
    estado: string | null
    elaborado_por: string | null
    autorizado_por: string | null
    fecha_autorizacion: Date | null
    notas: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type PreNominaMaxAggregateOutputType = {
    id_prenomina: string | null
    tenant_id: string | null
    proyecto_id: string | null
    codigo: string | null
    periodo_tipo: string | null
    periodo_inicio: Date | null
    periodo_fin: Date | null
    total_percepciones: Decimal | null
    total_deducciones: Decimal | null
    total_neto: Decimal | null
    total_empleados: number | null
    estado: string | null
    elaborado_por: string | null
    autorizado_por: string | null
    fecha_autorizacion: Date | null
    notas: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type PreNominaCountAggregateOutputType = {
    id_prenomina: number
    tenant_id: number
    proyecto_id: number
    codigo: number
    periodo_tipo: number
    periodo_inicio: number
    periodo_fin: number
    total_percepciones: number
    total_deducciones: number
    total_neto: number
    total_empleados: number
    estado: number
    elaborado_por: number
    autorizado_por: number
    fecha_autorizacion: number
    notas: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type PreNominaAvgAggregateInputType = {
    total_percepciones?: true
    total_deducciones?: true
    total_neto?: true
    total_empleados?: true
  }

  export type PreNominaSumAggregateInputType = {
    total_percepciones?: true
    total_deducciones?: true
    total_neto?: true
    total_empleados?: true
  }

  export type PreNominaMinAggregateInputType = {
    id_prenomina?: true
    tenant_id?: true
    proyecto_id?: true
    codigo?: true
    periodo_tipo?: true
    periodo_inicio?: true
    periodo_fin?: true
    total_percepciones?: true
    total_deducciones?: true
    total_neto?: true
    total_empleados?: true
    estado?: true
    elaborado_por?: true
    autorizado_por?: true
    fecha_autorizacion?: true
    notas?: true
    created_at?: true
    updated_at?: true
  }

  export type PreNominaMaxAggregateInputType = {
    id_prenomina?: true
    tenant_id?: true
    proyecto_id?: true
    codigo?: true
    periodo_tipo?: true
    periodo_inicio?: true
    periodo_fin?: true
    total_percepciones?: true
    total_deducciones?: true
    total_neto?: true
    total_empleados?: true
    estado?: true
    elaborado_por?: true
    autorizado_por?: true
    fecha_autorizacion?: true
    notas?: true
    created_at?: true
    updated_at?: true
  }

  export type PreNominaCountAggregateInputType = {
    id_prenomina?: true
    tenant_id?: true
    proyecto_id?: true
    codigo?: true
    periodo_tipo?: true
    periodo_inicio?: true
    periodo_fin?: true
    total_percepciones?: true
    total_deducciones?: true
    total_neto?: true
    total_empleados?: true
    estado?: true
    elaborado_por?: true
    autorizado_por?: true
    fecha_autorizacion?: true
    notas?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type PreNominaAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PreNomina to aggregate.
     */
    where?: PreNominaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PreNominas to fetch.
     */
    orderBy?: PreNominaOrderByWithRelationInput | PreNominaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PreNominaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PreNominas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PreNominas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PreNominas
    **/
    _count?: true | PreNominaCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PreNominaAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PreNominaSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PreNominaMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PreNominaMaxAggregateInputType
  }

  export type GetPreNominaAggregateType<T extends PreNominaAggregateArgs> = {
        [P in keyof T & keyof AggregatePreNomina]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePreNomina[P]>
      : GetScalarType<T[P], AggregatePreNomina[P]>
  }




  export type PreNominaGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PreNominaWhereInput
    orderBy?: PreNominaOrderByWithAggregationInput | PreNominaOrderByWithAggregationInput[]
    by: PreNominaScalarFieldEnum[] | PreNominaScalarFieldEnum
    having?: PreNominaScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PreNominaCountAggregateInputType | true
    _avg?: PreNominaAvgAggregateInputType
    _sum?: PreNominaSumAggregateInputType
    _min?: PreNominaMinAggregateInputType
    _max?: PreNominaMaxAggregateInputType
  }

  export type PreNominaGroupByOutputType = {
    id_prenomina: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    periodo_tipo: string
    periodo_inicio: Date
    periodo_fin: Date
    total_percepciones: Decimal
    total_deducciones: Decimal
    total_neto: Decimal
    total_empleados: number
    estado: string
    elaborado_por: string
    autorizado_por: string | null
    fecha_autorizacion: Date | null
    notas: string | null
    created_at: Date
    updated_at: Date
    _count: PreNominaCountAggregateOutputType | null
    _avg: PreNominaAvgAggregateOutputType | null
    _sum: PreNominaSumAggregateOutputType | null
    _min: PreNominaMinAggregateOutputType | null
    _max: PreNominaMaxAggregateOutputType | null
  }

  type GetPreNominaGroupByPayload<T extends PreNominaGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PreNominaGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PreNominaGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PreNominaGroupByOutputType[P]>
            : GetScalarType<T[P], PreNominaGroupByOutputType[P]>
        }
      >
    >


  export type PreNominaSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_prenomina?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    codigo?: boolean
    periodo_tipo?: boolean
    periodo_inicio?: boolean
    periodo_fin?: boolean
    total_percepciones?: boolean
    total_deducciones?: boolean
    total_neto?: boolean
    total_empleados?: boolean
    estado?: boolean
    elaborado_por?: boolean
    autorizado_por?: boolean
    fecha_autorizacion?: boolean
    notas?: boolean
    created_at?: boolean
    updated_at?: boolean
    detalles?: boolean | PreNomina$detallesArgs<ExtArgs>
    _count?: boolean | PreNominaCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["preNomina"]>

  export type PreNominaSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_prenomina?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    codigo?: boolean
    periodo_tipo?: boolean
    periodo_inicio?: boolean
    periodo_fin?: boolean
    total_percepciones?: boolean
    total_deducciones?: boolean
    total_neto?: boolean
    total_empleados?: boolean
    estado?: boolean
    elaborado_por?: boolean
    autorizado_por?: boolean
    fecha_autorizacion?: boolean
    notas?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["preNomina"]>

  export type PreNominaSelectScalar = {
    id_prenomina?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    codigo?: boolean
    periodo_tipo?: boolean
    periodo_inicio?: boolean
    periodo_fin?: boolean
    total_percepciones?: boolean
    total_deducciones?: boolean
    total_neto?: boolean
    total_empleados?: boolean
    estado?: boolean
    elaborado_por?: boolean
    autorizado_por?: boolean
    fecha_autorizacion?: boolean
    notas?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type PreNominaInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    detalles?: boolean | PreNomina$detallesArgs<ExtArgs>
    _count?: boolean | PreNominaCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type PreNominaIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $PreNominaPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PreNomina"
    objects: {
      detalles: Prisma.$PreNominaDetallePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id_prenomina: string
      tenant_id: string
      proyecto_id: string
      codigo: string
      periodo_tipo: string
      periodo_inicio: Date
      periodo_fin: Date
      total_percepciones: Prisma.Decimal
      total_deducciones: Prisma.Decimal
      total_neto: Prisma.Decimal
      total_empleados: number
      estado: string
      elaborado_por: string
      autorizado_por: string | null
      fecha_autorizacion: Date | null
      notas: string | null
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["preNomina"]>
    composites: {}
  }

  type PreNominaGetPayload<S extends boolean | null | undefined | PreNominaDefaultArgs> = $Result.GetResult<Prisma.$PreNominaPayload, S>

  type PreNominaCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PreNominaFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PreNominaCountAggregateInputType | true
    }

  export interface PreNominaDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PreNomina'], meta: { name: 'PreNomina' } }
    /**
     * Find zero or one PreNomina that matches the filter.
     * @param {PreNominaFindUniqueArgs} args - Arguments to find a PreNomina
     * @example
     * // Get one PreNomina
     * const preNomina = await prisma.preNomina.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PreNominaFindUniqueArgs>(args: SelectSubset<T, PreNominaFindUniqueArgs<ExtArgs>>): Prisma__PreNominaClient<$Result.GetResult<Prisma.$PreNominaPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one PreNomina that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PreNominaFindUniqueOrThrowArgs} args - Arguments to find a PreNomina
     * @example
     * // Get one PreNomina
     * const preNomina = await prisma.preNomina.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PreNominaFindUniqueOrThrowArgs>(args: SelectSubset<T, PreNominaFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PreNominaClient<$Result.GetResult<Prisma.$PreNominaPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first PreNomina that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PreNominaFindFirstArgs} args - Arguments to find a PreNomina
     * @example
     * // Get one PreNomina
     * const preNomina = await prisma.preNomina.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PreNominaFindFirstArgs>(args?: SelectSubset<T, PreNominaFindFirstArgs<ExtArgs>>): Prisma__PreNominaClient<$Result.GetResult<Prisma.$PreNominaPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first PreNomina that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PreNominaFindFirstOrThrowArgs} args - Arguments to find a PreNomina
     * @example
     * // Get one PreNomina
     * const preNomina = await prisma.preNomina.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PreNominaFindFirstOrThrowArgs>(args?: SelectSubset<T, PreNominaFindFirstOrThrowArgs<ExtArgs>>): Prisma__PreNominaClient<$Result.GetResult<Prisma.$PreNominaPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more PreNominas that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PreNominaFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PreNominas
     * const preNominas = await prisma.preNomina.findMany()
     * 
     * // Get first 10 PreNominas
     * const preNominas = await prisma.preNomina.findMany({ take: 10 })
     * 
     * // Only select the `id_prenomina`
     * const preNominaWithId_prenominaOnly = await prisma.preNomina.findMany({ select: { id_prenomina: true } })
     * 
     */
    findMany<T extends PreNominaFindManyArgs>(args?: SelectSubset<T, PreNominaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PreNominaPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a PreNomina.
     * @param {PreNominaCreateArgs} args - Arguments to create a PreNomina.
     * @example
     * // Create one PreNomina
     * const PreNomina = await prisma.preNomina.create({
     *   data: {
     *     // ... data to create a PreNomina
     *   }
     * })
     * 
     */
    create<T extends PreNominaCreateArgs>(args: SelectSubset<T, PreNominaCreateArgs<ExtArgs>>): Prisma__PreNominaClient<$Result.GetResult<Prisma.$PreNominaPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many PreNominas.
     * @param {PreNominaCreateManyArgs} args - Arguments to create many PreNominas.
     * @example
     * // Create many PreNominas
     * const preNomina = await prisma.preNomina.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PreNominaCreateManyArgs>(args?: SelectSubset<T, PreNominaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PreNominas and returns the data saved in the database.
     * @param {PreNominaCreateManyAndReturnArgs} args - Arguments to create many PreNominas.
     * @example
     * // Create many PreNominas
     * const preNomina = await prisma.preNomina.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PreNominas and only return the `id_prenomina`
     * const preNominaWithId_prenominaOnly = await prisma.preNomina.createManyAndReturn({ 
     *   select: { id_prenomina: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PreNominaCreateManyAndReturnArgs>(args?: SelectSubset<T, PreNominaCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PreNominaPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a PreNomina.
     * @param {PreNominaDeleteArgs} args - Arguments to delete one PreNomina.
     * @example
     * // Delete one PreNomina
     * const PreNomina = await prisma.preNomina.delete({
     *   where: {
     *     // ... filter to delete one PreNomina
     *   }
     * })
     * 
     */
    delete<T extends PreNominaDeleteArgs>(args: SelectSubset<T, PreNominaDeleteArgs<ExtArgs>>): Prisma__PreNominaClient<$Result.GetResult<Prisma.$PreNominaPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one PreNomina.
     * @param {PreNominaUpdateArgs} args - Arguments to update one PreNomina.
     * @example
     * // Update one PreNomina
     * const preNomina = await prisma.preNomina.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PreNominaUpdateArgs>(args: SelectSubset<T, PreNominaUpdateArgs<ExtArgs>>): Prisma__PreNominaClient<$Result.GetResult<Prisma.$PreNominaPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more PreNominas.
     * @param {PreNominaDeleteManyArgs} args - Arguments to filter PreNominas to delete.
     * @example
     * // Delete a few PreNominas
     * const { count } = await prisma.preNomina.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PreNominaDeleteManyArgs>(args?: SelectSubset<T, PreNominaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PreNominas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PreNominaUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PreNominas
     * const preNomina = await prisma.preNomina.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PreNominaUpdateManyArgs>(args: SelectSubset<T, PreNominaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PreNomina.
     * @param {PreNominaUpsertArgs} args - Arguments to update or create a PreNomina.
     * @example
     * // Update or create a PreNomina
     * const preNomina = await prisma.preNomina.upsert({
     *   create: {
     *     // ... data to create a PreNomina
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PreNomina we want to update
     *   }
     * })
     */
    upsert<T extends PreNominaUpsertArgs>(args: SelectSubset<T, PreNominaUpsertArgs<ExtArgs>>): Prisma__PreNominaClient<$Result.GetResult<Prisma.$PreNominaPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of PreNominas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PreNominaCountArgs} args - Arguments to filter PreNominas to count.
     * @example
     * // Count the number of PreNominas
     * const count = await prisma.preNomina.count({
     *   where: {
     *     // ... the filter for the PreNominas we want to count
     *   }
     * })
    **/
    count<T extends PreNominaCountArgs>(
      args?: Subset<T, PreNominaCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PreNominaCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PreNomina.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PreNominaAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends PreNominaAggregateArgs>(args: Subset<T, PreNominaAggregateArgs>): Prisma.PrismaPromise<GetPreNominaAggregateType<T>>

    /**
     * Group by PreNomina.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PreNominaGroupByArgs} args - Group by arguments.
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
      T extends PreNominaGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PreNominaGroupByArgs['orderBy'] }
        : { orderBy?: PreNominaGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, PreNominaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPreNominaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PreNomina model
   */
  readonly fields: PreNominaFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PreNomina.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PreNominaClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    detalles<T extends PreNomina$detallesArgs<ExtArgs> = {}>(args?: Subset<T, PreNomina$detallesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PreNominaDetallePayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the PreNomina model
   */ 
  interface PreNominaFieldRefs {
    readonly id_prenomina: FieldRef<"PreNomina", 'String'>
    readonly tenant_id: FieldRef<"PreNomina", 'String'>
    readonly proyecto_id: FieldRef<"PreNomina", 'String'>
    readonly codigo: FieldRef<"PreNomina", 'String'>
    readonly periodo_tipo: FieldRef<"PreNomina", 'String'>
    readonly periodo_inicio: FieldRef<"PreNomina", 'DateTime'>
    readonly periodo_fin: FieldRef<"PreNomina", 'DateTime'>
    readonly total_percepciones: FieldRef<"PreNomina", 'Decimal'>
    readonly total_deducciones: FieldRef<"PreNomina", 'Decimal'>
    readonly total_neto: FieldRef<"PreNomina", 'Decimal'>
    readonly total_empleados: FieldRef<"PreNomina", 'Int'>
    readonly estado: FieldRef<"PreNomina", 'String'>
    readonly elaborado_por: FieldRef<"PreNomina", 'String'>
    readonly autorizado_por: FieldRef<"PreNomina", 'String'>
    readonly fecha_autorizacion: FieldRef<"PreNomina", 'DateTime'>
    readonly notas: FieldRef<"PreNomina", 'String'>
    readonly created_at: FieldRef<"PreNomina", 'DateTime'>
    readonly updated_at: FieldRef<"PreNomina", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PreNomina findUnique
   */
  export type PreNominaFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PreNomina
     */
    select?: PreNominaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PreNominaInclude<ExtArgs> | null
    /**
     * Filter, which PreNomina to fetch.
     */
    where: PreNominaWhereUniqueInput
  }

  /**
   * PreNomina findUniqueOrThrow
   */
  export type PreNominaFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PreNomina
     */
    select?: PreNominaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PreNominaInclude<ExtArgs> | null
    /**
     * Filter, which PreNomina to fetch.
     */
    where: PreNominaWhereUniqueInput
  }

  /**
   * PreNomina findFirst
   */
  export type PreNominaFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PreNomina
     */
    select?: PreNominaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PreNominaInclude<ExtArgs> | null
    /**
     * Filter, which PreNomina to fetch.
     */
    where?: PreNominaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PreNominas to fetch.
     */
    orderBy?: PreNominaOrderByWithRelationInput | PreNominaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PreNominas.
     */
    cursor?: PreNominaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PreNominas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PreNominas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PreNominas.
     */
    distinct?: PreNominaScalarFieldEnum | PreNominaScalarFieldEnum[]
  }

  /**
   * PreNomina findFirstOrThrow
   */
  export type PreNominaFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PreNomina
     */
    select?: PreNominaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PreNominaInclude<ExtArgs> | null
    /**
     * Filter, which PreNomina to fetch.
     */
    where?: PreNominaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PreNominas to fetch.
     */
    orderBy?: PreNominaOrderByWithRelationInput | PreNominaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PreNominas.
     */
    cursor?: PreNominaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PreNominas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PreNominas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PreNominas.
     */
    distinct?: PreNominaScalarFieldEnum | PreNominaScalarFieldEnum[]
  }

  /**
   * PreNomina findMany
   */
  export type PreNominaFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PreNomina
     */
    select?: PreNominaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PreNominaInclude<ExtArgs> | null
    /**
     * Filter, which PreNominas to fetch.
     */
    where?: PreNominaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PreNominas to fetch.
     */
    orderBy?: PreNominaOrderByWithRelationInput | PreNominaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PreNominas.
     */
    cursor?: PreNominaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PreNominas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PreNominas.
     */
    skip?: number
    distinct?: PreNominaScalarFieldEnum | PreNominaScalarFieldEnum[]
  }

  /**
   * PreNomina create
   */
  export type PreNominaCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PreNomina
     */
    select?: PreNominaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PreNominaInclude<ExtArgs> | null
    /**
     * The data needed to create a PreNomina.
     */
    data: XOR<PreNominaCreateInput, PreNominaUncheckedCreateInput>
  }

  /**
   * PreNomina createMany
   */
  export type PreNominaCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PreNominas.
     */
    data: PreNominaCreateManyInput | PreNominaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PreNomina createManyAndReturn
   */
  export type PreNominaCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PreNomina
     */
    select?: PreNominaSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many PreNominas.
     */
    data: PreNominaCreateManyInput | PreNominaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PreNomina update
   */
  export type PreNominaUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PreNomina
     */
    select?: PreNominaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PreNominaInclude<ExtArgs> | null
    /**
     * The data needed to update a PreNomina.
     */
    data: XOR<PreNominaUpdateInput, PreNominaUncheckedUpdateInput>
    /**
     * Choose, which PreNomina to update.
     */
    where: PreNominaWhereUniqueInput
  }

  /**
   * PreNomina updateMany
   */
  export type PreNominaUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PreNominas.
     */
    data: XOR<PreNominaUpdateManyMutationInput, PreNominaUncheckedUpdateManyInput>
    /**
     * Filter which PreNominas to update
     */
    where?: PreNominaWhereInput
  }

  /**
   * PreNomina upsert
   */
  export type PreNominaUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PreNomina
     */
    select?: PreNominaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PreNominaInclude<ExtArgs> | null
    /**
     * The filter to search for the PreNomina to update in case it exists.
     */
    where: PreNominaWhereUniqueInput
    /**
     * In case the PreNomina found by the `where` argument doesn't exist, create a new PreNomina with this data.
     */
    create: XOR<PreNominaCreateInput, PreNominaUncheckedCreateInput>
    /**
     * In case the PreNomina was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PreNominaUpdateInput, PreNominaUncheckedUpdateInput>
  }

  /**
   * PreNomina delete
   */
  export type PreNominaDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PreNomina
     */
    select?: PreNominaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PreNominaInclude<ExtArgs> | null
    /**
     * Filter which PreNomina to delete.
     */
    where: PreNominaWhereUniqueInput
  }

  /**
   * PreNomina deleteMany
   */
  export type PreNominaDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PreNominas to delete
     */
    where?: PreNominaWhereInput
  }

  /**
   * PreNomina.detalles
   */
  export type PreNomina$detallesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PreNominaDetalle
     */
    select?: PreNominaDetalleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PreNominaDetalleInclude<ExtArgs> | null
    where?: PreNominaDetalleWhereInput
    orderBy?: PreNominaDetalleOrderByWithRelationInput | PreNominaDetalleOrderByWithRelationInput[]
    cursor?: PreNominaDetalleWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PreNominaDetalleScalarFieldEnum | PreNominaDetalleScalarFieldEnum[]
  }

  /**
   * PreNomina without action
   */
  export type PreNominaDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PreNomina
     */
    select?: PreNominaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PreNominaInclude<ExtArgs> | null
  }


  /**
   * Model PreNominaDetalle
   */

  export type AggregatePreNominaDetalle = {
    _count: PreNominaDetalleCountAggregateOutputType | null
    _avg: PreNominaDetalleAvgAggregateOutputType | null
    _sum: PreNominaDetalleSumAggregateOutputType | null
    _min: PreNominaDetalleMinAggregateOutputType | null
    _max: PreNominaDetalleMaxAggregateOutputType | null
  }

  export type PreNominaDetalleAvgAggregateOutputType = {
    dias_trabajados: Decimal | null
    horas_extra: Decimal | null
    salario_base: Decimal | null
    monto_horas_extra: Decimal | null
    bonos: Decimal | null
    total_percepciones: Decimal | null
    deduccion_imss: Decimal | null
    deduccion_isr: Decimal | null
    otras_deducciones: Decimal | null
    total_deducciones: Decimal | null
    neto_a_pagar: Decimal | null
  }

  export type PreNominaDetalleSumAggregateOutputType = {
    dias_trabajados: Decimal | null
    horas_extra: Decimal | null
    salario_base: Decimal | null
    monto_horas_extra: Decimal | null
    bonos: Decimal | null
    total_percepciones: Decimal | null
    deduccion_imss: Decimal | null
    deduccion_isr: Decimal | null
    otras_deducciones: Decimal | null
    total_deducciones: Decimal | null
    neto_a_pagar: Decimal | null
  }

  export type PreNominaDetalleMinAggregateOutputType = {
    id_detalle: string | null
    tenant_id: string | null
    proyecto_id: string | null
    prenomina_id: string | null
    empleado_id: string | null
    dias_trabajados: Decimal | null
    horas_extra: Decimal | null
    salario_base: Decimal | null
    monto_horas_extra: Decimal | null
    bonos: Decimal | null
    total_percepciones: Decimal | null
    deduccion_imss: Decimal | null
    deduccion_isr: Decimal | null
    otras_deducciones: Decimal | null
    total_deducciones: Decimal | null
    neto_a_pagar: Decimal | null
  }

  export type PreNominaDetalleMaxAggregateOutputType = {
    id_detalle: string | null
    tenant_id: string | null
    proyecto_id: string | null
    prenomina_id: string | null
    empleado_id: string | null
    dias_trabajados: Decimal | null
    horas_extra: Decimal | null
    salario_base: Decimal | null
    monto_horas_extra: Decimal | null
    bonos: Decimal | null
    total_percepciones: Decimal | null
    deduccion_imss: Decimal | null
    deduccion_isr: Decimal | null
    otras_deducciones: Decimal | null
    total_deducciones: Decimal | null
    neto_a_pagar: Decimal | null
  }

  export type PreNominaDetalleCountAggregateOutputType = {
    id_detalle: number
    tenant_id: number
    proyecto_id: number
    prenomina_id: number
    empleado_id: number
    dias_trabajados: number
    horas_extra: number
    salario_base: number
    monto_horas_extra: number
    bonos: number
    total_percepciones: number
    deduccion_imss: number
    deduccion_isr: number
    otras_deducciones: number
    total_deducciones: number
    neto_a_pagar: number
    _all: number
  }


  export type PreNominaDetalleAvgAggregateInputType = {
    dias_trabajados?: true
    horas_extra?: true
    salario_base?: true
    monto_horas_extra?: true
    bonos?: true
    total_percepciones?: true
    deduccion_imss?: true
    deduccion_isr?: true
    otras_deducciones?: true
    total_deducciones?: true
    neto_a_pagar?: true
  }

  export type PreNominaDetalleSumAggregateInputType = {
    dias_trabajados?: true
    horas_extra?: true
    salario_base?: true
    monto_horas_extra?: true
    bonos?: true
    total_percepciones?: true
    deduccion_imss?: true
    deduccion_isr?: true
    otras_deducciones?: true
    total_deducciones?: true
    neto_a_pagar?: true
  }

  export type PreNominaDetalleMinAggregateInputType = {
    id_detalle?: true
    tenant_id?: true
    proyecto_id?: true
    prenomina_id?: true
    empleado_id?: true
    dias_trabajados?: true
    horas_extra?: true
    salario_base?: true
    monto_horas_extra?: true
    bonos?: true
    total_percepciones?: true
    deduccion_imss?: true
    deduccion_isr?: true
    otras_deducciones?: true
    total_deducciones?: true
    neto_a_pagar?: true
  }

  export type PreNominaDetalleMaxAggregateInputType = {
    id_detalle?: true
    tenant_id?: true
    proyecto_id?: true
    prenomina_id?: true
    empleado_id?: true
    dias_trabajados?: true
    horas_extra?: true
    salario_base?: true
    monto_horas_extra?: true
    bonos?: true
    total_percepciones?: true
    deduccion_imss?: true
    deduccion_isr?: true
    otras_deducciones?: true
    total_deducciones?: true
    neto_a_pagar?: true
  }

  export type PreNominaDetalleCountAggregateInputType = {
    id_detalle?: true
    tenant_id?: true
    proyecto_id?: true
    prenomina_id?: true
    empleado_id?: true
    dias_trabajados?: true
    horas_extra?: true
    salario_base?: true
    monto_horas_extra?: true
    bonos?: true
    total_percepciones?: true
    deduccion_imss?: true
    deduccion_isr?: true
    otras_deducciones?: true
    total_deducciones?: true
    neto_a_pagar?: true
    _all?: true
  }

  export type PreNominaDetalleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PreNominaDetalle to aggregate.
     */
    where?: PreNominaDetalleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PreNominaDetalles to fetch.
     */
    orderBy?: PreNominaDetalleOrderByWithRelationInput | PreNominaDetalleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PreNominaDetalleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PreNominaDetalles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PreNominaDetalles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PreNominaDetalles
    **/
    _count?: true | PreNominaDetalleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PreNominaDetalleAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PreNominaDetalleSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PreNominaDetalleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PreNominaDetalleMaxAggregateInputType
  }

  export type GetPreNominaDetalleAggregateType<T extends PreNominaDetalleAggregateArgs> = {
        [P in keyof T & keyof AggregatePreNominaDetalle]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePreNominaDetalle[P]>
      : GetScalarType<T[P], AggregatePreNominaDetalle[P]>
  }




  export type PreNominaDetalleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PreNominaDetalleWhereInput
    orderBy?: PreNominaDetalleOrderByWithAggregationInput | PreNominaDetalleOrderByWithAggregationInput[]
    by: PreNominaDetalleScalarFieldEnum[] | PreNominaDetalleScalarFieldEnum
    having?: PreNominaDetalleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PreNominaDetalleCountAggregateInputType | true
    _avg?: PreNominaDetalleAvgAggregateInputType
    _sum?: PreNominaDetalleSumAggregateInputType
    _min?: PreNominaDetalleMinAggregateInputType
    _max?: PreNominaDetalleMaxAggregateInputType
  }

  export type PreNominaDetalleGroupByOutputType = {
    id_detalle: string
    tenant_id: string
    proyecto_id: string
    prenomina_id: string
    empleado_id: string
    dias_trabajados: Decimal
    horas_extra: Decimal
    salario_base: Decimal
    monto_horas_extra: Decimal
    bonos: Decimal
    total_percepciones: Decimal
    deduccion_imss: Decimal
    deduccion_isr: Decimal
    otras_deducciones: Decimal
    total_deducciones: Decimal
    neto_a_pagar: Decimal
    _count: PreNominaDetalleCountAggregateOutputType | null
    _avg: PreNominaDetalleAvgAggregateOutputType | null
    _sum: PreNominaDetalleSumAggregateOutputType | null
    _min: PreNominaDetalleMinAggregateOutputType | null
    _max: PreNominaDetalleMaxAggregateOutputType | null
  }

  type GetPreNominaDetalleGroupByPayload<T extends PreNominaDetalleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PreNominaDetalleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PreNominaDetalleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PreNominaDetalleGroupByOutputType[P]>
            : GetScalarType<T[P], PreNominaDetalleGroupByOutputType[P]>
        }
      >
    >


  export type PreNominaDetalleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_detalle?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    prenomina_id?: boolean
    empleado_id?: boolean
    dias_trabajados?: boolean
    horas_extra?: boolean
    salario_base?: boolean
    monto_horas_extra?: boolean
    bonos?: boolean
    total_percepciones?: boolean
    deduccion_imss?: boolean
    deduccion_isr?: boolean
    otras_deducciones?: boolean
    total_deducciones?: boolean
    neto_a_pagar?: boolean
    prenomina?: boolean | PreNominaDefaultArgs<ExtArgs>
    empleado?: boolean | EmpleadoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["preNominaDetalle"]>

  export type PreNominaDetalleSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_detalle?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    prenomina_id?: boolean
    empleado_id?: boolean
    dias_trabajados?: boolean
    horas_extra?: boolean
    salario_base?: boolean
    monto_horas_extra?: boolean
    bonos?: boolean
    total_percepciones?: boolean
    deduccion_imss?: boolean
    deduccion_isr?: boolean
    otras_deducciones?: boolean
    total_deducciones?: boolean
    neto_a_pagar?: boolean
    prenomina?: boolean | PreNominaDefaultArgs<ExtArgs>
    empleado?: boolean | EmpleadoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["preNominaDetalle"]>

  export type PreNominaDetalleSelectScalar = {
    id_detalle?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    prenomina_id?: boolean
    empleado_id?: boolean
    dias_trabajados?: boolean
    horas_extra?: boolean
    salario_base?: boolean
    monto_horas_extra?: boolean
    bonos?: boolean
    total_percepciones?: boolean
    deduccion_imss?: boolean
    deduccion_isr?: boolean
    otras_deducciones?: boolean
    total_deducciones?: boolean
    neto_a_pagar?: boolean
  }

  export type PreNominaDetalleInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    prenomina?: boolean | PreNominaDefaultArgs<ExtArgs>
    empleado?: boolean | EmpleadoDefaultArgs<ExtArgs>
  }
  export type PreNominaDetalleIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    prenomina?: boolean | PreNominaDefaultArgs<ExtArgs>
    empleado?: boolean | EmpleadoDefaultArgs<ExtArgs>
  }

  export type $PreNominaDetallePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PreNominaDetalle"
    objects: {
      prenomina: Prisma.$PreNominaPayload<ExtArgs>
      empleado: Prisma.$EmpleadoPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id_detalle: string
      tenant_id: string
      proyecto_id: string
      prenomina_id: string
      empleado_id: string
      dias_trabajados: Prisma.Decimal
      horas_extra: Prisma.Decimal
      salario_base: Prisma.Decimal
      monto_horas_extra: Prisma.Decimal
      bonos: Prisma.Decimal
      total_percepciones: Prisma.Decimal
      deduccion_imss: Prisma.Decimal
      deduccion_isr: Prisma.Decimal
      otras_deducciones: Prisma.Decimal
      total_deducciones: Prisma.Decimal
      neto_a_pagar: Prisma.Decimal
    }, ExtArgs["result"]["preNominaDetalle"]>
    composites: {}
  }

  type PreNominaDetalleGetPayload<S extends boolean | null | undefined | PreNominaDetalleDefaultArgs> = $Result.GetResult<Prisma.$PreNominaDetallePayload, S>

  type PreNominaDetalleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PreNominaDetalleFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PreNominaDetalleCountAggregateInputType | true
    }

  export interface PreNominaDetalleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PreNominaDetalle'], meta: { name: 'PreNominaDetalle' } }
    /**
     * Find zero or one PreNominaDetalle that matches the filter.
     * @param {PreNominaDetalleFindUniqueArgs} args - Arguments to find a PreNominaDetalle
     * @example
     * // Get one PreNominaDetalle
     * const preNominaDetalle = await prisma.preNominaDetalle.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PreNominaDetalleFindUniqueArgs>(args: SelectSubset<T, PreNominaDetalleFindUniqueArgs<ExtArgs>>): Prisma__PreNominaDetalleClient<$Result.GetResult<Prisma.$PreNominaDetallePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one PreNominaDetalle that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PreNominaDetalleFindUniqueOrThrowArgs} args - Arguments to find a PreNominaDetalle
     * @example
     * // Get one PreNominaDetalle
     * const preNominaDetalle = await prisma.preNominaDetalle.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PreNominaDetalleFindUniqueOrThrowArgs>(args: SelectSubset<T, PreNominaDetalleFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PreNominaDetalleClient<$Result.GetResult<Prisma.$PreNominaDetallePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first PreNominaDetalle that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PreNominaDetalleFindFirstArgs} args - Arguments to find a PreNominaDetalle
     * @example
     * // Get one PreNominaDetalle
     * const preNominaDetalle = await prisma.preNominaDetalle.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PreNominaDetalleFindFirstArgs>(args?: SelectSubset<T, PreNominaDetalleFindFirstArgs<ExtArgs>>): Prisma__PreNominaDetalleClient<$Result.GetResult<Prisma.$PreNominaDetallePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first PreNominaDetalle that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PreNominaDetalleFindFirstOrThrowArgs} args - Arguments to find a PreNominaDetalle
     * @example
     * // Get one PreNominaDetalle
     * const preNominaDetalle = await prisma.preNominaDetalle.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PreNominaDetalleFindFirstOrThrowArgs>(args?: SelectSubset<T, PreNominaDetalleFindFirstOrThrowArgs<ExtArgs>>): Prisma__PreNominaDetalleClient<$Result.GetResult<Prisma.$PreNominaDetallePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more PreNominaDetalles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PreNominaDetalleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PreNominaDetalles
     * const preNominaDetalles = await prisma.preNominaDetalle.findMany()
     * 
     * // Get first 10 PreNominaDetalles
     * const preNominaDetalles = await prisma.preNominaDetalle.findMany({ take: 10 })
     * 
     * // Only select the `id_detalle`
     * const preNominaDetalleWithId_detalleOnly = await prisma.preNominaDetalle.findMany({ select: { id_detalle: true } })
     * 
     */
    findMany<T extends PreNominaDetalleFindManyArgs>(args?: SelectSubset<T, PreNominaDetalleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PreNominaDetallePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a PreNominaDetalle.
     * @param {PreNominaDetalleCreateArgs} args - Arguments to create a PreNominaDetalle.
     * @example
     * // Create one PreNominaDetalle
     * const PreNominaDetalle = await prisma.preNominaDetalle.create({
     *   data: {
     *     // ... data to create a PreNominaDetalle
     *   }
     * })
     * 
     */
    create<T extends PreNominaDetalleCreateArgs>(args: SelectSubset<T, PreNominaDetalleCreateArgs<ExtArgs>>): Prisma__PreNominaDetalleClient<$Result.GetResult<Prisma.$PreNominaDetallePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many PreNominaDetalles.
     * @param {PreNominaDetalleCreateManyArgs} args - Arguments to create many PreNominaDetalles.
     * @example
     * // Create many PreNominaDetalles
     * const preNominaDetalle = await prisma.preNominaDetalle.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PreNominaDetalleCreateManyArgs>(args?: SelectSubset<T, PreNominaDetalleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PreNominaDetalles and returns the data saved in the database.
     * @param {PreNominaDetalleCreateManyAndReturnArgs} args - Arguments to create many PreNominaDetalles.
     * @example
     * // Create many PreNominaDetalles
     * const preNominaDetalle = await prisma.preNominaDetalle.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PreNominaDetalles and only return the `id_detalle`
     * const preNominaDetalleWithId_detalleOnly = await prisma.preNominaDetalle.createManyAndReturn({ 
     *   select: { id_detalle: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PreNominaDetalleCreateManyAndReturnArgs>(args?: SelectSubset<T, PreNominaDetalleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PreNominaDetallePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a PreNominaDetalle.
     * @param {PreNominaDetalleDeleteArgs} args - Arguments to delete one PreNominaDetalle.
     * @example
     * // Delete one PreNominaDetalle
     * const PreNominaDetalle = await prisma.preNominaDetalle.delete({
     *   where: {
     *     // ... filter to delete one PreNominaDetalle
     *   }
     * })
     * 
     */
    delete<T extends PreNominaDetalleDeleteArgs>(args: SelectSubset<T, PreNominaDetalleDeleteArgs<ExtArgs>>): Prisma__PreNominaDetalleClient<$Result.GetResult<Prisma.$PreNominaDetallePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one PreNominaDetalle.
     * @param {PreNominaDetalleUpdateArgs} args - Arguments to update one PreNominaDetalle.
     * @example
     * // Update one PreNominaDetalle
     * const preNominaDetalle = await prisma.preNominaDetalle.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PreNominaDetalleUpdateArgs>(args: SelectSubset<T, PreNominaDetalleUpdateArgs<ExtArgs>>): Prisma__PreNominaDetalleClient<$Result.GetResult<Prisma.$PreNominaDetallePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more PreNominaDetalles.
     * @param {PreNominaDetalleDeleteManyArgs} args - Arguments to filter PreNominaDetalles to delete.
     * @example
     * // Delete a few PreNominaDetalles
     * const { count } = await prisma.preNominaDetalle.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PreNominaDetalleDeleteManyArgs>(args?: SelectSubset<T, PreNominaDetalleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PreNominaDetalles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PreNominaDetalleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PreNominaDetalles
     * const preNominaDetalle = await prisma.preNominaDetalle.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PreNominaDetalleUpdateManyArgs>(args: SelectSubset<T, PreNominaDetalleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PreNominaDetalle.
     * @param {PreNominaDetalleUpsertArgs} args - Arguments to update or create a PreNominaDetalle.
     * @example
     * // Update or create a PreNominaDetalle
     * const preNominaDetalle = await prisma.preNominaDetalle.upsert({
     *   create: {
     *     // ... data to create a PreNominaDetalle
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PreNominaDetalle we want to update
     *   }
     * })
     */
    upsert<T extends PreNominaDetalleUpsertArgs>(args: SelectSubset<T, PreNominaDetalleUpsertArgs<ExtArgs>>): Prisma__PreNominaDetalleClient<$Result.GetResult<Prisma.$PreNominaDetallePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of PreNominaDetalles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PreNominaDetalleCountArgs} args - Arguments to filter PreNominaDetalles to count.
     * @example
     * // Count the number of PreNominaDetalles
     * const count = await prisma.preNominaDetalle.count({
     *   where: {
     *     // ... the filter for the PreNominaDetalles we want to count
     *   }
     * })
    **/
    count<T extends PreNominaDetalleCountArgs>(
      args?: Subset<T, PreNominaDetalleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PreNominaDetalleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PreNominaDetalle.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PreNominaDetalleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends PreNominaDetalleAggregateArgs>(args: Subset<T, PreNominaDetalleAggregateArgs>): Prisma.PrismaPromise<GetPreNominaDetalleAggregateType<T>>

    /**
     * Group by PreNominaDetalle.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PreNominaDetalleGroupByArgs} args - Group by arguments.
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
      T extends PreNominaDetalleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PreNominaDetalleGroupByArgs['orderBy'] }
        : { orderBy?: PreNominaDetalleGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, PreNominaDetalleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPreNominaDetalleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PreNominaDetalle model
   */
  readonly fields: PreNominaDetalleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PreNominaDetalle.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PreNominaDetalleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    prenomina<T extends PreNominaDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PreNominaDefaultArgs<ExtArgs>>): Prisma__PreNominaClient<$Result.GetResult<Prisma.$PreNominaPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    empleado<T extends EmpleadoDefaultArgs<ExtArgs> = {}>(args?: Subset<T, EmpleadoDefaultArgs<ExtArgs>>): Prisma__EmpleadoClient<$Result.GetResult<Prisma.$EmpleadoPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
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
   * Fields of the PreNominaDetalle model
   */ 
  interface PreNominaDetalleFieldRefs {
    readonly id_detalle: FieldRef<"PreNominaDetalle", 'String'>
    readonly tenant_id: FieldRef<"PreNominaDetalle", 'String'>
    readonly proyecto_id: FieldRef<"PreNominaDetalle", 'String'>
    readonly prenomina_id: FieldRef<"PreNominaDetalle", 'String'>
    readonly empleado_id: FieldRef<"PreNominaDetalle", 'String'>
    readonly dias_trabajados: FieldRef<"PreNominaDetalle", 'Decimal'>
    readonly horas_extra: FieldRef<"PreNominaDetalle", 'Decimal'>
    readonly salario_base: FieldRef<"PreNominaDetalle", 'Decimal'>
    readonly monto_horas_extra: FieldRef<"PreNominaDetalle", 'Decimal'>
    readonly bonos: FieldRef<"PreNominaDetalle", 'Decimal'>
    readonly total_percepciones: FieldRef<"PreNominaDetalle", 'Decimal'>
    readonly deduccion_imss: FieldRef<"PreNominaDetalle", 'Decimal'>
    readonly deduccion_isr: FieldRef<"PreNominaDetalle", 'Decimal'>
    readonly otras_deducciones: FieldRef<"PreNominaDetalle", 'Decimal'>
    readonly total_deducciones: FieldRef<"PreNominaDetalle", 'Decimal'>
    readonly neto_a_pagar: FieldRef<"PreNominaDetalle", 'Decimal'>
  }
    

  // Custom InputTypes
  /**
   * PreNominaDetalle findUnique
   */
  export type PreNominaDetalleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PreNominaDetalle
     */
    select?: PreNominaDetalleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PreNominaDetalleInclude<ExtArgs> | null
    /**
     * Filter, which PreNominaDetalle to fetch.
     */
    where: PreNominaDetalleWhereUniqueInput
  }

  /**
   * PreNominaDetalle findUniqueOrThrow
   */
  export type PreNominaDetalleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PreNominaDetalle
     */
    select?: PreNominaDetalleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PreNominaDetalleInclude<ExtArgs> | null
    /**
     * Filter, which PreNominaDetalle to fetch.
     */
    where: PreNominaDetalleWhereUniqueInput
  }

  /**
   * PreNominaDetalle findFirst
   */
  export type PreNominaDetalleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PreNominaDetalle
     */
    select?: PreNominaDetalleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PreNominaDetalleInclude<ExtArgs> | null
    /**
     * Filter, which PreNominaDetalle to fetch.
     */
    where?: PreNominaDetalleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PreNominaDetalles to fetch.
     */
    orderBy?: PreNominaDetalleOrderByWithRelationInput | PreNominaDetalleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PreNominaDetalles.
     */
    cursor?: PreNominaDetalleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PreNominaDetalles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PreNominaDetalles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PreNominaDetalles.
     */
    distinct?: PreNominaDetalleScalarFieldEnum | PreNominaDetalleScalarFieldEnum[]
  }

  /**
   * PreNominaDetalle findFirstOrThrow
   */
  export type PreNominaDetalleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PreNominaDetalle
     */
    select?: PreNominaDetalleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PreNominaDetalleInclude<ExtArgs> | null
    /**
     * Filter, which PreNominaDetalle to fetch.
     */
    where?: PreNominaDetalleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PreNominaDetalles to fetch.
     */
    orderBy?: PreNominaDetalleOrderByWithRelationInput | PreNominaDetalleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PreNominaDetalles.
     */
    cursor?: PreNominaDetalleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PreNominaDetalles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PreNominaDetalles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PreNominaDetalles.
     */
    distinct?: PreNominaDetalleScalarFieldEnum | PreNominaDetalleScalarFieldEnum[]
  }

  /**
   * PreNominaDetalle findMany
   */
  export type PreNominaDetalleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PreNominaDetalle
     */
    select?: PreNominaDetalleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PreNominaDetalleInclude<ExtArgs> | null
    /**
     * Filter, which PreNominaDetalles to fetch.
     */
    where?: PreNominaDetalleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PreNominaDetalles to fetch.
     */
    orderBy?: PreNominaDetalleOrderByWithRelationInput | PreNominaDetalleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PreNominaDetalles.
     */
    cursor?: PreNominaDetalleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PreNominaDetalles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PreNominaDetalles.
     */
    skip?: number
    distinct?: PreNominaDetalleScalarFieldEnum | PreNominaDetalleScalarFieldEnum[]
  }

  /**
   * PreNominaDetalle create
   */
  export type PreNominaDetalleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PreNominaDetalle
     */
    select?: PreNominaDetalleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PreNominaDetalleInclude<ExtArgs> | null
    /**
     * The data needed to create a PreNominaDetalle.
     */
    data: XOR<PreNominaDetalleCreateInput, PreNominaDetalleUncheckedCreateInput>
  }

  /**
   * PreNominaDetalle createMany
   */
  export type PreNominaDetalleCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PreNominaDetalles.
     */
    data: PreNominaDetalleCreateManyInput | PreNominaDetalleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PreNominaDetalle createManyAndReturn
   */
  export type PreNominaDetalleCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PreNominaDetalle
     */
    select?: PreNominaDetalleSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many PreNominaDetalles.
     */
    data: PreNominaDetalleCreateManyInput | PreNominaDetalleCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PreNominaDetalleIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * PreNominaDetalle update
   */
  export type PreNominaDetalleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PreNominaDetalle
     */
    select?: PreNominaDetalleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PreNominaDetalleInclude<ExtArgs> | null
    /**
     * The data needed to update a PreNominaDetalle.
     */
    data: XOR<PreNominaDetalleUpdateInput, PreNominaDetalleUncheckedUpdateInput>
    /**
     * Choose, which PreNominaDetalle to update.
     */
    where: PreNominaDetalleWhereUniqueInput
  }

  /**
   * PreNominaDetalle updateMany
   */
  export type PreNominaDetalleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PreNominaDetalles.
     */
    data: XOR<PreNominaDetalleUpdateManyMutationInput, PreNominaDetalleUncheckedUpdateManyInput>
    /**
     * Filter which PreNominaDetalles to update
     */
    where?: PreNominaDetalleWhereInput
  }

  /**
   * PreNominaDetalle upsert
   */
  export type PreNominaDetalleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PreNominaDetalle
     */
    select?: PreNominaDetalleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PreNominaDetalleInclude<ExtArgs> | null
    /**
     * The filter to search for the PreNominaDetalle to update in case it exists.
     */
    where: PreNominaDetalleWhereUniqueInput
    /**
     * In case the PreNominaDetalle found by the `where` argument doesn't exist, create a new PreNominaDetalle with this data.
     */
    create: XOR<PreNominaDetalleCreateInput, PreNominaDetalleUncheckedCreateInput>
    /**
     * In case the PreNominaDetalle was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PreNominaDetalleUpdateInput, PreNominaDetalleUncheckedUpdateInput>
  }

  /**
   * PreNominaDetalle delete
   */
  export type PreNominaDetalleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PreNominaDetalle
     */
    select?: PreNominaDetalleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PreNominaDetalleInclude<ExtArgs> | null
    /**
     * Filter which PreNominaDetalle to delete.
     */
    where: PreNominaDetalleWhereUniqueInput
  }

  /**
   * PreNominaDetalle deleteMany
   */
  export type PreNominaDetalleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PreNominaDetalles to delete
     */
    where?: PreNominaDetalleWhereInput
  }

  /**
   * PreNominaDetalle without action
   */
  export type PreNominaDetalleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PreNominaDetalle
     */
    select?: PreNominaDetalleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PreNominaDetalleInclude<ExtArgs> | null
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


  export const EmpleadoScalarFieldEnum: {
    id_empleado: 'id_empleado',
    tenant_id: 'tenant_id',
    numero_empleado: 'numero_empleado',
    nombre: 'nombre',
    apellido_paterno: 'apellido_paterno',
    apellido_materno: 'apellido_materno',
    rfc: 'rfc',
    curp: 'curp',
    nss: 'nss',
    puesto: 'puesto',
    categoria: 'categoria',
    tipo_contrato: 'tipo_contrato',
    fecha_ingreso: 'fecha_ingreso',
    fecha_baja: 'fecha_baja',
    salario_diario: 'salario_diario',
    salario_integrado: 'salario_integrado',
    telefono: 'telefono',
    email: 'email',
    contacto_emergencia: 'contacto_emergencia',
    certificaciones: 'certificaciones',
    estado: 'estado',
    cuadrilla_id: 'cuadrilla_id',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type EmpleadoScalarFieldEnum = (typeof EmpleadoScalarFieldEnum)[keyof typeof EmpleadoScalarFieldEnum]


  export const CuadrillaScalarFieldEnum: {
    id_cuadrilla: 'id_cuadrilla',
    tenant_id: 'tenant_id',
    proyecto_id: 'proyecto_id',
    nombre: 'nombre',
    codigo: 'codigo',
    especialidad: 'especialidad',
    capataz_id: 'capataz_id',
    capataz_nombre: 'capataz_nombre',
    estado: 'estado',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type CuadrillaScalarFieldEnum = (typeof CuadrillaScalarFieldEnum)[keyof typeof CuadrillaScalarFieldEnum]


  export const AsignacionFrenteScalarFieldEnum: {
    id_asignacion: 'id_asignacion',
    tenant_id: 'tenant_id',
    proyecto_id: 'proyecto_id',
    empleado_id: 'empleado_id',
    cuadrilla_id: 'cuadrilla_id',
    frente_trabajo: 'frente_trabajo',
    turno: 'turno',
    fecha_inicio: 'fecha_inicio',
    fecha_fin: 'fecha_fin',
    horas_diarias: 'horas_diarias',
    estado: 'estado',
    created_at: 'created_at'
  };

  export type AsignacionFrenteScalarFieldEnum = (typeof AsignacionFrenteScalarFieldEnum)[keyof typeof AsignacionFrenteScalarFieldEnum]


  export const PreNominaScalarFieldEnum: {
    id_prenomina: 'id_prenomina',
    tenant_id: 'tenant_id',
    proyecto_id: 'proyecto_id',
    codigo: 'codigo',
    periodo_tipo: 'periodo_tipo',
    periodo_inicio: 'periodo_inicio',
    periodo_fin: 'periodo_fin',
    total_percepciones: 'total_percepciones',
    total_deducciones: 'total_deducciones',
    total_neto: 'total_neto',
    total_empleados: 'total_empleados',
    estado: 'estado',
    elaborado_por: 'elaborado_por',
    autorizado_por: 'autorizado_por',
    fecha_autorizacion: 'fecha_autorizacion',
    notas: 'notas',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type PreNominaScalarFieldEnum = (typeof PreNominaScalarFieldEnum)[keyof typeof PreNominaScalarFieldEnum]


  export const PreNominaDetalleScalarFieldEnum: {
    id_detalle: 'id_detalle',
    tenant_id: 'tenant_id',
    proyecto_id: 'proyecto_id',
    prenomina_id: 'prenomina_id',
    empleado_id: 'empleado_id',
    dias_trabajados: 'dias_trabajados',
    horas_extra: 'horas_extra',
    salario_base: 'salario_base',
    monto_horas_extra: 'monto_horas_extra',
    bonos: 'bonos',
    total_percepciones: 'total_percepciones',
    deduccion_imss: 'deduccion_imss',
    deduccion_isr: 'deduccion_isr',
    otras_deducciones: 'otras_deducciones',
    total_deducciones: 'total_deducciones',
    neto_a_pagar: 'neto_a_pagar'
  };

  export type PreNominaDetalleScalarFieldEnum = (typeof PreNominaDetalleScalarFieldEnum)[keyof typeof PreNominaDetalleScalarFieldEnum]


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


  export type EmpleadoWhereInput = {
    AND?: EmpleadoWhereInput | EmpleadoWhereInput[]
    OR?: EmpleadoWhereInput[]
    NOT?: EmpleadoWhereInput | EmpleadoWhereInput[]
    id_empleado?: UuidFilter<"Empleado"> | string
    tenant_id?: UuidFilter<"Empleado"> | string
    numero_empleado?: StringFilter<"Empleado"> | string
    nombre?: StringFilter<"Empleado"> | string
    apellido_paterno?: StringFilter<"Empleado"> | string
    apellido_materno?: StringNullableFilter<"Empleado"> | string | null
    rfc?: StringFilter<"Empleado"> | string
    curp?: StringNullableFilter<"Empleado"> | string | null
    nss?: StringNullableFilter<"Empleado"> | string | null
    puesto?: StringFilter<"Empleado"> | string
    categoria?: StringFilter<"Empleado"> | string
    tipo_contrato?: StringFilter<"Empleado"> | string
    fecha_ingreso?: DateTimeFilter<"Empleado"> | Date | string
    fecha_baja?: DateTimeNullableFilter<"Empleado"> | Date | string | null
    salario_diario?: DecimalFilter<"Empleado"> | Decimal | DecimalJsLike | number | string
    salario_integrado?: DecimalNullableFilter<"Empleado"> | Decimal | DecimalJsLike | number | string | null
    telefono?: StringNullableFilter<"Empleado"> | string | null
    email?: StringNullableFilter<"Empleado"> | string | null
    contacto_emergencia?: StringNullableFilter<"Empleado"> | string | null
    certificaciones?: StringNullableFilter<"Empleado"> | string | null
    estado?: StringFilter<"Empleado"> | string
    cuadrilla_id?: UuidNullableFilter<"Empleado"> | string | null
    created_at?: DateTimeFilter<"Empleado"> | Date | string
    updated_at?: DateTimeFilter<"Empleado"> | Date | string
    cuadrilla?: XOR<CuadrillaNullableRelationFilter, CuadrillaWhereInput> | null
    asignaciones?: AsignacionFrenteListRelationFilter
    prenominas?: PreNominaDetalleListRelationFilter
  }

  export type EmpleadoOrderByWithRelationInput = {
    id_empleado?: SortOrder
    tenant_id?: SortOrder
    numero_empleado?: SortOrder
    nombre?: SortOrder
    apellido_paterno?: SortOrder
    apellido_materno?: SortOrderInput | SortOrder
    rfc?: SortOrder
    curp?: SortOrderInput | SortOrder
    nss?: SortOrderInput | SortOrder
    puesto?: SortOrder
    categoria?: SortOrder
    tipo_contrato?: SortOrder
    fecha_ingreso?: SortOrder
    fecha_baja?: SortOrderInput | SortOrder
    salario_diario?: SortOrder
    salario_integrado?: SortOrderInput | SortOrder
    telefono?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    contacto_emergencia?: SortOrderInput | SortOrder
    certificaciones?: SortOrderInput | SortOrder
    estado?: SortOrder
    cuadrilla_id?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    cuadrilla?: CuadrillaOrderByWithRelationInput
    asignaciones?: AsignacionFrenteOrderByRelationAggregateInput
    prenominas?: PreNominaDetalleOrderByRelationAggregateInput
  }

  export type EmpleadoWhereUniqueInput = Prisma.AtLeast<{
    id_empleado?: string
    tenant_id_numero_empleado?: EmpleadoTenant_idNumero_empleadoCompoundUniqueInput
    tenant_id_rfc?: EmpleadoTenant_idRfcCompoundUniqueInput
    AND?: EmpleadoWhereInput | EmpleadoWhereInput[]
    OR?: EmpleadoWhereInput[]
    NOT?: EmpleadoWhereInput | EmpleadoWhereInput[]
    tenant_id?: UuidFilter<"Empleado"> | string
    numero_empleado?: StringFilter<"Empleado"> | string
    nombre?: StringFilter<"Empleado"> | string
    apellido_paterno?: StringFilter<"Empleado"> | string
    apellido_materno?: StringNullableFilter<"Empleado"> | string | null
    rfc?: StringFilter<"Empleado"> | string
    curp?: StringNullableFilter<"Empleado"> | string | null
    nss?: StringNullableFilter<"Empleado"> | string | null
    puesto?: StringFilter<"Empleado"> | string
    categoria?: StringFilter<"Empleado"> | string
    tipo_contrato?: StringFilter<"Empleado"> | string
    fecha_ingreso?: DateTimeFilter<"Empleado"> | Date | string
    fecha_baja?: DateTimeNullableFilter<"Empleado"> | Date | string | null
    salario_diario?: DecimalFilter<"Empleado"> | Decimal | DecimalJsLike | number | string
    salario_integrado?: DecimalNullableFilter<"Empleado"> | Decimal | DecimalJsLike | number | string | null
    telefono?: StringNullableFilter<"Empleado"> | string | null
    email?: StringNullableFilter<"Empleado"> | string | null
    contacto_emergencia?: StringNullableFilter<"Empleado"> | string | null
    certificaciones?: StringNullableFilter<"Empleado"> | string | null
    estado?: StringFilter<"Empleado"> | string
    cuadrilla_id?: UuidNullableFilter<"Empleado"> | string | null
    created_at?: DateTimeFilter<"Empleado"> | Date | string
    updated_at?: DateTimeFilter<"Empleado"> | Date | string
    cuadrilla?: XOR<CuadrillaNullableRelationFilter, CuadrillaWhereInput> | null
    asignaciones?: AsignacionFrenteListRelationFilter
    prenominas?: PreNominaDetalleListRelationFilter
  }, "id_empleado" | "tenant_id_numero_empleado" | "tenant_id_rfc">

  export type EmpleadoOrderByWithAggregationInput = {
    id_empleado?: SortOrder
    tenant_id?: SortOrder
    numero_empleado?: SortOrder
    nombre?: SortOrder
    apellido_paterno?: SortOrder
    apellido_materno?: SortOrderInput | SortOrder
    rfc?: SortOrder
    curp?: SortOrderInput | SortOrder
    nss?: SortOrderInput | SortOrder
    puesto?: SortOrder
    categoria?: SortOrder
    tipo_contrato?: SortOrder
    fecha_ingreso?: SortOrder
    fecha_baja?: SortOrderInput | SortOrder
    salario_diario?: SortOrder
    salario_integrado?: SortOrderInput | SortOrder
    telefono?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    contacto_emergencia?: SortOrderInput | SortOrder
    certificaciones?: SortOrderInput | SortOrder
    estado?: SortOrder
    cuadrilla_id?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: EmpleadoCountOrderByAggregateInput
    _avg?: EmpleadoAvgOrderByAggregateInput
    _max?: EmpleadoMaxOrderByAggregateInput
    _min?: EmpleadoMinOrderByAggregateInput
    _sum?: EmpleadoSumOrderByAggregateInput
  }

  export type EmpleadoScalarWhereWithAggregatesInput = {
    AND?: EmpleadoScalarWhereWithAggregatesInput | EmpleadoScalarWhereWithAggregatesInput[]
    OR?: EmpleadoScalarWhereWithAggregatesInput[]
    NOT?: EmpleadoScalarWhereWithAggregatesInput | EmpleadoScalarWhereWithAggregatesInput[]
    id_empleado?: UuidWithAggregatesFilter<"Empleado"> | string
    tenant_id?: UuidWithAggregatesFilter<"Empleado"> | string
    numero_empleado?: StringWithAggregatesFilter<"Empleado"> | string
    nombre?: StringWithAggregatesFilter<"Empleado"> | string
    apellido_paterno?: StringWithAggregatesFilter<"Empleado"> | string
    apellido_materno?: StringNullableWithAggregatesFilter<"Empleado"> | string | null
    rfc?: StringWithAggregatesFilter<"Empleado"> | string
    curp?: StringNullableWithAggregatesFilter<"Empleado"> | string | null
    nss?: StringNullableWithAggregatesFilter<"Empleado"> | string | null
    puesto?: StringWithAggregatesFilter<"Empleado"> | string
    categoria?: StringWithAggregatesFilter<"Empleado"> | string
    tipo_contrato?: StringWithAggregatesFilter<"Empleado"> | string
    fecha_ingreso?: DateTimeWithAggregatesFilter<"Empleado"> | Date | string
    fecha_baja?: DateTimeNullableWithAggregatesFilter<"Empleado"> | Date | string | null
    salario_diario?: DecimalWithAggregatesFilter<"Empleado"> | Decimal | DecimalJsLike | number | string
    salario_integrado?: DecimalNullableWithAggregatesFilter<"Empleado"> | Decimal | DecimalJsLike | number | string | null
    telefono?: StringNullableWithAggregatesFilter<"Empleado"> | string | null
    email?: StringNullableWithAggregatesFilter<"Empleado"> | string | null
    contacto_emergencia?: StringNullableWithAggregatesFilter<"Empleado"> | string | null
    certificaciones?: StringNullableWithAggregatesFilter<"Empleado"> | string | null
    estado?: StringWithAggregatesFilter<"Empleado"> | string
    cuadrilla_id?: UuidNullableWithAggregatesFilter<"Empleado"> | string | null
    created_at?: DateTimeWithAggregatesFilter<"Empleado"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"Empleado"> | Date | string
  }

  export type CuadrillaWhereInput = {
    AND?: CuadrillaWhereInput | CuadrillaWhereInput[]
    OR?: CuadrillaWhereInput[]
    NOT?: CuadrillaWhereInput | CuadrillaWhereInput[]
    id_cuadrilla?: UuidFilter<"Cuadrilla"> | string
    tenant_id?: UuidFilter<"Cuadrilla"> | string
    proyecto_id?: UuidFilter<"Cuadrilla"> | string
    nombre?: StringFilter<"Cuadrilla"> | string
    codigo?: StringFilter<"Cuadrilla"> | string
    especialidad?: StringFilter<"Cuadrilla"> | string
    capataz_id?: UuidNullableFilter<"Cuadrilla"> | string | null
    capataz_nombre?: StringNullableFilter<"Cuadrilla"> | string | null
    estado?: StringFilter<"Cuadrilla"> | string
    created_at?: DateTimeFilter<"Cuadrilla"> | Date | string
    updated_at?: DateTimeFilter<"Cuadrilla"> | Date | string
    miembros?: EmpleadoListRelationFilter
    asignaciones?: AsignacionFrenteListRelationFilter
  }

  export type CuadrillaOrderByWithRelationInput = {
    id_cuadrilla?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    nombre?: SortOrder
    codigo?: SortOrder
    especialidad?: SortOrder
    capataz_id?: SortOrderInput | SortOrder
    capataz_nombre?: SortOrderInput | SortOrder
    estado?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    miembros?: EmpleadoOrderByRelationAggregateInput
    asignaciones?: AsignacionFrenteOrderByRelationAggregateInput
  }

  export type CuadrillaWhereUniqueInput = Prisma.AtLeast<{
    id_cuadrilla?: string
    tenant_id_proyecto_id_codigo?: CuadrillaTenant_idProyecto_idCodigoCompoundUniqueInput
    AND?: CuadrillaWhereInput | CuadrillaWhereInput[]
    OR?: CuadrillaWhereInput[]
    NOT?: CuadrillaWhereInput | CuadrillaWhereInput[]
    tenant_id?: UuidFilter<"Cuadrilla"> | string
    proyecto_id?: UuidFilter<"Cuadrilla"> | string
    nombre?: StringFilter<"Cuadrilla"> | string
    codigo?: StringFilter<"Cuadrilla"> | string
    especialidad?: StringFilter<"Cuadrilla"> | string
    capataz_id?: UuidNullableFilter<"Cuadrilla"> | string | null
    capataz_nombre?: StringNullableFilter<"Cuadrilla"> | string | null
    estado?: StringFilter<"Cuadrilla"> | string
    created_at?: DateTimeFilter<"Cuadrilla"> | Date | string
    updated_at?: DateTimeFilter<"Cuadrilla"> | Date | string
    miembros?: EmpleadoListRelationFilter
    asignaciones?: AsignacionFrenteListRelationFilter
  }, "id_cuadrilla" | "tenant_id_proyecto_id_codigo">

  export type CuadrillaOrderByWithAggregationInput = {
    id_cuadrilla?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    nombre?: SortOrder
    codigo?: SortOrder
    especialidad?: SortOrder
    capataz_id?: SortOrderInput | SortOrder
    capataz_nombre?: SortOrderInput | SortOrder
    estado?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: CuadrillaCountOrderByAggregateInput
    _max?: CuadrillaMaxOrderByAggregateInput
    _min?: CuadrillaMinOrderByAggregateInput
  }

  export type CuadrillaScalarWhereWithAggregatesInput = {
    AND?: CuadrillaScalarWhereWithAggregatesInput | CuadrillaScalarWhereWithAggregatesInput[]
    OR?: CuadrillaScalarWhereWithAggregatesInput[]
    NOT?: CuadrillaScalarWhereWithAggregatesInput | CuadrillaScalarWhereWithAggregatesInput[]
    id_cuadrilla?: UuidWithAggregatesFilter<"Cuadrilla"> | string
    tenant_id?: UuidWithAggregatesFilter<"Cuadrilla"> | string
    proyecto_id?: UuidWithAggregatesFilter<"Cuadrilla"> | string
    nombre?: StringWithAggregatesFilter<"Cuadrilla"> | string
    codigo?: StringWithAggregatesFilter<"Cuadrilla"> | string
    especialidad?: StringWithAggregatesFilter<"Cuadrilla"> | string
    capataz_id?: UuidNullableWithAggregatesFilter<"Cuadrilla"> | string | null
    capataz_nombre?: StringNullableWithAggregatesFilter<"Cuadrilla"> | string | null
    estado?: StringWithAggregatesFilter<"Cuadrilla"> | string
    created_at?: DateTimeWithAggregatesFilter<"Cuadrilla"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"Cuadrilla"> | Date | string
  }

  export type AsignacionFrenteWhereInput = {
    AND?: AsignacionFrenteWhereInput | AsignacionFrenteWhereInput[]
    OR?: AsignacionFrenteWhereInput[]
    NOT?: AsignacionFrenteWhereInput | AsignacionFrenteWhereInput[]
    id_asignacion?: UuidFilter<"AsignacionFrente"> | string
    tenant_id?: UuidFilter<"AsignacionFrente"> | string
    proyecto_id?: UuidFilter<"AsignacionFrente"> | string
    empleado_id?: UuidFilter<"AsignacionFrente"> | string
    cuadrilla_id?: UuidNullableFilter<"AsignacionFrente"> | string | null
    frente_trabajo?: StringFilter<"AsignacionFrente"> | string
    turno?: StringFilter<"AsignacionFrente"> | string
    fecha_inicio?: DateTimeFilter<"AsignacionFrente"> | Date | string
    fecha_fin?: DateTimeNullableFilter<"AsignacionFrente"> | Date | string | null
    horas_diarias?: DecimalFilter<"AsignacionFrente"> | Decimal | DecimalJsLike | number | string
    estado?: StringFilter<"AsignacionFrente"> | string
    created_at?: DateTimeFilter<"AsignacionFrente"> | Date | string
    empleado?: XOR<EmpleadoRelationFilter, EmpleadoWhereInput>
    cuadrilla?: XOR<CuadrillaNullableRelationFilter, CuadrillaWhereInput> | null
  }

  export type AsignacionFrenteOrderByWithRelationInput = {
    id_asignacion?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    empleado_id?: SortOrder
    cuadrilla_id?: SortOrderInput | SortOrder
    frente_trabajo?: SortOrder
    turno?: SortOrder
    fecha_inicio?: SortOrder
    fecha_fin?: SortOrderInput | SortOrder
    horas_diarias?: SortOrder
    estado?: SortOrder
    created_at?: SortOrder
    empleado?: EmpleadoOrderByWithRelationInput
    cuadrilla?: CuadrillaOrderByWithRelationInput
  }

  export type AsignacionFrenteWhereUniqueInput = Prisma.AtLeast<{
    id_asignacion?: string
    AND?: AsignacionFrenteWhereInput | AsignacionFrenteWhereInput[]
    OR?: AsignacionFrenteWhereInput[]
    NOT?: AsignacionFrenteWhereInput | AsignacionFrenteWhereInput[]
    tenant_id?: UuidFilter<"AsignacionFrente"> | string
    proyecto_id?: UuidFilter<"AsignacionFrente"> | string
    empleado_id?: UuidFilter<"AsignacionFrente"> | string
    cuadrilla_id?: UuidNullableFilter<"AsignacionFrente"> | string | null
    frente_trabajo?: StringFilter<"AsignacionFrente"> | string
    turno?: StringFilter<"AsignacionFrente"> | string
    fecha_inicio?: DateTimeFilter<"AsignacionFrente"> | Date | string
    fecha_fin?: DateTimeNullableFilter<"AsignacionFrente"> | Date | string | null
    horas_diarias?: DecimalFilter<"AsignacionFrente"> | Decimal | DecimalJsLike | number | string
    estado?: StringFilter<"AsignacionFrente"> | string
    created_at?: DateTimeFilter<"AsignacionFrente"> | Date | string
    empleado?: XOR<EmpleadoRelationFilter, EmpleadoWhereInput>
    cuadrilla?: XOR<CuadrillaNullableRelationFilter, CuadrillaWhereInput> | null
  }, "id_asignacion">

  export type AsignacionFrenteOrderByWithAggregationInput = {
    id_asignacion?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    empleado_id?: SortOrder
    cuadrilla_id?: SortOrderInput | SortOrder
    frente_trabajo?: SortOrder
    turno?: SortOrder
    fecha_inicio?: SortOrder
    fecha_fin?: SortOrderInput | SortOrder
    horas_diarias?: SortOrder
    estado?: SortOrder
    created_at?: SortOrder
    _count?: AsignacionFrenteCountOrderByAggregateInput
    _avg?: AsignacionFrenteAvgOrderByAggregateInput
    _max?: AsignacionFrenteMaxOrderByAggregateInput
    _min?: AsignacionFrenteMinOrderByAggregateInput
    _sum?: AsignacionFrenteSumOrderByAggregateInput
  }

  export type AsignacionFrenteScalarWhereWithAggregatesInput = {
    AND?: AsignacionFrenteScalarWhereWithAggregatesInput | AsignacionFrenteScalarWhereWithAggregatesInput[]
    OR?: AsignacionFrenteScalarWhereWithAggregatesInput[]
    NOT?: AsignacionFrenteScalarWhereWithAggregatesInput | AsignacionFrenteScalarWhereWithAggregatesInput[]
    id_asignacion?: UuidWithAggregatesFilter<"AsignacionFrente"> | string
    tenant_id?: UuidWithAggregatesFilter<"AsignacionFrente"> | string
    proyecto_id?: UuidWithAggregatesFilter<"AsignacionFrente"> | string
    empleado_id?: UuidWithAggregatesFilter<"AsignacionFrente"> | string
    cuadrilla_id?: UuidNullableWithAggregatesFilter<"AsignacionFrente"> | string | null
    frente_trabajo?: StringWithAggregatesFilter<"AsignacionFrente"> | string
    turno?: StringWithAggregatesFilter<"AsignacionFrente"> | string
    fecha_inicio?: DateTimeWithAggregatesFilter<"AsignacionFrente"> | Date | string
    fecha_fin?: DateTimeNullableWithAggregatesFilter<"AsignacionFrente"> | Date | string | null
    horas_diarias?: DecimalWithAggregatesFilter<"AsignacionFrente"> | Decimal | DecimalJsLike | number | string
    estado?: StringWithAggregatesFilter<"AsignacionFrente"> | string
    created_at?: DateTimeWithAggregatesFilter<"AsignacionFrente"> | Date | string
  }

  export type PreNominaWhereInput = {
    AND?: PreNominaWhereInput | PreNominaWhereInput[]
    OR?: PreNominaWhereInput[]
    NOT?: PreNominaWhereInput | PreNominaWhereInput[]
    id_prenomina?: UuidFilter<"PreNomina"> | string
    tenant_id?: UuidFilter<"PreNomina"> | string
    proyecto_id?: UuidFilter<"PreNomina"> | string
    codigo?: StringFilter<"PreNomina"> | string
    periodo_tipo?: StringFilter<"PreNomina"> | string
    periodo_inicio?: DateTimeFilter<"PreNomina"> | Date | string
    periodo_fin?: DateTimeFilter<"PreNomina"> | Date | string
    total_percepciones?: DecimalFilter<"PreNomina"> | Decimal | DecimalJsLike | number | string
    total_deducciones?: DecimalFilter<"PreNomina"> | Decimal | DecimalJsLike | number | string
    total_neto?: DecimalFilter<"PreNomina"> | Decimal | DecimalJsLike | number | string
    total_empleados?: IntFilter<"PreNomina"> | number
    estado?: StringFilter<"PreNomina"> | string
    elaborado_por?: UuidFilter<"PreNomina"> | string
    autorizado_por?: UuidNullableFilter<"PreNomina"> | string | null
    fecha_autorizacion?: DateTimeNullableFilter<"PreNomina"> | Date | string | null
    notas?: StringNullableFilter<"PreNomina"> | string | null
    created_at?: DateTimeFilter<"PreNomina"> | Date | string
    updated_at?: DateTimeFilter<"PreNomina"> | Date | string
    detalles?: PreNominaDetalleListRelationFilter
  }

  export type PreNominaOrderByWithRelationInput = {
    id_prenomina?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    codigo?: SortOrder
    periodo_tipo?: SortOrder
    periodo_inicio?: SortOrder
    periodo_fin?: SortOrder
    total_percepciones?: SortOrder
    total_deducciones?: SortOrder
    total_neto?: SortOrder
    total_empleados?: SortOrder
    estado?: SortOrder
    elaborado_por?: SortOrder
    autorizado_por?: SortOrderInput | SortOrder
    fecha_autorizacion?: SortOrderInput | SortOrder
    notas?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    detalles?: PreNominaDetalleOrderByRelationAggregateInput
  }

  export type PreNominaWhereUniqueInput = Prisma.AtLeast<{
    id_prenomina?: string
    tenant_id_codigo?: PreNominaTenant_idCodigoCompoundUniqueInput
    AND?: PreNominaWhereInput | PreNominaWhereInput[]
    OR?: PreNominaWhereInput[]
    NOT?: PreNominaWhereInput | PreNominaWhereInput[]
    tenant_id?: UuidFilter<"PreNomina"> | string
    proyecto_id?: UuidFilter<"PreNomina"> | string
    codigo?: StringFilter<"PreNomina"> | string
    periodo_tipo?: StringFilter<"PreNomina"> | string
    periodo_inicio?: DateTimeFilter<"PreNomina"> | Date | string
    periodo_fin?: DateTimeFilter<"PreNomina"> | Date | string
    total_percepciones?: DecimalFilter<"PreNomina"> | Decimal | DecimalJsLike | number | string
    total_deducciones?: DecimalFilter<"PreNomina"> | Decimal | DecimalJsLike | number | string
    total_neto?: DecimalFilter<"PreNomina"> | Decimal | DecimalJsLike | number | string
    total_empleados?: IntFilter<"PreNomina"> | number
    estado?: StringFilter<"PreNomina"> | string
    elaborado_por?: UuidFilter<"PreNomina"> | string
    autorizado_por?: UuidNullableFilter<"PreNomina"> | string | null
    fecha_autorizacion?: DateTimeNullableFilter<"PreNomina"> | Date | string | null
    notas?: StringNullableFilter<"PreNomina"> | string | null
    created_at?: DateTimeFilter<"PreNomina"> | Date | string
    updated_at?: DateTimeFilter<"PreNomina"> | Date | string
    detalles?: PreNominaDetalleListRelationFilter
  }, "id_prenomina" | "tenant_id_codigo">

  export type PreNominaOrderByWithAggregationInput = {
    id_prenomina?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    codigo?: SortOrder
    periodo_tipo?: SortOrder
    periodo_inicio?: SortOrder
    periodo_fin?: SortOrder
    total_percepciones?: SortOrder
    total_deducciones?: SortOrder
    total_neto?: SortOrder
    total_empleados?: SortOrder
    estado?: SortOrder
    elaborado_por?: SortOrder
    autorizado_por?: SortOrderInput | SortOrder
    fecha_autorizacion?: SortOrderInput | SortOrder
    notas?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: PreNominaCountOrderByAggregateInput
    _avg?: PreNominaAvgOrderByAggregateInput
    _max?: PreNominaMaxOrderByAggregateInput
    _min?: PreNominaMinOrderByAggregateInput
    _sum?: PreNominaSumOrderByAggregateInput
  }

  export type PreNominaScalarWhereWithAggregatesInput = {
    AND?: PreNominaScalarWhereWithAggregatesInput | PreNominaScalarWhereWithAggregatesInput[]
    OR?: PreNominaScalarWhereWithAggregatesInput[]
    NOT?: PreNominaScalarWhereWithAggregatesInput | PreNominaScalarWhereWithAggregatesInput[]
    id_prenomina?: UuidWithAggregatesFilter<"PreNomina"> | string
    tenant_id?: UuidWithAggregatesFilter<"PreNomina"> | string
    proyecto_id?: UuidWithAggregatesFilter<"PreNomina"> | string
    codigo?: StringWithAggregatesFilter<"PreNomina"> | string
    periodo_tipo?: StringWithAggregatesFilter<"PreNomina"> | string
    periodo_inicio?: DateTimeWithAggregatesFilter<"PreNomina"> | Date | string
    periodo_fin?: DateTimeWithAggregatesFilter<"PreNomina"> | Date | string
    total_percepciones?: DecimalWithAggregatesFilter<"PreNomina"> | Decimal | DecimalJsLike | number | string
    total_deducciones?: DecimalWithAggregatesFilter<"PreNomina"> | Decimal | DecimalJsLike | number | string
    total_neto?: DecimalWithAggregatesFilter<"PreNomina"> | Decimal | DecimalJsLike | number | string
    total_empleados?: IntWithAggregatesFilter<"PreNomina"> | number
    estado?: StringWithAggregatesFilter<"PreNomina"> | string
    elaborado_por?: UuidWithAggregatesFilter<"PreNomina"> | string
    autorizado_por?: UuidNullableWithAggregatesFilter<"PreNomina"> | string | null
    fecha_autorizacion?: DateTimeNullableWithAggregatesFilter<"PreNomina"> | Date | string | null
    notas?: StringNullableWithAggregatesFilter<"PreNomina"> | string | null
    created_at?: DateTimeWithAggregatesFilter<"PreNomina"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"PreNomina"> | Date | string
  }

  export type PreNominaDetalleWhereInput = {
    AND?: PreNominaDetalleWhereInput | PreNominaDetalleWhereInput[]
    OR?: PreNominaDetalleWhereInput[]
    NOT?: PreNominaDetalleWhereInput | PreNominaDetalleWhereInput[]
    id_detalle?: UuidFilter<"PreNominaDetalle"> | string
    tenant_id?: UuidFilter<"PreNominaDetalle"> | string
    proyecto_id?: UuidFilter<"PreNominaDetalle"> | string
    prenomina_id?: UuidFilter<"PreNominaDetalle"> | string
    empleado_id?: UuidFilter<"PreNominaDetalle"> | string
    dias_trabajados?: DecimalFilter<"PreNominaDetalle"> | Decimal | DecimalJsLike | number | string
    horas_extra?: DecimalFilter<"PreNominaDetalle"> | Decimal | DecimalJsLike | number | string
    salario_base?: DecimalFilter<"PreNominaDetalle"> | Decimal | DecimalJsLike | number | string
    monto_horas_extra?: DecimalFilter<"PreNominaDetalle"> | Decimal | DecimalJsLike | number | string
    bonos?: DecimalFilter<"PreNominaDetalle"> | Decimal | DecimalJsLike | number | string
    total_percepciones?: DecimalFilter<"PreNominaDetalle"> | Decimal | DecimalJsLike | number | string
    deduccion_imss?: DecimalFilter<"PreNominaDetalle"> | Decimal | DecimalJsLike | number | string
    deduccion_isr?: DecimalFilter<"PreNominaDetalle"> | Decimal | DecimalJsLike | number | string
    otras_deducciones?: DecimalFilter<"PreNominaDetalle"> | Decimal | DecimalJsLike | number | string
    total_deducciones?: DecimalFilter<"PreNominaDetalle"> | Decimal | DecimalJsLike | number | string
    neto_a_pagar?: DecimalFilter<"PreNominaDetalle"> | Decimal | DecimalJsLike | number | string
    prenomina?: XOR<PreNominaRelationFilter, PreNominaWhereInput>
    empleado?: XOR<EmpleadoRelationFilter, EmpleadoWhereInput>
  }

  export type PreNominaDetalleOrderByWithRelationInput = {
    id_detalle?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    prenomina_id?: SortOrder
    empleado_id?: SortOrder
    dias_trabajados?: SortOrder
    horas_extra?: SortOrder
    salario_base?: SortOrder
    monto_horas_extra?: SortOrder
    bonos?: SortOrder
    total_percepciones?: SortOrder
    deduccion_imss?: SortOrder
    deduccion_isr?: SortOrder
    otras_deducciones?: SortOrder
    total_deducciones?: SortOrder
    neto_a_pagar?: SortOrder
    prenomina?: PreNominaOrderByWithRelationInput
    empleado?: EmpleadoOrderByWithRelationInput
  }

  export type PreNominaDetalleWhereUniqueInput = Prisma.AtLeast<{
    id_detalle?: string
    AND?: PreNominaDetalleWhereInput | PreNominaDetalleWhereInput[]
    OR?: PreNominaDetalleWhereInput[]
    NOT?: PreNominaDetalleWhereInput | PreNominaDetalleWhereInput[]
    tenant_id?: UuidFilter<"PreNominaDetalle"> | string
    proyecto_id?: UuidFilter<"PreNominaDetalle"> | string
    prenomina_id?: UuidFilter<"PreNominaDetalle"> | string
    empleado_id?: UuidFilter<"PreNominaDetalle"> | string
    dias_trabajados?: DecimalFilter<"PreNominaDetalle"> | Decimal | DecimalJsLike | number | string
    horas_extra?: DecimalFilter<"PreNominaDetalle"> | Decimal | DecimalJsLike | number | string
    salario_base?: DecimalFilter<"PreNominaDetalle"> | Decimal | DecimalJsLike | number | string
    monto_horas_extra?: DecimalFilter<"PreNominaDetalle"> | Decimal | DecimalJsLike | number | string
    bonos?: DecimalFilter<"PreNominaDetalle"> | Decimal | DecimalJsLike | number | string
    total_percepciones?: DecimalFilter<"PreNominaDetalle"> | Decimal | DecimalJsLike | number | string
    deduccion_imss?: DecimalFilter<"PreNominaDetalle"> | Decimal | DecimalJsLike | number | string
    deduccion_isr?: DecimalFilter<"PreNominaDetalle"> | Decimal | DecimalJsLike | number | string
    otras_deducciones?: DecimalFilter<"PreNominaDetalle"> | Decimal | DecimalJsLike | number | string
    total_deducciones?: DecimalFilter<"PreNominaDetalle"> | Decimal | DecimalJsLike | number | string
    neto_a_pagar?: DecimalFilter<"PreNominaDetalle"> | Decimal | DecimalJsLike | number | string
    prenomina?: XOR<PreNominaRelationFilter, PreNominaWhereInput>
    empleado?: XOR<EmpleadoRelationFilter, EmpleadoWhereInput>
  }, "id_detalle">

  export type PreNominaDetalleOrderByWithAggregationInput = {
    id_detalle?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    prenomina_id?: SortOrder
    empleado_id?: SortOrder
    dias_trabajados?: SortOrder
    horas_extra?: SortOrder
    salario_base?: SortOrder
    monto_horas_extra?: SortOrder
    bonos?: SortOrder
    total_percepciones?: SortOrder
    deduccion_imss?: SortOrder
    deduccion_isr?: SortOrder
    otras_deducciones?: SortOrder
    total_deducciones?: SortOrder
    neto_a_pagar?: SortOrder
    _count?: PreNominaDetalleCountOrderByAggregateInput
    _avg?: PreNominaDetalleAvgOrderByAggregateInput
    _max?: PreNominaDetalleMaxOrderByAggregateInput
    _min?: PreNominaDetalleMinOrderByAggregateInput
    _sum?: PreNominaDetalleSumOrderByAggregateInput
  }

  export type PreNominaDetalleScalarWhereWithAggregatesInput = {
    AND?: PreNominaDetalleScalarWhereWithAggregatesInput | PreNominaDetalleScalarWhereWithAggregatesInput[]
    OR?: PreNominaDetalleScalarWhereWithAggregatesInput[]
    NOT?: PreNominaDetalleScalarWhereWithAggregatesInput | PreNominaDetalleScalarWhereWithAggregatesInput[]
    id_detalle?: UuidWithAggregatesFilter<"PreNominaDetalle"> | string
    tenant_id?: UuidWithAggregatesFilter<"PreNominaDetalle"> | string
    proyecto_id?: UuidWithAggregatesFilter<"PreNominaDetalle"> | string
    prenomina_id?: UuidWithAggregatesFilter<"PreNominaDetalle"> | string
    empleado_id?: UuidWithAggregatesFilter<"PreNominaDetalle"> | string
    dias_trabajados?: DecimalWithAggregatesFilter<"PreNominaDetalle"> | Decimal | DecimalJsLike | number | string
    horas_extra?: DecimalWithAggregatesFilter<"PreNominaDetalle"> | Decimal | DecimalJsLike | number | string
    salario_base?: DecimalWithAggregatesFilter<"PreNominaDetalle"> | Decimal | DecimalJsLike | number | string
    monto_horas_extra?: DecimalWithAggregatesFilter<"PreNominaDetalle"> | Decimal | DecimalJsLike | number | string
    bonos?: DecimalWithAggregatesFilter<"PreNominaDetalle"> | Decimal | DecimalJsLike | number | string
    total_percepciones?: DecimalWithAggregatesFilter<"PreNominaDetalle"> | Decimal | DecimalJsLike | number | string
    deduccion_imss?: DecimalWithAggregatesFilter<"PreNominaDetalle"> | Decimal | DecimalJsLike | number | string
    deduccion_isr?: DecimalWithAggregatesFilter<"PreNominaDetalle"> | Decimal | DecimalJsLike | number | string
    otras_deducciones?: DecimalWithAggregatesFilter<"PreNominaDetalle"> | Decimal | DecimalJsLike | number | string
    total_deducciones?: DecimalWithAggregatesFilter<"PreNominaDetalle"> | Decimal | DecimalJsLike | number | string
    neto_a_pagar?: DecimalWithAggregatesFilter<"PreNominaDetalle"> | Decimal | DecimalJsLike | number | string
  }

  export type EmpleadoCreateInput = {
    id_empleado?: string
    tenant_id: string
    numero_empleado: string
    nombre: string
    apellido_paterno: string
    apellido_materno?: string | null
    rfc: string
    curp?: string | null
    nss?: string | null
    puesto: string
    categoria?: string
    tipo_contrato?: string
    fecha_ingreso: Date | string
    fecha_baja?: Date | string | null
    salario_diario: Decimal | DecimalJsLike | number | string
    salario_integrado?: Decimal | DecimalJsLike | number | string | null
    telefono?: string | null
    email?: string | null
    contacto_emergencia?: string | null
    certificaciones?: string | null
    estado?: string
    created_at?: Date | string
    updated_at?: Date | string
    cuadrilla?: CuadrillaCreateNestedOneWithoutMiembrosInput
    asignaciones?: AsignacionFrenteCreateNestedManyWithoutEmpleadoInput
    prenominas?: PreNominaDetalleCreateNestedManyWithoutEmpleadoInput
  }

  export type EmpleadoUncheckedCreateInput = {
    id_empleado?: string
    tenant_id: string
    numero_empleado: string
    nombre: string
    apellido_paterno: string
    apellido_materno?: string | null
    rfc: string
    curp?: string | null
    nss?: string | null
    puesto: string
    categoria?: string
    tipo_contrato?: string
    fecha_ingreso: Date | string
    fecha_baja?: Date | string | null
    salario_diario: Decimal | DecimalJsLike | number | string
    salario_integrado?: Decimal | DecimalJsLike | number | string | null
    telefono?: string | null
    email?: string | null
    contacto_emergencia?: string | null
    certificaciones?: string | null
    estado?: string
    cuadrilla_id?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    asignaciones?: AsignacionFrenteUncheckedCreateNestedManyWithoutEmpleadoInput
    prenominas?: PreNominaDetalleUncheckedCreateNestedManyWithoutEmpleadoInput
  }

  export type EmpleadoUpdateInput = {
    id_empleado?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    numero_empleado?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    apellido_paterno?: StringFieldUpdateOperationsInput | string
    apellido_materno?: NullableStringFieldUpdateOperationsInput | string | null
    rfc?: StringFieldUpdateOperationsInput | string
    curp?: NullableStringFieldUpdateOperationsInput | string | null
    nss?: NullableStringFieldUpdateOperationsInput | string | null
    puesto?: StringFieldUpdateOperationsInput | string
    categoria?: StringFieldUpdateOperationsInput | string
    tipo_contrato?: StringFieldUpdateOperationsInput | string
    fecha_ingreso?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_baja?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    salario_diario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    salario_integrado?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    contacto_emergencia?: NullableStringFieldUpdateOperationsInput | string | null
    certificaciones?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    cuadrilla?: CuadrillaUpdateOneWithoutMiembrosNestedInput
    asignaciones?: AsignacionFrenteUpdateManyWithoutEmpleadoNestedInput
    prenominas?: PreNominaDetalleUpdateManyWithoutEmpleadoNestedInput
  }

  export type EmpleadoUncheckedUpdateInput = {
    id_empleado?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    numero_empleado?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    apellido_paterno?: StringFieldUpdateOperationsInput | string
    apellido_materno?: NullableStringFieldUpdateOperationsInput | string | null
    rfc?: StringFieldUpdateOperationsInput | string
    curp?: NullableStringFieldUpdateOperationsInput | string | null
    nss?: NullableStringFieldUpdateOperationsInput | string | null
    puesto?: StringFieldUpdateOperationsInput | string
    categoria?: StringFieldUpdateOperationsInput | string
    tipo_contrato?: StringFieldUpdateOperationsInput | string
    fecha_ingreso?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_baja?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    salario_diario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    salario_integrado?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    contacto_emergencia?: NullableStringFieldUpdateOperationsInput | string | null
    certificaciones?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: StringFieldUpdateOperationsInput | string
    cuadrilla_id?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    asignaciones?: AsignacionFrenteUncheckedUpdateManyWithoutEmpleadoNestedInput
    prenominas?: PreNominaDetalleUncheckedUpdateManyWithoutEmpleadoNestedInput
  }

  export type EmpleadoCreateManyInput = {
    id_empleado?: string
    tenant_id: string
    numero_empleado: string
    nombre: string
    apellido_paterno: string
    apellido_materno?: string | null
    rfc: string
    curp?: string | null
    nss?: string | null
    puesto: string
    categoria?: string
    tipo_contrato?: string
    fecha_ingreso: Date | string
    fecha_baja?: Date | string | null
    salario_diario: Decimal | DecimalJsLike | number | string
    salario_integrado?: Decimal | DecimalJsLike | number | string | null
    telefono?: string | null
    email?: string | null
    contacto_emergencia?: string | null
    certificaciones?: string | null
    estado?: string
    cuadrilla_id?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type EmpleadoUpdateManyMutationInput = {
    id_empleado?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    numero_empleado?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    apellido_paterno?: StringFieldUpdateOperationsInput | string
    apellido_materno?: NullableStringFieldUpdateOperationsInput | string | null
    rfc?: StringFieldUpdateOperationsInput | string
    curp?: NullableStringFieldUpdateOperationsInput | string | null
    nss?: NullableStringFieldUpdateOperationsInput | string | null
    puesto?: StringFieldUpdateOperationsInput | string
    categoria?: StringFieldUpdateOperationsInput | string
    tipo_contrato?: StringFieldUpdateOperationsInput | string
    fecha_ingreso?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_baja?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    salario_diario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    salario_integrado?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    contacto_emergencia?: NullableStringFieldUpdateOperationsInput | string | null
    certificaciones?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmpleadoUncheckedUpdateManyInput = {
    id_empleado?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    numero_empleado?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    apellido_paterno?: StringFieldUpdateOperationsInput | string
    apellido_materno?: NullableStringFieldUpdateOperationsInput | string | null
    rfc?: StringFieldUpdateOperationsInput | string
    curp?: NullableStringFieldUpdateOperationsInput | string | null
    nss?: NullableStringFieldUpdateOperationsInput | string | null
    puesto?: StringFieldUpdateOperationsInput | string
    categoria?: StringFieldUpdateOperationsInput | string
    tipo_contrato?: StringFieldUpdateOperationsInput | string
    fecha_ingreso?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_baja?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    salario_diario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    salario_integrado?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    contacto_emergencia?: NullableStringFieldUpdateOperationsInput | string | null
    certificaciones?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: StringFieldUpdateOperationsInput | string
    cuadrilla_id?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CuadrillaCreateInput = {
    id_cuadrilla?: string
    tenant_id: string
    proyecto_id: string
    nombre: string
    codigo: string
    especialidad: string
    capataz_id?: string | null
    capataz_nombre?: string | null
    estado?: string
    created_at?: Date | string
    updated_at?: Date | string
    miembros?: EmpleadoCreateNestedManyWithoutCuadrillaInput
    asignaciones?: AsignacionFrenteCreateNestedManyWithoutCuadrillaInput
  }

  export type CuadrillaUncheckedCreateInput = {
    id_cuadrilla?: string
    tenant_id: string
    proyecto_id: string
    nombre: string
    codigo: string
    especialidad: string
    capataz_id?: string | null
    capataz_nombre?: string | null
    estado?: string
    created_at?: Date | string
    updated_at?: Date | string
    miembros?: EmpleadoUncheckedCreateNestedManyWithoutCuadrillaInput
    asignaciones?: AsignacionFrenteUncheckedCreateNestedManyWithoutCuadrillaInput
  }

  export type CuadrillaUpdateInput = {
    id_cuadrilla?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    especialidad?: StringFieldUpdateOperationsInput | string
    capataz_id?: NullableStringFieldUpdateOperationsInput | string | null
    capataz_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    miembros?: EmpleadoUpdateManyWithoutCuadrillaNestedInput
    asignaciones?: AsignacionFrenteUpdateManyWithoutCuadrillaNestedInput
  }

  export type CuadrillaUncheckedUpdateInput = {
    id_cuadrilla?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    especialidad?: StringFieldUpdateOperationsInput | string
    capataz_id?: NullableStringFieldUpdateOperationsInput | string | null
    capataz_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    miembros?: EmpleadoUncheckedUpdateManyWithoutCuadrillaNestedInput
    asignaciones?: AsignacionFrenteUncheckedUpdateManyWithoutCuadrillaNestedInput
  }

  export type CuadrillaCreateManyInput = {
    id_cuadrilla?: string
    tenant_id: string
    proyecto_id: string
    nombre: string
    codigo: string
    especialidad: string
    capataz_id?: string | null
    capataz_nombre?: string | null
    estado?: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type CuadrillaUpdateManyMutationInput = {
    id_cuadrilla?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    especialidad?: StringFieldUpdateOperationsInput | string
    capataz_id?: NullableStringFieldUpdateOperationsInput | string | null
    capataz_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CuadrillaUncheckedUpdateManyInput = {
    id_cuadrilla?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    especialidad?: StringFieldUpdateOperationsInput | string
    capataz_id?: NullableStringFieldUpdateOperationsInput | string | null
    capataz_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AsignacionFrenteCreateInput = {
    id_asignacion?: string
    tenant_id: string
    proyecto_id: string
    frente_trabajo: string
    turno?: string
    fecha_inicio: Date | string
    fecha_fin?: Date | string | null
    horas_diarias?: Decimal | DecimalJsLike | number | string
    estado?: string
    created_at?: Date | string
    empleado: EmpleadoCreateNestedOneWithoutAsignacionesInput
    cuadrilla?: CuadrillaCreateNestedOneWithoutAsignacionesInput
  }

  export type AsignacionFrenteUncheckedCreateInput = {
    id_asignacion?: string
    tenant_id: string
    proyecto_id: string
    empleado_id: string
    cuadrilla_id?: string | null
    frente_trabajo: string
    turno?: string
    fecha_inicio: Date | string
    fecha_fin?: Date | string | null
    horas_diarias?: Decimal | DecimalJsLike | number | string
    estado?: string
    created_at?: Date | string
  }

  export type AsignacionFrenteUpdateInput = {
    id_asignacion?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    frente_trabajo?: StringFieldUpdateOperationsInput | string
    turno?: StringFieldUpdateOperationsInput | string
    fecha_inicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_fin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    horas_diarias?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    estado?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    empleado?: EmpleadoUpdateOneRequiredWithoutAsignacionesNestedInput
    cuadrilla?: CuadrillaUpdateOneWithoutAsignacionesNestedInput
  }

  export type AsignacionFrenteUncheckedUpdateInput = {
    id_asignacion?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    empleado_id?: StringFieldUpdateOperationsInput | string
    cuadrilla_id?: NullableStringFieldUpdateOperationsInput | string | null
    frente_trabajo?: StringFieldUpdateOperationsInput | string
    turno?: StringFieldUpdateOperationsInput | string
    fecha_inicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_fin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    horas_diarias?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    estado?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AsignacionFrenteCreateManyInput = {
    id_asignacion?: string
    tenant_id: string
    proyecto_id: string
    empleado_id: string
    cuadrilla_id?: string | null
    frente_trabajo: string
    turno?: string
    fecha_inicio: Date | string
    fecha_fin?: Date | string | null
    horas_diarias?: Decimal | DecimalJsLike | number | string
    estado?: string
    created_at?: Date | string
  }

  export type AsignacionFrenteUpdateManyMutationInput = {
    id_asignacion?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    frente_trabajo?: StringFieldUpdateOperationsInput | string
    turno?: StringFieldUpdateOperationsInput | string
    fecha_inicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_fin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    horas_diarias?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    estado?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AsignacionFrenteUncheckedUpdateManyInput = {
    id_asignacion?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    empleado_id?: StringFieldUpdateOperationsInput | string
    cuadrilla_id?: NullableStringFieldUpdateOperationsInput | string | null
    frente_trabajo?: StringFieldUpdateOperationsInput | string
    turno?: StringFieldUpdateOperationsInput | string
    fecha_inicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_fin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    horas_diarias?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    estado?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PreNominaCreateInput = {
    id_prenomina?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    periodo_tipo?: string
    periodo_inicio: Date | string
    periodo_fin: Date | string
    total_percepciones?: Decimal | DecimalJsLike | number | string
    total_deducciones?: Decimal | DecimalJsLike | number | string
    total_neto?: Decimal | DecimalJsLike | number | string
    total_empleados?: number
    estado?: string
    elaborado_por: string
    autorizado_por?: string | null
    fecha_autorizacion?: Date | string | null
    notas?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    detalles?: PreNominaDetalleCreateNestedManyWithoutPrenominaInput
  }

  export type PreNominaUncheckedCreateInput = {
    id_prenomina?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    periodo_tipo?: string
    periodo_inicio: Date | string
    periodo_fin: Date | string
    total_percepciones?: Decimal | DecimalJsLike | number | string
    total_deducciones?: Decimal | DecimalJsLike | number | string
    total_neto?: Decimal | DecimalJsLike | number | string
    total_empleados?: number
    estado?: string
    elaborado_por: string
    autorizado_por?: string | null
    fecha_autorizacion?: Date | string | null
    notas?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    detalles?: PreNominaDetalleUncheckedCreateNestedManyWithoutPrenominaInput
  }

  export type PreNominaUpdateInput = {
    id_prenomina?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    periodo_tipo?: StringFieldUpdateOperationsInput | string
    periodo_inicio?: DateTimeFieldUpdateOperationsInput | Date | string
    periodo_fin?: DateTimeFieldUpdateOperationsInput | Date | string
    total_percepciones?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total_deducciones?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total_neto?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total_empleados?: IntFieldUpdateOperationsInput | number
    estado?: StringFieldUpdateOperationsInput | string
    elaborado_por?: StringFieldUpdateOperationsInput | string
    autorizado_por?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_autorizacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    detalles?: PreNominaDetalleUpdateManyWithoutPrenominaNestedInput
  }

  export type PreNominaUncheckedUpdateInput = {
    id_prenomina?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    periodo_tipo?: StringFieldUpdateOperationsInput | string
    periodo_inicio?: DateTimeFieldUpdateOperationsInput | Date | string
    periodo_fin?: DateTimeFieldUpdateOperationsInput | Date | string
    total_percepciones?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total_deducciones?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total_neto?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total_empleados?: IntFieldUpdateOperationsInput | number
    estado?: StringFieldUpdateOperationsInput | string
    elaborado_por?: StringFieldUpdateOperationsInput | string
    autorizado_por?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_autorizacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    detalles?: PreNominaDetalleUncheckedUpdateManyWithoutPrenominaNestedInput
  }

  export type PreNominaCreateManyInput = {
    id_prenomina?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    periodo_tipo?: string
    periodo_inicio: Date | string
    periodo_fin: Date | string
    total_percepciones?: Decimal | DecimalJsLike | number | string
    total_deducciones?: Decimal | DecimalJsLike | number | string
    total_neto?: Decimal | DecimalJsLike | number | string
    total_empleados?: number
    estado?: string
    elaborado_por: string
    autorizado_por?: string | null
    fecha_autorizacion?: Date | string | null
    notas?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type PreNominaUpdateManyMutationInput = {
    id_prenomina?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    periodo_tipo?: StringFieldUpdateOperationsInput | string
    periodo_inicio?: DateTimeFieldUpdateOperationsInput | Date | string
    periodo_fin?: DateTimeFieldUpdateOperationsInput | Date | string
    total_percepciones?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total_deducciones?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total_neto?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total_empleados?: IntFieldUpdateOperationsInput | number
    estado?: StringFieldUpdateOperationsInput | string
    elaborado_por?: StringFieldUpdateOperationsInput | string
    autorizado_por?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_autorizacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PreNominaUncheckedUpdateManyInput = {
    id_prenomina?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    periodo_tipo?: StringFieldUpdateOperationsInput | string
    periodo_inicio?: DateTimeFieldUpdateOperationsInput | Date | string
    periodo_fin?: DateTimeFieldUpdateOperationsInput | Date | string
    total_percepciones?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total_deducciones?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total_neto?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total_empleados?: IntFieldUpdateOperationsInput | number
    estado?: StringFieldUpdateOperationsInput | string
    elaborado_por?: StringFieldUpdateOperationsInput | string
    autorizado_por?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_autorizacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PreNominaDetalleCreateInput = {
    id_detalle?: string
    tenant_id: string
    proyecto_id: string
    dias_trabajados: Decimal | DecimalJsLike | number | string
    horas_extra?: Decimal | DecimalJsLike | number | string
    salario_base: Decimal | DecimalJsLike | number | string
    monto_horas_extra?: Decimal | DecimalJsLike | number | string
    bonos?: Decimal | DecimalJsLike | number | string
    total_percepciones: Decimal | DecimalJsLike | number | string
    deduccion_imss?: Decimal | DecimalJsLike | number | string
    deduccion_isr?: Decimal | DecimalJsLike | number | string
    otras_deducciones?: Decimal | DecimalJsLike | number | string
    total_deducciones?: Decimal | DecimalJsLike | number | string
    neto_a_pagar: Decimal | DecimalJsLike | number | string
    prenomina: PreNominaCreateNestedOneWithoutDetallesInput
    empleado: EmpleadoCreateNestedOneWithoutPrenominasInput
  }

  export type PreNominaDetalleUncheckedCreateInput = {
    id_detalle?: string
    tenant_id: string
    proyecto_id: string
    prenomina_id: string
    empleado_id: string
    dias_trabajados: Decimal | DecimalJsLike | number | string
    horas_extra?: Decimal | DecimalJsLike | number | string
    salario_base: Decimal | DecimalJsLike | number | string
    monto_horas_extra?: Decimal | DecimalJsLike | number | string
    bonos?: Decimal | DecimalJsLike | number | string
    total_percepciones: Decimal | DecimalJsLike | number | string
    deduccion_imss?: Decimal | DecimalJsLike | number | string
    deduccion_isr?: Decimal | DecimalJsLike | number | string
    otras_deducciones?: Decimal | DecimalJsLike | number | string
    total_deducciones?: Decimal | DecimalJsLike | number | string
    neto_a_pagar: Decimal | DecimalJsLike | number | string
  }

  export type PreNominaDetalleUpdateInput = {
    id_detalle?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    dias_trabajados?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    horas_extra?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    salario_base?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_horas_extra?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    bonos?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total_percepciones?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    deduccion_imss?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    deduccion_isr?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    otras_deducciones?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total_deducciones?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    neto_a_pagar?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    prenomina?: PreNominaUpdateOneRequiredWithoutDetallesNestedInput
    empleado?: EmpleadoUpdateOneRequiredWithoutPrenominasNestedInput
  }

  export type PreNominaDetalleUncheckedUpdateInput = {
    id_detalle?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    prenomina_id?: StringFieldUpdateOperationsInput | string
    empleado_id?: StringFieldUpdateOperationsInput | string
    dias_trabajados?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    horas_extra?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    salario_base?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_horas_extra?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    bonos?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total_percepciones?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    deduccion_imss?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    deduccion_isr?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    otras_deducciones?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total_deducciones?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    neto_a_pagar?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
  }

  export type PreNominaDetalleCreateManyInput = {
    id_detalle?: string
    tenant_id: string
    proyecto_id: string
    prenomina_id: string
    empleado_id: string
    dias_trabajados: Decimal | DecimalJsLike | number | string
    horas_extra?: Decimal | DecimalJsLike | number | string
    salario_base: Decimal | DecimalJsLike | number | string
    monto_horas_extra?: Decimal | DecimalJsLike | number | string
    bonos?: Decimal | DecimalJsLike | number | string
    total_percepciones: Decimal | DecimalJsLike | number | string
    deduccion_imss?: Decimal | DecimalJsLike | number | string
    deduccion_isr?: Decimal | DecimalJsLike | number | string
    otras_deducciones?: Decimal | DecimalJsLike | number | string
    total_deducciones?: Decimal | DecimalJsLike | number | string
    neto_a_pagar: Decimal | DecimalJsLike | number | string
  }

  export type PreNominaDetalleUpdateManyMutationInput = {
    id_detalle?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    dias_trabajados?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    horas_extra?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    salario_base?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_horas_extra?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    bonos?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total_percepciones?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    deduccion_imss?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    deduccion_isr?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    otras_deducciones?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total_deducciones?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    neto_a_pagar?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
  }

  export type PreNominaDetalleUncheckedUpdateManyInput = {
    id_detalle?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    prenomina_id?: StringFieldUpdateOperationsInput | string
    empleado_id?: StringFieldUpdateOperationsInput | string
    dias_trabajados?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    horas_extra?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    salario_base?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_horas_extra?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    bonos?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total_percepciones?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    deduccion_imss?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    deduccion_isr?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    otras_deducciones?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total_deducciones?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    neto_a_pagar?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
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

  export type CuadrillaNullableRelationFilter = {
    is?: CuadrillaWhereInput | null
    isNot?: CuadrillaWhereInput | null
  }

  export type AsignacionFrenteListRelationFilter = {
    every?: AsignacionFrenteWhereInput
    some?: AsignacionFrenteWhereInput
    none?: AsignacionFrenteWhereInput
  }

  export type PreNominaDetalleListRelationFilter = {
    every?: PreNominaDetalleWhereInput
    some?: PreNominaDetalleWhereInput
    none?: PreNominaDetalleWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type AsignacionFrenteOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PreNominaDetalleOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type EmpleadoTenant_idNumero_empleadoCompoundUniqueInput = {
    tenant_id: string
    numero_empleado: string
  }

  export type EmpleadoTenant_idRfcCompoundUniqueInput = {
    tenant_id: string
    rfc: string
  }

  export type EmpleadoCountOrderByAggregateInput = {
    id_empleado?: SortOrder
    tenant_id?: SortOrder
    numero_empleado?: SortOrder
    nombre?: SortOrder
    apellido_paterno?: SortOrder
    apellido_materno?: SortOrder
    rfc?: SortOrder
    curp?: SortOrder
    nss?: SortOrder
    puesto?: SortOrder
    categoria?: SortOrder
    tipo_contrato?: SortOrder
    fecha_ingreso?: SortOrder
    fecha_baja?: SortOrder
    salario_diario?: SortOrder
    salario_integrado?: SortOrder
    telefono?: SortOrder
    email?: SortOrder
    contacto_emergencia?: SortOrder
    certificaciones?: SortOrder
    estado?: SortOrder
    cuadrilla_id?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type EmpleadoAvgOrderByAggregateInput = {
    salario_diario?: SortOrder
    salario_integrado?: SortOrder
  }

  export type EmpleadoMaxOrderByAggregateInput = {
    id_empleado?: SortOrder
    tenant_id?: SortOrder
    numero_empleado?: SortOrder
    nombre?: SortOrder
    apellido_paterno?: SortOrder
    apellido_materno?: SortOrder
    rfc?: SortOrder
    curp?: SortOrder
    nss?: SortOrder
    puesto?: SortOrder
    categoria?: SortOrder
    tipo_contrato?: SortOrder
    fecha_ingreso?: SortOrder
    fecha_baja?: SortOrder
    salario_diario?: SortOrder
    salario_integrado?: SortOrder
    telefono?: SortOrder
    email?: SortOrder
    contacto_emergencia?: SortOrder
    certificaciones?: SortOrder
    estado?: SortOrder
    cuadrilla_id?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type EmpleadoMinOrderByAggregateInput = {
    id_empleado?: SortOrder
    tenant_id?: SortOrder
    numero_empleado?: SortOrder
    nombre?: SortOrder
    apellido_paterno?: SortOrder
    apellido_materno?: SortOrder
    rfc?: SortOrder
    curp?: SortOrder
    nss?: SortOrder
    puesto?: SortOrder
    categoria?: SortOrder
    tipo_contrato?: SortOrder
    fecha_ingreso?: SortOrder
    fecha_baja?: SortOrder
    salario_diario?: SortOrder
    salario_integrado?: SortOrder
    telefono?: SortOrder
    email?: SortOrder
    contacto_emergencia?: SortOrder
    certificaciones?: SortOrder
    estado?: SortOrder
    cuadrilla_id?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type EmpleadoSumOrderByAggregateInput = {
    salario_diario?: SortOrder
    salario_integrado?: SortOrder
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

  export type EmpleadoListRelationFilter = {
    every?: EmpleadoWhereInput
    some?: EmpleadoWhereInput
    none?: EmpleadoWhereInput
  }

  export type EmpleadoOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CuadrillaTenant_idProyecto_idCodigoCompoundUniqueInput = {
    tenant_id: string
    proyecto_id: string
    codigo: string
  }

  export type CuadrillaCountOrderByAggregateInput = {
    id_cuadrilla?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    nombre?: SortOrder
    codigo?: SortOrder
    especialidad?: SortOrder
    capataz_id?: SortOrder
    capataz_nombre?: SortOrder
    estado?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type CuadrillaMaxOrderByAggregateInput = {
    id_cuadrilla?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    nombre?: SortOrder
    codigo?: SortOrder
    especialidad?: SortOrder
    capataz_id?: SortOrder
    capataz_nombre?: SortOrder
    estado?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type CuadrillaMinOrderByAggregateInput = {
    id_cuadrilla?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    nombre?: SortOrder
    codigo?: SortOrder
    especialidad?: SortOrder
    capataz_id?: SortOrder
    capataz_nombre?: SortOrder
    estado?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type EmpleadoRelationFilter = {
    is?: EmpleadoWhereInput
    isNot?: EmpleadoWhereInput
  }

  export type AsignacionFrenteCountOrderByAggregateInput = {
    id_asignacion?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    empleado_id?: SortOrder
    cuadrilla_id?: SortOrder
    frente_trabajo?: SortOrder
    turno?: SortOrder
    fecha_inicio?: SortOrder
    fecha_fin?: SortOrder
    horas_diarias?: SortOrder
    estado?: SortOrder
    created_at?: SortOrder
  }

  export type AsignacionFrenteAvgOrderByAggregateInput = {
    horas_diarias?: SortOrder
  }

  export type AsignacionFrenteMaxOrderByAggregateInput = {
    id_asignacion?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    empleado_id?: SortOrder
    cuadrilla_id?: SortOrder
    frente_trabajo?: SortOrder
    turno?: SortOrder
    fecha_inicio?: SortOrder
    fecha_fin?: SortOrder
    horas_diarias?: SortOrder
    estado?: SortOrder
    created_at?: SortOrder
  }

  export type AsignacionFrenteMinOrderByAggregateInput = {
    id_asignacion?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    empleado_id?: SortOrder
    cuadrilla_id?: SortOrder
    frente_trabajo?: SortOrder
    turno?: SortOrder
    fecha_inicio?: SortOrder
    fecha_fin?: SortOrder
    horas_diarias?: SortOrder
    estado?: SortOrder
    created_at?: SortOrder
  }

  export type AsignacionFrenteSumOrderByAggregateInput = {
    horas_diarias?: SortOrder
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

  export type PreNominaTenant_idCodigoCompoundUniqueInput = {
    tenant_id: string
    codigo: string
  }

  export type PreNominaCountOrderByAggregateInput = {
    id_prenomina?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    codigo?: SortOrder
    periodo_tipo?: SortOrder
    periodo_inicio?: SortOrder
    periodo_fin?: SortOrder
    total_percepciones?: SortOrder
    total_deducciones?: SortOrder
    total_neto?: SortOrder
    total_empleados?: SortOrder
    estado?: SortOrder
    elaborado_por?: SortOrder
    autorizado_por?: SortOrder
    fecha_autorizacion?: SortOrder
    notas?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type PreNominaAvgOrderByAggregateInput = {
    total_percepciones?: SortOrder
    total_deducciones?: SortOrder
    total_neto?: SortOrder
    total_empleados?: SortOrder
  }

  export type PreNominaMaxOrderByAggregateInput = {
    id_prenomina?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    codigo?: SortOrder
    periodo_tipo?: SortOrder
    periodo_inicio?: SortOrder
    periodo_fin?: SortOrder
    total_percepciones?: SortOrder
    total_deducciones?: SortOrder
    total_neto?: SortOrder
    total_empleados?: SortOrder
    estado?: SortOrder
    elaborado_por?: SortOrder
    autorizado_por?: SortOrder
    fecha_autorizacion?: SortOrder
    notas?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type PreNominaMinOrderByAggregateInput = {
    id_prenomina?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    codigo?: SortOrder
    periodo_tipo?: SortOrder
    periodo_inicio?: SortOrder
    periodo_fin?: SortOrder
    total_percepciones?: SortOrder
    total_deducciones?: SortOrder
    total_neto?: SortOrder
    total_empleados?: SortOrder
    estado?: SortOrder
    elaborado_por?: SortOrder
    autorizado_por?: SortOrder
    fecha_autorizacion?: SortOrder
    notas?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type PreNominaSumOrderByAggregateInput = {
    total_percepciones?: SortOrder
    total_deducciones?: SortOrder
    total_neto?: SortOrder
    total_empleados?: SortOrder
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

  export type PreNominaRelationFilter = {
    is?: PreNominaWhereInput
    isNot?: PreNominaWhereInput
  }

  export type PreNominaDetalleCountOrderByAggregateInput = {
    id_detalle?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    prenomina_id?: SortOrder
    empleado_id?: SortOrder
    dias_trabajados?: SortOrder
    horas_extra?: SortOrder
    salario_base?: SortOrder
    monto_horas_extra?: SortOrder
    bonos?: SortOrder
    total_percepciones?: SortOrder
    deduccion_imss?: SortOrder
    deduccion_isr?: SortOrder
    otras_deducciones?: SortOrder
    total_deducciones?: SortOrder
    neto_a_pagar?: SortOrder
  }

  export type PreNominaDetalleAvgOrderByAggregateInput = {
    dias_trabajados?: SortOrder
    horas_extra?: SortOrder
    salario_base?: SortOrder
    monto_horas_extra?: SortOrder
    bonos?: SortOrder
    total_percepciones?: SortOrder
    deduccion_imss?: SortOrder
    deduccion_isr?: SortOrder
    otras_deducciones?: SortOrder
    total_deducciones?: SortOrder
    neto_a_pagar?: SortOrder
  }

  export type PreNominaDetalleMaxOrderByAggregateInput = {
    id_detalle?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    prenomina_id?: SortOrder
    empleado_id?: SortOrder
    dias_trabajados?: SortOrder
    horas_extra?: SortOrder
    salario_base?: SortOrder
    monto_horas_extra?: SortOrder
    bonos?: SortOrder
    total_percepciones?: SortOrder
    deduccion_imss?: SortOrder
    deduccion_isr?: SortOrder
    otras_deducciones?: SortOrder
    total_deducciones?: SortOrder
    neto_a_pagar?: SortOrder
  }

  export type PreNominaDetalleMinOrderByAggregateInput = {
    id_detalle?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    prenomina_id?: SortOrder
    empleado_id?: SortOrder
    dias_trabajados?: SortOrder
    horas_extra?: SortOrder
    salario_base?: SortOrder
    monto_horas_extra?: SortOrder
    bonos?: SortOrder
    total_percepciones?: SortOrder
    deduccion_imss?: SortOrder
    deduccion_isr?: SortOrder
    otras_deducciones?: SortOrder
    total_deducciones?: SortOrder
    neto_a_pagar?: SortOrder
  }

  export type PreNominaDetalleSumOrderByAggregateInput = {
    dias_trabajados?: SortOrder
    horas_extra?: SortOrder
    salario_base?: SortOrder
    monto_horas_extra?: SortOrder
    bonos?: SortOrder
    total_percepciones?: SortOrder
    deduccion_imss?: SortOrder
    deduccion_isr?: SortOrder
    otras_deducciones?: SortOrder
    total_deducciones?: SortOrder
    neto_a_pagar?: SortOrder
  }

  export type CuadrillaCreateNestedOneWithoutMiembrosInput = {
    create?: XOR<CuadrillaCreateWithoutMiembrosInput, CuadrillaUncheckedCreateWithoutMiembrosInput>
    connectOrCreate?: CuadrillaCreateOrConnectWithoutMiembrosInput
    connect?: CuadrillaWhereUniqueInput
  }

  export type AsignacionFrenteCreateNestedManyWithoutEmpleadoInput = {
    create?: XOR<AsignacionFrenteCreateWithoutEmpleadoInput, AsignacionFrenteUncheckedCreateWithoutEmpleadoInput> | AsignacionFrenteCreateWithoutEmpleadoInput[] | AsignacionFrenteUncheckedCreateWithoutEmpleadoInput[]
    connectOrCreate?: AsignacionFrenteCreateOrConnectWithoutEmpleadoInput | AsignacionFrenteCreateOrConnectWithoutEmpleadoInput[]
    createMany?: AsignacionFrenteCreateManyEmpleadoInputEnvelope
    connect?: AsignacionFrenteWhereUniqueInput | AsignacionFrenteWhereUniqueInput[]
  }

  export type PreNominaDetalleCreateNestedManyWithoutEmpleadoInput = {
    create?: XOR<PreNominaDetalleCreateWithoutEmpleadoInput, PreNominaDetalleUncheckedCreateWithoutEmpleadoInput> | PreNominaDetalleCreateWithoutEmpleadoInput[] | PreNominaDetalleUncheckedCreateWithoutEmpleadoInput[]
    connectOrCreate?: PreNominaDetalleCreateOrConnectWithoutEmpleadoInput | PreNominaDetalleCreateOrConnectWithoutEmpleadoInput[]
    createMany?: PreNominaDetalleCreateManyEmpleadoInputEnvelope
    connect?: PreNominaDetalleWhereUniqueInput | PreNominaDetalleWhereUniqueInput[]
  }

  export type AsignacionFrenteUncheckedCreateNestedManyWithoutEmpleadoInput = {
    create?: XOR<AsignacionFrenteCreateWithoutEmpleadoInput, AsignacionFrenteUncheckedCreateWithoutEmpleadoInput> | AsignacionFrenteCreateWithoutEmpleadoInput[] | AsignacionFrenteUncheckedCreateWithoutEmpleadoInput[]
    connectOrCreate?: AsignacionFrenteCreateOrConnectWithoutEmpleadoInput | AsignacionFrenteCreateOrConnectWithoutEmpleadoInput[]
    createMany?: AsignacionFrenteCreateManyEmpleadoInputEnvelope
    connect?: AsignacionFrenteWhereUniqueInput | AsignacionFrenteWhereUniqueInput[]
  }

  export type PreNominaDetalleUncheckedCreateNestedManyWithoutEmpleadoInput = {
    create?: XOR<PreNominaDetalleCreateWithoutEmpleadoInput, PreNominaDetalleUncheckedCreateWithoutEmpleadoInput> | PreNominaDetalleCreateWithoutEmpleadoInput[] | PreNominaDetalleUncheckedCreateWithoutEmpleadoInput[]
    connectOrCreate?: PreNominaDetalleCreateOrConnectWithoutEmpleadoInput | PreNominaDetalleCreateOrConnectWithoutEmpleadoInput[]
    createMany?: PreNominaDetalleCreateManyEmpleadoInputEnvelope
    connect?: PreNominaDetalleWhereUniqueInput | PreNominaDetalleWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
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

  export type CuadrillaUpdateOneWithoutMiembrosNestedInput = {
    create?: XOR<CuadrillaCreateWithoutMiembrosInput, CuadrillaUncheckedCreateWithoutMiembrosInput>
    connectOrCreate?: CuadrillaCreateOrConnectWithoutMiembrosInput
    upsert?: CuadrillaUpsertWithoutMiembrosInput
    disconnect?: CuadrillaWhereInput | boolean
    delete?: CuadrillaWhereInput | boolean
    connect?: CuadrillaWhereUniqueInput
    update?: XOR<XOR<CuadrillaUpdateToOneWithWhereWithoutMiembrosInput, CuadrillaUpdateWithoutMiembrosInput>, CuadrillaUncheckedUpdateWithoutMiembrosInput>
  }

  export type AsignacionFrenteUpdateManyWithoutEmpleadoNestedInput = {
    create?: XOR<AsignacionFrenteCreateWithoutEmpleadoInput, AsignacionFrenteUncheckedCreateWithoutEmpleadoInput> | AsignacionFrenteCreateWithoutEmpleadoInput[] | AsignacionFrenteUncheckedCreateWithoutEmpleadoInput[]
    connectOrCreate?: AsignacionFrenteCreateOrConnectWithoutEmpleadoInput | AsignacionFrenteCreateOrConnectWithoutEmpleadoInput[]
    upsert?: AsignacionFrenteUpsertWithWhereUniqueWithoutEmpleadoInput | AsignacionFrenteUpsertWithWhereUniqueWithoutEmpleadoInput[]
    createMany?: AsignacionFrenteCreateManyEmpleadoInputEnvelope
    set?: AsignacionFrenteWhereUniqueInput | AsignacionFrenteWhereUniqueInput[]
    disconnect?: AsignacionFrenteWhereUniqueInput | AsignacionFrenteWhereUniqueInput[]
    delete?: AsignacionFrenteWhereUniqueInput | AsignacionFrenteWhereUniqueInput[]
    connect?: AsignacionFrenteWhereUniqueInput | AsignacionFrenteWhereUniqueInput[]
    update?: AsignacionFrenteUpdateWithWhereUniqueWithoutEmpleadoInput | AsignacionFrenteUpdateWithWhereUniqueWithoutEmpleadoInput[]
    updateMany?: AsignacionFrenteUpdateManyWithWhereWithoutEmpleadoInput | AsignacionFrenteUpdateManyWithWhereWithoutEmpleadoInput[]
    deleteMany?: AsignacionFrenteScalarWhereInput | AsignacionFrenteScalarWhereInput[]
  }

  export type PreNominaDetalleUpdateManyWithoutEmpleadoNestedInput = {
    create?: XOR<PreNominaDetalleCreateWithoutEmpleadoInput, PreNominaDetalleUncheckedCreateWithoutEmpleadoInput> | PreNominaDetalleCreateWithoutEmpleadoInput[] | PreNominaDetalleUncheckedCreateWithoutEmpleadoInput[]
    connectOrCreate?: PreNominaDetalleCreateOrConnectWithoutEmpleadoInput | PreNominaDetalleCreateOrConnectWithoutEmpleadoInput[]
    upsert?: PreNominaDetalleUpsertWithWhereUniqueWithoutEmpleadoInput | PreNominaDetalleUpsertWithWhereUniqueWithoutEmpleadoInput[]
    createMany?: PreNominaDetalleCreateManyEmpleadoInputEnvelope
    set?: PreNominaDetalleWhereUniqueInput | PreNominaDetalleWhereUniqueInput[]
    disconnect?: PreNominaDetalleWhereUniqueInput | PreNominaDetalleWhereUniqueInput[]
    delete?: PreNominaDetalleWhereUniqueInput | PreNominaDetalleWhereUniqueInput[]
    connect?: PreNominaDetalleWhereUniqueInput | PreNominaDetalleWhereUniqueInput[]
    update?: PreNominaDetalleUpdateWithWhereUniqueWithoutEmpleadoInput | PreNominaDetalleUpdateWithWhereUniqueWithoutEmpleadoInput[]
    updateMany?: PreNominaDetalleUpdateManyWithWhereWithoutEmpleadoInput | PreNominaDetalleUpdateManyWithWhereWithoutEmpleadoInput[]
    deleteMany?: PreNominaDetalleScalarWhereInput | PreNominaDetalleScalarWhereInput[]
  }

  export type AsignacionFrenteUncheckedUpdateManyWithoutEmpleadoNestedInput = {
    create?: XOR<AsignacionFrenteCreateWithoutEmpleadoInput, AsignacionFrenteUncheckedCreateWithoutEmpleadoInput> | AsignacionFrenteCreateWithoutEmpleadoInput[] | AsignacionFrenteUncheckedCreateWithoutEmpleadoInput[]
    connectOrCreate?: AsignacionFrenteCreateOrConnectWithoutEmpleadoInput | AsignacionFrenteCreateOrConnectWithoutEmpleadoInput[]
    upsert?: AsignacionFrenteUpsertWithWhereUniqueWithoutEmpleadoInput | AsignacionFrenteUpsertWithWhereUniqueWithoutEmpleadoInput[]
    createMany?: AsignacionFrenteCreateManyEmpleadoInputEnvelope
    set?: AsignacionFrenteWhereUniqueInput | AsignacionFrenteWhereUniqueInput[]
    disconnect?: AsignacionFrenteWhereUniqueInput | AsignacionFrenteWhereUniqueInput[]
    delete?: AsignacionFrenteWhereUniqueInput | AsignacionFrenteWhereUniqueInput[]
    connect?: AsignacionFrenteWhereUniqueInput | AsignacionFrenteWhereUniqueInput[]
    update?: AsignacionFrenteUpdateWithWhereUniqueWithoutEmpleadoInput | AsignacionFrenteUpdateWithWhereUniqueWithoutEmpleadoInput[]
    updateMany?: AsignacionFrenteUpdateManyWithWhereWithoutEmpleadoInput | AsignacionFrenteUpdateManyWithWhereWithoutEmpleadoInput[]
    deleteMany?: AsignacionFrenteScalarWhereInput | AsignacionFrenteScalarWhereInput[]
  }

  export type PreNominaDetalleUncheckedUpdateManyWithoutEmpleadoNestedInput = {
    create?: XOR<PreNominaDetalleCreateWithoutEmpleadoInput, PreNominaDetalleUncheckedCreateWithoutEmpleadoInput> | PreNominaDetalleCreateWithoutEmpleadoInput[] | PreNominaDetalleUncheckedCreateWithoutEmpleadoInput[]
    connectOrCreate?: PreNominaDetalleCreateOrConnectWithoutEmpleadoInput | PreNominaDetalleCreateOrConnectWithoutEmpleadoInput[]
    upsert?: PreNominaDetalleUpsertWithWhereUniqueWithoutEmpleadoInput | PreNominaDetalleUpsertWithWhereUniqueWithoutEmpleadoInput[]
    createMany?: PreNominaDetalleCreateManyEmpleadoInputEnvelope
    set?: PreNominaDetalleWhereUniqueInput | PreNominaDetalleWhereUniqueInput[]
    disconnect?: PreNominaDetalleWhereUniqueInput | PreNominaDetalleWhereUniqueInput[]
    delete?: PreNominaDetalleWhereUniqueInput | PreNominaDetalleWhereUniqueInput[]
    connect?: PreNominaDetalleWhereUniqueInput | PreNominaDetalleWhereUniqueInput[]
    update?: PreNominaDetalleUpdateWithWhereUniqueWithoutEmpleadoInput | PreNominaDetalleUpdateWithWhereUniqueWithoutEmpleadoInput[]
    updateMany?: PreNominaDetalleUpdateManyWithWhereWithoutEmpleadoInput | PreNominaDetalleUpdateManyWithWhereWithoutEmpleadoInput[]
    deleteMany?: PreNominaDetalleScalarWhereInput | PreNominaDetalleScalarWhereInput[]
  }

  export type EmpleadoCreateNestedManyWithoutCuadrillaInput = {
    create?: XOR<EmpleadoCreateWithoutCuadrillaInput, EmpleadoUncheckedCreateWithoutCuadrillaInput> | EmpleadoCreateWithoutCuadrillaInput[] | EmpleadoUncheckedCreateWithoutCuadrillaInput[]
    connectOrCreate?: EmpleadoCreateOrConnectWithoutCuadrillaInput | EmpleadoCreateOrConnectWithoutCuadrillaInput[]
    createMany?: EmpleadoCreateManyCuadrillaInputEnvelope
    connect?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
  }

  export type AsignacionFrenteCreateNestedManyWithoutCuadrillaInput = {
    create?: XOR<AsignacionFrenteCreateWithoutCuadrillaInput, AsignacionFrenteUncheckedCreateWithoutCuadrillaInput> | AsignacionFrenteCreateWithoutCuadrillaInput[] | AsignacionFrenteUncheckedCreateWithoutCuadrillaInput[]
    connectOrCreate?: AsignacionFrenteCreateOrConnectWithoutCuadrillaInput | AsignacionFrenteCreateOrConnectWithoutCuadrillaInput[]
    createMany?: AsignacionFrenteCreateManyCuadrillaInputEnvelope
    connect?: AsignacionFrenteWhereUniqueInput | AsignacionFrenteWhereUniqueInput[]
  }

  export type EmpleadoUncheckedCreateNestedManyWithoutCuadrillaInput = {
    create?: XOR<EmpleadoCreateWithoutCuadrillaInput, EmpleadoUncheckedCreateWithoutCuadrillaInput> | EmpleadoCreateWithoutCuadrillaInput[] | EmpleadoUncheckedCreateWithoutCuadrillaInput[]
    connectOrCreate?: EmpleadoCreateOrConnectWithoutCuadrillaInput | EmpleadoCreateOrConnectWithoutCuadrillaInput[]
    createMany?: EmpleadoCreateManyCuadrillaInputEnvelope
    connect?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
  }

  export type AsignacionFrenteUncheckedCreateNestedManyWithoutCuadrillaInput = {
    create?: XOR<AsignacionFrenteCreateWithoutCuadrillaInput, AsignacionFrenteUncheckedCreateWithoutCuadrillaInput> | AsignacionFrenteCreateWithoutCuadrillaInput[] | AsignacionFrenteUncheckedCreateWithoutCuadrillaInput[]
    connectOrCreate?: AsignacionFrenteCreateOrConnectWithoutCuadrillaInput | AsignacionFrenteCreateOrConnectWithoutCuadrillaInput[]
    createMany?: AsignacionFrenteCreateManyCuadrillaInputEnvelope
    connect?: AsignacionFrenteWhereUniqueInput | AsignacionFrenteWhereUniqueInput[]
  }

  export type EmpleadoUpdateManyWithoutCuadrillaNestedInput = {
    create?: XOR<EmpleadoCreateWithoutCuadrillaInput, EmpleadoUncheckedCreateWithoutCuadrillaInput> | EmpleadoCreateWithoutCuadrillaInput[] | EmpleadoUncheckedCreateWithoutCuadrillaInput[]
    connectOrCreate?: EmpleadoCreateOrConnectWithoutCuadrillaInput | EmpleadoCreateOrConnectWithoutCuadrillaInput[]
    upsert?: EmpleadoUpsertWithWhereUniqueWithoutCuadrillaInput | EmpleadoUpsertWithWhereUniqueWithoutCuadrillaInput[]
    createMany?: EmpleadoCreateManyCuadrillaInputEnvelope
    set?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
    disconnect?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
    delete?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
    connect?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
    update?: EmpleadoUpdateWithWhereUniqueWithoutCuadrillaInput | EmpleadoUpdateWithWhereUniqueWithoutCuadrillaInput[]
    updateMany?: EmpleadoUpdateManyWithWhereWithoutCuadrillaInput | EmpleadoUpdateManyWithWhereWithoutCuadrillaInput[]
    deleteMany?: EmpleadoScalarWhereInput | EmpleadoScalarWhereInput[]
  }

  export type AsignacionFrenteUpdateManyWithoutCuadrillaNestedInput = {
    create?: XOR<AsignacionFrenteCreateWithoutCuadrillaInput, AsignacionFrenteUncheckedCreateWithoutCuadrillaInput> | AsignacionFrenteCreateWithoutCuadrillaInput[] | AsignacionFrenteUncheckedCreateWithoutCuadrillaInput[]
    connectOrCreate?: AsignacionFrenteCreateOrConnectWithoutCuadrillaInput | AsignacionFrenteCreateOrConnectWithoutCuadrillaInput[]
    upsert?: AsignacionFrenteUpsertWithWhereUniqueWithoutCuadrillaInput | AsignacionFrenteUpsertWithWhereUniqueWithoutCuadrillaInput[]
    createMany?: AsignacionFrenteCreateManyCuadrillaInputEnvelope
    set?: AsignacionFrenteWhereUniqueInput | AsignacionFrenteWhereUniqueInput[]
    disconnect?: AsignacionFrenteWhereUniqueInput | AsignacionFrenteWhereUniqueInput[]
    delete?: AsignacionFrenteWhereUniqueInput | AsignacionFrenteWhereUniqueInput[]
    connect?: AsignacionFrenteWhereUniqueInput | AsignacionFrenteWhereUniqueInput[]
    update?: AsignacionFrenteUpdateWithWhereUniqueWithoutCuadrillaInput | AsignacionFrenteUpdateWithWhereUniqueWithoutCuadrillaInput[]
    updateMany?: AsignacionFrenteUpdateManyWithWhereWithoutCuadrillaInput | AsignacionFrenteUpdateManyWithWhereWithoutCuadrillaInput[]
    deleteMany?: AsignacionFrenteScalarWhereInput | AsignacionFrenteScalarWhereInput[]
  }

  export type EmpleadoUncheckedUpdateManyWithoutCuadrillaNestedInput = {
    create?: XOR<EmpleadoCreateWithoutCuadrillaInput, EmpleadoUncheckedCreateWithoutCuadrillaInput> | EmpleadoCreateWithoutCuadrillaInput[] | EmpleadoUncheckedCreateWithoutCuadrillaInput[]
    connectOrCreate?: EmpleadoCreateOrConnectWithoutCuadrillaInput | EmpleadoCreateOrConnectWithoutCuadrillaInput[]
    upsert?: EmpleadoUpsertWithWhereUniqueWithoutCuadrillaInput | EmpleadoUpsertWithWhereUniqueWithoutCuadrillaInput[]
    createMany?: EmpleadoCreateManyCuadrillaInputEnvelope
    set?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
    disconnect?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
    delete?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
    connect?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
    update?: EmpleadoUpdateWithWhereUniqueWithoutCuadrillaInput | EmpleadoUpdateWithWhereUniqueWithoutCuadrillaInput[]
    updateMany?: EmpleadoUpdateManyWithWhereWithoutCuadrillaInput | EmpleadoUpdateManyWithWhereWithoutCuadrillaInput[]
    deleteMany?: EmpleadoScalarWhereInput | EmpleadoScalarWhereInput[]
  }

  export type AsignacionFrenteUncheckedUpdateManyWithoutCuadrillaNestedInput = {
    create?: XOR<AsignacionFrenteCreateWithoutCuadrillaInput, AsignacionFrenteUncheckedCreateWithoutCuadrillaInput> | AsignacionFrenteCreateWithoutCuadrillaInput[] | AsignacionFrenteUncheckedCreateWithoutCuadrillaInput[]
    connectOrCreate?: AsignacionFrenteCreateOrConnectWithoutCuadrillaInput | AsignacionFrenteCreateOrConnectWithoutCuadrillaInput[]
    upsert?: AsignacionFrenteUpsertWithWhereUniqueWithoutCuadrillaInput | AsignacionFrenteUpsertWithWhereUniqueWithoutCuadrillaInput[]
    createMany?: AsignacionFrenteCreateManyCuadrillaInputEnvelope
    set?: AsignacionFrenteWhereUniqueInput | AsignacionFrenteWhereUniqueInput[]
    disconnect?: AsignacionFrenteWhereUniqueInput | AsignacionFrenteWhereUniqueInput[]
    delete?: AsignacionFrenteWhereUniqueInput | AsignacionFrenteWhereUniqueInput[]
    connect?: AsignacionFrenteWhereUniqueInput | AsignacionFrenteWhereUniqueInput[]
    update?: AsignacionFrenteUpdateWithWhereUniqueWithoutCuadrillaInput | AsignacionFrenteUpdateWithWhereUniqueWithoutCuadrillaInput[]
    updateMany?: AsignacionFrenteUpdateManyWithWhereWithoutCuadrillaInput | AsignacionFrenteUpdateManyWithWhereWithoutCuadrillaInput[]
    deleteMany?: AsignacionFrenteScalarWhereInput | AsignacionFrenteScalarWhereInput[]
  }

  export type EmpleadoCreateNestedOneWithoutAsignacionesInput = {
    create?: XOR<EmpleadoCreateWithoutAsignacionesInput, EmpleadoUncheckedCreateWithoutAsignacionesInput>
    connectOrCreate?: EmpleadoCreateOrConnectWithoutAsignacionesInput
    connect?: EmpleadoWhereUniqueInput
  }

  export type CuadrillaCreateNestedOneWithoutAsignacionesInput = {
    create?: XOR<CuadrillaCreateWithoutAsignacionesInput, CuadrillaUncheckedCreateWithoutAsignacionesInput>
    connectOrCreate?: CuadrillaCreateOrConnectWithoutAsignacionesInput
    connect?: CuadrillaWhereUniqueInput
  }

  export type EmpleadoUpdateOneRequiredWithoutAsignacionesNestedInput = {
    create?: XOR<EmpleadoCreateWithoutAsignacionesInput, EmpleadoUncheckedCreateWithoutAsignacionesInput>
    connectOrCreate?: EmpleadoCreateOrConnectWithoutAsignacionesInput
    upsert?: EmpleadoUpsertWithoutAsignacionesInput
    connect?: EmpleadoWhereUniqueInput
    update?: XOR<XOR<EmpleadoUpdateToOneWithWhereWithoutAsignacionesInput, EmpleadoUpdateWithoutAsignacionesInput>, EmpleadoUncheckedUpdateWithoutAsignacionesInput>
  }

  export type CuadrillaUpdateOneWithoutAsignacionesNestedInput = {
    create?: XOR<CuadrillaCreateWithoutAsignacionesInput, CuadrillaUncheckedCreateWithoutAsignacionesInput>
    connectOrCreate?: CuadrillaCreateOrConnectWithoutAsignacionesInput
    upsert?: CuadrillaUpsertWithoutAsignacionesInput
    disconnect?: CuadrillaWhereInput | boolean
    delete?: CuadrillaWhereInput | boolean
    connect?: CuadrillaWhereUniqueInput
    update?: XOR<XOR<CuadrillaUpdateToOneWithWhereWithoutAsignacionesInput, CuadrillaUpdateWithoutAsignacionesInput>, CuadrillaUncheckedUpdateWithoutAsignacionesInput>
  }

  export type PreNominaDetalleCreateNestedManyWithoutPrenominaInput = {
    create?: XOR<PreNominaDetalleCreateWithoutPrenominaInput, PreNominaDetalleUncheckedCreateWithoutPrenominaInput> | PreNominaDetalleCreateWithoutPrenominaInput[] | PreNominaDetalleUncheckedCreateWithoutPrenominaInput[]
    connectOrCreate?: PreNominaDetalleCreateOrConnectWithoutPrenominaInput | PreNominaDetalleCreateOrConnectWithoutPrenominaInput[]
    createMany?: PreNominaDetalleCreateManyPrenominaInputEnvelope
    connect?: PreNominaDetalleWhereUniqueInput | PreNominaDetalleWhereUniqueInput[]
  }

  export type PreNominaDetalleUncheckedCreateNestedManyWithoutPrenominaInput = {
    create?: XOR<PreNominaDetalleCreateWithoutPrenominaInput, PreNominaDetalleUncheckedCreateWithoutPrenominaInput> | PreNominaDetalleCreateWithoutPrenominaInput[] | PreNominaDetalleUncheckedCreateWithoutPrenominaInput[]
    connectOrCreate?: PreNominaDetalleCreateOrConnectWithoutPrenominaInput | PreNominaDetalleCreateOrConnectWithoutPrenominaInput[]
    createMany?: PreNominaDetalleCreateManyPrenominaInputEnvelope
    connect?: PreNominaDetalleWhereUniqueInput | PreNominaDetalleWhereUniqueInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type PreNominaDetalleUpdateManyWithoutPrenominaNestedInput = {
    create?: XOR<PreNominaDetalleCreateWithoutPrenominaInput, PreNominaDetalleUncheckedCreateWithoutPrenominaInput> | PreNominaDetalleCreateWithoutPrenominaInput[] | PreNominaDetalleUncheckedCreateWithoutPrenominaInput[]
    connectOrCreate?: PreNominaDetalleCreateOrConnectWithoutPrenominaInput | PreNominaDetalleCreateOrConnectWithoutPrenominaInput[]
    upsert?: PreNominaDetalleUpsertWithWhereUniqueWithoutPrenominaInput | PreNominaDetalleUpsertWithWhereUniqueWithoutPrenominaInput[]
    createMany?: PreNominaDetalleCreateManyPrenominaInputEnvelope
    set?: PreNominaDetalleWhereUniqueInput | PreNominaDetalleWhereUniqueInput[]
    disconnect?: PreNominaDetalleWhereUniqueInput | PreNominaDetalleWhereUniqueInput[]
    delete?: PreNominaDetalleWhereUniqueInput | PreNominaDetalleWhereUniqueInput[]
    connect?: PreNominaDetalleWhereUniqueInput | PreNominaDetalleWhereUniqueInput[]
    update?: PreNominaDetalleUpdateWithWhereUniqueWithoutPrenominaInput | PreNominaDetalleUpdateWithWhereUniqueWithoutPrenominaInput[]
    updateMany?: PreNominaDetalleUpdateManyWithWhereWithoutPrenominaInput | PreNominaDetalleUpdateManyWithWhereWithoutPrenominaInput[]
    deleteMany?: PreNominaDetalleScalarWhereInput | PreNominaDetalleScalarWhereInput[]
  }

  export type PreNominaDetalleUncheckedUpdateManyWithoutPrenominaNestedInput = {
    create?: XOR<PreNominaDetalleCreateWithoutPrenominaInput, PreNominaDetalleUncheckedCreateWithoutPrenominaInput> | PreNominaDetalleCreateWithoutPrenominaInput[] | PreNominaDetalleUncheckedCreateWithoutPrenominaInput[]
    connectOrCreate?: PreNominaDetalleCreateOrConnectWithoutPrenominaInput | PreNominaDetalleCreateOrConnectWithoutPrenominaInput[]
    upsert?: PreNominaDetalleUpsertWithWhereUniqueWithoutPrenominaInput | PreNominaDetalleUpsertWithWhereUniqueWithoutPrenominaInput[]
    createMany?: PreNominaDetalleCreateManyPrenominaInputEnvelope
    set?: PreNominaDetalleWhereUniqueInput | PreNominaDetalleWhereUniqueInput[]
    disconnect?: PreNominaDetalleWhereUniqueInput | PreNominaDetalleWhereUniqueInput[]
    delete?: PreNominaDetalleWhereUniqueInput | PreNominaDetalleWhereUniqueInput[]
    connect?: PreNominaDetalleWhereUniqueInput | PreNominaDetalleWhereUniqueInput[]
    update?: PreNominaDetalleUpdateWithWhereUniqueWithoutPrenominaInput | PreNominaDetalleUpdateWithWhereUniqueWithoutPrenominaInput[]
    updateMany?: PreNominaDetalleUpdateManyWithWhereWithoutPrenominaInput | PreNominaDetalleUpdateManyWithWhereWithoutPrenominaInput[]
    deleteMany?: PreNominaDetalleScalarWhereInput | PreNominaDetalleScalarWhereInput[]
  }

  export type PreNominaCreateNestedOneWithoutDetallesInput = {
    create?: XOR<PreNominaCreateWithoutDetallesInput, PreNominaUncheckedCreateWithoutDetallesInput>
    connectOrCreate?: PreNominaCreateOrConnectWithoutDetallesInput
    connect?: PreNominaWhereUniqueInput
  }

  export type EmpleadoCreateNestedOneWithoutPrenominasInput = {
    create?: XOR<EmpleadoCreateWithoutPrenominasInput, EmpleadoUncheckedCreateWithoutPrenominasInput>
    connectOrCreate?: EmpleadoCreateOrConnectWithoutPrenominasInput
    connect?: EmpleadoWhereUniqueInput
  }

  export type PreNominaUpdateOneRequiredWithoutDetallesNestedInput = {
    create?: XOR<PreNominaCreateWithoutDetallesInput, PreNominaUncheckedCreateWithoutDetallesInput>
    connectOrCreate?: PreNominaCreateOrConnectWithoutDetallesInput
    upsert?: PreNominaUpsertWithoutDetallesInput
    connect?: PreNominaWhereUniqueInput
    update?: XOR<XOR<PreNominaUpdateToOneWithWhereWithoutDetallesInput, PreNominaUpdateWithoutDetallesInput>, PreNominaUncheckedUpdateWithoutDetallesInput>
  }

  export type EmpleadoUpdateOneRequiredWithoutPrenominasNestedInput = {
    create?: XOR<EmpleadoCreateWithoutPrenominasInput, EmpleadoUncheckedCreateWithoutPrenominasInput>
    connectOrCreate?: EmpleadoCreateOrConnectWithoutPrenominasInput
    upsert?: EmpleadoUpsertWithoutPrenominasInput
    connect?: EmpleadoWhereUniqueInput
    update?: XOR<XOR<EmpleadoUpdateToOneWithWhereWithoutPrenominasInput, EmpleadoUpdateWithoutPrenominasInput>, EmpleadoUncheckedUpdateWithoutPrenominasInput>
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

  export type CuadrillaCreateWithoutMiembrosInput = {
    id_cuadrilla?: string
    tenant_id: string
    proyecto_id: string
    nombre: string
    codigo: string
    especialidad: string
    capataz_id?: string | null
    capataz_nombre?: string | null
    estado?: string
    created_at?: Date | string
    updated_at?: Date | string
    asignaciones?: AsignacionFrenteCreateNestedManyWithoutCuadrillaInput
  }

  export type CuadrillaUncheckedCreateWithoutMiembrosInput = {
    id_cuadrilla?: string
    tenant_id: string
    proyecto_id: string
    nombre: string
    codigo: string
    especialidad: string
    capataz_id?: string | null
    capataz_nombre?: string | null
    estado?: string
    created_at?: Date | string
    updated_at?: Date | string
    asignaciones?: AsignacionFrenteUncheckedCreateNestedManyWithoutCuadrillaInput
  }

  export type CuadrillaCreateOrConnectWithoutMiembrosInput = {
    where: CuadrillaWhereUniqueInput
    create: XOR<CuadrillaCreateWithoutMiembrosInput, CuadrillaUncheckedCreateWithoutMiembrosInput>
  }

  export type AsignacionFrenteCreateWithoutEmpleadoInput = {
    id_asignacion?: string
    tenant_id: string
    proyecto_id: string
    frente_trabajo: string
    turno?: string
    fecha_inicio: Date | string
    fecha_fin?: Date | string | null
    horas_diarias?: Decimal | DecimalJsLike | number | string
    estado?: string
    created_at?: Date | string
    cuadrilla?: CuadrillaCreateNestedOneWithoutAsignacionesInput
  }

  export type AsignacionFrenteUncheckedCreateWithoutEmpleadoInput = {
    id_asignacion?: string
    tenant_id: string
    proyecto_id: string
    cuadrilla_id?: string | null
    frente_trabajo: string
    turno?: string
    fecha_inicio: Date | string
    fecha_fin?: Date | string | null
    horas_diarias?: Decimal | DecimalJsLike | number | string
    estado?: string
    created_at?: Date | string
  }

  export type AsignacionFrenteCreateOrConnectWithoutEmpleadoInput = {
    where: AsignacionFrenteWhereUniqueInput
    create: XOR<AsignacionFrenteCreateWithoutEmpleadoInput, AsignacionFrenteUncheckedCreateWithoutEmpleadoInput>
  }

  export type AsignacionFrenteCreateManyEmpleadoInputEnvelope = {
    data: AsignacionFrenteCreateManyEmpleadoInput | AsignacionFrenteCreateManyEmpleadoInput[]
    skipDuplicates?: boolean
  }

  export type PreNominaDetalleCreateWithoutEmpleadoInput = {
    id_detalle?: string
    tenant_id: string
    proyecto_id: string
    dias_trabajados: Decimal | DecimalJsLike | number | string
    horas_extra?: Decimal | DecimalJsLike | number | string
    salario_base: Decimal | DecimalJsLike | number | string
    monto_horas_extra?: Decimal | DecimalJsLike | number | string
    bonos?: Decimal | DecimalJsLike | number | string
    total_percepciones: Decimal | DecimalJsLike | number | string
    deduccion_imss?: Decimal | DecimalJsLike | number | string
    deduccion_isr?: Decimal | DecimalJsLike | number | string
    otras_deducciones?: Decimal | DecimalJsLike | number | string
    total_deducciones?: Decimal | DecimalJsLike | number | string
    neto_a_pagar: Decimal | DecimalJsLike | number | string
    prenomina: PreNominaCreateNestedOneWithoutDetallesInput
  }

  export type PreNominaDetalleUncheckedCreateWithoutEmpleadoInput = {
    id_detalle?: string
    tenant_id: string
    proyecto_id: string
    prenomina_id: string
    dias_trabajados: Decimal | DecimalJsLike | number | string
    horas_extra?: Decimal | DecimalJsLike | number | string
    salario_base: Decimal | DecimalJsLike | number | string
    monto_horas_extra?: Decimal | DecimalJsLike | number | string
    bonos?: Decimal | DecimalJsLike | number | string
    total_percepciones: Decimal | DecimalJsLike | number | string
    deduccion_imss?: Decimal | DecimalJsLike | number | string
    deduccion_isr?: Decimal | DecimalJsLike | number | string
    otras_deducciones?: Decimal | DecimalJsLike | number | string
    total_deducciones?: Decimal | DecimalJsLike | number | string
    neto_a_pagar: Decimal | DecimalJsLike | number | string
  }

  export type PreNominaDetalleCreateOrConnectWithoutEmpleadoInput = {
    where: PreNominaDetalleWhereUniqueInput
    create: XOR<PreNominaDetalleCreateWithoutEmpleadoInput, PreNominaDetalleUncheckedCreateWithoutEmpleadoInput>
  }

  export type PreNominaDetalleCreateManyEmpleadoInputEnvelope = {
    data: PreNominaDetalleCreateManyEmpleadoInput | PreNominaDetalleCreateManyEmpleadoInput[]
    skipDuplicates?: boolean
  }

  export type CuadrillaUpsertWithoutMiembrosInput = {
    update: XOR<CuadrillaUpdateWithoutMiembrosInput, CuadrillaUncheckedUpdateWithoutMiembrosInput>
    create: XOR<CuadrillaCreateWithoutMiembrosInput, CuadrillaUncheckedCreateWithoutMiembrosInput>
    where?: CuadrillaWhereInput
  }

  export type CuadrillaUpdateToOneWithWhereWithoutMiembrosInput = {
    where?: CuadrillaWhereInput
    data: XOR<CuadrillaUpdateWithoutMiembrosInput, CuadrillaUncheckedUpdateWithoutMiembrosInput>
  }

  export type CuadrillaUpdateWithoutMiembrosInput = {
    id_cuadrilla?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    especialidad?: StringFieldUpdateOperationsInput | string
    capataz_id?: NullableStringFieldUpdateOperationsInput | string | null
    capataz_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    asignaciones?: AsignacionFrenteUpdateManyWithoutCuadrillaNestedInput
  }

  export type CuadrillaUncheckedUpdateWithoutMiembrosInput = {
    id_cuadrilla?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    especialidad?: StringFieldUpdateOperationsInput | string
    capataz_id?: NullableStringFieldUpdateOperationsInput | string | null
    capataz_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    asignaciones?: AsignacionFrenteUncheckedUpdateManyWithoutCuadrillaNestedInput
  }

  export type AsignacionFrenteUpsertWithWhereUniqueWithoutEmpleadoInput = {
    where: AsignacionFrenteWhereUniqueInput
    update: XOR<AsignacionFrenteUpdateWithoutEmpleadoInput, AsignacionFrenteUncheckedUpdateWithoutEmpleadoInput>
    create: XOR<AsignacionFrenteCreateWithoutEmpleadoInput, AsignacionFrenteUncheckedCreateWithoutEmpleadoInput>
  }

  export type AsignacionFrenteUpdateWithWhereUniqueWithoutEmpleadoInput = {
    where: AsignacionFrenteWhereUniqueInput
    data: XOR<AsignacionFrenteUpdateWithoutEmpleadoInput, AsignacionFrenteUncheckedUpdateWithoutEmpleadoInput>
  }

  export type AsignacionFrenteUpdateManyWithWhereWithoutEmpleadoInput = {
    where: AsignacionFrenteScalarWhereInput
    data: XOR<AsignacionFrenteUpdateManyMutationInput, AsignacionFrenteUncheckedUpdateManyWithoutEmpleadoInput>
  }

  export type AsignacionFrenteScalarWhereInput = {
    AND?: AsignacionFrenteScalarWhereInput | AsignacionFrenteScalarWhereInput[]
    OR?: AsignacionFrenteScalarWhereInput[]
    NOT?: AsignacionFrenteScalarWhereInput | AsignacionFrenteScalarWhereInput[]
    id_asignacion?: UuidFilter<"AsignacionFrente"> | string
    tenant_id?: UuidFilter<"AsignacionFrente"> | string
    proyecto_id?: UuidFilter<"AsignacionFrente"> | string
    empleado_id?: UuidFilter<"AsignacionFrente"> | string
    cuadrilla_id?: UuidNullableFilter<"AsignacionFrente"> | string | null
    frente_trabajo?: StringFilter<"AsignacionFrente"> | string
    turno?: StringFilter<"AsignacionFrente"> | string
    fecha_inicio?: DateTimeFilter<"AsignacionFrente"> | Date | string
    fecha_fin?: DateTimeNullableFilter<"AsignacionFrente"> | Date | string | null
    horas_diarias?: DecimalFilter<"AsignacionFrente"> | Decimal | DecimalJsLike | number | string
    estado?: StringFilter<"AsignacionFrente"> | string
    created_at?: DateTimeFilter<"AsignacionFrente"> | Date | string
  }

  export type PreNominaDetalleUpsertWithWhereUniqueWithoutEmpleadoInput = {
    where: PreNominaDetalleWhereUniqueInput
    update: XOR<PreNominaDetalleUpdateWithoutEmpleadoInput, PreNominaDetalleUncheckedUpdateWithoutEmpleadoInput>
    create: XOR<PreNominaDetalleCreateWithoutEmpleadoInput, PreNominaDetalleUncheckedCreateWithoutEmpleadoInput>
  }

  export type PreNominaDetalleUpdateWithWhereUniqueWithoutEmpleadoInput = {
    where: PreNominaDetalleWhereUniqueInput
    data: XOR<PreNominaDetalleUpdateWithoutEmpleadoInput, PreNominaDetalleUncheckedUpdateWithoutEmpleadoInput>
  }

  export type PreNominaDetalleUpdateManyWithWhereWithoutEmpleadoInput = {
    where: PreNominaDetalleScalarWhereInput
    data: XOR<PreNominaDetalleUpdateManyMutationInput, PreNominaDetalleUncheckedUpdateManyWithoutEmpleadoInput>
  }

  export type PreNominaDetalleScalarWhereInput = {
    AND?: PreNominaDetalleScalarWhereInput | PreNominaDetalleScalarWhereInput[]
    OR?: PreNominaDetalleScalarWhereInput[]
    NOT?: PreNominaDetalleScalarWhereInput | PreNominaDetalleScalarWhereInput[]
    id_detalle?: UuidFilter<"PreNominaDetalle"> | string
    tenant_id?: UuidFilter<"PreNominaDetalle"> | string
    proyecto_id?: UuidFilter<"PreNominaDetalle"> | string
    prenomina_id?: UuidFilter<"PreNominaDetalle"> | string
    empleado_id?: UuidFilter<"PreNominaDetalle"> | string
    dias_trabajados?: DecimalFilter<"PreNominaDetalle"> | Decimal | DecimalJsLike | number | string
    horas_extra?: DecimalFilter<"PreNominaDetalle"> | Decimal | DecimalJsLike | number | string
    salario_base?: DecimalFilter<"PreNominaDetalle"> | Decimal | DecimalJsLike | number | string
    monto_horas_extra?: DecimalFilter<"PreNominaDetalle"> | Decimal | DecimalJsLike | number | string
    bonos?: DecimalFilter<"PreNominaDetalle"> | Decimal | DecimalJsLike | number | string
    total_percepciones?: DecimalFilter<"PreNominaDetalle"> | Decimal | DecimalJsLike | number | string
    deduccion_imss?: DecimalFilter<"PreNominaDetalle"> | Decimal | DecimalJsLike | number | string
    deduccion_isr?: DecimalFilter<"PreNominaDetalle"> | Decimal | DecimalJsLike | number | string
    otras_deducciones?: DecimalFilter<"PreNominaDetalle"> | Decimal | DecimalJsLike | number | string
    total_deducciones?: DecimalFilter<"PreNominaDetalle"> | Decimal | DecimalJsLike | number | string
    neto_a_pagar?: DecimalFilter<"PreNominaDetalle"> | Decimal | DecimalJsLike | number | string
  }

  export type EmpleadoCreateWithoutCuadrillaInput = {
    id_empleado?: string
    tenant_id: string
    numero_empleado: string
    nombre: string
    apellido_paterno: string
    apellido_materno?: string | null
    rfc: string
    curp?: string | null
    nss?: string | null
    puesto: string
    categoria?: string
    tipo_contrato?: string
    fecha_ingreso: Date | string
    fecha_baja?: Date | string | null
    salario_diario: Decimal | DecimalJsLike | number | string
    salario_integrado?: Decimal | DecimalJsLike | number | string | null
    telefono?: string | null
    email?: string | null
    contacto_emergencia?: string | null
    certificaciones?: string | null
    estado?: string
    created_at?: Date | string
    updated_at?: Date | string
    asignaciones?: AsignacionFrenteCreateNestedManyWithoutEmpleadoInput
    prenominas?: PreNominaDetalleCreateNestedManyWithoutEmpleadoInput
  }

  export type EmpleadoUncheckedCreateWithoutCuadrillaInput = {
    id_empleado?: string
    tenant_id: string
    numero_empleado: string
    nombre: string
    apellido_paterno: string
    apellido_materno?: string | null
    rfc: string
    curp?: string | null
    nss?: string | null
    puesto: string
    categoria?: string
    tipo_contrato?: string
    fecha_ingreso: Date | string
    fecha_baja?: Date | string | null
    salario_diario: Decimal | DecimalJsLike | number | string
    salario_integrado?: Decimal | DecimalJsLike | number | string | null
    telefono?: string | null
    email?: string | null
    contacto_emergencia?: string | null
    certificaciones?: string | null
    estado?: string
    created_at?: Date | string
    updated_at?: Date | string
    asignaciones?: AsignacionFrenteUncheckedCreateNestedManyWithoutEmpleadoInput
    prenominas?: PreNominaDetalleUncheckedCreateNestedManyWithoutEmpleadoInput
  }

  export type EmpleadoCreateOrConnectWithoutCuadrillaInput = {
    where: EmpleadoWhereUniqueInput
    create: XOR<EmpleadoCreateWithoutCuadrillaInput, EmpleadoUncheckedCreateWithoutCuadrillaInput>
  }

  export type EmpleadoCreateManyCuadrillaInputEnvelope = {
    data: EmpleadoCreateManyCuadrillaInput | EmpleadoCreateManyCuadrillaInput[]
    skipDuplicates?: boolean
  }

  export type AsignacionFrenteCreateWithoutCuadrillaInput = {
    id_asignacion?: string
    tenant_id: string
    proyecto_id: string
    frente_trabajo: string
    turno?: string
    fecha_inicio: Date | string
    fecha_fin?: Date | string | null
    horas_diarias?: Decimal | DecimalJsLike | number | string
    estado?: string
    created_at?: Date | string
    empleado: EmpleadoCreateNestedOneWithoutAsignacionesInput
  }

  export type AsignacionFrenteUncheckedCreateWithoutCuadrillaInput = {
    id_asignacion?: string
    tenant_id: string
    proyecto_id: string
    empleado_id: string
    frente_trabajo: string
    turno?: string
    fecha_inicio: Date | string
    fecha_fin?: Date | string | null
    horas_diarias?: Decimal | DecimalJsLike | number | string
    estado?: string
    created_at?: Date | string
  }

  export type AsignacionFrenteCreateOrConnectWithoutCuadrillaInput = {
    where: AsignacionFrenteWhereUniqueInput
    create: XOR<AsignacionFrenteCreateWithoutCuadrillaInput, AsignacionFrenteUncheckedCreateWithoutCuadrillaInput>
  }

  export type AsignacionFrenteCreateManyCuadrillaInputEnvelope = {
    data: AsignacionFrenteCreateManyCuadrillaInput | AsignacionFrenteCreateManyCuadrillaInput[]
    skipDuplicates?: boolean
  }

  export type EmpleadoUpsertWithWhereUniqueWithoutCuadrillaInput = {
    where: EmpleadoWhereUniqueInput
    update: XOR<EmpleadoUpdateWithoutCuadrillaInput, EmpleadoUncheckedUpdateWithoutCuadrillaInput>
    create: XOR<EmpleadoCreateWithoutCuadrillaInput, EmpleadoUncheckedCreateWithoutCuadrillaInput>
  }

  export type EmpleadoUpdateWithWhereUniqueWithoutCuadrillaInput = {
    where: EmpleadoWhereUniqueInput
    data: XOR<EmpleadoUpdateWithoutCuadrillaInput, EmpleadoUncheckedUpdateWithoutCuadrillaInput>
  }

  export type EmpleadoUpdateManyWithWhereWithoutCuadrillaInput = {
    where: EmpleadoScalarWhereInput
    data: XOR<EmpleadoUpdateManyMutationInput, EmpleadoUncheckedUpdateManyWithoutCuadrillaInput>
  }

  export type EmpleadoScalarWhereInput = {
    AND?: EmpleadoScalarWhereInput | EmpleadoScalarWhereInput[]
    OR?: EmpleadoScalarWhereInput[]
    NOT?: EmpleadoScalarWhereInput | EmpleadoScalarWhereInput[]
    id_empleado?: UuidFilter<"Empleado"> | string
    tenant_id?: UuidFilter<"Empleado"> | string
    numero_empleado?: StringFilter<"Empleado"> | string
    nombre?: StringFilter<"Empleado"> | string
    apellido_paterno?: StringFilter<"Empleado"> | string
    apellido_materno?: StringNullableFilter<"Empleado"> | string | null
    rfc?: StringFilter<"Empleado"> | string
    curp?: StringNullableFilter<"Empleado"> | string | null
    nss?: StringNullableFilter<"Empleado"> | string | null
    puesto?: StringFilter<"Empleado"> | string
    categoria?: StringFilter<"Empleado"> | string
    tipo_contrato?: StringFilter<"Empleado"> | string
    fecha_ingreso?: DateTimeFilter<"Empleado"> | Date | string
    fecha_baja?: DateTimeNullableFilter<"Empleado"> | Date | string | null
    salario_diario?: DecimalFilter<"Empleado"> | Decimal | DecimalJsLike | number | string
    salario_integrado?: DecimalNullableFilter<"Empleado"> | Decimal | DecimalJsLike | number | string | null
    telefono?: StringNullableFilter<"Empleado"> | string | null
    email?: StringNullableFilter<"Empleado"> | string | null
    contacto_emergencia?: StringNullableFilter<"Empleado"> | string | null
    certificaciones?: StringNullableFilter<"Empleado"> | string | null
    estado?: StringFilter<"Empleado"> | string
    cuadrilla_id?: UuidNullableFilter<"Empleado"> | string | null
    created_at?: DateTimeFilter<"Empleado"> | Date | string
    updated_at?: DateTimeFilter<"Empleado"> | Date | string
  }

  export type AsignacionFrenteUpsertWithWhereUniqueWithoutCuadrillaInput = {
    where: AsignacionFrenteWhereUniqueInput
    update: XOR<AsignacionFrenteUpdateWithoutCuadrillaInput, AsignacionFrenteUncheckedUpdateWithoutCuadrillaInput>
    create: XOR<AsignacionFrenteCreateWithoutCuadrillaInput, AsignacionFrenteUncheckedCreateWithoutCuadrillaInput>
  }

  export type AsignacionFrenteUpdateWithWhereUniqueWithoutCuadrillaInput = {
    where: AsignacionFrenteWhereUniqueInput
    data: XOR<AsignacionFrenteUpdateWithoutCuadrillaInput, AsignacionFrenteUncheckedUpdateWithoutCuadrillaInput>
  }

  export type AsignacionFrenteUpdateManyWithWhereWithoutCuadrillaInput = {
    where: AsignacionFrenteScalarWhereInput
    data: XOR<AsignacionFrenteUpdateManyMutationInput, AsignacionFrenteUncheckedUpdateManyWithoutCuadrillaInput>
  }

  export type EmpleadoCreateWithoutAsignacionesInput = {
    id_empleado?: string
    tenant_id: string
    numero_empleado: string
    nombre: string
    apellido_paterno: string
    apellido_materno?: string | null
    rfc: string
    curp?: string | null
    nss?: string | null
    puesto: string
    categoria?: string
    tipo_contrato?: string
    fecha_ingreso: Date | string
    fecha_baja?: Date | string | null
    salario_diario: Decimal | DecimalJsLike | number | string
    salario_integrado?: Decimal | DecimalJsLike | number | string | null
    telefono?: string | null
    email?: string | null
    contacto_emergencia?: string | null
    certificaciones?: string | null
    estado?: string
    created_at?: Date | string
    updated_at?: Date | string
    cuadrilla?: CuadrillaCreateNestedOneWithoutMiembrosInput
    prenominas?: PreNominaDetalleCreateNestedManyWithoutEmpleadoInput
  }

  export type EmpleadoUncheckedCreateWithoutAsignacionesInput = {
    id_empleado?: string
    tenant_id: string
    numero_empleado: string
    nombre: string
    apellido_paterno: string
    apellido_materno?: string | null
    rfc: string
    curp?: string | null
    nss?: string | null
    puesto: string
    categoria?: string
    tipo_contrato?: string
    fecha_ingreso: Date | string
    fecha_baja?: Date | string | null
    salario_diario: Decimal | DecimalJsLike | number | string
    salario_integrado?: Decimal | DecimalJsLike | number | string | null
    telefono?: string | null
    email?: string | null
    contacto_emergencia?: string | null
    certificaciones?: string | null
    estado?: string
    cuadrilla_id?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    prenominas?: PreNominaDetalleUncheckedCreateNestedManyWithoutEmpleadoInput
  }

  export type EmpleadoCreateOrConnectWithoutAsignacionesInput = {
    where: EmpleadoWhereUniqueInput
    create: XOR<EmpleadoCreateWithoutAsignacionesInput, EmpleadoUncheckedCreateWithoutAsignacionesInput>
  }

  export type CuadrillaCreateWithoutAsignacionesInput = {
    id_cuadrilla?: string
    tenant_id: string
    proyecto_id: string
    nombre: string
    codigo: string
    especialidad: string
    capataz_id?: string | null
    capataz_nombre?: string | null
    estado?: string
    created_at?: Date | string
    updated_at?: Date | string
    miembros?: EmpleadoCreateNestedManyWithoutCuadrillaInput
  }

  export type CuadrillaUncheckedCreateWithoutAsignacionesInput = {
    id_cuadrilla?: string
    tenant_id: string
    proyecto_id: string
    nombre: string
    codigo: string
    especialidad: string
    capataz_id?: string | null
    capataz_nombre?: string | null
    estado?: string
    created_at?: Date | string
    updated_at?: Date | string
    miembros?: EmpleadoUncheckedCreateNestedManyWithoutCuadrillaInput
  }

  export type CuadrillaCreateOrConnectWithoutAsignacionesInput = {
    where: CuadrillaWhereUniqueInput
    create: XOR<CuadrillaCreateWithoutAsignacionesInput, CuadrillaUncheckedCreateWithoutAsignacionesInput>
  }

  export type EmpleadoUpsertWithoutAsignacionesInput = {
    update: XOR<EmpleadoUpdateWithoutAsignacionesInput, EmpleadoUncheckedUpdateWithoutAsignacionesInput>
    create: XOR<EmpleadoCreateWithoutAsignacionesInput, EmpleadoUncheckedCreateWithoutAsignacionesInput>
    where?: EmpleadoWhereInput
  }

  export type EmpleadoUpdateToOneWithWhereWithoutAsignacionesInput = {
    where?: EmpleadoWhereInput
    data: XOR<EmpleadoUpdateWithoutAsignacionesInput, EmpleadoUncheckedUpdateWithoutAsignacionesInput>
  }

  export type EmpleadoUpdateWithoutAsignacionesInput = {
    id_empleado?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    numero_empleado?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    apellido_paterno?: StringFieldUpdateOperationsInput | string
    apellido_materno?: NullableStringFieldUpdateOperationsInput | string | null
    rfc?: StringFieldUpdateOperationsInput | string
    curp?: NullableStringFieldUpdateOperationsInput | string | null
    nss?: NullableStringFieldUpdateOperationsInput | string | null
    puesto?: StringFieldUpdateOperationsInput | string
    categoria?: StringFieldUpdateOperationsInput | string
    tipo_contrato?: StringFieldUpdateOperationsInput | string
    fecha_ingreso?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_baja?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    salario_diario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    salario_integrado?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    contacto_emergencia?: NullableStringFieldUpdateOperationsInput | string | null
    certificaciones?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    cuadrilla?: CuadrillaUpdateOneWithoutMiembrosNestedInput
    prenominas?: PreNominaDetalleUpdateManyWithoutEmpleadoNestedInput
  }

  export type EmpleadoUncheckedUpdateWithoutAsignacionesInput = {
    id_empleado?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    numero_empleado?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    apellido_paterno?: StringFieldUpdateOperationsInput | string
    apellido_materno?: NullableStringFieldUpdateOperationsInput | string | null
    rfc?: StringFieldUpdateOperationsInput | string
    curp?: NullableStringFieldUpdateOperationsInput | string | null
    nss?: NullableStringFieldUpdateOperationsInput | string | null
    puesto?: StringFieldUpdateOperationsInput | string
    categoria?: StringFieldUpdateOperationsInput | string
    tipo_contrato?: StringFieldUpdateOperationsInput | string
    fecha_ingreso?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_baja?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    salario_diario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    salario_integrado?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    contacto_emergencia?: NullableStringFieldUpdateOperationsInput | string | null
    certificaciones?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: StringFieldUpdateOperationsInput | string
    cuadrilla_id?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    prenominas?: PreNominaDetalleUncheckedUpdateManyWithoutEmpleadoNestedInput
  }

  export type CuadrillaUpsertWithoutAsignacionesInput = {
    update: XOR<CuadrillaUpdateWithoutAsignacionesInput, CuadrillaUncheckedUpdateWithoutAsignacionesInput>
    create: XOR<CuadrillaCreateWithoutAsignacionesInput, CuadrillaUncheckedCreateWithoutAsignacionesInput>
    where?: CuadrillaWhereInput
  }

  export type CuadrillaUpdateToOneWithWhereWithoutAsignacionesInput = {
    where?: CuadrillaWhereInput
    data: XOR<CuadrillaUpdateWithoutAsignacionesInput, CuadrillaUncheckedUpdateWithoutAsignacionesInput>
  }

  export type CuadrillaUpdateWithoutAsignacionesInput = {
    id_cuadrilla?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    especialidad?: StringFieldUpdateOperationsInput | string
    capataz_id?: NullableStringFieldUpdateOperationsInput | string | null
    capataz_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    miembros?: EmpleadoUpdateManyWithoutCuadrillaNestedInput
  }

  export type CuadrillaUncheckedUpdateWithoutAsignacionesInput = {
    id_cuadrilla?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    especialidad?: StringFieldUpdateOperationsInput | string
    capataz_id?: NullableStringFieldUpdateOperationsInput | string | null
    capataz_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    miembros?: EmpleadoUncheckedUpdateManyWithoutCuadrillaNestedInput
  }

  export type PreNominaDetalleCreateWithoutPrenominaInput = {
    id_detalle?: string
    tenant_id: string
    proyecto_id: string
    dias_trabajados: Decimal | DecimalJsLike | number | string
    horas_extra?: Decimal | DecimalJsLike | number | string
    salario_base: Decimal | DecimalJsLike | number | string
    monto_horas_extra?: Decimal | DecimalJsLike | number | string
    bonos?: Decimal | DecimalJsLike | number | string
    total_percepciones: Decimal | DecimalJsLike | number | string
    deduccion_imss?: Decimal | DecimalJsLike | number | string
    deduccion_isr?: Decimal | DecimalJsLike | number | string
    otras_deducciones?: Decimal | DecimalJsLike | number | string
    total_deducciones?: Decimal | DecimalJsLike | number | string
    neto_a_pagar: Decimal | DecimalJsLike | number | string
    empleado: EmpleadoCreateNestedOneWithoutPrenominasInput
  }

  export type PreNominaDetalleUncheckedCreateWithoutPrenominaInput = {
    id_detalle?: string
    tenant_id: string
    proyecto_id: string
    empleado_id: string
    dias_trabajados: Decimal | DecimalJsLike | number | string
    horas_extra?: Decimal | DecimalJsLike | number | string
    salario_base: Decimal | DecimalJsLike | number | string
    monto_horas_extra?: Decimal | DecimalJsLike | number | string
    bonos?: Decimal | DecimalJsLike | number | string
    total_percepciones: Decimal | DecimalJsLike | number | string
    deduccion_imss?: Decimal | DecimalJsLike | number | string
    deduccion_isr?: Decimal | DecimalJsLike | number | string
    otras_deducciones?: Decimal | DecimalJsLike | number | string
    total_deducciones?: Decimal | DecimalJsLike | number | string
    neto_a_pagar: Decimal | DecimalJsLike | number | string
  }

  export type PreNominaDetalleCreateOrConnectWithoutPrenominaInput = {
    where: PreNominaDetalleWhereUniqueInput
    create: XOR<PreNominaDetalleCreateWithoutPrenominaInput, PreNominaDetalleUncheckedCreateWithoutPrenominaInput>
  }

  export type PreNominaDetalleCreateManyPrenominaInputEnvelope = {
    data: PreNominaDetalleCreateManyPrenominaInput | PreNominaDetalleCreateManyPrenominaInput[]
    skipDuplicates?: boolean
  }

  export type PreNominaDetalleUpsertWithWhereUniqueWithoutPrenominaInput = {
    where: PreNominaDetalleWhereUniqueInput
    update: XOR<PreNominaDetalleUpdateWithoutPrenominaInput, PreNominaDetalleUncheckedUpdateWithoutPrenominaInput>
    create: XOR<PreNominaDetalleCreateWithoutPrenominaInput, PreNominaDetalleUncheckedCreateWithoutPrenominaInput>
  }

  export type PreNominaDetalleUpdateWithWhereUniqueWithoutPrenominaInput = {
    where: PreNominaDetalleWhereUniqueInput
    data: XOR<PreNominaDetalleUpdateWithoutPrenominaInput, PreNominaDetalleUncheckedUpdateWithoutPrenominaInput>
  }

  export type PreNominaDetalleUpdateManyWithWhereWithoutPrenominaInput = {
    where: PreNominaDetalleScalarWhereInput
    data: XOR<PreNominaDetalleUpdateManyMutationInput, PreNominaDetalleUncheckedUpdateManyWithoutPrenominaInput>
  }

  export type PreNominaCreateWithoutDetallesInput = {
    id_prenomina?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    periodo_tipo?: string
    periodo_inicio: Date | string
    periodo_fin: Date | string
    total_percepciones?: Decimal | DecimalJsLike | number | string
    total_deducciones?: Decimal | DecimalJsLike | number | string
    total_neto?: Decimal | DecimalJsLike | number | string
    total_empleados?: number
    estado?: string
    elaborado_por: string
    autorizado_por?: string | null
    fecha_autorizacion?: Date | string | null
    notas?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type PreNominaUncheckedCreateWithoutDetallesInput = {
    id_prenomina?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    periodo_tipo?: string
    periodo_inicio: Date | string
    periodo_fin: Date | string
    total_percepciones?: Decimal | DecimalJsLike | number | string
    total_deducciones?: Decimal | DecimalJsLike | number | string
    total_neto?: Decimal | DecimalJsLike | number | string
    total_empleados?: number
    estado?: string
    elaborado_por: string
    autorizado_por?: string | null
    fecha_autorizacion?: Date | string | null
    notas?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type PreNominaCreateOrConnectWithoutDetallesInput = {
    where: PreNominaWhereUniqueInput
    create: XOR<PreNominaCreateWithoutDetallesInput, PreNominaUncheckedCreateWithoutDetallesInput>
  }

  export type EmpleadoCreateWithoutPrenominasInput = {
    id_empleado?: string
    tenant_id: string
    numero_empleado: string
    nombre: string
    apellido_paterno: string
    apellido_materno?: string | null
    rfc: string
    curp?: string | null
    nss?: string | null
    puesto: string
    categoria?: string
    tipo_contrato?: string
    fecha_ingreso: Date | string
    fecha_baja?: Date | string | null
    salario_diario: Decimal | DecimalJsLike | number | string
    salario_integrado?: Decimal | DecimalJsLike | number | string | null
    telefono?: string | null
    email?: string | null
    contacto_emergencia?: string | null
    certificaciones?: string | null
    estado?: string
    created_at?: Date | string
    updated_at?: Date | string
    cuadrilla?: CuadrillaCreateNestedOneWithoutMiembrosInput
    asignaciones?: AsignacionFrenteCreateNestedManyWithoutEmpleadoInput
  }

  export type EmpleadoUncheckedCreateWithoutPrenominasInput = {
    id_empleado?: string
    tenant_id: string
    numero_empleado: string
    nombre: string
    apellido_paterno: string
    apellido_materno?: string | null
    rfc: string
    curp?: string | null
    nss?: string | null
    puesto: string
    categoria?: string
    tipo_contrato?: string
    fecha_ingreso: Date | string
    fecha_baja?: Date | string | null
    salario_diario: Decimal | DecimalJsLike | number | string
    salario_integrado?: Decimal | DecimalJsLike | number | string | null
    telefono?: string | null
    email?: string | null
    contacto_emergencia?: string | null
    certificaciones?: string | null
    estado?: string
    cuadrilla_id?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    asignaciones?: AsignacionFrenteUncheckedCreateNestedManyWithoutEmpleadoInput
  }

  export type EmpleadoCreateOrConnectWithoutPrenominasInput = {
    where: EmpleadoWhereUniqueInput
    create: XOR<EmpleadoCreateWithoutPrenominasInput, EmpleadoUncheckedCreateWithoutPrenominasInput>
  }

  export type PreNominaUpsertWithoutDetallesInput = {
    update: XOR<PreNominaUpdateWithoutDetallesInput, PreNominaUncheckedUpdateWithoutDetallesInput>
    create: XOR<PreNominaCreateWithoutDetallesInput, PreNominaUncheckedCreateWithoutDetallesInput>
    where?: PreNominaWhereInput
  }

  export type PreNominaUpdateToOneWithWhereWithoutDetallesInput = {
    where?: PreNominaWhereInput
    data: XOR<PreNominaUpdateWithoutDetallesInput, PreNominaUncheckedUpdateWithoutDetallesInput>
  }

  export type PreNominaUpdateWithoutDetallesInput = {
    id_prenomina?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    periodo_tipo?: StringFieldUpdateOperationsInput | string
    periodo_inicio?: DateTimeFieldUpdateOperationsInput | Date | string
    periodo_fin?: DateTimeFieldUpdateOperationsInput | Date | string
    total_percepciones?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total_deducciones?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total_neto?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total_empleados?: IntFieldUpdateOperationsInput | number
    estado?: StringFieldUpdateOperationsInput | string
    elaborado_por?: StringFieldUpdateOperationsInput | string
    autorizado_por?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_autorizacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PreNominaUncheckedUpdateWithoutDetallesInput = {
    id_prenomina?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    periodo_tipo?: StringFieldUpdateOperationsInput | string
    periodo_inicio?: DateTimeFieldUpdateOperationsInput | Date | string
    periodo_fin?: DateTimeFieldUpdateOperationsInput | Date | string
    total_percepciones?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total_deducciones?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total_neto?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total_empleados?: IntFieldUpdateOperationsInput | number
    estado?: StringFieldUpdateOperationsInput | string
    elaborado_por?: StringFieldUpdateOperationsInput | string
    autorizado_por?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_autorizacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmpleadoUpsertWithoutPrenominasInput = {
    update: XOR<EmpleadoUpdateWithoutPrenominasInput, EmpleadoUncheckedUpdateWithoutPrenominasInput>
    create: XOR<EmpleadoCreateWithoutPrenominasInput, EmpleadoUncheckedCreateWithoutPrenominasInput>
    where?: EmpleadoWhereInput
  }

  export type EmpleadoUpdateToOneWithWhereWithoutPrenominasInput = {
    where?: EmpleadoWhereInput
    data: XOR<EmpleadoUpdateWithoutPrenominasInput, EmpleadoUncheckedUpdateWithoutPrenominasInput>
  }

  export type EmpleadoUpdateWithoutPrenominasInput = {
    id_empleado?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    numero_empleado?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    apellido_paterno?: StringFieldUpdateOperationsInput | string
    apellido_materno?: NullableStringFieldUpdateOperationsInput | string | null
    rfc?: StringFieldUpdateOperationsInput | string
    curp?: NullableStringFieldUpdateOperationsInput | string | null
    nss?: NullableStringFieldUpdateOperationsInput | string | null
    puesto?: StringFieldUpdateOperationsInput | string
    categoria?: StringFieldUpdateOperationsInput | string
    tipo_contrato?: StringFieldUpdateOperationsInput | string
    fecha_ingreso?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_baja?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    salario_diario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    salario_integrado?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    contacto_emergencia?: NullableStringFieldUpdateOperationsInput | string | null
    certificaciones?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    cuadrilla?: CuadrillaUpdateOneWithoutMiembrosNestedInput
    asignaciones?: AsignacionFrenteUpdateManyWithoutEmpleadoNestedInput
  }

  export type EmpleadoUncheckedUpdateWithoutPrenominasInput = {
    id_empleado?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    numero_empleado?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    apellido_paterno?: StringFieldUpdateOperationsInput | string
    apellido_materno?: NullableStringFieldUpdateOperationsInput | string | null
    rfc?: StringFieldUpdateOperationsInput | string
    curp?: NullableStringFieldUpdateOperationsInput | string | null
    nss?: NullableStringFieldUpdateOperationsInput | string | null
    puesto?: StringFieldUpdateOperationsInput | string
    categoria?: StringFieldUpdateOperationsInput | string
    tipo_contrato?: StringFieldUpdateOperationsInput | string
    fecha_ingreso?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_baja?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    salario_diario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    salario_integrado?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    contacto_emergencia?: NullableStringFieldUpdateOperationsInput | string | null
    certificaciones?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: StringFieldUpdateOperationsInput | string
    cuadrilla_id?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    asignaciones?: AsignacionFrenteUncheckedUpdateManyWithoutEmpleadoNestedInput
  }

  export type AsignacionFrenteCreateManyEmpleadoInput = {
    id_asignacion?: string
    tenant_id: string
    proyecto_id: string
    cuadrilla_id?: string | null
    frente_trabajo: string
    turno?: string
    fecha_inicio: Date | string
    fecha_fin?: Date | string | null
    horas_diarias?: Decimal | DecimalJsLike | number | string
    estado?: string
    created_at?: Date | string
  }

  export type PreNominaDetalleCreateManyEmpleadoInput = {
    id_detalle?: string
    tenant_id: string
    proyecto_id: string
    prenomina_id: string
    dias_trabajados: Decimal | DecimalJsLike | number | string
    horas_extra?: Decimal | DecimalJsLike | number | string
    salario_base: Decimal | DecimalJsLike | number | string
    monto_horas_extra?: Decimal | DecimalJsLike | number | string
    bonos?: Decimal | DecimalJsLike | number | string
    total_percepciones: Decimal | DecimalJsLike | number | string
    deduccion_imss?: Decimal | DecimalJsLike | number | string
    deduccion_isr?: Decimal | DecimalJsLike | number | string
    otras_deducciones?: Decimal | DecimalJsLike | number | string
    total_deducciones?: Decimal | DecimalJsLike | number | string
    neto_a_pagar: Decimal | DecimalJsLike | number | string
  }

  export type AsignacionFrenteUpdateWithoutEmpleadoInput = {
    id_asignacion?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    frente_trabajo?: StringFieldUpdateOperationsInput | string
    turno?: StringFieldUpdateOperationsInput | string
    fecha_inicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_fin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    horas_diarias?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    estado?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    cuadrilla?: CuadrillaUpdateOneWithoutAsignacionesNestedInput
  }

  export type AsignacionFrenteUncheckedUpdateWithoutEmpleadoInput = {
    id_asignacion?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    cuadrilla_id?: NullableStringFieldUpdateOperationsInput | string | null
    frente_trabajo?: StringFieldUpdateOperationsInput | string
    turno?: StringFieldUpdateOperationsInput | string
    fecha_inicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_fin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    horas_diarias?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    estado?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AsignacionFrenteUncheckedUpdateManyWithoutEmpleadoInput = {
    id_asignacion?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    cuadrilla_id?: NullableStringFieldUpdateOperationsInput | string | null
    frente_trabajo?: StringFieldUpdateOperationsInput | string
    turno?: StringFieldUpdateOperationsInput | string
    fecha_inicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_fin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    horas_diarias?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    estado?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PreNominaDetalleUpdateWithoutEmpleadoInput = {
    id_detalle?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    dias_trabajados?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    horas_extra?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    salario_base?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_horas_extra?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    bonos?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total_percepciones?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    deduccion_imss?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    deduccion_isr?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    otras_deducciones?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total_deducciones?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    neto_a_pagar?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    prenomina?: PreNominaUpdateOneRequiredWithoutDetallesNestedInput
  }

  export type PreNominaDetalleUncheckedUpdateWithoutEmpleadoInput = {
    id_detalle?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    prenomina_id?: StringFieldUpdateOperationsInput | string
    dias_trabajados?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    horas_extra?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    salario_base?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_horas_extra?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    bonos?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total_percepciones?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    deduccion_imss?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    deduccion_isr?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    otras_deducciones?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total_deducciones?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    neto_a_pagar?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
  }

  export type PreNominaDetalleUncheckedUpdateManyWithoutEmpleadoInput = {
    id_detalle?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    prenomina_id?: StringFieldUpdateOperationsInput | string
    dias_trabajados?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    horas_extra?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    salario_base?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_horas_extra?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    bonos?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total_percepciones?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    deduccion_imss?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    deduccion_isr?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    otras_deducciones?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total_deducciones?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    neto_a_pagar?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
  }

  export type EmpleadoCreateManyCuadrillaInput = {
    id_empleado?: string
    tenant_id: string
    numero_empleado: string
    nombre: string
    apellido_paterno: string
    apellido_materno?: string | null
    rfc: string
    curp?: string | null
    nss?: string | null
    puesto: string
    categoria?: string
    tipo_contrato?: string
    fecha_ingreso: Date | string
    fecha_baja?: Date | string | null
    salario_diario: Decimal | DecimalJsLike | number | string
    salario_integrado?: Decimal | DecimalJsLike | number | string | null
    telefono?: string | null
    email?: string | null
    contacto_emergencia?: string | null
    certificaciones?: string | null
    estado?: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type AsignacionFrenteCreateManyCuadrillaInput = {
    id_asignacion?: string
    tenant_id: string
    proyecto_id: string
    empleado_id: string
    frente_trabajo: string
    turno?: string
    fecha_inicio: Date | string
    fecha_fin?: Date | string | null
    horas_diarias?: Decimal | DecimalJsLike | number | string
    estado?: string
    created_at?: Date | string
  }

  export type EmpleadoUpdateWithoutCuadrillaInput = {
    id_empleado?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    numero_empleado?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    apellido_paterno?: StringFieldUpdateOperationsInput | string
    apellido_materno?: NullableStringFieldUpdateOperationsInput | string | null
    rfc?: StringFieldUpdateOperationsInput | string
    curp?: NullableStringFieldUpdateOperationsInput | string | null
    nss?: NullableStringFieldUpdateOperationsInput | string | null
    puesto?: StringFieldUpdateOperationsInput | string
    categoria?: StringFieldUpdateOperationsInput | string
    tipo_contrato?: StringFieldUpdateOperationsInput | string
    fecha_ingreso?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_baja?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    salario_diario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    salario_integrado?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    contacto_emergencia?: NullableStringFieldUpdateOperationsInput | string | null
    certificaciones?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    asignaciones?: AsignacionFrenteUpdateManyWithoutEmpleadoNestedInput
    prenominas?: PreNominaDetalleUpdateManyWithoutEmpleadoNestedInput
  }

  export type EmpleadoUncheckedUpdateWithoutCuadrillaInput = {
    id_empleado?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    numero_empleado?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    apellido_paterno?: StringFieldUpdateOperationsInput | string
    apellido_materno?: NullableStringFieldUpdateOperationsInput | string | null
    rfc?: StringFieldUpdateOperationsInput | string
    curp?: NullableStringFieldUpdateOperationsInput | string | null
    nss?: NullableStringFieldUpdateOperationsInput | string | null
    puesto?: StringFieldUpdateOperationsInput | string
    categoria?: StringFieldUpdateOperationsInput | string
    tipo_contrato?: StringFieldUpdateOperationsInput | string
    fecha_ingreso?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_baja?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    salario_diario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    salario_integrado?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    contacto_emergencia?: NullableStringFieldUpdateOperationsInput | string | null
    certificaciones?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    asignaciones?: AsignacionFrenteUncheckedUpdateManyWithoutEmpleadoNestedInput
    prenominas?: PreNominaDetalleUncheckedUpdateManyWithoutEmpleadoNestedInput
  }

  export type EmpleadoUncheckedUpdateManyWithoutCuadrillaInput = {
    id_empleado?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    numero_empleado?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    apellido_paterno?: StringFieldUpdateOperationsInput | string
    apellido_materno?: NullableStringFieldUpdateOperationsInput | string | null
    rfc?: StringFieldUpdateOperationsInput | string
    curp?: NullableStringFieldUpdateOperationsInput | string | null
    nss?: NullableStringFieldUpdateOperationsInput | string | null
    puesto?: StringFieldUpdateOperationsInput | string
    categoria?: StringFieldUpdateOperationsInput | string
    tipo_contrato?: StringFieldUpdateOperationsInput | string
    fecha_ingreso?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_baja?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    salario_diario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    salario_integrado?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    contacto_emergencia?: NullableStringFieldUpdateOperationsInput | string | null
    certificaciones?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AsignacionFrenteUpdateWithoutCuadrillaInput = {
    id_asignacion?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    frente_trabajo?: StringFieldUpdateOperationsInput | string
    turno?: StringFieldUpdateOperationsInput | string
    fecha_inicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_fin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    horas_diarias?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    estado?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    empleado?: EmpleadoUpdateOneRequiredWithoutAsignacionesNestedInput
  }

  export type AsignacionFrenteUncheckedUpdateWithoutCuadrillaInput = {
    id_asignacion?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    empleado_id?: StringFieldUpdateOperationsInput | string
    frente_trabajo?: StringFieldUpdateOperationsInput | string
    turno?: StringFieldUpdateOperationsInput | string
    fecha_inicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_fin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    horas_diarias?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    estado?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AsignacionFrenteUncheckedUpdateManyWithoutCuadrillaInput = {
    id_asignacion?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    empleado_id?: StringFieldUpdateOperationsInput | string
    frente_trabajo?: StringFieldUpdateOperationsInput | string
    turno?: StringFieldUpdateOperationsInput | string
    fecha_inicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_fin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    horas_diarias?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    estado?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PreNominaDetalleCreateManyPrenominaInput = {
    id_detalle?: string
    tenant_id: string
    proyecto_id: string
    empleado_id: string
    dias_trabajados: Decimal | DecimalJsLike | number | string
    horas_extra?: Decimal | DecimalJsLike | number | string
    salario_base: Decimal | DecimalJsLike | number | string
    monto_horas_extra?: Decimal | DecimalJsLike | number | string
    bonos?: Decimal | DecimalJsLike | number | string
    total_percepciones: Decimal | DecimalJsLike | number | string
    deduccion_imss?: Decimal | DecimalJsLike | number | string
    deduccion_isr?: Decimal | DecimalJsLike | number | string
    otras_deducciones?: Decimal | DecimalJsLike | number | string
    total_deducciones?: Decimal | DecimalJsLike | number | string
    neto_a_pagar: Decimal | DecimalJsLike | number | string
  }

  export type PreNominaDetalleUpdateWithoutPrenominaInput = {
    id_detalle?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    dias_trabajados?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    horas_extra?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    salario_base?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_horas_extra?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    bonos?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total_percepciones?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    deduccion_imss?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    deduccion_isr?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    otras_deducciones?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total_deducciones?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    neto_a_pagar?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    empleado?: EmpleadoUpdateOneRequiredWithoutPrenominasNestedInput
  }

  export type PreNominaDetalleUncheckedUpdateWithoutPrenominaInput = {
    id_detalle?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    empleado_id?: StringFieldUpdateOperationsInput | string
    dias_trabajados?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    horas_extra?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    salario_base?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_horas_extra?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    bonos?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total_percepciones?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    deduccion_imss?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    deduccion_isr?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    otras_deducciones?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total_deducciones?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    neto_a_pagar?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
  }

  export type PreNominaDetalleUncheckedUpdateManyWithoutPrenominaInput = {
    id_detalle?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    empleado_id?: StringFieldUpdateOperationsInput | string
    dias_trabajados?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    horas_extra?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    salario_base?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_horas_extra?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    bonos?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total_percepciones?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    deduccion_imss?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    deduccion_isr?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    otras_deducciones?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total_deducciones?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    neto_a_pagar?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use EmpleadoCountOutputTypeDefaultArgs instead
     */
    export type EmpleadoCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = EmpleadoCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CuadrillaCountOutputTypeDefaultArgs instead
     */
    export type CuadrillaCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CuadrillaCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PreNominaCountOutputTypeDefaultArgs instead
     */
    export type PreNominaCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PreNominaCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use EmpleadoDefaultArgs instead
     */
    export type EmpleadoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = EmpleadoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CuadrillaDefaultArgs instead
     */
    export type CuadrillaArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CuadrillaDefaultArgs<ExtArgs>
    /**
     * @deprecated Use AsignacionFrenteDefaultArgs instead
     */
    export type AsignacionFrenteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AsignacionFrenteDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PreNominaDefaultArgs instead
     */
    export type PreNominaArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PreNominaDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PreNominaDetalleDefaultArgs instead
     */
    export type PreNominaDetalleArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PreNominaDetalleDefaultArgs<ExtArgs>

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