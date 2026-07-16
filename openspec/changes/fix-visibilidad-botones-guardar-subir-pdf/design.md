## Context

El app-shell no tiene un componente de botón único y consistentemente adoptado:
`Button`/`SubmitButton` existen en `packages/ui-core` y `SlidePanel.tsx`, pero la
mayoría de los botones de "Guardar" en vistas legacy son `<button>` sueltos con
Tailwind inline, y las zonas de subir PDF varían clase por clase entre vistas.
Centralizar en `ui-core` sería la solución correcta a largo plazo, pero es un
refactor de arquitectura que excede el alcance de un fix de contraste puntual y
tocaría más código legacy del necesario para resolver el problema reportado.

Las opciones de color se validaron con el usuario mediante un mockup renderizado
sobre los tokens reales de `apps/app-shell/src/index.css` (fondos claro/oscuro),
no por nombre de color en abstracto.

## Goals / Non-Goals

**Goals:**
- Que el botón "Guardar" y la zona "Subir PDF / adjuntar" sean claramente
  visibles en tema claro y oscuro en las 7 vistas identificadas.
- Un único par de estilos (uno para "Guardar", uno para "Subir PDF") aplicado de
  forma consistente en todas las instancias, para que el usuario aprenda un solo
  lenguaje visual de "acción de confirmar/guardar" en toda la app.

**Non-Goals:**
- No se centraliza el botón en `packages/ui-core` ni se migran los `<button>`
  sueltos al componente compartido — eso es un refactor aparte, fuera de
  alcance.
- No cambia ningún comportamiento (validaciones, disabled state, lógica de
  subida) — solo clases de color/borde/texto.
- No cubre botones de otras acciones (cancelar, eliminar, exportar) que no sean
  "Guardar" o "Subir PDF/adjuntar".

## Decisions

- **Verde sólido `#059669` / hover `#047857` para "Guardar"**, en vez de amarillo
  o reforzar el cian de marca. Razón: `MasterView.tsx` ya usa `bg-emerald-600`
  para guardar, así que reutilizar ese verde unifica en vez de introducir un
  tercer color al sistema. El amarillo se descartó porque ya se usa en el
  sistema para advertencias/alertas (choque de significado); reforzar el cian
  se descartó porque en varios casos el problema real no era el color de marca
  sino opacidad/peso aplicados incorrectamente al estado "enabled".
- **Dropzone verde (borde + texto verde real, no gris/tinte sobre tinte) para
  "Subir PDF"**, conservando el patrón visual de caja punteada en vez de
  reemplazarlo por un botón sólido. Razón: el patrón "arrastrar y soltar" ya es
  reconocible por los usuarios; el problema no era la forma sino el contraste
  (`text-muted-foreground` sobre `bg-muted/20`, o tintes de color al 5-10% de
  opacidad que quedan casi ilegibles).
- **Fix inline por instancia, sin tocar `ui-core`.** Alternativa considerada:
  crear una clase utilitaria compartida (`.btn-guardar`, `.dropzone-pdf`) en
  `index.css`. Se descartó por ahora para minimizar el diff y el riesgo sobre
  código legacy (regla del proyecto: no refactorizar legacy sin spec propio);
  si se decide centralizar después, este mismo par de colores es la referencia.

## Risks / Trade-offs

- [Riesgo] Aplicar el mismo verde en 7 archivos sin componente compartido deja
  la puerta abierta a que un futuro cambio solo actualice algunas instancias →
  Mitigación: tasks.md lista cada archivo/línea explícitamente y task de
  verificación visual final revisa las 7 vistas en un solo pase.
- [Riesgo] El verde de "Guardar" podría confundirse con un estado de éxito
  (toast, badge) si ambos comparten el mismo tono exacto → Mitigación: se
  reutiliza intencionalmente el verde que `MasterView.tsx` ya usa para guardar,
  no un verde nuevo; no se toca la paleta de badges/toasts.
- [Riesgo] Verificación es manual/visual, no automatizable con asserts de color
  → Mitigación: tasks.md documenta captura o inspección en navegador en ambos
  temas como criterio de aceptación explícito por vista.

## Migration Plan

Sin migración de datos ni despliegue especial: es un cambio de frontend puro
(Tailwind inline). Se construye `apps/app-shell`, se verifica visualmente en
local (claro/oscuro) y se despliega junto con el resto del build de app-shell
en el próximo redeploy de ese servicio. Rollback trivial: revertir el commit,
no hay estado persistente involucrado.
