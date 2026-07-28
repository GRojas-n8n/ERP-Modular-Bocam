## Context

El botón del selector de proyecto (`Layout.tsx`, ~línea 525) ya vive dentro de una cadena de
contenedores `flex-1` (agregada en el change anterior) que le permite crecer con el espacio
liberado por el badge eliminado. Lo único que lo detiene antes de llegar al límite real del
header es su propio `max-w-full lg:max-w-[480px]`.

## Goals / Non-Goals

**Goals:**
- El selector debe poder ocupar todo el espacio horizontal disponible entre el breadcrumb y el
  grupo de íconos (tema/settings) de la derecha, en cualquier ancho de pantalla ≥ `lg`.
- Mantener un aspecto minimalista: sin agregar bordes, sombras ni elementos nuevos — solo dejar
  que el elemento ya existente use el espacio ya libre.

**Non-Goals:**
- No se rediseña el header ni se cambia el orden de los íconos de la derecha.
- No se agrega un límite superior distinto para monitores ultra anchos — se confía en `truncate`
  para nombres largos y en que el header ya tiene padding lateral (`px-4 md:px-6`) razonable.

## Decisions

- **Quitar `lg:max-w-[480px]`, dejar solo `max-w-full`**: dado que el botón ya es hijo de una
  cadena `flex-1 min-w-0`, `max-w-full` es suficiente para que ocupe exactamente el espacio que
  el flexbox le asigna (que ya está acotado por los hermanos `shrink-0` del header) — no hace
  falta un valor en píxeles fijo. Alternativa descartada: subir el tope a un valor fijo mayor
  (ej. `lg:max-w-[700px]`) — se descarta porque seguiría siendo arbitrario y no se adapta a
  distintos anchos de pantalla ni a la presencia/ausencia futura de otros elementos del header.

## Risks / Trade-offs

- [En monitores muy anchos el botón podría verse desproporcionado] → Mitigación: el `flex-1` de
  sus ancestros ya lo acota al espacio real disponible junto al resto del header (no crece sin
  límite); verificar visualmente en un viewport ancho (≥1600px) durante QA.
