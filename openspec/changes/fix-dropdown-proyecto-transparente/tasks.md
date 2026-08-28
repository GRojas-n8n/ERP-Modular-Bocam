## 1. Reproducir el bug (bug-fix cycle: repro antes que fix)

- [x] 1.1 Test de componente (`Layout.dropdown-proyecto-portal.test.tsx`) que verifica que el panel
      NO es descendiente del `<header>` — determinístico en jsdom (no depende de compositing real).
      Confirmado en rojo contra el código actual (`header.contains(panel)` era `true`).
- [x] 1.2 Repro documentado en el design.md a partir del reporte del usuario (transparencia/superposición
      en la primera pantalla post-login al cambiar de proyecto); no se hizo verificación visual manual
      en Chrome en esta pasada (requiere ambiente corriendo) — queda para QA/revisión humana.

## 2. Implementar el fix

- [x] 2.1 Panel extraído a `createPortal(..., document.body)`.
- [x] 2.2 Posición calculada con `getBoundingClientRect()` del botón trigger (`projectTriggerRef`),
      `position: fixed` con `top`/`left`/`width` resultantes (ancho = máximo entre el trigger y 240px,
      igual que el `min-w` original).
- [x] 2.3 Lógica de cierre por click-fuera reutilizada sin cambios (`stopPropagation` en el panel
      sigue funcionando igual estando en el portal, porque los eventos nativos burbujean por la
      posición real en el DOM).
- [x] 2.4 Se optó por **cerrar** el dropdown en scroll/resize (opción recomendada en el design, sin
      pregunta abierta bloqueante) en vez de reposicionar.
- [ ] 2.5 Verificación visual real en Chromium (backdrop-filter) — pendiente, requiere ambiente
      corriendo; el test de componente cubre la causa raíz (posición en el árbol DOM) pero no el
      compositing real del navegador.

## 3. Validar

- [x] 3.1 Test de 1.1 pasa tras el fix.
- [ ] 3.2 Verificación visual en Chrome real — pendiente (ver 2.5).
- [x] 3.3 Test adicional confirma que seleccionar un proyecto en el panel portal cambia de proyecto
      (`setCurrentProjectId`) y cierra el dropdown, igual que antes.
- [x] 3.4 Revisado `apps/app-shell/test` (Playwright) — sin matches para el dropdown de proyecto,
      no hay selectores que dependieran de su posición anterior en el DOM.

## 4. PR

- [x] 4.1 PR contra `main` desde branch `fix/dropdown-proyecto-transparente`, incluyendo el test de
      repro y el fix.
