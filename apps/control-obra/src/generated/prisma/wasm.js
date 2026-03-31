
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

exports.Prisma.BitacoraObraScalarFieldEnum = {
  id_bitacora: 'id_bitacora',
  tenant_id: 'tenant_id',
  proyecto_id: 'proyecto_id',
  numero_entrada: 'numero_entrada',
  fecha: 'fecha',
  frente_trabajo: 'frente_trabajo',
  turno: 'turno',
  clima: 'clima',
  temperatura_c: 'temperatura_c',
  actividades_realizadas: 'actividades_realizadas',
  personal_en_sitio: 'personal_en_sitio',
  incidencias: 'incidencias',
  material_recibido: 'material_recibido',
  observaciones: 'observaciones',
  residente_id: 'residente_id',
  residente_nombre: 'residente_nombre',
  superintendente_id: 'superintendente_id',
  estado: 'estado',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.AvanceFisicoScalarFieldEnum = {
  id_avance: 'id_avance',
  tenant_id: 'tenant_id',
  proyecto_id: 'proyecto_id',
  concepto_presupuesto: 'concepto_presupuesto',
  descripcion_concepto: 'descripcion_concepto',
  cantidad_presupuestada: 'cantidad_presupuestada',
  cantidad_anterior: 'cantidad_anterior',
  cantidad_periodo: 'cantidad_periodo',
  cantidad_acumulada: 'cantidad_acumulada',
  unidad: 'unidad',
  precio_unitario: 'precio_unitario',
  importe_periodo: 'importe_periodo',
  importe_acumulado: 'importe_acumulado',
  porcentaje_avance: 'porcentaje_avance',
  periodo_inicio: 'periodo_inicio',
  periodo_fin: 'periodo_fin',
  registrado_por_id: 'registrado_por_id',
  registrado_por_nombre: 'registrado_por_nombre',
  validado_por_id: 'validado_por_id',
  validado_por_nombre: 'validado_por_nombre',
  estado: 'estado',
  estimacion_id: 'estimacion_id',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.EstimacionScalarFieldEnum = {
  id_estimacion: 'id_estimacion',
  tenant_id: 'tenant_id',
  proyecto_id: 'proyecto_id',
  numero_estimacion: 'numero_estimacion',
  codigo: 'codigo',
  periodo_inicio: 'periodo_inicio',
  periodo_fin: 'periodo_fin',
  subtotal: 'subtotal',
  retencion_fondo_garantia: 'retencion_fondo_garantia',
  amortizacion_anticipo: 'amortizacion_anticipo',
  iva: 'iva',
  total_neto: 'total_neto',
  estado: 'estado',
  elaborado_por_id: 'elaborado_por_id',
  elaborado_por_nombre: 'elaborado_por_nombre',
  revisado_por_id: 'revisado_por_id',
  revisado_por_nombre: 'revisado_por_nombre',
  aprobado_por_id: 'aprobado_por_id',
  aprobado_por_nombre: 'aprobado_por_nombre',
  fecha_aprobacion: 'fecha_aprobacion',
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
  BitacoraObra: 'BitacoraObra',
  AvanceFisico: 'AvanceFisico',
  Estimacion: 'Estimacion'
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
