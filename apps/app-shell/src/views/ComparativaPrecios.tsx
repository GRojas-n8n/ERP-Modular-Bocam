import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import {
  IconScale,
  IconAlertCircle,
  IconPlus,
  IconFileText,
} from '../components/Icons';
import { cn } from '../lib/utils';

interface Comparativa {
  id: string;
  folio: string;
  fecha: string;
  titulo: string;
  estado: string;
  requisicion_folio: string;
}

export const ComparativaPrecios: React.FC = () => {
  const [comparativas, setComparativas] = useState<Comparativa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComparativas = async () => {
      try {
        setLoading(true);
        const response = await api.get('/compras/comparativas');
        setComparativas(response.data.data || []);
      } catch (err: any) {
        console.error('Error fetching comparativas:', err);
        setError('Error al conectar con el mÃ³dulo de ProcuraciÃ³n.');
      } finally {
        setLoading(false);
      }
    };

    fetchComparativas();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <div className="mb-2 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/5 bg-amber-500/10">
              <IconScale className="h-7 w-7 text-amber-600" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">
                Cuadros Comparativos
              </h1>
              <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                AnÃ¡lisis de Ofertas y SelecciÃ³n de Proveedores
              </p>
            </div>
          </div>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-slate-900/20 transition-all hover:bg-slate-800 active:scale-95">
          <IconPlus className="h-4 w-4" />
          Nueva Comparativa
        </button>
      </div>

      {loading ? (
        <div className="flex h-96 flex-col items-center justify-center gap-4 text-center">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-amber-500/10" />
            <div className="absolute inset-0 rounded-full border-4 border-t-amber-600 animate-spin" />
          </div>
          <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">
            Analizando Matriz de Ofertas...
          </p>
        </div>
      ) : error ? (
        <div className="space-y-4 rounded-3xl border border-destructive/20 bg-destructive/5 p-12 text-center">
          <IconAlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h3 className="text-xl font-black tracking-tighter text-destructive uppercase">Falla de Suministros</h3>
          <p className="mx-auto max-w-sm text-xs font-medium text-muted-foreground">{error}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-border/40 bg-card shadow-xl backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full text-left">
              <thead>
                <tr className="border-b border-border/40 bg-muted/30">
                  <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground md:px-8 md:py-5">
                    Folio / Fecha
                  </th>
                  <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground md:px-8 md:py-5">
                    TÃ­tulo del AnÃ¡lisis
                  </th>
                  <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground md:px-8 md:py-5">
                    Ref. RequisiciÃ³n
                  </th>
                  <th className="px-4 py-4 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground md:px-8 md:py-5">
                    Estado
                  </th>
                  <th className="px-4 py-4 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground md:px-8 md:py-5">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {comparativas.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-16 text-center md:px-8 md:py-20">
                      <div className="flex flex-col items-center opacity-40">
                        <IconScale className="mb-4 h-12 w-12" />
                        <p className="text-sm font-bold uppercase tracking-widest">Sin cuadros comparativos</p>
                        <p className="mt-1 text-[10px] font-medium">
                          No se han generado anÃ¡lisis de ofertas para este periodo.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  comparativas.map((comp) => (
                    <tr key={comp.id} className="group transition-colors hover:bg-amber-500/[0.02]">
                      <td className="px-4 py-5 md:px-8 md:py-6">
                        <div className="flex flex-col">
                          <span className="font-black tracking-tighter text-slate-900">{comp.folio}</span>
                          <span className="text-[10px] font-bold text-muted-foreground">
                            {new Date(comp.fecha).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-5 md:px-8 md:py-6">
                        <span className="text-sm font-bold text-slate-800">{comp.titulo}</span>
                      </td>
                      <td className="px-4 py-5 md:px-8 md:py-6">
                        <span className="rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600">
                          REQ: {comp.requisicion_folio}
                        </span>
                      </td>
                      <td className="px-4 py-5 text-center md:px-8 md:py-6">
                        <div className="flex items-center justify-center gap-2">
                          <span
                            className={cn(
                              'h-2 w-2 rounded-full',
                              comp.estado === 'AUTORIZADO'
                                ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'
                                : 'bg-amber-500'
                            )}
                          />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                            {comp.estado}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-5 text-right md:px-8 md:py-6">
                        <button className="rounded-xl border border-border/20 bg-muted/50 p-2.5 transition-all hover:bg-primary/10 hover:text-primary">
                          <IconFileText className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
