import React, { useState } from 'react';
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
      default:
        return <DashboardView onNavigate={setCurrentView} />;
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
