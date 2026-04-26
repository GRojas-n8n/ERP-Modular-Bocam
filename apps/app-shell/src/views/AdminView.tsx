import React, { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

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
}

// ─── Role catalog ─────────────────────────────────────────────────────────────
const ROLES = [
  { value: 'admin',            label: 'Administrador' },
  { value: 'gerencia_tecnica', label: 'Gerencia Técnica' },
  { value: 'compras',          label: 'Compras' },
  { value: 'finanzas',         label: 'Finanzas' },
  { value: 'contabilidad',     label: 'Contabilidad' },
  { value: 'control_obra',     label: 'Control de Obra' },
  { value: 'personal_rh',      label: 'Personal / RH' },
  { value: 'seguridad_hse',    label: 'Seguridad HSE' },
  { value: 'ventas',           label: 'Ventas' },
];

const rolLabel = (r: string) => ROLES.find(x => x.value === r)?.label ?? r;

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
    if (!form.nombre.trim() || (!isEdit && !form.email.trim())) { setError('Nombre y email son obligatorios.'); return; }
    if (!isEdit && !form.password) { setError('La contraseña es obligatoria para nuevos usuarios.'); return; }
    if (form.roles.length === 0) { setError('Asigna al menos un rol.'); return; }
    setSaving(true); setError(null);
    try {
      if (isEdit) {
        const body: Record<string, unknown> = { nombre: form.nombre, roles: form.roles, activo: form.activo, limite_aprobacion: form.limite_aprobacion };
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
                value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Juan Pérez" />
            </div>
            {!isEdit && <div className="col-span-2">
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email *</label>
              <input type="email" className="w-full rounded-xl border border-border/40 bg-muted/50 px-3 py-2 text-sm focus:border-primary/50 focus:outline-none"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="usuario@empresa.com" />
            </div>}
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
              {ROLES.map(r => (
                <button key={r.value} onClick={() => toggleRole(r.value)}
                  className={`rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border transition-colors ${
                    form.roles.includes(r.value)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border/40 text-muted-foreground hover:border-primary/40'
                  }`}>
                  {r.label}
                </button>
              ))}
            </div>
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
            className="flex-1 rounded-xl bg-primary px-4 py-2 text-xs font-black uppercase tracking-widest text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {saving ? 'Guardando...' : isEdit ? 'Guardar' : 'Crear Usuario'}
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
  const [form, setForm] = useState({
    codigo_centro_costos: proyecto?.codigo_centro_costos ?? '',
    nombre_oficial: proyecto?.nombre_oficial ?? '',
    tipo_contrato: proyecto?.tipo_contrato ?? 'PRECIOS_UNITARIOS',
    moneda_base: proyecto?.moneda_base ?? 'MXN',
    estatus: proyecto?.estatus ?? 'CONSTRUCCION',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!form.codigo_centro_costos.trim() || !form.nombre_oficial.trim()) { setError('Código y nombre son obligatorios.'); return; }
    setSaving(true); setError(null);
    try {
      if (isEdit) await api.patch(`/api/v1/auth/admin/proyectos/${proyecto!.id_proyecto}`, form);
      else await api.post('/api/v1/auth/admin/proyectos', form);
      onSaved(); onClose();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      setError(msg ?? 'Error al guardar.');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-border/40 bg-card shadow-2xl mx-4">
        <div className="border-b border-border/30 px-6 py-4">
          <h2 className="text-sm font-black uppercase tracking-widest">{isEdit ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h2>
        </div>
        <div className="space-y-4 px-6 py-5">
          {error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-400">{error}</div>}
          <div>
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Código Centro de Costos *</label>
            <input disabled={isEdit} className="w-full rounded-xl border border-border/40 bg-muted/50 px-3 py-2 text-sm focus:border-primary/50 focus:outline-none disabled:opacity-60"
              value={form.codigo_centro_costos} onChange={e => setForm(f => ({ ...f, codigo_centro_costos: e.target.value }))} placeholder="CC-2026-GUA-01" />
          </div>
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
              <option value="LICITACION">Licitación</option>
              <option value="ADJUDICADO">Adjudicado</option>
              <option value="CONSTRUCCION">Construcción</option>
              <option value="CIERRE_TECNICO">Cierre Técnico</option>
              <option value="CIERRE_FINANCIERO">Cierre Financiero</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 border-t border-border/30 px-6 py-4">
          <button onClick={onClose} className="flex-1 rounded-xl border border-border/40 px-4 py-2 text-xs font-black uppercase tracking-widest hover:bg-muted/50">Cancelar</button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 rounded-xl bg-primary px-4 py-2 text-xs font-black uppercase tracking-widest text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {saving ? 'Guardando...' : isEdit ? 'Guardar' : 'Crear Proyecto'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── AdminView ────────────────────────────────────────────────────────────────
export const AdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'usuarios' | 'proyectos'>('usuarios');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showProyectoModal, setShowProyectoModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | undefined>();
  const [editingProyecto, setEditingProyecto] = useState<Proyecto | undefined>();

  const loadAll = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [ur, pr] = await Promise.all([
        api.get('/api/v1/auth/admin/users'),
        api.get('/api/v1/auth/admin/proyectos'),
      ]);
      setUsers((ur.data as { data: AdminUser[] }).data);
      setProyectos((pr.data as { data: Proyecto[] }).data);
    } catch { setError('Error al cargar datos de administración.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void loadAll(); }, [loadAll]);

  const tabs = [
    { id: 'usuarios' as const, label: `Usuarios (${users.length})` },
    { id: 'proyectos' as const, label: `Proyectos (${proyectos.length})` },
  ];

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
        <button
          onClick={() => activeTab === 'usuarios' ? (setEditingUser(undefined), setShowUserModal(true)) : (setEditingProyecto(undefined), setShowProyectoModal(true))}
          className="rounded-xl bg-primary px-4 py-2 text-xs font-black uppercase tracking-widest text-primary-foreground hover:bg-primary/90"
        >
          + {activeTab === 'usuarios' ? 'Nuevo Usuario' : 'Nuevo Proyecto'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 rounded-2xl border border-border/30 bg-muted/30 p-1.5">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex-1 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest transition-colors ${
              activeTab === t.id ? 'bg-card border border-border/40 text-primary shadow-lg' : 'text-muted-foreground hover:text-foreground'
            }`}>
            {t.label}
          </button>
        ))}
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
                  <button onClick={() => { setEditingUser(u); setShowUserModal(true); }}
                    className="flex-shrink-0 rounded-lg border border-border/40 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest hover:bg-muted/50">
                    Editar
                  </button>
                </div>
              ))}
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
                  <button onClick={() => { setEditingProyecto(p); setShowProyectoModal(true); }}
                    className="flex-shrink-0 rounded-lg border border-border/40 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest hover:bg-muted/50">
                    Editar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showUserModal && (
        <UserModal user={editingUser} proyectos={proyectos}
          onClose={() => { setShowUserModal(false); setEditingUser(undefined); }}
          onSaved={loadAll} />
      )}
      {showProyectoModal && (
        <ProyectoModal proyecto={editingProyecto}
          onClose={() => { setShowProyectoModal(false); setEditingProyecto(undefined); }}
          onSaved={loadAll} />
      )}
    </div>
  );
};
