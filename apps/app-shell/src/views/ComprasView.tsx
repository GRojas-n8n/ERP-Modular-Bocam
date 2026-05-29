import React, { useEffect, useMemo, useRef, useState } from 'react';
import api from '../lib/api';
import { useTenant } from '../context/TenantContext';
import { useNotification } from '../context/NotificationContext';
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

interface RequisicionItem {
  id: string;
  insumo_id: string | null;
  cantidad: number;
  notas: string | null;
  descripcion_libre: string | null;
  unidad_libre: string | null;
  es_imprevisto: boolean;
}

interface Requisicion {
  id: string;
  folio: string;
  fecha: string;
  solicitante: string;
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
  estado: string;
  tipo?: string; // 'NORMAL' | 'IMPREVISTO'
  items?: RequisicionItem[];
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
type TabId = 'requisiciones' | 'catalogo' | 'almacen' | 'pendientes-eval' | 'pendientes-gt';

// ─── Colores por categoría ───────────────────────────────────────────────────
const CLASE_STYLE: Record<string, { badge: string; chip: string; label: string }> = {
  MATERIALES:   { badge: 'border-blue-500/20 bg-blue-500/10 text-blue-700',      chip: 'bg-blue-500/10 text-blue-700',      label: 'Materiales' },
  EQUIPOS:      { badge: 'border-violet-500/20 bg-violet-500/10 text-violet-700', chip: 'bg-violet-500/10 text-violet-700',  label: 'Equipos' },
  MANO_OBRA:    { badge: 'border-amber-500/20 bg-amber-500/10 text-amber-700',    chip: 'bg-amber-500/10 text-amber-700',    label: 'Mano de Obra' },
  SUBCONTRATOS: { badge: 'border-teal-500/20 bg-teal-500/10 text-teal-700',       chip: 'bg-teal-500/10 text-teal-700',      label: 'Subcontratos' },
};
const DEFAULT_CLASE = { badge: 'border-slate-200 bg-slate-100 text-slate-600', chip: 'bg-slate-100 text-slate-600', label: 'Otro' };

const CLASES = Object.keys(CLASE_STYLE);

// Mapeo bidireccional entre etiquetas de clase locales y enum TipoInsumo de gerencia-tecnica
const GT_TIPO_TO_CLASE: Record<string, string> = {
  MATERIAL:    'MATERIALES',
  MANO_DE_OBRA: 'MANO_OBRA',
  EQUIPO:      'EQUIPOS',
  SUBCONTRATO: 'SUBCONTRATOS',
  INDIRECTO:   'INDIRECTO',
};
const CLASE_TO_GT_TIPO: Record<string, string> = {
  MATERIALES:  'MATERIAL',
  MANO_OBRA:   'MANO_DE_OBRA',
  EQUIPOS:     'EQUIPO',
  SUBCONTRATOS: 'SUBCONTRATO',
  INDIRECTO:   'INDIRECTO',
};
const UNIDADES = ['PZA', 'SAC', 'M3', 'M2', 'ML', 'KG', 'TON', 'LT', 'CUB', 'DIA', 'SEM', 'MES', 'PTO', 'JGO'];

// ─── Estilos de movimiento ────────────────────────────────────────────────────
const MOV_STYLE: Record<MovTipo, { badge: string; label: string; Icon: React.FC<{className?: string}>; bg: string }> = {
  INGRESO:  { badge: 'border-green-500/20 bg-green-500/10 text-green-700',  label: 'Ingreso',  Icon: IconArrowUpRight,   bg: 'bg-green-500/10' },
  EGRESO:   { badge: 'border-red-500/20 bg-red-500/10 text-red-700',        label: 'Egreso',   Icon: IconArrowDownRight, bg: 'bg-red-500/10' },
  TRASPASO: { badge: 'border-blue-500/20 bg-blue-500/10 text-blue-700',     label: 'Traspaso', Icon: IconRefreshCw,      bg: 'bg-blue-500/10' },
};

export const ComprasView: React.FC = () => {
  const { tenant, user } = useTenant();
  const isDemo = tenant?.id === 'iretum-demo';
  const { notify } = useNotification();

  // Roles del usuario actual — los roles están en user.role, NO en tenant.roles
  const roles: string[] = user?.role ?? [];
  const isResident    = roles.some(r => ['resident', 'residencia', 'control_obra'].includes(r));
  const isGT          = roles.some(r => ['gerencia_tecnica', 'superintendent', 'admin'].includes(r));
  const isProcurement = roles.some(r => ['procurement', 'admin', 'superintendent'].includes(r));

  // ─── State ────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabId>('requisiciones');
  const [requisiciones, setRequisiciones] = useState<Requisicion[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [inventario, setInventario] = useState<ItemInventario[]>([]);
  const [movimientosAlmacen, setMovimientosAlmacen] = useState<MovimientoAlmacen[]>([]);
  const [comparativas, setComparativas] = useState<ComparativaLocal[]>([]);
  const [pendientesEval, setPendientesEval] = useState<ComparativaLocal[]>([]);
  const [pendientesGT, setPendientesGT] = useState<ComparativaLocal[]>([]);
  const [activeReqId, setActiveReqId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aprobando, setAprobando] = useState<string | null>(null);

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
    tipo: 'NORMAL',
    prioridad: 'MEDIA',
    fecha_requerida: '',
    notas: '',
    items: [{ insumo_id: '', insumo_label: '', cantidad: '', notas: '', descripcion_libre: '', unidad_libre: 'PZA' }],
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
    insumo_categoria: '',
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
        const demoComps = DEMO_COMPARATIVAS as unknown as ComparativaLocal[];
        setComparativas(demoComps);
        setPendientesEval(demoComps.filter(c => c.estado === 'EN_EVALUACION_TECNICA'));
        setPendientesGT(demoComps.filter(c => c.estado === 'EN_APROBACION_GT'));
        return;
      }
      const [reqRes, insRes, invRes, movRes, compRes, evalRes, gtRes] = await Promise.allSettled([
        api.get('/api/v1/compras/requisiciones'),
        api.get('/api/v1/gerencia-tecnica/insumos'),
        api.get('/api/v1/compras/almacen/inventario'),
        api.get('/api/v1/compras/almacen/movimientos'),
        api.get('/api/v1/compras/comparativas'),
        // Bandejas de aprobación (pueden fallar por rol — ignorar 403)
        api.get('/api/v1/compras/comparativas/pendientes-evaluacion').catch(() => null),
        api.get('/api/v1/compras/comparativas/pendientes-gt').catch(() => null),
      ]);
      // Colectar datos normalizados para las dependencias entre entidades
      let insumosNormalizados: Insumo[] = [];
      let requisicionesNormalizadas: Requisicion[] = [];

      if (insRes.status === 'fulfilled') {
        const raw: any[] = insRes.value.data?.data || [];
        insumosNormalizados = raw.map((i) => ({
          id:          i.id,
          clave:       i.clave,
          descripcion: i.descripcion,
          unidad:      i.unidad_medida ?? i.unidad ?? '',
          costo:       Number(i.costo_base ?? i.costo ?? 0),
          clase:       GT_TIPO_TO_CLASE[i.tipo_insumo] ?? i.tipo_insumo ?? '',
          activo:      i.activo,
        }));
        setInsumos(insumosNormalizados);
      }

      if (reqRes.status === 'fulfilled') {
        const rawReqs: any[] = reqRes.value.data?.data || [];
        requisicionesNormalizadas = rawReqs.map(r => ({
          id:          r.id_requisicion ?? r.id,
          folio:       r.codigo ?? r.folio,
          fecha:       r.fecha_solicitud ?? r.fecha,
          solicitante: r.solicitante_id ?? r.solicitante ?? '—',
          prioridad:   r.prioridad ?? 'NORMAL',
          estado:      r.estado,
          tipo:        r.tipo,
          items:       (r.items || []).map((it: any) => ({
            id:               it.id_item ?? it.id,
            insumo_id:        it.insumo_id,
            cantidad:         Number(it.cantidad),
            notas:            it.notas,
            descripcion_libre: it.descripcion_libre,
            unidad_libre:     it.unidad_libre,
            es_imprevisto:    Boolean(it.es_imprevisto),
          })),
        }));
        setRequisiciones(requisicionesNormalizadas);
      }

      if (invRes.status === 'fulfilled') setInventario(invRes.value.data?.data || []);
      if (movRes.status === 'fulfilled') setMovimientosAlmacen(movRes.value.data?.data || []);

      // Normalizar comparativas: backend usa id_cuadro + detalles, frontend usa id + lineas
      const normalizeComp = (c: any): ComparativaLocal => {
        const detalles: any[] = c.detalles ?? [];
        // Extraer proveedores únicos
        const provMap = new Map<string, string>();
        detalles.forEach(d => provMap.set(d.proveedor_id, d.proveedor?.razon_social ?? '—'));
        const proveedores = Array.from(provMap.entries()).map(([id, nombre]) => ({ id, nombre }));
        // Agrupar por insumo_id para obtener lineas
        const lineaMap = new Map<string, import('../components/ComparativaDetail').CotizacionLinea>();
        detalles.forEach(d => {
          const info = insumosNormalizados.find(i => i.id === d.insumo_id);
          if (!lineaMap.has(d.insumo_id)) {
            lineaMap.set(d.insumo_id, {
              id:                  d.id_detalle,
              insumo_id:           d.insumo_id,
              insumo_clave:        info?.clave ?? '—',
              insumo_descripcion:  info?.descripcion ?? '—',
              insumo_unidad:       info?.unidad ?? '—',
              cantidad:            Number(d.cantidad ?? 0),
              precios:             {},
              ganador:             d.es_ganador ? d.proveedor_id : null,
              evaluacion_tecnica:  d.evaluacion_tecnica ?? 'PENDIENTE',
              comentario_tecnico:  d.comentario_tecnico ?? undefined,
              aprobacion_gt:       d.aprobacion_gt ?? 'PENDIENTE',
              comentario_gt:       d.comentario_gt ?? undefined,
            });
          }
          const linea = lineaMap.get(d.insumo_id)!;
          linea.precios[d.proveedor_id] = String(d.precio_ofertado);
          if (d.es_ganador) linea.ganador = d.proveedor_id;
        });
        return {
          id:             c.id_cuadro ?? c.id,
          requisicion_id: c.requisicion_id,
          estado:         c.estado,
          proveedores,
          lineas:         Array.from(lineaMap.values()),
          ordenes_compra: [],
        };
      };

      if (compRes.status === 'fulfilled') {
        const raw: any[] = compRes.value.data?.data || [];
        setComparativas(raw.map(normalizeComp));
      }
      if (evalRes.status === 'fulfilled' && evalRes.value) {
        const raw: any[] = evalRes.value.data?.data || [];
        setPendientesEval(raw.map(normalizeComp));
      }
      if (gtRes.status === 'fulfilled' && gtRes.value) {
        const raw: any[] = gtRes.value.data?.data || [];
        setPendientesGT(raw.map(normalizeComp));
      }
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
    const isImprevisto = reqForm.tipo === 'IMPREVISTO';
    const validItems = isImprevisto
      ? reqForm.items.filter(i => i.descripcion_libre.trim() && i.cantidad)
      : reqForm.items.filter(i => i.insumo_id && i.cantidad);
    if (validItems.length === 0) {
      alert(isImprevisto ? 'Agrega al menos un ítem con descripción y cantidad.' : 'Agrega al menos un insumo con cantidad.');
      return;
    }
    if (isDemo) {
      const folio = `REQ-${new Date().getFullYear()}-${String(requisiciones.length + 41).padStart(3, '0')}`;
      notify({
        type: 'success',
        title: 'Requisición creada',
        message: `${folio} · ${validItems.length} ítem${validItems.length !== 1 ? 's' : ''} · ${isImprevisto ? 'Imprevisto' : 'Normal'} · Prioridad ${reqForm.prioridad}`,
      });
      setShowReqForm(false);
      resetReqForm();
      return;
    }
    try {
      setFormLoading(true);
      await api.post('/api/v1/compras/requisiciones', {
        tipo:            reqForm.tipo,
        prioridad:       reqForm.prioridad,
        observaciones:   reqForm.notas || undefined,
        items: isImprevisto
          ? validItems.map(i => ({
              descripcion_libre: i.descripcion_libre,
              unidad_libre:      i.unidad_libre || 'PZA',
              cantidad:          Number(i.cantidad),
              notas:             i.notas || undefined,
              es_imprevisto:     true,
            }))
          : validItems.map(i => ({
              insumo_id: i.insumo_id,
              cantidad:  Number(i.cantidad),
              notas:     i.notas || undefined,
            })),
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
    setReqForm({ tipo: 'NORMAL', prioridad: 'MEDIA', fecha_requerida: '', notas: '', items: [{ insumo_id: '', insumo_label: '', cantidad: '', notas: '', descripcion_libre: '', unidad_libre: 'PZA' }] });
    setItemSearch([]);
    setItemDropdown(null);
  };

  const addItem = () => {
    setReqForm(f => ({ ...f, items: [...f.items, { insumo_id: '', insumo_label: '', cantidad: '', notas: '', descripcion_libre: '', unidad_libre: 'PZA' }] }));
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
      await api.post('/api/v1/gerencia-tecnica/insumos', {
        clave:         insumoForm.clave,
        descripcion:   insumoForm.descripcion,
        unidad_medida: insumoForm.unidad,
        tipo_insumo:   CLASE_TO_GT_TIPO[insumoForm.clase] ?? insumoForm.clase,
        costo_base:    Number(insumoForm.costo) || 0,
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
    setMovForm(f => ({ ...f, tipo, insumo_id: '', insumo_label: '', insumo_unidad: '', insumo_categoria: '', cantidad: '', origen: '', destino: '', responsable: '', referencia: '', notas: '' }));
    setMovSearch('');
    setShowMovForm(true);
  };

  const selectMovInsumo = (insumo: Insumo) => {
    setMovForm(f => ({
      ...f,
      insumo_id:        insumo.id,
      insumo_label:     `${insumo.clave} — ${insumo.descripcion}`,
      insumo_unidad:    insumo.unidad,
      insumo_categoria: insumo.clase,
    }));
    setMovSearch('');
    setMovDropdownOpen(false);
  };

  const handleSubmitMovimiento = async () => {
    if (!movForm.insumo_id || !movForm.cantidad) { alert('Selecciona un insumo e ingresa la cantidad.'); return; }
    if (!movForm.origen || !movForm.destino) { alert('Origen y destino son requeridos.'); return; }
    if (isDemo) {
      const cant = Number(movForm.cantidad);
      const insumoItem = inventario.find(i => i.insumo_id === movForm.insumo_id);
      const clave = insumoItem?.clave ?? movForm.insumo_label.split(' — ')[0];

      // Agregar movimiento a la lista
      const newMov: MovimientoAlmacen = {
        id: `mov-new-${Date.now()}`,
        tipo: movForm.tipo,
        fecha: new Date().toISOString().split('T')[0],
        insumo_clave: clave,
        insumo_descripcion: movForm.insumo_label.split(' — ')[1] || movForm.insumo_label,
        cantidad: cant,
        unidad: movForm.insumo_unidad,
        origen: movForm.origen,
        destino: movForm.destino,
        responsable: movForm.responsable || 'Usuario Demo',
        referencia: movForm.referencia || undefined,
      };
      setMovimientosAlmacen(prev => [newMov, ...prev]);

      // Actualizar stock en inventario
      if (insumoItem) {
        let newStock = insumoItem.stock_actual;
        if (movForm.tipo === 'INGRESO') newStock += cant;
        else if (movForm.tipo === 'EGRESO') newStock = Math.max(0, newStock - cant);
        setInventario(prev =>
          prev.map(i => i.id === insumoItem.id ? { ...i, stock_actual: newStock } : i)
        );
        // Alertas de stock (solo en EGRESO)
        if (movForm.tipo === 'EGRESO') {
          if (newStock === 0) {
            notify({ type: 'error', title: 'Stock agotado', message: `${clave} — sin existencias en almacén`, duration: 6000 });
          } else if (newStock < insumoItem.stock_minimo) {
            notify({ type: 'warning', title: 'Stock bajo mínimo', message: `${clave} · ${newStock} ${movForm.insumo_unidad} (mín. ${insumoItem.stock_minimo})`, duration: 6000 });
          }
        }
      }

      // Toast de confirmación
      const movTitles: Record<MovTipo, string> = { INGRESO: 'Ingreso registrado', EGRESO: 'Egreso registrado', TRASPASO: 'Traspaso registrado' };
      notify({ type: 'success', title: movTitles[movForm.tipo], message: `${clave} · ${cant} ${movForm.insumo_unidad}` });
      setShowMovForm(false);
      return;
    }
    try {
      setFormLoading(true);
      // Extraer clave y descripcion del label del insumo (para auto-crear ítem en primer INGRESO)
      const [clave, ...descParts] = movForm.insumo_label.split(' — ');
      await api.post('/api/v1/compras/almacen/movimientos', {
        tipo:        movForm.tipo,
        insumo_id:   movForm.insumo_id,
        clave:       clave.trim(),
        descripcion: (descParts.join(' — ').trim()) || clave.trim(),
        unidad:      movForm.insumo_unidad,
        categoria:   movForm.insumo_categoria || 'MATERIALES',
        cantidad:    Number(movForm.cantidad),
        origen:      movForm.origen,
        destino:     movForm.destino,
        responsable: movForm.responsable || undefined,
        referencia:  movForm.referencia  || undefined,
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
  const openComparativa = async (req: Requisicion) => {
    const existing = comparativas.find(c => c.requisicion_id === req.id);

    if (existing) {
      // La comparativa ya existe en estado local — abrir directamente
      // Si las lineas están vacías pero la req tiene items (posible si el cuadro existe en BD sin detalles),
      // pre-poblar con los items de la req para que Compras sepa qué cotizar
      if (existing.lineas.length === 0 && (req.items?.length ?? 0) > 0) {
        const lineasFromReq = buildLineasFromReq(req);
        setComparativas(prev => prev.map(c =>
          c.requisicion_id === req.id ? { ...c, lineas: lineasFromReq } : c
        ));
      }
    } else {
      // Crear en backend y pre-poblar lineas desde los items de la requisición
      let backendId = `comp-new-${Date.now()}`;
      if (!isDemo) {
        try {
          const res = await api.post('/api/v1/compras/comparativas', { requisicion_id: req.id });
          backendId = res.data.data?.id_cuadro ?? res.data.data?.id ?? backendId;
        } catch { /* si falla, usar ID local */ }
      }

      const lineasFromReq = buildLineasFromReq(req);
      const newComp: ComparativaLocal = {
        id: backendId,
        requisicion_id: req.id,
        estado: 'BORRADOR',
        proveedores: [],
        lineas: lineasFromReq,
        ordenes_compra: [],
      };
      setComparativas(prev => [...prev, newComp]);
    }
    setActiveReqId(req.id);
  };

  /** Construye CotizacionLineas a partir de los items de una requisición */
  const buildLineasFromReq = (req: Requisicion): import('../components/ComparativaDetail').CotizacionLinea[] => {
    return (req.items ?? []).map(item => {
      const info = insumos.find(i => i.id === item.insumo_id);
      return {
        id:                 item.id,
        insumo_id:          item.insumo_id ?? '',
        insumo_clave:       info?.clave ?? item.descripcion_libre ?? '—',
        insumo_descripcion: info?.descripcion ?? item.descripcion_libre ?? '—',
        insumo_unidad:      info?.unidad ?? item.unidad_libre ?? '—',
        cantidad:           item.cantidad,
        precios:            {},
        ganador:            null,
        evaluacion_tecnica: 'PENDIENTE' as const,
      };
    });
  };

  const updateComparativa = (updated: ComparativaLocal) => {
    setComparativas(prev =>
      prev.map(c => c.requisicion_id === updated.requisicion_id ? updated : c)
    );
    // Notificar cuando se generan OCs
    if (updated.estado === 'AUTORIZADA' && updated.ordenes_compra.length > 0) {
      const total = updated.ordenes_compra.reduce((sum, oc) => sum + oc.total, 0);
      const n = updated.ordenes_compra.length;
      notify({
        type: 'success',
        title: `${n} OC${n !== 1 ? 's' : ''} generada${n !== 1 ? 's' : ''}`,
        message: `Total comprometido: $${total.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
        duration: 6000,
      });
    }
  };

  // ── Aprobación de requisición (Procurement / Admin / Superintendent) ─────────
  const handleAprobar = async (reqId: string) => {
    if (isDemo) {
      setRequisiciones(prev => prev.map(r => r.id === reqId ? { ...r, estado: 'APROBADA' } : r));
      notify({ type: 'success', title: 'Requisición aprobada', message: 'Procuración puede iniciar el cuadro comparativo.' });
      return;
    }
    try {
      setAprobando(reqId);
      await api.patch(`/api/v1/compras/requisiciones/${reqId}/aprobar`);
      await fetchData();
      notify({ type: 'success', title: 'Requisición aprobada', message: 'Ya puedes iniciar el cuadro comparativo.' });
    } catch (err: any) {
      notify({ type: 'error', title: 'Error al aprobar', message: err.response?.data?.message || err.message });
    } finally {
      setAprobando(null);
    }
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

  const getReqCycleStep = (req: Requisicion, comp?: ComparativaLocal) => {
    if (['PENDIENTE', 'BORRADOR'].includes(req.estado))
      return { label: '🟡 Pendiente de aprobación', cls: 'bg-amber-500/10 text-amber-700 border-amber-500/20' };
    if (req.estado === 'APROBADA') {
      if (!comp)
        return { label: '🔵 Lista para cotizar', cls: 'bg-blue-500/10 text-blue-700 border-blue-500/20' };
      const s = comp.estado;
      if (s === 'BORRADOR')
        return { label: '🔵 Cotizando proveedores', cls: 'bg-blue-500/10 text-blue-700 border-blue-500/20' };
      if (s === 'EN_EVALUACION_TECNICA')
        return { label: '🟠 En evaluación técnica', cls: 'bg-amber-500/10 text-amber-700 border-amber-500/20' };
      if (s === 'EVALUADO_TECNICAMENTE')
        return { label: '🟣 Evaluado · pendiente GT', cls: 'bg-violet-500/10 text-violet-700 border-violet-500/20' };
      if (s === 'EN_APROBACION_GT')
        return { label: '🟣 En aprobación GT', cls: 'bg-violet-500/10 text-violet-700 border-violet-500/20' };
      if (['APROBADO_GT', 'AUTORIZADA'].includes(s))
        return { label: '🟢 Autorizado', cls: 'bg-green-500/10 text-green-700 border-green-500/20' };
      if (s === 'CERRADO')
        return { label: '⬜ Cerrado', cls: 'bg-slate-500/10 text-slate-600 border-slate-500/20' };
    }
    if (req.estado === 'COMPRADA')
      return { label: '🟢 OC Emitida', cls: 'bg-green-500/10 text-green-700 border-green-500/20' };
    return { label: req.estado, cls: 'bg-slate-500/10 text-slate-500 border-slate-500/20' };
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
      <div className="flex flex-wrap gap-2 rounded-2xl border border-border/30 bg-muted/30 p-1.5">
        {([
          { id: 'requisiciones'   as TabId, label: 'Requisiciones', icon: IconShoppingCart, count: requisiciones.length, show: true },
          { id: 'catalogo'        as TabId, label: 'Catálogo',      icon: IconPackage,      count: insumos.length,       show: true },
          { id: 'almacen'         as TabId, label: 'Almacén',       icon: IconLayers,       count: inventario.length,    show: true },
          // 9.1 Bandeja Residente
          { id: 'pendientes-eval' as TabId, label: 'Eval. Técnica', icon: IconClock,        count: pendientesEval.length, show: isResident || roles.includes('superintendent') },
          // 9.2 Bandeja GT
          { id: 'pendientes-gt'   as TabId, label: 'Aprob. GT',    icon: IconCheckCircle2, count: pendientesGT.length,   show: isGT },
        ] as { id: TabId; label: string; icon: React.FC<{className?: string}>; count: number; show: boolean }[])
         .filter(t => t.show)
         .map(tab => (
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
                        <div className="flex items-center justify-between gap-2">
                          {(() => {
                            const comp = comparativas.find(c => c.requisicion_id === req.id);
                            const step = getReqCycleStep(req, comp);
                            return (
                              <span className={cn('rounded-lg border px-2.5 py-1 text-[9px] font-black', step.cls)}>
                                {step.label}
                              </span>
                            );
                          })()}
                          <div className="flex shrink-0 items-center gap-2">
                            {req.tipo === 'IMPREVISTO' && (
                              <span className="rounded-md border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-orange-700">
                                Imprevisto
                              </span>
                            )}
                            <div className="text-[10px] font-bold uppercase text-muted-foreground">
                              {new Date(req.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                            </div>
                          </div>
                        </div>
                        {/* Botón "Aprobar" para Procurement en requisiciones PENDIENTE/BORRADOR */}
                        {isProcurement && ['PENDIENTE', 'BORRADOR'].includes(req.estado) && (
                          <Button
                            onClick={() => handleAprobar(req.id)}
                            disabled={aprobando === req.id}
                            className="w-full rounded-xl bg-emerald-600 text-[9px] font-black uppercase tracking-widest text-white hover:bg-emerald-500 disabled:opacity-60"
                          >
                            <IconCheckCircle2 className="h-3.5 w-3.5" />
                            {aprobando === req.id ? 'Aprobando…' : 'Aprobar Requisición'}
                          </Button>
                        )}
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
          {/* ── 9.1 TAB: Pendientes de Evaluación Técnica (Residente) ──────────── */}
          {activeTab === 'pendientes-eval' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">
                  Cuadros comparativos pendientes de tu evaluación técnica
                </p>
                <span className="rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-black text-amber-700">
                  {pendientesEval.length} pendiente{pendientesEval.length !== 1 ? 's' : ''}
                </span>
              </div>
              {pendientesEval.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/50 p-12 text-center">
                  <IconCheckCircle2 className="mx-auto mb-3 h-10 w-10 text-muted-foreground/20" />
                  <p className="text-sm font-bold text-muted-foreground">Sin cuadros pendientes de evaluación técnica</p>
                </div>
              ) : (
                pendientesEval.map(cc => (
                  <Card key={cc.id} className="rounded-2xl border-amber-500/20 bg-amber-500/5 shadow-none">
                    <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-amber-700">{(cc as any).codigo ?? cc.id.slice(0, 8)}</span>
                          {(() => {
                            const req = requisiciones.find(r => r.id === cc.requisicion_id);
                            return req ? <span className="text-[10px] text-muted-foreground">· Req {req.folio}</span> : null;
                          })()}
                        </div>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {cc.proveedores.map(prov => {
                            const total = cc.lineas.reduce((s, l) => s + l.cantidad * parseFloat(l.precios[prov.id] || '0'), 0);
                            return (
                              <span key={prov.id} className="rounded border border-amber-500/20 bg-background px-1.5 py-0.5 text-[9px] text-muted-foreground">
                                {prov.nombre} · ${total.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                              </span>
                            );
                          })}
                          {cc.proveedores.length === 0 && (
                            <span className="text-[10px] text-muted-foreground">{cc.lineas.length} renglones · sin cotizaciones</span>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => { setActiveTab('requisiciones'); setActiveReqId(cc.requisicion_id); }}
                        className="rounded-xl bg-amber-500 px-4 text-xs font-black text-white hover:bg-amber-400"
                      >
                        Evaluar →
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* ── 9.2 TAB: Pendientes de Aprobación GT ──────────────────────────── */}
          {activeTab === 'pendientes-gt' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-violet-700">
                  Cuadros comparativos pendientes de tu aprobación como Gerencia Técnica
                </p>
                <span className="rounded-full bg-violet-500/10 px-3 py-1 text-[10px] font-black text-violet-700">
                  {pendientesGT.length} pendiente{pendientesGT.length !== 1 ? 's' : ''}
                </span>
              </div>
              {pendientesGT.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/50 p-12 text-center">
                  <IconCheckCircle2 className="mx-auto mb-3 h-10 w-10 text-muted-foreground/20" />
                  <p className="text-sm font-bold text-muted-foreground">Sin cuadros pendientes de aprobación GT</p>
                </div>
              ) : (
                pendientesGT.map(cc => (
                  <Card key={cc.id} className="rounded-2xl border-violet-500/20 bg-violet-500/5 shadow-none">
                    <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-violet-700">{(cc as any).codigo ?? cc.id.slice(0, 8)}</span>
                          {(() => {
                            const req = requisiciones.find(r => r.id === cc.requisicion_id);
                            return req ? <span className="text-[10px] text-muted-foreground">· Req {req.folio}</span> : null;
                          })()}
                        </div>
                        {(() => {
                          const ganadorMap = new Map<string, number>();
                          cc.lineas.forEach(l => { if (l.ganador) ganadorMap.set(l.ganador, (ganadorMap.get(l.ganador) ?? 0) + 1); });
                          const top = [...ganadorMap.entries()].sort((a, b) => b[1] - a[1])[0];
                          if (!top) return <p className="mt-0.5 text-[11px] text-muted-foreground">{cc.lineas.length} renglones evaluados por Residente</p>;
                          const prov = cc.proveedores.find(p => p.id === top[0]);
                          const total = cc.lineas.reduce((s, l) => s + l.cantidad * parseFloat(l.precios[top[0]] || '0'), 0);
                          return (
                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                              Rec. Residente: <span className="font-black text-violet-700">{prov?.nombre ?? '—'}</span>
                              {total > 0 && <span> · ${total.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</span>}
                            </p>
                          );
                        })()}
                      </div>
                      <Button
                        onClick={() => { setActiveTab('requisiciones'); setActiveReqId(cc.requisicion_id); }}
                        className="rounded-xl bg-violet-600 px-4 text-xs font-black text-white hover:bg-violet-500"
                      >
                        Revisar y Autorizar →
                      </Button>
                    </CardContent>
                  </Card>
                ))
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
        subtitle={reqForm.tipo === 'IMPREVISTO' ? 'Imprevisto de obra — texto libre' : 'Solicitud de compra de insumos'}
        accentColor={reqForm.tipo === 'IMPREVISTO' ? 'amber' : 'emerald'}
      >
        <div className="space-y-5">

          {/* ── Selector tipo: NORMAL / IMPREVISTO ── */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tipo de requisición</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'NORMAL',     label: '📋 Normal',     sub: 'Insumos del catálogo APU' },
                { value: 'IMPREVISTO', label: '⚠️ Imprevisto', sub: 'Material sin código de catálogo' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setReqForm(f => ({ ...f, tipo: opt.value }))}
                  className={cn(
                    'flex flex-col items-start rounded-xl border px-4 py-3 text-left transition-all',
                    reqForm.tipo === opt.value
                      ? opt.value === 'IMPREVISTO'
                        ? 'border-orange-500/40 bg-orange-500/10 shadow-sm'
                        : 'border-emerald-500/40 bg-emerald-500/10 shadow-sm'
                      : 'border-border/30 bg-muted/20 hover:bg-muted/40'
                  )}
                >
                  <span className={cn(
                    'text-xs font-black',
                    reqForm.tipo === opt.value
                      ? opt.value === 'IMPREVISTO' ? 'text-orange-700' : 'text-emerald-700'
                      : 'text-foreground'
                  )}>
                    {opt.label}
                  </span>
                  <span className="mt-0.5 text-[10px] text-muted-foreground">{opt.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Imprevisto: banner informativo */}
          {reqForm.tipo === 'IMPREVISTO' && (
            <div className="flex items-start gap-3 rounded-xl border border-orange-500/20 bg-orange-500/5 px-4 py-3">
              <span className="text-orange-500 text-sm mt-0.5">⚠️</span>
              <p className="text-[10px] text-orange-700 leading-relaxed">
                Los imprevistos no requieren código de catálogo. Se registrarán como desviación en los reportes presupuestales.
                Procurement los revisará antes de cotizar.
              </p>
            </div>
          )}

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
            <Textarea className="min-h-[80px]"
              placeholder={reqForm.tipo === 'IMPREVISTO' ? 'Describe el motivo del imprevisto...' : 'Justificación de la solicitud...'}
              value={reqForm.notas}
              onChange={e => setReqForm({ ...reqForm, notas: e.target.value })}
            />
          </FormField>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {reqForm.tipo === 'IMPREVISTO' ? 'Materiales imprevistos' : 'Insumos solicitados'} <span className="text-red-500">*</span>
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
                  <SectionBadge className={cn(
                    'w-fit rounded-md px-2 py-0.5 text-[9px]',
                    reqForm.tipo === 'IMPREVISTO'
                      ? 'border-orange-500/20 bg-orange-500/10 text-orange-700'
                      : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600'
                  )}>
                    #{idx + 1}
                  </SectionBadge>

                  {/* ── IMPREVISTO: campos de texto libre ── */}
                  {reqForm.tipo === 'IMPREVISTO' ? (
                    <>
                      <FormField label="Descripción del material" required>
                        <Input
                          placeholder="Ej: Tabique rojo recocido 7x14x28 cm"
                          value={item.descripcion_libre}
                          onChange={e => updateItem(idx, 'descripcion_libre', e.target.value)}
                        />
                      </FormField>
                      <div className="grid grid-cols-2 gap-3">
                        <FormField label="Unidad" required>
                          <Select value={item.unidad_libre} onChange={e => updateItem(idx, 'unidad_libre', e.target.value)}>
                            {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
                          </Select>
                        </FormField>
                        <FormField label="Cantidad" required>
                          <Input type="number" placeholder="0" value={item.cantidad} onChange={e => updateItem(idx, 'cantidad', e.target.value)} />
                        </FormField>
                      </div>
                      <FormField label="Notas">
                        <Input className="text-xs" placeholder="Frente de trabajo, área, etc." value={item.notas} onChange={e => updateItem(idx, 'notas', e.target.value)} />
                      </FormField>
                    </>
                  ) : (
                    /* ── NORMAL: búsqueda en catálogo ── */
                    <>
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
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="border-t border-border/40 pt-4">
            <SubmitButton
              label={reqForm.tipo === 'IMPREVISTO' ? 'Crear Req. Imprevisto' : 'Crear Requisición'}
              loading={formLoading}
              color={reqForm.tipo === 'IMPREVISTO' ? 'amber' : 'emerald'}
              onClick={handleSubmitRequisicion}
            />
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
