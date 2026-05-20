import React, { useEffect, useState } from 'react';
import {
  BudgetHealthCard,
  Button,
  Card,
  CardContent,
  OperationalBanner,
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
  IconAlertCircle,
  IconArrowDownRight,
  IconCalendar,
  IconCheckCircle2,
  IconClock,
  IconDownload,
  IconFilter,
  IconTrendingUp,
  IconWallet,
} from '../components/Icons';
import api from '../lib/api';
import { useTenant } from '../context/TenantContext';
import { DEMO_RESUMEN_FINANCIERO, DEMO_PAGOS } from '../lib/demoData';

interface PagoProgramado {
  id_pago: string;
  concepto: string;
  beneficiario: string;
  monto_programado: number;
  fecha_programada: string;
  estado: string;
  referencia_modulo: string;
}

interface ResumenFinanciero {
  total_autorizado: number;
  total_ejercido: number;
  total_comprometido: number;
  total_disponible: number;
  porcentaje_ejercido: number;
}

// ─── Exportación CSV ─────────────────────────────────────────────────────────
function exportarCSV(resumen: ResumenFinanciero | null, pagos: PagoProgramado[], formatCurrency: (n: number) => string) {
  const fecha = new Date().toLocaleDateString('es-MX');
  const filas: string[][] = [];

  filas.push(['REPORTE DE FINANZAS — FLUJO DE CAJA']);
  filas.push([`Generado: ${fecha}`]);
  filas.push([]);
  filas.push(['RESUMEN PRESUPUESTAL']);
  filas.push(['Concepto', 'Importe (MXN)']);
  if (resumen) {
    filas.push(['Autorizado Total',  formatCurrency(resumen.total_autorizado)]);
    filas.push(['Comprometido (OC)', formatCurrency(resumen.total_comprometido)]);
    filas.push(['Ejercido (Pagado)', formatCurrency(resumen.total_ejercido)]);
    filas.push(['Disponible Real',   formatCurrency(resumen.total_disponible)]);
  }
  filas.push([]);
  filas.push(['EGRESOS PROGRAMADOS']);
  filas.push(['Fecha', 'Concepto', 'Beneficiario', 'Módulo', 'Monto (MXN)', 'Estado']);
  pagos.forEach(p => {
    filas.push([
      new Date(p.fecha_programada).toLocaleDateString('es-MX'),
      p.concepto,
      p.beneficiario,
      p.referencia_modulo,
      formatCurrency(p.monto_programado),
      p.estado,
    ]);
  });

  const csv = '﻿' + filas.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `finanzas-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Exportación PDF (ventana de impresión) ───────────────────────────────────
function exportarPDF(resumen: ResumenFinanciero | null, pagos: PagoProgramado[], formatCurrency: (n: number) => string) {
  const fecha = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
  const filasPagos = pagos.map(p => `
    <tr>
      <td>${new Date(p.fecha_programada).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}</td>
      <td><strong>${p.concepto}</strong><br><small>${p.beneficiario}</small></td>
      <td>${p.referencia_modulo}</td>
      <td class="mono right">${formatCurrency(p.monto_programado)}</td>
      <td><span class="badge ${p.estado}">${p.estado}</span></td>
    </tr>`).join('');

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
  <title>Reporte Finanzas</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 11px; color: #1e293b; padding: 32px; }
    .header { border-bottom: 3px solid #00b8d9; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
    .header h1 { font-size: 22px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.5px; }
    .header p { color: #64748b; font-size: 10px; }
    .section-title { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin: 20px 0 8px; }
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
    .stat { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
    .stat .label { font-size: 9px; font-weight: 700; text-transform: uppercase; color: #94a3b8; }
    .stat .value { font-size: 16px; font-weight: 900; color: #00b8d9; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f8fafc; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; padding: 10px 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
    td small { color: #94a3b8; font-size: 9px; }
    .mono { font-family: monospace; font-weight: 700; }
    .right { text-align: right; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 9px; font-weight: 700; text-transform: uppercase; }
    .badge.PAGADO { background: #dcfce7; color: #16a34a; }
    .badge.PENDIENTE { background: #fef9c3; color: #ca8a04; }
    .badge.CANCELADO { background: #fee2e2; color: #dc2626; }
    .footer { margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 9px; color: #94a3b8; display: flex; justify-content: space-between; }
    @media print { body { padding: 20px; } }
  </style></head><body>
  <div class="header">
    <div><h1>Flujo de Caja</h1><p>Módulo de Finanzas · Iretum ERP Industrial</p></div>
    <div style="text-align:right"><p style="font-weight:700">Fecha de generación</p><p>${fecha}</p></div>
  </div>
  ${resumen ? `
  <p class="section-title">Resumen Presupuestal</p>
  <div class="stats">
    <div class="stat"><div class="label">Autorizado Total</div><div class="value">${formatCurrency(resumen.total_autorizado)}</div></div>
    <div class="stat"><div class="label">Comprometido</div><div class="value" style="color:#f59e0b">${formatCurrency(resumen.total_comprometido)}</div></div>
    <div class="stat"><div class="label">Ejercido</div><div class="value" style="color:#6366f1">${formatCurrency(resumen.total_ejercido)}</div></div>
    <div class="stat"><div class="label">Disponible</div><div class="value" style="color:#22c55e">${formatCurrency(resumen.total_disponible)}</div></div>
  </div>` : ''}
  <p class="section-title">Egresos Programados (${pagos.length} registros)</p>
  <table><thead><tr><th>Fecha</th><th>Concepto / Beneficiario</th><th>Módulo</th><th class="right">Monto</th><th>Estado</th></tr></thead>
  <tbody>${filasPagos || '<tr><td colspan="5" style="text-align:center;padding:20px;color:#94a3b8">Sin egresos registrados</td></tr>'}</tbody></table>
  <div class="footer"><span>Iretum® ERP Industrial SaaS</span><span>Reporte confidencial — uso interno</span></div>
  </body></html>`;

  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 400);
}

export const FinanzasView: React.FC = () => {
  const { tenant } = useTenant();
  const [resumen, setResumen] = useState<ResumenFinanciero | null>(null);
  const [pagos, setPagos] = useState<PagoProgramado[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (tenant?.id === 'iretum-demo') { setResumen(DEMO_RESUMEN_FINANCIERO); setPagos(DEMO_PAGOS as PagoProgramado[]); return; }
        const [dashRes, pagosRes] = await Promise.all([
          api.get('/api/v1/finanzas/dashboard'),
          api.get('/api/v1/finanzas/pagos'),
        ]);

        setResumen(dashRes.data.data.resumen_presupuestal);
        setPagos(pagosRes.data.data);
      } catch (err: any) {
        console.error('Error fetching finanzas data:', err);
        setError('Error al conectar con el modulo de Finanzas Central.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);

  const getStatusBadge = (estado: string) => {
    const styles: Record<string, string> = {
      PAGADO: 'border-green-500/20 bg-green-500/10 text-green-600',
      CANCELADO: 'border-red-500/20 bg-red-500/10 text-red-600',
      PENDIENTE: 'border-amber-500/20 bg-amber-500/10 text-amber-600',
    };

    return (
      <SectionBadge className={cn('rounded-full px-3 py-1 text-[10px]', styles[estado] || 'bg-slate-100 text-slate-600 border-slate-200')}>
        {estado}
      </SectionBadge>
    );
  };

  const pendienteTotal = pagos
    .filter((pago) => pago.estado === 'PENDIENTE')
    .reduce((sum, pago) => sum + Number(pago.monto_programado), 0);

  const disponibilidad = Math.round(
    (((resumen?.total_disponible || 0) / (resumen?.total_autorizado || 1)) * 100)
  );
  const comprometidoPct = Math.round(
    (((resumen?.total_comprometido || 0) / (resumen?.total_autorizado || 1)) * 100)
  );
  const ejercidoPct = Math.round(
    (((resumen?.total_ejercido || 0) / (resumen?.total_autorizado || 1)) * 100)
  );

  const stats = [
    {
      label: 'Autorizado Total',
      value: resumen?.total_autorizado || 0,
      color: 'text-slate-900',
      icon: IconCheckCircle2,
      bg: 'bg-slate-50',
    },
    {
      label: 'Comprometido (OC)',
      value: resumen?.total_comprometido || 0,
      color: 'text-amber-600',
      icon: IconClock,
      bg: 'bg-amber-50/50',
    },
    {
      label: 'Ejercido (Pagado)',
      value: resumen?.total_ejercido || 0,
      color: 'text-indigo-600',
      icon: IconArrowDownRight,
      bg: 'bg-indigo-50/50',
    },
    {
      label: 'Disponible Real',
      value: resumen?.total_disponible || 0,
      color: 'text-green-600',
      icon: IconTrendingUp,
      bg: 'bg-green-50/50',
    },
  ];

  return (
    <div className="animate-in space-y-10 fade-in slide-in-from-bottom-4 pb-20 duration-700">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="space-y-3">
          <SectionBadge className="border-primary/20 bg-primary/10 text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Tesoreria centralizada
          </SectionBadge>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/5 bg-primary/10 shadow-inner">
              <IconWallet className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-foreground">
                Flujo de Caja
              </h1>
              <p className="mt-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Tesoreria centralizada
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Dropdown de exportación */}
          <div className="relative">
            <Button
              variant="outline"
              className="rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-widest"
              onClick={() => setIsExportOpen(o => !o)}
              disabled={loading || !!error}
            >
              <IconDownload className="h-4 w-4" />
              Descargar Reporte
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                className={`ml-1 transition-transform ${isExportOpen ? 'rotate-180' : ''}`}>
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </Button>
            {isExportOpen && (
              <div
                className="absolute right-0 top-full z-50 mt-2 min-w-[180px] overflow-hidden rounded-xl border shadow-xl"
                style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
              >
                <button
                  type="button"
                  onClick={() => { exportarCSV(resumen, pagos, formatCurrency); setIsExportOpen(false); }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-xs font-bold transition-colors hover:bg-muted/60"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-500/10 text-green-600 font-black text-[10px]">XLS</span>
                  Excel / CSV
                </button>
                <div className="mx-3 border-t" style={{ borderColor: 'hsl(var(--border))' }} />
                <button
                  type="button"
                  onClick={() => { exportarPDF(resumen, pagos, formatCurrency); setIsExportOpen(false); }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-xs font-bold transition-colors hover:bg-muted/60"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 text-red-600 font-black text-[10px]">PDF</span>
                  PDF
                </button>
              </div>
            )}
          </div>
          <Button className="rounded-2xl bg-slate-900 px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-slate-900/20 hover:bg-slate-800">
            <IconCalendar className="h-4 w-4" />
            Programar Egreso
          </Button>
        </div>
      </div>

      {loading ? (
        <Card className="border-border/40">
          <CardContent className="flex h-96 flex-col items-center justify-center gap-6">
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 rounded-full border-4 border-primary/10" />
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-t-primary" />
            </div>
            <div className="flex flex-col items-center">
              <p className="text-sm font-black uppercase tracking-widest text-slate-900 animate-pulse">
                Sincronizando Core Financiero
              </p>
              <p className="mt-2 text-[10px] font-medium uppercase tracking-tighter text-muted-foreground">
                Iretum Cloud Hub v1.0
              </p>
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="space-y-6 p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
              <IconAlertCircle className="h-10 w-10 text-destructive" />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tighter text-destructive">
                Falla de Comunicacion
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm font-medium leading-relaxed text-muted-foreground">
                {error}
              </p>
            </div>
            <div className="flex justify-center">
              <Button
                onClick={() => window.location.reload()}
                className="bg-destructive text-white hover:brightness-110"
              >
                Reintentar Conexion
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card
                key={stat.label}
                className="group relative overflow-hidden rounded-3xl border-border/40 p-6 transition-all hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="absolute -right-4 -top-4 opacity-[0.03] transition-opacity group-hover:opacity-[0.08]">
                  <stat.icon className="h-24 w-24" />
                </div>
                <div className="relative z-10 mb-6 flex items-center justify-between">
                  <div className={cn('rounded-xl p-2.5 transition-colors', stat.bg)}>
                    <stat.icon className={cn('h-6 w-6', stat.color)} />
                  </div>
                  {stat.label === 'Disponible Real' ? (
                    <SectionBadge className="rounded-lg border-green-500/20 bg-green-500/10 px-2 py-1 text-[10px] text-green-600">
                      {disponibilidad}% libre
                    </SectionBadge>
                  ) : null}
                </div>
                <div className={cn('relative z-10 text-xl md:text-3xl font-black tracking-tighter', stat.color)}>
                  {formatCurrency(stat.value)}
                </div>
                <div className="relative z-10 mt-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">
                  {stat.label}
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="flex flex-col gap-3 px-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900">
                    Egresos Programados
                  </h3>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Proximos 30 dias naturales
                  </p>
                </div>
                <Button
                  variant="ghost"
                  className="self-start rounded-full bg-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-tighter text-primary hover:bg-primary/20 sm:self-auto"
                >
                  <IconFilter className="h-3 w-3" />
                  Filtrar Modulo
                </Button>
              </div>

              <Card className="overflow-hidden rounded-3xl border-border/40 shadow-xl backdrop-blur-sm">
                <TableContainer>
                  <Table className="min-w-[720px]">
                    <TableHeader>
                      <tr>
                        <TableHead className="md:px-8">Fecha</TableHead>
                        <TableHead className="md:px-8">Concepto / Beneficiario</TableHead>
                        <TableHead className="text-right md:px-8">Monto (MXN)</TableHead>
                        <TableHead className="text-center md:px-8">Estado</TableHead>
                      </tr>
                    </TableHeader>
                    <TableBody>
                      {pagos.length === 0 ? (
                        <tr>
                          <TableCell colSpan={4} className="px-4 py-16 text-center md:px-8 md:py-20">
                            <div className="flex flex-col items-center opacity-40">
                              <IconClock className="mb-4 h-12 w-12" />
                              <p className="text-sm font-bold uppercase tracking-widest">
                                Sin pagos pendientes
                              </p>
                              <p className="mt-1 text-[10px] font-medium">
                                El flujo de caja esta liberado para este periodo.
                              </p>
                            </div>
                          </TableCell>
                        </tr>
                      ) : (
                        pagos.map((pago) => (
                          <TableRow key={pago.id_pago} className="group">
                            <TableCell className="md:px-8 md:py-6">
                              <div className="flex flex-col">
                                <span className="text-base font-black tracking-tighter text-slate-900">
                                  {new Date(pago.fecha_programada).toLocaleDateString('es-MX', {
                                    day: '2-digit',
                                    month: 'short',
                                  })}
                                </span>
                                <span className="mt-1 text-[9px] font-black uppercase tracking-tighter text-primary">
                                  {pago.referencia_modulo}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="md:px-8 md:py-6">
                              <div className="flex flex-col gap-1">
                                <span className="max-w-[280px] truncate text-sm font-bold tracking-tight text-slate-800">
                                  {pago.concepto}
                                </span>
                                <div className="flex items-center gap-2">
                                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-100 text-[8px] font-black">
                                    B
                                  </div>
                                  <span className="max-w-[250px] truncate text-[11px] font-medium uppercase tracking-tighter text-muted-foreground">
                                    {pago.beneficiario}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right md:px-8 md:py-6">
                              <span className="font-mono text-lg font-black text-slate-900">
                                {formatCurrency(pago.monto_programado)}
                              </span>
                            </TableCell>
                            <TableCell className="text-center md:px-8 md:py-6">
                              {getStatusBadge(pago.estado)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </div>

            <div className="space-y-8">
              <BudgetHealthCard
                title="Posicion Presupuestal"
                subtitle="Comparativo ejecutivo del presupuesto financiero"
                currentValue={formatCurrency(resumen?.total_autorizado || 0)}
                totalValue={formatCurrency((resumen?.total_comprometido || 0) + (resumen?.total_ejercido || 0))}
                headerSlot={
                  <SectionBadge className="border-green-500/20 bg-green-500/10 text-[10px] text-green-600">
                    {disponibilidad}% libre
                  </SectionBadge>
                }
                items={[
                  {
                    label: 'Comprometido',
                    value: formatCurrency(resumen?.total_comprometido || 0),
                    percentage: comprometidoPct,
                    colorClassName: 'text-amber-500',
                  },
                  {
                    label: 'Ejercido',
                    value: formatCurrency(resumen?.total_ejercido || 0),
                    percentage: ejercidoPct,
                    colorClassName: 'text-indigo-500',
                  },
                  {
                    label: 'Disponible',
                    value: formatCurrency(resumen?.total_disponible || 0),
                    percentage: disponibilidad,
                    colorClassName: 'text-emerald-500',
                  },
                ]}
              />

              <OperationalBanner
                className="group"
                tone="dark"
                badge={
                  <SectionBadge className="border-white/10 bg-white/10 text-[9px] text-primary">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    Proyeccion Semanal
                  </SectionBadge>
                }
                title={formatCurrency(pendienteTotal)}
                description={
                  <>
                    Tienes{' '}
                    <span className="rounded bg-white/10 px-1.5 py-0.5 text-white">
                      {pagos.filter((pago) => pago.estado === 'PENDIENTE').length} egresos
                    </span>{' '}
                    por autorizar en la siguiente ventana operativa.
                  </>
                }
                actions={
                  <div className="w-full min-w-[220px] space-y-4 md:w-auto">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>Impacto en Caja</span>
                      <span className="text-primary">65%</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full border border-white/5 bg-white/10 p-0.5">
                      <div className="h-full w-[65%] rounded-full bg-gradient-to-r from-primary to-indigo-500" />
                    </div>
                  </div>
                }
              />

              <Card className="relative overflow-hidden rounded-3xl border-border/40 p-8 shadow-sm">
                <div className="absolute right-0 top-0 h-1 w-full bg-amber-500/20" />
                <div className="space-y-6">
                  <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-800">
                    <IconAlertCircle className="h-4 w-4 text-amber-500" />
                    Inteligencia Financiera
                  </h4>
                  <div className="space-y-4">
                    <div className="flex gap-4 rounded-2xl border border-amber-100/50 bg-amber-50 p-4 transition-all hover:translate-x-1">
                      <div className="mt-2 h-2 w-2 shrink-0 animate-pulse rounded-full bg-amber-500" />
                      <p className="text-[11px] font-bold uppercase tracking-tighter leading-tight text-amber-900">
                        El presupuesto de{' '}
                        <span className="rounded border border-amber-200 bg-white px-1 py-0.5">
                          MATERIALES
                        </span>{' '}
                        alcanzo el punto critico del 85%.
                      </p>
                    </div>
                    <div className="flex gap-4 rounded-2xl border border-green-100/50 bg-green-50 p-4 transition-all hover:translate-x-1">
                      <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                      <p className="text-[11px] font-bold uppercase tracking-tighter leading-tight text-green-900">
                        Recuperacion de{' '}
                        <span className="rounded border border-green-200 bg-white px-1.5 py-0.5 text-green-600">
                          $3,712.58
                        </span>{' '}
                        via cancelacion de OC exitosa.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full rounded-2xl bg-muted/50 py-4 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-muted"
                  >
                    Ver Bitacora Completa
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
