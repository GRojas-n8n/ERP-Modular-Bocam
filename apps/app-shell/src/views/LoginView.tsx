import React, { useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useTenant } from '../context/TenantContext';

// ─── Tenant desde variable de entorno (fallback hardcodeado para Bocam) ───────
const DEFAULT_TENANT_ID = (import.meta.env.VITE_DEFAULT_TENANT_ID || '8e07a7ac-8157-4e5d-8499-e985a9fcdbfc').trim();

// ─── Iconos inline ────────────────────────────────────────────────────────────
const IconMail = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className={className}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const IconLock = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className={className}>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

// ─── Componente principal ─────────────────────────────────────────────────────
export const LoginView: React.FC = () => {
  const { login, loginDemo, loginError } = useTenant();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError]     = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLocalError(null);
    try {
      if (!DEFAULT_TENANT_ID) {
        setLocalError('Configuración inválida: falta VITE_DEFAULT_TENANT_ID.');
        return;
      }
      await login(email, password, DEFAULT_TENANT_ID);
    } catch {
      setLocalError(loginError || 'Credenciales incorrectas. Verifica tu correo y contraseña.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const error = localError || loginError;

  return (
    <>
      {/* ── Keyframe animations ── */}
      <style>{`
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.13; transform: scale(1); }
          50%       { opacity: 0.25; transform: scale(1.06); }
        }
        @keyframes glow-pulse-2 {
          0%, 100% { opacity: 0.07; transform: scale(1); }
          50%       { opacity: 0.16; transform: scale(1.1); }
        }
        @keyframes scan-line {
          0%   { transform: translateY(-4px); opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(28px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .lr-logo     { animation: fade-in-up 0.65s cubic-bezier(0.16,1,0.3,1) 0.05s both; }
        .lr-badge    { animation: fade-in-up 0.65s cubic-bezier(0.16,1,0.3,1) 0.15s both; }
        .lr-tagline  { animation: fade-in-up 0.65s cubic-bezier(0.16,1,0.3,1) 0.25s both; }
        .lr-stats    { animation: fade-in-up 0.65s cubic-bezier(0.16,1,0.3,1) 0.38s both; }
        .lr-form     { animation: slide-in-right 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s both; }

        .lr-input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1.5px solid hsl(218 30% 26%);
          padding: 10px 10px 10px 34px;
          color: hsl(210 40% 96%);
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s ease;
          font-family: 'Inter', sans-serif;
          line-height: 1.5;
        }
        .lr-input::placeholder { color: hsl(215 20% 36%); }
        .lr-input:focus        { border-bottom-color: #00D1FF; }
        .lr-input-wrap { position: relative; }
        .lr-input-icon {
          position: absolute; left: 8px; top: 50%;
          transform: translateY(-50%);
          color: hsl(215 20% 42%);
          transition: color 0.2s ease;
          pointer-events: none;
        }
        .lr-input-wrap:focus-within .lr-input-icon { color: #00D1FF; }
        .lr-label {
          display: block;
          font-size: 10px; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: hsl(215 20% 46%);
          margin-bottom: 6px;
          font-family: 'Inter', sans-serif;
        }
        .lr-submit {
          width: 100%; height: 48px;
          border-radius: 10px; border: none;
          background: linear-gradient(110deg, #00AACC 0%, #00D1FF 40%, #7CF5FF 60%, #00D1FF 80%, #00AACC 100%);
          background-size: 250% auto;
          color: hsl(218 43% 9%);
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px; font-weight: 700;
          letter-spacing: 0.01em;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background-position 0.4s ease, box-shadow 0.3s ease, transform 0.15s ease;
          box-shadow: 0 0 24px hsl(192 100% 50% / 0.3);
        }
        .lr-submit:hover:not(:disabled) {
          background-position: right center;
          box-shadow: 0 0 36px hsl(192 100% 50% / 0.55), 0 0 72px hsl(192 100% 50% / 0.18);
          transform: translateY(-1px);
        }
        .lr-submit:active:not(:disabled) { transform: translateY(0); }
        .lr-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .lr-demo {
          width: 100%; padding: 11px;
          border-radius: 10px;
          border: 1px dashed hsl(192 100% 50% / 0.22);
          background: transparent;
          color: hsl(192 100% 62%);
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: background 0.2s ease, border-color 0.2s ease;
        }
        .lr-demo:hover {
          background: hsl(192 100% 50% / 0.06);
          border-color: hsl(192 100% 50% / 0.42);
        }
      `}</style>

      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'hsl(218 43% 9%)' }}>

        {/* ════════════════════════════════════════════
            PANEL IZQUIERDO — Branding
        ════════════════════════════════════════════ */}
        <div style={{
          display: 'none',
          position: 'relative',
          flexDirection: 'column',
          overflow: 'hidden',
          width: '58%',
          background: 'hsl(218 43% 10%)',
        }} className="lg:flex">

          {/* Glow 1 — centro-izquierda */}
          <div style={{
            position: 'absolute', top: '25%', left: '15%',
            width: 520, height: 520, borderRadius: '50%',
            background: 'radial-gradient(ellipse, hsl(192 100% 50% / 0.18) 0%, transparent 65%)',
            animation: 'glow-pulse 4.5s ease-in-out infinite',
            pointerEvents: 'none',
          }} />

          {/* Glow 2 — esquina inferior derecha */}
          <div style={{
            position: 'absolute', bottom: '-8%', right: '-4%',
            width: 420, height: 420, borderRadius: '50%',
            background: 'radial-gradient(ellipse, hsl(220 80% 65% / 0.12) 0%, transparent 65%)',
            animation: 'glow-pulse-2 5.5s ease-in-out infinite 1.2s',
            pointerEvents: 'none',
          }} />

          {/* Grid isométrico */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: `
              linear-gradient(hsl(192 100% 50% / 0.035) 1px, transparent 1px),
              linear-gradient(90deg, hsl(192 100% 50% / 0.035) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }} />

          {/* Scan line */}
          <div style={{
            position: 'absolute', left: 0, right: 0, height: 1, pointerEvents: 'none',
            background: 'linear-gradient(90deg, transparent 0%, hsl(192 100% 50% / 0.5) 30%, hsl(192 100% 50% / 0.8) 50%, hsl(192 100% 50% / 0.5) 70%, transparent 100%)',
            animation: 'scan-line 7s linear infinite 0.8s',
          }} />

          {/* Contenido del panel */}
          <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', padding: '52px 56px' }}>

            {/* Logo arriba */}
            <div className="lr-logo" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <picture>
                <source srcSet="/logo-dark.svg" media="(prefers-color-scheme: dark)" />
                <img src="/favicon.svg" alt="Iretum" width={34} height={33} />
              </picture>
              <span style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 20, fontWeight: 700,
                letterSpacing: '-0.04em',
                color: 'hsl(210 40% 96%)',
              }}>iretum</span>
            </div>

            {/* Tagline central */}
            <div className="lr-tagline">
              <div className="lr-badge" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '5px 12px',
                borderRadius: 20,
                border: '1px solid hsl(192 100% 50% / 0.25)',
                background: 'hsl(192 100% 50% / 0.06)',
                marginBottom: 24,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00D1FF', display: 'inline-block', animation: 'glow-pulse 2s ease-in-out infinite' }} />
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#00D1FF', fontFamily: "'Inter', sans-serif" }}>
                  ERP Industrial · 10 Módulos
                </span>
              </div>

              <h1 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 'clamp(38px, 3.8vw, 56px)',
                fontWeight: 800,
                lineHeight: 1.07,
                letterSpacing: '-0.03em',
                color: 'hsl(210 40% 97%)',
                marginBottom: 20,
              }}>
                Control total<br />
                <span style={{
                  background: 'linear-gradient(130deg, #00D1FF 0%, #7CF5FF 45%, #00BBEE 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>de tu obra.</span>
              </h1>

              <p style={{
                fontSize: 15,
                color: 'hsl(215 20% 52%)',
                lineHeight: 1.65,
                maxWidth: 360,
                fontFamily: "'Inter', sans-serif",
              }}>
                Gerencia técnica, compras, finanzas, nómina IMSS/ISR, control de calidad ISO 9001 y más — todo integrado en una plataforma construida para la industria de la construcción.
              </p>
            </div>

            {/* Stats abajo */}
            <div className="lr-stats" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 1,
              borderRadius: 12,
              overflow: 'hidden',
              border: '1px solid hsl(218 30% 20%)',
              background: 'hsl(218 30% 20%)',
            }}>
              {[
                { value: '10',        label: 'Módulos' },
                { value: 'SAT·IMSS', label: 'Integrado' },
                { value: 'ISO 9001',  label: 'Calidad' },
              ].map((s) => (
                <div key={s.label} style={{ background: 'hsl(218 38% 12%)', padding: '18px 16px', textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 700, color: '#00D1FF', letterSpacing: '-0.02em' }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 500, color: 'hsl(215 20% 42%)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 3 }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ════════════════════════════════════════════
            PANEL DERECHO — Formulario
        ════════════════════════════════════════════ */}
        <div className="lr-form" style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px',
          position: 'relative',
          background: 'hsl(218 40% 11%)',
        }}>

          {/* Divisor vertical con glow */}
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: 1,
            background: 'linear-gradient(to bottom, transparent 5%, hsl(192 100% 50% / 0.28) 35%, hsl(192 100% 50% / 0.28) 65%, transparent 95%)',
          }} className="hidden lg:block" />

          {/* Logo mobile */}
          <div className="flex lg:hidden flex-col items-center gap-3 mb-10">
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', inset: -12, borderRadius: '50%',
                background: 'radial-gradient(ellipse, hsl(192 100% 50% / 0.2) 0%, transparent 70%)',
                animation: 'glow-pulse 3s ease-in-out infinite',
              }} />
              <picture>
                <source srcSet="/logo-dark.svg" media="(prefers-color-scheme: dark)" />
                <img src="/favicon.svg" alt="Iretum" width={56} height={54} style={{ position: 'relative', zIndex: 1 }} />
              </picture>
            </div>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 26, fontWeight: 800, letterSpacing: '-0.04em', color: 'hsl(210 40% 96%)' }}>
              iretum
            </span>
            <span style={{ fontSize: 11, color: 'hsl(215 20% 45%)', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'Inter', sans-serif" }}>
              ERP Industrial · SaaS
            </span>
          </div>

          <div style={{ width: '100%', maxWidth: 336 }}>

            {/* Encabezado */}
            <div style={{ marginBottom: 38 }}>
              <h2 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 24, fontWeight: 700,
                letterSpacing: '-0.02em',
                color: 'hsl(210 40% 97%)',
                marginBottom: 6,
              }}>
                Acceso al sistema
              </h2>
              <p style={{ fontSize: 13, color: 'hsl(215 20% 45%)', fontFamily: "'Inter', sans-serif" }}>
                ERP Industrial · Plataforma de gestión
              </p>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '12px 14px', borderRadius: 10, marginBottom: 24,
                background: 'hsl(0 72% 51% / 0.08)',
                border: '1px solid hsl(0 72% 51% / 0.22)',
              }}>
                <AlertCircle style={{ width: 14, height: 14, color: 'hsl(0 72% 62%)', flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 12, color: 'hsl(0 72% 65%)', lineHeight: 1.55, fontFamily: "'Inter', sans-serif" }}>
                  {error}
                </span>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>

              <div>
                <label className="lr-label">Correo corporativo</label>
                <div className="lr-input-wrap">
                  <IconMail className="lr-input-icon" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@empresa.com"
                    required
                    id="login-email-input"
                    autoComplete="email"
                    className="lr-input"
                  />
                </div>
              </div>

              <div>
                <label className="lr-label">Contraseña</label>
                <div className="lr-input-wrap">
                  <IconLock className="lr-input-icon" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    id="login-password-input"
                    autoComplete="current-password"
                    className="lr-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                id="login-submit-btn"
                className="lr-submit"
                style={{ marginTop: 6 }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} />
                    Autenticando...
                  </>
                ) : (
                  'Ingresar →'
                )}
              </button>
            </form>

            {/* Separador */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '26px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'hsl(218 30% 20%)' }} />
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'hsl(215 20% 32%)', fontFamily: "'Inter', sans-serif" }}>o</span>
              <div style={{ flex: 1, height: 1, background: 'hsl(218 30% 20%)' }} />
            </div>

            {/* Demo */}
            <button type="button" onClick={loginDemo} className="lr-demo">
              ⚡ Explorar en modo demo
            </button>

            {/* Footer legal */}
            <p style={{
              marginTop: 36, textAlign: 'center',
              fontSize: 10, color: 'hsl(215 20% 28%)',
              lineHeight: 1.7, fontFamily: "'Inter', sans-serif",
            }}>
              Iretum® · ERP Industrial SaaS<br />
              Todos los derechos reservados
            </p>

          </div>
        </div>
      </div>
    </>
  );
};
