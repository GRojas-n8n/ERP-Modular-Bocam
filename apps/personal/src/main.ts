import express, { Request, Response } from 'express';
import { createTenantContext } from './db';
import { createApiResponse, createApiError, EstadoPreNomina } from './types';
import { createAuthMiddleware, requireEnv, requireProjectAccess } from '../../../packages/auth-middleware/src';

/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Clasificación: Estrictamente Confidencial.
 * ---------------------------------------------------------------------------
 * Módulo: Personal / RRHH
 * Puerto: 3006
 *
 * Responsabilidades:
 * 1. Gestionar fichas de empleados (alta, baja, consulta).
 * 2. Organizar cuadrillas de trabajo por proyecto.
 * 3. Asignar personal/cuadrillas a frentes de trabajo.
 * 4. Calcular y autorizar pre-nómina semanal/quincenal.
 * ---------------------------------------------------------------------------
 */

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3006;
const JWT_SECRET = requireEnv('JWT_SECRET');

app.use(createAuthMiddleware({
  jwtSecret: JWT_SECRET,
  excludePaths: ['/health'],
}));
app.use(requireProjectAccess());

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EMPLEADOS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get('/api/v1/personal/empleados', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const estado = req.query.estado as string;
    const categoria = req.query.categoria as string;

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      return await prisma.empleado.findMany({
        where: {
          ...(estado && { estado }),
          ...(categoria && { categoria }),
        },
        include: { cuadrilla: { select: { nombre: true, codigo: true } } },
        orderBy: { nombre: 'asc' },
      });
    });
    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
  }
});

app.post('/api/v1/personal/empleados', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const {
      nombre, apellido_paterno, apellido_materno, rfc, curp, nss,
      puesto, categoria, tipo_contrato, fecha_ingreso, salario_diario,
      telefono, email, contacto_emergencia, certificaciones,
    } = req.body;

    if (!nombre || !apellido_paterno || !rfc || !puesto || !salario_diario) {
      res.status(400).json(createApiError('PER_MISSING_FIELDS', 'nombre, apellido_paterno, rfc, puesto y salario_diario son obligatorios.'));
      return;
    }

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const lastEmp = await prisma.empleado.findFirst({
        orderBy: { numero_empleado: 'desc' },
        select: { numero_empleado: true },
      });
      const lastNum = lastEmp ? parseInt(lastEmp.numero_empleado.replace('EMP-', '')) : 0;
      const numero = `EMP-${String(lastNum + 1).padStart(3, '0')}`;

      return await prisma.empleado.create({
        data: {
          tenant_id: tenantId,
          numero_empleado: numero,
          nombre, apellido_paterno, apellido_materno,
          rfc, curp, nss,
          puesto, categoria: categoria || 'OBRERO',
          tipo_contrato: tipo_contrato || 'PLANTA',
          fecha_ingreso: new Date(fecha_ingreso || new Date()),
          salario_diario: Number(salario_diario),
          telefono, email, contacto_emergencia,
          certificaciones: certificaciones ? JSON.stringify(certificaciones) : null,
          estado: 'ACTIVO',
        },
      });
    });

    console.log(`[Personal] ✅ Empleado ${data.numero_empleado} registrado: ${data.nombre}`);
    res.status(201).json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
  }
});

app.patch('/api/v1/personal/empleados/:id/baja', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId } = req.securityContext;

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      return await prisma.empleado.update({
        where: { id_empleado: id },
        data: { estado: 'BAJA', fecha_baja: new Date(), cuadrilla_id: null },
      });
    });
    console.log(`[Personal] ⚠️ Empleado ${data.numero_empleado} dado de baja`);
    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CUADRILLAS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get('/api/v1/personal/cuadrillas', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      return await prisma.cuadrilla.findMany({
        include: {
          miembros: { select: { id_empleado: true, nombre: true, apellido_paterno: true, puesto: true, estado: true } },
          _count: { select: { miembros: true } },
        },
        orderBy: { nombre: 'asc' },
      });
    });
    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
  }
});

app.post('/api/v1/personal/cuadrillas', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { nombre, especialidad, capataz_id, capataz_nombre } = req.body;

    if (!nombre || !especialidad) {
      res.status(400).json(createApiError('PER_MISSING_FIELDS', 'nombre y especialidad son obligatorios.'));
      return;
    }

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const count = await prisma.cuadrilla.count();
      const codigo = `CUA-${String(count + 1).padStart(2, '0')}`;

      return await prisma.cuadrilla.create({
        data: {
          tenant_id: tenantId, proyecto_id: proyectoId,
          nombre, codigo, especialidad,
          capataz_id, capataz_nombre,
          estado: 'ACTIVA',
        },
      });
    });

    console.log(`[Personal] ✅ Cuadrilla ${data.codigo} creada: ${data.nombre}`);
    res.status(201).json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
  }
});

// Asignar empleados a cuadrilla
app.post('/api/v1/personal/cuadrillas/:id/asignar', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { empleado_ids } = req.body;

    if (!empleado_ids || !Array.isArray(empleado_ids)) {
      res.status(400).json(createApiError('PER_MISSING_FIELDS', 'Se requiere array de empleado_ids.'));
      return;
    }

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      await prisma.empleado.updateMany({
        where: { id_empleado: { in: empleado_ids }, estado: 'ACTIVO' },
        data: { cuadrilla_id: id },
      });

      return await prisma.cuadrilla.findUnique({
        where: { id_cuadrilla: id },
        include: { miembros: { select: { id_empleado: true, nombre: true, puesto: true } }, _count: { select: { miembros: true } } },
      });
    });
    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ASIGNACIONES A FRENTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get('/api/v1/personal/asignaciones', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      return await prisma.asignacionFrente.findMany({
        include: {
          empleado: { select: { nombre: true, apellido_paterno: true, puesto: true, numero_empleado: true } },
          cuadrilla: { select: { nombre: true, codigo: true } },
        },
        orderBy: { fecha_inicio: 'desc' },
      });
    });
    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
  }
});

app.post('/api/v1/personal/asignaciones', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { empleado_id, cuadrilla_id, frente_trabajo, turno, fecha_inicio, fecha_fin, horas_diarias } = req.body;

    if (!empleado_id || !frente_trabajo) {
      res.status(400).json(createApiError('PER_MISSING_FIELDS', 'empleado_id y frente_trabajo son obligatorios.'));
      return;
    }

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      return await prisma.asignacionFrente.create({
        data: {
          tenant_id: tenantId, proyecto_id: proyectoId,
          empleado_id, cuadrilla_id,
          frente_trabajo, turno: turno || 'DIURNO',
          fecha_inicio: new Date(fecha_inicio || new Date()),
          fecha_fin: fecha_fin ? new Date(fecha_fin) : null,
          horas_diarias: horas_diarias || 8,
          estado: 'ACTIVA',
        },
        include: { empleado: { select: { nombre: true, apellido_paterno: true } } },
      });
    });
    console.log(`[Personal] ✅ Asignación: ${data.empleado?.nombre} → ${data.frente_trabajo}`);
    res.status(201).json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PRE-NÓMINA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get('/api/v1/personal/prenominas', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      return await prisma.preNomina.findMany({
        include: { _count: { select: { detalles: true } } },
        orderBy: { periodo_inicio: 'desc' },
      });
    });
    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
  }
});

app.get('/api/v1/personal/prenominas/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId } = req.securityContext;

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      return await prisma.preNomina.findUnique({
        where: { id_prenomina: id },
        include: {
          detalles: {
            include: { empleado: { select: { nombre: true, apellido_paterno: true, numero_empleado: true, puesto: true } } },
          },
        },
      });
    });

    if (!data) { res.status(404).json(createApiError('PER_NOT_FOUND', 'Pre-nómina no encontrada.')); return; }
    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
  }
});

// Calcular pre-nómina automática para empleados activos del proyecto
app.post('/api/v1/personal/prenominas/calcular', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { periodo_inicio, periodo_fin, periodo_tipo } = req.body;

    if (!periodo_inicio || !periodo_fin) {
      res.status(400).json(createApiError('PER_MISSING_FIELDS', 'periodo_inicio y periodo_fin son obligatorios.'));
      return;
    }

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      // Obtener empleados activos con asignación en el proyecto
      const empleados = await prisma.empleado.findMany({
        where: { estado: 'ACTIVO' },
      });

      if (empleados.length === 0) throw new Error('No hay empleados activos en este proyecto.');

      const inicio = new Date(periodo_inicio);
      const fin = new Date(periodo_fin);
      const diasPeriodo = Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      // Crear header
      const count = await prisma.preNomina.count();
      const codigo = `NOM-${new Date().getFullYear()}-${periodo_tipo === 'QUINCENAL' ? 'Q' : 'S'}${String(count + 1).padStart(2, '0')}`;

      let totalPercepciones = 0;
      let totalDeducciones = 0;

      const detallesData = empleados.map((emp: any) => {
        const salarioBase = Number(emp.salario_diario) * diasPeriodo;
        const imss = salarioBase * 0.025;
        const isr = salarioBase > 5000 ? salarioBase * 0.09 : salarioBase * 0.04;
        const totalDed = imss + isr;
        const neto = salarioBase - totalDed;

        totalPercepciones += salarioBase;
        totalDeducciones += totalDed;

        return {
          tenant_id: tenantId,
          proyecto_id: proyectoId,
          empleado_id: emp.id_empleado,
          dias_trabajados: diasPeriodo,
          horas_extra: 0,
          salario_base: salarioBase,
          monto_horas_extra: 0,
          bonos: 0,
          total_percepciones: salarioBase,
          deduccion_imss: imss,
          deduccion_isr: isr,
          otras_deducciones: 0,
          total_deducciones: totalDed,
          neto_a_pagar: neto,
        };
      });

      const prenomina = await prisma.preNomina.create({
        data: {
          tenant_id: tenantId, proyecto_id: proyectoId,
          codigo, periodo_tipo: periodo_tipo || 'SEMANAL',
          periodo_inicio: inicio, periodo_fin: fin,
          total_percepciones: totalPercepciones,
          total_deducciones: totalDeducciones,
          total_neto: totalPercepciones - totalDeducciones,
          total_empleados: empleados.length,
          estado: EstadoPreNomina.CALCULADA,
          elaborado_por: userId,
          detalles: { createMany: { data: detallesData } },
        },
        include: { _count: { select: { detalles: true } } },
      });

      return prenomina;
    });

    console.log(`[Personal] ✅ Pre-nómina ${data.codigo} calculada: ${data.total_empleados} empleados → $${Number(data.total_neto).toLocaleString()}`);
    res.status(201).json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    console.error('[Personal] Error calculando pre-nómina:', error.message);
    res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
  }
});

// Autorizar pre-nómina (RBAC: admin)
app.patch('/api/v1/personal/prenominas/:id/autorizar', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId, roles } = req.securityContext;

    if (!roles.includes('admin') && !roles.includes('rh_manager')) {
      res.status(403).json(createApiError('PER_FORBIDDEN', 'Solo admin o rh_manager pueden autorizar pre-nóminas.'));
      return;
    }

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const pn = await prisma.preNomina.findUnique({ where: { id_prenomina: id } });
      if (!pn) throw new Error('Pre-nómina no encontrada.');
      if (pn.estado !== EstadoPreNomina.CALCULADA) throw new Error(`Solo se puede autorizar una pre-nómina CALCULADA. Estado actual: ${pn.estado}`);

      return await prisma.preNomina.update({
        where: { id_prenomina: id },
        data: {
          estado: EstadoPreNomina.AUTORIZADA,
          autorizado_por: userId,
          fecha_autorizacion: new Date(),
        },
      });
    });

    console.log(`[Personal] ✅ Pre-nómina ${data.codigo} AUTORIZADA`);
    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DASHBOARD DE PERSONAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.get('/api/v1/personal/dashboard', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const [totalEmpleados, empleadosActivos, totalCuadrillas, asignacionesActivas, ultimaPrenomina] = await Promise.all([
        prisma.empleado.count(),
        prisma.empleado.count({ where: { estado: 'ACTIVO' } }),
        prisma.cuadrilla.count({ where: { estado: 'ACTIVA' } }),
        prisma.asignacionFrente.count({ where: { estado: 'ACTIVA' } }),
        prisma.preNomina.findFirst({ orderBy: { periodo_inicio: 'desc' }, select: { codigo: true, estado: true, total_neto: true, total_empleados: true } }),
      ]);

      const porCategoria = await prisma.empleado.groupBy({
        by: ['categoria'],
        where: { estado: 'ACTIVO' },
        _count: true,
      });

      return {
        resumen: {
          total_empleados: totalEmpleados,
          empleados_activos: empleadosActivos,
          cuadrillas_activas: totalCuadrillas,
          asignaciones_activas: asignacionesActivas,
        },
        distribucion_categoria: porCategoria.map((c: any) => ({ categoria: c.categoria, cantidad: c._count })),
        ultima_prenomina: ultimaPrenomina,
      };
    });

    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HEALTH CHECK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', module: 'personal', version: '1.0.0', timestamp: new Date().toISOString() });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ARRANQUE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  👷  Módulo: PERSONAL / RRHH');
  console.log('  🏢  Propiedad: Constructora Bocam, S. A. de C.V.');
  console.log('  🔐  Autenticación: JWT REAL (Bearer Token)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`[Personal] ✅ Servidor en puerto ${PORT}`);
  console.log(`[Personal] 📡 Rutas disponibles:`);
  console.log(`   GET   /api/v1/personal/empleados`);
  console.log(`   POST  /api/v1/personal/empleados`);
  console.log(`   PATCH /api/v1/personal/empleados/:id/baja`);
  console.log(`   GET   /api/v1/personal/cuadrillas`);
  console.log(`   POST  /api/v1/personal/cuadrillas`);
  console.log(`   POST  /api/v1/personal/cuadrillas/:id/asignar`);
  console.log(`   GET   /api/v1/personal/asignaciones`);
  console.log(`   POST  /api/v1/personal/asignaciones`);
  console.log(`   GET   /api/v1/personal/prenominas`);
  console.log(`   GET   /api/v1/personal/prenominas/:id`);
  console.log(`   POST  /api/v1/personal/prenominas/calcular`);
  console.log(`   PATCH /api/v1/personal/prenominas/:id/autorizar`);
  console.log(`   GET   /api/v1/personal/dashboard`);
  console.log(`   GET   /health`);
});
