import type { ModuleHelp } from '../types';

/**
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * openspec/changes/ayuda-contextual-por-modulo
 */
export const personal: ModuleHelp = {
  viewId: 'personal',
  titulo: 'Recursos Humanos',
  accentColor: 'emerald',
  queHace:
    'Administra el alta de empleados, la conformación de cuadrillas, los pases de acceso y el cálculo, autorización y pago de la pre-nómina (motor de IMSS/ISR y horas extra conforme a la LFT). A diferencia de Residencia, aquí sí se autoriza y se paga la nómina.',
  rolesTipicos: ['personal_rh'],
  flujo: [
    'Se da de alta al empleado y se le asigna categoría, jornada y deducciones (IMSS/ISR/INFONAVIT).',
    'Se conforma su cuadrilla y, para operar en un proyecto, se le asigna a un frente de trabajo o a esa cuadrilla — la sola asignación de un residente no le da elegibilidad de proyecto.',
    'La asistencia registrada en Residencia alimenta el cálculo de la prenómina del periodo.',
    'Se calcula la prenómina (motor IMSS/ISR + horas extra); el residente la revisa en su módulo.',
    'RH autoriza la prenómina y finalmente la paga.',
  ],
  conectaCon: [
    { modulo: 'Residencia', via: 'Recibe la prenómina "revisada" por el residente para autorizarla y pagarla' },
    { modulo: 'Contabilidad', via: 'Publica el evento de nómina pagada para su registro contable' },
  ],
  secciones: [
    {
      id: 'empleados',
      titulo: 'Empleados',
      proposito: 'Alta, edición y consulta del expediente de cada empleado.',
      bloques: [
        { tipo: 'parrafo', texto: 'Filtros por texto, categoría, cuadrilla, frente y residente asignado. Acciones por fila: Editar, Jornada, Deducciones. Selección múltiple para descargar QR o imprimir credenciales.' },
        { tipo: 'aviso', nivel: 'atencion', titulo: 'Asignar un residente no da elegibilidad de proyecto', texto: 'Para que un empleado pueda registrar asistencia o entrar en el cálculo de nómina de un proyecto, necesita una Asignación a Frente de Trabajo o pertenecer a una Cuadrilla — asignarle solo un residente no es suficiente.' },
      ],
    },
    {
      id: 'cuadrillas',
      titulo: 'Cuadrillas',
      proposito: 'Conformar y administrar cuadrillas de trabajo.',
      bloques: [{ tipo: 'parrafo', texto: 'Tarjetas por cuadrilla con código, especialidad, capataz y conteo de miembros. El alta requiere al menos nombre y especialidad.' }],
    },
    {
      id: 'prenomina',
      titulo: 'Pre-Nómina',
      proposito: 'Calcular, revisar, autorizar y pagar la nómina del periodo.',
      bloques: [
        { tipo: 'pasos', titulo: 'Calcular una prenómina', items: ['Indica el periodo (inicio y fin) — el tipo de periodo se toma de la configuración del proyecto.', 'El sistema calcula días/horas, horas extra, IMSS e ISR por empleado.', 'El residente la revisa en su módulo.', 'RH autoriza y después paga.'] },
        {
          tipo: 'lista',
          titulo: 'Reglas del motor de cálculo',
          items: [
            { termino: 'Horas extra semanal', desc: 'Primeras 9 horas al 200%, adicionales al 300% (LFT); 50% de las horas extra está exento de ISR.' },
            { termino: 'IMSS', desc: 'Solo aplica a empleados PLANTA/EVENTUAL con NSS; SUBCONTRATO se omite del cálculo.' },
            { termino: 'ISR', desc: 'Se calcula según el tipo de periodo (semanal/quincenal/mensual) del proyecto.' },
          ],
        },
        { tipo: 'aviso', nivel: 'atencion', titulo: '"Requiere recálculo"', texto: 'Una prenómina con tasas desactualizadas se marca así — debe recalcularse antes de pagarse, o se pagará con tasas obsoletas.' },
      ],
    },
    {
      id: 'pases',
      titulo: 'Pases de Acceso',
      proposito: 'Controlar la vigencia de los pases de acceso a obra.',
      bloques: [{ tipo: 'parrafo', texto: 'Cada pase muestra días restantes y su urgencia (vencido, crítico, por vencer, vigente).' }],
    },
  ],
  erroresComunes: [
    {
      sintoma: 'Un empleado asignado a un residente no puede registrar asistencia ni entra en la nómina del proyecto',
      causa: 'La asignación de residente por sí sola no da elegibilidad de proyecto — falta la Asignación a Frente de Trabajo o pertenencia a una Cuadrilla.',
      solucion: 'Verifica en Empleados que el trabajador tenga asignación de frente o cuadrilla activa en ese proyecto.',
    },
    {
      sintoma: 'Se autoriza y paga una prenómina con montos que después resultan incorrectos',
      causa: 'La prenómina tenía la bandera "requiere recálculo" (tasas desactualizadas) y se pagó sin recalcular.',
      solucion: 'Siempre recalcula una prenómina marcada como "requiere recálculo" antes de autorizarla.',
    },
    {
      sintoma: 'El monto de horas extra no cuadra con lo esperado',
      causa: 'El tope de horas extra semanal se calcula sobre la semana calendario (lunes a domingo), no sobre el periodo de pago completo.',
      solucion: 'Verifica la distribución de horas extra por semana ISO real, no solo el total del periodo.',
    },
  ],
};
