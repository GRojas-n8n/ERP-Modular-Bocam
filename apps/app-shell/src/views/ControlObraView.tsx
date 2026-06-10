import React, { useEffect, useMemo, useState } from 'react';
import api from '../lib/api';
import { useTenant } from '../context/TenantContext';
import { DEMO_BITACORAS, DEMO_AVANCES, DEMO_ESTIMACIONES } from '../lib/demoData';
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
} from '../components/Icons';
import { SlidePanel, SubmitButton } from '../components/SlidePanel';

/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Vista: Control de Obra - Bitacoras, Avances y Estimaciones (con CRUD)
 * ---------------------------------------------------------------------------
 */

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
  concepto_presupuesto: string;
  descripcion_concepto: string;
  cantidad_periodo: number;
  cantidad_acumulada: number;
  unidad: string;
  porcentaje_avance: number;
  importe_periodo: number;
  estado: string;
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

type TabId = 'bitacoras' | 'avances' | 'estimaciones' | 'configuracion' | 'costos';

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

export const ControlObraView: React.FC<{ activeSubView?: string }> = ({ activeSubView }) => {
  const { tenant, user, currentProjectId } = useTenant();
  const isDemo = tenant?.id === 'iretum-demo';
  const activeTab: TabId = (activeSubView as TabId) || 'bitacoras';
  const roles: string[] = user?.role ?? [];
  const canConfig = roles.some(r => ['control_obra', 'admin'].includes(r));
  const [bitacoras, setBitacoras] = useState<Bitacora[]>([]);
  const [avances, setAvances] = useState<AvanceFisico[]>([]);
  const [estimaciones, setEstimaciones] = useState<Estimacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBitacoraForm, setShowBitacoraForm] = useState(false);
  const [showAvanceForm, setShowAvanceForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [bitForm, setBitForm] = useState({
    frente_trabajo: '',
    turno: 'DIURNO',
    clima: '',
    temperatura_c: '',
    actividades_realizadas: '',
    personal_en_sitio: '',
    incidencias: '',
    material_recibido: '',
    observaciones: '',
    fecha: new Date().toISOString().split('T')[0],
  });

  const [avForm, setAvForm] = useState({
    concepto_presupuesto: '',
    descripcion_concepto: '',
    cantidad_presupuestada: '',
    cantidad_anterior: '0',
    cantidad_periodo: '',
    unidad: 'pza',
    precio_unitario: '',
    periodo_inicio: new Date().toISOString().split('T')[0],
    periodo_fin: new Date().toISOString().split('T')[0],
  });

  // ── Configuración: clasificación de insumos ──────────────────────────────
  const [insumosClasif, setInsumosClasif] = useState<InsumoClasif[]>([]);
  const [categoriasConfig, setCategoriasConfig] = useState<CategoriaGastoItem[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [clasifSearch, setClasifSearch] = useState('');
  const [autoClasifLoading, setAutoClasifLoading] = useState(false);
  const [bulkTipoTarget, setBulkTipoTarget] = useState<Record<string, string>>({});

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
          id: i.id,
          clave: i.clave,
          descripcion: i.descripcion,
          tipo_insumo: i.tipo_insumo,
          categoria_gasto_id: i.categoria_gasto_id ?? null,
          categoria_gasto_nombre: i.categoria_gasto_nombre ?? null,
        })));
      }
      if (catRes.status === 'fulfilled') {
        setCategoriasConfig(catRes.value.data?.data?.categorias || []);
      }
    } catch { /* silencioso */ }
    finally { setLoadingConfig(false); }
  };

  const handleAutoClasif = async () => {
    if (!currentProjectId) return;
    setAutoClasifLoading(true);
    try {
      const sinCategoria = insumosClasif.filter(i => !i.categoria_gasto_id);
      if (sinCategoria.length === 0) return;
      const MAPA: Record<string, string> = {
        MATERIAL: 'Materiales',
        EQUIPO: 'Equipo Mayor',
        SUBCONTRATO: 'Servicios y Subcontratos',
        MANO_DE_OBRA: 'Mano de Obra Subcontratada',
        INDIRECTO: 'Indirectos y Gastos Generales',
      };
      const clasificaciones: { insumo_id: string; categoria_gasto_id: string }[] = [];
      for (const ins of sinCategoria) {
        const nombreTarget = MAPA[ins.tipo_insumo];
        if (!nombreTarget) continue;
        const cat = categoriasConfig.find(c => c.nombre === nombreTarget);
        if (cat) clasificaciones.push({ insumo_id: ins.id, categoria_gasto_id: cat.id_categoria });
      }
      if (clasificaciones.length > 0) {
        await api.put('/api/v1/gerencia-tecnica/insumos/clasificacion-bulk', { clasificaciones });
      }
      await loadConfiguracion();
    } catch { /* silencioso */ }
    finally { setAutoClasifLoading(false); }
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

  const fetchData = async () => {
    try {
      setLoading(true);
      if (tenant?.id === 'iretum-demo') { setBitacoras(DEMO_BITACORAS as Bitacora[]); setAvances(DEMO_AVANCES as AvanceFisico[]); setEstimaciones(DEMO_ESTIMACIONES as Estimacion[]); return; }
      const [bitRes, avRes, estRes] = await Promise.allSettled([
        api.get('/api/v1/control-obra/bitacoras'),
        api.get('/api/v1/control-obra/avances'),
        api.get('/api/v1/control-obra/estimaciones'),
      ]);

      if (bitRes.status === 'fulfilled') setBitacoras(bitRes.value.data?.data || []);
      if (avRes.status === 'fulfilled') setAvances(avRes.value.data?.data || []);
      if (estRes.status === 'fulfilled') setEstimaciones(estRes.value.data?.data || []);
    } catch {
      setError('Error al conectar con el modulo de Control de Obra.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'configuracion' && canConfig && !isDemo) loadConfiguracion();
  }, [activeTab]);

  // ── Tab Costos: resumen por categoría ────────────────────────────────────
  interface CostosCategoriaRow {
    nombre: string;
    presupuesto: number;
    comprometido: number;
    pagado: number;
    pct_comp: number;
    pct_pag: number;
  }
  const [costosCategorias, setCostosCategorias] = useState<CostosCategoriaRow[]>([]);
  const [costosWbsCO, setCostosWbsCO] = useState<any[]>([]);
  const [loadingCostos, setLoadingCostos] = useState(false);

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
          ...c,
          semaforo: c.semaforo === 'ambar' ? 'amarillo' : (c.semaforo ?? 'sin_dato'),
        })));
      }
    } catch { /* silencioso */ }
    finally { setLoadingCostos(false); }
  };

  useEffect(() => {
    if (activeTab === 'costos' && !isDemo) loadCostosCO();
  }, [activeTab]);

  const handleSubmitBitacora = async () => {
    if (!bitForm.frente_trabajo || !bitForm.actividades_realizadas) return;

    try {
      setFormLoading(true);
      await api.post('/api/v1/control-obra/bitacoras', {
        ...bitForm,
        personal_en_sitio: Number(bitForm.personal_en_sitio) || 0,
        temperatura_c: bitForm.temperatura_c ? Number(bitForm.temperatura_c) : null,
      });
      setShowBitacoraForm(false);
      setBitForm({
        frente_trabajo: '',
        turno: 'DIURNO',
        clima: '',
        temperatura_c: '',
        actividades_realizadas: '',
        personal_en_sitio: '',
        incidencias: '',
        material_recibido: '',
        observaciones: '',
        fecha: new Date().toISOString().split('T')[0],
      });
      await fetchData();
    } catch (err: any) {
      alert(`Error: ${err.response?.data?.error?.message || err.message}`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubmitAvance = async () => {
    if (!avForm.concepto_presupuesto || !avForm.cantidad_periodo || !avForm.precio_unitario) return;

    try {
      setFormLoading(true);
      await api.post('/api/v1/control-obra/avances', {
        ...avForm,
        cantidad_presupuestada: Number(avForm.cantidad_presupuestada) || 0,
        cantidad_anterior: Number(avForm.cantidad_anterior) || 0,
        cantidad_periodo: Number(avForm.cantidad_periodo),
        precio_unitario: Number(avForm.precio_unitario),
      });
      setShowAvanceForm(false);
      setAvForm({
        concepto_presupuesto: '',
        descripcion_concepto: '',
        cantidad_presupuestada: '',
        cantidad_anterior: '0',
        cantidad_periodo: '',
        unidad: 'pza',
        precio_unitario: '',
        periodo_inicio: new Date().toISOString().split('T')[0],
        periodo_fin: new Date().toISOString().split('T')[0],
      });
      await fetchData();
    } catch (err: any) {
      alert(`Error: ${err.response?.data?.error?.message || err.message}`);
    } finally {
      setFormLoading(false);
    }
  };

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

  const handleCreateClick = () => {
    if (activeTab === 'bitacoras') setShowBitacoraForm(true);
    else if (activeTab === 'avances') setShowAvanceForm(true);
  };

  const previewImporte = Number(avForm.cantidad_periodo || 0) * Number(avForm.precio_unitario || 0);
  const previewAcumulado = Number(avForm.cantidad_anterior || 0) + Number(avForm.cantidad_periodo || 0);
  const previewPorcentaje =
    avForm.cantidad_presupuestada && Number(avForm.cantidad_presupuestada) > 0
      ? ((previewAcumulado / Number(avForm.cantidad_presupuestada)) * 100).toFixed(1)
      : null;

  return (
    <div className="animate-in space-y-8 fade-in duration-700">
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
                Bitacoras, avances y estimaciones
              </p>
            </div>
          </div>
        </div>

        {!isDemo && (
          <Button
            onClick={handleCreateClick}
            className="bg-sky-600 text-white shadow-xl shadow-sky-600/20 hover:bg-sky-500"
          >
            <IconPlus className="h-4 w-4" />
            {activeTab === 'bitacoras'
              ? 'Nueva Bitacora'
              : activeTab === 'avances'
                ? 'Registrar Avance'
                : 'Crear Estimacion'}
          </Button>
        )}
      </div>


      {loading ? (
        <Card className="border-border/40">
          <CardContent className="flex h-96 flex-col items-center justify-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-500/10 border-t-sky-600" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">
              Sincronizando con campo...
            </p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="space-y-4 p-12 text-center">
            <IconAlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <h3 className="text-xl font-black uppercase tracking-tighter text-destructive">
              Modulo offline
            </h3>
            <p className="mx-auto max-w-sm text-xs font-medium text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {activeTab === 'bitacoras' && (
            <div className="space-y-4">
              {bitacoras.length === 0 ? (
                <EmptyStatePanel
                  icon={<IconFileText className="h-12 w-12 text-muted-foreground/20" />}
                  title="Sin bitacoras registradas"
                  action={
                    !isDemo ? (
                      <Button
                        onClick={() => setShowBitacoraForm(true)}
                        variant="outline"
                        className="border-sky-500/20 text-sky-600 hover:bg-sky-500/5"
                      >
                        <IconPlus className="h-4 w-4" />
                        Crear primera bitacora
                      </Button>
                    ) : undefined
                  }
                />
              ) : (
                bitacoras.map((bitacora) => (
                  <Card
                    key={bitacora.id_bitacora}
                    className="group border-border/40 transition-all hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    <CardContent className="p-6">
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 text-lg font-black text-sky-600">
                            #{bitacora.numero_entrada}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold tracking-tight text-foreground">
                              {bitacora.frente_trabajo}
                            </h3>
                            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                              {new Date(bitacora.fecha).toLocaleDateString('es-MX', {
                                weekday: 'long',
                                day: '2-digit',
                                month: 'long',
                              })}
                              {bitacora.clima ? ` · ${bitacora.clima}` : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <SectionBadge className="rounded-lg bg-muted px-2.5 py-1 text-muted-foreground">
                            {bitacora.personal_en_sitio} personas
                          </SectionBadge>
                          {getEstadoBadge(bitacora.estado)}
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {bitacora.actividades_realizadas}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

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
                        <TableCell colSpan={4} className="py-16 text-center text-sm font-bold uppercase tracking-widest text-muted-foreground">
                          Sin avances registrados
                        </TableCell>
                      </tr>
                    ) : (
                      avances.map((avance) => (
                        <TableRow key={avance.id_avance}>
                          <TableCell>
                            <div className="text-xs font-black uppercase tracking-tighter text-sky-600">
                              {avance.concepto_presupuesto}
                            </div>
                            <div className="mt-0.5 max-w-[250px] truncate text-sm font-medium text-foreground/80">
                              {avance.descripcion_concepto}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center gap-1.5">
                              <span className="text-lg font-black text-foreground">
                                {Number(avance.porcentaje_avance).toFixed(1)}%
                              </span>
                              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full rounded-full bg-sky-500 transition-all"
                                  style={{
                                    width: `${Math.min(Number(avance.porcentaje_avance), 100)}%`,
                                  }}
                                />
                              </div>
                              <span className="text-[9px] font-bold text-muted-foreground">
                                {Number(avance.cantidad_periodo).toLocaleString()} {avance.unidad}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-mono text-base font-black text-foreground">
                              {formatCurrency(Number(avance.importe_periodo))}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">{getEstadoBadge(avance.estado)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              {avances.length > 0 ? (
                <TableFooterBar>
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Total periodo ({avances.length} conceptos)
                  </span>
                  <span className="font-mono text-lg font-black text-foreground">
                    {formatCurrency(avances.reduce((sum, avance) => sum + Number(avance.importe_periodo), 0))}
                  </span>
                </TableFooterBar>
              ) : null}
            </Card>
          )}

          {activeTab === 'estimaciones' && (
            <div className="grid gap-6">
              {estimaciones.length === 0 ? (
                <EmptyStatePanel
                  icon={<IconActivity className="h-12 w-12 text-muted-foreground/20" />}
                  title="Sin estimaciones"
                  description="Registra y valida avances para crear la primera estimacion."
                />
              ) : (
                estimaciones.map((estimacion) => (
                  <Card
                    key={estimacion.id_estimacion}
                    className="group relative overflow-hidden border-border/40 transition-all hover:shadow-xl"
                  >
                    <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-sky-500 via-indigo-500 to-sky-500 opacity-50" />
                    <CardContent className="p-6">
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div>
                          <div className="mb-1 flex items-center gap-3">
                            <span className="text-2xl font-black tracking-tighter text-sky-600">
                              EST #{estimacion.numero_estimacion}
                            </span>
                            {getEstadoBadge(estimacion.estado)}
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            {estimacion.codigo}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-black tracking-tighter text-foreground">
                            {formatCurrency(Number(estimacion.total_neto))}
                          </div>
                          <p className="mt-0.5 text-[10px] font-bold text-muted-foreground">
                            NETO A FACTURAR
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-6 text-[11px] font-medium text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <IconClock className="h-3.5 w-3.5" />
                          {new Date(estimacion.periodo_inicio).toLocaleDateString('es-MX', {
                            day: '2-digit',
                            month: 'short',
                          })}
                          {' - '}
                          {new Date(estimacion.periodo_fin).toLocaleDateString('es-MX', {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <IconCheckCircle2 className="h-3.5 w-3.5" />
                          {estimacion.avances?.length || 0} conceptos
                        </span>
                        <span className="text-[10px] font-bold">
                          Subtotal: {formatCurrency(Number(estimacion.subtotal))}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* ── TAB: Costos (resumen por categoría) ───────────────────────────── */}
          {activeTab === 'costos' && (
            loadingCostos ? (
              <Card className="border-border/40">
                <CardContent className="flex h-64 flex-col items-center justify-center gap-3">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-500/10 border-t-sky-600" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Calculando costos...</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* KPI cards */}
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
                        { label: 'Comprometido',     value: fmt(totalComp), color: 'text-amber-600',bg: 'bg-amber-500/10' },
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

                {/* Barras por categoría */}
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

                {/* Alertas de desviación */}
                {(() => {
                  const alertas = costosWbsCO.filter((r: any) => r.semaforo === 'rojo' || r.semaforo === 'amarillo');
                  if (alertas.length === 0) return null;
                  return (
                    <Card className="overflow-hidden border-border/40">
                      <CardHeader className="border-b border-border/30 bg-muted/20 px-5 py-3">
                        <CardTitle className="text-xs font-black uppercase tracking-widest">Alertas de Desviación</CardTitle>
                      </CardHeader>
                      <CardContent className="divide-y divide-border/20 p-0">
                        {alertas.map((r: any) => (
                          <div key={r.concepto_id} className="flex items-center gap-3 px-5 py-3">
                            <span className="shrink-0 text-base">{r.semaforo === 'rojo' ? '🔴' : '🟡'}</span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-bold">[{r.clave}] {r.descripcion}</p>
                              <p className="text-[10px] text-muted-foreground">% Económico: {r.pct_economico?.toFixed(1) ?? '—'}%</p>
                            </div>
                            <div className="text-right text-[10px]">
                              <p className="font-mono font-black text-amber-700">${Number(r.comprometido).toLocaleString('es-MX', { maximumFractionDigits: 0 })}</p>
                              <p className="text-muted-foreground">comprometido</p>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  );
                })()}

                {costosCategorias.length === 0 && costosWbsCO.length === 0 && (
                  <EmptyStatePanel
                    title="Sin datos de costos"
                    description="Asigna categorías a los insumos y crea requisiciones con partida para ver el resumen."
                  />
                )}
              </div>
            )
          )}

          {/* ── TAB: Configuración (clasificación de insumos) ──────────────────── */}
          {activeTab === 'configuracion' && canConfig && (
            loadingConfig ? (
              <Card className="border-border/40">
                <CardContent className="flex h-64 flex-col items-center justify-center gap-3">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-500/10 border-t-sky-600" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Cargando insumos...</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* ── Barra de progreso ── */}
                <Card className="border-border/40">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-black text-foreground">{totalClasif}/{insumosClasif.length} insumos clasificados</p>
                        <p className="text-[10px] text-muted-foreground">{totalSin} sin categoría asignada</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          className="h-8 gap-1.5 rounded-xl border-sky-500/20 px-3 text-[10px] font-black uppercase tracking-widest text-sky-600 hover:bg-sky-500/5"
                          onClick={handleAutoClasif}
                          disabled={autoClasifLoading || totalSin === 0}
                        >
                          <IconRefreshCw className={cn('h-3 w-3', autoClasifLoading && 'animate-spin')} />
                          {autoClasifLoading ? 'Clasificando...' : 'Auto-clasificar'}
                        </Button>
                        <Button
                          variant="ghost"
                          className="h-8 gap-1.5 rounded-xl px-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted/40"
                          onClick={loadConfiguracion}
                        >
                          <IconRefreshCw className="h-3 w-3" /> Actualizar
                        </Button>
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-sky-500 transition-all duration-500"
                        style={{ width: insumosClasif.length > 0 ? `${(totalClasif / insumosClasif.length) * 100}%` : '0%' }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* ── Búsqueda ── */}
                <div className="relative max-w-sm">
                  <IconSearch className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9 text-xs"
                    placeholder="Buscar insumo por clave o nombre..."
                    value={clasifSearch}
                    onChange={e => setClasifSearch(e.target.value)}
                  />
                </div>

                {/* ── Grupos por tipo_insumo ── */}
                {Object.entries(insumosPorTipo).map(([tipo, insumos]) => (
                  <Card key={tipo} className="overflow-hidden border-border/40">
                    <CardHeader className="border-b border-border/30 bg-muted/20 px-5 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-xs font-black uppercase tracking-widest text-foreground">{tipo}</CardTitle>
                          <SectionBadge className="rounded-full px-2 py-0.5 text-[9px]">
                            {insumos.filter(i => i.categoria_gasto_id).length}/{insumos.length}
                          </SectionBadge>
                        </div>
                        {/* Aplicar a todo el grupo */}
                        <div className="flex items-center gap-2">
                          <select
                            className="rounded-xl border border-border/40 bg-muted/30 px-3 py-1.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-sky-500/40"
                            value={bulkTipoTarget[tipo] ?? ''}
                            onChange={e => setBulkTipoTarget(prev => ({ ...prev, [tipo]: e.target.value }))}
                          >
                            <option value="">Seleccionar categoría...</option>
                            {categoriasConfig.map(c => (
                              <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
                            ))}
                          </select>
                          <Button
                            variant="outline"
                            className="h-7 gap-1 rounded-xl border-sky-500/20 px-2.5 text-[9px] font-black text-sky-600 hover:bg-sky-500/5 disabled:opacity-40"
                            disabled={!bulkTipoTarget[tipo]}
                            onClick={() => handleBulkTipo(tipo)}
                          >
                            Aplicar a todos
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="divide-y divide-border/20 p-0">
                      {insumos.map(ins => (
                        <div key={ins.id} className={cn(
                          'flex flex-wrap items-center gap-3 px-5 py-3',
                          !ins.categoria_gasto_id && 'bg-amber-500/5'
                        )}>
                          <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[9px] font-black text-muted-foreground">{ins.clave}</span>
                          <span className="flex-1 min-w-0 truncate text-xs text-foreground">{ins.descripcion}</span>
                          <select
                            className="shrink-0 rounded-xl border border-border/40 bg-muted/30 px-2.5 py-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-sky-500/40"
                            value={ins.categoria_gasto_id ?? ''}
                            onChange={e => handleCatChange(ins.id, e.target.value)}
                          >
                            <option value="">Sin categoría</option>
                            {categoriasConfig.map(c => (
                              <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
                            ))}
                          </select>
                          {!ins.categoria_gasto_id && (
                            <span className="shrink-0 rounded-md border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-black text-amber-700">
                              Sin clasificar
                            </span>
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

      <SlidePanel
        isOpen={showBitacoraForm}
        onClose={() => setShowBitacoraForm(false)}
        title="Nueva Bitacora"
        subtitle="Registro diario de actividades en campo"
        accentColor="sky"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Fecha" required>
              <Input
                type="date"
                value={bitForm.fecha}
                onChange={(e) => setBitForm({ ...bitForm, fecha: e.target.value })}
              />
            </FormField>
            <FormField label="Turno">
              <Select
                value={bitForm.turno}
                onChange={(e) => setBitForm({ ...bitForm, turno: e.target.value })}
              >
                <option value="DIURNO">Diurno</option>
                <option value="NOCTURNO">Nocturno</option>
                <option value="MIXTO">Mixto</option>
              </Select>
            </FormField>
          </div>

          <FormField label="Frente de trabajo" required>
            <Input
              placeholder="Ej: Frente 1 - Cimentacion"
              value={bitForm.frente_trabajo}
              onChange={(e) => setBitForm({ ...bitForm, frente_trabajo: e.target.value })}
            />
          </FormField>

          <FormField label="Actividades realizadas" required>
            <Textarea
              placeholder="Describe las actividades realizadas durante el turno..."
              value={bitForm.actividades_realizadas}
              onChange={(e) =>
                setBitForm({ ...bitForm, actividades_realizadas: e.target.value })
              }
            />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField label="Personal en sitio">
              <Input
                type="number"
                placeholder="0"
                value={bitForm.personal_en_sitio}
                onChange={(e) => setBitForm({ ...bitForm, personal_en_sitio: e.target.value })}
              />
            </FormField>
            <FormField label="Clima">
              <Select
                value={bitForm.clima}
                onChange={(e) => setBitForm({ ...bitForm, clima: e.target.value })}
              >
                <option value="">-</option>
                <option value="Soleado">Soleado</option>
                <option value="Nublado">Nublado</option>
                <option value="Lluvioso">Lluvioso</option>
                <option value="Ventoso">Ventoso</option>
              </Select>
            </FormField>
            <FormField label="Temp. C">
              <Input
                type="number"
                placeholder="28"
                value={bitForm.temperatura_c}
                onChange={(e) => setBitForm({ ...bitForm, temperatura_c: e.target.value })}
              />
            </FormField>
          </div>

          <FormField label="Incidencias" hint="Accidentes, retrasos, problemas de seguridad">
            <Textarea
              className="min-h-[80px]"
              placeholder="Sin incidencias"
              value={bitForm.incidencias}
              onChange={(e) => setBitForm({ ...bitForm, incidencias: e.target.value })}
            />
          </FormField>

          <FormField label="Material recibido">
            <Input
              placeholder="Ej: 20 m3 concreto, 500 kg acero"
              value={bitForm.material_recibido}
              onChange={(e) => setBitForm({ ...bitForm, material_recibido: e.target.value })}
            />
          </FormField>

          <FormField label="Observaciones">
            <Textarea
              className="min-h-[80px]"
              placeholder="Notas adicionales..."
              value={bitForm.observaciones}
              onChange={(e) => setBitForm({ ...bitForm, observaciones: e.target.value })}
            />
          </FormField>

          <div className="border-t border-border/40 pt-4">
            <SubmitButton
              label="Guardar Bitacora"
              loading={formLoading}
              color="sky"
              onClick={handleSubmitBitacora}
            />
          </div>
        </div>
      </SlidePanel>

      <SlidePanel
        isOpen={showAvanceForm}
        onClose={() => setShowAvanceForm(false)}
        title="Registrar Avance Fisico"
        subtitle="Captura de avance por concepto del presupuesto base"
        accentColor="sky"
      >
        <div className="space-y-5">
          <FormField
            label="Concepto del presupuesto"
            required
            hint="Clave del concepto en el presupuesto base"
          >
            <Input
              placeholder="Ej: CIM-001"
              value={avForm.concepto_presupuesto}
              onChange={(e) => setAvForm({ ...avForm, concepto_presupuesto: e.target.value })}
            />
          </FormField>

          <FormField label="Descripcion del concepto">
            <Input
              placeholder="Ej: Excavacion para zapatas aisladas"
              value={avForm.descripcion_concepto}
              onChange={(e) => setAvForm({ ...avForm, descripcion_concepto: e.target.value })}
            />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Cant. presupuestada">
              <Input
                type="number"
                placeholder="100"
                value={avForm.cantidad_presupuestada}
                onChange={(e) => setAvForm({ ...avForm, cantidad_presupuestada: e.target.value })}
              />
            </FormField>
            <FormField label="Cant. anterior">
              <Input
                type="number"
                placeholder="0"
                value={avForm.cantidad_anterior}
                onChange={(e) => setAvForm({ ...avForm, cantidad_anterior: e.target.value })}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField label="Cant. periodo" required>
              <Input
                type="number"
                placeholder="25"
                value={avForm.cantidad_periodo}
                onChange={(e) => setAvForm({ ...avForm, cantidad_periodo: e.target.value })}
              />
            </FormField>
            <FormField label="Unidad">
              <Select
                value={avForm.unidad}
                onChange={(e) => setAvForm({ ...avForm, unidad: e.target.value })}
              >
                <option value="pza">pza</option>
                <option value="m2">m2</option>
                <option value="m3">m3</option>
                <option value="ml">ml</option>
                <option value="kg">kg</option>
                <option value="ton">ton</option>
                <option value="lote">lote</option>
              </Select>
            </FormField>
            <FormField label="P.U." required hint="Precio unitario">
              <Input
                type="number"
                placeholder="1,500"
                value={avForm.precio_unitario}
                onChange={(e) => setAvForm({ ...avForm, precio_unitario: e.target.value })}
              />
            </FormField>
          </div>

          {avForm.cantidad_periodo && avForm.precio_unitario ? (
            <Card className="border-sky-500/20 bg-sky-500/5 shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-sky-600">
                  Vista previa del calculo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm font-medium text-foreground/80">
                  <span>Importe periodo</span>
                  <span className="font-mono font-black">{formatCurrency(previewImporte)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-foreground/80">
                  <span>Avance acumulado</span>
                  <span className="font-mono font-bold">
                    {previewAcumulado} {avForm.unidad}
                  </span>
                </div>
                {previewPorcentaje ? (
                  <div className="flex justify-between text-sm font-medium text-foreground/80">
                    <span>% Avance</span>
                    <span className="font-mono font-bold text-sky-600">{previewPorcentaje}%</span>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Periodo inicio">
              <Input
                type="date"
                value={avForm.periodo_inicio}
                onChange={(e) => setAvForm({ ...avForm, periodo_inicio: e.target.value })}
              />
            </FormField>
            <FormField label="Periodo fin">
              <Input
                type="date"
                value={avForm.periodo_fin}
                onChange={(e) => setAvForm({ ...avForm, periodo_fin: e.target.value })}
              />
            </FormField>
          </div>

          <div className="border-t border-border/40 pt-4">
            <SubmitButton
              label="Registrar Avance"
              loading={formLoading}
              color="sky"
              onClick={handleSubmitAvance}
            />
          </div>
        </div>
      </SlidePanel>
    </div>
  );
};
