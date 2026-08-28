import React, { useState, useEffect, useCallback } from 'react';
import api, { ventasApi } from '../lib/api';
import { useTenant } from '../context/TenantContext';
import { useNotification } from '../context/NotificationContext';
import { ConfirmCriticalActionDialog, cn, getProjectColor } from '@bocam/ui-core';
import { ROLES_ASIGNABLES, etiquetaDeRol } from '@bocam/roles';
import { HelpButton } from '../components/HelpButton';
import { HelpPanel } from '../components/HelpPanel';

// ─── Types ────────────────────────────────────────────────────────────────────
interface AdminUser {
  id: string; email: string; nombre: string;
  roles: string[]; activo: boolean; limite_aprobacion: number;
  proyectos: { id: string; nombre: string; codigo: string }[];
  created_at: string;
}
interface Proyecto {
  id_proyecto: string; codigo_centro_costos: string; nombre_oficial: string;
  tipo_contrato: string; moneda_base: string; estatus: string; activo: boolean;
  empresa_grupo?: string | null; anio_centro_costos?: number | null; cliente_id?: string | null;
  consecutivo_centro_costos?: number | null; es_especial?: boolean; tipo_especial?: string | null;
  fecha_inicio_real?: string | null; fecha_firma_contrato?: string | null;
  fecha_programada_inicio?: string | null; fecha_programada_fin?: string | null;
  monto_total_vendido?: number | null; periodo_ejecucion?: number | null; periodo_ejecucion_unidad?: string | null;
  total_dias_naturales?: number | null; total_dias_laborables?: number | null;
}
interface ClienteVentas { id_cliente: string; razon_social: string; codigo_cliente: string | null; }

// Ver openspec/changes/centro-costos-alta-formal
const EMPRESAS_GRUPO = [
  { value: 'CIB', label: 'CIB — Constructora e Inmobiliaria Bocam' },
  { value: 'HCO', label: 'HCO — Hubi Construcciones' },
  { value: 'HSE', label: 'HSE — Hubi Servicios Empresariales' },
  { value: 'SEO', label: 'SEO — Servicios Empresariales Obhu' },
];
const TIPOS_ESPECIALES = ['OFICINA', 'TALLER', 'ALMACÉN'];
const ESTATUS_CENTRO_COSTOS = ['ABIERTO', 'EN EJECUCIÓN', 'EN COBRO', 'TERMINADO', 'CERRADO'];

// ─── Role catalog ─────────────────────────────────────────────────────────────
// IMPORTANTE: Mantener sincronizado con CLAUDE.md §11 y Layout.tsx ALL_NAV_ITEMS.
// El catálogo vive en @bocam/roles, compartido con los servicios. Cuando estaba
// duplicado aquí le faltaban warehouse, control_proyectos y director — roles que
// el backend sí exige, así que no había forma de dar de alta un almacenista.
// Un test guardián en el paquete falla si vuelven a desincronizarse.
const rolLabel = etiquetaDeRol;

const RoleBadge: React.FC<{ role: string }> = ({ role }) => (
  <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-primary">
    {rolLabel(role)}
  </span>
);

// ─── User Modal ───────────────────────────────────────────────────────────────
interface UserModalProps {
  user?: AdminUser; proyectos: Proyecto[];
  onClose: () => void; onSaved: () => void;
}
const UserModal: React.FC<UserModalProps> = ({ user, proyectos, onClose, onSaved }) => {
  const isEdit = !!user;
  const { currentProjectId } = useTenant();
  // Ver openspec/changes/modal-confirmacion-antes-de-subir-archivos — alta
  // de Usuario confirma el proyecto activo antes de crear (patrón
  // confirmacion-proyecto-en-altas); editar un usuario existente no cambia.
  const nombreProyectoActivo = proyectos.find(p => p.id_proyecto === currentProjectId)?.nombre_oficial || 'Sin proyecto';
  const [confirmarAlta, setConfirmarAlta] = useState(false);
  const [form, setForm] = useState({
    nombre: user?.nombre ?? '', email: user?.email ?? '',
    password: '', roles: user?.roles ?? [],
    proyecto_ids: user?.proyectos.map(p => p.id) ?? [],
    limite_aprobacion: user?.limite_aprobacion ?? 0,
    activo: user?.activo ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleRole = (r: string) =>
    setForm(f => ({ ...f, roles: f.roles.includes(r) ? f.roles.filter(x => x !== r) : [...f.roles, r] }));
  const toggleProyecto = (id: string) =>
    setForm(f => ({ ...f, proyecto_ids: f.proyecto_ids.includes(id) ? f.proyecto_ids.filter(x => x !== id) : [...f.proyecto_ids, id] }));

  const handleSubmit = async () => {
    if (!form.nombre.trim() || !form.email.trim()) { setError('Nombre y email son obligatorios.'); return; }
    if (!isEdit && !form.password) { setError('La contraseña es obligatoria para nuevos usuarios.'); return; }
    if (form.roles.length === 0) { setError('Asigna al menos un rol.'); return; }
    if (!isEdit) { setConfirmarAlta(true); return; }
    await guardarUsuario();
  };

  const guardarUsuario = async () => {
    setSaving(true); setError(null);
    try {
      if (isEdit) {
        const body: Record<string, unknown> = {
          nombre: form.nombre,
          email: form.email,
          roles: form.roles,
          activo: form.activo,
          limite_aprobacion: form.limite_aprobacion,
          proyecto_ids: form.proyecto_ids,   // ← sincronizar asignaciones de proyectos
        };
        if (form.password) body.password = form.password;
        await api.patch(`/api/v1/auth/admin/users/${user!.id}`, body);
      } else {
        await api.post('/api/v1/auth/admin/users', { ...form });
      }
      onSaved(); onClose();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      setError(msg ?? 'Error al guardar.');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8">
      <div className="w-full max-w-lg rounded-2xl border border-border/40 bg-card shadow-2xl mx-4">
        <div className="border-b border-border/30 px-6 py-4">
          <h2 className="text-sm font-black uppercase tracking-widest">{isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
        </div>
        <div className="space-y-4 px-6 py-5 max-h-[70vh] overflow-y-auto">
          {error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-400">{error}</div>}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nombre *</label>
              <input className="w-full rounded-xl border border-border/40 bg-muted/50 px-3 py-2 text-sm focus:border-primary/50 focus:outline-none"
                maxLength={150} value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Juan Pérez" />
            </div>
            <div className="col-span-2">
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email *</label>
              <input type="email" className="w-full rounded-xl border border-border/40 bg-muted/50 px-3 py-2 text-sm focus:border-primary/50 focus:outline-none"
                maxLength={255} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="usuario@empresa.com" />
            </div>
            <div className="col-span-2">
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {isEdit ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}
              </label>
              <input type="password" className="w-full rounded-xl border border-border/40 bg-muted/50 px-3 py-2 text-sm focus:border-primary/50 focus:outline-none"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Límite Aprobación (MXN)</label>
              <input type="number" className="w-full rounded-xl border border-border/40 bg-muted/50 px-3 py-2 text-sm focus:border-primary/50 focus:outline-none"
                value={form.limite_aprobacion} onChange={e => setForm(f => ({ ...f, limite_aprobacion: Number(e.target.value) }))} />
            </div>
            {isEdit && <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.activo} onChange={e => setForm(f => ({ ...f, activo: e.target.checked }))}
                  className="h-4 w-4 rounded" />
                <span className="text-xs font-bold uppercase tracking-widest">Activo</span>
              </label>
            </div>}
          </div>

          {/* Roles */}
          <div>
            <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Roles de Acceso *</label>
            <div className="flex flex-wrap gap-2">
              {ROLES_ASIGNABLES.map(r => (
                <button key={r.id} onClick={() => toggleRole(r.id)} title={r.nota}
                  className={`rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border transition-colors ${
                    form.roles.includes(r.id)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border/40 text-muted-foreground hover:border-primary/40'
                  }`}>
                  {r.label}
                  {r.estado === 'sin-backend' && <span className="ml-1 text-amber-500" aria-hidden>•</span>}
                </button>
              ))}
            </div>
            {ROLES_ASIGNABLES.some(r => r.estado === 'sin-backend' && form.roles.includes(r.id)) && (
              <p className="mt-2 text-[10px] leading-relaxed text-amber-600">
                Los roles marcados con • todavía no abren su módulo: el usuario verá la
                sección en el menú y recibirá &laquo;acceso denegado&raquo; al usarla.
              </p>
            )}
          </div>

          {/* Proyectos */}
          {proyectos.length > 0 && (
            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Proyectos Asignados</label>
              <div className="space-y-1.5 max-h-32 overflow-y-auto rounded-xl border border-border/30 p-2">
                {proyectos.map(p => (
                  <label key={p.id_proyecto} className="flex items-center gap-2 cursor-pointer rounded-lg px-2 py-1 hover:bg-muted/50">
                    <input type="checkbox" checked={form.proyecto_ids.includes(p.id_proyecto)}
                      onChange={() => toggleProyecto(p.id_proyecto)} className="h-3.5 w-3.5 rounded" />
                    <span className="text-xs font-medium">{p.codigo_centro_costos}</span>
                    <span className="text-xs text-muted-foreground truncate">{p.nombre_oficial}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-3 border-t border-border/30 px-6 py-4">
          <button onClick={onClose} className="flex-1 rounded-xl border border-border/40 px-4 py-2 text-xs font-black uppercase tracking-widest hover:bg-muted/50">Cancelar</button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-emerald-700 disabled:opacity-50">
            {saving ? 'Guardando...' : isEdit ? 'Guardar' : 'Crear Usuario'}
          </button>
        </div>
      </div>

      <ConfirmCriticalActionDialog
        open={confirmarAlta}
        title="¿Crear este usuario?"
        projectName={nombreProyectoActivo}
        confirmLabel="Crear Usuario"
        confirmDisabled={saving}
        onConfirm={() => { setConfirmarAlta(false); void guardarUsuario(); }}
        onCancel={() => setConfirmarAlta(false)}
      />
    </div>
  );
};

// ─── Agregar Cliente (modal in-context, sin perder el progreso del formulario) ──
interface AgregarClienteModalProps { onClose: () => void; onCreated: (cliente: ClienteVentas) => void; }
const AgregarClienteModal: React.FC<AgregarClienteModalProps> = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ razon_social: '', rfc_tax_id: '', codigo_cliente: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!form.razon_social.trim() || !form.rfc_tax_id.trim()) { setError('Razón social y RFC son obligatorios.'); return; }
    setSaving(true); setError(null);
    try {
      const res = await ventasApi.createCliente({
        razon_social: form.razon_social.trim(),
        rfc_tax_id: form.rfc_tax_id.trim(),
        codigo_cliente: form.codigo_cliente.trim() || undefined,
      });
      onCreated(res.data.data as ClienteVentas);
      onClose();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Error al crear el cliente.');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-border/40 bg-card shadow-2xl mx-4">
        <div className="border-b border-border/30 px-6 py-4">
          <h2 className="text-sm font-black uppercase tracking-widest">+ Agregar Cliente</h2>
        </div>
        <div className="space-y-4 px-6 py-5">
          {error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-400">{error}</div>}
          <div>
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Razón Social *</label>
            <input className="w-full rounded-xl border border-border/40 bg-muted/50 px-3 py-2 text-sm focus:border-primary/50 focus:outline-none"
              value={form.razon_social} onChange={e => setForm(f => ({ ...f, razon_social: e.target.value }))} placeholder="Cliente S.A. de C.V." autoFocus />
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">RFC *</label>
            <input className="w-full rounded-xl border border-border/40 bg-muted/50 px-3 py-2 text-sm focus:border-primary/50 focus:outline-none"
              value={form.rfc_tax_id} onChange={e => setForm(f => ({ ...f, rfc_tax_id: e.target.value.toUpperCase() }))} placeholder="XAXX010101000" maxLength={20} />
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Código Cliente (000-050, opcional)</label>
            <input className="w-full rounded-xl border border-border/40 bg-muted/50 px-3 py-2 text-sm font-mono focus:border-primary/50 focus:outline-none"
              value={form.codigo_cliente} onChange={e => setForm(f => ({ ...f, codigo_cliente: e.target.value.replace(/\D/g, '').slice(0, 3) }))}
              placeholder="051" maxLength={3} />
          </div>
        </div>
        <div className="flex gap-3 border-t border-border/30 px-6 py-4">
          <button onClick={onClose} className="flex-1 rounded-xl border border-border/40 px-4 py-2 text-xs font-black uppercase tracking-widest hover:bg-muted/50">Cancelar</button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 rounded-xl bg-primary px-4 py-2 text-xs font-black uppercase tracking-widest text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {saving ? 'Guardando...' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Project Modal ────────────────────────────────────────────────────────────
interface ProyectoModalProps { proyecto?: Proyecto; onClose: () => void; onSaved: () => void; }
const ProyectoModal: React.FC<ProyectoModalProps> = ({ proyecto, onClose, onSaved }) => {
  const isEdit = !!proyecto;
  const anioActual = new Date().getFullYear();
  const [form, setForm] = useState({
    nombre_oficial: proyecto?.nombre_oficial ?? '',
    tipo_contrato: proyecto?.tipo_contrato ?? 'PRECIOS_UNITARIOS',
    moneda_base: proyecto?.moneda_base ?? 'MXN',
    estatus: proyecto?.estatus ?? 'ABIERTO',
    es_especial: proyecto?.es_especial ?? false,
    tipo_especial: proyecto?.tipo_especial ?? '',
    codigo_especial: proyecto?.es_especial ? (proyecto?.codigo_centro_costos ?? '') : '',
    empresa_grupo: proyecto?.empresa_grupo ?? '',
    anio_centro_costos: proyecto?.anio_centro_costos ?? anioActual,
    cliente_id: proyecto?.cliente_id ?? '',
    fecha_inicio_real: proyecto?.fecha_inicio_real?.slice(0, 10) ?? '',
    fecha_firma_contrato: proyecto?.fecha_firma_contrato?.slice(0, 10) ?? '',
    fecha_programada_inicio: proyecto?.fecha_programada_inicio?.slice(0, 10) ?? '',
    fecha_programada_fin: proyecto?.fecha_programada_fin?.slice(0, 10) ?? '',
    monto_total_vendido: proyecto?.monto_total_vendido != null ? String(proyecto.monto_total_vendido) : '',
    periodo_ejecucion: proyecto?.periodo_ejecucion != null ? String(proyecto.periodo_ejecucion) : '',
    periodo_ejecucion_unidad: proyecto?.periodo_ejecucion_unidad ?? 'MESES',
    total_dias_naturales: proyecto?.total_dias_naturales != null ? String(proyecto.total_dias_naturales) : '',
    total_dias_laborables: proyecto?.total_dias_laborables != null ? String(proyecto.total_dias_laborables) : '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientes, setClientes] = useState<ClienteVentas[]>([]);
  const [showAgregarCliente, setShowAgregarCliente] = useState(false);

  useEffect(() => {
    if (isEdit) return; // el cliente/empresa/año ya no son editables tras crear
    ventasApi.getClientes().then(res => setClientes((res.data.data ?? []) as ClienteVentas[])).catch(() => {});
  }, [isEdit]);

  const clienteSeleccionado = clientes.find(c => c.id_cliente === form.cliente_id);
  const codigoPreview = form.es_especial
    ? (form.codigo_especial || '—')
    : (form.empresa_grupo && form.anio_centro_costos && clienteSeleccionado?.codigo_cliente)
      ? `${form.empresa_grupo}${form.anio_centro_costos}${clienteSeleccionado.codigo_cliente.padStart(3, '0')}···`
      : '—';

  const fechasInvalidas = !!(form.fecha_programada_inicio && form.fecha_programada_fin
    && form.fecha_programada_fin < form.fecha_programada_inicio);

  const handleSubmit = async () => {
    if (!form.nombre_oficial.trim()) { setError('El nombre oficial es obligatorio.'); return; }
    if (fechasInvalidas) { setError('La fecha programada de fin no puede ser anterior a la de inicio.'); return; }
    if (!isEdit) {
      if (form.es_especial) {
        if (!form.tipo_especial || !form.codigo_especial.trim()) {
          setError('Tipo especial y código son obligatorios para un Centro de Costos especial.');
          return;
        }
      } else {
        if (!form.empresa_grupo || !form.anio_centro_costos || !form.cliente_id) {
          setError('Empresa, año y cliente son obligatorios.');
          return;
        }
        if (!clienteSeleccionado?.codigo_cliente) {
          setError('El cliente seleccionado no tiene código asignado — edítalo desde "+ Agregar Cliente" o el catálogo de Ventas.');
          return;
        }
      }
    }

    setSaving(true); setError(null);
    try {
      const body: Record<string, unknown> = {
        nombre_oficial: form.nombre_oficial.trim(),
        tipo_contrato: form.tipo_contrato,
        moneda_base: form.moneda_base,
        estatus: form.estatus,
        fecha_inicio_real: form.fecha_inicio_real || undefined,
        fecha_firma_contrato: form.fecha_firma_contrato || undefined,
        fecha_programada_inicio: form.fecha_programada_inicio || undefined,
        fecha_programada_fin: form.fecha_programada_fin || undefined,
        monto_total_vendido: form.monto_total_vendido ? Number(form.monto_total_vendido) : undefined,
        periodo_ejecucion: form.periodo_ejecucion ? Number(form.periodo_ejecucion) : undefined,
        periodo_ejecucion_unidad: form.periodo_ejecucion_unidad,
        total_dias_naturales: form.total_dias_naturales ? Number(form.total_dias_naturales) : undefined,
        total_dias_laborables: form.total_dias_laborables ? Number(form.total_dias_laborables) : undefined,
      };
      if (!isEdit) {
        if (form.es_especial) {
          body.es_especial = true;
          body.tipo_especial = form.tipo_especial;
          body.codigo_centro_costos = form.codigo_especial.trim();
        } else {
          body.empresa_grupo = form.empresa_grupo;
          body.anio_centro_costos = Number(form.anio_centro_costos);
          body.cliente_id = form.cliente_id;
          body.codigo_cliente = clienteSeleccionado!.codigo_cliente;
        }
      }
      if (isEdit) await api.patch(`/api/v1/auth/admin/proyectos/${proyecto!.id_proyecto}`, body);
      else await api.post('/api/v1/auth/admin/proyectos', body);
      onSaved(); onClose();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      setError(msg ?? 'Error al guardar.');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8">
      <div className="w-full max-w-lg rounded-2xl border border-border/40 bg-card shadow-2xl mx-4">
        <div className="border-b border-border/30 px-6 py-4">
          <h2 className="text-sm font-black uppercase tracking-widest">{isEdit ? 'Editar Centro de Costos' : 'Nuevo Centro de Costos'}</h2>
        </div>
        <div className="max-h-[70vh] overflow-y-auto space-y-4 px-6 py-5">
          {error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-400">{error}</div>}

          {isEdit ? (
            <div>
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Código Centro de Costos</label>
              <input disabled className="w-full rounded-xl border border-border/40 bg-muted/50 px-3 py-2 text-sm font-mono opacity-70" value={proyecto!.codigo_centro_costos} />
            </div>
          ) : (
            <>
              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={form.es_especial} onChange={e => setForm(f => ({ ...f, es_especial: e.target.checked }))} />
                Centro de Costos especial (gasto operativo interno)
              </label>

              {form.es_especial ? (
                <div className="space-y-3">
                  <div>
                    <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tipo Especial *</label>
                    <select className="w-full rounded-xl border border-border/40 bg-muted/50 px-3 py-2 text-sm focus:outline-none"
                      value={form.tipo_especial} onChange={e => setForm(f => ({ ...f, tipo_especial: e.target.value }))}>
                      <option value="">Selecciona...</option>
                      {TIPOS_ESPECIALES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Código (libre) *</label>
                    <input className="w-full rounded-xl border border-border/40 bg-muted/50 px-3 py-2 text-sm font-mono focus:border-primary/50 focus:outline-none"
                      value={form.codigo_especial} onChange={e => setForm(f => ({ ...f, codigo_especial: e.target.value.toUpperCase() }))} placeholder="OFICINA-CDMX" />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Empresa *</label>
                      <select className="w-full rounded-xl border border-border/40 bg-muted/50 px-3 py-2 text-sm focus:outline-none"
                        value={form.empresa_grupo} onChange={e => setForm(f => ({ ...f, empresa_grupo: e.target.value }))}>
                        <option value="">Selecciona...</option>
                        {EMPRESAS_GRUPO.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Año *</label>
                      <input type="number" className="w-full rounded-xl border border-border/40 bg-muted/50 px-3 py-2 text-sm focus:border-primary/50 focus:outline-none"
                        value={form.anio_centro_costos} onChange={e => setForm(f => ({ ...f, anio_centro_costos: Number(e.target.value) }))} />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cliente *</label>
                    <div className="flex gap-2">
                      <select className="flex-1 rounded-xl border border-border/40 bg-muted/50 px-3 py-2 text-sm focus:outline-none"
                        value={form.cliente_id} onChange={e => setForm(f => ({ ...f, cliente_id: e.target.value }))}>
                        <option value="">Selecciona...</option>
                        {clientes.map(c => (
                          <option key={c.id_cliente} value={c.id_cliente}>
                            {c.codigo_cliente ?? '···'} — {c.razon_social}
                          </option>
                        ))}
                      </select>
                      <button type="button" onClick={() => setShowAgregarCliente(true)}
                        className="shrink-0 rounded-xl border border-primary/40 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10">
                        + Agregar Cliente
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Código (vista previa)</label>
                    <div className="w-full rounded-xl border border-dashed border-border/40 bg-muted/30 px-3 py-2 text-sm font-mono tracking-widest">{codigoPreview}</div>
                    <p className="mt-1 text-[10px] text-muted-foreground">El consecutivo (últimos 3 dígitos) lo asigna el sistema al guardar.</p>
                  </div>
                </div>
              )}
            </>
          )}

          <div>
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nombre Oficial *</label>
            <input className="w-full rounded-xl border border-border/40 bg-muted/50 px-3 py-2 text-sm focus:border-primary/50 focus:outline-none"
              value={form.nombre_oficial} onChange={e => setForm(f => ({ ...f, nombre_oficial: e.target.value }))} placeholder="Proyecto Guadalajara 2026" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tipo Contrato</label>
              <select className="w-full rounded-xl border border-border/40 bg-muted/50 px-3 py-2 text-sm focus:outline-none"
                value={form.tipo_contrato} onChange={e => setForm(f => ({ ...f, tipo_contrato: e.target.value }))}>
                <option value="PRECIOS_UNITARIOS">Precios Unitarios</option>
                <option value="PRECIO_ALZADO">Precio Alzado</option>
                <option value="EPC">EPC</option>
                <option value="MIXTO">Mixto</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Moneda</label>
              <select className="w-full rounded-xl border border-border/40 bg-muted/50 px-3 py-2 text-sm focus:outline-none"
                value={form.moneda_base} onChange={e => setForm(f => ({ ...f, moneda_base: e.target.value }))}>
                <option value="MXN">MXN</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Estatus</label>
            <select className="w-full rounded-xl border border-border/40 bg-muted/50 px-3 py-2 text-sm focus:outline-none"
              value={form.estatus} onChange={e => setForm(f => ({ ...f, estatus: e.target.value }))}>
              {ESTATUS_CENTRO_COSTOS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="border-t border-border/30 pt-4">
            <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Línea base financiera y de plazos</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fecha Inicio Real</label>
                <input type="date" className="w-full rounded-xl border border-border/40 bg-muted/50 px-3 py-2 text-sm focus:outline-none"
                  value={form.fecha_inicio_real} onChange={e => setForm(f => ({ ...f, fecha_inicio_real: e.target.value }))} />
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fecha Firma Contrato</label>
                <input type="date" className="w-full rounded-xl border border-border/40 bg-muted/50 px-3 py-2 text-sm focus:outline-none"
                  value={form.fecha_firma_contrato} onChange={e => setForm(f => ({ ...f, fecha_firma_contrato: e.target.value }))} />
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fecha Programada Inicio</label>
                <input type="date" className="w-full rounded-xl border border-border/40 bg-muted/50 px-3 py-2 text-sm focus:outline-none"
                  value={form.fecha_programada_inicio} onChange={e => setForm(f => ({ ...f, fecha_programada_inicio: e.target.value }))} />
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fecha Programada Fin</label>
                <input type="date" className={cn('w-full rounded-xl border bg-muted/50 px-3 py-2 text-sm focus:outline-none', fechasInvalidas ? 'border-red-500/60' : 'border-border/40')}
                  value={form.fecha_programada_fin} onChange={e => setForm(f => ({ ...f, fecha_programada_fin: e.target.value }))} />
              </div>
            </div>
            {fechasInvalidas && <p className="mt-1 text-[10px] font-semibold text-red-400">La fecha de fin no puede ser anterior a la de inicio.</p>}
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Monto Total Vendido (sin IVA)</label>
                <input type="number" step="0.01" className="w-full rounded-xl border border-border/40 bg-muted/50 px-3 py-2 text-sm focus:outline-none"
                  value={form.monto_total_vendido} onChange={e => setForm(f => ({ ...f, monto_total_vendido: e.target.value }))} placeholder="0.00" />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Periodo Ejecución</label>
                  <input type="number" className="w-full rounded-xl border border-border/40 bg-muted/50 px-3 py-2 text-sm focus:outline-none"
                    value={form.periodo_ejecucion} onChange={e => setForm(f => ({ ...f, periodo_ejecucion: e.target.value }))} />
                </div>
                <div className="w-24">
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Unidad</label>
                  <select className="w-full rounded-xl border border-border/40 bg-muted/50 px-3 py-2 text-sm focus:outline-none"
                    value={form.periodo_ejecucion_unidad} onChange={e => setForm(f => ({ ...f, periodo_ejecucion_unidad: e.target.value }))}>
                    <option value="MESES">Meses</option>
                    <option value="SEMANAS">Semanas</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Días Naturales</label>
                <input type="number" className="w-full rounded-xl border border-border/40 bg-muted/50 px-3 py-2 text-sm focus:outline-none"
                  value={form.total_dias_naturales} onChange={e => setForm(f => ({ ...f, total_dias_naturales: e.target.value }))} />
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Días Laborables</label>
                <input type="number" className="w-full rounded-xl border border-border/40 bg-muted/50 px-3 py-2 text-sm focus:outline-none"
                  value={form.total_dias_laborables} onChange={e => setForm(f => ({ ...f, total_dias_laborables: e.target.value }))} />
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-3 border-t border-border/30 px-6 py-4">
          <button onClick={onClose} className="flex-1 rounded-xl border border-border/40 px-4 py-2 text-xs font-black uppercase tracking-widest hover:bg-muted/50">Cancelar</button>
          <button onClick={handleSubmit} disabled={saving || fechasInvalidas}
            className="flex-1 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-emerald-700 disabled:opacity-50">
            {saving ? 'Guardando...' : isEdit ? 'Guardar' : 'Crear Centro de Costos'}
          </button>
        </div>
      </div>

      {showAgregarCliente && (
        <AgregarClienteModal
          onClose={() => setShowAgregarCliente(false)}
          onCreated={(nuevo) => {
            setClientes(prev => [...prev, nuevo]);
            setForm(f => ({ ...f, cliente_id: nuevo.id_cliente }));
          }}
        />
      )}
    </div>
  );
};

// ─── AdminView ────────────────────────────────────────────────────────────────
interface CategoriaAdmin {
  id_categoria: string;
  nombre: string;
  es_predefinida: boolean;
  activa: boolean;
  insumos_count: number;
}

export const AdminView: React.FC<{ activeSubView?: string }> = ({ activeSubView }) => {
  const { refreshUser, currentProjectId, user } = useTenant();
  const { notify } = useNotification();
  const currentProjectName = user?.projects?.find(p => p.id === currentProjectId)?.name || 'proyecto activo';
  const currentProjectColor = getProjectColor(currentProjectId);
  const activeTab = (activeSubView as 'usuarios' | 'proyectos' | 'categorias') || 'usuarios';
  // Alta/edición de Proyectos: mismos roles que ROLES_ALTA_CENTRO_COSTOS en
  // apps/auth. control_obra puede ver esta pestaña (menú) pero no crear ni
  // editar. Ver openspec/changes/acceso-proyectos-gt-control-obra.
  const puedeEditarProyectos = (user?.role ?? []).some(r => ['admin', 'gerencia_tecnica', 'control_proyectos'].includes(r));
  const [helpOpen, setHelpOpen] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showProyectoModal, setShowProyectoModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | undefined>();
  const [editingProyecto, setEditingProyecto] = useState<Proyecto | undefined>();
  const [confirmArchivarUsuario, setConfirmArchivarUsuario] = useState<AdminUser | null>(null);
  const [confirmReactivarUsuario, setConfirmReactivarUsuario] = useState<AdminUser | null>(null);
  const [savingUserActivo, setSavingUserActivo] = useState(false);

  // ── Categorías de gasto ───────────────────────────────────────────────────
  const [categorias, setCategorias] = useState<CategoriaAdmin[]>([]);
  const [proyectoCostosEstado, setProyectoCostosEstado] = useState<'CONFIGURACION' | 'ACTIVO' | 'CERRADO' | null>(null);
  const [loadingCat, setLoadingCat] = useState(false);
  const [nuevaCatNombre, setNuevaCatNombre] = useState('');
  const [editCatId, setEditCatId] = useState<string | null>(null);
  const [editCatNombre, setEditCatNombre] = useState('');
  const [savingCat, setSavingCat] = useState(false);
  const [confirmActivar, setConfirmActivar] = useState(false);
  const [activandoProyecto, setActivandoProyecto] = useState(false);
  const [confirmEliminarCategoria, setConfirmEliminarCategoria] = useState<CategoriaAdmin | null>(null);
  const [confirmCrearCategoria, setConfirmCrearCategoria] = useState(false);

  const loadCategorias = useCallback(async () => {
    if (!currentProjectId) return;
    setLoadingCat(true);
    try {
      const res = await api.get(`/api/v1/gerencia-tecnica/proyectos/${currentProjectId}/categorias-gasto`);
      const d = res.data?.data ?? {};
      setCategorias(d.categorias ?? []);
      setProyectoCostosEstado(d.estado_proyecto ?? null);
    } catch { /* silencioso */ }
    finally { setLoadingCat(false); }
  }, [currentProjectId]);

  const handleCrearCategoria = () => {
    if (!nuevaCatNombre.trim() || !currentProjectId) return;
    setConfirmCrearCategoria(true);
  };

  const crearCategoria = async () => {
    setConfirmCrearCategoria(false);
    if (!nuevaCatNombre.trim() || !currentProjectId) return;
    setSavingCat(true);
    try {
      await api.post(`/api/v1/gerencia-tecnica/proyectos/${currentProjectId}/categorias-gasto`, { nombre: nuevaCatNombre.trim() });
      setNuevaCatNombre('');
      await loadCategorias();
    } catch { /* silencioso */ }
    finally { setSavingCat(false); }
  };

  const handleEditarCategoria = async (id: string) => {
    if (!editCatNombre.trim()) return;
    setSavingCat(true);
    try {
      await api.put(`/api/v1/gerencia-tecnica/categorias-gasto/${id}`, { nombre: editCatNombre.trim() });
      setEditCatId(null);
      await loadCategorias();
    } catch { /* silencioso */ }
    finally { setSavingCat(false); }
  };

  const handleEliminarCategoria = async (id: string) => {
    setSavingCat(true);
    try {
      await api.delete(`/api/v1/gerencia-tecnica/categorias-gasto/${id}`);
      await loadCategorias();
    } catch (e: any) {
      notify({ type: 'error', title: e.response?.data?.error?.message || 'Error al eliminar la categoría de gasto' });
    } finally {
      setSavingCat(false);
      setConfirmEliminarCategoria(null);
    }
  };

  const handleActivarProyecto = async () => {
    if (!currentProjectId) return;
    setActivandoProyecto(true);
    try {
      await api.put(`/api/v1/gerencia-tecnica/proyectos/${currentProjectId}/estado-costos`, { estado: 'ACTIVO' });
      setConfirmActivar(false);
      await loadCategorias();
    } catch { /* silencioso */ }
    finally { setActivandoProyecto(false); }
  };

  const handleArchivarUsuario = async (id: string) => {
    setSavingUserActivo(true);
    try {
      await api.patch(`/api/v1/auth/admin/users/${id}`, { activo: false });
      await loadAll();
    } catch (e: any) {
      notify({ type: 'error', title: e.response?.data?.error?.message || 'Error al archivar el usuario' });
    } finally {
      setSavingUserActivo(false);
      setConfirmArchivarUsuario(null);
    }
  };

  const handleReactivarUsuario = async (id: string) => {
    setSavingUserActivo(true);
    try {
      await api.patch(`/api/v1/auth/admin/users/${id}`, { activo: true });
      await loadAll();
    } catch (e: any) {
      notify({ type: 'error', title: e.response?.data?.error?.message || 'Error al reactivar el usuario' });
    } finally {
      setSavingUserActivo(false);
      setConfirmReactivarUsuario(null);
    }
  };

  // Independiente por endpoint: GET /admin/users exige rol admin
  // exclusivamente, pero /admin/proyectos también acepta gerencia_tecnica/
  // control_proyectos/control_obra (ROLES_VER_CENTRO_COSTOS) — un 403 en
  // usuarios no debe tumbar la carga de proyectos para esos roles.
  const loadAll = useCallback(async () => {
    setLoading(true); setError(null);
    const [ur, pr] = await Promise.allSettled([
      api.get('/api/v1/auth/admin/users'),
      api.get('/api/v1/auth/admin/proyectos'),
    ]);
    if (ur.status === 'fulfilled') setUsers((ur.value.data as { data: AdminUser[] }).data);
    if (pr.status === 'fulfilled') setProyectos((pr.value.data as { data: Proyecto[] }).data);
    if (ur.status === 'rejected' && pr.status === 'rejected') {
      setError('Error al cargar datos de administración.');
    }
    setLoading(false);
  }, []);

  useEffect(() => { void loadAll(); }, [loadAll]);
  useEffect(() => { if (activeTab === 'categorias') loadCategorias(); }, [activeTab]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">Administración</h1>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Gestión de usuarios, roles y proyectos
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <HelpButton onClick={() => setHelpOpen(true)} />
          {activeTab !== 'categorias' && !(activeTab === 'proyectos' && !puedeEditarProyectos) && (
            <button
              onClick={() => activeTab === 'usuarios' ? (setEditingUser(undefined), setShowUserModal(true)) : (setEditingProyecto(undefined), setShowProyectoModal(true))}
              className="rounded-xl bg-primary px-4 py-2 text-xs font-black uppercase tracking-widest text-primary-foreground hover:bg-primary/90"
            >
              + {activeTab === 'usuarios' ? 'Nuevo Usuario' : 'Nuevo Proyecto'}
            </button>
          )}
        </div>
      </div>


      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/10 border-t-primary" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center text-sm text-destructive">{error}</div>
      ) : activeTab === 'usuarios' ? (
        /* ── Users Table ── */
        <div className="rounded-2xl border border-border/30 bg-card overflow-hidden">
          {users.length === 0 ? (
            <div className="p-12 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">Sin usuarios registrados</div>
          ) : (
            <div className="divide-y divide-border/20">
              {users.map(u => (
                <div key={u.id} className={`flex items-start gap-4 px-6 py-4 hover:bg-muted/20 transition-colors ${!u.activo ? 'opacity-50' : ''}`}>
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-black text-primary">
                    {u.nombre.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold">{u.nombre}</p>
                      {!u.activo && <span className="rounded-lg bg-red-900/30 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-red-400">Inactivo</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {u.roles.map(r => <RoleBadge key={r} role={r} />)}
                    </div>
                    {u.proyectos.length > 0 && (
                      <p className="mt-1 text-[10px] text-muted-foreground/70">
                        Proyectos: {u.proyectos.map(p => p.codigo).join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <button onClick={() => { setEditingUser(u); setShowUserModal(true); }}
                      className="rounded-lg border border-border/40 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest hover:bg-muted/50">
                      Editar
                    </button>
                    {u.activo ? (
                      <button onClick={() => setConfirmArchivarUsuario(u)}
                        disabled={u.id === user?.id}
                        title={u.id === user?.id ? 'No puedes archivar tu propia cuenta.' : undefined}
                        className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-30">
                        Archivar
                      </button>
                    ) : (
                      <button onClick={() => setConfirmReactivarUsuario(u)}
                        className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-500/10">
                        Reactivar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'categorias' ? (
        /* ── Categorías de Gasto ── */
        <div className="space-y-6">
          {/* Estado del proyecto */}
          <div className="flex items-center justify-between rounded-2xl border border-border/40 bg-card px-5 py-4">
            <div className="space-y-0.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Estado del proyecto de costos</p>
              <div className="flex items-center gap-2">
                <span className={cn(
                  'rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest',
                  proyectoCostosEstado === 'CONFIGURACION' && 'border-sky-500/30 bg-sky-500/10 text-sky-700',
                  proyectoCostosEstado === 'ACTIVO' && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
                  proyectoCostosEstado === 'CERRADO' && 'border-muted/30 bg-muted/30 text-muted-foreground',
                  !proyectoCostosEstado && 'border-muted/30 bg-muted/30 text-muted-foreground',
                )}>
                  {proyectoCostosEstado ?? 'Cargando...'}
                </span>
                {proyectoCostosEstado === 'CONFIGURACION' && (
                  <p className="text-[10px] text-muted-foreground">Las categorías se pueden editar</p>
                )}
                {proyectoCostosEstado === 'ACTIVO' && (
                  <p className="text-[10px] text-muted-foreground">Categorías congeladas</p>
                )}
              </div>
            </div>
            {proyectoCostosEstado === 'CONFIGURACION' && (
              <button
                onClick={() => setConfirmActivar(true)}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-emerald-500"
              >
                Activar Proyecto
              </button>
            )}
          </div>

          {/* Lista de categorías */}
          <div className="rounded-2xl border border-border/30 bg-card overflow-hidden">
            <div className="border-b border-border/30 px-5 py-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Categorías de Gasto ({categorias.length})
              </p>
            </div>
            {loadingCat ? (
              <div className="flex h-32 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-sky-500/10 border-t-sky-600" />
              </div>
            ) : categorias.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">Sin categorías — se crearán automáticamente al acceder</div>
            ) : (
              <div className="divide-y divide-border/20">
                {categorias.map(cat => (
                  <div key={cat.id_categoria} className={cn('flex items-center gap-3 px-5 py-3', !cat.activa && 'opacity-50')}>
                    {editCatId === cat.id_categoria ? (
                      <>
                        <input
                          className="flex-1 rounded-xl border border-sky-500/40 bg-muted/30 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500/40"
                          value={editCatNombre}
                          onChange={e => setEditCatNombre(e.target.value)}
                          autoFocus
                        />
                        <button onClick={() => handleEditarCategoria(cat.id_categoria)} disabled={savingCat}
                          className="rounded-xl bg-emerald-600 px-3 py-1.5 text-[10px] font-black text-white hover:bg-emerald-700 disabled:opacity-50">
                          Guardar
                        </button>
                        <button onClick={() => setEditCatId(null)}
                          className="rounded-xl border border-border/40 px-3 py-1.5 text-[10px] font-black hover:bg-muted/50">
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-foreground">{cat.nombre}</span>
                            {cat.es_predefinida && (
                              <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">Sistema</span>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground">{cat.insumos_count} insumo{cat.insumos_count !== 1 ? 's' : ''}</p>
                        </div>
                        <button
                          onClick={() => { setEditCatId(cat.id_categoria); setEditCatNombre(cat.nombre); }}
                          disabled={proyectoCostosEstado !== 'CONFIGURACION'}
                          className="rounded-lg border border-border/40 px-3 py-1.5 text-[10px] font-black hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          Editar
                        </button>
                        {!cat.es_predefinida && (
                          <button
                            onClick={() => setConfirmEliminarCategoria(cat)}
                            disabled={proyectoCostosEstado !== 'CONFIGURACION' || cat.insumos_count > 0 || savingCat}
                            className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-1.5 text-[10px] font-black text-red-600 hover:bg-red-500/10 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            Eliminar
                          </button>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Nueva categoría */}
          {proyectoCostosEstado === 'CONFIGURACION' && (
            <div className="rounded-2xl border border-dashed border-emerald-500/30 bg-emerald-500/5 p-5 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Nueva Categoría</p>
              <div className="flex gap-3">
                <input
                  className="flex-1 rounded-xl border border-border/40 bg-muted/30 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                  placeholder="Ej: Concreto Hidráulico"
                  value={nuevaCatNombre}
                  onChange={e => setNuevaCatNombre(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCrearCategoria()}
                />
                <button
                  onClick={handleCrearCategoria}
                  disabled={!nuevaCatNombre.trim() || savingCat}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white hover:bg-emerald-500 disabled:opacity-50"
                >
                  {savingCat ? '...' : 'Agregar'}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ── Projects Table ── */
        <div className="rounded-2xl border border-border/30 bg-card overflow-hidden">
          {proyectos.length === 0 ? (
            <div className="p-12 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">Sin proyectos registrados</div>
          ) : (
            <div className="divide-y divide-border/20">
              {proyectos.map(p => (
                <div key={p.id_proyecto} className={`flex items-center gap-4 px-6 py-4 hover:bg-muted/20 transition-colors ${!p.activo ? 'opacity-50' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg border border-border/40 bg-muted/50 px-2 py-0.5 text-[10px] font-mono font-bold">{p.codigo_centro_costos}</span>
                      <p className="text-sm font-bold truncate">{p.nombre_oficial}</p>
                    </div>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {p.tipo_contrato} · {p.moneda_base} · {p.estatus}
                    </p>
                  </div>
                  {puedeEditarProyectos && (
                    <button onClick={() => { setEditingProyecto(p); setShowProyectoModal(true); }}
                      className="flex-shrink-0 rounded-lg border border-border/40 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest hover:bg-muted/50">
                      Editar
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de confirmación: Activar Proyecto */}
      {confirmActivar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl border border-border/40 bg-card p-6 shadow-2xl space-y-4">
            <h2 className="text-sm font-black uppercase tracking-widest">¿Activar proyecto?</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Al activar el proyecto, las categorías de gasto quedarán <strong>congeladas</strong> y no podrán modificarse. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmActivar(false)}
                className="flex-1 rounded-xl border border-border/40 px-4 py-2 text-xs font-black hover:bg-muted/50">
                Cancelar
              </button>
              <button onClick={handleActivarProyecto} disabled={activandoProyecto}
                className="flex-1 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white hover:bg-emerald-500 disabled:opacity-50">
                {activandoProyecto ? 'Activando...' : 'Confirmar Activación'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmCriticalActionDialog
        open={confirmCrearCategoria}
        dismissible={false}
        title="¿Crear esta categoría de gasto?"
        projectName={currentProjectName}
        projectColorDot={currentProjectColor.dot}
        confirmDisabled={savingCat}
        onConfirm={() => void crearCategoria()}
        onCancel={() => setConfirmCrearCategoria(false)}
      />

      <ConfirmCriticalActionDialog
        open={!!confirmEliminarCategoria}
        title={`¿Eliminar la categoría "${confirmEliminarCategoria?.nombre ?? ''}"?`}
        projectName={currentProjectName}
        projectColorDot={currentProjectColor.dot}
        confirmLabel="Eliminar categoría"
        variant="destructive"
        confirmDisabled={savingCat}
        onConfirm={() => confirmEliminarCategoria && handleEliminarCategoria(confirmEliminarCategoria.id_categoria)}
        onCancel={() => setConfirmEliminarCategoria(null)}
      />

      <ConfirmCriticalActionDialog
        open={!!confirmArchivarUsuario}
        title={`¿Archivar a "${confirmArchivarUsuario?.nombre ?? ''}"?`}
        projectName={currentProjectName}
        projectColorDot={currentProjectColor.dot}
        confirmLabel="Archivar usuario"
        variant="destructive"
        confirmDisabled={savingUserActivo}
        onConfirm={() => confirmArchivarUsuario && handleArchivarUsuario(confirmArchivarUsuario.id)}
        onCancel={() => setConfirmArchivarUsuario(null)}
      />

      <ConfirmCriticalActionDialog
        open={!!confirmReactivarUsuario}
        title={`¿Reactivar a "${confirmReactivarUsuario?.nombre ?? ''}"?`}
        projectName={currentProjectName}
        projectColorDot={currentProjectColor.dot}
        confirmLabel="Reactivar usuario"
        confirmDisabled={savingUserActivo}
        onConfirm={() => confirmReactivarUsuario && handleReactivarUsuario(confirmReactivarUsuario.id)}
        onCancel={() => setConfirmReactivarUsuario(null)}
      />

      {showUserModal && (
        <UserModal user={editingUser} proyectos={proyectos}
          onClose={() => { setShowUserModal(false); setEditingUser(undefined); }}
          onSaved={async () => { await loadAll(); await refreshUser(); }} />
      )}
      {showProyectoModal && (
        <ProyectoModal proyecto={editingProyecto}
          onClose={() => { setShowProyectoModal(false); setEditingProyecto(undefined); }}
          onSaved={async () => { await loadAll(); await refreshUser(); }} />
      )}

      <HelpPanel viewId="admin" activeSubView={activeSubView} isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
};
