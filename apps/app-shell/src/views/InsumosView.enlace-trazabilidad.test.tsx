import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { InsumosView } from './InsumosView';

/**
 * Ver openspec/changes/enlace-trazabilidad-control-presupuestal/.
 * "Ver en Trazabilidad" desde una fila de Control Presupuestal cambia a la
 * pestaña Trazabilidad (vía onSubNavigate) y expande automáticamente la
 * misma partida cuando aparece en los datos cargados.
 */

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({
    tenant: { id: 'bocam-real', name: 'Constructora Bocam' },
    currentProjectId: 'proyecto-1',
    user: { id: 'user-1', name: 'Usuario de Prueba' },
  }),
}));

vi.mock('../context/NotificationContext', () => ({
  useNotification: () => ({ notify: vi.fn() }),
}));

const CP_PARTIDA = {
  concepto_id: 'concepto-1', clave: 'CIM-001', descripcion: 'Cimentación', categoria_predominante: 'MATERIAL',
  presupuestado: 100000, comprometido: 60000, pagado: 20000, disponible: 40000, pct_ejercido: 20,
};
const CP_PARTIDA_SIN_TRAZ = {
  concepto_id: 'concepto-2', clave: 'EST-002', descripcion: 'Estructura sin trazabilidad', categoria_predominante: 'EQUIPO',
  presupuestado: 50000, comprometido: 10000, pagado: 0, disponible: 40000, pct_ejercido: 20,
};

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn((url: string) => {
      if (url === '/api/v1/gerencia-tecnica/reportes/control-presupuestal') {
        return Promise.resolve({
          data: {
            data: {
              proyectoId: 'proyecto-1', presupuesto_id: 'p-1',
              total_presupuestado: 150000, total_comprometido: 70000, total_pagado: 20000, total_disponible: 80000, pct_ejercido: 47,
              parcial: false, advertencias: [], partidas: [CP_PARTIDA, CP_PARTIDA_SIN_TRAZ],
              sin_partida_comprometido: 0, sin_partida_pagado: 0,
            },
          },
        });
      }
      if (url === '/api/v1/gerencia-tecnica/trazabilidad/resumen') {
        return Promise.resolve({
          data: {
            data: [
              { concepto_id: 'concepto-1', clave: 'CIM-001', descripcion: 'Cimentación', monto_presupuestado: 100000, monto_comprado: 60000, monto_consumido: 20000, semaforo: 'VERDE', pct_comprado: 60, pct_consumido: 20 },
            ],
            parcial: false,
          },
        });
      }
      return Promise.resolve({ data: { data: null } });
    }),
    post: vi.fn(() => Promise.resolve({ data: { data: null } })),
    patch: vi.fn(() => Promise.resolve({ data: { data: null } })),
  },
}));

function trCaret(clave: string) {
  const row = screen.getByText(clave).closest('tr');
  if (!row) throw new Error(`No se encontró la fila de ${clave}`);
  return row.querySelector('td')?.textContent;
}

function clickVerTrazabilidad(clave: string) {
  const row = screen.getByText(clave).closest('tr');
  if (!row) throw new Error(`No se encontró la fila de ${clave}`);
  fireEvent.click(within(row).getByRole('button', { name: /ver en trazabilidad/i }));
}

describe('InsumosView — salto "Ver en Trazabilidad" desde Control Presupuestal', () => {
  it('cambia a la pestaña Trazabilidad y expande la partida cuando existe en los datos cargados', async () => {
    const onSubNavigate = vi.fn();
    const { rerender } = render(<InsumosView activeSubView="control-presupuestal" onSubNavigate={onSubNavigate} />);

    await waitFor(() => expect(screen.getByText('CIM-001')).toBeInTheDocument());

    clickVerTrazabilidad('CIM-001');
    expect(onSubNavigate).toHaveBeenCalledWith('trazabilidad');

    rerender(<InsumosView activeSubView="trazabilidad" onSubNavigate={onSubNavigate} />);

    await waitFor(() => expect(trCaret('CIM-001')).toBe('▾'));
  });

  it('si la partida no existe en Trazabilidad, no expande ninguna fila y no hay error visible', async () => {
    const onSubNavigate = vi.fn();
    const { rerender } = render(<InsumosView activeSubView="control-presupuestal" onSubNavigate={onSubNavigate} />);

    await waitFor(() => expect(screen.getByText('EST-002')).toBeInTheDocument());

    clickVerTrazabilidad('EST-002');
    expect(onSubNavigate).toHaveBeenCalledWith('trazabilidad');

    rerender(<InsumosView activeSubView="trazabilidad" onSubNavigate={onSubNavigate} />);

    await waitFor(() => expect(screen.getByText('CIM-001')).toBeInTheDocument());
    expect(trCaret('CIM-001')).toBe('▸');
  });
});
