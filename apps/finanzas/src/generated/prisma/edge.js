
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

exports.Prisma.PresupuestoAsignadoScalarFieldEnum = {
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

exports.Prisma.MovimientoPresupuestalScalarFieldEnum = {
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

exports.Prisma.ProgramaPagosScalarFieldEnum = {
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
  PresupuestoAsignado: 'PresupuestoAsignado',
  MovimientoPresupuestal: 'MovimientoPresupuestal',
  ProgramaPagos: 'ProgramaPagos'
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
      "value": "D:\\Mis_Scripts_IA\\Flujos Agenticos\\Proyecto ERP MODULAR Bocam\\apps\\finanzas\\src\\generated\\prisma",
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
    "sourceFilePath": "D:\\Mis_Scripts_IA\\Flujos Agenticos\\Proyecto ERP MODULAR Bocam\\apps\\finanzas\\prisma\\schema.prisma",
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": "../../../.env",
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
  "inlineSchema": "// -----------------------------------------------------------------------------\n// Propiedad Intelectual: Constructora Bocam, S. A. de C.V.\n// Módulo: Finanzas (Tesorería y Flujo de Caja)\n//\n// ARQUITECTURA:\n// Este esquema es INDEPENDIENTE de los demás módulos (Soberanía de Datos).\n// Contiene ÚNICAMENTE las tablas financieras: presupuestos asignados,\n// movimientos presupuestales y programación de pagos.\n// Los demás módulos consultan la suficiencia presupuestal via API HTTP.\n// -----------------------------------------------------------------------------\n\ngenerator client {\n  provider = \"prisma-client-js\"\n  output   = \"../src/generated/prisma\"\n}\n\ndatasource db {\n  provider = \"postgresql\"\n  url      = env(\"DATABASE_URL\")\n}\n\n// ─── Entidad MDM: Presupuesto Asignado (por Proyecto / Centro de Costos) ────\n// Representa la bolsa de dinero autorizada para cada proyecto.\n// El superintendente o director financiero define este techo presupuestal.\nmodel PresupuestoAsignado {\n  id_presupuesto String @id @default(uuid()) @db.Uuid\n  tenant_id      String @db.Uuid\n  proyecto_id    String @db.Uuid // Centro de Costos\n\n  codigo             String  @db.VarChar(50) // Ej. PRES-2026-GUA-01\n  descripcion        String  @db.VarChar(500)\n  monto_autorizado   Decimal @db.Decimal(18, 2) // Techo máximo aprobado\n  monto_ejercido     Decimal @default(0) @db.Decimal(18, 2) // Total gastado\n  monto_comprometido Decimal @default(0) @db.Decimal(18, 2) // Congelado por OC emitidas\n  monto_disponible   Decimal @default(0) @db.Decimal(18, 2) // = autorizado - ejercido - comprometido\n  moneda             String  @default(\"MXN\") @db.VarChar(5)\n\n  // Clasificación presupuestal (CAPÍTULO de gasto)\n  capitulo String @default(\"MATERIALES\") // MATERIALES, MANO_OBRA, SUBCONTRATOS, EQUIPOS, INDIRECTOS\n  estatus  String @default(\"ACTIVO\") // ACTIVO, CERRADO, SUSPENDIDO\n\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  movimientos    MovimientoPresupuestal[]\n  programa_pagos ProgramaPagos[]\n\n  @@unique([tenant_id, proyecto_id, codigo])\n  @@index([tenant_id, proyecto_id])\n  @@index([tenant_id, proyecto_id, capitulo])\n  @@map(\"presupuestos_asignados\")\n}\n\n// ─── Transaccional: Movimiento Presupuestal ─────────────────────────────────\n// Registro inmutable de cada operación que afecta el presupuesto.\n// Patrón Event-Sourcing: NUNCA se modifica un movimiento, solo se crean nuevos.\nmodel MovimientoPresupuestal {\n  id_movimiento String @id @default(uuid()) @db.Uuid\n  tenant_id     String @db.Uuid\n  proyecto_id   String @db.Uuid // Centro de Costos\n\n  presupuesto_id String  @db.Uuid\n  tipo           String // COMPROMISO, DEVENGADO, EJERCIDO, LIBERACION, TRANSFERENCIA\n  concepto       String  @db.VarChar(500)\n  monto          Decimal @db.Decimal(18, 2)\n  moneda         String  @default(\"MXN\") @db.VarChar(5)\n\n  // Trazabilidad inter-módulos (ANTI-JOIN: Solo UUIDs, nunca FK cruzada)\n  referencia_modulo  String? @db.VarChar(50) // Ej. \"compras\", \"gerencia-tecnica\"\n  referencia_entidad String? @db.VarChar(50) // Ej. \"OrdenCompra\", \"Estimacion\"\n  referencia_id      String? @db.Uuid // UUID de la entidad origen\n  referencia_codigo  String? @db.VarChar(50) // Ej. \"OC-2026-001\" (para lectura humana)\n\n  usuario_id     String   @db.Uuid // Quién ejecutó la operación\n  fecha_registro DateTime @default(now())\n  notas          String?  @db.Text\n\n  presupuesto PresupuestoAsignado @relation(fields: [presupuesto_id], references: [id_presupuesto], onDelete: Cascade)\n\n  @@index([tenant_id, proyecto_id])\n  @@index([tenant_id, presupuesto_id])\n  @@index([referencia_id])\n  @@map(\"movimientos_presupuestales\")\n}\n\n// ─── Transaccional: Programa de Pagos ───────────────────────────────────────\n// Calendariza los pagos comprometidos contra estimaciones o facturas.\n// Permite al tesorero ver flujo de caja proyectado por semana/mes.\nmodel ProgramaPagos {\n  id_pago     String @id @default(uuid()) @db.Uuid\n  tenant_id   String @db.Uuid\n  proyecto_id String @db.Uuid // Centro de Costos\n\n  presupuesto_id  String  @db.Uuid\n  concepto        String  @db.VarChar(500)\n  beneficiario    String  @db.VarChar(255) // Nombre del proveedor/subcontratista\n  beneficiario_id String? @db.Uuid // UUID del Tercero (referencia inter-módulo)\n\n  monto_programado Decimal @db.Decimal(18, 2)\n  monto_pagado     Decimal @default(0) @db.Decimal(18, 2)\n  moneda           String  @default(\"MXN\") @db.VarChar(5)\n\n  fecha_programada DateTime // Cuándo se espera pagar\n  fecha_pago_real  DateTime? // Cuándo se pagó realmente\n  estado           String    @default(\"PENDIENTE\") // PENDIENTE, PROGRAMADO, PAGADO, CANCELADO, VENCIDO\n\n  // Trazabilidad inter-módulos\n  referencia_modulo  String? @db.VarChar(50)\n  referencia_entidad String? @db.VarChar(50)\n  referencia_id      String? @db.Uuid\n\n  metodo_pago         String? @db.VarChar(50) // TRANSFERENCIA, CHEQUE, EFECTIVO\n  banco               String? @db.VarChar(100)\n  referencia_bancaria String? @db.VarChar(100)\n\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  presupuesto PresupuestoAsignado @relation(fields: [presupuesto_id], references: [id_presupuesto], onDelete: Cascade)\n\n  @@index([tenant_id, proyecto_id])\n  @@index([tenant_id, proyecto_id, estado])\n  @@index([tenant_id, fecha_programada])\n  @@map(\"programa_pagos\")\n}\n",
  "inlineSchemaHash": "05251291a22a6aa7ce8c59bb45bcd9de6eeec7d4c09f81e32081f73a2e6051d8",
  "copyEngine": true
}
config.dirname = '/'

config.runtimeDataModel = JSON.parse("{\"models\":{\"PresupuestoAsignado\":{\"dbName\":\"presupuestos_asignados\",\"fields\":[{\"name\":\"id_presupuesto\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"proyecto_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"codigo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"descripcion\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"monto_autorizado\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"monto_ejercido\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"monto_comprometido\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"monto_disponible\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"moneda\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"MXN\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"capitulo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"MATERIALES\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"estatus\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"ACTIVO\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"movimientos\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"MovimientoPresupuestal\",\"relationName\":\"MovimientoPresupuestalToPresupuestoAsignado\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"programa_pagos\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ProgramaPagos\",\"relationName\":\"PresupuestoAsignadoToProgramaPagos\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"tenant_id\",\"proyecto_id\",\"codigo\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"tenant_id\",\"proyecto_id\",\"codigo\"]}],\"isGenerated\":false},\"MovimientoPresupuestal\":{\"dbName\":\"movimientos_presupuestales\",\"fields\":[{\"name\":\"id_movimiento\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"proyecto_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"presupuesto_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tipo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"concepto\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"monto\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"moneda\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"MXN\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"referencia_modulo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"referencia_entidad\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"referencia_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"referencia_codigo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"usuario_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fecha_registro\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"notas\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"presupuesto\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"PresupuestoAsignado\",\"relationName\":\"MovimientoPresupuestalToPresupuestoAsignado\",\"relationFromFields\":[\"presupuesto_id\"],\"relationToFields\":[\"id_presupuesto\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"ProgramaPagos\":{\"dbName\":\"programa_pagos\",\"fields\":[{\"name\":\"id_pago\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"proyecto_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"presupuesto_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"concepto\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"beneficiario\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"beneficiario_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"monto_programado\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"monto_pagado\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"moneda\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"MXN\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fecha_programada\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fecha_pago_real\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"estado\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"PENDIENTE\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"referencia_modulo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"referencia_entidad\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"referencia_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"metodo_pago\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"banco\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"referencia_bancaria\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"presupuesto\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"PresupuestoAsignado\",\"relationName\":\"PresupuestoAsignadoToProgramaPagos\",\"relationFromFields\":[\"presupuesto_id\"],\"relationToFields\":[\"id_presupuesto\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false}},\"enums\":{},\"types\":{}}")
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

