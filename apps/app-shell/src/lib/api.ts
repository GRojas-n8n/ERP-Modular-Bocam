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

// ─── Wrappers tipados por módulo ─────────────────────────────────────────────
// Cada función centraliza la ruta y el manejo de la respuesta,
// evitando que las vistas conozcan los paths del backend directamente.

// ── Gerencia Técnica ─────────────────────────────────────────────────────────
export const gtApi = {
  getInsumos:      ()         => api.get('/api/v1/gerencia-tecnica/insumos'),
  createInsumo:    (data: unknown) => api.post('/api/v1/gerencia-tecnica/insumos', data),
  updateInsumo:    (id: string, data: unknown) => api.patch(`/api/v1/gerencia-tecnica/insumos/${id}`, data),
  deleteInsumo:    (id: string) => api.delete(`/api/v1/gerencia-tecnica/insumos/${id}`),
  getPresupuestos: ()         => api.get('/api/v1/gerencia-tecnica/presupuestos'),
  createPresupuesto: (data: unknown) => api.post('/api/v1/gerencia-tecnica/presupuestos', data),
};

// ── Compras ──────────────────────────────────────────────────────────────────
export const comprasApi = {
  getRequisiciones:    ()         => api.get('/api/v1/compras/requisiciones'),
  createRequisicion:   (data: unknown) => api.post('/api/v1/compras/requisiciones', data),
  getOrdenesCompra:    ()         => api.get('/api/v1/compras/ordenes-compra'),
  getProveedores:      ()         => api.get('/api/v1/compras/proveedores'),
  getComparativas:     ()         => api.get('/api/v1/compras/comparativas'),
  getComparativa:      (id: string) => api.get(`/api/v1/compras/comparativas/${id}`),
  convertirAOC:        (id: string, data: unknown) => api.post(`/api/v1/compras/comparativas/${id}/convertir-oc`, data),
  cancelarOC:          (id: string, data: unknown) => api.post(`/api/v1/compras/ordenes-compra/${id}/cancelar`, data),
};

// ── Control de Obra ──────────────────────────────────────────────────────────
export const controlObraApi = {
  getBitacoras:    ()         => api.get('/api/v1/control-obra/bitacoras'),
  createBitacora:  (data: unknown) => api.post('/api/v1/control-obra/bitacoras', data),
  getAvances:      ()         => api.get('/api/v1/control-obra/avances'),
  createAvance:    (data: unknown) => api.post('/api/v1/control-obra/avances', data),
  validarAvance:   (id: string) => api.patch(`/api/v1/control-obra/avances/${id}/validar`, {}),
  getEstimaciones: ()         => api.get('/api/v1/control-obra/estimaciones'),
  createEstimacion:(data: unknown) => api.post('/api/v1/control-obra/estimaciones', data),
};

// ── Personal ─────────────────────────────────────────────────────────────────
export const personalApi = {
  getEmpleados:       ()         => api.get('/api/v1/personal/empleados'),
  createEmpleado:     (data: unknown) => api.post('/api/v1/personal/empleados', data),
  updateEmpleado:     (id: string, data: unknown) => api.patch(`/api/v1/personal/empleados/${id}`, data),
  bajaEmpleado:       (id: string, data: unknown) => api.patch(`/api/v1/personal/empleados/${id}/baja`, data),
  getCuadrillas:      ()         => api.get('/api/v1/personal/cuadrillas'),
  createCuadrilla:    (data: unknown) => api.post('/api/v1/personal/cuadrillas', data),
  asignarCuadrilla:   (id: string, data: unknown) => api.post(`/api/v1/personal/cuadrillas/${id}/asignar`, data),
  getPrenominas:      ()         => api.get('/api/v1/personal/prenominas'),
  calcularPrenomina:  (data: unknown) => api.post('/api/v1/personal/prenominas/calcular', data),
  autorizarPrenomina: (id: string) => api.patch(`/api/v1/personal/prenominas/${id}/autorizar`, {}),
  getDashboard:       ()         => api.get('/api/v1/personal/dashboard'),
};

// ── Seguridad / HSE ──────────────────────────────────────────────────────────
export const seguridadApi = {
  getIncidentes:      ()         => api.get('/api/v1/seguridad/incidentes'),
  createIncidente:    (data: unknown) => api.post('/api/v1/seguridad/incidentes', data),
  getInspecciones:    ()         => api.get('/api/v1/seguridad/inspecciones'),
  createInspeccion:   (data: unknown) => api.post('/api/v1/seguridad/inspecciones', data),
  getPermisos:        ()         => api.get('/api/v1/seguridad/permisos'),
  createPermiso:      (data: unknown) => api.post('/api/v1/seguridad/permisos', data),
  getCapacitaciones:  ()         => api.get('/api/v1/seguridad/capacitaciones'),
  createCapacitacion: (data: unknown) => api.post('/api/v1/seguridad/capacitaciones', data),
};

// ── Finanzas ─────────────────────────────────────────────────────────────────
export const finanzasApi = {
  getDashboard:    ()         => api.get('/api/v1/finanzas/dashboard'),
  getPagos:        ()         => api.get('/api/v1/finanzas/pagos'),
  getMovimientos:  ()         => api.get('/api/v1/finanzas/movimientos'),
  getPresupuestos: ()         => api.get('/api/v1/finanzas/presupuestos'),
};

// ── Ventas ───────────────────────────────────────────────────────────────────
export const ventasApi = {
  getClientes:     ()         => api.get('/api/v1/ventas/clientes'),
  getCotizaciones: ()         => api.get('/api/v1/ventas/cotizaciones'),
  createCotizacion:(data: unknown) => api.post('/api/v1/ventas/cotizaciones', data),
  aceptarCotizacion:(id: string) => api.post(`/api/v1/ventas/cotizaciones/${id}/aceptar`, {}),
  getFacturas:     ()         => api.get('/api/v1/ventas/facturas'),
};
