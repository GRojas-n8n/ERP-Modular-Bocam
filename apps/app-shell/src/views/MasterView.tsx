import React, { useState, useEffect, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Tenant {
  id_tenant: string;
  nombre: string;
  rfc: string | null;
  plan: string;
  primary_color: string | null;
  logo_url: string | null;
  activo: boolean;
  created_at: string;
}

type PlanOption = 'BASICO' | 'PROFESIONAL' | 'ENTERPRISE';

// ─── API helpers ──────────────────────────────────────────────────────────────
const masterFetch = (path: string, key: string, opts: RequestInit = {}) => {
  const base = (import.meta.env.VITE_API_URL as string) || '';
  return fetch(`${base}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}`, ...(opts.headers || {}) },
  });
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const PlanBadge: React.FC<{ plan: string }> = ({ plan }) => {
  const colors: Record<string, string> = {
    BASICO: 'bg-zinc-700 text-zinc-300',
    PROFESIONAL: 'bg-sky-900/60 text-sky-300',
    ENTERPRISE: 'bg-amber-900/60 text-amber-300',
  };
  return (
    <span className={`rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${colors[plan] ?? colors.BASICO}`}>
      {plan}
    </span>
  );
};

// ─── Create/Edit Tenant Modal ─────────────────────────────────────────────────
interface TenantModalProps {
  masterKey: string;
  tenant?: Tenant;
  onClose: () => void;
  onSaved: () => void;
}

const TenantModal: React.FC<TenantModalProps> = ({ masterKey, tenant, onClose, onSaved }) => {
  const isEdit = !!tenant;
  const [form, setForm] = useState({
    nombre: tenant?.nombre ?? '',
    rfc: tenant?.rfc ?? '',
    plan: (tenant?.plan ?? 'BASICO') as PlanOption,
    primary_color: tenant?.primary_color ?? '',
    // Admin user (only on create)
    admin_email: '',
    admin_password: '',
    admin_nombre: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.nombre.trim()) { setError('El nombre del tenant es obligatorio.'); return; }
    if (!isEdit && (!form.admin_email.trim() || !form.admin_password.trim() || !form.admin_nombre.trim())) {
      setError('Los datos del administrador son obligatorios para un nuevo tenant.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (isEdit) {
        const r = await masterFetch(`/api/v1/master/tenants/${tenant!.id_tenant}`, masterKey, {
          method: 'PATCH',
          body: JSON.stringify({ nombre: form.nombre, rfc: form.rfc || null, plan: form.plan, primary_color: form.primary_color || null }),
        });
        if (!r.ok) throw new Error((await r.json()).error?.message ?? 'Error al guardar.');
      } else {
        // 1. Create tenant
        const r = await masterFetch('/api/v1/master/tenants', masterKey, {
          method: 'POST',
          body: JSON.stringify({ nombre: form.nombre, rfc: form.rfc || null, plan: form.plan, primary_color: form.primary_color || null }),
        });
        if (!r.ok) throw new Error((await r.json()).error?.message ?? 'Error al crear tenant.');
        const { data: newTenant } = await r.json() as { data: Tenant };
        // 2. Create admin user
        const base = (import.meta.env.VITE_API_URL as string) || '';
        const ur = await fetch(`${base}/api/v1/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenant_id: newTenant.id_tenant,
            email: form.admin_email.trim(),
            password: form.admin_password,
            nombre: form.admin_nombre.trim(),
            roles: ['admin'],
          }),
        });
        if (!ur.ok) {
          // Rollback: deactivate the tenant we just created
          await masterFetch(`/api/v1/master/tenants/${newTenant.id_tenant}`, masterKey, {
            method: 'PATCH', body: JSON.stringify({ activo: false }),
          });
          throw new Error((await ur.json()).error?.message ?? 'Error al crear usuario administrador.');
        }
      }
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-border/40 bg-card shadow-2xl">
        <div className="border-b border-border/30 px-6 py-4">
          <h2 className="text-sm font-black uppercase tracking-widest">
            {isEdit ? 'Editar Tenant' : 'Nuevo Tenant'}
          </h2>
        </div>
        <div className="space-y-4 px-6 py-5">
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs font-medium text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nombre *</label>
            <input
              className="w-full rounded-xl border border-border/40 bg-muted/50 px-3 py-2 text-sm focus:border-emerald-500/50 focus:outline-none"
              value={form.nombre} onChange={e => set('nombre', e.target.value)}
              placeholder="Constructora Ejemplo S.A. de C.V."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">RFC</label>
              <input className="w-full rounded-xl border border-border/40 bg-muted/50 px-3 py-2 text-sm focus:border-emerald-500/50 focus:outline-none"
                value={form.rfc} onChange={e => set('rfc', e.target.value)} placeholder="EJE010101XYZ" />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Plan</label>
              <select className="w-full rounded-xl border border-border/40 bg-muted/50 px-3 py-2 text-sm focus:border-emerald-500/50 focus:outline-none"
                value={form.plan} onChange={e => set('plan', e.target.value)}>
                <option value="BASICO">Básico</option>
                <option value="PROFESIONAL">Profesional</option>
                <option value="ENTERPRISE">Enterprise</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Color Primario (HSL)</label>
            <input className="w-full rounded-xl border border-border/40 bg-muted/50 px-3 py-2 text-sm focus:border-emerald-500/50 focus:outline-none"
              value={form.primary_color} onChange={e => set('primary_color', e.target.value)} placeholder="142 76% 36%" />
          </div>

          {!isEdit && (
            <>
              <div className="border-t border-border/30 pt-4">
                <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                  Administrador Inicial
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nombre *</label>
                    <input className="w-full rounded-xl border border-border/40 bg-muted/50 px-3 py-2 text-sm focus:border-emerald-500/50 focus:outline-none"
                      value={form.admin_nombre} onChange={e => set('admin_nombre', e.target.value)} placeholder="Juan Pérez" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email *</label>
                    <input type="email" className="w-full rounded-xl border border-border/40 bg-muted/50 px-3 py-2 text-sm focus:border-emerald-500/50 focus:outline-none"
                      value={form.admin_email} onChange={e => set('admin_email', e.target.value)} placeholder="admin@empresa.com" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Password *</label>
                    <input type="password" className="w-full rounded-xl border border-border/40 bg-muted/50 px-3 py-2 text-sm focus:border-emerald-500/50 focus:outline-none"
                      value={form.admin_password} onChange={e => set('admin_password', e.target.value)} placeholder="Min. 8 caracteres" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="flex gap-3 border-t border-border/30 px-6 py-4">
          <button onClick={onClose} className="flex-1 rounded-xl border border-border/40 px-4 py-2 text-xs font-black uppercase tracking-widest hover:bg-muted/50">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Crear Tenant'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main MasterView ──────────────────────────────────────────────────────────
export const MasterView: React.FC = () => {
  const [masterKey, setMasterKey] = useState('');
  const [inputKey, setInputKey] = useState('');
  const [authError, setAuthError] = useState('');
  const [verifying, setVerifying] = useState(false);

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | undefined>(undefined);
  const [toggling, setToggling] = useState<string | null>(null);

  const loadTenants = useCallback(async (key: string) => {
    setLoading(true);
    setFetchError(null);
    try {
      const r = await masterFetch('/api/v1/master/tenants', key);
      if (!r.ok) throw new Error('Error al cargar tenants.');
      const { data } = await r.json() as { data: Tenant[] };
      setTenants(data);
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : 'Error desconocido.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogin = async () => {
    if (!inputKey.trim()) return;
    setVerifying(true);
    setAuthError('');
    try {
      const r = await masterFetch('/api/v1/master/tenants', inputKey.trim());
      if (r.status === 401) { setAuthError('Clave maestra incorrecta.'); return; }
      if (!r.ok) { setAuthError('Error de conexion con el servidor.'); return; }
      const { data } = await r.json() as { data: Tenant[] };
      setMasterKey(inputKey.trim());
      setTenants(data);
    } catch {
      setAuthError('No se pudo conectar con el servidor.');
    } finally {
      setVerifying(false);
    }
  };

  const handleToggle = async (tenant: Tenant) => {
    setToggling(tenant.id_tenant);
    try {
      await masterFetch(`/api/v1/master/tenants/${tenant.id_tenant}`, masterKey, {
        method: 'PATCH',
        body: JSON.stringify({ activo: !tenant.activo }),
      });
      await loadTenants(masterKey);
    } finally {
      setToggling(null);
    }
  };

  // ── Login Screen ─────────────────────────────────────────────────────────────
  if (!masterKey) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600/10 border border-emerald-500/20">
              <svg className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <h1 className="text-xl font-black uppercase tracking-tighter">Master Dashboard</h1>
            <p className="mt-1 text-xs font-medium text-muted-foreground">Gestion de Tenants — Bocam ERP</p>
          </div>
          <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-xl">
            {authError && (
              <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs font-medium text-red-400">
                {authError}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Clave Maestra
                </label>
                <input
                  type="password"
                  className="w-full rounded-xl border border-border/40 bg-muted/50 px-4 py-3 text-sm focus:border-emerald-500/50 focus:outline-none"
                  placeholder="••••••••••••"
                  value={inputKey}
                  onChange={e => setInputKey(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  autoFocus
                />
              </div>
              <button
                onClick={handleLogin}
                disabled={verifying || !inputKey.trim()}
                className="w-full rounded-xl bg-emerald-600 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                {verifying ? 'Verificando...' : 'Ingresar'}
              </button>
            </div>
          </div>
          <p className="text-center text-[10px] text-muted-foreground/50 font-medium">
            Acceso restringido — solo administradores del sistema
          </p>
        </div>
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────────
  const active = tenants.filter(t => t.activo).length;
  const inactive = tenants.filter(t => !t.activo).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/30 bg-card/50 px-8 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <h1 className="text-sm font-black uppercase tracking-widest">Master Dashboard</h1>
            <p className="text-[10px] text-muted-foreground font-medium">Bocam ERP — Gestion de Tenants</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => loadTenants(masterKey)}
              className="rounded-xl border border-border/40 px-3 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-muted/50"
            >
              Actualizar
            </button>
            <button
              onClick={() => { setShowModal(true); setEditingTenant(undefined); }}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-emerald-500"
            >
              + Nuevo Tenant
            </button>
            <button
              onClick={() => { setMasterKey(''); setInputKey(''); }}
              className="rounded-xl border border-border/40 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted/50"
            >
              Salir
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-8 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Tenants', value: tenants.length, color: 'text-foreground' },
            { label: 'Activos', value: active, color: 'text-emerald-500' },
            { label: 'Inactivos', value: inactive, color: 'text-muted-foreground' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border border-border/30 bg-card p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{s.label}</p>
              <p className={`mt-1 text-3xl font-black ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tenant List */}
        <div className="rounded-2xl border border-border/30 bg-card overflow-hidden">
          <div className="border-b border-border/30 px-6 py-4">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tenants Registrados</h2>
          </div>

          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500/10 border-t-emerald-600" />
            </div>
          ) : fetchError ? (
            <div className="p-8 text-center text-sm text-red-400">{fetchError}</div>
          ) : tenants.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sin tenants registrados</p>
              <p className="mt-2 text-xs text-muted-foreground/60">Crea el primer tenant con el botón de arriba</p>
            </div>
          ) : (
            <div className="divide-y divide-border/20">
              {tenants.map(t => (
                <div key={t.id_tenant} className={`flex items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/20 ${!t.activo ? 'opacity-50' : ''}`}>
                  {/* Color dot */}
                  <div
                    className="h-3 w-3 flex-shrink-0 rounded-full border border-border/40"
                    style={t.primary_color ? { background: `hsl(${t.primary_color})` } : { background: 'hsl(142 76% 36%)' }}
                  />
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold truncate">{t.nombre}</p>
                      <PlanBadge plan={t.plan} />
                      {!t.activo && (
                        <span className="rounded-lg bg-red-900/30 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-red-400">
                          Inactivo
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-3">
                      {t.rfc && <p className="text-[10px] text-muted-foreground font-medium">{t.rfc}</p>}
                      <p className="text-[10px] text-muted-foreground/60 font-mono">{t.id_tenant.slice(0, 8)}…</p>
                      <p className="text-[10px] text-muted-foreground/60">
                        {new Date(t.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => { setEditingTenant(t); setShowModal(true); }}
                      className="rounded-lg border border-border/40 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest hover:bg-muted/50"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleToggle(t)}
                      disabled={toggling === t.id_tenant}
                      className={`rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest disabled:opacity-50 ${
                        t.activo
                          ? 'border border-red-500/30 text-red-400 hover:bg-red-500/10'
                          : 'border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10'
                      }`}
                    >
                      {toggling === t.id_tenant ? '...' : t.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <TenantModal
          masterKey={masterKey}
          tenant={editingTenant}
          onClose={() => { setShowModal(false); setEditingTenant(undefined); }}
          onSaved={() => loadTenants(masterKey)}
        />
      )}
    </div>
  );
};
