import React, { useEffect, useRef, useState } from 'react';
import { ventasApi } from '../lib/api';
import { useTenant } from '../context/TenantContext';
import { DEMO_CLIENTES, DEMO_COTIZACIONES, DEMO_FACTURAS } from '../lib/demoData';
import {
  IconRefreshCw,
  IconAlertCircle,
  IconSearch,
  IconUpload,
  IconCheckCircle2,
} from '../components/Icons';
import { cn } from '../lib/utils';
import { TableScrollShadow } from '../components/TableScrollShadow';
import { SlidePanel } from '../components/SlidePanel';
import { leerColumnaCsv, parseCsvOrExcelFile } from '../lib/csvImport';

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

// ─── Importación masiva de Clientes (CSV/Excel) ───────────────────────────────
// Mismas reglas que POST /clientes en apps/ventas/src/main.ts:53-54.
const CODIGO_CLIENTE_PATTERN = /^\d{3}$/;
const CODIGO_CLIENTE_MAX = 50;

interface ClienteImportRow {
  rfc_tax_id: string;
  razon_social: string;
  email_contacto: string;
  telefono: string;
  codigo_cliente: string;
  _valido: boolean;
  _error?: string;
}

// Validación cliente-side equivalente a la del backend (1.4) — solo para la
// vista previa; el backend re-valida y es la fuente de verdad del resultado.
function construirPreviewImportClientes(rows: Record<string, string>[]): ClienteImportRow[] {
  const ocurrenciasPorRfc = new Map<string, number>();
  rows.forEach(row => {
    const rfc = leerColumnaCsv(row, 'rfc_tax_id', 'rfc');
    if (!rfc) return;
    ocurrenciasPorRfc.set(rfc, (ocurrenciasPorRfc.get(rfc) || 0) + 1);
  });

  return rows.map(row => {
    const rfc_tax_id = leerColumnaCsv(row, 'rfc_tax_id', 'rfc');
    const razon_social = leerColumnaCsv(row, 'razon_social', 'nombre');
    const email_contacto = leerColumnaCsv(row, 'email_contacto', 'email');
    const telefono = leerColumnaCsv(row, 'telefono');
    const codigo_cliente = leerColumnaCsv(row, 'codigo_cliente', 'codigo');

    const errores: string[] = [];
    if (!rfc_tax_id) errores.push('sin rfc_tax_id');
    if (!razon_social) errores.push('sin razon_social');
    if (codigo_cliente && (!CODIGO_CLIENTE_PATTERN.test(codigo_cliente) || Number(codigo_cliente) > CODIGO_CLIENTE_MAX)) {
      errores.push('codigo_cliente inválido');
    }
    if (rfc_tax_id && (ocurrenciasPorRfc.get(rfc_tax_id) || 0) > 1) {
      errores.push('RFC duplicado en el archivo');
    }

    return {
      rfc_tax_id, razon_social, email_contacto, telefono, codigo_cliente,
      _valido: errores.length === 0,
      _error: errores.length ? errores.join(', ') : undefined,
    };
  });
}

// ─── Badge de estatus ─────────────────────────────────────────────────────────
const EstatusBadge: React.FC<{ estatus: string }> = ({ estatus }) => {
  const colores: Record<string, string> = {
    BORRADOR:   'bg-muted text-muted-foreground border-border',
    ENVIADA:    'bg-blue-500/10 text-blue-600 border-blue-500/20',
    ACEPTADA:   'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    RECHAZADA:  'bg-red-500/10 text-red-600 border-red-500/20',
    EMITIDA:    'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
    PAGADA:     'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    CANCELADA:  'bg-red-500/10 text-red-600 border-red-500/20',
    VENCIDA:    'bg-amber-500/10 text-amber-600 border-amber-500/20',
  };
  return (
    <span className={cn(
      'px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-tighter',
      colores[estatus] ?? 'bg-muted text-muted-foreground border-border'
    )}>
      {estatus}
    </span>
  );
};

// ─── Componente principal ─────────────────────────────────────────────────────
export const VentasView: React.FC = () => {
  const { tenant, user } = useTenant();
  const [tab, setTab] = useState<TabKey>('clientes');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');

  // ── Importación masiva de Clientes (admin-only, mismo rol que el endpoint) ──
  const rolesUsuario: string[] = user?.role ?? [];
  const esAdmin = rolesUsuario.includes('admin');
  const fileImportRef = useRef<HTMLInputElement>(null);
  const [panelImportar, setPanelImportar] = useState(false);
  const [archivoImportNombre, setArchivoImportNombre] = useState('');
  const [filasImport, setFilasImport] = useState<ClienteImportRow[]>([]);
  const [parseImportError, setParseImportError] = useState<string | null>(null);
  const [importando, setImportando] = useState(false);
  const [resultadoImport, setResultadoImport] = useState<{ creados: number; errores: { fila: number; motivo: string }[] } | null>(null);

  const fetchData = async (t: TabKey = tab) => {
    setLoading(true);
    setError(null);
    try {
      if (tenant?.id === 'iretum-demo') { setClientes(DEMO_CLIENTES as Cliente[]); setCotizaciones(DEMO_COTIZACIONES as Cotizacion[]); setFacturas(DEMO_FACTURAS as Factura[]); return; }
      if (t === 'clientes') {
        const r = await ventasApi.getClientes();
        // El backend devuelve las columnas reales del schema
        // (razon_social, rfc_tax_id, email_contacto) — normalizar al
        // shape de Cliente que el filtro/render de este componente ya
        // esperan (mismo shape que DEMO_CLIENTES). Ver
        // openspec/changes/fix-ventas-clientes-render-campos-backend.
        const clientesBackend: any[] = r.data.data || [];
        setClientes(clientesBackend.map(c => ({
          id: c.id_cliente,
          nombre: c.razon_social,
          rfc: c.rfc_tax_id,
          email: c.email_contacto,
          telefono: c.telefono,
        })));
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

  // ── Importación masiva de Clientes ────────────────────────────────────────
  const handleImportFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setArchivoImportNombre(file.name);
    setParseImportError(null);
    setResultadoImport(null);
    setPanelImportar(true);

    try {
      const rows = await parseCsvOrExcelFile(file);
      setFilasImport(construirPreviewImportClientes(rows));
    } catch (err: any) {
      setParseImportError(err.message || 'Error al leer el archivo.');
      setFilasImport([]);
    }
  };

  const handleConfirmarImport = async () => {
    setImportando(true);
    try {
      const registros = filasImport.map(({ rfc_tax_id, razon_social, email_contacto, telefono, codigo_cliente }) => ({
        rfc_tax_id,
        razon_social,
        ...(email_contacto ? { email_contacto } : {}),
        ...(telefono ? { telefono } : {}),
        ...(codigo_cliente ? { codigo_cliente } : {}),
      }));
      const r = await ventasApi.importarClientesLote(registros);
      setResultadoImport(r.data.data);
      if (r.data.data.creados > 0) {
        await fetchData('clientes');
      }
    } catch (err: any) {
      setParseImportError(err.response?.data?.message || 'Error al importar el lote.');
    } finally {
      setImportando(false);
    }
  };

  const handleCerrarPanelImportar = () => {
    setPanelImportar(false);
    setArchivoImportNombre('');
    setFilasImport([]);
    setParseImportError(null);
    setResultadoImport(null);
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
            <h1 className="text-xl md:text-3xl font-black tracking-tighter text-foreground uppercase">
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
            className="p-3 rounded-xl border border-border/60 bg-card hover:bg-muted/50 transition-all shadow-sm active:scale-90"
            title="Refrescar datos"
          >
            <IconRefreshCw className={cn('h-5 w-5 text-muted-foreground', loading && 'animate-spin')} />
          </button>
          {tab === 'clientes' && esAdmin && (
            <>
              <input
                ref={fileImportRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={handleImportFileChange}
              />
              <button
                onClick={() => fileImportRef.current?.click()}
                className="px-6 py-3 bg-card border border-border/60 text-foreground text-xs font-black uppercase tracking-widest rounded-xl shadow-sm hover:bg-muted/50 transition-all flex items-center gap-2"
              >
                <IconUpload className="h-4 w-4" />
                Importar CSV/Excel
              </button>
            </>
          )}
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
            <h3 className="font-black text-lg text-foreground uppercase tracking-tighter">Error de Conexion</h3>
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
                <TableScrollShadow>
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
                          <td className="px-8 py-5 font-black text-sm text-foreground tracking-tight">{c.nombre}</td>
                          <td className="px-8 py-5 font-mono text-xs text-muted-foreground">{c.rfc || '—'}</td>
                          <td className="px-8 py-5 text-xs text-muted-foreground">{c.email || '—'}</td>
                          <td className="px-8 py-5 text-xs text-muted-foreground">{c.telefono || '—'}</td>
                          <td className="px-8 py-5">
                            <span className="px-2.5 py-1 rounded-lg bg-muted text-muted-foreground border border-border text-[9px] font-black uppercase tracking-tighter">
                              {c.tipo || 'CLIENTE'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TableScrollShadow>
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
                <TableScrollShadow>
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
                          <td className="px-8 py-5 font-bold text-sm text-foreground">{c.cliente?.nombre || '—'}</td>
                          <td className="px-8 py-5 text-xs text-muted-foreground max-w-xs truncate">{c.descripcion || '—'}</td>
                          <td className="px-8 py-5"><EstatusBadge estatus={c.estatus} /></td>
                          <td className="px-8 py-5 text-right">
                            <span className="font-mono font-black text-base text-foreground">
                              {c.monto_total !== undefined
                                ? `$${c.monto_total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
                                : '—'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TableScrollShadow>
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
                <TableScrollShadow>
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
                          <td className="px-8 py-5 font-bold text-sm text-foreground">{f.cliente?.nombre || '—'}</td>
                          <td className="px-8 py-5 text-xs text-muted-foreground">
                            {f.fecha_emision ? new Date(f.fecha_emision).toLocaleDateString('es-MX') : '—'}
                          </td>
                          <td className="px-8 py-5"><EstatusBadge estatus={f.estatus} /></td>
                          <td className="px-8 py-5 text-right">
                            <span className="font-mono font-black text-base text-foreground">
                              {f.monto_total !== undefined
                                ? `$${f.monto_total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
                                : '—'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TableScrollShadow>
              )
            )}
          </>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* PANEL: Importación masiva de Clientes (CSV/Excel)                    */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <SlidePanel
        isOpen={panelImportar}
        onClose={handleCerrarPanelImportar}
        title={resultadoImport ? 'Resultado de la importación' : 'Vista previa — Importación de Clientes'}
        subtitle={archivoImportNombre}
        accentColor="emerald"
        maxWidthClassName="max-w-4xl"
      >
        <div className="space-y-6 pb-28">
          {parseImportError ? (
            <div className="rounded-xl bg-destructive/5 border border-destructive/20 p-4 flex gap-3">
              <IconAlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-destructive">{parseImportError}</p>
            </div>
          ) : resultadoImport ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
                  <p className="text-2xl font-black text-emerald-600">{resultadoImport.creados}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600/70 mt-1">Clientes creados</p>
                </div>
                <div className={cn('rounded-2xl p-4 text-center border', resultadoImport.errores.length > 0 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-muted/30 border-border/30')}>
                  <p className={cn('text-2xl font-black', resultadoImport.errores.length > 0 ? 'text-amber-600' : 'text-muted-foreground')}>{resultadoImport.errores.length}</p>
                  <p className={cn('text-[9px] font-black uppercase tracking-widest mt-1', resultadoImport.errores.length > 0 ? 'text-amber-600/70' : 'text-muted-foreground')}>Filas con error</p>
                </div>
              </div>

              {resultadoImport.errores.length > 0 && (
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
                        {resultadoImport.errores.map((e, i) => (
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
                  <p className="text-2xl font-black text-emerald-600">{filasImport.filter(f => f._valido).length}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600/70 mt-1">Listos para importar</p>
                </div>
                <div className={cn('rounded-2xl p-4 text-center border', filasImport.some(f => !f._valido) ? 'bg-amber-500/10 border-amber-500/20' : 'bg-muted/30 border-border/30')}>
                  <p className={cn('text-2xl font-black', filasImport.some(f => !f._valido) ? 'text-amber-600' : 'text-muted-foreground')}>{filasImport.filter(f => !f._valido).length}</p>
                  <p className={cn('text-[9px] font-black uppercase tracking-widest mt-1', filasImport.some(f => !f._valido) ? 'text-amber-600/70' : 'text-muted-foreground')}>Con error</p>
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
                        <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Codigo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {filasImport.map((row, i) => (
                        <tr key={i} className={cn('transition-colors', row._valido ? 'hover:bg-emerald-500/[0.03]' : 'bg-amber-500/5 opacity-60')}>
                          <td className="px-4 py-2.5 text-center">
                            {row._valido
                              ? <IconCheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                              : <span className="text-[9px] text-amber-600 font-bold" title={row._error}>error</span>
                            }
                          </td>
                          <td className="px-4 py-2.5 font-mono text-muted-foreground">{row.rfc_tax_id || '—'}</td>
                          <td className="px-4 py-2.5 font-bold text-foreground">{row.razon_social || '—'}</td>
                          <td className="px-4 py-2.5 text-muted-foreground">{row.codigo_cliente || '—'}</td>
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
          {resultadoImport || parseImportError ? (
            <button
              onClick={handleCerrarPanelImportar}
              className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all"
            >
              Cerrar
            </button>
          ) : (
            <>
              <button
                onClick={handleCerrarPanelImportar}
                className="px-5 py-2.5 rounded-xl border border-border/60 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarImport}
                disabled={importando || filasImport.length === 0}
                className="px-6 py-3 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-600/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {importando ? 'Importando...' : `Importar ${filasImport.length} registro${filasImport.length === 1 ? '' : 's'}`}
              </button>
            </>
          )}
        </div>
      </SlidePanel>
    </div>
  );
};
