import express, { NextFunction, Request, Response } from 'express';
import { createTenantContext } from './db';
import { createEventBus } from '../../../packages/event-bus/src';
import { createAuthMiddleware, requireActiveProject, requireEnv, requireProjectAccess, requireRoles } from '../../../packages/auth-middleware/src';
import { createRateLimiter } from '../../../packages/rate-limiter/src';
import {
  buildEventContext,
  createObservabilityMiddleware,
  initSentry,
  logError,
  logInfo,
  setupSentryExpressHandler,
} from '../../../packages/observability/src';
import { buildTerminalHttpResponse } from '../../../packages/tenant-idempotency/src';

const eventBus = createEventBus('ventas');

export const app = express();
app.use(express.json());
app.use(createObservabilityMiddleware('ventas'));

const PORT = process.env.PORT_VENTAS || process.env.PORT || 3012;
const JWT_SECRET = requireEnv('JWT_SECRET');
initSentry(process.env.SENTRY_DSN || '', 'ventas');

app.use(
  createAuthMiddleware({
    jwtSecret: JWT_SECRET,
    excludePaths: ['/health'],
  })
);
app.use(createRateLimiter({ windowMs: 15 * 60 * 1000, max: 300, serviceName: 'ventas' }));
// `clientes` es catálogo por tenant (RLS solo por tenant_id, sin proyecto_id): se
// exime de proyecto activo/acceso a proyecto para poder listarlos y darlos de alta
// al crear un Centro de Costos (admin, gerencia_tecnica, control_proyectos), cuando
// aún no hay proyecto seleccionado. El resto de Ventas sí lo exige.
const requireVentasProjectAccess = requireProjectAccess();
const requireVentasProject = requireActiveProject();
app.use('/api/v1/ventas', (req: Request, res: Response, next: NextFunction) => {
  const path = req.originalUrl.split('?')[0].replace('/api/v1/ventas', '');
  if (path === '/clientes' || path.startsWith('/clientes/')) return next();
  requireVentasProjectAccess(req, res, (err?: unknown) => (err ? next(err) : requireVentasProject(req, res, next)));
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', module: 'ventas', timestamp: new Date().toISOString() });
});

app.get('/api/v1/ventas/clientes', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) =>
      prisma.cliente.findMany({ orderBy: { razon_social: 'asc' } })
    );
    res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ success: false, message });
  }
});

// Rango válido para codigo_cliente: 3 dígitos, '000' a '050' (ver
// openspec/changes/centro-costos-alta-formal). Se usa para ensamblar el
// código de 13 posiciones del Centro de Costos en apps/auth.
const CODIGO_CLIENTE_PATTERN = /^\d{3}$/;
const CODIGO_CLIENTE_MAX = 50;

// Límites = @db.VarChar(n) de prisma/schema.prisma (modelo Cliente).
function validarLongitudCliente(c: { rfc_tax_id?: string; razon_social?: string; email_contacto?: string | null; telefono?: string | null }): string | null {
  const limites: Array<[keyof typeof c, number]> = [['rfc_tax_id', 20], ['razon_social', 255], ['email_contacto', 100], ['telefono', 20]];
  for (const [campo, max] of limites) {
    const v = c[campo];
    if (typeof v === 'string' && v.length > max) return `${campo} no puede tener más de ${max} caracteres.`;
  }
  return null;
}

app.post('/api/v1/ventas/clientes', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { rfc_tax_id, razon_social, email_contacto, telefono, codigo_cliente } = req.body as {
      rfc_tax_id?: string; razon_social?: string; email_contacto?: string; telefono?: string; codigo_cliente?: string;
    };

    if (!rfc_tax_id?.trim() || !razon_social?.trim()) {
      return res.status(400).json({ success: false, message: 'rfc_tax_id y razon_social son obligatorios.' });
    }
    const errorLongitud = validarLongitudCliente({ rfc_tax_id, razon_social, email_contacto, telefono });
    if (errorLongitud) return res.status(400).json({ success: false, message: errorLongitud });

    if (codigo_cliente !== undefined && codigo_cliente !== null && codigo_cliente !== '') {
      if (!CODIGO_CLIENTE_PATTERN.test(codigo_cliente) || Number(codigo_cliente) > CODIGO_CLIENTE_MAX) {
        return res.status(400).json({ success: false, message: `codigo_cliente debe ser numérico de 3 dígitos entre "000" y "${String(CODIGO_CLIENTE_MAX).padStart(3, '0')}".` });
      }
    }

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      if (codigo_cliente) {
        const existente = await prisma.cliente.findFirst({ where: { tenant_id: tenantId, codigo_cliente } });
        if (existente) {
          return { conflict: true as const };
        }
      }
      const nuevo = await prisma.cliente.create({
        data: {
          tenant_id: tenantId,
          rfc_tax_id: rfc_tax_id.trim().toUpperCase(),
          razon_social: razon_social.trim(),
          email_contacto: email_contacto ?? null,
          telefono: telefono ?? null,
          codigo_cliente: codigo_cliente || null,
        },
      });
      return { conflict: false as const, cliente: nuevo };
    });

    if (data.conflict) {
      return res.status(409).json({ success: false, message: `Ya existe un cliente con codigo_cliente "${codigo_cliente}" en este tenant.` });
    }

    logInfo(req, 'ventas', 'ventas.cliente.creado', `Cliente ${data.cliente.razon_social} creado`, { cliente_id: data.cliente.id_cliente });
    res.status(201).json({ success: true, data: data.cliente });
  } catch (error: unknown) {
    if ((error as { code?: string })?.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'Ya existe un cliente con ese RFC o código de cliente en este tenant.' });
    }
    const message = error instanceof Error ? error.message : 'Error desconocido';
    logError(req, 'ventas', 'ventas.cliente.crear.error', message, {});
    res.status(500).json({ success: false, message: 'Error al crear el cliente.' });
  }
});

// Edición de datos guardados del cliente (p. ej. reemplazar un RFC provisional
// por el real). Solo admin, igual que la importación masiva.
app.put('/api/v1/ventas/clientes/:id', requireRoles('admin'), async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { rfc_tax_id, razon_social, email_contacto, telefono, codigo_cliente, estatus } = req.body as {
      rfc_tax_id?: string; razon_social?: string; email_contacto?: string | null; telefono?: string | null;
      codigo_cliente?: string | null; estatus?: string;
    };

    if (rfc_tax_id !== undefined && !rfc_tax_id?.trim()) {
      return res.status(400).json({ success: false, message: 'rfc_tax_id no puede estar vacío.' });
    }
    if (razon_social !== undefined && !razon_social?.trim()) {
      return res.status(400).json({ success: false, message: 'razon_social no puede estar vacía.' });
    }
    const errorLongitud = validarLongitudCliente({ rfc_tax_id, razon_social, email_contacto, telefono });
    if (errorLongitud) return res.status(400).json({ success: false, message: errorLongitud });
    if (codigo_cliente) {
      if (!CODIGO_CLIENTE_PATTERN.test(codigo_cliente) || Number(codigo_cliente) > CODIGO_CLIENTE_MAX) {
        return res.status(400).json({ success: false, message: `codigo_cliente debe ser numérico de 3 dígitos entre "000" y "${String(CODIGO_CLIENTE_MAX).padStart(3, '0')}".` });
      }
    }

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const existe = await prisma.cliente.findUnique({ where: { id_cliente: req.params.id } });
      if (!existe) return null;
      return prisma.cliente.update({
        where: { id_cliente: req.params.id },
        data: {
          ...(rfc_tax_id !== undefined && { rfc_tax_id: rfc_tax_id.trim().toUpperCase() }),
          ...(razon_social !== undefined && { razon_social: razon_social.trim() }),
          ...(email_contacto !== undefined && { email_contacto: email_contacto || null }),
          ...(telefono !== undefined && { telefono: telefono || null }),
          ...(codigo_cliente !== undefined && { codigo_cliente: codigo_cliente || null }),
          ...(estatus !== undefined && { estatus }),
        },
      });
    });

    if (!data) return res.status(404).json({ success: false, message: 'Cliente no encontrado.' });
    logInfo(req, 'ventas', 'ventas.cliente.actualizado', `Cliente ${data.razon_social} actualizado`, { cliente_id: data.id_cliente });
    res.json({ success: true, data });
  } catch (error: unknown) {
    if ((error as { code?: string })?.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'Ya existe otro cliente con ese RFC o código de cliente en este tenant.' });
    }
    const message = error instanceof Error ? error.message : 'Error desconocido';
    logError(req, 'ventas', 'ventas.cliente.actualizar.error', message, {});
    res.status(500).json({ success: false, message: 'Error al actualizar el cliente.' });
  }
});

type ClienteImportRegistro = {
  rfc_tax_id?: string;
  razon_social?: string;
  email_contacto?: string;
  telefono?: string;
  codigo_cliente?: string;
};

type ClienteImportError = { fila: number; motivo: string };

app.post('/api/v1/ventas/clientes/importar-lote', requireRoles('admin'), async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { registros } = req.body as { registros?: ClienteImportRegistro[] };

    if (!Array.isArray(registros)) {
      return res.status(400).json({ success: false, message: '"registros" debe ser un arreglo.' });
    }

    const errores: ClienteImportError[] = [];

    // 1.3 — RFC duplicado dentro del mismo archivo: ninguna de las filas
    // repetidas se crea, se reportan todas como error antes de tocar la BD.
    const filasPorRfc = new Map<string, number[]>();
    registros.forEach((registro, index) => {
      const rfc = registro.rfc_tax_id;
      if (!rfc) return;
      const filas = filasPorRfc.get(rfc) ?? [];
      filas.push(index);
      filasPorRfc.set(rfc, filas);
    });
    const filasDuplicadas = new Set<number>();
    for (const filas of filasPorRfc.values()) {
      if (filas.length > 1) {
        filas.forEach(index => filasDuplicadas.add(index));
      }
    }
    filasDuplicadas.forEach(index => {
      errores.push({ fila: index + 1, motivo: 'RFC duplicado dentro del archivo.' });
    });

    const candidatos = registros
      .map((registro, index) => ({ registro, fila: index + 1 }))
      .filter(({ fila }) => !filasDuplicadas.has(fila - 1));

    // 1.4 — mismas reglas de validación que POST /clientes (línea 63-71).
    const validos: Array<{ registro: ClienteImportRegistro; fila: number }> = [];
    for (const { registro, fila } of candidatos) {
      const { rfc_tax_id, razon_social, codigo_cliente } = registro;

      if (!rfc_tax_id || !razon_social) {
        errores.push({ fila, motivo: 'rfc_tax_id y razon_social son obligatorios.' });
        continue;
      }

      if (codigo_cliente !== undefined && codigo_cliente !== null && codigo_cliente !== '') {
        if (!CODIGO_CLIENTE_PATTERN.test(codigo_cliente) || Number(codigo_cliente) > CODIGO_CLIENTE_MAX) {
          errores.push({ fila, motivo: `codigo_cliente debe ser numérico de 3 dígitos entre "000" y "${String(CODIGO_CLIENTE_MAX).padStart(3, '0')}".` });
          continue;
        }
      }

      validos.push({ registro, fila });
    }

    const creados = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const creadosLote: Array<Awaited<ReturnType<typeof prisma.cliente.create>>> = [];
      for (const { registro, fila } of validos) {
        const { rfc_tax_id, razon_social, email_contacto, telefono, codigo_cliente } = registro;

        // 1.5 — mismo check de existencia que la alta individual (línea 75),
        // más el rfc_tax_id (la alta individual no lo checa porque confía en
        // el unique constraint; aquí sí, para reportar por fila sin abortar).
        const existente = await prisma.cliente.findFirst({
          where: {
            tenant_id: tenantId,
            OR: [
              { rfc_tax_id },
              ...(codigo_cliente ? [{ codigo_cliente }] : []),
            ],
          },
        });
        if (existente) {
          errores.push({ fila, motivo: 'Ya existe un cliente con ese rfc_tax_id o codigo_cliente en este tenant.' });
          continue;
        }

        const nuevo = await prisma.cliente.create({
          data: {
            tenant_id: tenantId,
            rfc_tax_id: rfc_tax_id as string,
            razon_social: razon_social as string,
            email_contacto: email_contacto ?? null,
            telefono: telefono ?? null,
            codigo_cliente: codigo_cliente || null,
          },
        });
        creadosLote.push(nuevo);
      }
      return creadosLote;
    });

    logInfo(req, 'ventas', 'ventas.clientes.importar_lote', `Importación de clientes: ${creados.length} creados, ${errores.length} errores`, {
      creados: creados.length,
      errores: errores.length,
    });

    res.status(200).json({
      success: true,
      data: {
        creados: creados.length,
        clientes: creados,
        errores: errores.sort((a, b) => a.fila - b.fila),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    logError(req, 'ventas', 'ventas.clientes.importar_lote.error', message, {});
    res.status(500).json({ success: false, message });
  }
});

app.get('/api/v1/ventas/cotizaciones', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) =>
      prisma.cotizacion.findMany({
        include: { cliente: true },
        orderBy: { fecha_emision: 'desc' },
      })
    );
    res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ success: false, message });
  }
});

app.get('/api/v1/ventas/facturas', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) =>
      prisma.factura.findMany({
        include: { cliente: true, cotizacion: true },
        orderBy: { fecha_emision: 'desc' },
      })
    );
    res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ success: false, message });
  }
});

/**
 * Ejemplo de respuesta terminal alineada con @bocam/tenant-idempotency (mismo patrón que Compras).
 */
app.post('/api/v1/ventas/cotizaciones/:id/aceptar', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId } = req.securityContext;

    const updated = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const row = await prisma.cotizacion.findUnique({ where: { id_cotizacion: id }, include: { cliente: true } });
      if (!row) {
        return { kind: 'missing' as const };
      }
      if (row.estado === 'ACEPTADA') {
        return { kind: 'already' as const, row };
      }
      const next = await prisma.cotizacion.update({
        where: { id_cotizacion: id },
        data: { estado: 'ACEPTADA' },
      });
      return { kind: 'applied' as const, row: next, clienteNombre: row.cliente?.razon_social ?? '', moneda: row.moneda };
    });

    if (updated.kind === 'missing') {
      return res.status(404).json({ success: false, message: 'Cotización no encontrada.' });
    }

    if (updated.kind === 'already') {
      const response = buildTerminalHttpResponse({
        terminalState: 'idempotent',
        data: {
          ...updated.row,
          subtotal: updated.row.subtotal.toNumber(),
          iva: updated.row.iva.toNumber(),
          total: updated.row.total.toNumber(),
          idempotente: true,
        },
        context: { tenantId, proyectoId },
        buildBody: (result) => ({ success: true, data: result }),
      });
      return res.status(response.statusCode).json(response.body);
    }

    await eventBus.publish({
      event_type: 'ventas.cotizacion_aceptada',
      timestamp: new Date().toISOString(),
      context: buildEventContext(req),
      payload: {
        cotizacion_id:    updated.row.id_cotizacion,
        codigo:           updated.row.codigo,
        total:            updated.row.total.toNumber(),
        proyecto_id:      proyectoId,
        cliente_nombre:   updated.clienteNombre ?? '',
        monto_contrato:   updated.row.total.toNumber(),
        moneda:           updated.moneda ?? 'MXN',
        fecha_aceptacion: new Date().toISOString(),
      },
    });

    logInfo(req, 'ventas', 'ventas.cotizacion.aceptada', 'Cotización aceptada', {
      cotizacion_id: updated.row.id_cotizacion,
    });

    const response = buildTerminalHttpResponse({
      terminalState: 'applied',
      data: {
        ...updated.row,
        subtotal: updated.row.subtotal.toNumber(),
        iva: updated.row.iva.toNumber(),
        total: updated.row.total.toNumber(),
        idempotente: false,
      },
      context: { tenantId, proyectoId },
      buildBody: (result) => ({ success: true, data: result }),
    });
    return res.status(response.statusCode).json(response.body);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    logError(req, 'ventas', 'ventas.cotizacion.aceptar.error', message, {});
    res.status(500).json({ success: false, message });
  }
});

setupSentryExpressHandler(app);

// Registro liviano — primer consumidor de eventos de este servicio (hasta
// ahora solo publicaba). Sin tabla de proyección nueva en este change (ver
// design.md de evento-centro-costos-creado, Decisión 3).
export async function handleCentroCostosCreadoEvent(event: any): Promise<void> {
  console.log(JSON.stringify({
    action: 'ventas.event.centro_costos_creado.registrado',
    correlation_id: event.context?.correlation_id,
    tenant_id: event.context?.tenant_id,
    proyecto_id: event.context?.proyecto_id,
    codigo_centro_costos: event.payload?.codigo_centro_costos,
  }));
}

export async function startServer() {
  return app.listen(PORT, async () => {
    console.log('----------------------------------------------------');
    console.log(` MODULO VENTAS: ACTIVO (Puerto ${PORT})`);
    console.log(' Autenticación: JWT (Bearer Token)');
    console.log('----------------------------------------------------');
    await eventBus.connect();
    await eventBus.subscribe('auth.centro_costos_creado', handleCentroCostosCreadoEvent);
    console.log('[Ventas] Event bus conectado. Emite: ventas.cotizacion_aceptada. Suscrito: auth.centro_costos_creado');
  });
}

if (require.main === module) {
  void startServer();
}
