import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ControlPresupuestalTabla } from './ControlPresupuestalTabla';

/**
 * Ver openspec/changes/buscador-control-presupuestal/.
 * ControlPresupuestalTabla era la única tabla grande del módulo de Gerencia
 * Técnica sin buscador — se agrega filtrado client-side por clave/descripción.
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

const PARTIDAS = [
  buildPartida(),
  buildPartida({ concepto_id: 'concepto-2', clave: 'EST-002', descripcion: 'Estructura de acero', categoria_predominante: 'EQUIPO' }),
];

describe('ControlPresupuestalTabla — buscador por clave/descripción', () => {
  it('filtra por clave', () => {
    render(<ControlPresupuestalTabla partidas={PARTIDAS} />);

    fireEvent.change(screen.getByPlaceholderText(/buscar por clave o descripción/i), { target: { value: 'EST-002' } });

    expect(screen.queryByText('CIM-001')).not.toBeInTheDocument();
    expect(screen.getByText('EST-002')).toBeInTheDocument();
  });

  it('filtra por descripción, sin distinguir mayúsculas/minúsculas', () => {
    render(<ControlPresupuestalTabla partidas={PARTIDAS} />);

    fireEvent.change(screen.getByPlaceholderText(/buscar por clave o descripción/i), { target: { value: 'acero' } });

    expect(screen.queryByText('CIM-001')).not.toBeInTheDocument();
    expect(screen.getByText('EST-002')).toBeInTheDocument();
  });

  it('sin resultados muestra un estado vacío de filtro', () => {
    render(<ControlPresupuestalTabla partidas={PARTIDAS} />);

    fireEvent.change(screen.getByPlaceholderText(/buscar por clave o descripción/i), { target: { value: 'no-existe-xyz' } });

    expect(screen.queryByText('CIM-001')).not.toBeInTheDocument();
    expect(screen.queryByText('EST-002')).not.toBeInTheDocument();
    expect(screen.getByText(/no hay partidas que coincidan/i)).toBeInTheDocument();
  });

  it('la fila "[Sin partida asignada]" se oculta si hay búsqueda activa que no coincide', () => {
    render(<ControlPresupuestalTabla partidas={PARTIDAS} sinPartidaComprometido={500} sinPartidaPagado={0} />);

    expect(screen.getByText('[Sin partida asignada]')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/buscar por clave o descripción/i), { target: { value: 'CIM' } });

    expect(screen.queryByText('[Sin partida asignada]')).not.toBeInTheDocument();
  });

  it('la fila "[Sin partida asignada]" se muestra si la búsqueda coincide con "sin partida"', () => {
    render(<ControlPresupuestalTabla partidas={PARTIDAS} sinPartidaComprometido={500} sinPartidaPagado={0} />);

    fireEvent.change(screen.getByPlaceholderText(/buscar por clave o descripción/i), { target: { value: 'sin partida' } });

    expect(screen.getByText('[Sin partida asignada]')).toBeInTheDocument();
    expect(screen.queryByText('CIM-001')).not.toBeInTheDocument();
  });
});
