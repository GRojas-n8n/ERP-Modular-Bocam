import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ComparativaDetail } from './ComparativaDetail';
import type { ComparativaLocal } from './ComparativaDetail';

/**
 * Ver openspec/changes/fix-acceso-residente-evaluacion-tecnica.
 *
 * Bug: `isResident` en ComparativaDetail.tsx solo reconoce los roles
 * 'resident' y 'control_obra', pero el rol real que AdminView.tsx asigna a
 * un Residente de Obra es 'residencia' (español). Los tests existentes
 * (ComparativaDetail.firma-seleccion.test.tsx) mockean `role: ['resident']`
 * + `modo="compras"`, que nunca ejercitan la combinación real de un
 * Residente de Bocam: `role: ['residencia']` + `modo="residente"`.
 */

const { mockUser } = vi.hoisted(() => ({
  mockUser: { id: 'user-1', name: 'Residente de Prueba', role: ['residencia'] as string[] },
}));

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({ user: mockUser }),
}));

vi.mock('../context/NotificationContext', () => ({
  useNotification: () => ({ notify: vi.fn() }),
}));

afterEach(() => {
  mockUser.role = ['residencia'];
});

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
        precios: {},
        tiempos: {},
        ganador: null,
        evaluacion_tecnica: 'C',
      } as any,
    ],
    lineas_detalle: [{ insumo_id: 'insumo-1', especificaciones: [] }],
    anotaciones_spec: [],
    evaluaciones_especificacion: [],
    ordenes_compra: [],
    ...overrides,
  } as unknown as ComparativaLocal;
}

describe('ComparativaDetail — acceso del rol residencia a la evaluación técnica', () => {
  it('un usuario con rol residencia, en modo residente, ve "Registrar Evaluación Técnica" y el veredicto del Residente', async () => {
    render(
      <ComparativaDetail
        requisicionFolio="REQ-TEST-1"
        comparativa={buildComparativa()}
        insumos={[]}
        isDemo={true}
        onBack={vi.fn()}
        onUpdate={vi.fn()}
        modo="residente"
      />
    );

    await waitFor(() => expect(screen.getByText('Varilla 3/8')).toBeInTheDocument());

    expect(screen.getByRole('button', { name: /Registrar Evaluación Técnica/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Describe tu evaluación general/i)).toBeInTheDocument();
  });

  it('un usuario con rol residencia, en modo residente, puede llenar el veredicto y firmar/bloquear el cuadro', async () => {
    const onUpdate = vi.fn();

    render(
      <ComparativaDetail
        requisicionFolio="REQ-TEST-1"
        comparativa={buildComparativa({ primera_opcion_proveedor_id: PROV_ID })}
        insumos={[]}
        isDemo={true}
        onBack={vi.fn()}
        onUpdate={onUpdate}
        modo="residente"
      />
    );

    await waitFor(() => expect(screen.getByText('Varilla 3/8')).toBeInTheDocument());

    // Llenar veredicto + seleccionar proveedor sugerido
    fireEvent.change(screen.getByPlaceholderText(/Describe tu evaluación general/i), {
      target: { value: 'Cumple todas las especificaciones, recomiendo este proveedor.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /A · Proveedor Uno/i }));

    // Abrir modal de firma (botón de la barra de acciones, con flecha "→")
    fireEvent.click(screen.getByRole('button', { name: /Firmar y Bloquear →/i }));

    // Confirmar responsabilidad técnica dentro del modal
    fireEvent.click(screen.getByRole('checkbox'));

    // Confirmar firma (botón del modal, sin flecha)
    fireEvent.click(screen.getByRole('button', { name: '🔒 Firmar y Bloquear' }));

    expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ estado: 'FIRMADO_BLOQUEADO' }));
  });

  it('un usuario sin ninguno de los roles habilitados no ve el botón de evaluación ni el veredicto (guarda de regresión)', async () => {
    mockUser.role = [];

    render(
      <ComparativaDetail
        requisicionFolio="REQ-TEST-1"
        comparativa={buildComparativa()}
        insumos={[]}
        isDemo={true}
        onBack={vi.fn()}
        onUpdate={vi.fn()}
        modo="residente"
      />
    );

    await waitFor(() => expect(screen.getByText('Varilla 3/8')).toBeInTheDocument());

    expect(screen.queryByRole('button', { name: /Registrar Evaluación Técnica/i })).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/Describe tu evaluación general/i)).not.toBeInTheDocument();
  });
});
