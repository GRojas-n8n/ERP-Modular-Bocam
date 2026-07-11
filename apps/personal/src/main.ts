import express, { Request, Response } from 'express';
import { createTenantContext } from './db';
import { createApiResponse, createApiError, EstadoPreNomina } from './types';
import { createAuthMiddleware, requireEnv, requireProjectAccess, requireRoles } from '../../../packages/auth-middleware/src';
import { initSentry, setupSentryExpressHandler } from '../../../packages/observability/src';
import { createEventBus } from '../../../packages/event-bus/src';
import { calcularISR, calcularSubsidio, calcularIMSS, calcularHorasExtra, calcularHorasTrabajadas, calcularHorasDesglose, calcularMontoHEPorSemana } from './tablas-fiscales';

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

export const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3006;
const JWT_SECRET = requireEnv('JWT_SECRET');
const eventBus = createEventBus(process.env.PERSONAL_EVENT_BUS_NAME || 'personal');
initSentry(process.env.SENTRY_DSN || '', 'personal');

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

app.patch('/api/v1/personal/empleados/:id', requireRoles('personal_rh', 'admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId } = req.securityContext;
    const {
      modo_asistencia, tipo_jornada,
      hora_entrada_programada, hora_salida_programada, horas_jornada,
    } = req.body;

    if (modo_asistencia === 'POR_HORAS' && (!hora_entrada_programada || !hora_salida_programada)) {
      return res.status(400).json(createApiError('PER_VALIDATION', 'hora_entrada_programada y hora_salida_programada son obligatorios en modo POR_HORAS.'));
    }
    if (horas_jornada !== undefined && (Number(horas_jornada) < 1 || Number(horas_jornada) > 24)) {
      return res.status(400).json(createApiError('PER_VALIDATION', 'horas_jornada debe estar entre 1 y 24.'));
    }

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const emp = await prisma.empleado.findFirst({ where: { id_empleado: id, tenant_id: tenantId } });
      if (!emp) return null;
      return prisma.empleado.update({
        where: { id_empleado: id },
        data: {
          ...(modo_asistencia          !== undefined ? { modo_asistencia }          : {}),
          ...(tipo_jornada             !== undefined ? { tipo_jornada }             : {}),
          ...(hora_entrada_programada  !== undefined ? { hora_entrada_programada }  : {}),
          ...(hora_salida_programada   !== undefined ? { hora_salida_programada }   : {}),
          ...(horas_jornada            !== undefined ? { horas_jornada: Number(horas_jornada) } : {}),
        },
      });
    });
    if (!data) return res.status(404).json(createApiError('PER_NOT_FOUND', 'Empleado no encontrado.'));
    res.json(createApiResponse(data, tenantId, proyectoId));
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
      const empleados = await prisma.empleado.findMany({ where: { estado: 'ACTIVO' } });
      if (empleados.length === 0) throw new Error('No hay empleados activos en este proyecto.');

      const inicio = new Date(periodo_inicio);
      const fin    = new Date(periodo_fin);
      const diasPeriodo = Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      const count  = await prisma.preNomina.count();
      const codigo = `NOM-${new Date().getFullYear()}-${periodo_tipo === 'QUINCENAL' ? 'Q' : 'S'}${String(count + 1).padStart(2, '0')}`;

      let totalPercepciones = 0;
      let totalDeducciones  = 0;

      const asistenciaRecs = await prisma.registroAsistencia.findMany({
        where: { tenant_id: tenantId, proyecto_id: proyectoId, fecha: { gte: inicio, lte: fin } },
      });

      const asistPorEmp: Record<string, { dias: number; he: number }> = {};
      const recsPorEmp: Record<string, any[]> = {};
      for (const r of asistenciaRecs) {
        if (!recsPorEmp[r.empleado_id]) recsPorEmp[r.empleado_id] = [];
        recsPorEmp[r.empleado_id].push(r);
        if (!asistPorEmp[r.empleado_id]) asistPorEmp[r.empleado_id] = { dias: 0, he: 0 };
        if (r.estado === 'PRESENTE') {
          asistPorEmp[r.empleado_id].dias++;
          asistPorEmp[r.empleado_id].he += Number(r.horas_extra);
        }
      }

      const getSemana = (fecha: Date) => {
        const d = new Date(fecha); d.setHours(0,0,0,0);
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        const y = new Date(d.getFullYear(), 0, 1);
        return Math.ceil((((d.getTime() - y.getTime()) / 86400000) + 1) / 7);
      };

      const detallesData: object[] = [];
      for (const emp of empleados as any[]) {
        if (emp.tipo_contrato === 'SUBCONTRATO') continue;

        const cfg = await prisma.configDeduccionEmpleado.findFirst({
          where: { tenant_id: tenantId, empleado_id: emp.id_empleado },
        });
        const aplicaIMSS      = cfg?.aplica_imss      ?? true;
        const aplicaISR       = cfg?.aplica_isr       ?? true;
        const aplicaInfonavit = cfg?.aplica_infonavit  ?? false;
        const infonavitMonto  = aplicaInfonavit ? Number(cfg?.infonavit_monto ?? 0) : 0;

        let salarioBase = 0, montoHE = 0, exentoHE = 0;
        let diasTrabajados = 0, origenDias = 'ESTIMADO';
        let horasNormalesTotal: number | null = null;
        let montoHeDoble = 0, montoHeTriple = 0;
        let origenHoras = 'REAL';

        if (emp.modo_asistencia === 'POR_HORAS') {
          const recs = recsPorEmp[emp.id_empleado] ?? [];
          const horasJornada = Number(emp.horas_jornada ?? 8);
          const tarifaHora   = parseFloat((Number(emp.salario_diario) / horasJornada).toFixed(4));
          let totalHorasNormales = 0;
          let hayEstimado = false;
          const hePorSemana: Record<number, number> = {};

          for (const r of recs) {
            const rA = r as any;
            let hn: number, hed: number;
            if (rA.horas_normales != null) {
              hn = Number(rA.horas_normales); hed = Number(rA.horas_extra_dia ?? 0);
              if (rA.origen_horas === 'ESTIMADO') hayEstimado = true;
            } else if (rA.hora_entrada && !rA.hora_salida) {
              hn = horasJornada; hed = 0; hayEstimado = true;
            } else if (r.estado === 'PRESENTE') {
              hn = horasJornada; hed = 0; hayEstimado = true;
            } else { continue; }
            totalHorasNormales += hn; diasTrabajados++;
            const sem = getSemana(r.fecha instanceof Date ? r.fecha : new Date(r.fecha));
            hePorSemana[sem] = (hePorSemana[sem] ?? 0) + hed;
          }

          if (diasTrabajados === 0 && recs.length === 0) {
            totalHorasNormales = diasPeriodo * horasJornada;
            diasTrabajados = diasPeriodo; hayEstimado = true;
          } else if (diasTrabajados === 0) { continue; }

          salarioBase = parseFloat((totalHorasNormales * tarifaHora).toFixed(2));
          horasNormalesTotal = parseFloat(totalHorasNormales.toFixed(2));
          origenDias = 'ASISTENCIA'; origenHoras = hayEstimado ? 'ESTIMADO' : 'REAL';

          for (const heAcum of Object.values(hePorSemana)) {
            const { monto_doble, monto_triple } = calcularMontoHEPorSemana(heAcum, tarifaHora);
            montoHeDoble += monto_doble; montoHeTriple += monto_triple;
          }
          montoHE  = parseFloat((montoHeDoble + montoHeTriple).toFixed(2));
          exentoHE = parseFloat((montoHE * 0.50).toFixed(2));

        } else {
          const asistencia = asistPorEmp[emp.id_empleado];
          if (asistencia) {
            if (asistencia.dias === 0) continue;
            diasTrabajados = asistencia.dias; origenDias = 'ASISTENCIA';
          } else {
            diasTrabajados = diasPeriodo; origenDias = 'ESTIMADO';
          }
          const totalHE = asistencia?.he ?? 0;
          salarioBase = parseFloat((Number(emp.salario_diario) * diasTrabajados).toFixed(2));
          const heCalc = calcularHorasExtra(totalHE, diasTrabajados, Number(emp.salario_diario));
          montoHE = heCalc.monto; exentoHE = heCalc.exento;
        }

        const percepciones = parseFloat((salarioBase + montoHE).toFixed(2));
        const baseISR      = parseFloat((percepciones - exentoHE).toFixed(2));

        let dedIMSS = 0;
        if (aplicaIMSS && emp.nss) {
          dedIMSS = calcularIMSS(Number(emp.salario_integrado ?? emp.salario_diario), diasTrabajados).total;
        }
        let dedISR = 0;
        if (aplicaISR) {
          const isrBruto = calcularISR(baseISR, periodo_tipo || 'SEMANAL');
          const subsidio = calcularSubsidio(percepciones, periodo_tipo || 'SEMANAL');
          dedISR = Math.max(0, parseFloat((isrBruto - subsidio).toFixed(2)));
        }

        const totalDed = parseFloat((dedIMSS + dedISR + infonavitMonto).toFixed(2));
        const neto     = parseFloat((percepciones - totalDed).toFixed(2));

        totalPercepciones += percepciones;
        totalDeducciones  += totalDed;

        detallesData.push({
          tenant_id: tenantId, proyecto_id: proyectoId,
          empleado_id: emp.id_empleado,
          origen_dias: origenDias,
          dias_trabajados: diasTrabajados,
          horas_extra: montoHE > 0 ? parseFloat((montoHE / (Number(emp.salario_diario) / 8)).toFixed(1)) : 0,
          salario_base: salarioBase,
          monto_horas_extra: montoHE,
          bonos: 0,
          total_percepciones: percepciones,
          deduccion_imss: dedIMSS,
          deduccion_isr: dedISR,
          otras_deducciones: infonavitMonto,
          total_deducciones: totalDed,
          neto_a_pagar: neto,
          horas_normales:  horasNormalesTotal,
          monto_he_doble:  parseFloat(montoHeDoble.toFixed(2)),
          monto_he_triple: parseFloat(montoHeTriple.toFixed(2)),
          origen_horas:    origenHoras,
        });
      }

      if (detallesData.length === 0) throw new Error('No hay empleados elegibles para calcular nómina (todos son SUBCONTRATO o sin días trabajados).');

      const prenomina = await prisma.preNomina.create({
        data: {
          tenant_id: tenantId, proyecto_id: proyectoId,
          codigo, periodo_tipo: periodo_tipo || 'SEMANAL',
          periodo_inicio: inicio, periodo_fin: fin,
          total_percepciones: parseFloat(totalPercepciones.toFixed(2)),
          total_deducciones:  parseFloat(totalDeducciones.toFixed(2)),
          total_neto: parseFloat((totalPercepciones - totalDeducciones).toFixed(2)),
          total_empleados: detallesData.length,
          requiere_recalculo: false,
          estado: EstadoPreNomina.CALCULADA,
          elaborado_por: userId,
          detalles: { createMany: { data: detallesData as any[] } },
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

    void eventBus.publish({
      event_type: 'personal.nomina_autorizada',
      timestamp: new Date().toISOString(),
      context: { tenant_id: tenantId, proyecto_id: proyectoId, user_id: userId },
      payload: {
        prenomina_id:          data.id_prenomina,
        codigo:                data.codigo,
        periodo_tipo:          data.periodo_tipo,
        periodo_inicio:        data.periodo_inicio.toISOString(),
        periodo_fin:           data.periodo_fin.toISOString(),
        total_percepciones:    Number(data.total_percepciones),
        total_deducciones:     Number(data.total_deducciones),
        total_neto:            Number(data.total_neto),
        total_empleados:       Number(data.total_empleados),
        autorizado_por_id:     userId,
        autorizado_por_nombre: userId,
      },
    }).catch((err: any) => console.error('[Personal] eventBus.publish error (nomina_autorizada):', err.message));
    console.log(`[Personal] ✅ Pre-nómina ${data.codigo} AUTORIZADA`);
    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
  }
});

// Marcar pre-nómina como PAGADA (RBAC: admin | rh_manager)
app.patch('/api/v1/personal/prenominas/:id/pagar', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId, roles } = req.securityContext;
    if (!roles.includes('admin') && !roles.includes('rh_manager')) {
      res.status(403).json(createApiError('PER_FORBIDDEN', 'Solo admin o rh_manager pueden marcar una nómina como pagada.'));
      return;
    }
    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const pn = await prisma.preNomina.findUnique({ where: { id_prenomina: id } });
      if (!pn) throw new Error('Pre-nómina no encontrada.');
      if (pn.estado !== EstadoPreNomina.AUTORIZADA) throw new Error(`Solo se puede marcar como PAGADA una pre-nómina AUTORIZADA. Estado actual: ${pn.estado}`);
      return await prisma.preNomina.update({
        where: { id_prenomina: id },
        data: { estado: EstadoPreNomina.PAGADA },
      });
    });
    void eventBus.publish({
      event_type: 'personal.nomina_pagada',
      timestamp: new Date().toISOString(),
      context: { tenant_id: tenantId, proyecto_id: proyectoId, user_id: userId },
      payload: {
        prenomina_id:          data.id_prenomina,
        codigo:                data.codigo,
        periodo_tipo:          data.periodo_tipo,
        periodo_inicio:        data.periodo_inicio.toISOString(),
        periodo_fin:           data.periodo_fin.toISOString(),
        total_percepciones:    Number(data.total_percepciones),
        total_deducciones:     Number(data.total_deducciones),
        total_neto:            Number(data.total_neto),
        total_empleados:       Number(data.total_empleados),
        autorizado_por_id:     data.autorizado_por ?? userId,
        autorizado_por_nombre: data.autorizado_por ?? userId,
      },
    }).catch((err: any) => console.error('[Personal] eventBus.publish error (nomina_pagada):', err.message));
    console.log(`[Personal] ✅ Pre-nómina ${data.codigo} PAGADA`);
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
      const hoy = new Date();
      const inicioDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
      const finDia    = new Date(inicioDia.getTime() + 24 * 60 * 60 * 1000);

      const [totalEmpleados, empleadosActivos, totalCuadrillas, asignacionesActivas, ultimaPrenomina, asistenciaHoy] = await Promise.all([
        prisma.empleado.count(),
        prisma.empleado.count({ where: { estado: 'ACTIVO' } }),
        prisma.cuadrilla.count({ where: { estado: 'ACTIVA' } }),
        prisma.asignacionFrente.count({ where: { estado: 'ACTIVA' } }),
        prisma.preNomina.findFirst({ orderBy: { periodo_inicio: 'desc' }, select: { codigo: true, estado: true, total_neto: true, total_empleados: true } }),
        prisma.registroAsistencia.count({ where: { fecha: { gte: inicioDia, lt: finDia }, estado: { in: ['PRESENTE', 'MEDIO_DIA', 'POR_HORAS'] } } }),
      ]);

      const porCategoria = await prisma.empleado.groupBy({
        by: ['categoria'],
        where: { estado: 'ACTIVO' },
        _count: true,
      });

      const ausenciasHoy = Math.max(0, empleadosActivos - asistenciaHoy);
      const alertas: Array<{ tipo: string; mensaje: string; severidad: string }> = [];
      if (ausenciasHoy > 0) {
        alertas.push({ tipo: 'AUSENCIAS', mensaje: `${ausenciasHoy} empleado(s) sin asistencia registrada hoy`, severidad: ausenciasHoy > 5 ? 'critica' : 'advertencia' });
      }
      if (ultimaPrenomina?.estado === 'PENDIENTE') {
        alertas.push({ tipo: 'PRENOMINA_PENDIENTE', mensaje: `Pre-nómina ${ultimaPrenomina.codigo} pendiente de autorización`, severidad: 'advertencia' });
      }

      return {
        resumen: {
          total_empleados:      totalEmpleados,
          empleados_activos:    empleadosActivos,
          cuadrillas_activas:   totalCuadrillas,
          asignaciones_activas: asignacionesActivas,
        },
        asistencia_hoy: {
          presentes:  asistenciaHoy,
          ausentes:   ausenciasHoy,
          pct_asistencia: empleadosActivos > 0 ? Math.round((asistenciaHoy / empleadosActivos) * 100) : 0,
        },
        distribucion_categoria: porCategoria.map((c: any) => ({ categoria: c.categoria, cantidad: c._count })),
        ultima_prenomina: ultimaPrenomina,
        alertas,
      };
    });

    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ASISTENCIA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// POST /asistencia/registro — soporta JORNADA_COMPLETA y POR_HORAS con doble-scan
app.post('/api/v1/personal/asistencia/registro', requireRoles('residencia', 'control_obra', 'personal_rh', 'admin'), async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { empleado_id, fecha, estado, tipo_registro, horas_extra, cuadrilla_id,
            hora_entrada, hora_salida, tipo_scan } = req.body;
    if (!empleado_id || !fecha) {
      return res.status(400).json(createApiError('PER_MISSING_FIELDS', 'empleado_id y fecha son obligatorios.'));
    }
    const scan = tipo_scan ?? 'AUTO';

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const emp = await prisma.empleado.findFirst({
        where: { id_empleado: empleado_id, tenant_id: tenantId },
        select: { modo_asistencia: true, horas_jornada: true },
      });
      const esPorHoras = emp?.modo_asistencia === 'POR_HORAS';

      if (!esPorHoras) {
        // ── JORNADA_COMPLETA: upsert estado (comportamiento original) ──────────
        const ESTADOS_VALIDOS = ['PRESENTE', 'AUSENTE', 'INCAPACIDAD', 'JUSTIFICADA', 'FALTA'];
        const estadoFinal = estado ?? 'PRESENTE';
        if (!ESTADOS_VALIDOS.includes(estadoFinal)) {
          throw new Error(`Estado inválido: ${estadoFinal}`);
        }
        return prisma.registroAsistencia.upsert({
          where: { tenant_id_empleado_id_fecha: { tenant_id: tenantId, empleado_id, fecha: new Date(fecha) } },
          create: {
            tenant_id: tenantId, proyecto_id: proyectoId, empleado_id,
            cuadrilla_id: cuadrilla_id ?? null,
            fecha: new Date(fecha), estado: estadoFinal,
            tipo_registro: tipo_registro ?? 'MANUAL',
            horas_extra: horas_extra ?? 0,
            registrado_por: userId,
          },
          update: {
            estado: estadoFinal,
            horas_extra: horas_extra ?? 0,
            tipo_registro: tipo_registro ?? 'MANUAL',
            registrado_por: userId,
          },
        });
      }

      // ── POR_HORAS: lógica de doble-scan ──────────────────────────────────────
      const horaActual = new Date().toTimeString().slice(0, 5); // HH:MM
      const existente  = await prisma.registroAsistencia.findUnique({
        where: { tenant_id_empleado_id_fecha: { tenant_id: tenantId, empleado_id, fecha: new Date(fecha) } },
      });

      if (!existente || scan === 'ENTRADA') {
        // Primer scan o forzar entrada
        const hE = hora_entrada ?? horaActual;
        return prisma.registroAsistencia.upsert({
          where: { tenant_id_empleado_id_fecha: { tenant_id: tenantId, empleado_id, fecha: new Date(fecha) } },
          create: {
            tenant_id: tenantId, proyecto_id: proyectoId, empleado_id,
            cuadrilla_id: cuadrilla_id ?? null,
            fecha: new Date(fecha), estado: 'PRESENTE',
            tipo_registro: tipo_registro ?? (scan === 'AUTO' ? 'QR' : 'MANUAL'),
            horas_extra: 0, registrado_por: userId,
            hora_entrada: hE, origen_horas: 'REAL',
          },
          update: { hora_entrada: hE, registrado_por: userId },
        });
      }

      if ((existente as any).hora_entrada && !(existente as any).hora_salida && scan !== 'ENTRADA') {
        // Segundo scan → registrar salida y calcular horas
        if (scan === 'SALIDA' && !hora_salida && !horaActual) {
          throw new Error('hora_salida es obligatoria para tipo_scan SALIDA.');
        }
        const hS = hora_salida ?? horaActual;
        const hE = String((existente as any).hora_entrada);
        const horasJornada = Number((emp as any).horas_jornada ?? 8);
        const trabajadas = calcularHorasTrabajadas(hE, hS);
        const { horas_normales, horas_extra_dia } = calcularHorasDesglose(trabajadas, horasJornada);
        return prisma.registroAsistencia.update({
          where: { id_registro: existente.id_registro },
          data: {
            hora_salida: hS, horas_trabajadas: trabajadas,
            horas_normales, horas_extra_dia,
            origen_horas: 'REAL', registrado_por: userId,
            tipo_registro: tipo_registro ?? (scan === 'AUTO' ? 'QR' : 'MANUAL'),
          },
        });
      }

      // Ya tiene entrada y salida — idempotente
      return existente;
    });

    res.status(201).json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
  }
});

// POST /asistencia/bulk — soporta JORNADA_COMPLETA y POR_HORAS en la misma cuadrilla
app.post('/api/v1/personal/asistencia/bulk', requireRoles('residencia', 'control_obra', 'personal_rh', 'admin'), async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { fecha, registros, cuadrilla_id } = req.body;
    if (!fecha || !Array.isArray(registros) || registros.length === 0) {
      return res.status(400).json(createApiError('PER_MISSING_FIELDS', 'fecha y registros son obligatorios.'));
    }
    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      // Cargar modo_asistencia de todos los empleados del bulk en una sola query
      const empIds = registros.map((r: any) => r.empleado_id);
      const empleados = await prisma.empleado.findMany({
        where: { id_empleado: { in: empIds }, tenant_id: tenantId },
        select: { id_empleado: true, modo_asistencia: true, horas_jornada: true },
      });
      const empMap = new Map(empleados.map(e => [e.id_empleado, e]));

      const results = [];
      for (const r of registros) {
        const emp = empMap.get(r.empleado_id);
        const esPorHoras = emp?.modo_asistencia === 'POR_HORAS';

        if (esPorHoras && r.hora_entrada && r.hora_salida) {
          // POR_HORAS con horas completas → calcular
          const horasJornada = Number(emp?.horas_jornada ?? 8);
          const trabajadas = calcularHorasTrabajadas(r.hora_entrada, r.hora_salida);
          const { horas_normales, horas_extra_dia } = calcularHorasDesglose(trabajadas, horasJornada);
          const rec = await prisma.registroAsistencia.upsert({
            where: { tenant_id_empleado_id_fecha: { tenant_id: tenantId, empleado_id: r.empleado_id, fecha: new Date(fecha) } },
            create: {
              tenant_id: tenantId, proyecto_id: proyectoId,
              empleado_id: r.empleado_id, cuadrilla_id: cuadrilla_id ?? null,
              fecha: new Date(fecha), estado: 'PRESENTE',
              tipo_registro: 'MANUAL', horas_extra: horas_extra_dia,
              registrado_por: userId,
              hora_entrada: r.hora_entrada, hora_salida: r.hora_salida,
              horas_trabajadas: trabajadas, horas_normales, horas_extra_dia,
              origen_horas: 'REAL',
            },
            update: {
              hora_entrada: r.hora_entrada, hora_salida: r.hora_salida,
              horas_trabajadas: trabajadas, horas_normales, horas_extra_dia,
              horas_extra: horas_extra_dia, registrado_por: userId,
            },
          });
          results.push(rec);
        } else if (esPorHoras && r.hora_entrada && !r.hora_salida) {
          // POR_HORAS solo entrada
          const rec = await prisma.registroAsistencia.upsert({
            where: { tenant_id_empleado_id_fecha: { tenant_id: tenantId, empleado_id: r.empleado_id, fecha: new Date(fecha) } },
            create: {
              tenant_id: tenantId, proyecto_id: proyectoId,
              empleado_id: r.empleado_id, cuadrilla_id: cuadrilla_id ?? null,
              fecha: new Date(fecha), estado: 'PRESENTE',
              tipo_registro: 'MANUAL', horas_extra: 0,
              registrado_por: userId, hora_entrada: r.hora_entrada, origen_horas: 'REAL',
            },
            update: { hora_entrada: r.hora_entrada, registrado_por: userId },
          });
          results.push(rec);
        } else {
          // JORNADA_COMPLETA o POR_HORAS sin horas → upsert estado
          const rec = await prisma.registroAsistencia.upsert({
            where: { tenant_id_empleado_id_fecha: { tenant_id: tenantId, empleado_id: r.empleado_id, fecha: new Date(fecha) } },
            create: {
              tenant_id: tenantId, proyecto_id: proyectoId,
              empleado_id: r.empleado_id, cuadrilla_id: cuadrilla_id ?? null,
              fecha: new Date(fecha), estado: r.estado ?? 'PRESENTE',
              tipo_registro: 'MANUAL', horas_extra: r.horas_extra ?? 0,
              registrado_por: userId,
            },
            update: { estado: r.estado ?? 'PRESENTE', horas_extra: r.horas_extra ?? 0, registrado_por: userId },
          });
          results.push(rec);
        }
      }
      return results;
    });
    res.status(201).json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
  }
});

// GET /asistencia
app.get('/api/v1/personal/asistencia', requireRoles('residencia', 'control_obra', 'personal_rh', 'admin'), async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { fecha_inicio, fecha_fin, cuadrilla_id, empleado_id } = req.query as Record<string, string>;
    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json(createApiError('PER_MISSING_FIELDS', 'fecha_inicio y fecha_fin son obligatorios.'));
    }
    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const registros = await prisma.registroAsistencia.findMany({
        where: {
          tenant_id: tenantId, proyecto_id: proyectoId,
          fecha: { gte: new Date(fecha_inicio), lte: new Date(fecha_fin) },
          ...(cuadrilla_id ? { cuadrilla_id } : {}),
          ...(empleado_id  ? { empleado_id  } : {}),
        },
        orderBy: [{ fecha: 'asc' }, { empleado_id: 'asc' }],
      });
      if (registros.length === 0) return [];
      const empIds = [...new Set(registros.map(r => r.empleado_id))];
      const empleados = await prisma.empleado.findMany({
        where: { id_empleado: { in: empIds } },
        select: { id_empleado: true, nombre: true, apellido_paterno: true, puesto: true, modo_asistencia: true },
      });
      const empMap = new Map(empleados.map(e => [e.id_empleado, e]));
      return registros.map(r => {
        const emp = empMap.get(r.empleado_id);
        const ra = r as any;
        return {
          id: r.id_registro,
          id_registro: r.id_registro,
          empleado_id: r.empleado_id,
          cuadrilla_id: r.cuadrilla_id ?? null,
          fecha: r.fecha instanceof Date ? r.fecha.toISOString().slice(0, 10) : String(r.fecha).slice(0, 10),
          estado: r.estado,
          tipo_registro: r.tipo_registro,
          horas_extra: Number(r.horas_extra),
          hora_entrada: ra.hora_entrada ?? null,
          hora_salida: ra.hora_salida ?? null,
          horas_trabajadas: ra.horas_trabajadas != null ? Number(ra.horas_trabajadas) : null,
          horas_normales: ra.horas_normales != null ? Number(ra.horas_normales) : null,
          horas_extra_dia: ra.horas_extra_dia != null ? Number(ra.horas_extra_dia) : null,
          origen_horas: ra.origen_horas ?? 'REAL',
          empleado_nombre: emp ? `${emp.nombre} ${emp.apellido_paterno}` : r.empleado_id.slice(0, 8),
          puesto: emp?.puesto ?? '',
          cuadrilla_nombre: r.cuadrilla_id ?? '',
          modo_asistencia: (emp as any)?.modo_asistencia ?? 'JORNADA_COMPLETA',
        };
      });
    });
    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
  }
});

// PATCH /asistencia/:id — acepta hora_entrada/hora_salida y recalcula si ambas presentes
app.patch('/api/v1/personal/asistencia/:id', requireRoles('personal_rh', 'admin'), async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { id } = req.params;
    const { estado, horas_extra, hora_entrada, hora_salida } = req.body;
    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const reg = await prisma.registroAsistencia.findFirst({ where: { id_registro: id, tenant_id: tenantId } });
      if (!reg) return null;

      // Determinar horas finales para recálculo
      const hE = hora_entrada ?? (reg as any).hora_entrada ?? null;
      const hS = hora_salida  ?? (reg as any).hora_salida  ?? null;

      let camposHoras: Record<string, unknown> = {};
      if (hE && hS) {
        const emp = await prisma.empleado.findFirst({
          where: { id_empleado: reg.empleado_id, tenant_id: tenantId },
          select: { horas_jornada: true },
        });
        const horasJornada = Number((emp as any)?.horas_jornada ?? 8);
        const trabajadas = calcularHorasTrabajadas(hE, hS);
        const { horas_normales, horas_extra_dia } = calcularHorasDesglose(trabajadas, horasJornada);
        camposHoras = { hora_entrada: hE, hora_salida: hS, horas_trabajadas: trabajadas, horas_normales, horas_extra_dia, origen_horas: 'REAL' };
      } else if (hora_entrada !== undefined) {
        camposHoras = { hora_entrada };
      } else if (hora_salida !== undefined) {
        camposHoras = { hora_salida };
      }

      return prisma.registroAsistencia.update({
        where: { id_registro: id },
        data: {
          ...(estado      !== undefined ? { estado }      : {}),
          ...(horas_extra !== undefined ? { horas_extra } : {}),
          ...camposHoras,
          registrado_por: userId,
        },
      });
    });
    if (!data) return res.status(404).json(createApiError('PER_NOT_FOUND', 'Registro no encontrado.'));
    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
  }
});

// GET /asistencia/resumen
app.get('/api/v1/personal/asistencia/resumen', requireRoles('personal_rh', 'admin'), async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { fecha_inicio, fecha_fin } = req.query as Record<string, string>;
    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json(createApiError('PER_MISSING_FIELDS', 'fecha_inicio y fecha_fin son obligatorios.'));
    }
    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const registros = await prisma.registroAsistencia.findMany({
        where: {
          tenant_id: tenantId, proyecto_id: proyectoId,
          fecha: { gte: new Date(fecha_inicio), lte: new Date(fecha_fin) },
        },
      });
      const byEmp: Record<string, { dias_trabajados: number; dias_ausente: number; dias_incapacidad: number; total_horas_extra: number }> = {};
      for (const r of registros) {
        if (!byEmp[r.empleado_id]) {
          byEmp[r.empleado_id] = { dias_trabajados: 0, dias_ausente: 0, dias_incapacidad: 0, total_horas_extra: 0 };
        }
        const e = byEmp[r.empleado_id];
        if (r.estado === 'PRESENTE') { e.dias_trabajados++; e.total_horas_extra += Number(r.horas_extra); }
        else if (r.estado === 'AUSENTE' || r.estado === 'FALTA') e.dias_ausente++;
        else if (r.estado === 'INCAPACIDAD') e.dias_incapacidad++;
      }
      return Object.entries(byEmp).map(([empleado_id, stats]) => ({
        empleado_id,
        ...stats,
        total_horas_extra: parseFloat(stats.total_horas_extra.toFixed(1)),
        origen: 'ASISTENCIA',
      }));
    });
    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIGURACIÓN DE DEDUCCIONES POR EMPLEADO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get('/api/v1/personal/empleados/:id/config-deducciones', requireRoles('personal_rh', 'admin'), async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { id } = req.params;
    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      return prisma.configDeduccionEmpleado.findFirst({ where: { tenant_id: tenantId, empleado_id: id } });
    });
    // Defaults si no existe config
    const result = data ?? { aplica_imss: true, aplica_isr: true, aplica_infonavit: false, infonavit_num: null, infonavit_monto: null };
    res.json(createApiResponse(result, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
  }
});

app.put('/api/v1/personal/empleados/:id/config-deducciones', requireRoles('personal_rh', 'admin'), async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { id } = req.params;
    const { aplica_imss, aplica_isr, aplica_infonavit, infonavit_num, infonavit_monto } = req.body;
    if (aplica_infonavit && (!infonavit_num || infonavit_monto === undefined)) {
      return res.status(400).json(createApiError('PER_VALIDATION', 'infonavit_num e infonavit_monto son requeridos cuando aplica_infonavit es true.'));
    }
    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      return prisma.configDeduccionEmpleado.upsert({
        where: { tenant_id_empleado_id: { tenant_id: tenantId, empleado_id: id } },
        create: {
          tenant_id: tenantId, empleado_id: id,
          aplica_imss: aplica_imss ?? true,
          aplica_isr: aplica_isr ?? true,
          aplica_infonavit: aplica_infonavit ?? false,
          infonavit_num: infonavit_num ?? null,
          infonavit_monto: infonavit_monto ?? null,
        },
        update: {
          aplica_imss: aplica_imss ?? true,
          aplica_isr: aplica_isr ?? true,
          aplica_infonavit: aplica_infonavit ?? false,
          infonavit_num: infonavit_num ?? null,
          infonavit_monto: infonavit_monto ?? null,
        },
      });
    });
    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPLEMENTO SALARIAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get('/api/v1/personal/complementos', requireRoles('personal_rh', 'admin'), async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      return prisma.nominaComplementaria.findMany({
        where: { tenant_id: tenantId, proyecto_id: proyectoId },
        include: { _count: { select: { detalles: true } } },
        orderBy: { created_at: 'desc' },
      });
    });
    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
  }
});

app.post('/api/v1/personal/complementos/calcular', requireRoles('personal_rh', 'admin'), async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { prenomina_id } = req.body;
    if (!prenomina_id) {
      return res.status(400).json(createApiError('PER_MISSING_FIELDS', 'prenomina_id es obligatorio.'));
    }
    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const pn = await prisma.preNomina.findFirst({
        where: { id_prenomina: prenomina_id, tenant_id: tenantId },
        include: { detalles: true },
      });
      if (!pn) return { notFound: true };

      const existe = await prisma.nominaComplementaria.findFirst({ where: { tenant_id: tenantId, prenomina_id } });
      if (existe) return { yaExiste: true };

      const detallesComp: { empleado_id: string; dias_trabajados: number; salario_acordado: number; salario_imss_dia: number; complemento_dia: number; monto_complemento: number }[] = [];
      let totalComp = 0;

      for (const det of pn.detalles) {
        const emp = await prisma.empleado.findFirst({ where: { id_empleado: det.empleado_id, tenant_id: tenantId } });
        if (!emp?.salario_acordado) continue;
        const sAcordado = Number(emp.salario_acordado);
        const sImss = Number(emp.salario_integrado ?? emp.salario_diario);
        if (sAcordado <= sImss) continue;
        const compDia = sAcordado - sImss;
        const dias = Number(det.dias_trabajados);
        const monto = parseFloat((compDia * dias).toFixed(2));
        totalComp += monto;
        detallesComp.push({ empleado_id: det.empleado_id, dias_trabajados: dias, salario_acordado: sAcordado, salario_imss_dia: sImss, complemento_dia: compDia, monto_complemento: monto });
      }

      if (detallesComp.length === 0) return { sinEmpleados: true };

      const count = await prisma.nominaComplementaria.count({ where: { tenant_id: tenantId } });
      const tipoStr = pn.periodo_tipo === 'QUINCENAL' ? 'Q' : 'S';
      const codigo = `CS-${new Date().getFullYear()}-${tipoStr}${String(count + 1).padStart(2, '0')}`;

      const comp = await prisma.nominaComplementaria.create({
        data: {
          tenant_id: tenantId, proyecto_id: proyectoId, prenomina_id,
          codigo, periodo_inicio: pn.periodo_inicio, periodo_fin: pn.periodo_fin,
          periodo_tipo: pn.periodo_tipo, total_complemento: totalComp,
          elaborado_por: userId,
          detalles: {
            createMany: { data: detallesComp.map(d => ({ ...d, tenant_id: tenantId })) },
          },
        },
        include: { _count: { select: { detalles: true } } },
      });
      return { comp };
    });

    if ((data as any).notFound)     return res.status(404).json(createApiError('PER_NOT_FOUND', 'Pre-nómina no encontrada.'));
    if ((data as any).yaExiste)     return res.status(409).json(createApiError('PER_CONFLICT', 'Ya existe un Complemento Salarial para esta pre-nómina.'));
    if ((data as any).sinEmpleados) return res.status(422).json(createApiError('PER_NO_COMPLEMENT', 'Ningún empleado tiene Complemento Salarial configurado (salario_acordado > salario_integrado).'));

    res.status(201).json(createApiResponse((data as any).comp, '', ''));
  } catch (error: any) {
    res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
  }
});

app.patch('/api/v1/personal/complementos/:id/autorizar', requireRoles('personal_rh', 'admin'), async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { id } = req.params;
    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const comp = await prisma.nominaComplementaria.findFirst({ where: { id_complemento: id, tenant_id: tenantId } });
      if (!comp) return null;
      if (comp.estado !== 'BORRADOR') return { estadoInvalido: true, estado: comp.estado };
      return prisma.nominaComplementaria.update({
        where: { id_complemento: id },
        data: { estado: 'AUTORIZADA', autorizado_por: userId },
      });
    });
    if (!data) return res.status(404).json(createApiError('PER_NOT_FOUND', 'Complemento no encontrado.'));
    if ((data as any).estadoInvalido) return res.status(409).json(createApiError('PER_INVALID_STATE', `Solo se puede autorizar en BORRADOR. Estado actual: ${(data as any).estado}`));
    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DETALLE DE PRE-NÓMINA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get('/api/v1/personal/prenominas/:id/detalle', requireRoles('personal_rh', 'admin'), async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { id } = req.params;
    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const pn = await prisma.preNomina.findFirst({
        where: { id_prenomina: id, tenant_id: tenantId },
        include: {
          detalles: {
            include: { empleado: { select: { nombre: true, apellido_paterno: true, numero_empleado: true } } },
          },
        },
      });
      if (!pn) return null;
      const da = pn as any;
      return {
        ...pn,
        detalles: da.detalles.map((d: any) => ({
          ...d,
          salario_base:       Number(d.salario_base),
          monto_horas_extra:  Number(d.monto_horas_extra),
          deduccion_imss:     Number(d.deduccion_imss),
          deduccion_isr:      Number(d.deduccion_isr),
          otras_deducciones:  Number(d.otras_deducciones),
          total_percepciones: Number(d.total_percepciones),
          total_deducciones:  Number(d.total_deducciones),
          neto_a_pagar:       Number(d.neto_a_pagar),
          horas_normales:     d.horas_normales  != null ? Number(d.horas_normales)  : null,
          monto_he_doble:     Number(d.monto_he_doble  ?? 0),
          monto_he_triple:    Number(d.monto_he_triple ?? 0),
          origen_horas:       d.origen_horas ?? 'REAL',
        })),
      };
    });
    if (!data) return res.status(404).json(createApiError('PER_NOT_FOUND', 'Pre-nómina no encontrada.'));
    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.get('/api/v1/personal/resumen-dashboard',
  requireRoles('superintendent', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
        const [empleadosActivos, cuadrillasActivas, prenominasPendientes] = await Promise.all([
          prisma.empleado.count({ where: { estado: 'ACTIVO' } }),
          prisma.cuadrilla.count({ where: { estado: 'ACTIVA' } }),
          prisma.preNomina.count({ where: { estado: { in: ['BORRADOR', 'CALCULADA'] } } }),
        ]);
        return {
          empleados_activos:      empleadosActivos,
          cuadrillas_activas:     cuadrillasActivas,
          prenominas_pendientes:  prenominasPendientes,
        };
      });
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// HEALTH CHECK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', module: 'personal', version: '1.0.0', timestamp: new Date().toISOString() });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ARRANQUE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
setupSentryExpressHandler(app);

// Registro liviano — primer consumidor de eventos de este servicio (hasta
// ahora solo publicaba). Sin tabla de proyección nueva en este change (ver
// design.md de evento-centro-costos-creado, Decisión 3).
export async function handleCentroCostosCreadoEvent(event: any): Promise<void> {
  console.log(JSON.stringify({
    action: 'personal.event.centro_costos_creado.registrado',
    correlation_id: event.context?.correlation_id,
    tenant_id: event.context?.tenant_id,
    proyecto_id: event.context?.proyecto_id,
    codigo_centro_costos: event.payload?.codigo_centro_costos,
  }));
}

export async function initEventBus() {
  await eventBus.connect();
  await eventBus.subscribe('auth.centro_costos_creado', handleCentroCostosCreadoEvent);
}

export async function shutdownEventBus() {
  await eventBus.close();
}

async function startServer() {
  await eventBus.connect();
  await eventBus.subscribe('auth.centro_costos_creado', handleCentroCostosCreadoEvent);
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
    console.log(`   PATCH /api/v1/personal/prenominas/:id/pagar`);
    console.log(`   GET   /api/v1/personal/dashboard`);
    console.log(`   GET   /health`);
  });
}

if (require.main === module) {
  void startServer();
}
