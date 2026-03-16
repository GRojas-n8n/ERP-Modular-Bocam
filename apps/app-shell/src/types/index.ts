/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * App Shell — Tipos del Frontend
 *
 * ACTUALIZADO: Hito 4 — JWT Real
 * Añadidos tipos para AuthState, LoginCredentials y respuestas de Auth API.
 * ---------------------------------------------------------------------------
 */

export interface TenantConfig {
  id: string;
  name: string;
  logoUrl: string;
  primaryColor?: string;
  language: 'es' | 'en';
  plan?: string;
}

export interface UserContext {
  id: string;
  email: string;
  name: string;
  role: string[];
  projects: ProjectAccess[];
  limiteAprobacion?: number;
}

export interface ProjectAccess {
  id: string;
  name: string;
  code: string;
  status?: string;
  role?: string;
}

export interface AppState {
  tenant: TenantConfig | null;
  user: UserContext | null;
  currentProjectId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  tenant_id: string;
}
