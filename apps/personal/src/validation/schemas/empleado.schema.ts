/**
 * ---------------------------------------------------------------------------
 * Validación de longitud de los campos de texto de Empleado — spec:
 * openspec/changes/fix-personal-validacion-longitud-empleado/
 *
 * Los límites SHALL coincidir exactamente con los `@db.VarChar(n)` de
 * `prisma/schema.prisma` (modelo Empleado). Un valor más largo que su
 * columna hoy revienta con un 500 de Prisma ("The provided value for the
 * column is too long for the column's type. Column: (not available)") —
 * este schema lo convierte en un 400 claro, ANTES de tocar Prisma.
 *
 * A propósito NO reemplaza las validaciones existentes (campos obligatorios
 * en POST/PATCH, RFC duplicado): se usa como chequeo adicional, no como
 * reemplazo — todos los campos son opcionales aquí, así que un campo
 * ausente o vacío nunca falla por este schema (lo sigue cubriendo el
 * chequeo de obligatorios que ya existía).
 * ---------------------------------------------------------------------------
 */

import { z } from 'zod';

const campoTexto = (limite: number, nombre: string) =>
  z
    .string()
    .max(limite, `${nombre} no puede tener más de ${limite} caracteres.`)
    .optional()
    .nullable();

export const longitudEmpleadoSchema = z.object({
  nombre: campoTexto(150, 'nombre'),
  apellido_paterno: campoTexto(100, 'apellido_paterno'),
  apellido_materno: campoTexto(100, 'apellido_materno'),
  rfc: campoTexto(13, 'rfc'),
  curp: campoTexto(18, 'curp'),
  nss: campoTexto(11, 'nss'),
  puesto: campoTexto(100, 'puesto'),
  telefono: campoTexto(20, 'telefono'),
  email: campoTexto(100, 'email'),
  contacto_emergencia_nombre: campoTexto(200, 'contacto_emergencia_nombre'),
  contacto_emergencia_telefono: campoTexto(30, 'contacto_emergencia_telefono'),
  contacto_emergencia_parentesco: campoTexto(50, 'contacto_emergencia_parentesco'),
});
