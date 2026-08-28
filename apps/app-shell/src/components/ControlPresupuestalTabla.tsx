import React, { useState } from 'react';
import api from '../lib/api';
import { TableScrollShadow } from './TableScrollShadow';

/**
 * Tabla de Control Presupuestal por partida, con drill-down de movimientos.
 * Compartida entre Gerencia Técnica y Control de Proyectos — solo lectura.
 * Ver openspec/changes/trazabilidad-partida-gt-cp.
 *
 * El drill-down combina dos fuentes independientes (GT + Finanzas) en el
 * frontend en vez de agregarlas en backend, para que la falla de un
 * servicio no bloquee al otro (ver design.md, Decisión 2).
 */

export interface PartidaCP {
  concepto_id: string;
  clave: string;
  descripcion: string;
  categoria_predominante: string | null;
  presupuestado: number;
  comprometido: number;
  pagado: number;
  disponible: number;
  pct_ejercido: number;
}

interface MovimientoUnificado {
  id: string;
  fecha: string;
  tipo: string;
  referencia_codigo: string | null;
  monto: number;
  origen: 'GT' | 'Finanzas';
}

interface DrillDownState {
  loading: boolean;
  movimientos: MovimientoUnificado[];
  incompleto: boolean;
}

const formatMXN = (n: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);

const formatFecha = (iso: string) => new Date(iso).toLocaleString('es-MX');

interface Props {
  partidas: PartidaCP[];
  sinPartidaComprometido?: number;
  sinPartidaPagado?: number;
}

export function ControlPresupuestalTabla({ partidas, sinPartidaComprometido = 0, sinPartidaPagado = 0 }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [drillDown, setDrillDown] = useState<Record<string, DrillDownState>>({});
  const [busqueda, setBusqueda] = useState('');

  const termino = busqueda.trim().toLowerCase();
  const partidasFiltradas = termino
    ? partidas.filter(p => p.clave.toLowerCase().includes(termino) || p.descripcion.toLowerCase().includes(termino))
    : partidas;
  const mostrarSinPartida = (sinPartidaComprometido + sinPartidaPagado) > 0 && (!termino || '[sin partida asignada]'.includes(termino));

  const toggleExpand = async (conceptoId: string) => {
    if (expandedId === conceptoId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(conceptoId);
    if (drillDown[conceptoId]) return;

    setDrillDown(prev => ({ ...prev, [conceptoId]: { loading: true, movimientos: [], incompleto: false } }));

    const [gtResult, finanzasResult] = await Promise.allSettled([
      api.get(`/api/v1/gerencia-tecnica/partidas/${conceptoId}/movimientos`),
      api.get(`/api/v1/finanzas/movimientos?concepto_id=${conceptoId}`),
    ]);

    const movimientos: MovimientoUnificado[] = [];
    let incompleto = false;

    if (gtResult.status === 'fulfilled') {
      const rows = gtResult.value.data.data ?? gtResult.value.data ?? [];
      for (const m of rows) {
        movimientos.push({
          id: `gt-${m.id}`,
          fecha: m.created_at,
          tipo: m.tipo,
          referencia_codigo: m.referencia_codigo ?? null,
          monto: Number(m.delta),
          origen: 'GT',
        });
      }
    } else {
      incompleto = true;
    }

    if (finanzasResult.status === 'fulfilled') {
      const rows = finanzasResult.value.data.data ?? finanzasResult.value.data ?? [];
      for (const m of rows) {
        movimientos.push({
          id: `fin-${m.id_movimiento}`,
          fecha: m.fecha_registro,
          tipo: m.tipo,
          referencia_codigo: m.referencia_codigo ?? null,
          monto: Number(m.monto),
          origen: 'Finanzas',
        });
      }
    } else {
      incompleto = true;
    }

    movimientos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    setDrillDown(prev => ({ ...prev, [conceptoId]: { loading: false, movimientos, incompleto } }));
  };

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        placeholder="Buscar por clave o descripción..."
        className="w-full max-w-xs rounded-xl border border-border/40 bg-muted/30 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
      />
      <TableScrollShadow className="rounded-2xl border border-border/30">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border/30 bg-muted/30">
            <th className="px-4 py-3 text-left font-black uppercase tracking-widest text-[9px] text-muted-foreground w-6"></th>
            <th className="px-4 py-3 text-left font-black uppercase tracking-widest text-[9px] text-muted-foreground">Clave</th>
            <th className="px-4 py-3 text-left font-black uppercase tracking-widest text-[9px] text-muted-foreground">Descripción</th>
            <th className="px-4 py-3 text-left font-black uppercase tracking-widest text-[9px] text-muted-foreground">Categoría</th>
            <th className="px-4 py-3 text-right font-black uppercase tracking-widest text-[9px] text-muted-foreground">Presupuestado</th>
            <th className="px-4 py-3 text-right font-black uppercase tracking-widest text-[9px] text-muted-foreground">Comprometido</th>
            <th className="px-4 py-3 text-right font-black uppercase tracking-widest text-[9px] text-muted-foreground">Pagado</th>
            <th className="px-4 py-3 text-right font-black uppercase tracking-widest text-[9px] text-muted-foreground">Disponible</th>
            <th className="px-4 py-3 text-right font-black uppercase tracking-widest text-[9px] text-muted-foreground">% Ejerc.</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/20">
          {partidasFiltradas.map(p => {
            const isRisk = p.comprometido > p.presupuestado * 0.9;
            const expanded = expandedId === p.concepto_id;
            const dd = drillDown[p.concepto_id];
            return (
              <React.Fragment key={p.concepto_id}>
                <tr
                  className={`cursor-pointer ${isRisk ? 'bg-amber-500/5' : 'hover:bg-muted/20'}`}
                  onClick={() => void toggleExpand(p.concepto_id)}
                >
                  <td className="px-4 py-2.5 text-muted-foreground">{expanded ? '▾' : '▸'}</td>
                  <td className="px-4 py-2.5 font-mono font-bold text-foreground">{p.clave}</td>
                  <td className="px-4 py-2.5 text-foreground max-w-[220px] truncate">{p.descripcion}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{p.categoria_predominante ?? '—'}</td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold text-foreground">{formatMXN(p.presupuestado)}</td>
                  <td className={`px-4 py-2.5 text-right font-mono font-bold ${isRisk ? 'text-amber-700' : 'text-amber-600'}`}>{formatMXN(p.comprometido)}</td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold text-emerald-600">{formatMXN(p.pagado)}</td>
                  <td className={`px-4 py-2.5 text-right font-mono font-bold ${p.disponible < 0 ? 'text-destructive' : 'text-indigo-600'}`}>{formatMXN(p.disponible)}</td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold text-primary">{p.pct_ejercido}%</td>
                </tr>
                {expanded && (
                  <tr>
                    <td colSpan={9} className="bg-muted/10 px-6 py-3">
                      {!dd || dd.loading ? (
                        <p className="text-[10px] text-muted-foreground py-2">Cargando movimientos…</p>
                      ) : dd.movimientos.length === 0 ? (
                        <p className="text-[10px] text-muted-foreground py-2">Sin movimientos registrados para esta partida</p>
                      ) : (
                        <>
                          {dd.incompleto && (
                            <p className="text-[10px] text-amber-600 mb-2">La lista puede estar incompleta — uno de los servicios no respondió.</p>
                          )}
                          <table className="w-full text-[10px]">
                            <thead>
                              <tr className="text-muted-foreground">
                                <th className="text-left py-1 pr-3 font-black uppercase tracking-widest">Fecha</th>
                                <th className="text-left py-1 pr-3 font-black uppercase tracking-widest">Tipo</th>
                                <th className="text-left py-1 pr-3 font-black uppercase tracking-widest">Referencia</th>
                                <th className="text-right py-1 pr-3 font-black uppercase tracking-widest">Monto</th>
                                <th className="text-left py-1 font-black uppercase tracking-widest">Origen</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dd.movimientos.map(m => (
                                <tr key={m.id} className="border-t border-border/10">
                                  <td className="py-1.5 pr-3 text-foreground">{formatFecha(m.fecha)}</td>
                                  <td className="py-1.5 pr-3 text-foreground">{m.tipo}</td>
                                  <td className="py-1.5 pr-3 font-mono text-foreground">{m.referencia_codigo ?? '—'}</td>
                                  <td className="py-1.5 pr-3 text-right font-mono font-bold text-foreground">{formatMXN(m.monto)}</td>
                                  <td className="py-1.5 text-muted-foreground">{m.origen}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
          {mostrarSinPartida && (
            <tr className="bg-muted/10 italic">
              <td className="px-4 py-2.5"></td>
              <td className="px-4 py-2.5 font-mono text-muted-foreground text-[10px]">—</td>
              <td className="px-4 py-2.5 text-muted-foreground text-[10px]">[Sin partida asignada]</td>
              <td className="px-4 py-2.5 text-muted-foreground">—</td>
              <td className="px-4 py-2.5 text-right text-muted-foreground">—</td>
              <td className="px-4 py-2.5 text-right font-mono text-amber-600">{formatMXN(sinPartidaComprometido)}</td>
              <td className="px-4 py-2.5 text-right font-mono text-emerald-600">{formatMXN(sinPartidaPagado)}</td>
              <td className="px-4 py-2.5 text-right text-muted-foreground">—</td>
              <td className="px-4 py-2.5 text-right text-muted-foreground">—</td>
            </tr>
          )}
          {partidas.length === 0 && (
            <tr>
              <td colSpan={9} className="px-5 py-12 text-center text-xs text-muted-foreground">
                Sin partidas en el presupuesto activo.
              </td>
            </tr>
          )}
          {partidas.length > 0 && partidasFiltradas.length === 0 && !mostrarSinPartida && (
            <tr>
              <td colSpan={9} className="px-5 py-12 text-center text-xs text-muted-foreground">
                No hay partidas que coincidan con el filtro.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </TableScrollShadow>
    </div>
  );
}
