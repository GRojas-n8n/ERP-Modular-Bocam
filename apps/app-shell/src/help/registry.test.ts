import { describe, expect, it } from 'vitest';
import { ALL_NAV_ITEMS } from '../components/Layout';
import { HELP_BY_VIEW } from './index';

/**
 * Guard de cobertura — evita que la ayuda contextual se desactualice en
 * silencio respecto al sidebar real, como pasó con docs/manual-de-usuario.md
 * (ver openspec/changes/ayuda-contextual-por-modulo/design.md).
 *
 * Si este test falla porque agregaste/quitaste un módulo o una pestaña en
 * ALL_NAV_ITEMS (Layout.tsx), actualiza el contenido correspondiente en
 * apps/app-shell/src/help/content/*.ts antes de continuar.
 */
describe('ayuda contextual — cobertura contra el sidebar real', () => {
  it('tiene ModuleHelp para cada NavItem.id del sidebar', () => {
    const navIds = ALL_NAV_ITEMS.map(item => item.id);
    const helpIds = Object.keys(HELP_BY_VIEW);

    const faltantes = navIds.filter(id => !helpIds.includes(id));
    const huerfanos = helpIds.filter(id => !navIds.includes(id));

    expect(faltantes, `Módulos del sidebar sin ayuda registrada: ${faltantes.join(', ')}`).toEqual([]);
    expect(huerfanos, `Ayuda registrada para módulos que ya no existen en el sidebar: ${huerfanos.join(', ')}`).toEqual([]);
  });

  it('cada ModuleHelp.viewId coincide con su propia clave en HELP_BY_VIEW', () => {
    const mismatched = Object.entries(HELP_BY_VIEW)
      .filter(([key, help]) => help.viewId !== key)
      .map(([key, help]) => `${key} (viewId declarado: ${help.viewId})`);

    expect(mismatched, `ModuleHelp.viewId no coincide con su clave: ${mismatched.join(', ')}`).toEqual([]);
  });

  it('tiene una HelpSection por cada SubItem del nav, sin secciones huérfanas', () => {
    const problemas: string[] = [];

    for (const navItem of ALL_NAV_ITEMS) {
      const help = HELP_BY_VIEW[navItem.id];
      const subIds = (navItem.subItems ?? []).map(s => s.id);
      const sectionIds = (help?.secciones ?? []).map(s => s.id);

      const faltantes = subIds.filter(id => !sectionIds.includes(id));
      const huerfanas = sectionIds.filter(id => !subIds.includes(id));

      if (faltantes.length > 0) {
        problemas.push(`${navItem.id}: faltan secciones de ayuda para [${faltantes.join(', ')}]`);
      }
      if (huerfanas.length > 0) {
        problemas.push(`${navItem.id}: sobran secciones de ayuda para pestañas inexistentes [${huerfanas.join(', ')}]`);
      }
    }

    expect(problemas, problemas.join('\n')).toEqual([]);
  });
});
