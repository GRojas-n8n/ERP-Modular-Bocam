
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
 * Model Incidente
 * 
 */
export type Incidente = $Result.DefaultSelection<Prisma.$IncidentePayload>
/**
 * Model InspeccionSeguridad
 * 
 */
export type InspeccionSeguridad = $Result.DefaultSelection<Prisma.$InspeccionSeguridadPayload>
/**
 * Model PermisoTrabajo
 * 
 */
export type PermisoTrabajo = $Result.DefaultSelection<Prisma.$PermisoTrabajoPayload>
/**
 * Model Capacitacion
 * 
 */
export type Capacitacion = $Result.DefaultSelection<Prisma.$CapacitacionPayload>
/**
 * Model RegistroCapacitacion
 * 
 */
export type RegistroCapacitacion = $Result.DefaultSelection<Prisma.$RegistroCapacitacionPayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Incidentes
 * const incidentes = await prisma.incidente.findMany()
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
   * // Fetch zero or more Incidentes
   * const incidentes = await prisma.incidente.findMany()
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
   * `prisma.incidente`: Exposes CRUD operations for the **Incidente** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Incidentes
    * const incidentes = await prisma.incidente.findMany()
    * ```
    */
  get incidente(): Prisma.IncidenteDelegate<ExtArgs>;

  /**
   * `prisma.inspeccionSeguridad`: Exposes CRUD operations for the **InspeccionSeguridad** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more InspeccionSeguridads
    * const inspeccionSeguridads = await prisma.inspeccionSeguridad.findMany()
    * ```
    */
  get inspeccionSeguridad(): Prisma.InspeccionSeguridadDelegate<ExtArgs>;

  /**
   * `prisma.permisoTrabajo`: Exposes CRUD operations for the **PermisoTrabajo** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PermisoTrabajos
    * const permisoTrabajos = await prisma.permisoTrabajo.findMany()
    * ```
    */
  get permisoTrabajo(): Prisma.PermisoTrabajoDelegate<ExtArgs>;

  /**
   * `prisma.capacitacion`: Exposes CRUD operations for the **Capacitacion** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Capacitacions
    * const capacitacions = await prisma.capacitacion.findMany()
    * ```
    */
  get capacitacion(): Prisma.CapacitacionDelegate<ExtArgs>;

  /**
   * `prisma.registroCapacitacion`: Exposes CRUD operations for the **RegistroCapacitacion** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more RegistroCapacitacions
    * const registroCapacitacions = await prisma.registroCapacitacion.findMany()
    * ```
    */
  get registroCapacitacion(): Prisma.RegistroCapacitacionDelegate<ExtArgs>;
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
    Incidente: 'Incidente',
    InspeccionSeguridad: 'InspeccionSeguridad',
    PermisoTrabajo: 'PermisoTrabajo',
    Capacitacion: 'Capacitacion',
    RegistroCapacitacion: 'RegistroCapacitacion'
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
      modelProps: "incidente" | "inspeccionSeguridad" | "permisoTrabajo" | "capacitacion" | "registroCapacitacion"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Incidente: {
        payload: Prisma.$IncidentePayload<ExtArgs>
        fields: Prisma.IncidenteFieldRefs
        operations: {
          findUnique: {
            args: Prisma.IncidenteFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IncidentePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.IncidenteFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IncidentePayload>
          }
          findFirst: {
            args: Prisma.IncidenteFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IncidentePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.IncidenteFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IncidentePayload>
          }
          findMany: {
            args: Prisma.IncidenteFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IncidentePayload>[]
          }
          create: {
            args: Prisma.IncidenteCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IncidentePayload>
          }
          createMany: {
            args: Prisma.IncidenteCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.IncidenteCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IncidentePayload>[]
          }
          delete: {
            args: Prisma.IncidenteDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IncidentePayload>
          }
          update: {
            args: Prisma.IncidenteUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IncidentePayload>
          }
          deleteMany: {
            args: Prisma.IncidenteDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.IncidenteUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.IncidenteUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IncidentePayload>
          }
          aggregate: {
            args: Prisma.IncidenteAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateIncidente>
          }
          groupBy: {
            args: Prisma.IncidenteGroupByArgs<ExtArgs>
            result: $Utils.Optional<IncidenteGroupByOutputType>[]
          }
          count: {
            args: Prisma.IncidenteCountArgs<ExtArgs>
            result: $Utils.Optional<IncidenteCountAggregateOutputType> | number
          }
        }
      }
      InspeccionSeguridad: {
        payload: Prisma.$InspeccionSeguridadPayload<ExtArgs>
        fields: Prisma.InspeccionSeguridadFieldRefs
        operations: {
          findUnique: {
            args: Prisma.InspeccionSeguridadFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InspeccionSeguridadPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.InspeccionSeguridadFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InspeccionSeguridadPayload>
          }
          findFirst: {
            args: Prisma.InspeccionSeguridadFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InspeccionSeguridadPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.InspeccionSeguridadFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InspeccionSeguridadPayload>
          }
          findMany: {
            args: Prisma.InspeccionSeguridadFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InspeccionSeguridadPayload>[]
          }
          create: {
            args: Prisma.InspeccionSeguridadCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InspeccionSeguridadPayload>
          }
          createMany: {
            args: Prisma.InspeccionSeguridadCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.InspeccionSeguridadCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InspeccionSeguridadPayload>[]
          }
          delete: {
            args: Prisma.InspeccionSeguridadDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InspeccionSeguridadPayload>
          }
          update: {
            args: Prisma.InspeccionSeguridadUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InspeccionSeguridadPayload>
          }
          deleteMany: {
            args: Prisma.InspeccionSeguridadDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.InspeccionSeguridadUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.InspeccionSeguridadUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InspeccionSeguridadPayload>
          }
          aggregate: {
            args: Prisma.InspeccionSeguridadAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateInspeccionSeguridad>
          }
          groupBy: {
            args: Prisma.InspeccionSeguridadGroupByArgs<ExtArgs>
            result: $Utils.Optional<InspeccionSeguridadGroupByOutputType>[]
          }
          count: {
            args: Prisma.InspeccionSeguridadCountArgs<ExtArgs>
            result: $Utils.Optional<InspeccionSeguridadCountAggregateOutputType> | number
          }
        }
      }
      PermisoTrabajo: {
        payload: Prisma.$PermisoTrabajoPayload<ExtArgs>
        fields: Prisma.PermisoTrabajoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PermisoTrabajoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PermisoTrabajoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PermisoTrabajoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PermisoTrabajoPayload>
          }
          findFirst: {
            args: Prisma.PermisoTrabajoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PermisoTrabajoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PermisoTrabajoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PermisoTrabajoPayload>
          }
          findMany: {
            args: Prisma.PermisoTrabajoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PermisoTrabajoPayload>[]
          }
          create: {
            args: Prisma.PermisoTrabajoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PermisoTrabajoPayload>
          }
          createMany: {
            args: Prisma.PermisoTrabajoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PermisoTrabajoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PermisoTrabajoPayload>[]
          }
          delete: {
            args: Prisma.PermisoTrabajoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PermisoTrabajoPayload>
          }
          update: {
            args: Prisma.PermisoTrabajoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PermisoTrabajoPayload>
          }
          deleteMany: {
            args: Prisma.PermisoTrabajoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PermisoTrabajoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PermisoTrabajoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PermisoTrabajoPayload>
          }
          aggregate: {
            args: Prisma.PermisoTrabajoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePermisoTrabajo>
          }
          groupBy: {
            args: Prisma.PermisoTrabajoGroupByArgs<ExtArgs>
            result: $Utils.Optional<PermisoTrabajoGroupByOutputType>[]
          }
          count: {
            args: Prisma.PermisoTrabajoCountArgs<ExtArgs>
            result: $Utils.Optional<PermisoTrabajoCountAggregateOutputType> | number
          }
        }
      }
      Capacitacion: {
        payload: Prisma.$CapacitacionPayload<ExtArgs>
        fields: Prisma.CapacitacionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CapacitacionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CapacitacionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CapacitacionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CapacitacionPayload>
          }
          findFirst: {
            args: Prisma.CapacitacionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CapacitacionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CapacitacionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CapacitacionPayload>
          }
          findMany: {
            args: Prisma.CapacitacionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CapacitacionPayload>[]
          }
          create: {
            args: Prisma.CapacitacionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CapacitacionPayload>
          }
          createMany: {
            args: Prisma.CapacitacionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CapacitacionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CapacitacionPayload>[]
          }
          delete: {
            args: Prisma.CapacitacionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CapacitacionPayload>
          }
          update: {
            args: Prisma.CapacitacionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CapacitacionPayload>
          }
          deleteMany: {
            args: Prisma.CapacitacionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CapacitacionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CapacitacionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CapacitacionPayload>
          }
          aggregate: {
            args: Prisma.CapacitacionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCapacitacion>
          }
          groupBy: {
            args: Prisma.CapacitacionGroupByArgs<ExtArgs>
            result: $Utils.Optional<CapacitacionGroupByOutputType>[]
          }
          count: {
            args: Prisma.CapacitacionCountArgs<ExtArgs>
            result: $Utils.Optional<CapacitacionCountAggregateOutputType> | number
          }
        }
      }
      RegistroCapacitacion: {
        payload: Prisma.$RegistroCapacitacionPayload<ExtArgs>
        fields: Prisma.RegistroCapacitacionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RegistroCapacitacionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroCapacitacionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RegistroCapacitacionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroCapacitacionPayload>
          }
          findFirst: {
            args: Prisma.RegistroCapacitacionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroCapacitacionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RegistroCapacitacionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroCapacitacionPayload>
          }
          findMany: {
            args: Prisma.RegistroCapacitacionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroCapacitacionPayload>[]
          }
          create: {
            args: Prisma.RegistroCapacitacionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroCapacitacionPayload>
          }
          createMany: {
            args: Prisma.RegistroCapacitacionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RegistroCapacitacionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroCapacitacionPayload>[]
          }
          delete: {
            args: Prisma.RegistroCapacitacionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroCapacitacionPayload>
          }
          update: {
            args: Prisma.RegistroCapacitacionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroCapacitacionPayload>
          }
          deleteMany: {
            args: Prisma.RegistroCapacitacionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RegistroCapacitacionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.RegistroCapacitacionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroCapacitacionPayload>
          }
          aggregate: {
            args: Prisma.RegistroCapacitacionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRegistroCapacitacion>
          }
          groupBy: {
            args: Prisma.RegistroCapacitacionGroupByArgs<ExtArgs>
            result: $Utils.Optional<RegistroCapacitacionGroupByOutputType>[]
          }
          count: {
            args: Prisma.RegistroCapacitacionCountArgs<ExtArgs>
            result: $Utils.Optional<RegistroCapacitacionCountAggregateOutputType> | number
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
   * Count Type CapacitacionCountOutputType
   */

  export type CapacitacionCountOutputType = {
    registros: number
  }

  export type CapacitacionCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    registros?: boolean | CapacitacionCountOutputTypeCountRegistrosArgs
  }

  // Custom InputTypes
  /**
   * CapacitacionCountOutputType without action
   */
  export type CapacitacionCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CapacitacionCountOutputType
     */
    select?: CapacitacionCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CapacitacionCountOutputType without action
   */
  export type CapacitacionCountOutputTypeCountRegistrosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RegistroCapacitacionWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Incidente
   */

  export type AggregateIncidente = {
    _count: IncidenteCountAggregateOutputType | null
    _avg: IncidenteAvgAggregateOutputType | null
    _sum: IncidenteSumAggregateOutputType | null
    _min: IncidenteMinAggregateOutputType | null
    _max: IncidenteMaxAggregateOutputType | null
  }

  export type IncidenteAvgAggregateOutputType = {
    dias_incapacidad: number | null
  }

  export type IncidenteSumAggregateOutputType = {
    dias_incapacidad: number | null
  }

  export type IncidenteMinAggregateOutputType = {
    id_incidente: string | null
    tenant_id: string | null
    proyecto_id: string | null
    codigo: string | null
    tipo: string | null
    severidad: string | null
    fecha_incidente: Date | null
    hora_incidente: string | null
    ubicacion: string | null
    descripcion: string | null
    empleado_afectado_id: string | null
    empleado_afectado_nombre: string | null
    testigos: string | null
    causa_raiz: string | null
    accion_correctiva: string | null
    accion_preventiva: string | null
    dias_incapacidad: number | null
    requirio_atencion_medica: boolean | null
    reportado_stps: boolean | null
    estado: string | null
    reportado_por: string | null
    cerrado_por: string | null
    fecha_cierre: Date | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type IncidenteMaxAggregateOutputType = {
    id_incidente: string | null
    tenant_id: string | null
    proyecto_id: string | null
    codigo: string | null
    tipo: string | null
    severidad: string | null
    fecha_incidente: Date | null
    hora_incidente: string | null
    ubicacion: string | null
    descripcion: string | null
    empleado_afectado_id: string | null
    empleado_afectado_nombre: string | null
    testigos: string | null
    causa_raiz: string | null
    accion_correctiva: string | null
    accion_preventiva: string | null
    dias_incapacidad: number | null
    requirio_atencion_medica: boolean | null
    reportado_stps: boolean | null
    estado: string | null
    reportado_por: string | null
    cerrado_por: string | null
    fecha_cierre: Date | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type IncidenteCountAggregateOutputType = {
    id_incidente: number
    tenant_id: number
    proyecto_id: number
    codigo: number
    tipo: number
    severidad: number
    fecha_incidente: number
    hora_incidente: number
    ubicacion: number
    descripcion: number
    empleado_afectado_id: number
    empleado_afectado_nombre: number
    testigos: number
    causa_raiz: number
    accion_correctiva: number
    accion_preventiva: number
    dias_incapacidad: number
    requirio_atencion_medica: number
    reportado_stps: number
    estado: number
    reportado_por: number
    cerrado_por: number
    fecha_cierre: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type IncidenteAvgAggregateInputType = {
    dias_incapacidad?: true
  }

  export type IncidenteSumAggregateInputType = {
    dias_incapacidad?: true
  }

  export type IncidenteMinAggregateInputType = {
    id_incidente?: true
    tenant_id?: true
    proyecto_id?: true
    codigo?: true
    tipo?: true
    severidad?: true
    fecha_incidente?: true
    hora_incidente?: true
    ubicacion?: true
    descripcion?: true
    empleado_afectado_id?: true
    empleado_afectado_nombre?: true
    testigos?: true
    causa_raiz?: true
    accion_correctiva?: true
    accion_preventiva?: true
    dias_incapacidad?: true
    requirio_atencion_medica?: true
    reportado_stps?: true
    estado?: true
    reportado_por?: true
    cerrado_por?: true
    fecha_cierre?: true
    created_at?: true
    updated_at?: true
  }

  export type IncidenteMaxAggregateInputType = {
    id_incidente?: true
    tenant_id?: true
    proyecto_id?: true
    codigo?: true
    tipo?: true
    severidad?: true
    fecha_incidente?: true
    hora_incidente?: true
    ubicacion?: true
    descripcion?: true
    empleado_afectado_id?: true
    empleado_afectado_nombre?: true
    testigos?: true
    causa_raiz?: true
    accion_correctiva?: true
    accion_preventiva?: true
    dias_incapacidad?: true
    requirio_atencion_medica?: true
    reportado_stps?: true
    estado?: true
    reportado_por?: true
    cerrado_por?: true
    fecha_cierre?: true
    created_at?: true
    updated_at?: true
  }

  export type IncidenteCountAggregateInputType = {
    id_incidente?: true
    tenant_id?: true
    proyecto_id?: true
    codigo?: true
    tipo?: true
    severidad?: true
    fecha_incidente?: true
    hora_incidente?: true
    ubicacion?: true
    descripcion?: true
    empleado_afectado_id?: true
    empleado_afectado_nombre?: true
    testigos?: true
    causa_raiz?: true
    accion_correctiva?: true
    accion_preventiva?: true
    dias_incapacidad?: true
    requirio_atencion_medica?: true
    reportado_stps?: true
    estado?: true
    reportado_por?: true
    cerrado_por?: true
    fecha_cierre?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type IncidenteAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Incidente to aggregate.
     */
    where?: IncidenteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Incidentes to fetch.
     */
    orderBy?: IncidenteOrderByWithRelationInput | IncidenteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: IncidenteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Incidentes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Incidentes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Incidentes
    **/
    _count?: true | IncidenteCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: IncidenteAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: IncidenteSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: IncidenteMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: IncidenteMaxAggregateInputType
  }

  export type GetIncidenteAggregateType<T extends IncidenteAggregateArgs> = {
        [P in keyof T & keyof AggregateIncidente]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateIncidente[P]>
      : GetScalarType<T[P], AggregateIncidente[P]>
  }




  export type IncidenteGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: IncidenteWhereInput
    orderBy?: IncidenteOrderByWithAggregationInput | IncidenteOrderByWithAggregationInput[]
    by: IncidenteScalarFieldEnum[] | IncidenteScalarFieldEnum
    having?: IncidenteScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: IncidenteCountAggregateInputType | true
    _avg?: IncidenteAvgAggregateInputType
    _sum?: IncidenteSumAggregateInputType
    _min?: IncidenteMinAggregateInputType
    _max?: IncidenteMaxAggregateInputType
  }

  export type IncidenteGroupByOutputType = {
    id_incidente: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    tipo: string
    severidad: string
    fecha_incidente: Date
    hora_incidente: string | null
    ubicacion: string
    descripcion: string
    empleado_afectado_id: string | null
    empleado_afectado_nombre: string | null
    testigos: string | null
    causa_raiz: string | null
    accion_correctiva: string | null
    accion_preventiva: string | null
    dias_incapacidad: number
    requirio_atencion_medica: boolean
    reportado_stps: boolean
    estado: string
    reportado_por: string
    cerrado_por: string | null
    fecha_cierre: Date | null
    created_at: Date
    updated_at: Date
    _count: IncidenteCountAggregateOutputType | null
    _avg: IncidenteAvgAggregateOutputType | null
    _sum: IncidenteSumAggregateOutputType | null
    _min: IncidenteMinAggregateOutputType | null
    _max: IncidenteMaxAggregateOutputType | null
  }

  type GetIncidenteGroupByPayload<T extends IncidenteGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<IncidenteGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof IncidenteGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], IncidenteGroupByOutputType[P]>
            : GetScalarType<T[P], IncidenteGroupByOutputType[P]>
        }
      >
    >


  export type IncidenteSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_incidente?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    codigo?: boolean
    tipo?: boolean
    severidad?: boolean
    fecha_incidente?: boolean
    hora_incidente?: boolean
    ubicacion?: boolean
    descripcion?: boolean
    empleado_afectado_id?: boolean
    empleado_afectado_nombre?: boolean
    testigos?: boolean
    causa_raiz?: boolean
    accion_correctiva?: boolean
    accion_preventiva?: boolean
    dias_incapacidad?: boolean
    requirio_atencion_medica?: boolean
    reportado_stps?: boolean
    estado?: boolean
    reportado_por?: boolean
    cerrado_por?: boolean
    fecha_cierre?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["incidente"]>

  export type IncidenteSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_incidente?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    codigo?: boolean
    tipo?: boolean
    severidad?: boolean
    fecha_incidente?: boolean
    hora_incidente?: boolean
    ubicacion?: boolean
    descripcion?: boolean
    empleado_afectado_id?: boolean
    empleado_afectado_nombre?: boolean
    testigos?: boolean
    causa_raiz?: boolean
    accion_correctiva?: boolean
    accion_preventiva?: boolean
    dias_incapacidad?: boolean
    requirio_atencion_medica?: boolean
    reportado_stps?: boolean
    estado?: boolean
    reportado_por?: boolean
    cerrado_por?: boolean
    fecha_cierre?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["incidente"]>

  export type IncidenteSelectScalar = {
    id_incidente?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    codigo?: boolean
    tipo?: boolean
    severidad?: boolean
    fecha_incidente?: boolean
    hora_incidente?: boolean
    ubicacion?: boolean
    descripcion?: boolean
    empleado_afectado_id?: boolean
    empleado_afectado_nombre?: boolean
    testigos?: boolean
    causa_raiz?: boolean
    accion_correctiva?: boolean
    accion_preventiva?: boolean
    dias_incapacidad?: boolean
    requirio_atencion_medica?: boolean
    reportado_stps?: boolean
    estado?: boolean
    reportado_por?: boolean
    cerrado_por?: boolean
    fecha_cierre?: boolean
    created_at?: boolean
    updated_at?: boolean
  }


  export type $IncidentePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Incidente"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id_incidente: string
      tenant_id: string
      proyecto_id: string
      codigo: string
      tipo: string
      severidad: string
      fecha_incidente: Date
      hora_incidente: string | null
      ubicacion: string
      descripcion: string
      empleado_afectado_id: string | null
      empleado_afectado_nombre: string | null
      testigos: string | null
      causa_raiz: string | null
      accion_correctiva: string | null
      accion_preventiva: string | null
      dias_incapacidad: number
      requirio_atencion_medica: boolean
      reportado_stps: boolean
      estado: string
      reportado_por: string
      cerrado_por: string | null
      fecha_cierre: Date | null
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["incidente"]>
    composites: {}
  }

  type IncidenteGetPayload<S extends boolean | null | undefined | IncidenteDefaultArgs> = $Result.GetResult<Prisma.$IncidentePayload, S>

  type IncidenteCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<IncidenteFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: IncidenteCountAggregateInputType | true
    }

  export interface IncidenteDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Incidente'], meta: { name: 'Incidente' } }
    /**
     * Find zero or one Incidente that matches the filter.
     * @param {IncidenteFindUniqueArgs} args - Arguments to find a Incidente
     * @example
     * // Get one Incidente
     * const incidente = await prisma.incidente.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends IncidenteFindUniqueArgs>(args: SelectSubset<T, IncidenteFindUniqueArgs<ExtArgs>>): Prisma__IncidenteClient<$Result.GetResult<Prisma.$IncidentePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Incidente that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {IncidenteFindUniqueOrThrowArgs} args - Arguments to find a Incidente
     * @example
     * // Get one Incidente
     * const incidente = await prisma.incidente.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends IncidenteFindUniqueOrThrowArgs>(args: SelectSubset<T, IncidenteFindUniqueOrThrowArgs<ExtArgs>>): Prisma__IncidenteClient<$Result.GetResult<Prisma.$IncidentePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Incidente that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IncidenteFindFirstArgs} args - Arguments to find a Incidente
     * @example
     * // Get one Incidente
     * const incidente = await prisma.incidente.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends IncidenteFindFirstArgs>(args?: SelectSubset<T, IncidenteFindFirstArgs<ExtArgs>>): Prisma__IncidenteClient<$Result.GetResult<Prisma.$IncidentePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Incidente that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IncidenteFindFirstOrThrowArgs} args - Arguments to find a Incidente
     * @example
     * // Get one Incidente
     * const incidente = await prisma.incidente.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends IncidenteFindFirstOrThrowArgs>(args?: SelectSubset<T, IncidenteFindFirstOrThrowArgs<ExtArgs>>): Prisma__IncidenteClient<$Result.GetResult<Prisma.$IncidentePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Incidentes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IncidenteFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Incidentes
     * const incidentes = await prisma.incidente.findMany()
     * 
     * // Get first 10 Incidentes
     * const incidentes = await prisma.incidente.findMany({ take: 10 })
     * 
     * // Only select the `id_incidente`
     * const incidenteWithId_incidenteOnly = await prisma.incidente.findMany({ select: { id_incidente: true } })
     * 
     */
    findMany<T extends IncidenteFindManyArgs>(args?: SelectSubset<T, IncidenteFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IncidentePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Incidente.
     * @param {IncidenteCreateArgs} args - Arguments to create a Incidente.
     * @example
     * // Create one Incidente
     * const Incidente = await prisma.incidente.create({
     *   data: {
     *     // ... data to create a Incidente
     *   }
     * })
     * 
     */
    create<T extends IncidenteCreateArgs>(args: SelectSubset<T, IncidenteCreateArgs<ExtArgs>>): Prisma__IncidenteClient<$Result.GetResult<Prisma.$IncidentePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Incidentes.
     * @param {IncidenteCreateManyArgs} args - Arguments to create many Incidentes.
     * @example
     * // Create many Incidentes
     * const incidente = await prisma.incidente.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends IncidenteCreateManyArgs>(args?: SelectSubset<T, IncidenteCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Incidentes and returns the data saved in the database.
     * @param {IncidenteCreateManyAndReturnArgs} args - Arguments to create many Incidentes.
     * @example
     * // Create many Incidentes
     * const incidente = await prisma.incidente.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Incidentes and only return the `id_incidente`
     * const incidenteWithId_incidenteOnly = await prisma.incidente.createManyAndReturn({ 
     *   select: { id_incidente: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends IncidenteCreateManyAndReturnArgs>(args?: SelectSubset<T, IncidenteCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IncidentePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Incidente.
     * @param {IncidenteDeleteArgs} args - Arguments to delete one Incidente.
     * @example
     * // Delete one Incidente
     * const Incidente = await prisma.incidente.delete({
     *   where: {
     *     // ... filter to delete one Incidente
     *   }
     * })
     * 
     */
    delete<T extends IncidenteDeleteArgs>(args: SelectSubset<T, IncidenteDeleteArgs<ExtArgs>>): Prisma__IncidenteClient<$Result.GetResult<Prisma.$IncidentePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Incidente.
     * @param {IncidenteUpdateArgs} args - Arguments to update one Incidente.
     * @example
     * // Update one Incidente
     * const incidente = await prisma.incidente.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends IncidenteUpdateArgs>(args: SelectSubset<T, IncidenteUpdateArgs<ExtArgs>>): Prisma__IncidenteClient<$Result.GetResult<Prisma.$IncidentePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Incidentes.
     * @param {IncidenteDeleteManyArgs} args - Arguments to filter Incidentes to delete.
     * @example
     * // Delete a few Incidentes
     * const { count } = await prisma.incidente.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends IncidenteDeleteManyArgs>(args?: SelectSubset<T, IncidenteDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Incidentes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IncidenteUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Incidentes
     * const incidente = await prisma.incidente.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends IncidenteUpdateManyArgs>(args: SelectSubset<T, IncidenteUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Incidente.
     * @param {IncidenteUpsertArgs} args - Arguments to update or create a Incidente.
     * @example
     * // Update or create a Incidente
     * const incidente = await prisma.incidente.upsert({
     *   create: {
     *     // ... data to create a Incidente
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Incidente we want to update
     *   }
     * })
     */
    upsert<T extends IncidenteUpsertArgs>(args: SelectSubset<T, IncidenteUpsertArgs<ExtArgs>>): Prisma__IncidenteClient<$Result.GetResult<Prisma.$IncidentePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Incidentes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IncidenteCountArgs} args - Arguments to filter Incidentes to count.
     * @example
     * // Count the number of Incidentes
     * const count = await prisma.incidente.count({
     *   where: {
     *     // ... the filter for the Incidentes we want to count
     *   }
     * })
    **/
    count<T extends IncidenteCountArgs>(
      args?: Subset<T, IncidenteCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], IncidenteCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Incidente.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IncidenteAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends IncidenteAggregateArgs>(args: Subset<T, IncidenteAggregateArgs>): Prisma.PrismaPromise<GetIncidenteAggregateType<T>>

    /**
     * Group by Incidente.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IncidenteGroupByArgs} args - Group by arguments.
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
      T extends IncidenteGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: IncidenteGroupByArgs['orderBy'] }
        : { orderBy?: IncidenteGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, IncidenteGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetIncidenteGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Incidente model
   */
  readonly fields: IncidenteFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Incidente.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__IncidenteClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the Incidente model
   */ 
  interface IncidenteFieldRefs {
    readonly id_incidente: FieldRef<"Incidente", 'String'>
    readonly tenant_id: FieldRef<"Incidente", 'String'>
    readonly proyecto_id: FieldRef<"Incidente", 'String'>
    readonly codigo: FieldRef<"Incidente", 'String'>
    readonly tipo: FieldRef<"Incidente", 'String'>
    readonly severidad: FieldRef<"Incidente", 'String'>
    readonly fecha_incidente: FieldRef<"Incidente", 'DateTime'>
    readonly hora_incidente: FieldRef<"Incidente", 'String'>
    readonly ubicacion: FieldRef<"Incidente", 'String'>
    readonly descripcion: FieldRef<"Incidente", 'String'>
    readonly empleado_afectado_id: FieldRef<"Incidente", 'String'>
    readonly empleado_afectado_nombre: FieldRef<"Incidente", 'String'>
    readonly testigos: FieldRef<"Incidente", 'String'>
    readonly causa_raiz: FieldRef<"Incidente", 'String'>
    readonly accion_correctiva: FieldRef<"Incidente", 'String'>
    readonly accion_preventiva: FieldRef<"Incidente", 'String'>
    readonly dias_incapacidad: FieldRef<"Incidente", 'Int'>
    readonly requirio_atencion_medica: FieldRef<"Incidente", 'Boolean'>
    readonly reportado_stps: FieldRef<"Incidente", 'Boolean'>
    readonly estado: FieldRef<"Incidente", 'String'>
    readonly reportado_por: FieldRef<"Incidente", 'String'>
    readonly cerrado_por: FieldRef<"Incidente", 'String'>
    readonly fecha_cierre: FieldRef<"Incidente", 'DateTime'>
    readonly created_at: FieldRef<"Incidente", 'DateTime'>
    readonly updated_at: FieldRef<"Incidente", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Incidente findUnique
   */
  export type IncidenteFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Incidente
     */
    select?: IncidenteSelect<ExtArgs> | null
    /**
     * Filter, which Incidente to fetch.
     */
    where: IncidenteWhereUniqueInput
  }

  /**
   * Incidente findUniqueOrThrow
   */
  export type IncidenteFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Incidente
     */
    select?: IncidenteSelect<ExtArgs> | null
    /**
     * Filter, which Incidente to fetch.
     */
    where: IncidenteWhereUniqueInput
  }

  /**
   * Incidente findFirst
   */
  export type IncidenteFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Incidente
     */
    select?: IncidenteSelect<ExtArgs> | null
    /**
     * Filter, which Incidente to fetch.
     */
    where?: IncidenteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Incidentes to fetch.
     */
    orderBy?: IncidenteOrderByWithRelationInput | IncidenteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Incidentes.
     */
    cursor?: IncidenteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Incidentes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Incidentes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Incidentes.
     */
    distinct?: IncidenteScalarFieldEnum | IncidenteScalarFieldEnum[]
  }

  /**
   * Incidente findFirstOrThrow
   */
  export type IncidenteFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Incidente
     */
    select?: IncidenteSelect<ExtArgs> | null
    /**
     * Filter, which Incidente to fetch.
     */
    where?: IncidenteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Incidentes to fetch.
     */
    orderBy?: IncidenteOrderByWithRelationInput | IncidenteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Incidentes.
     */
    cursor?: IncidenteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Incidentes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Incidentes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Incidentes.
     */
    distinct?: IncidenteScalarFieldEnum | IncidenteScalarFieldEnum[]
  }

  /**
   * Incidente findMany
   */
  export type IncidenteFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Incidente
     */
    select?: IncidenteSelect<ExtArgs> | null
    /**
     * Filter, which Incidentes to fetch.
     */
    where?: IncidenteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Incidentes to fetch.
     */
    orderBy?: IncidenteOrderByWithRelationInput | IncidenteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Incidentes.
     */
    cursor?: IncidenteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Incidentes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Incidentes.
     */
    skip?: number
    distinct?: IncidenteScalarFieldEnum | IncidenteScalarFieldEnum[]
  }

  /**
   * Incidente create
   */
  export type IncidenteCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Incidente
     */
    select?: IncidenteSelect<ExtArgs> | null
    /**
     * The data needed to create a Incidente.
     */
    data: XOR<IncidenteCreateInput, IncidenteUncheckedCreateInput>
  }

  /**
   * Incidente createMany
   */
  export type IncidenteCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Incidentes.
     */
    data: IncidenteCreateManyInput | IncidenteCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Incidente createManyAndReturn
   */
  export type IncidenteCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Incidente
     */
    select?: IncidenteSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Incidentes.
     */
    data: IncidenteCreateManyInput | IncidenteCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Incidente update
   */
  export type IncidenteUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Incidente
     */
    select?: IncidenteSelect<ExtArgs> | null
    /**
     * The data needed to update a Incidente.
     */
    data: XOR<IncidenteUpdateInput, IncidenteUncheckedUpdateInput>
    /**
     * Choose, which Incidente to update.
     */
    where: IncidenteWhereUniqueInput
  }

  /**
   * Incidente updateMany
   */
  export type IncidenteUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Incidentes.
     */
    data: XOR<IncidenteUpdateManyMutationInput, IncidenteUncheckedUpdateManyInput>
    /**
     * Filter which Incidentes to update
     */
    where?: IncidenteWhereInput
  }

  /**
   * Incidente upsert
   */
  export type IncidenteUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Incidente
     */
    select?: IncidenteSelect<ExtArgs> | null
    /**
     * The filter to search for the Incidente to update in case it exists.
     */
    where: IncidenteWhereUniqueInput
    /**
     * In case the Incidente found by the `where` argument doesn't exist, create a new Incidente with this data.
     */
    create: XOR<IncidenteCreateInput, IncidenteUncheckedCreateInput>
    /**
     * In case the Incidente was found with the provided `where` argument, update it with this data.
     */
    update: XOR<IncidenteUpdateInput, IncidenteUncheckedUpdateInput>
  }

  /**
   * Incidente delete
   */
  export type IncidenteDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Incidente
     */
    select?: IncidenteSelect<ExtArgs> | null
    /**
     * Filter which Incidente to delete.
     */
    where: IncidenteWhereUniqueInput
  }

  /**
   * Incidente deleteMany
   */
  export type IncidenteDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Incidentes to delete
     */
    where?: IncidenteWhereInput
  }

  /**
   * Incidente without action
   */
  export type IncidenteDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Incidente
     */
    select?: IncidenteSelect<ExtArgs> | null
  }


  /**
   * Model InspeccionSeguridad
   */

  export type AggregateInspeccionSeguridad = {
    _count: InspeccionSeguridadCountAggregateOutputType | null
    _avg: InspeccionSeguridadAvgAggregateOutputType | null
    _sum: InspeccionSeguridadSumAggregateOutputType | null
    _min: InspeccionSeguridadMinAggregateOutputType | null
    _max: InspeccionSeguridadMaxAggregateOutputType | null
  }

  export type InspeccionSeguridadAvgAggregateOutputType = {
    items_revisados: number | null
    items_conformes: number | null
    items_no_conformes: number | null
    porcentaje_cumplimiento: Decimal | null
  }

  export type InspeccionSeguridadSumAggregateOutputType = {
    items_revisados: number | null
    items_conformes: number | null
    items_no_conformes: number | null
    porcentaje_cumplimiento: Decimal | null
  }

  export type InspeccionSeguridadMinAggregateOutputType = {
    id_inspeccion: string | null
    tenant_id: string | null
    proyecto_id: string | null
    codigo: string | null
    tipo_inspeccion: string | null
    fecha_inspeccion: Date | null
    area_inspeccionada: string | null
    items_revisados: number | null
    items_conformes: number | null
    items_no_conformes: number | null
    porcentaje_cumplimiento: Decimal | null
    resultado: string | null
    observaciones: string | null
    hallazgos: string | null
    evidencia_fotos: string | null
    inspector_id: string | null
    inspector_nombre: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type InspeccionSeguridadMaxAggregateOutputType = {
    id_inspeccion: string | null
    tenant_id: string | null
    proyecto_id: string | null
    codigo: string | null
    tipo_inspeccion: string | null
    fecha_inspeccion: Date | null
    area_inspeccionada: string | null
    items_revisados: number | null
    items_conformes: number | null
    items_no_conformes: number | null
    porcentaje_cumplimiento: Decimal | null
    resultado: string | null
    observaciones: string | null
    hallazgos: string | null
    evidencia_fotos: string | null
    inspector_id: string | null
    inspector_nombre: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type InspeccionSeguridadCountAggregateOutputType = {
    id_inspeccion: number
    tenant_id: number
    proyecto_id: number
    codigo: number
    tipo_inspeccion: number
    fecha_inspeccion: number
    area_inspeccionada: number
    items_revisados: number
    items_conformes: number
    items_no_conformes: number
    porcentaje_cumplimiento: number
    resultado: number
    observaciones: number
    hallazgos: number
    evidencia_fotos: number
    inspector_id: number
    inspector_nombre: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type InspeccionSeguridadAvgAggregateInputType = {
    items_revisados?: true
    items_conformes?: true
    items_no_conformes?: true
    porcentaje_cumplimiento?: true
  }

  export type InspeccionSeguridadSumAggregateInputType = {
    items_revisados?: true
    items_conformes?: true
    items_no_conformes?: true
    porcentaje_cumplimiento?: true
  }

  export type InspeccionSeguridadMinAggregateInputType = {
    id_inspeccion?: true
    tenant_id?: true
    proyecto_id?: true
    codigo?: true
    tipo_inspeccion?: true
    fecha_inspeccion?: true
    area_inspeccionada?: true
    items_revisados?: true
    items_conformes?: true
    items_no_conformes?: true
    porcentaje_cumplimiento?: true
    resultado?: true
    observaciones?: true
    hallazgos?: true
    evidencia_fotos?: true
    inspector_id?: true
    inspector_nombre?: true
    created_at?: true
    updated_at?: true
  }

  export type InspeccionSeguridadMaxAggregateInputType = {
    id_inspeccion?: true
    tenant_id?: true
    proyecto_id?: true
    codigo?: true
    tipo_inspeccion?: true
    fecha_inspeccion?: true
    area_inspeccionada?: true
    items_revisados?: true
    items_conformes?: true
    items_no_conformes?: true
    porcentaje_cumplimiento?: true
    resultado?: true
    observaciones?: true
    hallazgos?: true
    evidencia_fotos?: true
    inspector_id?: true
    inspector_nombre?: true
    created_at?: true
    updated_at?: true
  }

  export type InspeccionSeguridadCountAggregateInputType = {
    id_inspeccion?: true
    tenant_id?: true
    proyecto_id?: true
    codigo?: true
    tipo_inspeccion?: true
    fecha_inspeccion?: true
    area_inspeccionada?: true
    items_revisados?: true
    items_conformes?: true
    items_no_conformes?: true
    porcentaje_cumplimiento?: true
    resultado?: true
    observaciones?: true
    hallazgos?: true
    evidencia_fotos?: true
    inspector_id?: true
    inspector_nombre?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type InspeccionSeguridadAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which InspeccionSeguridad to aggregate.
     */
    where?: InspeccionSeguridadWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InspeccionSeguridads to fetch.
     */
    orderBy?: InspeccionSeguridadOrderByWithRelationInput | InspeccionSeguridadOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: InspeccionSeguridadWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InspeccionSeguridads from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InspeccionSeguridads.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned InspeccionSeguridads
    **/
    _count?: true | InspeccionSeguridadCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: InspeccionSeguridadAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: InspeccionSeguridadSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: InspeccionSeguridadMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: InspeccionSeguridadMaxAggregateInputType
  }

  export type GetInspeccionSeguridadAggregateType<T extends InspeccionSeguridadAggregateArgs> = {
        [P in keyof T & keyof AggregateInspeccionSeguridad]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateInspeccionSeguridad[P]>
      : GetScalarType<T[P], AggregateInspeccionSeguridad[P]>
  }




  export type InspeccionSeguridadGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InspeccionSeguridadWhereInput
    orderBy?: InspeccionSeguridadOrderByWithAggregationInput | InspeccionSeguridadOrderByWithAggregationInput[]
    by: InspeccionSeguridadScalarFieldEnum[] | InspeccionSeguridadScalarFieldEnum
    having?: InspeccionSeguridadScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: InspeccionSeguridadCountAggregateInputType | true
    _avg?: InspeccionSeguridadAvgAggregateInputType
    _sum?: InspeccionSeguridadSumAggregateInputType
    _min?: InspeccionSeguridadMinAggregateInputType
    _max?: InspeccionSeguridadMaxAggregateInputType
  }

  export type InspeccionSeguridadGroupByOutputType = {
    id_inspeccion: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    tipo_inspeccion: string
    fecha_inspeccion: Date
    area_inspeccionada: string
    items_revisados: number
    items_conformes: number
    items_no_conformes: number
    porcentaje_cumplimiento: Decimal
    resultado: string
    observaciones: string | null
    hallazgos: string | null
    evidencia_fotos: string | null
    inspector_id: string
    inspector_nombre: string
    created_at: Date
    updated_at: Date
    _count: InspeccionSeguridadCountAggregateOutputType | null
    _avg: InspeccionSeguridadAvgAggregateOutputType | null
    _sum: InspeccionSeguridadSumAggregateOutputType | null
    _min: InspeccionSeguridadMinAggregateOutputType | null
    _max: InspeccionSeguridadMaxAggregateOutputType | null
  }

  type GetInspeccionSeguridadGroupByPayload<T extends InspeccionSeguridadGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<InspeccionSeguridadGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof InspeccionSeguridadGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], InspeccionSeguridadGroupByOutputType[P]>
            : GetScalarType<T[P], InspeccionSeguridadGroupByOutputType[P]>
        }
      >
    >


  export type InspeccionSeguridadSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_inspeccion?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    codigo?: boolean
    tipo_inspeccion?: boolean
    fecha_inspeccion?: boolean
    area_inspeccionada?: boolean
    items_revisados?: boolean
    items_conformes?: boolean
    items_no_conformes?: boolean
    porcentaje_cumplimiento?: boolean
    resultado?: boolean
    observaciones?: boolean
    hallazgos?: boolean
    evidencia_fotos?: boolean
    inspector_id?: boolean
    inspector_nombre?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["inspeccionSeguridad"]>

  export type InspeccionSeguridadSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_inspeccion?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    codigo?: boolean
    tipo_inspeccion?: boolean
    fecha_inspeccion?: boolean
    area_inspeccionada?: boolean
    items_revisados?: boolean
    items_conformes?: boolean
    items_no_conformes?: boolean
    porcentaje_cumplimiento?: boolean
    resultado?: boolean
    observaciones?: boolean
    hallazgos?: boolean
    evidencia_fotos?: boolean
    inspector_id?: boolean
    inspector_nombre?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["inspeccionSeguridad"]>

  export type InspeccionSeguridadSelectScalar = {
    id_inspeccion?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    codigo?: boolean
    tipo_inspeccion?: boolean
    fecha_inspeccion?: boolean
    area_inspeccionada?: boolean
    items_revisados?: boolean
    items_conformes?: boolean
    items_no_conformes?: boolean
    porcentaje_cumplimiento?: boolean
    resultado?: boolean
    observaciones?: boolean
    hallazgos?: boolean
    evidencia_fotos?: boolean
    inspector_id?: boolean
    inspector_nombre?: boolean
    created_at?: boolean
    updated_at?: boolean
  }


  export type $InspeccionSeguridadPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "InspeccionSeguridad"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id_inspeccion: string
      tenant_id: string
      proyecto_id: string
      codigo: string
      tipo_inspeccion: string
      fecha_inspeccion: Date
      area_inspeccionada: string
      items_revisados: number
      items_conformes: number
      items_no_conformes: number
      porcentaje_cumplimiento: Prisma.Decimal
      resultado: string
      observaciones: string | null
      hallazgos: string | null
      evidencia_fotos: string | null
      inspector_id: string
      inspector_nombre: string
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["inspeccionSeguridad"]>
    composites: {}
  }

  type InspeccionSeguridadGetPayload<S extends boolean | null | undefined | InspeccionSeguridadDefaultArgs> = $Result.GetResult<Prisma.$InspeccionSeguridadPayload, S>

  type InspeccionSeguridadCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<InspeccionSeguridadFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: InspeccionSeguridadCountAggregateInputType | true
    }

  export interface InspeccionSeguridadDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['InspeccionSeguridad'], meta: { name: 'InspeccionSeguridad' } }
    /**
     * Find zero or one InspeccionSeguridad that matches the filter.
     * @param {InspeccionSeguridadFindUniqueArgs} args - Arguments to find a InspeccionSeguridad
     * @example
     * // Get one InspeccionSeguridad
     * const inspeccionSeguridad = await prisma.inspeccionSeguridad.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends InspeccionSeguridadFindUniqueArgs>(args: SelectSubset<T, InspeccionSeguridadFindUniqueArgs<ExtArgs>>): Prisma__InspeccionSeguridadClient<$Result.GetResult<Prisma.$InspeccionSeguridadPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one InspeccionSeguridad that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {InspeccionSeguridadFindUniqueOrThrowArgs} args - Arguments to find a InspeccionSeguridad
     * @example
     * // Get one InspeccionSeguridad
     * const inspeccionSeguridad = await prisma.inspeccionSeguridad.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends InspeccionSeguridadFindUniqueOrThrowArgs>(args: SelectSubset<T, InspeccionSeguridadFindUniqueOrThrowArgs<ExtArgs>>): Prisma__InspeccionSeguridadClient<$Result.GetResult<Prisma.$InspeccionSeguridadPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first InspeccionSeguridad that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InspeccionSeguridadFindFirstArgs} args - Arguments to find a InspeccionSeguridad
     * @example
     * // Get one InspeccionSeguridad
     * const inspeccionSeguridad = await prisma.inspeccionSeguridad.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends InspeccionSeguridadFindFirstArgs>(args?: SelectSubset<T, InspeccionSeguridadFindFirstArgs<ExtArgs>>): Prisma__InspeccionSeguridadClient<$Result.GetResult<Prisma.$InspeccionSeguridadPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first InspeccionSeguridad that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InspeccionSeguridadFindFirstOrThrowArgs} args - Arguments to find a InspeccionSeguridad
     * @example
     * // Get one InspeccionSeguridad
     * const inspeccionSeguridad = await prisma.inspeccionSeguridad.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends InspeccionSeguridadFindFirstOrThrowArgs>(args?: SelectSubset<T, InspeccionSeguridadFindFirstOrThrowArgs<ExtArgs>>): Prisma__InspeccionSeguridadClient<$Result.GetResult<Prisma.$InspeccionSeguridadPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more InspeccionSeguridads that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InspeccionSeguridadFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all InspeccionSeguridads
     * const inspeccionSeguridads = await prisma.inspeccionSeguridad.findMany()
     * 
     * // Get first 10 InspeccionSeguridads
     * const inspeccionSeguridads = await prisma.inspeccionSeguridad.findMany({ take: 10 })
     * 
     * // Only select the `id_inspeccion`
     * const inspeccionSeguridadWithId_inspeccionOnly = await prisma.inspeccionSeguridad.findMany({ select: { id_inspeccion: true } })
     * 
     */
    findMany<T extends InspeccionSeguridadFindManyArgs>(args?: SelectSubset<T, InspeccionSeguridadFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InspeccionSeguridadPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a InspeccionSeguridad.
     * @param {InspeccionSeguridadCreateArgs} args - Arguments to create a InspeccionSeguridad.
     * @example
     * // Create one InspeccionSeguridad
     * const InspeccionSeguridad = await prisma.inspeccionSeguridad.create({
     *   data: {
     *     // ... data to create a InspeccionSeguridad
     *   }
     * })
     * 
     */
    create<T extends InspeccionSeguridadCreateArgs>(args: SelectSubset<T, InspeccionSeguridadCreateArgs<ExtArgs>>): Prisma__InspeccionSeguridadClient<$Result.GetResult<Prisma.$InspeccionSeguridadPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many InspeccionSeguridads.
     * @param {InspeccionSeguridadCreateManyArgs} args - Arguments to create many InspeccionSeguridads.
     * @example
     * // Create many InspeccionSeguridads
     * const inspeccionSeguridad = await prisma.inspeccionSeguridad.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends InspeccionSeguridadCreateManyArgs>(args?: SelectSubset<T, InspeccionSeguridadCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many InspeccionSeguridads and returns the data saved in the database.
     * @param {InspeccionSeguridadCreateManyAndReturnArgs} args - Arguments to create many InspeccionSeguridads.
     * @example
     * // Create many InspeccionSeguridads
     * const inspeccionSeguridad = await prisma.inspeccionSeguridad.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many InspeccionSeguridads and only return the `id_inspeccion`
     * const inspeccionSeguridadWithId_inspeccionOnly = await prisma.inspeccionSeguridad.createManyAndReturn({ 
     *   select: { id_inspeccion: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends InspeccionSeguridadCreateManyAndReturnArgs>(args?: SelectSubset<T, InspeccionSeguridadCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InspeccionSeguridadPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a InspeccionSeguridad.
     * @param {InspeccionSeguridadDeleteArgs} args - Arguments to delete one InspeccionSeguridad.
     * @example
     * // Delete one InspeccionSeguridad
     * const InspeccionSeguridad = await prisma.inspeccionSeguridad.delete({
     *   where: {
     *     // ... filter to delete one InspeccionSeguridad
     *   }
     * })
     * 
     */
    delete<T extends InspeccionSeguridadDeleteArgs>(args: SelectSubset<T, InspeccionSeguridadDeleteArgs<ExtArgs>>): Prisma__InspeccionSeguridadClient<$Result.GetResult<Prisma.$InspeccionSeguridadPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one InspeccionSeguridad.
     * @param {InspeccionSeguridadUpdateArgs} args - Arguments to update one InspeccionSeguridad.
     * @example
     * // Update one InspeccionSeguridad
     * const inspeccionSeguridad = await prisma.inspeccionSeguridad.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends InspeccionSeguridadUpdateArgs>(args: SelectSubset<T, InspeccionSeguridadUpdateArgs<ExtArgs>>): Prisma__InspeccionSeguridadClient<$Result.GetResult<Prisma.$InspeccionSeguridadPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more InspeccionSeguridads.
     * @param {InspeccionSeguridadDeleteManyArgs} args - Arguments to filter InspeccionSeguridads to delete.
     * @example
     * // Delete a few InspeccionSeguridads
     * const { count } = await prisma.inspeccionSeguridad.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends InspeccionSeguridadDeleteManyArgs>(args?: SelectSubset<T, InspeccionSeguridadDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more InspeccionSeguridads.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InspeccionSeguridadUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many InspeccionSeguridads
     * const inspeccionSeguridad = await prisma.inspeccionSeguridad.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends InspeccionSeguridadUpdateManyArgs>(args: SelectSubset<T, InspeccionSeguridadUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one InspeccionSeguridad.
     * @param {InspeccionSeguridadUpsertArgs} args - Arguments to update or create a InspeccionSeguridad.
     * @example
     * // Update or create a InspeccionSeguridad
     * const inspeccionSeguridad = await prisma.inspeccionSeguridad.upsert({
     *   create: {
     *     // ... data to create a InspeccionSeguridad
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the InspeccionSeguridad we want to update
     *   }
     * })
     */
    upsert<T extends InspeccionSeguridadUpsertArgs>(args: SelectSubset<T, InspeccionSeguridadUpsertArgs<ExtArgs>>): Prisma__InspeccionSeguridadClient<$Result.GetResult<Prisma.$InspeccionSeguridadPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of InspeccionSeguridads.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InspeccionSeguridadCountArgs} args - Arguments to filter InspeccionSeguridads to count.
     * @example
     * // Count the number of InspeccionSeguridads
     * const count = await prisma.inspeccionSeguridad.count({
     *   where: {
     *     // ... the filter for the InspeccionSeguridads we want to count
     *   }
     * })
    **/
    count<T extends InspeccionSeguridadCountArgs>(
      args?: Subset<T, InspeccionSeguridadCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], InspeccionSeguridadCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a InspeccionSeguridad.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InspeccionSeguridadAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends InspeccionSeguridadAggregateArgs>(args: Subset<T, InspeccionSeguridadAggregateArgs>): Prisma.PrismaPromise<GetInspeccionSeguridadAggregateType<T>>

    /**
     * Group by InspeccionSeguridad.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InspeccionSeguridadGroupByArgs} args - Group by arguments.
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
      T extends InspeccionSeguridadGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: InspeccionSeguridadGroupByArgs['orderBy'] }
        : { orderBy?: InspeccionSeguridadGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, InspeccionSeguridadGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInspeccionSeguridadGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the InspeccionSeguridad model
   */
  readonly fields: InspeccionSeguridadFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for InspeccionSeguridad.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__InspeccionSeguridadClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the InspeccionSeguridad model
   */ 
  interface InspeccionSeguridadFieldRefs {
    readonly id_inspeccion: FieldRef<"InspeccionSeguridad", 'String'>
    readonly tenant_id: FieldRef<"InspeccionSeguridad", 'String'>
    readonly proyecto_id: FieldRef<"InspeccionSeguridad", 'String'>
    readonly codigo: FieldRef<"InspeccionSeguridad", 'String'>
    readonly tipo_inspeccion: FieldRef<"InspeccionSeguridad", 'String'>
    readonly fecha_inspeccion: FieldRef<"InspeccionSeguridad", 'DateTime'>
    readonly area_inspeccionada: FieldRef<"InspeccionSeguridad", 'String'>
    readonly items_revisados: FieldRef<"InspeccionSeguridad", 'Int'>
    readonly items_conformes: FieldRef<"InspeccionSeguridad", 'Int'>
    readonly items_no_conformes: FieldRef<"InspeccionSeguridad", 'Int'>
    readonly porcentaje_cumplimiento: FieldRef<"InspeccionSeguridad", 'Decimal'>
    readonly resultado: FieldRef<"InspeccionSeguridad", 'String'>
    readonly observaciones: FieldRef<"InspeccionSeguridad", 'String'>
    readonly hallazgos: FieldRef<"InspeccionSeguridad", 'String'>
    readonly evidencia_fotos: FieldRef<"InspeccionSeguridad", 'String'>
    readonly inspector_id: FieldRef<"InspeccionSeguridad", 'String'>
    readonly inspector_nombre: FieldRef<"InspeccionSeguridad", 'String'>
    readonly created_at: FieldRef<"InspeccionSeguridad", 'DateTime'>
    readonly updated_at: FieldRef<"InspeccionSeguridad", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * InspeccionSeguridad findUnique
   */
  export type InspeccionSeguridadFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InspeccionSeguridad
     */
    select?: InspeccionSeguridadSelect<ExtArgs> | null
    /**
     * Filter, which InspeccionSeguridad to fetch.
     */
    where: InspeccionSeguridadWhereUniqueInput
  }

  /**
   * InspeccionSeguridad findUniqueOrThrow
   */
  export type InspeccionSeguridadFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InspeccionSeguridad
     */
    select?: InspeccionSeguridadSelect<ExtArgs> | null
    /**
     * Filter, which InspeccionSeguridad to fetch.
     */
    where: InspeccionSeguridadWhereUniqueInput
  }

  /**
   * InspeccionSeguridad findFirst
   */
  export type InspeccionSeguridadFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InspeccionSeguridad
     */
    select?: InspeccionSeguridadSelect<ExtArgs> | null
    /**
     * Filter, which InspeccionSeguridad to fetch.
     */
    where?: InspeccionSeguridadWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InspeccionSeguridads to fetch.
     */
    orderBy?: InspeccionSeguridadOrderByWithRelationInput | InspeccionSeguridadOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for InspeccionSeguridads.
     */
    cursor?: InspeccionSeguridadWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InspeccionSeguridads from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InspeccionSeguridads.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of InspeccionSeguridads.
     */
    distinct?: InspeccionSeguridadScalarFieldEnum | InspeccionSeguridadScalarFieldEnum[]
  }

  /**
   * InspeccionSeguridad findFirstOrThrow
   */
  export type InspeccionSeguridadFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InspeccionSeguridad
     */
    select?: InspeccionSeguridadSelect<ExtArgs> | null
    /**
     * Filter, which InspeccionSeguridad to fetch.
     */
    where?: InspeccionSeguridadWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InspeccionSeguridads to fetch.
     */
    orderBy?: InspeccionSeguridadOrderByWithRelationInput | InspeccionSeguridadOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for InspeccionSeguridads.
     */
    cursor?: InspeccionSeguridadWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InspeccionSeguridads from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InspeccionSeguridads.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of InspeccionSeguridads.
     */
    distinct?: InspeccionSeguridadScalarFieldEnum | InspeccionSeguridadScalarFieldEnum[]
  }

  /**
   * InspeccionSeguridad findMany
   */
  export type InspeccionSeguridadFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InspeccionSeguridad
     */
    select?: InspeccionSeguridadSelect<ExtArgs> | null
    /**
     * Filter, which InspeccionSeguridads to fetch.
     */
    where?: InspeccionSeguridadWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InspeccionSeguridads to fetch.
     */
    orderBy?: InspeccionSeguridadOrderByWithRelationInput | InspeccionSeguridadOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing InspeccionSeguridads.
     */
    cursor?: InspeccionSeguridadWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InspeccionSeguridads from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InspeccionSeguridads.
     */
    skip?: number
    distinct?: InspeccionSeguridadScalarFieldEnum | InspeccionSeguridadScalarFieldEnum[]
  }

  /**
   * InspeccionSeguridad create
   */
  export type InspeccionSeguridadCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InspeccionSeguridad
     */
    select?: InspeccionSeguridadSelect<ExtArgs> | null
    /**
     * The data needed to create a InspeccionSeguridad.
     */
    data: XOR<InspeccionSeguridadCreateInput, InspeccionSeguridadUncheckedCreateInput>
  }

  /**
   * InspeccionSeguridad createMany
   */
  export type InspeccionSeguridadCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many InspeccionSeguridads.
     */
    data: InspeccionSeguridadCreateManyInput | InspeccionSeguridadCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * InspeccionSeguridad createManyAndReturn
   */
  export type InspeccionSeguridadCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InspeccionSeguridad
     */
    select?: InspeccionSeguridadSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many InspeccionSeguridads.
     */
    data: InspeccionSeguridadCreateManyInput | InspeccionSeguridadCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * InspeccionSeguridad update
   */
  export type InspeccionSeguridadUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InspeccionSeguridad
     */
    select?: InspeccionSeguridadSelect<ExtArgs> | null
    /**
     * The data needed to update a InspeccionSeguridad.
     */
    data: XOR<InspeccionSeguridadUpdateInput, InspeccionSeguridadUncheckedUpdateInput>
    /**
     * Choose, which InspeccionSeguridad to update.
     */
    where: InspeccionSeguridadWhereUniqueInput
  }

  /**
   * InspeccionSeguridad updateMany
   */
  export type InspeccionSeguridadUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update InspeccionSeguridads.
     */
    data: XOR<InspeccionSeguridadUpdateManyMutationInput, InspeccionSeguridadUncheckedUpdateManyInput>
    /**
     * Filter which InspeccionSeguridads to update
     */
    where?: InspeccionSeguridadWhereInput
  }

  /**
   * InspeccionSeguridad upsert
   */
  export type InspeccionSeguridadUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InspeccionSeguridad
     */
    select?: InspeccionSeguridadSelect<ExtArgs> | null
    /**
     * The filter to search for the InspeccionSeguridad to update in case it exists.
     */
    where: InspeccionSeguridadWhereUniqueInput
    /**
     * In case the InspeccionSeguridad found by the `where` argument doesn't exist, create a new InspeccionSeguridad with this data.
     */
    create: XOR<InspeccionSeguridadCreateInput, InspeccionSeguridadUncheckedCreateInput>
    /**
     * In case the InspeccionSeguridad was found with the provided `where` argument, update it with this data.
     */
    update: XOR<InspeccionSeguridadUpdateInput, InspeccionSeguridadUncheckedUpdateInput>
  }

  /**
   * InspeccionSeguridad delete
   */
  export type InspeccionSeguridadDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InspeccionSeguridad
     */
    select?: InspeccionSeguridadSelect<ExtArgs> | null
    /**
     * Filter which InspeccionSeguridad to delete.
     */
    where: InspeccionSeguridadWhereUniqueInput
  }

  /**
   * InspeccionSeguridad deleteMany
   */
  export type InspeccionSeguridadDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which InspeccionSeguridads to delete
     */
    where?: InspeccionSeguridadWhereInput
  }

  /**
   * InspeccionSeguridad without action
   */
  export type InspeccionSeguridadDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InspeccionSeguridad
     */
    select?: InspeccionSeguridadSelect<ExtArgs> | null
  }


  /**
   * Model PermisoTrabajo
   */

  export type AggregatePermisoTrabajo = {
    _count: PermisoTrabajoCountAggregateOutputType | null
    _min: PermisoTrabajoMinAggregateOutputType | null
    _max: PermisoTrabajoMaxAggregateOutputType | null
  }

  export type PermisoTrabajoMinAggregateOutputType = {
    id_permiso: string | null
    tenant_id: string | null
    proyecto_id: string | null
    codigo: string | null
    tipo_permiso: string | null
    area_trabajo: string | null
    descripcion_trabajo: string | null
    fecha_inicio: Date | null
    fecha_fin: Date | null
    estado: string | null
    epp_requerido: string | null
    medidas_control: string | null
    checklist_previo: boolean | null
    solicitado_por: string | null
    solicitante_nombre: string | null
    autorizado_por: string | null
    autorizador_nombre: string | null
    trabajadores: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type PermisoTrabajoMaxAggregateOutputType = {
    id_permiso: string | null
    tenant_id: string | null
    proyecto_id: string | null
    codigo: string | null
    tipo_permiso: string | null
    area_trabajo: string | null
    descripcion_trabajo: string | null
    fecha_inicio: Date | null
    fecha_fin: Date | null
    estado: string | null
    epp_requerido: string | null
    medidas_control: string | null
    checklist_previo: boolean | null
    solicitado_por: string | null
    solicitante_nombre: string | null
    autorizado_por: string | null
    autorizador_nombre: string | null
    trabajadores: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type PermisoTrabajoCountAggregateOutputType = {
    id_permiso: number
    tenant_id: number
    proyecto_id: number
    codigo: number
    tipo_permiso: number
    area_trabajo: number
    descripcion_trabajo: number
    fecha_inicio: number
    fecha_fin: number
    estado: number
    epp_requerido: number
    medidas_control: number
    checklist_previo: number
    solicitado_por: number
    solicitante_nombre: number
    autorizado_por: number
    autorizador_nombre: number
    trabajadores: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type PermisoTrabajoMinAggregateInputType = {
    id_permiso?: true
    tenant_id?: true
    proyecto_id?: true
    codigo?: true
    tipo_permiso?: true
    area_trabajo?: true
    descripcion_trabajo?: true
    fecha_inicio?: true
    fecha_fin?: true
    estado?: true
    epp_requerido?: true
    medidas_control?: true
    checklist_previo?: true
    solicitado_por?: true
    solicitante_nombre?: true
    autorizado_por?: true
    autorizador_nombre?: true
    trabajadores?: true
    created_at?: true
    updated_at?: true
  }

  export type PermisoTrabajoMaxAggregateInputType = {
    id_permiso?: true
    tenant_id?: true
    proyecto_id?: true
    codigo?: true
    tipo_permiso?: true
    area_trabajo?: true
    descripcion_trabajo?: true
    fecha_inicio?: true
    fecha_fin?: true
    estado?: true
    epp_requerido?: true
    medidas_control?: true
    checklist_previo?: true
    solicitado_por?: true
    solicitante_nombre?: true
    autorizado_por?: true
    autorizador_nombre?: true
    trabajadores?: true
    created_at?: true
    updated_at?: true
  }

  export type PermisoTrabajoCountAggregateInputType = {
    id_permiso?: true
    tenant_id?: true
    proyecto_id?: true
    codigo?: true
    tipo_permiso?: true
    area_trabajo?: true
    descripcion_trabajo?: true
    fecha_inicio?: true
    fecha_fin?: true
    estado?: true
    epp_requerido?: true
    medidas_control?: true
    checklist_previo?: true
    solicitado_por?: true
    solicitante_nombre?: true
    autorizado_por?: true
    autorizador_nombre?: true
    trabajadores?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type PermisoTrabajoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PermisoTrabajo to aggregate.
     */
    where?: PermisoTrabajoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PermisoTrabajos to fetch.
     */
    orderBy?: PermisoTrabajoOrderByWithRelationInput | PermisoTrabajoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PermisoTrabajoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PermisoTrabajos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PermisoTrabajos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PermisoTrabajos
    **/
    _count?: true | PermisoTrabajoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PermisoTrabajoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PermisoTrabajoMaxAggregateInputType
  }

  export type GetPermisoTrabajoAggregateType<T extends PermisoTrabajoAggregateArgs> = {
        [P in keyof T & keyof AggregatePermisoTrabajo]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePermisoTrabajo[P]>
      : GetScalarType<T[P], AggregatePermisoTrabajo[P]>
  }




  export type PermisoTrabajoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PermisoTrabajoWhereInput
    orderBy?: PermisoTrabajoOrderByWithAggregationInput | PermisoTrabajoOrderByWithAggregationInput[]
    by: PermisoTrabajoScalarFieldEnum[] | PermisoTrabajoScalarFieldEnum
    having?: PermisoTrabajoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PermisoTrabajoCountAggregateInputType | true
    _min?: PermisoTrabajoMinAggregateInputType
    _max?: PermisoTrabajoMaxAggregateInputType
  }

  export type PermisoTrabajoGroupByOutputType = {
    id_permiso: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    tipo_permiso: string
    area_trabajo: string
    descripcion_trabajo: string
    fecha_inicio: Date
    fecha_fin: Date
    estado: string
    epp_requerido: string | null
    medidas_control: string | null
    checklist_previo: boolean
    solicitado_por: string
    solicitante_nombre: string
    autorizado_por: string | null
    autorizador_nombre: string | null
    trabajadores: string | null
    created_at: Date
    updated_at: Date
    _count: PermisoTrabajoCountAggregateOutputType | null
    _min: PermisoTrabajoMinAggregateOutputType | null
    _max: PermisoTrabajoMaxAggregateOutputType | null
  }

  type GetPermisoTrabajoGroupByPayload<T extends PermisoTrabajoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PermisoTrabajoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PermisoTrabajoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PermisoTrabajoGroupByOutputType[P]>
            : GetScalarType<T[P], PermisoTrabajoGroupByOutputType[P]>
        }
      >
    >


  export type PermisoTrabajoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_permiso?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    codigo?: boolean
    tipo_permiso?: boolean
    area_trabajo?: boolean
    descripcion_trabajo?: boolean
    fecha_inicio?: boolean
    fecha_fin?: boolean
    estado?: boolean
    epp_requerido?: boolean
    medidas_control?: boolean
    checklist_previo?: boolean
    solicitado_por?: boolean
    solicitante_nombre?: boolean
    autorizado_por?: boolean
    autorizador_nombre?: boolean
    trabajadores?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["permisoTrabajo"]>

  export type PermisoTrabajoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_permiso?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    codigo?: boolean
    tipo_permiso?: boolean
    area_trabajo?: boolean
    descripcion_trabajo?: boolean
    fecha_inicio?: boolean
    fecha_fin?: boolean
    estado?: boolean
    epp_requerido?: boolean
    medidas_control?: boolean
    checklist_previo?: boolean
    solicitado_por?: boolean
    solicitante_nombre?: boolean
    autorizado_por?: boolean
    autorizador_nombre?: boolean
    trabajadores?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["permisoTrabajo"]>

  export type PermisoTrabajoSelectScalar = {
    id_permiso?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    codigo?: boolean
    tipo_permiso?: boolean
    area_trabajo?: boolean
    descripcion_trabajo?: boolean
    fecha_inicio?: boolean
    fecha_fin?: boolean
    estado?: boolean
    epp_requerido?: boolean
    medidas_control?: boolean
    checklist_previo?: boolean
    solicitado_por?: boolean
    solicitante_nombre?: boolean
    autorizado_por?: boolean
    autorizador_nombre?: boolean
    trabajadores?: boolean
    created_at?: boolean
    updated_at?: boolean
  }


  export type $PermisoTrabajoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PermisoTrabajo"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id_permiso: string
      tenant_id: string
      proyecto_id: string
      codigo: string
      tipo_permiso: string
      area_trabajo: string
      descripcion_trabajo: string
      fecha_inicio: Date
      fecha_fin: Date
      estado: string
      epp_requerido: string | null
      medidas_control: string | null
      checklist_previo: boolean
      solicitado_por: string
      solicitante_nombre: string
      autorizado_por: string | null
      autorizador_nombre: string | null
      trabajadores: string | null
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["permisoTrabajo"]>
    composites: {}
  }

  type PermisoTrabajoGetPayload<S extends boolean | null | undefined | PermisoTrabajoDefaultArgs> = $Result.GetResult<Prisma.$PermisoTrabajoPayload, S>

  type PermisoTrabajoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PermisoTrabajoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PermisoTrabajoCountAggregateInputType | true
    }

  export interface PermisoTrabajoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PermisoTrabajo'], meta: { name: 'PermisoTrabajo' } }
    /**
     * Find zero or one PermisoTrabajo that matches the filter.
     * @param {PermisoTrabajoFindUniqueArgs} args - Arguments to find a PermisoTrabajo
     * @example
     * // Get one PermisoTrabajo
     * const permisoTrabajo = await prisma.permisoTrabajo.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PermisoTrabajoFindUniqueArgs>(args: SelectSubset<T, PermisoTrabajoFindUniqueArgs<ExtArgs>>): Prisma__PermisoTrabajoClient<$Result.GetResult<Prisma.$PermisoTrabajoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one PermisoTrabajo that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PermisoTrabajoFindUniqueOrThrowArgs} args - Arguments to find a PermisoTrabajo
     * @example
     * // Get one PermisoTrabajo
     * const permisoTrabajo = await prisma.permisoTrabajo.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PermisoTrabajoFindUniqueOrThrowArgs>(args: SelectSubset<T, PermisoTrabajoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PermisoTrabajoClient<$Result.GetResult<Prisma.$PermisoTrabajoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first PermisoTrabajo that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PermisoTrabajoFindFirstArgs} args - Arguments to find a PermisoTrabajo
     * @example
     * // Get one PermisoTrabajo
     * const permisoTrabajo = await prisma.permisoTrabajo.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PermisoTrabajoFindFirstArgs>(args?: SelectSubset<T, PermisoTrabajoFindFirstArgs<ExtArgs>>): Prisma__PermisoTrabajoClient<$Result.GetResult<Prisma.$PermisoTrabajoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first PermisoTrabajo that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PermisoTrabajoFindFirstOrThrowArgs} args - Arguments to find a PermisoTrabajo
     * @example
     * // Get one PermisoTrabajo
     * const permisoTrabajo = await prisma.permisoTrabajo.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PermisoTrabajoFindFirstOrThrowArgs>(args?: SelectSubset<T, PermisoTrabajoFindFirstOrThrowArgs<ExtArgs>>): Prisma__PermisoTrabajoClient<$Result.GetResult<Prisma.$PermisoTrabajoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more PermisoTrabajos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PermisoTrabajoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PermisoTrabajos
     * const permisoTrabajos = await prisma.permisoTrabajo.findMany()
     * 
     * // Get first 10 PermisoTrabajos
     * const permisoTrabajos = await prisma.permisoTrabajo.findMany({ take: 10 })
     * 
     * // Only select the `id_permiso`
     * const permisoTrabajoWithId_permisoOnly = await prisma.permisoTrabajo.findMany({ select: { id_permiso: true } })
     * 
     */
    findMany<T extends PermisoTrabajoFindManyArgs>(args?: SelectSubset<T, PermisoTrabajoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PermisoTrabajoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a PermisoTrabajo.
     * @param {PermisoTrabajoCreateArgs} args - Arguments to create a PermisoTrabajo.
     * @example
     * // Create one PermisoTrabajo
     * const PermisoTrabajo = await prisma.permisoTrabajo.create({
     *   data: {
     *     // ... data to create a PermisoTrabajo
     *   }
     * })
     * 
     */
    create<T extends PermisoTrabajoCreateArgs>(args: SelectSubset<T, PermisoTrabajoCreateArgs<ExtArgs>>): Prisma__PermisoTrabajoClient<$Result.GetResult<Prisma.$PermisoTrabajoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many PermisoTrabajos.
     * @param {PermisoTrabajoCreateManyArgs} args - Arguments to create many PermisoTrabajos.
     * @example
     * // Create many PermisoTrabajos
     * const permisoTrabajo = await prisma.permisoTrabajo.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PermisoTrabajoCreateManyArgs>(args?: SelectSubset<T, PermisoTrabajoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PermisoTrabajos and returns the data saved in the database.
     * @param {PermisoTrabajoCreateManyAndReturnArgs} args - Arguments to create many PermisoTrabajos.
     * @example
     * // Create many PermisoTrabajos
     * const permisoTrabajo = await prisma.permisoTrabajo.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PermisoTrabajos and only return the `id_permiso`
     * const permisoTrabajoWithId_permisoOnly = await prisma.permisoTrabajo.createManyAndReturn({ 
     *   select: { id_permiso: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PermisoTrabajoCreateManyAndReturnArgs>(args?: SelectSubset<T, PermisoTrabajoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PermisoTrabajoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a PermisoTrabajo.
     * @param {PermisoTrabajoDeleteArgs} args - Arguments to delete one PermisoTrabajo.
     * @example
     * // Delete one PermisoTrabajo
     * const PermisoTrabajo = await prisma.permisoTrabajo.delete({
     *   where: {
     *     // ... filter to delete one PermisoTrabajo
     *   }
     * })
     * 
     */
    delete<T extends PermisoTrabajoDeleteArgs>(args: SelectSubset<T, PermisoTrabajoDeleteArgs<ExtArgs>>): Prisma__PermisoTrabajoClient<$Result.GetResult<Prisma.$PermisoTrabajoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one PermisoTrabajo.
     * @param {PermisoTrabajoUpdateArgs} args - Arguments to update one PermisoTrabajo.
     * @example
     * // Update one PermisoTrabajo
     * const permisoTrabajo = await prisma.permisoTrabajo.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PermisoTrabajoUpdateArgs>(args: SelectSubset<T, PermisoTrabajoUpdateArgs<ExtArgs>>): Prisma__PermisoTrabajoClient<$Result.GetResult<Prisma.$PermisoTrabajoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more PermisoTrabajos.
     * @param {PermisoTrabajoDeleteManyArgs} args - Arguments to filter PermisoTrabajos to delete.
     * @example
     * // Delete a few PermisoTrabajos
     * const { count } = await prisma.permisoTrabajo.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PermisoTrabajoDeleteManyArgs>(args?: SelectSubset<T, PermisoTrabajoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PermisoTrabajos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PermisoTrabajoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PermisoTrabajos
     * const permisoTrabajo = await prisma.permisoTrabajo.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PermisoTrabajoUpdateManyArgs>(args: SelectSubset<T, PermisoTrabajoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PermisoTrabajo.
     * @param {PermisoTrabajoUpsertArgs} args - Arguments to update or create a PermisoTrabajo.
     * @example
     * // Update or create a PermisoTrabajo
     * const permisoTrabajo = await prisma.permisoTrabajo.upsert({
     *   create: {
     *     // ... data to create a PermisoTrabajo
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PermisoTrabajo we want to update
     *   }
     * })
     */
    upsert<T extends PermisoTrabajoUpsertArgs>(args: SelectSubset<T, PermisoTrabajoUpsertArgs<ExtArgs>>): Prisma__PermisoTrabajoClient<$Result.GetResult<Prisma.$PermisoTrabajoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of PermisoTrabajos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PermisoTrabajoCountArgs} args - Arguments to filter PermisoTrabajos to count.
     * @example
     * // Count the number of PermisoTrabajos
     * const count = await prisma.permisoTrabajo.count({
     *   where: {
     *     // ... the filter for the PermisoTrabajos we want to count
     *   }
     * })
    **/
    count<T extends PermisoTrabajoCountArgs>(
      args?: Subset<T, PermisoTrabajoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PermisoTrabajoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PermisoTrabajo.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PermisoTrabajoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends PermisoTrabajoAggregateArgs>(args: Subset<T, PermisoTrabajoAggregateArgs>): Prisma.PrismaPromise<GetPermisoTrabajoAggregateType<T>>

    /**
     * Group by PermisoTrabajo.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PermisoTrabajoGroupByArgs} args - Group by arguments.
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
      T extends PermisoTrabajoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PermisoTrabajoGroupByArgs['orderBy'] }
        : { orderBy?: PermisoTrabajoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, PermisoTrabajoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPermisoTrabajoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PermisoTrabajo model
   */
  readonly fields: PermisoTrabajoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PermisoTrabajo.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PermisoTrabajoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the PermisoTrabajo model
   */ 
  interface PermisoTrabajoFieldRefs {
    readonly id_permiso: FieldRef<"PermisoTrabajo", 'String'>
    readonly tenant_id: FieldRef<"PermisoTrabajo", 'String'>
    readonly proyecto_id: FieldRef<"PermisoTrabajo", 'String'>
    readonly codigo: FieldRef<"PermisoTrabajo", 'String'>
    readonly tipo_permiso: FieldRef<"PermisoTrabajo", 'String'>
    readonly area_trabajo: FieldRef<"PermisoTrabajo", 'String'>
    readonly descripcion_trabajo: FieldRef<"PermisoTrabajo", 'String'>
    readonly fecha_inicio: FieldRef<"PermisoTrabajo", 'DateTime'>
    readonly fecha_fin: FieldRef<"PermisoTrabajo", 'DateTime'>
    readonly estado: FieldRef<"PermisoTrabajo", 'String'>
    readonly epp_requerido: FieldRef<"PermisoTrabajo", 'String'>
    readonly medidas_control: FieldRef<"PermisoTrabajo", 'String'>
    readonly checklist_previo: FieldRef<"PermisoTrabajo", 'Boolean'>
    readonly solicitado_por: FieldRef<"PermisoTrabajo", 'String'>
    readonly solicitante_nombre: FieldRef<"PermisoTrabajo", 'String'>
    readonly autorizado_por: FieldRef<"PermisoTrabajo", 'String'>
    readonly autorizador_nombre: FieldRef<"PermisoTrabajo", 'String'>
    readonly trabajadores: FieldRef<"PermisoTrabajo", 'String'>
    readonly created_at: FieldRef<"PermisoTrabajo", 'DateTime'>
    readonly updated_at: FieldRef<"PermisoTrabajo", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PermisoTrabajo findUnique
   */
  export type PermisoTrabajoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PermisoTrabajo
     */
    select?: PermisoTrabajoSelect<ExtArgs> | null
    /**
     * Filter, which PermisoTrabajo to fetch.
     */
    where: PermisoTrabajoWhereUniqueInput
  }

  /**
   * PermisoTrabajo findUniqueOrThrow
   */
  export type PermisoTrabajoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PermisoTrabajo
     */
    select?: PermisoTrabajoSelect<ExtArgs> | null
    /**
     * Filter, which PermisoTrabajo to fetch.
     */
    where: PermisoTrabajoWhereUniqueInput
  }

  /**
   * PermisoTrabajo findFirst
   */
  export type PermisoTrabajoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PermisoTrabajo
     */
    select?: PermisoTrabajoSelect<ExtArgs> | null
    /**
     * Filter, which PermisoTrabajo to fetch.
     */
    where?: PermisoTrabajoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PermisoTrabajos to fetch.
     */
    orderBy?: PermisoTrabajoOrderByWithRelationInput | PermisoTrabajoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PermisoTrabajos.
     */
    cursor?: PermisoTrabajoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PermisoTrabajos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PermisoTrabajos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PermisoTrabajos.
     */
    distinct?: PermisoTrabajoScalarFieldEnum | PermisoTrabajoScalarFieldEnum[]
  }

  /**
   * PermisoTrabajo findFirstOrThrow
   */
  export type PermisoTrabajoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PermisoTrabajo
     */
    select?: PermisoTrabajoSelect<ExtArgs> | null
    /**
     * Filter, which PermisoTrabajo to fetch.
     */
    where?: PermisoTrabajoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PermisoTrabajos to fetch.
     */
    orderBy?: PermisoTrabajoOrderByWithRelationInput | PermisoTrabajoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PermisoTrabajos.
     */
    cursor?: PermisoTrabajoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PermisoTrabajos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PermisoTrabajos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PermisoTrabajos.
     */
    distinct?: PermisoTrabajoScalarFieldEnum | PermisoTrabajoScalarFieldEnum[]
  }

  /**
   * PermisoTrabajo findMany
   */
  export type PermisoTrabajoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PermisoTrabajo
     */
    select?: PermisoTrabajoSelect<ExtArgs> | null
    /**
     * Filter, which PermisoTrabajos to fetch.
     */
    where?: PermisoTrabajoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PermisoTrabajos to fetch.
     */
    orderBy?: PermisoTrabajoOrderByWithRelationInput | PermisoTrabajoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PermisoTrabajos.
     */
    cursor?: PermisoTrabajoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PermisoTrabajos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PermisoTrabajos.
     */
    skip?: number
    distinct?: PermisoTrabajoScalarFieldEnum | PermisoTrabajoScalarFieldEnum[]
  }

  /**
   * PermisoTrabajo create
   */
  export type PermisoTrabajoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PermisoTrabajo
     */
    select?: PermisoTrabajoSelect<ExtArgs> | null
    /**
     * The data needed to create a PermisoTrabajo.
     */
    data: XOR<PermisoTrabajoCreateInput, PermisoTrabajoUncheckedCreateInput>
  }

  /**
   * PermisoTrabajo createMany
   */
  export type PermisoTrabajoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PermisoTrabajos.
     */
    data: PermisoTrabajoCreateManyInput | PermisoTrabajoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PermisoTrabajo createManyAndReturn
   */
  export type PermisoTrabajoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PermisoTrabajo
     */
    select?: PermisoTrabajoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many PermisoTrabajos.
     */
    data: PermisoTrabajoCreateManyInput | PermisoTrabajoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PermisoTrabajo update
   */
  export type PermisoTrabajoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PermisoTrabajo
     */
    select?: PermisoTrabajoSelect<ExtArgs> | null
    /**
     * The data needed to update a PermisoTrabajo.
     */
    data: XOR<PermisoTrabajoUpdateInput, PermisoTrabajoUncheckedUpdateInput>
    /**
     * Choose, which PermisoTrabajo to update.
     */
    where: PermisoTrabajoWhereUniqueInput
  }

  /**
   * PermisoTrabajo updateMany
   */
  export type PermisoTrabajoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PermisoTrabajos.
     */
    data: XOR<PermisoTrabajoUpdateManyMutationInput, PermisoTrabajoUncheckedUpdateManyInput>
    /**
     * Filter which PermisoTrabajos to update
     */
    where?: PermisoTrabajoWhereInput
  }

  /**
   * PermisoTrabajo upsert
   */
  export type PermisoTrabajoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PermisoTrabajo
     */
    select?: PermisoTrabajoSelect<ExtArgs> | null
    /**
     * The filter to search for the PermisoTrabajo to update in case it exists.
     */
    where: PermisoTrabajoWhereUniqueInput
    /**
     * In case the PermisoTrabajo found by the `where` argument doesn't exist, create a new PermisoTrabajo with this data.
     */
    create: XOR<PermisoTrabajoCreateInput, PermisoTrabajoUncheckedCreateInput>
    /**
     * In case the PermisoTrabajo was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PermisoTrabajoUpdateInput, PermisoTrabajoUncheckedUpdateInput>
  }

  /**
   * PermisoTrabajo delete
   */
  export type PermisoTrabajoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PermisoTrabajo
     */
    select?: PermisoTrabajoSelect<ExtArgs> | null
    /**
     * Filter which PermisoTrabajo to delete.
     */
    where: PermisoTrabajoWhereUniqueInput
  }

  /**
   * PermisoTrabajo deleteMany
   */
  export type PermisoTrabajoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PermisoTrabajos to delete
     */
    where?: PermisoTrabajoWhereInput
  }

  /**
   * PermisoTrabajo without action
   */
  export type PermisoTrabajoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PermisoTrabajo
     */
    select?: PermisoTrabajoSelect<ExtArgs> | null
  }


  /**
   * Model Capacitacion
   */

  export type AggregateCapacitacion = {
    _count: CapacitacionCountAggregateOutputType | null
    _avg: CapacitacionAvgAggregateOutputType | null
    _sum: CapacitacionSumAggregateOutputType | null
    _min: CapacitacionMinAggregateOutputType | null
    _max: CapacitacionMaxAggregateOutputType | null
  }

  export type CapacitacionAvgAggregateOutputType = {
    duracion_horas: Decimal | null
    validez_meses: number | null
  }

  export type CapacitacionSumAggregateOutputType = {
    duracion_horas: Decimal | null
    validez_meses: number | null
  }

  export type CapacitacionMinAggregateOutputType = {
    id_capacitacion: string | null
    tenant_id: string | null
    proyecto_id: string | null
    codigo: string | null
    titulo: string | null
    tipo: string | null
    instructor: string | null
    fecha: Date | null
    duracion_horas: Decimal | null
    ubicacion: string | null
    contenido: string | null
    validez_meses: number | null
    estado: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type CapacitacionMaxAggregateOutputType = {
    id_capacitacion: string | null
    tenant_id: string | null
    proyecto_id: string | null
    codigo: string | null
    titulo: string | null
    tipo: string | null
    instructor: string | null
    fecha: Date | null
    duracion_horas: Decimal | null
    ubicacion: string | null
    contenido: string | null
    validez_meses: number | null
    estado: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type CapacitacionCountAggregateOutputType = {
    id_capacitacion: number
    tenant_id: number
    proyecto_id: number
    codigo: number
    titulo: number
    tipo: number
    instructor: number
    fecha: number
    duracion_horas: number
    ubicacion: number
    contenido: number
    validez_meses: number
    estado: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type CapacitacionAvgAggregateInputType = {
    duracion_horas?: true
    validez_meses?: true
  }

  export type CapacitacionSumAggregateInputType = {
    duracion_horas?: true
    validez_meses?: true
  }

  export type CapacitacionMinAggregateInputType = {
    id_capacitacion?: true
    tenant_id?: true
    proyecto_id?: true
    codigo?: true
    titulo?: true
    tipo?: true
    instructor?: true
    fecha?: true
    duracion_horas?: true
    ubicacion?: true
    contenido?: true
    validez_meses?: true
    estado?: true
    created_at?: true
    updated_at?: true
  }

  export type CapacitacionMaxAggregateInputType = {
    id_capacitacion?: true
    tenant_id?: true
    proyecto_id?: true
    codigo?: true
    titulo?: true
    tipo?: true
    instructor?: true
    fecha?: true
    duracion_horas?: true
    ubicacion?: true
    contenido?: true
    validez_meses?: true
    estado?: true
    created_at?: true
    updated_at?: true
  }

  export type CapacitacionCountAggregateInputType = {
    id_capacitacion?: true
    tenant_id?: true
    proyecto_id?: true
    codigo?: true
    titulo?: true
    tipo?: true
    instructor?: true
    fecha?: true
    duracion_horas?: true
    ubicacion?: true
    contenido?: true
    validez_meses?: true
    estado?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type CapacitacionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Capacitacion to aggregate.
     */
    where?: CapacitacionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Capacitacions to fetch.
     */
    orderBy?: CapacitacionOrderByWithRelationInput | CapacitacionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CapacitacionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Capacitacions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Capacitacions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Capacitacions
    **/
    _count?: true | CapacitacionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CapacitacionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CapacitacionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CapacitacionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CapacitacionMaxAggregateInputType
  }

  export type GetCapacitacionAggregateType<T extends CapacitacionAggregateArgs> = {
        [P in keyof T & keyof AggregateCapacitacion]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCapacitacion[P]>
      : GetScalarType<T[P], AggregateCapacitacion[P]>
  }




  export type CapacitacionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CapacitacionWhereInput
    orderBy?: CapacitacionOrderByWithAggregationInput | CapacitacionOrderByWithAggregationInput[]
    by: CapacitacionScalarFieldEnum[] | CapacitacionScalarFieldEnum
    having?: CapacitacionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CapacitacionCountAggregateInputType | true
    _avg?: CapacitacionAvgAggregateInputType
    _sum?: CapacitacionSumAggregateInputType
    _min?: CapacitacionMinAggregateInputType
    _max?: CapacitacionMaxAggregateInputType
  }

  export type CapacitacionGroupByOutputType = {
    id_capacitacion: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    titulo: string
    tipo: string
    instructor: string
    fecha: Date
    duracion_horas: Decimal
    ubicacion: string | null
    contenido: string | null
    validez_meses: number | null
    estado: string
    created_at: Date
    updated_at: Date
    _count: CapacitacionCountAggregateOutputType | null
    _avg: CapacitacionAvgAggregateOutputType | null
    _sum: CapacitacionSumAggregateOutputType | null
    _min: CapacitacionMinAggregateOutputType | null
    _max: CapacitacionMaxAggregateOutputType | null
  }

  type GetCapacitacionGroupByPayload<T extends CapacitacionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CapacitacionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CapacitacionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CapacitacionGroupByOutputType[P]>
            : GetScalarType<T[P], CapacitacionGroupByOutputType[P]>
        }
      >
    >


  export type CapacitacionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_capacitacion?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    codigo?: boolean
    titulo?: boolean
    tipo?: boolean
    instructor?: boolean
    fecha?: boolean
    duracion_horas?: boolean
    ubicacion?: boolean
    contenido?: boolean
    validez_meses?: boolean
    estado?: boolean
    created_at?: boolean
    updated_at?: boolean
    registros?: boolean | Capacitacion$registrosArgs<ExtArgs>
    _count?: boolean | CapacitacionCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["capacitacion"]>

  export type CapacitacionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_capacitacion?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    codigo?: boolean
    titulo?: boolean
    tipo?: boolean
    instructor?: boolean
    fecha?: boolean
    duracion_horas?: boolean
    ubicacion?: boolean
    contenido?: boolean
    validez_meses?: boolean
    estado?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["capacitacion"]>

  export type CapacitacionSelectScalar = {
    id_capacitacion?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    codigo?: boolean
    titulo?: boolean
    tipo?: boolean
    instructor?: boolean
    fecha?: boolean
    duracion_horas?: boolean
    ubicacion?: boolean
    contenido?: boolean
    validez_meses?: boolean
    estado?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type CapacitacionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    registros?: boolean | Capacitacion$registrosArgs<ExtArgs>
    _count?: boolean | CapacitacionCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CapacitacionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $CapacitacionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Capacitacion"
    objects: {
      registros: Prisma.$RegistroCapacitacionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id_capacitacion: string
      tenant_id: string
      proyecto_id: string
      codigo: string
      titulo: string
      tipo: string
      instructor: string
      fecha: Date
      duracion_horas: Prisma.Decimal
      ubicacion: string | null
      contenido: string | null
      validez_meses: number | null
      estado: string
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["capacitacion"]>
    composites: {}
  }

  type CapacitacionGetPayload<S extends boolean | null | undefined | CapacitacionDefaultArgs> = $Result.GetResult<Prisma.$CapacitacionPayload, S>

  type CapacitacionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CapacitacionFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CapacitacionCountAggregateInputType | true
    }

  export interface CapacitacionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Capacitacion'], meta: { name: 'Capacitacion' } }
    /**
     * Find zero or one Capacitacion that matches the filter.
     * @param {CapacitacionFindUniqueArgs} args - Arguments to find a Capacitacion
     * @example
     * // Get one Capacitacion
     * const capacitacion = await prisma.capacitacion.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CapacitacionFindUniqueArgs>(args: SelectSubset<T, CapacitacionFindUniqueArgs<ExtArgs>>): Prisma__CapacitacionClient<$Result.GetResult<Prisma.$CapacitacionPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Capacitacion that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CapacitacionFindUniqueOrThrowArgs} args - Arguments to find a Capacitacion
     * @example
     * // Get one Capacitacion
     * const capacitacion = await prisma.capacitacion.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CapacitacionFindUniqueOrThrowArgs>(args: SelectSubset<T, CapacitacionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CapacitacionClient<$Result.GetResult<Prisma.$CapacitacionPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Capacitacion that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CapacitacionFindFirstArgs} args - Arguments to find a Capacitacion
     * @example
     * // Get one Capacitacion
     * const capacitacion = await prisma.capacitacion.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CapacitacionFindFirstArgs>(args?: SelectSubset<T, CapacitacionFindFirstArgs<ExtArgs>>): Prisma__CapacitacionClient<$Result.GetResult<Prisma.$CapacitacionPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Capacitacion that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CapacitacionFindFirstOrThrowArgs} args - Arguments to find a Capacitacion
     * @example
     * // Get one Capacitacion
     * const capacitacion = await prisma.capacitacion.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CapacitacionFindFirstOrThrowArgs>(args?: SelectSubset<T, CapacitacionFindFirstOrThrowArgs<ExtArgs>>): Prisma__CapacitacionClient<$Result.GetResult<Prisma.$CapacitacionPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Capacitacions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CapacitacionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Capacitacions
     * const capacitacions = await prisma.capacitacion.findMany()
     * 
     * // Get first 10 Capacitacions
     * const capacitacions = await prisma.capacitacion.findMany({ take: 10 })
     * 
     * // Only select the `id_capacitacion`
     * const capacitacionWithId_capacitacionOnly = await prisma.capacitacion.findMany({ select: { id_capacitacion: true } })
     * 
     */
    findMany<T extends CapacitacionFindManyArgs>(args?: SelectSubset<T, CapacitacionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CapacitacionPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Capacitacion.
     * @param {CapacitacionCreateArgs} args - Arguments to create a Capacitacion.
     * @example
     * // Create one Capacitacion
     * const Capacitacion = await prisma.capacitacion.create({
     *   data: {
     *     // ... data to create a Capacitacion
     *   }
     * })
     * 
     */
    create<T extends CapacitacionCreateArgs>(args: SelectSubset<T, CapacitacionCreateArgs<ExtArgs>>): Prisma__CapacitacionClient<$Result.GetResult<Prisma.$CapacitacionPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Capacitacions.
     * @param {CapacitacionCreateManyArgs} args - Arguments to create many Capacitacions.
     * @example
     * // Create many Capacitacions
     * const capacitacion = await prisma.capacitacion.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CapacitacionCreateManyArgs>(args?: SelectSubset<T, CapacitacionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Capacitacions and returns the data saved in the database.
     * @param {CapacitacionCreateManyAndReturnArgs} args - Arguments to create many Capacitacions.
     * @example
     * // Create many Capacitacions
     * const capacitacion = await prisma.capacitacion.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Capacitacions and only return the `id_capacitacion`
     * const capacitacionWithId_capacitacionOnly = await prisma.capacitacion.createManyAndReturn({ 
     *   select: { id_capacitacion: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CapacitacionCreateManyAndReturnArgs>(args?: SelectSubset<T, CapacitacionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CapacitacionPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Capacitacion.
     * @param {CapacitacionDeleteArgs} args - Arguments to delete one Capacitacion.
     * @example
     * // Delete one Capacitacion
     * const Capacitacion = await prisma.capacitacion.delete({
     *   where: {
     *     // ... filter to delete one Capacitacion
     *   }
     * })
     * 
     */
    delete<T extends CapacitacionDeleteArgs>(args: SelectSubset<T, CapacitacionDeleteArgs<ExtArgs>>): Prisma__CapacitacionClient<$Result.GetResult<Prisma.$CapacitacionPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Capacitacion.
     * @param {CapacitacionUpdateArgs} args - Arguments to update one Capacitacion.
     * @example
     * // Update one Capacitacion
     * const capacitacion = await prisma.capacitacion.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CapacitacionUpdateArgs>(args: SelectSubset<T, CapacitacionUpdateArgs<ExtArgs>>): Prisma__CapacitacionClient<$Result.GetResult<Prisma.$CapacitacionPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Capacitacions.
     * @param {CapacitacionDeleteManyArgs} args - Arguments to filter Capacitacions to delete.
     * @example
     * // Delete a few Capacitacions
     * const { count } = await prisma.capacitacion.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CapacitacionDeleteManyArgs>(args?: SelectSubset<T, CapacitacionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Capacitacions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CapacitacionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Capacitacions
     * const capacitacion = await prisma.capacitacion.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CapacitacionUpdateManyArgs>(args: SelectSubset<T, CapacitacionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Capacitacion.
     * @param {CapacitacionUpsertArgs} args - Arguments to update or create a Capacitacion.
     * @example
     * // Update or create a Capacitacion
     * const capacitacion = await prisma.capacitacion.upsert({
     *   create: {
     *     // ... data to create a Capacitacion
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Capacitacion we want to update
     *   }
     * })
     */
    upsert<T extends CapacitacionUpsertArgs>(args: SelectSubset<T, CapacitacionUpsertArgs<ExtArgs>>): Prisma__CapacitacionClient<$Result.GetResult<Prisma.$CapacitacionPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Capacitacions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CapacitacionCountArgs} args - Arguments to filter Capacitacions to count.
     * @example
     * // Count the number of Capacitacions
     * const count = await prisma.capacitacion.count({
     *   where: {
     *     // ... the filter for the Capacitacions we want to count
     *   }
     * })
    **/
    count<T extends CapacitacionCountArgs>(
      args?: Subset<T, CapacitacionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CapacitacionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Capacitacion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CapacitacionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends CapacitacionAggregateArgs>(args: Subset<T, CapacitacionAggregateArgs>): Prisma.PrismaPromise<GetCapacitacionAggregateType<T>>

    /**
     * Group by Capacitacion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CapacitacionGroupByArgs} args - Group by arguments.
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
      T extends CapacitacionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CapacitacionGroupByArgs['orderBy'] }
        : { orderBy?: CapacitacionGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, CapacitacionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCapacitacionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Capacitacion model
   */
  readonly fields: CapacitacionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Capacitacion.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CapacitacionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    registros<T extends Capacitacion$registrosArgs<ExtArgs> = {}>(args?: Subset<T, Capacitacion$registrosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RegistroCapacitacionPayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the Capacitacion model
   */ 
  interface CapacitacionFieldRefs {
    readonly id_capacitacion: FieldRef<"Capacitacion", 'String'>
    readonly tenant_id: FieldRef<"Capacitacion", 'String'>
    readonly proyecto_id: FieldRef<"Capacitacion", 'String'>
    readonly codigo: FieldRef<"Capacitacion", 'String'>
    readonly titulo: FieldRef<"Capacitacion", 'String'>
    readonly tipo: FieldRef<"Capacitacion", 'String'>
    readonly instructor: FieldRef<"Capacitacion", 'String'>
    readonly fecha: FieldRef<"Capacitacion", 'DateTime'>
    readonly duracion_horas: FieldRef<"Capacitacion", 'Decimal'>
    readonly ubicacion: FieldRef<"Capacitacion", 'String'>
    readonly contenido: FieldRef<"Capacitacion", 'String'>
    readonly validez_meses: FieldRef<"Capacitacion", 'Int'>
    readonly estado: FieldRef<"Capacitacion", 'String'>
    readonly created_at: FieldRef<"Capacitacion", 'DateTime'>
    readonly updated_at: FieldRef<"Capacitacion", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Capacitacion findUnique
   */
  export type CapacitacionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Capacitacion
     */
    select?: CapacitacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CapacitacionInclude<ExtArgs> | null
    /**
     * Filter, which Capacitacion to fetch.
     */
    where: CapacitacionWhereUniqueInput
  }

  /**
   * Capacitacion findUniqueOrThrow
   */
  export type CapacitacionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Capacitacion
     */
    select?: CapacitacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CapacitacionInclude<ExtArgs> | null
    /**
     * Filter, which Capacitacion to fetch.
     */
    where: CapacitacionWhereUniqueInput
  }

  /**
   * Capacitacion findFirst
   */
  export type CapacitacionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Capacitacion
     */
    select?: CapacitacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CapacitacionInclude<ExtArgs> | null
    /**
     * Filter, which Capacitacion to fetch.
     */
    where?: CapacitacionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Capacitacions to fetch.
     */
    orderBy?: CapacitacionOrderByWithRelationInput | CapacitacionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Capacitacions.
     */
    cursor?: CapacitacionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Capacitacions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Capacitacions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Capacitacions.
     */
    distinct?: CapacitacionScalarFieldEnum | CapacitacionScalarFieldEnum[]
  }

  /**
   * Capacitacion findFirstOrThrow
   */
  export type CapacitacionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Capacitacion
     */
    select?: CapacitacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CapacitacionInclude<ExtArgs> | null
    /**
     * Filter, which Capacitacion to fetch.
     */
    where?: CapacitacionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Capacitacions to fetch.
     */
    orderBy?: CapacitacionOrderByWithRelationInput | CapacitacionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Capacitacions.
     */
    cursor?: CapacitacionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Capacitacions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Capacitacions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Capacitacions.
     */
    distinct?: CapacitacionScalarFieldEnum | CapacitacionScalarFieldEnum[]
  }

  /**
   * Capacitacion findMany
   */
  export type CapacitacionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Capacitacion
     */
    select?: CapacitacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CapacitacionInclude<ExtArgs> | null
    /**
     * Filter, which Capacitacions to fetch.
     */
    where?: CapacitacionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Capacitacions to fetch.
     */
    orderBy?: CapacitacionOrderByWithRelationInput | CapacitacionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Capacitacions.
     */
    cursor?: CapacitacionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Capacitacions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Capacitacions.
     */
    skip?: number
    distinct?: CapacitacionScalarFieldEnum | CapacitacionScalarFieldEnum[]
  }

  /**
   * Capacitacion create
   */
  export type CapacitacionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Capacitacion
     */
    select?: CapacitacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CapacitacionInclude<ExtArgs> | null
    /**
     * The data needed to create a Capacitacion.
     */
    data: XOR<CapacitacionCreateInput, CapacitacionUncheckedCreateInput>
  }

  /**
   * Capacitacion createMany
   */
  export type CapacitacionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Capacitacions.
     */
    data: CapacitacionCreateManyInput | CapacitacionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Capacitacion createManyAndReturn
   */
  export type CapacitacionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Capacitacion
     */
    select?: CapacitacionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Capacitacions.
     */
    data: CapacitacionCreateManyInput | CapacitacionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Capacitacion update
   */
  export type CapacitacionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Capacitacion
     */
    select?: CapacitacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CapacitacionInclude<ExtArgs> | null
    /**
     * The data needed to update a Capacitacion.
     */
    data: XOR<CapacitacionUpdateInput, CapacitacionUncheckedUpdateInput>
    /**
     * Choose, which Capacitacion to update.
     */
    where: CapacitacionWhereUniqueInput
  }

  /**
   * Capacitacion updateMany
   */
  export type CapacitacionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Capacitacions.
     */
    data: XOR<CapacitacionUpdateManyMutationInput, CapacitacionUncheckedUpdateManyInput>
    /**
     * Filter which Capacitacions to update
     */
    where?: CapacitacionWhereInput
  }

  /**
   * Capacitacion upsert
   */
  export type CapacitacionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Capacitacion
     */
    select?: CapacitacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CapacitacionInclude<ExtArgs> | null
    /**
     * The filter to search for the Capacitacion to update in case it exists.
     */
    where: CapacitacionWhereUniqueInput
    /**
     * In case the Capacitacion found by the `where` argument doesn't exist, create a new Capacitacion with this data.
     */
    create: XOR<CapacitacionCreateInput, CapacitacionUncheckedCreateInput>
    /**
     * In case the Capacitacion was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CapacitacionUpdateInput, CapacitacionUncheckedUpdateInput>
  }

  /**
   * Capacitacion delete
   */
  export type CapacitacionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Capacitacion
     */
    select?: CapacitacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CapacitacionInclude<ExtArgs> | null
    /**
     * Filter which Capacitacion to delete.
     */
    where: CapacitacionWhereUniqueInput
  }

  /**
   * Capacitacion deleteMany
   */
  export type CapacitacionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Capacitacions to delete
     */
    where?: CapacitacionWhereInput
  }

  /**
   * Capacitacion.registros
   */
  export type Capacitacion$registrosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroCapacitacion
     */
    select?: RegistroCapacitacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroCapacitacionInclude<ExtArgs> | null
    where?: RegistroCapacitacionWhereInput
    orderBy?: RegistroCapacitacionOrderByWithRelationInput | RegistroCapacitacionOrderByWithRelationInput[]
    cursor?: RegistroCapacitacionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RegistroCapacitacionScalarFieldEnum | RegistroCapacitacionScalarFieldEnum[]
  }

  /**
   * Capacitacion without action
   */
  export type CapacitacionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Capacitacion
     */
    select?: CapacitacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CapacitacionInclude<ExtArgs> | null
  }


  /**
   * Model RegistroCapacitacion
   */

  export type AggregateRegistroCapacitacion = {
    _count: RegistroCapacitacionCountAggregateOutputType | null
    _avg: RegistroCapacitacionAvgAggregateOutputType | null
    _sum: RegistroCapacitacionSumAggregateOutputType | null
    _min: RegistroCapacitacionMinAggregateOutputType | null
    _max: RegistroCapacitacionMaxAggregateOutputType | null
  }

  export type RegistroCapacitacionAvgAggregateOutputType = {
    calificacion: Decimal | null
  }

  export type RegistroCapacitacionSumAggregateOutputType = {
    calificacion: Decimal | null
  }

  export type RegistroCapacitacionMinAggregateOutputType = {
    id_registro: string | null
    tenant_id: string | null
    proyecto_id: string | null
    capacitacion_id: string | null
    empleado_id: string | null
    empleado_nombre: string | null
    asistio: boolean | null
    calificacion: Decimal | null
    aprobado: boolean | null
    observaciones: string | null
  }

  export type RegistroCapacitacionMaxAggregateOutputType = {
    id_registro: string | null
    tenant_id: string | null
    proyecto_id: string | null
    capacitacion_id: string | null
    empleado_id: string | null
    empleado_nombre: string | null
    asistio: boolean | null
    calificacion: Decimal | null
    aprobado: boolean | null
    observaciones: string | null
  }

  export type RegistroCapacitacionCountAggregateOutputType = {
    id_registro: number
    tenant_id: number
    proyecto_id: number
    capacitacion_id: number
    empleado_id: number
    empleado_nombre: number
    asistio: number
    calificacion: number
    aprobado: number
    observaciones: number
    _all: number
  }


  export type RegistroCapacitacionAvgAggregateInputType = {
    calificacion?: true
  }

  export type RegistroCapacitacionSumAggregateInputType = {
    calificacion?: true
  }

  export type RegistroCapacitacionMinAggregateInputType = {
    id_registro?: true
    tenant_id?: true
    proyecto_id?: true
    capacitacion_id?: true
    empleado_id?: true
    empleado_nombre?: true
    asistio?: true
    calificacion?: true
    aprobado?: true
    observaciones?: true
  }

  export type RegistroCapacitacionMaxAggregateInputType = {
    id_registro?: true
    tenant_id?: true
    proyecto_id?: true
    capacitacion_id?: true
    empleado_id?: true
    empleado_nombre?: true
    asistio?: true
    calificacion?: true
    aprobado?: true
    observaciones?: true
  }

  export type RegistroCapacitacionCountAggregateInputType = {
    id_registro?: true
    tenant_id?: true
    proyecto_id?: true
    capacitacion_id?: true
    empleado_id?: true
    empleado_nombre?: true
    asistio?: true
    calificacion?: true
    aprobado?: true
    observaciones?: true
    _all?: true
  }

  export type RegistroCapacitacionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RegistroCapacitacion to aggregate.
     */
    where?: RegistroCapacitacionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RegistroCapacitacions to fetch.
     */
    orderBy?: RegistroCapacitacionOrderByWithRelationInput | RegistroCapacitacionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RegistroCapacitacionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RegistroCapacitacions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RegistroCapacitacions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned RegistroCapacitacions
    **/
    _count?: true | RegistroCapacitacionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RegistroCapacitacionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RegistroCapacitacionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RegistroCapacitacionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RegistroCapacitacionMaxAggregateInputType
  }

  export type GetRegistroCapacitacionAggregateType<T extends RegistroCapacitacionAggregateArgs> = {
        [P in keyof T & keyof AggregateRegistroCapacitacion]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRegistroCapacitacion[P]>
      : GetScalarType<T[P], AggregateRegistroCapacitacion[P]>
  }




  export type RegistroCapacitacionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RegistroCapacitacionWhereInput
    orderBy?: RegistroCapacitacionOrderByWithAggregationInput | RegistroCapacitacionOrderByWithAggregationInput[]
    by: RegistroCapacitacionScalarFieldEnum[] | RegistroCapacitacionScalarFieldEnum
    having?: RegistroCapacitacionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RegistroCapacitacionCountAggregateInputType | true
    _avg?: RegistroCapacitacionAvgAggregateInputType
    _sum?: RegistroCapacitacionSumAggregateInputType
    _min?: RegistroCapacitacionMinAggregateInputType
    _max?: RegistroCapacitacionMaxAggregateInputType
  }

  export type RegistroCapacitacionGroupByOutputType = {
    id_registro: string
    tenant_id: string
    proyecto_id: string
    capacitacion_id: string
    empleado_id: string
    empleado_nombre: string
    asistio: boolean
    calificacion: Decimal | null
    aprobado: boolean
    observaciones: string | null
    _count: RegistroCapacitacionCountAggregateOutputType | null
    _avg: RegistroCapacitacionAvgAggregateOutputType | null
    _sum: RegistroCapacitacionSumAggregateOutputType | null
    _min: RegistroCapacitacionMinAggregateOutputType | null
    _max: RegistroCapacitacionMaxAggregateOutputType | null
  }

  type GetRegistroCapacitacionGroupByPayload<T extends RegistroCapacitacionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RegistroCapacitacionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RegistroCapacitacionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RegistroCapacitacionGroupByOutputType[P]>
            : GetScalarType<T[P], RegistroCapacitacionGroupByOutputType[P]>
        }
      >
    >


  export type RegistroCapacitacionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_registro?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    capacitacion_id?: boolean
    empleado_id?: boolean
    empleado_nombre?: boolean
    asistio?: boolean
    calificacion?: boolean
    aprobado?: boolean
    observaciones?: boolean
    capacitacion?: boolean | CapacitacionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["registroCapacitacion"]>

  export type RegistroCapacitacionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_registro?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    capacitacion_id?: boolean
    empleado_id?: boolean
    empleado_nombre?: boolean
    asistio?: boolean
    calificacion?: boolean
    aprobado?: boolean
    observaciones?: boolean
    capacitacion?: boolean | CapacitacionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["registroCapacitacion"]>

  export type RegistroCapacitacionSelectScalar = {
    id_registro?: boolean
    tenant_id?: boolean
    proyecto_id?: boolean
    capacitacion_id?: boolean
    empleado_id?: boolean
    empleado_nombre?: boolean
    asistio?: boolean
    calificacion?: boolean
    aprobado?: boolean
    observaciones?: boolean
  }

  export type RegistroCapacitacionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    capacitacion?: boolean | CapacitacionDefaultArgs<ExtArgs>
  }
  export type RegistroCapacitacionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    capacitacion?: boolean | CapacitacionDefaultArgs<ExtArgs>
  }

  export type $RegistroCapacitacionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "RegistroCapacitacion"
    objects: {
      capacitacion: Prisma.$CapacitacionPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id_registro: string
      tenant_id: string
      proyecto_id: string
      capacitacion_id: string
      empleado_id: string
      empleado_nombre: string
      asistio: boolean
      calificacion: Prisma.Decimal | null
      aprobado: boolean
      observaciones: string | null
    }, ExtArgs["result"]["registroCapacitacion"]>
    composites: {}
  }

  type RegistroCapacitacionGetPayload<S extends boolean | null | undefined | RegistroCapacitacionDefaultArgs> = $Result.GetResult<Prisma.$RegistroCapacitacionPayload, S>

  type RegistroCapacitacionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<RegistroCapacitacionFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: RegistroCapacitacionCountAggregateInputType | true
    }

  export interface RegistroCapacitacionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['RegistroCapacitacion'], meta: { name: 'RegistroCapacitacion' } }
    /**
     * Find zero or one RegistroCapacitacion that matches the filter.
     * @param {RegistroCapacitacionFindUniqueArgs} args - Arguments to find a RegistroCapacitacion
     * @example
     * // Get one RegistroCapacitacion
     * const registroCapacitacion = await prisma.registroCapacitacion.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RegistroCapacitacionFindUniqueArgs>(args: SelectSubset<T, RegistroCapacitacionFindUniqueArgs<ExtArgs>>): Prisma__RegistroCapacitacionClient<$Result.GetResult<Prisma.$RegistroCapacitacionPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one RegistroCapacitacion that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {RegistroCapacitacionFindUniqueOrThrowArgs} args - Arguments to find a RegistroCapacitacion
     * @example
     * // Get one RegistroCapacitacion
     * const registroCapacitacion = await prisma.registroCapacitacion.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RegistroCapacitacionFindUniqueOrThrowArgs>(args: SelectSubset<T, RegistroCapacitacionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RegistroCapacitacionClient<$Result.GetResult<Prisma.$RegistroCapacitacionPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first RegistroCapacitacion that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RegistroCapacitacionFindFirstArgs} args - Arguments to find a RegistroCapacitacion
     * @example
     * // Get one RegistroCapacitacion
     * const registroCapacitacion = await prisma.registroCapacitacion.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RegistroCapacitacionFindFirstArgs>(args?: SelectSubset<T, RegistroCapacitacionFindFirstArgs<ExtArgs>>): Prisma__RegistroCapacitacionClient<$Result.GetResult<Prisma.$RegistroCapacitacionPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first RegistroCapacitacion that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RegistroCapacitacionFindFirstOrThrowArgs} args - Arguments to find a RegistroCapacitacion
     * @example
     * // Get one RegistroCapacitacion
     * const registroCapacitacion = await prisma.registroCapacitacion.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RegistroCapacitacionFindFirstOrThrowArgs>(args?: SelectSubset<T, RegistroCapacitacionFindFirstOrThrowArgs<ExtArgs>>): Prisma__RegistroCapacitacionClient<$Result.GetResult<Prisma.$RegistroCapacitacionPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more RegistroCapacitacions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RegistroCapacitacionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RegistroCapacitacions
     * const registroCapacitacions = await prisma.registroCapacitacion.findMany()
     * 
     * // Get first 10 RegistroCapacitacions
     * const registroCapacitacions = await prisma.registroCapacitacion.findMany({ take: 10 })
     * 
     * // Only select the `id_registro`
     * const registroCapacitacionWithId_registroOnly = await prisma.registroCapacitacion.findMany({ select: { id_registro: true } })
     * 
     */
    findMany<T extends RegistroCapacitacionFindManyArgs>(args?: SelectSubset<T, RegistroCapacitacionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RegistroCapacitacionPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a RegistroCapacitacion.
     * @param {RegistroCapacitacionCreateArgs} args - Arguments to create a RegistroCapacitacion.
     * @example
     * // Create one RegistroCapacitacion
     * const RegistroCapacitacion = await prisma.registroCapacitacion.create({
     *   data: {
     *     // ... data to create a RegistroCapacitacion
     *   }
     * })
     * 
     */
    create<T extends RegistroCapacitacionCreateArgs>(args: SelectSubset<T, RegistroCapacitacionCreateArgs<ExtArgs>>): Prisma__RegistroCapacitacionClient<$Result.GetResult<Prisma.$RegistroCapacitacionPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many RegistroCapacitacions.
     * @param {RegistroCapacitacionCreateManyArgs} args - Arguments to create many RegistroCapacitacions.
     * @example
     * // Create many RegistroCapacitacions
     * const registroCapacitacion = await prisma.registroCapacitacion.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RegistroCapacitacionCreateManyArgs>(args?: SelectSubset<T, RegistroCapacitacionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many RegistroCapacitacions and returns the data saved in the database.
     * @param {RegistroCapacitacionCreateManyAndReturnArgs} args - Arguments to create many RegistroCapacitacions.
     * @example
     * // Create many RegistroCapacitacions
     * const registroCapacitacion = await prisma.registroCapacitacion.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many RegistroCapacitacions and only return the `id_registro`
     * const registroCapacitacionWithId_registroOnly = await prisma.registroCapacitacion.createManyAndReturn({ 
     *   select: { id_registro: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RegistroCapacitacionCreateManyAndReturnArgs>(args?: SelectSubset<T, RegistroCapacitacionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RegistroCapacitacionPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a RegistroCapacitacion.
     * @param {RegistroCapacitacionDeleteArgs} args - Arguments to delete one RegistroCapacitacion.
     * @example
     * // Delete one RegistroCapacitacion
     * const RegistroCapacitacion = await prisma.registroCapacitacion.delete({
     *   where: {
     *     // ... filter to delete one RegistroCapacitacion
     *   }
     * })
     * 
     */
    delete<T extends RegistroCapacitacionDeleteArgs>(args: SelectSubset<T, RegistroCapacitacionDeleteArgs<ExtArgs>>): Prisma__RegistroCapacitacionClient<$Result.GetResult<Prisma.$RegistroCapacitacionPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one RegistroCapacitacion.
     * @param {RegistroCapacitacionUpdateArgs} args - Arguments to update one RegistroCapacitacion.
     * @example
     * // Update one RegistroCapacitacion
     * const registroCapacitacion = await prisma.registroCapacitacion.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RegistroCapacitacionUpdateArgs>(args: SelectSubset<T, RegistroCapacitacionUpdateArgs<ExtArgs>>): Prisma__RegistroCapacitacionClient<$Result.GetResult<Prisma.$RegistroCapacitacionPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more RegistroCapacitacions.
     * @param {RegistroCapacitacionDeleteManyArgs} args - Arguments to filter RegistroCapacitacions to delete.
     * @example
     * // Delete a few RegistroCapacitacions
     * const { count } = await prisma.registroCapacitacion.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RegistroCapacitacionDeleteManyArgs>(args?: SelectSubset<T, RegistroCapacitacionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RegistroCapacitacions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RegistroCapacitacionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RegistroCapacitacions
     * const registroCapacitacion = await prisma.registroCapacitacion.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RegistroCapacitacionUpdateManyArgs>(args: SelectSubset<T, RegistroCapacitacionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one RegistroCapacitacion.
     * @param {RegistroCapacitacionUpsertArgs} args - Arguments to update or create a RegistroCapacitacion.
     * @example
     * // Update or create a RegistroCapacitacion
     * const registroCapacitacion = await prisma.registroCapacitacion.upsert({
     *   create: {
     *     // ... data to create a RegistroCapacitacion
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RegistroCapacitacion we want to update
     *   }
     * })
     */
    upsert<T extends RegistroCapacitacionUpsertArgs>(args: SelectSubset<T, RegistroCapacitacionUpsertArgs<ExtArgs>>): Prisma__RegistroCapacitacionClient<$Result.GetResult<Prisma.$RegistroCapacitacionPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of RegistroCapacitacions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RegistroCapacitacionCountArgs} args - Arguments to filter RegistroCapacitacions to count.
     * @example
     * // Count the number of RegistroCapacitacions
     * const count = await prisma.registroCapacitacion.count({
     *   where: {
     *     // ... the filter for the RegistroCapacitacions we want to count
     *   }
     * })
    **/
    count<T extends RegistroCapacitacionCountArgs>(
      args?: Subset<T, RegistroCapacitacionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RegistroCapacitacionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a RegistroCapacitacion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RegistroCapacitacionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends RegistroCapacitacionAggregateArgs>(args: Subset<T, RegistroCapacitacionAggregateArgs>): Prisma.PrismaPromise<GetRegistroCapacitacionAggregateType<T>>

    /**
     * Group by RegistroCapacitacion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RegistroCapacitacionGroupByArgs} args - Group by arguments.
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
      T extends RegistroCapacitacionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RegistroCapacitacionGroupByArgs['orderBy'] }
        : { orderBy?: RegistroCapacitacionGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, RegistroCapacitacionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRegistroCapacitacionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the RegistroCapacitacion model
   */
  readonly fields: RegistroCapacitacionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for RegistroCapacitacion.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RegistroCapacitacionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    capacitacion<T extends CapacitacionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CapacitacionDefaultArgs<ExtArgs>>): Prisma__CapacitacionClient<$Result.GetResult<Prisma.$CapacitacionPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
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
   * Fields of the RegistroCapacitacion model
   */ 
  interface RegistroCapacitacionFieldRefs {
    readonly id_registro: FieldRef<"RegistroCapacitacion", 'String'>
    readonly tenant_id: FieldRef<"RegistroCapacitacion", 'String'>
    readonly proyecto_id: FieldRef<"RegistroCapacitacion", 'String'>
    readonly capacitacion_id: FieldRef<"RegistroCapacitacion", 'String'>
    readonly empleado_id: FieldRef<"RegistroCapacitacion", 'String'>
    readonly empleado_nombre: FieldRef<"RegistroCapacitacion", 'String'>
    readonly asistio: FieldRef<"RegistroCapacitacion", 'Boolean'>
    readonly calificacion: FieldRef<"RegistroCapacitacion", 'Decimal'>
    readonly aprobado: FieldRef<"RegistroCapacitacion", 'Boolean'>
    readonly observaciones: FieldRef<"RegistroCapacitacion", 'String'>
  }
    

  // Custom InputTypes
  /**
   * RegistroCapacitacion findUnique
   */
  export type RegistroCapacitacionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroCapacitacion
     */
    select?: RegistroCapacitacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroCapacitacionInclude<ExtArgs> | null
    /**
     * Filter, which RegistroCapacitacion to fetch.
     */
    where: RegistroCapacitacionWhereUniqueInput
  }

  /**
   * RegistroCapacitacion findUniqueOrThrow
   */
  export type RegistroCapacitacionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroCapacitacion
     */
    select?: RegistroCapacitacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroCapacitacionInclude<ExtArgs> | null
    /**
     * Filter, which RegistroCapacitacion to fetch.
     */
    where: RegistroCapacitacionWhereUniqueInput
  }

  /**
   * RegistroCapacitacion findFirst
   */
  export type RegistroCapacitacionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroCapacitacion
     */
    select?: RegistroCapacitacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroCapacitacionInclude<ExtArgs> | null
    /**
     * Filter, which RegistroCapacitacion to fetch.
     */
    where?: RegistroCapacitacionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RegistroCapacitacions to fetch.
     */
    orderBy?: RegistroCapacitacionOrderByWithRelationInput | RegistroCapacitacionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RegistroCapacitacions.
     */
    cursor?: RegistroCapacitacionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RegistroCapacitacions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RegistroCapacitacions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RegistroCapacitacions.
     */
    distinct?: RegistroCapacitacionScalarFieldEnum | RegistroCapacitacionScalarFieldEnum[]
  }

  /**
   * RegistroCapacitacion findFirstOrThrow
   */
  export type RegistroCapacitacionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroCapacitacion
     */
    select?: RegistroCapacitacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroCapacitacionInclude<ExtArgs> | null
    /**
     * Filter, which RegistroCapacitacion to fetch.
     */
    where?: RegistroCapacitacionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RegistroCapacitacions to fetch.
     */
    orderBy?: RegistroCapacitacionOrderByWithRelationInput | RegistroCapacitacionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RegistroCapacitacions.
     */
    cursor?: RegistroCapacitacionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RegistroCapacitacions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RegistroCapacitacions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RegistroCapacitacions.
     */
    distinct?: RegistroCapacitacionScalarFieldEnum | RegistroCapacitacionScalarFieldEnum[]
  }

  /**
   * RegistroCapacitacion findMany
   */
  export type RegistroCapacitacionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroCapacitacion
     */
    select?: RegistroCapacitacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroCapacitacionInclude<ExtArgs> | null
    /**
     * Filter, which RegistroCapacitacions to fetch.
     */
    where?: RegistroCapacitacionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RegistroCapacitacions to fetch.
     */
    orderBy?: RegistroCapacitacionOrderByWithRelationInput | RegistroCapacitacionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing RegistroCapacitacions.
     */
    cursor?: RegistroCapacitacionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RegistroCapacitacions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RegistroCapacitacions.
     */
    skip?: number
    distinct?: RegistroCapacitacionScalarFieldEnum | RegistroCapacitacionScalarFieldEnum[]
  }

  /**
   * RegistroCapacitacion create
   */
  export type RegistroCapacitacionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroCapacitacion
     */
    select?: RegistroCapacitacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroCapacitacionInclude<ExtArgs> | null
    /**
     * The data needed to create a RegistroCapacitacion.
     */
    data: XOR<RegistroCapacitacionCreateInput, RegistroCapacitacionUncheckedCreateInput>
  }

  /**
   * RegistroCapacitacion createMany
   */
  export type RegistroCapacitacionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many RegistroCapacitacions.
     */
    data: RegistroCapacitacionCreateManyInput | RegistroCapacitacionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RegistroCapacitacion createManyAndReturn
   */
  export type RegistroCapacitacionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroCapacitacion
     */
    select?: RegistroCapacitacionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many RegistroCapacitacions.
     */
    data: RegistroCapacitacionCreateManyInput | RegistroCapacitacionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroCapacitacionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * RegistroCapacitacion update
   */
  export type RegistroCapacitacionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroCapacitacion
     */
    select?: RegistroCapacitacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroCapacitacionInclude<ExtArgs> | null
    /**
     * The data needed to update a RegistroCapacitacion.
     */
    data: XOR<RegistroCapacitacionUpdateInput, RegistroCapacitacionUncheckedUpdateInput>
    /**
     * Choose, which RegistroCapacitacion to update.
     */
    where: RegistroCapacitacionWhereUniqueInput
  }

  /**
   * RegistroCapacitacion updateMany
   */
  export type RegistroCapacitacionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update RegistroCapacitacions.
     */
    data: XOR<RegistroCapacitacionUpdateManyMutationInput, RegistroCapacitacionUncheckedUpdateManyInput>
    /**
     * Filter which RegistroCapacitacions to update
     */
    where?: RegistroCapacitacionWhereInput
  }

  /**
   * RegistroCapacitacion upsert
   */
  export type RegistroCapacitacionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroCapacitacion
     */
    select?: RegistroCapacitacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroCapacitacionInclude<ExtArgs> | null
    /**
     * The filter to search for the RegistroCapacitacion to update in case it exists.
     */
    where: RegistroCapacitacionWhereUniqueInput
    /**
     * In case the RegistroCapacitacion found by the `where` argument doesn't exist, create a new RegistroCapacitacion with this data.
     */
    create: XOR<RegistroCapacitacionCreateInput, RegistroCapacitacionUncheckedCreateInput>
    /**
     * In case the RegistroCapacitacion was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RegistroCapacitacionUpdateInput, RegistroCapacitacionUncheckedUpdateInput>
  }

  /**
   * RegistroCapacitacion delete
   */
  export type RegistroCapacitacionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroCapacitacion
     */
    select?: RegistroCapacitacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroCapacitacionInclude<ExtArgs> | null
    /**
     * Filter which RegistroCapacitacion to delete.
     */
    where: RegistroCapacitacionWhereUniqueInput
  }

  /**
   * RegistroCapacitacion deleteMany
   */
  export type RegistroCapacitacionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RegistroCapacitacions to delete
     */
    where?: RegistroCapacitacionWhereInput
  }

  /**
   * RegistroCapacitacion without action
   */
  export type RegistroCapacitacionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroCapacitacion
     */
    select?: RegistroCapacitacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroCapacitacionInclude<ExtArgs> | null
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


  export const IncidenteScalarFieldEnum: {
    id_incidente: 'id_incidente',
    tenant_id: 'tenant_id',
    proyecto_id: 'proyecto_id',
    codigo: 'codigo',
    tipo: 'tipo',
    severidad: 'severidad',
    fecha_incidente: 'fecha_incidente',
    hora_incidente: 'hora_incidente',
    ubicacion: 'ubicacion',
    descripcion: 'descripcion',
    empleado_afectado_id: 'empleado_afectado_id',
    empleado_afectado_nombre: 'empleado_afectado_nombre',
    testigos: 'testigos',
    causa_raiz: 'causa_raiz',
    accion_correctiva: 'accion_correctiva',
    accion_preventiva: 'accion_preventiva',
    dias_incapacidad: 'dias_incapacidad',
    requirio_atencion_medica: 'requirio_atencion_medica',
    reportado_stps: 'reportado_stps',
    estado: 'estado',
    reportado_por: 'reportado_por',
    cerrado_por: 'cerrado_por',
    fecha_cierre: 'fecha_cierre',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type IncidenteScalarFieldEnum = (typeof IncidenteScalarFieldEnum)[keyof typeof IncidenteScalarFieldEnum]


  export const InspeccionSeguridadScalarFieldEnum: {
    id_inspeccion: 'id_inspeccion',
    tenant_id: 'tenant_id',
    proyecto_id: 'proyecto_id',
    codigo: 'codigo',
    tipo_inspeccion: 'tipo_inspeccion',
    fecha_inspeccion: 'fecha_inspeccion',
    area_inspeccionada: 'area_inspeccionada',
    items_revisados: 'items_revisados',
    items_conformes: 'items_conformes',
    items_no_conformes: 'items_no_conformes',
    porcentaje_cumplimiento: 'porcentaje_cumplimiento',
    resultado: 'resultado',
    observaciones: 'observaciones',
    hallazgos: 'hallazgos',
    evidencia_fotos: 'evidencia_fotos',
    inspector_id: 'inspector_id',
    inspector_nombre: 'inspector_nombre',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type InspeccionSeguridadScalarFieldEnum = (typeof InspeccionSeguridadScalarFieldEnum)[keyof typeof InspeccionSeguridadScalarFieldEnum]


  export const PermisoTrabajoScalarFieldEnum: {
    id_permiso: 'id_permiso',
    tenant_id: 'tenant_id',
    proyecto_id: 'proyecto_id',
    codigo: 'codigo',
    tipo_permiso: 'tipo_permiso',
    area_trabajo: 'area_trabajo',
    descripcion_trabajo: 'descripcion_trabajo',
    fecha_inicio: 'fecha_inicio',
    fecha_fin: 'fecha_fin',
    estado: 'estado',
    epp_requerido: 'epp_requerido',
    medidas_control: 'medidas_control',
    checklist_previo: 'checklist_previo',
    solicitado_por: 'solicitado_por',
    solicitante_nombre: 'solicitante_nombre',
    autorizado_por: 'autorizado_por',
    autorizador_nombre: 'autorizador_nombre',
    trabajadores: 'trabajadores',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type PermisoTrabajoScalarFieldEnum = (typeof PermisoTrabajoScalarFieldEnum)[keyof typeof PermisoTrabajoScalarFieldEnum]


  export const CapacitacionScalarFieldEnum: {
    id_capacitacion: 'id_capacitacion',
    tenant_id: 'tenant_id',
    proyecto_id: 'proyecto_id',
    codigo: 'codigo',
    titulo: 'titulo',
    tipo: 'tipo',
    instructor: 'instructor',
    fecha: 'fecha',
    duracion_horas: 'duracion_horas',
    ubicacion: 'ubicacion',
    contenido: 'contenido',
    validez_meses: 'validez_meses',
    estado: 'estado',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type CapacitacionScalarFieldEnum = (typeof CapacitacionScalarFieldEnum)[keyof typeof CapacitacionScalarFieldEnum]


  export const RegistroCapacitacionScalarFieldEnum: {
    id_registro: 'id_registro',
    tenant_id: 'tenant_id',
    proyecto_id: 'proyecto_id',
    capacitacion_id: 'capacitacion_id',
    empleado_id: 'empleado_id',
    empleado_nombre: 'empleado_nombre',
    asistio: 'asistio',
    calificacion: 'calificacion',
    aprobado: 'aprobado',
    observaciones: 'observaciones'
  };

  export type RegistroCapacitacionScalarFieldEnum = (typeof RegistroCapacitacionScalarFieldEnum)[keyof typeof RegistroCapacitacionScalarFieldEnum]


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
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


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


  export type IncidenteWhereInput = {
    AND?: IncidenteWhereInput | IncidenteWhereInput[]
    OR?: IncidenteWhereInput[]
    NOT?: IncidenteWhereInput | IncidenteWhereInput[]
    id_incidente?: UuidFilter<"Incidente"> | string
    tenant_id?: UuidFilter<"Incidente"> | string
    proyecto_id?: UuidFilter<"Incidente"> | string
    codigo?: StringFilter<"Incidente"> | string
    tipo?: StringFilter<"Incidente"> | string
    severidad?: StringFilter<"Incidente"> | string
    fecha_incidente?: DateTimeFilter<"Incidente"> | Date | string
    hora_incidente?: StringNullableFilter<"Incidente"> | string | null
    ubicacion?: StringFilter<"Incidente"> | string
    descripcion?: StringFilter<"Incidente"> | string
    empleado_afectado_id?: UuidNullableFilter<"Incidente"> | string | null
    empleado_afectado_nombre?: StringNullableFilter<"Incidente"> | string | null
    testigos?: StringNullableFilter<"Incidente"> | string | null
    causa_raiz?: StringNullableFilter<"Incidente"> | string | null
    accion_correctiva?: StringNullableFilter<"Incidente"> | string | null
    accion_preventiva?: StringNullableFilter<"Incidente"> | string | null
    dias_incapacidad?: IntFilter<"Incidente"> | number
    requirio_atencion_medica?: BoolFilter<"Incidente"> | boolean
    reportado_stps?: BoolFilter<"Incidente"> | boolean
    estado?: StringFilter<"Incidente"> | string
    reportado_por?: UuidFilter<"Incidente"> | string
    cerrado_por?: UuidNullableFilter<"Incidente"> | string | null
    fecha_cierre?: DateTimeNullableFilter<"Incidente"> | Date | string | null
    created_at?: DateTimeFilter<"Incidente"> | Date | string
    updated_at?: DateTimeFilter<"Incidente"> | Date | string
  }

  export type IncidenteOrderByWithRelationInput = {
    id_incidente?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    codigo?: SortOrder
    tipo?: SortOrder
    severidad?: SortOrder
    fecha_incidente?: SortOrder
    hora_incidente?: SortOrderInput | SortOrder
    ubicacion?: SortOrder
    descripcion?: SortOrder
    empleado_afectado_id?: SortOrderInput | SortOrder
    empleado_afectado_nombre?: SortOrderInput | SortOrder
    testigos?: SortOrderInput | SortOrder
    causa_raiz?: SortOrderInput | SortOrder
    accion_correctiva?: SortOrderInput | SortOrder
    accion_preventiva?: SortOrderInput | SortOrder
    dias_incapacidad?: SortOrder
    requirio_atencion_medica?: SortOrder
    reportado_stps?: SortOrder
    estado?: SortOrder
    reportado_por?: SortOrder
    cerrado_por?: SortOrderInput | SortOrder
    fecha_cierre?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type IncidenteWhereUniqueInput = Prisma.AtLeast<{
    id_incidente?: string
    tenant_id_codigo?: IncidenteTenant_idCodigoCompoundUniqueInput
    AND?: IncidenteWhereInput | IncidenteWhereInput[]
    OR?: IncidenteWhereInput[]
    NOT?: IncidenteWhereInput | IncidenteWhereInput[]
    tenant_id?: UuidFilter<"Incidente"> | string
    proyecto_id?: UuidFilter<"Incidente"> | string
    codigo?: StringFilter<"Incidente"> | string
    tipo?: StringFilter<"Incidente"> | string
    severidad?: StringFilter<"Incidente"> | string
    fecha_incidente?: DateTimeFilter<"Incidente"> | Date | string
    hora_incidente?: StringNullableFilter<"Incidente"> | string | null
    ubicacion?: StringFilter<"Incidente"> | string
    descripcion?: StringFilter<"Incidente"> | string
    empleado_afectado_id?: UuidNullableFilter<"Incidente"> | string | null
    empleado_afectado_nombre?: StringNullableFilter<"Incidente"> | string | null
    testigos?: StringNullableFilter<"Incidente"> | string | null
    causa_raiz?: StringNullableFilter<"Incidente"> | string | null
    accion_correctiva?: StringNullableFilter<"Incidente"> | string | null
    accion_preventiva?: StringNullableFilter<"Incidente"> | string | null
    dias_incapacidad?: IntFilter<"Incidente"> | number
    requirio_atencion_medica?: BoolFilter<"Incidente"> | boolean
    reportado_stps?: BoolFilter<"Incidente"> | boolean
    estado?: StringFilter<"Incidente"> | string
    reportado_por?: UuidFilter<"Incidente"> | string
    cerrado_por?: UuidNullableFilter<"Incidente"> | string | null
    fecha_cierre?: DateTimeNullableFilter<"Incidente"> | Date | string | null
    created_at?: DateTimeFilter<"Incidente"> | Date | string
    updated_at?: DateTimeFilter<"Incidente"> | Date | string
  }, "id_incidente" | "tenant_id_codigo">

  export type IncidenteOrderByWithAggregationInput = {
    id_incidente?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    codigo?: SortOrder
    tipo?: SortOrder
    severidad?: SortOrder
    fecha_incidente?: SortOrder
    hora_incidente?: SortOrderInput | SortOrder
    ubicacion?: SortOrder
    descripcion?: SortOrder
    empleado_afectado_id?: SortOrderInput | SortOrder
    empleado_afectado_nombre?: SortOrderInput | SortOrder
    testigos?: SortOrderInput | SortOrder
    causa_raiz?: SortOrderInput | SortOrder
    accion_correctiva?: SortOrderInput | SortOrder
    accion_preventiva?: SortOrderInput | SortOrder
    dias_incapacidad?: SortOrder
    requirio_atencion_medica?: SortOrder
    reportado_stps?: SortOrder
    estado?: SortOrder
    reportado_por?: SortOrder
    cerrado_por?: SortOrderInput | SortOrder
    fecha_cierre?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: IncidenteCountOrderByAggregateInput
    _avg?: IncidenteAvgOrderByAggregateInput
    _max?: IncidenteMaxOrderByAggregateInput
    _min?: IncidenteMinOrderByAggregateInput
    _sum?: IncidenteSumOrderByAggregateInput
  }

  export type IncidenteScalarWhereWithAggregatesInput = {
    AND?: IncidenteScalarWhereWithAggregatesInput | IncidenteScalarWhereWithAggregatesInput[]
    OR?: IncidenteScalarWhereWithAggregatesInput[]
    NOT?: IncidenteScalarWhereWithAggregatesInput | IncidenteScalarWhereWithAggregatesInput[]
    id_incidente?: UuidWithAggregatesFilter<"Incidente"> | string
    tenant_id?: UuidWithAggregatesFilter<"Incidente"> | string
    proyecto_id?: UuidWithAggregatesFilter<"Incidente"> | string
    codigo?: StringWithAggregatesFilter<"Incidente"> | string
    tipo?: StringWithAggregatesFilter<"Incidente"> | string
    severidad?: StringWithAggregatesFilter<"Incidente"> | string
    fecha_incidente?: DateTimeWithAggregatesFilter<"Incidente"> | Date | string
    hora_incidente?: StringNullableWithAggregatesFilter<"Incidente"> | string | null
    ubicacion?: StringWithAggregatesFilter<"Incidente"> | string
    descripcion?: StringWithAggregatesFilter<"Incidente"> | string
    empleado_afectado_id?: UuidNullableWithAggregatesFilter<"Incidente"> | string | null
    empleado_afectado_nombre?: StringNullableWithAggregatesFilter<"Incidente"> | string | null
    testigos?: StringNullableWithAggregatesFilter<"Incidente"> | string | null
    causa_raiz?: StringNullableWithAggregatesFilter<"Incidente"> | string | null
    accion_correctiva?: StringNullableWithAggregatesFilter<"Incidente"> | string | null
    accion_preventiva?: StringNullableWithAggregatesFilter<"Incidente"> | string | null
    dias_incapacidad?: IntWithAggregatesFilter<"Incidente"> | number
    requirio_atencion_medica?: BoolWithAggregatesFilter<"Incidente"> | boolean
    reportado_stps?: BoolWithAggregatesFilter<"Incidente"> | boolean
    estado?: StringWithAggregatesFilter<"Incidente"> | string
    reportado_por?: UuidWithAggregatesFilter<"Incidente"> | string
    cerrado_por?: UuidNullableWithAggregatesFilter<"Incidente"> | string | null
    fecha_cierre?: DateTimeNullableWithAggregatesFilter<"Incidente"> | Date | string | null
    created_at?: DateTimeWithAggregatesFilter<"Incidente"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"Incidente"> | Date | string
  }

  export type InspeccionSeguridadWhereInput = {
    AND?: InspeccionSeguridadWhereInput | InspeccionSeguridadWhereInput[]
    OR?: InspeccionSeguridadWhereInput[]
    NOT?: InspeccionSeguridadWhereInput | InspeccionSeguridadWhereInput[]
    id_inspeccion?: UuidFilter<"InspeccionSeguridad"> | string
    tenant_id?: UuidFilter<"InspeccionSeguridad"> | string
    proyecto_id?: UuidFilter<"InspeccionSeguridad"> | string
    codigo?: StringFilter<"InspeccionSeguridad"> | string
    tipo_inspeccion?: StringFilter<"InspeccionSeguridad"> | string
    fecha_inspeccion?: DateTimeFilter<"InspeccionSeguridad"> | Date | string
    area_inspeccionada?: StringFilter<"InspeccionSeguridad"> | string
    items_revisados?: IntFilter<"InspeccionSeguridad"> | number
    items_conformes?: IntFilter<"InspeccionSeguridad"> | number
    items_no_conformes?: IntFilter<"InspeccionSeguridad"> | number
    porcentaje_cumplimiento?: DecimalFilter<"InspeccionSeguridad"> | Decimal | DecimalJsLike | number | string
    resultado?: StringFilter<"InspeccionSeguridad"> | string
    observaciones?: StringNullableFilter<"InspeccionSeguridad"> | string | null
    hallazgos?: StringNullableFilter<"InspeccionSeguridad"> | string | null
    evidencia_fotos?: StringNullableFilter<"InspeccionSeguridad"> | string | null
    inspector_id?: UuidFilter<"InspeccionSeguridad"> | string
    inspector_nombre?: StringFilter<"InspeccionSeguridad"> | string
    created_at?: DateTimeFilter<"InspeccionSeguridad"> | Date | string
    updated_at?: DateTimeFilter<"InspeccionSeguridad"> | Date | string
  }

  export type InspeccionSeguridadOrderByWithRelationInput = {
    id_inspeccion?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    codigo?: SortOrder
    tipo_inspeccion?: SortOrder
    fecha_inspeccion?: SortOrder
    area_inspeccionada?: SortOrder
    items_revisados?: SortOrder
    items_conformes?: SortOrder
    items_no_conformes?: SortOrder
    porcentaje_cumplimiento?: SortOrder
    resultado?: SortOrder
    observaciones?: SortOrderInput | SortOrder
    hallazgos?: SortOrderInput | SortOrder
    evidencia_fotos?: SortOrderInput | SortOrder
    inspector_id?: SortOrder
    inspector_nombre?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type InspeccionSeguridadWhereUniqueInput = Prisma.AtLeast<{
    id_inspeccion?: string
    tenant_id_codigo?: InspeccionSeguridadTenant_idCodigoCompoundUniqueInput
    AND?: InspeccionSeguridadWhereInput | InspeccionSeguridadWhereInput[]
    OR?: InspeccionSeguridadWhereInput[]
    NOT?: InspeccionSeguridadWhereInput | InspeccionSeguridadWhereInput[]
    tenant_id?: UuidFilter<"InspeccionSeguridad"> | string
    proyecto_id?: UuidFilter<"InspeccionSeguridad"> | string
    codigo?: StringFilter<"InspeccionSeguridad"> | string
    tipo_inspeccion?: StringFilter<"InspeccionSeguridad"> | string
    fecha_inspeccion?: DateTimeFilter<"InspeccionSeguridad"> | Date | string
    area_inspeccionada?: StringFilter<"InspeccionSeguridad"> | string
    items_revisados?: IntFilter<"InspeccionSeguridad"> | number
    items_conformes?: IntFilter<"InspeccionSeguridad"> | number
    items_no_conformes?: IntFilter<"InspeccionSeguridad"> | number
    porcentaje_cumplimiento?: DecimalFilter<"InspeccionSeguridad"> | Decimal | DecimalJsLike | number | string
    resultado?: StringFilter<"InspeccionSeguridad"> | string
    observaciones?: StringNullableFilter<"InspeccionSeguridad"> | string | null
    hallazgos?: StringNullableFilter<"InspeccionSeguridad"> | string | null
    evidencia_fotos?: StringNullableFilter<"InspeccionSeguridad"> | string | null
    inspector_id?: UuidFilter<"InspeccionSeguridad"> | string
    inspector_nombre?: StringFilter<"InspeccionSeguridad"> | string
    created_at?: DateTimeFilter<"InspeccionSeguridad"> | Date | string
    updated_at?: DateTimeFilter<"InspeccionSeguridad"> | Date | string
  }, "id_inspeccion" | "tenant_id_codigo">

  export type InspeccionSeguridadOrderByWithAggregationInput = {
    id_inspeccion?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    codigo?: SortOrder
    tipo_inspeccion?: SortOrder
    fecha_inspeccion?: SortOrder
    area_inspeccionada?: SortOrder
    items_revisados?: SortOrder
    items_conformes?: SortOrder
    items_no_conformes?: SortOrder
    porcentaje_cumplimiento?: SortOrder
    resultado?: SortOrder
    observaciones?: SortOrderInput | SortOrder
    hallazgos?: SortOrderInput | SortOrder
    evidencia_fotos?: SortOrderInput | SortOrder
    inspector_id?: SortOrder
    inspector_nombre?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: InspeccionSeguridadCountOrderByAggregateInput
    _avg?: InspeccionSeguridadAvgOrderByAggregateInput
    _max?: InspeccionSeguridadMaxOrderByAggregateInput
    _min?: InspeccionSeguridadMinOrderByAggregateInput
    _sum?: InspeccionSeguridadSumOrderByAggregateInput
  }

  export type InspeccionSeguridadScalarWhereWithAggregatesInput = {
    AND?: InspeccionSeguridadScalarWhereWithAggregatesInput | InspeccionSeguridadScalarWhereWithAggregatesInput[]
    OR?: InspeccionSeguridadScalarWhereWithAggregatesInput[]
    NOT?: InspeccionSeguridadScalarWhereWithAggregatesInput | InspeccionSeguridadScalarWhereWithAggregatesInput[]
    id_inspeccion?: UuidWithAggregatesFilter<"InspeccionSeguridad"> | string
    tenant_id?: UuidWithAggregatesFilter<"InspeccionSeguridad"> | string
    proyecto_id?: UuidWithAggregatesFilter<"InspeccionSeguridad"> | string
    codigo?: StringWithAggregatesFilter<"InspeccionSeguridad"> | string
    tipo_inspeccion?: StringWithAggregatesFilter<"InspeccionSeguridad"> | string
    fecha_inspeccion?: DateTimeWithAggregatesFilter<"InspeccionSeguridad"> | Date | string
    area_inspeccionada?: StringWithAggregatesFilter<"InspeccionSeguridad"> | string
    items_revisados?: IntWithAggregatesFilter<"InspeccionSeguridad"> | number
    items_conformes?: IntWithAggregatesFilter<"InspeccionSeguridad"> | number
    items_no_conformes?: IntWithAggregatesFilter<"InspeccionSeguridad"> | number
    porcentaje_cumplimiento?: DecimalWithAggregatesFilter<"InspeccionSeguridad"> | Decimal | DecimalJsLike | number | string
    resultado?: StringWithAggregatesFilter<"InspeccionSeguridad"> | string
    observaciones?: StringNullableWithAggregatesFilter<"InspeccionSeguridad"> | string | null
    hallazgos?: StringNullableWithAggregatesFilter<"InspeccionSeguridad"> | string | null
    evidencia_fotos?: StringNullableWithAggregatesFilter<"InspeccionSeguridad"> | string | null
    inspector_id?: UuidWithAggregatesFilter<"InspeccionSeguridad"> | string
    inspector_nombre?: StringWithAggregatesFilter<"InspeccionSeguridad"> | string
    created_at?: DateTimeWithAggregatesFilter<"InspeccionSeguridad"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"InspeccionSeguridad"> | Date | string
  }

  export type PermisoTrabajoWhereInput = {
    AND?: PermisoTrabajoWhereInput | PermisoTrabajoWhereInput[]
    OR?: PermisoTrabajoWhereInput[]
    NOT?: PermisoTrabajoWhereInput | PermisoTrabajoWhereInput[]
    id_permiso?: UuidFilter<"PermisoTrabajo"> | string
    tenant_id?: UuidFilter<"PermisoTrabajo"> | string
    proyecto_id?: UuidFilter<"PermisoTrabajo"> | string
    codigo?: StringFilter<"PermisoTrabajo"> | string
    tipo_permiso?: StringFilter<"PermisoTrabajo"> | string
    area_trabajo?: StringFilter<"PermisoTrabajo"> | string
    descripcion_trabajo?: StringFilter<"PermisoTrabajo"> | string
    fecha_inicio?: DateTimeFilter<"PermisoTrabajo"> | Date | string
    fecha_fin?: DateTimeFilter<"PermisoTrabajo"> | Date | string
    estado?: StringFilter<"PermisoTrabajo"> | string
    epp_requerido?: StringNullableFilter<"PermisoTrabajo"> | string | null
    medidas_control?: StringNullableFilter<"PermisoTrabajo"> | string | null
    checklist_previo?: BoolFilter<"PermisoTrabajo"> | boolean
    solicitado_por?: UuidFilter<"PermisoTrabajo"> | string
    solicitante_nombre?: StringFilter<"PermisoTrabajo"> | string
    autorizado_por?: UuidNullableFilter<"PermisoTrabajo"> | string | null
    autorizador_nombre?: StringNullableFilter<"PermisoTrabajo"> | string | null
    trabajadores?: StringNullableFilter<"PermisoTrabajo"> | string | null
    created_at?: DateTimeFilter<"PermisoTrabajo"> | Date | string
    updated_at?: DateTimeFilter<"PermisoTrabajo"> | Date | string
  }

  export type PermisoTrabajoOrderByWithRelationInput = {
    id_permiso?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    codigo?: SortOrder
    tipo_permiso?: SortOrder
    area_trabajo?: SortOrder
    descripcion_trabajo?: SortOrder
    fecha_inicio?: SortOrder
    fecha_fin?: SortOrder
    estado?: SortOrder
    epp_requerido?: SortOrderInput | SortOrder
    medidas_control?: SortOrderInput | SortOrder
    checklist_previo?: SortOrder
    solicitado_por?: SortOrder
    solicitante_nombre?: SortOrder
    autorizado_por?: SortOrderInput | SortOrder
    autorizador_nombre?: SortOrderInput | SortOrder
    trabajadores?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type PermisoTrabajoWhereUniqueInput = Prisma.AtLeast<{
    id_permiso?: string
    tenant_id_codigo?: PermisoTrabajoTenant_idCodigoCompoundUniqueInput
    AND?: PermisoTrabajoWhereInput | PermisoTrabajoWhereInput[]
    OR?: PermisoTrabajoWhereInput[]
    NOT?: PermisoTrabajoWhereInput | PermisoTrabajoWhereInput[]
    tenant_id?: UuidFilter<"PermisoTrabajo"> | string
    proyecto_id?: UuidFilter<"PermisoTrabajo"> | string
    codigo?: StringFilter<"PermisoTrabajo"> | string
    tipo_permiso?: StringFilter<"PermisoTrabajo"> | string
    area_trabajo?: StringFilter<"PermisoTrabajo"> | string
    descripcion_trabajo?: StringFilter<"PermisoTrabajo"> | string
    fecha_inicio?: DateTimeFilter<"PermisoTrabajo"> | Date | string
    fecha_fin?: DateTimeFilter<"PermisoTrabajo"> | Date | string
    estado?: StringFilter<"PermisoTrabajo"> | string
    epp_requerido?: StringNullableFilter<"PermisoTrabajo"> | string | null
    medidas_control?: StringNullableFilter<"PermisoTrabajo"> | string | null
    checklist_previo?: BoolFilter<"PermisoTrabajo"> | boolean
    solicitado_por?: UuidFilter<"PermisoTrabajo"> | string
    solicitante_nombre?: StringFilter<"PermisoTrabajo"> | string
    autorizado_por?: UuidNullableFilter<"PermisoTrabajo"> | string | null
    autorizador_nombre?: StringNullableFilter<"PermisoTrabajo"> | string | null
    trabajadores?: StringNullableFilter<"PermisoTrabajo"> | string | null
    created_at?: DateTimeFilter<"PermisoTrabajo"> | Date | string
    updated_at?: DateTimeFilter<"PermisoTrabajo"> | Date | string
  }, "id_permiso" | "tenant_id_codigo">

  export type PermisoTrabajoOrderByWithAggregationInput = {
    id_permiso?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    codigo?: SortOrder
    tipo_permiso?: SortOrder
    area_trabajo?: SortOrder
    descripcion_trabajo?: SortOrder
    fecha_inicio?: SortOrder
    fecha_fin?: SortOrder
    estado?: SortOrder
    epp_requerido?: SortOrderInput | SortOrder
    medidas_control?: SortOrderInput | SortOrder
    checklist_previo?: SortOrder
    solicitado_por?: SortOrder
    solicitante_nombre?: SortOrder
    autorizado_por?: SortOrderInput | SortOrder
    autorizador_nombre?: SortOrderInput | SortOrder
    trabajadores?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: PermisoTrabajoCountOrderByAggregateInput
    _max?: PermisoTrabajoMaxOrderByAggregateInput
    _min?: PermisoTrabajoMinOrderByAggregateInput
  }

  export type PermisoTrabajoScalarWhereWithAggregatesInput = {
    AND?: PermisoTrabajoScalarWhereWithAggregatesInput | PermisoTrabajoScalarWhereWithAggregatesInput[]
    OR?: PermisoTrabajoScalarWhereWithAggregatesInput[]
    NOT?: PermisoTrabajoScalarWhereWithAggregatesInput | PermisoTrabajoScalarWhereWithAggregatesInput[]
    id_permiso?: UuidWithAggregatesFilter<"PermisoTrabajo"> | string
    tenant_id?: UuidWithAggregatesFilter<"PermisoTrabajo"> | string
    proyecto_id?: UuidWithAggregatesFilter<"PermisoTrabajo"> | string
    codigo?: StringWithAggregatesFilter<"PermisoTrabajo"> | string
    tipo_permiso?: StringWithAggregatesFilter<"PermisoTrabajo"> | string
    area_trabajo?: StringWithAggregatesFilter<"PermisoTrabajo"> | string
    descripcion_trabajo?: StringWithAggregatesFilter<"PermisoTrabajo"> | string
    fecha_inicio?: DateTimeWithAggregatesFilter<"PermisoTrabajo"> | Date | string
    fecha_fin?: DateTimeWithAggregatesFilter<"PermisoTrabajo"> | Date | string
    estado?: StringWithAggregatesFilter<"PermisoTrabajo"> | string
    epp_requerido?: StringNullableWithAggregatesFilter<"PermisoTrabajo"> | string | null
    medidas_control?: StringNullableWithAggregatesFilter<"PermisoTrabajo"> | string | null
    checklist_previo?: BoolWithAggregatesFilter<"PermisoTrabajo"> | boolean
    solicitado_por?: UuidWithAggregatesFilter<"PermisoTrabajo"> | string
    solicitante_nombre?: StringWithAggregatesFilter<"PermisoTrabajo"> | string
    autorizado_por?: UuidNullableWithAggregatesFilter<"PermisoTrabajo"> | string | null
    autorizador_nombre?: StringNullableWithAggregatesFilter<"PermisoTrabajo"> | string | null
    trabajadores?: StringNullableWithAggregatesFilter<"PermisoTrabajo"> | string | null
    created_at?: DateTimeWithAggregatesFilter<"PermisoTrabajo"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"PermisoTrabajo"> | Date | string
  }

  export type CapacitacionWhereInput = {
    AND?: CapacitacionWhereInput | CapacitacionWhereInput[]
    OR?: CapacitacionWhereInput[]
    NOT?: CapacitacionWhereInput | CapacitacionWhereInput[]
    id_capacitacion?: UuidFilter<"Capacitacion"> | string
    tenant_id?: UuidFilter<"Capacitacion"> | string
    proyecto_id?: UuidFilter<"Capacitacion"> | string
    codigo?: StringFilter<"Capacitacion"> | string
    titulo?: StringFilter<"Capacitacion"> | string
    tipo?: StringFilter<"Capacitacion"> | string
    instructor?: StringFilter<"Capacitacion"> | string
    fecha?: DateTimeFilter<"Capacitacion"> | Date | string
    duracion_horas?: DecimalFilter<"Capacitacion"> | Decimal | DecimalJsLike | number | string
    ubicacion?: StringNullableFilter<"Capacitacion"> | string | null
    contenido?: StringNullableFilter<"Capacitacion"> | string | null
    validez_meses?: IntNullableFilter<"Capacitacion"> | number | null
    estado?: StringFilter<"Capacitacion"> | string
    created_at?: DateTimeFilter<"Capacitacion"> | Date | string
    updated_at?: DateTimeFilter<"Capacitacion"> | Date | string
    registros?: RegistroCapacitacionListRelationFilter
  }

  export type CapacitacionOrderByWithRelationInput = {
    id_capacitacion?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    codigo?: SortOrder
    titulo?: SortOrder
    tipo?: SortOrder
    instructor?: SortOrder
    fecha?: SortOrder
    duracion_horas?: SortOrder
    ubicacion?: SortOrderInput | SortOrder
    contenido?: SortOrderInput | SortOrder
    validez_meses?: SortOrderInput | SortOrder
    estado?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    registros?: RegistroCapacitacionOrderByRelationAggregateInput
  }

  export type CapacitacionWhereUniqueInput = Prisma.AtLeast<{
    id_capacitacion?: string
    tenant_id_codigo?: CapacitacionTenant_idCodigoCompoundUniqueInput
    AND?: CapacitacionWhereInput | CapacitacionWhereInput[]
    OR?: CapacitacionWhereInput[]
    NOT?: CapacitacionWhereInput | CapacitacionWhereInput[]
    tenant_id?: UuidFilter<"Capacitacion"> | string
    proyecto_id?: UuidFilter<"Capacitacion"> | string
    codigo?: StringFilter<"Capacitacion"> | string
    titulo?: StringFilter<"Capacitacion"> | string
    tipo?: StringFilter<"Capacitacion"> | string
    instructor?: StringFilter<"Capacitacion"> | string
    fecha?: DateTimeFilter<"Capacitacion"> | Date | string
    duracion_horas?: DecimalFilter<"Capacitacion"> | Decimal | DecimalJsLike | number | string
    ubicacion?: StringNullableFilter<"Capacitacion"> | string | null
    contenido?: StringNullableFilter<"Capacitacion"> | string | null
    validez_meses?: IntNullableFilter<"Capacitacion"> | number | null
    estado?: StringFilter<"Capacitacion"> | string
    created_at?: DateTimeFilter<"Capacitacion"> | Date | string
    updated_at?: DateTimeFilter<"Capacitacion"> | Date | string
    registros?: RegistroCapacitacionListRelationFilter
  }, "id_capacitacion" | "tenant_id_codigo">

  export type CapacitacionOrderByWithAggregationInput = {
    id_capacitacion?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    codigo?: SortOrder
    titulo?: SortOrder
    tipo?: SortOrder
    instructor?: SortOrder
    fecha?: SortOrder
    duracion_horas?: SortOrder
    ubicacion?: SortOrderInput | SortOrder
    contenido?: SortOrderInput | SortOrder
    validez_meses?: SortOrderInput | SortOrder
    estado?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: CapacitacionCountOrderByAggregateInput
    _avg?: CapacitacionAvgOrderByAggregateInput
    _max?: CapacitacionMaxOrderByAggregateInput
    _min?: CapacitacionMinOrderByAggregateInput
    _sum?: CapacitacionSumOrderByAggregateInput
  }

  export type CapacitacionScalarWhereWithAggregatesInput = {
    AND?: CapacitacionScalarWhereWithAggregatesInput | CapacitacionScalarWhereWithAggregatesInput[]
    OR?: CapacitacionScalarWhereWithAggregatesInput[]
    NOT?: CapacitacionScalarWhereWithAggregatesInput | CapacitacionScalarWhereWithAggregatesInput[]
    id_capacitacion?: UuidWithAggregatesFilter<"Capacitacion"> | string
    tenant_id?: UuidWithAggregatesFilter<"Capacitacion"> | string
    proyecto_id?: UuidWithAggregatesFilter<"Capacitacion"> | string
    codigo?: StringWithAggregatesFilter<"Capacitacion"> | string
    titulo?: StringWithAggregatesFilter<"Capacitacion"> | string
    tipo?: StringWithAggregatesFilter<"Capacitacion"> | string
    instructor?: StringWithAggregatesFilter<"Capacitacion"> | string
    fecha?: DateTimeWithAggregatesFilter<"Capacitacion"> | Date | string
    duracion_horas?: DecimalWithAggregatesFilter<"Capacitacion"> | Decimal | DecimalJsLike | number | string
    ubicacion?: StringNullableWithAggregatesFilter<"Capacitacion"> | string | null
    contenido?: StringNullableWithAggregatesFilter<"Capacitacion"> | string | null
    validez_meses?: IntNullableWithAggregatesFilter<"Capacitacion"> | number | null
    estado?: StringWithAggregatesFilter<"Capacitacion"> | string
    created_at?: DateTimeWithAggregatesFilter<"Capacitacion"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"Capacitacion"> | Date | string
  }

  export type RegistroCapacitacionWhereInput = {
    AND?: RegistroCapacitacionWhereInput | RegistroCapacitacionWhereInput[]
    OR?: RegistroCapacitacionWhereInput[]
    NOT?: RegistroCapacitacionWhereInput | RegistroCapacitacionWhereInput[]
    id_registro?: UuidFilter<"RegistroCapacitacion"> | string
    tenant_id?: UuidFilter<"RegistroCapacitacion"> | string
    proyecto_id?: UuidFilter<"RegistroCapacitacion"> | string
    capacitacion_id?: UuidFilter<"RegistroCapacitacion"> | string
    empleado_id?: UuidFilter<"RegistroCapacitacion"> | string
    empleado_nombre?: StringFilter<"RegistroCapacitacion"> | string
    asistio?: BoolFilter<"RegistroCapacitacion"> | boolean
    calificacion?: DecimalNullableFilter<"RegistroCapacitacion"> | Decimal | DecimalJsLike | number | string | null
    aprobado?: BoolFilter<"RegistroCapacitacion"> | boolean
    observaciones?: StringNullableFilter<"RegistroCapacitacion"> | string | null
    capacitacion?: XOR<CapacitacionRelationFilter, CapacitacionWhereInput>
  }

  export type RegistroCapacitacionOrderByWithRelationInput = {
    id_registro?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    capacitacion_id?: SortOrder
    empleado_id?: SortOrder
    empleado_nombre?: SortOrder
    asistio?: SortOrder
    calificacion?: SortOrderInput | SortOrder
    aprobado?: SortOrder
    observaciones?: SortOrderInput | SortOrder
    capacitacion?: CapacitacionOrderByWithRelationInput
  }

  export type RegistroCapacitacionWhereUniqueInput = Prisma.AtLeast<{
    id_registro?: string
    AND?: RegistroCapacitacionWhereInput | RegistroCapacitacionWhereInput[]
    OR?: RegistroCapacitacionWhereInput[]
    NOT?: RegistroCapacitacionWhereInput | RegistroCapacitacionWhereInput[]
    tenant_id?: UuidFilter<"RegistroCapacitacion"> | string
    proyecto_id?: UuidFilter<"RegistroCapacitacion"> | string
    capacitacion_id?: UuidFilter<"RegistroCapacitacion"> | string
    empleado_id?: UuidFilter<"RegistroCapacitacion"> | string
    empleado_nombre?: StringFilter<"RegistroCapacitacion"> | string
    asistio?: BoolFilter<"RegistroCapacitacion"> | boolean
    calificacion?: DecimalNullableFilter<"RegistroCapacitacion"> | Decimal | DecimalJsLike | number | string | null
    aprobado?: BoolFilter<"RegistroCapacitacion"> | boolean
    observaciones?: StringNullableFilter<"RegistroCapacitacion"> | string | null
    capacitacion?: XOR<CapacitacionRelationFilter, CapacitacionWhereInput>
  }, "id_registro">

  export type RegistroCapacitacionOrderByWithAggregationInput = {
    id_registro?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    capacitacion_id?: SortOrder
    empleado_id?: SortOrder
    empleado_nombre?: SortOrder
    asistio?: SortOrder
    calificacion?: SortOrderInput | SortOrder
    aprobado?: SortOrder
    observaciones?: SortOrderInput | SortOrder
    _count?: RegistroCapacitacionCountOrderByAggregateInput
    _avg?: RegistroCapacitacionAvgOrderByAggregateInput
    _max?: RegistroCapacitacionMaxOrderByAggregateInput
    _min?: RegistroCapacitacionMinOrderByAggregateInput
    _sum?: RegistroCapacitacionSumOrderByAggregateInput
  }

  export type RegistroCapacitacionScalarWhereWithAggregatesInput = {
    AND?: RegistroCapacitacionScalarWhereWithAggregatesInput | RegistroCapacitacionScalarWhereWithAggregatesInput[]
    OR?: RegistroCapacitacionScalarWhereWithAggregatesInput[]
    NOT?: RegistroCapacitacionScalarWhereWithAggregatesInput | RegistroCapacitacionScalarWhereWithAggregatesInput[]
    id_registro?: UuidWithAggregatesFilter<"RegistroCapacitacion"> | string
    tenant_id?: UuidWithAggregatesFilter<"RegistroCapacitacion"> | string
    proyecto_id?: UuidWithAggregatesFilter<"RegistroCapacitacion"> | string
    capacitacion_id?: UuidWithAggregatesFilter<"RegistroCapacitacion"> | string
    empleado_id?: UuidWithAggregatesFilter<"RegistroCapacitacion"> | string
    empleado_nombre?: StringWithAggregatesFilter<"RegistroCapacitacion"> | string
    asistio?: BoolWithAggregatesFilter<"RegistroCapacitacion"> | boolean
    calificacion?: DecimalNullableWithAggregatesFilter<"RegistroCapacitacion"> | Decimal | DecimalJsLike | number | string | null
    aprobado?: BoolWithAggregatesFilter<"RegistroCapacitacion"> | boolean
    observaciones?: StringNullableWithAggregatesFilter<"RegistroCapacitacion"> | string | null
  }

  export type IncidenteCreateInput = {
    id_incidente?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    tipo: string
    severidad?: string
    fecha_incidente: Date | string
    hora_incidente?: string | null
    ubicacion: string
    descripcion: string
    empleado_afectado_id?: string | null
    empleado_afectado_nombre?: string | null
    testigos?: string | null
    causa_raiz?: string | null
    accion_correctiva?: string | null
    accion_preventiva?: string | null
    dias_incapacidad?: number
    requirio_atencion_medica?: boolean
    reportado_stps?: boolean
    estado?: string
    reportado_por: string
    cerrado_por?: string | null
    fecha_cierre?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type IncidenteUncheckedCreateInput = {
    id_incidente?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    tipo: string
    severidad?: string
    fecha_incidente: Date | string
    hora_incidente?: string | null
    ubicacion: string
    descripcion: string
    empleado_afectado_id?: string | null
    empleado_afectado_nombre?: string | null
    testigos?: string | null
    causa_raiz?: string | null
    accion_correctiva?: string | null
    accion_preventiva?: string | null
    dias_incapacidad?: number
    requirio_atencion_medica?: boolean
    reportado_stps?: boolean
    estado?: string
    reportado_por: string
    cerrado_por?: string | null
    fecha_cierre?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type IncidenteUpdateInput = {
    id_incidente?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    severidad?: StringFieldUpdateOperationsInput | string
    fecha_incidente?: DateTimeFieldUpdateOperationsInput | Date | string
    hora_incidente?: NullableStringFieldUpdateOperationsInput | string | null
    ubicacion?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    empleado_afectado_id?: NullableStringFieldUpdateOperationsInput | string | null
    empleado_afectado_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    testigos?: NullableStringFieldUpdateOperationsInput | string | null
    causa_raiz?: NullableStringFieldUpdateOperationsInput | string | null
    accion_correctiva?: NullableStringFieldUpdateOperationsInput | string | null
    accion_preventiva?: NullableStringFieldUpdateOperationsInput | string | null
    dias_incapacidad?: IntFieldUpdateOperationsInput | number
    requirio_atencion_medica?: BoolFieldUpdateOperationsInput | boolean
    reportado_stps?: BoolFieldUpdateOperationsInput | boolean
    estado?: StringFieldUpdateOperationsInput | string
    reportado_por?: StringFieldUpdateOperationsInput | string
    cerrado_por?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_cierre?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IncidenteUncheckedUpdateInput = {
    id_incidente?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    severidad?: StringFieldUpdateOperationsInput | string
    fecha_incidente?: DateTimeFieldUpdateOperationsInput | Date | string
    hora_incidente?: NullableStringFieldUpdateOperationsInput | string | null
    ubicacion?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    empleado_afectado_id?: NullableStringFieldUpdateOperationsInput | string | null
    empleado_afectado_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    testigos?: NullableStringFieldUpdateOperationsInput | string | null
    causa_raiz?: NullableStringFieldUpdateOperationsInput | string | null
    accion_correctiva?: NullableStringFieldUpdateOperationsInput | string | null
    accion_preventiva?: NullableStringFieldUpdateOperationsInput | string | null
    dias_incapacidad?: IntFieldUpdateOperationsInput | number
    requirio_atencion_medica?: BoolFieldUpdateOperationsInput | boolean
    reportado_stps?: BoolFieldUpdateOperationsInput | boolean
    estado?: StringFieldUpdateOperationsInput | string
    reportado_por?: StringFieldUpdateOperationsInput | string
    cerrado_por?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_cierre?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IncidenteCreateManyInput = {
    id_incidente?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    tipo: string
    severidad?: string
    fecha_incidente: Date | string
    hora_incidente?: string | null
    ubicacion: string
    descripcion: string
    empleado_afectado_id?: string | null
    empleado_afectado_nombre?: string | null
    testigos?: string | null
    causa_raiz?: string | null
    accion_correctiva?: string | null
    accion_preventiva?: string | null
    dias_incapacidad?: number
    requirio_atencion_medica?: boolean
    reportado_stps?: boolean
    estado?: string
    reportado_por: string
    cerrado_por?: string | null
    fecha_cierre?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type IncidenteUpdateManyMutationInput = {
    id_incidente?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    severidad?: StringFieldUpdateOperationsInput | string
    fecha_incidente?: DateTimeFieldUpdateOperationsInput | Date | string
    hora_incidente?: NullableStringFieldUpdateOperationsInput | string | null
    ubicacion?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    empleado_afectado_id?: NullableStringFieldUpdateOperationsInput | string | null
    empleado_afectado_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    testigos?: NullableStringFieldUpdateOperationsInput | string | null
    causa_raiz?: NullableStringFieldUpdateOperationsInput | string | null
    accion_correctiva?: NullableStringFieldUpdateOperationsInput | string | null
    accion_preventiva?: NullableStringFieldUpdateOperationsInput | string | null
    dias_incapacidad?: IntFieldUpdateOperationsInput | number
    requirio_atencion_medica?: BoolFieldUpdateOperationsInput | boolean
    reportado_stps?: BoolFieldUpdateOperationsInput | boolean
    estado?: StringFieldUpdateOperationsInput | string
    reportado_por?: StringFieldUpdateOperationsInput | string
    cerrado_por?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_cierre?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IncidenteUncheckedUpdateManyInput = {
    id_incidente?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    severidad?: StringFieldUpdateOperationsInput | string
    fecha_incidente?: DateTimeFieldUpdateOperationsInput | Date | string
    hora_incidente?: NullableStringFieldUpdateOperationsInput | string | null
    ubicacion?: StringFieldUpdateOperationsInput | string
    descripcion?: StringFieldUpdateOperationsInput | string
    empleado_afectado_id?: NullableStringFieldUpdateOperationsInput | string | null
    empleado_afectado_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    testigos?: NullableStringFieldUpdateOperationsInput | string | null
    causa_raiz?: NullableStringFieldUpdateOperationsInput | string | null
    accion_correctiva?: NullableStringFieldUpdateOperationsInput | string | null
    accion_preventiva?: NullableStringFieldUpdateOperationsInput | string | null
    dias_incapacidad?: IntFieldUpdateOperationsInput | number
    requirio_atencion_medica?: BoolFieldUpdateOperationsInput | boolean
    reportado_stps?: BoolFieldUpdateOperationsInput | boolean
    estado?: StringFieldUpdateOperationsInput | string
    reportado_por?: StringFieldUpdateOperationsInput | string
    cerrado_por?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_cierre?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InspeccionSeguridadCreateInput = {
    id_inspeccion?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    tipo_inspeccion: string
    fecha_inspeccion: Date | string
    area_inspeccionada: string
    items_revisados?: number
    items_conformes?: number
    items_no_conformes?: number
    porcentaje_cumplimiento?: Decimal | DecimalJsLike | number | string
    resultado?: string
    observaciones?: string | null
    hallazgos?: string | null
    evidencia_fotos?: string | null
    inspector_id: string
    inspector_nombre: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type InspeccionSeguridadUncheckedCreateInput = {
    id_inspeccion?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    tipo_inspeccion: string
    fecha_inspeccion: Date | string
    area_inspeccionada: string
    items_revisados?: number
    items_conformes?: number
    items_no_conformes?: number
    porcentaje_cumplimiento?: Decimal | DecimalJsLike | number | string
    resultado?: string
    observaciones?: string | null
    hallazgos?: string | null
    evidencia_fotos?: string | null
    inspector_id: string
    inspector_nombre: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type InspeccionSeguridadUpdateInput = {
    id_inspeccion?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    tipo_inspeccion?: StringFieldUpdateOperationsInput | string
    fecha_inspeccion?: DateTimeFieldUpdateOperationsInput | Date | string
    area_inspeccionada?: StringFieldUpdateOperationsInput | string
    items_revisados?: IntFieldUpdateOperationsInput | number
    items_conformes?: IntFieldUpdateOperationsInput | number
    items_no_conformes?: IntFieldUpdateOperationsInput | number
    porcentaje_cumplimiento?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    resultado?: StringFieldUpdateOperationsInput | string
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    hallazgos?: NullableStringFieldUpdateOperationsInput | string | null
    evidencia_fotos?: NullableStringFieldUpdateOperationsInput | string | null
    inspector_id?: StringFieldUpdateOperationsInput | string
    inspector_nombre?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InspeccionSeguridadUncheckedUpdateInput = {
    id_inspeccion?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    tipo_inspeccion?: StringFieldUpdateOperationsInput | string
    fecha_inspeccion?: DateTimeFieldUpdateOperationsInput | Date | string
    area_inspeccionada?: StringFieldUpdateOperationsInput | string
    items_revisados?: IntFieldUpdateOperationsInput | number
    items_conformes?: IntFieldUpdateOperationsInput | number
    items_no_conformes?: IntFieldUpdateOperationsInput | number
    porcentaje_cumplimiento?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    resultado?: StringFieldUpdateOperationsInput | string
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    hallazgos?: NullableStringFieldUpdateOperationsInput | string | null
    evidencia_fotos?: NullableStringFieldUpdateOperationsInput | string | null
    inspector_id?: StringFieldUpdateOperationsInput | string
    inspector_nombre?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InspeccionSeguridadCreateManyInput = {
    id_inspeccion?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    tipo_inspeccion: string
    fecha_inspeccion: Date | string
    area_inspeccionada: string
    items_revisados?: number
    items_conformes?: number
    items_no_conformes?: number
    porcentaje_cumplimiento?: Decimal | DecimalJsLike | number | string
    resultado?: string
    observaciones?: string | null
    hallazgos?: string | null
    evidencia_fotos?: string | null
    inspector_id: string
    inspector_nombre: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type InspeccionSeguridadUpdateManyMutationInput = {
    id_inspeccion?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    tipo_inspeccion?: StringFieldUpdateOperationsInput | string
    fecha_inspeccion?: DateTimeFieldUpdateOperationsInput | Date | string
    area_inspeccionada?: StringFieldUpdateOperationsInput | string
    items_revisados?: IntFieldUpdateOperationsInput | number
    items_conformes?: IntFieldUpdateOperationsInput | number
    items_no_conformes?: IntFieldUpdateOperationsInput | number
    porcentaje_cumplimiento?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    resultado?: StringFieldUpdateOperationsInput | string
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    hallazgos?: NullableStringFieldUpdateOperationsInput | string | null
    evidencia_fotos?: NullableStringFieldUpdateOperationsInput | string | null
    inspector_id?: StringFieldUpdateOperationsInput | string
    inspector_nombre?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InspeccionSeguridadUncheckedUpdateManyInput = {
    id_inspeccion?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    tipo_inspeccion?: StringFieldUpdateOperationsInput | string
    fecha_inspeccion?: DateTimeFieldUpdateOperationsInput | Date | string
    area_inspeccionada?: StringFieldUpdateOperationsInput | string
    items_revisados?: IntFieldUpdateOperationsInput | number
    items_conformes?: IntFieldUpdateOperationsInput | number
    items_no_conformes?: IntFieldUpdateOperationsInput | number
    porcentaje_cumplimiento?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    resultado?: StringFieldUpdateOperationsInput | string
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    hallazgos?: NullableStringFieldUpdateOperationsInput | string | null
    evidencia_fotos?: NullableStringFieldUpdateOperationsInput | string | null
    inspector_id?: StringFieldUpdateOperationsInput | string
    inspector_nombre?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PermisoTrabajoCreateInput = {
    id_permiso?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    tipo_permiso: string
    area_trabajo: string
    descripcion_trabajo: string
    fecha_inicio: Date | string
    fecha_fin: Date | string
    estado?: string
    epp_requerido?: string | null
    medidas_control?: string | null
    checklist_previo?: boolean
    solicitado_por: string
    solicitante_nombre: string
    autorizado_por?: string | null
    autorizador_nombre?: string | null
    trabajadores?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type PermisoTrabajoUncheckedCreateInput = {
    id_permiso?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    tipo_permiso: string
    area_trabajo: string
    descripcion_trabajo: string
    fecha_inicio: Date | string
    fecha_fin: Date | string
    estado?: string
    epp_requerido?: string | null
    medidas_control?: string | null
    checklist_previo?: boolean
    solicitado_por: string
    solicitante_nombre: string
    autorizado_por?: string | null
    autorizador_nombre?: string | null
    trabajadores?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type PermisoTrabajoUpdateInput = {
    id_permiso?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    tipo_permiso?: StringFieldUpdateOperationsInput | string
    area_trabajo?: StringFieldUpdateOperationsInput | string
    descripcion_trabajo?: StringFieldUpdateOperationsInput | string
    fecha_inicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_fin?: DateTimeFieldUpdateOperationsInput | Date | string
    estado?: StringFieldUpdateOperationsInput | string
    epp_requerido?: NullableStringFieldUpdateOperationsInput | string | null
    medidas_control?: NullableStringFieldUpdateOperationsInput | string | null
    checklist_previo?: BoolFieldUpdateOperationsInput | boolean
    solicitado_por?: StringFieldUpdateOperationsInput | string
    solicitante_nombre?: StringFieldUpdateOperationsInput | string
    autorizado_por?: NullableStringFieldUpdateOperationsInput | string | null
    autorizador_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    trabajadores?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PermisoTrabajoUncheckedUpdateInput = {
    id_permiso?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    tipo_permiso?: StringFieldUpdateOperationsInput | string
    area_trabajo?: StringFieldUpdateOperationsInput | string
    descripcion_trabajo?: StringFieldUpdateOperationsInput | string
    fecha_inicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_fin?: DateTimeFieldUpdateOperationsInput | Date | string
    estado?: StringFieldUpdateOperationsInput | string
    epp_requerido?: NullableStringFieldUpdateOperationsInput | string | null
    medidas_control?: NullableStringFieldUpdateOperationsInput | string | null
    checklist_previo?: BoolFieldUpdateOperationsInput | boolean
    solicitado_por?: StringFieldUpdateOperationsInput | string
    solicitante_nombre?: StringFieldUpdateOperationsInput | string
    autorizado_por?: NullableStringFieldUpdateOperationsInput | string | null
    autorizador_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    trabajadores?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PermisoTrabajoCreateManyInput = {
    id_permiso?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    tipo_permiso: string
    area_trabajo: string
    descripcion_trabajo: string
    fecha_inicio: Date | string
    fecha_fin: Date | string
    estado?: string
    epp_requerido?: string | null
    medidas_control?: string | null
    checklist_previo?: boolean
    solicitado_por: string
    solicitante_nombre: string
    autorizado_por?: string | null
    autorizador_nombre?: string | null
    trabajadores?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type PermisoTrabajoUpdateManyMutationInput = {
    id_permiso?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    tipo_permiso?: StringFieldUpdateOperationsInput | string
    area_trabajo?: StringFieldUpdateOperationsInput | string
    descripcion_trabajo?: StringFieldUpdateOperationsInput | string
    fecha_inicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_fin?: DateTimeFieldUpdateOperationsInput | Date | string
    estado?: StringFieldUpdateOperationsInput | string
    epp_requerido?: NullableStringFieldUpdateOperationsInput | string | null
    medidas_control?: NullableStringFieldUpdateOperationsInput | string | null
    checklist_previo?: BoolFieldUpdateOperationsInput | boolean
    solicitado_por?: StringFieldUpdateOperationsInput | string
    solicitante_nombre?: StringFieldUpdateOperationsInput | string
    autorizado_por?: NullableStringFieldUpdateOperationsInput | string | null
    autorizador_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    trabajadores?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PermisoTrabajoUncheckedUpdateManyInput = {
    id_permiso?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    tipo_permiso?: StringFieldUpdateOperationsInput | string
    area_trabajo?: StringFieldUpdateOperationsInput | string
    descripcion_trabajo?: StringFieldUpdateOperationsInput | string
    fecha_inicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fecha_fin?: DateTimeFieldUpdateOperationsInput | Date | string
    estado?: StringFieldUpdateOperationsInput | string
    epp_requerido?: NullableStringFieldUpdateOperationsInput | string | null
    medidas_control?: NullableStringFieldUpdateOperationsInput | string | null
    checklist_previo?: BoolFieldUpdateOperationsInput | boolean
    solicitado_por?: StringFieldUpdateOperationsInput | string
    solicitante_nombre?: StringFieldUpdateOperationsInput | string
    autorizado_por?: NullableStringFieldUpdateOperationsInput | string | null
    autorizador_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    trabajadores?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CapacitacionCreateInput = {
    id_capacitacion?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    titulo: string
    tipo: string
    instructor: string
    fecha: Date | string
    duracion_horas: Decimal | DecimalJsLike | number | string
    ubicacion?: string | null
    contenido?: string | null
    validez_meses?: number | null
    estado?: string
    created_at?: Date | string
    updated_at?: Date | string
    registros?: RegistroCapacitacionCreateNestedManyWithoutCapacitacionInput
  }

  export type CapacitacionUncheckedCreateInput = {
    id_capacitacion?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    titulo: string
    tipo: string
    instructor: string
    fecha: Date | string
    duracion_horas: Decimal | DecimalJsLike | number | string
    ubicacion?: string | null
    contenido?: string | null
    validez_meses?: number | null
    estado?: string
    created_at?: Date | string
    updated_at?: Date | string
    registros?: RegistroCapacitacionUncheckedCreateNestedManyWithoutCapacitacionInput
  }

  export type CapacitacionUpdateInput = {
    id_capacitacion?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    instructor?: StringFieldUpdateOperationsInput | string
    fecha?: DateTimeFieldUpdateOperationsInput | Date | string
    duracion_horas?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    ubicacion?: NullableStringFieldUpdateOperationsInput | string | null
    contenido?: NullableStringFieldUpdateOperationsInput | string | null
    validez_meses?: NullableIntFieldUpdateOperationsInput | number | null
    estado?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    registros?: RegistroCapacitacionUpdateManyWithoutCapacitacionNestedInput
  }

  export type CapacitacionUncheckedUpdateInput = {
    id_capacitacion?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    instructor?: StringFieldUpdateOperationsInput | string
    fecha?: DateTimeFieldUpdateOperationsInput | Date | string
    duracion_horas?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    ubicacion?: NullableStringFieldUpdateOperationsInput | string | null
    contenido?: NullableStringFieldUpdateOperationsInput | string | null
    validez_meses?: NullableIntFieldUpdateOperationsInput | number | null
    estado?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    registros?: RegistroCapacitacionUncheckedUpdateManyWithoutCapacitacionNestedInput
  }

  export type CapacitacionCreateManyInput = {
    id_capacitacion?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    titulo: string
    tipo: string
    instructor: string
    fecha: Date | string
    duracion_horas: Decimal | DecimalJsLike | number | string
    ubicacion?: string | null
    contenido?: string | null
    validez_meses?: number | null
    estado?: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type CapacitacionUpdateManyMutationInput = {
    id_capacitacion?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    instructor?: StringFieldUpdateOperationsInput | string
    fecha?: DateTimeFieldUpdateOperationsInput | Date | string
    duracion_horas?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    ubicacion?: NullableStringFieldUpdateOperationsInput | string | null
    contenido?: NullableStringFieldUpdateOperationsInput | string | null
    validez_meses?: NullableIntFieldUpdateOperationsInput | number | null
    estado?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CapacitacionUncheckedUpdateManyInput = {
    id_capacitacion?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    instructor?: StringFieldUpdateOperationsInput | string
    fecha?: DateTimeFieldUpdateOperationsInput | Date | string
    duracion_horas?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    ubicacion?: NullableStringFieldUpdateOperationsInput | string | null
    contenido?: NullableStringFieldUpdateOperationsInput | string | null
    validez_meses?: NullableIntFieldUpdateOperationsInput | number | null
    estado?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RegistroCapacitacionCreateInput = {
    id_registro?: string
    tenant_id: string
    proyecto_id: string
    empleado_id: string
    empleado_nombre: string
    asistio?: boolean
    calificacion?: Decimal | DecimalJsLike | number | string | null
    aprobado?: boolean
    observaciones?: string | null
    capacitacion: CapacitacionCreateNestedOneWithoutRegistrosInput
  }

  export type RegistroCapacitacionUncheckedCreateInput = {
    id_registro?: string
    tenant_id: string
    proyecto_id: string
    capacitacion_id: string
    empleado_id: string
    empleado_nombre: string
    asistio?: boolean
    calificacion?: Decimal | DecimalJsLike | number | string | null
    aprobado?: boolean
    observaciones?: string | null
  }

  export type RegistroCapacitacionUpdateInput = {
    id_registro?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    empleado_id?: StringFieldUpdateOperationsInput | string
    empleado_nombre?: StringFieldUpdateOperationsInput | string
    asistio?: BoolFieldUpdateOperationsInput | boolean
    calificacion?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    aprobado?: BoolFieldUpdateOperationsInput | boolean
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    capacitacion?: CapacitacionUpdateOneRequiredWithoutRegistrosNestedInput
  }

  export type RegistroCapacitacionUncheckedUpdateInput = {
    id_registro?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    capacitacion_id?: StringFieldUpdateOperationsInput | string
    empleado_id?: StringFieldUpdateOperationsInput | string
    empleado_nombre?: StringFieldUpdateOperationsInput | string
    asistio?: BoolFieldUpdateOperationsInput | boolean
    calificacion?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    aprobado?: BoolFieldUpdateOperationsInput | boolean
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RegistroCapacitacionCreateManyInput = {
    id_registro?: string
    tenant_id: string
    proyecto_id: string
    capacitacion_id: string
    empleado_id: string
    empleado_nombre: string
    asistio?: boolean
    calificacion?: Decimal | DecimalJsLike | number | string | null
    aprobado?: boolean
    observaciones?: string | null
  }

  export type RegistroCapacitacionUpdateManyMutationInput = {
    id_registro?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    empleado_id?: StringFieldUpdateOperationsInput | string
    empleado_nombre?: StringFieldUpdateOperationsInput | string
    asistio?: BoolFieldUpdateOperationsInput | boolean
    calificacion?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    aprobado?: BoolFieldUpdateOperationsInput | boolean
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RegistroCapacitacionUncheckedUpdateManyInput = {
    id_registro?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    capacitacion_id?: StringFieldUpdateOperationsInput | string
    empleado_id?: StringFieldUpdateOperationsInput | string
    empleado_nombre?: StringFieldUpdateOperationsInput | string
    asistio?: BoolFieldUpdateOperationsInput | boolean
    calificacion?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    aprobado?: BoolFieldUpdateOperationsInput | boolean
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
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

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
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

  export type IncidenteTenant_idCodigoCompoundUniqueInput = {
    tenant_id: string
    codigo: string
  }

  export type IncidenteCountOrderByAggregateInput = {
    id_incidente?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    codigo?: SortOrder
    tipo?: SortOrder
    severidad?: SortOrder
    fecha_incidente?: SortOrder
    hora_incidente?: SortOrder
    ubicacion?: SortOrder
    descripcion?: SortOrder
    empleado_afectado_id?: SortOrder
    empleado_afectado_nombre?: SortOrder
    testigos?: SortOrder
    causa_raiz?: SortOrder
    accion_correctiva?: SortOrder
    accion_preventiva?: SortOrder
    dias_incapacidad?: SortOrder
    requirio_atencion_medica?: SortOrder
    reportado_stps?: SortOrder
    estado?: SortOrder
    reportado_por?: SortOrder
    cerrado_por?: SortOrder
    fecha_cierre?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type IncidenteAvgOrderByAggregateInput = {
    dias_incapacidad?: SortOrder
  }

  export type IncidenteMaxOrderByAggregateInput = {
    id_incidente?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    codigo?: SortOrder
    tipo?: SortOrder
    severidad?: SortOrder
    fecha_incidente?: SortOrder
    hora_incidente?: SortOrder
    ubicacion?: SortOrder
    descripcion?: SortOrder
    empleado_afectado_id?: SortOrder
    empleado_afectado_nombre?: SortOrder
    testigos?: SortOrder
    causa_raiz?: SortOrder
    accion_correctiva?: SortOrder
    accion_preventiva?: SortOrder
    dias_incapacidad?: SortOrder
    requirio_atencion_medica?: SortOrder
    reportado_stps?: SortOrder
    estado?: SortOrder
    reportado_por?: SortOrder
    cerrado_por?: SortOrder
    fecha_cierre?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type IncidenteMinOrderByAggregateInput = {
    id_incidente?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    codigo?: SortOrder
    tipo?: SortOrder
    severidad?: SortOrder
    fecha_incidente?: SortOrder
    hora_incidente?: SortOrder
    ubicacion?: SortOrder
    descripcion?: SortOrder
    empleado_afectado_id?: SortOrder
    empleado_afectado_nombre?: SortOrder
    testigos?: SortOrder
    causa_raiz?: SortOrder
    accion_correctiva?: SortOrder
    accion_preventiva?: SortOrder
    dias_incapacidad?: SortOrder
    requirio_atencion_medica?: SortOrder
    reportado_stps?: SortOrder
    estado?: SortOrder
    reportado_por?: SortOrder
    cerrado_por?: SortOrder
    fecha_cierre?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type IncidenteSumOrderByAggregateInput = {
    dias_incapacidad?: SortOrder
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

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
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

  export type InspeccionSeguridadTenant_idCodigoCompoundUniqueInput = {
    tenant_id: string
    codigo: string
  }

  export type InspeccionSeguridadCountOrderByAggregateInput = {
    id_inspeccion?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    codigo?: SortOrder
    tipo_inspeccion?: SortOrder
    fecha_inspeccion?: SortOrder
    area_inspeccionada?: SortOrder
    items_revisados?: SortOrder
    items_conformes?: SortOrder
    items_no_conformes?: SortOrder
    porcentaje_cumplimiento?: SortOrder
    resultado?: SortOrder
    observaciones?: SortOrder
    hallazgos?: SortOrder
    evidencia_fotos?: SortOrder
    inspector_id?: SortOrder
    inspector_nombre?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type InspeccionSeguridadAvgOrderByAggregateInput = {
    items_revisados?: SortOrder
    items_conformes?: SortOrder
    items_no_conformes?: SortOrder
    porcentaje_cumplimiento?: SortOrder
  }

  export type InspeccionSeguridadMaxOrderByAggregateInput = {
    id_inspeccion?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    codigo?: SortOrder
    tipo_inspeccion?: SortOrder
    fecha_inspeccion?: SortOrder
    area_inspeccionada?: SortOrder
    items_revisados?: SortOrder
    items_conformes?: SortOrder
    items_no_conformes?: SortOrder
    porcentaje_cumplimiento?: SortOrder
    resultado?: SortOrder
    observaciones?: SortOrder
    hallazgos?: SortOrder
    evidencia_fotos?: SortOrder
    inspector_id?: SortOrder
    inspector_nombre?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type InspeccionSeguridadMinOrderByAggregateInput = {
    id_inspeccion?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    codigo?: SortOrder
    tipo_inspeccion?: SortOrder
    fecha_inspeccion?: SortOrder
    area_inspeccionada?: SortOrder
    items_revisados?: SortOrder
    items_conformes?: SortOrder
    items_no_conformes?: SortOrder
    porcentaje_cumplimiento?: SortOrder
    resultado?: SortOrder
    observaciones?: SortOrder
    hallazgos?: SortOrder
    evidencia_fotos?: SortOrder
    inspector_id?: SortOrder
    inspector_nombre?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type InspeccionSeguridadSumOrderByAggregateInput = {
    items_revisados?: SortOrder
    items_conformes?: SortOrder
    items_no_conformes?: SortOrder
    porcentaje_cumplimiento?: SortOrder
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

  export type PermisoTrabajoTenant_idCodigoCompoundUniqueInput = {
    tenant_id: string
    codigo: string
  }

  export type PermisoTrabajoCountOrderByAggregateInput = {
    id_permiso?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    codigo?: SortOrder
    tipo_permiso?: SortOrder
    area_trabajo?: SortOrder
    descripcion_trabajo?: SortOrder
    fecha_inicio?: SortOrder
    fecha_fin?: SortOrder
    estado?: SortOrder
    epp_requerido?: SortOrder
    medidas_control?: SortOrder
    checklist_previo?: SortOrder
    solicitado_por?: SortOrder
    solicitante_nombre?: SortOrder
    autorizado_por?: SortOrder
    autorizador_nombre?: SortOrder
    trabajadores?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type PermisoTrabajoMaxOrderByAggregateInput = {
    id_permiso?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    codigo?: SortOrder
    tipo_permiso?: SortOrder
    area_trabajo?: SortOrder
    descripcion_trabajo?: SortOrder
    fecha_inicio?: SortOrder
    fecha_fin?: SortOrder
    estado?: SortOrder
    epp_requerido?: SortOrder
    medidas_control?: SortOrder
    checklist_previo?: SortOrder
    solicitado_por?: SortOrder
    solicitante_nombre?: SortOrder
    autorizado_por?: SortOrder
    autorizador_nombre?: SortOrder
    trabajadores?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type PermisoTrabajoMinOrderByAggregateInput = {
    id_permiso?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    codigo?: SortOrder
    tipo_permiso?: SortOrder
    area_trabajo?: SortOrder
    descripcion_trabajo?: SortOrder
    fecha_inicio?: SortOrder
    fecha_fin?: SortOrder
    estado?: SortOrder
    epp_requerido?: SortOrder
    medidas_control?: SortOrder
    checklist_previo?: SortOrder
    solicitado_por?: SortOrder
    solicitante_nombre?: SortOrder
    autorizado_por?: SortOrder
    autorizador_nombre?: SortOrder
    trabajadores?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type RegistroCapacitacionListRelationFilter = {
    every?: RegistroCapacitacionWhereInput
    some?: RegistroCapacitacionWhereInput
    none?: RegistroCapacitacionWhereInput
  }

  export type RegistroCapacitacionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CapacitacionTenant_idCodigoCompoundUniqueInput = {
    tenant_id: string
    codigo: string
  }

  export type CapacitacionCountOrderByAggregateInput = {
    id_capacitacion?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    codigo?: SortOrder
    titulo?: SortOrder
    tipo?: SortOrder
    instructor?: SortOrder
    fecha?: SortOrder
    duracion_horas?: SortOrder
    ubicacion?: SortOrder
    contenido?: SortOrder
    validez_meses?: SortOrder
    estado?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type CapacitacionAvgOrderByAggregateInput = {
    duracion_horas?: SortOrder
    validez_meses?: SortOrder
  }

  export type CapacitacionMaxOrderByAggregateInput = {
    id_capacitacion?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    codigo?: SortOrder
    titulo?: SortOrder
    tipo?: SortOrder
    instructor?: SortOrder
    fecha?: SortOrder
    duracion_horas?: SortOrder
    ubicacion?: SortOrder
    contenido?: SortOrder
    validez_meses?: SortOrder
    estado?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type CapacitacionMinOrderByAggregateInput = {
    id_capacitacion?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    codigo?: SortOrder
    titulo?: SortOrder
    tipo?: SortOrder
    instructor?: SortOrder
    fecha?: SortOrder
    duracion_horas?: SortOrder
    ubicacion?: SortOrder
    contenido?: SortOrder
    validez_meses?: SortOrder
    estado?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type CapacitacionSumOrderByAggregateInput = {
    duracion_horas?: SortOrder
    validez_meses?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
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

  export type CapacitacionRelationFilter = {
    is?: CapacitacionWhereInput
    isNot?: CapacitacionWhereInput
  }

  export type RegistroCapacitacionCountOrderByAggregateInput = {
    id_registro?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    capacitacion_id?: SortOrder
    empleado_id?: SortOrder
    empleado_nombre?: SortOrder
    asistio?: SortOrder
    calificacion?: SortOrder
    aprobado?: SortOrder
    observaciones?: SortOrder
  }

  export type RegistroCapacitacionAvgOrderByAggregateInput = {
    calificacion?: SortOrder
  }

  export type RegistroCapacitacionMaxOrderByAggregateInput = {
    id_registro?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    capacitacion_id?: SortOrder
    empleado_id?: SortOrder
    empleado_nombre?: SortOrder
    asistio?: SortOrder
    calificacion?: SortOrder
    aprobado?: SortOrder
    observaciones?: SortOrder
  }

  export type RegistroCapacitacionMinOrderByAggregateInput = {
    id_registro?: SortOrder
    tenant_id?: SortOrder
    proyecto_id?: SortOrder
    capacitacion_id?: SortOrder
    empleado_id?: SortOrder
    empleado_nombre?: SortOrder
    asistio?: SortOrder
    calificacion?: SortOrder
    aprobado?: SortOrder
    observaciones?: SortOrder
  }

  export type RegistroCapacitacionSumOrderByAggregateInput = {
    calificacion?: SortOrder
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

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
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

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
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

  export type RegistroCapacitacionCreateNestedManyWithoutCapacitacionInput = {
    create?: XOR<RegistroCapacitacionCreateWithoutCapacitacionInput, RegistroCapacitacionUncheckedCreateWithoutCapacitacionInput> | RegistroCapacitacionCreateWithoutCapacitacionInput[] | RegistroCapacitacionUncheckedCreateWithoutCapacitacionInput[]
    connectOrCreate?: RegistroCapacitacionCreateOrConnectWithoutCapacitacionInput | RegistroCapacitacionCreateOrConnectWithoutCapacitacionInput[]
    createMany?: RegistroCapacitacionCreateManyCapacitacionInputEnvelope
    connect?: RegistroCapacitacionWhereUniqueInput | RegistroCapacitacionWhereUniqueInput[]
  }

  export type RegistroCapacitacionUncheckedCreateNestedManyWithoutCapacitacionInput = {
    create?: XOR<RegistroCapacitacionCreateWithoutCapacitacionInput, RegistroCapacitacionUncheckedCreateWithoutCapacitacionInput> | RegistroCapacitacionCreateWithoutCapacitacionInput[] | RegistroCapacitacionUncheckedCreateWithoutCapacitacionInput[]
    connectOrCreate?: RegistroCapacitacionCreateOrConnectWithoutCapacitacionInput | RegistroCapacitacionCreateOrConnectWithoutCapacitacionInput[]
    createMany?: RegistroCapacitacionCreateManyCapacitacionInputEnvelope
    connect?: RegistroCapacitacionWhereUniqueInput | RegistroCapacitacionWhereUniqueInput[]
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type RegistroCapacitacionUpdateManyWithoutCapacitacionNestedInput = {
    create?: XOR<RegistroCapacitacionCreateWithoutCapacitacionInput, RegistroCapacitacionUncheckedCreateWithoutCapacitacionInput> | RegistroCapacitacionCreateWithoutCapacitacionInput[] | RegistroCapacitacionUncheckedCreateWithoutCapacitacionInput[]
    connectOrCreate?: RegistroCapacitacionCreateOrConnectWithoutCapacitacionInput | RegistroCapacitacionCreateOrConnectWithoutCapacitacionInput[]
    upsert?: RegistroCapacitacionUpsertWithWhereUniqueWithoutCapacitacionInput | RegistroCapacitacionUpsertWithWhereUniqueWithoutCapacitacionInput[]
    createMany?: RegistroCapacitacionCreateManyCapacitacionInputEnvelope
    set?: RegistroCapacitacionWhereUniqueInput | RegistroCapacitacionWhereUniqueInput[]
    disconnect?: RegistroCapacitacionWhereUniqueInput | RegistroCapacitacionWhereUniqueInput[]
    delete?: RegistroCapacitacionWhereUniqueInput | RegistroCapacitacionWhereUniqueInput[]
    connect?: RegistroCapacitacionWhereUniqueInput | RegistroCapacitacionWhereUniqueInput[]
    update?: RegistroCapacitacionUpdateWithWhereUniqueWithoutCapacitacionInput | RegistroCapacitacionUpdateWithWhereUniqueWithoutCapacitacionInput[]
    updateMany?: RegistroCapacitacionUpdateManyWithWhereWithoutCapacitacionInput | RegistroCapacitacionUpdateManyWithWhereWithoutCapacitacionInput[]
    deleteMany?: RegistroCapacitacionScalarWhereInput | RegistroCapacitacionScalarWhereInput[]
  }

  export type RegistroCapacitacionUncheckedUpdateManyWithoutCapacitacionNestedInput = {
    create?: XOR<RegistroCapacitacionCreateWithoutCapacitacionInput, RegistroCapacitacionUncheckedCreateWithoutCapacitacionInput> | RegistroCapacitacionCreateWithoutCapacitacionInput[] | RegistroCapacitacionUncheckedCreateWithoutCapacitacionInput[]
    connectOrCreate?: RegistroCapacitacionCreateOrConnectWithoutCapacitacionInput | RegistroCapacitacionCreateOrConnectWithoutCapacitacionInput[]
    upsert?: RegistroCapacitacionUpsertWithWhereUniqueWithoutCapacitacionInput | RegistroCapacitacionUpsertWithWhereUniqueWithoutCapacitacionInput[]
    createMany?: RegistroCapacitacionCreateManyCapacitacionInputEnvelope
    set?: RegistroCapacitacionWhereUniqueInput | RegistroCapacitacionWhereUniqueInput[]
    disconnect?: RegistroCapacitacionWhereUniqueInput | RegistroCapacitacionWhereUniqueInput[]
    delete?: RegistroCapacitacionWhereUniqueInput | RegistroCapacitacionWhereUniqueInput[]
    connect?: RegistroCapacitacionWhereUniqueInput | RegistroCapacitacionWhereUniqueInput[]
    update?: RegistroCapacitacionUpdateWithWhereUniqueWithoutCapacitacionInput | RegistroCapacitacionUpdateWithWhereUniqueWithoutCapacitacionInput[]
    updateMany?: RegistroCapacitacionUpdateManyWithWhereWithoutCapacitacionInput | RegistroCapacitacionUpdateManyWithWhereWithoutCapacitacionInput[]
    deleteMany?: RegistroCapacitacionScalarWhereInput | RegistroCapacitacionScalarWhereInput[]
  }

  export type CapacitacionCreateNestedOneWithoutRegistrosInput = {
    create?: XOR<CapacitacionCreateWithoutRegistrosInput, CapacitacionUncheckedCreateWithoutRegistrosInput>
    connectOrCreate?: CapacitacionCreateOrConnectWithoutRegistrosInput
    connect?: CapacitacionWhereUniqueInput
  }

  export type NullableDecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string | null
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type CapacitacionUpdateOneRequiredWithoutRegistrosNestedInput = {
    create?: XOR<CapacitacionCreateWithoutRegistrosInput, CapacitacionUncheckedCreateWithoutRegistrosInput>
    connectOrCreate?: CapacitacionCreateOrConnectWithoutRegistrosInput
    upsert?: CapacitacionUpsertWithoutRegistrosInput
    connect?: CapacitacionWhereUniqueInput
    update?: XOR<XOR<CapacitacionUpdateToOneWithWhereWithoutRegistrosInput, CapacitacionUpdateWithoutRegistrosInput>, CapacitacionUncheckedUpdateWithoutRegistrosInput>
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

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
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

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
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

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
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

  export type RegistroCapacitacionCreateWithoutCapacitacionInput = {
    id_registro?: string
    tenant_id: string
    proyecto_id: string
    empleado_id: string
    empleado_nombre: string
    asistio?: boolean
    calificacion?: Decimal | DecimalJsLike | number | string | null
    aprobado?: boolean
    observaciones?: string | null
  }

  export type RegistroCapacitacionUncheckedCreateWithoutCapacitacionInput = {
    id_registro?: string
    tenant_id: string
    proyecto_id: string
    empleado_id: string
    empleado_nombre: string
    asistio?: boolean
    calificacion?: Decimal | DecimalJsLike | number | string | null
    aprobado?: boolean
    observaciones?: string | null
  }

  export type RegistroCapacitacionCreateOrConnectWithoutCapacitacionInput = {
    where: RegistroCapacitacionWhereUniqueInput
    create: XOR<RegistroCapacitacionCreateWithoutCapacitacionInput, RegistroCapacitacionUncheckedCreateWithoutCapacitacionInput>
  }

  export type RegistroCapacitacionCreateManyCapacitacionInputEnvelope = {
    data: RegistroCapacitacionCreateManyCapacitacionInput | RegistroCapacitacionCreateManyCapacitacionInput[]
    skipDuplicates?: boolean
  }

  export type RegistroCapacitacionUpsertWithWhereUniqueWithoutCapacitacionInput = {
    where: RegistroCapacitacionWhereUniqueInput
    update: XOR<RegistroCapacitacionUpdateWithoutCapacitacionInput, RegistroCapacitacionUncheckedUpdateWithoutCapacitacionInput>
    create: XOR<RegistroCapacitacionCreateWithoutCapacitacionInput, RegistroCapacitacionUncheckedCreateWithoutCapacitacionInput>
  }

  export type RegistroCapacitacionUpdateWithWhereUniqueWithoutCapacitacionInput = {
    where: RegistroCapacitacionWhereUniqueInput
    data: XOR<RegistroCapacitacionUpdateWithoutCapacitacionInput, RegistroCapacitacionUncheckedUpdateWithoutCapacitacionInput>
  }

  export type RegistroCapacitacionUpdateManyWithWhereWithoutCapacitacionInput = {
    where: RegistroCapacitacionScalarWhereInput
    data: XOR<RegistroCapacitacionUpdateManyMutationInput, RegistroCapacitacionUncheckedUpdateManyWithoutCapacitacionInput>
  }

  export type RegistroCapacitacionScalarWhereInput = {
    AND?: RegistroCapacitacionScalarWhereInput | RegistroCapacitacionScalarWhereInput[]
    OR?: RegistroCapacitacionScalarWhereInput[]
    NOT?: RegistroCapacitacionScalarWhereInput | RegistroCapacitacionScalarWhereInput[]
    id_registro?: UuidFilter<"RegistroCapacitacion"> | string
    tenant_id?: UuidFilter<"RegistroCapacitacion"> | string
    proyecto_id?: UuidFilter<"RegistroCapacitacion"> | string
    capacitacion_id?: UuidFilter<"RegistroCapacitacion"> | string
    empleado_id?: UuidFilter<"RegistroCapacitacion"> | string
    empleado_nombre?: StringFilter<"RegistroCapacitacion"> | string
    asistio?: BoolFilter<"RegistroCapacitacion"> | boolean
    calificacion?: DecimalNullableFilter<"RegistroCapacitacion"> | Decimal | DecimalJsLike | number | string | null
    aprobado?: BoolFilter<"RegistroCapacitacion"> | boolean
    observaciones?: StringNullableFilter<"RegistroCapacitacion"> | string | null
  }

  export type CapacitacionCreateWithoutRegistrosInput = {
    id_capacitacion?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    titulo: string
    tipo: string
    instructor: string
    fecha: Date | string
    duracion_horas: Decimal | DecimalJsLike | number | string
    ubicacion?: string | null
    contenido?: string | null
    validez_meses?: number | null
    estado?: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type CapacitacionUncheckedCreateWithoutRegistrosInput = {
    id_capacitacion?: string
    tenant_id: string
    proyecto_id: string
    codigo: string
    titulo: string
    tipo: string
    instructor: string
    fecha: Date | string
    duracion_horas: Decimal | DecimalJsLike | number | string
    ubicacion?: string | null
    contenido?: string | null
    validez_meses?: number | null
    estado?: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type CapacitacionCreateOrConnectWithoutRegistrosInput = {
    where: CapacitacionWhereUniqueInput
    create: XOR<CapacitacionCreateWithoutRegistrosInput, CapacitacionUncheckedCreateWithoutRegistrosInput>
  }

  export type CapacitacionUpsertWithoutRegistrosInput = {
    update: XOR<CapacitacionUpdateWithoutRegistrosInput, CapacitacionUncheckedUpdateWithoutRegistrosInput>
    create: XOR<CapacitacionCreateWithoutRegistrosInput, CapacitacionUncheckedCreateWithoutRegistrosInput>
    where?: CapacitacionWhereInput
  }

  export type CapacitacionUpdateToOneWithWhereWithoutRegistrosInput = {
    where?: CapacitacionWhereInput
    data: XOR<CapacitacionUpdateWithoutRegistrosInput, CapacitacionUncheckedUpdateWithoutRegistrosInput>
  }

  export type CapacitacionUpdateWithoutRegistrosInput = {
    id_capacitacion?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    instructor?: StringFieldUpdateOperationsInput | string
    fecha?: DateTimeFieldUpdateOperationsInput | Date | string
    duracion_horas?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    ubicacion?: NullableStringFieldUpdateOperationsInput | string | null
    contenido?: NullableStringFieldUpdateOperationsInput | string | null
    validez_meses?: NullableIntFieldUpdateOperationsInput | number | null
    estado?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CapacitacionUncheckedUpdateWithoutRegistrosInput = {
    id_capacitacion?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    instructor?: StringFieldUpdateOperationsInput | string
    fecha?: DateTimeFieldUpdateOperationsInput | Date | string
    duracion_horas?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    ubicacion?: NullableStringFieldUpdateOperationsInput | string | null
    contenido?: NullableStringFieldUpdateOperationsInput | string | null
    validez_meses?: NullableIntFieldUpdateOperationsInput | number | null
    estado?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RegistroCapacitacionCreateManyCapacitacionInput = {
    id_registro?: string
    tenant_id: string
    proyecto_id: string
    empleado_id: string
    empleado_nombre: string
    asistio?: boolean
    calificacion?: Decimal | DecimalJsLike | number | string | null
    aprobado?: boolean
    observaciones?: string | null
  }

  export type RegistroCapacitacionUpdateWithoutCapacitacionInput = {
    id_registro?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    empleado_id?: StringFieldUpdateOperationsInput | string
    empleado_nombre?: StringFieldUpdateOperationsInput | string
    asistio?: BoolFieldUpdateOperationsInput | boolean
    calificacion?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    aprobado?: BoolFieldUpdateOperationsInput | boolean
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RegistroCapacitacionUncheckedUpdateWithoutCapacitacionInput = {
    id_registro?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    empleado_id?: StringFieldUpdateOperationsInput | string
    empleado_nombre?: StringFieldUpdateOperationsInput | string
    asistio?: BoolFieldUpdateOperationsInput | boolean
    calificacion?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    aprobado?: BoolFieldUpdateOperationsInput | boolean
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RegistroCapacitacionUncheckedUpdateManyWithoutCapacitacionInput = {
    id_registro?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    proyecto_id?: StringFieldUpdateOperationsInput | string
    empleado_id?: StringFieldUpdateOperationsInput | string
    empleado_nombre?: StringFieldUpdateOperationsInput | string
    asistio?: BoolFieldUpdateOperationsInput | boolean
    calificacion?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    aprobado?: BoolFieldUpdateOperationsInput | boolean
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use CapacitacionCountOutputTypeDefaultArgs instead
     */
    export type CapacitacionCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CapacitacionCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use IncidenteDefaultArgs instead
     */
    export type IncidenteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = IncidenteDefaultArgs<ExtArgs>
    /**
     * @deprecated Use InspeccionSeguridadDefaultArgs instead
     */
    export type InspeccionSeguridadArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = InspeccionSeguridadDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PermisoTrabajoDefaultArgs instead
     */
    export type PermisoTrabajoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PermisoTrabajoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CapacitacionDefaultArgs instead
     */
    export type CapacitacionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CapacitacionDefaultArgs<ExtArgs>
    /**
     * @deprecated Use RegistroCapacitacionDefaultArgs instead
     */
    export type RegistroCapacitacionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = RegistroCapacitacionDefaultArgs<ExtArgs>

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