import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AlmacenView } from './AlmacenView';

vi.mock('../lib/api', () => ({
  default: { get: vi.fn(() => Promise.resolve({ data: { data: [] } })) },
}));

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({ tenant: { id: 'iretum-demo' } }),
}));

describe('AlmacenView — ayuda del módulo', () => {
  it('muestra el botón de ayuda y al hacer clic abre el panel con el título del módulo', async () => {
    render(<AlmacenView activeSubView="inventario" />);

    const helpButton = screen.getByRole('button', { name: /ayuda/i });
    expect(helpButton).toBeInTheDocument();

    fireEvent.click(helpButton);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Ayuda — Almacén/ })).toBeInTheDocument();
    });
  });
});
