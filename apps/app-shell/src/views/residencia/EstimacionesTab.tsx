import React, { useCallback, useEffect, useState } from 'react';
import api from '../../lib/api';
import { useTenant } from '../../context/TenantContext';
import { useNotification } from '../../context/NotificationContext';
import { DEMO_ESTIMACIONES_RESIDENCIA, DEMO_AVANCES_RESIDENCIA } from '../../lib/demoData';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ConfirmCriticalActionDialog,
  EmptyStatePanel,
  FormField,
  Input,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  cn,
  getProjectColor,
} from '@bocam/ui-core';
import { IconAlertCircle, IconPlus, IconSearch, IconX } from '../../components/Icons';
import { SlidePanel, SubmitButton } from '../../components/SlidePanel';
import { fmt$, fmtDate } from './shared';

type EstimacionEstado =
  | 'BORRADOR'
  | 'EN_REVISION'
  | 'PENDIENTE_CONFIRMACION_FINANZAS'
  | 'APROBADA_TECNICA'
  | 'APROBADA_FINANCIERA'
  | 'ERROR_FINANZAS'
  | 'RECHAZADA'
  | 'FACTURADA';

interface ConceptoSimple {
  id: string;
  clave: string;
  descripcion: string;
  unidad_medida: string;
  precio_unitario?: number;
  cantidad_presupuestada?: number;
}

// Forma real del modelo Estimacion de control-proyectos (no la forma
// fantasía anterior con frente/descripcion/conceptos-como-número/
// autorizador, que no correspondía a ningún endpoint — ver openspec/changes/
// fix-estimaciones-residente-desconectado).
interface Estimacion {
  id_estimacion: string;
  numero_estimacion: number;
  codigo: string;
  periodo_inicio: string;
  periodo_fin: string;
  subtotal: number;
  iva: number;
  total_neto: number;
  estado: EstimacionEstado;
  notas: string | null;
  avances?: Array<{ id_avance: string; concepto_presupuesto: string; importe_periodo: number; porcentaje_avance: number }>;
}

// Forma real del modelo AvanceFisico de control-proyectos.
interface AvanceFisico {
  id_avance: string;
  concepto_id: string | null;
  concepto_presupuesto: string;
  descripcion_concepto: string;
  cantidad_presupuestada: number;
  cantidad_anterior: number;
  cantidad_periodo: number;
  cantidad_acumulada: number;
  unidad: string;
  precio_unitario: number;
  importe_periodo: number;
  importe_acumulado: number;
  porcentaje_avance: number;
  periodo_inicio: string;
  periodo_fin: string;
  estado: 'PENDIENTE' | 'VALIDADO' | 'RECHAZADO';
  estimacion_id: string | null;
  // Estimación bajo la que el residente registró el avance (openspec
  // avances-residencia-por-estimacion); distinta de estimacion_id.
  estimacion_referencia_id?: string | null;
}

interface TotalesEstimaciones {
  contratado: number | null;
  estimado: number;
  cobrado: number;
  restante: number | null;
  parcial: boolean;
}

interface GrupoConcepto {
  key: string;
  clave: string;
  descripcion: string;
  unidad: string;
  precio_unitario: number;
  cantidad_presupuestada: number;
  cantidad_acumulada: number;
  importe_acumulado: number;
  porcentaje: number;
  avances: AvanceFisico[];
}

// Una fila por concepto: los avances RECHAZADO se listan en el detalle pero
// no suman al acumulado (mismo criterio que el backend).
function agruparPorConcepto(avances: AvanceFisico[]): GrupoConcepto[] {
  const grupos = new Map<string, GrupoConcepto>();
  for (const a of avances) {
    const key = a.concepto_id ?? `clave:${a.concepto_presupuesto}`;
    let g = grupos.get(key);
    if (!g) {
      g = {
        key, clave: a.concepto_presupuesto, descripcion: a.descripcion_concepto, unidad: a.unidad,
        precio_unitario: a.precio_unitario, cantidad_presupuestada: a.cantidad_presupuestada,
        cantidad_acumulada: 0, importe_acumulado: 0, porcentaje: 0, avances: [],
      };
      grupos.set(key, g);
    }
    g.avances.push(a);
    if (a.estado !== 'RECHAZADO') {
      g.cantidad_acumulada += a.cantidad_periodo;
      g.importe_acumulado += a.importe_periodo;
    }
  }
  return Array.from(grupos.values()).map(g => ({
    ...g,
    porcentaje: g.cantidad_presupuestada > 0 ? Math.min((g.cantidad_acumulada / g.cantidad_presupuestada) * 100, 100) : 0,
  }));
}

const EST_BADGE: Record<EstimacionEstado, { cls: string; label: string }> = {
  BORRADOR:                          { cls: 'bg-zinc-500/10 text-zinc-500',       label: 'Borrador'            },
  EN_REVISION:                       { cls: 'bg-amber-500/10 text-amber-600',     label: 'En revisión'         },
  PENDIENTE_CONFIRMACION_FINANZAS:   { cls: 'bg-amber-500/10 text-amber-600',     label: 'Pend. Finanzas'      },
  APROBADA_TECNICA:                  { cls: 'bg-indigo-500/10 text-indigo-600',   label: 'Aprobada Técnica'    },
  APROBADA_FINANCIERA:               { cls: 'bg-emerald-500/10 text-emerald-600', label: 'Aprobada Financiera' },
  ERROR_FINANZAS:                    { cls: 'bg-red-500/10 text-red-600',         label: 'Error Finanzas'      },
  RECHAZADA:                         { cls: 'bg-red-500/10 text-red-600',         label: 'Rechazada'           },
  FACTURADA:                         { cls: 'bg-sky-500/10 text-sky-600',         label: 'Facturada'           },
};

const AVANCE_BADGE: Record<AvanceFisico['estado'], { cls: string; label: string }> = {
  PENDIENTE: { cls: 'bg-amber-500/10 text-amber-600',     label: 'Pendiente' },
  VALIDADO:  { cls: 'bg-emerald-500/10 text-emerald-600', label: 'Validado'  },
  RECHAZADO: { cls: 'bg-red-500/10 text-red-600',         label: 'Rechazado' },
};

/**
 * Tab "Estimaciones" de Residencia de Obra — avances físicos y estimaciones
 * de obra — ver openspec/changes/split-residencia-view-tabs.
 *
 * `conceptos` (catálogo de partidas del presupuesto) es una copia local
 * propia de este tab — RequisicionesTab tiene la suya, independiente. Ambas
 * se re-fetchean por completo cada vez que su tab se activa, igual que en el
 * componente original (ver design.md Decisión 3, hallazgo sobre `conceptos`).
 */
export const EstimacionesTab: React.FC<{ active: boolean }> = ({ active }) => {
  const { tenant, user, currentProjectId } = useTenant();
  const { notify } = useNotification();
  const isDemo = tenant?.id === 'iretum-demo';
  const currentProjectName = user?.projects?.find(p => p.id === currentProjectId)?.name || 'proyecto activo';
  const currentProjectColor = getProjectColor(currentProjectId);

  const [estimaciones, setEstimaciones] = useState<Estimacion[]>([]);
  const [avances, setAvances] = useState<AvanceFisico[]>([]);
  const [loadingEstimaciones, setLoadingEstimaciones] = useState(false);
  const [errorEstimaciones, setErrorEstimaciones] = useState(false);
  const [showAvanceForm, setShowAvanceForm] = useState(false);
  const [avanceConceptoId, setAvanceConceptoId] = useState<string | null>(null);
  const [avanceConceptoSearch, setAvanceConceptoSearch] = useState('');
  const [avanceCantidadPeriodo, setAvanceCantidadPeriodo] = useState('');
  const [avancePeriodoInicio, setAvancePeriodoInicio] = useState('');
  const [avancePeriodoFin, setAvancePeriodoFin] = useState('');
  const [confirmRegistrarAvance, setConfirmRegistrarAvance] = useState(false);
  const [confirmCrearEstimacion, setConfirmCrearEstimacion] = useState(false);
  const [registrandoAvance, setRegistrandoAvance] = useState(false);
  const [avanceFormError, setAvanceFormError] = useState<string | null>(null);
  const [selectedAvanceIds, setSelectedAvanceIds] = useState<Set<string>>(new Set());
  const [creandoEstimacion, setCreandoEstimacion] = useState(false);
  const [conceptos, setConceptos] = useState<ConceptoSimple[]>([]);
  const [totales, setTotales] = useState<TotalesEstimaciones | null>(null);
  const [gruposExpandidos, setGruposExpandidos] = useState<Set<string>>(new Set());
  const [showLoteForm, setShowLoteForm] = useState(false);
  const [loteEstimacionId, setLoteEstimacionId] = useState('');
  const [loteCantidades, setLoteCantidades] = useState<Record<string, string>>({});
  const [confirmLote, setConfirmLote] = useState(false);
  const [registrandoLote, setRegistrandoLote] = useState(false);
  const [loteError, setLoteError] = useState<string | null>(null);

  useEffect(() => {
    if (isDemo) {
      setEstimaciones(DEMO_ESTIMACIONES_RESIDENCIA as Estimacion[]);
      setAvances(DEMO_AVANCES_RESIDENCIA as AvanceFisico[]);
      const demoEst = DEMO_ESTIMACIONES_RESIDENCIA as Estimacion[];
      setTotales({
        contratado: null,
        estimado: demoEst.filter(e => e.estado !== 'RECHAZADA').reduce((s, e) => s + e.subtotal, 0),
        cobrado: demoEst.filter(e => e.estado === 'FACTURADA').reduce((s, e) => s + e.subtotal, 0),
        restante: null,
        parcial: true,
      });
    }
  }, [isDemo]);

  // ── Carga de estimaciones + avances + catálogo de conceptos cuando se
  // activa el tab ──────────────────────────────────────────────────────────
  const fetchEstimacionesTab = useCallback(async () => {
    setLoadingEstimaciones(true);
    setErrorEstimaciones(false);
    try {
      const [estRes, avRes, presRes, totRes] = await Promise.allSettled([
        api.get('/api/v1/control-proyectos/estimaciones'),
        api.get('/api/v1/control-proyectos/avances'),
        api.get('/api/v1/gerencia-tecnica/presupuesto/activo'),
        api.get('/api/v1/control-proyectos/estimaciones/totales'),
      ]);
      if (totRes.status === 'fulfilled') {
        const t = (totRes.value.data as any)?.data;
        if (t && typeof t === 'object' && 'estimado' in t) setTotales(t as TotalesEstimaciones);
      }
      if (estRes.status === 'fulfilled') {
        setEstimaciones((estRes.value.data as any)?.data ?? []);
      }
      if (avRes.status === 'fulfilled') {
        setAvances((avRes.value.data as any)?.data ?? []);
      }
      if (estRes.status === 'rejected' && avRes.status === 'rejected') {
        setErrorEstimaciones(true);
      }
      if (presRes.status === 'fulfilled') {
        const conceptosRaw: any[] = (presRes.value.data as any)?.data?.conceptos ?? [];
        setConceptos(conceptosRaw.map((c: any) => ({
          id: c.id,
          clave: c.clave,
          descripcion: c.descripcion,
          unidad_medida: c.unidad_medida,
          precio_unitario: c.precio_unitario != null ? Number(c.precio_unitario) : undefined,
          cantidad_presupuestada: c.cantidad != null ? Number(c.cantidad) : undefined,
        })));
      }
    } finally {
      setLoadingEstimaciones(false);
    }
  }, []);

  useEffect(() => {
    if (!active || isDemo) return;
    void fetchEstimacionesTab();
  }, [active, isDemo, fetchEstimacionesTab]);

  const kpiEstimaciones = {
    total: estimaciones.length,
    autorizado: estimaciones.filter(e => e.estado === 'APROBADA_FINANCIERA' || e.estado === 'FACTURADA').reduce((s, e) => s + e.total_neto, 0),
    enRevision: estimaciones.filter(e => e.estado === 'EN_REVISION' || e.estado === 'PENDIENTE_CONFIRMACION_FINANZAS').length,
    pagado: estimaciones.filter(e => e.estado === 'FACTURADA').reduce((s, e) => s + e.total_neto, 0),
  };

  // ── Acciones ──────────────────────────────────────────────────────────────
  const resetAvanceForm = () => {
    setShowAvanceForm(false);
    setAvanceConceptoId(null);
    setAvanceConceptoSearch('');
    setAvanceCantidadPeriodo('');
    setAvancePeriodoInicio('');
    setAvancePeriodoFin('');
    setAvanceFormError(null);
  };

  const handleRegistrarAvance = () => {
    const concepto = conceptos.find(c => c.id === avanceConceptoId);
    if (!concepto || !avanceCantidadPeriodo) return;
    setConfirmRegistrarAvance(true);
  };

  const registrarAvance = async () => {
    setConfirmRegistrarAvance(false);
    const concepto = conceptos.find(c => c.id === avanceConceptoId);
    if (!concepto || !avanceCantidadPeriodo) return;
    const cantPeriodo = parseFloat(avanceCantidadPeriodo) || 0;

    if (isDemo) {
      const cantAnterior = avances
        .filter(a => a.concepto_id === concepto.id && a.estado !== 'RECHAZADO')
        .reduce((s, a) => s + a.cantidad_periodo, 0);
      const cantAcumulada = cantAnterior + cantPeriodo;
      const pu = concepto.precio_unitario ?? 0;
      const cantPresupuestada = concepto.cantidad_presupuestada ?? cantAcumulada;
      const nuevo: AvanceFisico = {
        id_avance: `av-demo-${Date.now()}`,
        concepto_id: concepto.id,
        concepto_presupuesto: concepto.clave,
        descripcion_concepto: concepto.descripcion,
        cantidad_presupuestada: cantPresupuestada,
        cantidad_anterior: cantAnterior,
        cantidad_periodo: cantPeriodo,
        cantidad_acumulada: cantAcumulada,
        unidad: concepto.unidad_medida,
        precio_unitario: pu,
        importe_periodo: cantPeriodo * pu,
        importe_acumulado: cantAcumulada * pu,
        porcentaje_avance: cantPresupuestada > 0 ? (cantAcumulada / cantPresupuestada) * 100 : 0,
        periodo_inicio: avancePeriodoInicio || new Date().toISOString().slice(0, 10),
        periodo_fin: avancePeriodoFin || new Date().toISOString().slice(0, 10),
        estado: 'PENDIENTE',
        estimacion_id: null,
      };
      setAvances(prev => [...prev, nuevo]);
      notify({ type: 'success', title: 'Avance registrado', message: `${concepto.clave} · ${cantPeriodo} ${concepto.unidad_medida}` });
      resetAvanceForm();
      return;
    }

    setRegistrandoAvance(true);
    setAvanceFormError(null);
    try {
      const res = await api.post('/api/v1/control-proyectos/avances', {
        concepto_id: concepto.id,
        cantidad_periodo: cantPeriodo,
        periodo_inicio: avancePeriodoInicio || undefined,
        periodo_fin: avancePeriodoFin || undefined,
      });
      const nuevo = (res.data as any)?.data as AvanceFisico;
      setAvances(prev => [...prev, nuevo]);
      notify({ type: 'success', title: 'Avance registrado', message: `${nuevo.concepto_presupuesto} · ${nuevo.cantidad_periodo} ${nuevo.unidad}` });
      resetAvanceForm();
    } catch (err: any) {
      setAvanceFormError(err?.response?.data?.error?.message || 'No se pudo registrar el avance. Intenta de nuevo.');
    } finally {
      setRegistrandoAvance(false);
    }
  };

  const toggleAvanceSeleccionado = (id: string) => {
    setSelectedAvanceIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleCrearEstimacion = () => {
    if (selectedAvanceIds.size === 0) return;
    setConfirmCrearEstimacion(true);
  };

  const crearEstimacion = async () => {
    setConfirmCrearEstimacion(false);
    if (selectedAvanceIds.size === 0) return;
    const avanceIds = Array.from(selectedAvanceIds);

    if (isDemo) {
      const incluidos = avances.filter(a => avanceIds.includes(a.id_avance));
      const subtotal = incluidos.reduce((s, a) => s + a.importe_periodo, 0);
      const retencion = subtotal * 0.05;
      const iva = (subtotal - retencion) * 0.16;
      const n = estimaciones.length + 1;
      const nueva: Estimacion = {
        id_estimacion: `est-demo-${Date.now()}`,
        numero_estimacion: n,
        codigo: `EST-DEMO-${String(n).padStart(3, '0')}`,
        periodo_inicio: incluidos[0]?.periodo_inicio ?? new Date().toISOString().slice(0, 10),
        periodo_fin: incluidos[0]?.periodo_fin ?? new Date().toISOString().slice(0, 10),
        subtotal, iva, total_neto: subtotal - retencion + iva,
        estado: 'BORRADOR',
        notas: null,
      };
      setEstimaciones(prev => [...prev, nueva]);
      setAvances(prev => prev.map(a => avanceIds.includes(a.id_avance) ? { ...a, estimacion_id: nueva.id_estimacion } : a));
      setSelectedAvanceIds(new Set());
      notify({ type: 'success', title: 'Estimación creada', message: nueva.codigo });
      return;
    }

    setCreandoEstimacion(true);
    try {
      const res = await api.post('/api/v1/control-proyectos/estimaciones', { avance_ids: avanceIds });
      const nueva = (res.data as any)?.data as Estimacion;
      setEstimaciones(prev => [...prev, nueva]);
      setAvances(prev => prev.map(a => avanceIds.includes(a.id_avance) ? { ...a, estimacion_id: nueva.id_estimacion } : a));
      setSelectedAvanceIds(new Set());
      notify({ type: 'success', title: 'Estimación creada', message: nueva.codigo });
    } catch (err: any) {
      notify({ type: 'error', title: 'No se pudo crear la estimación', message: err?.response?.data?.error?.message || 'Intenta de nuevo.' });
    } finally {
      setCreandoEstimacion(false);
    }
  };

  const avancesValidadosDisponibles = avances.filter(a => a.estado === 'VALIDADO' && !a.estimacion_id);
  const grupos = agruparPorConcepto(avances);

  const toggleGrupo = (key: string) => {
    setGruposExpandidos(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  // ── Registro de avances por estimación (lote) ─────────────────────────────
  // Conceptos de la estimación elegida, con la cantidad estimada (suma de los
  // avances incluidos en ella) como valor prellenado y editable.
  const conceptosDeEstimacion = (estimacionId: string) => {
    const porConcepto = new Map<string, { concepto_id: string; clave: string; descripcion: string; unidad: string; cantidad: number }>();
    for (const a of avances) {
      if (a.estimacion_id !== estimacionId || !a.concepto_id) continue;
      const prev = porConcepto.get(a.concepto_id);
      if (prev) prev.cantidad += a.cantidad_periodo;
      else porConcepto.set(a.concepto_id, { concepto_id: a.concepto_id, clave: a.concepto_presupuesto, descripcion: a.descripcion_concepto, unidad: a.unidad, cantidad: a.cantidad_periodo });
    }
    return Array.from(porConcepto.values());
  };

  const resetLoteForm = () => {
    setShowLoteForm(false);
    setLoteEstimacionId('');
    setLoteCantidades({});
    setLoteError(null);
  };

  const seleccionarEstimacionLote = (id: string) => {
    setLoteEstimacionId(id);
    setLoteError(null);
    const prefill: Record<string, string> = {};
    for (const c of conceptosDeEstimacion(id)) prefill[c.concepto_id] = String(c.cantidad);
    setLoteCantidades(prefill);
  };

  const loteItems = Object.entries(loteCantidades)
    .map(([concepto_id, v]) => ({ concepto_id, cantidad_periodo: parseFloat(v) }))
    .filter(i => Number.isFinite(i.cantidad_periodo) && i.cantidad_periodo > 0);

  const registrarLote = async () => {
    setConfirmLote(false);
    if (!loteEstimacionId || loteItems.length === 0) return;

    if (isDemo) {
      const est = estimaciones.find(e => e.id_estimacion === loteEstimacionId);
      const nuevos: AvanceFisico[] = loteItems.map((it, i) => {
        const c = conceptosDeEstimacion(loteEstimacionId).find(x => x.concepto_id === it.concepto_id);
        const base = avances.find(a => a.concepto_id === it.concepto_id);
        const pu = base?.precio_unitario ?? 0;
        const presup = base?.cantidad_presupuestada ?? it.cantidad_periodo;
        const anterior = avances.filter(a => a.concepto_id === it.concepto_id && a.estado !== 'RECHAZADO').reduce((s, a) => s + a.cantidad_periodo, 0);
        return {
          id_avance: `av-demo-lote-${Date.now()}-${i}`, concepto_id: it.concepto_id,
          concepto_presupuesto: c?.clave ?? '', descripcion_concepto: c?.descripcion ?? '',
          cantidad_presupuestada: presup, cantidad_anterior: anterior, cantidad_periodo: it.cantidad_periodo,
          cantidad_acumulada: anterior + it.cantidad_periodo, unidad: c?.unidad ?? '', precio_unitario: pu,
          importe_periodo: it.cantidad_periodo * pu, importe_acumulado: (anterior + it.cantidad_periodo) * pu,
          porcentaje_avance: presup > 0 ? Math.min(((anterior + it.cantidad_periodo) / presup) * 100, 100) : 0,
          periodo_inicio: est?.periodo_inicio ?? new Date().toISOString().slice(0, 10),
          periodo_fin: est?.periodo_fin ?? new Date().toISOString().slice(0, 10),
          estado: 'PENDIENTE', estimacion_id: null, estimacion_referencia_id: loteEstimacionId,
        };
      });
      setAvances(prev => [...prev, ...nuevos]);
      notify({ type: 'success', title: 'Avances registrados', message: `${nuevos.length} concepto(s)` });
      resetLoteForm();
      return;
    }

    setRegistrandoLote(true);
    setLoteError(null);
    try {
      const res = await api.post('/api/v1/control-proyectos/avances/lote', {
        estimacion_referencia_id: loteEstimacionId,
        items: loteItems,
      });
      const nuevos = ((res.data as any)?.data ?? []) as AvanceFisico[];
      setAvances(prev => [...prev, ...nuevos]);
      notify({ type: 'success', title: 'Avances registrados', message: `${nuevos.length} concepto(s)` });
      resetLoteForm();
    } catch (err: any) {
      setLoteError(err?.response?.data?.error?.message || 'No se pudieron registrar los avances. Intenta de nuevo.');
    } finally {
      setRegistrandoLote(false);
    }
  };

  const totalCards: Array<{ id: string; label: string; value: number | null; cls: string }> = [
    { id: 'contratado', label: 'Contratado',           value: totales?.contratado ?? null, cls: 'text-foreground'  },
    { id: 'estimado',   label: 'Estimado',             value: totales?.estimado ?? null,   cls: 'text-indigo-600'  },
    { id: 'cobrado',    label: 'Cobrado',              value: totales?.cobrado ?? null,    cls: 'text-emerald-600' },
    { id: 'restante',   label: 'Restante por Cobrar',  value: totales?.restante ?? null,   cls: 'text-amber-600'   },
  ];

  return (
    <>
      {active && (
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

      {active && (
        <div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {totalCards.map(k => (
              <Card key={k.id}>
                <CardContent className="pt-4 pb-3 px-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{k.label}</p>
                  <p data-testid={`total-${k.id}`} className={cn('mt-1 text-xl font-black', k.cls)}>
                    {k.value === null ? '—' : fmt$(k.value)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          {totales?.parcial && (
            <p className="mt-1 text-[10px] text-muted-foreground">
              Dato parcial: no se pudo consultar el monto contratado del catálogo.
            </p>
          )}
        </div>
      )}

      {active && errorEstimaciones && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <IconAlertCircle className="h-8 w-8 text-red-500" />
            <p className="text-sm font-bold text-foreground">No se pudo cargar la información de estimaciones y avances</p>
            <p className="text-xs text-muted-foreground">Revisa tu conexión e intenta de nuevo.</p>
            <Button size="sm" onClick={() => void fetchEstimacionesTab()}>Reintentar</Button>
          </CardContent>
        </Card>
      )}

      {active && !errorEstimaciones && (
        <div className="space-y-4">
          {/* ── Avances Físicos ─────────────────────────────────────────── */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-xs font-bold uppercase tracking-widest">
                Avances Físicos
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setShowLoteForm(true)}>
                  Registrar por Estimación
                </Button>
                <Button size="sm" onClick={() => setShowAvanceForm(true)}>
                  <IconPlus className="mr-1.5 h-3.5 w-3.5" />
                  Registrar Avance
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <TableContainer>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead />
                      <TableHead>Concepto</TableHead>
                      <TableHead className="text-right">Acumulado</TableHead>
                      <TableHead className="text-right">Avance</TableHead>
                      <TableHead className="text-right">Importe Acumulado</TableHead>
                      <TableHead className="text-right">Precio Unitario</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grupos.map(g => {
                      const expandido = gruposExpandidos.has(g.key);
                      return (
                        <React.Fragment key={g.key}>
                          <TableRow>
                            <TableCell>
                              <button
                                type="button"
                                aria-label={`Ver detalle ${g.descripcion}`}
                                aria-expanded={expandido}
                                onClick={() => toggleGrupo(g.key)}
                                className="text-xs text-muted-foreground hover:text-foreground"
                              >
                                {expandido ? '▾' : '▸'}
                              </button>
                            </TableCell>
                            <TableCell>
                              <p className="font-mono text-[10px] text-indigo-600">{g.clave}</p>
                              <p className="text-xs font-medium">{g.descripcion}</p>
                            </TableCell>
                            <TableCell className="text-right text-xs tabular-nums">
                              {g.cantidad_acumulada} / {g.cantidad_presupuestada} {g.unidad}
                            </TableCell>
                            <TableCell className="text-right text-xs font-semibold tabular-nums">{g.porcentaje.toFixed(1)}%</TableCell>
                            <TableCell className="text-right text-xs tabular-nums">{fmt$(g.importe_acumulado)}</TableCell>
                            <TableCell className="text-right text-xs tabular-nums">{fmt$(g.precio_unitario)}</TableCell>
                          </TableRow>
                          {expandido && g.avances.map(a => {
                            const badge = AVANCE_BADGE[a.estado];
                            const seleccionable = a.estado === 'VALIDADO' && !a.estimacion_id;
                            const refCodigo = estimaciones.find(e => e.id_estimacion === a.estimacion_referencia_id)?.codigo;
                            return (
                              <TableRow key={a.id_avance} className="bg-muted/30">
                                <TableCell>
                                  {seleccionable && (
                                    <input
                                      type="checkbox"
                                      aria-label={`${a.concepto_presupuesto} — ${a.id_avance}`}
                                      checked={selectedAvanceIds.has(a.id_avance)}
                                      onChange={() => toggleAvanceSeleccionado(a.id_avance)}
                                    />
                                  )}
                                </TableCell>
                                <TableCell className="text-[11px] text-muted-foreground whitespace-nowrap">
                                  {fmtDate(a.periodo_inicio)} al {fmtDate(a.periodo_fin)}
                                  {refCodigo && <span className="ml-2 font-mono text-[10px]">· {refCodigo}</span>}
                                </TableCell>
                                <TableCell className="text-right text-xs tabular-nums">{a.cantidad_periodo} {a.unidad}</TableCell>
                                <TableCell>
                                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', badge.cls)}>
                                    {badge.label}
                                  </span>
                                </TableCell>
                                <TableCell className="text-right text-xs tabular-nums">{fmt$(a.importe_periodo)}</TableCell>
                                <TableCell />
                              </TableRow>
                            );
                          })}
                        </React.Fragment>
                      );
                    })}
                    {avances.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <EmptyStatePanel title={loadingEstimaciones ? 'Cargando avances…' : 'Sin avances registrados'} />
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <div className="flex items-center justify-between border-t border-border/30 px-4 py-3">
                {avancesValidadosDisponibles.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground">
                    Aún no tienes avances validados para incluir en una estimación.
                  </p>
                ) : (
                  <p className="text-[11px] text-muted-foreground">
                    {selectedAvanceIds.size} avance{selectedAvanceIds.size !== 1 ? 's' : ''} seleccionado{selectedAvanceIds.size !== 1 ? 's' : ''}
                  </p>
                )}
                <Button
                  size="sm"
                  disabled={selectedAvanceIds.size === 0 || creandoEstimacion}
                  onClick={() => void handleCrearEstimacion()}
                >
                  Crear Estimación{selectedAvanceIds.size > 0 ? ` (${selectedAvanceIds.size})` : ''}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ── Estimaciones ─────────────────────────────────────────────── */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold uppercase tracking-widest">
                Estimaciones de Obra
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <TableContainer>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Periodo</TableHead>
                      <TableHead className="text-right">Avances</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                      <TableHead className="text-right">Total c/IVA</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {estimaciones.map(est => {
                      const badge = EST_BADGE[est.estado];
                      return (
                        <TableRow key={est.id_estimacion}>
                          <TableCell className="font-mono text-xs font-semibold">{est.codigo}</TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {fmtDate(est.periodo_inicio)}<br />
                            <span className="text-[10px]">al {fmtDate(est.periodo_fin)}</span>
                          </TableCell>
                          <TableCell className="text-right text-xs">{est.avances?.length ?? 0}</TableCell>
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
                        </TableRow>
                      );
                    })}
                    {estimaciones.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <EmptyStatePanel title={loadingEstimaciones ? 'Cargando estimaciones…' : 'Sin estimaciones registradas'} />
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

      <SlidePanel
        isOpen={showAvanceForm}
        onClose={resetAvanceForm}
        title="Registrar Avance"
        subtitle={`Proyecto: ${currentProjectName}`}
        accentColor="indigo"
      >
        <div className="flex flex-col gap-4">
          {(() => {
            const conceptoAvance = conceptos.find(c => c.id === avanceConceptoId) ?? null;
            const filtrados = avanceConceptoSearch.trim()
              ? conceptos.filter(c => `${c.clave} ${c.descripcion}`.toLowerCase().includes(avanceConceptoSearch.toLowerCase()))
              : conceptos;
            return (
              <div className="space-y-1.5">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Concepto del catálogo <span className="text-red-500">*</span>
                </p>
                {conceptoAvance ? (
                  <div className="flex items-center justify-between rounded-xl border border-indigo-500/40 bg-indigo-500/5 px-3 py-2">
                    <div>
                      <p className="text-[10px] font-mono text-indigo-600 uppercase tracking-wider">{conceptoAvance.clave}</p>
                      <p className="text-xs font-bold text-foreground/80">{conceptoAvance.descripcion}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Precio unitario: {conceptoAvance.precio_unitario != null ? fmt$(conceptoAvance.precio_unitario) : '—'} · Presupuestado: {conceptoAvance.cantidad_presupuestada ?? '—'} {conceptoAvance.unidad_medida}
                      </p>
                    </div>
                    <button type="button" onClick={() => setAvanceConceptoId(null)}
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
                        placeholder="Buscar concepto por clave o descripción..."
                        value={avanceConceptoSearch}
                        onChange={e => setAvanceConceptoSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-background border border-border/60 rounded-lg focus:border-indigo-400 outline-none"
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-0.5">
                      {filtrados.length === 0 ? (
                        <p className="text-[10px] text-muted-foreground py-2 text-center">
                          {conceptos.length === 0 ? 'Sin catálogo de obra — importa en Gerencia Técnica' : 'Sin coincidencias'}
                        </p>
                      ) : filtrados.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => { setAvanceConceptoId(c.id); setAvanceConceptoSearch(''); }}
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

          <div className="space-y-1.5">
            <label htmlFor="avance-cantidad-periodo" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Cantidad del periodo <span className="text-red-500">*</span>
            </label>
            <Input
              id="avance-cantidad-periodo"
              type="number"
              step="0.01"
              min="0"
              value={avanceCantidadPeriodo}
              onChange={e => setAvanceCantidadPeriodo(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Periodo inicio">
              <Input
                type="date"
                value={avancePeriodoInicio}
                onChange={e => setAvancePeriodoInicio(e.target.value)}
              />
            </FormField>
            <FormField label="Periodo fin">
              <Input
                type="date"
                value={avancePeriodoFin}
                onChange={e => setAvancePeriodoFin(e.target.value)}
              />
            </FormField>
          </div>

          {avanceFormError && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-[11px] font-medium text-red-600">{avanceFormError}</p>
          )}

          <SubmitButton
            label="Guardar Avance"
            color="indigo"
            loading={registrandoAvance}
            onClick={() => void handleRegistrarAvance()}
          />
        </div>
      </SlidePanel>

      <SlidePanel
        isOpen={showLoteForm}
        onClose={resetLoteForm}
        title="Registrar Avances por Estimación"
        subtitle={`Proyecto: ${currentProjectName}`}
        accentColor="indigo"
      >
        <div className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <label htmlFor="lote-estimacion" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Estimación de referencia <span className="text-red-500">*</span>
            </label>
            <select
              id="lote-estimacion"
              value={loteEstimacionId}
              onChange={e => seleccionarEstimacionLote(e.target.value)}
              className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-xs outline-none focus:border-indigo-400"
            >
              <option value="">Selecciona una estimación…</option>
              {estimaciones.map(e => (
                <option key={e.id_estimacion} value={e.id_estimacion}>
                  {e.codigo} · {fmtDate(e.periodo_inicio)} al {fmtDate(e.periodo_fin)}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-muted-foreground">El periodo del avance es el de la estimación elegida.</p>
          </div>

          {loteEstimacionId && (() => {
            const conceptosEst = conceptosDeEstimacion(loteEstimacionId);
            if (conceptosEst.length === 0) {
              return (
                <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-[11px] font-medium text-amber-600">
                  Esta estimación aún no tiene conceptos. Agrega avances a la estimación para poder registrar por concepto.
                </p>
              );
            }
            return (
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Cantidad por concepto (prellenada con lo estimado)
                </p>
                {conceptosEst.map(c => (
                  <div key={c.concepto_id} className="flex items-center gap-3 rounded-lg border border-border/30 px-3 py-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-[10px] text-indigo-600">{c.clave}</p>
                      <p className="truncate text-xs text-foreground/80">{c.descripcion}</p>
                    </div>
                    <Input
                      aria-label={`Cantidad ${c.clave}`}
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-28"
                      value={loteCantidades[c.concepto_id] ?? ''}
                      onChange={e => setLoteCantidades(prev => ({ ...prev, [c.concepto_id]: e.target.value }))}
                    />
                    <span className="w-8 text-[10px] text-muted-foreground">{c.unidad}</span>
                  </div>
                ))}
              </div>
            );
          })()}

          {loteError && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-[11px] font-medium text-red-600">{loteError}</p>
          )}

          <SubmitButton
            label="Guardar Avances"
            color="indigo"
            loading={registrandoLote}
            onClick={() => { if (loteEstimacionId && loteItems.length > 0) setConfirmLote(true); }}
          />
        </div>
      </SlidePanel>

      <ConfirmCriticalActionDialog
        open={confirmLote}
        dismissible={false}
        title="¿Registrar estos avances físicos?"
        projectName={currentProjectName}
        projectColorDot={currentProjectColor.dot}
        confirmDisabled={registrandoLote}
        onConfirm={() => void registrarLote()}
        onCancel={() => setConfirmLote(false)}
      />

      <ConfirmCriticalActionDialog
        open={confirmRegistrarAvance}
        dismissible={false}
        title="¿Registrar este avance físico?"
        projectName={currentProjectName}
        projectColorDot={currentProjectColor.dot}
        confirmDisabled={registrandoAvance}
        onConfirm={() => void registrarAvance()}
        onCancel={() => setConfirmRegistrarAvance(false)}
      />

      <ConfirmCriticalActionDialog
        open={confirmCrearEstimacion}
        dismissible={false}
        title="¿Crear esta estimación?"
        projectName={currentProjectName}
        projectColorDot={currentProjectColor.dot}
        confirmDisabled={creandoEstimacion}
        onConfirm={() => void crearEstimacion()}
        onCancel={() => setConfirmCrearEstimacion(false)}
      />
    </>
  );
};
