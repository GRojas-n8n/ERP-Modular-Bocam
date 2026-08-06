import React, { useEffect, useMemo, useState } from 'react';
import api from '../lib/api';
import { useTenant } from '../context/TenantContext';
import {
  Button,
  Card,
  CardContent,
  ConfirmCriticalActionDialog,
  FormField,
  getProjectColor,
  Input,
  SectionBadge,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
  cn,
} from '@bocam/ui-core';
import {
  IconAlertCircle,
  IconArrowDownRight,
  IconArrowUpRight,
  IconBriefcase,
  IconLayers,
  IconPackage,
  IconPlus,
  IconRefreshCw,
  IconSearch,
} from '../components/Icons';
import { HelpButton } from '../components/HelpButton';
import { HelpPanel } from '../components/HelpPanel';
import { SlidePanel, SubmitButton } from '../components/SlidePanel';

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

type TabId = 'inventario' | 'movimientos' | 'activos';
type MovTipo = 'INGRESO' | 'EGRESO' | 'TRASPASO';

// ─── Activos fijos ────────────────────────────────────────────────────────
type Clasificacion = 'EQUIPO' | 'HERRAMIENTA' | 'MAQUINARIA' | 'VEHICULO';
type EstadoActivo = 'DISPONIBLE' | 'ASIGNADO' | 'EN_TRASPASO' | 'BAJA';

interface Activo {
  id_activo: string;
  numero_activo: string;
  clave: string;
  descripcion: string;
  clasificacion: Clasificacion;
  estado: EstadoActivo;
  proyecto_id: string;
  ubicacion: string | null;
  asignado_a_empleado_id: string | null;
  asignado_a_empleado_nombre: string | null;
  fecha_alta: string;
  fecha_baja: string | null;
  motivo_baja: string | null;
  valor_adquisicion: number | null;
}

interface TraspasoActivo {
  id_traspaso: string;
  activo_id: string;
  tipo: 'PROYECTO' | 'ASIGNACION' | 'AMBOS';
  estado: 'PENDIENTE' | 'CONFIRMADO' | 'RECHAZADO';
  proyecto_origen_id: string;
  proyecto_destino_id: string | null;
  empleado_origen_nombre: string | null;
  empleado_destino_id: string | null;
  empleado_destino_nombre: string | null;
  solicitado_por: string;
  solicitado_en: string;
  confirmado_por: string | null;
  rechazado_por: string | null;
  resuelto_en: string | null;
  notas: string | null;
  activo?: { numero_activo: string; clave: string; descripcion: string };
}

interface EmpleadoOption {
  id_empleado: string;
  nombre: string;
  apellido_paterno: string;
}

const CLASIFICACION_STYLE: Record<Clasificacion, { badge: string; label: string }> = {
  EQUIPO:      { badge: 'border-sky-500/20 bg-sky-500/10 text-sky-700',       label: 'Equipo' },
  HERRAMIENTA: { badge: 'border-amber-500/20 bg-amber-500/10 text-amber-700', label: 'Herramienta' },
  MAQUINARIA:  { badge: 'border-violet-500/20 bg-violet-500/10 text-violet-700', label: 'Maquinaria' },
  VEHICULO:    { badge: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700', label: 'Vehículo' },
};

const ESTADO_ACTIVO_STYLE: Record<EstadoActivo, { badge: string; dot: string; label: string }> = {
  DISPONIBLE:  { badge: 'border-green-500/20 bg-green-500/10 text-green-600',   dot: 'bg-green-500',  label: 'Disponible' },
  ASIGNADO:    { badge: 'border-sky-500/20 bg-sky-500/10 text-sky-600',        dot: 'bg-sky-500',    label: 'Asignado' },
  EN_TRASPASO: { badge: 'border-amber-500/20 bg-amber-500/10 text-amber-600',  dot: 'bg-amber-500 animate-pulse', label: 'En traspaso' },
  BAJA:        { badge: 'border-red-500/20 bg-red-500/10 text-red-600',       dot: 'bg-red-500',    label: 'Baja' },
};

const ACTIVO_FORM_EMPTY = { clave: '', descripcion: '', clasificacion: 'EQUIPO' as Clasificacion, valor_adquisicion: '' };

const MOV_STYLE: Record<MovTipo, { badge: string; label: string; Icon: React.FC<{ className?: string }> }> = {
  INGRESO:  { badge: 'border-green-500/20 bg-green-500/10 text-green-700',  label: 'Ingreso',  Icon: IconArrowUpRight },
  EGRESO:   { badge: 'border-red-500/20 bg-red-500/10 text-red-700',        label: 'Egreso',   Icon: IconArrowDownRight },
  TRASPASO: { badge: 'border-blue-500/20 bg-blue-500/10 text-blue-700',     label: 'Traspaso', Icon: IconRefreshCw },
};

export const AlmacenView: React.FC<{ activeSubView?: string }> = ({ activeSubView }) => {
  const { tenant, user, currentProjectId } = useTenant();
  const isDemo = tenant?.id === 'iretum-demo';
  const roles: string[] = user?.role ?? [];
  const puedeEscribirActivos = roles.some(r => ['admin', 'superintendent', 'procurement', 'warehouse'].includes(r));
  const proyectosDisponibles = user?.projects ?? [];
  const currentProjectName = proyectosDisponibles.find(p => p.id === currentProjectId)?.name || 'proyecto activo';

  const activeTab: TabId = (activeSubView as TabId) || 'inventario';

  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [inventario, setInventario] = useState<ItemInventario[]>([]);
  const [movimientos, setMovimientos] = useState<MovimientoAlmacen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [inventarioSearch, setInventarioSearch] = useState('');
  const [movFilter, setMovFilter] = useState<MovTipo | ''>('');
  const [helpOpen, setHelpOpen] = useState(false);

  // ─── Activos fijos ──────────────────────────────────────────────────────
  const [activos, setActivos] = useState<Activo[]>([]);
  const [pendientes, setPendientes] = useState<TraspasoActivo[]>([]);
  const [activosSearch, setActivosSearch] = useState('');
  const [clasificacionFilter, setClasificacionFilter] = useState<Clasificacion | ''>('');
  const [estadoFilter, setEstadoFilter] = useState<EstadoActivo | ''>('');

  const [showActivoForm, setShowActivoForm] = useState(false);
  const [confirmCrearActivo, setConfirmCrearActivo] = useState(false);
  const [activoForm, setActivoForm] = useState(ACTIVO_FORM_EMPTY);
  const [savingActivo, setSavingActivo] = useState(false);

  const [bajaActivo, setBajaActivo] = useState<Activo | null>(null);
  const [motivoBaja, setMotivoBaja] = useState('');
  const [savingBaja, setSavingBaja] = useState(false);

  const [traspasoActivo, setTraspasoActivo] = useState<Activo | null>(null);
  const [traspasoTipo, setTraspasoTipo] = useState<'PROYECTO' | 'ASIGNACION' | 'AMBOS'>('PROYECTO');
  const [traspasoProyectoDestino, setTraspasoProyectoDestino] = useState('');
  const [traspasoEmpleadoDestino, setTraspasoEmpleadoDestino] = useState('');
  const [empleados, setEmpleados] = useState<EmpleadoOption[]>([]);
  const [savingTraspaso, setSavingTraspaso] = useState(false);

  const [historialActivo, setHistorialActivo] = useState<Activo | null>(null);
  const [historial, setHistorial] = useState<TraspasoActivo[]>([]);
  const [resolviendoId, setResolviendoId] = useState<string | null>(null);

  const fetchActivos = async () => {
    try {
      const [actRes, pendRes] = await Promise.allSettled([
        api.get('/api/v1/almacen/activos'),
        api.get(`/api/v1/almacen/activos/traspasos?estado=PENDIENTE&proyecto_destino_id=${currentProjectId ?? ''}`),
      ]);
      if (actRes.status === 'fulfilled') setActivos(actRes.value.data?.data ?? []);
      if (pendRes.status === 'fulfilled') setPendientes(pendRes.value.data?.data ?? []);
    } catch {
      // best-effort — errores puntuales no bloquean el resto de la vista
    }
  };

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
        await fetchActivos();
      } catch {
        setError('Error al conectar con el módulo de Almacén.');
      } finally {
        setLoading(false);
      }
    };
    if (!isDemo) void fetchData();
    else setLoading(false);
  }, [isDemo, currentProjectId]);

  // ─── Activos: acciones ──────────────────────────────────────────────────
  const handleCrearActivo = () => {
    if (!activoForm.clave.trim() || !activoForm.descripcion.trim() || !currentProjectId) return;
    setConfirmCrearActivo(true);
  };

  const crearActivo = async () => {
    setConfirmCrearActivo(false);
    setSavingActivo(true);
    try {
      await api.post('/api/v1/almacen/activos', {
        clave: activoForm.clave.trim(),
        descripcion: activoForm.descripcion.trim(),
        clasificacion: activoForm.clasificacion,
        proyecto_id: currentProjectId,
        valor_adquisicion: activoForm.valor_adquisicion ? Number(activoForm.valor_adquisicion) : undefined,
      });
      await fetchActivos();
      setShowActivoForm(false);
      setActivoForm(ACTIVO_FORM_EMPTY);
    } catch {
      // el panel permanece abierto para reintentar
    } finally {
      setSavingActivo(false);
    }
  };

  const handleDarDeBaja = async () => {
    if (!bajaActivo || !motivoBaja.trim()) return;
    setSavingBaja(true);
    try {
      await api.post(`/api/v1/almacen/activos/${bajaActivo.id_activo}/baja`, { motivo: motivoBaja.trim() });
      await fetchActivos();
      setBajaActivo(null);
      setMotivoBaja('');
    } catch {
      // el panel permanece abierto para reintentar
    } finally {
      setSavingBaja(false);
    }
  };

  const abrirPanelTraspaso = async (activo: Activo) => {
    setTraspasoActivo(activo);
    setTraspasoTipo('PROYECTO');
    setTraspasoProyectoDestino('');
    setTraspasoEmpleadoDestino('');
    try {
      const r = await api.get('/api/v1/personal/empleados');
      setEmpleados(r.data?.data ?? []);
    } catch {
      setEmpleados([]);
    }
  };

  const handleSolicitarTraspaso = async () => {
    if (!traspasoActivo) return;
    setSavingTraspaso(true);
    try {
      const empleadoElegido = empleados.find(e => e.id_empleado === traspasoEmpleadoDestino);
      await api.post(`/api/v1/almacen/activos/${traspasoActivo.id_activo}/traspasos`, {
        tipo: traspasoTipo,
        ...(traspasoTipo !== 'ASIGNACION' ? { proyecto_destino_id: traspasoProyectoDestino } : {}),
        ...(traspasoTipo !== 'PROYECTO' ? {
          empleado_destino_id: traspasoEmpleadoDestino || null,
          empleado_destino_nombre: empleadoElegido ? `${empleadoElegido.nombre} ${empleadoElegido.apellido_paterno}` : null,
        } : {}),
      });
      await fetchActivos();
      setTraspasoActivo(null);
    } catch {
      // el panel permanece abierto para reintentar
    } finally {
      setSavingTraspaso(false);
    }
  };

  const abrirHistorial = async (activo: Activo) => {
    setHistorialActivo(activo);
    try {
      const r = await api.get(`/api/v1/almacen/activos/${activo.id_activo}/historial`);
      setHistorial(r.data?.data ?? []);
    } catch {
      setHistorial([]);
    }
  };

  const resolverPendiente = async (traspaso: TraspasoActivo, accion: 'confirmar' | 'rechazar') => {
    setResolviendoId(traspaso.id_traspaso);
    try {
      await api.patch(`/api/v1/almacen/activos/traspasos/${traspaso.id_traspaso}/${accion}`, {});
      await fetchActivos();
    } catch {
      // fila permanece visible para reintentar
    } finally {
      setResolviendoId(null);
    }
  };

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

  const activosFiltrados = useMemo(() => {
    const q = activosSearch.toLowerCase();
    return activos.filter(a =>
      (!clasificacionFilter || a.clasificacion === clasificacionFilter) &&
      (!estadoFilter || a.estado === estadoFilter) &&
      (!q || a.clave.toLowerCase().includes(q) || a.descripcion.toLowerCase().includes(q))
    );
  }, [activos, activosSearch, clasificacionFilter, estadoFilter]);

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

        <div className="flex items-center gap-2 shrink-0">
          {activeTab === 'activos' && puedeEscribirActivos && (
            <Button
              onClick={() => { setActivoForm(ACTIVO_FORM_EMPTY); setShowActivoForm(true); }}
              className="rounded-2xl bg-emerald-600 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-600/20 hover:bg-emerald-500"
            >
              <IconPlus className="h-4 w-4" />
              Nuevo Activo
            </Button>
          )}
          <HelpButton onClick={() => setHelpOpen(true)} />
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
            {(['inventario', 'movimientos', 'activos'] as TabId[]).map(tab => (
              <button
                key={tab}
                type="button"
                className={cn(
                  'flex-1 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all',
                  activeTab === tab ? 'bg-card text-emerald-600 shadow-md border border-border/40' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab === 'inventario' ? 'Inventario' : tab === 'movimientos' ? 'Movimientos' : 'Activos'}
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

          {/* TAB: Activos */}
          {activeTab === 'activos' && (
            <div className="space-y-4">
              {/* Bandeja de traspasos pendientes de confirmar en este proyecto */}
              {pendientes.length > 0 && (
                <Card className="rounded-2xl border-amber-500/20 bg-amber-500/5">
                  <CardContent className="p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <IconAlertCircle className="h-4 w-4 text-amber-600" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">
                        {pendientes.length} traspaso{pendientes.length !== 1 ? 's' : ''} pendiente{pendientes.length !== 1 ? 's' : ''} de confirmar en este proyecto
                      </p>
                    </div>
                    <div className="space-y-2">
                      {pendientes.map(p => (
                        <div key={p.id_traspaso} data-testid="fila-pendiente" className="flex flex-col gap-2 rounded-xl bg-amber-500/10 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="text-xs">
                            <span className="font-black text-amber-700">{p.activo?.numero_activo} — {p.activo?.descripcion}</span>
                            <span className="ml-2 text-amber-600/80">
                              {p.tipo === 'ASIGNACION' ? `asignar a ${p.empleado_destino_nombre ?? '—'}` : 'cambio de proyecto'}
                              {p.tipo === 'AMBOS' ? ` · asignar a ${p.empleado_destino_nombre ?? '—'}` : ''}
                              {' '}· solicitado por {p.solicitado_por}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={resolviendoId === p.id_traspaso}
                              onClick={() => void resolverPendiente(p, 'confirmar')}
                              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-white disabled:opacity-50"
                            >
                              Confirmar
                            </button>
                            <button
                              type="button"
                              disabled={resolviendoId === p.id_traspaso}
                              onClick={() => void resolverPendiente(p, 'rechazar')}
                              className="rounded-lg border border-red-500/30 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-red-600 disabled:opacity-50"
                            >
                              Rechazar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                  <Input
                    placeholder="Buscar por clave o descripción..."
                    value={activosSearch}
                    onChange={e => setActivosSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={clasificacionFilter} onChange={e => setClasificacionFilter(e.target.value as Clasificacion | '')} className="w-auto">
                  <option value="">Todas las clasificaciones</option>
                  {(Object.keys(CLASIFICACION_STYLE) as Clasificacion[]).map(c => (
                    <option key={c} value={c}>{CLASIFICACION_STYLE[c].label}</option>
                  ))}
                </Select>
                <Select value={estadoFilter} onChange={e => setEstadoFilter(e.target.value as EstadoActivo | '')} className="w-auto">
                  <option value="">Todos los estados</option>
                  {(Object.keys(ESTADO_ACTIVO_STYLE) as EstadoActivo[]).map(s => (
                    <option key={s} value={s}>{ESTADO_ACTIVO_STYLE[s].label}</option>
                  ))}
                </Select>
              </div>

              <Card className="rounded-2xl border-border/30">
                <TableContainer>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Número</TableHead>
                        <TableHead>Clave</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Clasificación</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Asignado a</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activosFiltrados.map(a => {
                        const cls = CLASIFICACION_STYLE[a.clasificacion];
                        const est = ESTADO_ACTIVO_STYLE[a.estado];
                        return (
                          <TableRow key={a.id_activo}>
                            <TableCell className="font-mono text-[10px] text-muted-foreground">{a.numero_activo}</TableCell>
                            <TableCell>
                              <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-black text-emerald-700">{a.clave}</span>
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate font-medium text-xs">{a.descripcion}</TableCell>
                            <TableCell>
                              <span className={cn('rounded-full border px-2 py-0.5 text-[9px] font-black uppercase', cls.badge)}>{cls.label}</span>
                            </TableCell>
                            <TableCell>
                              <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase', est.badge)}>
                                <span className={cn('h-1.5 w-1.5 rounded-full', est.dot)} />
                                {est.label}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">{a.asignado_a_empleado_nombre || '—'}</TableCell>
                            <TableCell>
                              <div className="flex gap-1.5">
                                <button type="button" onClick={() => void abrirHistorial(a)} className="rounded-lg border border-border/50 px-2 py-1 text-[9px] font-bold text-muted-foreground hover:bg-muted/40">
                                  Historial
                                </button>
                                {puedeEscribirActivos && a.estado !== 'BAJA' && a.estado !== 'EN_TRASPASO' && (
                                  <button type="button" onClick={() => void abrirPanelTraspaso(a)} className="rounded-lg border border-sky-500/30 px-2 py-1 text-[9px] font-bold text-sky-600 hover:bg-sky-500/10">
                                    Traspasar
                                  </button>
                                )}
                                {puedeEscribirActivos && a.estado !== 'BAJA' && (
                                  <button type="button" onClick={() => { setBajaActivo(a); setMotivoBaja(''); }} className="rounded-lg border border-red-500/30 px-2 py-1 text-[9px] font-bold text-red-600 hover:bg-red-500/10">
                                    Dar de baja
                                  </button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {activosFiltrados.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="py-16 text-center">
                            <IconBriefcase className="mx-auto mb-4 h-12 w-12 text-muted-foreground/20" />
                            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                              {activos.length === 0 ? 'Sin activos registrados' : 'Sin resultados para el filtro'}
                            </p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </div>
          )}
        </>
      )}

      <HelpPanel viewId="almacen" activeSubView={activeSubView} isOpen={helpOpen} onClose={() => setHelpOpen(false)} />

      <ConfirmCriticalActionDialog
        open={confirmCrearActivo}
        dismissible={false}
        title="¿Registrar este activo?"
        projectName={currentProjectName}
        projectColorDot={getProjectColor(currentProjectId).dot}
        confirmDisabled={savingActivo}
        onConfirm={() => void crearActivo()}
        onCancel={() => setConfirmCrearActivo(false)}
      />

      {/* ── Panel: Nuevo Activo ──────────────────────────────────────────── */}
      <SlidePanel
        isOpen={showActivoForm}
        onClose={() => setShowActivoForm(false)}
        title="Nuevo Activo"
        subtitle={`Proyecto: ${currentProjectName}`}
        accentColor="emerald"
      >
        <div className="space-y-4">
          <FormField label="Clave" required>
            <Input value={activoForm.clave} onChange={e => setActivoForm(f => ({ ...f, clave: e.target.value }))} placeholder="Ej: VEH-01" />
          </FormField>
          <FormField label="Descripción" required>
            <Textarea value={activoForm.descripcion} onChange={e => setActivoForm(f => ({ ...f, descripcion: e.target.value }))} placeholder="Ej: Camioneta Pickup 4x4" />
          </FormField>
          <FormField label="Clasificación" required>
            <Select value={activoForm.clasificacion} onChange={e => setActivoForm(f => ({ ...f, clasificacion: e.target.value as Clasificacion }))}>
              {(Object.keys(CLASIFICACION_STYLE) as Clasificacion[]).map(c => (
                <option key={c} value={c}>{CLASIFICACION_STYLE[c].label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Valor de adquisición (opcional)">
            <Input type="number" value={activoForm.valor_adquisicion} onChange={e => setActivoForm(f => ({ ...f, valor_adquisicion: e.target.value }))} placeholder="0.00" />
          </FormField>
          <SubmitButton loading={savingActivo} label="Registrar Activo" color="emerald" onClick={() => void handleCrearActivo()} />
        </div>
      </SlidePanel>

      {/* ── Panel: Dar de baja ───────────────────────────────────────────── */}
      <SlidePanel isOpen={!!bajaActivo} onClose={() => setBajaActivo(null)} title="Dar de baja" subtitle={bajaActivo ? `${bajaActivo.numero_activo} — ${bajaActivo.descripcion}` : ''} accentColor="red">
        <div className="space-y-4">
          <FormField label="Motivo" required>
            <Textarea value={motivoBaja} onChange={e => setMotivoBaja(e.target.value)} placeholder="Ej: Dañado por accidente en obra, venta, obsolescencia..." />
          </FormField>
          <SubmitButton loading={savingBaja} label="Confirmar baja" color="red" onClick={() => void handleDarDeBaja()} />
        </div>
      </SlidePanel>

      {/* ── Panel: Solicitar traspaso ────────────────────────────────────── */}
      <SlidePanel isOpen={!!traspasoActivo} onClose={() => setTraspasoActivo(null)} title="Solicitar traspaso" subtitle={traspasoActivo ? `${traspasoActivo.numero_activo} — ${traspasoActivo.descripcion}` : ''} accentColor="sky">
        <div className="space-y-4">
          <FormField label="Tipo de traspaso" required>
            <Select value={traspasoTipo} onChange={e => setTraspasoTipo(e.target.value as any)}>
              <option value="PROYECTO">Cambio de proyecto</option>
              <option value="ASIGNACION">Asignar a trabajador</option>
              <option value="AMBOS">Cambio de proyecto + asignar a trabajador</option>
            </Select>
          </FormField>
          {(traspasoTipo === 'PROYECTO' || traspasoTipo === 'AMBOS') && (
            <FormField label="Proyecto destino" required>
              <Select value={traspasoProyectoDestino} onChange={e => setTraspasoProyectoDestino(e.target.value)}>
                <option value="">Selecciona un proyecto</option>
                {proyectosDisponibles.filter(p => p.id !== currentProjectId).map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </Select>
            </FormField>
          )}
          {(traspasoTipo === 'ASIGNACION' || traspasoTipo === 'AMBOS') && (
            <FormField label="Empleado destino">
              <Select value={traspasoEmpleadoDestino} onChange={e => setTraspasoEmpleadoDestino(e.target.value)}>
                <option value="">Sin asignar (liberar)</option>
                {empleados.map(emp => (
                  <option key={emp.id_empleado} value={emp.id_empleado}>{emp.nombre} {emp.apellido_paterno}</option>
                ))}
              </Select>
            </FormField>
          )}
          <p className="text-[10px] text-muted-foreground">
            La solicitud queda pendiente hasta que alguien con acceso de almacén, operando en el proyecto destino, la confirme.
          </p>
          <SubmitButton
            loading={savingTraspaso}
            label="Solicitar traspaso"
            color="sky"
            onClick={() => void handleSolicitarTraspaso()}
          />
        </div>
      </SlidePanel>

      {/* ── Panel: Historial de un activo ────────────────────────────────── */}
      <SlidePanel isOpen={!!historialActivo} onClose={() => setHistorialActivo(null)} title="Historial del activo" subtitle={historialActivo ? `${historialActivo.numero_activo} — ${historialActivo.descripcion}` : ''} accentColor="violet">
        <div className="space-y-3">
          {historial.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">Sin traspasos registrados para este activo.</p>
          ) : (
            historial.map(h => (
              <div key={h.id_traspaso} className="rounded-xl border border-border/40 p-3">
                <div className="flex items-center justify-between">
                  <span className={cn(
                    'rounded-full border px-2 py-0.5 text-[9px] font-black uppercase',
                    h.estado === 'CONFIRMADO' ? 'border-green-500/20 bg-green-500/10 text-green-600'
                      : h.estado === 'RECHAZADO' ? 'border-red-500/20 bg-red-500/10 text-red-600'
                      : 'border-amber-500/20 bg-amber-500/10 text-amber-600'
                  )}>
                    {h.estado}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{new Date(h.solicitado_en).toLocaleDateString('es-MX')}</span>
                </div>
                <p className="mt-2 text-xs text-foreground">
                  {h.tipo === 'ASIGNACION' ? `Asignación a ${h.empleado_destino_nombre ?? '—'}` : 'Cambio de proyecto'}
                  {h.tipo === 'AMBOS' ? ` + asignación a ${h.empleado_destino_nombre ?? '—'}` : ''}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Solicitado por {h.solicitado_por}
                  {h.confirmado_por ? ` · confirmado por ${h.confirmado_por}` : ''}
                  {h.rechazado_por ? ` · rechazado por ${h.rechazado_por}` : ''}
                </p>
                {h.notas && <p className="mt-1 text-[10px] italic text-muted-foreground">"{h.notas}"</p>}
              </div>
            ))
          )}
        </div>
      </SlidePanel>
    </div>
  );
};
