
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

exports.Prisma.ProveedorScalarFieldEnum = {
  id_proveedor: 'id_proveedor',
  tenant_id: 'tenant_id',
  rfc_tax_id: 'rfc_tax_id',
  razon_social: 'razon_social',
  email_contacto: 'email_contacto',
  telefono: 'telefono',
  estatus: 'estatus',
  ciudad: 'ciudad',
  tipo_ubicacion: 'tipo_ubicacion',
  entrega_en_sitio: 'entrega_en_sitio',
  estatus_credito: 'estatus_credito',
  limite_credito: 'limite_credito',
  tipo_proveedor: 'tipo_proveedor',
  calificacion_desempeno: 'calificacion_desempeno'
};

exports.Prisma.CalificacionProveedorScalarFieldEnum = {
  id_calificacion: 'id_calificacion',
  tenant_id: 'tenant_id',
  proveedor_id: 'proveedor_id',
  proyecto_id: 'proyecto_id',
  proyecto_nombre: 'proyecto_nombre',
  puntuacion: 'puntuacion',
  comentario: 'comentario',
  calificado_por: 'calificado_por',
  calificado_por_nombre: 'calificado_por_nombre',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.DocumentoProveedorScalarFieldEnum = {
  id_doc: 'id_doc',
  tenant_id: 'tenant_id',
  proveedor_id: 'proveedor_id',
  tipo_doc: 'tipo_doc',
  nombre_doc: 'nombre_doc',
  ruta_archivo: 'ruta_archivo',
  mime_type: 'mime_type',
  tamano_bytes: 'tamano_bytes',
  subido_por: 'subido_por',
  created_at: 'created_at'
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
  tipo: 'tipo',
  observaciones: 'observaciones'
};

exports.Prisma.RequisicionItemScalarFieldEnum = {
  id_item: 'id_item',
  tenant_id: 'tenant_id',
  proyecto_id: 'proyecto_id',
  requisicion_id: 'requisicion_id',
  insumo_id: 'insumo_id',
  cantidad: 'cantidad',
  notas: 'notas',
  descripcion_libre: 'descripcion_libre',
  unidad_libre: 'unidad_libre',
  es_imprevisto: 'es_imprevisto',
  cantidad_presupuestada: 'cantidad_presupuestada',
  concepto_origen_id: 'concepto_origen_id',
  justificacion: 'justificacion'
};

exports.Prisma.AsignacionExtraConceptoScalarFieldEnum = {
  id_asignacion: 'id_asignacion',
  tenant_id: 'tenant_id',
  proyecto_id: 'proyecto_id',
  requisicion_item_id: 'requisicion_item_id',
  concepto_id: 'concepto_id',
  concepto_clave: 'concepto_clave',
  concepto_descripcion: 'concepto_descripcion',
  monto_extra: 'monto_extra',
  asignado_por: 'asignado_por',
  created_at: 'created_at'
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
  total: 'total',
  presupuesto_id: 'presupuesto_id'
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
  notas: 'notas',
  revision: 'revision',
  revision_padre_id: 'revision_padre_id',
  firmado_por: 'firmado_por',
  fecha_firma: 'fecha_firma',
  primera_opcion_proveedor_id: 'primera_opcion_proveedor_id',
  segunda_opcion_proveedor_id: 'segunda_opcion_proveedor_id',
  evaluacion_residente_id: 'evaluacion_residente_id',
  fecha_evaluacion_tecnica: 'fecha_evaluacion_tecnica',
  gerente_tecnico_id: 'gerente_tecnico_id',
  fecha_aprobacion_gt: 'fecha_aprobacion_gt',
  comentario_gt_general: 'comentario_gt_general'
};

exports.Prisma.ComparativaLineaScalarFieldEnum = {
  id_linea: 'id_linea',
  tenant_id: 'tenant_id',
  proyecto_id: 'proyecto_id',
  cuadro_id: 'cuadro_id',
  insumo_id: 'insumo_id',
  marca_modelo_ref: 'marca_modelo_ref',
  especificaciones_requeridas: 'especificaciones_requeridas',
  detalle_req_id: 'detalle_req_id'
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
  es_ganador: 'es_ganador',
  evaluacion_tecnica: 'evaluacion_tecnica',
  comentario_tecnico: 'comentario_tecnico',
  valor_ofrecido_spec: 'valor_ofrecido_spec',
  aprobacion_gt: 'aprobacion_gt',
  comentario_gt: 'comentario_gt'
};

exports.Prisma.AclaracionComparativaScalarFieldEnum = {
  id_aclaracion: 'id_aclaracion',
  tenant_id: 'tenant_id',
  proyecto_id: 'proyecto_id',
  cuadro_id: 'cuadro_id',
  insumo_id: 'insumo_id',
  proveedor_id: 'proveedor_id',
  autor_id: 'autor_id',
  tipo: 'tipo',
  mensaje: 'mensaje',
  resuelta: 'resuelta',
  created_at: 'created_at'
};

exports.Prisma.EspecificacionDetalleReqScalarFieldEnum = {
  id_especificacion: 'id_especificacion',
  tenant_id: 'tenant_id',
  proyecto_id: 'proyecto_id',
  detalle_id: 'detalle_id',
  descripcion: 'descripcion',
  orden: 'orden',
  created_at: 'created_at'
};

exports.Prisma.SolicitudCotizacionScalarFieldEnum = {
  id_solicitud: 'id_solicitud',
  tenant_id: 'tenant_id',
  proyecto_id: 'proyecto_id',
  requisicion_id: 'requisicion_id',
  dias_habiles: 'dias_habiles',
  fecha_solicitud: 'fecha_solicitud',
  fecha_limite: 'fecha_limite',
  creado_por: 'creado_por',
  notas: 'notas',
  created_at: 'created_at'
};

exports.Prisma.SolicitudCotizacionProveedorScalarFieldEnum = {
  id_scp: 'id_scp',
  tenant_id: 'tenant_id',
  solicitud_id: 'solicitud_id',
  proveedor_id: 'proveedor_id',
  estado: 'estado',
  pdf_nombre: 'pdf_nombre',
  pdf_ruta: 'pdf_ruta',
  pdf_mime: 'pdf_mime',
  notas_proveedor: 'notas_proveedor',
  fecha_respuesta: 'fecha_respuesta',
  updated_at: 'updated_at'
};

exports.Prisma.AnotacionEspecificacionScalarFieldEnum = {
  id_anotacion: 'id_anotacion',
  tenant_id: 'tenant_id',
  cuadro_id: 'cuadro_id',
  especificacion_id: 'especificacion_id',
  proveedor_id: 'proveedor_id',
  tipo: 'tipo',
  texto: 'texto',
  creado_por: 'creado_por',
  created_at: 'created_at'
};

exports.Prisma.AlertaOcErrorScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  proyecto_id: 'proyecto_id',
  oc_id: 'oc_id',
  oc_codigo: 'oc_codigo',
  presupuesto_id: 'presupuesto_id',
  error_message: 'error_message',
  resuelta: 'resuelta',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.ItemInventarioScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  proyecto_id: 'proyecto_id',
  insumo_id: 'insumo_id',
  clave: 'clave',
  descripcion: 'descripcion',
  unidad: 'unidad',
  categoria: 'categoria',
  stock_actual: 'stock_actual',
  stock_minimo: 'stock_minimo',
  ubicacion: 'ubicacion',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.MovimientoAlmacenScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  proyecto_id: 'proyecto_id',
  item_id: 'item_id',
  tipo: 'tipo',
  cantidad: 'cantidad',
  unidad: 'unidad',
  origen: 'origen',
  destino: 'destino',
  responsable: 'responsable',
  referencia: 'referencia',
  fecha: 'fecha'
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
  CalificacionProveedor: 'CalificacionProveedor',
  DocumentoProveedor: 'DocumentoProveedor',
  Requisicion: 'Requisicion',
  RequisicionItem: 'RequisicionItem',
  AsignacionExtraConcepto: 'AsignacionExtraConcepto',
  OrdenCompra: 'OrdenCompra',
  OrdenCompraItem: 'OrdenCompraItem',
  CuadroComparativo: 'CuadroComparativo',
  ComparativaLinea: 'ComparativaLinea',
  ComparativaDetalle: 'ComparativaDetalle',
  AclaracionComparativa: 'AclaracionComparativa',
  EspecificacionDetalleReq: 'EspecificacionDetalleReq',
  SolicitudCotizacion: 'SolicitudCotizacion',
  SolicitudCotizacionProveedor: 'SolicitudCotizacionProveedor',
  AnotacionEspecificacion: 'AnotacionEspecificacion',
  AlertaOcError: 'AlertaOcError',
  ItemInventario: 'ItemInventario',
  MovimientoAlmacen: 'MovimientoAlmacen'
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
