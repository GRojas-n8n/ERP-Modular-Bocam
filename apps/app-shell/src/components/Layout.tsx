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
  IconClipboardCheck,
  IconPackage,
  IconLayers,
  IconClock,
  IconCheckCircle2,
  IconAlertCircle,
  IconTrendingUp,
  IconActivity,
  IconQrCode,
  IconUserCheck,
  IconScale,
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
type SubItem = {
  id: string;
  label: string;
  icon: React.FC<{ className?: string }>;
  roles?: string[];
};

type NavItem = {
  name: string;
  icon: React.FC<{ className?: string }>;
  id: string;
  roles: string[];
  subItems?: SubItem[];
};

const ALL_NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', icon: IconDashboard, id: 'dashboard', roles: [] },
  {
    name: 'Gerencia Técnica', icon: IconBriefcase, id: 'insumos',
    roles: ['gerencia_tecnica'],
    subItems: [
      { id: 'catalogo', label: 'Catálogo de Obra', icon: IconBriefcase },
      { id: 'insumos',  label: 'Insumos',          icon: IconPackage },
    ],
  },
  {
    name: 'Compras', icon: IconShoppingCart, id: 'compras',
    roles: ['compras', 'procurement', 'residencia', 'resident', 'gerencia_tecnica', 'superintendent'],
    subItems: [
      { id: 'requisiciones',   label: 'Requisiciones', icon: IconShoppingCart, roles: ['compras', 'procurement', 'superintendent'] },
      { id: 'catalogo',        label: 'Catálogo',       icon: IconPackage,      roles: ['compras', 'procurement', 'superintendent'] },
      { id: 'almacen',         label: 'Almacén',        icon: IconLayers,       roles: ['compras', 'procurement', 'superintendent'] },
      { id: 'proveedores',     label: 'Proveedores',    icon: IconUsers,        roles: ['compras', 'procurement', 'superintendent'] },
      { id: 'pendientes-eval', label: 'Eval. Técnica',  icon: IconClock,        roles: ['resident', 'residencia', 'superintendent'] },
      { id: 'pendientes-gt',   label: 'Aprob. GT',      icon: IconCheckCircle2, roles: ['gerencia_tecnica', 'superintendent'] },
      { id: 'trazabilidad',    label: 'Trazabilidad',   icon: IconScale,        roles: ['compras', 'procurement', 'superintendent', 'gerencia_tecnica'] },
    ],
  },
  { name: 'Finanzas',     icon: IconWallet,         id: 'finanzas',     roles: ['finanzas'] },
  { name: 'Contabilidad', icon: IconFileText,        id: 'contabilidad', roles: ['contabilidad'] },
  {
    name: 'Control de Obra', icon: IconFileText, id: 'control-obra',
    roles: ['control_obra'],
    subItems: [
      { id: 'bitacoras',    label: 'Bitácoras',       icon: IconFileText },
      { id: 'avances',      label: 'Avances Físicos', icon: IconTrendingUp },
      { id: 'estimaciones', label: 'Estimaciones',    icon: IconActivity },
    ],
  },
  {
    name: 'Residencia', icon: IconClipboardCheck, id: 'residencia',
    roles: ['residencia', 'control_obra'],
    subItems: [
      { id: 'estimaciones',  label: 'Estimaciones',    icon: IconFileText },
      { id: 'nomina',        label: 'Nómina Cuadrilla', icon: IconUsers },
      { id: 'asistencia',    label: 'Asistencia QR',   icon: IconQrCode },
      { id: 'requisiciones', label: 'Requisiciones',   icon: IconShoppingCart },
    ],
  },
  {
    name: 'Recursos Humanos', icon: IconUsers, id: 'personal',
    roles: ['personal_rh'],
    subItems: [
      { id: 'empleados',  label: 'Empleados',       icon: IconUsers },
      { id: 'cuadrillas', label: 'Cuadrillas',      icon: IconBriefcase },
      { id: 'prenomina',  label: 'Pre-Nómina',      icon: IconWallet },
      { id: 'pases',      label: 'Pases de Acceso', icon: IconUserCheck },
    ],
  },
  {
    name: 'Seguridad HSE', icon: IconShieldCheck, id: 'seguridad',
    roles: ['seguridad_hse'],
    subItems: [
      { id: 'incidentes',     label: 'Incidentes',     icon: IconAlertCircle },
      { id: 'inspecciones',   label: 'Inspecciones',   icon: IconCheckCircle2 },
      { id: 'permisos',       label: 'Permisos',       icon: IconFileText },
      { id: 'capacitaciones', label: 'Capacitaciones', icon: IconUsers },
      { id: 'epp',            label: 'EPP',            icon: IconShieldCheck },
    ],
  },
  { name: 'Ventas',       icon: IconShoppingCart, id: 'ventas', roles: ['ventas'] },
  {
    name: 'Calidad', icon: IconShieldCheck, id: 'calidad',
    roles: ['calidad', 'admin'],
    subItems: [
      { id: 'documentos',        label: 'Documentos',        icon: IconFileText },
      { id: 'no-conformidades',  label: 'No Conformidades',  icon: IconAlertCircle },
      { id: 'auditorias',        label: 'Auditorías',        icon: IconClipboardCheck },
    ],
  },
  {
    name: 'Administración', icon: IconSettings, id: 'admin',
    roles: ['admin'],
    subItems: [
      { id: 'usuarios',  label: 'Usuarios',  icon: IconUsers },
      { id: 'proyectos', label: 'Proyectos', icon: IconBriefcase },
    ],
  },
];

interface LayoutProps {
  children: React.ReactNode;
  onNavigate: (view: string) => void;
  currentView: string;
  currentSubView: string;
  onSubNavigate: (sub: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onNavigate, currentView, currentSubView, onSubNavigate }) => {
  const { tenant, user, logout, currentProjectId, setCurrentProjectId } = useTenant();
  const { isDark, toggle: toggleTheme } = useTheme();
  const userRoles: string[] = user?.role ?? [];
  const isAdmin = userRoles.includes('admin');
  const navItems = ALL_NAV_ITEMS.filter(item =>
    item.roles.length === 0 || isAdmin || item.roles.some(r => userRoles.includes(r))
  );
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);

  useEffect(() => {
    if (!isMobileNavOpen) return undefined;
    const prev = document.body.style.overflow;
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsMobileNavOpen(false); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onEsc);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onEsc); };
  }, [isMobileNavOpen]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    if (!isProjectDropdownOpen) return undefined;
    const onClickOutside = () => setIsProjectDropdownOpen(false);
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsProjectDropdownOpen(false); };
    setTimeout(() => window.addEventListener('click', onClickOutside), 0);
    window.addEventListener('keydown', onEsc);
    return () => { window.removeEventListener('click', onClickOutside); window.removeEventListener('keydown', onEsc); };
  }, [isProjectDropdownOpen]);

  const handleNavigate = (view: string) => {
    const item = ALL_NAV_ITEMS.find(i => i.id === view);
    const firstSub = item?.subItems?.find(s =>
      !s.roles?.length || isAdmin || s.roles.some(r => userRoles.includes(r))
    );
    onSubNavigate(firstSub?.id ?? '');
    onNavigate(view);
    setIsMobileNavOpen(false);
  };
  const handleLogout   = () => { setIsMobileNavOpen(false); logout(); };
  const projects       = user?.projects || [];
  const currentProject = projects.find(p => p.id === currentProjectId) || projects[0];
  const userInitial    = user?.name?.charAt(0)?.toUpperCase() || 'U';

  // ─── Sidebar ─────────────────────────────────────────────────────────────
  const renderSidebarContent = () => (
    <div className="flex h-full flex-col" style={{ background: 'hsl(var(--card))' }}>

      {/* ── Logo ───────────────────────────────────────────────────────── */}
      <style>{`
        @keyframes brand-halo-outer {
          0%, 100% { opacity: 0.45; transform: scale(1);    }
          50%       { opacity: 0.85; transform: scale(1.35); }
        }
        @keyframes brand-halo-mid {
          0%, 100% { opacity: 0.55; transform: scale(1);    }
          50%       { opacity: 1;    transform: scale(1.18); }
        }
        @keyframes brand-halo-inner {
          0%, 100% { opacity: 0.7;  transform: scale(1);    }
          50%       { opacity: 1;    transform: scale(1.08); }
        }
        @keyframes brand-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .brand-logo-wrap {
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        .brand-logo-wrap:hover { transform: scale(1.1); }
        .brand-logo-wrap:hover .brand-halo-outer { opacity: 1    !important; transform: scale(1.5) !important; }
        .brand-logo-wrap:hover .brand-halo-mid   { opacity: 1    !important; transform: scale(1.28) !important; }
        .brand-logo-wrap:hover .brand-halo-inner { opacity: 1    !important; }
        .brand-halo-outer { animation: brand-halo-outer 3s ease-in-out infinite; }
        .brand-halo-mid   { animation: brand-halo-mid   3s ease-in-out infinite 0.4s; }
        .brand-halo-inner { animation: brand-halo-inner 3s ease-in-out infinite 0.8s; }
        .brand-mark-text {
          background: linear-gradient(120deg,
            hsl(var(--primary)) 0%,
            hsl(var(--primary) / 0.75) 40%,
            hsl(var(--primary)) 60%,
            hsl(var(--primary) / 0.9) 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: brand-shimmer 3.5s linear infinite;
        }
      `}</style>
      <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
        <div className="brand-logo-wrap relative shrink-0 cursor-default" style={{ width: 36, height: 36 }}>

          {/* Halo 1 — exterior 64px: offset = (64-36)/2 = 14px */}
          <div className="brand-halo-outer" style={{
            position: 'absolute',
            top: -14, left: -14,
            width: 64, height: 64,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, hsl(var(--primary) / 0.55) 0%, hsl(var(--primary) / 0.15) 50%, transparent 75%)',
            filter: 'blur(6px)',
            pointerEvents: 'none',
          }} />

          {/* Halo 2 — medio 48px: offset = (48-36)/2 = 6px */}
          <div className="brand-halo-mid" style={{
            position: 'absolute',
            top: -6, left: -6,
            width: 48, height: 48,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, hsl(var(--primary) / 0.7) 0%, hsl(var(--primary) / 0.25) 55%, transparent 80%)',
            filter: 'blur(3px)',
            pointerEvents: 'none',
          }} />

          {/* Halo 3 — corona 42px: offset = (42-36)/2 = 3px */}
          <div className="brand-halo-inner" style={{
            position: 'absolute',
            top: -3, left: -3,
            width: 42, height: 42,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, hsl(var(--primary) / 0.5) 0%, transparent 65%)',
            pointerEvents: 'none',
          }} />

          {/* Logo iretum */}
          <img
            src="/favicon.svg"
            alt="Logo"
            width={36}
            height={36}
            style={{ position: 'relative', zIndex: 2, display: 'block' }}
          />
        </div>
        <div className="flex min-w-0 flex-col">
          <span
            className="brand-mark-text text-base font-black leading-tight truncate"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.03em' }}
          >
            {tenant?.name || 'ERP Industrial'}
          </span>
          <span className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground opacity-60 truncate">
            ERP Industrial
          </span>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto px-3 py-5" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map((item) => {
          const active = currentView === item.id;
          const visibleSubItems = (item.subItems ?? []).filter(s =>
            !s.roles?.length || isAdmin || s.roles.some(r => userRoles.includes(r))
          );
          const hasSubItems = visibleSubItems.length > 0;

          return (
            <div key={item.id}>
              <button
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
                {active && !hasSubItems && (
                  <div className="absolute right-3 h-1.5 w-1.5 rounded-full bg-white/60" />
                )}
              </button>

              {/* Sub-items: visibles cuando el módulo padre está activo */}
              {active && hasSubItems && (
                <div className="relative mt-0.5 mb-1 ml-4">
                  {/* Línea vertical conectora */}
                  <div
                    className="absolute left-3 top-1 bottom-1 w-px"
                    style={{ background: 'hsl(var(--border))' }}
                  />
                  <div className="flex flex-col gap-0.5">
                    {visibleSubItems.map(sub => {
                      const subActive = currentSubView === sub.id;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => onSubNavigate(sub.id)}
                          className={cn(
                            'group relative flex w-full items-center gap-2 rounded-lg pl-7 pr-3 py-2 text-xs font-medium transition-all duration-150',
                            subActive
                              ? 'bg-muted/80 text-primary'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                          )}
                        >
                          {subActive && (
                            <div
                              className="absolute left-[10px] top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-full"
                              style={{ background: 'hsl(var(--primary))' }}
                            />
                          )}
                          <sub.icon className={cn('h-3.5 w-3.5 shrink-0', subActive ? 'opacity-100' : 'opacity-50 group-hover:opacity-80')} />
                          <span className="truncate">{sub.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
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

              {/* ── Selector de proyecto ── */}
              <div className="relative min-w-0">
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); setIsProjectDropdownOpen(o => !o); }}
                  className="flex items-center gap-1.5 rounded-md px-2 py-1 font-bold truncate max-w-[180px] transition-all hover:opacity-80 bg-primary/10 text-foreground"
                >
                  <span className="truncate">{currentProject?.code || 'Sin Proyecto'}</span>
                  {projects.length > 1 && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                      className={`shrink-0 transition-transform duration-200 ${isProjectDropdownOpen ? 'rotate-180' : ''}`}>
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  )}
                </button>

                {/* Dropdown */}
                {isProjectDropdownOpen && projects.length > 1 && (
                  <div
                    className="absolute top-full left-0 mt-2 z-50 min-w-[240px] rounded-xl border shadow-xl overflow-hidden"
                    style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="px-3 py-2 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                        Seleccionar proyecto
                      </p>
                    </div>
                    {projects.map(project => {
                      const active = project.id === (currentProjectId || projects[0]?.id);
                      return (
                        <button
                          key={project.id}
                          type="button"
                          onClick={() => { setCurrentProjectId(project.id); setIsProjectDropdownOpen(false); }}
                          className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/60"
                        >
                          <div className="min-w-0">
                            <p className={`text-xs font-bold truncate ${active ? 'text-primary' : 'text-foreground'}`}>
                              {project.name}
                            </p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                              {project.code}
                            </p>
                          </div>
                          {active && (
                            <div className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
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
