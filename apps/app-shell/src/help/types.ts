/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Modelo de datos: Ayuda contextual por módulo
 * ---------------------------------------------------------------------------
 * Contenido puro (sin JSX) para que cada módulo se pueda auditar, testear y
 * mantener alineado con el sidebar real (ver help/registry.test.ts).
 * openspec/changes/ayuda-contextual-por-modulo
 */

export type HelpBlock =
  | { tipo: 'parrafo'; texto: string }
  | { tipo: 'pasos'; titulo?: string; items: string[] }
  | { tipo: 'lista'; titulo?: string; items: { termino: string; desc: string }[] }
  | {
      tipo: 'estados';
      titulo?: string;
      items: { estado: string; color: 'verde' | 'ambar' | 'rojo' | 'azul' | 'gris'; desc: string }[];
    }
  | { tipo: 'aviso'; nivel: 'info' | 'atencion'; titulo: string; texto: string };

export interface HelpSection {
  /** Debe coincidir exactamente con SubItem.id del nav (Layout.tsx). */
  id: string;
  /** Debe coincidir exactamente con SubItem.label del nav. */
  titulo: string;
  /** Una frase: para qué sirve esta pestaña. */
  proposito: string;
  bloques: HelpBlock[];
}

export interface ModuleHelp {
  /** Debe coincidir exactamente con NavItem.id del nav (Layout.tsx). */
  viewId: string;
  titulo: string;
  /** Mismo acento visual que ya usa la vista (ver SlidePanel accentColor). */
  accentColor: string;
  /** 2-3 frases: qué hace el módulo. */
  queHace: string;
  rolesTipicos: string[];
  /** El proceso end-to-end del módulo, paso a paso. */
  flujo: string[];
  /** Con qué otros módulos se conecta y por qué mecanismo. */
  conectaCon: { modulo: string; via: string }[];
  /** Vacío en módulos sin subItems en el nav (ej. Ventas, Finanzas). */
  secciones: HelpSection[];
  erroresComunes: { sintoma: string; causa: string; solucion: string }[];
}
