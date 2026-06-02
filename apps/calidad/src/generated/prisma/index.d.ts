
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
 * Model Documento
 * 
 */
export type Documento = $Result.DefaultSelection<Prisma.$DocumentoPayload>
/**
 * Model VersionDocumento
 * 
 */
export type VersionDocumento = $Result.DefaultSelection<Prisma.$VersionDocumentoPayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Documentos
 * const documentos = await prisma.documento.findMany()
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
   * // Fetch zero or more Documentos
   * const documentos = await prisma.documento.findMany()
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
   * `prisma.documento`: Exposes CRUD operations for the **Documento** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Documentos
    * const documentos = await prisma.documento.findMany()
    * ```
    */
  get documento(): Prisma.DocumentoDelegate<ExtArgs>;

  /**
   * `prisma.versionDocumento`: Exposes CRUD operations for the **VersionDocumento** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more VersionDocumentos
    * const versionDocumentos = await prisma.versionDocumento.findMany()
    * ```
    */
  get versionDocumento(): Prisma.VersionDocumentoDelegate<ExtArgs>;
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
    Documento: 'Documento',
    VersionDocumento: 'VersionDocumento'
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
      modelProps: "documento" | "versionDocumento"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Documento: {
        payload: Prisma.$DocumentoPayload<ExtArgs>
        fields: Prisma.DocumentoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DocumentoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DocumentoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentoPayload>
          }
          findFirst: {
            args: Prisma.DocumentoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DocumentoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentoPayload>
          }
          findMany: {
            args: Prisma.DocumentoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentoPayload>[]
          }
          create: {
            args: Prisma.DocumentoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentoPayload>
          }
          createMany: {
            args: Prisma.DocumentoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DocumentoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentoPayload>[]
          }
          delete: {
            args: Prisma.DocumentoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentoPayload>
          }
          update: {
            args: Prisma.DocumentoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentoPayload>
          }
          deleteMany: {
            args: Prisma.DocumentoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DocumentoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.DocumentoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentoPayload>
          }
          aggregate: {
            args: Prisma.DocumentoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDocumento>
          }
          groupBy: {
            args: Prisma.DocumentoGroupByArgs<ExtArgs>
            result: $Utils.Optional<DocumentoGroupByOutputType>[]
          }
          count: {
            args: Prisma.DocumentoCountArgs<ExtArgs>
            result: $Utils.Optional<DocumentoCountAggregateOutputType> | number
          }
        }
      }
      VersionDocumento: {
        payload: Prisma.$VersionDocumentoPayload<ExtArgs>
        fields: Prisma.VersionDocumentoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.VersionDocumentoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VersionDocumentoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.VersionDocumentoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VersionDocumentoPayload>
          }
          findFirst: {
            args: Prisma.VersionDocumentoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VersionDocumentoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.VersionDocumentoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VersionDocumentoPayload>
          }
          findMany: {
            args: Prisma.VersionDocumentoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VersionDocumentoPayload>[]
          }
          create: {
            args: Prisma.VersionDocumentoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VersionDocumentoPayload>
          }
          createMany: {
            args: Prisma.VersionDocumentoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.VersionDocumentoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VersionDocumentoPayload>[]
          }
          delete: {
            args: Prisma.VersionDocumentoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VersionDocumentoPayload>
          }
          update: {
            args: Prisma.VersionDocumentoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VersionDocumentoPayload>
          }
          deleteMany: {
            args: Prisma.VersionDocumentoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.VersionDocumentoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.VersionDocumentoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VersionDocumentoPayload>
          }
          aggregate: {
            args: Prisma.VersionDocumentoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateVersionDocumento>
          }
          groupBy: {
            args: Prisma.VersionDocumentoGroupByArgs<ExtArgs>
            result: $Utils.Optional<VersionDocumentoGroupByOutputType>[]
          }
          count: {
            args: Prisma.VersionDocumentoCountArgs<ExtArgs>
            result: $Utils.Optional<VersionDocumentoCountAggregateOutputType> | number
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
   * Count Type DocumentoCountOutputType
   */

  export type DocumentoCountOutputType = {
    versiones: number
  }

  export type DocumentoCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    versiones?: boolean | DocumentoCountOutputTypeCountVersionesArgs
  }

  // Custom InputTypes
  /**
   * DocumentoCountOutputType without action
   */
  export type DocumentoCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentoCountOutputType
     */
    select?: DocumentoCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * DocumentoCountOutputType without action
   */
  export type DocumentoCountOutputTypeCountVersionesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VersionDocumentoWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Documento
   */

  export type AggregateDocumento = {
    _count: DocumentoCountAggregateOutputType | null
    _min: DocumentoMinAggregateOutputType | null
    _max: DocumentoMaxAggregateOutputType | null
  }

  export type DocumentoMinAggregateOutputType = {
    id_documento: string | null
    tenant_id: string | null
    codigo: string | null
    titulo: string | null
    tipo: string | null
    descripcion: string | null
    proyecto_id: string | null
    responsable_id: string | null
    estado_actual: string | null
    version_actual: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type DocumentoMaxAggregateOutputType = {
    id_documento: string | null
    tenant_id: string | null
    codigo: string | null
    titulo: string | null
    tipo: string | null
    descripcion: string | null
    proyecto_id: string | null
    responsable_id: string | null
    estado_actual: string | null
    version_actual: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type DocumentoCountAggregateOutputType = {
    id_documento: number
    tenant_id: number
    codigo: number
    titulo: number
    tipo: number
    descripcion: number
    proyecto_id: number
    responsable_id: number
    estado_actual: number
    version_actual: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type DocumentoMinAggregateInputType = {
    id_documento?: true
    tenant_id?: true
    codigo?: true
    titulo?: true
    tipo?: true
    descripcion?: true
    proyecto_id?: true
    responsable_id?: true
    estado_actual?: true
    version_actual?: true
    created_at?: true
    updated_at?: true
  }

  export type DocumentoMaxAggregateInputType = {
    id_documento?: true
    tenant_id?: true
    codigo?: true
    titulo?: true
    tipo?: true
    descripcion?: true
    proyecto_id?: true
    responsable_id?: true
    estado_actual?: true
    version_actual?: true
    created_at?: true
    updated_at?: true
  }

  export type DocumentoCountAggregateInputType = {
    id_documento?: true
    tenant_id?: true
    codigo?: true
    titulo?: true
    tipo?: true
    descripcion?: true
    proyecto_id?: true
    responsable_id?: true
    estado_actual?: true
    version_actual?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type DocumentoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Documento to aggregate.
     */
    where?: DocumentoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Documentos to fetch.
     */
    orderBy?: DocumentoOrderByWithRelationInput | DocumentoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DocumentoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Documentos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Documentos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Documentos
    **/
    _count?: true | DocumentoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DocumentoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DocumentoMaxAggregateInputType
  }

  export type GetDocumentoAggregateType<T extends DocumentoAggregateArgs> = {
        [P in keyof T & keyof AggregateDocumento]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDocumento[P]>
      : GetScalarType<T[P], AggregateDocumento[P]>
  }




  export type DocumentoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DocumentoWhereInput
    orderBy?: DocumentoOrderByWithAggregationInput | DocumentoOrderByWithAggregationInput[]
    by: DocumentoScalarFieldEnum[] | DocumentoScalarFieldEnum
    having?: DocumentoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DocumentoCountAggregateInputType | true
    _min?: DocumentoMinAggregateInputType
    _max?: DocumentoMaxAggregateInputType
  }

  export type DocumentoGroupByOutputType = {
    id_documento: string
    tenant_id: string
    codigo: string
    titulo: string
    tipo: string
    descripcion: string | null
    proyecto_id: string | null
    responsable_id: string
    estado_actual: string
    version_actual: string | null
    created_at: Date
    updated_at: Date
    _count: DocumentoCountAggregateOutputType | null
    _min: DocumentoMinAggregateOutputType | null
    _max: DocumentoMaxAggregateOutputType | null
  }

  type GetDocumentoGroupByPayload<T extends DocumentoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DocumentoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DocumentoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DocumentoGroupByOutputType[P]>
            : GetScalarType<T[P], DocumentoGroupByOutputType[P]>
        }
      >
    >


  export type DocumentoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_documento?: boolean
    tenant_id?: boolean
    codigo?: boolean
    titulo?: boolean
    tipo?: boolean
    descripcion?: boolean
    proyecto_id?: boolean
    responsable_id?: boolean
    estado_actual?: boolean
    version_actual?: boolean
    created_at?: boolean
    updated_at?: boolean
    versiones?: boolean | Documento$versionesArgs<ExtArgs>
    _count?: boolean | DocumentoCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["documento"]>

  export type DocumentoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_documento?: boolean
    tenant_id?: boolean
    codigo?: boolean
    titulo?: boolean
    tipo?: boolean
    descripcion?: boolean
    proyecto_id?: boolean
    responsable_id?: boolean
    estado_actual?: boolean
    version_actual?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["documento"]>

  export type DocumentoSelectScalar = {
    id_documento?: boolean
    tenant_id?: boolean
    codigo?: boolean
    titulo?: boolean
    tipo?: boolean
    descripcion?: boolean
    proyecto_id?: boolean
    responsable_id?: boolean
    estado_actual?: boolean
    version_actual?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type DocumentoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    versiones?: boolean | Documento$versionesArgs<ExtArgs>
    _count?: boolean | DocumentoCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type DocumentoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $DocumentoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Documento"
    objects: {
      versiones: Prisma.$VersionDocumentoPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id_documento: string
      tenant_id: string
      codigo: string
      titulo: string
      tipo: string
      descripcion: string | null
      proyecto_id: string | null
      responsable_id: string
      estado_actual: string
      version_actual: string | null
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["documento"]>
    composites: {}
  }

  type DocumentoGetPayload<S extends boolean | null | undefined | DocumentoDefaultArgs> = $Result.GetResult<Prisma.$DocumentoPayload, S>

  type DocumentoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<DocumentoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: DocumentoCountAggregateInputType | true
    }

  export interface DocumentoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Documento'], meta: { name: 'Documento' } }
    /**
     * Find zero or one Documento that matches the filter.
     * @param {DocumentoFindUniqueArgs} args - Arguments to find a Documento
     * @example
     * // Get one Documento
     * const documento = await prisma.documento.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DocumentoFindUniqueArgs>(args: SelectSubset<T, DocumentoFindUniqueArgs<ExtArgs>>): Prisma__DocumentoClient<$Result.GetResult<Prisma.$DocumentoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Documento that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {DocumentoFindUniqueOrThrowArgs} args - Arguments to find a Documento
     * @example
     * // Get one Documento
     * const documento = await prisma.documento.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DocumentoFindUniqueOrThrowArgs>(args: SelectSubset<T, DocumentoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DocumentoClient<$Result.GetResult<Prisma.$DocumentoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Documento that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentoFindFirstArgs} args - Arguments to find a Documento
     * @example
     * // Get one Documento
     * const documento = await prisma.documento.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DocumentoFindFirstArgs>(args?: SelectSubset<T, DocumentoFindFirstArgs<ExtArgs>>): Prisma__DocumentoClient<$Result.GetResult<Prisma.$DocumentoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Documento that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentoFindFirstOrThrowArgs} args - Arguments to find a Documento
     * @example
     * // Get one Documento
     * const documento = await prisma.documento.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DocumentoFindFirstOrThrowArgs>(args?: SelectSubset<T, DocumentoFindFirstOrThrowArgs<ExtArgs>>): Prisma__DocumentoClient<$Result.GetResult<Prisma.$DocumentoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Documentos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Documentos
     * const documentos = await prisma.documento.findMany()
     * 
     * // Get first 10 Documentos
     * const documentos = await prisma.documento.findMany({ take: 10 })
     * 
     * // Only select the `id_documento`
     * const documentoWithId_documentoOnly = await prisma.documento.findMany({ select: { id_documento: true } })
     * 
     */
    findMany<T extends DocumentoFindManyArgs>(args?: SelectSubset<T, DocumentoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DocumentoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Documento.
     * @param {DocumentoCreateArgs} args - Arguments to create a Documento.
     * @example
     * // Create one Documento
     * const Documento = await prisma.documento.create({
     *   data: {
     *     // ... data to create a Documento
     *   }
     * })
     * 
     */
    create<T extends DocumentoCreateArgs>(args: SelectSubset<T, DocumentoCreateArgs<ExtArgs>>): Prisma__DocumentoClient<$Result.GetResult<Prisma.$DocumentoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Documentos.
     * @param {DocumentoCreateManyArgs} args - Arguments to create many Documentos.
     * @example
     * // Create many Documentos
     * const documento = await prisma.documento.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DocumentoCreateManyArgs>(args?: SelectSubset<T, DocumentoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Documentos and returns the data saved in the database.
     * @param {DocumentoCreateManyAndReturnArgs} args - Arguments to create many Documentos.
     * @example
     * // Create many Documentos
     * const documento = await prisma.documento.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Documentos and only return the `id_documento`
     * const documentoWithId_documentoOnly = await prisma.documento.createManyAndReturn({ 
     *   select: { id_documento: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DocumentoCreateManyAndReturnArgs>(args?: SelectSubset<T, DocumentoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DocumentoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Documento.
     * @param {DocumentoDeleteArgs} args - Arguments to delete one Documento.
     * @example
     * // Delete one Documento
     * const Documento = await prisma.documento.delete({
     *   where: {
     *     // ... filter to delete one Documento
     *   }
     * })
     * 
     */
    delete<T extends DocumentoDeleteArgs>(args: SelectSubset<T, DocumentoDeleteArgs<ExtArgs>>): Prisma__DocumentoClient<$Result.GetResult<Prisma.$DocumentoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Documento.
     * @param {DocumentoUpdateArgs} args - Arguments to update one Documento.
     * @example
     * // Update one Documento
     * const documento = await prisma.documento.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DocumentoUpdateArgs>(args: SelectSubset<T, DocumentoUpdateArgs<ExtArgs>>): Prisma__DocumentoClient<$Result.GetResult<Prisma.$DocumentoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Documentos.
     * @param {DocumentoDeleteManyArgs} args - Arguments to filter Documentos to delete.
     * @example
     * // Delete a few Documentos
     * const { count } = await prisma.documento.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DocumentoDeleteManyArgs>(args?: SelectSubset<T, DocumentoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Documentos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Documentos
     * const documento = await prisma.documento.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DocumentoUpdateManyArgs>(args: SelectSubset<T, DocumentoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Documento.
     * @param {DocumentoUpsertArgs} args - Arguments to update or create a Documento.
     * @example
     * // Update or create a Documento
     * const documento = await prisma.documento.upsert({
     *   create: {
     *     // ... data to create a Documento
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Documento we want to update
     *   }
     * })
     */
    upsert<T extends DocumentoUpsertArgs>(args: SelectSubset<T, DocumentoUpsertArgs<ExtArgs>>): Prisma__DocumentoClient<$Result.GetResult<Prisma.$DocumentoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Documentos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentoCountArgs} args - Arguments to filter Documentos to count.
     * @example
     * // Count the number of Documentos
     * const count = await prisma.documento.count({
     *   where: {
     *     // ... the filter for the Documentos we want to count
     *   }
     * })
    **/
    count<T extends DocumentoCountArgs>(
      args?: Subset<T, DocumentoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DocumentoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Documento.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends DocumentoAggregateArgs>(args: Subset<T, DocumentoAggregateArgs>): Prisma.PrismaPromise<GetDocumentoAggregateType<T>>

    /**
     * Group by Documento.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentoGroupByArgs} args - Group by arguments.
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
      T extends DocumentoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DocumentoGroupByArgs['orderBy'] }
        : { orderBy?: DocumentoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, DocumentoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDocumentoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Documento model
   */
  readonly fields: DocumentoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Documento.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DocumentoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    versiones<T extends Documento$versionesArgs<ExtArgs> = {}>(args?: Subset<T, Documento$versionesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VersionDocumentoPayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the Documento model
   */ 
  interface DocumentoFieldRefs {
    readonly id_documento: FieldRef<"Documento", 'String'>
    readonly tenant_id: FieldRef<"Documento", 'String'>
    readonly codigo: FieldRef<"Documento", 'String'>
    readonly titulo: FieldRef<"Documento", 'String'>
    readonly tipo: FieldRef<"Documento", 'String'>
    readonly descripcion: FieldRef<"Documento", 'String'>
    readonly proyecto_id: FieldRef<"Documento", 'String'>
    readonly responsable_id: FieldRef<"Documento", 'String'>
    readonly estado_actual: FieldRef<"Documento", 'String'>
    readonly version_actual: FieldRef<"Documento", 'String'>
    readonly created_at: FieldRef<"Documento", 'DateTime'>
    readonly updated_at: FieldRef<"Documento", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Documento findUnique
   */
  export type DocumentoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Documento
     */
    select?: DocumentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentoInclude<ExtArgs> | null
    /**
     * Filter, which Documento to fetch.
     */
    where: DocumentoWhereUniqueInput
  }

  /**
   * Documento findUniqueOrThrow
   */
  export type DocumentoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Documento
     */
    select?: DocumentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentoInclude<ExtArgs> | null
    /**
     * Filter, which Documento to fetch.
     */
    where: DocumentoWhereUniqueInput
  }

  /**
   * Documento findFirst
   */
  export type DocumentoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Documento
     */
    select?: DocumentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentoInclude<ExtArgs> | null
    /**
     * Filter, which Documento to fetch.
     */
    where?: DocumentoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Documentos to fetch.
     */
    orderBy?: DocumentoOrderByWithRelationInput | DocumentoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Documentos.
     */
    cursor?: DocumentoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Documentos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Documentos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Documentos.
     */
    distinct?: DocumentoScalarFieldEnum | DocumentoScalarFieldEnum[]
  }

  /**
   * Documento findFirstOrThrow
   */
  export type DocumentoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Documento
     */
    select?: DocumentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentoInclude<ExtArgs> | null
    /**
     * Filter, which Documento to fetch.
     */
    where?: DocumentoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Documentos to fetch.
     */
    orderBy?: DocumentoOrderByWithRelationInput | DocumentoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Documentos.
     */
    cursor?: DocumentoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Documentos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Documentos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Documentos.
     */
    distinct?: DocumentoScalarFieldEnum | DocumentoScalarFieldEnum[]
  }

  /**
   * Documento findMany
   */
  export type DocumentoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Documento
     */
    select?: DocumentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentoInclude<ExtArgs> | null
    /**
     * Filter, which Documentos to fetch.
     */
    where?: DocumentoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Documentos to fetch.
     */
    orderBy?: DocumentoOrderByWithRelationInput | DocumentoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Documentos.
     */
    cursor?: DocumentoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Documentos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Documentos.
     */
    skip?: number
    distinct?: DocumentoScalarFieldEnum | DocumentoScalarFieldEnum[]
  }

  /**
   * Documento create
   */
  export type DocumentoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Documento
     */
    select?: DocumentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentoInclude<ExtArgs> | null
    /**
     * The data needed to create a Documento.
     */
    data: XOR<DocumentoCreateInput, DocumentoUncheckedCreateInput>
  }

  /**
   * Documento createMany
   */
  export type DocumentoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Documentos.
     */
    data: DocumentoCreateManyInput | DocumentoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Documento createManyAndReturn
   */
  export type DocumentoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Documento
     */
    select?: DocumentoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Documentos.
     */
    data: DocumentoCreateManyInput | DocumentoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Documento update
   */
  export type DocumentoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Documento
     */
    select?: DocumentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentoInclude<ExtArgs> | null
    /**
     * The data needed to update a Documento.
     */
    data: XOR<DocumentoUpdateInput, DocumentoUncheckedUpdateInput>
    /**
     * Choose, which Documento to update.
     */
    where: DocumentoWhereUniqueInput
  }

  /**
   * Documento updateMany
   */
  export type DocumentoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Documentos.
     */
    data: XOR<DocumentoUpdateManyMutationInput, DocumentoUncheckedUpdateManyInput>
    /**
     * Filter which Documentos to update
     */
    where?: DocumentoWhereInput
  }

  /**
   * Documento upsert
   */
  export type DocumentoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Documento
     */
    select?: DocumentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentoInclude<ExtArgs> | null
    /**
     * The filter to search for the Documento to update in case it exists.
     */
    where: DocumentoWhereUniqueInput
    /**
     * In case the Documento found by the `where` argument doesn't exist, create a new Documento with this data.
     */
    create: XOR<DocumentoCreateInput, DocumentoUncheckedCreateInput>
    /**
     * In case the Documento was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DocumentoUpdateInput, DocumentoUncheckedUpdateInput>
  }

  /**
   * Documento delete
   */
  export type DocumentoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Documento
     */
    select?: DocumentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentoInclude<ExtArgs> | null
    /**
     * Filter which Documento to delete.
     */
    where: DocumentoWhereUniqueInput
  }

  /**
   * Documento deleteMany
   */
  export type DocumentoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Documentos to delete
     */
    where?: DocumentoWhereInput
  }

  /**
   * Documento.versiones
   */
  export type Documento$versionesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VersionDocumento
     */
    select?: VersionDocumentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VersionDocumentoInclude<ExtArgs> | null
    where?: VersionDocumentoWhereInput
    orderBy?: VersionDocumentoOrderByWithRelationInput | VersionDocumentoOrderByWithRelationInput[]
    cursor?: VersionDocumentoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: VersionDocumentoScalarFieldEnum | VersionDocumentoScalarFieldEnum[]
  }

  /**
   * Documento without action
   */
  export type DocumentoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Documento
     */
    select?: DocumentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentoInclude<ExtArgs> | null
  }


  /**
   * Model VersionDocumento
   */

  export type AggregateVersionDocumento = {
    _count: VersionDocumentoCountAggregateOutputType | null
    _avg: VersionDocumentoAvgAggregateOutputType | null
    _sum: VersionDocumentoSumAggregateOutputType | null
    _min: VersionDocumentoMinAggregateOutputType | null
    _max: VersionDocumentoMaxAggregateOutputType | null
  }

  export type VersionDocumentoAvgAggregateOutputType = {
    archivo_tamano: number | null
  }

  export type VersionDocumentoSumAggregateOutputType = {
    archivo_tamano: number | null
  }

  export type VersionDocumentoMinAggregateOutputType = {
    id_version: string | null
    tenant_id: string | null
    documento_id: string | null
    numero_version: string | null
    estado: string | null
    cambios: string | null
    archivo_nombre: string | null
    archivo_ruta: string | null
    archivo_mime: string | null
    archivo_tamano: number | null
    creado_por: string | null
    revisado_por: string | null
    aprobado_por: string | null
    fecha_emision: Date | null
    fecha_obsoleto: Date | null
    created_at: Date | null
  }

  export type VersionDocumentoMaxAggregateOutputType = {
    id_version: string | null
    tenant_id: string | null
    documento_id: string | null
    numero_version: string | null
    estado: string | null
    cambios: string | null
    archivo_nombre: string | null
    archivo_ruta: string | null
    archivo_mime: string | null
    archivo_tamano: number | null
    creado_por: string | null
    revisado_por: string | null
    aprobado_por: string | null
    fecha_emision: Date | null
    fecha_obsoleto: Date | null
    created_at: Date | null
  }

  export type VersionDocumentoCountAggregateOutputType = {
    id_version: number
    tenant_id: number
    documento_id: number
    numero_version: number
    estado: number
    cambios: number
    archivo_nombre: number
    archivo_ruta: number
    archivo_mime: number
    archivo_tamano: number
    creado_por: number
    revisado_por: number
    aprobado_por: number
    fecha_emision: number
    fecha_obsoleto: number
    created_at: number
    _all: number
  }


  export type VersionDocumentoAvgAggregateInputType = {
    archivo_tamano?: true
  }

  export type VersionDocumentoSumAggregateInputType = {
    archivo_tamano?: true
  }

  export type VersionDocumentoMinAggregateInputType = {
    id_version?: true
    tenant_id?: true
    documento_id?: true
    numero_version?: true
    estado?: true
    cambios?: true
    archivo_nombre?: true
    archivo_ruta?: true
    archivo_mime?: true
    archivo_tamano?: true
    creado_por?: true
    revisado_por?: true
    aprobado_por?: true
    fecha_emision?: true
    fecha_obsoleto?: true
    created_at?: true
  }

  export type VersionDocumentoMaxAggregateInputType = {
    id_version?: true
    tenant_id?: true
    documento_id?: true
    numero_version?: true
    estado?: true
    cambios?: true
    archivo_nombre?: true
    archivo_ruta?: true
    archivo_mime?: true
    archivo_tamano?: true
    creado_por?: true
    revisado_por?: true
    aprobado_por?: true
    fecha_emision?: true
    fecha_obsoleto?: true
    created_at?: true
  }

  export type VersionDocumentoCountAggregateInputType = {
    id_version?: true
    tenant_id?: true
    documento_id?: true
    numero_version?: true
    estado?: true
    cambios?: true
    archivo_nombre?: true
    archivo_ruta?: true
    archivo_mime?: true
    archivo_tamano?: true
    creado_por?: true
    revisado_por?: true
    aprobado_por?: true
    fecha_emision?: true
    fecha_obsoleto?: true
    created_at?: true
    _all?: true
  }

  export type VersionDocumentoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which VersionDocumento to aggregate.
     */
    where?: VersionDocumentoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VersionDocumentos to fetch.
     */
    orderBy?: VersionDocumentoOrderByWithRelationInput | VersionDocumentoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: VersionDocumentoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VersionDocumentos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VersionDocumentos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned VersionDocumentos
    **/
    _count?: true | VersionDocumentoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: VersionDocumentoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: VersionDocumentoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: VersionDocumentoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: VersionDocumentoMaxAggregateInputType
  }

  export type GetVersionDocumentoAggregateType<T extends VersionDocumentoAggregateArgs> = {
        [P in keyof T & keyof AggregateVersionDocumento]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateVersionDocumento[P]>
      : GetScalarType<T[P], AggregateVersionDocumento[P]>
  }




  export type VersionDocumentoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VersionDocumentoWhereInput
    orderBy?: VersionDocumentoOrderByWithAggregationInput | VersionDocumentoOrderByWithAggregationInput[]
    by: VersionDocumentoScalarFieldEnum[] | VersionDocumentoScalarFieldEnum
    having?: VersionDocumentoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: VersionDocumentoCountAggregateInputType | true
    _avg?: VersionDocumentoAvgAggregateInputType
    _sum?: VersionDocumentoSumAggregateInputType
    _min?: VersionDocumentoMinAggregateInputType
    _max?: VersionDocumentoMaxAggregateInputType
  }

  export type VersionDocumentoGroupByOutputType = {
    id_version: string
    tenant_id: string
    documento_id: string
    numero_version: string
    estado: string
    cambios: string | null
    archivo_nombre: string | null
    archivo_ruta: string | null
    archivo_mime: string | null
    archivo_tamano: number | null
    creado_por: string
    revisado_por: string | null
    aprobado_por: string | null
    fecha_emision: Date | null
    fecha_obsoleto: Date | null
    created_at: Date
    _count: VersionDocumentoCountAggregateOutputType | null
    _avg: VersionDocumentoAvgAggregateOutputType | null
    _sum: VersionDocumentoSumAggregateOutputType | null
    _min: VersionDocumentoMinAggregateOutputType | null
    _max: VersionDocumentoMaxAggregateOutputType | null
  }

  type GetVersionDocumentoGroupByPayload<T extends VersionDocumentoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<VersionDocumentoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof VersionDocumentoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], VersionDocumentoGroupByOutputType[P]>
            : GetScalarType<T[P], VersionDocumentoGroupByOutputType[P]>
        }
      >
    >


  export type VersionDocumentoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_version?: boolean
    tenant_id?: boolean
    documento_id?: boolean
    numero_version?: boolean
    estado?: boolean
    cambios?: boolean
    archivo_nombre?: boolean
    archivo_ruta?: boolean
    archivo_mime?: boolean
    archivo_tamano?: boolean
    creado_por?: boolean
    revisado_por?: boolean
    aprobado_por?: boolean
    fecha_emision?: boolean
    fecha_obsoleto?: boolean
    created_at?: boolean
    documento?: boolean | DocumentoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["versionDocumento"]>

  export type VersionDocumentoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_version?: boolean
    tenant_id?: boolean
    documento_id?: boolean
    numero_version?: boolean
    estado?: boolean
    cambios?: boolean
    archivo_nombre?: boolean
    archivo_ruta?: boolean
    archivo_mime?: boolean
    archivo_tamano?: boolean
    creado_por?: boolean
    revisado_por?: boolean
    aprobado_por?: boolean
    fecha_emision?: boolean
    fecha_obsoleto?: boolean
    created_at?: boolean
    documento?: boolean | DocumentoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["versionDocumento"]>

  export type VersionDocumentoSelectScalar = {
    id_version?: boolean
    tenant_id?: boolean
    documento_id?: boolean
    numero_version?: boolean
    estado?: boolean
    cambios?: boolean
    archivo_nombre?: boolean
    archivo_ruta?: boolean
    archivo_mime?: boolean
    archivo_tamano?: boolean
    creado_por?: boolean
    revisado_por?: boolean
    aprobado_por?: boolean
    fecha_emision?: boolean
    fecha_obsoleto?: boolean
    created_at?: boolean
  }

  export type VersionDocumentoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    documento?: boolean | DocumentoDefaultArgs<ExtArgs>
  }
  export type VersionDocumentoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    documento?: boolean | DocumentoDefaultArgs<ExtArgs>
  }

  export type $VersionDocumentoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "VersionDocumento"
    objects: {
      documento: Prisma.$DocumentoPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id_version: string
      tenant_id: string
      documento_id: string
      numero_version: string
      estado: string
      cambios: string | null
      archivo_nombre: string | null
      archivo_ruta: string | null
      archivo_mime: string | null
      archivo_tamano: number | null
      creado_por: string
      revisado_por: string | null
      aprobado_por: string | null
      fecha_emision: Date | null
      fecha_obsoleto: Date | null
      created_at: Date
    }, ExtArgs["result"]["versionDocumento"]>
    composites: {}
  }

  type VersionDocumentoGetPayload<S extends boolean | null | undefined | VersionDocumentoDefaultArgs> = $Result.GetResult<Prisma.$VersionDocumentoPayload, S>

  type VersionDocumentoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<VersionDocumentoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: VersionDocumentoCountAggregateInputType | true
    }

  export interface VersionDocumentoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['VersionDocumento'], meta: { name: 'VersionDocumento' } }
    /**
     * Find zero or one VersionDocumento that matches the filter.
     * @param {VersionDocumentoFindUniqueArgs} args - Arguments to find a VersionDocumento
     * @example
     * // Get one VersionDocumento
     * const versionDocumento = await prisma.versionDocumento.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends VersionDocumentoFindUniqueArgs>(args: SelectSubset<T, VersionDocumentoFindUniqueArgs<ExtArgs>>): Prisma__VersionDocumentoClient<$Result.GetResult<Prisma.$VersionDocumentoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one VersionDocumento that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {VersionDocumentoFindUniqueOrThrowArgs} args - Arguments to find a VersionDocumento
     * @example
     * // Get one VersionDocumento
     * const versionDocumento = await prisma.versionDocumento.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends VersionDocumentoFindUniqueOrThrowArgs>(args: SelectSubset<T, VersionDocumentoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__VersionDocumentoClient<$Result.GetResult<Prisma.$VersionDocumentoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first VersionDocumento that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VersionDocumentoFindFirstArgs} args - Arguments to find a VersionDocumento
     * @example
     * // Get one VersionDocumento
     * const versionDocumento = await prisma.versionDocumento.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends VersionDocumentoFindFirstArgs>(args?: SelectSubset<T, VersionDocumentoFindFirstArgs<ExtArgs>>): Prisma__VersionDocumentoClient<$Result.GetResult<Prisma.$VersionDocumentoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first VersionDocumento that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VersionDocumentoFindFirstOrThrowArgs} args - Arguments to find a VersionDocumento
     * @example
     * // Get one VersionDocumento
     * const versionDocumento = await prisma.versionDocumento.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends VersionDocumentoFindFirstOrThrowArgs>(args?: SelectSubset<T, VersionDocumentoFindFirstOrThrowArgs<ExtArgs>>): Prisma__VersionDocumentoClient<$Result.GetResult<Prisma.$VersionDocumentoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more VersionDocumentos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VersionDocumentoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all VersionDocumentos
     * const versionDocumentos = await prisma.versionDocumento.findMany()
     * 
     * // Get first 10 VersionDocumentos
     * const versionDocumentos = await prisma.versionDocumento.findMany({ take: 10 })
     * 
     * // Only select the `id_version`
     * const versionDocumentoWithId_versionOnly = await prisma.versionDocumento.findMany({ select: { id_version: true } })
     * 
     */
    findMany<T extends VersionDocumentoFindManyArgs>(args?: SelectSubset<T, VersionDocumentoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VersionDocumentoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a VersionDocumento.
     * @param {VersionDocumentoCreateArgs} args - Arguments to create a VersionDocumento.
     * @example
     * // Create one VersionDocumento
     * const VersionDocumento = await prisma.versionDocumento.create({
     *   data: {
     *     // ... data to create a VersionDocumento
     *   }
     * })
     * 
     */
    create<T extends VersionDocumentoCreateArgs>(args: SelectSubset<T, VersionDocumentoCreateArgs<ExtArgs>>): Prisma__VersionDocumentoClient<$Result.GetResult<Prisma.$VersionDocumentoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many VersionDocumentos.
     * @param {VersionDocumentoCreateManyArgs} args - Arguments to create many VersionDocumentos.
     * @example
     * // Create many VersionDocumentos
     * const versionDocumento = await prisma.versionDocumento.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends VersionDocumentoCreateManyArgs>(args?: SelectSubset<T, VersionDocumentoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many VersionDocumentos and returns the data saved in the database.
     * @param {VersionDocumentoCreateManyAndReturnArgs} args - Arguments to create many VersionDocumentos.
     * @example
     * // Create many VersionDocumentos
     * const versionDocumento = await prisma.versionDocumento.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many VersionDocumentos and only return the `id_version`
     * const versionDocumentoWithId_versionOnly = await prisma.versionDocumento.createManyAndReturn({ 
     *   select: { id_version: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends VersionDocumentoCreateManyAndReturnArgs>(args?: SelectSubset<T, VersionDocumentoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VersionDocumentoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a VersionDocumento.
     * @param {VersionDocumentoDeleteArgs} args - Arguments to delete one VersionDocumento.
     * @example
     * // Delete one VersionDocumento
     * const VersionDocumento = await prisma.versionDocumento.delete({
     *   where: {
     *     // ... filter to delete one VersionDocumento
     *   }
     * })
     * 
     */
    delete<T extends VersionDocumentoDeleteArgs>(args: SelectSubset<T, VersionDocumentoDeleteArgs<ExtArgs>>): Prisma__VersionDocumentoClient<$Result.GetResult<Prisma.$VersionDocumentoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one VersionDocumento.
     * @param {VersionDocumentoUpdateArgs} args - Arguments to update one VersionDocumento.
     * @example
     * // Update one VersionDocumento
     * const versionDocumento = await prisma.versionDocumento.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends VersionDocumentoUpdateArgs>(args: SelectSubset<T, VersionDocumentoUpdateArgs<ExtArgs>>): Prisma__VersionDocumentoClient<$Result.GetResult<Prisma.$VersionDocumentoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more VersionDocumentos.
     * @param {VersionDocumentoDeleteManyArgs} args - Arguments to filter VersionDocumentos to delete.
     * @example
     * // Delete a few VersionDocumentos
     * const { count } = await prisma.versionDocumento.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends VersionDocumentoDeleteManyArgs>(args?: SelectSubset<T, VersionDocumentoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more VersionDocumentos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VersionDocumentoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many VersionDocumentos
     * const versionDocumento = await prisma.versionDocumento.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends VersionDocumentoUpdateManyArgs>(args: SelectSubset<T, VersionDocumentoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one VersionDocumento.
     * @param {VersionDocumentoUpsertArgs} args - Arguments to update or create a VersionDocumento.
     * @example
     * // Update or create a VersionDocumento
     * const versionDocumento = await prisma.versionDocumento.upsert({
     *   create: {
     *     // ... data to create a VersionDocumento
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the VersionDocumento we want to update
     *   }
     * })
     */
    upsert<T extends VersionDocumentoUpsertArgs>(args: SelectSubset<T, VersionDocumentoUpsertArgs<ExtArgs>>): Prisma__VersionDocumentoClient<$Result.GetResult<Prisma.$VersionDocumentoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of VersionDocumentos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VersionDocumentoCountArgs} args - Arguments to filter VersionDocumentos to count.
     * @example
     * // Count the number of VersionDocumentos
     * const count = await prisma.versionDocumento.count({
     *   where: {
     *     // ... the filter for the VersionDocumentos we want to count
     *   }
     * })
    **/
    count<T extends VersionDocumentoCountArgs>(
      args?: Subset<T, VersionDocumentoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], VersionDocumentoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a VersionDocumento.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VersionDocumentoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends VersionDocumentoAggregateArgs>(args: Subset<T, VersionDocumentoAggregateArgs>): Prisma.PrismaPromise<GetVersionDocumentoAggregateType<T>>

    /**
     * Group by VersionDocumento.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VersionDocumentoGroupByArgs} args - Group by arguments.
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
      T extends VersionDocumentoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: VersionDocumentoGroupByArgs['orderBy'] }
        : { orderBy?: VersionDocumentoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, VersionDocumentoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetVersionDocumentoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the VersionDocumento model
   */
  readonly fields: VersionDocumentoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for VersionDocumento.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__VersionDocumentoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    documento<T extends DocumentoDefaultArgs<ExtArgs> = {}>(args?: Subset<T, DocumentoDefaultArgs<ExtArgs>>): Prisma__DocumentoClient<$Result.GetResult<Prisma.$DocumentoPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
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
   * Fields of the VersionDocumento model
   */ 
  interface VersionDocumentoFieldRefs {
    readonly id_version: FieldRef<"VersionDocumento", 'String'>
    readonly tenant_id: FieldRef<"VersionDocumento", 'String'>
    readonly documento_id: FieldRef<"VersionDocumento", 'String'>
    readonly numero_version: FieldRef<"VersionDocumento", 'String'>
    readonly estado: FieldRef<"VersionDocumento", 'String'>
    readonly cambios: FieldRef<"VersionDocumento", 'String'>
    readonly archivo_nombre: FieldRef<"VersionDocumento", 'String'>
    readonly archivo_ruta: FieldRef<"VersionDocumento", 'String'>
    readonly archivo_mime: FieldRef<"VersionDocumento", 'String'>
    readonly archivo_tamano: FieldRef<"VersionDocumento", 'Int'>
    readonly creado_por: FieldRef<"VersionDocumento", 'String'>
    readonly revisado_por: FieldRef<"VersionDocumento", 'String'>
    readonly aprobado_por: FieldRef<"VersionDocumento", 'String'>
    readonly fecha_emision: FieldRef<"VersionDocumento", 'DateTime'>
    readonly fecha_obsoleto: FieldRef<"VersionDocumento", 'DateTime'>
    readonly created_at: FieldRef<"VersionDocumento", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * VersionDocumento findUnique
   */
  export type VersionDocumentoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VersionDocumento
     */
    select?: VersionDocumentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VersionDocumentoInclude<ExtArgs> | null
    /**
     * Filter, which VersionDocumento to fetch.
     */
    where: VersionDocumentoWhereUniqueInput
  }

  /**
   * VersionDocumento findUniqueOrThrow
   */
  export type VersionDocumentoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VersionDocumento
     */
    select?: VersionDocumentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VersionDocumentoInclude<ExtArgs> | null
    /**
     * Filter, which VersionDocumento to fetch.
     */
    where: VersionDocumentoWhereUniqueInput
  }

  /**
   * VersionDocumento findFirst
   */
  export type VersionDocumentoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VersionDocumento
     */
    select?: VersionDocumentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VersionDocumentoInclude<ExtArgs> | null
    /**
     * Filter, which VersionDocumento to fetch.
     */
    where?: VersionDocumentoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VersionDocumentos to fetch.
     */
    orderBy?: VersionDocumentoOrderByWithRelationInput | VersionDocumentoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for VersionDocumentos.
     */
    cursor?: VersionDocumentoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VersionDocumentos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VersionDocumentos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of VersionDocumentos.
     */
    distinct?: VersionDocumentoScalarFieldEnum | VersionDocumentoScalarFieldEnum[]
  }

  /**
   * VersionDocumento findFirstOrThrow
   */
  export type VersionDocumentoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VersionDocumento
     */
    select?: VersionDocumentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VersionDocumentoInclude<ExtArgs> | null
    /**
     * Filter, which VersionDocumento to fetch.
     */
    where?: VersionDocumentoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VersionDocumentos to fetch.
     */
    orderBy?: VersionDocumentoOrderByWithRelationInput | VersionDocumentoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for VersionDocumentos.
     */
    cursor?: VersionDocumentoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VersionDocumentos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VersionDocumentos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of VersionDocumentos.
     */
    distinct?: VersionDocumentoScalarFieldEnum | VersionDocumentoScalarFieldEnum[]
  }

  /**
   * VersionDocumento findMany
   */
  export type VersionDocumentoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VersionDocumento
     */
    select?: VersionDocumentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VersionDocumentoInclude<ExtArgs> | null
    /**
     * Filter, which VersionDocumentos to fetch.
     */
    where?: VersionDocumentoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VersionDocumentos to fetch.
     */
    orderBy?: VersionDocumentoOrderByWithRelationInput | VersionDocumentoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing VersionDocumentos.
     */
    cursor?: VersionDocumentoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VersionDocumentos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VersionDocumentos.
     */
    skip?: number
    distinct?: VersionDocumentoScalarFieldEnum | VersionDocumentoScalarFieldEnum[]
  }

  /**
   * VersionDocumento create
   */
  export type VersionDocumentoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VersionDocumento
     */
    select?: VersionDocumentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VersionDocumentoInclude<ExtArgs> | null
    /**
     * The data needed to create a VersionDocumento.
     */
    data: XOR<VersionDocumentoCreateInput, VersionDocumentoUncheckedCreateInput>
  }

  /**
   * VersionDocumento createMany
   */
  export type VersionDocumentoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many VersionDocumentos.
     */
    data: VersionDocumentoCreateManyInput | VersionDocumentoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * VersionDocumento createManyAndReturn
   */
  export type VersionDocumentoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VersionDocumento
     */
    select?: VersionDocumentoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many VersionDocumentos.
     */
    data: VersionDocumentoCreateManyInput | VersionDocumentoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VersionDocumentoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * VersionDocumento update
   */
  export type VersionDocumentoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VersionDocumento
     */
    select?: VersionDocumentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VersionDocumentoInclude<ExtArgs> | null
    /**
     * The data needed to update a VersionDocumento.
     */
    data: XOR<VersionDocumentoUpdateInput, VersionDocumentoUncheckedUpdateInput>
    /**
     * Choose, which VersionDocumento to update.
     */
    where: VersionDocumentoWhereUniqueInput
  }

  /**
   * VersionDocumento updateMany
   */
  export type VersionDocumentoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update VersionDocumentos.
     */
    data: XOR<VersionDocumentoUpdateManyMutationInput, VersionDocumentoUncheckedUpdateManyInput>
    /**
     * Filter which VersionDocumentos to update
     */
    where?: VersionDocumentoWhereInput
  }

  /**
   * VersionDocumento upsert
   */
  export type VersionDocumentoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VersionDocumento
     */
    select?: VersionDocumentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VersionDocumentoInclude<ExtArgs> | null
    /**
     * The filter to search for the VersionDocumento to update in case it exists.
     */
    where: VersionDocumentoWhereUniqueInput
    /**
     * In case the VersionDocumento found by the `where` argument doesn't exist, create a new VersionDocumento with this data.
     */
    create: XOR<VersionDocumentoCreateInput, VersionDocumentoUncheckedCreateInput>
    /**
     * In case the VersionDocumento was found with the provided `where` argument, update it with this data.
     */
    update: XOR<VersionDocumentoUpdateInput, VersionDocumentoUncheckedUpdateInput>
  }

  /**
   * VersionDocumento delete
   */
  export type VersionDocumentoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VersionDocumento
     */
    select?: VersionDocumentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VersionDocumentoInclude<ExtArgs> | null
    /**
     * Filter which VersionDocumento to delete.
     */
    where: VersionDocumentoWhereUniqueInput
  }

  /**
   * VersionDocumento deleteMany
   */
  export type VersionDocumentoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which VersionDocumentos to delete
     */
    where?: VersionDocumentoWhereInput
  }

  /**
   * VersionDocumento without action
   */
  export type VersionDocumentoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VersionDocumento
     */
    select?: VersionDocumentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VersionDocumentoInclude<ExtArgs> | null
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


  export const DocumentoScalarFieldEnum: {
    id_documento: 'id_documento',
    tenant_id: 'tenant_id',
    codigo: 'codigo',
    titulo: 'titulo',
    tipo: 'tipo',
    descripcion: 'descripcion',
    proyecto_id: 'proyecto_id',
    responsable_id: 'responsable_id',
    estado_actual: 'estado_actual',
    version_actual: 'version_actual',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type DocumentoScalarFieldEnum = (typeof DocumentoScalarFieldEnum)[keyof typeof DocumentoScalarFieldEnum]


  export const VersionDocumentoScalarFieldEnum: {
    id_version: 'id_version',
    tenant_id: 'tenant_id',
    documento_id: 'documento_id',
    numero_version: 'numero_version',
    estado: 'estado',
    cambios: 'cambios',
    archivo_nombre: 'archivo_nombre',
    archivo_ruta: 'archivo_ruta',
    archivo_mime: 'archivo_mime',
    archivo_tamano: 'archivo_tamano',
    creado_por: 'creado_por',
    revisado_por: 'revisado_por',
    aprobado_por: 'aprobado_por',
    fecha_emision: 'fecha_emision',
    fecha_obsoleto: 'fecha_obsoleto',
    created_at: 'created_at'
  };

  export type VersionDocumentoScalarFieldEnum = (typeof VersionDocumentoScalarFieldEnum)[keyof typeof VersionDocumentoScalarFieldEnum]


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


  export type DocumentoWhereInput = {
    AND?: DocumentoWhereInput | DocumentoWhereInput[]
    OR?: DocumentoWhereInput[]
    NOT?: DocumentoWhereInput | DocumentoWhereInput[]
    id_documento?: UuidFilter<"Documento"> | string
    tenant_id?: UuidFilter<"Documento"> | string
    codigo?: StringFilter<"Documento"> | string
    titulo?: StringFilter<"Documento"> | string
    tipo?: StringFilter<"Documento"> | string
    descripcion?: StringNullableFilter<"Documento"> | string | null
    proyecto_id?: UuidNullableFilter<"Documento"> | string | null
    responsable_id?: UuidFilter<"Documento"> | string
    estado_actual?: StringFilter<"Documento"> | string
    version_actual?: StringNullableFilter<"Documento"> | string | null
    created_at?: DateTimeFilter<"Documento"> | Date | string
    updated_at?: DateTimeFilter<"Documento"> | Date | string
    versiones?: VersionDocumentoListRelationFilter
  }

  export type DocumentoOrderByWithRelationInput = {
    id_documento?: SortOrder
    tenant_id?: SortOrder
    codigo?: SortOrder
    titulo?: SortOrder
    tipo?: SortOrder
    descripcion?: SortOrderInput | SortOrder
    proyecto_id?: SortOrderInput | SortOrder
    responsable_id?: SortOrder
    estado_actual?: SortOrder
    version_actual?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    versiones?: VersionDocumentoOrderByRelationAggregateInput
  }

  export type DocumentoWhereUniqueInput = Prisma.AtLeast<{
    id_documento?: string
    tenant_id_codigo?: DocumentoTenant_idCodigoCompoundUniqueInput
    AND?: DocumentoWhereInput | DocumentoWhereInput[]
    OR?: DocumentoWhereInput[]
    NOT?: DocumentoWhereInput | DocumentoWhereInput[]
    tenant_id?: UuidFilter<"Documento"> | string
    codigo?: StringFilter<"Documento"> | string
    titulo?: StringFilter<"Documento"> | string
    tipo?: StringFilter<"Documento"> | string
    descripcion?: StringNullableFilter<"Documento"> | string | null
    proyecto_id?: UuidNullableFilter<"Documento"> | string | null
    responsable_id?: UuidFilter<"Documento"> | string
    estado_actual?: StringFilter<"Documento"> | string
    version_actual?: StringNullableFilter<"Documento"> | string | null
    created_at?: DateTimeFilter<"Documento"> | Date | string
    updated_at?: DateTimeFilter<"Documento"> | Date | string
    versiones?: VersionDocumentoListRelationFilter
  }, "id_documento" | "tenant_id_codigo">

  export type DocumentoOrderByWithAggregationInput = {
    id_documento?: SortOrder
    tenant_id?: SortOrder
    codigo?: SortOrder
    titulo?: SortOrder
    tipo?: SortOrder
    descripcion?: SortOrderInput | SortOrder
    proyecto_id?: SortOrderInput | SortOrder
    responsable_id?: SortOrder
    estado_actual?: SortOrder
    version_actual?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: DocumentoCountOrderByAggregateInput
    _max?: DocumentoMaxOrderByAggregateInput
    _min?: DocumentoMinOrderByAggregateInput
  }

  export type DocumentoScalarWhereWithAggregatesInput = {
    AND?: DocumentoScalarWhereWithAggregatesInput | DocumentoScalarWhereWithAggregatesInput[]
    OR?: DocumentoScalarWhereWithAggregatesInput[]
    NOT?: DocumentoScalarWhereWithAggregatesInput | DocumentoScalarWhereWithAggregatesInput[]
    id_documento?: UuidWithAggregatesFilter<"Documento"> | string
    tenant_id?: UuidWithAggregatesFilter<"Documento"> | string
    codigo?: StringWithAggregatesFilter<"Documento"> | string
    titulo?: StringWithAggregatesFilter<"Documento"> | string
    tipo?: StringWithAggregatesFilter<"Documento"> | string
    descripcion?: StringNullableWithAggregatesFilter<"Documento"> | string | null
    proyecto_id?: UuidNullableWithAggregatesFilter<"Documento"> | string | null
    responsable_id?: UuidWithAggregatesFilter<"Documento"> | string
    estado_actual?: StringWithAggregatesFilter<"Documento"> | string
    version_actual?: StringNullableWithAggregatesFilter<"Documento"> | string | null
    created_at?: DateTimeWithAggregatesFilter<"Documento"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"Documento"> | Date | string
  }

  export type VersionDocumentoWhereInput = {
    AND?: VersionDocumentoWhereInput | VersionDocumentoWhereInput[]
    OR?: VersionDocumentoWhereInput[]
    NOT?: VersionDocumentoWhereInput | VersionDocumentoWhereInput[]
    id_version?: UuidFilter<"VersionDocumento"> | string
    tenant_id?: UuidFilter<"VersionDocumento"> | string
    documento_id?: UuidFilter<"VersionDocumento"> | string
    numero_version?: StringFilter<"VersionDocumento"> | string
    estado?: StringFilter<"VersionDocumento"> | string
    cambios?: StringNullableFilter<"VersionDocumento"> | string | null
    archivo_nombre?: StringNullableFilter<"VersionDocumento"> | string | null
    archivo_ruta?: StringNullableFilter<"VersionDocumento"> | string | null
    archivo_mime?: StringNullableFilter<"VersionDocumento"> | string | null
    archivo_tamano?: IntNullableFilter<"VersionDocumento"> | number | null
    creado_por?: UuidFilter<"VersionDocumento"> | string
    revisado_por?: UuidNullableFilter<"VersionDocumento"> | string | null
    aprobado_por?: UuidNullableFilter<"VersionDocumento"> | string | null
    fecha_emision?: DateTimeNullableFilter<"VersionDocumento"> | Date | string | null
    fecha_obsoleto?: DateTimeNullableFilter<"VersionDocumento"> | Date | string | null
    created_at?: DateTimeFilter<"VersionDocumento"> | Date | string
    documento?: XOR<DocumentoRelationFilter, DocumentoWhereInput>
  }

  export type VersionDocumentoOrderByWithRelationInput = {
    id_version?: SortOrder
    tenant_id?: SortOrder
    documento_id?: SortOrder
    numero_version?: SortOrder
    estado?: SortOrder
    cambios?: SortOrderInput | SortOrder
    archivo_nombre?: SortOrderInput | SortOrder
    archivo_ruta?: SortOrderInput | SortOrder
    archivo_mime?: SortOrderInput | SortOrder
    archivo_tamano?: SortOrderInput | SortOrder
    creado_por?: SortOrder
    revisado_por?: SortOrderInput | SortOrder
    aprobado_por?: SortOrderInput | SortOrder
    fecha_emision?: SortOrderInput | SortOrder
    fecha_obsoleto?: SortOrderInput | SortOrder
    created_at?: SortOrder
    documento?: DocumentoOrderByWithRelationInput
  }

  export type VersionDocumentoWhereUniqueInput = Prisma.AtLeast<{
    id_version?: string
    documento_id_numero_version?: VersionDocumentoDocumento_idNumero_versionCompoundUniqueInput
    AND?: VersionDocumentoWhereInput | VersionDocumentoWhereInput[]
    OR?: VersionDocumentoWhereInput[]
    NOT?: VersionDocumentoWhereInput | VersionDocumentoWhereInput[]
    tenant_id?: UuidFilter<"VersionDocumento"> | string
    documento_id?: UuidFilter<"VersionDocumento"> | string
    numero_version?: StringFilter<"VersionDocumento"> | string
    estado?: StringFilter<"VersionDocumento"> | string
    cambios?: StringNullableFilter<"VersionDocumento"> | string | null
    archivo_nombre?: StringNullableFilter<"VersionDocumento"> | string | null
    archivo_ruta?: StringNullableFilter<"VersionDocumento"> | string | null
    archivo_mime?: StringNullableFilter<"VersionDocumento"> | string | null
    archivo_tamano?: IntNullableFilter<"VersionDocumento"> | number | null
    creado_por?: UuidFilter<"VersionDocumento"> | string
    revisado_por?: UuidNullableFilter<"VersionDocumento"> | string | null
    aprobado_por?: UuidNullableFilter<"VersionDocumento"> | string | null
    fecha_emision?: DateTimeNullableFilter<"VersionDocumento"> | Date | string | null
    fecha_obsoleto?: DateTimeNullableFilter<"VersionDocumento"> | Date | string | null
    created_at?: DateTimeFilter<"VersionDocumento"> | Date | string
    documento?: XOR<DocumentoRelationFilter, DocumentoWhereInput>
  }, "id_version" | "documento_id_numero_version">

  export type VersionDocumentoOrderByWithAggregationInput = {
    id_version?: SortOrder
    tenant_id?: SortOrder
    documento_id?: SortOrder
    numero_version?: SortOrder
    estado?: SortOrder
    cambios?: SortOrderInput | SortOrder
    archivo_nombre?: SortOrderInput | SortOrder
    archivo_ruta?: SortOrderInput | SortOrder
    archivo_mime?: SortOrderInput | SortOrder
    archivo_tamano?: SortOrderInput | SortOrder
    creado_por?: SortOrder
    revisado_por?: SortOrderInput | SortOrder
    aprobado_por?: SortOrderInput | SortOrder
    fecha_emision?: SortOrderInput | SortOrder
    fecha_obsoleto?: SortOrderInput | SortOrder
    created_at?: SortOrder
    _count?: VersionDocumentoCountOrderByAggregateInput
    _avg?: VersionDocumentoAvgOrderByAggregateInput
    _max?: VersionDocumentoMaxOrderByAggregateInput
    _min?: VersionDocumentoMinOrderByAggregateInput
    _sum?: VersionDocumentoSumOrderByAggregateInput
  }

  export type VersionDocumentoScalarWhereWithAggregatesInput = {
    AND?: VersionDocumentoScalarWhereWithAggregatesInput | VersionDocumentoScalarWhereWithAggregatesInput[]
    OR?: VersionDocumentoScalarWhereWithAggregatesInput[]
    NOT?: VersionDocumentoScalarWhereWithAggregatesInput | VersionDocumentoScalarWhereWithAggregatesInput[]
    id_version?: UuidWithAggregatesFilter<"VersionDocumento"> | string
    tenant_id?: UuidWithAggregatesFilter<"VersionDocumento"> | string
    documento_id?: UuidWithAggregatesFilter<"VersionDocumento"> | string
    numero_version?: StringWithAggregatesFilter<"VersionDocumento"> | string
    estado?: StringWithAggregatesFilter<"VersionDocumento"> | string
    cambios?: StringNullableWithAggregatesFilter<"VersionDocumento"> | string | null
    archivo_nombre?: StringNullableWithAggregatesFilter<"VersionDocumento"> | string | null
    archivo_ruta?: StringNullableWithAggregatesFilter<"VersionDocumento"> | string | null
    archivo_mime?: StringNullableWithAggregatesFilter<"VersionDocumento"> | string | null
    archivo_tamano?: IntNullableWithAggregatesFilter<"VersionDocumento"> | number | null
    creado_por?: UuidWithAggregatesFilter<"VersionDocumento"> | string
    revisado_por?: UuidNullableWithAggregatesFilter<"VersionDocumento"> | string | null
    aprobado_por?: UuidNullableWithAggregatesFilter<"VersionDocumento"> | string | null
    fecha_emision?: DateTimeNullableWithAggregatesFilter<"VersionDocumento"> | Date | string | null
    fecha_obsoleto?: DateTimeNullableWithAggregatesFilter<"VersionDocumento"> | Date | string | null
    created_at?: DateTimeWithAggregatesFilter<"VersionDocumento"> | Date | string
  }

  export type DocumentoCreateInput = {
    id_documento?: string
    tenant_id: string
    codigo: string
    titulo: string
    tipo: string
    descripcion?: string | null
    proyecto_id?: string | null
    responsable_id: string
    estado_actual?: string
    version_actual?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    versiones?: VersionDocumentoCreateNestedManyWithoutDocumentoInput
  }

  export type DocumentoUncheckedCreateInput = {
    id_documento?: string
    tenant_id: string
    codigo: string
    titulo: string
    tipo: string
    descripcion?: string | null
    proyecto_id?: string | null
    responsable_id: string
    estado_actual?: string
    version_actual?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    versiones?: VersionDocumentoUncheckedCreateNestedManyWithoutDocumentoInput
  }

  export type DocumentoUpdateInput = {
    id_documento?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    proyecto_id?: NullableStringFieldUpdateOperationsInput | string | null
    responsable_id?: StringFieldUpdateOperationsInput | string
    estado_actual?: StringFieldUpdateOperationsInput | string
    version_actual?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    versiones?: VersionDocumentoUpdateManyWithoutDocumentoNestedInput
  }

  export type DocumentoUncheckedUpdateInput = {
    id_documento?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    proyecto_id?: NullableStringFieldUpdateOperationsInput | string | null
    responsable_id?: StringFieldUpdateOperationsInput | string
    estado_actual?: StringFieldUpdateOperationsInput | string
    version_actual?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    versiones?: VersionDocumentoUncheckedUpdateManyWithoutDocumentoNestedInput
  }

  export type DocumentoCreateManyInput = {
    id_documento?: string
    tenant_id: string
    codigo: string
    titulo: string
    tipo: string
    descripcion?: string | null
    proyecto_id?: string | null
    responsable_id: string
    estado_actual?: string
    version_actual?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type DocumentoUpdateManyMutationInput = {
    id_documento?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    proyecto_id?: NullableStringFieldUpdateOperationsInput | string | null
    responsable_id?: StringFieldUpdateOperationsInput | string
    estado_actual?: StringFieldUpdateOperationsInput | string
    version_actual?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DocumentoUncheckedUpdateManyInput = {
    id_documento?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    proyecto_id?: NullableStringFieldUpdateOperationsInput | string | null
    responsable_id?: StringFieldUpdateOperationsInput | string
    estado_actual?: StringFieldUpdateOperationsInput | string
    version_actual?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VersionDocumentoCreateInput = {
    id_version?: string
    tenant_id: string
    numero_version: string
    estado?: string
    cambios?: string | null
    archivo_nombre?: string | null
    archivo_ruta?: string | null
    archivo_mime?: string | null
    archivo_tamano?: number | null
    creado_por: string
    revisado_por?: string | null
    aprobado_por?: string | null
    fecha_emision?: Date | string | null
    fecha_obsoleto?: Date | string | null
    created_at?: Date | string
    documento: DocumentoCreateNestedOneWithoutVersionesInput
  }

  export type VersionDocumentoUncheckedCreateInput = {
    id_version?: string
    tenant_id: string
    documento_id: string
    numero_version: string
    estado?: string
    cambios?: string | null
    archivo_nombre?: string | null
    archivo_ruta?: string | null
    archivo_mime?: string | null
    archivo_tamano?: number | null
    creado_por: string
    revisado_por?: string | null
    aprobado_por?: string | null
    fecha_emision?: Date | string | null
    fecha_obsoleto?: Date | string | null
    created_at?: Date | string
  }

  export type VersionDocumentoUpdateInput = {
    id_version?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    numero_version?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    cambios?: NullableStringFieldUpdateOperationsInput | string | null
    archivo_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    archivo_ruta?: NullableStringFieldUpdateOperationsInput | string | null
    archivo_mime?: NullableStringFieldUpdateOperationsInput | string | null
    archivo_tamano?: NullableIntFieldUpdateOperationsInput | number | null
    creado_por?: StringFieldUpdateOperationsInput | string
    revisado_por?: NullableStringFieldUpdateOperationsInput | string | null
    aprobado_por?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_emision?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_obsoleto?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    documento?: DocumentoUpdateOneRequiredWithoutVersionesNestedInput
  }

  export type VersionDocumentoUncheckedUpdateInput = {
    id_version?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    documento_id?: StringFieldUpdateOperationsInput | string
    numero_version?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    cambios?: NullableStringFieldUpdateOperationsInput | string | null
    archivo_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    archivo_ruta?: NullableStringFieldUpdateOperationsInput | string | null
    archivo_mime?: NullableStringFieldUpdateOperationsInput | string | null
    archivo_tamano?: NullableIntFieldUpdateOperationsInput | number | null
    creado_por?: StringFieldUpdateOperationsInput | string
    revisado_por?: NullableStringFieldUpdateOperationsInput | string | null
    aprobado_por?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_emision?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_obsoleto?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VersionDocumentoCreateManyInput = {
    id_version?: string
    tenant_id: string
    documento_id: string
    numero_version: string
    estado?: string
    cambios?: string | null
    archivo_nombre?: string | null
    archivo_ruta?: string | null
    archivo_mime?: string | null
    archivo_tamano?: number | null
    creado_por: string
    revisado_por?: string | null
    aprobado_por?: string | null
    fecha_emision?: Date | string | null
    fecha_obsoleto?: Date | string | null
    created_at?: Date | string
  }

  export type VersionDocumentoUpdateManyMutationInput = {
    id_version?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    numero_version?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    cambios?: NullableStringFieldUpdateOperationsInput | string | null
    archivo_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    archivo_ruta?: NullableStringFieldUpdateOperationsInput | string | null
    archivo_mime?: NullableStringFieldUpdateOperationsInput | string | null
    archivo_tamano?: NullableIntFieldUpdateOperationsInput | number | null
    creado_por?: StringFieldUpdateOperationsInput | string
    revisado_por?: NullableStringFieldUpdateOperationsInput | string | null
    aprobado_por?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_emision?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_obsoleto?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VersionDocumentoUncheckedUpdateManyInput = {
    id_version?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    documento_id?: StringFieldUpdateOperationsInput | string
    numero_version?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    cambios?: NullableStringFieldUpdateOperationsInput | string | null
    archivo_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    archivo_ruta?: NullableStringFieldUpdateOperationsInput | string | null
    archivo_mime?: NullableStringFieldUpdateOperationsInput | string | null
    archivo_tamano?: NullableIntFieldUpdateOperationsInput | number | null
    creado_por?: StringFieldUpdateOperationsInput | string
    revisado_por?: NullableStringFieldUpdateOperationsInput | string | null
    aprobado_por?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_emision?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_obsoleto?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
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

  export type VersionDocumentoListRelationFilter = {
    every?: VersionDocumentoWhereInput
    some?: VersionDocumentoWhereInput
    none?: VersionDocumentoWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type VersionDocumentoOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type DocumentoTenant_idCodigoCompoundUniqueInput = {
    tenant_id: string
    codigo: string
  }

  export type DocumentoCountOrderByAggregateInput = {
    id_documento?: SortOrder
    tenant_id?: SortOrder
    codigo?: SortOrder
    titulo?: SortOrder
    tipo?: SortOrder
    descripcion?: SortOrder
    proyecto_id?: SortOrder
    responsable_id?: SortOrder
    estado_actual?: SortOrder
    version_actual?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type DocumentoMaxOrderByAggregateInput = {
    id_documento?: SortOrder
    tenant_id?: SortOrder
    codigo?: SortOrder
    titulo?: SortOrder
    tipo?: SortOrder
    descripcion?: SortOrder
    proyecto_id?: SortOrder
    responsable_id?: SortOrder
    estado_actual?: SortOrder
    version_actual?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type DocumentoMinOrderByAggregateInput = {
    id_documento?: SortOrder
    tenant_id?: SortOrder
    codigo?: SortOrder
    titulo?: SortOrder
    tipo?: SortOrder
    descripcion?: SortOrder
    proyecto_id?: SortOrder
    responsable_id?: SortOrder
    estado_actual?: SortOrder
    version_actual?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
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

  export type DocumentoRelationFilter = {
    is?: DocumentoWhereInput
    isNot?: DocumentoWhereInput
  }

  export type VersionDocumentoDocumento_idNumero_versionCompoundUniqueInput = {
    documento_id: string
    numero_version: string
  }

  export type VersionDocumentoCountOrderByAggregateInput = {
    id_version?: SortOrder
    tenant_id?: SortOrder
    documento_id?: SortOrder
    numero_version?: SortOrder
    estado?: SortOrder
    cambios?: SortOrder
    archivo_nombre?: SortOrder
    archivo_ruta?: SortOrder
    archivo_mime?: SortOrder
    archivo_tamano?: SortOrder
    creado_por?: SortOrder
    revisado_por?: SortOrder
    aprobado_por?: SortOrder
    fecha_emision?: SortOrder
    fecha_obsoleto?: SortOrder
    created_at?: SortOrder
  }

  export type VersionDocumentoAvgOrderByAggregateInput = {
    archivo_tamano?: SortOrder
  }

  export type VersionDocumentoMaxOrderByAggregateInput = {
    id_version?: SortOrder
    tenant_id?: SortOrder
    documento_id?: SortOrder
    numero_version?: SortOrder
    estado?: SortOrder
    cambios?: SortOrder
    archivo_nombre?: SortOrder
    archivo_ruta?: SortOrder
    archivo_mime?: SortOrder
    archivo_tamano?: SortOrder
    creado_por?: SortOrder
    revisado_por?: SortOrder
    aprobado_por?: SortOrder
    fecha_emision?: SortOrder
    fecha_obsoleto?: SortOrder
    created_at?: SortOrder
  }

  export type VersionDocumentoMinOrderByAggregateInput = {
    id_version?: SortOrder
    tenant_id?: SortOrder
    documento_id?: SortOrder
    numero_version?: SortOrder
    estado?: SortOrder
    cambios?: SortOrder
    archivo_nombre?: SortOrder
    archivo_ruta?: SortOrder
    archivo_mime?: SortOrder
    archivo_tamano?: SortOrder
    creado_por?: SortOrder
    revisado_por?: SortOrder
    aprobado_por?: SortOrder
    fecha_emision?: SortOrder
    fecha_obsoleto?: SortOrder
    created_at?: SortOrder
  }

  export type VersionDocumentoSumOrderByAggregateInput = {
    archivo_tamano?: SortOrder
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

  export type VersionDocumentoCreateNestedManyWithoutDocumentoInput = {
    create?: XOR<VersionDocumentoCreateWithoutDocumentoInput, VersionDocumentoUncheckedCreateWithoutDocumentoInput> | VersionDocumentoCreateWithoutDocumentoInput[] | VersionDocumentoUncheckedCreateWithoutDocumentoInput[]
    connectOrCreate?: VersionDocumentoCreateOrConnectWithoutDocumentoInput | VersionDocumentoCreateOrConnectWithoutDocumentoInput[]
    createMany?: VersionDocumentoCreateManyDocumentoInputEnvelope
    connect?: VersionDocumentoWhereUniqueInput | VersionDocumentoWhereUniqueInput[]
  }

  export type VersionDocumentoUncheckedCreateNestedManyWithoutDocumentoInput = {
    create?: XOR<VersionDocumentoCreateWithoutDocumentoInput, VersionDocumentoUncheckedCreateWithoutDocumentoInput> | VersionDocumentoCreateWithoutDocumentoInput[] | VersionDocumentoUncheckedCreateWithoutDocumentoInput[]
    connectOrCreate?: VersionDocumentoCreateOrConnectWithoutDocumentoInput | VersionDocumentoCreateOrConnectWithoutDocumentoInput[]
    createMany?: VersionDocumentoCreateManyDocumentoInputEnvelope
    connect?: VersionDocumentoWhereUniqueInput | VersionDocumentoWhereUniqueInput[]
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

  export type VersionDocumentoUpdateManyWithoutDocumentoNestedInput = {
    create?: XOR<VersionDocumentoCreateWithoutDocumentoInput, VersionDocumentoUncheckedCreateWithoutDocumentoInput> | VersionDocumentoCreateWithoutDocumentoInput[] | VersionDocumentoUncheckedCreateWithoutDocumentoInput[]
    connectOrCreate?: VersionDocumentoCreateOrConnectWithoutDocumentoInput | VersionDocumentoCreateOrConnectWithoutDocumentoInput[]
    upsert?: VersionDocumentoUpsertWithWhereUniqueWithoutDocumentoInput | VersionDocumentoUpsertWithWhereUniqueWithoutDocumentoInput[]
    createMany?: VersionDocumentoCreateManyDocumentoInputEnvelope
    set?: VersionDocumentoWhereUniqueInput | VersionDocumentoWhereUniqueInput[]
    disconnect?: VersionDocumentoWhereUniqueInput | VersionDocumentoWhereUniqueInput[]
    delete?: VersionDocumentoWhereUniqueInput | VersionDocumentoWhereUniqueInput[]
    connect?: VersionDocumentoWhereUniqueInput | VersionDocumentoWhereUniqueInput[]
    update?: VersionDocumentoUpdateWithWhereUniqueWithoutDocumentoInput | VersionDocumentoUpdateWithWhereUniqueWithoutDocumentoInput[]
    updateMany?: VersionDocumentoUpdateManyWithWhereWithoutDocumentoInput | VersionDocumentoUpdateManyWithWhereWithoutDocumentoInput[]
    deleteMany?: VersionDocumentoScalarWhereInput | VersionDocumentoScalarWhereInput[]
  }

  export type VersionDocumentoUncheckedUpdateManyWithoutDocumentoNestedInput = {
    create?: XOR<VersionDocumentoCreateWithoutDocumentoInput, VersionDocumentoUncheckedCreateWithoutDocumentoInput> | VersionDocumentoCreateWithoutDocumentoInput[] | VersionDocumentoUncheckedCreateWithoutDocumentoInput[]
    connectOrCreate?: VersionDocumentoCreateOrConnectWithoutDocumentoInput | VersionDocumentoCreateOrConnectWithoutDocumentoInput[]
    upsert?: VersionDocumentoUpsertWithWhereUniqueWithoutDocumentoInput | VersionDocumentoUpsertWithWhereUniqueWithoutDocumentoInput[]
    createMany?: VersionDocumentoCreateManyDocumentoInputEnvelope
    set?: VersionDocumentoWhereUniqueInput | VersionDocumentoWhereUniqueInput[]
    disconnect?: VersionDocumentoWhereUniqueInput | VersionDocumentoWhereUniqueInput[]
    delete?: VersionDocumentoWhereUniqueInput | VersionDocumentoWhereUniqueInput[]
    connect?: VersionDocumentoWhereUniqueInput | VersionDocumentoWhereUniqueInput[]
    update?: VersionDocumentoUpdateWithWhereUniqueWithoutDocumentoInput | VersionDocumentoUpdateWithWhereUniqueWithoutDocumentoInput[]
    updateMany?: VersionDocumentoUpdateManyWithWhereWithoutDocumentoInput | VersionDocumentoUpdateManyWithWhereWithoutDocumentoInput[]
    deleteMany?: VersionDocumentoScalarWhereInput | VersionDocumentoScalarWhereInput[]
  }

  export type DocumentoCreateNestedOneWithoutVersionesInput = {
    create?: XOR<DocumentoCreateWithoutVersionesInput, DocumentoUncheckedCreateWithoutVersionesInput>
    connectOrCreate?: DocumentoCreateOrConnectWithoutVersionesInput
    connect?: DocumentoWhereUniqueInput
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type DocumentoUpdateOneRequiredWithoutVersionesNestedInput = {
    create?: XOR<DocumentoCreateWithoutVersionesInput, DocumentoUncheckedCreateWithoutVersionesInput>
    connectOrCreate?: DocumentoCreateOrConnectWithoutVersionesInput
    upsert?: DocumentoUpsertWithoutVersionesInput
    connect?: DocumentoWhereUniqueInput
    update?: XOR<XOR<DocumentoUpdateToOneWithWhereWithoutVersionesInput, DocumentoUpdateWithoutVersionesInput>, DocumentoUncheckedUpdateWithoutVersionesInput>
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

  export type VersionDocumentoCreateWithoutDocumentoInput = {
    id_version?: string
    tenant_id: string
    numero_version: string
    estado?: string
    cambios?: string | null
    archivo_nombre?: string | null
    archivo_ruta?: string | null
    archivo_mime?: string | null
    archivo_tamano?: number | null
    creado_por: string
    revisado_por?: string | null
    aprobado_por?: string | null
    fecha_emision?: Date | string | null
    fecha_obsoleto?: Date | string | null
    created_at?: Date | string
  }

  export type VersionDocumentoUncheckedCreateWithoutDocumentoInput = {
    id_version?: string
    tenant_id: string
    numero_version: string
    estado?: string
    cambios?: string | null
    archivo_nombre?: string | null
    archivo_ruta?: string | null
    archivo_mime?: string | null
    archivo_tamano?: number | null
    creado_por: string
    revisado_por?: string | null
    aprobado_por?: string | null
    fecha_emision?: Date | string | null
    fecha_obsoleto?: Date | string | null
    created_at?: Date | string
  }

  export type VersionDocumentoCreateOrConnectWithoutDocumentoInput = {
    where: VersionDocumentoWhereUniqueInput
    create: XOR<VersionDocumentoCreateWithoutDocumentoInput, VersionDocumentoUncheckedCreateWithoutDocumentoInput>
  }

  export type VersionDocumentoCreateManyDocumentoInputEnvelope = {
    data: VersionDocumentoCreateManyDocumentoInput | VersionDocumentoCreateManyDocumentoInput[]
    skipDuplicates?: boolean
  }

  export type VersionDocumentoUpsertWithWhereUniqueWithoutDocumentoInput = {
    where: VersionDocumentoWhereUniqueInput
    update: XOR<VersionDocumentoUpdateWithoutDocumentoInput, VersionDocumentoUncheckedUpdateWithoutDocumentoInput>
    create: XOR<VersionDocumentoCreateWithoutDocumentoInput, VersionDocumentoUncheckedCreateWithoutDocumentoInput>
  }

  export type VersionDocumentoUpdateWithWhereUniqueWithoutDocumentoInput = {
    where: VersionDocumentoWhereUniqueInput
    data: XOR<VersionDocumentoUpdateWithoutDocumentoInput, VersionDocumentoUncheckedUpdateWithoutDocumentoInput>
  }

  export type VersionDocumentoUpdateManyWithWhereWithoutDocumentoInput = {
    where: VersionDocumentoScalarWhereInput
    data: XOR<VersionDocumentoUpdateManyMutationInput, VersionDocumentoUncheckedUpdateManyWithoutDocumentoInput>
  }

  export type VersionDocumentoScalarWhereInput = {
    AND?: VersionDocumentoScalarWhereInput | VersionDocumentoScalarWhereInput[]
    OR?: VersionDocumentoScalarWhereInput[]
    NOT?: VersionDocumentoScalarWhereInput | VersionDocumentoScalarWhereInput[]
    id_version?: UuidFilter<"VersionDocumento"> | string
    tenant_id?: UuidFilter<"VersionDocumento"> | string
    documento_id?: UuidFilter<"VersionDocumento"> | string
    numero_version?: StringFilter<"VersionDocumento"> | string
    estado?: StringFilter<"VersionDocumento"> | string
    cambios?: StringNullableFilter<"VersionDocumento"> | string | null
    archivo_nombre?: StringNullableFilter<"VersionDocumento"> | string | null
    archivo_ruta?: StringNullableFilter<"VersionDocumento"> | string | null
    archivo_mime?: StringNullableFilter<"VersionDocumento"> | string | null
    archivo_tamano?: IntNullableFilter<"VersionDocumento"> | number | null
    creado_por?: UuidFilter<"VersionDocumento"> | string
    revisado_por?: UuidNullableFilter<"VersionDocumento"> | string | null
    aprobado_por?: UuidNullableFilter<"VersionDocumento"> | string | null
    fecha_emision?: DateTimeNullableFilter<"VersionDocumento"> | Date | string | null
    fecha_obsoleto?: DateTimeNullableFilter<"VersionDocumento"> | Date | string | null
    created_at?: DateTimeFilter<"VersionDocumento"> | Date | string
  }

  export type DocumentoCreateWithoutVersionesInput = {
    id_documento?: string
    tenant_id: string
    codigo: string
    titulo: string
    tipo: string
    descripcion?: string | null
    proyecto_id?: string | null
    responsable_id: string
    estado_actual?: string
    version_actual?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type DocumentoUncheckedCreateWithoutVersionesInput = {
    id_documento?: string
    tenant_id: string
    codigo: string
    titulo: string
    tipo: string
    descripcion?: string | null
    proyecto_id?: string | null
    responsable_id: string
    estado_actual?: string
    version_actual?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type DocumentoCreateOrConnectWithoutVersionesInput = {
    where: DocumentoWhereUniqueInput
    create: XOR<DocumentoCreateWithoutVersionesInput, DocumentoUncheckedCreateWithoutVersionesInput>
  }

  export type DocumentoUpsertWithoutVersionesInput = {
    update: XOR<DocumentoUpdateWithoutVersionesInput, DocumentoUncheckedUpdateWithoutVersionesInput>
    create: XOR<DocumentoCreateWithoutVersionesInput, DocumentoUncheckedCreateWithoutVersionesInput>
    where?: DocumentoWhereInput
  }

  export type DocumentoUpdateToOneWithWhereWithoutVersionesInput = {
    where?: DocumentoWhereInput
    data: XOR<DocumentoUpdateWithoutVersionesInput, DocumentoUncheckedUpdateWithoutVersionesInput>
  }

  export type DocumentoUpdateWithoutVersionesInput = {
    id_documento?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    proyecto_id?: NullableStringFieldUpdateOperationsInput | string | null
    responsable_id?: StringFieldUpdateOperationsInput | string
    estado_actual?: StringFieldUpdateOperationsInput | string
    version_actual?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DocumentoUncheckedUpdateWithoutVersionesInput = {
    id_documento?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    proyecto_id?: NullableStringFieldUpdateOperationsInput | string | null
    responsable_id?: StringFieldUpdateOperationsInput | string
    estado_actual?: StringFieldUpdateOperationsInput | string
    version_actual?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VersionDocumentoCreateManyDocumentoInput = {
    id_version?: string
    tenant_id: string
    numero_version: string
    estado?: string
    cambios?: string | null
    archivo_nombre?: string | null
    archivo_ruta?: string | null
    archivo_mime?: string | null
    archivo_tamano?: number | null
    creado_por: string
    revisado_por?: string | null
    aprobado_por?: string | null
    fecha_emision?: Date | string | null
    fecha_obsoleto?: Date | string | null
    created_at?: Date | string
  }

  export type VersionDocumentoUpdateWithoutDocumentoInput = {
    id_version?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    numero_version?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    cambios?: NullableStringFieldUpdateOperationsInput | string | null
    archivo_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    archivo_ruta?: NullableStringFieldUpdateOperationsInput | string | null
    archivo_mime?: NullableStringFieldUpdateOperationsInput | string | null
    archivo_tamano?: NullableIntFieldUpdateOperationsInput | number | null
    creado_por?: StringFieldUpdateOperationsInput | string
    revisado_por?: NullableStringFieldUpdateOperationsInput | string | null
    aprobado_por?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_emision?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_obsoleto?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VersionDocumentoUncheckedUpdateWithoutDocumentoInput = {
    id_version?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    numero_version?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    cambios?: NullableStringFieldUpdateOperationsInput | string | null
    archivo_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    archivo_ruta?: NullableStringFieldUpdateOperationsInput | string | null
    archivo_mime?: NullableStringFieldUpdateOperationsInput | string | null
    archivo_tamano?: NullableIntFieldUpdateOperationsInput | number | null
    creado_por?: StringFieldUpdateOperationsInput | string
    revisado_por?: NullableStringFieldUpdateOperationsInput | string | null
    aprobado_por?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_emision?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_obsoleto?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VersionDocumentoUncheckedUpdateManyWithoutDocumentoInput = {
    id_version?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    numero_version?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    cambios?: NullableStringFieldUpdateOperationsInput | string | null
    archivo_nombre?: NullableStringFieldUpdateOperationsInput | string | null
    archivo_ruta?: NullableStringFieldUpdateOperationsInput | string | null
    archivo_mime?: NullableStringFieldUpdateOperationsInput | string | null
    archivo_tamano?: NullableIntFieldUpdateOperationsInput | number | null
    creado_por?: StringFieldUpdateOperationsInput | string
    revisado_por?: NullableStringFieldUpdateOperationsInput | string | null
    aprobado_por?: NullableStringFieldUpdateOperationsInput | string | null
    fecha_emision?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fecha_obsoleto?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use DocumentoCountOutputTypeDefaultArgs instead
     */
    export type DocumentoCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = DocumentoCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use DocumentoDefaultArgs instead
     */
    export type DocumentoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = DocumentoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use VersionDocumentoDefaultArgs instead
     */
    export type VersionDocumentoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = VersionDocumentoDefaultArgs<ExtArgs>

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