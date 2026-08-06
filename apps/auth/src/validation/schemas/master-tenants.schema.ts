/**
 * POST /api/v1/master/tenants y PATCH /api/v1/master/tenants/:id
 *
 * Contrato replicado de los chequeos manuales existentes: POST exige
 * `nombre`; el resto de campos son opcionales en ambos endpoints (el handler
 * conserva su propio patrón `campo !== undefined` para construir el update
 * parcial en PATCH).
 *
 * Este schema se aplica en la cadena de middlewares del endpoint ANTES de
 * `requireMasterSecret`, sin reemplazarlo — ver main.ts.
 */
import { z } from 'zod';

export const crearTenantSchema = z.object({
  nombre: z.string().trim().min(1, 'nombre es obligatorio'),
  rfc: z.string().optional(),
  plan: z.string().optional(),
  primary_color: z.string().optional(),
  logo_url: z.string().optional(),
});

export const actualizarTenantSchema = z.object({
  nombre: z.string().trim().min(1).optional(),
  rfc: z.string().optional(),
  plan: z.string().optional(),
  primary_color: z.string().optional(),
  logo_url: z.string().optional(),
  activo: z.boolean().optional(),
});

export type CrearTenantInput = z.infer<typeof crearTenantSchema>;
export type ActualizarTenantInput = z.infer<typeof actualizarTenantSchema>;
