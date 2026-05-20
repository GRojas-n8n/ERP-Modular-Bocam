import React, { useEffect, useMemo, useRef, useState } from 'react';
import api from '../lib/api';
import { useTenant } from '../context/TenantContext';
import { DEMO_INSUMOS, DEMO_REQUISICIONES } from '../lib/demoData';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  FormField,
  Input,
  Select,
  SectionBadge,
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
  IconCheckCircle2,
  IconClock,
  IconPackage,
  IconPlus,
  IconSearch,
  IconShoppingCart,
  IconX,
} from '../components/Icons';
import { SlidePanel, SubmitButton } from '../components/SlidePanel';

/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Vista: Compras — Requisiciones + Catálogo de Insumos
 * Hito 5 — Catálogo con clave única por categoría
 * ---------------------------------------------------------------------------
 */

interface Requisicion {
  id: string;
  folio: string;
  fecha: string;
  solicitante: string;
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
  estado: string;
}

interface Insumo {
  id: string;
  clave: string;
  descripcion: string;
  unidad: string;
  costo: number;
  clase: string;
  especificaciones?: string;
  proveedor_preferido?: string;
  activo?: boolean;
}

type TabId = 'requisiciones' | 'catalogo';

// ─── Colores por categoría ───────────────────────────────────────────────────
const CLASE_STYLE: Record<string, { badge: string; chip: string; label: string }> = {
  MATERIALES:   { badge: 'border-blue-500/20 bg-blue-500/10 text-blue-700',    chip: 'bg-blue-500/10 text-blue-700',    label: 'Materiales' },
  EQUIPOS:      { badge: 'border-violet-500/20 bg-violet-500/10 text-violet-700', chip: 'bg-violet-500/10 text-violet-700', label: 'Equipos' },
  MANO_OBRA:    { badge: 'border-amber-500/20 bg-amber-500/10 text-amber-700',  chip: 'bg-amber-500/10 text-amber-700',  label: 'Mano de Obra' },
  SUBCONTRATOS: { badge: 'border-teal-500/20 bg-teal-500/10 text-teal-700',     chip: 'bg-teal-500/10 text-teal-700',    label: 'Subcontratos' },
};
const DEFAULT_CLASE = { badge: 'border-slate-200 bg-slate-100 text-slate-600', chip: 'bg-slate-100 text-slate-600', label: 'Otro' };

const CLASES = Object.keys(CLASE_STYLE);
const UNIDADES = ['PZA', 'SAC', 'M3', 'M2', 'ML', 'KG', 'TON', 'LT', 'CUB', 'DIA', 'SEM', 'MES', 'PTO', 'JGO'];

export const ComprasView: React.FC = () => {
  const { tenant } = useTenant();
  const isDemo = tenant?.id === 'iretum-demo';

  // ─── State ────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabId>('requisiciones');
  const [requisiciones, setRequisiciones] = useState<Requisicion[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Panels
  const [showReqForm, setShowReqForm] = useState(false);
  const [showInsumoForm, setShowInsumoForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Catálogo — búsqueda y filtro
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogClase, setCatalogClase] = useState('');

  // Requisición form
  const [reqForm, setReqForm] = useState({
    prioridad: 'MEDIA',
    fecha_requerida: '',
    notas: '',
    items: [{ insumo_id: '', insumo_label: '', cantidad: '', notas: '' }],
  });

  // Insumo form
  const [insumoForm, setInsumoForm] = useState({
    clave: '', descripcion: '', unidad: 'PZA', clase: 'MATERIALES',
    costo: '', especificaciones: '', proveedor_preferido: '',
  });

  // Búsqueda de insumo por item de requisición
  const [itemSearch, setItemSearch] = useState<string[]>([]);
  const [itemDropdown, setItemDropdown] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      setLoading(true);
      if (isDemo) {
        setRequisiciones(DEMO_REQUISICIONES as Requisicion[]);
        setInsumos(DEMO_INSUMOS as Insumo[]);
        return;
      }
      const [reqRes, insRes] = await Promise.allSettled([
        api.get('/api/v1/compras/requisiciones'),
        api.get('/api/v1/compras/insumos'),
      ]);
      if (reqRes.status === 'fulfilled') setRequisiciones(reqRes.value.data?.data || []);
      if (insRes.status === 'fulfilled') setInsumos(insRes.value.data?.data || []);
    } catch {
      setError('Error al conectar con el modulo de Compras.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Cerrar dropdown al hacer clic afuera
  useEffect(() => {
    if (itemDropdown === null) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setItemDropdown(null);
      }
    };
    setTimeout(() => window.addEventListener('mousedown', handler), 0);
    return () => window.removeEventListener('mousedown', handler);
  }, [itemDropdown]);

  // ─── Computed ─────────────────────────────────────────────────────────────
  const insumosFiltrados = useMemo(() => {
    let list = insumos;
    if (catalogClase) list = list.filter(i => i.clase === catalogClase);
    if (catalogSearch.trim()) {
      const q = catalogSearch.toLowerCase();
      list = list.filter(i =>
        i.clave.toLowerCase().includes(q) ||
        i.descripcion.toLowerCase().includes(q) ||
        i.unidad.toLowerCase().includes(q)
      );
    }
    return list;
  }, [insumos, catalogSearch, catalogClase]);

  const claseCount = useMemo(() =>
    CLASES.reduce((acc, c) => ({ ...acc, [c]: insumos.filter(i => i.clase === c).length }), {} as Record<string, number>),
    [insumos]
  );

  const reqPendientes = requisiciones.filter(r => r.estado === 'PENDIENTE').length;

  // ─── Handlers requisición ─────────────────────────────────────────────────
  const handleSubmitRequisicion = async () => {
    const validItems = reqForm.items.filter(i => i.insumo_id && i.cantidad);
    if (validItems.length === 0) { alert('Agrega al menos un insumo con cantidad.'); return; }
    if (isDemo) { setShowReqForm(false); resetReqForm(); return; }
    try {
      setFormLoading(true);
      await api.post('/api/v1/compras/requisiciones', {
        prioridad: reqForm.prioridad,
        fecha_requerida: reqForm.fecha_requerida || undefined,
        notas: reqForm.notas || undefined,
        items: validItems.map(i => ({ insumo_id: i.insumo_id, cantidad: Number(i.cantidad), notas: i.notas || undefined })),
      });
      setShowReqForm(false);
      resetReqForm();
      await fetchData();
    } catch (err: any) {
      alert(`Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setFormLoading(false);
    }
  };

  const resetReqForm = () => {
    setReqForm({ prioridad: 'MEDIA', fecha_requerida: '', notas: '', items: [{ insumo_id: '', insumo_label: '', cantidad: '', notas: '' }] });
    setItemSearch([]);
    setItemDropdown(null);
  };

  const addItem = () => {
    setReqForm(f => ({ ...f, items: [...f.items, { insumo_id: '', insumo_label: '', cantidad: '', notas: '' }] }));
    setItemSearch(s => [...s, '']);
  };

  const removeItem = (idx: number) => {
    setReqForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
    setItemSearch(s => s.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: string, value: string) => {
    setReqForm(f => {
      const items = [...f.items];
      items[idx] = { ...items[idx], [field]: value };
      return { ...f, items };
    });
  };

  const selectInsumo = (idx: number, insumo: Insumo) => {
    updateItem(idx, 'insumo_id', insumo.id);
    updateItem(idx, 'insumo_label', `${insumo.clave} — ${insumo.descripcion}`);
    setItemSearch(s => { const ns = [...s]; ns[idx] = ''; return ns; });
    setItemDropdown(null);
  };

  const getInsumoSuggestions = (idx: number) => {
    const q = (itemSearch[idx] || '').toLowerCase();
    if (!q) return insumos.slice(0, 8);
    return insumos.filter(i =>
      i.clave.toLowerCase().includes(q) || i.descripcion.toLowerCase().includes(q)
    ).slice(0, 8);
  };

  // ─── Handlers catálogo ───────────────────────────────────────────────────
  const handleSubmitInsumo = async () => {
    if (!insumoForm.clave || !insumoForm.descripcion) { alert('Clave y descripción son requeridos.'); return; }
    if (isDemo) { setShowInsumoForm(false); resetInsumoForm(); return; }
    try {
      setFormLoading(true);
      await api.post('/api/v1/compras/insumos', {
        ...insumoForm,
        costo: Number(insumoForm.costo) || undefined,
      });
      setShowInsumoForm(false);
      resetInsumoForm();
      await fetchData();
    } catch (err: any) {
      alert(`Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setFormLoading(false);
    }
  };

  const resetInsumoForm = () =>
    setInsumoForm({ clave: '', descripcion: '', unidad: 'PZA', clase: 'MATERIALES', costo: '', especificaciones: '', proveedor_preferido: '' });

  // ─── Badge helpers ─────────────────────────────────────────────────────────
  const claseBadge = (clase: string) => {
    const s = CLASE_STYLE[clase] || DEFAULT_CLASE;
    return (
      <SectionBadge className={cn('rounded-full px-2.5 py-0.5 text-[9px]', s.badge)}>
        {s.label}
      </SectionBadge>
    );
  };

  const prioridadBadge = (p: string) => {
    const map: Record<string, string> = {
      ALTA: 'border-red-500/20 bg-red-500/10 text-red-600',
      MEDIA: 'border-amber-500/20 bg-amber-500/10 text-amber-600',
      BAJA: 'border-green-500/20 bg-green-500/10 text-green-600',
    };
    return <SectionBadge className={cn('rounded-lg px-2.5 py-1 text-[9px]', map[p] || '')}>{p}</SectionBadge>;
  };

  const estadoBadge = (estado: string) => {
    const map: Record<string, string> = {
      PENDIENTE: 'text-amber-600',
      APROBADA:  'text-green-600',
      COMPRADA:  'text-sky-600',
      BORRADOR:  'text-slate-400',
      CANCELADA: 'text-red-500',
    };
    const icons: Record<string, React.ReactNode> = {
      PENDIENTE: <IconClock className="h-3.5 w-3.5" />,
      APROBADA:  <IconCheckCircle2 className="h-3.5 w-3.5" />,
      COMPRADA:  <IconShoppingCart className="h-3.5 w-3.5" />,
      BORRADOR:  <IconAlertCircle className="h-3.5 w-3.5" />,
    };
    return (
      <span className={cn('flex items-center gap-1 text-[10px] font-black uppercase tracking-wider', map[estado] || 'text-slate-500')}>
        {icons[estado] || <IconAlertCircle className="h-3.5 w-3.5" />}
        {estado}
      </span>
    );
  };

  const formatMXN = (n: number) =>
    n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 });

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="animate-in space-y-8 fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="space-y-3">
          <SectionBadge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Procuracion operativa
          </SectionBadge>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/10 bg-emerald-500/10 shadow-inner">
              <IconShoppingCart className="h-8 w-8 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-foreground">
                Centro de Compras
              </h1>
              <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Requisiciones · Catálogo de Insumos
              </p>
            </div>
          </div>
        </div>

        {activeTab === 'requisiciones' ? (
          <Button
            onClick={() => setShowReqForm(true)}
            className="rounded-2xl bg-emerald-600 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-600/20 hover:bg-emerald-500"
          >
            <IconPlus className="h-4 w-4" />
            Nueva Requisicion
          </Button>
        ) : (
          <Button
            onClick={() => setShowInsumoForm(true)}
            className="rounded-2xl bg-emerald-600 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-600/20 hover:bg-emerald-500"
          >
            <IconPlus className="h-4 w-4" />
            Agregar Insumo
          </Button>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Requisiciones',    value: String(requisiciones.length), color: 'text-emerald-600', bg: 'bg-emerald-500/10', icon: IconShoppingCart },
          { label: 'Pendientes',       value: String(reqPendientes),         color: 'text-amber-600',   bg: 'bg-amber-500/10',   icon: IconClock },
          { label: 'Insumos catalogo', value: String(insumos.length),        color: 'text-blue-600',    bg: 'bg-blue-500/10',    icon: IconPackage },
          { label: 'Categorias',       value: String(CLASES.filter(c => claseCount[c] > 0).length), color: 'text-violet-600', bg: 'bg-violet-500/10', icon: IconSearch },
        ].map(kpi => (
          <Card key={kpi.label} className="rounded-2xl border-border/30 p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <CardContent className="p-0">
              <div className={cn('mb-3 flex h-10 w-10 items-center justify-center rounded-xl', kpi.bg)}>
                <kpi.icon className={cn('h-5 w-5', kpi.color)} />
              </div>
              <div className={cn('mb-0.5 text-2xl font-black tracking-tighter', kpi.color)}>{kpi.value}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{kpi.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 rounded-2xl border border-border/30 bg-muted/30 p-1.5">
        {([
          { id: 'requisiciones' as TabId, label: 'Requisiciones', icon: IconShoppingCart, count: requisiciones.length },
          { id: 'catalogo'      as TabId, label: 'Catálogo de Insumos', icon: IconPackage,       count: insumos.length },
        ] as const).map(tab => (
          <Button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            variant={activeTab === tab.id ? 'outline' : 'ghost'}
            className={cn(
              'flex-1 justify-center rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest',
              activeTab === tab.id
                ? 'border-border/40 bg-card text-emerald-600 shadow-lg'
                : 'text-muted-foreground hover:bg-card/50 hover:text-foreground'
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-black',
              activeTab === tab.id ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'
            )}>
              {tab.count}
            </span>
          </Button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <Card className="border-border/40">
          <CardContent className="flex h-80 flex-col items-center justify-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500/10 border-t-emerald-600" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">
              Sincronizando con suministros...
            </p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="space-y-4 p-12 text-center">
            <IconAlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <h3 className="text-xl font-black uppercase tracking-tighter text-destructive">Falla en modulo Compras</h3>
            <p className="mx-auto max-w-sm text-xs font-medium text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* ── TAB: Requisiciones ───────────────────────────────────────────── */}
          {activeTab === 'requisiciones' && (
            requisiciones.length === 0 ? (
              <Card className="border-dashed border-border/60">
                <CardContent className="space-y-4 p-16 text-center">
                  <IconSearch className="mx-auto h-12 w-12 text-muted-foreground/20" />
                  <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Sin requisiciones activas</p>
                  <div className="flex justify-center">
                    <Button onClick={() => setShowReqForm(true)} variant="outline" className="border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/5">
                      <IconPlus className="h-4 w-4" />
                      Crear primera requisicion
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {requisiciones.map(req => (
                  <Card key={req.id} className="group relative overflow-hidden border-border/40 transition-all hover:-translate-y-1 hover:shadow-2xl">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <IconShoppingCart className="h-20 w-20" />
                    </div>
                    <CardHeader className="space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <SectionBadge className="rounded-full px-3 py-1 text-[10px]">Folio: {req.folio}</SectionBadge>
                        {prioridadBadge(req.prioridad)}
                      </div>
                      <div className="space-y-3">
                        <CardTitle className="text-base uppercase tracking-tight text-foreground">Requisicion de obra</CardTitle>
                        <CardDescription className="flex items-center gap-2 text-[11px] font-medium">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[8px] font-black text-muted-foreground">U</span>
                          {req.solicitante}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between border-t border-border/40 pt-4">
                      {estadoBadge(req.estado)}
                      <div className="text-[10px] font-bold uppercase text-muted-foreground">
                        {new Date(req.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          )}

          {/* ── TAB: Catálogo de Insumos ─────────────────────────────────────── */}
          {activeTab === 'catalogo' && (
            <div className="space-y-5">
              {/* Chips por categoría */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setCatalogClase('')}
                  className={cn(
                    'rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all',
                    catalogClase === '' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  Todos ({insumos.length})
                </button>
                {CLASES.map(c => {
                  const s = CLASE_STYLE[c];
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCatalogClase(catalogClase === c ? '' : c)}
                      className={cn(
                        'rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all',
                        catalogClase === c ? 'ring-2 ring-offset-1 shadow-lg ' + s.chip : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      )}
                    >
                      {s.label} ({claseCount[c] || 0})
                    </button>
                  );
                })}
              </div>

              {/* Búsqueda */}
              <div className="relative">
                <IconSearch className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="rounded-2xl border-border/40 pl-11"
                  placeholder="Buscar por clave, descripción o unidad..."
                  value={catalogSearch}
                  onChange={e => setCatalogSearch(e.target.value)}
                />
                {catalogSearch && (
                  <button type="button" onClick={() => setCatalogSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <IconX className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Tabla */}
              <Card className="overflow-hidden rounded-3xl border-border/40 shadow-xl">
                <TableContainer>
                  <Table className="min-w-[760px]">
                    <TableHeader>
                      <tr>
                        <TableHead>Clave</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead className="text-center">Unidad</TableHead>
                        <TableHead className="text-center">Categoría</TableHead>
                        <TableHead className="text-right">Precio Ref.</TableHead>
                      </tr>
                    </TableHeader>
                    <TableBody>
                      {insumosFiltrados.map(ins => (
                        <TableRow key={ins.id}>
                          <TableCell>
                            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black text-emerald-700">
                              {ins.clave}
                            </span>
                          </TableCell>
                          <TableCell className="max-w-[320px]">
                            <div className="text-sm font-medium text-foreground">{ins.descripcion}</div>
                            {ins.especificaciones && (
                              <div className="mt-0.5 text-[10px] text-muted-foreground">{ins.especificaciones}</div>
                            )}
                            {ins.proveedor_preferido && (
                              <div className="mt-0.5 text-[10px] text-muted-foreground/70">Prov: {ins.proveedor_preferido}</div>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-xs font-bold text-muted-foreground">{ins.unidad}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            {claseBadge(ins.clase)}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-sm font-bold text-foreground">{formatMXN(ins.costo)}</span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {insumosFiltrados.length === 0 && (
                  <div className="p-16 text-center">
                    <IconPackage className="mx-auto mb-4 h-12 w-12 text-muted-foreground/20" />
                    <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                      {insumos.length === 0 ? 'Catálogo vacío — agrega tu primer insumo' : 'Sin resultados para la búsqueda'}
                    </p>
                  </div>
                )}
                {insumosFiltrados.length > 0 && (
                  <div className="border-t border-border/30 px-6 py-3 text-right">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {insumosFiltrados.length} de {insumos.length} insumos
                    </span>
                  </div>
                )}
              </Card>
            </div>
          )}
        </>
      )}

      {/* ── SLIDE PANEL: Nueva Requisición ──────────────────────────────────── */}
      <SlidePanel
        isOpen={showReqForm}
        onClose={() => { setShowReqForm(false); resetReqForm(); }}
        title="Nueva Requisición"
        subtitle="Solicitud de compra de insumos"
        accentColor="emerald"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Prioridad" required>
              <Select value={reqForm.prioridad} onChange={e => setReqForm({ ...reqForm, prioridad: e.target.value })}>
                <option value="BAJA">Baja</option>
                <option value="MEDIA">Media</option>
                <option value="ALTA">Alta</option>
              </Select>
            </FormField>
            <FormField label="Fecha requerida">
              <Input type="date" value={reqForm.fecha_requerida} onChange={e => setReqForm({ ...reqForm, fecha_requerida: e.target.value })} />
            </FormField>
          </div>

          <FormField label="Notas / Justificación">
            <Textarea className="min-h-[80px]" placeholder="Justificación de la solicitud..." value={reqForm.notas} onChange={e => setReqForm({ ...reqForm, notas: e.target.value })} />
          </FormField>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Insumos solicitados <span className="text-red-500">*</span>
              </label>
              <Button onClick={addItem} variant="ghost" className="h-auto px-0 py-0 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:bg-transparent hover:text-emerald-500">
                <IconPlus className="h-3 w-3" /> Agregar
              </Button>
            </div>

            {reqForm.items.map((item, idx) => (
              <Card key={idx} className="border-border/30 bg-muted/20 shadow-none">
                <CardContent className="relative space-y-3 p-4">
                  {reqForm.items.length > 1 && (
                    <Button onClick={() => removeItem(idx)} variant="destructive" size="icon"
                      className="absolute right-2 top-2 h-6 w-6 rounded-md bg-red-500/10 text-xs text-red-500 hover:bg-red-500/20">
                      <IconX className="h-3 w-3" />
                    </Button>
                  )}
                  <SectionBadge className="w-fit rounded-md border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] text-emerald-600">
                    #{idx + 1}
                  </SectionBadge>

                  {/* Insumo seleccionado */}
                  {item.insumo_id && !itemSearch[idx] ? (
                    <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
                      <span className="text-xs font-bold text-emerald-700">{item.insumo_label}</span>
                      <button type="button" onClick={() => { updateItem(idx, 'insumo_id', ''); updateItem(idx, 'insumo_label', ''); }}
                        className="ml-2 text-muted-foreground hover:text-foreground">
                        <IconX className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div ref={itemDropdown === idx ? dropdownRef : undefined} className="relative">
                      <div className="relative">
                        <IconSearch className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          className="pl-9 text-xs"
                          placeholder="Buscar insumo por clave o nombre..."
                          value={itemSearch[idx] || ''}
                          onFocus={() => setItemDropdown(idx)}
                          onChange={e => {
                            setItemDropdown(idx);
                            setItemSearch(s => { const ns = [...s]; ns[idx] = e.target.value; return ns; });
                          }}
                        />
                      </div>
                      {itemDropdown === idx && (
                        <div className="absolute z-50 mt-1 w-full rounded-xl border border-border/40 bg-card shadow-xl">
                          {getInsumoSuggestions(idx).map(ins => (
                            <button
                              key={ins.id}
                              type="button"
                              onMouseDown={() => selectInsumo(idx, ins)}
                              className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/60 first:rounded-t-xl last:rounded-b-xl"
                            >
                              <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-black text-emerald-700">{ins.clave}</span>
                              <span className="flex-1 truncate text-xs text-foreground">{ins.descripcion}</span>
                              <span className="shrink-0 text-[9px] text-muted-foreground">{ins.unidad}</span>
                            </button>
                          ))}
                          {getInsumoSuggestions(idx).length === 0 && (
                            <div className="px-4 py-3 text-xs text-muted-foreground">Sin resultados</div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Cantidad" required>
                      <Input type="number" placeholder="Cant." value={item.cantidad} onChange={e => updateItem(idx, 'cantidad', e.target.value)} />
                    </FormField>
                    <FormField label="Notas">
                      <Input className="text-xs" placeholder="Opcional" value={item.notas} onChange={e => updateItem(idx, 'notas', e.target.value)} />
                    </FormField>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="border-t border-border/40 pt-4">
            <SubmitButton label="Crear Requisición" loading={formLoading} color="emerald" onClick={handleSubmitRequisicion} />
          </div>
        </div>
      </SlidePanel>

      {/* ── SLIDE PANEL: Agregar Insumo ──────────────────────────────────────── */}
      <SlidePanel
        isOpen={showInsumoForm}
        onClose={() => { setShowInsumoForm(false); resetInsumoForm(); }}
        title="Agregar Insumo al Catálogo"
        subtitle="Registrar material, equipo o servicio"
        accentColor="emerald"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Clave única" required hint="Ej: MAT-016, EQU-003">
              <Input placeholder="MAT-001" value={insumoForm.clave} onChange={e => setInsumoForm({ ...insumoForm, clave: e.target.value.toUpperCase() })} />
            </FormField>
            <FormField label="Categoría" required>
              <Select value={insumoForm.clase} onChange={e => setInsumoForm({ ...insumoForm, clase: e.target.value })}>
                {CLASES.map(c => <option key={c} value={c}>{CLASE_STYLE[c].label}</option>)}
              </Select>
            </FormField>
          </div>

          <FormField label="Descripción" required>
            <Input placeholder="Descripción completa del insumo..." value={insumoForm.descripcion} onChange={e => setInsumoForm({ ...insumoForm, descripcion: e.target.value })} />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Unidad de medida" required>
              <Select value={insumoForm.unidad} onChange={e => setInsumoForm({ ...insumoForm, unidad: e.target.value })}>
                {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
              </Select>
            </FormField>
            <FormField label="Precio referencia (MXN)" hint="Precio unitario aproximado">
              <Input type="number" placeholder="0.00" value={insumoForm.costo} onChange={e => setInsumoForm({ ...insumoForm, costo: e.target.value })} />
            </FormField>
          </div>

          <FormField label="Especificaciones técnicas">
            <Textarea className="min-h-[80px]" placeholder="Normas, tolerancias, marca, modelo..." value={insumoForm.especificaciones} onChange={e => setInsumoForm({ ...insumoForm, especificaciones: e.target.value })} />
          </FormField>

          <FormField label="Proveedor preferido">
            <Input placeholder="Nombre del proveedor habitual" value={insumoForm.proveedor_preferido} onChange={e => setInsumoForm({ ...insumoForm, proveedor_preferido: e.target.value })} />
          </FormField>

          {isDemo && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-[10px] font-medium text-amber-700">
              Modo demo — el insumo no se guardará en base de datos.
            </div>
          )}

          <div className="border-t border-border/40 pt-4">
            <SubmitButton label="Guardar Insumo" loading={formLoading} color="emerald" onClick={handleSubmitInsumo} />
          </div>
        </div>
      </SlidePanel>
    </div>
  );
};
