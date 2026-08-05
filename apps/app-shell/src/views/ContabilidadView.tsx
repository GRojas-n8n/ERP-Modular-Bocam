import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  EmptyStatePanel,
  MetricCard,
  SectionBadge,
  cn,
} from '@bocam/ui-core';
import {
  IconAlertCircle,
  IconCheckCircle2,
  IconChevronRight,
  IconFileText,
  IconTrendingUp,
  IconWallet,
} from '../components/Icons';
import { TableScrollShadow } from '../components/TableScrollShadow';
import { HelpButton } from '../components/HelpButton';
import { HelpPanel } from '../components/HelpPanel';
import api from '../lib/api';
import { useTenant } from '../context/TenantContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Asiento {
  id_asiento: string;
  folio_poliza: string;
  fecha_poliza: string;
  tipo_poliza: string;
  concepto: string;
  monto_total: number;
  moneda: string;
  beneficiario: string;
  estatus: string;
  cfdi_status: string;
  bancario_status: string;
}

interface Movimiento {
  id_movimiento: string;
  cargo: number;
  abono: number;
  descripcion: string;
  orden: number;
  cuenta: { clave: string; nombre: string; tipo: string; naturaleza: string };
}

interface DashboardData {
  total_asientos: number;
  cerrados: number;
  pendientes_cfdi: number;
  pendientes_banco: number;
  total_egreso_mes: number;
  total_ingreso_mes: number;
  alertas: Array<{ tipo: string; mensaje: string }>;
}

interface ReporteBalanza {
  desde: string;
  hasta: string;
  cuentas: Array<{ clave: string; nombre: string; tipo: string; total_cargo: number; total_abono: number; saldo: number }>;
  total_cargo: number;
  total_abono: number;
  cuadrado: boolean;
}

interface ReporteEstadoResultados {
  ingresos: number;
  costos: number;
  gastos: number;
  utilidad_neta: number;
  cuentas: Array<{ clave: string; nombre: string; tipo: string; total_cargo: number; total_abono: number }>;
}

interface ReporteBalanceGeneral {
  activos: number;
  pasivos: number;
  capital: number;
  ecuacion_cuadrada: boolean;
  cuentas: Array<{ clave: string; nombre: string; tipo: string; saldo_normal: number }>;
}

type Tab = 'polizas' | 'conciliacion' | 'reportes';
type TipoReporte = 'balanza' | 'estado-resultados' | 'balance-general';

const TIPO_POLIZA_COLOR: Record<string, string> = {
  EGRESO:                     'bg-amber-500/10 text-amber-700 border-amber-500/20',
  PASIVO_PROYECTADO:          'bg-blue-500/10 text-blue-700 border-blue-500/20',
  REVERSION_PASIVO_PROYECTADO:'bg-violet-500/10 text-violet-700 border-violet-500/20',
  TRANSFERENCIA_INTERNA:      'bg-slate-500/10 text-slate-700 border-slate-500/20',
  ESTIMACION:                 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
  AVANCE:                     'bg-teal-500/10 text-teal-700 border-teal-500/20',
};

const CFDI_COLOR: Record<string, string> = {
  PENDIENTE:    'bg-amber-500/10 text-amber-600',
  SAT_VIGENTE:  'bg-emerald-500/10 text-emerald-600',
  SAT_CANCELADO:'bg-red-500/10 text-red-600',
  NO_APLICA:    'bg-muted text-muted-foreground',
};

const fmtMXN = (n: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);

const fmtDate = (d: string) => new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });

const today = new Date().toISOString().slice(0, 10);
const inicioAno = `${new Date().getFullYear()}-01-01`;

// ─── ContabilidadView ─────────────────────────────────────────────────────────

const ContabilidadView: React.FC = () => {
  const { currentProjectId } = useTenant();
  const [tab, setTab] = useState<Tab>('polizas');
  const [helpOpen, setHelpOpen] = useState(false);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [asientos, setAsientos] = useState<Asiento[]>([]);
  const [loadingAsientos, setLoadingAsientos] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [movimientos, setMovimientos] = useState<Record<string, Movimiento[]>>({});
  const [loadingMovs, setLoadingMovs] = useState(false);
  const [tipoReporte, setTipoReporte] = useState<TipoReporte>('balanza');
  const [desdeReporte, setDesdeReporte] = useState(inicioAno);
  const [hastaReporte, setHastaReporte] = useState(today);
  const [reporte, setReporte] = useState<ReporteBalanza | ReporteEstadoResultados | ReporteBalanceGeneral | null>(null);
  const [loadingReporte, setLoadingReporte] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await api.get('/api/v1/contabilidad/dashboard');
      setDashboard(res.data.data);
    } catch { /* dashboard es opcional */ }
  }, []);

  const fetchAsientos = useCallback(async () => {
    setLoadingAsientos(true);
    try {
      const res = await api.get('/api/v1/contabilidad/asientos');
      setAsientos(res.data.data ?? []);
    } catch {
      setAsientos([]);
    } finally {
      setLoadingAsientos(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboard();
    void fetchAsientos();
  }, [currentProjectId, fetchDashboard, fetchAsientos]);

  const toggleExpand = async (asientoId: string) => {
    if (expandedId === asientoId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(asientoId);
    if (movimientos[asientoId]) return;
    setLoadingMovs(true);
    try {
      const res = await api.get(`/api/v1/contabilidad/asientos/${asientoId}/movimientos`);
      setMovimientos(prev => ({ ...prev, [asientoId]: res.data.data ?? [] }));
    } finally {
      setLoadingMovs(false);
    }
  };

  const generarReporte = async () => {
    setLoadingReporte(true);
    setReporte(null);
    try {
      const params = tipoReporte === 'balance-general'
        ? `?fecha=${hastaReporte}`
        : `?desde=${desdeReporte}&hasta=${hastaReporte}`;
      const res = await api.get(`/api/v1/contabilidad/reportes/${tipoReporte}${params}`);
      setReporte(res.data.data);
    } catch {
      setReporte(null);
    } finally {
      setLoadingReporte(false);
    }
  };

  // ── KPI Dashboard ────────────────────────────────────────────────────────────
  const renderDashboard = () => (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <MetricCard
        value={dashboard?.total_asientos ?? '—'}
        label="Total pólizas"
        icon={<IconFileText className="h-5 w-5 text-primary" />}
        iconContainerClassName="bg-primary/10"
      />
      <MetricCard
        value={dashboard?.pendientes_cfdi ?? '—'}
        label="Sin CFDI"
        icon={<IconAlertCircle className="h-5 w-5 text-amber-500" />}
        iconContainerClassName="bg-amber-500/10"
        trendTone={dashboard && dashboard.pendientes_cfdi > 0 ? 'warning' : 'positive'}
      />
      <MetricCard
        value={dashboard?.pendientes_banco ?? '—'}
        label="Sin conciliar banco"
        icon={<IconWallet className="h-5 w-5 text-blue-500" />}
        iconContainerClassName="bg-blue-500/10"
      />
      <MetricCard
        value={dashboard ? fmtMXN(dashboard.total_egreso_mes) : '—'}
        label="Egresos del mes"
        icon={<IconTrendingUp className="h-5 w-5 text-rose-500" />}
        iconContainerClassName="bg-rose-500/10"
      />
    </div>
  );

  // ── Tab Pólizas ──────────────────────────────────────────────────────────────
  const renderPolizas = () => (
    <Card>
      <CardContent className="p-0">
        {loadingAsientos ? (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">Cargando pólizas…</div>
        ) : asientos.length === 0 ? (
          <EmptyStatePanel
            icon={<IconFileText className="h-8 w-8 text-muted-foreground/40" />}
            title="Sin pólizas registradas"
            description="Las pólizas se generan automáticamente desde los módulos de Finanzas, Compras y Control de Obra."
          />
        ) : (
          <TableScrollShadow>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-muted-foreground">Folio</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-muted-foreground">Fecha</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-muted-foreground">Tipo</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-muted-foreground">Concepto</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-muted-foreground text-right">Monto</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-muted-foreground">CFDI</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-muted-foreground">Banco</th>
                  <th className="px-4 py-3 w-8" />
                </tr>
              </thead>
              <tbody>
                {asientos.map(a => (
                  <React.Fragment key={a.id_asiento}>
                    <tr
                      className="border-b hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => void toggleExpand(a.id_asiento)}
                    >
                      <td className="px-4 py-3 font-mono text-[11px] text-primary">{a.folio_poliza}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{fmtDate(a.fecha_poliza)}</td>
                      <td className="px-4 py-3">
                        <span className={cn('rounded-md border px-2 py-0.5 text-[10px] font-bold', TIPO_POLIZA_COLOR[a.tipo_poliza] ?? 'bg-muted text-muted-foreground')}>
                          {a.tipo_poliza.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-[240px] truncate text-xs">{a.concepto}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs font-semibold">{fmtMXN(Number(a.monto_total))}</td>
                      <td className="px-4 py-3">
                        <span className={cn('rounded px-2 py-0.5 text-[10px] font-bold', CFDI_COLOR[a.cfdi_status] ?? 'bg-muted text-muted-foreground')}>
                          {a.cfdi_status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('rounded px-2 py-0.5 text-[10px] font-bold', a.bancario_status === 'CONCILIADO' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600')}>
                          {a.bancario_status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <IconChevronRight className={cn('h-4 w-4 text-muted-foreground transition-transform', expandedId === a.id_asiento ? 'rotate-90' : '')} />
                      </td>
                    </tr>
                    {expandedId === a.id_asiento && (
                      <tr>
                        <td colSpan={8} className="bg-muted/20 px-6 py-4">
                          {loadingMovs && !movimientos[a.id_asiento] ? (
                            <p className="text-xs text-muted-foreground">Cargando movimientos…</p>
                          ) : !movimientos[a.id_asiento] || movimientos[a.id_asiento].length === 0 ? (
                            <p className="text-xs text-muted-foreground italic">Póliza de partida simple (anterior al corte de partida doble 2026-06-29).</p>
                          ) : (
                            <div>
                              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Movimientos contables</p>
                              <TableScrollShadow>
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="border-b">
                                    <th className="pb-1 text-left font-semibold text-muted-foreground">Cuenta</th>
                                    <th className="pb-1 text-left font-semibold text-muted-foreground">Descripción</th>
                                    <th className="pb-1 text-right font-semibold text-muted-foreground">Cargo</th>
                                    <th className="pb-1 text-right font-semibold text-muted-foreground">Abono</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {movimientos[a.id_asiento].map(m => (
                                    <tr key={m.id_movimiento} className="border-b border-border/30">
                                      <td className="py-1 font-mono text-primary">{m.cuenta.clave} — {m.cuenta.nombre}</td>
                                      <td className="py-1 text-muted-foreground">{m.descripcion}</td>
                                      <td className="py-1 text-right font-mono">{Number(m.cargo) > 0 ? fmtMXN(Number(m.cargo)) : '—'}</td>
                                      <td className="py-1 text-right font-mono">{Number(m.abono) > 0 ? fmtMXN(Number(m.abono)) : '—'}</td>
                                    </tr>
                                  ))}
                                  <tr className="border-t font-bold">
                                    <td colSpan={2} className="pt-2 text-right text-[10px] uppercase tracking-wide text-muted-foreground">Totales</td>
                                    <td className="pt-2 text-right font-mono text-primary">
                                      {fmtMXN(movimientos[a.id_asiento].reduce((s, m) => s + Number(m.cargo), 0))}
                                    </td>
                                    <td className="pt-2 text-right font-mono text-primary">
                                      {fmtMXN(movimientos[a.id_asiento].reduce((s, m) => s + Number(m.abono), 0))}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              </TableScrollShadow>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </TableScrollShadow>
        )}
      </CardContent>
    </Card>
  );

  // ── Tab Conciliación ─────────────────────────────────────────────────────────
  const renderConciliacion = () => (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <IconAlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">Conciliación CFDI y Bancaria</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Para conciliar un pago con su CFDI, abre la póliza correspondiente en la pestaña Pólizas y usa el botón de conciliación.
                La conciliación bancaria también opera desde el detalle de cada asiento.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      {dashboard && dashboard.pendientes_cfdi > 0 && (
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <SectionBadge className="border-amber-500/20 bg-amber-500/10 text-amber-600">
                {dashboard.pendientes_cfdi} CFDI pendientes
              </SectionBadge>
            </div>
            <p className="text-xs text-muted-foreground">
              Hay {dashboard.pendientes_cfdi} póliza(s) sin CFDI asociado. Abrir la póliza desde la pestaña Pólizas para conciliar.
            </p>
          </CardContent>
        </Card>
      )}
      {dashboard && dashboard.pendientes_banco > 0 && (
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <SectionBadge className="border-blue-500/20 bg-blue-500/10 text-blue-600">
                {dashboard.pendientes_banco} sin conciliar banco
              </SectionBadge>
            </div>
            <p className="text-xs text-muted-foreground">
              Hay {dashboard.pendientes_banco} pago(s) sin conciliación bancaria. Subir archivo de estado de cuenta para conciliar en lote.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // ── Tab Reportes ─────────────────────────────────────────────────────────────
  const renderReportes = () => (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-muted-foreground">Reporte</label>
              <select
                className="h-9 rounded-xl border border-border/50 bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={tipoReporte}
                onChange={e => setTipoReporte(e.target.value as TipoReporte)}
              >
                <option value="balanza">Balanza de Comprobación</option>
                <option value="estado-resultados">Estado de Resultados</option>
                <option value="balance-general">Balance General</option>
              </select>
            </div>
            {tipoReporte !== 'balance-general' ? (
              <>
                <div>
                  <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-muted-foreground">Desde</label>
                  <input type="date" className="h-9 rounded-xl border border-border/50 bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={desdeReporte} onChange={e => setDesdeReporte(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-muted-foreground">Hasta</label>
                  <input type="date" className="h-9 rounded-xl border border-border/50 bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={hastaReporte} onChange={e => setHastaReporte(e.target.value)} />
                </div>
              </>
            ) : (
              <div>
                <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-muted-foreground">Al corte de</label>
                <input type="date" className="h-9 rounded-xl border border-border/50 bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={hastaReporte} onChange={e => setHastaReporte(e.target.value)} />
              </div>
            )}
            <Button onClick={() => void generarReporte()} disabled={loadingReporte} className="btn-glow h-9 shrink-0">
              {loadingReporte ? 'Generando…' : 'Generar reporte'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {reporte && tipoReporte === 'balanza' && (() => {
        const b = reporte as ReporteBalanza;
        return (
          <Card>
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wide">Balanza de Comprobación</h3>
                  <p className="text-[10px] text-muted-foreground">{fmtDate(b.desde)} — {fmtDate(b.hasta)}</p>
                </div>
                <SectionBadge className={b.cuadrado ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600' : 'border-red-500/20 bg-red-500/10 text-red-600'}>
                  <IconCheckCircle2 className="h-3 w-3" />
                  {b.cuadrado ? 'Cuadrada' : 'Descuadrada'}
                </SectionBadge>
              </div>
              <TableScrollShadow>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-2 text-left font-black uppercase tracking-wide text-muted-foreground">Clave</th>
                      <th className="pb-2 text-left font-black uppercase tracking-wide text-muted-foreground">Cuenta</th>
                      <th className="pb-2 text-right font-black uppercase tracking-wide text-muted-foreground">Cargo</th>
                      <th className="pb-2 text-right font-black uppercase tracking-wide text-muted-foreground">Abono</th>
                      <th className="pb-2 text-right font-black uppercase tracking-wide text-muted-foreground">Saldo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {b.cuentas.map(c => (
                      <tr key={c.clave} className="border-b border-border/30 hover:bg-muted/20">
                        <td className="py-1.5 font-mono text-primary">{c.clave}</td>
                        <td className="py-1.5">{c.nombre}</td>
                        <td className="py-1.5 text-right font-mono">{Number(c.total_cargo) > 0 ? fmtMXN(Number(c.total_cargo)) : '—'}</td>
                        <td className="py-1.5 text-right font-mono">{Number(c.total_abono) > 0 ? fmtMXN(Number(c.total_abono)) : '—'}</td>
                        <td className={cn('py-1.5 text-right font-mono font-semibold', Number(c.saldo) < 0 ? 'text-rose-600' : '')}>{fmtMXN(Number(c.saldo))}</td>
                      </tr>
                    ))}
                    <tr className="border-t font-black">
                      <td colSpan={2} className="pt-2 text-right text-[10px] uppercase tracking-wide text-muted-foreground">Totales</td>
                      <td className="pt-2 text-right font-mono text-primary">{fmtMXN(b.total_cargo)}</td>
                      <td className="pt-2 text-right font-mono text-primary">{fmtMXN(b.total_abono)}</td>
                      <td className="pt-2 text-right font-mono">{fmtMXN(b.total_cargo - b.total_abono)}</td>
                    </tr>
                  </tbody>
                </table>
              </TableScrollShadow>
            </CardContent>
          </Card>
        );
      })()}

      {reporte && tipoReporte === 'estado-resultados' && (() => {
        const er = reporte as ReporteEstadoResultados;
        return (
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-4 text-sm font-black uppercase tracking-wide">Estado de Resultados</h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-4">
                {[
                  { label: 'Ingresos', v: er.ingresos, color: 'text-emerald-600' },
                  { label: 'Costos',   v: er.costos,   color: 'text-amber-600' },
                  { label: 'Gastos',   v: er.gastos,   color: 'text-rose-600' },
                  { label: 'Utilidad Neta', v: er.utilidad_neta, color: er.utilidad_neta >= 0 ? 'text-emerald-600' : 'text-rose-600' },
                ].map(item => (
                  <div key={item.label} className="rounded-xl bg-muted/40 p-3 text-center">
                    <p className={cn('text-lg font-black tracking-tighter', item.color)}>{fmtMXN(item.v)}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {reporte && tipoReporte === 'balance-general' && (() => {
        const bg = reporte as ReporteBalanceGeneral;
        return (
          <Card>
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-wide">Balance General</h3>
                <SectionBadge className={bg.ecuacion_cuadrada ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600' : 'border-red-500/20 bg-red-500/10 text-red-600'}>
                  {bg.ecuacion_cuadrada ? 'Activos = Pasivos + Capital' : 'Ecuación descuadrada'}
                </SectionBadge>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {[
                  { label: 'Activos',  v: bg.activos,  color: 'text-blue-600' },
                  { label: 'Pasivos',  v: bg.pasivos,  color: 'text-rose-600' },
                  { label: 'Capital',  v: bg.capital,  color: 'text-emerald-600' },
                ].map(item => (
                  <div key={item.label} className="rounded-xl bg-muted/40 p-4 text-center">
                    <p className={cn('text-xl font-black tracking-tighter', item.color)}>{fmtMXN(item.v)}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })()}
    </div>
  );

  // ── Render ───────────────────────────────────────────────────────────────────
  const tabs: { id: Tab; label: string }[] = [
    { id: 'polizas',      label: 'Pólizas' },
    { id: 'conciliacion', label: 'Conciliación' },
    { id: 'reportes',     label: 'Reportes' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-foreground md:text-3xl">Contabilidad</h1>
          <p className="mt-1 text-sm text-muted-foreground">Pólizas contables en partida doble · Conciliación CFDI y banco · Reportes financieros</p>
        </div>
        <div className="flex items-center gap-2">
          <SectionBadge className="border-primary/20 bg-primary/10 text-primary">
            Corte partida doble: 29 Jun 2026
          </SectionBadge>
          <HelpButton onClick={() => setHelpOpen(true)} />
        </div>
      </div>

      {/* KPIs */}
      {dashboard && renderDashboard()}

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-muted/50 p-1 w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-semibold transition-all',
              tab === t.id
                ? 'bg-card text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'polizas'      && renderPolizas()}
      {tab === 'conciliacion' && renderConciliacion()}
      {tab === 'reportes'     && renderReportes()}

      <HelpPanel viewId="contabilidad" isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
};

export default ContabilidadView;
