import React, { useEffect, useState } from 'react';
import { ShoppingCart, Plus, FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import api from '../lib/api';

interface Requisicion {
  id_requisicion: string;
  codigo: string;
  fecha_solicitud: string;
  prioridad: string;
  estado: string;
  items: any[];
}

export const ComprasView: React.FC = () => {
  const [requisiciones, setRequisiciones] = useState<Requisicion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequisiciones = async () => {
      try {
        setLoading(true);
        // El puerto 3002 es donde corre el módulo de compras en el docker-compose
        // Usamos la URL base configurada en el proxy o directa si es dev
        const response = await api.get('/compras/requisiciones');
        setRequisiciones(response.data.data);
      } catch (err: any) {
        console.error('Error fetching requisiciones:', err);
        setError('No se pudo conectar con el módulo de Compras. Asegúrate de que el microservicio esté activo.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequisiciones();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'BORRADOR': return <FileText className="h-4 w-4 text-slate-400" />;
      case 'PENDIENTE': return <Clock className="h-4 w-4 text-amber-500" />;
      case 'APROBADA': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default: return <AlertCircle className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-primary" />
            Compras y Procuración
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestión de requisiciones de materiales, comparativas y órdenes de compra por centro de costos.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-primary/90 transition-all">
          <Plus className="h-4 w-4" />
          Nueva Requisición
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card p-6 rounded-xl border shadow-sm">
          <span className="text-sm font-medium text-muted-foreground">Requisiciones Pendientes</span>
          <div className="text-3xl font-bold mt-2">12</div>
        </div>
        <div className="bg-card p-6 rounded-xl border shadow-sm">
          <span className="text-sm font-medium text-muted-foreground">OC en Tránsito</span>
          <div className="text-3xl font-bold mt-2">5</div>
        </div>
        <div className="bg-card p-6 rounded-xl border shadow-sm">
          <span className="text-sm font-medium text-muted-foreground">Ahorro vs Presupuesto</span>
          <div className="text-3xl font-bold mt-2 text-green-600">8.5%</div>
        </div>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-500">Requisiciones Recientes</h3>
          <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-full font-bold">LIVE FEED</span>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-4">
            <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            <p className="text-sm text-muted-foreground font-medium italic">Consultando Procuración...</p>
          </div>
        ) : error ? (
          <div className="p-12 flex flex-col items-center justify-center text-center gap-4">
            <div className="h-12 w-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="max-w-xs">
              <h4 className="font-bold text-slate-900">Error de Conexión</h4>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-muted/30 text-[11px] font-bold text-muted-foreground uppercase tracking-widest border-b">
                <tr>
                  <th className="px-6 py-4">Código</th>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Prioridad</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {requisiciones.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic">
                      No hay requisiciones registradas en este centro de costos.
                    </td>
                  </tr>
                ) : (
                  requisiciones.map((req) => (
                    <tr key={req.id_requisicion} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-primary">{req.codigo}</td>
                      <td className="px-6 py-4 text-slate-500">{new Date(req.fecha_solicitud).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          req.prioridad === 'URGENTE' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {req.prioridad}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(req.estado)}
                          <span className="font-medium">{req.estado}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium">
                        {req.items?.length || 0} pzas
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-primary hover:underline font-semibold text-xs border border-primary/20 px-3 py-1 rounded-md bg-white shadow-sm">
                          Ver Detalle
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
