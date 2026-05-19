import React, { useEffect, useState } from 'react';
import { Button, SectionBadge, cn } from '@bocam/ui-core';
import {
  IconDashboard,
  IconBriefcase,
  IconShoppingCart,
  IconWallet,
  IconFileText,
  IconUsers,
  IconShieldCheck,
  IconChevronRight,
  IconLogOut,
  IconSettings,
  IconMenu,
  IconX,
} from './Icons';
import { useTenant } from '../context/TenantContext';

// ─── Iconos de tema ───────────────────────────────────────────────────────────
const IconSun = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className={className}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);

const IconMoon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className={className}>
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

// ─── Hook de tema ─────────────────────────────────────────────────────────────
function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('iretum-theme') === 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.setAttribute('data-theme', 'dark');
      localStorage.setItem('iretum-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
      localStorage.setItem('iretum-theme', 'light');
    }
  }, [isDark]);

  return { isDark, toggle: () => setIsDark(d => !d) };
}

// ─── Nav items ───────────────────────────────────────────────────────────────
const ALL_NAV_ITEMS = [
  { name: 'Dashboard',       icon: IconDashboard,   id: 'dashboard',    roles: [] },
  { name: 'Gerencia Tecnica',icon: IconBriefcase,   id: 'insumos',      roles: ['gerencia_tecnica'] },
  { name: 'Compras',         icon: IconShoppingCart,id: 'compras',      roles: ['compras'] },
  { name: 'Finanzas',        icon: IconWallet,      id: 'finanzas',     roles: ['finanzas'] },
  { name: 'Contabilidad',    icon: IconFileText,    id: 'contabilidad', roles: ['contabilidad'] },
  { name: 'Control de Obra', icon: IconFileText,    id: 'control-obra', roles: ['control_obra'] },
  { name: 'Personal',        icon: IconUsers,       id: 'personal',     roles: ['personal_rh'] },
  { name: 'Seguridad HSE',   icon: IconShieldCheck, id: 'seguridad',    roles: ['seguridad_hse'] },
  { name: 'Ventas',          icon: IconShoppingCart,id: 'ventas',       roles: ['ventas'] },
  { name: 'Administracion',  icon: IconSettings,    id: 'admin',        roles: ['admin'] },
];

interface LayoutProps {
  children: React.ReactNode;
  onNavigate: (view: string) => void;
  currentView: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, onNavigate, currentView }) => {
  const { tenant, user, logout } = useTenant();
  const { isDark, toggle: toggleTheme } = useTheme();
  const userRoles: string[] = user?.role ?? [];
  const isAdmin = userRoles.includes('admin');
  const navItems = ALL_NAV_ITEMS.filter(item =>
    item.roles.length === 0 || isAdmin || item.roles.some(r => userRoles.includes(r))
  );
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!isMobileNavOpen) return undefined;
    const prev = document.body.style.overflow;
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsMobileNavOpen(false); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onEsc);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onEsc); };
  }, [isMobileNavOpen]);

  const handleNavigate = (view: string) => { onNavigate(view); setIsMobileNavOpen(false); };
  const handleLogout   = () => { setIsMobileNavOpen(false); logout(); };
  const currentProject = user?.projects?.[0];
  const userInitial    = user?.name?.charAt(0)?.toUpperCase() || 'U';

  // ─── Sidebar ─────────────────────────────────────────────────────────────
  const renderSidebarContent = () => (
    <div className="flex h-full flex-col" style={{ background: 'hsl(var(--card))' }}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
        <div className="relative shrink-0">
          {isDark && (
            <div style={{
              position: 'absolute', inset: -6, borderRadius: '50%',
              background: 'radial-gradient(ellipse, hsl(var(--primary) / 0.25) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
          )}
          <img src="/favicon.svg" alt="Iretum" width={30} height={29} style={{ position: 'relative', zIndex: 1 }} />
        </div>
        <div className="flex min-w-0 flex-col">
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.03em' }}
            className="text-base font-bold text-foreground leading-tight">
            iretum
          </span>
          <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground opacity-60 truncate">
            {tenant?.name || 'ERP Industrial'}
          </span>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto px-3 py-5" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map((item) => {
          const active = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={cn(
                'group relative flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200',
                active
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              )}
              style={active ? {
                background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%)',
                boxShadow: '0 4px 12px hsl(var(--primary) / 0.3)',
              } : {}}
            >
              <item.icon className={cn('h-4 w-4 shrink-0', active ? 'opacity-100' : 'opacity-60 group-hover:opacity-100 group-hover:text-primary transition-all')} />
              <span className="truncate">{item.name}</span>
              {active && (
                <div className="absolute right-3 h-1.5 w-1.5 rounded-full bg-white/60" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Usuario */}
      <div className="border-t p-3" style={{ borderColor: 'hsl(var(--border))' }}>
        <div className="mb-2 flex items-center gap-3 rounded-xl p-3"
          style={{ background: 'hsl(var(--muted) / 0.5)' }}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-primary-foreground"
            style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.7) 100%)' }}>
            {userInitial}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold text-foreground leading-tight">{user?.name}</span>
            <span className="truncate text-[10px] text-muted-foreground opacity-70">{user?.email}</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          id="logout-btn"
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-destructive transition-all hover:bg-destructive/10"
        >
          <IconLogOut className="h-4 w-4" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans">

      {/* ── Sidebar desktop ── */}
      <aside className="z-20 hidden w-60 flex-col border-r shadow-sm md:flex overflow-hidden"
        style={{ borderColor: 'hsl(var(--border))' }}>
        {renderSidebarContent()}
      </aside>

      {/* ── Sidebar mobile overlay ── */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Cerrar navegacion"
            className="absolute inset-0 bg-black/50 glass"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <aside className="relative z-10 flex h-full w-72 max-w-[85vw] flex-col border-r shadow-2xl overflow-hidden"
            style={{ borderColor: 'hsl(var(--border))' }}>
            <div className="flex items-center justify-end px-3 pt-3">
              <button
                type="button"
                aria-label="Cerrar menu"
                onClick={() => setIsMobileNavOpen(false)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <IconX className="h-5 w-5" />
              </button>
            </div>
            {renderSidebarContent()}
          </aside>
        </div>
      )}

      {/* ── Contenido principal ── */}
      <div className="relative flex flex-1 flex-col overflow-hidden min-w-0">

        {/* Header */}
        <header className="z-10 flex h-14 items-center justify-between border-b glass px-4 md:px-6"
          style={{
            background: 'hsl(var(--card) / 0.8)',
            borderColor: 'hsl(var(--border))',
            backdropFilter: 'blur(16px)',
          }}>

          {/* Izquierda: hamburger + breadcrumb */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              aria-label="Abrir navegacion"
              onClick={() => setIsMobileNavOpen(true)}
              className="mr-1 rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors md:hidden shrink-0"
            >
              <IconMenu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground min-w-0">
              <IconBriefcase className="h-3.5 w-3.5 shrink-0 opacity-50" />
              <span className="hidden sm:inline opacity-60 shrink-0">Proyectos</span>
              <IconChevronRight className="h-3 w-3 opacity-30 shrink-0" />
              <span className="rounded-md px-2 py-1 text-foreground font-bold truncate"
                style={{ background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))' }}>
                {currentProject?.code || 'Sin Proyecto'}
              </span>
            </div>
          </div>

          {/* Derecha: badge + toggle tema + settings */}
          <div className="flex items-center gap-2 shrink-0">
            <SectionBadge className="hidden border-green-500/20 bg-green-500/10 text-green-600 md:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              Sistema sincronizado
            </SectionBadge>

            {/* Toggle tema */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
              title={isDark ? 'Tema claro' : 'Tema oscuro'}
            >
              {isDark
                ? <IconSun className="h-4 w-4 text-yellow-400" />
                : <IconMoon className="h-4 w-4" />
              }
            </button>

            <Button variant="outline" size="icon" className="group h-8 w-8">
              <IconSettings className="h-4 w-4 text-muted-foreground transition-transform duration-500 group-hover:rotate-90" />
            </Button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8"
          style={{ background: 'hsl(var(--background))' }}>
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
