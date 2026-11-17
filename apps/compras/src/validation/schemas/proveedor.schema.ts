/**
 * ---------------------------------------------------------------------------
 * Validación de longitud de los campos de texto de Proveedor — spec:
 * openspec/changes/fix-compras-validacion-longitud-proveedor/
 *
 * Los límites SHALL coincidir exactamente con los `@db.VarChar(n)` de
 * `prisma/schema.prisma` (modelo Proveedor). Un valor más largo que su
 * columna hoy revienta con un 500 crudo de Prisma/Postgres — este schema lo
 * convierte en un 400 claro, ANTES de tocar Prisma.
 *
 * A propósito NO reemplaza las validaciones existentes (campos obligatorios
 * en POST, calificacion_desempeno 0.00-5.00, RFC duplicado): se usa como
 * chequeo adicional, no como reemplazo — todos los campos son opcionales
 * aquí, así que un campo ausente o vacío nunca falla por este schema (lo
 * sigue cubriendo el chequeo de obligatorios que ya existía).
 * ---------------------------------------------------------------------------
 */

import { z } from 'zod';

const campoTexto = (limite: number, nombre: string) =>
  z
    .string()
    .max(limite, `${nombre} no puede tener más de ${limite} caracteres.`)
    .optional()
    .nullable();

export const longitudProveedorSchema = z.object({
  rfc_tax_id: campoTexto(20, 'rfc_tax_id'),
  razon_social: campoTexto(255, 'razon_social'),
  email_contacto: campoTexto(100, 'email_contacto'),
  telefono: campoTexto(20, 'telefono'),
  ciudad: campoTexto(100, 'ciudad'),
});
