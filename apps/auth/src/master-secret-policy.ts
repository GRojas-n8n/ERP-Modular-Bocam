import crypto from 'crypto';

// Comparación de tiempo constante (jwt-hardening-algoritmo-y-timing): `!==`
// hace short-circuit en el primer carácter distinto, lo que en teoría permite
// un ataque de timing contra el secreto que protege alta/baja de tenants.
export function secretsMatch(provided: string, expected: string): boolean {
  const providedBuf = Buffer.from(provided);
  const expectedBuf = Buffer.from(expected);
  if (providedBuf.length !== expectedBuf.length) {
    // Comparación dummy de igual duración que una real, para no filtrar por
    // timing que la longitud no coincidió (el early-return por sí solo sería
    // un side-channel más burdo).
    crypto.timingSafeEqual(expectedBuf, expectedBuf);
    return false;
  }
  return crypto.timingSafeEqual(providedBuf, expectedBuf);
}
