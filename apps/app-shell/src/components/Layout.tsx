import React from 'react';
import { 
  BarChart3, 
  Settings, 
  Users, 
  Briefcase, 
  FileText, 
  ShoppingCart, 
  ShieldCheck,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { useTenant } from '../context/TenantContext';
import { cn } from '../lib/utils';

const navItems = [
  { name: 'Dashboard', icon: BarChart3, id: 'dashboard' },
  { name: 'Gerencia Técnica', icon: Briefcase, id: 'insumos' },
  { name: 'Compras', icon: ShoppingCart, id: 'compras' },
  { name: 'Control de Obra', icon: FileText, id: 'control-obra' },
  { name: 'Personal', icon: Users, id: 'personal' },
  { name: 'Seguridad', icon: ShieldCheck, id: 'seguridad' },
];

interface LayoutProps {
  children: React.ReactNode;
  onNavigate: (view: string) => void;
  currentView: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, onNavigate, currentView }) => {
  const { tenant, user, logout } = useTenant();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col z-20 shadow-sm">
        <div className="p-6 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-md">
            B
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm leading-tight uppercase tracking-wider overflow-hidden text-ellipsis whitespace-nowrap w-40">
              {tenant?.name || 'BOCAM ERP'}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium">SaaS Operational Shell</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 group",
                currentView === item.id 
                  ? "bg-primary/10 text-primary shadow-sm" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className={cn(
                "h-4 w-4",
                currentView === item.id ? "text-primary" : "group-hover:text-foreground"
              )} />
              {item.name}
              {item.name === 'Gerencia Técnica' && (
                <span className="ml-auto flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t bg-muted/30">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold border border-border">
              {user?.name.charAt(0)}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold truncate">{user?.name}</span>
              <span className="text-[11px] text-muted-foreground truncate">{user?.email}</span>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
            id="logout-btn"
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-16 border-b bg-card/80 backdrop-blur-md flex items-center justify-between px-8 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-2 text-sm text-muted-foreground italic font-medium">
            <Briefcase className="h-4 w-4" />
            <span>Proyectos / {tenant?.name} / Centro de Costos Activo</span>
            <ChevronRight className="h-3 w-3 mx-1" />
            <span className="text-foreground font-semibold px-2 py-0.5 bg-accent rounded-md">
              {user?.projects?.[0]?.code || 'Sin Proyecto'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border text-[12px] font-bold tracking-tight shadow-inner">
              <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
              NODE: ONLINE
            </div>
            <button className="h-9 w-9 rounded-md border flex items-center justify-center hover:bg-muted transition-all duration-200">
              <Settings className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </header>

        {/* Dynamic Viewport */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-8">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
