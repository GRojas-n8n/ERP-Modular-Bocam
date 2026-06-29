
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

exports.Prisma.DocumentoScalarFieldEnum = {
  id_documento: 'id_documento',
  tenant_id: 'tenant_id',
  codigo: 'codigo',
  titulo: 'titulo',
  tipo: 'tipo',
  descripcion: 'descripcion',
  proyecto_id: 'proyecto_id',
  responsable_id: 'responsable_id',
  estado_actual: 'estado_actual',
  version_actual: 'version_actual',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.VersionDocumentoScalarFieldEnum = {
  id_version: 'id_version',
  tenant_id: 'tenant_id',
  documento_id: 'documento_id',
  numero_version: 'numero_version',
  estado: 'estado',
  cambios: 'cambios',
  archivo_nombre: 'archivo_nombre',
  archivo_ruta: 'archivo_ruta',
  archivo_mime: 'archivo_mime',
  archivo_tamano: 'archivo_tamano',
  creado_por: 'creado_por',
  revisado_por: 'revisado_por',
  aprobado_por: 'aprobado_por',
  fecha_emision: 'fecha_emision',
  fecha_obsoleto: 'fecha_obsoleto',
  created_at: 'created_at'
};

exports.Prisma.NoConformidadScalarFieldEnum = {
  id_nc: 'id_nc',
  tenant_id: 'tenant_id',
  proyecto_id: 'proyecto_id',
  codigo: 'codigo',
  titulo: 'titulo',
  descripcion: 'descripcion',
  fuente: 'fuente',
  estado: 'estado',
  detectado_por: 'detectado_por',
  responsable_id: 'responsable_id',
  fecha_deteccion: 'fecha_deteccion',
  fecha_limite: 'fecha_limite',
  fecha_cierre: 'fecha_cierre',
  causa_raiz: 'causa_raiz',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.AccionCorrectivaScalarFieldEnum = {
  id_accion: 'id_accion',
  tenant_id: 'tenant_id',
  nc_id: 'nc_id',
  descripcion: 'descripcion',
  responsable_id: 'responsable_id',
  fecha_compromiso: 'fecha_compromiso',
  estado: 'estado',
  evidencia: 'evidencia',
  verificado_por: 'verificado_por',
  fecha_verificacion: 'fecha_verificacion',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.AuditoriaInternaScalarFieldEnum = {
  id_auditoria: 'id_auditoria',
  tenant_id: 'tenant_id',
  proyecto_id: 'proyecto_id',
  codigo: 'codigo',
  titulo: 'titulo',
  alcance: 'alcance',
  criterios: 'criterios',
  auditor_lider_id: 'auditor_lider_id',
  fecha_inicio: 'fecha_inicio',
  fecha_fin: 'fecha_fin',
  estado: 'estado',
  observaciones: 'observaciones',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.HallazgoAuditoriaScalarFieldEnum = {
  id_hallazgo: 'id_hallazgo',
  tenant_id: 'tenant_id',
  auditoria_id: 'auditoria_id',
  descripcion: 'descripcion',
  tipo: 'tipo',
  proceso_afectado: 'proceso_afectado',
  evidencia: 'evidencia',
  accion_requerida: 'accion_requerida',
  estado: 'estado',
  nc_id: 'nc_id',
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


exports.Prisma.ModelName = {
  Documento: 'Documento',
  VersionDocumento: 'VersionDocumento',
  NoConformidad: 'NoConformidad',
  AccionCorrectiva: 'AccionCorrectiva',
  AuditoriaInterna: 'AuditoriaInterna',
  HallazgoAuditoria: 'HallazgoAuditoria'
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
