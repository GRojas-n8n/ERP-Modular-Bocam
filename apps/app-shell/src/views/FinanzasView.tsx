import React, { useEffect, useState } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Filter,
  Download
} from 'lucide-react';
import api from '../lib/api';
import { cn } from '../lib/utils';

interface PagoProgramado {
  id_pago: string;
  concepto: string;
  beneficiario: string;
  monto_programado: number;
  fecha_programada: string;
  estado: string;
  referencia_modulo: string;
}

interface ResumenFinanciero {
  total_autorizado: number;
  total_ejercido: number;
  total_comprometido: number;
  total_disponible: number;
  porcentaje_ejercido: number;
}

export const FinanzasView: React.FC = () => {
  const [resumen, setResumen] = useState<ResumenFinanciero | null>(null);
  const [pagos, setPagos] = useState<PagoProgramado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Endpoints definidos en el backend de finanzas
        const [dashRes, pagosRes] = await Promise.all([
          api.get('/finanzas/dashboard'),
          api.get('/finanzas/pagos')
        ]);
        
        setResumen(dashRes.data.data.resumen_presupuestal);
        setPagos(pagosRes.data.data);
      } catch (err: any) {
        console.error('Error fetching finezas data:', err);
        setError('Error al conectar con el módulo de Finanzas Central.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'PAGADO':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">PAGADO</span>;
      case 'CANCELADO':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">CANCELADO</span>;
      case 'PENDIENTE':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">PENDIENTE</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">{estado}</span>;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            Flujo de Caja y Tesorería
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Control presupuestal en tiempo real y programación de egresos.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 bg-white border border-border px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-all shadow-sm">
            <Download className="h-4 w-4" />
            Exportar
          </button>
          <button className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all shadow-md">
            <Calendar className="h-4 w-4" />
            Nueva Programación
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-4">
          <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Sincronizando estados financieros...</p>
        </div>
      ) : error ? (
        <div className="bg-destructive/5 border border-destructive/20 p-8 rounded-2xl text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h3 className="text-lg font-bold text-destructive">Error de Sincronización</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">{error}</p>
        </div>
      ) : (
        <>
          {/* Métricas Principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Autorizado Total', value: resumen?.total_autorizado || 0, color: 'text-slate-900', icon: CheckCircle2 },
              { label: 'Comprometido (OCs)', value: resumen?.total_comprometido || 0, color: 'text-amber-600', icon: Clock },
              { label: 'Ejercido (Pagado)', value: resumen?.total_ejercido || 0, color: 'text-indigo-600', icon: ArrowDownRight },
              { label: 'Disponible', value: resumen?.total_disponible || 0, color: 'text-green-600', icon: TrendingUp },
            ].map((stat, i) => (
              <div key={i} className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-4">
                   <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-white transition-colors">
                     <stat.icon className={cn("h-5 w-5", stat.color)} />
                   </div>
                   {stat.label === 'Disponible' && (
                     <span className="text-[10px] font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                       {Math.round(( (resumen?.total_disponible || 0) / (resumen?.total_autorizado || 1) ) * 100)}% LIBRE
                     </span>
                   )}
                </div>
                <div className={cn("text-2xl font-bold tracking-tight", stat.color)}>
                  {formatCurrency(stat.value)}
                </div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mt-2">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Listado de Pagos Programados */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-bold text-lg text-slate-800">Programa de Pagos (Next 30 Days)</h3>
                <button className="text-primary text-xs font-bold hover:underline flex items-center gap-1">
                  <Filter className="h-3 w-3" /> Filtrar por Módulo
                </button>
              </div>

              <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-muted/30 border-b">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Fecha</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Concepto / Beneficiario</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Monto</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {pagos.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground italic">No hay pagos programados para este periodo.</td>
                        </tr>
                      ) : (
                        pagos.map((pago) => (
                          <tr key={pago.id_pago} className="hover:bg-slate-50/80 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-900">{new Date(pago.fecha_programada).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}</span>
                                <span className="text-[10px] text-muted-foreground uppercase">{pago.referencia_modulo}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="font-semibold text-sm truncate max-w-[200px]">{pago.concepto}</span>
                                <span className="text-xs text-muted-foreground truncate max-w-[200px]">{pago.beneficiario}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="font-mono font-bold text-slate-900">{formatCurrency(pago.monto_programado)}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {getStatusBadge(pago.estado)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Panel Lateral: Análisis de Flujo */}
            <div className="space-y-6">
              <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-12 w-12" />
                </div>
                <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Salida de Efectivo Proyectada</h4>
                <div className="text-3xl font-bold mb-4">
                  {formatCurrency(pagos.filter(p => p.estado === 'PENDIENTE').reduce((sum, p) => sum + Number(p.monto_programado), 0))}
                </div>
                <div className="space-y-3">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[65%]" />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                    Tienes <strong>{pagos.filter(p => p.estado === 'PENDIENTE').length} pagos</strong> pendientes que representan el <strong>65%</strong> de tu flujo semanal proyectado.
                  </p>
                </div>
              </div>

              <div className="bg-card border rounded-2xl p-6 space-y-4">
                <h4 className="font-bold text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  Alertas Financieras
                </h4>
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                    <div className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <p className="text-[11px] text-amber-800 font-medium">
                      El presupuesto de <strong>MATERIALES</strong> está al 85%. Considera transferencias si hay OC pendientes.
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-xl border border-green-100 flex gap-3">
                    <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
                    <p className="text-[11px] text-green-800 font-medium">
                      Se liberaron <strong>$3,712.58</strong> recientemente por cancelación de OC. Saldo actualizado.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
