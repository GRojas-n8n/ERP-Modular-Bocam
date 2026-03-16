import React, { useState, useEffect } from 'react';
import { Scale, CheckCircle2, AlertCircle, TrendingDown } from 'lucide-react';
import api from '../lib/api';

interface Comparativa {
  id_cuadro: string;
  codigo: string;
  fecha_creacion: string;
  estado: string;
  detalles: any[];
}

export const ComparativaPrecios: React.FC = () => {
  const [comparativas, setComparativas] = useState<Comparativa[]>([]);
  const [selectedCC, setSelectedCC] = useState<Comparativa | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComparativas = async () => {
      try {
        const res = await api.get('/compras/comparativas');
        setComparativas(res.data.data);
        if (res.data.data.length > 0) setSelectedCC(res.data.data[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchComparativas();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Scale className="h-6 w-6 text-primary" />
          Comparativa de Precios
        </h1>
        <p className="text-muted-foreground mt-1">Análisis de ofertas y selección de proveedores ganadores.</p>
      </div>

      {loading ? (
        <div className="p-12 text-center italic text-muted-foreground">Analizando ofertas...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Listado lateral */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2">Cuadros Abiertos</h3>
            {comparativas.map(cc => (
              <button
                key={cc.id_cuadro}
                onClick={() => setSelectedCC(cc)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selectedCC?.id_cuadro === cc.id_cuadro 
                    ? 'bg-primary/5 border-primary shadow-sm ring-1 ring-primary/20' 
                    : 'bg-card hover:bg-muted/50'
                }`}
              >
                <div className="font-bold text-sm text-primary">{cc.codigo}</div>
                <div className="text-[10px] text-muted-foreground mt-1 uppercase font-medium">
                  {new Date(cc.fecha_creacion).toLocaleDateString()} • {cc.estado}
                </div>
              </button>
            ))}
          </div>

          {/* Área de Comparación */}
          <div className="lg:col-span-3 space-y-6">
            {selectedCC ? (
              <>
                <div className="bg-card rounded-2xl border shadow-sm p-6 overflow-hidden relative">
                   <div className="absolute top-0 right-0 p-4">
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">
                        OPTIMIZACIÓN: -4.2% VS PPTO
                      </span>
                   </div>
                   
                   <h2 className="text-xl font-bold mb-6">Matriz de Decisión: {selectedCC.codigo}</h2>

                   <div className="overflow-x-auto">
                     <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="py-3 px-4 text-left text-xs font-bold text-muted-foreground uppercase">Proveedor</th>
                            <th className="py-3 px-4 text-center text-xs font-bold text-muted-foreground uppercase">Precio Unit.</th>
                            <th className="py-3 px-4 text-center text-xs font-bold text-muted-foreground uppercase">Entrega</th>
                            <th className="py-3 px-4 text-center text-xs font-bold text-muted-foreground uppercase">Estado</th>
                            <th className="py-3 px-4 text-right text-xs font-bold text-muted-foreground uppercase">Selección</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {selectedCC.detalles.map((det: any) => (
                            <tr key={det.id_detalle} className={`group hover:bg-muted/30 transition-colors ${det.es_ganador ? 'bg-green-50/30' : ''}`}>
                              <td className="py-4 px-4 font-semibold">{det.proveedor?.razon_social}</td>
                              <td className="py-4 px-4 text-center font-mono font-bold">${det.precio_ofertado}</td>
                              <td className="py-4 px-4 text-center text-sm text-muted-foreground">{det.tiempo_entrega}</td>
                              <td className="py-4 px-4 text-center">
                                {det.es_ganador ? (
                                  <span className="inline-flex items-center gap-1 text-green-600 font-bold text-[10px] bg-green-100 px-2 py-0.5 rounded-md">
                                    <CheckCircle2 className="h-3 w-3" /> GANADOR
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-medium text-slate-400">DESCARTADO</span>
                                )}
                              </td>
                              <td className="py-4 px-4 text-right">
                                {!det.es_ganador && (
                                  <button className="text-[11px] font-bold text-primary hover:underline border border-primary/20 px-3 py-1 rounded-md bg-white opacity-0 group-hover:opacity-100 transition-opacity">
                                    Seleccionar
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                     </table>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-500 shrink-0" />
                    <p className="text-xs text-blue-700 leading-relaxed font-medium">
                      El sistema recomienda a <strong>CEMEX</strong> por tener el mejor balance entre precio ($3,200) y tiempos de entrega (2 días).
                    </p>
                  </div>
                  <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ahorro Estimado</div>
                      <div className="text-xl font-bold flex items-center gap-2">
                        <TrendingDown className="h-5 w-5 text-green-400" />
                        $24,500.00
                      </div>
                    </div>
                    <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 transition-all">
                      Aprobar y Crear OC
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-muted-foreground italic border border-dashed rounded-2xl">
                Selecciona un cuadro comparativo para analizar
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
