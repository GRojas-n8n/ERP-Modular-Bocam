
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

exports.Prisma.EmpleadoScalarFieldEnum = {
  id_empleado: 'id_empleado',
  tenant_id: 'tenant_id',
  numero_empleado: 'numero_empleado',
  nombre: 'nombre',
  apellido_paterno: 'apellido_paterno',
  apellido_materno: 'apellido_materno',
  rfc: 'rfc',
  curp: 'curp',
  nss: 'nss',
  puesto: 'puesto',
  categoria: 'categoria',
  tipo_contrato: 'tipo_contrato',
  fecha_ingreso: 'fecha_ingreso',
  fecha_baja: 'fecha_baja',
  salario_diario: 'salario_diario',
  salario_integrado: 'salario_integrado',
  telefono: 'telefono',
  email: 'email',
  contacto_emergencia: 'contacto_emergencia',
  certificaciones: 'certificaciones',
  estado: 'estado',
  cuadrilla_id: 'cuadrilla_id',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.CuadrillaScalarFieldEnum = {
  id_cuadrilla: 'id_cuadrilla',
  tenant_id: 'tenant_id',
  proyecto_id: 'proyecto_id',
  nombre: 'nombre',
  codigo: 'codigo',
  especialidad: 'especialidad',
  capataz_id: 'capataz_id',
  capataz_nombre: 'capataz_nombre',
  estado: 'estado',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.AsignacionFrenteScalarFieldEnum = {
  id_asignacion: 'id_asignacion',
  tenant_id: 'tenant_id',
  proyecto_id: 'proyecto_id',
  empleado_id: 'empleado_id',
  cuadrilla_id: 'cuadrilla_id',
  frente_trabajo: 'frente_trabajo',
  turno: 'turno',
  fecha_inicio: 'fecha_inicio',
  fecha_fin: 'fecha_fin',
  horas_diarias: 'horas_diarias',
  estado: 'estado',
  created_at: 'created_at'
};

exports.Prisma.PreNominaScalarFieldEnum = {
  id_prenomina: 'id_prenomina',
  tenant_id: 'tenant_id',
  proyecto_id: 'proyecto_id',
  codigo: 'codigo',
  periodo_tipo: 'periodo_tipo',
  periodo_inicio: 'periodo_inicio',
  periodo_fin: 'periodo_fin',
  total_percepciones: 'total_percepciones',
  total_deducciones: 'total_deducciones',
  total_neto: 'total_neto',
  total_empleados: 'total_empleados',
  estado: 'estado',
  elaborado_por: 'elaborado_por',
  autorizado_por: 'autorizado_por',
  fecha_autorizacion: 'fecha_autorizacion',
  notas: 'notas',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.PreNominaDetalleScalarFieldEnum = {
  id_detalle: 'id_detalle',
  tenant_id: 'tenant_id',
  proyecto_id: 'proyecto_id',
  prenomina_id: 'prenomina_id',
  empleado_id: 'empleado_id',
  dias_trabajados: 'dias_trabajados',
  horas_extra: 'horas_extra',
  salario_base: 'salario_base',
  monto_horas_extra: 'monto_horas_extra',
  bonos: 'bonos',
  total_percepciones: 'total_percepciones',
  deduccion_imss: 'deduccion_imss',
  deduccion_isr: 'deduccion_isr',
  otras_deducciones: 'otras_deducciones',
  total_deducciones: 'total_deducciones',
  neto_a_pagar: 'neto_a_pagar'
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
  Empleado: 'Empleado',
  Cuadrilla: 'Cuadrilla',
  AsignacionFrente: 'AsignacionFrente',
  PreNomina: 'PreNomina',
  PreNominaDetalle: 'PreNominaDetalle'
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
