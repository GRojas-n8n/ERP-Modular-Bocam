import React, { useEffect, useMemo, useState } from 'react';
import api from '../lib/api';
import { useTenant } from '../context/TenantContext';
import { useNotification } from '../context/NotificationContext';
import {
  DEMO_ESTIMACIONES_RESIDENCIA,
  DEMO_PRENOMINAS_RESIDENCIA,
  DEMO_ASISTENCIA,
  DEMO_CUADRILLAS,
} from '../lib/demoData';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyStatePanel,
  FormField,
  Input,
  SectionBadge,
  Select,
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
  IconCheckCircle2,
  IconClipboardCheck,
  IconClock,
  IconQrCode,
  IconSearch,
  IconShoppingCart,
  IconPlus,
  IconX,
} from '../components/Icons';
import { SlidePanel, SubmitButton } from '../components/SlidePanel';

/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Vista: Residencia de Obra — Estimaciones · Nómina · Asistencia QR
 * ---------------------------------------------------------------------------
 */

// ── Tipos ────────────────────────────────────────────────────────────────────

type EstimacionEstado = 'BORRADOR' | 'EN_REVISION' | 'AUTORIZADA' | 'PAGADA';
type NominaEstado = 'PENDIENTE' | 'EN_PROCESO' | 'APROBADA' | 'PAGADA';
type AsistenciaEstado = 'PRESENTE' | 'AUSENTE' | 'JUSTIFICADA' | 'INCAPACIDAD';
type TabId = 'estimaciones' | 'nomina' | 'asistencia' | 'requisiciones';

// ── Tipos Requisiciones del Residente ─────────────────────────────────────────

interface ReqResidenteItem {
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

interface ReqResidente {
  id: string;
  folio: string;
  fecha: string;
  estado: string;
  tipo?: string;
  prioridad: string;
  observaciones?: string;
  concepto_id?: string | null;
  concepto_clave?: string | null;
  concepto_descripcion?: string | null;
  items?: ReqResidenteItem[];
}

interface ConceptoSimple {
  id: string;
  clave: string;
  descripcion: string;
  unidad_medida: string;
}

interface MaterialTakeoff {
  insumo_id: string;
  clave: string;
  descripcion: string;
  unidad: string;
  cantidad_unitaria: number; // por unidad de concepto (del APU)
  cantidad_total: number;    // cantidad_unitaria × cantidadTakeoff
}

interface ImprevistoItem {
  descripcion_libre: string;
  unidad_libre: string;
  cantidad: string;
  notas: string;
  justificacion: string;
  especificacion_marca_modelo: string;
  especificacion_detalle: string;
}

/** Insumo del catálogo GT — para flujo "Por Insumo" */
interface InsumoReq {
  insumo_id: string;
  clave: string;
  descripcion: string;
  tipo_insumo: 'MATERIAL' | 'EQUIPO' | 'MANO_DE_OBRA' | 'SUBCONTRATO' | 'INDIRECTO';
  unidad_medida: string;
  cantidad_presupuestada?: number; // del endpoint explosión GT
}

/** Insumo seleccionado con cantidad ingresada por el Residente */
interface InsumoSeleccionado extends InsumoReq {
  cantidad: number;
  notas: string;
  es_excedente?: boolean;
  especificaciones: string[];
  justificacion: string;
  especificacion_marca_modelo: string;
  especificacion_detalle: string;
}

const UNIDADES_REQ = ['PZA', 'SAC', 'M3', 'M2', 'ML', 'KG', 'TON', 'LT', 'CUB', 'DIA', 'SEM', 'MES', 'PTO', 'JGO'];

const REQ_ESTADO_BADGE: Record<string, { cls: string; label: string }> = {
  PENDIENTE: { cls: 'bg-amber-500/10 text-amber-600',   label: 'Pendiente'  },
  APROBADA:  { cls: 'bg-emerald-500/10 text-emerald-600', label: 'Aprobada' },
  COMPRADA:  { cls: 'bg-sky-500/10 text-sky-600',        label: 'Comprada'  },
  BORRADOR:  { cls: 'bg-zinc-500/10 text-zinc-500',      label: 'Borrador'  },
  RECHAZADA: { cls: 'bg-red-500/10 text-red-600',        label: 'Rechazada' },
};

interface Estimacion {
  id: string;
  codigo: string;
  numero: number;
  periodo_inicio: string;
  periodo_fin: string;
  frente: string;
  descripcion: string;
  conceptos: number;
  subtotal: number;
  iva: number;
  total_neto: number;
  estado: EstimacionEstado;
  fecha_autorizacion: string | null;
  autorizador: string | null;
}

interface CuadrillaNomina { nombre: string; empleados: number; total: number; }
interface Prenomina {
  id: string;
  codigo: string;
  periodo_tipo: string;
  periodo_inicio: string;
  periodo_fin: string;
  total_bruto: number;
  total_deducciones: number;
  total_neto: number;
  total_empleados: number;
  estado: NominaEstado;
  cuadrillas: CuadrillaNomina[];
}

interface RegistroAsistencia {
  id: string;
  id_registro?: string;
  empleado_id: string;
  fecha: string;
  cuadrilla_id: string | null;
  cuadrilla_nombre: string;
  empleado_nombre: string;
  puesto: string;
  hora_entrada: string | null;
  hora_salida: string | null;
  horas_trabajadas: number | null;
  horas_normales: number | null;
  horas_extra_dia: number | null;
  origen_horas: string;
  estado: AsistenciaEstado;
  tipo_registro: 'QR' | 'MANUAL' | null;
  horas_extra?: number;
  modo_asistencia?: string;
}

interface CuadrillaReal {
  id_cuadrilla: string;
  nombre: string;
  codigo: string;
  miembros: { id_empleado: string; nombre: string; apellido_paterno: string; puesto: string; modo_asistencia?: string; hora_salida_programada?: string | null }[];
}

interface BulkCheck {
  empleado_id: string;
  nombre: string;
  puesto: string;
  modo_asistencia: string;
  estado: 'PRESENTE' | 'AUSENTE';
  horas_extra: string;
  hora_entrada: string;
  hora_salida: string;
}

// ── Badges de estado ─────────────────────────────────────────────────────────

const EST_BADGE: Record<EstimacionEstado, { cls: string; label: string }> = {
  BORRADOR:    { cls: 'bg-zinc-500/10 text-zinc-500',   label: 'Borrador'    },
  EN_REVISION: { cls: 'bg-amber-500/10 text-amber-600', label: 'En revisión' },
  AUTORIZADA:  { cls: 'bg-emerald-500/10 text-emerald-600', label: 'Autorizada' },
  PAGADA:      { cls: 'bg-sky-500/10 text-sky-600',     label: 'Pagada'      },
};

const NOM_BADGE: Record<NominaEstado, { cls: string; label: string }> = {
  PENDIENTE:   { cls: 'bg-amber-500/10 text-amber-600',    label: 'Pendiente'   },
  EN_PROCESO:  { cls: 'bg-sky-500/10 text-sky-600',        label: 'En proceso'  },
  APROBADA:    { cls: 'bg-emerald-500/10 text-emerald-600', label: 'Aprobada'   },
  PAGADA:      { cls: 'bg-zinc-500/10 text-zinc-500',      label: 'Pagada'      },
};

const ASIS_BADGE: Record<AsistenciaEstado, { cls: string; label: string }> = {
  PRESENTE:    { cls: 'bg-emerald-500/10 text-emerald-600', label: 'Presente'   },
  AUSENTE:     { cls: 'bg-red-500/10 text-red-600',         label: 'Ausente'    },
  JUSTIFICADA: { cls: 'bg-amber-500/10 text-amber-600',     label: 'Justificada'},
  INCAPACIDAD: { cls: 'bg-sky-500/10 text-sky-600',         label: 'Incapacidad'},
};

// ── Helpers de formato ───────────────────────────────────────────────────────

const fmt$ = (n: number) =>
  n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

const fmtDate = (d: string) =>
  new Date(d + 'T12:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });

// ── QR Visual (SVG decorativo) ────────────────────────────────────────────────

const QrVisual: React.FC<{ seed: string }> = ({ seed }) => {
  // Patrón determinista basado en el seed
  const hash = seed.split('').reduce((a, c) => a * 31 + c.charCodeAt(0), 7);
  const cells = Array.from({ length: 49 }, (_, i) => {
    // Esquinas fijas (finder patterns)
    const row = Math.floor(i / 7), col = i % 7;
    const corner = (row < 2 && col < 2) || (row < 2 && col > 4) || (row > 4 && col < 2);
    return corner ? true : Boolean((hash >> (i % 17)) & 1) !== Boolean(i % 3 === 0);
  });

  return (
    <svg viewBox="0 0 70 70" className="w-48 h-48" xmlns="http://www.w3.org/2000/svg">
      <rect width="70" height="70" fill="white" rx="4" />
      {/* Finder patterns */}
      {[[2, 2], [44, 2], [2, 44]].map(([x, y], idx) => (
        <g key={idx}>
          <rect x={x} y={y} width="22" height="22" rx="2" fill="currentColor" className="text-foreground" />
          <rect x={x + 4} y={y + 4} width="14" height="14" rx="1" fill="white" />
          <rect x={x + 7} y={y + 7} width="8" height="8" rx="1" fill="currentColor" className="text-foreground" />
        </g>
      ))}
      {/* Data cells */}
      {cells.map((on, i) => {
        const row = Math.floor(i / 7) + 0, col = i % 7;
        const x = col * 10 + 2, y = row * 10 + 2;
        return on ? <rect key={i} x={x} y={y} width="8" height="8" rx="1" fill="currentColor" className="text-foreground" /> : null;
      })}
    </svg>
  );
};

// ── Modal genérico ────────────────────────────────────────────────────────────

const Modal: React.FC<{ open: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({
  open, onClose, title, children,
}) => {
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">{title}</h2>
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:text-foreground">
            <IconX className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ── Componente principal ─────────────────────────────────────────────────────

export const ResidenciaView: React.FC<{ activeSubView?: string }> = ({ activeSubView }) => {
  const { tenant } = useTenant();
  const { notify } = useNotification();
  const isDemo = tenant?.id === 'iretum-demo';

  const activeTab: TabId = (activeSubView as TabId) || 'estimaciones';
  const [loading, setLoading] = useState(true);

  // ─ Estimaciones
  const [estimaciones, setEstimaciones] = useState<Estimacion[]>([]);
  const [showEstForm, setShowEstForm] = useState(false);
  const [estForm, setEstForm] = useState({ frente: '', periodo_inicio: '', periodo_fin: '', descripcion: '' });

  // ─ Nómina
  const [prenominas, setPrenominas] = useState<Prenomina[]>([]);
  const [nominaDetalle, setNominaDetalle] = useState<Prenomina | null>(null);
  const [confirmAprobar, setConfirmAprobar] = useState<Prenomina | null>(null);

  // ─ Asistencia
  const [asistencia, setAsistencia] = useState<RegistroAsistencia[]>([]);
  const [fechaFiltro, setFechaFiltro] = useState(new Date().toISOString().slice(0, 10));
  const [cuadrillaFiltro, setCuadrillaFiltro] = useState('all');
  const [cuadrillas, setCuadrillas] = useState<CuadrillaReal[]>([]);
  const [qrModal, setQrModal] = useState<{ id: string; nombre: string } | null>(null);
  const [qrTab, setQrTab] = useState<'qr' | 'manual'>('qr');
  const [bulkChecks, setBulkChecks] = useState<BulkCheck[]>([]);
  const [guardandoBulk, setGuardandoBulk] = useState(false);

  // ─ Requisiciones del Residente ─────────────────────────────────────────────
  const [reqsResidente, setReqsResidente] = useState<ReqResidente[]>([]);
  const [expandedReqIds, setExpandedReqIds] = useState<Set<string>>(new Set());
  const [showReqPanel, setShowReqPanel] = useState(false);
  const [reqTipo, setReqTipo] = useState<'INSUMO' | 'APU' | 'IMPREVISTO'>('INSUMO');
  const [reqPrioridad, setReqPrioridad] = useState('MEDIA');
  const [reqNotas, setReqNotas] = useState('');
  const [reqNotasInternas, setReqNotasInternas] = useState('');
  const [reqDireccionEntrega, setReqDireccionEntrega] = useState('');
  const [generandoReq, setGenerandoReq] = useState(false);
  // Partida del catálogo — obligatoria para INSUMO e IMPREVISTO
  const [reqConceptoId, setReqConceptoId] = useState<string | null>(null);
  const [reqConceptoSearch2, setReqConceptoSearch2] = useState('');

  // Take-off APU (tipo NORMAL)
  const [conceptos, setConceptos] = useState<ConceptoSimple[]>([]);
  const [conceptoSearch, setConceptoSearch] = useState('');
  const [conceptoSeleccionado, setConceptoSeleccionado] = useState<ConceptoSimple | null>(null);
  const [cantidadTakeoff, setCantidadTakeoff] = useState('');
  const [materialesTakeoff, setMaterialesTakeoff] = useState<MaterialTakeoff[]>([]);
  const [loadingComposicion, setLoadingComposicion] = useState(false);
  // IMPREVISTO items
  const [itemsImprevisto, setItemsImprevisto] = useState<ImprevistoItem[]>([
    { descripcion_libre: '', unidad_libre: 'PZA', cantidad: '', notas: '', justificacion: '', especificacion_marca_modelo: '', especificacion_detalle: '' },
  ]);

  const [sinPresupuesto, setSinPresupuesto] = useState(false);

  const [dashData, setDashData] = useState<{
    mis_requisiciones: number;
    estimaciones_pendientes: number;
    ocs_por_recibir: Array<{ id: string; folio: string; proveedor: string; monto: number; estado: string }>;
    alertas: Array<{ tipo: string; mensaje: string; severidad: string }>;
    parcial: boolean;
  } | null>(null);

  // Por Insumo state
  const [insumosAll,           setInsumosAll]           = useState<InsumoReq[]>([]);
  const [insumoSearch,         setInsumoSearch]         = useState('');
  const [insumoTabTipo,        setInsumoTabTipo]        = useState<'MATERIAL' | 'EQUIPO' | 'SERVICIO'>('MATERIAL');
  const [insumosSeleccionados, setInsumosSeleccionados] = useState<InsumoSeleccionado[]>([]);
  const [loadingInsumos,       setLoadingInsumos]       = useState(false);
  const [specInputs,           setSpecInputs]           = useState<Record<number, string>>({});
  // IDs de insumos del APU de la partida seleccionada — null = sin filtro (IMPREVISTO o sin partida)
  const [insumosDePartidaIds,  setInsumosDePartidaIds]  = useState<Set<string> | null>(null);
  const [loadingInsumosPartida,setLoadingInsumosPartida]= useState(false);
  const insumoByIdResidente = useMemo(
    () => new Map(insumosAll.map(i => [i.insumo_id, i])),
    [insumosAll]
  );
  const toggleReqExpandedResidente = (reqId: string) => {
    setExpandedReqIds(prev => {
      const next = new Set(prev);
      if (next.has(reqId)) next.delete(reqId); else next.add(reqId);
      return next;
    });
  };

  // ── Carga inicial ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (isDemo) {
      setEstimaciones(DEMO_ESTIMACIONES_RESIDENCIA as Estimacion[]);
      setPrenominas(DEMO_PRENOMINAS_RESIDENCIA as Prenomina[]);
      setAsistencia(DEMO_ASISTENCIA as RegistroAsistencia[]);
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        const [nomRes, dashRes] = await Promise.allSettled([
          api.get('/api/v1/personal/prenominas'),
          api.get('/api/v1/control-obra/dashboard/residente'),
        ]);
        setEstimaciones([]);
        if (nomRes.status === 'fulfilled') {
          setPrenominas((nomRes.value.data as any)?.data ?? []);
        }
        if (dashRes.status === 'fulfilled' && (dashRes.value.data as any)?.data) {
          setDashData((dashRes.value.data as any).data);
        }
      } catch { /* silencioso */ } finally { setLoading(false); }
    };
    void fetchData();
  }, [isDemo]);

  // ── Carga de asistencia + cuadrillas cuando se activa el tab ────────────
  useEffect(() => {
    if (activeTab !== 'asistencia' || isDemo) return;
    const fechaHoy = new Date().toISOString().slice(0, 10);
    const hace7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const fetchAsistencia = async () => {
      try {
        const [asisRes, cuaRes] = await Promise.allSettled([
          api.get('/api/v1/personal/asistencia', { params: { fecha_inicio: hace7, fecha_fin: fechaHoy } }),
          api.get('/api/v1/personal/cuadrillas'),
        ]);
        if (asisRes.status === 'fulfilled') setAsistencia((asisRes.value.data as any)?.data ?? []);
        if (cuaRes.status === 'fulfilled') setCuadrillas((cuaRes.value.data as any)?.data ?? []);
      } catch { /* silencioso */ }
    };
    void fetchAsistencia();
  }, [activeTab, isDemo]);

  // ── Carga de requisiciones, conceptos e insumos (cuando se activa el tab) ─
  useEffect(() => {
    if (activeTab !== 'requisiciones' || isDemo) return;
    const loadReqs = async () => {
      setLoadingInsumos(true);
      try {
        const [reqRes, presRes, insumosRes] = await Promise.allSettled([
          api.get('/api/v1/compras/requisiciones'),
          api.get('/api/v1/gerencia-tecnica/presupuesto/activo'),
          api.get('/api/v1/gerencia-tecnica/insumos/explosion'),
        ]);
        if (reqRes.status === 'fulfilled') {
          const raw: any[] = reqRes.value.data?.data || [];
          setReqsResidente(raw.map(r => ({
            id:           r.id_requisicion ?? r.id,
            folio:        r.codigo ?? r.folio,
            fecha:        r.fecha_solicitud ?? r.fecha,
            estado:       r.estado,
            tipo:         r.tipo,
            prioridad:    r.prioridad,
            observaciones: r.observaciones,
            concepto_id:  r.concepto_id ?? null,
            concepto_clave: r.concepto_clave ?? null,
            concepto_descripcion: r.concepto_descripcion ?? null,
            items: Array.isArray(r.items) ? r.items.map((it: any) => ({
              id: it.id_item ?? it.id,
              insumo_id: it.insumo_id ?? null,
              cantidad: Number(it.cantidad ?? 0),
              notas: it.notas ?? null,
              descripcion_libre: it.descripcion_libre ?? null,
              unidad_libre: it.unidad_libre ?? null,
              es_imprevisto: Boolean(it.es_imprevisto),
              especificacion_marca_modelo: it.especificacion_marca_modelo ?? null,
              especificacion_detalle: it.especificacion_detalle ?? null,
            })) : [],
          })));
        }
        if (presRes.status === 'fulfilled') {
          const pres = presRes.value.data?.data;
          const conceptosRaw: any[] = pres?.conceptos ?? [];
          setConceptos(conceptosRaw.map((c: any) => ({
            id:           c.id,
            clave:        c.clave,
            descripcion:  c.descripcion,
            unidad_medida: c.unidad_medida,
          })));
          setSinPresupuesto(false);
        } else {
          setSinPresupuesto(true);
        }
        if (insumosRes.status === 'fulfilled') {
          const raw: any[] = insumosRes.value.data?.data || [];
          setInsumosAll(raw
            .filter((i: any) => i.activo !== false)
            .map((i: any) => ({
              insumo_id:              i.id,
              clave:                  i.clave,
              descripcion:            i.descripcion,
              tipo_insumo:            i.tipo_insumo,
              unidad_medida:          i.unidad_medida,
              cantidad_presupuestada: i.cantidad_presupuestada != null ? Number(i.cantidad_presupuestada) : undefined,
            }))
          );
        }
      } catch { /* silencioso */ }
      finally { setLoadingInsumos(false); }
    };
    loadReqs();
  }, [activeTab, isDemo]);

  // ── Cargar composición al seleccionar concepto ────────────────────────────
  useEffect(() => {
    if (!conceptoSeleccionado) { setMaterialesTakeoff([]); return; }
    const fetchComposicion = async () => {
      setLoadingComposicion(true);
      try {
        const res = await api.get(`/api/v1/gerencia-tecnica/conceptos/${conceptoSeleccionado.id}/composicion`);
        const items: any[] = res.data?.data ?? [];
        const materiales = items
          .filter(ci => ci.tipo_insumo === 'MATERIAL' && ci.insumo_id)
          .map(ci => ({
            insumo_id:        ci.insumo_id,
            clave:            ci.insumo?.clave ?? '',
            descripcion:      ci.insumo?.descripcion ?? '',
            unidad:           ci.insumo?.unidad_medida ?? '',
            cantidad_unitaria: Number(ci.cantidad),
            cantidad_total:   Number(ci.cantidad) * (parseFloat(cantidadTakeoff) || 0),
          }));
        setMaterialesTakeoff(materiales);
      } catch { setMaterialesTakeoff([]); }
      finally { setLoadingComposicion(false); }
    };
    fetchComposicion();
  }, [conceptoSeleccionado]);

  // ── Cargar IDs de la composición al seleccionar partida en modo INSUMO ──────
  useEffect(() => {
    if (!reqConceptoId || reqTipo !== 'INSUMO') { setInsumosDePartidaIds(null); return; }
    let cancelled = false;
    const fetch = async () => {
      setLoadingInsumosPartida(true);
      try {
        const res = await api.get(`/api/v1/gerencia-tecnica/conceptos/${reqConceptoId}/composicion`);
        const items: any[] = res.data?.data ?? [];
        if (!cancelled) {
          const ids = new Set(items.map((ci: any) => ci.insumo_id).filter(Boolean) as string[]);
          setInsumosDePartidaIds(ids.size > 0 ? ids : null);
        }
      } catch {
        if (!cancelled) setInsumosDePartidaIds(null);
      } finally {
        if (!cancelled) setLoadingInsumosPartida(false);
      }
    };
    void fetch();
    return () => { cancelled = true; };
  }, [reqConceptoId, reqTipo]);

  // ── Recalcular totales cuando cambia la cantidad ──────────────────────────
  useEffect(() => {
    const qty = parseFloat(cantidadTakeoff) || 0;
    setMaterialesTakeoff(prev => prev.map(m => ({ ...m, cantidad_total: +(m.cantidad_unitaria * qty).toFixed(4) })));
  }, [cantidadTakeoff]);

  // ── KPI helpers ───────────────────────────────────────────────────────────
  const kpiEstimaciones = {
    total: estimaciones.length,
    autorizado: estimaciones.filter(e => e.estado === 'AUTORIZADA' || e.estado === 'PAGADA').reduce((s, e) => s + e.total_neto, 0),
    enRevision: estimaciones.filter(e => e.estado === 'EN_REVISION').length,
    pagado: estimaciones.filter(e => e.estado === 'PAGADA').reduce((s, e) => s + e.total_neto, 0),
  };

  const kpiNomina = {
    pendientes: prenominas.filter(p => p.estado === 'PENDIENTE' || p.estado === 'EN_PROCESO').length,
    porPagar: prenominas.filter(p => p.estado === 'PENDIENTE').reduce((s, p) => s + p.total_neto, 0),
    empleados: prenominas.find(p => p.estado === 'PENDIENTE')?.total_empleados ?? 0,
  };

  const asistenciaFiltrada = asistencia.filter(a =>
    a.fecha === fechaFiltro && (cuadrillaFiltro === 'all' || a.cuadrilla_id === cuadrillaFiltro)
  );
  const kpiAsistencia = {
    presentes: asistenciaFiltrada.filter(a => a.estado === 'PRESENTE').length,
    ausentes: asistenciaFiltrada.filter(a => a.estado === 'AUSENTE').length,
    incapacidades: asistenciaFiltrada.filter(a => a.estado === 'INCAPACIDAD' || a.estado === 'JUSTIFICADA').length,
  };

  // ── Acciones ──────────────────────────────────────────────────────────────
  const handleSubmitEstimacion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!estForm.frente || !estForm.periodo_inicio || !estForm.periodo_fin) return;
    if (isDemo) {
      const n = estimaciones.length + 1;
      const nueva: Estimacion = {
        id: `est-r-new-${Date.now()}`,
        codigo: `EST-TCN-00${n}`,
        numero: n,
        periodo_inicio: estForm.periodo_inicio,
        periodo_fin: estForm.periodo_fin,
        frente: estForm.frente,
        descripcion: estForm.descripcion,
        conceptos: 0,
        subtotal: 0, iva: 0, total_neto: 0,
        estado: 'BORRADOR',
        fecha_autorizacion: null,
        autorizador: null,
      };
      setEstimaciones(prev => [...prev, nueva]);
      notify({ type: 'success', title: 'Estimación creada', message: `${nueva.codigo} · ${nueva.frente}` });
      setEstForm({ frente: '', periodo_inicio: '', periodo_fin: '', descripcion: '' });
      setShowEstForm(false);
      return;
    }
  };

  const handleEnviarRevision = (est: Estimacion) => {
    if (est.estado !== 'BORRADOR') return;
    setEstimaciones(prev => prev.map(e => e.id === est.id ? { ...e, estado: 'EN_REVISION' } : e));
    notify({ type: 'info', title: 'Estimación enviada a revisión', message: `${est.codigo} — pendiente de autorización` });
  };

  const handleAprobarNomina = () => {
    if (!confirmAprobar) return;
    setPrenominas(prev => prev.map(p =>
      p.id === confirmAprobar.id ? { ...p, estado: 'APROBADA' } : p
    ));
    notify({
      type: 'success',
      title: 'Nómina aprobada',
      message: `${confirmAprobar.codigo} · ${fmt$(confirmAprobar.total_neto)} · ${confirmAprobar.total_empleados} empleados`,
      duration: 6000,
    });
    setConfirmAprobar(null);
    setNominaDetalle(null);
  };

  // ── Requisiciones ─────────────────────────────────────────────────────────
  const resetReqPanel = () => {
    setReqTipo('INSUMO');
    setReqPrioridad('MEDIA');
    setReqNotas('');
    setReqNotasInternas('');
    setReqDireccionEntrega('');
    setReqConceptoId(null);
    setReqConceptoSearch2('');
    setConceptoSearch('');
    setConceptoSeleccionado(null);
    setCantidadTakeoff('');
    setMaterialesTakeoff([]);
    setItemsImprevisto([{ descripcion_libre: '', unidad_libre: 'PZA', cantidad: '', notas: '', justificacion: '', especificacion_marca_modelo: '', especificacion_detalle: '' }]);
    setInsumoSearch('');
    setInsumoTabTipo('MATERIAL');
    setInsumosSeleccionados([]);
    setSpecInputs({});
  };

  const conceptosFiltrados = conceptoSearch.trim()
    ? conceptos.filter(c =>
        c.clave.toLowerCase().includes(conceptoSearch.toLowerCase()) ||
        c.descripcion.toLowerCase().includes(conceptoSearch.toLowerCase())
      )
    : conceptos;

  const handleGenerarRequisicion = async () => {
    if (reqTipo === 'INSUMO') {
      // ── Flujo Por Insumo ──────────────────────────────────────────────────
      if (insumosSeleccionados.length === 0) {
        notify({ type: 'error', title: 'Sin ítems seleccionados', message: 'Agrega al menos un insumo del catálogo.' }); return;
      }
      const sinCantidad = insumosSeleccionados.filter(i => !(i.cantidad > 0));
      if (sinCantidad.length > 0) {
        notify({ type: 'error', title: 'Cantidades inválidas', message: 'Ingresa la cantidad de todos los ítems.' }); return;
      }
      const sinJustificacion = insumosSeleccionados.filter(i => {
        const excede = i.cantidad_presupuestada != null && i.cantidad > i.cantidad_presupuestada;
        return excede && !i.justificacion.trim();
      });
      if (sinJustificacion.length > 0) {
        notify({ type: 'error', title: 'Justificación requerida', message: `${sinJustificacion.map(i => i.clave).join(', ')} excede el presupuesto — escribe la justificación.` }); return;
      }
      if (isDemo) {
        notify({ type: 'success', title: 'Requisición creada (demo)',
          message: `${insumosSeleccionados.length} ítem${insumosSeleccionados.length !== 1 ? 's' : ''} · Prioridad ${reqPrioridad}`,
          duration: 6000 });
        setShowReqPanel(false); resetReqPanel(); return;
      }
      try {
        setGenerandoReq(true);
        const itemsConExcedente = insumosSeleccionados.filter(
          i => i.cantidad_presupuestada != null && i.cantidad > i.cantidad_presupuestada
        );
        const observacionesBase = reqNotas || undefined;
        const observacionesFinal = itemsConExcedente.length > 0
          ? `${observacionesBase ? observacionesBase + ' · ' : ''}⚠ EXCEDENTE en ${itemsConExcedente.length} ítem(s): ${itemsConExcedente.map(i => `${i.clave} (pres: ${i.cantidad_presupuestada} → sol: ${i.cantidad})`).join(', ')}`
          : observacionesBase;
        const res = await api.post('/api/v1/compras/requisiciones', {
          tipo: 'NORMAL',
          concepto_id: reqConceptoId,
          prioridad: reqPrioridad,
          observaciones: observacionesFinal,
          observaciones_internas: reqNotasInternas || undefined,
          direccion_entrega: reqDireccionEntrega || undefined,
          items: insumosSeleccionados.map(i => {
            const excede = i.cantidad_presupuestada != null && i.cantidad > i.cantidad_presupuestada;
            return {
              insumo_id:                   i.insumo_id,
              clave:                       i.clave,
              cantidad:                    i.cantidad,
              cantidad_presupuestada:      i.cantidad_presupuestada ?? null,
              concepto_origen_id:          null,
              justificacion:               excede ? i.justificacion : null,
              especificacion_marca_modelo: i.especificacion_marca_modelo || undefined,
              especificacion_detalle:      i.especificacion_detalle || undefined,
              notas: excede
                ? `EXCEDENTE: presupuesto ${i.cantidad_presupuestada} ${i.unidad_medida}, solicitado ${i.cantidad} ${i.unidad_medida}`
                : (i.notas || undefined),
            };
          }),
        });
        const r = res.data.data;
        // guardar especificaciones técnicas por ítem (best-effort)
        const itemsConSpecs = insumosSeleccionados.filter(i => i.especificaciones.length > 0);
        if (itemsConSpecs.length > 0 && Array.isArray(r.items)) {
          await Promise.allSettled(
            itemsConSpecs.map(async (insumo) => {
              const backendItem = (r.items as any[]).find((bi: any) => bi.insumo_id === insumo.insumo_id);
              if (!backendItem) return;
              await api.put(
                `/api/v1/compras/requisiciones/${r.id_requisicion}/items/${backendItem.id_item}/especificaciones`,
                { especificaciones: insumo.especificaciones }
              );
            })
          );
        }
        notify({ type: 'success', title: 'Requisición creada',
          message: `${r.codigo ?? r.id} · ${insumosSeleccionados.length} ítem${insumosSeleccionados.length !== 1 ? 's' : ''} · Procurement la revisará.`,
          duration: 7000 });
        setShowReqPanel(false); resetReqPanel();
        const fresh = await api.get('/api/v1/compras/requisiciones');
        const raw: any[] = fresh.data?.data || [];
        setReqsResidente(raw.map(r2 => ({
          id: r2.id_requisicion ?? r2.id, folio: r2.codigo ?? r2.folio,
          fecha: r2.fecha_solicitud ?? r2.fecha, estado: r2.estado,
          tipo: r2.tipo, prioridad: r2.prioridad, observaciones: r2.observaciones,
          concepto_id: r2.concepto_id ?? null,
          concepto_clave: r2.concepto_clave ?? null,
          concepto_descripcion: r2.concepto_descripcion ?? null,
        })));
      } catch (err: any) {
        notify({ type: 'error', title: 'Error al crear requisición', message: err.response?.data?.message || err.message });
      } finally { setGenerandoReq(false); }

    } else if (reqTipo === 'APU') {
      // ── Flujo Desde APU ───────────────────────────────────────────────────
      if (!conceptoSeleccionado) {
        notify({ type: 'error', title: 'Selecciona un concepto APU', message: '' }); return;
      }
      const qty = parseFloat(cantidadTakeoff);
      if (!qty || qty <= 0) {
        notify({ type: 'error', title: 'Ingresa una cantidad válida', message: '' }); return;
      }
      const materiales = materialesTakeoff.filter(m => m.cantidad_total > 0);
      if (materiales.length === 0) {
        notify({ type: 'error', title: 'Sin materiales en la composición', message: 'Este concepto no tiene insumos de tipo MATERIAL.' }); return;
      }
      if (isDemo) {
        notify({ type: 'success', title: 'Requisición generada (demo)',
          message: `${conceptoSeleccionado.clave} · ${materiales.length} material${materiales.length !== 1 ? 'es' : ''} · Prioridad ${reqPrioridad}`,
          duration: 6000 });
        setShowReqPanel(false); resetReqPanel(); return;
      }
      try {
        setGenerandoReq(true);
        const res = await api.post('/api/v1/compras/requisiciones', {
          tipo: 'NORMAL',
          concepto_id: conceptoSeleccionado.id,
          prioridad: reqPrioridad,
          observaciones: `Take-off APU · ${conceptoSeleccionado.clave} · ${conceptoSeleccionado.descripcion} · ${qty} ${conceptoSeleccionado.unidad_medida}${reqNotas ? ' · ' + reqNotas : ''}`,
          observaciones_internas: reqNotasInternas || undefined,
          direccion_entrega: reqDireccionEntrega || undefined,
          items: materiales.map(m => ({
            insumo_id:              m.insumo_id,
            clave:                  m.clave,
            cantidad:               m.cantidad_total,
            cantidad_presupuestada: m.cantidad_total,          // take-off = cantidad presupuestada
            concepto_origen_id:     conceptoSeleccionado.id,  // vínculo al APU
            justificacion:          null,
            notas: `APU ${conceptoSeleccionado.clave}: ${m.cantidad_unitaria} × ${qty} ${conceptoSeleccionado.unidad_medida}`,
          })),
        });
        const r = res.data.data;
        const folio = r.codigo ?? r.id;
        notify({ type: 'success', title: 'Requisición creada',
          message: `${folio} · ${materiales.length} material${materiales.length !== 1 ? 'es' : ''} · Procurement la revisará.`,
          duration: 7000 });
        setShowReqPanel(false); resetReqPanel();
        // refrescar lista
        const fresh = await api.get('/api/v1/compras/requisiciones');
        const raw: any[] = fresh.data?.data || [];
        setReqsResidente(raw.map(r2 => ({
          id: r2.id_requisicion ?? r2.id, folio: r2.codigo ?? r2.folio,
          fecha: r2.fecha_solicitud ?? r2.fecha, estado: r2.estado,
          tipo: r2.tipo, prioridad: r2.prioridad, observaciones: r2.observaciones,
          concepto_id: r2.concepto_id ?? null,
          concepto_clave: r2.concepto_clave ?? null,
          concepto_descripcion: r2.concepto_descripcion ?? null,
        })));
      } catch (err: any) {
        notify({ type: 'error', title: 'Error al crear requisición', message: err.response?.data?.message || err.message });
      } finally { setGenerandoReq(false); }

    } else {
      // ── Flujo IMPREVISTO ──────────────────────────────────────────────────
      // IMPREVISTO
      const validos = itemsImprevisto.filter(i => i.descripcion_libre.trim() && i.cantidad);
      if (validos.length === 0) {
        notify({ type: 'error', title: 'Agrega al menos un ítem con descripción y cantidad', message: '' }); return;
      }
      const sinJustif = validos.filter(i => !i.justificacion.trim());
      if (sinJustif.length > 0) {
        notify({ type: 'error', title: 'Justificación requerida', message: `${sinJustif.length} ítem(s) sin justificación — todos los imprevistos deben explicar el motivo.` }); return;
      }
      if (isDemo) {
        notify({ type: 'success', title: 'Req. Imprevisto creada (demo)',
          message: `${validos.length} ítem${validos.length !== 1 ? 's' : ''} · Prioridad ${reqPrioridad}` });
        setShowReqPanel(false); resetReqPanel(); return;
      }
      try {
        setGenerandoReq(true);
        const res = await api.post('/api/v1/compras/requisiciones', {
          tipo: 'IMPREVISTO',
          concepto_id: reqConceptoId,
          prioridad: reqPrioridad,
          observaciones: reqNotas || undefined,
          observaciones_internas: reqNotasInternas || undefined,
          direccion_entrega: reqDireccionEntrega || undefined,
          items: validos.map(i => ({
            descripcion_libre:           i.descripcion_libre,
            unidad_libre:                i.unidad_libre || 'PZA',
            cantidad:                    Number(i.cantidad),
            cantidad_presupuestada:      null,
            concepto_origen_id:          null,
            justificacion:               i.justificacion,
            notas:                       i.notas || undefined,
            es_imprevisto:               true,
            especificacion_marca_modelo: i.especificacion_marca_modelo || undefined,
            especificacion_detalle:      i.especificacion_detalle || undefined,
          })),
        });
        const r = res.data.data;
        notify({ type: 'success', title: 'Req. Imprevisto enviada',
          message: `${r.codigo ?? r.id} · Procurement la revisará antes de cotizar.`,
          duration: 7000 });
        setShowReqPanel(false); resetReqPanel();
        const fresh = await api.get('/api/v1/compras/requisiciones');
        const raw: any[] = fresh.data?.data || [];
        setReqsResidente(raw.map(r2 => ({
          id: r2.id_requisicion ?? r2.id, folio: r2.codigo ?? r2.folio,
          fecha: r2.fecha_solicitud ?? r2.fecha, estado: r2.estado,
          tipo: r2.tipo, prioridad: r2.prioridad, observaciones: r2.observaciones,
          concepto_id: r2.concepto_id ?? null,
          concepto_clave: r2.concepto_clave ?? null,
          concepto_descripcion: r2.concepto_descripcion ?? null,
        })));
      } catch (err: any) {
        notify({ type: 'error', title: 'Error al crear requisición', message: err.response?.data?.message || err.message });
      } finally { setGenerandoReq(false); }
    }
  };

  const handleRegistrarManual = async (registro: RegistroAsistencia) => {
    const nuevoEstado: AsistenciaEstado = registro.estado === 'AUSENTE' ? 'PRESENTE' : 'AUSENTE';
    // Actualizar UI optimista
    setAsistencia(prev => prev.map(a =>
      a.id === registro.id
        ? { ...a, estado: nuevoEstado, hora_entrada: nuevoEstado === 'PRESENTE' ? new Date().toTimeString().slice(0, 5) : null, tipo_registro: 'MANUAL' }
        : a
    ));
    if (!isDemo) {
      try {
        await api.post('/api/v1/personal/asistencia/registro', {
          empleado_id: registro.empleado_id ?? registro.id,
          fecha: fechaFiltro || new Date().toISOString().slice(0, 10),
          estado: nuevoEstado,
          tipo_registro: 'MANUAL',
        });
      } catch { /* silencioso — UI ya actualizada */ }
    }
    if (nuevoEstado === 'PRESENTE') {
      notify({ type: 'success', title: 'Asistencia registrada', message: `${registro.empleado_nombre} — registro manual` });
    }
  };

  const handleAbrirManualQR = (cuadrilla: CuadrillaReal) => {
    const horaDefEntrada = new Date().toTimeString().slice(0, 5);
    const checks: BulkCheck[] = cuadrilla.miembros
      .filter(m => m)
      .map(m => ({
        empleado_id: m.id_empleado,
        nombre: `${m.nombre} ${m.apellido_paterno}`,
        puesto: m.puesto,
        modo_asistencia: m.modo_asistencia ?? 'JORNADA_COMPLETA',
        estado: 'PRESENTE',
        horas_extra: '0',
        hora_entrada: horaDefEntrada,
        hora_salida: m.hora_salida_programada ?? '',
      }));
    setBulkChecks(checks);
    setQrTab('manual');
    setQrModal({ id: cuadrilla.id_cuadrilla, nombre: cuadrilla.nombre });
  };

  const handleGuardarBulk = async () => {
    if (!qrModal || bulkChecks.length === 0) return;
    setGuardandoBulk(true);
    try {
      await api.post('/api/v1/personal/asistencia/bulk', {
        fecha: fechaFiltro,
        cuadrilla_id: qrModal.id,
        registros: bulkChecks.map(b => {
          if (b.modo_asistencia === 'POR_HORAS') {
            return {
              empleado_id: b.empleado_id,
              hora_entrada: b.hora_entrada || undefined,
              hora_salida: b.hora_salida  || undefined,
            };
          }
          return {
            empleado_id: b.empleado_id,
            estado: b.estado,
            horas_extra: parseFloat(b.horas_extra) || 0,
          };
        }),
      });
      // Refrescar asistencia del día
      const r = await api.get('/api/v1/personal/asistencia', {
        params: { fecha_inicio: fechaFiltro, fecha_fin: fechaFiltro, cuadrilla_id: qrModal.id },
      });
      setAsistencia(prev => {
        const nuevos: RegistroAsistencia[] = (r.data as any)?.data ?? [];
        const otrosDias = prev.filter(a => a.fecha !== fechaFiltro || a.cuadrilla_id !== qrModal.id);
        return [...otrosDias, ...nuevos];
      });
      notify({ type: 'success', title: 'Asistencia registrada', message: `${bulkChecks.length} empleados · ${fechaFiltro}` });
      setQrModal(null);
    } catch (e: any) {
      notify({ type: 'error', title: 'Error al guardar asistencia', message: e.response?.data?.message || e.message });
    } finally {
      setGuardandoBulk(false);
    }
  };

  // ── Tabs ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="animate-pulse text-xs font-black uppercase tracking-widest text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* ── Encabezado ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <IconClipboardCheck className="h-5 w-5 text-indigo-500" />
          <h1 className="text-lg font-bold uppercase tracking-widest text-foreground">Residencia de Obra</h1>
          {isDemo && <SectionBadge className="bg-indigo-500/10 text-indigo-600">DEMO</SectionBadge>}
        </div>
        <p className="text-xs text-muted-foreground">Estimaciones · Aprobación de nómina · Control de asistencia QR</p>
      </div>

      {/* ── Dashboard Residente ─────────────────────────────────────────── */}
      {dashData && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="pt-4 pb-3 px-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Mis Requisiciones</p>
                <p className="mt-1 text-xl font-black text-foreground">{dashData.mis_requisiciones}</p>
                <p className="text-[10px] text-muted-foreground">enviadas</p>
              </CardContent>
            </Card>
            <Card className={dashData.estimaciones_pendientes > 0 ? 'border-amber-500/20 bg-amber-500/5' : ''}>
              <CardContent className="pt-4 pb-3 px-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Est. Pendientes</p>
                <p className={cn('mt-1 text-xl font-black', dashData.estimaciones_pendientes > 0 ? 'text-amber-700' : 'text-foreground')}>
                  {dashData.estimaciones_pendientes}
                </p>
                <p className="text-[10px] text-muted-foreground">por revisión</p>
              </CardContent>
            </Card>
            <Card className={dashData.ocs_por_recibir.length > 0 ? 'border-sky-500/20 bg-sky-500/5' : ''}>
              <CardContent className="pt-4 pb-3 px-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">OCs por Recibir</p>
                <p className={cn('mt-1 text-xl font-black', dashData.ocs_por_recibir.length > 0 ? 'text-sky-700' : 'text-foreground')}>
                  {dashData.ocs_por_recibir.length}
                </p>
                <p className="text-[10px] text-muted-foreground">{dashData.parcial ? '— datos parciales' : 'emitidas o parciales'}</p>
              </CardContent>
            </Card>
          </div>

          {dashData.ocs_por_recibir.length > 0 && (
            <div className="rounded-2xl border border-border/40 bg-card">
              <div className="px-4 py-3 border-b border-border/30">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">OCs Pendientes de Recibir</p>
              </div>
              {dashData.ocs_por_recibir.map((oc) => (
                <div key={oc.id} className="flex items-center justify-between gap-4 px-4 py-2.5 border-b border-border/20 last:border-0">
                  <div>
                    <p className="text-xs font-bold text-foreground">{oc.folio}</p>
                    <p className="text-[10px] text-muted-foreground">{oc.proveedor}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-foreground">{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(oc.monto)}</p>
                    <p className="text-[10px] text-sky-600 font-medium">{oc.estado}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {dashData.alertas.length > 0 && (
            <div className="space-y-2">
              {dashData.alertas.map((a, i) => (
                <div key={i} className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${a.severidad === 'critica' ? 'border-red-500/30 bg-red-500/5 text-red-700' : 'border-amber-500/30 bg-amber-500/5 text-amber-700'}`}>
                  <IconAlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="text-xs font-bold">{a.mensaje}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── KPIs dinámicos por tab ─────────────────────────────────────── */}
      {activeTab === 'estimaciones' && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Estimaciones',   value: kpiEstimaciones.total,                      sub: 'en total',          cls: 'text-foreground' },
            { label: 'En Revisión',    value: kpiEstimaciones.enRevision,                  sub: 'pendientes',        cls: 'text-amber-600'  },
            { label: 'Total Autorizado', value: fmt$(kpiEstimaciones.autorizado),          sub: 'autorizadas + pagadas', cls: 'text-emerald-600' },
            { label: 'Total Pagado',   value: fmt$(kpiEstimaciones.pagado),               sub: 'efectivamente pagado', cls: 'text-sky-600'   },
          ].map(k => (
            <Card key={k.label}>
              <CardContent className="pt-4 pb-3 px-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{k.label}</p>
                <p className={cn('mt-1 text-xl font-black', k.cls)}>{k.value}</p>
                <p className="text-[10px] text-muted-foreground">{k.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'nomina' && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            { label: 'Por Aprobar',  value: kpiNomina.pendientes,          sub: 'prenóminas pendientes', cls: 'text-amber-600'   },
            { label: 'Monto a Pagar', value: fmt$(kpiNomina.porPagar),     sub: 'total neto pendiente',   cls: 'text-foreground' },
            { label: 'Empleados',    value: kpiNomina.empleados,           sub: 'en próxima nómina',      cls: 'text-indigo-600' },
          ].map(k => (
            <Card key={k.label}>
              <CardContent className="pt-4 pb-3 px-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{k.label}</p>
                <p className={cn('mt-1 text-xl font-black', k.cls)}>{k.value}</p>
                <p className="text-[10px] text-muted-foreground">{k.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'asistencia' && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Presentes',     value: kpiAsistencia.presentes,     sub: 'hoy',             cls: 'text-emerald-600' },
            { label: 'Ausentes',      value: kpiAsistencia.ausentes,       sub: 'sin justificar',  cls: 'text-red-500'     },
            { label: 'Incapacidades', value: kpiAsistencia.incapacidades,  sub: 'con justificante', cls: 'text-sky-600'    },
          ].map(k => (
            <Card key={k.label}>
              <CardContent className="pt-4 pb-3 px-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{k.label}</p>
                <p className={cn('mt-1 text-xl font-black', k.cls)}>{k.value}</p>
                <p className="text-[10px] text-muted-foreground">{k.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'requisiciones' && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Total',      value: isDemo ? '—' : String(reqsResidente.length),                                               cls: 'text-foreground'  },
            { label: 'Pendientes', value: isDemo ? '—' : String(reqsResidente.filter(r => r.estado === 'PENDIENTE').length),         cls: 'text-amber-600'   },
            { label: 'Aprobadas',  value: isDemo ? '—' : String(reqsResidente.filter(r => r.estado === 'APROBADA').length),          cls: 'text-emerald-600' },
            { label: 'Imprevistos',value: isDemo ? '—' : String(reqsResidente.filter(r => r.tipo === 'IMPREVISTO').length),          cls: 'text-orange-600'  },
          ].map(k => (
            <Card key={k.label}>
              <CardContent className="pt-4 pb-3 px-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{k.label}</p>
                <p className={cn('mt-1 text-xl font-black', k.cls)}>{k.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}


      {/* ════════════════════════════════════════════════════════════════ */}
      {/* TAB: ESTIMACIONES                                               */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {activeTab === 'estimaciones' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-xs font-bold uppercase tracking-widest">
              Estimaciones de Obra
            </CardTitle>
            <Button size="sm" onClick={() => setShowEstForm(true)}>
              <IconPlus className="mr-1.5 h-3.5 w-3.5" />
              Nueva Estimación
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <TableContainer>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Frente</TableHead>
                    <TableHead>Periodo</TableHead>
                    <TableHead className="text-right">Conceptos</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="text-right">Total c/IVA</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Autorizador</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {estimaciones.map(est => {
                    const badge = EST_BADGE[est.estado];
                    return (
                      <TableRow key={est.id}>
                        <TableCell className="font-mono text-xs font-semibold">{est.codigo}</TableCell>
                        <TableCell>
                          <p className="text-xs font-medium">{est.frente}</p>
                          <p className="text-[11px] text-muted-foreground">{est.descripcion}</p>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {fmtDate(est.periodo_inicio)}<br />
                          <span className="text-[10px]">al {fmtDate(est.periodo_fin)}</span>
                        </TableCell>
                        <TableCell className="text-right text-xs">{est.conceptos}</TableCell>
                        <TableCell className="text-right text-xs tabular-nums">
                          {est.subtotal > 0 ? fmt$(est.subtotal) : '—'}
                        </TableCell>
                        <TableCell className="text-right text-xs font-semibold tabular-nums">
                          {est.total_neto > 0 ? fmt$(est.total_neto) : '—'}
                        </TableCell>
                        <TableCell>
                          <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', badge.cls)}>
                            {badge.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {est.autorizador ?? '—'}
                          {est.fecha_autorizacion && (
                            <p className="text-[10px]">{fmtDate(est.fecha_autorizacion)}</p>
                          )}
                        </TableCell>
                        <TableCell>
                          {est.estado === 'BORRADOR' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-[10px] h-6 px-2 text-indigo-600 hover:text-indigo-700"
                              onClick={() => handleEnviarRevision(est)}
                            >
                              Enviar a revisión
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {estimaciones.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9}>
                        <EmptyStatePanel title="Sin estimaciones registradas" />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* TAB: NÓMINA                                                     */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {activeTab === 'nomina' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-bold uppercase tracking-widest">
              Aprobación de Prenómina
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <TableContainer>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Periodo</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Empleados</TableHead>
                    <TableHead className="text-right">Total Bruto</TableHead>
                    <TableHead className="text-right">Deducciones</TableHead>
                    <TableHead className="text-right">Total Neto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prenominas.map(pn => {
                    const badge = NOM_BADGE[pn.estado];
                    return (
                      <TableRow key={pn.id}>
                        <TableCell className="font-mono text-xs font-semibold">{pn.codigo}</TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {fmtDate(pn.periodo_inicio)}<br />
                          <span className="text-[10px]">al {fmtDate(pn.periodo_fin)}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-[10px] font-semibold uppercase text-muted-foreground">{pn.periodo_tipo}</span>
                        </TableCell>
                        <TableCell className="text-right text-xs">{pn.total_empleados}</TableCell>
                        <TableCell className="text-right text-xs tabular-nums">{fmt$(pn.total_bruto)}</TableCell>
                        <TableCell className="text-right text-xs tabular-nums text-red-500">-{fmt$(pn.total_deducciones)}</TableCell>
                        <TableCell className="text-right text-xs font-bold tabular-nums">{fmt$(pn.total_neto)}</TableCell>
                        <TableCell>
                          <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', badge.cls)}>
                            {badge.label}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm" variant="ghost"
                              className="text-[10px] h-6 px-2 text-muted-foreground"
                              onClick={() => setNominaDetalle(pn)}
                            >
                              Ver detalle
                            </Button>
                            {(pn.estado === 'PENDIENTE' || pn.estado === 'EN_PROCESO') && (
                              <Button
                                size="sm"
                                className="text-[10px] h-6 px-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={() => setConfirmAprobar(pn)}
                              >
                                Aprobar
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* TAB: ASISTENCIA                                                 */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {activeTab === 'asistencia' && (
        <div className="flex flex-col gap-4">
          {/* Controles */}
          <Card>
            <CardContent className="flex flex-wrap items-end gap-4 pt-4 pb-4 px-4">
              <FormField label="Fecha">
                <Input
                  type="date"
                  value={fechaFiltro}
                  onChange={e => setFechaFiltro(e.target.value)}
                  className="w-44"
                />
              </FormField>
              <FormField label="Cuadrilla">
                <Select value={cuadrillaFiltro} onChange={e => setCuadrillaFiltro(e.target.value)} className="w-56">
                  <option value="all">Todas las cuadrillas</option>
                  {(isDemo ? DEMO_CUADRILLAS : cuadrillas).map(c => (
                    <option key={c.id_cuadrilla} value={c.id_cuadrilla}>{c.nombre}</option>
                  ))}
                </Select>
              </FormField>
              <div className="flex flex-wrap gap-2">
                {(isDemo ? DEMO_CUADRILLAS : cuadrillas)
                  .filter(c => cuadrillaFiltro === 'all' || c.id_cuadrilla === cuadrillaFiltro)
                  .map(c => (
                    <Button
                      key={c.id_cuadrilla}
                      size="sm"
                      variant="outline"
                      onClick={() => { setQrTab('qr'); setQrModal({ id: c.id_cuadrilla, nombre: c.nombre }); }}
                      className="text-[10px] gap-1"
                    >
                      <IconQrCode className="h-3 w-3" />
                      QR {(c as any).codigo}
                    </Button>
                  ))
                }
                {!isDemo && cuadrillas
                  .filter(c => cuadrillaFiltro === 'all' || c.id_cuadrilla === cuadrillaFiltro)
                  .map(c => (
                    <Button
                      key={`manual-${c.id_cuadrilla}`}
                      size="sm"
                      variant="outline"
                      onClick={() => handleAbrirManualQR(c)}
                      className="text-[10px] gap-1 border-indigo-500/30 text-indigo-600 hover:bg-indigo-500/5"
                    >
                      ✏ Manual {(c as any).codigo}
                    </Button>
                  ))
                }
              </div>
            </CardContent>
          </Card>

          {/* Tabla */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold uppercase tracking-widest">
                Registros del {fmtDate(fechaFiltro)}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <TableContainer>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empleado</TableHead>
                      <TableHead>Puesto</TableHead>
                      <TableHead>Cuadrilla</TableHead>
                      <TableHead>Entrada</TableHead>
                      <TableHead>Salida</TableHead>
                      <TableHead>Registro</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {asistenciaFiltrada.map(reg => {
                      const badge = ASIS_BADGE[reg.estado] ?? ASIS_BADGE['PRESENTE'];
                      const sinSalida = reg.modo_asistencia === 'POR_HORAS' && reg.hora_entrada && !reg.hora_salida;
                      return (
                        <TableRow key={reg.id}>
                          <TableCell className="text-xs font-medium">{reg.empleado_nombre}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{reg.puesto}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{reg.cuadrilla_nombre}</TableCell>
                          <TableCell className="font-mono text-xs">{reg.hora_entrada ?? '—'}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {reg.hora_salida ?? (sinSalida
                              ? <span className="rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-black text-amber-600">Sin salida</span>
                              : '—'
                            )}
                          </TableCell>
                          <TableCell>
                            {reg.tipo_registro ? (
                              <span className={cn(
                                'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                                reg.tipo_registro === 'QR' ? 'bg-indigo-500/10 text-indigo-600' : 'bg-zinc-500/10 text-zinc-500'
                              )}>
                                {reg.tipo_registro}
                              </span>
                            ) : '—'}
                          </TableCell>
                          <TableCell>
                            <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', badge.cls)}>
                              {badge.label}
                            </span>
                          </TableCell>
                          <TableCell>
                            {(reg.estado === 'AUSENTE' || reg.estado === 'PRESENTE') && (
                              <Button
                                size="sm" variant="ghost"
                                className="text-[10px] h-6 px-2 text-muted-foreground"
                                onClick={() => handleRegistrarManual(reg)}
                              >
                                {reg.estado === 'AUSENTE' ? 'Registrar entrada' : 'Marcar salida'}
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {asistenciaFiltrada.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8}>
                          <EmptyStatePanel title="Sin registros para la fecha y cuadrilla seleccionadas" />
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* SLIDE PANEL — Nueva Estimación                                  */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <SlidePanel
        isOpen={showEstForm}
        onClose={() => setShowEstForm(false)}
        title="Nueva Estimación"
        accentColor="indigo"
      >
        <form onSubmit={handleSubmitEstimacion} className="flex flex-col gap-4">
          <FormField label="Frente de trabajo *">
            <Input
              placeholder="Ej. Frente B — Acabados nivel 11-13"
              value={estForm.frente}
              onChange={e => setEstForm(f => ({ ...f, frente: e.target.value }))}
              required
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Periodo inicio *">
              <Input
                type="date"
                value={estForm.periodo_inicio}
                onChange={e => setEstForm(f => ({ ...f, periodo_inicio: e.target.value }))}
                required
              />
            </FormField>
            <FormField label="Periodo fin *">
              <Input
                type="date"
                value={estForm.periodo_fin}
                onChange={e => setEstForm(f => ({ ...f, periodo_fin: e.target.value }))}
                required
              />
            </FormField>
          </div>
          <FormField label="Descripción de trabajos">
            <Textarea
              placeholder="Descripción breve de los conceptos incluidos..."
              value={estForm.descripcion}
              onChange={e => setEstForm(f => ({ ...f, descripcion: e.target.value }))}
              rows={3}
            />
          </FormField>
          <p className="text-[11px] text-muted-foreground">
            La estimación se creará en estado <strong>Borrador</strong>. Podrás agregar conceptos antes de enviarla a revisión.
          </p>
          <SubmitButton label="Crear Estimación" color="indigo" />
        </form>
      </SlidePanel>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* MODAL — Detalle de Prenómina                                    */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <Modal open={!!nominaDetalle} onClose={() => setNominaDetalle(null)} title="Detalle de Prenómina">
        {nominaDetalle && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><p className="text-muted-foreground">Código</p><p className="font-mono font-semibold">{nominaDetalle.codigo}</p></div>
              <div><p className="text-muted-foreground">Periodo</p><p className="font-semibold">{fmtDate(nominaDetalle.periodo_inicio)} – {fmtDate(nominaDetalle.periodo_fin)}</p></div>
              <div><p className="text-muted-foreground">Total Bruto</p><p className="font-semibold">{fmt$(nominaDetalle.total_bruto)}</p></div>
              <div><p className="text-muted-foreground">Deducciones</p><p className="font-semibold text-red-500">-{fmt$(nominaDetalle.total_deducciones)}</p></div>
            </div>
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Cuadrilla</th>
                    <th className="px-3 py-2 text-right font-semibold text-muted-foreground">Emp.</th>
                    <th className="px-3 py-2 text-right font-semibold text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {nominaDetalle.cuadrillas.map((c, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-3 py-2">{c.nombre}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{c.empleados}</td>
                      <td className="px-3 py-2 text-right tabular-nums font-medium">{fmt$(c.total)}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-border bg-muted/20 font-bold">
                    <td className="px-3 py-2">Total Neto</td>
                    <td className="px-3 py-2 text-right tabular-nums">{nominaDetalle.total_empleados}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{fmt$(nominaDetalle.total_neto)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {(nominaDetalle.estado === 'PENDIENTE' || nominaDetalle.estado === 'EN_PROCESO') && (
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white w-full"
                onClick={() => { setNominaDetalle(null); setConfirmAprobar(nominaDetalle); }}
              >
                Aprobar Nómina
              </Button>
            )}
          </div>
        )}
      </Modal>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* MODAL — Confirmación aprobación                                 */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <Modal open={!!confirmAprobar} onClose={() => setConfirmAprobar(null)} title="Confirmar Aprobación">
        {confirmAprobar && (
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 text-sm">
              <p className="font-semibold text-foreground">¿Aprobar la prenómina <span className="font-mono">{confirmAprobar.codigo}</span>?</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {confirmAprobar.total_empleados} empleados · {fmt$(confirmAprobar.total_neto)} neto
              </p>
              <p className="mt-2 text-xs text-amber-600 font-medium">
                Esta acción notificará al departamento de Personal para procesar el pago.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmAprobar(null)}>
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleAprobarNomina}
              >
                <IconCheckCircle2 className="mr-1.5 h-4 w-4" />
                Confirmar aprobación
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* TAB: REQUISICIONES                                               */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {activeTab === 'requisiciones' && (
        <div className="space-y-4">
          {/* Header con botón nueva req */}
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Tus solicitudes de compra para este frente de obra
            </p>
            <Button
              size="sm"
              onClick={() => setShowReqPanel(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black"
            >
              <IconPlus className="mr-1.5 h-3.5 w-3.5" />
              Nueva Requisición
            </Button>
          </div>

          {isDemo ? (
            <div className="rounded-2xl border border-dashed border-border/50 p-12 text-center">
              <IconShoppingCart className="mx-auto mb-3 h-10 w-10 text-muted-foreground/20" />
              <p className="text-sm font-bold text-muted-foreground">Demo — usa "Nueva Requisición" para simular</p>
              <p className="mt-1 text-xs text-muted-foreground">
                En producción verás aquí todas las solicitudes que hayas enviado a Compras.
              </p>
            </div>
          ) : reqsResidente.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/50 p-12 text-center">
              <IconShoppingCart className="mx-auto mb-3 h-10 w-10 text-muted-foreground/20" />
              <p className="text-sm font-bold text-muted-foreground">Sin requisiciones activas</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Crea una desde un concepto APU o como imprevisto de obra.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {reqsResidente.map(req => {
                const badge = REQ_ESTADO_BADGE[req.estado] ?? { cls: 'bg-zinc-500/10 text-zinc-500', label: req.estado };
                return (
                  <Card key={req.id} className="border-border/40">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-[10px] font-black text-indigo-700">
                          {req.folio}
                        </span>
                        {req.tipo === 'IMPREVISTO' && (
                          <span className="rounded-md border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 text-[9px] font-black text-orange-700">
                            Imprevisto
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black', badge.cls)}>
                          <IconClock className="h-3 w-3" />
                          {badge.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(req.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                      {req.concepto_clave && (
                        <p className="text-[10px] font-mono text-indigo-600 truncate">
                          [{req.concepto_clave}] {req.concepto_descripcion}
                        </p>
                      )}
                      {req.observaciones && (
                        <p className="text-[11px] text-muted-foreground line-clamp-2">{req.observaciones}</p>
                      )}
                      {!!req.items?.length && (
                        <div className="rounded-xl border border-border/40 bg-muted/20">
                          <button
                            type="button"
                            onClick={() => toggleReqExpandedResidente(req.id)}
                            className="flex w-full items-center justify-between px-3 py-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground"
                          >
                            <span>Ver {req.items.length} ítem{req.items.length === 1 ? '' : 's'}</span>
                            <span>{expandedReqIds.has(req.id) ? '▲' : '▼'}</span>
                          </button>
                          {expandedReqIds.has(req.id) && (
                            <div className="space-y-2 border-t border-border/40 px-3 py-2.5">
                              {req.items.map(item => {
                                const insumo = item.insumo_id ? insumoByIdResidente.get(item.insumo_id) : undefined;
                                const nombre = item.es_imprevisto
                                  ? (item.descripcion_libre || 'Descripción libre no capturada')
                                  : (insumo ? `[${insumo.clave}] ${insumo.descripcion}` : (item.insumo_id ? 'Insumo no encontrado en catálogo' : '—'));
                                const unidad = item.es_imprevisto ? item.unidad_libre : insumo?.unidad_medida;
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
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>Prioridad: <strong>{req.prioridad}</strong></span>
                        {req.estado === 'PENDIENTE' && (
                          <span className="text-amber-600">⏳ Esperando aprobación</span>
                        )}
                        {req.estado === 'APROBADA' && (
                          <span className="text-emerald-600">✓ En cotización</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* SLIDE PANEL — Nueva Requisición (Residente)                      */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <SlidePanel
        isOpen={showReqPanel}
        onClose={() => { setShowReqPanel(false); resetReqPanel(); }}
        title="Nueva Requisición"
        subtitle={
          reqTipo === 'IMPREVISTO' ? 'Imprevisto de obra — texto libre'
          : reqTipo === 'APU' ? 'Desde APU — take-off de composición'
          : 'Por Insumo — selección del catálogo'
        }
        accentColor={reqTipo === 'IMPREVISTO' ? 'amber' : 'indigo'}
      >
        <div className="space-y-5">

          {/* ── Partida del catálogo (obligatoria para INSUMO / IMPREVISTO) ── */}
          {reqTipo !== 'APU' && (() => {
            const conceptoReq = conceptos.find(c => c.id === reqConceptoId) ?? null;
            const filtrados2 = reqConceptoSearch2.trim()
              ? conceptos.filter(c => `${c.clave} ${c.descripcion}`.toLowerCase().includes(reqConceptoSearch2.toLowerCase()))
              : conceptos;
            return (
              <div className="space-y-1.5">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Partida del catálogo <span className="text-red-500">*</span>
                </p>
                {conceptoReq ? (
                  <div className="flex items-center justify-between rounded-xl border border-indigo-500/40 bg-indigo-500/5 px-3 py-2">
                    <div>
                      <p className="text-[10px] font-mono text-indigo-600 uppercase tracking-wider">{conceptoReq.clave}</p>
                      <p className="text-xs font-bold text-foreground/80">{conceptoReq.descripcion}</p>
                    </div>
                    <button type="button" onClick={() => setReqConceptoId(null)}
                      className="ml-2 text-muted-foreground hover:text-red-500">
                      <IconX className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="relative">
                      <IconSearch className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Buscar partida por clave o descripción..."
                        value={reqConceptoSearch2}
                        onChange={e => setReqConceptoSearch2(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-background border border-border/60 rounded-lg focus:border-indigo-400 outline-none"
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-0.5">
                      {filtrados2.length === 0 ? (
                        <p className="text-[10px] text-muted-foreground py-2 text-center">
                          {conceptos.length === 0 ? 'Sin catálogo de obra — importa en Gerencia Técnica' : 'Sin coincidencias'}
                        </p>
                      ) : filtrados2.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => { setReqConceptoId(c.id); setReqConceptoSearch2(''); }}
                          className="w-full flex items-center gap-3 rounded-lg border border-border/30 px-3 py-2 text-left hover:border-indigo-400/40 hover:bg-indigo-500/5 transition-all"
                        >
                          <span className="text-[10px] font-mono text-indigo-600 shrink-0">{c.clave}</span>
                          <span className="text-xs truncate text-foreground/80">{c.descripcion}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Selector tipo — 3 opciones */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'INSUMO',    label: '📦 Por Insumo',  sub: 'Del catálogo de materiales, equipo y servicios' },
              { value: 'APU',       label: '📋 Desde APU',   sub: 'Calcula materiales desde el catálogo de obra'   },
              { value: 'IMPREVISTO',label: '⚠️ Imprevisto',  sub: 'Material fuera del presupuesto APU'             },
            ].map(opt => {
              const isActive = reqTipo === opt.value;
              const activeClass = opt.value === 'IMPREVISTO'
                ? 'border-orange-500/40 bg-orange-500/10 shadow-sm'
                : 'border-indigo-500/40 bg-indigo-500/10 shadow-sm';
              const activeTextClass = opt.value === 'IMPREVISTO' ? 'text-orange-700' : 'text-indigo-700';
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setReqTipo(opt.value as 'INSUMO' | 'APU' | 'IMPREVISTO')}
                  className={cn(
                    'flex flex-col items-start rounded-xl border px-3 py-3 text-left transition-all',
                    isActive ? activeClass : 'border-border/30 bg-muted/20 hover:bg-muted/40'
                  )}
                >
                  <span className={cn('text-xs font-black', isActive ? activeTextClass : 'text-foreground')}>
                    {opt.label}
                  </span>
                  <span className="mt-0.5 text-[10px] text-muted-foreground leading-snug">{opt.sub}</span>
                </button>
              );
            })}
          </div>

          {/* ── Por Insumo: catálogo filtrado ── */}
          {reqTipo === 'INSUMO' && (
            <div className="space-y-4">
              {/* Tabs de tipo */}
              <div className="flex gap-2">
                {(['MATERIAL', 'EQUIPO', 'SERVICIO'] as const).map(tab => {
                  const tabLabels = { MATERIAL: '🧱 Material', EQUIPO: '🏗 Equipo', SERVICIO: '🔧 Servicio' };
                  const typeMap = { MATERIAL: 'MATERIAL', EQUIPO: 'EQUIPO', SERVICIO: 'SUBCONTRATO' };
                  const count = insumosAll
                    .filter(i => i.tipo_insumo === typeMap[tab])
                    .filter(i => !insumosDePartidaIds || insumosDePartidaIds.has(i.insumo_id))
                    .length;
                  return (
                    <button
                      key={tab}
                      onClick={() => { setInsumoTabTipo(tab); setInsumoSearch(''); }}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all',
                        insumoTabTipo === tab
                          ? 'bg-indigo-500 text-white border-indigo-500'
                          : 'border-border/60 text-muted-foreground hover:bg-muted'
                      )}
                    >
                      {tabLabels[tab]}
                      {count > 0 && <span className="ml-1 opacity-70">({count})</span>}
                    </button>
                  );
                })}
              </div>

              {/* Búsqueda */}
              <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar por clave o descripción..."
                  value={insumoSearch}
                  onChange={e => setInsumoSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-background border border-border/60 rounded-lg focus:border-indigo-400 outline-none"
                />
              </div>

              {/* Catálogo filtrado */}
              {loadingInsumos || loadingInsumosPartida ? (
                <div className="text-center py-4">
                  <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-indigo-500/20 border-t-indigo-600" />
                  <p className="mt-2 text-[10px] text-muted-foreground">
                    {loadingInsumosPartida ? 'Cargando insumos de la partida...' : 'Cargando catálogo...'}
                  </p>
                </div>
              ) : (() => {
                const typeMap: Record<'MATERIAL' | 'EQUIPO' | 'SERVICIO', string> = {
                  MATERIAL: 'MATERIAL', EQUIPO: 'EQUIPO', SERVICIO: 'SUBCONTRATO',
                };
                const tipoTarget = typeMap[insumoTabTipo];
                const porPartida = insumosAll
                  .filter(i => !insumosDePartidaIds || insumosDePartidaIds.has(i.insumo_id));
                const filtrados = porPartida
                  .filter(i => i.tipo_insumo === tipoTarget)
                  .filter(i => {
                    if (!insumoSearch.trim()) return true;
                    const q = insumoSearch.toLowerCase();
                    return i.clave.toLowerCase().includes(q) || i.descripcion.toLowerCase().includes(q);
                  })
                  .filter(i => !insumosSeleccionados.find(s => s.insumo_id === i.insumo_id))
                  .slice(0, 15);
                const totalDeTipo = porPartida.filter(i => i.tipo_insumo === tipoTarget).length;
                if (totalDeTipo === 0) {
                  return (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-[10px] text-amber-700">
                      {insumosDePartidaIds
                        ? <>Esta partida no tiene insumos de tipo <strong>{insumoTabTipo}</strong> en su APU. Prueba con otro tipo o usa <strong>Imprevisto</strong>.</>
                        : <>Este proyecto no tiene insumos de tipo {insumoTabTipo} en el catálogo. Usa la opción <strong>Imprevisto</strong>.</>
                      }
                    </div>
                  );
                }
                if (filtrados.length === 0 && insumoSearch) {
                  return <p className="text-[10px] text-muted-foreground text-center py-3">Sin coincidencias en el catálogo.</p>;
                }
                return (
                  <div className="rounded-xl border border-border/40 overflow-hidden max-h-48 overflow-y-auto">
                    {filtrados.map((insumo, i) => (
                      <button
                        key={insumo.insumo_id}
                        type="button"
                        onClick={() => {
                          const cantDefault = insumo.cantidad_presupuestada ?? 0;
                          setInsumosSeleccionados(prev => [...prev, { ...insumo, cantidad: cantDefault, notas: '', especificaciones: [], justificacion: '', especificacion_marca_modelo: '', especificacion_detalle: '' }]);
                          setInsumoSearch('');
                        }}
                        className={cn(
                          'flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-indigo-500/5 transition-colors',
                          i % 2 === 0 ? 'bg-muted/10' : 'bg-transparent'
                        )}
                      >
                        <span className="rounded bg-indigo-500/10 px-1.5 py-0.5 text-[9px] font-black text-indigo-700 shrink-0">{insumo.clave}</span>
                        <span className="flex-1 text-xs text-foreground leading-snug">{insumo.descripcion}</span>
                        {(insumo.cantidad_presupuestada ?? 0) > 0 && (
                          <span className="text-[9px] text-emerald-600 font-bold shrink-0">
                            Pres: {insumo.cantidad_presupuestada} {insumo.unidad_medida}
                          </span>
                        )}
                        <span className="text-[9px] text-muted-foreground shrink-0">{insumo.unidad_medida}</span>
                        <span className="text-[9px] text-indigo-500 font-black shrink-0">+ Agregar</span>
                      </button>
                    ))}
                  </div>
                );
              })()}

              {/* Ítems seleccionados */}
              {insumosSeleccionados.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Ítems a requisitar ({insumosSeleccionados.length})
                  </p>
                  {insumosSeleccionados.map((item, idx) => {
                    const excedente = item.cantidad_presupuestada != null && item.cantidad > item.cantidad_presupuestada;
                    const pctExcedente = excedente
                      ? ((item.cantidad - item.cantidad_presupuestada!) / item.cantidad_presupuestada! * 100).toFixed(0)
                      : null;
                    return (
                      <div
                        key={item.insumo_id}
                        className={cn(
                          'flex flex-col rounded-xl border',
                          excedente
                            ? 'border-amber-500/40 bg-amber-500/5'
                            : 'border-indigo-500/20 bg-indigo-500/5'
                        )}
                      >
                        {/* fila principal: descripción + cantidad + eliminar */}
                        <div className="flex items-start gap-3 px-4 py-2.5">
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-mono text-muted-foreground">{item.clave}</p>
                            <p className="text-xs font-semibold text-foreground truncate">{item.descripcion}</p>
                            {excedente && (
                              <p className="text-[9px] text-amber-600 mt-0.5">
                                ⚠ Excede presupuesto — pres: {item.cantidad_presupuestada} {item.unidad_medida}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end shrink-0 gap-0.5">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              placeholder="Cant."
                              value={item.cantidad || ''}
                              onChange={e => setInsumosSeleccionados(prev => prev.map((p, i) => i === idx ? { ...p, cantidad: Number(e.target.value) } : p))}
                              className={cn(
                                'w-20 text-right text-xs font-bold bg-background border rounded-lg px-2 py-1 focus:border-indigo-400 outline-none',
                                excedente ? 'border-amber-500/60' : 'border-border/60'
                              )}
                            />
                            <span className="text-[9px] text-muted-foreground">{item.unidad_medida}</span>
                            {pctExcedente && (
                              <span className="text-[8px] font-black text-amber-600 bg-amber-500/10 rounded px-1.5 py-0.5 whitespace-nowrap">
                                ↑ {pctExcedente}% sobre pres.
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => setInsumosSeleccionados(prev => prev.filter((_, i) => i !== idx))}
                            className="text-muted-foreground hover:text-red-500 shrink-0 mt-0.5"
                          >
                            <IconX className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        {/* ── Justificación de excedente (obligatoria) ── */}
                        {excedente && (
                          <div className="px-4 pb-2 pt-1 border-t border-amber-500/20">
                            <p className="mb-1 text-[9px] font-black uppercase tracking-widest text-amber-600">
                              Justificación del excedente <span className="text-red-500">*</span>
                            </p>
                            <textarea
                              rows={2}
                              placeholder="Explica el motivo por el que se requiere más cantidad de lo presupuestado…"
                              value={item.justificacion}
                              onChange={e => setInsumosSeleccionados(prev => prev.map((p, pi) => pi === idx ? { ...p, justificacion: e.target.value } : p))}
                              className={cn(
                                'w-full resize-none rounded-lg border px-2.5 py-1.5 text-[10px] outline-none placeholder:text-muted-foreground/60',
                                item.justificacion.trim()
                                  ? 'border-amber-400/60 focus:border-amber-500 bg-background'
                                  : 'border-red-400/60 bg-red-500/5 focus:border-red-500'
                              )}
                            />
                          </div>
                        )}
                        {/* ── Especificaciones técnicas por partida ── */}
                        <div className="px-4 pb-3 pt-1 border-t border-indigo-500/10 space-y-1.5">
                          {item.especificaciones.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-1">
                              {item.especificaciones.map((spec, si) => (
                                <span key={si} className="flex items-center gap-1 text-[9px] bg-indigo-500/10 text-indigo-700 rounded-full px-2 py-0.5 max-w-[240px]">
                                  <span className="truncate">{spec}</span>
                                  <button
                                    type="button"
                                    onClick={() => setInsumosSeleccionados(prev => prev.map((p, pi) => pi === idx
                                      ? { ...p, especificaciones: p.especificaciones.filter((_, xi) => xi !== si) }
                                      : p))}
                                    className="shrink-0 hover:text-red-500"
                                  >
                                    <IconX className="h-2.5 w-2.5" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                          <input
                            type="text"
                            placeholder="+ Especificación técnica (Enter para agregar)"
                            value={specInputs[idx] ?? ''}
                            maxLength={500}
                            onChange={e => setSpecInputs(prev => ({ ...prev, [idx]: e.target.value }))}
                            onKeyDown={e => {
                              if (e.key === 'Enter' && specInputs[idx]?.trim()) {
                                e.preventDefault();
                                const val = specInputs[idx].trim();
                                setInsumosSeleccionados(prev => prev.map((p, pi) => pi === idx
                                  ? { ...p, especificaciones: [...p.especificaciones, val] }
                                  : p));
                                setSpecInputs(prev => ({ ...prev, [idx]: '' }));
                              }
                            }}
                            className="w-full text-[10px] bg-background border border-border/40 rounded-lg px-2.5 py-1.5 focus:border-indigo-400 outline-none placeholder:text-muted-foreground/60"
                          />
                          <input
                            type="text"
                            placeholder="Marca / Modelo ref. (opcional)"
                            value={item.especificacion_marca_modelo}
                            maxLength={200}
                            onChange={e => setInsumosSeleccionados(prev => prev.map((p, pi) => pi === idx ? { ...p, especificacion_marca_modelo: e.target.value } : p))}
                            className="w-full text-[10px] bg-background border border-border/40 rounded-lg px-2.5 py-1.5 focus:border-indigo-400 outline-none placeholder:text-muted-foreground/60"
                          />
                          <textarea
                            rows={2}
                            placeholder="Especificaciones técnicas detalladas (opcional)"
                            value={item.especificacion_detalle}
                            onChange={e => setInsumosSeleccionados(prev => prev.map((p, pi) => pi === idx ? { ...p, especificacion_detalle: e.target.value } : p))}
                            className="w-full resize-none text-[10px] bg-background border border-border/40 rounded-lg px-2.5 py-1.5 focus:border-indigo-400 outline-none placeholder:text-muted-foreground/60"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {insumosAll.length === 0 && !loadingInsumos && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-[10px] text-amber-700">
                  Este proyecto no tiene insumos en el catálogo. Usa la opción <strong>Imprevisto</strong>.
                </div>
              )}
            </div>
          )}

          {/* ── APU: búsqueda de concepto APU ── */}
          {reqTipo === 'APU' && (
            <div className="space-y-4">
              {/* Concepto seleccionado */}
              {/* Concepto seleccionado — chip compacto */}
              {conceptoSeleccionado && (
                <div className="flex items-center justify-between rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-4 py-3">
                  <div>
                    <p className="text-[10px] font-mono text-indigo-600 uppercase tracking-wider mb-0.5">Concepto seleccionado</p>
                    <p className="text-xs font-black text-indigo-800">{conceptoSeleccionado.clave} — {conceptoSeleccionado.descripcion}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{conceptoSeleccionado.unidad_medida}</p>
                  </div>
                  <button type="button" onClick={() => { setConceptoSeleccionado(null); setMaterialesTakeoff([]); setCantidadTakeoff(''); }}
                    className="ml-3 text-muted-foreground hover:text-red-500 shrink-0">
                    <IconX className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Lista de partidas APU — siempre visible */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Partidas del presupuesto ({conceptos.length})
                  </p>
                  {conceptoSeleccionado && (
                    <span className="text-[9px] text-indigo-600 font-semibold">Seleccionado ↑</span>
                  )}
                </div>
                {/* Buscador */}
                <div className="relative">
                  <IconSearch className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9 text-xs"
                    placeholder="Filtrar por clave o descripción..."
                    value={conceptoSearch}
                    onChange={e => setConceptoSearch(e.target.value)}
                  />
                </div>
                {/* Listado scrollable */}
                <div className="rounded-xl border border-border/40 overflow-hidden max-h-52 overflow-y-auto">
                  {conceptosFiltrados.length === 0 ? (
                    <div className="px-4 py-4 text-center text-xs text-muted-foreground">
                      {conceptoSearch
                        ? 'Sin partidas que coincidan con la búsqueda'
                        : sinPresupuesto
                          ? 'Sin presupuesto activo — importa el catálogo en Gerencia Técnica'
                          : 'No hay partidas en el presupuesto activo'}
                    </div>
                  ) : (
                    conceptosFiltrados.map((c, ci) => {
                      const isSelected = conceptoSeleccionado?.id === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setConceptoSeleccionado(null); setMaterialesTakeoff([]); setCantidadTakeoff('');
                            } else {
                              setConceptoSeleccionado(c); setConceptoSearch('');
                            }
                          }}
                          className={cn(
                            'flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors',
                            ci % 2 === 0 ? 'bg-muted/20' : 'bg-transparent',
                            isSelected
                              ? 'bg-indigo-500/15 border-l-2 border-indigo-500'
                              : 'hover:bg-muted/60'
                          )}
                        >
                          <span className={cn(
                            'rounded px-1.5 py-0.5 text-[9px] font-black shrink-0',
                            isSelected ? 'bg-indigo-500/20 text-indigo-700' : 'bg-indigo-500/10 text-indigo-600'
                          )}>{c.clave}</span>
                          <span className="flex-1 text-xs text-foreground leading-snug">{c.descripcion}</span>
                          <span className="shrink-0 text-[9px] text-muted-foreground">{c.unidad_medida}</span>
                          {isSelected && <span className="shrink-0 text-[9px] font-black text-indigo-600">✓</span>}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Cantidad a ejecutar */}
              {conceptoSeleccionado && (
                <FormField label={`Cantidad a ejecutar (${conceptoSeleccionado.unidad_medida})`} required>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={cantidadTakeoff}
                    onChange={e => setCantidadTakeoff(e.target.value)}
                  />
                </FormField>
              )}

              {/* Materiales del take-off */}
              {loadingComposicion && (
                <div className="text-center py-4">
                  <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-indigo-500/20 border-t-indigo-600" />
                  <p className="mt-2 text-[10px] text-muted-foreground">Cargando composición APU...</p>
                </div>
              )}
              {!loadingComposicion && materialesTakeoff.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Materiales a requisitar
                    </p>
                    <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[9px] font-black text-indigo-700">
                      {materialesTakeoff.length} insumo{materialesTakeoff.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="rounded-xl border border-border/40 overflow-hidden">
                    {materialesTakeoff.map((m, i) => (
                      <div key={m.insumo_id}
                        className={cn('flex items-center justify-between gap-3 px-4 py-2.5 text-xs',
                          i % 2 === 0 ? 'bg-muted/20' : 'bg-transparent'
                        )}>
                        <div className="flex-1 min-w-0">
                          <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-black text-emerald-700 mr-2">{m.clave}</span>
                          <span className="text-foreground truncate">{m.descripcion}</span>
                        </div>
                        <span className={cn('shrink-0 font-black text-right',
                          (parseFloat(cantidadTakeoff) || 0) > 0 ? 'text-indigo-700' : 'text-muted-foreground'
                        )}>
                          {(parseFloat(cantidadTakeoff) || 0) > 0
                            ? `${m.cantidad_total.toFixed(4)} ${m.unidad}`
                            : '—'
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                  {!cantidadTakeoff && (
                    <p className="text-[10px] text-muted-foreground text-center">Ingresa la cantidad para ver los totales</p>
                  )}
                </div>
              )}
              {!loadingComposicion && conceptoSeleccionado && materialesTakeoff.length === 0 && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-[10px] text-amber-700">
                  Este concepto no tiene insumos de tipo MATERIAL en su composición APU.
                  Si necesitas materiales no catalogados, usa el tipo <strong>Imprevisto</strong>.
                </div>
              )}
            </div>
          )}

          {/* ── IMPREVISTO: texto libre ── */}
          {reqTipo === 'IMPREVISTO' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Materiales a solicitar <span className="text-red-500">*</span>
                </p>
                <button type="button"
                  onClick={() => setItemsImprevisto(prev => [...prev, { descripcion_libre: '', unidad_libre: 'PZA', cantidad: '', notas: '', justificacion: '', especificacion_marca_modelo: '', especificacion_detalle: '' }])}
                  className="flex items-center gap-1 text-[10px] font-black text-orange-600 hover:text-orange-500"
                >
                  <IconPlus className="h-3 w-3" /> Agregar ítem
                </button>
              </div>
              {itemsImprevisto.map((item, idx) => (
                <Card key={idx} className="border-orange-500/20 bg-orange-500/5 shadow-none">
                  <CardContent className="relative p-4 space-y-3">
                    {itemsImprevisto.length > 1 && (
                      <button type="button"
                        onClick={() => setItemsImprevisto(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-red-500">
                        <IconX className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <FormField label="Descripción del material" required>
                      <Input
                        placeholder="Ej: Tabique rojo recocido 7×14×28 cm"
                        value={item.descripcion_libre}
                        onChange={e => setItemsImprevisto(prev => {
                          const n = [...prev]; n[idx] = { ...n[idx], descripcion_libre: e.target.value }; return n;
                        })}
                      />
                    </FormField>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField label="Unidad">
                        <Select value={item.unidad_libre} onChange={e => setItemsImprevisto(prev => {
                          const n = [...prev]; n[idx] = { ...n[idx], unidad_libre: e.target.value }; return n;
                        })}>
                          {UNIDADES_REQ.map(u => <option key={u} value={u}>{u}</option>)}
                        </Select>
                      </FormField>
                      <FormField label="Cantidad" required>
                        <Input type="number" placeholder="0"
                          value={item.cantidad}
                          onChange={e => setItemsImprevisto(prev => {
                            const n = [...prev]; n[idx] = { ...n[idx], cantidad: e.target.value }; return n;
                          })}
                        />
                      </FormField>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField label="Notas (frente, área)">
                        <Input className="text-xs" placeholder="Ej: Frente Nivel 12 eje A-B"
                          value={item.notas}
                          onChange={e => setItemsImprevisto(prev => {
                            const n = [...prev]; n[idx] = { ...n[idx], notas: e.target.value }; return n;
                          })}
                        />
                      </FormField>
                    </div>
                    <div>
                      <p className="mb-1 text-[9px] font-black uppercase tracking-widest text-orange-600">
                        Justificación <span className="text-red-500">*</span>
                      </p>
                      <textarea
                        rows={2}
                        placeholder="Ej: Retroexcavadora reventó puesta a tierra — reposición urgente"
                        value={item.justificacion}
                        onChange={e => setItemsImprevisto(prev => {
                          const n = [...prev]; n[idx] = { ...n[idx], justificacion: e.target.value }; return n;
                        })}
                        className={cn(
                          'w-full resize-none rounded-lg border px-2.5 py-1.5 text-[10px] outline-none placeholder:text-muted-foreground/60',
                          item.justificacion.trim()
                            ? 'border-orange-400/40 focus:border-orange-500 bg-background'
                            : 'border-red-400/60 bg-red-500/5 focus:border-red-500'
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-1.5">
                      <Input
                        placeholder="Marca / Modelo ref. (opcional)"
                        value={item.especificacion_marca_modelo}
                        maxLength={200}
                        onChange={e => setItemsImprevisto(prev => {
                          const n = [...prev]; n[idx] = { ...n[idx], especificacion_marca_modelo: e.target.value }; return n;
                        })}
                        className="text-[10px]"
                      />
                      <Textarea
                        rows={2}
                        placeholder="Especificaciones técnicas detalladas (opcional)"
                        value={item.especificacion_detalle}
                        onChange={e => setItemsImprevisto(prev => {
                          const n = [...prev]; n[idx] = { ...n[idx], especificacion_detalle: e.target.value }; return n;
                        })}
                        className="min-h-[50px] text-[10px]"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
              <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 px-4 py-3 text-[10px] text-orange-700">
                ⚠️ Los imprevistos quedan etiquetados para reportes de desviación presupuestal. Procurement los revisará antes de cotizar.
              </div>
            </div>
          )}

          {/* Prioridad y notas comunes */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Prioridad">
              <Select value={reqPrioridad} onChange={e => setReqPrioridad(e.target.value)}>
                <option value="BAJA">Baja</option>
                <option value="MEDIA">Media</option>
                <option value="ALTA">Alta — urgente</option>
              </Select>
            </FormField>
            <div />
          </div>

          <FormField label={reqTipo === 'IMPREVISTO' ? 'Justificación' : 'Notas para Proveedores'}>
            <Textarea className="min-h-[70px]"
              placeholder={reqTipo === 'IMPREVISTO' ? 'Motivo del imprevisto...' : 'Instrucciones, certificaciones, consideraciones para el proveedor...'}
              value={reqNotas}
              onChange={e => setReqNotas(e.target.value)}
            />
            {reqTipo !== 'IMPREVISTO' && (
              <p className="mt-1 text-[9px] text-muted-foreground">
                Se verán en la Solicitud de Cotización y pueden llegar a los proveedores.
              </p>
            )}
          </FormField>

          <FormField label="Notas internas para Compras">
            <Textarea className="min-h-[70px]"
              placeholder="Solo lo ve Compras — no se envía a proveedores..."
              value={reqNotasInternas}
              onChange={e => setReqNotasInternas(e.target.value)}
            />
            <p className="mt-1 text-[9px] text-muted-foreground">
              🔒 Confidencial — nunca se comparte con proveedores.
            </p>
          </FormField>

          <FormField label="Dirección de entrega">
            <Input
              value={reqDireccionEntrega}
              onChange={e => setReqDireccionEntrega(e.target.value)}
              placeholder="Ej. Almacén de obra — Av. Industria 245, Parque Industrial..."
            />
            <p className="mt-1 text-[9px] text-muted-foreground">
              Se incluye en el correo de Solicitud de Cotización que Compras envía a los proveedores.
            </p>
          </FormField>

          <div className="border-t border-border/40 pt-4">
            <SubmitButton
              label={
                (reqTipo !== 'APU' && !reqConceptoId) ? 'Selecciona la partida del catálogo'
                : reqTipo === 'IMPREVISTO' ? 'Enviar Imprevisto a Compras'
                : reqTipo === 'APU' ? 'Generar Requisición APU'
                : insumosSeleccionados.length === 0 ? 'Selecciona al menos un insumo'
                : `Generar Requisición (${insumosSeleccionados.length} ítem${insumosSeleccionados.length !== 1 ? 's' : ''})`
              }
              loading={generandoReq}
              color={reqTipo === 'IMPREVISTO' ? 'amber' : 'indigo'}
              onClick={handleGenerarRequisicion}
            />
          </div>
        </div>
      </SlidePanel>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* MODAL — QR de asistencia                                        */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <Modal open={!!qrModal} onClose={() => { setQrModal(null); setQrTab('qr'); }} title="Asistencia de Cuadrilla">
        {qrModal && (
          <div className="flex flex-col gap-4">
            {/* Tabs QR / Manual */}
            <div className="flex rounded-xl border border-border/40 overflow-hidden">
              {(['qr', 'manual'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setQrTab(tab)}
                  className={cn(
                    'flex-1 py-2 text-[11px] font-black uppercase tracking-widest transition-colors',
                    qrTab === tab
                      ? 'bg-indigo-600 text-white'
                      : 'text-muted-foreground hover:bg-muted/40'
                  )}
                >
                  {tab === 'qr' ? 'Código QR' : 'Registro Manual'}
                </button>
              ))}
            </div>

            {qrTab === 'qr' ? (
              <>
                <div className="flex flex-col items-center gap-4">
                  <div className="rounded-2xl border-2 border-border bg-white p-4 shadow-inner">
                    <QrVisual seed={qrModal.id + fechaFiltro} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-foreground">{qrModal.nombre}</p>
                    <p className="text-xs text-muted-foreground">{fmtDate(fechaFiltro)}</p>
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      Los trabajadores escanean este código al ingresar para registrar su asistencia automáticamente.
                    </p>
                  </div>
                  <div className="flex gap-2 w-full">
                    <Button variant="outline" className="flex-1 text-xs" onClick={() => {
                      notify({ type: 'info', title: 'QR enviado a impresora', message: `${qrModal.nombre} · ${fmtDate(fechaFiltro)}` });
                      setQrModal(null);
                    }}>
                      Imprimir QR
                    </Button>
                    <Button className="flex-1 text-xs" onClick={() => {
                      notify({ type: 'success', title: 'QR compartido', message: `Enlace de asistencia enviado a ${qrModal.nombre}` });
                      setQrModal(null);
                    }}>
                      Compartir enlace
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="text-center pb-1">
                  <p className="text-xs font-bold text-foreground">{qrModal.nombre} — {fmtDate(fechaFiltro)}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Marca la asistencia de cada integrante y guarda</p>
                </div>
                {bulkChecks.length === 0 ? (
                  <p className="py-6 text-center text-xs text-muted-foreground">Esta cuadrilla no tiene miembros asignados.</p>
                ) : (
                  <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-1">
                    {bulkChecks.map((bc, idx) => (
                      <div key={bc.empleado_id} className="rounded-xl border border-border/40 px-3 py-2">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-xs font-black text-indigo-600">
                            {bc.nombre.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-foreground truncate">{bc.nombre}</div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-muted-foreground">{bc.puesto}</span>
                              {bc.modo_asistencia === 'POR_HORAS' && (
                                <span className="rounded-full bg-violet-500/10 px-1.5 py-0.5 text-[9px] font-black text-violet-600">Por horas</span>
                              )}
                            </div>
                          </div>
                          {bc.modo_asistencia !== 'POR_HORAS' && (
                            <>
                              <button
                                onClick={() => setBulkChecks(prev => prev.map((b, i) =>
                                  i === idx ? { ...b, estado: b.estado === 'PRESENTE' ? 'AUSENTE' : 'PRESENTE' } : b
                                ))}
                                className={cn(
                                  'rounded-full px-3 py-1 text-[10px] font-black transition-colors',
                                  bc.estado === 'PRESENTE'
                                    ? 'bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20'
                                    : 'bg-red-500/10 text-red-600 hover:bg-red-500/20'
                                )}
                              >
                                {bc.estado}
                              </button>
                              <input
                                type="number" min="0" max="12" step="0.5"
                                value={bc.horas_extra}
                                onChange={e => setBulkChecks(prev => prev.map((b, i) =>
                                  i === idx ? { ...b, horas_extra: e.target.value } : b
                                ))}
                                className="w-16 rounded-lg border border-border/40 px-2 py-1 text-center text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="HE" title="Horas extra"
                              />
                            </>
                          )}
                        </div>
                        {bc.modo_asistencia === 'POR_HORAS' && (
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            <div className="space-y-0.5">
                              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Entrada</label>
                              <input
                                type="time"
                                value={bc.hora_entrada}
                                onChange={e => setBulkChecks(prev => prev.map((b, i) => i === idx ? { ...b, hora_entrada: e.target.value } : b))}
                                className="w-full rounded-lg border border-border/40 px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-violet-500"
                              />
                            </div>
                            <div className="space-y-0.5">
                              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Salida</label>
                              <input
                                type="time"
                                value={bc.hora_salida}
                                onChange={e => setBulkChecks(prev => prev.map((b, i) => i === idx ? { ...b, hora_salida: e.target.value } : b))}
                                className="w-full rounded-lg border border-border/40 px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-violet-500"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between pt-1 border-t border-border/30">
                  <span className="text-[10px] text-muted-foreground">
                    {bulkChecks.filter(b => b.estado === 'PRESENTE').length}/{bulkChecks.length} presentes
                  </span>
                  <Button
                    className="text-xs bg-indigo-600 hover:bg-indigo-500"
                    onClick={handleGuardarBulk}
                    disabled={guardandoBulk || bulkChecks.length === 0}
                  >
                    {guardandoBulk ? 'Guardando…' : 'Guardar asistencia'}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
