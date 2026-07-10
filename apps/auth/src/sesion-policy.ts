// Límite absoluto de duración de sesión, independiente de qué tan activo
// esté el usuario. Ver openspec/changes/sesion-jwt-inactividad.

/**
 * true si han pasado más de maxHoras desde que inició la sesión original
 * (login), sin importar cuántas veces se haya rotado el refresh token desde
 * entonces. sesionIniciadaEn === null (tokens emitidos antes de este
 * cambio, que no tienen el campo poblado) NO se consideran expirados —
 * se otorga el beneficio de la duda a sesiones ya en curso al desplegar.
 */
export function sesionExcedeLimite(
  sesionIniciadaEn: Date | null,
  ahora: Date,
  maxHoras: number
): boolean {
  if (sesionIniciadaEn === null) return false;
  const horasTranscurridas = (ahora.getTime() - sesionIniciadaEn.getTime()) / (1000 * 60 * 60);
  return horasTranscurridas > maxHoras;
}
