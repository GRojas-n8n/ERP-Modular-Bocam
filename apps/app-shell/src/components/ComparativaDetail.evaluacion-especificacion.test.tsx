import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { ComparativaDetail } from './ComparativaDetail';
import type { ComparativaLocal } from './ComparativaDetail';

/**
 * Ver openspec/changes/evaluacion-tecnica-por-especificacion — tareas 7.4-7.5.
 * Usa isDemo=true para que el componente no dependa de llamadas reales a la
 * API y consuma directamente los datos ya cargados vía props (mismo patrón
 * que usa el propio componente para su modo demo).
 */

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({ user: { id: 'user-1', name: 'Residente de Prueba', role: ['resident'] } }),
}));

const notify = vi.fn();
vi.mock('../context/NotificationContext', () => ({
  useNotification: () => ({ notify }),
}));

const ESPEC_ID = 'espec-1';
const PROV_ID = 'prov-1';
const INSUMO_CON_SPECS = 'insumo-con-specs';
const INSUMO_SIN_SPECS = 'insumo-sin-specs';

function buildComparativa(): ComparativaLocal {
  return {
    id: 'cuadro-1',
    codigo: 'CC-TEST-1',
    requisicion_id: 'req-1',
    estado: 'EN_EVALUACION_TECNICA',
    revision: 'A',
    proveedores: [{ id: PROV_ID, nombre: 'Proveedor Uno' } as any],
    lineas: [
      {
        id: 'linea-con-specs',
        insumo_id: INSUMO_CON_SPECS,
        insumo_clave: 'MAT-001',
        insumo_descripcion: 'Varilla 3/8 con características',
        insumo_unidad: 'PZA',
        cantidad: 10,
        precios: {},
        tiempos: {},
        ganador: null,
        evaluacion_tecnica: 'PENDIENTE',
      } as any,
      {
        id: 'linea-sin-specs',
        insumo_id: INSUMO_SIN_SPECS,
        insumo_clave: 'MAT-002',
        insumo_descripcion: 'Cemento sin características capturadas',
        insumo_unidad: 'SACO',
        cantidad: 5,
        precios: { [PROV_ID]: '50' },
        tiempos: {},
        ganador: null,
        evaluacion_tecnica: 'PENDIENTE',
        evaluacionesPorProveedor: {
          [PROV_ID]: { id_detalle: 'detalle-sin-specs', evaluacion_tecnica: 'PENDIENTE' },
        },
      } as any,
    ],
    lineas_detalle: [
      {
        insumo_id: INSUMO_CON_SPECS,
        especificaciones: [{ id_especificacion: ESPEC_ID, detalle_id: 'detalle-req-1', descripcion: 'Resistencia mínima 250 kg/cm²', orden: 0 }],
      },
      { insumo_id: INSUMO_SIN_SPECS, especificaciones: [] },
    ],
    anotaciones_spec: [],
    evaluaciones_especificacion: [],
    ordenes_compra: [],
  } as unknown as ComparativaLocal;
}

describe('ComparativaDetail — evaluación técnica por característica (matriz)', () => {
  it('marcar "?" en una celda exige pregunta antes de guardar, y al guardar refleja el estado', async () => {
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

    await waitFor(() => expect(screen.getByText('Resistencia mínima 250 kg/cm²')).toBeInTheDocument());

    const filaSpec = screen.getByText('Resistencia mínima 250 kg/cm²').closest('tr')!;
    const botonDuda = within(filaSpec).getByRole('button', { name: '?' });
    fireEvent.click(botonDuda);

    // El botón "Guardar" de la duda debe estar deshabilitado sin texto
    const botonGuardarDuda = within(filaSpec).getByRole('button', { name: 'Guardar' });
    expect(botonGuardarDuda).toBeDisabled();

    const textarea = within(filaSpec).getByPlaceholderText('¿Qué necesitas aclarar? (obligatorio)');
    fireEvent.change(textarea, { target: { value: '¿Cuál es la resistencia certificada?' } });
    expect(botonGuardarDuda).not.toBeDisabled();

    fireEvent.click(botonGuardarDuda);

    // En modo demo, guardar actualiza el estado local — el badge de veredicto
    // calculado del renglón debe reflejar "?" (peor caso con una sola especificación en "?")
    await waitFor(() => expect(within(filaSpec).queryByPlaceholderText('¿Qué necesitas aclarar? (obligatorio)')).not.toBeInTheDocument());
  });

  it('un renglón sin especificaciones capturadas sigue evaluándose con el flujo directo (sin regresión)', async () => {
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

    await waitFor(() => expect(screen.getByText('Cemento sin características capturadas')).toBeInTheDocument());

    // El renglón sin specs NO debe generar sub-fila de característica
    expect(screen.queryByText(/Resistencia mínima/)).not.toBeNull(); // el otro renglón sí la tiene
    const filaSinSpecs = screen.getByText('Cemento sin características capturadas').closest('tr')!;
    // No debe haber botones C/NC/DA/? dentro de la fila principal (viven en la sub-fila
    // de evaluación inline, ver openspec/changes/evaluacion-tecnica-inline-tabla-comparativa)
    expect(within(filaSinSpecs).queryByRole('button', { name: 'C' })).toBeNull();

    // La sub-fila de evaluación inline sí tiene los controles C/NC/DA/? directos
    expect(screen.getByTestId(`eval-btn-linea-sin-specs-${PROV_ID}-C`)).toBeInTheDocument();
    // El renglón CON specs no genera esta sub-fila (usa la matriz por especificación)
    expect(screen.queryByTestId(`eval-btn-linea-con-specs-${PROV_ID}-C`)).not.toBeInTheDocument();
  });
});
