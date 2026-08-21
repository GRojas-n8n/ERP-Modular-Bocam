
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


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

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

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
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
