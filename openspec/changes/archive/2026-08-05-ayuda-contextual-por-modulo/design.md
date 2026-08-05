## Context

`apps/app-shell` es una SPA sin `react-router`: la navegación es un `switch` en `App.tsx` sobre dos strings (`currentView`, `currentSubView`) que vienen de `Layout.tsx`. El único registro de módulos y pestañas es el array `const ALL_NAV_ITEMS: NavItem[]` en `Layout.tsx` (no exportado hoy), donde cada `NavItem` tiene `id`, `roles` y opcionalmente `subItems: SubItem[]` (cada uno con su propio `id`, `label`, `roles?`). Cada vista (`*View.tsx`) recibe `activeSubView` como prop y decide qué pestaña renderizar con un `switch`/comparación de strings — no hay un componente de tabs compartido.

Ya existe un precedente exacto de "panel de ayuda": `InsumosView.tsx` abre un `SlidePanel` (wrapper de `SideSheet` de `@bocam/ui-core`) con contenido de guía para exportar desde OPUS, con `h3` en mayúsculas, tarjetas con borde redondeado y pasos numerados. No existe ningún otro mecanismo de ayuda, tooltip genérico, accordion o modal en `ui-core`.

El repo ya tiene un manual (`docs/manual-de-usuario.md`) escrito para este propósito, pero vive fuera de la app y quedó desactualizado frente al sidebar real — es la señal de que el contenido de ayuda necesita vivir pegado al código que describe y con un guard automático, no solo buena voluntad de mantenerlo.

## Goals / Non-Goals

**Goals:**
- Ayuda in-app, por módulo, accesible con un clic desde donde el usuario ya está trabajando.
- Contenido correcto y no solo replicado del manual desactualizado — verificado contra el sidebar real y contra los `openspec/specs/` de cada capability.
- Imposible que el contenido de ayuda quede huérfano o incompleto respecto al sidebar sin que un test lo señale.
- Cero cambios de backend, cero nuevas dependencias de terceros.

**Non-Goals:**
- Buscador global de ayuda o una vista "Centro de Ayuda" separada en el sidebar.
- Tours interactivos / onboarding guiado sobre la UI.
- Editar `docs/manual-de-usuario.md` (se deja como recomendación de seguimiento, fuera de este change).
- Contenido de ayuda editable en runtime sin deploy (no hay caso de uso hoy que lo justifique).

## Decisions

**Contenido como datos TypeScript tipados, no Markdown ni backend.**
Alternativas consideradas: (a) Markdown en el repo renderizado en el panel — requeriría agregar una librería de parsing/renderizado que hoy no existe en `app-shell`, y perdería el tipado que permite el guard de cobertura; (b) endpoint de backend que sirva el contenido — permitiría editar sin deploy, pero introduce una base de datos, RBAC y un microservicio nuevos para contenido que cambia con la misma frecuencia que el propio sidebar (o sea, en el mismo commit). Se descarta ambas: el contenido vive en `apps/app-shell/src/help/content/*.ts`, un archivo por módulo, tipado por `ModuleHelp`/`HelpSection` (`help/types.ts`), y se despliega junto con el resto del frontend.

**Un `HelpPanel` reutilizable + botón de ayuda por vista, no un componente por módulo.**
Cada una de las 13 vistas ya tiene su propio header (dos variantes: "hero" grande y compacto) y su propio bloque final de `SlidePanel`s. En vez de crear 13 componentes de ayuda, se crea un único `<HelpPanel viewId="..." activeSubView={...} isOpen={...} onClose={...} />` que resuelve el contenido desde el registro (`help/index.ts`) por `viewId`; cada vista solo agrega 3 líneas (estado, botón, panel). Esto reduce a un solo lugar la lógica de render (secciones colapsables, sección activa expandida, flujo/conexiones/errores comunes) y dsminuye el riesgo de que las 13 implementaciones diverjan visualmente.

**Guard de cobertura vía test, no vía tipos de TypeScript.**
El nav (`ALL_NAV_ITEMS`) es un array runtime construido con componentes de ícono (`React.FC`), no un union type — no se puede forzar en tiempo de compilación que cada `id` tenga su contraparte de ayuda sin un remap manual frágil. Se opta por: (1) exportar `ALL_NAV_ITEMS` desde `Layout.tsx` (hoy es un `const` de módulo, ya no ligado a nada que impida exportarlo), y (2) un test (`help/registry.test.ts`) que recorre `ALL_NAV_ITEMS` y compara contra `HELP_BY_VIEW`, fallando si sobra o falta un `NavItem.id` o `SubItem.id`. Es exactamente el patrón "test que reproduce el problema" que ya usa este repo para RLS (`scripts/ci/check-rls-coverage.js`), aplicado a documentación en vez de a seguridad.

**Sección activa expandida con `<details>` nativo, no un Accordion de `ui-core`.**
`ui-core/src/primitives.tsx` no tiene componente Accordion/Collapsible. Construir uno de cero para 13 usos de "expandir/colapsar una sección de texto" es sobre-ingeniería; `<details>`/`<summary>` nativo de HTML ya da accesibilidad de teclado gratis y se puede forzar `open` según `id === activeSubView` sin estado adicional de React.

**Reusar el vocabulario visual del panel OPUS existente (`InsumosView.tsx`), no inventar uno nuevo.**
Mismo `SlidePanel`, mismas clases (`font-black text-xs uppercase tracking-widest`, tarjetas `rounded-xl border`, pasos numerados en círculo, avisos en ámbar) — consistencia con lo que el usuario ya vio funcionar, y cero necesidad de nuevos primitivos en `ui-core`.

## Risks / Trade-offs

- **[Riesgo] Contenido de ayuda incorrecto si se copia directo de `docs/manual-de-usuario.md` sin verificar contra la UI real** → Mitigación: orden de autoridad explícito en tasks.md (UI real y código de la vista primero, luego `openspec/specs/<capability>`, luego el manual solo como borrador de redacción).
- **[Riesgo] Un cambio futuro al sidebar (agregar/quitar una pestaña) rompe el test de cobertura y bloquea CI hasta actualizar la ayuda** → Es la mitigación intencional al problema que motiva este change (contenido que se desactualiza en silencio); se documenta en el propio mensaje de fallo del test para que quien toque el nav sepa qué actualizar.
- **[Riesgo] Exportar `ALL_NAV_ITEMS` desde `Layout.tsx` podría tentar a otro código a reusarlo para lógica de negocio (acoplamiento no deseado)** → Se limita el uso fuera de `Layout.tsx` exclusivamente al test de cobertura; no se importa en ninguna vista ni en `App.tsx`.
- **[Trade-off] 13 archivos de contenido a redactar y verificar de una sola vez (alcance elegido por el usuario) es más trabajo de revisión que un piloto de 2-3** → Se mitiga verificando en navegador real solo una muestra representativa (4 módulos con roles distintos) más el build/test suite completo para el resto.

## Migration Plan

No aplica migración de datos (sin backend, sin BD). Despliegue: build y deploy normal del frontend (`apps/app-shell`) vía el pipeline existente (`frontend-build.yml` ya valida `tsc -b`). Rollback: revertir el commit/PR — no hay estado persistente que limpiar.

## Open Questions

Ninguna pendiente — alcance, acceso, granularidad y ubicación del contenido fueron decididos con el usuario antes de este change.
