import * as React from 'react';
import { Card, CardContent, cn } from '../primitives';

export function MetricCard({
  className,
  icon,
  value,
  label,
  description,
  trend,
  trendTone = 'neutral',
  accentClassName,
  iconContainerClassName,
  valueClassName,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  icon?: React.ReactNode;
  value: React.ReactNode;
  label: React.ReactNode;
  description?: React.ReactNode;
  trend?: React.ReactNode;
  trendTone?: 'positive' | 'warning' | 'neutral';
  accentClassName?: string;
  iconContainerClassName?: string;
  valueClassName?: string;
}) {
  const trendClassName: Record<NonNullable<typeof trendTone>, string> = {
    positive: 'bg-emerald-500/10 text-emerald-600',
    warning: 'bg-amber-500/10 text-amber-600',
    neutral: 'bg-muted text-muted-foreground',
  };

  return (
    <Card
      className={cn(
        'group relative overflow-hidden border-border/30 p-5 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:border-border/60',
        className
      )}
      {...props}
    >
      <CardContent className="p-0">
        <div className="mb-4 flex items-start justify-between">
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', iconContainerClassName)}>
            {icon}
          </div>
          {trend ? (
            <div
              className={cn(
                'flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold',
                trendClassName[trendTone]
              )}
            >
              {trend}
            </div>
          ) : null}
        </div>
        <div className={cn('text-2xl font-black tracking-tighter md:text-3xl', valueClassName)}>
          {value}
        </div>
        <div className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          {label}
        </div>
        {description ? <p className="mt-3 text-[11px] font-medium text-slate-400">{description}</p> : null}
        <div
          className={cn(
            'absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100',
            accentClassName
          )}
        />
      </CardContent>
    </Card>
  );
}

export function ProgressRing({
  percentage,
  valueLabel,
  colorClassName = 'text-primary',
  size = 52,
  strokeWidth = 4,
  className,
}: {
  percentage: number;
  valueLabel?: React.ReactNode;
  colorClassName?: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90 transform">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-slate-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={colorClassName}
        />
      </svg>
      {valueLabel ? (
        <span className={cn('pointer-events-none absolute text-[10px] font-black', colorClassName)}>
          {valueLabel}
        </span>
      ) : null}
    </div>
  );
}

export function BudgetHealthCard({
  className,
  title,
  subtitle,
  currentValue,
  totalValue,
  chart,
  items,
  headerSlot,
  ...props
}: Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> & {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  currentValue: React.ReactNode;
  totalValue?: React.ReactNode;
  chart?: React.ReactNode;
  headerSlot?: React.ReactNode;
  items: Array<{
    label: React.ReactNode;
    value: React.ReactNode;
    percentage: number;
    colorClassName?: string;
  }>;
}) {
  return (
    <Card className={cn('rounded-2xl border-border/30 p-6 shadow-sm md:p-8', className)} {...props}>
      <CardContent className="p-0">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">{title}</h3>
            {subtitle ? <p className="mt-1 text-[11px] font-medium text-muted-foreground">{subtitle}</p> : null}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tighter text-primary">{currentValue}</span>
            {totalValue ? <span className="text-[10px] font-bold text-muted-foreground">/ {totalValue}</span> : null}
          </div>
          {headerSlot}
        </div>

        {chart ? <div className="mb-4">{chart}</div> : null}

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {items.map((item) => (
            <div key={String(item.label)} className="text-center">
              <ProgressRing
                percentage={item.percentage}
                valueLabel={`${item.percentage}%`}
                colorClassName={item.colorClassName}
                className="mb-2"
              />
              <div className="text-sm font-black tracking-tighter text-foreground">{item.value}</div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{item.label}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function OperationalBanner({
  className,
  badge,
  title,
  description,
  actions,
  tone = 'dark',
  ...props
}: Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> & {
  badge?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  tone?: 'dark' | 'neutral';
}) {
  const toneClassName =
    tone === 'dark'
      ? 'border-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl'
      : 'border-border/40 bg-card text-foreground shadow-sm';

  return (
    <Card className={cn('relative overflow-hidden rounded-2xl p-6 md:p-8', toneClassName, className)} {...props}>
      {tone === 'dark' ? (
        <>
          <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-indigo-500/15 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-emerald-500/10 blur-3xl" />
        </>
      ) : null}
      <CardContent className="relative z-10 flex flex-col justify-between gap-6 p-0 md:flex-row md:items-center">
        <div className="flex-1">
          {badge ? <div className="mb-4">{badge}</div> : null}
          <h2 className={cn('mb-2 text-xl font-black uppercase tracking-tighter md:text-2xl', tone === 'dark' ? 'text-white' : 'text-foreground')}>
            {title}
          </h2>
          {description ? (
            <p className={cn('max-w-lg text-sm font-medium leading-relaxed', tone === 'dark' ? 'text-slate-400' : 'text-muted-foreground')}>
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </CardContent>
    </Card>
  );
}
