import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { useTenant } from '../../context/TenantContext';
import { DEMO_MI_EQUIPO_RESIDENCIA } from '../../lib/demoData';
import { Card, CardContent, CardHeader, CardTitle, EmptyStatePanel } from '@bocam/ui-core';

interface EquipoEmpleado {
  id_empleado: string;
  nombre: string;
  numero_empleado: string;
  compartido: boolean;
  proyecto_actual_id: string | null;
}
interface EquipoCategoria {
  categoria: string;
  total: number;
  empleados: EquipoEmpleado[];
}

/**
 * Tab "Mi Equipo" de Residencia de Obra — ver
 * openspec/changes/split-residencia-view-tabs.
 */
export const EquipoTab: React.FC<{ active: boolean }> = ({ active }) => {
  const { tenant } = useTenant();
  const isDemo = tenant?.id === 'iretum-demo';

  const [equipoPorCategoria, setEquipoPorCategoria] = useState<EquipoCategoria[]>([]);
  const [loadingEquipo, setLoadingEquipo] = useState(false);

  useEffect(() => {
    if (isDemo) {
      setEquipoPorCategoria(DEMO_MI_EQUIPO_RESIDENCIA as EquipoCategoria[]);
    }
  }, [isDemo]);

  useEffect(() => {
    if (!active || isDemo) return;
    setLoadingEquipo(true);
    api.get('/api/v1/personal/mis-empleados/resumen')
      .then(r => setEquipoPorCategoria((r.data as any)?.data?.por_categoria ?? []))
      .catch(() => { /* silencioso */ })
      .finally(() => setLoadingEquipo(false));
  }, [active, isDemo]);

  if (!active) return null;

  return (
    <div className="flex flex-col gap-4">
      {equipoPorCategoria.length === 0 ? (
        <EmptyStatePanel
          title={loadingEquipo ? 'Cargando equipo…' : 'Sin personal asignado'}
          description={loadingEquipo ? undefined : 'Todavía no tienes empleados asignados como residente principal.'}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {equipoPorCategoria.map(cat => (
            <Card key={cat.categoria}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                  <span>{cat.categoria}</span>
                  <span className="text-lg font-black text-foreground">{cat.total}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 pt-0">
                {cat.empleados.map(emp => (
                  <div key={emp.id_empleado} className="flex items-center justify-between gap-2 rounded-xl border border-border/60 px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-foreground">{emp.nombre}</p>
                      <p className="text-[10px] text-muted-foreground">{emp.numero_empleado}</p>
                    </div>
                    {emp.compartido && (
                      <span className="whitespace-nowrap rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
                        Compartido
                      </span>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
