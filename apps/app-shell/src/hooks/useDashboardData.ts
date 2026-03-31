/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Clasificación: Estrictamente Confidencial.
 * ---------------------------------------------------------------------------
 * Hook: useDashboardData
 *
 * Centraliza la obtención de datos reales para el Dashboard Ejecutivo.
 * Consume APIs de Finanzas, Compras y Gerencia Técnica en paralelo.
 * Cada fuente es independiente: si un módulo falla, los demás siguen.
 * ---------------------------------------------------------------------------
 */

import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface ResumenPresupuestal {
  total_autorizado: number;
  total_ejercido: number;
  total_comprometido: number;
  total_disponible: number;
  porcentaje_ejercido: number;
}

export interface MovimientoReciente {
  id_movimiento: string;
  tipo: string;
  concepto: string;
  monto: number;
  fecha_registro: string;
  referencia_modulo?: string;
  referencia_codigo?: string;
  presupuesto?: { codigo: string };
}

export interface OrdenCompra {
  id_orden: string;
  codigo: string;
  estado: string;
  total: number;
  fecha_emision: string;
  proveedor?: { razon_social: string };
}

export interface Requisicion {
  id_requisicion: string;
  codigo: string;
  estado: string;
  prioridad: string;
  fecha_solicitud: string;
}

export interface DashboardData {
  // Finanzas
  resumen: ResumenPresupuestal | null;
  movimientos: MovimientoReciente[];
  pagosVencidos: number;
  // Compras
  ordenesCompra: OrdenCompra[];
  requisiciones: Requisicion[];
  // Gerencia Técnica
  totalInsumos: number;
  // Meta
  loading: boolean;
  errors: Record<string, string>;
  refetch: () => void;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useDashboardData(): DashboardData {
  const [resumen, setResumen] = useState<ResumenPresupuestal | null>(null);
  const [movimientos, setMovimientos] = useState<MovimientoReciente[]>([]);
  const [pagosVencidos, setPagosVencidos] = useState(0);
  const [ordenesCompra, setOrdenesCompra] = useState<OrdenCompra[]>([]);
  const [requisiciones, setRequisiciones] = useState<Requisicion[]>([]);
  const [totalInsumos, setTotalInsumos] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setErrors({});
    const newErrors: Record<string, string> = {};

    // Lanzar todas las peticiones en paralelo (independientes)
    const [finanzasResult, comprasOcResult, comprasReqResult, gtResult] =
      await Promise.allSettled([
        // 1. Finanzas Dashboard
        api.get('/api/v1/finanzas/dashboard'),
        // 2. Compras — Órdenes de Compra
        api.get('/api/v1/compras/ordenes-compra'),
        // 3. Compras — Requisiciones
        api.get('/api/v1/compras/requisiciones'),
        // 4. Gerencia Técnica — Insumos
        api.get('/api/v1/gerencia-tecnica/insumos'),
      ]);

    // ── Procesar Finanzas ──
    if (finanzasResult.status === 'fulfilled') {
      const d = finanzasResult.value.data?.data;
      if (d) {
        setResumen(d.resumen_presupuestal || null);
        setMovimientos(d.ultimos_movimientos || []);
        setPagosVencidos(d.pagos_vencidos || 0);
      }
    } else {
      newErrors.finanzas = 'Módulo Finanzas no disponible';
      console.warn('[Dashboard] Finanzas offline:', finanzasResult.reason?.message);
    }

    // ── Procesar Compras — OC ──
    if (comprasOcResult.status === 'fulfilled') {
      setOrdenesCompra(comprasOcResult.value.data?.data || []);
    } else {
      newErrors.comprasOc = 'Órdenes de Compra no disponibles';
      console.warn('[Dashboard] Compras OC offline:', comprasOcResult.reason?.message);
    }

    // ── Procesar Compras — Requisiciones ──
    if (comprasReqResult.status === 'fulfilled') {
      setRequisiciones(comprasReqResult.value.data?.data || []);
    } else {
      newErrors.comprasReq = 'Requisiciones no disponibles';
      console.warn('[Dashboard] Compras Req offline:', comprasReqResult.reason?.message);
    }

    // ── Procesar Gerencia Técnica ──
    if (gtResult.status === 'fulfilled') {
      const insumos = gtResult.value.data?.data || [];
      setTotalInsumos(Array.isArray(insumos) ? insumos.length : 0);
    } else {
      newErrors.gerenciaTecnica = 'Gerencia Técnica no disponible';
      console.warn('[Dashboard] GT offline:', gtResult.reason?.message);
    }

    setErrors(newErrors);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    resumen,
    movimientos,
    pagosVencidos,
    ordenesCompra,
    requisiciones,
    totalInsumos,
    loading,
    errors,
    refetch: fetchAll,
  };
}
