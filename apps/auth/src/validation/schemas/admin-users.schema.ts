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
import { ROLES_VALIDOS, ROLES_ASIGNABLES } from '../../../../../packages/roles/src';

/**
 * `roles` era `z.array(z.string())`: aceptaba cualquier cadena, así que una
 * errata al crear un usuario ('finanzs', 'almacen') se guardaba sin ruido y el
 * usuario quedaba sin acceso a nada, con el error apareciendo mucho después
 * como un 403 inexplicable en su módulo.
 *
 * Al crear se exige un rol asignable. Al editar se aceptan además los alias
 * históricos, para no bloquear la edición de usuarios que ya los traen — de lo
 * contrario cambiarle el nombre a un usuario con rol 'resident' fallaría.
 */
const IDS_ASIGNABLES = ROLES_ASIGNABLES.map(r => r.id);

/** Valida cada rol de la lista y nombra el primero que no reconoce. */
function validarRoles(permitidos: readonly string[]) {
  return (roles: string[], ctx: z.RefinementCtx) => {
    for (const rol of roles) {
      if (permitidos.includes(rol)) continue;
      ctx.addIssue({
        code: 'custom',
        message: `Rol no reconocido: '${rol}'. Válidos: ${permitidos.join(', ')}.`,
      });
    }
  };
}

const rolesAlCrear = z.array(z.string()).superRefine(validarRoles(IDS_ASIGNABLES)).optional();
const rolesAlEditar = z.array(z.string()).superRefine(validarRoles(ROLES_VALIDOS)).optional();

export const crearUsuarioSchema = z.object({
  email: z.string().trim().min(1, 'email es obligatorio').max(255, 'email no puede tener más de 255 caracteres.'),
  password: z.string().min(1, 'password es obligatorio'),
  nombre: z.string().trim().min(1, 'nombre es obligatorio').max(150, 'nombre no puede tener más de 150 caracteres.'),
  roles: rolesAlCrear,
  proyecto_ids: z.array(z.string()).optional(),
  limite_aprobacion: z.number().optional(),
});

export const actualizarUsuarioSchema = z.object({
  nombre: z.string().trim().min(1).max(150, 'nombre no puede tener más de 150 caracteres.').optional(),
  roles: rolesAlEditar,
  activo: z.boolean().optional(),
  limite_aprobacion: z.number().optional(),
  password: z.string().min(1).optional(),
  proyecto_ids: z.array(z.string()).optional(),
});

export type CrearUsuarioInput = z.infer<typeof crearUsuarioSchema>;
export type ActualizarUsuarioInput = z.infer<typeof actualizarUsuarioSchema>;
