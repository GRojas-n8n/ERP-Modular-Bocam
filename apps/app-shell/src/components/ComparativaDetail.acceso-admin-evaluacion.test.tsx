import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ComparativaDetail } from './ComparativaDetail';
import type { ComparativaLocal } from './ComparativaDetail';

/**
 * Ver openspec/changes/fix-evaluacion-tecnica-admin-y-descripcion.
 *
 * Bug original: showEvalTecnicaBtn (que gatea el acceso a evaluar C/NC/DA/?)
 * solo revisaba isResident || isSuperint — a diferencia de showFirmaBtn y la
 * sección "Veredicto del Residente", que sí incluyen roles.includes('admin').
 * Confirmado en producción (2026-07-13, usuario administrador): nunca podía
 * evaluar, en ningún cuadro (catálogo o texto libre).
 *
 * Desde openspec/changes/evaluacion-tecnica-inline-tabla-comparativa, la
 * evaluación ya no vive en un modal — showEvalTecnicaBtn ahora gatea si la
 * sub-fila inline en "TABLA DE COTIZACIONES" es editable.
 */

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({ user: { id: 'user-1', name: 'Admin de Prueba', role: ['admin'] } }),
}));

vi.mock('../context/NotificationContext', () => ({
  useNotification: () => ({ notify: vi.fn() }),
}));

const PROV_ID = 'prov-1';

function buildComparativa(overrides: Partial<ComparativaLocal> = {}): ComparativaLocal {
  return {
    id: 'cuadro-1',
    codigo: 'CC-TEST-1',
    requisicion_id: 'req-1',
    estado: 'EN_EVALUACION_TECNICA',
    revision: 'A',
    primera_opcion_proveedor_id: null,
    segunda_opcion_proveedor_id: null,
    proveedores: [{ id: PROV_ID, nombre: 'Proveedor Uno' } as any],
    lineas: [
      {
        id: 'linea-1',
        insumo_id: 'insumo-1',
        insumo_clave: 'MAT-001',
        insumo_descripcion: 'Varilla 3/8',
        insumo_unidad: 'PZA',
        cantidad: 10,
        precios: { [PROV_ID]: '100' },
        tiempos: {},
        ganador: null,
        evaluacion_tecnica: 'PENDIENTE',
        evaluacionesPorProveedor: {
          [PROV_ID]: { id_detalle: 'detalle-1', evaluacion_tecnica: 'PENDIENTE' },
        },
      } as any,
    ],
    lineas_detalle: [{ insumo_id: 'insumo-1', especificaciones: [] }],
    anotaciones_spec: [],
    evaluaciones_especificacion: [],
    ordenes_compra: [],
    ...overrides,
  } as unknown as ComparativaLocal;
}

describe('ComparativaDetail — acceso del rol admin a la evaluación técnica inline', () => {
  it('un usuario con rol admin (sin residencia ni superintendent) ve controles C/NC/DA/? editables en la tabla', async () => {
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

    expect(screen.getByTestId(`eval-btn-linea-1-${PROV_ID}-C`)).toBeInTheDocument();
    expect(screen.getByTestId('eval-guardar-linea-linea-1')).toBeInTheDocument();
  });
});
