## Why

Usuarios reportan que el selector de proyecto activo, en el header de `app-shell`, es difícil de
localizar visualmente. Aunque el indicador ya muestra nombre y color determinístico del proyecto
(ver capability `indicador-proyecto-activo`), su estilo actual (`border-l-4` + fondo suave,
precedido por un label "Proyectos" en `opacity-60`) no logra distinguirlo lo suficiente del resto
del header, lo que genera cambios de proyecto accidentales o dificultad para confirmar en qué
proyecto se está trabajando antes de operar.

## What Changes

- Reforzar el énfasis visual del botón selector de proyecto en el header para que sea fácil de
  localizar de un vistazo, reutilizando la utilidad ya existente `.glow-primary` (u otro
  tratamiento equivalente: `ring`, mayor contraste del label) sin introducir un nuevo patrón
  visual ajeno al sistema de diseño actual.
- No cambia el mecanismo de cambio de proyecto ni el contenido mostrado (nombre, color, código) —
  es puramente un refuerzo de estilo sobre el indicador ya especificado.

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `indicador-proyecto-activo`: se agrega el requisito de que el indicador tenga énfasis visual
  suficiente para ser fácilmente localizable en el header, además de mostrar nombre/color/código.

## Impact

- Frontend: `apps/app-shell/src/components/Layout.tsx` (botón selector de proyecto, ~líneas
  546-571) y posiblemente `apps/app-shell/src/index.css` si se ajusta la utilidad `.glow-primary`
  existente.
- Sin impacto en backend, API ni datos.
