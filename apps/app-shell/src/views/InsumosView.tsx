import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { 
  IconPackage, 
  IconSearch, 
  IconFilter, 
  IconAlertCircle, 
  IconRefreshCw 
} from '../components/Icons';
import { cn } from '../lib/utils';

interface Insumo {
  id: string;
  clave: string;
  descripcion: string;
  unidad: string;
  costo: number;
  clase: string;
}

export const InsumosView: React.FC = () => {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsumos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/insumos');
      setInsumos(response.data.data || []);
    } catch (err: any) {
      console.error('Error fetching insumos:', err);
      setError(err.response?.data?.message || 'Error de conexión con el módulo de Gerencia Técnica.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsumos();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
              <IconPackage className="h-6 w-6 text-indigo-500" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">
              Catálogo de Insumos
            </h1>
          </div>
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest ml-14">
            Gerencia Técnica • Gestión SSOT de Materiales
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchInsumos}
            className="p-3 rounded-xl border border-border/60 bg-card hover:bg-slate-50 transition-all shadow-sm active:scale-90"
            title="Refrescar datos"
          >
            <IconRefreshCw className={cn("h-5 w-5 text-muted-foreground", loading && "animate-spin")} />
          </button>
          <button className="px-6 py-3 bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
            Nuevo Recurso
          </button>
        </div>
      </div>

      {/* Barra de Herramientas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-card p-4 rounded-2xl border border-border/40 shadow-sm">
        <div className="md:col-span-2 relative group">
          <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <input 
            type="text" 
            placeholder="BUSCAR POR CLAVE O DESCRIPCIÓN..." 
            className="w-full pl-12 pr-4 py-3 bg-muted/30 border border-transparent rounded-xl text-xs font-bold tracking-tight focus:ring-4 focus:ring-primary/10 focus:border-primary/40 focus:bg-background transition-all"
          />
        </div>
        <div className="flex items-center gap-3 px-4 py-3 bg-muted/30 rounded-xl border border-transparent hover:border-border/40 cursor-pointer transition-all group">
          <IconFilter className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground">Filtrar Clase: TODOS</span>
        </div>
        <div className="hidden md:flex items-center justify-end px-4">
           <div className="flex flex-col items-end">
             <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">Total Registros</span>
             <span className="text-xl font-black tracking-tighter text-primary">{insumos.length}</span>
           </div>
        </div>
      </div>

      {/* Grid de Resultados */}
      <div className="bg-card rounded-3xl border border-border/40 shadow-xl overflow-hidden min-h-[500px] backdrop-blur-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[500px] gap-6">
            <div className="h-12 w-12 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] animate-pulse">Sincronizando con Gerencia Técnica...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-[500px] p-8 text-center max-w-md mx-auto">
            <div className="h-20 w-20 bg-destructive/10 rounded-2xl flex items-center justify-center mb-6">
              <IconAlertCircle className="h-10 w-10 text-destructive" />
            </div>
            <h3 className="font-black text-lg text-slate-900 uppercase tracking-tighter">Falla de Microservicio</h3>
            <p className="text-muted-foreground mt-4 text-xs font-medium leading-relaxed">
              {error}. Verifica el aislamiento de red del módulo `gerencia-tecnica`.
            </p>
            <button 
              onClick={fetchInsumos}
              className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all"
            >
              Reintentar Pull
            </button>
          </div>
        ) : insumos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[500px] text-muted-foreground gap-4">
            <IconPackage className="h-20 w-20 opacity-10" />
            <p className="font-black text-[10px] uppercase tracking-[0.3em] opacity-30 italic">Catálogo Vacío</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted/30 border-b border-border/40">
                  <th className="px-8 py-5 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Clave SSOT</th>
                  <th className="px-8 py-5 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Descripción Técnica</th>
                  <th className="px-8 py-5 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Clasificación</th>
                  <th className="px-8 py-5 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Unidad</th>
                  <th className="px-8 py-5 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] text-right">Costo Unitario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {insumos.map((item) => (
                  <tr key={item.id} className="hover:bg-indigo-500/[0.02] transition-colors group">
                    <td className="px-8 py-6 font-black text-indigo-600 tracking-tighter text-sm">{item.clave}</td>
                    <td className="px-8 py-6">
                      <div className="font-bold text-sm text-slate-800 tracking-tight leading-snug">{item.descripcion}</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 text-[9px] font-black uppercase tracking-tighter">
                        {item.clase}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-muted-foreground font-bold text-[11px] uppercase tracking-tighter">{item.unidad}</td>
                    <td className="px-8 py-6 text-right">
                      <span className="font-mono font-black text-base text-slate-900">${item.costo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
