import type { ModuleHelp } from '../types';

/**
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * openspec/changes/ayuda-contextual-por-modulo
 */
export const controlObra: ModuleHelp = {
  viewId: 'control-obra',
  titulo: 'Control de Obra',
  accentColor: 'blue',
  queHace:
    'Es la vista técnica de Superintendencia/Control de Proyectos: monitorea el avance de la obra con métricas de valor ganado (EVM: CPI, SPI, VAC, EAC), Curva S, alertas automáticas y el estado del presupuesto por partida. La mayoría de sus pestañas son de solo lectura/monitoreo — la captura operativa de avances y estimaciones ocurre en Residencia.',
  rolesTipicos: ['control_obra', 'control_proyectos', 'director'],
  flujo: [
    'Residencia registra avances físicos y arma estimaciones sobre su frente de obra.',
    'Control de Obra monitorea ese avance agregado por partida (EVM, Curva S) a nivel de todo el proyecto.',
    'El sistema genera alertas automáticas cuando un indicador se sale de rango (ej. SPI bajo, retraso proyectado).',
    'Programación mantiene el Gantt por partida contra el cual se compara el avance real.',
    'Configuración clasifica los insumos del proyecto en categorías de gasto para que el seguimiento de costos sea consistente.',
  ],
  conectaCon: [
    { modulo: 'Residencia', via: 'Consume los avances físicos y estimaciones que Residencia registra en campo' },
    { modulo: 'Gerencia Técnica', via: 'Comparte el presupuesto por partida como base de comparación del EVM' },
    { modulo: 'Finanzas', via: 'El estado de las estimaciones (aprobada/pagada) alimenta el seguimiento de costos' },
  ],
  secciones: [
    {
      id: 'dashboard',
      titulo: 'Dashboard EVM',
      proposito: 'Ver de un vistazo el semáforo global del proyecto.',
      bloques: [{ tipo: 'parrafo', texto: 'KPIs de valor ganado (CPI, SPI, VAC), fecha fin proyectada y días de retraso. Si el proyecto no tiene programación cargada, muestra un aviso explícito en vez de datos vacíos.' }],
    },
    {
      id: 'bitacoras',
      titulo: 'Bitácoras',
      proposito: 'Consultar el registro diario de obra.',
      bloques: [
        { tipo: 'parrafo', texto: 'Listado de bitácoras con botón para crear una nueva.' },
        { tipo: 'aviso', nivel: 'info', titulo: 'Sin firma en esta vista', texto: 'No hay una acción de "Firmar" bitácora en esta pantalla — mientras no se firme por otro medio, la bitácora permanece editable como BORRADOR.' },
      ],
    },
    {
      id: 'avances',
      titulo: 'Avances Físicos',
      proposito: 'Consultar el avance físico registrado, con opción de registrar uno nuevo.',
      bloques: [
        { tipo: 'estados', titulo: 'Estado del avance', items: [
          { estado: 'PENDIENTE', color: 'ambar', desc: 'Registrado, en espera de validación.' },
          { estado: 'VALIDADO', color: 'verde', desc: 'Confirmado — ya puede incluirse en una estimación (en Residencia).' },
          { estado: 'RECHAZADO', color: 'rojo', desc: 'No se aceptó el avance reportado.' },
        ] },
        { tipo: 'aviso', nivel: 'atencion', titulo: 'No hay botón de Validar/Rechazar en esta vista', texto: 'La validación de un avance requiere el rol superintendent en el backend, pero esta pantalla no expone un botón para ejecutar esa acción — si un avance queda PENDIENTE indefinidamente, es necesario resolverlo fuera de esta interfaz.' },
      ],
    },
    {
      id: 'estimaciones',
      titulo: 'Estimaciones',
      proposito: 'Ver, de solo lectura, las estimaciones ya creadas por Residencia.',
      bloques: [{ tipo: 'parrafo', texto: 'Tarjetas con folio, estado, subtotal/total neto y periodo. Esta pantalla no crea estimaciones nuevas — eso ocurre en el módulo Residencia, donde el residente agrupa avances VALIDADO en una estimación.' }],
    },
    {
      id: 'evm',
      titulo: 'EVM Detalle',
      proposito: 'Ver el detalle de valor ganado por partida.',
      bloques: [{ tipo: 'parrafo', texto: 'Tabla técnica por partida: BAC (presupuesto al término), CPI, SPI, EAC (estimado al término) y semáforo de riesgo.' }],
    },
    {
      id: 'curva-s',
      titulo: 'Curva S',
      proposito: 'Ver el avance acumulado planeado vs. real en el tiempo.',
      bloques: [{ tipo: 'parrafo', texto: 'Curva S semanal (valor planeado acumulado) y un listado de partidas críticas con SPI por debajo de 0.85.' }],
    },
    {
      id: 'alertas',
      titulo: 'Alertas',
      proposito: 'Atender las alertas automáticas del sistema de control de proyectos.',
      bloques: [{ tipo: 'pasos', titulo: 'Acciones disponibles', items: ['Revisar la alerta y su severidad.', '"Reconocer" para marcarla como atendida.', '"Ignorar" si no requiere acción.'] }],
    },
    {
      id: 'costos',
      titulo: 'Costos',
      proposito: 'Ver el seguimiento de costos por categoría de gasto.',
      bloques: [{ tipo: 'parrafo', texto: 'KPIs de presupuesto, comprometido, pagado y avance físico, más el progreso desglosado por categoría de gasto.' }],
    },
    {
      id: 'presupuesto-partida',
      titulo: 'Presupuesto por Partida',
      proposito: 'Consultar, de solo lectura, el control presupuestal por partida.',
      bloques: [{ tipo: 'parrafo', texto: 'Trazabilidad de solo lectura sobre los mismos saldos que administra Gerencia Técnica.' }],
    },
    {
      id: 'programacion',
      titulo: 'Programación',
      proposito: 'Ver el Gantt del proyecto por partida.',
      bloques: [{ tipo: 'parrafo', texto: 'Estado, avance % y presupuesto al término (BAC) por partida programada. La carga de programación se hace por integración, no desde un formulario en esta vista.' }],
    },
    {
      id: 'configuracion',
      titulo: 'Configuración',
      proposito: 'Clasificar los insumos del proyecto en categorías de gasto.',
      bloques: [
        { tipo: 'parrafo', texto: 'Incluye auto-clasificación de insumos.' },
        { tipo: 'aviso', nivel: 'info', titulo: 'Acceso restringido', texto: 'Solo visible para roles control_obra/admin.' },
      ],
    },
  ],
  erroresComunes: [
    {
      sintoma: 'Un avance físico queda PENDIENTE indefinidamente y Residencia no puede facturarlo',
      causa: 'Solo se pueden incluir en una estimación los avances en estado VALIDADO, y esta vista no tiene un botón para validar/rechazar avances.',
      solucion: 'La validación debe resolverse por otro medio (directamente contra el API) mientras la UI no exponga esa acción — repórtalo como bloqueo operativo si sucede seguido.',
    },
    {
      sintoma: 'El Dashboard EVM o la Curva S aparecen vacíos',
      causa: 'El proyecto no tiene programación de obra cargada — sin un Gantt base, no hay contra qué comparar el avance real.',
      solucion: 'Verifica que Programación tenga datos cargados para ese proyecto.',
    },
  ],
};
