import React, { useEffect, useState } from 'react';
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
  IconCheckCircle2,
  IconClipboardCheck,
  IconQrCode,
  IconUserCheck,
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
type TabId = 'estimaciones' | 'nomina' | 'asistencia';

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
  fecha: string;
  cuadrilla_id: string;
  cuadrilla_nombre: string;
  empleado_nombre: string;
  puesto: string;
  hora_entrada: string | null;
  hora_salida: string | null;
  estado: AsistenciaEstado;
  tipo_registro: 'QR' | 'MANUAL' | null;
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

export const ResidenciaView: React.FC = () => {
  const { tenant } = useTenant();
  const { notify } = useNotification();
  const isDemo = tenant?.id === 'iretum-demo';

  const [activeTab, setActiveTab] = useState<TabId>('estimaciones');
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
  const [fechaFiltro, setFechaFiltro] = useState('2024-05-21');
  const [cuadrillaFiltro, setCuadrillaFiltro] = useState('all');
  const [qrModal, setQrModal] = useState<{ id: string; nombre: string } | null>(null);

  // ── Carga inicial ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (isDemo) {
      setEstimaciones(DEMO_ESTIMACIONES_RESIDENCIA as Estimacion[]);
      setPrenominas(DEMO_PRENOMINAS_RESIDENCIA as Prenomina[]);
      setAsistencia(DEMO_ASISTENCIA as RegistroAsistencia[]);
      setLoading(false);
      return;
    }
    // TODO: fetch real
    setLoading(false);
  }, [isDemo]);

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

  const handleRegistrarManual = (registro: RegistroAsistencia) => {
    const nuevoEstado: AsistenciaEstado = registro.estado === 'AUSENTE' ? 'PRESENTE' : 'AUSENTE';
    setAsistencia(prev => prev.map(a =>
      a.id === registro.id
        ? { ...a, estado: nuevoEstado, hora_entrada: nuevoEstado === 'PRESENTE' ? new Date().toTimeString().slice(0, 5) : null, tipo_registro: 'MANUAL' }
        : a
    ));
    if (nuevoEstado === 'PRESENTE') {
      notify({ type: 'success', title: 'Asistencia registrada', message: `${registro.empleado_nombre} — registro manual` });
    }
  };

  // ── Tabs ──────────────────────────────────────────────────────────────────
  const TABS: { id: TabId; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'estimaciones', label: 'Estimaciones', icon: IconClipboardCheck },
    { id: 'nomina',       label: 'Nómina',        icon: IconUserCheck      },
    { id: 'asistencia',  label: 'Asistencia QR',  icon: IconQrCode         },
  ];

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
          <SectionBadge className="bg-indigo-500/10 text-indigo-600">DEMO</SectionBadge>
        </div>
        <p className="text-xs text-muted-foreground">Estimaciones · Aprobación de nómina · Control de asistencia QR</p>
      </div>

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

      {/* ── Tab bar ────────────────────────────────────────────────────── */}
      <div className="flex gap-1 rounded-xl border border-border bg-muted/30 p-1 w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-semibold transition-all',
              activeTab === id
                ? 'bg-card shadow text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

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
                  {DEMO_CUADRILLAS.map(c => (
                    <option key={c.id_cuadrilla} value={c.id_cuadrilla}>{c.nombre}</option>
                  ))}
                </Select>
              </FormField>
              <div className="flex gap-2">
                {DEMO_CUADRILLAS.filter(c => cuadrillaFiltro === 'all' || c.id_cuadrilla === cuadrillaFiltro).map(c => (
                  <Button
                    key={c.id_cuadrilla}
                    size="sm"
                    variant="outline"
                    onClick={() => setQrModal({ id: c.id_cuadrilla, nombre: c.nombre })}
                    className="text-[10px] gap-1"
                  >
                    <IconQrCode className="h-3 w-3" />
                    QR {c.codigo}
                  </Button>
                ))}
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
                      const badge = ASIS_BADGE[reg.estado];
                      return (
                        <TableRow key={reg.id}>
                          <TableCell className="text-xs font-medium">{reg.empleado_nombre}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{reg.puesto}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{reg.cuadrilla_nombre}</TableCell>
                          <TableCell className="font-mono text-xs">{reg.hora_entrada ?? '—'}</TableCell>
                          <TableCell className="font-mono text-xs">{reg.hora_salida ?? '—'}</TableCell>
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
      {/* MODAL — QR de asistencia                                        */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <Modal open={!!qrModal} onClose={() => setQrModal(null)} title="Código QR de Asistencia">
        {qrModal && (
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
        )}
      </Modal>
    </div>
  );
};
