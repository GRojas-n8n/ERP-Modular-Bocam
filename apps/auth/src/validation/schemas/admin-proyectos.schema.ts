/**
 * POST /api/v1/auth/admin/proyectos y PATCH /api/v1/auth/admin/proyectos/:id
 *
 * Contrato replicado de los chequeos manuales existentes en main.ts. Solo se
 * valida forma/tipo — la lógica de negocio (validarEstatus, validarEmpresaGrupo,
 * TIPOS_ESPECIALES, la exigencia condicional de campos según `es_especial`, y
 * la comparación fecha_programada_inicio <= fecha_programada_fin) vive en
 * centro-costos-policy.ts y se queda intacta en el handler, ejecutándose
 * DESPUÉS de este schema (ver design.md: Zod solo reemplaza forma/tipo, no
 * reglas de negocio).
 *
 * Las fechas se aceptan como string (formato 'YYYY-MM-DD' o ISO datetime) o
 * null — normalizarFecha() en main.ts sigue siendo responsable de convertirlas
 * a Date.
 */
import { z } from 'zod';

const fechaSchema = z.union([z.string(), z.null()]).optional();

export const crearProyectoSchema = z.object({
  nombre_oficial: z.string().trim().min(1, 'nombre_oficial es obligatorio'),
  tipo_contrato: z.string().optional(),
  moneda_base: z.string().optional(),
  estatus: z.string().optional(),
  es_especial: z.boolean().optional(),
  tipo_especial: z.string().optional(),
  codigo_centro_costos: z.string().optional(),
  empresa_grupo: z.string().optional(),
  anio_centro_costos: z.number().optional(),
  cliente_id: z.string().optional(),
  codigo_cliente: z.string().optional(),
  monto_total_vendido: z.number().optional(),
  periodo_ejecucion: z.number().optional(),
  periodo_ejecucion_unidad: z.string().optional(),
  total_dias_naturales: z.number().optional(),
  total_dias_laborables: z.number().optional(),
  fecha_inicio_real: fechaSchema,
  fecha_firma_contrato: fechaSchema,
  fecha_programada_inicio: fechaSchema,
  fecha_programada_fin: fechaSchema,
});

export const actualizarProyectoSchema = z.object({
  nombre_oficial: z.string().trim().min(1).optional(),
  tipo_contrato: z.string().optional(),
  moneda_base: z.string().optional(),
  estatus: z.string().optional(),
  activo: z.boolean().optional(),
  monto_total_vendido: z.number().optional(),
  periodo_ejecucion: z.number().optional(),
  periodo_ejecucion_unidad: z.string().optional(),
  total_dias_naturales: z.number().optional(),
  total_dias_laborables: z.number().optional(),
  fecha_inicio_real: fechaSchema,
  fecha_firma_contrato: fechaSchema,
  fecha_programada_inicio: fechaSchema,
  fecha_programada_fin: fechaSchema,
});

export type CrearProyectoInput = z.infer<typeof crearProyectoSchema>;
export type ActualizarProyectoInput = z.infer<typeof actualizarProyectoSchema>;
