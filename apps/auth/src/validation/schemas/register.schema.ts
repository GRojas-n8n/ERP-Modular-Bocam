/**
 * POST /api/v1/auth/register
 *
 * Contrato replicado del chequeo manual existente: email/password/nombre/
 * tenant_id obligatorios; roles y proyecto_ids opcionales (el handler sigue
 * aplicando su propio default `roles || ['residencia']` tras el parseo — ese
 * fallback es lógica de negocio, no forma, y se deja intacto).
 */
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().trim().min(1, 'email es obligatorio'),
  password: z.string().min(1, 'password es obligatorio'),
  nombre: z.string().trim().min(1, 'nombre es obligatorio'),
  tenant_id: z.string().trim().min(1, 'tenant_id es obligatorio'),
  roles: z.array(z.string()).optional(),
  proyecto_ids: z.array(z.string()).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
