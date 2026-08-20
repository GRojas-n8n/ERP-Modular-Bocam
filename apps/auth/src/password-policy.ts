/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Clasificación: Estrictamente Confidencial.
 * ---------------------------------------------------------------------------
 * Política de contraseñas para el cambio autoservicio.
 *
 * Se premia la longitud por encima de las reglas de composición: exigir
 * mayúscula + número + símbolo en obra produce contraseñas anotadas en el
 * casco, no contraseñas más fuertes. Una frase larga es mejor y se recuerda.
 *
 * Ver openspec/changes/cambio-password-y-logout.
 * ---------------------------------------------------------------------------
 */

export const LONGITUD_MINIMA_PASSWORD = 12;

/**
 * Contraseña con la que se dan de alta todos los usuarios del piloto. Se
 * bloquea explícitamente como contraseña nueva: es conocida por todo el equipo
 * y volver a ella anula el propósito del cambio.
 */
export const PASSWORD_DE_ARRANQUE = 'Bocam2026!';

export interface ResultadoValidacion {
  valida: boolean;
  codigo?:
    | 'AUTH_PASSWORD_MUY_CORTA'
    | 'AUTH_PASSWORD_SIN_CAMBIO'
    | 'AUTH_PASSWORD_DE_ARRANQUE';
  mensaje?: string;
}

export function esPasswordDeArranque(password: string): boolean {
  return password.trim().toLowerCase() === PASSWORD_DE_ARRANQUE.toLowerCase();
}

export function validarPasswordNueva(input: {
  actual: string;
  nueva: string;
}): ResultadoValidacion {
  const { actual, nueva } = input;

  // Se compara recortada: un espacio pegado al copiar no convierte la misma
  // contraseña en una distinta.
  if (nueva.trim() === actual.trim()) {
    return {
      valida: false,
      codigo: 'AUTH_PASSWORD_SIN_CAMBIO',
      mensaje: 'La contraseña nueva debe ser distinta de la actual.',
    };
  }

  if (esPasswordDeArranque(nueva)) {
    return {
      valida: false,
      codigo: 'AUTH_PASSWORD_DE_ARRANQUE',
      mensaje: 'Esa es la contraseña de arranque compartida. Elige una distinta.',
    };
  }

  if (nueva.trim().length < LONGITUD_MINIMA_PASSWORD) {
    return {
      valida: false,
      codigo: 'AUTH_PASSWORD_MUY_CORTA',
      mensaje: `La contraseña debe tener al menos ${LONGITUD_MINIMA_PASSWORD} caracteres. Una frase que recuerdes funciona bien.`,
    };
  }

  return { valida: true };
}
