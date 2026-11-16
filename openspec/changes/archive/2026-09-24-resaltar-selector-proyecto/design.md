## Context

El selector de proyecto vive en `apps/app-shell/src/components/Layout.tsx` (~líneas 546-571) como
un botón dentro del header, ya cubierto por la capability `indicador-proyecto-activo`. Hoy usa
`border-l-4` con el color determinístico del proyecto más un fondo suave (`bgSoft`), precedido de
un label "Proyectos" en `opacity-60` que compite visualmente y le resta protagonismo. El proyecto
ya cuenta con una utilidad CSS reusable `.glow-primary` (`apps/app-shell/src/index.css`) pensada
para dar énfasis a elementos interactivos clave, sin necesidad de introducir un nuevo patrón.

## Goals / Non-Goals

**Goals:**
- Que el botón selector de proyecto sea perceptiblemente más prominente que el resto del header,
  legible en tema claro y oscuro, sin depender de que el usuario ya sepa dónde buscarlo.

**Non-Goals:**
- No cambia el contenido del indicador (nombre, color, código) — eso ya está resuelto por
  `indicador-proyecto-activo`.
- No cambia el comportamiento del dropdown ni el flujo de cambio de proyecto.

## Decisions

- **Usar `.glow-primary` existente** en vez de crear una nueva utilidad de énfasis: mantiene
  consistencia visual con el resto del sistema (ya se usa en otros CTAs primarios) y evita
  duplicar patrones de sombra/color en `index.css`.
- **Elevar el contraste del label "Proyectos"** (quitar o reducir el `opacity-60`) para que no
  compita con el nombre del proyecto ni le reste jerarquía visual al conjunto.
- Alternativas consideradas: `ring-2 ring-primary/30` (descartada por redundar visualmente con el
  `border-l-4` ya existente); agregar un label "Proyecto activo" en mayúsculas (descartada como
  cambio adicional de contenido, fuera del alcance mínimo pedido — puede evaluarse en un cambio
  posterior si el glow por sí solo no resuelve la discoverability).

## Risks / Trade-offs

- [Riesgo] Un glow demasiado intenso puede sentirse ruidoso en vistas con mucho contenido activo
  (alertas, notificaciones) → Mitigación: reusar la intensidad ya calibrada de `.glow-primary` sin
  amplificarla, y validar visualmente en ambos temas antes de dar por cerrada la tarea.
- [Riesgo] Cambios de estilo únicamente en Tailwind/CSS no tienen cobertura de test automatizada
  → Mitigación: validación visual manual (capturas en claro/oscuro) como parte de `tasks.md`, sin
  bloquear en una suite de tests que no aplica a un cambio puramente visual.
