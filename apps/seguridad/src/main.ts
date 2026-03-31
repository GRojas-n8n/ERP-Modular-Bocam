import express, { Request, Response } from 'express';
import { createTenantContext } from './db';
import {
  createApiResponse, createApiError,
  SeguridadEvents, EstadoIncidente, ResultadoInspeccion, EstadoPermiso,
} from './types';
import { createAuthMiddleware, requireEnv, requireProjectAccess } from '../../../packages/auth-middleware/src';
import { createEventBus } from '../../../packages/event-bus/src';

/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Clasificación: Estrictamente Confidencial.
 * ---------------------------------------------------------------------------
 * Módulo: Seguridad / HSE (Higiene, Seguridad y Medio Ambiente)
 * Puerto: 3007
 *
 * Responsabilidades:
 * 1. Registrar y gestionar incidentes de seguridad (accidentes, casi-accidentes).
 * 2. Realizar inspecciones periódicas de seguridad en sitio.
 * 3. Emitir y controlar permisos de trabajo de alto riesgo.
 * 4. Gestionar capacitaciones y certificaciones HSE del personal.
 * 5. Emitir eventos al bus para consumo de otros módulos.
 * ---------------------------------------------------------------------------
 */

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3007;
const JWT_SECRET = requireEnv('JWT_SECRET');

// EventBus
const eventBus = createEventBus('seguridad');

app.use(createAuthMiddleware({
  jwtSecret: JWT_SECRET,
  excludePaths: ['/health'],
}));
app.use(requireProjectAccess());

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INCIDENTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get('/api/v1/seguridad/incidentes', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const tipo = req.query.tipo as string;
    const severidad = req.query.severidad as string;
    const estado = req.query.estado as string;

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      return await prisma.incidente.findMany({
        where: {
          ...(tipo && { tipo }),
          ...(severidad && { severidad }),
          ...(estado && { estado }),
        },
        orderBy: { fecha_incidente: 'desc' },
      });
    });
    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('SEG_INTERNAL_ERROR', error.message));
  }
});

app.post('/api/v1/seguridad/incidentes', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const {
      tipo, severidad, fecha_incidente, hora_incidente, ubicacion, descripcion,
      empleado_afectado_id, empleado_afectado_nombre, testigos,
    } = req.body;

    if (!tipo || !ubicacion || !descripcion) {
      res.status(400).json(createApiError('SEG_MISSING_FIELDS', 'tipo, ubicacion y descripcion son obligatorios.'));
      return;
    }

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const count = await prisma.incidente.count();
      const codigo = `INC-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

      return await prisma.incidente.create({
        data: {
          tenant_id: tenantId, proyecto_id: proyectoId,
          codigo, tipo, severidad: severidad || 'MEDIA',
          fecha_incidente: new Date(fecha_incidente || new Date()),
          hora_incidente, ubicacion, descripcion,
          empleado_afectado_id, empleado_afectado_nombre,
          testigos: testigos ? JSON.stringify(testigos) : null,
          estado: EstadoIncidente.ABIERTO,
          reportado_por: userId,
        },
      });
    });

    // Publicar evento
    try {
      await eventBus.publish({
        event_type: SeguridadEvents.INCIDENTE_REPORTADO,
        timestamp: new Date().toISOString(),
        context: { tenant_id: tenantId, proyecto_id: proyectoId, user_id: userId },
        payload: { id_incidente: data.id_incidente, codigo: data.codigo, tipo, severidad: data.severidad },
      });
    } catch (_) { /* EventBus offline — degradación elegante */ }

    console.log(`[Seguridad] 🚨 Incidente ${data.codigo} reportado: ${tipo} — ${data.severidad}`);
    res.status(201).json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('SEG_INTERNAL_ERROR', error.message));
  }
});

app.patch('/api/v1/seguridad/incidentes/:id/investigar', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { causa_raiz, accion_correctiva, accion_preventiva } = req.body;

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      return await prisma.incidente.update({
        where: { id_incidente: id },
        data: {
          causa_raiz, accion_correctiva, accion_preventiva,
          estado: EstadoIncidente.EN_INVESTIGACION,
        },
      });
    });
    console.log(`[Seguridad] 🔍 Incidente ${data.codigo} en investigación`);
    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('SEG_INTERNAL_ERROR', error.message));
  }
});

app.patch('/api/v1/seguridad/incidentes/:id/cerrar', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { accion_correctiva, accion_preventiva, dias_incapacidad, requirio_atencion_medica, reportado_stps } = req.body;

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      return await prisma.incidente.update({
        where: { id_incidente: id },
        data: {
          estado: EstadoIncidente.CERRADO,
          cerrado_por: userId,
          fecha_cierre: new Date(),
          ...(accion_correctiva && { accion_correctiva }),
          ...(accion_preventiva && { accion_preventiva }),
          ...(dias_incapacidad !== undefined && { dias_incapacidad }),
          ...(requirio_atencion_medica !== undefined && { requirio_atencion_medica }),
          ...(reportado_stps !== undefined && { reportado_stps }),
        },
      });
    });

    try {
      await eventBus.publish({
        event_type: SeguridadEvents.INCIDENTE_CERRADO,
        timestamp: new Date().toISOString(),
        context: { tenant_id: tenantId, proyecto_id: proyectoId, user_id: userId },
        payload: { id_incidente: data.id_incidente, codigo: data.codigo, dias_incapacidad: data.dias_incapacidad },
      });
    } catch (_) { /* degradación elegante */ }

    console.log(`[Seguridad] ✅ Incidente ${data.codigo} CERRADO`);
    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('SEG_INTERNAL_ERROR', error.message));
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INSPECCIONES DE SEGURIDAD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get('/api/v1/seguridad/inspecciones', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const resultado = req.query.resultado as string;

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      return await prisma.inspeccionSeguridad.findMany({
        where: { ...(resultado && { resultado }) },
        orderBy: { fecha_inspeccion: 'desc' },
      });
    });
    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('SEG_INTERNAL_ERROR', error.message));
  }
});

app.post('/api/v1/seguridad/inspecciones', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const {
      tipo_inspeccion, fecha_inspeccion, area_inspeccionada,
      items_revisados, items_conformes, items_no_conformes,
      resultado, observaciones, hallazgos, inspector_nombre,
    } = req.body;

    if (!tipo_inspeccion || !area_inspeccionada) {
      res.status(400).json(createApiError('SEG_MISSING_FIELDS', 'tipo_inspeccion y area_inspeccionada son obligatorios.'));
      return;
    }

    const totalRev = items_revisados || 0;
    const totalConf = items_conformes || 0;
    const pct = totalRev > 0 ? (totalConf / totalRev) * 100 : 0;

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const count = await prisma.inspeccionSeguridad.count();
      const codigo = `INS-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

      return await prisma.inspeccionSeguridad.create({
        data: {
          tenant_id: tenantId, proyecto_id: proyectoId,
          codigo, tipo_inspeccion,
          fecha_inspeccion: new Date(fecha_inspeccion || new Date()),
          area_inspeccionada,
          items_revisados: totalRev,
          items_conformes: totalConf,
          items_no_conformes: items_no_conformes || (totalRev - totalConf),
          porcentaje_cumplimiento: pct,
          resultado: resultado || (pct >= 90 ? 'APROBADA' : pct >= 70 ? 'OBSERVACIONES' : 'NO_APROBADA'),
          observaciones,
          hallazgos: hallazgos ? JSON.stringify(hallazgos) : null,
          inspector_id: userId,
          inspector_nombre: inspector_nombre || 'Inspector',
        },
      });
    });

    try {
      await eventBus.publish({
        event_type: SeguridadEvents.INSPECCION_COMPLETADA,
        timestamp: new Date().toISOString(),
        context: { tenant_id: tenantId, proyecto_id: proyectoId, user_id: userId },
        payload: { id_inspeccion: data.id_inspeccion, codigo: data.codigo, resultado: data.resultado, porcentaje: Number(data.porcentaje_cumplimiento) },
      });
    } catch (_) { /* degradación elegante */ }

    console.log(`[Seguridad] 📋 Inspección ${data.codigo}: ${data.resultado} (${Number(data.porcentaje_cumplimiento).toFixed(0)}%)`);
    res.status(201).json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('SEG_INTERNAL_ERROR', error.message));
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PERMISOS DE TRABAJO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get('/api/v1/seguridad/permisos', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const tipo = req.query.tipo as string;
    const estado = req.query.estado as string;

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      return await prisma.permisoTrabajo.findMany({
        where: {
          ...(tipo && { tipo_permiso: tipo }),
          ...(estado && { estado }),
        },
        orderBy: { fecha_inicio: 'desc' },
      });
    });
    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('SEG_INTERNAL_ERROR', error.message));
  }
});

app.post('/api/v1/seguridad/permisos', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const {
      tipo_permiso, area_trabajo, descripcion_trabajo,
      fecha_inicio, fecha_fin, epp_requerido, medidas_control,
      solicitante_nombre, trabajadores,
    } = req.body;

    if (!tipo_permiso || !area_trabajo || !descripcion_trabajo) {
      res.status(400).json(createApiError('SEG_MISSING_FIELDS', 'tipo_permiso, area_trabajo y descripcion_trabajo son obligatorios.'));
      return;
    }

    // Prefijos por tipo
    const prefijos: Record<string, string> = {
      ALTURAS: 'ALT', ESPACIO_CONFINADO: 'EC', TRABAJO_CALIENTE: 'CAL',
      EXCAVACION: 'EXC', IZAJE: 'IZA', ELECTRICO: 'ELE',
    };

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const count = await prisma.permisoTrabajo.count();
      const pref = prefijos[tipo_permiso] || 'GEN';
      const codigo = `PT-${pref}-${String(count + 1).padStart(3, '0')}`;

      return await prisma.permisoTrabajo.create({
        data: {
          tenant_id: tenantId, proyecto_id: proyectoId,
          codigo, tipo_permiso, area_trabajo, descripcion_trabajo,
          fecha_inicio: new Date(fecha_inicio || new Date()),
          fecha_fin: new Date(fecha_fin || new Date(Date.now() + 10 * 3600000)),
          estado: EstadoPermiso.VIGENTE,
          epp_requerido: epp_requerido ? JSON.stringify(epp_requerido) : null,
          medidas_control,
          solicitado_por: userId,
          solicitante_nombre: solicitante_nombre || 'Solicitante',
          trabajadores: trabajadores ? JSON.stringify(trabajadores) : null,
        },
      });
    });

    try {
      await eventBus.publish({
        event_type: SeguridadEvents.PERMISO_TRABAJO_EMITIDO,
        timestamp: new Date().toISOString(),
        context: { tenant_id: tenantId, proyecto_id: proyectoId, user_id: userId },
        payload: { id_permiso: data.id_permiso, codigo: data.codigo, tipo_permiso },
      });
    } catch (_) { /* degradación elegante */ }

    console.log(`[Seguridad] 📝 Permiso ${data.codigo} emitido: ${tipo_permiso}`);
    res.status(201).json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('SEG_INTERNAL_ERROR', error.message));
  }
});

app.patch('/api/v1/seguridad/permisos/:id/autorizar', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId, roles } = req.securityContext;
    const { autorizador_nombre } = req.body;

    if (!roles.includes('admin') && !roles.includes('hse_manager') && !roles.includes('superintendent')) {
      res.status(403).json(createApiError('SEG_FORBIDDEN', 'Solo admin, hse_manager o superintendent pueden autorizar permisos.'));
      return;
    }

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      return await prisma.permisoTrabajo.update({
        where: { id_permiso: id },
        data: {
          autorizado_por: userId,
          autorizador_nombre: autorizador_nombre || 'Autorizado',
          checklist_previo: true,
        },
      });
    });
    console.log(`[Seguridad] ✅ Permiso ${data.codigo} AUTORIZADO`);
    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('SEG_INTERNAL_ERROR', error.message));
  }
});

app.patch('/api/v1/seguridad/permisos/:id/cerrar', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId } = req.securityContext;

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      return await prisma.permisoTrabajo.update({
        where: { id_permiso: id },
        data: { estado: EstadoPermiso.EXPIRADO },
      });
    });

    try {
      await eventBus.publish({
        event_type: SeguridadEvents.PERMISO_TRABAJO_CERRADO,
        timestamp: new Date().toISOString(),
        context: { tenant_id: tenantId, proyecto_id: proyectoId, user_id: userId },
        payload: { id_permiso: data.id_permiso, codigo: data.codigo },
      });
    } catch (_) { /* degradación elegante */ }

    console.log(`[Seguridad] 🔒 Permiso ${data.codigo} cerrado/expirado`);
    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('SEG_INTERNAL_ERROR', error.message));
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CAPACITACIONES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get('/api/v1/seguridad/capacitaciones', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      return await prisma.capacitacion.findMany({
        include: { _count: { select: { registros: true } } },
        orderBy: { fecha: 'desc' },
      });
    });
    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('SEG_INTERNAL_ERROR', error.message));
  }
});

app.get('/api/v1/seguridad/capacitaciones/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId } = req.securityContext;

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      return await prisma.capacitacion.findUnique({
        where: { id_capacitacion: id },
        include: { registros: true },
      });
    });

    if (!data) { res.status(404).json(createApiError('SEG_NOT_FOUND', 'Capacitación no encontrada.')); return; }
    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('SEG_INTERNAL_ERROR', error.message));
  }
});

app.post('/api/v1/seguridad/capacitaciones', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { titulo, tipo, instructor, fecha, duracion_horas, ubicacion, contenido, validez_meses } = req.body;

    if (!titulo || !tipo || !instructor) {
      res.status(400).json(createApiError('SEG_MISSING_FIELDS', 'titulo, tipo e instructor son obligatorios.'));
      return;
    }

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const count = await prisma.capacitacion.count();
      const codigo = `CAP-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

      return await prisma.capacitacion.create({
        data: {
          tenant_id: tenantId, proyecto_id: proyectoId,
          codigo, titulo, tipo, instructor,
          fecha: new Date(fecha || new Date()),
          duracion_horas: duracion_horas || 1,
          ubicacion, contenido,
          validez_meses: validez_meses || null,
          estado: 'PROGRAMADA',
        },
      });
    });

    console.log(`[Seguridad] 📚 Capacitación ${data.codigo} creada: ${data.titulo}`);
    res.status(201).json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('SEG_INTERNAL_ERROR', error.message));
  }
});

app.patch('/api/v1/seguridad/capacitaciones/:id/completar', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId } = req.securityContext;

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const cap = await prisma.capacitacion.update({
        where: { id_capacitacion: id },
        data: { estado: 'COMPLETADA' },
        include: { _count: { select: { registros: true } } },
      });
      return cap;
    });

    try {
      await eventBus.publish({
        event_type: SeguridadEvents.CAPACITACION_COMPLETADA,
        timestamp: new Date().toISOString(),
        context: { tenant_id: tenantId, proyecto_id: proyectoId, user_id: userId },
        payload: { id_capacitacion: data.id_capacitacion, codigo: data.codigo, titulo: data.titulo, asistentes: data._count.registros },
      });
    } catch (_) { /* degradación elegante */ }

    console.log(`[Seguridad] ✅ Capacitación ${data.codigo} COMPLETADA`);
    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('SEG_INTERNAL_ERROR', error.message));
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DASHBOARD DE SEGURIDAD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.get('/api/v1/seguridad/dashboard', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const [
        totalIncidentes, incidentesAbiertos, incidentesCriticos,
        totalInspecciones, inspeccionesAprobadas, inspeccionesNoAprobadas,
        permisosVigentes, totalCapacitaciones, capacitacionesCompletadas,
        totalAsistentes,
      ] = await Promise.all([
        prisma.incidente.count(),
        prisma.incidente.count({ where: { estado: { not: 'CERRADO' } } }),
        prisma.incidente.count({ where: { severidad: 'CRITICA' } }),
        prisma.inspeccionSeguridad.count(),
        prisma.inspeccionSeguridad.count({ where: { resultado: 'APROBADA' } }),
        prisma.inspeccionSeguridad.count({ where: { resultado: 'NO_APROBADA' } }),
        prisma.permisoTrabajo.count({ where: { estado: 'VIGENTE' } }),
        prisma.capacitacion.count(),
        prisma.capacitacion.count({ where: { estado: 'COMPLETADA' } }),
        prisma.registroCapacitacion.count({ where: { aprobado: true } }),
      ]);

      // Días sin accidentes (desde el último accidente cerrado)
      const ultimoAccidente = await prisma.incidente.findFirst({
        where: { tipo: 'ACCIDENTE' },
        orderBy: { fecha_incidente: 'desc' },
        select: { fecha_incidente: true },
      });
      const diasSinAccidente = ultimoAccidente
        ? Math.floor((Date.now() - new Date(ultimoAccidente.fecha_incidente).getTime()) / (1000 * 60 * 60 * 24))
        : 999;

      // Incidentes por tipo
      const porTipo = await prisma.incidente.groupBy({
        by: ['tipo'],
        _count: true,
      });

      // Tasa de cumplimiento promedio
      const avgCumplimiento = await prisma.inspeccionSeguridad.aggregate({
        _avg: { porcentaje_cumplimiento: true },
      });

      return {
        resumen: {
          total_incidentes: totalIncidentes,
          incidentes_abiertos: incidentesAbiertos,
          incidentes_criticos: incidentesCriticos,
          dias_sin_accidente: diasSinAccidente,
          total_inspecciones: totalInspecciones,
          inspecciones_aprobadas: inspeccionesAprobadas,
          inspecciones_no_aprobadas: inspeccionesNoAprobadas,
          tasa_cumplimiento: Number(avgCumplimiento._avg.porcentaje_cumplimiento || 0).toFixed(1),
          permisos_vigentes: permisosVigentes,
          total_capacitaciones: totalCapacitaciones,
          capacitaciones_completadas: capacitacionesCompletadas,
          personal_capacitado: totalAsistentes,
        },
        incidentes_por_tipo: porTipo.map((t: any) => ({ tipo: t.tipo, cantidad: t._count })),
      };
    });

    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('SEG_INTERNAL_ERROR', error.message));
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HEALTH CHECK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', module: 'seguridad', version: '1.0.0', timestamp: new Date().toISOString() });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ARRANQUE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.listen(PORT, async () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🛡️  Módulo: SEGURIDAD / HSE');
  console.log('  🏢  Propiedad: Constructora Bocam, S. A. de C.V.');
  console.log('  🔐  Autenticación: JWT REAL (Bearer Token)');
  console.log('  📡  EventBus: @bocam/event-bus (RabbitMQ)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`[Seguridad] ✅ Servidor en puerto ${PORT}`);
  console.log(`[Seguridad] 📡 Rutas disponibles:`);
  console.log(`   GET   /api/v1/seguridad/incidentes`);
  console.log(`   POST  /api/v1/seguridad/incidentes`);
  console.log(`   PATCH /api/v1/seguridad/incidentes/:id/investigar`);
  console.log(`   PATCH /api/v1/seguridad/incidentes/:id/cerrar`);
  console.log(`   GET   /api/v1/seguridad/inspecciones`);
  console.log(`   POST  /api/v1/seguridad/inspecciones`);
  console.log(`   GET   /api/v1/seguridad/permisos`);
  console.log(`   POST  /api/v1/seguridad/permisos`);
  console.log(`   PATCH /api/v1/seguridad/permisos/:id/autorizar`);
  console.log(`   PATCH /api/v1/seguridad/permisos/:id/cerrar`);
  console.log(`   GET   /api/v1/seguridad/capacitaciones`);
  console.log(`   GET   /api/v1/seguridad/capacitaciones/:id`);
  console.log(`   POST  /api/v1/seguridad/capacitaciones`);
  console.log(`   PATCH /api/v1/seguridad/capacitaciones/:id/completar`);
  console.log(`   GET   /api/v1/seguridad/dashboard`);
  console.log(`   GET   /health`);

  // Conectar al EventBus (no bloqueante)
  try {
    await eventBus.connect();
    console.log(`[Seguridad] 🔌 EventBus conectado`);
  } catch (err) {
    console.warn(`[Seguridad] ⚠️ EventBus no disponible (modo degradado)`);
  }
});
