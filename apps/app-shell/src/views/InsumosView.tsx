import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Package, Search, Filter, AlertCircle, RefreshCw } from 'lucide-react';
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
      // La estructura de respuesta de BOCAM es { success: true, data: [...], meta: {...} }
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            Catálogo de Insumos
          </h1>
          <p className="text-muted-foreground text-sm">
            Gestión centralizada de recursos para presupuestos y compras.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchInsumos}
            className="p-2 rounded-md border hover:bg-muted transition-colors"
            title="Refrescar datos"
          >
            <RefreshCw className={cn("h-4 w-4 text-muted-foreground", loading && "animate-spin")} />
          </button>
          <button className="px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg shadow-sm hover:translate-y-[-1px] transition-all">
            Nuevo Insumo
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Buscar por clave o descripción..." 
            className="w-full pl-10 pr-4 py-2 bg-muted/50 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg text-sm text-muted-foreground cursor-pointer">
          <Filter className="h-4 w-4" />
          Filtrar por Clase: Todos
        </div>
        <div className="text-right text-xs text-muted-foreground flex items-center justify-end font-medium uppercase tracking-tighter">
          Total Insumos: {insumos.length}
        </div>
      </div>

      {/* Tabla de Resultados */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
            <div className="h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-sm text-muted-foreground animate-pulse font-medium">Consultando microservicio a través del RLS Gateway...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-[400px] p-8 text-center">
            <div className="h-12 w-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="font-bold text-lg text-foreground">Error de Comunicación</h3>
            <p className="text-muted-foreground max-w-sm mt-2 text-sm">
              {error}. Asegúrate de que el módulo `gerencia-tecnica` esté activo en el puerto 3001.
            </p>
            <button 
              onClick={fetchInsumos}
              className="mt-6 px-4 py-2 border rounded-lg text-sm font-bold hover:bg-muted transition-colors"
            >
              Reintentar Conexión
            </button>
          </div>
        ) : insumos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
            <Package className="h-12 w-12 mb-4 opacity-20" />
            <p className="font-medium text-sm italic">No se encontraron insumos para este centro de costos.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground font-bold uppercase text-[10px] tracking-widest border-b border-border">
              <tr>
                <th className="px-6 py-4">Clave</th>
                <th className="px-6 py-4">Descripción</th>
                <th className="px-6 py-4">Clase</th>
                <th className="px-6 py-4">Unidad</th>
                <th className="px-6 py-4 text-right">Costo Unitario</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {insumos.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-6 py-4 font-bold text-primary">{item.clave}</td>
                  <td className="px-6 py-4 font-medium text-foreground">{item.descripcion}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold uppercase">
                      {item.clase}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{item.unidad}</td>
                  <td className="px-6 py-4 text-right font-mono font-bold">
                    ${item.costo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
