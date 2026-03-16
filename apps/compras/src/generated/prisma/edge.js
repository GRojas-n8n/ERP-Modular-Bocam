
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

exports.Prisma.ProveedorScalarFieldEnum = {
  id_proveedor: 'id_proveedor',
  tenant_id: 'tenant_id',
  rfc_tax_id: 'rfc_tax_id',
  razon_social: 'razon_social',
  email_contacto: 'email_contacto',
  telefono: 'telefono',
  estatus: 'estatus'
};

exports.Prisma.RequisicionScalarFieldEnum = {
  id_requisicion: 'id_requisicion',
  tenant_id: 'tenant_id',
  proyecto_id: 'proyecto_id',
  codigo: 'codigo',
  fecha_solicitud: 'fecha_solicitud',
  solicitante_id: 'solicitante_id',
  prioridad: 'prioridad',
  estado: 'estado',
  observaciones: 'observaciones'
};

exports.Prisma.RequisicionItemScalarFieldEnum = {
  id_item: 'id_item',
  tenant_id: 'tenant_id',
  proyecto_id: 'proyecto_id',
  requisicion_id: 'requisicion_id',
  insumo_id: 'insumo_id',
  cantidad: 'cantidad',
  notas: 'notas'
};

exports.Prisma.OrdenCompraScalarFieldEnum = {
  id_orden: 'id_orden',
  tenant_id: 'tenant_id',
  proyecto_id: 'proyecto_id',
  proveedor_id: 'proveedor_id',
  codigo: 'codigo',
  fecha_emision: 'fecha_emision',
  estado: 'estado',
  moneda: 'moneda',
  tipo_cambio: 'tipo_cambio',
  subtotal: 'subtotal',
  iva: 'iva',
  total: 'total'
};

exports.Prisma.OrdenCompraItemScalarFieldEnum = {
  id_item: 'id_item',
  tenant_id: 'tenant_id',
  proyecto_id: 'proyecto_id',
  orden_id: 'orden_id',
  insumo_id: 'insumo_id',
  cantidad: 'cantidad',
  precio_unitario: 'precio_unitario',
  importe: 'importe'
};

exports.Prisma.CuadroComparativoScalarFieldEnum = {
  id_cuadro: 'id_cuadro',
  tenant_id: 'tenant_id',
  proyecto_id: 'proyecto_id',
  requisicion_id: 'requisicion_id',
  codigo: 'codigo',
  fecha_creacion: 'fecha_creacion',
  estado: 'estado',
  notas: 'notas'
};

exports.Prisma.ComparativaDetalleScalarFieldEnum = {
  id_detalle: 'id_detalle',
  tenant_id: 'tenant_id',
  proyecto_id: 'proyecto_id',
  cuadro_id: 'cuadro_id',
  proveedor_id: 'proveedor_id',
  insumo_id: 'insumo_id',
  precio_ofertado: 'precio_ofertado',
  tiempo_entrega: 'tiempo_entrega',
  es_ganador: 'es_ganador'
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
  Proveedor: 'Proveedor',
  Requisicion: 'Requisicion',
  RequisicionItem: 'RequisicionItem',
  OrdenCompra: 'OrdenCompra',
  OrdenCompraItem: 'OrdenCompraItem',
  CuadroComparativo: 'CuadroComparativo',
  ComparativaDetalle: 'ComparativaDetalle'
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
      "value": "D:\\Mis_Scripts_IA\\Flujos Agenticos\\Proyecto ERP MODULAR Bocam\\apps\\compras\\src\\generated\\prisma",
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
    "sourceFilePath": "D:\\Mis_Scripts_IA\\Flujos Agenticos\\Proyecto ERP MODULAR Bocam\\apps\\compras\\prisma\\schema.prisma",
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
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "DATABASE_URL",
        "value": null
      }
    }
  },
  "inlineSchema": "// -----------------------------------------------------------------------------\n// Propiedad Intelectual: Constructora Bocam, S. A. de C.V.\n// Módulo: Compras (Procuración)\n// -----------------------------------------------------------------------------\n\ngenerator client {\n  provider = \"prisma-client-js\"\n  output   = \"../src/generated/prisma\"\n}\n\ndatasource db {\n  provider = \"postgresql\"\n  url      = env(\"DATABASE_URL\")\n}\n\n// --- Entidad 3 MDM: Proveedor (Tercero) ---\n// Módulo Propietario: Finanzas (Simulado aquí para el MVP de Compras)\nmodel Proveedor {\n  id_proveedor   String  @id @default(uuid()) @db.Uuid\n  tenant_id      String  @db.Uuid\n  rfc_tax_id     String  @db.VarChar(20)\n  razon_social   String  @db.VarChar(255)\n  email_contacto String? @db.VarChar(100)\n  telefono       String? @db.VarChar(20)\n  estatus        String  @default(\"ACTIVO\") // ACTIVO, VETADO, PENDIENTE\n\n  ordenes      OrdenCompra[]\n  comparativas ComparativaDetalle[]\n\n  @@unique([tenant_id, rfc_tax_id])\n  @@map(\"proveedores\")\n}\n\n// --- Transaccional: Requisiciones ---\nmodel Requisicion {\n  id_requisicion  String   @id @default(uuid()) @db.Uuid\n  tenant_id       String   @db.Uuid\n  proyecto_id     String   @db.Uuid // Centro de Costos\n  codigo          String   @db.VarChar(50) // Ej. REQ-2026-001\n  fecha_solicitud DateTime @default(now())\n  solicitante_id  String   @db.Uuid // Referencia a Usuario_Identidad\n  prioridad       String   @default(\"NORMAL\") // BAJA, NORMAL, URGENTE\n  estado          String   @default(\"BORRADOR\") // BORRADOR, PENDIENTE, APROBADA, RECHAZADA, COMPRADA\n  observaciones   String?  @db.Text\n\n  items RequisicionItem[]\n\n  @@unique([tenant_id, codigo])\n  @@index([tenant_id, proyecto_id])\n  @@map(\"requisiciones\")\n}\n\nmodel RequisicionItem {\n  id_item        String  @id @default(uuid()) @db.Uuid\n  tenant_id      String  @db.Uuid\n  proyecto_id    String  @db.Uuid\n  requisicion_id String  @db.Uuid\n  insumo_id      String  @db.Uuid // Referencia a MDM: Insumo_Catalogo (Propiedad de Gerencia Técnica)\n  cantidad       Decimal @db.Decimal(18, 4)\n  notas          String? @db.Text\n\n  requisicion Requisicion @relation(fields: [requisicion_id], references: [id_requisicion], onDelete: Cascade)\n\n  @@index([tenant_id, requisicion_id])\n  @@map(\"requisiciones_items\")\n}\n\n// --- Transaccional: Órdenes de Compra ---\nmodel OrdenCompra {\n  id_orden      String   @id @default(uuid()) @db.Uuid\n  tenant_id     String   @db.Uuid\n  proyecto_id   String   @db.Uuid // Centro de Costos\n  proveedor_id  String   @db.Uuid\n  codigo        String   @db.VarChar(50) // Ej. OC-2026-001\n  fecha_emision DateTime @default(now())\n  estado        String   @default(\"BORRADOR\") // BORRADOR, PENDIENTE, APROBADA, EMITIDA, RECIBIDA, CANCELADA\n  moneda        String   @default(\"MXN\")\n  tipo_cambio   Decimal  @default(1.0) @db.Decimal(18, 4)\n  subtotal      Decimal  @db.Decimal(18, 2)\n  iva           Decimal  @db.Decimal(18, 2)\n  total         Decimal  @db.Decimal(18, 2)\n\n  proveedor Proveedor         @relation(fields: [proveedor_id], references: [id_proveedor])\n  items     OrdenCompraItem[]\n\n  @@unique([tenant_id, codigo])\n  @@index([tenant_id, proyecto_id])\n  @@map(\"ordenes_compra\")\n}\n\nmodel OrdenCompraItem {\n  id_item         String  @id @default(uuid()) @db.Uuid\n  tenant_id       String  @db.Uuid\n  proyecto_id     String  @db.Uuid\n  orden_id        String  @db.Uuid\n  insumo_id       String  @db.Uuid // Referencia a MDM: Insumo_Catalogo\n  cantidad        Decimal @db.Decimal(18, 4)\n  precio_unitario Decimal @db.Decimal(18, 4)\n  importe         Decimal @db.Decimal(18, 2)\n\n  orden OrdenCompra @relation(fields: [orden_id], references: [id_orden], onDelete: Cascade)\n\n  @@index([tenant_id, orden_id])\n  @@map(\"ordenes_compra_items\")\n}\n\n// --- Operativo: Cuadros Comparativos ---\nmodel CuadroComparativo {\n  id_cuadro      String   @id @default(uuid()) @db.Uuid\n  tenant_id      String   @db.Uuid\n  proyecto_id    String   @db.Uuid\n  requisicion_id String   @db.Uuid\n  codigo         String   @db.VarChar(50) // Ej. CC-2026-001\n  fecha_creacion DateTime @default(now())\n  estado         String   @default(\"ABIERTO\") // ABIERTO, CERRADO, APROBADO\n  notas          String?  @db.Text\n\n  detalles ComparativaDetalle[]\n\n  @@unique([tenant_id, codigo])\n  @@index([tenant_id, proyecto_id])\n  @@map(\"cuadros_comparativos\")\n}\n\nmodel ComparativaDetalle {\n  id_detalle      String  @id @default(uuid()) @db.Uuid\n  tenant_id       String  @db.Uuid\n  proyecto_id     String  @db.Uuid\n  cuadro_id       String  @db.Uuid\n  proveedor_id    String  @db.Uuid\n  insumo_id       String  @db.Uuid\n  precio_ofertado Decimal @db.Decimal(18, 4)\n  tiempo_entrega  String? @db.VarChar(50)\n  es_ganador      Boolean @default(false)\n\n  cuadro    CuadroComparativo @relation(fields: [cuadro_id], references: [id_cuadro], onDelete: Cascade)\n  proveedor Proveedor         @relation(fields: [proveedor_id], references: [id_proveedor])\n\n  @@index([tenant_id, cuadro_id])\n  @@map(\"comparativas_detalles\")\n}\n",
  "inlineSchemaHash": "e0970be6068a33d0c319c1c1eeda084859b07d568f7f6e9cc4a537fde7d583d0",
  "copyEngine": true
}
config.dirname = '/'

config.runtimeDataModel = JSON.parse("{\"models\":{\"Proveedor\":{\"dbName\":\"proveedores\",\"fields\":[{\"name\":\"id_proveedor\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"rfc_tax_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"razon_social\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"email_contacto\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"telefono\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"estatus\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"ACTIVO\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ordenes\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"OrdenCompra\",\"relationName\":\"OrdenCompraToProveedor\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"comparativas\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ComparativaDetalle\",\"relationName\":\"ComparativaDetalleToProveedor\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"tenant_id\",\"rfc_tax_id\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"tenant_id\",\"rfc_tax_id\"]}],\"isGenerated\":false},\"Requisicion\":{\"dbName\":\"requisiciones\",\"fields\":[{\"name\":\"id_requisicion\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"proyecto_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"codigo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fecha_solicitud\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"solicitante_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"prioridad\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"NORMAL\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"estado\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"BORRADOR\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"observaciones\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"items\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"RequisicionItem\",\"relationName\":\"RequisicionToRequisicionItem\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"tenant_id\",\"codigo\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"tenant_id\",\"codigo\"]}],\"isGenerated\":false},\"RequisicionItem\":{\"dbName\":\"requisiciones_items\",\"fields\":[{\"name\":\"id_item\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"proyecto_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"requisicion_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"insumo_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cantidad\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"notas\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"requisicion\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Requisicion\",\"relationName\":\"RequisicionToRequisicionItem\",\"relationFromFields\":[\"requisicion_id\"],\"relationToFields\":[\"id_requisicion\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"OrdenCompra\":{\"dbName\":\"ordenes_compra\",\"fields\":[{\"name\":\"id_orden\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"proyecto_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"proveedor_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"codigo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fecha_emision\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"estado\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"BORRADOR\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"moneda\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"MXN\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tipo_cambio\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":1,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"subtotal\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"iva\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"total\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"proveedor\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Proveedor\",\"relationName\":\"OrdenCompraToProveedor\",\"relationFromFields\":[\"proveedor_id\"],\"relationToFields\":[\"id_proveedor\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"items\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"OrdenCompraItem\",\"relationName\":\"OrdenCompraToOrdenCompraItem\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"tenant_id\",\"codigo\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"tenant_id\",\"codigo\"]}],\"isGenerated\":false},\"OrdenCompraItem\":{\"dbName\":\"ordenes_compra_items\",\"fields\":[{\"name\":\"id_item\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"proyecto_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"orden_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"insumo_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cantidad\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"precio_unitario\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"importe\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"orden\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"OrdenCompra\",\"relationName\":\"OrdenCompraToOrdenCompraItem\",\"relationFromFields\":[\"orden_id\"],\"relationToFields\":[\"id_orden\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"CuadroComparativo\":{\"dbName\":\"cuadros_comparativos\",\"fields\":[{\"name\":\"id_cuadro\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"proyecto_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"requisicion_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"codigo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fecha_creacion\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"estado\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"ABIERTO\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"notas\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"detalles\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ComparativaDetalle\",\"relationName\":\"ComparativaDetalleToCuadroComparativo\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"tenant_id\",\"codigo\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"tenant_id\",\"codigo\"]}],\"isGenerated\":false},\"ComparativaDetalle\":{\"dbName\":\"comparativas_detalles\",\"fields\":[{\"name\":\"id_detalle\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"proyecto_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cuadro_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"proveedor_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"insumo_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"precio_ofertado\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tiempo_entrega\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"es_ganador\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cuadro\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"CuadroComparativo\",\"relationName\":\"ComparativaDetalleToCuadroComparativo\",\"relationFromFields\":[\"cuadro_id\"],\"relationToFields\":[\"id_cuadro\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"proveedor\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Proveedor\",\"relationName\":\"ComparativaDetalleToProveedor\",\"relationFromFields\":[\"proveedor_id\"],\"relationToFields\":[\"id_proveedor\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false}},\"enums\":{},\"types\":{}}")
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

