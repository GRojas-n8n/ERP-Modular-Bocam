import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * App Shell — Cliente API con Autenticación JWT Real
 *
 * ACTUALIZADO: Hito 4 — JWT Real
 * Ya NO inyecta x-tenant-id / x-proyecto-id como headers manuales.
 * Ahora inyecta el Bearer Token JWT que ya contiene toda la identidad
 * verificada criptográficamente.
 *
 * FLUJO:
 * 1. Interceptor de Request → Inyecta Authorization: Bearer <token>
 * 2. Interceptor de Response → Detecta 401 → Intenta refresh automático
 * 3. Si el refresh falla → Fuerza logout y redirige a login
 * ---------------------------------------------------------------------------
 */

const AUTH_TOKEN_KEY = 'bocam_access_token';
const REFRESH_TOKEN_KEY = 'bocam_refresh_token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Storage Helpers ─────────────────────────────────────────────────────────
export function getAccessToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// ─── Request Interceptor: Inyectar Bearer Token ─────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ─── Response Interceptor: Auto-Refresh en 401 ─────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token?: string) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si es un 401 y NO es una petición de refresh (prevenir loop)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      if (isRefreshing) {
        // Encolar si ya estamos refrescando
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || ''}/api/v1/auth/refresh`,
          { refresh_token: refreshToken }
        );

        const newAccessToken = data.data.access_token;
        const newRefreshToken = data.data.refresh_token;

        setTokens(newAccessToken, newRefreshToken);
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, undefined);
        // Refresh falló → forzar logout
        clearTokens();
        window.dispatchEvent(new CustomEvent('bocam:session-expired'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─── Auth API Functions ─────────────────────────────────────────────────────
export async function loginApi(email: string, password: string, tenantId: string) {
  const response = await api.post('/api/v1/auth/login', {
    email,
    password,
    tenant_id: tenantId,
  });
  return response.data;
}

export async function fetchMe() {
  const response = await api.get('/api/v1/auth/me');
  return response.data;
}

export async function switchProjectApi(proyectoId: string) {
  const response = await api.post('/api/v1/auth/switch-project', {
    proyecto_id: proyectoId,
  });
  return response.data;
}

export default api;
