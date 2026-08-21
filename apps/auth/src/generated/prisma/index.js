
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

exports.Prisma.TenantScalarFieldEnum = {
  id_tenant: 'id_tenant',
  nombre: 'nombre',
  rfc: 'rfc',
  logo_url: 'logo_url',
  primary_color: 'primary_color',
  plan: 'plan',
  activo: 'activo',
  created_at: 'created_at'
};

exports.Prisma.ProyectoScalarFieldEnum = {
  id_proyecto: 'id_proyecto',
  tenant_id: 'tenant_id',
  codigo_centro_costos: 'codigo_centro_costos',
  nombre_oficial: 'nombre_oficial',
  tipo_contrato: 'tipo_contrato',
  moneda_base: 'moneda_base',
  estatus: 'estatus',
  activo: 'activo',
  created_at: 'created_at',
  empresa_grupo: 'empresa_grupo',
  anio_centro_costos: 'anio_centro_costos',
  cliente_id: 'cliente_id',
  consecutivo_centro_costos: 'consecutivo_centro_costos',
  es_especial: 'es_especial',
  tipo_especial: 'tipo_especial',
  fecha_inicio_real: 'fecha_inicio_real',
  fecha_firma_contrato: 'fecha_firma_contrato',
  fecha_programada_inicio: 'fecha_programada_inicio',
  fecha_programada_fin: 'fecha_programada_fin',
  monto_total_vendido: 'monto_total_vendido',
  periodo_ejecucion: 'periodo_ejecucion',
  periodo_ejecucion_unidad: 'periodo_ejecucion_unidad',
  total_dias_naturales: 'total_dias_naturales',
  total_dias_laborables: 'total_dias_laborables'
};

exports.Prisma.UserScalarFieldEnum = {
  id_usuario: 'id_usuario',
  tenant_id: 'tenant_id',
  email: 'email',
  password_hash: 'password_hash',
  nombre: 'nombre',
  rol_global: 'rol_global',
  limite_aprobacion_financiera: 'limite_aprobacion_financiera',
  activo: 'activo',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.UserProjectAccessScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  proyecto_id: 'proyecto_id',
  rol_proyecto: 'rol_proyecto',
  created_at: 'created_at'
};

exports.Prisma.RefreshTokenScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  token_hash: 'token_hash',
  expires_at: 'expires_at',
  revoked: 'revoked',
  created_at: 'created_at',
  user_agent: 'user_agent',
  ip_address: 'ip_address',
  sesion_iniciada_en: 'sesion_iniciada_en'
};

exports.Prisma.MasterAuditLogScalarFieldEnum = {
  id: 'id',
  accion: 'accion',
  entity_type: 'entity_type',
  entity_id: 'entity_id',
  ip_address: 'ip_address',
  user_agent: 'user_agent',
  payload: 'payload',
  status_code: 'status_code',
  error_msg: 'error_msg',
  created_at: 'created_at'
};

exports.Prisma.TenantAuditLogScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  proyecto_id: 'proyecto_id',
  actor_user_id: 'actor_user_id',
  event_type: 'event_type',
  entity_id: 'entity_id',
  payload: 'payload',
  correlation_id: 'correlation_id',
  created_at: 'created_at'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};


exports.Prisma.ModelName = {
  Tenant: 'Tenant',
  Proyecto: 'Proyecto',
  User: 'User',
  UserProjectAccess: 'UserProjectAccess',
  RefreshToken: 'RefreshToken',
  MasterAuditLog: 'MasterAuditLog',
  TenantAuditLog: 'TenantAuditLog'
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
      "value": "D:\\04_SISTEMA_Y_DEV\\01 Proyectos Activos\\Bocam - ERP - iretum.com\\apps\\auth\\src\\generated\\prisma",
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
    "sourceFilePath": "D:\\04_SISTEMA_Y_DEV\\01 Proyectos Activos\\Bocam - ERP - iretum.com\\apps\\auth\\prisma\\schema.prisma",
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
  "inlineSchema": "// -----------------------------------------------------------------------------\n// Propiedad Intelectual: Constructora Bocam, S. A. de C.V.\n// Módulo: Auth (IAM — Identity & Access Management)\n//\n// ARQUITECTURA:\n// Este esquema es INDEPENDIENTE de los demás módulos (Soberanía de Datos).\n// Contiene ÚNICAMENTE las tablas de identidad y sesiones.\n// Los demás módulos referencian a los usuarios por UUID, nunca por JOIN cruzado.\n// -----------------------------------------------------------------------------\n\ngenerator client {\n  provider = \"prisma-client-js\"\n  output   = \"../src/generated/prisma\"\n}\n\ndatasource db {\n  provider = \"postgresql\"\n  url      = env(\"DATABASE_URL\")\n}\n\n// --- Entidad MDM: Tenant (Constructora / Cliente del SaaS) ---\nmodel Tenant {\n  id_tenant     String   @id @default(uuid()) @db.Uuid\n  nombre        String   @db.VarChar(255)\n  rfc           String?  @db.VarChar(20)\n  logo_url      String?  @db.VarChar(500)\n  primary_color String?  @db.VarChar(50) // HSL value para White-Label\n  plan          String   @default(\"BASICO\") // BASICO, PROFESIONAL, ENTERPRISE\n  activo        Boolean  @default(true)\n  created_at    DateTime @default(now())\n\n  usuarios  User[]\n  proyectos Proyecto[]\n\n  @@map(\"tenants\")\n}\n\n// --- Entidad MDM: Proyecto (Centro de Costos / Sucursal) ---\nmodel Proyecto {\n  id_proyecto          String   @id @default(uuid()) @db.Uuid\n  tenant_id            String   @db.Uuid\n  // Para proyectos creados antes de centro-costos-alta-formal: texto libre\n  // (ej. 'CC-2026-GUA-01'), sin garantía de formato. Para proyectos nuevos:\n  // ensamblado a partir de empresa_grupo+anio_centro_costos+cliente+consecutivo\n  // (13 posiciones), salvo es_especial=true (texto libre también en ese caso).\n  codigo_centro_costos String   @db.VarChar(50)\n  nombre_oficial       String   @db.VarChar(255)\n  tipo_contrato        String   @default(\"PRECIOS_UNITARIOS\") // PRECIOS_UNITARIOS, PRECIO_ALZADO, EPC, MIXTO\n  moneda_base          String   @default(\"MXN\") @db.VarChar(5)\n  estatus              String   @default(\"ABIERTO\") // ABIERTO, EN EJECUCIÓN, EN COBRO, TERMINADO, CERRADO\n  activo               Boolean  @default(true)\n  created_at           DateTime @default(now())\n\n  // ── Centro de Costos: componentes estructurados del código de 13 posiciones ──\n  // Nullable: solo se completan para proyectos creados vía el flujo formal de\n  // este cambio. Proyectos legacy quedan con estos campos en null.\n  empresa_grupo             String? @db.VarChar(3) // CIB | HCO | HSE | SEO\n  anio_centro_costos        Int?\n  cliente_id                String? @db.Uuid // referencia lógica a Ventas.Cliente, sin FK cross-servicio\n  consecutivo_centro_costos Int?\n  es_especial               Boolean @default(false)\n  tipo_especial             String? @db.VarChar(20) // OFICINA | TALLER | ALMACÉN, solo si es_especial\n\n  // ── Línea base financiera y de plazos ──────────────────────────────────────\n  fecha_inicio_real        DateTime?\n  fecha_firma_contrato     DateTime?\n  fecha_programada_inicio  DateTime?\n  fecha_programada_fin     DateTime?\n  monto_total_vendido      Decimal?  @db.Decimal(18, 2) // sin IVA\n  periodo_ejecucion        Int?\n  periodo_ejecucion_unidad String?   @db.VarChar(10) // MESES | SEMANAS\n  total_dias_naturales     Int?\n  total_dias_laborables    Int?\n\n  tenant       Tenant              @relation(fields: [tenant_id], references: [id_tenant], onDelete: Cascade)\n  asignaciones UserProjectAccess[]\n\n  @@unique([tenant_id, codigo_centro_costos])\n  @@index([tenant_id])\n  @@index([tenant_id, empresa_grupo, anio_centro_costos, cliente_id])\n  @@map(\"proyectos\")\n}\n\n// --- Entidad MDM: Usuario_Identidad (Colaborador / Aprobador) ---\nmodel User {\n  id_usuario                   String   @id @default(uuid()) @db.Uuid\n  tenant_id                    String   @db.Uuid\n  email                        String   @db.VarChar(255)\n  password_hash                String   @db.VarChar(255)\n  nombre                       String   @db.VarChar(150)\n  rol_global                   String[] // Ej: ['superintendent', 'admin']\n  limite_aprobacion_financiera Decimal  @default(0) @db.Decimal(18, 2)\n  activo                       Boolean  @default(true)\n  created_at                   DateTime @default(now())\n  updated_at                   DateTime @updatedAt\n\n  tenant           Tenant              @relation(fields: [tenant_id], references: [id_tenant], onDelete: Cascade)\n  tokens           RefreshToken[]\n  proyectos_acceso UserProjectAccess[]\n\n  @@unique([tenant_id, email])\n  @@index([tenant_id])\n  @@map(\"users\")\n}\n\n// --- Tabla Puente: Acceso de Usuario a Proyectos ---\n// Implementa la directiva RBAC: \"proyectos_autorizados (Array de UUIDs)\"\nmodel UserProjectAccess {\n  id           String   @id @default(uuid()) @db.Uuid\n  user_id      String   @db.Uuid\n  proyecto_id  String   @db.Uuid\n  rol_proyecto String?  @db.VarChar(50) // Rol específico en este proyecto (override)\n  created_at   DateTime @default(now())\n\n  user     User     @relation(fields: [user_id], references: [id_usuario], onDelete: Cascade)\n  proyecto Proyecto @relation(fields: [proyecto_id], references: [id_proyecto], onDelete: Cascade)\n\n  @@unique([user_id, proyecto_id])\n  @@map(\"user_project_access\")\n}\n\n// --- Sesiones: Refresh Tokens (Rotación Segura) ---\nmodel RefreshToken {\n  id                 String    @id @default(uuid()) @db.Uuid\n  user_id            String    @db.Uuid\n  token_hash         String    @db.VarChar(255) // Almacenar hash, NUNCA el token raw\n  expires_at         DateTime\n  revoked            Boolean   @default(false)\n  created_at         DateTime  @default(now())\n  user_agent         String?   @db.VarChar(500)\n  ip_address         String?   @db.VarChar(50)\n  // Momento del login ORIGINAL de esta cadena de sesión — se propaga sin\n  // resetear en cada rotación (ver apps/auth/src/sesion-policy.ts). Permite\n  // imponer un límite absoluto de duración de sesión independiente de la\n  // actividad del usuario. Nullable: tokens emitidos antes de este campo.\n  sesion_iniciada_en DateTime?\n\n  user User @relation(fields: [user_id], references: [id_usuario], onDelete: Cascade)\n\n  @@index([user_id])\n  @@index([token_hash])\n  @@map(\"refresh_tokens\")\n}\n\n// --- Audit Log de Operaciones Master (cross-tenant, sin RLS) ---\n// Solo accesible vía runAsSystem. Registra CREATE/UPDATE/DELETE de tenants\n// y accesos no autorizados. Best-effort: no bloquea el flujo principal.\nmodel MasterAuditLog {\n  id          String   @id @default(uuid()) @db.Uuid\n  accion      String   @db.VarChar(50)\n  entity_type String   @db.VarChar(30)\n  entity_id   String?  @db.Uuid\n  ip_address  String?  @db.VarChar(50)\n  user_agent  String?  @db.VarChar(500)\n  payload     Json?\n  status_code Int\n  error_msg   String?  @db.Text\n  created_at  DateTime @default(now())\n\n  @@index([created_at])\n  @@index([entity_id])\n  @@map(\"master_audit_logs\")\n}\n\n// --- Audit Log de Acciones de Negocio por Tenant (RLS habilitado) ---\n// Proyección derivada de eventos ya publicados a bocam.events por otros\n// servicios (compras, finanzas) — no es la fuente de verdad transaccional.\n// Best-effort: un fallo al persistir no bloquea al publisher del evento.\n// Ver openspec/changes/auditoria-acciones-tenant.\nmodel TenantAuditLog {\n  id             String   @id @default(uuid()) @db.Uuid\n  tenant_id      String   @db.Uuid\n  proyecto_id    String   @db.Uuid\n  actor_user_id  String   @db.Uuid\n  event_type     String   @db.VarChar(100)\n  entity_id      String?  @db.Uuid\n  payload        Json?\n  correlation_id String?  @db.VarChar(100)\n  created_at     DateTime @default(now())\n\n  @@index([tenant_id, created_at])\n  @@map(\"tenant_audit_logs\")\n}\n",
  "inlineSchemaHash": "3f65c86a2fbdf11c928441a6fd9f90455ffaed4644b4504d371637fa6870bb5e",
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

config.runtimeDataModel = JSON.parse("{\"models\":{\"Tenant\":{\"dbName\":\"tenants\",\"fields\":[{\"name\":\"id_tenant\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nombre\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"rfc\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"logo_url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"primary_color\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"plan\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"BASICO\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"activo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"usuarios\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"TenantToUser\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"proyectos\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Proyecto\",\"relationName\":\"ProyectoToTenant\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Proyecto\":{\"dbName\":\"proyectos\",\"fields\":[{\"name\":\"id_proyecto\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"codigo_centro_costos\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nombre_oficial\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tipo_contrato\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"PRECIOS_UNITARIOS\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"moneda_base\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"MXN\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"estatus\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"ABIERTO\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"activo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"empresa_grupo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"anio_centro_costos\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cliente_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"consecutivo_centro_costos\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"es_especial\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tipo_especial\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fecha_inicio_real\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fecha_firma_contrato\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fecha_programada_inicio\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fecha_programada_fin\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"monto_total_vendido\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"periodo_ejecucion\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"periodo_ejecucion_unidad\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"total_dias_naturales\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"total_dias_laborables\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Tenant\",\"relationName\":\"ProyectoToTenant\",\"relationFromFields\":[\"tenant_id\"],\"relationToFields\":[\"id_tenant\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"asignaciones\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserProjectAccess\",\"relationName\":\"ProyectoToUserProjectAccess\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"tenant_id\",\"codigo_centro_costos\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"tenant_id\",\"codigo_centro_costos\"]}],\"isGenerated\":false},\"User\":{\"dbName\":\"users\",\"fields\":[{\"name\":\"id_usuario\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"email\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"password_hash\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nombre\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"rol_global\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"limite_aprobacion_financiera\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"activo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"tenant\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Tenant\",\"relationName\":\"TenantToUser\",\"relationFromFields\":[\"tenant_id\"],\"relationToFields\":[\"id_tenant\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tokens\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"RefreshToken\",\"relationName\":\"RefreshTokenToUser\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"proyectos_acceso\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserProjectAccess\",\"relationName\":\"UserToUserProjectAccess\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"tenant_id\",\"email\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"tenant_id\",\"email\"]}],\"isGenerated\":false},\"UserProjectAccess\":{\"dbName\":\"user_project_access\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"proyecto_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"rol_proyecto\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"UserToUserProjectAccess\",\"relationFromFields\":[\"user_id\"],\"relationToFields\":[\"id_usuario\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"proyecto\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Proyecto\",\"relationName\":\"ProyectoToUserProjectAccess\",\"relationFromFields\":[\"proyecto_id\"],\"relationToFields\":[\"id_proyecto\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"user_id\",\"proyecto_id\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"user_id\",\"proyecto_id\"]}],\"isGenerated\":false},\"RefreshToken\":{\"dbName\":\"refresh_tokens\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"token_hash\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"expires_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"revoked\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_agent\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ip_address\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sesion_iniciada_en\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"RefreshTokenToUser\",\"relationFromFields\":[\"user_id\"],\"relationToFields\":[\"id_usuario\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"MasterAuditLog\":{\"dbName\":\"master_audit_logs\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"accion\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"entity_type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"entity_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ip_address\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_agent\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"payload\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status_code\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"error_msg\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"TenantAuditLog\":{\"dbName\":\"tenant_audit_logs\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"proyecto_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"actor_user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"event_type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"entity_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"payload\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"correlation_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false}},\"enums\":{},\"types\":{}}")
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
