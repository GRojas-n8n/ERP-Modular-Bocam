## 1. Tests (TDD — escribir antes del código)

- [x] 1.1 `Layout.sidebar-submenu-flyout.test.tsx`: el panel de subItems tiene las clases `md:absolute md:left-full` (posicionamiento flyout) además de las clases base de acordeón mobile (`relative`, `ml-4`). jsdom no evalúa media queries — se verifica presencia de clases, el posicionamiento real queda para verificación visual manual (3.2/3.3).
- [x] 1.2 Test: el panel se oculta (clase `md:hidden`, solo efectiva en escritorio) al hacer clic fuera de él.
- [x] 1.3 Test: mismo comportamiento al presionar Escape.
- [x] 1.4 Cubierto implícitamente: la condición de render (`active && hasSubItems`) no cambió — sigue idéntica a la del acordeón mobile original; solo se agregaron clases `md:` y una clase `md:hidden` condicional que no tiene efecto por debajo del breakpoint `md`. No se duplicó el bloque de renderizado.
- [x] 1.5 Confirmado en rojo antes de implementar (`git stash` del fix — `data-submenu-flyout` no existía, los 4 tests fallaban).

## 2. Implementación

- [x] 2.1 Nuevo estado `openSubmenuId` (independiente de `currentView`/`active`), sincronizado vía `useEffect` a `currentView` — se abre automáticamente el submenú del módulo activo (cubre navegación normal y saltos cross-grupo vía `SubItem.targetView`, agregado en `acceso-proyectos-gt-control-obra`).
- [x] 2.2 Panel de subItems: clases base (`relative mt-0.5 mb-1 ml-4`) sin cambios para mobile; agregado `md:absolute md:left-full md:top-0 md:mt-0 md:mb-0 md:ml-2 md:z-30 md:w-56 md:rounded-xl md:border md:border-border/40 md:bg-[hsl(var(--card))] md:p-1.5 md:shadow-xl` para el flyout en escritorio, más `md:hidden` condicional según `openSubmenuId`. Contenedor padre (`<div key={item.id}>`) marcado `relative` para anclar el `left-full`. Línea conectora vertical oculta en escritorio (`md:hidden`) — no tiene sentido en un panel flotante desconectado del botón.
- [x] 2.3 Replicado el patrón exacto de clic-fuera/Escape del dropdown de proyecto (`setTimeout(...,0)` para no cerrarse con el mismo clic que abre, `keydown` para Escape), usando `closest('[data-submenu-flyout]')` en vez de un ref único — necesario porque puede haber un panel distinto por cada módulo con subItems.
- [x] 2.4 `md:z-30` en el panel; sin conflicto con el dropdown de proyecto (`z-50`, portal a `document.body`, contexto de stacking totalmente distinto).

## 3. Verificación

- [x] 3.1 Tests de 1.1–1.3 en verde. Suite completa `Layout.*.test.tsx` + guard de ayuda contextual sin regresiones (9 archivos/19 tests). `tsc -b` limpio.
- [ ] 3.2 Verificación visual manual en escritorio (Gerencia Técnica con varios subItems) — pendiente, requiere ambiente corriendo; queda para QA/revisión humana.
- [ ] 3.3 Verificación visual manual en el rango 768px-900px y en mobile (drawer) — pendiente, ídem.

## Decisión sobre la Open Question del design.md

Se implementó la recomendación explícita: seleccionar un subItem normal (sin `targetView`) cierra el flyout (`setOpenSubmenuId(null)`) antes de navegar, igual que el dropdown de proyecto cierra al seleccionar. Un subItem con `targetView` no lo cierra explícitamente — el `useEffect` que sincroniza con `currentView` abre automáticamente el flyout del módulo destino en cuanto cambia, dejando el flyado de origen oculto porque su `active` deja de ser `true`.
