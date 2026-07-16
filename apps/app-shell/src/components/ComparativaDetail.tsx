import React, { useEffect, useMemo, useRef, useState } from 'react';
import api, { asistenteApi, comprasApi } from '../lib/api';
import { useTenant } from '../context/TenantContext';
import { useNotification } from '../context/NotificationContext';
import { emparejarRenglonesConLineas } from '../lib/cotizacion-pdf-match';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  SectionBadge,
  SideSheet,
  Textarea,
  cn,
} from '@bocam/ui-core';
import {
  IconArrowLeft,
  IconCheckCircle2,
  IconDownload,
  IconFileText,
  IconPackage,
  IconPlus,
  IconScale,
  IconSearch,
  IconX,
} from './Icons';
import { TableScrollShadow } from './TableScrollShadow';

/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Componente: ComparativaDetail — Tabla comparativa de cotizaciones
 * Flujo: Requisición APROBADA → Cuadro → Evaluación Técnica (Residente)
 *        → Aprobación GT → OC
 * ---------------------------------------------------------------------------
 */

// ─── Interfaces exportadas ────────────────────────────────────────────────────

export interface AclaracionComparativa {
  id_aclaracion: string;
  cuadro_id: string;
  insumo_id: string;
  proveedor_id: string;
  autor_id: string;
  tipo: 'PREGUNTA' | 'RESPUESTA';
  mensaje: string;
  resuelta: boolean;
  created_at: string;
}

export interface CotizacionLinea {
  id: string;
  // Nullable para ítems de requisición de texto libre (imprevisto, sin catálogo) —
  // ver openspec/changes/cotizar-items-texto-libre-comparativa. En ese caso
  // detalle_req_id identifica la línea.
  insumo_id: string | null;
  detalle_req_id?: string | null;
  insumo_clave: string;
  insumo_descripcion: string;
  insumo_unidad: string;
  cantidad: number;
  precios: Record<string, string>;
  // Fecha de entrega estimada por proveedor, capturada al cotizar (YYYY-MM-DD).
  // Ver openspec/changes/fecha-entrega-estimada-por-partida.
  fechasEntrega: Record<string, string | null>;
  // Especificación técnica que cada proveedor ofrece para este renglón, capturada por
  // Compras al cotizar. Ver openspec/changes/especificacion-tecnica-ofrecida-proveedor.
  especOfrecida: Record<string, string>;
  ganador: string | null;
  // Evaluación técnica (Residente) — nuevos valores: C | NC | DA | ? | PENDIENTE; legacy: APROBADO | RECHAZADO
  // Representa el estado del primer proveedor únicamente (compatibilidad legacy) — para
  // evaluar/leer por proveedor usar evaluacionesPorProveedor. Ver
  // openspec/changes/fix-evaluacion-tecnica-por-proveedor.
  evaluacion_tecnica?: 'PENDIENTE' | 'C' | 'NC' | 'DA' | '?' | 'APROBADO' | 'RECHAZADO';
  comentario_tecnico?: string;
  // Evaluación técnica por proveedor — un ComparativaDetalle es naturalmente
  // (línea, proveedor); el panel de evaluación simple debe evaluar cada proveedor por
  // separado, no colapsar a uno solo por renglón. Ver
  // openspec/changes/fix-evaluacion-tecnica-por-proveedor.
  evaluacionesPorProveedor?: Record<string, {
    id_detalle: string;
    evaluacion_tecnica: 'PENDIENTE' | 'C' | 'NC' | 'DA' | '?';
    comentario_tecnico?: string;
    pregunta_residente?: string | null;
  }>;
  aclaraciones_count?: number;
  // Aprobación GT (evaluación económica) — nuevos valores: C | NC | DA | ? | PENDIENTE;
  // legacy: APROBADO | RECHAZADO. Representa el estado del primer proveedor únicamente
  // (compatibilidad legacy) — para evaluar/leer por proveedor usar
  // aprobacionesGtPorProveedor. Ver openspec/changes/evaluacion-economica-gt-por-proveedor.
  aprobacion_gt?: 'PENDIENTE' | 'C' | 'NC' | 'DA' | '?' | 'APROBADO' | 'RECHAZADO';
  comentario_gt?: string;
  // Aprobación GT por proveedor — mismo patrón que evaluacionesPorProveedor. Ver
  // openspec/changes/evaluacion-economica-gt-por-proveedor.
  aprobacionesGtPorProveedor?: Record<string, {
    id_detalle: string;
    aprobacion_gt: 'PENDIENTE' | 'C' | 'NC' | 'DA' | '?';
    comentario_gt?: string;
    pregunta_gt?: string | null;
  }>;
  // Specs de la req (heredadas del item de requisición)
  especificacion_marca_modelo?: string | null;
  especificacion_detalle?: string | null;
  // Preguntas del Residente / respuestas de Compras (flujo revisión)
  pregunta_residente?: string | null;
  respuesta_compras?: string | null;
}

export interface ProveedorComp {
  id: string;
  nombre: string;
  // Estado de respuesta a la Solicitud de Cotización — ver
  // openspec/changes/estado-respuesta-proveedor-comparativo. Ausente si el
  // proveedor se agregó manualmente desde catálogo (nunca invitado).
  estado_respuesta?: 'PENDIENTE' | 'RESPONDIO' | 'DECLINO';
  fecha_respuesta?: string | null;
  // Condiciones de crédito — atributo fijo del catálogo de Proveedores, no de la
  // cotización. Ver openspec/changes/evaluacion-economica-gt-por-proveedor.
  ofrece_credito?: boolean;
  dias_credito?: number | null;
}

export interface EspecificacionLinea {
  id_especificacion: string;
  detalle_id: string;
  descripcion: string;
  orden: number;
}

export interface AnotacionSpec {
  id_anotacion: string;
  cuadro_id: string;
  especificacion_id: string;
  proveedor_id: string;
  tipo: 'pregunta' | 'respuesta';
  texto: string;
  creado_por: string;
  created_at: string;
}

// Ver openspec/changes/evaluacion-tecnica-por-especificacion
export interface EvaluacionEspecItem {
  id_evaluacion: string;
  cuadro_id: string;
  especificacion_id: string;
  proveedor_id: string;
  evaluacion_tecnica: 'PENDIENTE' | 'C' | 'NC' | 'DA' | '?';
  comentario_tecnico?: string | null;
  pregunta_residente?: string | null;
  respuesta_compras?: string | null;
}

export interface LineaDetalleTecnico {
  insumo_id: string | null;
  marca_modelo_ref?: string | null;
  especificaciones_requeridas?: string | null;
  detalle_req_id?: string | null;
  especificaciones?: EspecificacionLinea[];
}

// Llave de línea para "Detalles técnicos": insumo_id de catálogo, o detalle_req_id
// para ítems de texto libre sin catálogo (ver
// openspec/changes/cotizar-items-texto-libre-comparativa).
function lineaDetalleKey(l: { insumo_id?: string | null; detalle_req_id?: string | null }): string {
  return l.insumo_id ?? l.detalle_req_id ?? '';
}

export interface FichaTecnica {
  id_ficha: string;
  nombre_doc: string;
  proveedor_ref?: string | null;
  mime_type: string;
  tamano_bytes: number;
  subido_por: string;
  created_at: string;
}

export interface OcItemEnComparativa {
  id_item: string;
  insumo_id: string;
  cantidad: number;
  precio_unitario: number;
  importe: number;
  cantidad_acumulada_recibida: number;
  porcentaje_recibido: number;
}

export interface OrdenCompraEnComparativa {
  id_orden: string;
  codigo: string;
  estado: string;
  estado_pago?: string;
  proveedor_nombre: string;
  proveedor_id: string;
  total: number;
  subtotal?: number;
  iva?: number;
  fecha_emision?: string;
  items: OcItemEnComparativa[];
}

export type EstadoComparativa =
  | 'BORRADOR'
  | 'EN_EVALUACION_TECNICA'
  | 'EVALUADO_TECNICAMENTE'
  | 'LOCKED'
  | 'FIRMADO_BLOQUEADO'
  | 'REVISION_SOLICITADA'
  | 'EN_APROBACION_GT'
  | 'APROBADO_GT'
  | 'RECHAZADO_GT'
  | 'CERRADO'
  | 'SUPERSEDIDO'
  | 'EN_PROCESO'
  | 'AUTORIZADA';

export interface ComparativaLocal {
  id: string;
  codigo?: string;
  requisicion_id: string;
  estado: EstadoComparativa;
  revision?: string;
  revision_padre_id?: string | null;
  primera_opcion_proveedor_id?: string | null;
  segunda_opcion_proveedor_id?: string | null;
  firmado_por?: string | null;
  fecha_firma?: string | null;
  veredicto_residente?: string | null;
  proveedores_sugeridos?: string | null;
  proveedores: ProveedorComp[];
  lineas: CotizacionLinea[];
  lineas_detalle?: LineaDetalleTecnico[];
  anotaciones_spec?: AnotacionSpec[];
  evaluaciones_especificacion?: EvaluacionEspecItem[];
  ordenes_compra: OrdenCompraEnComparativa[];
}

// ─── Colores por proveedor (A, B, C) ─────────────────────────────────────────
const PROV_COLORS = [
  { chip: 'border-blue-500/20 bg-blue-500/10 text-blue-700',      col: '#1d4ed8', btn: 'bg-blue-500/10 hover:bg-blue-500 text-blue-700 hover:text-white',     win: 'bg-blue-500 text-white' },
  { chip: 'border-violet-500/20 bg-violet-500/10 text-violet-700', col: '#7c3aed', btn: 'bg-violet-500/10 hover:bg-violet-500 text-violet-700 hover:text-white', win: 'bg-violet-500 text-white' },
  { chip: 'border-teal-500/20 bg-teal-500/10 text-teal-700',      col: '#0d9488', btn: 'bg-teal-500/10 hover:bg-teal-500 text-teal-700 hover:text-white',     win: 'bg-teal-500 text-white' },
];

const ESTADO_STYLE: Record<string, { badge: string; label: string }> = {
  BORRADOR:               { badge: 'border-slate-500/20 bg-slate-500/10 text-slate-600',    label: 'Borrador' },
  EN_PROCESO:             { badge: 'border-amber-500/20 bg-amber-500/10 text-amber-600',    label: 'En Proceso' },
  EN_EVALUACION_TECNICA:  { badge: 'border-amber-500/20 bg-amber-500/10 text-amber-700',    label: 'En Evaluación Técnica' },
  EVALUADO_TECNICAMENTE:  { badge: 'border-blue-500/20 bg-blue-500/10 text-blue-700',       label: 'Evaluado Técnicamente' },
  LOCKED:                 { badge: 'border-red-500/20 bg-red-500/10 text-red-700',          label: '🔒 LOCKED' },
  FIRMADO_BLOQUEADO:      { badge: 'border-red-700/30 bg-red-700/10 text-red-800',          label: '🔒 Firmado y Bloqueado' },
  REVISION_SOLICITADA:    { badge: 'border-orange-500/20 bg-orange-500/10 text-orange-600', label: 'Revisión Solicitada' },
  EN_APROBACION_GT:       { badge: 'border-violet-500/20 bg-violet-500/10 text-violet-700', label: 'En Aprobación GT' },
  APROBADO_GT:            { badge: 'border-green-500/20 bg-green-500/10 text-green-700',    label: 'Aprobado por GT' },
  RECHAZADO_GT:           { badge: 'border-red-500/20 bg-red-500/10 text-red-700',          label: 'Rechazado por GT' },
  SUPERSEDIDO:            { badge: 'border-slate-400/30 bg-slate-400/10 text-slate-500',    label: 'Supersedido' },
  AUTORIZADA:             { badge: 'border-green-500/20 bg-green-500/10 text-green-600',    label: 'Autorizada' },
  CERRADO:                { badge: 'border-slate-400/20 bg-slate-400/10 text-slate-500',    label: 'Cerrado' },
};

const EVAL_STYLE: Record<string, string> = {
  PENDIENTE: 'border-slate-300 bg-slate-100 text-slate-500',
  C:         'border-green-500/30 bg-green-500/10 text-green-700',
  NC:        'border-red-500/30 bg-red-500/10 text-red-700',
  DA:        'border-amber-500/30 bg-amber-500/10 text-amber-700',
  '?':       'border-indigo-500/30 bg-indigo-500/10 text-indigo-700',
  APROBADO:  'border-green-500/30 bg-green-500/10 text-green-700',
  RECHAZADO: 'border-red-500/30 bg-red-500/10 text-red-700',
};

// Botones C/NC/DA/? activos (relleno sólido) — matriz de evaluación por característica
const EVAL_BTN_ACTIVE: Record<string, string> = {
  C:  'border-green-500 bg-green-500 text-white',
  NC: 'border-red-500 bg-red-500 text-white',
  DA: 'border-amber-500 bg-amber-500 text-white',
  '?': 'border-indigo-500 bg-indigo-500 text-white',
};

const ESTADO_RESPUESTA_STYLE: Record<string, { badge: string; label: string }> = {
  RESPONDIO:  { badge: 'border-green-500/30 bg-green-500/10 text-green-700', label: 'Respondió' },
  DECLINO:    { badge: 'border-red-500/30 bg-red-500/10 text-red-700',      label: 'Declinó' },
  PENDIENTE:  { badge: 'border-slate-300 bg-slate-100 text-slate-500',      label: 'Pendiente' },
};

const OC_ESTADO_STYLE: Record<string, { badge: string; label: string }> = {
  BORRADOR:              { badge: 'border-slate-400/30 bg-slate-400/10 text-slate-500',       label: 'Borrador' },
  PENDIENTE:             { badge: 'border-amber-400/30 bg-amber-400/10 text-amber-600',       label: 'Pendiente' },
  APROBADA:              { badge: 'border-blue-400/30 bg-blue-400/10 text-blue-600',          label: 'Aprobada' },
  EMITIDA:               { badge: 'border-green-500/30 bg-green-500/10 text-green-700',       label: 'Emitida' },
  PARCIALMENTE_RECIBIDA: { badge: 'border-amber-500/30 bg-amber-500/10 text-amber-700',       label: 'En recepción' },
  RECIBIDA:              { badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700', label: 'Recibida ✓' },
  CANCELADA:             { badge: 'border-red-500/30 bg-red-500/10 text-red-600',             label: 'Cancelada' },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface Insumo { id: string; clave: string; descripcion: string; unidad: string; }

export interface ProveedorCatalogoItem {
  id: string;
  razon_social: string;
  rfc?: string;
}

interface Props {
  requisicionFolio: string;
  comparativa: ComparativaLocal;
  insumos: Insumo[];
  isDemo: boolean;
  onBack: () => void;
  onUpdate: (updated: ComparativaLocal) => void;
  onExportOcPdf?: (oc: ComparativaLocal['ordenes_compra'][number]) => void;
  onExportComparativaPdf?: () => void;
  proveedoresCatalogo?: ProveedorCatalogoItem[];
  /** Vista de Residente: oculta precios y habilita flujo de evaluación técnica pura */
  modo?: 'compras' | 'residente';
}

// ─── Componente ───────────────────────────────────────────────────────────────

export const ComparativaDetail: React.FC<Props> = ({
  requisicionFolio, comparativa: comp, insumos, isDemo, onBack, onUpdate,
  onExportOcPdf, onExportComparativaPdf, proveedoresCatalogo = [],
  modo = 'compras',
}) => {
  const { user } = useTenant();
  const { notify } = useNotification();
  const roles: string[] = user?.role ?? [];

  // ── Local state ─────────────────────────────────────────────────────────────
  const [showAddProv, setShowAddProv] = useState(false);
  const [provSearch, setProvSearch] = useState('');
  const [provDropdownOpen, setProvDropdownOpen] = useState(false);
  const provSearchRef = useRef<HTMLDivElement>(null);
  const [addLineaOpen, setAddLineaOpen] = useState(false);
  const [addLineaSearch, setAddLineaSearch] = useState('');
  const [addLineaDropdown, setAddLineaDropdown] = useState(false);
  const [addLineaInsumoId, setAddLineaInsumoId] = useState('');
  const [addLineaInsumoLabel, setAddLineaInsumoLabel] = useState('');
  const [addLineaInsumoUnidad, setAddLineaInsumoUnidad] = useState('');
  const [addLineaCantidad, setAddLineaCantidad] = useState('');
  const [autorizando, setAutorizando] = useState(false);

  // 7.1 Evaluación técnica inline (Residente) — sub-fila en "TABLA DE COTIZACIONES", ver
  // openspec/changes/evaluacion-tecnica-inline-tabla-comparativa.
  const [evalForm, setEvalForm] = useState<Record<string, { decision: 'C' | 'NC' | 'DA' | '?' | 'PENDIENTE'; comentario: string }>>({});
  const [preguntasEval, setPreguntasEval] = useState<Record<string, string>>({});
  const [enviandoEval, setEnviandoEval] = useState(false);
  const [guardandoLineaId, setGuardandoLineaId] = useState<string | null>(null);

  // Veredicto del Residente
  const [veredicto, setVeredicto] = useState<string>(comp.veredicto_residente ?? '');
  const [provSugeridos, setProvSugeridos] = useState<string[]>(() => {
    try { return JSON.parse(comp.proveedores_sugeridos ?? '[]'); } catch { return []; }
  });
  const [guardandoVeredicto, setGuardandoVeredicto] = useState(false);

  // Desbloqueo admin
  const [showDesbloquearModal, setShowDesbloquearModal] = useState(false);
  const [justificacionDesbloqueo, setJustificacionDesbloqueo] = useState('');
  const [desbloqueando, setDesbloqueando] = useState(false);
  const [auditDesbloqueos, setAuditDesbloqueos] = useState<{ id_auditoria: string; timestamp_desbloqueo: string; desbloqueado_por: string; justificacion: string }[]>([]);

  // Selección de proveedor (1ª/2ª opción)
  const [primeraOpcion, setPrimeraOpcion] = useState<string>(comp.primera_opcion_proveedor_id ?? '');
  const [segundaOpcion, setSegundaOpcion] = useState<string>(comp.segunda_opcion_proveedor_id ?? '');
  const [guardandoSeleccion, setGuardandoSeleccion] = useState(false);

  // Firma modal
  const [showFirmaModal, setShowFirmaModal] = useState(false);
  const [firmaConfirmado, setFirmaConfirmado] = useState(false);
  const [firmando, setFirmando] = useState(false);
  const [firmaError, setFirmaError] = useState<string | null>(null);

  // Aclaraciones
  const [aclaraciones, setAclaraciones] = useState<AclaracionComparativa[]>([]);
  const [aclaracionCelda, setAclaracionCelda] = useState<{ insumo_id: string; proveedor_id: string } | null>(null);
  const [aclaracionMensaje, setAclaracionMensaje] = useState('');
  const [aclaracionTipo, setAclaracionTipo] = useState<'PREGUNTA' | 'RESPUESTA'>('RESPUESTA');
  const [enviandoAclaracion, setEnviandoAclaracion] = useState(false);

  // Nueva revisión
  const [showRevisionConfirm, setShowRevisionConfirm] = useState(false);
  const [creandoRevision, setCreandoRevision] = useState(false);

  // 8.1 Evaluación económica GT inline — sub-fila en "TABLA DE COTIZACIONES", ver
  // openspec/changes/evaluacion-economica-gt-por-proveedor.
  const [gtForm, setGtForm] = useState<Record<string, { decision: 'C' | 'NC' | 'DA' | '?' | 'PENDIENTE'; comentario: string }>>({});
  const [preguntasGT, setPreguntasGT] = useState<Record<string, string>>({});
  const [guardandoLineaGtId, setGuardandoLineaGtId] = useState<string | null>(null);
  const [comentarioGTGeneral, setComentarioGTGeneral] = useState('');
  const [enviandoGT, setEnviandoGT] = useState(false);

  const [accionando, setAccionando] = useState(false);

  // ── Fichas técnicas de insumo ────────────────────────────────────────────────
  const [fichasInsumo, setFichasInsumo] = useState<Record<string, FichaTecnica[]>>({});
  const [sideSheetFichasInsumoId, setSideSheetFichasInsumoId] = useState<string | null>(null);
  const [loadingFichas, setLoadingFichas] = useState(false);
  const [uploadingFicha, setUploadingFicha] = useState(false);
  const fichaFileRef = useRef<HTMLInputElement>(null);
  const [fichaUploadInsumoId, setFichaUploadInsumoId] = useState<string | null>(null);

  // ── Detalles técnicos inline (BORRADOR) ──────────────────────────────────────
  const [detallesTecnicos, setDetallesTecnicos] = useState<Record<string, { marca: string; espec: string }>>({});

  // ── Specs por insumo y anotaciones (10.1-10.4) ───────────────────────────────
  const [especsMap, setEspecsMap] = useState<Record<string, EspecificacionLinea[]>>({});
  const [anotacionesSpec, setAnotacionesSpec] = useState<AnotacionSpec[]>([]);
  const [anotacionPanel, setAnotacionPanel] = useState<{ especId: string; especDesc: string; proveedorId: string; proveedorNombre: string } | null>(null);
  const [anotacionForm, setAnotacionForm] = useState<{ tipo: 'pregunta' | 'respuesta'; texto: string }>({ tipo: 'pregunta', texto: '' });
  const [guardandoAnotacion, setGuardandoAnotacion] = useState(false);

  // ── Evaluación técnica por característica (matriz) ──────────────────────────
  const [evaluacionesEspec, setEvaluacionesEspec] = useState<EvaluacionEspecItem[]>([]);
  const [dudaSpecAbierta, setDudaSpecAbierta] = useState<string | null>(null); // cellKey `${especId}:${provId}`
  const [dudaSpecTexto, setDudaSpecTexto] = useState('');
  const [guardandoEvalSpec, setGuardandoEvalSpec] = useState<string | null>(null);
  const [respuestaSpecTexto, setRespuestaSpecTexto] = useState<Record<string, string>>({});
  const [enviandoRevisionSpec, setEnviandoRevisionSpec] = useState(false);

  // ── Recepción de materiales contra OC ───────────────────────────────────────
  type RecepcionLinea = { cantidad_recibida: string; nota_discrepancia: string };
  const [recepcionPanelOcId, setRecepcionPanelOcId] = useState<string | null>(null);
  const [recepcionFecha, setRecepcionFecha] = useState('');
  const [recepcionNotas, setRecepcionNotas] = useState('');
  const [recepcionLineas, setRecepcionLineas] = useState<Record<string, RecepcionLinea>>({});
  const [guardandoRecepcion, setGuardandoRecepcion] = useState(false);
  const ocFetchedRef = useRef(false);
  // compRef keeps latest comp to avoid stale closures in async callbacks
  const compRef = useRef(comp);
  compRef.current = comp;

  // Presupuesto resolution for convertir-oc (task 4.1)
  type PresupuestoActivo = { id_presupuesto: string; codigo: string; descripcion: string; monto_disponible: number };
  const [presupuestos, setPresupuestos] = useState<PresupuestoActivo[]>([]);
  const [selectedPresupuestoId, setSelectedPresupuestoId] = useState('');
  const [showPresupuestoModal, setShowPresupuestoModal] = useState(false);

  // Partidas bloqueadas al generar OC
  type OcBloqueada = { concepto_id: string; concepto_clave: string; concepto_desc: string; monto_requerido: number };
  const [ocBloqueadas, setOcBloqueadas] = useState<OcBloqueada[]>([]);

  // Fetch OC data (with acumulados) when the detail opens — the list endpoint omits this
  useEffect(() => {
    if (isDemo || ocFetchedRef.current) return;
    ocFetchedRef.current = true;
    const id = compRef.current.id;
    api.get(`/api/v1/compras/comparativas/${id}`)
      .then(resp => {
        const estadoRespuestaProveedor = resp.data?.data?.estado_respuesta_proveedor as
          Record<string, { estado: 'PENDIENTE' | 'RESPONDIO' | 'DECLINO'; fecha_respuesta: string | null }> | undefined;
        if (resp.data?.data?.ordenes_compra || estadoRespuestaProveedor) {
          onUpdate({
            ...compRef.current,
            ...(resp.data.data.ordenes_compra ? { ordenes_compra: resp.data.data.ordenes_compra } : {}),
            ...(estadoRespuestaProveedor ? {
              proveedores: compRef.current.proveedores.map(p => estadoRespuestaProveedor[p.id]
                ? { ...p, estado_respuesta: estadoRespuestaProveedor[p.id].estado, fecha_respuesta: estadoRespuestaProveedor[p.id].fecha_respuesta }
                : p),
            } : {}),
          });
        }
        const archivos = resp.data?.data?.archivos_proveedor as { proveedor_id: string; pdf_nombre: string; updated_at: string }[] | undefined;
        if (archivos) {
          setArchivosProveedor(Object.fromEntries(archivos.map(a => [a.proveedor_id, { pdf_nombre: a.pdf_nombre, updated_at: a.updated_at }])));
        }
      })
      .catch(() => {});
  }, []);

  // Init recepción form when panel opens
  useEffect(() => {
    if (!recepcionPanelOcId) return;
    const oc = comp.ordenes_compra.find(o => o.id_orden === recepcionPanelOcId);
    if (!oc) return;
    const initial: Record<string, RecepcionLinea> = {};
    for (const item of oc.items) {
      const pendiente = Math.max(0, item.cantidad - item.cantidad_acumulada_recibida);
      initial[item.id_item] = {
        cantidad_recibida: pendiente > 0 ? String(Math.round(pendiente * 10000) / 10000) : '0',
        nota_discrepancia: '',
      };
    }
    setRecepcionLineas(initial);
    setRecepcionFecha(new Date().toISOString().slice(0, 10));
    setRecepcionNotas('');
  }, [recepcionPanelOcId]);

  const handleSubmitRecepcion = async () => {
    if (!recepcionPanelOcId) return;
    const itemsPayload = Object.entries(recepcionLineas)
      .filter(([, v]) => parseFloat(v.cantidad_recibida) > 0)
      .map(([id_item, v]) => ({
        orden_item_id: id_item,
        cantidad_recibida: parseFloat(v.cantidad_recibida),
        nota_discrepancia: v.nota_discrepancia.trim() || undefined,
      }));
    if (itemsPayload.length === 0) {
      notify({ type: 'error', title: 'Sin ítems', message: 'Ingresa al menos una cantidad mayor a 0.' });
      return;
    }
    setGuardandoRecepcion(true);
    try {
      const resp = await api.post(`/api/v1/compras/ordenes-compra/${recepcionPanelOcId}/recepciones`, {
        fecha_recepcion: recepcionFecha,
        notas: recepcionNotas.trim() || undefined,
        items: itemsPayload,
      });
      const nuevoEstado = resp.data.data?.nuevo_estado_oc;
      notify({
        type: 'success',
        title: 'Recepción registrada',
        message: nuevoEstado === 'RECIBIDA' ? 'OC completamente recibida.' : 'Recepción parcial registrada.',
      });
      setRecepcionPanelOcId(null);
      try {
        const refreshResp = await api.get(`/api/v1/compras/comparativas/${compRef.current.id}`);
        if (refreshResp.data?.data?.ordenes_compra) {
          onUpdate({ ...compRef.current, ordenes_compra: refreshResp.data.data.ordenes_compra });
        }
      } catch (_) {}
    } catch (err: any) {
      notify({ type: 'error', title: 'Error', message: err.response?.data?.message ?? err.message });
    } finally {
      setGuardandoRecepcion(false);
    }
  };

  // ── Asistente IA: lectura de cotización PDF ──────────────────────────────────
  interface RenglonEditable { descripcion: string; unidad: string; cantidad: string; precio_unitario: string; }
  const [pdfProveedorId, setPdfProveedorId] = useState<string | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [renglonesPdf, setRenglonesPdf] = useState<RenglonEditable[]>([]);
  const [showPdfReview, setShowPdfReview] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [aplicandoCotizacion, setAplicandoCotizacion] = useState(false);
  const [archivosProveedor, setArchivosProveedor] = useState<Record<string, { pdf_nombre: string; updated_at: string }>>({});
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const addLineaRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdowns al hacer clic afuera
  useEffect(() => {
    if (!addLineaDropdown) return;
    const handler = (e: MouseEvent) => {
      if (addLineaRef.current && !addLineaRef.current.contains(e.target as Node)) {
        setAddLineaDropdown(false);
      }
    };
    setTimeout(() => window.addEventListener('mousedown', handler), 0);
    return () => window.removeEventListener('mousedown', handler);
  }, [addLineaDropdown]);

  useEffect(() => {
    if (!provDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (provSearchRef.current && !provSearchRef.current.contains(e.target as Node)) {
        setProvDropdownOpen(false);
      }
    };
    setTimeout(() => window.addEventListener('mousedown', handler), 0);
    return () => window.removeEventListener('mousedown', handler);
  }, [provDropdownOpen]);

  // Inicializar form de evaluación al montar — una entrada por (línea, proveedor), no
  // una por línea. La sub-fila de evaluación en la tabla es siempre visible (sin modal),
  // así que se inicializa una sola vez, no re-sincroniza en cada cambio de `comp` para no
  // perder ediciones sin guardar de otras líneas cuando se guarda una. Ver
  // openspec/changes/fix-evaluacion-tecnica-por-proveedor y
  // openspec/changes/evaluacion-tecnica-inline-tabla-comparativa.
  useEffect(() => {
    const init: Record<string, { decision: 'C' | 'NC' | 'DA' | '?' | 'PENDIENTE'; comentario: string }> = {};
    const preguntas: Record<string, string> = {};
    comp.lineas.forEach(l => {
      const porProveedor = Object.entries(l.evaluacionesPorProveedor ?? {});
      if (porProveedor.length > 0) {
        porProveedor.forEach(([provId, ev]) => {
          const v = ev.evaluacion_tecnica;
          const mapped: 'C' | 'NC' | 'DA' | '?' | 'PENDIENTE' =
            (v as any) === 'APROBADO' ? 'C' : (v as any) === 'RECHAZADO' ? 'NC' : v ?? 'PENDIENTE';
          init[`${l.id}:${provId}`] = { decision: mapped, comentario: ev.comentario_tecnico ?? '' };
          if (ev.pregunta_residente) preguntas[`${l.id}:${provId}`] = ev.pregunta_residente;
        });
      } else {
        // Fallback legacy: sin datos por proveedor, usar el campo singular de la línea.
        const v = l.evaluacion_tecnica;
        const mapped: 'C' | 'NC' | 'DA' | '?' | 'PENDIENTE' =
          v === 'APROBADO' ? 'C' : v === 'RECHAZADO' ? 'NC' : (v as 'C' | 'NC' | 'DA' | '?' | 'PENDIENTE') ?? 'PENDIENTE';
        init[l.id] = { decision: mapped, comentario: l.comentario_tecnico ?? '' };
      }
    });
    setEvalForm(init);
    setPreguntasEval(preguntas);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Inicializar form GT al montar — una entrada por (línea, proveedor), no una por línea.
  // La sub-fila de evaluación económica en la tabla es siempre visible (sin modal), así
  // que se inicializa una sola vez, no re-sincroniza en cada cambio de `comp`. Ver
  // openspec/changes/evaluacion-economica-gt-por-proveedor.
  useEffect(() => {
    const init: Record<string, { decision: 'C' | 'NC' | 'DA' | '?' | 'PENDIENTE'; comentario: string }> = {};
    const preguntas: Record<string, string> = {};
    comp.lineas.forEach(l => {
      const porProveedor = Object.entries(l.aprobacionesGtPorProveedor ?? {});
      if (porProveedor.length > 0) {
        porProveedor.forEach(([provId, ap]) => {
          const v = ap.aprobacion_gt;
          const mapped: 'C' | 'NC' | 'DA' | '?' | 'PENDIENTE' =
            (v as any) === 'APROBADO' ? 'C' : (v as any) === 'RECHAZADO' ? 'NC' : v ?? 'PENDIENTE';
          init[`${l.id}:${provId}`] = { decision: mapped, comentario: ap.comentario_gt ?? '' };
          if (ap.pregunta_gt) preguntas[`${l.id}:${provId}`] = ap.pregunta_gt;
        });
      } else {
        const v = l.aprobacion_gt;
        const mapped: 'C' | 'NC' | 'DA' | '?' | 'PENDIENTE' =
          v === 'APROBADO' ? 'C' : v === 'RECHAZADO' ? 'NC' : (v as 'C' | 'NC' | 'DA' | '?' | 'PENDIENTE') ?? 'PENDIENTE';
        init[l.id] = { decision: mapped, comentario: l.comentario_gt ?? '' };
      }
    });
    setGtForm(init);
    setPreguntasGT(preguntas);
    setComentarioGTGeneral('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cargar auditoría de desbloqueos si admin y cuadro firmado
  useEffect(() => {
    if (isDemo || !roles.includes('admin')) return;
    api.get(`/api/v1/compras/comparativas/${comp.id}/auditoria-desbloqueos`)
      .then(res => setAuditDesbloqueos(res.data?.data ?? []))
      .catch(() => {});
  }, [comp.id, comp.estado]);

  // Cargar detalle completo del cuadro (lineas_detalle + specs + anotaciones)
  useEffect(() => {
    const initFromProp = () => {
      const init: Record<string, { marca: string; espec: string }> = {};
      (comp.lineas_detalle ?? []).forEach(ld => {
        const key = lineaDetalleKey(ld);
        init[key] = { marca: ld.marca_modelo_ref ?? '', espec: ld.especificaciones_requeridas ?? '' };
        if ((ld.especificaciones?.length ?? 0) > 0) {
          setEspecsMap(prev => ({ ...prev, [key]: ld.especificaciones! }));
        }
      });
      setDetallesTecnicos(init);
      if (comp.anotaciones_spec) setAnotacionesSpec(comp.anotaciones_spec);
      if (comp.evaluaciones_especificacion) setEvaluacionesEspec(comp.evaluaciones_especificacion);
    };
    initFromProp();
    if (isDemo) return;
    // Enriquecer desde el API para obtener specs y anotaciones actualizadas
    api.get(`/api/v1/compras/comparativas/${comp.id}`).then(res => {
      const full = res.data?.data;
      if (!full) return;
      const init: Record<string, { marca: string; espec: string }> = {};
      const newEspecsMap: Record<string, EspecificacionLinea[]> = {};
      for (const ld of (full.lineas_detalle ?? [])) {
        const key = lineaDetalleKey(ld);
        init[key] = { marca: ld.marca_modelo_ref ?? '', espec: ld.especificaciones_requeridas ?? '' };
        if ((ld.especificaciones?.length ?? 0) > 0) newEspecsMap[key] = ld.especificaciones;
      }
      setDetallesTecnicos(init);
      setEspecsMap(newEspecsMap);
      setAnotacionesSpec(full.anotaciones_spec ?? []);
      setEvaluacionesEspec(full.evaluaciones_especificacion ?? []);
    }).catch(() => { /* silencioso */ });
  }, [comp.id]);

  // ── Evaluación técnica por característica × proveedor (matriz) ──────────────
  // Ver openspec/changes/evaluacion-tecnica-por-especificacion.
  const handleEvaluarEspec = async (especId: string, provId: string, decision: 'C' | 'NC' | 'DA' | '?', pregunta?: string) => {
    if (decision === '?' && !pregunta?.trim()) return;
    const cellKey = `${especId}:${provId}`;
    setGuardandoEvalSpec(cellKey);
    try {
      if (isDemo) {
        setEvaluacionesEspec(prev => {
          const idx = prev.findIndex(e => e.especificacion_id === especId && e.proveedor_id === provId);
          const updated: EvaluacionEspecItem = {
            id_evaluacion: prev[idx]?.id_evaluacion ?? cellKey,
            cuadro_id: comp.id,
            especificacion_id: especId,
            proveedor_id: provId,
            evaluacion_tecnica: decision,
            pregunta_residente: decision === '?' ? pregunta!.trim() : null,
            respuesta_compras: null,
          };
          if (idx >= 0) { const copy = [...prev]; copy[idx] = updated; return copy; }
          return [...prev, updated];
        });
        setDudaSpecAbierta(null);
        setDudaSpecTexto('');
        return;
      }
      await api.patch(`/api/v1/compras/comparativas/${comp.id}/evaluar-especificaciones`, {
        evaluaciones: [{ especificacion_id: especId, proveedor_id: provId, evaluacion_tecnica: decision, pregunta_residente: decision === '?' ? pregunta!.trim() : undefined }],
      });
      const res = await api.get(`/api/v1/compras/comparativas/${comp.id}`);
      setEvaluacionesEspec(res.data?.data?.evaluaciones_especificacion ?? []);
      onUpdate({ ...comp, ...res.data?.data });
      setDudaSpecAbierta(null);
      setDudaSpecTexto('');
    } catch (err: any) {
      notify({ type: 'error', title: 'Error al guardar evaluación', message: err.response?.data?.message ?? err.message });
    } finally {
      setGuardandoEvalSpec(null);
    }
  };

  const handleResponderDudaEspec = async (especId: string, provId: string) => {
    const cellKey = `${especId}:${provId}`;
    const texto = respuestaSpecTexto[cellKey];
    if (!texto?.trim()) return;
    setGuardandoEvalSpec(cellKey);
    try {
      await api.put(`/api/v1/compras/comparativas/${comp.id}/responder-preguntas`, {
        respuestas_especificacion: [{ especificacion_id: especId, proveedor_id: provId, respuesta_compras: texto.trim() }],
      });
      const res = await api.get(`/api/v1/compras/comparativas/${comp.id}`);
      setEvaluacionesEspec(res.data?.data?.evaluaciones_especificacion ?? []);
      setRespuestaSpecTexto(prev => { const copy = { ...prev }; delete copy[cellKey]; return copy; });
      notify({ type: 'success', title: 'Respuesta guardada' });
    } catch (err: any) {
      notify({ type: 'error', title: 'Error al responder', message: err.response?.data?.message ?? err.message });
    } finally {
      setGuardandoEvalSpec(null);
    }
  };

  const hayDudasEspecPendientes = evaluacionesEspec.some(e => e.evaluacion_tecnica === '?' && e.pregunta_residente);

  const handleEnviarDudasEspec = async () => {
    setEnviandoRevisionSpec(true);
    try {
      const resp = await api.post(`/api/v1/compras/comparativas/${comp.id}/revision-con-preguntas`, {});
      const nuevaRevision = resp.data?.data?.revision_label ?? '?';
      notify({ type: 'success', title: `Se creó la revisión ${nuevaRevision}`, message: 'Compras verá tus dudas y podrá responderlas.' });
      onBack();
    } catch (err: any) {
      notify({ type: 'error', title: 'Error al crear revisión', message: err.response?.data?.message ?? err.message });
    } finally {
      setEnviandoRevisionSpec(false);
    }
  };

  // Guardar anotación de especificación (10.4)
  const handleGuardarAnotacion = async () => {
    if (!anotacionPanel || !anotacionForm.texto.trim()) return;
    setGuardandoAnotacion(true);
    try {
      await api.post(`/api/v1/compras/comparativas/${comp.id}/anotaciones-spec`, {
        especificacion_id: anotacionPanel.especId,
        proveedor_id:      anotacionPanel.proveedorId,
        tipo:              anotacionForm.tipo,
        texto:             anotacionForm.texto.trim(),
      });
      const res = await api.get(`/api/v1/compras/comparativas/${comp.id}`);
      setAnotacionesSpec(res.data?.data?.anotaciones_spec ?? []);
      setAnotacionPanel(null);
      notify({ type: 'success', title: 'Anotación guardada' });
    } catch (err: any) {
      notify({ type: 'error', title: 'Error al guardar anotación', message: err.message });
    } finally {
      setGuardandoAnotacion(false);
    }
  };

  // Fetch fichas técnicas de un insumo
  const fetchFichas = async (insumoId: string) => {
    if (isDemo) return;
    setLoadingFichas(true);
    try {
      const resp = await api.get(`/api/v1/gerencia-tecnica/insumos/${insumoId}/fichas`);
      setFichasInsumo(prev => ({ ...prev, [insumoId]: resp.data.data ?? [] }));
    } catch (_) {
      setFichasInsumo(prev => ({ ...prev, [insumoId]: [] }));
    } finally {
      setLoadingFichas(false);
    }
  };

  // Guardar detalle técnico al salir del campo (blur)
  const handleDetalleBlur = async (insumoId: string) => {
    if (isDemo || comp.estado !== 'BORRADOR') return;
    const dt = detallesTecnicos[insumoId] ?? { marca: '', espec: '' };
    try {
      await api.put(`/api/v1/compras/comparativas/${comp.id}/lineas/${insumoId}`, {
        marca_modelo_ref:           dt.marca || null,
        especificaciones_requeridas: dt.espec || null,
      });
    } catch (_) { /* silencioso — el usuario puede reintentar */ }
  };

  // Upload de ficha técnica
  const handleFichaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const insumoId = fichaUploadInsumoId;
    e.target.value = '';
    if (!file || !insumoId) return;
    setUploadingFicha(true);
    try {
      const fd = new FormData();
      fd.append('archivo', file);
      fd.append('nombre_doc', file.name);
      await api.post(`/api/v1/gerencia-tecnica/insumos/${insumoId}/fichas`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      notify({ type: 'success', title: 'Ficha subida', message: file.name });
      await fetchFichas(insumoId);
    } catch (err: any) {
      notify({ type: 'error', title: 'Error al subir ficha', message: err.response?.data?.message ?? err.message });
    } finally {
      setUploadingFicha(false);
    }
  };

  // Eliminar ficha técnica
  const handleFichaDelete = async (insumoId: string, fichaId: string) => {
    try {
      await api.delete(`/api/v1/gerencia-tecnica/insumos/${insumoId}/fichas/${fichaId}`);
      setFichasInsumo(prev => ({ ...prev, [insumoId]: (prev[insumoId] ?? []).filter(f => f.id_ficha !== fichaId) }));
      notify({ type: 'success', title: 'Ficha eliminada', message: '' });
    } catch (err: any) {
      notify({ type: 'error', title: 'Error al eliminar', message: err.response?.data?.message ?? err.message });
    }
  };

  // ── Computed ─────────────────────────────────────────────────────────────────
  const lineaSuggestions = useMemo(() => {
    const existing = new Set(comp.lineas.map(l => l.insumo_id));
    const available = insumos.filter(i => !existing.has(i.id));
    const q = addLineaSearch.toLowerCase();
    if (!q) return available.slice(0, 6);
    return available.filter(i =>
      i.clave.toLowerCase().includes(q) || i.descripcion.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [insumos, addLineaSearch, comp.lineas]);

  const getTotalProveedor = (provId: string) =>
    comp.lineas.reduce((sum, l) => {
      const p = parseFloat(l.precios[provId] || '0') || 0;
      return sum + p * l.cantidad;
    }, 0);

  const getTotalGanador = () =>
    comp.lineas.reduce((sum, l) => {
      if (!l.ganador) return sum;
      const p = parseFloat(l.precios[l.ganador] || '0') || 0;
      return sum + p * l.cantidad;
    }, 0);

  const canAuthorize =
    comp.lineas.length > 0 &&
    comp.proveedores.length > 0 &&
    comp.lineas.every(l => l.ganador !== null) &&
    comp.estado !== 'AUTORIZADA';

  // Cuadro bloqueado para edición si ya salió del flujo de llenado
  const locked = ['AUTORIZADA', 'APROBADO_GT', 'RECHAZADO_GT', 'CERRADO',
                  'EN_EVALUACION_TECNICA', 'EVALUADO_TECNICAMENTE', 'EN_APROBACION_GT',
                  'LOCKED', 'FIRMADO_BLOQUEADO', 'REVISION_SOLICITADA', 'SUPERSEDIDO'].includes(comp.estado);
  const isLocked = comp.estado === 'LOCKED' || comp.estado === 'FIRMADO_BLOQUEADO';
  const isFirmadoBloqueado = comp.estado === 'FIRMADO_BLOQUEADO';
  const isSupersedido = comp.estado === 'SUPERSEDIDO';
  const isRevisionSolicitada = comp.estado === 'REVISION_SOLICITADA';
  const isResidenteMode = modo === 'residente';

  const formatMXN = (n: number) =>
    n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 });

  // 6.2 Determinar qué botones de acción muestra el usuario según su rol y el estado del cuadro
  const isProcurement = roles.some(r => ['procurement', 'admin'].includes(r));
  const isResident    = roles.some(r => ['resident', 'residencia', 'control_obra'].includes(r));
  const isSuperint    = roles.includes('superintendent');
  const isGT          = roles.some(r => ['gerencia_tecnica', 'superintendent', 'admin'].includes(r));

  const showEnviarEvalBtn      = isProcurement && comp.estado === 'BORRADOR';
  const showEvalTecnicaBtn     = (isResident || isSuperint || roles.includes('admin')) && comp.estado === 'EN_EVALUACION_TECNICA';
  const showEnviarGTBtn        = (isResident || isProcurement || isSuperint) && (comp.estado === 'EVALUADO_TECNICAMENTE' || comp.estado === 'LOCKED' || comp.estado === 'FIRMADO_BLOQUEADO');
  const showRevisarGTBtn       = isGT && comp.estado === 'EN_APROBACION_GT';
  const showGenerarOCBtn       = isProcurement && comp.estado === 'APROBADO_GT';
  const showAutorizarLegacyBtn = canAuthorize && comp.estado !== 'APROBADO_GT' && (comp.estado === 'BORRADOR' || comp.estado === 'EN_PROCESO');

  // Firma: solo cuando EN_EVALUACION_TECNICA + todos evaluados sin PENDIENTE o ?
  // Ver openspec/changes/fix-evaluacion-tecnica-por-proveedor: los renglones sin
  // especificaciones capturadas (panel simple) exigen que TODOS sus proveedores estén
  // evaluados, no solo el primero. Los renglones con specs (matriz) conservan el gate
  // legacy sobre el campo singular — no se tocan en este fix.
  const todasEvaluadas = comp.lineas.length > 0 && comp.lineas.every(l => {
    if (especsMap[lineaDetalleKey(l)]?.length) {
      return l.evaluacion_tecnica && l.evaluacion_tecnica !== 'PENDIENTE' && l.evaluacion_tecnica !== '?';
    }
    const porProveedor = Object.values(l.evaluacionesPorProveedor ?? {});
    if (porProveedor.length > 0) {
      return porProveedor.every(ev => ev.evaluacion_tecnica && ev.evaluacion_tecnica !== 'PENDIENTE' && ev.evaluacion_tecnica !== '?');
    }
    return l.evaluacion_tecnica && l.evaluacion_tecnica !== 'PENDIENTE' && l.evaluacion_tecnica !== '?';
  });
  // Ver openspec/changes/seleccion-proveedor-recomendado-firma: la 1ª opción
  // debe estar guardada antes de habilitar el botón de firma — antes solo
  // el backend lo rechazaba (400 tras el clic), ahora se adelanta a la UI.
  const veredictoListo = veredicto.trim().length > 0 && provSugeridos.length > 0 && !!comp.primera_opcion_proveedor_id;
  const showFirmaBtn = (isResident || roles.includes('admin')) && comp.estado === 'EN_EVALUACION_TECNICA' && todasEvaluadas && veredictoListo;
  const showNuevaRevisionBtn = (isProcurement || roles.includes('admin')) && (comp.estado === 'EN_EVALUACION_TECNICA' || comp.estado === 'LOCKED');
  const showDesbloquearBtn = roles.includes('admin') && isFirmadoBloqueado;

  // Evaluación técnica inline — ver openspec/changes/evaluacion-tecnica-inline-tabla-comparativa.
  // `showEvalTecnicaBtn` (rol + estado) decide si la sub-fila es editable; ya no abre un
  // modal, controla directamente si se muestran controles o solo el badge de solo lectura.
  const lineasSinSpecsEval = comp.lineas.filter(l => !(especsMap[lineaDetalleKey(l)]?.length));
  const formKeysDeLineaEval = (linea: CotizacionLinea): string[] => {
    const provIds = Object.keys(linea.evaluacionesPorProveedor ?? {});
    return provIds.length > 0 ? provIds.map(p => `${linea.id}:${p}`) : [linea.id];
  };
  const algunaEnDuda = lineasSinSpecsEval.some(l => formKeysDeLineaEval(l).some(k => evalForm[k]?.decision === '?'));
  const faltaPreguntaEval = lineasSinSpecsEval.some(l => formKeysDeLineaEval(l).some(k => evalForm[k]?.decision === '?' && !preguntasEval[k]?.trim()));

  // Evaluación económica GT inline — ver openspec/changes/evaluacion-economica-gt-por-proveedor.
  // `showRevisarGTBtn` (rol + estado) decide si la sub-fila es editable. Los proveedores
  // rechazados técnicamente por el Residente quedan fuera del alcance de GT (nunca pueden
  // ser C/DA) — no se les pide evaluación y no bloquean el gate de finalización, mismo
  // criterio que el backend (revisar-gt).
  const paresGtDeLinea = (linea: CotizacionLinea): { detalleId: string; formKey: string }[] => {
    const provEntries = Object.entries(linea.aprobacionesGtPorProveedor ?? {});
    if (provEntries.length === 0) return [{ detalleId: linea.id, formKey: linea.id }];
    return provEntries
      .filter(([provId]) => {
        const tec: string | undefined = linea.evaluacionesPorProveedor?.[provId]?.evaluacion_tecnica;
        return tec !== 'NC' && tec !== 'RECHAZADO';
      })
      .map(([provId, ap]) => ({ detalleId: ap.id_detalle, formKey: `${linea.id}:${provId}` }));
  };
  const formKeysDeLineaGT = (linea: CotizacionLinea): string[] => paresGtDeLinea(linea).map(p => p.formKey);
  const algunaEnDudaGT = comp.lineas.some(l => formKeysDeLineaGT(l).some(k => gtForm[k]?.decision === '?'));
  const faltaPreguntaGT = comp.lineas.some(l => formKeysDeLineaGT(l).some(k => gtForm[k]?.decision === '?' && !preguntasGT[k]?.trim()));
  const todasEvaluadasGT = comp.lineas.length > 0 && comp.lineas.every(l =>
    formKeysDeLineaGT(l).every(k => gtForm[k]?.decision && gtForm[k]?.decision !== 'PENDIENTE' && gtForm[k]?.decision !== '?')
  );

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleAddProveedorFromCatalog = (prov: ProveedorCatalogoItem) => {
    if (comp.proveedores.length >= 3) return;
    if (comp.proveedores.some(p => p.id === prov.id)) {
      notify({ type: 'warning', title: 'Proveedor duplicado', message: 'Este proveedor ya está en el cuadro' });
      return;
    }
    onUpdate({
      ...comp,
      estado: 'EN_PROCESO',
      proveedores: [
        ...comp.proveedores,
        { id: prov.id, nombre: prov.razon_social },
      ],
    });
    setProvSearch('');
    setProvDropdownOpen(false);
    setShowAddProv(false);
  };

  const handleSubirCotizacionClick = (provId: string) => {
    setPdfProveedorId(provId);
    pdfInputRef.current?.click();
  };

  const handlePdfFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pdfProveedorId) return;
    e.target.value = '';

    const prov = comp.proveedores.find(p => p.id === pdfProveedorId);
    setPdfFile(file);
    setUploadingPdf(true);
    try {
      const resp = await asistenteApi.leerCotizacionPDF(prov?.nombre ?? '', file);
      const data = resp.data?.data as { renglones?: { descripcion: string; unidad: string; cantidad: number | null; precio_unitario: number | null }[] };
      const renglones: RenglonEditable[] = (data?.renglones ?? []).map(r => ({
        descripcion: r.descripcion ?? '',
        unidad: r.unidad ?? '',
        cantidad: r.cantidad != null ? String(r.cantidad) : '',
        precio_unitario: r.precio_unitario != null ? String(r.precio_unitario) : '',
      }));
      setRenglonesPdf(renglones);
      setShowPdfReview(true);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      const msg = status === 413
        ? 'El PDF supera el límite de 10 MB.'
        : status === 503
          ? 'El servicio de IA no está disponible. Captura los precios manualmente y el PDF se guardará igual como respaldo.'
          : 'No se pudo leer el PDF automáticamente. Captura los precios manualmente y el PDF se guardará igual como respaldo.';
      notify({ type: status === 413 ? 'error' : 'warning', title: status === 413 ? 'Error al leer PDF' : 'Extracción no disponible', message: msg });
      // El servicio de IA no respondió, pero el PDF sigue siendo válido como respaldo:
      // se abre el panel de revisión vacío para captura manual, sin bloquear el flujo.
      if (status !== 413) {
        setRenglonesPdf([]);
        setShowPdfReview(true);
      } else {
        setPdfFile(null);
      }
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleAplicarCotizacion = async () => {
    if (!pdfProveedorId) return;
    const matches = emparejarRenglonesConLineas(
      comp.lineas.map(l => ({ id: l.id, insumo_descripcion: l.insumo_descripcion })),
      renglonesPdf,
    );
    let sinMatch = 0;
    const lineasActualizadas = comp.lineas.map((linea) => {
      const match = matches.get(linea.id) ?? null;
      if (!match) { sinMatch++; return linea; }
      const precio = parseFloat(match.precio_unitario);
      if (isNaN(precio)) { sinMatch++; return linea; }
      return { ...linea, precios: { ...linea.precios, [pdfProveedorId]: String(precio) } };
    });
    onUpdate({ ...comp, lineas: lineasActualizadas });

    // Persistir el PDF original como respaldo — solo ahora que Compras confirmó
    // aplicar la cotización, no en el momento de la extracción.
    if (pdfFile && !isDemo) {
      setAplicandoCotizacion(true);
      try {
        const resp = await comprasApi.subirCotizacionPdf(comp.id, pdfProveedorId, pdfFile);
        const archivo = resp.data?.data as { pdf_nombre: string; updated_at: string } | undefined;
        if (archivo) {
          setArchivosProveedor(prev => ({ ...prev, [pdfProveedorId]: { pdf_nombre: archivo.pdf_nombre, updated_at: archivo.updated_at } }));
        }
      } catch {
        notify({ type: 'warning', title: 'Precios aplicados', message: 'Los precios se aplicaron, pero no se pudo guardar el PDF como respaldo.' });
      } finally {
        setAplicandoCotizacion(false);
      }
    }

    setShowPdfReview(false);
    setPdfFile(null);
    if (sinMatch === 0) {
      notify({ type: 'success', title: 'Cotización aplicada', message: 'Precios del PDF aplicados al cuadro.' });
    } else {
      notify({
        type: 'warning',
        title: 'Cotización aplicada parcialmente',
        message: `${sinMatch} de ${comp.lineas.length} línea${comp.lineas.length === 1 ? '' : 's'} no se pudo${sinMatch === 1 ? '' : 'ieron'} relacionar automáticamente con el PDF. Captúra${sinMatch === 1 ? 'la' : 'las'} manualmente.`,
      });
    }
  };

  const handleRemoveProveedor = (provId: string) => {
    onUpdate({
      ...comp,
      proveedores: comp.proveedores.filter(p => p.id !== provId),
      lineas: comp.lineas.map(l => ({
        ...l,
        precios: Object.fromEntries(Object.entries(l.precios).filter(([k]) => k !== provId)),
        ganador: l.ganador === provId ? null : l.ganador,
      })),
    });
  };

  const handleUpdatePrecio = (lineaId: string, provId: string, value: string) => {
    onUpdate({
      ...comp,
      lineas: comp.lineas.map(l =>
        l.id === lineaId
          ? { ...l, precios: { ...l.precios, [provId]: value }, ganador: l.ganador }
          : l
      ),
    });
  };

  const handleUpdateFechaEntrega = (lineaId: string, provId: string, value: string) => {
    onUpdate({
      ...comp,
      lineas: comp.lineas.map(l =>
        l.id === lineaId
          ? { ...l, fechasEntrega: { ...l.fechasEntrega, [provId]: value || null } }
          : l
      ),
    });
  };

  const handleUpdateEspecOfrecida = (lineaId: string, provId: string, value: string) => {
    onUpdate({
      ...comp,
      lineas: comp.lineas.map(l =>
        l.id === lineaId
          ? { ...l, especOfrecida: { ...l.especOfrecida, [provId]: value } }
          : l
      ),
    });
  };

  const handleSetGanador = (lineaId: string, provId: string) => {
    if (locked) return;
    onUpdate({
      ...comp,
      lineas: comp.lineas.map(l =>
        l.id === lineaId
          ? { ...l, ganador: l.ganador === provId ? null : provId }
          : l
      ),
    });
  };

  const handleAddLinea = () => {
    if (!addLineaInsumoId || !addLineaCantidad) return;
    const insumo = insumos.find(i => i.id === addLineaInsumoId);
    if (!insumo) return;
    const newLinea: CotizacionLinea = {
      id: `lin-${Date.now()}`,
      insumo_id: insumo.id,
      insumo_clave: insumo.clave,
      insumo_descripcion: insumo.descripcion,
      insumo_unidad: insumo.unidad,
      cantidad: Number(addLineaCantidad),
      precios: {},
      fechasEntrega: {},
      especOfrecida: {},
      ganador: null,
    };
    onUpdate({ ...comp, estado: 'EN_PROCESO', lineas: [...comp.lineas, newLinea] });
    setAddLineaInsumoId('');
    setAddLineaInsumoLabel('');
    setAddLineaInsumoUnidad('');
    setAddLineaCantidad('');
    setAddLineaSearch('');
    setAddLineaOpen(false);
  };

  const handleRemoveLinea = (lineaId: string) => {
    onUpdate({ ...comp, lineas: comp.lineas.filter(l => l.id !== lineaId) });
  };

  // Enviar a evaluación técnica (Compras → Residente)
  // Primero guarda los proveedores+precios en el backend, luego cambia estado.
  const handleEnviarEvaluacion = async () => {
    if (comp.lineas.length === 0) {
      notify({ type: 'error', title: 'Sin líneas de cotización', message: 'Agrega al menos un ítem con precio antes de enviar.' });
      return;
    }
    const lineasSinPrecio = comp.lineas.filter(l =>
      Object.values(l.precios).every(p => !p || p === '0' || p === '')
    );
    if (lineasSinPrecio.length > 0) {
      notify({ type: 'error', title: 'Precios incompletos', message: `${lineasSinPrecio.length} ítem(s) sin precio de ningún proveedor.` });
      return;
    }

    setAccionando(true);
    try {
      if (isDemo) {
        onUpdate({ ...comp, estado: 'EN_EVALUACION_TECNICA' });
        notify({ type: 'success', title: 'Enviado a evaluación técnica', message: 'El Residente puede ahora evaluar las cotizaciones.' });
      } else {
        // 1. Guardar cotizaciones (proveedores + precios) en el backend
        const proveedoresPayload = comp.proveedores.map(prov => ({
          nombre: prov.nombre,
          precios: comp.lineas.map(l => ({
            ...(l.insumo_id ? { insumo_id: l.insumo_id } : { detalle_req_id: l.detalle_req_id ?? l.id }),
            precio:    Number(l.precios[prov.id] ?? 0),
            fecha_entrega_estimada: l.fechasEntrega?.[prov.id] || undefined,
            especificacion_ofrecida: l.especOfrecida?.[prov.id]?.trim() || undefined,
          })).filter(p => p.precio > 0),
        }));

        await api.put(`/api/v1/compras/comparativas/${comp.id}/cotizaciones`, {
          proveedores: proveedoresPayload,
        });

        // 2. Enviar a evaluación
        const resp = await api.patch(`/api/v1/compras/comparativas/${comp.id}/enviar-evaluacion`);
        onUpdate({ ...comp, estado: 'EN_EVALUACION_TECNICA', ...resp.data.data });
        notify({ type: 'success', title: 'Enviado a evaluación técnica', message: 'El Residente puede ahora evaluar las cotizaciones.' });
      }
    } catch (err: any) {
      notify({ type: 'error', title: 'Error al enviar', message: err.response?.data?.message ?? err.message });
    } finally {
      setAccionando(false);
    }
  };

  // Guardar la evaluación de UNA línea sin "?" (C/NC/DA únicamente) — sub-fila inline.
  // Las líneas con algún "?" no usan este guardado individual: el endpoint
  // revision-con-preguntas crea una revisión de cuadro nueva por llamada, así que los "?"
  // se acumulan y se guardan juntos vía handleGuardarEvaluacion (botón agregado). Ver
  // openspec/changes/evaluacion-tecnica-inline-tabla-comparativa.
  const handleGuardarLineaEvaluacion = async (linea: CotizacionLinea) => {
    const provEntries = Object.entries(linea.evaluacionesPorProveedor ?? {});
    const pares = provEntries.length > 0
      ? provEntries.map(([provId, ev]) => ({ detalleId: ev.id_detalle, formKey: `${linea.id}:${provId}` }))
      : [{ detalleId: linea.id, formKey: linea.id }];

    if (pares.some(({ formKey }) => evalForm[formKey]?.decision === '?')) return;

    const REQUIRES_COMMENT = new Set(['NC', 'DA']);
    for (const { formKey } of pares) {
      const form = evalForm[formKey];
      if (form && REQUIRES_COMMENT.has(form.decision) && !form.comentario.trim()) {
        notify({ type: 'error', title: 'Comentario requerido', message: `El valor "${form.decision}" requiere un comentario en "${linea.insumo_descripcion}".` });
        return;
      }
    }

    setGuardandoLineaId(linea.id);
    try {
      const evaluaciones = pares.map(({ detalleId, formKey }) => ({
        detalle_id: detalleId,
        evaluacion_tecnica: evalForm[formKey]?.decision ?? 'PENDIENTE',
        comentario_tecnico: evalForm[formKey]?.comentario || undefined,
      }));

      const mergeLinea = (l: CotizacionLinea): CotizacionLinea => {
        if (l.id !== linea.id) return l;
        const entries = Object.entries(l.evaluacionesPorProveedor ?? {});
        if (entries.length > 0) {
          const evaluacionesPorProveedor = Object.fromEntries(entries.map(([provId, ev]) => [provId, {
            ...ev,
            evaluacion_tecnica: evalForm[`${l.id}:${provId}`]?.decision ?? ev.evaluacion_tecnica,
            comentario_tecnico: evalForm[`${l.id}:${provId}`]?.comentario || ev.comentario_tecnico,
          }]));
          const primero = Object.values(evaluacionesPorProveedor)[0];
          return { ...l, evaluacionesPorProveedor, evaluacion_tecnica: primero.evaluacion_tecnica, comentario_tecnico: primero.comentario_tecnico };
        }
        return {
          ...l,
          evaluacion_tecnica: evalForm[l.id]?.decision ?? l.evaluacion_tecnica,
          comentario_tecnico: evalForm[l.id]?.comentario || l.comentario_tecnico,
        };
      };

      if (isDemo) {
        onUpdate({ ...comp, lineas: comp.lineas.map(mergeLinea) });
      } else {
        const resp = await api.patch(`/api/v1/compras/comparativas/${comp.id}/evaluar`, { evaluaciones });
        const updatedData = resp.data.data ?? {};
        onUpdate({ ...comp, ...updatedData, lineas: comp.lineas.map(mergeLinea) });
      }
      notify({ type: 'success', title: 'Evaluación guardada', message: '' });
    } catch (err: any) {
      notify({ type: 'error', title: 'Error al guardar evaluación', message: err.response?.data?.message ?? err.message });
    } finally {
      setGuardandoLineaId(null);
    }
  };

  // Guardar evaluación técnica del Residente (C/NC/DA/?) — una entrada por
  // (línea, proveedor). Ver openspec/changes/fix-evaluacion-tecnica-por-proveedor.
  const handleGuardarEvaluacion = async () => {
    // Ver openspec/changes/evaluacion-tecnica-por-especificacion: solo
    // renglones sin especificaciones capturadas usan este camino legacy —
    // los que sí tienen se evalúan por característica en la tabla.
    const lineasSinSpecs = comp.lineas.filter(l => !(especsMap[lineaDetalleKey(l)]?.length));
    const REQUIRES_COMMENT = new Set(['NC', 'DA']);
    // (línea, proveedor|null, detalle_id, formKey) — formKey es `linea.id:proveedorId`
    // cuando hay datos por proveedor, o `linea.id` en el fallback legacy.
    const pares = lineasSinSpecs.flatMap(l => {
      const provEntries = Object.entries(l.evaluacionesPorProveedor ?? {});
      if (provEntries.length > 0) {
        return provEntries.map(([provId, ev]) => ({ linea: l, detalleId: ev.id_detalle, formKey: `${l.id}:${provId}` }));
      }
      return [{ linea: l, detalleId: l.id, formKey: l.id }];
    });

    for (const { linea, formKey } of pares) {
      const form = evalForm[formKey];
      if (form && REQUIRES_COMMENT.has(form.decision) && !form.comentario.trim()) {
        notify({ type: 'error', title: 'Comentario requerido', message: `El valor "${form.decision}" requiere un comentario en "${linea.insumo_descripcion}".` });
        return;
      }
      if (form?.decision === '?' && !preguntasEval[formKey]?.trim()) {
        notify({ type: 'error', title: 'Pregunta requerida', message: `El renglón "${linea.insumo_descripcion}" tiene "?" pero no tiene pregunta.` });
        return;
      }
    }

    const tienePreguntas = pares.some(({ formKey }) => evalForm[formKey]?.decision === '?');

    setEnviandoEval(true);
    try {
      const evaluaciones = pares.map(({ detalleId, formKey }) => ({
        detalle_id: detalleId,
        evaluacion_tecnica: evalForm[formKey]?.decision ?? 'PENDIENTE',
        comentario_tecnico: evalForm[formKey]?.comentario || undefined,
        pregunta_residente: evalForm[formKey]?.decision === '?' ? (preguntasEval[formKey] ?? undefined) : undefined,
      }));

      if (isDemo) {
        const lineasActualizadas = comp.lineas.map(l => {
          const provEntries = Object.entries(l.evaluacionesPorProveedor ?? {});
          if (provEntries.length > 0) {
            const evaluacionesPorProveedor = Object.fromEntries(provEntries.map(([provId, ev]) => [provId, {
              ...ev,
              evaluacion_tecnica: evalForm[`${l.id}:${provId}`]?.decision ?? ev.evaluacion_tecnica,
              comentario_tecnico: evalForm[`${l.id}:${provId}`]?.comentario || ev.comentario_tecnico,
            }]));
            const primero = Object.values(evaluacionesPorProveedor)[0];
            return { ...l, evaluacionesPorProveedor, evaluacion_tecnica: primero.evaluacion_tecnica, comentario_tecnico: primero.comentario_tecnico };
          }
          return {
            ...l,
            evaluacion_tecnica: evalForm[l.id]?.decision ?? 'PENDIENTE' as const,
            comentario_tecnico: evalForm[l.id]?.comentario || undefined,
          };
        });
        onUpdate({ ...comp, lineas: lineasActualizadas });
        notify({ type: 'success', title: 'Evaluación guardada', message: tienePreguntas ? 'Se enviarán las preguntas a Compras.' : 'Llena el veredicto y firma para bloquear el cuadro.' });
      } else if (tienePreguntas) {
        // Flujo revisión con preguntas — crea nueva revisión
        const resp = await api.post(`/api/v1/compras/comparativas/${comp.id}/revision-con-preguntas`, { evaluaciones });
        const nuevaRevision = resp.data.data?.revision_label ?? '?';
        notify({ type: 'success', title: `Se creó la revisión ${nuevaRevision}`, message: 'Compras verá tus preguntas y podrá responderlas.' });
        onBack();
        return;
      } else {
        const resp = await api.patch(`/api/v1/compras/comparativas/${comp.id}/evaluar`, { evaluaciones });
        const updatedData = resp.data.data ?? {};
        const lineasActualizadas = comp.lineas.map(l => {
          const provEntries = Object.entries(l.evaluacionesPorProveedor ?? {});
          if (provEntries.length > 0) {
            const evaluacionesPorProveedor = Object.fromEntries(provEntries.map(([provId, ev]) => [provId, {
              ...ev,
              evaluacion_tecnica: evalForm[`${l.id}:${provId}`]?.decision ?? ev.evaluacion_tecnica,
              comentario_tecnico: evalForm[`${l.id}:${provId}`]?.comentario || ev.comentario_tecnico,
            }]));
            const primero = Object.values(evaluacionesPorProveedor)[0];
            return { ...l, evaluacionesPorProveedor, evaluacion_tecnica: primero.evaluacion_tecnica, comentario_tecnico: primero.comentario_tecnico };
          }
          return {
            ...l,
            evaluacion_tecnica: evalForm[l.id]?.decision ?? l.evaluacion_tecnica,
            comentario_tecnico: evalForm[l.id]?.comentario || l.comentario_tecnico,
          };
        });
        onUpdate({ ...comp, ...updatedData, lineas: lineasActualizadas });
        notify({ type: 'success', title: 'Evaluación guardada', message: 'Llena el veredicto y firma para bloquear el cuadro.' });
      }
    } catch (err: any) {
      notify({ type: 'error', title: 'Error al guardar evaluación', message: err.response?.data?.message ?? err.message });
    } finally {
      setEnviandoEval(false);
    }
  };

  // Guardar selección de proveedor
  const handleGuardarSeleccion = async () => {
    if (!primeraOpcion) return;
    setGuardandoSeleccion(true);
    try {
      if (!isDemo) {
        await api.put(`/api/v1/compras/comparativas/${comp.id}/seleccion`, {
          primera_opcion_proveedor_id: primeraOpcion,
          segunda_opcion_proveedor_id: segundaOpcion || undefined,
        });
      }
      onUpdate({ ...comp, primera_opcion_proveedor_id: primeraOpcion, segunda_opcion_proveedor_id: segundaOpcion || null });
      notify({ type: 'success', title: 'Selección guardada', message: '' });
    } catch (err: any) {
      notify({ type: 'error', title: 'Error al guardar selección', message: err.response?.data?.message ?? err.message });
    } finally {
      setGuardandoSeleccion(false);
    }
  };

  // Firmar cuadro (FIRMADO_BLOQUEADO)
  const handleFirmar = async () => {
    setFirmando(true);
    setFirmaError(null);
    try {
      if (!isDemo) {
        const resp = await api.post(`/api/v1/compras/comparativas/${comp.id}/firmar`, {
          veredicto_residente: veredicto.trim(),
          proveedores_sugeridos: provSugeridos,
        });
        onUpdate({ ...comp, estado: 'FIRMADO_BLOQUEADO', veredicto_residente: veredicto.trim(), proveedores_sugeridos: JSON.stringify(provSugeridos), ...resp.data.data });
      } else {
        onUpdate({ ...comp, estado: 'FIRMADO_BLOQUEADO', firmado_por: 'demo', fecha_firma: new Date().toISOString(), veredicto_residente: veredicto.trim(), proveedores_sugeridos: JSON.stringify(provSugeridos) });
      }
      setShowFirmaModal(false);
      setFirmaConfirmado(false);
      notify({ type: 'success', title: 'Cuadro firmado y bloqueado', message: 'La evaluación técnica quedó registrada permanentemente.' });
    } catch (err: any) {
      setFirmaError(err.response?.data?.message ?? err.message);
    } finally {
      setFirmando(false);
    }
  };

  // Guardar veredicto del Residente
  const handleGuardarVeredicto = async () => {
    if (!veredicto.trim() || provSugeridos.length === 0) return;
    setGuardandoVeredicto(true);
    try {
      await api.put(`/api/v1/compras/comparativas/${comp.id}/veredicto`, {
        veredicto_residente: veredicto.trim(),
        proveedores_sugeridos: provSugeridos,
      });
      onUpdate({ ...comp, veredicto_residente: veredicto.trim(), proveedores_sugeridos: JSON.stringify(provSugeridos) });
      notify({ type: 'success', title: 'Veredicto guardado', message: 'Puedes firmar cuando estés listo.' });
    } catch (err: any) {
      notify({ type: 'error', title: 'Error al guardar veredicto', message: err.response?.data?.message ?? err.message });
    } finally {
      setGuardandoVeredicto(false);
    }
  };

  // Desbloquear cuadro (admin)
  const handleDesbloquear = async () => {
    if (justificacionDesbloqueo.trim().length < 10) return;
    setDesbloqueando(true);
    try {
      const resp = await api.post(`/api/v1/compras/comparativas/${comp.id}/desbloquear`, {
        justificacion: justificacionDesbloqueo.trim(),
      });
      onUpdate({ ...comp, estado: 'EN_EVALUACION_TECNICA', ...resp.data.data });
      setShowDesbloquearModal(false);
      setJustificacionDesbloqueo('');
      notify({ type: 'success', title: 'Cuadro desbloqueado', message: 'El Residente puede re-evaluar.' });
      // Recargar auditoría
      const audit = await api.get(`/api/v1/compras/comparativas/${comp.id}/auditoria-desbloqueos`);
      setAuditDesbloqueos(audit.data?.data ?? []);
    } catch (err: any) {
      notify({ type: 'error', title: 'Error al desbloquear', message: err.response?.data?.message ?? err.message });
    } finally {
      setDesbloqueando(false);
    }
  };

  // Crear nueva revisión
  const handleNuevaRevision = async () => {
    setCreandoRevision(true);
    try {
      await api.post(`/api/v1/compras/comparativas/${comp.id}/nueva-revision`);
      setShowRevisionConfirm(false);
      notify({ type: 'success', title: 'Nueva revisión creada', message: 'El cuadro original quedó como SUPERSEDIDO.' });
      // Navigate to the new cuadro via onBack + refresh
      onBack();
    } catch (err: any) {
      notify({ type: 'error', title: 'Error al crear revisión', message: err.response?.data?.message ?? err.message });
    } finally {
      setCreandoRevision(false);
    }
  };

  // Fetch aclaraciones del cuadro
  const fetchAclaraciones = async () => {
    if (isDemo) return;
    try {
      const resp = await api.get(`/api/v1/compras/comparativas/${comp.id}/aclaraciones`);
      setAclaraciones(resp.data.data ?? []);
    } catch (_) { /* silencioso */ }
  };

  // Enviar aclaración
  const handleEnviarAclaracion = async () => {
    if (!aclaracionCelda || !aclaracionMensaje.trim()) return;
    setEnviandoAclaracion(true);
    try {
      await api.post(`/api/v1/compras/comparativas/${comp.id}/aclaraciones`, {
        insumo_id: aclaracionCelda.insumo_id,
        proveedor_id: aclaracionCelda.proveedor_id,
        tipo: aclaracionTipo,
        mensaje: aclaracionMensaje.trim(),
      });
      setAclaracionMensaje('');
      await fetchAclaraciones();
      notify({ type: 'success', title: 'Aclaración enviada', message: '' });
    } catch (err: any) {
      notify({ type: 'error', title: 'Error al enviar aclaración', message: err.response?.data?.message ?? err.message });
    } finally {
      setEnviandoAclaracion(false);
    }
  };

  // 7.3 Enviar al Gerente Técnico
  const handleEnviarGT = async () => {
    setAccionando(true);
    try {
      if (isDemo) {
        onUpdate({ ...comp, estado: 'EN_APROBACION_GT' });
        notify({ type: 'info', title: 'Enviado al Gerente Técnico', message: 'El GT puede ahora revisar y aprobar las cotizaciones.' });
      } else {
        const resp = await api.patch(`/api/v1/compras/comparativas/${comp.id}/enviar-gt`);
        onUpdate({ ...comp, estado: 'EN_APROBACION_GT', ...resp.data.data });
        notify({ type: 'info', title: 'Enviado al Gerente Técnico', message: 'El GT puede ahora revisar y aprobar las cotizaciones.' });
      }
    } catch (err: any) {
      notify({ type: 'error', title: 'Error al enviar al GT', message: err.response?.data?.message ?? err.message });
    } finally {
      setAccionando(false);
    }
  };

  // Guardar la evaluación económica GT de UNA línea sin "?" — sub-fila inline. Las líneas
  // con algún "?" no usan este guardado individual: revision-con-preguntas-gt crea una
  // revisión de cuadro nueva por llamada, así que los "?" se acumulan y se guardan juntos
  // vía handleGuardarEvaluacionGT (botón agregado). Ver
  // openspec/changes/evaluacion-economica-gt-por-proveedor.
  const handleGuardarLineaGT = async (linea: CotizacionLinea) => {
    const pares = paresGtDeLinea(linea);

    if (pares.some(({ formKey }) => gtForm[formKey]?.decision === '?')) return;

    const REQUIRES_COMMENT = new Set(['NC', 'DA']);
    for (const { formKey } of pares) {
      const form = gtForm[formKey];
      if (form && REQUIRES_COMMENT.has(form.decision) && !form.comentario.trim()) {
        notify({ type: 'error', title: 'Comentario requerido', message: `El valor "${form.decision}" requiere un comentario en "${linea.insumo_descripcion}".` });
        return;
      }
    }

    setGuardandoLineaGtId(linea.id);
    try {
      const evaluaciones = pares.map(({ detalleId, formKey }) => ({
        detalle_id: detalleId,
        aprobacion_gt: gtForm[formKey]?.decision ?? 'PENDIENTE',
        comentario_gt: gtForm[formKey]?.comentario || undefined,
      }));

      const mergeLinea = (l: CotizacionLinea): CotizacionLinea => {
        if (l.id !== linea.id) return l;
        const entries = Object.entries(l.aprobacionesGtPorProveedor ?? {});
        if (entries.length > 0) {
          const aprobacionesGtPorProveedor = Object.fromEntries(entries.map(([provId, ap]) => [provId, {
            ...ap,
            aprobacion_gt: gtForm[`${l.id}:${provId}`]?.decision ?? ap.aprobacion_gt,
            comentario_gt: gtForm[`${l.id}:${provId}`]?.comentario || ap.comentario_gt,
          }]));
          const primero = Object.values(aprobacionesGtPorProveedor)[0];
          return { ...l, aprobacionesGtPorProveedor, aprobacion_gt: primero.aprobacion_gt, comentario_gt: primero.comentario_gt };
        }
        return {
          ...l,
          aprobacion_gt: gtForm[l.id]?.decision ?? l.aprobacion_gt,
          comentario_gt: gtForm[l.id]?.comentario || l.comentario_gt,
        };
      };

      if (isDemo) {
        onUpdate({ ...comp, lineas: comp.lineas.map(mergeLinea) });
      } else {
        const resp = await api.patch(`/api/v1/compras/comparativas/${comp.id}/evaluar-gt`, { evaluaciones });
        const updatedData = resp.data.data ?? {};
        onUpdate({ ...comp, ...updatedData, lineas: comp.lineas.map(mergeLinea) });
      }
      notify({ type: 'success', title: 'Evaluación GT guardada', message: '' });
    } catch (err: any) {
      notify({ type: 'error', title: 'Error al guardar evaluación GT', message: err.response?.data?.message ?? err.message });
    } finally {
      setGuardandoLineaGtId(null);
    }
  };

  // Guardar evaluación económica GT con al menos un "?" — botón agregado, una sola
  // llamada a revision-con-preguntas-gt con todas las evaluaciones pendientes.
  const handleGuardarEvaluacionGT = async () => {
    const REQUIRES_COMMENT = new Set(['NC', 'DA']);
    const pares = comp.lineas.flatMap(l => paresGtDeLinea(l).map(p => ({ linea: l, ...p })));

    for (const { linea, formKey } of pares) {
      const form = gtForm[formKey];
      if (form && REQUIRES_COMMENT.has(form.decision) && !form.comentario.trim()) {
        notify({ type: 'error', title: 'Comentario requerido', message: `El valor "${form.decision}" requiere un comentario en "${linea.insumo_descripcion}".` });
        return;
      }
      if (form?.decision === '?' && !preguntasGT[formKey]?.trim()) {
        notify({ type: 'error', title: 'Pregunta requerida', message: `El renglón "${linea.insumo_descripcion}" tiene "?" pero no tiene pregunta.` });
        return;
      }
    }

    setEnviandoGT(true);
    try {
      const evaluaciones = pares.map(({ detalleId, formKey }) => ({
        detalle_id: detalleId,
        aprobacion_gt: gtForm[formKey]?.decision ?? 'PENDIENTE',
        comentario_gt: gtForm[formKey]?.comentario || undefined,
        pregunta_gt: gtForm[formKey]?.decision === '?' ? (preguntasGT[formKey] ?? undefined) : undefined,
      }));

      if (isDemo) {
        notify({ type: 'success', title: 'Evaluación GT guardada', message: 'Se enviarán las preguntas a Compras.' });
      } else {
        const resp = await api.post(`/api/v1/compras/comparativas/${comp.id}/revision-con-preguntas-gt`, { evaluaciones });
        const nuevaRevision = resp.data.data?.revision_label ?? '?';
        notify({ type: 'success', title: `Se creó la revisión ${nuevaRevision}`, message: 'Compras verá tus preguntas y podrá responderlas.' });
        onBack();
        return;
      }
    } catch (err: any) {
      notify({ type: 'error', title: 'Error al guardar evaluación GT', message: err.response?.data?.message ?? err.message });
    } finally {
      setEnviandoGT(false);
    }
  };

  // Finalizar la aprobación económica GT (APROBADO_GT / RECHAZADO_GT) — solo cuando todos
  // los proveedores evaluables ya están evaluados (gate `todasEvaluadasGT`).
  const handleFinalizarGT = async () => {
    setEnviandoGT(true);
    try {
      if (isDemo) {
        const hayAprobados = comp.lineas.some(l => Object.values(l.aprobacionesGtPorProveedor ?? {}).some(ap => ['C', 'DA'].includes(ap.aprobacion_gt)));
        const nuevoEstado = hayAprobados ? 'APROBADO_GT' as const : 'RECHAZADO_GT' as const;
        onUpdate({ ...comp, estado: nuevoEstado });
        notify({
          type: hayAprobados ? 'success' : 'error',
          title: hayAprobados ? 'Cuadro aprobado por GT' : 'Cuadro rechazado por GT',
          message: hayAprobados ? 'Ya puedes generar la Orden de Compra.' : 'El cuadro requiere una nueva cotización.',
        });
      } else {
        const resp = await api.patch(`/api/v1/compras/comparativas/${comp.id}/revisar-gt`, {
          comentario_gt_general: comentarioGTGeneral || undefined,
        });
        const estadoFinal = resp.data.data?.estado;
        onUpdate({ ...comp, ...resp.data.data });
        notify({
          type: estadoFinal === 'APROBADO_GT' ? 'success' : 'error',
          title: estadoFinal === 'APROBADO_GT' ? 'Cuadro aprobado por GT' : 'Cuadro rechazado por GT',
          message: estadoFinal === 'APROBADO_GT' ? 'Ya puedes generar la Orden de Compra.' : 'El cuadro requiere una nueva cotización.',
        });
      }
    } catch (err: any) {
      notify({ type: 'error', title: 'Error en revisión GT', message: err.response?.data?.message ?? err.message });
    } finally {
      setEnviandoGT(false);
    }
  };

  const ejecutarConvertirOc = async (presupuestoId: string) => {
    setAutorizando(true);
    setOcBloqueadas([]);
    try {
      await api.post(`/api/v1/compras/comparativas/${comp.id}/convertir-oc`, { presupuesto_id: presupuestoId });
      const freshResp = await api.get(`/api/v1/compras/comparativas/${comp.id}`);
      const freshData = freshResp.data.data ?? {};
      onUpdate({ ...comp, estado: 'AUTORIZADA', ordenes_compra: freshData.ordenes_compra ?? [] });
    } catch (err: any) {
      if (err.response?.status === 422 && Array.isArray(err.response?.data?.oc_bloqueadas)) {
        setOcBloqueadas(err.response.data.oc_bloqueadas);
      } else {
        notify({ type: 'error', title: 'Error al generar OC', message: err.response?.data?.message ?? err.message });
      }
    } finally {
      setAutorizando(false);
      setShowPresupuestoModal(false);
    }
  };

  const handleAutorizar = async () => {
    if (comp.estado !== 'APROBADO_GT' && !canAuthorize) return;
    if (isDemo) {
      setAutorizando(true);
      try {
        const grupos: Record<string, { nombre: string; total: number }> = {};
        comp.lineas.forEach(l => {
          if (!l.ganador) return;
          const prov = comp.proveedores.find(p => p.id === l.ganador)!;
          const precio = parseFloat(l.precios[l.ganador] || '0') || 0;
          if (!grupos[l.ganador]) grupos[l.ganador] = { nombre: prov.nombre, total: 0 };
          grupos[l.ganador].total += precio * l.cantidad;
        });
        const ocs: OrdenCompraEnComparativa[] = Object.entries(grupos).map(([, v], i) => ({
          id_orden: `demo-oc-${i}`,
          codigo: `OC-2024-0${50 + i}`,
          estado: 'EMITIDA',
          proveedor_nombre: v.nombre,
          proveedor_id: '',
          total: v.total,
          items: [],
        }));
        onUpdate({ ...comp, estado: 'AUTORIZADA', ordenes_compra: ocs });
      } finally {
        setAutorizando(false);
      }
      return;
    }
    try {
      const presResp = await api.get('/api/v1/finanzas/presupuestos');
      const pres: PresupuestoActivo[] = presResp.data?.data ?? [];
      if (pres.length === 0) {
        notify({ type: 'error', title: 'Sin presupuesto activo', message: 'Contacta al módulo de Finanzas para asignar un presupuesto al proyecto.' });
        return;
      }
      if (pres.length > 1) {
        setPresupuestos(pres);
        setSelectedPresupuestoId(pres[0].id_presupuesto);
        setShowPresupuestoModal(true);
        return;
      }
      await ejecutarConvertirOc(pres[0].id_presupuesto);
    } catch (err: any) {
      notify({ type: 'error', title: 'Error al generar OC', message: err.response?.data?.message ?? err.message });
    }
  };

  const estadoInfo = ESTADO_STYLE[comp.estado] ?? ESTADO_STYLE.BORRADOR;
  const ocList = comp.ordenes_compra;

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Breadcrumb + Badge de estado + Revision badge */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={onBack}
          variant="ghost"
          className="h-auto gap-2 p-0 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-transparent"
        >
          <IconArrowLeft className="h-4 w-4" />
          Requisiciones
        </Button>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-foreground">
          {requisicionFolio}
        </span>
        {comp.revision && (
          <SectionBadge className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 text-[9px] text-indigo-700">
            Rev {comp.revision}
          </SectionBadge>
        )}
        <SectionBadge className={cn('rounded-lg px-2.5 py-1 text-[9px]', estadoInfo.badge)}>
          {estadoInfo.label}
        </SectionBadge>
        {isLocked && comp.fecha_firma && (
          <span className="text-[9px] text-red-600/70">
            Firmado el {new Date(comp.fecha_firma).toLocaleDateString('es-MX')}
          </span>
        )}
      </div>

      {/* Stepper visual — 5 pasos del ciclo de cotización */}
      {(() => {
        const STEPS = [
          { n: 1, label: 'Especif.' },
          { n: 2, label: 'Cotizando' },
          { n: 3, label: 'Evaluación' },
          { n: 4, label: 'Aprob. GT' },
          { n: 5, label: 'OC Emitida' },
        ] as const;
        const currentStep =
          comp.estado === 'BORRADOR'               ? 2 :
          comp.estado === 'EN_EVALUACION_TECNICA'  ? 3 :
          comp.estado === 'EVALUADO_TECNICAMENTE'  ? 3 :
          comp.estado === 'FIRMADO_BLOQUEADO'      ? 3 :
          comp.estado === 'REVISION_SOLICITADA'    ? 3 :
          comp.estado === 'EN_APROBACION_GT'       ? 4 :
          ['APROBADO_GT', 'AUTORIZADA', 'CERRADO'].includes(comp.estado) ? 5 : 2;
        return (
          <div className="flex flex-wrap items-center gap-1">
            {STEPS.map((s, i) => {
              const done   = s.n < currentStep;
              const active = s.n === currentStep;
              return (
                <React.Fragment key={s.n}>
                  {i > 0 && (
                    <span className={cn('h-px w-5 shrink-0', done ? 'bg-emerald-400' : 'bg-border/50')} />
                  )}
                  <span className={cn(
                    'rounded-lg px-2 py-0.5 text-[9px] font-black',
                    done   ? 'bg-emerald-500/10 text-emerald-700' :
                    active ? 'bg-sky-500/10 text-sky-700 ring-1 ring-sky-500/30' :
                             'text-muted-foreground/40'
                  )}>
                    {done ? '✓' : s.n}. {s.label}
                  </span>
                </React.Fragment>
              );
            })}
          </div>
        );
      })()}

      {/* Barra de acciones según rol y estado */}
      {(showEnviarEvalBtn || (showEvalTecnicaBtn && algunaEnDuda) || showEnviarGTBtn || showRevisarGTBtn || showGenerarOCBtn || showFirmaBtn || showNuevaRevisionBtn) && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/40 bg-muted/30 px-4 py-3">
          <span className="mr-auto text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Siguiente acción requerida
          </span>

          {showEnviarEvalBtn && (
            <Button onClick={handleEnviarEvaluacion} disabled={accionando || comp.lineas.length === 0} className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-black text-white hover:bg-amber-400">
              {accionando ? 'Enviando...' : 'Enviar a Evaluación Técnica →'}
            </Button>
          )}

          {/* Guarda TODAS las evaluaciones pendientes (incluyendo los "?") en una sola
              llamada — visible mientras exista al menos un "?" en cualquier renglón sin
              especificaciones, porque revision-con-preguntas crea una revisión nueva por
              llamada y no puede dispararse línea por línea. Ver
              openspec/changes/evaluacion-tecnica-inline-tabla-comparativa. */}
          {showEvalTecnicaBtn && algunaEnDuda && (
            <Button
              data-testid="eval-guardar-agregado"
              onClick={handleGuardarEvaluacion}
              disabled={enviandoEval || faltaPreguntaEval}
              className="rounded-xl !bg-emerald-600 px-4 py-2 text-xs font-black !text-white hover:!bg-emerald-700 disabled:opacity-40"
            >
              {enviandoEval ? 'Guardando...' : 'Guardar y Crear Revisión'}
            </Button>
          )}

          {/* Firma disponible cuando todas las evaluaciones están C/NC/DA y hay primera opción */}
          {showFirmaBtn && (
            <Button onClick={() => { setFirmaConfirmado(false); setFirmaError(null); setShowFirmaModal(true); }} className="rounded-xl bg-red-600 px-4 py-2 text-xs font-black text-white hover:bg-red-500">
              🔒 Firmar y Bloquear →
            </Button>
          )}

          {showEnviarGTBtn && (
            <Button onClick={handleEnviarGT} disabled={accionando} className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-black text-white hover:bg-violet-500">
              {accionando ? 'Enviando...' : 'Enviar al Gerente Técnico →'}
            </Button>
          )}

          {/* Guarda TODAS las evaluaciones GT pendientes (incluyendo los "?") en una sola
              llamada — visible mientras exista al menos un "?" en cualquier renglón,
              porque revision-con-preguntas-gt crea una revisión nueva por llamada y no
              puede dispararse línea por línea. Ver
              openspec/changes/evaluacion-economica-gt-por-proveedor. */}
          {showRevisarGTBtn && algunaEnDudaGT && (
            <Button
              data-testid="gt-guardar-agregado"
              onClick={handleGuardarEvaluacionGT}
              disabled={enviandoGT || faltaPreguntaGT}
              className="rounded-xl !bg-emerald-600 px-4 py-2 text-xs font-black !text-white hover:!bg-emerald-700 disabled:opacity-40"
            >
              {enviandoGT ? 'Guardando...' : 'Guardar y Crear Revisión'}
            </Button>
          )}

          {showRevisarGTBtn && !algunaEnDudaGT && (
            <>
              <input
                type="text"
                data-testid="gt-comentario-general"
                placeholder="Comentario general GT (opcional)..."
                value={comentarioGTGeneral}
                onChange={e => setComentarioGTGeneral(e.target.value)}
                className="w-56 rounded-xl border border-border/40 bg-background px-3 py-2 text-xs focus:outline-none focus:border-violet-500"
              />
              <Button
                data-testid="gt-finalizar"
                onClick={handleFinalizarGT}
                disabled={enviandoGT || !todasEvaluadasGT}
                title={!todasEvaluadasGT ? 'Faltan proveedores por evaluar' : undefined}
                className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-black text-white hover:bg-violet-500 disabled:opacity-40"
              >
                {enviandoGT ? 'Finalizando...' : 'Finalizar Aprobación GT →'}
              </Button>
            </>
          )}

          {showGenerarOCBtn && (
            <Button onClick={handleAutorizar} disabled={autorizando} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-black text-white hover:bg-blue-500">
              {autorizando ? 'Generando OC...' : 'Generar Orden de Compra →'}
            </Button>
          )}

          {showNuevaRevisionBtn && (
            <Button onClick={() => setShowRevisionConfirm(true)} variant="outline" className="rounded-xl border-orange-500/30 px-4 py-2 text-xs font-black text-orange-600 hover:bg-orange-500/10">
              Crear nueva revisión
            </Button>
          )}
        </div>
      )}

      {comp.estado === 'RECHAZADO_GT' && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3">
          <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />
          <div>
            <p className="text-xs font-black text-red-700">Cuadro rechazado por Gerencia Técnica</p>
            <p className="mt-0.5 text-[11px] text-red-600/80">No es posible generar una OC a partir de este cuadro.</p>
          </div>
        </div>
      )}

      {isFirmadoBloqueado && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-700/20 bg-red-700/5 px-4 py-3">
          <span className="text-lg">🔒</span>
          <div className="flex-1">
            <p className="text-xs font-black text-red-800">Cuadro Firmado y Bloqueado — evaluación técnica definitiva</p>
            <p className="mt-0.5 text-[11px] text-red-700/80">
              Firmado el {comp.fecha_firma ? new Date(comp.fecha_firma).toLocaleString('es-MX') : '—'}.
            </p>
            {comp.veredicto_residente && (
              <p className="mt-1 text-[11px] text-foreground/80 italic">Veredicto: {comp.veredicto_residente}</p>
            )}
          </div>
          {showDesbloquearBtn && (
            <button
              onClick={() => { setShowDesbloquearModal(true); setJustificacionDesbloqueo(''); }}
              className="shrink-0 rounded-xl border border-red-700/30 bg-red-700/10 px-3 py-1.5 text-[10px] font-black text-red-800 hover:bg-red-700/20 transition-colors"
            >
              Desbloquear
            </button>
          )}
        </div>
      )}

      {isLocked && !isFirmadoBloqueado && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3">
          <span className="text-lg">🔒</span>
          <div>
            <p className="text-xs font-black text-red-700">Cuadro LOCKED — evaluación técnica firmada</p>
            <p className="mt-0.5 text-[11px] text-red-600/80">
              Firmado el {comp.fecha_firma ? new Date(comp.fecha_firma).toLocaleString('es-MX') : '—'}. Los datos técnicos son inmutables.
            </p>
          </div>
        </div>
      )}

      {isRevisionSolicitada && (
        <div className="flex items-start gap-3 rounded-2xl border border-orange-500/20 bg-orange-500/5 px-4 py-3">
          <span className="text-lg">📋</span>
          <div>
            <p className="text-xs font-black text-orange-700">Revisión solicitada — el Residente tiene dudas</p>
            <p className="mt-0.5 text-[11px] text-orange-600/80">
              El Residente marcó renglones con "?" en la revisión anterior. Compras debe responder las preguntas en la nueva revisión.
            </p>
          </div>
        </div>
      )}

      {isSupersedido && (
        <div className="flex items-start gap-3 rounded-2xl border border-slate-400/30 bg-slate-400/10 px-4 py-3">
          <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-slate-400" />
          <div>
            <p className="text-xs font-black text-slate-600">Cuadro supersedido — existe una revisión posterior activa</p>
            <p className="mt-0.5 text-[11px] text-slate-500">Este cuadro fue reemplazado por una nueva revisión y es de solo lectura.</p>
          </div>
        </div>
      )}

      {/* Sección: Partidas de la Requisición — referencia para Compras */}
      {(comp.estado === 'BORRADOR' || comp.estado === 'EN_PROCESO') && comp.lineas.length > 0 && (
        <Card className="border-border/40">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-tight">
              <IconPackage className="h-4 w-4 text-sky-500" />
              Partidas de la Requisición
              <span className="text-[10px] font-medium normal-case text-muted-foreground">
                {comp.lineas.length} ítem{comp.lineas.length !== 1 ? 's' : ''} a cotizar
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <TableScrollShadow className="rounded-xl border border-border/30">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-border/30 bg-muted/30">
                    <th className="px-3 py-2 text-left font-black uppercase tracking-widest text-muted-foreground">#</th>
                    <th className="px-3 py-2 text-left font-black uppercase tracking-widest text-muted-foreground">Clave</th>
                    <th className="px-3 py-2 text-left font-black uppercase tracking-widest text-muted-foreground">Descripción</th>
                    <th className="px-3 py-2 text-center font-black uppercase tracking-widest text-muted-foreground">Cantidad</th>
                    <th className="px-3 py-2 text-center font-black uppercase tracking-widest text-muted-foreground">Unidad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {comp.lineas.map((l, idx) => (
                    <tr key={l.id} className="hover:bg-muted/20">
                      <td className="px-3 py-2 text-muted-foreground">{idx + 1}</td>
                      <td className="px-3 py-2 font-mono text-[10px] text-muted-foreground">{l.insumo_clave || '—'}</td>
                      <td className="px-3 py-2 font-medium text-foreground">{l.insumo_descripcion}</td>
                      <td className="px-3 py-2 text-center">{l.cantidad}</td>
                      <td className="px-3 py-2 text-center text-muted-foreground">{l.insumo_unidad || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableScrollShadow>
          </CardContent>
        </Card>
      )}

      {/* Sección: Proveedores */}
      <Card className="border-border/40">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-tight">
              <IconScale className="h-4 w-4 text-amber-500" />
              Proveedores en comparativa
              <span className="text-[10px] font-medium normal-case text-muted-foreground">
                ({comp.proveedores.length} / 3)
              </span>
            </CardTitle>
            {comp.proveedores.length < 3 && !locked && (
              <Button
                onClick={() => setShowAddProv(!showAddProv)}
                variant="outline"
                className="h-auto rounded-xl border-emerald-500/30 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-500/5"
              >
                <IconPlus className="h-3 w-3" /> Agregar proveedor
              </Button>
            )}
          </div>
          {showAddProv && (
            <div className="relative mt-3" ref={provSearchRef}>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <IconSearch className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="h-9 rounded-xl pl-8 text-xs"
                    placeholder="Buscar proveedor por nombre o RFC..."
                    value={provSearch}
                    onChange={e => { setProvSearch(e.target.value); setProvDropdownOpen(true); }}
                    onFocus={() => setProvDropdownOpen(true)}
                    onKeyDown={e => { if (e.key === 'Escape') { setShowAddProv(false); setProvSearch(''); } }}
                    autoFocus
                  />
                </div>
                <Button onClick={() => { setShowAddProv(false); setProvSearch(''); }} variant="ghost" className="h-9 w-9 rounded-xl p-0"><IconX className="h-4 w-4" /></Button>
              </div>
              {provDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-border bg-background shadow-lg">
                  {proveedoresCatalogo.length === 0 ? (
                    <p className="px-3 py-2 text-[11px] text-muted-foreground">Sin proveedores en catálogo</p>
                  ) : (
                    <ul className="max-h-52 overflow-y-auto py-1">
                      {proveedoresCatalogo
                        .filter(p => {
                          const q = provSearch.toLowerCase();
                          return !q || p.razon_social.toLowerCase().includes(q) || (p.rfc ?? '').toLowerCase().includes(q);
                        })
                        .filter(p => !comp.proveedores.some(cp => cp.id === p.id))
                        .map(p => (
                          <li
                            key={p.id}
                            className="flex cursor-pointer items-center gap-2 px-3 py-2 text-xs hover:bg-emerald-500/10"
                            onMouseDown={() => handleAddProveedorFromCatalog(p)}
                          >
                            <span className="font-medium text-foreground">{p.razon_social}</span>
                            {p.rfc && <span className="text-[10px] text-muted-foreground">{p.rfc}</span>}
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          {comp.proveedores.length === 0 ? (
            <p className="text-[11px] text-muted-foreground">Sin proveedores — agrega al menos uno para comenzar la comparativa.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {comp.proveedores.map((prov, i) => {
                const c = PROV_COLORS[i] || PROV_COLORS[0];
                return (
                  <div key={prov.id} className={cn('flex items-center gap-2 rounded-xl border px-3 py-2', c.chip)}>
                    <span className="text-[11px] font-black">{String.fromCharCode(65 + i)}</span>
                    <span className="text-xs font-semibold">{prov.nombre}</span>
                    {prov.estado_respuesta && ESTADO_RESPUESTA_STYLE[prov.estado_respuesta] && (
                      <span className={cn('rounded-md border px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest', ESTADO_RESPUESTA_STYLE[prov.estado_respuesta].badge)}>
                        {ESTADO_RESPUESTA_STYLE[prov.estado_respuesta].label}
                      </span>
                    )}
                    {archivosProveedor[prov.id] && (
                      <span
                        title={`Cotización en respaldo: ${archivosProveedor[prov.id].pdf_nombre}`}
                        className="flex items-center gap-0.5 text-[9px] font-black uppercase tracking-widest text-emerald-600"
                      >
                        <IconFileText className="h-3 w-3" />
                      </span>
                    )}
                    {!locked && !isDemo && (
                      <button
                        onClick={() => handleSubirCotizacionClick(prov.id)}
                        disabled={uploadingPdf}
                        title={archivosProveedor[prov.id] ? 'Re-subir cotización PDF' : 'Subir cotización PDF'}
                        className="ml-1 flex items-center gap-1 rounded-md border border-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-emerald-700 hover:bg-emerald-500/20 transition-colors disabled:opacity-30"
                      >
                        {uploadingPdf && pdfProveedorId === prov.id ? (
                          <span className="h-2.5 w-2.5 animate-spin rounded-full border border-current border-t-transparent" />
                        ) : (
                          <span>PDF</span>
                        )}
                      </button>
                    )}
                    {!locked && (
                      <button onClick={() => handleRemoveProveedor(prov.id)} className="ml-1 text-current opacity-50 hover:opacity-100 transition-opacity">
                        <IconX className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabla de Cotizaciones */}
      {comp.proveedores.length > 0 && (
        <Card className="overflow-hidden rounded-3xl border-border/40 shadow-xl">
          <div className="border-b border-border/30 px-6 py-4">
            <h3 className="text-sm font-black uppercase tracking-tight text-foreground">Tabla de Cotizaciones</h3>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              {locked
                ? 'Vista de solo lectura — cuadro en proceso de aprobación'
                : 'Ingresa los precios por material · Selecciona el ganador por renglón (A, B o C)'}
            </p>
          </div>

          <TableScrollShadow>
            <table className="w-full" style={{ minWidth: `${420 + comp.proveedores.length * 140}px` }}>
              <thead>
                <tr className="border-b border-border/30 bg-muted/30">
                  <th className="px-5 py-3 text-left text-[9px] font-black uppercase tracking-widest text-muted-foreground w-[220px]">Material</th>
                  <th className="px-3 py-3 text-center text-[9px] font-black uppercase tracking-widest text-muted-foreground w-16">Cant.</th>
                  <th className="px-3 py-3 text-center text-[9px] font-black uppercase tracking-widest text-muted-foreground w-12">UM</th>
                  {!isResidenteMode && comp.proveedores.map((prov, i) => {
                    const c = PROV_COLORS[i] || PROV_COLORS[0];
                    return (
                      <th key={prov.id} className="px-3 py-3 text-right text-[9px] font-black uppercase tracking-widest w-36" style={{ color: c.col }}>
                        {String.fromCharCode(65 + i)} · {prov.nombre.split(' ').slice(0, 2).join(' ')}
                        <div className="text-[8px] font-medium normal-case tracking-normal text-muted-foreground mt-0.5">Precio · Fecha entrega</div>
                      </th>
                    );
                  })}
                  {isResidenteMode && comp.proveedores.map((prov, i) => {
                    const c = PROV_COLORS[i] || PROV_COLORS[0];
                    return (
                      <th key={prov.id} className="px-3 py-3 text-left text-[9px] font-black uppercase tracking-widest w-36" style={{ color: c.col }}>
                        {String.fromCharCode(65 + i)} · {prov.nombre.split(' ').slice(0, 2).join(' ')}
                      </th>
                    );
                  })}
                  {!isResidenteMode && <th className="px-3 py-3 text-center text-[9px] font-black uppercase tracking-widest text-amber-600 w-28">Ganador</th>}
                  {/* Columna de evaluación técnica visible cuando hay datos */}
                  {comp.lineas.some(l => l.evaluacion_tecnica && l.evaluacion_tecnica !== 'PENDIENTE') && (
                    <th className="px-3 py-3 text-center text-[9px] font-black uppercase tracking-widest text-amber-600 w-28">Eval. Técnica</th>
                  )}
                  {!locked && <th className="px-2 py-3 w-8" />}
                </tr>
              </thead>
              <tbody>
                {comp.lineas.map(linea => {
                  const dt = detallesTecnicos[lineaDetalleKey(linea)] ?? { marca: '', espec: '' };
                  const fichas = linea.insumo_id ? fichasInsumo[linea.insumo_id] : undefined;
                  const nFichas = fichas?.length ?? null;
                  const canUpload = isProcurement;
                  return (
                  <React.Fragment key={linea.id}>
                  <tr className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3">
                      <div className="text-[10px] font-black text-emerald-700">{linea.insumo_clave}</div>
                      <div className="text-xs text-foreground max-w-[200px] truncate">{linea.insumo_descripcion}</div>
                      {/* Specs de la req (modo residente) */}
                      {isResidenteMode && (linea.especificacion_marca_modelo || linea.especificacion_detalle) && (
                        <div className="mt-1.5 rounded border border-indigo-500/20 bg-indigo-500/5 px-2 py-1.5 space-y-0.5">
                          {linea.especificacion_marca_modelo && (
                            <div className="text-[9px] font-black text-indigo-700">Marca/Modelo: {linea.especificacion_marca_modelo}</div>
                          )}
                          {linea.especificacion_detalle && (
                            <div className="text-[9px] text-muted-foreground leading-tight">{linea.especificacion_detalle}</div>
                          )}
                        </div>
                      )}
                      {/* Detalles técnicos — editable en BORRADOR, solo lectura después */}
                      {!locked ? (
                        <div className="mt-1.5 space-y-1">
                          <input
                            type="text"
                            placeholder="Marca / Modelo ref."
                            maxLength={100}
                            value={dt.marca}
                            onChange={e => setDetallesTecnicos(prev => ({ ...prev, [lineaDetalleKey(linea)]: { ...dt, marca: e.target.value } }))}
                            onBlur={() => handleDetalleBlur(lineaDetalleKey(linea))}
                            className="w-full rounded border border-border/40 bg-background px-1.5 py-0.5 text-[10px] placeholder:text-muted-foreground/50 focus:outline-none focus:border-indigo-400"
                          />
                          <textarea
                            placeholder="Especificaciones requeridas"
                            rows={2}
                            value={dt.espec}
                            onChange={e => setDetallesTecnicos(prev => ({ ...prev, [lineaDetalleKey(linea)]: { ...dt, espec: e.target.value } }))}
                            onBlur={() => handleDetalleBlur(lineaDetalleKey(linea))}
                            className="w-full resize-none rounded border border-border/40 bg-background px-1.5 py-0.5 text-[10px] placeholder:text-muted-foreground/50 focus:outline-none focus:border-indigo-400"
                          />
                        </div>
                      ) : (
                        <>
                          {dt.marca && <div className="mt-1 text-[9px] text-indigo-600 font-bold">{dt.marca}</div>}
                          {dt.espec && <div className="mt-0.5 text-[9px] text-muted-foreground leading-tight">{dt.espec}</div>}
                        </>
                      )}
                      {/* Pregunta del Residente (modo compras, revisión) */}
                      {!isResidenteMode && comp.revision_padre_id && linea.pregunta_residente && (
                        <div className="mt-2 rounded border border-amber-500/30 bg-amber-500/5 px-2 py-1.5 space-y-1">
                          <p className="text-[9px] font-black text-amber-700">Residente pregunta:</p>
                          <p className="text-[10px] text-foreground leading-tight">{linea.pregunta_residente}</p>
                          {linea.respuesta_compras ? (
                            <p className="text-[9px] text-green-700">✓ Respondido</p>
                          ) : (
                            <div className="mt-1 space-y-1">
                              <textarea
                                className="w-full resize-none rounded border border-border/40 bg-background px-1.5 py-0.5 text-[10px] focus:outline-none focus:border-amber-500 min-h-[48px]"
                                placeholder="Escribe tu respuesta..."
                                id={`resp-${linea.id}`}
                              />
                            </div>
                          )}
                        </div>
                      )}
                      {/* Pregunta + respuesta (modo residente, revisión siguiente) */}
                      {isResidenteMode && linea.pregunta_residente && (
                        <div className="mt-2 space-y-1">
                          <div className="rounded border border-indigo-500/30 bg-indigo-500/5 px-2 py-1">
                            <p className="text-[9px] font-black text-indigo-700">Tu pregunta:</p>
                            <p className="text-[10px] text-foreground">{linea.pregunta_residente}</p>
                          </div>
                          {linea.respuesta_compras && (
                            <div className="rounded border border-green-500/30 bg-green-500/5 px-2 py-1">
                              <p className="text-[9px] font-black text-green-700">Respuesta de Compras:</p>
                              <p className="text-[10px] text-foreground">{linea.respuesta_compras}</p>
                            </div>
                          )}
                        </div>
                      )}
                      {/* Badge / botón de fichas técnicas — solo aplica a ítems de catálogo */}
                      {!isResidenteMode && linea.insumo_id && (
                        <button
                          onClick={() => { setSideSheetFichasInsumoId(linea.insumo_id!); fetchFichas(linea.insumo_id!); }}
                          className={cn('mt-1.5 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-bold transition-colors',
                            nFichas && nFichas > 0
                              ? 'bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20'
                              : 'text-muted-foreground/50 hover:text-indigo-500'
                          )}
                        >
                          📎 {nFichas != null ? `${nFichas} ficha${nFichas !== 1 ? 's' : ''}` : canUpload ? '+ Subir ficha' : 'Sin fichas'}
                        </button>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center"><span className="text-sm font-bold">{linea.cantidad}</span></td>
                    <td className="px-3 py-3 text-center"><span className="text-[10px] text-muted-foreground">{linea.insumo_unidad}</span></td>
                    {!isResidenteMode && comp.proveedores.map((prov) => {
                      const precio = parseFloat(linea.precios[prov.id] || '0') || 0;
                      const subtotal = precio * linea.cantidad;
                      return (
                        <td key={prov.id} className="px-2 py-2 text-right">
                          <input
                            type="number" min="0" step="0.01"
                            className={cn('w-28 rounded-lg border bg-background px-2 py-1.5 text-right text-xs font-bold transition-colors focus:outline-none', locked ? 'border-transparent bg-transparent cursor-default' : 'border-border/40 focus:border-emerald-500')}
                            placeholder="—"
                            value={linea.precios[prov.id] || ''}
                            onChange={e => !locked && handleUpdatePrecio(linea.id, prov.id, e.target.value)}
                            readOnly={locked}
                          />
                          {precio > 0 && (
                            <div className="mt-0.5 text-[9px] text-muted-foreground text-right">
                              = {subtotal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })}
                            </div>
                          )}
                          {modo === 'compras' && (
                            <input
                              type="date"
                              data-testid={`fecha-entrega-${prov.id}-${linea.id}`}
                              className={cn('mt-0.5 w-28 rounded-lg border bg-background px-1.5 py-1 text-right text-[9px] font-medium text-sky-700 transition-colors focus:outline-none', locked ? 'border-transparent bg-transparent cursor-default' : 'border-border/40 focus:border-sky-500')}
                              value={linea.fechasEntrega?.[prov.id] || ''}
                              onChange={e => !locked && handleUpdateFechaEntrega(linea.id, prov.id, e.target.value)}
                              disabled={locked}
                            />
                          )}
                          {modo === 'compras' && (
                            <input
                              type="text"
                              data-testid={`espec-ofrecida-${prov.id}-${linea.id}`}
                              placeholder="Especificación ofrecida…"
                              className={cn('mt-0.5 w-28 rounded-lg border bg-background px-1.5 py-1 text-right text-[9px] font-medium text-muted-foreground transition-colors focus:outline-none', locked ? 'border-transparent bg-transparent cursor-default' : 'border-border/40 focus:border-indigo-500')}
                              value={linea.especOfrecida?.[prov.id] || ''}
                              onChange={e => !locked && handleUpdateEspecOfrecida(linea.id, prov.id, e.target.value)}
                              readOnly={locked}
                            />
                          )}
                        </td>
                      );
                    })}
                    {isResidenteMode && comp.proveedores.map((prov) => {
                      const especOfrecida = linea.especOfrecida?.[prov.id];
                      return (
                        <td key={prov.id} className="px-2 py-2 text-left align-top">
                          {especOfrecida ? (
                            <span className="rounded bg-sky-500/10 px-1.5 py-0.5 text-[9px] text-sky-700">{especOfrecida}</span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground/40">—</span>
                          )}
                        </td>
                      );
                    })}
                    {!isResidenteMode && (
                      <td className="px-3 py-3">
                        <div className="flex justify-center gap-1">
                          {comp.proveedores.map((prov, i) => {
                            const c = PROV_COLORS[i] || PROV_COLORS[0];
                            const isWinner = linea.ganador === prov.id;
                            const hasPrecio = !!(linea.precios[prov.id] && parseFloat(linea.precios[prov.id]) > 0);
                            return (
                              <button
                                key={prov.id}
                                onClick={() => hasPrecio && handleSetGanador(linea.id, prov.id)}
                                disabled={!hasPrecio || locked}
                                title={isWinner ? `Ganador: ${prov.nombre}` : hasPrecio ? `Seleccionar ${prov.nombre}` : 'Sin precio'}
                                className={cn('h-7 w-7 rounded-lg text-[10px] font-black transition-all shadow-sm', isWinner ? c.win : hasPrecio && !locked ? c.btn : 'cursor-not-allowed opacity-25 bg-muted')}
                              >
                                {String.fromCharCode(65 + i)}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    )}
                    {/* Columna evaluación técnica — ver
                        openspec/changes/fix-evaluacion-tecnica-por-proveedor: renglones
                        sin specs muestran fracción evaluada por proveedor, no un solo
                        badge que puede ocultar evaluaciones faltantes o divergentes. */}
                    {comp.lineas.some(l => l.evaluacion_tecnica && l.evaluacion_tecnica !== 'PENDIENTE') && (
                      <td className="px-3 py-3 text-center">
                        {(() => {
                          const tieneSpecs = !!(especsMap[lineaDetalleKey(linea)]?.length);
                          const provEvals = tieneSpecs ? [] : Object.values(linea.evaluacionesPorProveedor ?? {});
                          const aclaracionesBtn = (linea.aclaraciones_count ?? 0) > 0 && linea.insumo_id ? (
                            <button
                              onClick={() => { setAclaracionCelda({ insumo_id: linea.insumo_id!, proveedor_id: linea.ganador ?? comp.proveedores[0]?.id ?? '' }); fetchAclaraciones(); }}
                              className="rounded-full bg-indigo-500/10 px-1.5 py-0.5 text-[8px] font-black text-indigo-600 hover:bg-indigo-500/20"
                              title="Ver aclaraciones"
                            >
                              ? {linea.aclaraciones_count}
                            </button>
                          ) : null;

                          if (provEvals.length === 0) {
                            return linea.evaluacion_tecnica && linea.evaluacion_tecnica !== 'PENDIENTE' ? (
                              <div className="flex flex-col items-center gap-1">
                                <span className={cn('rounded-lg border px-2 py-1 text-[9px] font-black', EVAL_STYLE[linea.evaluacion_tecnica] ?? EVAL_STYLE.PENDIENTE)}>
                                  {linea.evaluacion_tecnica}
                                </span>
                                {aclaracionesBtn}
                              </div>
                            ) : <span className="text-[10px] text-muted-foreground/50">—</span>;
                          }

                          const decisiones = provEvals.map(e => e.evaluacion_tecnica).filter((v): v is 'C' | 'NC' | 'DA' | '?' => !!v && v !== 'PENDIENTE');
                          if (decisiones.length < provEvals.length) {
                            return <span className="rounded-lg border border-border/40 bg-muted px-2 py-1 text-[9px] font-black text-muted-foreground">{decisiones.length}/{provEvals.length} evaluados</span>;
                          }
                          const unicas = Array.from(new Set(decisiones));
                          if (unicas.length === 1) {
                            return (
                              <div className="flex flex-col items-center gap-1">
                                <span className={cn('rounded-lg border px-2 py-1 text-[9px] font-black', EVAL_STYLE[unicas[0]] ?? EVAL_STYLE.PENDIENTE)}>{unicas[0]}</span>
                                {aclaracionesBtn}
                              </div>
                            );
                          }
                          const conteos = decisiones.reduce<Record<string, number>>((acc, d) => { acc[d] = (acc[d] ?? 0) + 1; return acc; }, {});
                          const resumen = Object.entries(conteos).map(([k, n]) => `${n} ${k}`).join(' · ');
                          return <span className="text-[9px] font-black text-muted-foreground" title={resumen}>{resumen}</span>;
                        })()}
                      </td>
                    )}
                    {!locked && (
                      <td className="px-2 py-3">
                        <button onClick={() => handleRemoveLinea(linea.id)} className="rounded-lg p-1 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors">
                          <IconX className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                  {/* ── Sub-filas de especificaciones (10.2-10.3) ─────────── */}
                  {(especsMap[lineaDetalleKey(linea)] ?? []).map(esp => {
                    return (
                      <tr key={esp.id_especificacion} className="border-b border-indigo-500/5 bg-indigo-500/[0.02]">
                        <td className="pl-10 pr-2 py-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-indigo-400 text-[8px]">◆</span>
                            <span className="text-[10px] text-muted-foreground leading-tight">{esp.descripcion}</span>
                          </div>
                        </td>
                        <td className="px-3 py-1" />
                        <td className="px-3 py-1" />
                        {comp.proveedores.map(prov => {
                          const nota = anotacionesSpec.find(a => a.especificacion_id === esp.id_especificacion && a.proveedor_id === prov.id);
                          const evalSpec = evaluacionesEspec.find(e => e.especificacion_id === esp.id_especificacion && e.proveedor_id === prov.id);
                          const decisionActual = evalSpec?.evaluacion_tecnica ?? 'PENDIENTE';
                          const cellKey = `${esp.id_especificacion}:${prov.id}`;
                          const editable = isResidenteMode && comp.estado === 'EN_EVALUACION_TECNICA';
                          const puedeResponder = !isResidenteMode && !!comp.revision_padre_id && comp.estado === 'BORRADOR'
                            && evalSpec?.evaluacion_tecnica === '?' && !!evalSpec.pregunta_residente && !evalSpec.respuesta_compras;

                          return (
                            <td key={prov.id} className="px-2 py-1.5 text-center align-top">
                              {editable ? (
                                <div className="space-y-1">
                                  <div className="flex justify-center gap-0.5">
                                    {(['C', 'NC', 'DA', '?'] as const).map(k => (
                                      <button
                                        key={k}
                                        type="button"
                                        disabled={guardandoEvalSpec === cellKey}
                                        onClick={() => {
                                          if (k === '?') { setDudaSpecAbierta(cellKey); setDudaSpecTexto(evalSpec?.pregunta_residente ?? ''); }
                                          else void handleEvaluarEspec(esp.id_especificacion, prov.id, k);
                                        }}
                                        className={cn('w-7 rounded px-1 py-0.5 text-[8px] font-black transition-all',
                                          decisionActual === k ? EVAL_BTN_ACTIVE[k] : 'border border-border/30 bg-muted/40 text-muted-foreground/50 hover:border-foreground/30'
                                        )}
                                      >
                                        {k}
                                      </button>
                                    ))}
                                  </div>
                                  {dudaSpecAbierta === cellKey && (
                                    <div className="space-y-1 rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-1.5 text-left">
                                      <textarea
                                        autoFocus
                                        className="w-full resize-none rounded border border-border/40 bg-background px-1.5 py-1 text-[9px] focus:outline-none focus:border-indigo-500 min-h-[44px]"
                                        placeholder="¿Qué necesitas aclarar? (obligatorio)"
                                        value={dudaSpecTexto}
                                        onChange={e => setDudaSpecTexto(e.target.value)}
                                      />
                                      <div className="flex justify-end gap-1">
                                        <button type="button" onClick={() => { setDudaSpecAbierta(null); setDudaSpecTexto(''); }} className="rounded px-1.5 py-0.5 text-[8px] font-bold text-muted-foreground hover:bg-muted">Cancelar</button>
                                        <button
                                          type="button"
                                          disabled={!dudaSpecTexto.trim() || guardandoEvalSpec === cellKey}
                                          onClick={() => void handleEvaluarEspec(esp.id_especificacion, prov.id, '?', dudaSpecTexto)}
                                          className="rounded bg-emerald-600 px-2 py-0.5 text-[8px] font-black text-white hover:bg-emerald-700 disabled:opacity-40"
                                        >
                                          Guardar
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                  {decisionActual === '?' && dudaSpecAbierta !== cellKey && evalSpec?.pregunta_residente && (
                                    <p className="text-[8px] text-indigo-600 leading-tight">{evalSpec.pregunta_residente}</p>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  {decisionActual !== 'PENDIENTE' ? (
                                    <span className={cn('inline-block rounded px-1.5 py-0.5 text-[9px] font-black', EVAL_STYLE[decisionActual])}>{decisionActual}</span>
                                  ) : (
                                    <span className="text-[9px] text-muted-foreground/40">—</span>
                                  )}
                                  {!isResidenteMode && evalSpec?.pregunta_residente && (
                                    <div className="rounded border border-amber-500/20 bg-amber-500/5 px-1.5 py-1 text-left">
                                      <p className="text-[8px] font-black text-amber-700">Duda:</p>
                                      <p className="text-[8px] text-foreground leading-tight">{evalSpec.pregunta_residente}</p>
                                      {evalSpec.respuesta_compras ? (
                                        <p className="mt-0.5 text-[8px] text-green-700">✓ {evalSpec.respuesta_compras}</p>
                                      ) : puedeResponder ? (
                                        <div className="mt-1 space-y-1">
                                          <textarea
                                            className="w-full resize-none rounded border border-border/40 bg-background px-1 py-0.5 text-[8px] focus:outline-none focus:border-amber-500 min-h-[36px]"
                                            placeholder="Responder..."
                                            value={respuestaSpecTexto[cellKey] ?? ''}
                                            onChange={e => setRespuestaSpecTexto(prev => ({ ...prev, [cellKey]: e.target.value }))}
                                          />
                                          <button
                                            type="button"
                                            disabled={!respuestaSpecTexto[cellKey]?.trim() || guardandoEvalSpec === cellKey}
                                            onClick={() => void handleResponderDudaEspec(esp.id_especificacion, prov.id)}
                                            className="rounded bg-amber-500 px-2 py-0.5 text-[8px] font-black text-white hover:bg-amber-400 disabled:opacity-40"
                                          >
                                            Responder
                                          </button>
                                        </div>
                                      ) : null}
                                    </div>
                                  )}
                                  {isResidenteMode && evalSpec?.pregunta_residente && (
                                    <div className="rounded border border-indigo-500/20 bg-indigo-500/5 px-1.5 py-1 text-left">
                                      <p className="text-[8px] font-black text-indigo-700">Tu duda:</p>
                                      <p className="text-[8px] text-foreground leading-tight">{evalSpec.pregunta_residente}</p>
                                      {evalSpec.respuesta_compras && (
                                        <p className="mt-0.5 text-[8px] text-green-700">Compras: {evalSpec.respuesta_compras}</p>
                                      )}
                                    </div>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAnotacionPanel({ especId: esp.id_especificacion, especDesc: esp.descripcion, proveedorId: prov.id, proveedorNombre: prov.nombre });
                                      setAnotacionForm({ tipo: nota?.tipo === 'respuesta' ? 'respuesta' : 'pregunta', texto: '' });
                                    }}
                                    title={nota ? `${nota.tipo}: ${nota.texto}` : 'Agregar anotación libre'}
                                    className={cn('rounded-full px-1.5 py-0.5 text-[8px] font-bold transition-all',
                                      nota ? 'bg-slate-500/10 text-slate-600 hover:bg-slate-500/20' : 'text-muted-foreground/20 hover:text-indigo-500'
                                    )}
                                  >
                                    {nota ? '💬' : '+ nota'}
                                  </button>
                                </div>
                              )}
                            </td>
                          );
                        })}
                        <td className="px-3 py-1" />
                        {comp.lineas.some(l => l.evaluacion_tecnica && l.evaluacion_tecnica !== 'PENDIENTE') && <td />}
                        {!locked && <td />}
                      </tr>
                    );
                  })}
                  {/* ── Sub-fila de evaluación técnica por proveedor — renglones SIN
                      especificaciones capturadas, alineada bajo la columna de cada
                      proveedor (mismo patrón que las sub-filas de especificaciones de
                      arriba). Reemplaza el panel modal. Ver
                      openspec/changes/evaluacion-tecnica-inline-tabla-comparativa. ── */}
                  {!(especsMap[lineaDetalleKey(linea)]?.length) && Object.keys(linea.evaluacionesPorProveedor ?? {}).length > 0 && (() => {
                    const provIds = Object.keys(linea.evaluacionesPorProveedor ?? {});
                    const algunaEnDudaLinea = provIds.some(provId => evalForm[`${linea.id}:${provId}`]?.decision === '?');
                    return (
                      <tr className="border-b border-amber-500/5 bg-amber-500/[0.02]">
                        <td className="pl-10 pr-2 py-1.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-amber-400 text-[8px]">◆</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">Evaluación técnica</span>
                            {showEvalTecnicaBtn && !algunaEnDudaLinea && (
                              <button
                                type="button"
                                data-testid={`eval-guardar-linea-${linea.id}`}
                                disabled={guardandoLineaId === linea.id}
                                onClick={() => void handleGuardarLineaEvaluacion(linea)}
                                className="rounded-full bg-emerald-600 px-2 py-0.5 text-[8px] font-black text-white hover:bg-emerald-700 disabled:opacity-40"
                              >
                                {guardandoLineaId === linea.id ? 'Guardando...' : 'Guardar'}
                              </button>
                            )}
                            {algunaEnDudaLinea && (
                              <span className="text-[8px] text-indigo-600">Se guardará con el resto de preguntas ↓</span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-1.5" />
                        <td className="px-3 py-1.5" />
                        {comp.proveedores.map(prov => {
                          const provData = linea.evaluacionesPorProveedor?.[prov.id];
                          if (!provData) return <td key={prov.id} className="px-2 py-1.5" />;
                          const formKey = `${linea.id}:${prov.id}`;
                          const decision = evalForm[formKey]?.decision ?? 'PENDIENTE';
                          return (
                            <td key={prov.id} className="px-2 py-1.5 text-center align-top">
                              {showEvalTecnicaBtn ? (
                                <div className="space-y-1">
                                  <div className="flex justify-center gap-0.5">
                                    {(['C', 'NC', 'DA', '?'] as const).map(k => (
                                      <button
                                        key={k}
                                        type="button"
                                        data-testid={`eval-btn-${linea.id}-${prov.id}-${k}`}
                                        onClick={() => setEvalForm(f => ({ ...f, [formKey]: { ...f[formKey], decision: k } }))}
                                        className={cn('w-7 rounded px-1 py-0.5 text-[8px] font-black transition-all',
                                          decision === k ? EVAL_BTN_ACTIVE[k] : 'border border-border/30 bg-muted/40 text-muted-foreground/50 hover:border-foreground/30'
                                        )}
                                      >
                                        {k}
                                      </button>
                                    ))}
                                  </div>
                                  {decision === '?' ? (
                                    <div className="space-y-1 rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-1.5 text-left">
                                      <textarea
                                        data-testid={`eval-pregunta-${linea.id}-${prov.id}`}
                                        className="w-full resize-none rounded border border-border/40 bg-background px-1.5 py-1 text-[9px] focus:outline-none focus:border-indigo-500 min-h-[44px]"
                                        placeholder="¿Qué necesitas aclarar? (obligatorio)"
                                        value={preguntasEval[formKey] ?? ''}
                                        onChange={e => setPreguntasEval(p => ({ ...p, [formKey]: e.target.value }))}
                                      />
                                      {!preguntasEval[formKey]?.trim() && (
                                        <p className="text-[8px] text-indigo-600">Obligatoria para "?"</p>
                                      )}
                                    </div>
                                  ) : decision !== 'PENDIENTE' ? (
                                    <div className="space-y-1 text-left">
                                      <textarea
                                        data-testid={`eval-comentario-${linea.id}-${prov.id}`}
                                        className="w-full resize-none rounded border border-border/40 bg-background px-1.5 py-1 text-[9px] focus:outline-none focus:border-amber-500 min-h-[36px]"
                                        placeholder={(decision === 'NC' || decision === 'DA') ? 'Comentario (obligatorio)...' : 'Comentario (opcional)...'}
                                        value={evalForm[formKey]?.comentario ?? ''}
                                        onChange={e => setEvalForm(f => ({ ...f, [formKey]: { ...f[formKey], comentario: e.target.value } }))}
                                      />
                                      {(decision === 'NC' || decision === 'DA') && !evalForm[formKey]?.comentario?.trim() && (
                                        <p className="text-[8px] text-red-500">Requerido para {decision}</p>
                                      )}
                                    </div>
                                  ) : null}
                                </div>
                              ) : provData.evaluacion_tecnica && provData.evaluacion_tecnica !== 'PENDIENTE' ? (
                                <span className={cn('inline-block rounded px-1.5 py-0.5 text-[9px] font-black', EVAL_STYLE[provData.evaluacion_tecnica])}>{provData.evaluacion_tecnica}</span>
                              ) : (
                                <span className="text-[9px] text-muted-foreground/40">—</span>
                              )}
                            </td>
                          );
                        })}
                        {!isResidenteMode && <td className="px-3 py-1.5" />}
                        {comp.lineas.some(l => l.evaluacion_tecnica && l.evaluacion_tecnica !== 'PENDIENTE') && <td />}
                        {!locked && <td />}
                      </tr>
                    );
                  })()}
                  {/* ── Sub-fila de evaluación económica GT — costo, días de suministro y
                      condición de crédito por proveedor, alineada bajo su columna (mismo
                      patrón que la sub-fila de evaluación técnica). Reemplaza el panel
                      modal de GT. Ver
                      openspec/changes/evaluacion-economica-gt-por-proveedor. ── */}
                  {Object.keys(linea.aprobacionesGtPorProveedor ?? {}).length > 0
                    && comp.estado !== 'BORRADOR' && comp.estado !== 'EN_EVALUACION_TECNICA' && (() => {
                    const gtProvIds = formKeysDeLineaGT(linea).map(k => k.split(':')[1]);
                    const algunaEnDudaLineaGT = gtProvIds.some(provId => gtForm[`${linea.id}:${provId}`]?.decision === '?');
                    return (
                      <tr className="border-b border-violet-500/5 bg-violet-500/[0.02]">
                        <td className="pl-10 pr-2 py-1.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-violet-400 text-[8px]">◆</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-violet-700">Evaluación económica GT</span>
                            {showRevisarGTBtn && !algunaEnDudaLineaGT && (
                              <button
                                type="button"
                                data-testid={`gt-guardar-linea-${linea.id}`}
                                disabled={guardandoLineaGtId === linea.id}
                                onClick={() => void handleGuardarLineaGT(linea)}
                                className="rounded-full bg-emerald-600 px-2 py-0.5 text-[8px] font-black text-white hover:bg-emerald-700 disabled:opacity-40"
                              >
                                {guardandoLineaGtId === linea.id ? 'Guardando...' : 'Guardar'}
                              </button>
                            )}
                            {algunaEnDudaLineaGT && (
                              <span className="text-[8px] text-indigo-600">Se guardará con el resto de preguntas ↓</span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-1.5" />
                        <td className="px-3 py-1.5" />
                        {comp.proveedores.map(prov => {
                          const provData = linea.aprobacionesGtPorProveedor?.[prov.id];
                          if (!provData) return <td key={prov.id} className="px-2 py-1.5" />;
                          const tecProv: string | undefined = linea.evaluacionesPorProveedor?.[prov.id]?.evaluacion_tecnica;
                          const rechazadoTecnico = tecProv === 'NC' || tecProv === 'RECHAZADO';
                          const formKey = `${linea.id}:${prov.id}`;
                          const decision = gtForm[formKey]?.decision ?? 'PENDIENTE';
                          const precio = parseFloat(linea.precios[prov.id] || '0') || 0;
                          const fechaEntrega = linea.fechasEntrega[prov.id];
                          const diasSuministro = fechaEntrega && comp.fecha_firma
                            ? Math.round((new Date(fechaEntrega).getTime() - new Date(comp.fecha_firma).getTime()) / 86400000)
                            : null;
                          return (
                            <td key={prov.id} className="px-2 py-1.5 text-center align-top">
                              <div className="mb-1 space-y-0.5 text-left">
                                {precio > 0 && <div className="text-[9px] font-bold text-foreground">{formatMXN(precio)}</div>}
                                {diasSuministro !== null && <div className="text-[8px] text-sky-700">{diasSuministro} día{diasSuministro !== 1 ? 's' : ''} de suministro</div>}
                                <div className="text-[8px] text-muted-foreground">
                                  {prov.ofrece_credito ? `Crédito ${prov.dias_credito ?? '?'} días` : 'Sin crédito'}
                                </div>
                              </div>
                              {rechazadoTecnico ? (
                                <span className="text-[9px] text-red-500/70" title="Rechazado en evaluación técnica — fuera del alcance de GT">🔒 Rechazado técnica</span>
                              ) : showRevisarGTBtn ? (
                                <div className="space-y-1">
                                  <div className="flex justify-center gap-0.5">
                                    {(['C', 'NC', 'DA', '?'] as const).map(k => (
                                      <button
                                        key={k}
                                        type="button"
                                        data-testid={`gt-btn-${linea.id}-${prov.id}-${k}`}
                                        onClick={() => setGtForm(f => ({ ...f, [formKey]: { ...f[formKey], decision: k } }))}
                                        className={cn('w-7 rounded px-1 py-0.5 text-[8px] font-black transition-all',
                                          decision === k ? EVAL_BTN_ACTIVE[k] : 'border border-border/30 bg-muted/40 text-muted-foreground/50 hover:border-foreground/30'
                                        )}
                                      >
                                        {k}
                                      </button>
                                    ))}
                                  </div>
                                  {decision === '?' ? (
                                    <div className="space-y-1 rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-1.5 text-left">
                                      <textarea
                                        data-testid={`gt-pregunta-${linea.id}-${prov.id}`}
                                        className="w-full resize-none rounded border border-border/40 bg-background px-1.5 py-1 text-[9px] focus:outline-none focus:border-indigo-500 min-h-[44px]"
                                        placeholder="¿Qué necesitas aclarar? (obligatorio)"
                                        value={preguntasGT[formKey] ?? ''}
                                        onChange={e => setPreguntasGT(p => ({ ...p, [formKey]: e.target.value }))}
                                      />
                                      {!preguntasGT[formKey]?.trim() && (
                                        <p className="text-[8px] text-indigo-600">Obligatoria para "?"</p>
                                      )}
                                    </div>
                                  ) : decision !== 'PENDIENTE' ? (
                                    <div className="space-y-1 text-left">
                                      <textarea
                                        data-testid={`gt-comentario-${linea.id}-${prov.id}`}
                                        className="w-full resize-none rounded border border-border/40 bg-background px-1.5 py-1 text-[9px] focus:outline-none focus:border-violet-500 min-h-[36px]"
                                        placeholder={(decision === 'NC' || decision === 'DA') ? 'Comentario (obligatorio)...' : 'Comentario (opcional)...'}
                                        value={gtForm[formKey]?.comentario ?? ''}
                                        onChange={e => setGtForm(f => ({ ...f, [formKey]: { ...f[formKey], comentario: e.target.value } }))}
                                      />
                                      {(decision === 'NC' || decision === 'DA') && !gtForm[formKey]?.comentario?.trim() && (
                                        <p className="text-[8px] text-red-500">Requerido para {decision}</p>
                                      )}
                                    </div>
                                  ) : null}
                                </div>
                              ) : provData.aprobacion_gt && provData.aprobacion_gt !== 'PENDIENTE' ? (
                                <span className={cn('inline-block rounded px-1.5 py-0.5 text-[9px] font-black', EVAL_STYLE[provData.aprobacion_gt])}>{provData.aprobacion_gt}</span>
                              ) : (
                                <span className="text-[9px] text-muted-foreground/40">—</span>
                              )}
                            </td>
                          );
                        })}
                        {!isResidenteMode && <td className="px-3 py-1.5" />}
                        {comp.lineas.some(l => l.evaluacion_tecnica && l.evaluacion_tecnica !== 'PENDIENTE') && <td />}
                        {!locked && <td />}
                      </tr>
                    );
                  })()}
                  </React.Fragment>
                  );
                })}
                {comp.lineas.length > 0 && !isResidenteMode && (
                  <tr className="border-t-2 border-border/40 bg-muted/30">
                    <td colSpan={3} className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total estimado</td>
                    {comp.proveedores.map((prov, i) => {
                      const c = PROV_COLORS[i] || PROV_COLORS[0];
                      const total = getTotalProveedor(prov.id);
                      return (
                        <td key={prov.id} className="px-2 py-3 text-right">
                          <span className="text-sm font-black" style={{ color: total > 0 ? c.col : undefined }}>
                            {total > 0 ? formatMXN(total) : '—'}
                          </span>
                        </td>
                      );
                    })}
                    <td className="px-3 py-3 text-center">
                      {comp.lineas.every(l => l.ganador !== null) && (
                        <div className="text-sm font-black text-amber-600">{formatMXN(getTotalGanador())}</div>
                      )}
                    </td>
                    {comp.lineas.some(l => l.evaluacion_tecnica && l.evaluacion_tecnica !== 'PENDIENTE') && <td />}
                    {!locked && <td />}
                  </tr>
                )}
              </tbody>
            </table>
          </TableScrollShadow>

          {/* Footer: responder preguntas del Residente (modo compras, revisión) */}
          {!isResidenteMode && comp.revision_padre_id && comp.lineas.some(l => l.pregunta_residente && !l.respuesta_compras) && comp.estado === 'BORRADOR' && (
            <div className="border-t border-amber-500/20 bg-amber-500/5 px-6 py-4 flex items-center justify-between gap-3">
              <p className="text-[10px] text-amber-700 font-bold">El Residente tiene preguntas — escribe tus respuestas en cada renglón y guarda.</p>
              <Button
                onClick={async () => {
                  const respuestas = comp.lineas
                    .filter(l => l.pregunta_residente)
                    .map(l => ({
                      detalle_id: l.id,
                      respuesta_compras: (document.getElementById(`resp-${l.id}`) as HTMLTextAreaElement)?.value?.trim() ?? '',
                    }))
                    .filter(r => r.respuesta_compras);
                  if (respuestas.length === 0) return;
                  try {
                    await api.put(`/api/v1/compras/comparativas/${comp.id}/responder-preguntas`, { respuestas });
                    notify({ type: 'success', title: 'Respuestas guardadas', message: 'El Residente puede continuar con la evaluación.' });
                    // Reload para reflejar respuestas
                    const full = await api.get(`/api/v1/compras/comparativas/${comp.id}`);
                    onUpdate({ ...comp, ...full.data.data });
                  } catch (err: any) {
                    notify({ type: 'error', title: 'Error al guardar respuestas', message: err.response?.data?.message ?? err.message });
                  }
                }}
                className="rounded-xl !bg-emerald-600 px-4 text-xs font-black !text-white hover:!bg-emerald-700 whitespace-nowrap"
              >
                Guardar respuestas
              </Button>
            </div>
          )}
          {/* Footer: Residente envía dudas por característica y crea revisión */}
          {isResidenteMode && comp.estado === 'EN_EVALUACION_TECNICA' && hayDudasEspecPendientes && (
            <div className="border-t border-indigo-500/20 bg-indigo-500/5 px-6 py-4 flex items-center justify-between gap-3">
              <p className="text-[10px] text-indigo-700 font-bold">⚠️ Tienes características marcadas con "?" — al enviar se creará una nueva revisión y Compras recibirá tus dudas.</p>
              <Button
                onClick={handleEnviarDudasEspec}
                disabled={enviandoRevisionSpec}
                className="rounded-xl bg-indigo-600 px-4 text-xs font-black text-white hover:bg-indigo-500 whitespace-nowrap disabled:opacity-40"
              >
                {enviandoRevisionSpec ? 'Enviando...' : 'Enviar dudas y crear revisión'}
              </Button>
            </div>
          )}
          {/* Footer tabla: agregar material + botón legacy */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/30 px-6 py-4">
            {!locked && (
              !addLineaOpen ? (
                <Button onClick={() => setAddLineaOpen(true)} variant="ghost" className="h-auto px-0 py-0 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:bg-transparent hover:text-emerald-500">
                  <IconPlus className="h-3.5 w-3.5" /> Agregar material
                </Button>
              ) : (
                <div className="flex flex-1 items-end gap-2 mr-4 flex-wrap">
                  <div ref={addLineaRef} className="relative min-w-[220px] flex-1">
                    {addLineaInsumoId ? (
                      <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
                        <span className="text-xs font-bold text-emerald-700 truncate">{addLineaInsumoLabel}</span>
                        <button type="button" onClick={() => { setAddLineaInsumoId(''); setAddLineaInsumoLabel(''); setAddLineaInsumoUnidad(''); }} className="ml-2 shrink-0 text-muted-foreground hover:text-foreground"><IconX className="h-3.5 w-3.5" /></button>
                      </div>
                    ) : (
                      <>
                        <IconSearch className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <input className="w-full rounded-xl border border-border/40 bg-background py-2 pl-9 pr-3 text-xs focus:border-emerald-500 focus:outline-none" placeholder="Buscar material..." value={addLineaSearch} onFocus={() => setAddLineaDropdown(true)} onChange={e => { setAddLineaSearch(e.target.value); setAddLineaDropdown(true); }} />
                        {addLineaDropdown && lineaSuggestions.length > 0 && (
                          <div className="absolute bottom-full z-50 mb-1 w-full rounded-xl border border-border/40 bg-card shadow-xl">
                            {lineaSuggestions.map(ins => (
                              <button key={ins.id} type="button" onMouseDown={() => { setAddLineaInsumoId(ins.id); setAddLineaInsumoLabel(`${ins.clave} — ${ins.descripcion}`); setAddLineaInsumoUnidad(ins.unidad); setAddLineaSearch(''); setAddLineaDropdown(false); }} className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/60 first:rounded-t-xl last:rounded-b-xl">
                                <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-black text-emerald-700">{ins.clave}</span>
                                <span className="flex-1 truncate text-xs">{ins.descripcion}</span>
                                <span className="shrink-0 text-[9px] text-muted-foreground">{ins.unidad}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div className="w-24">
                    <input type="number" min="0" className="w-full rounded-xl border border-border/40 bg-background px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none" placeholder="Cant." value={addLineaCantidad} onChange={e => setAddLineaCantidad(e.target.value)} />
                  </div>
                  {addLineaInsumoUnidad && <span className="text-[10px] text-muted-foreground">{addLineaInsumoUnidad}</span>}
                  <Button onClick={handleAddLinea} disabled={!addLineaInsumoId || !addLineaCantidad} className="h-9 rounded-xl bg-emerald-600 px-4 text-xs font-black text-white hover:bg-emerald-500">Agregar</Button>
                  <Button onClick={() => { setAddLineaOpen(false); setAddLineaInsumoId(''); setAddLineaInsumoLabel(''); setAddLineaCantidad(''); setAddLineaSearch(''); }} variant="ghost" className="h-9 w-9 rounded-xl p-0"><IconX className="h-4 w-4" /></Button>
                </div>
              )
            )}

            {/* Botón Autorizar legacy (para flujos en BORRADOR/EN_PROCESO sin nuevo workflow) */}
            {showAutorizarLegacyBtn && (
              <Button
                onClick={handleAutorizar}
                disabled={!canAuthorize || autorizando}
                className={cn('ml-auto rounded-2xl px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-xl transition-all', canAuthorize ? 'bg-amber-500 shadow-amber-500/20 hover:bg-amber-400 active:scale-[0.98]' : 'cursor-not-allowed bg-muted text-muted-foreground shadow-none')}
              >
                {autorizando ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Generando OC...</> : <><IconCheckCircle2 className="h-4 w-4" />Autorizar → OC</>}
              </Button>
            )}
            {(comp.estado === 'AUTORIZADA' || comp.estado === 'CERRADO') && (
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-green-600">
                <IconCheckCircle2 className="h-5 w-5" />
                {comp.estado === 'CERRADO' ? 'OC emitida — cuadro cerrado' : 'Comparativa autorizada — OC generadas'}
              </div>
            )}
          </div>
        </Card>
      )}

      {comp.lineas.length === 0 && comp.proveedores.length > 0 && (
        <div className="rounded-2xl border border-dashed border-border/60 p-12 text-center">
          <IconPackage className="mx-auto mb-4 h-12 w-12 text-muted-foreground/20" />
          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Sin materiales — agrega los insumos a cotizar</p>
        </div>
      )}

      {/* Órdenes de Compra Generadas */}
      {ocList.length > 0 && (
        <Card className="border-green-500/20 bg-green-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-tight text-green-700">
              <IconCheckCircle2 className="h-5 w-5" />
              Órdenes de Compra Generadas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            {ocList.map(oc => {
              const ocEstilo = OC_ESTADO_STYLE[oc.estado] ?? OC_ESTADO_STYLE.EMITIDA;
              const canReceive = !isDemo && (roles.includes('procurement') || roles.includes('admin'))
                && (oc.estado === 'EMITIDA' || oc.estado === 'PARCIALMENTE_RECIBIDA');
              const insumosMapLocal = new Map(comp.lineas.map(l => [l.insumo_id, l.insumo_descripcion]));
              return (
                <div key={oc.id_orden ?? oc.codigo} className="rounded-xl border border-green-500/20 bg-background overflow-hidden">
                  {/* Header de la OC */}
                  <div className="flex items-center justify-between px-4 py-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-green-700">{oc.codigo}</span>
                        <span className={cn('rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-widest', ocEstilo.badge)}>
                          {ocEstilo.label}
                        </span>
                        {oc.estado_pago && oc.estado_pago !== 'PENDIENTE_PAGO' && (
                          <span className={cn('rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-widest',
                            oc.estado_pago === 'PAGADA'       ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700' :
                            oc.estado_pago === 'PAGO_PARCIAL' ? 'border-amber-500/20 bg-amber-500/10 text-amber-700' : ''
                          )}>
                            {oc.estado_pago === 'PAGADA' ? 'Pagada' : 'Pago parcial'}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground">{oc.proveedor_nombre}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-black text-foreground">
                        {oc.total.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 })}
                      </div>
                      {canReceive && (
                        <button
                          onClick={() => setRecepcionPanelOcId(oc.id_orden)}
                          className="flex items-center gap-1 rounded-lg border border-amber-500/40 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-amber-700 hover:bg-amber-500/10 transition-colors"
                        >
                          <IconPackage className="h-3 w-3" />Recibir
                        </button>
                      )}
                      {onExportOcPdf && !isDemo && (
                        <button
                          onClick={() => onExportOcPdf(oc)}
                          title="Exportar OC como PDF"
                          className="flex items-center gap-1 rounded-lg border border-green-500/30 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-green-700 hover:bg-green-500/10 transition-colors"
                        >
                          <IconDownload className="h-3 w-3" />PDF
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Tabla de ítems con acumulados de recepción */}
                  {oc.items.length > 0 && (
                    <div className="border-t border-green-500/10 px-4 pb-3 pt-2">
                      <p className="mb-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground">Líneas de la OC</p>
                      <div className="space-y-1">
                        {oc.items.map((item, idx) => (
                          <div key={item.id_item} className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 rounded-lg bg-muted/30 px-3 py-1.5 text-[10px]">
                            <div className="truncate font-medium text-foreground/80">
                              {insumosMapLocal.get(item.insumo_id) ?? `Ítem ${idx + 1}`}
                            </div>
                            <div className="text-right text-muted-foreground whitespace-nowrap">
                              {Number(item.cantidad).toLocaleString()} u
                            </div>
                            <div className={cn('text-right font-bold whitespace-nowrap', item.porcentaje_recibido >= 100 ? 'text-emerald-600' : item.porcentaje_recibido > 0 ? 'text-amber-600' : 'text-muted-foreground/50')}>
                              {item.cantidad_acumulada_recibida > 0 ? `${Number(item.cantidad_acumulada_recibida).toLocaleString()} recib.` : '—'}
                            </div>
                            <div className="w-12 text-right font-black whitespace-nowrap">
                              {item.porcentaje_recibido > 0 ? (
                                <span className={cn(item.porcentaje_recibido >= 100 ? 'text-emerald-600' : 'text-amber-600')}>
                                  {item.porcentaje_recibido}%
                                </span>
                              ) : (
                                <span className="text-muted-foreground/40">0%</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Footer: total + PDF comparativa */}
            <div className="flex items-center justify-between rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-green-700">Total comprometido</span>
              <div className="flex items-center gap-3">
                <span className="text-base font-black text-green-700">
                  {ocList.reduce((s, oc) => s + oc.total, 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 })}
                </span>
                {onExportComparativaPdf && !isDemo && (
                  <button
                    onClick={onExportComparativaPdf}
                    title="Exportar cuadro comparativo como PDF"
                    className="flex items-center gap-1 rounded-lg border border-green-500/30 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-green-700 hover:bg-green-500/10 transition-colors"
                  >
                    <IconDownload className="h-3 w-3" />Comparativa PDF
                  </button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sección: Veredicto del Residente */}
      {comp.estado === 'EN_EVALUACION_TECNICA' && (isResident || roles.includes('admin')) && (
        <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 px-4 py-4 space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-700">Veredicto del Residente</p>

          {/* Selección de 1ª/2ª opción — ver openspec/changes/seleccion-proveedor-recomendado-firma:
              va primero, antes del veredicto y del botón de firma. */}
          {comp.proveedores.length > 0 && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-amber-700 mb-2">Proveedor recomendado</p>
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[180px]">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">1ª Opción *</label>
                  <select
                    value={primeraOpcion}
                    onChange={e => setPrimeraOpcion(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border/40 bg-background px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="">— Seleccionar proveedor —</option>
                    {comp.proveedores.map((p, i) => (
                      <option key={p.id} value={p.id}>{String.fromCharCode(65 + i)} · {p.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 min-w-[180px]">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">2ª Opción (opcional)</label>
                  <select
                    value={segundaOpcion}
                    onChange={e => setSegundaOpcion(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border/40 bg-background px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="">— Sin segunda opción —</option>
                    {comp.proveedores.filter(p => p.id !== primeraOpcion).map((p) => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>
                <Button
                  onClick={handleGuardarSeleccion}
                  disabled={!primeraOpcion || guardandoSeleccion}
                  className="rounded-xl !bg-emerald-600 px-4 py-2 text-xs font-black !text-white hover:!bg-emerald-700"
                >
                  {guardandoSeleccion ? 'Guardando...' : 'Guardar selección'}
                </Button>
              </div>
              {comp.primera_opcion_proveedor_id && (
                <p className="mt-2 text-[9px] text-amber-600/80">
                  Selección guardada: 1ª opción = {comp.proveedores.find(p => p.id === comp.primera_opcion_proveedor_id)?.nombre ?? comp.primera_opcion_proveedor_id}
                  {comp.segunda_opcion_proveedor_id && ` · 2ª opción = ${comp.proveedores.find(p => p.id === comp.segunda_opcion_proveedor_id)?.nombre ?? comp.segunda_opcion_proveedor_id}`}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Veredicto técnico general *</label>
            <Textarea
              className="mt-1 rounded-xl text-xs min-h-[72px]"
              placeholder="Describe tu evaluación general del cuadro: cuál proveedor recomiendas y por qué..."
              value={veredicto}
              onChange={e => setVeredicto(e.target.value)}
              disabled={isFirmadoBloqueado}
            />
          </div>
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Proveedor(es) recomendado(s) *</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {comp.proveedores.map((prov, i) => {
                const sel = provSugeridos.includes(prov.id);
                return (
                  <button
                    key={prov.id}
                    disabled={isFirmadoBloqueado}
                    onClick={() => setProvSugeridos(prev => sel ? prev.filter(id => id !== prov.id) : [...prev, prov.id])}
                    className={cn('rounded-xl border px-3 py-1.5 text-[10px] font-black transition-all',
                      sel ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-border/40 bg-muted text-muted-foreground hover:border-indigo-500/40',
                      isFirmadoBloqueado && 'cursor-default opacity-70'
                    )}
                  >
                    {String.fromCharCode(65 + i)} · {prov.nombre}
                  </button>
                );
              })}
            </div>
          </div>
          {!isFirmadoBloqueado && (
            <div className="flex items-center gap-3 pt-1">
              <Button
                onClick={handleGuardarVeredicto}
                disabled={!veredicto.trim() || provSugeridos.length === 0 || guardandoVeredicto}
                className="rounded-xl !bg-emerald-600 px-4 text-xs font-black !text-white hover:!bg-emerald-700 disabled:opacity-40"
              >
                {guardandoVeredicto ? 'Guardando...' : 'Guardar veredicto'}
              </Button>
              {(!veredicto.trim() || provSugeridos.length === 0) && (
                <p className="text-[9px] text-muted-foreground">Completa el veredicto y selecciona al menos un proveedor antes de firmar.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Veredicto solo lectura (post-firma) */}
      {isFirmadoBloqueado && comp.veredicto_residente && (
        <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 px-4 py-4 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-700">Veredicto del Residente — registrado</p>
          <p className="text-[11px] text-foreground leading-relaxed">{comp.veredicto_residente}</p>
          {(() => {
            const ids: string[] = (() => { try { return JSON.parse(comp.proveedores_sugeridos ?? '[]'); } catch { return []; } })();
            const nombres = ids.map(id => comp.proveedores.find(p => p.id === id)?.nombre ?? id);
            return nombres.length > 0 ? (
              <p className="text-[10px] text-indigo-600 font-bold">
                Proveedor(es) recomendado(s): {nombres.join(', ')}
              </p>
            ) : null;
          })()}
          {comp.fecha_firma && (
            <p className="text-[9px] text-muted-foreground">Firmado el {new Date(comp.fecha_firma).toLocaleString('es-MX')}</p>
          )}
        </div>
      )}

      {/* ── Modal: Firma (no-dismissible) ─────────────────────────────────────── */}
      {showFirmaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-card shadow-2xl overflow-hidden">
            <div className="bg-red-600 px-6 py-4">
              <h2 className="text-sm font-black uppercase tracking-tight text-white">🔒 Firmar Evaluación Técnica</h2>
              <p className="text-[10px] text-red-100/80 mt-0.5">Esta acción es irreversible</p>
            </div>
            <div className="px-6 py-5 space-y-4">
              {/* Resumen */}
              <div className="rounded-2xl border border-border/40 bg-muted/30 px-4 py-3 space-y-2">
                <div className="flex justify-between text-[10px]"><span className="text-muted-foreground">Cuadro</span><span className="font-black">{comp.codigo ?? comp.id.slice(0, 8)}</span></div>
                <div className="flex justify-between text-[10px]"><span className="text-muted-foreground">Total renglones</span><span className="font-black">{comp.lineas.length}</span></div>
                <div className="flex gap-3 text-[10px]">
                  <span className="rounded bg-green-500/10 px-2 py-0.5 text-green-700 font-black">C: {comp.lineas.filter(l => l.evaluacion_tecnica === 'C').length}</span>
                  <span className="rounded bg-red-500/10 px-2 py-0.5 text-red-700 font-black">NC: {comp.lineas.filter(l => l.evaluacion_tecnica === 'NC').length}</span>
                  <span className="rounded bg-amber-500/10 px-2 py-0.5 text-amber-700 font-black">DA: {comp.lineas.filter(l => l.evaluacion_tecnica === 'DA').length}</span>
                </div>
              </div>
              {/* Veredicto resumido */}
              {veredicto.trim() && (
                <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 px-4 py-3 space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-indigo-700">Veredicto a firmar</p>
                  <p className="text-[11px] text-foreground leading-relaxed">{veredicto.trim()}</p>
                  {provSugeridos.length > 0 && (
                    <p className="text-[10px] text-indigo-600 font-bold">
                      Proveedor(es) sugerido(s): {provSugeridos.map(id => comp.proveedores.find(p => p.id === id)?.nombre ?? id).join(', ')}
                    </p>
                  )}
                </div>
              )}
              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3">
                <p className="text-[11px] text-red-700 font-bold">⚠️ Al firmar, este cuadro quedará bloqueado permanentemente. Solo el administrador podrá desbloquearlo. ¿Confirmas?</p>
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={firmaConfirmado}
                  onChange={e => setFirmaConfirmado(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-border accent-red-600"
                />
                <span className="text-[11px] text-foreground leading-tight">Confirmo que revisé personalmente cada renglón de esta requisición y acepto responsabilidad técnica por esta evaluación.</span>
              </label>
              {firmaError && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2 text-[11px] text-red-700">{firmaError}</div>
              )}
            </div>
            <div className="border-t border-border/40 px-6 py-4 flex justify-end gap-3">
              <Button onClick={() => { setShowFirmaModal(false); setFirmaError(null); }} variant="outline" className="rounded-xl" disabled={firmando}>Cancelar</Button>
              <Button
                onClick={handleFirmar}
                disabled={!firmaConfirmado || firmando}
                className="rounded-xl bg-red-600 px-6 font-black text-white hover:bg-red-500 disabled:opacity-40"
              >
                {firmando ? 'Firmando...' : '🔒 Firmar y Bloquear'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Confirmar nueva revisión ───────────────────────────────────── */}
      {showRevisionConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-card shadow-2xl p-6 space-y-4">
            <h2 className="text-sm font-black uppercase tracking-tight">Crear nueva revisión</h2>
            <p className="text-[11px] text-muted-foreground">
              El cuadro actual (<strong>Rev {comp.revision ?? 'A'}</strong>) pasará a estado <strong>SUPERSEDIDO</strong> y se creará una copia en estado <strong>BORRADOR</strong> con la siguiente letra de revisión. Los precios y especificaciones se copian; las evaluaciones se reinician a PENDIENTE.
            </p>
            <div className="flex justify-end gap-3">
              <Button onClick={() => setShowRevisionConfirm(false)} variant="outline" className="rounded-xl" disabled={creandoRevision}>Cancelar</Button>
              <Button onClick={handleNuevaRevision} disabled={creandoRevision} className="rounded-xl bg-orange-500 px-5 font-black text-white hover:bg-orange-400">
                {creandoRevision ? 'Creando...' : 'Crear revisión'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Sección: Historial de desbloqueos (admin) ─────────────────────────── */}
      {roles.includes('admin') && auditDesbloqueos.length > 0 && (
        <div className="rounded-2xl border border-slate-400/30 bg-slate-400/5 px-4 py-4 space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Historial de desbloqueos</p>
          {auditDesbloqueos.map(a => (
            <div key={a.id_auditoria} className="rounded-xl border border-border/30 bg-background px-3 py-2.5 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[9px] font-black text-muted-foreground">{new Date(a.timestamp_desbloqueo).toLocaleString('es-MX')}</span>
                <span className="text-[9px] font-mono text-muted-foreground/60">{a.desbloqueado_por.slice(0, 8)}</span>
              </div>
              <p className="text-[11px] text-foreground">{a.justificacion}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal: Desbloqueo admin ────────────────────────────────────────────── */}
      {showDesbloquearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-card shadow-2xl overflow-hidden">
            <div className="bg-red-800 px-6 py-4">
              <h2 className="text-sm font-black uppercase tracking-tight text-white">Desbloquear Cuadro Comparativo</h2>
              <p className="text-[10px] text-red-200/80 mt-0.5">El cuadro regresará a EN_EVALUACION_TECNICA</p>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="rounded-2xl border border-red-700/20 bg-red-700/5 px-4 py-3">
                <p className="text-[11px] text-red-800 font-bold">⚠️ Esta acción quedará registrada en el historial de auditoría con tu usuario, la fecha y la justificación que proporciones.</p>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Justificación del desbloqueo (obligatorio, mín. 10 caracteres)</label>
                <Textarea
                  className="mt-1 rounded-xl text-xs min-h-[80px]"
                  placeholder="Describe la razón por la que se desbloquea este cuadro..."
                  value={justificacionDesbloqueo}
                  onChange={e => setJustificacionDesbloqueo(e.target.value)}
                />
                {justificacionDesbloqueo.length > 0 && justificacionDesbloqueo.trim().length < 10 && (
                  <p className="mt-1 text-[9px] text-red-600">Mínimo 10 caracteres.</p>
                )}
              </div>
            </div>
            <div className="border-t border-border/40 px-6 py-4 flex justify-end gap-3">
              <Button onClick={() => setShowDesbloquearModal(false)} variant="outline" className="rounded-xl" disabled={desbloqueando}>Cancelar</Button>
              <Button
                onClick={handleDesbloquear}
                disabled={justificacionDesbloqueo.trim().length < 10 || desbloqueando}
                className="rounded-xl bg-red-700 px-6 font-black text-white hover:bg-red-600 disabled:opacity-40"
              >
                {desbloqueando ? 'Desbloqueando...' : 'Confirmar desbloqueo'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Selección de presupuesto para convertir-oc ─────────────────── */}
      {showPresupuestoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-card shadow-2xl overflow-hidden">
            <div className="bg-blue-700 px-6 py-4">
              <h2 className="text-sm font-black uppercase tracking-tight text-white">Seleccionar Presupuesto</h2>
              <p className="text-[10px] text-blue-200/80 mt-0.5">Múltiples presupuestos activos — elige uno para asignar los fondos</p>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="space-y-2">
                {presupuestos.map(p => (
                  <button
                    key={p.id_presupuesto}
                    onClick={() => setSelectedPresupuestoId(p.id_presupuesto)}
                    className={cn(
                      'w-full rounded-2xl border px-4 py-3 text-left transition-all',
                      selectedPresupuestoId === p.id_presupuesto
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-border/40 hover:border-blue-500/40',
                    )}
                  >
                    <p className="text-xs font-bold text-foreground">{p.codigo} — {p.descripcion}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Disponible: {p.monto_disponible.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                    </p>
                  </button>
                ))}
              </div>
            </div>
            <div className="border-t border-border/40 px-6 py-4 flex justify-end gap-3">
              <Button onClick={() => setShowPresupuestoModal(false)} variant="outline" className="rounded-xl" disabled={autorizando}>Cancelar</Button>
              <Button
                onClick={() => ejecutarConvertirOc(selectedPresupuestoId)}
                disabled={!selectedPresupuestoId || autorizando}
                className="rounded-xl bg-blue-600 px-6 font-black text-white hover:bg-blue-500 disabled:opacity-40"
              >
                {autorizando ? 'Generando OC...' : 'Confirmar y generar OC'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Partidas bloqueadas — sin presupuesto suficiente ──────────── */}
      {ocBloqueadas.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-card shadow-2xl overflow-hidden">
            <div className="bg-red-700 px-6 py-4">
              <h2 className="text-sm font-black uppercase tracking-tight text-white">🔒 Partidas Bloqueadas</h2>
              <p className="text-[10px] text-red-200/80 mt-0.5">
                Las siguientes partidas no tienen presupuesto disponible. No se generaron órdenes de compra.
              </p>
            </div>
            <div className="px-6 py-5 space-y-3 max-h-72 overflow-y-auto">
              {ocBloqueadas.map(b => (
                <div key={b.concepto_id} className="rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3">
                  <p className="text-xs font-black text-red-700">{b.concepto_clave}</p>
                  <p className="text-[11px] text-foreground mt-0.5 line-clamp-2">{b.concepto_desc}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Monto requerido: <span className="font-black text-red-700">
                      {Number(b.monto_requerido).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                    </span>
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t border-border/40 px-6 py-4 flex justify-between items-center gap-3">
              <span className="text-[10px] text-muted-foreground">
                Solicita una transferencia presupuestal en el módulo de Gerencia Técnica.
              </span>
              <button
                onClick={() => setOcBloqueadas([])}
                className="px-5 py-2 rounded-xl bg-red-600 text-white text-xs font-black hover:bg-red-500 transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SideSheet: Aclaraciones de celda ──────────────────────────────────── */}
      <SideSheet
        isOpen={!!aclaracionCelda}
        onClose={() => setAclaracionCelda(null)}
        title="Aclaraciones técnicas"
        description="Hilo de preguntas y respuestas para esta celda del cuadro"
        maxWidthClassName="max-w-lg"
      >
        <div className="flex flex-col gap-4 p-6">
          {aclaraciones.filter(a => aclaracionCelda && a.insumo_id === aclaracionCelda.insumo_id && a.proveedor_id === aclaracionCelda.proveedor_id).length === 0 ? (
            <p className="text-center text-[11px] text-muted-foreground py-6">Sin aclaraciones para esta celda.</p>
          ) : (
            <div className="space-y-3">
              {aclaraciones.filter(a => aclaracionCelda && a.insumo_id === aclaracionCelda.insumo_id && a.proveedor_id === aclaracionCelda.proveedor_id).map(a => (
                <div key={a.id_aclaracion} className={cn('rounded-2xl border px-4 py-3',
                  a.tipo === 'PREGUNTA' ? 'border-indigo-500/20 bg-indigo-500/5' : 'border-slate-500/20 bg-slate-500/5',
                  a.resuelta && 'opacity-60'
                )}>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={cn('rounded px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider',
                      a.tipo === 'PREGUNTA' ? 'bg-indigo-500/10 text-indigo-600' : 'bg-slate-500/10 text-slate-600'
                    )}>{a.tipo}</span>
                    {a.resuelta && <span className="rounded bg-green-500/10 px-1.5 py-0.5 text-[8px] font-black text-green-600">RESUELTA</span>}
                    <span className="ml-auto text-[9px] text-muted-foreground">{new Date(a.created_at).toLocaleDateString('es-MX')}</span>
                  </div>
                  <p className="text-[11px] text-foreground leading-relaxed">{a.mensaje}</p>
                </div>
              ))}
            </div>
          )}
          {!isLocked && !isSupersedido && (
            <div className="space-y-2 border-t border-border/40 pt-4">
              <div className="flex gap-2">
                {(['PREGUNTA', 'RESPUESTA'] as const).map(t => (
                  <button key={t} onClick={() => setAclaracionTipo(t)} className={cn('rounded-xl border px-3 py-1 text-[10px] font-black transition-all', aclaracionTipo === t ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-border/40 bg-muted text-muted-foreground')}>
                    {t}
                  </button>
                ))}
              </div>
              <Textarea
                className="rounded-xl text-xs min-h-[60px]"
                placeholder="Escribir mensaje..."
                value={aclaracionMensaje}
                onChange={e => setAclaracionMensaje(e.target.value)}
              />
              <Button onClick={handleEnviarAclaracion} disabled={!aclaracionMensaje.trim() || enviandoAclaracion} className="w-full rounded-xl bg-indigo-600 font-black text-white hover:bg-indigo-500">
                {enviandoAclaracion ? 'Enviando...' : 'Agregar mensaje'}
              </Button>
            </div>
          )}
        </div>
      </SideSheet>

      {/* ── Input oculto para PDF ───────────────────────────────────────────────── */}
      <input
        ref={pdfInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handlePdfFileChange}
      />

      {/* ── SideSheet revisión de renglones PDF ─────────────────────────────────── */}
      <SideSheet
        isOpen={showPdfReview}
        onClose={() => setShowPdfReview(false)}
        title="Revisión de cotización PDF"
        description={`${renglonesPdf.length} renglón${renglonesPdf.length !== 1 ? 'es' : ''} extraído${renglonesPdf.length !== 1 ? 's' : ''}. Edita antes de aplicar.`}
        maxWidthClassName="max-w-2xl"
      >
        <div className="flex flex-col gap-4 p-6">
          <TableScrollShadow className="rounded-2xl border border-border/40">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/30 bg-muted/40">
                  <th className="px-4 py-2.5 text-left text-[9px] font-black uppercase tracking-widest text-muted-foreground">Descripción</th>
                  <th className="px-3 py-2.5 text-center text-[9px] font-black uppercase tracking-widest text-muted-foreground w-16">UM</th>
                  <th className="px-3 py-2.5 text-right text-[9px] font-black uppercase tracking-widest text-muted-foreground w-20">Cantidad</th>
                  <th className="px-3 py-2.5 text-right text-[9px] font-black uppercase tracking-widest text-muted-foreground w-24">P. Unitario</th>
                  <th className="px-2 py-2.5 w-8" />
                </tr>
              </thead>
              <tbody>
                {renglonesPdf.map((r, idx) => (
                  <tr key={idx} className="border-b border-border/20 hover:bg-muted/20">
                    <td className="px-4 py-2">
                      <input
                        className="w-full rounded-lg border border-border/40 bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                        value={r.descripcion}
                        onChange={e => setRenglonesPdf(prev => prev.map((x, i) => i === idx ? { ...x, descripcion: e.target.value } : x))}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        className="w-full rounded-lg border border-border/40 bg-background px-2 py-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-ring"
                        value={r.unidad}
                        onChange={e => setRenglonesPdf(prev => prev.map((x, i) => i === idx ? { ...x, unidad: e.target.value } : x))}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        className="w-full rounded-lg border border-border/40 bg-background px-2 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-ring"
                        value={r.cantidad}
                        onChange={e => setRenglonesPdf(prev => prev.map((x, i) => i === idx ? { ...x, cantidad: e.target.value } : x))}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        className="w-full rounded-lg border border-border/40 bg-background px-2 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-ring"
                        value={r.precio_unitario}
                        onChange={e => setRenglonesPdf(prev => prev.map((x, i) => i === idx ? { ...x, precio_unitario: e.target.value } : x))}
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <button
                        onClick={() => setRenglonesPdf(prev => prev.filter((_, i) => i !== idx))}
                        className="text-muted-foreground/50 hover:text-destructive transition-colors"
                      >
                        <IconX className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableScrollShadow>
          <div className="flex justify-end gap-3 pt-2">
            <Button onClick={() => { setShowPdfReview(false); setPdfFile(null); }} variant="outline" className="rounded-xl text-xs" disabled={aplicandoCotizacion}>
              Cancelar
            </Button>
            <Button
              onClick={handleAplicarCotizacion}
              disabled={aplicandoCotizacion}
              className="rounded-xl bg-emerald-600 px-5 text-xs font-black text-white hover:bg-emerald-500 disabled:opacity-60"
            >
              {aplicandoCotizacion ? 'Guardando...' : 'Aplicar al cuadro'}
            </Button>
          </div>
        </div>
      </SideSheet>

      {/* ── Input oculto para upload de fichas técnicas ─────────────────────── */}
      <input
        ref={fichaFileRef}
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        className="hidden"
        onChange={handleFichaUpload}
      />

      {/* ── SideSheet: Fichas Técnicas del Insumo ───────────────────────────── */}
      <SideSheet
        isOpen={!!sideSheetFichasInsumoId}
        onClose={() => setSideSheetFichasInsumoId(null)}
        title="Fichas Técnicas"
        description="Documentos de especificación enviados por proveedores para este insumo"
        maxWidthClassName="max-w-lg"
      >
        <div className="flex flex-col gap-4 p-6">
          {isProcurement && (
            <button
              onClick={() => {
                setFichaUploadInsumoId(sideSheetFichasInsumoId);
                fichaFileRef.current?.click();
              }}
              disabled={uploadingFicha}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-emerald-600 bg-emerald-500/10 py-3 text-[10px] font-black uppercase tracking-widest text-emerald-700 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
            >
              {uploadingFicha ? 'Subiendo...' : '📎 Subir ficha técnica'}
            </button>
          )}

          {loadingFichas ? (
            <div className="flex items-center justify-center py-8 text-[10px] text-muted-foreground">Cargando fichas...</div>
          ) : (fichasInsumo[sideSheetFichasInsumoId ?? ''] ?? []).length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <span className="text-2xl">📂</span>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sin fichas técnicas</p>
              {isProcurement && <p className="text-[10px] text-muted-foreground/60">Sube el primer documento con el botón de arriba</p>}
            </div>
          ) : (
            <div className="space-y-2">
              {(fichasInsumo[sideSheetFichasInsumoId ?? ''] ?? []).map(f => (
                <div key={f.id_ficha} className="flex items-center gap-3 rounded-2xl border border-border/40 bg-background px-4 py-3">
                  <span className="text-xl">{f.mime_type === 'application/pdf' ? '📄' : f.mime_type.startsWith('image/') ? '🖼️' : '📝'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold truncate">{f.nombre_doc}</div>
                    {f.proveedor_ref && <div className="text-[9px] text-muted-foreground">{f.proveedor_ref}</div>}
                    <div className="text-[9px] text-muted-foreground/60">{(f.tamano_bytes / 1024).toFixed(0)} KB · {new Date(f.created_at).toLocaleDateString('es-MX')}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <a
                      href={`/api/v1/gerencia-tecnica/insumos/${sideSheetFichasInsumoId}/fichas/${f.id_ficha}/descargar`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-indigo-500/10 hover:text-indigo-600 transition-colors"
                      title="Descargar"
                    >
                      <IconDownload className="h-4 w-4" />
                    </a>
                    {isProcurement && (
                      <button
                        onClick={() => sideSheetFichasInsumoId && handleFichaDelete(sideSheetFichasInsumoId, f.id_ficha)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
                        title="Eliminar"
                      >
                        <IconX className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SideSheet>

      {/* ── SideSheet: Anotación de especificación (10.4) ───────────────────── */}
      <SideSheet
        isOpen={!!anotacionPanel}
        onClose={() => setAnotacionPanel(null)}
        title="Anotación de especificación"
        description={anotacionPanel ? `${anotacionPanel.especDesc} · Proveedor: ${anotacionPanel.proveedorNombre}` : ''}
        maxWidthClassName="max-w-md"
      >
        {anotacionPanel && (() => {
          const existente = anotacionesSpec.find(a => a.especificacion_id === anotacionPanel.especId && a.proveedor_id === anotacionPanel.proveedorId);
          return (
            <div className="space-y-4 p-1">
              {existente && (
                <div className={cn('rounded-xl border p-3 text-[11px]',
                  existente.tipo === 'pregunta' ? 'border-amber-500/20 bg-amber-500/5 text-amber-700' : 'border-green-500/20 bg-green-500/5 text-green-700'
                )}>
                  <p className="text-[9px] font-black uppercase tracking-widest mb-1">
                    {existente.tipo === 'pregunta' ? '? Pregunta registrada' : '✓ Respuesta registrada'}
                  </p>
                  <p>"{existente.texto}"</p>
                </div>
              )}
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2">Tipo de anotación</p>
                <div className="flex gap-2">
                  {(['pregunta', 'respuesta'] as const).map(t => (
                    <button key={t} type="button"
                      onClick={() => setAnotacionForm(f => ({ ...f, tipo: t }))}
                      className={cn('flex-1 rounded-xl border py-2 text-[10px] font-black capitalize transition-all',
                        anotacionForm.tipo === t
                          ? t === 'pregunta' ? 'border-amber-500/40 bg-amber-500/10 text-amber-700' : 'border-green-500/40 bg-green-500/10 text-green-700'
                          : 'border-border/40 text-muted-foreground hover:border-border'
                      )}
                    >{t}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Texto</p>
                <Textarea
                  rows={3}
                  placeholder={anotacionForm.tipo === 'pregunta' ? 'Escribe tu pregunta técnica…' : 'Escribe la respuesta del proveedor…'}
                  value={anotacionForm.texto}
                  onChange={e => setAnotacionForm(f => ({ ...f, texto: e.target.value }))}
                  className="resize-none text-xs"
                />
              </div>
              <Button
                onClick={handleGuardarAnotacion}
                disabled={guardandoAnotacion || !anotacionForm.texto.trim()}
                className="w-full rounded-xl !bg-emerald-600 !text-white text-xs font-black hover:!bg-emerald-700 disabled:opacity-40"
              >
                {guardandoAnotacion ? 'Guardando…' : 'Guardar anotación'}
              </Button>
            </div>
          );
        })()}
      </SideSheet>

      {/* ── SideSheet: Registrar Recepción de OC ────────────────────────────── */}
      {(() => {
        const ocParaRecepcion = ocList.find(o => o.id_orden === recepcionPanelOcId);
        const insumosMapLocal = new Map(comp.lineas.map(l => [l.insumo_id, l.insumo_descripcion]));
        return (
          <SideSheet
            isOpen={!!recepcionPanelOcId}
            onClose={() => setRecepcionPanelOcId(null)}
            title={`Registrar recepción — ${ocParaRecepcion?.codigo ?? ''}`}
            description="Indica las cantidades físicamente recibidas por línea de la OC"
            maxWidthClassName="max-w-2xl"
          >
            {ocParaRecepcion && (
              <div className="space-y-5">
                {/* Fecha + Notas */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Fecha de recepción *</label>
                    <Input
                      type="date"
                      value={recepcionFecha}
                      onChange={e => setRecepcionFecha(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Notas (opcional)</label>
                    <Input
                      placeholder="Notas de la recepción…"
                      value={recepcionNotas}
                      onChange={e => setRecepcionNotas(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>

                {/* Tabla de líneas */}
                <div>
                  <p className="mb-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground">Líneas a recibir</p>
                  <div className="space-y-2">
                    {ocParaRecepcion.items.map((item, idx) => {
                      const pendiente = Math.max(0, item.cantidad - item.cantidad_acumulada_recibida);
                      const linea = recepcionLineas[item.id_item] ?? { cantidad_recibida: '0', nota_discrepancia: '' };
                      const desc = insumosMapLocal.get(item.insumo_id) ?? `Ítem ${idx + 1}`;
                      return (
                        <div key={item.id_item} className="rounded-xl border border-border/50 bg-muted/20 p-3 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-foreground truncate">{desc}</p>
                              <p className="text-[10px] text-muted-foreground">
                                Pedido: {Number(item.cantidad).toLocaleString()} · Ya recibido: {Number(item.cantidad_acumulada_recibida).toLocaleString()} · Pendiente: <span className="font-bold text-amber-600">{pendiente.toLocaleString()}</span>
                              </p>
                            </div>
                            <div className="shrink-0 w-28">
                              <label className="block text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Cant. recibida</label>
                              <Input
                                type="number"
                                min="0"
                                max={pendiente}
                                step="0.0001"
                                value={linea.cantidad_recibida}
                                onChange={e => setRecepcionLineas(prev => ({
                                  ...prev,
                                  [item.id_item]: { ...linea, cantidad_recibida: e.target.value },
                                }))}
                                className="text-xs text-right"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Nota de discrepancia (opcional)</label>
                            <Input
                              placeholder="Cantidad distinta, daño, etc."
                              value={linea.nota_discrepancia}
                              onChange={e => setRecepcionLineas(prev => ({
                                ...prev,
                                [item.id_item]: { ...linea, nota_discrepancia: e.target.value },
                              }))}
                              className="text-xs"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-border/50">
                  <Button
                    variant="outline"
                    onClick={() => setRecepcionPanelOcId(null)}
                    disabled={guardandoRecepcion}
                    className="text-xs"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSubmitRecepcion}
                    disabled={guardandoRecepcion}
                    className="rounded-xl bg-amber-600 text-white text-xs font-black hover:bg-amber-500 disabled:opacity-40"
                  >
                    {guardandoRecepcion
                      ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Registrando…</>
                      : <><IconPackage className="h-4 w-4" />Registrar recepción</>}
                  </Button>
                </div>
              </div>
            )}
          </SideSheet>
        );
      })()}

    </div>
  );
};
