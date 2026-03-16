import express, { Request, Response, NextFunction } from 'express';
import { createTenantContext } from './db';
import { v4 as uuidv4 } from 'uuid';

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

// Convertir Comparativa Ganadora en Orden de Compra (OC)
app.post('/api/v1/compras/comparativas/:id/convertir-oc', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId } = req.securityContext;
    
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

        // 2. Crear la Orden de Compra
        const totalOfertado = ganador.precio_ofertado.toNumber(); 
        
        const oc = await prisma.ordenCompra.create({
          data: {
            tenant_id: tenantId,
            proyecto_id: proyectoId,
            proveedor_id: ganador.proveedor_id,
            codigo: `OC-AUTO-${Date.now()}`,
            subtotal: totalOfertado,
            iva: totalOfertado * 0.16,
            total: totalOfertado * 1.16,
            estado: 'PENDIENTE',
            items: {
              create: [{
                tenant_id: tenantId,
                proyecto_id: proyectoId,
                insumo_id: ganador.insumo_id,
                cantidad: 1,
                precio_unitario: ganador.precio_ofertado,
                importe: totalOfertado
              }]
            }
          }
        });

        // 3. Cerrar la comparativa
        await prisma.cuadroComparativo.update({
          where: { id_cuadro: id },
          data: { estado: 'CERRADO' }
        });

        return oc;
      }
    );

    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- HEALTH CHECK (sin auth) ---
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', module: 'compras', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(` 🛒 MÓDULO COMPRAS: ACTIVO (Puerto ${PORT})`);
  console.log(` 🔐 Autenticación: JWT REAL (Bearer Token)`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});
