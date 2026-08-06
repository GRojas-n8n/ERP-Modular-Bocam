
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
 * Model OrdenCompraSeguimiento
 * 
 */
export type OrdenCompraSeguimiento = $Result.DefaultSelection<Prisma.$OrdenCompraSeguimientoPayload>
/**
 * Model ManoObraProyecto
 * 
 */
export type ManoObraProyecto = $Result.DefaultSelection<Prisma.$ManoObraProyectoPayload>
/**
 * Model PagoEvmProcesado
 * 
 */
export type PagoEvmProcesado = $Result.DefaultSelection<Prisma.$PagoEvmProcesadoPayload>
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
 * Model MaterialConsumidoObra
 * 
 */
export type MaterialConsumidoObra = $Result.DefaultSelection<Prisma.$MaterialConsumidoObraPayload>
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
   * `prisma.ordenCompraSeguimiento`: Exposes CRUD operations for the **OrdenCompraSeguimiento** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OrdenCompraSeguimientos
    * const ordenCompraSeguimientos = await prisma.ordenCompraSeguimiento.findMany()
    * ```
    */
  get ordenCompraSeguimiento(): Prisma.OrdenCompraSeguimientoDelegate<ExtArgs>;

  /**
   * `prisma.manoObraProyecto`: Exposes CRUD operations for the **ManoObraProyecto** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ManoObraProyectos
    * const manoObraProyectos = await prisma.manoObraProyecto.findMany()
    * ```
    */
  get manoObraProyecto(): Prisma.ManoObraProyectoDelegate<ExtArgs>;

  /**
   * `prisma.pagoEvmProcesado`: Exposes CRUD operations for the **PagoEvmProcesado** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PagoEvmProcesados
    * const pagoEvmProcesados = await prisma.pagoEvmProcesado.findMany()
    * ```
    */
  get pagoEvmProcesado(): Prisma.PagoEvmProcesadoDelegate<ExtArgs>;

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
   * `prisma.materialConsumidoObra`: Exposes CRUD operations for the **MaterialConsumidoObra** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MaterialConsumidoObras
    * const materialConsumidoObras = await prisma.materialConsumidoObra.findMany()
    * ```
    */
  get materialConsumidoObra(): Prisma.MaterialConsumidoObraDelegate<ExtArgs>;

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
    ProgramacionObra: 'ProgramacionObra',
    OrdenCompraSeguimiento: 'OrdenCompraSeguimiento',
    ManoObraProyecto: 'ManoObraProyecto',
    PagoEvmProcesado: 'PagoEvmProcesado',
    AlertaProyecto: 'AlertaProyecto',
    ProyeccionCierre: 'ProyeccionCierre',
    BitacoraObra: 'BitacoraObra',
    AvanceFisico: 'AvanceFisico',
    MaterialConsumidoObra: 'MaterialConsumidoObra',
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
      modelProps: "programacionObra" | "ordenCompraSeguimiento" | "manoObraProyecto" | "pagoEvmProcesado" | "alertaProyecto" | "proyeccionCierre" | "bitacoraObra" | "avanceFisico" | "materialConsumidoObra" | "estimacion"
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
      OrdenCompraSeguimiento: {
        payload: Prisma.$OrdenCompraSeguimientoPayload<ExtArgs>
        fields: Prisma.OrdenCompraSeguimientoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OrdenCompraSeguimientoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrdenCompraSeguimientoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OrdenCompraSeguimientoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrdenCompraSeguimientoPayload>
          }
          findFirst: {
            args: Prisma.OrdenCompraSeguimientoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrdenCompraSeguimientoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OrdenCompraSeguimientoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrdenCompraSeguimientoPayload>
          }
          findMany: {
            args: Prisma.OrdenCompraSeguimientoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrdenCompraSeguimientoPayload>[]
          }
          create: {
            args: Prisma.OrdenCompraSeguimientoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrdenCompraSeguimientoPayload>
          }
          createMany: {
            args: Prisma.OrdenCompraSeguimientoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OrdenCompraSeguimientoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrdenCompraSeguimientoPayload>[]
          }
          delete: {
            args: Prisma.OrdenCompraSeguimientoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrdenCompraSeguimientoPayload>
          }
          update: {
            args: Prisma.OrdenCompraSeguimientoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrdenCompraSeguimientoPayload>
          }
          deleteMany: {
            args: Prisma.OrdenCompraSeguimientoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OrdenCompraSeguimientoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.OrdenCompraSeguimientoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrdenCompraSeguimientoPayload>
          }
          aggregate: {
            args: Prisma.OrdenCompraSeguimientoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOrdenCompraSeguimiento>
          }
          groupBy: {
            args: Prisma.OrdenCompraSeguimientoGroupByArgs<ExtArgs>
            result: $Utils.Optional<OrdenCompraSeguimientoGroupByOutputType>[]
          }
          count: {
            args: Prisma.OrdenCompraSeguimientoCountArgs<ExtArgs>
            result: $Utils.Optional<OrdenCompraSeguimientoCountAggregateOutputType> | number
          }
        }
      }
      ManoObraProyecto: {
        payload: Prisma.$ManoObraProyectoPayload<ExtArgs>
        fields: Prisma.ManoObraProyectoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ManoObraProyectoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ManoObraProyectoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ManoObraProyectoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ManoObraProyectoPayload>
          }
          findFirst: {
            args: Prisma.ManoObraProyectoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ManoObraProyectoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ManoObraProyectoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ManoObraProyectoPayload>
          }
          findMany: {
            args: Prisma.ManoObraProyectoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ManoObraProyectoPayload>[]
          }
          create: {
            args: Prisma.ManoObraProyectoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ManoObraProyectoPayload>
          }
          createMany: {
            args: Prisma.ManoObraProyectoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ManoObraProyectoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ManoObraProyectoPayload>[]
          }
          delete: {
            args: Prisma.ManoObraProyectoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ManoObraProyectoPayload>
          }
          update: {
            args: Prisma.ManoObraProyectoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ManoObraProyectoPayload>
          }
          deleteMany: {
            args: Prisma.ManoObraProyectoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ManoObraProyectoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ManoObraProyectoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ManoObraProyectoPayload>
          }
          aggregate: {
            args: Prisma.ManoObraProyectoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateManoObraProyecto>
          }
          groupBy: {
            args: Prisma.ManoObraProyectoGroupByArgs<ExtArgs>
            result: $Utils.Optional<ManoObraProyectoGroupByOutputType>[]
          }
          count: {
            args: Prisma.ManoObraProyectoCountArgs<ExtArgs>
            result: $Utils.Optional<ManoObraProyectoCountAggregateOutputType> | number
          }
        }
      }
      PagoEvmProcesado: {
        payload: Prisma.$PagoEvmProcesadoPayload<ExtArgs>
        fields: Prisma.PagoEvmProcesadoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PagoEvmProcesadoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PagoEvmProcesadoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PagoEvmProcesadoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PagoEvmProcesadoPayload>
          }
          findFirst: {
            args: Prisma.PagoEvmProcesadoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PagoEvmProcesadoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PagoEvmProcesadoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PagoEvmProcesadoPayload>
          }
          findMany: {
            args: Prisma.PagoEvmProcesadoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PagoEvmProcesadoPayload>[]
          }
          create: {
            args: Prisma.PagoEvmProcesadoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PagoEvmProcesadoPayload>
          }
          createMany: {
            args: Prisma.PagoEvmProcesadoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PagoEvmProcesadoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PagoEvmProcesadoPayload>[]
          }
          delete: {
            args: Prisma.PagoEvmProcesadoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PagoEvmProcesadoPayload>
          }
          update: {
            args: Prisma.PagoEvmProcesadoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PagoEvmProcesadoPayload>
          }
          deleteMany: {
            args: Prisma.PagoEvmProcesadoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PagoEvmProcesadoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PagoEvmProcesadoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PagoEvmProcesadoPayload>
          }
          aggregate: {
            args: Prisma.PagoEvmProcesadoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePagoEvmProcesado>
          }
          groupBy: {
            args: Prisma.PagoEvmProcesadoGroupByArgs<ExtArgs>
            result: $Utils.Optional<PagoEvmProcesadoGroupByOutputType>[]
          }
          count: {
            args: Prisma.PagoEvmProcesadoCountArgs<ExtArgs>
            result: $Utils.Optional<PagoEvmProcesadoCountAggregateOutputType> | number
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
      MaterialConsumidoObra: {
        payload: Prisma.$MaterialConsumidoObraPayload<ExtArgs>
        fields: Prisma.MaterialConsumidoObraFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MaterialConsumidoObraFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MaterialConsumidoObraPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MaterialConsumidoObraFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MaterialConsumidoObraPayload>
          }
          findFirst: {
            args: Prisma.MaterialConsumidoObraFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MaterialConsumidoObraPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MaterialConsumidoObraFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MaterialConsumidoObraPayload>
          }
          findMany: {
            args: Prisma.MaterialConsumidoObraFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MaterialConsumidoObraPayload>[]
          }
          create: {
            args: Prisma.MaterialConsumidoObraCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MaterialConsumidoObraPayload>
          }
          createMany: {
            args: Prisma.MaterialConsumidoObraCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MaterialConsumidoObraCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MaterialConsumidoObraPayload>[]
          }
          delete: {
            args: Prisma.MaterialConsumidoObraDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MaterialConsumidoObraPayload>
          }
          update: {
            args: Prisma.MaterialConsumidoObraUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MaterialConsumidoObraPayload>
          }
          deleteMany: {
            args: Prisma.MaterialConsumidoObraDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MaterialConsumidoObraUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.MaterialConsumidoObraUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MaterialConsumidoObraPayload>
          }
          aggregate: {
            args: Prisma.MaterialConsumidoObraAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMaterialConsumidoObra>
          }
          groupBy: {
            args: Prisma.MaterialConsumidoObraGroupByArgs<ExtArgs>
            result: $Utils.Optional<MaterialConsumidoObraGroupByOutputType>[]
          }
          count: {
            args: Prisma.MaterialConsumidoObraCountArgs<ExtArgs>
            result: $Utils.Optional<MaterialConsumidoObraCountAggregateOutputType> | number
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
    ac_comprometido: Decimal | null
    ac_ejercido: Decimal | null
  }

  export type ProgramacionObraSumAggregateOutputType = {
    pct_avance_real: Decimal | null
    cpi: Decimal | null
    spi: Decimal | null
    eac: Decimal | null
    bac: Decimal | null
    ac_comprometido: Decimal | null
    ac_ejercido: Decimal | null
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
    ac_comprometido: Decimal | null
    ac_ejercido: Decimal | null
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
    ac_comprometido: Decimal | null
    ac_ejercido: Decimal | null
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
    ac_comprometido: number
    ac_ejercido: number
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
    ac_comprometido?: true
    ac_ejercido?: true
  }

  export type ProgramacionObraSumAggregateInputType = {
    pct_avance_real?: true
    cpi?: true
    spi?: true
    eac?: true
    bac?: true
    ac_comprometido?: true
    ac_ejercido?: true
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
    ac_comprometido?: true
    ac_ejercido?: true
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
    ac_comprometido?: true
    ac_ejercido?: true
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
    ac_comprometido?: true
    ac_ejercido?: true
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
    ac_comprometido: Decimal
    ac_ejercido: Decimal
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
    ac_comprometido?: boolean
    ac_ejercido?: boolean
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
    ac_comprometido?: boolean
    ac_ejercido?: boolean
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
    ac_comprometido?: boolean
    ac_ejercido?: boolean
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
      ac_comprometido: Prisma.Decimal
      ac_ejercido: Prisma.Decimal
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
    readonly ac_comprometido: FieldRef<"ProgramacionObra", 'Decimal'>
    readonly ac_ejercido: FieldRef<"ProgramacionObra", 'Decimal'>
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
   * Model OrdenCompraSeguimiento
   */

  export type AggregateOrdenCompraSeguimiento = {
    _count: OrdenCompraSeguimientoCountAggregateOutputType | null
    _avg: OrdenCompraSeguimientoAvgAggregateOutputType | null
    _sum: OrdenCompraSeguimientoSumAggregateOutputType | null
    _min: OrdenCompraSeguimientoMinAggregateOutputType | null
    _max: OrdenCompraSeguimientoMaxAggregateOutputType | null
  }

  export type OrdenCompraSeguimientoAvgAggregateOutputType = {
    monto_comprometido: Decimal | null
    monto_ejercido: Decimal | null
  }

  export type OrdenCompraSeguimientoSumAggregateOutputType = {
    monto_comprometido: Decimal | null
    monto_ejercido: Decimal | null
  }

  export type OrdenCompraSeguimientoMinAggregateOutputType = {
    id: string | null
    oc_id: string | null
    tenant_id: string | null
    proyecto_id: string | null
    concepto_id: string | null
    monto_comprometido: Decimal | null
    monto_ejercido: Decimal | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type OrdenCompraSeguimientoMaxAggregateOutputType = {
    id: string | null
    oc_id: string | null
    tenant_id: string | null
    proyecto_id: string | null
    concepto_id: string | null
    monto_comprometido: Decimal | null
    monto_ejercido: Decimal | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type OrdenCompraSeguimientoCountAggregateOutputType = {
    id: number
    oc_id: number
    tenant_id: number
    proyecto_id: number
    concepto_id: number
    monto_comprometido: number
    monto_ejercido: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type OrdenCompraSeguimientoAvgAggregateInputType = {
    monto_comprometido?: true
    monto_ejercido?: true
  }

  export type OrdenCompraSeguimientoSumAggregateInputType = {
    monto_comprometido?: true
    monto_ejercido?: true
  }

  export type OrdenCompraSeguimientoMinAggregateInputType = {
    id?: true
    oc_id?: true
    tenant_id?: true
    proyecto_id?: true
    concepto_id?: true
    monto_comprometido?: true
    monto_ejercido?: true
    created_at?: true
    updated_at?: true
  }

  export type OrdenCompraSeguimientoMaxAggregateInputType = {
    id?: true
    oc_id?: true
    tenant_id?: true
    proyecto_id?: true
    concepto_id?: true
    monto_comprometido?: true
    monto_ejercido?: true
    created_at?: true
    updated_at?: true
  }

  export type OrdenCompraSeguimientoCountAggregateInputType = {
    id?: true
    oc_id?: true
    tenant_id?: true
    proyecto_id?: true
    concepto_id?: true
    monto_comprometido?: true
    monto_ejercido?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type OrdenCompraSeguimientoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OrdenCompraSeguimiento to aggregate.
     */
    where?: OrdenCompraSeguimientoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrdenCompraSeguimientos to fetch.
     */
    orderBy?: OrdenCompraSeguimientoOrderByWithRelationInput | OrdenCompraSeguimientoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OrdenCompraSeguimientoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrdenCompraSeguimientos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrdenCompraSeguimientos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OrdenCompraSeguimientos
    **/
    _count?: true | OrdenCompraSeguimientoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OrdenCompraSeguimientoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OrdenCompraSeguimientoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OrdenCompraSeguimientoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OrdenCompraSeguimientoMaxAggregateInputType
  }

  export type GetOrdenCompraSeguimientoAggregateType<T extends OrdenCompraSeguimientoAggregateArgs> = {
        [P in keyof T & keyof AggregateOrdenCompraSeguimiento]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOrdenCompraSeguimiento[P]>
      : GetScalarType<T[P], AggregateOrdenCompraSeguimiento[P]>
  }




  export type OrdenCompraSeguimientoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrdenCompraSeguimientoWhereInput
    orderBy?: OrdenCompraSeguimientoOrderByWithAggregationInput | OrdenCompraSeguimientoOrderByWithAggregationInput[]
    by: OrdenCompraSeguimientoScalarFieldEnum[] | OrdenCompraSeguimientoScalarFieldEnum
    having?: OrdenCompraSeguimientoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OrdenCompraSeguimientoCountAggregateInputType | true
    _avg?: OrdenCompraSeguimientoAvgAggregateInputType
    _sum?: OrdenCompraSeguimientoSumAggregateInputType
    _min?: OrdenCompraSeguimientoMinAggregateInputType
    _max?: OrdenCompraSeguimientoMaxAggregateInputType
  }

  export type OrdenCompraSeguimientoGroupByOutputType = {
    id: string
    oc_id: string
    tenant_id: string
    proyecto_id: string
    concepto_id: string
    monto_comprometido: Decimal
    monto_ejercido: Decimal
    created_at: Date
    updated_at: Date
    _count: OrdenCompraSeguimientoCountAggregateOutputType | null
    _avg: OrdenCompraSeguimientoAvgAggregateOutputType | null
    _sum: OrdenCompraSeguimientoSumAggregateOutputType | null
    _min: OrdenCompraSeguimientoMinAggregateOutputType | null
    _max: OrdenCompraSeguimientoMaxAggregateOutputType | null
  }

  type GetOrdenCompraSeguimientoGroupByPayload<T extends OrdenCompraSeguimientoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OrdenCompraSeguimientoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OrdenCompraSeguimientoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OrdenCompraSeguimientoGroupByOutputType[P]>
            : GetScalarType<T[P], OrdenCompraSeguimientoGroupByOutputType[P]>
        }
      >
    >


  export type OrdenCompraSeguimientoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    oc_id?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    concepto_id?: boolean
    monto_comprometido?: boolean
    monto_ejercido?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["ordenCompraSeguimiento"]>

  export type OrdenCompraSeguimientoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    oc_id?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    concepto_id?: boolean
    monto_comprometido?: boolean
    monto_ejercido?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["ordenCompraSeguimiento"]>

  export type OrdenCompraSeguimientoSelectScalar = {
    id?: boolean
    oc_id?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    concepto_id?: boolean
    monto_comprometido?: boolean
    monto_ejercido?: boolean
    created_at?: boolean
    updated_at?: boolean
  }


  export type $OrdenCompraSeguimientoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OrdenCompraSeguimiento"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      oc_id: string
      tenant_id: string
      proyecto_id: string
      concepto_id: string
      monto_comprometido: Prisma.Decimal
      monto_ejercido: Prisma.Decimal
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["ordenCompraSeguimiento"]>
    composites: {}
  }

  type OrdenCompraSeguimientoGetPayload<S extends boolean | null | undefined | OrdenCompraSeguimientoDefaultArgs> = $Result.GetResult<Prisma.$OrdenCompraSeguimientoPayload, S>

  type OrdenCompraSeguimientoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<OrdenCompraSeguimientoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: OrdenCompraSeguimientoCountAggregateInputType | true
    }

  export interface OrdenCompraSeguimientoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OrdenCompraSeguimiento'], meta: { name: 'OrdenCompraSeguimiento' } }
    /**
     * Find zero or one OrdenCompraSeguimiento that matches the filter.
     * @param {OrdenCompraSeguimientoFindUniqueArgs} args - Arguments to find a OrdenCompraSeguimiento
     * @example
     * // Get one OrdenCompraSeguimiento
     * const ordenCompraSeguimiento = await prisma.ordenCompraSeguimiento.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OrdenCompraSeguimientoFindUniqueArgs>(args: SelectSubset<T, OrdenCompraSeguimientoFindUniqueArgs<ExtArgs>>): Prisma__OrdenCompraSeguimientoClient<$Result.GetResult<Prisma.$OrdenCompraSeguimientoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one OrdenCompraSeguimiento that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {OrdenCompraSeguimientoFindUniqueOrThrowArgs} args - Arguments to find a OrdenCompraSeguimiento
     * @example
     * // Get one OrdenCompraSeguimiento
     * const ordenCompraSeguimiento = await prisma.ordenCompraSeguimiento.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OrdenCompraSeguimientoFindUniqueOrThrowArgs>(args: SelectSubset<T, OrdenCompraSeguimientoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OrdenCompraSeguimientoClient<$Result.GetResult<Prisma.$OrdenCompraSeguimientoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first OrdenCompraSeguimiento that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrdenCompraSeguimientoFindFirstArgs} args - Arguments to find a OrdenCompraSeguimiento
     * @example
     * // Get one OrdenCompraSeguimiento
     * const ordenCompraSeguimiento = await prisma.ordenCompraSeguimiento.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OrdenCompraSeguimientoFindFirstArgs>(args?: SelectSubset<T, OrdenCompraSeguimientoFindFirstArgs<ExtArgs>>): Prisma__OrdenCompraSeguimientoClient<$Result.GetResult<Prisma.$OrdenCompraSeguimientoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first OrdenCompraSeguimiento that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrdenCompraSeguimientoFindFirstOrThrowArgs} args - Arguments to find a OrdenCompraSeguimiento
     * @example
     * // Get one OrdenCompraSeguimiento
     * const ordenCompraSeguimiento = await prisma.ordenCompraSeguimiento.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OrdenCompraSeguimientoFindFirstOrThrowArgs>(args?: SelectSubset<T, OrdenCompraSeguimientoFindFirstOrThrowArgs<ExtArgs>>): Prisma__OrdenCompraSeguimientoClient<$Result.GetResult<Prisma.$OrdenCompraSeguimientoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more OrdenCompraSeguimientos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrdenCompraSeguimientoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OrdenCompraSeguimientos
     * const ordenCompraSeguimientos = await prisma.ordenCompraSeguimiento.findMany()
     * 
     * // Get first 10 OrdenCompraSeguimientos
     * const ordenCompraSeguimientos = await prisma.ordenCompraSeguimiento.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const ordenCompraSeguimientoWithIdOnly = await prisma.ordenCompraSeguimiento.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OrdenCompraSeguimientoFindManyArgs>(args?: SelectSubset<T, OrdenCompraSeguimientoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrdenCompraSeguimientoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a OrdenCompraSeguimiento.
     * @param {OrdenCompraSeguimientoCreateArgs} args - Arguments to create a OrdenCompraSeguimiento.
     * @example
     * // Create one OrdenCompraSeguimiento
     * const OrdenCompraSeguimiento = await prisma.ordenCompraSeguimiento.create({
     *   data: {
     *     // ... data to create a OrdenCompraSeguimiento
     *   }
     * })
     * 
     */
    create<T extends OrdenCompraSeguimientoCreateArgs>(args: SelectSubset<T, OrdenCompraSeguimientoCreateArgs<ExtArgs>>): Prisma__OrdenCompraSeguimientoClient<$Result.GetResult<Prisma.$OrdenCompraSeguimientoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many OrdenCompraSeguimientos.
     * @param {OrdenCompraSeguimientoCreateManyArgs} args - Arguments to create many OrdenCompraSeguimientos.
     * @example
     * // Create many OrdenCompraSeguimientos
     * const ordenCompraSeguimiento = await prisma.ordenCompraSeguimiento.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OrdenCompraSeguimientoCreateManyArgs>(args?: SelectSubset<T, OrdenCompraSeguimientoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many OrdenCompraSeguimientos and returns the data saved in the database.
     * @param {OrdenCompraSeguimientoCreateManyAndReturnArgs} args - Arguments to create many OrdenCompraSeguimientos.
     * @example
     * // Create many OrdenCompraSeguimientos
     * const ordenCompraSeguimiento = await prisma.ordenCompraSeguimiento.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many OrdenCompraSeguimientos and only return the `id`
     * const ordenCompraSeguimientoWithIdOnly = await prisma.ordenCompraSeguimiento.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OrdenCompraSeguimientoCreateManyAndReturnArgs>(args?: SelectSubset<T, OrdenCompraSeguimientoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrdenCompraSeguimientoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a OrdenCompraSeguimiento.
     * @param {OrdenCompraSeguimientoDeleteArgs} args - Arguments to delete one OrdenCompraSeguimiento.
     * @example
     * // Delete one OrdenCompraSeguimiento
     * const OrdenCompraSeguimiento = await prisma.ordenCompraSeguimiento.delete({
     *   where: {
     *     // ... filter to delete one OrdenCompraSeguimiento
     *   }
     * })
     * 
     */
    delete<T extends OrdenCompraSeguimientoDeleteArgs>(args: SelectSubset<T, OrdenCompraSeguimientoDeleteArgs<ExtArgs>>): Prisma__OrdenCompraSeguimientoClient<$Result.GetResult<Prisma.$OrdenCompraSeguimientoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one OrdenCompraSeguimiento.
     * @param {OrdenCompraSeguimientoUpdateArgs} args - Arguments to update one OrdenCompraSeguimiento.
     * @example
     * // Update one OrdenCompraSeguimiento
     * const ordenCompraSeguimiento = await prisma.ordenCompraSeguimiento.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OrdenCompraSeguimientoUpdateArgs>(args: SelectSubset<T, OrdenCompraSeguimientoUpdateArgs<ExtArgs>>): Prisma__OrdenCompraSeguimientoClient<$Result.GetResult<Prisma.$OrdenCompraSeguimientoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more OrdenCompraSeguimientos.
     * @param {OrdenCompraSeguimientoDeleteManyArgs} args - Arguments to filter OrdenCompraSeguimientos to delete.
     * @example
     * // Delete a few OrdenCompraSeguimientos
     * const { count } = await prisma.ordenCompraSeguimiento.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OrdenCompraSeguimientoDeleteManyArgs>(args?: SelectSubset<T, OrdenCompraSeguimientoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OrdenCompraSeguimientos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrdenCompraSeguimientoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OrdenCompraSeguimientos
     * const ordenCompraSeguimiento = await prisma.ordenCompraSeguimiento.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OrdenCompraSeguimientoUpdateManyArgs>(args: SelectSubset<T, OrdenCompraSeguimientoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one OrdenCompraSeguimiento.
     * @param {OrdenCompraSeguimientoUpsertArgs} args - Arguments to update or create a OrdenCompraSeguimiento.
     * @example
     * // Update or create a OrdenCompraSeguimiento
     * const ordenCompraSeguimiento = await prisma.ordenCompraSeguimiento.upsert({
     *   create: {
     *     // ... data to create a OrdenCompraSeguimiento
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OrdenCompraSeguimiento we want to update
     *   }
     * })
     */
    upsert<T extends OrdenCompraSeguimientoUpsertArgs>(args: SelectSubset<T, OrdenCompraSeguimientoUpsertArgs<ExtArgs>>): Prisma__OrdenCompraSeguimientoClient<$Result.GetResult<Prisma.$OrdenCompraSeguimientoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of OrdenCompraSeguimientos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrdenCompraSeguimientoCountArgs} args - Arguments to filter OrdenCompraSeguimientos to count.
     * @example
     * // Count the number of OrdenCompraSeguimientos
     * const count = await prisma.ordenCompraSeguimiento.count({
     *   where: {
     *     // ... the filter for the OrdenCompraSeguimientos we want to count
     *   }
     * })
    **/
    count<T extends OrdenCompraSeguimientoCountArgs>(
      args?: Subset<T, OrdenCompraSeguimientoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OrdenCompraSeguimientoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OrdenCompraSeguimiento.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrdenCompraSeguimientoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends OrdenCompraSeguimientoAggregateArgs>(args: Subset<T, OrdenCompraSeguimientoAggregateArgs>): Prisma.PrismaPromise<GetOrdenCompraSeguimientoAggregateType<T>>

    /**
     * Group by OrdenCompraSeguimiento.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrdenCompraSeguimientoGroupByArgs} args - Group by arguments.
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
      T extends OrdenCompraSeguimientoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OrdenCompraSeguimientoGroupByArgs['orderBy'] }
        : { orderBy?: OrdenCompraSeguimientoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, OrdenCompraSeguimientoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrdenCompraSeguimientoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OrdenCompraSeguimiento model
   */
  readonly fields: OrdenCompraSeguimientoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OrdenCompraSeguimiento.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OrdenCompraSeguimientoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the OrdenCompraSeguimiento model
   */ 
  interface OrdenCompraSeguimientoFieldRefs {
    readonly id: FieldRef<"OrdenCompraSeguimiento", 'String'>
    readonly oc_id: FieldRef<"OrdenCompraSeguimiento", 'String'>
    readonly tenant_id: FieldRef<"OrdenCompraSeguimiento", 'String'>
    readonly proyecto_id: FieldRef<"OrdenCompraSeguimiento", 'String'>
    readonly concepto_id: FieldRef<"OrdenCompraSeguimiento", 'String'>
    readonly monto_comprometido: FieldRef<"OrdenCompraSeguimiento", 'Decimal'>
    readonly monto_ejercido: FieldRef<"OrdenCompraSeguimiento", 'Decimal'>
    readonly created_at: FieldRef<"OrdenCompraSeguimiento", 'DateTime'>
    readonly updated_at: FieldRef<"OrdenCompraSeguimiento", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * OrdenCompraSeguimiento findUnique
   */
  export type OrdenCompraSeguimientoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdenCompraSeguimiento
     */
    select?: OrdenCompraSeguimientoSelect<ExtArgs> | null
    /**
     * Filter, which OrdenCompraSeguimiento to fetch.
     */
    where: OrdenCompraSeguimientoWhereUniqueInput
  }

  /**
   * OrdenCompraSeguimiento findUniqueOrThrow
   */
  export type OrdenCompraSeguimientoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdenCompraSeguimiento
     */
    select?: OrdenCompraSeguimientoSelect<ExtArgs> | null
    /**
     * Filter, which OrdenCompraSeguimiento to fetch.
     */
    where: OrdenCompraSeguimientoWhereUniqueInput
  }

  /**
   * OrdenCompraSeguimiento findFirst
   */
  export type OrdenCompraSeguimientoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdenCompraSeguimiento
     */
    select?: OrdenCompraSeguimientoSelect<ExtArgs> | null
    /**
     * Filter, which OrdenCompraSeguimiento to fetch.
     */
    where?: OrdenCompraSeguimientoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrdenCompraSeguimientos to fetch.
     */
    orderBy?: OrdenCompraSeguimientoOrderByWithRelationInput | OrdenCompraSeguimientoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OrdenCompraSeguimientos.
     */
    cursor?: OrdenCompraSeguimientoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrdenCompraSeguimientos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrdenCompraSeguimientos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OrdenCompraSeguimientos.
     */
    distinct?: OrdenCompraSeguimientoScalarFieldEnum | OrdenCompraSeguimientoScalarFieldEnum[]
  }

  /**
   * OrdenCompraSeguimiento findFirstOrThrow
   */
  export type OrdenCompraSeguimientoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdenCompraSeguimiento
     */
    select?: OrdenCompraSeguimientoSelect<ExtArgs> | null
    /**
     * Filter, which OrdenCompraSeguimiento to fetch.
     */
    where?: OrdenCompraSeguimientoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrdenCompraSeguimientos to fetch.
     */
    orderBy?: OrdenCompraSeguimientoOrderByWithRelationInput | OrdenCompraSeguimientoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OrdenCompraSeguimientos.
     */
    cursor?: OrdenCompraSeguimientoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrdenCompraSeguimientos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrdenCompraSeguimientos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OrdenCompraSeguimientos.
     */
    distinct?: OrdenCompraSeguimientoScalarFieldEnum | OrdenCompraSeguimientoScalarFieldEnum[]
  }

  /**
   * OrdenCompraSeguimiento findMany
   */
  export type OrdenCompraSeguimientoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdenCompraSeguimiento
     */
    select?: OrdenCompraSeguimientoSelect<ExtArgs> | null
    /**
     * Filter, which OrdenCompraSeguimientos to fetch.
     */
    where?: OrdenCompraSeguimientoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrdenCompraSeguimientos to fetch.
     */
    orderBy?: OrdenCompraSeguimientoOrderByWithRelationInput | OrdenCompraSeguimientoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OrdenCompraSeguimientos.
     */
    cursor?: OrdenCompraSeguimientoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrdenCompraSeguimientos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrdenCompraSeguimientos.
     */
    skip?: number
    distinct?: OrdenCompraSeguimientoScalarFieldEnum | OrdenCompraSeguimientoScalarFieldEnum[]
  }

  /**
   * OrdenCompraSeguimiento create
   */
  export type OrdenCompraSeguimientoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdenCompraSeguimiento
     */
    select?: OrdenCompraSeguimientoSelect<ExtArgs> | null
    /**
     * The data needed to create a OrdenCompraSeguimiento.
     */
    data: XOR<OrdenCompraSeguimientoCreateInput, OrdenCompraSeguimientoUncheckedCreateInput>
  }

  /**
   * OrdenCompraSeguimiento createMany
   */
  export type OrdenCompraSeguimientoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OrdenCompraSeguimientos.
     */
    data: OrdenCompraSeguimientoCreateManyInput | OrdenCompraSeguimientoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OrdenCompraSeguimiento createManyAndReturn
   */
  export type OrdenCompraSeguimientoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdenCompraSeguimiento
     */
    select?: OrdenCompraSeguimientoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many OrdenCompraSeguimientos.
     */
    data: OrdenCompraSeguimientoCreateManyInput | OrdenCompraSeguimientoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OrdenCompraSeguimiento update
   */
  export type OrdenCompraSeguimientoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdenCompraSeguimiento
     */
    select?: OrdenCompraSeguimientoSelect<ExtArgs> | null
    /**
     * The data needed to update a OrdenCompraSeguimiento.
     */
    data: XOR<OrdenCompraSeguimientoUpdateInput, OrdenCompraSeguimientoUncheckedUpdateInput>
    /**
     * Choose, which OrdenCompraSeguimiento to update.
     */
    where: OrdenCompraSeguimientoWhereUniqueInput
  }

  /**
   * OrdenCompraSeguimiento updateMany
   */
  export type OrdenCompraSeguimientoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OrdenCompraSeguimientos.
     */
    data: XOR<OrdenCompraSeguimientoUpdateManyMutationInput, OrdenCompraSeguimientoUncheckedUpdateManyInput>
    /**
     * Filter which OrdenCompraSeguimientos to update
     */
    where?: OrdenCompraSeguimientoWhereInput
  }

  /**
   * OrdenCompraSeguimiento upsert
   */
  export type OrdenCompraSeguimientoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdenCompraSeguimiento
     */
    select?: OrdenCompraSeguimientoSelect<ExtArgs> | null
    /**
     * The filter to search for the OrdenCompraSeguimiento to update in case it exists.
     */
    where: OrdenCompraSeguimientoWhereUniqueInput
    /**
     * In case the OrdenCompraSeguimiento found by the `where` argument doesn't exist, create a new OrdenCompraSeguimiento with this data.
     */
    create: XOR<OrdenCompraSeguimientoCreateInput, OrdenCompraSeguimientoUncheckedCreateInput>
    /**
     * In case the OrdenCompraSeguimiento was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OrdenCompraSeguimientoUpdateInput, OrdenCompraSeguimientoUncheckedUpdateInput>
  }

  /**
   * OrdenCompraSeguimiento delete
   */
  export type OrdenCompraSeguimientoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdenCompraSeguimiento
     */
    select?: OrdenCompraSeguimientoSelect<ExtArgs> | null
    /**
     * Filter which OrdenCompraSeguimiento to delete.
     */
    where: OrdenCompraSeguimientoWhereUniqueInput
  }

  /**
   * OrdenCompraSeguimiento deleteMany
   */
  export type OrdenCompraSeguimientoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OrdenCompraSeguimientos to delete
     */
    where?: OrdenCompraSeguimientoWhereInput
  }

  /**
   * OrdenCompraSeguimiento without action
   */
  export type OrdenCompraSeguimientoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdenCompraSeguimiento
     */
    select?: OrdenCompraSeguimientoSelect<ExtArgs> | null
  }


  /**
   * Model ManoObraProyecto
   */

  export type AggregateManoObraProyecto = {
    _count: ManoObraProyectoCountAggregateOutputType | null
    _avg: ManoObraProyectoAvgAggregateOutputType | null
    _sum: ManoObraProyectoSumAggregateOutputType | null
    _min: ManoObraProyectoMinAggregateOutputType | null
    _max: ManoObraProyectoMaxAggregateOutputType | null
  }

  export type ManoObraProyectoAvgAggregateOutputType = {
    monto_acumulado: Decimal | null
  }

  export type ManoObraProyectoSumAggregateOutputType = {
    monto_acumulado: Decimal | null
  }

  export type ManoObraProyectoMinAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    proyecto_id: string | null
    monto_acumulado: Decimal | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type ManoObraProyectoMaxAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    proyecto_id: string | null
    monto_acumulado: Decimal | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type ManoObraProyectoCountAggregateOutputType = {
    id: number
    tenant_id: number
    proyecto_id: number
    monto_acumulado: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type ManoObraProyectoAvgAggregateInputType = {
    monto_acumulado?: true
  }

  export type ManoObraProyectoSumAggregateInputType = {
    monto_acumulado?: true
  }

  export type ManoObraProyectoMinAggregateInputType = {
    id?: true
    tenant_id?: true
    proyecto_id?: true
    monto_acumulado?: true
    created_at?: true
    updated_at?: true
  }

  export type ManoObraProyectoMaxAggregateInputType = {
    id?: true
    tenant_id?: true
    proyecto_id?: true
    monto_acumulado?: true
    created_at?: true
    updated_at?: true
  }

  export type ManoObraProyectoCountAggregateInputType = {
    id?: true
    tenant_id?: true
    proyecto_id?: true
    monto_acumulado?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type ManoObraProyectoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ManoObraProyecto to aggregate.
     */
    where?: ManoObraProyectoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ManoObraProyectos to fetch.
     */
    orderBy?: ManoObraProyectoOrderByWithRelationInput | ManoObraProyectoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ManoObraProyectoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ManoObraProyectos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ManoObraProyectos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ManoObraProyectos
    **/
    _count?: true | ManoObraProyectoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ManoObraProyectoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ManoObraProyectoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ManoObraProyectoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ManoObraProyectoMaxAggregateInputType
  }

  export type GetManoObraProyectoAggregateType<T extends ManoObraProyectoAggregateArgs> = {
        [P in keyof T & keyof AggregateManoObraProyecto]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateManoObraProyecto[P]>
      : GetScalarType<T[P], AggregateManoObraProyecto[P]>
  }




  export type ManoObraProyectoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ManoObraProyectoWhereInput
    orderBy?: ManoObraProyectoOrderByWithAggregationInput | ManoObraProyectoOrderByWithAggregationInput[]
    by: ManoObraProyectoScalarFieldEnum[] | ManoObraProyectoScalarFieldEnum
    having?: ManoObraProyectoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ManoObraProyectoCountAggregateInputType | true
    _avg?: ManoObraProyectoAvgAggregateInputType
    _sum?: ManoObraProyectoSumAggregateInputType
    _min?: ManoObraProyectoMinAggregateInputType
    _max?: ManoObraProyectoMaxAggregateInputType
  }

  export type ManoObraProyectoGroupByOutputType = {
    id: string
    tenant_id: string
    proyecto_id: string
    monto_acumulado: Decimal
    created_at: Date
    updated_at: Date
    _count: ManoObraProyectoCountAggregateOutputType | null
    _avg: ManoObraProyectoAvgAggregateOutputType | null
    _sum: ManoObraProyectoSumAggregateOutputType | null
    _min: ManoObraProyectoMinAggregateOutputType | null
    _max: ManoObraProyectoMaxAggregateOutputType | null
  }

  type GetManoObraProyectoGroupByPayload<T extends ManoObraProyectoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ManoObraProyectoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ManoObraProyectoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ManoObraProyectoGroupByOutputType[P]>
            : GetScalarType<T[P], ManoObraProyectoGroupByOutputType[P]>
        }
      >
    >


  export type ManoObraProyectoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    monto_acumulado?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["manoObraProyecto"]>

  export type ManoObraProyectoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    monto_acumulado?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["manoObraProyecto"]>

  export type ManoObraProyectoSelectScalar = {
    id?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    monto_acumulado?: boolean
    created_at?: boolean
    updated_at?: boolean
  }


  export type $ManoObraProyectoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ManoObraProyecto"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenant_id: string
      proyecto_id: string
      monto_acumulado: Prisma.Decimal
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["manoObraProyecto"]>
    composites: {}
  }

  type ManoObraProyectoGetPayload<S extends boolean | null | undefined | ManoObraProyectoDefaultArgs> = $Result.GetResult<Prisma.$ManoObraProyectoPayload, S>

  type ManoObraProyectoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ManoObraProyectoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ManoObraProyectoCountAggregateInputType | true
    }

  export interface ManoObraProyectoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ManoObraProyecto'], meta: { name: 'ManoObraProyecto' } }
    /**
     * Find zero or one ManoObraProyecto that matches the filter.
     * @param {ManoObraProyectoFindUniqueArgs} args - Arguments to find a ManoObraProyecto
     * @example
     * // Get one ManoObraProyecto
     * const manoObraProyecto = await prisma.manoObraProyecto.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ManoObraProyectoFindUniqueArgs>(args: SelectSubset<T, ManoObraProyectoFindUniqueArgs<ExtArgs>>): Prisma__ManoObraProyectoClient<$Result.GetResult<Prisma.$ManoObraProyectoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ManoObraProyecto that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ManoObraProyectoFindUniqueOrThrowArgs} args - Arguments to find a ManoObraProyecto
     * @example
     * // Get one ManoObraProyecto
     * const manoObraProyecto = await prisma.manoObraProyecto.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ManoObraProyectoFindUniqueOrThrowArgs>(args: SelectSubset<T, ManoObraProyectoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ManoObraProyectoClient<$Result.GetResult<Prisma.$ManoObraProyectoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ManoObraProyecto that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ManoObraProyectoFindFirstArgs} args - Arguments to find a ManoObraProyecto
     * @example
     * // Get one ManoObraProyecto
     * const manoObraProyecto = await prisma.manoObraProyecto.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ManoObraProyectoFindFirstArgs>(args?: SelectSubset<T, ManoObraProyectoFindFirstArgs<ExtArgs>>): Prisma__ManoObraProyectoClient<$Result.GetResult<Prisma.$ManoObraProyectoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ManoObraProyecto that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ManoObraProyectoFindFirstOrThrowArgs} args - Arguments to find a ManoObraProyecto
     * @example
     * // Get one ManoObraProyecto
     * const manoObraProyecto = await prisma.manoObraProyecto.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ManoObraProyectoFindFirstOrThrowArgs>(args?: SelectSubset<T, ManoObraProyectoFindFirstOrThrowArgs<ExtArgs>>): Prisma__ManoObraProyectoClient<$Result.GetResult<Prisma.$ManoObraProyectoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ManoObraProyectos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ManoObraProyectoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ManoObraProyectos
     * const manoObraProyectos = await prisma.manoObraProyecto.findMany()
     * 
     * // Get first 10 ManoObraProyectos
     * const manoObraProyectos = await prisma.manoObraProyecto.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const manoObraProyectoWithIdOnly = await prisma.manoObraProyecto.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ManoObraProyectoFindManyArgs>(args?: SelectSubset<T, ManoObraProyectoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ManoObraProyectoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ManoObraProyecto.
     * @param {ManoObraProyectoCreateArgs} args - Arguments to create a ManoObraProyecto.
     * @example
     * // Create one ManoObraProyecto
     * const ManoObraProyecto = await prisma.manoObraProyecto.create({
     *   data: {
     *     // ... data to create a ManoObraProyecto
     *   }
     * })
     * 
     */
    create<T extends ManoObraProyectoCreateArgs>(args: SelectSubset<T, ManoObraProyectoCreateArgs<ExtArgs>>): Prisma__ManoObraProyectoClient<$Result.GetResult<Prisma.$ManoObraProyectoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ManoObraProyectos.
     * @param {ManoObraProyectoCreateManyArgs} args - Arguments to create many ManoObraProyectos.
     * @example
     * // Create many ManoObraProyectos
     * const manoObraProyecto = await prisma.manoObraProyecto.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ManoObraProyectoCreateManyArgs>(args?: SelectSubset<T, ManoObraProyectoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ManoObraProyectos and returns the data saved in the database.
     * @param {ManoObraProyectoCreateManyAndReturnArgs} args - Arguments to create many ManoObraProyectos.
     * @example
     * // Create many ManoObraProyectos
     * const manoObraProyecto = await prisma.manoObraProyecto.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ManoObraProyectos and only return the `id`
     * const manoObraProyectoWithIdOnly = await prisma.manoObraProyecto.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ManoObraProyectoCreateManyAndReturnArgs>(args?: SelectSubset<T, ManoObraProyectoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ManoObraProyectoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ManoObraProyecto.
     * @param {ManoObraProyectoDeleteArgs} args - Arguments to delete one ManoObraProyecto.
     * @example
     * // Delete one ManoObraProyecto
     * const ManoObraProyecto = await prisma.manoObraProyecto.delete({
     *   where: {
     *     // ... filter to delete one ManoObraProyecto
     *   }
     * })
     * 
     */
    delete<T extends ManoObraProyectoDeleteArgs>(args: SelectSubset<T, ManoObraProyectoDeleteArgs<ExtArgs>>): Prisma__ManoObraProyectoClient<$Result.GetResult<Prisma.$ManoObraProyectoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ManoObraProyecto.
     * @param {ManoObraProyectoUpdateArgs} args - Arguments to update one ManoObraProyecto.
     * @example
     * // Update one ManoObraProyecto
     * const manoObraProyecto = await prisma.manoObraProyecto.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ManoObraProyectoUpdateArgs>(args: SelectSubset<T, ManoObraProyectoUpdateArgs<ExtArgs>>): Prisma__ManoObraProyectoClient<$Result.GetResult<Prisma.$ManoObraProyectoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ManoObraProyectos.
     * @param {ManoObraProyectoDeleteManyArgs} args - Arguments to filter ManoObraProyectos to delete.
     * @example
     * // Delete a few ManoObraProyectos
     * const { count } = await prisma.manoObraProyecto.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ManoObraProyectoDeleteManyArgs>(args?: SelectSubset<T, ManoObraProyectoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ManoObraProyectos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ManoObraProyectoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ManoObraProyectos
     * const manoObraProyecto = await prisma.manoObraProyecto.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ManoObraProyectoUpdateManyArgs>(args: SelectSubset<T, ManoObraProyectoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ManoObraProyecto.
     * @param {ManoObraProyectoUpsertArgs} args - Arguments to update or create a ManoObraProyecto.
     * @example
     * // Update or create a ManoObraProyecto
     * const manoObraProyecto = await prisma.manoObraProyecto.upsert({
     *   create: {
     *     // ... data to create a ManoObraProyecto
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ManoObraProyecto we want to update
     *   }
     * })
     */
    upsert<T extends ManoObraProyectoUpsertArgs>(args: SelectSubset<T, ManoObraProyectoUpsertArgs<ExtArgs>>): Prisma__ManoObraProyectoClient<$Result.GetResult<Prisma.$ManoObraProyectoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ManoObraProyectos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ManoObraProyectoCountArgs} args - Arguments to filter ManoObraProyectos to count.
     * @example
     * // Count the number of ManoObraProyectos
     * const count = await prisma.manoObraProyecto.count({
     *   where: {
     *     // ... the filter for the ManoObraProyectos we want to count
     *   }
     * })
    **/
    count<T extends ManoObraProyectoCountArgs>(
      args?: Subset<T, ManoObraProyectoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ManoObraProyectoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ManoObraProyecto.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ManoObraProyectoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ManoObraProyectoAggregateArgs>(args: Subset<T, ManoObraProyectoAggregateArgs>): Prisma.PrismaPromise<GetManoObraProyectoAggregateType<T>>

    /**
     * Group by ManoObraProyecto.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ManoObraProyectoGroupByArgs} args - Group by arguments.
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
      T extends ManoObraProyectoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ManoObraProyectoGroupByArgs['orderBy'] }
        : { orderBy?: ManoObraProyectoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ManoObraProyectoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetManoObraProyectoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ManoObraProyecto model
   */
  readonly fields: ManoObraProyectoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ManoObraProyecto.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ManoObraProyectoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the ManoObraProyecto model
   */ 
  interface ManoObraProyectoFieldRefs {
    readonly id: FieldRef<"ManoObraProyecto", 'String'>
    readonly tenant_id: FieldRef<"ManoObraProyecto", 'String'>
    readonly proyecto_id: FieldRef<"ManoObraProyecto", 'String'>
    readonly monto_acumulado: FieldRef<"ManoObraProyecto", 'Decimal'>
    readonly created_at: FieldRef<"ManoObraProyecto", 'DateTime'>
    readonly updated_at: FieldRef<"ManoObraProyecto", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ManoObraProyecto findUnique
   */
  export type ManoObraProyectoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ManoObraProyecto
     */
    select?: ManoObraProyectoSelect<ExtArgs> | null
    /**
     * Filter, which ManoObraProyecto to fetch.
     */
    where: ManoObraProyectoWhereUniqueInput
  }

  /**
   * ManoObraProyecto findUniqueOrThrow
   */
  export type ManoObraProyectoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ManoObraProyecto
     */
    select?: ManoObraProyectoSelect<ExtArgs> | null
    /**
     * Filter, which ManoObraProyecto to fetch.
     */
    where: ManoObraProyectoWhereUniqueInput
  }

  /**
   * ManoObraProyecto findFirst
   */
  export type ManoObraProyectoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ManoObraProyecto
     */
    select?: ManoObraProyectoSelect<ExtArgs> | null
    /**
     * Filter, which ManoObraProyecto to fetch.
     */
    where?: ManoObraProyectoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ManoObraProyectos to fetch.
     */
    orderBy?: ManoObraProyectoOrderByWithRelationInput | ManoObraProyectoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ManoObraProyectos.
     */
    cursor?: ManoObraProyectoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ManoObraProyectos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ManoObraProyectos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ManoObraProyectos.
     */
    distinct?: ManoObraProyectoScalarFieldEnum | ManoObraProyectoScalarFieldEnum[]
  }

  /**
   * ManoObraProyecto findFirstOrThrow
   */
  export type ManoObraProyectoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ManoObraProyecto
     */
    select?: ManoObraProyectoSelect<ExtArgs> | null
    /**
     * Filter, which ManoObraProyecto to fetch.
     */
    where?: ManoObraProyectoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ManoObraProyectos to fetch.
     */
    orderBy?: ManoObraProyectoOrderByWithRelationInput | ManoObraProyectoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ManoObraProyectos.
     */
    cursor?: ManoObraProyectoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ManoObraProyectos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ManoObraProyectos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ManoObraProyectos.
     */
    distinct?: ManoObraProyectoScalarFieldEnum | ManoObraProyectoScalarFieldEnum[]
  }

  /**
   * ManoObraProyecto findMany
   */
  export type ManoObraProyectoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ManoObraProyecto
     */
    select?: ManoObraProyectoSelect<ExtArgs> | null
    /**
     * Filter, which ManoObraProyectos to fetch.
     */
    where?: ManoObraProyectoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ManoObraProyectos to fetch.
     */
    orderBy?: ManoObraProyectoOrderByWithRelationInput | ManoObraProyectoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ManoObraProyectos.
     */
    cursor?: ManoObraProyectoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ManoObraProyectos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ManoObraProyectos.
     */
    skip?: number
    distinct?: ManoObraProyectoScalarFieldEnum | ManoObraProyectoScalarFieldEnum[]
  }

  /**
   * ManoObraProyecto create
   */
  export type ManoObraProyectoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ManoObraProyecto
     */
    select?: ManoObraProyectoSelect<ExtArgs> | null
    /**
     * The data needed to create a ManoObraProyecto.
     */
    data: XOR<ManoObraProyectoCreateInput, ManoObraProyectoUncheckedCreateInput>
  }

  /**
   * ManoObraProyecto createMany
   */
  export type ManoObraProyectoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ManoObraProyectos.
     */
    data: ManoObraProyectoCreateManyInput | ManoObraProyectoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ManoObraProyecto createManyAndReturn
   */
  export type ManoObraProyectoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ManoObraProyecto
     */
    select?: ManoObraProyectoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ManoObraProyectos.
     */
    data: ManoObraProyectoCreateManyInput | ManoObraProyectoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ManoObraProyecto update
   */
  export type ManoObraProyectoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ManoObraProyecto
     */
    select?: ManoObraProyectoSelect<ExtArgs> | null
    /**
     * The data needed to update a ManoObraProyecto.
     */
    data: XOR<ManoObraProyectoUpdateInput, ManoObraProyectoUncheckedUpdateInput>
    /**
     * Choose, which ManoObraProyecto to update.
     */
    where: ManoObraProyectoWhereUniqueInput
  }

  /**
   * ManoObraProyecto updateMany
   */
  export type ManoObraProyectoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ManoObraProyectos.
     */
    data: XOR<ManoObraProyectoUpdateManyMutationInput, ManoObraProyectoUncheckedUpdateManyInput>
    /**
     * Filter which ManoObraProyectos to update
     */
    where?: ManoObraProyectoWhereInput
  }

  /**
   * ManoObraProyecto upsert
   */
  export type ManoObraProyectoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ManoObraProyecto
     */
    select?: ManoObraProyectoSelect<ExtArgs> | null
    /**
     * The filter to search for the ManoObraProyecto to update in case it exists.
     */
    where: ManoObraProyectoWhereUniqueInput
    /**
     * In case the ManoObraProyecto found by the `where` argument doesn't exist, create a new ManoObraProyecto with this data.
     */
    create: XOR<ManoObraProyectoCreateInput, ManoObraProyectoUncheckedCreateInput>
    /**
     * In case the ManoObraProyecto was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ManoObraProyectoUpdateInput, ManoObraProyectoUncheckedUpdateInput>
  }

  /**
   * ManoObraProyecto delete
   */
  export type ManoObraProyectoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ManoObraProyecto
     */
    select?: ManoObraProyectoSelect<ExtArgs> | null
    /**
     * Filter which ManoObraProyecto to delete.
     */
    where: ManoObraProyectoWhereUniqueInput
  }

  /**
   * ManoObraProyecto deleteMany
   */
  export type ManoObraProyectoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ManoObraProyectos to delete
     */
    where?: ManoObraProyectoWhereInput
  }

  /**
   * ManoObraProyecto without action
   */
  export type ManoObraProyectoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ManoObraProyecto
     */
    select?: ManoObraProyectoSelect<ExtArgs> | null
  }


  /**
   * Model PagoEvmProcesado
   */

  export type AggregatePagoEvmProcesado = {
    _count: PagoEvmProcesadoCountAggregateOutputType | null
    _avg: PagoEvmProcesadoAvgAggregateOutputType | null
    _sum: PagoEvmProcesadoSumAggregateOutputType | null
    _min: PagoEvmProcesadoMinAggregateOutputType | null
    _max: PagoEvmProcesadoMaxAggregateOutputType | null
  }

  export type PagoEvmProcesadoAvgAggregateOutputType = {
    monto: Decimal | null
  }

  export type PagoEvmProcesadoSumAggregateOutputType = {
    monto: Decimal | null
  }

  export type PagoEvmProcesadoMinAggregateOutputType = {
    id_pago: string | null
    tenant_id: string | null
    proyecto_id: string | null
    tipo: string | null
    monto: Decimal | null
    created_at: Date | null
  }

  export type PagoEvmProcesadoMaxAggregateOutputType = {
    id_pago: string | null
    tenant_id: string | null
    proyecto_id: string | null
    tipo: string | null
    monto: Decimal | null
    created_at: Date | null
  }

  export type PagoEvmProcesadoCountAggregateOutputType = {
    id_pago: number
    tenant_id: number
    proyecto_id: number
    tipo: number
    monto: number
    created_at: number
    _all: number
  }


  export type PagoEvmProcesadoAvgAggregateInputType = {
    monto?: true
  }

  export type PagoEvmProcesadoSumAggregateInputType = {
    monto?: true
  }

  export type PagoEvmProcesadoMinAggregateInputType = {
    id_pago?: true
    tenant_id?: true
    proyecto_id?: true
    tipo?: true
    monto?: true
    created_at?: true
  }

  export type PagoEvmProcesadoMaxAggregateInputType = {
    id_pago?: true
    tenant_id?: true
    proyecto_id?: true
    tipo?: true
    monto?: true
    created_at?: true
  }

  export type PagoEvmProcesadoCountAggregateInputType = {
    id_pago?: true
    tenant_id?: true
    proyecto_id?: true
    tipo?: true
    monto?: true
    created_at?: true
    _all?: true
  }

  export type PagoEvmProcesadoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PagoEvmProcesado to aggregate.
     */
    where?: PagoEvmProcesadoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PagoEvmProcesados to fetch.
     */
    orderBy?: PagoEvmProcesadoOrderByWithRelationInput | PagoEvmProcesadoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PagoEvmProcesadoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PagoEvmProcesados from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PagoEvmProcesados.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PagoEvmProcesados
    **/
    _count?: true | PagoEvmProcesadoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PagoEvmProcesadoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PagoEvmProcesadoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PagoEvmProcesadoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PagoEvmProcesadoMaxAggregateInputType
  }

  export type GetPagoEvmProcesadoAggregateType<T extends PagoEvmProcesadoAggregateArgs> = {
        [P in keyof T & keyof AggregatePagoEvmProcesado]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePagoEvmProcesado[P]>
      : GetScalarType<T[P], AggregatePagoEvmProcesado[P]>
  }




  export type PagoEvmProcesadoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PagoEvmProcesadoWhereInput
    orderBy?: PagoEvmProcesadoOrderByWithAggregationInput | PagoEvmProcesadoOrderByWithAggregationInput[]
    by: PagoEvmProcesadoScalarFieldEnum[] | PagoEvmProcesadoScalarFieldEnum
    having?: PagoEvmProcesadoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PagoEvmProcesadoCountAggregateInputType | true
    _avg?: PagoEvmProcesadoAvgAggregateInputType
    _sum?: PagoEvmProcesadoSumAggregateInputType
    _min?: PagoEvmProcesadoMinAggregateInputType
    _max?: PagoEvmProcesadoMaxAggregateInputType
  }

  export type PagoEvmProcesadoGroupByOutputType = {
    id_pago: string
    tenant_id: string
    proyecto_id: string
    tipo: string
    monto: Decimal
    created_at: Date
    _count: PagoEvmProcesadoCountAggregateOutputType | null
    _avg: PagoEvmProcesadoAvgAggregateOutputType | null
    _sum: PagoEvmProcesadoSumAggregateOutputType | null
    _min: PagoEvmProcesadoMinAggregateOutputType | null
    _max: PagoEvmProcesadoMaxAggregateOutputType | null
  }

  type GetPagoEvmProcesadoGroupByPayload<T extends PagoEvmProcesadoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PagoEvmProcesadoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PagoEvmProcesadoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PagoEvmProcesadoGroupByOutputType[P]>
            : GetScalarType<T[P], PagoEvmProcesadoGroupByOutputType[P]>
        }
      >
    >


  export type PagoEvmProcesadoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_pago?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    tipo?: boolean
    monto?: boolean
    created_at?: boolean
  }, ExtArgs["result"]["pagoEvmProcesado"]>

  export type PagoEvmProcesadoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_pago?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    tipo?: boolean
    monto?: boolean
    created_at?: boolean
  }, ExtArgs["result"]["pagoEvmProcesado"]>

  export type PagoEvmProcesadoSelectScalar = {
    id_pago?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    tipo?: boolean
    monto?: boolean
    created_at?: boolean
  }


  export type $PagoEvmProcesadoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PagoEvmProcesado"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id_pago: string
      tenant_id: string
      proyecto_id: string
      tipo: string
      monto: Prisma.Decimal
      created_at: Date
    }, ExtArgs["result"]["pagoEvmProcesado"]>
    composites: {}
  }

  type PagoEvmProcesadoGetPayload<S extends boolean | null | undefined | PagoEvmProcesadoDefaultArgs> = $Result.GetResult<Prisma.$PagoEvmProcesadoPayload, S>

  type PagoEvmProcesadoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PagoEvmProcesadoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PagoEvmProcesadoCountAggregateInputType | true
    }

  export interface PagoEvmProcesadoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PagoEvmProcesado'], meta: { name: 'PagoEvmProcesado' } }
    /**
     * Find zero or one PagoEvmProcesado that matches the filter.
     * @param {PagoEvmProcesadoFindUniqueArgs} args - Arguments to find a PagoEvmProcesado
     * @example
     * // Get one PagoEvmProcesado
     * const pagoEvmProcesado = await prisma.pagoEvmProcesado.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PagoEvmProcesadoFindUniqueArgs>(args: SelectSubset<T, PagoEvmProcesadoFindUniqueArgs<ExtArgs>>): Prisma__PagoEvmProcesadoClient<$Result.GetResult<Prisma.$PagoEvmProcesadoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one PagoEvmProcesado that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PagoEvmProcesadoFindUniqueOrThrowArgs} args - Arguments to find a PagoEvmProcesado
     * @example
     * // Get one PagoEvmProcesado
     * const pagoEvmProcesado = await prisma.pagoEvmProcesado.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PagoEvmProcesadoFindUniqueOrThrowArgs>(args: SelectSubset<T, PagoEvmProcesadoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PagoEvmProcesadoClient<$Result.GetResult<Prisma.$PagoEvmProcesadoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first PagoEvmProcesado that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PagoEvmProcesadoFindFirstArgs} args - Arguments to find a PagoEvmProcesado
     * @example
     * // Get one PagoEvmProcesado
     * const pagoEvmProcesado = await prisma.pagoEvmProcesado.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PagoEvmProcesadoFindFirstArgs>(args?: SelectSubset<T, PagoEvmProcesadoFindFirstArgs<ExtArgs>>): Prisma__PagoEvmProcesadoClient<$Result.GetResult<Prisma.$PagoEvmProcesadoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first PagoEvmProcesado that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PagoEvmProcesadoFindFirstOrThrowArgs} args - Arguments to find a PagoEvmProcesado
     * @example
     * // Get one PagoEvmProcesado
     * const pagoEvmProcesado = await prisma.pagoEvmProcesado.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PagoEvmProcesadoFindFirstOrThrowArgs>(args?: SelectSubset<T, PagoEvmProcesadoFindFirstOrThrowArgs<ExtArgs>>): Prisma__PagoEvmProcesadoClient<$Result.GetResult<Prisma.$PagoEvmProcesadoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more PagoEvmProcesados that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PagoEvmProcesadoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PagoEvmProcesados
     * const pagoEvmProcesados = await prisma.pagoEvmProcesado.findMany()
     * 
     * // Get first 10 PagoEvmProcesados
     * const pagoEvmProcesados = await prisma.pagoEvmProcesado.findMany({ take: 10 })
     * 
     * // Only select the `id_pago`
     * const pagoEvmProcesadoWithId_pagoOnly = await prisma.pagoEvmProcesado.findMany({ select: { id_pago: true } })
     * 
     */
    findMany<T extends PagoEvmProcesadoFindManyArgs>(args?: SelectSubset<T, PagoEvmProcesadoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PagoEvmProcesadoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a PagoEvmProcesado.
     * @param {PagoEvmProcesadoCreateArgs} args - Arguments to create a PagoEvmProcesado.
     * @example
     * // Create one PagoEvmProcesado
     * const PagoEvmProcesado = await prisma.pagoEvmProcesado.create({
     *   data: {
     *     // ... data to create a PagoEvmProcesado
     *   }
     * })
     * 
     */
    create<T extends PagoEvmProcesadoCreateArgs>(args: SelectSubset<T, PagoEvmProcesadoCreateArgs<ExtArgs>>): Prisma__PagoEvmProcesadoClient<$Result.GetResult<Prisma.$PagoEvmProcesadoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many PagoEvmProcesados.
     * @param {PagoEvmProcesadoCreateManyArgs} args - Arguments to create many PagoEvmProcesados.
     * @example
     * // Create many PagoEvmProcesados
     * const pagoEvmProcesado = await prisma.pagoEvmProcesado.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PagoEvmProcesadoCreateManyArgs>(args?: SelectSubset<T, PagoEvmProcesadoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PagoEvmProcesados and returns the data saved in the database.
     * @param {PagoEvmProcesadoCreateManyAndReturnArgs} args - Arguments to create many PagoEvmProcesados.
     * @example
     * // Create many PagoEvmProcesados
     * const pagoEvmProcesado = await prisma.pagoEvmProcesado.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PagoEvmProcesados and only return the `id_pago`
     * const pagoEvmProcesadoWithId_pagoOnly = await prisma.pagoEvmProcesado.createManyAndReturn({ 
     *   select: { id_pago: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PagoEvmProcesadoCreateManyAndReturnArgs>(args?: SelectSubset<T, PagoEvmProcesadoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PagoEvmProcesadoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a PagoEvmProcesado.
     * @param {PagoEvmProcesadoDeleteArgs} args - Arguments to delete one PagoEvmProcesado.
     * @example
     * // Delete one PagoEvmProcesado
     * const PagoEvmProcesado = await prisma.pagoEvmProcesado.delete({
     *   where: {
     *     // ... filter to delete one PagoEvmProcesado
     *   }
     * })
     * 
     */
    delete<T extends PagoEvmProcesadoDeleteArgs>(args: SelectSubset<T, PagoEvmProcesadoDeleteArgs<ExtArgs>>): Prisma__PagoEvmProcesadoClient<$Result.GetResult<Prisma.$PagoEvmProcesadoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one PagoEvmProcesado.
     * @param {PagoEvmProcesadoUpdateArgs} args - Arguments to update one PagoEvmProcesado.
     * @example
     * // Update one PagoEvmProcesado
     * const pagoEvmProcesado = await prisma.pagoEvmProcesado.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PagoEvmProcesadoUpdateArgs>(args: SelectSubset<T, PagoEvmProcesadoUpdateArgs<ExtArgs>>): Prisma__PagoEvmProcesadoClient<$Result.GetResult<Prisma.$PagoEvmProcesadoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more PagoEvmProcesados.
     * @param {PagoEvmProcesadoDeleteManyArgs} args - Arguments to filter PagoEvmProcesados to delete.
     * @example
     * // Delete a few PagoEvmProcesados
     * const { count } = await prisma.pagoEvmProcesado.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PagoEvmProcesadoDeleteManyArgs>(args?: SelectSubset<T, PagoEvmProcesadoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PagoEvmProcesados.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PagoEvmProcesadoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PagoEvmProcesados
     * const pagoEvmProcesado = await prisma.pagoEvmProcesado.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PagoEvmProcesadoUpdateManyArgs>(args: SelectSubset<T, PagoEvmProcesadoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PagoEvmProcesado.
     * @param {PagoEvmProcesadoUpsertArgs} args - Arguments to update or create a PagoEvmProcesado.
     * @example
     * // Update or create a PagoEvmProcesado
     * const pagoEvmProcesado = await prisma.pagoEvmProcesado.upsert({
     *   create: {
     *     // ... data to create a PagoEvmProcesado
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PagoEvmProcesado we want to update
     *   }
     * })
     */
    upsert<T extends PagoEvmProcesadoUpsertArgs>(args: SelectSubset<T, PagoEvmProcesadoUpsertArgs<ExtArgs>>): Prisma__PagoEvmProcesadoClient<$Result.GetResult<Prisma.$PagoEvmProcesadoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of PagoEvmProcesados.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PagoEvmProcesadoCountArgs} args - Arguments to filter PagoEvmProcesados to count.
     * @example
     * // Count the number of PagoEvmProcesados
     * const count = await prisma.pagoEvmProcesado.count({
     *   where: {
     *     // ... the filter for the PagoEvmProcesados we want to count
     *   }
     * })
    **/
    count<T extends PagoEvmProcesadoCountArgs>(
      args?: Subset<T, PagoEvmProcesadoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PagoEvmProcesadoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PagoEvmProcesado.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PagoEvmProcesadoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends PagoEvmProcesadoAggregateArgs>(args: Subset<T, PagoEvmProcesadoAggregateArgs>): Prisma.PrismaPromise<GetPagoEvmProcesadoAggregateType<T>>

    /**
     * Group by PagoEvmProcesado.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PagoEvmProcesadoGroupByArgs} args - Group by arguments.
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
      T extends PagoEvmProcesadoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PagoEvmProcesadoGroupByArgs['orderBy'] }
        : { orderBy?: PagoEvmProcesadoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, PagoEvmProcesadoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPagoEvmProcesadoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PagoEvmProcesado model
   */
  readonly fields: PagoEvmProcesadoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PagoEvmProcesado.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PagoEvmProcesadoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the PagoEvmProcesado model
   */ 
  interface PagoEvmProcesadoFieldRefs {
    readonly id_pago: FieldRef<"PagoEvmProcesado", 'String'>
    readonly tenant_id: FieldRef<"PagoEvmProcesado", 'String'>
    readonly proyecto_id: FieldRef<"PagoEvmProcesado", 'String'>
    readonly tipo: FieldRef<"PagoEvmProcesado", 'String'>
    readonly monto: FieldRef<"PagoEvmProcesado", 'Decimal'>
    readonly created_at: FieldRef<"PagoEvmProcesado", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PagoEvmProcesado findUnique
   */
  export type PagoEvmProcesadoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PagoEvmProcesado
     */
    select?: PagoEvmProcesadoSelect<ExtArgs> | null
    /**
     * Filter, which PagoEvmProcesado to fetch.
     */
    where: PagoEvmProcesadoWhereUniqueInput
  }

  /**
   * PagoEvmProcesado findUniqueOrThrow
   */
  export type PagoEvmProcesadoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PagoEvmProcesado
     */
    select?: PagoEvmProcesadoSelect<ExtArgs> | null
    /**
     * Filter, which PagoEvmProcesado to fetch.
     */
    where: PagoEvmProcesadoWhereUniqueInput
  }

  /**
   * PagoEvmProcesado findFirst
   */
  export type PagoEvmProcesadoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PagoEvmProcesado
     */
    select?: PagoEvmProcesadoSelect<ExtArgs> | null
    /**
     * Filter, which PagoEvmProcesado to fetch.
     */
    where?: PagoEvmProcesadoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PagoEvmProcesados to fetch.
     */
    orderBy?: PagoEvmProcesadoOrderByWithRelationInput | PagoEvmProcesadoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PagoEvmProcesados.
     */
    cursor?: PagoEvmProcesadoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PagoEvmProcesados from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PagoEvmProcesados.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PagoEvmProcesados.
     */
    distinct?: PagoEvmProcesadoScalarFieldEnum | PagoEvmProcesadoScalarFieldEnum[]
  }

  /**
   * PagoEvmProcesado findFirstOrThrow
   */
  export type PagoEvmProcesadoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PagoEvmProcesado
     */
    select?: PagoEvmProcesadoSelect<ExtArgs> | null
    /**
     * Filter, which PagoEvmProcesado to fetch.
     */
    where?: PagoEvmProcesadoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PagoEvmProcesados to fetch.
     */
    orderBy?: PagoEvmProcesadoOrderByWithRelationInput | PagoEvmProcesadoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PagoEvmProcesados.
     */
    cursor?: PagoEvmProcesadoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PagoEvmProcesados from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PagoEvmProcesados.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PagoEvmProcesados.
     */
    distinct?: PagoEvmProcesadoScalarFieldEnum | PagoEvmProcesadoScalarFieldEnum[]
  }

  /**
   * PagoEvmProcesado findMany
   */
  export type PagoEvmProcesadoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PagoEvmProcesado
     */
    select?: PagoEvmProcesadoSelect<ExtArgs> | null
    /**
     * Filter, which PagoEvmProcesados to fetch.
     */
    where?: PagoEvmProcesadoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PagoEvmProcesados to fetch.
     */
    orderBy?: PagoEvmProcesadoOrderByWithRelationInput | PagoEvmProcesadoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PagoEvmProcesados.
     */
    cursor?: PagoEvmProcesadoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PagoEvmProcesados from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PagoEvmProcesados.
     */
    skip?: number
    distinct?: PagoEvmProcesadoScalarFieldEnum | PagoEvmProcesadoScalarFieldEnum[]
  }

  /**
   * PagoEvmProcesado create
   */
  export type PagoEvmProcesadoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PagoEvmProcesado
     */
    select?: PagoEvmProcesadoSelect<ExtArgs> | null
    /**
     * The data needed to create a PagoEvmProcesado.
     */
    data: XOR<PagoEvmProcesadoCreateInput, PagoEvmProcesadoUncheckedCreateInput>
  }

  /**
   * PagoEvmProcesado createMany
   */
  export type PagoEvmProcesadoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PagoEvmProcesados.
     */
    data: PagoEvmProcesadoCreateManyInput | PagoEvmProcesadoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PagoEvmProcesado createManyAndReturn
   */
  export type PagoEvmProcesadoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PagoEvmProcesado
     */
    select?: PagoEvmProcesadoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many PagoEvmProcesados.
     */
    data: PagoEvmProcesadoCreateManyInput | PagoEvmProcesadoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PagoEvmProcesado update
   */
  export type PagoEvmProcesadoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PagoEvmProcesado
     */
    select?: PagoEvmProcesadoSelect<ExtArgs> | null
    /**
     * The data needed to update a PagoEvmProcesado.
     */
    data: XOR<PagoEvmProcesadoUpdateInput, PagoEvmProcesadoUncheckedUpdateInput>
    /**
     * Choose, which PagoEvmProcesado to update.
     */
    where: PagoEvmProcesadoWhereUniqueInput
  }

  /**
   * PagoEvmProcesado updateMany
   */
  export type PagoEvmProcesadoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PagoEvmProcesados.
     */
    data: XOR<PagoEvmProcesadoUpdateManyMutationInput, PagoEvmProcesadoUncheckedUpdateManyInput>
    /**
     * Filter which PagoEvmProcesados to update
     */
    where?: PagoEvmProcesadoWhereInput
  }

  /**
   * PagoEvmProcesado upsert
   */
  export type PagoEvmProcesadoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PagoEvmProcesado
     */
    select?: PagoEvmProcesadoSelect<ExtArgs> | null
    /**
     * The filter to search for the PagoEvmProcesado to update in case it exists.
     */
    where: PagoEvmProcesadoWhereUniqueInput
    /**
     * In case the PagoEvmProcesado found by the `where` argument doesn't exist, create a new PagoEvmProcesado with this data.
     */
    create: XOR<PagoEvmProcesadoCreateInput, PagoEvmProcesadoUncheckedCreateInput>
    /**
     * In case the PagoEvmProcesado was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PagoEvmProcesadoUpdateInput, PagoEvmProcesadoUncheckedUpdateInput>
  }

  /**
   * PagoEvmProcesado delete
   */
  export type PagoEvmProcesadoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PagoEvmProcesado
     */
    select?: PagoEvmProcesadoSelect<ExtArgs> | null
    /**
     * Filter which PagoEvmProcesado to delete.
     */
    where: PagoEvmProcesadoWhereUniqueInput
  }

  /**
   * PagoEvmProcesado deleteMany
   */
  export type PagoEvmProcesadoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PagoEvmProcesados to delete
     */
    where?: PagoEvmProcesadoWhereInput
  }

  /**
   * PagoEvmProcesado without action
   */
  export type PagoEvmProcesadoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PagoEvmProcesado
     */
    select?: PagoEvmProcesadoSelect<ExtArgs> | null
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
    concepto_id: string | null
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
    concepto_id: string | null
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
    concepto_id: number
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
    concepto_id?: true
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
    concepto_id?: true
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
    concepto_id?: true
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
    concepto_id: string | null
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
    concepto_id?: boolean
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
    concepto_id?: boolean
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
    concepto_id?: boolean
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
      concepto_id: string | null
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
    readonly concepto_id: FieldRef<"AvanceFisico", 'String'>
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
   * Model MaterialConsumidoObra
   */

  export type AggregateMaterialConsumidoObra = {
    _count: MaterialConsumidoObraCountAggregateOutputType | null
    _avg: MaterialConsumidoObraAvgAggregateOutputType | null
    _sum: MaterialConsumidoObraSumAggregateOutputType | null
    _min: MaterialConsumidoObraMinAggregateOutputType | null
    _max: MaterialConsumidoObraMaxAggregateOutputType | null
  }

  export type MaterialConsumidoObraAvgAggregateOutputType = {
    cantidad: Decimal | null
    costo_unitario: Decimal | null
    costo_total: Decimal | null
  }

  export type MaterialConsumidoObraSumAggregateOutputType = {
    cantidad: Decimal | null
    costo_unitario: Decimal | null
    costo_total: Decimal | null
  }

  export type MaterialConsumidoObraMinAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    proyecto_id: string | null
    concepto_id: string | null
    movimiento_almacen_id: string | null
    insumo_id: string | null
    insumo_clave: string | null
    insumo_nombre: string | null
    cantidad: Decimal | null
    unidad: string | null
    costo_unitario: Decimal | null
    costo_total: Decimal | null
    fecha: Date | null
    frente_trabajo: string | null
    registrado_por: string | null
    created_at: Date | null
  }

  export type MaterialConsumidoObraMaxAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    proyecto_id: string | null
    concepto_id: string | null
    movimiento_almacen_id: string | null
    insumo_id: string | null
    insumo_clave: string | null
    insumo_nombre: string | null
    cantidad: Decimal | null
    unidad: string | null
    costo_unitario: Decimal | null
    costo_total: Decimal | null
    fecha: Date | null
    frente_trabajo: string | null
    registrado_por: string | null
    created_at: Date | null
  }

  export type MaterialConsumidoObraCountAggregateOutputType = {
    id: number
    tenant_id: number
    proyecto_id: number
    concepto_id: number
    movimiento_almacen_id: number
    insumo_id: number
    insumo_clave: number
    insumo_nombre: number
    cantidad: number
    unidad: number
    costo_unitario: number
    costo_total: number
    fecha: number
    frente_trabajo: number
    registrado_por: number
    created_at: number
    _all: number
  }


  export type MaterialConsumidoObraAvgAggregateInputType = {
    cantidad?: true
    costo_unitario?: true
    costo_total?: true
  }

  export type MaterialConsumidoObraSumAggregateInputType = {
    cantidad?: true
    costo_unitario?: true
    costo_total?: true
  }

  export type MaterialConsumidoObraMinAggregateInputType = {
    id?: true
    tenant_id?: true
    proyecto_id?: true
    concepto_id?: true
    movimiento_almacen_id?: true
    insumo_id?: true
    insumo_clave?: true
    insumo_nombre?: true
    cantidad?: true
    unidad?: true
    costo_unitario?: true
    costo_total?: true
    fecha?: true
    frente_trabajo?: true
    registrado_por?: true
    created_at?: true
  }

  export type MaterialConsumidoObraMaxAggregateInputType = {
    id?: true
    tenant_id?: true
    proyecto_id?: true
    concepto_id?: true
    movimiento_almacen_id?: true
    insumo_id?: true
    insumo_clave?: true
    insumo_nombre?: true
    cantidad?: true
    unidad?: true
    costo_unitario?: true
    costo_total?: true
    fecha?: true
    frente_trabajo?: true
    registrado_por?: true
    created_at?: true
  }

  export type MaterialConsumidoObraCountAggregateInputType = {
    id?: true
    tenant_id?: true
    proyecto_id?: true
    concepto_id?: true
    movimiento_almacen_id?: true
    insumo_id?: true
    insumo_clave?: true
    insumo_nombre?: true
    cantidad?: true
    unidad?: true
    costo_unitario?: true
    costo_total?: true
    fecha?: true
    frente_trabajo?: true
    registrado_por?: true
    created_at?: true
    _all?: true
  }

  export type MaterialConsumidoObraAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MaterialConsumidoObra to aggregate.
     */
    where?: MaterialConsumidoObraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MaterialConsumidoObras to fetch.
     */
    orderBy?: MaterialConsumidoObraOrderByWithRelationInput | MaterialConsumidoObraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MaterialConsumidoObraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MaterialConsumidoObras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MaterialConsumidoObras.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MaterialConsumidoObras
    **/
    _count?: true | MaterialConsumidoObraCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: MaterialConsumidoObraAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: MaterialConsumidoObraSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MaterialConsumidoObraMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MaterialConsumidoObraMaxAggregateInputType
  }

  export type GetMaterialConsumidoObraAggregateType<T extends MaterialConsumidoObraAggregateArgs> = {
        [P in keyof T & keyof AggregateMaterialConsumidoObra]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMaterialConsumidoObra[P]>
      : GetScalarType<T[P], AggregateMaterialConsumidoObra[P]>
  }




  export type MaterialConsumidoObraGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MaterialConsumidoObraWhereInput
    orderBy?: MaterialConsumidoObraOrderByWithAggregationInput | MaterialConsumidoObraOrderByWithAggregationInput[]
    by: MaterialConsumidoObraScalarFieldEnum[] | MaterialConsumidoObraScalarFieldEnum
    having?: MaterialConsumidoObraScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MaterialConsumidoObraCountAggregateInputType | true
    _avg?: MaterialConsumidoObraAvgAggregateInputType
    _sum?: MaterialConsumidoObraSumAggregateInputType
    _min?: MaterialConsumidoObraMinAggregateInputType
    _max?: MaterialConsumidoObraMaxAggregateInputType
  }

  export type MaterialConsumidoObraGroupByOutputType = {
    id: string
    tenant_id: string
    proyecto_id: string
    concepto_id: string
    movimiento_almacen_id: string
    insumo_id: string
    insumo_clave: string | null
    insumo_nombre: string | null
    cantidad: Decimal
    unidad: string
    costo_unitario: Decimal | null
    costo_total: Decimal | null
    fecha: Date
    frente_trabajo: string | null
    registrado_por: string | null
    created_at: Date
    _count: MaterialConsumidoObraCountAggregateOutputType | null
    _avg: MaterialConsumidoObraAvgAggregateOutputType | null
    _sum: MaterialConsumidoObraSumAggregateOutputType | null
    _min: MaterialConsumidoObraMinAggregateOutputType | null
    _max: MaterialConsumidoObraMaxAggregateOutputType | null
  }

  type GetMaterialConsumidoObraGroupByPayload<T extends MaterialConsumidoObraGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MaterialConsumidoObraGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MaterialConsumidoObraGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MaterialConsumidoObraGroupByOutputType[P]>
            : GetScalarType<T[P], MaterialConsumidoObraGroupByOutputType[P]>
        }
      >
    >


  export type MaterialConsumidoObraSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    concepto_id?: boolean
    movimiento_almacen_id?: boolean
    insumo_id?: boolean
    insumo_clave?: boolean
    insumo_nombre?: boolean
    cantidad?: boolean
    unidad?: boolean
    costo_unitario?: boolean
    costo_total?: boolean
    fecha?: boolean
    frente_trabajo?: boolean
    registrado_por?: boolean
    created_at?: boolean
  }, ExtArgs["result"]["materialConsumidoObra"]>

  export type MaterialConsumidoObraSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    concepto_id?: boolean
    movimiento_almacen_id?: boolean
    insumo_id?: boolean
    insumo_clave?: boolean
    insumo_nombre?: boolean
    cantidad?: boolean
    unidad?: boolean
    costo_unitario?: boolean
    costo_total?: boolean
    fecha?: boolean
    frente_trabajo?: boolean
    registrado_por?: boolean
    created_at?: boolean
  }, ExtArgs["result"]["materialConsumidoObra"]>

  export type MaterialConsumidoObraSelectScalar = {
    id?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    concepto_id?: boolean
    movimiento_almacen_id?: boolean
    insumo_id?: boolean
    insumo_clave?: boolean
    insumo_nombre?: boolean
    cantidad?: boolean
    unidad?: boolean
    costo_unitario?: boolean
    costo_total?: boolean
    fecha?: boolean
    frente_trabajo?: boolean
    registrado_por?: boolean
    created_at?: boolean
  }


  export type $MaterialConsumidoObraPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MaterialConsumidoObra"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenant_id: string
      proyecto_id: string
      concepto_id: string
      movimiento_almacen_id: string
      insumo_id: string
      insumo_clave: string | null
      insumo_nombre: string | null
      cantidad: Prisma.Decimal
      unidad: string
      costo_unitario: Prisma.Decimal | null
      costo_total: Prisma.Decimal | null
      fecha: Date
      frente_trabajo: string | null
      registrado_por: string | null
      created_at: Date
    }, ExtArgs["result"]["materialConsumidoObra"]>
    composites: {}
  }

  type MaterialConsumidoObraGetPayload<S extends boolean | null | undefined | MaterialConsumidoObraDefaultArgs> = $Result.GetResult<Prisma.$MaterialConsumidoObraPayload, S>

  type MaterialConsumidoObraCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<MaterialConsumidoObraFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: MaterialConsumidoObraCountAggregateInputType | true
    }

  export interface MaterialConsumidoObraDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MaterialConsumidoObra'], meta: { name: 'MaterialConsumidoObra' } }
    /**
     * Find zero or one MaterialConsumidoObra that matches the filter.
     * @param {MaterialConsumidoObraFindUniqueArgs} args - Arguments to find a MaterialConsumidoObra
     * @example
     * // Get one MaterialConsumidoObra
     * const materialConsumidoObra = await prisma.materialConsumidoObra.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MaterialConsumidoObraFindUniqueArgs>(args: SelectSubset<T, MaterialConsumidoObraFindUniqueArgs<ExtArgs>>): Prisma__MaterialConsumidoObraClient<$Result.GetResult<Prisma.$MaterialConsumidoObraPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one MaterialConsumidoObra that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {MaterialConsumidoObraFindUniqueOrThrowArgs} args - Arguments to find a MaterialConsumidoObra
     * @example
     * // Get one MaterialConsumidoObra
     * const materialConsumidoObra = await prisma.materialConsumidoObra.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MaterialConsumidoObraFindUniqueOrThrowArgs>(args: SelectSubset<T, MaterialConsumidoObraFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MaterialConsumidoObraClient<$Result.GetResult<Prisma.$MaterialConsumidoObraPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first MaterialConsumidoObra that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MaterialConsumidoObraFindFirstArgs} args - Arguments to find a MaterialConsumidoObra
     * @example
     * // Get one MaterialConsumidoObra
     * const materialConsumidoObra = await prisma.materialConsumidoObra.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MaterialConsumidoObraFindFirstArgs>(args?: SelectSubset<T, MaterialConsumidoObraFindFirstArgs<ExtArgs>>): Prisma__MaterialConsumidoObraClient<$Result.GetResult<Prisma.$MaterialConsumidoObraPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first MaterialConsumidoObra that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MaterialConsumidoObraFindFirstOrThrowArgs} args - Arguments to find a MaterialConsumidoObra
     * @example
     * // Get one MaterialConsumidoObra
     * const materialConsumidoObra = await prisma.materialConsumidoObra.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MaterialConsumidoObraFindFirstOrThrowArgs>(args?: SelectSubset<T, MaterialConsumidoObraFindFirstOrThrowArgs<ExtArgs>>): Prisma__MaterialConsumidoObraClient<$Result.GetResult<Prisma.$MaterialConsumidoObraPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more MaterialConsumidoObras that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MaterialConsumidoObraFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MaterialConsumidoObras
     * const materialConsumidoObras = await prisma.materialConsumidoObra.findMany()
     * 
     * // Get first 10 MaterialConsumidoObras
     * const materialConsumidoObras = await prisma.materialConsumidoObra.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const materialConsumidoObraWithIdOnly = await prisma.materialConsumidoObra.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MaterialConsumidoObraFindManyArgs>(args?: SelectSubset<T, MaterialConsumidoObraFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MaterialConsumidoObraPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a MaterialConsumidoObra.
     * @param {MaterialConsumidoObraCreateArgs} args - Arguments to create a MaterialConsumidoObra.
     * @example
     * // Create one MaterialConsumidoObra
     * const MaterialConsumidoObra = await prisma.materialConsumidoObra.create({
     *   data: {
     *     // ... data to create a MaterialConsumidoObra
     *   }
     * })
     * 
     */
    create<T extends MaterialConsumidoObraCreateArgs>(args: SelectSubset<T, MaterialConsumidoObraCreateArgs<ExtArgs>>): Prisma__MaterialConsumidoObraClient<$Result.GetResult<Prisma.$MaterialConsumidoObraPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many MaterialConsumidoObras.
     * @param {MaterialConsumidoObraCreateManyArgs} args - Arguments to create many MaterialConsumidoObras.
     * @example
     * // Create many MaterialConsumidoObras
     * const materialConsumidoObra = await prisma.materialConsumidoObra.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MaterialConsumidoObraCreateManyArgs>(args?: SelectSubset<T, MaterialConsumidoObraCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MaterialConsumidoObras and returns the data saved in the database.
     * @param {MaterialConsumidoObraCreateManyAndReturnArgs} args - Arguments to create many MaterialConsumidoObras.
     * @example
     * // Create many MaterialConsumidoObras
     * const materialConsumidoObra = await prisma.materialConsumidoObra.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MaterialConsumidoObras and only return the `id`
     * const materialConsumidoObraWithIdOnly = await prisma.materialConsumidoObra.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MaterialConsumidoObraCreateManyAndReturnArgs>(args?: SelectSubset<T, MaterialConsumidoObraCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MaterialConsumidoObraPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a MaterialConsumidoObra.
     * @param {MaterialConsumidoObraDeleteArgs} args - Arguments to delete one MaterialConsumidoObra.
     * @example
     * // Delete one MaterialConsumidoObra
     * const MaterialConsumidoObra = await prisma.materialConsumidoObra.delete({
     *   where: {
     *     // ... filter to delete one MaterialConsumidoObra
     *   }
     * })
     * 
     */
    delete<T extends MaterialConsumidoObraDeleteArgs>(args: SelectSubset<T, MaterialConsumidoObraDeleteArgs<ExtArgs>>): Prisma__MaterialConsumidoObraClient<$Result.GetResult<Prisma.$MaterialConsumidoObraPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one MaterialConsumidoObra.
     * @param {MaterialConsumidoObraUpdateArgs} args - Arguments to update one MaterialConsumidoObra.
     * @example
     * // Update one MaterialConsumidoObra
     * const materialConsumidoObra = await prisma.materialConsumidoObra.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MaterialConsumidoObraUpdateArgs>(args: SelectSubset<T, MaterialConsumidoObraUpdateArgs<ExtArgs>>): Prisma__MaterialConsumidoObraClient<$Result.GetResult<Prisma.$MaterialConsumidoObraPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more MaterialConsumidoObras.
     * @param {MaterialConsumidoObraDeleteManyArgs} args - Arguments to filter MaterialConsumidoObras to delete.
     * @example
     * // Delete a few MaterialConsumidoObras
     * const { count } = await prisma.materialConsumidoObra.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MaterialConsumidoObraDeleteManyArgs>(args?: SelectSubset<T, MaterialConsumidoObraDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MaterialConsumidoObras.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MaterialConsumidoObraUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MaterialConsumidoObras
     * const materialConsumidoObra = await prisma.materialConsumidoObra.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MaterialConsumidoObraUpdateManyArgs>(args: SelectSubset<T, MaterialConsumidoObraUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one MaterialConsumidoObra.
     * @param {MaterialConsumidoObraUpsertArgs} args - Arguments to update or create a MaterialConsumidoObra.
     * @example
     * // Update or create a MaterialConsumidoObra
     * const materialConsumidoObra = await prisma.materialConsumidoObra.upsert({
     *   create: {
     *     // ... data to create a MaterialConsumidoObra
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MaterialConsumidoObra we want to update
     *   }
     * })
     */
    upsert<T extends MaterialConsumidoObraUpsertArgs>(args: SelectSubset<T, MaterialConsumidoObraUpsertArgs<ExtArgs>>): Prisma__MaterialConsumidoObraClient<$Result.GetResult<Prisma.$MaterialConsumidoObraPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of MaterialConsumidoObras.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MaterialConsumidoObraCountArgs} args - Arguments to filter MaterialConsumidoObras to count.
     * @example
     * // Count the number of MaterialConsumidoObras
     * const count = await prisma.materialConsumidoObra.count({
     *   where: {
     *     // ... the filter for the MaterialConsumidoObras we want to count
     *   }
     * })
    **/
    count<T extends MaterialConsumidoObraCountArgs>(
      args?: Subset<T, MaterialConsumidoObraCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MaterialConsumidoObraCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MaterialConsumidoObra.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MaterialConsumidoObraAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends MaterialConsumidoObraAggregateArgs>(args: Subset<T, MaterialConsumidoObraAggregateArgs>): Prisma.PrismaPromise<GetMaterialConsumidoObraAggregateType<T>>

    /**
     * Group by MaterialConsumidoObra.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MaterialConsumidoObraGroupByArgs} args - Group by arguments.
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
      T extends MaterialConsumidoObraGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MaterialConsumidoObraGroupByArgs['orderBy'] }
        : { orderBy?: MaterialConsumidoObraGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, MaterialConsumidoObraGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMaterialConsumidoObraGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MaterialConsumidoObra model
   */
  readonly fields: MaterialConsumidoObraFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MaterialConsumidoObra.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MaterialConsumidoObraClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the MaterialConsumidoObra model
   */ 
  interface MaterialConsumidoObraFieldRefs {
    readonly id: FieldRef<"MaterialConsumidoObra", 'String'>
    readonly tenant_id: FieldRef<"MaterialConsumidoObra", 'String'>
    readonly proyecto_id: FieldRef<"MaterialConsumidoObra", 'String'>
    readonly concepto_id: FieldRef<"MaterialConsumidoObra", 'String'>
    readonly movimiento_almacen_id: FieldRef<"MaterialConsumidoObra", 'String'>
    readonly insumo_id: FieldRef<"MaterialConsumidoObra", 'String'>
    readonly insumo_clave: FieldRef<"MaterialConsumidoObra", 'String'>
    readonly insumo_nombre: FieldRef<"MaterialConsumidoObra", 'String'>
    readonly cantidad: FieldRef<"MaterialConsumidoObra", 'Decimal'>
    readonly unidad: FieldRef<"MaterialConsumidoObra", 'String'>
    readonly costo_unitario: FieldRef<"MaterialConsumidoObra", 'Decimal'>
    readonly costo_total: FieldRef<"MaterialConsumidoObra", 'Decimal'>
    readonly fecha: FieldRef<"MaterialConsumidoObra", 'DateTime'>
    readonly frente_trabajo: FieldRef<"MaterialConsumidoObra", 'String'>
    readonly registrado_por: FieldRef<"MaterialConsumidoObra", 'String'>
    readonly created_at: FieldRef<"MaterialConsumidoObra", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * MaterialConsumidoObra findUnique
   */
  export type MaterialConsumidoObraFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MaterialConsumidoObra
     */
    select?: MaterialConsumidoObraSelect<ExtArgs> | null
    /**
     * Filter, which MaterialConsumidoObra to fetch.
     */
    where: MaterialConsumidoObraWhereUniqueInput
  }

  /**
   * MaterialConsumidoObra findUniqueOrThrow
   */
  export type MaterialConsumidoObraFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MaterialConsumidoObra
     */
    select?: MaterialConsumidoObraSelect<ExtArgs> | null
    /**
     * Filter, which MaterialConsumidoObra to fetch.
     */
    where: MaterialConsumidoObraWhereUniqueInput
  }

  /**
   * MaterialConsumidoObra findFirst
   */
  export type MaterialConsumidoObraFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MaterialConsumidoObra
     */
    select?: MaterialConsumidoObraSelect<ExtArgs> | null
    /**
     * Filter, which MaterialConsumidoObra to fetch.
     */
    where?: MaterialConsumidoObraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MaterialConsumidoObras to fetch.
     */
    orderBy?: MaterialConsumidoObraOrderByWithRelationInput | MaterialConsumidoObraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MaterialConsumidoObras.
     */
    cursor?: MaterialConsumidoObraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MaterialConsumidoObras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MaterialConsumidoObras.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MaterialConsumidoObras.
     */
    distinct?: MaterialConsumidoObraScalarFieldEnum | MaterialConsumidoObraScalarFieldEnum[]
  }

  /**
   * MaterialConsumidoObra findFirstOrThrow
   */
  export type MaterialConsumidoObraFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MaterialConsumidoObra
     */
    select?: MaterialConsumidoObraSelect<ExtArgs> | null
    /**
     * Filter, which MaterialConsumidoObra to fetch.
     */
    where?: MaterialConsumidoObraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MaterialConsumidoObras to fetch.
     */
    orderBy?: MaterialConsumidoObraOrderByWithRelationInput | MaterialConsumidoObraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MaterialConsumidoObras.
     */
    cursor?: MaterialConsumidoObraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MaterialConsumidoObras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MaterialConsumidoObras.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MaterialConsumidoObras.
     */
    distinct?: MaterialConsumidoObraScalarFieldEnum | MaterialConsumidoObraScalarFieldEnum[]
  }

  /**
   * MaterialConsumidoObra findMany
   */
  export type MaterialConsumidoObraFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MaterialConsumidoObra
     */
    select?: MaterialConsumidoObraSelect<ExtArgs> | null
    /**
     * Filter, which MaterialConsumidoObras to fetch.
     */
    where?: MaterialConsumidoObraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MaterialConsumidoObras to fetch.
     */
    orderBy?: MaterialConsumidoObraOrderByWithRelationInput | MaterialConsumidoObraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MaterialConsumidoObras.
     */
    cursor?: MaterialConsumidoObraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MaterialConsumidoObras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MaterialConsumidoObras.
     */
    skip?: number
    distinct?: MaterialConsumidoObraScalarFieldEnum | MaterialConsumidoObraScalarFieldEnum[]
  }

  /**
   * MaterialConsumidoObra create
   */
  export type MaterialConsumidoObraCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MaterialConsumidoObra
     */
    select?: MaterialConsumidoObraSelect<ExtArgs> | null
    /**
     * The data needed to create a MaterialConsumidoObra.
     */
    data: XOR<MaterialConsumidoObraCreateInput, MaterialConsumidoObraUncheckedCreateInput>
  }

  /**
   * MaterialConsumidoObra createMany
   */
  export type MaterialConsumidoObraCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MaterialConsumidoObras.
     */
    data: MaterialConsumidoObraCreateManyInput | MaterialConsumidoObraCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MaterialConsumidoObra createManyAndReturn
   */
  export type MaterialConsumidoObraCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MaterialConsumidoObra
     */
    select?: MaterialConsumidoObraSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many MaterialConsumidoObras.
     */
    data: MaterialConsumidoObraCreateManyInput | MaterialConsumidoObraCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MaterialConsumidoObra update
   */
  export type MaterialConsumidoObraUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MaterialConsumidoObra
     */
    select?: MaterialConsumidoObraSelect<ExtArgs> | null
    /**
     * The data needed to update a MaterialConsumidoObra.
     */
    data: XOR<MaterialConsumidoObraUpdateInput, MaterialConsumidoObraUncheckedUpdateInput>
    /**
     * Choose, which MaterialConsumidoObra to update.
     */
    where: MaterialConsumidoObraWhereUniqueInput
  }

  /**
   * MaterialConsumidoObra updateMany
   */
  export type MaterialConsumidoObraUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MaterialConsumidoObras.
     */
    data: XOR<MaterialConsumidoObraUpdateManyMutationInput, MaterialConsumidoObraUncheckedUpdateManyInput>
    /**
     * Filter which MaterialConsumidoObras to update
     */
    where?: MaterialConsumidoObraWhereInput
  }

  /**
   * MaterialConsumidoObra upsert
   */
  export type MaterialConsumidoObraUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MaterialConsumidoObra
     */
    select?: MaterialConsumidoObraSelect<ExtArgs> | null
    /**
     * The filter to search for the MaterialConsumidoObra to update in case it exists.
     */
    where: MaterialConsumidoObraWhereUniqueInput
    /**
     * In case the MaterialConsumidoObra found by the `where` argument doesn't exist, create a new MaterialConsumidoObra with this data.
     */
    create: XOR<MaterialConsumidoObraCreateInput, MaterialConsumidoObraUncheckedCreateInput>
    /**
     * In case the MaterialConsumidoObra was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MaterialConsumidoObraUpdateInput, MaterialConsumidoObraUncheckedUpdateInput>
  }

  /**
   * MaterialConsumidoObra delete
   */
  export type MaterialConsumidoObraDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MaterialConsumidoObra
     */
    select?: MaterialConsumidoObraSelect<ExtArgs> | null
    /**
     * Filter which MaterialConsumidoObra to delete.
     */
    where: MaterialConsumidoObraWhereUniqueInput
  }

  /**
   * MaterialConsumidoObra deleteMany
   */
  export type MaterialConsumidoObraDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MaterialConsumidoObras to delete
     */
    where?: MaterialConsumidoObraWhereInput
  }

  /**
   * MaterialConsumidoObra without action
   */
  export type MaterialConsumidoObraDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MaterialConsumidoObra
     */
    select?: MaterialConsumidoObraSelect<ExtArgs> | null
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
    ac_comprometido: 'ac_comprometido',
    ac_ejercido: 'ac_ejercido',
    estado: 'estado',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type ProgramacionObraScalarFieldEnum = (typeof ProgramacionObraScalarFieldEnum)[keyof typeof ProgramacionObraScalarFieldEnum]


  export const OrdenCompraSeguimientoScalarFieldEnum: {
    id: 'id',
    oc_id: 'oc_id',
    tenant_id: 'tenant_id',
    proyecto_id: 'proyecto_id',
    concepto_id: 'concepto_id',
    monto_comprometido: 'monto_comprometido',
    monto_ejercido: 'monto_ejercido',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type OrdenCompraSeguimientoScalarFieldEnum = (typeof OrdenCompraSeguimientoScalarFieldEnum)[keyof typeof OrdenCompraSeguimientoScalarFieldEnum]


  export const ManoObraProyectoScalarFieldEnum: {
    id: 'id',
    tenant_id: 'tenant_id',
    proyecto_id: 'proyecto_id',
    monto_acumulado: 'monto_acumulado',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type ManoObraProyectoScalarFieldEnum = (typeof ManoObraProyectoScalarFieldEnum)[keyof typeof ManoObraProyectoScalarFieldEnum]


  export const PagoEvmProcesadoScalarFieldEnum: {
    id_pago: 'id_pago',
    tenant_id: 'tenant_id',
    proyecto_id: 'proyecto_id',
    tipo: 'tipo',
    monto: 'monto',
    created_at: 'created_at'
  };

  export type PagoEvmProcesadoScalarFieldEnum = (typeof PagoEvmProcesadoScalarFieldEnum)[keyof typeof PagoEvmProcesadoScalarFieldEnum]


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
    concepto_id: 'concepto_id',
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


  export const MaterialConsumidoObraScalarFieldEnum: {
    id: 'id',
    tenant_id: 'tenant_id',
    proyecto_id: 'proyecto_id',
    concepto_id: 'concepto_id',
    movimiento_almacen_id: 'movimiento_almacen_id',
    insumo_id: 'insumo_id',
    insumo_clave: 'insumo_clave',
    insumo_nombre: 'insumo_nombre',
    cantidad: 'cantidad',
    unidad: 'unidad',
    costo_unitario: 'costo_unitario',
    costo_total: 'costo_total',
    fecha: 'fecha',
    frente_trabajo: 'frente_trabajo',
    registrado_por: 'registrado_por',
    created_at: 'created_at'
  };

  export type MaterialConsumidoObraScalarFieldEnum = (typeof MaterialConsumidoObraScalarFieldEnum)[keyof typeof MaterialConsumidoObraScalarFieldEnum]


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
    ac_comprometido?: DecimalFilter<"ProgramacionObra"> | Decimal | DecimalJsLike | number | string
    ac_ejercido?: DecimalFilter<"ProgramacionObra"> | Decimal | DecimalJsLike | number | string
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
    ac_comprometido?: SortOrder
    ac_ejercido?: SortOrder
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
    ac_comprometido?: DecimalFilter<"ProgramacionObra"> | Decimal | DecimalJsLike | number | string
    ac_ejercido?: DecimalFilter<"ProgramacionObra"> | Decimal | DecimalJsLike | number | string
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
    ac_comprometido?: SortOrder
    ac_ejercido?: SortOrder
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
    ac_comprometido?: DecimalWithAggregatesFilter<"ProgramacionObra"> | Decimal | DecimalJsLike | number | string
    ac_ejercido?: DecimalWithAggregatesFilter<"ProgramacionObra"> | Decimal | DecimalJsLike | number | string
    estado?: StringWithAggregatesFilter<"ProgramacionObra"> | string
    created_at?: DateTimeWithAggregatesFilter<"ProgramacionObra"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"ProgramacionObra"> | Date | string
  }

  export type OrdenCompraSeguimientoWhereInput = {
    AND?: OrdenCompraSeguimientoWhereInput | OrdenCompraSeguimientoWhereInput[]
    OR?: OrdenCompraSeguimientoWhereInput[]
    NOT?: OrdenCompraSeguimientoWhereInput | OrdenCompraSeguimientoWhereInput[]
    id?: UuidFilter<"OrdenCompraSeguimiento"> | string
    oc_id?: UuidFilter<"OrdenCompraSeguimiento"> | string
    tenant_id?: UuidFilter<"OrdenCompraSeguimiento"> | string
    proyecto_id?: UuidFilter<"OrdenCompraSeguimiento"> | string
    concepto_id?: UuidFilter<"OrdenCompraSeguimiento"> | string
    monto_comprometido?: DecimalFilter<"OrdenCompraSeguimiento"> | Decimal | DecimalJsLike | number | string
    monto_ejercido?: DecimalFilter<"OrdenCompraSeguimiento"> | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFilter<"OrdenCompraSeguimiento"> | Date | string
    updated_at?: DateTimeFilter<"OrdenCompraSeguimiento"> | Date | string
  }

  export type OrdenCompraSeguimientoOrderByWithRelationInput = {
    id?: SortOrder
    oc_id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    concepto_id?: SortOrder
    monto_comprometido?: SortOrder
    monto_ejercido?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type OrdenCompraSeguimientoWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    oc_id?: string
    AND?: OrdenCompraSeguimientoWhereInput | OrdenCompraSeguimientoWhereInput[]
    OR?: OrdenCompraSeguimientoWhereInput[]
    NOT?: OrdenCompraSeguimientoWhereInput | OrdenCompraSeguimientoWhereInput[]
    tenant_id?: UuidFilter<"OrdenCompraSeguimiento"> | string
    proyecto_id?: UuidFilter<"OrdenCompraSeguimiento"> | string
    concepto_id?: UuidFilter<"OrdenCompraSeguimiento"> | string
    monto_comprometido?: DecimalFilter<"OrdenCompraSeguimiento"> | Decimal | DecimalJsLike | number | string
    monto_ejercido?: DecimalFilter<"OrdenCompraSeguimiento"> | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFilter<"OrdenCompraSeguimiento"> | Date | string
    updated_at?: DateTimeFilter<"OrdenCompraSeguimiento"> | Date | string
  }, "id" | "oc_id">

  export type OrdenCompraSeguimientoOrderByWithAggregationInput = {
    id?: SortOrder
    oc_id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    concepto_id?: SortOrder
    monto_comprometido?: SortOrder
    monto_ejercido?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: OrdenCompraSeguimientoCountOrderByAggregateInput
    _avg?: OrdenCompraSeguimientoAvgOrderByAggregateInput
    _max?: OrdenCompraSeguimientoMaxOrderByAggregateInput
    _min?: OrdenCompraSeguimientoMinOrderByAggregateInput
    _sum?: OrdenCompraSeguimientoSumOrderByAggregateInput
  }

  export type OrdenCompraSeguimientoScalarWhereWithAggregatesInput = {
    AND?: OrdenCompraSeguimientoScalarWhereWithAggregatesInput | OrdenCompraSeguimientoScalarWhereWithAggregatesInput[]
    OR?: OrdenCompraSeguimientoScalarWhereWithAggregatesInput[]
    NOT?: OrdenCompraSeguimientoScalarWhereWithAggregatesInput | OrdenCompraSeguimientoScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"OrdenCompraSeguimiento"> | string
    oc_id?: UuidWithAggregatesFilter<"OrdenCompraSeguimiento"> | string
    tenant_id?: UuidWithAggregatesFilter<"OrdenCompraSeguimiento"> | string
    proyecto_id?: UuidWithAggregatesFilter<"OrdenCompraSeguimiento"> | string
    concepto_id?: UuidWithAggregatesFilter<"OrdenCompraSeguimiento"> | string
    monto_comprometido?: DecimalWithAggregatesFilter<"OrdenCompraSeguimiento"> | Decimal | DecimalJsLike | number | string
    monto_ejercido?: DecimalWithAggregatesFilter<"OrdenCompraSeguimiento"> | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeWithAggregatesFilter<"OrdenCompraSeguimiento"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"OrdenCompraSeguimiento"> | Date | string
  }

  export type ManoObraProyectoWhereInput = {
    AND?: ManoObraProyectoWhereInput | ManoObraProyectoWhereInput[]
    OR?: ManoObraProyectoWhereInput[]
    NOT?: ManoObraProyectoWhereInput | ManoObraProyectoWhereInput[]
    id?: UuidFilter<"ManoObraProyecto"> | string
    tenant_id?: UuidFilter<"ManoObraProyecto"> | string
    proyecto_id?: UuidFilter<"ManoObraProyecto"> | string
    monto_acumulado?: DecimalFilter<"ManoObraProyecto"> | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFilter<"ManoObraProyecto"> | Date | string
    updated_at?: DateTimeFilter<"ManoObraProyecto"> | Date | string
  }

  export type ManoObraProyectoOrderByWithRelationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    monto_acumulado?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ManoObraProyectoWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tenant_id_proyecto_id?: ManoObraProyectoTenant_idProyecto_idCompoundUniqueInput
    AND?: ManoObraProyectoWhereInput | ManoObraProyectoWhereInput[]
    OR?: ManoObraProyectoWhereInput[]
    NOT?: ManoObraProyectoWhereInput | ManoObraProyectoWhereInput[]
    tenant_id?: UuidFilter<"ManoObraProyecto"> | string
    proyecto_id?: UuidFilter<"ManoObraProyecto"> | string
    monto_acumulado?: DecimalFilter<"ManoObraProyecto"> | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFilter<"ManoObraProyecto"> | Date | string
    updated_at?: DateTimeFilter<"ManoObraProyecto"> | Date | string
  }, "id" | "tenant_id_proyecto_id">

  export type ManoObraProyectoOrderByWithAggregationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    monto_acumulado?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: ManoObraProyectoCountOrderByAggregateInput
    _avg?: ManoObraProyectoAvgOrderByAggregateInput
    _max?: ManoObraProyectoMaxOrderByAggregateInput
    _min?: ManoObraProyectoMinOrderByAggregateInput
    _sum?: ManoObraProyectoSumOrderByAggregateInput
  }

  export type ManoObraProyectoScalarWhereWithAggregatesInput = {
    AND?: ManoObraProyectoScalarWhereWithAggregatesInput | ManoObraProyectoScalarWhereWithAggregatesInput[]
    OR?: ManoObraProyectoScalarWhereWithAggregatesInput[]
    NOT?: ManoObraProyectoScalarWhereWithAggregatesInput | ManoObraProyectoScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"ManoObraProyecto"> | string
    tenant_id?: UuidWithAggregatesFilter<"ManoObraProyecto"> | string
    proyecto_id?: UuidWithAggregatesFilter<"ManoObraProyecto"> | string
    monto_acumulado?: DecimalWithAggregatesFilter<"ManoObraProyecto"> | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeWithAggregatesFilter<"ManoObraProyecto"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"ManoObraProyecto"> | Date | string
  }

  export type PagoEvmProcesadoWhereInput = {
    AND?: PagoEvmProcesadoWhereInput | PagoEvmProcesadoWhereInput[]
    OR?: PagoEvmProcesadoWhereInput[]
    NOT?: PagoEvmProcesadoWhereInput | PagoEvmProcesadoWhereInput[]
    id_pago?: UuidFilter<"PagoEvmProcesado"> | string
    tenant_id?: UuidFilter<"PagoEvmProcesado"> | string
    proyecto_id?: UuidFilter<"PagoEvmProcesado"> | string
    tipo?: StringFilter<"PagoEvmProcesado"> | string
    monto?: DecimalFilter<"PagoEvmProcesado"> | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFilter<"PagoEvmProcesado"> | Date | string
  }

  export type PagoEvmProcesadoOrderByWithRelationInput = {
    id_pago?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    tipo?: SortOrder
    monto?: SortOrder
    created_at?: SortOrder
  }

  export type PagoEvmProcesadoWhereUniqueInput = Prisma.AtLeast<{
    id_pago?: string
    AND?: PagoEvmProcesadoWhereInput | PagoEvmProcesadoWhereInput[]
    OR?: PagoEvmProcesadoWhereInput[]
    NOT?: PagoEvmProcesadoWhereInput | PagoEvmProcesadoWhereInput[]
    tenant_id?: UuidFilter<"PagoEvmProcesado"> | string
    proyecto_id?: UuidFilter<"PagoEvmProcesado"> | string
    tipo?: StringFilter<"PagoEvmProcesado"> | string
    monto?: DecimalFilter<"PagoEvmProcesado"> | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFilter<"PagoEvmProcesado"> | Date | string
  }, "id_pago">

  export type PagoEvmProcesadoOrderByWithAggregationInput = {
    id_pago?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    tipo?: SortOrder
    monto?: SortOrder
    created_at?: SortOrder
    _count?: PagoEvmProcesadoCountOrderByAggregateInput
    _avg?: PagoEvmProcesadoAvgOrderByAggregateInput
    _max?: PagoEvmProcesadoMaxOrderByAggregateInput
    _min?: PagoEvmProcesadoMinOrderByAggregateInput
    _sum?: PagoEvmProcesadoSumOrderByAggregateInput
  }

  export type PagoEvmProcesadoScalarWhereWithAggregatesInput = {
    AND?: PagoEvmProcesadoScalarWhereWithAggregatesInput | PagoEvmProcesadoScalarWhereWithAggregatesInput[]
    OR?: PagoEvmProcesadoScalarWhereWithAggregatesInput[]
    NOT?: PagoEvmProcesadoScalarWhereWithAggregatesInput | PagoEvmProcesadoScalarWhereWithAggregatesInput[]
    id_pago?: UuidWithAggregatesFilter<"PagoEvmProcesado"> | string
    tenant_id?: UuidWithAggregatesFilter<"PagoEvmProcesado"> | string
    proyecto_id?: UuidWithAggregatesFilter<"PagoEvmProcesado"> | string
    tipo?: StringWithAggregatesFilter<"PagoEvmProcesado"> | string
    monto?: DecimalWithAggregatesFilter<"PagoEvmProcesado"> | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeWithAggregatesFilter<"PagoEvmProcesado"> | Date | string
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
    concepto_id?: UuidNullableFilter<"AvanceFisico"> | string | null
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
    concepto_id?: SortOrderInput | SortOrder
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
    concepto_id?: UuidNullableFilter<"AvanceFisico"> | string | null
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
    concepto_id?: SortOrderInput | SortOrder
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
    concepto_id?: UuidNullableWithAggregatesFilter<"AvanceFisico"> | string | null
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

  export type MaterialConsumidoObraWhereInput = {
    AND?: MaterialConsumidoObraWhereInput | MaterialConsumidoObraWhereInput[]
    OR?: MaterialConsumidoObraWhereInput[]
    NOT?: MaterialConsumidoObraWhereInput | MaterialConsumidoObraWhereInput[]
    id?: UuidFilter<"MaterialConsumidoObra"> | string
    tenant_id?: UuidFilter<"MaterialConsumidoObra"> | string
    proyecto_id?: UuidFilter<"MaterialConsumidoObra"> | string
    concepto_id?: UuidFilter<"MaterialConsumidoObra"> | string
    movimiento_almacen_id?: UuidFilter<"MaterialConsumidoObra"> | string
    insumo_id?: UuidFilter<"MaterialConsumidoObra"> | string
    insumo_clave?: StringNullableFilter<"MaterialConsumidoObra"> | string | null
    insumo_nombre?: StringNullableFilter<"MaterialConsumidoObra"> | string | null
    cantidad?: DecimalFilter<"MaterialConsumidoObra"> | Decimal | DecimalJsLike | number | string
    unidad?: StringFilter<"MaterialConsumidoObra"> | string
    costo_unitario?: DecimalNullableFilter<"MaterialConsumidoObra"> | Decimal | DecimalJsLike | number | string | null
    costo_total?: DecimalNullableFilter<"MaterialConsumidoObra"> | Decimal | DecimalJsLike | number | string | null
    fecha?: DateTimeFilter<"MaterialConsumidoObra"> | Date | string
    frente_trabajo?: StringNullableFilter<"MaterialConsumidoObra"> | string | null
    registrado_por?: UuidNullableFilter<"MaterialConsumidoObra"> | string | null
    created_at?: DateTimeFilter<"MaterialConsumidoObra"> | Date | string
  }

  export type MaterialConsumidoObraOrderByWithRelationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    concepto_id?: SortOrder
    movimiento_almacen_id?: SortOrder
    insumo_id?: SortOrder
    insumo_clave?: SortOrderInput | SortOrder
    insumo_nombre?: SortOrderInput | SortOrder
    cantidad?: SortOrder
    unidad?: SortOrder
    costo_unitario?: SortOrderInput | SortOrder
    costo_total?: SortOrderInput | SortOrder
    fecha?: SortOrder
    frente_trabajo?: SortOrderInput | SortOrder
    registrado_por?: SortOrderInput | SortOrder
    created_at?: SortOrder
  }

  export type MaterialConsumidoObraWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    movimiento_almacen_id?: string
    AND?: MaterialConsumidoObraWhereInput | MaterialConsumidoObraWhereInput[]
    OR?: MaterialConsumidoObraWhereInput[]
    NOT?: MaterialConsumidoObraWhereInput | MaterialConsumidoObraWhereInput[]
    tenant_id?: UuidFilter<"MaterialConsumidoObra"> | string
    proyecto_id?: UuidFilter<"MaterialConsumidoObra"> | string
    concepto_id?: UuidFilter<"MaterialConsumidoObra"> | string
    insumo_id?: UuidFilter<"MaterialConsumidoObra"> | string
    insumo_clave?: StringNullableFilter<"MaterialConsumidoObra"> | string | null
    insumo_nombre?: StringNullableFilter<"MaterialConsumidoObra"> | string | null
    cantidad?: DecimalFilter<"MaterialConsumidoObra"> | Decimal | DecimalJsLike | number | string
    unidad?: StringFilter<"MaterialConsumidoObra"> | string
    costo_unitario?: DecimalNullableFilter<"MaterialConsumidoObra"> | Decimal | DecimalJsLike | number | string | null
    costo_total?: DecimalNullableFilter<"MaterialConsumidoObra"> | Decimal | DecimalJsLike | number | string | null
    fecha?: DateTimeFilter<"MaterialConsumidoObra"> | Date | string
    frente_trabajo?: StringNullableFilter<"MaterialConsumidoObra"> | string | null
    registrado_por?: UuidNullableFilter<"MaterialConsumidoObra"> | string | null
    created_at?: DateTimeFilter<"MaterialConsumidoObra"> | Date | string
  }, "id" | "movimiento_almacen_id">

  export type MaterialConsumidoObraOrderByWithAggregationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    concepto_id?: SortOrder
    movimiento_almacen_id?: SortOrder
    insumo_id?: SortOrder
    insumo_clave?: SortOrderInput | SortOrder
    insumo_nombre?: SortOrderInput | SortOrder
    cantidad?: SortOrder
    unidad?: SortOrder
    costo_unitario?: SortOrderInput | SortOrder
    costo_total?: SortOrderInput | SortOrder
    fecha?: SortOrder
    frente_trabajo?: SortOrderInput | SortOrder
    registrado_por?: SortOrderInput | SortOrder
    created_at?: SortOrder
    _count?: MaterialConsumidoObraCountOrderByAggregateInput
    _avg?: MaterialConsumidoObraAvgOrderByAggregateInput
    _max?: MaterialConsumidoObraMaxOrderByAggregateInput
    _min?: MaterialConsumidoObraMinOrderByAggregateInput
    _sum?: MaterialConsumidoObraSumOrderByAggregateInput
  }

  export type MaterialConsumidoObraScalarWhereWithAggregatesInput = {
    AND?: MaterialConsumidoObraScalarWhereWithAggregatesInput | MaterialConsumidoObraScalarWhereWithAggregatesInput[]
    OR?: MaterialConsumidoObraScalarWhereWithAggregatesInput[]
    NOT?: MaterialConsumidoObraScalarWhereWithAggregatesInput | MaterialConsumidoObraScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"MaterialConsumidoObra"> | string
    tenant_id?: UuidWithAggregatesFilter<"MaterialConsumidoObra"> | string
    proyecto_id?: UuidWithAggregatesFilter<"MaterialConsumidoObra"> | string
    concepto_id?: UuidWithAggregatesFilter<"MaterialConsumidoObra"> | string
    movimiento_almacen_id?: UuidWithAggregatesFilter<"MaterialConsumidoObra"> | string
    insumo_id?: UuidWithAggregatesFilter<"MaterialConsumidoObra"> | string
    insumo_clave?: StringNullableWithAggregatesFilter<"MaterialConsumidoObra"> | string | null
    insumo_nombre?: StringNullableWithAggregatesFilter<"MaterialConsumidoObra"> | string | null
    cantidad?: DecimalWithAggregatesFilter<"MaterialConsumidoObra"> | Decimal | DecimalJsLike | number | string
    unidad?: StringWithAggregatesFilter<"MaterialConsumidoObra"> | string
    costo_unitario?: DecimalNullableWithAggregatesFilter<"MaterialConsumidoObra"> | Decimal | DecimalJsLike | number | string | null
    costo_total?: DecimalNullableWithAggregatesFilter<"MaterialConsumidoObra"> | Decimal | DecimalJsLike | number | string | null
    fecha?: DateTimeWithAggregatesFilter<"MaterialConsumidoObra"> | Date | string
    frente_trabajo?: StringNullableWithAggregatesFilter<"MaterialConsumidoObra"> | string | null
    registrado_por?: UuidNullableWithAggregatesFilter<"MaterialConsumidoObra"> | string | null
    created_at?: DateTimeWithAggregatesFilter<"MaterialConsumidoObra"> | Date | string
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
    ac_comprometido?: Decimal | DecimalJsLike | number | string
    ac_ejercido?: Decimal | DecimalJsLike | number | string
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
    ac_comprometido?: Decimal | DecimalJsLike | number | string
    ac_ejercido?: Decimal | DecimalJsLike | number | string
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
    ac_comprometido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    ac_ejercido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
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
    ac_comprometido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    ac_ejercido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
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
    ac_comprometido?: Decimal | DecimalJsLike | number | string
    ac_ejercido?: Decimal | DecimalJsLike | number | string
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
    ac_comprometido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    ac_ejercido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
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
    ac_comprometido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    ac_ejercido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    estado?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrdenCompraSeguimientoCreateInput = {
    id?: string
    oc_id: string
    tenant_id: string
    proyecto_id: string
    concepto_id: string
    monto_comprometido?: Decimal | DecimalJsLike | number | string
    monto_ejercido?: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type OrdenCompraSeguimientoUncheckedCreateInput = {
    id?: string
    oc_id: string
    tenant_id: string
    proyecto_id: string
    concepto_id: string
    monto_comprometido?: Decimal | DecimalJsLike | number | string
    monto_ejercido?: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type OrdenCompraSeguimientoUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    oc_id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    concepto_id?: StringFieldUpdateOperationsInput | string
    monto_comprometido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_ejercido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrdenCompraSeguimientoUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    oc_id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    concepto_id?: StringFieldUpdateOperationsInput | string
    monto_comprometido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_ejercido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrdenCompraSeguimientoCreateManyInput = {
    id?: string
    oc_id: string
    tenant_id: string
    proyecto_id: string
    concepto_id: string
    monto_comprometido?: Decimal | DecimalJsLike | number | string
    monto_ejercido?: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type OrdenCompraSeguimientoUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    oc_id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    concepto_id?: StringFieldUpdateOperationsInput | string
    monto_comprometido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_ejercido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrdenCompraSeguimientoUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    oc_id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    concepto_id?: StringFieldUpdateOperationsInput | string
    monto_comprometido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_ejercido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ManoObraProyectoCreateInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    monto_acumulado?: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ManoObraProyectoUncheckedCreateInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    monto_acumulado?: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ManoObraProyectoUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    monto_acumulado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ManoObraProyectoUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    monto_acumulado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ManoObraProyectoCreateManyInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    monto_acumulado?: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ManoObraProyectoUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    monto_acumulado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ManoObraProyectoUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    monto_acumulado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PagoEvmProcesadoCreateInput = {
    id_pago: string
    tenant_id: string
    proyecto_id: string
    tipo: string
    monto: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
  }

  export type PagoEvmProcesadoUncheckedCreateInput = {
    id_pago: string
    tenant_id: string
    proyecto_id: string
    tipo: string
    monto: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
  }

  export type PagoEvmProcesadoUpdateInput = {
    id_pago?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    monto?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PagoEvmProcesadoUncheckedUpdateInput = {
    id_pago?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    monto?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PagoEvmProcesadoCreateManyInput = {
    id_pago: string
    tenant_id: string
    proyecto_id: string
    tipo: string
    monto: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
  }

  export type PagoEvmProcesadoUpdateManyMutationInput = {
    id_pago?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    monto?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PagoEvmProcesadoUncheckedUpdateManyInput = {
    id_pago?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    monto?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
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
    concepto_id?: string | null
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
    concepto_id?: string | null
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
    concepto_id?: NullableStringFieldUpdateOperationsInput | string | null
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
    concepto_id?: NullableStringFieldUpdateOperationsInput | string | null
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
    concepto_id?: string | null
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
    concepto_id?: NullableStringFieldUpdateOperationsInput | string | null
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
    concepto_id?: NullableStringFieldUpdateOperationsInput | string | null
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

  export type MaterialConsumidoObraCreateInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    concepto_id: string
    movimiento_almacen_id: string
    insumo_id: string
    insumo_clave?: string | null
    insumo_nombre?: string | null
    cantidad: Decimal | DecimalJsLike | number | string
    unidad: string
    costo_unitario?: Decimal | DecimalJsLike | number | string | null
    costo_total?: Decimal | DecimalJsLike | number | string | null
    fecha?: Date | string
    frente_trabajo?: string | null
    registrado_por?: string | null
    created_at?: Date | string
  }

  export type MaterialConsumidoObraUncheckedCreateInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    concepto_id: string
    movimiento_almacen_id: string
    insumo_id: string
    insumo_clave?: string | null
    insumo_nombre?: string | null
    cantidad: Decimal | DecimalJsLike | number | string
    unidad: string
    costo_unitario?: Decimal | DecimalJsLike | number | string | null
    costo_total?: Decimal | DecimalJsLike | number | string | null
    fecha?: Date | string
    frente_trabajo?: string | null
    registrado_por?: string | null
    created_at?: Date | string
  }

  export type MaterialConsumidoObraUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    concepto_id?: StringFieldUpdateOperationsInput | string
    movimiento_almacen_id?: StringFieldUpdateOperationsInput | string
    insumo_id?: StringFieldUpdateOperationsInput | string
    insumo_clave?: NullableStringFieldUpdateOperationsInput | string | null
    insumo_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    cantidad?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unidad?: StringFieldUpdateOperationsInput | string
    costo_unitario?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    costo_total?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    fecha?: DateTimeFieldUpdateOperationsInput | Date | string
    frente_trabajo?: NullableStringFieldUpdateOperationsInput | string | null
    registrado_por?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MaterialConsumidoObraUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    concepto_id?: StringFieldUpdateOperationsInput | string
    movimiento_almacen_id?: StringFieldUpdateOperationsInput | string
    insumo_id?: StringFieldUpdateOperationsInput | string
    insumo_clave?: NullableStringFieldUpdateOperationsInput | string | null
    insumo_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    cantidad?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unidad?: StringFieldUpdateOperationsInput | string
    costo_unitario?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    costo_total?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    fecha?: DateTimeFieldUpdateOperationsInput | Date | string
    frente_trabajo?: NullableStringFieldUpdateOperationsInput | string | null
    registrado_por?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MaterialConsumidoObraCreateManyInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    concepto_id: string
    movimiento_almacen_id: string
    insumo_id: string
    insumo_clave?: string | null
    insumo_nombre?: string | null
    cantidad: Decimal | DecimalJsLike | number | string
    unidad: string
    costo_unitario?: Decimal | DecimalJsLike | number | string | null
    costo_total?: Decimal | DecimalJsLike | number | string | null
    fecha?: Date | string
    frente_trabajo?: string | null
    registrado_por?: string | null
    created_at?: Date | string
  }

  export type MaterialConsumidoObraUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    concepto_id?: StringFieldUpdateOperationsInput | string
    movimiento_almacen_id?: StringFieldUpdateOperationsInput | string
    insumo_id?: StringFieldUpdateOperationsInput | string
    insumo_clave?: NullableStringFieldUpdateOperationsInput | string | null
    insumo_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    cantidad?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unidad?: StringFieldUpdateOperationsInput | string
    costo_unitario?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    costo_total?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    fecha?: DateTimeFieldUpdateOperationsInput | Date | string
    frente_trabajo?: NullableStringFieldUpdateOperationsInput | string | null
    registrado_por?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MaterialConsumidoObraUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    concepto_id?: StringFieldUpdateOperationsInput | string
    movimiento_almacen_id?: StringFieldUpdateOperationsInput | string
    insumo_id?: StringFieldUpdateOperationsInput | string
    insumo_clave?: NullableStringFieldUpdateOperationsInput | string | null
    insumo_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    cantidad?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unidad?: StringFieldUpdateOperationsInput | string
    costo_unitario?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    costo_total?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    fecha?: DateTimeFieldUpdateOperationsInput | Date | string
    frente_trabajo?: NullableStringFieldUpdateOperationsInput | string | null
    registrado_por?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
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
    ac_comprometido?: SortOrder
    ac_ejercido?: SortOrder
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
    ac_comprometido?: SortOrder
    ac_ejercido?: SortOrder
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
    ac_comprometido?: SortOrder
    ac_ejercido?: SortOrder
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
    ac_comprometido?: SortOrder
    ac_ejercido?: SortOrder
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
    ac_comprometido?: SortOrder
    ac_ejercido?: SortOrder
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

  export type OrdenCompraSeguimientoCountOrderByAggregateInput = {
    id?: SortOrder
    oc_id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    concepto_id?: SortOrder
    monto_comprometido?: SortOrder
    monto_ejercido?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type OrdenCompraSeguimientoAvgOrderByAggregateInput = {
    monto_comprometido?: SortOrder
    monto_ejercido?: SortOrder
  }

  export type OrdenCompraSeguimientoMaxOrderByAggregateInput = {
    id?: SortOrder
    oc_id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    concepto_id?: SortOrder
    monto_comprometido?: SortOrder
    monto_ejercido?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type OrdenCompraSeguimientoMinOrderByAggregateInput = {
    id?: SortOrder
    oc_id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    concepto_id?: SortOrder
    monto_comprometido?: SortOrder
    monto_ejercido?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type OrdenCompraSeguimientoSumOrderByAggregateInput = {
    monto_comprometido?: SortOrder
    monto_ejercido?: SortOrder
  }

  export type ManoObraProyectoTenant_idProyecto_idCompoundUniqueInput = {
    tenant_id: string
    proyecto_id: string
  }

  export type ManoObraProyectoCountOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    monto_acumulado?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ManoObraProyectoAvgOrderByAggregateInput = {
    monto_acumulado?: SortOrder
  }

  export type ManoObraProyectoMaxOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    monto_acumulado?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ManoObraProyectoMinOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    monto_acumulado?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ManoObraProyectoSumOrderByAggregateInput = {
    monto_acumulado?: SortOrder
  }

  export type PagoEvmProcesadoCountOrderByAggregateInput = {
    id_pago?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    tipo?: SortOrder
    monto?: SortOrder
    created_at?: SortOrder
  }

  export type PagoEvmProcesadoAvgOrderByAggregateInput = {
    monto?: SortOrder
  }

  export type PagoEvmProcesadoMaxOrderByAggregateInput = {
    id_pago?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    tipo?: SortOrder
    monto?: SortOrder
    created_at?: SortOrder
  }

  export type PagoEvmProcesadoMinOrderByAggregateInput = {
    id_pago?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    tipo?: SortOrder
    monto?: SortOrder
    created_at?: SortOrder
  }

  export type PagoEvmProcesadoSumOrderByAggregateInput = {
    monto?: SortOrder
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

  export type EstimacionNullableRelationFilter = {
    is?: EstimacionWhereInput | null
    isNot?: EstimacionWhereInput | null
  }

  export type AvanceFisicoCountOrderByAggregateInput = {
    id_avance?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    concepto_id?: SortOrder
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
    concepto_id?: SortOrder
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
    concepto_id?: SortOrder
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

  export type MaterialConsumidoObraCountOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    concepto_id?: SortOrder
    movimiento_almacen_id?: SortOrder
    insumo_id?: SortOrder
    insumo_clave?: SortOrder
    insumo_nombre?: SortOrder
    cantidad?: SortOrder
    unidad?: SortOrder
    costo_unitario?: SortOrder
    costo_total?: SortOrder
    fecha?: SortOrder
    frente_trabajo?: SortOrder
    registrado_por?: SortOrder
    created_at?: SortOrder
  }

  export type MaterialConsumidoObraAvgOrderByAggregateInput = {
    cantidad?: SortOrder
    costo_unitario?: SortOrder
    costo_total?: SortOrder
  }

  export type MaterialConsumidoObraMaxOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    concepto_id?: SortOrder
    movimiento_almacen_id?: SortOrder
    insumo_id?: SortOrder
    insumo_clave?: SortOrder
    insumo_nombre?: SortOrder
    cantidad?: SortOrder
    unidad?: SortOrder
    costo_unitario?: SortOrder
    costo_total?: SortOrder
    fecha?: SortOrder
    frente_trabajo?: SortOrder
    registrado_por?: SortOrder
    created_at?: SortOrder
  }

  export type MaterialConsumidoObraMinOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    concepto_id?: SortOrder
    movimiento_almacen_id?: SortOrder
    insumo_id?: SortOrder
    insumo_clave?: SortOrder
    insumo_nombre?: SortOrder
    cantidad?: SortOrder
    unidad?: SortOrder
    costo_unitario?: SortOrder
    costo_total?: SortOrder
    fecha?: SortOrder
    frente_trabajo?: SortOrder
    registrado_por?: SortOrder
    created_at?: SortOrder
  }

  export type MaterialConsumidoObraSumOrderByAggregateInput = {
    cantidad?: SortOrder
    costo_unitario?: SortOrder
    costo_total?: SortOrder
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

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EstimacionCreateNestedOneWithoutAvancesInput = {
    create?: XOR<EstimacionCreateWithoutAvancesInput, EstimacionUncheckedCreateWithoutAvancesInput>
    connectOrCreate?: EstimacionCreateOrConnectWithoutAvancesInput
    connect?: EstimacionWhereUniqueInput
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
    concepto_id?: string | null
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
    concepto_id?: string | null
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
    concepto_id?: UuidNullableFilter<"AvanceFisico"> | string | null
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
    concepto_id?: string | null
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
    concepto_id?: NullableStringFieldUpdateOperationsInput | string | null
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
    concepto_id?: NullableStringFieldUpdateOperationsInput | string | null
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
    concepto_id?: NullableStringFieldUpdateOperationsInput | string | null
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
     * @deprecated Use ProgramacionObraDefaultArgs instead
     */
    export type ProgramacionObraArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProgramacionObraDefaultArgs<ExtArgs>
    /**
     * @deprecated Use OrdenCompraSeguimientoDefaultArgs instead
     */
    export type OrdenCompraSeguimientoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = OrdenCompraSeguimientoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ManoObraProyectoDefaultArgs instead
     */
    export type ManoObraProyectoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ManoObraProyectoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PagoEvmProcesadoDefaultArgs instead
     */
    export type PagoEvmProcesadoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PagoEvmProcesadoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use AlertaProyectoDefaultArgs instead
     */
    export type AlertaProyectoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AlertaProyectoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ProyeccionCierreDefaultArgs instead
     */
    export type ProyeccionCierreArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProyeccionCierreDefaultArgs<ExtArgs>
    /**
     * @deprecated Use BitacoraObraDefaultArgs instead
     */
    export type BitacoraObraArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = BitacoraObraDefaultArgs<ExtArgs>
    /**
     * @deprecated Use AvanceFisicoDefaultArgs instead
     */
    export type AvanceFisicoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AvanceFisicoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use MaterialConsumidoObraDefaultArgs instead
     */
    export type MaterialConsumidoObraArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = MaterialConsumidoObraDefaultArgs<ExtArgs>
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