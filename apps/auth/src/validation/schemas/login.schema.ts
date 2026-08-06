/**
 * POST /api/v1/auth/login
 *
 * Contrato replicado del chequeo manual existente antes de este change:
 * email/tenant_id se aceptan como string (normalizados con .trim() y
 * lower-case para email dentro del handler, vía normalizeEmail), password
 * es obligatorio sin normalizar (no se hace trim — un espacio es parte de
 * la contraseña), proyecto_id es opcional.
 */
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'email es obligatorio'),
  password: z.string().min(1, 'password es obligatorio'),
  tenant_id: z.string().trim().min(1, 'tenant_id es obligatorio'),
  proyecto_id: z.string().trim().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
