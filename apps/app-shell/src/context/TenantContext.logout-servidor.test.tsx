/**
 * El cierre de sesión era solo del cliente: borraba localStorage y el refresh
 * token seguía vivo en la base hasta expirar.
 * Ver openspec/changes/cambio-password-y-logout.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TenantProvider, useTenant } from './TenantContext';
import * as api from '../lib/api';

vi.mock('../lib/api', () => ({
  getAccessToken: vi.fn(() => null),
  setTokens: vi.fn(),
  clearTokens: vi.fn(),
  loginApi: vi.fn(),
  logoutApi: vi.fn(() => Promise.resolve({ success: true })),
  fetchMe: vi.fn(),
  switchProjectApi: vi.fn(),
}));

const Salir = () => {
  const { logout } = useTenant();
  return <button onClick={logout}>salir</button>;
};

function montar() {
  render(<TenantProvider><Salir /></TenantProvider>);
}

describe('logout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('revoca el refresh token en el servidor', async () => {
    localStorage.setItem('iretum_refresh_token', 'rt-abc123');
    montar();

    fireEvent.click(screen.getByText('salir'));

    await waitFor(() => expect(api.logoutApi).toHaveBeenCalledWith('rt-abc123'));
    expect(api.clearTokens).toHaveBeenCalled();
  });

  it('cierra la sesión local aunque el servidor falle', async () => {
    // El usuario pidió salir: debe salir aunque el backend esté caído.
    localStorage.setItem('iretum_refresh_token', 'rt-abc123');
    vi.mocked(api.logoutApi).mockRejectedValue(new Error('backend caído'));
    montar();

    fireEvent.click(screen.getByText('salir'));

    await waitFor(() => expect(api.clearTokens).toHaveBeenCalled());
  });

  it('no llama al servidor si no hay refresh token que revocar', () => {
    montar();

    fireEvent.click(screen.getByText('salir'));

    expect(api.logoutApi).not.toHaveBeenCalled();
    expect(api.clearTokens).toHaveBeenCalled();
  });
});
