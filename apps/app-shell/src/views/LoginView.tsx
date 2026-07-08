import React, { useState, useRef, useEffect } from 'react';
import { AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
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

// ─── Partículas — más grandes y con glow ─────────────────────────────────────
const PARTICLES: { top: string; left: string; size: number; dur: number; delay: number; glow: string; color: string }[] = [
  { top:'8%',  left:'9%',  size:3, dur:15, delay:0,  color:'rgba(0,220,255,1)',   glow:'0 0 5px 2px rgba(0,220,255,0.55)' },
  { top:'13%', left:'82%', size:2, dur:19, delay:3,  color:'rgba(255,170,30,1)',  glow:'0 0 4px 1px rgba(255,170,30,0.50)' },
  { top:'35%', left:'5%',  size:3, dur:13, delay:7,  color:'rgba(130,160,255,1)', glow:'0 0 5px 2px rgba(130,160,255,0.50)' },
  { top:'20%', left:'56%', size:2, dur:21, delay:1,  color:'rgba(0,220,255,1)',   glow:'0 0 4px 1px rgba(0,220,255,0.45)' },
  { top:'62%', left:'90%', size:3, dur:17, delay:5,  color:'rgba(255,170,30,1)',  glow:'0 0 5px 2px rgba(255,170,30,0.50)' },
  { top:'76%', left:'27%', size:2, dur:14, delay:9,  color:'rgba(0,220,255,1)',   glow:'0 0 4px 1px rgba(0,220,255,0.50)' },
  { top:'47%', left:'72%', size:3, dur:20, delay:2,  color:'rgba(130,160,255,1)', glow:'0 0 5px 1px rgba(130,160,255,0.42)' },
  { top:'88%', left:'15%', size:2, dur:16, delay:6,  color:'rgba(255,170,30,1)',  glow:'0 0 4px 1px rgba(255,170,30,0.45)' },
  { top:'53%', left:'43%', size:3, dur:14, delay:11, color:'rgba(0,220,255,1)',   glow:'0 0 5px 2px rgba(0,220,255,0.50)' },
  { top:'27%', left:'93%', size:2, dur:18, delay:4,  color:'rgba(255,170,30,1)',  glow:'0 0 4px 1px rgba(255,170,30,0.45)' },
  { top:'70%', left:'61%', size:3, dur:20, delay:8,  color:'rgba(130,160,255,1)', glow:'0 0 5px 2px rgba(130,160,255,0.50)' },
  { top:'10%', left:'39%', size:2, dur:12, delay:13, color:'rgba(0,220,255,1)',   glow:'0 0 4px 1px rgba(0,220,255,0.45)' },
];

// ─── Componente principal ─────────────────────────────────────────────────────
export const LoginView: React.FC = () => {
  const { login, loginDemo, loginError } = useTenant();
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // ── Reacción de partículas al mouse ──────────────────────────────────────
  const mouseRef      = useRef({ x: -9999, y: -9999 });
  const particleRefs  = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('mousemove', onMove, { passive: true });

    let raf: number;
    const RADIUS = 110; // px — radio de influencia
    const FORCE  = 22;  // px — desplazamiento máximo

    const tick = () => {
      particleRefs.current.forEach(el => {
        if (!el) return;
        const r  = el.getBoundingClientRect();
        const cx = r.left + r.width  / 2;
        const cy = r.top  + r.height / 2;
        const dx = cx - mouseRef.current.x;
        const dy = cy - mouseRef.current.y;
        const d  = Math.hypot(dx, dy);
        if (d < RADIUS && d > 0) {
          const f  = (1 - d / RADIUS) * FORCE;
          const ox = (dx / d) * f;
          const oy = (dy / d) * f;
          el.style.translate = `${ox}px ${oy}px`;
        } else {
          el.style.translate = '0px 0px';
        }
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

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
      <style>{`
        /* ── Orbes ─────────────────────────────────────────────────────── */
        @keyframes orb-1 {
          0%,100% { transform:translate(0,0) scale(1);      opacity:.38; }
          33%     { transform:translate(4%,-3%) scale(1.06); opacity:.45; }
          66%     { transform:translate(-3%,4%) scale(.95);  opacity:.30; }
        }
        @keyframes orb-2 {
          0%,100% { transform:translate(0,0) scale(1);       opacity:.30; }
          40%     { transform:translate(-4%,3%) scale(1.07); opacity:.38; }
          70%     { transform:translate(3%,-4%) scale(.94);  opacity:.22; }
        }
        @keyframes orb-3 {
          0%,100% { transform:translate(0,0) scale(1);      opacity:.22; }
          50%     { transform:translate(3%,-3%) scale(1.08); opacity:.30; }
        }

        /* ── Partículas ─────────────────────────────────────────────────── */
        @keyframes particle-float {
          0%,100% { transform:translateY(0)    translateX(0);    opacity:.45; }
          25%     { transform:translateY(-14px) translateX(7px);  opacity:.82; }
          50%     { transform:translateY(-22px) translateX(-5px); opacity:.62; }
          75%     { transform:translateY(-9px)  translateX(9px);  opacity:.72; }
        }

        /* ── Logo glow ──────────────────────────────────────────────────── */
        /* Separar pulso (opacity) de hover (transform) para evitar conflictos */
        @keyframes logo-pulse {
          0%,100% { opacity:.48; }
          50%     { opacity:.78; }
        }
        .lr-logo-wrap { position:relative; flex-shrink:0; }
        /* Capa exterior: solo maneja el scale del hover via transition */
        .lr-glow-outer {
          position:absolute; inset:-12px; border-radius:50%;
          transition:transform .55s cubic-bezier(.16,1,.3,1);
          pointer-events:none;
        }
        /* Capa interior: solo maneja el pulso via animation (opacity) */
        .lr-glow-inner {
          position:absolute; inset:0; border-radius:50%;
          background:radial-gradient(ellipse at 50% 50%, rgba(0,209,255,.40) 0%, rgba(0,150,230,.16) 48%, transparent 72%);
          animation:logo-pulse 3s ease-in-out infinite;
        }
        /* Logo img: crece suavemente en hover */
        .lr-logo-img {
          position:relative; z-index:1; display:block;
          transition:transform .55s cubic-bezier(.16,1,.3,1);
        }
        .lr-logo-wrap:hover .lr-glow-outer { transform:scale(1.55); }
        .lr-logo-wrap:hover .lr-logo-img   { transform:scale(1.07); }

        /* ── Card ───────────────────────────────────────────────────────── */
        @keyframes card-in {
          from { opacity:0; transform:translateY(30px) scale(.97); }
          to   { opacity:1; transform:translateY(0)    scale(1);   }
        }
        @keyframes card-glow {
          0%,100% { box-shadow:0 0 0 1px rgba(0,209,255,.12), 0 32px 80px rgba(0,0,0,.72), 0 0 70px rgba(0,209,255,.08); }
          50%     { box-shadow:0 0 0 1px rgba(0,209,255,.30), 0 32px 80px rgba(0,0,0,.72), 0 0 110px rgba(0,209,255,.18); }
        }
        @keyframes fade-up {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes dot-blink {
          0%,100% { opacity:1; }
          50%     { opacity:.4; }
        }
        @keyframes spin { to { transform:rotate(360deg); } }

        .lr-tagline { animation:fade-up .75s cubic-bezier(.16,1,.3,1) .05s both; }
        .lr-card    { animation:card-in .85s cubic-bezier(.16,1,.3,1) .18s both,
                                card-glow 4.5s ease-in-out 1.2s infinite; }
        .lr-logo    { animation:fade-up .65s cubic-bezier(.16,1,.3,1) .40s both; }
        .lr-heading { animation:fade-up .60s cubic-bezier(.16,1,.3,1) .52s both; }
        .lr-fields  { animation:fade-up .60s cubic-bezier(.16,1,.3,1) .62s both; }

        /* ── Inputs ─────────────────────────────────────────────────────── */
        .lr-input {
          width:100%; background:rgba(0,0,0,.30);
          border:1px solid rgba(255,255,255,.08); border-radius:12px;
          padding:13px 13px 13px 42px;
          color:hsl(210 40% 96%); font-size:14px; outline:none;
          transition:border-color .22s, background .22s, box-shadow .22s;
          font-family:'Inter',sans-serif;
        }
        .lr-input::placeholder { color:rgba(255,255,255,.22); }
        .lr-input:focus {
          border-color:rgba(0,209,255,.50);
          background:rgba(0,209,255,.05);
          box-shadow:0 0 0 3px rgba(0,209,255,.10);
        }
        .lr-input-wrap { position:relative; }
        .lr-icon {
          position:absolute; left:14px; top:50%; transform:translateY(-50%);
          color:rgba(255,255,255,.26); pointer-events:none; transition:color .2s;
        }
        .lr-input-wrap:focus-within .lr-icon { color:rgba(0,209,255,.70); }
        .lr-input-pw { padding-right:42px; }
        .lr-icon-toggle {
          position:absolute; right:10px; top:50%; transform:translateY(-50%);
          display:flex; align-items:center; justify-content:center;
          width:28px; height:28px; padding:0; border:none; background:transparent;
          color:rgba(255,255,255,.30); cursor:pointer; border-radius:8px;
          transition:color .2s, background .2s;
        }
        .lr-icon-toggle:hover { color:rgba(0,209,255,.75); background:rgba(0,209,255,.08); }
        .lr-icon-toggle:focus-visible { outline:2px solid rgba(0,209,255,.50); outline-offset:1px; }
        .lr-label {
          display:block; font-size:10px; font-weight:600;
          letter-spacing:.12em; text-transform:uppercase;
          color:rgba(255,255,255,.36); margin-bottom:8px;
          font-family:'Inter',sans-serif;
        }

        /* ── Botón principal ─────────────────────────────────────────────── */
        .lr-btn {
          width:100%; height:52px; border-radius:14px; border:none;
          background:linear-gradient(110deg,#007FAA 0%,#00C8F0 30%,#7CF5FF 50%,#00C8F0 70%,#007FAA 100%);
          background-size:300% auto;
          color:#050A12; font-family:'Plus Jakarta Sans',sans-serif;
          font-size:14px; font-weight:700; letter-spacing:.04em; text-transform:uppercase;
          cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;
          transition:background-position .6s ease, box-shadow .3s ease, transform .15s ease;
          box-shadow:0 0 30px rgba(0,209,255,.42), 0 4px 16px rgba(0,0,0,.35);
        }
        .lr-btn:hover:not(:disabled) {
          background-position:right center;
          box-shadow:0 0 56px rgba(0,209,255,.70), 0 0 110px rgba(0,209,255,.25), 0 4px 16px rgba(0,0,0,.35);
          transform:translateY(-2px);
        }
        .lr-btn:active:not(:disabled) { transform:translateY(0); }
        .lr-btn:disabled { opacity:.55; cursor:not-allowed; }

        /* ── Botón demo ──────────────────────────────────────────────────── */
        .lr-demo {
          width:100%; padding:13px; border-radius:12px;
          border:1px solid rgba(0,209,255,.20); background:transparent;
          color:rgba(0,209,255,.68); font-size:11px; font-weight:700;
          letter-spacing:.10em; text-transform:uppercase;
          cursor:pointer; font-family:'Inter',sans-serif; transition:all .22s;
        }
        .lr-demo:hover {
          background:rgba(0,209,255,.07); border-color:rgba(0,209,255,.44);
          color:rgba(0,209,255,.95);
        }

        /* ── Responsive por altura ───────────────────────────────────────── */
        @media (max-height: 780px) {
          .lr-card-pad  { padding:28px 32px 22px !important; }
          .lr-logo-mb   { margin-bottom:16px !important; }
          .lr-sep-mb    { margin-bottom:14px !important; }
          .lr-heading   { animation:none; opacity:1; transform:none; margin-bottom:16px !important; }
          .lr-fields    { animation:none; opacity:1; transform:none; }
        }
        @media (max-height: 620px) {
          .lr-card-pad  { padding:18px 24px 16px !important; }
          .lr-logo-mb   { margin-bottom:10px !important; }
          .lr-tagline   { display:none !important; }
        }

        /* ── Responsive por ancho ────────────────────────────────────────── */
        @media (max-width: 480px) {
          .lr-card-pad { padding:28px 24px 24px !important; }
        }
      `}</style>

      {/* ── Capa de efectos — FIXED, sin interacción ─────────────────────── */}
      <div style={{ position:'fixed', inset:0, background:'#050A12', pointerEvents:'none', zIndex:0, overflow:'hidden' }}>

        {/* Orb 1 — cian, cuadrante superior izquierdo */}
        <div style={{
          position:'absolute', top:'-5%', left:'-5%',
          width:'60vw', height:'60vw', maxWidth:780, maxHeight:780,
          borderRadius:'50%',
          background:'radial-gradient(ellipse at 40% 40%, rgba(0,200,255,.38) 0%, rgba(0,120,200,.15) 40%, transparent 70%)',
          animation:'orb-1 20s ease-in-out infinite',
          filter:'blur(4px)',
        }} />

        {/* Orb 2 — índigo, cuadrante inferior derecho */}
        <div style={{
          position:'absolute', bottom:'-10%', right:'-8%',
          width:'58vw', height:'58vw', maxWidth:750, maxHeight:750,
          borderRadius:'50%',
          background:'radial-gradient(ellipse at 60% 60%, rgba(80,70,240,.30) 0%, rgba(50,30,180,.12) 42%, transparent 72%)',
          animation:'orb-2 24s ease-in-out infinite 4s',
          filter:'blur(4px)',
        }} />

        {/* Orb 3 — ámbar, zona central-inferior */}
        <div style={{
          position:'absolute', bottom:'5%', left:'22%',
          width:'38vw', height:'38vw', maxWidth:520, maxHeight:520,
          borderRadius:'50%',
          background:'radial-gradient(ellipse at 50% 50%, rgba(255,155,20,.24) 0%, rgba(220,90,0,.09) 44%, transparent 72%)',
          animation:'orb-3 15s ease-in-out infinite 7s',
          filter:'blur(3px)',
        }} />

        {/* Grid de puntos */}
        <div style={{
          position:'absolute', inset:0,
          backgroundImage:'radial-gradient(rgba(255,255,255,.06) 1px, transparent 1px)',
          backgroundSize:'32px 32px',
        }} />

        {/* Viñeta perimetral */}
        <div style={{
          position:'absolute', inset:0,
          background:'radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(2,4,10,.82) 100%)',
        }} />

        {/* Partículas con glow + reacción al mouse */}
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            ref={el => { particleRefs.current[i] = el; }}
            style={{
              position:'absolute', top:p.top, left:p.left,
              width:p.size, height:p.size, borderRadius:'50%',
              background:p.color, boxShadow:p.glow,
              animation:`particle-float ${p.dur}s ease-in-out infinite ${p.delay}s`,
              transition:'translate .35s cubic-bezier(.25,.46,.45,.94)',
            }}
          />
        ))}

      </div>

      {/* ── Capa de contenido — flujo normal, scroll si es necesario ─────── */}
      <div style={{
        position:'relative', zIndex:10,
        minHeight:'100vh',
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:'28px 20px',
        boxSizing:'border-box',
      }}>
        <div style={{ width:'100%', maxWidth:448 }}>

          {/* Tagline — solo desktop (lg) */}
          <div className="lr-tagline hidden lg:block" style={{ textAlign:'center', marginBottom:26 }}>
            <h1 style={{
              fontFamily:"'Plus Jakarta Sans',sans-serif",
              fontSize:'clamp(32px,3.6vw,48px)', fontWeight:800,
              letterSpacing:'-.035em', lineHeight:1.1,
              color:'rgba(255,255,255,.92)', margin:0,
            }}>
              Control total<br/>
              <span style={{
                background:'linear-gradient(128deg, #00D1FF 0%, #7CF5FF 45%, #00AAEE 100%)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
              }}>de tu obra.</span>
            </h1>
            <p style={{ margin:'10px 0 0', fontSize:12, color:'rgba(255,255,255,.30)', letterSpacing:'.04em' }}>
              10 módulos · SAT / IMSS / ISO 9001
            </p>
          </div>

          {/* ── GLASS CARD ──────────────────────────────────────────────── */}
          <div className="lr-card lr-card-pad" style={{
            backdropFilter:'blur(32px) saturate(180%)',
            WebkitBackdropFilter:'blur(32px) saturate(180%)',
            background:'rgba(5,10,22,.74)',
            borderRadius:28,
            borderTop:'1px solid rgba(255,255,255,.11)',
            borderLeft:'1px solid rgba(0,209,255,.14)',
            borderRight:'1px solid rgba(0,209,255,.08)',
            borderBottom:'1px solid rgba(0,209,255,.06)',
            padding:'42px 40px 34px',
          }}>

            {/* Logo + badge */}
            <div className="lr-logo lr-logo-mb" style={{ display:'flex', alignItems:'center', gap:12, marginBottom:28 }}>
              {/* Logo iretum — glow exterior (escala en hover) + pulso interior (opacity) */}
              <div className="lr-logo-wrap">
                <div className="lr-glow-outer">
                  <div className="lr-glow-inner" />
                </div>
                <img
                  src="/favicon.svg"
                  alt="iretum"
                  className="lr-logo-img"
                  style={{ width:42, height:42, borderRadius:10, objectFit:'contain' }}
                />
              </div>
              <div>
                <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:17, fontWeight:800, letterSpacing:'-.03em', color:'rgba(255,255,255,.93)', lineHeight:1.2 }}>
                  ERP Industrial
                </div>
                <div style={{ fontSize:9.5, color:'rgba(0,209,255,.65)', letterSpacing:'.13em', textTransform:'uppercase', fontWeight:600 }}>
                  Plataforma de Gestión
                </div>
              </div>
              <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:6, padding:'4px 10px', borderRadius:20, border:'1px solid rgba(0,209,255,.22)', background:'rgba(0,209,255,.06)' }}>
                <span style={{ width:5, height:5, borderRadius:'50%', background:'#00D1FF', display:'inline-block', boxShadow:'0 0 6px rgba(0,209,255,.8)', animation:'dot-blink 2s ease-in-out infinite' }} />
                <span style={{ fontSize:9, fontWeight:700, letterSpacing:'.10em', color:'rgba(0,209,255,.70)', textTransform:'uppercase' }}>Live</span>
              </div>
            </div>

            {/* Separador */}
            <div className="lr-sep-mb" style={{ height:1, background:'linear-gradient(90deg, transparent, rgba(0,209,255,.18) 30%, rgba(255,255,255,.07) 70%, transparent)', marginBottom:26 }} />

            {/* Encabezado */}
            <div className="lr-heading" style={{ marginBottom:24 }}>
              <h2 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:22, fontWeight:700, letterSpacing:'-.02em', color:'rgba(255,255,255,.92)', margin:'0 0 5px' }}>
                Acceso al sistema
              </h2>
              <p style={{ fontSize:13, color:'rgba(255,255,255,.32)', margin:0 }}>
                Ingresa tus credenciales para continuar
              </p>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                display:'flex', alignItems:'flex-start', gap:10,
                padding:'12px 14px', borderRadius:12, marginBottom:20,
                background:'rgba(220,38,38,.09)', border:'1px solid rgba(220,38,38,.24)',
              }}>
                <AlertCircle style={{ width:14, height:14, color:'rgba(248,113,113,.9)', flexShrink:0, marginTop:1 }} />
                <span style={{ fontSize:12, color:'rgba(248,113,113,.88)', lineHeight:1.55, fontFamily:"'Inter',sans-serif" }}>
                  {error}
                </span>
              </div>
            )}

            {/* Form + botones */}
            <div className="lr-fields">
              <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:20 }}>
                <div>
                  <label className="lr-label">Correo corporativo</label>
                  <div className="lr-input-wrap">
                    <IconMail className="lr-icon" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="usuario@empresa.com" required
                      id="login-email-input" autoComplete="email" className="lr-input" />
                  </div>
                </div>
                <div>
                  <label className="lr-label">Contraseña</label>
                  <div className="lr-input-wrap">
                    <IconLock className="lr-icon" />
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••" required
                      id="login-password-input" autoComplete="current-password" className="lr-input lr-input-pw" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="lr-icon-toggle"
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff style={{ width:16, height:16 }} /> : <Eye style={{ width:16, height:16 }} />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={isSubmitting} id="login-submit-btn" className="lr-btn" style={{ marginTop:4 }}>
                  {isSubmitting
                    ? <><Loader2 style={{ width:15, height:15, animation:'spin 1s linear infinite' }} /> Autenticando...</>
                    : 'Ingresar →'}
                </button>
              </form>

              <div style={{ display:'flex', alignItems:'center', gap:12, margin:'22px 0' }}>
                <div style={{ flex:1, height:1, background:'rgba(255,255,255,.06)' }} />
                <span style={{ fontSize:10, fontWeight:600, letterSpacing:'.10em', textTransform:'uppercase', color:'rgba(255,255,255,.22)', fontFamily:"'Inter',sans-serif" }}>o</span>
                <div style={{ flex:1, height:1, background:'rgba(255,255,255,.06)' }} />
              </div>

              <button type="button" onClick={loginDemo} className="lr-demo">
                ⚡ Explorar en modo demo
              </button>
            </div>

            <p style={{ marginTop:26, textAlign:'center', fontSize:10, color:'rgba(255,255,255,.14)', lineHeight:1.75, fontFamily:"'Inter',sans-serif" }}>
              Sistema ERP Industrial · Uso interno exclusivo
            </p>

          </div>
        </div>
      </div>
    </>
  );
};
