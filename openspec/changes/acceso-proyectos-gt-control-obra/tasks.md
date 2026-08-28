## 1. Tests (TDD — escribir antes del código)

- [x] 1.1 `Layout.acceso-proyectos-gt-control-obra.test.tsx`: usuario `gerencia_tecnica` ve "Proyectos" dentro de "Gerencia Técnica"; al hacer click, `onNavigate('admin')` + `onSubNavigate('proyectos')`.
- [x] 1.2 Test equivalente para "Control de Obra" con rol `control_obra`.
- [x] 1.3 Cubierto indirectamente: el subItem de "Administración" ya incluye `control_obra` en sus roles (no requirió un test nuevo — mismo mecanismo de filtro de roles que el resto de subItems, ya cubierto por tests existentes de la capability).
- [ ] 1.4 No se hizo como test explícito — el resaltado sigue el `currentView` real (`admin`) tras el salto, que es el comportamiento documentado y aceptado en design.md (Decisión 2), no uno nuevo que requiera guardia propia.
- [x] 1.5 Confirmado en rojo antes de implementar (`getByText('Proyectos')` no encontraba nada dentro del `<nav>` de Control de Obra ni de Gerencia Técnica).

## 2. Implementación

- [x] 2.1 Subitem "Proyectos" agregado a "Gerencia Técnica" (`targetView: 'admin'`, sin `roles` propio — heredar el filtro del grupo padre es suficiente).
- [x] 2.2 Subitem "Proyectos" agregado a "Control de Obra" (`targetView: 'admin'`, `roles: ['admin','control_proyectos','control_obra']` — deliberadamente sin `director`, que sí ve el grupo padre pero no pidió este acceso).
- [x] 2.3 `control_obra` agregado a los roles del subItem "Proyectos" de "Administración".
- [x] 2.4 `SubItem.targetView` (campo nuevo) + el handler de click del subItem ahora llama `onNavigate(sub.targetView)` antes de `onSubNavigate(sub.id)` cuando está presente.
- [x] 2.5 **Riesgo confirmado y mitigado**: ni "Nuevo Proyecto" ni "Editar" en `AdminView.tsx` tenían gating por rol — cualquiera que llegara a la pestaña podía intentar crear/editar (el backend sí protegía con `ROLES_ALTA_CENTRO_COSTOS`, pero el UI no ocultaba el botón). Se agregó `puedeEditarProyectos` en `AdminView.tsx` (mismos 3 roles que `ROLES_ALTA_CENTRO_COSTOS`) gating ambos botones. En el backend (`apps/auth/src/main.ts`), se separó `ROLES_VER_CENTRO_COSTOS` (= `ROLES_ALTA_CENTRO_COSTOS` + `control_obra`) para el `GET`, dejando `POST`/`PATCH` sin cambios — `control_obra` puede leer pero no escribir, verificado con test de integración.
- [x] Extra no listado originalmente: se agregaron secciones de ayuda contextual (`help/content/gerencia-tecnica.ts`, `help/content/control-obra.ts`) para el nuevo subItem `proyectos` — el guard `help/registry.test.ts` (cobertura de ayuda contra el sidebar real) falló hasta hacerlo.

## 3. Verificación

- [x] 3.1 Tests de 1.1–1.3 en verde. Suite completa de `Layout.*.test.tsx` + `AdminView.*.test.tsx` sin regresiones (20/20). Test de integración backend (`control-obra-lee-no-escribe-proyectos.integration.test.ts`) confirmado en rojo→verde. `tsc -b` limpio en app-shell y auth.
- [ ] 3.2 Verificación manual en navegador real — pendiente, queda para QA/revisión humana.
- [ ] 3.3 Archivar el change al mergear — pendiente del flujo estándar de OpenSpec (fuera del alcance de esta implementación puntual).
