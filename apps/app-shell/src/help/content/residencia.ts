import type { ModuleHelp } from '../types';

/**
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * openspec/changes/ayuda-contextual-por-modulo
 */
export const residencia: ModuleHelp = {
  viewId: 'residencia',
  titulo: 'Residencia',
  accentColor: 'indigo',
  queHace:
    'Es la vista operativa del residente de obra: registra avances físicos en campo, agrupa esos avances en estimaciones de facturación, revisa (sin autorizar) la prenómina de su cuadrilla, controla la asistencia por QR y da seguimiento a sus propias requisiciones de materiales.',
  rolesTipicos: ['residencia', 'control_obra'],
  flujo: [
    'El residente registra el avance físico real de su frente de obra.',
    'Cuando el avance queda VALIDADO, el residente lo selecciona y crea una Estimación de facturación.',
    'Personal/RH calcula la prenómina de la cuadrilla; el residente la revisa y marca "Revisado" — esto no autoriza el pago, solo lo habilita para que RH lo autorice.',
    'La asistencia se registra por escaneo de credencial QR o manualmente por cuadrilla, y alimenta el cálculo de días/horas de la prenómina.',
    'El residente da seguimiento a sus requisiciones de materiales hasta que Compras las resuelve.',
  ],
  conectaCon: [
    { modulo: 'Control de Obra', via: 'Los avances y estimaciones creados aquí se ven agregados (solo lectura) en Control de Obra' },
    { modulo: 'Recursos Humanos', via: 'La prenómina revisada aquí pasa a Personal/RH para autorización y pago' },
    { modulo: 'Compras', via: 'Las requisiciones de campo se aprueban y cotizan en Compras' },
    { modulo: 'Gerencia Técnica', via: 'El catálogo de conceptos para el take-off de requisiciones viene de Gerencia Técnica' },
  ],
  secciones: [
    {
      id: 'estimaciones',
      titulo: 'Estimaciones',
      proposito: 'Registrar avances físicos y agruparlos en una estimación de facturación.',
      bloques: [
        {
          tipo: 'pasos',
          titulo: 'Crear una estimación',
          items: [
            'Registra el avance físico real seleccionando el concepto del catálogo.',
            'Espera a que el avance quede VALIDADO.',
            'Selecciona uno o más avances VALIDADO sin estimación aún.',
            'Usa "Crear Estimación" para agruparlos en una nueva estimación.',
          ],
        },
        { tipo: 'aviso', nivel: 'info', titulo: 'Solo avances VALIDADO', texto: 'Un avance en PENDIENTE o RECHAZADO no puede incluirse en una estimación — si nadie valida el avance, el residente queda bloqueado para facturar esa parte del trabajo.' },
      ],
    },
    {
      id: 'nomina',
      titulo: 'Nómina Cuadrilla',
      proposito: 'Revisar la prenómina y el complemento salarial de la cuadrilla antes de que RH la autorice.',
      bloques: [
        { tipo: 'aviso', nivel: 'atencion', titulo: '"Marcar revisado" no autoriza el pago', texto: 'Esta acción solo habilita a Personal/RH para autorizar y pagar la prenómina — no es la autorización final. Es un punto de confusión frecuente en capacitación de residentes nuevos.' },
        { tipo: 'parrafo', texto: 'Si no hay registros de asistencia real capturados, el sistema puede estimar días/horas trabajados para no bloquear el cálculo — verifica la asistencia real antes de revisar la prenómina para evitar pagos incorrectos.' },
      ],
    },
    {
      id: 'equipo',
      titulo: 'Mi Equipo',
      proposito: 'Ver los empleados asignados a este residente, agrupados por categoría.',
      bloques: [{ tipo: 'parrafo', texto: 'Un badge "Compartido" indica que el empleado también está asignado a otro residente al mismo tiempo.' }],
    },
    {
      id: 'asistencia',
      titulo: 'Asistencia QR',
      proposito: 'Registrar y consultar la asistencia de la cuadrilla.',
      bloques: [
        { tipo: 'parrafo', texto: 'Filtro por fecha y cuadrilla. El registro puede ser por escaneo de credencial (cámara) o manual por cuadrilla.' },
        { tipo: 'aviso', nivel: 'info', titulo: 'Registros "Sin salida"', texto: 'En empleados de jornada POR_HORAS, un registro con entrada pero sin salida aparece marcado — revísalo antes de que se calcule la prenómina del periodo.' },
      ],
    },
    {
      id: 'requisiciones',
      titulo: 'Requisiciones',
      proposito: 'Dar seguimiento a las solicitudes de material del frente de obra.',
      bloques: [{ tipo: 'parrafo', texto: 'KPIs de total, pendientes, aprobadas e imprevistos — el ciclo completo de aprobación y cotización ocurre en el módulo Compras.' }],
    },
  ],
  erroresComunes: [
    {
      sintoma: 'No aparecen avances disponibles para crear una estimación',
      causa: 'Solo se pueden seleccionar avances en estado VALIDADO; si el avance sigue PENDIENTE, no aparecerá en la selección.',
      solucion: 'Confirma con Control de Obra/Superintendencia que el avance haya sido validado antes de intentar facturarlo.',
    },
    {
      sintoma: 'Se confunde "Marcar revisado" con autorizar el pago de nómina',
      causa: 'El texto del botón puede sonar a una aprobación final, pero solo desbloquea el siguiente paso en Personal/RH.',
      solucion: 'La autorización real de pago ocurre en el módulo Recursos Humanos, no aquí.',
    },
    {
      sintoma: 'La prenómina calculada no coincide con la asistencia real esperada',
      causa: 'Si faltan registros de asistencia del periodo, el sistema puede usar días/horas estimados en vez de reales.',
      solucion: 'Revisa la pestaña Asistencia QR y completa los registros faltantes antes de marcar la prenómina como revisada.',
    },
  ],
};
