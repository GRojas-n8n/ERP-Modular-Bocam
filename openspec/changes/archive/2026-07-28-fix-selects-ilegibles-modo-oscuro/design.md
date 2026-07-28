## Context

`apps/app-shell` implementa modo oscuro con un atributo `data-theme="dark"`
en `<html>` (`useTheme()` en `Layout.tsx`) y variables CSS HSL (`--card`,
`--foreground`, `--popover`, etc.) redefinidas bajo `[data-theme="dark"]`
en `index.css`. Ese mecanismo cubre todo el CSS propio de la app (Tailwind
utilities sobre las variables), pero **no** cubre automáticamente el
theming de controles de formulario nativos del navegador (`<select>`,
scrollbars, checkboxes/radios sin `appearance-none`) — eso depende de la
propiedad CSS `color-scheme`, que el proyecto nunca declaraba.

## Goals / Non-Goals

**Goals:**
- El control cerrado de cualquier `<select>` debe verse legible en modo
  oscuro (fondo oscuro, texto claro), sin excepciones.
- El popup de opciones abierto debe verse legible en modo oscuro en Chrome
  real (no solo en la verificación automatizada).
- Minimizar el diff: no migrar a un componente custom de listbox.

**Non-Goals:**
- No rediseñar el sistema de temas ni introducir una librería de
  componentes de formulario.
- No tocar `<select>` que ya declaran su propio fondo (`bg-muted/50`,
  `bg-card`, `bg-background`) — no tienen este bug.

## Decisions

**Decisión 1 — `color-scheme` en vez de forzar clases Tailwind en cada
control nativo.** Es la señal estándar de la plataforma para que el
navegador dibuje TODOS los controles nativos (selects, scrollbars,
checkboxes por defecto) con la paleta correcta, con una sola línea por
tema. Alternativa descartada: clases Tailwind explícitas en cada
`<select>` sin tocar `color-scheme` — no resuelve scrollbars ni checkboxes
nativos en otras partes del código, y no ataca la causa raíz.

**Decisión 2 — estilos explícitos por `<option>` además de
`color-scheme`.** Verificado empíricamente que no basta con
`color-scheme: dark` heredado: el popup de opciones de un `<select>` en
Chrome real seguía saliendo con fondo claro pese a que
`getComputedStyle(select).colorScheme` ya reportaba `"dark"` (confirmado
también en Chromium headless, que SÍ pintaba el popup oscuro en el
`select` cerrado — la discrepancia solo apareció en el popup real,
imposible de verificar por captura headless). Blink sí honra
`background-color`/`color` puestos directamente en cada `<option>`,
independientemente de si `color-scheme` se heredó correctamente al popup;
por eso se agregó `[data-theme="dark"] option { background-color: ...;
color: ...; }` como refuerzo, no como sustituto de `color-scheme`.

**Decisión 3 — arreglar los `<select>` sin fondo en vez de darles
`color-scheme` únicamente.** Los dos `<select>` de `PersonalView.tsx` sin
`bg-*` propio seguían saliendo blancos incluso después de declarar
`color-scheme: dark`, porque sin un `background-color` de autor, el
control cerrado también depende de theming nativo — y ese theming nativo
demostró ser poco confiable (ver Decisión 2). Se les agregó `bg-muted/30
text-foreground appearance-none`, igual que el resto de selects del
proyecto, para que el control cerrado dependa del CSS de la app y no de
la plataforma.

## Risks / Trade-offs

- El theming de controles nativos vía `color-scheme` y estilos de
  `<option>` es un área con comportamiento inconsistente entre
  navegadores/motores (confirmado en esta misma sesión: Chromium headless
  y Chrome real no se comportaron igual para el popup). El fix se validó
  contra Chrome real vía confirmación directa del usuario en producción,
  no solo contra la suite automatizada — riesgo residual en Firefox/Safari
  no verificado.
- No se auditaron otros controles nativos (checkboxes/radios sin
  `appearance-none`, `<input type="date">`) que podrían tener el mismo
  patrón de bug — fuera de alcance de este fix, que se limitó al reporte
  real recibido.
