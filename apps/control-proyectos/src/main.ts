/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Módulo: Control de Proyectos (CP)
 * Puerto: 3013
 *
 * Responsabilidades:
 * 1. Bitácoras de obra, avances físicos, estimaciones de facturación
 *    (migrado de control-obra, ver openspec: fusionar-control-obra-a-control-proyectos).
 * 2. EVM por partida y global (CPI, SPI, EAC, VAC).
 * 3. Curva S programada vs. real.
 * 4. Alertas predictivas automáticas (motor + job 24h).
 * 5. Proyección de cierre y flujo de caja mensual.
 * 6. Suscriptor de eventos RabbitMQ de los demás módulos.
 * ---------------------------------------------------------------------------
 */

import express, { Request, Response, Router } from 'express';
import axios from 'axios';
import basePrisma, { createTenantContext } from './db';
import type { PrismaClient } from './generated/prisma';
import {
  createApiResponse,
  createApiError,
  ControlObraEvents,
  EstadoAvance,
  EstadoEstimacion,
} from './types';
import { createAuthMiddleware, requireEnv, requireProjectAccess, requireRoles } from '../../../packages/auth-middleware/src';
import { createEventBus, BocamEvent } from '../../../packages/event-bus/src';
import {
  buildEventContext,
  buildForwardHeaders,
  createObservabilityMiddleware,
  getCorrelationId,
  initSentry,
  logError,
  logInfo,
  logWarn,
  setupSentryExpressHandler,
} from '../../../packages/observability/src';
import { applyTerminalMutationInContext, buildTerminalHttpResponse, logTerminalState } from '../../../packages/tenant-idempotency/src';

initSentry(process.env.SENTRY_DSN || '', 'control-proyectos');

const eventBus = createEventBus('control-proyectos');
export const app = express();
app.use(express.json());
app.use(createObservabilityMiddleware('control-proyectos'));

const PORT = process.env.PORT || 3013;
const JWT_SECRET = requireEnv('JWT_SECRET');
const FINANZAS_URL = process.env.FINANZAS_URL || 'http://localhost:3004/api/v1/finanzas';
const COMPRAS_URL  = process.env.COMPRAS_URL  || 'http://localhost:3002/api/v1/compras';
const GT_URL       = process.env.GT_URL       || 'http://localhost:3001/api/v1/gerencia-tecnica';

const ESTIMACION_STATUS = {
  PENDIENTE_FINANZAS: EstadoEstimacion.PENDIENTE_CONFIRMACION_FINANZAS,
  ERROR_FINANZAS: EstadoEstimacion.ERROR_FINANZAS,
  APROBADA_FINANCIERA: EstadoEstimacion.APROBADA_FINANCIERA,
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUSCRIPTORES: compras.oc_creada / compras.oc_cancelada → AC comprometido
// por partida (fix-evm-costos-reales, design.md Decisión 1/2). Mismo patrón
// que handleSalidaObraEvent: createTenantContext con el contexto del propio
// evento, fail-soft (try/catch + log, sin relanzar — un evento perdido no
// debe tumbar el suscriptor).
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function handleOcCreadaEvent(event: any): Promise<void> {
  const { oc_id, total, concepto_id } = event.payload as {
    oc_id?: string;
    codigo?: string;
    total?: number;
    concepto_id?: string | null;
  };
  const ctx = {
    tenantId: event.context.tenant_id,
    proyectoId: event.context.proyecto_id,
    userId: event.context.user_id,
  };

  if (!oc_id || total === undefined || total === null) {
    console.error(JSON.stringify({ action: 'control_proyectos.oc_creada.invalid_payload', oc_id }));
    return;
  }

  // Sin concepto_id no hay a qué partida atribuir el comprometido, ni forma
  // de resolverlo después en la cancelación/pago (compras.oc_creada trae
  // concepto_id: loteData.conceptoId || null — puede venir null si la OC no
  // se originó de una requisición ligada a una partida).
  if (!concepto_id) {
    console.log(JSON.stringify({ action: 'control_proyectos.oc_creada.sin_concepto_id', oc_id }));
    return;
  }

  try {
    await createTenantContext(ctx, async (prisma) => {
      const existing = await prisma.ordenCompraSeguimiento.findUnique({ where: { oc_id } });
      if (existing) {
        console.log(JSON.stringify({ action: 'control_proyectos.oc_creada.idempotent', oc_id }));
        return;
      }

      await prisma.ordenCompraSeguimiento.create({
        data: {
          tenant_id: ctx.tenantId,
          proyecto_id: ctx.proyectoId,
          oc_id,
          concepto_id,
          monto_comprometido: total,
          monto_ejercido: 0,
        },
      });

      const prog = await prisma.programacionObra.findFirst({
        where: { tenant_id: ctx.tenantId, proyecto_id: ctx.proyectoId, concepto_id },
      });
      if (!prog) {
        console.log(JSON.stringify({ action: 'control_proyectos.oc_creada.sin_programacion', oc_id, concepto_id }));
        return;
      }

      await prisma.programacionObra.update({
        where: { id: prog.id },
        data: { ac_comprometido: { increment: total } },
      });

      console.log(JSON.stringify({ action: 'control_proyectos.oc_creada.applied', oc_id, concepto_id, total }));
    });
  } catch (err: any) {
    console.error(JSON.stringify({ action: 'control_proyectos.oc_creada.error', oc_id, error: err.message }));
  }
}

export async function handleOcCanceladaEvent(event: any): Promise<void> {
  const { oc_id } = event.payload as { oc_id?: string; codigo?: string; total?: number };
  const ctx = {
    tenantId: event.context.tenant_id,
    proyectoId: event.context.proyecto_id,
    userId: event.context.user_id,
  };

  if (!oc_id) {
    console.error(JSON.stringify({ action: 'control_proyectos.oc_cancelada.invalid_payload' }));
    return;
  }

  try {
    await createTenantContext(ctx, async (prisma) => {
      // El payload de oc_cancelada NO trae concepto_id — se resuelve vía el
      // registro guardado al procesar oc_creada (design.md Decisión 1/2).
      const seguimiento = await prisma.ordenCompraSeguimiento.findUnique({ where: { oc_id } });
      if (!seguimiento) {
        console.log(JSON.stringify({ action: 'control_proyectos.oc_cancelada.sin_seguimiento', oc_id }));
        return;
      }

      // Se revierte lo que sigue comprometido de ESTA OC (no el total
      // original del evento) — así una OC parcialmente pagada y luego
      // cancelada solo revierte el remanente, sin tocar lo ya movido a
      // ac_ejercido por un pago previo.
      const montoARevertir = Number(seguimiento.monto_comprometido);
      if (montoARevertir <= 0) {
        console.log(JSON.stringify({ action: 'control_proyectos.oc_cancelada.idempotent', oc_id }));
        return;
      }

      await prisma.ordenCompraSeguimiento.update({
        where: { oc_id },
        data: { monto_comprometido: 0 },
      });

      const prog = await prisma.programacionObra.findFirst({
        where: { tenant_id: ctx.tenantId, proyecto_id: ctx.proyectoId, concepto_id: seguimiento.concepto_id },
      });
      if (prog) {
        await prisma.programacionObra.update({
          where: { id: prog.id },
          data: { ac_comprometido: { decrement: montoARevertir } },
        });
      }

      console.log(JSON.stringify({
        action: 'control_proyectos.oc_cancelada.applied',
        oc_id,
        concepto_id: seguimiento.concepto_id,
        monto: montoARevertir,
      }));
    });
  } catch (err: any) {
    console.error(JSON.stringify({ action: 'control_proyectos.oc_cancelada.error', oc_id, error: err.message }));
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Ramas nuevas de finanzas.pago_registrado (fix-evm-costos-reales) — se
// definen antes de handlePagoRegistradoEvent porque este las invoca. Ambas
// usan PagoEvmProcesado (dedupe por id_pago) porque, a diferencia de
// almacen.salida_obra (dedupe por movimiento_almacen_id) o compras.oc_creada
// (dedupe por oc_id en OrdenCompraSeguimiento), un pago no tiene una
// entidad propia en este esquema donde apoyar la idempotencia — sin esto,
// un redelivery de RabbitMQ movería fondos o infralría el acumulado de
// mano de obra dos veces.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function aplicarPagoOrdenCompraAlEvm(
  ctx: { tenantId: string; proyectoId: string; userId: string },
  params: { id_pago: string; oc_id: string; monto: number }
): Promise<void> {
  const { id_pago, oc_id, monto } = params;
  try {
    await createTenantContext(ctx, async (prisma) => {
      const yaProcesado = await prisma.pagoEvmProcesado.findUnique({ where: { id_pago } });
      if (yaProcesado) {
        console.log(JSON.stringify({ action: 'control_proyectos.pago_registrado.orden_compra.idempotent', id_pago, oc_id }));
        return;
      }

      const seguimiento = await prisma.ordenCompraSeguimiento.findUnique({ where: { oc_id } });
      if (!seguimiento) {
        console.log(JSON.stringify({ action: 'control_proyectos.pago_registrado.orden_compra.sin_seguimiento', id_pago, oc_id }));
        // Se registra igual como procesado para no reintentar por siempre
        // un oc_id que nunca vamos a poder resolver.
        await prisma.pagoEvmProcesado.create({
          data: { id_pago, tenant_id: ctx.tenantId, proyecto_id: ctx.proyectoId, tipo: 'ORDEN_COMPRA', monto },
        });
        return;
      }

      // Acotado por lo que sigue comprometido de esta OC — protege el
      // invariante ac_comprometido >= 0 sin depender de que monto_pagado
      // del evento coincida exactamente con lo comprometido restante.
      const montoAMover = Math.min(monto, Number(seguimiento.monto_comprometido));
      if (montoAMover > 0) {
        await prisma.ordenCompraSeguimiento.update({
          where: { oc_id },
          data: {
            monto_comprometido: { decrement: montoAMover },
            monto_ejercido: { increment: montoAMover },
          },
        });

        const prog = await prisma.programacionObra.findFirst({
          where: { tenant_id: ctx.tenantId, proyecto_id: ctx.proyectoId, concepto_id: seguimiento.concepto_id },
        });
        if (prog) {
          await prisma.programacionObra.update({
            where: { id: prog.id },
            data: {
              ac_comprometido: { decrement: montoAMover },
              ac_ejercido: { increment: montoAMover },
            },
          });
        }
      }

      await prisma.pagoEvmProcesado.create({
        data: { id_pago, tenant_id: ctx.tenantId, proyecto_id: ctx.proyectoId, tipo: 'ORDEN_COMPRA', monto },
      });

      console.log(JSON.stringify({ action: 'control_proyectos.pago_registrado.orden_compra.applied', id_pago, oc_id, monto: montoAMover }));
    });
  } catch (err: any) {
    console.error(JSON.stringify({ action: 'control_proyectos.pago_registrado.orden_compra.error', id_pago, oc_id, error: err.message }));
  }
}

async function aplicarPagoPreNominaAlEvm(
  ctx: { tenantId: string; proyectoId: string; userId: string },
  params: { id_pago: string; monto: number }
): Promise<void> {
  const { id_pago, monto } = params;
  try {
    await createTenantContext(ctx, async (prisma) => {
      const yaProcesado = await prisma.pagoEvmProcesado.findUnique({ where: { id_pago } });
      if (yaProcesado) {
        console.log(JSON.stringify({ action: 'control_proyectos.pago_registrado.pre_nomina.idempotent', id_pago }));
        return;
      }

      if (monto > 0) {
        await prisma.manoObraProyecto.upsert({
          where: { tenant_id_proyecto_id: { tenant_id: ctx.tenantId, proyecto_id: ctx.proyectoId } },
          create: { tenant_id: ctx.tenantId, proyecto_id: ctx.proyectoId, monto_acumulado: monto },
          update: { monto_acumulado: { increment: monto } },
        });
      }

      await prisma.pagoEvmProcesado.create({
        data: { id_pago, tenant_id: ctx.tenantId, proyecto_id: ctx.proyectoId, tipo: 'PRE_NOMINA', monto },
      });

      console.log(JSON.stringify({ action: 'control_proyectos.pago_registrado.pre_nomina.applied', id_pago, monto }));
    });
  } catch (err: any) {
    console.error(JSON.stringify({ action: 'control_proyectos.pago_registrado.pre_nomina.error', id_pago, error: err.message }));
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUSCRIPTOR: finanzas.pago_registrado (migrado de control-obra)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function handlePagoRegistradoEvent(event: any): Promise<void> {
  const {
    id_pago,
    referencia_modulo,
    referencia_entidad,
    referencia_id,
    monto_pagado,
    fecha_pago_real,
  } = event.payload as {
    id_pago?: string;
    referencia_modulo?: string;
    referencia_entidad?: string;
    referencia_id?: string;
    monto_pagado?: number;
    fecha_pago_real?: string;
  };

  if (!id_pago || !referencia_modulo || !referencia_entidad || !referencia_id) {
    console.error(JSON.stringify({
      action: 'control_proyectos.event.finanzas.pago_registrado.invalid_payload',
      event_type: event.event_type,
      correlation_id: event.context.correlation_id,
      tenant_id: event.context.tenant_id,
      proyecto_id: event.context.proyecto_id,
      id_pago,
      referencia_id,
    }));
    return;
  }

  const pagoCtx = {
    tenantId: event.context.tenant_id,
    proyectoId: event.context.proyecto_id,
    userId: event.context.user_id,
  };

  // AC-ejercido real (fix-evm-costos-reales, design.md Decisión 3): el pago
  // de una OrdenCompra es dinero que BOCAM paga a un proveedor — el costo
  // real que pide PMBOK para AC — a diferencia del pago de Estimacion
  // (dinero que el cliente paga a BOCAM, la rama que ya maneja el resto de
  // esta función sin cambios).
  if (referencia_modulo === 'compras' && referencia_entidad === 'OrdenCompra') {
    await aplicarPagoOrdenCompraAlEvm(pagoCtx, {
      id_pago,
      oc_id: referencia_id,
      monto: Number(monto_pagado || 0),
    });
    return;
  }

  // Mano de obra (fix-evm-costos-reales, design.md Decisión 6): no se
  // distribuye por partida (PreNominaDetalle no tiene concepto_id) — se
  // acumula a nivel proyecto para sumarse al AC global del próximo
  // snapshot de ProyeccionCierre.
  if (referencia_modulo === 'personal' && referencia_entidad === 'PreNomina') {
    await aplicarPagoPreNominaAlEvm(pagoCtx, {
      id_pago,
      monto: Number(monto_pagado || 0),
    });
    return;
  }

  // Contrato externo preservado: el evento sigue usando 'control-obra' como
  // referencia_modulo (finanzas ya conoce ese valor, no se le pide cambiar).
  if (referencia_modulo !== 'control-obra' || referencia_entidad !== 'Estimacion') {
    console.log(JSON.stringify({
      action: 'control_proyectos.event.finanzas.pago_registrado.ignored',
      event_type: event.event_type,
      correlation_id: event.context.correlation_id,
      tenant_id: event.context.tenant_id,
      proyecto_id: event.context.proyecto_id,
      referencia_modulo,
      referencia_entidad,
      referencia_id,
    }));
    return;
  }

  type PagoRegistradoLoaded = {
    estimacion: Awaited<ReturnType<PrismaClient['estimacion']['findUnique']>>;
  };

  type PagoRegistradoResult =
    | { status: 'estimacion_not_found' }
    | { status: 'idempotent' }
    | { status: 'applied' };

  const result = await applyTerminalMutationInContext<
    { tenantId: string; proyectoId: string; userId: string },
    PrismaClient,
    PagoRegistradoLoaded,
    { status: 'estimacion_not_found' },
    { status: 'idempotent' },
    { status: 'applied' }
  >({
    context: {
      tenantId: event.context.tenant_id,
      proyectoId: event.context.proyecto_id,
      userId: event.context.user_id,
    },
    runInContext: createTenantContext,
    load: async (prisma) => {
      const estimacion = await prisma.estimacion.findUnique({
        where: { id_estimacion: referencia_id },
      });

      return { estimacion };
    },
    notFoundResult: async (loaded) => {
      if (loaded.estimacion) {
        return null;
      }

      logTerminalState({
        terminalState: 'not_found',
        actions: {
          notFound: 'control_proyectos.event.finanzas.pago_registrado.estimacion_not_found',
          idempotent: 'control_proyectos.event.finanzas.pago_registrado.idempotent',
          applied: 'control_proyectos.event.finanzas.pago_registrado.applied',
        },
        context: {
          eventType: event.event_type,
          correlationId: event.context.correlation_id,
          tenantId: event.context.tenant_id,
          proyectoId: event.context.proyecto_id,
        },
        extras: { referencia_id, id_pago },
      });

      return { status: 'estimacion_not_found' };
    },
    idempotentResult: async (loaded) => {
      if (!loaded.estimacion || loaded.estimacion.estado !== EstadoEstimacion.FACTURADA) {
        return null;
      }

      logTerminalState({
        terminalState: 'idempotent',
        actions: {
          notFound: 'control_proyectos.event.finanzas.pago_registrado.estimacion_not_found',
          idempotent: 'control_proyectos.event.finanzas.pago_registrado.idempotent',
          applied: 'control_proyectos.event.finanzas.pago_registrado.applied',
        },
        context: {
          eventType: event.event_type,
          correlationId: event.context.correlation_id,
          tenantId: event.context.tenant_id,
          proyectoId: event.context.proyecto_id,
        },
        extras: { referencia_id, id_pago },
      });

      return { status: 'idempotent' };
    },
    apply: async (loaded, prisma) => {
      const notaPago = `Pago registrado en Finanzas. Pago: ${id_pago}. Monto: ${Number(monto_pagado || 0).toFixed(2)}. Fecha: ${fecha_pago_real || 'N/A'}.`;
      const notasActualizadas = loaded.estimacion!.notas ? `${loaded.estimacion!.notas}\n${notaPago}` : notaPago;

      await prisma.estimacion.update({
        where: { id_estimacion: referencia_id },
        data: {
          estado: EstadoEstimacion.FACTURADA,
          notas: notasActualizadas,
        },
      });

      return { status: 'applied' };
    },
  });

  if (result.status === 'applied') {
    logTerminalState({
      terminalState: 'applied',
      actions: {
        notFound: 'control_proyectos.event.finanzas.pago_registrado.estimacion_not_found',
        idempotent: 'control_proyectos.event.finanzas.pago_registrado.idempotent',
        applied: 'control_proyectos.event.finanzas.pago_registrado.applied',
      },
      context: {
        eventType: event.event_type,
        correlationId: event.context.correlation_id,
        tenantId: event.context.tenant_id,
        proyectoId: event.context.proyecto_id,
      },
      extras: { referencia_id, id_pago },
    });
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUSCRIPTOR: almacen.salida_obra → MaterialConsumidoObra (migrado de
// control-obra). CORREGIDO: el handler original escribía contra columnas
// (movimiento_id, clave_insumo, descripcion, costo_pendiente, concepto_clave)
// que no existen en la tabla real — ver tasks.md tarea 1.1/2.3 y el
// comentario en schema.prisma sobre MaterialConsumidoObra.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function handleSalidaObraEvent(event: any): Promise<void> {
  const {
    movimiento_id, insumo_id, clave, descripcion, unidad,
    cantidad, concepto_id, frente_trabajo, responsable, fecha,
  } = event.payload as {
    movimiento_id: string; item_id: string; insumo_id: string | null;
    clave: string; descripcion: string; unidad: string; cantidad: number;
    concepto_id: string; concepto_clave: string; frente_trabajo: string | null;
    responsable: string | null; fecha: string;
  };

  const ctx = {
    tenantId:   event.context.tenant_id,
    proyectoId: event.context.proyecto_id,
    userId:     event.context.user_id,
  };

  try {
    await createTenantContext(ctx, async (prisma: PrismaClient) => {
      // Idempotencia por movimiento_almacen_id
      const existing = await prisma.materialConsumidoObra.findUnique({
        where: { movimiento_almacen_id: movimiento_id },
      });
      if (existing) {
        console.log(JSON.stringify({ action: 'control_proyectos.salida_obra.idempotent', movimiento_id }));
        return;
      }

      // insumo_id es NOT NULL en la tabla real — sin insumo_id en el evento
      // no se puede crear el registro (a diferencia del handler previo, que
      // intentaba escribir NULL contra una columna que además no existía).
      if (!insumo_id) {
        console.error(JSON.stringify({ action: 'control_proyectos.salida_obra.missing_insumo_id', movimiento_id }));
        return;
      }

      // Obtener costo_base desde GT (fail-soft)
      let costo_unitario: number | null = null;
      if (insumo_id) {
        try {
          const resp = await axios.get(`${GT_URL}/insumos/${insumo_id}`, { timeout: 3000 });
          costo_unitario = Number(resp.data?.data?.costo_base ?? 0);
        } catch {
          costo_unitario = null;
        }
      }

      const costo_total = costo_unitario !== null ? cantidad * costo_unitario : null;

      await prisma.materialConsumidoObra.create({
        data: {
          tenant_id:             ctx.tenantId,
          proyecto_id:           ctx.proyectoId,
          concepto_id,
          movimiento_almacen_id: movimiento_id,
          insumo_id,
          insumo_clave:          clave ?? null,
          insumo_nombre:         descripcion ?? null,
          unidad,
          cantidad,
          costo_unitario,
          costo_total,
          fecha:                 new Date(fecha),
          frente_trabajo:        frente_trabajo ?? null,
          registrado_por:        responsable ?? null,
        },
      });

      console.log(JSON.stringify({ action: 'control_proyectos.salida_obra.applied', movimiento_id, concepto_id, costo_total }));
    });
  } catch (err: any) {
    console.error(JSON.stringify({ action: 'control_proyectos.salida_obra.error', movimiento_id, error: err.message }));
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUSCRIPTOR: auth.centro_costos_creado — registro liviano (auditoría/log).
// Único handler tras la fusión (control-obra y control-proyectos tenían
// cada uno el suyo, funcionalmente idénticos).
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function handleCentroCostosCreadoEvent(event: BocamEvent<{ codigo_centro_costos: string }>): Promise<void> {
  console.log(JSON.stringify({
    action: 'control_proyectos.event.centro_costos_creado.registrado',
    correlation_id: event.context?.correlation_id,
    tenant_id: event.context?.tenant_id,
    proyecto_id: event.context?.proyecto_id,
    codigo_centro_costos: event.payload?.codigo_centro_costos,
  }));
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MIDDLEWARE JWT REAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.use(createAuthMiddleware({ jwtSecret: JWT_SECRET, excludePaths: ['/health'] }));
app.use(requireProjectAccess());

// ─── Helpers EVM/Alertas ─────────────────────────────────────────────────────

function semaforo(cpi: number, spi: number): 'VERDE' | 'AMARILLO' | 'ROJO' {
  if (cpi >= 0.95 && spi >= 0.95) return 'VERDE';
  if (cpi >= 0.85 && spi >= 0.80) return 'AMARILLO';
  return 'ROJO';
}

function isoWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

// ─── EVM: PV interpolado de curva_programada (fix-evm-costos-reales) ────────
// Dado el JSONB [{ semana: "2026-W22", pct_acumulado }] y la semana de
// corte actual (formato isoWeek), retorna el pct_acumulado del último punto
// con semana <= corte. `null` si la curva está vacía (partida sin
// programación cargada — no hay PV/SPI para esa partida, design.md
// Decisión 4); `0` si `hoy` es anterior al primer punto de la curva.
export function interpolarPctProgramado(
  curvaProgramada: unknown,
  semanaCorte: string
): number | null {
  const curva = Array.isArray(curvaProgramada)
    ? (curvaProgramada as Array<{ semana: string; pct_acumulado: number }>)
    : [];
  if (curva.length === 0) return null;

  const ordenada = [...curva].sort((a, b) => String(a.semana).localeCompare(String(b.semana)));
  if (semanaCorte < ordenada[0].semana) return 0;

  let pct = 0;
  for (const punto of ordenada) {
    if (punto.semana <= semanaCorte) {
      pct = Number(punto.pct_acumulado);
    } else {
      break;
    }
  }
  return pct;
}

// ─── Motor de alertas ─────────────────────────────────────────────────────────
// Retrofit (tarea 2.10): reciben `prisma` como parámetro — antes usaban
// basePrisma directo, lo que bajo RLS real (tarea 3) habría devuelto 0 filas
// siempre por no tener sesión de tenant seteada. Ver design.md Decisión 8.

async function upsertAlerta(
  prisma: PrismaClient,
  tenantId: string,
  proyectoId: string,
  tipo: string,
  conceptoId: string | null,
  opts: {
    severidad: string;
    titulo: string;
    descripcion: string;
    datos: Record<string, unknown>;
  }
): Promise<void> {
  const existing = await prisma.alertaProyecto.findFirst({
    where: { tenant_id: tenantId, proyecto_id: proyectoId, tipo, concepto_id: conceptoId ?? undefined, estado: { in: ['ACTIVA', 'RECONOCIDA'] } },
  });
  if (existing) {
    await prisma.alertaProyecto.update({
      where: { id: existing.id },
      data: { titulo: opts.titulo, descripcion: opts.descripcion, datos: opts.datos as any, severidad: opts.severidad, updated_at: new Date() },
    });
  } else {
    await prisma.alertaProyecto.create({
      data: {
        tenant_id: tenantId,
        proyecto_id: proyectoId,
        concepto_id: conceptoId,
        tipo,
        severidad: opts.severidad,
        titulo: opts.titulo,
        descripcion: opts.descripcion,
        datos: opts.datos as any,
        estado: 'ACTIVA',
      },
    });
  }
}

async function resolverAlertaSiExiste(prisma: PrismaClient, tenantId: string, proyectoId: string, tipo: string, conceptoId: string | null): Promise<void> {
  await prisma.alertaProyecto.updateMany({
    where: { tenant_id: tenantId, proyecto_id: proyectoId, tipo, concepto_id: conceptoId ?? undefined, estado: { in: ['ACTIVA', 'RECONOCIDA'] } },
    data: { estado: 'RESUELTA', resuelta_en: new Date() },
  });
}

async function calcularAlertas(prisma: PrismaClient, tenantId: string, proyectoId: string): Promise<void> {
  try {
    const partidas = await prisma.programacionObra.findMany({
      where: { tenant_id: tenantId, proyecto_id: proyectoId },
    });

    for (const p of partidas) {
      const cpi = p.cpi ? Number(p.cpi) : null;
      const spi = p.spi ? Number(p.spi) : null;
      const bac = Number(p.bac);
      const eac = p.eac ? Number(p.eac) : null;

      if (cpi !== null && cpi < 0.9 && eac !== null) {
        const vac = bac - eac;
        const pctSobre = bac > 0 ? Math.abs(vac / bac) * 100 : 0;
        await upsertAlerta(prisma, tenantId, proyectoId, 'SOBRE_COSTO_PROYECTADO', p.concepto_id, {
          severidad: 'CRITICA',
          titulo: `Sobrecosto proyectado en ${p.concepto_clave}`,
          descripcion: `CPI ${cpi.toFixed(3)}. EAC proyectado supera presupuesto en $${Math.abs(vac).toLocaleString('es-MX')} (${pctSobre.toFixed(1)}% sobre presupuesto).`,
          datos: { cpi, eac, bac, vac, pct_sobre: pctSobre },
        });
      } else if (cpi !== null && cpi >= 0.9) {
        await resolverAlertaSiExiste(prisma, tenantId, proyectoId, 'SOBRE_COSTO_PROYECTADO', p.concepto_id);
      }

      if (spi !== null && spi < 0.8 && p.fecha_fin_plan) {
        const diasRestantes = Math.ceil((new Date(p.fecha_fin_plan).getTime() - Date.now()) / 86400000);
        if (diasRestantes <= 30 && diasRestantes >= 0) {
          const diasRetraso = spi > 0 ? Math.round((1 / spi - 1) * diasRestantes) : 0;
          await upsertAlerta(prisma, tenantId, proyectoId, 'RETRASO_CRITICO', p.concepto_id, {
            severidad: 'CRITICA',
            titulo: `Retraso crítico en ${p.concepto_clave}`,
            descripcion: `Partida ${p.concepto_clave} tiene SPI ${spi.toFixed(3)}. Riesgo de no terminar en fecha. Retraso proyectado: ${diasRetraso} días.`,
            datos: { spi, dias_retraso: diasRetraso, fecha_fin_plan: p.fecha_fin_plan },
          });
        }
      } else if (spi !== null && spi >= 0.8) {
        await resolverAlertaSiExiste(prisma, tenantId, proyectoId, 'RETRASO_CRITICO', p.concepto_id);
      }
    }
  } catch (err) {
    console.error('[CP] calcularAlertas error:', err);
  }
}

// Recálculo EVM disparado directo al validar un avance (Decisión 4 de
// design.md) — reemplaza el subscribe interno a
// control_obra.avance_fisico_validado (el evento se sigue publicando hacia
// afuera para finanzas/contabilidad, solo se dejó de re-consumir dentro del
// mismo proceso).
async function recalcularEVMPorAvanceValidado(
  prisma: PrismaClient,
  tenantId: string,
  proyectoId: string,
  conceptoId: string,
  pctAvance: number,
  evAcumulado?: number,
): Promise<void> {
  try {
    const prog = await prisma.programacionObra.findFirst({
      where: { tenant_id: tenantId, proyecto_id: proyectoId, concepto_id: conceptoId },
    });
    if (!prog) return;

    const bac = Number(prog.bac);
    const pct = Math.min(100, pctAvance);
    const ev = evAcumulado ?? (pct / 100) * bac;

    // AC compuesto (fix-evm-costos-reales): ya NO es `acAcumulado ?? ev`
    // (que hacía CPI ≈ 1 siempre) — se lee de lo que los subscribers de
    // compras.oc_creada/oc_cancelada y finanzas.pago_registrado
    // (referencia_entidad='OrdenCompra') fueron acumulando en esta misma
    // partida. Sin OC ligadas todavía, ac=0 y cpi queda null (sin datos de
    // costo real), no un valor cosmético.
    const ac = Number(prog.ac_comprometido) + Number(prog.ac_ejercido);
    const cpi = ac > 0 ? ev / ac : null;

    // PV interpolado de curva_programada (fix-evm-costos-reales): ya no es
    // bac * (pct/100), que reutilizaba el mismo % de avance físico usado
    // para EV. null si la partida no tiene curva cargada → spi también null.
    const semanaCorte = isoWeek(new Date());
    const pctProgramado = interpolarPctProgramado(prog.curva_programada, semanaCorte);
    const pv = pctProgramado !== null ? bac * (pctProgramado / 100) : null;
    const spi = pv !== null && pv > 0 ? ev / pv : null;

    const eac = cpi !== null && cpi > 0 ? bac / cpi : null;

    const nuevoEstado = pct >= 100 ? 'COMPLETADA' : pct > 0 ? 'EN_CURSO' : prog.estado;
    const fechaInicio = pct > 0 && !prog.fecha_inicio_real ? new Date() : prog.fecha_inicio_real;
    const fechaFin = pct >= 100 && !prog.fecha_fin_real ? new Date() : prog.fecha_fin_real;

    await prisma.programacionObra.update({
      where: { id: prog.id },
      data: {
        pct_avance_real: pct,
        cpi,
        spi,
        eac,
        estado: nuevoEstado,
        fecha_inicio_real: fechaInicio ?? undefined,
        fecha_fin_real: fechaFin ?? undefined,
      },
    });

    await calcularAlertas(prisma, tenantId, proyectoId);
  } catch (err) {
    console.error('[CP] recalcularEVMPorAvanceValidado error:', err);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Endpoints migrados de control-obra (Bitácoras, Avances, Estimaciones,
// dashboards, costo-real) — montados en un Router aparte para poder
// exponerlos bajo /api/v1/control-proyectos/* (definitivo) Y, mientras dure
// el alias temporal (tarea 2.9), también bajo /api/v1/control-obra/*.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const controlObraRouter = Router();

// ─── BITÁCORAS DE OBRA ───────────────────────────────────────────────────────

controlObraRouter.get('/bitacoras', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      return await prisma.bitacoraObra.findMany({ orderBy: { fecha: 'desc' }, take: 50 });
    });
    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    console.error('[CP] Error listando bitácoras:', error.message);
    res.status(500).json(createApiError('CO_INTERNAL_ERROR', error.message));
  }
});

controlObraRouter.post('/bitacoras', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId, userName } = req.securityContext;
    const {
      frente_trabajo, turno, clima, temperatura_c,
      actividades_realizadas, personal_en_sitio,
      incidencias, material_recibido, observaciones, fecha,
    } = req.body;

    if (!frente_trabajo || !actividades_realizadas) {
      res.status(400).json(createApiError('CO_MISSING_FIELDS', 'frente_trabajo y actividades_realizadas son obligatorios.'));
      return;
    }

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const lastEntry = await prisma.bitacoraObra.findFirst({
        orderBy: { numero_entrada: 'desc' },
        select: { numero_entrada: true },
      });
      const nextNumber = (lastEntry?.numero_entrada || 0) + 1;

      return await prisma.bitacoraObra.create({
        data: {
          tenant_id: tenantId,
          proyecto_id: proyectoId,
          numero_entrada: nextNumber,
          fecha: fecha ? new Date(fecha) : new Date(),
          frente_trabajo,
          turno: turno || 'DIURNO',
          clima,
          temperatura_c: temperatura_c ? Number(temperatura_c) : null,
          actividades_realizadas,
          personal_en_sitio: personal_en_sitio || 0,
          incidencias,
          material_recibido,
          observaciones,
          residente_id: userId,
          residente_nombre: userName || 'Residente',
          estado: 'BORRADOR',
        },
      });
    });

    console.log(`[CP] ✅ Bitácora #${data.numero_entrada} creada`);
    res.status(201).json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    console.error('[CP] Error creando bitácora:', error.message);
    res.status(500).json(createApiError('CO_INTERNAL_ERROR', error.message));
  }
});

controlObraRouter.patch('/bitacoras/:id/firmar', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId } = req.securityContext;

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const bitacora = await prisma.bitacoraObra.findUnique({ where: { id_bitacora: id } });
      if (!bitacora) throw new Error('Bitácora no encontrada.');
      if (bitacora.estado !== 'BORRADOR') throw new Error('Solo se pueden firmar bitácoras en BORRADOR.');

      return await prisma.bitacoraObra.update({
        where: { id_bitacora: id },
        data: { estado: 'FIRMADA', superintendente_id: userId },
      });
    });

    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('CO_INTERNAL_ERROR', error.message));
  }
});

// ─── AVANCES FÍSICOS ─────────────────────────────────────────────────────────

controlObraRouter.get('/avances', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const estado = req.query.estado as string;

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      return await prisma.avanceFisico.findMany({
        where: estado ? { estado } : undefined,
        include: { estimacion: { select: { codigo: true, estado: true } } },
        orderBy: { created_at: 'desc' },
      });
    });
    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('CO_INTERNAL_ERROR', error.message));
  }
});

// Resuelve un concepto del catálogo real de gerencia-tecnica por su id,
// consultando el presupuesto activo del proyecto (B2B). No hay endpoint
// GET /conceptos/:id en gerencia-tecnica hoy — presupuesto/activo ya trae
// todos los conceptos del proyecto en una sola llamada (ver design.md,
// change fix-estimaciones-residente-desconectado).
async function resolverConceptoDelCatalogo(
  authHeader: string | undefined,
  conceptoId: string
): Promise<{ clave: string; descripcion: string; unidad_medida: string; precio_unitario: number; cantidad: number } | null> {
  const resp = await axios.get(`${GT_URL}/presupuesto/activo`, {
    headers: authHeader ? { Authorization: authHeader } : {},
    timeout: 5000,
  });
  const conceptos: any[] = resp.data?.data?.conceptos ?? [];
  const concepto = conceptos.find((c) => c.id === conceptoId);
  if (!concepto) return null;
  return {
    clave: concepto.clave,
    descripcion: concepto.descripcion,
    unidad_medida: concepto.unidad_medida,
    precio_unitario: Number(concepto.precio_unitario),
    cantidad: Number(concepto.cantidad),
  };
}

controlObraRouter.post('/avances', requireRoles('residencia', 'control_proyectos', 'control_obra', 'director', 'admin'), async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId, userName } = req.securityContext;
    const { concepto_id, cantidad_periodo, periodo_inicio, periodo_fin } = req.body;

    if (!concepto_id || !cantidad_periodo) {
      res.status(400).json(createApiError('CO_MISSING_FIELDS', 'concepto_id y cantidad_periodo son obligatorios.'));
      return;
    }

    // precio_unitario, cantidad_presupuestada, clave, descripción y unidad se
    // resuelven SIEMPRE del catálogo de gerencia-tecnica — cualquier valor
    // que el cliente los envíe se ignora, para que el dato sea confiable
    // para KPIs (decisión de negocio, ver design.md Decision 5).
    let concepto: Awaited<ReturnType<typeof resolverConceptoDelCatalogo>>;
    try {
      concepto = await resolverConceptoDelCatalogo(req.headers.authorization, concepto_id);
    } catch (gtError: any) {
      res.status(502).json(createApiError('CO_CATALOGO_NO_DISPONIBLE', 'No se pudo validar el concepto contra el catálogo de gerencia-tecnica. Intenta de nuevo.'));
      return;
    }
    if (!concepto) {
      res.status(400).json(createApiError('CO_CONCEPTO_NO_ENCONTRADO', 'El concepto no existe en el presupuesto activo del proyecto.'));
      return;
    }

    const cantPeriodo = Number(cantidad_periodo);
    const pu = concepto.precio_unitario;
    const cantPresupuestada = concepto.cantidad;

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      // cantidad_anterior se deriva sumando cantidad_periodo de los avances
      // previos no RECHAZADO del mismo concepto_id — no se acepta del
      // cliente, para que el acumulado sea confiable (design.md Decision 7).
      const previos = await prisma.avanceFisico.findMany({
        where: { tenant_id: tenantId, proyecto_id: proyectoId, concepto_id, estado: { not: EstadoAvance.RECHAZADO } },
        select: { cantidad_periodo: true },
      });
      const cantAnterior = previos.reduce((sum, a) => sum + Number(a.cantidad_periodo), 0);
      const cantAcumulada = cantAnterior + cantPeriodo;
      const porcentaje = cantPresupuestada > 0 ? (cantAcumulada / cantPresupuestada) * 100 : 0;

      return prisma.avanceFisico.create({
        data: {
          tenant_id: tenantId,
          proyecto_id: proyectoId,
          concepto_id,
          concepto_presupuesto: concepto!.clave,
          descripcion_concepto: concepto!.descripcion,
          cantidad_presupuestada: cantPresupuestada,
          cantidad_anterior: cantAnterior,
          cantidad_periodo: cantPeriodo,
          cantidad_acumulada: cantAcumulada,
          unidad: concepto!.unidad_medida,
          precio_unitario: pu,
          importe_periodo: cantPeriodo * pu,
          importe_acumulado: cantAcumulada * pu,
          porcentaje_avance: Math.min(porcentaje, 100),
          periodo_inicio: new Date(periodo_inicio || new Date()),
          periodo_fin: new Date(periodo_fin || new Date()),
          registrado_por_id: userId,
          registrado_por_nombre: userName || 'Residente',
          estado: EstadoAvance.PENDIENTE,
        },
      });
    });

    console.log(`[CP] ✅ Avance registrado: ${concepto.clave} → ${Number(data.porcentaje_avance).toFixed(1)}%`);

    await eventBus.publish({
      event_type: ControlObraEvents.AVANCE_FISICO_REGISTRADO,
      timestamp: new Date().toISOString(),
      context: buildEventContext(req),
      payload: { avance_id: data.id_avance, concepto: concepto.clave, porcentaje: Number(data.porcentaje_avance).toFixed(1), importe: Number(data.importe_periodo) },
    });

    res.status(201).json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('CO_INTERNAL_ERROR', error.message));
  }
});

controlObraRouter.patch('/avances/:id/validar', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId, userName, roles } = req.securityContext;
    const { presupuesto_id } = req.body;

    const rolesAutorizados = ['admin', 'superintendent'];
    if (!roles.some((r: string) => rolesAutorizados.includes(r))) {
      res.status(403).json(createApiError('CO_FORBIDDEN', 'Solo superintendentes pueden validar avances.'));
      return;
    }

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const avance = await prisma.avanceFisico.findUnique({ where: { id_avance: id } });
      if (!avance) throw new Error('Avance no encontrado.');
      if (avance.estado !== EstadoAvance.PENDIENTE) throw new Error('Solo avances PENDIENTE pueden validarse.');

      const updated = await prisma.avanceFisico.update({
        where: { id_avance: id },
        data: {
          estado: EstadoAvance.VALIDADO,
          validado_por_id: userId,
          validado_por_nombre: userName || 'Superintendente',
        },
      });

      // Recálculo EVM directo (Decisión 4 de design.md) — antes era un
      // subscribe interno a control_obra.avance_fisico_validado.
      //
      // Antes de esta spec (fix-estimaciones-residente-desconectado) aquí
      // se pasaba updated.concepto_presupuesto (la CLAVE del concepto, ej.
      // "CIM-001") a un parámetro que Prisma castea contra la columna UUID
      // ProgramacionObra.concepto_id — en cualquier dato real (no un UUID
      // disfrazado de clave, como usaban los tests viejos) esto fallaba en
      // silencio (recalcularEVMPorAvanceValidado atrapa el error y solo
      // hace console.error). Ahora AvanceFisico.concepto_id sí es el UUID
      // real del catálogo — se usa ese, que es el campo correcto.
      if (updated.concepto_id) {
        await recalcularEVMPorAvanceValidado(
          prisma,
          tenantId,
          proyectoId,
          updated.concepto_id,
          Number(updated.porcentaje_avance),
          Number(updated.importe_acumulado),
        );
      }

      return updated;
    });

    console.log(`[CP] ✅ Avance validado: ${data.concepto_presupuesto}`);

    // El evento se sigue publicando hacia afuera (finanzas/contabilidad no
    // cambian) — solo se dejó de re-consumir internamente.
    await eventBus.publish({
      event_type: ControlObraEvents.AVANCE_FISICO_VALIDADO,
      timestamp: new Date().toISOString(),
      context: buildEventContext(req),
      payload: {
        avance_id: data.id_avance,
        concepto: data.concepto_presupuesto,
        porcentaje: Number(data.porcentaje_avance),
        importe: Number(data.importe_periodo),
        presupuesto_id,
      },
    });

    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('CO_INTERNAL_ERROR', error.message));
  }
});

controlObraRouter.patch('/avances/:id/rechazar', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId } = req.securityContext;

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      return await prisma.avanceFisico.update({
        where: { id_avance: id },
        data: { estado: EstadoAvance.RECHAZADO },
      });
    });
    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('CO_INTERNAL_ERROR', error.message));
  }
});

// ─── ESTIMACIONES ────────────────────────────────────────────────────────────

controlObraRouter.get('/estimaciones', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      return await prisma.estimacion.findMany({
        include: { avances: { select: { id_avance: true, concepto_presupuesto: true, importe_periodo: true, porcentaje_avance: true } } },
        orderBy: { numero_estimacion: 'desc' },
      });
    });
    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('CO_INTERNAL_ERROR', error.message));
  }
});

controlObraRouter.get('/estimaciones/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId } = req.securityContext;

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      return await prisma.estimacion.findUnique({
        where: { id_estimacion: id },
        include: { avances: true },
      });
    });

    if (!data) { res.status(404).json(createApiError('CO_NOT_FOUND', 'Estimación no encontrada.')); return; }
    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('CO_INTERNAL_ERROR', error.message));
  }
});

controlObraRouter.post('/estimaciones', requireRoles('residencia', 'control_proyectos', 'admin'), async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId, userName } = req.securityContext;
    const { avance_ids, periodo_inicio, periodo_fin, notas } = req.body;

    if (!avance_ids || !Array.isArray(avance_ids) || avance_ids.length === 0) {
      res.status(400).json(createApiError('CO_MISSING_FIELDS', 'Se requiere un array de avance_ids validados.'));
      return;
    }

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const avances = await prisma.avanceFisico.findMany({
        where: { id_avance: { in: avance_ids }, estado: EstadoAvance.VALIDADO },
      });

      if (avances.length !== avance_ids.length) {
        const found = avances.map((a: any) => a.id_avance);
        const missing = avance_ids.filter((id: string) => !found.includes(id));
        throw new Error(`${avance_ids.length - avances.length} avance(s) no encontrados o no están VALIDADOS: ${missing.join(', ')}`);
      }

      const yaAsignados = avances.filter((a: any) => a.estimacion_id !== null);
      if (yaAsignados.length > 0) {
        throw new Error(`${yaAsignados.length} avance(s) ya pertenecen a otra estimación.`);
      }

      const subtotal = avances.reduce((sum: number, a: any) => sum + Number(a.importe_periodo), 0);
      const retencion = subtotal * 0.05;
      const iva = (subtotal - retencion) * 0.16;
      const totalNeto = subtotal - retencion + iva;

      const lastEst = await prisma.estimacion.findFirst({
        orderBy: { numero_estimacion: 'desc' },
        select: { numero_estimacion: true },
      });
      const nextNum = (lastEst?.numero_estimacion || 0) + 1;

      const estimacion = await prisma.estimacion.create({
        data: {
          tenant_id: tenantId,
          proyecto_id: proyectoId,
          numero_estimacion: nextNum,
          codigo: `EST-${new Date().getFullYear()}-${String(nextNum).padStart(3, '0')}`,
          periodo_inicio: new Date(periodo_inicio || new Date()),
          periodo_fin: new Date(periodo_fin || new Date()),
          subtotal,
          retencion_fondo_garantia: retencion,
          iva,
          total_neto: totalNeto,
          estado: EstadoEstimacion.BORRADOR,
          elaborado_por_id: userId,
          elaborado_por_nombre: userName || 'Residente',
          notas,
        },
      });

      await prisma.avanceFisico.updateMany({
        where: { id_avance: { in: avance_ids } },
        data: { estimacion_id: estimacion.id_estimacion },
      });

      return { ...estimacion, avances_incluidos: avances.length, subtotal, total_neto: totalNeto };
    });

    console.log(`[CP] ✅ Estimación #${data.numero_estimacion} creada → $${Number(data.total_neto).toLocaleString()}`);
    res.status(201).json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    console.error('[CP] Error creando estimación:', error.message);
    res.status(500).json(createApiError('CO_INTERNAL_ERROR', error.message));
  }
});

// Aprobar estimación (integración con Finanzas)
controlObraRouter.patch('/estimaciones/:id/aprobar', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId, userName, roles } = req.securityContext;
    const token = req.headers.authorization;
    const { presupuesto_id } = req.body;
    const correlationId = getCorrelationId(req);

    const rolesAutorizados = ['admin', 'superintendent'];
    if (!roles.some((r: string) => rolesAutorizados.includes(r))) {
      res.status(403).json(createApiError('CO_FORBIDDEN', 'Solo superintendentes o admin pueden aprobar estimaciones.'));
      return;
    }

    if (!presupuesto_id) {
      res.status(400).json(createApiError('CO_MISSING_BUDGET', 'presupuesto_id es obligatorio para disparar efectos financieros.'));
      return;
    }

    const estimacion = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const found = await prisma.estimacion.findUnique({
        where: { id_estimacion: id },
        include: { avances: { select: { id_avance: true, concepto_presupuesto: true } } },
      });

      if (!found) throw new Error('Estimación no encontrada.');
      if (found.estado !== EstadoEstimacion.BORRADOR && found.estado !== EstadoEstimacion.EN_REVISION) {
        throw new Error(`No se puede aprobar una estimación en estado ${found.estado}.`);
      }

      return prisma.estimacion.update({
        where: { id_estimacion: id },
        data: {
          estado: ESTIMACION_STATUS.PENDIENTE_FINANZAS,
          revisado_por_id: userId,
          revisado_por_nombre: userName || 'Superintendente',
          fecha_aprobacion: new Date(),
        },
        include: { avances: { select: { id_avance: true, concepto_presupuesto: true } } },
      });
    });

    try {
      await axios.post(`${FINANZAS_URL}/pagos`, {
        presupuesto_id,
        concepto: `Estimación ${estimacion.codigo} - ${estimacion.avances.length} conceptos`,
        beneficiario: 'Constructora (Self)',
        monto_programado: Number(estimacion.total_neto),
        fecha_programada: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        referencia_modulo: 'control-obra',
        referencia_entidad: 'Estimacion',
        referencia_id: estimacion.id_estimacion,
      }, {
        headers: buildForwardHeaders(req, { Authorization: token || '' }),
      });
    } catch (finError: any) {
      const errMsg = finError.response?.data?.error?.message || finError.message;
      logWarn(req, 'control-proyectos', 'control_proyectos.estimacion.finanzas_pending', 'Finanzas no confirmo la programacion de pago para la estimacion', {
        estimacion_id: estimacion.id_estimacion,
        estimacion_codigo: estimacion.codigo,
        presupuesto_id,
        downstream_module: 'finanzas',
        error_message: errMsg,
      });

      const failed = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) =>
        prisma.estimacion.update({
          where: { id_estimacion: id },
          data: { estado: ESTIMACION_STATUS.ERROR_FINANZAS },
        })
      );

      return res.status(502).json(createApiError(
        'CO_FINANZAS_PENDING',
        `La estimación fue aprobada técnicamente pero Finanzas no confirmó la programación: ${errMsg}`,
        { estimacion_id: failed.id_estimacion, codigo: failed.codigo, estado: failed.estado }
      ));
    }

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) =>
      prisma.estimacion.update({
        where: { id_estimacion: id },
        data: { estado: ESTIMACION_STATUS.APROBADA_FINANCIERA },
      })
    );

    await eventBus.publish({
      event_type: ControlObraEvents.ESTIMACION_APROBADA,
      timestamp: new Date().toISOString(),
      context: buildEventContext(req),
      payload: {
        estimacion_id: data.id_estimacion,
        codigo: data.codigo,
        total_neto: Number(data.total_neto),
        presupuesto_id,
        total_conceptos: estimacion.avances.length,
      },
    });

    logInfo(req, 'control-proyectos', 'control_proyectos.estimacion.aprobada_financiera', 'Estimacion aprobada y programada en Finanzas', {
      estimacion_id: data.id_estimacion,
      estimacion_codigo: data.codigo,
      presupuesto_id,
      downstream_module: 'finanzas',
    });
    res.json(createApiResponse(data, tenantId, proyectoId, correlationId));
  } catch (error: any) {
    logError(req, 'control-proyectos', 'control_proyectos.estimacion.aprobar.error', 'Error aprobando estimacion', {
      error_message: error.message,
    });
    console.error('[CP] Error aprobando estimación:', error.message);
    res.status(500).json(createApiError('CO_INTERNAL_ERROR', error.message, undefined, getCorrelationId(req)));
  }
});

controlObraRouter.get('/estimaciones/reconciliacion/pendientes', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId, roles } = req.securityContext;
    const rolesAutorizados = ['admin', 'superintendent'];

    if (!roles.some((r: string) => rolesAutorizados.includes(r))) {
      res.status(403).json(createApiError('CO_FORBIDDEN', 'Solo superintendentes o admin pueden consultar reconciliaciones.'));
      return;
    }

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) =>
      prisma.estimacion.findMany({
        where: { estado: { in: [ESTIMACION_STATUS.PENDIENTE_FINANZAS, ESTIMACION_STATUS.ERROR_FINANZAS] } },
        orderBy: { numero_estimacion: 'desc' },
      })
    );

    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('CO_INTERNAL_ERROR', error.message));
  }
});

controlObraRouter.post('/estimaciones/:id/reconciliar-finanzas', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId, roles } = req.securityContext;
    const correlationId = getCorrelationId(req);
    const token = req.headers.authorization;
    const { presupuesto_id } = req.body;
    const rolesAutorizados = ['admin', 'superintendent'];

    if (!roles.some((r: string) => rolesAutorizados.includes(r))) {
      res.status(403).json(createApiError('CO_FORBIDDEN', 'Solo superintendentes o admin pueden reconciliar estimaciones.'));
      return;
    }

    if (!presupuesto_id) {
      res.status(400).json(createApiError('CO_MISSING_BUDGET', 'presupuesto_id es obligatorio para reconciliar.'));
      return;
    }

    const estimacion = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) =>
      prisma.estimacion.findUnique({
        where: { id_estimacion: id },
        include: { avances: { select: { id_avance: true } } },
      })
    );

    if (!estimacion) {
      res.status(404).json(createApiError('CO_NOT_FOUND', 'Estimación no encontrada.'));
      return;
    }

    if (estimacion.estado === ESTIMACION_STATUS.APROBADA_FINANCIERA) {
      const response = buildTerminalHttpResponse({
        terminalState: 'idempotent',
        data: { ...estimacion, idempotente: true },
        context: { tenantId, proyectoId, correlationId },
        buildBody: (result, context) => createApiResponse(result, context.tenantId, context.proyectoId, context.correlationId),
      });

      res.status(response.statusCode).json(response.body);
      return;
    }

    if (![ESTIMACION_STATUS.PENDIENTE_FINANZAS, ESTIMACION_STATUS.ERROR_FINANZAS].includes(estimacion.estado as any)) {
      res.status(409).json(createApiError('CO_INVALID_STATE', `La estimación no requiere reconciliación. Estado actual: ${estimacion.estado}`));
      return;
    }

    await axios.post(`${FINANZAS_URL}/pagos`, {
      presupuesto_id,
      concepto: `Estimación ${estimacion.codigo} - ${estimacion.avances.length} conceptos`,
      beneficiario: 'Constructora (Self)',
      monto_programado: Number(estimacion.total_neto),
      fecha_programada: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      referencia_modulo: 'control-obra',
      referencia_entidad: 'Estimacion',
      referencia_id: estimacion.id_estimacion,
    }, {
      headers: buildForwardHeaders(req, { Authorization: token || '' }),
    });

    const updated = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) =>
      prisma.estimacion.update({
        where: { id_estimacion: id },
        data: { estado: ESTIMACION_STATUS.APROBADA_FINANCIERA },
      })
    );

    await eventBus.publish({
      event_type: ControlObraEvents.ESTIMACION_APROBADA,
      timestamp: new Date().toISOString(),
      context: buildEventContext(req),
      payload: {
        estimacion_id: updated.id_estimacion,
        codigo: updated.codigo,
        total_neto: Number(updated.total_neto),
        presupuesto_id,
        total_conceptos: estimacion.avances.length,
      },
    });

    const response = buildTerminalHttpResponse({
      terminalState: 'applied',
      data: { ...updated, idempotente: false },
      context: { tenantId, proyectoId, correlationId },
      buildBody: (result, context) => createApiResponse(result, context.tenantId, context.proyectoId, context.correlationId),
    });

    res.status(response.statusCode).json(response.body);
  } catch (error: any) {
    const errMsg = error.response?.data?.error?.message || error.message;
    res.status(502).json(createApiError('CO_RECONCILIATION_FAILED', errMsg));
  }
});

// ─── DASHBOARD DE OBRA (renombrado de /dashboard → /dashboard-obra, Decisión 3) ─

controlObraRouter.get('/dashboard-obra', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const authHeader = req.headers.authorization ?? '';

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const [totalBitacoras, totalAvances, avancesPendientes, avancesValidados, estimaciones, avgAvance, estimacionesPendientes] = await Promise.all([
        prisma.bitacoraObra.count(),
        prisma.avanceFisico.count(),
        prisma.avanceFisico.count({ where: { estado: EstadoAvance.PENDIENTE } }),
        prisma.avanceFisico.count({ where: { estado: EstadoAvance.VALIDADO } }),
        prisma.estimacion.findMany({
          select: { id_estimacion: true, codigo: true, estado: true, total_neto: true, numero_estimacion: true },
          orderBy: { numero_estimacion: 'desc' },
          take: 5,
        }),
        prisma.avanceFisico.aggregate({ where: { estado: EstadoAvance.VALIDADO }, _avg: { porcentaje_avance: true } }),
        prisma.estimacion.count({ where: { estado: { in: ['BORRADOR', 'EN_REVISION'] } } }),
      ]);

      const avanceFisicoPct = Math.round(Number(avgAvance._avg.porcentaje_avance) || 0);

      let avanceFinancieroPct: number | null = null;
      let parcial = false;
      try {
        const resp = await axios.get(`${FINANZAS_URL}/presupuestos`, {
          headers: { authorization: authHeader },
          timeout: 3000,
        });
        const presupuestos: any[] = resp.data?.data ?? [];
        const totalAutorizado = presupuestos.reduce((s: number, p: any) => s + Number(p.monto_autorizado ?? 0), 0);
        const totalEjercido   = presupuestos.reduce((s: number, p: any) => s + Number(p.monto_ejercido ?? 0), 0);
        avanceFinancieroPct = totalAutorizado > 0 ? Math.round((totalEjercido / totalAutorizado) * 100) : 0;
      } catch {
        parcial = true;
      }

      const alertas: any[] = [];
      if (avanceFinancieroPct !== null && avanceFisicoPct > 0) {
        const delta = avanceFisicoPct - avanceFinancieroPct;
        if (avanceFinancieroPct > avanceFisicoPct + 15) {
          alertas.push({ tipo: 'DESVIACION_FINANCIERA', mensaje: `Avance financiero supera al físico en ${Math.abs(delta)}%`, severidad: 'critical' });
        }
      }
      if (avancesPendientes > 2) {
        alertas.push({ tipo: 'AVANCES_PENDIENTES', mensaje: `${avancesPendientes} avances físicos pendientes de validación`, severidad: 'warning' });
      }

      return {
        avance_general: {
          fisico_pct:      avanceFisicoPct,
          financiero_pct:  avanceFinancieroPct,
          delta_pct:       avanceFinancieroPct !== null ? avanceFisicoPct - avanceFinancieroPct : null,
        },
        estimaciones_pendientes: estimacionesPendientes,
        alertas,
        parcial,
        resumen: {
          total_bitacoras: totalBitacoras,
          total_avances: totalAvances,
          avances_pendientes: avancesPendientes,
          avances_validados: avancesValidados,
          total_estimaciones: estimaciones.length,
        },
        ultimas_estimaciones: estimaciones,
      };
    });

    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('CO_INTERNAL_ERROR', error.message));
  }
});

controlObraRouter.get('/resumen-dashboard',
  requireRoles('superintendent', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
        const [enRevision, aprobadas, avancesPendientes, avgAvance] = await Promise.all([
          prisma.estimacion.count({ where: { estado: 'EN_REVISION' } }),
          prisma.estimacion.count({ where: { estado: { in: ['APROBADA_TECNICA', 'APROBADA_FINANCIERA'] } } }),
          prisma.avanceFisico.count({ where: { estado: 'PENDIENTE' } }),
          prisma.avanceFisico.aggregate({ where: { estado: 'VALIDADO' }, _avg: { porcentaje_avance: true } }),
        ]);
        return {
          estimaciones_en_revision: enRevision,
          estimaciones_aprobadas:   aprobadas,
          avances_pendientes:       avancesPendientes,
          avance_pct:               Math.round(Number(avgAvance._avg.porcentaje_avance) || 0),
        };
      });
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

controlObraRouter.get('/dashboard/residente',
  requireRoles('residencia', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const authHeader = req.headers['authorization'] as string | undefined;
      const now = new Date();

      const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
        const estimacionesPendientes = await prisma.estimacion.count({
          where: { estado: { in: ['BORRADOR', 'EN_REVISION'] } },
        });

        let misReqs = 0;
        let ocsPorRecibir: Array<{ id: string; folio: string; proveedor: string; monto: number; estado: string }> = [];
        let parcial = false;
        try {
          const [reqRes, ocRes] = await Promise.allSettled([
            axios.get(`${COMPRAS_URL}/requisiciones`, {
              headers: authHeader ? { Authorization: authHeader } : {},
              timeout: 3000,
            }),
            axios.get(`${COMPRAS_URL}/ordenes-compra`, {
              headers: authHeader ? { Authorization: authHeader } : {},
              params: { estado: 'EMITIDA,PARCIALMENTE_RECIBIDA' },
              timeout: 3000,
            }),
          ]);

          if (reqRes.status === 'fulfilled') {
            const reqs = (reqRes.value.data?.data ?? []) as any[];
            misReqs = reqs.filter((r: any) => r.creado_por === userId || r.solicitante_id === userId).length;
          } else {
            parcial = true;
          }

          if (ocRes.status === 'fulfilled') {
            const ocs = (ocRes.value.data?.data ?? []) as any[];
            ocsPorRecibir = ocs.slice(0, 5).map((oc: any) => ({
              id:        oc.id_orden_compra,
              folio:     oc.codigo ?? oc.id_orden_compra.slice(0, 8),
              proveedor: oc.proveedor_nombre ?? oc.proveedor_id,
              monto:     Number(oc.total ?? 0),
              estado:    oc.estado,
            }));
          } else {
            parcial = true;
          }
        } catch {
          parcial = true;
        }

        const alertas: Array<{ tipo: string; mensaje: string; severidad: string }> = [];
        if (estimacionesPendientes > 0) {
          alertas.push({ tipo: 'ESTIMACIONES_PENDIENTES', mensaje: `${estimacionesPendientes} estimacion(es) pendiente(s) de revisión`, severidad: 'advertencia' });
        }

        return {
          mis_requisiciones:       misReqs,
          estimaciones_pendientes: estimacionesPendientes,
          ocs_por_recibir:         ocsPorRecibir,
          alertas,
          parcial,
          generado_at:             now.toISOString(),
        };
      });

      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// ─── COSTO REAL DE MATERIALES POR CONCEPTO ──────────────────────────────────

controlObraRouter.get('/conceptos/:concepto_id/costo-real', async (req: Request, res: Response) => {
  try {
    const { concepto_id } = req.params;
    const { tenantId, proyectoId, userId } = req.securityContext;

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma: PrismaClient) => {
      const materiales = await prisma.materialConsumidoObra.findMany({
        where: { tenant_id: tenantId, proyecto_id: proyectoId, concepto_id },
        orderBy: { fecha: 'desc' as const },
      });

      const total_consumido_qty   = materiales.reduce((s: number, m: any) => s + Number(m.cantidad), 0);
      const total_consumido_monto = materiales.reduce((s: number, m: any) => s + Number(m.costo_total ?? 0), 0);

      return {
        concepto_id,
        total_consumido_qty,
        total_consumido_monto,
        materiales: materiales.map((m: any) => ({
          id:              m.id,
          fecha:           m.fecha,
          insumo_id:       m.insumo_id,
          insumo_clave:    m.insumo_clave,
          insumo_nombre:   m.insumo_nombre,
          unidad:          m.unidad,
          cantidad:        Number(m.cantidad),
          costo_unitario:  m.costo_unitario !== null ? Number(m.costo_unitario) : null,
          costo_total:     m.costo_total !== null ? Number(m.costo_total) : null,
          costo_pendiente: m.costo_unitario === null,
          frente_trabajo:  m.frente_trabajo,
        })),
      };
    });

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.use('/api/v1/control-proyectos', controlObraRouter);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EVM / CURVA S / ALERTAS (preexistentes de control-proyectos, retrofiteados
// a createTenantContext en la tarea 2.10 — antes usaban basePrisma directo)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get('/api/v1/control-proyectos/dashboard', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;

    const responseData = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const [proyeccion, alertasActivas, partidas] = await Promise.all([
        prisma.proyeccionCierre.findFirst({
          where: { tenant_id: tenantId, proyecto_id: proyectoId },
          orderBy: { fecha_calculo: 'desc' },
        }),
        prisma.alertaProyecto.findMany({
          where: { tenant_id: tenantId, proyecto_id: proyectoId, estado: { in: ['ACTIVA', 'RECONOCIDA'] } },
          orderBy: [{ severidad: 'asc' }, { created_at: 'desc' }],
          take: 10,
        }),
        prisma.programacionObra.findMany({ where: { tenant_id: tenantId, proyecto_id: proyectoId } }),
      ]);

      const criticas = alertasActivas.filter(a => a.severidad === 'CRITICA').length;
      const warnings = alertasActivas.filter(a => a.severidad === 'WARN').length;
      const bloqueadas = partidas.filter(p => p.estado === 'ATRASADA').length;

      const cpiGlobal = proyeccion ? Number(proyeccion.cpi) : null;
      const spiGlobal = proyeccion ? Number(proyeccion.spi) : null;
      const vacGlobal = proyeccion ? Number(proyeccion.vac) : null;
      const semaforoGlobal = cpiGlobal !== null && spiGlobal !== null ? semaforo(cpiGlobal, spiGlobal) : 'AMARILLO';

      return {
        proyecto_id: proyectoId,
        resumen_evm: {
          cpi: cpiGlobal,
          spi: spiGlobal,
          vac: vacGlobal,
          semaforo: semaforoGlobal,
          fecha_corte: proyeccion?.fecha_calculo ?? null,
        },
        alertas_activas: {
          criticas,
          warnings,
          top_alertas: alertasActivas.slice(0, 5).map(a => ({
            id: a.id, tipo: a.tipo, titulo: a.titulo, severidad: a.severidad, estado: a.estado, created_at: a.created_at,
          })),
        },
        partidas_atrasadas: bloqueadas,
        fecha_fin_proyectada: proyeccion?.fecha_fin_proyectada ?? null,
        dias_retraso: proyeccion && proyeccion.fecha_fin_plan && proyeccion.fecha_fin_proyectada
          ? Math.max(0, Math.ceil((new Date(proyeccion.fecha_fin_proyectada).getTime() - new Date(proyeccion.fecha_fin_plan).getTime()) / 86400000))
          : null,
        sin_programacion: partidas.length === 0,
      };
    });

    res.json({ success: true, data: responseData });
  } catch (error: any) {
    logError(req, 'control-proyectos', 'cp.dashboard.error', 'Error en dashboard CP', { error_message: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/v1/control-proyectos/evm', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;

    const responseData = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const [proyeccion, partidas] = await Promise.all([
        prisma.proyeccionCierre.findFirst({
          where: { tenant_id: tenantId, proyecto_id: proyectoId },
          orderBy: { fecha_calculo: 'desc' },
        }),
        prisma.programacionObra.findMany({
          where: { tenant_id: tenantId, proyecto_id: proyectoId },
          orderBy: { concepto_clave: 'asc' },
        }),
      ]);

      const porPartida = partidas.map(p => {
        const cpi = p.cpi ? Number(p.cpi) : null;
        const spi = p.spi ? Number(p.spi) : null;
        const bac = Number(p.bac);
        const eac = p.eac ? Number(p.eac) : null;
        const sobreCosto = eac !== null ? eac - bac : null;
        const sem = cpi !== null && spi !== null ? semaforo(cpi, spi) : 'AMARILLO';
        return {
          concepto_id: p.concepto_id,
          concepto_clave: p.concepto_clave,
          descripcion: p.descripcion,
          estado: p.estado,
          pct_avance_real: Number(p.pct_avance_real),
          bac, cpi, spi, eac,
          sobre_costo_proyectado: sobreCosto,
          semaforo: sem,
        };
      });

      return {
        proyecto_id: proyectoId,
        fecha_corte: proyeccion?.fecha_calculo ?? new Date().toISOString().split('T')[0],
        global: proyeccion ? {
          bac: Number(proyeccion.bac), pv: Number(proyeccion.pv), ev: Number(proyeccion.ev), ac: Number(proyeccion.ac),
          cpi: Number(proyeccion.cpi), spi: Number(proyeccion.spi), cv: Number(proyeccion.cv), sv: Number(proyeccion.sv),
          eac: Number(proyeccion.eac), etc: Number(proyeccion.etc), vac: Number(proyeccion.vac),
          fecha_fin_plan: proyeccion.fecha_fin_plan, fecha_fin_proyectada: proyeccion.fecha_fin_proyectada,
          semaforo: semaforo(Number(proyeccion.cpi), Number(proyeccion.spi)),
        } : null,
        por_partida: porPartida,
        sin_datos: partidas.length === 0,
      };
    });

    res.json({ success: true, data: responseData });
  } catch (error: any) {
    logError(req, 'control-proyectos', 'cp.evm.error', 'Error en EVM', { error_message: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/v1/control-proyectos/curva-s', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;

    const responseData = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const partidas = await prisma.programacionObra.findMany({ where: { tenant_id: tenantId, proyecto_id: proyectoId } });

      if (partidas.length === 0) {
        return { error: 'SIN_PROGRAMACION', mensaje: 'Cargue la programación de obra para ver la Curva S' };
      }

      const semanaMap = new Map<string, { pv_mxn: number; bac_total: number }>();
      for (const p of partidas) {
        const curva = p.curva_programada as Array<{ semana: string; pct_acumulado: number }>;
        if (!Array.isArray(curva)) continue;
        const bac = Number(p.bac);
        for (const punto of curva) {
          const existing = semanaMap.get(punto.semana) ?? { pv_mxn: 0, bac_total: 0 };
          existing.pv_mxn += (punto.pct_acumulado / 100) * bac;
          existing.bac_total += bac;
          semanaMap.set(punto.semana, existing);
        }
      }

      const bacTotal = partidas.reduce((sum, p) => sum + Number(p.bac), 0);
      const periodos = Array.from(semanaMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([semana, v]) => ({
          semana,
          pv_acumulado_pct: bacTotal > 0 ? (v.pv_mxn / bacTotal) * 100 : 0,
          pv_acumulado_mxn: v.pv_mxn,
        }));

      const partidasCriticas = partidas
        .filter(p => p.spi !== null && Number(p.spi) < 0.85)
        .map(p => ({ concepto_clave: p.concepto_clave, spi: Number(p.spi), cpi: p.cpi ? Number(p.cpi) : null }));

      return { proyecto_id: proyectoId, periodos, hoy: isoWeek(new Date()), partidas_criticas: partidasCriticas };
    });

    res.json({ success: true, data: responseData });
  } catch (error: any) {
    logError(req, 'control-proyectos', 'cp.curva-s.error', 'Error en Curva S', { error_message: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/v1/control-proyectos/proyeccion-flujo', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;

    const responseData = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const partidas = await prisma.programacionObra.findMany({ where: { tenant_id: tenantId, proyecto_id: proyectoId } });

      if (partidas.length === 0) {
        return { meses: [], meses_con_deficit: [], reserva_recomendada: 0 };
      }

      const mesMap = new Map<string, { egresos: number; partidas: string[] }>();
      for (const p of partidas) {
        if (!p.fecha_inicio_plan || !p.fecha_fin_plan) continue;
        const bac = Number(p.bac);
        const inicio = new Date(p.fecha_inicio_plan);
        const fin = new Date(p.fecha_fin_plan);
        const meses: string[] = [];
        const cur = new Date(inicio.getFullYear(), inicio.getMonth(), 1);
        while (cur <= fin) {
          meses.push(`${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}`);
          cur.setMonth(cur.getMonth() + 1);
        }
        if (meses.length === 0) continue;
        const montoPorMes = bac / meses.length;
        for (const mes of meses) {
          const entry = mesMap.get(mes) ?? { egresos: 0, partidas: [] };
          entry.egresos += montoPorMes;
          if (!entry.partidas.includes(p.concepto_clave)) entry.partidas.push(p.concepto_clave);
          mesMap.set(mes, entry);
        }
      }

      const meses = Array.from(mesMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([periodo, v]) => {
          const egresos = Math.round(v.egresos);
          const ingresos = Math.round(egresos * 0.85);
          return { periodo, egresos_proyectados: egresos, ingresos_proyectados: ingresos, flujo_neto: ingresos - egresos, partidas_activas: v.partidas, confianza: 'ALTA' as const };
        });

      const mesesConDeficit = meses.filter(m => m.flujo_neto < 0).map(m => m.periodo);
      const reservaRecomendada = meses.filter(m => m.flujo_neto < 0).reduce((sum, m) => sum + Math.abs(m.flujo_neto), 0);

      return { meses, meses_con_deficit: mesesConDeficit, reserva_recomendada: Math.round(reservaRecomendada) };
    });

    res.json({ success: true, data: responseData });
  } catch (error: any) {
    logError(req, 'control-proyectos', 'cp.proyeccion-flujo.error', 'Error en proyección de flujo', { error_message: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/v1/control-proyectos/programacion', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const rows = await prisma.programacionObra.findMany({
        where: { tenant_id: tenantId, proyecto_id: proyectoId },
        orderBy: [{ estado: 'asc' }, { fecha_inicio_plan: 'asc' }],
      });
      return rows.map(p => ({
        ...p,
        pct_avance_real: Number(p.pct_avance_real),
        bac: Number(p.bac),
        cpi: p.cpi ? Number(p.cpi) : null,
        spi: p.spi ? Number(p.spi) : null,
        eac: p.eac ? Number(p.eac) : null,
      }));
    });

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/v1/control-proyectos/programacion',
  requireRoles('admin', 'control_proyectos', 'director'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const items = req.body as Array<{
        concepto_id: string;
        concepto_clave?: string;
        descripcion?: string;
        fecha_inicio_plan: string;
        fecha_fin_plan: string;
        bac?: number;
        curva_programada: Array<{ semana: string; pct_acumulado: number }>;
      }>;

      if (!Array.isArray(items) || items.length === 0) {
        res.status(422).json({ success: false, error: { code: 'ITEMS_REQUERIDOS', message: 'Se requiere al menos un ítem de programación' } });
        return;
      }

      const errores: string[] = [];
      for (const item of items) {
        if (!item.concepto_id) { errores.push('concepto_id es requerido'); continue; }
        if (!item.fecha_inicio_plan || !item.fecha_fin_plan) { errores.push(`${item.concepto_id}: fechas requeridas`); continue; }
        if (!Array.isArray(item.curva_programada) || item.curva_programada.length === 0) {
          errores.push(`${item.concepto_id}: curva_programada requerida`);
          continue;
        }
        const ultimo = item.curva_programada[item.curva_programada.length - 1];
        if (ultimo.pct_acumulado !== 100) {
          errores.push(`${item.concepto_id}: La curva debe terminar en 100%`);
        }
      }

      if (errores.length > 0) {
        res.status(422).json({ success: false, error: { code: 'VALIDACION', message: errores.join('; ') } });
        return;
      }

      const results = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) =>
        Promise.all(items.map(item =>
          prisma.programacionObra.upsert({
            where: { tenant_id_proyecto_id_concepto_id: { tenant_id: tenantId, proyecto_id: proyectoId, concepto_id: item.concepto_id } },
            create: {
              tenant_id: tenantId,
              proyecto_id: proyectoId,
              concepto_id: item.concepto_id,
              concepto_clave: item.concepto_clave ?? item.concepto_id,
              descripcion: item.descripcion ?? '',
              fecha_inicio_plan: new Date(item.fecha_inicio_plan),
              fecha_fin_plan: new Date(item.fecha_fin_plan),
              curva_programada: item.curva_programada,
              bac: item.bac ?? 0,
              estado: 'PENDIENTE',
            },
            update: {
              concepto_clave: item.concepto_clave ?? item.concepto_id,
              descripcion: item.descripcion ?? '',
              fecha_inicio_plan: new Date(item.fecha_inicio_plan),
              fecha_fin_plan: new Date(item.fecha_fin_plan),
              curva_programada: item.curva_programada,
              bac: item.bac ?? 0,
            },
          })
        ))
      );

      logInfo(req, 'control-proyectos', 'cp.programacion.cargada', 'Programación cargada', { total: results.length });
      res.status(201).json({ success: true, data: { total: results.length, items: results.map(r => r.concepto_id) } });
    } catch (error: any) {
      logError(req, 'control-proyectos', 'cp.programacion.error', 'Error al cargar programación', { error_message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

app.get('/api/v1/control-proyectos/alertas', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const estado = req.query.estado as string | undefined;
    const severidad = req.query.severidad as string | undefined;

    const alertas = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) =>
      prisma.alertaProyecto.findMany({
        where: {
          tenant_id: tenantId,
          proyecto_id: proyectoId,
          ...(estado ? { estado } : { estado: { in: ['ACTIVA', 'RECONOCIDA'] } }),
          ...(severidad ? { severidad } : {}),
        },
        orderBy: [{ severidad: 'asc' }, { created_at: 'desc' }],
      })
    );

    res.json({ success: true, data: alertas });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.patch('/api/v1/control-proyectos/alertas/:id/reconocer',
  requireRoles('admin', 'control_proyectos', 'director'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { nota_cp } = req.body;

      const updated = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
        const alerta = await prisma.alertaProyecto.findFirst({ where: { id: req.params.id, tenant_id: tenantId } });
        if (!alerta) throw Object.assign(new Error('Alerta no encontrada'), { httpStatus: 404 });
        if (alerta.estado !== 'ACTIVA') throw Object.assign(new Error('Solo se pueden reconocer alertas ACTIVAS'), { httpStatus: 422 });

        return prisma.alertaProyecto.update({
          where: { id: alerta.id },
          data: { estado: 'RECONOCIDA', nota_cp: nota_cp ?? null },
        });
      });
      res.json({ success: true, data: updated });
    } catch (error: any) {
      const status = error.httpStatus ?? 500;
      res.status(status).json({ success: false, message: error.message });
    }
  }
);

app.patch('/api/v1/control-proyectos/alertas/:id/ignorar',
  requireRoles('admin', 'director'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { nota_cp } = req.body;

      if (!nota_cp || String(nota_cp).length < 20) {
        res.status(422).json({ success: false, error: { code: 'JUSTIFICACION_REQUERIDA', message: 'Se requiere justificación de al menos 20 caracteres para ignorar una alerta' } });
        return;
      }

      const updated = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
        const alerta = await prisma.alertaProyecto.findFirst({ where: { id: req.params.id, tenant_id: tenantId } });
        if (!alerta) throw Object.assign(new Error('Alerta no encontrada'), { httpStatus: 404 });

        return prisma.alertaProyecto.update({
          where: { id: alerta.id },
          data: { estado: 'IGNORADA', nota_cp },
        });
      });
      res.json({ success: true, data: updated });
    } catch (error: any) {
      const status = error.httpStatus ?? 500;
      res.status(status).json({ success: false, message: error.message });
    }
  }
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HEALTH
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'control-proyectos', port: PORT }));

setupSentryExpressHandler(app);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EVENT SUBSCRIBERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function initEventSubscribers(): Promise<void> {
  try {
    await eventBus.connect();

    // control_obra.avance_fisico_validado YA NO se re-consume aquí — se
    // convirtió en llamada directa (recalcularEVMPorAvanceValidado) dentro
    // de PATCH .../avances/:id/validar (Decisión 4 de design.md).

    // Partida bloqueada → crear alerta PARTIDA_BLOQUEADA
    await eventBus.subscribe<{
      concepto_id: string;
      concepto_clave: string;
      estado_tope: string;
    }>('gerencia_tecnica.partida_bloqueada', async (event) => {
      const { tenant_id, proyecto_id } = event.context;
      const { concepto_id, concepto_clave, estado_tope } = event.payload;
      try {
        await createTenantContext({ tenantId: tenant_id, proyectoId: proyecto_id, userId: 'system' }, async (prisma) => {
          await upsertAlerta(prisma, tenant_id, proyecto_id, 'PARTIDA_BLOQUEADA', concepto_id, {
            severidad: 'CRITICA',
            titulo: `Partida ${concepto_clave} bloqueada (${estado_tope})`,
            descripcion: `La partida ${concepto_clave} ha alcanzado su tope presupuestal. Estado: ${estado_tope}. Las requisiciones asociadas quedarán bloqueadas hasta que se apruebe una transferencia.`,
            datos: { concepto_clave, estado_tope },
          });
        });
      } catch (err) {
        console.error('[CP] partida_bloqueada error:', err);
      }
    });

    // Transferencia aprobada → recalcular alertas de tope en origen y destino
    await eventBus.subscribe<{
      concepto_origen_id: string;
      concepto_destino_id: string;
      monto: number;
    }>('gerencia_tecnica.transferencia_partida_aprobada', async (event) => {
      const { tenant_id, proyecto_id } = event.context;
      const { concepto_destino_id } = event.payload;
      try {
        await createTenantContext({ tenantId: tenant_id, proyectoId: proyecto_id, userId: 'system' }, async (prisma) => {
          await resolverAlertaSiExiste(prisma, tenant_id, proyecto_id, 'PARTIDA_BLOQUEADA', concepto_destino_id);
          await calcularAlertas(prisma, tenant_id, proyecto_id);
        });
      } catch (err) {
        console.error('[CP] transferencia_aprobada error:', err);
      }
    });

    // Centro de costos creado → registro liviano (auditoría/log)
    await eventBus.subscribe('auth.centro_costos_creado', handleCentroCostosCreadoEvent);

    // Pago registrado en Finanzas → reconciliar estimación (migrado de control-obra)
    await eventBus.subscribe('finanzas.pago_registrado', handlePagoRegistradoEvent);

    // Salida de almacén hacia obra → costo real por concepto (migrado de control-obra)
    await eventBus.subscribe('almacen.salida_obra', handleSalidaObraEvent);

    // OC creada/cancelada → AC comprometido por partida (fix-evm-costos-reales)
    await eventBus.subscribe('compras.oc_creada', handleOcCreadaEvent);
    await eventBus.subscribe('compras.oc_cancelada', handleOcCanceladaEvent);

    console.log('[CP] Suscriptores de eventos activos: partida_bloqueada, transferencia_partida_aprobada, centro_costos_creado, pago_registrado, salida_obra, oc_creada, oc_cancelada');
  } catch (err) {
    console.warn('[CP] RabbitMQ no disponible, suscriptores desactivados:', (err as Error).message);
  }
}

// ─── EVM global: snapshot diario de ProyeccionCierre (fix-evm-costos-reales) ─
// design.md Decisión 5/6 — agrega BAC/PV/EV/AC de todas las
// ProgramacionObra del proyecto + mano de obra pagada (ManoObraProyecto, NO
// distribuida por partida, ver Non-Goals) y calcula las métricas derivadas.
// ProyeccionCierre no tiene columnas nullable (cpi/spi/etc son NOT NULL en
// el schema) — cuando todavía no hay AC/PV (proyecto recién cargado, sin OC
// ni pagos), se usa 1 como CPI/SPI neutro (sin desviación conocida) en vez
// de dejar la fila sin crear, para que /dashboard y /evm dejen de devolver
// `global`/`resumen_evm` en null apenas hay programación cargada.
// Un solo snapshot por (tenant, proyecto, día): si el job corre más de una
// vez el mismo día (o se llama dos veces en un test), se actualiza el
// mismo registro en vez de duplicar filas.
export async function calcularYGuardarProyeccionCierre(
  prisma: PrismaClient,
  tenantId: string,
  proyectoId: string
): Promise<void> {
  const partidas = await prisma.programacionObra.findMany({
    where: { tenant_id: tenantId, proyecto_id: proyectoId },
  });
  if (partidas.length === 0) return;

  const semanaCorte = isoWeek(new Date());

  let bac = 0;
  let ev = 0;
  let pv = 0;
  let acPartidas = 0;
  let fechaFinPlanMax: Date | null = null;

  for (const p of partidas) {
    const bacPartida = Number(p.bac);
    bac += bacPartida;
    ev += (Number(p.pct_avance_real) / 100) * bacPartida;
    acPartidas += Number(p.ac_comprometido) + Number(p.ac_ejercido);

    // Partidas sin curva_programada no aportan PV (tratadas como 0 al
    // agregar, consistente con "sin datos de programación no hay SPI" a
    // nivel partida — a nivel proyecto simplemente no suman al total).
    const pctProgramado = interpolarPctProgramado(p.curva_programada, semanaCorte);
    pv += pctProgramado !== null ? (pctProgramado / 100) * bacPartida : 0;

    if (p.fecha_fin_plan && (!fechaFinPlanMax || p.fecha_fin_plan > fechaFinPlanMax)) {
      fechaFinPlanMax = p.fecha_fin_plan;
    }
  }

  const manoObra = await prisma.manoObraProyecto.findUnique({
    where: { tenant_id_proyecto_id: { tenant_id: tenantId, proyecto_id: proyectoId } },
  });
  const acManoObra = manoObra ? Number(manoObra.monto_acumulado) : 0;
  const ac = acPartidas + acManoObra;

  const cpi = ac > 0 ? ev / ac : 1;
  const spi = pv > 0 ? ev / pv : 1;
  const cv = ev - ac;
  const sv = ev - pv;
  const eac = cpi > 0 ? bac / cpi : bac;
  const etc = eac - ac;
  const vac = bac - eac;

  const hoy = new Date(new Date().toISOString().split('T')[0]);
  const data = { bac, pv, ev, ac, cpi, spi, cv, sv, eac, etc, vac, fecha_fin_plan: fechaFinPlanMax };

  const existente = await prisma.proyeccionCierre.findFirst({
    where: { tenant_id: tenantId, proyecto_id: proyectoId, fecha_calculo: hoy },
  });

  if (existente) {
    await prisma.proyeccionCierre.update({ where: { id: existente.id }, data });
  } else {
    await prisma.proyeccionCierre.create({
      data: { tenant_id: tenantId, proyecto_id: proyectoId, fecha_calculo: hoy, ...data },
    });
  }
}

// Job nocturno: recalcular alertas + snapshot de ProyeccionCierre cada 24h.
// NOTA (gap conocido, ver design.md): esta consulta enumera combinaciones
// (tenant_id, proyecto_id) de TODOS los tenants — es una lectura
// intencionalmente cross-tenant para un job de mantenimiento interno, no
// para servir una request. Bajo RLS real con bocam_app (sin BYPASSRLS), esta
// query dejará de ver filas de tenants para los que no hay sesión activa. Se
// deja documentado como seguimiento pendiente, fuera del alcance de este
// change (no bloquea el request path ni el aislamiento de datos entre
// tenants, que es el objetivo de seguridad de fix-rls-bypass-bocam-admin).
function initJobNocturno(): void {
  const MS_24H = 24 * 60 * 60 * 1000;
  setInterval(async () => {
    try {
      const activos = await basePrisma.$queryRaw<Array<{ tenant_id: string; proyecto_id: string }>>`
        SELECT DISTINCT tenant_id, proyecto_id FROM programacion_obra
      `;
      for (const { tenant_id, proyecto_id } of activos) {
        await createTenantContext({ tenantId: tenant_id, proyectoId: proyecto_id, userId: 'system' }, async (prisma) => {
          await calcularAlertas(prisma, tenant_id, proyecto_id);
          await calcularYGuardarProyeccionCierre(prisma, tenant_id, proyecto_id);
        });
      }
      console.log(`[CP] Job nocturno: alertas y proyección de cierre recalculadas para ${activos.length} proyectos`);
    } catch (err) {
      console.error('[CP] Job nocturno error:', err);
    }
  }, MS_24H);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BOOTSTRAP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function startServer() {
  return app.listen(PORT, async () => {
    console.log(`[CP] Control de Proyectos escuchando en puerto ${PORT}`);
    await initEventSubscribers();
    initJobNocturno();
  });
}

export async function initEventBus() {
  await eventBus.connect();
}

export async function shutdownEventBus() {
  await eventBus.close();
}

if (require.main === module) {
  void startServer();
}
