import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { TenantProvider, useTenant } from './context/TenantContext';
import { LoginView } from './views/LoginView';
import { InsumosView } from './views/InsumosView';
import { 
  Activity, 
  ArrowUpRight, 
  Layers, 
  Package, 
  TrendingUp,
  Scale,
} from 'lucide-react';

/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * App Shell — Componente Principal
 *
 * ACTUALIZADO: Hito 4 — JWT Real
 * Ahora renderiza LoginView cuando el usuario no está autenticado
 * y el dashboard cuando sí lo está.
 * ---------------------------------------------------------------------------
 */

const Dashboard: React.FC<{ onNavigate: (v: string) => void }> = ({ onNavigate }) => {
  const { user, tenant } = useTenant();
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Resumen Ejecutivo</h1>
        <p className="text-muted-foreground mt-2">
          Bienvenido, <span className="font-semibold text-foreground">{user?.name}</span> — {tenant?.name}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Proyectos Activos', value: String(user?.projects?.length || 0), icon: Layers, trend: 'RBAC' },
          { label: 'Presupuesto Liberado', value: '$4.2M', icon: TrendingUp, trend: '+12%' },
          { label: 'Órdenes de Compra', value: '48', icon: Package, trend: '8 pendientes' },
          { label: 'Eficiencia Operativa', value: '94.2%', icon: Activity, trend: '+1.4%' },
        ].map((stat) => (
          <div key={stat.label} className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-primary/5 rounded-lg group-hover:bg-primary/10 transition-colors">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                {stat.trend}
              </span>
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-1 font-medium uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-card rounded-xl border p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4">Módulos Conectados</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/40 rounded-lg border border-dashed border-border group hover:border-primary/50 transition-colors cursor-pointer" onClick={() => onNavigate('insumos')}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-indigo-500" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Gerencia Técnica</div>
                  <div className="text-[11px] text-muted-foreground">v1.2.0 • JWT Protegido</div>
                </div>
              </div>
              <div className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-1 rounded">CONECTADO</div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/40 rounded-lg border border-dashed border-border group hover:border-primary/50 transition-colors cursor-pointer" onClick={() => onNavigate('comparativa')}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Scale className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Cuadros Comparativos</div>
                  <div className="text-[11px] text-muted-foreground">Módulo Procuración • JWT Activo</div>
                </div>
              </div>
              <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">IR A ANALIZAR</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary/10 to-transparent rounded-xl border border-primary/20 p-8 flex flex-col justify-center relative overflow-hidden group">
           <div className="relative z-10">
             <h2 className="text-2xl font-bold text-primary mb-2">🔐 JWT Activo</h2>
             <p className="text-sm text-balance text-muted-foreground leading-relaxed">
               Autenticación con firma criptográfica. El tenant_id y proyecto_id
               se extraen del token verificado, nunca del cliente.
             </p>
             <div className="mt-4 flex flex-wrap gap-2">
               {user?.role?.map(r => (
                 <span key={r} className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full uppercase">
                   {r}
                 </span>
               ))}
             </div>
           </div>
        </div>
      </div>

      {/* Proyectos Asignados */}
      {user?.projects && user.projects.length > 0 && (
        <div className="bg-card rounded-xl border p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4">Proyectos Autorizados (RBAC)</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {user.projects.map(project => (
              <div key={project.id} className="p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="font-semibold text-sm">{project.name}</div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  {project.code} • {project.status || 'ACTIVO'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

import { ComprasView } from './views/ComprasView';
import { ComparativaPrecios } from './views/ComparativaPrecios';
import { FinanzasView } from './views/FinanzasView';


const AuthenticatedApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard onNavigate={setCurrentView} />;
      case 'insumos': return <InsumosView />;
      case 'compras': return <ComprasView />;
      case 'comparativa': return <ComparativaPrecios />;
      case 'finanzas': return <FinanzasView />;
      default: return <Dashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <Layout onNavigate={(view) => setCurrentView(view)} currentView={currentView}>
      {renderView()}
    </Layout>
  );
};

const AppRouter: React.FC = () => {
  const { isAuthenticated } = useTenant();

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return <AuthenticatedApp />;
};

const App: React.FC = () => {
  return (
    <TenantProvider>
      <AppRouter />
    </TenantProvider>
  );
};

export default App;
