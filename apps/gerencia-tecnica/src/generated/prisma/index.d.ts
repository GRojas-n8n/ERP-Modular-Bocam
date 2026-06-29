
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
 * Model CategoriaGasto
 * Catálogo de categorías de gasto por proyecto — gestionadas por Control de Proyectos.
 * Predefinidas por el sistema (seed); personalizables por tenant antes de activar el proyecto.
 * Congeladas una vez que el proyecto pasa a estado ACTIVO.
 */
export type CategoriaGasto = $Result.DefaultSelection<Prisma.$CategoriaGastoPayload>
/**
 * Model ProyectoCostosConfig
 * Configuración de control de costos por proyecto.
 * Almacena el estado CONFIGURACION/ACTIVO/CERRADO para congelar categorías.
 */
export type ProyectoCostosConfig = $Result.DefaultSelection<Prisma.$ProyectoCostosConfigPayload>
/**
 * Model Insumo
 * Catálogo Maestro de Insumos: Materiales, Mano de Obra, Equipo, Subcontratos.
 * Tabla maestra con aislamiento por tenant_id (RLS).
 */
export type Insumo = $Result.DefaultSelection<Prisma.$InsumoPayload>
/**
 * Model PresupuestoBase
 * Presupuesto Base de un proyecto/centro de costos.
 * Tabla transaccional: requiere OBLIGATORIAMENTE tenant_id + proyecto_id.
 */
export type PresupuestoBase = $Result.DefaultSelection<Prisma.$PresupuestoBasePayload>
/**
 * Model Concepto
 * Concepto de Obra: Línea o partida específica de un presupuesto.
 * Tabla transaccional hija, hereda tenant_id y proyecto_id del padre.
 */
export type Concepto = $Result.DefaultSelection<Prisma.$ConceptoPayload>
/**
 * Model ConceptoInsumo
 * Composición APU: relación entre un Concepto y sus Insumos (rendimientos y cantidades).
 * Se pobla al importar el archivo "ANÁLISIS DE PRECIOS UNITARIOS" de OPUS.
 * Permite calcular take-off de materiales a partir del avance reportado.
 */
export type ConceptoInsumo = $Result.DefaultSelection<Prisma.$ConceptoInsumoPayload>
/**
 * Model SaldoPartida
 * Saldo presupuestal por concepto/partida del catálogo APU.
 * Se crea automáticamente al aprobar un presupuesto (uno por concepto).
 * Es el gate de control antes de generar OC o aprobar requisiciones.
 */
export type SaldoPartida = $Result.DefaultSelection<Prisma.$SaldoPartidaPayload>
/**
 * Model SaldoMovimiento
 * Audit trail de cada cambio en SaldoPartida (compromisos, pagos, reversas).
 */
export type SaldoMovimiento = $Result.DefaultSelection<Prisma.$SaldoMovimientoPayload>
/**
 * Model FichaTecnicaInsumo
 * 
 */
export type FichaTecnicaInsumo = $Result.DefaultSelection<Prisma.$FichaTecnicaInsumoPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const TipoInsumo: {
  MATERIAL: 'MATERIAL',
  MANO_DE_OBRA: 'MANO_DE_OBRA',
  EQUIPO: 'EQUIPO',
  SUBCONTRATO: 'SUBCONTRATO',
  INDIRECTO: 'INDIRECTO'
};

export type TipoInsumo = (typeof TipoInsumo)[keyof typeof TipoInsumo]


export const EstadoPresupuesto: {
  BORRADOR: 'BORRADOR',
  EN_REVISION: 'EN_REVISION',
  APROBADO: 'APROBADO',
  LIBERADO: 'LIBERADO',
  CONGELADO: 'CONGELADO'
};

export type EstadoPresupuesto = (typeof EstadoPresupuesto)[keyof typeof EstadoPresupuesto]

}

export type TipoInsumo = $Enums.TipoInsumo

export const TipoInsumo: typeof $Enums.TipoInsumo

export type EstadoPresupuesto = $Enums.EstadoPresupuesto

export const EstadoPresupuesto: typeof $Enums.EstadoPresupuesto

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more CategoriaGastos
 * const categoriaGastos = await prisma.categoriaGasto.findMany()
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
   * // Fetch zero or more CategoriaGastos
   * const categoriaGastos = await prisma.categoriaGasto.findMany()
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
   * `prisma.categoriaGasto`: Exposes CRUD operations for the **CategoriaGasto** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CategoriaGastos
    * const categoriaGastos = await prisma.categoriaGasto.findMany()
    * ```
    */
  get categoriaGasto(): Prisma.CategoriaGastoDelegate<ExtArgs>;

  /**
   * `prisma.proyectoCostosConfig`: Exposes CRUD operations for the **ProyectoCostosConfig** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ProyectoCostosConfigs
    * const proyectoCostosConfigs = await prisma.proyectoCostosConfig.findMany()
    * ```
    */
  get proyectoCostosConfig(): Prisma.ProyectoCostosConfigDelegate<ExtArgs>;

  /**
   * `prisma.insumo`: Exposes CRUD operations for the **Insumo** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Insumos
    * const insumos = await prisma.insumo.findMany()
    * ```
    */
  get insumo(): Prisma.InsumoDelegate<ExtArgs>;

  /**
   * `prisma.presupuestoBase`: Exposes CRUD operations for the **PresupuestoBase** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PresupuestoBases
    * const presupuestoBases = await prisma.presupuestoBase.findMany()
    * ```
    */
  get presupuestoBase(): Prisma.PresupuestoBaseDelegate<ExtArgs>;

  /**
   * `prisma.concepto`: Exposes CRUD operations for the **Concepto** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Conceptos
    * const conceptos = await prisma.concepto.findMany()
    * ```
    */
  get concepto(): Prisma.ConceptoDelegate<ExtArgs>;

  /**
   * `prisma.conceptoInsumo`: Exposes CRUD operations for the **ConceptoInsumo** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ConceptoInsumos
    * const conceptoInsumos = await prisma.conceptoInsumo.findMany()
    * ```
    */
  get conceptoInsumo(): Prisma.ConceptoInsumoDelegate<ExtArgs>;

  /**
   * `prisma.saldoPartida`: Exposes CRUD operations for the **SaldoPartida** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SaldoPartidas
    * const saldoPartidas = await prisma.saldoPartida.findMany()
    * ```
    */
  get saldoPartida(): Prisma.SaldoPartidaDelegate<ExtArgs>;

  /**
   * `prisma.saldoMovimiento`: Exposes CRUD operations for the **SaldoMovimiento** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SaldoMovimientos
    * const saldoMovimientos = await prisma.saldoMovimiento.findMany()
    * ```
    */
  get saldoMovimiento(): Prisma.SaldoMovimientoDelegate<ExtArgs>;

  /**
   * `prisma.fichaTecnicaInsumo`: Exposes CRUD operations for the **FichaTecnicaInsumo** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more FichaTecnicaInsumos
    * const fichaTecnicaInsumos = await prisma.fichaTecnicaInsumo.findMany()
    * ```
    */
  get fichaTecnicaInsumo(): Prisma.FichaTecnicaInsumoDelegate<ExtArgs>;
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
    CategoriaGasto: 'CategoriaGasto',
    ProyectoCostosConfig: 'ProyectoCostosConfig',
    Insumo: 'Insumo',
    PresupuestoBase: 'PresupuestoBase',
    Concepto: 'Concepto',
    ConceptoInsumo: 'ConceptoInsumo',
    SaldoPartida: 'SaldoPartida',
    SaldoMovimiento: 'SaldoMovimiento',
    FichaTecnicaInsumo: 'FichaTecnicaInsumo'
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
      modelProps: "categoriaGasto" | "proyectoCostosConfig" | "insumo" | "presupuestoBase" | "concepto" | "conceptoInsumo" | "saldoPartida" | "saldoMovimiento" | "fichaTecnicaInsumo"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      CategoriaGasto: {
        payload: Prisma.$CategoriaGastoPayload<ExtArgs>
        fields: Prisma.CategoriaGastoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CategoriaGastoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoriaGastoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CategoriaGastoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoriaGastoPayload>
          }
          findFirst: {
            args: Prisma.CategoriaGastoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoriaGastoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CategoriaGastoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoriaGastoPayload>
          }
          findMany: {
            args: Prisma.CategoriaGastoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoriaGastoPayload>[]
          }
          create: {
            args: Prisma.CategoriaGastoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoriaGastoPayload>
          }
          createMany: {
            args: Prisma.CategoriaGastoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CategoriaGastoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoriaGastoPayload>[]
          }
          delete: {
            args: Prisma.CategoriaGastoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoriaGastoPayload>
          }
          update: {
            args: Prisma.CategoriaGastoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoriaGastoPayload>
          }
          deleteMany: {
            args: Prisma.CategoriaGastoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CategoriaGastoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CategoriaGastoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoriaGastoPayload>
          }
          aggregate: {
            args: Prisma.CategoriaGastoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCategoriaGasto>
          }
          groupBy: {
            args: Prisma.CategoriaGastoGroupByArgs<ExtArgs>
            result: $Utils.Optional<CategoriaGastoGroupByOutputType>[]
          }
          count: {
            args: Prisma.CategoriaGastoCountArgs<ExtArgs>
            result: $Utils.Optional<CategoriaGastoCountAggregateOutputType> | number
          }
        }
      }
      ProyectoCostosConfig: {
        payload: Prisma.$ProyectoCostosConfigPayload<ExtArgs>
        fields: Prisma.ProyectoCostosConfigFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProyectoCostosConfigFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProyectoCostosConfigPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProyectoCostosConfigFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProyectoCostosConfigPayload>
          }
          findFirst: {
            args: Prisma.ProyectoCostosConfigFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProyectoCostosConfigPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProyectoCostosConfigFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProyectoCostosConfigPayload>
          }
          findMany: {
            args: Prisma.ProyectoCostosConfigFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProyectoCostosConfigPayload>[]
          }
          create: {
            args: Prisma.ProyectoCostosConfigCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProyectoCostosConfigPayload>
          }
          createMany: {
            args: Prisma.ProyectoCostosConfigCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProyectoCostosConfigCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProyectoCostosConfigPayload>[]
          }
          delete: {
            args: Prisma.ProyectoCostosConfigDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProyectoCostosConfigPayload>
          }
          update: {
            args: Prisma.ProyectoCostosConfigUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProyectoCostosConfigPayload>
          }
          deleteMany: {
            args: Prisma.ProyectoCostosConfigDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProyectoCostosConfigUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ProyectoCostosConfigUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProyectoCostosConfigPayload>
          }
          aggregate: {
            args: Prisma.ProyectoCostosConfigAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProyectoCostosConfig>
          }
          groupBy: {
            args: Prisma.ProyectoCostosConfigGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProyectoCostosConfigGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProyectoCostosConfigCountArgs<ExtArgs>
            result: $Utils.Optional<ProyectoCostosConfigCountAggregateOutputType> | number
          }
        }
      }
      Insumo: {
        payload: Prisma.$InsumoPayload<ExtArgs>
        fields: Prisma.InsumoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.InsumoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InsumoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.InsumoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InsumoPayload>
          }
          findFirst: {
            args: Prisma.InsumoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InsumoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.InsumoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InsumoPayload>
          }
          findMany: {
            args: Prisma.InsumoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InsumoPayload>[]
          }
          create: {
            args: Prisma.InsumoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InsumoPayload>
          }
          createMany: {
            args: Prisma.InsumoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.InsumoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InsumoPayload>[]
          }
          delete: {
            args: Prisma.InsumoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InsumoPayload>
          }
          update: {
            args: Prisma.InsumoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InsumoPayload>
          }
          deleteMany: {
            args: Prisma.InsumoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.InsumoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.InsumoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InsumoPayload>
          }
          aggregate: {
            args: Prisma.InsumoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateInsumo>
          }
          groupBy: {
            args: Prisma.InsumoGroupByArgs<ExtArgs>
            result: $Utils.Optional<InsumoGroupByOutputType>[]
          }
          count: {
            args: Prisma.InsumoCountArgs<ExtArgs>
            result: $Utils.Optional<InsumoCountAggregateOutputType> | number
          }
        }
      }
      PresupuestoBase: {
        payload: Prisma.$PresupuestoBasePayload<ExtArgs>
        fields: Prisma.PresupuestoBaseFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PresupuestoBaseFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PresupuestoBasePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PresupuestoBaseFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PresupuestoBasePayload>
          }
          findFirst: {
            args: Prisma.PresupuestoBaseFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PresupuestoBasePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PresupuestoBaseFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PresupuestoBasePayload>
          }
          findMany: {
            args: Prisma.PresupuestoBaseFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PresupuestoBasePayload>[]
          }
          create: {
            args: Prisma.PresupuestoBaseCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PresupuestoBasePayload>
          }
          createMany: {
            args: Prisma.PresupuestoBaseCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PresupuestoBaseCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PresupuestoBasePayload>[]
          }
          delete: {
            args: Prisma.PresupuestoBaseDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PresupuestoBasePayload>
          }
          update: {
            args: Prisma.PresupuestoBaseUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PresupuestoBasePayload>
          }
          deleteMany: {
            args: Prisma.PresupuestoBaseDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PresupuestoBaseUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PresupuestoBaseUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PresupuestoBasePayload>
          }
          aggregate: {
            args: Prisma.PresupuestoBaseAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePresupuestoBase>
          }
          groupBy: {
            args: Prisma.PresupuestoBaseGroupByArgs<ExtArgs>
            result: $Utils.Optional<PresupuestoBaseGroupByOutputType>[]
          }
          count: {
            args: Prisma.PresupuestoBaseCountArgs<ExtArgs>
            result: $Utils.Optional<PresupuestoBaseCountAggregateOutputType> | number
          }
        }
      }
      Concepto: {
        payload: Prisma.$ConceptoPayload<ExtArgs>
        fields: Prisma.ConceptoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ConceptoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConceptoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ConceptoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConceptoPayload>
          }
          findFirst: {
            args: Prisma.ConceptoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConceptoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ConceptoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConceptoPayload>
          }
          findMany: {
            args: Prisma.ConceptoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConceptoPayload>[]
          }
          create: {
            args: Prisma.ConceptoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConceptoPayload>
          }
          createMany: {
            args: Prisma.ConceptoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ConceptoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConceptoPayload>[]
          }
          delete: {
            args: Prisma.ConceptoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConceptoPayload>
          }
          update: {
            args: Prisma.ConceptoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConceptoPayload>
          }
          deleteMany: {
            args: Prisma.ConceptoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ConceptoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ConceptoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConceptoPayload>
          }
          aggregate: {
            args: Prisma.ConceptoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateConcepto>
          }
          groupBy: {
            args: Prisma.ConceptoGroupByArgs<ExtArgs>
            result: $Utils.Optional<ConceptoGroupByOutputType>[]
          }
          count: {
            args: Prisma.ConceptoCountArgs<ExtArgs>
            result: $Utils.Optional<ConceptoCountAggregateOutputType> | number
          }
        }
      }
      ConceptoInsumo: {
        payload: Prisma.$ConceptoInsumoPayload<ExtArgs>
        fields: Prisma.ConceptoInsumoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ConceptoInsumoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConceptoInsumoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ConceptoInsumoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConceptoInsumoPayload>
          }
          findFirst: {
            args: Prisma.ConceptoInsumoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConceptoInsumoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ConceptoInsumoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConceptoInsumoPayload>
          }
          findMany: {
            args: Prisma.ConceptoInsumoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConceptoInsumoPayload>[]
          }
          create: {
            args: Prisma.ConceptoInsumoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConceptoInsumoPayload>
          }
          createMany: {
            args: Prisma.ConceptoInsumoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ConceptoInsumoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConceptoInsumoPayload>[]
          }
          delete: {
            args: Prisma.ConceptoInsumoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConceptoInsumoPayload>
          }
          update: {
            args: Prisma.ConceptoInsumoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConceptoInsumoPayload>
          }
          deleteMany: {
            args: Prisma.ConceptoInsumoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ConceptoInsumoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ConceptoInsumoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConceptoInsumoPayload>
          }
          aggregate: {
            args: Prisma.ConceptoInsumoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateConceptoInsumo>
          }
          groupBy: {
            args: Prisma.ConceptoInsumoGroupByArgs<ExtArgs>
            result: $Utils.Optional<ConceptoInsumoGroupByOutputType>[]
          }
          count: {
            args: Prisma.ConceptoInsumoCountArgs<ExtArgs>
            result: $Utils.Optional<ConceptoInsumoCountAggregateOutputType> | number
          }
        }
      }
      SaldoPartida: {
        payload: Prisma.$SaldoPartidaPayload<ExtArgs>
        fields: Prisma.SaldoPartidaFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SaldoPartidaFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SaldoPartidaPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SaldoPartidaFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SaldoPartidaPayload>
          }
          findFirst: {
            args: Prisma.SaldoPartidaFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SaldoPartidaPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SaldoPartidaFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SaldoPartidaPayload>
          }
          findMany: {
            args: Prisma.SaldoPartidaFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SaldoPartidaPayload>[]
          }
          create: {
            args: Prisma.SaldoPartidaCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SaldoPartidaPayload>
          }
          createMany: {
            args: Prisma.SaldoPartidaCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SaldoPartidaCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SaldoPartidaPayload>[]
          }
          delete: {
            args: Prisma.SaldoPartidaDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SaldoPartidaPayload>
          }
          update: {
            args: Prisma.SaldoPartidaUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SaldoPartidaPayload>
          }
          deleteMany: {
            args: Prisma.SaldoPartidaDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SaldoPartidaUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.SaldoPartidaUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SaldoPartidaPayload>
          }
          aggregate: {
            args: Prisma.SaldoPartidaAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSaldoPartida>
          }
          groupBy: {
            args: Prisma.SaldoPartidaGroupByArgs<ExtArgs>
            result: $Utils.Optional<SaldoPartidaGroupByOutputType>[]
          }
          count: {
            args: Prisma.SaldoPartidaCountArgs<ExtArgs>
            result: $Utils.Optional<SaldoPartidaCountAggregateOutputType> | number
          }
        }
      }
      SaldoMovimiento: {
        payload: Prisma.$SaldoMovimientoPayload<ExtArgs>
        fields: Prisma.SaldoMovimientoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SaldoMovimientoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SaldoMovimientoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SaldoMovimientoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SaldoMovimientoPayload>
          }
          findFirst: {
            args: Prisma.SaldoMovimientoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SaldoMovimientoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SaldoMovimientoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SaldoMovimientoPayload>
          }
          findMany: {
            args: Prisma.SaldoMovimientoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SaldoMovimientoPayload>[]
          }
          create: {
            args: Prisma.SaldoMovimientoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SaldoMovimientoPayload>
          }
          createMany: {
            args: Prisma.SaldoMovimientoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SaldoMovimientoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SaldoMovimientoPayload>[]
          }
          delete: {
            args: Prisma.SaldoMovimientoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SaldoMovimientoPayload>
          }
          update: {
            args: Prisma.SaldoMovimientoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SaldoMovimientoPayload>
          }
          deleteMany: {
            args: Prisma.SaldoMovimientoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SaldoMovimientoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.SaldoMovimientoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SaldoMovimientoPayload>
          }
          aggregate: {
            args: Prisma.SaldoMovimientoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSaldoMovimiento>
          }
          groupBy: {
            args: Prisma.SaldoMovimientoGroupByArgs<ExtArgs>
            result: $Utils.Optional<SaldoMovimientoGroupByOutputType>[]
          }
          count: {
            args: Prisma.SaldoMovimientoCountArgs<ExtArgs>
            result: $Utils.Optional<SaldoMovimientoCountAggregateOutputType> | number
          }
        }
      }
      FichaTecnicaInsumo: {
        payload: Prisma.$FichaTecnicaInsumoPayload<ExtArgs>
        fields: Prisma.FichaTecnicaInsumoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FichaTecnicaInsumoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FichaTecnicaInsumoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FichaTecnicaInsumoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FichaTecnicaInsumoPayload>
          }
          findFirst: {
            args: Prisma.FichaTecnicaInsumoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FichaTecnicaInsumoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FichaTecnicaInsumoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FichaTecnicaInsumoPayload>
          }
          findMany: {
            args: Prisma.FichaTecnicaInsumoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FichaTecnicaInsumoPayload>[]
          }
          create: {
            args: Prisma.FichaTecnicaInsumoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FichaTecnicaInsumoPayload>
          }
          createMany: {
            args: Prisma.FichaTecnicaInsumoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FichaTecnicaInsumoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FichaTecnicaInsumoPayload>[]
          }
          delete: {
            args: Prisma.FichaTecnicaInsumoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FichaTecnicaInsumoPayload>
          }
          update: {
            args: Prisma.FichaTecnicaInsumoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FichaTecnicaInsumoPayload>
          }
          deleteMany: {
            args: Prisma.FichaTecnicaInsumoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FichaTecnicaInsumoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.FichaTecnicaInsumoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FichaTecnicaInsumoPayload>
          }
          aggregate: {
            args: Prisma.FichaTecnicaInsumoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFichaTecnicaInsumo>
          }
          groupBy: {
            args: Prisma.FichaTecnicaInsumoGroupByArgs<ExtArgs>
            result: $Utils.Optional<FichaTecnicaInsumoGroupByOutputType>[]
          }
          count: {
            args: Prisma.FichaTecnicaInsumoCountArgs<ExtArgs>
            result: $Utils.Optional<FichaTecnicaInsumoCountAggregateOutputType> | number
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
   * Count Type CategoriaGastoCountOutputType
   */

  export type CategoriaGastoCountOutputType = {
    insumos: number
  }

  export type CategoriaGastoCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    insumos?: boolean | CategoriaGastoCountOutputTypeCountInsumosArgs
  }

  // Custom InputTypes
  /**
   * CategoriaGastoCountOutputType without action
   */
  export type CategoriaGastoCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CategoriaGastoCountOutputType
     */
    select?: CategoriaGastoCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CategoriaGastoCountOutputType without action
   */
  export type CategoriaGastoCountOutputTypeCountInsumosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InsumoWhereInput
  }


  /**
   * Count Type InsumoCountOutputType
   */

  export type InsumoCountOutputType = {
    concepto_insumos: number
  }

  export type InsumoCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    concepto_insumos?: boolean | InsumoCountOutputTypeCountConcepto_insumosArgs
  }

  // Custom InputTypes
  /**
   * InsumoCountOutputType without action
   */
  export type InsumoCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InsumoCountOutputType
     */
    select?: InsumoCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * InsumoCountOutputType without action
   */
  export type InsumoCountOutputTypeCountConcepto_insumosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ConceptoInsumoWhereInput
  }


  /**
   * Count Type PresupuestoBaseCountOutputType
   */

  export type PresupuestoBaseCountOutputType = {
    conceptos: number
  }

  export type PresupuestoBaseCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    conceptos?: boolean | PresupuestoBaseCountOutputTypeCountConceptosArgs
  }

  // Custom InputTypes
  /**
   * PresupuestoBaseCountOutputType without action
   */
  export type PresupuestoBaseCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PresupuestoBaseCountOutputType
     */
    select?: PresupuestoBaseCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * PresupuestoBaseCountOutputType without action
   */
  export type PresupuestoBaseCountOutputTypeCountConceptosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ConceptoWhereInput
  }


  /**
   * Count Type ConceptoCountOutputType
   */

  export type ConceptoCountOutputType = {
    insumos: number
  }

  export type ConceptoCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    insumos?: boolean | ConceptoCountOutputTypeCountInsumosArgs
  }

  // Custom InputTypes
  /**
   * ConceptoCountOutputType without action
   */
  export type ConceptoCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConceptoCountOutputType
     */
    select?: ConceptoCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ConceptoCountOutputType without action
   */
  export type ConceptoCountOutputTypeCountInsumosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ConceptoInsumoWhereInput
  }


  /**
   * Count Type SaldoPartidaCountOutputType
   */

  export type SaldoPartidaCountOutputType = {
    movimientos: number
  }

  export type SaldoPartidaCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    movimientos?: boolean | SaldoPartidaCountOutputTypeCountMovimientosArgs
  }

  // Custom InputTypes
  /**
   * SaldoPartidaCountOutputType without action
   */
  export type SaldoPartidaCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SaldoPartidaCountOutputType
     */
    select?: SaldoPartidaCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * SaldoPartidaCountOutputType without action
   */
  export type SaldoPartidaCountOutputTypeCountMovimientosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SaldoMovimientoWhereInput
  }


  /**
   * Models
   */

  /**
   * Model CategoriaGasto
   */

  export type AggregateCategoriaGasto = {
    _count: CategoriaGastoCountAggregateOutputType | null
    _min: CategoriaGastoMinAggregateOutputType | null
    _max: CategoriaGastoMaxAggregateOutputType | null
  }

  export type CategoriaGastoMinAggregateOutputType = {
    id_categoria: string | null
    tenant_id: string | null
    proyecto_id: string | null
    nombre: string | null
    es_predefinida: boolean | null
    activa: boolean | null
    created_at: Date | null
  }

  export type CategoriaGastoMaxAggregateOutputType = {
    id_categoria: string | null
    tenant_id: string | null
    proyecto_id: string | null
    nombre: string | null
    es_predefinida: boolean | null
    activa: boolean | null
    created_at: Date | null
  }

  export type CategoriaGastoCountAggregateOutputType = {
    id_categoria: number
    tenant_id: number
    proyecto_id: number
    nombre: number
    es_predefinida: number
    activa: number
    created_at: number
    _all: number
  }


  export type CategoriaGastoMinAggregateInputType = {
    id_categoria?: true
    tenant_id?: true
    proyecto_id?: true
    nombre?: true
    es_predefinida?: true
    activa?: true
    created_at?: true
  }

  export type CategoriaGastoMaxAggregateInputType = {
    id_categoria?: true
    tenant_id?: true
    proyecto_id?: true
    nombre?: true
    es_predefinida?: true
    activa?: true
    created_at?: true
  }

  export type CategoriaGastoCountAggregateInputType = {
    id_categoria?: true
    tenant_id?: true
    proyecto_id?: true
    nombre?: true
    es_predefinida?: true
    activa?: true
    created_at?: true
    _all?: true
  }

  export type CategoriaGastoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CategoriaGasto to aggregate.
     */
    where?: CategoriaGastoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CategoriaGastos to fetch.
     */
    orderBy?: CategoriaGastoOrderByWithRelationInput | CategoriaGastoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CategoriaGastoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CategoriaGastos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CategoriaGastos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CategoriaGastos
    **/
    _count?: true | CategoriaGastoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CategoriaGastoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CategoriaGastoMaxAggregateInputType
  }

  export type GetCategoriaGastoAggregateType<T extends CategoriaGastoAggregateArgs> = {
        [P in keyof T & keyof AggregateCategoriaGasto]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCategoriaGasto[P]>
      : GetScalarType<T[P], AggregateCategoriaGasto[P]>
  }




  export type CategoriaGastoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CategoriaGastoWhereInput
    orderBy?: CategoriaGastoOrderByWithAggregationInput | CategoriaGastoOrderByWithAggregationInput[]
    by: CategoriaGastoScalarFieldEnum[] | CategoriaGastoScalarFieldEnum
    having?: CategoriaGastoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CategoriaGastoCountAggregateInputType | true
    _min?: CategoriaGastoMinAggregateInputType
    _max?: CategoriaGastoMaxAggregateInputType
  }

  export type CategoriaGastoGroupByOutputType = {
    id_categoria: string
    tenant_id: string
    proyecto_id: string
    nombre: string
    es_predefinida: boolean
    activa: boolean
    created_at: Date
    _count: CategoriaGastoCountAggregateOutputType | null
    _min: CategoriaGastoMinAggregateOutputType | null
    _max: CategoriaGastoMaxAggregateOutputType | null
  }

  type GetCategoriaGastoGroupByPayload<T extends CategoriaGastoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CategoriaGastoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CategoriaGastoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CategoriaGastoGroupByOutputType[P]>
            : GetScalarType<T[P], CategoriaGastoGroupByOutputType[P]>
        }
      >
    >


  export type CategoriaGastoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_categoria?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    nombre?: boolean
    es_predefinida?: boolean
    activa?: boolean
    created_at?: boolean
    insumos?: boolean | CategoriaGasto$insumosArgs<ExtArgs>
    _count?: boolean | CategoriaGastoCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["categoriaGasto"]>

  export type CategoriaGastoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_categoria?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    nombre?: boolean
    es_predefinida?: boolean
    activa?: boolean
    created_at?: boolean
  }, ExtArgs["result"]["categoriaGasto"]>

  export type CategoriaGastoSelectScalar = {
    id_categoria?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    nombre?: boolean
    es_predefinida?: boolean
    activa?: boolean
    created_at?: boolean
  }

  export type CategoriaGastoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    insumos?: boolean | CategoriaGasto$insumosArgs<ExtArgs>
    _count?: boolean | CategoriaGastoCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CategoriaGastoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $CategoriaGastoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CategoriaGasto"
    objects: {
      insumos: Prisma.$InsumoPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id_categoria: string
      tenant_id: string
      proyecto_id: string
      nombre: string
      es_predefinida: boolean
      activa: boolean
      created_at: Date
    }, ExtArgs["result"]["categoriaGasto"]>
    composites: {}
  }

  type CategoriaGastoGetPayload<S extends boolean | null | undefined | CategoriaGastoDefaultArgs> = $Result.GetResult<Prisma.$CategoriaGastoPayload, S>

  type CategoriaGastoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CategoriaGastoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CategoriaGastoCountAggregateInputType | true
    }

  export interface CategoriaGastoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CategoriaGasto'], meta: { name: 'CategoriaGasto' } }
    /**
     * Find zero or one CategoriaGasto that matches the filter.
     * @param {CategoriaGastoFindUniqueArgs} args - Arguments to find a CategoriaGasto
     * @example
     * // Get one CategoriaGasto
     * const categoriaGasto = await prisma.categoriaGasto.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CategoriaGastoFindUniqueArgs>(args: SelectSubset<T, CategoriaGastoFindUniqueArgs<ExtArgs>>): Prisma__CategoriaGastoClient<$Result.GetResult<Prisma.$CategoriaGastoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one CategoriaGasto that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CategoriaGastoFindUniqueOrThrowArgs} args - Arguments to find a CategoriaGasto
     * @example
     * // Get one CategoriaGasto
     * const categoriaGasto = await prisma.categoriaGasto.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CategoriaGastoFindUniqueOrThrowArgs>(args: SelectSubset<T, CategoriaGastoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CategoriaGastoClient<$Result.GetResult<Prisma.$CategoriaGastoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first CategoriaGasto that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoriaGastoFindFirstArgs} args - Arguments to find a CategoriaGasto
     * @example
     * // Get one CategoriaGasto
     * const categoriaGasto = await prisma.categoriaGasto.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CategoriaGastoFindFirstArgs>(args?: SelectSubset<T, CategoriaGastoFindFirstArgs<ExtArgs>>): Prisma__CategoriaGastoClient<$Result.GetResult<Prisma.$CategoriaGastoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first CategoriaGasto that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoriaGastoFindFirstOrThrowArgs} args - Arguments to find a CategoriaGasto
     * @example
     * // Get one CategoriaGasto
     * const categoriaGasto = await prisma.categoriaGasto.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CategoriaGastoFindFirstOrThrowArgs>(args?: SelectSubset<T, CategoriaGastoFindFirstOrThrowArgs<ExtArgs>>): Prisma__CategoriaGastoClient<$Result.GetResult<Prisma.$CategoriaGastoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more CategoriaGastos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoriaGastoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CategoriaGastos
     * const categoriaGastos = await prisma.categoriaGasto.findMany()
     * 
     * // Get first 10 CategoriaGastos
     * const categoriaGastos = await prisma.categoriaGasto.findMany({ take: 10 })
     * 
     * // Only select the `id_categoria`
     * const categoriaGastoWithId_categoriaOnly = await prisma.categoriaGasto.findMany({ select: { id_categoria: true } })
     * 
     */
    findMany<T extends CategoriaGastoFindManyArgs>(args?: SelectSubset<T, CategoriaGastoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CategoriaGastoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a CategoriaGasto.
     * @param {CategoriaGastoCreateArgs} args - Arguments to create a CategoriaGasto.
     * @example
     * // Create one CategoriaGasto
     * const CategoriaGasto = await prisma.categoriaGasto.create({
     *   data: {
     *     // ... data to create a CategoriaGasto
     *   }
     * })
     * 
     */
    create<T extends CategoriaGastoCreateArgs>(args: SelectSubset<T, CategoriaGastoCreateArgs<ExtArgs>>): Prisma__CategoriaGastoClient<$Result.GetResult<Prisma.$CategoriaGastoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many CategoriaGastos.
     * @param {CategoriaGastoCreateManyArgs} args - Arguments to create many CategoriaGastos.
     * @example
     * // Create many CategoriaGastos
     * const categoriaGasto = await prisma.categoriaGasto.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CategoriaGastoCreateManyArgs>(args?: SelectSubset<T, CategoriaGastoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CategoriaGastos and returns the data saved in the database.
     * @param {CategoriaGastoCreateManyAndReturnArgs} args - Arguments to create many CategoriaGastos.
     * @example
     * // Create many CategoriaGastos
     * const categoriaGasto = await prisma.categoriaGasto.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CategoriaGastos and only return the `id_categoria`
     * const categoriaGastoWithId_categoriaOnly = await prisma.categoriaGasto.createManyAndReturn({ 
     *   select: { id_categoria: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CategoriaGastoCreateManyAndReturnArgs>(args?: SelectSubset<T, CategoriaGastoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CategoriaGastoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a CategoriaGasto.
     * @param {CategoriaGastoDeleteArgs} args - Arguments to delete one CategoriaGasto.
     * @example
     * // Delete one CategoriaGasto
     * const CategoriaGasto = await prisma.categoriaGasto.delete({
     *   where: {
     *     // ... filter to delete one CategoriaGasto
     *   }
     * })
     * 
     */
    delete<T extends CategoriaGastoDeleteArgs>(args: SelectSubset<T, CategoriaGastoDeleteArgs<ExtArgs>>): Prisma__CategoriaGastoClient<$Result.GetResult<Prisma.$CategoriaGastoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one CategoriaGasto.
     * @param {CategoriaGastoUpdateArgs} args - Arguments to update one CategoriaGasto.
     * @example
     * // Update one CategoriaGasto
     * const categoriaGasto = await prisma.categoriaGasto.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CategoriaGastoUpdateArgs>(args: SelectSubset<T, CategoriaGastoUpdateArgs<ExtArgs>>): Prisma__CategoriaGastoClient<$Result.GetResult<Prisma.$CategoriaGastoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more CategoriaGastos.
     * @param {CategoriaGastoDeleteManyArgs} args - Arguments to filter CategoriaGastos to delete.
     * @example
     * // Delete a few CategoriaGastos
     * const { count } = await prisma.categoriaGasto.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CategoriaGastoDeleteManyArgs>(args?: SelectSubset<T, CategoriaGastoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CategoriaGastos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoriaGastoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CategoriaGastos
     * const categoriaGasto = await prisma.categoriaGasto.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CategoriaGastoUpdateManyArgs>(args: SelectSubset<T, CategoriaGastoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one CategoriaGasto.
     * @param {CategoriaGastoUpsertArgs} args - Arguments to update or create a CategoriaGasto.
     * @example
     * // Update or create a CategoriaGasto
     * const categoriaGasto = await prisma.categoriaGasto.upsert({
     *   create: {
     *     // ... data to create a CategoriaGasto
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CategoriaGasto we want to update
     *   }
     * })
     */
    upsert<T extends CategoriaGastoUpsertArgs>(args: SelectSubset<T, CategoriaGastoUpsertArgs<ExtArgs>>): Prisma__CategoriaGastoClient<$Result.GetResult<Prisma.$CategoriaGastoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of CategoriaGastos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoriaGastoCountArgs} args - Arguments to filter CategoriaGastos to count.
     * @example
     * // Count the number of CategoriaGastos
     * const count = await prisma.categoriaGasto.count({
     *   where: {
     *     // ... the filter for the CategoriaGastos we want to count
     *   }
     * })
    **/
    count<T extends CategoriaGastoCountArgs>(
      args?: Subset<T, CategoriaGastoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CategoriaGastoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CategoriaGasto.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoriaGastoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends CategoriaGastoAggregateArgs>(args: Subset<T, CategoriaGastoAggregateArgs>): Prisma.PrismaPromise<GetCategoriaGastoAggregateType<T>>

    /**
     * Group by CategoriaGasto.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoriaGastoGroupByArgs} args - Group by arguments.
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
      T extends CategoriaGastoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CategoriaGastoGroupByArgs['orderBy'] }
        : { orderBy?: CategoriaGastoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, CategoriaGastoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCategoriaGastoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CategoriaGasto model
   */
  readonly fields: CategoriaGastoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CategoriaGasto.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CategoriaGastoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    insumos<T extends CategoriaGasto$insumosArgs<ExtArgs> = {}>(args?: Subset<T, CategoriaGasto$insumosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InsumoPayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the CategoriaGasto model
   */ 
  interface CategoriaGastoFieldRefs {
    readonly id_categoria: FieldRef<"CategoriaGasto", 'String'>
    readonly tenant_id: FieldRef<"CategoriaGasto", 'String'>
    readonly proyecto_id: FieldRef<"CategoriaGasto", 'String'>
    readonly nombre: FieldRef<"CategoriaGasto", 'String'>
    readonly es_predefinida: FieldRef<"CategoriaGasto", 'Boolean'>
    readonly activa: FieldRef<"CategoriaGasto", 'Boolean'>
    readonly created_at: FieldRef<"CategoriaGasto", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CategoriaGasto findUnique
   */
  export type CategoriaGastoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CategoriaGasto
     */
    select?: CategoriaGastoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoriaGastoInclude<ExtArgs> | null
    /**
     * Filter, which CategoriaGasto to fetch.
     */
    where: CategoriaGastoWhereUniqueInput
  }

  /**
   * CategoriaGasto findUniqueOrThrow
   */
  export type CategoriaGastoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CategoriaGasto
     */
    select?: CategoriaGastoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoriaGastoInclude<ExtArgs> | null
    /**
     * Filter, which CategoriaGasto to fetch.
     */
    where: CategoriaGastoWhereUniqueInput
  }

  /**
   * CategoriaGasto findFirst
   */
  export type CategoriaGastoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CategoriaGasto
     */
    select?: CategoriaGastoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoriaGastoInclude<ExtArgs> | null
    /**
     * Filter, which CategoriaGasto to fetch.
     */
    where?: CategoriaGastoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CategoriaGastos to fetch.
     */
    orderBy?: CategoriaGastoOrderByWithRelationInput | CategoriaGastoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CategoriaGastos.
     */
    cursor?: CategoriaGastoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CategoriaGastos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CategoriaGastos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CategoriaGastos.
     */
    distinct?: CategoriaGastoScalarFieldEnum | CategoriaGastoScalarFieldEnum[]
  }

  /**
   * CategoriaGasto findFirstOrThrow
   */
  export type CategoriaGastoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CategoriaGasto
     */
    select?: CategoriaGastoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoriaGastoInclude<ExtArgs> | null
    /**
     * Filter, which CategoriaGasto to fetch.
     */
    where?: CategoriaGastoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CategoriaGastos to fetch.
     */
    orderBy?: CategoriaGastoOrderByWithRelationInput | CategoriaGastoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CategoriaGastos.
     */
    cursor?: CategoriaGastoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CategoriaGastos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CategoriaGastos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CategoriaGastos.
     */
    distinct?: CategoriaGastoScalarFieldEnum | CategoriaGastoScalarFieldEnum[]
  }

  /**
   * CategoriaGasto findMany
   */
  export type CategoriaGastoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CategoriaGasto
     */
    select?: CategoriaGastoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoriaGastoInclude<ExtArgs> | null
    /**
     * Filter, which CategoriaGastos to fetch.
     */
    where?: CategoriaGastoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CategoriaGastos to fetch.
     */
    orderBy?: CategoriaGastoOrderByWithRelationInput | CategoriaGastoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CategoriaGastos.
     */
    cursor?: CategoriaGastoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CategoriaGastos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CategoriaGastos.
     */
    skip?: number
    distinct?: CategoriaGastoScalarFieldEnum | CategoriaGastoScalarFieldEnum[]
  }

  /**
   * CategoriaGasto create
   */
  export type CategoriaGastoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CategoriaGasto
     */
    select?: CategoriaGastoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoriaGastoInclude<ExtArgs> | null
    /**
     * The data needed to create a CategoriaGasto.
     */
    data: XOR<CategoriaGastoCreateInput, CategoriaGastoUncheckedCreateInput>
  }

  /**
   * CategoriaGasto createMany
   */
  export type CategoriaGastoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CategoriaGastos.
     */
    data: CategoriaGastoCreateManyInput | CategoriaGastoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CategoriaGasto createManyAndReturn
   */
  export type CategoriaGastoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CategoriaGasto
     */
    select?: CategoriaGastoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many CategoriaGastos.
     */
    data: CategoriaGastoCreateManyInput | CategoriaGastoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CategoriaGasto update
   */
  export type CategoriaGastoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CategoriaGasto
     */
    select?: CategoriaGastoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoriaGastoInclude<ExtArgs> | null
    /**
     * The data needed to update a CategoriaGasto.
     */
    data: XOR<CategoriaGastoUpdateInput, CategoriaGastoUncheckedUpdateInput>
    /**
     * Choose, which CategoriaGasto to update.
     */
    where: CategoriaGastoWhereUniqueInput
  }

  /**
   * CategoriaGasto updateMany
   */
  export type CategoriaGastoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CategoriaGastos.
     */
    data: XOR<CategoriaGastoUpdateManyMutationInput, CategoriaGastoUncheckedUpdateManyInput>
    /**
     * Filter which CategoriaGastos to update
     */
    where?: CategoriaGastoWhereInput
  }

  /**
   * CategoriaGasto upsert
   */
  export type CategoriaGastoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CategoriaGasto
     */
    select?: CategoriaGastoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoriaGastoInclude<ExtArgs> | null
    /**
     * The filter to search for the CategoriaGasto to update in case it exists.
     */
    where: CategoriaGastoWhereUniqueInput
    /**
     * In case the CategoriaGasto found by the `where` argument doesn't exist, create a new CategoriaGasto with this data.
     */
    create: XOR<CategoriaGastoCreateInput, CategoriaGastoUncheckedCreateInput>
    /**
     * In case the CategoriaGasto was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CategoriaGastoUpdateInput, CategoriaGastoUncheckedUpdateInput>
  }

  /**
   * CategoriaGasto delete
   */
  export type CategoriaGastoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CategoriaGasto
     */
    select?: CategoriaGastoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoriaGastoInclude<ExtArgs> | null
    /**
     * Filter which CategoriaGasto to delete.
     */
    where: CategoriaGastoWhereUniqueInput
  }

  /**
   * CategoriaGasto deleteMany
   */
  export type CategoriaGastoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CategoriaGastos to delete
     */
    where?: CategoriaGastoWhereInput
  }

  /**
   * CategoriaGasto.insumos
   */
  export type CategoriaGasto$insumosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Insumo
     */
    select?: InsumoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InsumoInclude<ExtArgs> | null
    where?: InsumoWhereInput
    orderBy?: InsumoOrderByWithRelationInput | InsumoOrderByWithRelationInput[]
    cursor?: InsumoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: InsumoScalarFieldEnum | InsumoScalarFieldEnum[]
  }

  /**
   * CategoriaGasto without action
   */
  export type CategoriaGastoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CategoriaGasto
     */
    select?: CategoriaGastoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoriaGastoInclude<ExtArgs> | null
  }


  /**
   * Model ProyectoCostosConfig
   */

  export type AggregateProyectoCostosConfig = {
    _count: ProyectoCostosConfigCountAggregateOutputType | null
    _min: ProyectoCostosConfigMinAggregateOutputType | null
    _max: ProyectoCostosConfigMaxAggregateOutputType | null
  }

  export type ProyectoCostosConfigMinAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    proyecto_id: string | null
    estado: string | null
    activado_por: string | null
    fecha_activacion: Date | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type ProyectoCostosConfigMaxAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    proyecto_id: string | null
    estado: string | null
    activado_por: string | null
    fecha_activacion: Date | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type ProyectoCostosConfigCountAggregateOutputType = {
    id: number
    tenant_id: number
    proyecto_id: number
    estado: number
    activado_por: number
    fecha_activacion: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type ProyectoCostosConfigMinAggregateInputType = {
    id?: true
    tenant_id?: true
    proyecto_id?: true
    estado?: true
    activado_por?: true
    fecha_activacion?: true
    created_at?: true
    updated_at?: true
  }

  export type ProyectoCostosConfigMaxAggregateInputType = {
    id?: true
    tenant_id?: true
    proyecto_id?: true
    estado?: true
    activado_por?: true
    fecha_activacion?: true
    created_at?: true
    updated_at?: true
  }

  export type ProyectoCostosConfigCountAggregateInputType = {
    id?: true
    tenant_id?: true
    proyecto_id?: true
    estado?: true
    activado_por?: true
    fecha_activacion?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type ProyectoCostosConfigAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProyectoCostosConfig to aggregate.
     */
    where?: ProyectoCostosConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProyectoCostosConfigs to fetch.
     */
    orderBy?: ProyectoCostosConfigOrderByWithRelationInput | ProyectoCostosConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProyectoCostosConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProyectoCostosConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProyectoCostosConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ProyectoCostosConfigs
    **/
    _count?: true | ProyectoCostosConfigCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProyectoCostosConfigMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProyectoCostosConfigMaxAggregateInputType
  }

  export type GetProyectoCostosConfigAggregateType<T extends ProyectoCostosConfigAggregateArgs> = {
        [P in keyof T & keyof AggregateProyectoCostosConfig]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProyectoCostosConfig[P]>
      : GetScalarType<T[P], AggregateProyectoCostosConfig[P]>
  }




  export type ProyectoCostosConfigGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProyectoCostosConfigWhereInput
    orderBy?: ProyectoCostosConfigOrderByWithAggregationInput | ProyectoCostosConfigOrderByWithAggregationInput[]
    by: ProyectoCostosConfigScalarFieldEnum[] | ProyectoCostosConfigScalarFieldEnum
    having?: ProyectoCostosConfigScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProyectoCostosConfigCountAggregateInputType | true
    _min?: ProyectoCostosConfigMinAggregateInputType
    _max?: ProyectoCostosConfigMaxAggregateInputType
  }

  export type ProyectoCostosConfigGroupByOutputType = {
    id: string
    tenant_id: string
    proyecto_id: string
    estado: string
    activado_por: string | null
    fecha_activacion: Date | null
    created_at: Date
    updated_at: Date
    _count: ProyectoCostosConfigCountAggregateOutputType | null
    _min: ProyectoCostosConfigMinAggregateOutputType | null
    _max: ProyectoCostosConfigMaxAggregateOutputType | null
  }

  type GetProyectoCostosConfigGroupByPayload<T extends ProyectoCostosConfigGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProyectoCostosConfigGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProyectoCostosConfigGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProyectoCostosConfigGroupByOutputType[P]>
            : GetScalarType<T[P], ProyectoCostosConfigGroupByOutputType[P]>
        }
      >
    >


  export type ProyectoCostosConfigSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    estado?: boolean
    activado_por?: boolean
    fecha_activacion?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["proyectoCostosConfig"]>

  export type ProyectoCostosConfigSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    estado?: boolean
    activado_por?: boolean
    fecha_activacion?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["proyectoCostosConfig"]>

  export type ProyectoCostosConfigSelectScalar = {
    id?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    estado?: boolean
    activado_por?: boolean
    fecha_activacion?: boolean
    created_at?: boolean
    updated_at?: boolean
  }


  export type $ProyectoCostosConfigPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ProyectoCostosConfig"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenant_id: string
      proyecto_id: string
      estado: string
      activado_por: string | null
      fecha_activacion: Date | null
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["proyectoCostosConfig"]>
    composites: {}
  }

  type ProyectoCostosConfigGetPayload<S extends boolean | null | undefined | ProyectoCostosConfigDefaultArgs> = $Result.GetResult<Prisma.$ProyectoCostosConfigPayload, S>

  type ProyectoCostosConfigCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ProyectoCostosConfigFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ProyectoCostosConfigCountAggregateInputType | true
    }

  export interface ProyectoCostosConfigDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ProyectoCostosConfig'], meta: { name: 'ProyectoCostosConfig' } }
    /**
     * Find zero or one ProyectoCostosConfig that matches the filter.
     * @param {ProyectoCostosConfigFindUniqueArgs} args - Arguments to find a ProyectoCostosConfig
     * @example
     * // Get one ProyectoCostosConfig
     * const proyectoCostosConfig = await prisma.proyectoCostosConfig.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProyectoCostosConfigFindUniqueArgs>(args: SelectSubset<T, ProyectoCostosConfigFindUniqueArgs<ExtArgs>>): Prisma__ProyectoCostosConfigClient<$Result.GetResult<Prisma.$ProyectoCostosConfigPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ProyectoCostosConfig that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ProyectoCostosConfigFindUniqueOrThrowArgs} args - Arguments to find a ProyectoCostosConfig
     * @example
     * // Get one ProyectoCostosConfig
     * const proyectoCostosConfig = await prisma.proyectoCostosConfig.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProyectoCostosConfigFindUniqueOrThrowArgs>(args: SelectSubset<T, ProyectoCostosConfigFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProyectoCostosConfigClient<$Result.GetResult<Prisma.$ProyectoCostosConfigPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ProyectoCostosConfig that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProyectoCostosConfigFindFirstArgs} args - Arguments to find a ProyectoCostosConfig
     * @example
     * // Get one ProyectoCostosConfig
     * const proyectoCostosConfig = await prisma.proyectoCostosConfig.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProyectoCostosConfigFindFirstArgs>(args?: SelectSubset<T, ProyectoCostosConfigFindFirstArgs<ExtArgs>>): Prisma__ProyectoCostosConfigClient<$Result.GetResult<Prisma.$ProyectoCostosConfigPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ProyectoCostosConfig that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProyectoCostosConfigFindFirstOrThrowArgs} args - Arguments to find a ProyectoCostosConfig
     * @example
     * // Get one ProyectoCostosConfig
     * const proyectoCostosConfig = await prisma.proyectoCostosConfig.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProyectoCostosConfigFindFirstOrThrowArgs>(args?: SelectSubset<T, ProyectoCostosConfigFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProyectoCostosConfigClient<$Result.GetResult<Prisma.$ProyectoCostosConfigPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ProyectoCostosConfigs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProyectoCostosConfigFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ProyectoCostosConfigs
     * const proyectoCostosConfigs = await prisma.proyectoCostosConfig.findMany()
     * 
     * // Get first 10 ProyectoCostosConfigs
     * const proyectoCostosConfigs = await prisma.proyectoCostosConfig.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const proyectoCostosConfigWithIdOnly = await prisma.proyectoCostosConfig.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProyectoCostosConfigFindManyArgs>(args?: SelectSubset<T, ProyectoCostosConfigFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProyectoCostosConfigPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ProyectoCostosConfig.
     * @param {ProyectoCostosConfigCreateArgs} args - Arguments to create a ProyectoCostosConfig.
     * @example
     * // Create one ProyectoCostosConfig
     * const ProyectoCostosConfig = await prisma.proyectoCostosConfig.create({
     *   data: {
     *     // ... data to create a ProyectoCostosConfig
     *   }
     * })
     * 
     */
    create<T extends ProyectoCostosConfigCreateArgs>(args: SelectSubset<T, ProyectoCostosConfigCreateArgs<ExtArgs>>): Prisma__ProyectoCostosConfigClient<$Result.GetResult<Prisma.$ProyectoCostosConfigPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ProyectoCostosConfigs.
     * @param {ProyectoCostosConfigCreateManyArgs} args - Arguments to create many ProyectoCostosConfigs.
     * @example
     * // Create many ProyectoCostosConfigs
     * const proyectoCostosConfig = await prisma.proyectoCostosConfig.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProyectoCostosConfigCreateManyArgs>(args?: SelectSubset<T, ProyectoCostosConfigCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ProyectoCostosConfigs and returns the data saved in the database.
     * @param {ProyectoCostosConfigCreateManyAndReturnArgs} args - Arguments to create many ProyectoCostosConfigs.
     * @example
     * // Create many ProyectoCostosConfigs
     * const proyectoCostosConfig = await prisma.proyectoCostosConfig.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ProyectoCostosConfigs and only return the `id`
     * const proyectoCostosConfigWithIdOnly = await prisma.proyectoCostosConfig.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProyectoCostosConfigCreateManyAndReturnArgs>(args?: SelectSubset<T, ProyectoCostosConfigCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProyectoCostosConfigPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ProyectoCostosConfig.
     * @param {ProyectoCostosConfigDeleteArgs} args - Arguments to delete one ProyectoCostosConfig.
     * @example
     * // Delete one ProyectoCostosConfig
     * const ProyectoCostosConfig = await prisma.proyectoCostosConfig.delete({
     *   where: {
     *     // ... filter to delete one ProyectoCostosConfig
     *   }
     * })
     * 
     */
    delete<T extends ProyectoCostosConfigDeleteArgs>(args: SelectSubset<T, ProyectoCostosConfigDeleteArgs<ExtArgs>>): Prisma__ProyectoCostosConfigClient<$Result.GetResult<Prisma.$ProyectoCostosConfigPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ProyectoCostosConfig.
     * @param {ProyectoCostosConfigUpdateArgs} args - Arguments to update one ProyectoCostosConfig.
     * @example
     * // Update one ProyectoCostosConfig
     * const proyectoCostosConfig = await prisma.proyectoCostosConfig.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProyectoCostosConfigUpdateArgs>(args: SelectSubset<T, ProyectoCostosConfigUpdateArgs<ExtArgs>>): Prisma__ProyectoCostosConfigClient<$Result.GetResult<Prisma.$ProyectoCostosConfigPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ProyectoCostosConfigs.
     * @param {ProyectoCostosConfigDeleteManyArgs} args - Arguments to filter ProyectoCostosConfigs to delete.
     * @example
     * // Delete a few ProyectoCostosConfigs
     * const { count } = await prisma.proyectoCostosConfig.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProyectoCostosConfigDeleteManyArgs>(args?: SelectSubset<T, ProyectoCostosConfigDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ProyectoCostosConfigs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProyectoCostosConfigUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ProyectoCostosConfigs
     * const proyectoCostosConfig = await prisma.proyectoCostosConfig.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProyectoCostosConfigUpdateManyArgs>(args: SelectSubset<T, ProyectoCostosConfigUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ProyectoCostosConfig.
     * @param {ProyectoCostosConfigUpsertArgs} args - Arguments to update or create a ProyectoCostosConfig.
     * @example
     * // Update or create a ProyectoCostosConfig
     * const proyectoCostosConfig = await prisma.proyectoCostosConfig.upsert({
     *   create: {
     *     // ... data to create a ProyectoCostosConfig
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ProyectoCostosConfig we want to update
     *   }
     * })
     */
    upsert<T extends ProyectoCostosConfigUpsertArgs>(args: SelectSubset<T, ProyectoCostosConfigUpsertArgs<ExtArgs>>): Prisma__ProyectoCostosConfigClient<$Result.GetResult<Prisma.$ProyectoCostosConfigPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ProyectoCostosConfigs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProyectoCostosConfigCountArgs} args - Arguments to filter ProyectoCostosConfigs to count.
     * @example
     * // Count the number of ProyectoCostosConfigs
     * const count = await prisma.proyectoCostosConfig.count({
     *   where: {
     *     // ... the filter for the ProyectoCostosConfigs we want to count
     *   }
     * })
    **/
    count<T extends ProyectoCostosConfigCountArgs>(
      args?: Subset<T, ProyectoCostosConfigCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProyectoCostosConfigCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ProyectoCostosConfig.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProyectoCostosConfigAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ProyectoCostosConfigAggregateArgs>(args: Subset<T, ProyectoCostosConfigAggregateArgs>): Prisma.PrismaPromise<GetProyectoCostosConfigAggregateType<T>>

    /**
     * Group by ProyectoCostosConfig.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProyectoCostosConfigGroupByArgs} args - Group by arguments.
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
      T extends ProyectoCostosConfigGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProyectoCostosConfigGroupByArgs['orderBy'] }
        : { orderBy?: ProyectoCostosConfigGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ProyectoCostosConfigGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProyectoCostosConfigGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ProyectoCostosConfig model
   */
  readonly fields: ProyectoCostosConfigFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ProyectoCostosConfig.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProyectoCostosConfigClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the ProyectoCostosConfig model
   */ 
  interface ProyectoCostosConfigFieldRefs {
    readonly id: FieldRef<"ProyectoCostosConfig", 'String'>
    readonly tenant_id: FieldRef<"ProyectoCostosConfig", 'String'>
    readonly proyecto_id: FieldRef<"ProyectoCostosConfig", 'String'>
    readonly estado: FieldRef<"ProyectoCostosConfig", 'String'>
    readonly activado_por: FieldRef<"ProyectoCostosConfig", 'String'>
    readonly fecha_activacion: FieldRef<"ProyectoCostosConfig", 'DateTime'>
    readonly created_at: FieldRef<"ProyectoCostosConfig", 'DateTime'>
    readonly updated_at: FieldRef<"ProyectoCostosConfig", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ProyectoCostosConfig findUnique
   */
  export type ProyectoCostosConfigFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProyectoCostosConfig
     */
    select?: ProyectoCostosConfigSelect<ExtArgs> | null
    /**
     * Filter, which ProyectoCostosConfig to fetch.
     */
    where: ProyectoCostosConfigWhereUniqueInput
  }

  /**
   * ProyectoCostosConfig findUniqueOrThrow
   */
  export type ProyectoCostosConfigFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProyectoCostosConfig
     */
    select?: ProyectoCostosConfigSelect<ExtArgs> | null
    /**
     * Filter, which ProyectoCostosConfig to fetch.
     */
    where: ProyectoCostosConfigWhereUniqueInput
  }

  /**
   * ProyectoCostosConfig findFirst
   */
  export type ProyectoCostosConfigFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProyectoCostosConfig
     */
    select?: ProyectoCostosConfigSelect<ExtArgs> | null
    /**
     * Filter, which ProyectoCostosConfig to fetch.
     */
    where?: ProyectoCostosConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProyectoCostosConfigs to fetch.
     */
    orderBy?: ProyectoCostosConfigOrderByWithRelationInput | ProyectoCostosConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProyectoCostosConfigs.
     */
    cursor?: ProyectoCostosConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProyectoCostosConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProyectoCostosConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProyectoCostosConfigs.
     */
    distinct?: ProyectoCostosConfigScalarFieldEnum | ProyectoCostosConfigScalarFieldEnum[]
  }

  /**
   * ProyectoCostosConfig findFirstOrThrow
   */
  export type ProyectoCostosConfigFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProyectoCostosConfig
     */
    select?: ProyectoCostosConfigSelect<ExtArgs> | null
    /**
     * Filter, which ProyectoCostosConfig to fetch.
     */
    where?: ProyectoCostosConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProyectoCostosConfigs to fetch.
     */
    orderBy?: ProyectoCostosConfigOrderByWithRelationInput | ProyectoCostosConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProyectoCostosConfigs.
     */
    cursor?: ProyectoCostosConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProyectoCostosConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProyectoCostosConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProyectoCostosConfigs.
     */
    distinct?: ProyectoCostosConfigScalarFieldEnum | ProyectoCostosConfigScalarFieldEnum[]
  }

  /**
   * ProyectoCostosConfig findMany
   */
  export type ProyectoCostosConfigFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProyectoCostosConfig
     */
    select?: ProyectoCostosConfigSelect<ExtArgs> | null
    /**
     * Filter, which ProyectoCostosConfigs to fetch.
     */
    where?: ProyectoCostosConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProyectoCostosConfigs to fetch.
     */
    orderBy?: ProyectoCostosConfigOrderByWithRelationInput | ProyectoCostosConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ProyectoCostosConfigs.
     */
    cursor?: ProyectoCostosConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProyectoCostosConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProyectoCostosConfigs.
     */
    skip?: number
    distinct?: ProyectoCostosConfigScalarFieldEnum | ProyectoCostosConfigScalarFieldEnum[]
  }

  /**
   * ProyectoCostosConfig create
   */
  export type ProyectoCostosConfigCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProyectoCostosConfig
     */
    select?: ProyectoCostosConfigSelect<ExtArgs> | null
    /**
     * The data needed to create a ProyectoCostosConfig.
     */
    data: XOR<ProyectoCostosConfigCreateInput, ProyectoCostosConfigUncheckedCreateInput>
  }

  /**
   * ProyectoCostosConfig createMany
   */
  export type ProyectoCostosConfigCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ProyectoCostosConfigs.
     */
    data: ProyectoCostosConfigCreateManyInput | ProyectoCostosConfigCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ProyectoCostosConfig createManyAndReturn
   */
  export type ProyectoCostosConfigCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProyectoCostosConfig
     */
    select?: ProyectoCostosConfigSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ProyectoCostosConfigs.
     */
    data: ProyectoCostosConfigCreateManyInput | ProyectoCostosConfigCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ProyectoCostosConfig update
   */
  export type ProyectoCostosConfigUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProyectoCostosConfig
     */
    select?: ProyectoCostosConfigSelect<ExtArgs> | null
    /**
     * The data needed to update a ProyectoCostosConfig.
     */
    data: XOR<ProyectoCostosConfigUpdateInput, ProyectoCostosConfigUncheckedUpdateInput>
    /**
     * Choose, which ProyectoCostosConfig to update.
     */
    where: ProyectoCostosConfigWhereUniqueInput
  }

  /**
   * ProyectoCostosConfig updateMany
   */
  export type ProyectoCostosConfigUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ProyectoCostosConfigs.
     */
    data: XOR<ProyectoCostosConfigUpdateManyMutationInput, ProyectoCostosConfigUncheckedUpdateManyInput>
    /**
     * Filter which ProyectoCostosConfigs to update
     */
    where?: ProyectoCostosConfigWhereInput
  }

  /**
   * ProyectoCostosConfig upsert
   */
  export type ProyectoCostosConfigUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProyectoCostosConfig
     */
    select?: ProyectoCostosConfigSelect<ExtArgs> | null
    /**
     * The filter to search for the ProyectoCostosConfig to update in case it exists.
     */
    where: ProyectoCostosConfigWhereUniqueInput
    /**
     * In case the ProyectoCostosConfig found by the `where` argument doesn't exist, create a new ProyectoCostosConfig with this data.
     */
    create: XOR<ProyectoCostosConfigCreateInput, ProyectoCostosConfigUncheckedCreateInput>
    /**
     * In case the ProyectoCostosConfig was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProyectoCostosConfigUpdateInput, ProyectoCostosConfigUncheckedUpdateInput>
  }

  /**
   * ProyectoCostosConfig delete
   */
  export type ProyectoCostosConfigDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProyectoCostosConfig
     */
    select?: ProyectoCostosConfigSelect<ExtArgs> | null
    /**
     * Filter which ProyectoCostosConfig to delete.
     */
    where: ProyectoCostosConfigWhereUniqueInput
  }

  /**
   * ProyectoCostosConfig deleteMany
   */
  export type ProyectoCostosConfigDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProyectoCostosConfigs to delete
     */
    where?: ProyectoCostosConfigWhereInput
  }

  /**
   * ProyectoCostosConfig without action
   */
  export type ProyectoCostosConfigDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProyectoCostosConfig
     */
    select?: ProyectoCostosConfigSelect<ExtArgs> | null
  }


  /**
   * Model Insumo
   */

  export type AggregateInsumo = {
    _count: InsumoCountAggregateOutputType | null
    _avg: InsumoAvgAggregateOutputType | null
    _sum: InsumoSumAggregateOutputType | null
    _min: InsumoMinAggregateOutputType | null
    _max: InsumoMaxAggregateOutputType | null
  }

  export type InsumoAvgAggregateOutputType = {
    costo_base: Decimal | null
  }

  export type InsumoSumAggregateOutputType = {
    costo_base: Decimal | null
  }

  export type InsumoMinAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    clave: string | null
    descripcion: string | null
    unidad_medida: string | null
    tipo_insumo: $Enums.TipoInsumo | null
    costo_base: Decimal | null
    categoria_gasto_id: string | null
    activo: boolean | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type InsumoMaxAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    clave: string | null
    descripcion: string | null
    unidad_medida: string | null
    tipo_insumo: $Enums.TipoInsumo | null
    costo_base: Decimal | null
    categoria_gasto_id: string | null
    activo: boolean | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type InsumoCountAggregateOutputType = {
    id: number
    tenant_id: number
    clave: number
    descripcion: number
    unidad_medida: number
    tipo_insumo: number
    costo_base: number
    categoria_gasto_id: number
    activo: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type InsumoAvgAggregateInputType = {
    costo_base?: true
  }

  export type InsumoSumAggregateInputType = {
    costo_base?: true
  }

  export type InsumoMinAggregateInputType = {
    id?: true
    tenant_id?: true
    clave?: true
    descripcion?: true
    unidad_medida?: true
    tipo_insumo?: true
    costo_base?: true
    categoria_gasto_id?: true
    activo?: true
    created_at?: true
    updated_at?: true
  }

  export type InsumoMaxAggregateInputType = {
    id?: true
    tenant_id?: true
    clave?: true
    descripcion?: true
    unidad_medida?: true
    tipo_insumo?: true
    costo_base?: true
    categoria_gasto_id?: true
    activo?: true
    created_at?: true
    updated_at?: true
  }

  export type InsumoCountAggregateInputType = {
    id?: true
    tenant_id?: true
    clave?: true
    descripcion?: true
    unidad_medida?: true
    tipo_insumo?: true
    costo_base?: true
    categoria_gasto_id?: true
    activo?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type InsumoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Insumo to aggregate.
     */
    where?: InsumoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Insumos to fetch.
     */
    orderBy?: InsumoOrderByWithRelationInput | InsumoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: InsumoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Insumos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Insumos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Insumos
    **/
    _count?: true | InsumoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: InsumoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: InsumoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: InsumoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: InsumoMaxAggregateInputType
  }

  export type GetInsumoAggregateType<T extends InsumoAggregateArgs> = {
        [P in keyof T & keyof AggregateInsumo]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateInsumo[P]>
      : GetScalarType<T[P], AggregateInsumo[P]>
  }




  export type InsumoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InsumoWhereInput
    orderBy?: InsumoOrderByWithAggregationInput | InsumoOrderByWithAggregationInput[]
    by: InsumoScalarFieldEnum[] | InsumoScalarFieldEnum
    having?: InsumoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: InsumoCountAggregateInputType | true
    _avg?: InsumoAvgAggregateInputType
    _sum?: InsumoSumAggregateInputType
    _min?: InsumoMinAggregateInputType
    _max?: InsumoMaxAggregateInputType
  }

  export type InsumoGroupByOutputType = {
    id: string
    tenant_id: string
    clave: string
    descripcion: string
    unidad_medida: string
    tipo_insumo: $Enums.TipoInsumo
    costo_base: Decimal
    categoria_gasto_id: string | null
    activo: boolean
    created_at: Date
    updated_at: Date
    _count: InsumoCountAggregateOutputType | null
    _avg: InsumoAvgAggregateOutputType | null
    _sum: InsumoSumAggregateOutputType | null
    _min: InsumoMinAggregateOutputType | null
    _max: InsumoMaxAggregateOutputType | null
  }

  type GetInsumoGroupByPayload<T extends InsumoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<InsumoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof InsumoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], InsumoGroupByOutputType[P]>
            : GetScalarType<T[P], InsumoGroupByOutputType[P]>
        }
      >
    >


  export type InsumoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    clave?: boolean
    descripcion?: boolean
    unidad_medida?: boolean
    tipo_insumo?: boolean
    costo_base?: boolean
    categoria_gasto_id?: boolean
    activo?: boolean
    created_at?: boolean
    updated_at?: boolean
    categoria_gasto?: boolean | Insumo$categoria_gastoArgs<ExtArgs>
    concepto_insumos?: boolean | Insumo$concepto_insumosArgs<ExtArgs>
    _count?: boolean | InsumoCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["insumo"]>

  export type InsumoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    clave?: boolean
    descripcion?: boolean
    unidad_medida?: boolean
    tipo_insumo?: boolean
    costo_base?: boolean
    categoria_gasto_id?: boolean
    activo?: boolean
    created_at?: boolean
    updated_at?: boolean
    categoria_gasto?: boolean | Insumo$categoria_gastoArgs<ExtArgs>
  }, ExtArgs["result"]["insumo"]>

  export type InsumoSelectScalar = {
    id?: boolean
    tenant_id?: boolean
    clave?: boolean
    descripcion?: boolean
    unidad_medida?: boolean
    tipo_insumo?: boolean
    costo_base?: boolean
    categoria_gasto_id?: boolean
    activo?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type InsumoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    categoria_gasto?: boolean | Insumo$categoria_gastoArgs<ExtArgs>
    concepto_insumos?: boolean | Insumo$concepto_insumosArgs<ExtArgs>
    _count?: boolean | InsumoCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type InsumoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    categoria_gasto?: boolean | Insumo$categoria_gastoArgs<ExtArgs>
  }

  export type $InsumoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Insumo"
    objects: {
      categoria_gasto: Prisma.$CategoriaGastoPayload<ExtArgs> | null
      concepto_insumos: Prisma.$ConceptoInsumoPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenant_id: string
      clave: string
      descripcion: string
      unidad_medida: string
      tipo_insumo: $Enums.TipoInsumo
      costo_base: Prisma.Decimal
      /**
       * Categoría de gasto asignada por Control de Proyectos (nullable hasta clasificar)
       */
      categoria_gasto_id: string | null
      activo: boolean
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["insumo"]>
    composites: {}
  }

  type InsumoGetPayload<S extends boolean | null | undefined | InsumoDefaultArgs> = $Result.GetResult<Prisma.$InsumoPayload, S>

  type InsumoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<InsumoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: InsumoCountAggregateInputType | true
    }

  export interface InsumoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Insumo'], meta: { name: 'Insumo' } }
    /**
     * Find zero or one Insumo that matches the filter.
     * @param {InsumoFindUniqueArgs} args - Arguments to find a Insumo
     * @example
     * // Get one Insumo
     * const insumo = await prisma.insumo.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends InsumoFindUniqueArgs>(args: SelectSubset<T, InsumoFindUniqueArgs<ExtArgs>>): Prisma__InsumoClient<$Result.GetResult<Prisma.$InsumoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Insumo that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {InsumoFindUniqueOrThrowArgs} args - Arguments to find a Insumo
     * @example
     * // Get one Insumo
     * const insumo = await prisma.insumo.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends InsumoFindUniqueOrThrowArgs>(args: SelectSubset<T, InsumoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__InsumoClient<$Result.GetResult<Prisma.$InsumoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Insumo that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InsumoFindFirstArgs} args - Arguments to find a Insumo
     * @example
     * // Get one Insumo
     * const insumo = await prisma.insumo.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends InsumoFindFirstArgs>(args?: SelectSubset<T, InsumoFindFirstArgs<ExtArgs>>): Prisma__InsumoClient<$Result.GetResult<Prisma.$InsumoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Insumo that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InsumoFindFirstOrThrowArgs} args - Arguments to find a Insumo
     * @example
     * // Get one Insumo
     * const insumo = await prisma.insumo.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends InsumoFindFirstOrThrowArgs>(args?: SelectSubset<T, InsumoFindFirstOrThrowArgs<ExtArgs>>): Prisma__InsumoClient<$Result.GetResult<Prisma.$InsumoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Insumos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InsumoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Insumos
     * const insumos = await prisma.insumo.findMany()
     * 
     * // Get first 10 Insumos
     * const insumos = await prisma.insumo.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const insumoWithIdOnly = await prisma.insumo.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends InsumoFindManyArgs>(args?: SelectSubset<T, InsumoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InsumoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Insumo.
     * @param {InsumoCreateArgs} args - Arguments to create a Insumo.
     * @example
     * // Create one Insumo
     * const Insumo = await prisma.insumo.create({
     *   data: {
     *     // ... data to create a Insumo
     *   }
     * })
     * 
     */
    create<T extends InsumoCreateArgs>(args: SelectSubset<T, InsumoCreateArgs<ExtArgs>>): Prisma__InsumoClient<$Result.GetResult<Prisma.$InsumoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Insumos.
     * @param {InsumoCreateManyArgs} args - Arguments to create many Insumos.
     * @example
     * // Create many Insumos
     * const insumo = await prisma.insumo.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends InsumoCreateManyArgs>(args?: SelectSubset<T, InsumoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Insumos and returns the data saved in the database.
     * @param {InsumoCreateManyAndReturnArgs} args - Arguments to create many Insumos.
     * @example
     * // Create many Insumos
     * const insumo = await prisma.insumo.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Insumos and only return the `id`
     * const insumoWithIdOnly = await prisma.insumo.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends InsumoCreateManyAndReturnArgs>(args?: SelectSubset<T, InsumoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InsumoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Insumo.
     * @param {InsumoDeleteArgs} args - Arguments to delete one Insumo.
     * @example
     * // Delete one Insumo
     * const Insumo = await prisma.insumo.delete({
     *   where: {
     *     // ... filter to delete one Insumo
     *   }
     * })
     * 
     */
    delete<T extends InsumoDeleteArgs>(args: SelectSubset<T, InsumoDeleteArgs<ExtArgs>>): Prisma__InsumoClient<$Result.GetResult<Prisma.$InsumoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Insumo.
     * @param {InsumoUpdateArgs} args - Arguments to update one Insumo.
     * @example
     * // Update one Insumo
     * const insumo = await prisma.insumo.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends InsumoUpdateArgs>(args: SelectSubset<T, InsumoUpdateArgs<ExtArgs>>): Prisma__InsumoClient<$Result.GetResult<Prisma.$InsumoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Insumos.
     * @param {InsumoDeleteManyArgs} args - Arguments to filter Insumos to delete.
     * @example
     * // Delete a few Insumos
     * const { count } = await prisma.insumo.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends InsumoDeleteManyArgs>(args?: SelectSubset<T, InsumoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Insumos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InsumoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Insumos
     * const insumo = await prisma.insumo.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends InsumoUpdateManyArgs>(args: SelectSubset<T, InsumoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Insumo.
     * @param {InsumoUpsertArgs} args - Arguments to update or create a Insumo.
     * @example
     * // Update or create a Insumo
     * const insumo = await prisma.insumo.upsert({
     *   create: {
     *     // ... data to create a Insumo
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Insumo we want to update
     *   }
     * })
     */
    upsert<T extends InsumoUpsertArgs>(args: SelectSubset<T, InsumoUpsertArgs<ExtArgs>>): Prisma__InsumoClient<$Result.GetResult<Prisma.$InsumoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Insumos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InsumoCountArgs} args - Arguments to filter Insumos to count.
     * @example
     * // Count the number of Insumos
     * const count = await prisma.insumo.count({
     *   where: {
     *     // ... the filter for the Insumos we want to count
     *   }
     * })
    **/
    count<T extends InsumoCountArgs>(
      args?: Subset<T, InsumoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], InsumoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Insumo.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InsumoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends InsumoAggregateArgs>(args: Subset<T, InsumoAggregateArgs>): Prisma.PrismaPromise<GetInsumoAggregateType<T>>

    /**
     * Group by Insumo.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InsumoGroupByArgs} args - Group by arguments.
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
      T extends InsumoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: InsumoGroupByArgs['orderBy'] }
        : { orderBy?: InsumoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, InsumoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInsumoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Insumo model
   */
  readonly fields: InsumoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Insumo.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__InsumoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    categoria_gasto<T extends Insumo$categoria_gastoArgs<ExtArgs> = {}>(args?: Subset<T, Insumo$categoria_gastoArgs<ExtArgs>>): Prisma__CategoriaGastoClient<$Result.GetResult<Prisma.$CategoriaGastoPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    concepto_insumos<T extends Insumo$concepto_insumosArgs<ExtArgs> = {}>(args?: Subset<T, Insumo$concepto_insumosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConceptoInsumoPayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the Insumo model
   */ 
  interface InsumoFieldRefs {
    readonly id: FieldRef<"Insumo", 'String'>
    readonly tenant_id: FieldRef<"Insumo", 'String'>
    readonly clave: FieldRef<"Insumo", 'String'>
    readonly descripcion: FieldRef<"Insumo", 'String'>
    readonly unidad_medida: FieldRef<"Insumo", 'String'>
    readonly tipo_insumo: FieldRef<"Insumo", 'TipoInsumo'>
    readonly costo_base: FieldRef<"Insumo", 'Decimal'>
    readonly categoria_gasto_id: FieldRef<"Insumo", 'String'>
    readonly activo: FieldRef<"Insumo", 'Boolean'>
    readonly created_at: FieldRef<"Insumo", 'DateTime'>
    readonly updated_at: FieldRef<"Insumo", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Insumo findUnique
   */
  export type InsumoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Insumo
     */
    select?: InsumoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InsumoInclude<ExtArgs> | null
    /**
     * Filter, which Insumo to fetch.
     */
    where: InsumoWhereUniqueInput
  }

  /**
   * Insumo findUniqueOrThrow
   */
  export type InsumoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Insumo
     */
    select?: InsumoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InsumoInclude<ExtArgs> | null
    /**
     * Filter, which Insumo to fetch.
     */
    where: InsumoWhereUniqueInput
  }

  /**
   * Insumo findFirst
   */
  export type InsumoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Insumo
     */
    select?: InsumoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InsumoInclude<ExtArgs> | null
    /**
     * Filter, which Insumo to fetch.
     */
    where?: InsumoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Insumos to fetch.
     */
    orderBy?: InsumoOrderByWithRelationInput | InsumoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Insumos.
     */
    cursor?: InsumoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Insumos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Insumos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Insumos.
     */
    distinct?: InsumoScalarFieldEnum | InsumoScalarFieldEnum[]
  }

  /**
   * Insumo findFirstOrThrow
   */
  export type InsumoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Insumo
     */
    select?: InsumoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InsumoInclude<ExtArgs> | null
    /**
     * Filter, which Insumo to fetch.
     */
    where?: InsumoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Insumos to fetch.
     */
    orderBy?: InsumoOrderByWithRelationInput | InsumoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Insumos.
     */
    cursor?: InsumoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Insumos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Insumos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Insumos.
     */
    distinct?: InsumoScalarFieldEnum | InsumoScalarFieldEnum[]
  }

  /**
   * Insumo findMany
   */
  export type InsumoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Insumo
     */
    select?: InsumoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InsumoInclude<ExtArgs> | null
    /**
     * Filter, which Insumos to fetch.
     */
    where?: InsumoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Insumos to fetch.
     */
    orderBy?: InsumoOrderByWithRelationInput | InsumoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Insumos.
     */
    cursor?: InsumoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Insumos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Insumos.
     */
    skip?: number
    distinct?: InsumoScalarFieldEnum | InsumoScalarFieldEnum[]
  }

  /**
   * Insumo create
   */
  export type InsumoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Insumo
     */
    select?: InsumoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InsumoInclude<ExtArgs> | null
    /**
     * The data needed to create a Insumo.
     */
    data: XOR<InsumoCreateInput, InsumoUncheckedCreateInput>
  }

  /**
   * Insumo createMany
   */
  export type InsumoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Insumos.
     */
    data: InsumoCreateManyInput | InsumoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Insumo createManyAndReturn
   */
  export type InsumoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Insumo
     */
    select?: InsumoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Insumos.
     */
    data: InsumoCreateManyInput | InsumoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InsumoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Insumo update
   */
  export type InsumoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Insumo
     */
    select?: InsumoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InsumoInclude<ExtArgs> | null
    /**
     * The data needed to update a Insumo.
     */
    data: XOR<InsumoUpdateInput, InsumoUncheckedUpdateInput>
    /**
     * Choose, which Insumo to update.
     */
    where: InsumoWhereUniqueInput
  }

  /**
   * Insumo updateMany
   */
  export type InsumoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Insumos.
     */
    data: XOR<InsumoUpdateManyMutationInput, InsumoUncheckedUpdateManyInput>
    /**
     * Filter which Insumos to update
     */
    where?: InsumoWhereInput
  }

  /**
   * Insumo upsert
   */
  export type InsumoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Insumo
     */
    select?: InsumoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InsumoInclude<ExtArgs> | null
    /**
     * The filter to search for the Insumo to update in case it exists.
     */
    where: InsumoWhereUniqueInput
    /**
     * In case the Insumo found by the `where` argument doesn't exist, create a new Insumo with this data.
     */
    create: XOR<InsumoCreateInput, InsumoUncheckedCreateInput>
    /**
     * In case the Insumo was found with the provided `where` argument, update it with this data.
     */
    update: XOR<InsumoUpdateInput, InsumoUncheckedUpdateInput>
  }

  /**
   * Insumo delete
   */
  export type InsumoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Insumo
     */
    select?: InsumoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InsumoInclude<ExtArgs> | null
    /**
     * Filter which Insumo to delete.
     */
    where: InsumoWhereUniqueInput
  }

  /**
   * Insumo deleteMany
   */
  export type InsumoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Insumos to delete
     */
    where?: InsumoWhereInput
  }

  /**
   * Insumo.categoria_gasto
   */
  export type Insumo$categoria_gastoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CategoriaGasto
     */
    select?: CategoriaGastoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoriaGastoInclude<ExtArgs> | null
    where?: CategoriaGastoWhereInput
  }

  /**
   * Insumo.concepto_insumos
   */
  export type Insumo$concepto_insumosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConceptoInsumo
     */
    select?: ConceptoInsumoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConceptoInsumoInclude<ExtArgs> | null
    where?: ConceptoInsumoWhereInput
    orderBy?: ConceptoInsumoOrderByWithRelationInput | ConceptoInsumoOrderByWithRelationInput[]
    cursor?: ConceptoInsumoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ConceptoInsumoScalarFieldEnum | ConceptoInsumoScalarFieldEnum[]
  }

  /**
   * Insumo without action
   */
  export type InsumoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Insumo
     */
    select?: InsumoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InsumoInclude<ExtArgs> | null
  }


  /**
   * Model PresupuestoBase
   */

  export type AggregatePresupuestoBase = {
    _count: PresupuestoBaseCountAggregateOutputType | null
    _avg: PresupuestoBaseAvgAggregateOutputType | null
    _sum: PresupuestoBaseSumAggregateOutputType | null
    _min: PresupuestoBaseMinAggregateOutputType | null
    _max: PresupuestoBaseMaxAggregateOutputType | null
  }

  export type PresupuestoBaseAvgAggregateOutputType = {
    version: number | null
    importe_total: Decimal | null
  }

  export type PresupuestoBaseSumAggregateOutputType = {
    version: number | null
    importe_total: Decimal | null
  }

  export type PresupuestoBaseMinAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    proyecto_id: string | null
    version: number | null
    estado: $Enums.EstadoPresupuesto | null
    importe_total: Decimal | null
    aprobado_por: string | null
    fecha_aprobacion: Date | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type PresupuestoBaseMaxAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    proyecto_id: string | null
    version: number | null
    estado: $Enums.EstadoPresupuesto | null
    importe_total: Decimal | null
    aprobado_por: string | null
    fecha_aprobacion: Date | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type PresupuestoBaseCountAggregateOutputType = {
    id: number
    tenant_id: number
    proyecto_id: number
    version: number
    estado: number
    importe_total: number
    aprobado_por: number
    fecha_aprobacion: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type PresupuestoBaseAvgAggregateInputType = {
    version?: true
    importe_total?: true
  }

  export type PresupuestoBaseSumAggregateInputType = {
    version?: true
    importe_total?: true
  }

  export type PresupuestoBaseMinAggregateInputType = {
    id?: true
    tenant_id?: true
    proyecto_id?: true
    version?: true
    estado?: true
    importe_total?: true
    aprobado_por?: true
    fecha_aprobacion?: true
    created_at?: true
    updated_at?: true
  }

  export type PresupuestoBaseMaxAggregateInputType = {
    id?: true
    tenant_id?: true
    proyecto_id?: true
    version?: true
    estado?: true
    importe_total?: true
    aprobado_por?: true
    fecha_aprobacion?: true
    created_at?: true
    updated_at?: true
  }

  export type PresupuestoBaseCountAggregateInputType = {
    id?: true
    tenant_id?: true
    proyecto_id?: true
    version?: true
    estado?: true
    importe_total?: true
    aprobado_por?: true
    fecha_aprobacion?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type PresupuestoBaseAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PresupuestoBase to aggregate.
     */
    where?: PresupuestoBaseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PresupuestoBases to fetch.
     */
    orderBy?: PresupuestoBaseOrderByWithRelationInput | PresupuestoBaseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PresupuestoBaseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PresupuestoBases from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PresupuestoBases.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PresupuestoBases
    **/
    _count?: true | PresupuestoBaseCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PresupuestoBaseAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PresupuestoBaseSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PresupuestoBaseMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PresupuestoBaseMaxAggregateInputType
  }

  export type GetPresupuestoBaseAggregateType<T extends PresupuestoBaseAggregateArgs> = {
        [P in keyof T & keyof AggregatePresupuestoBase]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePresupuestoBase[P]>
      : GetScalarType<T[P], AggregatePresupuestoBase[P]>
  }




  export type PresupuestoBaseGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PresupuestoBaseWhereInput
    orderBy?: PresupuestoBaseOrderByWithAggregationInput | PresupuestoBaseOrderByWithAggregationInput[]
    by: PresupuestoBaseScalarFieldEnum[] | PresupuestoBaseScalarFieldEnum
    having?: PresupuestoBaseScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PresupuestoBaseCountAggregateInputType | true
    _avg?: PresupuestoBaseAvgAggregateInputType
    _sum?: PresupuestoBaseSumAggregateInputType
    _min?: PresupuestoBaseMinAggregateInputType
    _max?: PresupuestoBaseMaxAggregateInputType
  }

  export type PresupuestoBaseGroupByOutputType = {
    id: string
    tenant_id: string
    proyecto_id: string
    version: number
    estado: $Enums.EstadoPresupuesto
    importe_total: Decimal
    aprobado_por: string | null
    fecha_aprobacion: Date | null
    created_at: Date
    updated_at: Date
    _count: PresupuestoBaseCountAggregateOutputType | null
    _avg: PresupuestoBaseAvgAggregateOutputType | null
    _sum: PresupuestoBaseSumAggregateOutputType | null
    _min: PresupuestoBaseMinAggregateOutputType | null
    _max: PresupuestoBaseMaxAggregateOutputType | null
  }

  type GetPresupuestoBaseGroupByPayload<T extends PresupuestoBaseGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PresupuestoBaseGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PresupuestoBaseGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PresupuestoBaseGroupByOutputType[P]>
            : GetScalarType<T[P], PresupuestoBaseGroupByOutputType[P]>
        }
      >
    >


  export type PresupuestoBaseSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    version?: boolean
    estado?: boolean
    importe_total?: boolean
    aprobado_por?: boolean
    fecha_aprobacion?: boolean
    created_at?: boolean
    updated_at?: boolean
    conceptos?: boolean | PresupuestoBase$conceptosArgs<ExtArgs>
    _count?: boolean | PresupuestoBaseCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["presupuestoBase"]>

  export type PresupuestoBaseSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    version?: boolean
    estado?: boolean
    importe_total?: boolean
    aprobado_por?: boolean
    fecha_aprobacion?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["presupuestoBase"]>

  export type PresupuestoBaseSelectScalar = {
    id?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    version?: boolean
    estado?: boolean
    importe_total?: boolean
    aprobado_por?: boolean
    fecha_aprobacion?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type PresupuestoBaseInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    conceptos?: boolean | PresupuestoBase$conceptosArgs<ExtArgs>
    _count?: boolean | PresupuestoBaseCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type PresupuestoBaseIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $PresupuestoBasePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PresupuestoBase"
    objects: {
      conceptos: Prisma.$ConceptoPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenant_id: string
      proyecto_id: string
      version: number
      estado: $Enums.EstadoPresupuesto
      importe_total: Prisma.Decimal
      aprobado_por: string | null
      fecha_aprobacion: Date | null
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["presupuestoBase"]>
    composites: {}
  }

  type PresupuestoBaseGetPayload<S extends boolean | null | undefined | PresupuestoBaseDefaultArgs> = $Result.GetResult<Prisma.$PresupuestoBasePayload, S>

  type PresupuestoBaseCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PresupuestoBaseFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PresupuestoBaseCountAggregateInputType | true
    }

  export interface PresupuestoBaseDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PresupuestoBase'], meta: { name: 'PresupuestoBase' } }
    /**
     * Find zero or one PresupuestoBase that matches the filter.
     * @param {PresupuestoBaseFindUniqueArgs} args - Arguments to find a PresupuestoBase
     * @example
     * // Get one PresupuestoBase
     * const presupuestoBase = await prisma.presupuestoBase.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PresupuestoBaseFindUniqueArgs>(args: SelectSubset<T, PresupuestoBaseFindUniqueArgs<ExtArgs>>): Prisma__PresupuestoBaseClient<$Result.GetResult<Prisma.$PresupuestoBasePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one PresupuestoBase that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PresupuestoBaseFindUniqueOrThrowArgs} args - Arguments to find a PresupuestoBase
     * @example
     * // Get one PresupuestoBase
     * const presupuestoBase = await prisma.presupuestoBase.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PresupuestoBaseFindUniqueOrThrowArgs>(args: SelectSubset<T, PresupuestoBaseFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PresupuestoBaseClient<$Result.GetResult<Prisma.$PresupuestoBasePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first PresupuestoBase that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PresupuestoBaseFindFirstArgs} args - Arguments to find a PresupuestoBase
     * @example
     * // Get one PresupuestoBase
     * const presupuestoBase = await prisma.presupuestoBase.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PresupuestoBaseFindFirstArgs>(args?: SelectSubset<T, PresupuestoBaseFindFirstArgs<ExtArgs>>): Prisma__PresupuestoBaseClient<$Result.GetResult<Prisma.$PresupuestoBasePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first PresupuestoBase that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PresupuestoBaseFindFirstOrThrowArgs} args - Arguments to find a PresupuestoBase
     * @example
     * // Get one PresupuestoBase
     * const presupuestoBase = await prisma.presupuestoBase.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PresupuestoBaseFindFirstOrThrowArgs>(args?: SelectSubset<T, PresupuestoBaseFindFirstOrThrowArgs<ExtArgs>>): Prisma__PresupuestoBaseClient<$Result.GetResult<Prisma.$PresupuestoBasePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more PresupuestoBases that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PresupuestoBaseFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PresupuestoBases
     * const presupuestoBases = await prisma.presupuestoBase.findMany()
     * 
     * // Get first 10 PresupuestoBases
     * const presupuestoBases = await prisma.presupuestoBase.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const presupuestoBaseWithIdOnly = await prisma.presupuestoBase.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PresupuestoBaseFindManyArgs>(args?: SelectSubset<T, PresupuestoBaseFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PresupuestoBasePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a PresupuestoBase.
     * @param {PresupuestoBaseCreateArgs} args - Arguments to create a PresupuestoBase.
     * @example
     * // Create one PresupuestoBase
     * const PresupuestoBase = await prisma.presupuestoBase.create({
     *   data: {
     *     // ... data to create a PresupuestoBase
     *   }
     * })
     * 
     */
    create<T extends PresupuestoBaseCreateArgs>(args: SelectSubset<T, PresupuestoBaseCreateArgs<ExtArgs>>): Prisma__PresupuestoBaseClient<$Result.GetResult<Prisma.$PresupuestoBasePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many PresupuestoBases.
     * @param {PresupuestoBaseCreateManyArgs} args - Arguments to create many PresupuestoBases.
     * @example
     * // Create many PresupuestoBases
     * const presupuestoBase = await prisma.presupuestoBase.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PresupuestoBaseCreateManyArgs>(args?: SelectSubset<T, PresupuestoBaseCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PresupuestoBases and returns the data saved in the database.
     * @param {PresupuestoBaseCreateManyAndReturnArgs} args - Arguments to create many PresupuestoBases.
     * @example
     * // Create many PresupuestoBases
     * const presupuestoBase = await prisma.presupuestoBase.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PresupuestoBases and only return the `id`
     * const presupuestoBaseWithIdOnly = await prisma.presupuestoBase.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PresupuestoBaseCreateManyAndReturnArgs>(args?: SelectSubset<T, PresupuestoBaseCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PresupuestoBasePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a PresupuestoBase.
     * @param {PresupuestoBaseDeleteArgs} args - Arguments to delete one PresupuestoBase.
     * @example
     * // Delete one PresupuestoBase
     * const PresupuestoBase = await prisma.presupuestoBase.delete({
     *   where: {
     *     // ... filter to delete one PresupuestoBase
     *   }
     * })
     * 
     */
    delete<T extends PresupuestoBaseDeleteArgs>(args: SelectSubset<T, PresupuestoBaseDeleteArgs<ExtArgs>>): Prisma__PresupuestoBaseClient<$Result.GetResult<Prisma.$PresupuestoBasePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one PresupuestoBase.
     * @param {PresupuestoBaseUpdateArgs} args - Arguments to update one PresupuestoBase.
     * @example
     * // Update one PresupuestoBase
     * const presupuestoBase = await prisma.presupuestoBase.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PresupuestoBaseUpdateArgs>(args: SelectSubset<T, PresupuestoBaseUpdateArgs<ExtArgs>>): Prisma__PresupuestoBaseClient<$Result.GetResult<Prisma.$PresupuestoBasePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more PresupuestoBases.
     * @param {PresupuestoBaseDeleteManyArgs} args - Arguments to filter PresupuestoBases to delete.
     * @example
     * // Delete a few PresupuestoBases
     * const { count } = await prisma.presupuestoBase.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PresupuestoBaseDeleteManyArgs>(args?: SelectSubset<T, PresupuestoBaseDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PresupuestoBases.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PresupuestoBaseUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PresupuestoBases
     * const presupuestoBase = await prisma.presupuestoBase.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PresupuestoBaseUpdateManyArgs>(args: SelectSubset<T, PresupuestoBaseUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PresupuestoBase.
     * @param {PresupuestoBaseUpsertArgs} args - Arguments to update or create a PresupuestoBase.
     * @example
     * // Update or create a PresupuestoBase
     * const presupuestoBase = await prisma.presupuestoBase.upsert({
     *   create: {
     *     // ... data to create a PresupuestoBase
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PresupuestoBase we want to update
     *   }
     * })
     */
    upsert<T extends PresupuestoBaseUpsertArgs>(args: SelectSubset<T, PresupuestoBaseUpsertArgs<ExtArgs>>): Prisma__PresupuestoBaseClient<$Result.GetResult<Prisma.$PresupuestoBasePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of PresupuestoBases.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PresupuestoBaseCountArgs} args - Arguments to filter PresupuestoBases to count.
     * @example
     * // Count the number of PresupuestoBases
     * const count = await prisma.presupuestoBase.count({
     *   where: {
     *     // ... the filter for the PresupuestoBases we want to count
     *   }
     * })
    **/
    count<T extends PresupuestoBaseCountArgs>(
      args?: Subset<T, PresupuestoBaseCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PresupuestoBaseCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PresupuestoBase.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PresupuestoBaseAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends PresupuestoBaseAggregateArgs>(args: Subset<T, PresupuestoBaseAggregateArgs>): Prisma.PrismaPromise<GetPresupuestoBaseAggregateType<T>>

    /**
     * Group by PresupuestoBase.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PresupuestoBaseGroupByArgs} args - Group by arguments.
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
      T extends PresupuestoBaseGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PresupuestoBaseGroupByArgs['orderBy'] }
        : { orderBy?: PresupuestoBaseGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, PresupuestoBaseGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPresupuestoBaseGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PresupuestoBase model
   */
  readonly fields: PresupuestoBaseFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PresupuestoBase.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PresupuestoBaseClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    conceptos<T extends PresupuestoBase$conceptosArgs<ExtArgs> = {}>(args?: Subset<T, PresupuestoBase$conceptosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConceptoPayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the PresupuestoBase model
   */ 
  interface PresupuestoBaseFieldRefs {
    readonly id: FieldRef<"PresupuestoBase", 'String'>
    readonly tenant_id: FieldRef<"PresupuestoBase", 'String'>
    readonly proyecto_id: FieldRef<"PresupuestoBase", 'String'>
    readonly version: FieldRef<"PresupuestoBase", 'Int'>
    readonly estado: FieldRef<"PresupuestoBase", 'EstadoPresupuesto'>
    readonly importe_total: FieldRef<"PresupuestoBase", 'Decimal'>
    readonly aprobado_por: FieldRef<"PresupuestoBase", 'String'>
    readonly fecha_aprobacion: FieldRef<"PresupuestoBase", 'DateTime'>
    readonly created_at: FieldRef<"PresupuestoBase", 'DateTime'>
    readonly updated_at: FieldRef<"PresupuestoBase", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PresupuestoBase findUnique
   */
  export type PresupuestoBaseFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PresupuestoBase
     */
    select?: PresupuestoBaseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PresupuestoBaseInclude<ExtArgs> | null
    /**
     * Filter, which PresupuestoBase to fetch.
     */
    where: PresupuestoBaseWhereUniqueInput
  }

  /**
   * PresupuestoBase findUniqueOrThrow
   */
  export type PresupuestoBaseFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PresupuestoBase
     */
    select?: PresupuestoBaseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PresupuestoBaseInclude<ExtArgs> | null
    /**
     * Filter, which PresupuestoBase to fetch.
     */
    where: PresupuestoBaseWhereUniqueInput
  }

  /**
   * PresupuestoBase findFirst
   */
  export type PresupuestoBaseFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PresupuestoBase
     */
    select?: PresupuestoBaseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PresupuestoBaseInclude<ExtArgs> | null
    /**
     * Filter, which PresupuestoBase to fetch.
     */
    where?: PresupuestoBaseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PresupuestoBases to fetch.
     */
    orderBy?: PresupuestoBaseOrderByWithRelationInput | PresupuestoBaseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PresupuestoBases.
     */
    cursor?: PresupuestoBaseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PresupuestoBases from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PresupuestoBases.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PresupuestoBases.
     */
    distinct?: PresupuestoBaseScalarFieldEnum | PresupuestoBaseScalarFieldEnum[]
  }

  /**
   * PresupuestoBase findFirstOrThrow
   */
  export type PresupuestoBaseFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PresupuestoBase
     */
    select?: PresupuestoBaseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PresupuestoBaseInclude<ExtArgs> | null
    /**
     * Filter, which PresupuestoBase to fetch.
     */
    where?: PresupuestoBaseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PresupuestoBases to fetch.
     */
    orderBy?: PresupuestoBaseOrderByWithRelationInput | PresupuestoBaseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PresupuestoBases.
     */
    cursor?: PresupuestoBaseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PresupuestoBases from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PresupuestoBases.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PresupuestoBases.
     */
    distinct?: PresupuestoBaseScalarFieldEnum | PresupuestoBaseScalarFieldEnum[]
  }

  /**
   * PresupuestoBase findMany
   */
  export type PresupuestoBaseFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PresupuestoBase
     */
    select?: PresupuestoBaseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PresupuestoBaseInclude<ExtArgs> | null
    /**
     * Filter, which PresupuestoBases to fetch.
     */
    where?: PresupuestoBaseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PresupuestoBases to fetch.
     */
    orderBy?: PresupuestoBaseOrderByWithRelationInput | PresupuestoBaseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PresupuestoBases.
     */
    cursor?: PresupuestoBaseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PresupuestoBases from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PresupuestoBases.
     */
    skip?: number
    distinct?: PresupuestoBaseScalarFieldEnum | PresupuestoBaseScalarFieldEnum[]
  }

  /**
   * PresupuestoBase create
   */
  export type PresupuestoBaseCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PresupuestoBase
     */
    select?: PresupuestoBaseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PresupuestoBaseInclude<ExtArgs> | null
    /**
     * The data needed to create a PresupuestoBase.
     */
    data: XOR<PresupuestoBaseCreateInput, PresupuestoBaseUncheckedCreateInput>
  }

  /**
   * PresupuestoBase createMany
   */
  export type PresupuestoBaseCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PresupuestoBases.
     */
    data: PresupuestoBaseCreateManyInput | PresupuestoBaseCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PresupuestoBase createManyAndReturn
   */
  export type PresupuestoBaseCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PresupuestoBase
     */
    select?: PresupuestoBaseSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many PresupuestoBases.
     */
    data: PresupuestoBaseCreateManyInput | PresupuestoBaseCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PresupuestoBase update
   */
  export type PresupuestoBaseUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PresupuestoBase
     */
    select?: PresupuestoBaseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PresupuestoBaseInclude<ExtArgs> | null
    /**
     * The data needed to update a PresupuestoBase.
     */
    data: XOR<PresupuestoBaseUpdateInput, PresupuestoBaseUncheckedUpdateInput>
    /**
     * Choose, which PresupuestoBase to update.
     */
    where: PresupuestoBaseWhereUniqueInput
  }

  /**
   * PresupuestoBase updateMany
   */
  export type PresupuestoBaseUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PresupuestoBases.
     */
    data: XOR<PresupuestoBaseUpdateManyMutationInput, PresupuestoBaseUncheckedUpdateManyInput>
    /**
     * Filter which PresupuestoBases to update
     */
    where?: PresupuestoBaseWhereInput
  }

  /**
   * PresupuestoBase upsert
   */
  export type PresupuestoBaseUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PresupuestoBase
     */
    select?: PresupuestoBaseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PresupuestoBaseInclude<ExtArgs> | null
    /**
     * The filter to search for the PresupuestoBase to update in case it exists.
     */
    where: PresupuestoBaseWhereUniqueInput
    /**
     * In case the PresupuestoBase found by the `where` argument doesn't exist, create a new PresupuestoBase with this data.
     */
    create: XOR<PresupuestoBaseCreateInput, PresupuestoBaseUncheckedCreateInput>
    /**
     * In case the PresupuestoBase was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PresupuestoBaseUpdateInput, PresupuestoBaseUncheckedUpdateInput>
  }

  /**
   * PresupuestoBase delete
   */
  export type PresupuestoBaseDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PresupuestoBase
     */
    select?: PresupuestoBaseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PresupuestoBaseInclude<ExtArgs> | null
    /**
     * Filter which PresupuestoBase to delete.
     */
    where: PresupuestoBaseWhereUniqueInput
  }

  /**
   * PresupuestoBase deleteMany
   */
  export type PresupuestoBaseDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PresupuestoBases to delete
     */
    where?: PresupuestoBaseWhereInput
  }

  /**
   * PresupuestoBase.conceptos
   */
  export type PresupuestoBase$conceptosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Concepto
     */
    select?: ConceptoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConceptoInclude<ExtArgs> | null
    where?: ConceptoWhereInput
    orderBy?: ConceptoOrderByWithRelationInput | ConceptoOrderByWithRelationInput[]
    cursor?: ConceptoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ConceptoScalarFieldEnum | ConceptoScalarFieldEnum[]
  }

  /**
   * PresupuestoBase without action
   */
  export type PresupuestoBaseDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PresupuestoBase
     */
    select?: PresupuestoBaseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PresupuestoBaseInclude<ExtArgs> | null
  }


  /**
   * Model Concepto
   */

  export type AggregateConcepto = {
    _count: ConceptoCountAggregateOutputType | null
    _avg: ConceptoAvgAggregateOutputType | null
    _sum: ConceptoSumAggregateOutputType | null
    _min: ConceptoMinAggregateOutputType | null
    _max: ConceptoMaxAggregateOutputType | null
  }

  export type ConceptoAvgAggregateOutputType = {
    cantidad: Decimal | null
    precio_unitario: Decimal | null
    importe: Decimal | null
  }

  export type ConceptoSumAggregateOutputType = {
    cantidad: Decimal | null
    precio_unitario: Decimal | null
    importe: Decimal | null
  }

  export type ConceptoMinAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    proyecto_id: string | null
    presupuesto_id: string | null
    clave: string | null
    descripcion: string | null
    unidad_medida: string | null
    cantidad: Decimal | null
    precio_unitario: Decimal | null
    importe: Decimal | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type ConceptoMaxAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    proyecto_id: string | null
    presupuesto_id: string | null
    clave: string | null
    descripcion: string | null
    unidad_medida: string | null
    cantidad: Decimal | null
    precio_unitario: Decimal | null
    importe: Decimal | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type ConceptoCountAggregateOutputType = {
    id: number
    tenant_id: number
    proyecto_id: number
    presupuesto_id: number
    clave: number
    descripcion: number
    unidad_medida: number
    cantidad: number
    precio_unitario: number
    importe: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type ConceptoAvgAggregateInputType = {
    cantidad?: true
    precio_unitario?: true
    importe?: true
  }

  export type ConceptoSumAggregateInputType = {
    cantidad?: true
    precio_unitario?: true
    importe?: true
  }

  export type ConceptoMinAggregateInputType = {
    id?: true
    tenant_id?: true
    proyecto_id?: true
    presupuesto_id?: true
    clave?: true
    descripcion?: true
    unidad_medida?: true
    cantidad?: true
    precio_unitario?: true
    importe?: true
    created_at?: true
    updated_at?: true
  }

  export type ConceptoMaxAggregateInputType = {
    id?: true
    tenant_id?: true
    proyecto_id?: true
    presupuesto_id?: true
    clave?: true
    descripcion?: true
    unidad_medida?: true
    cantidad?: true
    precio_unitario?: true
    importe?: true
    created_at?: true
    updated_at?: true
  }

  export type ConceptoCountAggregateInputType = {
    id?: true
    tenant_id?: true
    proyecto_id?: true
    presupuesto_id?: true
    clave?: true
    descripcion?: true
    unidad_medida?: true
    cantidad?: true
    precio_unitario?: true
    importe?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type ConceptoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Concepto to aggregate.
     */
    where?: ConceptoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Conceptos to fetch.
     */
    orderBy?: ConceptoOrderByWithRelationInput | ConceptoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ConceptoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Conceptos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Conceptos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Conceptos
    **/
    _count?: true | ConceptoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ConceptoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ConceptoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ConceptoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ConceptoMaxAggregateInputType
  }

  export type GetConceptoAggregateType<T extends ConceptoAggregateArgs> = {
        [P in keyof T & keyof AggregateConcepto]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateConcepto[P]>
      : GetScalarType<T[P], AggregateConcepto[P]>
  }




  export type ConceptoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ConceptoWhereInput
    orderBy?: ConceptoOrderByWithAggregationInput | ConceptoOrderByWithAggregationInput[]
    by: ConceptoScalarFieldEnum[] | ConceptoScalarFieldEnum
    having?: ConceptoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ConceptoCountAggregateInputType | true
    _avg?: ConceptoAvgAggregateInputType
    _sum?: ConceptoSumAggregateInputType
    _min?: ConceptoMinAggregateInputType
    _max?: ConceptoMaxAggregateInputType
  }

  export type ConceptoGroupByOutputType = {
    id: string
    tenant_id: string
    proyecto_id: string
    presupuesto_id: string
    clave: string
    descripcion: string
    unidad_medida: string
    cantidad: Decimal
    precio_unitario: Decimal
    importe: Decimal
    created_at: Date
    updated_at: Date
    _count: ConceptoCountAggregateOutputType | null
    _avg: ConceptoAvgAggregateOutputType | null
    _sum: ConceptoSumAggregateOutputType | null
    _min: ConceptoMinAggregateOutputType | null
    _max: ConceptoMaxAggregateOutputType | null
  }

  type GetConceptoGroupByPayload<T extends ConceptoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ConceptoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ConceptoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ConceptoGroupByOutputType[P]>
            : GetScalarType<T[P], ConceptoGroupByOutputType[P]>
        }
      >
    >


  export type ConceptoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    presupuesto_id?: boolean
    clave?: boolean
    descripcion?: boolean
    unidad_medida?: boolean
    cantidad?: boolean
    precio_unitario?: boolean
    importe?: boolean
    created_at?: boolean
    updated_at?: boolean
    presupuesto?: boolean | PresupuestoBaseDefaultArgs<ExtArgs>
    insumos?: boolean | Concepto$insumosArgs<ExtArgs>
    _count?: boolean | ConceptoCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["concepto"]>

  export type ConceptoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    presupuesto_id?: boolean
    clave?: boolean
    descripcion?: boolean
    unidad_medida?: boolean
    cantidad?: boolean
    precio_unitario?: boolean
    importe?: boolean
    created_at?: boolean
    updated_at?: boolean
    presupuesto?: boolean | PresupuestoBaseDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["concepto"]>

  export type ConceptoSelectScalar = {
    id?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    presupuesto_id?: boolean
    clave?: boolean
    descripcion?: boolean
    unidad_medida?: boolean
    cantidad?: boolean
    precio_unitario?: boolean
    importe?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type ConceptoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    presupuesto?: boolean | PresupuestoBaseDefaultArgs<ExtArgs>
    insumos?: boolean | Concepto$insumosArgs<ExtArgs>
    _count?: boolean | ConceptoCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ConceptoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    presupuesto?: boolean | PresupuestoBaseDefaultArgs<ExtArgs>
  }

  export type $ConceptoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Concepto"
    objects: {
      presupuesto: Prisma.$PresupuestoBasePayload<ExtArgs>
      insumos: Prisma.$ConceptoInsumoPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenant_id: string
      proyecto_id: string
      presupuesto_id: string
      clave: string
      descripcion: string
      unidad_medida: string
      cantidad: Prisma.Decimal
      precio_unitario: Prisma.Decimal
      importe: Prisma.Decimal
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["concepto"]>
    composites: {}
  }

  type ConceptoGetPayload<S extends boolean | null | undefined | ConceptoDefaultArgs> = $Result.GetResult<Prisma.$ConceptoPayload, S>

  type ConceptoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ConceptoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ConceptoCountAggregateInputType | true
    }

  export interface ConceptoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Concepto'], meta: { name: 'Concepto' } }
    /**
     * Find zero or one Concepto that matches the filter.
     * @param {ConceptoFindUniqueArgs} args - Arguments to find a Concepto
     * @example
     * // Get one Concepto
     * const concepto = await prisma.concepto.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ConceptoFindUniqueArgs>(args: SelectSubset<T, ConceptoFindUniqueArgs<ExtArgs>>): Prisma__ConceptoClient<$Result.GetResult<Prisma.$ConceptoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Concepto that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ConceptoFindUniqueOrThrowArgs} args - Arguments to find a Concepto
     * @example
     * // Get one Concepto
     * const concepto = await prisma.concepto.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ConceptoFindUniqueOrThrowArgs>(args: SelectSubset<T, ConceptoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ConceptoClient<$Result.GetResult<Prisma.$ConceptoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Concepto that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConceptoFindFirstArgs} args - Arguments to find a Concepto
     * @example
     * // Get one Concepto
     * const concepto = await prisma.concepto.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ConceptoFindFirstArgs>(args?: SelectSubset<T, ConceptoFindFirstArgs<ExtArgs>>): Prisma__ConceptoClient<$Result.GetResult<Prisma.$ConceptoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Concepto that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConceptoFindFirstOrThrowArgs} args - Arguments to find a Concepto
     * @example
     * // Get one Concepto
     * const concepto = await prisma.concepto.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ConceptoFindFirstOrThrowArgs>(args?: SelectSubset<T, ConceptoFindFirstOrThrowArgs<ExtArgs>>): Prisma__ConceptoClient<$Result.GetResult<Prisma.$ConceptoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Conceptos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConceptoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Conceptos
     * const conceptos = await prisma.concepto.findMany()
     * 
     * // Get first 10 Conceptos
     * const conceptos = await prisma.concepto.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const conceptoWithIdOnly = await prisma.concepto.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ConceptoFindManyArgs>(args?: SelectSubset<T, ConceptoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConceptoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Concepto.
     * @param {ConceptoCreateArgs} args - Arguments to create a Concepto.
     * @example
     * // Create one Concepto
     * const Concepto = await prisma.concepto.create({
     *   data: {
     *     // ... data to create a Concepto
     *   }
     * })
     * 
     */
    create<T extends ConceptoCreateArgs>(args: SelectSubset<T, ConceptoCreateArgs<ExtArgs>>): Prisma__ConceptoClient<$Result.GetResult<Prisma.$ConceptoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Conceptos.
     * @param {ConceptoCreateManyArgs} args - Arguments to create many Conceptos.
     * @example
     * // Create many Conceptos
     * const concepto = await prisma.concepto.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ConceptoCreateManyArgs>(args?: SelectSubset<T, ConceptoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Conceptos and returns the data saved in the database.
     * @param {ConceptoCreateManyAndReturnArgs} args - Arguments to create many Conceptos.
     * @example
     * // Create many Conceptos
     * const concepto = await prisma.concepto.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Conceptos and only return the `id`
     * const conceptoWithIdOnly = await prisma.concepto.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ConceptoCreateManyAndReturnArgs>(args?: SelectSubset<T, ConceptoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConceptoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Concepto.
     * @param {ConceptoDeleteArgs} args - Arguments to delete one Concepto.
     * @example
     * // Delete one Concepto
     * const Concepto = await prisma.concepto.delete({
     *   where: {
     *     // ... filter to delete one Concepto
     *   }
     * })
     * 
     */
    delete<T extends ConceptoDeleteArgs>(args: SelectSubset<T, ConceptoDeleteArgs<ExtArgs>>): Prisma__ConceptoClient<$Result.GetResult<Prisma.$ConceptoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Concepto.
     * @param {ConceptoUpdateArgs} args - Arguments to update one Concepto.
     * @example
     * // Update one Concepto
     * const concepto = await prisma.concepto.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ConceptoUpdateArgs>(args: SelectSubset<T, ConceptoUpdateArgs<ExtArgs>>): Prisma__ConceptoClient<$Result.GetResult<Prisma.$ConceptoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Conceptos.
     * @param {ConceptoDeleteManyArgs} args - Arguments to filter Conceptos to delete.
     * @example
     * // Delete a few Conceptos
     * const { count } = await prisma.concepto.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ConceptoDeleteManyArgs>(args?: SelectSubset<T, ConceptoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Conceptos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConceptoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Conceptos
     * const concepto = await prisma.concepto.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ConceptoUpdateManyArgs>(args: SelectSubset<T, ConceptoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Concepto.
     * @param {ConceptoUpsertArgs} args - Arguments to update or create a Concepto.
     * @example
     * // Update or create a Concepto
     * const concepto = await prisma.concepto.upsert({
     *   create: {
     *     // ... data to create a Concepto
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Concepto we want to update
     *   }
     * })
     */
    upsert<T extends ConceptoUpsertArgs>(args: SelectSubset<T, ConceptoUpsertArgs<ExtArgs>>): Prisma__ConceptoClient<$Result.GetResult<Prisma.$ConceptoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Conceptos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConceptoCountArgs} args - Arguments to filter Conceptos to count.
     * @example
     * // Count the number of Conceptos
     * const count = await prisma.concepto.count({
     *   where: {
     *     // ... the filter for the Conceptos we want to count
     *   }
     * })
    **/
    count<T extends ConceptoCountArgs>(
      args?: Subset<T, ConceptoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ConceptoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Concepto.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConceptoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ConceptoAggregateArgs>(args: Subset<T, ConceptoAggregateArgs>): Prisma.PrismaPromise<GetConceptoAggregateType<T>>

    /**
     * Group by Concepto.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConceptoGroupByArgs} args - Group by arguments.
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
      T extends ConceptoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ConceptoGroupByArgs['orderBy'] }
        : { orderBy?: ConceptoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ConceptoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetConceptoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Concepto model
   */
  readonly fields: ConceptoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Concepto.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ConceptoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    presupuesto<T extends PresupuestoBaseDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PresupuestoBaseDefaultArgs<ExtArgs>>): Prisma__PresupuestoBaseClient<$Result.GetResult<Prisma.$PresupuestoBasePayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    insumos<T extends Concepto$insumosArgs<ExtArgs> = {}>(args?: Subset<T, Concepto$insumosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConceptoInsumoPayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the Concepto model
   */ 
  interface ConceptoFieldRefs {
    readonly id: FieldRef<"Concepto", 'String'>
    readonly tenant_id: FieldRef<"Concepto", 'String'>
    readonly proyecto_id: FieldRef<"Concepto", 'String'>
    readonly presupuesto_id: FieldRef<"Concepto", 'String'>
    readonly clave: FieldRef<"Concepto", 'String'>
    readonly descripcion: FieldRef<"Concepto", 'String'>
    readonly unidad_medida: FieldRef<"Concepto", 'String'>
    readonly cantidad: FieldRef<"Concepto", 'Decimal'>
    readonly precio_unitario: FieldRef<"Concepto", 'Decimal'>
    readonly importe: FieldRef<"Concepto", 'Decimal'>
    readonly created_at: FieldRef<"Concepto", 'DateTime'>
    readonly updated_at: FieldRef<"Concepto", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Concepto findUnique
   */
  export type ConceptoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Concepto
     */
    select?: ConceptoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConceptoInclude<ExtArgs> | null
    /**
     * Filter, which Concepto to fetch.
     */
    where: ConceptoWhereUniqueInput
  }

  /**
   * Concepto findUniqueOrThrow
   */
  export type ConceptoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Concepto
     */
    select?: ConceptoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConceptoInclude<ExtArgs> | null
    /**
     * Filter, which Concepto to fetch.
     */
    where: ConceptoWhereUniqueInput
  }

  /**
   * Concepto findFirst
   */
  export type ConceptoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Concepto
     */
    select?: ConceptoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConceptoInclude<ExtArgs> | null
    /**
     * Filter, which Concepto to fetch.
     */
    where?: ConceptoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Conceptos to fetch.
     */
    orderBy?: ConceptoOrderByWithRelationInput | ConceptoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Conceptos.
     */
    cursor?: ConceptoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Conceptos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Conceptos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Conceptos.
     */
    distinct?: ConceptoScalarFieldEnum | ConceptoScalarFieldEnum[]
  }

  /**
   * Concepto findFirstOrThrow
   */
  export type ConceptoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Concepto
     */
    select?: ConceptoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConceptoInclude<ExtArgs> | null
    /**
     * Filter, which Concepto to fetch.
     */
    where?: ConceptoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Conceptos to fetch.
     */
    orderBy?: ConceptoOrderByWithRelationInput | ConceptoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Conceptos.
     */
    cursor?: ConceptoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Conceptos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Conceptos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Conceptos.
     */
    distinct?: ConceptoScalarFieldEnum | ConceptoScalarFieldEnum[]
  }

  /**
   * Concepto findMany
   */
  export type ConceptoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Concepto
     */
    select?: ConceptoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConceptoInclude<ExtArgs> | null
    /**
     * Filter, which Conceptos to fetch.
     */
    where?: ConceptoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Conceptos to fetch.
     */
    orderBy?: ConceptoOrderByWithRelationInput | ConceptoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Conceptos.
     */
    cursor?: ConceptoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Conceptos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Conceptos.
     */
    skip?: number
    distinct?: ConceptoScalarFieldEnum | ConceptoScalarFieldEnum[]
  }

  /**
   * Concepto create
   */
  export type ConceptoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Concepto
     */
    select?: ConceptoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConceptoInclude<ExtArgs> | null
    /**
     * The data needed to create a Concepto.
     */
    data: XOR<ConceptoCreateInput, ConceptoUncheckedCreateInput>
  }

  /**
   * Concepto createMany
   */
  export type ConceptoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Conceptos.
     */
    data: ConceptoCreateManyInput | ConceptoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Concepto createManyAndReturn
   */
  export type ConceptoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Concepto
     */
    select?: ConceptoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Conceptos.
     */
    data: ConceptoCreateManyInput | ConceptoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConceptoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Concepto update
   */
  export type ConceptoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Concepto
     */
    select?: ConceptoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConceptoInclude<ExtArgs> | null
    /**
     * The data needed to update a Concepto.
     */
    data: XOR<ConceptoUpdateInput, ConceptoUncheckedUpdateInput>
    /**
     * Choose, which Concepto to update.
     */
    where: ConceptoWhereUniqueInput
  }

  /**
   * Concepto updateMany
   */
  export type ConceptoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Conceptos.
     */
    data: XOR<ConceptoUpdateManyMutationInput, ConceptoUncheckedUpdateManyInput>
    /**
     * Filter which Conceptos to update
     */
    where?: ConceptoWhereInput
  }

  /**
   * Concepto upsert
   */
  export type ConceptoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Concepto
     */
    select?: ConceptoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConceptoInclude<ExtArgs> | null
    /**
     * The filter to search for the Concepto to update in case it exists.
     */
    where: ConceptoWhereUniqueInput
    /**
     * In case the Concepto found by the `where` argument doesn't exist, create a new Concepto with this data.
     */
    create: XOR<ConceptoCreateInput, ConceptoUncheckedCreateInput>
    /**
     * In case the Concepto was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ConceptoUpdateInput, ConceptoUncheckedUpdateInput>
  }

  /**
   * Concepto delete
   */
  export type ConceptoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Concepto
     */
    select?: ConceptoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConceptoInclude<ExtArgs> | null
    /**
     * Filter which Concepto to delete.
     */
    where: ConceptoWhereUniqueInput
  }

  /**
   * Concepto deleteMany
   */
  export type ConceptoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Conceptos to delete
     */
    where?: ConceptoWhereInput
  }

  /**
   * Concepto.insumos
   */
  export type Concepto$insumosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConceptoInsumo
     */
    select?: ConceptoInsumoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConceptoInsumoInclude<ExtArgs> | null
    where?: ConceptoInsumoWhereInput
    orderBy?: ConceptoInsumoOrderByWithRelationInput | ConceptoInsumoOrderByWithRelationInput[]
    cursor?: ConceptoInsumoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ConceptoInsumoScalarFieldEnum | ConceptoInsumoScalarFieldEnum[]
  }

  /**
   * Concepto without action
   */
  export type ConceptoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Concepto
     */
    select?: ConceptoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConceptoInclude<ExtArgs> | null
  }


  /**
   * Model ConceptoInsumo
   */

  export type AggregateConceptoInsumo = {
    _count: ConceptoInsumoCountAggregateOutputType | null
    _avg: ConceptoInsumoAvgAggregateOutputType | null
    _sum: ConceptoInsumoSumAggregateOutputType | null
    _min: ConceptoInsumoMinAggregateOutputType | null
    _max: ConceptoInsumoMaxAggregateOutputType | null
  }

  export type ConceptoInsumoAvgAggregateOutputType = {
    cantidad: Decimal | null
    rendimiento: Decimal | null
    costo_unitario: Decimal | null
  }

  export type ConceptoInsumoSumAggregateOutputType = {
    cantidad: Decimal | null
    rendimiento: Decimal | null
    costo_unitario: Decimal | null
  }

  export type ConceptoInsumoMinAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    proyecto_id: string | null
    concepto_id: string | null
    insumo_id: string | null
    tipo_insumo: $Enums.TipoInsumo | null
    cantidad: Decimal | null
    rendimiento: Decimal | null
    costo_unitario: Decimal | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type ConceptoInsumoMaxAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    proyecto_id: string | null
    concepto_id: string | null
    insumo_id: string | null
    tipo_insumo: $Enums.TipoInsumo | null
    cantidad: Decimal | null
    rendimiento: Decimal | null
    costo_unitario: Decimal | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type ConceptoInsumoCountAggregateOutputType = {
    id: number
    tenant_id: number
    proyecto_id: number
    concepto_id: number
    insumo_id: number
    tipo_insumo: number
    cantidad: number
    rendimiento: number
    costo_unitario: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type ConceptoInsumoAvgAggregateInputType = {
    cantidad?: true
    rendimiento?: true
    costo_unitario?: true
  }

  export type ConceptoInsumoSumAggregateInputType = {
    cantidad?: true
    rendimiento?: true
    costo_unitario?: true
  }

  export type ConceptoInsumoMinAggregateInputType = {
    id?: true
    tenant_id?: true
    proyecto_id?: true
    concepto_id?: true
    insumo_id?: true
    tipo_insumo?: true
    cantidad?: true
    rendimiento?: true
    costo_unitario?: true
    created_at?: true
    updated_at?: true
  }

  export type ConceptoInsumoMaxAggregateInputType = {
    id?: true
    tenant_id?: true
    proyecto_id?: true
    concepto_id?: true
    insumo_id?: true
    tipo_insumo?: true
    cantidad?: true
    rendimiento?: true
    costo_unitario?: true
    created_at?: true
    updated_at?: true
  }

  export type ConceptoInsumoCountAggregateInputType = {
    id?: true
    tenant_id?: true
    proyecto_id?: true
    concepto_id?: true
    insumo_id?: true
    tipo_insumo?: true
    cantidad?: true
    rendimiento?: true
    costo_unitario?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type ConceptoInsumoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ConceptoInsumo to aggregate.
     */
    where?: ConceptoInsumoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConceptoInsumos to fetch.
     */
    orderBy?: ConceptoInsumoOrderByWithRelationInput | ConceptoInsumoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ConceptoInsumoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConceptoInsumos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConceptoInsumos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ConceptoInsumos
    **/
    _count?: true | ConceptoInsumoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ConceptoInsumoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ConceptoInsumoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ConceptoInsumoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ConceptoInsumoMaxAggregateInputType
  }

  export type GetConceptoInsumoAggregateType<T extends ConceptoInsumoAggregateArgs> = {
        [P in keyof T & keyof AggregateConceptoInsumo]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateConceptoInsumo[P]>
      : GetScalarType<T[P], AggregateConceptoInsumo[P]>
  }




  export type ConceptoInsumoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ConceptoInsumoWhereInput
    orderBy?: ConceptoInsumoOrderByWithAggregationInput | ConceptoInsumoOrderByWithAggregationInput[]
    by: ConceptoInsumoScalarFieldEnum[] | ConceptoInsumoScalarFieldEnum
    having?: ConceptoInsumoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ConceptoInsumoCountAggregateInputType | true
    _avg?: ConceptoInsumoAvgAggregateInputType
    _sum?: ConceptoInsumoSumAggregateInputType
    _min?: ConceptoInsumoMinAggregateInputType
    _max?: ConceptoInsumoMaxAggregateInputType
  }

  export type ConceptoInsumoGroupByOutputType = {
    id: string
    tenant_id: string
    proyecto_id: string
    concepto_id: string
    insumo_id: string
    tipo_insumo: $Enums.TipoInsumo
    cantidad: Decimal
    rendimiento: Decimal
    costo_unitario: Decimal
    created_at: Date
    updated_at: Date
    _count: ConceptoInsumoCountAggregateOutputType | null
    _avg: ConceptoInsumoAvgAggregateOutputType | null
    _sum: ConceptoInsumoSumAggregateOutputType | null
    _min: ConceptoInsumoMinAggregateOutputType | null
    _max: ConceptoInsumoMaxAggregateOutputType | null
  }

  type GetConceptoInsumoGroupByPayload<T extends ConceptoInsumoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ConceptoInsumoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ConceptoInsumoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ConceptoInsumoGroupByOutputType[P]>
            : GetScalarType<T[P], ConceptoInsumoGroupByOutputType[P]>
        }
      >
    >


  export type ConceptoInsumoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    concepto_id?: boolean
    insumo_id?: boolean
    tipo_insumo?: boolean
    cantidad?: boolean
    rendimiento?: boolean
    costo_unitario?: boolean
    created_at?: boolean
    updated_at?: boolean
    concepto?: boolean | ConceptoDefaultArgs<ExtArgs>
    insumo?: boolean | InsumoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["conceptoInsumo"]>

  export type ConceptoInsumoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    concepto_id?: boolean
    insumo_id?: boolean
    tipo_insumo?: boolean
    cantidad?: boolean
    rendimiento?: boolean
    costo_unitario?: boolean
    created_at?: boolean
    updated_at?: boolean
    concepto?: boolean | ConceptoDefaultArgs<ExtArgs>
    insumo?: boolean | InsumoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["conceptoInsumo"]>

  export type ConceptoInsumoSelectScalar = {
    id?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    concepto_id?: boolean
    insumo_id?: boolean
    tipo_insumo?: boolean
    cantidad?: boolean
    rendimiento?: boolean
    costo_unitario?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type ConceptoInsumoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    concepto?: boolean | ConceptoDefaultArgs<ExtArgs>
    insumo?: boolean | InsumoDefaultArgs<ExtArgs>
  }
  export type ConceptoInsumoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    concepto?: boolean | ConceptoDefaultArgs<ExtArgs>
    insumo?: boolean | InsumoDefaultArgs<ExtArgs>
  }

  export type $ConceptoInsumoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ConceptoInsumo"
    objects: {
      concepto: Prisma.$ConceptoPayload<ExtArgs>
      insumo: Prisma.$InsumoPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenant_id: string
      proyecto_id: string
      concepto_id: string
      insumo_id: string
      tipo_insumo: $Enums.TipoInsumo
      /**
       * Cantidad del insumo por unidad de concepto (ej. 0.15 M3 de oxígeno por M3 excavado)
       */
      cantidad: Prisma.Decimal
      /**
       * Rendimiento: unidades de producción por jornada/hora (OPUS: col "Rendimiento")
       */
      rendimiento: Prisma.Decimal
      /**
       * Costo unitario del insumo al momento de importación del APU
       */
      costo_unitario: Prisma.Decimal
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["conceptoInsumo"]>
    composites: {}
  }

  type ConceptoInsumoGetPayload<S extends boolean | null | undefined | ConceptoInsumoDefaultArgs> = $Result.GetResult<Prisma.$ConceptoInsumoPayload, S>

  type ConceptoInsumoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ConceptoInsumoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ConceptoInsumoCountAggregateInputType | true
    }

  export interface ConceptoInsumoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ConceptoInsumo'], meta: { name: 'ConceptoInsumo' } }
    /**
     * Find zero or one ConceptoInsumo that matches the filter.
     * @param {ConceptoInsumoFindUniqueArgs} args - Arguments to find a ConceptoInsumo
     * @example
     * // Get one ConceptoInsumo
     * const conceptoInsumo = await prisma.conceptoInsumo.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ConceptoInsumoFindUniqueArgs>(args: SelectSubset<T, ConceptoInsumoFindUniqueArgs<ExtArgs>>): Prisma__ConceptoInsumoClient<$Result.GetResult<Prisma.$ConceptoInsumoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ConceptoInsumo that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ConceptoInsumoFindUniqueOrThrowArgs} args - Arguments to find a ConceptoInsumo
     * @example
     * // Get one ConceptoInsumo
     * const conceptoInsumo = await prisma.conceptoInsumo.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ConceptoInsumoFindUniqueOrThrowArgs>(args: SelectSubset<T, ConceptoInsumoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ConceptoInsumoClient<$Result.GetResult<Prisma.$ConceptoInsumoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ConceptoInsumo that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConceptoInsumoFindFirstArgs} args - Arguments to find a ConceptoInsumo
     * @example
     * // Get one ConceptoInsumo
     * const conceptoInsumo = await prisma.conceptoInsumo.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ConceptoInsumoFindFirstArgs>(args?: SelectSubset<T, ConceptoInsumoFindFirstArgs<ExtArgs>>): Prisma__ConceptoInsumoClient<$Result.GetResult<Prisma.$ConceptoInsumoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ConceptoInsumo that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConceptoInsumoFindFirstOrThrowArgs} args - Arguments to find a ConceptoInsumo
     * @example
     * // Get one ConceptoInsumo
     * const conceptoInsumo = await prisma.conceptoInsumo.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ConceptoInsumoFindFirstOrThrowArgs>(args?: SelectSubset<T, ConceptoInsumoFindFirstOrThrowArgs<ExtArgs>>): Prisma__ConceptoInsumoClient<$Result.GetResult<Prisma.$ConceptoInsumoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ConceptoInsumos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConceptoInsumoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ConceptoInsumos
     * const conceptoInsumos = await prisma.conceptoInsumo.findMany()
     * 
     * // Get first 10 ConceptoInsumos
     * const conceptoInsumos = await prisma.conceptoInsumo.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const conceptoInsumoWithIdOnly = await prisma.conceptoInsumo.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ConceptoInsumoFindManyArgs>(args?: SelectSubset<T, ConceptoInsumoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConceptoInsumoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ConceptoInsumo.
     * @param {ConceptoInsumoCreateArgs} args - Arguments to create a ConceptoInsumo.
     * @example
     * // Create one ConceptoInsumo
     * const ConceptoInsumo = await prisma.conceptoInsumo.create({
     *   data: {
     *     // ... data to create a ConceptoInsumo
     *   }
     * })
     * 
     */
    create<T extends ConceptoInsumoCreateArgs>(args: SelectSubset<T, ConceptoInsumoCreateArgs<ExtArgs>>): Prisma__ConceptoInsumoClient<$Result.GetResult<Prisma.$ConceptoInsumoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ConceptoInsumos.
     * @param {ConceptoInsumoCreateManyArgs} args - Arguments to create many ConceptoInsumos.
     * @example
     * // Create many ConceptoInsumos
     * const conceptoInsumo = await prisma.conceptoInsumo.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ConceptoInsumoCreateManyArgs>(args?: SelectSubset<T, ConceptoInsumoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ConceptoInsumos and returns the data saved in the database.
     * @param {ConceptoInsumoCreateManyAndReturnArgs} args - Arguments to create many ConceptoInsumos.
     * @example
     * // Create many ConceptoInsumos
     * const conceptoInsumo = await prisma.conceptoInsumo.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ConceptoInsumos and only return the `id`
     * const conceptoInsumoWithIdOnly = await prisma.conceptoInsumo.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ConceptoInsumoCreateManyAndReturnArgs>(args?: SelectSubset<T, ConceptoInsumoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConceptoInsumoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ConceptoInsumo.
     * @param {ConceptoInsumoDeleteArgs} args - Arguments to delete one ConceptoInsumo.
     * @example
     * // Delete one ConceptoInsumo
     * const ConceptoInsumo = await prisma.conceptoInsumo.delete({
     *   where: {
     *     // ... filter to delete one ConceptoInsumo
     *   }
     * })
     * 
     */
    delete<T extends ConceptoInsumoDeleteArgs>(args: SelectSubset<T, ConceptoInsumoDeleteArgs<ExtArgs>>): Prisma__ConceptoInsumoClient<$Result.GetResult<Prisma.$ConceptoInsumoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ConceptoInsumo.
     * @param {ConceptoInsumoUpdateArgs} args - Arguments to update one ConceptoInsumo.
     * @example
     * // Update one ConceptoInsumo
     * const conceptoInsumo = await prisma.conceptoInsumo.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ConceptoInsumoUpdateArgs>(args: SelectSubset<T, ConceptoInsumoUpdateArgs<ExtArgs>>): Prisma__ConceptoInsumoClient<$Result.GetResult<Prisma.$ConceptoInsumoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ConceptoInsumos.
     * @param {ConceptoInsumoDeleteManyArgs} args - Arguments to filter ConceptoInsumos to delete.
     * @example
     * // Delete a few ConceptoInsumos
     * const { count } = await prisma.conceptoInsumo.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ConceptoInsumoDeleteManyArgs>(args?: SelectSubset<T, ConceptoInsumoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ConceptoInsumos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConceptoInsumoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ConceptoInsumos
     * const conceptoInsumo = await prisma.conceptoInsumo.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ConceptoInsumoUpdateManyArgs>(args: SelectSubset<T, ConceptoInsumoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ConceptoInsumo.
     * @param {ConceptoInsumoUpsertArgs} args - Arguments to update or create a ConceptoInsumo.
     * @example
     * // Update or create a ConceptoInsumo
     * const conceptoInsumo = await prisma.conceptoInsumo.upsert({
     *   create: {
     *     // ... data to create a ConceptoInsumo
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ConceptoInsumo we want to update
     *   }
     * })
     */
    upsert<T extends ConceptoInsumoUpsertArgs>(args: SelectSubset<T, ConceptoInsumoUpsertArgs<ExtArgs>>): Prisma__ConceptoInsumoClient<$Result.GetResult<Prisma.$ConceptoInsumoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ConceptoInsumos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConceptoInsumoCountArgs} args - Arguments to filter ConceptoInsumos to count.
     * @example
     * // Count the number of ConceptoInsumos
     * const count = await prisma.conceptoInsumo.count({
     *   where: {
     *     // ... the filter for the ConceptoInsumos we want to count
     *   }
     * })
    **/
    count<T extends ConceptoInsumoCountArgs>(
      args?: Subset<T, ConceptoInsumoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ConceptoInsumoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ConceptoInsumo.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConceptoInsumoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ConceptoInsumoAggregateArgs>(args: Subset<T, ConceptoInsumoAggregateArgs>): Prisma.PrismaPromise<GetConceptoInsumoAggregateType<T>>

    /**
     * Group by ConceptoInsumo.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConceptoInsumoGroupByArgs} args - Group by arguments.
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
      T extends ConceptoInsumoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ConceptoInsumoGroupByArgs['orderBy'] }
        : { orderBy?: ConceptoInsumoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ConceptoInsumoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetConceptoInsumoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ConceptoInsumo model
   */
  readonly fields: ConceptoInsumoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ConceptoInsumo.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ConceptoInsumoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    concepto<T extends ConceptoDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ConceptoDefaultArgs<ExtArgs>>): Prisma__ConceptoClient<$Result.GetResult<Prisma.$ConceptoPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    insumo<T extends InsumoDefaultArgs<ExtArgs> = {}>(args?: Subset<T, InsumoDefaultArgs<ExtArgs>>): Prisma__InsumoClient<$Result.GetResult<Prisma.$InsumoPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
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
   * Fields of the ConceptoInsumo model
   */ 
  interface ConceptoInsumoFieldRefs {
    readonly id: FieldRef<"ConceptoInsumo", 'String'>
    readonly tenant_id: FieldRef<"ConceptoInsumo", 'String'>
    readonly proyecto_id: FieldRef<"ConceptoInsumo", 'String'>
    readonly concepto_id: FieldRef<"ConceptoInsumo", 'String'>
    readonly insumo_id: FieldRef<"ConceptoInsumo", 'String'>
    readonly tipo_insumo: FieldRef<"ConceptoInsumo", 'TipoInsumo'>
    readonly cantidad: FieldRef<"ConceptoInsumo", 'Decimal'>
    readonly rendimiento: FieldRef<"ConceptoInsumo", 'Decimal'>
    readonly costo_unitario: FieldRef<"ConceptoInsumo", 'Decimal'>
    readonly created_at: FieldRef<"ConceptoInsumo", 'DateTime'>
    readonly updated_at: FieldRef<"ConceptoInsumo", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ConceptoInsumo findUnique
   */
  export type ConceptoInsumoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConceptoInsumo
     */
    select?: ConceptoInsumoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConceptoInsumoInclude<ExtArgs> | null
    /**
     * Filter, which ConceptoInsumo to fetch.
     */
    where: ConceptoInsumoWhereUniqueInput
  }

  /**
   * ConceptoInsumo findUniqueOrThrow
   */
  export type ConceptoInsumoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConceptoInsumo
     */
    select?: ConceptoInsumoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConceptoInsumoInclude<ExtArgs> | null
    /**
     * Filter, which ConceptoInsumo to fetch.
     */
    where: ConceptoInsumoWhereUniqueInput
  }

  /**
   * ConceptoInsumo findFirst
   */
  export type ConceptoInsumoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConceptoInsumo
     */
    select?: ConceptoInsumoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConceptoInsumoInclude<ExtArgs> | null
    /**
     * Filter, which ConceptoInsumo to fetch.
     */
    where?: ConceptoInsumoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConceptoInsumos to fetch.
     */
    orderBy?: ConceptoInsumoOrderByWithRelationInput | ConceptoInsumoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ConceptoInsumos.
     */
    cursor?: ConceptoInsumoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConceptoInsumos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConceptoInsumos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ConceptoInsumos.
     */
    distinct?: ConceptoInsumoScalarFieldEnum | ConceptoInsumoScalarFieldEnum[]
  }

  /**
   * ConceptoInsumo findFirstOrThrow
   */
  export type ConceptoInsumoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConceptoInsumo
     */
    select?: ConceptoInsumoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConceptoInsumoInclude<ExtArgs> | null
    /**
     * Filter, which ConceptoInsumo to fetch.
     */
    where?: ConceptoInsumoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConceptoInsumos to fetch.
     */
    orderBy?: ConceptoInsumoOrderByWithRelationInput | ConceptoInsumoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ConceptoInsumos.
     */
    cursor?: ConceptoInsumoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConceptoInsumos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConceptoInsumos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ConceptoInsumos.
     */
    distinct?: ConceptoInsumoScalarFieldEnum | ConceptoInsumoScalarFieldEnum[]
  }

  /**
   * ConceptoInsumo findMany
   */
  export type ConceptoInsumoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConceptoInsumo
     */
    select?: ConceptoInsumoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConceptoInsumoInclude<ExtArgs> | null
    /**
     * Filter, which ConceptoInsumos to fetch.
     */
    where?: ConceptoInsumoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConceptoInsumos to fetch.
     */
    orderBy?: ConceptoInsumoOrderByWithRelationInput | ConceptoInsumoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ConceptoInsumos.
     */
    cursor?: ConceptoInsumoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConceptoInsumos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConceptoInsumos.
     */
    skip?: number
    distinct?: ConceptoInsumoScalarFieldEnum | ConceptoInsumoScalarFieldEnum[]
  }

  /**
   * ConceptoInsumo create
   */
  export type ConceptoInsumoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConceptoInsumo
     */
    select?: ConceptoInsumoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConceptoInsumoInclude<ExtArgs> | null
    /**
     * The data needed to create a ConceptoInsumo.
     */
    data: XOR<ConceptoInsumoCreateInput, ConceptoInsumoUncheckedCreateInput>
  }

  /**
   * ConceptoInsumo createMany
   */
  export type ConceptoInsumoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ConceptoInsumos.
     */
    data: ConceptoInsumoCreateManyInput | ConceptoInsumoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ConceptoInsumo createManyAndReturn
   */
  export type ConceptoInsumoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConceptoInsumo
     */
    select?: ConceptoInsumoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ConceptoInsumos.
     */
    data: ConceptoInsumoCreateManyInput | ConceptoInsumoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConceptoInsumoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ConceptoInsumo update
   */
  export type ConceptoInsumoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConceptoInsumo
     */
    select?: ConceptoInsumoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConceptoInsumoInclude<ExtArgs> | null
    /**
     * The data needed to update a ConceptoInsumo.
     */
    data: XOR<ConceptoInsumoUpdateInput, ConceptoInsumoUncheckedUpdateInput>
    /**
     * Choose, which ConceptoInsumo to update.
     */
    where: ConceptoInsumoWhereUniqueInput
  }

  /**
   * ConceptoInsumo updateMany
   */
  export type ConceptoInsumoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ConceptoInsumos.
     */
    data: XOR<ConceptoInsumoUpdateManyMutationInput, ConceptoInsumoUncheckedUpdateManyInput>
    /**
     * Filter which ConceptoInsumos to update
     */
    where?: ConceptoInsumoWhereInput
  }

  /**
   * ConceptoInsumo upsert
   */
  export type ConceptoInsumoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConceptoInsumo
     */
    select?: ConceptoInsumoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConceptoInsumoInclude<ExtArgs> | null
    /**
     * The filter to search for the ConceptoInsumo to update in case it exists.
     */
    where: ConceptoInsumoWhereUniqueInput
    /**
     * In case the ConceptoInsumo found by the `where` argument doesn't exist, create a new ConceptoInsumo with this data.
     */
    create: XOR<ConceptoInsumoCreateInput, ConceptoInsumoUncheckedCreateInput>
    /**
     * In case the ConceptoInsumo was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ConceptoInsumoUpdateInput, ConceptoInsumoUncheckedUpdateInput>
  }

  /**
   * ConceptoInsumo delete
   */
  export type ConceptoInsumoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConceptoInsumo
     */
    select?: ConceptoInsumoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConceptoInsumoInclude<ExtArgs> | null
    /**
     * Filter which ConceptoInsumo to delete.
     */
    where: ConceptoInsumoWhereUniqueInput
  }

  /**
   * ConceptoInsumo deleteMany
   */
  export type ConceptoInsumoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ConceptoInsumos to delete
     */
    where?: ConceptoInsumoWhereInput
  }

  /**
   * ConceptoInsumo without action
   */
  export type ConceptoInsumoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConceptoInsumo
     */
    select?: ConceptoInsumoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConceptoInsumoInclude<ExtArgs> | null
  }


  /**
   * Model SaldoPartida
   */

  export type AggregateSaldoPartida = {
    _count: SaldoPartidaCountAggregateOutputType | null
    _avg: SaldoPartidaAvgAggregateOutputType | null
    _sum: SaldoPartidaSumAggregateOutputType | null
    _min: SaldoPartidaMinAggregateOutputType | null
    _max: SaldoPartidaMaxAggregateOutputType | null
  }

  export type SaldoPartidaAvgAggregateOutputType = {
    monto_aprobado: Decimal | null
    monto_comprometido: Decimal | null
    monto_ejercido: Decimal | null
    monto_en_proceso: Decimal | null
    monto_disponible: Decimal | null
  }

  export type SaldoPartidaSumAggregateOutputType = {
    monto_aprobado: Decimal | null
    monto_comprometido: Decimal | null
    monto_ejercido: Decimal | null
    monto_en_proceso: Decimal | null
    monto_disponible: Decimal | null
  }

  export type SaldoPartidaMinAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    proyecto_id: string | null
    concepto_id: string | null
    concepto_clave: string | null
    concepto_desc: string | null
    monto_aprobado: Decimal | null
    monto_comprometido: Decimal | null
    monto_ejercido: Decimal | null
    monto_en_proceso: Decimal | null
    monto_disponible: Decimal | null
    estado_tope: string | null
    bloqueo_automatico: boolean | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type SaldoPartidaMaxAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    proyecto_id: string | null
    concepto_id: string | null
    concepto_clave: string | null
    concepto_desc: string | null
    monto_aprobado: Decimal | null
    monto_comprometido: Decimal | null
    monto_ejercido: Decimal | null
    monto_en_proceso: Decimal | null
    monto_disponible: Decimal | null
    estado_tope: string | null
    bloqueo_automatico: boolean | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type SaldoPartidaCountAggregateOutputType = {
    id: number
    tenant_id: number
    proyecto_id: number
    concepto_id: number
    concepto_clave: number
    concepto_desc: number
    monto_aprobado: number
    monto_comprometido: number
    monto_ejercido: number
    monto_en_proceso: number
    monto_disponible: number
    estado_tope: number
    bloqueo_automatico: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type SaldoPartidaAvgAggregateInputType = {
    monto_aprobado?: true
    monto_comprometido?: true
    monto_ejercido?: true
    monto_en_proceso?: true
    monto_disponible?: true
  }

  export type SaldoPartidaSumAggregateInputType = {
    monto_aprobado?: true
    monto_comprometido?: true
    monto_ejercido?: true
    monto_en_proceso?: true
    monto_disponible?: true
  }

  export type SaldoPartidaMinAggregateInputType = {
    id?: true
    tenant_id?: true
    proyecto_id?: true
    concepto_id?: true
    concepto_clave?: true
    concepto_desc?: true
    monto_aprobado?: true
    monto_comprometido?: true
    monto_ejercido?: true
    monto_en_proceso?: true
    monto_disponible?: true
    estado_tope?: true
    bloqueo_automatico?: true
    created_at?: true
    updated_at?: true
  }

  export type SaldoPartidaMaxAggregateInputType = {
    id?: true
    tenant_id?: true
    proyecto_id?: true
    concepto_id?: true
    concepto_clave?: true
    concepto_desc?: true
    monto_aprobado?: true
    monto_comprometido?: true
    monto_ejercido?: true
    monto_en_proceso?: true
    monto_disponible?: true
    estado_tope?: true
    bloqueo_automatico?: true
    created_at?: true
    updated_at?: true
  }

  export type SaldoPartidaCountAggregateInputType = {
    id?: true
    tenant_id?: true
    proyecto_id?: true
    concepto_id?: true
    concepto_clave?: true
    concepto_desc?: true
    monto_aprobado?: true
    monto_comprometido?: true
    monto_ejercido?: true
    monto_en_proceso?: true
    monto_disponible?: true
    estado_tope?: true
    bloqueo_automatico?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type SaldoPartidaAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SaldoPartida to aggregate.
     */
    where?: SaldoPartidaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SaldoPartidas to fetch.
     */
    orderBy?: SaldoPartidaOrderByWithRelationInput | SaldoPartidaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SaldoPartidaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SaldoPartidas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SaldoPartidas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SaldoPartidas
    **/
    _count?: true | SaldoPartidaCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SaldoPartidaAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SaldoPartidaSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SaldoPartidaMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SaldoPartidaMaxAggregateInputType
  }

  export type GetSaldoPartidaAggregateType<T extends SaldoPartidaAggregateArgs> = {
        [P in keyof T & keyof AggregateSaldoPartida]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSaldoPartida[P]>
      : GetScalarType<T[P], AggregateSaldoPartida[P]>
  }




  export type SaldoPartidaGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SaldoPartidaWhereInput
    orderBy?: SaldoPartidaOrderByWithAggregationInput | SaldoPartidaOrderByWithAggregationInput[]
    by: SaldoPartidaScalarFieldEnum[] | SaldoPartidaScalarFieldEnum
    having?: SaldoPartidaScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SaldoPartidaCountAggregateInputType | true
    _avg?: SaldoPartidaAvgAggregateInputType
    _sum?: SaldoPartidaSumAggregateInputType
    _min?: SaldoPartidaMinAggregateInputType
    _max?: SaldoPartidaMaxAggregateInputType
  }

  export type SaldoPartidaGroupByOutputType = {
    id: string
    tenant_id: string
    proyecto_id: string
    concepto_id: string
    concepto_clave: string
    concepto_desc: string
    monto_aprobado: Decimal
    monto_comprometido: Decimal
    monto_ejercido: Decimal
    monto_en_proceso: Decimal
    monto_disponible: Decimal
    estado_tope: string
    bloqueo_automatico: boolean
    created_at: Date
    updated_at: Date
    _count: SaldoPartidaCountAggregateOutputType | null
    _avg: SaldoPartidaAvgAggregateOutputType | null
    _sum: SaldoPartidaSumAggregateOutputType | null
    _min: SaldoPartidaMinAggregateOutputType | null
    _max: SaldoPartidaMaxAggregateOutputType | null
  }

  type GetSaldoPartidaGroupByPayload<T extends SaldoPartidaGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SaldoPartidaGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SaldoPartidaGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SaldoPartidaGroupByOutputType[P]>
            : GetScalarType<T[P], SaldoPartidaGroupByOutputType[P]>
        }
      >
    >


  export type SaldoPartidaSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    concepto_id?: boolean
    concepto_clave?: boolean
    concepto_desc?: boolean
    monto_aprobado?: boolean
    monto_comprometido?: boolean
    monto_ejercido?: boolean
    monto_en_proceso?: boolean
    monto_disponible?: boolean
    estado_tope?: boolean
    bloqueo_automatico?: boolean
    created_at?: boolean
    updated_at?: boolean
    movimientos?: boolean | SaldoPartida$movimientosArgs<ExtArgs>
    _count?: boolean | SaldoPartidaCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["saldoPartida"]>

  export type SaldoPartidaSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    concepto_id?: boolean
    concepto_clave?: boolean
    concepto_desc?: boolean
    monto_aprobado?: boolean
    monto_comprometido?: boolean
    monto_ejercido?: boolean
    monto_en_proceso?: boolean
    monto_disponible?: boolean
    estado_tope?: boolean
    bloqueo_automatico?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["saldoPartida"]>

  export type SaldoPartidaSelectScalar = {
    id?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    concepto_id?: boolean
    concepto_clave?: boolean
    concepto_desc?: boolean
    monto_aprobado?: boolean
    monto_comprometido?: boolean
    monto_ejercido?: boolean
    monto_en_proceso?: boolean
    monto_disponible?: boolean
    estado_tope?: boolean
    bloqueo_automatico?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type SaldoPartidaInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    movimientos?: boolean | SaldoPartida$movimientosArgs<ExtArgs>
    _count?: boolean | SaldoPartidaCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type SaldoPartidaIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $SaldoPartidaPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SaldoPartida"
    objects: {
      movimientos: Prisma.$SaldoMovimientoPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenant_id: string
      proyecto_id: string
      concepto_id: string
      concepto_clave: string
      concepto_desc: string
      monto_aprobado: Prisma.Decimal
      monto_comprometido: Prisma.Decimal
      monto_ejercido: Prisma.Decimal
      monto_en_proceso: Prisma.Decimal
      monto_disponible: Prisma.Decimal
      estado_tope: string
      bloqueo_automatico: boolean
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["saldoPartida"]>
    composites: {}
  }

  type SaldoPartidaGetPayload<S extends boolean | null | undefined | SaldoPartidaDefaultArgs> = $Result.GetResult<Prisma.$SaldoPartidaPayload, S>

  type SaldoPartidaCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<SaldoPartidaFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: SaldoPartidaCountAggregateInputType | true
    }

  export interface SaldoPartidaDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SaldoPartida'], meta: { name: 'SaldoPartida' } }
    /**
     * Find zero or one SaldoPartida that matches the filter.
     * @param {SaldoPartidaFindUniqueArgs} args - Arguments to find a SaldoPartida
     * @example
     * // Get one SaldoPartida
     * const saldoPartida = await prisma.saldoPartida.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SaldoPartidaFindUniqueArgs>(args: SelectSubset<T, SaldoPartidaFindUniqueArgs<ExtArgs>>): Prisma__SaldoPartidaClient<$Result.GetResult<Prisma.$SaldoPartidaPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one SaldoPartida that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {SaldoPartidaFindUniqueOrThrowArgs} args - Arguments to find a SaldoPartida
     * @example
     * // Get one SaldoPartida
     * const saldoPartida = await prisma.saldoPartida.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SaldoPartidaFindUniqueOrThrowArgs>(args: SelectSubset<T, SaldoPartidaFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SaldoPartidaClient<$Result.GetResult<Prisma.$SaldoPartidaPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first SaldoPartida that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SaldoPartidaFindFirstArgs} args - Arguments to find a SaldoPartida
     * @example
     * // Get one SaldoPartida
     * const saldoPartida = await prisma.saldoPartida.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SaldoPartidaFindFirstArgs>(args?: SelectSubset<T, SaldoPartidaFindFirstArgs<ExtArgs>>): Prisma__SaldoPartidaClient<$Result.GetResult<Prisma.$SaldoPartidaPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first SaldoPartida that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SaldoPartidaFindFirstOrThrowArgs} args - Arguments to find a SaldoPartida
     * @example
     * // Get one SaldoPartida
     * const saldoPartida = await prisma.saldoPartida.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SaldoPartidaFindFirstOrThrowArgs>(args?: SelectSubset<T, SaldoPartidaFindFirstOrThrowArgs<ExtArgs>>): Prisma__SaldoPartidaClient<$Result.GetResult<Prisma.$SaldoPartidaPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more SaldoPartidas that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SaldoPartidaFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SaldoPartidas
     * const saldoPartidas = await prisma.saldoPartida.findMany()
     * 
     * // Get first 10 SaldoPartidas
     * const saldoPartidas = await prisma.saldoPartida.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const saldoPartidaWithIdOnly = await prisma.saldoPartida.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SaldoPartidaFindManyArgs>(args?: SelectSubset<T, SaldoPartidaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SaldoPartidaPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a SaldoPartida.
     * @param {SaldoPartidaCreateArgs} args - Arguments to create a SaldoPartida.
     * @example
     * // Create one SaldoPartida
     * const SaldoPartida = await prisma.saldoPartida.create({
     *   data: {
     *     // ... data to create a SaldoPartida
     *   }
     * })
     * 
     */
    create<T extends SaldoPartidaCreateArgs>(args: SelectSubset<T, SaldoPartidaCreateArgs<ExtArgs>>): Prisma__SaldoPartidaClient<$Result.GetResult<Prisma.$SaldoPartidaPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many SaldoPartidas.
     * @param {SaldoPartidaCreateManyArgs} args - Arguments to create many SaldoPartidas.
     * @example
     * // Create many SaldoPartidas
     * const saldoPartida = await prisma.saldoPartida.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SaldoPartidaCreateManyArgs>(args?: SelectSubset<T, SaldoPartidaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SaldoPartidas and returns the data saved in the database.
     * @param {SaldoPartidaCreateManyAndReturnArgs} args - Arguments to create many SaldoPartidas.
     * @example
     * // Create many SaldoPartidas
     * const saldoPartida = await prisma.saldoPartida.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SaldoPartidas and only return the `id`
     * const saldoPartidaWithIdOnly = await prisma.saldoPartida.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SaldoPartidaCreateManyAndReturnArgs>(args?: SelectSubset<T, SaldoPartidaCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SaldoPartidaPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a SaldoPartida.
     * @param {SaldoPartidaDeleteArgs} args - Arguments to delete one SaldoPartida.
     * @example
     * // Delete one SaldoPartida
     * const SaldoPartida = await prisma.saldoPartida.delete({
     *   where: {
     *     // ... filter to delete one SaldoPartida
     *   }
     * })
     * 
     */
    delete<T extends SaldoPartidaDeleteArgs>(args: SelectSubset<T, SaldoPartidaDeleteArgs<ExtArgs>>): Prisma__SaldoPartidaClient<$Result.GetResult<Prisma.$SaldoPartidaPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one SaldoPartida.
     * @param {SaldoPartidaUpdateArgs} args - Arguments to update one SaldoPartida.
     * @example
     * // Update one SaldoPartida
     * const saldoPartida = await prisma.saldoPartida.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SaldoPartidaUpdateArgs>(args: SelectSubset<T, SaldoPartidaUpdateArgs<ExtArgs>>): Prisma__SaldoPartidaClient<$Result.GetResult<Prisma.$SaldoPartidaPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more SaldoPartidas.
     * @param {SaldoPartidaDeleteManyArgs} args - Arguments to filter SaldoPartidas to delete.
     * @example
     * // Delete a few SaldoPartidas
     * const { count } = await prisma.saldoPartida.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SaldoPartidaDeleteManyArgs>(args?: SelectSubset<T, SaldoPartidaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SaldoPartidas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SaldoPartidaUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SaldoPartidas
     * const saldoPartida = await prisma.saldoPartida.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SaldoPartidaUpdateManyArgs>(args: SelectSubset<T, SaldoPartidaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one SaldoPartida.
     * @param {SaldoPartidaUpsertArgs} args - Arguments to update or create a SaldoPartida.
     * @example
     * // Update or create a SaldoPartida
     * const saldoPartida = await prisma.saldoPartida.upsert({
     *   create: {
     *     // ... data to create a SaldoPartida
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SaldoPartida we want to update
     *   }
     * })
     */
    upsert<T extends SaldoPartidaUpsertArgs>(args: SelectSubset<T, SaldoPartidaUpsertArgs<ExtArgs>>): Prisma__SaldoPartidaClient<$Result.GetResult<Prisma.$SaldoPartidaPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of SaldoPartidas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SaldoPartidaCountArgs} args - Arguments to filter SaldoPartidas to count.
     * @example
     * // Count the number of SaldoPartidas
     * const count = await prisma.saldoPartida.count({
     *   where: {
     *     // ... the filter for the SaldoPartidas we want to count
     *   }
     * })
    **/
    count<T extends SaldoPartidaCountArgs>(
      args?: Subset<T, SaldoPartidaCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SaldoPartidaCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SaldoPartida.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SaldoPartidaAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends SaldoPartidaAggregateArgs>(args: Subset<T, SaldoPartidaAggregateArgs>): Prisma.PrismaPromise<GetSaldoPartidaAggregateType<T>>

    /**
     * Group by SaldoPartida.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SaldoPartidaGroupByArgs} args - Group by arguments.
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
      T extends SaldoPartidaGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SaldoPartidaGroupByArgs['orderBy'] }
        : { orderBy?: SaldoPartidaGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, SaldoPartidaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSaldoPartidaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SaldoPartida model
   */
  readonly fields: SaldoPartidaFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SaldoPartida.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SaldoPartidaClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    movimientos<T extends SaldoPartida$movimientosArgs<ExtArgs> = {}>(args?: Subset<T, SaldoPartida$movimientosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SaldoMovimientoPayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the SaldoPartida model
   */ 
  interface SaldoPartidaFieldRefs {
    readonly id: FieldRef<"SaldoPartida", 'String'>
    readonly tenant_id: FieldRef<"SaldoPartida", 'String'>
    readonly proyecto_id: FieldRef<"SaldoPartida", 'String'>
    readonly concepto_id: FieldRef<"SaldoPartida", 'String'>
    readonly concepto_clave: FieldRef<"SaldoPartida", 'String'>
    readonly concepto_desc: FieldRef<"SaldoPartida", 'String'>
    readonly monto_aprobado: FieldRef<"SaldoPartida", 'Decimal'>
    readonly monto_comprometido: FieldRef<"SaldoPartida", 'Decimal'>
    readonly monto_ejercido: FieldRef<"SaldoPartida", 'Decimal'>
    readonly monto_en_proceso: FieldRef<"SaldoPartida", 'Decimal'>
    readonly monto_disponible: FieldRef<"SaldoPartida", 'Decimal'>
    readonly estado_tope: FieldRef<"SaldoPartida", 'String'>
    readonly bloqueo_automatico: FieldRef<"SaldoPartida", 'Boolean'>
    readonly created_at: FieldRef<"SaldoPartida", 'DateTime'>
    readonly updated_at: FieldRef<"SaldoPartida", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * SaldoPartida findUnique
   */
  export type SaldoPartidaFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SaldoPartida
     */
    select?: SaldoPartidaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SaldoPartidaInclude<ExtArgs> | null
    /**
     * Filter, which SaldoPartida to fetch.
     */
    where: SaldoPartidaWhereUniqueInput
  }

  /**
   * SaldoPartida findUniqueOrThrow
   */
  export type SaldoPartidaFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SaldoPartida
     */
    select?: SaldoPartidaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SaldoPartidaInclude<ExtArgs> | null
    /**
     * Filter, which SaldoPartida to fetch.
     */
    where: SaldoPartidaWhereUniqueInput
  }

  /**
   * SaldoPartida findFirst
   */
  export type SaldoPartidaFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SaldoPartida
     */
    select?: SaldoPartidaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SaldoPartidaInclude<ExtArgs> | null
    /**
     * Filter, which SaldoPartida to fetch.
     */
    where?: SaldoPartidaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SaldoPartidas to fetch.
     */
    orderBy?: SaldoPartidaOrderByWithRelationInput | SaldoPartidaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SaldoPartidas.
     */
    cursor?: SaldoPartidaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SaldoPartidas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SaldoPartidas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SaldoPartidas.
     */
    distinct?: SaldoPartidaScalarFieldEnum | SaldoPartidaScalarFieldEnum[]
  }

  /**
   * SaldoPartida findFirstOrThrow
   */
  export type SaldoPartidaFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SaldoPartida
     */
    select?: SaldoPartidaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SaldoPartidaInclude<ExtArgs> | null
    /**
     * Filter, which SaldoPartida to fetch.
     */
    where?: SaldoPartidaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SaldoPartidas to fetch.
     */
    orderBy?: SaldoPartidaOrderByWithRelationInput | SaldoPartidaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SaldoPartidas.
     */
    cursor?: SaldoPartidaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SaldoPartidas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SaldoPartidas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SaldoPartidas.
     */
    distinct?: SaldoPartidaScalarFieldEnum | SaldoPartidaScalarFieldEnum[]
  }

  /**
   * SaldoPartida findMany
   */
  export type SaldoPartidaFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SaldoPartida
     */
    select?: SaldoPartidaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SaldoPartidaInclude<ExtArgs> | null
    /**
     * Filter, which SaldoPartidas to fetch.
     */
    where?: SaldoPartidaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SaldoPartidas to fetch.
     */
    orderBy?: SaldoPartidaOrderByWithRelationInput | SaldoPartidaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SaldoPartidas.
     */
    cursor?: SaldoPartidaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SaldoPartidas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SaldoPartidas.
     */
    skip?: number
    distinct?: SaldoPartidaScalarFieldEnum | SaldoPartidaScalarFieldEnum[]
  }

  /**
   * SaldoPartida create
   */
  export type SaldoPartidaCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SaldoPartida
     */
    select?: SaldoPartidaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SaldoPartidaInclude<ExtArgs> | null
    /**
     * The data needed to create a SaldoPartida.
     */
    data: XOR<SaldoPartidaCreateInput, SaldoPartidaUncheckedCreateInput>
  }

  /**
   * SaldoPartida createMany
   */
  export type SaldoPartidaCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SaldoPartidas.
     */
    data: SaldoPartidaCreateManyInput | SaldoPartidaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SaldoPartida createManyAndReturn
   */
  export type SaldoPartidaCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SaldoPartida
     */
    select?: SaldoPartidaSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many SaldoPartidas.
     */
    data: SaldoPartidaCreateManyInput | SaldoPartidaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SaldoPartida update
   */
  export type SaldoPartidaUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SaldoPartida
     */
    select?: SaldoPartidaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SaldoPartidaInclude<ExtArgs> | null
    /**
     * The data needed to update a SaldoPartida.
     */
    data: XOR<SaldoPartidaUpdateInput, SaldoPartidaUncheckedUpdateInput>
    /**
     * Choose, which SaldoPartida to update.
     */
    where: SaldoPartidaWhereUniqueInput
  }

  /**
   * SaldoPartida updateMany
   */
  export type SaldoPartidaUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SaldoPartidas.
     */
    data: XOR<SaldoPartidaUpdateManyMutationInput, SaldoPartidaUncheckedUpdateManyInput>
    /**
     * Filter which SaldoPartidas to update
     */
    where?: SaldoPartidaWhereInput
  }

  /**
   * SaldoPartida upsert
   */
  export type SaldoPartidaUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SaldoPartida
     */
    select?: SaldoPartidaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SaldoPartidaInclude<ExtArgs> | null
    /**
     * The filter to search for the SaldoPartida to update in case it exists.
     */
    where: SaldoPartidaWhereUniqueInput
    /**
     * In case the SaldoPartida found by the `where` argument doesn't exist, create a new SaldoPartida with this data.
     */
    create: XOR<SaldoPartidaCreateInput, SaldoPartidaUncheckedCreateInput>
    /**
     * In case the SaldoPartida was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SaldoPartidaUpdateInput, SaldoPartidaUncheckedUpdateInput>
  }

  /**
   * SaldoPartida delete
   */
  export type SaldoPartidaDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SaldoPartida
     */
    select?: SaldoPartidaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SaldoPartidaInclude<ExtArgs> | null
    /**
     * Filter which SaldoPartida to delete.
     */
    where: SaldoPartidaWhereUniqueInput
  }

  /**
   * SaldoPartida deleteMany
   */
  export type SaldoPartidaDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SaldoPartidas to delete
     */
    where?: SaldoPartidaWhereInput
  }

  /**
   * SaldoPartida.movimientos
   */
  export type SaldoPartida$movimientosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SaldoMovimiento
     */
    select?: SaldoMovimientoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SaldoMovimientoInclude<ExtArgs> | null
    where?: SaldoMovimientoWhereInput
    orderBy?: SaldoMovimientoOrderByWithRelationInput | SaldoMovimientoOrderByWithRelationInput[]
    cursor?: SaldoMovimientoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SaldoMovimientoScalarFieldEnum | SaldoMovimientoScalarFieldEnum[]
  }

  /**
   * SaldoPartida without action
   */
  export type SaldoPartidaDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SaldoPartida
     */
    select?: SaldoPartidaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SaldoPartidaInclude<ExtArgs> | null
  }


  /**
   * Model SaldoMovimiento
   */

  export type AggregateSaldoMovimiento = {
    _count: SaldoMovimientoCountAggregateOutputType | null
    _avg: SaldoMovimientoAvgAggregateOutputType | null
    _sum: SaldoMovimientoSumAggregateOutputType | null
    _min: SaldoMovimientoMinAggregateOutputType | null
    _max: SaldoMovimientoMaxAggregateOutputType | null
  }

  export type SaldoMovimientoAvgAggregateOutputType = {
    delta: Decimal | null
    saldo_resultante: Decimal | null
  }

  export type SaldoMovimientoSumAggregateOutputType = {
    delta: Decimal | null
    saldo_resultante: Decimal | null
  }

  export type SaldoMovimientoMinAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    saldo_partida_id: string | null
    referencia_id: string | null
    referencia_codigo: string | null
    tipo: string | null
    campo: string | null
    delta: Decimal | null
    saldo_resultante: Decimal | null
    created_at: Date | null
  }

  export type SaldoMovimientoMaxAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    saldo_partida_id: string | null
    referencia_id: string | null
    referencia_codigo: string | null
    tipo: string | null
    campo: string | null
    delta: Decimal | null
    saldo_resultante: Decimal | null
    created_at: Date | null
  }

  export type SaldoMovimientoCountAggregateOutputType = {
    id: number
    tenant_id: number
    saldo_partida_id: number
    referencia_id: number
    referencia_codigo: number
    tipo: number
    campo: number
    delta: number
    saldo_resultante: number
    created_at: number
    _all: number
  }


  export type SaldoMovimientoAvgAggregateInputType = {
    delta?: true
    saldo_resultante?: true
  }

  export type SaldoMovimientoSumAggregateInputType = {
    delta?: true
    saldo_resultante?: true
  }

  export type SaldoMovimientoMinAggregateInputType = {
    id?: true
    tenant_id?: true
    saldo_partida_id?: true
    referencia_id?: true
    referencia_codigo?: true
    tipo?: true
    campo?: true
    delta?: true
    saldo_resultante?: true
    created_at?: true
  }

  export type SaldoMovimientoMaxAggregateInputType = {
    id?: true
    tenant_id?: true
    saldo_partida_id?: true
    referencia_id?: true
    referencia_codigo?: true
    tipo?: true
    campo?: true
    delta?: true
    saldo_resultante?: true
    created_at?: true
  }

  export type SaldoMovimientoCountAggregateInputType = {
    id?: true
    tenant_id?: true
    saldo_partida_id?: true
    referencia_id?: true
    referencia_codigo?: true
    tipo?: true
    campo?: true
    delta?: true
    saldo_resultante?: true
    created_at?: true
    _all?: true
  }

  export type SaldoMovimientoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SaldoMovimiento to aggregate.
     */
    where?: SaldoMovimientoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SaldoMovimientos to fetch.
     */
    orderBy?: SaldoMovimientoOrderByWithRelationInput | SaldoMovimientoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SaldoMovimientoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SaldoMovimientos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SaldoMovimientos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SaldoMovimientos
    **/
    _count?: true | SaldoMovimientoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SaldoMovimientoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SaldoMovimientoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SaldoMovimientoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SaldoMovimientoMaxAggregateInputType
  }

  export type GetSaldoMovimientoAggregateType<T extends SaldoMovimientoAggregateArgs> = {
        [P in keyof T & keyof AggregateSaldoMovimiento]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSaldoMovimiento[P]>
      : GetScalarType<T[P], AggregateSaldoMovimiento[P]>
  }




  export type SaldoMovimientoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SaldoMovimientoWhereInput
    orderBy?: SaldoMovimientoOrderByWithAggregationInput | SaldoMovimientoOrderByWithAggregationInput[]
    by: SaldoMovimientoScalarFieldEnum[] | SaldoMovimientoScalarFieldEnum
    having?: SaldoMovimientoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SaldoMovimientoCountAggregateInputType | true
    _avg?: SaldoMovimientoAvgAggregateInputType
    _sum?: SaldoMovimientoSumAggregateInputType
    _min?: SaldoMovimientoMinAggregateInputType
    _max?: SaldoMovimientoMaxAggregateInputType
  }

  export type SaldoMovimientoGroupByOutputType = {
    id: string
    tenant_id: string
    saldo_partida_id: string
    referencia_id: string
    referencia_codigo: string | null
    tipo: string
    campo: string
    delta: Decimal
    saldo_resultante: Decimal
    created_at: Date
    _count: SaldoMovimientoCountAggregateOutputType | null
    _avg: SaldoMovimientoAvgAggregateOutputType | null
    _sum: SaldoMovimientoSumAggregateOutputType | null
    _min: SaldoMovimientoMinAggregateOutputType | null
    _max: SaldoMovimientoMaxAggregateOutputType | null
  }

  type GetSaldoMovimientoGroupByPayload<T extends SaldoMovimientoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SaldoMovimientoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SaldoMovimientoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SaldoMovimientoGroupByOutputType[P]>
            : GetScalarType<T[P], SaldoMovimientoGroupByOutputType[P]>
        }
      >
    >


  export type SaldoMovimientoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    saldo_partida_id?: boolean
    referencia_id?: boolean
    referencia_codigo?: boolean
    tipo?: boolean
    campo?: boolean
    delta?: boolean
    saldo_resultante?: boolean
    created_at?: boolean
    saldo_partida?: boolean | SaldoPartidaDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["saldoMovimiento"]>

  export type SaldoMovimientoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    saldo_partida_id?: boolean
    referencia_id?: boolean
    referencia_codigo?: boolean
    tipo?: boolean
    campo?: boolean
    delta?: boolean
    saldo_resultante?: boolean
    created_at?: boolean
    saldo_partida?: boolean | SaldoPartidaDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["saldoMovimiento"]>

  export type SaldoMovimientoSelectScalar = {
    id?: boolean
    tenant_id?: boolean
    saldo_partida_id?: boolean
    referencia_id?: boolean
    referencia_codigo?: boolean
    tipo?: boolean
    campo?: boolean
    delta?: boolean
    saldo_resultante?: boolean
    created_at?: boolean
  }

  export type SaldoMovimientoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    saldo_partida?: boolean | SaldoPartidaDefaultArgs<ExtArgs>
  }
  export type SaldoMovimientoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    saldo_partida?: boolean | SaldoPartidaDefaultArgs<ExtArgs>
  }

  export type $SaldoMovimientoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SaldoMovimiento"
    objects: {
      saldo_partida: Prisma.$SaldoPartidaPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenant_id: string
      saldo_partida_id: string
      referencia_id: string
      referencia_codigo: string | null
      tipo: string
      campo: string
      delta: Prisma.Decimal
      saldo_resultante: Prisma.Decimal
      created_at: Date
    }, ExtArgs["result"]["saldoMovimiento"]>
    composites: {}
  }

  type SaldoMovimientoGetPayload<S extends boolean | null | undefined | SaldoMovimientoDefaultArgs> = $Result.GetResult<Prisma.$SaldoMovimientoPayload, S>

  type SaldoMovimientoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<SaldoMovimientoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: SaldoMovimientoCountAggregateInputType | true
    }

  export interface SaldoMovimientoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SaldoMovimiento'], meta: { name: 'SaldoMovimiento' } }
    /**
     * Find zero or one SaldoMovimiento that matches the filter.
     * @param {SaldoMovimientoFindUniqueArgs} args - Arguments to find a SaldoMovimiento
     * @example
     * // Get one SaldoMovimiento
     * const saldoMovimiento = await prisma.saldoMovimiento.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SaldoMovimientoFindUniqueArgs>(args: SelectSubset<T, SaldoMovimientoFindUniqueArgs<ExtArgs>>): Prisma__SaldoMovimientoClient<$Result.GetResult<Prisma.$SaldoMovimientoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one SaldoMovimiento that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {SaldoMovimientoFindUniqueOrThrowArgs} args - Arguments to find a SaldoMovimiento
     * @example
     * // Get one SaldoMovimiento
     * const saldoMovimiento = await prisma.saldoMovimiento.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SaldoMovimientoFindUniqueOrThrowArgs>(args: SelectSubset<T, SaldoMovimientoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SaldoMovimientoClient<$Result.GetResult<Prisma.$SaldoMovimientoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first SaldoMovimiento that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SaldoMovimientoFindFirstArgs} args - Arguments to find a SaldoMovimiento
     * @example
     * // Get one SaldoMovimiento
     * const saldoMovimiento = await prisma.saldoMovimiento.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SaldoMovimientoFindFirstArgs>(args?: SelectSubset<T, SaldoMovimientoFindFirstArgs<ExtArgs>>): Prisma__SaldoMovimientoClient<$Result.GetResult<Prisma.$SaldoMovimientoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first SaldoMovimiento that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SaldoMovimientoFindFirstOrThrowArgs} args - Arguments to find a SaldoMovimiento
     * @example
     * // Get one SaldoMovimiento
     * const saldoMovimiento = await prisma.saldoMovimiento.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SaldoMovimientoFindFirstOrThrowArgs>(args?: SelectSubset<T, SaldoMovimientoFindFirstOrThrowArgs<ExtArgs>>): Prisma__SaldoMovimientoClient<$Result.GetResult<Prisma.$SaldoMovimientoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more SaldoMovimientos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SaldoMovimientoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SaldoMovimientos
     * const saldoMovimientos = await prisma.saldoMovimiento.findMany()
     * 
     * // Get first 10 SaldoMovimientos
     * const saldoMovimientos = await prisma.saldoMovimiento.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const saldoMovimientoWithIdOnly = await prisma.saldoMovimiento.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SaldoMovimientoFindManyArgs>(args?: SelectSubset<T, SaldoMovimientoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SaldoMovimientoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a SaldoMovimiento.
     * @param {SaldoMovimientoCreateArgs} args - Arguments to create a SaldoMovimiento.
     * @example
     * // Create one SaldoMovimiento
     * const SaldoMovimiento = await prisma.saldoMovimiento.create({
     *   data: {
     *     // ... data to create a SaldoMovimiento
     *   }
     * })
     * 
     */
    create<T extends SaldoMovimientoCreateArgs>(args: SelectSubset<T, SaldoMovimientoCreateArgs<ExtArgs>>): Prisma__SaldoMovimientoClient<$Result.GetResult<Prisma.$SaldoMovimientoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many SaldoMovimientos.
     * @param {SaldoMovimientoCreateManyArgs} args - Arguments to create many SaldoMovimientos.
     * @example
     * // Create many SaldoMovimientos
     * const saldoMovimiento = await prisma.saldoMovimiento.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SaldoMovimientoCreateManyArgs>(args?: SelectSubset<T, SaldoMovimientoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SaldoMovimientos and returns the data saved in the database.
     * @param {SaldoMovimientoCreateManyAndReturnArgs} args - Arguments to create many SaldoMovimientos.
     * @example
     * // Create many SaldoMovimientos
     * const saldoMovimiento = await prisma.saldoMovimiento.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SaldoMovimientos and only return the `id`
     * const saldoMovimientoWithIdOnly = await prisma.saldoMovimiento.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SaldoMovimientoCreateManyAndReturnArgs>(args?: SelectSubset<T, SaldoMovimientoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SaldoMovimientoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a SaldoMovimiento.
     * @param {SaldoMovimientoDeleteArgs} args - Arguments to delete one SaldoMovimiento.
     * @example
     * // Delete one SaldoMovimiento
     * const SaldoMovimiento = await prisma.saldoMovimiento.delete({
     *   where: {
     *     // ... filter to delete one SaldoMovimiento
     *   }
     * })
     * 
     */
    delete<T extends SaldoMovimientoDeleteArgs>(args: SelectSubset<T, SaldoMovimientoDeleteArgs<ExtArgs>>): Prisma__SaldoMovimientoClient<$Result.GetResult<Prisma.$SaldoMovimientoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one SaldoMovimiento.
     * @param {SaldoMovimientoUpdateArgs} args - Arguments to update one SaldoMovimiento.
     * @example
     * // Update one SaldoMovimiento
     * const saldoMovimiento = await prisma.saldoMovimiento.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SaldoMovimientoUpdateArgs>(args: SelectSubset<T, SaldoMovimientoUpdateArgs<ExtArgs>>): Prisma__SaldoMovimientoClient<$Result.GetResult<Prisma.$SaldoMovimientoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more SaldoMovimientos.
     * @param {SaldoMovimientoDeleteManyArgs} args - Arguments to filter SaldoMovimientos to delete.
     * @example
     * // Delete a few SaldoMovimientos
     * const { count } = await prisma.saldoMovimiento.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SaldoMovimientoDeleteManyArgs>(args?: SelectSubset<T, SaldoMovimientoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SaldoMovimientos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SaldoMovimientoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SaldoMovimientos
     * const saldoMovimiento = await prisma.saldoMovimiento.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SaldoMovimientoUpdateManyArgs>(args: SelectSubset<T, SaldoMovimientoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one SaldoMovimiento.
     * @param {SaldoMovimientoUpsertArgs} args - Arguments to update or create a SaldoMovimiento.
     * @example
     * // Update or create a SaldoMovimiento
     * const saldoMovimiento = await prisma.saldoMovimiento.upsert({
     *   create: {
     *     // ... data to create a SaldoMovimiento
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SaldoMovimiento we want to update
     *   }
     * })
     */
    upsert<T extends SaldoMovimientoUpsertArgs>(args: SelectSubset<T, SaldoMovimientoUpsertArgs<ExtArgs>>): Prisma__SaldoMovimientoClient<$Result.GetResult<Prisma.$SaldoMovimientoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of SaldoMovimientos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SaldoMovimientoCountArgs} args - Arguments to filter SaldoMovimientos to count.
     * @example
     * // Count the number of SaldoMovimientos
     * const count = await prisma.saldoMovimiento.count({
     *   where: {
     *     // ... the filter for the SaldoMovimientos we want to count
     *   }
     * })
    **/
    count<T extends SaldoMovimientoCountArgs>(
      args?: Subset<T, SaldoMovimientoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SaldoMovimientoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SaldoMovimiento.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SaldoMovimientoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends SaldoMovimientoAggregateArgs>(args: Subset<T, SaldoMovimientoAggregateArgs>): Prisma.PrismaPromise<GetSaldoMovimientoAggregateType<T>>

    /**
     * Group by SaldoMovimiento.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SaldoMovimientoGroupByArgs} args - Group by arguments.
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
      T extends SaldoMovimientoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SaldoMovimientoGroupByArgs['orderBy'] }
        : { orderBy?: SaldoMovimientoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, SaldoMovimientoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSaldoMovimientoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SaldoMovimiento model
   */
  readonly fields: SaldoMovimientoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SaldoMovimiento.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SaldoMovimientoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    saldo_partida<T extends SaldoPartidaDefaultArgs<ExtArgs> = {}>(args?: Subset<T, SaldoPartidaDefaultArgs<ExtArgs>>): Prisma__SaldoPartidaClient<$Result.GetResult<Prisma.$SaldoPartidaPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
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
   * Fields of the SaldoMovimiento model
   */ 
  interface SaldoMovimientoFieldRefs {
    readonly id: FieldRef<"SaldoMovimiento", 'String'>
    readonly tenant_id: FieldRef<"SaldoMovimiento", 'String'>
    readonly saldo_partida_id: FieldRef<"SaldoMovimiento", 'String'>
    readonly referencia_id: FieldRef<"SaldoMovimiento", 'String'>
    readonly referencia_codigo: FieldRef<"SaldoMovimiento", 'String'>
    readonly tipo: FieldRef<"SaldoMovimiento", 'String'>
    readonly campo: FieldRef<"SaldoMovimiento", 'String'>
    readonly delta: FieldRef<"SaldoMovimiento", 'Decimal'>
    readonly saldo_resultante: FieldRef<"SaldoMovimiento", 'Decimal'>
    readonly created_at: FieldRef<"SaldoMovimiento", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * SaldoMovimiento findUnique
   */
  export type SaldoMovimientoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SaldoMovimiento
     */
    select?: SaldoMovimientoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SaldoMovimientoInclude<ExtArgs> | null
    /**
     * Filter, which SaldoMovimiento to fetch.
     */
    where: SaldoMovimientoWhereUniqueInput
  }

  /**
   * SaldoMovimiento findUniqueOrThrow
   */
  export type SaldoMovimientoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SaldoMovimiento
     */
    select?: SaldoMovimientoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SaldoMovimientoInclude<ExtArgs> | null
    /**
     * Filter, which SaldoMovimiento to fetch.
     */
    where: SaldoMovimientoWhereUniqueInput
  }

  /**
   * SaldoMovimiento findFirst
   */
  export type SaldoMovimientoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SaldoMovimiento
     */
    select?: SaldoMovimientoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SaldoMovimientoInclude<ExtArgs> | null
    /**
     * Filter, which SaldoMovimiento to fetch.
     */
    where?: SaldoMovimientoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SaldoMovimientos to fetch.
     */
    orderBy?: SaldoMovimientoOrderByWithRelationInput | SaldoMovimientoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SaldoMovimientos.
     */
    cursor?: SaldoMovimientoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SaldoMovimientos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SaldoMovimientos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SaldoMovimientos.
     */
    distinct?: SaldoMovimientoScalarFieldEnum | SaldoMovimientoScalarFieldEnum[]
  }

  /**
   * SaldoMovimiento findFirstOrThrow
   */
  export type SaldoMovimientoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SaldoMovimiento
     */
    select?: SaldoMovimientoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SaldoMovimientoInclude<ExtArgs> | null
    /**
     * Filter, which SaldoMovimiento to fetch.
     */
    where?: SaldoMovimientoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SaldoMovimientos to fetch.
     */
    orderBy?: SaldoMovimientoOrderByWithRelationInput | SaldoMovimientoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SaldoMovimientos.
     */
    cursor?: SaldoMovimientoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SaldoMovimientos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SaldoMovimientos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SaldoMovimientos.
     */
    distinct?: SaldoMovimientoScalarFieldEnum | SaldoMovimientoScalarFieldEnum[]
  }

  /**
   * SaldoMovimiento findMany
   */
  export type SaldoMovimientoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SaldoMovimiento
     */
    select?: SaldoMovimientoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SaldoMovimientoInclude<ExtArgs> | null
    /**
     * Filter, which SaldoMovimientos to fetch.
     */
    where?: SaldoMovimientoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SaldoMovimientos to fetch.
     */
    orderBy?: SaldoMovimientoOrderByWithRelationInput | SaldoMovimientoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SaldoMovimientos.
     */
    cursor?: SaldoMovimientoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SaldoMovimientos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SaldoMovimientos.
     */
    skip?: number
    distinct?: SaldoMovimientoScalarFieldEnum | SaldoMovimientoScalarFieldEnum[]
  }

  /**
   * SaldoMovimiento create
   */
  export type SaldoMovimientoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SaldoMovimiento
     */
    select?: SaldoMovimientoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SaldoMovimientoInclude<ExtArgs> | null
    /**
     * The data needed to create a SaldoMovimiento.
     */
    data: XOR<SaldoMovimientoCreateInput, SaldoMovimientoUncheckedCreateInput>
  }

  /**
   * SaldoMovimiento createMany
   */
  export type SaldoMovimientoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SaldoMovimientos.
     */
    data: SaldoMovimientoCreateManyInput | SaldoMovimientoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SaldoMovimiento createManyAndReturn
   */
  export type SaldoMovimientoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SaldoMovimiento
     */
    select?: SaldoMovimientoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many SaldoMovimientos.
     */
    data: SaldoMovimientoCreateManyInput | SaldoMovimientoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SaldoMovimientoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * SaldoMovimiento update
   */
  export type SaldoMovimientoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SaldoMovimiento
     */
    select?: SaldoMovimientoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SaldoMovimientoInclude<ExtArgs> | null
    /**
     * The data needed to update a SaldoMovimiento.
     */
    data: XOR<SaldoMovimientoUpdateInput, SaldoMovimientoUncheckedUpdateInput>
    /**
     * Choose, which SaldoMovimiento to update.
     */
    where: SaldoMovimientoWhereUniqueInput
  }

  /**
   * SaldoMovimiento updateMany
   */
  export type SaldoMovimientoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SaldoMovimientos.
     */
    data: XOR<SaldoMovimientoUpdateManyMutationInput, SaldoMovimientoUncheckedUpdateManyInput>
    /**
     * Filter which SaldoMovimientos to update
     */
    where?: SaldoMovimientoWhereInput
  }

  /**
   * SaldoMovimiento upsert
   */
  export type SaldoMovimientoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SaldoMovimiento
     */
    select?: SaldoMovimientoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SaldoMovimientoInclude<ExtArgs> | null
    /**
     * The filter to search for the SaldoMovimiento to update in case it exists.
     */
    where: SaldoMovimientoWhereUniqueInput
    /**
     * In case the SaldoMovimiento found by the `where` argument doesn't exist, create a new SaldoMovimiento with this data.
     */
    create: XOR<SaldoMovimientoCreateInput, SaldoMovimientoUncheckedCreateInput>
    /**
     * In case the SaldoMovimiento was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SaldoMovimientoUpdateInput, SaldoMovimientoUncheckedUpdateInput>
  }

  /**
   * SaldoMovimiento delete
   */
  export type SaldoMovimientoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SaldoMovimiento
     */
    select?: SaldoMovimientoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SaldoMovimientoInclude<ExtArgs> | null
    /**
     * Filter which SaldoMovimiento to delete.
     */
    where: SaldoMovimientoWhereUniqueInput
  }

  /**
   * SaldoMovimiento deleteMany
   */
  export type SaldoMovimientoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SaldoMovimientos to delete
     */
    where?: SaldoMovimientoWhereInput
  }

  /**
   * SaldoMovimiento without action
   */
  export type SaldoMovimientoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SaldoMovimiento
     */
    select?: SaldoMovimientoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SaldoMovimientoInclude<ExtArgs> | null
  }


  /**
   * Model FichaTecnicaInsumo
   */

  export type AggregateFichaTecnicaInsumo = {
    _count: FichaTecnicaInsumoCountAggregateOutputType | null
    _avg: FichaTecnicaInsumoAvgAggregateOutputType | null
    _sum: FichaTecnicaInsumoSumAggregateOutputType | null
    _min: FichaTecnicaInsumoMinAggregateOutputType | null
    _max: FichaTecnicaInsumoMaxAggregateOutputType | null
  }

  export type FichaTecnicaInsumoAvgAggregateOutputType = {
    tamano_bytes: number | null
  }

  export type FichaTecnicaInsumoSumAggregateOutputType = {
    tamano_bytes: number | null
  }

  export type FichaTecnicaInsumoMinAggregateOutputType = {
    id_ficha: string | null
    tenant_id: string | null
    insumo_id: string | null
    proveedor_ref: string | null
    nombre_doc: string | null
    ruta_archivo: string | null
    mime_type: string | null
    tamano_bytes: number | null
    subido_por: string | null
    created_at: Date | null
  }

  export type FichaTecnicaInsumoMaxAggregateOutputType = {
    id_ficha: string | null
    tenant_id: string | null
    insumo_id: string | null
    proveedor_ref: string | null
    nombre_doc: string | null
    ruta_archivo: string | null
    mime_type: string | null
    tamano_bytes: number | null
    subido_por: string | null
    created_at: Date | null
  }

  export type FichaTecnicaInsumoCountAggregateOutputType = {
    id_ficha: number
    tenant_id: number
    insumo_id: number
    proveedor_ref: number
    nombre_doc: number
    ruta_archivo: number
    mime_type: number
    tamano_bytes: number
    subido_por: number
    created_at: number
    _all: number
  }


  export type FichaTecnicaInsumoAvgAggregateInputType = {
    tamano_bytes?: true
  }

  export type FichaTecnicaInsumoSumAggregateInputType = {
    tamano_bytes?: true
  }

  export type FichaTecnicaInsumoMinAggregateInputType = {
    id_ficha?: true
    tenant_id?: true
    insumo_id?: true
    proveedor_ref?: true
    nombre_doc?: true
    ruta_archivo?: true
    mime_type?: true
    tamano_bytes?: true
    subido_por?: true
    created_at?: true
  }

  export type FichaTecnicaInsumoMaxAggregateInputType = {
    id_ficha?: true
    tenant_id?: true
    insumo_id?: true
    proveedor_ref?: true
    nombre_doc?: true
    ruta_archivo?: true
    mime_type?: true
    tamano_bytes?: true
    subido_por?: true
    created_at?: true
  }

  export type FichaTecnicaInsumoCountAggregateInputType = {
    id_ficha?: true
    tenant_id?: true
    insumo_id?: true
    proveedor_ref?: true
    nombre_doc?: true
    ruta_archivo?: true
    mime_type?: true
    tamano_bytes?: true
    subido_por?: true
    created_at?: true
    _all?: true
  }

  export type FichaTecnicaInsumoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FichaTecnicaInsumo to aggregate.
     */
    where?: FichaTecnicaInsumoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FichaTecnicaInsumos to fetch.
     */
    orderBy?: FichaTecnicaInsumoOrderByWithRelationInput | FichaTecnicaInsumoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FichaTecnicaInsumoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FichaTecnicaInsumos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FichaTecnicaInsumos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned FichaTecnicaInsumos
    **/
    _count?: true | FichaTecnicaInsumoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: FichaTecnicaInsumoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: FichaTecnicaInsumoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FichaTecnicaInsumoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FichaTecnicaInsumoMaxAggregateInputType
  }

  export type GetFichaTecnicaInsumoAggregateType<T extends FichaTecnicaInsumoAggregateArgs> = {
        [P in keyof T & keyof AggregateFichaTecnicaInsumo]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFichaTecnicaInsumo[P]>
      : GetScalarType<T[P], AggregateFichaTecnicaInsumo[P]>
  }




  export type FichaTecnicaInsumoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FichaTecnicaInsumoWhereInput
    orderBy?: FichaTecnicaInsumoOrderByWithAggregationInput | FichaTecnicaInsumoOrderByWithAggregationInput[]
    by: FichaTecnicaInsumoScalarFieldEnum[] | FichaTecnicaInsumoScalarFieldEnum
    having?: FichaTecnicaInsumoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FichaTecnicaInsumoCountAggregateInputType | true
    _avg?: FichaTecnicaInsumoAvgAggregateInputType
    _sum?: FichaTecnicaInsumoSumAggregateInputType
    _min?: FichaTecnicaInsumoMinAggregateInputType
    _max?: FichaTecnicaInsumoMaxAggregateInputType
  }

  export type FichaTecnicaInsumoGroupByOutputType = {
    id_ficha: string
    tenant_id: string
    insumo_id: string
    proveedor_ref: string | null
    nombre_doc: string
    ruta_archivo: string
    mime_type: string
    tamano_bytes: number
    subido_por: string
    created_at: Date
    _count: FichaTecnicaInsumoCountAggregateOutputType | null
    _avg: FichaTecnicaInsumoAvgAggregateOutputType | null
    _sum: FichaTecnicaInsumoSumAggregateOutputType | null
    _min: FichaTecnicaInsumoMinAggregateOutputType | null
    _max: FichaTecnicaInsumoMaxAggregateOutputType | null
  }

  type GetFichaTecnicaInsumoGroupByPayload<T extends FichaTecnicaInsumoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FichaTecnicaInsumoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FichaTecnicaInsumoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FichaTecnicaInsumoGroupByOutputType[P]>
            : GetScalarType<T[P], FichaTecnicaInsumoGroupByOutputType[P]>
        }
      >
    >


  export type FichaTecnicaInsumoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_ficha?: boolean
    tenant_id?: boolean
    insumo_id?: boolean
    proveedor_ref?: boolean
    nombre_doc?: boolean
    ruta_archivo?: boolean
    mime_type?: boolean
    tamano_bytes?: boolean
    subido_por?: boolean
    created_at?: boolean
  }, ExtArgs["result"]["fichaTecnicaInsumo"]>

  export type FichaTecnicaInsumoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_ficha?: boolean
    tenant_id?: boolean
    insumo_id?: boolean
    proveedor_ref?: boolean
    nombre_doc?: boolean
    ruta_archivo?: boolean
    mime_type?: boolean
    tamano_bytes?: boolean
    subido_por?: boolean
    created_at?: boolean
  }, ExtArgs["result"]["fichaTecnicaInsumo"]>

  export type FichaTecnicaInsumoSelectScalar = {
    id_ficha?: boolean
    tenant_id?: boolean
    insumo_id?: boolean
    proveedor_ref?: boolean
    nombre_doc?: boolean
    ruta_archivo?: boolean
    mime_type?: boolean
    tamano_bytes?: boolean
    subido_por?: boolean
    created_at?: boolean
  }


  export type $FichaTecnicaInsumoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "FichaTecnicaInsumo"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id_ficha: string
      tenant_id: string
      insumo_id: string
      proveedor_ref: string | null
      nombre_doc: string
      ruta_archivo: string
      mime_type: string
      tamano_bytes: number
      subido_por: string
      created_at: Date
    }, ExtArgs["result"]["fichaTecnicaInsumo"]>
    composites: {}
  }

  type FichaTecnicaInsumoGetPayload<S extends boolean | null | undefined | FichaTecnicaInsumoDefaultArgs> = $Result.GetResult<Prisma.$FichaTecnicaInsumoPayload, S>

  type FichaTecnicaInsumoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<FichaTecnicaInsumoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: FichaTecnicaInsumoCountAggregateInputType | true
    }

  export interface FichaTecnicaInsumoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['FichaTecnicaInsumo'], meta: { name: 'FichaTecnicaInsumo' } }
    /**
     * Find zero or one FichaTecnicaInsumo that matches the filter.
     * @param {FichaTecnicaInsumoFindUniqueArgs} args - Arguments to find a FichaTecnicaInsumo
     * @example
     * // Get one FichaTecnicaInsumo
     * const fichaTecnicaInsumo = await prisma.fichaTecnicaInsumo.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FichaTecnicaInsumoFindUniqueArgs>(args: SelectSubset<T, FichaTecnicaInsumoFindUniqueArgs<ExtArgs>>): Prisma__FichaTecnicaInsumoClient<$Result.GetResult<Prisma.$FichaTecnicaInsumoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one FichaTecnicaInsumo that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {FichaTecnicaInsumoFindUniqueOrThrowArgs} args - Arguments to find a FichaTecnicaInsumo
     * @example
     * // Get one FichaTecnicaInsumo
     * const fichaTecnicaInsumo = await prisma.fichaTecnicaInsumo.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FichaTecnicaInsumoFindUniqueOrThrowArgs>(args: SelectSubset<T, FichaTecnicaInsumoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FichaTecnicaInsumoClient<$Result.GetResult<Prisma.$FichaTecnicaInsumoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first FichaTecnicaInsumo that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FichaTecnicaInsumoFindFirstArgs} args - Arguments to find a FichaTecnicaInsumo
     * @example
     * // Get one FichaTecnicaInsumo
     * const fichaTecnicaInsumo = await prisma.fichaTecnicaInsumo.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FichaTecnicaInsumoFindFirstArgs>(args?: SelectSubset<T, FichaTecnicaInsumoFindFirstArgs<ExtArgs>>): Prisma__FichaTecnicaInsumoClient<$Result.GetResult<Prisma.$FichaTecnicaInsumoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first FichaTecnicaInsumo that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FichaTecnicaInsumoFindFirstOrThrowArgs} args - Arguments to find a FichaTecnicaInsumo
     * @example
     * // Get one FichaTecnicaInsumo
     * const fichaTecnicaInsumo = await prisma.fichaTecnicaInsumo.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FichaTecnicaInsumoFindFirstOrThrowArgs>(args?: SelectSubset<T, FichaTecnicaInsumoFindFirstOrThrowArgs<ExtArgs>>): Prisma__FichaTecnicaInsumoClient<$Result.GetResult<Prisma.$FichaTecnicaInsumoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more FichaTecnicaInsumos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FichaTecnicaInsumoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all FichaTecnicaInsumos
     * const fichaTecnicaInsumos = await prisma.fichaTecnicaInsumo.findMany()
     * 
     * // Get first 10 FichaTecnicaInsumos
     * const fichaTecnicaInsumos = await prisma.fichaTecnicaInsumo.findMany({ take: 10 })
     * 
     * // Only select the `id_ficha`
     * const fichaTecnicaInsumoWithId_fichaOnly = await prisma.fichaTecnicaInsumo.findMany({ select: { id_ficha: true } })
     * 
     */
    findMany<T extends FichaTecnicaInsumoFindManyArgs>(args?: SelectSubset<T, FichaTecnicaInsumoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FichaTecnicaInsumoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a FichaTecnicaInsumo.
     * @param {FichaTecnicaInsumoCreateArgs} args - Arguments to create a FichaTecnicaInsumo.
     * @example
     * // Create one FichaTecnicaInsumo
     * const FichaTecnicaInsumo = await prisma.fichaTecnicaInsumo.create({
     *   data: {
     *     // ... data to create a FichaTecnicaInsumo
     *   }
     * })
     * 
     */
    create<T extends FichaTecnicaInsumoCreateArgs>(args: SelectSubset<T, FichaTecnicaInsumoCreateArgs<ExtArgs>>): Prisma__FichaTecnicaInsumoClient<$Result.GetResult<Prisma.$FichaTecnicaInsumoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many FichaTecnicaInsumos.
     * @param {FichaTecnicaInsumoCreateManyArgs} args - Arguments to create many FichaTecnicaInsumos.
     * @example
     * // Create many FichaTecnicaInsumos
     * const fichaTecnicaInsumo = await prisma.fichaTecnicaInsumo.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FichaTecnicaInsumoCreateManyArgs>(args?: SelectSubset<T, FichaTecnicaInsumoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many FichaTecnicaInsumos and returns the data saved in the database.
     * @param {FichaTecnicaInsumoCreateManyAndReturnArgs} args - Arguments to create many FichaTecnicaInsumos.
     * @example
     * // Create many FichaTecnicaInsumos
     * const fichaTecnicaInsumo = await prisma.fichaTecnicaInsumo.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many FichaTecnicaInsumos and only return the `id_ficha`
     * const fichaTecnicaInsumoWithId_fichaOnly = await prisma.fichaTecnicaInsumo.createManyAndReturn({ 
     *   select: { id_ficha: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FichaTecnicaInsumoCreateManyAndReturnArgs>(args?: SelectSubset<T, FichaTecnicaInsumoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FichaTecnicaInsumoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a FichaTecnicaInsumo.
     * @param {FichaTecnicaInsumoDeleteArgs} args - Arguments to delete one FichaTecnicaInsumo.
     * @example
     * // Delete one FichaTecnicaInsumo
     * const FichaTecnicaInsumo = await prisma.fichaTecnicaInsumo.delete({
     *   where: {
     *     // ... filter to delete one FichaTecnicaInsumo
     *   }
     * })
     * 
     */
    delete<T extends FichaTecnicaInsumoDeleteArgs>(args: SelectSubset<T, FichaTecnicaInsumoDeleteArgs<ExtArgs>>): Prisma__FichaTecnicaInsumoClient<$Result.GetResult<Prisma.$FichaTecnicaInsumoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one FichaTecnicaInsumo.
     * @param {FichaTecnicaInsumoUpdateArgs} args - Arguments to update one FichaTecnicaInsumo.
     * @example
     * // Update one FichaTecnicaInsumo
     * const fichaTecnicaInsumo = await prisma.fichaTecnicaInsumo.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FichaTecnicaInsumoUpdateArgs>(args: SelectSubset<T, FichaTecnicaInsumoUpdateArgs<ExtArgs>>): Prisma__FichaTecnicaInsumoClient<$Result.GetResult<Prisma.$FichaTecnicaInsumoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more FichaTecnicaInsumos.
     * @param {FichaTecnicaInsumoDeleteManyArgs} args - Arguments to filter FichaTecnicaInsumos to delete.
     * @example
     * // Delete a few FichaTecnicaInsumos
     * const { count } = await prisma.fichaTecnicaInsumo.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FichaTecnicaInsumoDeleteManyArgs>(args?: SelectSubset<T, FichaTecnicaInsumoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more FichaTecnicaInsumos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FichaTecnicaInsumoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many FichaTecnicaInsumos
     * const fichaTecnicaInsumo = await prisma.fichaTecnicaInsumo.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FichaTecnicaInsumoUpdateManyArgs>(args: SelectSubset<T, FichaTecnicaInsumoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one FichaTecnicaInsumo.
     * @param {FichaTecnicaInsumoUpsertArgs} args - Arguments to update or create a FichaTecnicaInsumo.
     * @example
     * // Update or create a FichaTecnicaInsumo
     * const fichaTecnicaInsumo = await prisma.fichaTecnicaInsumo.upsert({
     *   create: {
     *     // ... data to create a FichaTecnicaInsumo
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the FichaTecnicaInsumo we want to update
     *   }
     * })
     */
    upsert<T extends FichaTecnicaInsumoUpsertArgs>(args: SelectSubset<T, FichaTecnicaInsumoUpsertArgs<ExtArgs>>): Prisma__FichaTecnicaInsumoClient<$Result.GetResult<Prisma.$FichaTecnicaInsumoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of FichaTecnicaInsumos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FichaTecnicaInsumoCountArgs} args - Arguments to filter FichaTecnicaInsumos to count.
     * @example
     * // Count the number of FichaTecnicaInsumos
     * const count = await prisma.fichaTecnicaInsumo.count({
     *   where: {
     *     // ... the filter for the FichaTecnicaInsumos we want to count
     *   }
     * })
    **/
    count<T extends FichaTecnicaInsumoCountArgs>(
      args?: Subset<T, FichaTecnicaInsumoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FichaTecnicaInsumoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a FichaTecnicaInsumo.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FichaTecnicaInsumoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends FichaTecnicaInsumoAggregateArgs>(args: Subset<T, FichaTecnicaInsumoAggregateArgs>): Prisma.PrismaPromise<GetFichaTecnicaInsumoAggregateType<T>>

    /**
     * Group by FichaTecnicaInsumo.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FichaTecnicaInsumoGroupByArgs} args - Group by arguments.
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
      T extends FichaTecnicaInsumoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FichaTecnicaInsumoGroupByArgs['orderBy'] }
        : { orderBy?: FichaTecnicaInsumoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, FichaTecnicaInsumoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFichaTecnicaInsumoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the FichaTecnicaInsumo model
   */
  readonly fields: FichaTecnicaInsumoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for FichaTecnicaInsumo.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FichaTecnicaInsumoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the FichaTecnicaInsumo model
   */ 
  interface FichaTecnicaInsumoFieldRefs {
    readonly id_ficha: FieldRef<"FichaTecnicaInsumo", 'String'>
    readonly tenant_id: FieldRef<"FichaTecnicaInsumo", 'String'>
    readonly insumo_id: FieldRef<"FichaTecnicaInsumo", 'String'>
    readonly proveedor_ref: FieldRef<"FichaTecnicaInsumo", 'String'>
    readonly nombre_doc: FieldRef<"FichaTecnicaInsumo", 'String'>
    readonly ruta_archivo: FieldRef<"FichaTecnicaInsumo", 'String'>
    readonly mime_type: FieldRef<"FichaTecnicaInsumo", 'String'>
    readonly tamano_bytes: FieldRef<"FichaTecnicaInsumo", 'Int'>
    readonly subido_por: FieldRef<"FichaTecnicaInsumo", 'String'>
    readonly created_at: FieldRef<"FichaTecnicaInsumo", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * FichaTecnicaInsumo findUnique
   */
  export type FichaTecnicaInsumoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FichaTecnicaInsumo
     */
    select?: FichaTecnicaInsumoSelect<ExtArgs> | null
    /**
     * Filter, which FichaTecnicaInsumo to fetch.
     */
    where: FichaTecnicaInsumoWhereUniqueInput
  }

  /**
   * FichaTecnicaInsumo findUniqueOrThrow
   */
  export type FichaTecnicaInsumoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FichaTecnicaInsumo
     */
    select?: FichaTecnicaInsumoSelect<ExtArgs> | null
    /**
     * Filter, which FichaTecnicaInsumo to fetch.
     */
    where: FichaTecnicaInsumoWhereUniqueInput
  }

  /**
   * FichaTecnicaInsumo findFirst
   */
  export type FichaTecnicaInsumoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FichaTecnicaInsumo
     */
    select?: FichaTecnicaInsumoSelect<ExtArgs> | null
    /**
     * Filter, which FichaTecnicaInsumo to fetch.
     */
    where?: FichaTecnicaInsumoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FichaTecnicaInsumos to fetch.
     */
    orderBy?: FichaTecnicaInsumoOrderByWithRelationInput | FichaTecnicaInsumoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FichaTecnicaInsumos.
     */
    cursor?: FichaTecnicaInsumoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FichaTecnicaInsumos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FichaTecnicaInsumos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FichaTecnicaInsumos.
     */
    distinct?: FichaTecnicaInsumoScalarFieldEnum | FichaTecnicaInsumoScalarFieldEnum[]
  }

  /**
   * FichaTecnicaInsumo findFirstOrThrow
   */
  export type FichaTecnicaInsumoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FichaTecnicaInsumo
     */
    select?: FichaTecnicaInsumoSelect<ExtArgs> | null
    /**
     * Filter, which FichaTecnicaInsumo to fetch.
     */
    where?: FichaTecnicaInsumoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FichaTecnicaInsumos to fetch.
     */
    orderBy?: FichaTecnicaInsumoOrderByWithRelationInput | FichaTecnicaInsumoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FichaTecnicaInsumos.
     */
    cursor?: FichaTecnicaInsumoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FichaTecnicaInsumos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FichaTecnicaInsumos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FichaTecnicaInsumos.
     */
    distinct?: FichaTecnicaInsumoScalarFieldEnum | FichaTecnicaInsumoScalarFieldEnum[]
  }

  /**
   * FichaTecnicaInsumo findMany
   */
  export type FichaTecnicaInsumoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FichaTecnicaInsumo
     */
    select?: FichaTecnicaInsumoSelect<ExtArgs> | null
    /**
     * Filter, which FichaTecnicaInsumos to fetch.
     */
    where?: FichaTecnicaInsumoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FichaTecnicaInsumos to fetch.
     */
    orderBy?: FichaTecnicaInsumoOrderByWithRelationInput | FichaTecnicaInsumoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing FichaTecnicaInsumos.
     */
    cursor?: FichaTecnicaInsumoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FichaTecnicaInsumos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FichaTecnicaInsumos.
     */
    skip?: number
    distinct?: FichaTecnicaInsumoScalarFieldEnum | FichaTecnicaInsumoScalarFieldEnum[]
  }

  /**
   * FichaTecnicaInsumo create
   */
  export type FichaTecnicaInsumoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FichaTecnicaInsumo
     */
    select?: FichaTecnicaInsumoSelect<ExtArgs> | null
    /**
     * The data needed to create a FichaTecnicaInsumo.
     */
    data: XOR<FichaTecnicaInsumoCreateInput, FichaTecnicaInsumoUncheckedCreateInput>
  }

  /**
   * FichaTecnicaInsumo createMany
   */
  export type FichaTecnicaInsumoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many FichaTecnicaInsumos.
     */
    data: FichaTecnicaInsumoCreateManyInput | FichaTecnicaInsumoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * FichaTecnicaInsumo createManyAndReturn
   */
  export type FichaTecnicaInsumoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FichaTecnicaInsumo
     */
    select?: FichaTecnicaInsumoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many FichaTecnicaInsumos.
     */
    data: FichaTecnicaInsumoCreateManyInput | FichaTecnicaInsumoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * FichaTecnicaInsumo update
   */
  export type FichaTecnicaInsumoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FichaTecnicaInsumo
     */
    select?: FichaTecnicaInsumoSelect<ExtArgs> | null
    /**
     * The data needed to update a FichaTecnicaInsumo.
     */
    data: XOR<FichaTecnicaInsumoUpdateInput, FichaTecnicaInsumoUncheckedUpdateInput>
    /**
     * Choose, which FichaTecnicaInsumo to update.
     */
    where: FichaTecnicaInsumoWhereUniqueInput
  }

  /**
   * FichaTecnicaInsumo updateMany
   */
  export type FichaTecnicaInsumoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update FichaTecnicaInsumos.
     */
    data: XOR<FichaTecnicaInsumoUpdateManyMutationInput, FichaTecnicaInsumoUncheckedUpdateManyInput>
    /**
     * Filter which FichaTecnicaInsumos to update
     */
    where?: FichaTecnicaInsumoWhereInput
  }

  /**
   * FichaTecnicaInsumo upsert
   */
  export type FichaTecnicaInsumoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FichaTecnicaInsumo
     */
    select?: FichaTecnicaInsumoSelect<ExtArgs> | null
    /**
     * The filter to search for the FichaTecnicaInsumo to update in case it exists.
     */
    where: FichaTecnicaInsumoWhereUniqueInput
    /**
     * In case the FichaTecnicaInsumo found by the `where` argument doesn't exist, create a new FichaTecnicaInsumo with this data.
     */
    create: XOR<FichaTecnicaInsumoCreateInput, FichaTecnicaInsumoUncheckedCreateInput>
    /**
     * In case the FichaTecnicaInsumo was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FichaTecnicaInsumoUpdateInput, FichaTecnicaInsumoUncheckedUpdateInput>
  }

  /**
   * FichaTecnicaInsumo delete
   */
  export type FichaTecnicaInsumoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FichaTecnicaInsumo
     */
    select?: FichaTecnicaInsumoSelect<ExtArgs> | null
    /**
     * Filter which FichaTecnicaInsumo to delete.
     */
    where: FichaTecnicaInsumoWhereUniqueInput
  }

  /**
   * FichaTecnicaInsumo deleteMany
   */
  export type FichaTecnicaInsumoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FichaTecnicaInsumos to delete
     */
    where?: FichaTecnicaInsumoWhereInput
  }

  /**
   * FichaTecnicaInsumo without action
   */
  export type FichaTecnicaInsumoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FichaTecnicaInsumo
     */
    select?: FichaTecnicaInsumoSelect<ExtArgs> | null
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


  export const CategoriaGastoScalarFieldEnum: {
    id_categoria: 'id_categoria',
    tenant_id: 'tenant_id',
    proyecto_id: 'proyecto_id',
    nombre: 'nombre',
    es_predefinida: 'es_predefinida',
    activa: 'activa',
    created_at: 'created_at'
  };

  export type CategoriaGastoScalarFieldEnum = (typeof CategoriaGastoScalarFieldEnum)[keyof typeof CategoriaGastoScalarFieldEnum]


  export const ProyectoCostosConfigScalarFieldEnum: {
    id: 'id',
    tenant_id: 'tenant_id',
    proyecto_id: 'proyecto_id',
    estado: 'estado',
    activado_por: 'activado_por',
    fecha_activacion: 'fecha_activacion',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type ProyectoCostosConfigScalarFieldEnum = (typeof ProyectoCostosConfigScalarFieldEnum)[keyof typeof ProyectoCostosConfigScalarFieldEnum]


  export const InsumoScalarFieldEnum: {
    id: 'id',
    tenant_id: 'tenant_id',
    clave: 'clave',
    descripcion: 'descripcion',
    unidad_medida: 'unidad_medida',
    tipo_insumo: 'tipo_insumo',
    costo_base: 'costo_base',
    categoria_gasto_id: 'categoria_gasto_id',
    activo: 'activo',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type InsumoScalarFieldEnum = (typeof InsumoScalarFieldEnum)[keyof typeof InsumoScalarFieldEnum]


  export const PresupuestoBaseScalarFieldEnum: {
    id: 'id',
    tenant_id: 'tenant_id',
    proyecto_id: 'proyecto_id',
    version: 'version',
    estado: 'estado',
    importe_total: 'importe_total',
    aprobado_por: 'aprobado_por',
    fecha_aprobacion: 'fecha_aprobacion',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type PresupuestoBaseScalarFieldEnum = (typeof PresupuestoBaseScalarFieldEnum)[keyof typeof PresupuestoBaseScalarFieldEnum]


  export const ConceptoScalarFieldEnum: {
    id: 'id',
    tenant_id: 'tenant_id',
    proyecto_id: 'proyecto_id',
    presupuesto_id: 'presupuesto_id',
    clave: 'clave',
    descripcion: 'descripcion',
    unidad_medida: 'unidad_medida',
    cantidad: 'cantidad',
    precio_unitario: 'precio_unitario',
    importe: 'importe',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type ConceptoScalarFieldEnum = (typeof ConceptoScalarFieldEnum)[keyof typeof ConceptoScalarFieldEnum]


  export const ConceptoInsumoScalarFieldEnum: {
    id: 'id',
    tenant_id: 'tenant_id',
    proyecto_id: 'proyecto_id',
    concepto_id: 'concepto_id',
    insumo_id: 'insumo_id',
    tipo_insumo: 'tipo_insumo',
    cantidad: 'cantidad',
    rendimiento: 'rendimiento',
    costo_unitario: 'costo_unitario',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type ConceptoInsumoScalarFieldEnum = (typeof ConceptoInsumoScalarFieldEnum)[keyof typeof ConceptoInsumoScalarFieldEnum]


  export const SaldoPartidaScalarFieldEnum: {
    id: 'id',
    tenant_id: 'tenant_id',
    proyecto_id: 'proyecto_id',
    concepto_id: 'concepto_id',
    concepto_clave: 'concepto_clave',
    concepto_desc: 'concepto_desc',
    monto_aprobado: 'monto_aprobado',
    monto_comprometido: 'monto_comprometido',
    monto_ejercido: 'monto_ejercido',
    monto_en_proceso: 'monto_en_proceso',
    monto_disponible: 'monto_disponible',
    estado_tope: 'estado_tope',
    bloqueo_automatico: 'bloqueo_automatico',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type SaldoPartidaScalarFieldEnum = (typeof SaldoPartidaScalarFieldEnum)[keyof typeof SaldoPartidaScalarFieldEnum]


  export const SaldoMovimientoScalarFieldEnum: {
    id: 'id',
    tenant_id: 'tenant_id',
    saldo_partida_id: 'saldo_partida_id',
    referencia_id: 'referencia_id',
    referencia_codigo: 'referencia_codigo',
    tipo: 'tipo',
    campo: 'campo',
    delta: 'delta',
    saldo_resultante: 'saldo_resultante',
    created_at: 'created_at'
  };

  export type SaldoMovimientoScalarFieldEnum = (typeof SaldoMovimientoScalarFieldEnum)[keyof typeof SaldoMovimientoScalarFieldEnum]


  export const FichaTecnicaInsumoScalarFieldEnum: {
    id_ficha: 'id_ficha',
    tenant_id: 'tenant_id',
    insumo_id: 'insumo_id',
    proveedor_ref: 'proveedor_ref',
    nombre_doc: 'nombre_doc',
    ruta_archivo: 'ruta_archivo',
    mime_type: 'mime_type',
    tamano_bytes: 'tamano_bytes',
    subido_por: 'subido_por',
    created_at: 'created_at'
  };

  export type FichaTecnicaInsumoScalarFieldEnum = (typeof FichaTecnicaInsumoScalarFieldEnum)[keyof typeof FichaTecnicaInsumoScalarFieldEnum]


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
   * Reference to a field of type 'TipoInsumo'
   */
  export type EnumTipoInsumoFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TipoInsumo'>
    


  /**
   * Reference to a field of type 'TipoInsumo[]'
   */
  export type ListEnumTipoInsumoFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TipoInsumo[]'>
    


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
   * Reference to a field of type 'EstadoPresupuesto'
   */
  export type EnumEstadoPresupuestoFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'EstadoPresupuesto'>
    


  /**
   * Reference to a field of type 'EstadoPresupuesto[]'
   */
  export type ListEnumEstadoPresupuestoFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'EstadoPresupuesto[]'>
    


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


  export type CategoriaGastoWhereInput = {
    AND?: CategoriaGastoWhereInput | CategoriaGastoWhereInput[]
    OR?: CategoriaGastoWhereInput[]
    NOT?: CategoriaGastoWhereInput | CategoriaGastoWhereInput[]
    id_categoria?: UuidFilter<"CategoriaGasto"> | string
    tenant_id?: UuidFilter<"CategoriaGasto"> | string
    proyecto_id?: UuidFilter<"CategoriaGasto"> | string
    nombre?: StringFilter<"CategoriaGasto"> | string
    es_predefinida?: BoolFilter<"CategoriaGasto"> | boolean
    activa?: BoolFilter<"CategoriaGasto"> | boolean
    created_at?: DateTimeFilter<"CategoriaGasto"> | Date | string
    insumos?: InsumoListRelationFilter
  }

  export type CategoriaGastoOrderByWithRelationInput = {
    id_categoria?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    nombre?: SortOrder
    es_predefinida?: SortOrder
    activa?: SortOrder
    created_at?: SortOrder
    insumos?: InsumoOrderByRelationAggregateInput
  }

  export type CategoriaGastoWhereUniqueInput = Prisma.AtLeast<{
    id_categoria?: string
    AND?: CategoriaGastoWhereInput | CategoriaGastoWhereInput[]
    OR?: CategoriaGastoWhereInput[]
    NOT?: CategoriaGastoWhereInput | CategoriaGastoWhereInput[]
    tenant_id?: UuidFilter<"CategoriaGasto"> | string
    proyecto_id?: UuidFilter<"CategoriaGasto"> | string
    nombre?: StringFilter<"CategoriaGasto"> | string
    es_predefinida?: BoolFilter<"CategoriaGasto"> | boolean
    activa?: BoolFilter<"CategoriaGasto"> | boolean
    created_at?: DateTimeFilter<"CategoriaGasto"> | Date | string
    insumos?: InsumoListRelationFilter
  }, "id_categoria">

  export type CategoriaGastoOrderByWithAggregationInput = {
    id_categoria?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    nombre?: SortOrder
    es_predefinida?: SortOrder
    activa?: SortOrder
    created_at?: SortOrder
    _count?: CategoriaGastoCountOrderByAggregateInput
    _max?: CategoriaGastoMaxOrderByAggregateInput
    _min?: CategoriaGastoMinOrderByAggregateInput
  }

  export type CategoriaGastoScalarWhereWithAggregatesInput = {
    AND?: CategoriaGastoScalarWhereWithAggregatesInput | CategoriaGastoScalarWhereWithAggregatesInput[]
    OR?: CategoriaGastoScalarWhereWithAggregatesInput[]
    NOT?: CategoriaGastoScalarWhereWithAggregatesInput | CategoriaGastoScalarWhereWithAggregatesInput[]
    id_categoria?: UuidWithAggregatesFilter<"CategoriaGasto"> | string
    tenant_id?: UuidWithAggregatesFilter<"CategoriaGasto"> | string
    proyecto_id?: UuidWithAggregatesFilter<"CategoriaGasto"> | string
    nombre?: StringWithAggregatesFilter<"CategoriaGasto"> | string
    es_predefinida?: BoolWithAggregatesFilter<"CategoriaGasto"> | boolean
    activa?: BoolWithAggregatesFilter<"CategoriaGasto"> | boolean
    created_at?: DateTimeWithAggregatesFilter<"CategoriaGasto"> | Date | string
  }

  export type ProyectoCostosConfigWhereInput = {
    AND?: ProyectoCostosConfigWhereInput | ProyectoCostosConfigWhereInput[]
    OR?: ProyectoCostosConfigWhereInput[]
    NOT?: ProyectoCostosConfigWhereInput | ProyectoCostosConfigWhereInput[]
    id?: UuidFilter<"ProyectoCostosConfig"> | string
    tenant_id?: UuidFilter<"ProyectoCostosConfig"> | string
    proyecto_id?: UuidFilter<"ProyectoCostosConfig"> | string
    estado?: StringFilter<"ProyectoCostosConfig"> | string
    activado_por?: UuidNullableFilter<"ProyectoCostosConfig"> | string | null
    fecha_activacion?: DateTimeNullableFilter<"ProyectoCostosConfig"> | Date | string | null
    created_at?: DateTimeFilter<"ProyectoCostosConfig"> | Date | string
    updated_at?: DateTimeFilter<"ProyectoCostosConfig"> | Date | string
  }

  export type ProyectoCostosConfigOrderByWithRelationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    estado?: SortOrder
    activado_por?: SortOrderInput | SortOrder
    fecha_activacion?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ProyectoCostosConfigWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    uq_proyecto_costos_config?: ProyectoCostosConfigUq_proyecto_costos_configCompoundUniqueInput
    AND?: ProyectoCostosConfigWhereInput | ProyectoCostosConfigWhereInput[]
    OR?: ProyectoCostosConfigWhereInput[]
    NOT?: ProyectoCostosConfigWhereInput | ProyectoCostosConfigWhereInput[]
    tenant_id?: UuidFilter<"ProyectoCostosConfig"> | string
    proyecto_id?: UuidFilter<"ProyectoCostosConfig"> | string
    estado?: StringFilter<"ProyectoCostosConfig"> | string
    activado_por?: UuidNullableFilter<"ProyectoCostosConfig"> | string | null
    fecha_activacion?: DateTimeNullableFilter<"ProyectoCostosConfig"> | Date | string | null
    created_at?: DateTimeFilter<"ProyectoCostosConfig"> | Date | string
    updated_at?: DateTimeFilter<"ProyectoCostosConfig"> | Date | string
  }, "id" | "uq_proyecto_costos_config">

  export type ProyectoCostosConfigOrderByWithAggregationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    estado?: SortOrder
    activado_por?: SortOrderInput | SortOrder
    fecha_activacion?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: ProyectoCostosConfigCountOrderByAggregateInput
    _max?: ProyectoCostosConfigMaxOrderByAggregateInput
    _min?: ProyectoCostosConfigMinOrderByAggregateInput
  }

  export type ProyectoCostosConfigScalarWhereWithAggregatesInput = {
    AND?: ProyectoCostosConfigScalarWhereWithAggregatesInput | ProyectoCostosConfigScalarWhereWithAggregatesInput[]
    OR?: ProyectoCostosConfigScalarWhereWithAggregatesInput[]
    NOT?: ProyectoCostosConfigScalarWhereWithAggregatesInput | ProyectoCostosConfigScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"ProyectoCostosConfig"> | string
    tenant_id?: UuidWithAggregatesFilter<"ProyectoCostosConfig"> | string
    proyecto_id?: UuidWithAggregatesFilter<"ProyectoCostosConfig"> | string
    estado?: StringWithAggregatesFilter<"ProyectoCostosConfig"> | string
    activado_por?: UuidNullableWithAggregatesFilter<"ProyectoCostosConfig"> | string | null
    fecha_activacion?: DateTimeNullableWithAggregatesFilter<"ProyectoCostosConfig"> | Date | string | null
    created_at?: DateTimeWithAggregatesFilter<"ProyectoCostosConfig"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"ProyectoCostosConfig"> | Date | string
  }

  export type InsumoWhereInput = {
    AND?: InsumoWhereInput | InsumoWhereInput[]
    OR?: InsumoWhereInput[]
    NOT?: InsumoWhereInput | InsumoWhereInput[]
    id?: UuidFilter<"Insumo"> | string
    tenant_id?: UuidFilter<"Insumo"> | string
    clave?: StringFilter<"Insumo"> | string
    descripcion?: StringFilter<"Insumo"> | string
    unidad_medida?: StringFilter<"Insumo"> | string
    tipo_insumo?: EnumTipoInsumoFilter<"Insumo"> | $Enums.TipoInsumo
    costo_base?: DecimalFilter<"Insumo"> | Decimal | DecimalJsLike | number | string
    categoria_gasto_id?: UuidNullableFilter<"Insumo"> | string | null
    activo?: BoolFilter<"Insumo"> | boolean
    created_at?: DateTimeFilter<"Insumo"> | Date | string
    updated_at?: DateTimeFilter<"Insumo"> | Date | string
    categoria_gasto?: XOR<CategoriaGastoNullableRelationFilter, CategoriaGastoWhereInput> | null
    concepto_insumos?: ConceptoInsumoListRelationFilter
  }

  export type InsumoOrderByWithRelationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    clave?: SortOrder
    descripcion?: SortOrder
    unidad_medida?: SortOrder
    tipo_insumo?: SortOrder
    costo_base?: SortOrder
    categoria_gasto_id?: SortOrderInput | SortOrder
    activo?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    categoria_gasto?: CategoriaGastoOrderByWithRelationInput
    concepto_insumos?: ConceptoInsumoOrderByRelationAggregateInput
  }

  export type InsumoWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    uq_insumo_tenant_clave?: InsumoUq_insumo_tenant_claveCompoundUniqueInput
    AND?: InsumoWhereInput | InsumoWhereInput[]
    OR?: InsumoWhereInput[]
    NOT?: InsumoWhereInput | InsumoWhereInput[]
    tenant_id?: UuidFilter<"Insumo"> | string
    clave?: StringFilter<"Insumo"> | string
    descripcion?: StringFilter<"Insumo"> | string
    unidad_medida?: StringFilter<"Insumo"> | string
    tipo_insumo?: EnumTipoInsumoFilter<"Insumo"> | $Enums.TipoInsumo
    costo_base?: DecimalFilter<"Insumo"> | Decimal | DecimalJsLike | number | string
    categoria_gasto_id?: UuidNullableFilter<"Insumo"> | string | null
    activo?: BoolFilter<"Insumo"> | boolean
    created_at?: DateTimeFilter<"Insumo"> | Date | string
    updated_at?: DateTimeFilter<"Insumo"> | Date | string
    categoria_gasto?: XOR<CategoriaGastoNullableRelationFilter, CategoriaGastoWhereInput> | null
    concepto_insumos?: ConceptoInsumoListRelationFilter
  }, "id" | "uq_insumo_tenant_clave">

  export type InsumoOrderByWithAggregationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    clave?: SortOrder
    descripcion?: SortOrder
    unidad_medida?: SortOrder
    tipo_insumo?: SortOrder
    costo_base?: SortOrder
    categoria_gasto_id?: SortOrderInput | SortOrder
    activo?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: InsumoCountOrderByAggregateInput
    _avg?: InsumoAvgOrderByAggregateInput
    _max?: InsumoMaxOrderByAggregateInput
    _min?: InsumoMinOrderByAggregateInput
    _sum?: InsumoSumOrderByAggregateInput
  }

  export type InsumoScalarWhereWithAggregatesInput = {
    AND?: InsumoScalarWhereWithAggregatesInput | InsumoScalarWhereWithAggregatesInput[]
    OR?: InsumoScalarWhereWithAggregatesInput[]
    NOT?: InsumoScalarWhereWithAggregatesInput | InsumoScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"Insumo"> | string
    tenant_id?: UuidWithAggregatesFilter<"Insumo"> | string
    clave?: StringWithAggregatesFilter<"Insumo"> | string
    descripcion?: StringWithAggregatesFilter<"Insumo"> | string
    unidad_medida?: StringWithAggregatesFilter<"Insumo"> | string
    tipo_insumo?: EnumTipoInsumoWithAggregatesFilter<"Insumo"> | $Enums.TipoInsumo
    costo_base?: DecimalWithAggregatesFilter<"Insumo"> | Decimal | DecimalJsLike | number | string
    categoria_gasto_id?: UuidNullableWithAggregatesFilter<"Insumo"> | string | null
    activo?: BoolWithAggregatesFilter<"Insumo"> | boolean
    created_at?: DateTimeWithAggregatesFilter<"Insumo"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"Insumo"> | Date | string
  }

  export type PresupuestoBaseWhereInput = {
    AND?: PresupuestoBaseWhereInput | PresupuestoBaseWhereInput[]
    OR?: PresupuestoBaseWhereInput[]
    NOT?: PresupuestoBaseWhereInput | PresupuestoBaseWhereInput[]
    id?: UuidFilter<"PresupuestoBase"> | string
    tenant_id?: UuidFilter<"PresupuestoBase"> | string
    proyecto_id?: UuidFilter<"PresupuestoBase"> | string
    version?: IntFilter<"PresupuestoBase"> | number
    estado?: EnumEstadoPresupuestoFilter<"PresupuestoBase"> | $Enums.EstadoPresupuesto
    importe_total?: DecimalFilter<"PresupuestoBase"> | Decimal | DecimalJsLike | number | string
    aprobado_por?: UuidNullableFilter<"PresupuestoBase"> | string | null
    fecha_aprobacion?: DateTimeNullableFilter<"PresupuestoBase"> | Date | string | null
    created_at?: DateTimeFilter<"PresupuestoBase"> | Date | string
    updated_at?: DateTimeFilter<"PresupuestoBase"> | Date | string
    conceptos?: ConceptoListRelationFilter
  }

  export type PresupuestoBaseOrderByWithRelationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    version?: SortOrder
    estado?: SortOrder
    importe_total?: SortOrder
    aprobado_por?: SortOrderInput | SortOrder
    fecha_aprobacion?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    conceptos?: ConceptoOrderByRelationAggregateInput
  }

  export type PresupuestoBaseWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PresupuestoBaseWhereInput | PresupuestoBaseWhereInput[]
    OR?: PresupuestoBaseWhereInput[]
    NOT?: PresupuestoBaseWhereInput | PresupuestoBaseWhereInput[]
    tenant_id?: UuidFilter<"PresupuestoBase"> | string
    proyecto_id?: UuidFilter<"PresupuestoBase"> | string
    version?: IntFilter<"PresupuestoBase"> | number
    estado?: EnumEstadoPresupuestoFilter<"PresupuestoBase"> | $Enums.EstadoPresupuesto
    importe_total?: DecimalFilter<"PresupuestoBase"> | Decimal | DecimalJsLike | number | string
    aprobado_por?: UuidNullableFilter<"PresupuestoBase"> | string | null
    fecha_aprobacion?: DateTimeNullableFilter<"PresupuestoBase"> | Date | string | null
    created_at?: DateTimeFilter<"PresupuestoBase"> | Date | string
    updated_at?: DateTimeFilter<"PresupuestoBase"> | Date | string
    conceptos?: ConceptoListRelationFilter
  }, "id">

  export type PresupuestoBaseOrderByWithAggregationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    version?: SortOrder
    estado?: SortOrder
    importe_total?: SortOrder
    aprobado_por?: SortOrderInput | SortOrder
    fecha_aprobacion?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: PresupuestoBaseCountOrderByAggregateInput
    _avg?: PresupuestoBaseAvgOrderByAggregateInput
    _max?: PresupuestoBaseMaxOrderByAggregateInput
    _min?: PresupuestoBaseMinOrderByAggregateInput
    _sum?: PresupuestoBaseSumOrderByAggregateInput
  }

  export type PresupuestoBaseScalarWhereWithAggregatesInput = {
    AND?: PresupuestoBaseScalarWhereWithAggregatesInput | PresupuestoBaseScalarWhereWithAggregatesInput[]
    OR?: PresupuestoBaseScalarWhereWithAggregatesInput[]
    NOT?: PresupuestoBaseScalarWhereWithAggregatesInput | PresupuestoBaseScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"PresupuestoBase"> | string
    tenant_id?: UuidWithAggregatesFilter<"PresupuestoBase"> | string
    proyecto_id?: UuidWithAggregatesFilter<"PresupuestoBase"> | string
    version?: IntWithAggregatesFilter<"PresupuestoBase"> | number
    estado?: EnumEstadoPresupuestoWithAggregatesFilter<"PresupuestoBase"> | $Enums.EstadoPresupuesto
    importe_total?: DecimalWithAggregatesFilter<"PresupuestoBase"> | Decimal | DecimalJsLike | number | string
    aprobado_por?: UuidNullableWithAggregatesFilter<"PresupuestoBase"> | string | null
    fecha_aprobacion?: DateTimeNullableWithAggregatesFilter<"PresupuestoBase"> | Date | string | null
    created_at?: DateTimeWithAggregatesFilter<"PresupuestoBase"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"PresupuestoBase"> | Date | string
  }

  export type ConceptoWhereInput = {
    AND?: ConceptoWhereInput | ConceptoWhereInput[]
    OR?: ConceptoWhereInput[]
    NOT?: ConceptoWhereInput | ConceptoWhereInput[]
    id?: UuidFilter<"Concepto"> | string
    tenant_id?: UuidFilter<"Concepto"> | string
    proyecto_id?: UuidFilter<"Concepto"> | string
    presupuesto_id?: UuidFilter<"Concepto"> | string
    clave?: StringFilter<"Concepto"> | string
    descripcion?: StringFilter<"Concepto"> | string
    unidad_medida?: StringFilter<"Concepto"> | string
    cantidad?: DecimalFilter<"Concepto"> | Decimal | DecimalJsLike | number | string
    precio_unitario?: DecimalFilter<"Concepto"> | Decimal | DecimalJsLike | number | string
    importe?: DecimalFilter<"Concepto"> | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFilter<"Concepto"> | Date | string
    updated_at?: DateTimeFilter<"Concepto"> | Date | string
    presupuesto?: XOR<PresupuestoBaseRelationFilter, PresupuestoBaseWhereInput>
    insumos?: ConceptoInsumoListRelationFilter
  }

  export type ConceptoOrderByWithRelationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    presupuesto_id?: SortOrder
    clave?: SortOrder
    descripcion?: SortOrder
    unidad_medida?: SortOrder
    cantidad?: SortOrder
    precio_unitario?: SortOrder
    importe?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    presupuesto?: PresupuestoBaseOrderByWithRelationInput
    insumos?: ConceptoInsumoOrderByRelationAggregateInput
  }

  export type ConceptoWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ConceptoWhereInput | ConceptoWhereInput[]
    OR?: ConceptoWhereInput[]
    NOT?: ConceptoWhereInput | ConceptoWhereInput[]
    tenant_id?: UuidFilter<"Concepto"> | string
    proyecto_id?: UuidFilter<"Concepto"> | string
    presupuesto_id?: UuidFilter<"Concepto"> | string
    clave?: StringFilter<"Concepto"> | string
    descripcion?: StringFilter<"Concepto"> | string
    unidad_medida?: StringFilter<"Concepto"> | string
    cantidad?: DecimalFilter<"Concepto"> | Decimal | DecimalJsLike | number | string
    precio_unitario?: DecimalFilter<"Concepto"> | Decimal | DecimalJsLike | number | string
    importe?: DecimalFilter<"Concepto"> | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFilter<"Concepto"> | Date | string
    updated_at?: DateTimeFilter<"Concepto"> | Date | string
    presupuesto?: XOR<PresupuestoBaseRelationFilter, PresupuestoBaseWhereInput>
    insumos?: ConceptoInsumoListRelationFilter
  }, "id">

  export type ConceptoOrderByWithAggregationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    presupuesto_id?: SortOrder
    clave?: SortOrder
    descripcion?: SortOrder
    unidad_medida?: SortOrder
    cantidad?: SortOrder
    precio_unitario?: SortOrder
    importe?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: ConceptoCountOrderByAggregateInput
    _avg?: ConceptoAvgOrderByAggregateInput
    _max?: ConceptoMaxOrderByAggregateInput
    _min?: ConceptoMinOrderByAggregateInput
    _sum?: ConceptoSumOrderByAggregateInput
  }

  export type ConceptoScalarWhereWithAggregatesInput = {
    AND?: ConceptoScalarWhereWithAggregatesInput | ConceptoScalarWhereWithAggregatesInput[]
    OR?: ConceptoScalarWhereWithAggregatesInput[]
    NOT?: ConceptoScalarWhereWithAggregatesInput | ConceptoScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"Concepto"> | string
    tenant_id?: UuidWithAggregatesFilter<"Concepto"> | string
    proyecto_id?: UuidWithAggregatesFilter<"Concepto"> | string
    presupuesto_id?: UuidWithAggregatesFilter<"Concepto"> | string
    clave?: StringWithAggregatesFilter<"Concepto"> | string
    descripcion?: StringWithAggregatesFilter<"Concepto"> | string
    unidad_medida?: StringWithAggregatesFilter<"Concepto"> | string
    cantidad?: DecimalWithAggregatesFilter<"Concepto"> | Decimal | DecimalJsLike | number | string
    precio_unitario?: DecimalWithAggregatesFilter<"Concepto"> | Decimal | DecimalJsLike | number | string
    importe?: DecimalWithAggregatesFilter<"Concepto"> | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeWithAggregatesFilter<"Concepto"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"Concepto"> | Date | string
  }

  export type ConceptoInsumoWhereInput = {
    AND?: ConceptoInsumoWhereInput | ConceptoInsumoWhereInput[]
    OR?: ConceptoInsumoWhereInput[]
    NOT?: ConceptoInsumoWhereInput | ConceptoInsumoWhereInput[]
    id?: UuidFilter<"ConceptoInsumo"> | string
    tenant_id?: UuidFilter<"ConceptoInsumo"> | string
    proyecto_id?: UuidFilter<"ConceptoInsumo"> | string
    concepto_id?: UuidFilter<"ConceptoInsumo"> | string
    insumo_id?: UuidFilter<"ConceptoInsumo"> | string
    tipo_insumo?: EnumTipoInsumoFilter<"ConceptoInsumo"> | $Enums.TipoInsumo
    cantidad?: DecimalFilter<"ConceptoInsumo"> | Decimal | DecimalJsLike | number | string
    rendimiento?: DecimalFilter<"ConceptoInsumo"> | Decimal | DecimalJsLike | number | string
    costo_unitario?: DecimalFilter<"ConceptoInsumo"> | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFilter<"ConceptoInsumo"> | Date | string
    updated_at?: DateTimeFilter<"ConceptoInsumo"> | Date | string
    concepto?: XOR<ConceptoRelationFilter, ConceptoWhereInput>
    insumo?: XOR<InsumoRelationFilter, InsumoWhereInput>
  }

  export type ConceptoInsumoOrderByWithRelationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    concepto_id?: SortOrder
    insumo_id?: SortOrder
    tipo_insumo?: SortOrder
    cantidad?: SortOrder
    rendimiento?: SortOrder
    costo_unitario?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    concepto?: ConceptoOrderByWithRelationInput
    insumo?: InsumoOrderByWithRelationInput
  }

  export type ConceptoInsumoWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    uq_concepto_insumo?: ConceptoInsumoUq_concepto_insumoCompoundUniqueInput
    AND?: ConceptoInsumoWhereInput | ConceptoInsumoWhereInput[]
    OR?: ConceptoInsumoWhereInput[]
    NOT?: ConceptoInsumoWhereInput | ConceptoInsumoWhereInput[]
    tenant_id?: UuidFilter<"ConceptoInsumo"> | string
    proyecto_id?: UuidFilter<"ConceptoInsumo"> | string
    concepto_id?: UuidFilter<"ConceptoInsumo"> | string
    insumo_id?: UuidFilter<"ConceptoInsumo"> | string
    tipo_insumo?: EnumTipoInsumoFilter<"ConceptoInsumo"> | $Enums.TipoInsumo
    cantidad?: DecimalFilter<"ConceptoInsumo"> | Decimal | DecimalJsLike | number | string
    rendimiento?: DecimalFilter<"ConceptoInsumo"> | Decimal | DecimalJsLike | number | string
    costo_unitario?: DecimalFilter<"ConceptoInsumo"> | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFilter<"ConceptoInsumo"> | Date | string
    updated_at?: DateTimeFilter<"ConceptoInsumo"> | Date | string
    concepto?: XOR<ConceptoRelationFilter, ConceptoWhereInput>
    insumo?: XOR<InsumoRelationFilter, InsumoWhereInput>
  }, "id" | "uq_concepto_insumo">

  export type ConceptoInsumoOrderByWithAggregationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    concepto_id?: SortOrder
    insumo_id?: SortOrder
    tipo_insumo?: SortOrder
    cantidad?: SortOrder
    rendimiento?: SortOrder
    costo_unitario?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: ConceptoInsumoCountOrderByAggregateInput
    _avg?: ConceptoInsumoAvgOrderByAggregateInput
    _max?: ConceptoInsumoMaxOrderByAggregateInput
    _min?: ConceptoInsumoMinOrderByAggregateInput
    _sum?: ConceptoInsumoSumOrderByAggregateInput
  }

  export type ConceptoInsumoScalarWhereWithAggregatesInput = {
    AND?: ConceptoInsumoScalarWhereWithAggregatesInput | ConceptoInsumoScalarWhereWithAggregatesInput[]
    OR?: ConceptoInsumoScalarWhereWithAggregatesInput[]
    NOT?: ConceptoInsumoScalarWhereWithAggregatesInput | ConceptoInsumoScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"ConceptoInsumo"> | string
    tenant_id?: UuidWithAggregatesFilter<"ConceptoInsumo"> | string
    proyecto_id?: UuidWithAggregatesFilter<"ConceptoInsumo"> | string
    concepto_id?: UuidWithAggregatesFilter<"ConceptoInsumo"> | string
    insumo_id?: UuidWithAggregatesFilter<"ConceptoInsumo"> | string
    tipo_insumo?: EnumTipoInsumoWithAggregatesFilter<"ConceptoInsumo"> | $Enums.TipoInsumo
    cantidad?: DecimalWithAggregatesFilter<"ConceptoInsumo"> | Decimal | DecimalJsLike | number | string
    rendimiento?: DecimalWithAggregatesFilter<"ConceptoInsumo"> | Decimal | DecimalJsLike | number | string
    costo_unitario?: DecimalWithAggregatesFilter<"ConceptoInsumo"> | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeWithAggregatesFilter<"ConceptoInsumo"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"ConceptoInsumo"> | Date | string
  }

  export type SaldoPartidaWhereInput = {
    AND?: SaldoPartidaWhereInput | SaldoPartidaWhereInput[]
    OR?: SaldoPartidaWhereInput[]
    NOT?: SaldoPartidaWhereInput | SaldoPartidaWhereInput[]
    id?: UuidFilter<"SaldoPartida"> | string
    tenant_id?: UuidFilter<"SaldoPartida"> | string
    proyecto_id?: UuidFilter<"SaldoPartida"> | string
    concepto_id?: UuidFilter<"SaldoPartida"> | string
    concepto_clave?: StringFilter<"SaldoPartida"> | string
    concepto_desc?: StringFilter<"SaldoPartida"> | string
    monto_aprobado?: DecimalFilter<"SaldoPartida"> | Decimal | DecimalJsLike | number | string
    monto_comprometido?: DecimalFilter<"SaldoPartida"> | Decimal | DecimalJsLike | number | string
    monto_ejercido?: DecimalFilter<"SaldoPartida"> | Decimal | DecimalJsLike | number | string
    monto_en_proceso?: DecimalFilter<"SaldoPartida"> | Decimal | DecimalJsLike | number | string
    monto_disponible?: DecimalFilter<"SaldoPartida"> | Decimal | DecimalJsLike | number | string
    estado_tope?: StringFilter<"SaldoPartida"> | string
    bloqueo_automatico?: BoolFilter<"SaldoPartida"> | boolean
    created_at?: DateTimeFilter<"SaldoPartida"> | Date | string
    updated_at?: DateTimeFilter<"SaldoPartida"> | Date | string
    movimientos?: SaldoMovimientoListRelationFilter
  }

  export type SaldoPartidaOrderByWithRelationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    concepto_id?: SortOrder
    concepto_clave?: SortOrder
    concepto_desc?: SortOrder
    monto_aprobado?: SortOrder
    monto_comprometido?: SortOrder
    monto_ejercido?: SortOrder
    monto_en_proceso?: SortOrder
    monto_disponible?: SortOrder
    estado_tope?: SortOrder
    bloqueo_automatico?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    movimientos?: SaldoMovimientoOrderByRelationAggregateInput
  }

  export type SaldoPartidaWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    uq_saldo_partida?: SaldoPartidaUq_saldo_partidaCompoundUniqueInput
    AND?: SaldoPartidaWhereInput | SaldoPartidaWhereInput[]
    OR?: SaldoPartidaWhereInput[]
    NOT?: SaldoPartidaWhereInput | SaldoPartidaWhereInput[]
    tenant_id?: UuidFilter<"SaldoPartida"> | string
    proyecto_id?: UuidFilter<"SaldoPartida"> | string
    concepto_id?: UuidFilter<"SaldoPartida"> | string
    concepto_clave?: StringFilter<"SaldoPartida"> | string
    concepto_desc?: StringFilter<"SaldoPartida"> | string
    monto_aprobado?: DecimalFilter<"SaldoPartida"> | Decimal | DecimalJsLike | number | string
    monto_comprometido?: DecimalFilter<"SaldoPartida"> | Decimal | DecimalJsLike | number | string
    monto_ejercido?: DecimalFilter<"SaldoPartida"> | Decimal | DecimalJsLike | number | string
    monto_en_proceso?: DecimalFilter<"SaldoPartida"> | Decimal | DecimalJsLike | number | string
    monto_disponible?: DecimalFilter<"SaldoPartida"> | Decimal | DecimalJsLike | number | string
    estado_tope?: StringFilter<"SaldoPartida"> | string
    bloqueo_automatico?: BoolFilter<"SaldoPartida"> | boolean
    created_at?: DateTimeFilter<"SaldoPartida"> | Date | string
    updated_at?: DateTimeFilter<"SaldoPartida"> | Date | string
    movimientos?: SaldoMovimientoListRelationFilter
  }, "id" | "uq_saldo_partida">

  export type SaldoPartidaOrderByWithAggregationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    concepto_id?: SortOrder
    concepto_clave?: SortOrder
    concepto_desc?: SortOrder
    monto_aprobado?: SortOrder
    monto_comprometido?: SortOrder
    monto_ejercido?: SortOrder
    monto_en_proceso?: SortOrder
    monto_disponible?: SortOrder
    estado_tope?: SortOrder
    bloqueo_automatico?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: SaldoPartidaCountOrderByAggregateInput
    _avg?: SaldoPartidaAvgOrderByAggregateInput
    _max?: SaldoPartidaMaxOrderByAggregateInput
    _min?: SaldoPartidaMinOrderByAggregateInput
    _sum?: SaldoPartidaSumOrderByAggregateInput
  }

  export type SaldoPartidaScalarWhereWithAggregatesInput = {
    AND?: SaldoPartidaScalarWhereWithAggregatesInput | SaldoPartidaScalarWhereWithAggregatesInput[]
    OR?: SaldoPartidaScalarWhereWithAggregatesInput[]
    NOT?: SaldoPartidaScalarWhereWithAggregatesInput | SaldoPartidaScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"SaldoPartida"> | string
    tenant_id?: UuidWithAggregatesFilter<"SaldoPartida"> | string
    proyecto_id?: UuidWithAggregatesFilter<"SaldoPartida"> | string
    concepto_id?: UuidWithAggregatesFilter<"SaldoPartida"> | string
    concepto_clave?: StringWithAggregatesFilter<"SaldoPartida"> | string
    concepto_desc?: StringWithAggregatesFilter<"SaldoPartida"> | string
    monto_aprobado?: DecimalWithAggregatesFilter<"SaldoPartida"> | Decimal | DecimalJsLike | number | string
    monto_comprometido?: DecimalWithAggregatesFilter<"SaldoPartida"> | Decimal | DecimalJsLike | number | string
    monto_ejercido?: DecimalWithAggregatesFilter<"SaldoPartida"> | Decimal | DecimalJsLike | number | string
    monto_en_proceso?: DecimalWithAggregatesFilter<"SaldoPartida"> | Decimal | DecimalJsLike | number | string
    monto_disponible?: DecimalWithAggregatesFilter<"SaldoPartida"> | Decimal | DecimalJsLike | number | string
    estado_tope?: StringWithAggregatesFilter<"SaldoPartida"> | string
    bloqueo_automatico?: BoolWithAggregatesFilter<"SaldoPartida"> | boolean
    created_at?: DateTimeWithAggregatesFilter<"SaldoPartida"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"SaldoPartida"> | Date | string
  }

  export type SaldoMovimientoWhereInput = {
    AND?: SaldoMovimientoWhereInput | SaldoMovimientoWhereInput[]
    OR?: SaldoMovimientoWhereInput[]
    NOT?: SaldoMovimientoWhereInput | SaldoMovimientoWhereInput[]
    id?: UuidFilter<"SaldoMovimiento"> | string
    tenant_id?: UuidFilter<"SaldoMovimiento"> | string
    saldo_partida_id?: UuidFilter<"SaldoMovimiento"> | string
    referencia_id?: UuidFilter<"SaldoMovimiento"> | string
    referencia_codigo?: StringNullableFilter<"SaldoMovimiento"> | string | null
    tipo?: StringFilter<"SaldoMovimiento"> | string
    campo?: StringFilter<"SaldoMovimiento"> | string
    delta?: DecimalFilter<"SaldoMovimiento"> | Decimal | DecimalJsLike | number | string
    saldo_resultante?: DecimalFilter<"SaldoMovimiento"> | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFilter<"SaldoMovimiento"> | Date | string
    saldo_partida?: XOR<SaldoPartidaRelationFilter, SaldoPartidaWhereInput>
  }

  export type SaldoMovimientoOrderByWithRelationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    saldo_partida_id?: SortOrder
    referencia_id?: SortOrder
    referencia_codigo?: SortOrderInput | SortOrder
    tipo?: SortOrder
    campo?: SortOrder
    delta?: SortOrder
    saldo_resultante?: SortOrder
    created_at?: SortOrder
    saldo_partida?: SaldoPartidaOrderByWithRelationInput
  }

  export type SaldoMovimientoWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    uq_saldo_movimiento_idem?: SaldoMovimientoUq_saldo_movimiento_idemCompoundUniqueInput
    AND?: SaldoMovimientoWhereInput | SaldoMovimientoWhereInput[]
    OR?: SaldoMovimientoWhereInput[]
    NOT?: SaldoMovimientoWhereInput | SaldoMovimientoWhereInput[]
    tenant_id?: UuidFilter<"SaldoMovimiento"> | string
    saldo_partida_id?: UuidFilter<"SaldoMovimiento"> | string
    referencia_id?: UuidFilter<"SaldoMovimiento"> | string
    referencia_codigo?: StringNullableFilter<"SaldoMovimiento"> | string | null
    tipo?: StringFilter<"SaldoMovimiento"> | string
    campo?: StringFilter<"SaldoMovimiento"> | string
    delta?: DecimalFilter<"SaldoMovimiento"> | Decimal | DecimalJsLike | number | string
    saldo_resultante?: DecimalFilter<"SaldoMovimiento"> | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFilter<"SaldoMovimiento"> | Date | string
    saldo_partida?: XOR<SaldoPartidaRelationFilter, SaldoPartidaWhereInput>
  }, "id" | "uq_saldo_movimiento_idem">

  export type SaldoMovimientoOrderByWithAggregationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    saldo_partida_id?: SortOrder
    referencia_id?: SortOrder
    referencia_codigo?: SortOrderInput | SortOrder
    tipo?: SortOrder
    campo?: SortOrder
    delta?: SortOrder
    saldo_resultante?: SortOrder
    created_at?: SortOrder
    _count?: SaldoMovimientoCountOrderByAggregateInput
    _avg?: SaldoMovimientoAvgOrderByAggregateInput
    _max?: SaldoMovimientoMaxOrderByAggregateInput
    _min?: SaldoMovimientoMinOrderByAggregateInput
    _sum?: SaldoMovimientoSumOrderByAggregateInput
  }

  export type SaldoMovimientoScalarWhereWithAggregatesInput = {
    AND?: SaldoMovimientoScalarWhereWithAggregatesInput | SaldoMovimientoScalarWhereWithAggregatesInput[]
    OR?: SaldoMovimientoScalarWhereWithAggregatesInput[]
    NOT?: SaldoMovimientoScalarWhereWithAggregatesInput | SaldoMovimientoScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"SaldoMovimiento"> | string
    tenant_id?: UuidWithAggregatesFilter<"SaldoMovimiento"> | string
    saldo_partida_id?: UuidWithAggregatesFilter<"SaldoMovimiento"> | string
    referencia_id?: UuidWithAggregatesFilter<"SaldoMovimiento"> | string
    referencia_codigo?: StringNullableWithAggregatesFilter<"SaldoMovimiento"> | string | null
    tipo?: StringWithAggregatesFilter<"SaldoMovimiento"> | string
    campo?: StringWithAggregatesFilter<"SaldoMovimiento"> | string
    delta?: DecimalWithAggregatesFilter<"SaldoMovimiento"> | Decimal | DecimalJsLike | number | string
    saldo_resultante?: DecimalWithAggregatesFilter<"SaldoMovimiento"> | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeWithAggregatesFilter<"SaldoMovimiento"> | Date | string
  }

  export type FichaTecnicaInsumoWhereInput = {
    AND?: FichaTecnicaInsumoWhereInput | FichaTecnicaInsumoWhereInput[]
    OR?: FichaTecnicaInsumoWhereInput[]
    NOT?: FichaTecnicaInsumoWhereInput | FichaTecnicaInsumoWhereInput[]
    id_ficha?: UuidFilter<"FichaTecnicaInsumo"> | string
    tenant_id?: UuidFilter<"FichaTecnicaInsumo"> | string
    insumo_id?: UuidFilter<"FichaTecnicaInsumo"> | string
    proveedor_ref?: StringNullableFilter<"FichaTecnicaInsumo"> | string | null
    nombre_doc?: StringFilter<"FichaTecnicaInsumo"> | string
    ruta_archivo?: StringFilter<"FichaTecnicaInsumo"> | string
    mime_type?: StringFilter<"FichaTecnicaInsumo"> | string
    tamano_bytes?: IntFilter<"FichaTecnicaInsumo"> | number
    subido_por?: UuidFilter<"FichaTecnicaInsumo"> | string
    created_at?: DateTimeFilter<"FichaTecnicaInsumo"> | Date | string
  }

  export type FichaTecnicaInsumoOrderByWithRelationInput = {
    id_ficha?: SortOrder
    tenant_id?: SortOrder
    insumo_id?: SortOrder
    proveedor_ref?: SortOrderInput | SortOrder
    nombre_doc?: SortOrder
    ruta_archivo?: SortOrder
    mime_type?: SortOrder
    tamano_bytes?: SortOrder
    subido_por?: SortOrder
    created_at?: SortOrder
  }

  export type FichaTecnicaInsumoWhereUniqueInput = Prisma.AtLeast<{
    id_ficha?: string
    AND?: FichaTecnicaInsumoWhereInput | FichaTecnicaInsumoWhereInput[]
    OR?: FichaTecnicaInsumoWhereInput[]
    NOT?: FichaTecnicaInsumoWhereInput | FichaTecnicaInsumoWhereInput[]
    tenant_id?: UuidFilter<"FichaTecnicaInsumo"> | string
    insumo_id?: UuidFilter<"FichaTecnicaInsumo"> | string
    proveedor_ref?: StringNullableFilter<"FichaTecnicaInsumo"> | string | null
    nombre_doc?: StringFilter<"FichaTecnicaInsumo"> | string
    ruta_archivo?: StringFilter<"FichaTecnicaInsumo"> | string
    mime_type?: StringFilter<"FichaTecnicaInsumo"> | string
    tamano_bytes?: IntFilter<"FichaTecnicaInsumo"> | number
    subido_por?: UuidFilter<"FichaTecnicaInsumo"> | string
    created_at?: DateTimeFilter<"FichaTecnicaInsumo"> | Date | string
  }, "id_ficha">

  export type FichaTecnicaInsumoOrderByWithAggregationInput = {
    id_ficha?: SortOrder
    tenant_id?: SortOrder
    insumo_id?: SortOrder
    proveedor_ref?: SortOrderInput | SortOrder
    nombre_doc?: SortOrder
    ruta_archivo?: SortOrder
    mime_type?: SortOrder
    tamano_bytes?: SortOrder
    subido_por?: SortOrder
    created_at?: SortOrder
    _count?: FichaTecnicaInsumoCountOrderByAggregateInput
    _avg?: FichaTecnicaInsumoAvgOrderByAggregateInput
    _max?: FichaTecnicaInsumoMaxOrderByAggregateInput
    _min?: FichaTecnicaInsumoMinOrderByAggregateInput
    _sum?: FichaTecnicaInsumoSumOrderByAggregateInput
  }

  export type FichaTecnicaInsumoScalarWhereWithAggregatesInput = {
    AND?: FichaTecnicaInsumoScalarWhereWithAggregatesInput | FichaTecnicaInsumoScalarWhereWithAggregatesInput[]
    OR?: FichaTecnicaInsumoScalarWhereWithAggregatesInput[]
    NOT?: FichaTecnicaInsumoScalarWhereWithAggregatesInput | FichaTecnicaInsumoScalarWhereWithAggregatesInput[]
    id_ficha?: UuidWithAggregatesFilter<"FichaTecnicaInsumo"> | string
    tenant_id?: UuidWithAggregatesFilter<"FichaTecnicaInsumo"> | string
    insumo_id?: UuidWithAggregatesFilter<"FichaTecnicaInsumo"> | string
    proveedor_ref?: StringNullableWithAggregatesFilter<"FichaTecnicaInsumo"> | string | null
    nombre_doc?: StringWithAggregatesFilter<"FichaTecnicaInsumo"> | string
    ruta_archivo?: StringWithAggregatesFilter<"FichaTecnicaInsumo"> | string
    mime_type?: StringWithAggregatesFilter<"FichaTecnicaInsumo"> | string
    tamano_bytes?: IntWithAggregatesFilter<"FichaTecnicaInsumo"> | number
    subido_por?: UuidWithAggregatesFilter<"FichaTecnicaInsumo"> | string
    created_at?: DateTimeWithAggregatesFilter<"FichaTecnicaInsumo"> | Date | string
  }

  export type CategoriaGastoCreateInput = {
    id_categoria?: string
    tenant_id: string
    proyecto_id: string
    nombre: string
    es_predefinida?: boolean
    activa?: boolean
    created_at?: Date | string
    insumos?: InsumoCreateNestedManyWithoutCategoria_gastoInput
  }

  export type CategoriaGastoUncheckedCreateInput = {
    id_categoria?: string
    tenant_id: string
    proyecto_id: string
    nombre: string
    es_predefinida?: boolean
    activa?: boolean
    created_at?: Date | string
    insumos?: InsumoUncheckedCreateNestedManyWithoutCategoria_gastoInput
  }

  export type CategoriaGastoUpdateInput = {
    id_categoria?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    es_predefinida?: BoolFieldUpdateOperationsInput | boolean
    activa?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    insumos?: InsumoUpdateManyWithoutCategoria_gastoNestedInput
  }

  export type CategoriaGastoUncheckedUpdateInput = {
    id_categoria?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    es_predefinida?: BoolFieldUpdateOperationsInput | boolean
    activa?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    insumos?: InsumoUncheckedUpdateManyWithoutCategoria_gastoNestedInput
  }

  export type CategoriaGastoCreateManyInput = {
    id_categoria?: string
    tenant_id: string
    proyecto_id: string
    nombre: string
    es_predefinida?: boolean
    activa?: boolean
    created_at?: Date | string
  }

  export type CategoriaGastoUpdateManyMutationInput = {
    id_categoria?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    es_predefinida?: BoolFieldUpdateOperationsInput | boolean
    activa?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CategoriaGastoUncheckedUpdateManyInput = {
    id_categoria?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    es_predefinida?: BoolFieldUpdateOperationsInput | boolean
    activa?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProyectoCostosConfigCreateInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    estado?: string
    activado_por?: string | null
    fecha_activacion?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ProyectoCostosConfigUncheckedCreateInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    estado?: string
    activado_por?: string | null
    fecha_activacion?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ProyectoCostosConfigUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    activado_por?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_activacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProyectoCostosConfigUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    activado_por?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_activacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProyectoCostosConfigCreateManyInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    estado?: string
    activado_por?: string | null
    fecha_activacion?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ProyectoCostosConfigUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    activado_por?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_activacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProyectoCostosConfigUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    activado_por?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_activacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InsumoCreateInput = {
    id?: string
    tenant_id: string
    clave: string
    descripcion: string
    unidad_medida: string
    tipo_insumo: $Enums.TipoInsumo
    costo_base: Decimal | DecimalJsLike | number | string
    activo?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    categoria_gasto?: CategoriaGastoCreateNestedOneWithoutInsumosInput
    concepto_insumos?: ConceptoInsumoCreateNestedManyWithoutInsumoInput
  }

  export type InsumoUncheckedCreateInput = {
    id?: string
    tenant_id: string
    clave: string
    descripcion: string
    unidad_medida: string
    tipo_insumo: $Enums.TipoInsumo
    costo_base: Decimal | DecimalJsLike | number | string
    categoria_gasto_id?: string | null
    activo?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    concepto_insumos?: ConceptoInsumoUncheckedCreateNestedManyWithoutInsumoInput
  }

  export type InsumoUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    clave?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    unidad_medida?: StringFieldUpdateOperationsInput | string
    tipo_insumo?: EnumTipoInsumoFieldUpdateOperationsInput | $Enums.TipoInsumo
    costo_base?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    categoria_gasto?: CategoriaGastoUpdateOneWithoutInsumosNestedInput
    concepto_insumos?: ConceptoInsumoUpdateManyWithoutInsumoNestedInput
  }

  export type InsumoUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    clave?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    unidad_medida?: StringFieldUpdateOperationsInput | string
    tipo_insumo?: EnumTipoInsumoFieldUpdateOperationsInput | $Enums.TipoInsumo
    costo_base?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    categoria_gasto_id?: NullableStringFieldUpdateOperationsInput | string | null
    activo?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    concepto_insumos?: ConceptoInsumoUncheckedUpdateManyWithoutInsumoNestedInput
  }

  export type InsumoCreateManyInput = {
    id?: string
    tenant_id: string
    clave: string
    descripcion: string
    unidad_medida: string
    tipo_insumo: $Enums.TipoInsumo
    costo_base: Decimal | DecimalJsLike | number | string
    categoria_gasto_id?: string | null
    activo?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type InsumoUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    clave?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    unidad_medida?: StringFieldUpdateOperationsInput | string
    tipo_insumo?: EnumTipoInsumoFieldUpdateOperationsInput | $Enums.TipoInsumo
    costo_base?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InsumoUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    clave?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    unidad_medida?: StringFieldUpdateOperationsInput | string
    tipo_insumo?: EnumTipoInsumoFieldUpdateOperationsInput | $Enums.TipoInsumo
    costo_base?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    categoria_gasto_id?: NullableStringFieldUpdateOperationsInput | string | null
    activo?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PresupuestoBaseCreateInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    version?: number
    estado?: $Enums.EstadoPresupuesto
    importe_total?: Decimal | DecimalJsLike | number | string
    aprobado_por?: string | null
    fecha_aprobacion?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
    conceptos?: ConceptoCreateNestedManyWithoutPresupuestoInput
  }

  export type PresupuestoBaseUncheckedCreateInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    version?: number
    estado?: $Enums.EstadoPresupuesto
    importe_total?: Decimal | DecimalJsLike | number | string
    aprobado_por?: string | null
    fecha_aprobacion?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
    conceptos?: ConceptoUncheckedCreateNestedManyWithoutPresupuestoInput
  }

  export type PresupuestoBaseUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    version?: IntFieldUpdateOperationsInput | number
    estado?: EnumEstadoPresupuestoFieldUpdateOperationsInput | $Enums.EstadoPresupuesto
    importe_total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    aprobado_por?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_aprobacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    conceptos?: ConceptoUpdateManyWithoutPresupuestoNestedInput
  }

  export type PresupuestoBaseUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    version?: IntFieldUpdateOperationsInput | number
    estado?: EnumEstadoPresupuestoFieldUpdateOperationsInput | $Enums.EstadoPresupuesto
    importe_total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    aprobado_por?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_aprobacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    conceptos?: ConceptoUncheckedUpdateManyWithoutPresupuestoNestedInput
  }

  export type PresupuestoBaseCreateManyInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    version?: number
    estado?: $Enums.EstadoPresupuesto
    importe_total?: Decimal | DecimalJsLike | number | string
    aprobado_por?: string | null
    fecha_aprobacion?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type PresupuestoBaseUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    version?: IntFieldUpdateOperationsInput | number
    estado?: EnumEstadoPresupuestoFieldUpdateOperationsInput | $Enums.EstadoPresupuesto
    importe_total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    aprobado_por?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_aprobacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PresupuestoBaseUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    version?: IntFieldUpdateOperationsInput | number
    estado?: EnumEstadoPresupuestoFieldUpdateOperationsInput | $Enums.EstadoPresupuesto
    importe_total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    aprobado_por?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_aprobacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConceptoCreateInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    clave: string
    descripcion: string
    unidad_medida: string
    cantidad: Decimal | DecimalJsLike | number | string
    precio_unitario: Decimal | DecimalJsLike | number | string
    importe: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
    presupuesto: PresupuestoBaseCreateNestedOneWithoutConceptosInput
    insumos?: ConceptoInsumoCreateNestedManyWithoutConceptoInput
  }

  export type ConceptoUncheckedCreateInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    presupuesto_id: string
    clave: string
    descripcion: string
    unidad_medida: string
    cantidad: Decimal | DecimalJsLike | number | string
    precio_unitario: Decimal | DecimalJsLike | number | string
    importe: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
    insumos?: ConceptoInsumoUncheckedCreateNestedManyWithoutConceptoInput
  }

  export type ConceptoUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    clave?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    unidad_medida?: StringFieldUpdateOperationsInput | string
    cantidad?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    precio_unitario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    importe?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    presupuesto?: PresupuestoBaseUpdateOneRequiredWithoutConceptosNestedInput
    insumos?: ConceptoInsumoUpdateManyWithoutConceptoNestedInput
  }

  export type ConceptoUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    presupuesto_id?: StringFieldUpdateOperationsInput | string
    clave?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    unidad_medida?: StringFieldUpdateOperationsInput | string
    cantidad?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    precio_unitario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    importe?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    insumos?: ConceptoInsumoUncheckedUpdateManyWithoutConceptoNestedInput
  }

  export type ConceptoCreateManyInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    presupuesto_id: string
    clave: string
    descripcion: string
    unidad_medida: string
    cantidad: Decimal | DecimalJsLike | number | string
    precio_unitario: Decimal | DecimalJsLike | number | string
    importe: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ConceptoUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    clave?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    unidad_medida?: StringFieldUpdateOperationsInput | string
    cantidad?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    precio_unitario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    importe?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConceptoUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    presupuesto_id?: StringFieldUpdateOperationsInput | string
    clave?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    unidad_medida?: StringFieldUpdateOperationsInput | string
    cantidad?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    precio_unitario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    importe?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConceptoInsumoCreateInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    tipo_insumo: $Enums.TipoInsumo
    cantidad: Decimal | DecimalJsLike | number | string
    rendimiento?: Decimal | DecimalJsLike | number | string
    costo_unitario?: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
    concepto: ConceptoCreateNestedOneWithoutInsumosInput
    insumo: InsumoCreateNestedOneWithoutConcepto_insumosInput
  }

  export type ConceptoInsumoUncheckedCreateInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    concepto_id: string
    insumo_id: string
    tipo_insumo: $Enums.TipoInsumo
    cantidad: Decimal | DecimalJsLike | number | string
    rendimiento?: Decimal | DecimalJsLike | number | string
    costo_unitario?: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ConceptoInsumoUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    tipo_insumo?: EnumTipoInsumoFieldUpdateOperationsInput | $Enums.TipoInsumo
    cantidad?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    rendimiento?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    costo_unitario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    concepto?: ConceptoUpdateOneRequiredWithoutInsumosNestedInput
    insumo?: InsumoUpdateOneRequiredWithoutConcepto_insumosNestedInput
  }

  export type ConceptoInsumoUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    concepto_id?: StringFieldUpdateOperationsInput | string
    insumo_id?: StringFieldUpdateOperationsInput | string
    tipo_insumo?: EnumTipoInsumoFieldUpdateOperationsInput | $Enums.TipoInsumo
    cantidad?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    rendimiento?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    costo_unitario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConceptoInsumoCreateManyInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    concepto_id: string
    insumo_id: string
    tipo_insumo: $Enums.TipoInsumo
    cantidad: Decimal | DecimalJsLike | number | string
    rendimiento?: Decimal | DecimalJsLike | number | string
    costo_unitario?: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ConceptoInsumoUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    tipo_insumo?: EnumTipoInsumoFieldUpdateOperationsInput | $Enums.TipoInsumo
    cantidad?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    rendimiento?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    costo_unitario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConceptoInsumoUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    concepto_id?: StringFieldUpdateOperationsInput | string
    insumo_id?: StringFieldUpdateOperationsInput | string
    tipo_insumo?: EnumTipoInsumoFieldUpdateOperationsInput | $Enums.TipoInsumo
    cantidad?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    rendimiento?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    costo_unitario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SaldoPartidaCreateInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    concepto_id: string
    concepto_clave: string
    concepto_desc: string
    monto_aprobado?: Decimal | DecimalJsLike | number | string
    monto_comprometido?: Decimal | DecimalJsLike | number | string
    monto_ejercido?: Decimal | DecimalJsLike | number | string
    monto_en_proceso?: Decimal | DecimalJsLike | number | string
    monto_disponible?: Decimal | DecimalJsLike | number | string
    estado_tope?: string
    bloqueo_automatico?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    movimientos?: SaldoMovimientoCreateNestedManyWithoutSaldo_partidaInput
  }

  export type SaldoPartidaUncheckedCreateInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    concepto_id: string
    concepto_clave: string
    concepto_desc: string
    monto_aprobado?: Decimal | DecimalJsLike | number | string
    monto_comprometido?: Decimal | DecimalJsLike | number | string
    monto_ejercido?: Decimal | DecimalJsLike | number | string
    monto_en_proceso?: Decimal | DecimalJsLike | number | string
    monto_disponible?: Decimal | DecimalJsLike | number | string
    estado_tope?: string
    bloqueo_automatico?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    movimientos?: SaldoMovimientoUncheckedCreateNestedManyWithoutSaldo_partidaInput
  }

  export type SaldoPartidaUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    concepto_id?: StringFieldUpdateOperationsInput | string
    concepto_clave?: StringFieldUpdateOperationsInput | string
    concepto_desc?: StringFieldUpdateOperationsInput | string
    monto_aprobado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_comprometido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_ejercido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_en_proceso?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_disponible?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    estado_tope?: StringFieldUpdateOperationsInput | string
    bloqueo_automatico?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    movimientos?: SaldoMovimientoUpdateManyWithoutSaldo_partidaNestedInput
  }

  export type SaldoPartidaUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    concepto_id?: StringFieldUpdateOperationsInput | string
    concepto_clave?: StringFieldUpdateOperationsInput | string
    concepto_desc?: StringFieldUpdateOperationsInput | string
    monto_aprobado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_comprometido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_ejercido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_en_proceso?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_disponible?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    estado_tope?: StringFieldUpdateOperationsInput | string
    bloqueo_automatico?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    movimientos?: SaldoMovimientoUncheckedUpdateManyWithoutSaldo_partidaNestedInput
  }

  export type SaldoPartidaCreateManyInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    concepto_id: string
    concepto_clave: string
    concepto_desc: string
    monto_aprobado?: Decimal | DecimalJsLike | number | string
    monto_comprometido?: Decimal | DecimalJsLike | number | string
    monto_ejercido?: Decimal | DecimalJsLike | number | string
    monto_en_proceso?: Decimal | DecimalJsLike | number | string
    monto_disponible?: Decimal | DecimalJsLike | number | string
    estado_tope?: string
    bloqueo_automatico?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type SaldoPartidaUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    concepto_id?: StringFieldUpdateOperationsInput | string
    concepto_clave?: StringFieldUpdateOperationsInput | string
    concepto_desc?: StringFieldUpdateOperationsInput | string
    monto_aprobado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_comprometido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_ejercido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_en_proceso?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_disponible?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    estado_tope?: StringFieldUpdateOperationsInput | string
    bloqueo_automatico?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SaldoPartidaUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    concepto_id?: StringFieldUpdateOperationsInput | string
    concepto_clave?: StringFieldUpdateOperationsInput | string
    concepto_desc?: StringFieldUpdateOperationsInput | string
    monto_aprobado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_comprometido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_ejercido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_en_proceso?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_disponible?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    estado_tope?: StringFieldUpdateOperationsInput | string
    bloqueo_automatico?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SaldoMovimientoCreateInput = {
    id?: string
    tenant_id: string
    referencia_id: string
    referencia_codigo?: string | null
    tipo: string
    campo: string
    delta: Decimal | DecimalJsLike | number | string
    saldo_resultante: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    saldo_partida: SaldoPartidaCreateNestedOneWithoutMovimientosInput
  }

  export type SaldoMovimientoUncheckedCreateInput = {
    id?: string
    tenant_id: string
    saldo_partida_id: string
    referencia_id: string
    referencia_codigo?: string | null
    tipo: string
    campo: string
    delta: Decimal | DecimalJsLike | number | string
    saldo_resultante: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
  }

  export type SaldoMovimientoUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    referencia_id?: StringFieldUpdateOperationsInput | string
    referencia_codigo?: NullableStringFieldUpdateOperationsInput | string | null
    tipo?: StringFieldUpdateOperationsInput | string
    campo?: StringFieldUpdateOperationsInput | string
    delta?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    saldo_resultante?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    saldo_partida?: SaldoPartidaUpdateOneRequiredWithoutMovimientosNestedInput
  }

  export type SaldoMovimientoUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    saldo_partida_id?: StringFieldUpdateOperationsInput | string
    referencia_id?: StringFieldUpdateOperationsInput | string
    referencia_codigo?: NullableStringFieldUpdateOperationsInput | string | null
    tipo?: StringFieldUpdateOperationsInput | string
    campo?: StringFieldUpdateOperationsInput | string
    delta?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    saldo_resultante?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SaldoMovimientoCreateManyInput = {
    id?: string
    tenant_id: string
    saldo_partida_id: string
    referencia_id: string
    referencia_codigo?: string | null
    tipo: string
    campo: string
    delta: Decimal | DecimalJsLike | number | string
    saldo_resultante: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
  }

  export type SaldoMovimientoUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    referencia_id?: StringFieldUpdateOperationsInput | string
    referencia_codigo?: NullableStringFieldUpdateOperationsInput | string | null
    tipo?: StringFieldUpdateOperationsInput | string
    campo?: StringFieldUpdateOperationsInput | string
    delta?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    saldo_resultante?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SaldoMovimientoUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    saldo_partida_id?: StringFieldUpdateOperationsInput | string
    referencia_id?: StringFieldUpdateOperationsInput | string
    referencia_codigo?: NullableStringFieldUpdateOperationsInput | string | null
    tipo?: StringFieldUpdateOperationsInput | string
    campo?: StringFieldUpdateOperationsInput | string
    delta?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    saldo_resultante?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FichaTecnicaInsumoCreateInput = {
    id_ficha?: string
    tenant_id: string
    insumo_id: string
    proveedor_ref?: string | null
    nombre_doc: string
    ruta_archivo: string
    mime_type: string
    tamano_bytes: number
    subido_por: string
    created_at?: Date | string
  }

  export type FichaTecnicaInsumoUncheckedCreateInput = {
    id_ficha?: string
    tenant_id: string
    insumo_id: string
    proveedor_ref?: string | null
    nombre_doc: string
    ruta_archivo: string
    mime_type: string
    tamano_bytes: number
    subido_por: string
    created_at?: Date | string
  }

  export type FichaTecnicaInsumoUpdateInput = {
    id_ficha?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    insumo_id?: StringFieldUpdateOperationsInput | string
    proveedor_ref?: NullableStringFieldUpdateOperationsInput | string | null
    nombre_doc?: StringFieldUpdateOperationsInput | string
    ruta_archivo?: StringFieldUpdateOperationsInput | string
    mime_type?: StringFieldUpdateOperationsInput | string
    tamano_bytes?: IntFieldUpdateOperationsInput | number
    subido_por?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FichaTecnicaInsumoUncheckedUpdateInput = {
    id_ficha?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    insumo_id?: StringFieldUpdateOperationsInput | string
    proveedor_ref?: NullableStringFieldUpdateOperationsInput | string | null
    nombre_doc?: StringFieldUpdateOperationsInput | string
    ruta_archivo?: StringFieldUpdateOperationsInput | string
    mime_type?: StringFieldUpdateOperationsInput | string
    tamano_bytes?: IntFieldUpdateOperationsInput | number
    subido_por?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FichaTecnicaInsumoCreateManyInput = {
    id_ficha?: string
    tenant_id: string
    insumo_id: string
    proveedor_ref?: string | null
    nombre_doc: string
    ruta_archivo: string
    mime_type: string
    tamano_bytes: number
    subido_por: string
    created_at?: Date | string
  }

  export type FichaTecnicaInsumoUpdateManyMutationInput = {
    id_ficha?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    insumo_id?: StringFieldUpdateOperationsInput | string
    proveedor_ref?: NullableStringFieldUpdateOperationsInput | string | null
    nombre_doc?: StringFieldUpdateOperationsInput | string
    ruta_archivo?: StringFieldUpdateOperationsInput | string
    mime_type?: StringFieldUpdateOperationsInput | string
    tamano_bytes?: IntFieldUpdateOperationsInput | number
    subido_por?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FichaTecnicaInsumoUncheckedUpdateManyInput = {
    id_ficha?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    insumo_id?: StringFieldUpdateOperationsInput | string
    proveedor_ref?: NullableStringFieldUpdateOperationsInput | string | null
    nombre_doc?: StringFieldUpdateOperationsInput | string
    ruta_archivo?: StringFieldUpdateOperationsInput | string
    mime_type?: StringFieldUpdateOperationsInput | string
    tamano_bytes?: IntFieldUpdateOperationsInput | number
    subido_por?: StringFieldUpdateOperationsInput | string
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

  export type InsumoListRelationFilter = {
    every?: InsumoWhereInput
    some?: InsumoWhereInput
    none?: InsumoWhereInput
  }

  export type InsumoOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CategoriaGastoCountOrderByAggregateInput = {
    id_categoria?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    nombre?: SortOrder
    es_predefinida?: SortOrder
    activa?: SortOrder
    created_at?: SortOrder
  }

  export type CategoriaGastoMaxOrderByAggregateInput = {
    id_categoria?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    nombre?: SortOrder
    es_predefinida?: SortOrder
    activa?: SortOrder
    created_at?: SortOrder
  }

  export type CategoriaGastoMinOrderByAggregateInput = {
    id_categoria?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    nombre?: SortOrder
    es_predefinida?: SortOrder
    activa?: SortOrder
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

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type ProyectoCostosConfigUq_proyecto_costos_configCompoundUniqueInput = {
    tenant_id: string
    proyecto_id: string
  }

  export type ProyectoCostosConfigCountOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    estado?: SortOrder
    activado_por?: SortOrder
    fecha_activacion?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ProyectoCostosConfigMaxOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    estado?: SortOrder
    activado_por?: SortOrder
    fecha_activacion?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ProyectoCostosConfigMinOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    estado?: SortOrder
    activado_por?: SortOrder
    fecha_activacion?: SortOrder
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

  export type EnumTipoInsumoFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoInsumo | EnumTipoInsumoFieldRefInput<$PrismaModel>
    in?: $Enums.TipoInsumo[] | ListEnumTipoInsumoFieldRefInput<$PrismaModel>
    notIn?: $Enums.TipoInsumo[] | ListEnumTipoInsumoFieldRefInput<$PrismaModel>
    not?: NestedEnumTipoInsumoFilter<$PrismaModel> | $Enums.TipoInsumo
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

  export type CategoriaGastoNullableRelationFilter = {
    is?: CategoriaGastoWhereInput | null
    isNot?: CategoriaGastoWhereInput | null
  }

  export type ConceptoInsumoListRelationFilter = {
    every?: ConceptoInsumoWhereInput
    some?: ConceptoInsumoWhereInput
    none?: ConceptoInsumoWhereInput
  }

  export type ConceptoInsumoOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type InsumoUq_insumo_tenant_claveCompoundUniqueInput = {
    tenant_id: string
    clave: string
  }

  export type InsumoCountOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    clave?: SortOrder
    descripcion?: SortOrder
    unidad_medida?: SortOrder
    tipo_insumo?: SortOrder
    costo_base?: SortOrder
    categoria_gasto_id?: SortOrder
    activo?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type InsumoAvgOrderByAggregateInput = {
    costo_base?: SortOrder
  }

  export type InsumoMaxOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    clave?: SortOrder
    descripcion?: SortOrder
    unidad_medida?: SortOrder
    tipo_insumo?: SortOrder
    costo_base?: SortOrder
    categoria_gasto_id?: SortOrder
    activo?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type InsumoMinOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    clave?: SortOrder
    descripcion?: SortOrder
    unidad_medida?: SortOrder
    tipo_insumo?: SortOrder
    costo_base?: SortOrder
    categoria_gasto_id?: SortOrder
    activo?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type InsumoSumOrderByAggregateInput = {
    costo_base?: SortOrder
  }

  export type EnumTipoInsumoWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoInsumo | EnumTipoInsumoFieldRefInput<$PrismaModel>
    in?: $Enums.TipoInsumo[] | ListEnumTipoInsumoFieldRefInput<$PrismaModel>
    notIn?: $Enums.TipoInsumo[] | ListEnumTipoInsumoFieldRefInput<$PrismaModel>
    not?: NestedEnumTipoInsumoWithAggregatesFilter<$PrismaModel> | $Enums.TipoInsumo
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTipoInsumoFilter<$PrismaModel>
    _max?: NestedEnumTipoInsumoFilter<$PrismaModel>
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

  export type EnumEstadoPresupuestoFilter<$PrismaModel = never> = {
    equals?: $Enums.EstadoPresupuesto | EnumEstadoPresupuestoFieldRefInput<$PrismaModel>
    in?: $Enums.EstadoPresupuesto[] | ListEnumEstadoPresupuestoFieldRefInput<$PrismaModel>
    notIn?: $Enums.EstadoPresupuesto[] | ListEnumEstadoPresupuestoFieldRefInput<$PrismaModel>
    not?: NestedEnumEstadoPresupuestoFilter<$PrismaModel> | $Enums.EstadoPresupuesto
  }

  export type ConceptoListRelationFilter = {
    every?: ConceptoWhereInput
    some?: ConceptoWhereInput
    none?: ConceptoWhereInput
  }

  export type ConceptoOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PresupuestoBaseCountOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    version?: SortOrder
    estado?: SortOrder
    importe_total?: SortOrder
    aprobado_por?: SortOrder
    fecha_aprobacion?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type PresupuestoBaseAvgOrderByAggregateInput = {
    version?: SortOrder
    importe_total?: SortOrder
  }

  export type PresupuestoBaseMaxOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    version?: SortOrder
    estado?: SortOrder
    importe_total?: SortOrder
    aprobado_por?: SortOrder
    fecha_aprobacion?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type PresupuestoBaseMinOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    version?: SortOrder
    estado?: SortOrder
    importe_total?: SortOrder
    aprobado_por?: SortOrder
    fecha_aprobacion?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type PresupuestoBaseSumOrderByAggregateInput = {
    version?: SortOrder
    importe_total?: SortOrder
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

  export type EnumEstadoPresupuestoWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.EstadoPresupuesto | EnumEstadoPresupuestoFieldRefInput<$PrismaModel>
    in?: $Enums.EstadoPresupuesto[] | ListEnumEstadoPresupuestoFieldRefInput<$PrismaModel>
    notIn?: $Enums.EstadoPresupuesto[] | ListEnumEstadoPresupuestoFieldRefInput<$PrismaModel>
    not?: NestedEnumEstadoPresupuestoWithAggregatesFilter<$PrismaModel> | $Enums.EstadoPresupuesto
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumEstadoPresupuestoFilter<$PrismaModel>
    _max?: NestedEnumEstadoPresupuestoFilter<$PrismaModel>
  }

  export type PresupuestoBaseRelationFilter = {
    is?: PresupuestoBaseWhereInput
    isNot?: PresupuestoBaseWhereInput
  }

  export type ConceptoCountOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    presupuesto_id?: SortOrder
    clave?: SortOrder
    descripcion?: SortOrder
    unidad_medida?: SortOrder
    cantidad?: SortOrder
    precio_unitario?: SortOrder
    importe?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ConceptoAvgOrderByAggregateInput = {
    cantidad?: SortOrder
    precio_unitario?: SortOrder
    importe?: SortOrder
  }

  export type ConceptoMaxOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    presupuesto_id?: SortOrder
    clave?: SortOrder
    descripcion?: SortOrder
    unidad_medida?: SortOrder
    cantidad?: SortOrder
    precio_unitario?: SortOrder
    importe?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ConceptoMinOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    presupuesto_id?: SortOrder
    clave?: SortOrder
    descripcion?: SortOrder
    unidad_medida?: SortOrder
    cantidad?: SortOrder
    precio_unitario?: SortOrder
    importe?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ConceptoSumOrderByAggregateInput = {
    cantidad?: SortOrder
    precio_unitario?: SortOrder
    importe?: SortOrder
  }

  export type ConceptoRelationFilter = {
    is?: ConceptoWhereInput
    isNot?: ConceptoWhereInput
  }

  export type InsumoRelationFilter = {
    is?: InsumoWhereInput
    isNot?: InsumoWhereInput
  }

  export type ConceptoInsumoUq_concepto_insumoCompoundUniqueInput = {
    concepto_id: string
    insumo_id: string
  }

  export type ConceptoInsumoCountOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    concepto_id?: SortOrder
    insumo_id?: SortOrder
    tipo_insumo?: SortOrder
    cantidad?: SortOrder
    rendimiento?: SortOrder
    costo_unitario?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ConceptoInsumoAvgOrderByAggregateInput = {
    cantidad?: SortOrder
    rendimiento?: SortOrder
    costo_unitario?: SortOrder
  }

  export type ConceptoInsumoMaxOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    concepto_id?: SortOrder
    insumo_id?: SortOrder
    tipo_insumo?: SortOrder
    cantidad?: SortOrder
    rendimiento?: SortOrder
    costo_unitario?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ConceptoInsumoMinOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    concepto_id?: SortOrder
    insumo_id?: SortOrder
    tipo_insumo?: SortOrder
    cantidad?: SortOrder
    rendimiento?: SortOrder
    costo_unitario?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ConceptoInsumoSumOrderByAggregateInput = {
    cantidad?: SortOrder
    rendimiento?: SortOrder
    costo_unitario?: SortOrder
  }

  export type SaldoMovimientoListRelationFilter = {
    every?: SaldoMovimientoWhereInput
    some?: SaldoMovimientoWhereInput
    none?: SaldoMovimientoWhereInput
  }

  export type SaldoMovimientoOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SaldoPartidaUq_saldo_partidaCompoundUniqueInput = {
    tenant_id: string
    proyecto_id: string
    concepto_id: string
  }

  export type SaldoPartidaCountOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    concepto_id?: SortOrder
    concepto_clave?: SortOrder
    concepto_desc?: SortOrder
    monto_aprobado?: SortOrder
    monto_comprometido?: SortOrder
    monto_ejercido?: SortOrder
    monto_en_proceso?: SortOrder
    monto_disponible?: SortOrder
    estado_tope?: SortOrder
    bloqueo_automatico?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type SaldoPartidaAvgOrderByAggregateInput = {
    monto_aprobado?: SortOrder
    monto_comprometido?: SortOrder
    monto_ejercido?: SortOrder
    monto_en_proceso?: SortOrder
    monto_disponible?: SortOrder
  }

  export type SaldoPartidaMaxOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    concepto_id?: SortOrder
    concepto_clave?: SortOrder
    concepto_desc?: SortOrder
    monto_aprobado?: SortOrder
    monto_comprometido?: SortOrder
    monto_ejercido?: SortOrder
    monto_en_proceso?: SortOrder
    monto_disponible?: SortOrder
    estado_tope?: SortOrder
    bloqueo_automatico?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type SaldoPartidaMinOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    concepto_id?: SortOrder
    concepto_clave?: SortOrder
    concepto_desc?: SortOrder
    monto_aprobado?: SortOrder
    monto_comprometido?: SortOrder
    monto_ejercido?: SortOrder
    monto_en_proceso?: SortOrder
    monto_disponible?: SortOrder
    estado_tope?: SortOrder
    bloqueo_automatico?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type SaldoPartidaSumOrderByAggregateInput = {
    monto_aprobado?: SortOrder
    monto_comprometido?: SortOrder
    monto_ejercido?: SortOrder
    monto_en_proceso?: SortOrder
    monto_disponible?: SortOrder
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

  export type SaldoPartidaRelationFilter = {
    is?: SaldoPartidaWhereInput
    isNot?: SaldoPartidaWhereInput
  }

  export type SaldoMovimientoUq_saldo_movimiento_idemCompoundUniqueInput = {
    saldo_partida_id: string
    referencia_id: string
    tipo: string
  }

  export type SaldoMovimientoCountOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    saldo_partida_id?: SortOrder
    referencia_id?: SortOrder
    referencia_codigo?: SortOrder
    tipo?: SortOrder
    campo?: SortOrder
    delta?: SortOrder
    saldo_resultante?: SortOrder
    created_at?: SortOrder
  }

  export type SaldoMovimientoAvgOrderByAggregateInput = {
    delta?: SortOrder
    saldo_resultante?: SortOrder
  }

  export type SaldoMovimientoMaxOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    saldo_partida_id?: SortOrder
    referencia_id?: SortOrder
    referencia_codigo?: SortOrder
    tipo?: SortOrder
    campo?: SortOrder
    delta?: SortOrder
    saldo_resultante?: SortOrder
    created_at?: SortOrder
  }

  export type SaldoMovimientoMinOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    saldo_partida_id?: SortOrder
    referencia_id?: SortOrder
    referencia_codigo?: SortOrder
    tipo?: SortOrder
    campo?: SortOrder
    delta?: SortOrder
    saldo_resultante?: SortOrder
    created_at?: SortOrder
  }

  export type SaldoMovimientoSumOrderByAggregateInput = {
    delta?: SortOrder
    saldo_resultante?: SortOrder
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

  export type FichaTecnicaInsumoCountOrderByAggregateInput = {
    id_ficha?: SortOrder
    tenant_id?: SortOrder
    insumo_id?: SortOrder
    proveedor_ref?: SortOrder
    nombre_doc?: SortOrder
    ruta_archivo?: SortOrder
    mime_type?: SortOrder
    tamano_bytes?: SortOrder
    subido_por?: SortOrder
    created_at?: SortOrder
  }

  export type FichaTecnicaInsumoAvgOrderByAggregateInput = {
    tamano_bytes?: SortOrder
  }

  export type FichaTecnicaInsumoMaxOrderByAggregateInput = {
    id_ficha?: SortOrder
    tenant_id?: SortOrder
    insumo_id?: SortOrder
    proveedor_ref?: SortOrder
    nombre_doc?: SortOrder
    ruta_archivo?: SortOrder
    mime_type?: SortOrder
    tamano_bytes?: SortOrder
    subido_por?: SortOrder
    created_at?: SortOrder
  }

  export type FichaTecnicaInsumoMinOrderByAggregateInput = {
    id_ficha?: SortOrder
    tenant_id?: SortOrder
    insumo_id?: SortOrder
    proveedor_ref?: SortOrder
    nombre_doc?: SortOrder
    ruta_archivo?: SortOrder
    mime_type?: SortOrder
    tamano_bytes?: SortOrder
    subido_por?: SortOrder
    created_at?: SortOrder
  }

  export type FichaTecnicaInsumoSumOrderByAggregateInput = {
    tamano_bytes?: SortOrder
  }

  export type InsumoCreateNestedManyWithoutCategoria_gastoInput = {
    create?: XOR<InsumoCreateWithoutCategoria_gastoInput, InsumoUncheckedCreateWithoutCategoria_gastoInput> | InsumoCreateWithoutCategoria_gastoInput[] | InsumoUncheckedCreateWithoutCategoria_gastoInput[]
    connectOrCreate?: InsumoCreateOrConnectWithoutCategoria_gastoInput | InsumoCreateOrConnectWithoutCategoria_gastoInput[]
    createMany?: InsumoCreateManyCategoria_gastoInputEnvelope
    connect?: InsumoWhereUniqueInput | InsumoWhereUniqueInput[]
  }

  export type InsumoUncheckedCreateNestedManyWithoutCategoria_gastoInput = {
    create?: XOR<InsumoCreateWithoutCategoria_gastoInput, InsumoUncheckedCreateWithoutCategoria_gastoInput> | InsumoCreateWithoutCategoria_gastoInput[] | InsumoUncheckedCreateWithoutCategoria_gastoInput[]
    connectOrCreate?: InsumoCreateOrConnectWithoutCategoria_gastoInput | InsumoCreateOrConnectWithoutCategoria_gastoInput[]
    createMany?: InsumoCreateManyCategoria_gastoInputEnvelope
    connect?: InsumoWhereUniqueInput | InsumoWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type InsumoUpdateManyWithoutCategoria_gastoNestedInput = {
    create?: XOR<InsumoCreateWithoutCategoria_gastoInput, InsumoUncheckedCreateWithoutCategoria_gastoInput> | InsumoCreateWithoutCategoria_gastoInput[] | InsumoUncheckedCreateWithoutCategoria_gastoInput[]
    connectOrCreate?: InsumoCreateOrConnectWithoutCategoria_gastoInput | InsumoCreateOrConnectWithoutCategoria_gastoInput[]
    upsert?: InsumoUpsertWithWhereUniqueWithoutCategoria_gastoInput | InsumoUpsertWithWhereUniqueWithoutCategoria_gastoInput[]
    createMany?: InsumoCreateManyCategoria_gastoInputEnvelope
    set?: InsumoWhereUniqueInput | InsumoWhereUniqueInput[]
    disconnect?: InsumoWhereUniqueInput | InsumoWhereUniqueInput[]
    delete?: InsumoWhereUniqueInput | InsumoWhereUniqueInput[]
    connect?: InsumoWhereUniqueInput | InsumoWhereUniqueInput[]
    update?: InsumoUpdateWithWhereUniqueWithoutCategoria_gastoInput | InsumoUpdateWithWhereUniqueWithoutCategoria_gastoInput[]
    updateMany?: InsumoUpdateManyWithWhereWithoutCategoria_gastoInput | InsumoUpdateManyWithWhereWithoutCategoria_gastoInput[]
    deleteMany?: InsumoScalarWhereInput | InsumoScalarWhereInput[]
  }

  export type InsumoUncheckedUpdateManyWithoutCategoria_gastoNestedInput = {
    create?: XOR<InsumoCreateWithoutCategoria_gastoInput, InsumoUncheckedCreateWithoutCategoria_gastoInput> | InsumoCreateWithoutCategoria_gastoInput[] | InsumoUncheckedCreateWithoutCategoria_gastoInput[]
    connectOrCreate?: InsumoCreateOrConnectWithoutCategoria_gastoInput | InsumoCreateOrConnectWithoutCategoria_gastoInput[]
    upsert?: InsumoUpsertWithWhereUniqueWithoutCategoria_gastoInput | InsumoUpsertWithWhereUniqueWithoutCategoria_gastoInput[]
    createMany?: InsumoCreateManyCategoria_gastoInputEnvelope
    set?: InsumoWhereUniqueInput | InsumoWhereUniqueInput[]
    disconnect?: InsumoWhereUniqueInput | InsumoWhereUniqueInput[]
    delete?: InsumoWhereUniqueInput | InsumoWhereUniqueInput[]
    connect?: InsumoWhereUniqueInput | InsumoWhereUniqueInput[]
    update?: InsumoUpdateWithWhereUniqueWithoutCategoria_gastoInput | InsumoUpdateWithWhereUniqueWithoutCategoria_gastoInput[]
    updateMany?: InsumoUpdateManyWithWhereWithoutCategoria_gastoInput | InsumoUpdateManyWithWhereWithoutCategoria_gastoInput[]
    deleteMany?: InsumoScalarWhereInput | InsumoScalarWhereInput[]
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type CategoriaGastoCreateNestedOneWithoutInsumosInput = {
    create?: XOR<CategoriaGastoCreateWithoutInsumosInput, CategoriaGastoUncheckedCreateWithoutInsumosInput>
    connectOrCreate?: CategoriaGastoCreateOrConnectWithoutInsumosInput
    connect?: CategoriaGastoWhereUniqueInput
  }

  export type ConceptoInsumoCreateNestedManyWithoutInsumoInput = {
    create?: XOR<ConceptoInsumoCreateWithoutInsumoInput, ConceptoInsumoUncheckedCreateWithoutInsumoInput> | ConceptoInsumoCreateWithoutInsumoInput[] | ConceptoInsumoUncheckedCreateWithoutInsumoInput[]
    connectOrCreate?: ConceptoInsumoCreateOrConnectWithoutInsumoInput | ConceptoInsumoCreateOrConnectWithoutInsumoInput[]
    createMany?: ConceptoInsumoCreateManyInsumoInputEnvelope
    connect?: ConceptoInsumoWhereUniqueInput | ConceptoInsumoWhereUniqueInput[]
  }

  export type ConceptoInsumoUncheckedCreateNestedManyWithoutInsumoInput = {
    create?: XOR<ConceptoInsumoCreateWithoutInsumoInput, ConceptoInsumoUncheckedCreateWithoutInsumoInput> | ConceptoInsumoCreateWithoutInsumoInput[] | ConceptoInsumoUncheckedCreateWithoutInsumoInput[]
    connectOrCreate?: ConceptoInsumoCreateOrConnectWithoutInsumoInput | ConceptoInsumoCreateOrConnectWithoutInsumoInput[]
    createMany?: ConceptoInsumoCreateManyInsumoInputEnvelope
    connect?: ConceptoInsumoWhereUniqueInput | ConceptoInsumoWhereUniqueInput[]
  }

  export type EnumTipoInsumoFieldUpdateOperationsInput = {
    set?: $Enums.TipoInsumo
  }

  export type DecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type CategoriaGastoUpdateOneWithoutInsumosNestedInput = {
    create?: XOR<CategoriaGastoCreateWithoutInsumosInput, CategoriaGastoUncheckedCreateWithoutInsumosInput>
    connectOrCreate?: CategoriaGastoCreateOrConnectWithoutInsumosInput
    upsert?: CategoriaGastoUpsertWithoutInsumosInput
    disconnect?: CategoriaGastoWhereInput | boolean
    delete?: CategoriaGastoWhereInput | boolean
    connect?: CategoriaGastoWhereUniqueInput
    update?: XOR<XOR<CategoriaGastoUpdateToOneWithWhereWithoutInsumosInput, CategoriaGastoUpdateWithoutInsumosInput>, CategoriaGastoUncheckedUpdateWithoutInsumosInput>
  }

  export type ConceptoInsumoUpdateManyWithoutInsumoNestedInput = {
    create?: XOR<ConceptoInsumoCreateWithoutInsumoInput, ConceptoInsumoUncheckedCreateWithoutInsumoInput> | ConceptoInsumoCreateWithoutInsumoInput[] | ConceptoInsumoUncheckedCreateWithoutInsumoInput[]
    connectOrCreate?: ConceptoInsumoCreateOrConnectWithoutInsumoInput | ConceptoInsumoCreateOrConnectWithoutInsumoInput[]
    upsert?: ConceptoInsumoUpsertWithWhereUniqueWithoutInsumoInput | ConceptoInsumoUpsertWithWhereUniqueWithoutInsumoInput[]
    createMany?: ConceptoInsumoCreateManyInsumoInputEnvelope
    set?: ConceptoInsumoWhereUniqueInput | ConceptoInsumoWhereUniqueInput[]
    disconnect?: ConceptoInsumoWhereUniqueInput | ConceptoInsumoWhereUniqueInput[]
    delete?: ConceptoInsumoWhereUniqueInput | ConceptoInsumoWhereUniqueInput[]
    connect?: ConceptoInsumoWhereUniqueInput | ConceptoInsumoWhereUniqueInput[]
    update?: ConceptoInsumoUpdateWithWhereUniqueWithoutInsumoInput | ConceptoInsumoUpdateWithWhereUniqueWithoutInsumoInput[]
    updateMany?: ConceptoInsumoUpdateManyWithWhereWithoutInsumoInput | ConceptoInsumoUpdateManyWithWhereWithoutInsumoInput[]
    deleteMany?: ConceptoInsumoScalarWhereInput | ConceptoInsumoScalarWhereInput[]
  }

  export type ConceptoInsumoUncheckedUpdateManyWithoutInsumoNestedInput = {
    create?: XOR<ConceptoInsumoCreateWithoutInsumoInput, ConceptoInsumoUncheckedCreateWithoutInsumoInput> | ConceptoInsumoCreateWithoutInsumoInput[] | ConceptoInsumoUncheckedCreateWithoutInsumoInput[]
    connectOrCreate?: ConceptoInsumoCreateOrConnectWithoutInsumoInput | ConceptoInsumoCreateOrConnectWithoutInsumoInput[]
    upsert?: ConceptoInsumoUpsertWithWhereUniqueWithoutInsumoInput | ConceptoInsumoUpsertWithWhereUniqueWithoutInsumoInput[]
    createMany?: ConceptoInsumoCreateManyInsumoInputEnvelope
    set?: ConceptoInsumoWhereUniqueInput | ConceptoInsumoWhereUniqueInput[]
    disconnect?: ConceptoInsumoWhereUniqueInput | ConceptoInsumoWhereUniqueInput[]
    delete?: ConceptoInsumoWhereUniqueInput | ConceptoInsumoWhereUniqueInput[]
    connect?: ConceptoInsumoWhereUniqueInput | ConceptoInsumoWhereUniqueInput[]
    update?: ConceptoInsumoUpdateWithWhereUniqueWithoutInsumoInput | ConceptoInsumoUpdateWithWhereUniqueWithoutInsumoInput[]
    updateMany?: ConceptoInsumoUpdateManyWithWhereWithoutInsumoInput | ConceptoInsumoUpdateManyWithWhereWithoutInsumoInput[]
    deleteMany?: ConceptoInsumoScalarWhereInput | ConceptoInsumoScalarWhereInput[]
  }

  export type ConceptoCreateNestedManyWithoutPresupuestoInput = {
    create?: XOR<ConceptoCreateWithoutPresupuestoInput, ConceptoUncheckedCreateWithoutPresupuestoInput> | ConceptoCreateWithoutPresupuestoInput[] | ConceptoUncheckedCreateWithoutPresupuestoInput[]
    connectOrCreate?: ConceptoCreateOrConnectWithoutPresupuestoInput | ConceptoCreateOrConnectWithoutPresupuestoInput[]
    createMany?: ConceptoCreateManyPresupuestoInputEnvelope
    connect?: ConceptoWhereUniqueInput | ConceptoWhereUniqueInput[]
  }

  export type ConceptoUncheckedCreateNestedManyWithoutPresupuestoInput = {
    create?: XOR<ConceptoCreateWithoutPresupuestoInput, ConceptoUncheckedCreateWithoutPresupuestoInput> | ConceptoCreateWithoutPresupuestoInput[] | ConceptoUncheckedCreateWithoutPresupuestoInput[]
    connectOrCreate?: ConceptoCreateOrConnectWithoutPresupuestoInput | ConceptoCreateOrConnectWithoutPresupuestoInput[]
    createMany?: ConceptoCreateManyPresupuestoInputEnvelope
    connect?: ConceptoWhereUniqueInput | ConceptoWhereUniqueInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EnumEstadoPresupuestoFieldUpdateOperationsInput = {
    set?: $Enums.EstadoPresupuesto
  }

  export type ConceptoUpdateManyWithoutPresupuestoNestedInput = {
    create?: XOR<ConceptoCreateWithoutPresupuestoInput, ConceptoUncheckedCreateWithoutPresupuestoInput> | ConceptoCreateWithoutPresupuestoInput[] | ConceptoUncheckedCreateWithoutPresupuestoInput[]
    connectOrCreate?: ConceptoCreateOrConnectWithoutPresupuestoInput | ConceptoCreateOrConnectWithoutPresupuestoInput[]
    upsert?: ConceptoUpsertWithWhereUniqueWithoutPresupuestoInput | ConceptoUpsertWithWhereUniqueWithoutPresupuestoInput[]
    createMany?: ConceptoCreateManyPresupuestoInputEnvelope
    set?: ConceptoWhereUniqueInput | ConceptoWhereUniqueInput[]
    disconnect?: ConceptoWhereUniqueInput | ConceptoWhereUniqueInput[]
    delete?: ConceptoWhereUniqueInput | ConceptoWhereUniqueInput[]
    connect?: ConceptoWhereUniqueInput | ConceptoWhereUniqueInput[]
    update?: ConceptoUpdateWithWhereUniqueWithoutPresupuestoInput | ConceptoUpdateWithWhereUniqueWithoutPresupuestoInput[]
    updateMany?: ConceptoUpdateManyWithWhereWithoutPresupuestoInput | ConceptoUpdateManyWithWhereWithoutPresupuestoInput[]
    deleteMany?: ConceptoScalarWhereInput | ConceptoScalarWhereInput[]
  }

  export type ConceptoUncheckedUpdateManyWithoutPresupuestoNestedInput = {
    create?: XOR<ConceptoCreateWithoutPresupuestoInput, ConceptoUncheckedCreateWithoutPresupuestoInput> | ConceptoCreateWithoutPresupuestoInput[] | ConceptoUncheckedCreateWithoutPresupuestoInput[]
    connectOrCreate?: ConceptoCreateOrConnectWithoutPresupuestoInput | ConceptoCreateOrConnectWithoutPresupuestoInput[]
    upsert?: ConceptoUpsertWithWhereUniqueWithoutPresupuestoInput | ConceptoUpsertWithWhereUniqueWithoutPresupuestoInput[]
    createMany?: ConceptoCreateManyPresupuestoInputEnvelope
    set?: ConceptoWhereUniqueInput | ConceptoWhereUniqueInput[]
    disconnect?: ConceptoWhereUniqueInput | ConceptoWhereUniqueInput[]
    delete?: ConceptoWhereUniqueInput | ConceptoWhereUniqueInput[]
    connect?: ConceptoWhereUniqueInput | ConceptoWhereUniqueInput[]
    update?: ConceptoUpdateWithWhereUniqueWithoutPresupuestoInput | ConceptoUpdateWithWhereUniqueWithoutPresupuestoInput[]
    updateMany?: ConceptoUpdateManyWithWhereWithoutPresupuestoInput | ConceptoUpdateManyWithWhereWithoutPresupuestoInput[]
    deleteMany?: ConceptoScalarWhereInput | ConceptoScalarWhereInput[]
  }

  export type PresupuestoBaseCreateNestedOneWithoutConceptosInput = {
    create?: XOR<PresupuestoBaseCreateWithoutConceptosInput, PresupuestoBaseUncheckedCreateWithoutConceptosInput>
    connectOrCreate?: PresupuestoBaseCreateOrConnectWithoutConceptosInput
    connect?: PresupuestoBaseWhereUniqueInput
  }

  export type ConceptoInsumoCreateNestedManyWithoutConceptoInput = {
    create?: XOR<ConceptoInsumoCreateWithoutConceptoInput, ConceptoInsumoUncheckedCreateWithoutConceptoInput> | ConceptoInsumoCreateWithoutConceptoInput[] | ConceptoInsumoUncheckedCreateWithoutConceptoInput[]
    connectOrCreate?: ConceptoInsumoCreateOrConnectWithoutConceptoInput | ConceptoInsumoCreateOrConnectWithoutConceptoInput[]
    createMany?: ConceptoInsumoCreateManyConceptoInputEnvelope
    connect?: ConceptoInsumoWhereUniqueInput | ConceptoInsumoWhereUniqueInput[]
  }

  export type ConceptoInsumoUncheckedCreateNestedManyWithoutConceptoInput = {
    create?: XOR<ConceptoInsumoCreateWithoutConceptoInput, ConceptoInsumoUncheckedCreateWithoutConceptoInput> | ConceptoInsumoCreateWithoutConceptoInput[] | ConceptoInsumoUncheckedCreateWithoutConceptoInput[]
    connectOrCreate?: ConceptoInsumoCreateOrConnectWithoutConceptoInput | ConceptoInsumoCreateOrConnectWithoutConceptoInput[]
    createMany?: ConceptoInsumoCreateManyConceptoInputEnvelope
    connect?: ConceptoInsumoWhereUniqueInput | ConceptoInsumoWhereUniqueInput[]
  }

  export type PresupuestoBaseUpdateOneRequiredWithoutConceptosNestedInput = {
    create?: XOR<PresupuestoBaseCreateWithoutConceptosInput, PresupuestoBaseUncheckedCreateWithoutConceptosInput>
    connectOrCreate?: PresupuestoBaseCreateOrConnectWithoutConceptosInput
    upsert?: PresupuestoBaseUpsertWithoutConceptosInput
    connect?: PresupuestoBaseWhereUniqueInput
    update?: XOR<XOR<PresupuestoBaseUpdateToOneWithWhereWithoutConceptosInput, PresupuestoBaseUpdateWithoutConceptosInput>, PresupuestoBaseUncheckedUpdateWithoutConceptosInput>
  }

  export type ConceptoInsumoUpdateManyWithoutConceptoNestedInput = {
    create?: XOR<ConceptoInsumoCreateWithoutConceptoInput, ConceptoInsumoUncheckedCreateWithoutConceptoInput> | ConceptoInsumoCreateWithoutConceptoInput[] | ConceptoInsumoUncheckedCreateWithoutConceptoInput[]
    connectOrCreate?: ConceptoInsumoCreateOrConnectWithoutConceptoInput | ConceptoInsumoCreateOrConnectWithoutConceptoInput[]
    upsert?: ConceptoInsumoUpsertWithWhereUniqueWithoutConceptoInput | ConceptoInsumoUpsertWithWhereUniqueWithoutConceptoInput[]
    createMany?: ConceptoInsumoCreateManyConceptoInputEnvelope
    set?: ConceptoInsumoWhereUniqueInput | ConceptoInsumoWhereUniqueInput[]
    disconnect?: ConceptoInsumoWhereUniqueInput | ConceptoInsumoWhereUniqueInput[]
    delete?: ConceptoInsumoWhereUniqueInput | ConceptoInsumoWhereUniqueInput[]
    connect?: ConceptoInsumoWhereUniqueInput | ConceptoInsumoWhereUniqueInput[]
    update?: ConceptoInsumoUpdateWithWhereUniqueWithoutConceptoInput | ConceptoInsumoUpdateWithWhereUniqueWithoutConceptoInput[]
    updateMany?: ConceptoInsumoUpdateManyWithWhereWithoutConceptoInput | ConceptoInsumoUpdateManyWithWhereWithoutConceptoInput[]
    deleteMany?: ConceptoInsumoScalarWhereInput | ConceptoInsumoScalarWhereInput[]
  }

  export type ConceptoInsumoUncheckedUpdateManyWithoutConceptoNestedInput = {
    create?: XOR<ConceptoInsumoCreateWithoutConceptoInput, ConceptoInsumoUncheckedCreateWithoutConceptoInput> | ConceptoInsumoCreateWithoutConceptoInput[] | ConceptoInsumoUncheckedCreateWithoutConceptoInput[]
    connectOrCreate?: ConceptoInsumoCreateOrConnectWithoutConceptoInput | ConceptoInsumoCreateOrConnectWithoutConceptoInput[]
    upsert?: ConceptoInsumoUpsertWithWhereUniqueWithoutConceptoInput | ConceptoInsumoUpsertWithWhereUniqueWithoutConceptoInput[]
    createMany?: ConceptoInsumoCreateManyConceptoInputEnvelope
    set?: ConceptoInsumoWhereUniqueInput | ConceptoInsumoWhereUniqueInput[]
    disconnect?: ConceptoInsumoWhereUniqueInput | ConceptoInsumoWhereUniqueInput[]
    delete?: ConceptoInsumoWhereUniqueInput | ConceptoInsumoWhereUniqueInput[]
    connect?: ConceptoInsumoWhereUniqueInput | ConceptoInsumoWhereUniqueInput[]
    update?: ConceptoInsumoUpdateWithWhereUniqueWithoutConceptoInput | ConceptoInsumoUpdateWithWhereUniqueWithoutConceptoInput[]
    updateMany?: ConceptoInsumoUpdateManyWithWhereWithoutConceptoInput | ConceptoInsumoUpdateManyWithWhereWithoutConceptoInput[]
    deleteMany?: ConceptoInsumoScalarWhereInput | ConceptoInsumoScalarWhereInput[]
  }

  export type ConceptoCreateNestedOneWithoutInsumosInput = {
    create?: XOR<ConceptoCreateWithoutInsumosInput, ConceptoUncheckedCreateWithoutInsumosInput>
    connectOrCreate?: ConceptoCreateOrConnectWithoutInsumosInput
    connect?: ConceptoWhereUniqueInput
  }

  export type InsumoCreateNestedOneWithoutConcepto_insumosInput = {
    create?: XOR<InsumoCreateWithoutConcepto_insumosInput, InsumoUncheckedCreateWithoutConcepto_insumosInput>
    connectOrCreate?: InsumoCreateOrConnectWithoutConcepto_insumosInput
    connect?: InsumoWhereUniqueInput
  }

  export type ConceptoUpdateOneRequiredWithoutInsumosNestedInput = {
    create?: XOR<ConceptoCreateWithoutInsumosInput, ConceptoUncheckedCreateWithoutInsumosInput>
    connectOrCreate?: ConceptoCreateOrConnectWithoutInsumosInput
    upsert?: ConceptoUpsertWithoutInsumosInput
    connect?: ConceptoWhereUniqueInput
    update?: XOR<XOR<ConceptoUpdateToOneWithWhereWithoutInsumosInput, ConceptoUpdateWithoutInsumosInput>, ConceptoUncheckedUpdateWithoutInsumosInput>
  }

  export type InsumoUpdateOneRequiredWithoutConcepto_insumosNestedInput = {
    create?: XOR<InsumoCreateWithoutConcepto_insumosInput, InsumoUncheckedCreateWithoutConcepto_insumosInput>
    connectOrCreate?: InsumoCreateOrConnectWithoutConcepto_insumosInput
    upsert?: InsumoUpsertWithoutConcepto_insumosInput
    connect?: InsumoWhereUniqueInput
    update?: XOR<XOR<InsumoUpdateToOneWithWhereWithoutConcepto_insumosInput, InsumoUpdateWithoutConcepto_insumosInput>, InsumoUncheckedUpdateWithoutConcepto_insumosInput>
  }

  export type SaldoMovimientoCreateNestedManyWithoutSaldo_partidaInput = {
    create?: XOR<SaldoMovimientoCreateWithoutSaldo_partidaInput, SaldoMovimientoUncheckedCreateWithoutSaldo_partidaInput> | SaldoMovimientoCreateWithoutSaldo_partidaInput[] | SaldoMovimientoUncheckedCreateWithoutSaldo_partidaInput[]
    connectOrCreate?: SaldoMovimientoCreateOrConnectWithoutSaldo_partidaInput | SaldoMovimientoCreateOrConnectWithoutSaldo_partidaInput[]
    createMany?: SaldoMovimientoCreateManySaldo_partidaInputEnvelope
    connect?: SaldoMovimientoWhereUniqueInput | SaldoMovimientoWhereUniqueInput[]
  }

  export type SaldoMovimientoUncheckedCreateNestedManyWithoutSaldo_partidaInput = {
    create?: XOR<SaldoMovimientoCreateWithoutSaldo_partidaInput, SaldoMovimientoUncheckedCreateWithoutSaldo_partidaInput> | SaldoMovimientoCreateWithoutSaldo_partidaInput[] | SaldoMovimientoUncheckedCreateWithoutSaldo_partidaInput[]
    connectOrCreate?: SaldoMovimientoCreateOrConnectWithoutSaldo_partidaInput | SaldoMovimientoCreateOrConnectWithoutSaldo_partidaInput[]
    createMany?: SaldoMovimientoCreateManySaldo_partidaInputEnvelope
    connect?: SaldoMovimientoWhereUniqueInput | SaldoMovimientoWhereUniqueInput[]
  }

  export type SaldoMovimientoUpdateManyWithoutSaldo_partidaNestedInput = {
    create?: XOR<SaldoMovimientoCreateWithoutSaldo_partidaInput, SaldoMovimientoUncheckedCreateWithoutSaldo_partidaInput> | SaldoMovimientoCreateWithoutSaldo_partidaInput[] | SaldoMovimientoUncheckedCreateWithoutSaldo_partidaInput[]
    connectOrCreate?: SaldoMovimientoCreateOrConnectWithoutSaldo_partidaInput | SaldoMovimientoCreateOrConnectWithoutSaldo_partidaInput[]
    upsert?: SaldoMovimientoUpsertWithWhereUniqueWithoutSaldo_partidaInput | SaldoMovimientoUpsertWithWhereUniqueWithoutSaldo_partidaInput[]
    createMany?: SaldoMovimientoCreateManySaldo_partidaInputEnvelope
    set?: SaldoMovimientoWhereUniqueInput | SaldoMovimientoWhereUniqueInput[]
    disconnect?: SaldoMovimientoWhereUniqueInput | SaldoMovimientoWhereUniqueInput[]
    delete?: SaldoMovimientoWhereUniqueInput | SaldoMovimientoWhereUniqueInput[]
    connect?: SaldoMovimientoWhereUniqueInput | SaldoMovimientoWhereUniqueInput[]
    update?: SaldoMovimientoUpdateWithWhereUniqueWithoutSaldo_partidaInput | SaldoMovimientoUpdateWithWhereUniqueWithoutSaldo_partidaInput[]
    updateMany?: SaldoMovimientoUpdateManyWithWhereWithoutSaldo_partidaInput | SaldoMovimientoUpdateManyWithWhereWithoutSaldo_partidaInput[]
    deleteMany?: SaldoMovimientoScalarWhereInput | SaldoMovimientoScalarWhereInput[]
  }

  export type SaldoMovimientoUncheckedUpdateManyWithoutSaldo_partidaNestedInput = {
    create?: XOR<SaldoMovimientoCreateWithoutSaldo_partidaInput, SaldoMovimientoUncheckedCreateWithoutSaldo_partidaInput> | SaldoMovimientoCreateWithoutSaldo_partidaInput[] | SaldoMovimientoUncheckedCreateWithoutSaldo_partidaInput[]
    connectOrCreate?: SaldoMovimientoCreateOrConnectWithoutSaldo_partidaInput | SaldoMovimientoCreateOrConnectWithoutSaldo_partidaInput[]
    upsert?: SaldoMovimientoUpsertWithWhereUniqueWithoutSaldo_partidaInput | SaldoMovimientoUpsertWithWhereUniqueWithoutSaldo_partidaInput[]
    createMany?: SaldoMovimientoCreateManySaldo_partidaInputEnvelope
    set?: SaldoMovimientoWhereUniqueInput | SaldoMovimientoWhereUniqueInput[]
    disconnect?: SaldoMovimientoWhereUniqueInput | SaldoMovimientoWhereUniqueInput[]
    delete?: SaldoMovimientoWhereUniqueInput | SaldoMovimientoWhereUniqueInput[]
    connect?: SaldoMovimientoWhereUniqueInput | SaldoMovimientoWhereUniqueInput[]
    update?: SaldoMovimientoUpdateWithWhereUniqueWithoutSaldo_partidaInput | SaldoMovimientoUpdateWithWhereUniqueWithoutSaldo_partidaInput[]
    updateMany?: SaldoMovimientoUpdateManyWithWhereWithoutSaldo_partidaInput | SaldoMovimientoUpdateManyWithWhereWithoutSaldo_partidaInput[]
    deleteMany?: SaldoMovimientoScalarWhereInput | SaldoMovimientoScalarWhereInput[]
  }

  export type SaldoPartidaCreateNestedOneWithoutMovimientosInput = {
    create?: XOR<SaldoPartidaCreateWithoutMovimientosInput, SaldoPartidaUncheckedCreateWithoutMovimientosInput>
    connectOrCreate?: SaldoPartidaCreateOrConnectWithoutMovimientosInput
    connect?: SaldoPartidaWhereUniqueInput
  }

  export type SaldoPartidaUpdateOneRequiredWithoutMovimientosNestedInput = {
    create?: XOR<SaldoPartidaCreateWithoutMovimientosInput, SaldoPartidaUncheckedCreateWithoutMovimientosInput>
    connectOrCreate?: SaldoPartidaCreateOrConnectWithoutMovimientosInput
    upsert?: SaldoPartidaUpsertWithoutMovimientosInput
    connect?: SaldoPartidaWhereUniqueInput
    update?: XOR<XOR<SaldoPartidaUpdateToOneWithWhereWithoutMovimientosInput, SaldoPartidaUpdateWithoutMovimientosInput>, SaldoPartidaUncheckedUpdateWithoutMovimientosInput>
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

  export type NestedEnumTipoInsumoFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoInsumo | EnumTipoInsumoFieldRefInput<$PrismaModel>
    in?: $Enums.TipoInsumo[] | ListEnumTipoInsumoFieldRefInput<$PrismaModel>
    notIn?: $Enums.TipoInsumo[] | ListEnumTipoInsumoFieldRefInput<$PrismaModel>
    not?: NestedEnumTipoInsumoFilter<$PrismaModel> | $Enums.TipoInsumo
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

  export type NestedEnumTipoInsumoWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoInsumo | EnumTipoInsumoFieldRefInput<$PrismaModel>
    in?: $Enums.TipoInsumo[] | ListEnumTipoInsumoFieldRefInput<$PrismaModel>
    notIn?: $Enums.TipoInsumo[] | ListEnumTipoInsumoFieldRefInput<$PrismaModel>
    not?: NestedEnumTipoInsumoWithAggregatesFilter<$PrismaModel> | $Enums.TipoInsumo
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTipoInsumoFilter<$PrismaModel>
    _max?: NestedEnumTipoInsumoFilter<$PrismaModel>
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

  export type NestedEnumEstadoPresupuestoFilter<$PrismaModel = never> = {
    equals?: $Enums.EstadoPresupuesto | EnumEstadoPresupuestoFieldRefInput<$PrismaModel>
    in?: $Enums.EstadoPresupuesto[] | ListEnumEstadoPresupuestoFieldRefInput<$PrismaModel>
    notIn?: $Enums.EstadoPresupuesto[] | ListEnumEstadoPresupuestoFieldRefInput<$PrismaModel>
    not?: NestedEnumEstadoPresupuestoFilter<$PrismaModel> | $Enums.EstadoPresupuesto
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

  export type NestedEnumEstadoPresupuestoWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.EstadoPresupuesto | EnumEstadoPresupuestoFieldRefInput<$PrismaModel>
    in?: $Enums.EstadoPresupuesto[] | ListEnumEstadoPresupuestoFieldRefInput<$PrismaModel>
    notIn?: $Enums.EstadoPresupuesto[] | ListEnumEstadoPresupuestoFieldRefInput<$PrismaModel>
    not?: NestedEnumEstadoPresupuestoWithAggregatesFilter<$PrismaModel> | $Enums.EstadoPresupuesto
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumEstadoPresupuestoFilter<$PrismaModel>
    _max?: NestedEnumEstadoPresupuestoFilter<$PrismaModel>
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

  export type InsumoCreateWithoutCategoria_gastoInput = {
    id?: string
    tenant_id: string
    clave: string
    descripcion: string
    unidad_medida: string
    tipo_insumo: $Enums.TipoInsumo
    costo_base: Decimal | DecimalJsLike | number | string
    activo?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    concepto_insumos?: ConceptoInsumoCreateNestedManyWithoutInsumoInput
  }

  export type InsumoUncheckedCreateWithoutCategoria_gastoInput = {
    id?: string
    tenant_id: string
    clave: string
    descripcion: string
    unidad_medida: string
    tipo_insumo: $Enums.TipoInsumo
    costo_base: Decimal | DecimalJsLike | number | string
    activo?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    concepto_insumos?: ConceptoInsumoUncheckedCreateNestedManyWithoutInsumoInput
  }

  export type InsumoCreateOrConnectWithoutCategoria_gastoInput = {
    where: InsumoWhereUniqueInput
    create: XOR<InsumoCreateWithoutCategoria_gastoInput, InsumoUncheckedCreateWithoutCategoria_gastoInput>
  }

  export type InsumoCreateManyCategoria_gastoInputEnvelope = {
    data: InsumoCreateManyCategoria_gastoInput | InsumoCreateManyCategoria_gastoInput[]
    skipDuplicates?: boolean
  }

  export type InsumoUpsertWithWhereUniqueWithoutCategoria_gastoInput = {
    where: InsumoWhereUniqueInput
    update: XOR<InsumoUpdateWithoutCategoria_gastoInput, InsumoUncheckedUpdateWithoutCategoria_gastoInput>
    create: XOR<InsumoCreateWithoutCategoria_gastoInput, InsumoUncheckedCreateWithoutCategoria_gastoInput>
  }

  export type InsumoUpdateWithWhereUniqueWithoutCategoria_gastoInput = {
    where: InsumoWhereUniqueInput
    data: XOR<InsumoUpdateWithoutCategoria_gastoInput, InsumoUncheckedUpdateWithoutCategoria_gastoInput>
  }

  export type InsumoUpdateManyWithWhereWithoutCategoria_gastoInput = {
    where: InsumoScalarWhereInput
    data: XOR<InsumoUpdateManyMutationInput, InsumoUncheckedUpdateManyWithoutCategoria_gastoInput>
  }

  export type InsumoScalarWhereInput = {
    AND?: InsumoScalarWhereInput | InsumoScalarWhereInput[]
    OR?: InsumoScalarWhereInput[]
    NOT?: InsumoScalarWhereInput | InsumoScalarWhereInput[]
    id?: UuidFilter<"Insumo"> | string
    tenant_id?: UuidFilter<"Insumo"> | string
    clave?: StringFilter<"Insumo"> | string
    descripcion?: StringFilter<"Insumo"> | string
    unidad_medida?: StringFilter<"Insumo"> | string
    tipo_insumo?: EnumTipoInsumoFilter<"Insumo"> | $Enums.TipoInsumo
    costo_base?: DecimalFilter<"Insumo"> | Decimal | DecimalJsLike | number | string
    categoria_gasto_id?: UuidNullableFilter<"Insumo"> | string | null
    activo?: BoolFilter<"Insumo"> | boolean
    created_at?: DateTimeFilter<"Insumo"> | Date | string
    updated_at?: DateTimeFilter<"Insumo"> | Date | string
  }

  export type CategoriaGastoCreateWithoutInsumosInput = {
    id_categoria?: string
    tenant_id: string
    proyecto_id: string
    nombre: string
    es_predefinida?: boolean
    activa?: boolean
    created_at?: Date | string
  }

  export type CategoriaGastoUncheckedCreateWithoutInsumosInput = {
    id_categoria?: string
    tenant_id: string
    proyecto_id: string
    nombre: string
    es_predefinida?: boolean
    activa?: boolean
    created_at?: Date | string
  }

  export type CategoriaGastoCreateOrConnectWithoutInsumosInput = {
    where: CategoriaGastoWhereUniqueInput
    create: XOR<CategoriaGastoCreateWithoutInsumosInput, CategoriaGastoUncheckedCreateWithoutInsumosInput>
  }

  export type ConceptoInsumoCreateWithoutInsumoInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    tipo_insumo: $Enums.TipoInsumo
    cantidad: Decimal | DecimalJsLike | number | string
    rendimiento?: Decimal | DecimalJsLike | number | string
    costo_unitario?: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
    concepto: ConceptoCreateNestedOneWithoutInsumosInput
  }

  export type ConceptoInsumoUncheckedCreateWithoutInsumoInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    concepto_id: string
    tipo_insumo: $Enums.TipoInsumo
    cantidad: Decimal | DecimalJsLike | number | string
    rendimiento?: Decimal | DecimalJsLike | number | string
    costo_unitario?: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ConceptoInsumoCreateOrConnectWithoutInsumoInput = {
    where: ConceptoInsumoWhereUniqueInput
    create: XOR<ConceptoInsumoCreateWithoutInsumoInput, ConceptoInsumoUncheckedCreateWithoutInsumoInput>
  }

  export type ConceptoInsumoCreateManyInsumoInputEnvelope = {
    data: ConceptoInsumoCreateManyInsumoInput | ConceptoInsumoCreateManyInsumoInput[]
    skipDuplicates?: boolean
  }

  export type CategoriaGastoUpsertWithoutInsumosInput = {
    update: XOR<CategoriaGastoUpdateWithoutInsumosInput, CategoriaGastoUncheckedUpdateWithoutInsumosInput>
    create: XOR<CategoriaGastoCreateWithoutInsumosInput, CategoriaGastoUncheckedCreateWithoutInsumosInput>
    where?: CategoriaGastoWhereInput
  }

  export type CategoriaGastoUpdateToOneWithWhereWithoutInsumosInput = {
    where?: CategoriaGastoWhereInput
    data: XOR<CategoriaGastoUpdateWithoutInsumosInput, CategoriaGastoUncheckedUpdateWithoutInsumosInput>
  }

  export type CategoriaGastoUpdateWithoutInsumosInput = {
    id_categoria?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    es_predefinida?: BoolFieldUpdateOperationsInput | boolean
    activa?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CategoriaGastoUncheckedUpdateWithoutInsumosInput = {
    id_categoria?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    es_predefinida?: BoolFieldUpdateOperationsInput | boolean
    activa?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConceptoInsumoUpsertWithWhereUniqueWithoutInsumoInput = {
    where: ConceptoInsumoWhereUniqueInput
    update: XOR<ConceptoInsumoUpdateWithoutInsumoInput, ConceptoInsumoUncheckedUpdateWithoutInsumoInput>
    create: XOR<ConceptoInsumoCreateWithoutInsumoInput, ConceptoInsumoUncheckedCreateWithoutInsumoInput>
  }

  export type ConceptoInsumoUpdateWithWhereUniqueWithoutInsumoInput = {
    where: ConceptoInsumoWhereUniqueInput
    data: XOR<ConceptoInsumoUpdateWithoutInsumoInput, ConceptoInsumoUncheckedUpdateWithoutInsumoInput>
  }

  export type ConceptoInsumoUpdateManyWithWhereWithoutInsumoInput = {
    where: ConceptoInsumoScalarWhereInput
    data: XOR<ConceptoInsumoUpdateManyMutationInput, ConceptoInsumoUncheckedUpdateManyWithoutInsumoInput>
  }

  export type ConceptoInsumoScalarWhereInput = {
    AND?: ConceptoInsumoScalarWhereInput | ConceptoInsumoScalarWhereInput[]
    OR?: ConceptoInsumoScalarWhereInput[]
    NOT?: ConceptoInsumoScalarWhereInput | ConceptoInsumoScalarWhereInput[]
    id?: UuidFilter<"ConceptoInsumo"> | string
    tenant_id?: UuidFilter<"ConceptoInsumo"> | string
    proyecto_id?: UuidFilter<"ConceptoInsumo"> | string
    concepto_id?: UuidFilter<"ConceptoInsumo"> | string
    insumo_id?: UuidFilter<"ConceptoInsumo"> | string
    tipo_insumo?: EnumTipoInsumoFilter<"ConceptoInsumo"> | $Enums.TipoInsumo
    cantidad?: DecimalFilter<"ConceptoInsumo"> | Decimal | DecimalJsLike | number | string
    rendimiento?: DecimalFilter<"ConceptoInsumo"> | Decimal | DecimalJsLike | number | string
    costo_unitario?: DecimalFilter<"ConceptoInsumo"> | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFilter<"ConceptoInsumo"> | Date | string
    updated_at?: DateTimeFilter<"ConceptoInsumo"> | Date | string
  }

  export type ConceptoCreateWithoutPresupuestoInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    clave: string
    descripcion: string
    unidad_medida: string
    cantidad: Decimal | DecimalJsLike | number | string
    precio_unitario: Decimal | DecimalJsLike | number | string
    importe: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
    insumos?: ConceptoInsumoCreateNestedManyWithoutConceptoInput
  }

  export type ConceptoUncheckedCreateWithoutPresupuestoInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    clave: string
    descripcion: string
    unidad_medida: string
    cantidad: Decimal | DecimalJsLike | number | string
    precio_unitario: Decimal | DecimalJsLike | number | string
    importe: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
    insumos?: ConceptoInsumoUncheckedCreateNestedManyWithoutConceptoInput
  }

  export type ConceptoCreateOrConnectWithoutPresupuestoInput = {
    where: ConceptoWhereUniqueInput
    create: XOR<ConceptoCreateWithoutPresupuestoInput, ConceptoUncheckedCreateWithoutPresupuestoInput>
  }

  export type ConceptoCreateManyPresupuestoInputEnvelope = {
    data: ConceptoCreateManyPresupuestoInput | ConceptoCreateManyPresupuestoInput[]
    skipDuplicates?: boolean
  }

  export type ConceptoUpsertWithWhereUniqueWithoutPresupuestoInput = {
    where: ConceptoWhereUniqueInput
    update: XOR<ConceptoUpdateWithoutPresupuestoInput, ConceptoUncheckedUpdateWithoutPresupuestoInput>
    create: XOR<ConceptoCreateWithoutPresupuestoInput, ConceptoUncheckedCreateWithoutPresupuestoInput>
  }

  export type ConceptoUpdateWithWhereUniqueWithoutPresupuestoInput = {
    where: ConceptoWhereUniqueInput
    data: XOR<ConceptoUpdateWithoutPresupuestoInput, ConceptoUncheckedUpdateWithoutPresupuestoInput>
  }

  export type ConceptoUpdateManyWithWhereWithoutPresupuestoInput = {
    where: ConceptoScalarWhereInput
    data: XOR<ConceptoUpdateManyMutationInput, ConceptoUncheckedUpdateManyWithoutPresupuestoInput>
  }

  export type ConceptoScalarWhereInput = {
    AND?: ConceptoScalarWhereInput | ConceptoScalarWhereInput[]
    OR?: ConceptoScalarWhereInput[]
    NOT?: ConceptoScalarWhereInput | ConceptoScalarWhereInput[]
    id?: UuidFilter<"Concepto"> | string
    tenant_id?: UuidFilter<"Concepto"> | string
    proyecto_id?: UuidFilter<"Concepto"> | string
    presupuesto_id?: UuidFilter<"Concepto"> | string
    clave?: StringFilter<"Concepto"> | string
    descripcion?: StringFilter<"Concepto"> | string
    unidad_medida?: StringFilter<"Concepto"> | string
    cantidad?: DecimalFilter<"Concepto"> | Decimal | DecimalJsLike | number | string
    precio_unitario?: DecimalFilter<"Concepto"> | Decimal | DecimalJsLike | number | string
    importe?: DecimalFilter<"Concepto"> | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFilter<"Concepto"> | Date | string
    updated_at?: DateTimeFilter<"Concepto"> | Date | string
  }

  export type PresupuestoBaseCreateWithoutConceptosInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    version?: number
    estado?: $Enums.EstadoPresupuesto
    importe_total?: Decimal | DecimalJsLike | number | string
    aprobado_por?: string | null
    fecha_aprobacion?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type PresupuestoBaseUncheckedCreateWithoutConceptosInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    version?: number
    estado?: $Enums.EstadoPresupuesto
    importe_total?: Decimal | DecimalJsLike | number | string
    aprobado_por?: string | null
    fecha_aprobacion?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type PresupuestoBaseCreateOrConnectWithoutConceptosInput = {
    where: PresupuestoBaseWhereUniqueInput
    create: XOR<PresupuestoBaseCreateWithoutConceptosInput, PresupuestoBaseUncheckedCreateWithoutConceptosInput>
  }

  export type ConceptoInsumoCreateWithoutConceptoInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    tipo_insumo: $Enums.TipoInsumo
    cantidad: Decimal | DecimalJsLike | number | string
    rendimiento?: Decimal | DecimalJsLike | number | string
    costo_unitario?: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
    insumo: InsumoCreateNestedOneWithoutConcepto_insumosInput
  }

  export type ConceptoInsumoUncheckedCreateWithoutConceptoInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    insumo_id: string
    tipo_insumo: $Enums.TipoInsumo
    cantidad: Decimal | DecimalJsLike | number | string
    rendimiento?: Decimal | DecimalJsLike | number | string
    costo_unitario?: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ConceptoInsumoCreateOrConnectWithoutConceptoInput = {
    where: ConceptoInsumoWhereUniqueInput
    create: XOR<ConceptoInsumoCreateWithoutConceptoInput, ConceptoInsumoUncheckedCreateWithoutConceptoInput>
  }

  export type ConceptoInsumoCreateManyConceptoInputEnvelope = {
    data: ConceptoInsumoCreateManyConceptoInput | ConceptoInsumoCreateManyConceptoInput[]
    skipDuplicates?: boolean
  }

  export type PresupuestoBaseUpsertWithoutConceptosInput = {
    update: XOR<PresupuestoBaseUpdateWithoutConceptosInput, PresupuestoBaseUncheckedUpdateWithoutConceptosInput>
    create: XOR<PresupuestoBaseCreateWithoutConceptosInput, PresupuestoBaseUncheckedCreateWithoutConceptosInput>
    where?: PresupuestoBaseWhereInput
  }

  export type PresupuestoBaseUpdateToOneWithWhereWithoutConceptosInput = {
    where?: PresupuestoBaseWhereInput
    data: XOR<PresupuestoBaseUpdateWithoutConceptosInput, PresupuestoBaseUncheckedUpdateWithoutConceptosInput>
  }

  export type PresupuestoBaseUpdateWithoutConceptosInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    version?: IntFieldUpdateOperationsInput | number
    estado?: EnumEstadoPresupuestoFieldUpdateOperationsInput | $Enums.EstadoPresupuesto
    importe_total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    aprobado_por?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_aprobacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PresupuestoBaseUncheckedUpdateWithoutConceptosInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    version?: IntFieldUpdateOperationsInput | number
    estado?: EnumEstadoPresupuestoFieldUpdateOperationsInput | $Enums.EstadoPresupuesto
    importe_total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    aprobado_por?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_aprobacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConceptoInsumoUpsertWithWhereUniqueWithoutConceptoInput = {
    where: ConceptoInsumoWhereUniqueInput
    update: XOR<ConceptoInsumoUpdateWithoutConceptoInput, ConceptoInsumoUncheckedUpdateWithoutConceptoInput>
    create: XOR<ConceptoInsumoCreateWithoutConceptoInput, ConceptoInsumoUncheckedCreateWithoutConceptoInput>
  }

  export type ConceptoInsumoUpdateWithWhereUniqueWithoutConceptoInput = {
    where: ConceptoInsumoWhereUniqueInput
    data: XOR<ConceptoInsumoUpdateWithoutConceptoInput, ConceptoInsumoUncheckedUpdateWithoutConceptoInput>
  }

  export type ConceptoInsumoUpdateManyWithWhereWithoutConceptoInput = {
    where: ConceptoInsumoScalarWhereInput
    data: XOR<ConceptoInsumoUpdateManyMutationInput, ConceptoInsumoUncheckedUpdateManyWithoutConceptoInput>
  }

  export type ConceptoCreateWithoutInsumosInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    clave: string
    descripcion: string
    unidad_medida: string
    cantidad: Decimal | DecimalJsLike | number | string
    precio_unitario: Decimal | DecimalJsLike | number | string
    importe: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
    presupuesto: PresupuestoBaseCreateNestedOneWithoutConceptosInput
  }

  export type ConceptoUncheckedCreateWithoutInsumosInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    presupuesto_id: string
    clave: string
    descripcion: string
    unidad_medida: string
    cantidad: Decimal | DecimalJsLike | number | string
    precio_unitario: Decimal | DecimalJsLike | number | string
    importe: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ConceptoCreateOrConnectWithoutInsumosInput = {
    where: ConceptoWhereUniqueInput
    create: XOR<ConceptoCreateWithoutInsumosInput, ConceptoUncheckedCreateWithoutInsumosInput>
  }

  export type InsumoCreateWithoutConcepto_insumosInput = {
    id?: string
    tenant_id: string
    clave: string
    descripcion: string
    unidad_medida: string
    tipo_insumo: $Enums.TipoInsumo
    costo_base: Decimal | DecimalJsLike | number | string
    activo?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    categoria_gasto?: CategoriaGastoCreateNestedOneWithoutInsumosInput
  }

  export type InsumoUncheckedCreateWithoutConcepto_insumosInput = {
    id?: string
    tenant_id: string
    clave: string
    descripcion: string
    unidad_medida: string
    tipo_insumo: $Enums.TipoInsumo
    costo_base: Decimal | DecimalJsLike | number | string
    categoria_gasto_id?: string | null
    activo?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type InsumoCreateOrConnectWithoutConcepto_insumosInput = {
    where: InsumoWhereUniqueInput
    create: XOR<InsumoCreateWithoutConcepto_insumosInput, InsumoUncheckedCreateWithoutConcepto_insumosInput>
  }

  export type ConceptoUpsertWithoutInsumosInput = {
    update: XOR<ConceptoUpdateWithoutInsumosInput, ConceptoUncheckedUpdateWithoutInsumosInput>
    create: XOR<ConceptoCreateWithoutInsumosInput, ConceptoUncheckedCreateWithoutInsumosInput>
    where?: ConceptoWhereInput
  }

  export type ConceptoUpdateToOneWithWhereWithoutInsumosInput = {
    where?: ConceptoWhereInput
    data: XOR<ConceptoUpdateWithoutInsumosInput, ConceptoUncheckedUpdateWithoutInsumosInput>
  }

  export type ConceptoUpdateWithoutInsumosInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    clave?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    unidad_medida?: StringFieldUpdateOperationsInput | string
    cantidad?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    precio_unitario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    importe?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    presupuesto?: PresupuestoBaseUpdateOneRequiredWithoutConceptosNestedInput
  }

  export type ConceptoUncheckedUpdateWithoutInsumosInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    presupuesto_id?: StringFieldUpdateOperationsInput | string
    clave?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    unidad_medida?: StringFieldUpdateOperationsInput | string
    cantidad?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    precio_unitario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    importe?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InsumoUpsertWithoutConcepto_insumosInput = {
    update: XOR<InsumoUpdateWithoutConcepto_insumosInput, InsumoUncheckedUpdateWithoutConcepto_insumosInput>
    create: XOR<InsumoCreateWithoutConcepto_insumosInput, InsumoUncheckedCreateWithoutConcepto_insumosInput>
    where?: InsumoWhereInput
  }

  export type InsumoUpdateToOneWithWhereWithoutConcepto_insumosInput = {
    where?: InsumoWhereInput
    data: XOR<InsumoUpdateWithoutConcepto_insumosInput, InsumoUncheckedUpdateWithoutConcepto_insumosInput>
  }

  export type InsumoUpdateWithoutConcepto_insumosInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    clave?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    unidad_medida?: StringFieldUpdateOperationsInput | string
    tipo_insumo?: EnumTipoInsumoFieldUpdateOperationsInput | $Enums.TipoInsumo
    costo_base?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    categoria_gasto?: CategoriaGastoUpdateOneWithoutInsumosNestedInput
  }

  export type InsumoUncheckedUpdateWithoutConcepto_insumosInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    clave?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    unidad_medida?: StringFieldUpdateOperationsInput | string
    tipo_insumo?: EnumTipoInsumoFieldUpdateOperationsInput | $Enums.TipoInsumo
    costo_base?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    categoria_gasto_id?: NullableStringFieldUpdateOperationsInput | string | null
    activo?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SaldoMovimientoCreateWithoutSaldo_partidaInput = {
    id?: string
    tenant_id: string
    referencia_id: string
    referencia_codigo?: string | null
    tipo: string
    campo: string
    delta: Decimal | DecimalJsLike | number | string
    saldo_resultante: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
  }

  export type SaldoMovimientoUncheckedCreateWithoutSaldo_partidaInput = {
    id?: string
    tenant_id: string
    referencia_id: string
    referencia_codigo?: string | null
    tipo: string
    campo: string
    delta: Decimal | DecimalJsLike | number | string
    saldo_resultante: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
  }

  export type SaldoMovimientoCreateOrConnectWithoutSaldo_partidaInput = {
    where: SaldoMovimientoWhereUniqueInput
    create: XOR<SaldoMovimientoCreateWithoutSaldo_partidaInput, SaldoMovimientoUncheckedCreateWithoutSaldo_partidaInput>
  }

  export type SaldoMovimientoCreateManySaldo_partidaInputEnvelope = {
    data: SaldoMovimientoCreateManySaldo_partidaInput | SaldoMovimientoCreateManySaldo_partidaInput[]
    skipDuplicates?: boolean
  }

  export type SaldoMovimientoUpsertWithWhereUniqueWithoutSaldo_partidaInput = {
    where: SaldoMovimientoWhereUniqueInput
    update: XOR<SaldoMovimientoUpdateWithoutSaldo_partidaInput, SaldoMovimientoUncheckedUpdateWithoutSaldo_partidaInput>
    create: XOR<SaldoMovimientoCreateWithoutSaldo_partidaInput, SaldoMovimientoUncheckedCreateWithoutSaldo_partidaInput>
  }

  export type SaldoMovimientoUpdateWithWhereUniqueWithoutSaldo_partidaInput = {
    where: SaldoMovimientoWhereUniqueInput
    data: XOR<SaldoMovimientoUpdateWithoutSaldo_partidaInput, SaldoMovimientoUncheckedUpdateWithoutSaldo_partidaInput>
  }

  export type SaldoMovimientoUpdateManyWithWhereWithoutSaldo_partidaInput = {
    where: SaldoMovimientoScalarWhereInput
    data: XOR<SaldoMovimientoUpdateManyMutationInput, SaldoMovimientoUncheckedUpdateManyWithoutSaldo_partidaInput>
  }

  export type SaldoMovimientoScalarWhereInput = {
    AND?: SaldoMovimientoScalarWhereInput | SaldoMovimientoScalarWhereInput[]
    OR?: SaldoMovimientoScalarWhereInput[]
    NOT?: SaldoMovimientoScalarWhereInput | SaldoMovimientoScalarWhereInput[]
    id?: UuidFilter<"SaldoMovimiento"> | string
    tenant_id?: UuidFilter<"SaldoMovimiento"> | string
    saldo_partida_id?: UuidFilter<"SaldoMovimiento"> | string
    referencia_id?: UuidFilter<"SaldoMovimiento"> | string
    referencia_codigo?: StringNullableFilter<"SaldoMovimiento"> | string | null
    tipo?: StringFilter<"SaldoMovimiento"> | string
    campo?: StringFilter<"SaldoMovimiento"> | string
    delta?: DecimalFilter<"SaldoMovimiento"> | Decimal | DecimalJsLike | number | string
    saldo_resultante?: DecimalFilter<"SaldoMovimiento"> | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFilter<"SaldoMovimiento"> | Date | string
  }

  export type SaldoPartidaCreateWithoutMovimientosInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    concepto_id: string
    concepto_clave: string
    concepto_desc: string
    monto_aprobado?: Decimal | DecimalJsLike | number | string
    monto_comprometido?: Decimal | DecimalJsLike | number | string
    monto_ejercido?: Decimal | DecimalJsLike | number | string
    monto_en_proceso?: Decimal | DecimalJsLike | number | string
    monto_disponible?: Decimal | DecimalJsLike | number | string
    estado_tope?: string
    bloqueo_automatico?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type SaldoPartidaUncheckedCreateWithoutMovimientosInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    concepto_id: string
    concepto_clave: string
    concepto_desc: string
    monto_aprobado?: Decimal | DecimalJsLike | number | string
    monto_comprometido?: Decimal | DecimalJsLike | number | string
    monto_ejercido?: Decimal | DecimalJsLike | number | string
    monto_en_proceso?: Decimal | DecimalJsLike | number | string
    monto_disponible?: Decimal | DecimalJsLike | number | string
    estado_tope?: string
    bloqueo_automatico?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type SaldoPartidaCreateOrConnectWithoutMovimientosInput = {
    where: SaldoPartidaWhereUniqueInput
    create: XOR<SaldoPartidaCreateWithoutMovimientosInput, SaldoPartidaUncheckedCreateWithoutMovimientosInput>
  }

  export type SaldoPartidaUpsertWithoutMovimientosInput = {
    update: XOR<SaldoPartidaUpdateWithoutMovimientosInput, SaldoPartidaUncheckedUpdateWithoutMovimientosInput>
    create: XOR<SaldoPartidaCreateWithoutMovimientosInput, SaldoPartidaUncheckedCreateWithoutMovimientosInput>
    where?: SaldoPartidaWhereInput
  }

  export type SaldoPartidaUpdateToOneWithWhereWithoutMovimientosInput = {
    where?: SaldoPartidaWhereInput
    data: XOR<SaldoPartidaUpdateWithoutMovimientosInput, SaldoPartidaUncheckedUpdateWithoutMovimientosInput>
  }

  export type SaldoPartidaUpdateWithoutMovimientosInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    concepto_id?: StringFieldUpdateOperationsInput | string
    concepto_clave?: StringFieldUpdateOperationsInput | string
    concepto_desc?: StringFieldUpdateOperationsInput | string
    monto_aprobado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_comprometido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_ejercido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_en_proceso?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_disponible?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    estado_tope?: StringFieldUpdateOperationsInput | string
    bloqueo_automatico?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SaldoPartidaUncheckedUpdateWithoutMovimientosInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    concepto_id?: StringFieldUpdateOperationsInput | string
    concepto_clave?: StringFieldUpdateOperationsInput | string
    concepto_desc?: StringFieldUpdateOperationsInput | string
    monto_aprobado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_comprometido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_ejercido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_en_proceso?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_disponible?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    estado_tope?: StringFieldUpdateOperationsInput | string
    bloqueo_automatico?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InsumoCreateManyCategoria_gastoInput = {
    id?: string
    tenant_id: string
    clave: string
    descripcion: string
    unidad_medida: string
    tipo_insumo: $Enums.TipoInsumo
    costo_base: Decimal | DecimalJsLike | number | string
    activo?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type InsumoUpdateWithoutCategoria_gastoInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    clave?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    unidad_medida?: StringFieldUpdateOperationsInput | string
    tipo_insumo?: EnumTipoInsumoFieldUpdateOperationsInput | $Enums.TipoInsumo
    costo_base?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    concepto_insumos?: ConceptoInsumoUpdateManyWithoutInsumoNestedInput
  }

  export type InsumoUncheckedUpdateWithoutCategoria_gastoInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    clave?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    unidad_medida?: StringFieldUpdateOperationsInput | string
    tipo_insumo?: EnumTipoInsumoFieldUpdateOperationsInput | $Enums.TipoInsumo
    costo_base?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    concepto_insumos?: ConceptoInsumoUncheckedUpdateManyWithoutInsumoNestedInput
  }

  export type InsumoUncheckedUpdateManyWithoutCategoria_gastoInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    clave?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    unidad_medida?: StringFieldUpdateOperationsInput | string
    tipo_insumo?: EnumTipoInsumoFieldUpdateOperationsInput | $Enums.TipoInsumo
    costo_base?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConceptoInsumoCreateManyInsumoInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    concepto_id: string
    tipo_insumo: $Enums.TipoInsumo
    cantidad: Decimal | DecimalJsLike | number | string
    rendimiento?: Decimal | DecimalJsLike | number | string
    costo_unitario?: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ConceptoInsumoUpdateWithoutInsumoInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    tipo_insumo?: EnumTipoInsumoFieldUpdateOperationsInput | $Enums.TipoInsumo
    cantidad?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    rendimiento?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    costo_unitario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    concepto?: ConceptoUpdateOneRequiredWithoutInsumosNestedInput
  }

  export type ConceptoInsumoUncheckedUpdateWithoutInsumoInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    concepto_id?: StringFieldUpdateOperationsInput | string
    tipo_insumo?: EnumTipoInsumoFieldUpdateOperationsInput | $Enums.TipoInsumo
    cantidad?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    rendimiento?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    costo_unitario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConceptoInsumoUncheckedUpdateManyWithoutInsumoInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    concepto_id?: StringFieldUpdateOperationsInput | string
    tipo_insumo?: EnumTipoInsumoFieldUpdateOperationsInput | $Enums.TipoInsumo
    cantidad?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    rendimiento?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    costo_unitario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConceptoCreateManyPresupuestoInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    clave: string
    descripcion: string
    unidad_medida: string
    cantidad: Decimal | DecimalJsLike | number | string
    precio_unitario: Decimal | DecimalJsLike | number | string
    importe: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ConceptoUpdateWithoutPresupuestoInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    clave?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    unidad_medida?: StringFieldUpdateOperationsInput | string
    cantidad?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    precio_unitario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    importe?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    insumos?: ConceptoInsumoUpdateManyWithoutConceptoNestedInput
  }

  export type ConceptoUncheckedUpdateWithoutPresupuestoInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    clave?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    unidad_medida?: StringFieldUpdateOperationsInput | string
    cantidad?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    precio_unitario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    importe?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    insumos?: ConceptoInsumoUncheckedUpdateManyWithoutConceptoNestedInput
  }

  export type ConceptoUncheckedUpdateManyWithoutPresupuestoInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    clave?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    unidad_medida?: StringFieldUpdateOperationsInput | string
    cantidad?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    precio_unitario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    importe?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConceptoInsumoCreateManyConceptoInput = {
    id?: string
    tenant_id: string
    proyecto_id: string
    insumo_id: string
    tipo_insumo: $Enums.TipoInsumo
    cantidad: Decimal | DecimalJsLike | number | string
    rendimiento?: Decimal | DecimalJsLike | number | string
    costo_unitario?: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ConceptoInsumoUpdateWithoutConceptoInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    tipo_insumo?: EnumTipoInsumoFieldUpdateOperationsInput | $Enums.TipoInsumo
    cantidad?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    rendimiento?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    costo_unitario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    insumo?: InsumoUpdateOneRequiredWithoutConcepto_insumosNestedInput
  }

  export type ConceptoInsumoUncheckedUpdateWithoutConceptoInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    insumo_id?: StringFieldUpdateOperationsInput | string
    tipo_insumo?: EnumTipoInsumoFieldUpdateOperationsInput | $Enums.TipoInsumo
    cantidad?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    rendimiento?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    costo_unitario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConceptoInsumoUncheckedUpdateManyWithoutConceptoInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    insumo_id?: StringFieldUpdateOperationsInput | string
    tipo_insumo?: EnumTipoInsumoFieldUpdateOperationsInput | $Enums.TipoInsumo
    cantidad?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    rendimiento?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    costo_unitario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SaldoMovimientoCreateManySaldo_partidaInput = {
    id?: string
    tenant_id: string
    referencia_id: string
    referencia_codigo?: string | null
    tipo: string
    campo: string
    delta: Decimal | DecimalJsLike | number | string
    saldo_resultante: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
  }

  export type SaldoMovimientoUpdateWithoutSaldo_partidaInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    referencia_id?: StringFieldUpdateOperationsInput | string
    referencia_codigo?: NullableStringFieldUpdateOperationsInput | string | null
    tipo?: StringFieldUpdateOperationsInput | string
    campo?: StringFieldUpdateOperationsInput | string
    delta?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    saldo_resultante?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SaldoMovimientoUncheckedUpdateWithoutSaldo_partidaInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    referencia_id?: StringFieldUpdateOperationsInput | string
    referencia_codigo?: NullableStringFieldUpdateOperationsInput | string | null
    tipo?: StringFieldUpdateOperationsInput | string
    campo?: StringFieldUpdateOperationsInput | string
    delta?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    saldo_resultante?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SaldoMovimientoUncheckedUpdateManyWithoutSaldo_partidaInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    referencia_id?: StringFieldUpdateOperationsInput | string
    referencia_codigo?: NullableStringFieldUpdateOperationsInput | string | null
    tipo?: StringFieldUpdateOperationsInput | string
    campo?: StringFieldUpdateOperationsInput | string
    delta?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    saldo_resultante?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use CategoriaGastoCountOutputTypeDefaultArgs instead
     */
    export type CategoriaGastoCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CategoriaGastoCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use InsumoCountOutputTypeDefaultArgs instead
     */
    export type InsumoCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = InsumoCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PresupuestoBaseCountOutputTypeDefaultArgs instead
     */
    export type PresupuestoBaseCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PresupuestoBaseCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ConceptoCountOutputTypeDefaultArgs instead
     */
    export type ConceptoCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ConceptoCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use SaldoPartidaCountOutputTypeDefaultArgs instead
     */
    export type SaldoPartidaCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = SaldoPartidaCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CategoriaGastoDefaultArgs instead
     */
    export type CategoriaGastoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CategoriaGastoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ProyectoCostosConfigDefaultArgs instead
     */
    export type ProyectoCostosConfigArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProyectoCostosConfigDefaultArgs<ExtArgs>
    /**
     * @deprecated Use InsumoDefaultArgs instead
     */
    export type InsumoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = InsumoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PresupuestoBaseDefaultArgs instead
     */
    export type PresupuestoBaseArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PresupuestoBaseDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ConceptoDefaultArgs instead
     */
    export type ConceptoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ConceptoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ConceptoInsumoDefaultArgs instead
     */
    export type ConceptoInsumoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ConceptoInsumoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use SaldoPartidaDefaultArgs instead
     */
    export type SaldoPartidaArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = SaldoPartidaDefaultArgs<ExtArgs>
    /**
     * @deprecated Use SaldoMovimientoDefaultArgs instead
     */
    export type SaldoMovimientoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = SaldoMovimientoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use FichaTecnicaInsumoDefaultArgs instead
     */
    export type FichaTecnicaInsumoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = FichaTecnicaInsumoDefaultArgs<ExtArgs>

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