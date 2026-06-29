import React, { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { useTenant } from '../context/TenantContext';

// ─── Types ────────────────────────────────────────────────────────────────────

type ActiveTab = 'dashboard' | 'programacion' | 'alertas' | 'evm' | 'curva-s';

interface ResumenEVM {
  cpi: number | null;
  spi: number | null;
  vac: number | null;
  semaforo: 'VERDE' | 'AMARILLO' | 'ROJO' | null;
  fecha_corte: string | null;
}

interface AlertaResumen {
  id: string;
  tipo: string;
  titulo: string;
  severidad: string;
  estado: string;
  created_at: string;
}

interface DashboardData {
  proyecto_id: string;
  resumen_evm: ResumenEVM;
  alertas_activas: {
    criticas: number;
    warnings: number;
    top_alertas: AlertaResumen[];
  };
  partidas_atrasadas: number;
  fecha_fin_proyectada: string | null;
  dias_retraso: number | null;
  sin_programacion: boolean;
}

interface Alerta {
  id: string;
  tipo: string;
  severidad: string;
  titulo: string;
  descripcion: string;
  estado: string;
  nota_cp: string | null;
  created_at: string;
  concepto_id: string | null;
}

interface PartidaEVM {
  concepto_id: string;
  concepto_clave: string;
  descripcion: string;
  estado: string;
  pct_avance_real: number;
  bac: number;
  cpi: number | null;
  spi: number | null;
  eac: number | null;
  sobre_costo_proyectado: number | null;
  semaforo: string;
}

interface EVMData {
  proyecto_id: string;
  fecha_corte: string;
  global: {
    bac: number; pv: number; ev: number; ac: number;
    cpi: number; spi: number; cv: number; sv: number;
    eac: number; etc: number; vac: number;
    fecha_fin_plan: string | null; fecha_fin_proyectada: string | null;
    semaforo: string;
  } | null;
  por_partida: PartidaEVM[];
  sin_datos: boolean;
}

interface ProgramacionItem {
  id: string;
  concepto_id: string;
  concepto_clave: string;
  descripcion: string;
  fecha_inicio_plan: string;
  fecha_fin_plan: string;
  pct_avance_real: number;
  estado: string;
  bac: number;
  cpi: number | null;
  spi: number | null;
}

interface CurvaSDato {
  proyecto_id?: string;
  periodos?: Array<{ semana: string; pv_acumulado_pct: number; pv_acumulado_mxn: number }>;
  hoy?: string;
  partidas_criticas?: Array<{ concepto_clave: string; spi: number; cpi: number | null }>;
  error?: string;
  mensaje?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SEMAFORO_COLORS: Record<string, string> = {
  VERDE:    'bg-emerald-500',
  AMARILLO: 'bg-amber-400',
  ROJO:     'bg-rose-500',
};

const SEVERIDAD_COLORS: Record<string, string> = {
  CRITICA: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 border border-rose-200 dark:border-rose-800',
  WARN:    'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
  INFO:    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
};

function fmt(n: number | null | undefined, dec = 2): string {
  if (n === null || n === undefined) return '—';
  return n.toLocaleString('es-MX', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}
function fmtMXN(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—';
  return `$${Math.abs(n).toLocaleString('es-MX', { minimumFractionDigits: 0 })}`;
}

// ─── Componente principal ─────────────────────────────────────────────────────

interface ControlProyectosViewProps {
  activeSubView?: string;
}

export const ControlProyectosView: React.FC<ControlProyectosViewProps> = ({ activeSubView }) => {
  const { currentProjectId, isDemo } = useTenant();
  const [activeTab, setActiveTab] = useState<ActiveTab>((activeSubView as ActiveTab) || 'dashboard');

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loadingDash, setLoadingDash] = useState(false);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loadingAlertas, setLoadingAlertas] = useState(false);
  const [evm, setEVM] = useState<EVMData | null>(null);
  const [loadingEVM, setLoadingEVM] = useState(false);
  const [programacion, setProgramacion] = useState<ProgramacionItem[]>([]);
  const [loadingProg, setLoadingProg] = useState(false);
  const [curvaSData, setCurvaSData] = useState<CurvaSDato | null>(null);
  const [loadingCurvaS, setLoadingCurvaS] = useState(false);

  const [modalAlerta, setModalAlerta] = useState<{ alerta: Alerta; accion: 'reconocer' | 'ignorar' } | null>(null);
  const [notaCP, setNotaCP] = useState('');
  const [enviandoAlerta, setEnviandoAlerta] = useState(false);

  const fetchDashboard = useCallback(async () => {
    if (!currentProjectId || isDemo) return;
    setLoadingDash(true);
    try {
      const res = await api.get('/api/v1/control-proyectos/dashboard');
      setDashboard(res.data?.data ?? null);
    } catch { /* silencio */ } finally { setLoadingDash(false); }
  }, [currentProjectId, isDemo]);

  const fetchAlertas = useCallback(async () => {
    if (!currentProjectId || isDemo) return;
    setLoadingAlertas(true);
    try {
      const res = await api.get('/api/v1/control-proyectos/alertas');
      setAlertas(res.data?.data ?? []);
    } catch { /* silencio */ } finally { setLoadingAlertas(false); }
  }, [currentProjectId, isDemo]);

  const fetchEVM = useCallback(async () => {
    if (!currentProjectId || isDemo) return;
    setLoadingEVM(true);
    try {
      const res = await api.get('/api/v1/control-proyectos/evm');
      setEVM(res.data?.data ?? null);
    } catch { /* silencio */ } finally { setLoadingEVM(false); }
  }, [currentProjectId, isDemo]);

  const fetchProgramacion = useCallback(async () => {
    if (!currentProjectId || isDemo) return;
    setLoadingProg(true);
    try {
      const res = await api.get('/api/v1/control-proyectos/programacion');
      setProgramacion(res.data?.data ?? []);
    } catch { /* silencio */ } finally { setLoadingProg(false); }
  }, [currentProjectId, isDemo]);

  const fetchCurvaS = useCallback(async () => {
    if (!currentProjectId || isDemo) return;
    setLoadingCurvaS(true);
    try {
      const res = await api.get('/api/v1/control-proyectos/curva-s');
      setCurvaSData(res.data?.data ?? null);
    } catch { /* silencio */ } finally { setLoadingCurvaS(false); }
  }, [currentProjectId, isDemo]);

  useEffect(() => {
    if (activeTab === 'dashboard')    void fetchDashboard();
    if (activeTab === 'alertas')      void fetchAlertas();
    if (activeTab === 'evm')          void fetchEVM();
    if (activeTab === 'programacion') void fetchProgramacion();
    if (activeTab === 'curva-s')      void fetchCurvaS();
  }, [activeTab, currentProjectId]);

  async function accionarAlerta() {
    if (!modalAlerta) return;
    setEnviandoAlerta(true);
    try {
      await api.patch(`/api/v1/control-proyectos/alertas/${modalAlerta.alerta.id}/${modalAlerta.accion}`, { nota_cp: notaCP });
      setModalAlerta(null);
      setNotaCP('');
      void fetchAlertas();
    } catch { /* silencio */ } finally { setEnviandoAlerta(false); }
  }

  const totalAlertas = dashboard ? dashboard.alertas_activas.criticas + dashboard.alertas_activas.warnings : 0;
  const tabs: Array<{ id: ActiveTab; label: string }> = [
    { id: 'dashboard',    label: 'Dashboard' },
    { id: 'evm',          label: 'EVM' },
    { id: 'curva-s',      label: 'Curva S' },
    { id: 'alertas',      label: totalAlertas > 0 ? `Alertas (${totalAlertas})` : 'Alertas' },
    { id: 'programacion', label: 'Programación' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 pt-6 pb-0 border-b border-zinc-200 dark:border-zinc-700">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Control de Proyectos</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 mb-4">EVM · Curva S · Alertas predictivas · Proyección de cierre</p>
        <div className="flex gap-1 -mb-px overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === t.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">

        {/* ── DASHBOARD ── */}
        {activeTab === 'dashboard' && (
          loadingDash ? <p className="text-zinc-400">Cargando...</p> :
          !dashboard ? <p className="text-zinc-400 text-center mt-10">Sin datos de proyecto</p> :
          dashboard.sin_programacion ? (
            <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-8 text-center max-w-lg mx-auto mt-10">
              <p className="text-amber-700 dark:text-amber-300 font-semibold text-lg">Sin programación de obra</p>
              <p className="text-amber-600 dark:text-amber-400 mt-2 text-sm">Cargue la programación de obra en la pestaña "Programación" para ver el Dashboard, EVM y la Curva S.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4 flex flex-col items-center gap-2">
                  <span className={`w-10 h-10 rounded-full ${SEMAFORO_COLORS[dashboard.resumen_evm.semaforo ?? 'AMARILLO']}`} />
                  <span className="text-xs text-zinc-500">Semáforo global</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-100">{dashboard.resumen_evm.semaforo ?? '—'}</span>
                </div>
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4">
                  <p className="text-xs text-zinc-500 mb-1">CPI Global</p>
                  <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">{dashboard.resumen_evm.cpi !== null ? fmt(dashboard.resumen_evm.cpi, 3) : '—'}</p>
                  <p className="text-xs text-zinc-400 mt-1">{dashboard.resumen_evm.cpi !== null && dashboard.resumen_evm.cpi < 1 ? 'Sobre costo' : 'Dentro del costo'}</p>
                </div>
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4">
                  <p className="text-xs text-zinc-500 mb-1">SPI Global</p>
                  <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">{dashboard.resumen_evm.spi !== null ? fmt(dashboard.resumen_evm.spi, 3) : '—'}</p>
                  <p className="text-xs text-zinc-400 mt-1">{dashboard.resumen_evm.spi !== null && dashboard.resumen_evm.spi < 1 ? 'Con atraso' : 'En tiempo'}</p>
                </div>
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4">
                  <p className="text-xs text-zinc-500 mb-1">VAC</p>
                  <p className={`text-2xl font-bold ${dashboard.resumen_evm.vac !== null && dashboard.resumen_evm.vac < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {dashboard.resumen_evm.vac !== null ? fmtMXN(dashboard.resumen_evm.vac) : '—'}
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">{dashboard.resumen_evm.vac !== null && dashboard.resumen_evm.vac < 0 ? 'Pérdida proyectada' : 'Ganancia proyectada'}</p>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-zinc-800 dark:text-zinc-100">Alertas activas</h2>
                  <div className="flex gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">{dashboard.alertas_activas.criticas} críticas</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">{dashboard.alertas_activas.warnings} warnings</span>
                  </div>
                </div>
                {dashboard.alertas_activas.top_alertas.length === 0 ? (
                  <p className="text-sm text-zinc-400">Sin alertas activas</p>
                ) : (
                  <ul className="divide-y divide-zinc-100 dark:divide-zinc-700">
                    {dashboard.alertas_activas.top_alertas.map(a => (
                      <li key={a.id} className="py-2 flex items-start gap-3">
                        <span className={`mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${SEVERIDAD_COLORS[a.severidad] ?? ''}`}>{a.severidad}</span>
                        <div>
                          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{a.titulo}</p>
                          <p className="text-xs text-zinc-400">{a.tipo.replace(/_/g, ' ')}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {dashboard.fecha_fin_proyectada && (
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-5 flex items-center gap-6">
                  <div>
                    <p className="text-xs text-zinc-500">Fecha fin proyectada</p>
                    <p className="text-xl font-bold text-zinc-800 dark:text-zinc-100">{dashboard.fecha_fin_proyectada}</p>
                  </div>
                  {dashboard.dias_retraso !== null && dashboard.dias_retraso > 0 && (
                    <div className="text-rose-600 dark:text-rose-400">
                      <p className="text-xs">Retraso proyectado</p>
                      <p className="text-xl font-bold">{dashboard.dias_retraso} días</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        )}

        {/* ── EVM ── */}
        {activeTab === 'evm' && (
          loadingEVM ? <p className="text-zinc-400">Cargando EVM...</p> :
          !evm || evm.sin_datos ? (
            <p className="text-zinc-400 text-center mt-10">Cargue la programación de obra para ver el EVM.</p>
          ) : (
            <div className="space-y-6">
              {evm.global && (
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`w-4 h-4 rounded-full ${SEMAFORO_COLORS[evm.global.semaforo] ?? 'bg-zinc-300'}`} />
                    <h2 className="font-semibold text-zinc-800 dark:text-zinc-100">EVM Global — Corte {evm.fecha_corte}</h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'BAC', val: fmtMXN(evm.global.bac) },
                      { label: 'PV (planificado)', val: fmtMXN(evm.global.pv) },
                      { label: 'EV (ganado)', val: fmtMXN(evm.global.ev) },
                      { label: 'AC (real)', val: fmtMXN(evm.global.ac) },
                      { label: 'CPI', val: fmt(evm.global.cpi, 3) },
                      { label: 'SPI', val: fmt(evm.global.spi, 3) },
                      { label: 'EAC (costo final)', val: fmtMXN(evm.global.eac) },
                      { label: 'VAC', val: fmtMXN(evm.global.vac) },
                    ].map(({ label, val }) => (
                      <div key={label} className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-700/50">
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
                        <p className="font-bold text-zinc-800 dark:text-zinc-100">{val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50 dark:bg-zinc-700/50 text-xs text-zinc-500 uppercase">
                    <tr>
                      <th className="text-left px-4 py-3">Partida</th>
                      <th className="text-left px-4 py-3">Estado</th>
                      <th className="text-right px-4 py-3">Avance %</th>
                      <th className="text-right px-4 py-3">BAC</th>
                      <th className="text-right px-4 py-3">CPI</th>
                      <th className="text-right px-4 py-3">SPI</th>
                      <th className="text-right px-4 py-3">EAC</th>
                      <th className="text-center px-4 py-3">Semáforo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
                    {evm.por_partida.map(p => (
                      <tr key={p.concepto_id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/30">
                        <td className="px-4 py-3">
                          <p className="font-medium text-zinc-800 dark:text-zinc-100">{p.concepto_clave}</p>
                          <p className="text-xs text-zinc-400">{p.descripcion.substring(0, 40)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            p.estado === 'COMPLETADA' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
                            p.estado === 'EN_CURSO'   ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                            p.estado === 'ATRASADA'   ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' :
                            'bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300'
                          }`}>{p.estado}</span>
                        </td>
                        <td className="px-4 py-3 text-right">{p.pct_avance_real.toFixed(1)}%</td>
                        <td className="px-4 py-3 text-right">{fmtMXN(p.bac)}</td>
                        <td className="px-4 py-3 text-right font-medium">{p.cpi !== null ? fmt(p.cpi, 3) : '—'}</td>
                        <td className="px-4 py-3 text-right font-medium">{p.spi !== null ? fmt(p.spi, 3) : '—'}</td>
                        <td className="px-4 py-3 text-right">{p.eac !== null ? fmtMXN(p.eac) : '—'}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block w-3 h-3 rounded-full ${SEMAFORO_COLORS[p.semaforo] ?? 'bg-zinc-300'}`} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}

        {/* ── CURVA S ── */}
        {activeTab === 'curva-s' && (
          loadingCurvaS ? <p className="text-zinc-400">Cargando Curva S...</p> :
          !curvaSData ? <p className="text-zinc-400">Sin datos</p> :
          curvaSData.error === 'SIN_PROGRAMACION' ? (
            <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-8 text-center max-w-lg mx-auto mt-10">
              <p className="text-amber-700 dark:text-amber-300 font-semibold">{curvaSData.mensaje}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {curvaSData.partidas_criticas && curvaSData.partidas_criticas.length > 0 && (
                <div className="rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 p-4">
                  <p className="font-semibold text-rose-700 dark:text-rose-300 mb-2">Partidas críticas (SPI &lt; 0.85)</p>
                  <div className="flex flex-wrap gap-2">
                    {curvaSData.partidas_criticas.map(p => (
                      <span key={p.concepto_clave} className="text-xs px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300">
                        {p.concepto_clave} — SPI {p.spi.toFixed(3)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50 dark:bg-zinc-700/50 text-xs text-zinc-500 uppercase">
                    <tr>
                      <th className="text-left px-4 py-3">Semana</th>
                      <th className="text-right px-4 py-3">PV Acum. %</th>
                      <th className="text-right px-4 py-3">PV Acum. MXN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
                    {(curvaSData.periodos ?? []).map(p => (
                      <tr key={p.semana} className={`hover:bg-zinc-50 dark:hover:bg-zinc-700/30 ${p.semana === curvaSData.hoy ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                        <td className="px-4 py-2 font-mono text-xs">
                          {p.semana}{p.semana === curvaSData.hoy ? ' ← hoy' : ''}
                        </td>
                        <td className="px-4 py-2 text-right">{p.pv_acumulado_pct.toFixed(1)}%</td>
                        <td className="px-4 py-2 text-right">{fmtMXN(p.pv_acumulado_mxn)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}

        {/* ── ALERTAS ── */}
        {activeTab === 'alertas' && (
          <div className="space-y-3">
            {loadingAlertas ? <p className="text-zinc-400">Cargando alertas...</p> :
            alertas.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-zinc-400 text-lg font-medium">Sin alertas activas</p>
                <p className="text-zinc-400 text-sm mt-1">El sistema monitoreará automáticamente las métricas del proyecto.</p>
              </div>
            ) : (
              alertas.map(a => (
                <div key={a.id} className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <span className={`mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${SEVERIDAD_COLORS[a.severidad] ?? ''}`}>{a.severidad}</span>
                      <div>
                        <p className="font-semibold text-zinc-800 dark:text-zinc-100">{a.titulo}</p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{a.descripcion}</p>
                        <p className="text-xs text-zinc-400 mt-1">{a.tipo.replace(/_/g, ' ')} · {a.estado} · {new Date(a.created_at).toLocaleDateString('es-MX')}</p>
                        {a.nota_cp && <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Nota CP: {a.nota_cp}</p>}
                      </div>
                    </div>
                    {a.estado === 'ACTIVA' && (
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => { setModalAlerta({ alerta: a, accion: 'reconocer' }); setNotaCP(''); }}
                          className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                        >Reconocer</button>
                        <button
                          onClick={() => { setModalAlerta({ alerta: a, accion: 'ignorar' }); setNotaCP(''); }}
                          className="text-xs px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors"
                        >Ignorar</button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── PROGRAMACIÓN ── */}
        {activeTab === 'programacion' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-zinc-800 dark:text-zinc-100">Programación de Obra (Gantt)</h2>
              <button
                onClick={() => void fetchProgramacion()}
                className="text-xs px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 text-zinc-600 dark:text-zinc-300 transition-colors"
              >↻ Actualizar</button>
            </div>
            {loadingProg ? <p className="text-zinc-400">Cargando programación...</p> :
            programacion.length === 0 ? (
              <div className="text-center py-12 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-700">
                <p className="text-zinc-400 font-medium">Sin programación cargada</p>
                <p className="text-zinc-400 text-sm mt-2">Use el endpoint <code className="font-mono text-xs bg-zinc-100 dark:bg-zinc-700 px-1 py-0.5 rounded">POST /api/v1/control-proyectos/programacion</code> para cargar la programación de obra.</p>
              </div>
            ) : (
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50 dark:bg-zinc-700/50 text-xs text-zinc-500 uppercase">
                    <tr>
                      <th className="text-left px-4 py-3">Partida</th>
                      <th className="text-left px-4 py-3">Estado</th>
                      <th className="text-left px-4 py-3">Inicio Plan</th>
                      <th className="text-left px-4 py-3">Fin Plan</th>
                      <th className="text-right px-4 py-3">Avance</th>
                      <th className="text-right px-4 py-3">BAC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
                    {programacion.map(p => (
                      <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/30">
                        <td className="px-4 py-3">
                          <p className="font-medium text-zinc-800 dark:text-zinc-100">{p.concepto_clave}</p>
                          <p className="text-xs text-zinc-400">{p.descripcion.substring(0, 45)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            p.estado === 'COMPLETADA' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
                            p.estado === 'EN_CURSO'   ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                            p.estado === 'ATRASADA'   ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' :
                            'bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300'
                          }`}>{p.estado}</span>
                        </td>
                        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300 text-xs">{new Date(p.fecha_inicio_plan).toLocaleDateString('es-MX')}</td>
                        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300 text-xs">{new Date(p.fecha_fin_plan).toLocaleDateString('es-MX')}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <div className="w-16 bg-zinc-200 dark:bg-zinc-600 rounded-full h-1.5">
                              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${p.pct_avance_real}%` }} />
                            </div>
                            <span className="text-xs">{p.pct_avance_real.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-xs">{fmtMXN(p.bac)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal reconocer/ignorar */}
      {modalAlerta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-lg mb-1">
              {modalAlerta.accion === 'reconocer' ? 'Reconocer alerta' : 'Ignorar alerta'}
            </h3>
            <p className="text-sm text-zinc-500 mb-4">{modalAlerta.alerta.titulo}</p>
            <textarea
              value={notaCP}
              onChange={e => setNotaCP(e.target.value)}
              rows={3}
              placeholder={modalAlerta.accion === 'ignorar'
                ? 'Justificación (mínimo 20 caracteres requerida)...'
                : 'Nota para el expediente (opcional)...'}
              className="w-full border border-zinc-300 dark:border-zinc-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="flex gap-3 mt-4 justify-end">
              <button
                onClick={() => { setModalAlerta(null); setNotaCP(''); }}
                className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-600 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
              >Cancelar</button>
              <button
                onClick={() => void accionarAlerta()}
                disabled={enviandoAlerta || (modalAlerta.accion === 'ignorar' && notaCP.length < 20)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {enviandoAlerta ? 'Guardando...' : modalAlerta.accion === 'reconocer' ? 'Reconocer' : 'Ignorar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
