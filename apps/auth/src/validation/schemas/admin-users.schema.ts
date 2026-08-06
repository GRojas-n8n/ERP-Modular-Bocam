/**
 * POST /api/v1/auth/admin/users y PATCH /api/v1/auth/admin/users/:id
 *
 * Contrato replicado de los chequeos manuales existentes:
 * - POST: email/password/nombre obligatorios; roles, proyecto_ids y
 *   limite_aprobacion opcionales.
 * - PATCH: todos los campos opcionales (patrón `if (campo !== undefined)`
 *   ya existente en el handler para construir el update parcial); password,
 *   si viene, no puede ser cadena vacía (el handler solo hashea `if (password)`).
 */
import { z } from 'zod';

export const crearUsuarioSchema = z.object({
  email: z.string().trim().min(1, 'email es obligatorio'),
  password: z.string().min(1, 'password es obligatorio'),
  nombre: z.string().trim().min(1, 'nombre es obligatorio'),
  roles: z.array(z.string()).optional(),
  proyecto_ids: z.array(z.string()).optional(),
  limite_aprobacion: z.number().optional(),
});

export const actualizarUsuarioSchema = z.object({
  nombre: z.string().trim().min(1).optional(),
  roles: z.array(z.string()).optional(),
  activo: z.boolean().optional(),
  limite_aprobacion: z.number().optional(),
  password: z.string().min(1).optional(),
  proyecto_ids: z.array(z.string()).optional(),
});

export type CrearUsuarioInput = z.infer<typeof crearUsuarioSchema>;
export type ActualizarUsuarioInput = z.infer<typeof actualizarUsuarioSchema>;
