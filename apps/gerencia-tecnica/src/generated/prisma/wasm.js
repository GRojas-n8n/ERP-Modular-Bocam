
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

exports.Prisma.SaldoPartidaScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  proyecto_id: 'proyecto_id',
  concepto_id: 'concepto_id',
  concepto_clave: 'concepto_clave',
  concepto_desc: 'concepto_desc',
  monto_aprobado: 'monto_aprobado',
  monto_comprometido: 'monto_comprometido',
  monto_ejercido: 'monto_ejercido',
  monto_en_proceso: 'monto_en_proceso',
  monto_disponible: 'monto_disponible',
  estado_tope: 'estado_tope',
  bloqueo_automatico: 'bloqueo_automatico',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.SaldoMovimientoScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  saldo_partida_id: 'saldo_partida_id',
  referencia_id: 'referencia_id',
  referencia_codigo: 'referencia_codigo',
  tipo: 'tipo',
  campo: 'campo',
  delta: 'delta',
  saldo_resultante: 'saldo_resultante',
  created_at: 'created_at'
};

exports.Prisma.TransferenciaPartidaScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  tipo: 'tipo',
  proyecto_origen_id: 'proyecto_origen_id',
  concepto_origen_id: 'concepto_origen_id',
  concepto_origen_clave: 'concepto_origen_clave',
  concepto_origen_desc: 'concepto_origen_desc',
  proyecto_destino_id: 'proyecto_destino_id',
  concepto_destino_id: 'concepto_destino_id',
  concepto_destino_clave: 'concepto_destino_clave',
  concepto_destino_desc: 'concepto_destino_desc',
  monto: 'monto',
  moneda: 'moneda',
  justificacion: 'justificacion',
  solicitado_por_id: 'solicitado_por_id',
  solicitado_por_nombre: 'solicitado_por_nombre',
  aprobado_por_id: 'aprobado_por_id',
  aprobado_por_nombre: 'aprobado_por_nombre',
  fecha_aprobacion: 'fecha_aprobacion',
  estado: 'estado',
  motivo_rechazo: 'motivo_rechazo',
  notas_director: 'notas_director',
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
  SaldoPartida: 'SaldoPartida',
  SaldoMovimiento: 'SaldoMovimiento',
  TransferenciaPartida: 'TransferenciaPartida',
  FichaTecnicaInsumo: 'FichaTecnicaInsumo'
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
