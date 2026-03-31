
Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  NotFoundError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  skip,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
  getRuntime
} = require('./runtime/library.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError
Prisma.PrismaClientInitializationError = PrismaClientInitializationError
Prisma.PrismaClientValidationError = PrismaClientValidationError
Prisma.NotFoundError = NotFoundError
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag
Prisma.empty = empty
Prisma.join = join
Prisma.raw = raw
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = Extensions.getExtensionContext
Prisma.defineExtension = Extensions.defineExtension

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}




  const path = require('path')

/**
 * Enums
 */
exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.InsumoScalarFieldEnum = {
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

exports.Prisma.PresupuestoBaseScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  proyecto_id: 'proyecto_id',
  version: 'version',
  estado: 'estado',
  importe_total: 'importe_total',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.ConceptoScalarFieldEnum = {
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

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};
exports.TipoInsumo = exports.$Enums.TipoInsumo = {
  MATERIAL: 'MATERIAL',
  MANO_DE_OBRA: 'MANO_DE_OBRA',
  EQUIPO: 'EQUIPO',
  SUBCONTRATO: 'SUBCONTRATO',
  INDIRECTO: 'INDIRECTO'
};

exports.EstadoPresupuesto = exports.$Enums.EstadoPresupuesto = {
  BORRADOR: 'BORRADOR',
  EN_REVISION: 'EN_REVISION',
  LIBERADO: 'LIBERADO',
  CONGELADO: 'CONGELADO'
};

exports.Prisma.ModelName = {
  Insumo: 'Insumo',
  PresupuestoBase: 'PresupuestoBase',
  Concepto: 'Concepto'
};
/**
 * Create the Client
 */
const config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client-js"
    },
    "output": {
      "value": "D:\\Mis_Scripts_IA\\Flujos Agenticos\\Proyecto ERP MODULAR Bocam\\apps\\gerencia-tecnica\\src\\generated\\prisma",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "library"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "windows",
        "native": true
      }
    ],
    "previewFeatures": [],
    "sourceFilePath": "D:\\Mis_Scripts_IA\\Flujos Agenticos\\Proyecto ERP MODULAR Bocam\\apps\\gerencia-tecnica\\prisma\\schema.prisma",
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": "../../../.env",
    "schemaEnvPath": "../../../../../.env"
  },
  "relativePath": "../../../prisma",
  "clientVersion": "5.22.0",
  "engineVersion": "605197351a3c8bdd595af2d2a9bc3025bca48ea2",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "postgresql",
  "postinstall": false,
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "DATABASE_URL",
        "value": null
      }
    }
  },
  "inlineSchema": "// ---------------------------------------------------------------------------\n// Propiedad Intelectual: Constructora Bocam, S. A. de C.V.\n// Clasificación: Estrictamente Confidencial.\n// Módulo: Gerencia Técnica (Ingeniería y Presupuestos)\n// Responsabilidad: Catálogo Maestro de Insumos y Presupuesto Base.\n// ---------------------------------------------------------------------------\n\ngenerator client {\n  provider = \"prisma-client-js\"\n  output   = \"../src/generated/prisma\"\n  // clientExtensions ya es GA en Prisma 5+, no se requiere previewFeatures.\n}\n\ndatasource db {\n  provider = \"postgresql\"\n  url      = env(\"DATABASE_URL\")\n}\n\n// ======================================================================\n// ENTIDADES MAESTRAS (DUEÑO: Gerencia Técnica)\n// ======================================================================\n\n/// Catálogo Maestro de Insumos: Materiales, Mano de Obra, Equipo, Subcontratos.\n/// Tabla maestra con aislamiento por tenant_id (RLS).\nmodel Insumo {\n  id        String @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  tenant_id String @db.Uuid\n\n  clave         String     @db.VarChar(50)\n  descripcion   String     @db.Text\n  unidad_medida String     @db.VarChar(20)\n  tipo_insumo   TipoInsumo\n  costo_base    Decimal    @db.Decimal(12, 4)\n\n  activo     Boolean  @default(true)\n  created_at DateTime @default(now()) @db.Timestamptz(6)\n  updated_at DateTime @updatedAt @db.Timestamptz(6)\n\n  // Índices de rendimiento Multi-Tenant\n  @@unique([tenant_id, clave], name: \"uq_insumo_tenant_clave\")\n  @@index([tenant_id], name: \"idx_insumo_tenant\")\n  @@map(\"insumos\")\n}\n\n/// Presupuesto Base de un proyecto/centro de costos.\n/// Tabla transaccional: requiere OBLIGATORIAMENTE tenant_id + proyecto_id.\nmodel PresupuestoBase {\n  id          String @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  tenant_id   String @db.Uuid\n  proyecto_id String @db.Uuid\n\n  version       Int               @default(1)\n  estado        EstadoPresupuesto @default(BORRADOR)\n  importe_total Decimal           @default(0.00) @db.Decimal(15, 2)\n\n  conceptos Concepto[]\n\n  created_at DateTime @default(now()) @db.Timestamptz(6)\n  updated_at DateTime @updatedAt @db.Timestamptz(6)\n\n  // Índices de rendimiento Multi-Tenant + Multi-Proyecto\n  @@index([tenant_id, proyecto_id], name: \"idx_presupuesto_tenant_proyecto\")\n  @@index([tenant_id], name: \"idx_presupuesto_tenant\")\n  @@map(\"presupuestos_base\")\n}\n\n/// Concepto de Obra: Línea o partida específica de un presupuesto.\n/// Tabla transaccional hija, hereda tenant_id y proyecto_id del padre.\nmodel Concepto {\n  id             String          @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  tenant_id      String          @db.Uuid\n  proyecto_id    String          @db.Uuid\n  presupuesto_id String          @db.Uuid\n  presupuesto    PresupuestoBase @relation(fields: [presupuesto_id], references: [id], onDelete: Cascade)\n\n  clave           String  @db.VarChar(50)\n  descripcion     String  @db.Text\n  unidad_medida   String  @db.VarChar(20)\n  cantidad        Decimal @db.Decimal(12, 4)\n  precio_unitario Decimal @db.Decimal(12, 4)\n  importe         Decimal @db.Decimal(15, 2)\n\n  created_at DateTime @default(now()) @db.Timestamptz(6)\n  updated_at DateTime @updatedAt @db.Timestamptz(6)\n\n  // Índices de rendimiento Multi-Tenant + Multi-Proyecto\n  @@index([tenant_id, proyecto_id], name: \"idx_concepto_tenant_proyecto\")\n  @@index([tenant_id, presupuesto_id], name: \"idx_concepto_tenant_presupuesto\")\n  @@map(\"conceptos\")\n}\n\n// ======================================================================\n// ENUMERACIONES\n// ======================================================================\n\nenum TipoInsumo {\n  MATERIAL\n  MANO_DE_OBRA\n  EQUIPO\n  SUBCONTRATO\n  INDIRECTO\n}\n\nenum EstadoPresupuesto {\n  BORRADOR\n  EN_REVISION\n  LIBERADO // Emite evento: PresupuestoBaseLiberado\n  CONGELADO\n}\n",
  "inlineSchemaHash": "0b299fe406bf69bf82482e5dbeb243684ae7e0cf8d3b92256ed898fbe8cd9746",
  "copyEngine": true
}

const fs = require('fs')

config.dirname = __dirname
if (!fs.existsSync(path.join(__dirname, 'schema.prisma'))) {
  const alternativePaths = [
    "apps/gerencia-tecnica/src/generated/prisma",
    "gerencia-tecnica/src/generated/prisma",
  ]
  
  const alternativePath = alternativePaths.find((altPath) => {
    return fs.existsSync(path.join(process.cwd(), altPath, 'schema.prisma'))
  }) ?? alternativePaths[0]

  config.dirname = path.join(process.cwd(), alternativePath)
  config.isBundled = true
}

config.runtimeDataModel = JSON.parse("{\"models\":{\"Insumo\":{\"dbName\":\"insumos\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"clave\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"descripcion\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"unidad_medida\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tipo_insumo\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"TipoInsumo\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"costo_base\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"activo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[[\"tenant_id\",\"clave\"]],\"uniqueIndexes\":[{\"name\":\"uq_insumo_tenant_clave\",\"fields\":[\"tenant_id\",\"clave\"]}],\"isGenerated\":false,\"documentation\":\"Catálogo Maestro de Insumos: Materiales, Mano de Obra, Equipo, Subcontratos.\\\\nTabla maestra con aislamiento por tenant_id (RLS).\"},\"PresupuestoBase\":{\"dbName\":\"presupuestos_base\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"proyecto_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"version\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":1,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"estado\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"EstadoPresupuesto\",\"default\":\"BORRADOR\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"importe_total\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"conceptos\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Concepto\",\"relationName\":\"ConceptoToPresupuestoBase\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false,\"documentation\":\"Presupuesto Base de un proyecto/centro de costos.\\\\nTabla transaccional: requiere OBLIGATORIAMENTE tenant_id + proyecto_id.\"},\"Concepto\":{\"dbName\":\"conceptos\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"proyecto_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"presupuesto_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"presupuesto\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"PresupuestoBase\",\"relationName\":\"ConceptoToPresupuestoBase\",\"relationFromFields\":[\"presupuesto_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"clave\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"descripcion\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"unidad_medida\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cantidad\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"precio_unitario\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"importe\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false,\"documentation\":\"Concepto de Obra: Línea o partida específica de un presupuesto.\\\\nTabla transaccional hija, hereda tenant_id y proyecto_id del padre.\"}},\"enums\":{\"TipoInsumo\":{\"values\":[{\"name\":\"MATERIAL\",\"dbName\":null},{\"name\":\"MANO_DE_OBRA\",\"dbName\":null},{\"name\":\"EQUIPO\",\"dbName\":null},{\"name\":\"SUBCONTRATO\",\"dbName\":null},{\"name\":\"INDIRECTO\",\"dbName\":null}],\"dbName\":null},\"EstadoPresupuesto\":{\"values\":[{\"name\":\"BORRADOR\",\"dbName\":null},{\"name\":\"EN_REVISION\",\"dbName\":null},{\"name\":\"LIBERADO\",\"dbName\":null},{\"name\":\"CONGELADO\",\"dbName\":null}],\"dbName\":null}},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)
config.engineWasm = undefined


const { warnEnvConflicts } = require('./runtime/library.js')

warnEnvConflicts({
    rootEnvPath: config.relativeEnvPaths.rootEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.rootEnvPath),
    schemaEnvPath: config.relativeEnvPaths.schemaEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.schemaEnvPath)
})

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

// file annotations for bundling tools to include these files
path.join(__dirname, "query_engine-windows.dll.node");
path.join(process.cwd(), "apps/gerencia-tecnica/src/generated/prisma/query_engine-windows.dll.node")
// file annotations for bundling tools to include these files
path.join(__dirname, "schema.prisma");
path.join(process.cwd(), "apps/gerencia-tecnica/src/generated/prisma/schema.prisma")
