
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

exports.Prisma.IncidenteScalarFieldEnum = {
  id_incidente: 'id_incidente',
  tenant_id: 'tenant_id',
  proyecto_id: 'proyecto_id',
  codigo: 'codigo',
  tipo: 'tipo',
  severidad: 'severidad',
  fecha_incidente: 'fecha_incidente',
  hora_incidente: 'hora_incidente',
  ubicacion: 'ubicacion',
  descripcion: 'descripcion',
  empleado_afectado_id: 'empleado_afectado_id',
  empleado_afectado_nombre: 'empleado_afectado_nombre',
  testigos: 'testigos',
  causa_raiz: 'causa_raiz',
  accion_correctiva: 'accion_correctiva',
  accion_preventiva: 'accion_preventiva',
  dias_incapacidad: 'dias_incapacidad',
  requirio_atencion_medica: 'requirio_atencion_medica',
  reportado_stps: 'reportado_stps',
  estado: 'estado',
  reportado_por: 'reportado_por',
  cerrado_por: 'cerrado_por',
  fecha_cierre: 'fecha_cierre',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.InspeccionSeguridadScalarFieldEnum = {
  id_inspeccion: 'id_inspeccion',
  tenant_id: 'tenant_id',
  proyecto_id: 'proyecto_id',
  codigo: 'codigo',
  tipo_inspeccion: 'tipo_inspeccion',
  fecha_inspeccion: 'fecha_inspeccion',
  area_inspeccionada: 'area_inspeccionada',
  items_revisados: 'items_revisados',
  items_conformes: 'items_conformes',
  items_no_conformes: 'items_no_conformes',
  porcentaje_cumplimiento: 'porcentaje_cumplimiento',
  resultado: 'resultado',
  observaciones: 'observaciones',
  hallazgos: 'hallazgos',
  evidencia_fotos: 'evidencia_fotos',
  inspector_id: 'inspector_id',
  inspector_nombre: 'inspector_nombre',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.PermisoTrabajoScalarFieldEnum = {
  id_permiso: 'id_permiso',
  tenant_id: 'tenant_id',
  proyecto_id: 'proyecto_id',
  codigo: 'codigo',
  tipo_permiso: 'tipo_permiso',
  area_trabajo: 'area_trabajo',
  descripcion_trabajo: 'descripcion_trabajo',
  fecha_inicio: 'fecha_inicio',
  fecha_fin: 'fecha_fin',
  estado: 'estado',
  epp_requerido: 'epp_requerido',
  medidas_control: 'medidas_control',
  checklist_previo: 'checklist_previo',
  solicitado_por: 'solicitado_por',
  solicitante_nombre: 'solicitante_nombre',
  autorizado_por: 'autorizado_por',
  autorizador_nombre: 'autorizador_nombre',
  trabajadores: 'trabajadores',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.CapacitacionScalarFieldEnum = {
  id_capacitacion: 'id_capacitacion',
  tenant_id: 'tenant_id',
  proyecto_id: 'proyecto_id',
  codigo: 'codigo',
  titulo: 'titulo',
  tipo: 'tipo',
  instructor: 'instructor',
  fecha: 'fecha',
  duracion_horas: 'duracion_horas',
  ubicacion: 'ubicacion',
  contenido: 'contenido',
  validez_meses: 'validez_meses',
  estado: 'estado',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.RegistroCapacitacionScalarFieldEnum = {
  id_registro: 'id_registro',
  tenant_id: 'tenant_id',
  proyecto_id: 'proyecto_id',
  capacitacion_id: 'capacitacion_id',
  empleado_id: 'empleado_id',
  empleado_nombre: 'empleado_nombre',
  asistio: 'asistio',
  calificacion: 'calificacion',
  aprobado: 'aprobado',
  observaciones: 'observaciones'
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
  Incidente: 'Incidente',
  InspeccionSeguridad: 'InspeccionSeguridad',
  PermisoTrabajo: 'PermisoTrabajo',
  Capacitacion: 'Capacitacion',
  RegistroCapacitacion: 'RegistroCapacitacion'
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
