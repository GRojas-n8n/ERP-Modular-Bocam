// Reglas puras de construcción y validación del código de Centro de Costos
// (13 posiciones: EMPRESA[3] + AÑO[4] + CLIENTE[3] + CONSECUTIVO[3]).
// Ver openspec/changes/centro-costos-alta-formal.

export const EMPRESAS_VALIDAS = ['CIB', 'HCO', 'HSE', 'SEO'] as const;
export type EmpresaGrupo = (typeof EMPRESAS_VALIDAS)[number];

export const ESTATUS_VALIDOS = ['ABIERTO', 'EN EJECUCIÓN', 'EN COBRO', 'TERMINADO', 'CERRADO'] as const;
export type EstatusCentroCostos = (typeof ESTATUS_VALIDOS)[number];

// Mapeo de vocabulario legacy → vigente. Cualquier proyecto creado antes de
// este cambio con uno de estos valores se remapea; ADJUDICADO y LICITACION
// colapsan ambos a ABIERTO (ver design.md, Decisión 5).
const ESTATUS_LEGACY_MAP: Record<string, EstatusCentroCostos> = {
  LICITACION: 'ABIERTO',
  ADJUDICADO: 'ABIERTO',
  CONSTRUCCION: 'EN EJECUCIÓN',
  CIERRE_TECNICO: 'EN COBRO',
  CIERRE_FINANCIERO: 'CERRADO',
};

export function validarEmpresaGrupo(valor: string): valor is EmpresaGrupo {
  return (EMPRESAS_VALIDAS as readonly string[]).includes(valor);
}

export function validarEstatus(valor: string): valor is EstatusCentroCostos {
  return (ESTATUS_VALIDOS as readonly string[]).includes(valor);
}

export function ensamblarCodigoCentroCostos(params: {
  empresa: string;
  anio: number;
  codigoCliente: string;
  consecutivo: number;
}): string {
  const anioStr = String(params.anio).padStart(4, '0');
  const clienteStr = params.codigoCliente.padStart(3, '0');
  const consecutivoStr = String(params.consecutivo).padStart(3, '0');
  return `${params.empresa}${anioStr}${clienteStr}${consecutivoStr}`;
}

/**
 * Dado el conteo de centros de costos ya existentes para el mismo
 * (empresa, año, cliente), retorna el siguiente consecutivo disponible.
 * Se usa también para reintentar tras una colisión de unicidad: si el
 * consecutivo calculado ya existe, se vuelve a llamar pasando ese mismo
 * valor como "cuenta actual" para obtener el siguiente.
 */
export function siguienteConsecutivo(countExistente: number): number {
  return countExistente + 1;
}

/**
 * Remapea un valor de estatus legacy al vocabulario vigente. Si el valor ya
 * pertenece al vocabulario vigente, lo retorna sin cambios. Lanza
 * ESTATUS_DESCONOCIDO si el valor no es reconocido en ninguno de los dos
 * vocabularios (legacy o vigente) — evita migrar datos corruptos en
 * silencio.
 */
export function migrarEstatusLegacy(valor: string): EstatusCentroCostos {
  if (validarEstatus(valor)) return valor;
  const migrado = ESTATUS_LEGACY_MAP[valor];
  if (!migrado) {
    throw new Error(`ESTATUS_DESCONOCIDO: "${valor}" no pertenece al vocabulario legacy ni al vigente.`);
  }
  return migrado;
}
