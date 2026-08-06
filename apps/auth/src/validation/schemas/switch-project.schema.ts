/**
 * POST /api/v1/auth/switch-project
 *
 * Contrato replicado del chequeo manual existente: proyecto_id obligatorio.
 */
import { z } from 'zod';

export const switchProjectSchema = z.object({
  proyecto_id: z.string().min(1, 'proyecto_id es obligatorio'),
});

export type SwitchProjectInput = z.infer<typeof switchProjectSchema>;
