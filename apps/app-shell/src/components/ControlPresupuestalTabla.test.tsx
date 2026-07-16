import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ControlPresupuestalTabla } from './ControlPresupuestalTabla';

/**
 * Ver openspec/changes/trazabilidad-partida-gt-cp (sección 3).
 * Drill-down de movimientos por partida, combinando GT (SaldoMovimiento) y
 * Finanzas (MovimientoPresupuestal). Solo lectura — sin acciones de escritura.
 */

const get = vi.fn();
vi.mock('../lib/api', () => ({
  default: {
    get: (url: string) => get(url),
  },
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

describe('ControlPresupuestalTabla — drill-down de movimientos', () => {
  it('al expandir una partida, combina movimientos de GT y Finanzas ordenados por fecha', async () => {
    get.mockImplementation((url: string) => {
      if (url.startsWith('/api/v1/gerencia-tecnica/partidas/')) {
        return Promise.resolve({
          data: {
            data: [
              { id: 'gt-1', referencia_id: 'oc-1', referencia_codigo: 'OC-2026-001', tipo: 'OC', delta: 60000, saldo_resultante: 40000, created_at: '2026-07-10T10:00:00.000Z' },
            ],
          },
        });
      }
      if (url.startsWith('/api/v1/finanzas/movimientos')) {
        return Promise.resolve({
          data: {
            data: [
              { id_movimiento: 'fin-1', tipo: 'COMPROMISO', monto: 60000, referencia_codigo: 'OC-2026-001', fecha_registro: '2026-07-10T10:00:05.000Z' },
            ],
          },
        });
      }
      return Promise.resolve({ data: { data: [] } });
    });

    render(<ControlPresupuestalTabla partidas={[buildPartida()]} />);

    fireEvent.click(screen.getByText('CIM-001'));

    // Ambos movimientos referencian la misma OC — deben aparecer 2 filas de detalle.
    await waitFor(() => expect(screen.getAllByText('OC-2026-001').length).toBe(2));
    expect(get).toHaveBeenCalledWith('/api/v1/gerencia-tecnica/partidas/concepto-1/movimientos');
    expect(get).toHaveBeenCalledWith('/api/v1/finanzas/movimientos?concepto_id=concepto-1');
  });

  it('partida sin movimientos en ningún servicio muestra el mensaje vacío', async () => {
    get.mockResolvedValue({ data: { data: [] } });

    render(<ControlPresupuestalTabla partidas={[buildPartida({ concepto_id: 'concepto-2', clave: 'EST-002' })]} />);

    fireEvent.click(screen.getByText('EST-002'));

    await waitFor(() => expect(screen.getByText('Sin movimientos registrados para esta partida')).toBeInTheDocument());
  });

  it('si Finanzas falla pero GT responde, muestra los movimientos disponibles con nota de lista incompleta', async () => {
    get.mockImplementation((url: string) => {
      if (url.startsWith('/api/v1/gerencia-tecnica/partidas/')) {
        return Promise.resolve({
          data: { data: [{ id: 'gt-1', referencia_id: 'oc-1', referencia_codigo: 'OC-2026-002', tipo: 'OC', delta: 30000, saldo_resultante: 70000, created_at: '2026-07-11T10:00:00.000Z' }] },
        });
      }
      if (url.startsWith('/api/v1/finanzas/movimientos')) {
        return Promise.reject(new Error('timeout'));
      }
      return Promise.resolve({ data: { data: [] } });
    });

    render(<ControlPresupuestalTabla partidas={[buildPartida({ concepto_id: 'concepto-3', clave: 'ACB-003' })]} />);

    fireEvent.click(screen.getByText('ACB-003'));

    await waitFor(() => expect(screen.getByText('OC-2026-002')).toBeInTheDocument());
    expect(screen.getByText(/lista puede estar incompleta/i)).toBeInTheDocument();
  });

  it('no muestra ningún control de escritura (solo lectura)', () => {
    render(<ControlPresupuestalTabla partidas={[buildPartida()]} />);
    expect(screen.queryByRole('button', { name: /eliminar|editar|aprobar|rechazar/i })).not.toBeInTheDocument();
  });
});
