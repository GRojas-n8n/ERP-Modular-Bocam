import type { ModuleHelp } from '../types';

/**
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * openspec/changes/ayuda-contextual-por-modulo
 */
export const almacen: ModuleHelp = {
  viewId: 'almacen',
  titulo: 'Almacén',
  accentColor: 'emerald',
  queHace:
    'Muestra el inventario del proyecto activo (stock actual, mínimo, ubicación y estado) y el historial de movimientos de entrada, salida y traspaso. Es principalmente de consulta: el alta de movimientos ocurre automáticamente por eventos de otros módulos, no por formularios en esta vista.',
  rolesTipicos: ['warehouse', 'procurement', 'admin', 'superintendent'],
  flujo: [
    'Compras recibe una Orden de Compra del proveedor; al confirmarse la recepción (total o parcial), Almacén crea automáticamente el movimiento de INGRESO y, si el insumo no existía, lo da de alta.',
    'La obra consume materiales mediante una salida a obra (EGRESO_OBRA), vinculada obligatoriamente a una partida del presupuesto.',
    'Si el stock queda por debajo del mínimo o se agota, Almacén emite una alerta que alimenta el banner del Dashboard.',
    'Todo el historial queda visible en Movimientos, con su tipo, cantidad, origen y referencia.',
  ],
  conectaCon: [
    { modulo: 'Compras', via: 'Escucha OC recibida (evento) para generar el ingreso automático' },
    { modulo: 'Gerencia Técnica / Residencia', via: 'Las salidas de obra se vinculan a un concepto/partida del presupuesto' },
    { modulo: 'Dashboard', via: 'Publica alertas de stock bajo/agotado que se muestran en el resumen ejecutivo' },
  ],
  secciones: [
    {
      id: 'inventario',
      titulo: 'Inventario',
      proposito: 'Consultar el stock actual de cada insumo en el proyecto.',
      bloques: [
        { tipo: 'parrafo', texto: 'Búsqueda por clave, descripción o ubicación. Cada fila muestra stock actual, stock mínimo, ubicación y un estado calculado.' },
        {
          tipo: 'estados',
          titulo: 'Estado del ítem',
          items: [
            { estado: 'OK', color: 'verde', desc: 'Stock por encima del mínimo.' },
            { estado: 'BAJO', color: 'ambar', desc: 'Stock por debajo del mínimo configurado.' },
            { estado: 'AGOTADO', color: 'rojo', desc: 'Stock en cero.' },
          ],
        },
        {
          tipo: 'aviso',
          nivel: 'info',
          titulo: 'El stock no se edita directamente',
          texto: 'El campo de stock actual no es editable desde un formulario — solo cambia como resultado de un movimiento (ingreso, egreso o traspaso).',
        },
      ],
    },
    {
      id: 'movimientos',
      titulo: 'Movimientos',
      proposito: 'Ver el historial de entradas, salidas y traspasos.',
      bloques: [
        { tipo: 'parrafo', texto: 'Chips de filtro por tipo (Todos / INGRESO / EGRESO / TRASPASO), con fecha, insumo, cantidad, unidad, origen y referencia de cada movimiento.' },
        {
          tipo: 'aviso',
          nivel: 'atencion',
          titulo: 'Las salidas a obra no tienen filtro propio todavía',
          texto: 'El backend registra salidas a obra como un tipo distinto (EGRESO_OBRA), pero esta pantalla solo distingue INGRESO/EGRESO/TRASPASO — una salida a obra puede mostrarse agrupada visualmente como "Ingreso" en el filtro. Si necesitas confirmar una salida específica, revisa el detalle de referencia, no solo el badge de color.',
        },
      ],
    },
  ],
  erroresComunes: [
    {
      sintoma: 'Un egreso o salida a obra es rechazado',
      causa: 'El sistema no permite que un egreso deje el stock en negativo — valida disponibilidad antes de aplicar el movimiento.',
      solucion: 'Revisa el stock disponible del insumo antes de solicitar la salida; si hace falta material, genera una requisición en Compras/Residencia.',
    },
    {
      sintoma: 'Un insumo recibido en una OC no aparece en el catálogo de Almacén',
      causa: 'Si el insumo no existía previamente en el inventario del proyecto, el sistema lo da de alta automáticamente al procesar el evento de recepción — puede tardar unos segundos en reflejarse.',
      solucion: 'Recarga la pestaña Inventario; si sigue sin aparecer después de un momento, confirma que la recepción de la OC en Compras se haya guardado correctamente.',
    },
  ],
};
