import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FinanzasView } from './FinanzasView';
import { DEMO_RESUMEN_FINANCIERO } from '../lib/demoData';

/**
 * Ver openspec/changes/fix-encabezados-tablas-finanzas-y-panel-inteligencia.
 * Antes de este change la vista usaba invertidos TableHead (<th>) y
 * TableHeader (<thead>) de @bocam/ui-core: el encabezado quedaba como
 * <th><tr><thead>Código</thead>…</tr></th> y todos los títulos se apilaban
 * en la primera columna. Encabezado y filas deben compartir la misma
 * estructura de columnas.
 */

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({
    tenant: { id: 'bocam-real', name: 'Constructora Bocam' },
    currentProjectId: 'proj-001',
    user: {
      id: 'user-1',
      name: 'Usuario de Prueba',
      role: ['finanzas'],
      projects: [{ id: 'proj-001', name: 'Torre Corporativa Norte', code: 'TCN-2024', status: 'En curso' }],
    },
  }),
}));

vi.mock('../context/NotificationContext', () => ({
  useNotification: () => ({ notify: vi.fn() }),
}));

const PRESUPUESTOS = [
  {
    id_presupuesto: 'p-1', codigo: 'CIM-003', descripcion: 'Concreto f\'c=250 en zapatas', capitulo: 'MATERIALES',
    monto_autorizado: 1076816, monto_comprometido: 331296, monto_ejercido: 0, monto_disponible: 745520,
  },
  {
    id_presupuesto: 'p-2', codigo: 'PRE-001', descripcion: 'Trazo y nivelación', capitulo: 'MANO_OBRA',
    monto_autorizado: 35904, monto_comprometido: 0, monto_ejercido: 0, monto_disponible: 35904,
  },
];

const PAGOS_OC = [
  {
    id_pago: 'pg-1', fecha_pago: '2026-10-30T00:00:00.000Z', referencia: 'TRF-001', fuente: 'CUENTA_BANCARIA',
    cuenta: { alias: 'BBVA Obra' }, monto_total: 331296, detalles: [{ oc_codigo: 'OC-AUTO-1' }],
  },
];

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn((url: string) => {
      const respuestas: Record<string, unknown> = {
        '/api/v1/finanzas/dashboard': { resumen_presupuestal: DEMO_RESUMEN_FINANCIERO, alertas: [] },
        '/api/v1/finanzas/presupuestos': PRESUPUESTOS,
        '/api/v1/finanzas/pagos-oc': PAGOS_OC,
      };
      return Promise.resolve({ data: { data: respuestas[url] ?? [] } });
    }),
    post: vi.fn(),
  },
}));

async function tablaDeSeccion(titulo: string): Promise<HTMLTableElement> {
  render(<FinanzasView />);
  // findByText con selector h2 (no findByRole): el cálculo de roles sobre el DOM
  // inválido anterior al fix tardaba más que el timeout y ocultaba el fallo real.
  const encabezado = await screen.findByText(titulo, { selector: 'h2' }, { timeout: 5000 });
  const tabla = encabezado.closest('.space-y-4')?.querySelector('table');
  if (!tabla) throw new Error(`No se encontró la tabla de "${titulo}"`);
  return tabla;
}

/** Hijos directos de la tabla y de cada grupo: así se detecta la anidación invertida. */
function estructura(tabla: HTMLTableElement) {
  const theads = [...tabla.children].filter((n) => n.tagName === 'THEAD');
  const filaEncabezado = theads[0]?.querySelector(':scope > tr');
  const th = filaEncabezado ? [...filaEncabezado.children].filter((n) => n.tagName === 'TH') : [];
  const filas = [...(tabla.querySelector(':scope > tbody')?.children ?? [])];
  return { theads, th, filas };
}

describe('FinanzasView — encabezados de tabla alineados con sus columnas', () => {
  it('Presupuestos Asignados: un thead > tr con 7 th, en el mismo orden que los 7 td de cada fila', async () => {
    const { theads, th, filas } = estructura(await tablaDeSeccion('Presupuestos Asignados'));

    expect(theads).toHaveLength(1);
    expect(th.map((c) => c.textContent?.trim())).toEqual([
      'Código', 'Descripción', 'Capítulo', 'Autorizado', 'Comprometido', 'Ejercido', 'Disponible',
    ]);
    expect(filas).toHaveLength(PRESUPUESTOS.length);
    for (const fila of filas) expect(fila.querySelectorAll(':scope > td')).toHaveLength(th.length);
  });

  it('Presupuestos Asignados: los títulos de montos van alineados a la derecha', async () => {
    const { th } = estructura(await tablaDeSeccion('Presupuestos Asignados'));
    const porTitulo = new Map(th.map((c) => [c.textContent?.trim(), c]));

    for (const titulo of ['Autorizado', 'Comprometido', 'Ejercido', 'Disponible']) {
      expect(porTitulo.get(titulo)?.className).toContain('text-right');
    }
    for (const titulo of ['Código', 'Descripción', 'Capítulo']) {
      expect(porTitulo.get(titulo)?.className).not.toContain('text-right');
    }
  });

  it('Pagos de OCs: un thead > tr con tantos th como td tiene cada fila', async () => {
    const { theads, th, filas } = estructura(await tablaDeSeccion('Pagos de OCs'));

    expect(theads).toHaveLength(1);
    expect(th.map((c) => c.textContent?.trim())).toEqual(['Fecha', 'Referencia', 'Fuente', 'OCs cubiertas', 'Total']);
    expect(filas).toHaveLength(PAGOS_OC.length);
    for (const fila of filas) expect(fila.querySelectorAll(':scope > td')).toHaveLength(th.length);
    expect(th[4].className).toContain('text-right');
  });
});
