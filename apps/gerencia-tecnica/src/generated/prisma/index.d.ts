
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
 * // Fetch zero or more Insumos
 * const insumos = await prisma.insumo.findMany()
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
   * // Fetch zero or more Insumos
   * const insumos = await prisma.insumo.findMany()
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
    Insumo: 'Insumo',
    PresupuestoBase: 'PresupuestoBase',
    Concepto: 'Concepto'
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
      modelProps: "insumo" | "presupuestoBase" | "concepto"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
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
   * Models
   */

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
    activo?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["insumo"]>

  export type InsumoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    clave?: boolean
    descripcion?: boolean
    unidad_medida?: boolean
    tipo_insumo?: boolean
    costo_base?: boolean
    activo?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["insumo"]>

  export type InsumoSelectScalar = {
    id?: boolean
    tenant_id?: boolean
    clave?: boolean
    descripcion?: boolean
    unidad_medida?: boolean
    tipo_insumo?: boolean
    costo_base?: boolean
    activo?: boolean
    created_at?: boolean
    updated_at?: boolean
  }


  export type $InsumoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Insumo"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenant_id: string
      clave: string
      descripcion: string
      unidad_medida: string
      tipo_insumo: $Enums.TipoInsumo
      costo_base: Prisma.Decimal
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
   * Insumo without action
   */
  export type InsumoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Insumo
     */
    select?: InsumoSelect<ExtArgs> | null
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
  }
  export type ConceptoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    presupuesto?: boolean | PresupuestoBaseDefaultArgs<ExtArgs>
  }

  export type $ConceptoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Concepto"
    objects: {
      presupuesto: Prisma.$PresupuestoBasePayload<ExtArgs>
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
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const InsumoScalarFieldEnum: {
    id: 'id',
    tenant_id: 'tenant_id',
    clave: 'clave',
    descripcion: 'descripcion',
    unidad_medida: 'unidad_medida',
    tipo_insumo: 'tipo_insumo',
    costo_base: 'costo_base',
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
    activo?: BoolFilter<"Insumo"> | boolean
    created_at?: DateTimeFilter<"Insumo"> | Date | string
    updated_at?: DateTimeFilter<"Insumo"> | Date | string
  }

  export type InsumoOrderByWithRelationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    clave?: SortOrder
    descripcion?: SortOrder
    unidad_medida?: SortOrder
    tipo_insumo?: SortOrder
    costo_base?: SortOrder
    activo?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
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
    activo?: BoolFilter<"Insumo"> | boolean
    created_at?: DateTimeFilter<"Insumo"> | Date | string
    updated_at?: DateTimeFilter<"Insumo"> | Date | string
  }, "id" | "uq_insumo_tenant_clave">

  export type InsumoOrderByWithAggregationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    clave?: SortOrder
    descripcion?: SortOrder
    unidad_medida?: SortOrder
    tipo_insumo?: SortOrder
    costo_base?: SortOrder
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
  }

  export type InsumoUncheckedCreateInput = {
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
  }

  export type InsumoUncheckedUpdateInput = {
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

  export type InsumoCreateManyInput = {
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
    activo?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type InsumoSumOrderByAggregateInput = {
    costo_base?: SortOrder
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

  export type StringFieldUpdateOperationsInput = {
    set?: string
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

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
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

  export type PresupuestoBaseUpdateOneRequiredWithoutConceptosNestedInput = {
    create?: XOR<PresupuestoBaseCreateWithoutConceptosInput, PresupuestoBaseUncheckedCreateWithoutConceptosInput>
    connectOrCreate?: PresupuestoBaseCreateOrConnectWithoutConceptosInput
    upsert?: PresupuestoBaseUpsertWithoutConceptosInput
    connect?: PresupuestoBaseWhereUniqueInput
    update?: XOR<XOR<PresupuestoBaseUpdateToOneWithWhereWithoutConceptosInput, PresupuestoBaseUpdateWithoutConceptosInput>, PresupuestoBaseUncheckedUpdateWithoutConceptosInput>
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
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type PresupuestoBaseCreateOrConnectWithoutConceptosInput = {
    where: PresupuestoBaseWhereUniqueInput
    create: XOR<PresupuestoBaseCreateWithoutConceptosInput, PresupuestoBaseUncheckedCreateWithoutConceptosInput>
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



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use PresupuestoBaseCountOutputTypeDefaultArgs instead
     */
    export type PresupuestoBaseCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PresupuestoBaseCountOutputTypeDefaultArgs<ExtArgs>
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