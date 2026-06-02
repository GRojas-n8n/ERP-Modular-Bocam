import React, { useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useTenant } from '../context/TenantContext';

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

const IconBuilding = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#050A12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

// ─── Partículas flotantes ──────────────────────────────────────────────────────
const PARTICLES: { top: string; left: string; size: number; dur: number; delay: number; color: string }[] = [
  { top: '7%',  left: '11%', size: 2, dur: 19, delay: 0,  color: 'rgba(0,209,255,0.55)' },
  { top: '14%', left: '80%', size: 1, dur: 23, delay: 3,  color: 'rgba(245,158,11,0.50)' },
  { top: '34%', left: '4%',  size: 2, dur: 16, delay: 7,  color: 'rgba(160,180,255,0.50)' },
  { top: '21%', left: '57%', size: 1, dur: 26, delay: 1,  color: 'rgba(0,209,255,0.40)' },
  { top: '63%', left: '91%', size: 2, dur: 21, delay: 5,  color: 'rgba(245,158,11,0.45)' },
  { top: '77%', left: '28%', size: 1, dur: 18, delay: 9,  color: 'rgba(0,209,255,0.50)' },
  { top: '46%', left: '73%', size: 2, dur: 24, delay: 2,  color: 'rgba(160,180,255,0.40)' },
  { top: '89%', left: '14%', size: 1, dur: 20, delay: 6,  color: 'rgba(245,158,11,0.35)' },
  { top: '54%', left: '44%', size: 2, dur: 17, delay: 11, color: 'rgba(0,209,255,0.45)' },
  { top: '28%', left: '94%', size: 1, dur: 22, delay: 4,  color: 'rgba(245,158,11,0.40)' },
  { top: '71%', left: '60%', size: 2, dur: 25, delay: 8,  color: 'rgba(160,180,255,0.55)' },
  { top: '9%',  left: '40%', size: 1, dur: 15, delay: 13, color: 'rgba(0,209,255,0.35)' },
];

// ─── Componente principal ─────────────────────────────────────────────────────
export const LoginView: React.FC = () => {
  const { login, loginDemo, loginError } = useTenant();
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLocalError(null);
    try {
      if (!DEFAULT_TENANT_ID) { setLocalError('Configuración inválida: falta VITE_DEFAULT_TENANT_ID.'); return; }
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
      {/* ─── Keyframes ─────────────────────────────────────────────────────── */}
      <style>{`
        @keyframes orb-1 {
          0%,100% { transform:translate(0,0) scale(1);   opacity:.30; }
          33%     { transform:translate(3%,-2%) scale(1.05); opacity:.38; }
          66%     { transform:translate(-2%,3%) scale(.96); opacity:.24; }
        }
        @keyframes orb-2 {
          0%,100% { transform:translate(0,0) scale(1);   opacity:.22; }
          40%     { transform:translate(-3%,2%) scale(1.06); opacity:.28; }
          70%     { transform:translate(2%,-3%) scale(.95); opacity:.16; }
        }
        @keyframes orb-3 {
          0%,100% { transform:translate(0,0) scale(1);   opacity:.14; }
          50%     { transform:translate(2%,-2%) scale(1.07); opacity:.20; }
        }
        @keyframes particle-float {
          0%,100% { transform:translateY(0)    translateX(0);   opacity:.35; }
          25%     { transform:translateY(-14px) translateX(7px); opacity:.70; }
          50%     { transform:translateY(-22px) translateX(-5px);opacity:.50; }
          75%     { transform:translateY(-9px)  translateX(9px); opacity:.60; }
        }
        @keyframes scan-line {
          0%   { transform:translateY(-4px); opacity:0; }
          5%   { opacity:1; }
          95%  { opacity:1; }
          100% { transform:translateY(100vh); opacity:0; }
        }
        @keyframes card-in {
          from { opacity:0; transform:translateY(28px) scale(.97); }
          to   { opacity:1; transform:translateY(0)    scale(1);   }
        }
        @keyframes card-glow {
          0%,100% { box-shadow: 0 0 0 1px rgba(0,209,255,.10), 0 32px 80px rgba(0,0,0,.70), 0 0 60px rgba(0,209,255,.06); }
          50%     { box-shadow: 0 0 0 1px rgba(0,209,255,.25), 0 32px 80px rgba(0,0,0,.70), 0 0 90px rgba(0,209,255,.13); }
        }
        @keyframes fade-up {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0);    }
        }
        @keyframes dot-blink {
          0%,100% { opacity:1; }
          50%     { opacity:.45; }
        }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes shimmer {
          0%   { background-position: 250% center; }
          100% { background-position: -250% center; }
        }

        /* ── Responsive: reducir espaciado en pantallas bajas ── */
        @media (max-height: 780px) {
          .lr-card-inner { padding: 28px 32px 24px !important; }
          .lr-logo       { margin-bottom: 18px !important; }
          .lr-sep        { margin-bottom: 16px !important; }
          .lr-heading    { margin-bottom: 16px !important; animation: none; opacity: 1; transform: none; }
          .lr-fields     { animation: none; opacity: 1; transform: none; }
        }
        @media (max-height: 640px) {
          .lr-card-inner { padding: 20px 24px 18px !important; }
          .lr-logo       { margin-bottom: 12px !important; }
          .lr-tagline    { display: none !important; }
        }

        .lr-tagline  { animation: fade-up  .75s cubic-bezier(.16,1,.3,1) .05s both; }
        .lr-card     { animation: card-in  .85s cubic-bezier(.16,1,.3,1) .18s both,
                                  card-glow 4.5s ease-in-out 1.2s infinite; }
        .lr-logo     { animation: fade-up  .65s cubic-bezier(.16,1,.3,1) .40s both; }
        .lr-heading  { animation: fade-up  .60s cubic-bezier(.16,1,.3,1) .52s both; }
        .lr-fields   { animation: fade-up  .60s cubic-bezier(.16,1,.3,1) .62s both; }

        .lr-input {
          width:100%; background:rgba(0,0,0,.28);
          border:1px solid rgba(255,255,255,.07); border-radius:12px;
          padding:13px 13px 13px 42px;
          color:hsl(210 40% 96%); font-size:14px;
          outline:none; transition:border-color .22s,background .22s,box-shadow .22s;
          font-family:'Inter',sans-serif; letter-spacing:.01em;
        }
        .lr-input::placeholder { color:rgba(255,255,255,.22); }
        .lr-input:focus {
          border-color:rgba(0,209,255,.45);
          background:rgba(0,209,255,.04);
          box-shadow:0 0 0 3px rgba(0,209,255,.09);
        }
        .lr-input-wrap { position:relative; }
        .lr-icon {
          position:absolute; left:14px; top:50%; transform:translateY(-50%);
          color:rgba(255,255,255,.25); pointer-events:none; transition:color .2s;
        }
        .lr-input-wrap:focus-within .lr-icon { color:rgba(0,209,255,.65); }
        .lr-label {
          display:block; font-size:10px; font-weight:600;
          letter-spacing:.12em; text-transform:uppercase;
          color:rgba(255,255,255,.35); margin-bottom:8px;
          font-family:'Inter',sans-serif;
        }

        .lr-btn {
          width:100%; height:52px; border-radius:14px; border:none;
          background:linear-gradient(110deg, #007FAA 0%, #00C8F0 30%, #7CF5FF 50%, #00C8F0 70%, #007FAA 100%);
          background-size:300% auto;
          color:#050A12; font-family:'Plus Jakarta Sans',sans-serif;
          font-size:14px; font-weight:700; letter-spacing:.04em; text-transform:uppercase;
          cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;
          transition:background-position .6s ease, box-shadow .3s ease, transform .15s ease;
          box-shadow:0 0 28px rgba(0,209,255,.38), 0 4px 16px rgba(0,0,0,.35);
        }
        .lr-btn:hover:not(:disabled) {
          background-position:right center;
          box-shadow:0 0 52px rgba(0,209,255,.65), 0 0 100px rgba(0,209,255,.22), 0 4px 16px rgba(0,0,0,.35);
          transform:translateY(-2px);
        }
        .lr-btn:active:not(:disabled) { transform:translateY(0); }
        .lr-btn:disabled { opacity:.55; cursor:not-allowed; }

        .lr-demo {
          width:100%; padding:13px;
          border-radius:12px; border:1px solid rgba(0,209,255,.18);
          background:transparent; color:rgba(0,209,255,.65);
          font-size:11px; font-weight:700; letter-spacing:.10em; text-transform:uppercase;
          cursor:pointer; font-family:'Inter',sans-serif;
          transition:all .22s ease;
        }
        .lr-demo:hover {
          background:rgba(0,209,255,.06); border-color:rgba(0,209,255,.40);
          color:rgba(0,209,255,.92);
        }
      `}</style>

      {/* ─── Stage ─────────────────────────────────────────────────────────── */}
      <div style={{
        position:'fixed', inset:0, background:'#050A12',
        display:'flex', alignItems:'flex-start', justifyContent:'center',
        overflowY:'auto', fontFamily:"'Inter',sans-serif",
        minHeight:'100vh',
      }}>

        {/* Orb 1 — cyan, arriba izquierda */}
        <div style={{
          position:'absolute', top:'-18%', left:'-10%',
          width:'75vw', height:'75vw', maxWidth:920, maxHeight:920,
          borderRadius:'50%',
          background:'radial-gradient(ellipse at center, rgba(0,175,225,.30) 0%, rgba(0,90,155,.12) 42%, transparent 70%)',
          animation:'orb-1 20s ease-in-out infinite',
          pointerEvents:'none',
        }} />

        {/* Orb 2 — índigo profundo, abajo derecha */}
        <div style={{
          position:'absolute', bottom:'-28%', right:'-14%',
          width:'68vw', height:'68vw', maxWidth:860, maxHeight:860,
          borderRadius:'50%',
          background:'radial-gradient(ellipse at center, rgba(50,50,210,.22) 0%, rgba(30,15,130,.08) 48%, transparent 72%)',
          animation:'orb-2 25s ease-in-out infinite 4s',
          pointerEvents:'none',
        }} />

        {/* Orb 3 — ámbar, centro-abajo (luz de obra) */}
        <div style={{
          position:'absolute', bottom:'-8%', left:'18%',
          width:'42vw', height:'42vw', maxWidth:580, maxHeight:580,
          borderRadius:'50%',
          background:'radial-gradient(ellipse at center, rgba(245,158,11,.16) 0%, rgba(200,95,0,.06) 48%, transparent 72%)',
          animation:'orb-3 15s ease-in-out infinite 7s',
          pointerEvents:'none',
        }} />

        {/* Grid de puntos */}
        <div style={{
          position:'absolute', inset:0, pointerEvents:'none',
          backgroundImage:'radial-gradient(rgba(255,255,255,.055) 1px, transparent 1px)',
          backgroundSize:'32px 32px',
        }} />

        {/* Viñeta perimetral */}
        <div style={{
          position:'absolute', inset:0, pointerEvents:'none',
          background:'radial-gradient(ellipse at 50% 50%, transparent 38%, rgba(2,4,10,.80) 100%)',
        }} />

        {/* Partículas flotantes */}
        {PARTICLES.map((p, i) => (
          <div key={i} style={{
            position:'absolute', top:p.top, left:p.left,
            width:p.size, height:p.size, borderRadius:'50%',
            background:p.color,
            animation:`particle-float ${p.dur}s ease-in-out infinite ${p.delay}s`,
            pointerEvents:'none',
          }} />
        ))}

        {/* Scan line */}
        <div style={{
          position:'absolute', left:0, right:0, height:1, pointerEvents:'none',
          background:'linear-gradient(90deg, transparent, rgba(0,209,255,.38) 28%, rgba(0,209,255,.70) 50%, rgba(0,209,255,.38) 72%, transparent)',
          animation:'scan-line 9s linear infinite 1.2s',
        }} />

        {/* ─── Contenido central ────────────────────────────────────────────── */}
        <div style={{ position:'relative', zIndex:10, width:'100%', maxWidth:448, padding:'28px 20px 32px', margin:'auto' }}>

          {/* Tagline — solo desktop */}
          <div className="lr-tagline hidden lg:block" style={{ textAlign:'center', marginBottom:26 }}>
            <h1 style={{
              fontFamily:"'Plus Jakarta Sans',sans-serif",
              fontSize:'clamp(34px,3.8vw,50px)', fontWeight:800,
              letterSpacing:'-.035em', lineHeight:1.1,
              color:'rgba(255,255,255,.92)', margin:0,
            }}>
              Control total<br/>
              <span style={{
                background:'linear-gradient(128deg, #00D1FF 0%, #7CF5FF 45%, #00AAEE 100%)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
              }}>de tu obra.</span>
            </h1>
            <p style={{ margin:'10px 0 0', fontSize:12, color:'rgba(255,255,255,.28)', letterSpacing:'.04em' }}>
              10 módulos · SAT / IMSS / ISO 9001
            </p>
          </div>

          {/* ─── GLASS CARD ───────────────────────────────────────────────── */}
          <div className="lr-card lr-card-inner" style={{
            backdropFilter:'blur(32px) saturate(180%)',
            WebkitBackdropFilter:'blur(32px) saturate(180%)',
            background:'rgba(5,10,22,.72)',
            borderRadius:28,
            borderTop:'1px solid rgba(255,255,255,.10)',
            borderLeft:'1px solid rgba(0,209,255,.12)',
            borderRight:'1px solid rgba(0,209,255,.08)',
            borderBottom:'1px solid rgba(0,209,255,.06)',
            padding:'42px 40px 34px',
          }}>

            {/* Logo + badge */}
            <div className="lr-logo" style={{ display:'flex', alignItems:'center', gap:12, marginBottom:28, transition:'margin .2s' }}>
              <div style={{
                position:'relative', width:42, height:42, borderRadius:13, flexShrink:0,
                background:'linear-gradient(135deg, #00D1FF 0%, #0077AA 100%)',
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'0 0 22px rgba(0,209,255,.50)',
              }}>
                <IconBuilding />
              </div>
              <div>
                <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:17, fontWeight:800, letterSpacing:'-.03em', color:'rgba(255,255,255,.93)', lineHeight:1.2 }}>
                  ERP Industrial
                </div>
                <div style={{ fontSize:9.5, color:'rgba(0,209,255,.60)', letterSpacing:'.13em', textTransform:'uppercase', fontWeight:600 }}>
                  Plataforma de Gestión
                </div>
              </div>
              {/* Dot live */}
              <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:6, padding:'4px 10px', borderRadius:20, border:'1px solid rgba(0,209,255,.20)', background:'rgba(0,209,255,.05)' }}>
                <span style={{ width:5, height:5, borderRadius:'50%', background:'#00D1FF', display:'inline-block', animation:'dot-blink 2s ease-in-out infinite' }} />
                <span style={{ fontSize:9, fontWeight:700, letterSpacing:'.10em', color:'rgba(0,209,255,.65)', textTransform:'uppercase' }}>Live</span>
              </div>
            </div>

            {/* Separador */}
            <div className="lr-sep" style={{ height:1, background:'linear-gradient(90deg, transparent, rgba(0,209,255,.15) 30%, rgba(255,255,255,.06) 70%, transparent)', marginBottom:26 }} />

            {/* Encabezado */}
            <div className="lr-heading" style={{ marginBottom:24 }}>
              <h2 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:22, fontWeight:700, letterSpacing:'-.02em', color:'rgba(255,255,255,.92)', margin:'0 0 5px' }}>
                Acceso al sistema
              </h2>
              <p style={{ fontSize:13, color:'rgba(255,255,255,.30)', margin:0 }}>
                Ingresa tus credenciales para continuar
              </p>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                display:'flex', alignItems:'flex-start', gap:10,
                padding:'12px 14px', borderRadius:12, marginBottom:20,
                background:'rgba(220,38,38,.09)', border:'1px solid rgba(220,38,38,.22)',
              }}>
                <AlertCircle style={{ width:14, height:14, color:'rgba(248,113,113,.9)', flexShrink:0, marginTop:1 }} />
                <span style={{ fontSize:12, color:'rgba(248,113,113,.85)', lineHeight:1.55, fontFamily:"'Inter',sans-serif" }}>
                  {error}
                </span>
              </div>
            )}

            {/* Formulario */}
            <div className="lr-fields">
              <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:20 }}>
                <div>
                  <label className="lr-label">Correo corporativo</label>
                  <div className="lr-input-wrap">
                    <IconMail className="lr-icon" />
                    <input
                      type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="usuario@empresa.com" required
                      id="login-email-input" autoComplete="email"
                      className="lr-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="lr-label">Contraseña</label>
                  <div className="lr-input-wrap">
                    <IconLock className="lr-icon" />
                    <input
                      type="password" value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••" required
                      id="login-password-input" autoComplete="current-password"
                      className="lr-input"
                    />
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting} id="login-submit-btn" className="lr-btn" style={{ marginTop:4 }}>
                  {isSubmitting ? (
                    <><Loader2 style={{ width:15, height:15, animation:'spin 1s linear infinite' }} /> Autenticando...</>
                  ) : 'Ingresar →'}
                </button>
              </form>

              {/* Separador */}
              <div style={{ display:'flex', alignItems:'center', gap:12, margin:'22px 0' }}>
                <div style={{ flex:1, height:1, background:'rgba(255,255,255,.06)' }} />
                <span style={{ fontSize:10, fontWeight:600, letterSpacing:'.10em', textTransform:'uppercase', color:'rgba(255,255,255,.20)', fontFamily:"'Inter',sans-serif" }}>o</span>
                <div style={{ flex:1, height:1, background:'rgba(255,255,255,.06)' }} />
              </div>

              {/* Demo */}
              <button type="button" onClick={loginDemo} className="lr-demo">
                ⚡ Explorar en modo demo
              </button>
            </div>

            {/* Footer */}
            <p style={{ marginTop:26, textAlign:'center', fontSize:10, color:'rgba(255,255,255,.14)', lineHeight:1.75, fontFamily:"'Inter',sans-serif" }}>
              Sistema ERP Industrial · Uso interno exclusivo
            </p>

          </div>{/* /glass card */}
        </div>{/* /content */}
      </div>{/* /stage */}
    </>
  );
};
