/**
 * ---------------------------------------------------------------------------
 * Validación de longitud/rango de los campos de Insumo — spec:
 * openspec/changes/fix-500-importar-insumos-explosion-apu/
 *
 * Los límites SHALL coincidir exactamente con las columnas de
 * `prisma/schema.prisma` (modelo Insumo): `clave` VARCHAR(50), `unidad_medida`
 * VARCHAR(20), `costo_base` DECIMAL(12,4) (máx. 99,999,999.9999). Un valor
 * fuera de estos límites hoy revienta con un 500 crudo de Prisma/Postgres
 * ("The provided value for the column is too long for the column's type") —
 * este schema lo convierte en un 400 claro (alta/edición) u omite la fila
 * (importación en lote), ANTES de tocar Prisma.
 *
 * A propósito NO reemplaza las validaciones de obligatorios/tipo ya
 * existentes en main.ts (POST /insumos, PATCH /insumos/:id, importar-lote):
 * todos los campos aquí son opcionales, así que un campo ausente nunca falla
 * por este schema — lo sigue cubriendo el chequeo de obligatorios que ya
 * existía.
 * ---------------------------------------------------------------------------
 */

import { z } from 'zod';

const COSTO_BASE_MAX = 99_999_999.9999;

export const longitudInsumoSchema = z.object({
  clave: z.string().max(50, 'clave no puede tener más de 50 caracteres.').optional().nullable(),
  unidad_medida: z.string().max(20, 'unidad_medida no puede tener más de 20 caracteres.').optional().nullable(),
  costo_base: z.coerce
    .number()
    .nonnegative('costo_base no puede ser negativo.')
    .max(COSTO_BASE_MAX, `costo_base no puede ser mayor a ${COSTO_BASE_MAX}.`)
    .optional()
    .nullable(),
});
