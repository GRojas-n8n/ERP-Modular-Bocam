import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { useTenant } from '../context/TenantContext';
import { Card, CardContent, SectionBadge, cn } from '@bocam/ui-core';
import { IconAlertCircle, IconClipboardCheck } from '../components/Icons';
import { HelpButton } from '../components/HelpButton';
import { HelpPanel } from '../components/HelpPanel';
import { EquipoTab } from './residencia/EquipoTab';
import { AsistenciaTab } from './residencia/AsistenciaTab';
import { NominaTab } from './residencia/NominaTab';
import { EstimacionesTab } from './residencia/EstimacionesTab';
import { RequisicionesTab } from './residencia/RequisicionesTab';

/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Vista: Residencia de Obra — Estimaciones · Nómina · Asistencia QR
 * ---------------------------------------------------------------------------
 *
 * Orquestador delgado: mantiene el layout compartido (header, KPI de
 * dashboard, HelpPanel) y selecciona qué tab renderizar. Cada tab vive en su
 * propio archivo bajo ./residencia/ — ver openspec/changes/
 * split-residencia-view-tabs.
 */

type TabId = 'estimaciones' | 'nomina' | 'equipo' | 'asistencia' | 'requisiciones';

export const ResidenciaView: React.FC<{ activeSubView?: string }> = ({ activeSubView }) => {
  const { tenant } = useTenant();
  const isDemo = tenant?.id === 'iretum-demo';

  const activeTab: TabId = (activeSubView as TabId) || 'estimaciones';
  const [loading, setLoading] = useState(true);
  const [helpOpen, setHelpOpen] = useState(false);

  const [dashData, setDashData] = useState<{
    mis_requisiciones: number;
    estimaciones_pendientes: number;
    ocs_por_recibir: Array<{ id: string; folio: string; proveedor: string; monto: number; estado: string }>;
    alertas: Array<{ tipo: string; mensaje: string; severidad: string }>;
    parcial: boolean;
  } | null>(null);

  // ── Carga inicial ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (isDemo) {
      setLoading(false);
      return;
    }
    api.get('/api/v1/control-proyectos/dashboard/residente')
      .then(r => { if ((r.data as any)?.data) setDashData((r.data as any).data); })
      .catch(() => { /* silencioso */ })
      .finally(() => setLoading(false));
  }, [isDemo]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="animate-pulse text-xs font-black uppercase tracking-widest text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* ── Encabezado ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <IconClipboardCheck className="h-5 w-5 text-indigo-500" />
          <h1 className="text-lg font-bold uppercase tracking-widest text-foreground">Residencia de Obra</h1>
          {isDemo && <SectionBadge className="bg-indigo-500/10 text-indigo-600">DEMO</SectionBadge>}
          <HelpButton onClick={() => setHelpOpen(true)} />
        </div>
        <p className="text-xs text-muted-foreground">Estimaciones · Aprobación de nómina · Control de asistencia QR</p>
      </div>

      {/* ── Dashboard Residente ─────────────────────────────────────────── */}
      {dashData && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="pt-4 pb-3 px-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Mis Requisiciones</p>
                <p className="mt-1 text-xl font-black text-foreground">{dashData.mis_requisiciones}</p>
                <p className="text-[10px] text-muted-foreground">enviadas</p>
              </CardContent>
            </Card>
            <Card className={dashData.estimaciones_pendientes > 0 ? 'border-amber-500/20 bg-amber-500/5' : ''}>
              <CardContent className="pt-4 pb-3 px-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Est. Pendientes</p>
                <p className={cn('mt-1 text-xl font-black', dashData.estimaciones_pendientes > 0 ? 'text-amber-700' : 'text-foreground')}>
                  {dashData.estimaciones_pendientes}
                </p>
                <p className="text-[10px] text-muted-foreground">por revisión</p>
              </CardContent>
            </Card>
            <Card className={dashData.ocs_por_recibir.length > 0 ? 'border-sky-500/20 bg-sky-500/5' : ''}>
              <CardContent className="pt-4 pb-3 px-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">OCs por Recibir</p>
                <p className={cn('mt-1 text-xl font-black', dashData.ocs_por_recibir.length > 0 ? 'text-sky-700' : 'text-foreground')}>
                  {dashData.ocs_por_recibir.length}
                </p>
                <p className="text-[10px] text-muted-foreground">{dashData.parcial ? '— datos parciales' : 'emitidas o parciales'}</p>
              </CardContent>
            </Card>
          </div>

          {dashData.ocs_por_recibir.length > 0 && (
            <div className="rounded-2xl border border-border/40 bg-card">
              <div className="px-4 py-3 border-b border-border/30">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">OCs Pendientes de Recibir</p>
              </div>
              {dashData.ocs_por_recibir.map((oc) => (
                <div key={oc.id} className="flex items-center justify-between gap-4 px-4 py-2.5 border-b border-border/20 last:border-0">
                  <div>
                    <p className="text-xs font-bold text-foreground">{oc.folio}</p>
                    <p className="text-[10px] text-muted-foreground">{oc.proveedor}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-foreground">{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(oc.monto)}</p>
                    <p className="text-[10px] text-sky-600 font-medium">{oc.estado}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

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

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* TAB: ESTIMACIONES                                               */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <EstimacionesTab active={activeTab === 'estimaciones'} />

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* TAB: NÓMINA                                                     */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <NominaTab active={activeTab === 'nomina'} />

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* TAB: MI EQUIPO                                                  */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <EquipoTab active={activeTab === 'equipo'} />

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* TAB: ASISTENCIA                                                 */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <AsistenciaTab active={activeTab === 'asistencia'} />

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* TAB: REQUISICIONES                                               */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <RequisicionesTab active={activeTab === 'requisiciones'} />

      <HelpPanel viewId="residencia" activeSubView={activeSubView} isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
};
