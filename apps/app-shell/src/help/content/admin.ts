import type { ModuleHelp } from '../types';

/**
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * openspec/changes/ayuda-contextual-por-modulo
 */
export const admin: ModuleHelp = {
  viewId: 'admin',
  titulo: 'Administración',
  accentColor: 'sky',
  queHace:
    'Gestiona usuarios y sus roles, da de alta los Centros de Costos (que en el resto del ERP se llaman "proyectos") y configura las categorías de gasto que usará Gerencia Técnica para clasificar insumos. Es el único punto de entrada para crear usuarios y asignarles proyectos.',
  rolesTipicos: ['admin', 'gerencia_tecnica (proyectos)', 'control_proyectos (proyectos)'],
  flujo: [
    'Se crea el Centro de Costos (proyecto) con su código, cliente y línea base financiera/de plazos.',
    'Al crearse, el sistema notifica a Gerencia Técnica (que siembra su configuración de costos y categorías de gasto predefinidas) y a Finanzas (que crea su registro de anticipos en cero).',
    'Se configuran/ajustan las categorías de gasto propias del proyecto mientras esté en estado de configuración.',
    'Al activar el proyecto, las categorías de gasto quedan congeladas de forma permanente.',
    'Se crean y mantienen los usuarios del sistema, asignándoles roles y los proyectos a los que tienen acceso.',
  ],
  conectaCon: [
    { modulo: 'Gerencia Técnica', via: 'Recibe el evento de centro de costos creado y siembra su configuración de costos y categorías de gasto' },
    { modulo: 'Finanzas', via: 'Recibe el mismo evento y crea el registro de anticipos del proyecto' },
    { modulo: 'Ventas', via: 'Un cliente necesita código de cliente asignado en Ventas antes de poder crear su Centro de Costos aquí' },
  ],
  secciones: [
    {
      id: 'usuarios',
      titulo: 'Usuarios',
      proposito: 'Crear y administrar usuarios, sus roles y sus proyectos asignados.',
      bloques: [{ tipo: 'parrafo', texto: 'Tabla de usuarios con roles (badges), proyectos asignados y estado activo/inactivo. El modal de alta/edición permite asignar múltiples roles y múltiples proyectos por checkbox.' }],
    },
    {
      id: 'proyectos',
      titulo: 'Proyectos',
      proposito: 'Dar de alta y administrar Centros de Costos.',
      bloques: [
        { tipo: 'parrafo', texto: 'El código de Centro de Costos se ensambla automáticamente (empresa + año + cliente + consecutivo) y es de solo lectura, salvo en centros "especiales" (Oficina, Taller, Almacén) que aceptan código libre.' },
        {
          tipo: 'estados', titulo: 'Estatus del proyecto', items: [
            { estado: 'ABIERTO', color: 'gris', desc: 'Recién creado.' },
            { estado: 'EN EJECUCIÓN', color: 'azul', desc: 'Obra en marcha.' },
            { estado: 'EN COBRO', color: 'ambar', desc: 'Cerrando facturación.' },
            { estado: 'TERMINADO', color: 'verde', desc: 'Obra concluida.' },
            { estado: 'CERRADO', color: 'gris', desc: 'Ciclo administrativo cerrado.' },
          ],
        },
        { tipo: 'aviso', nivel: 'info', titulo: 'Validación de fechas', texto: 'La fecha programada de fin no puede ser anterior a la fecha programada de inicio.' },
      ],
    },
    {
      id: 'categorias',
      titulo: 'Categorías de Gasto',
      proposito: 'Configurar las categorías de gasto que usará Gerencia Técnica para clasificar insumos del proyecto.',
      bloques: [
        {
          tipo: 'aviso',
          nivel: 'atencion',
          titulo: 'Se congelan al activar el proyecto',
          texto: 'Las categorías de gasto solo son editables mientras el proyecto está en configuración. Al activarlo, quedan congeladas de forma permanente — la acción no se puede deshacer.',
        },
        { tipo: 'parrafo', texto: 'Una categoría no predefinida por el sistema solo puede eliminarse si no tiene insumos asociados.' },
      ],
    },
  ],
  erroresComunes: [
    {
      sintoma: 'No se puede dar de alta el Centro de Costos de un cliente nuevo',
      causa: 'El cliente todavía no tiene código de cliente (3 dígitos) asignado en el módulo Ventas.',
      solucion: 'Usa la opción "+ Agregar Cliente" dentro del mismo formulario, o asigna el código de cliente en Ventas antes de continuar.',
    },
    {
      sintoma: 'Ya no se pueden editar las categorías de gasto de un proyecto',
      causa: 'El proyecto ya fue activado y las categorías quedaron congeladas permanentemente por diseño.',
      solucion: 'Revisa la clasificación con cuidado antes de activar un proyecto — después de activarlo no hay forma de deshacerlo.',
    },
    {
      sintoma: 'Un usuario con rol gerencia_tecnica o control_proyectos no puede crear usuarios ni categorías de gasto',
      causa: 'Esos subItems del módulo son exclusivos del rol admin; gerencia_tecnica/control_proyectos solo tienen acceso a la pestaña Proyectos.',
      solucion: 'Solo un usuario con rol admin puede gestionar Usuarios y Categorías de Gasto.',
    },
  ],
};
