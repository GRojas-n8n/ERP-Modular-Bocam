import type { ModuleHelp } from '../types';

/**
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * openspec/changes/ayuda-contextual-por-modulo
 */
export const seguridad: ModuleHelp = {
  viewId: 'seguridad',
  titulo: 'Seguridad HSE',
  accentColor: 'red',
  queHace:
    'Panel de higiene y seguridad de la obra: incidentes, inspecciones, permisos de trabajo, capacitaciones y entregas de EPP, con KPIs y alertas de vencimiento. Hoy es un módulo de consulta — no tiene formularios funcionales para crear o editar registros desde esta pantalla.',
  rolesTipicos: ['seguridad_hse'],
  flujo: [
    'El registro de incidentes, inspecciones, permisos, capacitaciones y entregas de EPP se realiza actualmente fuera de esta interfaz.',
    'Esta vista consulta esos datos ya existentes y calcula KPIs y alertas (ej. EPP por vencer).',
  ],
  conectaCon: [],
  secciones: [
    {
      id: 'incidentes',
      titulo: 'Incidentes',
      proposito: 'Consultar incidentes reportados y su seguimiento.',
      bloques: [{
        tipo: 'estados', titulo: 'Estado del incidente', items: [
          { estado: 'ABIERTO', color: 'rojo', desc: 'Recién reportado.' },
          { estado: 'EN_INVESTIGACION', color: 'ambar', desc: 'En proceso de análisis.' },
          { estado: 'ACCION_CORRECTIVA', color: 'azul', desc: 'Con acción correctiva en curso.' },
          { estado: 'CERRADO', color: 'verde', desc: 'Resuelto.' },
        ],
      }],
    },
    {
      id: 'inspecciones',
      titulo: 'Inspecciones',
      proposito: 'Consultar el resultado de inspecciones de seguridad.',
      bloques: [{ tipo: 'parrafo', texto: 'Porcentaje de cumplimiento, ítems conformes/no conformes y resultado final (Aprobada / Observaciones / No Aprobada).' }],
    },
    {
      id: 'permisos',
      titulo: 'Permisos',
      proposito: 'Consultar permisos de trabajo y su vigencia.',
      bloques: [{ tipo: 'parrafo', texto: 'Tipo de permiso, vigencia, solicitante/autorizador y checklist previo.' }],
    },
    {
      id: 'capacitaciones',
      titulo: 'Capacitaciones',
      proposito: 'Consultar capacitaciones programadas y completadas.',
      bloques: [{ tipo: 'parrafo', texto: 'Instructor, duración y asistentes de cada capacitación.' }],
    },
    {
      id: 'epp',
      titulo: 'EPP',
      proposito: 'Consultar la entrega y renovación de equipo de protección personal.',
      bloques: [{ tipo: 'parrafo', texto: 'Próxima fecha de renovación y urgencia (vencido, crítico, por renovar, vigente) por empleado.' }],
    },
  ],
  erroresComunes: [
    {
      sintoma: 'Los botones "Reportar Incidente", "Nueva Inspección", etc. no hacen nada al hacer clic',
      causa: 'Estos botones son parte del diseño de la pantalla pero todavía no tienen una acción conectada — el módulo es de solo consulta por ahora.',
      solucion: 'No es un bug puntual del usuario; el registro de estos eventos debe hacerse por otro medio mientras el módulo no tenga formularios funcionales.',
    },
    {
      sintoma: 'Un incidente o permiso no se actualiza aunque haya cambiado en la realidad',
      causa: 'Esta vista no tiene forma de editar registros — solo refleja lo que ya existe en el backend.',
      solucion: 'Confirma cómo se actualizó el dato de origen; esta pantalla no es la fuente de captura.',
    },
  ],
};
