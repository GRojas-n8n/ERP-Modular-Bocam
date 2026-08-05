import type { ModuleHelp } from './types';
import { dashboard } from './content/dashboard';
import { gerenciaTecnica } from './content/gerencia-tecnica';
import { compras } from './content/compras';
import { almacen } from './content/almacen';
import { finanzas } from './content/finanzas';
import { contabilidad } from './content/contabilidad';
import { controlObra } from './content/control-obra';
import { residencia } from './content/residencia';
import { personal } from './content/personal';
import { seguridad } from './content/seguridad';
import { ventas } from './content/ventas';
import { calidad } from './content/calidad';
import { admin } from './content/admin';

/**
 * Registro de ayuda contextual por módulo. Claves = NavItem.id de
 * ALL_NAV_ITEMS (Layout.tsx). Ver help/registry.test.ts para el guard que
 * mantiene esto sincronizado con el sidebar real.
 * openspec/changes/ayuda-contextual-por-modulo
 */
export const HELP_BY_VIEW: Record<string, ModuleHelp> = {
  dashboard,
  insumos: gerenciaTecnica,
  compras,
  almacen,
  finanzas,
  contabilidad,
  'control-obra': controlObra,
  residencia,
  personal,
  seguridad,
  ventas,
  calidad,
  admin,
};

export const getModuleHelp = (viewId: string): ModuleHelp | undefined => HELP_BY_VIEW[viewId];

export type { HelpBlock, HelpSection, ModuleHelp } from './types';
