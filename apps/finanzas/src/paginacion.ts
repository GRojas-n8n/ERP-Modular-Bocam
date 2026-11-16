/**
 * Paginación por llave (keyset) para los listados de Finanzas: `?limit=` (1 a 500, 500 por defecto) y `?cursor=`
 * (opaco, devuelto en `meta.paginacion.next_cursor`). La respuesta conserva `data` como arreglo: la pantalla actual
 * sigue leyendo la primera página sin cambios. openspec: optimizar-api-y-dashboard-finanzas.
 *
 * El cursor codifica (valor de orden, id) de la última fila; la siguiente página es estrictamente posterior en el
 * mismo orden, así que una fila insertada entre páginas nunca se repite ni desplaza a otra.
 */
import { ErrorFinanzas } from './errores';

export const LIMITE_MAXIMO = 500;

export interface Paginacion {
  limit: number;
  cursor: { valor: Date; id: string } | null;
}

export function parsearPaginacion(query: any): Paginacion {
  const limit = query?.limit === undefined ? LIMITE_MAXIMO : Number(query.limit);
  if (!Number.isInteger(limit) || limit < 1 || limit > LIMITE_MAXIMO) {
    throw new ErrorFinanzas(400, 'FIN_LIMIT_INVALIDO', `limit debe ser un entero entre 1 y ${LIMITE_MAXIMO}.`);
  }
  if (query?.cursor === undefined || query.cursor === '') return { limit, cursor: null };
  try {
    const [v, id] = JSON.parse(Buffer.from(String(query.cursor), 'base64url').toString('utf8')) as [string, string];
    const valor = new Date(v);
    if (Number.isNaN(valor.getTime()) || typeof id !== 'string' || !id) throw new Error('cursor');
    return { limit, cursor: { valor, id } };
  } catch {
    throw new ErrorFinanzas(400, 'FIN_CURSOR_INVALIDO', 'cursor no es válido; usa el next_cursor de la respuesta anterior.');
  }
}

export function codificarCursor(valor: Date, id: string): string {
  return Buffer.from(JSON.stringify([valor.toISOString(), id]), 'utf8').toString('base64url');
}

/**
 * Condición Prisma "después del cursor" para un orden (campo, id) ascendente o descendente.
 * Se combina con el where del listado mediante AND.
 */
export function despuesDe(campo: string, campoId: string, orden: 'asc' | 'desc', p: Paginacion): Record<string, unknown> {
  if (!p.cursor) return {};
  const op = orden === 'asc' ? 'gt' : 'lt';
  return {
    OR: [
      { [campo]: { [op]: p.cursor.valor } },
      { [campo]: p.cursor.valor, [campoId]: { [op]: p.cursor.id } },
    ],
  };
}

/** Pide limit + 1 filas; si sobra una, hay página siguiente. */
export function cortarPagina<T>(filas: T[], p: Paginacion, valor: (f: T) => Date, id: (f: T) => string) {
  const hayMas = filas.length > p.limit;
  const pagina = hayMas ? filas.slice(0, p.limit) : filas;
  const ultima = pagina[pagina.length - 1];
  return {
    data: pagina,
    paginacion: { limit: p.limit, next_cursor: hayMas && ultima ? codificarCursor(valor(ultima), id(ultima)) : null },
  };
}
