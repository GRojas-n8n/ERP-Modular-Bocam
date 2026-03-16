import React, { useState } from 'react';
import { useTenant } from '../context/TenantContext';
import { Building2, Lock, Mail, Loader2, AlertCircle, Shield } from 'lucide-react';

/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * App Shell — Vista de Login
 *
 * Pantalla de autenticación con diseño premium White-Label.
 * Se conecta al servicio de Auth real (/api/v1/auth/login).
 * ---------------------------------------------------------------------------
 */

// Tenants disponibles para selección rápida en desarrollo
const DEV_TENANTS = [
  { id: '11111111-aaaa-bbbb-cccc-111111111111', name: 'Constructora Alfa S.A.' },
  { id: '22222222-aaaa-bbbb-cccc-222222222222', name: 'Desarrollos Beta Corp.' },
];

export const LoginView: React.FC = () => {
  const { login, loginError } = useTenant();
  const [email, setEmail] = useState('admin@alfa.bocam.com');
  const [password, setPassword] = useState('Admin.2026');
  const [tenantId, setTenantId] = useState(DEV_TENANTS[0].id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLocalError(null);

    try {
      await login(email, password, tenantId);
    } catch {
      setLocalError(loginError || 'Error al iniciar sesión.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const error = localError || loginError;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4">
      <div className="w-full max-w-md">
        {/* Logo Area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">BOCAM ERP</h1>
          <p className="text-sm text-muted-foreground mt-1">Ecosistema Modular de Construcción</p>
        </div>

        {/* Login Card */}
        <div className="bg-card rounded-2xl border border-border shadow-lg p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">Iniciar Sesión</h2>
            <p className="text-sm text-muted-foreground mt-1">Ingresa tus credenciales corporativas</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <span className="text-sm text-destructive">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Selector de Organización */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Organización
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <select
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors appearance-none"
                  id="login-tenant-select"
                >
                  {DEV_TENANTS.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Correo Corporativo
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@empresa.com"
                  required
                  id="login-email-input"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  id="login-password-input"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              id="login-submit-btn"
              className="w-full py-2.5 px-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Autenticando...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          {/* Dev Hint */}
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-[11px] text-muted-foreground text-center">
              🔒 Autenticación JWT con firma criptográfica
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-muted-foreground mt-6">
          © 2026 Constructora Bocam, S. A. de C.V. — Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};
