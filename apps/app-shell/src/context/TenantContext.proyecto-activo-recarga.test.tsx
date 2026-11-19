/**
 * Al recargar, el proyecto activo de la pantalla era siempre projects[0] mientras el JWT conservaba el último
 * proyecto elegido: la pantalla mostraba una obra y el servidor operaba en otra (hallazgo H2, certificación M11).
 * Ver openspec/changes/proyecto-activo-desde-jwt.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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

function jwt(payload: Record<string, unknown>) {
  const b64 = (o: unknown) => btoa(JSON.stringify(o)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64(payload)}.firma`;
}

const me = {
  data: {
    id: 'u1', email: 'a@b.c', name: 'Admin', roles: ['admin'], limite_aprobacion: 10,
    tenant: { id: 't1', name: 'T' },
    projects: [{ id: 'p1', name: 'Obra real' }, { id: 'p2', name: 'PRUEBA M11' }],
  },
};

const Proyecto = () => {
  const { currentProjectId, isLoading } = useTenant();
  return <span>{isLoading ? 'cargando' : `activo:${currentProjectId}`}</span>;
};

describe('proyecto activo al recargar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(api.fetchMe).mockResolvedValue(me);
    vi.mocked(api.switchProjectApi).mockResolvedValue({ data: { access_token: 'nuevo', proyecto_id: 'p1' } });
  });

  it('usa el proyecto del JWT cuando el usuario tiene acceso a él', async () => {
    vi.mocked(api.getAccessToken).mockReturnValue(jwt({ sub: 'u1', proyecto_id: 'p2' }));
    render(<TenantProvider><Proyecto /></TenantProvider>);
    await waitFor(() => expect(screen.getByText('activo:p2')).toBeTruthy());
    expect(api.switchProjectApi).not.toHaveBeenCalled();
  });

  it('si el proyecto del JWT ya no está en su lista, cae al primero y alinea el JWT con switch-project', async () => {
    vi.mocked(api.getAccessToken).mockReturnValue(jwt({ sub: 'u1', proyecto_id: 'p-borrado' }));
    render(<TenantProvider><Proyecto /></TenantProvider>);
    await waitFor(() => expect(screen.getByText('activo:p1')).toBeTruthy());
    expect(api.switchProjectApi).toHaveBeenCalledWith('p1');
    expect(api.setTokens).toHaveBeenCalledWith('nuevo', expect.any(String));
  });

  it('con un token ilegible no truena: cae al primero y alinea', async () => {
    vi.mocked(api.getAccessToken).mockReturnValue('no-es-un-jwt');
    render(<TenantProvider><Proyecto /></TenantProvider>);
    await waitFor(() => expect(screen.getByText('activo:p1')).toBeTruthy());
    expect(api.switchProjectApi).toHaveBeenCalledWith('p1');
  });
});

describe('proyecto activo al iniciar sesión', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(api.getAccessToken).mockReturnValue(null);
  });

  it('toma el proyecto del access_token del login aunque no sea el primero de la lista', async () => {
    vi.mocked(api.loginApi).mockResolvedValue({
      data: { access_token: jwt({ sub: 'u1', proyecto_id: 'p2' }), refresh_token: 'rt', user: me.data },
    });
    const Entrar = () => {
      const { login, currentProjectId } = useTenant();
      return <button onClick={() => login('a@b.c', 'x', 't1')}>{`entrar:${currentProjectId}`}</button>;
    };
    render(<TenantProvider><Entrar /></TenantProvider>);
    screen.getByRole('button').click();
    await waitFor(() => expect(screen.getByText('entrar:p2')).toBeTruthy());
    expect(api.switchProjectApi).not.toHaveBeenCalled();
  });
});
