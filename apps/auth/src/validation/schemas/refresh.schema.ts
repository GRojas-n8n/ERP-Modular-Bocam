/**
 * POST /api/v1/auth/refresh
 *
 * Contrato replicado del chequeo manual existente: refresh_token obligatorio.
 */
import { z } from 'zod';

export const refreshSchema = z.object({
  refresh_token: z.string().min(1, 'refresh_token es obligatorio'),
});

export type RefreshInput = z.infer<typeof refreshSchema>;
