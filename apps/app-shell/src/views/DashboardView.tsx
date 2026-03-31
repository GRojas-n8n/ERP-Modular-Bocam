import React, { useEffect, useMemo, useState } from 'react';
import { useTenant } from '../context/TenantContext';
import { useDashboardData } from '../hooks/useDashboardData';
import {
  BudgetHealthCard,
  Button,
  Card,
  CardContent,
  EmptyStatePanel,
  MetricCard,
  OperationalBanner,
  SectionBadge,
  cn,
} from '@bocam/ui-core';
import {
  IconActivity,
  IconArrowUpRight,
  IconBriefcase,
  IconCheckCircle2,
  IconClock,
  IconFileText,
  IconShieldCheck,
  IconShoppingCart,
  IconTrendingUp,
  IconUsers,
  IconWallet,
} from '../components/Icons';

function useAnimatedNumber(target: number, duration = 1200) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    let raf = 0;

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCurrent(Math.floor(eased * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return current;
}

const Sparkline: React.FC<{ data: number[]; color?: string; height?: number }> = ({
  data,
  color = '#6366f1',
  height = 48,
}) => {
  const width = 200;
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * (height - 8) - 4;
    return `${x},${y}`;
  });
  const linePath = `M${points.join(' L')}`;
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id="dashboardSparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#dashboardSparkGrad)" />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle
        cx={width}
        cy={height - ((data[data.length - 1] - min) / range) * (height - 8) - 4}
        r="3.5"
        fill={color}
        stroke="white"
        strokeWidth="2"
      />
    </svg>
  );
};

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString('es-MX')}`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Justo ahora';
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs}h`;
  return `Hace ${Math.floor(hrs / 24)}d`;
}

function getMovimientoMeta(tipo: string) {
  switch (tipo) {
    case 'COMPROMISO':
      return { type: 'warning' as const, icon: IconClock, label: 'Compromiso' };
    case 'EJERCIDO':
      return { type: 'success' as const, icon: IconCheckCircle2, label: 'Pago Ejercido' };
    case 'LIBERACION':
      return { type: 'info' as const, icon: IconArrowUpRight, label: 'Liberacion' };
    default:
      return { type: 'info' as const, icon: IconActivity, label: tipo };
  }
}

interface DashboardViewProps {
  onNavigate: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { user, tenant } = useTenant();
  const dashboard = useDashboardData();
  const [visibleItems, setVisibleItems] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleItems((prev) => {
        if (prev >= 10) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 80);
    return () => clearInterval(timer);
  }, []);

  const totalAutorizado = dashboard.resumen?.total_autorizado || 0;
  const totalEjercido = dashboard.resumen?.total_ejercido || 0;
  const totalComprometido = dashboard.resumen?.total_comprometido || 0;
  const totalDisponible = dashboard.resumen?.total_disponible || 0;
  const porcentajeEjercido = dashboard.resumen?.porcentaje_ejercido || 0;
  const ocCount = dashboard.ordenesCompra.length;
  const ocPendientes = dashboard.ordenesCompra.filter((oc) => oc.estado === 'EMITIDA' || oc.estado === 'PENDIENTE').length;

  const animProyectos = useAnimatedNumber(user?.projects?.length || 0);
  const animPresupuesto = useAnimatedNumber(totalAutorizado, 1800);
  const animOC = useAnimatedNumber(ocCount, 900);
  const animEficiencia = useAnimatedNumber(
    totalAutorizado > 0 ? Math.round(((totalAutorizado - totalDisponible) / totalAutorizado) * 1000) : 0,
    1400
  );

  const sparklineData = useMemo(() => {
    if (dashboard.movimientos.length === 0) return [0, 0];
    const sorted = [...dashboard.movimientos].reverse();
    let acc = 0;
    return sorted.map((movimiento) => {
      acc += Number(movimiento.monto);
      return acc;
    });
  }, [dashboard.movimientos]);

  const actividadReciente = useMemo(() => {
    const items: Array<{
      id: string;
      type: 'success' | 'warning' | 'info';
      icon: React.FC<any>;
      title: string;
      module: string;
      timestamp: string;
      detail: string;
    }> = [];

    dashboard.movimientos.slice(0, 4).forEach((movimiento) => {
      const meta = getMovimientoMeta(movimiento.tipo);
      items.push({
        id: movimiento.id_movimiento,
        type: meta.type,
        icon: meta.icon,
        title: `${meta.label}: ${formatCurrency(Number(movimiento.monto))}`,
        module: 'Finanzas',
        timestamp: timeAgo(movimiento.fecha_registro),
        detail: movimiento.concepto,
      });
    });

    dashboard.ordenesCompra.slice(0, 2).forEach((orden) => {
      items.push({
        id: orden.id_orden,
        type: orden.estado === 'CANCELADA' ? 'warning' : 'success',
        icon: IconShoppingCart,
        title: `OC ${orden.codigo} - ${orden.estado}`,
        module: 'Compras',
        timestamp: timeAgo(orden.fecha_emision),
        detail: orden.proveedor?.razon_social || `Total: ${formatCurrency(Number(orden.total))}`,
      });
    });

    return items.length
      ? items
      : [
          {
            id: 'empty',
            type: 'info' as const,
            icon: IconCheckCircle2,
            title: 'Sin actividad reciente',
            module: 'Sistema',
            timestamp: 'Ahora',
            detail: 'Todos los modulos operan con normalidad.',
          },
        ];
  }, [dashboard.movimientos, dashboard.ordenesCompra]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos dias';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }, []);

  const currentDate = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const modules = [
    { name: 'Gerencia Tecnica', desc: `${dashboard.totalInsumos} Insumos`, icon: IconBriefcase, id: 'insumos', color: 'indigo' },
    { name: 'Compras', desc: `${ocCount} OC Registradas`, icon: IconShoppingCart, id: 'compras', color: 'emerald' },
    { name: 'Finanzas', desc: 'Flujo de Caja', icon: IconWallet, id: 'finanzas', color: 'amber' },
    { name: 'Control de Obra', desc: 'Avances y Estimaciones', icon: IconFileText, id: 'control-obra', color: 'sky' },
    { name: 'Personal', desc: 'RRHH y Nomina', icon: IconUsers, id: 'personal', color: 'violet' },
    { name: 'Seguridad', desc: 'HSE y Certificaciones', icon: IconShieldCheck, id: 'seguridad', color: 'rose' },
  ];

  const colorMap: Record<string, { bg: string; icon: string; ring: string }> = {
    indigo: { bg: 'bg-indigo-500/10', icon: 'text-indigo-500', ring: 'hover:ring-indigo-500/30' },
    emerald: { bg: 'bg-emerald-500/10', icon: 'text-emerald-500', ring: 'hover:ring-emerald-500/30' },
    amber: { bg: 'bg-amber-500/10', icon: 'text-amber-500', ring: 'hover:ring-amber-500/30' },
    sky: { bg: 'bg-sky-500/10', icon: 'text-sky-500', ring: 'hover:ring-sky-500/30' },
    violet: { bg: 'bg-violet-500/10', icon: 'text-violet-500', ring: 'hover:ring-violet-500/30' },
    rose: { bg: 'bg-rose-500/10', icon: 'text-rose-500', ring: 'hover:ring-rose-500/30' },
  };

  const pctComprometido = totalAutorizado > 0 ? Math.round((totalComprometido / totalAutorizado) * 100) : 0;
  const pctEjercido = totalAutorizado > 0 ? Math.round((totalEjercido / totalAutorizado) * 100) : 0;
  const pctDisponible = totalAutorizado > 0 ? Math.round((totalDisponible / totalAutorizado) * 100) : 0;

  if (dashboard.loading) {
    return (
      <Card className="border-border/40">
        <CardContent className="flex h-96 flex-col items-center justify-center gap-6">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-primary/10" />
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-t-primary" />
          </div>
          <div className="flex flex-col items-center">
            <p className="text-sm font-black uppercase tracking-widest text-slate-900 animate-pulse">Sincronizando Modulos</p>
            <p className="mt-2 text-[10px] font-medium uppercase tracking-tighter text-muted-foreground">
              Finanzas · Compras · Gerencia Tecnica
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className={cn('flex flex-col justify-between gap-6 md:flex-row md:items-end', visibleItems >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4')}>
        <div>
          <p className="mb-1 text-sm font-semibold capitalize text-muted-foreground">{currentDate}</p>
          <h1 className="text-3xl font-black tracking-tighter text-foreground md:text-4xl">
            {greeting},{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-400 bg-clip-text text-transparent">
              {user?.name?.split(' ')[0]}
            </span>
          </h1>
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            Centro de control operativo - <span className="font-bold text-foreground">{tenant?.name}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <SectionBadge className="border-primary/20 bg-primary/5 px-3 py-1.5 text-[10px] text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            {user?.projects?.[0]?.code || 'Sin Proyecto'}
          </SectionBadge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        {[
          {
            label: 'Proyectos Activos',
            value: String(animProyectos),
            desc: 'Bajo tu supervision',
            trend: `+${user?.projects?.length || 0}`,
            trendTone: 'positive' as const,
            icon: <IconBriefcase className="h-5 w-5 text-indigo-600" />,
            iconBg: 'bg-indigo-500/8',
            valueClass: 'text-indigo-600',
          },
          {
            label: 'Presupuesto Autorizado',
            value: formatCurrency(animPresupuesto),
            desc: 'MXN Acumulado',
            trend: totalAutorizado > 0 ? `${pctDisponible}% libre` : '—',
            trendTone: pctDisponible > 15 ? ('positive' as const) : ('warning' as const),
            icon: <IconWallet className="h-5 w-5 text-emerald-600" />,
            iconBg: 'bg-emerald-500/8',
            valueClass: 'text-emerald-600',
          },
          {
            label: 'Ordenes de Compra',
            value: String(animOC),
            desc: ocPendientes > 0 ? `${ocPendientes} requieren atencion` : 'Todas procesadas',
            trend: String(ocPendientes),
            trendTone: ocPendientes === 0 ? ('positive' as const) : ('warning' as const),
            icon: <IconShoppingCart className="h-5 w-5 text-amber-600" />,
            iconBg: 'bg-amber-500/8',
            valueClass: 'text-amber-600',
          },
          {
            label: 'Ejecucion Presupuestal',
            value: `${(animEficiencia / 10).toFixed(1)}%`,
            desc: 'Comprometido + Ejercido',
            trend: `${porcentajeEjercido}% ejercido`,
            trendTone: porcentajeEjercido < 85 ? ('positive' as const) : ('warning' as const),
            icon: <IconTrendingUp className="h-5 w-5 text-primary" />,
            iconBg: 'bg-primary/8',
            valueClass: 'text-primary',
          },
        ].map((stat, index) => (
          <div key={stat.label} className={cn(visibleItems >= index + 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6', 'transition-all duration-700')} style={{ transitionDelay: `${index * 60}ms` }}>
            <MetricCard
              icon={stat.icon}
              iconContainerClassName={stat.iconBg}
              value={stat.value}
              valueClassName={stat.valueClass}
              label={stat.label}
              description={stat.desc}
              trend={stat.trend}
              trendTone={stat.trendTone}
            />
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <BudgetHealthCard
          className={cn(
            'lg:col-span-3',
            visibleItems >= 7 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
            'transition-all duration-700'
          )}
          title={
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              Consumo Presupuestal
            </span>
          }
          subtitle="Tendencia de movimientos - Datos en tiempo real"
          currentValue={formatCurrency(totalEjercido + totalComprometido)}
          totalValue={formatCurrency(totalAutorizado)}
          chart={<Sparkline data={sparklineData} color="#6366f1" height={120} />}
          items={[
            {
              label: 'Comprometido',
              value: formatCurrency(totalComprometido),
              percentage: pctComprometido,
              colorClassName: 'text-indigo-500',
            },
            {
              label: 'Ejercido',
              value: formatCurrency(totalEjercido),
              percentage: pctEjercido,
              colorClassName: 'text-emerald-500',
            },
            {
              label: 'Disponible',
              value: formatCurrency(totalDisponible),
              percentage: pctDisponible,
              colorClassName: 'text-amber-500',
            },
          ]}
        />

        <Card className={cn('rounded-2xl border-border/30 p-6 shadow-sm md:p-8 lg:col-span-2', visibleItems >= 8 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6', 'transition-all duration-700')}>
          <CardContent className="p-0">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest">
                <IconActivity className="h-4 w-4 text-primary" />
                Actividad Reciente
              </h3>
              <SectionBadge className="bg-primary/10 text-[10px] text-primary">
                {dashboard.movimientos.length > 0 ? 'En Vivo' : 'Sin Datos'}
              </SectionBadge>
            </div>

            <div className="space-y-3">
              {actividadReciente.map((item, index) => (
                <div key={item.id} className={cn('flex gap-3 rounded-xl border border-border/20 bg-muted/20 p-3 transition-all', visibleItems >= 9 + index ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4')} style={{ transitionDelay: `${index * 100}ms`, transitionDuration: '500ms' }}>
                  <div className={cn('flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg', item.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : item.type === 'warning' ? 'bg-amber-500/10 text-amber-500' : 'bg-sky-500/10 text-sky-500')}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-foreground">{item.title}</span>
                    <p className="mt-0.5 truncate text-[11px] font-medium text-muted-foreground">{item.detail}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">{item.timestamp}</span>
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-muted-foreground">{item.module}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className={cn(visibleItems >= 10 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6', 'transition-all duration-700')}>
        <div className="mb-5 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            Mis Proyectos
          </h3>
          <span className="text-[10px] font-bold text-muted-foreground">{user?.projects?.length || 0} Centros de Costos</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {(user?.projects || []).length === 0 ? (
            <div className="sm:col-span-2 xl:col-span-3">
              <EmptyStatePanel
                icon={<IconBriefcase className="h-10 w-10 text-muted-foreground/40" />}
                title="Aun no tienes proyectos asignados"
                description="Contacta al administrador para obtener acceso."
              />
            </div>
          ) : (
            (user?.projects || []).map((project, index) => {
              const progress = Math.min(35 + index * 20, 100);
              return (
                <Card key={project.id} className="group cursor-pointer rounded-2xl border-border/30 p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg" onClick={() => onNavigate('insumos')}>
                  <CardContent className="p-0">
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{project.code}</span>
                        <h4 className="mt-0.5 text-sm font-bold leading-tight text-foreground">{project.name}</h4>
                      </div>
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    </div>
                    <div className="mb-3">
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Avance General</span>
                        <span className="text-[10px] font-black text-foreground">{progress}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold capitalize text-muted-foreground">{project.status || 'En curso'}</span>
                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                        Explorar <IconArrowUpRight className="h-3 w-3" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      <div className={cn(visibleItems >= 11 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6', 'transition-all duration-700')}>
        <div className="mb-5 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest">
            <div className="h-2 w-2 rounded-full bg-primary" />
            Ecosistema de Modulos
          </h3>
          <span className="text-[10px] font-bold text-muted-foreground">{modules.length} Activos</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => {
            const colors = colorMap[module.color] || colorMap.indigo;
            return (
              <Button
                key={module.id}
                onClick={() => onNavigate(module.id)}
                variant="outline"
                className={cn('h-auto justify-start gap-4 rounded-2xl border-border/30 bg-card p-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:ring-2 hover:ring-offset-2 hover:ring-offset-background', colors.ring)}
              >
                <div className={cn('flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl', colors.bg)}>
                  <module.icon className={cn('h-5 w-5', colors.icon)} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold">{module.name}</div>
                  <div className="truncate text-[10px] font-medium uppercase tracking-tighter text-muted-foreground">{module.desc}</div>
                </div>
                <SectionBadge className="flex-shrink-0 bg-emerald-500/10 text-[9px] text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </SectionBadge>
              </Button>
            );
          })}
        </div>
      </div>

      <OperationalBanner
        className={cn(
          visibleItems >= 12 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
          'transition-all duration-700'
        )}
        tone="dark"
        badge={
          <SectionBadge className="border-white/10 bg-white/10 text-[9px] text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Seguridad Nivel 4 Activa
          </SectionBadge>
        }
        title="Identidad Verificada via JWT"
        description="Tu sesion esta protegida por firma criptografica. Cada modulo valida tu identidad de forma independiente, garantizando el aislamiento total de datos."
        actions={
          <>
            {user?.role?.map((role) => (
              <SectionBadge
                key={role}
                className="border-white/10 bg-white/15 px-3.5 py-1.5 text-[10px] text-white shadow-lg"
              >
                {role}
              </SectionBadge>
            ))}
          </>
        }
      />
    </div>
  );
};
