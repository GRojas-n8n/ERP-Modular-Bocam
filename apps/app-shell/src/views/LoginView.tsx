import React, { useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import {
  FormField,
  Input,
} from '@bocam/ui-core';
import { useTenant } from '../context/TenantContext';

// ─── Tenant fijo de producción ────────────────────────────────────────────────
const BOCAM_TENANT_ID = '8e07a7ac-8157-4e5d-8499-e985a9fcdbfc';

// ─── Iconos inline ────────────────────────────────────────────────────────────
const IconMail = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className={className}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const IconLock = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className={className}>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

// ─── Logo Iretum (wordmark SVG) ───────────────────────────────────────────────
const IretumLogo = () => (
  <div className="flex flex-col items-center gap-1">
    {/* Hexágono isotipo */}
    <svg width="56" height="64" viewBox="0 0 56 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M28 2L54 17V47L28 62L2 47V17L28 2Z"
        fill="hsl(218 43% 11%)"
        stroke="#00D1FF"
        strokeWidth="2.5"
      />
      {/* I calada */}
      <rect x="23" y="18" width="10" height="3" rx="1" fill="#00D1FF" />
      <rect x="25.5" y="21" width="5" height="22" rx="1" fill="#00D1FF" />
      <rect x="23" y="43" width="10" height="3" rx="1" fill="#00D1FF" />
    </svg>
    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.04em' }}
      className="text-3xl font-bold text-foreground tracking-tight">
      iretum
    </span>
  </div>
);

// ─── Componente principal ─────────────────────────────────────────────────────
export const LoginView: React.FC = () => {
  const { login, loginDemo, loginError } = useTenant();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLocalError(null);
    try {
      await login(email, password, BOCAM_TENANT_ID);
    } catch {
      setLocalError(loginError || 'Credenciales incorrectas. Verifica tu correo y contraseña.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const error = localError || loginError;

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center px-4 py-12"
      style={{ background: 'hsl(218 43% 11%)' }}>

      {/* ── Fondo: rejilla isométrica sutil ── */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(hsl(192 100% 50%) 1px, transparent 1px),
                            linear-gradient(90deg, hsl(192 100% 50%) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* ── Glow superior cyan ── */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-10"
        style={{ background: 'radial-gradient(ellipse, #00D1FF 0%, transparent 70%)' }}
      />

      {/* ── Tarjeta de login ── */}
      <div className="relative w-full max-w-sm z-10">

        {/* Logo */}
        <div className="mb-10 flex flex-col items-center">
          <IretumLogo />
          <p className="mt-3 text-sm text-muted-foreground font-medium tracking-wide">
            ERP Industrial para Constructoras
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border p-8 shadow-2xl"
          style={{
            background: 'hsl(218 35% 15%)',
            borderColor: 'hsl(218 30% 22%)',
            boxShadow: '0 0 0 1px hsl(218 30% 22%), 0 25px 50px hsl(218 43% 6% / 0.8)',
          }}>

          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.02em' }}
            className="text-xl font-bold text-foreground mb-1">
            Acceso al sistema
          </h2>
          <p className="text-xs text-muted-foreground mb-6">
            Constructora Bocam S.A. de C.V.
          </p>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-3 mb-5">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <span className="text-xs font-medium leading-relaxed text-destructive">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Correo corporativo">
              <div className="relative group">
                <IconMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@bocam.com.mx"
                  required
                  id="login-email-input"
                  className="pl-10 py-3"
                  style={{ background: 'hsl(218 32% 18%)', borderColor: 'hsl(218 30% 25%)' }}
                />
              </div>
            </FormField>

            <FormField label="Contraseña">
              <div className="relative group">
                <IconLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  id="login-password-input"
                  className="pl-10 py-3"
                  style={{ background: 'hsl(218 32% 18%)', borderColor: 'hsl(218 30% 25%)' }}
                />
              </div>
            </FormField>

            {/* Botón principal con glow cyan */}
            <button
              type="submit"
              disabled={isSubmitting}
              id="login-submit-btn"
              className="mt-2 w-full h-12 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: isSubmitting ? 'hsl(192 100% 40%)' : '#00D1FF',
                color: 'hsl(218 43% 11%)',
                boxShadow: isSubmitting ? 'none' : '0 0 20px hsl(192 100% 50% / 0.35)',
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Autenticando...
                </>
              ) : (
                'Ingresar'
              )}
            </button>
          </form>

          {/* Separador */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: 'hsl(218 30% 22%)' }} />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                style={{ background: 'hsl(218 35% 15%)' }}>
                o
              </span>
            </div>
          </div>

          {/* Demo */}
          <button
            type="button"
            onClick={loginDemo}
            className="w-full rounded-xl border border-dashed px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-all duration-200"
            style={{
              borderColor: 'hsl(192 100% 50% / 0.3)',
              color: '#00D1FF',
              background: 'hsl(192 100% 50% / 0.05)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'hsl(192 100% 50% / 0.1)';
              e.currentTarget.style.borderColor = 'hsl(192 100% 50% / 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'hsl(192 100% 50% / 0.05)';
              e.currentTarget.style.borderColor = 'hsl(192 100% 50% / 0.3)';
            }}
          >
            ⚡ Explorar en modo demo
          </button>
        </div>

        {/* Footer legal */}
        <p className="mt-8 text-center text-[10px] font-medium text-muted-foreground/40 leading-relaxed">
          Iretum® es una plataforma desarrollada y operada por<br />
          Constructora Bocam, S.A. de C.V. · Todos los derechos reservados
        </p>
      </div>
    </div>
  );
};
