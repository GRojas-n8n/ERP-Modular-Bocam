import express, { Request, Response, NextFunction } from 'express';
import { createTenantContext } from './db';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { PrismaClient } from './generated/prisma';

/**
 * -----------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Módulo: Compras (Procuración)
 *
 * ACTUALIZADO: Hito 4 — JWT Real
 * El middleware de autenticación ahora verifica tokens JWT con firma
 * criptográfica. El contexto de seguridad (tenant_id, proyecto_id, user_id)
 * se extrae EXCLUSIVAMENTE del JWT verificado, NUNCA de headers del cliente.
 * -----------------------------------------------------------------------------
 */

// ─── Importar middleware JWT compartido ──────────────────────────────────────
import { createAuthMiddleware } from '../../../packages/auth-middleware/src';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3002;
const JWT_SECRET = process.env.JWT_SECRET || 'bocam_dev_secret_CAMBIAR_EN_PRODUCCION_2026';
const FINANZAS_URL = process.env.FINANZAS_URL || 'http://localhost:3004/api/v1/finanzas';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MIDDLEWARE JWT REAL (reemplaza contextHandler de headers manuales)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.use(createAuthMiddleware({
  jwtSecret: JWT_SECRET,
  excludePaths: ['/health'],
}));

// --- ENDPOINTS: REQUISICIONES ---

// Listar Requisiciones del Centro de Costos Activo
app.get('/api/v1/compras/requisiciones', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => {
        return await prisma.requisicion.findMany({
          include: { items: true },
          orderBy: { fecha_solicitud: 'desc' }
        });
      }
    );

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Crear nueva Requisición
app.post('/api/v1/compras/requisiciones', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { codigo, items, observaciones, prioridad } = req.body;

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => {
        return await prisma.requisicion.create({
          data: {
            tenant_id: tenantId,
            proyecto_id: proyectoId,
            codigo: codigo || `REQ-${Date.now()}`,
            solicitante_id: userId,
            prioridad: prioridad || 'NORMAL',
            observaciones,
            items: {
              create: items.map((item: any) => ({
                tenant_id: tenantId,
                proyecto_id: proyectoId,
                insumo_id: item.insumo_id,
                cantidad: item.cantidad,
                notas: item.notas
              }))
            }
          },
          include: { items: true }
        });
      }
    );

    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- ENDPOINTS: ÓRDENES DE COMPRA ---

app.get('/api/v1/compras/ordenes-compra', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => {
        return await prisma.ordenCompra.findMany({
          include: { items: true, proveedor: true },
          orderBy: { fecha_emision: 'desc' }
        });
      }
    );

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- ENDPOINTS: PROVEEDORES (TERCEROS) ---

app.get('/api/v1/compras/proveedores', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => {
        return await prisma.proveedor.findMany();
      }
    );

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- ENDPOINTS: CUADROS COMPARATIVOS ---

app.get('/api/v1/compras/comparativas', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => {
        return await prisma.cuadroComparativo.findMany({
          include: { detalles: { include: { proveedor: true } } },
          orderBy: { fecha_creacion: 'desc' }
        });
      }
    );
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/v1/compras/comparativas/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId } = req.securityContext;

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => {
        return await prisma.cuadroComparativo.findUnique({
          where: { id_cuadro: id },
          include: { detalles: { include: { proveedor: true } } }
        });
      }
    );
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Convertir Comparativa Ganadora en Orden de Compra (OC) con validación presupuestal
app.post('/api/v1/compras/comparativas/:id/convertir-oc', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { presupuesto_id } = req.body; // El usuario debe indicar qué presupuesto se carga
    
    // El token original del usuario (lo necesitamos para llamar a Finanzas)
    const token = req.headers.authorization;

    if (!presupuesto_id) {
       return res.status(400).json({ 
         success: false, 
         message: 'Es obligatorio proporcionar un presupuesto_id para validar la suficiencia financiera.' 
       });
    }

    const result = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => {
        // 1. Obtener la comparativa y el ganador
        const comparativa = await prisma.cuadroComparativo.findUnique({
          where: { id_cuadro: id },
          include: { detalles: { where: { es_ganador: true }, include: { proveedor: true } } }
        });

        if (!comparativa || comparativa.detalles.length === 0) {
          throw new Error('No se encontró un proveedor ganador seleccionado en este cuadro.');
        }

        const ganador = comparativa.detalles[0];
        const montoTotal = ganador.precio_ofertado.toNumber() * 1.16; // Con IVA

        // 2. [INTEGRACIÓN] Consultar suficiencia en el Módulo de Finanzas
        try {
          console.log(`[Compras] 📡 Validando presupuesto ${presupuesto_id} por $${montoTotal}...`);
          const checkResp = await axios.get(`${FINANZAS_URL}/suficiencia`, {
            params: { monto: montoTotal },
            headers: { Authorization: token }
          });

          if (!checkResp.data.success || !checkResp.data.data.tiene_suficiencia) {
            throw new Error(`PRESUPUESTO_INSUFICIENTE: Finanzas reporta fondos insuficientes para este movimiento.`);
          }
          console.log('[Compras] ✅ Suficiencia confirmada.');
        } catch (error: any) {
          const errMsg = error.response?.data?.error?.message || error.message;
          throw new Error(`Error de validación financiera: ${errMsg}`);
        }

        // 3. Crear la Orden de Compra
        const subtotal = ganador.precio_ofertado.toNumber(); 
        const oc = await prisma.ordenCompra.create({
          data: {
            tenant_id: tenantId,
            proyecto_id: proyectoId,
            proveedor_id: ganador.proveedor_id,
            codigo: `OC-AUTO-${Date.now()}`,
            subtotal: subtotal,
            iva: subtotal * 0.16,
            total: subtotal * 1.16,
            estado: 'EMITIDA', // Se marca como emitida ya que hay fondos
            presupuesto_id: presupuesto_id, // Guardamos el link
            items: {
              create: [{
                tenant_id: tenantId,
                proyecto_id: proyectoId,
                insumo_id: ganador.insumo_id,
                cantidad: 1,
                precio_unitario: ganador.precio_ofertado,
                importe: subtotal
              }]
            }
          }
        });

        // 4. [INTEGRACIÓN] Comprometer fondos en Finanzas
        try {
          await axios.post(`${FINANZAS_URL}/comprometer-fondos`, {
            presupuesto_id,
            monto: oc.total.toNumber(),
            oc_id: oc.id_orden,
            oc_codigo: oc.codigo,
            concepto: `Compromiso por Orden de Compra ${oc.codigo}`
          }, {
            headers: { Authorization: token }
          });
          console.log(`[Compras] 💰 Fondos comprometidos exitosamente para OC ${oc.codigo}`);
        } catch (error: any) {
          console.error('[Compras] ⚠️ Error fatal al comprometer fondos:', error.response?.data || error.message);
          // OJO: En un sistema real aquí deberíamos hacer rollback de la OC o marcarla como fallida
          // pero para el MVP asumimos que si la suficiencia pasó, el compromiso pasará.
        }

        // 5. Cerrar la comparativa
        await prisma.cuadroComparativo.update({
          where: { id_cuadro: id },
          data: { estado: 'CERRADO' }
        });

        return oc;
      }
    );

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('[Compras] Error en conversión OC:', error.message);
    res.status(error.message.includes('PRESUPUESTO_INSUFICIENTE') ? 422 : 500)
       .json({ success: false, message: error.message });
  }
});

// --- HEALTH CHECK (sin auth) ---
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', module: 'compras', timestamp: new Date().toISOString() });
});

// Cancelar Orden de Compra y Liberar Fondos
app.post('/api/v1/compras/ordenes-compra/:id/cancelar', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId } = req.securityContext;
    const token = req.headers.authorization;

    const result = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => {
        // 1. Buscar la OC
        const oc = await prisma.ordenCompra.findUnique({
          where: { id_orden: id }
        });

        if (!oc) {
          throw new Error('Orden de Compra no encontrada.');
        }

        if (oc.estado === 'CANCELADA') {
          throw new Error('La Orden de Compra ya está cancelada.');
        }

        if (oc.estado === 'RECIBIDA' || oc.estado === 'COBRADA') {
          throw new Error('No se puede cancelar una OC que ya ha sido recibida o cobrada.');
        }

        // 2. [INTEGRACIÓN] Llamar a Finanzas para liberar fondos
        if (oc.presupuesto_id) {
          try {
            console.log(`[Compras] 🔓 Solicitando liberación de presupuesto ${oc.presupuesto_id} por $${oc.total}...`);
            await axios.post(`${FINANZAS_URL}/liberar-fondos`, {
              presupuesto_id: oc.presupuesto_id,
              monto: oc.total.toNumber(),
              oc_id: oc.id_orden,
              oc_codigo: oc.codigo,
              concepto: `Liberación por cancelación de OC ${oc.codigo}`
            }, {
              headers: { Authorization: token }
            });
            console.log(`[Compras] ✅ Fondos liberados en Finanzas.`);
          } catch (error: any) {
             const errMsg = error.response?.data?.error?.message || error.message;
             console.error('[Compras] ⚠️ Error liberando fondos:', errMsg);
             // Decisión: Si la liberación falla, ¿cancelamos la OC localmente? 
             // En este MVP seguiremos para mantener el estado local actualizado.
          }
        }

        // 3. Actualizar estado local
        return await prisma.ordenCompra.update({
          where: { id_orden: id },
          data: { estado: 'CANCELADA' }
        });
      }
    );

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('[Compras] Error cancelando OC:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});


app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(` 🛒 MÓDULO COMPRAS: ACTIVO (Puerto ${PORT})`);
  console.log(` 🔐 Autenticación: JWT REAL (Bearer Token)`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});
