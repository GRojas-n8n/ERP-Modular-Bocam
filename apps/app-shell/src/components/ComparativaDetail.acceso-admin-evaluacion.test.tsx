import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ComparativaDetail } from './ComparativaDetail';
import type { ComparativaLocal } from './ComparativaDetail';

/**
 * Ver openspec/changes/fix-evaluacion-tecnica-admin-y-descripcion.
 *
 * Bug: showEvalTecnicaBtn (el botón que abre el panel de evaluación
 * técnica con los controles C/NC/DA/?) solo revisaba isResident ||
 * isSuperint — a diferencia de showFirmaBtn y la sección "Veredicto del
 * Residente", que sí incluyen roles.includes('admin'). Confirmado en
 * producción (2026-07-13, usuario administrador): nunca veía el botón
 * para abrir el panel de evaluación, en ningún cuadro (catálogo o texto
 * libre).
 */

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({ user: { id: 'user-1', name: 'Admin de Prueba', role: ['admin'] } }),
}));

vi.mock('../context/NotificationContext', () => ({
  useNotification: () => ({ notify: vi.fn() }),
}));

function buildComparativa(overrides: Partial<ComparativaLocal> = {}): ComparativaLocal {
  return {
    id: 'cuadro-1',
    codigo: 'CC-TEST-1',
    requisicion_id: 'req-1',
    estado: 'EN_EVALUACION_TECNICA',
    revision: 'A',
    primera_opcion_proveedor_id: null,
    segunda_opcion_proveedor_id: null,
    proveedores: [{ id: 'prov-1', nombre: 'Proveedor Uno' } as any],
    lineas: [
      {
        id: 'linea-1',
        insumo_id: 'insumo-1',
        insumo_clave: 'MAT-001',
        insumo_descripcion: 'Varilla 3/8',
        insumo_unidad: 'PZA',
        cantidad: 10,
        precios: {},
        tiempos: {},
        ganador: null,
        evaluacion_tecnica: 'PENDIENTE',
      } as any,
    ],
    lineas_detalle: [{ insumo_id: 'insumo-1', especificaciones: [] }],
    anotaciones_spec: [],
    evaluaciones_especificacion: [],
    ordenes_compra: [],
    ...overrides,
  } as unknown as ComparativaLocal;
}

describe('ComparativaDetail — acceso del rol admin al panel de evaluación técnica', () => {
  it('un usuario con rol admin (sin residencia ni superintendent) ve "Registrar Evaluación Técnica" y puede abrir el panel', async () => {
    render(
      <ComparativaDetail
        requisicionFolio="REQ-TEST-1"
        comparativa={buildComparativa()}
        insumos={[]}
        isDemo={true}
        onBack={vi.fn()}
        onUpdate={vi.fn()}
        modo="compras"
      />
    );

    await waitFor(() => expect(screen.getByText('Varilla 3/8')).toBeInTheDocument());

    expect(screen.getByRole('button', { name: /Registrar Evaluación Técnica/i })).toBeInTheDocument();
  });
});
