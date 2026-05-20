import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { useTenant } from '../context/TenantContext';
import { DEMO_EMPLEADOS, DEMO_CUADRILLAS, DEMO_PRENOMINAS } from '../lib/demoData';
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
  TableFooterBar,
  TableHead,
  TableHeader,
  TableRow,
  cn,
} from '@bocam/ui-core';
import {
  IconAlertCircle,
  IconBriefcase,
  IconClock,
  IconPlus,
  IconShieldCheck,
  IconUsers,
  IconWallet,
} from '../components/Icons';

/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Vista: Personal / RRHH - Empleados, Cuadrillas y Pre-Nomina
 * ---------------------------------------------------------------------------
 */

interface Empleado {
  id_empleado: string;
  numero_empleado: string;
  nombre: string;
  apellido_paterno: string;
  puesto: string;
  categoria: string;
  estado: string;
  salario_diario: number;
  certificaciones?: string;
  cuadrilla?: { nombre: string; codigo: string } | null;
}

interface Cuadrilla {
  id_cuadrilla: string;
  nombre: string;
  codigo: string;
  especialidad: string;
  capataz_nombre?: string;
  estado: string;
  _count?: { miembros: number };
}

interface PreNomina {
  id_prenomina: string;
  codigo: string;
  periodo_tipo: string;
  periodo_inicio: string;
  periodo_fin: string;
  total_neto: number;
  total_empleados: number;
  estado: string;
}

interface PaseAcceso {
  id: string;
  numero_pase: string;
  empleado_nombre: string;
  empleado_numero: string;
  puesto: string;
  fecha_emision: string;
  fecha_vencimiento: string;
  area_acceso?: string;
}

const ALERTA_DIAS = 15; // días antes del vencimiento para alertar

function diasRestantes(fechaVenc: string): number {
  return Math.ceil((new Date(fechaVenc).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function urgenciaPase(dias: number): { label: string; className: string; dot: string } {
  if (dias < 0)  return { label: 'VENCIDO',    className: 'bg-red-500/10 text-red-600 border-red-500/20',       dot: 'bg-red-500' };
  if (dias <= 7) return { label: 'CRÍTICO',    className: 'bg-orange-500/10 text-orange-600 border-orange-500/20', dot: 'bg-orange-500' };
  if (dias <= ALERTA_DIAS) return { label: 'POR VENCER', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20', dot: 'bg-amber-500 animate-pulse' };
  return           { label: 'VIGENTE',    className: 'bg-green-500/10 text-green-600 border-green-500/20',   dot: 'bg-green-500' };
}

// Demo data para pases
const DEMO_PASES: PaseAcceso[] = [
  { id: '1', numero_pase: 'A-0142', empleado_nombre: 'Carlos Reyes López',     empleado_numero: 'EMP-001', puesto: 'Oficial',    fecha_emision: '2025-01-10', fecha_vencimiento: new Date(Date.now() + 3  * 86400000).toISOString().split('T')[0], area_acceso: 'Zona A' },
  { id: '2', numero_pase: 'A-0198', empleado_nombre: 'Martín Torres García',   empleado_numero: 'EMP-002', puesto: 'Albañil',    fecha_emision: '2025-01-10', fecha_vencimiento: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0], area_acceso: 'Zona B' },
  { id: '3', numero_pase: 'A-0205', empleado_nombre: 'Jorge Mendoza Silva',    empleado_numero: 'EMP-003', puesto: 'Supervisor', fecha_emision: '2025-01-10', fecha_vencimiento: new Date(Date.now() - 2  * 86400000).toISOString().split('T')[0], area_acceso: 'General' },
  { id: '4', numero_pase: 'A-0210', empleado_nombre: 'Luis Hernández Ruiz',    empleado_numero: 'EMP-004', puesto: 'Técnico',    fecha_emision: '2025-02-01', fecha_vencimiento: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0], area_acceso: 'Zona A' },
  { id: '5', numero_pase: 'A-0215', empleado_nombre: 'Roberto Castillo Díaz',  empleado_numero: 'EMP-005', puesto: 'Operador',   fecha_emision: '2025-02-01', fecha_vencimiento: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0], area_acceso: 'Zona C' },
];

type TabId = 'empleados' | 'cuadrillas' | 'prenomina' | 'pases';

export const PersonalView: React.FC = () => {
  const { tenant } = useTenant();
  const [activeTab, setActiveTab] = useState<TabId>('empleados');
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [cuadrillas, setCuadrillas] = useState<Cuadrilla[]>([]);
  const [prenominas, setPrenominas] = useState<PreNomina[]>([]);
  const [pases, setPases] = useState<PaseAcceso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (tenant?.id === 'iretum-demo') { setEmpleados(DEMO_EMPLEADOS as Empleado[]); setCuadrillas(DEMO_CUADRILLAS as Cuadrilla[]); setPrenominas(DEMO_PRENOMINAS as PreNomina[]); setPases(DEMO_PASES); return; }
        const [empRes, cuaRes, pnRes, pasesRes] = await Promise.allSettled([
          api.get('/api/v1/personal/empleados'),
          api.get('/api/v1/personal/cuadrillas'),
          api.get('/api/v1/personal/prenominas'),
          api.get('/api/v1/personal/pases-acceso'),
        ]);

        if (empRes.status === 'fulfilled') setEmpleados(empRes.value.data?.data || []);
        if (cuaRes.status === 'fulfilled') setCuadrillas(cuaRes.value.data?.data || []);
        if (pnRes.status === 'fulfilled') setPrenominas(pnRes.value.data?.data || []);
        if (pasesRes.status === 'fulfilled') setPases(pasesRes.value.data?.data || []);
      } catch {
        setError('Error al conectar con el modulo de Personal.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);

  const estadoBadge = (estado: string) => {
    const map: Record<string, string> = {
      ACTIVO: 'border-green-500/20 bg-green-500/10 text-green-600',
      ACTIVA: 'border-green-500/20 bg-green-500/10 text-green-600',
      BAJA: 'border-red-500/20 bg-red-500/10 text-red-600',
      SUSPENDIDO: 'border-amber-500/20 bg-amber-500/10 text-amber-600',
      BORRADOR: 'border-slate-200 bg-slate-100 text-slate-600',
      CALCULADA: 'border-blue-500/20 bg-blue-500/10 text-blue-600',
      AUTORIZADA: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-600',
      PAGADA: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600',
    };

    return (
      <SectionBadge className={cn('rounded-full px-3 py-1 text-[10px]', map[estado] || '')}>
        {estado}
      </SectionBadge>
    );
  };

  const catBadge = (categoria: string) => {
    const map: Record<string, string> = {
      OBRERO: 'bg-amber-500/10 text-amber-700',
      TECNICO: 'bg-blue-500/10 text-blue-700',
      ADMINISTRATIVO: 'bg-indigo-500/10 text-indigo-700',
      SUPERVISOR: 'bg-emerald-500/10 text-emerald-700',
    };

    return (
      <SectionBadge className={cn('rounded-md px-2 py-0.5 text-[9px]', map[categoria] || 'bg-slate-100 text-slate-600')}>
        {categoria}
      </SectionBadge>
    );
  };

  const pasesAlerta = pases.filter(p => diasRestantes(p.fecha_vencimiento) <= ALERTA_DIAS);
  const pasesVencidos = pases.filter(p => diasRestantes(p.fecha_vencimiento) < 0);

  const tabs = [
    { id: 'empleados' as TabId, label: 'Empleados', count: empleados.length, icon: IconUsers },
    { id: 'cuadrillas' as TabId, label: 'Cuadrillas', count: cuadrillas.length, icon: IconBriefcase },
    { id: 'prenomina' as TabId, label: 'Pre-Nomina', count: prenominas.length, icon: IconWallet },
    { id: 'pases' as TabId, label: 'Pases de Acceso', count: pases.length, icon: IconShieldCheck, alert: pasesAlerta.length },
  ];

  const activos = empleados.filter((empleado) => empleado.estado === 'ACTIVO').length;
  const certs = empleados.filter(
    (empleado) => empleado.certificaciones && empleado.certificaciones !== 'null'
  ).length;
  const nominaDiaria = empleados
    .filter((empleado) => empleado.estado === 'ACTIVO')
    .reduce((sum, empleado) => sum + Number(empleado.salario_diario), 0);

  return (
    <div className="animate-in space-y-8 fade-in duration-700">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="space-y-3">
          <SectionBadge className="border-violet-500/20 bg-violet-500/10 text-violet-700">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Recursos humanos
          </SectionBadge>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-500/5 bg-violet-500/10 shadow-inner">
              <IconUsers className="h-8 w-8 text-violet-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-foreground">
                Personal
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Recursos Humanos
                </p>
                <SectionBadge className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] text-violet-600">
                  {activos} activos
                </SectionBadge>
                <SectionBadge className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-600">
                  {certs} certificados
                </SectionBadge>
              </div>
            </div>
          </div>
        </div>

        <Button className="rounded-2xl bg-violet-600 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-violet-600/20 hover:bg-violet-500">
          <IconPlus className="h-4 w-4" />
          {activeTab === 'empleados'
            ? 'Nuevo Empleado'
            : activeTab === 'cuadrillas'
              ? 'Nueva Cuadrilla'
              : 'Calcular Nomina'}
        </Button>
      </div>

      {/* ── Banner de alertas de pases ── */}
      {pasesAlerta.length > 0 && (
        <button
          type="button"
          onClick={() => setActiveTab('pases')}
          className="w-full rounded-2xl border text-left transition-all hover:opacity-90 active:scale-[0.99]"
          style={{
            borderColor: pasesVencidos.length > 0 ? 'hsl(0 72% 51% / 0.3)' : 'hsl(38 92% 50% / 0.3)',
            background: pasesVencidos.length > 0 ? 'hsl(0 72% 51% / 0.06)' : 'hsl(38 92% 50% / 0.06)',
          }}
        >
          <div className="flex items-center gap-3 px-4 py-3">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${pasesVencidos.length > 0 ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
              <IconAlertCircle className={`h-4 w-4 ${pasesVencidos.length > 0 ? 'text-red-500' : 'text-amber-500'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-black uppercase tracking-wide ${pasesVencidos.length > 0 ? 'text-red-600' : 'text-amber-600'}`}>
                {pasesVencidos.length > 0
                  ? `${pasesVencidos.length} pase${pasesVencidos.length > 1 ? 's' : ''} VENCIDO${pasesVencidos.length > 1 ? 'S' : ''} — Acceso bloqueado`
                  : `${pasesAlerta.length} pase${pasesAlerta.length > 1 ? 's' : ''} por vencer en menos de ${ALERTA_DIAS} días`
                }
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {pasesAlerta.map(p => p.empleado_nombre.split(' ')[0]).join(', ')} — Click para ver detalles
              </p>
            </div>
            <IconShieldCheck className={`h-4 w-4 shrink-0 ${pasesVencidos.length > 0 ? 'text-red-400' : 'text-amber-400'}`} />
          </div>
        </button>
      )}

      <div className="flex flex-wrap gap-2 rounded-2xl border border-border/30 bg-muted/30 p-1.5">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            variant={activeTab === tab.id ? 'outline' : 'ghost'}
            className={cn(
              'flex-1 justify-center rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest',
              activeTab === tab.id
                ? 'border-border/40 bg-card text-violet-600 shadow-lg'
                : 'text-muted-foreground hover:bg-card/50 hover:text-foreground'
            )}
          >
            <tab.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[10px] font-black',
                activeTab === tab.id
                  ? 'bg-violet-500/10 text-violet-600'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {tab.count}
            </span>
            {'alert' in tab && (tab as any).alert > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white">
                {(tab as any).alert}
              </span>
            )}
          </Button>
        ))}
      </div>

      {loading ? (
        <Card className="border-border/40">
          <CardContent className="flex h-96 flex-col items-center justify-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-500/10 border-t-violet-600" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">
              Cargando plantilla...
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
          {activeTab === 'empleados' && (
            <Card className="overflow-hidden rounded-3xl border-border/40 shadow-xl">
              <TableContainer>
                <Table className="min-w-[840px]">
                  <TableHeader>
                    <tr>
                      <TableHead>Empleado</TableHead>
                      <TableHead>Puesto</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Cuadrilla</TableHead>
                      <TableHead className="text-right">S. Diario</TableHead>
                      <TableHead className="text-center">Estado</TableHead>
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {empleados.map((empleado) => (
                      <TableRow key={empleado.id_empleado} className="group">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/10 text-xs font-black text-violet-600">
                              {empleado.nombre.charAt(0)}
                              {empleado.apellido_paterno.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-800">
                                {empleado.nombre} {empleado.apellido_paterno}
                              </div>
                              <div className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">
                                {empleado.numero_empleado}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm font-medium text-slate-700">
                          {empleado.puesto}
                        </TableCell>
                        <TableCell>{catBadge(empleado.categoria)}</TableCell>
                        <TableCell>
                          {empleado.cuadrilla ? (
                            <SectionBadge className="rounded-md bg-slate-100 px-2 py-1 text-[10px] text-slate-600">
                              {empleado.cuadrilla.codigo}
                            </SectionBadge>
                          ) : (
                            <span className="text-[10px] font-bold text-muted-foreground/50">
                              Sin asignar
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm font-bold text-slate-900">
                          {formatCurrency(Number(empleado.salario_diario))}
                        </TableCell>
                        <TableCell className="text-center">{estadoBadge(empleado.estado)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {empleados.length > 0 ? (
                <TableFooterBar>
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {empleados.length} empleados registrados
                  </span>
                  <SectionBadge className="rounded-full bg-violet-500/10 px-3 py-1 text-[10px] text-violet-600">
                    Nomina diaria: {formatCurrency(nominaDiaria)}
                  </SectionBadge>
                </TableFooterBar>
              ) : null}
            </Card>
          )}

          {activeTab === 'cuadrillas' && (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {cuadrillas.length === 0 ? (
                <div className="sm:col-span-2 xl:col-span-3">
                  <EmptyStatePanel
                    icon={<IconUsers className="h-12 w-12 text-muted-foreground/20" />}
                    title="Sin cuadrillas registradas"
                  />
                </div>
              ) : (
                cuadrillas.map((cuadrilla) => (
                  <Card
                    key={cuadrilla.id_cuadrilla}
                    className="group relative overflow-hidden border-border/40 transition-all hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-violet-500 opacity-50" />
                    <CardContent className="space-y-4 p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-violet-600">
                            {cuadrilla.codigo}
                          </span>
                          <h3 className="mt-0.5 text-sm font-bold text-slate-800">
                            {cuadrilla.nombre}
                          </h3>
                        </div>
                        {estadoBadge(cuadrilla.estado)}
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                          <IconBriefcase className="h-3.5 w-3.5" />
                          <span>{cuadrilla.especialidad}</span>
                        </div>
                        {cuadrilla.capataz_nombre ? (
                          <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                            <IconShieldCheck className="h-3.5 w-3.5" />
                            <span>
                              Capataz:{' '}
                              <strong className="text-foreground">{cuadrilla.capataz_nombre}</strong>
                            </span>
                          </div>
                        ) : null}
                        <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                          <IconUsers className="h-3.5 w-3.5" />
                          <span>
                            <strong className="text-base text-foreground">
                              {cuadrilla._count?.miembros || 0}
                            </strong>{' '}
                            miembros
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === 'pases' && (
            <Card className="overflow-hidden rounded-3xl border-border/40 shadow-xl">
              <TableContainer>
                <Table className="min-w-[720px]">
                  <TableHeader>
                    <tr>
                      <TableHead># Pase</TableHead>
                      <TableHead>Trabajador</TableHead>
                      <TableHead>Puesto</TableHead>
                      <TableHead>Área</TableHead>
                      <TableHead className="text-center">Vencimiento</TableHead>
                      <TableHead className="text-center">Días Restantes</TableHead>
                      <TableHead className="text-center">Estado</TableHead>
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {pases.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-16 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <IconShieldCheck className="h-12 w-12 text-muted-foreground opacity-20" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">
                              Sin pases registrados
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      [...pases]
                        .sort((a, b) => diasRestantes(a.fecha_vencimiento) - diasRestantes(b.fecha_vencimiento))
                        .map((pase) => {
                          const dias = diasRestantes(pase.fecha_vencimiento);
                          const urgencia = urgenciaPase(dias);
                          return (
                            <TableRow key={pase.id} className="group">
                              <TableCell>
                                <span className="font-mono font-black text-sm text-violet-600">{pase.numero_pase}</span>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="text-sm font-bold text-foreground">{pase.empleado_nombre}</div>
                                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{pase.empleado_numero}</div>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm font-medium text-muted-foreground">{pase.puesto}</TableCell>
                              <TableCell>
                                <SectionBadge className="rounded-md bg-muted px-2 py-1 text-[10px] text-muted-foreground">
                                  {pase.area_acceso || '—'}
                                </SectionBadge>
                              </TableCell>
                              <TableCell className="text-center text-sm font-bold text-foreground">
                                {new Date(pase.fecha_vencimiento).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </TableCell>
                              <TableCell className="text-center">
                                <span className={`font-mono font-black text-sm ${dias < 0 ? 'text-red-600' : dias <= 7 ? 'text-orange-600' : dias <= ALERTA_DIAS ? 'text-amber-600' : 'text-green-600'}`}>
                                  {dias < 0 ? `−${Math.abs(dias)}` : dias} días
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                <SectionBadge className={cn('rounded-full border px-3 py-1 text-[10px] font-black', urgencia.className)}>
                                  <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', urgencia.dot)} />
                                  {urgencia.label}
                                </SectionBadge>
                              </TableCell>
                            </TableRow>
                          );
                        })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              {pases.length > 0 && (
                <TableFooterBar>
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {pases.length} pases registrados
                  </span>
                  <div className="flex items-center gap-3">
                    {pasesVencidos.length > 0 && (
                      <SectionBadge className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-[10px] text-red-600">
                        {pasesVencidos.length} vencidos
                      </SectionBadge>
                    )}
                    {pasesAlerta.filter(p => diasRestantes(p.fecha_vencimiento) >= 0).length > 0 && (
                      <SectionBadge className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[10px] text-amber-600">
                        {pasesAlerta.filter(p => diasRestantes(p.fecha_vencimiento) >= 0).length} por vencer
                      </SectionBadge>
                    )}
                  </div>
                </TableFooterBar>
              )}
            </Card>
          )}

          {activeTab === 'prenomina' && (
            <div className="space-y-4">
              {prenominas.length === 0 ? (
                <EmptyStatePanel
                  icon={<IconWallet className="h-12 w-12 text-muted-foreground/20" />}
                  title="Sin pre-nominas"
                  description='Usa el boton "Calcular Nomina" para generar la primera.'
                />
              ) : (
                prenominas.map((prenomina) => (
                  <Card
                    key={prenomina.id_prenomina}
                    className="group relative overflow-hidden border-border/40 transition-all hover:shadow-xl"
                  >
                    <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-violet-500 opacity-50" />
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="mb-1 flex items-center gap-3">
                            <span className="text-xl font-black tracking-tighter text-violet-600">
                              {prenomina.codigo}
                            </span>
                            {estadoBadge(prenomina.estado)}
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-4 text-[11px] font-medium text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <IconClock className="h-3.5 w-3.5" />
                              {prenomina.periodo_tipo}
                            </span>
                            <span>
                              {new Date(prenomina.periodo_inicio).toLocaleDateString('es-MX', {
                                day: '2-digit',
                                month: 'short',
                              })}{' '}
                              -{' '}
                              {new Date(prenomina.periodo_fin).toLocaleDateString('es-MX', {
                                day: '2-digit',
                                month: 'short',
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              <IconUsers className="h-3.5 w-3.5" />
                              {prenomina.total_empleados} empleados
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-black tracking-tighter text-slate-900">
                            {formatCurrency(Number(prenomina.total_neto))}
                          </div>
                          <p className="mt-0.5 text-[10px] font-bold text-muted-foreground">
                            NETO A PAGAR
                          </p>
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
