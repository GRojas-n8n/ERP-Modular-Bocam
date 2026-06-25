import React, { useEffect, useMemo, useState } from 'react';
import api from '../lib/api';
import { useTenant } from '../context/TenantContext';
import {
  Button,
  Card,
  CardContent,
  Input,
  SectionBadge,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  cn,
} from '@bocam/ui-core';
import {
  IconAlertCircle,
  IconArrowDownRight,
  IconArrowUpRight,
  IconLayers,
  IconPackage,
  IconRefreshCw,
  IconSearch,
} from '../components/Icons';

/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Vista: Almacén — Inventario y Movimientos
 * Puerto microservicio: 3012
 * ---------------------------------------------------------------------------
 */

interface ItemInventario {
  id: string;
  insumo_id: string | null;
  clave: string;
  descripcion: string;
  unidad: string;
  categoria: string;
  stock_actual: number;
  stock_minimo: number;
  ubicacion: string | null;
  bajo_minimo: boolean;
  agotado: boolean;
}

interface MovimientoAlmacen {
  id: string;
  tipo: 'INGRESO' | 'EGRESO' | 'TRASPASO';
  fecha: string;
  cantidad: number;
  unidad: string;
  insumo_clave: string;
  insumo_descripcion: string;
  origen: string | null;
  destino: string | null;
  responsable: string | null;
  referencia: string | null;
}

interface DashboardData {
  total_items: number;
  items_bajo_minimo: number;
  items_agotados: number;
  movimientos_hoy: number;
  alertas: Array<{
    item_id: string;
    clave: string;
    descripcion: string;
    stock_actual: number;
    stock_minimo: number;
    mensaje: string;
  }>;
}

type TabId = 'inventario' | 'movimientos';
type MovTipo = 'INGRESO' | 'EGRESO' | 'TRASPASO';

const MOV_STYLE: Record<MovTipo, { badge: string; label: string; Icon: React.FC<{ className?: string }> }> = {
  INGRESO:  { badge: 'border-green-500/20 bg-green-500/10 text-green-700',  label: 'Ingreso',  Icon: IconArrowUpRight },
  EGRESO:   { badge: 'border-red-500/20 bg-red-500/10 text-red-700',        label: 'Egreso',   Icon: IconArrowDownRight },
  TRASPASO: { badge: 'border-blue-500/20 bg-blue-500/10 text-blue-700',     label: 'Traspaso', Icon: IconRefreshCw },
};

export const AlmacenView: React.FC<{ activeSubView?: string }> = ({ activeSubView }) => {
  const { tenant } = useTenant();
  const isDemo = tenant?.id === 'iretum-demo';

  const activeTab: TabId = (activeSubView as TabId) || 'inventario';

  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [inventario, setInventario] = useState<ItemInventario[]>([]);
  const [movimientos, setMovimientos] = useState<MovimientoAlmacen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [inventarioSearch, setInventarioSearch] = useState('');
  const [movFilter, setMovFilter] = useState<MovTipo | ''>('');

  // ─── Fetch ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dashRes, invRes, movRes] = await Promise.allSettled([
          api.get('/api/v1/almacen/dashboard'),
          api.get('/api/v1/almacen/inventario'),
          api.get('/api/v1/almacen/movimientos'),
        ]);
        if (dashRes.status === 'fulfilled') setDashData(dashRes.value.data?.data ?? null);
        if (invRes.status  === 'fulfilled') setInventario(invRes.value.data?.data ?? []);
        if (movRes.status  === 'fulfilled') setMovimientos(movRes.value.data?.data ?? []);
      } catch {
        setError('Error al conectar con el módulo de Almacén.');
      } finally {
        setLoading(false);
      }
    };
    if (!isDemo) void fetchData();
    else setLoading(false);
  }, [isDemo]);

  // ─── Computed ─────────────────────────────────────────────────────────────
  const inventarioFiltrado = useMemo(() => {
    const q = inventarioSearch.toLowerCase();
    if (!q) return inventario;
    return inventario.filter(i =>
      i.clave.toLowerCase().includes(q) ||
      i.descripcion.toLowerCase().includes(q) ||
      (i.ubicacion ?? '').toLowerCase().includes(q)
    );
  }, [inventario, inventarioSearch]);

  const movimientosFiltrados = useMemo(() => {
    if (!movFilter) return movimientos;
    return movimientos.filter(m => m.tipo === movFilter);
  }, [movimientos, movFilter]);

  const stockStatus = (item: ItemInventario) => {
    if (item.agotado)    return { label: 'AGOTADO', badge: 'border-red-500/20 bg-red-500/10 text-red-600',       dot: 'bg-red-500' };
    if (item.bajo_minimo) return { label: 'BAJO',    badge: 'border-amber-500/20 bg-amber-500/10 text-amber-600', dot: 'bg-amber-500' };
    return                      { label: 'OK',       badge: 'border-green-500/20 bg-green-500/10 text-green-600', dot: 'bg-green-500' };
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="animate-in space-y-8 fade-in duration-700">

      {/* Header */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="space-y-3">
          <SectionBadge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Gestión de inventario
          </SectionBadge>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/10 bg-emerald-500/10 shadow-inner">
              <IconPackage className="h-8 w-8 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-foreground">
                Almacén
              </h1>
              <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Inventario · Movimientos · Stock
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {dashData && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: 'Total ítems',     value: String(dashData.total_items),        color: 'text-emerald-600', bg: 'bg-emerald-500/10', icon: IconPackage },
            { label: 'Bajo mínimo',     value: String(dashData.items_bajo_minimo),  color: 'text-amber-600',   bg: 'bg-amber-500/10',   icon: IconAlertCircle },
            { label: 'Agotados',        value: String(dashData.items_agotados),     color: 'text-red-600',     bg: 'bg-red-500/10',     icon: IconAlertCircle },
            { label: 'Movs. hoy',       value: String(dashData.movimientos_hoy),    color: 'text-sky-600',     bg: 'bg-sky-500/10',     icon: IconRefreshCw },
          ].map(k => (
            <Card key={k.label} className="rounded-2xl border-border/30">
              <CardContent className="flex items-center gap-4 p-4">
                <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', k.bg)}>
                  <k.icon className={cn('h-5 w-5', k.color)} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-black uppercase tracking-widest text-muted-foreground">{k.label}</p>
                  <p className={cn('text-2xl font-black leading-tight', k.color)}>{k.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Alertas de stock bajo */}
      {dashData && dashData.alertas.length > 0 && (
        <Card className="rounded-2xl border-red-500/20 bg-red-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <IconAlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-[10px] font-black uppercase tracking-widest text-red-600">
                {dashData.alertas.length} ítem{dashData.alertas.length !== 1 ? 's' : ''} bajo mínimo
              </p>
            </div>
            <div className="space-y-2">
              {dashData.alertas.map(a => (
                <div key={a.item_id} className="flex items-center justify-between rounded-xl bg-red-500/10 px-3 py-2">
                  <span className="text-xs font-bold text-red-700">{a.clave} — {a.descripcion}</span>
                  <span className="shrink-0 text-[10px] font-black text-red-600">
                    Stock: {a.stock_actual} / Mín: {a.stock_minimo}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading / Error */}
      {loading ? (
        <Card className="border-border/40">
          <CardContent className="flex h-60 flex-col items-center justify-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500/10 border-t-emerald-600" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">
              Cargando inventario...
            </p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="space-y-4 p-12 text-center">
            <IconAlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <p className="text-sm font-bold uppercase tracking-widest text-destructive">{error}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Tab bar */}
          <div className="flex gap-2 rounded-2xl bg-muted/40 p-1">
            {(['inventario', 'movimientos'] as TabId[]).map(tab => (
              <button
                key={tab}
                type="button"
                className={cn(
                  'flex-1 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all',
                  activeTab === tab ? 'bg-card text-emerald-600 shadow-md border border-border/40' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab === 'inventario' ? 'Inventario' : 'Movimientos'}
              </button>
            ))}
          </div>

          {/* TAB: Inventario */}
          {activeTab === 'inventario' && (
            <div className="space-y-4">
              <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                <Input
                  placeholder="Buscar por clave, descripción o ubicación..."
                  value={inventarioSearch}
                  onChange={e => setInventarioSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Card className="rounded-2xl border-border/30">
                <TableContainer>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Clave</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Unidad</TableHead>
                        <TableHead className="text-right">Stock Actual</TableHead>
                        <TableHead className="text-right">Stock Mínimo</TableHead>
                        <TableHead>Ubicación</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inventarioFiltrado.map(item => {
                        const st = stockStatus(item);
                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-black text-emerald-700">
                                {item.clave}
                              </span>
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate font-medium text-xs">{item.descripcion}</TableCell>
                            <TableCell className="text-[10px] text-muted-foreground">{item.unidad}</TableCell>
                            <TableCell className="text-right font-bold text-sm">{item.stock_actual}</TableCell>
                            <TableCell className="text-right text-xs text-muted-foreground">{item.stock_minimo}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{item.ubicacion || '—'}</TableCell>
                            <TableCell>
                              <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase', st.badge)}>
                                <span className={cn('h-1.5 w-1.5 rounded-full', st.dot)} />
                                {st.label}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {inventarioFiltrado.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="py-16 text-center">
                            <IconLayers className="mx-auto mb-4 h-12 w-12 text-muted-foreground/20" />
                            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                              {inventario.length === 0 ? 'Sin registros en inventario' : 'Sin resultados para la búsqueda'}
                            </p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>

              {inventarioFiltrado.length > 0 && (
                <p className="text-right text-[10px] font-bold text-muted-foreground">
                  {inventarioFiltrado.length} ítem{inventarioFiltrado.length !== 1 ? 's' : ''}
                  {inventarioSearch ? ` · filtro "${inventarioSearch}"` : ''}
                </p>
              )}
            </div>
          )}

          {/* TAB: Movimientos */}
          {activeTab === 'movimientos' && (
            <div className="space-y-4">
              {/* Chips de filtro */}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className={cn(
                    'rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all',
                    movFilter === '' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                  onClick={() => setMovFilter('')}
                >
                  Todos ({movimientos.length})
                </Button>
                {(['INGRESO', 'EGRESO', 'TRASPASO'] as MovTipo[]).map(tipo => {
                  const s = MOV_STYLE[tipo];
                  const count = movimientos.filter(m => m.tipo === tipo).length;
                  return (
                    <Button
                      key={tipo}
                      type="button"
                      variant="ghost"
                      onClick={() => setMovFilter(movFilter === tipo ? '' : tipo)}
                      className={cn(
                        'flex items-center gap-1.5 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all',
                        movFilter === tipo ? cn('ring-2 ring-offset-1 shadow-lg', s.badge) : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      )}
                    >
                      <s.Icon className="h-3.5 w-3.5" />
                      {s.label} ({count})
                    </Button>
                  );
                })}
              </div>

              <Card className="rounded-2xl border-border/30">
                <TableContainer>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Insumo</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead>Unidad</TableHead>
                        <TableHead>Origen</TableHead>
                        <TableHead>Referencia</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {movimientosFiltrados.map(mov => {
                        const s = MOV_STYLE[mov.tipo] ?? MOV_STYLE.INGRESO;
                        const Icon = s.Icon;
                        return (
                          <TableRow key={mov.id}>
                            <TableCell className="text-[10px] text-muted-foreground whitespace-nowrap">
                              {new Date(mov.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </TableCell>
                            <TableCell>
                              <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase', s.badge)}>
                                <Icon className="h-3 w-3" />
                                {s.label}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-black text-emerald-700">{mov.insumo_clave}</span>
                                <span className="truncate text-xs text-muted-foreground max-w-[160px]">{mov.insumo_descripcion}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-bold text-sm">{mov.cantidad}</TableCell>
                            <TableCell className="text-[10px] text-muted-foreground">{mov.unidad}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{mov.origen || '—'}</TableCell>
                            <TableCell className="text-[10px] font-mono text-muted-foreground">{mov.referencia || '—'}</TableCell>
                          </TableRow>
                        );
                      })}
                      {movimientosFiltrados.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="py-16 text-center">
                            <IconLayers className="mx-auto mb-4 h-12 w-12 text-muted-foreground/20" />
                            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                              Sin movimientos{movFilter ? ` de tipo ${movFilter}` : ''}
                            </p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>

              {movimientosFiltrados.length > 0 && (
                <p className="text-right text-[10px] font-bold text-muted-foreground">
                  {movimientosFiltrados.length} movimiento{movimientosFiltrados.length !== 1 ? 's' : ''}
                  {movFilter ? ` · ${movFilter}` : ' · todos los tipos'}
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
