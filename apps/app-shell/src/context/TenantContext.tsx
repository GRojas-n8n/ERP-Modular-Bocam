import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { TenantConfig, UserContext, AppState, ProjectAccess } from '../types';
import { getAccessToken, setTokens, clearTokens, loginApi, fetchMe } from '../lib/api';

/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * App Shell — Contexto de Autenticación y Tenant
 *
 * ACTUALIZADO: Hito 4 — JWT Real
 * Ya no usa datos mockeados. Se autentica contra el servicio de Auth real
 * y gestiona el ciclo de vida completo de la sesión JWT.
 * ---------------------------------------------------------------------------
 */

interface TenantContextType extends AppState {
  login: (email: string, password: string, tenantId: string) => Promise<void>;
  loginDemo: () => void;
  logout: () => void;
  setCurrentProjectId: (projectId: string) => void;
  loginError: string | null;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    tenant: null,
    user: null,
    currentProjectId: null,
    isLoading: true,
    isAuthenticated: false,
  });
  const [loginError, setLoginError] = useState<string | null>(null);

  // ─── Verificar sesión existente al cargar ──────────────────────────────
  useEffect(() => {
    const checkExistingSession = async () => {
      const token = getAccessToken();
      if (!token) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        const result = await fetchMe();
        const data = result.data;

        const tenant: TenantConfig = {
          id: data?.tenant?.id,
          name: data?.tenant?.name,
          logoUrl: data?.tenant?.logo_url || '/logo.svg',
          primaryColor: data?.tenant?.primary_color || undefined,
          language: 'es',
          plan: data?.tenant?.plan,
        };

        const user: UserContext = {
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.roles,
          projects: data.projects as ProjectAccess[],
          limiteAprobacion: data.limite_aprobacion,
        };

        const activeProject = data.projects[0]?.id || null;

        if (tenant.primaryColor) {
          document.documentElement.style.setProperty('--brand-primary', tenant.primaryColor);
        }

        setState({
          tenant,
          user,
          currentProjectId: activeProject,
          isLoading: false,
          isAuthenticated: true,
        });
      } catch {
        // Token inválido o expirado (y refresh también falló)
        clearTokens();
        setState(prev => ({ ...prev, isLoading: false, isAuthenticated: false }));
      }
    };

    checkExistingSession();

    // Escuchar evento de sesión expirada (del interceptor de api.ts)
    const handleSessionExpired = () => {
      setState(prev => ({
        ...prev,
        isAuthenticated: false,
        user: null,
        tenant: null,
      }));
    };

    window.addEventListener('bocam:session-expired', handleSessionExpired);
    return () => window.removeEventListener('bocam:session-expired', handleSessionExpired);
  }, []);

  // ─── Login ─────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string, tenantId: string) => {
    setLoginError(null);
    try {
      const result = await loginApi(email, password, tenantId);
      const { access_token, refresh_token, user: userData } = result.data;

      // Guardar tokens
      setTokens(access_token, refresh_token);

      // Construir estado
      const tenant: TenantConfig = {
        id: userData?.tenant?.id,
        name: userData?.tenant?.name,
        logoUrl: userData?.tenant?.logo_url || '/logo.svg',
        primaryColor: userData?.tenant?.primary_color || undefined,
        language: 'es',
      };

      const user: UserContext = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.roles,
        projects: userData.projects as ProjectAccess[],
      };

      const activeProject = userData.projects[0]?.id || null;

      if (tenant.primaryColor) {
        document.documentElement.style.setProperty('--brand-primary', tenant.primaryColor);
      }

      setState({
        tenant,
        user,
        currentProjectId: activeProject,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (err: any) {
      const backendError = err.response?.data?.error;
      const message = backendError?.message
        || (backendError?.code ? `Error de autenticación (${backendError.code}).` : null)
        || 'Error de conexión con el servidor.';
      setLoginError(message);
      throw err;
    }
  }, []);

  // ─── Demo Mode ─────────────────────────────────────────────────────────
  const loginDemo = useCallback(() => {
    const demoTenant: TenantConfig = {
      id: 'bocam-demo',
      name: 'Bocam ERP',
      logoUrl: '/logo.svg',
      primaryColor: '#1A56DB',
      language: 'es',
      plan: 'enterprise',
    };
    const demoUser: UserContext = {
      id: 'demo-user-001',
      email: 'demo@bocam.com',
      name: 'Usuario Demo',
      role: ['ADMIN', 'GERENTE_TECNICO', 'COMPRAS'],
      projects: [
        { id: 'proj-001', name: 'Torre Corporativa Norte', code: 'TCN-2024', status: 'En curso' },
        { id: 'proj-002', name: 'Residencial Las Palmas', code: 'RLP-2024', status: 'En curso' },
        { id: 'proj-003', name: 'Bodega Industrial Vallejo', code: 'BIV-2025', status: 'Planeación' },
      ],
      limiteAprobacion: 5000000,
    };
    document.documentElement.style.setProperty('--brand-primary', demoTenant.primaryColor!);
    setState({
      tenant: demoTenant,
      user: demoUser,
      currentProjectId: 'proj-001',
      isLoading: false,
      isAuthenticated: true,
    });
  }, []);

  // ─── Logout ────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    clearTokens();
    setState({
      tenant: null,
      user: null,
      currentProjectId: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }, []);

  // ─── Switch Project ────────────────────────────────────────────────────
  const setCurrentProjectId = useCallback((projectId: string) => {
    setState(prev => ({ ...prev, currentProjectId: projectId }));
  }, []);

  // ─── Render ────────────────────────────────────────────────────────────
  // IMPORTANTE: El Provider SIEMPRE se renderiza para que el contexto esté
  // disponible antes de que React monte los hijos. El spinner se muestra
  // dentro del Provider (no fuera), evitando la transición DIV→Provider
  // que en React 19 concurrent mode puede pre-renderizar hijos antes de
  // que el contexto quede establecido (causa del Error #525).
  return (
    <TenantContext.Provider value={{ ...state, login, loginDemo, logout, setCurrentProjectId, loginError }}>
      {state.isLoading ? (
        <div className="h-screen w-screen flex items-center justify-center bg-background">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-48 bg-muted rounded-md mb-4"></div>
            <div className="text-muted-foreground text-sm font-medium">Verificando sesión...</div>
          </div>
        </div>
      ) : (
        children
      )}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
