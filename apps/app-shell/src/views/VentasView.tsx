import React, { useEffect, useState } from 'react';
import { ventasApi } from '../lib/api';
import {
  IconRefreshCw,
  IconAlertCircle,
  IconSearch,
} from '../components/Icons';
import { cn } from '../lib/utils';

// ─── Icono local para ventas ──────────────────────────────────────────────────
const IconShoppingBag: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const IconFileText: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const IconUsers: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const IconReceipt: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Cliente {
  id: string;
  nombre: string;
  rfc?: string;
  email?: string;
  telefono?: string;
  tipo?: string;
}

interface Cotizacion {
  id: string;
  folio?: string;
  cliente_id?: string;
  cliente?: { nombre: string };
  monto_total?: number;
  estatus: string;
  descripcion?: string;
  created_at?: string;
}

interface Factura {
  id: string;
  folio?: string;
  cliente_id?: string;
  cliente?: { nombre: string };
  monto_total?: number;
  estatus: string;
  fecha_emision?: string;
}

type TabKey = 'clientes' | 'cotizaciones' | 'facturas';

// ─── Badge de estatus ─────────────────────────────────────────────────────────
const EstatusBadge: React.FC<{ estatus: string }> = ({ estatus }) => {
  const colores: Record<string, string> = {
    BORRADOR:   'bg-slate-100 text-slate-600 border-slate-200',
    ENVIADA:    'bg-blue-50 text-blue-600 border-blue-200',
    ACEPTADA:   'bg-emerald-50 text-emerald-600 border-emerald-200',
    RECHAZADA:  'bg-red-50 text-red-600 border-red-200',
    EMITIDA:    'bg-indigo-50 text-indigo-600 border-indigo-200',
    PAGADA:     'bg-emerald-50 text-emerald-600 border-emerald-200',
    CANCELADA:  'bg-red-50 text-red-600 border-red-200',
    VENCIDA:    'bg-amber-50 text-amber-600 border-amber-200',
  };
  return (
    <span className={cn(
      'px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-tighter',
      colores[estatus] ?? 'bg-slate-100 text-slate-600 border-slate-200'
    )}>
      {estatus}
    </span>
  );
};

// ─── Componente principal ─────────────────────────────────────────────────────
export const VentasView: React.FC = () => {
  const [tab, setTab] = useState<TabKey>('clientes');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');

  const fetchData = async (t: TabKey = tab) => {
    setLoading(true);
    setError(null);
    try {
      if (t === 'clientes') {
        const r = await ventasApi.getClientes();
        setClientes(r.data.data || []);
      } else if (t === 'cotizaciones') {
        const r = await ventasApi.getCotizaciones();
        setCotizaciones(r.data.data || []);
      } else {
        const r = await ventasApi.getFacturas();
        setFacturas(r.data.data || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error de conexion con el modulo de Ventas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(tab); }, [tab]);

  const handleTab = (t: TabKey) => {
    setTab(t);
    setBusqueda('');
  };

  // ── Filtrado local por búsqueda ───────────────────────────────────────────
  const clientesFiltrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (c.rfc || '').toLowerCase().includes(busqueda.toLowerCase())
  );
  const cotizacionesFiltradas = cotizaciones.filter(c =>
    (c.folio || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (c.cliente?.nombre || '').toLowerCase().includes(busqueda.toLowerCase())
  );
  const facturasFiltradas = facturas.filter(f =>
    (f.folio || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (f.cliente?.nombre || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  const tabs: { key: TabKey; label: string; icon: React.ReactNode; count: number }[] = [
    { key: 'clientes',     label: 'Clientes',     icon: <IconUsers className="h-4 w-4" />,    count: clientes.length },
    { key: 'cotizaciones', label: 'Cotizaciones',  icon: <IconFileText className="h-4 w-4" />, count: cotizaciones.length },
    { key: 'facturas',     label: 'Facturas',      icon: <IconReceipt className="h-4 w-4" />,  count: facturas.length },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
              <IconShoppingBag className="h-6 w-6 text-emerald-500" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">
              Ventas
            </h1>
          </div>
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest ml-14">
            Clientes • Cotizaciones • Facturacion
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchData()}
            className="p-3 rounded-xl border border-border/60 bg-card hover:bg-slate-50 transition-all shadow-sm active:scale-90"
            title="Refrescar datos"
          >
            <IconRefreshCw className={cn('h-5 w-5 text-muted-foreground', loading && 'animate-spin')} />
          </button>
          <button className="px-6 py-3 bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-600/20 hover:scale-[1.02] active:scale-95 transition-all">
            {tab === 'clientes' ? 'Nuevo Cliente' : tab === 'cotizaciones' ? 'Nueva Cotizacion' : 'Nueva Factura'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-card p-1.5 rounded-2xl border border-border/40 shadow-sm w-fit">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => handleTab(t.key)}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
              tab === t.key
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            {t.icon}
            {t.label}
            {tab === t.key && t.count > 0 && (
              <span className="bg-white/20 px-1.5 py-0.5 rounded-md text-[9px]">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Barra de búsqueda */}
      <div className="bg-card p-4 rounded-2xl border border-border/40 shadow-sm">
        <div className="relative group max-w-md">
          <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-emerald-600" />
          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder={`BUSCAR ${tab.toUpperCase()}...`}
            className="w-full pl-12 pr-4 py-3 bg-muted/30 border border-transparent rounded-xl text-xs font-bold tracking-tight focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/40 focus:bg-background transition-all"
          />
        </div>
      </div>

      {/* Contenido */}
      <div className="bg-card rounded-3xl border border-border/40 shadow-xl overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[400px] gap-6">
            <div className="h-12 w-12 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin" />
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] animate-pulse">
              Cargando {tab}...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-[400px] p-8 text-center max-w-md mx-auto">
            <div className="h-20 w-20 bg-destructive/10 rounded-2xl flex items-center justify-center mb-6">
              <IconAlertCircle className="h-10 w-10 text-destructive" />
            </div>
            <h3 className="font-black text-lg text-slate-900 uppercase tracking-tighter">Error de Conexion</h3>
            <p className="text-muted-foreground mt-4 text-xs font-medium leading-relaxed">{error}</p>
            <button
              onClick={() => fetchData()}
              className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <>
            {/* ── CLIENTES ── */}
            {tab === 'clientes' && (
              clientesFiltrados.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground gap-4">
                  <IconUsers className="h-20 w-20 opacity-10" />
                  <p className="font-black text-[10px] uppercase tracking-[0.3em] opacity-30">Sin clientes registrados</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-muted/30 border-b border-border/40">
                        <th className="px-8 py-5 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Nombre / Razon Social</th>
                        <th className="px-8 py-5 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">RFC</th>
                        <th className="px-8 py-5 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Email</th>
                        <th className="px-8 py-5 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Telefono</th>
                        <th className="px-8 py-5 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Tipo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {clientesFiltrados.map(c => (
                        <tr key={c.id} className="hover:bg-emerald-500/[0.02] transition-colors">
                          <td className="px-8 py-5 font-black text-sm text-slate-800 tracking-tight">{c.nombre}</td>
                          <td className="px-8 py-5 font-mono text-xs text-slate-600">{c.rfc || '—'}</td>
                          <td className="px-8 py-5 text-xs text-muted-foreground">{c.email || '—'}</td>
                          <td className="px-8 py-5 text-xs text-muted-foreground">{c.telefono || '—'}</td>
                          <td className="px-8 py-5">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 text-[9px] font-black uppercase tracking-tighter">
                              {c.tipo || 'CLIENTE'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* ── COTIZACIONES ── */}
            {tab === 'cotizaciones' && (
              cotizacionesFiltradas.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground gap-4">
                  <IconFileText className="h-20 w-20 opacity-10" />
                  <p className="font-black text-[10px] uppercase tracking-[0.3em] opacity-30">Sin cotizaciones registradas</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-muted/30 border-b border-border/40">
                        <th className="px-8 py-5 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Folio</th>
                        <th className="px-8 py-5 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Cliente</th>
                        <th className="px-8 py-5 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Descripcion</th>
                        <th className="px-8 py-5 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Estatus</th>
                        <th className="px-8 py-5 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] text-right">Monto Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {cotizacionesFiltradas.map(c => (
                        <tr key={c.id} className="hover:bg-emerald-500/[0.02] transition-colors">
                          <td className="px-8 py-5 font-black text-emerald-600 tracking-tighter text-sm">{c.folio || c.id.slice(0, 8).toUpperCase()}</td>
                          <td className="px-8 py-5 font-bold text-sm text-slate-800">{c.cliente?.nombre || '—'}</td>
                          <td className="px-8 py-5 text-xs text-muted-foreground max-w-xs truncate">{c.descripcion || '—'}</td>
                          <td className="px-8 py-5"><EstatusBadge estatus={c.estatus} /></td>
                          <td className="px-8 py-5 text-right">
                            <span className="font-mono font-black text-base text-slate-900">
                              {c.monto_total !== undefined
                                ? `$${c.monto_total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
                                : '—'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* ── FACTURAS ── */}
            {tab === 'facturas' && (
              facturasFiltradas.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground gap-4">
                  <IconReceipt className="h-20 w-20 opacity-10" />
                  <p className="font-black text-[10px] uppercase tracking-[0.3em] opacity-30">Sin facturas registradas</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-muted/30 border-b border-border/40">
                        <th className="px-8 py-5 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Folio</th>
                        <th className="px-8 py-5 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Cliente</th>
                        <th className="px-8 py-5 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Fecha Emision</th>
                        <th className="px-8 py-5 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Estatus</th>
                        <th className="px-8 py-5 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] text-right">Monto Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {facturasFiltradas.map(f => (
                        <tr key={f.id} className="hover:bg-emerald-500/[0.02] transition-colors">
                          <td className="px-8 py-5 font-black text-emerald-600 tracking-tighter text-sm">{f.folio || f.id.slice(0, 8).toUpperCase()}</td>
                          <td className="px-8 py-5 font-bold text-sm text-slate-800">{f.cliente?.nombre || '—'}</td>
                          <td className="px-8 py-5 text-xs text-muted-foreground">
                            {f.fecha_emision ? new Date(f.fecha_emision).toLocaleDateString('es-MX') : '—'}
                          </td>
                          <td className="px-8 py-5"><EstatusBadge estatus={f.estatus} /></td>
                          <td className="px-8 py-5 text-right">
                            <span className="font-mono font-black text-base text-slate-900">
                              {f.monto_total !== undefined
                                ? `$${f.monto_total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
                                : '—'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
};
