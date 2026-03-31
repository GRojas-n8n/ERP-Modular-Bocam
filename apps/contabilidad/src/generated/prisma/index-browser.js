
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

exports.Prisma.AsientoContableScalarFieldEnum = {
  id_asiento: 'id_asiento',
  tenant_id: 'tenant_id',
  proyecto_id: 'proyecto_id',
  pago_id: 'pago_id',
  external_event_key: 'external_event_key',
  referencia_funcional: 'referencia_funcional',
  evento_conciliacion_key: 'evento_conciliacion_key',
  tipo_poliza: 'tipo_poliza',
  folio_poliza: 'folio_poliza',
  concepto: 'concepto',
  monto_total: 'monto_total',
  moneda: 'moneda',
  fecha_poliza: 'fecha_poliza',
  beneficiario: 'beneficiario',
  referencia_modulo: 'referencia_modulo',
  referencia_entidad: 'referencia_entidad',
  referencia_id: 'referencia_id',
  estatus: 'estatus',
  cfdi_status: 'cfdi_status',
  bancario_status: 'bancario_status',
  notas: 'notas',
  conciliado_at: 'conciliado_at',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.ConciliacionFiscalScalarFieldEnum = {
  id_conciliacion: 'id_conciliacion',
  tenant_id: 'tenant_id',
  proyecto_id: 'proyecto_id',
  asiento_id: 'asiento_id',
  pago_id: 'pago_id',
  uuid_fiscal: 'uuid_fiscal',
  serie: 'serie',
  folio: 'folio',
  rfc_emisor: 'rfc_emisor',
  rfc_receptor: 'rfc_receptor',
  monto_pagado: 'monto_pagado',
  monto_cfdi: 'monto_cfdi',
  moneda: 'moneda',
  fecha_emision: 'fecha_emision',
  fecha_timbrado: 'fecha_timbrado',
  estatus_fiscal: 'estatus_fiscal',
  estatus_sat: 'estatus_sat',
  fecha_validacion_sat: 'fecha_validacion_sat',
  fecha_cancelacion_sat: 'fecha_cancelacion_sat',
  ultima_verificacion_sat_at: 'ultima_verificacion_sat_at',
  sat_requested_at: 'sat_requested_at',
  sat_next_retry_at: 'sat_next_retry_at',
  sat_dlq_at: 'sat_dlq_at',
  sat_retry_count: 'sat_retry_count',
  sat_dispatch_id: 'sat_dispatch_id',
  sat_last_completed_dispatch_id: 'sat_last_completed_dispatch_id',
  sat_processing_started_at: 'sat_processing_started_at',
  mensaje_sat: 'mensaje_sat',
  sat_last_error: 'sat_last_error',
  fuente: 'fuente',
  fecha_conciliacion: 'fecha_conciliacion',
  notas: 'notas',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.ConciliacionBancariaScalarFieldEnum = {
  id_conciliacion_bancaria: 'id_conciliacion_bancaria',
  tenant_id: 'tenant_id',
  proyecto_id: 'proyecto_id',
  asiento_id: 'asiento_id',
  pago_id: 'pago_id',
  referencia_bancaria: 'referencia_bancaria',
  banco: 'banco',
  metodo_pago: 'metodo_pago',
  monto_pagado: 'monto_pagado',
  monto_banco: 'monto_banco',
  moneda: 'moneda',
  fecha_pago_real: 'fecha_pago_real',
  fecha_movimiento_bancario: 'fecha_movimiento_bancario',
  estatus_bancario: 'estatus_bancario',
  fuente: 'fuente',
  fecha_conciliacion: 'fecha_conciliacion',
  notas: 'notas',
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
  AsientoContable: 'AsientoContable',
  ConciliacionFiscal: 'ConciliacionFiscal',
  ConciliacionBancaria: 'ConciliacionBancaria'
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
