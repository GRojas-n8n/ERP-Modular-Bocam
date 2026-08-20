/**
 * Ver openspec/changes/cambio-password-y-logout.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { CambiarPasswordDialog } from './CambiarPasswordDialog';
import * as api from '../lib/api';

vi.mock('../lib/api', () => ({ changePasswordApi: vi.fn() }));

const LARGA = 'concreto premezclado eje a';

function abrir() {
  const onCerrar = vi.fn();
  const onCambioExitoso = vi.fn();
  render(<CambiarPasswordDialog onCerrar={onCerrar} onCambioExitoso={onCambioExitoso} />);
  return { onCerrar, onCambioExitoso };
}

function llenar(actual: string, nueva: string, confirmacion: string) {
  const [inputActual, inputNueva, inputConfirmar] = Array.from(
    document.querySelectorAll('input[type="password"]')
  ) as HTMLInputElement[];
  fireEvent.change(inputActual, { target: { value: actual } });
  fireEvent.change(inputNueva, { target: { value: nueva } });
  fireEvent.change(inputConfirmar, { target: { value: confirmacion } });
}

describe('CambiarPasswordDialog', () => {
  beforeEach(() => vi.clearAllMocks());

  it('no deja enviar mientras las dos contraseñas nuevas no coinciden', async () => {
    abrir();
    llenar('Bocam2026!', LARGA, 'otra cosa distinta');

    expect(screen.getByText(/no coinciden/i)).toBeInTheDocument();
    expect(screen.getByTestId('confirmar-cambio-password')).toBeDisabled();
  });

  it('no deja enviar una contraseña más corta que el mínimo', async () => {
    abrir();
    llenar('Bocam2026!', 'corta', 'corta');

    expect(screen.getByTestId('confirmar-cambio-password')).toBeDisabled();
    expect(api.changePasswordApi).not.toHaveBeenCalled();
  });

  it('envía la contraseña y avisa de que se cerraron las sesiones', async () => {
    vi.mocked(api.changePasswordApi).mockResolvedValue({ success: true, data: { sesiones_cerradas: 3 } });
    abrir();
    llenar('Bocam2026!', LARGA, LARGA);

    fireEvent.click(screen.getByTestId('confirmar-cambio-password'));

    await waitFor(() => expect(api.changePasswordApi).toHaveBeenCalledWith('Bocam2026!', LARGA));
    expect(await screen.findByText(/vuelve a entrar/i)).toBeInTheDocument();
  });

  it('lleva al login tras el cambio, porque la sesión actual ya no vale', async () => {
    vi.mocked(api.changePasswordApi).mockResolvedValue({ success: true, data: { sesiones_cerradas: 1 } });
    const { onCambioExitoso } = abrir();
    llenar('Bocam2026!', LARGA, LARGA);

    fireEvent.click(screen.getByTestId('confirmar-cambio-password'));
    fireEvent.click(await screen.findByTestId('ir-a-login'));

    expect(onCambioExitoso).toHaveBeenCalled();
  });

  it('muestra el motivo que devuelve el servidor, no un texto genérico', async () => {
    // La política real vive en el backend: si rechaza por reusar la contraseña
    // de arranque, el usuario tiene que leer eso y no "algo salió mal".
    vi.mocked(api.changePasswordApi).mockRejectedValue({
      response: { data: { error: { code: 'AUTH_PASSWORD_DE_ARRANQUE', message: 'Esa es la contraseña de arranque compartida. Elige una distinta.' } } },
    });
    abrir();
    llenar('otra-cosa-larga', LARGA, LARGA);

    fireEvent.click(screen.getByTestId('confirmar-cambio-password'));

    expect(await screen.findByRole('alert')).toHaveTextContent(/arranque compartida/i);
  });
});
