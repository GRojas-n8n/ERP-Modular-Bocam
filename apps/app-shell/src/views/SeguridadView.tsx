import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { useTenant } from '../context/TenantContext';
import { DEMO_INCIDENTES, DEMO_INSPECCIONES, DEMO_PERMISOS, DEMO_CAPACITACIONES } from '../lib/demoData';
import {
  Button,
  Card,
  CardContent,
  EmptyStatePanel,
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
  IconActivity,
  IconAlertCircle,
  IconCheckCircle2,
  IconClock,
  IconFileText,
  IconPlus,
  IconShieldCheck,
  IconTrendingUp,
  IconUsers,
} from '../components/Icons';

/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Vista: Seguridad / HSE - Incidentes, Inspecciones, Permisos, Capacitaciones
 * ---------------------------------------------------------------------------
 */

interface Incidente {
  id_incidente: string;
  codigo: string;
  tipo: string;
  severidad: string;
  fecha_incidente: string;
  hora_incidente?: string;
  ubicacion: string;
  descripcion: string;
  empleado_afectado_nombre?: string;
  estado: string;
  dias_incapacidad: number;
  requirio_atencion_medica: boolean;
}

interface Inspeccion {
  id_inspeccion: string;
  codigo: string;
  tipo_inspeccion: string;
  fecha_inspeccion: string;
  area_inspeccionada: string;
  items_revisados: number;
  items_conformes: number;
  items_no_conformes: number;
  porcentaje_cumplimiento: number;
  resultado: string;
  inspector_nombre: string;
}

interface Permiso {
  id_permiso: string;
  codigo: string;
  tipo_permiso: string;
  area_trabajo: string;
  descripcion_trabajo: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  solicitante_nombre: string;
  autorizador_nombre?: string;
  checklist_previo: boolean;
}

interface Capacitacion {
  id_capacitacion: string;
  codigo: string;
  titulo: string;
  tipo: string;
  instructor: string;
  fecha: string;
  duracion_horas: number;
  estado: string;
  _count?: { registros: number };
}

type TabId = 'incidentes' | 'inspecciones' | 'permisos' | 'capacitaciones';

export const SeguridadView: React.FC = () => {
  const { tenant } = useTenant();
  const [activeTab, setActiveTab] = useState<TabId>('incidentes');
  const [incidentes, setIncidentes] = useState<Incidente[]>([]);
  const [inspecciones, setInspecciones] = useState<Inspeccion[]>([]);
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [capacitaciones, setCapacitaciones] = useState<Capacitacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (tenant?.id === 'bocam-demo') { setIncidentes(DEMO_INCIDENTES as Incidente[]); setInspecciones(DEMO_INSPECCIONES as Inspeccion[]); setPermisos(DEMO_PERMISOS as Permiso[]); setCapacitaciones(DEMO_CAPACITACIONES as Capacitacion[]); return; }
        const [incRes, insRes, perRes, capRes] = await Promise.allSettled([
          api.get('/api/v1/seguridad/incidentes'),
          api.get('/api/v1/seguridad/inspecciones'),
          api.get('/api/v1/seguridad/permisos'),
          api.get('/api/v1/seguridad/capacitaciones'),
        ]);

        if (incRes.status === 'fulfilled') setIncidentes(incRes.value.data?.data || []);
        if (insRes.status === 'fulfilled') setInspecciones(insRes.value.data?.data || []);
        if (perRes.status === 'fulfilled') setPermisos(perRes.value.data?.data || []);
        if (capRes.status === 'fulfilled') setCapacitaciones(capRes.value.data?.data || []);
      } catch {
        setError('Error al conectar con el modulo de Seguridad.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const severidadBadge = (severidad: string) => {
    const map: Record<string, string> = {
      BAJA: 'border-green-500/20 bg-green-500/10 text-green-600',
      MEDIA: 'border-amber-500/20 bg-amber-500/10 text-amber-600',
      ALTA: 'border-orange-500/20 bg-orange-500/10 text-orange-600',
      CRITICA: 'border-red-500/20 bg-red-500/10 text-red-600',
    };

    return (
      <SectionBadge className={cn('rounded-full px-3 py-1 text-[10px]', map[severidad] || '')}>
        {severidad}
      </SectionBadge>
    );
  };

  const estadoBadge = (estado: string) => {
    const map: Record<string, string> = {
      ABIERTO: 'border-red-500/20 bg-red-500/10 text-red-600',
      EN_INVESTIGACION: 'border-amber-500/20 bg-amber-500/10 text-amber-600',
      ACCION_CORRECTIVA: 'border-blue-500/20 bg-blue-500/10 text-blue-600',
      CERRADO: 'border-green-500/20 bg-green-500/10 text-green-600',
      VIGENTE: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600',
      EXPIRADO: 'border-slate-200 bg-slate-100 text-slate-500',
      CANCELADO: 'border-red-500/20 bg-red-500/10 text-red-600',
      APROBADA: 'border-green-500/20 bg-green-500/10 text-green-600',
      OBSERVACIONES: 'border-amber-500/20 bg-amber-500/10 text-amber-600',
      NO_APROBADA: 'border-red-500/20 bg-red-500/10 text-red-600',
      PROGRAMADA: 'border-sky-500/20 bg-sky-500/10 text-sky-600',
      COMPLETADA: 'border-green-500/20 bg-green-500/10 text-green-600',
    };

    return (
      <SectionBadge className={cn('rounded-full px-3 py-1 text-[10px]', map[estado] || '')}>
        {estado.replace(/_/g, ' ')}
      </SectionBadge>
    );
  };

  const tipoBadge = (tipo: string) => {
    const map: Record<string, string> = {
      ACCIDENTE: 'bg-red-500/10 text-red-700',
      CASI_ACCIDENTE: 'bg-orange-500/10 text-orange-700',
      ACTO_INSEGURO: 'bg-amber-500/10 text-amber-700',
      CONDICION_INSEGURA: 'bg-yellow-500/10 text-yellow-700',
      AMBIENTAL: 'bg-teal-500/10 text-teal-700',
      ALTURAS: 'bg-sky-500/10 text-sky-700',
      ESPACIO_CONFINADO: 'bg-indigo-500/10 text-indigo-700',
      TRABAJO_CALIENTE: 'bg-orange-500/10 text-orange-700',
      EXCAVACION: 'bg-amber-500/10 text-amber-700',
      IZAJE: 'bg-blue-500/10 text-blue-700',
      ELECTRICO: 'bg-yellow-500/10 text-yellow-700',
      DC3: 'bg-indigo-500/10 text-indigo-700',
      INDUCCION: 'bg-emerald-500/10 text-emerald-700',
      PLATICA_5MIN: 'bg-sky-500/10 text-sky-700',
      SIMULACRO: 'bg-violet-500/10 text-violet-700',
      CERTIFICACION: 'bg-amber-500/10 text-amber-700',
    };

    return (
      <SectionBadge className={cn('rounded-md px-2 py-0.5 text-[9px]', map[tipo] || 'bg-slate-100 text-slate-600')}>
        {tipo.replace(/_/g, ' ')}
      </SectionBadge>
    );
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });

  const tabs = [
    { id: 'incidentes' as TabId, label: 'Incidentes', count: incidentes.length, icon: IconAlertCircle },
    { id: 'inspecciones' as TabId, label: 'Inspecciones', count: inspecciones.length, icon: IconCheckCircle2 },
    { id: 'permisos' as TabId, label: 'Permisos', count: permisos.length, icon: IconFileText },
    { id: 'capacitaciones' as TabId, label: 'Capacitaciones', count: capacitaciones.length, icon: IconUsers },
  ];

  const incAbiertos = incidentes.filter((incidente) => incidente.estado !== 'CERRADO').length;
  const incCriticos = incidentes.filter((incidente) => incidente.severidad === 'CRITICA').length;
  const permVigentes = permisos.filter((permiso) => permiso.estado === 'VIGENTE').length;
  const avgCumplimiento = inspecciones.length
    ? (
        inspecciones.reduce(
          (sum, inspeccion) => sum + Number(inspeccion.porcentaje_cumplimiento),
          0
        ) / inspecciones.length
      ).toFixed(0)
    : '—';

  const kpis = [
    {
      label: 'Incidentes Abiertos',
      value: String(incAbiertos),
      icon: IconAlertCircle,
      color: 'text-red-600',
      bg: 'bg-red-500/10',
    },
    {
      label: 'Permisos Vigentes',
      value: String(permVigentes),
      icon: IconFileText,
      color: 'text-emerald-600',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Tasa Cumplimiento',
      value: `${avgCumplimiento}%`,
      icon: IconTrendingUp,
      color: 'text-sky-600',
      bg: 'bg-sky-500/10',
    },
    {
      label: 'Capacitaciones',
      value: String(capacitaciones.filter((cap) => cap.estado === 'COMPLETADA').length),
      icon: IconActivity,
      color: 'text-violet-600',
      bg: 'bg-violet-500/10',
    },
  ];

  return (
    <div className="animate-in space-y-8 fade-in duration-700">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="space-y-3">
          <SectionBadge className="border-rose-500/20 bg-rose-500/10 text-rose-700">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Higiene, seguridad y medio ambiente
          </SectionBadge>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/5 bg-rose-500/10 shadow-inner">
              <IconShieldCheck className="h-8 w-8 text-rose-600" />
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900">
                Seguridad
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Higiene, Seguridad y Medio Ambiente
                </p>
                {incAbiertos > 0 ? (
                  <SectionBadge className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] text-red-600">
                    {incAbiertos} abiertos
                  </SectionBadge>
                ) : null}
                {incCriticos > 0 ? (
                  <SectionBadge className="rounded-full bg-red-600/10 px-2 py-0.5 text-[10px] text-red-700 animate-pulse">
                    {incCriticos} criticos
                  </SectionBadge>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <Button className="rounded-2xl bg-rose-600 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-rose-600/20 hover:bg-rose-500">
          <IconPlus className="h-4 w-4" />
          {activeTab === 'incidentes'
            ? 'Reportar Incidente'
            : activeTab === 'inspecciones'
              ? 'Nueva Inspeccion'
              : activeTab === 'permisos'
                ? 'Nuevo Permiso'
                : 'Nueva Capacitacion'}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card
            key={kpi.label}
            className="rounded-2xl border-border/30 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
          >
            <CardContent className="p-0">
              <div className="mb-3 flex items-start justify-between">
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', kpi.bg)}>
                  <kpi.icon className={cn('h-5 w-5', kpi.color)} />
                </div>
              </div>
              <div className={cn('mb-0.5 text-2xl font-black tracking-tighter', kpi.color)}>
                {kpi.value}
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {kpi.label}
              </div>
            </CardContent>
          </Card>
        ))}
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
                ? 'border-border/40 bg-card text-rose-600 shadow-lg'
                : 'text-muted-foreground hover:bg-card/50 hover:text-foreground'
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[10px] font-black',
                activeTab === tab.id
                  ? 'bg-rose-500/10 text-rose-600'
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
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-rose-500/10 border-t-rose-600" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">
              Cargando datos HSE...
            </p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="space-y-4 p-12 text-center">
            <IconAlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <h3 className="text-xl font-black uppercase tracking-tighter text-destructive">
              Modulo Offline
            </h3>
            <p className="text-xs font-medium text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {activeTab === 'incidentes' && (
            <div className="space-y-4">
              {incidentes.length === 0 ? (
                <EmptyStatePanel
                  icon={<IconShieldCheck className="h-12 w-12 text-emerald-400" />}
                  title="Sin incidentes reportados"
                  description="Excelente. La obra opera sin novedades de seguridad."
                />
              ) : (
                incidentes.map((incidente) => (
                  <Card
                    key={incidente.id_incidente}
                    className="group relative overflow-hidden border-border/40 p-6 transition-all hover:shadow-xl"
                  >
                    <div
                      className={cn(
                        'absolute left-0 top-0 h-1 w-full opacity-70',
                        incidente.severidad === 'CRITICA'
                          ? 'bg-gradient-to-r from-red-600 via-red-500 to-red-600'
                          : incidente.severidad === 'ALTA'
                            ? 'bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500'
                            : incidente.severidad === 'MEDIA'
                              ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500'
                              : 'bg-gradient-to-r from-green-500 via-green-400 to-green-500'
                      )}
                    />
                    <CardContent className="p-0">
                      <div className="mb-3 flex items-start justify-between gap-4">
                        <div>
                          <div className="mb-1 flex flex-wrap items-center gap-3">
                            <span className="text-xl font-black tracking-tighter text-rose-600">
                              {incidente.codigo}
                            </span>
                            {tipoBadge(incidente.tipo)}
                            {severidadBadge(incidente.severidad)}
                            {estadoBadge(incidente.estado)}
                          </div>
                          <p className="mt-2 line-clamp-2 text-sm font-medium text-slate-700">
                            {incidente.descripcion}
                          </p>
                        </div>
                        {incidente.requirio_atencion_medica ? (
                          <SectionBadge className="shrink-0 rounded-full bg-red-100 px-2 py-1 text-[9px] text-red-700">
                            Atencion Medica
                          </SectionBadge>
                        ) : null}
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] font-medium text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <IconClock className="h-3.5 w-3.5" />
                          {formatDate(incidente.fecha_incidente)}
                          {incidente.hora_incidente ? ` · ${incidente.hora_incidente}` : ''}
                        </span>
                        <span>{incidente.ubicacion}</span>
                        {incidente.empleado_afectado_nombre ? (
                          <span>{incidente.empleado_afectado_nombre}</span>
                        ) : null}
                        {incidente.dias_incapacidad > 0 ? (
                          <span className="font-bold text-red-600">
                            {incidente.dias_incapacidad} dias incapacidad
                          </span>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === 'inspecciones' && (
            <Card className="overflow-hidden rounded-3xl border-border/40 shadow-xl">
              <TableContainer>
                <Table className="min-w-[820px]">
                  <TableHeader>
                    <tr>
                      <TableHead>Inspeccion</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Area</TableHead>
                      <TableHead className="text-center">Conformes</TableHead>
                      <TableHead className="text-center">Cumplimiento</TableHead>
                      <TableHead className="text-center">Resultado</TableHead>
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {inspecciones.map((inspeccion) => (
                      <TableRow key={inspeccion.id_inspeccion}>
                        <TableCell>
                          <div className="text-sm font-bold text-slate-800">{inspeccion.codigo}</div>
                          <div className="mt-0.5 text-[10px] font-bold text-muted-foreground">
                            {formatDate(inspeccion.fecha_inspeccion)} · {inspeccion.inspector_nombre}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm font-medium text-slate-700">
                          {inspeccion.tipo_inspeccion}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm font-medium text-slate-700">
                          {inspeccion.area_inspeccionada}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-sm font-bold text-slate-800">
                            {inspeccion.items_conformes}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            /{inspeccion.items_revisados}
                          </span>
                          {inspeccion.items_no_conformes > 0 ? (
                            <span className="ml-1 text-[10px] font-black text-red-600">
                              ({inspeccion.items_no_conformes} NC)
                            </span>
                          ) : null}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className={cn(
                                  'h-full rounded-full',
                                  Number(inspeccion.porcentaje_cumplimiento) >= 90
                                    ? 'bg-green-500'
                                    : Number(inspeccion.porcentaje_cumplimiento) >= 70
                                      ? 'bg-amber-500'
                                      : 'bg-red-500'
                                )}
                                style={{
                                  width: `${Math.min(Number(inspeccion.porcentaje_cumplimiento), 100)}%`,
                                }}
                              />
                            </div>
                            <span className="text-[10px] font-black text-slate-700">
                              {Number(inspeccion.porcentaje_cumplimiento).toFixed(0)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {estadoBadge(inspeccion.resultado)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {inspecciones.length === 0 ? (
                <div className="p-16 text-center">
                  <IconCheckCircle2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground/20" />
                  <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                    Sin inspecciones registradas
                  </p>
                </div>
              ) : null}
            </Card>
          )}

          {activeTab === 'permisos' && (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {permisos.length === 0 ? (
                <div className="sm:col-span-2 xl:col-span-3">
                  <EmptyStatePanel
                    icon={<IconFileText className="h-12 w-12 text-muted-foreground/20" />}
                    title="Sin permisos de trabajo"
                  />
                </div>
              ) : (
                permisos.map((permiso) => (
                  <Card
                    key={permiso.id_permiso}
                    className="group relative overflow-hidden border-border/40 transition-all hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    <div
                      className={cn(
                        'absolute left-0 top-0 h-1 w-full opacity-60',
                        permiso.estado === 'VIGENTE'
                          ? 'bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-500'
                          : 'bg-gradient-to-r from-slate-300 via-slate-200 to-slate-300'
                      )}
                    />
                    <CardContent className="space-y-2 p-6">
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-rose-600">
                            {permiso.codigo}
                          </span>
                          <h3 className="mt-0.5 text-sm font-bold text-slate-800">
                            {permiso.descripcion_trabajo}
                          </h3>
                        </div>
                        {estadoBadge(permiso.estado)}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                        <IconShieldCheck className="h-3.5 w-3.5 shrink-0" />
                        <span>{tipoBadge(permiso.tipo_permiso)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                        <IconClock className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          {formatDate(permiso.fecha_inicio)} - {formatDate(permiso.fecha_fin)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                        <IconUsers className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          Solicitante:{' '}
                          <strong className="text-foreground">{permiso.solicitante_nombre}</strong>
                        </span>
                      </div>
                      {permiso.autorizador_nombre ? (
                        <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                          <IconCheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                          <span>
                            Autorizado:{' '}
                            <strong className="text-foreground">{permiso.autorizador_nombre}</strong>
                          </span>
                        </div>
                      ) : null}
                      <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                        {permiso.checklist_previo ? (
                          <SectionBadge className="rounded-md bg-green-500/10 px-2 py-0.5 text-[9px] text-green-600">
                            Checklist OK
                          </SectionBadge>
                        ) : (
                          <SectionBadge className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[9px] text-amber-600">
                            Checklist Pendiente
                          </SectionBadge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === 'capacitaciones' && (
            <div className="space-y-4">
              {capacitaciones.length === 0 ? (
                <EmptyStatePanel
                  icon={<IconUsers className="h-12 w-12 text-muted-foreground/20" />}
                  title="Sin capacitaciones registradas"
                />
              ) : (
                capacitaciones.map((capacitacion) => (
                  <Card
                    key={capacitacion.id_capacitacion}
                    className="group relative overflow-hidden border-border/40 transition-all hover:shadow-xl"
                  >
                    <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 opacity-50" />
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="mb-1 flex flex-wrap items-center gap-3">
                            <span className="text-xl font-black tracking-tighter text-rose-600">
                              {capacitacion.codigo}
                            </span>
                            {tipoBadge(capacitacion.tipo)}
                            {estadoBadge(capacitacion.estado)}
                          </div>
                          <h3 className="mt-2 text-sm font-bold text-slate-800">
                            {capacitacion.titulo}
                          </h3>
                          <div className="mt-2 flex flex-wrap items-center gap-4 text-[11px] font-medium text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <IconClock className="h-3.5 w-3.5" />
                              {formatDate(capacitacion.fecha)}
                            </span>
                            <span>{capacitacion.instructor}</span>
                            <span>{Number(capacitacion.duracion_horas)}h</span>
                            <span className="flex items-center gap-1">
                              <IconUsers className="h-3.5 w-3.5" />
                              {capacitacion._count?.registros || 0} asistentes
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
