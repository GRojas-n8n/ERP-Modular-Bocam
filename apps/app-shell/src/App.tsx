import React, { useState, Suspense, Component } from 'react';
import { Layout } from './components/Layout';
import { TenantProvider, useTenant } from './context/TenantContext';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { InsumosView } from './views/InsumosView';
import { ComprasView } from './views/ComprasView';
import { ComparativaPrecios } from './views/ComparativaPrecios';
import { FinanzasView } from './views/FinanzasView';
import { ControlObraView } from './views/ControlObraView';
import { PersonalView } from './views/PersonalView';
import { SeguridadView } from './views/SeguridadView';
import { VentasView } from './views/VentasView';
import { MasterView } from './views/MasterView';
import { AdminView } from './views/AdminView';

// ─── View loading fallback ────────────────────────────────────────────────────
const ViewLoader: React.FC = () => (
  <div className="flex h-full min-h-[400px] items-center justify-center">
    <div className="animate-pulse text-muted-foreground text-xs font-black uppercase tracking-[0.2em]">
      Cargando módulo...
    </div>
  </div>
);

// ─── Error Boundary ───────────────────────────────────────────────────────────
interface EBState { hasError: boolean; }
class AppErrorBoundary extends Component<{ children: React.ReactNode }, EBState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(_: Error): EBState {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    console.error('[AppShell] Error capturado por boundary:', error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-background gap-4">
          <p className="text-sm font-bold uppercase tracking-widest text-destructive">
            Error crítico — recarga la aplicación
          </p>
          <button
            className="px-6 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold uppercase tracking-widest"
            onClick={() => window.location.reload()}
          >
            Recargar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Clasificación: Estrictamente Confidencial.
 * ---------------------------------------------------------------------------
 * App Shell — Punto de Entrada Principal del Frontend
 *
 * Orquesta la autenticación, el layout global y la navegación
 * entre vistas de cada módulo del ecosistema ERP.
 * ---------------------------------------------------------------------------
 */

const AuthenticatedApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView onNavigate={setCurrentView} />;
      case 'insumos':
        return <InsumosView />;
      case 'compras':
        return <ComprasView />;
      case 'comparativa':
        return <ComparativaPrecios />;
      case 'finanzas':
        return <FinanzasView />;
      case 'control-obra':
        return <ControlObraView />;
      case 'personal':
        return <PersonalView />;
      case 'seguridad':
        return <SeguridadView />;
      case 'ventas':
        return <VentasView />;
      case 'admin':
        return <AdminView />;
      default:
        return <DashboardView onNavigate={setCurrentView} />;
    }
  };

  return (
    <Layout onNavigate={(view) => setCurrentView(view)} currentView={currentView}>
      <Suspense fallback={<ViewLoader />}>
        {renderView()}
      </Suspense>
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
  const isMaster = new URLSearchParams(window.location.search).has('master');
  if (isMaster) {
    return (
      <AppErrorBoundary>
        <MasterView />
      </AppErrorBoundary>
    );
  }
  return (
    <AppErrorBoundary>
      <TenantProvider>
        <AppRouter />
      </TenantProvider>
    </AppErrorBoundary>
  );
};

export default App;
