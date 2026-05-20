import React, { useEffect, useState, useMemo } from 'react';
import api from '../lib/api';
import { useTenant } from '../context/TenantContext';
import {
  IconBriefcase,
  IconSearch,
  IconAlertCircle,
  IconRefreshCw,
  IconDownload,
  IconLayers,
  IconFileText,
} from '../components/Icons';
import { cn } from '../lib/utils';

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface Concepto {
  id: string;
  clave: string;
  descripcion: string;
  unidad_medida: string;
  cantidad: number;
  precio_unitario: number;
  importe: number;
}

interface Presupuesto {
  id: string;
  proyecto_id: string;
  version: number;
  estado: 'BORRADOR' | 'EN_REVISION' | 'LIBERADO' | 'CONGELADO';
  importe_total: number;
  conceptos: Concepto[];
  created_at: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatMXN = (n: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);

const ESTADO_BADGE: Record<string, string> = {
  BORRADOR:    'bg-amber-500/10 text-amber-600 border-amber-500/20',
  EN_REVISION: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  LIBERADO:    'bg-green-500/10 text-green-600 border-green-500/20',
  CONGELADO:   'bg-slate-500/10 text-slate-500 border-slate-500/20',
};

// ─── Componente ──────────────────────────────────────────────────────────────

export const InsumosView: React.FC = () => {
  const { tenant } = useTenant();
  const [presupuesto, setPresupuesto] = useState<Presupuesto | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [search, setSearch]           = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (tenant?.id === 'iretum-demo') {
        setPresupuesto(null);
        return;
      }
      const res = await api.get('/api/v1/gerencia-tecnica/presupuestos');
      const lista: Presupuesto[] = res.data.data || [];
      // Tomar el presupuesto más reciente
      setPresupuesto(lista.length > 0 ? lista[0] : null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error de conexión con el módulo de Gerencia Técnica.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const conceptosFiltrados = useMemo(() => {
    if (!presupuesto) return [];
    if (!search.trim()) return presupuesto.conceptos;
    const q = search.toLowerCase();
    return presupuesto.conceptos.filter(c =>
      c.clave.toLowerCase().includes(q) ||
      c.descripcion.toLowerCase().includes(q) ||
      c.unidad_medida.toLowerCase().includes(q)
    );
  }, [presupuesto, search]);

  const importeFiltrado = useMemo(
    () => conceptosFiltrados.reduce((s, c) => s + Number(c.importe), 0),
    [conceptosFiltrados]
  );

  // ── Estado vacío: sin presupuesto cargado ─────────────────────────────────
  const renderVacio = () => (
    <div className="flex flex-col items-center justify-center h-[500px] gap-6 text-center px-8">
      <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center">
        <IconFileText className="h-10 w-10 text-primary opacity-60" />
      </div>
      <div>
        <p className="text-sm font-black uppercase tracking-widest text-foreground">Sin catálogo cargado</p>
        <p className="mt-2 text-xs text-muted-foreground max-w-xs leading-relaxed">
          Exporta el catálogo de conceptos desde OPUS y súbelo aquí para activar este módulo.
        </p>
      </div>
      <button className="px-6 py-3 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center gap-2">
        <IconDownload className="h-4 w-4" />
        Importar desde OPUS
      </button>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">

      {/* ── Encabezado ── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Gerencia Técnica
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/10 bg-primary/10 shadow-inner">
              <IconBriefcase className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter text-foreground">
                Catálogo de Obra
              </h1>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Conceptos de obra · Presupuesto base del proyecto
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={fetchData}
            className="p-3 rounded-xl border border-border/60 bg-card hover:bg-muted/60 transition-all shadow-sm active:scale-90"
            title="Refrescar"
          >
            <IconRefreshCw className={cn('h-4 w-4 text-muted-foreground', loading && 'animate-spin')} />
          </button>
          <button className="flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all">
            <IconDownload className="h-4 w-4" />
            Importar OPUS
          </button>
        </div>
      </div>

      {/* ── Stats del presupuesto ── */}
      {presupuesto && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Conceptos',  value: presupuesto.conceptos.length.toString(),   color: 'text-foreground' },
            { label: 'Importe Total',    value: formatMXN(Number(presupuesto.importe_total)), color: 'text-primary' },
            { label: 'Versión',          value: `v${presupuesto.version}`,                color: 'text-foreground' },
            { label: 'Estado',           value: presupuesto.estado,                       color: 'text-foreground', badge: true },
          ].map(stat => (
            <div key={stat.label} className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</p>
              {stat.badge ? (
                <span className={cn('mt-2 inline-block rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider', ESTADO_BADGE[stat.value] || ESTADO_BADGE.BORRADOR)}>
                  {stat.value}
                </span>
              ) : (
                <p className={cn('mt-1 text-xl font-black tracking-tighter truncate', stat.color)}>{stat.value}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Barra de búsqueda ── */}
      {presupuesto && (
        <div className="flex flex-col sm:flex-row gap-3 bg-card rounded-2xl border border-border/40 p-4 shadow-sm">
          <div className="relative flex-1 group">
            <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por clave, descripción o unidad..."
              className="w-full pl-11 pr-4 py-3 bg-muted/30 border border-transparent rounded-xl text-xs font-semibold focus:ring-4 focus:ring-primary/10 focus:border-primary/40 focus:bg-background transition-all"
            />
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-4 px-2">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              {conceptosFiltrados.length} conceptos
            </span>
            <span className="text-sm font-black text-primary tracking-tighter">
              {formatMXN(importeFiltrado)}
            </span>
          </div>
        </div>
      )}

      {/* ── Tabla ── */}
      <div className="bg-card rounded-3xl border border-border/40 shadow-xl overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[400px] gap-6">
            <div className="h-12 w-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] animate-pulse">
              Cargando catálogo...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-[400px] p-8 text-center max-w-md mx-auto gap-6">
            <div className="h-16 w-16 bg-destructive/10 rounded-2xl flex items-center justify-center">
              <IconAlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <h3 className="font-black text-base text-foreground uppercase tracking-tighter">Error de conexión</h3>
              <p className="text-muted-foreground mt-2 text-xs leading-relaxed">{error}</p>
            </div>
            <button
              onClick={fetchData}
              className="px-6 py-3 bg-foreground text-background rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
            >
              Reintentar
            </button>
          </div>
        ) : !presupuesto ? (
          renderVacio()
        ) : conceptosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] gap-4">
            <IconLayers className="h-16 w-16 text-muted-foreground opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">
              Sin resultados para "{search}"
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border/40 bg-muted/30">
                  <th className="px-6 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Clave</th>
                  <th className="px-6 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Descripción</th>
                  <th className="px-6 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] text-center">Unidad</th>
                  <th className="px-6 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] text-right">Cantidad</th>
                  <th className="px-6 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] text-right">P.U.</th>
                  <th className="px-6 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] text-right">Importe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {conceptosFiltrados.map((c) => (
                  <tr key={c.id} className="hover:bg-primary/[0.02] transition-colors group">
                    <td className="px-6 py-4 font-black text-primary tracking-tighter text-sm whitespace-nowrap">
                      {c.clave}
                    </td>
                    <td className="px-6 py-4 max-w-sm">
                      <span className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
                        {c.descripcion}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block rounded-lg bg-muted px-2.5 py-1 text-[10px] font-black uppercase tracking-tight text-muted-foreground">
                        {c.unidad_medida}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-sm text-foreground">
                      {Number(c.cantidad).toLocaleString('es-MX', { maximumFractionDigits: 4 })}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-sm text-foreground">
                      {formatMXN(Number(c.precio_unitario))}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-mono font-black text-sm text-primary">
                        {formatMXN(Number(c.importe))}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border/60 bg-muted/20">
                  <td colSpan={5} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">
                    Total {search ? `(filtrado)` : `(${conceptosFiltrados.length} conceptos)`}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-mono font-black text-base text-primary">
                      {formatMXN(importeFiltrado)}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
