// -----------------------------------------------------------------------------
// Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
// Módulo: Calidad — Control de Documentos ISO 9001:2015
// -----------------------------------------------------------------------------

import React, { useEffect, useState, useCallback } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle,
  Button, EmptyStatePanel, cn,
} from '@bocam/ui-core';
import {
  IconFileText, IconShieldCheck, IconCheckCircle2, IconClock,
  IconAlertCircle, IconPlus, IconSearch, IconDownload, IconX,
} from '../components/Icons';
import { SlidePanel, SubmitButton } from '../components/SlidePanel';
import { useTenant } from '../context/TenantContext';
import { useNotification } from '../context/NotificationContext';
import api from '../lib/api';

// ── Tipos ────────────────────────────────────────────────────────────────────
const TIPOS = ['PLANO', 'PROCEDIMIENTO', 'INSTRUCTIVO', 'ESPECIFICACION', 'MANUAL', 'REGISTRO', 'OTRO'] as const;
type TipoDoc = typeof TIPOS[number];
const ESTADOS = ['BORRADOR', 'EN_REVISION', 'VIGENTE', 'OBSOLETO'] as const;
type EstadoDoc = typeof ESTADOS[number];

interface Documento {
  id_documento: string;
  codigo: string;
  titulo: string;
  tipo: TipoDoc;
  descripcion: string | null;
  responsable_id: string;
  estado_actual: EstadoDoc;
  version_actual: string | null;
  proyecto_id: string | null;
  created_at: string;
  _count?: { versiones: number };
}

interface VersionDoc {
  id_version: string;
  numero_version: string;
  estado: EstadoDoc;
  cambios: string | null;
  archivo_nombre: string | null;
  archivo_tamano: number | null;
  archivo_mime: string | null;
  archivo_ruta: string | null;
  creado_por: string;
  revisado_por: string | null;
  aprobado_por: string | null;
  fecha_emision: string | null;
  fecha_obsoleto: string | null;
  created_at: string;
}

interface DocumentoDetalle extends Documento {
  versiones: VersionDoc[];
}

interface DashboardData {
  documentos_por_estado: Record<EstadoDoc, number>;
  total_documentos: number;
  documentos_por_tipo: Record<TipoDoc, number>;
  versiones_pendientes_revision: number;
  versiones_en_borrador_sin_archivo: number;
}

// ── Estilos por estado/tipo ───────────────────────────────────────────────────
const ESTADO_STYLE: Record<EstadoDoc, { badge: string; label: string }> = {
  BORRADOR:    { badge: 'border-slate-200 bg-slate-100 text-slate-600',        label: 'Borrador' },
  EN_REVISION: { badge: 'border-amber-500/20 bg-amber-500/10 text-amber-700',  label: 'En Revisión' },
  VIGENTE:     { badge: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700', label: 'Vigente' },
  OBSOLETO:    { badge: 'border-slate-300 bg-slate-200 text-slate-500',        label: 'Obsoleto' },
};

const TIPO_STYLE: Record<TipoDoc, { badge: string }> = {
  PLANO:          { badge: 'border-blue-500/20 bg-blue-500/10 text-blue-700' },
  PROCEDIMIENTO:  { badge: 'border-violet-500/20 bg-violet-500/10 text-violet-700' },
  INSTRUCTIVO:    { badge: 'border-sky-500/20 bg-sky-500/10 text-sky-700' },
  ESPECIFICACION: { badge: 'border-teal-500/20 bg-teal-500/10 text-teal-700' },
  MANUAL:         { badge: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-700' },
  REGISTRO:       { badge: 'border-orange-500/20 bg-orange-500/10 text-orange-700' },
  OTRO:           { badge: 'border-slate-200 bg-slate-100 text-slate-600' },
};

const SectionBadgeLocal: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest', className)}>
    {children}
  </span>
);

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const CALIDAD_URL = '/api/v1/calidad';

// ── Componente principal ──────────────────────────────────────────────────────
export const CalidadView: React.FC<{ activeSubView?: string }> = ({ activeSubView: _activeSubView }) => {
  const { tenant, user } = useTenant();
  const { notify } = useNotification();
  const isDemo = tenant?.id === 'iretum-demo';
  const roles: string[] = user?.role ?? [];
  const canEdit = roles.some(r => ['calidad', 'admin'].includes(r));

  // ── State: dashboard ──
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  // ── State: lista ──
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [busqueda, setBusqueda] = useState('');

  // ── State: detalle ──
  const [docDetalle, setDocDetalle] = useState<DocumentoDetalle | null>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  // ── State: nuevo documento ──
  const [showNuevoDoc, setShowNuevoDoc] = useState(false);
  const [savingDoc, setSavingDoc] = useState(false);
  const [formDoc, setFormDoc] = useState({ codigo: '', titulo: '', tipo: 'PROCEDIMIENTO' as TipoDoc, descripcion: '', responsable_id: '' });

  // ── State: nueva versión ──
  const [showNuevaVersion, setShowNuevaVersion] = useState(false);
  const [savingVersion, setSavingVersion] = useState(false);
  const [formVersion, setFormVersion] = useState({ numero_version: '', cambios: '' });
  const [archivoVersion, setArchivoVersion] = useState<File | null>(null);

  // ── State: confirmación obsoleto ──
  const [confirmObsoleto, setConfirmObsoleto] = useState<{ docId: string; vidId: string } | null>(null);

  // ── State: acciones en versiones ──
  const [accionLoading, setAccionLoading] = useState<string | null>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchDashboard = useCallback(async () => {
    if (isDemo) return;
    try {
      const r = await api.get(`${CALIDAD_URL}/dashboard`);
      setDashboard((r.data as { data: DashboardData }).data);
    } catch (_) { /* silencioso */ }
  }, [isDemo]);

  const fetchDocumentos = useCallback(async () => {
    if (isDemo) { setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      const params: Record<string, string> = {};
      if (filtroTipo)   params.tipo   = filtroTipo;
      if (filtroEstado) params.estado = filtroEstado;
      if (busqueda)     params.q      = busqueda;
      const r = await api.get(`${CALIDAD_URL}/documentos`, { params });
      setDocumentos((r.data as { data: Documento[] }).data);
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Error al cargar documentos');
    } finally { setLoading(false); }
  }, [isDemo, filtroTipo, filtroEstado, busqueda]);

  useEffect(() => { void fetchDashboard(); }, [fetchDashboard]);
  useEffect(() => { void fetchDocumentos(); }, [fetchDocumentos]);

  const fetchDetalle = async (id: string) => {
    setLoadingDetalle(true);
    try {
      const r = await api.get(`${CALIDAD_URL}/documentos/${id}`);
      setDocDetalle((r.data as { data: DocumentoDetalle }).data);
    } catch (e: any) {
      notify('error', e.response?.data?.message ?? 'Error al cargar detalle');
    } finally { setLoadingDetalle(false); }
  };

  // ── Crear documento ───────────────────────────────────────────────────────
  const handleCrearDocumento = async () => {
    if (!formDoc.codigo || !formDoc.titulo || !formDoc.responsable_id) {
      return notify('error', 'Código, título y responsable son obligatorios');
    }
    setSavingDoc(true);
    try {
      await api.post(`${CALIDAD_URL}/documentos`, { ...formDoc, responsable_id: user?.id ?? formDoc.responsable_id });
      notify('success', `Documento ${formDoc.codigo} creado`);
      setShowNuevoDoc(false);
      setFormDoc({ codigo: '', titulo: '', tipo: 'PROCEDIMIENTO', descripcion: '', responsable_id: '' });
      await fetchDocumentos();
      await fetchDashboard();
    } catch (e: any) {
      notify('error', e.response?.data?.message ?? 'Error al crear documento');
    } finally { setSavingDoc(false); }
  };

  // ── Crear versión ─────────────────────────────────────────────────────────
  const handleCrearVersion = async () => {
    if (!docDetalle) return;
    if (!formVersion.numero_version || !formVersion.cambios) {
      return notify('error', 'Número de versión y cambios son obligatorios');
    }
    setSavingVersion(true);
    try {
      const fd = new FormData();
      fd.append('numero_version', formVersion.numero_version);
      fd.append('cambios', formVersion.cambios);
      if (archivoVersion) fd.append('archivo', archivoVersion);
      await api.post(`${CALIDAD_URL}/documentos/${docDetalle.id_documento}/versiones`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      notify('success', `Versión ${formVersion.numero_version} creada`);
      setShowNuevaVersion(false);
      setFormVersion({ numero_version: '', cambios: '' });
      setArchivoVersion(null);
      await fetchDetalle(docDetalle.id_documento);
      await fetchDocumentos();
      await fetchDashboard();
    } catch (e: any) {
      notify('error', e.response?.data?.message ?? 'Error al crear versión');
    } finally { setSavingVersion(false); }
  };

  // ── Acción sobre versión ──────────────────────────────────────────────────
  const handleAccionVersion = async (docId: string, vidId: string, accion: string) => {
    setAccionLoading(vidId + accion);
    try {
      await api.patch(`${CALIDAD_URL}/documentos/${docId}/versiones/${vidId}/estado`, { accion });
      notify('success', `Versión actualizada`);
      await fetchDetalle(docId);
      await fetchDocumentos();
      await fetchDashboard();
    } catch (e: any) {
      notify('error', e.response?.data?.message ?? 'Error al actualizar versión');
    } finally { setAccionLoading(null); }
  };

  // ── Descargar archivo ─────────────────────────────────────────────────────
  const handleDescargar = async (docId: string, vidId: string, nombre: string) => {
    try {
      const r = await api.get(`${CALIDAD_URL}/documentos/${docId}/versiones/${vidId}/archivo`, { responseType: 'blob' });
      const url = URL.createObjectURL(r.data as Blob);
      const a   = document.createElement('a');
      a.href     = url;
      a.download = nombre;
      a.click();
      URL.revokeObjectURL(url);
    } catch (_) {
      notify('error', 'No se pudo descargar el archivo');
    }
  };

  // ── KPI Cards ─────────────────────────────────────────────────────────────
  const kpis = [
    { label: 'Total Documentos', value: dashboard?.total_documentos ?? 0,                          color: 'text-sky-600',     bg: 'bg-sky-500/10',     icon: IconFileText },
    { label: 'Vigentes',         value: dashboard?.documentos_por_estado.VIGENTE ?? 0,              color: 'text-emerald-600', bg: 'bg-emerald-500/10', icon: IconCheckCircle2 },
    { label: 'En Revisión',      value: dashboard?.documentos_por_estado.EN_REVISION ?? 0,          color: 'text-amber-600',   bg: 'bg-amber-500/10',   icon: IconClock },
    { label: 'Borradores',       value: (dashboard?.documentos_por_estado.BORRADOR ?? 0),           color: 'text-slate-600',   bg: 'bg-slate-100',      icon: IconFileText },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="animate-in space-y-8 fade-in duration-700">

      {/* Header */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="space-y-3">
          <SectionBadgeLocal className="border-teal-500/20 bg-teal-500/10 text-teal-700">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
            ISO 9001:2015 — SGC
          </SectionBadgeLocal>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-teal-500/10 bg-teal-500/10 shadow-inner">
              <IconShieldCheck className="h-8 w-8 text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-foreground">
                Gestión de Calidad
              </h1>
              <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Control de documentos · Versiones · SGC
              </p>
            </div>
          </div>
        </div>

        {canEdit && (
          <Button
            onClick={() => setShowNuevoDoc(true)}
            className="rounded-2xl bg-teal-600 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-teal-600/20 hover:bg-teal-500"
          >
            <IconPlus className="h-4 w-4" />
            Nuevo Documento
          </Button>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map(k => (
          <Card key={k.label} className="rounded-2xl border-border/30 p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <CardContent className="p-0">
              <div className={cn('mb-3 flex h-10 w-10 items-center justify-center rounded-xl', k.bg)}>
                <k.icon className={cn('h-5 w-5', k.color)} />
              </div>
              <div className={cn('mb-0.5 text-2xl font-black tracking-tighter', k.color)}>{k.value}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{k.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pendientes de acción */}
      {dashboard && (dashboard.versiones_pendientes_revision > 0 || dashboard.versiones_en_borrador_sin_archivo > 0) && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-5 py-4">
          <div className="flex items-center gap-3">
            <IconAlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
            <div className="flex flex-wrap gap-4 text-xs font-semibold text-amber-700">
              {dashboard.versiones_pendientes_revision > 0 && (
                <span>{dashboard.versiones_pendientes_revision} versión(es) pendientes de aprobación</span>
              )}
              {dashboard.versiones_en_borrador_sin_archivo > 0 && (
                <span>{dashboard.versiones_en_borrador_sin_archivo} borrador(es) sin archivo adjunto</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por código o título..."
            className="w-full rounded-xl border border-border/40 bg-card pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30"
          />
        </div>
        <select
          value={filtroTipo}
          onChange={e => setFiltroTipo(e.target.value)}
          className="rounded-xl border border-border/40 bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30"
        >
          <option value="">Todos los tipos</option>
          {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value)}
          className="rounded-xl border border-border/40 bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30"
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map(e => <option key={e} value={e}>{ESTADO_STYLE[e].label}</option>)}
        </select>
      </div>

      {/* Lista de documentos */}
      {loading ? (
        <Card className="border-border/40">
          <CardContent className="flex h-64 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-500/10 border-t-teal-600" />
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-12 text-center">
            <IconAlertCircle className="mx-auto h-10 w-10 text-destructive" />
            <p className="mt-3 text-sm font-bold text-destructive">{error}</p>
          </CardContent>
        </Card>
      ) : documentos.length === 0 ? (
        <EmptyStatePanel
          icon={IconFileText}
          title="Sin documentos registrados"
          description="Crea el primer documento del SGC para comenzar el control de versiones."
          action={canEdit ? <Button onClick={() => setShowNuevoDoc(true)} className="bg-teal-600 text-white hover:bg-teal-500"><IconPlus className="h-4 w-4" />Nuevo Documento</Button> : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {documentos.map(doc => (
            <Card
              key={doc.id_documento}
              className="group cursor-pointer border-border/40 transition-all hover:-translate-y-0.5 hover:shadow-xl"
              onClick={() => fetchDetalle(doc.id_documento)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <span className={cn('rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase', TIPO_STYLE[doc.tipo]?.badge ?? TIPO_STYLE.OTRO.badge)}>
                    {doc.tipo}
                  </span>
                  <span className={cn('rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase', ESTADO_STYLE[doc.estado_actual]?.badge ?? ESTADO_STYLE.BORRADOR.badge)}>
                    {ESTADO_STYLE[doc.estado_actual]?.label}
                  </span>
                </div>
                <CardTitle className="mt-2 text-sm font-black uppercase tracking-tight">{doc.codigo}</CardTitle>
                <p className="text-xs text-muted-foreground line-clamp-2">{doc.titulo}</p>
              </CardHeader>
              <CardContent className="border-t border-border/30 pt-3">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{doc.version_actual ? `v${doc.version_actual}` : 'Sin versión'}</span>
                  <span>{doc._count?.versiones ?? 0} versión(es)</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── SlidePanel: Nuevo Documento ── */}
      <SlidePanel
        isOpen={showNuevoDoc}
        onClose={() => setShowNuevoDoc(false)}
        title="Nuevo Documento SGC"
        subtitle="Registra un documento en el sistema de gestión de calidad"
        accentColor="emerald"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Código *</label>
            <input
              value={formDoc.codigo}
              onChange={e => setFormDoc(p => ({ ...p, codigo: e.target.value.toUpperCase() }))}
              placeholder="PRO-2026-001"
              className="w-full rounded-xl border border-border/40 bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Título *</label>
            <input
              value={formDoc.titulo}
              onChange={e => setFormDoc(p => ({ ...p, titulo: e.target.value }))}
              placeholder="Procedimiento de Control de Materiales"
              className="w-full rounded-xl border border-border/40 bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Tipo *</label>
            <select
              value={formDoc.tipo}
              onChange={e => setFormDoc(p => ({ ...p, tipo: e.target.value as TipoDoc }))}
              className="w-full rounded-xl border border-border/40 bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Descripción</label>
            <textarea
              value={formDoc.descripcion}
              onChange={e => setFormDoc(p => ({ ...p, descripcion: e.target.value }))}
              rows={3}
              placeholder="Descripción breve del documento..."
              className="w-full rounded-xl border border-border/40 bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none"
            />
          </div>
          <SubmitButton label="Crear Documento" loading={savingDoc} color="emerald" onClick={handleCrearDocumento} />
        </div>
      </SlidePanel>

      {/* ── SlidePanel: Detalle del documento ── */}
      <SlidePanel
        isOpen={!!docDetalle}
        onClose={() => setDocDetalle(null)}
        title={docDetalle?.titulo ?? ''}
        subtitle={docDetalle ? `${docDetalle.codigo} · ${docDetalle.tipo}` : ''}
        accentColor="sky"
      >
        {loadingDetalle ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500/10 border-t-teal-600" />
          </div>
        ) : docDetalle ? (
          <div className="space-y-5">
            {/* Estado actual */}
            <div className="flex items-center gap-3">
              <span className={cn('rounded-full border px-3 py-1 text-[10px] font-black uppercase', ESTADO_STYLE[docDetalle.estado_actual]?.badge)}>
                {ESTADO_STYLE[docDetalle.estado_actual]?.label}
              </span>
              {docDetalle.version_actual && (
                <span className="rounded-full bg-teal-500/10 px-3 py-1 text-[10px] font-black text-teal-700">
                  v{docDetalle.version_actual} vigente
                </span>
              )}
            </div>

            {/* Descripción */}
            {docDetalle.descripcion && (
              <p className="text-sm text-muted-foreground">{docDetalle.descripcion}</p>
            )}

            {/* Botón nueva versión */}
            {canEdit && (
              <Button
                onClick={() => setShowNuevaVersion(true)}
                className="w-full rounded-xl bg-violet-600 text-xs font-black uppercase tracking-widest text-white hover:bg-violet-500"
              >
                <IconPlus className="h-4 w-4" />
                Nueva Versión
              </Button>
            )}

            {/* Historial de versiones */}
            <div>
              <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Historial de versiones ({docDetalle.versiones.length})
              </p>
              <div className="space-y-3">
                {docDetalle.versiones.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">Sin versiones. Crea la primera versión.</p>
                ) : docDetalle.versiones.map(v => (
                  <div key={v.id_version} className="rounded-xl border border-border/40 bg-muted/30 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-foreground">v{v.numero_version}</span>
                        <span className={cn('rounded-full border px-2 py-0.5 text-[9px] font-black uppercase', ESTADO_STYLE[v.estado]?.badge ?? ESTADO_STYLE.BORRADOR.badge)}>
                          {ESTADO_STYLE[v.estado]?.label}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(v.created_at).toLocaleDateString('es-MX')}
                      </span>
                    </div>

                    {v.cambios && <p className="text-xs text-muted-foreground">{v.cambios}</p>}

                    {/* Archivo */}
                    {v.archivo_nombre && (
                      <div className="flex items-center justify-between gap-2 rounded-lg bg-background border border-border/30 px-3 py-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <IconFileText className="h-4 w-4 shrink-0 text-teal-600" />
                          <span className="text-xs font-medium truncate">{v.archivo_nombre}</span>
                          {v.archivo_tamano && <span className="text-[10px] text-muted-foreground shrink-0">{formatBytes(v.archivo_tamano)}</span>}
                        </div>
                        <button
                          onClick={() => handleDescargar(docDetalle.id_documento, v.id_version, v.archivo_nombre!)}
                          className="shrink-0 rounded-lg p-1.5 text-teal-600 hover:bg-teal-500/10 transition-colors"
                          title="Descargar"
                        >
                          <IconDownload className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {/* Acciones por estado */}
                    {canEdit && (
                      <div className="flex flex-wrap gap-2">
                        {v.estado === 'BORRADOR' && v.archivo_ruta && (
                          <button
                            onClick={() => handleAccionVersion(docDetalle.id_documento, v.id_version, 'enviar_revision')}
                            disabled={accionLoading === v.id_version + 'enviar_revision'}
                            className="rounded-lg bg-amber-500 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-amber-400 disabled:opacity-50"
                          >
                            Enviar a Revisión
                          </button>
                        )}
                        {v.estado === 'EN_REVISION' && (
                          <>
                            <button
                              onClick={() => handleAccionVersion(docDetalle.id_documento, v.id_version, 'aprobar')}
                              disabled={accionLoading === v.id_version + 'aprobar'}
                              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-emerald-500 disabled:opacity-50"
                            >
                              Aprobar
                            </button>
                            <button
                              onClick={() => handleAccionVersion(docDetalle.id_documento, v.id_version, 'rechazar')}
                              disabled={accionLoading === v.id_version + 'rechazar'}
                              className="rounded-lg bg-red-600 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-red-500 disabled:opacity-50"
                            >
                              Rechazar
                            </button>
                          </>
                        )}
                        {v.estado === 'VIGENTE' && (
                          <button
                            onClick={() => setConfirmObsoleto({ docId: docDetalle.id_documento, vidId: v.id_version })}
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100"
                          >
                            Marcar Obsoleto
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </SlidePanel>

      {/* ── SlidePanel: Nueva Versión ── */}
      <SlidePanel
        isOpen={showNuevaVersion}
        onClose={() => { setShowNuevaVersion(false); setArchivoVersion(null); }}
        title="Nueva Versión"
        subtitle={docDetalle ? `Documento ${docDetalle.codigo}` : ''}
        accentColor="violet"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Número de Versión *</label>
            <input
              value={formVersion.numero_version}
              onChange={e => setFormVersion(p => ({ ...p, numero_version: e.target.value }))}
              placeholder="1.0"
              className="w-full rounded-xl border border-border/40 bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Descripción de Cambios *</label>
            <textarea
              value={formVersion.cambios}
              onChange={e => setFormVersion(p => ({ ...p, cambios: e.target.value }))}
              rows={3}
              placeholder="Describe los cambios realizados en esta versión..."
              className="w-full rounded-xl border border-border/40 bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 resize-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Archivo (PDF, DWG, DOCX, XLSX…)</label>
            <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 px-4 py-5 text-center">
              {archivoVersion ? (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <IconFileText className="h-4 w-4 shrink-0 text-violet-600" />
                    <span className="text-xs font-medium truncate">{archivoVersion.name}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">{formatBytes(archivoVersion.size)}</span>
                  </div>
                  <button onClick={() => setArchivoVersion(null)} className="shrink-0 text-muted-foreground hover:text-destructive">
                    <IconX className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <span className="text-xs text-muted-foreground">Arrastra o <span className="text-violet-600 font-semibold">selecciona</span> un archivo (máx. 50 MB)</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.dwg,.dxf,.docx,.xlsx,.png,.jpg,.jpeg"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      if (f.size > 50 * 1024 * 1024) { notify('error', 'El archivo supera 50 MB'); return; }
                      setArchivoVersion(f);
                    }}
                  />
                </label>
              )}
            </div>
          </div>
          <SubmitButton label="Crear Versión" loading={savingVersion} color="violet" onClick={handleCrearVersion} />
        </div>
      </SlidePanel>

      {/* ── Modal: Confirmar Obsoleto ── */}
      {confirmObsoleto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 max-w-sm rounded-2xl border border-border/40 bg-card p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-black uppercase tracking-tight">Confirmar obsolescencia</h3>
            <p className="text-xs text-muted-foreground">
              ¿Confirmas marcar esta versión como obsoleta? El documento quedará sin versión vigente hasta que apruebes una nueva.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setConfirmObsoleto(null)}
              >
                Cancelar
              </Button>
              <button
                onClick={async () => {
                  const { docId, vidId } = confirmObsoleto;
                  setConfirmObsoleto(null);
                  await handleAccionVersion(docId, vidId, 'obsoleto');
                }}
                className="flex-1 rounded-xl bg-slate-700 px-4 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-slate-600"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
