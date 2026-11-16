/**
 * Error de negocio de Finanzas con estado HTTP y código estable. Los módulos de dominio (egreso-oc,
 * presupuesto-blindado, tesoreria, programa-pagos) lo lanzan; los endpoints lo traducen a createApiError.
 */
export class ErrorFinanzas extends Error {
  constructor(readonly status: number, readonly code: string, message: string) {
    super(message);
  }
}
