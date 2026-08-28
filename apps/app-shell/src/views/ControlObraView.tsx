import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import api from '../lib/api';
import { useTenant } from '../context/TenantContext';
import { DEMO_BITACORAS, DEMO_AVANCES, DEMO_ESTIMACIONES } from '../lib/demoData';
import { HelpButton } from '../components/HelpButton';
import { HelpPanel } from '../components/HelpPanel';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyStatePanel,
  FormField,
  Input,
  SectionBadge,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooterBar,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
  cn,
} from '@bocam/ui-core';
import {
  IconActivity,
  IconAlertCircle,
  IconCheckCircle2,
  IconClock,
  IconFileText,
  IconPlus,
  IconRefreshCw,
  IconSearch,
  IconX,
} from '../components/Icons';
import { SlidePanel, SubmitButton } from '../components/SlidePanel';
import { ControlPresupuestalTabla, type PartidaCP } from '../components/ControlPresupuestalTabla';

// ─── Tipos Campo ──────────────────────────────────────────────────────────────

interface Bitacora {
  id_bitacora: string;
  numero_entrada: number;
  fecha: string;
  frente_trabajo: string;
  actividades_realizadas: string;
  personal_en_sitio: number;
  estado: string;
  clima?: string;
}

interface AvanceFisico {
  id_avance: string;
  concepto_id?: string | null;
  concepto_presupuesto: string;
  descripcion_concepto: string;
  cantidad_periodo: number;
  cantidad_acumulada: number;
  unidad: string;
  porcentaje_avance: number;
  importe_periodo: number;
  estado: string;
}

interface ConceptoCatalogo {
  id: string;
  clave: string;
  descripcion: string;
  unidad_medida: string;
  precio_unitario?: number;
  cantidad_presupuestada?: number;
}

interface Estimacion {
  id_estimacion: string;
  codigo: string;
  numero_estimacion: number;
  subtotal: number;
  total_neto: number;
  estado: string;
  periodo_inicio: string;
  periodo_fin: string;
  avances: any[];
}

interface InsumoClasif {
  id: string;
  clave: string;
  descripcion: string;
  tipo_insumo: string;
  categoria_gasto_id: string | null;
  categoria_gasto_nombre: string | null;
}

interface CategoriaGastoItem {
  id_categoria: string;
  nombre: string;
  es_predefinida: boolean;
  insumos_count: number;
}

interface CostosCategoriaRow {
  nombre: string;
  presupuesto: number;
  comprometido: number;
  pagado: number;
  pct_comp: number;
  pct_pag: number;
}

// ─── Tipos EVM / Control de Proyectos ────────────────────────────────────────

interface ResumenEVM {
  cpi: number | null;
  spi: number | null;
  vac: number | null;
  semaforo: 'VERDE' | 'AMARILLO' | 'ROJO' | null;
  fecha_corte: string | null;
}

interface AlertaResumen {
  id: string;
  tipo: string;
  titulo: string;
  severidad: string;
  estado: string;
  created_at: string;
}

interface DashboardCP {
  proyecto_id: string;
  resumen_evm: ResumenEVM;
  alertas_activas: { criticas: number; warnings: number; top_alertas: AlertaResumen[] };
  partidas_atrasadas: number;
  fecha_fin_proyectada: string | null;
  dias_retraso: number | null;
  sin_programacion: boolean;
}

interface Alerta {
  id: string;
  tipo: string;
  severidad: string;
  titulo: string;
  descripcion: string;
  estado: string;
  nota_cp: string | null;
  created_at: string;
  concepto_id: string | null;
}

interface PartidaEVM {
  concepto_id: string;
  concepto_clave: string;
  descripcion: string;
  estado: string;
  pct_avance_real: number;
  bac: number;
  cpi: number | null;
  spi: number | null;
  eac: number | null;
  sobre_costo_proyectado: number | null;
  semaforo: string;
}

interface EVMData {
  proyecto_id: string;
  fecha_corte: string;
  global: {
    bac: number; pv: number; ev: number; ac: number;
    cpi: number; spi: number; cv: number; sv: number;
    eac: number; etc: number; vac: number;
    fecha_fin_plan: string | null; fecha_fin_proyectada: string | null;
    semaforo: string;
  } | null;
  por_partida: PartidaEVM[];
  sin_datos: boolean;
}

interface ProgramacionItem {
  id: string;
  concepto_id: string;
  concepto_clave: string;
  descripcion: string;
  fecha_inicio_plan: string;
  fecha_fin_plan: string;
  pct_avance_real: number;
  estado: string;
  bac: number;
  cpi: number | null;
  spi: number | null;
}

interface CurvaSDato {
  proyecto_id?: string;
  periodos?: Array<{ semana: string; pv_acumulado_pct: number; pv_acumulado_mxn: number }>;
  hoy?: string;
  partidas_criticas?: Array<{ concepto_clave: string; spi: number; cpi: number | null }>;
  error?: string;
  mensaje?: string;
}

// ─── Helpers EVM ─────────────────────────────────────────────────────────────

const SEMAFORO_COLORS: Record<string, string> = {
  VERDE:    'bg-emerald-500',
  AMARILLO: 'bg-amber-400',
  ROJO:     'bg-rose-500',
};

const SEVERIDAD_COLORS: Record<string, string> = {
  CRITICA: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 border border-rose-200 dark:border-rose-800',
  WARN:    'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
  INFO:    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
};

function fmtNum(n: number | null | undefined, dec = 2): string {
  if (n === null || n === undefined) return '—';
  return n.toLocaleString('es-MX', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}
function fmtMXN(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—';
  return `$${Math.abs(n).toLocaleString('es-MX', { minimumFractionDigits: 0 })}`;
}

// ─── Tab type ─────────────────────────────────────────────────────────────────

type TabId =
  | 'dashboard'
  | 'bitacoras'
  | 'avances'
  | 'estimaciones'
  | 'evm'
  | 'curva-s'
  | 'alertas'
  | 'costos'
  | 'presupuesto-partida'
  | 'programacion'
  | 'configuracion';

// ─── Componente principal ─────────────────────────────────────────────────────

export const ControlObraView: React.FC<{ activeSubView?: string }> = ({ activeSubView }) => {
  const { tenant, user, currentProjectId } = useTenant();
  const isDemo = tenant?.id === 'iretum-demo';
  const activeTab: TabId = (activeSubView as TabId) || 'bitacoras';
  const roles: string[] = user?.role ?? [];
  const canConfig = roles.some(r => ['control_obra', 'admin'].includes(r));

  // ── Estado: campo ────────────────────────────────────────────────────────────
  const [bitacoras, setBitacoras] = useState<Bitacora[]>([]);
  const [avances, setAvances] = useState<AvanceFisico[]>([]);
  const [estimaciones, setEstimaciones] = useState<Estimacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashData, setDashData] = useState<{
    avance_general: { fisico_pct: number; financiero_pct: number; delta_pct: number };
    estimaciones_pendientes: number;
    alertas: Array<{ tipo: string; mensaje: string; severidad: string }>;
    parcial: boolean;
  } | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [showBitacoraForm, setShowBitacoraForm] = useState(false);
  const [showAvanceForm, setShowAvanceForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [bitForm, setBitForm] = useState({
    frente_trabajo: '', turno: 'DIURNO', clima: '', temperatura_c: '',
    actividades_realizadas: '', personal_en_sitio: '', incidencias: '',
    material_recibido: '', observaciones: '',
    fecha: new Date().toISOString().split('T')[0],
  });
  const [avForm, setAvForm] = useState({
    cantidad_periodo: '',
    periodo_inicio: new Date().toISOString().split('T')[0],
    periodo_fin: new Date().toISOString().split('T')[0],
  });
  const [conceptosAvance, setConceptosAvance] = useState<ConceptoCatalogo[]>([]);
  const [avanceConceptoId, setAvanceConceptoId] = useState<string | null>(null);
  const [avanceConceptoSearch, setAvanceConceptoSearch] = useState('');
  const [avanceGuardado, setAvanceGuardado] = useState<{ clave: string; cantidad: string; unidad: string } | null>(null);
  const [bitacoraGuardada, setBitacoraGuardada] = useState<number | null>(null);
  const [avanceHighlightedIndex, setAvanceHighlightedIndex] = useState(0);
  const [conceptosRecientes, setConceptosRecientes] = useState<ConceptoCatalogo[]>([]);
  const avanceSearchInputRef = useRef<HTMLInputElement>(null);

  // ── Estado: configuración ────────────────────────────────────────────────────
  const [insumosClasif, setInsumosClasif] = useState<InsumoClasif[]>([]);
  const [categoriasConfig, setCategoriasConfig] = useState<CategoriaGastoItem[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [clasifSearch, setClasifSearch] = useState('');
  const [autoClasifLoading, setAutoClasifLoading] = useState(false);
  const [bulkTipoTarget, setBulkTipoTarget] = useState<Record<string, string>>({});
  const [costosCategorias, setCostosCategorias] = useState<CostosCategoriaRow[]>([]);
  const [costosWbsCO, setCostosWbsCO] = useState<any[]>([]);
  const [loadingCostos, setLoadingCostos] = useState(false);

  // ── Estado: Presupuesto por Partida (solo lectura, ver trazabilidad-partida-gt-cp) ──
  const [ppPartidas, setPpPartidas] = useState<PartidaCP[]>([]);
  const [ppSinPartidaComprometido, setPpSinPartidaComprometido] = useState(0);
  const [ppSinPartidaPagado, setPpSinPartidaPagado] = useState(0);
  const [loadingPP, setLoadingPP] = useState(false);
  const [errorPP, setErrorPP] = useState<string | null>(null);

  // ── Estado: EVM / Control Proyectos ─────────────────────────────────────────
  const [dashCP, setDashCP] = useState<DashboardCP | null>(null);
  const [loadingDashCP, setLoadingDashCP] = useState(false);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loadingAlertas, setLoadingAlertas] = useState(false);
  const [evm, setEVM] = useState<EVMData | null>(null);
  const [loadingEVM, setLoadingEVM] = useState(false);
  const [programacion, setProgramacion] = useState<ProgramacionItem[]>([]);
  const [loadingProg, setLoadingProg] = useState(false);
  const [curvaSData, setCurvaSData] = useState<CurvaSDato | null>(null);
  const [loadingCurvaS, setLoadingCurvaS] = useState(false);
  const [modalAlerta, setModalAlerta] = useState<{ alerta: Alerta; accion: 'reconocer' | 'ignorar' } | null>(null);
  const [notaCP, setNotaCP] = useState('');
  const [enviandoAlerta, setEnviandoAlerta] = useState(false);

  // ── Fetch: campo ─────────────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      setLoading(true);
      if (isDemo) {
        setBitacoras(DEMO_BITACORAS as Bitacora[]);
        setAvances(DEMO_AVANCES as AvanceFisico[]);
        setEstimaciones(DEMO_ESTIMACIONES as Estimacion[]);
        return;
      }
      const [bitRes, avRes, estRes, dashRes] = await Promise.allSettled([
        api.get('/api/v1/control-proyectos/bitacoras'),
        api.get('/api/v1/control-proyectos/avances'),
        api.get('/api/v1/control-proyectos/estimaciones'),
        api.get('/api/v1/control-proyectos/dashboard-obra'),
      ]);
      if (bitRes.status === 'fulfilled') setBitacoras(bitRes.value.data?.data || []);
      if (avRes.status === 'fulfilled') setAvances(avRes.value.data?.data || []);
      if (estRes.status === 'fulfilled') setEstimaciones(estRes.value.data?.data || []);
      if (dashRes.status === 'fulfilled' && dashRes.value?.data?.data) setDashData(dashRes.value.data.data);
    } catch {
      setError('Error al conectar con el módulo de Control de Obra.');
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch: EVM / Control Proyectos ──────────────────────────────────────────
  const fetchDashCP = useCallback(async () => {
    if (!currentProjectId || isDemo) return;
    setLoadingDashCP(true);
    try {
      const res = await api.get('/api/v1/control-proyectos/dashboard');
      setDashCP(res.data?.data ?? null);
    } catch { /* silencio */ } finally { setLoadingDashCP(false); }
  }, [currentProjectId, isDemo]);

  const fetchAlertas = useCallback(async () => {
    if (!currentProjectId || isDemo) return;
    setLoadingAlertas(true);
    try {
      const res = await api.get('/api/v1/control-proyectos/alertas');
      setAlertas(res.data?.data ?? []);
    } catch { /* silencio */ } finally { setLoadingAlertas(false); }
  }, [currentProjectId, isDemo]);

  const fetchEVM = useCallback(async () => {
    if (!currentProjectId || isDemo) return;
    setLoadingEVM(true);
    try {
      const res = await api.get('/api/v1/control-proyectos/evm');
      setEVM(res.data?.data ?? null);
    } catch { /* silencio */ } finally { setLoadingEVM(false); }
  }, [currentProjectId, isDemo]);

  const fetchProgramacion = useCallback(async () => {
    if (!currentProjectId || isDemo) return;
    setLoadingProg(true);
    try {
      const res = await api.get('/api/v1/control-proyectos/programacion');
      setProgramacion(res.data?.data ?? []);
    } catch { /* silencio */ } finally { setLoadingProg(false); }
  }, [currentProjectId, isDemo]);

  const fetchCurvaS = useCallback(async () => {
    if (!currentProjectId || isDemo) return;
    setLoadingCurvaS(true);
    try {
      const res = await api.get('/api/v1/control-proyectos/curva-s');
      setCurvaSData(res.data?.data ?? null);
    } catch { /* silencio */ } finally { setLoadingCurvaS(false); }
  }, [currentProjectId, isDemo]);

  const loadConfiguracion = async () => {
    if (!currentProjectId) return;
    setLoadingConfig(true);
    try {
      const [insRes, catRes] = await Promise.allSettled([
        api.get('/api/v1/gerencia-tecnica/insumos'),
        api.get(`/api/v1/gerencia-tecnica/proyectos/${currentProjectId}/categorias-gasto`),
      ]);
      if (insRes.status === 'fulfilled') {
        const raw: any[] = insRes.value.data?.data || [];
        setInsumosClasif(raw.map(i => ({
          id: i.id, clave: i.clave, descripcion: i.descripcion,
          tipo_insumo: i.tipo_insumo,
          categoria_gasto_id: i.categoria_gasto_id ?? null,
          categoria_gasto_nombre: i.categoria_gasto_nombre ?? null,
        })));
      }
      if (catRes.status === 'fulfilled')
        setCategoriasConfig(catRes.value.data?.data?.categorias || []);
    } catch { /* silencioso */ } finally { setLoadingConfig(false); }
  };

  // Catálogo de conceptos del presupuesto activo — usado por el selector de
  // concepto del formulario "Registrar Avance" (ver
  // openspec/changes/fix-estimaciones-residente-desconectado).
  const loadCatalogoConceptos = async () => {
    if (isDemo) return;
    try {
      const res = await api.get('/api/v1/gerencia-tecnica/presupuesto/activo');
      const conceptosRaw: any[] = res.data?.data?.conceptos ?? [];
      setConceptosAvance(conceptosRaw.map((c: any) => ({
        id: c.id,
        clave: c.clave,
        descripcion: c.descripcion,
        unidad_medida: c.unidad_medida,
        precio_unitario: c.precio_unitario != null ? Number(c.precio_unitario) : undefined,
        cantidad_presupuestada: c.cantidad != null ? Number(c.cantidad) : undefined,
      })));
    } catch { /* silencioso */ }
  };

  const loadCostosCO = async () => {
    if (!currentProjectId) return;
    setLoadingCostos(true);
    try {
      const [catRes, wbsRes] = await Promise.allSettled([
        api.get(`/api/v1/gerencia-tecnica/proyectos/${currentProjectId}/costos-categorias`),
        api.get(`/api/v1/gerencia-tecnica/proyectos/${currentProjectId}/costos-wbs`),
      ]);
      if (catRes.status === 'fulfilled') {
        const rows: any[] = catRes.value.data?.data ?? [];
        setCostosCategorias(rows.map((r: any) => ({
          nombre: r.nombre,
          presupuesto: Number(r.presupuesto ?? 0),
          comprometido: Number(r.comprometido ?? 0),
          pagado: Number(r.pagado ?? 0),
          pct_comp: Number(r.presupuesto) > 0 ? (Number(r.comprometido) / Number(r.presupuesto)) * 100 : 0,
          pct_pag:  Number(r.presupuesto) > 0 ? (Number(r.pagado) / Number(r.presupuesto)) * 100 : 0,
        })));
      }
      if (wbsRes.status === 'fulfilled') {
        const conceptos: any[] = wbsRes.value.data?.data?.conceptos ?? [];
        setCostosWbsCO(conceptos.map((c: any) => ({
          ...c, semaforo: c.semaforo === 'ambar' ? 'amarillo' : (c.semaforo ?? 'sin_dato'),
        })));
      }
    } catch { /* silencioso */ } finally { setLoadingCostos(false); }
  };

  // Lectura desde GT — mismo endpoint agregado que usa Gerencia Técnica
  // (precedente: loadCostosCO también consulta gerencia-tecnica directo desde esta vista).
  const loadPresupuestoPartida = async () => {
    if (!currentProjectId) return;
    setLoadingPP(true);
    setErrorPP(null);
    try {
      const res = await api.get('/api/v1/gerencia-tecnica/reportes/control-presupuestal');
      const data = res.data?.data ?? res.data;
      setPpPartidas(data?.partidas ?? []);
      setPpSinPartidaComprometido(Number(data?.sin_partida_comprometido ?? 0));
      setPpSinPartidaPagado(Number(data?.sin_partida_pagado ?? 0));
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error?.message || 'Error al cargar presupuesto por partida.';
      setErrorPP(msg);
    } finally {
      setLoadingPP(false);
    }
  };

  // ── Effects ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchData();
  }, [currentProjectId]);

  useEffect(() => {
    if (activeTab === 'dashboard')    void fetchDashCP();
    if (activeTab === 'alertas')      void fetchAlertas();
    if (activeTab === 'evm')          void fetchEVM();
    if (activeTab === 'programacion') void fetchProgramacion();
    if (activeTab === 'curva-s')      void fetchCurvaS();
    if (activeTab === 'configuracion' && canConfig && !isDemo) void loadConfiguracion();
    if (activeTab === 'costos' && !isDemo) void loadCostosCO();
    if (activeTab === 'avances' && !isDemo) void loadCatalogoConceptos();
    if (activeTab === 'presupuesto-partida' && !isDemo) void loadPresupuestoPartida();
  }, [activeTab, currentProjectId]);

  // ── Acciones campo ───────────────────────────────────────────────────────────
  const handleAutoClasif = async () => {
    if (!currentProjectId) return;
    setAutoClasifLoading(true);
    try {
      const sinCategoria = insumosClasif.filter(i => !i.categoria_gasto_id);
      if (sinCategoria.length === 0) return;
      const MAPA: Record<string, string> = {
        MATERIAL: 'Materiales', EQUIPO: 'Equipo Mayor',
        SUBCONTRATO: 'Servicios y Subcontratos',
        MANO_DE_OBRA: 'Mano de Obra Subcontratada',
        INDIRECTO: 'Indirectos y Gastos Generales',
      };
      const clasificaciones: { insumo_id: string; categoria_gasto_id: string }[] = [];
      for (const ins of sinCategoria) {
        const cat = categoriasConfig.find(c => c.nombre === MAPA[ins.tipo_insumo]);
        if (cat) clasificaciones.push({ insumo_id: ins.id, categoria_gasto_id: cat.id_categoria });
      }
      if (clasificaciones.length > 0)
        await api.put('/api/v1/gerencia-tecnica/insumos/clasificacion-bulk', { clasificaciones });
      await loadConfiguracion();
    } catch { /* silencioso */ } finally { setAutoClasifLoading(false); }
  };

  const handleBulkTipo = async (tipo: string) => {
    const catId = bulkTipoTarget[tipo];
    if (!catId) return;
    const targets = insumosClasif.filter(i => i.tipo_insumo === tipo);
    try {
      await api.put('/api/v1/gerencia-tecnica/insumos/clasificacion-bulk', {
        clasificaciones: targets.map(i => ({ insumo_id: i.id, categoria_gasto_id: catId })),
      });
      await loadConfiguracion();
    } catch { /* silencioso */ }
  };

  const handleCatChange = async (insumoId: string, catId: string) => {
    try {
      await api.put(`/api/v1/gerencia-tecnica/insumos/${insumoId}/categoria`, { categoria_gasto_id: catId || null });
      setInsumosClasif(prev => prev.map(i => i.id === insumoId
        ? { ...i, categoria_gasto_id: catId || null, categoria_gasto_nombre: categoriasConfig.find(c => c.id_categoria === catId)?.nombre ?? null }
        : i));
    } catch { /* silencioso */ }
  };

  // Limpia solo los campos de captura de una entrada de bitácora, conservando
  // el frente de trabajo — el panel permanece abierto entre guardados
  // (ver openspec/changes/captura-continua-avances-bitacora).
  const clearBitacoraCaptureFields = () => {
    setBitForm(prev => ({
      frente_trabajo: prev.frente_trabajo,
      turno: 'DIURNO', clima: '', temperatura_c: '',
      actividades_realizadas: '', personal_en_sitio: '', incidencias: '',
      material_recibido: '', observaciones: '',
      fecha: new Date().toISOString().split('T')[0],
    }));
  };

  const resetBitacoraForm = () => {
    setShowBitacoraForm(false);
    setBitForm({
      frente_trabajo: '', turno: 'DIURNO', clima: '', temperatura_c: '',
      actividades_realizadas: '', personal_en_sitio: '', incidencias: '',
      material_recibido: '', observaciones: '',
      fecha: new Date().toISOString().split('T')[0],
    });
    setBitacoraGuardada(null);
  };

  const handleSubmitBitacora = async () => {
    if (!bitForm.frente_trabajo || !bitForm.actividades_realizadas) return;
    try {
      setFormLoading(true);
      const res = await api.post('/api/v1/control-proyectos/bitacoras', {
        ...bitForm,
        personal_en_sitio: Number(bitForm.personal_en_sitio) || 0,
        temperatura_c: bitForm.temperatura_c ? Number(bitForm.temperatura_c) : null,
      });
      setBitacoraGuardada(res.data?.data?.numero_entrada ?? null);
      clearBitacoraCaptureFields();
      await fetchData();
    } catch (err: any) {
      alert(`Error: ${err.response?.data?.error?.message || err.message}`);
    } finally { setFormLoading(false); }
  };

  // Limpia solo los campos de captura de un avance (concepto, cantidad,
  // periodo) — el panel permanece abierto entre guardados (ver
  // openspec/changes/captura-continua-avances-bitacora).
  const clearAvanceCaptureFields = () => {
    setAvanceConceptoId(null);
    setAvanceConceptoSearch('');
    setAvForm({
      cantidad_periodo: '',
      periodo_inicio: new Date().toISOString().split('T')[0],
      periodo_fin: new Date().toISOString().split('T')[0],
    });
  };

  const resetAvanceForm = () => {
    setShowAvanceForm(false);
    clearAvanceCaptureFields();
    setAvanceGuardado(null);
    setConceptosRecientes([]);
  };

  const handleSubmitAvance = async () => {
    if (!avanceConceptoId || !avForm.cantidad_periodo) return;
    try {
      setFormLoading(true);
      const res = await api.post('/api/v1/control-proyectos/avances', {
        concepto_id: avanceConceptoId,
        cantidad_periodo: Number(avForm.cantidad_periodo),
        periodo_inicio: avForm.periodo_inicio,
        periodo_fin: avForm.periodo_fin,
      });
      const nuevo = res.data?.data;
      if (nuevo) setAvances(prev => [...prev, nuevo]);
      setAvanceGuardado({
        clave: conceptoAvanceSeleccionado?.clave ?? '',
        cantidad: avForm.cantidad_periodo,
        unidad: conceptoAvanceSeleccionado?.unidad_medida ?? '',
      });
      if (conceptoAvanceSeleccionado) {
        const usado = conceptoAvanceSeleccionado;
        setConceptosRecientes(prev => [usado, ...prev.filter(c => c.id !== usado.id)].slice(0, 5));
      }
      clearAvanceCaptureFields();
    } catch (err: any) {
      alert(`Error: ${err.response?.data?.error?.message || err.message}`);
    } finally { setFormLoading(false); }
  };

  // Las confirmaciones inline de guardado se ocultan solas tras unos segundos
  // (ver openspec/changes/captura-continua-avances-bitacora, design.md).
  useEffect(() => {
    if (!avanceGuardado) return undefined;
    const t = setTimeout(() => setAvanceGuardado(null), 4000);
    return () => clearTimeout(t);
  }, [avanceGuardado]);

  useEffect(() => {
    if (bitacoraGuardada === null) return undefined;
    const t = setTimeout(() => setBitacoraGuardada(null), 4000);
    return () => clearTimeout(t);
  }, [bitacoraGuardada]);

  // El resaltado del selector de concepto se reinicia cada vez que cambia el
  // texto de búsqueda (ver openspec/changes/navegacion-selector-concepto-avance).
  useEffect(() => { setAvanceHighlightedIndex(0); }, [avanceConceptoSearch]);
  // El buscador recibe el foco automáticamente al mostrarse, para que las
  // flechas de navegación funcionen sin que el usuario tenga que hacer clic
  // primero (de lo contrario el foco se queda en el botón "Registrar Avance").
  useEffect(() => {
    if (showAvanceForm && !avanceConceptoId) {
      avanceSearchInputRef.current?.focus();
    }
  }, [showAvanceForm, avanceConceptoId]);

  // ── Acciones EVM ─────────────────────────────────────────────────────────────
  async function accionarAlerta() {
    if (!modalAlerta) return;
    setEnviandoAlerta(true);
    try {
      await api.patch(`/api/v1/control-proyectos/alertas/${modalAlerta.alerta.id}/${modalAlerta.accion}`, { nota_cp: notaCP });
      setModalAlerta(null);
      setNotaCP('');
      void fetchAlertas();
    } catch { /* silencio */ } finally { setEnviandoAlerta(false); }
  }

  // ── Derived ──────────────────────────────────────────────────────────────────
  const insumosPorTipo = useMemo(() => {
    const map: Record<string, InsumoClasif[]> = {};
    const q = clasifSearch.toLowerCase();
    const filtered = q ? insumosClasif.filter(i => i.clave.toLowerCase().includes(q) || i.descripcion.toLowerCase().includes(q)) : insumosClasif;
    for (const ins of filtered) {
      if (!map[ins.tipo_insumo]) map[ins.tipo_insumo] = [];
      map[ins.tipo_insumo].push(ins);
    }
    return map;
  }, [insumosClasif, clasifSearch]);

  const totalClasif = insumosClasif.filter(i => i.categoria_gasto_id).length;
  const totalSin = insumosClasif.length - totalClasif;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);

  const getEstadoBadge = (estado: string) => {
    const map: Record<string, string> = {
      BORRADOR: 'border-border bg-muted text-muted-foreground',
      FIRMADA: 'border-green-500/20 bg-green-500/10 text-green-600',
      PENDIENTE: 'border-amber-500/20 bg-amber-500/10 text-amber-600',
      VALIDADO: 'border-green-500/20 bg-green-500/10 text-green-600',
      RECHAZADO: 'border-red-500/20 bg-red-500/10 text-red-600',
      EN_REVISION: 'border-blue-500/20 bg-blue-500/10 text-blue-600',
      APROBADA_TECNICA: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-600',
      FACTURADA: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600',
    };
    return (
      <SectionBadge className={cn('rounded-full px-3 py-1 text-[10px]', map[estado] || '')}>
        {estado.replace(/_/g, ' ')}
      </SectionBadge>
    );
  };

  // Vista previa: precio/cantidad presupuestada vienen del catálogo (no de
  // campos manuales); cantidad_anterior se estima igual que el backend —
  // suma de cantidad_periodo de avances previos no RECHAZADO del mismo
  // concepto_id — para que la vista previa no prometa un acumulado distinto
  // al que realmente calculará el servidor.
  const conceptoAvanceSeleccionado = conceptosAvance.find(c => c.id === avanceConceptoId) ?? null;
  const previewCantidadAnterior = avanceConceptoId
    ? avances
        .filter(a => a.concepto_id === avanceConceptoId && a.estado !== 'RECHAZADO')
        .reduce((s, a) => s + Number(a.cantidad_periodo || 0), 0)
    : 0;
  const previewPrecioUnitario = conceptoAvanceSeleccionado?.precio_unitario ?? 0;
  const previewImporte = Number(avForm.cantidad_periodo || 0) * previewPrecioUnitario;
  const previewAcumulado = previewCantidadAnterior + Number(avForm.cantidad_periodo || 0);
  const previewPorcentaje =
    conceptoAvanceSeleccionado?.cantidad_presupuestada && conceptoAvanceSeleccionado.cantidad_presupuestada > 0
      ? ((previewAcumulado / conceptoAvanceSeleccionado.cantidad_presupuestada) * 100).toFixed(1)
      : null;

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="animate-in space-y-8 fade-in duration-700">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="space-y-3">
          <SectionBadge className="border-sky-500/20 bg-sky-500/10 text-sky-700">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Operaciones en campo
          </SectionBadge>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-500/5 bg-sky-500/10 shadow-inner">
              <IconFileText className="h-8 w-8 text-sky-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-foreground">
                Control de Obra
              </h1>
              <p className="mt-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Bitácoras · Avances · EVM · Alertas · Programación
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <HelpButton onClick={() => setHelpOpen(true)} />
          {!isDemo && (activeTab === 'bitacoras' || activeTab === 'avances') && (
            <Button
              onClick={() => activeTab === 'bitacoras' ? setShowBitacoraForm(true) : setShowAvanceForm(true)}
              className="bg-sky-600 text-white shadow-xl shadow-sky-600/20 hover:bg-sky-500"
            >
              <IconPlus className="h-4 w-4" />
              {activeTab === 'bitacoras' ? 'Nueva Bitácora' : 'Registrar Avance'}
            </Button>
          )}
        </div>
      </div>

      {/* ── KPIs campo (solo en tabs de campo) ──────────────────────────────── */}
      {dashData && ['bitacoras', 'avances', 'estimaciones', 'costos'].includes(activeTab) && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Card className="rounded-2xl border-sky-500/20 bg-sky-500/5 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-sky-600">Avance Físico</p>
              <p className="mt-1 text-3xl font-black text-foreground">{dashData.avance_general.fisico_pct.toFixed(1)}%</p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-sky-100">
                <div className="h-full rounded-full bg-sky-500" style={{ width: `${Math.min(dashData.avance_general.fisico_pct, 100)}%` }} />
              </div>
            </Card>
            <Card className="rounded-2xl border-border/30 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Avance Financiero</p>
              <p className="mt-1 text-3xl font-black text-foreground">
                {dashData.avance_general.financiero_pct != null ? `${dashData.avance_general.financiero_pct.toFixed(1)}%` : '—'}
              </p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(dashData.avance_general.financiero_pct ?? 0, 100)}%` }} />
              </div>
            </Card>
            <Card className={`rounded-2xl border p-4 ${(dashData.avance_general.delta_pct ?? 0) < -5 ? 'border-red-500/20 bg-red-500/5' : (dashData.avance_general.delta_pct ?? 0) > 5 ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-border/30'}`}>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Delta Físico-Fin.</p>
              <p className={`mt-1 text-3xl font-black ${(dashData.avance_general.delta_pct ?? 0) < -5 ? 'text-red-600' : (dashData.avance_general.delta_pct ?? 0) > 5 ? 'text-emerald-600' : 'text-foreground'}`}>
                {dashData.avance_general.delta_pct != null ? `${dashData.avance_general.delta_pct >= 0 ? '+' : ''}${dashData.avance_general.delta_pct.toFixed(1)}%` : '—'}
              </p>
            </Card>
            <Card className={`rounded-2xl border p-4 ${dashData.estimaciones_pendientes > 0 ? 'border-amber-500/20 bg-amber-500/5' : 'border-border/30'}`}>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Est. Pendientes</p>
              <p className={`mt-1 text-3xl font-black ${dashData.estimaciones_pendientes > 0 ? 'text-amber-700' : 'text-foreground'}`}>
                {dashData.estimaciones_pendientes}
              </p>
            </Card>
          </div>
          {dashData.alertas.length > 0 && (
            <div className="space-y-2">
              {dashData.alertas.map((a, i) => (
                <div key={i} className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${a.severidad === 'critica' ? 'border-red-500/30 bg-red-500/5 text-red-700' : 'border-amber-500/30 bg-amber-500/5 text-amber-700'}`}>
                  <IconAlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="text-xs font-bold">{a.mensaje}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Contenido por tab ────────────────────────────────────────────────── */}
      {loading && ['bitacoras', 'avances', 'estimaciones'].includes(activeTab) ? (
        <Card className="border-border/40">
          <CardContent className="flex h-96 flex-col items-center justify-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-500/10 border-t-sky-600" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">
              Sincronizando con campo...
            </p>
          </CardContent>
        </Card>
      ) : error && ['bitacoras', 'avances', 'estimaciones'].includes(activeTab) ? (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="space-y-4 p-12 text-center">
            <IconAlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <h3 className="text-xl font-black uppercase tracking-tighter text-destructive">Módulo offline</h3>
            <p className="mx-auto max-w-sm text-xs font-medium text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* ── DASHBOARD EVM ─────────────────────────────────────────────────── */}
          {activeTab === 'dashboard' && (
            loadingDashCP ? (
              <Card className="border-border/40">
                <CardContent className="flex h-64 items-center justify-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-500/10 border-t-sky-600" />
                </CardContent>
              </Card>
            ) : !dashCP ? (
              <EmptyStatePanel title="Sin datos de proyecto" description="No se encontraron datos del proyecto para el módulo EVM." />
            ) : dashCP.sin_programacion ? (
              <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
                <CardContent className="p-8 text-center">
                  <p className="text-amber-700 dark:text-amber-300 font-bold text-lg">Sin programación de obra</p>
                  <p className="text-amber-600 dark:text-amber-400 mt-2 text-sm">
                    Carga la programación de obra en la pestaña "Programación" para activar el Dashboard EVM y la Curva S.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="rounded-2xl border-border/30 p-4 flex flex-col items-center gap-2">
                    <span className={`w-10 h-10 rounded-full ${SEMAFORO_COLORS[dashCP.resumen_evm.semaforo ?? 'AMARILLO']}`} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Semáforo</p>
                    <p className="font-black text-foreground">{dashCP.resumen_evm.semaforo ?? '—'}</p>
                  </Card>
                  <Card className="rounded-2xl border-border/30 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">CPI Global</p>
                    <p className="mt-1 text-3xl font-black text-foreground">{dashCP.resumen_evm.cpi !== null ? fmtNum(dashCP.resumen_evm.cpi, 3) : '—'}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{dashCP.resumen_evm.cpi !== null && dashCP.resumen_evm.cpi < 1 ? 'Sobre costo' : 'Dentro del costo'}</p>
                  </Card>
                  <Card className="rounded-2xl border-border/30 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">SPI Global</p>
                    <p className="mt-1 text-3xl font-black text-foreground">{dashCP.resumen_evm.spi !== null ? fmtNum(dashCP.resumen_evm.spi, 3) : '—'}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{dashCP.resumen_evm.spi !== null && dashCP.resumen_evm.spi < 1 ? 'Con atraso' : 'En tiempo'}</p>
                  </Card>
                  <Card className="rounded-2xl border-border/30 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">VAC</p>
                    <p className={`mt-1 text-3xl font-black ${dashCP.resumen_evm.vac !== null && dashCP.resumen_evm.vac < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {dashCP.resumen_evm.vac !== null ? fmtMXN(dashCP.resumen_evm.vac) : '—'}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">{dashCP.resumen_evm.vac !== null && dashCP.resumen_evm.vac < 0 ? 'Pérdida proyectada' : 'Ganancia proyectada'}</p>
                  </Card>
                </div>

                <Card className="border-border/40">
                  <CardHeader className="border-b border-border/30 bg-muted/20 px-5 py-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xs font-black uppercase tracking-widest">Alertas activas</CardTitle>
                      <div className="flex gap-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">{dashCP.alertas_activas.criticas} críticas</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{dashCP.alertas_activas.warnings} warnings</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="divide-y divide-border/20 p-0">
                    {dashCP.alertas_activas.top_alertas.length === 0 ? (
                      <p className="p-5 text-sm text-muted-foreground">Sin alertas activas</p>
                    ) : dashCP.alertas_activas.top_alertas.map(a => (
                      <div key={a.id} className="flex items-start gap-3 px-5 py-3">
                        <span className={`mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${SEVERIDAD_COLORS[a.severidad] ?? ''}`}>{a.severidad}</span>
                        <div>
                          <p className="text-sm font-medium text-foreground">{a.titulo}</p>
                          <p className="text-xs text-muted-foreground">{a.tipo.replace(/_/g, ' ')}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {dashCP.fecha_fin_proyectada && (
                  <Card className="border-border/40 p-5 flex items-center gap-6">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fecha fin proyectada</p>
                      <p className="text-xl font-black text-foreground">{dashCP.fecha_fin_proyectada}</p>
                    </div>
                    {dashCP.dias_retraso !== null && dashCP.dias_retraso > 0 && (
                      <div className="text-red-600">
                        <p className="text-[10px] font-black uppercase tracking-widest">Retraso proyectado</p>
                        <p className="text-xl font-black">{dashCP.dias_retraso} días</p>
                      </div>
                    )}
                  </Card>
                )}
              </div>
            )
          )}

          {/* ── BITÁCORAS ─────────────────────────────────────────────────────── */}
          {activeTab === 'bitacoras' && (
            <div className="space-y-4">
              {bitacoras.length === 0 ? (
                <EmptyStatePanel
                  icon={<IconFileText className="h-12 w-12 text-muted-foreground/20" />}
                  title="Sin bitácoras registradas"
                  action={!isDemo ? (
                    <Button onClick={() => setShowBitacoraForm(true)} variant="outline" className="border-sky-500/20 text-sky-600 hover:bg-sky-500/5">
                      <IconPlus className="h-4 w-4" /> Crear primera bitácora
                    </Button>
                  ) : undefined}
                />
              ) : bitacoras.map((b) => (
                <Card key={b.id_bitacora} className="group border-border/40 transition-all hover:-translate-y-0.5 hover:shadow-xl">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 text-lg font-black text-sky-600">
                          #{b.numero_entrada}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold tracking-tight text-foreground">{b.frente_trabajo}</h3>
                          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            {new Date(b.fecha).toLocaleDateString('es-MX', { weekday: 'long', day: '2-digit', month: 'long' })}
                            {b.clima ? ` · ${b.clima}` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <SectionBadge className="rounded-lg bg-muted px-2.5 py-1 text-muted-foreground">
                          {b.personal_en_sitio} personas
                        </SectionBadge>
                        {getEstadoBadge(b.estado)}
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">{b.actividades_realizadas}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* ── AVANCES ───────────────────────────────────────────────────────── */}
          {activeTab === 'avances' && (
            <Card className="overflow-hidden border-border/40 shadow-xl">
              <TableContainer>
                <Table className="min-w-[760px]">
                  <TableHeader>
                    <tr>
                      <TableHead>Concepto</TableHead>
                      <TableHead className="text-center">Avance</TableHead>
                      <TableHead className="text-right">Importe Periodo</TableHead>
                      <TableHead className="text-center">Estado</TableHead>
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {avances.length === 0 ? (
                      <tr>
                        <TableCell colSpan={4} className="py-16 text-center text-sm font-bold uppercase tracking-widest text-muted-foreground">Sin avances registrados</TableCell>
                      </tr>
                    ) : avances.map((a) => (
                      <TableRow key={a.id_avance}>
                        <TableCell>
                          <div className="text-xs font-black uppercase tracking-tighter text-sky-600">{a.concepto_presupuesto}</div>
                          <div className="mt-0.5 max-w-[250px] truncate text-sm font-medium text-foreground/80">{a.descripcion_concepto}</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1.5">
                            <span className="text-lg font-black text-foreground">{Number(a.porcentaje_avance).toFixed(1)}%</span>
                            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                              <div className="h-full rounded-full bg-sky-500 transition-all" style={{ width: `${Math.min(Number(a.porcentaje_avance), 100)}%` }} />
                            </div>
                            <span className="text-[9px] font-bold text-muted-foreground">{Number(a.cantidad_periodo).toLocaleString()} {a.unidad}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-mono text-base font-black text-foreground">{formatCurrency(Number(a.importe_periodo))}</span>
                        </TableCell>
                        <TableCell className="text-center">{getEstadoBadge(a.estado)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {avances.length > 0 && (
                <TableFooterBar>
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total periodo ({avances.length} conceptos)</span>
                  <span className="font-mono text-lg font-black text-foreground">
                    {formatCurrency(avances.reduce((s, a) => s + Number(a.importe_periodo), 0))}
                  </span>
                </TableFooterBar>
              )}
            </Card>
          )}

          {/* ── ESTIMACIONES ──────────────────────────────────────────────────── */}
          {activeTab === 'estimaciones' && (
            <div className="grid gap-6">
              {estimaciones.length === 0 ? (
                <EmptyStatePanel
                  icon={<IconActivity className="h-12 w-12 text-muted-foreground/20" />}
                  title="Sin estimaciones"
                  description="Registra y valida avances para crear la primera estimación."
                />
              ) : estimaciones.map((e) => (
                <Card key={e.id_estimacion} className="group relative overflow-hidden border-border/40 transition-all hover:shadow-xl">
                  <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-sky-500 via-indigo-500 to-sky-500 opacity-50" />
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <div className="mb-1 flex items-center gap-3">
                          <span className="text-2xl font-black tracking-tighter text-sky-600">EST #{e.numero_estimacion}</span>
                          {getEstadoBadge(e.estado)}
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{e.codigo}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black tracking-tighter text-foreground">{formatCurrency(Number(e.total_neto))}</div>
                        <p className="mt-0.5 text-[10px] font-bold text-muted-foreground">NETO A FACTURAR</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-6 text-[11px] font-medium text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <IconClock className="h-3.5 w-3.5" />
                        {new Date(e.periodo_inicio).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                        {' - '}
                        {new Date(e.periodo_fin).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <IconCheckCircle2 className="h-3.5 w-3.5" />
                        {e.avances?.length || 0} conceptos
                      </span>
                      <span className="text-[10px] font-bold">Subtotal: {formatCurrency(Number(e.subtotal))}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* ── EVM DETALLE ───────────────────────────────────────────────────── */}
          {activeTab === 'evm' && (
            loadingEVM ? (
              <Card className="border-border/40"><CardContent className="flex h-64 items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-500/10 border-t-sky-600" /></CardContent></Card>
            ) : !evm || evm.sin_datos ? (
              <EmptyStatePanel title="Sin datos EVM" description="Cargue la programación de obra para activar el análisis EVM." />
            ) : (
              <div className="space-y-6">
                {evm.global && (
                  <Card className="border-border/40">
                    <CardHeader className="border-b border-border/30 bg-muted/20 px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className={`w-4 h-4 rounded-full ${SEMAFORO_COLORS[evm.global.semaforo] ?? 'bg-muted'}`} />
                        <CardTitle className="text-xs font-black uppercase tracking-widest">EVM Global — Corte {evm.fecha_corte}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-5">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: 'BAC', val: fmtMXN(evm.global.bac) },
                          { label: 'PV (planificado)', val: fmtMXN(evm.global.pv) },
                          { label: 'EV (ganado)', val: fmtMXN(evm.global.ev) },
                          { label: 'AC (real)', val: fmtMXN(evm.global.ac) },
                          { label: 'CPI', val: fmtNum(evm.global.cpi, 3) },
                          { label: 'SPI', val: fmtNum(evm.global.spi, 3) },
                          { label: 'EAC (costo final)', val: fmtMXN(evm.global.eac) },
                          { label: 'VAC', val: fmtMXN(evm.global.vac) },
                        ].map(({ label, val }) => (
                          <div key={label} className="rounded-xl bg-muted/40 p-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
                            <p className="mt-1 font-black text-foreground">{val}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                <Card className="overflow-hidden border-border/40">
                  <TableContainer>
                    <Table className="min-w-[900px]">
                      <TableHeader>
                        <tr>
                          <TableHead>Partida</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="text-right">Avance %</TableHead>
                          <TableHead className="text-right">BAC</TableHead>
                          <TableHead className="text-right">CPI</TableHead>
                          <TableHead className="text-right">SPI</TableHead>
                          <TableHead className="text-right">EAC</TableHead>
                          <TableHead className="text-center">🚦</TableHead>
                        </tr>
                      </TableHeader>
                      <TableBody>
                        {evm.por_partida.map(p => (
                          <TableRow key={p.concepto_id}>
                            <TableCell>
                              <p className="text-xs font-black text-sky-600">{p.concepto_clave}</p>
                              <p className="text-[10px] text-muted-foreground">{p.descripcion.substring(0, 40)}</p>
                            </TableCell>
                            <TableCell>
                              <SectionBadge className={cn('rounded-full px-2 py-0.5 text-[9px]',
                                p.estado === 'COMPLETADA' ? 'border-green-500/20 bg-green-500/10 text-green-600' :
                                p.estado === 'EN_CURSO'   ? 'border-blue-500/20 bg-blue-500/10 text-blue-600' :
                                p.estado === 'ATRASADA'   ? 'border-red-500/20 bg-red-500/10 text-red-600' :
                                'border-border bg-muted text-muted-foreground'
                              )}>{p.estado}</SectionBadge>
                            </TableCell>
                            <TableCell className="text-right font-black">{p.pct_avance_real.toFixed(1)}%</TableCell>
                            <TableCell className="text-right font-mono text-xs">{fmtMXN(p.bac)}</TableCell>
                            <TableCell className="text-right font-black">{p.cpi !== null ? fmtNum(p.cpi, 3) : '—'}</TableCell>
                            <TableCell className="text-right font-black">{p.spi !== null ? fmtNum(p.spi, 3) : '—'}</TableCell>
                            <TableCell className="text-right font-mono text-xs">{p.eac !== null ? fmtMXN(p.eac) : '—'}</TableCell>
                            <TableCell className="text-center">
                              <span className={`inline-block w-3 h-3 rounded-full ${SEMAFORO_COLORS[p.semaforo] ?? 'bg-muted'}`} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              </div>
            )
          )}

          {/* ── CURVA S ───────────────────────────────────────────────────────── */}
          {activeTab === 'curva-s' && (
            loadingCurvaS ? (
              <Card className="border-border/40"><CardContent className="flex h-64 items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-500/10 border-t-sky-600" /></CardContent></Card>
            ) : !curvaSData ? (
              <EmptyStatePanel title="Sin datos" description="Cargue la programación para ver la Curva S." />
            ) : curvaSData.error === 'SIN_PROGRAMACION' ? (
              <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
                <CardContent className="p-8 text-center">
                  <p className="font-bold text-amber-700 dark:text-amber-300">{curvaSData.mensaje}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {curvaSData.partidas_criticas && curvaSData.partidas_criticas.length > 0 && (
                  <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                    <CardContent className="p-4">
                      <p className="font-bold text-red-700 dark:text-red-300 mb-2 text-sm">Partidas críticas (SPI &lt; 0.85)</p>
                      <div className="flex flex-wrap gap-2">
                        {curvaSData.partidas_criticas.map(p => (
                          <SectionBadge key={p.concepto_clave} className="border-red-500/20 bg-red-500/10 text-red-700 rounded-full px-3 text-[10px]">
                            {p.concepto_clave} — SPI {p.spi.toFixed(3)}
                          </SectionBadge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                <Card className="overflow-hidden border-border/40">
                  <TableContainer>
                    <Table>
                      <TableHeader>
                        <tr>
                          <TableHead>Semana</TableHead>
                          <TableHead className="text-right">PV Acum. %</TableHead>
                          <TableHead className="text-right">PV Acum. MXN</TableHead>
                        </tr>
                      </TableHeader>
                      <TableBody>
                        {(curvaSData.periodos ?? []).map(p => (
                          <TableRow key={p.semana} className={p.semana === curvaSData.hoy ? 'bg-sky-500/5' : ''}>
                            <TableCell>
                              <span className="font-mono text-xs">{p.semana}</span>
                              {p.semana === curvaSData.hoy && <SectionBadge className="ml-2 border-sky-500/20 bg-sky-500/10 text-sky-600 text-[9px] rounded-full px-2">hoy</SectionBadge>}
                            </TableCell>
                            <TableCell className="text-right font-black">{p.pv_acumulado_pct.toFixed(1)}%</TableCell>
                            <TableCell className="text-right font-mono text-xs">{fmtMXN(p.pv_acumulado_mxn)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              </div>
            )
          )}

          {/* ── ALERTAS ───────────────────────────────────────────────────────── */}
          {activeTab === 'alertas' && (
            <div className="space-y-3">
              {loadingAlertas ? (
                <Card className="border-border/40"><CardContent className="flex h-40 items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-500/10 border-t-sky-600" /></CardContent></Card>
              ) : alertas.length === 0 ? (
                <EmptyStatePanel
                  icon={<IconCheckCircle2 className="h-12 w-12 text-muted-foreground/20" />}
                  title="Sin alertas activas"
                  description="El sistema monitorea automáticamente las métricas del proyecto."
                />
              ) : alertas.map(a => (
                <Card key={a.id} className="border-border/40 transition-all hover:shadow-md">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <span className={`mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase shrink-0 ${SEVERIDAD_COLORS[a.severidad] ?? ''}`}>{a.severidad}</span>
                        <div>
                          <p className="font-black text-sm text-foreground">{a.titulo}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{a.descripcion}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {a.tipo.replace(/_/g, ' ')} · {a.estado} · {new Date(a.created_at).toLocaleDateString('es-MX')}
                          </p>
                          {a.nota_cp && <p className="text-xs text-sky-600 mt-1">Nota: {a.nota_cp}</p>}
                        </div>
                      </div>
                      {a.estado === 'ACTIVA' && (
                        <div className="flex gap-2 shrink-0">
                          <Button
                            onClick={() => { setModalAlerta({ alerta: a, accion: 'reconocer' }); setNotaCP(''); }}
                            className="h-8 bg-sky-600 px-3 text-[10px] font-black text-white hover:bg-sky-500"
                          >
                            Reconocer
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => { setModalAlerta({ alerta: a, accion: 'ignorar' }); setNotaCP(''); }}
                            className="h-8 px-3 text-[10px] font-black"
                          >
                            Ignorar
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* ── COSTOS ────────────────────────────────────────────────────────── */}
          {activeTab === 'costos' && (
            loadingCostos ? (
              <Card className="border-border/40"><CardContent className="flex h-64 items-center justify-center gap-3"><div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-500/10 border-t-sky-600" /></CardContent></Card>
            ) : (
              <div className="space-y-6">
                {(() => {
                  const totalPres = costosCategorias.reduce((s, r) => s + r.presupuesto, 0);
                  const totalComp = costosCategorias.reduce((s, r) => s + r.comprometido, 0);
                  const totalPag  = costosCategorias.reduce((s, r) => s + r.pagado, 0);
                  const avFisico  = avances.length > 0 ? avances.reduce((s, a) => s + Number(a.porcentaje_avance), 0) / avances.length : 0;
                  const fmt = (n: number) => `$${n.toLocaleString('es-MX', { maximumFractionDigits: 0 })}`;
                  return (
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                      {[
                        { label: 'Presupuesto Total', value: fmt(totalPres), color: 'text-sky-600', bg: 'bg-sky-500/10' },
                        { label: 'Comprometido',     value: fmt(totalComp), color: 'text-amber-600', bg: 'bg-amber-500/10' },
                        { label: 'Pagado',           value: fmt(totalPag),  color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
                        { label: '% Avance Físico',  value: `${avFisico.toFixed(1)}%`, color: 'text-violet-600', bg: 'bg-violet-500/10' },
                      ].map(kpi => (
                        <Card key={kpi.label} className="rounded-2xl border-border/30 p-5">
                          <CardContent className="p-0">
                            <div className={cn('mb-3 flex h-10 w-10 items-center justify-center rounded-xl', kpi.bg)}>
                              <span className={cn('text-base font-black', kpi.color)}>$</span>
                            </div>
                            <div className={cn('mb-0.5 text-xl font-black tracking-tighter', kpi.color)}>{kpi.value}</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{kpi.label}</div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  );
                })()}
                {costosCategorias.length > 0 && (
                  <Card className="overflow-hidden border-border/40">
                    <CardHeader className="border-b border-border/30 bg-muted/20 px-5 py-3">
                      <CardTitle className="text-xs font-black uppercase tracking-widest">Progreso por Categoría</CardTitle>
                    </CardHeader>
                    <CardContent className="divide-y divide-border/20 p-0">
                      {costosCategorias.map(cat => (
                        <div key={cat.nombre} className="px-5 py-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground">{cat.nombre}</span>
                            <div className="flex items-center gap-3 text-[10px]">
                              <span className="text-amber-700 font-mono font-black">${cat.comprometido.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</span>
                              <span className="text-muted-foreground">/</span>
                              <span className="font-mono text-muted-foreground">${cat.presupuesto.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</span>
                            </div>
                          </div>
                          <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
                            <div className="absolute h-full rounded-full bg-emerald-500/60 transition-all" style={{ width: `${Math.min(cat.pct_pag, 100)}%` }} />
                            <div className="absolute h-full rounded-full bg-amber-500/80 transition-all" style={{ width: `${Math.min(cat.pct_comp, 100)}%` }} />
                          </div>
                          <div className="flex gap-4 text-[9px] text-muted-foreground">
                            <span>🟡 Comprometido {cat.pct_comp.toFixed(1)}%</span>
                            <span>🟢 Pagado {cat.pct_pag.toFixed(1)}%</span>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
                {costosCategorias.length === 0 && costosWbsCO.length === 0 && (
                  <EmptyStatePanel title="Sin datos de costos" description="Asigna categorías a los insumos y crea requisiciones con partida para ver el resumen." />
                )}
              </div>
            )
          )}

          {/* ── PRESUPUESTO POR PARTIDA (solo lectura) ──────────────────────────── */}
          {activeTab === 'presupuesto-partida' && (
            loadingPP ? (
              <Card className="border-border/40"><CardContent className="flex h-64 items-center justify-center gap-3"><div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-500/10 border-t-sky-600" /></CardContent></Card>
            ) : errorPP ? (
              <Card className="border-destructive/20 bg-destructive/5"><CardContent className="p-6 text-center text-sm font-bold text-destructive">{errorPP}</CardContent></Card>
            ) : ppPartidas.length === 0 ? (
              <EmptyStatePanel title="Sin presupuesto por partida" description="No hay un presupuesto de obra aprobado y sincronizado para este proyecto todavía." />
            ) : (
              <ControlPresupuestalTabla
                partidas={ppPartidas}
                sinPartidaComprometido={ppSinPartidaComprometido}
                sinPartidaPagado={ppSinPartidaPagado}
              />
            )
          )}

          {/* ── PROGRAMACIÓN ──────────────────────────────────────────────────── */}
          {activeTab === 'programacion' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Gantt por partida</p>
                <Button variant="outline" onClick={() => void fetchProgramacion()} className="h-8 px-3 text-[10px] font-black">
                  <IconRefreshCw className="h-3 w-3" /> Actualizar
                </Button>
              </div>
              {loadingProg ? (
                <Card className="border-border/40"><CardContent className="flex h-40 items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-500/10 border-t-sky-600" /></CardContent></Card>
              ) : programacion.length === 0 ? (
                <EmptyStatePanel
                  title="Sin programación cargada"
                  description="Use el endpoint POST /api/v1/control-proyectos/programacion para cargar el Gantt de la obra."
                />
              ) : (
                <Card className="overflow-hidden border-border/40">
                  <TableContainer>
                    <Table className="min-w-[760px]">
                      <TableHeader>
                        <tr>
                          <TableHead>Partida</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Inicio Plan</TableHead>
                          <TableHead>Fin Plan</TableHead>
                          <TableHead className="text-right">Avance</TableHead>
                          <TableHead className="text-right">BAC</TableHead>
                        </tr>
                      </TableHeader>
                      <TableBody>
                        {programacion.map(p => (
                          <TableRow key={p.id}>
                            <TableCell>
                              <p className="text-xs font-black text-sky-600">{p.concepto_clave}</p>
                              <p className="text-[10px] text-muted-foreground">{p.descripcion.substring(0, 45)}</p>
                            </TableCell>
                            <TableCell>
                              <SectionBadge className={cn('rounded-full px-2 py-0.5 text-[9px]',
                                p.estado === 'COMPLETADA' ? 'border-green-500/20 bg-green-500/10 text-green-600' :
                                p.estado === 'EN_CURSO'   ? 'border-blue-500/20 bg-blue-500/10 text-blue-600' :
                                p.estado === 'ATRASADA'   ? 'border-red-500/20 bg-red-500/10 text-red-600' :
                                'border-border bg-muted text-muted-foreground'
                              )}>{p.estado}</SectionBadge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">{new Date(p.fecha_inicio_plan).toLocaleDateString('es-MX')}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{new Date(p.fecha_fin_plan).toLocaleDateString('es-MX')}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                                  <div className="h-full rounded-full bg-sky-500" style={{ width: `${p.pct_avance_real}%` }} />
                                </div>
                                <span className="text-xs font-black">{p.pct_avance_real.toFixed(1)}%</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs">{fmtMXN(p.bac)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              )}
            </div>
          )}

          {/* ── CONFIGURACIÓN ─────────────────────────────────────────────────── */}
          {activeTab === 'configuracion' && canConfig && (
            loadingConfig ? (
              <Card className="border-border/40"><CardContent className="flex h-64 items-center justify-center gap-3"><div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-500/10 border-t-sky-600" /></CardContent></Card>
            ) : (
              <div className="space-y-6">
                <Card className="border-border/40">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-black text-foreground">{totalClasif}/{insumosClasif.length} insumos clasificados</p>
                        <p className="text-[10px] text-muted-foreground">{totalSin} sin categoría asignada</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" className="h-8 gap-1.5 rounded-xl border-sky-500/20 px-3 text-[10px] font-black uppercase tracking-widest text-sky-600 hover:bg-sky-500/5" onClick={handleAutoClasif} disabled={autoClasifLoading || totalSin === 0}>
                          <IconRefreshCw className={cn('h-3 w-3', autoClasifLoading && 'animate-spin')} />
                          {autoClasifLoading ? 'Clasificando...' : 'Auto-clasificar'}
                        </Button>
                        <Button variant="ghost" className="h-8 gap-1.5 rounded-xl px-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground" onClick={loadConfiguracion}>
                          <IconRefreshCw className="h-3 w-3" /> Actualizar
                        </Button>
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-sky-500 transition-all duration-500" style={{ width: insumosClasif.length > 0 ? `${(totalClasif / insumosClasif.length) * 100}%` : '0%' }} />
                    </div>
                  </CardContent>
                </Card>
                <div className="relative max-w-sm">
                  <IconSearch className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-9 text-xs" placeholder="Buscar insumo..." value={clasifSearch} onChange={e => setClasifSearch(e.target.value)} />
                </div>
                {Object.entries(insumosPorTipo).map(([tipo, insumos]) => (
                  <Card key={tipo} className="overflow-hidden border-border/40">
                    <CardHeader className="border-b border-border/30 bg-muted/20 px-5 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-xs font-black uppercase tracking-widest text-foreground">{tipo}</CardTitle>
                          <SectionBadge className="rounded-full px-2 py-0.5 text-[9px]">{insumos.filter(i => i.categoria_gasto_id).length}/{insumos.length}</SectionBadge>
                        </div>
                        <div className="flex items-center gap-2">
                          <select className="rounded-xl border border-border/40 bg-muted/30 px-3 py-1.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-sky-500/40" value={bulkTipoTarget[tipo] ?? ''} onChange={e => setBulkTipoTarget(prev => ({ ...prev, [tipo]: e.target.value }))}>
                            <option value="">Seleccionar categoría...</option>
                            {categoriasConfig.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
                          </select>
                          <Button variant="outline" className="h-7 gap-1 rounded-xl border-sky-500/20 px-2.5 text-[9px] font-black text-sky-600 hover:bg-sky-500/5 disabled:opacity-40" disabled={!bulkTipoTarget[tipo]} onClick={() => handleBulkTipo(tipo)}>
                            Aplicar a todos
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="divide-y divide-border/20 p-0">
                      {insumos.map(ins => (
                        <div key={ins.id} className={cn('flex flex-wrap items-center gap-3 px-5 py-3', !ins.categoria_gasto_id && 'bg-amber-500/5')}>
                          <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[9px] font-black text-muted-foreground">{ins.clave}</span>
                          <span className="flex-1 min-w-0 truncate text-xs text-foreground">{ins.descripcion}</span>
                          <select className="shrink-0 rounded-xl border border-border/40 bg-muted/30 px-2.5 py-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-sky-500/40" value={ins.categoria_gasto_id ?? ''} onChange={e => handleCatChange(ins.id, e.target.value)}>
                            <option value="">Sin categoría</option>
                            {categoriasConfig.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
                          </select>
                          {!ins.categoria_gasto_id && (
                            <span className="shrink-0 rounded-md border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-black text-amber-700">Sin clasificar</span>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
                {insumosClasif.length === 0 && !loadingConfig && (
                  <EmptyStatePanel title="Sin insumos en el catálogo" description="Importa el catálogo de insumos desde Gerencia Técnica primero." />
                )}
              </div>
            )
          )}
        </>
      )}

      {/* ── Formularios (Slide Panels) ───────────────────────────────────────── */}
      <SlidePanel isOpen={showBitacoraForm} onClose={resetBitacoraForm} title="Nueva Bitácora" subtitle="Registro diario de actividades en campo" accentColor="sky">
        <div className="space-y-5">
          {bitacoraGuardada !== null && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-3 py-2">
              <IconCheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <p className="text-xs font-bold text-emerald-700">Entrada #{bitacoraGuardada} guardada</p>
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Fecha" required>
              <Input type="date" value={bitForm.fecha} onChange={e => setBitForm({ ...bitForm, fecha: e.target.value })} />
            </FormField>
            <FormField label="Turno">
              <Select value={bitForm.turno} onChange={e => setBitForm({ ...bitForm, turno: e.target.value })}>
                <option value="DIURNO">Diurno</option>
                <option value="NOCTURNO">Nocturno</option>
                <option value="MIXTO">Mixto</option>
              </Select>
            </FormField>
          </div>
          <FormField label="Frente de trabajo" required>
            <Input placeholder="Ej: Frente 1 - Cimentación" value={bitForm.frente_trabajo} onChange={e => setBitForm({ ...bitForm, frente_trabajo: e.target.value })} />
          </FormField>
          <FormField label="Actividades realizadas" required>
            <Textarea placeholder="Describe las actividades del turno..." value={bitForm.actividades_realizadas} onChange={e => setBitForm({ ...bitForm, actividades_realizadas: e.target.value })} />
          </FormField>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField label="Personal en sitio">
              <Input type="number" placeholder="0" value={bitForm.personal_en_sitio} onChange={e => setBitForm({ ...bitForm, personal_en_sitio: e.target.value })} />
            </FormField>
            <FormField label="Clima">
              <Select value={bitForm.clima} onChange={e => setBitForm({ ...bitForm, clima: e.target.value })}>
                <option value="">-</option>
                <option value="Soleado">Soleado</option>
                <option value="Nublado">Nublado</option>
                <option value="Lluvioso">Lluvioso</option>
                <option value="Ventoso">Ventoso</option>
              </Select>
            </FormField>
            <FormField label="Temp. °C">
              <Input type="number" placeholder="28" value={bitForm.temperatura_c} onChange={e => setBitForm({ ...bitForm, temperatura_c: e.target.value })} />
            </FormField>
          </div>
          <FormField label="Incidencias" hint="Accidentes, retrasos, problemas de seguridad">
            <Textarea className="min-h-[80px]" placeholder="Sin incidencias" value={bitForm.incidencias} onChange={e => setBitForm({ ...bitForm, incidencias: e.target.value })} />
          </FormField>
          <FormField label="Material recibido">
            <Input placeholder="Ej: 20 m3 concreto, 500 kg acero" value={bitForm.material_recibido} onChange={e => setBitForm({ ...bitForm, material_recibido: e.target.value })} />
          </FormField>
          <FormField label="Observaciones">
            <Textarea className="min-h-[80px]" placeholder="Notas adicionales..." value={bitForm.observaciones} onChange={e => setBitForm({ ...bitForm, observaciones: e.target.value })} />
          </FormField>
          <div className="border-t border-border/40 pt-4">
            <SubmitButton label="Guardar Bitácora" loading={formLoading} color="sky" onClick={handleSubmitBitacora} />
          </div>
        </div>
      </SlidePanel>

      <SlidePanel isOpen={showAvanceForm} onClose={resetAvanceForm} title="Registrar Avance Físico" subtitle="Captura de avance por concepto del presupuesto base" accentColor="sky">
        <div className="space-y-5">
          {avanceGuardado && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-3 py-2">
              <IconCheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <p className="text-xs font-bold text-emerald-700">
                Avance guardado: {avanceGuardado.clave} — {avanceGuardado.cantidad} {avanceGuardado.unidad}
              </p>
            </div>
          )}
          {(() => {
            const filtrados = avanceConceptoSearch.trim()
              ? conceptosAvance.filter(c => `${c.clave} ${c.descripcion}`.toLowerCase().includes(avanceConceptoSearch.toLowerCase()))
              : conceptosAvance;
            const mostrarRecientes = !avanceConceptoSearch.trim() && conceptosRecientes.length > 0;
            const listaPrincipal = mostrarRecientes
              ? filtrados.filter(c => !conceptosRecientes.some(r => r.id === c.id))
              : filtrados;
            const opciones = mostrarRecientes ? [...conceptosRecientes, ...listaPrincipal] : listaPrincipal;
            const seleccionarConcepto = (c: ConceptoCatalogo) => {
              setAvanceConceptoId(c.id);
              setAvanceConceptoSearch('');
              setAvanceGuardado(null);
            };
            const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setAvanceHighlightedIndex(i => Math.min(i + 1, opciones.length - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setAvanceHighlightedIndex(i => Math.max(i - 1, 0));
              } else if (e.key === 'Enter') {
                e.preventDefault();
                const opt = opciones[avanceHighlightedIndex];
                if (opt) seleccionarConcepto(opt);
              }
            };
            return (
              <div className="space-y-1.5">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Concepto del presupuesto <span className="text-red-500">*</span>
                </p>
                {conceptoAvanceSeleccionado ? (
                  <div className="flex items-center justify-between rounded-xl border border-sky-500/40 bg-sky-500/5 px-3 py-2">
                    <div>
                      <p className="text-[10px] font-mono text-sky-600 uppercase tracking-wider">{conceptoAvanceSeleccionado.clave}</p>
                      <p className="text-xs font-bold text-foreground/80">{conceptoAvanceSeleccionado.descripcion}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Precio unitario: {conceptoAvanceSeleccionado.precio_unitario != null ? formatCurrency(conceptoAvanceSeleccionado.precio_unitario) : '—'} · Presupuestado: {conceptoAvanceSeleccionado.cantidad_presupuestada ?? '—'} {conceptoAvanceSeleccionado.unidad_medida}
                      </p>
                    </div>
                    <button type="button" onClick={() => setAvanceConceptoId(null)}
                      className="ml-2 text-muted-foreground hover:text-red-500">
                      <IconX className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="relative">
                      <IconSearch className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <input
                        ref={avanceSearchInputRef}
                        type="text"
                        placeholder="Buscar concepto por clave o descripción..."
                        value={avanceConceptoSearch}
                        onChange={e => setAvanceConceptoSearch(e.target.value)}
                        onKeyDown={onSearchKeyDown}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-background border border-border/60 rounded-lg focus:border-sky-400 outline-none"
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-0.5">
                      {opciones.length === 0 ? (
                        <p className="text-[10px] text-muted-foreground py-2 text-center">
                          {conceptosAvance.length === 0 ? 'Sin catálogo de obra — importa en Gerencia Técnica' : 'Sin coincidencias'}
                        </p>
                      ) : opciones.map((c, i) => (
                        <React.Fragment key={c.id}>
                          {mostrarRecientes && i === 0 && (
                            <p className="px-1 pb-0.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground">Recientes</p>
                          )}
                          {mostrarRecientes && i === conceptosRecientes.length && listaPrincipal.length > 0 && (
                            <p className="px-1 pb-0.5 pt-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground">Catálogo completo</p>
                          )}
                          <button
                            type="button"
                            onClick={() => seleccionarConcepto(c)}
                            onMouseEnter={() => setAvanceHighlightedIndex(i)}
                            aria-selected={i === avanceHighlightedIndex}
                            className={cn(
                              'w-full flex items-center gap-3 rounded-lg border px-3 py-2 text-left transition-all',
                              i === avanceHighlightedIndex ? 'border-sky-400 bg-sky-500/10' : 'border-border/30 hover:border-sky-400/40 hover:bg-sky-500/5'
                            )}
                          >
                            <span className="text-[10px] font-mono text-sky-600 shrink-0">{c.clave}</span>
                            <span className="text-xs truncate text-foreground/80">{c.descripcion}</span>
                          </button>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          <div className="space-y-1.5">
            <label htmlFor="co-avance-cantidad-periodo" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Cant. periodo <span className="text-red-500">*</span>
            </label>
            <Input
              id="co-avance-cantidad-periodo"
              type="number"
              placeholder="25"
              value={avForm.cantidad_periodo}
              onChange={e => setAvForm({ ...avForm, cantidad_periodo: e.target.value })}
            />
          </div>

          {avForm.cantidad_periodo && conceptoAvanceSeleccionado ? (
            <Card className="border-sky-500/20 bg-sky-500/5 shadow-none">
              <CardHeader className="pb-3"><CardTitle className="text-xs font-black uppercase tracking-widest text-sky-600">Vista previa</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm font-medium text-foreground/80">
                  <span>Importe periodo</span>
                  <span className="font-mono font-black">{formatCurrency(previewImporte)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-foreground/80">
                  <span>Avance acumulado</span>
                  <span className="font-mono font-bold">{previewAcumulado} {conceptoAvanceSeleccionado.unidad_medida}</span>
                </div>
                {previewPorcentaje && (
                  <div className="flex justify-between text-sm font-medium text-foreground/80">
                    <span>% Avance</span>
                    <span className="font-mono font-bold text-sky-600">{previewPorcentaje}%</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Periodo inicio">
              <Input type="date" value={avForm.periodo_inicio} onChange={e => setAvForm({ ...avForm, periodo_inicio: e.target.value })} />
            </FormField>
            <FormField label="Periodo fin">
              <Input type="date" value={avForm.periodo_fin} onChange={e => setAvForm({ ...avForm, periodo_fin: e.target.value })} />
            </FormField>
          </div>
          <div className="border-t border-border/40 pt-4">
            <SubmitButton label="Guardar Avance" loading={formLoading} color="sky" onClick={handleSubmitAvance} />
          </div>
        </div>
      </SlidePanel>

      {/* ── Modal alertas ────────────────────────────────────────────────────── */}
      {modalAlerta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md shadow-2xl">
            <CardContent className="p-6">
              <h3 className="font-black text-lg text-foreground mb-1">
                {modalAlerta.accion === 'reconocer' ? 'Reconocer alerta' : 'Ignorar alerta'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">{modalAlerta.alerta.titulo}</p>
              <textarea
                value={notaCP}
                onChange={e => setNotaCP(e.target.value)}
                rows={3}
                placeholder={modalAlerta.accion === 'ignorar'
                  ? 'Justificación requerida (mín. 20 caracteres)...'
                  : 'Nota para el expediente (opcional)...'}
                className="w-full rounded-xl border border-border/40 bg-muted/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/40 resize-none"
              />
              <div className="flex gap-3 mt-4 justify-end">
                <Button variant="outline" onClick={() => { setModalAlerta(null); setNotaCP(''); }}>Cancelar</Button>
                <Button
                  onClick={() => void accionarAlerta()}
                  disabled={enviandoAlerta || (modalAlerta.accion === 'ignorar' && notaCP.length < 20)}
                  className="bg-sky-600 text-white hover:bg-sky-500 disabled:opacity-50"
                >
                  {enviandoAlerta ? 'Guardando...' : modalAlerta.accion === 'reconocer' ? 'Reconocer' : 'Ignorar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <HelpPanel viewId="control-obra" activeSubView={activeSubView} isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
};
