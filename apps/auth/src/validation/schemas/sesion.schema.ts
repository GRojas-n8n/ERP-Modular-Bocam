/**
 * POST /api/v1/auth/logout y POST /api/v1/auth/change-password
 *
 * Ver openspec/changes/cambio-password-y-logout.
 */
import { z } from 'zod';

/**
 * `refresh_token` es opcional: el cliente puede haberlo perdido y aun así
 * querer cerrar sesión. Sin él se revoca toda la cadena de sesiones del usuario
 * autenticado, que es el comportamiento seguro por defecto.
 * `todas` fuerza esa revocación total aunque venga el token.
 */
export const logoutSchema = z.object({
  refresh_token: z.string().min(1).optional(),
  todas: z.boolean().optional(),
});

export const cambiarPasswordSchema = z.object({
  password_actual: z.string().min(1, 'password_actual es obligatorio'),
  password_nueva: z.string().min(1, 'password_nueva es obligatorio'),
});

export type LogoutInput = z.infer<typeof logoutSchema>;
export type CambiarPasswordInput = z.infer<typeof cambiarPasswordSchema>;
