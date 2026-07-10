import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ComprasView } from './ComprasView';

/**
 * Ver openspec/changes/envio-oc-correo-proveedores — tarea 5.5. Verifica que
 * el listado de Órdenes de Compra permite selección múltiple y que, tras un
 * envío exitoso, el indicador "Enviada el {fecha}" se actualiza sin recargar
 * la página completa (releyendo GET /ordenes-compra después del POST).
 */

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({
    tenant: { id: 'bocam-real', name: 'Constructora Bocam' },
    currentProjectId: 'proyecto-1',
    user: { id: 'user-1', name: 'Usuario de Prueba', role: ['procurement'] },
  }),
}));

const notify = vi.fn();
vi.mock('../context/NotificationContext', () => ({
  useNotification: () => ({ notify }),
}));

interface OrdenCompraMockItem {
  id_orden: string;
  codigo: string;
  estado: string;
  fecha_emision: string;
  total: number;
  enviada_proveedor_at: string | null;
  enviada_proveedor_email: string | null;
  proveedor: { razon_social: string };
}

let ordenesCompraMock: OrdenCompraMockItem[] = [
  {
    id_orden: 'oc-1',
    codigo: 'OC-AUTO-1-1',
    estado: 'EMITIDA',
    fecha_emision: '2026-07-10T00:00:00.000Z',
    total: 1160,
    enviada_proveedor_at: null,
    enviada_proveedor_email: null,
    proveedor: { razon_social: 'Aceros del Norte SA de CV' },
  },
  {
    id_orden: 'oc-2',
    codigo: 'OC-AUTO-1-2',
    estado: 'EMITIDA',
    fecha_emision: '2026-07-10T00:00:00.000Z',
    total: 580,
    enviada_proveedor_at: null,
    enviada_proveedor_email: null,
    proveedor: { razon_social: 'Materiales Bajío SA' },
  },
];

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn((url: string) => {
      if (url === '/api/v1/compras/ordenes-compra') {
        return Promise.resolve({ data: { data: ordenesCompraMock } });
      }
      return Promise.resolve({ data: { data: null } });
    }),
    post: vi.fn((url: string) => {
      if (url === '/api/v1/compras/ordenes-compra/enviar-correo') {
        // Simula el envío exitoso de oc-1 y refleja el nuevo estado en el
        // siguiente GET (igual que haría el backend real).
        ordenesCompraMock = ordenesCompraMock.map((oc) =>
          oc.id_orden === 'oc-1'
            ? { ...oc, enviada_proveedor_at: '2026-07-10T12:00:00.000Z', enviada_proveedor_email: 'compras@aceros.example' }
            : oc,
        );
        return Promise.resolve({
          data: { data: { enviadas: [{ id_orden: 'oc-1', codigo: 'OC-AUTO-1-1', proveedor: 'Aceros del Norte SA de CV' }], fallidas: [] } },
        });
      }
      return Promise.resolve({ data: { data: null } });
    }),
    patch: vi.fn(() => Promise.resolve({ data: { data: null } })),
  },
  comprasApi: {
    getOrdenesCompra: () => Promise.resolve({ data: { data: ordenesCompraMock } }),
    enviarOrdenesCompraCorreo: (idsOrden: string[]) => {
      ordenesCompraMock = ordenesCompraMock.map((oc) =>
        idsOrden.includes(oc.id_orden)
          ? { ...oc, enviada_proveedor_at: '2026-07-10T12:00:00.000Z', enviada_proveedor_email: 'compras@aceros.example' }
          : oc,
      );
      return Promise.resolve({
        data: { data: { enviadas: idsOrden.map((id) => ({ id_orden: id, codigo: ordenesCompraMock.find(o => o.id_orden === id)?.codigo, proveedor: '' })), fallidas: [] } },
      });
    },
  },
}));

describe('ComprasView — Órdenes de Compra — envío por correo', () => {
  beforeEach(() => {
    notify.mockClear();
    ordenesCompraMock = ordenesCompraMock.map((oc) => ({ ...oc, enviada_proveedor_at: null, enviada_proveedor_email: null }));
  });

  it('permite seleccionar una OC y enviarla, y el listado refleja "Enviada" sin recargar', async () => {
    render(<ComprasView activeSubView="ordenes-compra" />);

    await waitFor(() => expect(screen.getByText('OC-AUTO-1-1')).toBeInTheDocument());
    expect(screen.getAllByText('No enviada').length).toBe(2);

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]); // selecciona oc-1

    const botonEnviar = screen.getByRole('button', { name: /Enviar por correo/i });
    expect(botonEnviar).not.toBeDisabled();
    fireEvent.click(botonEnviar);

    await waitFor(() => expect(screen.getByText(/Enviada el/)).toBeInTheDocument());
    expect(screen.getAllByText('No enviada').length).toBe(1);
    expect(notify).toHaveBeenCalledWith(expect.objectContaining({ type: 'success' }));
  });

  it('el botón de envío está deshabilitado sin ninguna OC seleccionada', async () => {
    render(<ComprasView activeSubView="ordenes-compra" />);

    await waitFor(() => expect(screen.getByText('OC-AUTO-1-1')).toBeInTheDocument());

    const botonEnviar = screen.getByRole('button', { name: /Enviar por correo/i });
    expect(botonEnviar).toBeDisabled();
  });
});
