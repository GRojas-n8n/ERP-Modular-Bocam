
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
} = require('./runtime/edge.js')


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





/**
 * Enums
 */
exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.CategoriaGastoScalarFieldEnum = {
  id_categoria: 'id_categoria',
  tenant_id: 'tenant_id',
  proyecto_id: 'proyecto_id',
  nombre: 'nombre',
  es_predefinida: 'es_predefinida',
  activa: 'activa',
  created_at: 'created_at'
};

exports.Prisma.ProyectoCostosConfigScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  proyecto_id: 'proyecto_id',
  estado: 'estado',
  activado_por: 'activado_por',
  fecha_activacion: 'fecha_activacion',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.InsumoScalarFieldEnum = {
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

exports.Prisma.PresupuestoBaseScalarFieldEnum = {
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

exports.Prisma.ConceptoInsumoScalarFieldEnum = {
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

exports.Prisma.FichaTecnicaInsumoScalarFieldEnum = {
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
  APROBADO: 'APROBADO',
  LIBERADO: 'LIBERADO',
  CONGELADO: 'CONGELADO'
};

exports.Prisma.ModelName = {
  CategoriaGasto: 'CategoriaGasto',
  ProyectoCostosConfig: 'ProyectoCostosConfig',
  Insumo: 'Insumo',
  PresupuestoBase: 'PresupuestoBase',
  Concepto: 'Concepto',
  ConceptoInsumo: 'ConceptoInsumo',
  FichaTecnicaInsumo: 'FichaTecnicaInsumo'
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
      "value": "D:\\01_PROFESIONAL\\Mis_Scripts_IA\\Flujos Agenticos\\Proyecto ERP MODULAR Bocam\\apps\\gerencia-tecnica\\src\\generated\\prisma",
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
    "sourceFilePath": "D:\\01_PROFESIONAL\\Mis_Scripts_IA\\Flujos Agenticos\\Proyecto ERP MODULAR Bocam\\apps\\gerencia-tecnica\\prisma\\schema.prisma",
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
  "inlineSchema": "// ---------------------------------------------------------------------------\n// Propiedad Intelectual: Constructora Bocam, S. A. de C.V.\n// Clasificación: Estrictamente Confidencial.\n// Módulo: Gerencia Técnica (Ingeniería y Presupuestos)\n// Responsabilidad: Catálogo Maestro de Insumos y Presupuesto Base.\n// ---------------------------------------------------------------------------\n\ngenerator client {\n  provider = \"prisma-client-js\"\n  output   = \"../src/generated/prisma\"\n  // clientExtensions ya es GA en Prisma 5+, no se requiere previewFeatures.\n}\n\ndatasource db {\n  provider = \"postgresql\"\n  url      = env(\"DATABASE_URL\")\n}\n\n// ======================================================================\n// ENTIDADES MAESTRAS (DUEÑO: Gerencia Técnica)\n// ======================================================================\n\n/// Catálogo de categorías de gasto por proyecto — gestionadas por Control de Proyectos.\n/// Predefinidas por el sistema (seed); personalizables por tenant antes de activar el proyecto.\n/// Congeladas una vez que el proyecto pasa a estado ACTIVO.\nmodel CategoriaGasto {\n  id_categoria   String   @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  tenant_id      String   @db.Uuid\n  proyecto_id    String   @db.Uuid\n  nombre         String   @db.VarChar(100)\n  es_predefinida Boolean  @default(false)\n  activa         Boolean  @default(true)\n  created_at     DateTime @default(now()) @db.Timestamptz(6)\n\n  insumos Insumo[]\n\n  @@index([tenant_id, proyecto_id], name: \"idx_categoria_gasto_tenant_proyecto\")\n  @@map(\"categorias_gasto\")\n}\n\n/// Configuración de control de costos por proyecto.\n/// Almacena el estado CONFIGURACION/ACTIVO/CERRADO para congelar categorías.\nmodel ProyectoCostosConfig {\n  id               String    @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  tenant_id        String    @db.Uuid\n  proyecto_id      String    @db.Uuid\n  estado           String    @default(\"CONFIGURACION\") @db.VarChar(20)\n  activado_por     String?   @db.Uuid\n  fecha_activacion DateTime?\n  created_at       DateTime  @default(now()) @db.Timestamptz(6)\n  updated_at       DateTime  @updatedAt @db.Timestamptz(6)\n\n  @@unique([tenant_id, proyecto_id], name: \"uq_proyecto_costos_config\")\n  @@index([tenant_id], name: \"idx_proyecto_costos_config_tenant\")\n  @@map(\"proyecto_costos_config\")\n}\n\n/// Catálogo Maestro de Insumos: Materiales, Mano de Obra, Equipo, Subcontratos.\n/// Tabla maestra con aislamiento por tenant_id (RLS).\nmodel Insumo {\n  id        String @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  tenant_id String @db.Uuid\n\n  clave         String     @db.VarChar(50)\n  descripcion   String     @db.Text\n  unidad_medida String     @db.VarChar(20)\n  tipo_insumo   TipoInsumo\n  costo_base    Decimal    @db.Decimal(12, 4)\n\n  /// Categoría de gasto asignada por Control de Proyectos (nullable hasta clasificar)\n  categoria_gasto_id String?         @db.Uuid\n  categoria_gasto    CategoriaGasto? @relation(fields: [categoria_gasto_id], references: [id_categoria])\n\n  activo     Boolean  @default(true)\n  created_at DateTime @default(now()) @db.Timestamptz(6)\n  updated_at DateTime @updatedAt @db.Timestamptz(6)\n\n  // Composiciones APU que usan este insumo\n  concepto_insumos ConceptoInsumo[]\n\n  // Índices de rendimiento Multi-Tenant\n  @@unique([tenant_id, clave], name: \"uq_insumo_tenant_clave\")\n  @@index([tenant_id], name: \"idx_insumo_tenant\")\n  @@index([tenant_id, categoria_gasto_id], name: \"idx_insumo_categoria\")\n  @@map(\"insumos\")\n}\n\n/// Presupuesto Base de un proyecto/centro de costos.\n/// Tabla transaccional: requiere OBLIGATORIAMENTE tenant_id + proyecto_id.\nmodel PresupuestoBase {\n  id          String @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  tenant_id   String @db.Uuid\n  proyecto_id String @db.Uuid\n\n  version       Int               @default(1)\n  estado        EstadoPresupuesto @default(BORRADOR)\n  importe_total Decimal           @default(0.00) @db.Decimal(15, 2)\n\n  aprobado_por     String?   @db.Uuid\n  fecha_aprobacion DateTime?\n\n  conceptos Concepto[]\n\n  created_at DateTime @default(now()) @db.Timestamptz(6)\n  updated_at DateTime @updatedAt @db.Timestamptz(6)\n\n  // Índices de rendimiento Multi-Tenant + Multi-Proyecto\n  @@index([tenant_id, proyecto_id], name: \"idx_presupuesto_tenant_proyecto\")\n  @@index([tenant_id], name: \"idx_presupuesto_tenant\")\n  @@map(\"presupuestos_base\")\n}\n\n/// Concepto de Obra: Línea o partida específica de un presupuesto.\n/// Tabla transaccional hija, hereda tenant_id y proyecto_id del padre.\nmodel Concepto {\n  id             String          @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  tenant_id      String          @db.Uuid\n  proyecto_id    String          @db.Uuid\n  presupuesto_id String          @db.Uuid\n  presupuesto    PresupuestoBase @relation(fields: [presupuesto_id], references: [id], onDelete: Cascade)\n\n  clave           String  @db.VarChar(50)\n  descripcion     String  @db.Text\n  unidad_medida   String  @db.VarChar(20)\n  cantidad        Decimal @db.Decimal(12, 4)\n  precio_unitario Decimal @db.Decimal(12, 4)\n  importe         Decimal @db.Decimal(15, 2)\n\n  created_at DateTime @default(now()) @db.Timestamptz(6)\n  updated_at DateTime @updatedAt @db.Timestamptz(6)\n\n  // Composición APU: insumos que componen este concepto\n  insumos ConceptoInsumo[]\n\n  // Índices de rendimiento Multi-Tenant + Multi-Proyecto\n  @@index([tenant_id, proyecto_id], name: \"idx_concepto_tenant_proyecto\")\n  @@index([tenant_id, presupuesto_id], name: \"idx_concepto_tenant_presupuesto\")\n  @@map(\"conceptos\")\n}\n\n/// Composición APU: relación entre un Concepto y sus Insumos (rendimientos y cantidades).\n/// Se pobla al importar el archivo \"ANÁLISIS DE PRECIOS UNITARIOS\" de OPUS.\n/// Permite calcular take-off de materiales a partir del avance reportado.\nmodel ConceptoInsumo {\n  id          String @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  tenant_id   String @db.Uuid\n  proyecto_id String @db.Uuid\n\n  concepto_id String   @db.Uuid\n  concepto    Concepto @relation(fields: [concepto_id], references: [id], onDelete: Cascade)\n  insumo_id   String   @db.Uuid\n  insumo      Insumo   @relation(fields: [insumo_id], references: [id])\n\n  tipo_insumo    TipoInsumo\n  /// Cantidad del insumo por unidad de concepto (ej. 0.15 M3 de oxígeno por M3 excavado)\n  cantidad       Decimal    @db.Decimal(12, 4)\n  /// Rendimiento: unidades de producción por jornada/hora (OPUS: col \"Rendimiento\")\n  rendimiento    Decimal    @default(0) @db.Decimal(12, 4)\n  /// Costo unitario del insumo al momento de importación del APU\n  costo_unitario Decimal    @default(0) @db.Decimal(12, 4)\n\n  created_at DateTime @default(now()) @db.Timestamptz(6)\n  updated_at DateTime @updatedAt @db.Timestamptz(6)\n\n  @@unique([concepto_id, insumo_id], name: \"uq_concepto_insumo\")\n  @@index([tenant_id, proyecto_id], name: \"idx_ci_tenant_proyecto\")\n  @@index([tenant_id, concepto_id], name: \"idx_ci_concepto\")\n  @@map(\"concepto_insumos\")\n}\n\n// ======================================================================\n// ENUMERACIONES\n// ======================================================================\n\nenum TipoInsumo {\n  MATERIAL\n  MANO_DE_OBRA\n  EQUIPO\n  SUBCONTRATO\n  INDIRECTO\n}\n\nenum EstadoPresupuesto {\n  BORRADOR\n  EN_REVISION\n  APROBADO\n  LIBERADO // Emite evento: PresupuestoBaseLiberado\n  CONGELADO\n}\n\n// ======================================================================\n// FICHAS TÉCNICAS DE INSUMO\n// Documentos (PDF, Word, imágenes) que los proveedores envían como\n// especificación del material/equipo. Vinculados al insumo del catálogo.\n// ======================================================================\n\nmodel FichaTecnicaInsumo {\n  id_ficha      String   @id @default(uuid()) @db.Uuid\n  tenant_id     String   @db.Uuid\n  insumo_id     String   @db.Uuid\n  proveedor_ref String?  @db.VarChar(100)\n  nombre_doc    String   @db.VarChar(255)\n  ruta_archivo  String   @db.Text\n  mime_type     String   @db.VarChar(100)\n  tamano_bytes  Int\n  subido_por    String   @db.Uuid\n  created_at    DateTime @default(now())\n\n  @@index([tenant_id, insumo_id])\n  @@map(\"fichas_tecnicas_insumo\")\n}\n",
  "inlineSchemaHash": "822cfa5dd49cb3dafac050c671b66aeca4214d05913e4e727e8feb333e512c97",
  "copyEngine": true
}
config.dirname = '/'

config.runtimeDataModel = JSON.parse("{\"models\":{\"CategoriaGasto\":{\"dbName\":\"categorias_gasto\",\"fields\":[{\"name\":\"id_categoria\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"proyecto_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nombre\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"es_predefinida\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"activa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"insumos\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Insumo\",\"relationName\":\"CategoriaGastoToInsumo\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false,\"documentation\":\"Catálogo de categorías de gasto por proyecto — gestionadas por Control de Proyectos.\\\\nPredefinidas por el sistema (seed); personalizables por tenant antes de activar el proyecto.\\\\nCongeladas una vez que el proyecto pasa a estado ACTIVO.\"},\"ProyectoCostosConfig\":{\"dbName\":\"proyecto_costos_config\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"proyecto_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"estado\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"CONFIGURACION\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"activado_por\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fecha_activacion\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[[\"tenant_id\",\"proyecto_id\"]],\"uniqueIndexes\":[{\"name\":\"uq_proyecto_costos_config\",\"fields\":[\"tenant_id\",\"proyecto_id\"]}],\"isGenerated\":false,\"documentation\":\"Configuración de control de costos por proyecto.\\\\nAlmacena el estado CONFIGURACION/ACTIVO/CERRADO para congelar categorías.\"},\"Insumo\":{\"dbName\":\"insumos\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"clave\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"descripcion\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"unidad_medida\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tipo_insumo\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"TipoInsumo\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"costo_base\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"categoria_gasto_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false,\"documentation\":\"Categoría de gasto asignada por Control de Proyectos (nullable hasta clasificar)\"},{\"name\":\"categoria_gasto\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"CategoriaGasto\",\"relationName\":\"CategoriaGastoToInsumo\",\"relationFromFields\":[\"categoria_gasto_id\"],\"relationToFields\":[\"id_categoria\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"activo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"concepto_insumos\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ConceptoInsumo\",\"relationName\":\"ConceptoInsumoToInsumo\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"tenant_id\",\"clave\"]],\"uniqueIndexes\":[{\"name\":\"uq_insumo_tenant_clave\",\"fields\":[\"tenant_id\",\"clave\"]}],\"isGenerated\":false,\"documentation\":\"Catálogo Maestro de Insumos: Materiales, Mano de Obra, Equipo, Subcontratos.\\\\nTabla maestra con aislamiento por tenant_id (RLS).\"},\"PresupuestoBase\":{\"dbName\":\"presupuestos_base\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"proyecto_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"version\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":1,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"estado\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"EstadoPresupuesto\",\"default\":\"BORRADOR\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"importe_total\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"aprobado_por\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fecha_aprobacion\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"conceptos\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Concepto\",\"relationName\":\"ConceptoToPresupuestoBase\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false,\"documentation\":\"Presupuesto Base de un proyecto/centro de costos.\\\\nTabla transaccional: requiere OBLIGATORIAMENTE tenant_id + proyecto_id.\"},\"Concepto\":{\"dbName\":\"conceptos\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"proyecto_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"presupuesto_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"presupuesto\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"PresupuestoBase\",\"relationName\":\"ConceptoToPresupuestoBase\",\"relationFromFields\":[\"presupuesto_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"clave\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"descripcion\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"unidad_medida\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cantidad\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"precio_unitario\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"importe\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"insumos\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ConceptoInsumo\",\"relationName\":\"ConceptoToConceptoInsumo\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false,\"documentation\":\"Concepto de Obra: Línea o partida específica de un presupuesto.\\\\nTabla transaccional hija, hereda tenant_id y proyecto_id del padre.\"},\"ConceptoInsumo\":{\"dbName\":\"concepto_insumos\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"proyecto_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"concepto_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"concepto\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Concepto\",\"relationName\":\"ConceptoToConceptoInsumo\",\"relationFromFields\":[\"concepto_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"insumo_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"insumo\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Insumo\",\"relationName\":\"ConceptoInsumoToInsumo\",\"relationFromFields\":[\"insumo_id\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tipo_insumo\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"TipoInsumo\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cantidad\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false,\"documentation\":\"Cantidad del insumo por unidad de concepto (ej. 0.15 M3 de oxígeno por M3 excavado)\"},{\"name\":\"rendimiento\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false,\"documentation\":\"Rendimiento: unidades de producción por jornada/hora (OPUS: col \\\"Rendimiento\\\")\"},{\"name\":\"costo_unitario\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false,\"documentation\":\"Costo unitario del insumo al momento de importación del APU\"},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[[\"concepto_id\",\"insumo_id\"]],\"uniqueIndexes\":[{\"name\":\"uq_concepto_insumo\",\"fields\":[\"concepto_id\",\"insumo_id\"]}],\"isGenerated\":false,\"documentation\":\"Composición APU: relación entre un Concepto y sus Insumos (rendimientos y cantidades).\\\\nSe pobla al importar el archivo \\\"ANÁLISIS DE PRECIOS UNITARIOS\\\" de OPUS.\\\\nPermite calcular take-off de materiales a partir del avance reportado.\"},\"FichaTecnicaInsumo\":{\"dbName\":\"fichas_tecnicas_insumo\",\"fields\":[{\"name\":\"id_ficha\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"insumo_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"proveedor_ref\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nombre_doc\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ruta_archivo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"mime_type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tamano_bytes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"subido_por\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false}},\"enums\":{\"TipoInsumo\":{\"values\":[{\"name\":\"MATERIAL\",\"dbName\":null},{\"name\":\"MANO_DE_OBRA\",\"dbName\":null},{\"name\":\"EQUIPO\",\"dbName\":null},{\"name\":\"SUBCONTRATO\",\"dbName\":null},{\"name\":\"INDIRECTO\",\"dbName\":null}],\"dbName\":null},\"EstadoPresupuesto\":{\"values\":[{\"name\":\"BORRADOR\",\"dbName\":null},{\"name\":\"EN_REVISION\",\"dbName\":null},{\"name\":\"APROBADO\",\"dbName\":null},{\"name\":\"LIBERADO\",\"dbName\":null},{\"name\":\"CONGELADO\",\"dbName\":null}],\"dbName\":null}},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)
config.engineWasm = undefined

config.injectableEdgeEnv = () => ({
  parsed: {
    DATABASE_URL: typeof globalThis !== 'undefined' && globalThis['DATABASE_URL'] || typeof process !== 'undefined' && process.env && process.env.DATABASE_URL || undefined
  }
})

if (typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined) {
  Debug.enable(typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined)
}

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

