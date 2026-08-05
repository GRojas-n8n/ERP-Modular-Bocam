import type { ModuleHelp } from '../types';

/**
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * openspec/changes/ayuda-contextual-por-modulo
 */
export const calidad: ModuleHelp = {
  viewId: 'calidad',
  titulo: 'Calidad',
  accentColor: 'violet',
  queHace:
    'Sistema de Gestión de Calidad ISO 9001:2015: control de documentos con versiones y flujo de aprobación, No Conformidades con acciones correctivas, y Auditorías Internas cuyos hallazgos pueden derivar en nuevas No Conformidades.',
  rolesTipicos: ['calidad', 'admin'],
  flujo: [
    'Se controla la documentación del SGC: cada documento tiene versiones, y solo una puede estar VIGENTE a la vez.',
    'Las auditorías internas generan hallazgos (mayor, menor u observación); un hallazgo puede convertirse directamente en una No Conformidad.',
    'Cada No Conformidad se atiende con acciones correctivas hasta que todas quedan verificadas, momento en que la NC puede cerrarse.',
  ],
  conectaCon: [],
  secciones: [
    {
      id: 'documentos',
      titulo: 'Documentos',
      proposito: 'Controlar documentos del SGC con historial de versiones.',
      bloques: [
        { tipo: 'parrafo', texto: 'Cada documento tiene código único y tipo (no editables tras crearlo). Subir una nueva versión requiere adjuntar archivo (máx. 50MB) antes de poder enviarla a revisión.' },
        {
          tipo: 'aviso',
          nivel: 'atencion',
          titulo: 'Aprobar una versión es una acción de todo o nada',
          texto: 'Al aprobar una versión, esta pasa a VIGENTE y cualquier otra versión que estuviera VIGENTE pasa automáticamente a OBSOLETO — el documento queda sin versión vigente hasta que se apruebe una nueva.',
        },
        { tipo: 'parrafo', texto: 'Un documento solo puede eliminarse si ninguna de sus versiones está VIGENTE o EN_REVISION.' },
      ],
    },
    {
      id: 'no-conformidades',
      titulo: 'No Conformidades',
      proposito: 'Registrar y dar seguimiento a No Conformidades (cláusula 10.2 de ISO 9001).',
      bloques: [
        { tipo: 'parrafo', texto: 'Se marca con badge VENCIDA cuando la fecha límite ya pasó. La transición de estado exige avanzar las acciones correctivas primero.' },
        {
          tipo: 'lista',
          titulo: 'Reglas de transición',
          items: [
            { termino: 'EN_VERIFICACION', desc: 'Requiere al menos una acción correctiva COMPLETADA o VERIFICADA.' },
            { termino: 'CERRADA', desc: 'Requiere que todas las acciones correctivas (no canceladas) estén VERIFICADAS.' },
          ],
        },
        { tipo: 'aviso', nivel: 'info', titulo: 'Reabrir una NC cerrada es admin-only', texto: 'Solo el rol admin puede reabrir una No Conformidad ya cerrada — verifica que el usuario tenga ese rol si la acción no aparece disponible.' },
      ],
    },
    {
      id: 'auditorias',
      titulo: 'Auditorías',
      proposito: 'Gestionar auditorías internas y sus hallazgos.',
      bloques: [
        { tipo: 'estados', titulo: 'Estado de la auditoría', items: [
          { estado: 'PROGRAMADA', color: 'gris', desc: 'Aún no inicia.' },
          { estado: 'EN_CURSO', color: 'ambar', desc: 'En ejecución.' },
          { estado: 'COMPLETADA', color: 'verde', desc: 'Terminada.' },
          { estado: 'CANCELADA', color: 'rojo', desc: 'Cancelada (admin-only).' },
        ] },
        { tipo: 'parrafo', texto: 'Los hallazgos se clasifican como Mayor, Menor u Observación; desde un hallazgo se puede "Crear NC" directamente.' },
      ],
    },
  ],
  erroresComunes: [
    {
      sintoma: 'Un usuario admin no puede reabrir una NC cerrada ni cancelar una auditoría',
      causa: 'Estas dos acciones son exclusivas del rol admin y dependen de que el JWT tenga ese rol real asignado, no solo el nombre visible en el perfil.',
      solucion: 'Verifica en Administración que el usuario tenga el rol admin realmente asignado en el sistema, no solo en el título del puesto.',
    },
    {
      sintoma: 'No se puede crear una nueva versión de un documento',
      causa: 'Ya existe una versión de ese documento en estado EN_REVISION — no se permite tener dos versiones en revisión al mismo tiempo.',
      solucion: 'Resuelve o cancela la versión en revisión existente antes de crear una nueva.',
    },
    {
      sintoma: 'Un documento queda sin versión vigente después de aprobar una nueva',
      causa: 'Es el comportamiento esperado: aprobar una versión pasa la anterior VIGENTE a OBSOLETO automáticamente.',
      solucion: 'No es un error — simplemente confirma que la versión recién aprobada sea la correcta antes de continuar.',
    },
  ],
};
