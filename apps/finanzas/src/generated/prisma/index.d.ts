
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
 * Model PresupuestoAsignado
 * 
 */
export type PresupuestoAsignado = $Result.DefaultSelection<Prisma.$PresupuestoAsignadoPayload>
/**
 * Model MovimientoPresupuestal
 * 
 */
export type MovimientoPresupuestal = $Result.DefaultSelection<Prisma.$MovimientoPresupuestalPayload>
/**
 * Model ProgramaPagos
 * 
 */
export type ProgramaPagos = $Result.DefaultSelection<Prisma.$ProgramaPagosPayload>
/**
 * Model CuentaBancaria
 * 
 */
export type CuentaBancaria = $Result.DefaultSelection<Prisma.$CuentaBancariaPayload>
/**
 * Model ProyectoFinanzas
 * 
 */
export type ProyectoFinanzas = $Result.DefaultSelection<Prisma.$ProyectoFinanzasPayload>
/**
 * Model PagoOC
 * 
 */
export type PagoOC = $Result.DefaultSelection<Prisma.$PagoOCPayload>
/**
 * Model DetallePagoOC
 * 
 */
export type DetallePagoOC = $Result.DefaultSelection<Prisma.$DetallePagoOCPayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more PresupuestoAsignados
 * const presupuestoAsignados = await prisma.presupuestoAsignado.findMany()
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
   * // Fetch zero or more PresupuestoAsignados
   * const presupuestoAsignados = await prisma.presupuestoAsignado.findMany()
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
   * `prisma.presupuestoAsignado`: Exposes CRUD operations for the **PresupuestoAsignado** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PresupuestoAsignados
    * const presupuestoAsignados = await prisma.presupuestoAsignado.findMany()
    * ```
    */
  get presupuestoAsignado(): Prisma.PresupuestoAsignadoDelegate<ExtArgs>;

  /**
   * `prisma.movimientoPresupuestal`: Exposes CRUD operations for the **MovimientoPresupuestal** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MovimientoPresupuestals
    * const movimientoPresupuestals = await prisma.movimientoPresupuestal.findMany()
    * ```
    */
  get movimientoPresupuestal(): Prisma.MovimientoPresupuestalDelegate<ExtArgs>;

  /**
   * `prisma.programaPagos`: Exposes CRUD operations for the **ProgramaPagos** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ProgramaPagos
    * const programaPagos = await prisma.programaPagos.findMany()
    * ```
    */
  get programaPagos(): Prisma.ProgramaPagosDelegate<ExtArgs>;

  /**
   * `prisma.cuentaBancaria`: Exposes CRUD operations for the **CuentaBancaria** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CuentaBancarias
    * const cuentaBancarias = await prisma.cuentaBancaria.findMany()
    * ```
    */
  get cuentaBancaria(): Prisma.CuentaBancariaDelegate<ExtArgs>;

  /**
   * `prisma.proyectoFinanzas`: Exposes CRUD operations for the **ProyectoFinanzas** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ProyectoFinanzas
    * const proyectoFinanzas = await prisma.proyectoFinanzas.findMany()
    * ```
    */
  get proyectoFinanzas(): Prisma.ProyectoFinanzasDelegate<ExtArgs>;

  /**
   * `prisma.pagoOC`: Exposes CRUD operations for the **PagoOC** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PagoOCS
    * const pagoOCS = await prisma.pagoOC.findMany()
    * ```
    */
  get pagoOC(): Prisma.PagoOCDelegate<ExtArgs>;

  /**
   * `prisma.detallePagoOC`: Exposes CRUD operations for the **DetallePagoOC** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DetallePagoOCS
    * const detallePagoOCS = await prisma.detallePagoOC.findMany()
    * ```
    */
  get detallePagoOC(): Prisma.DetallePagoOCDelegate<ExtArgs>;
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
    PresupuestoAsignado: 'PresupuestoAsignado',
    MovimientoPresupuestal: 'MovimientoPresupuestal',
    ProgramaPagos: 'ProgramaPagos',
    CuentaBancaria: 'CuentaBancaria',
    ProyectoFinanzas: 'ProyectoFinanzas',
    PagoOC: 'PagoOC',
    DetallePagoOC: 'DetallePagoOC'
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
      modelProps: "presupuestoAsignado" | "movimientoPresupuestal" | "programaPagos" | "cuentaBancaria" | "proyectoFinanzas" | "pagoOC" | "detallePagoOC"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      PresupuestoAsignado: {
        payload: Prisma.$PresupuestoAsignadoPayload<ExtArgs>
        fields: Prisma.PresupuestoAsignadoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PresupuestoAsignadoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PresupuestoAsignadoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PresupuestoAsignadoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PresupuestoAsignadoPayload>
          }
          findFirst: {
            args: Prisma.PresupuestoAsignadoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PresupuestoAsignadoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PresupuestoAsignadoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PresupuestoAsignadoPayload>
          }
          findMany: {
            args: Prisma.PresupuestoAsignadoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PresupuestoAsignadoPayload>[]
          }
          create: {
            args: Prisma.PresupuestoAsignadoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PresupuestoAsignadoPayload>
          }
          createMany: {
            args: Prisma.PresupuestoAsignadoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PresupuestoAsignadoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PresupuestoAsignadoPayload>[]
          }
          delete: {
            args: Prisma.PresupuestoAsignadoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PresupuestoAsignadoPayload>
          }
          update: {
            args: Prisma.PresupuestoAsignadoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PresupuestoAsignadoPayload>
          }
          deleteMany: {
            args: Prisma.PresupuestoAsignadoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PresupuestoAsignadoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PresupuestoAsignadoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PresupuestoAsignadoPayload>
          }
          aggregate: {
            args: Prisma.PresupuestoAsignadoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePresupuestoAsignado>
          }
          groupBy: {
            args: Prisma.PresupuestoAsignadoGroupByArgs<ExtArgs>
            result: $Utils.Optional<PresupuestoAsignadoGroupByOutputType>[]
          }
          count: {
            args: Prisma.PresupuestoAsignadoCountArgs<ExtArgs>
            result: $Utils.Optional<PresupuestoAsignadoCountAggregateOutputType> | number
          }
        }
      }
      MovimientoPresupuestal: {
        payload: Prisma.$MovimientoPresupuestalPayload<ExtArgs>
        fields: Prisma.MovimientoPresupuestalFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MovimientoPresupuestalFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MovimientoPresupuestalPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MovimientoPresupuestalFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MovimientoPresupuestalPayload>
          }
          findFirst: {
            args: Prisma.MovimientoPresupuestalFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MovimientoPresupuestalPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MovimientoPresupuestalFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MovimientoPresupuestalPayload>
          }
          findMany: {
            args: Prisma.MovimientoPresupuestalFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MovimientoPresupuestalPayload>[]
          }
          create: {
            args: Prisma.MovimientoPresupuestalCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MovimientoPresupuestalPayload>
          }
          createMany: {
            args: Prisma.MovimientoPresupuestalCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MovimientoPresupuestalCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MovimientoPresupuestalPayload>[]
          }
          delete: {
            args: Prisma.MovimientoPresupuestalDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MovimientoPresupuestalPayload>
          }
          update: {
            args: Prisma.MovimientoPresupuestalUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MovimientoPresupuestalPayload>
          }
          deleteMany: {
            args: Prisma.MovimientoPresupuestalDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MovimientoPresupuestalUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.MovimientoPresupuestalUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MovimientoPresupuestalPayload>
          }
          aggregate: {
            args: Prisma.MovimientoPresupuestalAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMovimientoPresupuestal>
          }
          groupBy: {
            args: Prisma.MovimientoPresupuestalGroupByArgs<ExtArgs>
            result: $Utils.Optional<MovimientoPresupuestalGroupByOutputType>[]
          }
          count: {
            args: Prisma.MovimientoPresupuestalCountArgs<ExtArgs>
            result: $Utils.Optional<MovimientoPresupuestalCountAggregateOutputType> | number
          }
        }
      }
      ProgramaPagos: {
        payload: Prisma.$ProgramaPagosPayload<ExtArgs>
        fields: Prisma.ProgramaPagosFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProgramaPagosFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgramaPagosPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProgramaPagosFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgramaPagosPayload>
          }
          findFirst: {
            args: Prisma.ProgramaPagosFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgramaPagosPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProgramaPagosFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgramaPagosPayload>
          }
          findMany: {
            args: Prisma.ProgramaPagosFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgramaPagosPayload>[]
          }
          create: {
            args: Prisma.ProgramaPagosCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgramaPagosPayload>
          }
          createMany: {
            args: Prisma.ProgramaPagosCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProgramaPagosCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgramaPagosPayload>[]
          }
          delete: {
            args: Prisma.ProgramaPagosDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgramaPagosPayload>
          }
          update: {
            args: Prisma.ProgramaPagosUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgramaPagosPayload>
          }
          deleteMany: {
            args: Prisma.ProgramaPagosDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProgramaPagosUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ProgramaPagosUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgramaPagosPayload>
          }
          aggregate: {
            args: Prisma.ProgramaPagosAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProgramaPagos>
          }
          groupBy: {
            args: Prisma.ProgramaPagosGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProgramaPagosGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProgramaPagosCountArgs<ExtArgs>
            result: $Utils.Optional<ProgramaPagosCountAggregateOutputType> | number
          }
        }
      }
      CuentaBancaria: {
        payload: Prisma.$CuentaBancariaPayload<ExtArgs>
        fields: Prisma.CuentaBancariaFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CuentaBancariaFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CuentaBancariaPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CuentaBancariaFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CuentaBancariaPayload>
          }
          findFirst: {
            args: Prisma.CuentaBancariaFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CuentaBancariaPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CuentaBancariaFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CuentaBancariaPayload>
          }
          findMany: {
            args: Prisma.CuentaBancariaFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CuentaBancariaPayload>[]
          }
          create: {
            args: Prisma.CuentaBancariaCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CuentaBancariaPayload>
          }
          createMany: {
            args: Prisma.CuentaBancariaCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CuentaBancariaCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CuentaBancariaPayload>[]
          }
          delete: {
            args: Prisma.CuentaBancariaDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CuentaBancariaPayload>
          }
          update: {
            args: Prisma.CuentaBancariaUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CuentaBancariaPayload>
          }
          deleteMany: {
            args: Prisma.CuentaBancariaDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CuentaBancariaUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CuentaBancariaUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CuentaBancariaPayload>
          }
          aggregate: {
            args: Prisma.CuentaBancariaAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCuentaBancaria>
          }
          groupBy: {
            args: Prisma.CuentaBancariaGroupByArgs<ExtArgs>
            result: $Utils.Optional<CuentaBancariaGroupByOutputType>[]
          }
          count: {
            args: Prisma.CuentaBancariaCountArgs<ExtArgs>
            result: $Utils.Optional<CuentaBancariaCountAggregateOutputType> | number
          }
        }
      }
      ProyectoFinanzas: {
        payload: Prisma.$ProyectoFinanzasPayload<ExtArgs>
        fields: Prisma.ProyectoFinanzasFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProyectoFinanzasFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProyectoFinanzasPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProyectoFinanzasFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProyectoFinanzasPayload>
          }
          findFirst: {
            args: Prisma.ProyectoFinanzasFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProyectoFinanzasPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProyectoFinanzasFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProyectoFinanzasPayload>
          }
          findMany: {
            args: Prisma.ProyectoFinanzasFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProyectoFinanzasPayload>[]
          }
          create: {
            args: Prisma.ProyectoFinanzasCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProyectoFinanzasPayload>
          }
          createMany: {
            args: Prisma.ProyectoFinanzasCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProyectoFinanzasCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProyectoFinanzasPayload>[]
          }
          delete: {
            args: Prisma.ProyectoFinanzasDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProyectoFinanzasPayload>
          }
          update: {
            args: Prisma.ProyectoFinanzasUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProyectoFinanzasPayload>
          }
          deleteMany: {
            args: Prisma.ProyectoFinanzasDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProyectoFinanzasUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ProyectoFinanzasUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProyectoFinanzasPayload>
          }
          aggregate: {
            args: Prisma.ProyectoFinanzasAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProyectoFinanzas>
          }
          groupBy: {
            args: Prisma.ProyectoFinanzasGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProyectoFinanzasGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProyectoFinanzasCountArgs<ExtArgs>
            result: $Utils.Optional<ProyectoFinanzasCountAggregateOutputType> | number
          }
        }
      }
      PagoOC: {
        payload: Prisma.$PagoOCPayload<ExtArgs>
        fields: Prisma.PagoOCFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PagoOCFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PagoOCPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PagoOCFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PagoOCPayload>
          }
          findFirst: {
            args: Prisma.PagoOCFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PagoOCPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PagoOCFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PagoOCPayload>
          }
          findMany: {
            args: Prisma.PagoOCFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PagoOCPayload>[]
          }
          create: {
            args: Prisma.PagoOCCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PagoOCPayload>
          }
          createMany: {
            args: Prisma.PagoOCCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PagoOCCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PagoOCPayload>[]
          }
          delete: {
            args: Prisma.PagoOCDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PagoOCPayload>
          }
          update: {
            args: Prisma.PagoOCUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PagoOCPayload>
          }
          deleteMany: {
            args: Prisma.PagoOCDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PagoOCUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PagoOCUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PagoOCPayload>
          }
          aggregate: {
            args: Prisma.PagoOCAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePagoOC>
          }
          groupBy: {
            args: Prisma.PagoOCGroupByArgs<ExtArgs>
            result: $Utils.Optional<PagoOCGroupByOutputType>[]
          }
          count: {
            args: Prisma.PagoOCCountArgs<ExtArgs>
            result: $Utils.Optional<PagoOCCountAggregateOutputType> | number
          }
        }
      }
      DetallePagoOC: {
        payload: Prisma.$DetallePagoOCPayload<ExtArgs>
        fields: Prisma.DetallePagoOCFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DetallePagoOCFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DetallePagoOCPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DetallePagoOCFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DetallePagoOCPayload>
          }
          findFirst: {
            args: Prisma.DetallePagoOCFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DetallePagoOCPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DetallePagoOCFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DetallePagoOCPayload>
          }
          findMany: {
            args: Prisma.DetallePagoOCFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DetallePagoOCPayload>[]
          }
          create: {
            args: Prisma.DetallePagoOCCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DetallePagoOCPayload>
          }
          createMany: {
            args: Prisma.DetallePagoOCCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DetallePagoOCCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DetallePagoOCPayload>[]
          }
          delete: {
            args: Prisma.DetallePagoOCDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DetallePagoOCPayload>
          }
          update: {
            args: Prisma.DetallePagoOCUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DetallePagoOCPayload>
          }
          deleteMany: {
            args: Prisma.DetallePagoOCDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DetallePagoOCUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.DetallePagoOCUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DetallePagoOCPayload>
          }
          aggregate: {
            args: Prisma.DetallePagoOCAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDetallePagoOC>
          }
          groupBy: {
            args: Prisma.DetallePagoOCGroupByArgs<ExtArgs>
            result: $Utils.Optional<DetallePagoOCGroupByOutputType>[]
          }
          count: {
            args: Prisma.DetallePagoOCCountArgs<ExtArgs>
            result: $Utils.Optional<DetallePagoOCCountAggregateOutputType> | number
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
   * Count Type PresupuestoAsignadoCountOutputType
   */

  export type PresupuestoAsignadoCountOutputType = {
    movimientos: number
    programa_pagos: number
  }

  export type PresupuestoAsignadoCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    movimientos?: boolean | PresupuestoAsignadoCountOutputTypeCountMovimientosArgs
    programa_pagos?: boolean | PresupuestoAsignadoCountOutputTypeCountPrograma_pagosArgs
  }

  // Custom InputTypes
  /**
   * PresupuestoAsignadoCountOutputType without action
   */
  export type PresupuestoAsignadoCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PresupuestoAsignadoCountOutputType
     */
    select?: PresupuestoAsignadoCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * PresupuestoAsignadoCountOutputType without action
   */
  export type PresupuestoAsignadoCountOutputTypeCountMovimientosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MovimientoPresupuestalWhereInput
  }

  /**
   * PresupuestoAsignadoCountOutputType without action
   */
  export type PresupuestoAsignadoCountOutputTypeCountPrograma_pagosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProgramaPagosWhereInput
  }


  /**
   * Count Type CuentaBancariaCountOutputType
   */

  export type CuentaBancariaCountOutputType = {
    pagos: number
  }

  export type CuentaBancariaCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    pagos?: boolean | CuentaBancariaCountOutputTypeCountPagosArgs
  }

  // Custom InputTypes
  /**
   * CuentaBancariaCountOutputType without action
   */
  export type CuentaBancariaCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CuentaBancariaCountOutputType
     */
    select?: CuentaBancariaCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CuentaBancariaCountOutputType without action
   */
  export type CuentaBancariaCountOutputTypeCountPagosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PagoOCWhereInput
  }


  /**
   * Count Type PagoOCCountOutputType
   */

  export type PagoOCCountOutputType = {
    detalles: number
  }

  export type PagoOCCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    detalles?: boolean | PagoOCCountOutputTypeCountDetallesArgs
  }

  // Custom InputTypes
  /**
   * PagoOCCountOutputType without action
   */
  export type PagoOCCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PagoOCCountOutputType
     */
    select?: PagoOCCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * PagoOCCountOutputType without action
   */
  export type PagoOCCountOutputTypeCountDetallesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DetallePagoOCWhereInput
  }


  /**
   * Models
   */

  /**
   * Model PresupuestoAsignado
   */

  export type AggregatePresupuestoAsignado = {
    _count: PresupuestoAsignadoCountAggregateOutputType | null
    _avg: PresupuestoAsignadoAvgAggregateOutputType | null
    _sum: PresupuestoAsignadoSumAggregateOutputType | null
    _min: PresupuestoAsignadoMinAggregateOutputType | null
    _max: PresupuestoAsignadoMaxAggregateOutputType | null
  }

  export type PresupuestoAsignadoAvgAggregateOutputType = {
    monto_autorizado: Decimal | null
    monto_ejercido: Decimal | null
    monto_comprometido: Decimal | null
    monto_disponible: Decimal | null
  }

  export type PresupuestoAsignadoSumAggregateOutputType = {
    monto_autorizado: Decimal | null
    monto_ejercido: Decimal | null
    monto_comprometido: Decimal | null
    monto_disponible: Decimal | null
  }

  export type PresupuestoAsignadoMinAggregateOutputType = {
    id_presupuesto: string | null
    tenant_id: string | null
    proyecto_id: string | null
    codigo: string | null
    descripcion: string | null
    monto_autorizado: Decimal | null
    monto_ejercido: Decimal | null
    monto_comprometido: Decimal | null
    monto_disponible: Decimal | null
    moneda: string | null
    capitulo: string | null
    estatus: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type PresupuestoAsignadoMaxAggregateOutputType = {
    id_presupuesto: string | null
    tenant_id: string | null
    proyecto_id: string | null
    codigo: string | null
    descripcion: string | null
    monto_autorizado: Decimal | null
    monto_ejercido: Decimal | null
    monto_comprometido: Decimal | null
    monto_disponible: Decimal | null
    moneda: string | null
    capitulo: string | null
    estatus: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type PresupuestoAsignadoCountAggregateOutputType = {
    id_presupuesto: number
    tenant_id: number
    proyecto_id: number
    codigo: number
    descripcion: number
    monto_autorizado: number
    monto_ejercido: number
    monto_comprometido: number
    monto_disponible: number
    moneda: number
    capitulo: number
    estatus: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type PresupuestoAsignadoAvgAggregateInputType = {
    monto_autorizado?: true
    monto_ejercido?: true
    monto_comprometido?: true
    monto_disponible?: true
  }

  export type PresupuestoAsignadoSumAggregateInputType = {
    monto_autorizado?: true
    monto_ejercido?: true
    monto_comprometido?: true
    monto_disponible?: true
  }

  export type PresupuestoAsignadoMinAggregateInputType = {
    id_presupuesto?: true
    tenant_id?: true
    proyecto_id?: true
    codigo?: true
    descripcion?: true
    monto_autorizado?: true
    monto_ejercido?: true
    monto_comprometido?: true
    monto_disponible?: true
    moneda?: true
    capitulo?: true
    estatus?: true
    created_at?: true
    updated_at?: true
  }

  export type PresupuestoAsignadoMaxAggregateInputType = {
    id_presupuesto?: true
    tenant_id?: true
    proyecto_id?: true
    codigo?: true
    descripcion?: true
    monto_autorizado?: true
    monto_ejercido?: true
    monto_comprometido?: true
    monto_disponible?: true
    moneda?: true
    capitulo?: true
    estatus?: true
    created_at?: true
    updated_at?: true
  }

  export type PresupuestoAsignadoCountAggregateInputType = {
    id_presupuesto?: true
    tenant_id?: true
    proyecto_id?: true
    codigo?: true
    descripcion?: true
    monto_autorizado?: true
    monto_ejercido?: true
    monto_comprometido?: true
    monto_disponible?: true
    moneda?: true
    capitulo?: true
    estatus?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type PresupuestoAsignadoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PresupuestoAsignado to aggregate.
     */
    where?: PresupuestoAsignadoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PresupuestoAsignados to fetch.
     */
    orderBy?: PresupuestoAsignadoOrderByWithRelationInput | PresupuestoAsignadoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PresupuestoAsignadoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PresupuestoAsignados from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PresupuestoAsignados.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PresupuestoAsignados
    **/
    _count?: true | PresupuestoAsignadoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PresupuestoAsignadoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PresupuestoAsignadoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PresupuestoAsignadoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PresupuestoAsignadoMaxAggregateInputType
  }

  export type GetPresupuestoAsignadoAggregateType<T extends PresupuestoAsignadoAggregateArgs> = {
        [P in keyof T & keyof AggregatePresupuestoAsignado]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePresupuestoAsignado[P]>
      : GetScalarType<T[P], AggregatePresupuestoAsignado[P]>
  }




  export type PresupuestoAsignadoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PresupuestoAsignadoWhereInput
    orderBy?: PresupuestoAsignadoOrderByWithAggregationInput | PresupuestoAsignadoOrderByWithAggregationInput[]
    by: PresupuestoAsignadoScalarFieldEnum[] | PresupuestoAsignadoScalarFieldEnum
    having?: PresupuestoAsignadoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PresupuestoAsignadoCountAggregateInputType | true
    _avg?: PresupuestoAsignadoAvgAggregateInputType
    _sum?: PresupuestoAsignadoSumAggregateInputType
    _min?: PresupuestoAsignadoMinAggregateInputType
    _max?: PresupuestoAsignadoMaxAggregateInputType
  }

  export type PresupuestoAsignadoGroupByOutputType = {
    id_presupuesto: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    descripcion: string
    monto_autorizado: Decimal
    monto_ejercido: Decimal
    monto_comprometido: Decimal
    monto_disponible: Decimal
    moneda: string
    capitulo: string
    estatus: string
    created_at: Date
    updated_at: Date
    _count: PresupuestoAsignadoCountAggregateOutputType | null
    _avg: PresupuestoAsignadoAvgAggregateOutputType | null
    _sum: PresupuestoAsignadoSumAggregateOutputType | null
    _min: PresupuestoAsignadoMinAggregateOutputType | null
    _max: PresupuestoAsignadoMaxAggregateOutputType | null
  }

  type GetPresupuestoAsignadoGroupByPayload<T extends PresupuestoAsignadoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PresupuestoAsignadoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PresupuestoAsignadoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PresupuestoAsignadoGroupByOutputType[P]>
            : GetScalarType<T[P], PresupuestoAsignadoGroupByOutputType[P]>
        }
      >
    >


  export type PresupuestoAsignadoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_presupuesto?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    codigo?: boolean
    descripcion?: boolean
    monto_autorizado?: boolean
    monto_ejercido?: boolean
    monto_comprometido?: boolean
    monto_disponible?: boolean
    moneda?: boolean
    capitulo?: boolean
    estatus?: boolean
    created_at?: boolean
    updated_at?: boolean
    movimientos?: boolean | PresupuestoAsignado$movimientosArgs<ExtArgs>
    programa_pagos?: boolean | PresupuestoAsignado$programa_pagosArgs<ExtArgs>
    _count?: boolean | PresupuestoAsignadoCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["presupuestoAsignado"]>

  export type PresupuestoAsignadoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_presupuesto?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    codigo?: boolean
    descripcion?: boolean
    monto_autorizado?: boolean
    monto_ejercido?: boolean
    monto_comprometido?: boolean
    monto_disponible?: boolean
    moneda?: boolean
    capitulo?: boolean
    estatus?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["presupuestoAsignado"]>

  export type PresupuestoAsignadoSelectScalar = {
    id_presupuesto?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    codigo?: boolean
    descripcion?: boolean
    monto_autorizado?: boolean
    monto_ejercido?: boolean
    monto_comprometido?: boolean
    monto_disponible?: boolean
    moneda?: boolean
    capitulo?: boolean
    estatus?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type PresupuestoAsignadoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    movimientos?: boolean | PresupuestoAsignado$movimientosArgs<ExtArgs>
    programa_pagos?: boolean | PresupuestoAsignado$programa_pagosArgs<ExtArgs>
    _count?: boolean | PresupuestoAsignadoCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type PresupuestoAsignadoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $PresupuestoAsignadoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PresupuestoAsignado"
    objects: {
      movimientos: Prisma.$MovimientoPresupuestalPayload<ExtArgs>[]
      programa_pagos: Prisma.$ProgramaPagosPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id_presupuesto: string
      tenant_id: string
      proyecto_id: string
      codigo: string
      descripcion: string
      monto_autorizado: Prisma.Decimal
      monto_ejercido: Prisma.Decimal
      monto_comprometido: Prisma.Decimal
      monto_disponible: Prisma.Decimal
      moneda: string
      capitulo: string
      estatus: string
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["presupuestoAsignado"]>
    composites: {}
  }

  type PresupuestoAsignadoGetPayload<S extends boolean | null | undefined | PresupuestoAsignadoDefaultArgs> = $Result.GetResult<Prisma.$PresupuestoAsignadoPayload, S>

  type PresupuestoAsignadoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PresupuestoAsignadoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PresupuestoAsignadoCountAggregateInputType | true
    }

  export interface PresupuestoAsignadoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PresupuestoAsignado'], meta: { name: 'PresupuestoAsignado' } }
    /**
     * Find zero or one PresupuestoAsignado that matches the filter.
     * @param {PresupuestoAsignadoFindUniqueArgs} args - Arguments to find a PresupuestoAsignado
     * @example
     * // Get one PresupuestoAsignado
     * const presupuestoAsignado = await prisma.presupuestoAsignado.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PresupuestoAsignadoFindUniqueArgs>(args: SelectSubset<T, PresupuestoAsignadoFindUniqueArgs<ExtArgs>>): Prisma__PresupuestoAsignadoClient<$Result.GetResult<Prisma.$PresupuestoAsignadoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one PresupuestoAsignado that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PresupuestoAsignadoFindUniqueOrThrowArgs} args - Arguments to find a PresupuestoAsignado
     * @example
     * // Get one PresupuestoAsignado
     * const presupuestoAsignado = await prisma.presupuestoAsignado.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PresupuestoAsignadoFindUniqueOrThrowArgs>(args: SelectSubset<T, PresupuestoAsignadoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PresupuestoAsignadoClient<$Result.GetResult<Prisma.$PresupuestoAsignadoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first PresupuestoAsignado that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PresupuestoAsignadoFindFirstArgs} args - Arguments to find a PresupuestoAsignado
     * @example
     * // Get one PresupuestoAsignado
     * const presupuestoAsignado = await prisma.presupuestoAsignado.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PresupuestoAsignadoFindFirstArgs>(args?: SelectSubset<T, PresupuestoAsignadoFindFirstArgs<ExtArgs>>): Prisma__PresupuestoAsignadoClient<$Result.GetResult<Prisma.$PresupuestoAsignadoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first PresupuestoAsignado that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PresupuestoAsignadoFindFirstOrThrowArgs} args - Arguments to find a PresupuestoAsignado
     * @example
     * // Get one PresupuestoAsignado
     * const presupuestoAsignado = await prisma.presupuestoAsignado.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PresupuestoAsignadoFindFirstOrThrowArgs>(args?: SelectSubset<T, PresupuestoAsignadoFindFirstOrThrowArgs<ExtArgs>>): Prisma__PresupuestoAsignadoClient<$Result.GetResult<Prisma.$PresupuestoAsignadoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more PresupuestoAsignados that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PresupuestoAsignadoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PresupuestoAsignados
     * const presupuestoAsignados = await prisma.presupuestoAsignado.findMany()
     * 
     * // Get first 10 PresupuestoAsignados
     * const presupuestoAsignados = await prisma.presupuestoAsignado.findMany({ take: 10 })
     * 
     * // Only select the `id_presupuesto`
     * const presupuestoAsignadoWithId_presupuestoOnly = await prisma.presupuestoAsignado.findMany({ select: { id_presupuesto: true } })
     * 
     */
    findMany<T extends PresupuestoAsignadoFindManyArgs>(args?: SelectSubset<T, PresupuestoAsignadoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PresupuestoAsignadoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a PresupuestoAsignado.
     * @param {PresupuestoAsignadoCreateArgs} args - Arguments to create a PresupuestoAsignado.
     * @example
     * // Create one PresupuestoAsignado
     * const PresupuestoAsignado = await prisma.presupuestoAsignado.create({
     *   data: {
     *     // ... data to create a PresupuestoAsignado
     *   }
     * })
     * 
     */
    create<T extends PresupuestoAsignadoCreateArgs>(args: SelectSubset<T, PresupuestoAsignadoCreateArgs<ExtArgs>>): Prisma__PresupuestoAsignadoClient<$Result.GetResult<Prisma.$PresupuestoAsignadoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many PresupuestoAsignados.
     * @param {PresupuestoAsignadoCreateManyArgs} args - Arguments to create many PresupuestoAsignados.
     * @example
     * // Create many PresupuestoAsignados
     * const presupuestoAsignado = await prisma.presupuestoAsignado.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PresupuestoAsignadoCreateManyArgs>(args?: SelectSubset<T, PresupuestoAsignadoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PresupuestoAsignados and returns the data saved in the database.
     * @param {PresupuestoAsignadoCreateManyAndReturnArgs} args - Arguments to create many PresupuestoAsignados.
     * @example
     * // Create many PresupuestoAsignados
     * const presupuestoAsignado = await prisma.presupuestoAsignado.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PresupuestoAsignados and only return the `id_presupuesto`
     * const presupuestoAsignadoWithId_presupuestoOnly = await prisma.presupuestoAsignado.createManyAndReturn({ 
     *   select: { id_presupuesto: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PresupuestoAsignadoCreateManyAndReturnArgs>(args?: SelectSubset<T, PresupuestoAsignadoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PresupuestoAsignadoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a PresupuestoAsignado.
     * @param {PresupuestoAsignadoDeleteArgs} args - Arguments to delete one PresupuestoAsignado.
     * @example
     * // Delete one PresupuestoAsignado
     * const PresupuestoAsignado = await prisma.presupuestoAsignado.delete({
     *   where: {
     *     // ... filter to delete one PresupuestoAsignado
     *   }
     * })
     * 
     */
    delete<T extends PresupuestoAsignadoDeleteArgs>(args: SelectSubset<T, PresupuestoAsignadoDeleteArgs<ExtArgs>>): Prisma__PresupuestoAsignadoClient<$Result.GetResult<Prisma.$PresupuestoAsignadoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one PresupuestoAsignado.
     * @param {PresupuestoAsignadoUpdateArgs} args - Arguments to update one PresupuestoAsignado.
     * @example
     * // Update one PresupuestoAsignado
     * const presupuestoAsignado = await prisma.presupuestoAsignado.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PresupuestoAsignadoUpdateArgs>(args: SelectSubset<T, PresupuestoAsignadoUpdateArgs<ExtArgs>>): Prisma__PresupuestoAsignadoClient<$Result.GetResult<Prisma.$PresupuestoAsignadoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more PresupuestoAsignados.
     * @param {PresupuestoAsignadoDeleteManyArgs} args - Arguments to filter PresupuestoAsignados to delete.
     * @example
     * // Delete a few PresupuestoAsignados
     * const { count } = await prisma.presupuestoAsignado.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PresupuestoAsignadoDeleteManyArgs>(args?: SelectSubset<T, PresupuestoAsignadoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PresupuestoAsignados.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PresupuestoAsignadoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PresupuestoAsignados
     * const presupuestoAsignado = await prisma.presupuestoAsignado.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PresupuestoAsignadoUpdateManyArgs>(args: SelectSubset<T, PresupuestoAsignadoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PresupuestoAsignado.
     * @param {PresupuestoAsignadoUpsertArgs} args - Arguments to update or create a PresupuestoAsignado.
     * @example
     * // Update or create a PresupuestoAsignado
     * const presupuestoAsignado = await prisma.presupuestoAsignado.upsert({
     *   create: {
     *     // ... data to create a PresupuestoAsignado
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PresupuestoAsignado we want to update
     *   }
     * })
     */
    upsert<T extends PresupuestoAsignadoUpsertArgs>(args: SelectSubset<T, PresupuestoAsignadoUpsertArgs<ExtArgs>>): Prisma__PresupuestoAsignadoClient<$Result.GetResult<Prisma.$PresupuestoAsignadoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of PresupuestoAsignados.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PresupuestoAsignadoCountArgs} args - Arguments to filter PresupuestoAsignados to count.
     * @example
     * // Count the number of PresupuestoAsignados
     * const count = await prisma.presupuestoAsignado.count({
     *   where: {
     *     // ... the filter for the PresupuestoAsignados we want to count
     *   }
     * })
    **/
    count<T extends PresupuestoAsignadoCountArgs>(
      args?: Subset<T, PresupuestoAsignadoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PresupuestoAsignadoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PresupuestoAsignado.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PresupuestoAsignadoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends PresupuestoAsignadoAggregateArgs>(args: Subset<T, PresupuestoAsignadoAggregateArgs>): Prisma.PrismaPromise<GetPresupuestoAsignadoAggregateType<T>>

    /**
     * Group by PresupuestoAsignado.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PresupuestoAsignadoGroupByArgs} args - Group by arguments.
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
      T extends PresupuestoAsignadoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PresupuestoAsignadoGroupByArgs['orderBy'] }
        : { orderBy?: PresupuestoAsignadoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, PresupuestoAsignadoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPresupuestoAsignadoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PresupuestoAsignado model
   */
  readonly fields: PresupuestoAsignadoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PresupuestoAsignado.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PresupuestoAsignadoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    movimientos<T extends PresupuestoAsignado$movimientosArgs<ExtArgs> = {}>(args?: Subset<T, PresupuestoAsignado$movimientosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MovimientoPresupuestalPayload<ExtArgs>, T, "findMany"> | Null>
    programa_pagos<T extends PresupuestoAsignado$programa_pagosArgs<ExtArgs> = {}>(args?: Subset<T, PresupuestoAsignado$programa_pagosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProgramaPagosPayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the PresupuestoAsignado model
   */ 
  interface PresupuestoAsignadoFieldRefs {
    readonly id_presupuesto: FieldRef<"PresupuestoAsignado", 'String'>
    readonly tenant_id: FieldRef<"PresupuestoAsignado", 'String'>
    readonly proyecto_id: FieldRef<"PresupuestoAsignado", 'String'>
    readonly codigo: FieldRef<"PresupuestoAsignado", 'String'>
    readonly descripcion: FieldRef<"PresupuestoAsignado", 'String'>
    readonly monto_autorizado: FieldRef<"PresupuestoAsignado", 'Decimal'>
    readonly monto_ejercido: FieldRef<"PresupuestoAsignado", 'Decimal'>
    readonly monto_comprometido: FieldRef<"PresupuestoAsignado", 'Decimal'>
    readonly monto_disponible: FieldRef<"PresupuestoAsignado", 'Decimal'>
    readonly moneda: FieldRef<"PresupuestoAsignado", 'String'>
    readonly capitulo: FieldRef<"PresupuestoAsignado", 'String'>
    readonly estatus: FieldRef<"PresupuestoAsignado", 'String'>
    readonly created_at: FieldRef<"PresupuestoAsignado", 'DateTime'>
    readonly updated_at: FieldRef<"PresupuestoAsignado", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PresupuestoAsignado findUnique
   */
  export type PresupuestoAsignadoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PresupuestoAsignado
     */
    select?: PresupuestoAsignadoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PresupuestoAsignadoInclude<ExtArgs> | null
    /**
     * Filter, which PresupuestoAsignado to fetch.
     */
    where: PresupuestoAsignadoWhereUniqueInput
  }

  /**
   * PresupuestoAsignado findUniqueOrThrow
   */
  export type PresupuestoAsignadoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PresupuestoAsignado
     */
    select?: PresupuestoAsignadoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PresupuestoAsignadoInclude<ExtArgs> | null
    /**
     * Filter, which PresupuestoAsignado to fetch.
     */
    where: PresupuestoAsignadoWhereUniqueInput
  }

  /**
   * PresupuestoAsignado findFirst
   */
  export type PresupuestoAsignadoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PresupuestoAsignado
     */
    select?: PresupuestoAsignadoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PresupuestoAsignadoInclude<ExtArgs> | null
    /**
     * Filter, which PresupuestoAsignado to fetch.
     */
    where?: PresupuestoAsignadoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PresupuestoAsignados to fetch.
     */
    orderBy?: PresupuestoAsignadoOrderByWithRelationInput | PresupuestoAsignadoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PresupuestoAsignados.
     */
    cursor?: PresupuestoAsignadoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PresupuestoAsignados from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PresupuestoAsignados.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PresupuestoAsignados.
     */
    distinct?: PresupuestoAsignadoScalarFieldEnum | PresupuestoAsignadoScalarFieldEnum[]
  }

  /**
   * PresupuestoAsignado findFirstOrThrow
   */
  export type PresupuestoAsignadoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PresupuestoAsignado
     */
    select?: PresupuestoAsignadoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PresupuestoAsignadoInclude<ExtArgs> | null
    /**
     * Filter, which PresupuestoAsignado to fetch.
     */
    where?: PresupuestoAsignadoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PresupuestoAsignados to fetch.
     */
    orderBy?: PresupuestoAsignadoOrderByWithRelationInput | PresupuestoAsignadoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PresupuestoAsignados.
     */
    cursor?: PresupuestoAsignadoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PresupuestoAsignados from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PresupuestoAsignados.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PresupuestoAsignados.
     */
    distinct?: PresupuestoAsignadoScalarFieldEnum | PresupuestoAsignadoScalarFieldEnum[]
  }

  /**
   * PresupuestoAsignado findMany
   */
  export type PresupuestoAsignadoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PresupuestoAsignado
     */
    select?: PresupuestoAsignadoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PresupuestoAsignadoInclude<ExtArgs> | null
    /**
     * Filter, which PresupuestoAsignados to fetch.
     */
    where?: PresupuestoAsignadoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PresupuestoAsignados to fetch.
     */
    orderBy?: PresupuestoAsignadoOrderByWithRelationInput | PresupuestoAsignadoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PresupuestoAsignados.
     */
    cursor?: PresupuestoAsignadoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PresupuestoAsignados from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PresupuestoAsignados.
     */
    skip?: number
    distinct?: PresupuestoAsignadoScalarFieldEnum | PresupuestoAsignadoScalarFieldEnum[]
  }

  /**
   * PresupuestoAsignado create
   */
  export type PresupuestoAsignadoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PresupuestoAsignado
     */
    select?: PresupuestoAsignadoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PresupuestoAsignadoInclude<ExtArgs> | null
    /**
     * The data needed to create a PresupuestoAsignado.
     */
    data: XOR<PresupuestoAsignadoCreateInput, PresupuestoAsignadoUncheckedCreateInput>
  }

  /**
   * PresupuestoAsignado createMany
   */
  export type PresupuestoAsignadoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PresupuestoAsignados.
     */
    data: PresupuestoAsignadoCreateManyInput | PresupuestoAsignadoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PresupuestoAsignado createManyAndReturn
   */
  export type PresupuestoAsignadoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PresupuestoAsignado
     */
    select?: PresupuestoAsignadoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many PresupuestoAsignados.
     */
    data: PresupuestoAsignadoCreateManyInput | PresupuestoAsignadoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PresupuestoAsignado update
   */
  export type PresupuestoAsignadoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PresupuestoAsignado
     */
    select?: PresupuestoAsignadoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PresupuestoAsignadoInclude<ExtArgs> | null
    /**
     * The data needed to update a PresupuestoAsignado.
     */
    data: XOR<PresupuestoAsignadoUpdateInput, PresupuestoAsignadoUncheckedUpdateInput>
    /**
     * Choose, which PresupuestoAsignado to update.
     */
    where: PresupuestoAsignadoWhereUniqueInput
  }

  /**
   * PresupuestoAsignado updateMany
   */
  export type PresupuestoAsignadoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PresupuestoAsignados.
     */
    data: XOR<PresupuestoAsignadoUpdateManyMutationInput, PresupuestoAsignadoUncheckedUpdateManyInput>
    /**
     * Filter which PresupuestoAsignados to update
     */
    where?: PresupuestoAsignadoWhereInput
  }

  /**
   * PresupuestoAsignado upsert
   */
  export type PresupuestoAsignadoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PresupuestoAsignado
     */
    select?: PresupuestoAsignadoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PresupuestoAsignadoInclude<ExtArgs> | null
    /**
     * The filter to search for the PresupuestoAsignado to update in case it exists.
     */
    where: PresupuestoAsignadoWhereUniqueInput
    /**
     * In case the PresupuestoAsignado found by the `where` argument doesn't exist, create a new PresupuestoAsignado with this data.
     */
    create: XOR<PresupuestoAsignadoCreateInput, PresupuestoAsignadoUncheckedCreateInput>
    /**
     * In case the PresupuestoAsignado was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PresupuestoAsignadoUpdateInput, PresupuestoAsignadoUncheckedUpdateInput>
  }

  /**
   * PresupuestoAsignado delete
   */
  export type PresupuestoAsignadoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PresupuestoAsignado
     */
    select?: PresupuestoAsignadoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PresupuestoAsignadoInclude<ExtArgs> | null
    /**
     * Filter which PresupuestoAsignado to delete.
     */
    where: PresupuestoAsignadoWhereUniqueInput
  }

  /**
   * PresupuestoAsignado deleteMany
   */
  export type PresupuestoAsignadoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PresupuestoAsignados to delete
     */
    where?: PresupuestoAsignadoWhereInput
  }

  /**
   * PresupuestoAsignado.movimientos
   */
  export type PresupuestoAsignado$movimientosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MovimientoPresupuestal
     */
    select?: MovimientoPresupuestalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MovimientoPresupuestalInclude<ExtArgs> | null
    where?: MovimientoPresupuestalWhereInput
    orderBy?: MovimientoPresupuestalOrderByWithRelationInput | MovimientoPresupuestalOrderByWithRelationInput[]
    cursor?: MovimientoPresupuestalWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MovimientoPresupuestalScalarFieldEnum | MovimientoPresupuestalScalarFieldEnum[]
  }

  /**
   * PresupuestoAsignado.programa_pagos
   */
  export type PresupuestoAsignado$programa_pagosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProgramaPagos
     */
    select?: ProgramaPagosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProgramaPagosInclude<ExtArgs> | null
    where?: ProgramaPagosWhereInput
    orderBy?: ProgramaPagosOrderByWithRelationInput | ProgramaPagosOrderByWithRelationInput[]
    cursor?: ProgramaPagosWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ProgramaPagosScalarFieldEnum | ProgramaPagosScalarFieldEnum[]
  }

  /**
   * PresupuestoAsignado without action
   */
  export type PresupuestoAsignadoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PresupuestoAsignado
     */
    select?: PresupuestoAsignadoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PresupuestoAsignadoInclude<ExtArgs> | null
  }


  /**
   * Model MovimientoPresupuestal
   */

  export type AggregateMovimientoPresupuestal = {
    _count: MovimientoPresupuestalCountAggregateOutputType | null
    _avg: MovimientoPresupuestalAvgAggregateOutputType | null
    _sum: MovimientoPresupuestalSumAggregateOutputType | null
    _min: MovimientoPresupuestalMinAggregateOutputType | null
    _max: MovimientoPresupuestalMaxAggregateOutputType | null
  }

  export type MovimientoPresupuestalAvgAggregateOutputType = {
    monto: Decimal | null
  }

  export type MovimientoPresupuestalSumAggregateOutputType = {
    monto: Decimal | null
  }

  export type MovimientoPresupuestalMinAggregateOutputType = {
    id_movimiento: string | null
    tenant_id: string | null
    proyecto_id: string | null
    presupuesto_id: string | null
    tipo: string | null
    concepto: string | null
    monto: Decimal | null
    moneda: string | null
    referencia_modulo: string | null
    referencia_entidad: string | null
    referencia_id: string | null
    referencia_codigo: string | null
    usuario_id: string | null
    fecha_registro: Date | null
    notas: string | null
  }

  export type MovimientoPresupuestalMaxAggregateOutputType = {
    id_movimiento: string | null
    tenant_id: string | null
    proyecto_id: string | null
    presupuesto_id: string | null
    tipo: string | null
    concepto: string | null
    monto: Decimal | null
    moneda: string | null
    referencia_modulo: string | null
    referencia_entidad: string | null
    referencia_id: string | null
    referencia_codigo: string | null
    usuario_id: string | null
    fecha_registro: Date | null
    notas: string | null
  }

  export type MovimientoPresupuestalCountAggregateOutputType = {
    id_movimiento: number
    tenant_id: number
    proyecto_id: number
    presupuesto_id: number
    tipo: number
    concepto: number
    monto: number
    moneda: number
    referencia_modulo: number
    referencia_entidad: number
    referencia_id: number
    referencia_codigo: number
    usuario_id: number
    fecha_registro: number
    notas: number
    _all: number
  }


  export type MovimientoPresupuestalAvgAggregateInputType = {
    monto?: true
  }

  export type MovimientoPresupuestalSumAggregateInputType = {
    monto?: true
  }

  export type MovimientoPresupuestalMinAggregateInputType = {
    id_movimiento?: true
    tenant_id?: true
    proyecto_id?: true
    presupuesto_id?: true
    tipo?: true
    concepto?: true
    monto?: true
    moneda?: true
    referencia_modulo?: true
    referencia_entidad?: true
    referencia_id?: true
    referencia_codigo?: true
    usuario_id?: true
    fecha_registro?: true
    notas?: true
  }

  export type MovimientoPresupuestalMaxAggregateInputType = {
    id_movimiento?: true
    tenant_id?: true
    proyecto_id?: true
    presupuesto_id?: true
    tipo?: true
    concepto?: true
    monto?: true
    moneda?: true
    referencia_modulo?: true
    referencia_entidad?: true
    referencia_id?: true
    referencia_codigo?: true
    usuario_id?: true
    fecha_registro?: true
    notas?: true
  }

  export type MovimientoPresupuestalCountAggregateInputType = {
    id_movimiento?: true
    tenant_id?: true
    proyecto_id?: true
    presupuesto_id?: true
    tipo?: true
    concepto?: true
    monto?: true
    moneda?: true
    referencia_modulo?: true
    referencia_entidad?: true
    referencia_id?: true
    referencia_codigo?: true
    usuario_id?: true
    fecha_registro?: true
    notas?: true
    _all?: true
  }

  export type MovimientoPresupuestalAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MovimientoPresupuestal to aggregate.
     */
    where?: MovimientoPresupuestalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MovimientoPresupuestals to fetch.
     */
    orderBy?: MovimientoPresupuestalOrderByWithRelationInput | MovimientoPresupuestalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MovimientoPresupuestalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MovimientoPresupuestals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MovimientoPresupuestals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MovimientoPresupuestals
    **/
    _count?: true | MovimientoPresupuestalCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: MovimientoPresupuestalAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: MovimientoPresupuestalSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MovimientoPresupuestalMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MovimientoPresupuestalMaxAggregateInputType
  }

  export type GetMovimientoPresupuestalAggregateType<T extends MovimientoPresupuestalAggregateArgs> = {
        [P in keyof T & keyof AggregateMovimientoPresupuestal]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMovimientoPresupuestal[P]>
      : GetScalarType<T[P], AggregateMovimientoPresupuestal[P]>
  }




  export type MovimientoPresupuestalGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MovimientoPresupuestalWhereInput
    orderBy?: MovimientoPresupuestalOrderByWithAggregationInput | MovimientoPresupuestalOrderByWithAggregationInput[]
    by: MovimientoPresupuestalScalarFieldEnum[] | MovimientoPresupuestalScalarFieldEnum
    having?: MovimientoPresupuestalScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MovimientoPresupuestalCountAggregateInputType | true
    _avg?: MovimientoPresupuestalAvgAggregateInputType
    _sum?: MovimientoPresupuestalSumAggregateInputType
    _min?: MovimientoPresupuestalMinAggregateInputType
    _max?: MovimientoPresupuestalMaxAggregateInputType
  }

  export type MovimientoPresupuestalGroupByOutputType = {
    id_movimiento: string
    tenant_id: string
    proyecto_id: string
    presupuesto_id: string
    tipo: string
    concepto: string
    monto: Decimal
    moneda: string
    referencia_modulo: string | null
    referencia_entidad: string | null
    referencia_id: string | null
    referencia_codigo: string | null
    usuario_id: string
    fecha_registro: Date
    notas: string | null
    _count: MovimientoPresupuestalCountAggregateOutputType | null
    _avg: MovimientoPresupuestalAvgAggregateOutputType | null
    _sum: MovimientoPresupuestalSumAggregateOutputType | null
    _min: MovimientoPresupuestalMinAggregateOutputType | null
    _max: MovimientoPresupuestalMaxAggregateOutputType | null
  }

  type GetMovimientoPresupuestalGroupByPayload<T extends MovimientoPresupuestalGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MovimientoPresupuestalGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MovimientoPresupuestalGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MovimientoPresupuestalGroupByOutputType[P]>
            : GetScalarType<T[P], MovimientoPresupuestalGroupByOutputType[P]>
        }
      >
    >


  export type MovimientoPresupuestalSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_movimiento?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    presupuesto_id?: boolean
    tipo?: boolean
    concepto?: boolean
    monto?: boolean
    moneda?: boolean
    referencia_modulo?: boolean
    referencia_entidad?: boolean
    referencia_id?: boolean
    referencia_codigo?: boolean
    usuario_id?: boolean
    fecha_registro?: boolean
    notas?: boolean
    presupuesto?: boolean | PresupuestoAsignadoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["movimientoPresupuestal"]>

  export type MovimientoPresupuestalSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_movimiento?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    presupuesto_id?: boolean
    tipo?: boolean
    concepto?: boolean
    monto?: boolean
    moneda?: boolean
    referencia_modulo?: boolean
    referencia_entidad?: boolean
    referencia_id?: boolean
    referencia_codigo?: boolean
    usuario_id?: boolean
    fecha_registro?: boolean
    notas?: boolean
    presupuesto?: boolean | PresupuestoAsignadoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["movimientoPresupuestal"]>

  export type MovimientoPresupuestalSelectScalar = {
    id_movimiento?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    presupuesto_id?: boolean
    tipo?: boolean
    concepto?: boolean
    monto?: boolean
    moneda?: boolean
    referencia_modulo?: boolean
    referencia_entidad?: boolean
    referencia_id?: boolean
    referencia_codigo?: boolean
    usuario_id?: boolean
    fecha_registro?: boolean
    notas?: boolean
  }

  export type MovimientoPresupuestalInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    presupuesto?: boolean | PresupuestoAsignadoDefaultArgs<ExtArgs>
  }
  export type MovimientoPresupuestalIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    presupuesto?: boolean | PresupuestoAsignadoDefaultArgs<ExtArgs>
  }

  export type $MovimientoPresupuestalPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MovimientoPresupuestal"
    objects: {
      presupuesto: Prisma.$PresupuestoAsignadoPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id_movimiento: string
      tenant_id: string
      proyecto_id: string
      presupuesto_id: string
      tipo: string
      concepto: string
      monto: Prisma.Decimal
      moneda: string
      referencia_modulo: string | null
      referencia_entidad: string | null
      referencia_id: string | null
      referencia_codigo: string | null
      usuario_id: string
      fecha_registro: Date
      notas: string | null
    }, ExtArgs["result"]["movimientoPresupuestal"]>
    composites: {}
  }

  type MovimientoPresupuestalGetPayload<S extends boolean | null | undefined | MovimientoPresupuestalDefaultArgs> = $Result.GetResult<Prisma.$MovimientoPresupuestalPayload, S>

  type MovimientoPresupuestalCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<MovimientoPresupuestalFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: MovimientoPresupuestalCountAggregateInputType | true
    }

  export interface MovimientoPresupuestalDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MovimientoPresupuestal'], meta: { name: 'MovimientoPresupuestal' } }
    /**
     * Find zero or one MovimientoPresupuestal that matches the filter.
     * @param {MovimientoPresupuestalFindUniqueArgs} args - Arguments to find a MovimientoPresupuestal
     * @example
     * // Get one MovimientoPresupuestal
     * const movimientoPresupuestal = await prisma.movimientoPresupuestal.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MovimientoPresupuestalFindUniqueArgs>(args: SelectSubset<T, MovimientoPresupuestalFindUniqueArgs<ExtArgs>>): Prisma__MovimientoPresupuestalClient<$Result.GetResult<Prisma.$MovimientoPresupuestalPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one MovimientoPresupuestal that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {MovimientoPresupuestalFindUniqueOrThrowArgs} args - Arguments to find a MovimientoPresupuestal
     * @example
     * // Get one MovimientoPresupuestal
     * const movimientoPresupuestal = await prisma.movimientoPresupuestal.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MovimientoPresupuestalFindUniqueOrThrowArgs>(args: SelectSubset<T, MovimientoPresupuestalFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MovimientoPresupuestalClient<$Result.GetResult<Prisma.$MovimientoPresupuestalPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first MovimientoPresupuestal that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MovimientoPresupuestalFindFirstArgs} args - Arguments to find a MovimientoPresupuestal
     * @example
     * // Get one MovimientoPresupuestal
     * const movimientoPresupuestal = await prisma.movimientoPresupuestal.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MovimientoPresupuestalFindFirstArgs>(args?: SelectSubset<T, MovimientoPresupuestalFindFirstArgs<ExtArgs>>): Prisma__MovimientoPresupuestalClient<$Result.GetResult<Prisma.$MovimientoPresupuestalPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first MovimientoPresupuestal that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MovimientoPresupuestalFindFirstOrThrowArgs} args - Arguments to find a MovimientoPresupuestal
     * @example
     * // Get one MovimientoPresupuestal
     * const movimientoPresupuestal = await prisma.movimientoPresupuestal.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MovimientoPresupuestalFindFirstOrThrowArgs>(args?: SelectSubset<T, MovimientoPresupuestalFindFirstOrThrowArgs<ExtArgs>>): Prisma__MovimientoPresupuestalClient<$Result.GetResult<Prisma.$MovimientoPresupuestalPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more MovimientoPresupuestals that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MovimientoPresupuestalFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MovimientoPresupuestals
     * const movimientoPresupuestals = await prisma.movimientoPresupuestal.findMany()
     * 
     * // Get first 10 MovimientoPresupuestals
     * const movimientoPresupuestals = await prisma.movimientoPresupuestal.findMany({ take: 10 })
     * 
     * // Only select the `id_movimiento`
     * const movimientoPresupuestalWithId_movimientoOnly = await prisma.movimientoPresupuestal.findMany({ select: { id_movimiento: true } })
     * 
     */
    findMany<T extends MovimientoPresupuestalFindManyArgs>(args?: SelectSubset<T, MovimientoPresupuestalFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MovimientoPresupuestalPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a MovimientoPresupuestal.
     * @param {MovimientoPresupuestalCreateArgs} args - Arguments to create a MovimientoPresupuestal.
     * @example
     * // Create one MovimientoPresupuestal
     * const MovimientoPresupuestal = await prisma.movimientoPresupuestal.create({
     *   data: {
     *     // ... data to create a MovimientoPresupuestal
     *   }
     * })
     * 
     */
    create<T extends MovimientoPresupuestalCreateArgs>(args: SelectSubset<T, MovimientoPresupuestalCreateArgs<ExtArgs>>): Prisma__MovimientoPresupuestalClient<$Result.GetResult<Prisma.$MovimientoPresupuestalPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many MovimientoPresupuestals.
     * @param {MovimientoPresupuestalCreateManyArgs} args - Arguments to create many MovimientoPresupuestals.
     * @example
     * // Create many MovimientoPresupuestals
     * const movimientoPresupuestal = await prisma.movimientoPresupuestal.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MovimientoPresupuestalCreateManyArgs>(args?: SelectSubset<T, MovimientoPresupuestalCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MovimientoPresupuestals and returns the data saved in the database.
     * @param {MovimientoPresupuestalCreateManyAndReturnArgs} args - Arguments to create many MovimientoPresupuestals.
     * @example
     * // Create many MovimientoPresupuestals
     * const movimientoPresupuestal = await prisma.movimientoPresupuestal.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MovimientoPresupuestals and only return the `id_movimiento`
     * const movimientoPresupuestalWithId_movimientoOnly = await prisma.movimientoPresupuestal.createManyAndReturn({ 
     *   select: { id_movimiento: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MovimientoPresupuestalCreateManyAndReturnArgs>(args?: SelectSubset<T, MovimientoPresupuestalCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MovimientoPresupuestalPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a MovimientoPresupuestal.
     * @param {MovimientoPresupuestalDeleteArgs} args - Arguments to delete one MovimientoPresupuestal.
     * @example
     * // Delete one MovimientoPresupuestal
     * const MovimientoPresupuestal = await prisma.movimientoPresupuestal.delete({
     *   where: {
     *     // ... filter to delete one MovimientoPresupuestal
     *   }
     * })
     * 
     */
    delete<T extends MovimientoPresupuestalDeleteArgs>(args: SelectSubset<T, MovimientoPresupuestalDeleteArgs<ExtArgs>>): Prisma__MovimientoPresupuestalClient<$Result.GetResult<Prisma.$MovimientoPresupuestalPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one MovimientoPresupuestal.
     * @param {MovimientoPresupuestalUpdateArgs} args - Arguments to update one MovimientoPresupuestal.
     * @example
     * // Update one MovimientoPresupuestal
     * const movimientoPresupuestal = await prisma.movimientoPresupuestal.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MovimientoPresupuestalUpdateArgs>(args: SelectSubset<T, MovimientoPresupuestalUpdateArgs<ExtArgs>>): Prisma__MovimientoPresupuestalClient<$Result.GetResult<Prisma.$MovimientoPresupuestalPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more MovimientoPresupuestals.
     * @param {MovimientoPresupuestalDeleteManyArgs} args - Arguments to filter MovimientoPresupuestals to delete.
     * @example
     * // Delete a few MovimientoPresupuestals
     * const { count } = await prisma.movimientoPresupuestal.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MovimientoPresupuestalDeleteManyArgs>(args?: SelectSubset<T, MovimientoPresupuestalDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MovimientoPresupuestals.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MovimientoPresupuestalUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MovimientoPresupuestals
     * const movimientoPresupuestal = await prisma.movimientoPresupuestal.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MovimientoPresupuestalUpdateManyArgs>(args: SelectSubset<T, MovimientoPresupuestalUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one MovimientoPresupuestal.
     * @param {MovimientoPresupuestalUpsertArgs} args - Arguments to update or create a MovimientoPresupuestal.
     * @example
     * // Update or create a MovimientoPresupuestal
     * const movimientoPresupuestal = await prisma.movimientoPresupuestal.upsert({
     *   create: {
     *     // ... data to create a MovimientoPresupuestal
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MovimientoPresupuestal we want to update
     *   }
     * })
     */
    upsert<T extends MovimientoPresupuestalUpsertArgs>(args: SelectSubset<T, MovimientoPresupuestalUpsertArgs<ExtArgs>>): Prisma__MovimientoPresupuestalClient<$Result.GetResult<Prisma.$MovimientoPresupuestalPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of MovimientoPresupuestals.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MovimientoPresupuestalCountArgs} args - Arguments to filter MovimientoPresupuestals to count.
     * @example
     * // Count the number of MovimientoPresupuestals
     * const count = await prisma.movimientoPresupuestal.count({
     *   where: {
     *     // ... the filter for the MovimientoPresupuestals we want to count
     *   }
     * })
    **/
    count<T extends MovimientoPresupuestalCountArgs>(
      args?: Subset<T, MovimientoPresupuestalCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MovimientoPresupuestalCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MovimientoPresupuestal.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MovimientoPresupuestalAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends MovimientoPresupuestalAggregateArgs>(args: Subset<T, MovimientoPresupuestalAggregateArgs>): Prisma.PrismaPromise<GetMovimientoPresupuestalAggregateType<T>>

    /**
     * Group by MovimientoPresupuestal.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MovimientoPresupuestalGroupByArgs} args - Group by arguments.
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
      T extends MovimientoPresupuestalGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MovimientoPresupuestalGroupByArgs['orderBy'] }
        : { orderBy?: MovimientoPresupuestalGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, MovimientoPresupuestalGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMovimientoPresupuestalGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MovimientoPresupuestal model
   */
  readonly fields: MovimientoPresupuestalFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MovimientoPresupuestal.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MovimientoPresupuestalClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    presupuesto<T extends PresupuestoAsignadoDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PresupuestoAsignadoDefaultArgs<ExtArgs>>): Prisma__PresupuestoAsignadoClient<$Result.GetResult<Prisma.$PresupuestoAsignadoPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
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
   * Fields of the MovimientoPresupuestal model
   */ 
  interface MovimientoPresupuestalFieldRefs {
    readonly id_movimiento: FieldRef<"MovimientoPresupuestal", 'String'>
    readonly tenant_id: FieldRef<"MovimientoPresupuestal", 'String'>
    readonly proyecto_id: FieldRef<"MovimientoPresupuestal", 'String'>
    readonly presupuesto_id: FieldRef<"MovimientoPresupuestal", 'String'>
    readonly tipo: FieldRef<"MovimientoPresupuestal", 'String'>
    readonly concepto: FieldRef<"MovimientoPresupuestal", 'String'>
    readonly monto: FieldRef<"MovimientoPresupuestal", 'Decimal'>
    readonly moneda: FieldRef<"MovimientoPresupuestal", 'String'>
    readonly referencia_modulo: FieldRef<"MovimientoPresupuestal", 'String'>
    readonly referencia_entidad: FieldRef<"MovimientoPresupuestal", 'String'>
    readonly referencia_id: FieldRef<"MovimientoPresupuestal", 'String'>
    readonly referencia_codigo: FieldRef<"MovimientoPresupuestal", 'String'>
    readonly usuario_id: FieldRef<"MovimientoPresupuestal", 'String'>
    readonly fecha_registro: FieldRef<"MovimientoPresupuestal", 'DateTime'>
    readonly notas: FieldRef<"MovimientoPresupuestal", 'String'>
  }
    

  // Custom InputTypes
  /**
   * MovimientoPresupuestal findUnique
   */
  export type MovimientoPresupuestalFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MovimientoPresupuestal
     */
    select?: MovimientoPresupuestalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MovimientoPresupuestalInclude<ExtArgs> | null
    /**
     * Filter, which MovimientoPresupuestal to fetch.
     */
    where: MovimientoPresupuestalWhereUniqueInput
  }

  /**
   * MovimientoPresupuestal findUniqueOrThrow
   */
  export type MovimientoPresupuestalFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MovimientoPresupuestal
     */
    select?: MovimientoPresupuestalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MovimientoPresupuestalInclude<ExtArgs> | null
    /**
     * Filter, which MovimientoPresupuestal to fetch.
     */
    where: MovimientoPresupuestalWhereUniqueInput
  }

  /**
   * MovimientoPresupuestal findFirst
   */
  export type MovimientoPresupuestalFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MovimientoPresupuestal
     */
    select?: MovimientoPresupuestalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MovimientoPresupuestalInclude<ExtArgs> | null
    /**
     * Filter, which MovimientoPresupuestal to fetch.
     */
    where?: MovimientoPresupuestalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MovimientoPresupuestals to fetch.
     */
    orderBy?: MovimientoPresupuestalOrderByWithRelationInput | MovimientoPresupuestalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MovimientoPresupuestals.
     */
    cursor?: MovimientoPresupuestalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MovimientoPresupuestals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MovimientoPresupuestals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MovimientoPresupuestals.
     */
    distinct?: MovimientoPresupuestalScalarFieldEnum | MovimientoPresupuestalScalarFieldEnum[]
  }

  /**
   * MovimientoPresupuestal findFirstOrThrow
   */
  export type MovimientoPresupuestalFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MovimientoPresupuestal
     */
    select?: MovimientoPresupuestalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MovimientoPresupuestalInclude<ExtArgs> | null
    /**
     * Filter, which MovimientoPresupuestal to fetch.
     */
    where?: MovimientoPresupuestalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MovimientoPresupuestals to fetch.
     */
    orderBy?: MovimientoPresupuestalOrderByWithRelationInput | MovimientoPresupuestalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MovimientoPresupuestals.
     */
    cursor?: MovimientoPresupuestalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MovimientoPresupuestals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MovimientoPresupuestals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MovimientoPresupuestals.
     */
    distinct?: MovimientoPresupuestalScalarFieldEnum | MovimientoPresupuestalScalarFieldEnum[]
  }

  /**
   * MovimientoPresupuestal findMany
   */
  export type MovimientoPresupuestalFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MovimientoPresupuestal
     */
    select?: MovimientoPresupuestalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MovimientoPresupuestalInclude<ExtArgs> | null
    /**
     * Filter, which MovimientoPresupuestals to fetch.
     */
    where?: MovimientoPresupuestalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MovimientoPresupuestals to fetch.
     */
    orderBy?: MovimientoPresupuestalOrderByWithRelationInput | MovimientoPresupuestalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MovimientoPresupuestals.
     */
    cursor?: MovimientoPresupuestalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MovimientoPresupuestals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MovimientoPresupuestals.
     */
    skip?: number
    distinct?: MovimientoPresupuestalScalarFieldEnum | MovimientoPresupuestalScalarFieldEnum[]
  }

  /**
   * MovimientoPresupuestal create
   */
  export type MovimientoPresupuestalCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MovimientoPresupuestal
     */
    select?: MovimientoPresupuestalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MovimientoPresupuestalInclude<ExtArgs> | null
    /**
     * The data needed to create a MovimientoPresupuestal.
     */
    data: XOR<MovimientoPresupuestalCreateInput, MovimientoPresupuestalUncheckedCreateInput>
  }

  /**
   * MovimientoPresupuestal createMany
   */
  export type MovimientoPresupuestalCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MovimientoPresupuestals.
     */
    data: MovimientoPresupuestalCreateManyInput | MovimientoPresupuestalCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MovimientoPresupuestal createManyAndReturn
   */
  export type MovimientoPresupuestalCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MovimientoPresupuestal
     */
    select?: MovimientoPresupuestalSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many MovimientoPresupuestals.
     */
    data: MovimientoPresupuestalCreateManyInput | MovimientoPresupuestalCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MovimientoPresupuestalIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * MovimientoPresupuestal update
   */
  export type MovimientoPresupuestalUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MovimientoPresupuestal
     */
    select?: MovimientoPresupuestalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MovimientoPresupuestalInclude<ExtArgs> | null
    /**
     * The data needed to update a MovimientoPresupuestal.
     */
    data: XOR<MovimientoPresupuestalUpdateInput, MovimientoPresupuestalUncheckedUpdateInput>
    /**
     * Choose, which MovimientoPresupuestal to update.
     */
    where: MovimientoPresupuestalWhereUniqueInput
  }

  /**
   * MovimientoPresupuestal updateMany
   */
  export type MovimientoPresupuestalUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MovimientoPresupuestals.
     */
    data: XOR<MovimientoPresupuestalUpdateManyMutationInput, MovimientoPresupuestalUncheckedUpdateManyInput>
    /**
     * Filter which MovimientoPresupuestals to update
     */
    where?: MovimientoPresupuestalWhereInput
  }

  /**
   * MovimientoPresupuestal upsert
   */
  export type MovimientoPresupuestalUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MovimientoPresupuestal
     */
    select?: MovimientoPresupuestalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MovimientoPresupuestalInclude<ExtArgs> | null
    /**
     * The filter to search for the MovimientoPresupuestal to update in case it exists.
     */
    where: MovimientoPresupuestalWhereUniqueInput
    /**
     * In case the MovimientoPresupuestal found by the `where` argument doesn't exist, create a new MovimientoPresupuestal with this data.
     */
    create: XOR<MovimientoPresupuestalCreateInput, MovimientoPresupuestalUncheckedCreateInput>
    /**
     * In case the MovimientoPresupuestal was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MovimientoPresupuestalUpdateInput, MovimientoPresupuestalUncheckedUpdateInput>
  }

  /**
   * MovimientoPresupuestal delete
   */
  export type MovimientoPresupuestalDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MovimientoPresupuestal
     */
    select?: MovimientoPresupuestalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MovimientoPresupuestalInclude<ExtArgs> | null
    /**
     * Filter which MovimientoPresupuestal to delete.
     */
    where: MovimientoPresupuestalWhereUniqueInput
  }

  /**
   * MovimientoPresupuestal deleteMany
   */
  export type MovimientoPresupuestalDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MovimientoPresupuestals to delete
     */
    where?: MovimientoPresupuestalWhereInput
  }

  /**
   * MovimientoPresupuestal without action
   */
  export type MovimientoPresupuestalDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MovimientoPresupuestal
     */
    select?: MovimientoPresupuestalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MovimientoPresupuestalInclude<ExtArgs> | null
  }


  /**
   * Model ProgramaPagos
   */

  export type AggregateProgramaPagos = {
    _count: ProgramaPagosCountAggregateOutputType | null
    _avg: ProgramaPagosAvgAggregateOutputType | null
    _sum: ProgramaPagosSumAggregateOutputType | null
    _min: ProgramaPagosMinAggregateOutputType | null
    _max: ProgramaPagosMaxAggregateOutputType | null
  }

  export type ProgramaPagosAvgAggregateOutputType = {
    monto_programado: Decimal | null
    monto_pagado: Decimal | null
  }

  export type ProgramaPagosSumAggregateOutputType = {
    monto_programado: Decimal | null
    monto_pagado: Decimal | null
  }

  export type ProgramaPagosMinAggregateOutputType = {
    id_pago: string | null
    tenant_id: string | null
    proyecto_id: string | null
    presupuesto_id: string | null
    concepto: string | null
    beneficiario: string | null
    beneficiario_id: string | null
    monto_programado: Decimal | null
    monto_pagado: Decimal | null
    moneda: string | null
    fecha_programada: Date | null
    fecha_pago_real: Date | null
    estado: string | null
    referencia_modulo: string | null
    referencia_entidad: string | null
    referencia_id: string | null
    metodo_pago: string | null
    banco: string | null
    referencia_bancaria: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type ProgramaPagosMaxAggregateOutputType = {
    id_pago: string | null
    tenant_id: string | null
    proyecto_id: string | null
    presupuesto_id: string | null
    concepto: string | null
    beneficiario: string | null
    beneficiario_id: string | null
    monto_programado: Decimal | null
    monto_pagado: Decimal | null
    moneda: string | null
    fecha_programada: Date | null
    fecha_pago_real: Date | null
    estado: string | null
    referencia_modulo: string | null
    referencia_entidad: string | null
    referencia_id: string | null
    metodo_pago: string | null
    banco: string | null
    referencia_bancaria: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type ProgramaPagosCountAggregateOutputType = {
    id_pago: number
    tenant_id: number
    proyecto_id: number
    presupuesto_id: number
    concepto: number
    beneficiario: number
    beneficiario_id: number
    monto_programado: number
    monto_pagado: number
    moneda: number
    fecha_programada: number
    fecha_pago_real: number
    estado: number
    referencia_modulo: number
    referencia_entidad: number
    referencia_id: number
    metodo_pago: number
    banco: number
    referencia_bancaria: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type ProgramaPagosAvgAggregateInputType = {
    monto_programado?: true
    monto_pagado?: true
  }

  export type ProgramaPagosSumAggregateInputType = {
    monto_programado?: true
    monto_pagado?: true
  }

  export type ProgramaPagosMinAggregateInputType = {
    id_pago?: true
    tenant_id?: true
    proyecto_id?: true
    presupuesto_id?: true
    concepto?: true
    beneficiario?: true
    beneficiario_id?: true
    monto_programado?: true
    monto_pagado?: true
    moneda?: true
    fecha_programada?: true
    fecha_pago_real?: true
    estado?: true
    referencia_modulo?: true
    referencia_entidad?: true
    referencia_id?: true
    metodo_pago?: true
    banco?: true
    referencia_bancaria?: true
    created_at?: true
    updated_at?: true
  }

  export type ProgramaPagosMaxAggregateInputType = {
    id_pago?: true
    tenant_id?: true
    proyecto_id?: true
    presupuesto_id?: true
    concepto?: true
    beneficiario?: true
    beneficiario_id?: true
    monto_programado?: true
    monto_pagado?: true
    moneda?: true
    fecha_programada?: true
    fecha_pago_real?: true
    estado?: true
    referencia_modulo?: true
    referencia_entidad?: true
    referencia_id?: true
    metodo_pago?: true
    banco?: true
    referencia_bancaria?: true
    created_at?: true
    updated_at?: true
  }

  export type ProgramaPagosCountAggregateInputType = {
    id_pago?: true
    tenant_id?: true
    proyecto_id?: true
    presupuesto_id?: true
    concepto?: true
    beneficiario?: true
    beneficiario_id?: true
    monto_programado?: true
    monto_pagado?: true
    moneda?: true
    fecha_programada?: true
    fecha_pago_real?: true
    estado?: true
    referencia_modulo?: true
    referencia_entidad?: true
    referencia_id?: true
    metodo_pago?: true
    banco?: true
    referencia_bancaria?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type ProgramaPagosAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProgramaPagos to aggregate.
     */
    where?: ProgramaPagosWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProgramaPagos to fetch.
     */
    orderBy?: ProgramaPagosOrderByWithRelationInput | ProgramaPagosOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProgramaPagosWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProgramaPagos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProgramaPagos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ProgramaPagos
    **/
    _count?: true | ProgramaPagosCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ProgramaPagosAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ProgramaPagosSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProgramaPagosMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProgramaPagosMaxAggregateInputType
  }

  export type GetProgramaPagosAggregateType<T extends ProgramaPagosAggregateArgs> = {
        [P in keyof T & keyof AggregateProgramaPagos]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProgramaPagos[P]>
      : GetScalarType<T[P], AggregateProgramaPagos[P]>
  }




  export type ProgramaPagosGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProgramaPagosWhereInput
    orderBy?: ProgramaPagosOrderByWithAggregationInput | ProgramaPagosOrderByWithAggregationInput[]
    by: ProgramaPagosScalarFieldEnum[] | ProgramaPagosScalarFieldEnum
    having?: ProgramaPagosScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProgramaPagosCountAggregateInputType | true
    _avg?: ProgramaPagosAvgAggregateInputType
    _sum?: ProgramaPagosSumAggregateInputType
    _min?: ProgramaPagosMinAggregateInputType
    _max?: ProgramaPagosMaxAggregateInputType
  }

  export type ProgramaPagosGroupByOutputType = {
    id_pago: string
    tenant_id: string
    proyecto_id: string
    presupuesto_id: string
    concepto: string
    beneficiario: string
    beneficiario_id: string | null
    monto_programado: Decimal
    monto_pagado: Decimal
    moneda: string
    fecha_programada: Date
    fecha_pago_real: Date | null
    estado: string
    referencia_modulo: string | null
    referencia_entidad: string | null
    referencia_id: string | null
    metodo_pago: string | null
    banco: string | null
    referencia_bancaria: string | null
    created_at: Date
    updated_at: Date
    _count: ProgramaPagosCountAggregateOutputType | null
    _avg: ProgramaPagosAvgAggregateOutputType | null
    _sum: ProgramaPagosSumAggregateOutputType | null
    _min: ProgramaPagosMinAggregateOutputType | null
    _max: ProgramaPagosMaxAggregateOutputType | null
  }

  type GetProgramaPagosGroupByPayload<T extends ProgramaPagosGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProgramaPagosGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProgramaPagosGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProgramaPagosGroupByOutputType[P]>
            : GetScalarType<T[P], ProgramaPagosGroupByOutputType[P]>
        }
      >
    >


  export type ProgramaPagosSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_pago?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    presupuesto_id?: boolean
    concepto?: boolean
    beneficiario?: boolean
    beneficiario_id?: boolean
    monto_programado?: boolean
    monto_pagado?: boolean
    moneda?: boolean
    fecha_programada?: boolean
    fecha_pago_real?: boolean
    estado?: boolean
    referencia_modulo?: boolean
    referencia_entidad?: boolean
    referencia_id?: boolean
    metodo_pago?: boolean
    banco?: boolean
    referencia_bancaria?: boolean
    created_at?: boolean
    updated_at?: boolean
    presupuesto?: boolean | PresupuestoAsignadoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["programaPagos"]>

  export type ProgramaPagosSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_pago?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    presupuesto_id?: boolean
    concepto?: boolean
    beneficiario?: boolean
    beneficiario_id?: boolean
    monto_programado?: boolean
    monto_pagado?: boolean
    moneda?: boolean
    fecha_programada?: boolean
    fecha_pago_real?: boolean
    estado?: boolean
    referencia_modulo?: boolean
    referencia_entidad?: boolean
    referencia_id?: boolean
    metodo_pago?: boolean
    banco?: boolean
    referencia_bancaria?: boolean
    created_at?: boolean
    updated_at?: boolean
    presupuesto?: boolean | PresupuestoAsignadoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["programaPagos"]>

  export type ProgramaPagosSelectScalar = {
    id_pago?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    presupuesto_id?: boolean
    concepto?: boolean
    beneficiario?: boolean
    beneficiario_id?: boolean
    monto_programado?: boolean
    monto_pagado?: boolean
    moneda?: boolean
    fecha_programada?: boolean
    fecha_pago_real?: boolean
    estado?: boolean
    referencia_modulo?: boolean
    referencia_entidad?: boolean
    referencia_id?: boolean
    metodo_pago?: boolean
    banco?: boolean
    referencia_bancaria?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type ProgramaPagosInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    presupuesto?: boolean | PresupuestoAsignadoDefaultArgs<ExtArgs>
  }
  export type ProgramaPagosIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    presupuesto?: boolean | PresupuestoAsignadoDefaultArgs<ExtArgs>
  }

  export type $ProgramaPagosPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ProgramaPagos"
    objects: {
      presupuesto: Prisma.$PresupuestoAsignadoPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id_pago: string
      tenant_id: string
      proyecto_id: string
      presupuesto_id: string
      concepto: string
      beneficiario: string
      beneficiario_id: string | null
      monto_programado: Prisma.Decimal
      monto_pagado: Prisma.Decimal
      moneda: string
      fecha_programada: Date
      fecha_pago_real: Date | null
      estado: string
      referencia_modulo: string | null
      referencia_entidad: string | null
      referencia_id: string | null
      metodo_pago: string | null
      banco: string | null
      referencia_bancaria: string | null
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["programaPagos"]>
    composites: {}
  }

  type ProgramaPagosGetPayload<S extends boolean | null | undefined | ProgramaPagosDefaultArgs> = $Result.GetResult<Prisma.$ProgramaPagosPayload, S>

  type ProgramaPagosCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ProgramaPagosFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ProgramaPagosCountAggregateInputType | true
    }

  export interface ProgramaPagosDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ProgramaPagos'], meta: { name: 'ProgramaPagos' } }
    /**
     * Find zero or one ProgramaPagos that matches the filter.
     * @param {ProgramaPagosFindUniqueArgs} args - Arguments to find a ProgramaPagos
     * @example
     * // Get one ProgramaPagos
     * const programaPagos = await prisma.programaPagos.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProgramaPagosFindUniqueArgs>(args: SelectSubset<T, ProgramaPagosFindUniqueArgs<ExtArgs>>): Prisma__ProgramaPagosClient<$Result.GetResult<Prisma.$ProgramaPagosPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ProgramaPagos that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ProgramaPagosFindUniqueOrThrowArgs} args - Arguments to find a ProgramaPagos
     * @example
     * // Get one ProgramaPagos
     * const programaPagos = await prisma.programaPagos.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProgramaPagosFindUniqueOrThrowArgs>(args: SelectSubset<T, ProgramaPagosFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProgramaPagosClient<$Result.GetResult<Prisma.$ProgramaPagosPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ProgramaPagos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProgramaPagosFindFirstArgs} args - Arguments to find a ProgramaPagos
     * @example
     * // Get one ProgramaPagos
     * const programaPagos = await prisma.programaPagos.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProgramaPagosFindFirstArgs>(args?: SelectSubset<T, ProgramaPagosFindFirstArgs<ExtArgs>>): Prisma__ProgramaPagosClient<$Result.GetResult<Prisma.$ProgramaPagosPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ProgramaPagos that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProgramaPagosFindFirstOrThrowArgs} args - Arguments to find a ProgramaPagos
     * @example
     * // Get one ProgramaPagos
     * const programaPagos = await prisma.programaPagos.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProgramaPagosFindFirstOrThrowArgs>(args?: SelectSubset<T, ProgramaPagosFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProgramaPagosClient<$Result.GetResult<Prisma.$ProgramaPagosPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ProgramaPagos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProgramaPagosFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ProgramaPagos
     * const programaPagos = await prisma.programaPagos.findMany()
     * 
     * // Get first 10 ProgramaPagos
     * const programaPagos = await prisma.programaPagos.findMany({ take: 10 })
     * 
     * // Only select the `id_pago`
     * const programaPagosWithId_pagoOnly = await prisma.programaPagos.findMany({ select: { id_pago: true } })
     * 
     */
    findMany<T extends ProgramaPagosFindManyArgs>(args?: SelectSubset<T, ProgramaPagosFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProgramaPagosPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ProgramaPagos.
     * @param {ProgramaPagosCreateArgs} args - Arguments to create a ProgramaPagos.
     * @example
     * // Create one ProgramaPagos
     * const ProgramaPagos = await prisma.programaPagos.create({
     *   data: {
     *     // ... data to create a ProgramaPagos
     *   }
     * })
     * 
     */
    create<T extends ProgramaPagosCreateArgs>(args: SelectSubset<T, ProgramaPagosCreateArgs<ExtArgs>>): Prisma__ProgramaPagosClient<$Result.GetResult<Prisma.$ProgramaPagosPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ProgramaPagos.
     * @param {ProgramaPagosCreateManyArgs} args - Arguments to create many ProgramaPagos.
     * @example
     * // Create many ProgramaPagos
     * const programaPagos = await prisma.programaPagos.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProgramaPagosCreateManyArgs>(args?: SelectSubset<T, ProgramaPagosCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ProgramaPagos and returns the data saved in the database.
     * @param {ProgramaPagosCreateManyAndReturnArgs} args - Arguments to create many ProgramaPagos.
     * @example
     * // Create many ProgramaPagos
     * const programaPagos = await prisma.programaPagos.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ProgramaPagos and only return the `id_pago`
     * const programaPagosWithId_pagoOnly = await prisma.programaPagos.createManyAndReturn({ 
     *   select: { id_pago: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProgramaPagosCreateManyAndReturnArgs>(args?: SelectSubset<T, ProgramaPagosCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProgramaPagosPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ProgramaPagos.
     * @param {ProgramaPagosDeleteArgs} args - Arguments to delete one ProgramaPagos.
     * @example
     * // Delete one ProgramaPagos
     * const ProgramaPagos = await prisma.programaPagos.delete({
     *   where: {
     *     // ... filter to delete one ProgramaPagos
     *   }
     * })
     * 
     */
    delete<T extends ProgramaPagosDeleteArgs>(args: SelectSubset<T, ProgramaPagosDeleteArgs<ExtArgs>>): Prisma__ProgramaPagosClient<$Result.GetResult<Prisma.$ProgramaPagosPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ProgramaPagos.
     * @param {ProgramaPagosUpdateArgs} args - Arguments to update one ProgramaPagos.
     * @example
     * // Update one ProgramaPagos
     * const programaPagos = await prisma.programaPagos.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProgramaPagosUpdateArgs>(args: SelectSubset<T, ProgramaPagosUpdateArgs<ExtArgs>>): Prisma__ProgramaPagosClient<$Result.GetResult<Prisma.$ProgramaPagosPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ProgramaPagos.
     * @param {ProgramaPagosDeleteManyArgs} args - Arguments to filter ProgramaPagos to delete.
     * @example
     * // Delete a few ProgramaPagos
     * const { count } = await prisma.programaPagos.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProgramaPagosDeleteManyArgs>(args?: SelectSubset<T, ProgramaPagosDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ProgramaPagos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProgramaPagosUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ProgramaPagos
     * const programaPagos = await prisma.programaPagos.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProgramaPagosUpdateManyArgs>(args: SelectSubset<T, ProgramaPagosUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ProgramaPagos.
     * @param {ProgramaPagosUpsertArgs} args - Arguments to update or create a ProgramaPagos.
     * @example
     * // Update or create a ProgramaPagos
     * const programaPagos = await prisma.programaPagos.upsert({
     *   create: {
     *     // ... data to create a ProgramaPagos
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ProgramaPagos we want to update
     *   }
     * })
     */
    upsert<T extends ProgramaPagosUpsertArgs>(args: SelectSubset<T, ProgramaPagosUpsertArgs<ExtArgs>>): Prisma__ProgramaPagosClient<$Result.GetResult<Prisma.$ProgramaPagosPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ProgramaPagos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProgramaPagosCountArgs} args - Arguments to filter ProgramaPagos to count.
     * @example
     * // Count the number of ProgramaPagos
     * const count = await prisma.programaPagos.count({
     *   where: {
     *     // ... the filter for the ProgramaPagos we want to count
     *   }
     * })
    **/
    count<T extends ProgramaPagosCountArgs>(
      args?: Subset<T, ProgramaPagosCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProgramaPagosCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ProgramaPagos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProgramaPagosAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ProgramaPagosAggregateArgs>(args: Subset<T, ProgramaPagosAggregateArgs>): Prisma.PrismaPromise<GetProgramaPagosAggregateType<T>>

    /**
     * Group by ProgramaPagos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProgramaPagosGroupByArgs} args - Group by arguments.
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
      T extends ProgramaPagosGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProgramaPagosGroupByArgs['orderBy'] }
        : { orderBy?: ProgramaPagosGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ProgramaPagosGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProgramaPagosGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ProgramaPagos model
   */
  readonly fields: ProgramaPagosFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ProgramaPagos.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProgramaPagosClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    presupuesto<T extends PresupuestoAsignadoDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PresupuestoAsignadoDefaultArgs<ExtArgs>>): Prisma__PresupuestoAsignadoClient<$Result.GetResult<Prisma.$PresupuestoAsignadoPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
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
   * Fields of the ProgramaPagos model
   */ 
  interface ProgramaPagosFieldRefs {
    readonly id_pago: FieldRef<"ProgramaPagos", 'String'>
    readonly tenant_id: FieldRef<"ProgramaPagos", 'String'>
    readonly proyecto_id: FieldRef<"ProgramaPagos", 'String'>
    readonly presupuesto_id: FieldRef<"ProgramaPagos", 'String'>
    readonly concepto: FieldRef<"ProgramaPagos", 'String'>
    readonly beneficiario: FieldRef<"ProgramaPagos", 'String'>
    readonly beneficiario_id: FieldRef<"ProgramaPagos", 'String'>
    readonly monto_programado: FieldRef<"ProgramaPagos", 'Decimal'>
    readonly monto_pagado: FieldRef<"ProgramaPagos", 'Decimal'>
    readonly moneda: FieldRef<"ProgramaPagos", 'String'>
    readonly fecha_programada: FieldRef<"ProgramaPagos", 'DateTime'>
    readonly fecha_pago_real: FieldRef<"ProgramaPagos", 'DateTime'>
    readonly estado: FieldRef<"ProgramaPagos", 'String'>
    readonly referencia_modulo: FieldRef<"ProgramaPagos", 'String'>
    readonly referencia_entidad: FieldRef<"ProgramaPagos", 'String'>
    readonly referencia_id: FieldRef<"ProgramaPagos", 'String'>
    readonly metodo_pago: FieldRef<"ProgramaPagos", 'String'>
    readonly banco: FieldRef<"ProgramaPagos", 'String'>
    readonly referencia_bancaria: FieldRef<"ProgramaPagos", 'String'>
    readonly created_at: FieldRef<"ProgramaPagos", 'DateTime'>
    readonly updated_at: FieldRef<"ProgramaPagos", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ProgramaPagos findUnique
   */
  export type ProgramaPagosFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProgramaPagos
     */
    select?: ProgramaPagosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProgramaPagosInclude<ExtArgs> | null
    /**
     * Filter, which ProgramaPagos to fetch.
     */
    where: ProgramaPagosWhereUniqueInput
  }

  /**
   * ProgramaPagos findUniqueOrThrow
   */
  export type ProgramaPagosFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProgramaPagos
     */
    select?: ProgramaPagosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProgramaPagosInclude<ExtArgs> | null
    /**
     * Filter, which ProgramaPagos to fetch.
     */
    where: ProgramaPagosWhereUniqueInput
  }

  /**
   * ProgramaPagos findFirst
   */
  export type ProgramaPagosFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProgramaPagos
     */
    select?: ProgramaPagosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProgramaPagosInclude<ExtArgs> | null
    /**
     * Filter, which ProgramaPagos to fetch.
     */
    where?: ProgramaPagosWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProgramaPagos to fetch.
     */
    orderBy?: ProgramaPagosOrderByWithRelationInput | ProgramaPagosOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProgramaPagos.
     */
    cursor?: ProgramaPagosWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProgramaPagos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProgramaPagos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProgramaPagos.
     */
    distinct?: ProgramaPagosScalarFieldEnum | ProgramaPagosScalarFieldEnum[]
  }

  /**
   * ProgramaPagos findFirstOrThrow
   */
  export type ProgramaPagosFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProgramaPagos
     */
    select?: ProgramaPagosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProgramaPagosInclude<ExtArgs> | null
    /**
     * Filter, which ProgramaPagos to fetch.
     */
    where?: ProgramaPagosWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProgramaPagos to fetch.
     */
    orderBy?: ProgramaPagosOrderByWithRelationInput | ProgramaPagosOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProgramaPagos.
     */
    cursor?: ProgramaPagosWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProgramaPagos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProgramaPagos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProgramaPagos.
     */
    distinct?: ProgramaPagosScalarFieldEnum | ProgramaPagosScalarFieldEnum[]
  }

  /**
   * ProgramaPagos findMany
   */
  export type ProgramaPagosFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProgramaPagos
     */
    select?: ProgramaPagosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProgramaPagosInclude<ExtArgs> | null
    /**
     * Filter, which ProgramaPagos to fetch.
     */
    where?: ProgramaPagosWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProgramaPagos to fetch.
     */
    orderBy?: ProgramaPagosOrderByWithRelationInput | ProgramaPagosOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ProgramaPagos.
     */
    cursor?: ProgramaPagosWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProgramaPagos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProgramaPagos.
     */
    skip?: number
    distinct?: ProgramaPagosScalarFieldEnum | ProgramaPagosScalarFieldEnum[]
  }

  /**
   * ProgramaPagos create
   */
  export type ProgramaPagosCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProgramaPagos
     */
    select?: ProgramaPagosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProgramaPagosInclude<ExtArgs> | null
    /**
     * The data needed to create a ProgramaPagos.
     */
    data: XOR<ProgramaPagosCreateInput, ProgramaPagosUncheckedCreateInput>
  }

  /**
   * ProgramaPagos createMany
   */
  export type ProgramaPagosCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ProgramaPagos.
     */
    data: ProgramaPagosCreateManyInput | ProgramaPagosCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ProgramaPagos createManyAndReturn
   */
  export type ProgramaPagosCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProgramaPagos
     */
    select?: ProgramaPagosSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ProgramaPagos.
     */
    data: ProgramaPagosCreateManyInput | ProgramaPagosCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProgramaPagosIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ProgramaPagos update
   */
  export type ProgramaPagosUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProgramaPagos
     */
    select?: ProgramaPagosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProgramaPagosInclude<ExtArgs> | null
    /**
     * The data needed to update a ProgramaPagos.
     */
    data: XOR<ProgramaPagosUpdateInput, ProgramaPagosUncheckedUpdateInput>
    /**
     * Choose, which ProgramaPagos to update.
     */
    where: ProgramaPagosWhereUniqueInput
  }

  /**
   * ProgramaPagos updateMany
   */
  export type ProgramaPagosUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ProgramaPagos.
     */
    data: XOR<ProgramaPagosUpdateManyMutationInput, ProgramaPagosUncheckedUpdateManyInput>
    /**
     * Filter which ProgramaPagos to update
     */
    where?: ProgramaPagosWhereInput
  }

  /**
   * ProgramaPagos upsert
   */
  export type ProgramaPagosUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProgramaPagos
     */
    select?: ProgramaPagosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProgramaPagosInclude<ExtArgs> | null
    /**
     * The filter to search for the ProgramaPagos to update in case it exists.
     */
    where: ProgramaPagosWhereUniqueInput
    /**
     * In case the ProgramaPagos found by the `where` argument doesn't exist, create a new ProgramaPagos with this data.
     */
    create: XOR<ProgramaPagosCreateInput, ProgramaPagosUncheckedCreateInput>
    /**
     * In case the ProgramaPagos was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProgramaPagosUpdateInput, ProgramaPagosUncheckedUpdateInput>
  }

  /**
   * ProgramaPagos delete
   */
  export type ProgramaPagosDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProgramaPagos
     */
    select?: ProgramaPagosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProgramaPagosInclude<ExtArgs> | null
    /**
     * Filter which ProgramaPagos to delete.
     */
    where: ProgramaPagosWhereUniqueInput
  }

  /**
   * ProgramaPagos deleteMany
   */
  export type ProgramaPagosDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProgramaPagos to delete
     */
    where?: ProgramaPagosWhereInput
  }

  /**
   * ProgramaPagos without action
   */
  export type ProgramaPagosDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProgramaPagos
     */
    select?: ProgramaPagosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProgramaPagosInclude<ExtArgs> | null
  }


  /**
   * Model CuentaBancaria
   */

  export type AggregateCuentaBancaria = {
    _count: CuentaBancariaCountAggregateOutputType | null
    _avg: CuentaBancariaAvgAggregateOutputType | null
    _sum: CuentaBancariaSumAggregateOutputType | null
    _min: CuentaBancariaMinAggregateOutputType | null
    _max: CuentaBancariaMaxAggregateOutputType | null
  }

  export type CuentaBancariaAvgAggregateOutputType = {
    saldo: Decimal | null
  }

  export type CuentaBancariaSumAggregateOutputType = {
    saldo: Decimal | null
  }

  export type CuentaBancariaMinAggregateOutputType = {
    id_cuenta: string | null
    tenant_id: string | null
    proyecto_id: string | null
    banco: string | null
    numero_cuenta: string | null
    clabe: string | null
    alias: string | null
    moneda: string | null
    saldo: Decimal | null
    activa: boolean | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type CuentaBancariaMaxAggregateOutputType = {
    id_cuenta: string | null
    tenant_id: string | null
    proyecto_id: string | null
    banco: string | null
    numero_cuenta: string | null
    clabe: string | null
    alias: string | null
    moneda: string | null
    saldo: Decimal | null
    activa: boolean | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type CuentaBancariaCountAggregateOutputType = {
    id_cuenta: number
    tenant_id: number
    proyecto_id: number
    banco: number
    numero_cuenta: number
    clabe: number
    alias: number
    moneda: number
    saldo: number
    activa: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type CuentaBancariaAvgAggregateInputType = {
    saldo?: true
  }

  export type CuentaBancariaSumAggregateInputType = {
    saldo?: true
  }

  export type CuentaBancariaMinAggregateInputType = {
    id_cuenta?: true
    tenant_id?: true
    proyecto_id?: true
    banco?: true
    numero_cuenta?: true
    clabe?: true
    alias?: true
    moneda?: true
    saldo?: true
    activa?: true
    created_at?: true
    updated_at?: true
  }

  export type CuentaBancariaMaxAggregateInputType = {
    id_cuenta?: true
    tenant_id?: true
    proyecto_id?: true
    banco?: true
    numero_cuenta?: true
    clabe?: true
    alias?: true
    moneda?: true
    saldo?: true
    activa?: true
    created_at?: true
    updated_at?: true
  }

  export type CuentaBancariaCountAggregateInputType = {
    id_cuenta?: true
    tenant_id?: true
    proyecto_id?: true
    banco?: true
    numero_cuenta?: true
    clabe?: true
    alias?: true
    moneda?: true
    saldo?: true
    activa?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type CuentaBancariaAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CuentaBancaria to aggregate.
     */
    where?: CuentaBancariaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CuentaBancarias to fetch.
     */
    orderBy?: CuentaBancariaOrderByWithRelationInput | CuentaBancariaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CuentaBancariaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CuentaBancarias from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CuentaBancarias.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CuentaBancarias
    **/
    _count?: true | CuentaBancariaCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CuentaBancariaAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CuentaBancariaSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CuentaBancariaMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CuentaBancariaMaxAggregateInputType
  }

  export type GetCuentaBancariaAggregateType<T extends CuentaBancariaAggregateArgs> = {
        [P in keyof T & keyof AggregateCuentaBancaria]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCuentaBancaria[P]>
      : GetScalarType<T[P], AggregateCuentaBancaria[P]>
  }




  export type CuentaBancariaGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CuentaBancariaWhereInput
    orderBy?: CuentaBancariaOrderByWithAggregationInput | CuentaBancariaOrderByWithAggregationInput[]
    by: CuentaBancariaScalarFieldEnum[] | CuentaBancariaScalarFieldEnum
    having?: CuentaBancariaScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CuentaBancariaCountAggregateInputType | true
    _avg?: CuentaBancariaAvgAggregateInputType
    _sum?: CuentaBancariaSumAggregateInputType
    _min?: CuentaBancariaMinAggregateInputType
    _max?: CuentaBancariaMaxAggregateInputType
  }

  export type CuentaBancariaGroupByOutputType = {
    id_cuenta: string
    tenant_id: string
    proyecto_id: string | null
    banco: string
    numero_cuenta: string
    clabe: string | null
    alias: string
    moneda: string
    saldo: Decimal
    activa: boolean
    created_at: Date
    updated_at: Date
    _count: CuentaBancariaCountAggregateOutputType | null
    _avg: CuentaBancariaAvgAggregateOutputType | null
    _sum: CuentaBancariaSumAggregateOutputType | null
    _min: CuentaBancariaMinAggregateOutputType | null
    _max: CuentaBancariaMaxAggregateOutputType | null
  }

  type GetCuentaBancariaGroupByPayload<T extends CuentaBancariaGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CuentaBancariaGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CuentaBancariaGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CuentaBancariaGroupByOutputType[P]>
            : GetScalarType<T[P], CuentaBancariaGroupByOutputType[P]>
        }
      >
    >


  export type CuentaBancariaSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_cuenta?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    banco?: boolean
    numero_cuenta?: boolean
    clabe?: boolean
    alias?: boolean
    moneda?: boolean
    saldo?: boolean
    activa?: boolean
    created_at?: boolean
    updated_at?: boolean
    pagos?: boolean | CuentaBancaria$pagosArgs<ExtArgs>
    _count?: boolean | CuentaBancariaCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cuentaBancaria"]>

  export type CuentaBancariaSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_cuenta?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    banco?: boolean
    numero_cuenta?: boolean
    clabe?: boolean
    alias?: boolean
    moneda?: boolean
    saldo?: boolean
    activa?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["cuentaBancaria"]>

  export type CuentaBancariaSelectScalar = {
    id_cuenta?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    banco?: boolean
    numero_cuenta?: boolean
    clabe?: boolean
    alias?: boolean
    moneda?: boolean
    saldo?: boolean
    activa?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type CuentaBancariaInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    pagos?: boolean | CuentaBancaria$pagosArgs<ExtArgs>
    _count?: boolean | CuentaBancariaCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CuentaBancariaIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $CuentaBancariaPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CuentaBancaria"
    objects: {
      pagos: Prisma.$PagoOCPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id_cuenta: string
      tenant_id: string
      proyecto_id: string | null
      banco: string
      numero_cuenta: string
      clabe: string | null
      alias: string
      moneda: string
      saldo: Prisma.Decimal
      activa: boolean
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["cuentaBancaria"]>
    composites: {}
  }

  type CuentaBancariaGetPayload<S extends boolean | null | undefined | CuentaBancariaDefaultArgs> = $Result.GetResult<Prisma.$CuentaBancariaPayload, S>

  type CuentaBancariaCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CuentaBancariaFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CuentaBancariaCountAggregateInputType | true
    }

  export interface CuentaBancariaDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CuentaBancaria'], meta: { name: 'CuentaBancaria' } }
    /**
     * Find zero or one CuentaBancaria that matches the filter.
     * @param {CuentaBancariaFindUniqueArgs} args - Arguments to find a CuentaBancaria
     * @example
     * // Get one CuentaBancaria
     * const cuentaBancaria = await prisma.cuentaBancaria.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CuentaBancariaFindUniqueArgs>(args: SelectSubset<T, CuentaBancariaFindUniqueArgs<ExtArgs>>): Prisma__CuentaBancariaClient<$Result.GetResult<Prisma.$CuentaBancariaPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one CuentaBancaria that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CuentaBancariaFindUniqueOrThrowArgs} args - Arguments to find a CuentaBancaria
     * @example
     * // Get one CuentaBancaria
     * const cuentaBancaria = await prisma.cuentaBancaria.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CuentaBancariaFindUniqueOrThrowArgs>(args: SelectSubset<T, CuentaBancariaFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CuentaBancariaClient<$Result.GetResult<Prisma.$CuentaBancariaPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first CuentaBancaria that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CuentaBancariaFindFirstArgs} args - Arguments to find a CuentaBancaria
     * @example
     * // Get one CuentaBancaria
     * const cuentaBancaria = await prisma.cuentaBancaria.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CuentaBancariaFindFirstArgs>(args?: SelectSubset<T, CuentaBancariaFindFirstArgs<ExtArgs>>): Prisma__CuentaBancariaClient<$Result.GetResult<Prisma.$CuentaBancariaPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first CuentaBancaria that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CuentaBancariaFindFirstOrThrowArgs} args - Arguments to find a CuentaBancaria
     * @example
     * // Get one CuentaBancaria
     * const cuentaBancaria = await prisma.cuentaBancaria.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CuentaBancariaFindFirstOrThrowArgs>(args?: SelectSubset<T, CuentaBancariaFindFirstOrThrowArgs<ExtArgs>>): Prisma__CuentaBancariaClient<$Result.GetResult<Prisma.$CuentaBancariaPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more CuentaBancarias that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CuentaBancariaFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CuentaBancarias
     * const cuentaBancarias = await prisma.cuentaBancaria.findMany()
     * 
     * // Get first 10 CuentaBancarias
     * const cuentaBancarias = await prisma.cuentaBancaria.findMany({ take: 10 })
     * 
     * // Only select the `id_cuenta`
     * const cuentaBancariaWithId_cuentaOnly = await prisma.cuentaBancaria.findMany({ select: { id_cuenta: true } })
     * 
     */
    findMany<T extends CuentaBancariaFindManyArgs>(args?: SelectSubset<T, CuentaBancariaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CuentaBancariaPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a CuentaBancaria.
     * @param {CuentaBancariaCreateArgs} args - Arguments to create a CuentaBancaria.
     * @example
     * // Create one CuentaBancaria
     * const CuentaBancaria = await prisma.cuentaBancaria.create({
     *   data: {
     *     // ... data to create a CuentaBancaria
     *   }
     * })
     * 
     */
    create<T extends CuentaBancariaCreateArgs>(args: SelectSubset<T, CuentaBancariaCreateArgs<ExtArgs>>): Prisma__CuentaBancariaClient<$Result.GetResult<Prisma.$CuentaBancariaPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many CuentaBancarias.
     * @param {CuentaBancariaCreateManyArgs} args - Arguments to create many CuentaBancarias.
     * @example
     * // Create many CuentaBancarias
     * const cuentaBancaria = await prisma.cuentaBancaria.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CuentaBancariaCreateManyArgs>(args?: SelectSubset<T, CuentaBancariaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CuentaBancarias and returns the data saved in the database.
     * @param {CuentaBancariaCreateManyAndReturnArgs} args - Arguments to create many CuentaBancarias.
     * @example
     * // Create many CuentaBancarias
     * const cuentaBancaria = await prisma.cuentaBancaria.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CuentaBancarias and only return the `id_cuenta`
     * const cuentaBancariaWithId_cuentaOnly = await prisma.cuentaBancaria.createManyAndReturn({ 
     *   select: { id_cuenta: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CuentaBancariaCreateManyAndReturnArgs>(args?: SelectSubset<T, CuentaBancariaCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CuentaBancariaPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a CuentaBancaria.
     * @param {CuentaBancariaDeleteArgs} args - Arguments to delete one CuentaBancaria.
     * @example
     * // Delete one CuentaBancaria
     * const CuentaBancaria = await prisma.cuentaBancaria.delete({
     *   where: {
     *     // ... filter to delete one CuentaBancaria
     *   }
     * })
     * 
     */
    delete<T extends CuentaBancariaDeleteArgs>(args: SelectSubset<T, CuentaBancariaDeleteArgs<ExtArgs>>): Prisma__CuentaBancariaClient<$Result.GetResult<Prisma.$CuentaBancariaPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one CuentaBancaria.
     * @param {CuentaBancariaUpdateArgs} args - Arguments to update one CuentaBancaria.
     * @example
     * // Update one CuentaBancaria
     * const cuentaBancaria = await prisma.cuentaBancaria.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CuentaBancariaUpdateArgs>(args: SelectSubset<T, CuentaBancariaUpdateArgs<ExtArgs>>): Prisma__CuentaBancariaClient<$Result.GetResult<Prisma.$CuentaBancariaPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more CuentaBancarias.
     * @param {CuentaBancariaDeleteManyArgs} args - Arguments to filter CuentaBancarias to delete.
     * @example
     * // Delete a few CuentaBancarias
     * const { count } = await prisma.cuentaBancaria.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CuentaBancariaDeleteManyArgs>(args?: SelectSubset<T, CuentaBancariaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CuentaBancarias.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CuentaBancariaUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CuentaBancarias
     * const cuentaBancaria = await prisma.cuentaBancaria.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CuentaBancariaUpdateManyArgs>(args: SelectSubset<T, CuentaBancariaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one CuentaBancaria.
     * @param {CuentaBancariaUpsertArgs} args - Arguments to update or create a CuentaBancaria.
     * @example
     * // Update or create a CuentaBancaria
     * const cuentaBancaria = await prisma.cuentaBancaria.upsert({
     *   create: {
     *     // ... data to create a CuentaBancaria
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CuentaBancaria we want to update
     *   }
     * })
     */
    upsert<T extends CuentaBancariaUpsertArgs>(args: SelectSubset<T, CuentaBancariaUpsertArgs<ExtArgs>>): Prisma__CuentaBancariaClient<$Result.GetResult<Prisma.$CuentaBancariaPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of CuentaBancarias.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CuentaBancariaCountArgs} args - Arguments to filter CuentaBancarias to count.
     * @example
     * // Count the number of CuentaBancarias
     * const count = await prisma.cuentaBancaria.count({
     *   where: {
     *     // ... the filter for the CuentaBancarias we want to count
     *   }
     * })
    **/
    count<T extends CuentaBancariaCountArgs>(
      args?: Subset<T, CuentaBancariaCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CuentaBancariaCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CuentaBancaria.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CuentaBancariaAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends CuentaBancariaAggregateArgs>(args: Subset<T, CuentaBancariaAggregateArgs>): Prisma.PrismaPromise<GetCuentaBancariaAggregateType<T>>

    /**
     * Group by CuentaBancaria.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CuentaBancariaGroupByArgs} args - Group by arguments.
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
      T extends CuentaBancariaGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CuentaBancariaGroupByArgs['orderBy'] }
        : { orderBy?: CuentaBancariaGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, CuentaBancariaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCuentaBancariaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CuentaBancaria model
   */
  readonly fields: CuentaBancariaFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CuentaBancaria.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CuentaBancariaClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    pagos<T extends CuentaBancaria$pagosArgs<ExtArgs> = {}>(args?: Subset<T, CuentaBancaria$pagosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PagoOCPayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the CuentaBancaria model
   */ 
  interface CuentaBancariaFieldRefs {
    readonly id_cuenta: FieldRef<"CuentaBancaria", 'String'>
    readonly tenant_id: FieldRef<"CuentaBancaria", 'String'>
    readonly proyecto_id: FieldRef<"CuentaBancaria", 'String'>
    readonly banco: FieldRef<"CuentaBancaria", 'String'>
    readonly numero_cuenta: FieldRef<"CuentaBancaria", 'String'>
    readonly clabe: FieldRef<"CuentaBancaria", 'String'>
    readonly alias: FieldRef<"CuentaBancaria", 'String'>
    readonly moneda: FieldRef<"CuentaBancaria", 'String'>
    readonly saldo: FieldRef<"CuentaBancaria", 'Decimal'>
    readonly activa: FieldRef<"CuentaBancaria", 'Boolean'>
    readonly created_at: FieldRef<"CuentaBancaria", 'DateTime'>
    readonly updated_at: FieldRef<"CuentaBancaria", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CuentaBancaria findUnique
   */
  export type CuentaBancariaFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CuentaBancaria
     */
    select?: CuentaBancariaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CuentaBancariaInclude<ExtArgs> | null
    /**
     * Filter, which CuentaBancaria to fetch.
     */
    where: CuentaBancariaWhereUniqueInput
  }

  /**
   * CuentaBancaria findUniqueOrThrow
   */
  export type CuentaBancariaFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CuentaBancaria
     */
    select?: CuentaBancariaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CuentaBancariaInclude<ExtArgs> | null
    /**
     * Filter, which CuentaBancaria to fetch.
     */
    where: CuentaBancariaWhereUniqueInput
  }

  /**
   * CuentaBancaria findFirst
   */
  export type CuentaBancariaFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CuentaBancaria
     */
    select?: CuentaBancariaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CuentaBancariaInclude<ExtArgs> | null
    /**
     * Filter, which CuentaBancaria to fetch.
     */
    where?: CuentaBancariaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CuentaBancarias to fetch.
     */
    orderBy?: CuentaBancariaOrderByWithRelationInput | CuentaBancariaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CuentaBancarias.
     */
    cursor?: CuentaBancariaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CuentaBancarias from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CuentaBancarias.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CuentaBancarias.
     */
    distinct?: CuentaBancariaScalarFieldEnum | CuentaBancariaScalarFieldEnum[]
  }

  /**
   * CuentaBancaria findFirstOrThrow
   */
  export type CuentaBancariaFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CuentaBancaria
     */
    select?: CuentaBancariaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CuentaBancariaInclude<ExtArgs> | null
    /**
     * Filter, which CuentaBancaria to fetch.
     */
    where?: CuentaBancariaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CuentaBancarias to fetch.
     */
    orderBy?: CuentaBancariaOrderByWithRelationInput | CuentaBancariaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CuentaBancarias.
     */
    cursor?: CuentaBancariaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CuentaBancarias from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CuentaBancarias.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CuentaBancarias.
     */
    distinct?: CuentaBancariaScalarFieldEnum | CuentaBancariaScalarFieldEnum[]
  }

  /**
   * CuentaBancaria findMany
   */
  export type CuentaBancariaFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CuentaBancaria
     */
    select?: CuentaBancariaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CuentaBancariaInclude<ExtArgs> | null
    /**
     * Filter, which CuentaBancarias to fetch.
     */
    where?: CuentaBancariaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CuentaBancarias to fetch.
     */
    orderBy?: CuentaBancariaOrderByWithRelationInput | CuentaBancariaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CuentaBancarias.
     */
    cursor?: CuentaBancariaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CuentaBancarias from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CuentaBancarias.
     */
    skip?: number
    distinct?: CuentaBancariaScalarFieldEnum | CuentaBancariaScalarFieldEnum[]
  }

  /**
   * CuentaBancaria create
   */
  export type CuentaBancariaCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CuentaBancaria
     */
    select?: CuentaBancariaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CuentaBancariaInclude<ExtArgs> | null
    /**
     * The data needed to create a CuentaBancaria.
     */
    data: XOR<CuentaBancariaCreateInput, CuentaBancariaUncheckedCreateInput>
  }

  /**
   * CuentaBancaria createMany
   */
  export type CuentaBancariaCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CuentaBancarias.
     */
    data: CuentaBancariaCreateManyInput | CuentaBancariaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CuentaBancaria createManyAndReturn
   */
  export type CuentaBancariaCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CuentaBancaria
     */
    select?: CuentaBancariaSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many CuentaBancarias.
     */
    data: CuentaBancariaCreateManyInput | CuentaBancariaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CuentaBancaria update
   */
  export type CuentaBancariaUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CuentaBancaria
     */
    select?: CuentaBancariaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CuentaBancariaInclude<ExtArgs> | null
    /**
     * The data needed to update a CuentaBancaria.
     */
    data: XOR<CuentaBancariaUpdateInput, CuentaBancariaUncheckedUpdateInput>
    /**
     * Choose, which CuentaBancaria to update.
     */
    where: CuentaBancariaWhereUniqueInput
  }

  /**
   * CuentaBancaria updateMany
   */
  export type CuentaBancariaUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CuentaBancarias.
     */
    data: XOR<CuentaBancariaUpdateManyMutationInput, CuentaBancariaUncheckedUpdateManyInput>
    /**
     * Filter which CuentaBancarias to update
     */
    where?: CuentaBancariaWhereInput
  }

  /**
   * CuentaBancaria upsert
   */
  export type CuentaBancariaUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CuentaBancaria
     */
    select?: CuentaBancariaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CuentaBancariaInclude<ExtArgs> | null
    /**
     * The filter to search for the CuentaBancaria to update in case it exists.
     */
    where: CuentaBancariaWhereUniqueInput
    /**
     * In case the CuentaBancaria found by the `where` argument doesn't exist, create a new CuentaBancaria with this data.
     */
    create: XOR<CuentaBancariaCreateInput, CuentaBancariaUncheckedCreateInput>
    /**
     * In case the CuentaBancaria was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CuentaBancariaUpdateInput, CuentaBancariaUncheckedUpdateInput>
  }

  /**
   * CuentaBancaria delete
   */
  export type CuentaBancariaDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CuentaBancaria
     */
    select?: CuentaBancariaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CuentaBancariaInclude<ExtArgs> | null
    /**
     * Filter which CuentaBancaria to delete.
     */
    where: CuentaBancariaWhereUniqueInput
  }

  /**
   * CuentaBancaria deleteMany
   */
  export type CuentaBancariaDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CuentaBancarias to delete
     */
    where?: CuentaBancariaWhereInput
  }

  /**
   * CuentaBancaria.pagos
   */
  export type CuentaBancaria$pagosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PagoOC
     */
    select?: PagoOCSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PagoOCInclude<ExtArgs> | null
    where?: PagoOCWhereInput
    orderBy?: PagoOCOrderByWithRelationInput | PagoOCOrderByWithRelationInput[]
    cursor?: PagoOCWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PagoOCScalarFieldEnum | PagoOCScalarFieldEnum[]
  }

  /**
   * CuentaBancaria without action
   */
  export type CuentaBancariaDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CuentaBancaria
     */
    select?: CuentaBancariaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CuentaBancariaInclude<ExtArgs> | null
  }


  /**
   * Model ProyectoFinanzas
   */

  export type AggregateProyectoFinanzas = {
    _count: ProyectoFinanzasCountAggregateOutputType | null
    _avg: ProyectoFinanzasAvgAggregateOutputType | null
    _sum: ProyectoFinanzasSumAggregateOutputType | null
    _min: ProyectoFinanzasMinAggregateOutputType | null
    _max: ProyectoFinanzasMaxAggregateOutputType | null
  }

  export type ProyectoFinanzasAvgAggregateOutputType = {
    anticipo_total: Decimal | null
    anticipo_usado: Decimal | null
  }

  export type ProyectoFinanzasSumAggregateOutputType = {
    anticipo_total: Decimal | null
    anticipo_usado: Decimal | null
  }

  export type ProyectoFinanzasMinAggregateOutputType = {
    id_proyecto_finanzas: string | null
    tenant_id: string | null
    proyecto_id: string | null
    anticipo_total: Decimal | null
    anticipo_usado: Decimal | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type ProyectoFinanzasMaxAggregateOutputType = {
    id_proyecto_finanzas: string | null
    tenant_id: string | null
    proyecto_id: string | null
    anticipo_total: Decimal | null
    anticipo_usado: Decimal | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type ProyectoFinanzasCountAggregateOutputType = {
    id_proyecto_finanzas: number
    tenant_id: number
    proyecto_id: number
    anticipo_total: number
    anticipo_usado: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type ProyectoFinanzasAvgAggregateInputType = {
    anticipo_total?: true
    anticipo_usado?: true
  }

  export type ProyectoFinanzasSumAggregateInputType = {
    anticipo_total?: true
    anticipo_usado?: true
  }

  export type ProyectoFinanzasMinAggregateInputType = {
    id_proyecto_finanzas?: true
    tenant_id?: true
    proyecto_id?: true
    anticipo_total?: true
    anticipo_usado?: true
    created_at?: true
    updated_at?: true
  }

  export type ProyectoFinanzasMaxAggregateInputType = {
    id_proyecto_finanzas?: true
    tenant_id?: true
    proyecto_id?: true
    anticipo_total?: true
    anticipo_usado?: true
    created_at?: true
    updated_at?: true
  }

  export type ProyectoFinanzasCountAggregateInputType = {
    id_proyecto_finanzas?: true
    tenant_id?: true
    proyecto_id?: true
    anticipo_total?: true
    anticipo_usado?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type ProyectoFinanzasAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProyectoFinanzas to aggregate.
     */
    where?: ProyectoFinanzasWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProyectoFinanzas to fetch.
     */
    orderBy?: ProyectoFinanzasOrderByWithRelationInput | ProyectoFinanzasOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProyectoFinanzasWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProyectoFinanzas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProyectoFinanzas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ProyectoFinanzas
    **/
    _count?: true | ProyectoFinanzasCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ProyectoFinanzasAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ProyectoFinanzasSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProyectoFinanzasMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProyectoFinanzasMaxAggregateInputType
  }

  export type GetProyectoFinanzasAggregateType<T extends ProyectoFinanzasAggregateArgs> = {
        [P in keyof T & keyof AggregateProyectoFinanzas]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProyectoFinanzas[P]>
      : GetScalarType<T[P], AggregateProyectoFinanzas[P]>
  }




  export type ProyectoFinanzasGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProyectoFinanzasWhereInput
    orderBy?: ProyectoFinanzasOrderByWithAggregationInput | ProyectoFinanzasOrderByWithAggregationInput[]
    by: ProyectoFinanzasScalarFieldEnum[] | ProyectoFinanzasScalarFieldEnum
    having?: ProyectoFinanzasScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProyectoFinanzasCountAggregateInputType | true
    _avg?: ProyectoFinanzasAvgAggregateInputType
    _sum?: ProyectoFinanzasSumAggregateInputType
    _min?: ProyectoFinanzasMinAggregateInputType
    _max?: ProyectoFinanzasMaxAggregateInputType
  }

  export type ProyectoFinanzasGroupByOutputType = {
    id_proyecto_finanzas: string
    tenant_id: string
    proyecto_id: string
    anticipo_total: Decimal
    anticipo_usado: Decimal
    created_at: Date
    updated_at: Date
    _count: ProyectoFinanzasCountAggregateOutputType | null
    _avg: ProyectoFinanzasAvgAggregateOutputType | null
    _sum: ProyectoFinanzasSumAggregateOutputType | null
    _min: ProyectoFinanzasMinAggregateOutputType | null
    _max: ProyectoFinanzasMaxAggregateOutputType | null
  }

  type GetProyectoFinanzasGroupByPayload<T extends ProyectoFinanzasGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProyectoFinanzasGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProyectoFinanzasGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProyectoFinanzasGroupByOutputType[P]>
            : GetScalarType<T[P], ProyectoFinanzasGroupByOutputType[P]>
        }
      >
    >


  export type ProyectoFinanzasSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_proyecto_finanzas?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    anticipo_total?: boolean
    anticipo_usado?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["proyectoFinanzas"]>

  export type ProyectoFinanzasSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_proyecto_finanzas?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    anticipo_total?: boolean
    anticipo_usado?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["proyectoFinanzas"]>

  export type ProyectoFinanzasSelectScalar = {
    id_proyecto_finanzas?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    anticipo_total?: boolean
    anticipo_usado?: boolean
    created_at?: boolean
    updated_at?: boolean
  }


  export type $ProyectoFinanzasPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ProyectoFinanzas"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id_proyecto_finanzas: string
      tenant_id: string
      proyecto_id: string
      anticipo_total: Prisma.Decimal
      anticipo_usado: Prisma.Decimal
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["proyectoFinanzas"]>
    composites: {}
  }

  type ProyectoFinanzasGetPayload<S extends boolean | null | undefined | ProyectoFinanzasDefaultArgs> = $Result.GetResult<Prisma.$ProyectoFinanzasPayload, S>

  type ProyectoFinanzasCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ProyectoFinanzasFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ProyectoFinanzasCountAggregateInputType | true
    }

  export interface ProyectoFinanzasDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ProyectoFinanzas'], meta: { name: 'ProyectoFinanzas' } }
    /**
     * Find zero or one ProyectoFinanzas that matches the filter.
     * @param {ProyectoFinanzasFindUniqueArgs} args - Arguments to find a ProyectoFinanzas
     * @example
     * // Get one ProyectoFinanzas
     * const proyectoFinanzas = await prisma.proyectoFinanzas.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProyectoFinanzasFindUniqueArgs>(args: SelectSubset<T, ProyectoFinanzasFindUniqueArgs<ExtArgs>>): Prisma__ProyectoFinanzasClient<$Result.GetResult<Prisma.$ProyectoFinanzasPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ProyectoFinanzas that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ProyectoFinanzasFindUniqueOrThrowArgs} args - Arguments to find a ProyectoFinanzas
     * @example
     * // Get one ProyectoFinanzas
     * const proyectoFinanzas = await prisma.proyectoFinanzas.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProyectoFinanzasFindUniqueOrThrowArgs>(args: SelectSubset<T, ProyectoFinanzasFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProyectoFinanzasClient<$Result.GetResult<Prisma.$ProyectoFinanzasPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ProyectoFinanzas that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProyectoFinanzasFindFirstArgs} args - Arguments to find a ProyectoFinanzas
     * @example
     * // Get one ProyectoFinanzas
     * const proyectoFinanzas = await prisma.proyectoFinanzas.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProyectoFinanzasFindFirstArgs>(args?: SelectSubset<T, ProyectoFinanzasFindFirstArgs<ExtArgs>>): Prisma__ProyectoFinanzasClient<$Result.GetResult<Prisma.$ProyectoFinanzasPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ProyectoFinanzas that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProyectoFinanzasFindFirstOrThrowArgs} args - Arguments to find a ProyectoFinanzas
     * @example
     * // Get one ProyectoFinanzas
     * const proyectoFinanzas = await prisma.proyectoFinanzas.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProyectoFinanzasFindFirstOrThrowArgs>(args?: SelectSubset<T, ProyectoFinanzasFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProyectoFinanzasClient<$Result.GetResult<Prisma.$ProyectoFinanzasPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ProyectoFinanzas that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProyectoFinanzasFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ProyectoFinanzas
     * const proyectoFinanzas = await prisma.proyectoFinanzas.findMany()
     * 
     * // Get first 10 ProyectoFinanzas
     * const proyectoFinanzas = await prisma.proyectoFinanzas.findMany({ take: 10 })
     * 
     * // Only select the `id_proyecto_finanzas`
     * const proyectoFinanzasWithId_proyecto_finanzasOnly = await prisma.proyectoFinanzas.findMany({ select: { id_proyecto_finanzas: true } })
     * 
     */
    findMany<T extends ProyectoFinanzasFindManyArgs>(args?: SelectSubset<T, ProyectoFinanzasFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProyectoFinanzasPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ProyectoFinanzas.
     * @param {ProyectoFinanzasCreateArgs} args - Arguments to create a ProyectoFinanzas.
     * @example
     * // Create one ProyectoFinanzas
     * const ProyectoFinanzas = await prisma.proyectoFinanzas.create({
     *   data: {
     *     // ... data to create a ProyectoFinanzas
     *   }
     * })
     * 
     */
    create<T extends ProyectoFinanzasCreateArgs>(args: SelectSubset<T, ProyectoFinanzasCreateArgs<ExtArgs>>): Prisma__ProyectoFinanzasClient<$Result.GetResult<Prisma.$ProyectoFinanzasPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ProyectoFinanzas.
     * @param {ProyectoFinanzasCreateManyArgs} args - Arguments to create many ProyectoFinanzas.
     * @example
     * // Create many ProyectoFinanzas
     * const proyectoFinanzas = await prisma.proyectoFinanzas.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProyectoFinanzasCreateManyArgs>(args?: SelectSubset<T, ProyectoFinanzasCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ProyectoFinanzas and returns the data saved in the database.
     * @param {ProyectoFinanzasCreateManyAndReturnArgs} args - Arguments to create many ProyectoFinanzas.
     * @example
     * // Create many ProyectoFinanzas
     * const proyectoFinanzas = await prisma.proyectoFinanzas.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ProyectoFinanzas and only return the `id_proyecto_finanzas`
     * const proyectoFinanzasWithId_proyecto_finanzasOnly = await prisma.proyectoFinanzas.createManyAndReturn({ 
     *   select: { id_proyecto_finanzas: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProyectoFinanzasCreateManyAndReturnArgs>(args?: SelectSubset<T, ProyectoFinanzasCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProyectoFinanzasPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ProyectoFinanzas.
     * @param {ProyectoFinanzasDeleteArgs} args - Arguments to delete one ProyectoFinanzas.
     * @example
     * // Delete one ProyectoFinanzas
     * const ProyectoFinanzas = await prisma.proyectoFinanzas.delete({
     *   where: {
     *     // ... filter to delete one ProyectoFinanzas
     *   }
     * })
     * 
     */
    delete<T extends ProyectoFinanzasDeleteArgs>(args: SelectSubset<T, ProyectoFinanzasDeleteArgs<ExtArgs>>): Prisma__ProyectoFinanzasClient<$Result.GetResult<Prisma.$ProyectoFinanzasPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ProyectoFinanzas.
     * @param {ProyectoFinanzasUpdateArgs} args - Arguments to update one ProyectoFinanzas.
     * @example
     * // Update one ProyectoFinanzas
     * const proyectoFinanzas = await prisma.proyectoFinanzas.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProyectoFinanzasUpdateArgs>(args: SelectSubset<T, ProyectoFinanzasUpdateArgs<ExtArgs>>): Prisma__ProyectoFinanzasClient<$Result.GetResult<Prisma.$ProyectoFinanzasPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ProyectoFinanzas.
     * @param {ProyectoFinanzasDeleteManyArgs} args - Arguments to filter ProyectoFinanzas to delete.
     * @example
     * // Delete a few ProyectoFinanzas
     * const { count } = await prisma.proyectoFinanzas.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProyectoFinanzasDeleteManyArgs>(args?: SelectSubset<T, ProyectoFinanzasDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ProyectoFinanzas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProyectoFinanzasUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ProyectoFinanzas
     * const proyectoFinanzas = await prisma.proyectoFinanzas.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProyectoFinanzasUpdateManyArgs>(args: SelectSubset<T, ProyectoFinanzasUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ProyectoFinanzas.
     * @param {ProyectoFinanzasUpsertArgs} args - Arguments to update or create a ProyectoFinanzas.
     * @example
     * // Update or create a ProyectoFinanzas
     * const proyectoFinanzas = await prisma.proyectoFinanzas.upsert({
     *   create: {
     *     // ... data to create a ProyectoFinanzas
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ProyectoFinanzas we want to update
     *   }
     * })
     */
    upsert<T extends ProyectoFinanzasUpsertArgs>(args: SelectSubset<T, ProyectoFinanzasUpsertArgs<ExtArgs>>): Prisma__ProyectoFinanzasClient<$Result.GetResult<Prisma.$ProyectoFinanzasPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ProyectoFinanzas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProyectoFinanzasCountArgs} args - Arguments to filter ProyectoFinanzas to count.
     * @example
     * // Count the number of ProyectoFinanzas
     * const count = await prisma.proyectoFinanzas.count({
     *   where: {
     *     // ... the filter for the ProyectoFinanzas we want to count
     *   }
     * })
    **/
    count<T extends ProyectoFinanzasCountArgs>(
      args?: Subset<T, ProyectoFinanzasCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProyectoFinanzasCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ProyectoFinanzas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProyectoFinanzasAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ProyectoFinanzasAggregateArgs>(args: Subset<T, ProyectoFinanzasAggregateArgs>): Prisma.PrismaPromise<GetProyectoFinanzasAggregateType<T>>

    /**
     * Group by ProyectoFinanzas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProyectoFinanzasGroupByArgs} args - Group by arguments.
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
      T extends ProyectoFinanzasGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProyectoFinanzasGroupByArgs['orderBy'] }
        : { orderBy?: ProyectoFinanzasGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ProyectoFinanzasGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProyectoFinanzasGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ProyectoFinanzas model
   */
  readonly fields: ProyectoFinanzasFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ProyectoFinanzas.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProyectoFinanzasClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the ProyectoFinanzas model
   */ 
  interface ProyectoFinanzasFieldRefs {
    readonly id_proyecto_finanzas: FieldRef<"ProyectoFinanzas", 'String'>
    readonly tenant_id: FieldRef<"ProyectoFinanzas", 'String'>
    readonly proyecto_id: FieldRef<"ProyectoFinanzas", 'String'>
    readonly anticipo_total: FieldRef<"ProyectoFinanzas", 'Decimal'>
    readonly anticipo_usado: FieldRef<"ProyectoFinanzas", 'Decimal'>
    readonly created_at: FieldRef<"ProyectoFinanzas", 'DateTime'>
    readonly updated_at: FieldRef<"ProyectoFinanzas", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ProyectoFinanzas findUnique
   */
  export type ProyectoFinanzasFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProyectoFinanzas
     */
    select?: ProyectoFinanzasSelect<ExtArgs> | null
    /**
     * Filter, which ProyectoFinanzas to fetch.
     */
    where: ProyectoFinanzasWhereUniqueInput
  }

  /**
   * ProyectoFinanzas findUniqueOrThrow
   */
  export type ProyectoFinanzasFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProyectoFinanzas
     */
    select?: ProyectoFinanzasSelect<ExtArgs> | null
    /**
     * Filter, which ProyectoFinanzas to fetch.
     */
    where: ProyectoFinanzasWhereUniqueInput
  }

  /**
   * ProyectoFinanzas findFirst
   */
  export type ProyectoFinanzasFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProyectoFinanzas
     */
    select?: ProyectoFinanzasSelect<ExtArgs> | null
    /**
     * Filter, which ProyectoFinanzas to fetch.
     */
    where?: ProyectoFinanzasWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProyectoFinanzas to fetch.
     */
    orderBy?: ProyectoFinanzasOrderByWithRelationInput | ProyectoFinanzasOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProyectoFinanzas.
     */
    cursor?: ProyectoFinanzasWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProyectoFinanzas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProyectoFinanzas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProyectoFinanzas.
     */
    distinct?: ProyectoFinanzasScalarFieldEnum | ProyectoFinanzasScalarFieldEnum[]
  }

  /**
   * ProyectoFinanzas findFirstOrThrow
   */
  export type ProyectoFinanzasFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProyectoFinanzas
     */
    select?: ProyectoFinanzasSelect<ExtArgs> | null
    /**
     * Filter, which ProyectoFinanzas to fetch.
     */
    where?: ProyectoFinanzasWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProyectoFinanzas to fetch.
     */
    orderBy?: ProyectoFinanzasOrderByWithRelationInput | ProyectoFinanzasOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProyectoFinanzas.
     */
    cursor?: ProyectoFinanzasWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProyectoFinanzas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProyectoFinanzas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProyectoFinanzas.
     */
    distinct?: ProyectoFinanzasScalarFieldEnum | ProyectoFinanzasScalarFieldEnum[]
  }

  /**
   * ProyectoFinanzas findMany
   */
  export type ProyectoFinanzasFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProyectoFinanzas
     */
    select?: ProyectoFinanzasSelect<ExtArgs> | null
    /**
     * Filter, which ProyectoFinanzas to fetch.
     */
    where?: ProyectoFinanzasWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProyectoFinanzas to fetch.
     */
    orderBy?: ProyectoFinanzasOrderByWithRelationInput | ProyectoFinanzasOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ProyectoFinanzas.
     */
    cursor?: ProyectoFinanzasWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProyectoFinanzas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProyectoFinanzas.
     */
    skip?: number
    distinct?: ProyectoFinanzasScalarFieldEnum | ProyectoFinanzasScalarFieldEnum[]
  }

  /**
   * ProyectoFinanzas create
   */
  export type ProyectoFinanzasCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProyectoFinanzas
     */
    select?: ProyectoFinanzasSelect<ExtArgs> | null
    /**
     * The data needed to create a ProyectoFinanzas.
     */
    data: XOR<ProyectoFinanzasCreateInput, ProyectoFinanzasUncheckedCreateInput>
  }

  /**
   * ProyectoFinanzas createMany
   */
  export type ProyectoFinanzasCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ProyectoFinanzas.
     */
    data: ProyectoFinanzasCreateManyInput | ProyectoFinanzasCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ProyectoFinanzas createManyAndReturn
   */
  export type ProyectoFinanzasCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProyectoFinanzas
     */
    select?: ProyectoFinanzasSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ProyectoFinanzas.
     */
    data: ProyectoFinanzasCreateManyInput | ProyectoFinanzasCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ProyectoFinanzas update
   */
  export type ProyectoFinanzasUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProyectoFinanzas
     */
    select?: ProyectoFinanzasSelect<ExtArgs> | null
    /**
     * The data needed to update a ProyectoFinanzas.
     */
    data: XOR<ProyectoFinanzasUpdateInput, ProyectoFinanzasUncheckedUpdateInput>
    /**
     * Choose, which ProyectoFinanzas to update.
     */
    where: ProyectoFinanzasWhereUniqueInput
  }

  /**
   * ProyectoFinanzas updateMany
   */
  export type ProyectoFinanzasUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ProyectoFinanzas.
     */
    data: XOR<ProyectoFinanzasUpdateManyMutationInput, ProyectoFinanzasUncheckedUpdateManyInput>
    /**
     * Filter which ProyectoFinanzas to update
     */
    where?: ProyectoFinanzasWhereInput
  }

  /**
   * ProyectoFinanzas upsert
   */
  export type ProyectoFinanzasUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProyectoFinanzas
     */
    select?: ProyectoFinanzasSelect<ExtArgs> | null
    /**
     * The filter to search for the ProyectoFinanzas to update in case it exists.
     */
    where: ProyectoFinanzasWhereUniqueInput
    /**
     * In case the ProyectoFinanzas found by the `where` argument doesn't exist, create a new ProyectoFinanzas with this data.
     */
    create: XOR<ProyectoFinanzasCreateInput, ProyectoFinanzasUncheckedCreateInput>
    /**
     * In case the ProyectoFinanzas was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProyectoFinanzasUpdateInput, ProyectoFinanzasUncheckedUpdateInput>
  }

  /**
   * ProyectoFinanzas delete
   */
  export type ProyectoFinanzasDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProyectoFinanzas
     */
    select?: ProyectoFinanzasSelect<ExtArgs> | null
    /**
     * Filter which ProyectoFinanzas to delete.
     */
    where: ProyectoFinanzasWhereUniqueInput
  }

  /**
   * ProyectoFinanzas deleteMany
   */
  export type ProyectoFinanzasDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProyectoFinanzas to delete
     */
    where?: ProyectoFinanzasWhereInput
  }

  /**
   * ProyectoFinanzas without action
   */
  export type ProyectoFinanzasDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProyectoFinanzas
     */
    select?: ProyectoFinanzasSelect<ExtArgs> | null
  }


  /**
   * Model PagoOC
   */

  export type AggregatePagoOC = {
    _count: PagoOCCountAggregateOutputType | null
    _avg: PagoOCAvgAggregateOutputType | null
    _sum: PagoOCSumAggregateOutputType | null
    _min: PagoOCMinAggregateOutputType | null
    _max: PagoOCMaxAggregateOutputType | null
  }

  export type PagoOCAvgAggregateOutputType = {
    monto_total: Decimal | null
  }

  export type PagoOCSumAggregateOutputType = {
    monto_total: Decimal | null
  }

  export type PagoOCMinAggregateOutputType = {
    id_pago: string | null
    tenant_id: string | null
    proyecto_id: string | null
    fuente: string | null
    cuenta_id: string | null
    tipo_pago: string | null
    referencia: string | null
    concepto: string | null
    fecha_pago: Date | null
    monto_total: Decimal | null
    moneda: string | null
    usuario_id: string | null
    created_at: Date | null
  }

  export type PagoOCMaxAggregateOutputType = {
    id_pago: string | null
    tenant_id: string | null
    proyecto_id: string | null
    fuente: string | null
    cuenta_id: string | null
    tipo_pago: string | null
    referencia: string | null
    concepto: string | null
    fecha_pago: Date | null
    monto_total: Decimal | null
    moneda: string | null
    usuario_id: string | null
    created_at: Date | null
  }

  export type PagoOCCountAggregateOutputType = {
    id_pago: number
    tenant_id: number
    proyecto_id: number
    fuente: number
    cuenta_id: number
    tipo_pago: number
    referencia: number
    concepto: number
    fecha_pago: number
    monto_total: number
    moneda: number
    usuario_id: number
    created_at: number
    _all: number
  }


  export type PagoOCAvgAggregateInputType = {
    monto_total?: true
  }

  export type PagoOCSumAggregateInputType = {
    monto_total?: true
  }

  export type PagoOCMinAggregateInputType = {
    id_pago?: true
    tenant_id?: true
    proyecto_id?: true
    fuente?: true
    cuenta_id?: true
    tipo_pago?: true
    referencia?: true
    concepto?: true
    fecha_pago?: true
    monto_total?: true
    moneda?: true
    usuario_id?: true
    created_at?: true
  }

  export type PagoOCMaxAggregateInputType = {
    id_pago?: true
    tenant_id?: true
    proyecto_id?: true
    fuente?: true
    cuenta_id?: true
    tipo_pago?: true
    referencia?: true
    concepto?: true
    fecha_pago?: true
    monto_total?: true
    moneda?: true
    usuario_id?: true
    created_at?: true
  }

  export type PagoOCCountAggregateInputType = {
    id_pago?: true
    tenant_id?: true
    proyecto_id?: true
    fuente?: true
    cuenta_id?: true
    tipo_pago?: true
    referencia?: true
    concepto?: true
    fecha_pago?: true
    monto_total?: true
    moneda?: true
    usuario_id?: true
    created_at?: true
    _all?: true
  }

  export type PagoOCAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PagoOC to aggregate.
     */
    where?: PagoOCWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PagoOCS to fetch.
     */
    orderBy?: PagoOCOrderByWithRelationInput | PagoOCOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PagoOCWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PagoOCS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PagoOCS.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PagoOCS
    **/
    _count?: true | PagoOCCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PagoOCAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PagoOCSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PagoOCMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PagoOCMaxAggregateInputType
  }

  export type GetPagoOCAggregateType<T extends PagoOCAggregateArgs> = {
        [P in keyof T & keyof AggregatePagoOC]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePagoOC[P]>
      : GetScalarType<T[P], AggregatePagoOC[P]>
  }




  export type PagoOCGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PagoOCWhereInput
    orderBy?: PagoOCOrderByWithAggregationInput | PagoOCOrderByWithAggregationInput[]
    by: PagoOCScalarFieldEnum[] | PagoOCScalarFieldEnum
    having?: PagoOCScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PagoOCCountAggregateInputType | true
    _avg?: PagoOCAvgAggregateInputType
    _sum?: PagoOCSumAggregateInputType
    _min?: PagoOCMinAggregateInputType
    _max?: PagoOCMaxAggregateInputType
  }

  export type PagoOCGroupByOutputType = {
    id_pago: string
    tenant_id: string
    proyecto_id: string
    fuente: string
    cuenta_id: string | null
    tipo_pago: string
    referencia: string
    concepto: string
    fecha_pago: Date
    monto_total: Decimal
    moneda: string
    usuario_id: string
    created_at: Date
    _count: PagoOCCountAggregateOutputType | null
    _avg: PagoOCAvgAggregateOutputType | null
    _sum: PagoOCSumAggregateOutputType | null
    _min: PagoOCMinAggregateOutputType | null
    _max: PagoOCMaxAggregateOutputType | null
  }

  type GetPagoOCGroupByPayload<T extends PagoOCGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PagoOCGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PagoOCGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PagoOCGroupByOutputType[P]>
            : GetScalarType<T[P], PagoOCGroupByOutputType[P]>
        }
      >
    >


  export type PagoOCSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_pago?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    fuente?: boolean
    cuenta_id?: boolean
    tipo_pago?: boolean
    referencia?: boolean
    concepto?: boolean
    fecha_pago?: boolean
    monto_total?: boolean
    moneda?: boolean
    usuario_id?: boolean
    created_at?: boolean
    cuenta?: boolean | PagoOC$cuentaArgs<ExtArgs>
    detalles?: boolean | PagoOC$detallesArgs<ExtArgs>
    _count?: boolean | PagoOCCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["pagoOC"]>

  export type PagoOCSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_pago?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    fuente?: boolean
    cuenta_id?: boolean
    tipo_pago?: boolean
    referencia?: boolean
    concepto?: boolean
    fecha_pago?: boolean
    monto_total?: boolean
    moneda?: boolean
    usuario_id?: boolean
    created_at?: boolean
    cuenta?: boolean | PagoOC$cuentaArgs<ExtArgs>
  }, ExtArgs["result"]["pagoOC"]>

  export type PagoOCSelectScalar = {
    id_pago?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    fuente?: boolean
    cuenta_id?: boolean
    tipo_pago?: boolean
    referencia?: boolean
    concepto?: boolean
    fecha_pago?: boolean
    monto_total?: boolean
    moneda?: boolean
    usuario_id?: boolean
    created_at?: boolean
  }

  export type PagoOCInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cuenta?: boolean | PagoOC$cuentaArgs<ExtArgs>
    detalles?: boolean | PagoOC$detallesArgs<ExtArgs>
    _count?: boolean | PagoOCCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type PagoOCIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cuenta?: boolean | PagoOC$cuentaArgs<ExtArgs>
  }

  export type $PagoOCPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PagoOC"
    objects: {
      cuenta: Prisma.$CuentaBancariaPayload<ExtArgs> | null
      detalles: Prisma.$DetallePagoOCPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id_pago: string
      tenant_id: string
      proyecto_id: string
      fuente: string
      cuenta_id: string | null
      tipo_pago: string
      referencia: string
      concepto: string
      fecha_pago: Date
      monto_total: Prisma.Decimal
      moneda: string
      usuario_id: string
      created_at: Date
    }, ExtArgs["result"]["pagoOC"]>
    composites: {}
  }

  type PagoOCGetPayload<S extends boolean | null | undefined | PagoOCDefaultArgs> = $Result.GetResult<Prisma.$PagoOCPayload, S>

  type PagoOCCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PagoOCFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PagoOCCountAggregateInputType | true
    }

  export interface PagoOCDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PagoOC'], meta: { name: 'PagoOC' } }
    /**
     * Find zero or one PagoOC that matches the filter.
     * @param {PagoOCFindUniqueArgs} args - Arguments to find a PagoOC
     * @example
     * // Get one PagoOC
     * const pagoOC = await prisma.pagoOC.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PagoOCFindUniqueArgs>(args: SelectSubset<T, PagoOCFindUniqueArgs<ExtArgs>>): Prisma__PagoOCClient<$Result.GetResult<Prisma.$PagoOCPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one PagoOC that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PagoOCFindUniqueOrThrowArgs} args - Arguments to find a PagoOC
     * @example
     * // Get one PagoOC
     * const pagoOC = await prisma.pagoOC.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PagoOCFindUniqueOrThrowArgs>(args: SelectSubset<T, PagoOCFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PagoOCClient<$Result.GetResult<Prisma.$PagoOCPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first PagoOC that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PagoOCFindFirstArgs} args - Arguments to find a PagoOC
     * @example
     * // Get one PagoOC
     * const pagoOC = await prisma.pagoOC.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PagoOCFindFirstArgs>(args?: SelectSubset<T, PagoOCFindFirstArgs<ExtArgs>>): Prisma__PagoOCClient<$Result.GetResult<Prisma.$PagoOCPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first PagoOC that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PagoOCFindFirstOrThrowArgs} args - Arguments to find a PagoOC
     * @example
     * // Get one PagoOC
     * const pagoOC = await prisma.pagoOC.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PagoOCFindFirstOrThrowArgs>(args?: SelectSubset<T, PagoOCFindFirstOrThrowArgs<ExtArgs>>): Prisma__PagoOCClient<$Result.GetResult<Prisma.$PagoOCPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more PagoOCS that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PagoOCFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PagoOCS
     * const pagoOCS = await prisma.pagoOC.findMany()
     * 
     * // Get first 10 PagoOCS
     * const pagoOCS = await prisma.pagoOC.findMany({ take: 10 })
     * 
     * // Only select the `id_pago`
     * const pagoOCWithId_pagoOnly = await prisma.pagoOC.findMany({ select: { id_pago: true } })
     * 
     */
    findMany<T extends PagoOCFindManyArgs>(args?: SelectSubset<T, PagoOCFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PagoOCPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a PagoOC.
     * @param {PagoOCCreateArgs} args - Arguments to create a PagoOC.
     * @example
     * // Create one PagoOC
     * const PagoOC = await prisma.pagoOC.create({
     *   data: {
     *     // ... data to create a PagoOC
     *   }
     * })
     * 
     */
    create<T extends PagoOCCreateArgs>(args: SelectSubset<T, PagoOCCreateArgs<ExtArgs>>): Prisma__PagoOCClient<$Result.GetResult<Prisma.$PagoOCPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many PagoOCS.
     * @param {PagoOCCreateManyArgs} args - Arguments to create many PagoOCS.
     * @example
     * // Create many PagoOCS
     * const pagoOC = await prisma.pagoOC.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PagoOCCreateManyArgs>(args?: SelectSubset<T, PagoOCCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PagoOCS and returns the data saved in the database.
     * @param {PagoOCCreateManyAndReturnArgs} args - Arguments to create many PagoOCS.
     * @example
     * // Create many PagoOCS
     * const pagoOC = await prisma.pagoOC.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PagoOCS and only return the `id_pago`
     * const pagoOCWithId_pagoOnly = await prisma.pagoOC.createManyAndReturn({ 
     *   select: { id_pago: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PagoOCCreateManyAndReturnArgs>(args?: SelectSubset<T, PagoOCCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PagoOCPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a PagoOC.
     * @param {PagoOCDeleteArgs} args - Arguments to delete one PagoOC.
     * @example
     * // Delete one PagoOC
     * const PagoOC = await prisma.pagoOC.delete({
     *   where: {
     *     // ... filter to delete one PagoOC
     *   }
     * })
     * 
     */
    delete<T extends PagoOCDeleteArgs>(args: SelectSubset<T, PagoOCDeleteArgs<ExtArgs>>): Prisma__PagoOCClient<$Result.GetResult<Prisma.$PagoOCPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one PagoOC.
     * @param {PagoOCUpdateArgs} args - Arguments to update one PagoOC.
     * @example
     * // Update one PagoOC
     * const pagoOC = await prisma.pagoOC.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PagoOCUpdateArgs>(args: SelectSubset<T, PagoOCUpdateArgs<ExtArgs>>): Prisma__PagoOCClient<$Result.GetResult<Prisma.$PagoOCPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more PagoOCS.
     * @param {PagoOCDeleteManyArgs} args - Arguments to filter PagoOCS to delete.
     * @example
     * // Delete a few PagoOCS
     * const { count } = await prisma.pagoOC.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PagoOCDeleteManyArgs>(args?: SelectSubset<T, PagoOCDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PagoOCS.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PagoOCUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PagoOCS
     * const pagoOC = await prisma.pagoOC.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PagoOCUpdateManyArgs>(args: SelectSubset<T, PagoOCUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PagoOC.
     * @param {PagoOCUpsertArgs} args - Arguments to update or create a PagoOC.
     * @example
     * // Update or create a PagoOC
     * const pagoOC = await prisma.pagoOC.upsert({
     *   create: {
     *     // ... data to create a PagoOC
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PagoOC we want to update
     *   }
     * })
     */
    upsert<T extends PagoOCUpsertArgs>(args: SelectSubset<T, PagoOCUpsertArgs<ExtArgs>>): Prisma__PagoOCClient<$Result.GetResult<Prisma.$PagoOCPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of PagoOCS.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PagoOCCountArgs} args - Arguments to filter PagoOCS to count.
     * @example
     * // Count the number of PagoOCS
     * const count = await prisma.pagoOC.count({
     *   where: {
     *     // ... the filter for the PagoOCS we want to count
     *   }
     * })
    **/
    count<T extends PagoOCCountArgs>(
      args?: Subset<T, PagoOCCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PagoOCCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PagoOC.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PagoOCAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends PagoOCAggregateArgs>(args: Subset<T, PagoOCAggregateArgs>): Prisma.PrismaPromise<GetPagoOCAggregateType<T>>

    /**
     * Group by PagoOC.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PagoOCGroupByArgs} args - Group by arguments.
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
      T extends PagoOCGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PagoOCGroupByArgs['orderBy'] }
        : { orderBy?: PagoOCGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, PagoOCGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPagoOCGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PagoOC model
   */
  readonly fields: PagoOCFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PagoOC.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PagoOCClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    cuenta<T extends PagoOC$cuentaArgs<ExtArgs> = {}>(args?: Subset<T, PagoOC$cuentaArgs<ExtArgs>>): Prisma__CuentaBancariaClient<$Result.GetResult<Prisma.$CuentaBancariaPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    detalles<T extends PagoOC$detallesArgs<ExtArgs> = {}>(args?: Subset<T, PagoOC$detallesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DetallePagoOCPayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the PagoOC model
   */ 
  interface PagoOCFieldRefs {
    readonly id_pago: FieldRef<"PagoOC", 'String'>
    readonly tenant_id: FieldRef<"PagoOC", 'String'>
    readonly proyecto_id: FieldRef<"PagoOC", 'String'>
    readonly fuente: FieldRef<"PagoOC", 'String'>
    readonly cuenta_id: FieldRef<"PagoOC", 'String'>
    readonly tipo_pago: FieldRef<"PagoOC", 'String'>
    readonly referencia: FieldRef<"PagoOC", 'String'>
    readonly concepto: FieldRef<"PagoOC", 'String'>
    readonly fecha_pago: FieldRef<"PagoOC", 'DateTime'>
    readonly monto_total: FieldRef<"PagoOC", 'Decimal'>
    readonly moneda: FieldRef<"PagoOC", 'String'>
    readonly usuario_id: FieldRef<"PagoOC", 'String'>
    readonly created_at: FieldRef<"PagoOC", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PagoOC findUnique
   */
  export type PagoOCFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PagoOC
     */
    select?: PagoOCSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PagoOCInclude<ExtArgs> | null
    /**
     * Filter, which PagoOC to fetch.
     */
    where: PagoOCWhereUniqueInput
  }

  /**
   * PagoOC findUniqueOrThrow
   */
  export type PagoOCFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PagoOC
     */
    select?: PagoOCSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PagoOCInclude<ExtArgs> | null
    /**
     * Filter, which PagoOC to fetch.
     */
    where: PagoOCWhereUniqueInput
  }

  /**
   * PagoOC findFirst
   */
  export type PagoOCFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PagoOC
     */
    select?: PagoOCSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PagoOCInclude<ExtArgs> | null
    /**
     * Filter, which PagoOC to fetch.
     */
    where?: PagoOCWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PagoOCS to fetch.
     */
    orderBy?: PagoOCOrderByWithRelationInput | PagoOCOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PagoOCS.
     */
    cursor?: PagoOCWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PagoOCS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PagoOCS.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PagoOCS.
     */
    distinct?: PagoOCScalarFieldEnum | PagoOCScalarFieldEnum[]
  }

  /**
   * PagoOC findFirstOrThrow
   */
  export type PagoOCFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PagoOC
     */
    select?: PagoOCSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PagoOCInclude<ExtArgs> | null
    /**
     * Filter, which PagoOC to fetch.
     */
    where?: PagoOCWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PagoOCS to fetch.
     */
    orderBy?: PagoOCOrderByWithRelationInput | PagoOCOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PagoOCS.
     */
    cursor?: PagoOCWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PagoOCS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PagoOCS.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PagoOCS.
     */
    distinct?: PagoOCScalarFieldEnum | PagoOCScalarFieldEnum[]
  }

  /**
   * PagoOC findMany
   */
  export type PagoOCFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PagoOC
     */
    select?: PagoOCSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PagoOCInclude<ExtArgs> | null
    /**
     * Filter, which PagoOCS to fetch.
     */
    where?: PagoOCWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PagoOCS to fetch.
     */
    orderBy?: PagoOCOrderByWithRelationInput | PagoOCOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PagoOCS.
     */
    cursor?: PagoOCWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PagoOCS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PagoOCS.
     */
    skip?: number
    distinct?: PagoOCScalarFieldEnum | PagoOCScalarFieldEnum[]
  }

  /**
   * PagoOC create
   */
  export type PagoOCCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PagoOC
     */
    select?: PagoOCSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PagoOCInclude<ExtArgs> | null
    /**
     * The data needed to create a PagoOC.
     */
    data: XOR<PagoOCCreateInput, PagoOCUncheckedCreateInput>
  }

  /**
   * PagoOC createMany
   */
  export type PagoOCCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PagoOCS.
     */
    data: PagoOCCreateManyInput | PagoOCCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PagoOC createManyAndReturn
   */
  export type PagoOCCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PagoOC
     */
    select?: PagoOCSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many PagoOCS.
     */
    data: PagoOCCreateManyInput | PagoOCCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PagoOCIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * PagoOC update
   */
  export type PagoOCUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PagoOC
     */
    select?: PagoOCSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PagoOCInclude<ExtArgs> | null
    /**
     * The data needed to update a PagoOC.
     */
    data: XOR<PagoOCUpdateInput, PagoOCUncheckedUpdateInput>
    /**
     * Choose, which PagoOC to update.
     */
    where: PagoOCWhereUniqueInput
  }

  /**
   * PagoOC updateMany
   */
  export type PagoOCUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PagoOCS.
     */
    data: XOR<PagoOCUpdateManyMutationInput, PagoOCUncheckedUpdateManyInput>
    /**
     * Filter which PagoOCS to update
     */
    where?: PagoOCWhereInput
  }

  /**
   * PagoOC upsert
   */
  export type PagoOCUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PagoOC
     */
    select?: PagoOCSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PagoOCInclude<ExtArgs> | null
    /**
     * The filter to search for the PagoOC to update in case it exists.
     */
    where: PagoOCWhereUniqueInput
    /**
     * In case the PagoOC found by the `where` argument doesn't exist, create a new PagoOC with this data.
     */
    create: XOR<PagoOCCreateInput, PagoOCUncheckedCreateInput>
    /**
     * In case the PagoOC was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PagoOCUpdateInput, PagoOCUncheckedUpdateInput>
  }

  /**
   * PagoOC delete
   */
  export type PagoOCDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PagoOC
     */
    select?: PagoOCSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PagoOCInclude<ExtArgs> | null
    /**
     * Filter which PagoOC to delete.
     */
    where: PagoOCWhereUniqueInput
  }

  /**
   * PagoOC deleteMany
   */
  export type PagoOCDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PagoOCS to delete
     */
    where?: PagoOCWhereInput
  }

  /**
   * PagoOC.cuenta
   */
  export type PagoOC$cuentaArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CuentaBancaria
     */
    select?: CuentaBancariaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CuentaBancariaInclude<ExtArgs> | null
    where?: CuentaBancariaWhereInput
  }

  /**
   * PagoOC.detalles
   */
  export type PagoOC$detallesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DetallePagoOC
     */
    select?: DetallePagoOCSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DetallePagoOCInclude<ExtArgs> | null
    where?: DetallePagoOCWhereInput
    orderBy?: DetallePagoOCOrderByWithRelationInput | DetallePagoOCOrderByWithRelationInput[]
    cursor?: DetallePagoOCWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DetallePagoOCScalarFieldEnum | DetallePagoOCScalarFieldEnum[]
  }

  /**
   * PagoOC without action
   */
  export type PagoOCDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PagoOC
     */
    select?: PagoOCSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PagoOCInclude<ExtArgs> | null
  }


  /**
   * Model DetallePagoOC
   */

  export type AggregateDetallePagoOC = {
    _count: DetallePagoOCCountAggregateOutputType | null
    _avg: DetallePagoOCAvgAggregateOutputType | null
    _sum: DetallePagoOCSumAggregateOutputType | null
    _min: DetallePagoOCMinAggregateOutputType | null
    _max: DetallePagoOCMaxAggregateOutputType | null
  }

  export type DetallePagoOCAvgAggregateOutputType = {
    monto_aplicado: Decimal | null
    saldo_oc_antes: Decimal | null
    saldo_oc_despues: Decimal | null
  }

  export type DetallePagoOCSumAggregateOutputType = {
    monto_aplicado: Decimal | null
    saldo_oc_antes: Decimal | null
    saldo_oc_despues: Decimal | null
  }

  export type DetallePagoOCMinAggregateOutputType = {
    id_detalle: string | null
    pago_id: string | null
    oc_id: string | null
    oc_codigo: string | null
    proveedor_id: string | null
    proveedor_nombre: string | null
    monto_aplicado: Decimal | null
    saldo_oc_antes: Decimal | null
    saldo_oc_despues: Decimal | null
  }

  export type DetallePagoOCMaxAggregateOutputType = {
    id_detalle: string | null
    pago_id: string | null
    oc_id: string | null
    oc_codigo: string | null
    proveedor_id: string | null
    proveedor_nombre: string | null
    monto_aplicado: Decimal | null
    saldo_oc_antes: Decimal | null
    saldo_oc_despues: Decimal | null
  }

  export type DetallePagoOCCountAggregateOutputType = {
    id_detalle: number
    pago_id: number
    oc_id: number
    oc_codigo: number
    proveedor_id: number
    proveedor_nombre: number
    monto_aplicado: number
    saldo_oc_antes: number
    saldo_oc_despues: number
    _all: number
  }


  export type DetallePagoOCAvgAggregateInputType = {
    monto_aplicado?: true
    saldo_oc_antes?: true
    saldo_oc_despues?: true
  }

  export type DetallePagoOCSumAggregateInputType = {
    monto_aplicado?: true
    saldo_oc_antes?: true
    saldo_oc_despues?: true
  }

  export type DetallePagoOCMinAggregateInputType = {
    id_detalle?: true
    pago_id?: true
    oc_id?: true
    oc_codigo?: true
    proveedor_id?: true
    proveedor_nombre?: true
    monto_aplicado?: true
    saldo_oc_antes?: true
    saldo_oc_despues?: true
  }

  export type DetallePagoOCMaxAggregateInputType = {
    id_detalle?: true
    pago_id?: true
    oc_id?: true
    oc_codigo?: true
    proveedor_id?: true
    proveedor_nombre?: true
    monto_aplicado?: true
    saldo_oc_antes?: true
    saldo_oc_despues?: true
  }

  export type DetallePagoOCCountAggregateInputType = {
    id_detalle?: true
    pago_id?: true
    oc_id?: true
    oc_codigo?: true
    proveedor_id?: true
    proveedor_nombre?: true
    monto_aplicado?: true
    saldo_oc_antes?: true
    saldo_oc_despues?: true
    _all?: true
  }

  export type DetallePagoOCAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DetallePagoOC to aggregate.
     */
    where?: DetallePagoOCWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DetallePagoOCS to fetch.
     */
    orderBy?: DetallePagoOCOrderByWithRelationInput | DetallePagoOCOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DetallePagoOCWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DetallePagoOCS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DetallePagoOCS.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DetallePagoOCS
    **/
    _count?: true | DetallePagoOCCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DetallePagoOCAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DetallePagoOCSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DetallePagoOCMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DetallePagoOCMaxAggregateInputType
  }

  export type GetDetallePagoOCAggregateType<T extends DetallePagoOCAggregateArgs> = {
        [P in keyof T & keyof AggregateDetallePagoOC]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDetallePagoOC[P]>
      : GetScalarType<T[P], AggregateDetallePagoOC[P]>
  }




  export type DetallePagoOCGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DetallePagoOCWhereInput
    orderBy?: DetallePagoOCOrderByWithAggregationInput | DetallePagoOCOrderByWithAggregationInput[]
    by: DetallePagoOCScalarFieldEnum[] | DetallePagoOCScalarFieldEnum
    having?: DetallePagoOCScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DetallePagoOCCountAggregateInputType | true
    _avg?: DetallePagoOCAvgAggregateInputType
    _sum?: DetallePagoOCSumAggregateInputType
    _min?: DetallePagoOCMinAggregateInputType
    _max?: DetallePagoOCMaxAggregateInputType
  }

  export type DetallePagoOCGroupByOutputType = {
    id_detalle: string
    pago_id: string
    oc_id: string
    oc_codigo: string
    proveedor_id: string
    proveedor_nombre: string
    monto_aplicado: Decimal
    saldo_oc_antes: Decimal
    saldo_oc_despues: Decimal
    _count: DetallePagoOCCountAggregateOutputType | null
    _avg: DetallePagoOCAvgAggregateOutputType | null
    _sum: DetallePagoOCSumAggregateOutputType | null
    _min: DetallePagoOCMinAggregateOutputType | null
    _max: DetallePagoOCMaxAggregateOutputType | null
  }

  type GetDetallePagoOCGroupByPayload<T extends DetallePagoOCGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DetallePagoOCGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DetallePagoOCGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DetallePagoOCGroupByOutputType[P]>
            : GetScalarType<T[P], DetallePagoOCGroupByOutputType[P]>
        }
      >
    >


  export type DetallePagoOCSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_detalle?: boolean
    pago_id?: boolean
    oc_id?: boolean
    oc_codigo?: boolean
    proveedor_id?: boolean
    proveedor_nombre?: boolean
    monto_aplicado?: boolean
    saldo_oc_antes?: boolean
    saldo_oc_despues?: boolean
    pago?: boolean | PagoOCDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["detallePagoOC"]>

  export type DetallePagoOCSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_detalle?: boolean
    pago_id?: boolean
    oc_id?: boolean
    oc_codigo?: boolean
    proveedor_id?: boolean
    proveedor_nombre?: boolean
    monto_aplicado?: boolean
    saldo_oc_antes?: boolean
    saldo_oc_despues?: boolean
    pago?: boolean | PagoOCDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["detallePagoOC"]>

  export type DetallePagoOCSelectScalar = {
    id_detalle?: boolean
    pago_id?: boolean
    oc_id?: boolean
    oc_codigo?: boolean
    proveedor_id?: boolean
    proveedor_nombre?: boolean
    monto_aplicado?: boolean
    saldo_oc_antes?: boolean
    saldo_oc_despues?: boolean
  }

  export type DetallePagoOCInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    pago?: boolean | PagoOCDefaultArgs<ExtArgs>
  }
  export type DetallePagoOCIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    pago?: boolean | PagoOCDefaultArgs<ExtArgs>
  }

  export type $DetallePagoOCPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DetallePagoOC"
    objects: {
      pago: Prisma.$PagoOCPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id_detalle: string
      pago_id: string
      oc_id: string
      oc_codigo: string
      proveedor_id: string
      proveedor_nombre: string
      monto_aplicado: Prisma.Decimal
      saldo_oc_antes: Prisma.Decimal
      saldo_oc_despues: Prisma.Decimal
    }, ExtArgs["result"]["detallePagoOC"]>
    composites: {}
  }

  type DetallePagoOCGetPayload<S extends boolean | null | undefined | DetallePagoOCDefaultArgs> = $Result.GetResult<Prisma.$DetallePagoOCPayload, S>

  type DetallePagoOCCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<DetallePagoOCFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: DetallePagoOCCountAggregateInputType | true
    }

  export interface DetallePagoOCDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DetallePagoOC'], meta: { name: 'DetallePagoOC' } }
    /**
     * Find zero or one DetallePagoOC that matches the filter.
     * @param {DetallePagoOCFindUniqueArgs} args - Arguments to find a DetallePagoOC
     * @example
     * // Get one DetallePagoOC
     * const detallePagoOC = await prisma.detallePagoOC.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DetallePagoOCFindUniqueArgs>(args: SelectSubset<T, DetallePagoOCFindUniqueArgs<ExtArgs>>): Prisma__DetallePagoOCClient<$Result.GetResult<Prisma.$DetallePagoOCPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one DetallePagoOC that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {DetallePagoOCFindUniqueOrThrowArgs} args - Arguments to find a DetallePagoOC
     * @example
     * // Get one DetallePagoOC
     * const detallePagoOC = await prisma.detallePagoOC.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DetallePagoOCFindUniqueOrThrowArgs>(args: SelectSubset<T, DetallePagoOCFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DetallePagoOCClient<$Result.GetResult<Prisma.$DetallePagoOCPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first DetallePagoOC that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DetallePagoOCFindFirstArgs} args - Arguments to find a DetallePagoOC
     * @example
     * // Get one DetallePagoOC
     * const detallePagoOC = await prisma.detallePagoOC.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DetallePagoOCFindFirstArgs>(args?: SelectSubset<T, DetallePagoOCFindFirstArgs<ExtArgs>>): Prisma__DetallePagoOCClient<$Result.GetResult<Prisma.$DetallePagoOCPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first DetallePagoOC that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DetallePagoOCFindFirstOrThrowArgs} args - Arguments to find a DetallePagoOC
     * @example
     * // Get one DetallePagoOC
     * const detallePagoOC = await prisma.detallePagoOC.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DetallePagoOCFindFirstOrThrowArgs>(args?: SelectSubset<T, DetallePagoOCFindFirstOrThrowArgs<ExtArgs>>): Prisma__DetallePagoOCClient<$Result.GetResult<Prisma.$DetallePagoOCPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more DetallePagoOCS that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DetallePagoOCFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DetallePagoOCS
     * const detallePagoOCS = await prisma.detallePagoOC.findMany()
     * 
     * // Get first 10 DetallePagoOCS
     * const detallePagoOCS = await prisma.detallePagoOC.findMany({ take: 10 })
     * 
     * // Only select the `id_detalle`
     * const detallePagoOCWithId_detalleOnly = await prisma.detallePagoOC.findMany({ select: { id_detalle: true } })
     * 
     */
    findMany<T extends DetallePagoOCFindManyArgs>(args?: SelectSubset<T, DetallePagoOCFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DetallePagoOCPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a DetallePagoOC.
     * @param {DetallePagoOCCreateArgs} args - Arguments to create a DetallePagoOC.
     * @example
     * // Create one DetallePagoOC
     * const DetallePagoOC = await prisma.detallePagoOC.create({
     *   data: {
     *     // ... data to create a DetallePagoOC
     *   }
     * })
     * 
     */
    create<T extends DetallePagoOCCreateArgs>(args: SelectSubset<T, DetallePagoOCCreateArgs<ExtArgs>>): Prisma__DetallePagoOCClient<$Result.GetResult<Prisma.$DetallePagoOCPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many DetallePagoOCS.
     * @param {DetallePagoOCCreateManyArgs} args - Arguments to create many DetallePagoOCS.
     * @example
     * // Create many DetallePagoOCS
     * const detallePagoOC = await prisma.detallePagoOC.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DetallePagoOCCreateManyArgs>(args?: SelectSubset<T, DetallePagoOCCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DetallePagoOCS and returns the data saved in the database.
     * @param {DetallePagoOCCreateManyAndReturnArgs} args - Arguments to create many DetallePagoOCS.
     * @example
     * // Create many DetallePagoOCS
     * const detallePagoOC = await prisma.detallePagoOC.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many DetallePagoOCS and only return the `id_detalle`
     * const detallePagoOCWithId_detalleOnly = await prisma.detallePagoOC.createManyAndReturn({ 
     *   select: { id_detalle: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DetallePagoOCCreateManyAndReturnArgs>(args?: SelectSubset<T, DetallePagoOCCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DetallePagoOCPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a DetallePagoOC.
     * @param {DetallePagoOCDeleteArgs} args - Arguments to delete one DetallePagoOC.
     * @example
     * // Delete one DetallePagoOC
     * const DetallePagoOC = await prisma.detallePagoOC.delete({
     *   where: {
     *     // ... filter to delete one DetallePagoOC
     *   }
     * })
     * 
     */
    delete<T extends DetallePagoOCDeleteArgs>(args: SelectSubset<T, DetallePagoOCDeleteArgs<ExtArgs>>): Prisma__DetallePagoOCClient<$Result.GetResult<Prisma.$DetallePagoOCPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one DetallePagoOC.
     * @param {DetallePagoOCUpdateArgs} args - Arguments to update one DetallePagoOC.
     * @example
     * // Update one DetallePagoOC
     * const detallePagoOC = await prisma.detallePagoOC.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DetallePagoOCUpdateArgs>(args: SelectSubset<T, DetallePagoOCUpdateArgs<ExtArgs>>): Prisma__DetallePagoOCClient<$Result.GetResult<Prisma.$DetallePagoOCPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more DetallePagoOCS.
     * @param {DetallePagoOCDeleteManyArgs} args - Arguments to filter DetallePagoOCS to delete.
     * @example
     * // Delete a few DetallePagoOCS
     * const { count } = await prisma.detallePagoOC.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DetallePagoOCDeleteManyArgs>(args?: SelectSubset<T, DetallePagoOCDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DetallePagoOCS.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DetallePagoOCUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DetallePagoOCS
     * const detallePagoOC = await prisma.detallePagoOC.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DetallePagoOCUpdateManyArgs>(args: SelectSubset<T, DetallePagoOCUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one DetallePagoOC.
     * @param {DetallePagoOCUpsertArgs} args - Arguments to update or create a DetallePagoOC.
     * @example
     * // Update or create a DetallePagoOC
     * const detallePagoOC = await prisma.detallePagoOC.upsert({
     *   create: {
     *     // ... data to create a DetallePagoOC
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DetallePagoOC we want to update
     *   }
     * })
     */
    upsert<T extends DetallePagoOCUpsertArgs>(args: SelectSubset<T, DetallePagoOCUpsertArgs<ExtArgs>>): Prisma__DetallePagoOCClient<$Result.GetResult<Prisma.$DetallePagoOCPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of DetallePagoOCS.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DetallePagoOCCountArgs} args - Arguments to filter DetallePagoOCS to count.
     * @example
     * // Count the number of DetallePagoOCS
     * const count = await prisma.detallePagoOC.count({
     *   where: {
     *     // ... the filter for the DetallePagoOCS we want to count
     *   }
     * })
    **/
    count<T extends DetallePagoOCCountArgs>(
      args?: Subset<T, DetallePagoOCCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DetallePagoOCCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DetallePagoOC.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DetallePagoOCAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends DetallePagoOCAggregateArgs>(args: Subset<T, DetallePagoOCAggregateArgs>): Prisma.PrismaPromise<GetDetallePagoOCAggregateType<T>>

    /**
     * Group by DetallePagoOC.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DetallePagoOCGroupByArgs} args - Group by arguments.
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
      T extends DetallePagoOCGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DetallePagoOCGroupByArgs['orderBy'] }
        : { orderBy?: DetallePagoOCGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, DetallePagoOCGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDetallePagoOCGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DetallePagoOC model
   */
  readonly fields: DetallePagoOCFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DetallePagoOC.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DetallePagoOCClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    pago<T extends PagoOCDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PagoOCDefaultArgs<ExtArgs>>): Prisma__PagoOCClient<$Result.GetResult<Prisma.$PagoOCPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
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
   * Fields of the DetallePagoOC model
   */ 
  interface DetallePagoOCFieldRefs {
    readonly id_detalle: FieldRef<"DetallePagoOC", 'String'>
    readonly pago_id: FieldRef<"DetallePagoOC", 'String'>
    readonly oc_id: FieldRef<"DetallePagoOC", 'String'>
    readonly oc_codigo: FieldRef<"DetallePagoOC", 'String'>
    readonly proveedor_id: FieldRef<"DetallePagoOC", 'String'>
    readonly proveedor_nombre: FieldRef<"DetallePagoOC", 'String'>
    readonly monto_aplicado: FieldRef<"DetallePagoOC", 'Decimal'>
    readonly saldo_oc_antes: FieldRef<"DetallePagoOC", 'Decimal'>
    readonly saldo_oc_despues: FieldRef<"DetallePagoOC", 'Decimal'>
  }
    

  // Custom InputTypes
  /**
   * DetallePagoOC findUnique
   */
  export type DetallePagoOCFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DetallePagoOC
     */
    select?: DetallePagoOCSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DetallePagoOCInclude<ExtArgs> | null
    /**
     * Filter, which DetallePagoOC to fetch.
     */
    where: DetallePagoOCWhereUniqueInput
  }

  /**
   * DetallePagoOC findUniqueOrThrow
   */
  export type DetallePagoOCFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DetallePagoOC
     */
    select?: DetallePagoOCSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DetallePagoOCInclude<ExtArgs> | null
    /**
     * Filter, which DetallePagoOC to fetch.
     */
    where: DetallePagoOCWhereUniqueInput
  }

  /**
   * DetallePagoOC findFirst
   */
  export type DetallePagoOCFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DetallePagoOC
     */
    select?: DetallePagoOCSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DetallePagoOCInclude<ExtArgs> | null
    /**
     * Filter, which DetallePagoOC to fetch.
     */
    where?: DetallePagoOCWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DetallePagoOCS to fetch.
     */
    orderBy?: DetallePagoOCOrderByWithRelationInput | DetallePagoOCOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DetallePagoOCS.
     */
    cursor?: DetallePagoOCWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DetallePagoOCS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DetallePagoOCS.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DetallePagoOCS.
     */
    distinct?: DetallePagoOCScalarFieldEnum | DetallePagoOCScalarFieldEnum[]
  }

  /**
   * DetallePagoOC findFirstOrThrow
   */
  export type DetallePagoOCFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DetallePagoOC
     */
    select?: DetallePagoOCSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DetallePagoOCInclude<ExtArgs> | null
    /**
     * Filter, which DetallePagoOC to fetch.
     */
    where?: DetallePagoOCWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DetallePagoOCS to fetch.
     */
    orderBy?: DetallePagoOCOrderByWithRelationInput | DetallePagoOCOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DetallePagoOCS.
     */
    cursor?: DetallePagoOCWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DetallePagoOCS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DetallePagoOCS.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DetallePagoOCS.
     */
    distinct?: DetallePagoOCScalarFieldEnum | DetallePagoOCScalarFieldEnum[]
  }

  /**
   * DetallePagoOC findMany
   */
  export type DetallePagoOCFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DetallePagoOC
     */
    select?: DetallePagoOCSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DetallePagoOCInclude<ExtArgs> | null
    /**
     * Filter, which DetallePagoOCS to fetch.
     */
    where?: DetallePagoOCWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DetallePagoOCS to fetch.
     */
    orderBy?: DetallePagoOCOrderByWithRelationInput | DetallePagoOCOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DetallePagoOCS.
     */
    cursor?: DetallePagoOCWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DetallePagoOCS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DetallePagoOCS.
     */
    skip?: number
    distinct?: DetallePagoOCScalarFieldEnum | DetallePagoOCScalarFieldEnum[]
  }

  /**
   * DetallePagoOC create
   */
  export type DetallePagoOCCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DetallePagoOC
     */
    select?: DetallePagoOCSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DetallePagoOCInclude<ExtArgs> | null
    /**
     * The data needed to create a DetallePagoOC.
     */
    data: XOR<DetallePagoOCCreateInput, DetallePagoOCUncheckedCreateInput>
  }

  /**
   * DetallePagoOC createMany
   */
  export type DetallePagoOCCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DetallePagoOCS.
     */
    data: DetallePagoOCCreateManyInput | DetallePagoOCCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DetallePagoOC createManyAndReturn
   */
  export type DetallePagoOCCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DetallePagoOC
     */
    select?: DetallePagoOCSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many DetallePagoOCS.
     */
    data: DetallePagoOCCreateManyInput | DetallePagoOCCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DetallePagoOCIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * DetallePagoOC update
   */
  export type DetallePagoOCUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DetallePagoOC
     */
    select?: DetallePagoOCSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DetallePagoOCInclude<ExtArgs> | null
    /**
     * The data needed to update a DetallePagoOC.
     */
    data: XOR<DetallePagoOCUpdateInput, DetallePagoOCUncheckedUpdateInput>
    /**
     * Choose, which DetallePagoOC to update.
     */
    where: DetallePagoOCWhereUniqueInput
  }

  /**
   * DetallePagoOC updateMany
   */
  export type DetallePagoOCUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DetallePagoOCS.
     */
    data: XOR<DetallePagoOCUpdateManyMutationInput, DetallePagoOCUncheckedUpdateManyInput>
    /**
     * Filter which DetallePagoOCS to update
     */
    where?: DetallePagoOCWhereInput
  }

  /**
   * DetallePagoOC upsert
   */
  export type DetallePagoOCUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DetallePagoOC
     */
    select?: DetallePagoOCSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DetallePagoOCInclude<ExtArgs> | null
    /**
     * The filter to search for the DetallePagoOC to update in case it exists.
     */
    where: DetallePagoOCWhereUniqueInput
    /**
     * In case the DetallePagoOC found by the `where` argument doesn't exist, create a new DetallePagoOC with this data.
     */
    create: XOR<DetallePagoOCCreateInput, DetallePagoOCUncheckedCreateInput>
    /**
     * In case the DetallePagoOC was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DetallePagoOCUpdateInput, DetallePagoOCUncheckedUpdateInput>
  }

  /**
   * DetallePagoOC delete
   */
  export type DetallePagoOCDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DetallePagoOC
     */
    select?: DetallePagoOCSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DetallePagoOCInclude<ExtArgs> | null
    /**
     * Filter which DetallePagoOC to delete.
     */
    where: DetallePagoOCWhereUniqueInput
  }

  /**
   * DetallePagoOC deleteMany
   */
  export type DetallePagoOCDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DetallePagoOCS to delete
     */
    where?: DetallePagoOCWhereInput
  }

  /**
   * DetallePagoOC without action
   */
  export type DetallePagoOCDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DetallePagoOC
     */
    select?: DetallePagoOCSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DetallePagoOCInclude<ExtArgs> | null
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


  export const PresupuestoAsignadoScalarFieldEnum: {
    id_presupuesto: 'id_presupuesto',
    tenant_id: 'tenant_id',
    proyecto_id: 'proyecto_id',
    codigo: 'codigo',
    descripcion: 'descripcion',
    monto_autorizado: 'monto_autorizado',
    monto_ejercido: 'monto_ejercido',
    monto_comprometido: 'monto_comprometido',
    monto_disponible: 'monto_disponible',
    moneda: 'moneda',
    capitulo: 'capitulo',
    estatus: 'estatus',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type PresupuestoAsignadoScalarFieldEnum = (typeof PresupuestoAsignadoScalarFieldEnum)[keyof typeof PresupuestoAsignadoScalarFieldEnum]


  export const MovimientoPresupuestalScalarFieldEnum: {
    id_movimiento: 'id_movimiento',
    tenant_id: 'tenant_id',
    proyecto_id: 'proyecto_id',
    presupuesto_id: 'presupuesto_id',
    tipo: 'tipo',
    concepto: 'concepto',
    monto: 'monto',
    moneda: 'moneda',
    referencia_modulo: 'referencia_modulo',
    referencia_entidad: 'referencia_entidad',
    referencia_id: 'referencia_id',
    referencia_codigo: 'referencia_codigo',
    usuario_id: 'usuario_id',
    fecha_registro: 'fecha_registro',
    notas: 'notas'
  };

  export type MovimientoPresupuestalScalarFieldEnum = (typeof MovimientoPresupuestalScalarFieldEnum)[keyof typeof MovimientoPresupuestalScalarFieldEnum]


  export const ProgramaPagosScalarFieldEnum: {
    id_pago: 'id_pago',
    tenant_id: 'tenant_id',
    proyecto_id: 'proyecto_id',
    presupuesto_id: 'presupuesto_id',
    concepto: 'concepto',
    beneficiario: 'beneficiario',
    beneficiario_id: 'beneficiario_id',
    monto_programado: 'monto_programado',
    monto_pagado: 'monto_pagado',
    moneda: 'moneda',
    fecha_programada: 'fecha_programada',
    fecha_pago_real: 'fecha_pago_real',
    estado: 'estado',
    referencia_modulo: 'referencia_modulo',
    referencia_entidad: 'referencia_entidad',
    referencia_id: 'referencia_id',
    metodo_pago: 'metodo_pago',
    banco: 'banco',
    referencia_bancaria: 'referencia_bancaria',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type ProgramaPagosScalarFieldEnum = (typeof ProgramaPagosScalarFieldEnum)[keyof typeof ProgramaPagosScalarFieldEnum]


  export const CuentaBancariaScalarFieldEnum: {
    id_cuenta: 'id_cuenta',
    tenant_id: 'tenant_id',
    proyecto_id: 'proyecto_id',
    banco: 'banco',
    numero_cuenta: 'numero_cuenta',
    clabe: 'clabe',
    alias: 'alias',
    moneda: 'moneda',
    saldo: 'saldo',
    activa: 'activa',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type CuentaBancariaScalarFieldEnum = (typeof CuentaBancariaScalarFieldEnum)[keyof typeof CuentaBancariaScalarFieldEnum]


  export const ProyectoFinanzasScalarFieldEnum: {
    id_proyecto_finanzas: 'id_proyecto_finanzas',
    tenant_id: 'tenant_id',
    proyecto_id: 'proyecto_id',
    anticipo_total: 'anticipo_total',
    anticipo_usado: 'anticipo_usado',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type ProyectoFinanzasScalarFieldEnum = (typeof ProyectoFinanzasScalarFieldEnum)[keyof typeof ProyectoFinanzasScalarFieldEnum]


  export const PagoOCScalarFieldEnum: {
    id_pago: 'id_pago',
    tenant_id: 'tenant_id',
    proyecto_id: 'proyecto_id',
    fuente: 'fuente',
    cuenta_id: 'cuenta_id',
    tipo_pago: 'tipo_pago',
    referencia: 'referencia',
    concepto: 'concepto',
    fecha_pago: 'fecha_pago',
    monto_total: 'monto_total',
    moneda: 'moneda',
    usuario_id: 'usuario_id',
    created_at: 'created_at'
  };

  export type PagoOCScalarFieldEnum = (typeof PagoOCScalarFieldEnum)[keyof typeof PagoOCScalarFieldEnum]


  export const DetallePagoOCScalarFieldEnum: {
    id_detalle: 'id_detalle',
    pago_id: 'pago_id',
    oc_id: 'oc_id',
    oc_codigo: 'oc_codigo',
    proveedor_id: 'proveedor_id',
    proveedor_nombre: 'proveedor_nombre',
    monto_aplicado: 'monto_aplicado',
    saldo_oc_antes: 'saldo_oc_antes',
    saldo_oc_despues: 'saldo_oc_despues'
  };

  export type DetallePagoOCScalarFieldEnum = (typeof DetallePagoOCScalarFieldEnum)[keyof typeof DetallePagoOCScalarFieldEnum]


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


  export type PresupuestoAsignadoWhereInput = {
    AND?: PresupuestoAsignadoWhereInput | PresupuestoAsignadoWhereInput[]
    OR?: PresupuestoAsignadoWhereInput[]
    NOT?: PresupuestoAsignadoWhereInput | PresupuestoAsignadoWhereInput[]
    id_presupuesto?: UuidFilter<"PresupuestoAsignado"> | string
    tenant_id?: UuidFilter<"PresupuestoAsignado"> | string
    proyecto_id?: UuidFilter<"PresupuestoAsignado"> | string
    codigo?: StringFilter<"PresupuestoAsignado"> | string
    descripcion?: StringFilter<"PresupuestoAsignado"> | string
    monto_autorizado?: DecimalFilter<"PresupuestoAsignado"> | Decimal | DecimalJsLike | number | string
    monto_ejercido?: DecimalFilter<"PresupuestoAsignado"> | Decimal | DecimalJsLike | number | string
    monto_comprometido?: DecimalFilter<"PresupuestoAsignado"> | Decimal | DecimalJsLike | number | string
    monto_disponible?: DecimalFilter<"PresupuestoAsignado"> | Decimal | DecimalJsLike | number | string
    moneda?: StringFilter<"PresupuestoAsignado"> | string
    capitulo?: StringFilter<"PresupuestoAsignado"> | string
    estatus?: StringFilter<"PresupuestoAsignado"> | string
    created_at?: DateTimeFilter<"PresupuestoAsignado"> | Date | string
    updated_at?: DateTimeFilter<"PresupuestoAsignado"> | Date | string
    movimientos?: MovimientoPresupuestalListRelationFilter
    programa_pagos?: ProgramaPagosListRelationFilter
  }

  export type PresupuestoAsignadoOrderByWithRelationInput = {
    id_presupuesto?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    codigo?: SortOrder
    descripcion?: SortOrder
    monto_autorizado?: SortOrder
    monto_ejercido?: SortOrder
    monto_comprometido?: SortOrder
    monto_disponible?: SortOrder
    moneda?: SortOrder
    capitulo?: SortOrder
    estatus?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    movimientos?: MovimientoPresupuestalOrderByRelationAggregateInput
    programa_pagos?: ProgramaPagosOrderByRelationAggregateInput
  }

  export type PresupuestoAsignadoWhereUniqueInput = Prisma.AtLeast<{
    id_presupuesto?: string
    tenant_id_proyecto_id_codigo?: PresupuestoAsignadoTenant_idProyecto_idCodigoCompoundUniqueInput
    AND?: PresupuestoAsignadoWhereInput | PresupuestoAsignadoWhereInput[]
    OR?: PresupuestoAsignadoWhereInput[]
    NOT?: PresupuestoAsignadoWhereInput | PresupuestoAsignadoWhereInput[]
    tenant_id?: UuidFilter<"PresupuestoAsignado"> | string
    proyecto_id?: UuidFilter<"PresupuestoAsignado"> | string
    codigo?: StringFilter<"PresupuestoAsignado"> | string
    descripcion?: StringFilter<"PresupuestoAsignado"> | string
    monto_autorizado?: DecimalFilter<"PresupuestoAsignado"> | Decimal | DecimalJsLike | number | string
    monto_ejercido?: DecimalFilter<"PresupuestoAsignado"> | Decimal | DecimalJsLike | number | string
    monto_comprometido?: DecimalFilter<"PresupuestoAsignado"> | Decimal | DecimalJsLike | number | string
    monto_disponible?: DecimalFilter<"PresupuestoAsignado"> | Decimal | DecimalJsLike | number | string
    moneda?: StringFilter<"PresupuestoAsignado"> | string
    capitulo?: StringFilter<"PresupuestoAsignado"> | string
    estatus?: StringFilter<"PresupuestoAsignado"> | string
    created_at?: DateTimeFilter<"PresupuestoAsignado"> | Date | string
    updated_at?: DateTimeFilter<"PresupuestoAsignado"> | Date | string
    movimientos?: MovimientoPresupuestalListRelationFilter
    programa_pagos?: ProgramaPagosListRelationFilter
  }, "id_presupuesto" | "tenant_id_proyecto_id_codigo">

  export type PresupuestoAsignadoOrderByWithAggregationInput = {
    id_presupuesto?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    codigo?: SortOrder
    descripcion?: SortOrder
    monto_autorizado?: SortOrder
    monto_ejercido?: SortOrder
    monto_comprometido?: SortOrder
    monto_disponible?: SortOrder
    moneda?: SortOrder
    capitulo?: SortOrder
    estatus?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: PresupuestoAsignadoCountOrderByAggregateInput
    _avg?: PresupuestoAsignadoAvgOrderByAggregateInput
    _max?: PresupuestoAsignadoMaxOrderByAggregateInput
    _min?: PresupuestoAsignadoMinOrderByAggregateInput
    _sum?: PresupuestoAsignadoSumOrderByAggregateInput
  }

  export type PresupuestoAsignadoScalarWhereWithAggregatesInput = {
    AND?: PresupuestoAsignadoScalarWhereWithAggregatesInput | PresupuestoAsignadoScalarWhereWithAggregatesInput[]
    OR?: PresupuestoAsignadoScalarWhereWithAggregatesInput[]
    NOT?: PresupuestoAsignadoScalarWhereWithAggregatesInput | PresupuestoAsignadoScalarWhereWithAggregatesInput[]
    id_presupuesto?: UuidWithAggregatesFilter<"PresupuestoAsignado"> | string
    tenant_id?: UuidWithAggregatesFilter<"PresupuestoAsignado"> | string
    proyecto_id?: UuidWithAggregatesFilter<"PresupuestoAsignado"> | string
    codigo?: StringWithAggregatesFilter<"PresupuestoAsignado"> | string
    descripcion?: StringWithAggregatesFilter<"PresupuestoAsignado"> | string
    monto_autorizado?: DecimalWithAggregatesFilter<"PresupuestoAsignado"> | Decimal | DecimalJsLike | number | string
    monto_ejercido?: DecimalWithAggregatesFilter<"PresupuestoAsignado"> | Decimal | DecimalJsLike | number | string
    monto_comprometido?: DecimalWithAggregatesFilter<"PresupuestoAsignado"> | Decimal | DecimalJsLike | number | string
    monto_disponible?: DecimalWithAggregatesFilter<"PresupuestoAsignado"> | Decimal | DecimalJsLike | number | string
    moneda?: StringWithAggregatesFilter<"PresupuestoAsignado"> | string
    capitulo?: StringWithAggregatesFilter<"PresupuestoAsignado"> | string
    estatus?: StringWithAggregatesFilter<"PresupuestoAsignado"> | string
    created_at?: DateTimeWithAggregatesFilter<"PresupuestoAsignado"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"PresupuestoAsignado"> | Date | string
  }

  export type MovimientoPresupuestalWhereInput = {
    AND?: MovimientoPresupuestalWhereInput | MovimientoPresupuestalWhereInput[]
    OR?: MovimientoPresupuestalWhereInput[]
    NOT?: MovimientoPresupuestalWhereInput | MovimientoPresupuestalWhereInput[]
    id_movimiento?: UuidFilter<"MovimientoPresupuestal"> | string
    tenant_id?: UuidFilter<"MovimientoPresupuestal"> | string
    proyecto_id?: UuidFilter<"MovimientoPresupuestal"> | string
    presupuesto_id?: UuidFilter<"MovimientoPresupuestal"> | string
    tipo?: StringFilter<"MovimientoPresupuestal"> | string
    concepto?: StringFilter<"MovimientoPresupuestal"> | string
    monto?: DecimalFilter<"MovimientoPresupuestal"> | Decimal | DecimalJsLike | number | string
    moneda?: StringFilter<"MovimientoPresupuestal"> | string
    referencia_modulo?: StringNullableFilter<"MovimientoPresupuestal"> | string | null
    referencia_entidad?: StringNullableFilter<"MovimientoPresupuestal"> | string | null
    referencia_id?: UuidNullableFilter<"MovimientoPresupuestal"> | string | null
    referencia_codigo?: StringNullableFilter<"MovimientoPresupuestal"> | string | null
    usuario_id?: UuidFilter<"MovimientoPresupuestal"> | string
    fecha_registro?: DateTimeFilter<"MovimientoPresupuestal"> | Date | string
    notas?: StringNullableFilter<"MovimientoPresupuestal"> | string | null
    presupuesto?: XOR<PresupuestoAsignadoRelationFilter, PresupuestoAsignadoWhereInput>
  }

  export type MovimientoPresupuestalOrderByWithRelationInput = {
    id_movimiento?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    presupuesto_id?: SortOrder
    tipo?: SortOrder
    concepto?: SortOrder
    monto?: SortOrder
    moneda?: SortOrder
    referencia_modulo?: SortOrderInput | SortOrder
    referencia_entidad?: SortOrderInput | SortOrder
    referencia_id?: SortOrderInput | SortOrder
    referencia_codigo?: SortOrderInput | SortOrder
    usuario_id?: SortOrder
    fecha_registro?: SortOrder
    notas?: SortOrderInput | SortOrder
    presupuesto?: PresupuestoAsignadoOrderByWithRelationInput
  }

  export type MovimientoPresupuestalWhereUniqueInput = Prisma.AtLeast<{
    id_movimiento?: string
    AND?: MovimientoPresupuestalWhereInput | MovimientoPresupuestalWhereInput[]
    OR?: MovimientoPresupuestalWhereInput[]
    NOT?: MovimientoPresupuestalWhereInput | MovimientoPresupuestalWhereInput[]
    tenant_id?: UuidFilter<"MovimientoPresupuestal"> | string
    proyecto_id?: UuidFilter<"MovimientoPresupuestal"> | string
    presupuesto_id?: UuidFilter<"MovimientoPresupuestal"> | string
    tipo?: StringFilter<"MovimientoPresupuestal"> | string
    concepto?: StringFilter<"MovimientoPresupuestal"> | string
    monto?: DecimalFilter<"MovimientoPresupuestal"> | Decimal | DecimalJsLike | number | string
    moneda?: StringFilter<"MovimientoPresupuestal"> | string
    referencia_modulo?: StringNullableFilter<"MovimientoPresupuestal"> | string | null
    referencia_entidad?: StringNullableFilter<"MovimientoPresupuestal"> | string | null
    referencia_id?: UuidNullableFilter<"MovimientoPresupuestal"> | string | null
    referencia_codigo?: StringNullableFilter<"MovimientoPresupuestal"> | string | null
    usuario_id?: UuidFilter<"MovimientoPresupuestal"> | string
    fecha_registro?: DateTimeFilter<"MovimientoPresupuestal"> | Date | string
    notas?: StringNullableFilter<"MovimientoPresupuestal"> | string | null
    presupuesto?: XOR<PresupuestoAsignadoRelationFilter, PresupuestoAsignadoWhereInput>
  }, "id_movimiento">

  export type MovimientoPresupuestalOrderByWithAggregationInput = {
    id_movimiento?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    presupuesto_id?: SortOrder
    tipo?: SortOrder
    concepto?: SortOrder
    monto?: SortOrder
    moneda?: SortOrder
    referencia_modulo?: SortOrderInput | SortOrder
    referencia_entidad?: SortOrderInput | SortOrder
    referencia_id?: SortOrderInput | SortOrder
    referencia_codigo?: SortOrderInput | SortOrder
    usuario_id?: SortOrder
    fecha_registro?: SortOrder
    notas?: SortOrderInput | SortOrder
    _count?: MovimientoPresupuestalCountOrderByAggregateInput
    _avg?: MovimientoPresupuestalAvgOrderByAggregateInput
    _max?: MovimientoPresupuestalMaxOrderByAggregateInput
    _min?: MovimientoPresupuestalMinOrderByAggregateInput
    _sum?: MovimientoPresupuestalSumOrderByAggregateInput
  }

  export type MovimientoPresupuestalScalarWhereWithAggregatesInput = {
    AND?: MovimientoPresupuestalScalarWhereWithAggregatesInput | MovimientoPresupuestalScalarWhereWithAggregatesInput[]
    OR?: MovimientoPresupuestalScalarWhereWithAggregatesInput[]
    NOT?: MovimientoPresupuestalScalarWhereWithAggregatesInput | MovimientoPresupuestalScalarWhereWithAggregatesInput[]
    id_movimiento?: UuidWithAggregatesFilter<"MovimientoPresupuestal"> | string
    tenant_id?: UuidWithAggregatesFilter<"MovimientoPresupuestal"> | string
    proyecto_id?: UuidWithAggregatesFilter<"MovimientoPresupuestal"> | string
    presupuesto_id?: UuidWithAggregatesFilter<"MovimientoPresupuestal"> | string
    tipo?: StringWithAggregatesFilter<"MovimientoPresupuestal"> | string
    concepto?: StringWithAggregatesFilter<"MovimientoPresupuestal"> | string
    monto?: DecimalWithAggregatesFilter<"MovimientoPresupuestal"> | Decimal | DecimalJsLike | number | string
    moneda?: StringWithAggregatesFilter<"MovimientoPresupuestal"> | string
    referencia_modulo?: StringNullableWithAggregatesFilter<"MovimientoPresupuestal"> | string | null
    referencia_entidad?: StringNullableWithAggregatesFilter<"MovimientoPresupuestal"> | string | null
    referencia_id?: UuidNullableWithAggregatesFilter<"MovimientoPresupuestal"> | string | null
    referencia_codigo?: StringNullableWithAggregatesFilter<"MovimientoPresupuestal"> | string | null
    usuario_id?: UuidWithAggregatesFilter<"MovimientoPresupuestal"> | string
    fecha_registro?: DateTimeWithAggregatesFilter<"MovimientoPresupuestal"> | Date | string
    notas?: StringNullableWithAggregatesFilter<"MovimientoPresupuestal"> | string | null
  }

  export type ProgramaPagosWhereInput = {
    AND?: ProgramaPagosWhereInput | ProgramaPagosWhereInput[]
    OR?: ProgramaPagosWhereInput[]
    NOT?: ProgramaPagosWhereInput | ProgramaPagosWhereInput[]
    id_pago?: UuidFilter<"ProgramaPagos"> | string
    tenant_id?: UuidFilter<"ProgramaPagos"> | string
    proyecto_id?: UuidFilter<"ProgramaPagos"> | string
    presupuesto_id?: UuidFilter<"ProgramaPagos"> | string
    concepto?: StringFilter<"ProgramaPagos"> | string
    beneficiario?: StringFilter<"ProgramaPagos"> | string
    beneficiario_id?: UuidNullableFilter<"ProgramaPagos"> | string | null
    monto_programado?: DecimalFilter<"ProgramaPagos"> | Decimal | DecimalJsLike | number | string
    monto_pagado?: DecimalFilter<"ProgramaPagos"> | Decimal | DecimalJsLike | number | string
    moneda?: StringFilter<"ProgramaPagos"> | string
    fecha_programada?: DateTimeFilter<"ProgramaPagos"> | Date | string
    fecha_pago_real?: DateTimeNullableFilter<"ProgramaPagos"> | Date | string | null
    estado?: StringFilter<"ProgramaPagos"> | string
    referencia_modulo?: StringNullableFilter<"ProgramaPagos"> | string | null
    referencia_entidad?: StringNullableFilter<"ProgramaPagos"> | string | null
    referencia_id?: UuidNullableFilter<"ProgramaPagos"> | string | null
    metodo_pago?: StringNullableFilter<"ProgramaPagos"> | string | null
    banco?: StringNullableFilter<"ProgramaPagos"> | string | null
    referencia_bancaria?: StringNullableFilter<"ProgramaPagos"> | string | null
    created_at?: DateTimeFilter<"ProgramaPagos"> | Date | string
    updated_at?: DateTimeFilter<"ProgramaPagos"> | Date | string
    presupuesto?: XOR<PresupuestoAsignadoRelationFilter, PresupuestoAsignadoWhereInput>
  }

  export type ProgramaPagosOrderByWithRelationInput = {
    id_pago?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    presupuesto_id?: SortOrder
    concepto?: SortOrder
    beneficiario?: SortOrder
    beneficiario_id?: SortOrderInput | SortOrder
    monto_programado?: SortOrder
    monto_pagado?: SortOrder
    moneda?: SortOrder
    fecha_programada?: SortOrder
    fecha_pago_real?: SortOrderInput | SortOrder
    estado?: SortOrder
    referencia_modulo?: SortOrderInput | SortOrder
    referencia_entidad?: SortOrderInput | SortOrder
    referencia_id?: SortOrderInput | SortOrder
    metodo_pago?: SortOrderInput | SortOrder
    banco?: SortOrderInput | SortOrder
    referencia_bancaria?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    presupuesto?: PresupuestoAsignadoOrderByWithRelationInput
  }

  export type ProgramaPagosWhereUniqueInput = Prisma.AtLeast<{
    id_pago?: string
    AND?: ProgramaPagosWhereInput | ProgramaPagosWhereInput[]
    OR?: ProgramaPagosWhereInput[]
    NOT?: ProgramaPagosWhereInput | ProgramaPagosWhereInput[]
    tenant_id?: UuidFilter<"ProgramaPagos"> | string
    proyecto_id?: UuidFilter<"ProgramaPagos"> | string
    presupuesto_id?: UuidFilter<"ProgramaPagos"> | string
    concepto?: StringFilter<"ProgramaPagos"> | string
    beneficiario?: StringFilter<"ProgramaPagos"> | string
    beneficiario_id?: UuidNullableFilter<"ProgramaPagos"> | string | null
    monto_programado?: DecimalFilter<"ProgramaPagos"> | Decimal | DecimalJsLike | number | string
    monto_pagado?: DecimalFilter<"ProgramaPagos"> | Decimal | DecimalJsLike | number | string
    moneda?: StringFilter<"ProgramaPagos"> | string
    fecha_programada?: DateTimeFilter<"ProgramaPagos"> | Date | string
    fecha_pago_real?: DateTimeNullableFilter<"ProgramaPagos"> | Date | string | null
    estado?: StringFilter<"ProgramaPagos"> | string
    referencia_modulo?: StringNullableFilter<"ProgramaPagos"> | string | null
    referencia_entidad?: StringNullableFilter<"ProgramaPagos"> | string | null
    referencia_id?: UuidNullableFilter<"ProgramaPagos"> | string | null
    metodo_pago?: StringNullableFilter<"ProgramaPagos"> | string | null
    banco?: StringNullableFilter<"ProgramaPagos"> | string | null
    referencia_bancaria?: StringNullableFilter<"ProgramaPagos"> | string | null
    created_at?: DateTimeFilter<"ProgramaPagos"> | Date | string
    updated_at?: DateTimeFilter<"ProgramaPagos"> | Date | string
    presupuesto?: XOR<PresupuestoAsignadoRelationFilter, PresupuestoAsignadoWhereInput>
  }, "id_pago">

  export type ProgramaPagosOrderByWithAggregationInput = {
    id_pago?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    presupuesto_id?: SortOrder
    concepto?: SortOrder
    beneficiario?: SortOrder
    beneficiario_id?: SortOrderInput | SortOrder
    monto_programado?: SortOrder
    monto_pagado?: SortOrder
    moneda?: SortOrder
    fecha_programada?: SortOrder
    fecha_pago_real?: SortOrderInput | SortOrder
    estado?: SortOrder
    referencia_modulo?: SortOrderInput | SortOrder
    referencia_entidad?: SortOrderInput | SortOrder
    referencia_id?: SortOrderInput | SortOrder
    metodo_pago?: SortOrderInput | SortOrder
    banco?: SortOrderInput | SortOrder
    referencia_bancaria?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: ProgramaPagosCountOrderByAggregateInput
    _avg?: ProgramaPagosAvgOrderByAggregateInput
    _max?: ProgramaPagosMaxOrderByAggregateInput
    _min?: ProgramaPagosMinOrderByAggregateInput
    _sum?: ProgramaPagosSumOrderByAggregateInput
  }

  export type ProgramaPagosScalarWhereWithAggregatesInput = {
    AND?: ProgramaPagosScalarWhereWithAggregatesInput | ProgramaPagosScalarWhereWithAggregatesInput[]
    OR?: ProgramaPagosScalarWhereWithAggregatesInput[]
    NOT?: ProgramaPagosScalarWhereWithAggregatesInput | ProgramaPagosScalarWhereWithAggregatesInput[]
    id_pago?: UuidWithAggregatesFilter<"ProgramaPagos"> | string
    tenant_id?: UuidWithAggregatesFilter<"ProgramaPagos"> | string
    proyecto_id?: UuidWithAggregatesFilter<"ProgramaPagos"> | string
    presupuesto_id?: UuidWithAggregatesFilter<"ProgramaPagos"> | string
    concepto?: StringWithAggregatesFilter<"ProgramaPagos"> | string
    beneficiario?: StringWithAggregatesFilter<"ProgramaPagos"> | string
    beneficiario_id?: UuidNullableWithAggregatesFilter<"ProgramaPagos"> | string | null
    monto_programado?: DecimalWithAggregatesFilter<"ProgramaPagos"> | Decimal | DecimalJsLike | number | string
    monto_pagado?: DecimalWithAggregatesFilter<"ProgramaPagos"> | Decimal | DecimalJsLike | number | string
    moneda?: StringWithAggregatesFilter<"ProgramaPagos"> | string
    fecha_programada?: DateTimeWithAggregatesFilter<"ProgramaPagos"> | Date | string
    fecha_pago_real?: DateTimeNullableWithAggregatesFilter<"ProgramaPagos"> | Date | string | null
    estado?: StringWithAggregatesFilter<"ProgramaPagos"> | string
    referencia_modulo?: StringNullableWithAggregatesFilter<"ProgramaPagos"> | string | null
    referencia_entidad?: StringNullableWithAggregatesFilter<"ProgramaPagos"> | string | null
    referencia_id?: UuidNullableWithAggregatesFilter<"ProgramaPagos"> | string | null
    metodo_pago?: StringNullableWithAggregatesFilter<"ProgramaPagos"> | string | null
    banco?: StringNullableWithAggregatesFilter<"ProgramaPagos"> | string | null
    referencia_bancaria?: StringNullableWithAggregatesFilter<"ProgramaPagos"> | string | null
    created_at?: DateTimeWithAggregatesFilter<"ProgramaPagos"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"ProgramaPagos"> | Date | string
  }

  export type CuentaBancariaWhereInput = {
    AND?: CuentaBancariaWhereInput | CuentaBancariaWhereInput[]
    OR?: CuentaBancariaWhereInput[]
    NOT?: CuentaBancariaWhereInput | CuentaBancariaWhereInput[]
    id_cuenta?: UuidFilter<"CuentaBancaria"> | string
    tenant_id?: UuidFilter<"CuentaBancaria"> | string
    proyecto_id?: UuidNullableFilter<"CuentaBancaria"> | string | null
    banco?: StringFilter<"CuentaBancaria"> | string
    numero_cuenta?: StringFilter<"CuentaBancaria"> | string
    clabe?: StringNullableFilter<"CuentaBancaria"> | string | null
    alias?: StringFilter<"CuentaBancaria"> | string
    moneda?: StringFilter<"CuentaBancaria"> | string
    saldo?: DecimalFilter<"CuentaBancaria"> | Decimal | DecimalJsLike | number | string
    activa?: BoolFilter<"CuentaBancaria"> | boolean
    created_at?: DateTimeFilter<"CuentaBancaria"> | Date | string
    updated_at?: DateTimeFilter<"CuentaBancaria"> | Date | string
    pagos?: PagoOCListRelationFilter
  }

  export type CuentaBancariaOrderByWithRelationInput = {
    id_cuenta?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrderInput | SortOrder
    banco?: SortOrder
    numero_cuenta?: SortOrder
    clabe?: SortOrderInput | SortOrder
    alias?: SortOrder
    moneda?: SortOrder
    saldo?: SortOrder
    activa?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    pagos?: PagoOCOrderByRelationAggregateInput
  }

  export type CuentaBancariaWhereUniqueInput = Prisma.AtLeast<{
    id_cuenta?: string
    AND?: CuentaBancariaWhereInput | CuentaBancariaWhereInput[]
    OR?: CuentaBancariaWhereInput[]
    NOT?: CuentaBancariaWhereInput | CuentaBancariaWhereInput[]
    tenant_id?: UuidFilter<"CuentaBancaria"> | string
    proyecto_id?: UuidNullableFilter<"CuentaBancaria"> | string | null
    banco?: StringFilter<"CuentaBancaria"> | string
    numero_cuenta?: StringFilter<"CuentaBancaria"> | string
    clabe?: StringNullableFilter<"CuentaBancaria"> | string | null
    alias?: StringFilter<"CuentaBancaria"> | string
    moneda?: StringFilter<"CuentaBancaria"> | string
    saldo?: DecimalFilter<"CuentaBancaria"> | Decimal | DecimalJsLike | number | string
    activa?: BoolFilter<"CuentaBancaria"> | boolean
    created_at?: DateTimeFilter<"CuentaBancaria"> | Date | string
    updated_at?: DateTimeFilter<"CuentaBancaria"> | Date | string
    pagos?: PagoOCListRelationFilter
  }, "id_cuenta">

  export type CuentaBancariaOrderByWithAggregationInput = {
    id_cuenta?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrderInput | SortOrder
    banco?: SortOrder
    numero_cuenta?: SortOrder
    clabe?: SortOrderInput | SortOrder
    alias?: SortOrder
    moneda?: SortOrder
    saldo?: SortOrder
    activa?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: CuentaBancariaCountOrderByAggregateInput
    _avg?: CuentaBancariaAvgOrderByAggregateInput
    _max?: CuentaBancariaMaxOrderByAggregateInput
    _min?: CuentaBancariaMinOrderByAggregateInput
    _sum?: CuentaBancariaSumOrderByAggregateInput
  }

  export type CuentaBancariaScalarWhereWithAggregatesInput = {
    AND?: CuentaBancariaScalarWhereWithAggregatesInput | CuentaBancariaScalarWhereWithAggregatesInput[]
    OR?: CuentaBancariaScalarWhereWithAggregatesInput[]
    NOT?: CuentaBancariaScalarWhereWithAggregatesInput | CuentaBancariaScalarWhereWithAggregatesInput[]
    id_cuenta?: UuidWithAggregatesFilter<"CuentaBancaria"> | string
    tenant_id?: UuidWithAggregatesFilter<"CuentaBancaria"> | string
    proyecto_id?: UuidNullableWithAggregatesFilter<"CuentaBancaria"> | string | null
    banco?: StringWithAggregatesFilter<"CuentaBancaria"> | string
    numero_cuenta?: StringWithAggregatesFilter<"CuentaBancaria"> | string
    clabe?: StringNullableWithAggregatesFilter<"CuentaBancaria"> | string | null
    alias?: StringWithAggregatesFilter<"CuentaBancaria"> | string
    moneda?: StringWithAggregatesFilter<"CuentaBancaria"> | string
    saldo?: DecimalWithAggregatesFilter<"CuentaBancaria"> | Decimal | DecimalJsLike | number | string
    activa?: BoolWithAggregatesFilter<"CuentaBancaria"> | boolean
    created_at?: DateTimeWithAggregatesFilter<"CuentaBancaria"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"CuentaBancaria"> | Date | string
  }

  export type ProyectoFinanzasWhereInput = {
    AND?: ProyectoFinanzasWhereInput | ProyectoFinanzasWhereInput[]
    OR?: ProyectoFinanzasWhereInput[]
    NOT?: ProyectoFinanzasWhereInput | ProyectoFinanzasWhereInput[]
    id_proyecto_finanzas?: UuidFilter<"ProyectoFinanzas"> | string
    tenant_id?: UuidFilter<"ProyectoFinanzas"> | string
    proyecto_id?: UuidFilter<"ProyectoFinanzas"> | string
    anticipo_total?: DecimalFilter<"ProyectoFinanzas"> | Decimal | DecimalJsLike | number | string
    anticipo_usado?: DecimalFilter<"ProyectoFinanzas"> | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFilter<"ProyectoFinanzas"> | Date | string
    updated_at?: DateTimeFilter<"ProyectoFinanzas"> | Date | string
  }

  export type ProyectoFinanzasOrderByWithRelationInput = {
    id_proyecto_finanzas?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    anticipo_total?: SortOrder
    anticipo_usado?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ProyectoFinanzasWhereUniqueInput = Prisma.AtLeast<{
    id_proyecto_finanzas?: string
    tenant_id_proyecto_id?: ProyectoFinanzasTenant_idProyecto_idCompoundUniqueInput
    AND?: ProyectoFinanzasWhereInput | ProyectoFinanzasWhereInput[]
    OR?: ProyectoFinanzasWhereInput[]
    NOT?: ProyectoFinanzasWhereInput | ProyectoFinanzasWhereInput[]
    tenant_id?: UuidFilter<"ProyectoFinanzas"> | string
    proyecto_id?: UuidFilter<"ProyectoFinanzas"> | string
    anticipo_total?: DecimalFilter<"ProyectoFinanzas"> | Decimal | DecimalJsLike | number | string
    anticipo_usado?: DecimalFilter<"ProyectoFinanzas"> | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFilter<"ProyectoFinanzas"> | Date | string
    updated_at?: DateTimeFilter<"ProyectoFinanzas"> | Date | string
  }, "id_proyecto_finanzas" | "tenant_id_proyecto_id">

  export type ProyectoFinanzasOrderByWithAggregationInput = {
    id_proyecto_finanzas?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    anticipo_total?: SortOrder
    anticipo_usado?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: ProyectoFinanzasCountOrderByAggregateInput
    _avg?: ProyectoFinanzasAvgOrderByAggregateInput
    _max?: ProyectoFinanzasMaxOrderByAggregateInput
    _min?: ProyectoFinanzasMinOrderByAggregateInput
    _sum?: ProyectoFinanzasSumOrderByAggregateInput
  }

  export type ProyectoFinanzasScalarWhereWithAggregatesInput = {
    AND?: ProyectoFinanzasScalarWhereWithAggregatesInput | ProyectoFinanzasScalarWhereWithAggregatesInput[]
    OR?: ProyectoFinanzasScalarWhereWithAggregatesInput[]
    NOT?: ProyectoFinanzasScalarWhereWithAggregatesInput | ProyectoFinanzasScalarWhereWithAggregatesInput[]
    id_proyecto_finanzas?: UuidWithAggregatesFilter<"ProyectoFinanzas"> | string
    tenant_id?: UuidWithAggregatesFilter<"ProyectoFinanzas"> | string
    proyecto_id?: UuidWithAggregatesFilter<"ProyectoFinanzas"> | string
    anticipo_total?: DecimalWithAggregatesFilter<"ProyectoFinanzas"> | Decimal | DecimalJsLike | number | string
    anticipo_usado?: DecimalWithAggregatesFilter<"ProyectoFinanzas"> | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeWithAggregatesFilter<"ProyectoFinanzas"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"ProyectoFinanzas"> | Date | string
  }

  export type PagoOCWhereInput = {
    AND?: PagoOCWhereInput | PagoOCWhereInput[]
    OR?: PagoOCWhereInput[]
    NOT?: PagoOCWhereInput | PagoOCWhereInput[]
    id_pago?: UuidFilter<"PagoOC"> | string
    tenant_id?: UuidFilter<"PagoOC"> | string
    proyecto_id?: UuidFilter<"PagoOC"> | string
    fuente?: StringFilter<"PagoOC"> | string
    cuenta_id?: UuidNullableFilter<"PagoOC"> | string | null
    tipo_pago?: StringFilter<"PagoOC"> | string
    referencia?: StringFilter<"PagoOC"> | string
    concepto?: StringFilter<"PagoOC"> | string
    fecha_pago?: DateTimeFilter<"PagoOC"> | Date | string
    monto_total?: DecimalFilter<"PagoOC"> | Decimal | DecimalJsLike | number | string
    moneda?: StringFilter<"PagoOC"> | string
    usuario_id?: UuidFilter<"PagoOC"> | string
    created_at?: DateTimeFilter<"PagoOC"> | Date | string
    cuenta?: XOR<CuentaBancariaNullableRelationFilter, CuentaBancariaWhereInput> | null
    detalles?: DetallePagoOCListRelationFilter
  }

  export type PagoOCOrderByWithRelationInput = {
    id_pago?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    fuente?: SortOrder
    cuenta_id?: SortOrderInput | SortOrder
    tipo_pago?: SortOrder
    referencia?: SortOrder
    concepto?: SortOrder
    fecha_pago?: SortOrder
    monto_total?: SortOrder
    moneda?: SortOrder
    usuario_id?: SortOrder
    created_at?: SortOrder
    cuenta?: CuentaBancariaOrderByWithRelationInput
    detalles?: DetallePagoOCOrderByRelationAggregateInput
  }

  export type PagoOCWhereUniqueInput = Prisma.AtLeast<{
    id_pago?: string
    AND?: PagoOCWhereInput | PagoOCWhereInput[]
    OR?: PagoOCWhereInput[]
    NOT?: PagoOCWhereInput | PagoOCWhereInput[]
    tenant_id?: UuidFilter<"PagoOC"> | string
    proyecto_id?: UuidFilter<"PagoOC"> | string
    fuente?: StringFilter<"PagoOC"> | string
    cuenta_id?: UuidNullableFilter<"PagoOC"> | string | null
    tipo_pago?: StringFilter<"PagoOC"> | string
    referencia?: StringFilter<"PagoOC"> | string
    concepto?: StringFilter<"PagoOC"> | string
    fecha_pago?: DateTimeFilter<"PagoOC"> | Date | string
    monto_total?: DecimalFilter<"PagoOC"> | Decimal | DecimalJsLike | number | string
    moneda?: StringFilter<"PagoOC"> | string
    usuario_id?: UuidFilter<"PagoOC"> | string
    created_at?: DateTimeFilter<"PagoOC"> | Date | string
    cuenta?: XOR<CuentaBancariaNullableRelationFilter, CuentaBancariaWhereInput> | null
    detalles?: DetallePagoOCListRelationFilter
  }, "id_pago">

  export type PagoOCOrderByWithAggregationInput = {
    id_pago?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    fuente?: SortOrder
    cuenta_id?: SortOrderInput | SortOrder
    tipo_pago?: SortOrder
    referencia?: SortOrder
    concepto?: SortOrder
    fecha_pago?: SortOrder
    monto_total?: SortOrder
    moneda?: SortOrder
    usuario_id?: SortOrder
    created_at?: SortOrder
    _count?: PagoOCCountOrderByAggregateInput
    _avg?: PagoOCAvgOrderByAggregateInput
    _max?: PagoOCMaxOrderByAggregateInput
    _min?: PagoOCMinOrderByAggregateInput
    _sum?: PagoOCSumOrderByAggregateInput
  }

  export type PagoOCScalarWhereWithAggregatesInput = {
    AND?: PagoOCScalarWhereWithAggregatesInput | PagoOCScalarWhereWithAggregatesInput[]
    OR?: PagoOCScalarWhereWithAggregatesInput[]
    NOT?: PagoOCScalarWhereWithAggregatesInput | PagoOCScalarWhereWithAggregatesInput[]
    id_pago?: UuidWithAggregatesFilter<"PagoOC"> | string
    tenant_id?: UuidWithAggregatesFilter<"PagoOC"> | string
    proyecto_id?: UuidWithAggregatesFilter<"PagoOC"> | string
    fuente?: StringWithAggregatesFilter<"PagoOC"> | string
    cuenta_id?: UuidNullableWithAggregatesFilter<"PagoOC"> | string | null
    tipo_pago?: StringWithAggregatesFilter<"PagoOC"> | string
    referencia?: StringWithAggregatesFilter<"PagoOC"> | string
    concepto?: StringWithAggregatesFilter<"PagoOC"> | string
    fecha_pago?: DateTimeWithAggregatesFilter<"PagoOC"> | Date | string
    monto_total?: DecimalWithAggregatesFilter<"PagoOC"> | Decimal | DecimalJsLike | number | string
    moneda?: StringWithAggregatesFilter<"PagoOC"> | string
    usuario_id?: UuidWithAggregatesFilter<"PagoOC"> | string
    created_at?: DateTimeWithAggregatesFilter<"PagoOC"> | Date | string
  }

  export type DetallePagoOCWhereInput = {
    AND?: DetallePagoOCWhereInput | DetallePagoOCWhereInput[]
    OR?: DetallePagoOCWhereInput[]
    NOT?: DetallePagoOCWhereInput | DetallePagoOCWhereInput[]
    id_detalle?: UuidFilter<"DetallePagoOC"> | string
    pago_id?: UuidFilter<"DetallePagoOC"> | string
    oc_id?: UuidFilter<"DetallePagoOC"> | string
    oc_codigo?: StringFilter<"DetallePagoOC"> | string
    proveedor_id?: UuidFilter<"DetallePagoOC"> | string
    proveedor_nombre?: StringFilter<"DetallePagoOC"> | string
    monto_aplicado?: DecimalFilter<"DetallePagoOC"> | Decimal | DecimalJsLike | number | string
    saldo_oc_antes?: DecimalFilter<"DetallePagoOC"> | Decimal | DecimalJsLike | number | string
    saldo_oc_despues?: DecimalFilter<"DetallePagoOC"> | Decimal | DecimalJsLike | number | string
    pago?: XOR<PagoOCRelationFilter, PagoOCWhereInput>
  }

  export type DetallePagoOCOrderByWithRelationInput = {
    id_detalle?: SortOrder
    pago_id?: SortOrder
    oc_id?: SortOrder
    oc_codigo?: SortOrder
    proveedor_id?: SortOrder
    proveedor_nombre?: SortOrder
    monto_aplicado?: SortOrder
    saldo_oc_antes?: SortOrder
    saldo_oc_despues?: SortOrder
    pago?: PagoOCOrderByWithRelationInput
  }

  export type DetallePagoOCWhereUniqueInput = Prisma.AtLeast<{
    id_detalle?: string
    pago_id_oc_id?: DetallePagoOCPago_idOc_idCompoundUniqueInput
    AND?: DetallePagoOCWhereInput | DetallePagoOCWhereInput[]
    OR?: DetallePagoOCWhereInput[]
    NOT?: DetallePagoOCWhereInput | DetallePagoOCWhereInput[]
    pago_id?: UuidFilter<"DetallePagoOC"> | string
    oc_id?: UuidFilter<"DetallePagoOC"> | string
    oc_codigo?: StringFilter<"DetallePagoOC"> | string
    proveedor_id?: UuidFilter<"DetallePagoOC"> | string
    proveedor_nombre?: StringFilter<"DetallePagoOC"> | string
    monto_aplicado?: DecimalFilter<"DetallePagoOC"> | Decimal | DecimalJsLike | number | string
    saldo_oc_antes?: DecimalFilter<"DetallePagoOC"> | Decimal | DecimalJsLike | number | string
    saldo_oc_despues?: DecimalFilter<"DetallePagoOC"> | Decimal | DecimalJsLike | number | string
    pago?: XOR<PagoOCRelationFilter, PagoOCWhereInput>
  }, "id_detalle" | "pago_id_oc_id">

  export type DetallePagoOCOrderByWithAggregationInput = {
    id_detalle?: SortOrder
    pago_id?: SortOrder
    oc_id?: SortOrder
    oc_codigo?: SortOrder
    proveedor_id?: SortOrder
    proveedor_nombre?: SortOrder
    monto_aplicado?: SortOrder
    saldo_oc_antes?: SortOrder
    saldo_oc_despues?: SortOrder
    _count?: DetallePagoOCCountOrderByAggregateInput
    _avg?: DetallePagoOCAvgOrderByAggregateInput
    _max?: DetallePagoOCMaxOrderByAggregateInput
    _min?: DetallePagoOCMinOrderByAggregateInput
    _sum?: DetallePagoOCSumOrderByAggregateInput
  }

  export type DetallePagoOCScalarWhereWithAggregatesInput = {
    AND?: DetallePagoOCScalarWhereWithAggregatesInput | DetallePagoOCScalarWhereWithAggregatesInput[]
    OR?: DetallePagoOCScalarWhereWithAggregatesInput[]
    NOT?: DetallePagoOCScalarWhereWithAggregatesInput | DetallePagoOCScalarWhereWithAggregatesInput[]
    id_detalle?: UuidWithAggregatesFilter<"DetallePagoOC"> | string
    pago_id?: UuidWithAggregatesFilter<"DetallePagoOC"> | string
    oc_id?: UuidWithAggregatesFilter<"DetallePagoOC"> | string
    oc_codigo?: StringWithAggregatesFilter<"DetallePagoOC"> | string
    proveedor_id?: UuidWithAggregatesFilter<"DetallePagoOC"> | string
    proveedor_nombre?: StringWithAggregatesFilter<"DetallePagoOC"> | string
    monto_aplicado?: DecimalWithAggregatesFilter<"DetallePagoOC"> | Decimal | DecimalJsLike | number | string
    saldo_oc_antes?: DecimalWithAggregatesFilter<"DetallePagoOC"> | Decimal | DecimalJsLike | number | string
    saldo_oc_despues?: DecimalWithAggregatesFilter<"DetallePagoOC"> | Decimal | DecimalJsLike | number | string
  }

  export type PresupuestoAsignadoCreateInput = {
    id_presupuesto?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    descripcion: string
    monto_autorizado: Decimal | DecimalJsLike | number | string
    monto_ejercido?: Decimal | DecimalJsLike | number | string
    monto_comprometido?: Decimal | DecimalJsLike | number | string
    monto_disponible?: Decimal | DecimalJsLike | number | string
    moneda?: string
    capitulo?: string
    estatus?: string
    created_at?: Date | string
    updated_at?: Date | string
    movimientos?: MovimientoPresupuestalCreateNestedManyWithoutPresupuestoInput
    programa_pagos?: ProgramaPagosCreateNestedManyWithoutPresupuestoInput
  }

  export type PresupuestoAsignadoUncheckedCreateInput = {
    id_presupuesto?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    descripcion: string
    monto_autorizado: Decimal | DecimalJsLike | number | string
    monto_ejercido?: Decimal | DecimalJsLike | number | string
    monto_comprometido?: Decimal | DecimalJsLike | number | string
    monto_disponible?: Decimal | DecimalJsLike | number | string
    moneda?: string
    capitulo?: string
    estatus?: string
    created_at?: Date | string
    updated_at?: Date | string
    movimientos?: MovimientoPresupuestalUncheckedCreateNestedManyWithoutPresupuestoInput
    programa_pagos?: ProgramaPagosUncheckedCreateNestedManyWithoutPresupuestoInput
  }

  export type PresupuestoAsignadoUpdateInput = {
    id_presupuesto?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    monto_autorizado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_ejercido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_comprometido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_disponible?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    capitulo?: StringFieldUpdateOperationsInput | string
    estatus?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    movimientos?: MovimientoPresupuestalUpdateManyWithoutPresupuestoNestedInput
    programa_pagos?: ProgramaPagosUpdateManyWithoutPresupuestoNestedInput
  }

  export type PresupuestoAsignadoUncheckedUpdateInput = {
    id_presupuesto?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    monto_autorizado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_ejercido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_comprometido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_disponible?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    capitulo?: StringFieldUpdateOperationsInput | string
    estatus?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    movimientos?: MovimientoPresupuestalUncheckedUpdateManyWithoutPresupuestoNestedInput
    programa_pagos?: ProgramaPagosUncheckedUpdateManyWithoutPresupuestoNestedInput
  }

  export type PresupuestoAsignadoCreateManyInput = {
    id_presupuesto?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    descripcion: string
    monto_autorizado: Decimal | DecimalJsLike | number | string
    monto_ejercido?: Decimal | DecimalJsLike | number | string
    monto_comprometido?: Decimal | DecimalJsLike | number | string
    monto_disponible?: Decimal | DecimalJsLike | number | string
    moneda?: string
    capitulo?: string
    estatus?: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type PresupuestoAsignadoUpdateManyMutationInput = {
    id_presupuesto?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    monto_autorizado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_ejercido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_comprometido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_disponible?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    capitulo?: StringFieldUpdateOperationsInput | string
    estatus?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PresupuestoAsignadoUncheckedUpdateManyInput = {
    id_presupuesto?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    monto_autorizado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_ejercido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_comprometido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_disponible?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    capitulo?: StringFieldUpdateOperationsInput | string
    estatus?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MovimientoPresupuestalCreateInput = {
    id_movimiento?: string
    tenant_id: string
    proyecto_id: string
    tipo: string
    concepto: string
    monto: Decimal | DecimalJsLike | number | string
    moneda?: string
    referencia_modulo?: string | null
    referencia_entidad?: string | null
    referencia_id?: string | null
    referencia_codigo?: string | null
    usuario_id: string
    fecha_registro?: Date | string
    notas?: string | null
    presupuesto: PresupuestoAsignadoCreateNestedOneWithoutMovimientosInput
  }

  export type MovimientoPresupuestalUncheckedCreateInput = {
    id_movimiento?: string
    tenant_id: string
    proyecto_id: string
    presupuesto_id: string
    tipo: string
    concepto: string
    monto: Decimal | DecimalJsLike | number | string
    moneda?: string
    referencia_modulo?: string | null
    referencia_entidad?: string | null
    referencia_id?: string | null
    referencia_codigo?: string | null
    usuario_id: string
    fecha_registro?: Date | string
    notas?: string | null
  }

  export type MovimientoPresupuestalUpdateInput = {
    id_movimiento?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    concepto?: StringFieldUpdateOperationsInput | string
    monto?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    referencia_modulo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_entidad?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_id?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_codigo?: NullableStringFieldUpdateOperationsInput | string | null
    usuario_id?: StringFieldUpdateOperationsInput | string
    fecha_registro?: DateTimeFieldUpdateOperationsInput | Date | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    presupuesto?: PresupuestoAsignadoUpdateOneRequiredWithoutMovimientosNestedInput
  }

  export type MovimientoPresupuestalUncheckedUpdateInput = {
    id_movimiento?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    presupuesto_id?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    concepto?: StringFieldUpdateOperationsInput | string
    monto?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    referencia_modulo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_entidad?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_id?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_codigo?: NullableStringFieldUpdateOperationsInput | string | null
    usuario_id?: StringFieldUpdateOperationsInput | string
    fecha_registro?: DateTimeFieldUpdateOperationsInput | Date | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type MovimientoPresupuestalCreateManyInput = {
    id_movimiento?: string
    tenant_id: string
    proyecto_id: string
    presupuesto_id: string
    tipo: string
    concepto: string
    monto: Decimal | DecimalJsLike | number | string
    moneda?: string
    referencia_modulo?: string | null
    referencia_entidad?: string | null
    referencia_id?: string | null
    referencia_codigo?: string | null
    usuario_id: string
    fecha_registro?: Date | string
    notas?: string | null
  }

  export type MovimientoPresupuestalUpdateManyMutationInput = {
    id_movimiento?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    concepto?: StringFieldUpdateOperationsInput | string
    monto?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    referencia_modulo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_entidad?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_id?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_codigo?: NullableStringFieldUpdateOperationsInput | string | null
    usuario_id?: StringFieldUpdateOperationsInput | string
    fecha_registro?: DateTimeFieldUpdateOperationsInput | Date | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type MovimientoPresupuestalUncheckedUpdateManyInput = {
    id_movimiento?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    presupuesto_id?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    concepto?: StringFieldUpdateOperationsInput | string
    monto?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    referencia_modulo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_entidad?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_id?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_codigo?: NullableStringFieldUpdateOperationsInput | string | null
    usuario_id?: StringFieldUpdateOperationsInput | string
    fecha_registro?: DateTimeFieldUpdateOperationsInput | Date | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ProgramaPagosCreateInput = {
    id_pago?: string
    tenant_id: string
    proyecto_id: string
    concepto: string
    beneficiario: string
    beneficiario_id?: string | null
    monto_programado: Decimal | DecimalJsLike | number | string
    monto_pagado?: Decimal | DecimalJsLike | number | string
    moneda?: string
    fecha_programada: Date | string
    fecha_pago_real?: Date | string | null
    estado?: string
    referencia_modulo?: string | null
    referencia_entidad?: string | null
    referencia_id?: string | null
    metodo_pago?: string | null
    banco?: string | null
    referencia_bancaria?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    presupuesto: PresupuestoAsignadoCreateNestedOneWithoutPrograma_pagosInput
  }

  export type ProgramaPagosUncheckedCreateInput = {
    id_pago?: string
    tenant_id: string
    proyecto_id: string
    presupuesto_id: string
    concepto: string
    beneficiario: string
    beneficiario_id?: string | null
    monto_programado: Decimal | DecimalJsLike | number | string
    monto_pagado?: Decimal | DecimalJsLike | number | string
    moneda?: string
    fecha_programada: Date | string
    fecha_pago_real?: Date | string | null
    estado?: string
    referencia_modulo?: string | null
    referencia_entidad?: string | null
    referencia_id?: string | null
    metodo_pago?: string | null
    banco?: string | null
    referencia_bancaria?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ProgramaPagosUpdateInput = {
    id_pago?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    concepto?: StringFieldUpdateOperationsInput | string
    beneficiario?: StringFieldUpdateOperationsInput | string
    beneficiario_id?: NullableStringFieldUpdateOperationsInput | string | null
    monto_programado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_pagado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    fecha_programada?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_pago_real?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    referencia_modulo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_entidad?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_id?: NullableStringFieldUpdateOperationsInput | string | null
    metodo_pago?: NullableStringFieldUpdateOperationsInput | string | null
    banco?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_bancaria?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    presupuesto?: PresupuestoAsignadoUpdateOneRequiredWithoutPrograma_pagosNestedInput
  }

  export type ProgramaPagosUncheckedUpdateInput = {
    id_pago?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    presupuesto_id?: StringFieldUpdateOperationsInput | string
    concepto?: StringFieldUpdateOperationsInput | string
    beneficiario?: StringFieldUpdateOperationsInput | string
    beneficiario_id?: NullableStringFieldUpdateOperationsInput | string | null
    monto_programado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_pagado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    fecha_programada?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_pago_real?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    referencia_modulo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_entidad?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_id?: NullableStringFieldUpdateOperationsInput | string | null
    metodo_pago?: NullableStringFieldUpdateOperationsInput | string | null
    banco?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_bancaria?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProgramaPagosCreateManyInput = {
    id_pago?: string
    tenant_id: string
    proyecto_id: string
    presupuesto_id: string
    concepto: string
    beneficiario: string
    beneficiario_id?: string | null
    monto_programado: Decimal | DecimalJsLike | number | string
    monto_pagado?: Decimal | DecimalJsLike | number | string
    moneda?: string
    fecha_programada: Date | string
    fecha_pago_real?: Date | string | null
    estado?: string
    referencia_modulo?: string | null
    referencia_entidad?: string | null
    referencia_id?: string | null
    metodo_pago?: string | null
    banco?: string | null
    referencia_bancaria?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ProgramaPagosUpdateManyMutationInput = {
    id_pago?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    concepto?: StringFieldUpdateOperationsInput | string
    beneficiario?: StringFieldUpdateOperationsInput | string
    beneficiario_id?: NullableStringFieldUpdateOperationsInput | string | null
    monto_programado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_pagado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    fecha_programada?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_pago_real?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    referencia_modulo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_entidad?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_id?: NullableStringFieldUpdateOperationsInput | string | null
    metodo_pago?: NullableStringFieldUpdateOperationsInput | string | null
    banco?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_bancaria?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProgramaPagosUncheckedUpdateManyInput = {
    id_pago?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    presupuesto_id?: StringFieldUpdateOperationsInput | string
    concepto?: StringFieldUpdateOperationsInput | string
    beneficiario?: StringFieldUpdateOperationsInput | string
    beneficiario_id?: NullableStringFieldUpdateOperationsInput | string | null
    monto_programado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_pagado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    fecha_programada?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_pago_real?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    referencia_modulo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_entidad?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_id?: NullableStringFieldUpdateOperationsInput | string | null
    metodo_pago?: NullableStringFieldUpdateOperationsInput | string | null
    banco?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_bancaria?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CuentaBancariaCreateInput = {
    id_cuenta?: string
    tenant_id: string
    proyecto_id?: string | null
    banco: string
    numero_cuenta: string
    clabe?: string | null
    alias: string
    moneda?: string
    saldo?: Decimal | DecimalJsLike | number | string
    activa?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    pagos?: PagoOCCreateNestedManyWithoutCuentaInput
  }

  export type CuentaBancariaUncheckedCreateInput = {
    id_cuenta?: string
    tenant_id: string
    proyecto_id?: string | null
    banco: string
    numero_cuenta: string
    clabe?: string | null
    alias: string
    moneda?: string
    saldo?: Decimal | DecimalJsLike | number | string
    activa?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    pagos?: PagoOCUncheckedCreateNestedManyWithoutCuentaInput
  }

  export type CuentaBancariaUpdateInput = {
    id_cuenta?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: NullableStringFieldUpdateOperationsInput | string | null
    banco?: StringFieldUpdateOperationsInput | string
    numero_cuenta?: StringFieldUpdateOperationsInput | string
    clabe?: NullableStringFieldUpdateOperationsInput | string | null
    alias?: StringFieldUpdateOperationsInput | string
    moneda?: StringFieldUpdateOperationsInput | string
    saldo?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    activa?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    pagos?: PagoOCUpdateManyWithoutCuentaNestedInput
  }

  export type CuentaBancariaUncheckedUpdateInput = {
    id_cuenta?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: NullableStringFieldUpdateOperationsInput | string | null
    banco?: StringFieldUpdateOperationsInput | string
    numero_cuenta?: StringFieldUpdateOperationsInput | string
    clabe?: NullableStringFieldUpdateOperationsInput | string | null
    alias?: StringFieldUpdateOperationsInput | string
    moneda?: StringFieldUpdateOperationsInput | string
    saldo?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    activa?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    pagos?: PagoOCUncheckedUpdateManyWithoutCuentaNestedInput
  }

  export type CuentaBancariaCreateManyInput = {
    id_cuenta?: string
    tenant_id: string
    proyecto_id?: string | null
    banco: string
    numero_cuenta: string
    clabe?: string | null
    alias: string
    moneda?: string
    saldo?: Decimal | DecimalJsLike | number | string
    activa?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type CuentaBancariaUpdateManyMutationInput = {
    id_cuenta?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: NullableStringFieldUpdateOperationsInput | string | null
    banco?: StringFieldUpdateOperationsInput | string
    numero_cuenta?: StringFieldUpdateOperationsInput | string
    clabe?: NullableStringFieldUpdateOperationsInput | string | null
    alias?: StringFieldUpdateOperationsInput | string
    moneda?: StringFieldUpdateOperationsInput | string
    saldo?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    activa?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CuentaBancariaUncheckedUpdateManyInput = {
    id_cuenta?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: NullableStringFieldUpdateOperationsInput | string | null
    banco?: StringFieldUpdateOperationsInput | string
    numero_cuenta?: StringFieldUpdateOperationsInput | string
    clabe?: NullableStringFieldUpdateOperationsInput | string | null
    alias?: StringFieldUpdateOperationsInput | string
    moneda?: StringFieldUpdateOperationsInput | string
    saldo?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    activa?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProyectoFinanzasCreateInput = {
    id_proyecto_finanzas?: string
    tenant_id: string
    proyecto_id: string
    anticipo_total?: Decimal | DecimalJsLike | number | string
    anticipo_usado?: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ProyectoFinanzasUncheckedCreateInput = {
    id_proyecto_finanzas?: string
    tenant_id: string
    proyecto_id: string
    anticipo_total?: Decimal | DecimalJsLike | number | string
    anticipo_usado?: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ProyectoFinanzasUpdateInput = {
    id_proyecto_finanzas?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    anticipo_total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    anticipo_usado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProyectoFinanzasUncheckedUpdateInput = {
    id_proyecto_finanzas?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    anticipo_total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    anticipo_usado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProyectoFinanzasCreateManyInput = {
    id_proyecto_finanzas?: string
    tenant_id: string
    proyecto_id: string
    anticipo_total?: Decimal | DecimalJsLike | number | string
    anticipo_usado?: Decimal | DecimalJsLike | number | string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ProyectoFinanzasUpdateManyMutationInput = {
    id_proyecto_finanzas?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    anticipo_total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    anticipo_usado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProyectoFinanzasUncheckedUpdateManyInput = {
    id_proyecto_finanzas?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    anticipo_total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    anticipo_usado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PagoOCCreateInput = {
    id_pago?: string
    tenant_id: string
    proyecto_id: string
    fuente: string
    tipo_pago: string
    referencia: string
    concepto: string
    fecha_pago: Date | string
    monto_total: Decimal | DecimalJsLike | number | string
    moneda?: string
    usuario_id: string
    created_at?: Date | string
    cuenta?: CuentaBancariaCreateNestedOneWithoutPagosInput
    detalles?: DetallePagoOCCreateNestedManyWithoutPagoInput
  }

  export type PagoOCUncheckedCreateInput = {
    id_pago?: string
    tenant_id: string
    proyecto_id: string
    fuente: string
    cuenta_id?: string | null
    tipo_pago: string
    referencia: string
    concepto: string
    fecha_pago: Date | string
    monto_total: Decimal | DecimalJsLike | number | string
    moneda?: string
    usuario_id: string
    created_at?: Date | string
    detalles?: DetallePagoOCUncheckedCreateNestedManyWithoutPagoInput
  }

  export type PagoOCUpdateInput = {
    id_pago?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    fuente?: StringFieldUpdateOperationsInput | string
    tipo_pago?: StringFieldUpdateOperationsInput | string
    referencia?: StringFieldUpdateOperationsInput | string
    concepto?: StringFieldUpdateOperationsInput | string
    fecha_pago?: DateTimeFieldUpdateOperationsInput | Date | string
    monto_total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    usuario_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    cuenta?: CuentaBancariaUpdateOneWithoutPagosNestedInput
    detalles?: DetallePagoOCUpdateManyWithoutPagoNestedInput
  }

  export type PagoOCUncheckedUpdateInput = {
    id_pago?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    fuente?: StringFieldUpdateOperationsInput | string
    cuenta_id?: NullableStringFieldUpdateOperationsInput | string | null
    tipo_pago?: StringFieldUpdateOperationsInput | string
    referencia?: StringFieldUpdateOperationsInput | string
    concepto?: StringFieldUpdateOperationsInput | string
    fecha_pago?: DateTimeFieldUpdateOperationsInput | Date | string
    monto_total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    usuario_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    detalles?: DetallePagoOCUncheckedUpdateManyWithoutPagoNestedInput
  }

  export type PagoOCCreateManyInput = {
    id_pago?: string
    tenant_id: string
    proyecto_id: string
    fuente: string
    cuenta_id?: string | null
    tipo_pago: string
    referencia: string
    concepto: string
    fecha_pago: Date | string
    monto_total: Decimal | DecimalJsLike | number | string
    moneda?: string
    usuario_id: string
    created_at?: Date | string
  }

  export type PagoOCUpdateManyMutationInput = {
    id_pago?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    fuente?: StringFieldUpdateOperationsInput | string
    tipo_pago?: StringFieldUpdateOperationsInput | string
    referencia?: StringFieldUpdateOperationsInput | string
    concepto?: StringFieldUpdateOperationsInput | string
    fecha_pago?: DateTimeFieldUpdateOperationsInput | Date | string
    monto_total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    usuario_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PagoOCUncheckedUpdateManyInput = {
    id_pago?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    fuente?: StringFieldUpdateOperationsInput | string
    cuenta_id?: NullableStringFieldUpdateOperationsInput | string | null
    tipo_pago?: StringFieldUpdateOperationsInput | string
    referencia?: StringFieldUpdateOperationsInput | string
    concepto?: StringFieldUpdateOperationsInput | string
    fecha_pago?: DateTimeFieldUpdateOperationsInput | Date | string
    monto_total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    usuario_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DetallePagoOCCreateInput = {
    id_detalle?: string
    oc_id: string
    oc_codigo: string
    proveedor_id: string
    proveedor_nombre: string
    monto_aplicado: Decimal | DecimalJsLike | number | string
    saldo_oc_antes: Decimal | DecimalJsLike | number | string
    saldo_oc_despues: Decimal | DecimalJsLike | number | string
    pago: PagoOCCreateNestedOneWithoutDetallesInput
  }

  export type DetallePagoOCUncheckedCreateInput = {
    id_detalle?: string
    pago_id: string
    oc_id: string
    oc_codigo: string
    proveedor_id: string
    proveedor_nombre: string
    monto_aplicado: Decimal | DecimalJsLike | number | string
    saldo_oc_antes: Decimal | DecimalJsLike | number | string
    saldo_oc_despues: Decimal | DecimalJsLike | number | string
  }

  export type DetallePagoOCUpdateInput = {
    id_detalle?: StringFieldUpdateOperationsInput | string
    oc_id?: StringFieldUpdateOperationsInput | string
    oc_codigo?: StringFieldUpdateOperationsInput | string
    proveedor_id?: StringFieldUpdateOperationsInput | string
    proveedor_nombre?: StringFieldUpdateOperationsInput | string
    monto_aplicado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    saldo_oc_antes?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    saldo_oc_despues?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    pago?: PagoOCUpdateOneRequiredWithoutDetallesNestedInput
  }

  export type DetallePagoOCUncheckedUpdateInput = {
    id_detalle?: StringFieldUpdateOperationsInput | string
    pago_id?: StringFieldUpdateOperationsInput | string
    oc_id?: StringFieldUpdateOperationsInput | string
    oc_codigo?: StringFieldUpdateOperationsInput | string
    proveedor_id?: StringFieldUpdateOperationsInput | string
    proveedor_nombre?: StringFieldUpdateOperationsInput | string
    monto_aplicado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    saldo_oc_antes?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    saldo_oc_despues?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
  }

  export type DetallePagoOCCreateManyInput = {
    id_detalle?: string
    pago_id: string
    oc_id: string
    oc_codigo: string
    proveedor_id: string
    proveedor_nombre: string
    monto_aplicado: Decimal | DecimalJsLike | number | string
    saldo_oc_antes: Decimal | DecimalJsLike | number | string
    saldo_oc_despues: Decimal | DecimalJsLike | number | string
  }

  export type DetallePagoOCUpdateManyMutationInput = {
    id_detalle?: StringFieldUpdateOperationsInput | string
    oc_id?: StringFieldUpdateOperationsInput | string
    oc_codigo?: StringFieldUpdateOperationsInput | string
    proveedor_id?: StringFieldUpdateOperationsInput | string
    proveedor_nombre?: StringFieldUpdateOperationsInput | string
    monto_aplicado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    saldo_oc_antes?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    saldo_oc_despues?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
  }

  export type DetallePagoOCUncheckedUpdateManyInput = {
    id_detalle?: StringFieldUpdateOperationsInput | string
    pago_id?: StringFieldUpdateOperationsInput | string
    oc_id?: StringFieldUpdateOperationsInput | string
    oc_codigo?: StringFieldUpdateOperationsInput | string
    proveedor_id?: StringFieldUpdateOperationsInput | string
    proveedor_nombre?: StringFieldUpdateOperationsInput | string
    monto_aplicado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    saldo_oc_antes?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    saldo_oc_despues?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
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

  export type MovimientoPresupuestalListRelationFilter = {
    every?: MovimientoPresupuestalWhereInput
    some?: MovimientoPresupuestalWhereInput
    none?: MovimientoPresupuestalWhereInput
  }

  export type ProgramaPagosListRelationFilter = {
    every?: ProgramaPagosWhereInput
    some?: ProgramaPagosWhereInput
    none?: ProgramaPagosWhereInput
  }

  export type MovimientoPresupuestalOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ProgramaPagosOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PresupuestoAsignadoTenant_idProyecto_idCodigoCompoundUniqueInput = {
    tenant_id: string
    proyecto_id: string
    codigo: string
  }

  export type PresupuestoAsignadoCountOrderByAggregateInput = {
    id_presupuesto?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    codigo?: SortOrder
    descripcion?: SortOrder
    monto_autorizado?: SortOrder
    monto_ejercido?: SortOrder
    monto_comprometido?: SortOrder
    monto_disponible?: SortOrder
    moneda?: SortOrder
    capitulo?: SortOrder
    estatus?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type PresupuestoAsignadoAvgOrderByAggregateInput = {
    monto_autorizado?: SortOrder
    monto_ejercido?: SortOrder
    monto_comprometido?: SortOrder
    monto_disponible?: SortOrder
  }

  export type PresupuestoAsignadoMaxOrderByAggregateInput = {
    id_presupuesto?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    codigo?: SortOrder
    descripcion?: SortOrder
    monto_autorizado?: SortOrder
    monto_ejercido?: SortOrder
    monto_comprometido?: SortOrder
    monto_disponible?: SortOrder
    moneda?: SortOrder
    capitulo?: SortOrder
    estatus?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type PresupuestoAsignadoMinOrderByAggregateInput = {
    id_presupuesto?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    codigo?: SortOrder
    descripcion?: SortOrder
    monto_autorizado?: SortOrder
    monto_ejercido?: SortOrder
    monto_comprometido?: SortOrder
    monto_disponible?: SortOrder
    moneda?: SortOrder
    capitulo?: SortOrder
    estatus?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type PresupuestoAsignadoSumOrderByAggregateInput = {
    monto_autorizado?: SortOrder
    monto_ejercido?: SortOrder
    monto_comprometido?: SortOrder
    monto_disponible?: SortOrder
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

  export type PresupuestoAsignadoRelationFilter = {
    is?: PresupuestoAsignadoWhereInput
    isNot?: PresupuestoAsignadoWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type MovimientoPresupuestalCountOrderByAggregateInput = {
    id_movimiento?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    presupuesto_id?: SortOrder
    tipo?: SortOrder
    concepto?: SortOrder
    monto?: SortOrder
    moneda?: SortOrder
    referencia_modulo?: SortOrder
    referencia_entidad?: SortOrder
    referencia_id?: SortOrder
    referencia_codigo?: SortOrder
    usuario_id?: SortOrder
    fecha_registro?: SortOrder
    notas?: SortOrder
  }

  export type MovimientoPresupuestalAvgOrderByAggregateInput = {
    monto?: SortOrder
  }

  export type MovimientoPresupuestalMaxOrderByAggregateInput = {
    id_movimiento?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    presupuesto_id?: SortOrder
    tipo?: SortOrder
    concepto?: SortOrder
    monto?: SortOrder
    moneda?: SortOrder
    referencia_modulo?: SortOrder
    referencia_entidad?: SortOrder
    referencia_id?: SortOrder
    referencia_codigo?: SortOrder
    usuario_id?: SortOrder
    fecha_registro?: SortOrder
    notas?: SortOrder
  }

  export type MovimientoPresupuestalMinOrderByAggregateInput = {
    id_movimiento?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    presupuesto_id?: SortOrder
    tipo?: SortOrder
    concepto?: SortOrder
    monto?: SortOrder
    moneda?: SortOrder
    referencia_modulo?: SortOrder
    referencia_entidad?: SortOrder
    referencia_id?: SortOrder
    referencia_codigo?: SortOrder
    usuario_id?: SortOrder
    fecha_registro?: SortOrder
    notas?: SortOrder
  }

  export type MovimientoPresupuestalSumOrderByAggregateInput = {
    monto?: SortOrder
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

  export type ProgramaPagosCountOrderByAggregateInput = {
    id_pago?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    presupuesto_id?: SortOrder
    concepto?: SortOrder
    beneficiario?: SortOrder
    beneficiario_id?: SortOrder
    monto_programado?: SortOrder
    monto_pagado?: SortOrder
    moneda?: SortOrder
    fecha_programada?: SortOrder
    fecha_pago_real?: SortOrder
    estado?: SortOrder
    referencia_modulo?: SortOrder
    referencia_entidad?: SortOrder
    referencia_id?: SortOrder
    metodo_pago?: SortOrder
    banco?: SortOrder
    referencia_bancaria?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ProgramaPagosAvgOrderByAggregateInput = {
    monto_programado?: SortOrder
    monto_pagado?: SortOrder
  }

  export type ProgramaPagosMaxOrderByAggregateInput = {
    id_pago?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    presupuesto_id?: SortOrder
    concepto?: SortOrder
    beneficiario?: SortOrder
    beneficiario_id?: SortOrder
    monto_programado?: SortOrder
    monto_pagado?: SortOrder
    moneda?: SortOrder
    fecha_programada?: SortOrder
    fecha_pago_real?: SortOrder
    estado?: SortOrder
    referencia_modulo?: SortOrder
    referencia_entidad?: SortOrder
    referencia_id?: SortOrder
    metodo_pago?: SortOrder
    banco?: SortOrder
    referencia_bancaria?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ProgramaPagosMinOrderByAggregateInput = {
    id_pago?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    presupuesto_id?: SortOrder
    concepto?: SortOrder
    beneficiario?: SortOrder
    beneficiario_id?: SortOrder
    monto_programado?: SortOrder
    monto_pagado?: SortOrder
    moneda?: SortOrder
    fecha_programada?: SortOrder
    fecha_pago_real?: SortOrder
    estado?: SortOrder
    referencia_modulo?: SortOrder
    referencia_entidad?: SortOrder
    referencia_id?: SortOrder
    metodo_pago?: SortOrder
    banco?: SortOrder
    referencia_bancaria?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ProgramaPagosSumOrderByAggregateInput = {
    monto_programado?: SortOrder
    monto_pagado?: SortOrder
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

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type PagoOCListRelationFilter = {
    every?: PagoOCWhereInput
    some?: PagoOCWhereInput
    none?: PagoOCWhereInput
  }

  export type PagoOCOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CuentaBancariaCountOrderByAggregateInput = {
    id_cuenta?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    banco?: SortOrder
    numero_cuenta?: SortOrder
    clabe?: SortOrder
    alias?: SortOrder
    moneda?: SortOrder
    saldo?: SortOrder
    activa?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type CuentaBancariaAvgOrderByAggregateInput = {
    saldo?: SortOrder
  }

  export type CuentaBancariaMaxOrderByAggregateInput = {
    id_cuenta?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    banco?: SortOrder
    numero_cuenta?: SortOrder
    clabe?: SortOrder
    alias?: SortOrder
    moneda?: SortOrder
    saldo?: SortOrder
    activa?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type CuentaBancariaMinOrderByAggregateInput = {
    id_cuenta?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    banco?: SortOrder
    numero_cuenta?: SortOrder
    clabe?: SortOrder
    alias?: SortOrder
    moneda?: SortOrder
    saldo?: SortOrder
    activa?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type CuentaBancariaSumOrderByAggregateInput = {
    saldo?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type ProyectoFinanzasTenant_idProyecto_idCompoundUniqueInput = {
    tenant_id: string
    proyecto_id: string
  }

  export type ProyectoFinanzasCountOrderByAggregateInput = {
    id_proyecto_finanzas?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    anticipo_total?: SortOrder
    anticipo_usado?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ProyectoFinanzasAvgOrderByAggregateInput = {
    anticipo_total?: SortOrder
    anticipo_usado?: SortOrder
  }

  export type ProyectoFinanzasMaxOrderByAggregateInput = {
    id_proyecto_finanzas?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    anticipo_total?: SortOrder
    anticipo_usado?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ProyectoFinanzasMinOrderByAggregateInput = {
    id_proyecto_finanzas?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    anticipo_total?: SortOrder
    anticipo_usado?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ProyectoFinanzasSumOrderByAggregateInput = {
    anticipo_total?: SortOrder
    anticipo_usado?: SortOrder
  }

  export type CuentaBancariaNullableRelationFilter = {
    is?: CuentaBancariaWhereInput | null
    isNot?: CuentaBancariaWhereInput | null
  }

  export type DetallePagoOCListRelationFilter = {
    every?: DetallePagoOCWhereInput
    some?: DetallePagoOCWhereInput
    none?: DetallePagoOCWhereInput
  }

  export type DetallePagoOCOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PagoOCCountOrderByAggregateInput = {
    id_pago?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    fuente?: SortOrder
    cuenta_id?: SortOrder
    tipo_pago?: SortOrder
    referencia?: SortOrder
    concepto?: SortOrder
    fecha_pago?: SortOrder
    monto_total?: SortOrder
    moneda?: SortOrder
    usuario_id?: SortOrder
    created_at?: SortOrder
  }

  export type PagoOCAvgOrderByAggregateInput = {
    monto_total?: SortOrder
  }

  export type PagoOCMaxOrderByAggregateInput = {
    id_pago?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    fuente?: SortOrder
    cuenta_id?: SortOrder
    tipo_pago?: SortOrder
    referencia?: SortOrder
    concepto?: SortOrder
    fecha_pago?: SortOrder
    monto_total?: SortOrder
    moneda?: SortOrder
    usuario_id?: SortOrder
    created_at?: SortOrder
  }

  export type PagoOCMinOrderByAggregateInput = {
    id_pago?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    fuente?: SortOrder
    cuenta_id?: SortOrder
    tipo_pago?: SortOrder
    referencia?: SortOrder
    concepto?: SortOrder
    fecha_pago?: SortOrder
    monto_total?: SortOrder
    moneda?: SortOrder
    usuario_id?: SortOrder
    created_at?: SortOrder
  }

  export type PagoOCSumOrderByAggregateInput = {
    monto_total?: SortOrder
  }

  export type PagoOCRelationFilter = {
    is?: PagoOCWhereInput
    isNot?: PagoOCWhereInput
  }

  export type DetallePagoOCPago_idOc_idCompoundUniqueInput = {
    pago_id: string
    oc_id: string
  }

  export type DetallePagoOCCountOrderByAggregateInput = {
    id_detalle?: SortOrder
    pago_id?: SortOrder
    oc_id?: SortOrder
    oc_codigo?: SortOrder
    proveedor_id?: SortOrder
    proveedor_nombre?: SortOrder
    monto_aplicado?: SortOrder
    saldo_oc_antes?: SortOrder
    saldo_oc_despues?: SortOrder
  }

  export type DetallePagoOCAvgOrderByAggregateInput = {
    monto_aplicado?: SortOrder
    saldo_oc_antes?: SortOrder
    saldo_oc_despues?: SortOrder
  }

  export type DetallePagoOCMaxOrderByAggregateInput = {
    id_detalle?: SortOrder
    pago_id?: SortOrder
    oc_id?: SortOrder
    oc_codigo?: SortOrder
    proveedor_id?: SortOrder
    proveedor_nombre?: SortOrder
    monto_aplicado?: SortOrder
    saldo_oc_antes?: SortOrder
    saldo_oc_despues?: SortOrder
  }

  export type DetallePagoOCMinOrderByAggregateInput = {
    id_detalle?: SortOrder
    pago_id?: SortOrder
    oc_id?: SortOrder
    oc_codigo?: SortOrder
    proveedor_id?: SortOrder
    proveedor_nombre?: SortOrder
    monto_aplicado?: SortOrder
    saldo_oc_antes?: SortOrder
    saldo_oc_despues?: SortOrder
  }

  export type DetallePagoOCSumOrderByAggregateInput = {
    monto_aplicado?: SortOrder
    saldo_oc_antes?: SortOrder
    saldo_oc_despues?: SortOrder
  }

  export type MovimientoPresupuestalCreateNestedManyWithoutPresupuestoInput = {
    create?: XOR<MovimientoPresupuestalCreateWithoutPresupuestoInput, MovimientoPresupuestalUncheckedCreateWithoutPresupuestoInput> | MovimientoPresupuestalCreateWithoutPresupuestoInput[] | MovimientoPresupuestalUncheckedCreateWithoutPresupuestoInput[]
    connectOrCreate?: MovimientoPresupuestalCreateOrConnectWithoutPresupuestoInput | MovimientoPresupuestalCreateOrConnectWithoutPresupuestoInput[]
    createMany?: MovimientoPresupuestalCreateManyPresupuestoInputEnvelope
    connect?: MovimientoPresupuestalWhereUniqueInput | MovimientoPresupuestalWhereUniqueInput[]
  }

  export type ProgramaPagosCreateNestedManyWithoutPresupuestoInput = {
    create?: XOR<ProgramaPagosCreateWithoutPresupuestoInput, ProgramaPagosUncheckedCreateWithoutPresupuestoInput> | ProgramaPagosCreateWithoutPresupuestoInput[] | ProgramaPagosUncheckedCreateWithoutPresupuestoInput[]
    connectOrCreate?: ProgramaPagosCreateOrConnectWithoutPresupuestoInput | ProgramaPagosCreateOrConnectWithoutPresupuestoInput[]
    createMany?: ProgramaPagosCreateManyPresupuestoInputEnvelope
    connect?: ProgramaPagosWhereUniqueInput | ProgramaPagosWhereUniqueInput[]
  }

  export type MovimientoPresupuestalUncheckedCreateNestedManyWithoutPresupuestoInput = {
    create?: XOR<MovimientoPresupuestalCreateWithoutPresupuestoInput, MovimientoPresupuestalUncheckedCreateWithoutPresupuestoInput> | MovimientoPresupuestalCreateWithoutPresupuestoInput[] | MovimientoPresupuestalUncheckedCreateWithoutPresupuestoInput[]
    connectOrCreate?: MovimientoPresupuestalCreateOrConnectWithoutPresupuestoInput | MovimientoPresupuestalCreateOrConnectWithoutPresupuestoInput[]
    createMany?: MovimientoPresupuestalCreateManyPresupuestoInputEnvelope
    connect?: MovimientoPresupuestalWhereUniqueInput | MovimientoPresupuestalWhereUniqueInput[]
  }

  export type ProgramaPagosUncheckedCreateNestedManyWithoutPresupuestoInput = {
    create?: XOR<ProgramaPagosCreateWithoutPresupuestoInput, ProgramaPagosUncheckedCreateWithoutPresupuestoInput> | ProgramaPagosCreateWithoutPresupuestoInput[] | ProgramaPagosUncheckedCreateWithoutPresupuestoInput[]
    connectOrCreate?: ProgramaPagosCreateOrConnectWithoutPresupuestoInput | ProgramaPagosCreateOrConnectWithoutPresupuestoInput[]
    createMany?: ProgramaPagosCreateManyPresupuestoInputEnvelope
    connect?: ProgramaPagosWhereUniqueInput | ProgramaPagosWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
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

  export type MovimientoPresupuestalUpdateManyWithoutPresupuestoNestedInput = {
    create?: XOR<MovimientoPresupuestalCreateWithoutPresupuestoInput, MovimientoPresupuestalUncheckedCreateWithoutPresupuestoInput> | MovimientoPresupuestalCreateWithoutPresupuestoInput[] | MovimientoPresupuestalUncheckedCreateWithoutPresupuestoInput[]
    connectOrCreate?: MovimientoPresupuestalCreateOrConnectWithoutPresupuestoInput | MovimientoPresupuestalCreateOrConnectWithoutPresupuestoInput[]
    upsert?: MovimientoPresupuestalUpsertWithWhereUniqueWithoutPresupuestoInput | MovimientoPresupuestalUpsertWithWhereUniqueWithoutPresupuestoInput[]
    createMany?: MovimientoPresupuestalCreateManyPresupuestoInputEnvelope
    set?: MovimientoPresupuestalWhereUniqueInput | MovimientoPresupuestalWhereUniqueInput[]
    disconnect?: MovimientoPresupuestalWhereUniqueInput | MovimientoPresupuestalWhereUniqueInput[]
    delete?: MovimientoPresupuestalWhereUniqueInput | MovimientoPresupuestalWhereUniqueInput[]
    connect?: MovimientoPresupuestalWhereUniqueInput | MovimientoPresupuestalWhereUniqueInput[]
    update?: MovimientoPresupuestalUpdateWithWhereUniqueWithoutPresupuestoInput | MovimientoPresupuestalUpdateWithWhereUniqueWithoutPresupuestoInput[]
    updateMany?: MovimientoPresupuestalUpdateManyWithWhereWithoutPresupuestoInput | MovimientoPresupuestalUpdateManyWithWhereWithoutPresupuestoInput[]
    deleteMany?: MovimientoPresupuestalScalarWhereInput | MovimientoPresupuestalScalarWhereInput[]
  }

  export type ProgramaPagosUpdateManyWithoutPresupuestoNestedInput = {
    create?: XOR<ProgramaPagosCreateWithoutPresupuestoInput, ProgramaPagosUncheckedCreateWithoutPresupuestoInput> | ProgramaPagosCreateWithoutPresupuestoInput[] | ProgramaPagosUncheckedCreateWithoutPresupuestoInput[]
    connectOrCreate?: ProgramaPagosCreateOrConnectWithoutPresupuestoInput | ProgramaPagosCreateOrConnectWithoutPresupuestoInput[]
    upsert?: ProgramaPagosUpsertWithWhereUniqueWithoutPresupuestoInput | ProgramaPagosUpsertWithWhereUniqueWithoutPresupuestoInput[]
    createMany?: ProgramaPagosCreateManyPresupuestoInputEnvelope
    set?: ProgramaPagosWhereUniqueInput | ProgramaPagosWhereUniqueInput[]
    disconnect?: ProgramaPagosWhereUniqueInput | ProgramaPagosWhereUniqueInput[]
    delete?: ProgramaPagosWhereUniqueInput | ProgramaPagosWhereUniqueInput[]
    connect?: ProgramaPagosWhereUniqueInput | ProgramaPagosWhereUniqueInput[]
    update?: ProgramaPagosUpdateWithWhereUniqueWithoutPresupuestoInput | ProgramaPagosUpdateWithWhereUniqueWithoutPresupuestoInput[]
    updateMany?: ProgramaPagosUpdateManyWithWhereWithoutPresupuestoInput | ProgramaPagosUpdateManyWithWhereWithoutPresupuestoInput[]
    deleteMany?: ProgramaPagosScalarWhereInput | ProgramaPagosScalarWhereInput[]
  }

  export type MovimientoPresupuestalUncheckedUpdateManyWithoutPresupuestoNestedInput = {
    create?: XOR<MovimientoPresupuestalCreateWithoutPresupuestoInput, MovimientoPresupuestalUncheckedCreateWithoutPresupuestoInput> | MovimientoPresupuestalCreateWithoutPresupuestoInput[] | MovimientoPresupuestalUncheckedCreateWithoutPresupuestoInput[]
    connectOrCreate?: MovimientoPresupuestalCreateOrConnectWithoutPresupuestoInput | MovimientoPresupuestalCreateOrConnectWithoutPresupuestoInput[]
    upsert?: MovimientoPresupuestalUpsertWithWhereUniqueWithoutPresupuestoInput | MovimientoPresupuestalUpsertWithWhereUniqueWithoutPresupuestoInput[]
    createMany?: MovimientoPresupuestalCreateManyPresupuestoInputEnvelope
    set?: MovimientoPresupuestalWhereUniqueInput | MovimientoPresupuestalWhereUniqueInput[]
    disconnect?: MovimientoPresupuestalWhereUniqueInput | MovimientoPresupuestalWhereUniqueInput[]
    delete?: MovimientoPresupuestalWhereUniqueInput | MovimientoPresupuestalWhereUniqueInput[]
    connect?: MovimientoPresupuestalWhereUniqueInput | MovimientoPresupuestalWhereUniqueInput[]
    update?: MovimientoPresupuestalUpdateWithWhereUniqueWithoutPresupuestoInput | MovimientoPresupuestalUpdateWithWhereUniqueWithoutPresupuestoInput[]
    updateMany?: MovimientoPresupuestalUpdateManyWithWhereWithoutPresupuestoInput | MovimientoPresupuestalUpdateManyWithWhereWithoutPresupuestoInput[]
    deleteMany?: MovimientoPresupuestalScalarWhereInput | MovimientoPresupuestalScalarWhereInput[]
  }

  export type ProgramaPagosUncheckedUpdateManyWithoutPresupuestoNestedInput = {
    create?: XOR<ProgramaPagosCreateWithoutPresupuestoInput, ProgramaPagosUncheckedCreateWithoutPresupuestoInput> | ProgramaPagosCreateWithoutPresupuestoInput[] | ProgramaPagosUncheckedCreateWithoutPresupuestoInput[]
    connectOrCreate?: ProgramaPagosCreateOrConnectWithoutPresupuestoInput | ProgramaPagosCreateOrConnectWithoutPresupuestoInput[]
    upsert?: ProgramaPagosUpsertWithWhereUniqueWithoutPresupuestoInput | ProgramaPagosUpsertWithWhereUniqueWithoutPresupuestoInput[]
    createMany?: ProgramaPagosCreateManyPresupuestoInputEnvelope
    set?: ProgramaPagosWhereUniqueInput | ProgramaPagosWhereUniqueInput[]
    disconnect?: ProgramaPagosWhereUniqueInput | ProgramaPagosWhereUniqueInput[]
    delete?: ProgramaPagosWhereUniqueInput | ProgramaPagosWhereUniqueInput[]
    connect?: ProgramaPagosWhereUniqueInput | ProgramaPagosWhereUniqueInput[]
    update?: ProgramaPagosUpdateWithWhereUniqueWithoutPresupuestoInput | ProgramaPagosUpdateWithWhereUniqueWithoutPresupuestoInput[]
    updateMany?: ProgramaPagosUpdateManyWithWhereWithoutPresupuestoInput | ProgramaPagosUpdateManyWithWhereWithoutPresupuestoInput[]
    deleteMany?: ProgramaPagosScalarWhereInput | ProgramaPagosScalarWhereInput[]
  }

  export type PresupuestoAsignadoCreateNestedOneWithoutMovimientosInput = {
    create?: XOR<PresupuestoAsignadoCreateWithoutMovimientosInput, PresupuestoAsignadoUncheckedCreateWithoutMovimientosInput>
    connectOrCreate?: PresupuestoAsignadoCreateOrConnectWithoutMovimientosInput
    connect?: PresupuestoAsignadoWhereUniqueInput
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type PresupuestoAsignadoUpdateOneRequiredWithoutMovimientosNestedInput = {
    create?: XOR<PresupuestoAsignadoCreateWithoutMovimientosInput, PresupuestoAsignadoUncheckedCreateWithoutMovimientosInput>
    connectOrCreate?: PresupuestoAsignadoCreateOrConnectWithoutMovimientosInput
    upsert?: PresupuestoAsignadoUpsertWithoutMovimientosInput
    connect?: PresupuestoAsignadoWhereUniqueInput
    update?: XOR<XOR<PresupuestoAsignadoUpdateToOneWithWhereWithoutMovimientosInput, PresupuestoAsignadoUpdateWithoutMovimientosInput>, PresupuestoAsignadoUncheckedUpdateWithoutMovimientosInput>
  }

  export type PresupuestoAsignadoCreateNestedOneWithoutPrograma_pagosInput = {
    create?: XOR<PresupuestoAsignadoCreateWithoutPrograma_pagosInput, PresupuestoAsignadoUncheckedCreateWithoutPrograma_pagosInput>
    connectOrCreate?: PresupuestoAsignadoCreateOrConnectWithoutPrograma_pagosInput
    connect?: PresupuestoAsignadoWhereUniqueInput
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type PresupuestoAsignadoUpdateOneRequiredWithoutPrograma_pagosNestedInput = {
    create?: XOR<PresupuestoAsignadoCreateWithoutPrograma_pagosInput, PresupuestoAsignadoUncheckedCreateWithoutPrograma_pagosInput>
    connectOrCreate?: PresupuestoAsignadoCreateOrConnectWithoutPrograma_pagosInput
    upsert?: PresupuestoAsignadoUpsertWithoutPrograma_pagosInput
    connect?: PresupuestoAsignadoWhereUniqueInput
    update?: XOR<XOR<PresupuestoAsignadoUpdateToOneWithWhereWithoutPrograma_pagosInput, PresupuestoAsignadoUpdateWithoutPrograma_pagosInput>, PresupuestoAsignadoUncheckedUpdateWithoutPrograma_pagosInput>
  }

  export type PagoOCCreateNestedManyWithoutCuentaInput = {
    create?: XOR<PagoOCCreateWithoutCuentaInput, PagoOCUncheckedCreateWithoutCuentaInput> | PagoOCCreateWithoutCuentaInput[] | PagoOCUncheckedCreateWithoutCuentaInput[]
    connectOrCreate?: PagoOCCreateOrConnectWithoutCuentaInput | PagoOCCreateOrConnectWithoutCuentaInput[]
    createMany?: PagoOCCreateManyCuentaInputEnvelope
    connect?: PagoOCWhereUniqueInput | PagoOCWhereUniqueInput[]
  }

  export type PagoOCUncheckedCreateNestedManyWithoutCuentaInput = {
    create?: XOR<PagoOCCreateWithoutCuentaInput, PagoOCUncheckedCreateWithoutCuentaInput> | PagoOCCreateWithoutCuentaInput[] | PagoOCUncheckedCreateWithoutCuentaInput[]
    connectOrCreate?: PagoOCCreateOrConnectWithoutCuentaInput | PagoOCCreateOrConnectWithoutCuentaInput[]
    createMany?: PagoOCCreateManyCuentaInputEnvelope
    connect?: PagoOCWhereUniqueInput | PagoOCWhereUniqueInput[]
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type PagoOCUpdateManyWithoutCuentaNestedInput = {
    create?: XOR<PagoOCCreateWithoutCuentaInput, PagoOCUncheckedCreateWithoutCuentaInput> | PagoOCCreateWithoutCuentaInput[] | PagoOCUncheckedCreateWithoutCuentaInput[]
    connectOrCreate?: PagoOCCreateOrConnectWithoutCuentaInput | PagoOCCreateOrConnectWithoutCuentaInput[]
    upsert?: PagoOCUpsertWithWhereUniqueWithoutCuentaInput | PagoOCUpsertWithWhereUniqueWithoutCuentaInput[]
    createMany?: PagoOCCreateManyCuentaInputEnvelope
    set?: PagoOCWhereUniqueInput | PagoOCWhereUniqueInput[]
    disconnect?: PagoOCWhereUniqueInput | PagoOCWhereUniqueInput[]
    delete?: PagoOCWhereUniqueInput | PagoOCWhereUniqueInput[]
    connect?: PagoOCWhereUniqueInput | PagoOCWhereUniqueInput[]
    update?: PagoOCUpdateWithWhereUniqueWithoutCuentaInput | PagoOCUpdateWithWhereUniqueWithoutCuentaInput[]
    updateMany?: PagoOCUpdateManyWithWhereWithoutCuentaInput | PagoOCUpdateManyWithWhereWithoutCuentaInput[]
    deleteMany?: PagoOCScalarWhereInput | PagoOCScalarWhereInput[]
  }

  export type PagoOCUncheckedUpdateManyWithoutCuentaNestedInput = {
    create?: XOR<PagoOCCreateWithoutCuentaInput, PagoOCUncheckedCreateWithoutCuentaInput> | PagoOCCreateWithoutCuentaInput[] | PagoOCUncheckedCreateWithoutCuentaInput[]
    connectOrCreate?: PagoOCCreateOrConnectWithoutCuentaInput | PagoOCCreateOrConnectWithoutCuentaInput[]
    upsert?: PagoOCUpsertWithWhereUniqueWithoutCuentaInput | PagoOCUpsertWithWhereUniqueWithoutCuentaInput[]
    createMany?: PagoOCCreateManyCuentaInputEnvelope
    set?: PagoOCWhereUniqueInput | PagoOCWhereUniqueInput[]
    disconnect?: PagoOCWhereUniqueInput | PagoOCWhereUniqueInput[]
    delete?: PagoOCWhereUniqueInput | PagoOCWhereUniqueInput[]
    connect?: PagoOCWhereUniqueInput | PagoOCWhereUniqueInput[]
    update?: PagoOCUpdateWithWhereUniqueWithoutCuentaInput | PagoOCUpdateWithWhereUniqueWithoutCuentaInput[]
    updateMany?: PagoOCUpdateManyWithWhereWithoutCuentaInput | PagoOCUpdateManyWithWhereWithoutCuentaInput[]
    deleteMany?: PagoOCScalarWhereInput | PagoOCScalarWhereInput[]
  }

  export type CuentaBancariaCreateNestedOneWithoutPagosInput = {
    create?: XOR<CuentaBancariaCreateWithoutPagosInput, CuentaBancariaUncheckedCreateWithoutPagosInput>
    connectOrCreate?: CuentaBancariaCreateOrConnectWithoutPagosInput
    connect?: CuentaBancariaWhereUniqueInput
  }

  export type DetallePagoOCCreateNestedManyWithoutPagoInput = {
    create?: XOR<DetallePagoOCCreateWithoutPagoInput, DetallePagoOCUncheckedCreateWithoutPagoInput> | DetallePagoOCCreateWithoutPagoInput[] | DetallePagoOCUncheckedCreateWithoutPagoInput[]
    connectOrCreate?: DetallePagoOCCreateOrConnectWithoutPagoInput | DetallePagoOCCreateOrConnectWithoutPagoInput[]
    createMany?: DetallePagoOCCreateManyPagoInputEnvelope
    connect?: DetallePagoOCWhereUniqueInput | DetallePagoOCWhereUniqueInput[]
  }

  export type DetallePagoOCUncheckedCreateNestedManyWithoutPagoInput = {
    create?: XOR<DetallePagoOCCreateWithoutPagoInput, DetallePagoOCUncheckedCreateWithoutPagoInput> | DetallePagoOCCreateWithoutPagoInput[] | DetallePagoOCUncheckedCreateWithoutPagoInput[]
    connectOrCreate?: DetallePagoOCCreateOrConnectWithoutPagoInput | DetallePagoOCCreateOrConnectWithoutPagoInput[]
    createMany?: DetallePagoOCCreateManyPagoInputEnvelope
    connect?: DetallePagoOCWhereUniqueInput | DetallePagoOCWhereUniqueInput[]
  }

  export type CuentaBancariaUpdateOneWithoutPagosNestedInput = {
    create?: XOR<CuentaBancariaCreateWithoutPagosInput, CuentaBancariaUncheckedCreateWithoutPagosInput>
    connectOrCreate?: CuentaBancariaCreateOrConnectWithoutPagosInput
    upsert?: CuentaBancariaUpsertWithoutPagosInput
    disconnect?: CuentaBancariaWhereInput | boolean
    delete?: CuentaBancariaWhereInput | boolean
    connect?: CuentaBancariaWhereUniqueInput
    update?: XOR<XOR<CuentaBancariaUpdateToOneWithWhereWithoutPagosInput, CuentaBancariaUpdateWithoutPagosInput>, CuentaBancariaUncheckedUpdateWithoutPagosInput>
  }

  export type DetallePagoOCUpdateManyWithoutPagoNestedInput = {
    create?: XOR<DetallePagoOCCreateWithoutPagoInput, DetallePagoOCUncheckedCreateWithoutPagoInput> | DetallePagoOCCreateWithoutPagoInput[] | DetallePagoOCUncheckedCreateWithoutPagoInput[]
    connectOrCreate?: DetallePagoOCCreateOrConnectWithoutPagoInput | DetallePagoOCCreateOrConnectWithoutPagoInput[]
    upsert?: DetallePagoOCUpsertWithWhereUniqueWithoutPagoInput | DetallePagoOCUpsertWithWhereUniqueWithoutPagoInput[]
    createMany?: DetallePagoOCCreateManyPagoInputEnvelope
    set?: DetallePagoOCWhereUniqueInput | DetallePagoOCWhereUniqueInput[]
    disconnect?: DetallePagoOCWhereUniqueInput | DetallePagoOCWhereUniqueInput[]
    delete?: DetallePagoOCWhereUniqueInput | DetallePagoOCWhereUniqueInput[]
    connect?: DetallePagoOCWhereUniqueInput | DetallePagoOCWhereUniqueInput[]
    update?: DetallePagoOCUpdateWithWhereUniqueWithoutPagoInput | DetallePagoOCUpdateWithWhereUniqueWithoutPagoInput[]
    updateMany?: DetallePagoOCUpdateManyWithWhereWithoutPagoInput | DetallePagoOCUpdateManyWithWhereWithoutPagoInput[]
    deleteMany?: DetallePagoOCScalarWhereInput | DetallePagoOCScalarWhereInput[]
  }

  export type DetallePagoOCUncheckedUpdateManyWithoutPagoNestedInput = {
    create?: XOR<DetallePagoOCCreateWithoutPagoInput, DetallePagoOCUncheckedCreateWithoutPagoInput> | DetallePagoOCCreateWithoutPagoInput[] | DetallePagoOCUncheckedCreateWithoutPagoInput[]
    connectOrCreate?: DetallePagoOCCreateOrConnectWithoutPagoInput | DetallePagoOCCreateOrConnectWithoutPagoInput[]
    upsert?: DetallePagoOCUpsertWithWhereUniqueWithoutPagoInput | DetallePagoOCUpsertWithWhereUniqueWithoutPagoInput[]
    createMany?: DetallePagoOCCreateManyPagoInputEnvelope
    set?: DetallePagoOCWhereUniqueInput | DetallePagoOCWhereUniqueInput[]
    disconnect?: DetallePagoOCWhereUniqueInput | DetallePagoOCWhereUniqueInput[]
    delete?: DetallePagoOCWhereUniqueInput | DetallePagoOCWhereUniqueInput[]
    connect?: DetallePagoOCWhereUniqueInput | DetallePagoOCWhereUniqueInput[]
    update?: DetallePagoOCUpdateWithWhereUniqueWithoutPagoInput | DetallePagoOCUpdateWithWhereUniqueWithoutPagoInput[]
    updateMany?: DetallePagoOCUpdateManyWithWhereWithoutPagoInput | DetallePagoOCUpdateManyWithWhereWithoutPagoInput[]
    deleteMany?: DetallePagoOCScalarWhereInput | DetallePagoOCScalarWhereInput[]
  }

  export type PagoOCCreateNestedOneWithoutDetallesInput = {
    create?: XOR<PagoOCCreateWithoutDetallesInput, PagoOCUncheckedCreateWithoutDetallesInput>
    connectOrCreate?: PagoOCCreateOrConnectWithoutDetallesInput
    connect?: PagoOCWhereUniqueInput
  }

  export type PagoOCUpdateOneRequiredWithoutDetallesNestedInput = {
    create?: XOR<PagoOCCreateWithoutDetallesInput, PagoOCUncheckedCreateWithoutDetallesInput>
    connectOrCreate?: PagoOCCreateOrConnectWithoutDetallesInput
    upsert?: PagoOCUpsertWithoutDetallesInput
    connect?: PagoOCWhereUniqueInput
    update?: XOR<XOR<PagoOCUpdateToOneWithWhereWithoutDetallesInput, PagoOCUpdateWithoutDetallesInput>, PagoOCUncheckedUpdateWithoutDetallesInput>
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

  export type MovimientoPresupuestalCreateWithoutPresupuestoInput = {
    id_movimiento?: string
    tenant_id: string
    proyecto_id: string
    tipo: string
    concepto: string
    monto: Decimal | DecimalJsLike | number | string
    moneda?: string
    referencia_modulo?: string | null
    referencia_entidad?: string | null
    referencia_id?: string | null
    referencia_codigo?: string | null
    usuario_id: string
    fecha_registro?: Date | string
    notas?: string | null
  }

  export type MovimientoPresupuestalUncheckedCreateWithoutPresupuestoInput = {
    id_movimiento?: string
    tenant_id: string
    proyecto_id: string
    tipo: string
    concepto: string
    monto: Decimal | DecimalJsLike | number | string
    moneda?: string
    referencia_modulo?: string | null
    referencia_entidad?: string | null
    referencia_id?: string | null
    referencia_codigo?: string | null
    usuario_id: string
    fecha_registro?: Date | string
    notas?: string | null
  }

  export type MovimientoPresupuestalCreateOrConnectWithoutPresupuestoInput = {
    where: MovimientoPresupuestalWhereUniqueInput
    create: XOR<MovimientoPresupuestalCreateWithoutPresupuestoInput, MovimientoPresupuestalUncheckedCreateWithoutPresupuestoInput>
  }

  export type MovimientoPresupuestalCreateManyPresupuestoInputEnvelope = {
    data: MovimientoPresupuestalCreateManyPresupuestoInput | MovimientoPresupuestalCreateManyPresupuestoInput[]
    skipDuplicates?: boolean
  }

  export type ProgramaPagosCreateWithoutPresupuestoInput = {
    id_pago?: string
    tenant_id: string
    proyecto_id: string
    concepto: string
    beneficiario: string
    beneficiario_id?: string | null
    monto_programado: Decimal | DecimalJsLike | number | string
    monto_pagado?: Decimal | DecimalJsLike | number | string
    moneda?: string
    fecha_programada: Date | string
    fecha_pago_real?: Date | string | null
    estado?: string
    referencia_modulo?: string | null
    referencia_entidad?: string | null
    referencia_id?: string | null
    metodo_pago?: string | null
    banco?: string | null
    referencia_bancaria?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ProgramaPagosUncheckedCreateWithoutPresupuestoInput = {
    id_pago?: string
    tenant_id: string
    proyecto_id: string
    concepto: string
    beneficiario: string
    beneficiario_id?: string | null
    monto_programado: Decimal | DecimalJsLike | number | string
    monto_pagado?: Decimal | DecimalJsLike | number | string
    moneda?: string
    fecha_programada: Date | string
    fecha_pago_real?: Date | string | null
    estado?: string
    referencia_modulo?: string | null
    referencia_entidad?: string | null
    referencia_id?: string | null
    metodo_pago?: string | null
    banco?: string | null
    referencia_bancaria?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ProgramaPagosCreateOrConnectWithoutPresupuestoInput = {
    where: ProgramaPagosWhereUniqueInput
    create: XOR<ProgramaPagosCreateWithoutPresupuestoInput, ProgramaPagosUncheckedCreateWithoutPresupuestoInput>
  }

  export type ProgramaPagosCreateManyPresupuestoInputEnvelope = {
    data: ProgramaPagosCreateManyPresupuestoInput | ProgramaPagosCreateManyPresupuestoInput[]
    skipDuplicates?: boolean
  }

  export type MovimientoPresupuestalUpsertWithWhereUniqueWithoutPresupuestoInput = {
    where: MovimientoPresupuestalWhereUniqueInput
    update: XOR<MovimientoPresupuestalUpdateWithoutPresupuestoInput, MovimientoPresupuestalUncheckedUpdateWithoutPresupuestoInput>
    create: XOR<MovimientoPresupuestalCreateWithoutPresupuestoInput, MovimientoPresupuestalUncheckedCreateWithoutPresupuestoInput>
  }

  export type MovimientoPresupuestalUpdateWithWhereUniqueWithoutPresupuestoInput = {
    where: MovimientoPresupuestalWhereUniqueInput
    data: XOR<MovimientoPresupuestalUpdateWithoutPresupuestoInput, MovimientoPresupuestalUncheckedUpdateWithoutPresupuestoInput>
  }

  export type MovimientoPresupuestalUpdateManyWithWhereWithoutPresupuestoInput = {
    where: MovimientoPresupuestalScalarWhereInput
    data: XOR<MovimientoPresupuestalUpdateManyMutationInput, MovimientoPresupuestalUncheckedUpdateManyWithoutPresupuestoInput>
  }

  export type MovimientoPresupuestalScalarWhereInput = {
    AND?: MovimientoPresupuestalScalarWhereInput | MovimientoPresupuestalScalarWhereInput[]
    OR?: MovimientoPresupuestalScalarWhereInput[]
    NOT?: MovimientoPresupuestalScalarWhereInput | MovimientoPresupuestalScalarWhereInput[]
    id_movimiento?: UuidFilter<"MovimientoPresupuestal"> | string
    tenant_id?: UuidFilter<"MovimientoPresupuestal"> | string
    proyecto_id?: UuidFilter<"MovimientoPresupuestal"> | string
    presupuesto_id?: UuidFilter<"MovimientoPresupuestal"> | string
    tipo?: StringFilter<"MovimientoPresupuestal"> | string
    concepto?: StringFilter<"MovimientoPresupuestal"> | string
    monto?: DecimalFilter<"MovimientoPresupuestal"> | Decimal | DecimalJsLike | number | string
    moneda?: StringFilter<"MovimientoPresupuestal"> | string
    referencia_modulo?: StringNullableFilter<"MovimientoPresupuestal"> | string | null
    referencia_entidad?: StringNullableFilter<"MovimientoPresupuestal"> | string | null
    referencia_id?: UuidNullableFilter<"MovimientoPresupuestal"> | string | null
    referencia_codigo?: StringNullableFilter<"MovimientoPresupuestal"> | string | null
    usuario_id?: UuidFilter<"MovimientoPresupuestal"> | string
    fecha_registro?: DateTimeFilter<"MovimientoPresupuestal"> | Date | string
    notas?: StringNullableFilter<"MovimientoPresupuestal"> | string | null
  }

  export type ProgramaPagosUpsertWithWhereUniqueWithoutPresupuestoInput = {
    where: ProgramaPagosWhereUniqueInput
    update: XOR<ProgramaPagosUpdateWithoutPresupuestoInput, ProgramaPagosUncheckedUpdateWithoutPresupuestoInput>
    create: XOR<ProgramaPagosCreateWithoutPresupuestoInput, ProgramaPagosUncheckedCreateWithoutPresupuestoInput>
  }

  export type ProgramaPagosUpdateWithWhereUniqueWithoutPresupuestoInput = {
    where: ProgramaPagosWhereUniqueInput
    data: XOR<ProgramaPagosUpdateWithoutPresupuestoInput, ProgramaPagosUncheckedUpdateWithoutPresupuestoInput>
  }

  export type ProgramaPagosUpdateManyWithWhereWithoutPresupuestoInput = {
    where: ProgramaPagosScalarWhereInput
    data: XOR<ProgramaPagosUpdateManyMutationInput, ProgramaPagosUncheckedUpdateManyWithoutPresupuestoInput>
  }

  export type ProgramaPagosScalarWhereInput = {
    AND?: ProgramaPagosScalarWhereInput | ProgramaPagosScalarWhereInput[]
    OR?: ProgramaPagosScalarWhereInput[]
    NOT?: ProgramaPagosScalarWhereInput | ProgramaPagosScalarWhereInput[]
    id_pago?: UuidFilter<"ProgramaPagos"> | string
    tenant_id?: UuidFilter<"ProgramaPagos"> | string
    proyecto_id?: UuidFilter<"ProgramaPagos"> | string
    presupuesto_id?: UuidFilter<"ProgramaPagos"> | string
    concepto?: StringFilter<"ProgramaPagos"> | string
    beneficiario?: StringFilter<"ProgramaPagos"> | string
    beneficiario_id?: UuidNullableFilter<"ProgramaPagos"> | string | null
    monto_programado?: DecimalFilter<"ProgramaPagos"> | Decimal | DecimalJsLike | number | string
    monto_pagado?: DecimalFilter<"ProgramaPagos"> | Decimal | DecimalJsLike | number | string
    moneda?: StringFilter<"ProgramaPagos"> | string
    fecha_programada?: DateTimeFilter<"ProgramaPagos"> | Date | string
    fecha_pago_real?: DateTimeNullableFilter<"ProgramaPagos"> | Date | string | null
    estado?: StringFilter<"ProgramaPagos"> | string
    referencia_modulo?: StringNullableFilter<"ProgramaPagos"> | string | null
    referencia_entidad?: StringNullableFilter<"ProgramaPagos"> | string | null
    referencia_id?: UuidNullableFilter<"ProgramaPagos"> | string | null
    metodo_pago?: StringNullableFilter<"ProgramaPagos"> | string | null
    banco?: StringNullableFilter<"ProgramaPagos"> | string | null
    referencia_bancaria?: StringNullableFilter<"ProgramaPagos"> | string | null
    created_at?: DateTimeFilter<"ProgramaPagos"> | Date | string
    updated_at?: DateTimeFilter<"ProgramaPagos"> | Date | string
  }

  export type PresupuestoAsignadoCreateWithoutMovimientosInput = {
    id_presupuesto?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    descripcion: string
    monto_autorizado: Decimal | DecimalJsLike | number | string
    monto_ejercido?: Decimal | DecimalJsLike | number | string
    monto_comprometido?: Decimal | DecimalJsLike | number | string
    monto_disponible?: Decimal | DecimalJsLike | number | string
    moneda?: string
    capitulo?: string
    estatus?: string
    created_at?: Date | string
    updated_at?: Date | string
    programa_pagos?: ProgramaPagosCreateNestedManyWithoutPresupuestoInput
  }

  export type PresupuestoAsignadoUncheckedCreateWithoutMovimientosInput = {
    id_presupuesto?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    descripcion: string
    monto_autorizado: Decimal | DecimalJsLike | number | string
    monto_ejercido?: Decimal | DecimalJsLike | number | string
    monto_comprometido?: Decimal | DecimalJsLike | number | string
    monto_disponible?: Decimal | DecimalJsLike | number | string
    moneda?: string
    capitulo?: string
    estatus?: string
    created_at?: Date | string
    updated_at?: Date | string
    programa_pagos?: ProgramaPagosUncheckedCreateNestedManyWithoutPresupuestoInput
  }

  export type PresupuestoAsignadoCreateOrConnectWithoutMovimientosInput = {
    where: PresupuestoAsignadoWhereUniqueInput
    create: XOR<PresupuestoAsignadoCreateWithoutMovimientosInput, PresupuestoAsignadoUncheckedCreateWithoutMovimientosInput>
  }

  export type PresupuestoAsignadoUpsertWithoutMovimientosInput = {
    update: XOR<PresupuestoAsignadoUpdateWithoutMovimientosInput, PresupuestoAsignadoUncheckedUpdateWithoutMovimientosInput>
    create: XOR<PresupuestoAsignadoCreateWithoutMovimientosInput, PresupuestoAsignadoUncheckedCreateWithoutMovimientosInput>
    where?: PresupuestoAsignadoWhereInput
  }

  export type PresupuestoAsignadoUpdateToOneWithWhereWithoutMovimientosInput = {
    where?: PresupuestoAsignadoWhereInput
    data: XOR<PresupuestoAsignadoUpdateWithoutMovimientosInput, PresupuestoAsignadoUncheckedUpdateWithoutMovimientosInput>
  }

  export type PresupuestoAsignadoUpdateWithoutMovimientosInput = {
    id_presupuesto?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    monto_autorizado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_ejercido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_comprometido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_disponible?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    capitulo?: StringFieldUpdateOperationsInput | string
    estatus?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    programa_pagos?: ProgramaPagosUpdateManyWithoutPresupuestoNestedInput
  }

  export type PresupuestoAsignadoUncheckedUpdateWithoutMovimientosInput = {
    id_presupuesto?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    monto_autorizado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_ejercido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_comprometido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_disponible?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    capitulo?: StringFieldUpdateOperationsInput | string
    estatus?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    programa_pagos?: ProgramaPagosUncheckedUpdateManyWithoutPresupuestoNestedInput
  }

  export type PresupuestoAsignadoCreateWithoutPrograma_pagosInput = {
    id_presupuesto?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    descripcion: string
    monto_autorizado: Decimal | DecimalJsLike | number | string
    monto_ejercido?: Decimal | DecimalJsLike | number | string
    monto_comprometido?: Decimal | DecimalJsLike | number | string
    monto_disponible?: Decimal | DecimalJsLike | number | string
    moneda?: string
    capitulo?: string
    estatus?: string
    created_at?: Date | string
    updated_at?: Date | string
    movimientos?: MovimientoPresupuestalCreateNestedManyWithoutPresupuestoInput
  }

  export type PresupuestoAsignadoUncheckedCreateWithoutPrograma_pagosInput = {
    id_presupuesto?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    descripcion: string
    monto_autorizado: Decimal | DecimalJsLike | number | string
    monto_ejercido?: Decimal | DecimalJsLike | number | string
    monto_comprometido?: Decimal | DecimalJsLike | number | string
    monto_disponible?: Decimal | DecimalJsLike | number | string
    moneda?: string
    capitulo?: string
    estatus?: string
    created_at?: Date | string
    updated_at?: Date | string
    movimientos?: MovimientoPresupuestalUncheckedCreateNestedManyWithoutPresupuestoInput
  }

  export type PresupuestoAsignadoCreateOrConnectWithoutPrograma_pagosInput = {
    where: PresupuestoAsignadoWhereUniqueInput
    create: XOR<PresupuestoAsignadoCreateWithoutPrograma_pagosInput, PresupuestoAsignadoUncheckedCreateWithoutPrograma_pagosInput>
  }

  export type PresupuestoAsignadoUpsertWithoutPrograma_pagosInput = {
    update: XOR<PresupuestoAsignadoUpdateWithoutPrograma_pagosInput, PresupuestoAsignadoUncheckedUpdateWithoutPrograma_pagosInput>
    create: XOR<PresupuestoAsignadoCreateWithoutPrograma_pagosInput, PresupuestoAsignadoUncheckedCreateWithoutPrograma_pagosInput>
    where?: PresupuestoAsignadoWhereInput
  }

  export type PresupuestoAsignadoUpdateToOneWithWhereWithoutPrograma_pagosInput = {
    where?: PresupuestoAsignadoWhereInput
    data: XOR<PresupuestoAsignadoUpdateWithoutPrograma_pagosInput, PresupuestoAsignadoUncheckedUpdateWithoutPrograma_pagosInput>
  }

  export type PresupuestoAsignadoUpdateWithoutPrograma_pagosInput = {
    id_presupuesto?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    monto_autorizado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_ejercido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_comprometido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_disponible?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    capitulo?: StringFieldUpdateOperationsInput | string
    estatus?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    movimientos?: MovimientoPresupuestalUpdateManyWithoutPresupuestoNestedInput
  }

  export type PresupuestoAsignadoUncheckedUpdateWithoutPrograma_pagosInput = {
    id_presupuesto?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    monto_autorizado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_ejercido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_comprometido?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_disponible?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    capitulo?: StringFieldUpdateOperationsInput | string
    estatus?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    movimientos?: MovimientoPresupuestalUncheckedUpdateManyWithoutPresupuestoNestedInput
  }

  export type PagoOCCreateWithoutCuentaInput = {
    id_pago?: string
    tenant_id: string
    proyecto_id: string
    fuente: string
    tipo_pago: string
    referencia: string
    concepto: string
    fecha_pago: Date | string
    monto_total: Decimal | DecimalJsLike | number | string
    moneda?: string
    usuario_id: string
    created_at?: Date | string
    detalles?: DetallePagoOCCreateNestedManyWithoutPagoInput
  }

  export type PagoOCUncheckedCreateWithoutCuentaInput = {
    id_pago?: string
    tenant_id: string
    proyecto_id: string
    fuente: string
    tipo_pago: string
    referencia: string
    concepto: string
    fecha_pago: Date | string
    monto_total: Decimal | DecimalJsLike | number | string
    moneda?: string
    usuario_id: string
    created_at?: Date | string
    detalles?: DetallePagoOCUncheckedCreateNestedManyWithoutPagoInput
  }

  export type PagoOCCreateOrConnectWithoutCuentaInput = {
    where: PagoOCWhereUniqueInput
    create: XOR<PagoOCCreateWithoutCuentaInput, PagoOCUncheckedCreateWithoutCuentaInput>
  }

  export type PagoOCCreateManyCuentaInputEnvelope = {
    data: PagoOCCreateManyCuentaInput | PagoOCCreateManyCuentaInput[]
    skipDuplicates?: boolean
  }

  export type PagoOCUpsertWithWhereUniqueWithoutCuentaInput = {
    where: PagoOCWhereUniqueInput
    update: XOR<PagoOCUpdateWithoutCuentaInput, PagoOCUncheckedUpdateWithoutCuentaInput>
    create: XOR<PagoOCCreateWithoutCuentaInput, PagoOCUncheckedCreateWithoutCuentaInput>
  }

  export type PagoOCUpdateWithWhereUniqueWithoutCuentaInput = {
    where: PagoOCWhereUniqueInput
    data: XOR<PagoOCUpdateWithoutCuentaInput, PagoOCUncheckedUpdateWithoutCuentaInput>
  }

  export type PagoOCUpdateManyWithWhereWithoutCuentaInput = {
    where: PagoOCScalarWhereInput
    data: XOR<PagoOCUpdateManyMutationInput, PagoOCUncheckedUpdateManyWithoutCuentaInput>
  }

  export type PagoOCScalarWhereInput = {
    AND?: PagoOCScalarWhereInput | PagoOCScalarWhereInput[]
    OR?: PagoOCScalarWhereInput[]
    NOT?: PagoOCScalarWhereInput | PagoOCScalarWhereInput[]
    id_pago?: UuidFilter<"PagoOC"> | string
    tenant_id?: UuidFilter<"PagoOC"> | string
    proyecto_id?: UuidFilter<"PagoOC"> | string
    fuente?: StringFilter<"PagoOC"> | string
    cuenta_id?: UuidNullableFilter<"PagoOC"> | string | null
    tipo_pago?: StringFilter<"PagoOC"> | string
    referencia?: StringFilter<"PagoOC"> | string
    concepto?: StringFilter<"PagoOC"> | string
    fecha_pago?: DateTimeFilter<"PagoOC"> | Date | string
    monto_total?: DecimalFilter<"PagoOC"> | Decimal | DecimalJsLike | number | string
    moneda?: StringFilter<"PagoOC"> | string
    usuario_id?: UuidFilter<"PagoOC"> | string
    created_at?: DateTimeFilter<"PagoOC"> | Date | string
  }

  export type CuentaBancariaCreateWithoutPagosInput = {
    id_cuenta?: string
    tenant_id: string
    proyecto_id?: string | null
    banco: string
    numero_cuenta: string
    clabe?: string | null
    alias: string
    moneda?: string
    saldo?: Decimal | DecimalJsLike | number | string
    activa?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type CuentaBancariaUncheckedCreateWithoutPagosInput = {
    id_cuenta?: string
    tenant_id: string
    proyecto_id?: string | null
    banco: string
    numero_cuenta: string
    clabe?: string | null
    alias: string
    moneda?: string
    saldo?: Decimal | DecimalJsLike | number | string
    activa?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type CuentaBancariaCreateOrConnectWithoutPagosInput = {
    where: CuentaBancariaWhereUniqueInput
    create: XOR<CuentaBancariaCreateWithoutPagosInput, CuentaBancariaUncheckedCreateWithoutPagosInput>
  }

  export type DetallePagoOCCreateWithoutPagoInput = {
    id_detalle?: string
    oc_id: string
    oc_codigo: string
    proveedor_id: string
    proveedor_nombre: string
    monto_aplicado: Decimal | DecimalJsLike | number | string
    saldo_oc_antes: Decimal | DecimalJsLike | number | string
    saldo_oc_despues: Decimal | DecimalJsLike | number | string
  }

  export type DetallePagoOCUncheckedCreateWithoutPagoInput = {
    id_detalle?: string
    oc_id: string
    oc_codigo: string
    proveedor_id: string
    proveedor_nombre: string
    monto_aplicado: Decimal | DecimalJsLike | number | string
    saldo_oc_antes: Decimal | DecimalJsLike | number | string
    saldo_oc_despues: Decimal | DecimalJsLike | number | string
  }

  export type DetallePagoOCCreateOrConnectWithoutPagoInput = {
    where: DetallePagoOCWhereUniqueInput
    create: XOR<DetallePagoOCCreateWithoutPagoInput, DetallePagoOCUncheckedCreateWithoutPagoInput>
  }

  export type DetallePagoOCCreateManyPagoInputEnvelope = {
    data: DetallePagoOCCreateManyPagoInput | DetallePagoOCCreateManyPagoInput[]
    skipDuplicates?: boolean
  }

  export type CuentaBancariaUpsertWithoutPagosInput = {
    update: XOR<CuentaBancariaUpdateWithoutPagosInput, CuentaBancariaUncheckedUpdateWithoutPagosInput>
    create: XOR<CuentaBancariaCreateWithoutPagosInput, CuentaBancariaUncheckedCreateWithoutPagosInput>
    where?: CuentaBancariaWhereInput
  }

  export type CuentaBancariaUpdateToOneWithWhereWithoutPagosInput = {
    where?: CuentaBancariaWhereInput
    data: XOR<CuentaBancariaUpdateWithoutPagosInput, CuentaBancariaUncheckedUpdateWithoutPagosInput>
  }

  export type CuentaBancariaUpdateWithoutPagosInput = {
    id_cuenta?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: NullableStringFieldUpdateOperationsInput | string | null
    banco?: StringFieldUpdateOperationsInput | string
    numero_cuenta?: StringFieldUpdateOperationsInput | string
    clabe?: NullableStringFieldUpdateOperationsInput | string | null
    alias?: StringFieldUpdateOperationsInput | string
    moneda?: StringFieldUpdateOperationsInput | string
    saldo?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    activa?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CuentaBancariaUncheckedUpdateWithoutPagosInput = {
    id_cuenta?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: NullableStringFieldUpdateOperationsInput | string | null
    banco?: StringFieldUpdateOperationsInput | string
    numero_cuenta?: StringFieldUpdateOperationsInput | string
    clabe?: NullableStringFieldUpdateOperationsInput | string | null
    alias?: StringFieldUpdateOperationsInput | string
    moneda?: StringFieldUpdateOperationsInput | string
    saldo?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    activa?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DetallePagoOCUpsertWithWhereUniqueWithoutPagoInput = {
    where: DetallePagoOCWhereUniqueInput
    update: XOR<DetallePagoOCUpdateWithoutPagoInput, DetallePagoOCUncheckedUpdateWithoutPagoInput>
    create: XOR<DetallePagoOCCreateWithoutPagoInput, DetallePagoOCUncheckedCreateWithoutPagoInput>
  }

  export type DetallePagoOCUpdateWithWhereUniqueWithoutPagoInput = {
    where: DetallePagoOCWhereUniqueInput
    data: XOR<DetallePagoOCUpdateWithoutPagoInput, DetallePagoOCUncheckedUpdateWithoutPagoInput>
  }

  export type DetallePagoOCUpdateManyWithWhereWithoutPagoInput = {
    where: DetallePagoOCScalarWhereInput
    data: XOR<DetallePagoOCUpdateManyMutationInput, DetallePagoOCUncheckedUpdateManyWithoutPagoInput>
  }

  export type DetallePagoOCScalarWhereInput = {
    AND?: DetallePagoOCScalarWhereInput | DetallePagoOCScalarWhereInput[]
    OR?: DetallePagoOCScalarWhereInput[]
    NOT?: DetallePagoOCScalarWhereInput | DetallePagoOCScalarWhereInput[]
    id_detalle?: UuidFilter<"DetallePagoOC"> | string
    pago_id?: UuidFilter<"DetallePagoOC"> | string
    oc_id?: UuidFilter<"DetallePagoOC"> | string
    oc_codigo?: StringFilter<"DetallePagoOC"> | string
    proveedor_id?: UuidFilter<"DetallePagoOC"> | string
    proveedor_nombre?: StringFilter<"DetallePagoOC"> | string
    monto_aplicado?: DecimalFilter<"DetallePagoOC"> | Decimal | DecimalJsLike | number | string
    saldo_oc_antes?: DecimalFilter<"DetallePagoOC"> | Decimal | DecimalJsLike | number | string
    saldo_oc_despues?: DecimalFilter<"DetallePagoOC"> | Decimal | DecimalJsLike | number | string
  }

  export type PagoOCCreateWithoutDetallesInput = {
    id_pago?: string
    tenant_id: string
    proyecto_id: string
    fuente: string
    tipo_pago: string
    referencia: string
    concepto: string
    fecha_pago: Date | string
    monto_total: Decimal | DecimalJsLike | number | string
    moneda?: string
    usuario_id: string
    created_at?: Date | string
    cuenta?: CuentaBancariaCreateNestedOneWithoutPagosInput
  }

  export type PagoOCUncheckedCreateWithoutDetallesInput = {
    id_pago?: string
    tenant_id: string
    proyecto_id: string
    fuente: string
    cuenta_id?: string | null
    tipo_pago: string
    referencia: string
    concepto: string
    fecha_pago: Date | string
    monto_total: Decimal | DecimalJsLike | number | string
    moneda?: string
    usuario_id: string
    created_at?: Date | string
  }

  export type PagoOCCreateOrConnectWithoutDetallesInput = {
    where: PagoOCWhereUniqueInput
    create: XOR<PagoOCCreateWithoutDetallesInput, PagoOCUncheckedCreateWithoutDetallesInput>
  }

  export type PagoOCUpsertWithoutDetallesInput = {
    update: XOR<PagoOCUpdateWithoutDetallesInput, PagoOCUncheckedUpdateWithoutDetallesInput>
    create: XOR<PagoOCCreateWithoutDetallesInput, PagoOCUncheckedCreateWithoutDetallesInput>
    where?: PagoOCWhereInput
  }

  export type PagoOCUpdateToOneWithWhereWithoutDetallesInput = {
    where?: PagoOCWhereInput
    data: XOR<PagoOCUpdateWithoutDetallesInput, PagoOCUncheckedUpdateWithoutDetallesInput>
  }

  export type PagoOCUpdateWithoutDetallesInput = {
    id_pago?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    fuente?: StringFieldUpdateOperationsInput | string
    tipo_pago?: StringFieldUpdateOperationsInput | string
    referencia?: StringFieldUpdateOperationsInput | string
    concepto?: StringFieldUpdateOperationsInput | string
    fecha_pago?: DateTimeFieldUpdateOperationsInput | Date | string
    monto_total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    usuario_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    cuenta?: CuentaBancariaUpdateOneWithoutPagosNestedInput
  }

  export type PagoOCUncheckedUpdateWithoutDetallesInput = {
    id_pago?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    fuente?: StringFieldUpdateOperationsInput | string
    cuenta_id?: NullableStringFieldUpdateOperationsInput | string | null
    tipo_pago?: StringFieldUpdateOperationsInput | string
    referencia?: StringFieldUpdateOperationsInput | string
    concepto?: StringFieldUpdateOperationsInput | string
    fecha_pago?: DateTimeFieldUpdateOperationsInput | Date | string
    monto_total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    usuario_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MovimientoPresupuestalCreateManyPresupuestoInput = {
    id_movimiento?: string
    tenant_id: string
    proyecto_id: string
    tipo: string
    concepto: string
    monto: Decimal | DecimalJsLike | number | string
    moneda?: string
    referencia_modulo?: string | null
    referencia_entidad?: string | null
    referencia_id?: string | null
    referencia_codigo?: string | null
    usuario_id: string
    fecha_registro?: Date | string
    notas?: string | null
  }

  export type ProgramaPagosCreateManyPresupuestoInput = {
    id_pago?: string
    tenant_id: string
    proyecto_id: string
    concepto: string
    beneficiario: string
    beneficiario_id?: string | null
    monto_programado: Decimal | DecimalJsLike | number | string
    monto_pagado?: Decimal | DecimalJsLike | number | string
    moneda?: string
    fecha_programada: Date | string
    fecha_pago_real?: Date | string | null
    estado?: string
    referencia_modulo?: string | null
    referencia_entidad?: string | null
    referencia_id?: string | null
    metodo_pago?: string | null
    banco?: string | null
    referencia_bancaria?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type MovimientoPresupuestalUpdateWithoutPresupuestoInput = {
    id_movimiento?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    concepto?: StringFieldUpdateOperationsInput | string
    monto?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    referencia_modulo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_entidad?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_id?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_codigo?: NullableStringFieldUpdateOperationsInput | string | null
    usuario_id?: StringFieldUpdateOperationsInput | string
    fecha_registro?: DateTimeFieldUpdateOperationsInput | Date | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type MovimientoPresupuestalUncheckedUpdateWithoutPresupuestoInput = {
    id_movimiento?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    concepto?: StringFieldUpdateOperationsInput | string
    monto?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    referencia_modulo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_entidad?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_id?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_codigo?: NullableStringFieldUpdateOperationsInput | string | null
    usuario_id?: StringFieldUpdateOperationsInput | string
    fecha_registro?: DateTimeFieldUpdateOperationsInput | Date | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type MovimientoPresupuestalUncheckedUpdateManyWithoutPresupuestoInput = {
    id_movimiento?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    concepto?: StringFieldUpdateOperationsInput | string
    monto?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    referencia_modulo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_entidad?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_id?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_codigo?: NullableStringFieldUpdateOperationsInput | string | null
    usuario_id?: StringFieldUpdateOperationsInput | string
    fecha_registro?: DateTimeFieldUpdateOperationsInput | Date | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ProgramaPagosUpdateWithoutPresupuestoInput = {
    id_pago?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    concepto?: StringFieldUpdateOperationsInput | string
    beneficiario?: StringFieldUpdateOperationsInput | string
    beneficiario_id?: NullableStringFieldUpdateOperationsInput | string | null
    monto_programado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_pagado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    fecha_programada?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_pago_real?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    referencia_modulo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_entidad?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_id?: NullableStringFieldUpdateOperationsInput | string | null
    metodo_pago?: NullableStringFieldUpdateOperationsInput | string | null
    banco?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_bancaria?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProgramaPagosUncheckedUpdateWithoutPresupuestoInput = {
    id_pago?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    concepto?: StringFieldUpdateOperationsInput | string
    beneficiario?: StringFieldUpdateOperationsInput | string
    beneficiario_id?: NullableStringFieldUpdateOperationsInput | string | null
    monto_programado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_pagado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    fecha_programada?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_pago_real?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    referencia_modulo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_entidad?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_id?: NullableStringFieldUpdateOperationsInput | string | null
    metodo_pago?: NullableStringFieldUpdateOperationsInput | string | null
    banco?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_bancaria?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProgramaPagosUncheckedUpdateManyWithoutPresupuestoInput = {
    id_pago?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    concepto?: StringFieldUpdateOperationsInput | string
    beneficiario?: StringFieldUpdateOperationsInput | string
    beneficiario_id?: NullableStringFieldUpdateOperationsInput | string | null
    monto_programado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    monto_pagado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    fecha_programada?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_pago_real?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    referencia_modulo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_entidad?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_id?: NullableStringFieldUpdateOperationsInput | string | null
    metodo_pago?: NullableStringFieldUpdateOperationsInput | string | null
    banco?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_bancaria?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PagoOCCreateManyCuentaInput = {
    id_pago?: string
    tenant_id: string
    proyecto_id: string
    fuente: string
    tipo_pago: string
    referencia: string
    concepto: string
    fecha_pago: Date | string
    monto_total: Decimal | DecimalJsLike | number | string
    moneda?: string
    usuario_id: string
    created_at?: Date | string
  }

  export type PagoOCUpdateWithoutCuentaInput = {
    id_pago?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    fuente?: StringFieldUpdateOperationsInput | string
    tipo_pago?: StringFieldUpdateOperationsInput | string
    referencia?: StringFieldUpdateOperationsInput | string
    concepto?: StringFieldUpdateOperationsInput | string
    fecha_pago?: DateTimeFieldUpdateOperationsInput | Date | string
    monto_total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    usuario_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    detalles?: DetallePagoOCUpdateManyWithoutPagoNestedInput
  }

  export type PagoOCUncheckedUpdateWithoutCuentaInput = {
    id_pago?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    fuente?: StringFieldUpdateOperationsInput | string
    tipo_pago?: StringFieldUpdateOperationsInput | string
    referencia?: StringFieldUpdateOperationsInput | string
    concepto?: StringFieldUpdateOperationsInput | string
    fecha_pago?: DateTimeFieldUpdateOperationsInput | Date | string
    monto_total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    usuario_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    detalles?: DetallePagoOCUncheckedUpdateManyWithoutPagoNestedInput
  }

  export type PagoOCUncheckedUpdateManyWithoutCuentaInput = {
    id_pago?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    fuente?: StringFieldUpdateOperationsInput | string
    tipo_pago?: StringFieldUpdateOperationsInput | string
    referencia?: StringFieldUpdateOperationsInput | string
    concepto?: StringFieldUpdateOperationsInput | string
    fecha_pago?: DateTimeFieldUpdateOperationsInput | Date | string
    monto_total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moneda?: StringFieldUpdateOperationsInput | string
    usuario_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DetallePagoOCCreateManyPagoInput = {
    id_detalle?: string
    oc_id: string
    oc_codigo: string
    proveedor_id: string
    proveedor_nombre: string
    monto_aplicado: Decimal | DecimalJsLike | number | string
    saldo_oc_antes: Decimal | DecimalJsLike | number | string
    saldo_oc_despues: Decimal | DecimalJsLike | number | string
  }

  export type DetallePagoOCUpdateWithoutPagoInput = {
    id_detalle?: StringFieldUpdateOperationsInput | string
    oc_id?: StringFieldUpdateOperationsInput | string
    oc_codigo?: StringFieldUpdateOperationsInput | string
    proveedor_id?: StringFieldUpdateOperationsInput | string
    proveedor_nombre?: StringFieldUpdateOperationsInput | string
    monto_aplicado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    saldo_oc_antes?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    saldo_oc_despues?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
  }

  export type DetallePagoOCUncheckedUpdateWithoutPagoInput = {
    id_detalle?: StringFieldUpdateOperationsInput | string
    oc_id?: StringFieldUpdateOperationsInput | string
    oc_codigo?: StringFieldUpdateOperationsInput | string
    proveedor_id?: StringFieldUpdateOperationsInput | string
    proveedor_nombre?: StringFieldUpdateOperationsInput | string
    monto_aplicado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    saldo_oc_antes?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    saldo_oc_despues?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
  }

  export type DetallePagoOCUncheckedUpdateManyWithoutPagoInput = {
    id_detalle?: StringFieldUpdateOperationsInput | string
    oc_id?: StringFieldUpdateOperationsInput | string
    oc_codigo?: StringFieldUpdateOperationsInput | string
    proveedor_id?: StringFieldUpdateOperationsInput | string
    proveedor_nombre?: StringFieldUpdateOperationsInput | string
    monto_aplicado?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    saldo_oc_antes?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    saldo_oc_despues?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use PresupuestoAsignadoCountOutputTypeDefaultArgs instead
     */
    export type PresupuestoAsignadoCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PresupuestoAsignadoCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CuentaBancariaCountOutputTypeDefaultArgs instead
     */
    export type CuentaBancariaCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CuentaBancariaCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PagoOCCountOutputTypeDefaultArgs instead
     */
    export type PagoOCCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PagoOCCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PresupuestoAsignadoDefaultArgs instead
     */
    export type PresupuestoAsignadoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PresupuestoAsignadoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use MovimientoPresupuestalDefaultArgs instead
     */
    export type MovimientoPresupuestalArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = MovimientoPresupuestalDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ProgramaPagosDefaultArgs instead
     */
    export type ProgramaPagosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProgramaPagosDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CuentaBancariaDefaultArgs instead
     */
    export type CuentaBancariaArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CuentaBancariaDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ProyectoFinanzasDefaultArgs instead
     */
    export type ProyectoFinanzasArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProyectoFinanzasDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PagoOCDefaultArgs instead
     */
    export type PagoOCArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PagoOCDefaultArgs<ExtArgs>
    /**
     * @deprecated Use DetallePagoOCDefaultArgs instead
     */
    export type DetallePagoOCArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = DetallePagoOCDefaultArgs<ExtArgs>

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