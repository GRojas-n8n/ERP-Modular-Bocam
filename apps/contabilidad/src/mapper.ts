import { logWarn } from '../../../packages/observability/src';

export type TipoPoliza =
  | 'EGRESO'
  | 'PASIVO_PROYECTADO'
  | 'REVERSION_PASIVO_PROYECTADO'
  | 'TRANSFERENCIA_INTERNA'
  | 'ESTIMACION'
  | 'AVANCE';

interface MovimientoDef {
  clave_cargo: string;
  clave_abono: string;
  monto: number;
  descripcion: string;
}

export function buildMovimientosForPoliza(
  tipoPoliza: TipoPoliza,
  monto: number,
  descripcion: string,
): MovimientoDef[] {
  switch (tipoPoliza) {
    case 'EGRESO':
      return [{ clave_cargo: '2100', clave_abono: '1100', monto, descripcion }];
    case 'PASIVO_PROYECTADO':
      return [{ clave_cargo: '5110', clave_abono: '2100', monto, descripcion }];
    case 'REVERSION_PASIVO_PROYECTADO':
      return [{ clave_cargo: '2100', clave_abono: '5110', monto, descripcion }];
    case 'TRANSFERENCIA_INTERNA':
      return [{ clave_cargo: '6100', clave_abono: '6100', monto, descripcion }];
    case 'ESTIMACION':
      return [{ clave_cargo: '1200', clave_abono: '4100', monto, descripcion }];
    case 'AVANCE':
      return [{ clave_cargo: '5100', clave_abono: '2100', monto, descripcion }];
    default:
      return [];
  }
}

export async function resolveCuentaId(
  prisma: any,
  clave: string,
): Promise<string | null> {
  const cuenta = await prisma.cuentaContable.findUnique({ where: { clave } });
  if (!cuenta) {
    logWarn(null as any, 'contabilidad', 'contabilidad.mapper.cuenta_not_found', `Cuenta ${clave} no encontrada en catálogo`, { clave });
    return null;
  }
  return cuenta.id_cuenta;
}

export async function persistMovimientos(
  prisma: any,
  asientoId: string,
  movimientosDefs: MovimientoDef[],
  ctx: { tenant_id: string; proyecto_id: string },
): Promise<void> {
  if (movimientosDefs.length === 0) return;

  const totalCargo = movimientosDefs.reduce((s, m) => s + m.monto, 0);
  const totalAbono = movimientosDefs.reduce((s, m) => s + m.monto, 0);

  if (Math.abs(totalCargo - totalAbono) > 0.01) {
    logWarn(null as any, 'contabilidad', 'contabilidad.mapper.descuadre', 'Póliza descuadrada — no se persisten movimientos', {
      asiento_id: asientoId,
      totalCargo,
      totalAbono,
    });
    return;
  }

  const lineas: Array<{
    tenant_id: string;
    proyecto_id: string;
    asiento_id: string;
    cuenta_id: string;
    descripcion: string;
    cargo: number;
    abono: number;
    orden: number;
  }> = [];

  for (let i = 0; i < movimientosDefs.length; i++) {
    const def = movimientosDefs[i];

    const cuentaCargoId = await resolveCuentaId(prisma, def.clave_cargo);
    const cuentaAbonoId = await resolveCuentaId(prisma, def.clave_abono);

    if (!cuentaCargoId || !cuentaAbonoId) {
      logWarn(null as any, 'contabilidad', 'contabilidad.mapper.cuenta_missing', 'No se pudo resolver cuenta — omitiendo línea', {
        asiento_id: asientoId,
        clave_cargo: def.clave_cargo,
        clave_abono: def.clave_abono,
      });
      continue;
    }

    lineas.push({
      tenant_id: ctx.tenant_id,
      proyecto_id: ctx.proyecto_id,
      asiento_id: asientoId,
      cuenta_id: cuentaCargoId,
      descripcion: `${def.descripcion} (cargo)`,
      cargo: def.monto,
      abono: 0,
      orden: i * 2,
    });
    lineas.push({
      tenant_id: ctx.tenant_id,
      proyecto_id: ctx.proyecto_id,
      asiento_id: asientoId,
      cuenta_id: cuentaAbonoId,
      descripcion: `${def.descripcion} (abono)`,
      cargo: 0,
      abono: def.monto,
      orden: i * 2 + 1,
    });
  }

  if (lineas.length > 0) {
    await prisma.movimientoPoliza.createMany({ data: lineas });
  }
}
