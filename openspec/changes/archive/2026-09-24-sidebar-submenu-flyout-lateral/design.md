## Context

`Layout.tsx` renderiza la navegación en `renderSidebarContent()`, compartida entre el sidebar fijo de escritorio (`aside` de `w-60`, `hidden md:flex`) y el drawer mobile (overlay `fixed inset-0 z-40 md:hidden`, `w-72 max-w-[85vw]`). Hoy el submenú de un módulo activo se renderiza siempre igual en ambos contextos: acordeón vertical debajo del botón (líneas ~396-431). El proyecto ya tiene un patrón de panel flotante con cierre por click-fuera/Escape (dropdown de proyecto, líneas ~223, 234-242, 573+), que se reutiliza como base.

## Goals / Non-Goals

**Goals:**
- El submenú de un módulo activo se despliega como panel lateral flotante en escritorio, sin desplazar el resto de los ítems del menú.
- El comportamiento de apertura/cierre (click, click-fuera, Escape) es consistente con el patrón ya usado por el dropdown de proyecto.

**Non-Goals:**
- No se rediseña el sidebar mobile — mantiene el acordeón vertical actual dentro del drawer.
- No se cambia qué módulos tienen subItems ni sus roles/permisos.
- No se introduce una librería de menús (Radix, Headless UI) — se mantiene el patrón actual de React state + Tailwind a mano, consistente con el resto del archivo.

## Decisions

- **Trigger por click, no hover**: mantiene la interacción actual (el módulo ya se activa con click) y evita complejidad de touch/mobile y timers de apertura/cierre. Alternativa considerada y descartada: hover con delay, más "moderno" pero inconsistente con el resto del sidebar y con peor accesibilidad.
- **Diferenciación por breakpoint, no por dos componentes separados**: el flyout se activa solo en el contexto de escritorio (`md:` y superior) usando clases responsive de Tailwind (`md:absolute md:left-full`, con fallback estático en mobile), evitando duplicar el bloque de renderizado de subItems en dos lugares del código.
- **Reutilizar el patrón de click-fuera/Escape existente**: en vez de una nueva librería o hook genérico, se replica el mismo `useEffect` con `document.addEventListener('mousedown', ...)` y `keydown` para Escape que ya usa el dropdown de proyecto, aplicado al estado de "submenú abierto" por módulo.

## Risks / Trade-offs

- [Riesgo] Un flyout `absolute left-full` puede desbordar el viewport si el usuario tiene la ventana muy angosta en modo escritorio (justo en el límite del breakpoint `md`) → Mitigación: usar `max-width` con overflow controlado o `clamp`, y verificar visualmente en el rango 768px-900px.
- [Riesgo] Con varios módulos con subItems, si dos flyouts pudieran quedar abiertos simultáneamente (uno por módulo activo) esto generaría UI confusa → Mitigación: solo el módulo actualmente activo (`currentView === item.id`) puede tener su flyout abierto, igual que hoy solo un módulo puede estar activo a la vez.
- [Trade-off] El acordeón vertical en mobile y el flyout en escritorio son comportamientos distintos para el mismo componente lógico → aceptado, ya que el layout base (ancho fijo del drawer) ya difiere entre ambos modos.

## Migration Plan

Cambio de frontend puro, sin migración de datos ni backend. Deploy estándar de `app-shell`; sin rollback especial más allá de revertir el commit si se detectan regresiones visuales.

## Open Questions

- ¿El flyout debe cerrarse automáticamente al navegar a un subItem, o permanecer abierto hasta que el usuario haga click fuera? (Recomendación: cerrarse al navegar, igual que el dropdown de proyecto cierra al seleccionar — confirmar con el usuario en la implementación si prefiere que quede abierto.)
