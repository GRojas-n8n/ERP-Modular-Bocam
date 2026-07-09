import express, { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { createTenantContext } from './db';
import type { PrismaClient } from './generated/prisma';
import { BocamEvent, createEventBus } from '../../../packages/event-bus/src';
import { createAuthMiddleware, requireEnv, requireProjectAccess, requireRoles } from '../../../packages/auth-middleware/src';
import {
  buildEventContext,
  buildForwardHeaders,
  createObservabilityMiddleware,
  initSentry,
  logError,
  logInfo,
  logWarn,
  setupSentryExpressHandler,
} from '../../../packages/observability/src';
import { applyTerminalMutationInContext, buildTerminalHttpResponse, logTerminalState } from '../../../packages/tenant-idempotency/src';
import { enviarSolicitudCotizacionEmail } from './mailer';
import { resolveProyectoIdParaSolicitud } from './solicitud-cotizacion-policy';

const eventBus = createEventBus('compras');

export const app = express();
app.use(express.json());
app.use(createObservabilityMiddleware('compras'));

const PORT = process.env.PORT || 3002;
const JWT_SECRET = requireEnv('JWT_SECRET');
const FINANZAS_URL = process.env.FINANZAS_URL || 'http://localhost:3004/api/v1/finanzas';
const GT_URL = process.env.GT_URL || 'http://localhost:3001/api/v1/gerencia-tecnica';
const IVA_RATE = parseFloat(process.env.IVA_RATE ?? '0.16');
const DOCS_PROVEEDORES_UPLOAD_DIR = process.env.DOCS_PROVEEDORES_UPLOAD_DIR || '/tmp/docs-proveedores';
const DOCS_PROVEEDORES_MAX_SIZE_MB = parseInt(process.env.DOCS_PROVEEDORES_MAX_SIZE_MB ?? '10', 10);
const COTIZACIONES_UPLOAD_DIR = process.env.COTIZACIONES_UPLOAD_DIR || '/tmp/cotizaciones';
const COTIZACIONES_MAX_SIZE_MB = parseInt(process.env.COTIZACIONES_MAX_SIZE_MB ?? '20', 10);
initSentry(process.env.SENTRY_DSN || '', 'compras');

// Multer para PDFs de cotización (declarado aquí para que esté disponible antes de las rutas)
const cotizacionesTmp = path.join(COTIZACIONES_UPLOAD_DIR, '_tmp');
const cotizacionesMulter = multer({
  dest: cotizacionesTmp,
  limits: { fileSize: COTIZACIONES_MAX_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error(`Tipo de archivo no permitido: ${ext}. Permitidos: ${allowed.join(', ')}`));
  },
});

function addDiasHabiles(fecha: Date, dias: number): Date {
  const result = new Date(fecha);
  let added = 0;
  while (added < dias) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) added++;
  }
  return result;
}

function calcDiasHabilesRestantes(fechaLimite: Date): number {
  const now = new Date();
  if (fechaLimite <= now) {
    let count = 0;
    const curr = new Date(fechaLimite);
    while (curr <= now) {
      const day = curr.getDay();
      if (day !== 0 && day !== 6) count++;
      curr.setDate(curr.getDate() + 1);
    }
    return -count;
  }
  let count = 0;
  const curr = new Date(now);
  while (curr < fechaLimite) {
    curr.setDate(curr.getDate() + 1);
    const day = curr.getDay();
    if (day !== 0 && day !== 6) count++;
  }
  return count;
}

/**
 * Envía la solicitud de cotización por correo a cada proveedor seleccionado
 * que tenga email_contacto registrado. Best-effort: nunca lanza — si SMTP o
 * el catálogo de GT fallan, retorna el detalle para que el frontend lo muestre,
 * pero no revierte la solicitud ya creada en BD.
 */
async function enviarCorreosSolicitudCotizacion(opts: {
  reqId: string; tenantId: string; proyectoId: string; proveedoresIds: string[];
  diasHabiles: number; notas: string | null; fechaSolicitud: Date; fechaLimite: Date;
  compradorNombre: string; compradorEmail: string; tema: 'claro' | 'oscuro'; proyectoNombre?: string;
  authHeader?: string; tenantHeader?: string; proyectoHeader?: string;
}): Promise<{ enviados: number; fallidos: Array<{ proveedor: string; error: string }>; sin_correo: string[] }> {
  const fallidos: Array<{ proveedor: string; error: string }> = [];
  const sinCorreo: string[] = [];
  let enviados = 0;

  try {
    const [reqData, proveedoresData, insumosCatalogo] = await Promise.all([
      createTenantContext({ tenantId: opts.tenantId, proyectoId: opts.proyectoId, userId: '' }, async (prisma) =>
        prisma.requisicion.findUnique({
          where: { id_requisicion: opts.reqId },
          include: { items: true },
        })
      ),
      createTenantContext({ tenantId: opts.tenantId, proyectoId: opts.proyectoId, userId: '' }, async (prisma) =>
        prisma.proveedor.findMany({ where: { id_proveedor: { in: opts.proveedoresIds } } })
      ),
      axios.get(`${GT_URL}/insumos`, {
        headers: { authorization: opts.authHeader, 'x-tenant-id': opts.tenantHeader, 'x-proyecto-id': opts.proyectoHeader },
        timeout: 5000,
      }).then(r => (r.data?.data ?? []) as any[]).catch(() => [] as any[]),
    ]);

    if (!reqData) {
      return { enviados: 0, fallidos: [{ proveedor: '—', error: 'Requisición no encontrada al enviar correos.' }], sin_correo: [] };
    }

    const insumoById = new Map(insumosCatalogo.map(i => [i.id, i]));
    const items = reqData.items.map((it: any, idx: number) => {
      const insumo = it.insumo_id ? insumoById.get(it.insumo_id) : undefined;
      return {
        partida: String(idx + 1),
        descripcion: it.es_imprevisto
          ? (it.descripcion_libre || 'Descripción libre no capturada')
          : (insumo ? `[${insumo.clave}] ${insumo.descripcion}` : (it.insumo_id ? 'Insumo no encontrado en catálogo' : '—')),
        cantidad: Number(it.cantidad),
        unidad: it.es_imprevisto ? (it.unidad_libre || '') : (insumo?.unidad_medida || ''),
        marca_modelo: it.especificacion_marca_modelo,
        especificacion_detalle: it.especificacion_detalle,
      };
    });

    for (const prov of proveedoresData) {
      if (!prov.email_contacto) {
        sinCorreo.push(prov.razon_social);
        continue;
      }
      const result = await enviarSolicitudCotizacionEmail(
        {
          razon_social: prov.razon_social,
          rfc_tax_id: prov.rfc_tax_id,
          email_contacto: prov.email_contacto,
          telefono: prov.telefono,
          ciudad: prov.ciudad,
        },
        {
          folio: reqData.codigo,
          proyectoNombre: opts.proyectoNombre || opts.proyectoId.substring(0, 8).toUpperCase(),
          prioridad: reqData.prioridad,
          diasHabiles: opts.diasHabiles,
          fechaSolicitud: opts.fechaSolicitud,
          fechaLimite: opts.fechaLimite,
          notasProveedor: opts.notas ?? reqData.observaciones ?? null,
          direccionEntrega: reqData.direccion_entrega ?? null,
          items,
          comprador: { nombre: opts.compradorNombre, email: opts.compradorEmail },
        },
        opts.tema
      );
      if (result.enviado) enviados++;
      else fallidos.push({ proveedor: prov.razon_social, error: result.error || 'Error desconocido.' });
    }
  } catch (err: any) {
    fallidos.push({ proveedor: '—', error: `Error preparando correos: ${err.message}` });
  }

  return { enviados, fallidos, sin_correo: sinCorreo };
}

const OC_STATUS = {
  PENDIENTE_FINANZAS: 'PENDIENTE_CONFIRMACION_FINANZAS',
  ERROR_FINANZAS: 'ERROR_FINANZAS',
  EMITIDA: 'EMITIDA',
  PARCIALMENTE_RECIBIDA: 'PARCIALMENTE_RECIBIDA',
  RECIBIDA: 'RECIBIDA',
  CANCELACION_PENDIENTE: 'CANCELACION_PENDIENTE',
  CANCELADA: 'CANCELADA',
} as const;

// Calcula el nuevo estado de la OC basado en acumulados de recepciones.
// Retorna 'PARCIALMENTE_RECIBIDA' si alguna línea no está completa,
// 'RECIBIDA' si todas las líneas superan o igualan su cantidad pedida.
async function calcularEstadoOC(orderId: string, prisma: any): Promise<string> {
  const items = await prisma.ordenCompraItem.findMany({ where: { orden_id: orderId } });
  if (items.length === 0) return OC_STATUS.RECIBIDA;

  const recepciones = await prisma.recepcionOCItem.findMany({ where: { orden_item_id: { in: items.map((i: any) => i.id_item) } } });

  const acumulados = new Map<string, number>();
  for (const r of recepciones) {
    const prev = acumulados.get(r.orden_item_id) ?? 0;
    acumulados.set(r.orden_item_id, prev + Number(r.cantidad_recibida));
  }

  for (const item of items) {
    const recibido = acumulados.get(item.id_item) ?? 0;
    if (recibido < Number(item.cantidad)) return OC_STATUS.PARCIALMENTE_RECIBIDA;
  }
  return OC_STATUS.RECIBIDA;
}

app.use(createAuthMiddleware({
  jwtSecret: JWT_SECRET,
  excludePaths: ['/health'],
}));
app.use(requireProjectAccess());

app.get('/api/v1/compras/requisiciones', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => prisma.requisicion.findMany({
        include: { items: true },
        orderBy: { fecha_solicitud: 'desc' }
      })
    );

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/v1/compras/requisiciones', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId, name: solicitanteNombre } = req.securityContext;
    const { codigo, items, observaciones, observaciones_internas, direccion_entrega, prioridad, tipo, concepto_id } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Se requiere al menos un ítem en la requisición.' });
    }

    if (!concepto_id) {
      return res.status(400).json({ success: false, message: 'concepto_id es obligatorio. Selecciona la partida del catálogo de conceptos.' });
    }

    const tipoReq: string = tipo === 'IMPREVISTO' ? 'IMPREVISTO' : 'NORMAL';

    // ── Validar justificación en excedentes e imprevistos (D3 trazabilidad) ──
    for (const item of items) {
      const esImprevisto = Boolean(item.es_imprevisto) || tipoReq === 'IMPREVISTO';
      const cantPres = item.cantidad_presupuestada != null ? Number(item.cantidad_presupuestada) : null;
      const cantSol  = Number(item.cantidad);
      const excede   = cantPres !== null && cantPres > 0 && cantSol > cantPres;
      const label    = item.clave || item.descripcion_libre || item.insumo_id || 'ítem';

      if ((esImprevisto || excede) && (!item.justificacion || String(item.justificacion).trim() === '')) {
        return res.status(400).json({
          success: false,
          message: `El ítem "${label}" ${excede ? 'excede el presupuesto' : 'es imprevisto'} — se requiere justificación.`,
        });
      }
    }

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => prisma.requisicion.create({
        data: {
          tenant_id:     tenantId,
          proyecto_id:   proyectoId,
          codigo:        codigo || `REQ-${Date.now()}`,
          solicitante_id: userId,
          solicitante_nombre: solicitanteNombre || null,
          prioridad:     prioridad || 'NORMAL',
          estado:        'PENDIENTE',
          tipo:          tipoReq,
          observaciones,
          observaciones_internas: observaciones_internas || null,
          direccion_entrega: direccion_entrega || null,
          concepto_id:   concepto_id || null,
          items: {
            create: items.map((item: any) => ({
              tenant_id:              tenantId,
              proyecto_id:            proyectoId,
              insumo_id:              item.insumo_id             || null,
              cantidad:               item.cantidad,
              notas:                  item.notas                 || null,
              descripcion_libre:      item.descripcion_libre     || null,
              unidad_libre:           item.unidad_libre          || null,
              es_imprevisto:          Boolean(item.es_imprevisto),
              cantidad_presupuestada: item.cantidad_presupuestada != null ? Number(item.cantidad_presupuestada) : null,
              concepto_origen_id:     item.concepto_origen_id    || null,
              justificacion:          item.justificacion         || null,
              especificacion_marca_modelo: item.especificacion_marca_modelo || null,
              especificacion_detalle:      item.especificacion_detalle      || null,
            }))
          }
        },
        include: { items: true }
      })
    );

    logInfo(req, 'compras', 'compras.requisicion_creada', `Requisición ${data.codigo} creada`, {
      tipo: tipoReq, items: items.length,
    });
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    logError(req, 'compras', 'compras.requisicion_create_error', 'Error al crear requisición', { error_message: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PATCH /api/v1/compras/requisiciones/:id/aprobar
 * Procurement o Admin aprueba una requisición PENDIENTE → APROBADA.
 * Sólo cambia el estado — no modifica ítems ni prioridad.
 */
app.patch(
  '/api/v1/compras/requisiciones/:id/aprobar',
  requireRoles('procurement', 'admin', 'superintendent'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { id } = req.params;

      const data = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          const req_obj = await prisma.requisicion.findUnique({
            where: { id_requisicion: id },
          });
          if (!req_obj) return null;
          if (req_obj.estado === 'APROBADA') return req_obj; // idempotente
          if (!['PENDIENTE', 'BORRADOR', 'PENDIENTE_TRANSFERENCIA'].includes(req_obj.estado)) {
            throw new Error(`La requisición está en estado ${req_obj.estado} y no puede aprobarse.`);
          }
          return req_obj;
        }
      );

      if (!data) {
        return res.status(404).json({ success: false, message: 'Requisición no encontrada.' });
      }

      const reqObj = data as any;

      // Gate: verificar SaldoPartida si la req tiene concepto_id asignado
      let warningPartida: string | null = null;
      if (reqObj.concepto_id) {
        try {
          const saldoResp = await axios.get(`${GT_URL}/partidas/${reqObj.concepto_id}/saldo`, {
            headers: { Authorization: req.headers.authorization || '', 'x-tenant-id': tenantId, 'x-proyecto-id': proyectoId },
            timeout: 2000,
          });
          const saldo = saldoResp.data?.data;

          if (saldo?.estado_tope === 'BLOQUEADO' && saldo?.bloqueo_automatico !== false) {
            // Partida agotada → req va a PENDIENTE_TRANSFERENCIA
            const blocked = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) =>
              prisma.requisicion.update({
                where: { id_requisicion: id },
                data: { estado: 'PENDIENTE_TRANSFERENCIA' },
                include: { items: true },
              })
            );

            try {
              await eventBus.publish({
                event_type: 'gerencia_tecnica.partida_bloqueada',
                timestamp:  new Date().toISOString(),
                context:    buildEventContext(req),
                payload: {
                  concepto_id:     reqObj.concepto_id,
                  concepto_clave:  saldo.concepto_clave || '',
                  monto_aprobado:  saldo.monto_aprobado,
                  monto_disponible: saldo.monto_disponible,
                  trigger:         'REQUISICION',
                  referencia_id:   id,
                  referencia_codigo: reqObj.codigo,
                },
              });
            } catch (_) { /* best-effort */ }

            logInfo(req, 'compras', 'compras.requisicion_bloqueada_partida', `Req ${reqObj.codigo} en PENDIENTE_TRANSFERENCIA — partida ${reqObj.concepto_id} BLOQUEADA`, { concepto_id: reqObj.concepto_id });

            return res.status(422).json({
              success: false,
              error: 'PARTIDA_BLOQUEADA',
              message: `La partida presupuestal ha alcanzado su tope. La requisición ${reqObj.codigo} queda en espera de transferencia presupuestal.`,
              data: { ...blocked, estado: 'PENDIENTE_TRANSFERENCIA' },
            });
          }

          if (saldo?.estado_tope === 'LIMITADO') {
            warningPartida = `Partida al límite: disponible $${Number(saldo.monto_disponible).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
          }

          // Actualizar monto_en_proceso en GT (fire-and-forget)
          if (reqObj.concepto_id) {
            const montoReq = reqObj.items?.reduce((acc: number, item: any) => acc + (Number(item.cantidad) * (item.precio_unitario ? Number(item.precio_unitario) : 0)), 0) ?? 0;
            if (montoReq > 0) {
              axios.post(`${GT_URL}/partidas/${reqObj.concepto_id}/comprometer`, {
                monto:            montoReq,
                referencia_id:    id,
                referencia_codigo: reqObj.codigo,
                tipo:             'REQ_APROBADA',
              }, { headers: { Authorization: req.headers.authorization || '', 'x-tenant-id': tenantId, 'x-proyecto-id': proyectoId }, timeout: 3000 })
                .catch((e: any) => console.warn('[Compras] No se actualizó monto_en_proceso en GT:', e.message));
            }
          }
        } catch (gtErr: any) {
          if (gtErr.code !== 'ECONNABORTED' && !gtErr.message?.includes('timeout')) {
            console.warn('[Compras] GT no disponible para verificar partida — aprobando en modo degradado:', gtErr.message);
          }
        }
      }

      const approved = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => prisma.requisicion.update({
          where: { id_requisicion: id },
          data: { estado: 'APROBADA' },
          include: { items: true },
        })
      );

      logInfo(req, 'compras', 'compras.requisicion_aprobada', `Requisición ${reqObj.codigo} aprobada por ${userId}`);

      try {
        await eventBus.publish({
          event_type:  'compras.requisicion_aprobada',
          timestamp:   new Date().toISOString(),
          context:     buildEventContext(req),
          payload: {
            requisicion_id: id,
            codigo:         reqObj.codigo,
            tipo:           reqObj.tipo,
            prioridad:      reqObj.prioridad,
            aprobado_por:   userId,
          },
        });
      } catch (_) { /* EventBus offline — degradación elegante */ }

      res.json({ success: true, data: approved, ...(warningPartida ? { warning: warningPartida } : {}) });
    } catch (error: any) {
      logError(req, 'compras', 'compras.requisicion_aprobar_error', 'Error al aprobar requisición', { error_message: error.message });
      res.status(400).json({ success: false, message: error.message });
    }
  }
);

// ── PATCH: editar specs inline (marca/modelo + detalle) de un ítem ───────────

app.patch(
  '/api/v1/compras/requisiciones/:reqId/items/:itemId/specs',
  requireRoles('resident', 'residencia', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { reqId, itemId } = req.params;
      const { especificacion_marca_modelo, especificacion_detalle } = req.body as {
        especificacion_marca_modelo?: string;
        especificacion_detalle?: string;
      };

      const updated = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          const item = await prisma.requisicionItem.findFirst({
            where: { id_item: itemId, requisicion_id: reqId, tenant_id: tenantId },
          });
          if (!item) throw Object.assign(new Error('Ítem no encontrado'), { statusCode: 404 });
          return prisma.requisicionItem.update({
            where: { id_item: itemId },
            data: {
              especificacion_marca_modelo: especificacion_marca_modelo ?? item.especificacion_marca_modelo,
              especificacion_detalle:      especificacion_detalle      ?? item.especificacion_detalle,
            },
          });
        }
      );

      res.json({ success: true, data: updated });
    } catch (error: any) {
      const status = error.statusCode ?? 500;
      logError(req, 'compras', 'compras.requisicion.item.specs.error', 'Error al actualizar specs de ítem', { error_message: error.message });
      res.status(status).json({ success: false, message: error.message });
    }
  }
);

// ── GET requisición por ID con especificaciones ────────────────────────────────

app.get('/api/v1/compras/requisiciones/:id', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { id } = req.params;

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => {
        const requisicion = await prisma.requisicion.findUnique({
          where: { id_requisicion: id },
          include: { items: true },
        });
        if (!requisicion) return null;

        const specs = await prisma.especificacionDetalleReq.findMany({
          where: { tenant_id: tenantId, detalle_id: { in: requisicion.items.map(i => i.id_item) } },
          orderBy: { orden: 'asc' },
        });

        const specsMap = new Map<string, typeof specs>();
        for (const s of specs) {
          if (!specsMap.has(s.detalle_id)) specsMap.set(s.detalle_id, []);
          specsMap.get(s.detalle_id)!.push(s);
        }

        const solicitud = await prisma.solicitudCotizacion.findUnique({
          where: { tenant_id_requisicion_id: { tenant_id: tenantId, requisicion_id: id } },
          include: { proveedores: true },
        });

        const solicitudConAlerta = solicitud ? {
          ...solicitud,
          dias_habiles_restantes: calcDiasHabilesRestantes(solicitud.fecha_limite),
          alerta_plazo: solicitud.fecha_limite < new Date() &&
            solicitud.proveedores.some(p => p.estado === 'PENDIENTE'),
          proveedores: solicitud.proveedores.map(p => ({ ...p, pdf_ruta: undefined })),
        } : null;

        return {
          ...requisicion,
          items: requisicion.items.map(item => ({
            ...item,
            especificaciones: specsMap.get(item.id_item) ?? [],
          })),
          solicitud: solicitudConAlerta,
        };
      }
    );

    if (!data) return res.status(404).json({ success: false, message: 'Requisición no encontrada.' });
    res.json({ success: true, data });
  } catch (error: any) {
    logError(req, 'compras', 'compras.requisicion.get.error', 'Error al obtener requisición', { error_message: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── Especificaciones por partida de requisición ────────────────────────────────

app.put(
  '/api/v1/compras/requisiciones/:reqId/items/:itemId/especificaciones',
  requireRoles('resident', 'residencia', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { reqId, itemId } = req.params;
      const { especificaciones } = req.body as {
        especificaciones: { descripcion: string; orden?: number }[];
      };

      if (!Array.isArray(especificaciones)) {
        return res.status(400).json({ success: false, message: 'especificaciones debe ser un array.' });
      }

      const data = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          const req_obj = await prisma.requisicion.findUnique({
            where: { id_requisicion: reqId },
            select: { estado: true, tenant_id: true },
          });
          if (!req_obj || req_obj.tenant_id !== tenantId) {
            return { notFound: true };
          }
          if (!['BORRADOR', 'PENDIENTE'].includes(req_obj.estado)) {
            return { locked: true, estado: req_obj.estado };
          }

          const item = await prisma.requisicionItem.findFirst({
            where: { id_item: itemId, requisicion_id: reqId, tenant_id: tenantId },
          });
          if (!item) return { notFound: true };

          await prisma.especificacionDetalleReq.deleteMany({
            where: { tenant_id: tenantId, detalle_id: itemId },
          });

          if (especificaciones.length > 0) {
            await prisma.especificacionDetalleReq.createMany({
              data: especificaciones
                .filter(e => e.descripcion?.trim())
                .map((e, idx) => ({
                  tenant_id: tenantId,
                  proyecto_id: proyectoId,
                  detalle_id: itemId,
                  descripcion: e.descripcion.trim().substring(0, 500),
                  orden: e.orden ?? idx,
                })),
            });
          }

          return prisma.especificacionDetalleReq.findMany({
            where: { tenant_id: tenantId, detalle_id: itemId },
            orderBy: { orden: 'asc' },
          });
        }
      );

      if ((data as any).notFound) return res.status(404).json({ success: false, message: 'Requisición o partida no encontrada.' });
      if ((data as any).locked) return res.status(400).json({ success: false, message: `La requisición en estado ${(data as any).estado} no puede editarse.` });

      logInfo(req, 'compras', 'compras.requisicion.specs.actualizadas', 'Especificaciones actualizadas', { req_id: reqId, item_id: itemId, total: (data as any[]).length });
      res.json({ success: true, data });
    } catch (error: any) {
      logError(req, 'compras', 'compras.requisicion.specs.error', 'Error al actualizar especificaciones', { error_message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// ── Solicitudes de Cotización ──────────────────────────────────────────────────

app.post(
  '/api/v1/compras/requisiciones/:reqId/solicitud-cotizacion',
  requireRoles('procurement', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId, name: compradorNombre, email: compradorEmail } = req.securityContext;
      const { reqId } = req.params;
      const { proveedores_ids, dias_habiles, notas, tema, proyecto_nombre } = req.body as {
        proveedores_ids: string[];
        dias_habiles: 3 | 5;
        notas?: string;
        tema?: 'claro' | 'oscuro';
        proyecto_nombre?: string;
      };

      if (!Array.isArray(proveedores_ids) || proveedores_ids.length === 0) {
        return res.status(400).json({ success: false, message: 'proveedores_ids debe ser un array no vacío.' });
      }
      if (![3, 5].includes(Number(dias_habiles))) {
        return res.status(400).json({ success: false, message: 'dias_habiles debe ser 3 o 5.' });
      }

      const data = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          const req_obj = await prisma.requisicion.findUnique({
            where: { id_requisicion: reqId },
            select: { id_requisicion: true, tenant_id: true, proyecto_id: true },
          });
          if (!req_obj || req_obj.tenant_id !== tenantId) {
            return { notFound: true };
          }

          // El proyecto de la solicitud SIEMPRE viene de la requisición de
          // origen — nunca del proyecto activo de la sesión del usuario
          // (roles tenant-level pueden tener seleccionado otro proyecto, o
          // ninguno). Ver openspec/changes/fix-proyecto-id-solicitud-cotizacion.
          const proyectoIdSolicitud = resolveProyectoIdParaSolicitud(req_obj, tenantId);

          const fechaSolicitud = new Date();
          const fechaLimite = addDiasHabiles(fechaSolicitud, Number(dias_habiles));

          // upsert: si ya existe una solicitud, se ACTUALIZA sin perder el progreso de
          // los proveedores que se conservan (respuestas/PDFs ya subidos). Solo se
          // agregan los proveedores nuevos y se quitan los que ya no están seleccionados.
          const existing = await prisma.solicitudCotizacion.findUnique({
            where: { tenant_id_requisicion_id: { tenant_id: tenantId, requisicion_id: reqId } },
            include: { proveedores: true },
          });

          if (existing) {
            const idsActuales = new Set(existing.proveedores.map(p => p.proveedor_id));
            const idsNuevos = new Set(proveedores_ids as string[]);
            const aQuitar = existing.proveedores.filter(p => !idsNuevos.has(p.proveedor_id));
            const aAgregar = (proveedores_ids as string[]).filter(pid => !idsActuales.has(pid));

            if (aQuitar.length > 0) {
              await prisma.solicitudCotizacionProveedor.deleteMany({
                where: { id_scp: { in: aQuitar.map(p => p.id_scp) } },
              });
            }

            const updated = await prisma.solicitudCotizacion.update({
              where: { id_solicitud: existing.id_solicitud },
              data: { dias_habiles: Number(dias_habiles), fecha_solicitud: fechaSolicitud, fecha_limite: fechaLimite, notas: notas ?? null },
            });

            if (aAgregar.length > 0) {
              await prisma.solicitudCotizacionProveedor.createMany({
                data: aAgregar.map(pid => ({
                  tenant_id: tenantId,
                  solicitud_id: updated.id_solicitud,
                  proveedor_id: pid,
                })),
              });
            }

            const full = await prisma.solicitudCotizacion.findUnique({
              where: { id_solicitud: updated.id_solicitud },
              include: { proveedores: true },
            });
            return { ...full, proveedoresNuevos: aAgregar };
          }

          const sol = await prisma.solicitudCotizacion.create({
            data: {
              tenant_id: tenantId,
              proyecto_id: proyectoIdSolicitud,
              requisicion_id: reqId,
              dias_habiles: Number(dias_habiles),
              fecha_solicitud: fechaSolicitud,
              fecha_limite: fechaLimite,
              creado_por: userId,
              notas: notas ?? null,
              proveedores: {
                create: proveedores_ids.map(pid => ({
                  tenant_id: tenantId,
                  proveedor_id: pid,
                })),
              },
            },
            include: { proveedores: true },
          });
          return { ...sol, proveedoresNuevos: proveedores_ids as string[] };
        }
      );

      if ((data as any).notFound) return res.status(404).json({ success: false, message: 'Requisición no encontrada.' });

      logInfo(req, 'compras', 'compras.solicitud_cotizacion.creada', 'Solicitud de cotización registrada', {
        req_id: reqId, proveedores: proveedores_ids.length, dias_habiles,
      });

      // ── Envío de correos — solo a proveedores nuevos en esta edición, para no
      // reenviar el correo a quienes ya fueron invitados en un envío anterior ──
      const proveedoresAEmailear: string[] = (data as any).proveedoresNuevos ?? proveedores_ids;
      const emailResult = proveedoresAEmailear.length === 0
        ? { enviados: 0, fallidos: [], sin_correo: [] }
        : await enviarCorreosSolicitudCotizacion({
        reqId, tenantId, proyectoId: (data as any).proyecto_id, proveedoresIds: proveedoresAEmailear,
        diasHabiles: Number(dias_habiles), notas: notas ?? null,
        fechaSolicitud: (data as any).fecha_solicitud,
        fechaLimite: (data as any).fecha_limite,
        compradorNombre: compradorNombre || 'Compras Bocam',
        compradorEmail: compradorEmail || '',
        tema: tema === 'oscuro' ? 'oscuro' : 'claro',
        proyectoNombre: proyecto_nombre,
        authHeader: req.headers.authorization,
        tenantHeader: req.headers['x-tenant-id'] as string | undefined,
        proyectoHeader: req.headers['x-proyecto-id'] as string | undefined,
      });

      res.status(201).json({ success: true, data, emails: emailResult });
    } catch (error: any) {
      if (error.message === 'REQUISICION_PROYECTO_INVALIDO') {
        return res.status(400).json({ success: false, message: 'El proyecto de la requisición no es válido.' });
      }
      logError(req, 'compras', 'compras.solicitud_cotizacion.crear.error', 'Error al crear solicitud de cotización', { error_message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

app.get(
  '/api/v1/compras/requisiciones/:reqId/solicitud-cotizacion',
  requireRoles('procurement', 'admin', 'superintendent'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { reqId } = req.params;

      const data = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          const sol = await prisma.solicitudCotizacion.findUnique({
            where: { tenant_id_requisicion_id: { tenant_id: tenantId, requisicion_id: reqId } },
            include: { proveedores: { include: { proveedor: true } } },
          });
          if (!sol) return null;

          return {
            ...sol,
            dias_habiles_restantes: calcDiasHabilesRestantes(sol.fecha_limite),
            alerta_plazo: sol.fecha_limite < new Date() && sol.proveedores.some(p => p.estado === 'PENDIENTE'),
            proveedores: sol.proveedores.map(p => ({
              ...p,
              pdf_ruta: undefined,
              proveedor_nombre: p.proveedor?.razon_social ?? '—',
              proveedor_ciudad: p.proveedor?.ciudad ?? null,
            })),
          };
        }
      );

      if (!data) return res.status(404).json({ success: false, message: 'No existe solicitud de cotización para esta requisición.' });
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

app.put(
  '/api/v1/compras/requisiciones/:reqId/solicitud-cotizacion/proveedores/:scpId',
  requireRoles('procurement', 'admin'),
  cotizacionesMulter.single('archivo'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { reqId, scpId } = req.params;
      const { estado, notas_proveedor } = req.body as { estado: string; notas_proveedor?: string };

      const estadosValidos = ['RESPONDIO', 'DECLINO', 'PENDIENTE'];
      if (!estadosValidos.includes(estado)) {
        if (req.file?.path) try { fs.unlinkSync(req.file.path); } catch (_) {}
        return res.status(400).json({ success: false, message: `estado inválido. Valores: ${estadosValidos.join(', ')}` });
      }

      const data = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          const scp = await prisma.solicitudCotizacionProveedor.findFirst({
            where: { id_scp: scpId, tenant_id: tenantId },
            include: { solicitud: true },
          });
          if (!scp || scp.solicitud.requisicion_id !== reqId) {
            return { notFound: true };
          }

          let pdfNombre: string | null = scp.pdf_nombre;
          let pdfRuta: string | null = scp.pdf_ruta;
          let pdfMime: string | null = scp.pdf_mime;

          if (req.file) {
            const ext = path.extname(req.file.originalname).toLowerCase();
            const rutaFinal = path.join(COTIZACIONES_UPLOAD_DIR, tenantId, scp.solicitud_id, `${scpId}${ext}`);
            fs.mkdirSync(path.dirname(rutaFinal), { recursive: true });
            if (pdfRuta && fs.existsSync(pdfRuta)) try { fs.unlinkSync(pdfRuta); } catch (_) {}
            fs.renameSync(req.file.path, rutaFinal);
            pdfNombre = req.file.originalname;
            pdfRuta = rutaFinal;
            pdfMime = req.file.mimetype;
          }

          return prisma.solicitudCotizacionProveedor.update({
            where: { id_scp: scpId },
            data: {
              estado,
              notas_proveedor: notas_proveedor ?? null,
              pdf_nombre: pdfNombre,
              pdf_ruta: pdfRuta,
              pdf_mime: pdfMime,
              fecha_respuesta: ['RESPONDIO', 'DECLINO'].includes(estado) ? new Date() : null,
            },
          });
        }
      );

      if ((data as any).notFound) return res.status(404).json({ success: false, message: 'Registro de proveedor no encontrado.' });

      const result = data as any;
      res.json({ success: true, data: { ...result, pdf_ruta: undefined } });
    } catch (error: any) {
      if (req.file?.path) try { fs.unlinkSync(req.file.path); } catch (_) {}
      logError(req, 'compras', 'compras.solicitud_cotizacion.proveedor.error', 'Error al actualizar respuesta de proveedor', { error_message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

app.get(
  '/api/v1/compras/requisiciones/:reqId/solicitud-cotizacion/proveedores/:scpId/pdf',
  requireRoles('procurement', 'admin', 'superintendent', 'resident', 'residencia'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { scpId } = req.params;

      const scp = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => prisma.solicitudCotizacionProveedor.findFirst({
          where: { id_scp: scpId, tenant_id: tenantId },
        })
      );

      if (!scp || !scp.pdf_ruta) return res.status(404).json({ success: false, message: 'PDF no disponible.' });
      if (!fs.existsSync(scp.pdf_ruta)) return res.status(404).json({ success: false, message: 'Archivo físico no encontrado.' });

      res.download(scp.pdf_ruta, scp.pdf_nombre ?? 'cotizacion.pdf');
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

app.get(
  '/api/v1/compras/alertas/cotizacion-pendiente',
  requireRoles('procurement', 'admin', 'superintendent'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;

      const data = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          const solicitudesVencidas = await prisma.solicitudCotizacion.findMany({
            where: {
              tenant_id: tenantId,
              proyecto_id: proyectoId,
              fecha_limite: { lt: new Date() },
              proveedores: { some: { estado: 'PENDIENTE' } },
            },
            include: {
              proveedores: { where: { estado: 'PENDIENTE' } },
            },
            orderBy: { fecha_limite: 'asc' },
          });

          const requisicionIds = solicitudesVencidas.map(s => s.requisicion_id);
          const requisiciones = await prisma.requisicion.findMany({
            where: { id_requisicion: { in: requisicionIds } },
            select: { id_requisicion: true, codigo: true, observaciones: true },
          });
          const reqMap = new Map(requisiciones.map(r => [r.id_requisicion, r]));

          return solicitudesVencidas.map(sol => {
            const diasRetraso = -calcDiasHabilesRestantes(sol.fecha_limite);
            const req_data = reqMap.get(sol.requisicion_id);
            return {
              solicitud_id: sol.id_solicitud,
              requisicion_id: sol.requisicion_id,
              requisicion_codigo: req_data?.codigo ?? '',
              fecha_limite: sol.fecha_limite,
              dias_retraso: diasRetraso,
              proveedores_pendientes: sol.proveedores.map(p => p.proveedor_id),
            };
          });
        }
      );

      logInfo(req, 'compras', 'compras.alertas.cotizacion_pendiente.listadas', 'Alertas de cotización pendiente consultadas', { total: data.length });
      res.json({ success: true, data });
    } catch (error: any) {
      logError(req, 'compras', 'compras.alertas.cotizacion_pendiente.error', 'Error al listar alertas de cotización', { error_message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// TRAZABILIDAD DE MATERIALES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/compras/trazabilidad/materiales
 * Vista semáforo consolidada por insumo para el proyecto.
 * Agrega: presupuestado, requisicionado, OC emitida, surtido (stock almacén), gasto.
 */
app.get(
  '/api/v1/compras/trazabilidad/materiales',
  requireRoles('procurement', 'admin', 'superintendent', 'resident', 'residencia', 'gerencia_tecnica'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;

      const data = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          // ── Paso 1: agregar items de requisición por insumo ──────────────
          const reqItems = await prisma.requisicionItem.findMany({
            where: { tenant_id: tenantId, proyecto_id: proyectoId },
            select: {
              id_item: true,
              insumo_id: true,
              cantidad: true,
              cantidad_presupuestada: true,
              concepto_origen_id: true,
              justificacion: true,
              es_imprevisto: true,
              descripcion_libre: true,
              unidad_libre: true,
              requisicion: { select: { estado: true } },
            },
          });

          // ── Paso 2: agregar items de OC por insumo ───────────────────────
          const ocItems = await prisma.ordenCompraItem.findMany({
            where: { tenant_id: tenantId, proyecto_id: proyectoId },
            select: {
              insumo_id: true,
              cantidad: true,
              precio_unitario: true,
              importe: true,
              orden: { select: { estado: true } },
            },
          });

          // ── Paso 3: stock en almacén — consultar microservicio almacen ──
          // El inventario físico fue separado al microservicio apps/almacen (puerto 3012).
          // cantidad_surtida se reporta como 0 hasta integrar llamada B2B.
          const stockMap = new Map<string, number>();

          // ── Paso 4: asignaciones extra por item ──────────────────────────
          const asignaciones = await prisma.asignacionExtraConcepto.findMany({
            where: { tenant_id: tenantId, proyecto_id: proyectoId },
          });
          const asigMap = new Map<string, typeof asignaciones[number]>();
          for (const a of asignaciones) {
            asigMap.set(a.requisicion_item_id, a);
          }

          // ── Paso 5: consolidar por insumo_id ─────────────────────────────
          type InsumoKey = string; // insumo_id o 'LIBRE:descripcion_libre'
          interface InsumoAgg {
            insumo_id: string | null;
            descripcion_libre: string | null;
            unidad_libre: string | null;
            cantidad_presupuestada: number;
            cantidad_requisicionada: number;
            cantidad_oc_emitida: number;
            monto_oc_emitida: number;
            tiene_justificacion: boolean;
            justificaciones: string[];
            items_ids: string[];
          }
          const agg = new Map<InsumoKey, InsumoAgg>();

          for (const item of reqItems) {
            // solo contar reqs aprobadas o superiores
            if (!['APROBADA', 'COMPRADA'].includes(item.requisicion.estado)) continue;
            const key: InsumoKey = item.insumo_id ?? `LIBRE:${item.descripcion_libre ?? ''}`;
            if (!agg.has(key)) {
              agg.set(key, {
                insumo_id: item.insumo_id,
                descripcion_libre: item.descripcion_libre,
                unidad_libre: item.unidad_libre,
                cantidad_presupuestada: 0,
                cantidad_requisicionada: 0,
                cantidad_oc_emitida: 0,
                monto_oc_emitida: 0,
                tiene_justificacion: false,
                justificaciones: [],
                items_ids: [],
              });
            }
            const entry = agg.get(key)!;
            entry.cantidad_requisicionada += Number(item.cantidad);
            // presupuestada: tomar el mayor valor informado (snapshot por ítem)
            if (item.cantidad_presupuestada != null && Number(item.cantidad_presupuestada) > entry.cantidad_presupuestada) {
              entry.cantidad_presupuestada = Number(item.cantidad_presupuestada);
            }
            if (item.justificacion) {
              entry.tiene_justificacion = true;
              entry.justificaciones.push(item.justificacion);
            }
            entry.items_ids.push(item.id_item);
          }

          for (const oc of ocItems) {
            if (!['EMITIDA', 'RECIBIDA'].includes(oc.orden.estado)) continue;
            const key: InsumoKey = oc.insumo_id;
            if (!agg.has(key)) {
              agg.set(key, {
                insumo_id: oc.insumo_id,
                descripcion_libre: null,
                unidad_libre: null,
                cantidad_presupuestada: 0,
                cantidad_requisicionada: 0,
                cantidad_oc_emitida: 0,
                monto_oc_emitida: 0,
                tiene_justificacion: false,
                justificaciones: [],
                items_ids: [],
              });
            }
            const entry = agg.get(key)!;
            entry.cantidad_oc_emitida += Number(oc.cantidad);
            entry.monto_oc_emitida    += Number(oc.importe);
          }

          // ── Paso 6: calcular semáforo y armar respuesta ──────────────────
          const resultado = Array.from(agg.entries()).map(([, entry]) => {
            const pres = entry.cantidad_presupuestada;
            const req_ = entry.cantidad_requisicionada;
            const oc   = entry.cantidad_oc_emitida;
            const esExtra = pres === 0;

            let semaforo: string;
            if (esExtra)         semaforo = 'EXTRA';
            else if (oc >= pres)  semaforo = 'VERDE';
            else if (req_ > 0)    semaforo = 'AMARILLO';
            else                  semaforo = 'ROJO';

            const pctReq = pres > 0 ? Math.round((req_ / pres) * 100) : null;
            const pctOC  = pres > 0 ? Math.round((oc  / pres) * 100) : null;

            const surtido = entry.insumo_id ? (stockMap.get(entry.insumo_id) ?? 0) : 0;

            // extras asignados a concepto (para este item)
            const extrasAsignados = entry.items_ids
              .map(id => asigMap.get(id))
              .filter(Boolean)
              .map(a => ({
                concepto_id:          a!.concepto_id,
                concepto_clave:       a!.concepto_clave,
                concepto_descripcion: a!.concepto_descripcion,
                monto_extra:          Number(a!.monto_extra),
                asignacion_id:        a!.id_asignacion,
                item_id:              a!.requisicion_item_id,
              }));

            return {
              insumo_id:              entry.insumo_id,
              descripcion_libre:      entry.descripcion_libre,
              unidad_libre:           entry.unidad_libre,
              cantidad_presupuestada: pres,
              cantidad_requisicionada: req_,
              cantidad_oc_emitida:    oc,
              cantidad_surtida:       surtido,
              monto_oc_emitida:       Number(entry.monto_oc_emitida.toFixed(2)),
              pct_avance_req:         pctReq,
              pct_avance_oc:          pctOC,
              semaforo,
              es_extra:               esExtra,
              tiene_justificacion:    entry.tiene_justificacion,
              justificaciones:        entry.justificaciones,
              extras_asignados:       extrasAsignados,
              items_ids:              entry.items_ids,
            };
          });

          // Ordenar: ROJO primero, luego AMARILLO, VERDE, EXTRA
          const orden = { ROJO: 0, AMARILLO: 1, VERDE: 2, EXTRA: 3 };
          resultado.sort((a, b) => (orden[a.semaforo as keyof typeof orden] ?? 4) - (orden[b.semaforo as keyof typeof orden] ?? 4));

          return resultado;
        }
      );

      res.json({ success: true, data });
    } catch (error: any) {
      logError(req, 'compras', 'compras.trazabilidad.materiales.error', 'Error al consultar trazabilidad', { error_message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

/**
 * GET /api/v1/compras/trazabilidad/concepto/:conceptoId
 * Monto base (suma de OC) + lista de incisos extra asignados a ese concepto.
 */
app.get(
  '/api/v1/compras/trazabilidad/concepto/:conceptoId',
  requireRoles('procurement', 'admin', 'superintendent', 'resident', 'residencia', 'gerencia_tecnica'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { conceptoId } = req.params;

      const data = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          const extras = await prisma.asignacionExtraConcepto.findMany({
            where: { tenant_id: tenantId, proyecto_id: proyectoId, concepto_id: conceptoId },
            orderBy: { created_at: 'asc' },
          });

          const montoExtras = extras.reduce((sum, e) => sum + Number(e.monto_extra), 0);

          // Monto base: suma de OC emitidas cuyo concepto_origen_id = conceptoId
          const ocItemsConcepto = await prisma.requisicionItem.findMany({
            where: { tenant_id: tenantId, proyecto_id: proyectoId, concepto_origen_id: conceptoId },
            select: { id_item: true, insumo_id: true, justificacion: true },
          });
          const itemIds = ocItemsConcepto.map(i => i.id_item);
          // monto base via OC emitidas para esos insumos (aproximación por insumo_id)
          const insumoIds = ocItemsConcepto.map(i => i.insumo_id).filter(Boolean) as string[];
          const ocItems = insumoIds.length > 0
            ? await prisma.ordenCompraItem.findMany({
                where: { tenant_id: tenantId, proyecto_id: proyectoId, insumo_id: { in: insumoIds }, orden: { estado: { in: ['EMITIDA', 'RECIBIDA'] } } },
                select: { importe: true },
              })
            : [];
          const montoBase = ocItems.reduce((sum, i) => sum + Number(i.importe), 0);

          return {
            concepto_id: conceptoId,
            monto_base: Number(montoBase.toFixed(2)),
            monto_extras: Number(montoExtras.toFixed(2)),
            monto_total: Number((montoBase + montoExtras).toFixed(2)),
            incisos_extra: extras.map(e => ({
              id_asignacion:        e.id_asignacion,
              requisicion_item_id:  e.requisicion_item_id,
              monto_extra:          Number(e.monto_extra),
              asignado_por:         e.asignado_por,
              created_at:           e.created_at,
            })),
          };
        }
      );

      res.json({ success: true, data });
    } catch (error: any) {
      logError(req, 'compras', 'compras.trazabilidad.concepto.error', 'Error al consultar trazabilidad de concepto', { error_message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

/**
 * POST /api/v1/compras/trazabilidad/asignaciones
 * Asigna un ítem extra a un concepto del catálogo (inciso).
 */
app.post(
  '/api/v1/compras/trazabilidad/asignaciones',
  requireRoles('procurement', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { requisicion_item_id, concepto_id, concepto_clave, concepto_descripcion, monto_extra } = req.body;

      if (!requisicion_item_id || !concepto_id || !concepto_clave || monto_extra == null) {
        return res.status(400).json({ success: false, message: 'Faltan campos requeridos: requisicion_item_id, concepto_id, concepto_clave, monto_extra.' });
      }

      const data = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          // Verificar que el item pertenece al tenant/proyecto
          const item = await prisma.requisicionItem.findFirst({
            where: { id_item: requisicion_item_id, tenant_id: tenantId, proyecto_id: proyectoId },
          });
          if (!item) {
            return null;
          }
          // Upsert: un ítem → un concepto (reemplaza si ya existe)
          return prisma.asignacionExtraConcepto.upsert({
            where: { tenant_id_requisicion_item_id: { tenant_id: tenantId, requisicion_item_id } },
            update: {
              concepto_id,
              concepto_clave,
              concepto_descripcion: concepto_descripcion || concepto_clave,
              monto_extra:          Number(monto_extra),
              asignado_por:         userId,
            },
            create: {
              tenant_id:            tenantId,
              proyecto_id:          proyectoId,
              requisicion_item_id,
              concepto_id,
              concepto_clave,
              concepto_descripcion: concepto_descripcion || concepto_clave,
              monto_extra:          Number(monto_extra),
              asignado_por:         userId,
            },
          });
        }
      );

      if (!data) {
        return res.status(404).json({ success: false, message: 'Ítem de requisición no encontrado.' });
      }

      logInfo(req, 'compras', 'compras.trazabilidad.asignacion_creada', `Ítem ${requisicion_item_id} asignado a concepto ${concepto_clave}`);
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      logError(req, 'compras', 'compras.trazabilidad.asignacion.error', 'Error al asignar inciso a concepto', { error_message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

/**
 * DELETE /api/v1/compras/trazabilidad/asignaciones/:id
 * Elimina un inciso (solo si la OC del ítem no está EMITIDA).
 */
app.delete(
  '/api/v1/compras/trazabilidad/asignaciones/:id',
  requireRoles('procurement', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { id } = req.params;

      const data = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          const asig = await prisma.asignacionExtraConcepto.findFirst({
            where: { id_asignacion: id, tenant_id: tenantId },
          });
          if (!asig) return { error: 'not_found' };

          // Verificar que no haya OC emitida para el insumo de ese ítem
          const item = await prisma.requisicionItem.findUnique({
            where: { id_item: asig.requisicion_item_id },
            select: { insumo_id: true },
          });
          if (item?.insumo_id) {
            const ocEmitida = await prisma.ordenCompraItem.findFirst({
              where: {
                tenant_id: tenantId,
                proyecto_id: proyectoId,
                insumo_id: item.insumo_id,
                orden: { estado: { in: ['EMITIDA', 'RECIBIDA'] } },
              },
            });
            if (ocEmitida) return { error: 'oc_emitida' };
          }

          await prisma.asignacionExtraConcepto.delete({ where: { id_asignacion: id } });
          return { deleted: id };
        }
      );

      if (!data || data.error === 'not_found') {
        return res.status(404).json({ success: false, message: 'Asignación no encontrada.' });
      }
      if (data.error === 'oc_emitida') {
        return res.status(409).json({ success: false, message: 'No se puede desasignar: la OC ya fue emitida.' });
      }

      logInfo(req, 'compras', 'compras.trazabilidad.asignacion_eliminada', `Asignación ${id} eliminada por ${userId}`);
      res.json({ success: true, data });
    } catch (error: any) {
      logError(req, 'compras', 'compras.trazabilidad.asignacion_delete.error', 'Error al eliminar asignación', { error_message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

app.get('/api/v1/compras/ordenes-compra', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => prisma.ordenCompra.findMany({
        include: { items: true, proveedor: true },
        orderBy: { fecha_emision: 'desc' }
      })
    );

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- Recepción de materiales contra OC ---

app.get('/api/v1/compras/ordenes-compra/:id',
  requireRoles('procurement', 'admin', 'superintendent', 'gerencia_tecnica', 'finance'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { id } = req.params;

      const data = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          const orden = await prisma.ordenCompra.findUnique({
            where: { id_orden: id },
            include: { items: true, proveedor: true },
          });
          if (!orden) return null;

          const recepciones = await prisma.recepcionOCItem.findMany({
            where: { orden_item_id: { in: orden.items.map((i: any) => i.id_item) } },
          });

          const acumulados = new Map<string, number>();
          for (const r of recepciones) {
            const prev = acumulados.get(r.orden_item_id) ?? 0;
            acumulados.set(r.orden_item_id, prev + Number(r.cantidad_recibida));
          }

          // Resolver concepto_id desde la requisición origen
          let concepto_id: string | null = null;
          if (orden.requisicion_id) {
            const req = await (prisma as any).requisicion.findUnique({
              where: { id_requisicion: orden.requisicion_id },
              select: { concepto_id: true },
            });
            concepto_id = req?.concepto_id ?? null;
          }

          return {
            ...orden,
            concepto_id,
            subtotal: Number(orden.subtotal),
            iva: Number(orden.iva),
            total: Number(orden.total),
            tipo_cambio: Number(orden.tipo_cambio),
            items: orden.items.map((item: any) => {
              const recibido = acumulados.get(item.id_item) ?? 0;
              const cantidad = Number(item.cantidad);
              return {
                ...item,
                cantidad: Number(item.cantidad),
                precio_unitario: Number(item.precio_unitario),
                importe: Number(item.importe),
                cantidad_acumulada_recibida: recibido,
                porcentaje_recibido: cantidad > 0 ? Math.round((recibido / cantidad) * 1000) / 10 : 0,
              };
            }),
          };
        }
      );

      if (!data) return void res.status(404).json({ success: false, message: 'OC no encontrada.' });
      res.json({ success: true, data });
    } catch (error: any) {
      logError(req, 'compras', 'compras.orden.get.error', 'Error al obtener OC', { error_message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

app.get('/api/v1/compras/ordenes-compra/:id/recepciones',
  requireRoles('procurement', 'admin', 'superintendent', 'gerencia_tecnica', 'finance'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { id } = req.params;

      const data = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => prisma.recepcionOC.findMany({
          where: { orden_id: id },
          include: { items: true },
          orderBy: { fecha_recepcion: 'desc' },
        })
      );

      res.json({ success: true, data });
    } catch (error: any) {
      logError(req, 'compras', 'compras.recepciones.list.error', 'Error al listar recepciones', { error_message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

app.post('/api/v1/compras/ordenes-compra/:id/recepciones',
  requireRoles('procurement', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { id } = req.params;
      const { fecha_recepcion, notas, items: itemsBody } = req.body;

      if (!Array.isArray(itemsBody) || itemsBody.length === 0) {
        return void res.status(400).json({ success: false, message: 'Se requiere al menos un ítem en la recepción.' });
      }

      const result = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          const orden = await prisma.ordenCompra.findUnique({
            where: { id_orden: id },
            include: { items: true },
          });

          if (!orden) return { error: 404, message: 'OC no encontrada.' };

          const estadosPermitidos = [OC_STATUS.EMITIDA, OC_STATUS.PARCIALMENTE_RECIBIDA];
          if (!estadosPermitidos.includes(orden.estado as any)) {
            return { error: 400, message: 'Solo se pueden registrar recepciones en OC con estado EMITIDA o PARCIALMENTE_RECIBIDA.' };
          }

          // Calcular acumulados previos para validar cantidades
          const prevRecepciones = await prisma.recepcionOCItem.findMany({
            where: { orden_item_id: { in: orden.items.map((i: any) => i.id_item) } },
          });
          const acumuladosPrev = new Map<string, number>();
          for (const r of prevRecepciones) {
            const prev = acumuladosPrev.get(r.orden_item_id) ?? 0;
            acumuladosPrev.set(r.orden_item_id, prev + Number(r.cantidad_recibida));
          }

          // Validar cada línea
          for (const lineaBody of itemsBody) {
            const ocItem = orden.items.find((i: any) => i.id_item === lineaBody.orden_item_id);
            if (!ocItem) {
              return { error: 400, message: `Ítem ${lineaBody.orden_item_id} no pertenece a esta OC.` };
            }
            const cantidadPedida = Number(ocItem.cantidad);
            const yaRecibido = acumuladosPrev.get(ocItem.id_item) ?? 0;
            const pendiente = cantidadPedida - yaRecibido;
            const cantidadRecibida = Number(lineaBody.cantidad_recibida ?? 0);
            if (cantidadRecibida <= 0) {
              return { error: 400, message: `La cantidad_recibida del ítem ${lineaBody.orden_item_id} debe ser mayor a 0.` };
            }
            if (cantidadRecibida > pendiente + 0.00001) {
              return { error: 400, message: `La cantidad recibida no puede superar la cantidad pedida en la línea ${lineaBody.orden_item_id}.` };
            }
          }

          // Crear recepción
          const recepcion = await prisma.recepcionOC.create({
            data: {
              tenant_id: tenantId,
              proyecto_id: proyectoId,
              orden_id: id,
              fecha_recepcion: fecha_recepcion ? new Date(fecha_recepcion) : new Date(),
              recibido_por: userId,
              notas: notas ?? null,
              items: {
                create: itemsBody.map((l: any) => ({
                  tenant_id: tenantId,
                  proyecto_id: proyectoId,
                  orden_item_id: l.orden_item_id,
                  cantidad_recibida: l.cantidad_recibida,
                  nota_discrepancia: l.nota_discrepancia ?? null,
                })),
              },
            },
            include: { items: true },
          });

          // Recalcular estado OC
          const nuevoEstado = await calcularEstadoOC(id, prisma);
          await prisma.ordenCompra.update({
            where: { id_orden: id },
            data: { estado: nuevoEstado },
          });

          return { recepcion, nuevoEstado, orden };
        }
      );

      if ('error' in result) {
        return void res.status(result.error as number).json({ success: false, message: result.message });
      }

      logInfo(req, 'compras', 'compras.recepcion.creada', 'Recepción de OC registrada', {
        orden_id: id,
        nuevo_estado: result.nuevoEstado,
      });

      // Publicar evento si la OC quedó completamente recibida (best-effort)
      if (result.nuevoEstado === OC_STATUS.RECIBIDA) {
        try {
          await eventBus.publish({
            event_type: 'compras.oc_recibida_total',
            timestamp: new Date().toISOString(),
            context: buildEventContext(req),
            payload: {
              id_orden: id,
              codigo: result.orden.codigo,
              proveedor_id: result.orden.proveedor_id,
              total: Number(result.orden.total),
              proyecto_id: result.orden.proyecto_id,
            },
          });
        } catch (_) {
          /* EventBus offline — degradación elegante. La OC ya fue marcada RECIBIDA. */
        }
      }

      res.status(201).json({
        success: true,
        data: {
          ...result.recepcion,
          nuevo_estado_oc: result.nuevoEstado,
        },
      });
    } catch (error: any) {
      logError(req, 'compras', 'compras.recepcion.create.error', 'Error al registrar recepción', { error_message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

app.get('/api/v1/compras/proveedores', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => prisma.proveedor.findMany({ orderBy: { razon_social: 'asc' } })
    );

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/v1/compras/proveedores', requireRoles('procurement', 'admin'), async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const {
      rfc_tax_id, razon_social, email_contacto, telefono, estatus,
      ciudad, tipo_ubicacion, entrega_en_sitio,
      estatus_credito, limite_credito,
      tipo_proveedor, calificacion_desempeno,
    } = req.body;

    if (!rfc_tax_id || !razon_social) {
      return void res.status(400).json({ success: false, message: 'rfc_tax_id y razon_social son obligatorios.' });
    }
    if (calificacion_desempeno !== undefined && (Number(calificacion_desempeno) < 0 || Number(calificacion_desempeno) > 5)) {
      return void res.status(400).json({ success: false, message: 'calificacion_desempeno debe estar entre 0.00 y 5.00.' });
    }

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => prisma.proveedor.create({
        data: {
          tenant_id: tenantId,
          rfc_tax_id: rfc_tax_id.trim().toUpperCase(),
          razon_social: razon_social.trim(),
          email_contacto: email_contacto ?? null,
          telefono: telefono ?? null,
          estatus: estatus ?? 'ACTIVO',
          ciudad: ciudad ?? null,
          tipo_ubicacion: tipo_ubicacion ?? 'LOCAL',
          entrega_en_sitio: entrega_en_sitio ?? false,
          estatus_credito: estatus_credito ?? 'ACTIVO',
          limite_credito: limite_credito != null ? limite_credito : null,
          tipo_proveedor: tipo_proveedor ?? 'NACIONAL',
          calificacion_desempeno: calificacion_desempeno != null ? calificacion_desempeno : null,
        },
      })
    );

    logInfo(req, 'compras', 'compras.proveedor.creado', 'Proveedor creado', { proveedor_id: data.id_proveedor });
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    if (error.code === 'P2002') return void res.status(409).json({ success: false, message: 'Ya existe un proveedor con ese RFC para este tenant.' });
    logError(req, 'compras', 'compras.proveedor.crear.error', 'Error al crear proveedor', { error_message: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/v1/compras/proveedores/:id', requireRoles('procurement', 'admin'), async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const proveedorId = req.params.id;
    const {
      razon_social, email_contacto, telefono, estatus,
      ciudad, tipo_ubicacion, entrega_en_sitio,
      estatus_credito, limite_credito,
      tipo_proveedor, calificacion_desempeno,
    } = req.body;

    if (calificacion_desempeno !== undefined && calificacion_desempeno !== null &&
        (Number(calificacion_desempeno) < 0 || Number(calificacion_desempeno) > 5)) {
      return void res.status(400).json({ success: false, message: 'calificacion_desempeno debe estar entre 0.00 y 5.00.' });
    }

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => {
        const exists = await prisma.proveedor.findUnique({ where: { id_proveedor: proveedorId } });
        if (!exists) throw Object.assign(new Error('Proveedor no encontrado.'), { status: 404 });

        return prisma.proveedor.update({
          where: { id_proveedor: proveedorId },
          data: {
            ...(razon_social !== undefined && { razon_social: razon_social.trim() }),
            ...(email_contacto !== undefined && { email_contacto }),
            ...(telefono !== undefined && { telefono }),
            ...(estatus !== undefined && { estatus }),
            ...(ciudad !== undefined && { ciudad }),
            ...(tipo_ubicacion !== undefined && { tipo_ubicacion }),
            ...(entrega_en_sitio !== undefined && { entrega_en_sitio }),
            ...(estatus_credito !== undefined && { estatus_credito }),
            ...(limite_credito !== undefined && { limite_credito }),
            ...(tipo_proveedor !== undefined && { tipo_proveedor }),
            ...(calificacion_desempeno !== undefined && { calificacion_desempeno }),
          },
        });
      }
    );

    logInfo(req, 'compras', 'compras.proveedor.actualizado', 'Proveedor actualizado', { proveedor_id: proveedorId });
    res.json({ success: true, data });
  } catch (error: any) {
    const status = error.status ?? 500;
    logError(req, 'compras', 'compras.proveedor.actualizar.error', 'Error al actualizar proveedor', { error_message: error.message });
    res.status(status).json({ success: false, message: error.message });
  }
});

// ── Documentos de Proveedor ───────────────────────────────────────────────────

const docsUploadTmp = path.join(DOCS_PROVEEDORES_UPLOAD_DIR, '_tmp');

const docsMulter = multer({
  dest: docsUploadTmp,
  limits: { fileSize: DOCS_PROVEEDORES_MAX_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.xml', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error(`Tipo de archivo no permitido: ${ext}. Permitidos: ${allowed.join(', ')}`));
  },
});


app.post(
  '/api/v1/compras/proveedores/:id/documentos',
  requireRoles('procurement', 'admin'),
  docsMulter.single('archivo'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const proveedorId = req.params.id;
      const { tipo_doc, nombre_doc } = req.body as { tipo_doc: string; nombre_doc: string };

      if (!req.file) return void res.status(400).json({ success: false, message: 'Se requiere un archivo.' });
      if (!tipo_doc) return void res.status(400).json({ success: false, message: 'tipo_doc es obligatorio.' });
      if (!nombre_doc) return void res.status(400).json({ success: false, message: 'nombre_doc es obligatorio.' });

      const tiposValidos = ['CSD', 'OPINION_SAT', 'ISO', 'OTRO'];
      if (!tiposValidos.includes(tipo_doc)) {
        return void res.status(400).json({ success: false, message: `tipo_doc inválido. Valores: ${tiposValidos.join(', ')}` });
      }

      const result = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          const proveedor = await prisma.proveedor.findUnique({ where: { id_proveedor: proveedorId } });
          if (!proveedor) throw Object.assign(new Error('Proveedor no encontrado.'), { status: 404 });

          const ext = path.extname(req.file!.originalname).toLowerCase();
          const { v4: uuidv4 } = await import('uuid');
          const docId = uuidv4();
          const rutaFinal = path.join(DOCS_PROVEEDORES_UPLOAD_DIR, tenantId, proveedorId, `${docId}${ext}`);

          fs.mkdirSync(path.dirname(rutaFinal), { recursive: true });
          fs.renameSync(req.file!.path, rutaFinal);

          const doc = await prisma.documentoProveedor.create({
            data: {
              id_doc: docId,
              tenant_id: tenantId,
              proveedor_id: proveedorId,
              tipo_doc,
              nombre_doc,
              ruta_archivo: rutaFinal,
              mime_type: req.file!.mimetype,
              tamano_bytes: req.file!.size,
              subido_por: userId,
            },
          });

          return { id_doc: doc.id_doc, tipo_doc: doc.tipo_doc, nombre_doc: doc.nombre_doc,
                   mime_type: doc.mime_type, tamano_bytes: doc.tamano_bytes,
                   subido_por: doc.subido_por, created_at: doc.created_at };
        }
      );

      logInfo(req, 'compras', 'compras.proveedor.documento.subido', 'Documento de proveedor subido', { proveedor_id: proveedorId, tipo_doc });
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      if (req.file?.path) try { fs.unlinkSync(req.file.path); } catch (_) { /* ignorar */ }
      const status = error.status ?? 500;
      logError(req, 'compras', 'compras.proveedor.documento.subir.error', 'Error al subir documento', { error_message: error.message });
      res.status(status).json({ success: false, message: error.message });
    }
  }
);

app.get(
  '/api/v1/compras/proveedores/:id/documentos',
  requireRoles('procurement', 'admin', 'finance', 'gerencia_tecnica', 'superintendent'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const proveedorId = req.params.id;

      const data = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          const proveedor = await prisma.proveedor.findUnique({ where: { id_proveedor: proveedorId } });
          if (!proveedor) throw Object.assign(new Error('Proveedor no encontrado.'), { status: 404 });

          return prisma.documentoProveedor.findMany({
            where: { tenant_id: tenantId, proveedor_id: proveedorId },
            select: { id_doc: true, tipo_doc: true, nombre_doc: true, mime_type: true,
                      tamano_bytes: true, subido_por: true, created_at: true },
            orderBy: { created_at: 'desc' },
          });
        }
      );

      res.json({ success: true, data });
    } catch (error: any) {
      const status = error.status ?? 500;
      logError(req, 'compras', 'compras.proveedor.documentos.listar.error', 'Error al listar documentos', { error_message: error.message });
      res.status(status).json({ success: false, message: error.message });
    }
  }
);

app.get(
  '/api/v1/compras/proveedores/:id/documentos/:did/descargar',
  requireRoles('procurement', 'admin', 'finance', 'gerencia_tecnica', 'superintendent'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { id: proveedorId, did } = req.params;

      const doc = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => prisma.documentoProveedor.findFirst({
          where: { id_doc: did, tenant_id: tenantId, proveedor_id: proveedorId },
        })
      );

      if (!doc) return void res.status(404).json({ success: false, message: 'Documento no encontrado.' });
      if (!fs.existsSync(doc.ruta_archivo)) {
        return void res.status(404).json({ success: false, message: 'Archivo físico no encontrado.' });
      }

      res.download(doc.ruta_archivo, doc.nombre_doc);
    } catch (error: any) {
      logError(req, 'compras', 'compras.proveedor.documento.descargar.error', 'Error al descargar documento', { error_message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

app.delete(
  '/api/v1/compras/proveedores/:id/documentos/:did',
  requireRoles('procurement', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { id: proveedorId, did } = req.params;

      await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          const doc = await prisma.documentoProveedor.findFirst({
            where: { id_doc: did, tenant_id: tenantId, proveedor_id: proveedorId },
          });
          if (!doc) throw Object.assign(new Error('Documento no encontrado.'), { status: 404 });

          try { fs.unlinkSync(doc.ruta_archivo); } catch (_) {
            logWarn(req, 'compras', 'compras.proveedor.documento.archivo_fisico_no_encontrado',
              'Archivo físico no existe al eliminar documento', { doc_id: did, ruta: doc.ruta_archivo });
          }

          await prisma.documentoProveedor.delete({ where: { id_doc: did } });
        }
      );

      logInfo(req, 'compras', 'compras.proveedor.documento.eliminado', 'Documento de proveedor eliminado', { proveedor_id: proveedorId, doc_id: did });
      res.json({ success: true, message: 'Documento eliminado.' });
    } catch (error: any) {
      const status = error.status ?? 500;
      logError(req, 'compras', 'compras.proveedor.documento.eliminar.error', 'Error al eliminar documento', { error_message: error.message });
      res.status(status).json({ success: false, message: error.message });
    }
  }
);

// ── Calificaciones de Proveedor ───────────────────────────────────────────────

app.post(
  '/api/v1/compras/proveedores/:id/calificaciones',
  requireRoles('procurement', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId, name: userName } = req.securityContext;
      const proveedorId = req.params.id;
      const { puntuacion, comentario, proyecto_nombre: proyectoNombreOverride } = req.body;

      if (puntuacion === undefined || puntuacion === null) {
        return res.status(400).json({ success: false, message: 'El campo puntuacion es requerido.' });
      }
      const score = parseFloat(puntuacion);
      if (isNaN(score) || score < 0 || score > 5) {
        return res.status(400).json({ success: false, message: 'La puntuacion debe ser un número entre 0.00 y 5.00.' });
      }

      const proyectoNombre: string = proyectoNombreOverride ?? proyectoId.substring(0, 8).toUpperCase();

      const result = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          const proveedor = await prisma.proveedor.findFirst({
            where: { id_proveedor: proveedorId, tenant_id: tenantId },
          });
          if (!proveedor) throw Object.assign(new Error('Proveedor no encontrado.'), { status: 404 });

          const existing = await prisma.calificacionProveedor.findUnique({
            where: { tenant_id_proveedor_id_proyecto_id: { tenant_id: tenantId, proveedor_id: proveedorId, proyecto_id: proyectoId } },
          });

          const calificacion = await prisma.calificacionProveedor.upsert({
            where: { tenant_id_proveedor_id_proyecto_id: { tenant_id: tenantId, proveedor_id: proveedorId, proyecto_id: proyectoId } },
            create: {
              tenant_id: tenantId,
              proveedor_id: proveedorId,
              proyecto_id: proyectoId,
              proyecto_nombre: proyectoNombre,
              puntuacion: score,
              comentario: comentario ?? null,
              calificado_por: userId,
              calificado_por_nombre: userName,
            },
            update: {
              puntuacion: score,
              comentario: comentario ?? null,
              calificado_por: userId,
              calificado_por_nombre: userName,
            },
          });

          // Recalcular promedio
          const agg = await prisma.calificacionProveedor.aggregate({
            where: { tenant_id: tenantId, proveedor_id: proveedorId },
            _avg: { puntuacion: true },
            _count: { id_calificacion: true },
          });
          const promedio = agg._avg.puntuacion ? Math.round(Number(agg._avg.puntuacion.toNumber()) * 100) / 100 : null;

          await prisma.proveedor.update({
            where: { id_proveedor: proveedorId },
            data: { calificacion_desempeno: promedio },
          });

          return { calificacion, promedio_actualizado: promedio, total_calificaciones: agg._count.id_calificacion, accion: existing ? 'updated' : 'created' };
        }
      );

      logInfo(req, 'compras', 'compras.proveedor.calificacion.registrada', 'Calificación de proveedor registrada', { proveedor_id: proveedorId, puntuacion: score, accion: result.accion });
      res.status(result.accion === 'created' ? 201 : 200).json({ success: true, data: result });
    } catch (error: any) {
      const status = error.status ?? 500;
      logError(req, 'compras', 'compras.proveedor.calificacion.error', 'Error al registrar calificación', { error_message: error.message });
      res.status(status).json({ success: false, message: error.message });
    }
  }
);

app.get(
  '/api/v1/compras/proveedores/:id/calificaciones',
  requireRoles('procurement', 'admin', 'finance', 'gerencia_tecnica', 'superintendent'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const proveedorId = req.params.id;

      const result = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          const proveedor = await prisma.proveedor.findFirst({
            where: { id_proveedor: proveedorId, tenant_id: tenantId },
            select: { calificacion_desempeno: true },
          });
          if (!proveedor) throw Object.assign(new Error('Proveedor no encontrado.'), { status: 404 });

          const calificaciones = await prisma.calificacionProveedor.findMany({
            where: { tenant_id: tenantId, proveedor_id: proveedorId },
            orderBy: { created_at: 'desc' },
          });

          const count = await prisma.calificacionProveedor.count({
            where: { tenant_id: tenantId, proveedor_id: proveedorId },
          });

          return {
            calificaciones: calificaciones.map(c => ({
              ...c,
              puntuacion: Number(c.puntuacion.toNumber()),
            })),
            promedio_global: proveedor.calificacion_desempeno ? Number(proveedor.calificacion_desempeno.toNumber()) : null,
            total: count,
          };
        }
      );

      res.json({ success: true, data: result });
    } catch (error: any) {
      const status = error.status ?? 500;
      logError(req, 'compras', 'compras.proveedor.calificaciones.error', 'Error al obtener calificaciones', { error_message: error.message });
      res.status(status).json({ success: false, message: error.message });
    }
  }
);

app.delete(
  '/api/v1/compras/proveedores/:id/calificaciones/:cid',
  requireRoles('admin'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { id: proveedorId, cid } = req.params;

      await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          const cal = await prisma.calificacionProveedor.findFirst({
            where: { id_calificacion: cid, tenant_id: tenantId, proveedor_id: proveedorId },
          });
          if (!cal) throw Object.assign(new Error('Calificación no encontrada.'), { status: 404 });

          await prisma.calificacionProveedor.delete({ where: { id_calificacion: cid } });

          const agg = await prisma.calificacionProveedor.aggregate({
            where: { tenant_id: tenantId, proveedor_id: proveedorId },
            _avg: { puntuacion: true },
          });
          const promedio = agg._avg.puntuacion ? Math.round(Number(agg._avg.puntuacion.toNumber()) * 100) / 100 : null;

          await prisma.proveedor.update({
            where: { id_proveedor: proveedorId },
            data: { calificacion_desempeno: promedio },
          });
        }
      );

      logInfo(req, 'compras', 'compras.proveedor.calificacion.eliminada', 'Calificación eliminada y promedio recalculado', { proveedor_id: proveedorId, cal_id: cid });
      res.json({ success: true, message: 'Calificación eliminada.' });
    } catch (error: any) {
      const status = error.status ?? 500;
      logError(req, 'compras', 'compras.proveedor.calificacion.eliminar.error', 'Error al eliminar calificación', { error_message: error.message });
      res.status(status).json({ success: false, message: error.message });
    }
  }
);

app.get('/api/v1/compras/comparativas', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => prisma.cuadroComparativo.findMany({
        include: { detalles: { include: { proveedor: true } } },
        orderBy: { fecha_creacion: 'desc' }
      })
    );

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── Bandejas de trabajo (deben ir ANTES de /:id para que Express no capture el path estático) ──

// GET pendientes-evaluacion — bandeja del Residente
app.get('/api/v1/compras/comparativas/pendientes-evaluacion',
  requireRoles('resident', 'residencia', 'control_obra', 'superintendent'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const data = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => prisma.cuadroComparativo.findMany({
          where: { tenant_id: tenantId, proyecto_id: proyectoId, estado: 'EN_EVALUACION_TECNICA' },
          include: { detalles: { include: { proveedor: true } } },
          orderBy: { fecha_creacion: 'desc' },
        })
      );
      logInfo(req, 'compras', 'compras.comparativas.pendientes_evaluacion.listadas', 'Bandeja evaluación técnica consultada', { total: data.length });
      res.json({ success: true, data });
    } catch (error: any) {
      logError(req, 'compras', 'compras.comparativas.pendientes_evaluacion.error', 'Error al listar pendientes de evaluación', { error_message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// GET pendientes-gt — bandeja del Gerente Técnico
app.get('/api/v1/compras/comparativas/pendientes-gt',
  requireRoles('gerencia_tecnica', 'superintendent'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const data = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => prisma.cuadroComparativo.findMany({
          where: { tenant_id: tenantId, proyecto_id: proyectoId, estado: 'EN_APROBACION_GT' },
          include: { detalles: { include: { proveedor: true } } },
          orderBy: { fecha_creacion: 'desc' },
        })
      );
      logInfo(req, 'compras', 'compras.comparativas.pendientes_gt.listadas', 'Bandeja aprobación GT consultada', { total: data.length });
      res.json({ success: true, data });
    } catch (error: any) {
      logError(req, 'compras', 'compras.comparativas.pendientes_gt.error', 'Error al listar pendientes de GT', { error_message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

app.get('/api/v1/compras/comparativas/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId } = req.securityContext;

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => {
        const [cuadro, lineas, aclaraciones, anotacionesSpec] = await Promise.all([
          prisma.cuadroComparativo.findUnique({
            where: { id_cuadro: id },
            include: { detalles: { include: { proveedor: true } } },
          }),
          prisma.comparativaLinea.findMany({
            where: { cuadro_id: id, tenant_id: tenantId },
          }),
          prisma.aclaracionComparativa.findMany({
            where: { cuadro_id: id, tenant_id: tenantId },
            select: { insumo_id: true, proveedor_id: true, resuelta: true },
          }),
          prisma.anotacionEspecificacion.findMany({
            where: { cuadro_id: id, tenant_id: tenantId },
            orderBy: { created_at: 'asc' },
          }),
        ]);
        if (!cuadro) return null;

        // Aclaraciones count map
        const aclaracionesCountMap = new Map<string, number>();
        for (const acl of aclaraciones) {
          if (!acl.resuelta) {
            const key = `${acl.insumo_id}:${acl.proveedor_id}`;
            aclaracionesCountMap.set(key, (aclaracionesCountMap.get(key) ?? 0) + 1);
          }
        }

        // Para lineas con detalle_req_id, buscar especificaciones y specs inline del Residente
        const detalleReqIds = lineas.filter(l => l.detalle_req_id).map(l => l.detalle_req_id!);
        const [especificaciones, reqItems] = await Promise.all([
          detalleReqIds.length > 0
            ? prisma.especificacionDetalleReq.findMany({
                where: { tenant_id: tenantId, detalle_id: { in: detalleReqIds } },
                orderBy: { orden: 'asc' },
              })
            : Promise.resolve([]),
          detalleReqIds.length > 0
            ? prisma.requisicionItem.findMany({
                where: { id_item: { in: detalleReqIds }, tenant_id: tenantId },
                select: { id_item: true, especificacion_marca_modelo: true, especificacion_detalle: true },
              })
            : Promise.resolve([]),
        ]);

        type EspecificacionItem = (typeof especificaciones)[number];
        const specsMap = new Map<string, EspecificacionItem[]>();
        for (const s of especificaciones) {
          if (!specsMap.has(s.detalle_id)) specsMap.set(s.detalle_id, []);
          specsMap.get(s.detalle_id)!.push(s);
        }
        const reqItemsMap = new Map(reqItems.map(i => [i.id_item, i]));

        const lineasDetalle = lineas.map(l => ({
          insumo_id: l.insumo_id,
          marca_modelo_ref: l.marca_modelo_ref,
          especificaciones_requeridas: l.especificaciones_requeridas,
          detalle_req_id: l.detalle_req_id,
          especificaciones: l.detalle_req_id ? (specsMap.get(l.detalle_req_id) ?? []) : [],
          // Specs inline capturadas por el Residente en la requisición
          especificacion_marca_modelo: l.detalle_req_id ? (reqItemsMap.get(l.detalle_req_id)?.especificacion_marca_modelo ?? null) : null,
          especificacion_detalle: l.detalle_req_id ? (reqItemsMap.get(l.detalle_req_id)?.especificacion_detalle ?? null) : null,
        }));

        const detallesConCount = cuadro.detalles.map(d => ({
          ...d,
          precio_ofertado: Number(d.precio_ofertado),
          aclaraciones_count: aclaracionesCountMap.get(`${d.insumo_id}:${d.proveedor_id}`) ?? 0,
        }));

        // Órdenes de Compra generadas desde esta comparativa (vinculadas por requisicion_id)
        const ordenesRaw = (cuadro as any).requisicion_id
          ? await prisma.ordenCompra.findMany({
              where: { tenant_id: tenantId, requisicion_id: (cuadro as any).requisicion_id },
              include: { items: true, proveedor: true },
              orderBy: { fecha_emision: 'desc' },
            })
          : [];

        // Acumulados de recepciones para todas las OC de esta comparativa
        const todosItemIds = ordenesRaw.flatMap((o: any) => o.items.map((i: any) => i.id_item));
        const todasRecepciones = todosItemIds.length > 0
          ? await prisma.recepcionOCItem.findMany({ where: { orden_item_id: { in: todosItemIds } } })
          : [];
        const acumuladosMap = new Map<string, number>();
        for (const r of todasRecepciones) {
          const prev = acumuladosMap.get(r.orden_item_id) ?? 0;
          acumuladosMap.set(r.orden_item_id, prev + Number(r.cantidad_recibida));
        }

        const ordenes_compra = ordenesRaw.map((o: any) => ({
          id_orden: o.id_orden,
          codigo: o.codigo,
          estado: o.estado,
          proveedor_nombre: o.proveedor?.razon_social ?? '',
          proveedor_id: o.proveedor_id,
          total: Number(o.total),
          subtotal: Number(o.subtotal),
          iva: Number(o.iva),
          fecha_emision: o.fecha_emision,
          items: o.items.map((item: any) => {
            const recibido = acumuladosMap.get(item.id_item) ?? 0;
            const cantidad = Number(item.cantidad);
            return {
              id_item: item.id_item,
              insumo_id: item.insumo_id,
              cantidad: Number(item.cantidad),
              precio_unitario: Number(item.precio_unitario),
              importe: Number(item.importe),
              cantidad_acumulada_recibida: recibido,
              porcentaje_recibido: cantidad > 0 ? Math.round((recibido / cantidad) * 1000) / 10 : 0,
            };
          }),
        }));

        return {
          ...cuadro,
          detalles: detallesConCount,
          lineas_detalle: lineasDetalle,
          anotaciones_spec: anotacionesSpec,
          ordenes_compra,
        };
      },
    );

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /comparativas/:id/lineas/:insumoId — guarda detalles técnicos por partida
app.put('/api/v1/compras/comparativas/:id/lineas/:insumoId',
  requireRoles('procurement', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { id, insumoId } = req.params;
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { marca_modelo_ref, especificaciones_requeridas } = req.body as {
        marca_modelo_ref?: string; especificaciones_requeridas?: string;
      };

      const data = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          const cuadro = await prisma.cuadroComparativo.findUnique({
            where: { id_cuadro: id },
            select: { estado: true, tenant_id: true },
          });
          if (!cuadro || cuadro.tenant_id !== tenantId) {
            return { notFound: true };
          }
          if (cuadro.estado !== 'BORRADOR') {
            return { locked: true };
          }

          const linea = await prisma.comparativaLinea.upsert({
            where:  { cuadro_id_insumo_id: { cuadro_id: id, insumo_id: insumoId } },
            create: {
              tenant_id:   tenantId,
              proyecto_id: proyectoId,
              cuadro_id:   id,
              insumo_id:   insumoId,
              marca_modelo_ref:           marca_modelo_ref?.trim() ?? null,
              especificaciones_requeridas: especificaciones_requeridas?.trim() ?? null,
            },
            update: {
              marca_modelo_ref:           marca_modelo_ref?.trim() ?? null,
              especificaciones_requeridas: especificaciones_requeridas?.trim() ?? null,
            },
          });
          return { linea };
        },
      );

      if ((data as any).notFound) return res.status(404).json({ success: false, message: 'Cuadro no encontrado.' });
      if ((data as any).locked)    return res.status(403).json({ success: false, message: 'El cuadro no está en estado BORRADOR.' });
      return res.json({ success: true, data: (data as any).linea });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
);

app.post('/api/v1/compras/comparativas/:id/convertir-oc', requireRoles('admin', 'superintendent', 'procurement'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { presupuesto_id } = req.body;
    const token = req.headers.authorization;

    if (!presupuesto_id) {
      return res.status(400).json({
        success: false,
        message: 'Es obligatorio proporcionar un presupuesto_id para validar la suficiencia financiera.'
      });
    }

    // ── 1.1–1.3: Cargar comparativa, lineas y cantidades reales de requisición ──
    type DetalleGanador = { proveedor_id: string; insumo_id: string; precio_ofertado: { toNumber(): number } };
    type GrupoProveedor = { detalles: DetalleGanador[]; subtotal: number };

    const loteData = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => {
        const comparativa = await prisma.cuadroComparativo.findUnique({
          where: { id_cuadro: id },
          include: { detalles: { where: { es_ganador: true, aprobacion_gt: 'APROBADO' } } }
        });

        if (!comparativa) throw new Error('Cuadro comparativo no encontrado.');
        if (comparativa.estado !== 'APROBADO_GT') {
          throw new Error(`APROBACION_GT_REQUERIDA: La OC solo puede generarse de un cuadro aprobado por Gerencia Técnica. Estado actual: ${comparativa.estado}`);
        }
        if (comparativa.detalles.length === 0) {
          throw new Error('No hay renglones aprobados por Gerencia Técnica con proveedor ganador seleccionado.');
        }

        // Lineas del cuadro para obtener detalle_req_id → cantidad real
        const lineas = await prisma.comparativaLinea.findMany({ where: { cuadro_id: id, tenant_id: tenantId } });
        const lineaMap = new Map(lineas.map((l: any) => [l.insumo_id, l.detalle_req_id as string | null]));

        const detalleReqIds = [...new Set(lineas.map((l: any) => l.detalle_req_id).filter(Boolean))] as string[];
        const reqItems = detalleReqIds.length > 0
          ? await prisma.requisicionItem.findMany({ where: { id_item: { in: detalleReqIds }, tenant_id: tenantId } })
          : [];
        const cantidadMap = new Map(reqItems.map((i: any) => [i.id_item, Number(i.cantidad)]));

        // 1.1: Agrupar detalles ganadores por proveedor_id
        const grupos = new Map<string, GrupoProveedor>();
        for (const d of comparativa.detalles) {
          if (!grupos.has(d.proveedor_id)) grupos.set(d.proveedor_id, { detalles: [], subtotal: 0 });
          const grupo = grupos.get(d.proveedor_id)!;
          const detailReqId = lineaMap.get(d.insumo_id) ?? null;
          const cantidad = detailReqId ? (cantidadMap.get(detailReqId) ?? 1) : 1;
          grupo.detalles.push(d);
          grupo.subtotal += d.precio_ofertado.toNumber() * cantidad;
        }

            // 1.4: Total agregado (con IVA) para verificación de suficiencia única
        let totalAgregadoSinIva = 0;
        for (const g of grupos.values()) totalAgregadoSinIva += g.subtotal;
        const totalAgregado = totalAgregadoSinIva * (1 + IVA_RATE);

        // Obtener concepto_id de la req para el gate de partida
        let conceptoId: string | null = null;
        if (comparativa.requisicion_id) {
          const req = await prisma.requisicion.findUnique({
            where: { id_requisicion: comparativa.requisicion_id },
            select: { concepto_id: true },
          });
          conceptoId = req?.concepto_id ?? null;
        }

        return {
          comparativaId: comparativa.id_cuadro,
          requisicionId: comparativa.requisicion_id,
          conceptoId,
          grupos,
          lineaMap,
          cantidadMap,
          totalAgregado,
        };
      }
    );

    // 1.4: Verificación de suficiencia financiera sobre el total del lote
    try {
      const checkResp = await axios.get(`${FINANZAS_URL}/suficiencia`, {
        params: { monto: loteData.totalAgregado },
        headers: buildForwardHeaders(req, { Authorization: token || '' }),
      });
      if (!checkResp.data.success || !checkResp.data.data.tiene_suficiencia) {
        throw new Error('PRESUPUESTO_INSUFICIENTE: Finanzas reporta fondos insuficientes para este movimiento.');
      }
    } catch (error: any) {
      const errMsg = error.response?.data?.error?.message || error.message;
      throw new Error(`Error de validación financiera: ${errMsg}`);
    }

    // Gate: verificar SaldoPartida en GT antes de crear OCs (fail-open en timeout)
    const oc_bloqueadas: any[] = [];
    let saldoPartidaGT: { monto_disponible: number; estado_tope: string; bloqueo_automatico: boolean } | null = null;
    if (loteData.conceptoId) {
      try {
        const saldoResp = await axios.get(`${GT_URL}/partidas/${loteData.conceptoId}/saldo`, {
          headers: buildForwardHeaders(req, { Authorization: token || '' }),
          timeout: 2000,
        });
        saldoPartidaGT = saldoResp.data?.data ?? null;
      } catch (_) {
        console.warn('[Compras] GT timeout/error en verificación de SaldoPartida — modo degradado (fail-open)');
      }

      if (saldoPartidaGT?.estado_tope === 'BLOQUEADO' && saldoPartidaGT?.bloqueo_automatico !== false) {
        oc_bloqueadas.push({
          concepto_id:    loteData.conceptoId,
          monto_disponible: saldoPartidaGT.monto_disponible,
          motivo: 'PARTIDA_BLOQUEADA',
        });
        return res.status(422).json({
          success: false,
          error: 'PARTIDA_BLOQUEADA',
          message: 'La partida presupuestal ha alcanzado su tope. Solicita una transferencia presupuestal para continuar.',
          oc_bloqueadas,
        });
      }
    }

    // 1.5–1.8: Crear una OC por proveedor con todos sus renglones
    const timestamp = Date.now();
    const ordenesCreadas: any[] = [];
    const advertencias: string[] = [];
    let idx = 0;

    if (saldoPartidaGT?.estado_tope === 'LIMITADO') {
      advertencias.push(`Partida al límite — disponible: $${saldoPartidaGT.monto_disponible.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`);
    }

    for (const [proveedorId, grupo] of loteData.grupos) {
      idx++;
      const codigoOC = `OC-AUTO-${timestamp}-${idx}`;
      const subtotalGrupo = grupo.subtotal;
      const ivaGrupo = subtotalGrupo * IVA_RATE;
      const totalGrupo = subtotalGrupo + ivaGrupo;

      const oc = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => prisma.ordenCompra.create({
          data: {
            tenant_id: tenantId,
            proyecto_id: proyectoId,
            proveedor_id: proveedorId,
            codigo: codigoOC,
            subtotal: subtotalGrupo,
            iva: ivaGrupo,
            total: totalGrupo,
            estado: OC_STATUS.PENDIENTE_FINANZAS,
            presupuesto_id,
            requisicion_id: loteData.requisicionId || null,
            items: {
              create: grupo.detalles.map((d: DetalleGanador) => {
                const detailReqId = loteData.lineaMap.get(d.insumo_id) ?? null;
                const cantidad = detailReqId ? (loteData.cantidadMap.get(detailReqId) ?? 1) : 1;
                const precioUnitario = d.precio_ofertado.toNumber();
                return {
                  tenant_id: tenantId,
                  proyecto_id: proyectoId,
                  insumo_id: d.insumo_id,
                  cantidad,
                  precio_unitario: precioUnitario,
                  importe: cantidad * precioUnitario,
                };
              })
            }
          }
        })
      );

      // 1.6: Comprometer fondos individualmente — error no bloquea las demás OCs
      let ocEmitida = false;
      try {
        await axios.post(`${FINANZAS_URL}/comprometer-fondos`, {
          presupuesto_id,
          monto: oc.total.toNumber(),
          oc_id: oc.id_orden,
          oc_codigo: oc.codigo,
          concepto: `Compromiso por Orden de Compra ${oc.codigo}`
        }, { headers: buildForwardHeaders(req, { Authorization: token || '' }) });

        await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
          await prisma.ordenCompra.update({ where: { id_orden: oc.id_orden }, data: { estado: OC_STATUS.EMITIDA } });
          await prisma.cuadroComparativo.update({ where: { id_cuadro: loteData.comparativaId }, data: { estado: 'CERRADO' } });
        });
        ocEmitida = true;
      } catch (finError: any) {
        const errMsg = finError.response?.data?.error?.message || finError.message;
        await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
          await prisma.ordenCompra.update({ where: { id_orden: oc.id_orden }, data: { estado: OC_STATUS.ERROR_FINANZAS } });
          await prisma.alertaOcError.upsert({
            where: { tenant_id_oc_id: { tenant_id: tenantId, oc_id: oc.id_orden } },
            update: { error_message: errMsg, updated_at: new Date() },
            create: { tenant_id: tenantId, proyecto_id: proyectoId, oc_id: oc.id_orden, oc_codigo: oc.codigo, presupuesto_id: presupuesto_id ?? null, error_message: errMsg },
          });
        });
        try {
          await eventBus.publish({ event_type: 'compras.oc_error_finanzas', timestamp: new Date().toISOString(), context: buildEventContext(req), payload: { oc_id: oc.id_orden, oc_codigo: oc.codigo, presupuesto_id: presupuesto_id ?? null, error_message: errMsg } });
        } catch (_) { /* best-effort */ }
        advertencias.push(`${oc.codigo} quedó en ERROR_FINANZAS: ${errMsg}`);
        logInfo(req, 'compras', 'compras.oc_error_finanzas.alerta_creada', 'Alerta de OC en ERROR_FINANZAS persistida en BD', { oc_id: oc.id_orden, oc_codigo: oc.codigo, presupuesto_id });
      }

      // 1.7: Comprometer saldo en GT para el concepto/partida (fire-and-forget)
      if (ocEmitida && loteData.conceptoId) {
        try {
          await axios.post(`${GT_URL}/partidas/${loteData.conceptoId}/comprometer`, {
            monto:            oc.total.toNumber(),
            referencia_id:    oc.id_orden,
            referencia_codigo: oc.codigo,
            tipo:             'OC',
          }, { headers: buildForwardHeaders(req, { Authorization: token || '' }), timeout: 3000 });
        } catch (gtErr: any) {
          console.error(`[Compras] Falla al comprometer saldo GT para OC ${oc.id_orden}:`, gtErr.message);
        }
      }

      // 1.8: Publicar evento compras.oc_creada por cada OC emitida (best-effort)
      if (ocEmitida) {
        try {
          await eventBus.publish({
            event_type: 'compras.oc_creada',
            timestamp: new Date().toISOString(),
            context: buildEventContext(req),
            payload: {
              oc_id:          oc.id_orden,
              codigo:         oc.codigo,
              total:          oc.total.toNumber(),
              proveedor_id:   oc.proveedor_id,
              proyecto_id:    proyectoId,
              requisicion_id: loteData.requisicionId || null,
              concepto_id:    loteData.conceptoId   || null,
              items:          grupo.detalles.map((d: any) => {
                const reqLineId = loteData.lineaMap.get(d.insumo_id) ?? null;
                const cantidad  = reqLineId ? (loteData.cantidadMap.get(reqLineId) ?? 1) : 1;
                return { insumo_id: d.insumo_id, cantidad, precio_unitario: d.precio_ofertado.toNumber() };
              }),
            },
          });
        } catch (_) { /* best-effort */ }
      }

      ordenesCreadas.push({
        id_orden: oc.id_orden,
        codigo: oc.codigo,
        estado: ocEmitida ? OC_STATUS.EMITIDA : OC_STATUS.ERROR_FINANZAS,
        proveedor_id: proveedorId,
        total: oc.total.toNumber(),
      });
    }

    logInfo(req, 'compras', 'compras.orden_compra.lote_emitido', 'Lote de OCs generado desde cuadro comparativo', {
      comparativa_id: loteData.comparativaId,
      total_ocs: ordenesCreadas.length,
      ocs_emitidas: ordenesCreadas.filter(o => o.estado === OC_STATUS.EMITIDA).length,
      ocs_error: advertencias.length,
      presupuesto_id,
    });

    // 1.8: Respuesta con todas las OCs (incluyendo las en ERROR_FINANZAS) y advertencias
    return res.status(201).json({
      success: true,
      data: {
        ordenes_compra: ordenesCreadas,
        ...(advertencias.length > 0 ? { advertencias } : {}),
      }
    });
  } catch (error: any) {
    logError(req, 'compras', 'compras.orden_compra.emitir.error', 'Error en conversion de comparativa a orden de compra', { error_message: error.message });
    const status = error.message.includes('PRESUPUESTO_INSUFICIENTE') ? 422
      : error.message.includes('APROBACION_GT_REQUERIDA') ? 400
      : 500;
    res.status(status).json({ success: false, message: error.message });
  }
});

// ── Crear cuadro comparativo ──────────────────────────────────────────────────

// POST /comparativas — crea un cuadro comparativo para una requisición (idempotente)
// Si la req tiene SolicitudCotizacion, auto-populará ComparativaLinea con specs y
// añadirá como detalles los proveedores que respondieron (RESPONDIO).
app.post('/api/v1/compras/comparativas',
  requireRoles('procurement', 'admin', 'superintendent'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { requisicion_id } = req.body;

      if (!requisicion_id) {
        return res.status(400).json({ success: false, message: 'Se requiere requisicion_id.' });
      }

      const data = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          // Idempotente: si ya existe, devolver el existente
          const existing = await prisma.cuadroComparativo.findFirst({
            where: { tenant_id: tenantId, proyecto_id: proyectoId, requisicion_id },
            include: { detalles: { include: { proveedor: true } } },
          });
          if (existing) return existing;

          const cuadro = await prisma.cuadroComparativo.create({
            data: {
              tenant_id:      tenantId,
              proyecto_id:    proyectoId,
              requisicion_id,
              codigo:         `CC-${Date.now()}`,
              estado:         'BORRADOR',
            },
            include: { detalles: { include: { proveedor: true } } },
          });

          // Auto-popular ComparativaLinea desde specs de la req
          const items = await prisma.requisicionItem.findMany({
            where: { requisicion_id, tenant_id: tenantId },
          });

          if (items.length > 0) {
            const specs = await prisma.especificacionDetalleReq.findMany({
              where: { tenant_id: tenantId, detalle_id: { in: items.map(i => i.id_item) } },
              orderBy: { orden: 'asc' },
            });

            const specsMap = new Map<string, string[]>();
            for (const s of specs) {
              if (!specsMap.has(s.detalle_id)) specsMap.set(s.detalle_id, []);
              specsMap.get(s.detalle_id)!.push(s.descripcion);
            }

            for (const item of items) {
              if (!item.insumo_id) continue;
              const specsTexto = specsMap.get(item.id_item)?.join('\n') ?? null;
              await prisma.comparativaLinea.upsert({
                where: { cuadro_id_insumo_id: { cuadro_id: cuadro.id_cuadro, insumo_id: item.insumo_id } },
                create: {
                  tenant_id: tenantId,
                  proyecto_id: proyectoId,
                  cuadro_id: cuadro.id_cuadro,
                  insumo_id: item.insumo_id,
                  especificaciones_requeridas: specsTexto,
                  detalle_req_id: item.id_item,
                },
                update: {
                  especificaciones_requeridas: specsTexto,
                  detalle_req_id: item.id_item,
                },
              });
            }
          }

          return prisma.cuadroComparativo.findUnique({
            where: { id_cuadro: cuadro.id_cuadro },
            include: { detalles: { include: { proveedor: true } } },
          });
        }
      );

      logInfo(req, 'compras', 'compras.comparativa.creada', `Cuadro comparativo ${(data as any).codigo} creado`, { requisicion_id });
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      logError(req, 'compras', 'compras.comparativa.crear.error', 'Error al crear cuadro comparativo', { error_message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// PUT /comparativas/:id/cotizaciones — guarda proveedores y precios de cotización (batch upsert)
// Body: { proveedores: [{ nombre: string, precios: [{ insumo_id, precio, tiempo_entrega? }] }] }
app.put('/api/v1/compras/comparativas/:id/cotizaciones',
  requireRoles('procurement', 'admin', 'superintendent'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { proveedores } = req.body as {
        proveedores: Array<{
          nombre: string;
          precios: Array<{ insumo_id: string; precio: number; tiempo_entrega?: string }>;
        }>;
      };

      if (!Array.isArray(proveedores)) {
        return res.status(400).json({ success: false, message: 'proveedores debe ser un array.' });
      }

      const data = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          // Verificar que el cuadro existe
          const cuadro = await prisma.cuadroComparativo.findUnique({ where: { id_cuadro: id } });
          if (!cuadro) throw new Error('Cuadro comparativo no encontrado.');
          if (cuadro.estado === 'FIRMADO_BLOQUEADO') throw new Error('COMPARATIVA_FIRMADO_BLOQUEADO: El cuadro está firmado y bloqueado. Solo el administrador puede desbloquearlo.');
          if (cuadro.estado !== 'BORRADOR') throw new Error(`El cuadro está en estado ${cuadro.estado} y no puede modificarse.`);

          // Eliminar detalles anteriores para hacer un reemplazo limpio
          await prisma.comparativaDetalle.deleteMany({ where: { cuadro_id: id } });

          // Crear/encontrar proveedores y sus detalles
          for (const prov of proveedores) {
            if (!prov.nombre?.trim()) continue;
            // Buscar o crear proveedor por nombre (dentro del tenant)
            let proveedor = await prisma.proveedor.findFirst({
              where: { tenant_id: tenantId, razon_social: prov.nombre.trim() },
            });
            if (!proveedor) {
              proveedor = await prisma.proveedor.create({
                data: {
                  tenant_id:      tenantId,
                  rfc_tax_id:     `RFC-${Date.now()}`, // placeholder hasta tener RFC real
                  razon_social:   prov.nombre.trim(),
                  estatus:        'ACTIVO',
                },
              });
            }

            // Crear detalles (un detalle por insumo por proveedor)
            for (const p of prov.precios || []) {
              if (!p.insumo_id || p.precio === undefined) continue;
              await prisma.comparativaDetalle.create({
                data: {
                  tenant_id:      tenantId,
                  proyecto_id:    proyectoId,
                  cuadro_id:      id,
                  proveedor_id:   proveedor.id_proveedor,
                  insumo_id:      p.insumo_id,
                  precio_ofertado: p.precio,
                  tiempo_entrega: p.tiempo_entrega || null,
                },
              });
            }
          }

          // Devolver cuadro actualizado
          return prisma.cuadroComparativo.findUnique({
            where: { id_cuadro: id },
            include: { detalles: { include: { proveedor: true } } },
          });
        }
      );

      logInfo(req, 'compras', 'compras.comparativa.cotizaciones.guardadas', `Cotizaciones guardadas para cuadro ${id}`, { proveedores: proveedores.length });
      res.json({ success: true, data });
    } catch (error: any) {
      logError(req, 'compras', 'compras.comparativa.cotizaciones.error', 'Error al guardar cotizaciones', { error_message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// ── Flujo de aprobación en dos etapas del Cuadro Comparativo ─────────────────

// 2.1 PATCH enviar-evaluacion — Compras envía al Residente
app.patch('/api/v1/compras/comparativas/:id/enviar-evaluacion',
  requireRoles('procurement', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId, proyectoId, userId } = req.securityContext;

      const data = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          const cuadro = await prisma.cuadroComparativo.findUnique({
            where: { id_cuadro: id },
            include: { detalles: true },
          });

          if (!cuadro) return res.status(404).json({ success: false, message: 'Cuadro comparativo no encontrado.' });

          if (cuadro.estado === 'FIRMADO_BLOQUEADO') {
            return res.status(403).json({ success: false, message: 'COMPARATIVA_FIRMADO_BLOQUEADO: El cuadro está firmado y bloqueado. Solo el administrador puede desbloquearlo.' });
          }
          if (cuadro.estado !== 'BORRADOR') {
            return res.status(400).json({
              success: false,
              message: `Solo se pueden enviar a evaluación cuadros en estado BORRADOR. Estado actual: ${cuadro.estado}`,
            });
          }

          if (cuadro.detalles.length === 0) {
            return res.status(400).json({ success: false, message: 'El cuadro no tiene renglones para evaluar.' });
          }

          // Marcar todos los detalles como PENDIENTE de evaluación técnica
          await prisma.comparativaDetalle.updateMany({
            where: { cuadro_id: id, tenant_id: tenantId },
            data: { evaluacion_tecnica: 'PENDIENTE' },
          });

          return prisma.cuadroComparativo.update({
            where: { id_cuadro: id },
            data: { estado: 'EN_EVALUACION_TECNICA' },
            include: { detalles: { include: { proveedor: true } } },
          });
        }
      );

      if (res.headersSent) return;
      logInfo(req, 'compras', 'compras.comparativa.enviada_evaluacion', 'Cuadro enviado a evaluación técnica', { cuadro_id: id });
      res.json({ success: true, data });
    } catch (error: any) {
      logError(req, 'compras', 'compras.comparativa.enviar_evaluacion.error', 'Error al enviar cuadro a evaluación', { error_message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// 2.2 PATCH evaluar — Residente registra evaluación técnica por renglón
app.patch('/api/v1/compras/comparativas/:id/evaluar',
  requireRoles('resident', 'residencia', 'control_obra', 'superintendent', 'procurement', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { evaluaciones } = req.body as {
        evaluaciones: {
          detalle_id: string;
          evaluacion_tecnica: string;
          comentario_tecnico?: string;
          valor_ofrecido_spec?: string;
          pregunta_residente?: string;
        }[];
      };

      if (!evaluaciones || !Array.isArray(evaluaciones) || evaluaciones.length === 0) {
        return res.status(400).json({ success: false, message: 'Se requiere un array "evaluaciones" con al menos un ítem.' });
      }

      const VALID_VALUES = new Set(['C', 'NC', 'DA', '?', 'PENDIENTE']);
      const REQUIRES_COMMENT = new Set(['NC', 'DA', '?']);
      for (const ev of evaluaciones) {
        if (!VALID_VALUES.has(ev.evaluacion_tecnica)) {
          return res.status(400).json({
            success: false,
            message: `Valor de evaluación inválido: "${ev.evaluacion_tecnica}". Valores permitidos: C, NC, DA, ?, PENDIENTE`,
          });
        }
        if (REQUIRES_COMMENT.has(ev.evaluacion_tecnica) && !ev.comentario_tecnico?.trim()) {
          return res.status(400).json({
            success: false,
            message: `El valor "${ev.evaluacion_tecnica}" requiere comentario_tecnico no vacío.`,
          });
        }
      }

      const data = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          const cuadro = await prisma.cuadroComparativo.findUnique({
            where: { id_cuadro: id },
            include: { detalles: true },
          });

          if (!cuadro) return res.status(404).json({ success: false, message: 'Cuadro comparativo no encontrado.' });

          if (cuadro.estado === 'LOCKED' || cuadro.estado === 'FIRMADO_BLOQUEADO') {
            return res.status(403).json({ success: false, message: 'COMPARATIVA_LOCKED: Este cuadro está firmado y no puede modificarse.' });
          }

          if (cuadro.estado !== 'EN_EVALUACION_TECNICA') {
            return res.status(400).json({
              success: false,
              message: `El cuadro no está en evaluación técnica. Estado actual: ${cuadro.estado}`,
            });
          }

          const detalleMap = new Map(cuadro.detalles.map(d => [d.id_detalle, d]));
          const invalid = evaluaciones.find(e => !detalleMap.has(e.detalle_id));
          if (invalid) {
            return res.status(400).json({
              success: false,
              message: `Renglón ${invalid.detalle_id} no pertenece a este cuadro comparativo.`,
            });
          }

          await Promise.all(
            evaluaciones.map(async (ev) => {
              const detalleActual = detalleMap.get(ev.detalle_id)!;

              await prisma.comparativaDetalle.update({
                where: { id_detalle: ev.detalle_id },
                data: {
                  evaluacion_tecnica: ev.evaluacion_tecnica,
                  comentario_tecnico: ev.comentario_tecnico?.trim() ?? null,
                  pregunta_residente: ev.evaluacion_tecnica === '?' ? (ev.pregunta_residente?.trim() ?? ev.comentario_tecnico?.trim() ?? null) : null,
                  ...(ev.valor_ofrecido_spec !== undefined
                    ? { valor_ofrecido_spec: ev.valor_ofrecido_spec.trim() || null }
                    : {}),
                },
              });

              // ? → crear AclaracionComparativa de tipo PREGUNTA
              if (ev.evaluacion_tecnica === '?') {
                await prisma.aclaracionComparativa.create({
                  data: {
                    tenant_id: tenantId,
                    proyecto_id: proyectoId,
                    cuadro_id: id,
                    insumo_id: detalleActual.insumo_id,
                    proveedor_id: detalleActual.proveedor_id,
                    autor_id: userId,
                    tipo: 'PREGUNTA',
                    mensaje: ev.comentario_tecnico!.trim(),
                    resuelta: false,
                  },
                });
              }

              // ? → C/NC/DA: resolver aclaraciones abiertas de esa celda
              if (detalleActual.evaluacion_tecnica === '?' && ['C', 'NC', 'DA'].includes(ev.evaluacion_tecnica)) {
                await prisma.aclaracionComparativa.updateMany({
                  where: {
                    cuadro_id: id,
                    insumo_id: detalleActual.insumo_id,
                    proveedor_id: detalleActual.proveedor_id,
                    resuelta: false,
                  },
                  data: { resuelta: true },
                });
              }
            })
          );

          return prisma.cuadroComparativo.findUnique({
            where: { id_cuadro: id },
            include: { detalles: { include: { proveedor: true } } },
          });
        }
      );

      if (res.headersSent) return;
      logInfo(req, 'compras', 'compras.comparativa.evaluacion_guardada', 'Evaluación técnica guardada', { cuadro_id: id, evaluador: userId });
      res.json({ success: true, data });
    } catch (error: any) {
      logError(req, 'compras', 'compras.comparativa.evaluar.error', 'Error al guardar evaluación técnica', { error_message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// 2.3 PATCH enviar-gt — Residente/Compras envía al Gerente Técnico
app.patch('/api/v1/compras/comparativas/:id/enviar-gt',
  requireRoles('resident', 'residencia', 'control_obra', 'procurement', 'superintendent'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId, proyectoId, userId } = req.securityContext;

      const data = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          const cuadro = await prisma.cuadroComparativo.findUnique({
            where: { id_cuadro: id },
            include: { detalles: true },
          });

          if (!cuadro) return res.status(404).json({ success: false, message: 'Cuadro comparativo no encontrado.' });

          const ESTADOS_ENVIABLES = new Set(['EVALUADO_TECNICAMENTE', 'LOCKED', 'FIRMADO_BLOQUEADO']);
          if (!ESTADOS_ENVIABLES.has(cuadro.estado)) {
            return res.status(400).json({
              success: false,
              message: `El cuadro debe estar firmado (FIRMADO_BLOQUEADO) antes de enviarse al GT. Estado actual: ${cuadro.estado}`,
            });
          }

          const hayAprobados = cuadro.detalles.some(d =>
            d.evaluacion_tecnica === 'APROBADO' || d.evaluacion_tecnica === 'C'
          );
          if (!hayAprobados) {
            return res.status(400).json({
              success: false,
              message: 'Sin renglones aprobados técnicamente (C o APROBADO) — no es posible remitir al Gerente Técnico.',
            });
          }

          return prisma.cuadroComparativo.update({
            where: { id_cuadro: id },
            data: { estado: 'EN_APROBACION_GT' },
            include: { detalles: { include: { proveedor: true } } },
          });
        }
      );

      if (res.headersSent) return;
      logInfo(req, 'compras', 'compras.comparativa.enviada_gt', 'Cuadro enviado a aprobación de Gerencia Técnica', { cuadro_id: id });
      res.json({ success: true, data });
    } catch (error: any) {
      logError(req, 'compras', 'compras.comparativa.enviar_gt.error', 'Error al enviar cuadro al GT', { error_message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// 2.4 + 3.1 PATCH revisar-gt — Gerente Técnico aprueba/rechaza por renglón + evento
app.patch('/api/v1/compras/comparativas/:id/revisar-gt',
  requireRoles('gerencia_tecnica', 'superintendent', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { aprobaciones, comentario_gt_general } = req.body as {
        aprobaciones: { detalle_id: string; aprobacion_gt: 'APROBADO' | 'RECHAZADO'; comentario_gt?: string }[];
        comentario_gt_general?: string;
      };

      if (!aprobaciones || !Array.isArray(aprobaciones) || aprobaciones.length === 0) {
        return res.status(400).json({ success: false, message: 'Se requiere un array "aprobaciones" con al menos un ítem.' });
      }

      const result = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          const cuadro = await prisma.cuadroComparativo.findUnique({
            where: { id_cuadro: id },
            include: { detalles: true },
          });

          if (!cuadro) return res.status(404).json({ success: false, message: 'Cuadro comparativo no encontrado.' });

          if (cuadro.estado !== 'EN_APROBACION_GT') {
            return res.status(400).json({
              success: false,
              message: `El cuadro no está en aprobación GT. Estado actual: ${cuadro.estado}`,
            });
          }

          // Mapa de detalles para validación rápida
          const detalleMap = new Map(cuadro.detalles.map(d => [d.id_detalle, d]));

          // Regla: GT no puede APROBAR un renglón rechazado por el Residente
          for (const ap of aprobaciones) {
            const detalle = detalleMap.get(ap.detalle_id);
            if (!detalle) {
              return res.status(400).json({
                success: false,
                message: `Renglón ${ap.detalle_id} no pertenece a este cuadro comparativo.`,
              });
            }
            if (ap.aprobacion_gt === 'APROBADO' && detalle.evaluacion_tecnica === 'RECHAZADO') {
              return res.status(400).json({
                success: false,
                message: `No es posible aprobar el renglón ${detalle.id_detalle}: fue rechazado en la evaluación técnica del Residente.`,
              });
            }
          }

          // Actualizar aprobación GT por renglón
          await Promise.all(
            aprobaciones.map(ap =>
              prisma.comparativaDetalle.update({
                where: { id_detalle: ap.detalle_id },
                data: {
                  aprobacion_gt: ap.aprobacion_gt,
                  comentario_gt: ap.comentario_gt ?? null,
                },
              })
            )
          );

          // Determinar estado final: si al menos uno aprobado → APROBADO_GT, si todos rechazados → RECHAZADO_GT
          const hayAprobadosGT = aprobaciones.some(ap => ap.aprobacion_gt === 'APROBADO');
          const estadoFinal = hayAprobadosGT ? 'APROBADO_GT' : 'RECHAZADO_GT';

          return prisma.cuadroComparativo.update({
            where: { id_cuadro: id },
            data: {
              estado: estadoFinal,
              gerente_tecnico_id: userId,
              fecha_aprobacion_gt: new Date(),
              comentario_gt_general: comentario_gt_general ?? null,
            },
            include: { detalles: { include: { proveedor: true } } },
          });
        }
      );

      if (res.headersSent) return;

      const cuadroActualizado = result as any;
      const estadoFinal = cuadroActualizado.estado;
      const renglones_aprobados = (cuadroActualizado.detalles || []).filter((d: any) => d.aprobacion_gt === 'APROBADO').length;

      logInfo(req, 'compras', `compras.comparativa.${estadoFinal === 'APROBADO_GT' ? 'aprobada_gt' : 'rechazada_gt'}`,
        `Cuadro comparativo ${estadoFinal} por Gerencia Técnica`,
        { cuadro_id: id, estado_final: estadoFinal, renglones_aprobados, gerente_id: userId }
      );

      // 3.1 Publicar evento al bus (best-effort)
      if (estadoFinal === 'APROBADO_GT') {
        try {
          await eventBus.publish({
            event_type: 'compras.comparativa_aprobada_gt',
            timestamp: new Date().toISOString(),
            context: buildEventContext(req),
            payload: {
              cuadro_id: id,
              codigo: cuadroActualizado.codigo,
              requisicion_id: cuadroActualizado.requisicion_id,
              renglones_aprobados,
            },
          });
        } catch (_) {
          logWarn(req, 'compras', 'compras.comparativa_aprobada_gt.bus_offline',
            'EventBus no disponible al publicar comparativa_aprobada_gt — la aprobación ya está persistida', { cuadro_id: id });
        }
      }

      res.json({ success: true, data: result });
    } catch (error: any) {
      logError(req, 'compras', 'compras.comparativa.revisar_gt.error', 'Error en revisión GT', { error_message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

app.get('/api/v1/compras/ordenes-compra/reconciliacion/pendientes', requireRoles('admin', 'superintendent', 'procurement'), async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => prisma.ordenCompra.findMany({
        where: {
          estado: {
            in: [OC_STATUS.ERROR_FINANZAS, OC_STATUS.CANCELACION_PENDIENTE],
          },
        },
        include: { proveedor: true, items: true },
        orderBy: { fecha_emision: 'desc' },
      })
    );

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/v1/compras/proyectos/:proyecto_id/acumulado-por-concepto
// Endpoint interno: retorna comprometido y pagado por concepto_id para el módulo gerencia-tecnica.
app.get(
  '/api/v1/compras/proyectos/:proyecto_id/acumulado-por-concepto',
  requireRoles('gerencia_tecnica', 'superintendent', 'admin', 'control_obra'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
        // OCs comprometidas (EMITIDA, APROBADA, PAGADA) con req vinculada
        const ocsComprometidas = await prisma.ordenCompra.findMany({
          where: {
            tenant_id: tenantId,
            proyecto_id: proyectoId,
            estado: { in: ['EMITIDA', 'APROBADA', 'PAGADA'] },
            requisicion_id: { not: null },
          },
          select: { total: true, estado: true, requisicion_id: true },
        });

        // Obtener concepto_id por requisicion_id
        const reqIds = [...new Set(ocsComprometidas.map(o => o.requisicion_id!))];
        const reqs = reqIds.length > 0
          ? await prisma.requisicion.findMany({
              where: { id_requisicion: { in: reqIds } },
              select: { id_requisicion: true, concepto_id: true },
            })
          : [];
        const reqToConcepto = new Map(reqs.map(r => [r.id_requisicion, r.concepto_id]));

        // Acumular por concepto_id
        const acumulado = new Map<string, { comprometido: number; pagado: number }>();
        for (const oc of ocsComprometidas) {
          const conceptoId = reqToConcepto.get(oc.requisicion_id!);
          if (!conceptoId) continue;
          const prev = acumulado.get(conceptoId) ?? { comprometido: 0, pagado: 0 };
          const total = Number(oc.total);
          prev.comprometido += total;
          if (oc.estado === 'PAGADA') prev.pagado += total;
          acumulado.set(conceptoId, prev);
        }

        return [...acumulado.entries()].map(([concepto_id, vals]) => ({
          concepto_id,
          comprometido: Math.round(vals.comprometido * 100) / 100,
          pagado: Math.round(vals.pagado * 100) / 100,
        }));
      });

      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

app.get('/api/v1/compras/resumen-dashboard',
  requireRoles('superintendent', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
        const [reqPendientes, ocsPorEmitir, ocsEnProceso, montoAgg] = await Promise.all([
          prisma.requisicion.count({ where: { estado: 'PENDIENTE' } }),
          prisma.ordenCompra.count({ where: { estado: 'APROBADA' } }),
          prisma.ordenCompra.count({ where: { estado: 'EMITIDA' } }),
          prisma.ordenCompra.aggregate({
            _sum: { total: true },
            where: { estado: { in: ['EMITIDA', 'RECIBIDA'] } },
          }),
        ]);
        return {
          requisiciones_pendientes: reqPendientes,
          ocs_por_emitir:           ocsPorEmitir,
          ocs_en_proceso:           ocsEnProceso,
          monto_comprometido:       Number(montoAgg._sum.total ?? 0),
        };
      });
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

app.get('/api/v1/compras/dashboard',
  requireRoles('superintendent', 'procurement', 'admin', 'resident'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const now = new Date();

      const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
        const [
          totalReq, pendienteAprobacion, listaParaCotizar,
          cotizando, pendienteGt,
          ocsEmitidas, ocsPendientesRecibir,
          solicitudesVencidas, actividadReciente,
        ] = await Promise.all([
          prisma.requisicion.count(),
          prisma.requisicion.count({ where: { estado: 'PENDIENTE' } }),
          prisma.requisicion.count({ where: { estado: 'APROBADA' } }),
          prisma.cuadroComparativo.count({
            where: { estado: { in: ['BORRADOR', 'CON_SOLICITUD', 'EN_COTIZACION', 'EN_EVALUACION_TECNICA'] } },
          }),
          prisma.cuadroComparativo.count({
            where: { estado: { in: ['EVALUADO_TECNICAMENTE', 'EN_APROBACION_GT'] } },
          }),
          prisma.ordenCompra.count({ where: { estado: 'EMITIDA' } }),
          prisma.ordenCompra.count({ where: { estado: { in: ['EMITIDA', 'PARCIALMENTE_RECIBIDA'] } } }),
          prisma.solicitudCotizacion.findMany({
            where: { fecha_limite: { lt: now } },
            select: { id_solicitud: true, requisicion_id: true, fecha_limite: true },
          }),
          prisma.requisicion.findMany({
            orderBy: { fecha_solicitud: 'desc' },
            take: 5,
            select: { id_requisicion: true, codigo: true, observaciones: true, estado: true, fecha_solicitud: true },
          }),
        ]);

        const alertas = solicitudesVencidas.map((s) => {
          const msVencida = now.getTime() - s.fecha_limite.getTime();
          const diasVencida = Math.floor(msVencida / (1000 * 60 * 60 * 24));
          return {
            tipo: 'cotizacion_vencida',
            req_id: s.requisicion_id,
            folio: s.id_solicitud,
            dias_vencida: diasVencida,
          };
        });

        return {
          kpis: {
            total_requisiciones:       totalReq,
            pendiente_aprobacion:      pendienteAprobacion,
            lista_cotizar:             listaParaCotizar,
            cotizando,
            pendiente_gt:              pendienteGt,
            ocs_emitidas:              ocsEmitidas,
            ocs_pendientes_recibir:    ocsPendientesRecibir,
          },
          alertas,
          actividad_reciente: actividadReciente.map((r) => ({
            id:         r.id_requisicion,
            folio:      r.codigo,
            concepto:   r.observaciones ?? '',
            estado:     r.estado,
            updated_at: r.fecha_solicitud.toISOString(),
          })),
        };
      });

      // B2B: GT dashboard KPIs para mostrar en ComprasView (fail-soft → parcial)
      let gtDashboard: any = null;
      try {
        const { default: axios } = await import('axios');
        const gtResp = await axios.get(`${GT_URL}/dashboard`, {
          headers: {
            authorization: req.headers.authorization,
            'x-tenant-id':   req.headers['x-tenant-id'],
            'x-proyecto-id': req.headers['x-proyecto-id'],
          },
          timeout: 3000,
        });
        gtDashboard = gtResp.data?.data ?? null;
      } catch { /* GT no disponible — parcial */ }

      res.json({ success: true, data: { ...data, gt_dashboard: gtDashboard } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// REPORTES B2B (solo consumo interno desde otros microservicios)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function requireInternalService(serviceName: string) {
  return (req: Request, res: Response, next: any) => {
    const header = req.headers['x-internal-service'];
    if (header !== serviceName) {
      res.status(403).json({ success: false, message: 'Acceso restringido a servicios internos.' });
      return;
    }
    next();
  };
}

// GET /api/v1/compras/reportes/ocs-por-concepto?proyectoId=<uuid>
// Agrega SUM(total) de OCs activas por concepto_id de la requisición origen.
// Estados comprometidos: EMITIDA, PARCIALMENTE_RECIBIDA, RECIBIDA.
// Uso: B2B desde gerencia-tecnica.
app.get('/api/v1/compras/reportes/ocs-por-concepto',
  requireInternalService('gerencia-tecnica'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, userId } = req.securityContext;
      const proyectoId = (req.query.proyectoId ?? req.query.proyecto_id) as string;

      if (!proyectoId) {
        res.status(400).json({ success: false, message: 'proyectoId es requerido.' });
        return;
      }

      const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
        const rows = await (prisma as any).$queryRaw`
          SELECT
            r.concepto_id,
            SUM(oc.total)::numeric   AS monto_comprometido,
            COUNT(oc.id_orden)::int  AS count_ocs
          FROM ordenes_compra oc
          JOIN requisiciones r ON r.id_requisicion = oc.requisicion_id
          WHERE oc.tenant_id  = ${tenantId}::uuid
            AND oc.proyecto_id = ${proyectoId}::uuid
            AND oc.estado IN ('EMITIDA', 'PARCIALMENTE_RECIBIDA', 'RECIBIDA')
            AND r.concepto_id IS NOT NULL
          GROUP BY r.concepto_id
        `;
        return (rows as any[]).map((r: any) => ({
          concepto_id:         r.concepto_id,
          monto_comprometido:  Number(r.monto_comprometido),
          count_ocs:           Number(r.count_ocs),
        }));
      });

      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROXIES B2B HACIA GERENCIA TÉCNICA (solo backend-to-backend — frontend
// no llama a GT directamente, cumple regla-no-cross-service-frontend)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get('/api/v1/compras/catalog/insumos',
  requireRoles('procurement', 'admin', 'superintendent', 'resident', 'residencia', 'gerencia_tecnica'),
  async (req: Request, res: Response) => {
    try {
      const { default: axios } = await import('axios');
      const token = req.headers.authorization;
      const resp = await axios.get(`${GT_URL}/insumos`, {
        headers: { authorization: token, 'x-tenant-id': req.headers['x-tenant-id'], 'x-proyecto-id': req.headers['x-proyecto-id'] },
        timeout: 5000,
      });
      res.json(resp.data);
    } catch (error: any) {
      res.status(502).json({ success: false, message: 'GT insumos temporalmente no disponible.', parcial: true });
    }
  }
);

app.post('/api/v1/compras/catalog/insumos',
  requireRoles('procurement', 'admin', 'superintendent', 'gerencia_tecnica'),
  async (req: Request, res: Response) => {
    try {
      const { default: axios } = await import('axios');
      const token = req.headers.authorization;
      const resp = await axios.post(`${GT_URL}/insumos`, req.body, {
        headers: { authorization: token, 'x-tenant-id': req.headers['x-tenant-id'], 'x-proyecto-id': req.headers['x-proyecto-id'], 'content-type': 'application/json' },
        timeout: 5000,
      });
      res.status(resp.status).json(resp.data);
    } catch (error: any) {
      const status = error.response?.status ?? 502;
      res.status(status).json(error.response?.data ?? { success: false, message: 'Error creando insumo en GT.' });
    }
  }
);

app.get('/api/v1/compras/presupuesto-activo',
  requireRoles('procurement', 'admin', 'superintendent', 'resident', 'residencia', 'gerencia_tecnica'),
  async (req: Request, res: Response) => {
    try {
      const { default: axios } = await import('axios');
      const token = req.headers.authorization;
      const resp = await axios.get(`${GT_URL}/presupuesto/activo`, {
        headers: { authorization: token, 'x-tenant-id': req.headers['x-tenant-id'], 'x-proyecto-id': req.headers['x-proyecto-id'] },
        timeout: 5000,
      });
      res.json(resp.data);
    } catch (error: any) {
      res.status(502).json({ success: false, data: null, parcial: true });
    }
  }
);

app.get('/api/v1/compras/reportes/control-presupuestal',
  requireRoles('procurement', 'admin', 'superintendent', 'gerencia_tecnica'),
  async (req: Request, res: Response) => {
    try {
      const { default: axios } = await import('axios');
      const token = req.headers.authorization;
      const resp = await axios.get(`${GT_URL}/reportes/control-presupuestal`, {
        params: req.query,
        headers: { authorization: token, 'x-tenant-id': req.headers['x-tenant-id'], 'x-proyecto-id': req.headers['x-proyecto-id'] },
        timeout: 8000,
      });
      res.json(resp.data);
    } catch (error: any) {
      res.status(502).json({ success: false, data: null, parcial: true });
    }
  }
);

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', module: 'compras', timestamp: new Date().toISOString() });
});

app.post('/api/v1/compras/ordenes-compra/:id/cancelar', requireRoles('admin', 'superintendent', 'procurement'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId } = req.securityContext;
    const token = req.headers.authorization;

    const oc = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => {
        const found = await prisma.ordenCompra.findUnique({
          where: { id_orden: id }
        });

        if (!found) {
          throw new Error('Orden de Compra no encontrada.');
        }

        if (found.estado === OC_STATUS.CANCELADA) {
          throw new Error('La Orden de Compra ya está cancelada.');
        }

        if (found.estado === 'RECIBIDA' || found.estado === 'COBRADA') {
          throw new Error('No se puede cancelar una OC que ya ha sido recibida o cobrada.');
        }

        if (found.estado === OC_STATUS.CANCELACION_PENDIENTE) {
          throw new Error('La Orden de Compra ya está pendiente de confirmación de cancelación.');
        }

        return found;
      }
    );

    if (oc.presupuesto_id) {
      await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          await prisma.ordenCompra.update({
            where: { id_orden: id },
            data: { estado: OC_STATUS.CANCELACION_PENDIENTE }
          });
        }
      );

      try {
        await axios.post(`${FINANZAS_URL}/liberar-fondos`, {
          presupuesto_id: oc.presupuesto_id,
          monto: oc.total.toNumber(),
          oc_id: oc.id_orden,
          oc_codigo: oc.codigo,
          concepto: `Liberación por cancelación de OC ${oc.codigo}`
        }, {
          headers: buildForwardHeaders(req, { Authorization: token || '' })
        });
      } catch (error: any) {
        const errMsg = error.response?.data?.error?.message || error.message;
        logWarn(req, 'compras', 'compras.orden_compra.cancelacion_pendiente', 'Finanzas no confirmo la liberacion durante la cancelacion de la OC', {
          oc_id: oc.id_orden,
          oc_codigo: oc.codigo,
          presupuesto_id: oc.presupuesto_id,
          downstream_module: 'finanzas',
          error_message: errMsg,
        });
        console.error('[Compras] Error liberando fondos:', errMsg);
        return res.status(502).json({
          success: false,
          message: `La OC quedó en cancelación pendiente porque Finanzas no confirmó la liberación: ${errMsg}`,
          data: {
            oc_id: oc.id_orden,
            codigo: oc.codigo,
            estado: OC_STATUS.CANCELACION_PENDIENTE
          }
        });
      }
    }

    const result = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => {
        const cancelada = await prisma.ordenCompra.update({
          where: { id_orden: id },
          data: { estado: OC_STATUS.CANCELADA }
        });

        await eventBus.publish({
          event_type: 'compras.oc_cancelada',
          timestamp: new Date().toISOString(),
          context: buildEventContext(req),
          payload: {
            oc_id:          cancelada.id_orden,
            codigo:         cancelada.codigo,
            total:          cancelada.total.toNumber(),
            presupuesto_id: cancelada.presupuesto_id,
            requisicion_id: cancelada.requisicion_id,
          },
        });

        return cancelada;
      }
    );

    // Revertir compromiso en GT (fire-and-forget) para liberar saldo de la partida
    if (result.requisicion_id) {
      try {
        const reqData = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) =>
          prisma.requisicion.findUnique({ where: { id_requisicion: result.requisicion_id! }, select: { concepto_id: true } })
        );
        if (reqData?.concepto_id) {
          await axios.delete(`${GT_URL}/partidas/${reqData.concepto_id}/comprometer/${result.id_orden}`, {
            headers: buildForwardHeaders(req, { Authorization: token || '' }),
            timeout: 3000,
          });
        }
      } catch (gtErr: any) {
        console.warn(`[Compras] No se pudo revertir compromiso GT para OC ${result.id_orden}:`, gtErr.message);
      }
    }

    logInfo(req, 'compras', 'compras.orden_compra.cancelada', 'Orden de compra cancelada y conciliada con Finanzas', {
      oc_id: result.id_orden,
      oc_codigo: result.codigo,
      presupuesto_id: result.presupuesto_id,
      downstream_module: 'finanzas',
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    logError(req, 'compras', 'compras.orden_compra.cancelar.error', 'Error cancelando orden de compra', {
      error_message: error.message,
    });
    console.error('[Compras] Error cancelando OC:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/v1/compras/ordenes-compra/:id/reconciliar-finanzas', requireRoles('admin', 'superintendent', 'procurement'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId } = req.securityContext;
    const token = req.headers.authorization;

    const oc = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => prisma.ordenCompra.findUnique({
        where: { id_orden: id },
      })
    );

    if (!oc) {
      return res.status(404).json({ success: false, message: 'Orden de Compra no encontrada.' });
    }

    if (oc.estado === OC_STATUS.EMITIDA || oc.estado === OC_STATUS.CANCELADA) {
      const response = buildTerminalHttpResponse({
        terminalState: 'idempotent',
        data: {
          ...oc,
          total: oc.total.toNumber(),
          idempotente: true,
        },
        context: { tenantId, proyectoId },
        buildBody: (result) => ({ success: true, data: result }),
      });

      return res.status(response.statusCode).json(response.body);
    }

    if (oc.estado === OC_STATUS.ERROR_FINANZAS) {
      if (!oc.presupuesto_id) {
        return res.status(422).json({ success: false, message: 'La OC no tiene presupuesto_id para reconciliar.' });
      }

      await axios.post(`${FINANZAS_URL}/comprometer-fondos`, {
        presupuesto_id: oc.presupuesto_id,
        monto: oc.total.toNumber(),
        oc_id: oc.id_orden,
        oc_codigo: oc.codigo,
        concepto: `Reconciliación de compromiso por Orden de Compra ${oc.codigo}`
      }, {
        headers: buildForwardHeaders(req, { Authorization: token || '' })
      });

      const updated = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => prisma.ordenCompra.update({
          where: { id_orden: id },
          data: { estado: OC_STATUS.EMITIDA },
        })
      );

      const response = buildTerminalHttpResponse({
        terminalState: 'applied',
        data: {
          ...updated,
          total: updated.total.toNumber(),
          idempotente: false,
        },
        context: { tenantId, proyectoId },
        buildBody: (result) => ({ success: true, data: result }),
      });

      return res.status(response.statusCode).json(response.body);
    }

    if (oc.estado === OC_STATUS.CANCELACION_PENDIENTE) {
      if (!oc.presupuesto_id) {
        const updated = await createTenantContext(
          { tenantId, proyectoId, userId },
          async (prisma) => prisma.ordenCompra.update({
            where: { id_orden: id },
            data: { estado: OC_STATUS.CANCELADA },
          })
        );

        const response = buildTerminalHttpResponse({
          terminalState: 'applied',
          data: {
            ...updated,
            total: updated.total.toNumber(),
            idempotente: false,
          },
          context: { tenantId, proyectoId },
          buildBody: (result) => ({ success: true, data: result }),
        });

        return res.status(response.statusCode).json(response.body);
      }

      await axios.post(`${FINANZAS_URL}/liberar-fondos`, {
        presupuesto_id: oc.presupuesto_id,
        monto: oc.total.toNumber(),
        oc_id: oc.id_orden,
        oc_codigo: oc.codigo,
        concepto: `Reconciliación de liberación por cancelación de OC ${oc.codigo}`
      }, {
        headers: buildForwardHeaders(req, { Authorization: token || '' })
      });

      const updated = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => prisma.ordenCompra.update({
          where: { id_orden: id },
          data: { estado: OC_STATUS.CANCELADA },
        })
      );

      await eventBus.publish({
        event_type: 'compras.oc_cancelada',
        timestamp: new Date().toISOString(),
        context: buildEventContext(req),
        payload: {
          oc_id:          updated.id_orden,
          codigo:         updated.codigo,
          total:          updated.total.toNumber(),
          presupuesto_id: updated.presupuesto_id,
          requisicion_id: updated.requisicion_id,
        },
      });

      const response = buildTerminalHttpResponse({
        terminalState: 'applied',
        data: {
          ...updated,
          total: updated.total.toNumber(),
          idempotente: false,
        },
        context: { tenantId, proyectoId },
        buildBody: (result) => ({ success: true, data: result }),
      });

      return res.status(response.statusCode).json(response.body);
    }

    return res.status(409).json({
      success: false,
      message: `La OC no requiere reconciliación financiera. Estado actual: ${oc.estado}`,
    });
  } catch (error: any) {
    const errMsg = error.response?.data?.error?.message || error.message;
    res.status(502).json({ success: false, message: errMsg });
  }
});

export async function handleFondosComprometidosEvent(event: BocamEvent): Promise<void> {
  const {
    referencia_oc_id,
    referencia_oc_codigo,
    presupuesto_id,
  } = event.payload as {
    referencia_oc_id?: string;
    referencia_oc_codigo?: string;
    presupuesto_id?: string;
  };

  if (!referencia_oc_id || !referencia_oc_codigo || !presupuesto_id) {
    console.error(JSON.stringify({
      action: 'compras.event.finanzas.fondos_comprometidos.invalid_payload',
      event_type: event.event_type,
      correlation_id: event.context.correlation_id,
      tenant_id: event.context.tenant_id,
      proyecto_id: event.context.proyecto_id,
      referencia_oc_id,
      presupuesto_id,
    }));
    return;
  }

  type FondosComprometidosLoaded = {
    oc: Awaited<ReturnType<PrismaClient['ordenCompra']['findUnique']>>;
  };

  type FondosComprometidosResult =
    | {
        status: 'oc_not_found';
      }
    | {
        status: 'idempotent';
        oc_codigo: string;
      }
    | {
        status: 'applied';
        oc_codigo: string;
      };

  const result = await applyTerminalMutationInContext<
    { tenantId: string; proyectoId: string; userId: string },
    PrismaClient,
    FondosComprometidosLoaded,
    { status: 'oc_not_found' },
    { status: 'idempotent'; oc_codigo: string },
    { status: 'applied'; oc_codigo: string }
  >({
    context: {
      tenantId: event.context.tenant_id,
      proyectoId: event.context.proyecto_id,
      userId: event.context.user_id,
    },
    runInContext: createTenantContext,
    load: async (prisma) => {
      const oc = await prisma.ordenCompra.findUnique({
        where: { id_orden: referencia_oc_id },
      });

      return { oc };
    },
    notFoundResult: async (loaded) => {
      if (loaded.oc) {
        return null;
      }

      logTerminalState({
        terminalState: 'not_found',
        actions: {
          notFound: 'compras.event.finanzas.fondos_comprometidos.oc_not_found',
          idempotent: 'compras.event.finanzas.fondos_comprometidos.idempotent',
          applied: 'compras.event.finanzas.fondos_comprometidos.applied',
        },
        context: {
          eventType: event.event_type,
          correlationId: event.context.correlation_id,
          tenantId: event.context.tenant_id,
          proyectoId: event.context.proyecto_id,
        },
        extras: {
          referencia_oc_id,
        },
      });

      return { status: 'oc_not_found' };
    },
    idempotentResult: async (loaded) => {
      if (!loaded.oc || loaded.oc.estado !== OC_STATUS.EMITIDA) {
        return null;
      }

      logTerminalState({
        terminalState: 'idempotent',
        actions: {
          notFound: 'compras.event.finanzas.fondos_comprometidos.oc_not_found',
          idempotent: 'compras.event.finanzas.fondos_comprometidos.idempotent',
          applied: 'compras.event.finanzas.fondos_comprometidos.applied',
        },
        context: {
          eventType: event.event_type,
          correlationId: event.context.correlation_id,
          tenantId: event.context.tenant_id,
          proyectoId: event.context.proyecto_id,
        },
        extras: {
          referencia_oc_id,
          oc_codigo: loaded.oc.codigo,
        },
      });

      return {
        status: 'idempotent',
        oc_codigo: loaded.oc.codigo,
      };
    },
    apply: async (loaded, prisma) => {
      await prisma.ordenCompra.update({
        where: { id_orden: referencia_oc_id },
        data: { estado: OC_STATUS.EMITIDA },
      });

      return {
        status: 'applied',
        oc_codigo: loaded.oc!.codigo,
      };
    },
  });

  if (result.status === 'applied') {
    logTerminalState({
      terminalState: 'applied',
      actions: {
        notFound: 'compras.event.finanzas.fondos_comprometidos.oc_not_found',
        idempotent: 'compras.event.finanzas.fondos_comprometidos.idempotent',
        applied: 'compras.event.finanzas.fondos_comprometidos.applied',
      },
      context: {
        eventType: event.event_type,
        correlationId: event.context.correlation_id,
        tenantId: event.context.tenant_id,
        proyectoId: event.context.proyecto_id,
      },
      extras: {
        referencia_oc_id,
        oc_codigo: result.oc_codigo,
      },
    });
  }
}

export async function handleFondosLiberadosEvent(event: BocamEvent): Promise<void> {
  const {
    referencia_oc_id,
    referencia_oc_codigo,
    presupuesto_id,
  } = event.payload as {
    referencia_oc_id?: string;
    referencia_oc_codigo?: string;
    presupuesto_id?: string;
  };

  if (!referencia_oc_id || !referencia_oc_codigo || !presupuesto_id) {
    console.error(JSON.stringify({
      action: 'compras.event.finanzas.fondos_liberados.invalid_payload',
      event_type: event.event_type,
      correlation_id: event.context.correlation_id,
      tenant_id: event.context.tenant_id,
      proyecto_id: event.context.proyecto_id,
      referencia_oc_id,
      presupuesto_id,
    }));
    return;
  }

  type FondosLiberadosLoaded = {
    oc: Awaited<ReturnType<PrismaClient['ordenCompra']['findUnique']>>;
  };

  type FondosLiberadosResult =
    | {
        status: 'oc_not_found';
      }
    | {
        status: 'idempotent';
        oc_codigo: string;
      }
    | {
        status: 'applied';
        oc_codigo: string;
      };

  const result = await applyTerminalMutationInContext<
    { tenantId: string; proyectoId: string; userId: string },
    PrismaClient,
    FondosLiberadosLoaded,
    { status: 'oc_not_found' },
    { status: 'idempotent'; oc_codigo: string },
    { status: 'applied'; oc_codigo: string }
  >({
    context: {
      tenantId: event.context.tenant_id,
      proyectoId: event.context.proyecto_id,
      userId: event.context.user_id,
    },
    runInContext: createTenantContext,
    load: async (prisma) => {
      const oc = await prisma.ordenCompra.findUnique({
        where: { id_orden: referencia_oc_id },
      });

      return { oc };
    },
    notFoundResult: async (loaded) => {
      if (loaded.oc) {
        return null;
      }

      logTerminalState({
        terminalState: 'not_found',
        actions: {
          notFound: 'compras.event.finanzas.fondos_liberados.oc_not_found',
          idempotent: 'compras.event.finanzas.fondos_liberados.idempotent',
          applied: 'compras.event.finanzas.fondos_liberados.applied',
        },
        context: {
          eventType: event.event_type,
          correlationId: event.context.correlation_id,
          tenantId: event.context.tenant_id,
          proyectoId: event.context.proyecto_id,
        },
        extras: {
          referencia_oc_id,
        },
      });

      return { status: 'oc_not_found' };
    },
    idempotentResult: async (loaded) => {
      if (!loaded.oc || loaded.oc.estado !== OC_STATUS.CANCELADA) {
        return null;
      }

      logTerminalState({
        terminalState: 'idempotent',
        actions: {
          notFound: 'compras.event.finanzas.fondos_liberados.oc_not_found',
          idempotent: 'compras.event.finanzas.fondos_liberados.idempotent',
          applied: 'compras.event.finanzas.fondos_liberados.applied',
        },
        context: {
          eventType: event.event_type,
          correlationId: event.context.correlation_id,
          tenantId: event.context.tenant_id,
          proyectoId: event.context.proyecto_id,
        },
        extras: {
          referencia_oc_id,
          oc_codigo: loaded.oc.codigo,
        },
      });

      return {
        status: 'idempotent',
        oc_codigo: loaded.oc.codigo,
      };
    },
    apply: async (loaded, prisma) => {
      await prisma.ordenCompra.update({
        where: { id_orden: referencia_oc_id },
        data: { estado: OC_STATUS.CANCELADA },
      });

      return {
        status: 'applied',
        oc_codigo: loaded.oc!.codigo,
      };
    },
  });

  if (result.status === 'applied') {
    logTerminalState({
      terminalState: 'applied',
      actions: {
        notFound: 'compras.event.finanzas.fondos_liberados.oc_not_found',
        idempotent: 'compras.event.finanzas.fondos_liberados.idempotent',
        applied: 'compras.event.finanzas.fondos_liberados.applied',
      },
      context: {
        eventType: event.event_type,
        correlationId: event.context.correlation_id,
        tenantId: event.context.tenant_id,
        proyectoId: event.context.proyecto_id,
      },
      extras: {
        referencia_oc_id,
        oc_codigo: result.oc_codigo,
      },
    });
  }
}

export async function handlePresupuestoInsuficienteEvent(event: BocamEvent): Promise<void> {
  const {
    referencia_oc_id,
    referencia_oc_codigo,
    presupuesto_id,
  } = event.payload as {
    referencia_oc_id?: string;
    referencia_oc_codigo?: string;
    presupuesto_id?: string;
  };

  if (!referencia_oc_id || !referencia_oc_codigo || !presupuesto_id) {
    console.error(JSON.stringify({
      action: 'compras.event.finanzas.presupuesto_insuficiente.invalid_payload',
      event_type: event.event_type,
      correlation_id: event.context.correlation_id,
      tenant_id: event.context.tenant_id,
      proyecto_id: event.context.proyecto_id,
      referencia_oc_id,
      presupuesto_id,
    }));
    return;
  }

  await createTenantContext(
    {
      tenantId: event.context.tenant_id,
      proyectoId: event.context.proyecto_id,
      userId: event.context.user_id,
    },
    async (prisma) => {
      const oc = await prisma.ordenCompra.findUnique({
        where: { id_orden: referencia_oc_id },
      });

      if (!oc) {
        logTerminalState({
          terminalState: 'not_found',
          actions: {
            notFound: 'compras.event.finanzas.presupuesto_insuficiente.oc_not_found',
            idempotent: 'compras.event.finanzas.presupuesto_insuficiente.idempotent',
            applied: 'compras.event.finanzas.presupuesto_insuficiente.applied',
          },
          context: {
            eventType: event.event_type,
            correlationId: event.context.correlation_id,
            tenantId: event.context.tenant_id,
            proyectoId: event.context.proyecto_id,
          },
          extras: {
            referencia_oc_id,
          },
        });
        return;
      }

      if (oc.estado === OC_STATUS.ERROR_FINANZAS) {
        logTerminalState({
          terminalState: 'idempotent',
          actions: {
            notFound: 'compras.event.finanzas.presupuesto_insuficiente.oc_not_found',
            idempotent: 'compras.event.finanzas.presupuesto_insuficiente.idempotent',
            applied: 'compras.event.finanzas.presupuesto_insuficiente.applied',
          },
          context: {
            eventType: event.event_type,
            correlationId: event.context.correlation_id,
            tenantId: event.context.tenant_id,
            proyectoId: event.context.proyecto_id,
          },
          extras: {
            referencia_oc_id,
            oc_codigo: oc.codigo,
          },
        });
        return;
      }

      await prisma.ordenCompra.update({
        where: { id_orden: referencia_oc_id },
        data: { estado: OC_STATUS.ERROR_FINANZAS },
      });

      // ── [ALERTA] 3.1 Persistir alerta en BD (mismo contexto RLS, idempotente) ──────
      await prisma.alertaOcError.upsert({
        where: { tenant_id_oc_id: { tenant_id: event.context.tenant_id, oc_id: referencia_oc_id } },
        update: {
          error_message: 'Presupuesto insuficiente — evento asíncrono de Finanzas',
          updated_at: new Date(),
        },
        create: {
          tenant_id:     event.context.tenant_id,
          proyecto_id:   event.context.proyecto_id,
          oc_id:         referencia_oc_id,
          oc_codigo:     referencia_oc_codigo,
          presupuesto_id: presupuesto_id ?? null,
          error_message: 'Presupuesto insuficiente — evento asíncrono de Finanzas',
        },
      });
      console.log(JSON.stringify({
        action:     'compras.oc_error_finanzas.alerta_creada',
        path:       'async',
        oc_id:      referencia_oc_id,
        tenant_id:  event.context.tenant_id,
        proyecto_id: event.context.proyecto_id,
      }));

      logTerminalState({
        terminalState: 'applied',
        actions: {
          notFound: 'compras.event.finanzas.presupuesto_insuficiente.oc_not_found',
          idempotent: 'compras.event.finanzas.presupuesto_insuficiente.idempotent',
          applied: 'compras.event.finanzas.presupuesto_insuficiente.applied',
        },
        context: {
          eventType:     event.event_type,
          correlationId: event.context.correlation_id,
          tenantId:      event.context.tenant_id,
          proyectoId:    event.context.proyecto_id,
        },
        extras: {
          referencia_oc_id,
          oc_codigo: oc.codigo,
        },
      });
    }
  );

  // ── [ALERTA] 3.2 Publicar evento al bus (best-effort, fuera del contexto prisma) ──
  try {
    await eventBus.publish({
      event_type: 'compras.oc_error_finanzas',
      timestamp:  new Date().toISOString(),
      context: {
        tenant_id:      event.context.tenant_id,
        proyecto_id:    event.context.proyecto_id,
        user_id:        event.context.user_id,
        correlation_id: event.context.correlation_id,
      },
      payload: {
        oc_id:         referencia_oc_id,
        oc_codigo:     referencia_oc_codigo,
        presupuesto_id: presupuesto_id ?? null,
        error_message: 'Presupuesto insuficiente — evento asíncrono de Finanzas',
      },
    });
  } catch (busError: any) {
    console.warn(JSON.stringify({
      action:    'compras.oc_error_finanzas.bus_offline',
      path:      'async',
      oc_id:     referencia_oc_id,
      bus_error: busError.message,
    }));
  }
}

// ── Alertas de Integridad Financiera ─────────────────────────────────────────
// 4.1 Endpoint de consulta de OCs en ERROR_FINANZAS para procuración.
// Solo roles con capacidad de intervención financiera pueden verlas.

app.get('/api/v1/compras/alertas/oc-error',
  requireRoles('admin', 'superintendent', 'procurement'),
  async (req: Request, res: Response) => {
    try {
      // 4.2 Extraer contexto del JWT (nunca del body)
      const { tenantId, proyectoId, userId } = req.securityContext;

      const data = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => prisma.alertaOcError.findMany({
          where:    { resuelta: false, tenant_id: tenantId, proyecto_id: proyectoId },
          orderBy:  { created_at: 'desc' },
        })
      );

      // 4.3 Respuesta estándar + log de observabilidad
      logInfo(req, 'compras', 'compras.alertas.oc_error.listadas',
        'Alertas de OC en ERROR_FINANZAS consultadas', { total: data.length });

      res.json({ success: true, data });
    } catch (error: any) {
      logError(req, 'compras', 'compras.alertas.oc_error.error',
        'Error al consultar alertas de OC en error', { error_message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// ─── Handler: finanzas.oc_pagada_total ───────────────────────────────────────
export async function handleOcPagadaTotalEvent(event: BocamEvent): Promise<void> {
  const { oc_id, pago_id } = event.payload as { oc_id?: string; pago_id?: string };
  if (!oc_id) return;
  try {
    await createTenantContext(
      { tenantId: event.context.tenant_id, proyectoId: event.context.proyecto_id, userId: event.context.user_id },
      async (prisma) => {
        const oc = await prisma.ordenCompra.findUnique({ where: { id_orden: oc_id } });
        if (!oc) return;
        await prisma.ordenCompra.update({
          where: { id_orden: oc_id },
          data: { estado_pago: 'PAGADA' },
        });
        console.log(JSON.stringify({ action: 'compras.event.oc_pagada_total.applied', oc_id, pago_id }));
      }
    );
  } catch (err: any) {
    console.error(JSON.stringify({ action: 'compras.event.oc_pagada_total.error', oc_id, error: err.message }));
  }
}

// ─── Handler: finanzas.oc_pagada_parcial ─────────────────────────────────────
export async function handleOcPagadaParcialEvent(event: BocamEvent): Promise<void> {
  const { oc_id, pago_id } = event.payload as { oc_id?: string; pago_id?: string };
  if (!oc_id) return;
  try {
    await createTenantContext(
      { tenantId: event.context.tenant_id, proyectoId: event.context.proyecto_id, userId: event.context.user_id },
      async (prisma) => {
        const oc = await prisma.ordenCompra.findUnique({ where: { id_orden: oc_id } });
        if (!oc) return;
        await prisma.ordenCompra.update({
          where: { id_orden: oc_id },
          data: { estado_pago: 'PAGO_PARCIAL' },
        });
        console.log(JSON.stringify({ action: 'compras.event.oc_pagada_parcial.applied', oc_id, pago_id }));
      }
    );
  } catch (err: any) {
    console.error(JSON.stringify({ action: 'compras.event.oc_pagada_parcial.error', oc_id, error: err.message }));
  }
}

// ─── Handler: gerencia_tecnica.transferencia_partida_aprobada ────────────────
// Re-evalúa las reqs en PENDIENTE_TRANSFERENCIA cuando se aprueba una transferencia
// que restaura saldo en la partida destino.
export async function handleTransferenciaPartidaAprobadaEvent(event: BocamEvent): Promise<void> {
  const payload = event.payload as {
    concepto_destino_id?: string;
    concepto_destino_clave?: string;
    monto?: number;
  };
  const { concepto_destino_id } = payload;
  if (!concepto_destino_id) return;

  const ctx = { tenantId: event.context.tenant_id, proyectoId: event.context.proyecto_id, userId: event.context.user_id };

  try {
    // Verificar saldo actual en GT
    let montoDisponible = 0;
    try {
      const saldoResp = await axios.get(`${GT_URL}/partidas/${concepto_destino_id}/saldo`, {
        headers: { 'x-tenant-id': ctx.tenantId, 'x-proyecto-id': ctx.proyectoId },
        timeout: 3000,
      });
      montoDisponible = saldoResp.data?.data?.monto_disponible ?? 0;
    } catch (_) {
      console.warn('[Compras] GT timeout al verificar saldo tras transferencia');
      return;
    }

    if (montoDisponible <= 0) return;

    // Buscar reqs bloqueadas para esta partida
    const reqsBloqueadas = await createTenantContext(ctx, async (prisma) =>
      prisma.requisicion.findMany({
        where: { tenant_id: ctx.tenantId, proyecto_id: ctx.proyectoId, concepto_id: concepto_destino_id, estado: 'PENDIENTE_TRANSFERENCIA' },
        include: { items: true },
        orderBy: { fecha_solicitud: 'asc' },
      })
    );

    if (reqsBloqueadas.length === 0) return;

    let saldoRestante = montoDisponible;
    for (const reqBloq of reqsBloqueadas as any[]) {
      const montoReq = reqBloq.items?.reduce((acc: number, item: any) => acc + (Number(item.cantidad) * (item.precio_unitario ? Number(item.precio_unitario) : 0)), 0) ?? 0;

      if (montoReq <= saldoRestante || montoReq === 0) {
        await createTenantContext(ctx, async (prisma) =>
          prisma.requisicion.update({ where: { id_requisicion: reqBloq.id_requisicion }, data: { estado: 'APROBADA' } })
        );
        saldoRestante -= montoReq;
        console.log(JSON.stringify({
          action: 'compras.event.transferencia_partida.req_desbloqueada',
          req_id: reqBloq.id_requisicion,
          codigo: reqBloq.codigo,
          concepto_destino_id,
        }));
      }
    }
  } catch (err: any) {
    console.error(JSON.stringify({ action: 'compras.event.transferencia_partida.error', concepto_destino_id, error: err.message }));
  }
}

setupSentryExpressHandler(app);

export async function startServer() {
  return app.listen(PORT, async () => {
  console.log('----------------------------------------------------');
  console.log(` MODULO COMPRAS: ACTIVO (Puerto ${PORT})`);
  console.log(' Autenticación: JWT REAL (Bearer Token)');
  console.log('----------------------------------------------------');

  await eventBus.connect();
  await eventBus.subscribe('finanzas.fondos_comprometidos', handleFondosComprometidosEvent);
  await eventBus.subscribe('finanzas.fondos_liberados', handleFondosLiberadosEvent);
  await eventBus.subscribe('finanzas.presupuesto_insuficiente', handlePresupuestoInsuficienteEvent);
  await eventBus.subscribe('finanzas.oc_pagada_total', handleOcPagadaTotalEvent);
  await eventBus.subscribe('finanzas.oc_pagada_parcial', handleOcPagadaParcialEvent);
  await eventBus.subscribe('gerencia_tecnica.transferencia_partida_aprobada', handleTransferenciaPartidaAprobadaEvent);
  console.log('[Compras] Eventos: finanzas.fondos_*, finanzas.oc_pagada_*, gerencia_tecnica.transferencia_partida_aprobada');
  });
}

if (require.main === module) {
  void startServer();
}

// ── Almacén separado → microservicio apps/almacen puerto 3012 ────────────────
// Los endpoints /api/v1/compras/almacen/* han sido eliminados.
// Usar /api/v1/almacen/* (microservicio independiente).

// ── comparativa-evaluacion-v2: Selección, Firma, Revisiones y Aclaraciones ────

// 8.2 PUT seleccion — Residente actualiza primera/segunda opción de proveedor
app.put('/api/v1/compras/comparativas/:id/seleccion',
  requireRoles('resident', 'residencia', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { primera_opcion_proveedor_id, segunda_opcion_proveedor_id } = req.body as {
        primera_opcion_proveedor_id: string;
        segunda_opcion_proveedor_id?: string;
      };

      if (!primera_opcion_proveedor_id) {
        return res.status(400).json({ success: false, message: 'primera_opcion_proveedor_id es requerido.' });
      }

      const data = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          const cuadro = await prisma.cuadroComparativo.findUnique({ where: { id_cuadro: id } });
          if (!cuadro) return res.status(404).json({ success: false, message: 'Cuadro comparativo no encontrado.' });
          if (cuadro.estado === 'LOCKED' || cuadro.estado === 'FIRMADO_BLOQUEADO') {
            return res.status(403).json({ success: false, message: 'COMPARATIVA_FIRMADO_BLOQUEADO: No se puede modificar un cuadro firmado.' });
          }
          if (cuadro.estado !== 'EN_EVALUACION_TECNICA') {
            return res.status(400).json({ success: false, message: `Estado inválido para selección: ${cuadro.estado}` });
          }

          // Validar que el proveedor existe en los detalles de este cuadro
          const proveedoresEnCuadro = await prisma.comparativaDetalle.findMany({
            where: { cuadro_id: id, tenant_id: tenantId },
            select: { proveedor_id: true },
            distinct: ['proveedor_id'],
          });
          const proveedorIds = new Set(proveedoresEnCuadro.map(d => d.proveedor_id));
          if (!proveedorIds.has(primera_opcion_proveedor_id)) {
            return res.status(400).json({ success: false, message: 'primera_opcion_proveedor_id no participa en este cuadro.' });
          }

          return prisma.cuadroComparativo.update({
            where: { id_cuadro: id },
            data: {
              primera_opcion_proveedor_id,
              segunda_opcion_proveedor_id: segunda_opcion_proveedor_id ?? null,
            },
            include: { detalles: { include: { proveedor: true } } },
          });
        }
      );

      if (res.headersSent) return;
      logInfo(req, 'compras', 'compras.comparativa.seleccion_guardada', 'Selección de proveedor guardada', { cuadro_id: id, primera_opcion_proveedor_id });
      res.json({ success: true, data });
    } catch (error: any) {
      logError(req, 'compras', 'compras.comparativa.seleccion.error', 'Error al guardar selección', { error_message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// 5.1 POST firmar — Residente firma y bloquea el cuadro (FIRMADO_BLOQUEADO)
app.post('/api/v1/compras/comparativas/:id/firmar',
  requireRoles('resident', 'residencia', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { veredicto_residente, proveedores_sugeridos } = req.body as {
        veredicto_residente?: string;
        proveedores_sugeridos?: string[];
      };

      if (!veredicto_residente?.trim()) {
        return res.status(400).json({ success: false, message: 'VEREDICTO_REQUERIDO: Debes escribir el veredicto técnico antes de firmar.' });
      }
      if (!proveedores_sugeridos || proveedores_sugeridos.length === 0) {
        return res.status(400).json({ success: false, message: 'PROVEEDOR_SUGERIDO_REQUERIDO: Debes seleccionar al menos un proveedor recomendado antes de firmar.' });
      }

      const data = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          const cuadro = await prisma.cuadroComparativo.findUnique({
            where: { id_cuadro: id },
            include: { detalles: true },
          });

          if (!cuadro) return res.status(404).json({ success: false, message: 'Cuadro comparativo no encontrado.' });

          if (cuadro.estado === 'FIRMADO_BLOQUEADO') {
            return res.status(400).json({ success: false, message: 'El cuadro ya está firmado y bloqueado.' });
          }

          if (cuadro.estado !== 'EN_EVALUACION_TECNICA') {
            return res.status(400).json({
              success: false,
              message: `ESTADO_INVALIDO_FIRMA: El cuadro debe estar en EN_EVALUACION_TECNICA. Estado actual: ${cuadro.estado}`,
            });
          }

          const conPendiente = cuadro.detalles.some(d => d.evaluacion_tecnica === 'PENDIENTE');
          if (conPendiente) {
            return res.status(400).json({
              success: false,
              message: 'EVALUACION_INCOMPLETA: Hay renglones sin evaluar (PENDIENTE). Evalúa todos los renglones antes de firmar.',
            });
          }

          const conPregunta = cuadro.detalles.some(d => d.evaluacion_tecnica === '?');
          if (conPregunta) {
            return res.status(400).json({
              success: false,
              message: 'EVALUACION_CON_PREGUNTAS_ABIERTAS: Hay renglones con preguntas pendientes (?). Usa "Enviar preguntas" para crear una nueva revisión.',
            });
          }

          if (!cuadro.primera_opcion_proveedor_id) {
            return res.status(400).json({
              success: false,
              message: 'PRIMERA_OPCION_REQUERIDA: Debes seleccionar la primera opción de proveedor antes de firmar.',
            });
          }

          // Validar que la primera opción no tenga renglones NC ni ?
          const detallesPrimeraOpcion = cuadro.detalles.filter(
            d => d.proveedor_id === cuadro.primera_opcion_proveedor_id
          );
          const primeraOpcionConNC = detallesPrimeraOpcion.some(
            d => d.evaluacion_tecnica === 'NC' || d.evaluacion_tecnica === '?'
          );
          if (primeraOpcionConNC) {
            return res.status(400).json({
              success: false,
              message: 'SELECCION_INVALIDA_NC: La primera opción de proveedor tiene renglones NC o ?. Solo puede ser primera opción un proveedor con todos sus renglones en C o DA.',
            });
          }

          const cuadroFirmado = await prisma.cuadroComparativo.update({
            where: { id_cuadro: id },
            data: {
              estado: 'FIRMADO_BLOQUEADO',
              firmado_por: userId,
              fecha_firma: new Date(),
              evaluacion_residente_id: userId,
              fecha_evaluacion_tecnica: new Date(),
              veredicto_residente: veredicto_residente.trim(),
              proveedores_sugeridos: JSON.stringify(proveedores_sugeridos),
            },
            include: { detalles: { include: { proveedor: true } } },
          });

          const resumen = {
            total: cuadro.detalles.length,
            c: cuadro.detalles.filter(d => d.evaluacion_tecnica === 'C').length,
            nc: cuadro.detalles.filter(d => d.evaluacion_tecnica === 'NC').length,
            da: cuadro.detalles.filter(d => d.evaluacion_tecnica === 'DA').length,
          };

          logInfo(req, 'compras', 'compras.comparativa.firmada', 'Cuadro comparativo firmado y bloqueado', {
            cuadro_id: id,
            codigo: cuadro.codigo,
            requisicion_id: cuadro.requisicion_id,
            firmado_por: userId,
            primera_opcion_proveedor_id: cuadro.primera_opcion_proveedor_id,
            resumen_evaluacion: resumen,
          });

          return cuadroFirmado;
        }
      );

      if (res.headersSent) return;
      res.json({ success: true, data });
    } catch (error: any) {
      logError(req, 'compras', 'compras.comparativa.firmar.error', 'Error al firmar cuadro comparativo', { error_message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// 6.1 POST nueva-revision — Clonar cuadro con siguiente letra de revisión
app.post('/api/v1/compras/comparativas/:id/nueva-revision',
  requireRoles('procurement', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId, proyectoId, userId } = req.securityContext;

      const data = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          const cuadroOriginal = await prisma.cuadroComparativo.findUnique({
            where: { id_cuadro: id },
            include: {
              detalles: true,
              lineas: true,
            },
          });

          if (!cuadroOriginal) return res.status(404).json({ success: false, message: 'Cuadro comparativo no encontrado.' });

          if (cuadroOriginal.estado === 'FIRMADO_BLOQUEADO') {
            return res.status(403).json({ success: false, message: 'COMPARATIVA_FIRMADO_BLOQUEADO: El cuadro está firmado y bloqueado. Solo el administrador puede desbloquearlo.' });
          }
          const ESTADOS_VALIDOS = new Set(['EN_EVALUACION_TECNICA', 'LOCKED']);
          if (!ESTADOS_VALIDOS.has(cuadroOriginal.estado)) {
            return res.status(400).json({
              success: false,
              message: `Solo se puede crear nueva revisión desde EN_EVALUACION_TECNICA o LOCKED. Estado actual: ${cuadroOriginal.estado}`,
            });
          }

          // Calcular siguiente letra de revisión (A→B, B→C, etc.)
          const revActual = cuadroOriginal.revision || 'A';
          const siguienteRev = String.fromCharCode(revActual.charCodeAt(0) + 1);
          const codigoNuevo = cuadroOriginal.codigo.replace(`-Rev${revActual}`, '') + `-Rev${siguienteRev}`;

          const [cuadroClonado] = await prisma.$transaction([
            // 1. Marcar el original como SUPERSEDIDO
            prisma.cuadroComparativo.update({
              where: { id_cuadro: id },
              data: { estado: 'SUPERSEDIDO' },
            }),
          ]);

          // 2. Crear el nuevo cuadro clonado
          const nuevoCuadro = await prisma.cuadroComparativo.create({
            data: {
              tenant_id: tenantId,
              proyecto_id: proyectoId,
              requisicion_id: cuadroOriginal.requisicion_id,
              codigo: codigoNuevo,
              estado: 'BORRADOR',
              notas: cuadroOriginal.notas,
              revision: siguienteRev,
              revision_padre_id: id,
            },
          });

          // 3. Clonar detalles con evaluaciones reset a PENDIENTE
          if (cuadroOriginal.detalles.length > 0) {
            await prisma.comparativaDetalle.createMany({
              data: cuadroOriginal.detalles.map(d => ({
                tenant_id: d.tenant_id,
                proyecto_id: d.proyecto_id,
                cuadro_id: nuevoCuadro.id_cuadro,
                proveedor_id: d.proveedor_id,
                insumo_id: d.insumo_id,
                precio_ofertado: d.precio_ofertado,
                tiempo_entrega: d.tiempo_entrega,
                es_ganador: false,
                evaluacion_tecnica: 'PENDIENTE',
                comentario_tecnico: null,
                valor_ofrecido_spec: d.valor_ofrecido_spec,
                aprobacion_gt: 'PENDIENTE',
                comentario_gt: null,
              })),
            });
          }

          // 4. Clonar líneas de especificación
          if (cuadroOriginal.lineas.length > 0) {
            await prisma.comparativaLinea.createMany({
              data: cuadroOriginal.lineas.map(l => ({
                tenant_id: l.tenant_id,
                proyecto_id: l.proyecto_id,
                cuadro_id: nuevoCuadro.id_cuadro,
                insumo_id: l.insumo_id,
                marca_modelo_ref: l.marca_modelo_ref,
                especificaciones_requeridas: l.especificaciones_requeridas,
              })),
            });
          }

          logInfo(req, 'compras', 'compras.comparativa.nueva_revision', 'Nueva revisión de cuadro comparativo creada', {
            cuadro_original_id: id,
            nuevo_cuadro_id: nuevoCuadro.id_cuadro,
            revision_anterior: revActual,
            nueva_revision: siguienteRev,
          });

          return prisma.cuadroComparativo.findUnique({
            where: { id_cuadro: nuevoCuadro.id_cuadro },
            include: { detalles: { include: { proveedor: true } } },
          });
        }
      );

      if (res.headersSent) return;
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      logError(req, 'compras', 'compras.comparativa.nueva_revision.error', 'Error al crear nueva revisión', { error_message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// 7.1 POST aclaraciones — Crear aclaración en una celda del cuadro
app.post('/api/v1/compras/comparativas/:id/aclaraciones',
  requireRoles('procurement', 'resident', 'residencia', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { insumo_id, proveedor_id, tipo, mensaje } = req.body as {
        insumo_id: string;
        proveedor_id: string;
        tipo: 'PREGUNTA' | 'RESPUESTA';
        mensaje: string;
      };

      if (!insumo_id || !proveedor_id || !tipo || !mensaje?.trim()) {
        return res.status(400).json({ success: false, message: 'insumo_id, proveedor_id, tipo y mensaje son requeridos.' });
      }
      if (!['PREGUNTA', 'RESPUESTA'].includes(tipo)) {
        return res.status(400).json({ success: false, message: 'tipo debe ser PREGUNTA o RESPUESTA.' });
      }

      const data = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          const cuadro = await prisma.cuadroComparativo.findUnique({
            where: { id_cuadro: id },
            select: { estado: true },
          });
          if (!cuadro) return res.status(404).json({ success: false, message: 'Cuadro comparativo no encontrado.' });

          const ESTADOS_BLOQUEADOS = new Set(['LOCKED', 'FIRMADO_BLOQUEADO', 'SUPERSEDIDO', 'CERRADO']);
          if (ESTADOS_BLOQUEADOS.has(cuadro.estado)) {
            return res.status(403).json({
              success: false,
              message: `No se pueden agregar aclaraciones en un cuadro con estado ${cuadro.estado}.`,
            });
          }

          // Validar que el par (insumo_id, proveedor_id) existe en este cuadro
          const detalle = await prisma.comparativaDetalle.findFirst({
            where: { cuadro_id: id, insumo_id, proveedor_id, tenant_id: tenantId },
          });
          if (!detalle) {
            return res.status(404).json({ success: false, message: 'No existe detalle para el par (insumo_id, proveedor_id) en este cuadro.' });
          }

          return prisma.aclaracionComparativa.create({
            data: {
              tenant_id: tenantId,
              proyecto_id: proyectoId,
              cuadro_id: id,
              insumo_id,
              proveedor_id,
              autor_id: userId,
              tipo,
              mensaje: mensaje.trim(),
              resuelta: false,
            },
          });
        }
      );

      if (res.headersSent) return;
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      logError(req, 'compras', 'compras.comparativa.aclaracion.crear.error', 'Error al crear aclaración', { error_message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// 7.2 GET aclaraciones — Obtener aclaraciones de un cuadro
app.get('/api/v1/compras/comparativas/:id/aclaraciones',
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId, proyectoId, userId } = req.securityContext;

      const data = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          const cuadro = await prisma.cuadroComparativo.findUnique({
            where: { id_cuadro: id },
            select: { id_cuadro: true },
          });
          if (!cuadro) return null;

          return prisma.aclaracionComparativa.findMany({
            where: { cuadro_id: id, tenant_id: tenantId },
            orderBy: { created_at: 'asc' },
          });
        }
      );

      if (data === null) return res.status(404).json({ success: false, message: 'Cuadro comparativo no encontrado.' });
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// 7.3 PATCH aclaraciones/:aid — Marcar aclaración como resuelta
app.patch('/api/v1/compras/comparativas/:id/aclaraciones/:aid',
  requireRoles('procurement', 'resident', 'residencia', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { id, aid } = req.params;
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { resuelta } = req.body as { resuelta: boolean };

      if (typeof resuelta !== 'boolean') {
        return res.status(400).json({ success: false, message: 'El campo "resuelta" debe ser boolean.' });
      }

      const data = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          const aclaracion = await prisma.aclaracionComparativa.findUnique({
            where: { id_aclaracion: aid },
          });

          if (!aclaracion || aclaracion.cuadro_id !== id || aclaracion.tenant_id !== tenantId) {
            return res.status(404).json({ success: false, message: 'Aclaración no encontrada.' });
          }

          const cuadro = await prisma.cuadroComparativo.findUnique({ where: { id_cuadro: id }, select: { estado: true } });
          if (cuadro?.estado === 'FIRMADO_BLOQUEADO') {
            return res.status(403).json({ success: false, message: 'COMPARATIVA_FIRMADO_BLOQUEADO: El cuadro está firmado y bloqueado.' });
          }

          const roles: string[] = (req as any).securityContext?.roles ?? [];
          const esAdmin = roles.includes('admin');
          if (!esAdmin && aclaracion.autor_id !== userId) {
            return res.status(403).json({ success: false, message: 'Solo el autor o un admin puede modificar esta aclaración.' });
          }

          return prisma.aclaracionComparativa.update({
            where: { id_aclaracion: aid },
            data: { resuelta },
          });
        }
      );

      if (res.headersSent) return;
      res.json({ success: true, data });
    } catch (error: any) {
      logError(req, 'compras', 'compras.comparativa.aclaracion.patch.error', 'Error al actualizar aclaración', { error_message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// ── Anotaciones por especificación [spec × proveedor] ────────────────────────

app.post(
  '/api/v1/compras/comparativas/:id/anotaciones-spec',
  requireRoles('resident', 'residencia', 'procurement', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { especificacion_id, proveedor_id, tipo, texto } = req.body as {
        especificacion_id: string;
        proveedor_id: string;
        tipo: 'pregunta' | 'respuesta';
        texto: string;
      };

      if (!especificacion_id || !proveedor_id || !['pregunta', 'respuesta'].includes(tipo) || !texto?.trim()) {
        return res.status(400).json({ success: false, message: 'especificacion_id, proveedor_id, tipo (pregunta|respuesta) y texto son obligatorios.' });
      }

      const data = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          const cuadro = await prisma.cuadroComparativo.findUnique({
            where: { id_cuadro: id },
            select: { estado: true, tenant_id: true },
          });
          if (!cuadro || cuadro.tenant_id !== tenantId) {
            return { notFound: true };
          }
          if (['LOCKED', 'SUPERSEDIDO', 'CERRADO'].includes(cuadro.estado)) {
            return { locked: true };
          }

          return prisma.anotacionEspecificacion.create({
            data: {
              tenant_id: tenantId,
              cuadro_id: id,
              especificacion_id,
              proveedor_id,
              tipo,
              texto: texto.trim(),
              creado_por: userId,
            },
          });
        }
      );

      if ((data as any).notFound) return res.status(404).json({ success: false, message: 'Cuadro comparativo no encontrado.' });
      if ((data as any).locked) return res.status(403).json({ success: false, message: 'El cuadro está bloqueado y no admite nuevas anotaciones.' });

      res.status(201).json({ success: true, data });
    } catch (error: any) {
      logError(req, 'compras', 'compras.anotacion_spec.crear.error', 'Error al crear anotación de especificación', { error_message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// ── POST revision-con-preguntas — Residente guarda eval con "?" y crea revisión ──
app.post('/api/v1/compras/comparativas/:id/revision-con-preguntas',
  requireRoles('resident', 'residencia', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { evaluaciones } = req.body as {
        evaluaciones: {
          detalle_id: string;
          evaluacion_tecnica: string;
          comentario_tecnico?: string;
          pregunta_residente?: string;
        }[];
      };

      if (!Array.isArray(evaluaciones) || evaluaciones.length === 0) {
        return res.status(400).json({ success: false, message: 'Se requiere el array evaluaciones.' });
      }
      const tienePreguntas = evaluaciones.some(e => e.evaluacion_tecnica === '?');
      if (!tienePreguntas) {
        return res.status(400).json({ success: false, message: 'Debe haber al menos un renglón con "?" para crear una revisión con preguntas.' });
      }
      for (const ev of evaluaciones) {
        if (ev.evaluacion_tecnica === '?' && !ev.pregunta_residente?.trim()) {
          return res.status(400).json({ success: false, message: `El renglón ${ev.detalle_id} tiene "?" pero no tiene pregunta_residente.` });
        }
      }

      const data = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          const cuadroOriginal = await prisma.cuadroComparativo.findUnique({
            where: { id_cuadro: id },
            include: { detalles: true, lineas: true },
          });
          if (!cuadroOriginal) return res.status(404).json({ success: false, message: 'Cuadro comparativo no encontrado.' });
          if (cuadroOriginal.estado !== 'EN_EVALUACION_TECNICA') {
            return res.status(400).json({ success: false, message: `El cuadro debe estar en EN_EVALUACION_TECNICA. Estado actual: ${cuadroOriginal.estado}` });
          }

          // 1. Guardar evaluaciones en el cuadro original (incluyendo pregunta_residente)
          await Promise.all(evaluaciones.map(ev =>
            prisma.comparativaDetalle.update({
              where: { id_detalle: ev.detalle_id },
              data: {
                evaluacion_tecnica: ev.evaluacion_tecnica,
                comentario_tecnico: ev.comentario_tecnico?.trim() ?? null,
                pregunta_residente: ev.evaluacion_tecnica === '?' ? ev.pregunta_residente!.trim() : null,
              },
            })
          ));

          // 2. Calcular siguiente letra de revisión
          const revActual = cuadroOriginal.revision || 'A';
          const siguienteRev = String.fromCharCode(revActual.charCodeAt(0) + 1);
          const codigoNuevo = cuadroOriginal.codigo.replace(`-Rev${revActual}`, '') + `-Rev${siguienteRev}`;

          // 3. Transicionar el original a REVISION_SOLICITADA y crear nueva revisión
          await prisma.cuadroComparativo.update({ where: { id_cuadro: id }, data: { estado: 'REVISION_SOLICITADA' } });

          const nuevoCuadro = await prisma.cuadroComparativo.create({
            data: {
              tenant_id: tenantId,
              proyecto_id: proyectoId,
              requisicion_id: cuadroOriginal.requisicion_id,
              codigo: codigoNuevo,
              estado: 'BORRADOR',
              notas: cuadroOriginal.notas,
              revision: siguienteRev,
              revision_padre_id: id,
            },
          });

          // 4. Clonar detalles — copiar precios, heredar pregunta_residente para los "?", reset evaluaciones a PENDIENTE
          const detalleMap = new Map(cuadroOriginal.detalles.map(d => [d.id_detalle, d]));
          const evalMap = new Map(evaluaciones.map(e => [e.detalle_id, e]));
          if (cuadroOriginal.detalles.length > 0) {
            await prisma.comparativaDetalle.createMany({
              data: cuadroOriginal.detalles.map(d => {
                const evActual = evalMap.get(d.id_detalle);
                return {
                  tenant_id: d.tenant_id,
                  proyecto_id: d.proyecto_id,
                  cuadro_id: nuevoCuadro.id_cuadro,
                  proveedor_id: d.proveedor_id,
                  insumo_id: d.insumo_id,
                  precio_ofertado: d.precio_ofertado,
                  tiempo_entrega: d.tiempo_entrega,
                  es_ganador: false,
                  evaluacion_tecnica: 'PENDIENTE',
                  comentario_tecnico: null,
                  valor_ofrecido_spec: d.valor_ofrecido_spec,
                  // Heredar pregunta del Residente para que Compras pueda responder
                  pregunta_residente: evActual?.evaluacion_tecnica === '?' ? evActual.pregunta_residente?.trim() ?? null : null,
                  respuesta_compras: null,
                  aprobacion_gt: 'PENDIENTE',
                  comentario_gt: null,
                };
              }),
            });
          }

          // 5. Clonar líneas de especificación
          if (cuadroOriginal.lineas.length > 0) {
            await prisma.comparativaLinea.createMany({
              data: cuadroOriginal.lineas.map(l => ({
                tenant_id: l.tenant_id,
                proyecto_id: l.proyecto_id,
                cuadro_id: nuevoCuadro.id_cuadro,
                insumo_id: l.insumo_id,
                marca_modelo_ref: l.marca_modelo_ref,
                especificaciones_requeridas: l.especificaciones_requeridas,
                detalle_req_id: l.detalle_req_id,
              })),
            });
          }

          logInfo(req, 'compras', 'compras.comparativa.revision_con_preguntas', 'Revisión con preguntas creada por Residente', {
            cuadro_original_id: id,
            nuevo_cuadro_id: nuevoCuadro.id_cuadro,
            revision_nueva: siguienteRev,
            preguntas: evaluaciones.filter(e => e.evaluacion_tecnica === '?').length,
          });

          return { nueva_revision_id: nuevoCuadro.id_cuadro, revision_label: siguienteRev };
        }
      );

      if (res.headersSent) return;
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      logError(req, 'compras', 'compras.comparativa.revision_con_preguntas.error', 'Error al crear revisión con preguntas', { error_message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// ── PUT responder-preguntas — Compras responde las preguntas del Residente ────
app.put('/api/v1/compras/comparativas/:id/responder-preguntas',
  requireRoles('procurement', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { respuestas } = req.body as {
        respuestas: { detalle_id: string; respuesta_compras: string }[];
      };

      if (!Array.isArray(respuestas) || respuestas.length === 0) {
        return res.status(400).json({ success: false, message: 'Se requiere el array respuestas.' });
      }

      const data = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          const cuadro = await prisma.cuadroComparativo.findUnique({
            where: { id_cuadro: id },
            select: { estado: true, revision_padre_id: true, tenant_id: true },
          });
          if (!cuadro || cuadro.tenant_id !== tenantId) {
            return res.status(404).json({ success: false, message: 'Cuadro comparativo no encontrado.' });
          }
          if (cuadro.estado !== 'BORRADOR') {
            return res.status(400).json({ success: false, message: 'Solo se pueden responder preguntas en un cuadro en estado BORRADOR.' });
          }
          if (!cuadro.revision_padre_id) {
            return res.status(400).json({ success: false, message: 'Este cuadro no es una revisión — no tiene preguntas del Residente.' });
          }

          await Promise.all(respuestas.map(r =>
            prisma.comparativaDetalle.update({
              where: { id_detalle: r.detalle_id },
              data: { respuesta_compras: r.respuesta_compras?.trim() ?? null },
            })
          ));

          logInfo(req, 'compras', 'compras.comparativa.respuestas_guardadas', 'Compras respondió preguntas del Residente', { cuadro_id: id, respuestas: respuestas.length });
          return { cuadro_id: id, respuestas_guardadas: respuestas.length };
        }
      );

      if (res.headersSent) return;
      res.json({ success: true, data });
    } catch (error: any) {
      logError(req, 'compras', 'compras.comparativa.responder_preguntas.error', 'Error al guardar respuestas', { error_message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// ── PUT veredicto — Residente guarda veredicto y proveedores sugeridos ────────
app.put('/api/v1/compras/comparativas/:id/veredicto',
  requireRoles('resident', 'residencia', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { veredicto_residente, proveedores_sugeridos } = req.body as {
        veredicto_residente: string;
        proveedores_sugeridos: string[];
      };

      const data = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          const cuadro = await prisma.cuadroComparativo.findUnique({
            where: { id_cuadro: id },
            select: { estado: true, tenant_id: true },
          });
          if (!cuadro || cuadro.tenant_id !== tenantId) {
            return res.status(404).json({ success: false, message: 'Cuadro comparativo no encontrado.' });
          }
          if (cuadro.estado !== 'EN_EVALUACION_TECNICA') {
            return res.status(400).json({ success: false, message: `Solo se puede guardar veredicto en estado EN_EVALUACION_TECNICA. Estado actual: ${cuadro.estado}` });
          }

          return prisma.cuadroComparativo.update({
            where: { id_cuadro: id },
            data: {
              veredicto_residente: veredicto_residente?.trim() ?? null,
              proveedores_sugeridos: Array.isArray(proveedores_sugeridos) ? JSON.stringify(proveedores_sugeridos) : null,
            },
            select: { id_cuadro: true, veredicto_residente: true, proveedores_sugeridos: true },
          });
        }
      );

      if (res.headersSent) return;
      res.json({ success: true, data });
    } catch (error: any) {
      logError(req, 'compras', 'compras.comparativa.veredicto.error', 'Error al guardar veredicto', { error_message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// ── POST desbloquear — Admin desbloquea un cuadro FIRMADO_BLOQUEADO ───────────
app.post('/api/v1/compras/comparativas/:id/desbloquear',
  requireRoles('admin'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { justificacion } = req.body as { justificacion: string };

      if (!justificacion?.trim() || justificacion.trim().length < 10) {
        return res.status(400).json({ success: false, message: 'La justificación es obligatoria y debe tener al menos 10 caracteres.' });
      }

      const data = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          const cuadro = await prisma.cuadroComparativo.findUnique({
            where: { id_cuadro: id },
            select: { estado: true, tenant_id: true, codigo: true },
          });
          if (!cuadro || cuadro.tenant_id !== tenantId) {
            return res.status(404).json({ success: false, message: 'Cuadro comparativo no encontrado.' });
          }
          if (cuadro.estado !== 'FIRMADO_BLOQUEADO') {
            return res.status(400).json({ success: false, message: `Solo se puede desbloquear un cuadro en estado FIRMADO_BLOQUEADO. Estado actual: ${cuadro.estado}` });
          }

          const [cuadroActualizado] = await prisma.$transaction([
            prisma.cuadroComparativo.update({
              where: { id_cuadro: id },
              data: { estado: 'EN_EVALUACION_TECNICA' },
              include: { detalles: { include: { proveedor: true } } },
            }),
            prisma.auditoriaDesbloqueoComparativa.create({
              data: {
                tenant_id: tenantId,
                proyecto_id: proyectoId,
                cuadro_id: id,
                desbloqueado_por: userId,
                justificacion: justificacion.trim(),
              },
            }),
          ]);

          logInfo(req, 'compras', 'compras.comparativa.desbloqueada', 'Cuadro FIRMADO_BLOQUEADO desbloqueado por admin', {
            cuadro_id: id,
            codigo: cuadro.codigo,
            admin_id: userId,
            justificacion: justificacion.trim(),
          });

          return cuadroActualizado;
        }
      );

      if (res.headersSent) return;
      res.json({ success: true, data });
    } catch (error: any) {
      logError(req, 'compras', 'compras.comparativa.desbloquear.error', 'Error al desbloquear cuadro', { error_message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// ── GET auditoria-desbloqueos — Admin consulta historial de desbloqueos ───────
app.get('/api/v1/compras/comparativas/:id/auditoria-desbloqueos',
  requireRoles('admin'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId, proyectoId, userId } = req.securityContext;

      const data = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => prisma.auditoriaDesbloqueoComparativa.findMany({
          where: { cuadro_id: id, tenant_id: tenantId },
          orderBy: { timestamp_desbloqueo: 'desc' },
        })
      );

      res.json({ success: true, data });
    } catch (error: any) {
      logError(req, 'compras', 'compras.comparativa.auditoria_desbloqueos.error', 'Error al obtener historial de desbloqueos', { error_message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// ── Handler de errores Multer (debe ir al final, después de todas las rutas) ──
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err?.code === 'LIMIT_FILE_SIZE') {
    return void res.status(400).json({ success: false, message: `Archivo demasiado grande. Máximo ${DOCS_PROVEEDORES_MAX_SIZE_MB} MB.` });
  }
  if (err?.name === 'MulterError' || err?.message?.startsWith('Tipo de archivo no permitido')) {
    return void res.status(400).json({ success: false, message: err.message });
  }
  res.status(500).json({ success: false, message: err?.message ?? 'Error interno del servidor.' });
});
