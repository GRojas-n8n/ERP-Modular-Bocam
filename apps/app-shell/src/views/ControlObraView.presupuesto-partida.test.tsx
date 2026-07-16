import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ControlObraView } from './ControlObraView';

/**
 * Ver openspec/changes/trazabilidad-partida-gt-cp (sección 4).
 * Control de Proyectos no tenía antes ningún acceso a datos de presupuesto
 * por partida — esta pestaña reusa el mismo componente de solo lectura que
 * ya usa Gerencia Técnica.
 */

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({
    tenant: { id: 'tenant-1' },
    user: { id: 'user-1', name: 'CP de Prueba', role: ['control_proyectos'] },
    currentProjectId: 'proyecto-1',
  }),
}));

const get = vi.fn((url: string) => {
  if (url.startsWith('/api/v1/gerencia-tecnica/reportes/control-presupuestal')) {
    return Promise.resolve({
      data: {
        data: {
          proyectoId: 'proyecto-1',
          presupuesto_id: 'pres-1',
          total_presupuestado: 100000,
          total_comprometido: 60000,
          total_pagado: 20000,
          total_disponible: 40000,
          pct_ejercido: 20,
          parcial: false,
          advertencias: [],
          partidas: [{
            concepto_id: 'concepto-1', clave: 'CIM-001', descripcion: 'Cimentación',
            categoria_predominante: 'MATERIAL',
            presupuestado: 100000, comprometido: 60000, pagado: 20000,
            disponible: 40000, pct_ejercido: 20,
          }],
          sin_partida_comprometido: 0, sin_partida_pagado: 0,
        },
      },
    });
  }
  return Promise.resolve({ data: { data: [] } });
});
vi.mock('../lib/api', () => ({
  default: { get: (url: string) => get(url) },
}));

describe('ControlObraView — pestaña Presupuesto por Partida', () => {
  it('usuario control_proyectos ve la tabla de partidas, cargada desde GT', async () => {
    render(<ControlObraView activeSubView="presupuesto-partida" />);

    await waitFor(() =>
      expect(get).toHaveBeenCalledWith(expect.stringContaining('/api/v1/gerencia-tecnica/reportes/control-presupuestal'))
    );
    expect(await screen.findByText('CIM-001')).toBeInTheDocument();
  });

  it('no muestra ningún control de escritura', async () => {
    render(<ControlObraView activeSubView="presupuesto-partida" />);
    await screen.findByText('CIM-001');
    expect(screen.queryByRole('button', { name: /eliminar|editar|aprobar|rechazar|nueva/i })).not.toBeInTheDocument();
  });
});
