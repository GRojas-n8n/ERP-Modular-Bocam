import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import multer from 'multer';
import { createTenantContext } from './db';
import {
  createApiResponse, createApiError, EstadoPreNomina,
  TIPOS_DOCUMENTO_EMPLEADO, MAX_FILE_SIZE_EXPEDIENTE, EXTENSIONES_PERMITIDAS_EXPEDIENTE,
  DIAS_VENCIMIENTO_DEFAULT, ASISTENCIA_COOLDOWN_MINUTOS,
} from './types';
import { createAuthMiddleware, requireEnv, requireProjectAccess, requireRoles } from '../../../packages/auth-middleware/src';
import { initSentry, setupSentryExpressHandler } from '../../../packages/observability/src';
import { createEventBus } from '../../../packages/event-bus/src';
import {
  calcularISR, calcularSubsidio, calcularIMSS, calcularHorasExtra, calcularHorasTrabajadas,
  calcularHorasDesglose, calcularMontoHEPorSemana, esPeriodoTipoValido, PERIODOS_TIPO_VALIDOS,
} from './tablas-fiscales';

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

// ── Expediente digital: almacenamiento en volumen propio (mismo patrón que Calidad) ──
const UPLOAD_DIR = process.env.PERSONAL_UPLOAD_DIR || '/tmp/personal-uploads';
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const uploadExpediente = multer({
  dest: path.join(UPLOAD_DIR, '_tmp'),
  limits: { fileSize: MAX_FILE_SIZE_EXPEDIENTE },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!EXTENSIONES_PERMITIDAS_EXPEDIENTE.includes(ext)) {
      return cb(new Error(`Tipo de archivo no permitido: ${ext}`));
    }
    cb(null, true);
  },
});

function rutaArchivoExpediente(tenantId: string, empleadoId: string, documentoId: string, ext: string): string {
  return path.join(tenantId, empleadoId, `${documentoId}${ext}`);
}

function rutaAbsolutaExpediente(ruta: string): string {
  return path.join(UPLOAD_DIR, ruta);
}

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

app.post('/api/v1/personal/empleados', requireRoles('personal_rh', 'admin'), async (req: Request, res: Response) => {
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

type EmpleadoImportRegistro = {
  nombre?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  rfc?: string;
  curp?: string;
  nss?: string;
  puesto?: string;
  categoria?: string;
  tipo_contrato?: string;
  fecha_ingreso?: string;
  salario_diario?: number | string;
  telefono?: string;
  email?: string;
};

type EmpleadoImportError = { fila: number; motivo: string };

app.post('/api/v1/personal/empleados/importar-lote', requireRoles('personal_rh', 'admin'), async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { registros } = req.body as { registros?: EmpleadoImportRegistro[] };

    if (!Array.isArray(registros)) {
      res.status(400).json(createApiError('PER_INVALID_BODY', '"registros" debe ser un arreglo.'));
      return;
    }

    const errores: EmpleadoImportError[] = [];

    // 1.3 — RFC duplicado dentro del mismo archivo: ninguna de las filas
    // repetidas se crea, se reportan todas como error antes de tocar la BD.
    const filasPorRfc = new Map<string, number[]>();
    registros.forEach((registro, index) => {
      const rfc = registro.rfc;
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

    // 1.4 — mismas reglas de validación que POST /empleados (línea 74),
    // más validación de salario_diario numérico (D2 de design.md: todo el
    // lote corre en una sola transacción, un Decimal inválido revertiría
    // el lote completo si no se valida antes).
    const validos: Array<{ registro: EmpleadoImportRegistro; fila: number }> = [];
    for (const { registro, fila } of candidatos) {
      const { nombre, apellido_paterno, rfc, puesto, salario_diario } = registro;

      if (!nombre || !apellido_paterno || !rfc || !puesto || !salario_diario) {
        errores.push({ fila, motivo: 'nombre, apellido_paterno, rfc, puesto y salario_diario son obligatorios.' });
        continue;
      }

      if (Number.isNaN(Number(salario_diario))) {
        errores.push({ fila, motivo: 'salario_diario debe ser numérico.' });
        continue;
      }

      validos.push({ registro, fila });
    }

    const creados = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const creadosLote: Array<Awaited<ReturnType<typeof prisma.empleado.create>>> = [];
      for (const { registro, fila } of validos) {
        const {
          nombre, apellido_paterno, apellido_materno, rfc, curp, nss,
          puesto, categoria, tipo_contrato, fecha_ingreso, salario_diario,
          telefono, email,
        } = registro;

        // 1.5 — mismo par de unicidad que @@unique([tenant_id, rfc]).
        const existente = await prisma.empleado.findFirst({
          where: { tenant_id: tenantId, rfc: rfc as string },
        });
        if (existente) {
          errores.push({ fila, motivo: 'Ya existe un empleado con ese rfc en este tenant.' });
          continue;
        }

        // 1.6 — numero_empleado autoincremental, mismo cálculo que la alta
        // individual (línea 80-85), dentro del mismo bucle secuencial para
        // que cada lectura vea los creados por iteraciones previas de este
        // lote (D3 de design.md).
        const lastEmp = await prisma.empleado.findFirst({
          where: { tenant_id: tenantId },
          orderBy: { numero_empleado: 'desc' },
          select: { numero_empleado: true },
        });
        const lastNum = lastEmp ? parseInt(lastEmp.numero_empleado.replace('EMP-', '')) : 0;
        const numero = `EMP-${String(lastNum + 1).padStart(3, '0')}`;

        const nuevo = await prisma.empleado.create({
          data: {
            tenant_id: tenantId,
            numero_empleado: numero,
            nombre: nombre as string,
            apellido_paterno: apellido_paterno as string,
            apellido_materno,
            rfc: rfc as string,
            curp,
            nss,
            puesto: puesto as string,
            categoria: categoria || 'OBRERO',
            tipo_contrato: tipo_contrato || 'PLANTA',
            fecha_ingreso: new Date(fecha_ingreso || new Date()),
            salario_diario: Number(salario_diario),
            telefono,
            email,
            estado: 'ACTIVO',
          },
        });
        creadosLote.push(nuevo);
      }
      return creadosLote;
    });

    console.log(`[Personal] Importación de empleados: ${creados.length} creados, ${errores.length} errores`);

    res.status(200).json(createApiResponse({
      creados: creados.length,
      empleados: creados,
      errores: errores.sort((a, b) => a.fila - b.fila),
    }, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
  }
});

app.patch('/api/v1/personal/empleados/:id', requireRoles('personal_rh', 'admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId } = req.securityContext;
    const {
      nombre, apellido_paterno, apellido_materno, rfc, curp, nss,
      puesto, salario_diario, telefono, email, contacto_emergencia,
      modo_asistencia, tipo_jornada,
      hora_entrada_programada, hora_salida_programada, horas_jornada,
    } = req.body;

    const camposObligatorios: Record<string, unknown> = { nombre, apellido_paterno, rfc, puesto, salario_diario };
    for (const campo of Object.keys(camposObligatorios)) {
      if (campo in req.body && !camposObligatorios[campo]) {
        return res.status(400).json(createApiError('PER_MISSING_FIELDS', 'nombre, apellido_paterno, rfc, puesto y salario_diario son obligatorios.'));
      }
    }

    if (modo_asistencia === 'POR_HORAS' && (!hora_entrada_programada || !hora_salida_programada)) {
      return res.status(400).json(createApiError('PER_VALIDATION', 'hora_entrada_programada y hora_salida_programada son obligatorios en modo POR_HORAS.'));
    }
    if (horas_jornada !== undefined && (Number(horas_jornada) < 1 || Number(horas_jornada) > 24)) {
      return res.status(400).json(createApiError('PER_VALIDATION', 'horas_jornada debe estar entre 1 y 24.'));
    }

    const resultado = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const emp = await prisma.empleado.findFirst({ where: { id_empleado: id, tenant_id: tenantId } });
      if (!emp) return { status: 'not_found' } as const;

      if (rfc !== undefined && rfc !== emp.rfc) {
        const duplicado = await prisma.empleado.findFirst({
          where: { tenant_id: tenantId, rfc, NOT: { id_empleado: id } },
        });
        if (duplicado) return { status: 'rfc_duplicado' } as const;
      }

      const data = await prisma.empleado.update({
        where: { id_empleado: id },
        data: {
          ...(nombre                   !== undefined ? { nombre }                   : {}),
          ...(apellido_paterno         !== undefined ? { apellido_paterno }         : {}),
          ...(apellido_materno         !== undefined ? { apellido_materno }         : {}),
          ...(rfc                      !== undefined ? { rfc }                      : {}),
          ...(curp                     !== undefined ? { curp }                     : {}),
          ...(nss                      !== undefined ? { nss }                      : {}),
          ...(puesto                   !== undefined ? { puesto }                   : {}),
          ...(salario_diario           !== undefined ? { salario_diario: Number(salario_diario) } : {}),
          ...(telefono                 !== undefined ? { telefono }                 : {}),
          ...(email                    !== undefined ? { email }                    : {}),
          ...(contacto_emergencia      !== undefined ? { contacto_emergencia }      : {}),
          ...(modo_asistencia          !== undefined ? { modo_asistencia }          : {}),
          ...(tipo_jornada             !== undefined ? { tipo_jornada }             : {}),
          ...(hora_entrada_programada  !== undefined ? { hora_entrada_programada }  : {}),
          ...(hora_salida_programada   !== undefined ? { hora_salida_programada }   : {}),
          ...(horas_jornada            !== undefined ? { horas_jornada: Number(horas_jornada) } : {}),
        },
      });
      return { status: 'ok', data } as const;
    });

    if (resultado.status === 'not_found') return res.status(404).json(createApiError('PER_NOT_FOUND', 'Empleado no encontrado.'));
    if (resultado.status === 'rfc_duplicado') return res.status(400).json(createApiError('PER_RFC_DUPLICADO', 'Ya existe un empleado con ese RFC en este tenant.'));
    res.json(createApiResponse(resultado.data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
  }
});

app.patch('/api/v1/personal/empleados/:id/baja', requireRoles('personal_rh', 'admin'), async (req: Request, res: Response) => {
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

app.post('/api/v1/personal/cuadrillas', requireRoles('personal_rh', 'admin'), async (req: Request, res: Response) => {
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
app.post('/api/v1/personal/cuadrillas/:id/asignar', requireRoles('personal_rh', 'admin'), async (req: Request, res: Response) => {
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

app.post('/api/v1/personal/asignaciones', requireRoles('personal_rh', 'admin'), async (req: Request, res: Response) => {
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
// CONFIGURACIÓN DE NÓMINA POR PROYECTO (periodicidad de pago)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get('/api/v1/personal/config-nomina', requireRoles('personal_rh', 'admin'), async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      return prisma.configNominaProyecto.findFirst({ where: { tenant_id: tenantId, proyecto_id: proyectoId } });
    });
    const result = data ?? { proyecto_id: proyectoId, periodicidad_pago: 'SEMANAL', configurado_por: null, updated_at: null };
    res.json(createApiResponse(result, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
  }
});

app.put('/api/v1/personal/config-nomina', requireRoles('personal_rh', 'admin'), async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { periodicidad_pago } = req.body;

    if (!periodicidad_pago || !esPeriodoTipoValido(periodicidad_pago)) {
      return res.status(400).json(createApiError('PER_VALIDATION', `periodicidad_pago debe ser uno de: ${PERIODOS_TIPO_VALIDOS.join(', ')}`));
    }

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      return prisma.configNominaProyecto.upsert({
        where: { tenant_id_proyecto_id: { tenant_id: tenantId, proyecto_id: proyectoId } },
        create: { tenant_id: tenantId, proyecto_id: proyectoId, periodicidad_pago, configurado_por: userId },
        update: { periodicidad_pago, configurado_por: userId },
      });
    });
    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
  }
});

// Empleados elegibles de un proyecto: unión de AsignacionFrente ACTIVA en ese
// proyecto y empleados cuya Cuadrilla pertenece a ese proyecto (fallback para
// quienes no tienen frente explícito). Empleado NO tiene proyecto_id propio.
//
// `fechaReferencia` (default: ahora) excluye AsignacionFrente cuya fecha_fin
// ya venció antes de esa fecha — nada en el código actualiza `estado` tras
// crear la asignación, así que sin este filtro una asignación terminada
// hace elegible al empleado para siempre (ver specs/features/02-...md, 2.2).
async function obtenerEmpleadoIdsDelProyecto(prisma: any, tenantId: string, proyectoId: string, fechaReferencia: Date = new Date()): Promise<Set<string>> {
  const [porFrente, cuadrillasDelProyecto] = await Promise.all([
    prisma.asignacionFrente.findMany({
      where: {
        tenant_id: tenantId, proyecto_id: proyectoId, estado: 'ACTIVA',
        OR: [{ fecha_fin: null }, { fecha_fin: { gte: fechaReferencia } }],
      },
      select: { empleado_id: true },
    }),
    prisma.cuadrilla.findMany({
      where: { tenant_id: tenantId, proyecto_id: proyectoId },
      select: { id_cuadrilla: true },
    }),
  ]);
  const cuadrillaIds = cuadrillasDelProyecto.map((c: any) => c.id_cuadrilla);
  const porCuadrilla = cuadrillaIds.length > 0
    ? await prisma.empleado.findMany({ where: { tenant_id: tenantId, cuadrilla_id: { in: cuadrillaIds } }, select: { id_empleado: true } })
    : [];
  const ids = new Set<string>();
  porFrente.forEach((a: any) => ids.add(a.empleado_id));
  porCuadrilla.forEach((e: any) => ids.add(e.id_empleado));
  return ids;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PRE-NÓMINA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get('/api/v1/personal/prenominas', requireRoles('personal_rh', 'admin', 'residencia'), async (req: Request, res: Response) => {
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

app.get('/api/v1/personal/prenominas/:id', requireRoles('personal_rh', 'admin', 'residencia'), async (req: Request, res: Response) => {
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

// Marcar pre-nómina como revisada por Residencia — prerequisito de
// /autorizar (con bypass admin). NO autoriza el pago. Ver
// specs/features/01-revision-nomina-residencia.md (D2).
app.patch('/api/v1/personal/prenominas/:id/marcar-revisado', requireRoles('residencia', 'admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId } = req.securityContext;

    const includeDetalles = {
      detalles: {
        include: { empleado: { select: { nombre: true, apellido_paterno: true, numero_empleado: true, puesto: true } } },
      },
    } as const;

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const pn = await prisma.preNomina.findUnique({ where: { id_prenomina: id }, include: includeDetalles });
      if (!pn) return null;
      if (pn.revisado_por_residencia) return pn; // idempotente: ya revisada, no-op

      return prisma.preNomina.update({
        where: { id_prenomina: id },
        data: {
          revisado_por_residencia: true,
          revisado_at: new Date(),
          revisado_por_usuario_id: userId,
        },
        include: includeDetalles,
      });
    });

    if (!data) { res.status(404).json(createApiError('PER_NOT_FOUND', 'Pre-nómina no encontrada.')); return; }
    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
  }
});

// Calcular pre-nómina automática para empleados activos del proyecto
app.post('/api/v1/personal/prenominas/calcular', requireRoles('personal_rh', 'admin'), async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { periodo_inicio, periodo_fin } = req.body;
    // periodo_tipo ya NO se lee del body (contrato anterior) — la periodicidad
    // se toma de ConfigNominaProyecto, configurada por RH a nivel proyecto.

    if (!periodo_inicio || !periodo_fin) {
      res.status(400).json(createApiError('PER_MISSING_FIELDS', 'periodo_inicio y periodo_fin son obligatorios.'));
      return;
    }

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const configProyecto = await prisma.configNominaProyecto.findFirst({ where: { tenant_id: tenantId, proyecto_id: proyectoId } });
      const periodo_tipo = configProyecto?.periodicidad_pago ?? 'SEMANAL';

      const empleadoIds = await obtenerEmpleadoIdsDelProyecto(prisma, tenantId, proyectoId, new Date(periodo_inicio));
      const empleados = empleadoIds.size > 0
        ? await prisma.empleado.findMany({ where: { id_empleado: { in: Array.from(empleadoIds) }, estado: 'ACTIVO' } })
        : [];
      if (empleados.length === 0) throw new Error('No hay empleados activos en este proyecto.');

      const inicio = new Date(periodo_inicio);
      const fin    = new Date(periodo_fin);
      const diasPeriodo = Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      const count  = await prisma.preNomina.count();
      const prefijoPeriodo = periodo_tipo === 'QUINCENAL' ? 'Q' : periodo_tipo === 'MENSUAL' ? 'M' : 'S';
      const codigo = `NOM-${new Date().getFullYear()}-${prefijoPeriodo}${String(count + 1).padStart(2, '0')}`;

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
          const isrBruto = calcularISR(baseISR, periodo_tipo);
          const subsidio = calcularSubsidio(percepciones, periodo_tipo);
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
          codigo, periodo_tipo,
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

// Autorizar pre-nómina (RBAC: admin | personal_rh)
app.patch('/api/v1/personal/prenominas/:id/autorizar', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId, roles } = req.securityContext;

    if (!roles.includes('admin') && !roles.includes('personal_rh')) {
      res.status(403).json(createApiError('PER_FORBIDDEN', 'Solo admin o personal_rh pueden autorizar pre-nóminas.'));
      return;
    }

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const pn = await prisma.preNomina.findUnique({ where: { id_prenomina: id } });
      if (!pn) throw new Error('Pre-nómina no encontrada.');
      if (pn.estado !== EstadoPreNomina.CALCULADA) throw new Error(`Solo se puede autorizar una pre-nómina CALCULADA. Estado actual: ${pn.estado}`);
      // Prerequisito: Residencia debe haber revisado la pre-nómina antes de
      // que RH la autorice — admin tiene bypass auditado (queda registrado
      // en el propio `revisado_por_residencia` de la pre-nómina, que sigue
      // en false si se autorizó vía bypass). Ver
      // specs/features/01-revision-nomina-residencia.md (D2).
      if (!pn.revisado_por_residencia && !roles.includes('admin')) {
        return { revisionPendiente: true } as const;
      }

      return await prisma.preNomina.update({
        where: { id_prenomina: id },
        data: {
          estado: EstadoPreNomina.AUTORIZADA,
          autorizado_por: userId,
          fecha_autorizacion: new Date(),
        },
      });
    });

    if ((data as any).revisionPendiente) {
      res.status(409).json(createApiError('PER_REVISION_PENDIENTE', 'La pre-nómina debe ser revisada por Residencia antes de autorizarse.'));
      return;
    }
    const pnAutorizada = data as Exclude<typeof data, { revisionPendiente: true }>;

    void eventBus.publish({
      event_type: 'personal.nomina_autorizada',
      timestamp: new Date().toISOString(),
      context: { tenant_id: tenantId, proyecto_id: proyectoId, user_id: userId },
      payload: {
        prenomina_id:          pnAutorizada.id_prenomina,
        codigo:                pnAutorizada.codigo,
        periodo_tipo:          pnAutorizada.periodo_tipo,
        periodo_inicio:        pnAutorizada.periodo_inicio.toISOString(),
        periodo_fin:           pnAutorizada.periodo_fin.toISOString(),
        total_percepciones:    Number(pnAutorizada.total_percepciones),
        total_deducciones:     Number(pnAutorizada.total_deducciones),
        total_neto:            Number(pnAutorizada.total_neto),
        total_empleados:       Number(pnAutorizada.total_empleados),
        autorizado_por_id:     userId,
        autorizado_por_nombre: userId,
      },
    }).catch((err: any) => console.error('[Personal] eventBus.publish error (nomina_autorizada):', err.message));
    console.log(`[Personal] ✅ Pre-nómina ${pnAutorizada.codigo} AUTORIZADA`);
    res.json(createApiResponse(pnAutorizada, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
  }
});

// Marcar pre-nómina como PAGADA (RBAC: admin | personal_rh)
app.patch('/api/v1/personal/prenominas/:id/pagar', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId, roles } = req.securityContext;
    if (!roles.includes('admin') && !roles.includes('personal_rh')) {
      res.status(403).json(createApiError('PER_FORBIDDEN', 'Solo admin o personal_rh pueden marcar una nómina como pagada.'));
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

      const limiteVencimiento = new Date(hoy.getTime() + DIAS_VENCIMIENTO_DEFAULT * 24 * 60 * 60 * 1000);
      const [documentosVencidos, documentosPorVencer] = await Promise.all([
        prisma.documentoEmpleado.count({ where: { tenant_id: tenantId, fecha_vigencia: { not: null, lt: hoy } } }),
        prisma.documentoEmpleado.count({ where: { tenant_id: tenantId, fecha_vigencia: { not: null, gte: hoy, lte: limiteVencimiento } } }),
      ]);

      const ausenciasHoy = Math.max(0, empleadosActivos - asistenciaHoy);
      const alertas: Array<{ tipo: string; mensaje: string; severidad: string }> = [];
      if (ausenciasHoy > 0) {
        alertas.push({ tipo: 'AUSENCIAS', mensaje: `${ausenciasHoy} empleado(s) sin asistencia registrada hoy`, severidad: ausenciasHoy > 5 ? 'critica' : 'advertencia' });
      }
      if (ultimaPrenomina?.estado === 'PENDIENTE') {
        alertas.push({ tipo: 'PRENOMINA_PENDIENTE', mensaje: `Pre-nómina ${ultimaPrenomina.codigo} pendiente de autorización`, severidad: 'advertencia' });
      }
      const totalVencimientos = documentosVencidos + documentosPorVencer;
      if (totalVencimientos > 0) {
        alertas.push({
          tipo: 'DOCUMENTO_POR_VENCER',
          mensaje: `${totalVencimientos} documento(s) de expediente vencido(s) o por vencer`,
          severidad: documentosVencidos > 0 ? 'critica' : 'advertencia',
        });
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

// Motor de doble-scan compartido: JORNADA_COMPLETA (upsert de estado) y
// POR_HORAS (sin registro/forzar ENTRADA → entrada; con entrada sin salida →
// salida; con ambas → idempotente). Usado por el registro manual y por el
// endpoint de escaneo seguro (credenciales-asistencia-qr-segura).
async function aplicarDobleScan(prisma: any, params: {
  tenantId: string; proyectoId: string; userId: string; empleadoId: string; fecha: string;
  cuadrillaId?: string | null; estado?: string; tipoRegistro?: string; horasExtra?: number;
  horaEntrada?: string; horaSalida?: string; tipoScan?: string;
}) {
  const { tenantId, proyectoId, userId, empleadoId, fecha, cuadrillaId, estado, tipoRegistro, horasExtra, horaEntrada, horaSalida } = params;
  const scan = params.tipoScan ?? 'AUTO';
  const ahora = new Date();

  const emp = await prisma.empleado.findFirst({
    where: { id_empleado: empleadoId, tenant_id: tenantId },
    select: { modo_asistencia: true, horas_jornada: true },
  });
  const esPorHoras = emp?.modo_asistencia === 'POR_HORAS';

  if (!esPorHoras) {
    // ── JORNADA_COMPLETA: upsert estado ─────────────────────────────────────
    const ESTADOS_VALIDOS = ['PRESENTE', 'AUSENTE', 'INCAPACIDAD', 'JUSTIFICADA', 'FALTA'];
    const estadoFinal = estado ?? 'PRESENTE';
    if (!ESTADOS_VALIDOS.includes(estadoFinal)) {
      throw new Error(`Estado inválido: ${estadoFinal}`);
    }
    return prisma.registroAsistencia.upsert({
      where: { tenant_id_empleado_id_fecha: { tenant_id: tenantId, empleado_id: empleadoId, fecha: new Date(fecha) } },
      create: {
        tenant_id: tenantId, proyecto_id: proyectoId, empleado_id: empleadoId,
        cuadrilla_id: cuadrillaId ?? null,
        fecha: new Date(fecha), estado: estadoFinal,
        tipo_registro: tipoRegistro ?? 'MANUAL',
        horas_extra: horasExtra ?? 0,
        registrado_por: userId, ultimo_scan_en: ahora,
      },
      update: {
        estado: estadoFinal,
        horas_extra: horasExtra ?? 0,
        tipo_registro: tipoRegistro ?? 'MANUAL',
        registrado_por: userId, ultimo_scan_en: ahora,
      },
    });
  }

  // ── POR_HORAS: lógica de doble-scan ────────────────────────────────────────
  const horaActual = ahora.toTimeString().slice(0, 5); // HH:MM
  const existente  = await prisma.registroAsistencia.findUnique({
    where: { tenant_id_empleado_id_fecha: { tenant_id: tenantId, empleado_id: empleadoId, fecha: new Date(fecha) } },
  });

  if (!existente || scan === 'ENTRADA') {
    // Primer scan o forzar entrada
    const hE = horaEntrada ?? horaActual;
    return prisma.registroAsistencia.upsert({
      where: { tenant_id_empleado_id_fecha: { tenant_id: tenantId, empleado_id: empleadoId, fecha: new Date(fecha) } },
      create: {
        tenant_id: tenantId, proyecto_id: proyectoId, empleado_id: empleadoId,
        cuadrilla_id: cuadrillaId ?? null,
        fecha: new Date(fecha), estado: 'PRESENTE',
        tipo_registro: tipoRegistro ?? (scan === 'AUTO' ? 'QR' : 'MANUAL'),
        horas_extra: 0, registrado_por: userId,
        hora_entrada: hE, origen_horas: 'REAL', ultimo_scan_en: ahora,
      },
      update: { hora_entrada: hE, registrado_por: userId, ultimo_scan_en: ahora },
    });
  }

  if ((existente as any).hora_entrada && !(existente as any).hora_salida && scan !== 'ENTRADA') {
    // Segundo scan → registrar salida y calcular horas
    if (scan === 'SALIDA' && !horaSalida && !horaActual) {
      throw new Error('hora_salida es obligatoria para tipo_scan SALIDA.');
    }
    const hS = horaSalida ?? horaActual;
    const hE = String((existente as any).hora_entrada);
    const horasJornada = Number((emp as any)?.horas_jornada ?? 8);
    const trabajadas = calcularHorasTrabajadas(hE, hS);
    const { horas_normales, horas_extra_dia } = calcularHorasDesglose(trabajadas, horasJornada);
    return prisma.registroAsistencia.update({
      where: { id_registro: existente.id_registro },
      data: {
        hora_salida: hS, horas_trabajadas: trabajadas,
        horas_normales, horas_extra_dia,
        origen_horas: 'REAL', registrado_por: userId,
        tipo_registro: tipoRegistro ?? (scan === 'AUTO' ? 'QR' : 'MANUAL'),
        ultimo_scan_en: ahora,
      },
    });
  }

  // Ya tiene entrada y salida — idempotente (no actualiza ultimo_scan_en)
  return existente;
}

// POST /asistencia/registro — soporta JORNADA_COMPLETA y POR_HORAS con doble-scan
app.post('/api/v1/personal/asistencia/registro', requireRoles('residencia', 'control_obra', 'personal_rh', 'admin'), async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { empleado_id, fecha, estado, tipo_registro, horas_extra, cuadrilla_id,
            hora_entrada, hora_salida, tipo_scan } = req.body;
    if (!empleado_id || !fecha) {
      return res.status(400).json(createApiError('PER_MISSING_FIELDS', 'empleado_id y fecha son obligatorios.'));
    }

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      return aplicarDobleScan(prisma, {
        tenantId, proyectoId, userId, empleadoId: empleado_id, fecha,
        cuadrillaId: cuadrilla_id, estado, tipoRegistro: tipo_registro, horasExtra: horas_extra,
        horaEntrada: hora_entrada, horaSalida: hora_salida, tipoScan: tipo_scan,
      });
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
// CONFIGURACIÓN DE ASISTENCIA POR PROYECTO (geofencing opcional)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get('/api/v1/personal/config-asistencia', requireRoles('personal_rh', 'admin'), async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      return prisma.configAsistenciaProyecto.findFirst({ where: { tenant_id: tenantId, proyecto_id: proyectoId } });
    });
    res.json(createApiResponse(data ?? null, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
  }
});

app.put('/api/v1/personal/config-asistencia', requireRoles('personal_rh', 'admin'), async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { lat, lng, radio_metros } = req.body;
    if (lat === undefined || lng === undefined) {
      return res.status(400).json(createApiError('PER_MISSING_FIELDS', 'lat y lng son obligatorios.'));
    }
    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      return prisma.configAsistenciaProyecto.upsert({
        where: { tenant_id_proyecto_id: { tenant_id: tenantId, proyecto_id: proyectoId } },
        create: { tenant_id: tenantId, proyecto_id: proyectoId, lat, lng, radio_metros: radio_metros ?? 300, configurado_por: userId },
        update: { lat, lng, radio_metros: radio_metros ?? 300, configurado_por: userId },
      });
    });
    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
  }
});

function distanciaMetros(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // radio de la Tierra en metros
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ESCANEO SEGURO DE CREDENCIAL (asistencia por QR)
// El QR solo identifica al empleado — NUNCA autentica por sí solo. La
// autorización real vive en la sesión JWT de quien escanea (mismos roles
// que el registro manual de asistencia). Ver design.md de
// credenciales-asistencia-qr-segura para el detalle de cada candado.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.post('/api/v1/personal/asistencia/escanear', requireRoles('residencia', 'control_obra', 'personal_rh', 'admin'), async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { token, lat, lng } = req.body;
    if (!token) {
      return res.status(400).json(createApiError('PER_MISSING_FIELDS', 'token es obligatorio.'));
    }

    const resultado = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      // 1) Resolver token → empleado
      const credencial = await prisma.credencialEmpleado.findFirst({ where: { tenant_id: tenantId, token } });
      if (!credencial) return { status: 404, error: 'Credencial no encontrada.' };
      if (!credencial.activa) return { status: 410, error: 'Credencial revocada, contacte a RH.' };

      // 2) El empleado debe pertenecer al proyecto activo
      const empleadoIds = await obtenerEmpleadoIdsDelProyecto(prisma, tenantId, proyectoId);
      if (!empleadoIds.has(credencial.empleado_id)) {
        return { status: 403, error: 'Este empleado no está asignado al proyecto activo.' };
      }

      // 3) Cooldown anti-rescaneo
      const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
      const registroHoy = await prisma.registroAsistencia.findUnique({
        where: { tenant_id_empleado_id_fecha: { tenant_id: tenantId, empleado_id: credencial.empleado_id, fecha: hoy } },
      });
      const cooldownMs = ASISTENCIA_COOLDOWN_MINUTOS * 60 * 1000;
      if ((registroHoy as any)?.ultimo_scan_en) {
        const restanteMs = cooldownMs - (Date.now() - new Date((registroHoy as any).ultimo_scan_en).getTime());
        if (restanteMs > 0) {
          return { status: 429, error: `Espera ${Math.ceil(restanteMs / 1000)}s antes de volver a escanear a este empleado.` };
        }
      }

      // 4) Geofencing opcional
      const configGeo = await prisma.configAsistenciaProyecto.findFirst({ where: { tenant_id: tenantId, proyecto_id: proyectoId } });
      if (configGeo) {
        if (lat === undefined || lng === undefined) {
          return { status: 400, error: 'Este proyecto requiere ubicación del dispositivo. Activa el permiso de ubicación.' };
        }
        const distancia = distanciaMetros(Number(lat), Number(lng), Number(configGeo.lat), Number(configGeo.lng));
        if (distancia > configGeo.radio_metros) {
          return { status: 403, error: `Fuera del rango permitido del proyecto (${Math.round(distancia)}m, máximo ${configGeo.radio_metros}m).` };
        }
      }

      // 5) Doble-scan real
      const fecha = hoy.toISOString().slice(0, 10);
      const registro = await aplicarDobleScan(prisma, {
        tenantId, proyectoId, userId, empleadoId: credencial.empleado_id, fecha,
        tipoRegistro: 'QR', tipoScan: 'AUTO',
      });
      return { status: 201, registro };
    });

    if ((resultado as any).error) {
      return res.status((resultado as any).status).json(createApiError('PER_SCAN_ERROR', (resultado as any).error));
    }
    res.status(201).json(createApiResponse((resultado as any).registro, tenantId, proyectoId));
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
// EXPEDIENTE DIGITAL DEL EMPLEADO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.post('/api/v1/personal/empleados/:id/documentos',
  requireRoles('personal_rh', 'admin'),
  uploadExpediente.single('archivo'),
  async (req: Request, res: Response) => {
    const tmpFile = req.file?.path;
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { id } = req.params;
      const { tipo_documento, fecha_vigencia } = req.body;

      if (!tipo_documento || !TIPOS_DOCUMENTO_EMPLEADO.includes(tipo_documento)) {
        if (tmpFile) fs.unlinkSync(tmpFile);
        return res.status(400).json(createApiError('PER_VALIDATION', `tipo_documento debe ser uno de: ${TIPOS_DOCUMENTO_EMPLEADO.join(', ')}`));
      }
      if (!req.file) {
        return res.status(400).json(createApiError('PER_VALIDATION', 'El archivo es obligatorio.'));
      }

      const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
        const emp = await prisma.empleado.findFirst({ where: { id_empleado: id, tenant_id: tenantId } });
        if (!emp) return { notFound: true };

        const documento = await prisma.documentoEmpleado.create({
          data: {
            tenant_id: tenantId, empleado_id: id,
            tipo_documento,
            nombre_archivo: req.file!.originalname,
            ruta_archivo: '',
            mime_type: req.file!.mimetype,
            tamano_bytes: req.file!.size,
            fecha_vigencia: fecha_vigencia ? new Date(fecha_vigencia) : null,
            subido_por: userId,
          },
        });

        const ext = path.extname(req.file!.originalname).toLowerCase();
        const ruta = rutaArchivoExpediente(tenantId, id, documento.id_documento, ext);
        const destino = rutaAbsolutaExpediente(ruta);
        fs.mkdirSync(path.dirname(destino), { recursive: true });
        fs.renameSync(req.file!.path, destino);

        return { documento: await prisma.documentoEmpleado.update({ where: { id_documento: documento.id_documento }, data: { ruta_archivo: ruta } }) };
      });

      if ((data as any).notFound) {
        if (tmpFile) { try { fs.unlinkSync(tmpFile); } catch (_) { /* ok */ } }
        return res.status(404).json(createApiError('PER_NOT_FOUND', 'Empleado no encontrado.'));
      }

      console.log(`[Personal] ✅ Documento ${tipo_documento} subido para empleado ${id}`);
      res.status(201).json(createApiResponse((data as any).documento, tenantId, proyectoId));
    } catch (error: any) {
      if (tmpFile) { try { fs.unlinkSync(tmpFile); } catch (_) { /* ok */ } }
      res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
    }
  }
);

app.get('/api/v1/personal/empleados/:id/documentos', requireRoles('personal_rh', 'admin'), async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { id } = req.params;
    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      return prisma.documentoEmpleado.findMany({
        where: { tenant_id: tenantId, empleado_id: id },
        orderBy: { created_at: 'desc' },
      });
    });
    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
  }
});

app.get('/api/v1/personal/empleados/:id/documentos/:documentoId/archivo',
  requireRoles('personal_rh', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { id, documentoId } = req.params;

      const documento = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
        return prisma.documentoEmpleado.findFirst({ where: { id_documento: documentoId, tenant_id: tenantId, empleado_id: id } });
      });
      if (!documento) return res.status(404).json(createApiError('PER_NOT_FOUND', 'Documento no encontrado.'));

      const rutaAbsoluta = rutaAbsolutaExpediente(documento.ruta_archivo);
      if (!fs.existsSync(rutaAbsoluta)) {
        return res.status(500).json(createApiError('PER_FILE_MISSING', 'El archivo no está disponible en el servidor.'));
      }

      res.setHeader('Content-Disposition', `attachment; filename="${documento.nombre_archivo}"`);
      res.setHeader('Content-Type', documento.mime_type);
      res.sendFile(rutaAbsoluta);
    } catch (error: any) {
      res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
    }
  }
);

app.delete('/api/v1/personal/empleados/:id/documentos/:documentoId', requireRoles('personal_rh', 'admin'), async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { id, documentoId } = req.params;

    const resultado = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const documento = await prisma.documentoEmpleado.findFirst({ where: { id_documento: documentoId, tenant_id: tenantId, empleado_id: id } });
      if (!documento) return { notFound: true };

      const rutaAbsoluta = rutaAbsolutaExpediente(documento.ruta_archivo);
      try { fs.unlinkSync(rutaAbsoluta); } catch (_) { /* ignorar si ya no existe */ }

      await prisma.documentoEmpleado.delete({ where: { id_documento: documentoId } });
      return { deleted: true };
    });

    if ((resultado as any).notFound) return res.status(404).json(createApiError('PER_NOT_FOUND', 'Documento no encontrado.'));
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
  }
});

// GET /documentos/por-vencer — panel de RH: documentos vencidos o por vencer
app.get('/api/v1/personal/documentos/por-vencer', requireRoles('personal_rh', 'admin'), async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const dias = req.query.dias ? Number(req.query.dias) : DIAS_VENCIMIENTO_DEFAULT;

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const hoy = new Date();
      const limite = new Date(hoy.getTime() + dias * 24 * 60 * 60 * 1000);

      const documentos = await prisma.documentoEmpleado.findMany({
        where: { tenant_id: tenantId, fecha_vigencia: { not: null, lte: limite } },
        include: { empleado: { select: { nombre: true, apellido_paterno: true, numero_empleado: true } } },
        orderBy: { fecha_vigencia: 'asc' },
      });

      return documentos.map((d: any) => {
        const diasRestantes = Math.ceil((new Date(d.fecha_vigencia).getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
        return {
          id_documento: d.id_documento,
          empleado_id: d.empleado_id,
          empleado_nombre: `${d.empleado.nombre} ${d.empleado.apellido_paterno}`,
          numero_empleado: d.empleado.numero_empleado,
          tipo_documento: d.tipo_documento,
          fecha_vigencia: d.fecha_vigencia,
          dias_restantes: diasRestantes,
          estado: diasRestantes < 0 ? 'VENCIDO' : 'POR_VENCER',
        };
      });
    });

    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ASIGNACIÓN A RESIDENTE(S)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface ResidenteDisponible {
  id: string;
  nombre: string;
  email: string;
}

// Una sola llamada de listado a `auth` (en vez de N llamadas por id a una
// ruta que no existe). Reenvía el Authorization del usuario original, mismo
// patrón backend-a-backend ya usado en el resto de este archivo.
async function obtenerResidentesDisponibles(authorizationHeader: string): Promise<ResidenteDisponible[]> {
  const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://auth:3003';
  const r = await fetch(`${authServiceUrl}/api/v1/auth/usuarios?rol=residencia`, {
    headers: { Authorization: authorizationHeader || '' },
  });
  if (!r.ok) throw new Error('auth respondió no-ok');
  const body: any = await r.json();
  return Array.isArray(body?.data) ? body.data : [];
}

app.get('/api/v1/personal/residentes-disponibles', requireRoles('personal_rh', 'admin'), async (req: Request, res: Response) => {
  try {
    const residentes = await obtenerResidentesDisponibles(req.headers.authorization || '');
    res.json(createApiResponse(residentes, req.securityContext.tenantId, req.securityContext.proyectoId));
  } catch {
    res.status(502).json(createApiError('PER_AUTH_NO_DISPONIBLE', 'No se pudo obtener el directorio de residentes.'));
  }
});

app.post('/api/v1/personal/empleados/:id/residentes', requireRoles('personal_rh', 'admin'), async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { id } = req.params;
    const { residente_id, es_principal } = req.body;
    const esPrincipal = es_principal !== false; // default true

    if (!residente_id) {
      return res.status(400).json(createApiError('PER_MISSING_FIELDS', 'residente_id es obligatorio.'));
    }

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const emp = await prisma.empleado.findFirst({ where: { id_empleado: id, tenant_id: tenantId } });
      if (!emp) return { notFound: true };

      // Varias asignaciones vigentes al mismo empleado siguen permitidas
      // (personal compartido) — solo se desmarca cuál es la "principal",
      // sin cerrar (fecha_fin) ninguna otra. Ver spec 02, 2.1.
      if (esPrincipal) {
        await prisma.asignacionResidente.updateMany({
          where: { tenant_id: tenantId, empleado_id: id, fecha_fin: null, es_principal: true },
          data: { es_principal: false },
        });
      }

      const asignacion = await prisma.asignacionResidente.create({
        data: { tenant_id: tenantId, empleado_id: id, residente_id, asignado_por: userId, es_principal: esPrincipal },
      });
      return { asignacion };
    });

    if ((data as any).notFound) return res.status(404).json(createApiError('PER_NOT_FOUND', 'Empleado no encontrado.'));
    console.log(`[Personal] ✅ Residente ${residente_id} asignado a empleado ${id}`);
    res.status(201).json(createApiResponse((data as any).asignacion, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PRÉSTAMO DE EMPLEADO A OTRO PROYECTO (spec 02, sección 3)
// El "proyecto de origen" es el proyecto activo de la sesión de quien crea
// el préstamo (req.securityContext.proyectoId) — quien presta a alguien
// opera desde el proyecto que lo está prestando.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.post('/api/v1/personal/empleados/:id/prestamo', requireRoles('personal_rh', 'admin'), async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId: proyectoOrigenId, userId } = req.securityContext;
    const { id } = req.params;
    const { proyecto_destino_id, frente_trabajo, fecha_inicio, fecha_fin, turno, horas_diarias } = req.body;

    if (!proyecto_destino_id || !frente_trabajo || !fecha_inicio) {
      return res.status(400).json(createApiError('PER_MISSING_FIELDS', 'proyecto_destino_id, frente_trabajo y fecha_inicio son obligatorios.'));
    }

    const inicioNuevo = new Date(fecha_inicio);
    const finNuevo = fecha_fin ? new Date(fecha_fin) : null;

    const data = await createTenantContext({ tenantId, proyectoId: proyectoOrigenId, userId }, async (prisma) => {
      const emp = await prisma.empleado.findFirst({ where: { id_empleado: id, tenant_id: tenantId } });
      if (!emp) return { notFound: true } as const;

      // Empleado miembro de una Cuadrilla estructural activa en el proyecto
      // de origen: la pertenencia a Cuadrilla lo hace elegible ahí
      // independientemente de AsignacionFrente — no se puede prestar sin
      // que primero salga de la cuadrilla (spec 02, sección 7).
      if (emp.cuadrilla_id) {
        const cuadrilla = await prisma.cuadrilla.findFirst({ where: { id_cuadrilla: emp.cuadrilla_id, tenant_id: tenantId } });
        if (cuadrilla && cuadrilla.proyecto_id === proyectoOrigenId && cuadrilla.estado === 'ACTIVA') {
          return { cuadrillaActiva: true } as const;
        }
      }

      const solapadas = await prisma.asignacionFrente.findMany({
        where: {
          tenant_id: tenantId, empleado_id: id, estado: 'ACTIVA',
          proyecto_id: { not: proyecto_destino_id },
          fecha_inicio: { lte: finNuevo ?? new Date('9999-12-31') },
          OR: [{ fecha_fin: null }, { fecha_fin: { gte: inicioNuevo } }],
        },
      });

      // Dos préstamos solapados al mismo empleado son ambiguos (¿cuál manda
      // la asistencia real?) — se rechaza. Una asignación ESTRUCTURAL
      // solapada (es_prestamo: false) se trunca automáticamente, es
      // justamente lo que un préstamo hace.
      if (solapadas.some(a => a.es_prestamo)) {
        return { solapePrestamo: true } as const;
      }

      const diaAntes = new Date(inicioNuevo);
      diaAntes.setDate(diaAntes.getDate() - 1);
      for (const previa of solapadas) {
        if (previa.fecha_fin === null || previa.fecha_fin > diaAntes) {
          await prisma.asignacionFrente.update({ where: { id_asignacion: previa.id_asignacion }, data: { fecha_fin: diaAntes } });
        }
      }

      const asignacion = await prisma.asignacionFrente.create({
        data: {
          tenant_id: tenantId, proyecto_id: proyecto_destino_id,
          empleado_id: id, frente_trabajo, turno: turno || 'DIURNO',
          fecha_inicio: inicioNuevo, fecha_fin: finNuevo,
          horas_diarias: horas_diarias || 8, estado: 'ACTIVA', es_prestamo: true,
        },
      });
      return { asignacion, truncadas: solapadas.length } as const;
    });

    if ((data as any).notFound) return res.status(404).json(createApiError('PER_NOT_FOUND', 'Empleado no encontrado.'));
    if ((data as any).cuadrillaActiva) {
      return res.status(409).json(createApiError('PER_CUADRILLA_ACTIVA', 'El empleado pertenece a una Cuadrilla activa en el proyecto de origen; debe salir de ella antes de prestarlo.'));
    }
    if ((data as any).solapePrestamo) {
      return res.status(409).json(createApiError('PER_PRESTAMO_SOLAPADO', 'Ya existe un préstamo vigente de este empleado que se solapa con estas fechas.'));
    }

    console.log(`[Personal] ✅ Empleado ${id} prestado a proyecto ${proyecto_destino_id} (${(data as any).truncadas} asignación(es) de origen truncada(s))`);
    res.status(201).json(createApiResponse({ asignacion: (data as any).asignacion }, tenantId, proyectoOrigenId));
  } catch (error: any) {
    res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
  }
});

app.delete('/api/v1/personal/empleados/:id/residentes/:asignacionId', requireRoles('personal_rh', 'admin'), async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { id, asignacionId } = req.params;

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const asignacion = await prisma.asignacionResidente.findFirst({
        where: { id_asignacion: asignacionId, tenant_id: tenantId, empleado_id: id },
      });
      if (!asignacion) return null;
      return prisma.asignacionResidente.update({
        where: { id_asignacion: asignacionId },
        data: { fecha_fin: new Date() },
      });
    });

    if (!data) return res.status(404).json(createApiError('PER_NOT_FOUND', 'Asignación no encontrada.'));
    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
  }
});

app.get('/api/v1/personal/empleados/:id/residentes', requireRoles('personal_rh', 'admin'), async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { id } = req.params;
    const incluirHistorico = req.query.incluirHistorico === 'true';

    const asignaciones = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      return prisma.asignacionResidente.findMany({
        where: { tenant_id: tenantId, empleado_id: id, ...(incluirHistorico ? {} : { fecha_fin: null }) },
        orderBy: { fecha_inicio: 'desc' },
      });
    });

    let parcial = false;
    let residentesPorId = new Map<string, ResidenteDisponible>();
    try {
      const residentes = await obtenerResidentesDisponibles(req.headers.authorization || '');
      residentesPorId = new Map(residentes.map((r) => [r.id, r]));
    } catch {
      parcial = true;
    }
    const conNombre = asignaciones.map((a) => ({
      ...a,
      residente_nombre: residentesPorId.get(a.residente_id)?.nombre ?? null,
    }));

    res.json(createApiResponse({ asignaciones: conNombre, parcial }, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
  }
});

app.get('/api/v1/personal/mis-empleados', requireRoles('residencia'), async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const asignaciones = await prisma.asignacionResidente.findMany({
        where: { tenant_id: tenantId, residente_id: userId, fecha_fin: null },
        select: { empleado_id: true },
      });
      const empleadoIds = asignaciones.map(a => a.empleado_id);
      if (empleadoIds.length === 0) return [];
      return prisma.empleado.findMany({ where: { id_empleado: { in: empleadoIds }, tenant_id: tenantId } });
    });

    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
  }
});

// Vista "Mi equipo" (spec 02, sección 5): empleados a cargo del residente
// autenticado, agrupados por categoría, marcando quién está "compartido"
// (trabajando hoy en un proyecto distinto al de la sesión del residente).
app.get('/api/v1/personal/mis-empleados/resumen', requireRoles('residencia'), async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;

    const porCategoria = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const asignaciones = await prisma.asignacionResidente.findMany({
        where: { tenant_id: tenantId, residente_id: userId, fecha_fin: null },
        select: { empleado_id: true },
      });
      const empleadoIds = asignaciones.map(a => a.empleado_id);
      if (empleadoIds.length === 0) return [];

      const [empleados, asignacionesFrente] = await Promise.all([
        prisma.empleado.findMany({ where: { id_empleado: { in: empleadoIds }, tenant_id: tenantId } }),
        prisma.asignacionFrente.findMany({ where: { tenant_id: tenantId, empleado_id: { in: empleadoIds }, estado: 'ACTIVA' } }),
      ]);
      const proyectoActualPorEmpleado = new Map<string, string>();
      for (const a of asignacionesFrente) proyectoActualPorEmpleado.set(a.empleado_id, a.proyecto_id);

      const grupos = new Map<string, any[]>();
      for (const emp of empleados) {
        const proyectoActual = proyectoActualPorEmpleado.get(emp.id_empleado) ?? null;
        const compartido = proyectoActual !== null && proyectoActual !== proyectoId;
        const lista = grupos.get(emp.categoria) ?? [];
        lista.push({
          id_empleado: emp.id_empleado,
          nombre: `${emp.nombre} ${emp.apellido_paterno}`,
          numero_empleado: emp.numero_empleado,
          compartido,
          proyecto_actual_id: compartido ? proyectoActual : null,
        });
        grupos.set(emp.categoria, lista);
      }
      return Array.from(grupos.entries()).map(([categoria, empleadosCat]) => ({
        categoria, total: empleadosCat.length, empleados: empleadosCat,
      }));
    });

    res.json(createApiResponse({ por_categoria: porCategoria }, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CREDENCIAL DE EMPLEADO (token opaco revocable, impreso como QR)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function generarTokenCredencial(): string {
  return crypto.randomBytes(32).toString('base64url'); // ~43 chars, URL-safe, no derivable del id_empleado
}

app.post('/api/v1/personal/empleados/:id/credencial', requireRoles('personal_rh', 'admin'), async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { id } = req.params;

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const emp = await prisma.empleado.findFirst({ where: { id_empleado: id, tenant_id: tenantId } });
      if (!emp) return { notFound: true };

      const anterior = await prisma.credencialEmpleado.findFirst({ where: { tenant_id: tenantId, empleado_id: id, activa: true } });
      if (anterior) {
        await prisma.credencialEmpleado.update({
          where: { id_credencial: anterior.id_credencial },
          data: { activa: false, revocada_en: new Date(), revocada_por: userId, motivo_revocacion: 'Reemitida' },
        });
      }

      const nueva = await prisma.credencialEmpleado.create({
        data: { tenant_id: tenantId, empleado_id: id, token: generarTokenCredencial(), emitida_por: userId },
      });
      return { credencial: nueva };
    });

    if ((data as any).notFound) return res.status(404).json(createApiError('PER_NOT_FOUND', 'Empleado no encontrado.'));
    console.log(`[Personal] ✅ Credencial emitida para empleado ${id}`);
    res.status(201).json(createApiResponse((data as any).credencial, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
  }
});

app.get('/api/v1/personal/empleados/:id/credencial', requireRoles('personal_rh', 'admin'), async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { id } = req.params;
    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      return prisma.credencialEmpleado.findFirst({ where: { tenant_id: tenantId, empleado_id: id, activa: true } });
    });
    res.json(createApiResponse(data ?? null, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
  }
});

app.delete('/api/v1/personal/empleados/:id/credencial', requireRoles('personal_rh', 'admin'), async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { id } = req.params;
    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const activa = await prisma.credencialEmpleado.findFirst({ where: { tenant_id: tenantId, empleado_id: id, activa: true } });
      if (!activa) return null;
      return prisma.credencialEmpleado.update({
        where: { id_credencial: activa.id_credencial },
        data: { activa: false, revocada_en: new Date(), revocada_por: userId, motivo_revocacion: 'Revocada manualmente (perdida/robada)' },
      });
    });
    if (!data) return res.status(404).json(createApiError('PER_NOT_FOUND', 'Este empleado no tiene una credencial activa.'));
    console.log(`[Personal] ⚠️ Credencial revocada para empleado ${id}`);
    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
  }
});

// Datos listos para imprimir uno, varios o todos los empleados elegibles del
// proyecto activo — emite credencial automáticamente a quien no tenga una.
app.post('/api/v1/personal/empleados/credenciales/imprimir-lote', requireRoles('personal_rh', 'admin'), async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { empleado_ids } = req.body as { empleado_ids?: string[] };

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const elegiblesDelProyecto = await obtenerEmpleadoIdsDelProyecto(prisma, tenantId, proyectoId);
      const seleccionExplicita = Array.isArray(empleado_ids) && empleado_ids.length > 0;
      const idsSolicitados = seleccionExplicita
        ? empleado_ids!.filter(id => elegiblesDelProyecto.has(id))
        : Array.from(elegiblesDelProyecto);
      const excluidos = seleccionExplicita
        ? empleado_ids!.filter(id => !elegiblesDelProyecto.has(id))
        : [];

      const empleados = await prisma.empleado.findMany({ where: { id_empleado: { in: idsSolicitados }, tenant_id: tenantId, estado: 'ACTIVO' } });

      const resultado: any[] = [];
      for (const emp of empleados) {
        let credencial = await prisma.credencialEmpleado.findFirst({ where: { tenant_id: tenantId, empleado_id: emp.id_empleado, activa: true } });
        if (!credencial) {
          credencial = await prisma.credencialEmpleado.create({
            data: { tenant_id: tenantId, empleado_id: emp.id_empleado, token: generarTokenCredencial(), emitida_por: userId },
          });
        }
        const foto = await prisma.documentoEmpleado.findFirst({
          where: { tenant_id: tenantId, empleado_id: emp.id_empleado, tipo_documento: 'FOTO_CREDENCIAL' },
          orderBy: { created_at: 'desc' },
        });
        resultado.push({
          empleado: {
            id_empleado: emp.id_empleado, numero_empleado: emp.numero_empleado,
            nombre: emp.nombre, apellido_paterno: emp.apellido_paterno, puesto: emp.puesto, categoria: emp.categoria,
            contacto_emergencia: emp.contacto_emergencia ?? null,
          },
          token: credencial.token,
          emitida_en: credencial.emitida_en,
          foto_documento_id: foto?.id_documento ?? null,
        });
      }
      return { credenciales: resultado, excluidos };
    });

    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPLEMENTO SALARIAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get('/api/v1/personal/complementos', requireRoles('personal_rh', 'admin', 'residencia'), async (req: Request, res: Response) => {
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
    const { tenantId, proyectoId, userId, roles } = req.securityContext;
    const { id } = req.params;
    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const comp = await prisma.nominaComplementaria.findFirst({ where: { id_complemento: id, tenant_id: tenantId } });
      if (!comp) return null;
      if (comp.estado !== 'BORRADOR') return { estadoInvalido: true, estado: comp.estado };
      // Mismo prerequisito que /prenominas/:id/autorizar — ver D2.
      if (!comp.revisado_por_residencia && !roles.includes('admin')) return { revisionPendiente: true };
      return prisma.nominaComplementaria.update({
        where: { id_complemento: id },
        data: { estado: 'AUTORIZADA', autorizado_por: userId },
      });
    });
    if (!data) return res.status(404).json(createApiError('PER_NOT_FOUND', 'Complemento no encontrado.'));
    if ((data as any).estadoInvalido) return res.status(409).json(createApiError('PER_INVALID_STATE', `Solo se puede autorizar en BORRADOR. Estado actual: ${(data as any).estado}`));
    if ((data as any).revisionPendiente) return res.status(409).json(createApiError('PER_REVISION_PENDIENTE', 'El complemento salarial debe ser revisado por Residencia antes de autorizarse.'));
    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('PER_INTERNAL_ERROR', error.message));
  }
});

// Marcar complemento salarial como revisado por Residencia — prerequisito de
// /autorizar (con bypass admin). NO autoriza el pago. Ver
// specs/features/01-revision-nomina-residencia.md (D2).
app.patch('/api/v1/personal/complementos/:id/marcar-revisado', requireRoles('residencia', 'admin'), async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { id } = req.params;
    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const comp = await prisma.nominaComplementaria.findFirst({ where: { id_complemento: id, tenant_id: tenantId } });
      if (!comp) return null;
      if (comp.revisado_por_residencia) return comp; // idempotente: ya revisado, no-op
      return prisma.nominaComplementaria.update({
        where: { id_complemento: id },
        data: { revisado_por_residencia: true, revisado_at: new Date(), revisado_por_usuario_id: userId },
      });
    });
    if (!data) return res.status(404).json(createApiError('PER_NOT_FOUND', 'Complemento no encontrado.'));
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

// Manejo de errores de multer (expediente digital): tipo/tamaño inválido
app.use((err: any, _req: Request, res: Response, next: any) => {
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json(createApiError('PER_VALIDATION', 'El archivo supera el límite de 50 MB.'));
  }
  if (err?.message?.startsWith('Tipo de archivo no permitido')) {
    return res.status(400).json(createApiError('PER_VALIDATION', err.message));
  }
  next(err);
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
    console.log(`   PATCH /api/v1/personal/prenominas/:id/marcar-revisado`);
    console.log(`   PATCH /api/v1/personal/prenominas/:id/autorizar`);
    console.log(`   PATCH /api/v1/personal/prenominas/:id/pagar`);
    console.log(`   GET   /api/v1/personal/dashboard`);
    console.log(`   GET   /api/v1/personal/config-nomina`);
    console.log(`   PUT   /api/v1/personal/config-nomina`);
    console.log(`   POST  /api/v1/personal/empleados/:id/documentos`);
    console.log(`   GET   /api/v1/personal/empleados/:id/documentos`);
    console.log(`   GET   /api/v1/personal/empleados/:id/documentos/:documentoId/archivo`);
    console.log(`   DELETE /api/v1/personal/empleados/:id/documentos/:documentoId`);
    console.log(`   GET   /api/v1/personal/documentos/por-vencer`);
    console.log(`   POST  /api/v1/personal/empleados/:id/residentes`);
    console.log(`   DELETE /api/v1/personal/empleados/:id/residentes/:asignacionId`);
    console.log(`   GET   /api/v1/personal/empleados/:id/residentes`);
    console.log(`   GET   /api/v1/personal/mis-empleados`);
    console.log(`   GET   /api/v1/personal/config-asistencia`);
    console.log(`   PUT   /api/v1/personal/config-asistencia`);
    console.log(`   POST  /api/v1/personal/asistencia/escanear`);
    console.log(`   POST  /api/v1/personal/empleados/:id/credencial`);
    console.log(`   GET   /api/v1/personal/empleados/:id/credencial`);
    console.log(`   DELETE /api/v1/personal/empleados/:id/credencial`);
    console.log(`   POST  /api/v1/personal/empleados/credenciales/imprimir-lote`);
    console.log(`   GET   /health`);
  });
}

if (require.main === module) {
  void startServer();
}
