import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { useTenant } from '../context/TenantContext';
import { DEMO_REQUISICIONES } from '../lib/demoData';
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
  Textarea,
  cn,
} from '@bocam/ui-core';
import {
  IconAlertCircle,
  IconCheckCircle2,
  IconClock,
  IconPlus,
  IconSearch,
  IconShoppingCart,
} from '../components/Icons';
import { SlidePanel, SubmitButton } from '../components/SlidePanel';

/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Vista: Compras - Requisiciones con CRUD
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

export const ComprasView: React.FC = () => {
  const { tenant } = useTenant();
  const isDemo = tenant?.id === 'bocam-demo';
  const [requisiciones, setRequisiciones] = useState<Requisicion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReqForm, setShowReqForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [reqForm, setReqForm] = useState({
    descripcion: '',
    prioridad: 'MEDIA',
    fecha_requerida: '',
    notas: '',
    items: [{ insumo_id: '', cantidad: '', notas: '' }],
  });

  const fetchRequisiciones = async () => {
    try {
      setLoading(true);
      if (tenant?.id === 'bocam-demo') { setRequisiciones(DEMO_REQUISICIONES as Requisicion[]); return; }
      const response = await api.get('/api/v1/compras/requisiciones');
      setRequisiciones(response.data.data || []);
    } catch (err: any) {
      console.error('Error fetching requisiciones:', err);
      setError('Error al conectar con el modulo de Compras.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequisiciones();
  }, []);

  const handleSubmitRequisicion = async () => {
    const validItems = reqForm.items.filter((item) => item.insumo_id && item.cantidad);
    if (validItems.length === 0) {
      alert('Agrega al menos un insumo con cantidad.');
      return;
    }

    try {
      setFormLoading(true);
      await api.post('/api/v1/compras/requisiciones', {
        prioridad: reqForm.prioridad,
        fecha_requerida: reqForm.fecha_requerida || undefined,
        notas: reqForm.notas || undefined,
        items: validItems.map((item) => ({
          insumo_id: item.insumo_id,
          cantidad: Number(item.cantidad),
          notas: item.notas || undefined,
        })),
      });

      setShowReqForm(false);
      setReqForm({
        descripcion: '',
        prioridad: 'MEDIA',
        fecha_requerida: '',
        notas: '',
        items: [{ insumo_id: '', cantidad: '', notas: '' }],
      });
      await fetchRequisiciones();
    } catch (err: any) {
      alert(`Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setFormLoading(false);
    }
  };

  const addItem = () =>
    setReqForm({
      ...reqForm,
      items: [...reqForm.items, { insumo_id: '', cantidad: '', notas: '' }],
    });

  const removeItem = (idx: number) =>
    setReqForm({
      ...reqForm,
      items: reqForm.items.filter((_, itemIndex) => itemIndex !== idx),
    });

  const updateItem = (idx: number, field: string, value: string) => {
    const items = [...reqForm.items];
    items[idx] = { ...items[idx], [field]: value };
    setReqForm({ ...reqForm, items });
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      ALTA: 'border-red-500/20 bg-red-500/10 text-red-600',
      MEDIA: 'border-amber-500/20 bg-amber-500/10 text-amber-600',
      BAJA: 'border-green-500/20 bg-green-500/10 text-green-600',
    };

    return (
      <SectionBadge className={cn('rounded-lg px-2.5 py-1 text-[9px]', styles[priority] || '')}>
        {priority}
      </SectionBadge>
    );
  };

  const getStatusIcon = (estado: string) => {
    if (estado === 'PENDIENTE') return <IconClock className="h-4 w-4 text-amber-500" />;
    if (estado === 'APROBADA') return <IconCheckCircle2 className="h-4 w-4 text-green-500" />;
    return <IconAlertCircle className="h-4 w-4 text-slate-400" />;
  };

  return (
    <div className="animate-in space-y-8 fade-in duration-700">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="space-y-3">
          <SectionBadge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Procuracion operativa
          </SectionBadge>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/10 bg-emerald-500/10">
              <IconShoppingCart className="h-7 w-7 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900">
                Centro de Compras
              </h1>
              <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Gestion de requisiciones y suministros
              </p>
            </div>
          </div>
        </div>

        {!isDemo && (
          <Button
            onClick={() => setShowReqForm(true)}
            className="bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 hover:bg-emerald-500"
          >
            <IconPlus className="h-4 w-4" />
            Nueva Requisicion
          </Button>
        )}
      </div>

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
            <h3 className="text-xl font-black uppercase tracking-tighter text-destructive">
              Falla en modulo Compras
            </h3>
            <p className="mx-auto max-w-sm text-xs font-medium text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      ) : requisiciones.length === 0 ? (
        <Card className="border-dashed border-border/60">
          <CardContent className="space-y-4 p-16 text-center">
            <IconSearch className="mx-auto h-12 w-12 text-muted-foreground/20" />
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Sin requisiciones activas
            </p>
            {!isDemo && (
              <div className="flex justify-center">
                <Button
                  onClick={() => setShowReqForm(true)}
                  variant="outline"
                  className="border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/5"
                >
                  <IconPlus className="h-4 w-4" />
                  Crear primera requisicion
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {requisiciones.map((req) => (
            <Card
              key={req.id}
              className="group relative overflow-hidden border-border/40 transition-all hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="absolute right-0 top-0 p-4 opacity-5 transition-opacity group-hover:opacity-10">
                <IconShoppingCart className="h-20 w-20" />
              </div>
              <CardHeader className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <SectionBadge className="rounded-full px-3 py-1 text-[10px]">Folio: {req.folio}</SectionBadge>
                  {getPriorityBadge(req.prioridad)}
                </div>
                <div className="space-y-3">
                  <CardTitle className="text-base uppercase tracking-tight text-slate-800">
                    Requisicion global de obra
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 text-[11px] font-medium">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[8px] font-black text-slate-600">
                      U
                    </span>
                    {req.solicitante}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between border-t border-border/40 pt-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(req.estado)}
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                    {req.estado}
                  </span>
                </div>
                <div className="text-[10px] font-bold uppercase text-muted-foreground">
                  {new Date(req.fecha).toLocaleDateString('es-MX', {
                    day: '2-digit',
                    month: 'short',
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <SlidePanel
        isOpen={showReqForm}
        onClose={() => setShowReqForm(false)}
        title="Nueva Requisicion"
        subtitle="Solicitud de compra de insumos"
        accentColor="emerald"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Prioridad" required>
              <Select
                value={reqForm.prioridad}
                onChange={(e) => setReqForm({ ...reqForm, prioridad: e.target.value })}
              >
                <option value="BAJA">Baja</option>
                <option value="MEDIA">Media</option>
                <option value="ALTA">Alta</option>
              </Select>
            </FormField>
            <FormField label="Fecha requerida">
              <Input
                type="date"
                value={reqForm.fecha_requerida}
                onChange={(e) => setReqForm({ ...reqForm, fecha_requerida: e.target.value })}
              />
            </FormField>
          </div>

          <FormField label="Notas / Justificacion">
            <Textarea
              className="min-h-[80px]"
              placeholder="Justificacion de la solicitud de compra..."
              value={reqForm.notas}
              onChange={(e) => setReqForm({ ...reqForm, notas: e.target.value })}
            />
          </FormField>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Insumos solicitados <span className="text-red-500">*</span>
              </label>
              <Button
                onClick={addItem}
                variant="ghost"
                className="h-auto px-0 py-0 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:bg-transparent hover:text-emerald-500"
              >
                <IconPlus className="h-3 w-3" />
                Agregar
              </Button>
            </div>

            {reqForm.items.map((item, idx) => (
              <Card key={idx} className="border-border/30 bg-muted/20 shadow-none">
                <CardContent className="relative space-y-3 p-4">
                  {reqForm.items.length > 1 ? (
                    <Button
                      onClick={() => removeItem(idx)}
                      variant="destructive"
                      size="icon"
                      className="absolute right-2 top-2 h-6 w-6 rounded-md bg-red-500/10 text-xs text-red-500 hover:bg-red-500/20"
                    >
                      x
                    </Button>
                  ) : null}

                  <SectionBadge className="w-fit rounded-md border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] text-emerald-600">
                    #{idx + 1}
                  </SectionBadge>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <FormField
                      className="sm:col-span-2"
                      label="UUID del insumo"
                      hint="ID del insumo del catalogo"
                    >
                      <Input
                        placeholder="UUID del Insumo"
                        value={item.insumo_id}
                        onChange={(e) => updateItem(idx, 'insumo_id', e.target.value)}
                      />
                    </FormField>
                    <FormField label="Cantidad">
                      <Input
                        type="number"
                        placeholder="Cant."
                        value={item.cantidad}
                        onChange={(e) => updateItem(idx, 'cantidad', e.target.value)}
                      />
                    </FormField>
                  </div>

                  <FormField label="Notas del item">
                    <Input
                      className="text-xs"
                      placeholder="Notas del item (opcional)"
                      value={item.notas}
                      onChange={(e) => updateItem(idx, 'notas', e.target.value)}
                    />
                  </FormField>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="border-t border-border/40 pt-4">
            <SubmitButton
              label="Crear Requisicion"
              loading={formLoading}
              color="emerald"
              onClick={handleSubmitRequisicion}
            />
          </div>
        </div>
      </SlidePanel>
    </div>
  );
};
