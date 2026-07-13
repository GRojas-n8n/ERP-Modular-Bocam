export interface LineaParaEmparejar {
  id: string;
  insumo_descripcion: string;
}

export interface RenglonParaEmparejar {
  descripcion: string;
  precio_unitario: string;
}

const TOKEN_LONGITUD_MINIMA = 3;

export function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenizar(texto: string): string[] {
  return normalizarTexto(texto)
    .split(' ')
    .filter(t => t.length >= TOKEN_LONGITUD_MINIMA);
}

/**
 * Empareja cada línea con el renglón de PDF que comparte más palabras
 * significativas (tokens), tolerando distinto orden/redacción entre la
 * descripción del catálogo/requisición y la del proveedor. Sin match si
 * ningún renglón comparte al menos una palabra con la línea.
 */
export function emparejarRenglonesConLineas<L extends LineaParaEmparejar, R extends RenglonParaEmparejar>(
  lineas: L[],
  renglones: R[],
): Map<string, R | null> {
  const renglonesTokens = renglones.map(r => ({ renglon: r, tokens: new Set(tokenizar(r.descripcion)) }));

  const resultado = new Map<string, R | null>();
  for (const linea of lineas) {
    const tokensLinea = new Set(tokenizar(linea.insumo_descripcion));
    let mejor: R | null = null;
    let mejorPuntaje = 0;

    for (const { renglon, tokens } of renglonesTokens) {
      let puntaje = 0;
      for (const token of tokensLinea) {
        if (tokens.has(token)) puntaje++;
      }
      if (puntaje > mejorPuntaje) {
        mejorPuntaje = puntaje;
        mejor = renglon;
      }
    }

    resultado.set(linea.id, mejorPuntaje >= 1 ? mejor : null);
  }

  return resultado;
}
