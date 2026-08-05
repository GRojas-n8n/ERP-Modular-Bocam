import type { ModuleHelp } from '../types';

/**
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * viewId real del nav: 'insumos' (el archivo de la vista se llama
 * InsumosView.tsx, pero el módulo visible es "Gerencia Técnica").
 * openspec/changes/ayuda-contextual-por-modulo
 */
export const gerenciaTecnica: ModuleHelp = {
  viewId: 'insumos',
  titulo: 'Gerencia Técnica',
  accentColor: 'sky',
  queHace:
    'Es el origen técnico del proyecto: importa el presupuesto OPUS, mantiene el catálogo maestro de insumos (materiales, mano de obra, equipo, subcontratos), y controla cuánto se ha comprometido y pagado contra cada partida presupuestal. Ningún otro módulo puede requisitar o pagar sin que la partida tenga saldo aquí.',
  rolesTipicos: ['gerencia_tecnica', 'admin (algunas acciones)', 'superintendent (algunas acciones)'],
  flujo: [
    'Se importa el presupuesto OPUS (Catálogo de Obra) del proyecto recién creado.',
    'Se puebla el catálogo de Insumos importando el APU o la Explosión de Insumos del mismo OPUS.',
    'Residencia y Compras consumen ese catálogo para requisitar; cada compromiso (OC) y cada pago descuentan el saldo disponible de la partida correspondiente.',
    'Control de Costos y Control Presupuestal muestran, por partida, cuánto se ha comprometido y ejercido contra lo presupuestado.',
    'Si una partida necesita más presupuesto del que tiene disponible, se resuelve con una Transferencia entre partidas (requiere aprobación).',
    'Trazabilidad permite seguir, por concepto, el hilo completo: presupuesto → requisición → OC → pago.',
  ],
  conectaCon: [
    { modulo: 'Compras', via: 'Provee el catálogo de insumos y valida saldo de partida antes de aprobar una requisición u OC' },
    { modulo: 'Residencia', via: 'Provee el catálogo de conceptos para el take-off de requisiciones de campo' },
    { modulo: 'Finanzas', via: 'Sincroniza SaldoPartida — el compromiso/ejercido que ve GT es el mismo que valida Finanzas' },
    { modulo: 'Administración', via: 'Recibe el evento auth.centro_costos_creado y siembra ProyectoCostosConfig + categorías de gasto al crearse un proyecto' },
    { modulo: 'Ventas', via: 'Si el proyecto viene de una cotización aceptada, aparece vinculado en proyectos-vinculados' },
  ],
  secciones: [
    {
      id: 'catalogo',
      titulo: 'Catálogo de Obra',
      proposito: 'Importar el presupuesto base del proyecto exportado desde OPUS.',
      bloques: [
        { tipo: 'parrafo', texto: 'Sube el archivo de exportación OPUS (Excel/CSV), revisa la vista previa validada por el sistema y confirma la importación. Desde aquí también se puede volver a exportar el catálogo a Excel.' },
        {
          tipo: 'aviso',
          nivel: 'atencion',
          titulo: 'El parser es sensible al formato de OPUS',
          texto: 'El sistema identifica columnas por heurísticas de texto (ej. "Clave:" con dos puntos vs. encabezado "CLAVE"). Exporta siempre a Excel/CSV desde OPUS, nunca a PDF — ver el botón "¿Cómo exportar?" dentro de esta misma pestaña para el detalle.',
        },
      ],
    },
    {
      id: 'insumos',
      titulo: 'Insumos',
      proposito: 'Catálogo maestro de materiales, mano de obra, equipo, subcontratos e indirectos.',
      bloques: [
        { tipo: 'parrafo', texto: 'Se puebla importando el APU o la Explosión de Insumos de OPUS. Cada insumo tiene clave, descripción, unidad, precio unitario y tipo.' },
        {
          tipo: 'estados',
          titulo: 'Estado de saldo por partida (columna Saldo)',
          items: [
            { estado: 'LIBRE', color: 'verde', desc: 'Más del 20% del monto aprobado sigue disponible.' },
            { estado: 'LIMITADO', color: 'ambar', desc: 'Entre 1% y 20% disponible — sigue operando pero con alerta.' },
            { estado: 'BLOQUEADO', color: 'rojo', desc: 'Disponible en 0% o menos — no se puede requisitar ni emitir OC sobre esta partida hasta liberar saldo.' },
            { estado: 'SUSPENDIDO', color: 'gris', desc: 'Bloqueo manual del director, independiente del cálculo automático.' },
          ],
        },
        {
          tipo: 'pasos',
          titulo: 'Preparar una requisición desde el catálogo',
          items: [
            'Selecciona el insumo desde la tabla y usa "Preparar Requisición →".',
            'El sistema abre un panel de revisión (take-off) con el insumo prellenado.',
            'Ajusta cantidades, desmarca ítems y agrega notas antes de enviar.',
            'Al confirmar, la requisición se crea directamente en Compras.',
          ],
        },
      ],
    },
    {
      id: 'control-costos',
      titulo: 'Control de Costos',
      proposito: 'Ver el acumulado comprometido contra el presupuesto por partida (WBS).',
      bloques: [{ tipo: 'parrafo', texto: 'Vista de solo lectura: comprometido vs. presupuesto por cada partida de la estructura de desglose de trabajo.' }],
    },
    {
      id: 'control-presupuestal',
      titulo: 'Control Presupuestal',
      proposito: 'Ver presupuestado, comprometido y pagado por partida en una sola tabla.',
      bloques: [{ tipo: 'parrafo', texto: 'Es la vista consolidada de los tres momentos del dinero de una partida: lo que se presupuestó, lo que ya está comprometido en OCs, y lo que ya se pagó.' }],
    },
    {
      id: 'transferencias',
      titulo: 'Transferencias',
      proposito: 'Mover presupuesto disponible de una partida a otra que lo necesite.',
      bloques: [
        { tipo: 'parrafo', texto: 'Una partida BLOQUEADA no puede recibir nuevas requisiciones hasta que se le transfiera saldo desde otra partida con excedente. Toda transferencia requiere aprobación.' },
        {
          tipo: 'aviso',
          nivel: 'info',
          titulo: 'Efecto en cadena',
          texto: 'Al aprobarse una transferencia, las requisiciones que estaban en estado PENDIENTE_TRANSFERENCIA por falta de saldo se aprueban automáticamente.',
        },
      ],
    },
    {
      id: 'trazabilidad',
      titulo: 'Trazabilidad',
      proposito: 'Seguir, por concepto, el hilo completo desde presupuesto hasta pago.',
      bloques: [{ tipo: 'parrafo', texto: 'Resumen por concepto: cuánto se presupuestó, cuánto se ha requisitado/comprometido en OC y cuánto se ha pagado — útil para auditar un concepto específico de punta a punta.' }],
    },
  ],
  erroresComunes: [
    {
      sintoma: 'La importación de OPUS falla o mezcla columnas',
      causa: 'El archivo se exportó como PDF, o el formato de columnas no coincide con lo que el parser espera.',
      solucion: 'Exporta siempre a Excel (.xlsx) o CSV desde OPUS — nunca PDF. Usa el botón "¿Cómo exportar?" del Catálogo de Obra para ver el detalle paso a paso.',
    },
    {
      sintoma: 'Una requisición de Residencia queda "atorada" en PENDIENTE_TRANSFERENCIA',
      causa: 'La partida a la que apunta está BLOQUEADA (0% o menos disponible).',
      solucion: 'Revisa el saldo de esa partida en Insumos o Control Presupuestal y gestiona una Transferencia si hay excedente en otra partida.',
    },
    {
      sintoma: 'Un residente no puede subir/cambiar la ficha técnica de un insumo desde Compras',
      causa: 'La ficha técnica solo se carga una vez, desde el formulario de Nueva Requisición en Residencia; en el Cuadro Comparativo de Compras es de solo lectura por diseño.',
      solucion: 'Pide al residente que actualice la ficha técnica desde su requisición original, no desde Compras.',
    },
  ],
};
