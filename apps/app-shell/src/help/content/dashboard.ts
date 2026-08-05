import type { ModuleHelp } from '../types';

/**
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * openspec/changes/ayuda-contextual-por-modulo
 */
export const dashboard: ModuleHelp = {
  viewId: 'dashboard',
  titulo: 'Dashboard',
  accentColor: 'blue',
  queHace:
    'Es la puerta de entrada al ERP: resume en un vistazo el estado de los proyectos activos y da acceso directo a cada módulo. No tiene formularios propios — todo lo que muestra viene agregado de los demás microservicios.',
  rolesTipicos: ['Todos los roles (el contenido varía según el rol)'],
  flujo: [
    'Al iniciar sesión, el usuario aterriza aquí antes que en cualquier módulo.',
    'Superintendencia y Administración ven el "Dashboard Ejecutivo": avance general de obra, presupuesto/ejercido/comprometido, alertas predictivas de IA y un resumen conversacional ("¿Cómo va la obra?") generado por el asistente.',
    'El resto de los roles ve el dashboard estándar: KPIs de proyectos activos, presupuesto, órdenes de compra, ejecución presupuestal y actividad reciente.',
    'Desde cualquiera de las dos variantes, cada tarjeta de módulo navega directo a esa vista (equivalente a usar el sidebar).',
  ],
  conectaCon: [
    { modulo: 'Compras', via: 'Consulta resumen-dashboard del microservicio para KPIs de OCs' },
    { modulo: 'Control de Obra', via: 'Consulta resumen-dashboard para avance de obra y EVM agregado' },
    { modulo: 'Recursos Humanos', via: 'Consulta resumen-dashboard para KPIs de personal' },
    { modulo: 'Seguridad HSE', via: 'Consulta resumen-dashboard para alertas de cumplimiento' },
    { modulo: 'Calidad', via: 'Consulta resumen-dashboard para NCs/auditorías abiertas' },
    { modulo: 'Finanzas', via: 'Consulta resumen-dashboard para presupuesto/ejercido/comprometido' },
  ],
  secciones: [],
  erroresComunes: [
    {
      sintoma: 'Un módulo aparece sin datos o con "—" en el Dashboard Ejecutivo',
      causa: 'Las 6 consultas a los microservicios se hacen en paralelo con tolerancia a fallos; si uno no responde, ese bloque se muestra vacío en vez de romper todo el dashboard.',
      solucion: 'No es necesariamente un error de datos — reintenta recargar. Si persiste, revisa el módulo específico directamente.',
    },
    {
      sintoma: 'Los KPIs y las alertas predictivas no cambian nunca, aunque avance la obra',
      causa: 'El tenant está en modo demo (`isDemo`); en ese modo el dashboard ejecutivo usa datos fijos de ejemplo, no datos reales.',
      solucion: 'Confirma si el proyecto activo es un tenant de demostración antes de reportarlo como bug.',
    },
  ],
};
