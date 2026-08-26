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

  useEffect(() => {
    if (isDemo) {
      setEstimaciones(DEMO_ESTIMACIONES_RESIDENCIA as Estimacion[]);
      setAvances(DEMO_AVANCES_RESIDENCIA as AvanceFisico[]);
    }
  }, [isDemo]);

  // ── Carga de estimaciones + avances + catálogo de conceptos cuando se
  // activa el tab ──────────────────────────────────────────────────────────
  const fetchEstimacionesTab = useCallback(async () => {
    setLoadingEstimaciones(true);
    setErrorEstimaciones(false);
    try {
      const [estRes, avRes, presRes] = await Promise.allSettled([
        api.get('/api/v1/control-proyectos/estimaciones'),
        api.get('/api/v1/control-proyectos/avances'),
        api.get('/api/v1/gerencia-tecnica/presupuesto/activo'),
      ]);
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
              <Button size="sm" onClick={() => setShowAvanceForm(true)}>
                <IconPlus className="mr-1.5 h-3.5 w-3.5" />
                Registrar Avance
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <TableContainer>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead />
                      <TableHead>Concepto</TableHead>
                      <TableHead className="text-right">Periodo</TableHead>
                      <TableHead className="text-right">Acumulado</TableHead>
                      <TableHead className="text-right">Precio Unitario</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {avances.map(a => {
                      const badge = AVANCE_BADGE[a.estado];
                      const seleccionable = a.estado === 'VALIDADO' && !a.estimacion_id;
                      return (
                        <TableRow key={a.id_avance}>
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
                          <TableCell>
                            <p className="font-mono text-[10px] text-indigo-600">{a.concepto_presupuesto}</p>
                            <p className="text-xs font-medium">{a.descripcion_concepto}</p>
                          </TableCell>
                          <TableCell className="text-right text-xs tabular-nums">
                            {a.cantidad_periodo} {a.unidad}
                          </TableCell>
                          <TableCell className="text-right text-xs tabular-nums">
                            {a.cantidad_acumulada} / {a.cantidad_presupuestada} {a.unidad}
                          </TableCell>
                          <TableCell className="text-right text-xs tabular-nums">{fmt$(a.precio_unitario)}</TableCell>
                          <TableCell>
                            <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', badge.cls)}>
                              {badge.label}
                            </span>
                          </TableCell>
                        </TableRow>
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
