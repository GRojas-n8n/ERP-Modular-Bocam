import React, { useEffect, useMemo, useRef, useState } from 'react';
import api, { comprasApi } from '../lib/api';
import { useTenant } from '../context/TenantContext';
import { useNotification } from '../context/NotificationContext';
import { DEMO_INSUMOS, DEMO_REQUISICIONES, DEMO_COMPARATIVAS } from '../lib/demoData';
import { ComparativaDetail } from '../components/ComparativaDetail';
import type { ComparativaLocal } from '../components/ComparativaDetail';
import { mergeProveedoresConSolicitud, seedProveedoresDesdeSolicitud } from '../lib/comparativa-proveedores';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  FormField,
  Input,
  Select,
  SectionBadge,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
  cn,
} from '@bocam/ui-core';
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCheckCircle2,
  IconClock,
  IconFileText,
  IconPackage,
  IconPlus,
  IconScale,
  IconSearch,
  IconSend,
  IconShoppingCart,
  IconTrash2,
  IconUpload,
  IconX,
} from '../components/Icons';
import { SlidePanel, SubmitButton } from '../components/SlidePanel';
import { TableScrollShadow } from '../components/TableScrollShadow';
import { leerColumnaCsv, parseCsvOrExcelFile } from '../lib/csvImport';

/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Vista: Compras — Requisiciones + Catálogo de Insumos + Almacén
 * Hito 5 — Catálogo + Almacén (Inventario, Ingresos, Egresos, Traspasos)
 * ---------------------------------------------------------------------------
 */

interface RequisicionItem {
  id: string;
  insumo_id: string | null;
  cantidad: number;
  notas: string | null;
  descripcion_libre: string | null;
  unidad_libre: string | null;
  es_imprevisto: boolean;
  especificacion_marca_modelo?: string | null;
  especificacion_detalle?: string | null;
}

interface Requisicion {
  id: string;
  folio: string;
  fecha: string;
  solicitante: string;
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
  estado: string;
  tipo?: string; // 'NORMAL' | 'IMPREVISTO'
  items?: RequisicionItem[];
  concepto_id?: string | null;
  concepto_clave?: string | null;
  concepto_descripcion?: string | null;
  observaciones?: string | null;
  observaciones_internas?: string | null;
}

interface ConceptoSimpleC {
  id: string;
  clave: string;
  descripcion: string;
  unidad_medida: string;
}

interface Insumo {
  id: string;
  clave: string;
  descripcion: string;
  unidad: string;
  costo: number;
  clase: string;
  especificaciones?: string;
  proveedor_preferido?: string;
  activo?: boolean;
}

type TabId = 'requisiciones' | 'catalogo' | 'proveedores' | 'pendientes-eval' | 'pendientes-gt' | 'ordenes-compra' | 'trazabilidad' | 'admin-purga';

interface OrdenCompraListItem {
  id_orden: string;
  codigo: string;
  estado: string;
  fecha_emision: string;
  total: number | string;
  enviada_proveedor_at: string | null;
  enviada_proveedor_email: string | null;
  proveedor: { razon_social: string };
}

// ── Herramientas de Administrador — purga de datos de prueba ────────────────
interface PurgaRequisicionItem { id: string; codigo: string; estado: string; fecha_solicitud: string; }
interface PurgaOrdenCompraItem { id: string; codigo: string; estado: string; total: number; fecha_emision: string; proveedor: string; }
interface PurgaProveedorItem { id: string; razon_social: string; rfc_tax_id: string; estatus: string; }
interface PurgaResumen { requisiciones: PurgaRequisicionItem[]; ordenes_compra: PurgaOrdenCompraItem[]; proveedores: PurgaProveedorItem[]; }
interface PurgaBloqueoDetalle { entidad: string; id: string; bloqueos: { tipo: string; cantidad: number }[]; }

interface TrazabilidadMaterial {
  insumo_id: string | null;
  descripcion_libre: string | null;
  unidad_libre: string | null;
  cantidad_presupuestada: number;
  cantidad_requisicionada: number;
  cantidad_oc_emitida: number;
  cantidad_surtida: number;
  monto_oc_emitida: number;
  pct_avance_req: number | null;
  pct_avance_oc: number | null;
  semaforo: 'ROJO' | 'AMARILLO' | 'VERDE' | 'EXTRA';
  es_extra: boolean;
  tiene_justificacion: boolean;
  justificaciones: string[];
  extras_asignados: { concepto_id: string; concepto_clave: string; concepto_descripcion: string; monto_extra: number; asignacion_id: string; item_id: string }[];
  items_ids: string[];
}

interface AlertaCotizacion {
  solicitud_id: string;
  requisicion_id: string;
  requisicion_codigo: string;
  fecha_limite: string;
  dias_retraso: number;
  proveedores_pendientes: string[];
}

interface ScpEntry {
  id_scp: string;
  proveedor_id: string;
  proveedor_nombre: string;
  estado: 'PENDIENTE' | 'RESPONDIO' | 'DECLINO';
  pdf_nombre: string | null;
  notas_proveedor: string | null;
  fecha_respuesta: string | null;
}

interface SolicitudCotizacion {
  id_solicitud: string;
  requisicion_id: string;
  dias_habiles: number;
  fecha_solicitud: string;
  fecha_limite: string;
  notas: string | null;
  dias_habiles_restantes: number;
  alerta_plazo: boolean;
  proveedores: ScpEntry[];
}

interface ProveedorCatalogo {
  id_proveedor: string;
  rfc_tax_id: string;
  razon_social: string;
  email_contacto?: string;
  telefono?: string;
  estatus: string;
  ciudad?: string;
  tipo_ubicacion: string;
  entrega_en_sitio: boolean;
  estatus_credito: string;
  limite_credito?: number;
  // Condiciones de crédito — atributo fijo del catálogo, ver
  // openspec/changes/evaluacion-economica-gt-por-proveedor.
  ofrece_credito?: boolean;
  dias_credito?: number;
  tipo_proveedor: string;
  calificacion_desempeno?: number;
}

const PROVEEDOR_FORM_EMPTY = {
  rfc_tax_id: '', razon_social: '', email_contacto: '', telefono: '',
  estatus: 'ACTIVO', ciudad: '', tipo_ubicacion: 'LOCAL', entrega_en_sitio: false,
  estatus_credito: 'ACTIVO', limite_credito: '', ofrece_credito: false, dias_credito: '',
  tipo_proveedor: 'NACIONAL', calificacion_desempeno: '',
};

// ─── Importación masiva de Proveedores (CSV/Excel) ────────────────────────────
// Mismas reglas que POST /proveedores en apps/compras/src/main.ts:1817-1822.
interface ProveedorImportRow {
  rfc_tax_id: string;
  razon_social: string;
  email_contacto: string;
  telefono: string;
  tipo_proveedor: string;
  calificacion_desempeno: string;
  _valido: boolean;
  _error?: string;
}

// Validación cliente-side equivalente a la del backend — solo para la vista
// previa; el backend re-valida y es la fuente de verdad del resultado.
function construirPreviewImportProveedores(rows: Record<string, string>[]): ProveedorImportRow[] {
  const ocurrenciasPorRfc = new Map<string, number>();
  rows.forEach(row => {
    const rfc = leerColumnaCsv(row, 'rfc_tax_id', 'rfc').toUpperCase();
    if (!rfc) return;
    ocurrenciasPorRfc.set(rfc, (ocurrenciasPorRfc.get(rfc) || 0) + 1);
  });

  return rows.map(row => {
    const rfc_tax_id = leerColumnaCsv(row, 'rfc_tax_id', 'rfc');
    const razon_social = leerColumnaCsv(row, 'razon_social', 'nombre');
    const email_contacto = leerColumnaCsv(row, 'email_contacto', 'email');
    const telefono = leerColumnaCsv(row, 'telefono');
    const tipo_proveedor = leerColumnaCsv(row, 'tipo_proveedor');
    const calificacion_desempeno = leerColumnaCsv(row, 'calificacion_desempeno', 'calificacion');

    const errores: string[] = [];
    if (!rfc_tax_id) errores.push('sin rfc_tax_id');
    if (!razon_social) errores.push('sin razon_social');
    if (calificacion_desempeno) {
      const cal = Number(calificacion_desempeno);
      if (Number.isNaN(cal) || cal < 0 || cal > 5) errores.push('calificacion_desempeno inválida');
    }
    if (rfc_tax_id && (ocurrenciasPorRfc.get(rfc_tax_id.toUpperCase()) || 0) > 1) {
      errores.push('RFC duplicado en el archivo');
    }

    return {
      rfc_tax_id, razon_social, email_contacto, telefono, tipo_proveedor, calificacion_desempeno,
      _valido: errores.length === 0,
      _error: errores.length ? errores.join(', ') : undefined,
    };
  });
}

// ─── Colores por categoría ───────────────────────────────────────────────────
const CLASE_STYLE: Record<string, { badge: string; chip: string; label: string }> = {
  MATERIALES:   { badge: 'border-blue-500/20 bg-blue-500/10 text-blue-700',      chip: 'bg-blue-500/10 text-blue-700',      label: 'Materiales' },
  EQUIPOS:      { badge: 'border-violet-500/20 bg-violet-500/10 text-violet-700', chip: 'bg-violet-500/10 text-violet-700',  label: 'Equipos' },
  MANO_OBRA:    { badge: 'border-amber-500/20 bg-amber-500/10 text-amber-700',    chip: 'bg-amber-500/10 text-amber-700',    label: 'Mano de Obra' },
  SUBCONTRATOS: { badge: 'border-teal-500/20 bg-teal-500/10 text-teal-700',       chip: 'bg-teal-500/10 text-teal-700',      label: 'Subcontratos' },
};
const DEFAULT_CLASE = { badge: 'border-border bg-muted text-muted-foreground', chip: 'bg-muted text-muted-foreground', label: 'Otro' };

const CLASES = Object.keys(CLASE_STYLE);

// Mapeo bidireccional entre etiquetas de clase locales y enum TipoInsumo de gerencia-tecnica
const GT_TIPO_TO_CLASE: Record<string, string> = {
  MATERIAL:    'MATERIALES',
  MANO_DE_OBRA: 'MANO_OBRA',
  EQUIPO:      'EQUIPOS',
  SUBCONTRATO: 'SUBCONTRATOS',
  INDIRECTO:   'INDIRECTO',
};
const CLASE_TO_GT_TIPO: Record<string, string> = {
  MATERIALES:  'MATERIAL',
  MANO_OBRA:   'MANO_DE_OBRA',
  EQUIPOS:     'EQUIPO',
  SUBCONTRATOS: 'SUBCONTRATO',
  INDIRECTO:   'INDIRECTO',
};
const UNIDADES = ['PZA', 'SAC', 'M3', 'M2', 'ML', 'KG', 'TON', 'LT', 'CUB', 'DIA', 'SEM', 'MES', 'PTO', 'JGO'];

export const ComprasView: React.FC<{ activeSubView?: string }> = ({ activeSubView }) => {
  const { tenant, user, currentProjectId } = useTenant();
  const isDemo = tenant?.id === 'iretum-demo';
  const { notify } = useNotification();

  // Roles del usuario actual — los roles están en user.role, NO en tenant.roles
  const roles: string[] = user?.role ?? [];
  const isProcurement = roles.some(r => ['procurement', 'admin', 'superintendent'].includes(r));
  // El endpoint de importación masiva de proveedores NO incluye 'superintendent'
  // (mismos roles que POST /proveedores) — a diferencia de isProcurement.
  const puedeImportarProveedores = roles.some(r => ['procurement', 'admin'].includes(r));

  // ── Importación masiva de Proveedores ─────────────────────────────────────
  const fileImportProveedoresRef = useRef<HTMLInputElement>(null);
  const [panelImportarProveedores, setPanelImportarProveedores] = useState(false);
  const [archivoImportProveedoresNombre, setArchivoImportProveedoresNombre] = useState('');
  const [filasImportProveedores, setFilasImportProveedores] = useState<ProveedorImportRow[]>([]);
  const [parseImportProveedoresError, setParseImportProveedoresError] = useState<string | null>(null);
  const [importandoProveedores, setImportandoProveedores] = useState(false);
  const [resultadoImportProveedores, setResultadoImportProveedores] = useState<{ creados: number; errores: { fila: number; motivo: string }[] } | null>(null);

  // ─── State ────────────────────────────────────────────────────────────────
  const activeTab: TabId = (activeSubView as TabId) || 'requisiciones';
  const [requisiciones, setRequisiciones] = useState<Requisicion[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [expandedReqIds, setExpandedReqIds] = useState<Set<string>>(new Set());
  const [comparativas, setComparativas] = useState<ComparativaLocal[]>([]);
  const [pendientesEval, setPendientesEval] = useState<ComparativaLocal[]>([]);
  const [pendientesGT, setPendientesGT] = useState<ComparativaLocal[]>([]);
  const [filtroEstadoCiclo, setFiltroEstadoCiclo] = useState<string>('todos');
  const [proveedoresList, setProveedoresList] = useState<ProveedorCatalogo[]>([]);
  const [proveedoresSearch, setProveedoresSearch] = useState('');
  const [showProveedorForm, setShowProveedorForm] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState<ProveedorCatalogo | null>(null);
  const [proveedorForm, setProveedorForm] = useState(PROVEEDOR_FORM_EMPTY);
  const [docsProveedorId, setDocsProveedorId] = useState<string | null>(null);
  const [docsProveedor, setDocsProveedor] = useState<Record<string, any[]>>({});
  const [docsLoading, setDocsLoading] = useState(false);
  const [docTipoUpload, setDocTipoUpload] = useState('OTRO');
  const docFileRef = useRef<HTMLInputElement>(null);
  // ── Calificaciones de proveedor ───────────────────────────────────────────
  const [calHistorialId, setCalHistorialId] = useState<string | null>(null);
  const [calHistorial, setCalHistorial] = useState<Record<string, any[]>>({});
  const [calPromedios, setCalPromedios] = useState<Record<string, number | null>>({});
  const [calTotales, setCalTotales] = useState<Record<string, number>>({});
  const [calLoading, setCalLoading] = useState(false);
  const [calPuntuacion, setCalPuntuacion] = useState('');
  const [calComentario, setCalComentario] = useState('');
  const [calSubmitting, setCalSubmitting] = useState(false);

  const [activeReqId, setActiveReqId] = useState<string | null>(null);
  const [comparativaModo, setComparativaModo] = useState<'compras' | 'residente'>('compras');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aprobando, setAprobando] = useState<string | null>(null);

  // ── Trazabilidad de Materiales ───────────────────────────────────────────
  const [trazabilidad, setTrazabilidad] = useState<TrazabilidadMaterial[]>([]);
  const [loadingTraz, setLoadingTraz] = useState(false);
  const [trazFilter, setTrazFilter] = useState<'TODOS' | 'ROJO' | 'AMARILLO' | 'VERDE' | 'EXTRA'>('TODOS');
  const [trazSearch, setTrazSearch] = useState('');
  const [expandedTrazId, setExpandedTrazId] = useState<string | null>(null);
  const [asignacionPanel, setAsignacionPanel] = useState<{ itemId: string; insumoDesc: string } | null>(null);
  const [asignForm, setAsignForm] = useState({ concepto_id: '', concepto_clave: '', concepto_descripcion: '', monto_extra: '' });
  const [asignSubmitting, setAsignSubmitting] = useState(false);
  const [expandedConceptoId, setExpandedConceptoId] = useState<string | null>(null);

  // ── Órdenes de Compra — envío por correo (ver capability envio-oc-proveedor) ──
  const [ordenesCompra, setOrdenesCompra] = useState<OrdenCompraListItem[]>([]);
  const [loadingOc, setLoadingOc] = useState(false);
  const [ocSeleccionadas, setOcSeleccionadas] = useState<Set<string>>(new Set());
  const [enviandoOc, setEnviandoOc] = useState(false);

  // ── Herramientas de Administrador — purga de datos de prueba (admin-only) ──
  const isAdminRole = roles.includes('admin');
  const [purgaResumen, setPurgaResumen] = useState<PurgaResumen>({ requisiciones: [], ordenes_compra: [], proveedores: [] });
  const [loadingPurga, setLoadingPurga] = useState(false);
  const [purgaSelReq, setPurgaSelReq] = useState<Set<string>>(new Set());
  const [purgaSelOc, setPurgaSelOc] = useState<Set<string>>(new Set());
  const [purgaSelProv, setPurgaSelProv] = useState<Set<string>>(new Set());
  const [showPurgaModal, setShowPurgaModal] = useState(false);
  const [purgaConfirmText, setPurgaConfirmText] = useState('');
  const [purgando, setPurgando] = useState(false);
  const [purgaBloqueo, setPurgaBloqueo] = useState<PurgaBloqueoDetalle | null>(null);

  // ── Widget Resumen Presupuestal (Task 7) ─────────────────────────────────
  interface ResumenCP {
    total_presupuestado: number; total_comprometido: number;
    total_pagado: number; total_disponible: number; pct_ejercido: number;
    parcial: boolean;
  }
  const [cpResumen, setCpResumen] = useState<ResumenCP | null>(null);
  const [cpResumenLoading, setCpResumenLoading] = useState(false);

  const loadCpResumen = async () => {
    const proyectoId = currentProjectId || user?.projects?.[0]?.id;
    if (!proyectoId) return;
    setCpResumenLoading(true);
    try {
      const res = await api.get(`/api/v1/compras/reportes/control-presupuestal?proyectoId=${proyectoId}`);
      const d = res.data.data ?? res.data;
      setCpResumen({
        total_presupuestado: d.total_presupuestado,
        total_comprometido:  d.total_comprometido,
        total_pagado:        d.total_pagado,
        total_disponible:    d.total_disponible,
        pct_ejercido:        d.pct_ejercido,
        parcial:             d.parcial,
      });
    } catch { /* silencioso — widget opcional */ }
    finally { setCpResumenLoading(false); }
  };

  // ── Solicitud de Cotización ──────────────────────────────────────────────
  const [solicitudesMap, setSolicitudesMap] = useState<Record<string, SolicitudCotizacion>>({});
  const [alertasCotizacion, setAlertasCotizacion] = useState<AlertaCotizacion[]>([]);
  const [solicitudPanelReqId, setSolicitudPanelReqId] = useState<string | null>(null);
  const [editandoProveedores, setEditandoProveedores] = useState(false);
  const [solicitudForm, setSolicitudForm] = useState<{ dias_habiles: number; notas: string; provsSeleccionados: string[]; tema: 'claro' | 'oscuro' }>({ dias_habiles: 3, notas: '', provsSeleccionados: [], tema: 'claro' });
  const [solicitudSubmitting, setSolicitudSubmitting] = useState(false);
  // Advertencia de stock antes de cotizar externo (ver
  // openspec/changes/validar-stock-antes-cotizar-externo) — null mientras
  // carga o si no aplica, [] si no hay insumos con stock.
  const [stockAdvertencia, setStockAdvertencia] = useState<Array<{ insumo_id: string; cantidad_solicitada: number; stock_disponible: number }> | null>(null);
  const [stockConfirmado, setStockConfirmado] = useState(false);

  // Panels
  const [showReqForm, setShowReqForm] = useState(false);
  const [showInsumoForm, setShowInsumoForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Catálogo — búsqueda y filtro
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogClase, setCatalogClase] = useState('');

  // Requisición form
  const [reqForm, setReqForm] = useState({
    tipo: 'NORMAL',
    prioridad: 'MEDIA',
    fecha_requerida: '',
    notas: '',
    items: [{ insumo_id: '', insumo_label: '', cantidad: '', notas: '', descripcion_libre: '', unidad_libre: 'PZA' }],
  });

  // Insumo form
  const [insumoForm, setInsumoForm] = useState({
    clave: '', descripcion: '', unidad: 'PZA', clase: 'MATERIALES',
    costo: '', especificaciones: '', proveedor_preferido: '',
  });

  // ── Partida / concepto para nueva req ────────────────────────────────────
  const [conceptosCompras, setConceptosCompras] = useState<ConceptoSimpleC[]>([]);
  const [reqConceptoId, setReqConceptoId] = useState<string | null>(null);
  const [reqConceptoClave, setReqConceptoClave] = useState('');
  const [reqConceptoDesc, setReqConceptoDesc] = useState('');
  const [reqConceptoSearch, setReqConceptoSearch] = useState('');
  const [reqFiltroConcepto, setReqFiltroConcepto] = useState('');
  const [dashboardData, setDashboardData] = useState<{
    kpis: { total_requisiciones: number; pendiente_aprobacion: number; lista_cotizar: number; cotizando: number; pendiente_gt: number; ocs_emitidas: number; ocs_pendientes_recibir: number };
    alertas: Array<{ tipo: string; req_id: string; folio: string; dias_vencida: number }>;
    actividad_reciente: Array<{ id: string; folio: string; concepto: string; estado: string; updated_at: string }>;
  } | null>(null);
  const [gtDashboardData, setGtDashboardData] = useState<{
    pendientes_revision: number; en_evaluacion_tecnica: number; aprobados_este_mes: number;
    monto_comprometido: number;
    alertas: Array<{ comparativa_id: string; folio: string; proyecto: string; dias_en_espera: number; mensaje: string }>;
    reciente: Array<{ comparativa_id: string; folio: string; proyecto: string; estado: string; fecha: string }>;
    parcial: boolean;
  } | null>(null);

  // Búsqueda de insumo por item de requisición
  const [itemSearch, setItemSearch] = useState<string[]>([]);
  const [itemDropdown, setItemDropdown] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      setLoading(true);
      if (isDemo) {
        setRequisiciones(DEMO_REQUISICIONES as Requisicion[]);
        setInsumos(DEMO_INSUMOS as Insumo[]);
        const demoComps = DEMO_COMPARATIVAS as unknown as ComparativaLocal[];
        setComparativas(demoComps);
        setPendientesEval(demoComps.filter(c => c.estado === 'EN_EVALUACION_TECNICA'));
        setPendientesGT(demoComps.filter(c => c.estado === 'EN_APROBACION_GT'));
        return;
      }
      const [reqRes, insRes, compRes, evalRes, gtRes, provRes, alertasRes, presRes, dashRes] = await Promise.allSettled([
        api.get('/api/v1/compras/requisiciones'),
        api.get('/api/v1/compras/catalog/insumos'),
        api.get('/api/v1/compras/comparativas'),
        // Bandejas de aprobación (pueden fallar por rol — ignorar 403)
        api.get('/api/v1/compras/comparativas/pendientes-evaluacion').catch(() => null),
        api.get('/api/v1/compras/comparativas/pendientes-gt').catch(() => null),
        api.get('/api/v1/compras/proveedores').catch(() => null),
        api.get('/api/v1/compras/alertas/cotizacion-pendiente').catch(() => null),
        api.get('/api/v1/compras/presupuesto-activo').catch(() => null),
        api.get('/api/v1/compras/dashboard').catch(() => null),
      ]);
      // Colectar datos normalizados para las dependencias entre entidades
      let insumosNormalizados: Insumo[] = [];
      let requisicionesNormalizadas: Requisicion[] = [];

      if (insRes.status === 'fulfilled') {
        const raw: any[] = insRes.value.data?.data || [];
        insumosNormalizados = raw.map((i) => ({
          id:          i.id,
          clave:       i.clave,
          descripcion: i.descripcion,
          unidad:      i.unidad_medida ?? i.unidad ?? '',
          costo:       Number(i.costo_base ?? i.costo ?? 0),
          clase:       GT_TIPO_TO_CLASE[i.tipo_insumo] ?? i.tipo_insumo ?? '',
          activo:      i.activo,
        }));
        setInsumos(insumosNormalizados);
      }

      if (reqRes.status === 'fulfilled') {
        const rawReqs: any[] = reqRes.value.data?.data || [];
        requisicionesNormalizadas = rawReqs.map(r => ({
          id:          r.id_requisicion ?? r.id,
          folio:       r.codigo ?? r.folio,
          fecha:       r.fecha_solicitud ?? r.fecha,
          solicitante: r.solicitante_nombre ?? r.solicitante_id ?? r.solicitante ?? '—',
          prioridad:   r.prioridad ?? 'NORMAL',
          estado:      r.estado,
          tipo:        r.tipo,
          concepto_id:           r.concepto_id ?? null,
          concepto_clave:        r.concepto_clave ?? null,
          concepto_descripcion:  r.concepto_descripcion ?? null,
          observaciones:         r.observaciones ?? null,
          observaciones_internas: r.observaciones_internas ?? null,
          items:       (r.items || []).map((it: any) => ({
            id:               it.id_item ?? it.id,
            insumo_id:        it.insumo_id,
            cantidad:         Number(it.cantidad),
            notas:            it.notas,
            descripcion_libre: it.descripcion_libre,
            unidad_libre:     it.unidad_libre,
            es_imprevisto:    Boolean(it.es_imprevisto),
          })),
        }));
        setRequisiciones(requisicionesNormalizadas);

        // Precargar Solicitud de Cotización de las requisiciones APROBADA — sin esto,
        // el botón "Crear Cuadro Comparativo" depende de que el usuario haya abierto
        // "Ver Solicitud de Cotización" en la sesión actual (solicitudesMap solo se
        // llena bajo demanda), y desaparece tras recargar/volver a la vista aunque los
        // proveedores ya hayan respondido. Ver openspec/changes/precargar-solicitud-cotizacion.
        if (!isDemo) {
          const aprobadas = requisicionesNormalizadas.filter(r => r.estado === 'APROBADA');
          void Promise.allSettled(aprobadas.map(r => loadSolicitud(r.id)));
        }
      }

      // Respaldo de descripción/unidad para líneas sin insumo_id (texto libre) —
      // GET /comparativas no incluye datos del insumo de catálogo para ellas, así
      // que se toman de la requisición ya cargada (mismo criterio que
      // buildLineasFromReq). Ver openspec/changes/fix-evaluacion-tecnica-admin-y-descripcion.
      const reqItemsMap = new Map(
        requisicionesNormalizadas.flatMap(r => (r.items ?? []).map(it => [it.id, it] as const))
      );

      // Normalizar comparativas: backend usa id_cuadro + detalles, frontend usa id + lineas
      const normalizeComp = (c: any): ComparativaLocal => {
        const detalles: any[] = c.detalles ?? [];
        // Extraer proveedores únicos — incluye condiciones de crédito (atributo fijo del
        // catálogo, no de la cotización). Ver
        // openspec/changes/evaluacion-economica-gt-por-proveedor.
        const provMap = new Map<string, { nombre: string; ofrece_credito?: boolean; dias_credito?: number | null }>();
        detalles.forEach(d => provMap.set(d.proveedor_id, {
          nombre: d.proveedor?.razon_social ?? '—',
          ofrece_credito: d.proveedor?.ofrece_credito ?? false,
          dias_credito: d.proveedor?.dias_credito ?? null,
        }));
        const proveedores = Array.from(provMap.entries()).map(([id, p]) => ({ id, nombre: p.nombre, ofrece_credito: p.ofrece_credito, dias_credito: p.dias_credito }));
        // Agrupar por insumo_id (o detalle_req_id para ítems de texto libre sin
        // catálogo, ver openspec/changes/cotizar-items-texto-libre-comparativa)
        const lineaMap = new Map<string, import('../components/ComparativaDetail').CotizacionLinea>();
        detalles.forEach(d => {
          const lineaKey: string = d.insumo_id ?? d.detalle_req_id;
          const info = d.insumo_id ? insumosNormalizados.find(i => i.id === d.insumo_id) : undefined;
          const reqItem = !d.insumo_id && d.detalle_req_id ? reqItemsMap.get(d.detalle_req_id) : undefined;
          if (!lineaMap.has(lineaKey)) {
            lineaMap.set(lineaKey, {
              id:                  d.id_detalle,
              insumo_id:           d.insumo_id,
              detalle_req_id:      d.detalle_req_id ?? null,
              insumo_clave:        info?.clave ?? '—',
              insumo_descripcion:  info?.descripcion ?? reqItem?.descripcion_libre ?? '—',
              insumo_unidad:       info?.unidad ?? reqItem?.unidad_libre ?? '—',
              cantidad:            Number(d.cantidad ?? 0),
              precios:             {},
              fechasEntrega:       {},
              especOfrecida:       {},
              ganador:             d.es_ganador ? d.proveedor_id : null,
              evaluacion_tecnica:  d.evaluacion_tecnica ?? 'PENDIENTE',
              comentario_tecnico:  d.comentario_tecnico ?? undefined,
              evaluacionesPorProveedor: {},
              aprobacion_gt:       d.aprobacion_gt ?? 'PENDIENTE',
              comentario_gt:       d.comentario_gt ?? undefined,
              aprobacionesGtPorProveedor: {},
            });
          }
          const linea = lineaMap.get(lineaKey)!;
          linea.precios[d.proveedor_id] = String(d.precio_ofertado);
          linea.fechasEntrega[d.proveedor_id] = d.fecha_entrega_estimada ? String(d.fecha_entrega_estimada).slice(0, 10) : null;
          linea.especOfrecida[d.proveedor_id] = d.valor_ofrecido_spec ?? '';
          if (d.es_ganador) linea.ganador = d.proveedor_id;
          // Evaluación técnica por proveedor — cada ComparativaDetalle es un
          // (línea, proveedor) independiente, no colapsar al primero. Ver
          // openspec/changes/fix-evaluacion-tecnica-por-proveedor.
          linea.evaluacionesPorProveedor![d.proveedor_id] = {
            id_detalle:          d.id_detalle,
            evaluacion_tecnica:  d.evaluacion_tecnica ?? 'PENDIENTE',
            comentario_tecnico:  d.comentario_tecnico ?? undefined,
            pregunta_residente:  d.pregunta_residente ?? null,
          };
          // Aprobación GT por proveedor — mismo patrón. Ver
          // openspec/changes/evaluacion-economica-gt-por-proveedor.
          linea.aprobacionesGtPorProveedor![d.proveedor_id] = {
            id_detalle:    d.id_detalle,
            aprobacion_gt: d.aprobacion_gt ?? 'PENDIENTE',
            comentario_gt: d.comentario_gt ?? undefined,
            pregunta_gt:   d.pregunta_gt ?? null,
          };
        });
        return {
          id:             c.id_cuadro ?? c.id,
          requisicion_id: c.requisicion_id,
          estado:         c.estado,
          proveedores,
          lineas:         Array.from(lineaMap.values()),
          ordenes_compra: [],
        };
      };

      if (compRes.status === 'fulfilled') {
        const raw: any[] = compRes.value.data?.data || [];
        setComparativas(raw.map(normalizeComp));
      }
      if (evalRes.status === 'fulfilled' && evalRes.value) {
        const raw: any[] = evalRes.value.data?.data || [];
        setPendientesEval(raw.map(normalizeComp));
      }
      if (gtRes.status === 'fulfilled' && gtRes.value) {
        const raw: any[] = gtRes.value.data?.data || [];
        setPendientesGT(raw.map(normalizeComp));
      }
      if (provRes.status === 'fulfilled' && provRes.value) {
        setProveedoresList(provRes.value.data?.data || []);
      }
      if (alertasRes.status === 'fulfilled' && alertasRes.value) {
        setAlertasCotizacion(alertasRes.value.data?.data || []);
      }
      if (presRes.status === 'fulfilled' && presRes.value) {
        const conceptosRaw: any[] = presRes.value.data?.data?.conceptos ?? [];
        setConceptosCompras(conceptosRaw.map((c: any) => ({
          id:           c.id,
          clave:        c.clave,
          descripcion:  c.descripcion,
          unidad_medida: c.unidad_medida,
        })));
      }
      if (dashRes.status === 'fulfilled' && dashRes.value?.data?.data) {
        const dashData = dashRes.value.data.data;
        setDashboardData(dashData);
        if (dashData.gt_dashboard) {
          setGtDashboardData(dashData.gt_dashboard);
        }
      }
    } catch {
      setError('Error al conectar con el modulo de Compras.');
    } finally {
      setLoading(false);
    }
  };

  // Cambiar de proyecto activo debe regresar siempre a la lista de requisiciones —
  // activeReqId puede apuntar a un requisicion_id que no existe en los datos del
  // proyecto nuevo, dejando la vista atorada en una pantalla en blanco. Ver
  // openspec/changes/fix-estado-detalle-al-cambiar-proyecto.
  useEffect(() => { setActiveReqId(null); setComparativaModo('compras'); }, [currentProjectId]);
  useEffect(() => { fetchData(); }, [currentProjectId]);
  useEffect(() => { if (activeTab === 'trazabilidad') { loadTrazabilidad(); void loadCpResumen(); } }, [activeTab, currentProjectId]);
  useEffect(() => { if (activeTab === 'ordenes-compra') { void loadOrdenesCompra(); } }, [activeTab, currentProjectId]);
  useEffect(() => { if (activeTab === 'admin-purga' && isAdminRole) { void loadPurgaResumen(); } }, [activeTab, currentProjectId, isAdminRole]);

  // ── Importación masiva de Proveedores ─────────────────────────────────────
  const handleImportProveedoresFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setArchivoImportProveedoresNombre(file.name);
    setParseImportProveedoresError(null);
    setResultadoImportProveedores(null);
    setPanelImportarProveedores(true);

    try {
      const rows = await parseCsvOrExcelFile(file);
      setFilasImportProveedores(construirPreviewImportProveedores(rows));
    } catch (err: any) {
      setParseImportProveedoresError(err.message || 'Error al leer el archivo.');
      setFilasImportProveedores([]);
    }
  };

  const handleConfirmarImportProveedores = async () => {
    setImportandoProveedores(true);
    try {
      const registros = filasImportProveedores.map(({ rfc_tax_id, razon_social, email_contacto, telefono, tipo_proveedor, calificacion_desempeno }) => ({
        rfc_tax_id,
        razon_social,
        ...(email_contacto ? { email_contacto } : {}),
        ...(telefono ? { telefono } : {}),
        ...(tipo_proveedor ? { tipo_proveedor } : {}),
        ...(calificacion_desempeno ? { calificacion_desempeno: Number(calificacion_desempeno) } : {}),
      }));
      const r = await comprasApi.importarProveedoresLote(registros);
      setResultadoImportProveedores(r.data.data);
      if (r.data.data.creados > 0) {
        setProveedoresList(list => [...list, ...r.data.data.proveedores]);
      }
    } catch (err: any) {
      setParseImportProveedoresError(err.response?.data?.message || 'Error al importar el lote.');
    } finally {
      setImportandoProveedores(false);
    }
  };

  const handleCerrarPanelImportarProveedores = () => {
    setPanelImportarProveedores(false);
    setArchivoImportProveedoresNombre('');
    setFilasImportProveedores([]);
    setParseImportProveedoresError(null);
    setResultadoImportProveedores(null);
  };

  // Cerrar dropdown al hacer clic afuera (requisición)
  useEffect(() => {
    if (itemDropdown === null) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setItemDropdown(null);
      }
    };
    setTimeout(() => window.addEventListener('mousedown', handler), 0);
    return () => window.removeEventListener('mousedown', handler);
  }, [itemDropdown]);

  // ─── Computed ─────────────────────────────────────────────────────────────
  const insumosFiltrados = useMemo(() => {
    let list = insumos;
    if (catalogClase) list = list.filter(i => i.clase === catalogClase);
    if (catalogSearch.trim()) {
      const q = catalogSearch.toLowerCase();
      list = list.filter(i =>
        i.clave.toLowerCase().includes(q) ||
        i.descripcion.toLowerCase().includes(q) ||
        i.unidad.toLowerCase().includes(q)
      );
    }
    return list;
  }, [insumos, catalogSearch, catalogClase]);

  const claseCount = useMemo(() =>
    CLASES.reduce((acc, c) => ({ ...acc, [c]: insumos.filter(i => i.clase === c).length }), {} as Record<string, number>),
    [insumos]
  );

  const alertasReqIds = useMemo(
    () => new Set(alertasCotizacion.map(a => a.requisicion_id)),
    [alertasCotizacion]
  );

  const insumoById = useMemo(
    () => new Map(insumos.map(i => [i.id, i])),
    [insumos]
  );

  const toggleReqExpanded = (reqId: string) => {
    setExpandedReqIds(prev => {
      const next = new Set(prev);
      if (next.has(reqId)) next.delete(reqId); else next.add(reqId);
      return next;
    });
  };

  const reqPendientes = requisiciones.filter(r => r.estado === 'PENDIENTE').length;

  // ─── Handlers requisición ─────────────────────────────────────────────────
  const handleSubmitRequisicion = async () => {
    const isImprevisto = reqForm.tipo === 'IMPREVISTO';
    const validItems = isImprevisto
      ? reqForm.items.filter(i => i.descripcion_libre.trim() && i.cantidad)
      : reqForm.items.filter(i => i.insumo_id && i.cantidad);
    if (validItems.length === 0) {
      alert(isImprevisto ? 'Agrega al menos un ítem con descripción y cantidad.' : 'Agrega al menos un insumo con cantidad.');
      return;
    }
    if (!reqConceptoId) {
      alert('Selecciona la partida del catálogo antes de crear la requisición.');
      return;
    }
    if (isDemo) {
      const folio = `REQ-${new Date().getFullYear()}-${String(requisiciones.length + 41).padStart(3, '0')}`;
      notify({
        type: 'success',
        title: 'Requisición creada',
        message: `${folio} · ${validItems.length} ítem${validItems.length !== 1 ? 's' : ''} · ${isImprevisto ? 'Imprevisto' : 'Normal'} · Prioridad ${reqForm.prioridad}`,
      });
      setShowReqForm(false);
      resetReqForm();
      return;
    }
    try {
      setFormLoading(true);
      await api.post('/api/v1/compras/requisiciones', {
        tipo:            reqForm.tipo,
        prioridad:       reqForm.prioridad,
        concepto_id:     reqConceptoId,
        observaciones:   reqForm.notas || undefined,
        items: isImprevisto
          ? validItems.map(i => ({
              descripcion_libre: i.descripcion_libre,
              unidad_libre:      i.unidad_libre || 'PZA',
              cantidad:          Number(i.cantidad),
              notas:             i.notas || undefined,
              es_imprevisto:     true,
            }))
          : validItems.map(i => ({
              insumo_id: i.insumo_id,
              cantidad:  Number(i.cantidad),
              notas:     i.notas || undefined,
            })),
      });
      setShowReqForm(false);
      resetReqForm();
      await fetchData();
    } catch (err: any) {
      alert(`Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setFormLoading(false);
    }
  };

  const resetReqForm = () => {
    setReqForm({ tipo: 'NORMAL', prioridad: 'MEDIA', fecha_requerida: '', notas: '', items: [{ insumo_id: '', insumo_label: '', cantidad: '', notas: '', descripcion_libre: '', unidad_libre: 'PZA' }] });
    setItemSearch([]);
    setItemDropdown(null);
    setReqConceptoId(null);
    setReqConceptoClave('');
    setReqConceptoDesc('');
    setReqConceptoSearch('');
  };

  const addItem = () => {
    setReqForm(f => ({ ...f, items: [...f.items, { insumo_id: '', insumo_label: '', cantidad: '', notas: '', descripcion_libre: '', unidad_libre: 'PZA' }] }));
    setItemSearch(s => [...s, '']);
  };

  const removeItem = (idx: number) => {
    setReqForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
    setItemSearch(s => s.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: string, value: string) => {
    setReqForm(f => {
      const items = [...f.items];
      items[idx] = { ...items[idx], [field]: value };
      return { ...f, items };
    });
  };

  const selectInsumo = (idx: number, insumo: Insumo) => {
    updateItem(idx, 'insumo_id', insumo.id);
    updateItem(idx, 'insumo_label', `${insumo.clave} — ${insumo.descripcion}`);
    setItemSearch(s => { const ns = [...s]; ns[idx] = ''; return ns; });
    setItemDropdown(null);
  };

  const getInsumoSuggestions = (idx: number) => {
    const q = (itemSearch[idx] || '').toLowerCase();
    if (!q) return insumos.slice(0, 8);
    return insumos.filter(i =>
      i.clave.toLowerCase().includes(q) || i.descripcion.toLowerCase().includes(q)
    ).slice(0, 8);
  };

  // ─── Handlers catálogo ───────────────────────────────────────────────────
  const handleSubmitInsumo = async () => {
    if (!insumoForm.clave || !insumoForm.descripcion) { alert('Clave y descripción son requeridos.'); return; }
    if (isDemo) { setShowInsumoForm(false); resetInsumoForm(); return; }
    try {
      setFormLoading(true);
      await api.post('/api/v1/compras/catalog/insumos', {
        clave:         insumoForm.clave,
        descripcion:   insumoForm.descripcion,
        unidad_medida: insumoForm.unidad,
        tipo_insumo:   CLASE_TO_GT_TIPO[insumoForm.clase] ?? insumoForm.clase,
        costo_base:    Number(insumoForm.costo) || 0,
      });
      setShowInsumoForm(false);
      resetInsumoForm();
      await fetchData();
    } catch (err: any) {
      alert(`Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setFormLoading(false);
    }
  };

  const resetInsumoForm = () =>
    setInsumoForm({ clave: '', descripcion: '', unidad: 'PZA', clase: 'MATERIALES', costo: '', especificaciones: '', proveedor_preferido: '' });

  const fetchCalHistorial = async (proveedorId: string) => {
    setCalLoading(true);
    try {
      const res = await api.get(`/api/v1/compras/proveedores/${proveedorId}/calificaciones`);
      const d = res.data.data;
      setCalHistorial(prev => ({ ...prev, [proveedorId]: d.calificaciones || [] }));
      setCalPromedios(prev => ({ ...prev, [proveedorId]: d.promedio_global ?? null }));
      setCalTotales(prev => ({ ...prev, [proveedorId]: d.total ?? 0 }));
      // Precargar formulario si ya existe calificación para proyecto actual
      const existing = (d.calificaciones as any[]).find((c: any) => c.proyecto_id === user?.projects?.[0]?.id);
      if (existing) {
        setCalPuntuacion(String(existing.puntuacion));
        setCalComentario(existing.comentario ?? '');
      } else {
        setCalPuntuacion('');
        setCalComentario('');
      }
    } catch {
      setCalHistorial(prev => ({ ...prev, [proveedorId]: [] }));
    } finally {
      setCalLoading(false);
    }
  };

  const fetchDocsProveedor = async (proveedorId: string) => {
    setDocsLoading(true);
    try {
      const res = await api.get(`/api/v1/compras/proveedores/${proveedorId}/documentos`);
      setDocsProveedor(prev => ({ ...prev, [proveedorId]: res.data.data || [] }));
    } catch {
      setDocsProveedor(prev => ({ ...prev, [proveedorId]: [] }));
    } finally {
      setDocsLoading(false);
    }
  };

  // ─── Handlers comparativa ────────────────────────────────────────────────────
  const openComparativa = async (req: Requisicion) => {
    const existing = comparativas.find(c => c.requisicion_id === req.id);

    if (existing) {
      // La comparativa ya existe en estado local — abrir directamente
      // Si las lineas están vacías pero la req tiene items (posible si el cuadro existe en BD sin detalles),
      // pre-poblar con los items de la req para que Compras sepa qué cotizar
      const lineasFromReq = (existing.lineas.length === 0 && (req.items?.length ?? 0) > 0)
        ? buildLineasFromReq(req)
        : null;

      // Re-fusionar proveedores con la Solicitud de Cotización: `proveedores` se deriva de
      // ComparativaDetalle (solo existe con precios ya capturados), así que al recargar la
      // página o reabrir el cuadro se pierde el prepoblado si no se repite este merge aquí.
      let proveedoresFusionados: ComparativaLocal['proveedores'] | null = null;
      if (!isDemo) {
        const solicitud = solicitudesMap[req.id] ?? (await loadSolicitud(req.id));
        if (solicitud) {
          const fusion = mergeProveedoresConSolicitud(
            existing.proveedores,
            solicitud.proveedores.map(p => ({ proveedor_id: p.proveedor_id, proveedor_nombre: p.proveedor_nombre })),
          );
          if (fusion.length !== existing.proveedores.length) {
            proveedoresFusionados = fusion;
          }
        }
      }

      if (lineasFromReq || proveedoresFusionados) {
        setComparativas(prev => prev.map(c =>
          c.requisicion_id === req.id
            ? {
                ...c,
                ...(lineasFromReq ? { lineas: lineasFromReq } : {}),
                ...(proveedoresFusionados ? { proveedores: proveedoresFusionados } : {}),
              }
            : c
        ));
      }
    } else {
      // Crear en backend y pre-poblar lineas desde los items de la requisición
      let backendId = `comp-new-${Date.now()}`;
      if (!isDemo) {
        try {
          const res = await api.post('/api/v1/compras/comparativas', { requisicion_id: req.id });
          backendId = res.data.data?.id_cuadro ?? res.data.data?.id ?? backendId;
        } catch (err: any) {
          // No usar un ID local como si el cuadro existiera — eso deja a Compras
          // trabajando sobre un cuadro fantasma que nunca persiste nada (ver
          // openspec/changes/fix-crear-cuadro-comparativo-500).
          notify({
            type: 'error',
            title: 'No se pudo crear el Cuadro Comparativo',
            message: err?.response?.data?.message || 'Ocurrió un error al crear el cuadro. Intenta de nuevo.',
          });
          return;
        }
      }

      // Pre-poblar proveedores desde la Solicitud de Cotización ya enviada (si existe),
      // para que Compras no tenga que volver a capturarlos manualmente.
      let proveedoresIniciales: ComparativaLocal['proveedores'] = [];
      if (!isDemo) {
        const solicitud = solicitudesMap[req.id] ?? (await loadSolicitud(req.id));
        if (solicitud) {
          proveedoresIniciales = seedProveedoresDesdeSolicitud(
            solicitud.proveedores.map(p => ({ proveedor_id: p.proveedor_id, proveedor_nombre: p.proveedor_nombre }))
          );
        }
      }

      const lineasFromReq = buildLineasFromReq(req);
      const newComp: ComparativaLocal = {
        id: backendId,
        requisicion_id: req.id,
        estado: 'BORRADOR',
        proveedores: proveedoresIniciales,
        lineas: lineasFromReq,
        ordenes_compra: [],
      };
      setComparativas(prev => [...prev, newComp]);
    }
    setActiveReqId(req.id);
  };

  /** Construye CotizacionLineas a partir de los items de una requisición */
  const buildLineasFromReq = (req: Requisicion): import('../components/ComparativaDetail').CotizacionLinea[] => {
    return (req.items ?? []).map(item => {
      const info = insumos.find(i => i.id === item.insumo_id);
      return {
        id:                 item.id,
        insumo_id:          item.insumo_id ?? null,
        detalle_req_id:     item.id,
        insumo_clave:       info?.clave ?? item.descripcion_libre ?? '—',
        insumo_descripcion: info?.descripcion ?? item.descripcion_libre ?? '—',
        insumo_unidad:      info?.unidad ?? item.unidad_libre ?? '—',
        cantidad:           item.cantidad,
        precios:            {},
        fechasEntrega:      {},
        especOfrecida:      {},
        ganador:            null,
        evaluacion_tecnica: 'PENDIENTE' as const,
      };
    });
  };

  const updateComparativa = (updated: ComparativaLocal) => {
    setComparativas(prev =>
      prev.map(c => c.requisicion_id === updated.requisicion_id ? updated : c)
    );
    // Notificar cuando se generan OCs
    if (updated.estado === 'AUTORIZADA' && updated.ordenes_compra.length > 0) {
      const total = updated.ordenes_compra.reduce((sum, oc) => sum + oc.total, 0);
      const n = updated.ordenes_compra.length;
      notify({
        type: 'success',
        title: `${n} OC${n !== 1 ? 's' : ''} generada${n !== 1 ? 's' : ''}`,
        message: `Total comprometido: $${total.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
        duration: 6000,
      });
    }
  };

  // ── Solicitud de Cotización — handlers ───────────────────────────────────────
  const loadSolicitud = async (reqId: string) => {
    try {
      const res = await api.get(`/api/v1/compras/requisiciones/${reqId}/solicitud-cotizacion`);
      const s = res.data.data;
      const normalized: SolicitudCotizacion = {
        id_solicitud:            s.id_solicitud,
        requisicion_id:          reqId,
        dias_habiles:            s.dias_habiles,
        fecha_solicitud:         s.fecha_solicitud,
        fecha_limite:            s.fecha_limite,
        notas:                   s.notas ?? null,
        dias_habiles_restantes:  s.dias_habiles_restantes,
        alerta_plazo:            s.alerta_plazo,
        proveedores: (s.proveedores ?? []).map((p: any) => ({
          id_scp:          p.id_scp,
          proveedor_id:    p.proveedor_id,
          proveedor_nombre: p.proveedor?.razon_social ?? p.proveedor_nombre ?? '—',
          estado:          p.estado,
          pdf_nombre:      p.pdf_nombre ?? null,
          notas_proveedor: p.notas_proveedor ?? null,
          fecha_respuesta: p.fecha_respuesta ?? null,
        })),
      };
      setSolicitudesMap(prev => ({ ...prev, [reqId]: normalized }));
      return normalized;
    } catch {
      return null;
    }
  };

  const handleOpenSolicitudPanel = async (req: Requisicion) => {
    const existing = solicitudesMap[req.id];
    if (!existing && !isDemo) {
      const loaded = await loadSolicitud(req.id);
      if (loaded) {
        setSolicitudForm({ dias_habiles: loaded.dias_habiles, notas: loaded.notas ?? '', provsSeleccionados: loaded.proveedores.map(p => p.proveedor_id), tema: 'claro' });
      } else {
        // Sin solicitud previa — precargar las "Notas Adicionales" con las observaciones
        // que el Residente capturó al crear la requisición (editable por Compras).
        setSolicitudForm({ dias_habiles: 3, notas: req.observaciones ?? '', provsSeleccionados: [], tema: 'claro' });
      }
    } else if (existing) {
      setSolicitudForm({ dias_habiles: existing.dias_habiles, notas: existing.notas ?? '', provsSeleccionados: existing.proveedores.map(p => p.proveedor_id), tema: 'claro' });
    }
    setEditandoProveedores(false);
    setSolicitudPanelReqId(req.id);
    setStockConfirmado(false);
    setStockAdvertencia(null);
    if (!isDemo) {
      try {
        const res = await api.get(`/api/v1/compras/requisiciones/${req.id}/stock-almacen`);
        setStockAdvertencia(res.data?.data ?? []);
      } catch {
        // Fail-soft: si Almacén no responde, no se muestra advertencia y el
        // envío no queda bloqueado (ver design.md, Decisión 5).
        setStockAdvertencia([]);
      }
    } else {
      setStockAdvertencia([]);
    }
  };

  const handleSubmitSolicitud = async (reqId: string) => {
    if (solicitudForm.provsSeleccionados.length === 0) {
      notify({ type: 'error', title: 'Sin proveedores', message: 'Selecciona al menos un proveedor.' }); return;
    }
    if (isDemo) {
      notify({ type: 'success', title: 'Solicitud enviada (demo)', message: `${solicitudForm.provsSeleccionados.length} proveedor(es) · ${solicitudForm.dias_habiles} días hábiles` });
      setSolicitudPanelReqId(null); return;
    }
    try {
      setSolicitudSubmitting(true);
      const proyectoNombre = user?.projects?.find(p => p.id === currentProjectId)?.name;
      const res = await api.post(`/api/v1/compras/requisiciones/${reqId}/solicitud-cotizacion`, {
        dias_habiles: solicitudForm.dias_habiles,
        notas:        solicitudForm.notas || undefined,
        proveedores_ids: solicitudForm.provsSeleccionados,
        tema: solicitudForm.tema,
        proyecto_nombre: proyectoNombre,
      });
      await loadSolicitud(reqId);
      setEditandoProveedores(false);
      const emails = res.data?.emails as { enviados: number; fallidos: Array<{ proveedor: string; error: string }>; sin_correo: string[] } | undefined;
      notify({ type: 'success', title: 'Solicitud de cotización actualizada', message: `${solicitudForm.provsSeleccionados.length} proveedor(es) · plazo ${solicitudForm.dias_habiles} días hábiles` });
      if (emails) {
        if (emails.enviados > 0) {
          notify({ type: 'success', title: 'Correos enviados', message: `${emails.enviados} proveedor(es) notificado(s) por correo.`, duration: 6000 });
        }
        if (emails.sin_correo.length > 0) {
          notify({ type: 'warning', title: 'Sin correo registrado', message: `${emails.sin_correo.join(', ')} — no tiene(n) email_contacto en su ficha.`, duration: 8000 });
        }
        if (emails.fallidos.length > 0) {
          notify({ type: 'error', title: 'Error al enviar correo', message: emails.fallidos.map(f => `${f.proveedor}: ${f.error}`).join(' · '), duration: 8000 });
        }
      }
    } catch (err: any) {
      notify({ type: 'error', title: 'Error al enviar solicitud', message: err.response?.data?.message || err.message });
    } finally {
      setSolicitudSubmitting(false);
    }
  };

  const handleMarcarRespondio = async (reqId: string, scpId: string) => {
    try {
      await api.put(`/api/v1/compras/requisiciones/${reqId}/solicitud-cotizacion/proveedores/${scpId}`, { estado: 'RESPONDIO' });
      await loadSolicitud(reqId);
      notify({ type: 'success', title: 'Proveedor marcado como Respondió' });
    } catch (err: any) {
      notify({ type: 'error', title: 'Error', message: err.response?.data?.message || err.message });
    }
  };

  const handleMarcarDeclino = async (reqId: string, scpId: string) => {
    try {
      await api.put(`/api/v1/compras/requisiciones/${reqId}/solicitud-cotizacion/proveedores/${scpId}`, { estado: 'DECLINO' });
      await loadSolicitud(reqId);
      notify({ type: 'info', title: 'Proveedor marcado como Declinó' });
    } catch (err: any) {
      notify({ type: 'error', title: 'Error', message: err.response?.data?.message || err.message });
    }
  };

  // ── Órdenes de Compra — handlers ──────────────────────────────────────────────
  const loadOrdenesCompra = async () => {
    if (isDemo) return;
    setLoadingOc(true);
    try {
      const res = await comprasApi.getOrdenesCompra();
      setOrdenesCompra(res.data?.data ?? []);
    } catch { /* silencioso */ }
    finally { setLoadingOc(false); }
  };

  const toggleOcSeleccionada = (id: string) => {
    setOcSeleccionadas(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleEnviarOcCorreo = async () => {
    if (ocSeleccionadas.size === 0) return;
    setEnviandoOc(true);
    try {
      const res = await comprasApi.enviarOrdenesCompraCorreo([...ocSeleccionadas]);
      const { enviadas, fallidas } = res.data?.data ?? { enviadas: [], fallidas: [] };
      if (enviadas.length > 0) {
        notify({ type: 'success', title: 'Órdenes de Compra enviadas', message: `${enviadas.length} OC notificada(s) por correo.`, duration: 6000 });
      }
      if (fallidas.length > 0) {
        notify({ type: 'warning', title: 'Algunas OC no se enviaron', message: fallidas.map((f: { codigo: string; motivo: string }) => `${f.codigo}: ${f.motivo}`).join(' · '), duration: 8000 });
      }
      setOcSeleccionadas(new Set());
      await loadOrdenesCompra();
    } catch (err: any) {
      notify({ type: 'error', title: 'Error al enviar OC', message: err.response?.data?.message || err.message });
    } finally {
      setEnviandoOc(false);
    }
  };

  // ── Herramientas de Administrador — purga de datos de prueba — handlers ────
  const loadPurgaResumen = async () => {
    if (isDemo) return;
    setLoadingPurga(true);
    try {
      const res = await comprasApi.getResumenPurga();
      setPurgaResumen(res.data?.data ?? { requisiciones: [], ordenes_compra: [], proveedores: [] });
    } catch { /* silencioso */ }
    finally { setLoadingPurga(false); }
  };

  const togglePurgaSeleccion = (tipo: 'req' | 'oc' | 'prov', id: string) => {
    const setter = tipo === 'req' ? setPurgaSelReq : tipo === 'oc' ? setPurgaSelOc : setPurgaSelProv;
    setter(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const purgaTotalSeleccionado = purgaSelReq.size + purgaSelOc.size + purgaSelProv.size;

  const handleEjecutarPurga = async () => {
    if (purgaConfirmText !== 'ELIMINAR' || purgaTotalSeleccionado === 0) return;
    setPurgando(true);
    setPurgaBloqueo(null);
    try {
      await comprasApi.ejecutarPurga({
        requisiciones: [...purgaSelReq],
        ordenes_compra: [...purgaSelOc],
        proveedores: [...purgaSelProv],
      });
      notify({ type: 'success', title: 'Purga completada', message: `${purgaTotalSeleccionado} registro(s) eliminado(s).`, duration: 6000 });
      setPurgaSelReq(new Set());
      setPurgaSelOc(new Set());
      setPurgaSelProv(new Set());
      setShowPurgaModal(false);
      setPurgaConfirmText('');
      await loadPurgaResumen();
    } catch (err: any) {
      const data = err.response?.data;
      if (err.response?.status === 409 && data?.data) {
        setPurgaBloqueo(data.data);
      } else {
        notify({ type: 'error', title: 'Error al purgar', message: data?.message || err.message });
      }
    } finally {
      setPurgando(false);
    }
  };

  // ── Trazabilidad — handlers ───────────────────────────────────────────────────
  const loadTrazabilidad = async () => {
    if (isDemo) return;
    setLoadingTraz(true);
    try {
      const res = await api.get('/api/v1/compras/trazabilidad/materiales');
      setTrazabilidad(res.data?.data ?? []);
    } catch { /* silencioso */ }
    finally { setLoadingTraz(false); }
  };

  const handleSubmitAsignacion = async () => {
    if (!asignacionPanel || !asignForm.concepto_id || !asignForm.monto_extra) {
      notify({ type: 'error', title: 'Faltan datos', message: 'Completa concepto y monto.' }); return;
    }
    try {
      setAsignSubmitting(true);
      await api.post('/api/v1/compras/trazabilidad/asignaciones', {
        requisicion_item_id:  asignacionPanel.itemId,
        concepto_id:          asignForm.concepto_id,
        concepto_clave:       asignForm.concepto_clave,
        concepto_descripcion: asignForm.concepto_descripcion,
        monto_extra:          Number(asignForm.monto_extra),
      });
      await loadTrazabilidad();
      notify({ type: 'success', title: 'Inciso asignado al concepto' });
      setAsignacionPanel(null);
      setAsignForm({ concepto_id: '', concepto_clave: '', concepto_descripcion: '', monto_extra: '' });
    } catch (err: any) {
      notify({ type: 'error', title: 'Error al asignar', message: err.response?.data?.message || err.message });
    } finally { setAsignSubmitting(false); }
  };

  const handleEliminarAsignacion = async (asignacionId: string) => {
    try {
      await api.delete(`/api/v1/compras/trazabilidad/asignaciones/${asignacionId}`);
      await loadTrazabilidad();
      notify({ type: 'success', title: 'Inciso eliminado' });
    } catch (err: any) {
      notify({ type: 'error', title: 'Error', message: err.response?.data?.message || err.message });
    }
  };

  // ── Exportación de documentos ─────────────────────────────────────────────────
  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 200);
  };

  const exportarOcPdf = async (
    oc: ComparativaLocal['ordenes_compra'][number],
    comp: ComparativaLocal,
  ) => {
    try {
      const prov = comp.proveedores.find(p => p.nombre === oc.proveedor_nombre);
      const provId = prov?.id;
      const items = comp.lineas
        .filter(l => l.ganador === provId)
        .map(l => ({
          descripcion: l.insumo_descripcion,
          unidad: l.insumo_unidad,
          cantidad: l.cantidad,
          precio_unitario: parseFloat(l.precios[provId!] || '0'),
          importe: l.cantidad * parseFloat(l.precios[provId!] || '0'),
        }));
      const subtotal = items.reduce((s, i) => s + i.importe, 0);
      const iva = subtotal * 0.16;
      const total = subtotal + iva;

      const resp = await api.post(
        '/api/v1/reportes/oc-pdf',
        { oc: { numero: oc.codigo, proveedor: oc.proveedor_nombre, items, subtotal, iva, total } },
        { responseType: 'blob' },
      );
      triggerDownload(resp.data as Blob, `${oc.codigo}.pdf`);
    } catch {
      notify({ type: 'error', title: 'Error al generar PDF', message: 'No se pudo conectar con el servicio de reportes.' });
    }
  };

  const exportarComparativaPdf = async (comp: ComparativaLocal) => {
    try {
      const totales: Record<string, number> = {};
      comp.proveedores.forEach(prov => {
        totales[prov.id] = comp.lineas.reduce((s, l) => {
          const p = parseFloat(l.precios[prov.id] || '0');
          return s + p * l.cantidad;
        }, 0);
      });
      const lineas = comp.lineas.map(l => ({
        descripcion: l.insumo_descripcion,
        unidad: l.insumo_unidad,
        cantidad: l.cantidad,
        precios: Object.fromEntries(
          Object.entries(l.precios).map(([k, v]) => [k, parseFloat(v || '0')])
        ),
        importes: Object.fromEntries(
          Object.entries(l.precios).map(([k, v]) => [k, l.cantidad * parseFloat(v || '0')])
        ),
      }));
      const ganador = comp.lineas.find(l => l.ganador)?.ganador ?? null;
      const resp = await api.post(
        '/api/v1/reportes/comparativa-pdf',
        { comparativa: { titulo: `Comparativa REQ-${comp.requisicion_id.slice(-6)}`, proveedores: comp.proveedores, lineas, totales, ganador_id: ganador } },
        { responseType: 'blob' },
      );
      triggerDownload(resp.data as Blob, `Comparativa-${comp.id}.pdf`);
    } catch {
      notify({ type: 'error', title: 'Error al generar PDF', message: 'No se pudo conectar con el servicio de reportes.' });
    }
  };

  // ── Aprobación de requisición (Procurement / Admin / Superintendent) ─────────
  const handleAprobar = async (reqId: string) => {
    if (isDemo) {
      setRequisiciones(prev => prev.map(r => r.id === reqId ? { ...r, estado: 'APROBADA' } : r));
      notify({ type: 'success', title: 'Requisición aprobada', message: 'Procuración puede iniciar el cuadro comparativo.' });
      return;
    }
    try {
      setAprobando(reqId);
      await api.patch(`/api/v1/compras/requisiciones/${reqId}/aprobar`);
      await fetchData();
      notify({ type: 'success', title: 'Requisición aprobada', message: 'Ya puedes iniciar el cuadro comparativo.' });
    } catch (err: any) {
      notify({ type: 'error', title: 'Error al aprobar', message: err.response?.data?.message || err.message });
    } finally {
      setAprobando(null);
    }
  };

  // ─── Badge helpers ─────────────────────────────────────────────────────────
  const claseBadge = (clase: string) => {
    const s = CLASE_STYLE[clase] || DEFAULT_CLASE;
    return (
      <SectionBadge className={cn('rounded-full px-2.5 py-0.5 text-[9px]', s.badge)}>
        {s.label}
      </SectionBadge>
    );
  };

  const prioridadBadge = (p: string) => {
    const map: Record<string, string> = {
      ALTA: 'border-red-500/20 bg-red-500/10 text-red-600',
      MEDIA: 'border-amber-500/20 bg-amber-500/10 text-amber-600',
      BAJA: 'border-green-500/20 bg-green-500/10 text-green-600',
    };
    return <SectionBadge className={cn('rounded-lg px-2.5 py-1 text-[9px]', map[p] || '')}>{p}</SectionBadge>;
  };



  const FILTROS_CICLO = [
    { id: 'todos',               label: 'Todos',                  color: 'slate' },
    { id: 'pendiente-aprobacion',label: 'Pendiente aprobación',   color: 'amber' },
    { id: 'lista-cotizar',       label: 'Lista para cotizar',     color: 'blue'  },
    { id: 'cotizando',           label: 'Cotizando',              color: 'blue'  },
    { id: 'evaluacion-tecnica',  label: 'En evaluación técnica',  color: 'orange'},
    { id: 'pendiente-gt',        label: 'Pendiente GT',           color: 'violet'},
    { id: 'autorizado',          label: 'Autorizado',             color: 'green' },
  ];

  const getIdCiclo = (req: Requisicion, comp?: ComparativaLocal): string => {
    if (req.estado === 'PENDIENTE_TRANSFERENCIA') return 'pendiente-aprobacion';
    if (['PENDIENTE', 'BORRADOR'].includes(req.estado)) return 'pendiente-aprobacion';
    if (req.estado === 'APROBADA') {
      if (!comp) return 'lista-cotizar';
      const s = comp.estado;
      if (s === 'BORRADOR') return 'cotizando';
      if (s === 'EN_EVALUACION_TECNICA') return 'evaluacion-tecnica';
      if (s === 'EVALUADO_TECNICAMENTE') return 'pendiente-gt';
      if (s === 'EN_APROBACION_GT') return 'pendiente-gt';
      if (['APROBADO_GT', 'AUTORIZADA'].includes(s)) return 'autorizado';
    }
    if (req.estado === 'COMPRADA') return 'autorizado';
    return 'todos';
  };

  const getReqCycleStep = (req: Requisicion, comp?: ComparativaLocal) => {
    if (req.estado === 'PENDIENTE_TRANSFERENCIA')
      return { label: '🔒 Esperando transferencia', cls: 'bg-amber-500/10 text-amber-700 border-amber-500/20' };
    if (['PENDIENTE', 'BORRADOR'].includes(req.estado))
      return { label: '🟡 Pendiente de aprobación', cls: 'bg-amber-500/10 text-amber-700 border-amber-500/20' };
    if (req.estado === 'APROBADA') {
      if (!comp)
        return { label: '🔵 Lista para cotizar', cls: 'bg-blue-500/10 text-blue-700 border-blue-500/20' };
      const s = comp.estado;
      if (s === 'BORRADOR')
        return { label: '🔵 Cotizando proveedores', cls: 'bg-blue-500/10 text-blue-700 border-blue-500/20' };
      if (s === 'EN_EVALUACION_TECNICA')
        return { label: '🟠 En evaluación técnica', cls: 'bg-amber-500/10 text-amber-700 border-amber-500/20' };
      if (s === 'EVALUADO_TECNICAMENTE')
        return { label: '🟣 Evaluado · pendiente GT', cls: 'bg-violet-500/10 text-violet-700 border-violet-500/20' };
      if (s === 'EN_APROBACION_GT')
        return { label: '🟣 En aprobación GT', cls: 'bg-violet-500/10 text-violet-700 border-violet-500/20' };
      if (['APROBADO_GT', 'AUTORIZADA'].includes(s))
        return { label: '🟢 Autorizado', cls: 'bg-green-500/10 text-green-700 border-green-500/20' };
      if (s === 'CERRADO')
        return { label: '⬜ Cerrado', cls: 'bg-muted/500/10 text-muted-foreground border-slate-500/20' };
    }
    if (req.estado === 'COMPRADA')
      return { label: '🟢 OC Emitida', cls: 'bg-green-500/10 text-green-700 border-green-500/20' };
    return { label: req.estado, cls: 'bg-muted/500/10 text-muted-foreground border-slate-500/20' };
  };

  const formatMXN = (n: number) =>
    n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 });

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="animate-in space-y-8 fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="space-y-3">
          <SectionBadge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Procuración operativa
          </SectionBadge>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/10 bg-emerald-500/10 shadow-inner">
              <IconShoppingCart className="h-8 w-8 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-foreground">
                Centro de Compras
              </h1>
              <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Requisiciones · Catálogo de Insumos
              </p>
            </div>
          </div>
        </div>

        {/* Botón contextual por tab */}
        {activeTab === 'requisiciones' && (
          <Button
            onClick={() => setShowReqForm(true)}
            className="rounded-2xl bg-emerald-600 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-600/20 hover:bg-emerald-500"
          >
            <IconPlus className="h-4 w-4" />
            Nueva Requisicion
          </Button>
        )}
        {activeTab === 'proveedores' && isProcurement && (
          <div className="flex items-center gap-3">
            {puedeImportarProveedores && (
              <>
                <input
                  ref={fileImportProveedoresRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={handleImportProveedoresFileChange}
                />
                <Button
                  onClick={() => fileImportProveedoresRef.current?.click()}
                  className="rounded-2xl border border-border/60 bg-card text-xs font-black uppercase tracking-widest text-foreground shadow-sm hover:bg-muted/50"
                >
                  <IconUpload className="h-4 w-4" />
                  Importar CSV/Excel
                </Button>
              </>
            )}
            <Button
              onClick={() => { setEditingProveedor(null); setProveedorForm(PROVEEDOR_FORM_EMPTY); setShowProveedorForm(true); }}
              className="rounded-2xl bg-emerald-600 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-600/20 hover:bg-emerald-500"
            >
              <IconPlus className="h-4 w-4" />
              Nuevo Proveedor
            </Button>
          </div>
        )}
        {activeTab === 'catalogo' && (
          <Button
            onClick={() => setShowInsumoForm(true)}
            className="rounded-2xl bg-emerald-600 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-600/20 hover:bg-emerald-500"
          >
            <IconPlus className="h-4 w-4" />
            Agregar Insumo
          </Button>
        )}
      </div>

      {/* KPIs — desde /api/v1/compras/dashboard cuando disponible, fallback a conteos locales */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: 'Requisiciones',
            value: String(dashboardData?.kpis.total_requisiciones ?? requisiciones.length),
            color: 'text-emerald-600', bg: 'bg-emerald-500/10', icon: IconShoppingCart,
          },
          {
            label: 'Pdte. aprobación',
            value: String(dashboardData?.kpis.pendiente_aprobacion ?? reqPendientes),
            color: (dashboardData?.kpis.pendiente_aprobacion ?? reqPendientes) > 0 ? 'text-amber-600' : 'text-emerald-600',
            bg: (dashboardData?.kpis.pendiente_aprobacion ?? reqPendientes) > 0 ? 'bg-amber-500/10' : 'bg-emerald-500/10',
            icon: IconClock,
          },
          {
            label: 'Pdte. GT',
            value: String(dashboardData?.kpis.pendiente_gt ?? 0),
            color: (dashboardData?.kpis.pendiente_gt ?? 0) > 0 ? 'text-amber-600' : 'text-slate-500',
            bg: (dashboardData?.kpis.pendiente_gt ?? 0) > 0 ? 'bg-amber-500/10' : 'bg-slate-500/10',
            icon: IconAlertCircle,
          },
          {
            label: 'OCs por recibir',
            value: String(dashboardData?.kpis.ocs_pendientes_recibir ?? 0),
            color: 'text-blue-600', bg: 'bg-blue-500/10', icon: IconPackage,
          },
        ].map(kpi => (
          <Card key={kpi.label} className="rounded-2xl border-border/30 p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <CardContent className="p-0">
              <div className={cn('mb-3 flex h-10 w-10 items-center justify-center rounded-xl', kpi.bg)}>
                <kpi.icon className={cn('h-5 w-5', kpi.color)} />
              </div>
              <div className={cn('mb-0.5 text-2xl font-black tracking-tighter', kpi.color)}>{kpi.value}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{kpi.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alertas del dashboard — cotizaciones vencidas */}
      {dashboardData && dashboardData.alertas.length > 0 && (
        <Card className="rounded-2xl border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">
              ⚠ {dashboardData.alertas.length} cotización{dashboardData.alertas.length !== 1 ? 'es' : ''} vencida{dashboardData.alertas.length !== 1 ? 's' : ''}
            </p>
            {dashboardData.alertas.map((a) => (
              <div key={a.req_id} className="flex items-center justify-between rounded-xl bg-amber-500/10 px-3 py-2">
                <span className="text-xs font-semibold text-amber-800">{a.folio} · {a.dias_vencida} día{a.dias_vencida !== 1 ? 's' : ''} vencida</span>
                <button
                  onClick={() => setSolicitudPanelReqId(a.req_id)}
                  className="text-[10px] font-black uppercase tracking-widest text-amber-700 hover:text-amber-900"
                >
                  Ver →
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Actividad reciente */}
      {dashboardData && dashboardData.actividad_reciente.length > 0 && (
        <Card className="rounded-2xl border-border/30">
          <CardContent className="p-4">
            <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Actividad reciente</p>
            <div className="space-y-1">
              {dashboardData.actividad_reciente.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-muted/40">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-foreground">{r.folio}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[200px]">{r.concepto || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{r.estado}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(r.updated_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}


      {/* Content */}
      {loading ? (
        <Card className="border-border/40">
          <CardContent className="flex h-80 flex-col items-center justify-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500/10 border-t-emerald-600" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">
              Sincronizando con suministros...
            </p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="space-y-4 p-12 text-center">
            <IconAlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <h3 className="text-xl font-black uppercase tracking-tighter text-destructive">Falla en modulo Compras</h3>
            <p className="mx-auto max-w-sm text-xs font-medium text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      ) : activeReqId ? (
        /* ── Vista de detalle de comparativa (accesible desde cualquier sub-view) ── */
        (() => {
          const req = requisiciones.find(r => r.id === activeReqId);
          const comp = comparativas.find(c => c.requisicion_id === activeReqId);
          if (!req || !comp) return null;
          return (
            <ComparativaDetail
              requisicionFolio={req.folio}
              comparativa={comp}
              insumos={insumos}
              isDemo={isDemo}
              onBack={() => { setActiveReqId(null); setComparativaModo('compras'); }}
              onUpdate={updateComparativa}
              onExportOcPdf={oc => exportarOcPdf(oc, comp)}
              onExportComparativaPdf={() => exportarComparativaPdf(comp)}
              proveedoresCatalogo={proveedoresList.map(p => ({ id: p.id_proveedor, razon_social: p.razon_social, rfc: p.rfc_tax_id }))}
              modo={comparativaModo}
            />
          );
        })()
      ) : (
        <>
          {/* ── TAB: Requisiciones ───────────────────────────────────────────── */}
          {activeTab === 'requisiciones' && (
            requisiciones.length === 0 ? (
              <Card className="border-dashed border-border/60">
                <CardContent className="space-y-4 p-16 text-center">
                  <IconSearch className="mx-auto h-12 w-12 text-muted-foreground/20" />
                  <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Sin requisiciones activas</p>
                  <div className="flex justify-center">
                    <Button onClick={() => setShowReqForm(true)} variant="outline" className="border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/5">
                      <IconPlus className="h-4 w-4" />
                      Crear primera requisicion
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* ── 9.2 Banner de alertas de cotización vencida ─────────── */}
                {isProcurement && alertasCotizacion.length > 0 && (
                  <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <IconAlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                      <p className="text-xs font-black uppercase tracking-widest text-amber-700">
                        {alertasCotizacion.length} solicitud{alertasCotizacion.length !== 1 ? 'es' : ''} con plazo vencido
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      {alertasCotizacion.map(a => (
                        <div key={a.solicitud_id} className="flex items-center justify-between rounded-xl border border-amber-500/10 bg-background px-3 py-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[10px] font-black text-foreground shrink-0">{a.requisicion_codigo}</span>
                            <span className="text-[10px] text-amber-700 shrink-0">
                              {a.dias_retraso} día{a.dias_retraso !== 1 ? 's' : ''} de retraso
                            </span>
                          </div>
                          <span className="text-[9px] text-muted-foreground shrink-0">
                            {a.proveedores_pendientes.length} proveedor{a.proveedores_pendientes.length !== 1 ? 'es' : ''} pendiente{a.proveedores_pendientes.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              {/* ── Filtro por partida ─────────────────────────────────────── */}
              {conceptosCompras.length > 0 && (
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 max-w-xs">
                    <IconSearch className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <select
                      className="w-full appearance-none rounded-xl border border-border/40 bg-muted/30 pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                      value={reqFiltroConcepto}
                      onChange={e => setReqFiltroConcepto(e.target.value)}
                    >
                      <option value="">Todas las partidas</option>
                      {conceptosCompras.map(c => (
                        <option key={c.id} value={c.id}>[{c.clave}] {c.descripcion}</option>
                      ))}
                    </select>
                  </div>
                  {reqFiltroConcepto && (
                    <button type="button" onClick={() => setReqFiltroConcepto('')}
                      className="flex items-center gap-1 rounded-xl border border-border/30 px-3 py-2 text-[10px] text-muted-foreground hover:bg-muted/40">
                      <IconX className="h-3 w-3" /> Limpiar
                    </button>
                  )}
                </div>
              )}
              {/* ── Filtro por estado del ciclo ───────────────────────────────── */}
              <div className="flex flex-wrap gap-2 overflow-x-auto pb-1">
                {FILTROS_CICLO.map(f => {
                  const count = f.id === 'todos'
                    ? requisiciones.length
                    : requisiciones.filter(r => getIdCiclo(r, comparativas.find(c => c.requisicion_id === r.id)) === f.id).length;
                  const isActive = filtroEstadoCiclo === f.id;
                  const colorMap: Record<string, string> = {
                    slate:  isActive ? 'bg-slate-500/20 text-slate-700 border-slate-500/40'  : '',
                    amber:  isActive ? 'bg-amber-500/20 text-amber-700 border-amber-500/40'  : '',
                    blue:   isActive ? 'bg-blue-500/20 text-blue-700 border-blue-500/40'     : '',
                    orange: isActive ? 'bg-orange-500/20 text-orange-700 border-orange-500/40': '',
                    violet: isActive ? 'bg-violet-500/20 text-violet-700 border-violet-500/40': '',
                    green:  isActive ? 'bg-green-500/20 text-green-700 border-green-500/40'  : '',
                  };
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFiltroEstadoCiclo(f.id)}
                      className={cn(
                        'shrink-0 rounded-xl border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors',
                        isActive
                          ? colorMap[f.color]
                          : 'border-border/30 bg-muted/30 text-muted-foreground hover:bg-muted/50',
                      )}
                    >
                      {f.label} ({count})
                    </button>
                  );
                })}
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {requisiciones
                  .filter(req => !reqFiltroConcepto || req.concepto_id === reqFiltroConcepto)
                  .filter(req => {
                    if (filtroEstadoCiclo === 'todos') return true;
                    const comp = comparativas.find(c => c.requisicion_id === req.id);
                    return getIdCiclo(req, comp) === filtroEstadoCiclo;
                  })
                  .map(req => {
                  const hasComp = comparativas.some(c => c.requisicion_id === req.id);
                  const compEstado = comparativas.find(c => c.requisicion_id === req.id)?.estado;
                  return (
                    <Card key={req.id} className="group relative overflow-hidden border-border/40 transition-all hover:-translate-y-1 hover:shadow-2xl">
                      <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <IconShoppingCart className="h-20 w-20" />
                      </div>
                      <CardHeader className="space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-1.5">
                            <SectionBadge className="rounded-full px-3 py-1 text-[10px]">Folio: {req.folio}</SectionBadge>
                            {alertasReqIds.has(req.id) && (
                              <span className="animate-pulse rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[9px] font-black text-amber-700">
                                ⚠ Plazo
                              </span>
                            )}
                          </div>
                          {prioridadBadge(req.prioridad)}
                        </div>
                        <div className="space-y-3">
                          <CardTitle className="text-base uppercase tracking-tight text-foreground">Requisicion de obra</CardTitle>
                          <CardDescription className="flex items-center gap-2 text-[11px] font-medium">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[8px] font-black text-muted-foreground">U</span>
                            {req.solicitante}
                          </CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3 border-t border-border/40 pt-4">
                        <div className="flex items-center justify-between gap-2">
                          {(() => {
                            const comp = comparativas.find(c => c.requisicion_id === req.id);
                            const step = getReqCycleStep(req, comp);
                            return (
                              <span className={cn('rounded-lg border px-2.5 py-1 text-[9px] font-black', step.cls)}>
                                {step.label}
                              </span>
                            );
                          })()}
                          <div className="flex shrink-0 items-center gap-2">
                            {req.tipo === 'IMPREVISTO' && (
                              <span className="rounded-md border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-orange-700">
                                Imprevisto
                              </span>
                            )}
                            <div className="text-[10px] font-bold uppercase text-muted-foreground">
                              {new Date(req.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                            </div>
                          </div>
                        </div>
                        {req.concepto_clave && (
                          <p className="text-[10px] font-mono text-emerald-700 truncate">
                            [{req.concepto_clave}] {req.concepto_descripcion}
                          </p>
                        )}
                        {req.observaciones_internas && (
                          <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-2.5 py-1.5">
                            <p className="text-[8px] font-black uppercase tracking-widest text-red-700">🔒 Nota interna</p>
                            <p className="text-[9px] whitespace-pre-line text-foreground/90 line-clamp-3">{req.observaciones_internas}</p>
                          </div>
                        )}
                        {/* Detalle de items — para revisar qué se pide antes de aprobar */}
                        {!!req.items?.length && (
                          <div className="rounded-xl border border-border/40 bg-muted/20">
                            <button
                              type="button"
                              onClick={() => toggleReqExpanded(req.id)}
                              className="flex w-full items-center justify-between px-3 py-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground"
                            >
                              <span>Ver {req.items.length} ítem{req.items.length === 1 ? '' : 's'}</span>
                              <span>{expandedReqIds.has(req.id) ? '▲' : '▼'}</span>
                            </button>
                            {expandedReqIds.has(req.id) && (
                              <div className="space-y-2 border-t border-border/40 px-3 py-2.5">
                                {req.items.map(item => {
                                  const insumo = item.insumo_id ? insumoById.get(item.insumo_id) : undefined;
                                  const nombre = item.es_imprevisto
                                    ? (item.descripcion_libre || 'Descripción libre no capturada')
                                    : (insumo ? `[${insumo.clave}] ${insumo.descripcion}` : (item.insumo_id ? 'Insumo no encontrado en catálogo' : '—'));
                                  const unidad = item.es_imprevisto ? item.unidad_libre : insumo?.unidad;
                                  return (
                                    <div key={item.id} className="text-[10px] leading-snug">
                                      <div className="flex items-start justify-between gap-2">
                                        <span className="font-semibold text-foreground">{nombre}</span>
                                        <span className="shrink-0 font-mono text-muted-foreground">{item.cantidad} {unidad || ''}</span>
                                      </div>
                                      {(item.especificacion_marca_modelo || item.especificacion_detalle) && (
                                        <p className="text-muted-foreground">
                                          {[item.especificacion_marca_modelo, item.especificacion_detalle].filter(Boolean).join(' — ')}
                                        </p>
                                      )}
                                      {item.notas && <p className="italic text-muted-foreground">{item.notas}</p>}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                        {/* Botón "Aprobar" para Procurement en requisiciones PENDIENTE/BORRADOR */}
                        {isProcurement && ['PENDIENTE', 'BORRADOR'].includes(req.estado) && (
                          <Button
                            onClick={() => handleAprobar(req.id)}
                            disabled={aprobando === req.id}
                            className="w-full rounded-xl bg-emerald-600 text-[9px] font-black uppercase tracking-widest text-white hover:bg-emerald-500 disabled:opacity-60"
                          >
                            <IconCheckCircle2 className="h-3.5 w-3.5" />
                            {aprobando === req.id ? 'Aprobando…' : 'Aprobar Requisición'}
                          </Button>
                        )}
                        {/* Aviso de partida bloqueada — PENDIENTE_TRANSFERENCIA */}
                        {req.estado === 'PENDIENTE_TRANSFERENCIA' && (
                          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px]">🔒</span>
                              <span className="text-[9px] font-black uppercase tracking-widest text-amber-700">
                                Esperando transferencia presupuestal
                              </span>
                            </div>
                            {req.concepto_clave && (
                              <p className="text-[10px] text-amber-700/80">
                                Partida <span className="font-black">{req.concepto_clave}</span> sin saldo disponible.
                                Esta requisición se aprobará automáticamente cuando se apruebe la transferencia.
                              </p>
                            )}
                            {!req.concepto_clave && (
                              <p className="text-[10px] text-amber-700/80">
                                La partida asociada no tiene saldo disponible.
                                Esta requisición se aprobará automáticamente cuando se apruebe la transferencia.
                              </p>
                            )}
                          </div>
                        )}
                        {/* Sección Solicitud + Comparativa para APROBADAS */}
                        {req.estado === 'APROBADA' && (() => {
                          const solic = solicitudesMap[req.id];
                          const respondidos = solic?.proveedores.filter(p => p.estado === 'RESPONDIO').length ?? 0;
                          const totalProvs = solic?.proveedores.length ?? 0;
                          return (
                            <>
                              {/* Alerta de plazo vencido */}
                              {solic?.alerta_plazo && (
                                <div className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/5 px-2.5 py-1.5">
                                  <IconAlertTriangle className="h-3 w-3 shrink-0 text-red-500" />
                                  <span className="text-[9px] font-black text-red-600">
                                    Plazo vencido · {Math.abs(solic.dias_habiles_restantes)} día(s) de retraso
                                  </span>
                                </div>
                              )}
                              {/* Estado de respuestas si ya hay solicitud */}
                              {solic && !solic.alerta_plazo && (
                                <div className="flex items-center gap-1.5 rounded-lg border border-sky-500/20 bg-sky-500/5 px-2.5 py-1.5">
                                  <IconClock className="h-3 w-3 shrink-0 text-sky-500" />
                                  <span className="text-[9px] font-black text-sky-700">
                                    {respondidos}/{totalProvs} respuestas · {solic.dias_habiles_restantes}d hábiles
                                  </span>
                                </div>
                              )}
                              {/* Botón de solicitud de cotización — oculto si el cuadro ya fue aprobado/generado */}
                              {isProcurement && !['APROBADO_GT', 'AUTORIZADA', 'EN_APROBACION_GT'].includes(compEstado ?? '') && (
                                <Button
                                  onClick={() => handleOpenSolicitudPanel(req)}
                                  variant="outline"
                                  className="w-full rounded-xl border-sky-500/30 text-[9px] font-black uppercase tracking-widest text-sky-600 hover:bg-sky-500/5"
                                >
                                  <IconSend className="h-3.5 w-3.5" />
                                  {solic ? 'Ver Solicitud de Cotización' : 'Enviar Solicitud de Cotización'}
                                </Button>
                              )}
                              {/* Botón comparativa */}
                              {(hasComp || (solic && respondidos > 0)) && (
                                <Button
                                  onClick={() => openComparativa(req)}
                                  variant="outline"
                                  className={cn(
                                    'w-full rounded-xl text-[9px] font-black uppercase tracking-widest',
                                    compEstado === 'AUTORIZADA'
                                      ? 'border-green-500/30 text-green-600 hover:bg-green-500/5'
                                      : 'border-amber-500/30 text-amber-600 hover:bg-amber-500/5'
                                  )}
                                >
                                  <IconScale className="h-3.5 w-3.5" />
                                  {compEstado === 'AUTORIZADA'
                                    ? 'Ver OC generadas'
                                    : hasComp
                                    ? 'Continuar comparativa'
                                    : 'Crear Cuadro Comparativo'}
                                </Button>
                              )}
                              {/* Si no hay solicitud ni comparativa, mostrar el botón original de iniciar comparativa */}
                              {!hasComp && !solic && !isProcurement && (
                                <Button
                                  onClick={() => openComparativa(req)}
                                  variant="outline"
                                  className="w-full rounded-xl border-amber-500/30 text-[9px] font-black uppercase tracking-widest text-amber-600 hover:bg-amber-500/5"
                                >
                                  <IconScale className="h-3.5 w-3.5" />
                                  Iniciar comparativa
                                </Button>
                              )}
                            </>
                          );
                        })()}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              </div>
            )
          )}

          {/* ── TAB: Catálogo de Insumos ─────────────────────────────────────── */}
          {activeTab === 'catalogo' && (
            <div className="space-y-5">
              {/* Chips por categoría */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setCatalogClase('')}
                  className={cn(
                    'rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all',
                    catalogClase === '' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  Todos ({insumos.length})
                </button>
                {CLASES.map(c => {
                  const s = CLASE_STYLE[c];
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCatalogClase(catalogClase === c ? '' : c)}
                      className={cn(
                        'rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all',
                        catalogClase === c ? 'ring-2 ring-offset-1 shadow-lg ' + s.chip : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      )}
                    >
                      {s.label} ({claseCount[c] || 0})
                    </button>
                  );
                })}
              </div>

              {/* Búsqueda */}
              <div className="relative">
                <IconSearch className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="rounded-2xl border-border/40 pl-11"
                  placeholder="Buscar por clave, descripción o unidad..."
                  value={catalogSearch}
                  onChange={e => setCatalogSearch(e.target.value)}
                />
                {catalogSearch && (
                  <button type="button" onClick={() => setCatalogSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <IconX className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Tabla */}
              <Card className="overflow-hidden rounded-3xl border-border/40 shadow-xl">
                <TableContainer>
                  <Table className="min-w-[760px]">
                    <TableHeader>
                      <tr>
                        <TableHead>Clave</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead className="text-center">Unidad</TableHead>
                        <TableHead className="text-center">Categoría</TableHead>
                        <TableHead className="text-right">Precio Ref.</TableHead>
                      </tr>
                    </TableHeader>
                    <TableBody>
                      {insumosFiltrados.map(ins => (
                        <TableRow key={ins.id}>
                          <TableCell>
                            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black text-emerald-700">
                              {ins.clave}
                            </span>
                          </TableCell>
                          <TableCell className="max-w-[320px]">
                            <div className="text-sm font-medium text-foreground">{ins.descripcion}</div>
                            {ins.especificaciones && (
                              <div className="mt-0.5 text-[10px] text-muted-foreground">{ins.especificaciones}</div>
                            )}
                            {ins.proveedor_preferido && (
                              <div className="mt-0.5 text-[10px] text-muted-foreground/70">Prov: {ins.proveedor_preferido}</div>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-xs font-bold text-muted-foreground">{ins.unidad}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            {claseBadge(ins.clase)}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-sm font-bold text-foreground">{formatMXN(ins.costo)}</span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {insumosFiltrados.length === 0 && (
                  <div className="p-16 text-center">
                    <IconPackage className="mx-auto mb-4 h-12 w-12 text-muted-foreground/20" />
                    <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                      {insumos.length === 0 ? 'Catálogo vacío — agrega tu primer insumo' : 'Sin resultados para la búsqueda'}
                    </p>
                  </div>
                )}
                {insumosFiltrados.length > 0 && (
                  <div className="border-t border-border/30 px-6 py-3 text-right">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {insumosFiltrados.length} de {insumos.length} insumos
                    </span>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* ── 9.1 TAB: Pendientes de Evaluación Técnica (Residente) ──────────── */}
          {activeTab === 'proveedores' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                  <Input
                    placeholder="Buscar proveedor por nombre o RFC..."
                    value={proveedoresSearch}
                    onChange={e => setProveedoresSearch(e.target.value)}
                    className="pl-9"
                  />
                  {proveedoresSearch && (
                    <button type="button" onClick={() => setProveedoresSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      <IconX className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              {proveedoresList.filter(p => {
                const q = proveedoresSearch.toLowerCase();
                return !q || p.razon_social.toLowerCase().includes(q) || p.rfc_tax_id.toLowerCase().includes(q);
              }).length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/50 p-12 text-center">
                  <IconShoppingCart className="mx-auto mb-3 h-10 w-10 text-muted-foreground/20" />
                  <p className="text-sm font-bold text-muted-foreground">Sin proveedores registrados</p>
                  {isProcurement && <p className="mt-1 text-xs text-muted-foreground/70">Crea el primero con el botón "Nuevo Proveedor"</p>}
                </div>
              ) : (
                <TableScrollShadow className="rounded-2xl border border-border/50">
                  <table className="w-full text-sm">
                    <thead className="border-b border-border/50 bg-muted/30">
                      <tr>
                        <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Razón Social / RFC</th>
                        <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ubicación</th>
                        <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tipo</th>
                        <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Crédito</th>
                        <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Score</th>
                        {isProcurement && <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Acciones</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {proveedoresList.filter(p => {
                        const q = proveedoresSearch.toLowerCase();
                        return !q || p.razon_social.toLowerCase().includes(q) || p.rfc_tax_id.toLowerCase().includes(q);
                      }).map(p => (
                        <tr key={p.id_proveedor} className="bg-background hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-semibold text-foreground">{p.razon_social}</p>
                            <p className="text-[10px] text-muted-foreground">{p.rfc_tax_id}</p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${p.tipo_ubicacion === 'FORANEO' ? 'bg-violet-500/10 text-violet-700' : 'bg-sky-500/10 text-sky-700'}`}>
                                {p.tipo_ubicacion === 'FORANEO' ? 'Foráneo' : 'Local'}
                              </span>
                              {p.entrega_en_sitio && (
                                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Entrega en sitio</span>
                              )}
                            </div>
                            {p.ciudad && <p className="mt-0.5 text-[10px] text-muted-foreground">{p.ciudad}</p>}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${p.tipo_proveedor === 'EXTRANJERO' ? 'bg-amber-500/10 text-amber-700' : 'bg-muted text-muted-foreground'}`}>
                              {p.tipo_proveedor === 'EXTRANJERO' ? 'Extranjero' : 'Nacional'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${p.estatus_credito === 'BLOQUEADO' ? 'bg-red-500/10 text-red-700 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-700'}`}>
                              {p.estatus_credito === 'BLOQUEADO' ? '🔴 Bloqueado' : '✓ Activo'}
                            </span>
                            {p.limite_credito != null && (
                              <p className="mt-0.5 text-[10px] text-muted-foreground">Límite: ${Number(p.limite_credito).toLocaleString()}</p>
                            )}
                            <p className="mt-0.5 text-[10px] text-muted-foreground">
                              {p.ofrece_credito ? `Crédito ${p.dias_credito ?? '?'} días` : 'Sin crédito'}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            {p.calificacion_desempeno != null ? (() => {
                              const score = Number(p.calificacion_desempeno);
                              const total = calTotales[p.id_proveedor];
                              const colorClass = score >= 4 ? 'text-emerald-600' : score >= 2.5 ? 'text-amber-500' : 'text-red-500';
                              return (
                                <div className="flex items-center gap-1">
                                  <span className={colorClass}>★</span>
                                  <span className={`text-xs font-bold ${colorClass}`}>{score.toFixed(1)}</span>
                                  {total != null && <span className="text-[10px] text-muted-foreground">({total})</span>}
                                </div>
                              );
                            })() : (
                              <span className="text-[10px] text-muted-foreground/40">—</span>
                            )}
                          </td>
                          {isProcurement && (
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => { setCalHistorialId(p.id_proveedor); fetchCalHistorial(p.id_proveedor); }}
                                  className="rounded-lg border border-amber-500/30 px-2 py-1 text-[10px] font-bold text-amber-600 hover:bg-amber-500/10 transition-colors"
                                >
                                  ★ Calificar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { setDocsProveedorId(p.id_proveedor); fetchDocsProveedor(p.id_proveedor); }}
                                  className="rounded-lg border border-border/50 px-2 py-1 text-[10px] font-bold text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
                                >
                                  📎 Docs
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingProveedor(p);
                                    setProveedorForm({
                                      rfc_tax_id: p.rfc_tax_id, razon_social: p.razon_social,
                                      email_contacto: p.email_contacto ?? '', telefono: p.telefono ?? '',
                                      estatus: p.estatus, ciudad: p.ciudad ?? '',
                                      tipo_ubicacion: p.tipo_ubicacion, entrega_en_sitio: p.entrega_en_sitio,
                                      estatus_credito: p.estatus_credito,
                                      limite_credito: p.limite_credito != null ? String(p.limite_credito) : '',
                                      ofrece_credito: p.ofrece_credito ?? false,
                                      dias_credito: p.dias_credito != null ? String(p.dias_credito) : '',
                                      tipo_proveedor: p.tipo_proveedor,
                                      calificacion_desempeno: p.calificacion_desempeno != null ? String(p.calificacion_desempeno) : '',
                                    });
                                    setShowProveedorForm(true);
                                  }}
                                  className="rounded-lg border border-border/50 px-2 py-1 text-[10px] font-bold text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
                                >
                                  Editar
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TableScrollShadow>
              )}
            </div>
          )}

          {activeTab === 'pendientes-eval' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">
                  Cuadros comparativos pendientes de tu evaluación técnica
                </p>
                <span className="rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-black text-amber-700">
                  {pendientesEval.length} pendiente{pendientesEval.length !== 1 ? 's' : ''}
                </span>
              </div>
              {pendientesEval.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/50 p-12 text-center">
                  <IconCheckCircle2 className="mx-auto mb-3 h-10 w-10 text-muted-foreground/20" />
                  <p className="text-sm font-bold text-muted-foreground">Sin cuadros pendientes de evaluación técnica</p>
                </div>
              ) : (
                pendientesEval.map(cc => (
                  <Card key={cc.id} className="rounded-2xl border-amber-500/20 bg-amber-500/5 shadow-none">
                    <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-amber-700">{(cc as any).codigo ?? cc.id.slice(0, 8)}</span>
                          {(() => {
                            const req = requisiciones.find(r => r.id === cc.requisicion_id);
                            return req ? <span className="text-[10px] text-muted-foreground">· Req {req.folio}</span> : null;
                          })()}
                        </div>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {cc.proveedores.map(prov => {
                            const total = cc.lineas.reduce((s, l) => s + l.cantidad * parseFloat(l.precios[prov.id] || '0'), 0);
                            return (
                              <span key={prov.id} className="rounded border border-amber-500/20 bg-background px-1.5 py-0.5 text-[9px] text-muted-foreground">
                                {prov.nombre} · ${total.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                              </span>
                            );
                          })}
                          {cc.proveedores.length === 0 && (
                            <span className="text-[10px] text-muted-foreground">{cc.lineas.length} renglones · sin cotizaciones</span>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => { setComparativaModo('residente'); setActiveReqId(cc.requisicion_id); }}
                        className="rounded-xl bg-amber-500 px-4 text-xs font-black text-white hover:bg-amber-400"
                      >
                        Evaluar →
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* ── 9.2 TAB: Pendientes de Aprobación GT ──────────────────────────── */}
          {activeTab === 'pendientes-gt' && (
            <div className="space-y-4">
              {/* Dashboard GT */}
              {gtDashboardData && (
                <div className="space-y-3">
                  {gtDashboardData.parcial && (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-3 py-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">⚠ Datos parcialmente disponibles</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {[
                      { label: 'Pdte. revisión', value: gtDashboardData.pendientes_revision, alert: gtDashboardData.pendientes_revision > 0 },
                      { label: 'En eval. técnica', value: gtDashboardData.en_evaluacion_tecnica, alert: false },
                      { label: 'Aprobados/mes', value: gtDashboardData.aprobados_este_mes, alert: false },
                      { label: 'Comprometido', value: `$${(gtDashboardData.monto_comprometido / 1000).toFixed(0)}k`, alert: false },
                    ].map(kpi => (
                      <Card key={kpi.label} className={`rounded-2xl border-border/30 p-4 ${kpi.alert ? 'border-amber-500/30 bg-amber-500/5' : ''}`}>
                        <CardContent className="p-0">
                          <div className={`text-2xl font-black tracking-tighter ${kpi.alert ? 'text-amber-600' : 'text-violet-600'}`}>{kpi.value}</div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{kpi.label}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {gtDashboardData.alertas.length > 0 && (
                    <Card className="rounded-2xl border-amber-500/30 bg-amber-500/5">
                      <CardContent className="p-4 space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">⚠ Cuadros esperando más de 3 días</p>
                        {gtDashboardData.alertas.map((a) => (
                          <div key={a.comparativa_id} className="rounded-xl bg-amber-500/10 px-3 py-2">
                            <span className="text-xs font-semibold text-amber-800">{a.folio} · {a.dias_en_espera} días en espera</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-violet-700">
                  Cuadros comparativos pendientes de tu aprobación como Gerencia Técnica
                </p>
                <span className="rounded-full bg-violet-500/10 px-3 py-1 text-[10px] font-black text-violet-700">
                  {pendientesGT.length} pendiente{pendientesGT.length !== 1 ? 's' : ''}
                </span>
              </div>
              {pendientesGT.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/50 p-12 text-center">
                  <IconCheckCircle2 className="mx-auto mb-3 h-10 w-10 text-muted-foreground/20" />
                  <p className="text-sm font-bold text-muted-foreground">Sin cuadros pendientes de aprobación GT</p>
                </div>
              ) : (
                pendientesGT.map(cc => (
                  <Card key={cc.id} className="rounded-2xl border-violet-500/20 bg-violet-500/5 shadow-none">
                    <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-violet-700">{(cc as any).codigo ?? cc.id.slice(0, 8)}</span>
                          {(() => {
                            const req = requisiciones.find(r => r.id === cc.requisicion_id);
                            return req ? <span className="text-[10px] text-muted-foreground">· Req {req.folio}</span> : null;
                          })()}
                        </div>
                        {(() => {
                          const ganadorMap = new Map<string, number>();
                          cc.lineas.forEach(l => { if (l.ganador) ganadorMap.set(l.ganador, (ganadorMap.get(l.ganador) ?? 0) + 1); });
                          const top = [...ganadorMap.entries()].sort((a, b) => b[1] - a[1])[0];
                          if (!top) return <p className="mt-0.5 text-[11px] text-muted-foreground">{cc.lineas.length} renglones evaluados por Residente</p>;
                          const prov = cc.proveedores.find(p => p.id === top[0]);
                          const total = cc.lineas.reduce((s, l) => s + l.cantidad * parseFloat(l.precios[top[0]] || '0'), 0);
                          return (
                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                              Rec. Residente: <span className="font-black text-violet-700">{prov?.nombre ?? '—'}</span>
                              {total > 0 && <span> · ${total.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</span>}
                            </p>
                          );
                        })()}
                      </div>
                      <Button
                        onClick={() => setActiveReqId(cc.requisicion_id)}
                        className="rounded-xl bg-violet-600 px-4 text-xs font-black text-white hover:bg-violet-500"
                      >
                        Revisar y Autorizar →
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* ── TAB: Órdenes de Compra — envío por correo ────────────────────── */}
          {activeTab === 'ordenes-compra' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Selecciona una o varias OC para enviarlas por correo al proveedor
                </p>
                <Button
                  onClick={handleEnviarOcCorreo}
                  disabled={ocSeleccionadas.size === 0 || enviandoOc}
                  className="rounded-xl bg-emerald-600 px-4 text-xs font-black uppercase tracking-widest text-white hover:bg-emerald-500 disabled:opacity-40"
                >
                  <IconSend className="h-4 w-4" />
                  {enviandoOc ? 'Enviando…' : `Enviar por correo${ocSeleccionadas.size > 0 ? ` (${ocSeleccionadas.size})` : ''}`}
                </Button>
              </div>

              {loadingOc ? (
                <div className="flex h-40 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500/10 border-t-emerald-600" />
                </div>
              ) : ordenesCompra.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/50 p-12 text-center">
                  <IconSend className="mx-auto mb-3 h-10 w-10 text-muted-foreground/20" />
                  <p className="text-sm font-bold text-muted-foreground">Sin órdenes de compra generadas todavía</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-border/30">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-muted/40">
                        <th className="w-10 px-3 py-2"></th>
                        <th className="px-3 py-2 font-black uppercase tracking-widest text-muted-foreground">Código</th>
                        <th className="px-3 py-2 font-black uppercase tracking-widest text-muted-foreground">Proveedor</th>
                        <th className="px-3 py-2 font-black uppercase tracking-widest text-muted-foreground">Fecha</th>
                        <th className="px-3 py-2 font-black uppercase tracking-widest text-muted-foreground">Estado</th>
                        <th className="px-3 py-2 text-right font-black uppercase tracking-widest text-muted-foreground">Total</th>
                        <th className="px-3 py-2 font-black uppercase tracking-widest text-muted-foreground">Envío</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ordenesCompra.map((oc, idx) => (
                        <tr key={oc.id_orden} className={cn('border-t border-border/20', idx % 2 === 1 && 'bg-muted/10')}>
                          <td className="px-3 py-2">
                            <input
                              type="checkbox"
                              checked={ocSeleccionadas.has(oc.id_orden)}
                              onChange={() => toggleOcSeleccionada(oc.id_orden)}
                              className="h-4 w-4 rounded border-border/50"
                            />
                          </td>
                          <td className="px-3 py-2 font-bold text-foreground">{oc.codigo}</td>
                          <td className="px-3 py-2 text-muted-foreground">{oc.proveedor?.razon_social ?? '—'}</td>
                          <td className="px-3 py-2 text-muted-foreground">{new Date(oc.fecha_emision).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                          <td className="px-3 py-2">
                            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{oc.estado}</span>
                          </td>
                          <td className="px-3 py-2 text-right font-bold text-foreground">${Number(oc.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                          <td className="px-3 py-2">
                            {oc.enviada_proveedor_at ? (
                              <span className="text-[11px] font-semibold text-emerald-600">
                                Enviada el {new Date(oc.enviada_proveedor_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                              </span>
                            ) : (
                              <span className="text-[11px] text-muted-foreground">No enviada</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── TAB: Herramientas de Administrador — purga de datos de prueba ── */}
          {activeTab === 'admin-purga' && isAdminRole && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
                <p className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-700">
                  <IconAlertTriangle className="h-4 w-4" /> Zona de riesgo — borrado físico e irreversible
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Selecciona registros de prueba a eliminar. El borrado no se puede deshacer.
                  Proyectos y Usuarios no están incluidos en esta herramienta.
                </p>
              </div>

              {loadingPurga ? (
                <div className="flex h-40 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500/10 border-t-amber-600" />
                </div>
              ) : (
                <>
                  {([
                    { tipo: 'req' as const, titulo: 'Requisiciones', items: purgaResumen.requisiciones, sel: purgaSelReq,
                      cols: (r: PurgaRequisicionItem) => [r.codigo, r.estado, new Date(r.fecha_solicitud).toLocaleDateString('es-MX')] },
                    { tipo: 'oc' as const, titulo: 'Órdenes de Compra', items: purgaResumen.ordenes_compra, sel: purgaSelOc,
                      cols: (o: PurgaOrdenCompraItem) => [o.codigo, o.proveedor, `$${Number(o.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`] },
                    { tipo: 'prov' as const, titulo: 'Proveedores', items: purgaResumen.proveedores, sel: purgaSelProv,
                      cols: (p: PurgaProveedorItem) => [p.razon_social, p.rfc_tax_id, p.estatus] },
                  ]).map(({ tipo, titulo, items, sel, cols }) => (
                    <div key={tipo} className="overflow-hidden rounded-2xl border border-border/30">
                      <div className="flex items-center justify-between bg-muted/40 px-3 py-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          {titulo} ({sel.size} de {items.length} seleccionado{sel.size === 1 ? '' : 's'})
                        </p>
                      </div>
                      {items.length === 0 ? (
                        <p className="p-4 text-center text-xs text-muted-foreground">Sin registros.</p>
                      ) : (
                        <table className="w-full text-left text-xs">
                          <tbody>
                            {items.map((item: any, idx: number) => (
                              <tr key={item.id} className={cn('border-t border-border/20', idx % 2 === 1 && 'bg-muted/10')}>
                                <td className="w-10 px-3 py-2">
                                  <input
                                    type="checkbox"
                                    checked={sel.has(item.id)}
                                    onChange={() => togglePurgaSeleccion(tipo, item.id)}
                                    className="h-4 w-4 rounded border-border/50"
                                  />
                                </td>
                                {cols(item).map((c: string, i: number) => (
                                  <td key={i} className="px-3 py-2 text-foreground">{c}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  ))}

                  <div className="flex justify-end">
                    <Button
                      onClick={() => { setPurgaBloqueo(null); setPurgaConfirmText(''); setShowPurgaModal(true); }}
                      disabled={purgaTotalSeleccionado === 0}
                      className="rounded-xl bg-red-600 px-4 text-xs font-black uppercase tracking-widest text-white hover:bg-red-500 disabled:opacity-40"
                    >
                      <IconTrash2 className="h-4 w-4" />
                      Purgar seleccionados ({purgaTotalSeleccionado})
                    </Button>
                  </div>
                </>
              )}

              {showPurgaModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                  <div className="w-full max-w-md rounded-2xl border border-border/30 bg-card p-6 shadow-2xl">
                    <p className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-red-600">
                      <IconAlertTriangle className="h-5 w-5" /> Confirmar purga
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Vas a eliminar <strong>{purgaTotalSeleccionado}</strong> registro(s) de forma permanente.
                      Escribe <strong>ELIMINAR</strong> para confirmar.
                    </p>

                    {purgaBloqueo && (
                      <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-700">
                        No se puede purgar {purgaBloqueo.entidad} — quedan referencias sin incluir en la selección:
                        <ul className="mt-1 list-disc pl-4">
                          {purgaBloqueo.bloqueos.map((b, i) => (
                            <li key={i}>{b.tipo}: {b.cantidad}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <input
                      type="text"
                      value={purgaConfirmText}
                      onChange={(e) => setPurgaConfirmText(e.target.value)}
                      placeholder="ELIMINAR"
                      className="mt-4 w-full rounded-xl border border-border/50 bg-background px-3 py-2 text-sm"
                    />

                    <div className="mt-5 flex justify-end gap-2">
                      <Button
                        onClick={() => { setShowPurgaModal(false); setPurgaConfirmText(''); setPurgaBloqueo(null); }}
                        className="rounded-xl bg-muted px-4 text-xs font-black uppercase tracking-widest text-foreground hover:bg-muted/80"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleEjecutarPurga}
                        disabled={purgaConfirmText !== 'ELIMINAR' || purgando}
                        className="rounded-xl bg-red-600 px-4 text-xs font-black uppercase tracking-widest text-white hover:bg-red-500 disabled:opacity-40"
                      >
                        {purgando ? 'Eliminando…' : 'Eliminar definitivamente'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TAB: Trazabilidad de Materiales ──────────────────────────────── */}
          {activeTab === 'trazabilidad' && (() => {
            const semColors: Record<string, { row: string; badge: string; dot: string; label: string }> = {
              VERDE:    { row: 'bg-green-500/5',  badge: 'bg-green-500/10 text-green-700 border-green-500/20',  dot: 'bg-green-500',  label: 'OC Emitida' },
              AMARILLO: { row: 'bg-amber-500/5',  badge: 'bg-amber-500/10 text-amber-700 border-amber-500/20',  dot: 'bg-amber-500',  label: 'Req sin OC' },
              ROJO:     { row: 'bg-red-500/5',    badge: 'bg-red-500/10 text-red-700 border-red-500/20',        dot: 'bg-red-500',    label: 'Sin Req' },
              EXTRA:    { row: 'bg-slate-500/5',  badge: 'bg-slate-500/10 text-slate-500 border-slate-500/20',  dot: 'bg-slate-400',  label: 'Extra' },
            };

            const filtrado = trazabilidad
              .filter(m => trazFilter === 'TODOS' || m.semaforo === trazFilter)
              .filter(m => {
                if (!trazSearch.trim()) return true;
                const q = trazSearch.toLowerCase();
                return (m.insumo_id ?? '').toLowerCase().includes(q)
                  || (m.descripcion_libre ?? '').toLowerCase().includes(q);
              });

            const contadores = { ROJO: 0, AMARILLO: 0, VERDE: 0, EXTRA: 0 };
            trazabilidad.forEach(m => { contadores[m.semaforo] = (contadores[m.semaforo] ?? 0) + 1; });

            const enRiesgo = cpResumen
              ? cpResumen.total_comprometido > cpResumen.total_presupuestado * 0.85
              : false;

            return (
              <div className="space-y-4">
                {/* ── Widget resumen presupuestal (Tasks 7.1–7.3) ──────────── */}
                {cpResumen && (
                  <div className={`rounded-2xl border p-4 ${enRiesgo ? 'border-red-500/30 bg-red-500/5' : 'border-border/30 bg-card'}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Presupuesto del Proyecto
                        {cpResumen.parcial && <span className="ml-2 text-amber-600">(datos parciales)</span>}
                      </p>
                      {enRiesgo && (
                        <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-white">
                          Presupuesto en riesgo
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                      {[
                        { label: 'Presupuestado', val: cpResumen.total_presupuestado, color: 'text-foreground' },
                        { label: 'Comprometido',  val: cpResumen.total_comprometido,  color: enRiesgo ? 'text-red-600' : 'text-amber-600' },
                        { label: 'Pagado',        val: cpResumen.total_pagado,         color: 'text-emerald-600' },
                        { label: 'Disponible',    val: cpResumen.total_disponible,     color: cpResumen.total_disponible < 0 ? 'text-destructive' : 'text-indigo-600' },
                        { label: '% Ejercido',    val: null, pct: cpResumen.pct_ejercido, color: 'text-primary' },
                      ].map(k => (
                        <div key={k.label} className="text-center">
                          <p className={`text-sm font-black ${k.color}`}>
                            {k.pct !== undefined ? `${k.pct}%` : formatMXN(k.val!)}
                          </p>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{k.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {cpResumenLoading && !cpResumen && (
                  <div className="rounded-2xl border border-border/30 bg-card p-4 text-center text-[10px] text-muted-foreground">
                    Cargando resumen presupuestal…
                  </div>
                )}

                {/* Filtros semáforo */}
                <div className="flex flex-wrap items-center gap-2">
                  {(['TODOS', 'ROJO', 'AMARILLO', 'VERDE', 'EXTRA'] as const).map(f => (
                    <button key={f} type="button"
                      onClick={() => setTrazFilter(f)}
                      className={cn(
                        'rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all',
                        trazFilter === f
                          ? f === 'ROJO' ? 'bg-red-500 text-white'
                          : f === 'AMARILLO' ? 'bg-amber-500 text-white'
                          : f === 'VERDE' ? 'bg-green-600 text-white'
                          : f === 'EXTRA' ? 'bg-slate-500 text-white'
                          : 'bg-foreground text-background'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      )}
                    >
                      {f === 'TODOS' ? `Todos (${trazabilidad.length})`
                        : `${f === 'ROJO' ? '🔴' : f === 'AMARILLO' ? '🟡' : f === 'VERDE' ? '🟢' : '⚪'} ${f} (${contadores[f as keyof typeof contadores] ?? 0})`}
                    </button>
                  ))}
                  <div className="relative ml-auto">
                    <IconSearch className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <input type="text" placeholder="Buscar insumo…"
                      value={trazSearch} onChange={e => setTrazSearch(e.target.value)}
                      className="rounded-xl border border-border/40 bg-background pl-9 pr-3 py-1.5 text-xs outline-none focus:border-emerald-400 w-56"
                    />
                  </div>
                </div>

                {loadingTraz ? (
                  <div className="py-16 text-center text-sm text-muted-foreground">Calculando trazabilidad…</div>
                ) : filtrado.length === 0 ? (
                  <div className="py-16 text-center text-sm text-muted-foreground">Sin materiales para mostrar.</div>
                ) : (
                  <Card className="overflow-hidden rounded-3xl border-border/40 shadow-xl">
                    <TableContainer>
                      <Table className="min-w-[900px]">
                        <TableHeader>
                          <tr>
                            <TableHead className="w-8"></TableHead>
                            <TableHead>Insumo</TableHead>
                            <TableHead className="text-right">Presup.</TableHead>
                            <TableHead className="text-right">Req.</TableHead>
                            <TableHead className="text-right">OC Emit.</TableHead>
                            <TableHead className="text-right">Surtido</TableHead>
                            <TableHead className="text-right">% OC</TableHead>
                            <TableHead className="text-right">Gasto OC</TableHead>
                            <TableHead className="w-10"></TableHead>
                          </tr>
                        </TableHeader>
                        <TableBody>
                          {filtrado.map((mat, mi) => {
                            const sc = semColors[mat.semaforo] ?? semColors.EXTRA;
                            const rowKey = mat.insumo_id ?? `libre-${mi}`;
                            const isExpanded = expandedTrazId === rowKey;
                            return (
                              <React.Fragment key={rowKey}>
                                <TableRow
                                  className={cn('cursor-pointer hover:brightness-95 transition-all', sc.row)}
                                  onClick={() => setExpandedTrazId(isExpanded ? null : rowKey)}
                                >
                                  <TableCell>
                                    <span className={cn('inline-block h-2.5 w-2.5 rounded-full', sc.dot)} />
                                  </TableCell>
                                  <TableCell className="max-w-[260px]">
                                    <p className="text-xs font-semibold truncate">
                                      {mat.descripcion_libre ?? mat.insumo_id ?? '—'}
                                    </p>
                                    <span className={cn('mt-0.5 inline-block rounded border px-1.5 py-0.5 text-[8px] font-black', sc.badge)}>
                                      {sc.label}
                                    </span>
                                    {mat.tiene_justificacion && (
                                      <span className="ml-1.5 inline-block rounded border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 text-[8px] font-black text-amber-700">
                                        Justificado
                                      </span>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right text-xs font-bold">
                                    {mat.cantidad_presupuestada > 0 ? mat.cantidad_presupuestada.toLocaleString('es-MX') : '—'}
                                  </TableCell>
                                  <TableCell className="text-right text-xs">
                                    {mat.cantidad_requisicionada.toLocaleString('es-MX')}
                                  </TableCell>
                                  <TableCell className="text-right text-xs">
                                    {mat.cantidad_oc_emitida.toLocaleString('es-MX')}
                                  </TableCell>
                                  <TableCell className="text-right text-xs text-muted-foreground">
                                    {mat.cantidad_surtida.toLocaleString('es-MX')}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {mat.pct_avance_oc != null ? (
                                      <span className={cn('text-xs font-black', mat.pct_avance_oc >= 100 ? 'text-green-600' : mat.pct_avance_oc >= 50 ? 'text-amber-600' : 'text-red-600')}>
                                        {mat.pct_avance_oc}%
                                      </span>
                                    ) : <span className="text-xs text-muted-foreground">—</span>}
                                  </TableCell>
                                  <TableCell className="text-right text-xs font-bold">
                                    {mat.monto_oc_emitida > 0 ? formatMXN(mat.monto_oc_emitida) : '—'}
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-muted-foreground text-[10px]">{isExpanded ? '▲' : '▼'}</span>
                                  </TableCell>
                                </TableRow>
                                {/* Fila expandida: justificaciones + extras asignados */}
                                {isExpanded && (
                                  <TableRow className={sc.row}>
                                    <TableCell colSpan={9} className="px-8 pb-4 pt-1">
                                      {mat.justificaciones.length > 0 && (
                                        <div className="mb-3">
                                          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Justificaciones</p>
                                          {mat.justificaciones.map((j, ji) => (
                                            <p key={ji} className="text-[10px] text-amber-700 bg-amber-500/10 rounded-lg px-3 py-1.5 mb-1">
                                              "{j}"
                                            </p>
                                          ))}
                                        </div>
                                      )}
                                      {mat.extras_asignados.length > 0 && (
                                        <div className="mb-3">
                                          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Incisos asignados a concepto</p>
                                          {mat.extras_asignados.map(ea => (
                                            <div key={ea.asignacion_id} className="flex items-center justify-between rounded-lg border border-slate-500/20 bg-background px-3 py-1.5 mb-1">
                                              <div>
                                                <span className="text-[10px] font-mono font-black text-slate-700">{ea.concepto_clave}</span>
                                                <span className="ml-2 text-[10px] text-muted-foreground">{ea.concepto_descripcion}</span>
                                              </div>
                                              <div className="flex items-center gap-3">
                                                <span className="text-xs font-bold">{formatMXN(ea.monto_extra)}</span>
                                                {isProcurement && (
                                                  <button type="button"
                                                    onClick={e => { e.stopPropagation(); handleEliminarAsignacion(ea.asignacion_id); }}
                                                    className="text-[9px] text-red-500 hover:underline"
                                                  >Eliminar</button>
                                                )}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                      {/* Botón asignar a concepto (solo para EXTRA sin asignación o procurement) */}
                                      {isProcurement && mat.es_extra && mat.extras_asignados.length === 0 && (
                                        <button type="button"
                                          onClick={e => { e.stopPropagation(); setAsignacionPanel({ itemId: mat.items_ids[0] ?? '', insumoDesc: mat.descripcion_libre ?? mat.insumo_id ?? '' }); setAsignForm({ concepto_id: '', concepto_clave: '', concepto_descripcion: '', monto_extra: '' }); }}
                                          className="flex items-center gap-1.5 rounded-xl border border-dashed border-emerald-500/40 px-4 py-2 text-[10px] font-black text-emerald-600 hover:bg-emerald-500/5"
                                        >
                                          <IconPlus className="h-3 w-3" /> Asignar a partida del catálogo
                                        </button>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Card>
                )}
              {/* ── 6.11 + Group 7: Resumen por Concepto ──────────────────── */}
              {(() => {
                const resumenConceptos: Array<{
                  concepto_id: string; concepto_clave: string; concepto_descripcion: string;
                  monto_total_extra: number;
                  incisos: Array<{ asignacion_id: string; insumo_desc: string; justificaciones: string[]; monto_extra: number }>;
                }> = [];
                const map = new Map<string, typeof resumenConceptos[number]>();
                for (const mat of trazabilidad) {
                  for (const ea of mat.extras_asignados) {
                    if (!map.has(ea.concepto_id)) {
                      const entry = { concepto_id: ea.concepto_id, concepto_clave: ea.concepto_clave, concepto_descripcion: ea.concepto_descripcion, monto_total_extra: 0, incisos: [] };
                      map.set(ea.concepto_id, entry);
                      resumenConceptos.push(entry);
                    }
                    const e = map.get(ea.concepto_id)!;
                    e.monto_total_extra += ea.monto_extra;
                    e.incisos.push({ asignacion_id: ea.asignacion_id, insumo_desc: mat.descripcion_libre ?? mat.insumo_id ?? '—', justificaciones: mat.justificaciones, monto_extra: ea.monto_extra });
                  }
                }
                resumenConceptos.sort((a, b) => a.concepto_clave.localeCompare(b.concepto_clave));
                if (resumenConceptos.length === 0) return null;
                return (
                  <div className="space-y-3">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Resumen por concepto</p>
                    <Card className="overflow-hidden rounded-2xl border-border/40">
                      {resumenConceptos.map(concepto => {
                        const isExp = expandedConceptoId === concepto.concepto_id;
                        return (
                          <div key={concepto.concepto_id} className="border-b border-border/20 last:border-0">
                            <button
                              type="button"
                              onClick={() => setExpandedConceptoId(isExp ? null : concepto.concepto_id)}
                              className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="text-[10px] font-mono font-black text-indigo-700 shrink-0">{concepto.concepto_clave}</span>
                                <span className="text-xs text-foreground truncate">{concepto.concepto_descripcion}</span>
                                <span className="shrink-0 rounded border border-slate-500/20 bg-slate-500/10 px-1.5 py-0.5 text-[8px] font-black text-slate-500">
                                  {concepto.incisos.length} inciso{concepto.incisos.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <span className="text-xs font-black text-amber-700">{formatMXN(concepto.monto_total_extra)}</span>
                                <span className="text-[10px] text-muted-foreground">{isExp ? '▲' : '▼'}</span>
                              </div>
                            </button>
                            {isExp && (
                              <div className="px-4 pb-3 space-y-1.5 bg-muted/20">
                                {concepto.incisos.map((inc) => (
                                  <div key={inc.asignacion_id} className="flex items-start justify-between rounded-xl border border-border/30 bg-background px-3 py-2 gap-3">
                                    <div className="min-w-0 flex-1">
                                      <p className="text-[10px] font-semibold text-foreground truncate">{inc.insumo_desc}</p>
                                      {inc.justificaciones[0] && (
                                        <p className="text-[9px] text-amber-600 mt-0.5 italic">"{inc.justificaciones[0]}"</p>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <span className="text-xs font-bold">{formatMXN(inc.monto_extra)}</span>
                                      {isProcurement && (
                                        <button type="button"
                                          onClick={() => handleEliminarAsignacion(inc.asignacion_id)}
                                          className="rounded-lg border border-red-500/20 px-2 py-0.5 text-[9px] font-black text-red-500 hover:bg-red-500/5"
                                        >Eliminar</button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </Card>
                  </div>
                );
              })()}
            </div>
            );
          })()}

        </>
      )}

      {/* ── SLIDE PANEL: Asignación Extra a Concepto ─────────────────────── */}
      <SlidePanel
        isOpen={!!asignacionPanel}
        onClose={() => setAsignacionPanel(null)}
        title="Asignar a partida del catálogo"
        subtitle={asignacionPanel?.insumoDesc ?? ''}
        accentColor="emerald"
      >
        <div className="space-y-4 pt-2">
          <p className="text-[10px] text-muted-foreground">
            Asigna este material fuera de presupuesto a un concepto del catálogo como inciso extra.
          </p>
          <FormField label="Clave del concepto" required>
            <Input
              value={asignForm.concepto_clave}
              onChange={e => setAsignForm(f => ({ ...f, concepto_clave: e.target.value }))}
              placeholder="Ej. 02.03.01"
            />
          </FormField>
          <FormField label="Descripción del concepto" required>
            <Input
              value={asignForm.concepto_descripcion}
              onChange={e => setAsignForm(f => ({ ...f, concepto_descripcion: e.target.value }))}
              placeholder={'Ej. Suministro e instalación de tubería HG 2"'}
            />
          </FormField>
          <FormField label="ID del concepto (UUID)" required hint="Puedes obtenerlo del catálogo en Gerencia Técnica">
            <Input
              value={asignForm.concepto_id}
              onChange={e => setAsignForm(f => ({ ...f, concepto_id: e.target.value }))}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            />
          </FormField>
          <FormField label="Monto extra (MXN)" required>
            <Input
              type="number" min="0" step="0.01"
              value={asignForm.monto_extra}
              onChange={e => setAsignForm(f => ({ ...f, monto_extra: e.target.value }))}
              placeholder="0.00"
            />
          </FormField>
          <SubmitButton
            label="Guardar asignación"
            loading={asignSubmitting}
            color="emerald"
            onClick={handleSubmitAsignacion}
          />
        </div>
      </SlidePanel>

      {/* ── SLIDE PANEL: Solicitud de Cotización ─────────────────────────── */}
      {solicitudPanelReqId && (() => {
        const req = requisiciones.find(r => r.id === solicitudPanelReqId);
        const solic = solicitudesMap[solicitudPanelReqId];
        const provsFiltrados = proveedoresList.filter(p => p.estatus === 'ACTIVO');
        return (
          <SlidePanel
            isOpen={true}
            onClose={() => setSolicitudPanelReqId(null)}
            title="Solicitud de Cotización"
            subtitle={req ? `${req.folio} · ${req.items?.length ?? 0} partida(s)` : ''}
            accentColor="sky"
          >
            <div className="space-y-5 p-1">
              {/* ── Notas internas del Residente para Compras — NUNCA se envían a proveedores ── */}
              {req?.observaciones_internas && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/5 px-3 py-2.5 space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-700">
                    🔒 Notas internas (solo Compras — no se envían a proveedores)
                  </p>
                  <p className="text-[10px] whitespace-pre-line text-foreground/90">{req.observaciones_internas}</p>
                </div>
              )}
              {/* ── Consideraciones generales del Residente (observaciones de la requisición) ── */}
              {req?.observaciones && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-3 py-2.5 space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">
                    ⚠ Consideraciones del Residente (para proveedores)
                  </p>
                  <p className="text-[10px] whitespace-pre-line text-foreground/90">{req.observaciones}</p>
                </div>
              )}
              {/* ── Partidas de la requisición (solo lectura) ── */}
              {(req?.items ?? []).length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Partidas ({req!.items!.length})
                  </p>
                  {req!.items!.map((item, idx) => {
                    const info = insumos.find(i => i.id === item.insumo_id);
                    const desc = info?.descripcion ?? item.descripcion_libre ?? '—';
                    return (
                      <div key={item.id} className={cn('rounded-xl border px-3 py-2', idx % 2 === 0 ? 'border-border/40 bg-muted/20' : 'border-border/30 bg-transparent')}>
                        <div className="flex items-start gap-2">
                          <span className="shrink-0 rounded bg-sky-500/10 px-1.5 py-0.5 text-[9px] font-black text-sky-700">{idx + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-semibold text-foreground truncate">{desc}</p>
                            <p className="text-[9px] text-muted-foreground">{item.cantidad} {item.unidad_libre ?? info?.unidad ?? ''}</p>
                            {item.especificacion_marca_modelo && (
                              <p className="mt-0.5 text-[9px] text-indigo-700 font-medium">Ref: {item.especificacion_marca_modelo}</p>
                            )}
                            {item.especificacion_detalle && (
                              <p className="mt-0.5 text-[9px] text-muted-foreground whitespace-pre-line">{item.especificacion_detalle}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {/* ── Si ya existe solicitud, mostrar estado de proveedores ── */}
              {solic && !editandoProveedores ? (
                <div className="space-y-3">
                  {/* Resumen de plazo */}
                  <div className={cn(
                    'flex items-center gap-2 rounded-xl border px-4 py-3',
                    solic.alerta_plazo
                      ? 'border-red-500/30 bg-red-500/5'
                      : 'border-sky-500/20 bg-sky-500/5'
                  )}>
                    {solic.alerta_plazo
                      ? <IconAlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
                      : <IconClock className="h-4 w-4 shrink-0 text-sky-500" />
                    }
                    <div>
                      <p className={cn('text-xs font-black', solic.alerta_plazo ? 'text-red-600' : 'text-sky-700')}>
                        {solic.alerta_plazo
                          ? `Plazo vencido · ${Math.abs(solic.dias_habiles_restantes)} día(s) de retraso`
                          : `${solic.dias_habiles_restantes} día(s) hábil(es) restante(s)`
                        }
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Límite: {new Date(solic.fecha_limite).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {' · '}{solic.dias_habiles} días hábiles
                      </p>
                    </div>
                  </div>

                  {/* Lista de proveedores con su estado */}
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Proveedores ({solic.proveedores.length})
                  </p>
                  <div className="space-y-2">
                    {solic.proveedores.map(scp => (
                      <div key={scp.id_scp} className="rounded-xl border border-border/40 bg-muted/30 px-4 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate">{scp.proveedor_nombre}</p>
                            {scp.pdf_nombre && (
                              <a
                                href={`/api/v1/compras/requisiciones/${solicitudPanelReqId}/solicitud-cotizacion/proveedores/${scp.id_scp}/pdf`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 mt-0.5 text-[10px] text-sky-600 hover:underline"
                              >
                                <IconFileText className="h-3 w-3" />
                                {scp.pdf_nombre}
                              </a>
                            )}
                          </div>
                          <span className={cn('shrink-0 rounded-full px-2.5 py-0.5 text-[9px] font-black',
                            scp.estado === 'RESPONDIO' ? 'bg-green-500/10 text-green-700' :
                            scp.estado === 'DECLINO'   ? 'bg-slate-500/10 text-slate-500' :
                                                         'bg-amber-500/10 text-amber-700'
                          )}>
                            {scp.estado === 'RESPONDIO' ? 'Respondió' : scp.estado === 'DECLINO' ? 'Declinó' : 'Pendiente'}
                          </span>
                        </div>
                        {scp.estado === 'PENDIENTE' && isProcurement && (
                          <div className="flex gap-2 mt-2">
                            <button
                              type="button"
                              onClick={() => handleMarcarRespondio(solicitudPanelReqId, scp.id_scp)}
                              className="flex items-center gap-1 rounded-lg bg-green-500/10 px-3 py-1.5 text-[10px] font-black text-green-700 hover:bg-green-500/20"
                            >
                              <IconCheckCircle2 className="h-3 w-3" /> Respondió
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMarcarDeclino(solicitudPanelReqId, scp.id_scp)}
                              className="flex items-center gap-1 rounded-lg bg-slate-500/10 px-3 py-1.5 text-[10px] font-black text-slate-600 hover:bg-slate-500/20"
                            >
                              <IconX className="h-3 w-3" /> Declinó
                            </button>
                          </div>
                        )}
                        {scp.estado === 'RESPONDIO' && (
                          <p className="mt-2 text-[10px] text-muted-foreground">
                            El PDF de cotización se sube desde el cuadro comparativo.
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Botón para seleccionar otros/más proveedores */}
                  {isProcurement && (
                    <button
                      type="button"
                      onClick={() => setEditandoProveedores(true)}
                      className="w-full rounded-xl border border-sky-500/40 bg-sky-500/5 py-2.5 text-[10px] font-black uppercase tracking-widest text-sky-700 hover:bg-sky-500/10"
                    >
                      ✎ Seleccionar otros proveedores
                    </button>
                  )}
                </div>
              ) : (
                /* ── Formulario para crear/editar la solicitud ── */
                <div className="space-y-4">
                  {solic && editandoProveedores && (
                    <div className="flex items-center justify-between rounded-xl border border-sky-500/30 bg-sky-500/5 px-3 py-2">
                      <p className="text-[10px] text-sky-700">Editando proveedores de la solicitud existente.</p>
                      <button
                        type="button"
                        onClick={() => setEditandoProveedores(false)}
                        className="text-[10px] font-black uppercase text-muted-foreground hover:text-foreground"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                  {/* Selector de proveedores */}
                  <div>
                    <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Proveedores a invitar ({solicitudForm.provsSeleccionados.length} sel.)
                    </p>
                    <div className="max-h-48 overflow-y-auto rounded-xl border border-border/40 divide-y divide-border/30">
                      {provsFiltrados.length === 0 ? (
                        <p className="p-4 text-xs text-muted-foreground text-center">Sin proveedores activos en el catálogo.</p>
                      ) : provsFiltrados.map(prov => {
                        const sel = solicitudForm.provsSeleccionados.includes(prov.id_proveedor);
                        const yaRespondio = solic?.proveedores.some(p => p.proveedor_id === prov.id_proveedor && p.estado === 'RESPONDIO');
                        return (
                          <button
                            key={prov.id_proveedor}
                            type="button"
                            disabled={yaRespondio}
                            onClick={() => setSolicitudForm(f => ({
                              ...f,
                              provsSeleccionados: sel
                                ? f.provsSeleccionados.filter(id => id !== prov.id_proveedor)
                                : [...f.provsSeleccionados, prov.id_proveedor],
                            }))}
                            className={cn(
                              'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors',
                              yaRespondio ? 'cursor-not-allowed opacity-60' : '',
                              sel ? 'bg-sky-500/10' : 'hover:bg-muted/50'
                            )}
                          >
                            <span className={cn('flex h-4 w-4 shrink-0 items-center justify-center rounded border', sel ? 'border-sky-500 bg-sky-500' : 'border-border')}>
                              {sel && <span className="text-[8px] font-black text-white">✓</span>}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold truncate">{prov.razon_social}</p>
                              {prov.ciudad && <p className="text-[10px] text-muted-foreground">{prov.ciudad}</p>}
                            </div>
                            {yaRespondio && (
                              <span className="shrink-0 rounded-full bg-green-500/10 px-2 py-0.5 text-[9px] font-black text-green-700">
                                Respondió 🔒
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Días hábiles */}
                  <div>
                    <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Plazo de respuesta</p>
                    <div className="flex gap-2">
                      {[3, 5].map(d => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setSolicitudForm(f => ({ ...f, dias_habiles: d }))}
                          className={cn(
                            'flex-1 rounded-xl border py-2 text-xs font-black transition-all',
                            solicitudForm.dias_habiles === d
                              ? 'border-sky-500 bg-sky-500/10 text-sky-700'
                              : 'border-border/40 text-muted-foreground hover:border-sky-500/40'
                          )}
                        >
                          {d} días hábiles
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tema del correo */}
                  <div>
                    <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tema del correo</p>
                    <div className="flex gap-2">
                      {([['claro', 'Claro'], ['oscuro', 'Oscuro']] as const).map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setSolicitudForm(f => ({ ...f, tema: value }))}
                          className={cn(
                            'flex-1 rounded-xl border py-2 text-xs font-black transition-all',
                            solicitudForm.tema === value
                              ? 'border-sky-500 bg-sky-500/10 text-sky-700'
                              : 'border-border/40 text-muted-foreground hover:border-sky-500/40'
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notas */}
                  <div>
                    <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Notas adicionales</p>
                    <textarea
                      value={solicitudForm.notas}
                      onChange={e => setSolicitudForm(f => ({ ...f, notas: e.target.value }))}
                      rows={3}
                      placeholder="Instrucciones especiales para los proveedores…"
                      className="w-full rounded-xl border border-border/40 bg-background px-3 py-2 text-xs outline-none focus:border-sky-400 resize-none placeholder:text-muted-foreground/60"
                    />
                  </div>
                </div>
              )}

              {/* Advertencia de stock disponible en Almacén — no bloquea, solo
                  exige confirmación explícita antes de enviar (ver
                  openspec/changes/validar-stock-antes-cotizar-externo). */}
              {(!solic || editandoProveedores) && isProcurement && !!stockAdvertencia?.length && !stockConfirmado && (
                <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4">
                  <p className="mb-2 text-xs font-black uppercase tracking-widest text-amber-700">
                    ⚠ Ya hay stock disponible en Almacén
                  </p>
                  <ul className="mb-3 space-y-1 text-xs text-amber-800">
                    {stockAdvertencia.map(s => {
                      const info = insumos.find(i => i.id === s.insumo_id);
                      const item = req?.items?.find(it => it.insumo_id === s.insumo_id);
                      const label = info?.clave ? `[${info.clave}] ${info.descripcion}` : (item?.descripcion_libre ?? s.insumo_id);
                      return (
                        <li key={s.insumo_id}>
                          {label} — se piden {s.cantidad_solicitada}, hay {s.stock_disponible} en almacén
                        </li>
                      );
                    })}
                  </ul>
                  <button
                    type="button"
                    onClick={() => setStockConfirmado(true)}
                    className="rounded-xl border border-amber-600/50 px-3 py-1.5 text-xs font-black text-amber-800 hover:bg-amber-500/20"
                  >
                    Entiendo, enviar de todos modos
                  </button>
                </div>
              )}

              {/* Botón enviar — al crear la primera solicitud, o al editar proveedores de una existente */}
              {(!solic || editandoProveedores) && isProcurement && (!stockAdvertencia?.length || stockConfirmado) && (
                <SubmitButton
                  label={
                    solicitudSubmitting ? 'Enviando…'
                    : solic ? `Actualizar Solicitud · ${solicitudForm.provsSeleccionados.length} prov.`
                    : `Enviar Solicitud · ${solicitudForm.provsSeleccionados.length} prov.`
                  }
                  loading={solicitudSubmitting}
                  color="sky"
                  onClick={() => handleSubmitSolicitud(solicitudPanelReqId)}
                />
              )}
            </div>
          </SlidePanel>
        );
      })()}

      {/* ── SLIDE PANEL: Nueva Requisición ──────────────────────────────────── */}
      <SlidePanel
        isOpen={showReqForm}
        onClose={() => { setShowReqForm(false); resetReqForm(); }}
        title="Nueva Requisición"
        subtitle={reqForm.tipo === 'IMPREVISTO' ? 'Imprevisto de obra — texto libre' : 'Solicitud de compra de insumos'}
        accentColor={reqForm.tipo === 'IMPREVISTO' ? 'amber' : 'emerald'}
      >
        <div className="space-y-5">

          {/* ── Selector partida del catálogo ── */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Partida del catálogo <span className="text-red-500">*</span>
            </label>
            {reqConceptoId ? (
              <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-emerald-700">[{reqConceptoClave}] {reqConceptoDesc}</p>
                </div>
                <button type="button" onClick={() => { setReqConceptoId(null); setReqConceptoClave(''); setReqConceptoDesc(''); setReqConceptoSearch(''); }}
                  className="ml-2 shrink-0 text-muted-foreground hover:text-foreground">
                  <IconX className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <IconSearch className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    className="w-full rounded-xl border border-border/40 bg-muted/30 pl-9 pr-3 py-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                    placeholder="Buscar partida por clave o descripción..."
                    value={reqConceptoSearch}
                    onChange={e => setReqConceptoSearch(e.target.value)}
                  />
                </div>
                {conceptosCompras.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground px-1">Sin presupuesto activo. Crea el presupuesto en Gerencia Técnica primero.</p>
                ) : (
                  <div className="max-h-40 overflow-y-auto rounded-xl border border-border/30 bg-card">
                    {conceptosCompras
                      .filter(c => {
                        const q = reqConceptoSearch.toLowerCase();
                        return !q || c.clave.toLowerCase().includes(q) || c.descripcion.toLowerCase().includes(q);
                      })
                      .slice(0, 20)
                      .map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => { setReqConceptoId(c.id); setReqConceptoClave(c.clave); setReqConceptoDesc(c.descripcion); setReqConceptoSearch(''); }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/60 first:rounded-t-xl last:rounded-b-xl border-b border-border/20 last:border-0"
                        >
                          <span className="shrink-0 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-black text-emerald-700">{c.clave}</span>
                          <span className="flex-1 truncate text-xs">{c.descripcion}</span>
                          <span className="shrink-0 text-[9px] text-muted-foreground">{c.unidad_medida}</span>
                        </button>
                      ))}
                    {conceptosCompras.filter(c => {
                      const q = reqConceptoSearch.toLowerCase();
                      return !q || c.clave.toLowerCase().includes(q) || c.descripcion.toLowerCase().includes(q);
                    }).length === 0 && (
                      <div className="px-4 py-3 text-xs text-muted-foreground">Sin resultados</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Selector tipo: NORMAL / IMPREVISTO ── */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tipo de requisición</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'NORMAL',     label: '📋 Normal',     sub: 'Insumos del catálogo APU' },
                { value: 'IMPREVISTO', label: '⚠️ Imprevisto', sub: 'Material sin código de catálogo' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setReqForm(f => ({ ...f, tipo: opt.value }))}
                  className={cn(
                    'flex flex-col items-start rounded-xl border px-4 py-3 text-left transition-all',
                    reqForm.tipo === opt.value
                      ? opt.value === 'IMPREVISTO'
                        ? 'border-orange-500/40 bg-orange-500/10 shadow-sm'
                        : 'border-emerald-500/40 bg-emerald-500/10 shadow-sm'
                      : 'border-border/30 bg-muted/20 hover:bg-muted/40'
                  )}
                >
                  <span className={cn(
                    'text-xs font-black',
                    reqForm.tipo === opt.value
                      ? opt.value === 'IMPREVISTO' ? 'text-orange-700' : 'text-emerald-700'
                      : 'text-foreground'
                  )}>
                    {opt.label}
                  </span>
                  <span className="mt-0.5 text-[10px] text-muted-foreground">{opt.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Imprevisto: banner informativo */}
          {reqForm.tipo === 'IMPREVISTO' && (
            <div className="flex items-start gap-3 rounded-xl border border-orange-500/20 bg-orange-500/5 px-4 py-3">
              <span className="text-orange-500 text-sm mt-0.5">⚠️</span>
              <p className="text-[10px] text-orange-700 leading-relaxed">
                Los imprevistos no requieren código de catálogo. Se registrarán como desviación en los reportes presupuestales.
                Procurement los revisará antes de cotizar.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Prioridad" required>
              <Select value={reqForm.prioridad} onChange={e => setReqForm({ ...reqForm, prioridad: e.target.value })}>
                <option value="BAJA">Baja</option>
                <option value="MEDIA">Media</option>
                <option value="ALTA">Alta</option>
              </Select>
            </FormField>
            <FormField label="Fecha requerida">
              <Input type="date" value={reqForm.fecha_requerida} onChange={e => setReqForm({ ...reqForm, fecha_requerida: e.target.value })} />
            </FormField>
          </div>

          <FormField label="Notas / Justificación">
            <Textarea className="min-h-[80px]"
              placeholder={reqForm.tipo === 'IMPREVISTO' ? 'Describe el motivo del imprevisto...' : 'Justificación de la solicitud...'}
              value={reqForm.notas}
              onChange={e => setReqForm({ ...reqForm, notas: e.target.value })}
            />
          </FormField>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {reqForm.tipo === 'IMPREVISTO' ? 'Materiales imprevistos' : 'Insumos solicitados'} <span className="text-red-500">*</span>
              </label>
              <Button onClick={addItem} variant="ghost" className="h-auto px-0 py-0 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:bg-transparent hover:text-emerald-500">
                <IconPlus className="h-3 w-3" /> Agregar
              </Button>
            </div>

            {reqForm.items.map((item, idx) => (
              <Card key={idx} className="border-border/30 bg-muted/20 shadow-none">
                <CardContent className="relative space-y-3 p-4">
                  {reqForm.items.length > 1 && (
                    <Button onClick={() => removeItem(idx)} variant="destructive" size="icon"
                      className="absolute right-2 top-2 h-6 w-6 rounded-md bg-red-500/10 text-xs text-red-500 hover:bg-red-500/20">
                      <IconX className="h-3 w-3" />
                    </Button>
                  )}
                  <SectionBadge className={cn(
                    'w-fit rounded-md px-2 py-0.5 text-[9px]',
                    reqForm.tipo === 'IMPREVISTO'
                      ? 'border-orange-500/20 bg-orange-500/10 text-orange-700'
                      : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600'
                  )}>
                    #{idx + 1}
                  </SectionBadge>

                  {/* ── IMPREVISTO: campos de texto libre ── */}
                  {reqForm.tipo === 'IMPREVISTO' ? (
                    <>
                      <FormField label="Descripción del material" required>
                        <Input
                          placeholder="Ej: Tabique rojo recocido 7x14x28 cm"
                          value={item.descripcion_libre}
                          onChange={e => updateItem(idx, 'descripcion_libre', e.target.value)}
                        />
                      </FormField>
                      <div className="grid grid-cols-2 gap-3">
                        <FormField label="Unidad" required>
                          <Select value={item.unidad_libre} onChange={e => updateItem(idx, 'unidad_libre', e.target.value)}>
                            {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
                          </Select>
                        </FormField>
                        <FormField label="Cantidad" required>
                          <Input type="number" placeholder="0" value={item.cantidad} onChange={e => updateItem(idx, 'cantidad', e.target.value)} />
                        </FormField>
                      </div>
                      <FormField label="Notas">
                        <Input className="text-xs" placeholder="Frente de trabajo, área, etc." value={item.notas} onChange={e => updateItem(idx, 'notas', e.target.value)} />
                      </FormField>
                    </>
                  ) : (
                    /* ── NORMAL: búsqueda en catálogo ── */
                    <>
                      {/* Insumo seleccionado */}
                      {item.insumo_id && !itemSearch[idx] ? (
                        <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
                          <span className="text-xs font-bold text-emerald-700">{item.insumo_label}</span>
                          <button type="button" onClick={() => { updateItem(idx, 'insumo_id', ''); updateItem(idx, 'insumo_label', ''); }}
                            className="ml-2 text-muted-foreground hover:text-foreground">
                            <IconX className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div ref={itemDropdown === idx ? dropdownRef : undefined} className="relative">
                          <div className="relative">
                            <IconSearch className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              className="pl-9 text-xs"
                              placeholder="Buscar insumo por clave o nombre..."
                              value={itemSearch[idx] || ''}
                              onFocus={() => setItemDropdown(idx)}
                              onChange={e => {
                                setItemDropdown(idx);
                                setItemSearch(s => { const ns = [...s]; ns[idx] = e.target.value; return ns; });
                              }}
                            />
                          </div>
                          {itemDropdown === idx && (
                            <div className="absolute z-50 mt-1 w-full rounded-xl border border-border/40 bg-card shadow-xl">
                              {getInsumoSuggestions(idx).map(ins => (
                                <button
                                  key={ins.id}
                                  type="button"
                                  onMouseDown={() => selectInsumo(idx, ins)}
                                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/60 first:rounded-t-xl last:rounded-b-xl"
                                >
                                  <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-black text-emerald-700">{ins.clave}</span>
                                  <span className="flex-1 truncate text-xs text-foreground">{ins.descripcion}</span>
                                  <span className="shrink-0 text-[9px] text-muted-foreground">{ins.unidad}</span>
                                </button>
                              ))}
                              {getInsumoSuggestions(idx).length === 0 && (
                                <div className="px-4 py-3 text-xs text-muted-foreground">Sin resultados</div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <FormField label="Cantidad" required>
                          <Input type="number" placeholder="Cant." value={item.cantidad} onChange={e => updateItem(idx, 'cantidad', e.target.value)} />
                        </FormField>
                        <FormField label="Notas">
                          <Input className="text-xs" placeholder="Opcional" value={item.notas} onChange={e => updateItem(idx, 'notas', e.target.value)} />
                        </FormField>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="border-t border-border/40 pt-4">
            <SubmitButton
              label={!reqConceptoId ? 'Selecciona la partida del catálogo' : reqForm.tipo === 'IMPREVISTO' ? 'Crear Req. Imprevisto' : 'Crear Requisición'}
              loading={formLoading}
              color={reqForm.tipo === 'IMPREVISTO' ? 'amber' : 'emerald'}
              onClick={handleSubmitRequisicion}
            />
          </div>
        </div>
      </SlidePanel>

      {/* ── SLIDE PANEL: Agregar Insumo ──────────────────────────────────────── */}
      <SlidePanel
        isOpen={showInsumoForm}
        onClose={() => { setShowInsumoForm(false); resetInsumoForm(); }}
        title="Agregar Insumo al Catálogo"
        subtitle="Registrar material, equipo o servicio"
        accentColor="emerald"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Clave única" required hint="Ej: MAT-016, EQU-003">
              <Input placeholder="MAT-001" value={insumoForm.clave} onChange={e => setInsumoForm({ ...insumoForm, clave: e.target.value.toUpperCase() })} />
            </FormField>
            <FormField label="Categoría" required>
              <Select value={insumoForm.clase} onChange={e => setInsumoForm({ ...insumoForm, clase: e.target.value })}>
                {CLASES.map(c => <option key={c} value={c}>{CLASE_STYLE[c].label}</option>)}
              </Select>
            </FormField>
          </div>

          <FormField label="Descripción" required>
            <Input placeholder="Descripción completa del insumo..." value={insumoForm.descripcion} onChange={e => setInsumoForm({ ...insumoForm, descripcion: e.target.value })} />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Unidad de medida" required>
              <Select value={insumoForm.unidad} onChange={e => setInsumoForm({ ...insumoForm, unidad: e.target.value })}>
                {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
              </Select>
            </FormField>
            <FormField label="Precio referencia (MXN)" hint="Precio unitario aproximado">
              <Input type="number" placeholder="0.00" value={insumoForm.costo} onChange={e => setInsumoForm({ ...insumoForm, costo: e.target.value })} />
            </FormField>
          </div>

          <FormField label="Especificaciones técnicas">
            <Textarea className="min-h-[80px]" placeholder="Normas, tolerancias, marca, modelo..." value={insumoForm.especificaciones} onChange={e => setInsumoForm({ ...insumoForm, especificaciones: e.target.value })} />
          </FormField>

          <FormField label="Proveedor preferido">
            <Input placeholder="Nombre del proveedor habitual" value={insumoForm.proveedor_preferido} onChange={e => setInsumoForm({ ...insumoForm, proveedor_preferido: e.target.value })} />
          </FormField>

          {isDemo && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-[10px] font-medium text-amber-700">
              Modo demo — el insumo no se guardará en base de datos.
            </div>
          )}

          <div className="border-t border-border/40 pt-4">
            <SubmitButton label="Guardar Insumo" loading={formLoading} color="emerald" onClick={handleSubmitInsumo} />
          </div>
        </div>
      </SlidePanel>

      {/* ── Historial de Calificaciones ──────────────────────────────────── */}
      <SlidePanel
        isOpen={!!calHistorialId}
        onClose={() => setCalHistorialId(null)}
        title="Historial de Calificaciones"
        subtitle={proveedoresList.find(p => p.id_proveedor === calHistorialId)?.razon_social}
        accentColor="amber"
      >
        <div className="space-y-4">
          {/* ── Promedio global ── */}
          {calPromedios[calHistorialId ?? ''] != null && (() => {
            const score = calPromedios[calHistorialId!]!;
            const colorClass = score >= 4 ? 'text-emerald-600' : score >= 2.5 ? 'text-amber-500' : 'text-red-500';
            return (
              <div className="flex items-center gap-3 rounded-xl border border-border/40 bg-muted/20 p-3">
                <span className={`text-3xl font-black ${colorClass}`}>★ {score.toFixed(1)}</span>
                <div>
                  <p className="text-xs font-semibold text-foreground">Promedio global</p>
                  <p className="text-[10px] text-muted-foreground">{calTotales[calHistorialId!] ?? 0} calificaciones registradas</p>
                </div>
              </div>
            );
          })()}

          {/* ── Formulario calificar ── */}
          {isProcurement && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">
                {(calHistorial[calHistorialId ?? ''] ?? []).some((c: any) => c.proyecto_id === user?.projects?.[0]?.id)
                  ? 'Actualizar calificación — ' : 'Calificar en '}
                {user?.projects?.[0]?.name ?? 'proyecto actual'}
              </p>
              {/* Estrellas clicables */}
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setCalPuntuacion(String(star))}
                    className={`text-2xl transition-transform hover:scale-110 ${Number(calPuntuacion) >= star ? 'text-amber-400' : 'text-muted-foreground/30'}`}
                  >★</button>
                ))}
                {calPuntuacion && (
                  <span className="ml-2 self-center text-sm font-bold text-amber-600">{Number(calPuntuacion).toFixed(1)}</span>
                )}
              </div>
              <FormField label="Comentario (opcional)">
                <textarea
                  className="w-full rounded-xl border border-border/50 bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                  rows={3} maxLength={500} placeholder="Entrega puntual, calidad del material, cumplimiento de especificaciones..."
                  value={calComentario} onChange={e => setCalComentario(e.target.value)}
                />
              </FormField>
              <SubmitButton
                label={calSubmitting ? 'Guardando...' : (calHistorial[calHistorialId ?? ''] ?? []).some((c: any) => c.proyecto_id === user?.projects?.[0]?.id) ? 'Actualizar calificación' : 'Registrar calificación'}
                loading={calSubmitting}
                color="amber"
                onClick={async () => {
                  if (!calPuntuacion || !calHistorialId) return;
                  setCalSubmitting(true);
                  try {
                    const proyectoNombre = user?.projects?.[0]?.name ?? '';
                    const res = await api.post(`/api/v1/compras/proveedores/${calHistorialId}/calificaciones`, {
                      puntuacion: Number(calPuntuacion),
                      comentario: calComentario || undefined,
                      proyecto_nombre: proyectoNombre,
                    });
                    const { promedio_actualizado, total_calificaciones } = res.data.data;
                    // Actualizar cache y lista de proveedores
                    setCalPromedios(prev => ({ ...prev, [calHistorialId]: promedio_actualizado }));
                    setCalTotales(prev => ({ ...prev, [calHistorialId]: total_calificaciones }));
                    setProveedoresList(prev => prev.map(p =>
                      p.id_proveedor === calHistorialId ? { ...p, calificacion_desempeno: promedio_actualizado ?? undefined } : p
                    ));
                    await fetchCalHistorial(calHistorialId);
                    notify({ title: res.data.data.accion === 'created' ? 'Calificación registrada' : 'Calificación actualizada', type: 'success' });
                  } catch (err: any) {
                    notify({ title: err.response?.data?.message ?? 'Error al registrar calificación', type: 'error' });
                  } finally {
                    setCalSubmitting(false);
                  }
                }}
              />
            </div>
          )}

          {/* ── Lista historial ── */}
          {calLoading ? (
            <p className="text-sm text-muted-foreground">Cargando historial...</p>
          ) : (calHistorial[calHistorialId ?? ''] ?? []).length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/50 p-8 text-center">
              <p className="text-sm text-muted-foreground">Sin calificaciones registradas.</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">Sé el primero en calificar a este proveedor.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {(calHistorial[calHistorialId ?? ''] ?? []).map((cal: any) => {
                const s = Number(cal.puntuacion);
                const colorClass = s >= 4 ? 'text-emerald-600' : s >= 2.5 ? 'text-amber-500' : 'text-red-500';
                return (
                  <div key={cal.id_calificacion} className="rounded-xl border border-border/40 p-3 space-y-1">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold truncate">{cal.proyecto_nombre}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(cal.created_at).toLocaleDateString('es-MX')} · {cal.calificado_por_nombre}</p>
                      </div>
                      <div className="flex items-center gap-1 ml-2 shrink-0">
                        <span className={`font-black ${colorClass}`}>★</span>
                        <span className={`text-sm font-black ${colorClass}`}>{s.toFixed(1)}</span>
                        {user?.role?.includes('admin') && (
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await api.delete(`/api/v1/compras/proveedores/${calHistorialId}/calificaciones/${cal.id_calificacion}`);
                                await fetchCalHistorial(calHistorialId!);
                                const newScore = calPromedios[calHistorialId!];
                                setProveedoresList(prev => prev.map(p =>
                                  p.id_proveedor === calHistorialId ? { ...p, calificacion_desempeno: newScore ?? undefined } : p
                                ));
                                notify({ title: 'Calificación eliminada', type: 'success' });
                              } catch { notify({ title: 'Error al eliminar', type: 'error' }); }
                            }}
                            className="ml-1 rounded-lg border border-red-500/20 px-1.5 py-0.5 text-[9px] font-bold text-red-600 hover:bg-red-500/10 transition-colors"
                          >✕</button>
                        )}
                      </div>
                    </div>
                    {cal.comentario && (
                      <p className="text-[11px] text-muted-foreground italic">"{cal.comentario}"</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </SlidePanel>

      {/* ── Documentos del Proveedor ─── */}
      {/* ── Importación masiva de Proveedores (CSV/Excel) ────────────────── */}
      <SlidePanel
        isOpen={panelImportarProveedores}
        onClose={handleCerrarPanelImportarProveedores}
        title={resultadoImportProveedores ? 'Resultado de la importación' : 'Vista previa — Importación de Proveedores'}
        subtitle={archivoImportProveedoresNombre}
        accentColor="emerald"
        maxWidthClassName="max-w-4xl"
      >
        <div className="space-y-6 pb-28">
          {parseImportProveedoresError ? (
            <div className="rounded-xl bg-destructive/5 border border-destructive/20 p-4 flex gap-3">
              <IconAlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-destructive">{parseImportProveedoresError}</p>
            </div>
          ) : resultadoImportProveedores ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
                  <p className="text-2xl font-black text-emerald-600">{resultadoImportProveedores.creados}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600/70 mt-1">Proveedores creados</p>
                </div>
                <div className={cn('rounded-2xl p-4 text-center border', resultadoImportProveedores.errores.length > 0 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-muted/30 border-border/30')}>
                  <p className={cn('text-2xl font-black', resultadoImportProveedores.errores.length > 0 ? 'text-amber-600' : 'text-muted-foreground')}>{resultadoImportProveedores.errores.length}</p>
                  <p className={cn('text-[9px] font-black uppercase tracking-widest mt-1', resultadoImportProveedores.errores.length > 0 ? 'text-amber-600/70' : 'text-muted-foreground')}>Filas con error</p>
                </div>
              </div>

              {resultadoImportProveedores.errores.length > 0 && (
                <div className="rounded-2xl border border-border/40 overflow-hidden">
                  <TableScrollShadow className="max-h-[420px] overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="sticky top-0 bg-muted/80 backdrop-blur z-10">
                        <tr className="border-b border-border/40">
                          <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Fila</th>
                          <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Motivo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/20">
                        {resultadoImportProveedores.errores.map((e, i) => (
                          <tr key={i}>
                            <td className="px-4 py-2.5 font-black text-amber-600">{e.fila}</td>
                            <td className="px-4 py-2.5 text-foreground">{e.motivo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </TableScrollShadow>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
                  <p className="text-2xl font-black text-emerald-600">{filasImportProveedores.filter(f => f._valido).length}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600/70 mt-1">Listos para importar</p>
                </div>
                <div className={cn('rounded-2xl p-4 text-center border', filasImportProveedores.some(f => !f._valido) ? 'bg-amber-500/10 border-amber-500/20' : 'bg-muted/30 border-border/30')}>
                  <p className={cn('text-2xl font-black', filasImportProveedores.some(f => !f._valido) ? 'text-amber-600' : 'text-muted-foreground')}>{filasImportProveedores.filter(f => !f._valido).length}</p>
                  <p className={cn('text-[9px] font-black uppercase tracking-widest mt-1', filasImportProveedores.some(f => !f._valido) ? 'text-amber-600/70' : 'text-muted-foreground')}>Con error</p>
                </div>
              </div>

              <div className="rounded-2xl border border-border/40 overflow-hidden">
                <TableScrollShadow className="max-h-[420px] overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-muted/80 backdrop-blur z-10">
                      <tr className="border-b border-border/40">
                        <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Estado</th>
                        <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">RFC</th>
                        <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Razon Social</th>
                        <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Calificación</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {filasImportProveedores.map((row, i) => (
                        <tr key={i} className={cn('transition-colors', row._valido ? 'hover:bg-emerald-500/[0.03]' : 'bg-amber-500/5 opacity-60')}>
                          <td className="px-4 py-2.5 text-center">
                            {row._valido
                              ? <IconCheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                              : <span className="text-[9px] text-amber-600 font-bold" title={row._error}>error</span>
                            }
                          </td>
                          <td className="px-4 py-2.5 font-mono text-muted-foreground">{row.rfc_tax_id || '—'}</td>
                          <td className="px-4 py-2.5 font-bold text-foreground">{row.razon_social || '—'}</td>
                          <td className="px-4 py-2.5 text-muted-foreground">{row.calificacion_desempeno || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TableScrollShadow>
              </div>
            </>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 bg-card/95 backdrop-blur border-t border-border/40 flex items-center justify-end gap-3">
          {resultadoImportProveedores || parseImportProveedoresError ? (
            <button
              onClick={handleCerrarPanelImportarProveedores}
              className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all"
            >
              Cerrar
            </button>
          ) : (
            <>
              <button
                onClick={handleCerrarPanelImportarProveedores}
                className="px-5 py-2.5 rounded-xl border border-border/60 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarImportProveedores}
                disabled={importandoProveedores || filasImportProveedores.length === 0}
                className="px-6 py-3 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-600/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {importandoProveedores ? 'Importando...' : `Importar ${filasImportProveedores.length} registro${filasImportProveedores.length === 1 ? '' : 's'}`}
              </button>
            </>
          )}
        </div>
      </SlidePanel>

      <SlidePanel
        isOpen={!!docsProveedorId}
        onClose={() => setDocsProveedorId(null)}
        title="Documentos del Proveedor"
        subtitle={proveedoresList.find(p => p.id_proveedor === docsProveedorId)?.razon_social}
        accentColor="sky"
      >
        <div className="space-y-4">
          {docsLoading ? (
            <p className="text-sm text-muted-foreground">Cargando documentos...</p>
          ) : (docsProveedor[docsProveedorId ?? ''] ?? []).length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/50 p-8 text-center">
              <p className="text-sm text-muted-foreground">Sin documentos registrados</p>
            </div>
          ) : (
            <div className="space-y-2">
              {(docsProveedor[docsProveedorId ?? ''] ?? []).map((doc: any) => {
                const TIPO_STYLE: Record<string, string> = {
                  CSD: 'bg-blue-500/10 text-blue-700', OPINION_SAT: 'bg-emerald-500/10 text-emerald-700',
                  ISO: 'bg-violet-500/10 text-violet-700', OTRO: 'bg-muted text-muted-foreground',
                };
                return (
                  <div key={doc.id_doc} className="flex items-center justify-between rounded-xl border border-border/50 p-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{doc.nombre_doc}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${TIPO_STYLE[doc.tipo_doc] ?? TIPO_STYLE.OTRO}`}>{doc.tipo_doc}</span>
                        <span className="text-[10px] text-muted-foreground">{new Date(doc.created_at).toLocaleDateString('es-MX')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const res = await api.get(
                              `/api/v1/compras/proveedores/${docsProveedorId}/documentos/${doc.id_doc}/descargar`,
                              { responseType: 'blob' }
                            );
                            const url = URL.createObjectURL(res.data);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = doc.nombre_doc;
                            a.click();
                            URL.revokeObjectURL(url);
                          } catch { notify({ title: 'Error al descargar', type: 'error' }); }
                        }}
                        className="rounded-lg border border-border/50 px-2 py-1 text-[10px] font-bold text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
                      >
                        Descargar
                      </button>
                      {isProcurement && (
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await api.delete(`/api/v1/compras/proveedores/${docsProveedorId}/documentos/${doc.id_doc}`);
                              setDocsProveedor(prev => ({
                                ...prev,
                                [docsProveedorId!]: (prev[docsProveedorId!] ?? []).filter((d: any) => d.id_doc !== doc.id_doc),
                              }));
                              notify({ title: 'Documento eliminado', type: 'success' });
                            } catch { notify({ title: 'Error al eliminar', type: 'error' }); }
                          }}
                          className="rounded-lg border border-red-500/20 px-2 py-1 text-[10px] font-bold text-red-600 hover:bg-red-500/10 transition-colors"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {isProcurement && (
            <div className="border-t border-border/40 pt-4 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Subir Documento</p>
              <FormField label="Tipo de Documento">
                <Select value={docTipoUpload} onChange={e => setDocTipoUpload(e.target.value)}>
                  <option value="CSD">CSD</option>
                  <option value="OPINION_SAT">Opinión SAT</option>
                  <option value="ISO">Certificado ISO</option>
                  <option value="OTRO">Otro</option>
                </Select>
              </FormField>
              <input ref={docFileRef} type="file" accept=".pdf,.xml,.jpg,.jpeg,.png" className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file || !docsProveedorId) return;
                  const fd = new FormData();
                  fd.append('archivo', file);
                  fd.append('tipo_doc', docTipoUpload);
                  fd.append('nombre_doc', file.name);
                  try {
                    const res = await api.post(`/api/v1/compras/proveedores/${docsProveedorId}/documentos`, fd, {
                      headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    setDocsProveedor(prev => ({
                      ...prev,
                      [docsProveedorId]: [res.data.data, ...(prev[docsProveedorId] ?? [])],
                    }));
                    notify({ title: 'Documento subido', type: 'success' });
                  } catch (err: any) {
                    notify({ title: err.response?.data?.message ?? 'Error al subir', type: 'error' });
                  } finally {
                    if (docFileRef.current) docFileRef.current.value = '';
                  }
                }}
              />
              <Button onClick={() => docFileRef.current?.click()} className="w-full rounded-xl border border-dashed border-border bg-muted/20 text-sm font-semibold text-muted-foreground hover:bg-muted/40">
                + Seleccionar archivo (PDF, XML, JPG, PNG — máx. 10 MB)
              </Button>
            </div>
          )}
        </div>
      </SlidePanel>

      {/* ── Formulario Proveedor ─────────────────────────────────────────── */}
      <SlidePanel
        isOpen={showProveedorForm}
        onClose={() => setShowProveedorForm(false)}
        title={editingProveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
        accentColor="emerald"
      >
        <div className="space-y-4">
          <FormField label="RFC / Tax ID" required>
            <Input
              placeholder="Ej: XAXX010101000"
              value={proveedorForm.rfc_tax_id}
              onChange={e => setProveedorForm(f => ({ ...f, rfc_tax_id: e.target.value }))}
              disabled={!!editingProveedor}
            />
          </FormField>
          <FormField label="Razón Social" required>
            <Input
              placeholder="Nombre o razón social del proveedor"
              value={proveedorForm.razon_social}
              onChange={e => setProveedorForm(f => ({ ...f, razon_social: e.target.value }))}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Email">
              <Input type="email" placeholder="contacto@empresa.com" value={proveedorForm.email_contacto} onChange={e => setProveedorForm(f => ({ ...f, email_contacto: e.target.value }))} />
            </FormField>
            <FormField label="Teléfono">
              <Input placeholder="(55) 1234-5678" value={proveedorForm.telefono} onChange={e => setProveedorForm(f => ({ ...f, telefono: e.target.value }))} />
            </FormField>
          </div>
          <FormField label="Estatus">
            <Select value={proveedorForm.estatus} onChange={e => setProveedorForm(f => ({ ...f, estatus: e.target.value }))}>
              <option value="ACTIVO">Activo</option>
              <option value="VETADO">Vetado</option>
              <option value="PENDIENTE">Pendiente</option>
            </Select>
          </FormField>

          <p className="pt-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Logística</p>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Ciudad">
              <Input placeholder="Ciudad de operación" value={proveedorForm.ciudad} onChange={e => setProveedorForm(f => ({ ...f, ciudad: e.target.value }))} />
            </FormField>
            <FormField label="Ubicación">
              <Select value={proveedorForm.tipo_ubicacion} onChange={e => setProveedorForm(f => ({ ...f, tipo_ubicacion: e.target.value }))}>
                <option value="LOCAL">Local</option>
                <option value="FORANEO">Foráneo</option>
              </Select>
            </FormField>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={proveedorForm.entrega_en_sitio} onChange={e => setProveedorForm(f => ({ ...f, entrega_en_sitio: e.target.checked }))} className="rounded" />
            <span>Entrega en sitio de obra</span>
          </label>

          <p className="pt-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Condiciones Comerciales</p>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Tipo de Proveedor">
              <Select value={proveedorForm.tipo_proveedor} onChange={e => setProveedorForm(f => ({ ...f, tipo_proveedor: e.target.value }))}>
                <option value="NACIONAL">Nacional</option>
                <option value="EXTRANJERO">Extranjero</option>
              </Select>
            </FormField>
            <FormField label="Estatus de Crédito">
              <Select value={proveedorForm.estatus_credito} onChange={e => setProveedorForm(f => ({ ...f, estatus_credito: e.target.value }))}>
                <option value="ACTIVO">Activo</option>
                <option value="BLOQUEADO">Bloqueado</option>
              </Select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Límite de Crédito (MXN)" hint="Dejar vacío = sin límite">
              <Input type="number" placeholder="0.00" value={proveedorForm.limite_credito} onChange={e => setProveedorForm(f => ({ ...f, limite_credito: e.target.value }))} />
            </FormField>
            <FormField label="¿Otorga crédito?" hint="Visible para Gerencia Técnica al evaluar económicamente">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={proveedorForm.ofrece_credito} onChange={e => setProveedorForm(f => ({ ...f, ofrece_credito: e.target.checked }))} className="rounded" />
                  <span>Sí</span>
                </label>
                <Input
                  type="number"
                  placeholder="Días de crédito"
                  disabled={!proveedorForm.ofrece_credito}
                  value={proveedorForm.dias_credito}
                  onChange={e => setProveedorForm(f => ({ ...f, dias_credito: e.target.value }))}
                />
              </div>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Score de Desempeño" hint="Calculado automáticamente del historial de calificaciones">
              <div className="flex items-center gap-2 rounded-xl border border-border/40 bg-muted/20 px-3 py-2">
                {proveedorForm.calificacion_desempeno ? (
                  <>
                    <span className="text-amber-500 font-bold">★</span>
                    <span className="text-sm font-bold">{Number(proveedorForm.calificacion_desempeno).toFixed(1)}</span>
                    <span className="text-[10px] text-muted-foreground ml-1">({calTotales[editingProveedor?.id_proveedor ?? ''] ?? 0} calificaciones)</span>
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground">Sin calificaciones aún</span>
                )}
              </div>
            </FormField>
          </div>

          <div className="border-t border-border/40 pt-4">
            <SubmitButton
              label={editingProveedor ? 'Guardar Cambios' : 'Crear Proveedor'}
              loading={formLoading}
              color="emerald"
              onClick={async () => {
                if (!proveedorForm.rfc_tax_id.trim() || !proveedorForm.razon_social.trim()) {
                  notify({ title: 'RFC y Razón Social son obligatorios', type: 'error' });
                  return;
                }
                const cal = proveedorForm.calificacion_desempeno;
                if (cal !== '' && (Number(cal) < 0 || Number(cal) > 5)) {
                  notify({ title: 'Calificación debe ser 0–5', type: 'error' });
                  return;
                }
                setFormLoading(true);
                try {
                  const payload = {
                    rfc_tax_id: proveedorForm.rfc_tax_id.trim(),
                    razon_social: proveedorForm.razon_social.trim(),
                    email_contacto: proveedorForm.email_contacto || null,
                    telefono: proveedorForm.telefono || null,
                    estatus: proveedorForm.estatus,
                    ciudad: proveedorForm.ciudad || null,
                    tipo_ubicacion: proveedorForm.tipo_ubicacion,
                    entrega_en_sitio: proveedorForm.entrega_en_sitio,
                    estatus_credito: proveedorForm.estatus_credito,
                    limite_credito: proveedorForm.limite_credito !== '' ? Number(proveedorForm.limite_credito) : null,
                    ofrece_credito: proveedorForm.ofrece_credito,
                    dias_credito: proveedorForm.ofrece_credito && proveedorForm.dias_credito !== '' ? Number(proveedorForm.dias_credito) : null,
                    tipo_proveedor: proveedorForm.tipo_proveedor,
                    calificacion_desempeno: proveedorForm.calificacion_desempeno !== '' ? Number(proveedorForm.calificacion_desempeno) : null,
                  };
                  if (editingProveedor) {
                    const res = await api.put(`/api/v1/compras/proveedores/${editingProveedor.id_proveedor}`, payload);
                    setProveedoresList(list => list.map(p => p.id_proveedor === editingProveedor.id_proveedor ? res.data.data : p));
                    notify({ title: 'Proveedor actualizado', type: 'success' });
                  } else {
                    const res = await api.post('/api/v1/compras/proveedores', payload);
                    setProveedoresList(list => [...list, res.data.data]);
                    notify({ title: 'Proveedor creado', type: 'success' });
                  }
                  setShowProveedorForm(false);
                } catch (err: any) {
                  notify({ title: err.response?.data?.message ?? 'Error al guardar proveedor', type: 'error' });
                } finally {
                  setFormLoading(false);
                }
              }}
            />
          </div>
        </div>
      </SlidePanel>
    </div>
  );
};
