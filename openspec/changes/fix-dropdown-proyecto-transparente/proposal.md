## Why

Al iniciar sesión (o en la primera pantalla que carga tras cambiar de proyecto), el desplegable
del selector de proyecto en el header se renderiza con fondo transparente y se superpone
visualmente con el contenido de la pantalla que tiene detrás, en vez de mostrarse con fondo sólido
y opaco. Esto dificulta leer las opciones del desplegable y confunde al usuario sobre qué
proyectos están disponibles.

## What Changes

- Corregir el renderizado del panel desplegable del selector de proyecto (`Layout.tsx`, panel de
  opciones ~líneas 574-616) para que **siempre** se muestre con fondo sólido y opaco, sin heredar
  el `backdrop-filter`/transparencia del header contenedor (`.glass-elevated`).
- El panel deja de ser descendiente directo del `<header>` en el árbol de composición visual: se
  renderiza vía portal (`createPortal` a `document.body`) posicionado con las coordenadas del
  botón trigger, o se aísla explícitamente su capa de composición (`isolation: isolate`,
  `backdropFilter: 'none'` forzado) para que no recomponga con el blur del ancestro.
- Se agrega un test de regresión (visual o de estilos computados) que reproduzca el bug antes del
  fix, según el ciclo de bug-fix del proyecto.

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `indicador-proyecto-activo`: se agrega el requisito de que el panel desplegable del selector de
  proyecto se renderice siempre con fondo opaco/sólido, independiente del contexto de apilamiento
  o efectos visuales (`backdrop-filter`) de sus elementos ancestros.

## Impact

- Frontend: `apps/app-shell/src/components/Layout.tsx` (panel del dropdown de proyecto).
- Estilos: `apps/app-shell/src/index.css` (`.glass-elevated`, líneas ~176-181) — no se modifica la
  clase en sí, pero el fix debe evitar que el dropdown herede su composición.
- No afecta backend ni otros microservicios.
