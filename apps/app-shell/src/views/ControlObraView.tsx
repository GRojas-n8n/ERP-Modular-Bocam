import React, { useEffect, useState } from 'react';
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
  IconTrendingUp,
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

type TabId = 'bitacoras' | 'avances' | 'estimaciones';

export const ControlObraView: React.FC = () => {
  const { tenant } = useTenant();
  const isDemo = tenant?.id === 'bocam-demo';
  const [activeTab, setActiveTab] = useState<TabId>('bitacoras');
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

  const fetchData = async () => {
    try {
      setLoading(true);
      if (tenant?.id === 'bocam-demo') { setBitacoras(DEMO_BITACORAS as Bitacora[]); setAvances(DEMO_AVANCES as AvanceFisico[]); setEstimaciones(DEMO_ESTIMACIONES as Estimacion[]); return; }
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
      BORRADOR: 'border-slate-200 bg-slate-100 text-slate-600',
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

  const tabs = [
    { id: 'bitacoras' as TabId, label: 'Bitacoras', count: bitacoras.length, icon: IconFileText },
    { id: 'avances' as TabId, label: 'Avances Fisicos', count: avances.length, icon: IconTrendingUp },
    { id: 'estimaciones' as TabId, label: 'Estimaciones', count: estimaciones.length, icon: IconActivity },
  ];

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
              <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900">
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

      <div className="flex flex-wrap gap-2 rounded-2xl border border-border/30 bg-muted/30 p-1.5">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            variant={activeTab === tab.id ? 'outline' : 'ghost'}
            className={cn(
              'flex-1 justify-center rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest',
              activeTab === tab.id
                ? 'border-border/40 bg-card text-sky-600 shadow-lg'
                : 'text-muted-foreground hover:bg-card/50 hover:text-foreground'
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[10px] font-black',
                activeTab === tab.id
                  ? 'bg-sky-500/10 text-sky-600'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {tab.count}
            </span>
          </Button>
        ))}
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
                            <h3 className="text-sm font-bold tracking-tight text-slate-800">
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
                          <SectionBadge className="rounded-lg bg-slate-100 px-2.5 py-1 text-slate-600">
                            {bitacora.personal_en_sitio} personas
                          </SectionBadge>
                          {getEstadoBadge(bitacora.estado)}
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-600">
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
                            <div className="mt-0.5 max-w-[250px] truncate text-sm font-medium text-slate-700">
                              {avance.descripcion_concepto}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center gap-1.5">
                              <span className="text-lg font-black text-slate-900">
                                {Number(avance.porcentaje_avance).toFixed(1)}%
                              </span>
                              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
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
                            <span className="font-mono text-base font-black text-slate-900">
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
                  <span className="font-mono text-lg font-black text-slate-900">
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
                          <div className="text-2xl font-black tracking-tighter text-slate-900">
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
                <div className="flex justify-between text-sm font-medium text-slate-700">
                  <span>Importe periodo</span>
                  <span className="font-mono font-black">{formatCurrency(previewImporte)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-slate-700">
                  <span>Avance acumulado</span>
                  <span className="font-mono font-bold">
                    {previewAcumulado} {avForm.unidad}
                  </span>
                </div>
                {previewPorcentaje ? (
                  <div className="flex justify-between text-sm font-medium text-slate-700">
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
