import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ControlPresupuestalTabla } from './ControlPresupuestalTabla';

/**
 * Ver openspec/changes/enlace-trazabilidad-control-presupuestal/.
 * Acción "Ver en Trazabilidad" por fila, visible solo cuando el componente
 * recibe el callback opcional (uso de solo lectura en ControlObraView no
 * pasa el callback y no debe mostrar la acción).
 */

vi.mock('../lib/api', () => ({
  default: { get: vi.fn(() => Promise.resolve({ data: { data: [] } })) },
}));

function buildPartida(overrides: Partial<Record<string, any>> = {}) {
  return {
    concepto_id: 'concepto-1',
    clave: 'CIM-001',
    descripcion: 'Cimentación zapatas aisladas',
    categoria_predominante: 'MATERIAL',
    presupuestado: 100000,
    comprometido: 60000,
    pagado: 20000,
    disponible: 40000,
    pct_ejercido: 20,
    ...overrides,
  };
}

describe('ControlPresupuestalTabla — acción "Ver en Trazabilidad"', () => {
  it('no se renderiza cuando no se pasa onVerTrazabilidad', () => {
    render(<ControlPresupuestalTabla partidas={[buildPartida()]} />);
    expect(screen.queryByRole('button', { name: /ver en trazabilidad/i })).not.toBeInTheDocument();
  });

  it('aparece por fila y al hacer clic invoca el callback con el concepto_id, sin expandir la fila', () => {
    const onVerTrazabilidad = vi.fn();
    render(<ControlPresupuestalTabla partidas={[buildPartida()]} onVerTrazabilidad={onVerTrazabilidad} />);

    fireEvent.click(screen.getByRole('button', { name: /ver en trazabilidad/i }));

    expect(onVerTrazabilidad).toHaveBeenCalledWith('concepto-1');
    expect(screen.queryByText('Sin movimientos registrados para esta partida')).not.toBeInTheDocument();
  });
});
