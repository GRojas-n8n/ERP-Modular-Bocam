/**
 * Descuento atómico de una cuenta bancaria. Punto único para todo egreso que sale de una cuenta: egreso de OCs
 * (egreso-oc.ts) y ejecución de pagos programados (programa-pagos.ts); abono de cobros (cuentas-por-cobrar.ts).
 * M12 agregará aquí el libro bancario.
 * openspec: corregir-ejecucion-programa-pagos.
 *
 * UPDATE condicional (saldo >= monto, cuenta activa, de empresa o del mismo proyecto): dos egresos simultáneos nunca
 * dejan la cuenta en negativo. Si no descuenta, distingue la causa para responder con el código correcto.
 */
import { createTenantContext } from './db';
import { ErrorFinanzas } from './errores';
import type { Dec } from './montos';

type Tx = Parameters<Parameters<typeof createTenantContext>[1]>[0];

export async function descontarCuentaBancaria(
  tx: Tx, tenantId: string, proyectoId: string, cuentaId: string, monto: Dec,
): Promise<void> {
  const total = monto.toFixed(2);
  const n = await tx.$executeRaw`
    UPDATE "cuentas_bancarias"
       SET "saldo" = "saldo" - ${total}::numeric, "updated_at" = now()
     WHERE "id_cuenta" = ${cuentaId}::uuid
       AND "tenant_id" = ${tenantId}::uuid
       AND "activa" = true
       AND ("proyecto_id" IS NULL OR "proyecto_id" = ${proyectoId}::uuid)
       AND "saldo" >= ${total}::numeric`;
  if (n === 1) return;
  const cuenta = await tx.cuentaBancaria.findFirst({ where: { id_cuenta: cuentaId, tenant_id: tenantId } });
  if (!cuenta || !cuenta.activa) throw new ErrorFinanzas(404, 'FIN_CUENTA_NO_ENCONTRADA', 'Cuenta bancaria no encontrada o inactiva.');
  if (cuenta.proyecto_id && cuenta.proyecto_id !== proyectoId) {
    throw new ErrorFinanzas(422, 'FIN_CUENTA_OTRO_PROYECTO', 'La cuenta pertenece a otro proyecto; no puede pagar compromisos de este proyecto.');
  }
  throw new ErrorFinanzas(422, 'FIN_SALDO_INSUFICIENTE',
    `Saldo insuficiente. Disponible: $${Number(cuenta.saldo).toFixed(2)}, requerido: $${total}.`);
}

/**
 * Abono atómico a una cuenta bancaria (cobro de cuentas por cobrar). Misma regla de pertenencia que el descuento:
 * cuenta activa del tenant, de empresa o del mismo proyecto. openspec: cuentas-por-cobrar-estimaciones.
 */
export async function abonarCuentaBancaria(
  tx: Tx, tenantId: string, proyectoId: string, cuentaId: string, monto: Dec,
): Promise<void> {
  const total = monto.toFixed(2);
  const n = await tx.$executeRaw`
    UPDATE "cuentas_bancarias"
       SET "saldo" = "saldo" + ${total}::numeric, "updated_at" = now()
     WHERE "id_cuenta" = ${cuentaId}::uuid
       AND "tenant_id" = ${tenantId}::uuid
       AND "activa" = true
       AND ("proyecto_id" IS NULL OR "proyecto_id" = ${proyectoId}::uuid)`;
  if (n === 1) return;
  const cuenta = await tx.cuentaBancaria.findFirst({ where: { id_cuenta: cuentaId, tenant_id: tenantId } });
  if (!cuenta || !cuenta.activa) throw new ErrorFinanzas(404, 'FIN_CUENTA_NO_ENCONTRADA', 'Cuenta bancaria no encontrada o inactiva.');
  throw new ErrorFinanzas(422, 'FIN_CUENTA_OTRO_PROYECTO', 'La cuenta pertenece a otro proyecto; no puede recibir cobros de este proyecto.');
}
