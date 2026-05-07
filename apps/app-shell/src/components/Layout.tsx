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

// roles: [] = visible a todos | ['role'] = requiere ese rol | admin siempre ve todo
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
  const userRoles: string[] = user?.role ?? [];
  const isAdmin = userRoles.includes('admin');
  const navItems = ALL_NAV_ITEMS.filter(item =>
    item.roles.length === 0 || isAdmin || item.roles.some(r => userRoles.includes(r))
  );
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!isMobileNavOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileNavOpen(false);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEsc);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isMobileNavOpen]);

  const handleNavigate = (view: string) => {
    onNavigate(view);
    setIsMobileNavOpen(false);
  };

  const handleLogout = () => {
    setIsMobileNavOpen(false);
    logout();
  };

  const currentProject = user?.projects?.[0];

  const renderSidebarContent = () => (
    <>
      <div className="flex items-center gap-3 p-5 border-b" style={{ borderColor: 'hsl(218 30% 22%)' }}>
        {/* Logo Iretum */}
        <picture className="shrink-0">
          <source srcSet="/logo-dark.svg" media="(prefers-color-scheme: dark)" />
          <img src="/logo.svg" alt="Iretum" width={32} height={31} />
        </picture>
        <div className="flex min-w-0 flex-col">
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.03em' }}
            className="text-base font-bold text-foreground leading-tight">
            iretum
          </span>
          <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground opacity-70 truncate">
            {tenant?.name || 'ERP Industrial'}
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-6">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigate(item.id)}
            className={cn(
              'group relative flex w-full items-center gap-3 overflow-hidden rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300',
              currentView === item.id
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                : 'text-muted-foreground hover:translate-x-1 hover:bg-muted/50 hover:text-foreground'
            )}
          >
            <item.icon
              className={cn(
                'h-4 w-4',
                currentView === item.id ? 'text-white' : 'transition-colors group-hover:text-primary'
              )}
            />
            {item.name}
            {currentView === item.id && <div className="absolute right-0 top-0 h-full w-1 bg-white/20" />}
          </button>
        ))}
      </nav>

      <div className="mt-auto border-t bg-muted/20 p-4 backdrop-blur-sm">
        <div className="mb-3 flex items-center gap-3 rounded-xl border border-border/40 bg-card px-3 py-3 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-xs font-bold text-primary">
            {user?.name.charAt(0) || 'U'}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-bold text-foreground">{user?.name}</span>
            <span className="truncate text-[10px] font-medium uppercase tracking-tighter text-muted-foreground">
              {user?.email}
            </span>
          </div>
        </div>
        <Button onClick={handleLogout} variant="destructive" className="w-full justify-start" id="logout-btn">
          <IconLogOut className="h-4 w-4" />
          Cerrar Sesion
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans">
      <aside className="z-20 hidden w-64 flex-col border-r bg-card shadow-sm md:flex">
        {renderSidebarContent()}
      </aside>

      {isMobileNavOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Cerrar navegacion"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <aside className="relative z-10 flex h-full w-[88vw] max-w-xs flex-col border-r bg-card shadow-2xl">
            <div className="flex items-center justify-end px-4 pt-4">
              <Button
                type="button"
                aria-label="Cerrar menu"
                onClick={() => setIsMobileNavOpen(false)}
                variant="outline"
                size="icon"
              >
                <IconX className="h-5 w-5" />
              </Button>
            </div>
            {renderSidebarContent()}
          </aside>
        </div>
      )}

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <header className="z-10 flex h-16 items-center justify-between border-b bg-card/70 px-4 shadow-sm backdrop-blur-xl md:px-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <Button
              type="button"
              aria-label="Abrir navegacion"
              onClick={() => setIsMobileNavOpen(true)}
              variant="outline"
              size="icon"
              className="mr-1 md:hidden"
            >
              <IconMenu className="h-5 w-5" />
            </Button>
            <IconBriefcase className="h-4 w-4 opacity-50" />
            <span className="hidden opacity-50 sm:inline">Proyectos</span>
            <IconChevronRight className="h-3 w-3 opacity-30" />
            <span className="rounded-md bg-accent px-2 py-1 text-foreground shadow-inner">
              {currentProject?.code || 'Sin Proyecto'}
            </span>
          </div>

          <div className="flex items-center gap-5">
            <SectionBadge className="hidden border-green-500/20 bg-green-500/10 text-green-600 md:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              Sistema sincronizado
            </SectionBadge>
            <Button variant="outline" size="icon" className="group">
              <IconSettings className="h-4 w-4 text-muted-foreground transition-transform duration-500 group-hover:rotate-90" />
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
};
