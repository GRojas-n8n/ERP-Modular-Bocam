
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

exports.Prisma.DocumentoScalarFieldEnum = {
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

exports.Prisma.VersionDocumentoScalarFieldEnum = {
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

exports.Prisma.NoConformidadScalarFieldEnum = {
  id_nc: 'id_nc',
  tenant_id: 'tenant_id',
  proyecto_id: 'proyecto_id',
  codigo: 'codigo',
  titulo: 'titulo',
  descripcion: 'descripcion',
  fuente: 'fuente',
  estado: 'estado',
  detectado_por: 'detectado_por',
  responsable_id: 'responsable_id',
  fecha_deteccion: 'fecha_deteccion',
  fecha_limite: 'fecha_limite',
  fecha_cierre: 'fecha_cierre',
  causa_raiz: 'causa_raiz',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.AccionCorrectivaScalarFieldEnum = {
  id_accion: 'id_accion',
  tenant_id: 'tenant_id',
  nc_id: 'nc_id',
  descripcion: 'descripcion',
  responsable_id: 'responsable_id',
  fecha_compromiso: 'fecha_compromiso',
  estado: 'estado',
  evidencia: 'evidencia',
  verificado_por: 'verificado_por',
  fecha_verificacion: 'fecha_verificacion',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.AuditoriaInternaScalarFieldEnum = {
  id_auditoria: 'id_auditoria',
  tenant_id: 'tenant_id',
  proyecto_id: 'proyecto_id',
  codigo: 'codigo',
  titulo: 'titulo',
  alcance: 'alcance',
  criterios: 'criterios',
  auditor_lider_id: 'auditor_lider_id',
  fecha_inicio: 'fecha_inicio',
  fecha_fin: 'fecha_fin',
  estado: 'estado',
  observaciones: 'observaciones',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.HallazgoAuditoriaScalarFieldEnum = {
  id_hallazgo: 'id_hallazgo',
  tenant_id: 'tenant_id',
  auditoria_id: 'auditoria_id',
  descripcion: 'descripcion',
  tipo: 'tipo',
  proceso_afectado: 'proceso_afectado',
  evidencia: 'evidencia',
  accion_requerida: 'accion_requerida',
  estado: 'estado',
  nc_id: 'nc_id',
  created_at: 'created_at'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  Documento: 'Documento',
  VersionDocumento: 'VersionDocumento',
  NoConformidad: 'NoConformidad',
  AccionCorrectiva: 'AccionCorrectiva',
  AuditoriaInterna: 'AuditoriaInterna',
  HallazgoAuditoria: 'HallazgoAuditoria'
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
      "value": "D:\\01_PROFESIONAL\\Mis_Scripts_IA\\Flujos Agenticos\\Proyecto ERP MODULAR Bocam\\apps\\calidad\\src\\generated\\prisma",
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
    "sourceFilePath": "D:\\01_PROFESIONAL\\Mis_Scripts_IA\\Flujos Agenticos\\Proyecto ERP MODULAR Bocam\\apps\\calidad\\prisma\\schema.prisma",
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": null,
    "schemaEnvPath": "../../../.env"
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
  "inlineSchema": "// -----------------------------------------------------------------------------\n// Propiedad Intelectual: Constructora Bocam, S. A. de C.V.\n// Módulo: Calidad — Control de Documentos ISO 9001:2015\n// -----------------------------------------------------------------------------\n\ngenerator client {\n  provider = \"prisma-client-js\"\n  output   = \"../src/generated/prisma\"\n}\n\ndatasource db {\n  provider = \"postgresql\"\n  url      = env(\"DATABASE_URL\")\n}\n\n// --- Documentos del SGC ---\n// Alcance corporativo (tenant_id). proyecto_id opcional para planos de obra específica.\nmodel Documento {\n  id_documento   String   @id @default(uuid()) @db.Uuid\n  tenant_id      String   @db.Uuid\n  codigo         String   @db.VarChar(30)\n  titulo         String   @db.VarChar(255)\n  tipo           String   @db.VarChar(30) // PLANO|PROCEDIMIENTO|INSTRUCTIVO|ESPECIFICACION|MANUAL|REGISTRO|OTRO\n  descripcion    String?  @db.Text\n  proyecto_id    String?  @db.Uuid // Opcional: plano de obra específica\n  responsable_id String   @db.Uuid // userId del responsable\n  estado_actual  String   @default(\"BORRADOR\") // BORRADOR|EN_REVISION|VIGENTE|OBSOLETO\n  version_actual String?  @db.VarChar(10) // \"1.0\", \"2.3\" — null hasta tener versión\n  created_at     DateTime @default(now())\n  updated_at     DateTime @updatedAt\n\n  versiones VersionDocumento[]\n\n  @@unique([tenant_id, codigo])\n  @@index([tenant_id])\n  @@index([tenant_id, tipo])\n  @@index([tenant_id, estado_actual])\n  @@map(\"documentos\")\n}\n\n// --- Versiones de Documentos ---\nmodel VersionDocumento {\n  id_version     String    @id @default(uuid()) @db.Uuid\n  tenant_id      String    @db.Uuid\n  documento_id   String    @db.Uuid\n  numero_version String    @db.VarChar(10) // \"1.0\", \"1.1\", \"2.0\"\n  estado         String    @default(\"BORRADOR\") // BORRADOR|EN_REVISION|VIGENTE|OBSOLETO\n  cambios        String?   @db.Text // Descripción de cambios respecto a versión anterior\n  archivo_nombre String?   @db.VarChar(255) // Nombre original del archivo\n  archivo_ruta   String?   @db.VarChar(500) // Ruta relativa en volumen\n  archivo_mime   String?   @db.VarChar(100) // MIME type\n  archivo_tamano Int? // Bytes\n  creado_por     String    @db.Uuid\n  revisado_por   String?   @db.Uuid\n  aprobado_por   String?   @db.Uuid\n  fecha_emision  DateTime? // Cuando pasó a VIGENTE\n  fecha_obsoleto DateTime? // Cuando pasó a OBSOLETO\n  created_at     DateTime  @default(now())\n\n  documento Documento @relation(fields: [documento_id], references: [id_documento], onDelete: Cascade)\n\n  @@unique([documento_id, numero_version])\n  @@index([tenant_id, estado])\n  @@index([documento_id])\n  @@map(\"versiones_documento\")\n}\n\n// --- No Conformidades (ISO 9001:2015 § 10.2) ---\nmodel NoConformidad {\n  id_nc           String    @id @default(uuid()) @db.Uuid\n  tenant_id       String    @db.Uuid\n  proyecto_id     String?   @db.Uuid\n  codigo          String    @db.VarChar(30)\n  titulo          String    @db.VarChar(255)\n  descripcion     String?   @db.Text\n  fuente          String    @default(\"INTERNA\") // INTERNA|CLIENTE|PROVEEDOR|AUDITORIA|PROCESO\n  estado          String    @default(\"ABIERTA\") // ABIERTA|EN_ANALISIS|ACCION_CORRECTIVA|EN_VERIFICACION|CERRADA\n  detectado_por   String    @db.Uuid\n  responsable_id  String    @db.Uuid\n  fecha_deteccion DateTime  @default(now())\n  fecha_limite    DateTime?\n  fecha_cierre    DateTime?\n  causa_raiz      String?   @db.Text\n  created_at      DateTime  @default(now())\n  updated_at      DateTime  @updatedAt\n\n  acciones AccionCorrectiva[]\n\n  @@unique([tenant_id, codigo])\n  @@index([tenant_id])\n  @@index([tenant_id, estado])\n  @@map(\"no_conformidades\")\n}\n\n// --- Acciones Correctivas ---\nmodel AccionCorrectiva {\n  id_accion          String        @id @default(uuid()) @db.Uuid\n  tenant_id          String        @db.Uuid\n  nc_id              String        @db.Uuid\n  nc                 NoConformidad @relation(fields: [nc_id], references: [id_nc], onDelete: Cascade)\n  descripcion        String        @db.Text\n  responsable_id     String        @db.Uuid\n  fecha_compromiso   DateTime?\n  estado             String        @default(\"PENDIENTE\") // PENDIENTE|EN_PROCESO|COMPLETADA|VERIFICADA|CANCELADA\n  evidencia          String?       @db.Text\n  verificado_por     String?       @db.Uuid\n  fecha_verificacion DateTime?\n  created_at         DateTime      @default(now())\n  updated_at         DateTime      @updatedAt\n\n  @@index([nc_id])\n  @@index([tenant_id])\n  @@map(\"acciones_correctivas\")\n}\n\n// --- Auditorías Internas (ISO 9001:2015 § 9.2) ---\nmodel AuditoriaInterna {\n  id_auditoria     String    @id @default(uuid()) @db.Uuid\n  tenant_id        String    @db.Uuid\n  proyecto_id      String?   @db.Uuid\n  codigo           String    @db.VarChar(30)\n  titulo           String    @db.VarChar(255)\n  alcance          String?   @db.Text\n  criterios        String?   @db.Text\n  auditor_lider_id String    @db.Uuid\n  fecha_inicio     DateTime?\n  fecha_fin        DateTime?\n  estado           String    @default(\"PROGRAMADA\") // PROGRAMADA|EN_CURSO|COMPLETADA|CANCELADA\n  observaciones    String?   @db.Text\n  created_at       DateTime  @default(now())\n  updated_at       DateTime  @updatedAt\n\n  hallazgos HallazgoAuditoria[]\n\n  @@unique([tenant_id, codigo])\n  @@index([tenant_id])\n  @@index([tenant_id, estado])\n  @@map(\"auditorias_internas\")\n}\n\n// --- Hallazgos de Auditoría ---\nmodel HallazgoAuditoria {\n  id_hallazgo      String           @id @default(uuid()) @db.Uuid\n  tenant_id        String           @db.Uuid\n  auditoria_id     String           @db.Uuid\n  auditoria        AuditoriaInterna @relation(fields: [auditoria_id], references: [id_auditoria], onDelete: Cascade)\n  descripcion      String           @db.Text\n  tipo             String           @default(\"MENOR\") // MAYOR|MENOR|OBSERVACION\n  proceso_afectado String?          @db.VarChar(100)\n  evidencia        String?          @db.Text\n  accion_requerida String?          @db.Text\n  estado           String           @default(\"ABIERTO\") // ABIERTO|EN_SEGUIMIENTO|CERRADO\n  nc_id            String?          @db.Uuid\n  created_at       DateTime         @default(now())\n\n  @@index([auditoria_id])\n  @@index([tenant_id])\n  @@map(\"hallazgos_auditoria\")\n}\n",
  "inlineSchemaHash": "013fa190408c472b72b0009a3066fc0eaa91791268e2d209980cfd0e2e729a19",
  "copyEngine": true
}

const fs = require('fs')

config.dirname = __dirname
if (!fs.existsSync(path.join(__dirname, 'schema.prisma'))) {
  const alternativePaths = [
    "src/generated/prisma",
    "generated/prisma",
  ]
  
  const alternativePath = alternativePaths.find((altPath) => {
    return fs.existsSync(path.join(process.cwd(), altPath, 'schema.prisma'))
  }) ?? alternativePaths[0]

  config.dirname = path.join(process.cwd(), alternativePath)
  config.isBundled = true
}

config.runtimeDataModel = JSON.parse("{\"models\":{\"Documento\":{\"dbName\":\"documentos\",\"fields\":[{\"name\":\"id_documento\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"codigo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"titulo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tipo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"descripcion\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"proyecto_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"responsable_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"estado_actual\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"BORRADOR\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"version_actual\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"versiones\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"VersionDocumento\",\"relationName\":\"DocumentoToVersionDocumento\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"tenant_id\",\"codigo\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"tenant_id\",\"codigo\"]}],\"isGenerated\":false},\"VersionDocumento\":{\"dbName\":\"versiones_documento\",\"fields\":[{\"name\":\"id_version\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"documento_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"numero_version\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"estado\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"BORRADOR\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cambios\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"archivo_nombre\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"archivo_ruta\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"archivo_mime\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"archivo_tamano\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"creado_por\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"revisado_por\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"aprobado_por\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fecha_emision\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fecha_obsoleto\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"documento\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Documento\",\"relationName\":\"DocumentoToVersionDocumento\",\"relationFromFields\":[\"documento_id\"],\"relationToFields\":[\"id_documento\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"documento_id\",\"numero_version\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"documento_id\",\"numero_version\"]}],\"isGenerated\":false},\"NoConformidad\":{\"dbName\":\"no_conformidades\",\"fields\":[{\"name\":\"id_nc\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"proyecto_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"codigo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"titulo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"descripcion\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fuente\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"INTERNA\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"estado\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"ABIERTA\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"detectado_por\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"responsable_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fecha_deteccion\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fecha_limite\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fecha_cierre\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"causa_raiz\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"acciones\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"AccionCorrectiva\",\"relationName\":\"AccionCorrectivaToNoConformidad\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"tenant_id\",\"codigo\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"tenant_id\",\"codigo\"]}],\"isGenerated\":false},\"AccionCorrectiva\":{\"dbName\":\"acciones_correctivas\",\"fields\":[{\"name\":\"id_accion\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nc_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nc\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"NoConformidad\",\"relationName\":\"AccionCorrectivaToNoConformidad\",\"relationFromFields\":[\"nc_id\"],\"relationToFields\":[\"id_nc\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"descripcion\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"responsable_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fecha_compromiso\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"estado\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"PENDIENTE\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"evidencia\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"verificado_por\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fecha_verificacion\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"AuditoriaInterna\":{\"dbName\":\"auditorias_internas\",\"fields\":[{\"name\":\"id_auditoria\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"proyecto_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"codigo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"titulo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"alcance\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"criterios\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"auditor_lider_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fecha_inicio\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fecha_fin\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"estado\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"PROGRAMADA\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"observaciones\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"hallazgos\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"HallazgoAuditoria\",\"relationName\":\"AuditoriaInternaToHallazgoAuditoria\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"tenant_id\",\"codigo\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"tenant_id\",\"codigo\"]}],\"isGenerated\":false},\"HallazgoAuditoria\":{\"dbName\":\"hallazgos_auditoria\",\"fields\":[{\"name\":\"id_hallazgo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"auditoria_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"auditoria\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"AuditoriaInterna\",\"relationName\":\"AuditoriaInternaToHallazgoAuditoria\",\"relationFromFields\":[\"auditoria_id\"],\"relationToFields\":[\"id_auditoria\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"descripcion\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tipo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"MENOR\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"proceso_afectado\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"evidencia\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"accion_requerida\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"estado\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"ABIERTO\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nc_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false}},\"enums\":{},\"types\":{}}")
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
path.join(process.cwd(), "src/generated/prisma/query_engine-windows.dll.node")
// file annotations for bundling tools to include these files
path.join(__dirname, "schema.prisma");
path.join(process.cwd(), "src/generated/prisma/schema.prisma")
