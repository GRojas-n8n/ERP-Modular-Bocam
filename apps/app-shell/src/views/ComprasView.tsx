import React, { useEffect, useMemo, useRef, useState } from 'react';
import api from '../lib/api';
import { useTenant } from '../context/TenantContext';
import { DEMO_INSUMOS, DEMO_REQUISICIONES, DEMO_INVENTARIO, DEMO_MOVIMIENTOS_ALMACEN, DEMO_COMPARATIVAS } from '../lib/demoData';
import { ComparativaDetail } from '../components/ComparativaDetail';
import type { ComparativaLocal } from '../components/ComparativaDetail';
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
  IconArrowDownRight,
  IconArrowUpRight,
  IconCheckCircle2,
  IconClock,
  IconLayers,
  IconPackage,
  IconPlus,
  IconRefreshCw,
  IconScale,
  IconSearch,
  IconShoppingCart,
  IconX,
} from '../components/Icons';
import { SlidePanel, SubmitButton } from '../components/SlidePanel';

/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Vista: Compras — Requisiciones + Catálogo de Insumos + Almacén
 * Hito 5 — Catálogo + Almacén (Inventario, Ingresos, Egresos, Traspasos)
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

interface ItemInventario {
  id: string;
  insumo_id: string;
  clave: string;
  descripcion: string;
  unidad: string;
  stock_actual: number;
  stock_minimo: number;
  ubicacion: string;
}

interface MovimientoAlmacen {
  id: string;
  tipo: 'INGRESO' | 'EGRESO' | 'TRASPASO';
  fecha: string;
  insumo_clave: string;
  insumo_descripcion: string;
  cantidad: number;
  unidad: string;
  origen: string;
  destino: string;
  responsable: string;
  referencia?: string;
}

type MovTipo = 'INGRESO' | 'EGRESO' | 'TRASPASO';
type AlmacenSubView = 'inventario' | 'movimientos';
type TabId = 'requisiciones' | 'catalogo' | 'almacen';

// ─── Colores por categoría ───────────────────────────────────────────────────
const CLASE_STYLE: Record<string, { badge: string; chip: string; label: string }> = {
  MATERIALES:   { badge: 'border-blue-500/20 bg-blue-500/10 text-blue-700',      chip: 'bg-blue-500/10 text-blue-700',      label: 'Materiales' },
  EQUIPOS:      { badge: 'border-violet-500/20 bg-violet-500/10 text-violet-700', chip: 'bg-violet-500/10 text-violet-700',  label: 'Equipos' },
  MANO_OBRA:    { badge: 'border-amber-500/20 bg-amber-500/10 text-amber-700',    chip: 'bg-amber-500/10 text-amber-700',    label: 'Mano de Obra' },
  SUBCONTRATOS: { badge: 'border-teal-500/20 bg-teal-500/10 text-teal-700',       chip: 'bg-teal-500/10 text-teal-700',      label: 'Subcontratos' },
};
const DEFAULT_CLASE = { badge: 'border-slate-200 bg-slate-100 text-slate-600', chip: 'bg-slate-100 text-slate-600', label: 'Otro' };

const CLASES = Object.keys(CLASE_STYLE);
const UNIDADES = ['PZA', 'SAC', 'M3', 'M2', 'ML', 'KG', 'TON', 'LT', 'CUB', 'DIA', 'SEM', 'MES', 'PTO', 'JGO'];

// ─── Estilos de movimiento ────────────────────────────────────────────────────
const MOV_STYLE: Record<MovTipo, { badge: string; label: string; Icon: React.FC<{className?: string}>; bg: string }> = {
  INGRESO:  { badge: 'border-green-500/20 bg-green-500/10 text-green-700',  label: 'Ingreso',  Icon: IconArrowUpRight,   bg: 'bg-green-500/10' },
  EGRESO:   { badge: 'border-red-500/20 bg-red-500/10 text-red-700',        label: 'Egreso',   Icon: IconArrowDownRight, bg: 'bg-red-500/10' },
  TRASPASO: { badge: 'border-blue-500/20 bg-blue-500/10 text-blue-700',     label: 'Traspaso', Icon: IconRefreshCw,      bg: 'bg-blue-500/10' },
};

export const ComprasView: React.FC = () => {
  const { tenant } = useTenant();
  const isDemo = tenant?.id === 'iretum-demo';

  // ─── State ────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabId>('requisiciones');
  const [requisiciones, setRequisiciones] = useState<Requisicion[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [inventario, setInventario] = useState<ItemInventario[]>([]);
  const [movimientosAlmacen, setMovimientosAlmacen] = useState<MovimientoAlmacen[]>([]);
  const [comparativas, setComparativas] = useState<ComparativaLocal[]>([]);
  const [activeReqId, setActiveReqId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Almacén sub-vistas y filtros
  const [almacenSubView, setAlmacenSubView] = useState<AlmacenSubView>('inventario');
  const [almacenFilter, setAlmacenFilter] = useState('');
  const [inventarioSearch, setInventarioSearch] = useState('');

  // Panels
  const [showReqForm, setShowReqForm] = useState(false);
  const [showInsumoForm, setShowInsumoForm] = useState(false);
  const [showMovForm, setShowMovForm] = useState(false);
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

  // Movimiento form
  const [movForm, setMovForm] = useState({
    tipo: 'INGRESO' as MovTipo,
    insumo_id: '',
    insumo_label: '',
    insumo_unidad: '',
    cantidad: '',
    origen: '',
    destino: '',
    responsable: '',
    referencia: '',
    notas: '',
  });

  // Búsqueda de insumo por item de requisición
  const [itemSearch, setItemSearch] = useState<string[]>([]);
  const [itemDropdown, setItemDropdown] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Búsqueda de insumo en movimiento
  const [movSearch, setMovSearch] = useState('');
  const [movDropdownOpen, setMovDropdownOpen] = useState(false);
  const movDropdownRef = useRef<HTMLDivElement>(null);

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      setLoading(true);
      if (isDemo) {
        setRequisiciones(DEMO_REQUISICIONES as Requisicion[]);
        setInsumos(DEMO_INSUMOS as Insumo[]);
        setInventario(DEMO_INVENTARIO as ItemInventario[]);
        setMovimientosAlmacen(DEMO_MOVIMIENTOS_ALMACEN as MovimientoAlmacen[]);
        setComparativas(DEMO_COMPARATIVAS as unknown as ComparativaLocal[]);
        return;
      }
      const [reqRes, insRes, invRes, movRes, compRes] = await Promise.allSettled([
        api.get('/api/v1/compras/requisiciones'),
        api.get('/api/v1/compras/insumos'),
        api.get('/api/v1/compras/almacen/inventario'),
        api.get('/api/v1/compras/almacen/movimientos'),
        api.get('/api/v1/compras/comparativas'),
      ]);
      if (reqRes.status === 'fulfilled') setRequisiciones(reqRes.value.data?.data || []);
      if (insRes.status === 'fulfilled') setInsumos(insRes.value.data?.data || []);
      if (invRes.status === 'fulfilled') setInventario(invRes.value.data?.data || []);
      if (movRes.status === 'fulfilled') setMovimientosAlmacen(movRes.value.data?.data || []);
      if (compRes.status === 'fulfilled') setComparativas(compRes.value.data?.data || []);
    } catch {
      setError('Error al conectar con el modulo de Compras.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Cerrar dropdown al hacer clic afuera (requisición)
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

  // Cerrar dropdown al hacer clic afuera (movimiento)
  useEffect(() => {
    if (!movDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (movDropdownRef.current && !movDropdownRef.current.contains(e.target as Node)) {
        setMovDropdownOpen(false);
      }
    };
    setTimeout(() => window.addEventListener('mousedown', handler), 0);
    return () => window.removeEventListener('mousedown', handler);
  }, [movDropdownOpen]);

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

  const inventarioFiltrado = useMemo(() => {
    const q = inventarioSearch.toLowerCase();
    if (!q) return inventario;
    return inventario.filter(i =>
      i.clave.toLowerCase().includes(q) ||
      i.descripcion.toLowerCase().includes(q) ||
      i.ubicacion.toLowerCase().includes(q)
    );
  }, [inventario, inventarioSearch]);

  const movimientosFiltrados = useMemo(() => {
    if (!almacenFilter) return movimientosAlmacen;
    return movimientosAlmacen.filter(m => m.tipo === almacenFilter);
  }, [movimientosAlmacen, almacenFilter]);

  const stockStatus = (actual: number, minimo: number) => {
    if (actual === 0)        return { label: 'AGOTADO', cls: 'text-red-600',   dot: 'bg-red-500',   badge: 'border-red-500/20 bg-red-500/10 text-red-600' };
    if (actual < minimo)     return { label: 'BAJO',    cls: 'text-amber-600', dot: 'bg-amber-500', badge: 'border-amber-500/20 bg-amber-500/10 text-amber-600' };
    return                          { label: 'OK',      cls: 'text-green-600', dot: 'bg-green-500', badge: 'border-green-500/20 bg-green-500/10 text-green-600' };
  };

  const reqPendientes = requisiciones.filter(r => r.estado === 'PENDIENTE').length;
  const itemsAgotados = inventario.filter(i => i.stock_actual === 0);
  const itemsBajo     = inventario.filter(i => i.stock_actual > 0 && i.stock_actual < i.stock_minimo);
  const almacenAlerta = [...itemsAgotados, ...itemsBajo];

  const movInsumoSuggestions = useMemo(() => {
    const q = movSearch.toLowerCase();
    if (!q) return insumos.slice(0, 8);
    return insumos.filter(i => i.clave.toLowerCase().includes(q) || i.descripcion.toLowerCase().includes(q)).slice(0, 8);
  }, [insumos, movSearch]);

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

  // ─── Handlers movimiento almacén ──────────────────────────────────────────
  const openMovForm = (tipo: MovTipo) => {
    setMovForm(f => ({ ...f, tipo, insumo_id: '', insumo_label: '', insumo_unidad: '', cantidad: '', origen: '', destino: '', responsable: '', referencia: '', notas: '' }));
    setMovSearch('');
    setShowMovForm(true);
  };

  const selectMovInsumo = (insumo: Insumo) => {
    setMovForm(f => ({ ...f, insumo_id: insumo.id, insumo_label: `${insumo.clave} — ${insumo.descripcion}`, insumo_unidad: insumo.unidad }));
    setMovSearch('');
    setMovDropdownOpen(false);
  };

  const handleSubmitMovimiento = async () => {
    if (!movForm.insumo_id || !movForm.cantidad) { alert('Selecciona un insumo e ingresa la cantidad.'); return; }
    if (!movForm.origen || !movForm.destino) { alert('Origen y destino son requeridos.'); return; }
    if (isDemo) { setShowMovForm(false); return; }
    try {
      setFormLoading(true);
      await api.post('/api/v1/compras/almacen/movimientos', {
        tipo: movForm.tipo,
        insumo_id: movForm.insumo_id,
        cantidad: Number(movForm.cantidad),
        origen: movForm.origen,
        destino: movForm.destino,
        responsable: movForm.responsable || undefined,
        referencia: movForm.referencia || undefined,
        notas: movForm.notas || undefined,
      });
      setShowMovForm(false);
      await fetchData();
    } catch (err: any) {
      alert(`Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setFormLoading(false);
    }
  };

  // ─── Handlers comparativa ────────────────────────────────────────────────────
  const openComparativa = (req: Requisicion) => {
    // Si no existe comparativa para esta req, crear una en blanco
    const existing = comparativas.find(c => c.requisicion_id === req.id);
    if (!existing) {
      const blank: ComparativaLocal = {
        id: `comp-new-${Date.now()}`,
        requisicion_id: req.id,
        estado: 'BORRADOR',
        proveedores: [],
        lineas: [],
        ordenes_compra: [],
      };
      setComparativas(prev => [...prev, blank]);
    }
    setActiveReqId(req.id);
  };

  const updateComparativa = (updated: ComparativaLocal) => {
    setComparativas(prev =>
      prev.map(c => c.requisicion_id === updated.requisicion_id ? updated : c)
    );
  };

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

  const movBadge = (tipo: MovTipo) => {
    const s = MOV_STYLE[tipo];
    const Icon = s.Icon;
    return (
      <span className={cn('flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[9px] font-black uppercase tracking-wider', s.badge)}>
        <Icon className="h-3 w-3" />
        {s.label}
      </span>
    );
  };

  const formatMXN = (n: number) =>
    n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 });

  // ─── Labels dinámicos para el formulario de movimiento ────────────────────
  const movLabels = {
    INGRESO:  { origen: 'Proveedor / Procedencia', destino: 'Bodega / Ubicación destino', origenPh: 'Ej: CEMEX México SA de CV', destinoPh: 'Ej: Bodega A-01' },
    EGRESO:   { origen: 'Bodega / Ubicación',       destino: 'Frente de trabajo / Destino', origenPh: 'Ej: Bodega A-01', destinoPh: 'Ej: Frente Nivel 12' },
    TRASPASO: { origen: 'Origen (proyecto/bodega)', destino: 'Destino (proyecto/bodega)',  origenPh: 'Ej: Bodega A-01 — TCN-2024', destinoPh: 'Ej: Bodega B-01 — RLP-2024' },
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="animate-in space-y-8 fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="space-y-3">
          <SectionBadge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Procuración operativa
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
                Requisiciones · Catálogo de Insumos · Almacén
              </p>
            </div>
          </div>
        </div>

        {/* Botón contextual por tab */}
        {activeTab === 'requisiciones' && (
          <Button
            onClick={() => setShowReqForm(true)}
            className="rounded-2xl bg-emerald-600 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-600/20 hover:bg-emerald-500"
          >
            <IconPlus className="h-4 w-4" />
            Nueva Requisicion
          </Button>
        )}
        {activeTab === 'catalogo' && (
          <Button
            onClick={() => setShowInsumoForm(true)}
            className="rounded-2xl bg-emerald-600 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-600/20 hover:bg-emerald-500"
          >
            <IconPlus className="h-4 w-4" />
            Agregar Insumo
          </Button>
        )}
        {activeTab === 'almacen' && (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => openMovForm('INGRESO')}
              className="rounded-2xl bg-green-600 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-green-600/20 hover:bg-green-500"
            >
              <IconArrowUpRight className="h-4 w-4" />
              Ingreso
            </Button>
            <Button
              onClick={() => openMovForm('EGRESO')}
              className="rounded-2xl bg-red-600 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-red-600/20 hover:bg-red-500"
            >
              <IconArrowDownRight className="h-4 w-4" />
              Egreso
            </Button>
            <Button
              onClick={() => openMovForm('TRASPASO')}
              className="rounded-2xl bg-blue-600 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500"
            >
              <IconRefreshCw className="h-4 w-4" />
              Traspaso
            </Button>
          </div>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Requisiciones',    value: String(requisiciones.length),   color: 'text-emerald-600', bg: 'bg-emerald-500/10', icon: IconShoppingCart },
          { label: 'Pendientes',       value: String(reqPendientes),           color: 'text-amber-600',   bg: 'bg-amber-500/10',   icon: IconClock },
          { label: 'Insumos catálogo', value: String(insumos.length),          color: 'text-blue-600',    bg: 'bg-blue-500/10',    icon: IconPackage },
          { label: 'Alm. con alerta',  value: String(almacenAlerta.length),    color: 'text-red-500',     bg: 'bg-red-500/10',     icon: IconAlertCircle },
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
          { id: 'requisiciones' as TabId, label: 'Requisiciones',     icon: IconShoppingCart, count: requisiciones.length },
          { id: 'catalogo'      as TabId, label: 'Catálogo',          icon: IconPackage,       count: insumos.length },
          { id: 'almacen'       as TabId, label: 'Almacén',           icon: IconLayers,        count: inventario.length },
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
            // Vista detalle: ComparativaDetail
            activeReqId ? (
              (() => {
                const req = requisiciones.find(r => r.id === activeReqId);
                const comp = comparativas.find(c => c.requisicion_id === activeReqId);
                if (!req || !comp) return null;
                return (
                  <ComparativaDetail
                    requisicionFolio={req.folio}
                    comparativa={comp}
                    insumos={insumos}
                    isDemo={isDemo}
                    onBack={() => setActiveReqId(null)}
                    onUpdate={updateComparativa}
                  />
                );
              })()
            ) : requisiciones.length === 0 ? (
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
                {requisiciones.map(req => {
                  const hasComp = comparativas.some(c => c.requisicion_id === req.id);
                  const compEstado = comparativas.find(c => c.requisicion_id === req.id)?.estado;
                  return (
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
                      <CardContent className="space-y-3 border-t border-border/40 pt-4">
                        <div className="flex items-center justify-between">
                          {estadoBadge(req.estado)}
                          <div className="text-[10px] font-bold uppercase text-muted-foreground">
                            {new Date(req.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                          </div>
                        </div>
                        {/* Botón comparativa para APROBADAS */}
                        {req.estado === 'APROBADA' && (
                          <Button
                            onClick={() => openComparativa(req)}
                            variant="outline"
                            className={cn(
                              'w-full rounded-xl text-[9px] font-black uppercase tracking-widest',
                              compEstado === 'AUTORIZADA'
                                ? 'border-green-500/30 text-green-600 hover:bg-green-500/5'
                                : 'border-amber-500/30 text-amber-600 hover:bg-amber-500/5'
                            )}
                          >
                            <IconScale className="h-3.5 w-3.5" />
                            {compEstado === 'AUTORIZADA'
                              ? 'Ver OC generadas'
                              : hasComp
                              ? 'Continuar comparativa'
                              : 'Iniciar comparativa'}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
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

          {/* ── TAB: Almacén ─────────────────────────────────────────────────── */}
          {activeTab === 'almacen' && (
            <div className="space-y-5">

              {/* Banner de alerta de stock */}
              {almacenAlerta.length > 0 && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 px-5 py-4">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-500/10">
                    <IconAlertCircle className="h-4 w-4 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black uppercase tracking-widest text-red-600">
                      {almacenAlerta.length} material{almacenAlerta.length !== 1 ? 'es' : ''} requiere{almacenAlerta.length === 1 ? '' : 'n'} reabastecimiento
                    </p>
                    <p className="mt-1 text-[10px] text-red-500/80">
                      {itemsAgotados.length > 0 && `${itemsAgotados.length} agotado${itemsAgotados.length !== 1 ? 's' : ''}`}
                      {itemsAgotados.length > 0 && itemsBajo.length > 0 && ' · '}
                      {itemsBajo.length > 0 && `${itemsBajo.length} bajo mínimo`}
                      {' · '}
                      {almacenAlerta.map(i => i.clave).join(', ')}
                    </p>
                  </div>
                </div>
              )}

              {/* Sub-toggle: Inventario | Movimientos */}
              <div className="flex gap-2 rounded-xl border border-border/30 bg-muted/20 p-1">
                {(['inventario', 'movimientos'] as AlmacenSubView[]).map(sv => (
                  <button
                    key={sv}
                    type="button"
                    onClick={() => setAlmacenSubView(sv)}
                    className={cn(
                      'flex-1 rounded-lg px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all',
                      almacenSubView === sv
                        ? 'bg-card text-emerald-600 shadow-md border border-border/40'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {sv === 'inventario' ? '📦 Inventario' : '↕ Movimientos'}
                  </button>
                ))}
              </div>

              {/* ── SUB-VISTA: Inventario ─────────────────────────────────────── */}
              {almacenSubView === 'inventario' && (
                <div className="space-y-4">
                  {/* Búsqueda inventario */}
                  <div className="relative">
                    <IconSearch className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="rounded-2xl border-border/40 pl-11"
                      placeholder="Buscar por clave, descripción o ubicación..."
                      value={inventarioSearch}
                      onChange={e => setInventarioSearch(e.target.value)}
                    />
                    {inventarioSearch && (
                      <button type="button" onClick={() => setInventarioSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        <IconX className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Mini KPIs de inventario */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Total items',   value: inventario.length,                                                   color: 'text-blue-600',   bg: 'bg-blue-500/10' },
                      { label: 'Bajo mínimo',   value: itemsBajo.length,                                                    color: 'text-amber-600',  bg: 'bg-amber-500/10' },
                      { label: 'Agotados',      value: itemsAgotados.length,                                                color: 'text-red-600',    bg: 'bg-red-500/10' },
                    ].map(k => (
                      <div key={k.label} className={cn('flex items-center gap-3 rounded-2xl border border-border/30 px-4 py-3', k.bg + '/30')}>
                        <div className={cn('text-xl font-black tracking-tighter', k.color)}>{k.value}</div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground leading-tight">{k.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Tabla inventario */}
                  <Card className="overflow-hidden rounded-3xl border-border/40 shadow-xl">
                    <TableContainer>
                      <Table className="min-w-[700px]">
                        <TableHeader>
                          <tr>
                            <TableHead>Clave</TableHead>
                            <TableHead>Material</TableHead>
                            <TableHead className="text-center">Stock Actual</TableHead>
                            <TableHead className="text-center">Stock Mínimo</TableHead>
                            <TableHead className="text-center">Estado</TableHead>
                            <TableHead>Ubicación</TableHead>
                          </tr>
                        </TableHeader>
                        <TableBody>
                          {inventarioFiltrado.map(item => {
                            const st = stockStatus(item.stock_actual, item.stock_minimo);
                            return (
                              <TableRow key={item.id}>
                                <TableCell>
                                  <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black text-emerald-700">
                                    {item.clave}
                                  </span>
                                </TableCell>
                                <TableCell className="max-w-[280px]">
                                  <div className="text-sm font-medium text-foreground truncate">{item.descripcion}</div>
                                  <div className="text-[10px] text-muted-foreground">{item.unidad}</div>
                                </TableCell>
                                <TableCell className="text-center">
                                  <span className={cn('text-lg font-black tracking-tighter', st.cls)}>
                                    {item.stock_actual}
                                  </span>
                                </TableCell>
                                <TableCell className="text-center">
                                  <span className="text-sm font-bold text-muted-foreground">{item.stock_minimo}</span>
                                </TableCell>
                                <TableCell className="text-center">
                                  <span className={cn('inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[9px] font-black uppercase tracking-wider', st.badge)}>
                                    <span className={cn('h-1.5 w-1.5 rounded-full', st.dot)} />
                                    {st.label}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <span className="text-[11px] text-muted-foreground">{item.ubicacion}</span>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    {inventarioFiltrado.length === 0 && (
                      <div className="p-16 text-center">
                        <IconLayers className="mx-auto mb-4 h-12 w-12 text-muted-foreground/20" />
                        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                          {inventario.length === 0 ? 'Sin registros en inventario' : 'Sin resultados para la búsqueda'}
                        </p>
                      </div>
                    )}
                    {inventarioFiltrado.length > 0 && (
                      <div className="border-t border-border/30 px-6 py-3 text-right">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          {inventarioFiltrado.length} de {inventario.length} materiales
                        </span>
                      </div>
                    )}
                  </Card>
                </div>
              )}

              {/* ── SUB-VISTA: Movimientos ────────────────────────────────────── */}
              {almacenSubView === 'movimientos' && (
                <div className="space-y-4">
                  {/* Filtros por tipo */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setAlmacenFilter('')}
                      className={cn(
                        'rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all',
                        almacenFilter === '' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      )}
                    >
                      Todos ({movimientosAlmacen.length})
                    </button>
                    {(['INGRESO', 'EGRESO', 'TRASPASO'] as MovTipo[]).map(tipo => {
                      const s = MOV_STYLE[tipo];
                      const Icon = s.Icon;
                      const count = movimientosAlmacen.filter(m => m.tipo === tipo).length;
                      return (
                        <button
                          key={tipo}
                          type="button"
                          onClick={() => setAlmacenFilter(almacenFilter === tipo ? '' : tipo)}
                          className={cn(
                            'flex items-center gap-1.5 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all',
                            almacenFilter === tipo ? cn('ring-2 ring-offset-1 shadow-lg', s.badge) : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          )}
                        >
                          <Icon className="h-3 w-3" />
                          {s.label} ({count})
                        </button>
                      );
                    })}
                  </div>

                  {/* Tabla movimientos */}
                  <Card className="overflow-hidden rounded-3xl border-border/40 shadow-xl">
                    <TableContainer>
                      <Table className="min-w-[860px]">
                        <TableHeader>
                          <tr>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Material</TableHead>
                            <TableHead className="text-center">Cantidad</TableHead>
                            <TableHead>Origen</TableHead>
                            <TableHead>Destino</TableHead>
                            <TableHead>Responsable</TableHead>
                            <TableHead>Referencia</TableHead>
                          </tr>
                        </TableHeader>
                        <TableBody>
                          {movimientosFiltrados.map(mov => (
                            <TableRow key={mov.id}>
                              <TableCell>{movBadge(mov.tipo as MovTipo)}</TableCell>
                              <TableCell>
                                <span className="text-[11px] font-bold text-muted-foreground">
                                  {new Date(mov.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                                </span>
                              </TableCell>
                              <TableCell className="max-w-[200px]">
                                <div className="text-[10px] font-black text-emerald-700">{mov.insumo_clave}</div>
                                <div className="text-xs font-medium text-foreground truncate">{mov.insumo_descripcion}</div>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="text-sm font-black text-foreground">
                                  {mov.cantidad} <span className="text-[10px] font-normal text-muted-foreground">{mov.unidad}</span>
                                </span>
                              </TableCell>
                              <TableCell className="max-w-[160px]">
                                <span className="text-[11px] text-muted-foreground truncate block">{mov.origen}</span>
                              </TableCell>
                              <TableCell className="max-w-[160px]">
                                <span className="text-[11px] text-muted-foreground truncate block">{mov.destino}</span>
                              </TableCell>
                              <TableCell>
                                <span className="text-[11px] text-foreground">{mov.responsable}</span>
                              </TableCell>
                              <TableCell>
                                {mov.referencia && (
                                  <span className="rounded-md bg-muted px-2 py-0.5 text-[9px] font-black text-muted-foreground">
                                    {mov.referencia}
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    {movimientosFiltrados.length === 0 && (
                      <div className="p-16 text-center">
                        <IconLayers className="mx-auto mb-4 h-12 w-12 text-muted-foreground/20" />
                        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                          Sin movimientos{almacenFilter ? ` de tipo ${almacenFilter}` : ''}
                        </p>
                      </div>
                    )}
                    {movimientosFiltrados.length > 0 && (
                      <div className="border-t border-border/30 px-6 py-3 text-right">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          {movimientosFiltrados.length} movimiento{movimientosFiltrados.length !== 1 ? 's' : ''}
                          {almacenFilter ? ` · ${almacenFilter}` : ' · todos los tipos'}
                        </span>
                      </div>
                    )}
                  </Card>
                </div>
              )}
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

      {/* ── SLIDE PANEL: Registrar Movimiento de Almacén ─────────────────────── */}
      <SlidePanel
        isOpen={showMovForm}
        onClose={() => setShowMovForm(false)}
        title={`Registrar ${MOV_STYLE[movForm.tipo]?.label ?? 'Movimiento'}`}
        subtitle="Movimiento de materiales en almacén"
        accentColor={movForm.tipo === 'INGRESO' ? 'emerald' : movForm.tipo === 'EGRESO' ? 'red' : 'blue'}
      >
        <div className="space-y-5">
          {/* Selector de tipo */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tipo de movimiento</label>
            <div className="flex gap-2">
              {(['INGRESO', 'EGRESO', 'TRASPASO'] as MovTipo[]).map(tipo => {
                const s = MOV_STYLE[tipo];
                const Icon = s.Icon;
                return (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => setMovForm(f => ({ ...f, tipo }))}
                    className={cn(
                      'flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-[9px] font-black uppercase tracking-widest transition-all',
                      movForm.tipo === tipo
                        ? cn('shadow-md', s.badge)
                        : 'border-border/30 text-muted-foreground hover:bg-muted/60'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Insumo */}
          <FormField label="Material / Insumo" required>
            {movForm.insumo_id && !movSearch ? (
              <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5">
                <span className="text-xs font-bold text-emerald-700">{movForm.insumo_label}</span>
                <button type="button" onClick={() => setMovForm(f => ({ ...f, insumo_id: '', insumo_label: '', insumo_unidad: '' }))}
                  className="ml-2 text-muted-foreground hover:text-foreground">
                  <IconX className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div ref={movDropdownRef} className="relative">
                <IconSearch className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9 text-xs"
                  placeholder="Buscar insumo por clave o nombre..."
                  value={movSearch}
                  onFocus={() => setMovDropdownOpen(true)}
                  onChange={e => { setMovSearch(e.target.value); setMovDropdownOpen(true); }}
                />
                {movDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full rounded-xl border border-border/40 bg-card shadow-xl">
                    {movInsumoSuggestions.map(ins => (
                      <button
                        key={ins.id}
                        type="button"
                        onMouseDown={() => selectMovInsumo(ins)}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/60 first:rounded-t-xl last:rounded-b-xl"
                      >
                        <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-black text-emerald-700">{ins.clave}</span>
                        <span className="flex-1 truncate text-xs text-foreground">{ins.descripcion}</span>
                        <span className="shrink-0 text-[9px] text-muted-foreground">{ins.unidad}</span>
                      </button>
                    ))}
                    {movInsumoSuggestions.length === 0 && (
                      <div className="px-4 py-3 text-xs text-muted-foreground">Sin resultados</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Cantidad" required>
              <Input type="number" placeholder="0" value={movForm.cantidad} onChange={e => setMovForm(f => ({ ...f, cantidad: e.target.value }))} />
            </FormField>
            <FormField label="Unidad">
              <Input
                className="bg-muted/30 text-muted-foreground"
                value={movForm.insumo_unidad || '—'}
                readOnly
              />
            </FormField>
          </div>

          <FormField label={movLabels[movForm.tipo].origen} required>
            <Input
              placeholder={movLabels[movForm.tipo].origenPh}
              value={movForm.origen}
              onChange={e => setMovForm(f => ({ ...f, origen: e.target.value }))}
            />
          </FormField>

          <FormField label={movLabels[movForm.tipo].destino} required>
            <Input
              placeholder={movLabels[movForm.tipo].destinoPh}
              value={movForm.destino}
              onChange={e => setMovForm(f => ({ ...f, destino: e.target.value }))}
            />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Responsable">
              <Input placeholder="Nombre de quien registra" value={movForm.responsable} onChange={e => setMovForm(f => ({ ...f, responsable: e.target.value }))} />
            </FormField>
            <FormField label="Referencia" hint="OC, REQ, TRP...">
              <Input placeholder="Ej: OC-2024-038" value={movForm.referencia} onChange={e => setMovForm(f => ({ ...f, referencia: e.target.value.toUpperCase() }))} />
            </FormField>
          </div>

          <FormField label="Notas">
            <Textarea className="min-h-[70px]" placeholder="Observaciones adicionales..." value={movForm.notas} onChange={e => setMovForm(f => ({ ...f, notas: e.target.value }))} />
          </FormField>

          {isDemo && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-[10px] font-medium text-amber-700">
              Modo demo — el movimiento no se guardará en base de datos.
            </div>
          )}

          <div className="border-t border-border/40 pt-4">
            <SubmitButton
              label={`Registrar ${MOV_STYLE[movForm.tipo]?.label ?? 'Movimiento'}`}
              loading={formLoading}
              color={movForm.tipo === 'INGRESO' ? 'emerald' : movForm.tipo === 'EGRESO' ? 'red' : 'blue'}
              onClick={handleSubmitMovimiento}
            />
          </div>
        </div>
      </SlidePanel>
    </div>
  );
};
