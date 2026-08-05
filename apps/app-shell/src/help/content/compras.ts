import type { ModuleHelp } from '../types';

/**
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * openspec/changes/ayuda-contextual-por-modulo
 */
export const compras: ModuleHelp = {
  viewId: 'compras',
  titulo: 'Compras',
  accentColor: 'violet',
  queHace:
    'Gestiona el ciclo completo de abastecimiento: aprobar requisiciones de campo, solicitar y comparar cotizaciones de proveedores, coordinar la evaluación técnica (Residencia) y la autorización (Gerencia Técnica) de cada cuadro comparativo, emitir Órdenes de Compra y darles seguimiento hasta su recepción y pago.',
  rolesTipicos: ['compras', 'procurement', 'superintendent', 'residencia (evaluación técnica)', 'gerencia_tecnica (autorización)'],
  flujo: [
    'Residencia o Gerencia Técnica generan una requisición apuntando a una partida presupuestal.',
    'Compras la aprueba (si la partida tiene saldo) e invita a proveedores a cotizar.',
    'Se arma un Cuadro Comparativo con las cotizaciones recibidas.',
    'Residencia evalúa técnicamente cada ítem (Cumple / No Cumple / Desviación Aceptable / Requiere Aclaración).',
    'Gerencia Técnica autoriza el cuadro — al firmar, queda bloqueado y no editable.',
    'Compras genera la Orden de Compra; el sistema valida con Finanzas que haya presupuesto suficiente para todo el lote antes de emitirla.',
    'La OC se envía al proveedor por correo, se recibe (total o parcialmente) y finalmente se paga.',
  ],
  conectaCon: [
    { modulo: 'Gerencia Técnica', via: 'Consulta saldo de partida antes de aprobar requisiciones/OC; recibe el catálogo de insumos' },
    { modulo: 'Residencia', via: 'Recibe requisiciones de campo y solicita su evaluación técnica' },
    { modulo: 'Finanzas', via: 'Consulta suficiencia presupuestal (API síncrona) antes de emitir una OC; recibe eventos de pago para actualizar estado_pago' },
    { modulo: 'Almacén', via: 'Al recibirse una OC, Almacén crea el ingreso automáticamente vía evento' },
    { modulo: 'Contabilidad', via: 'Escucha OrdenCompraEmitida para registrar el pasivo proyectado' },
  ],
  secciones: [
    {
      id: 'requisiciones',
      titulo: 'Requisiciones',
      proposito: 'Aprobar (o rechazar) las requisiciones de campo antes de cotizar.',
      bloques: [
        {
          tipo: 'estados',
          titulo: 'Ciclo de una requisición',
          items: [
            { estado: 'BORRADOR', color: 'gris', desc: 'En preparación por quien la creó.' },
            { estado: 'PENDIENTE', color: 'ambar', desc: 'Esperando aprobación de Compras.' },
            { estado: 'PENDIENTE_TRANSFERENCIA', color: 'rojo', desc: 'La partida no tiene saldo; se auto-aprueba al resolverse la transferencia en Gerencia Técnica.' },
            { estado: 'APROBADA', color: 'verde', desc: 'Lista para invitar a cotizar.' },
            { estado: 'COMPRADA', color: 'azul', desc: 'El 100% de sus renglones ya quedó cubierto por Órdenes de Compra.' },
          ],
        },
        { tipo: 'parrafo', texto: 'El banner de alertas señala cotizaciones con plazo vencido. Un chip de filtro por estado ayuda a ubicar rápido las requisiciones que necesitan acción.' },
      ],
    },
    {
      id: 'catalogo',
      titulo: 'Catálogo',
      proposito: 'Consultar el catálogo de insumos con su precio de referencia.',
      bloques: [{ tipo: 'parrafo', texto: 'Mismo catálogo que administra Gerencia Técnica; aquí solo se consulta, filtrando por categoría, clase, clave, descripción o unidad.' }],
    },
    {
      id: 'proveedores',
      titulo: 'Proveedores',
      proposito: 'Administrar el catálogo de proveedores y su estatus de crédito.',
      bloques: [{ tipo: 'parrafo', texto: 'Razón social, RFC, ubicación (local/foráneo), tipo, estatus de crédito y score de calificación. "Calificar" y "Editar" son solo para roles de Compras.' }],
    },
    {
      id: 'pendientes-eval',
      titulo: 'Eval. Técnica',
      proposito: 'Cuadros comparativos que esperan la evaluación técnica de Residencia.',
      bloques: [{ tipo: 'parrafo', texto: 'Lista de cuadros pendientes de que el residente marque cada ítem como Cumple/No Cumple/Desviación Aceptable/Requiere Aclaración.' }],
    },
    {
      id: 'pendientes-gt',
      titulo: 'Aprob. GT',
      proposito: 'Cuadros ya evaluados que esperan la autorización de Gerencia Técnica.',
      bloques: [
        { tipo: 'parrafo', texto: 'Dashboard con pendientes de revisión, en evaluación técnica, aprobados del mes y monto comprometido.' },
        { tipo: 'aviso', nivel: 'atencion', titulo: 'Firma = bloqueo', texto: 'Al autorizar un cuadro, queda firmado y no editable. Verifica antes de firmar.' },
      ],
    },
    {
      id: 'ordenes-compra',
      titulo: 'Órdenes de Compra',
      proposito: 'Emitir, enviar y dar seguimiento a las OC.',
      bloques: [
        { tipo: 'parrafo', texto: 'Selección múltiple para enviar por correo al proveedor. "Cancelar OC" solo aparece si la OC no está en un estado final.' },
        {
          tipo: 'estados',
          titulo: 'Ciclo de vida de una OC',
          items: [
            { estado: 'BORRADOR / PENDIENTE / APROBADA / EMITIDA', color: 'azul', desc: 'Camino normal hasta enviarse al proveedor.' },
            { estado: 'PARCIALMENTE_RECIBIDA / RECIBIDA', color: 'verde', desc: 'Según cuánto se haya recibido en Almacén.' },
            { estado: 'CANCELADA / CANCELACION_PENDIENTE', color: 'rojo', desc: 'No cancelables: CANCELADA, RECIBIDA, COBRADA, CANCELACION_PENDIENTE.' },
            { estado: 'ERROR_FINANZAS', color: 'rojo', desc: 'Falló el compromiso de fondos al emitir un lote de OC.' },
          ],
        },
      ],
    },
    {
      id: 'trazabilidad',
      titulo: 'Trazabilidad',
      proposito: 'Ver el estado presupuestal del proyecto y el semáforo por material.',
      bloques: [
        { tipo: 'parrafo', texto: 'Widget con presupuestado/comprometido/pagado/disponible/% ejercido; alerta de "Presupuesto en riesgo" si lo comprometido supera el 85% de lo presupuestado.' },
        {
          tipo: 'estados',
          titulo: 'Semáforo de materiales',
          items: [
            { estado: 'VERDE', color: 'verde', desc: 'OC ya emitida.' },
            { estado: 'AMARILLO', color: 'ambar', desc: 'Hay requisición pero aún sin OC.' },
            { estado: 'ROJO', color: 'rojo', desc: 'Sin requisición.' },
            { estado: 'EXTRA', color: 'azul', desc: 'Material fuera del presupuesto original.' },
          ],
        },
      ],
    },
    {
      id: 'admin-purga',
      titulo: 'Herramientas Admin',
      proposito: 'Borrar de forma permanente datos de prueba (solo admin).',
      bloques: [
        {
          tipo: 'aviso',
          nivel: 'atencion',
          titulo: 'Acción irreversible',
          texto: 'El borrado es físico y definitivo. Requiere escribir "ELIMINAR" para confirmar. No se puede purgar una requisición si tiene una OC generada que no fue incluida en la misma selección.',
        },
      ],
    },
  ],
  erroresComunes: [
    {
      sintoma: 'No se puede emitir una Orden de Compra desde un cuadro autorizado',
      causa: 'La validación de suficiencia financiera se hace sobre el total agregado del lote de OC, no por renglón individual — si el lote completo excede el presupuesto disponible, Finanzas rechaza toda la emisión (422 PRESUPUESTO_INSUFICIENTE).',
      solucion: 'Revisa el saldo de la partida en Gerencia Técnica antes de generar el lote, o divide la emisión en lotes más pequeños.',
    },
    {
      sintoma: 'Al solicitar cotización externa para un insumo que ya tiene stock, el sistema deja continuar de todos modos',
      causa: 'La validación de stock contra Almacén es una advertencia, no un bloqueo — y si Almacén no responde, el envío no se detiene (fail-soft por diseño).',
      solucion: 'Revisa manualmente el inventario en Almacén antes de confirmar "Enviar de todos modos" si la advertencia aparece.',
    },
    {
      sintoma: 'No se puede purgar una requisición de prueba desde Herramientas Admin',
      causa: 'Tiene una OC generada que no fue incluida en la misma selección de purga (409).',
      solucion: 'Selecciona también la(s) OC relacionadas antes de purgar, o cancela la OC primero.',
    },
  ],
};
