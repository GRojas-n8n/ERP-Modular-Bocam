import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as Sentry from '@sentry/react';
import type { TenantConfig, UserContext, AppState, ProjectAccess } from '../types';
import { getAccessToken, setTokens, clearTokens, loginApi, logoutApi, fetchMe, switchProjectApi } from '../lib/api';
import { useInactivityLogout } from '../hooks/useInactivityLogout';

// Ver openspec/changes/sesion-jwt-inactividad. Coincide por default con el
// TTL del access token (15 min), pero son mecanismos independientes: uno es
// del token, este es de interacción real del usuario en la UI.
const INACTIVITY_TIMEOUT_MIN = Number(import.meta.env.VITE_INACTIVITY_TIMEOUT_MIN) || 15;
// Clave de sessionStorage para distinguir, en la pantalla de login, un
// logout por inactividad de uno por expiración normal de la sesión.
export const LOGOUT_REASON_KEY = 'iretum_logout_reason';

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
  setCurrentProjectId: (projectId: string) => void | Promise<void>;
  refreshUser: () => Promise<void>;
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

        Sentry.setUser({ id: user.id, email: user.email, username: user.name });
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

    window.addEventListener('iretum:session-expired', handleSessionExpired);
    return () => window.removeEventListener('iretum:session-expired', handleSessionExpired);
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

      Sentry.setUser({ id: user.id, email: user.email, username: user.name });
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
      id: 'iretum-demo',
      name: 'Iretum Demo',
      logoUrl: '/logo.svg',
      primaryColor: '#1A56DB',
      language: 'es',
      plan: 'enterprise',
    };
    const demoUser: UserContext = {
      id: 'demo-user-001',
      email: 'demo@iretum.com',
      name: 'Usuario Demo',
      role: ['admin', 'gerencia_tecnica', 'compras', 'finanzas', 'contabilidad', 'control_obra', 'residencia', 'personal_rh', 'seguridad_hse', 'ventas'],
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
    // Revocar el refresh token en el servidor antes de soltarlo. Sin esto el
    // token seguia vivo en la base hasta expirar, asi que "cerrar sesion" solo
    // limpiaba localStorage y quien lo hubiera copiado podia seguir emitiendo
    // access tokens (ver openspec/changes/cambio-password-y-logout).
    //
    // No se espera la respuesta ni se bloquea el cierre si falla: el usuario
    // pidio salir y debe salir aunque el backend este caido. La sesion local se
    // limpia igual, y el token expira solo.
    const refreshToken = localStorage.getItem('iretum_refresh_token');
    if (refreshToken) {
      void logoutApi(refreshToken).catch(() => {
        /* el cierre local no depende del servidor */
      });
    }

    clearTokens();
    Sentry.setUser(null);
    setState({
      tenant: null,
      user: null,
      currentProjectId: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }, []);

  // ─── Logout por inactividad (sesion-jwt-inactividad) ───────────────────
  // Distinto del logout manual: marca la razón en sessionStorage para que
  // LoginView pueda mostrar un mensaje específico ("se cerró por
  // inactividad") en vez del genérico de sesión expirada.
  const handleInactivityTimeout = useCallback(() => {
    try { sessionStorage.setItem(LOGOUT_REASON_KEY, 'inactivity'); } catch { /* storage no disponible */ }
    logout();
  }, [logout]);

  useInactivityLogout(state.isAuthenticated, INACTIVITY_TIMEOUT_MIN, handleInactivityTimeout);

  // ─── Switch Project ────────────────────────────────────────────────────
  const setCurrentProjectId = useCallback(async (projectId: string) => {
    try {
      // Obtener el nuevo JWT ANTES de actualizar el estado para evitar que los
      // useEffect de las vistas re-fetchen con el token viejo (race condition).
      const result = await switchProjectApi(projectId);
      if (result?.data?.access_token) {
        const refreshToken = localStorage.getItem('iretum_refresh_token') || '';
        setTokens(result.data.access_token, refreshToken);
      }
    } catch {
      // Si el switch falla no cambiamos de proyecto — evita mostrar datos del
      // proyecto incorrecto en la UI.
      return;
    }
    setState(prev => ({ ...prev, currentProjectId: projectId }));
  }, []);

  // ─── Refresh User (recargar proyectos y datos sin logout) ──────────────
  // Usar después de crear/modificar proyectos en AdminView para que el
  // selector de proyectos refleje los cambios sin necesidad de re-login.
  const refreshUser = useCallback(async () => {
    try {
      const result = await fetchMe();
      const data = result.data;
      const updatedUser: UserContext = {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.roles,
        projects: data.projects as ProjectAccess[],
        limiteAprobacion: data.limite_aprobacion,
      };
      setState(prev => ({
        ...prev,
        user: updatedUser,
        // Conservar el proyecto activo si aún existe; si no, usar el primero disponible
        currentProjectId: data.projects.some((p: ProjectAccess) => p.id === prev.currentProjectId)
          ? prev.currentProjectId
          : data.projects[0]?.id || null,
      }));
    } catch {
      // Silencioso — si la sesión expiró, el interceptor de api.ts maneja el logout
    }
  }, []);

  // ─── Render ────────────────────────────────────────────────────────────
  // IMPORTANTE: El Provider SIEMPRE se renderiza para que el contexto esté
  // disponible antes de que React monte los hijos. El spinner se muestra
  // dentro del Provider (no fuera), evitando la transición DIV→Provider
  // que en React 19 concurrent mode puede pre-renderizar hijos antes de
  // que el contexto quede establecido (causa del Error #525).
  return (
    <TenantContext.Provider value={{ ...state, login, loginDemo, logout, setCurrentProjectId, refreshUser, loginError }}>
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
