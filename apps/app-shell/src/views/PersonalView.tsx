import React, { useEffect, useState } from 'react';
import api from '../lib/api';
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

type TabId = 'empleados' | 'cuadrillas' | 'prenomina';

export const PersonalView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('empleados');
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [cuadrillas, setCuadrillas] = useState<Cuadrilla[]>([]);
  const [prenominas, setPrenominas] = useState<PreNomina[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [empRes, cuaRes, pnRes] = await Promise.allSettled([
          api.get('/api/v1/personal/empleados'),
          api.get('/api/v1/personal/cuadrillas'),
          api.get('/api/v1/personal/prenominas'),
        ]);

        if (empRes.status === 'fulfilled') setEmpleados(empRes.value.data?.data || []);
        if (cuaRes.status === 'fulfilled') setCuadrillas(cuaRes.value.data?.data || []);
        if (pnRes.status === 'fulfilled') setPrenominas(pnRes.value.data?.data || []);
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

  const tabs = [
    { id: 'empleados' as TabId, label: 'Empleados', count: empleados.length, icon: IconUsers },
    { id: 'cuadrillas' as TabId, label: 'Cuadrillas', count: cuadrillas.length, icon: IconBriefcase },
    { id: 'prenomina' as TabId, label: 'Pre-Nomina', count: prenominas.length, icon: IconWallet },
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
              <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900">
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
            {tab.label}
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
