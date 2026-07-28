## Why

El mismo bug de contraste en modo oscuro se ha corregido tres veces como parche puntual
(`Button` de `ui-core`, badge "Sistema Sincronizado" del header, selects de Jornada/Expediente
en Personal): `cn()` en `packages/ui-core/src/primitives.tsx:22` concatena clases con
`Array.filter(Boolean).join(' ')` sin `tailwind-merge`, así que cuando una vista pasa una
`className` de color por props con igual o mayor especificidad que la clase base del
componente, el orden de aparición en el DOM (no la intención del prop) decide cuál gana —
en Tailwind, clases idénticas en especificidad se resuelven por orden de declaración en la
hoja generada, no por orden en el string de `className`. Corregir cada aparición según se
reporta deja intacta la causa raíz: cualquier componente de `ui-core` no auditado aún puede
tener el mismo problema, y cada corrección puntual es indistinguible de una coincidencia. Se
necesita una única pasada de auditoría sobre todo `ui-core`, en claro y oscuro, más una
decisión de raíz sobre `cn()` para que el problema deje de reaparecer.

## What Changes

- Adoptar `tailwind-merge` (u otro mecanismo equivalente que la fase de diseño determine) en
  `cn()` (`packages/ui-core/src/primitives.tsx:22`), de forma que una `className` pasada por
  props con clases de color/fondo/texto siempre gane sobre las clases base del componente,
  sin depender de `!important` puntual.
- Auditar visualmente, en tema claro y oscuro, cada componente exportado de `ui-core`
  (`Button`, `Card`/`CardHeader`/`CardTitle`/`CardDescription`/`CardContent`, `EmptyStatePanel`,
  `BrandMark`, `SectionBadge`, `FieldLabel`/`FieldHint`/`FormField`, `Input`/`Textarea`/`Select`,
  `SideSheet`, `ConfirmCriticalActionDialog`, `TableContainer`/`Table`/`TableHeader`/`TableBody`/
  `TableRow`/`TableHead`/`TableCell`/`TableFooterBar`, y los componentes de
  `packages/ui-core/src/dashboard/index.tsx`) y registrar cada caso de contraste insuficiente o
  color hardcodeado que no responda al tema (ya se detectó al menos uno adicional durante la
  investigación: `text-slate-900` fijo en el título de `SideSheet`,
  `packages/ui-core/src/primitives.tsx:328`, ilegible en fondo oscuro).
- Corregir cada caso encontrado por la auditoría en el propio `ui-core` (no en los consumidores
  en `apps/*`), para que la corrección no pueda volver a perderse como parche local.
- **NO** se auditan usos de `ui-core` en vistas específicas de `apps/*` más allá de verificar
  que las tres correcciones puntuales previas (Button, badge, selects) sigan resolviéndose desde
  `ui-core` y no reintroduzcan un parche local — el spec `tema-oscuro-controles-formulario`
  (controles nativos de formulario / `color-scheme`) ya cubre selects nativos y no cambia con
  este change.

## Capabilities

### New Capabilities
- `contraste-modo-oscuro-ui-core`: todo componente exportado por `ui-core` SHALL mantener
  contraste legible de texto/fondo tanto en tema claro como oscuro, y `cn()` SHALL resolver
  conflictos de clases Tailwind por especificidad semántica (última clase de un mismo grupo
  gana), no por orden de concatenación de strings.

### Modified Capabilities
(ninguna — `tema-oscuro-controles-formulario` cubre un mecanismo distinto, controles nativos
del navegador vía `color-scheme`, y no cambia de comportamiento con este change)

## Impact

- **Afectado:** `packages/ui-core/src/primitives.tsx` (función `cn()` y los ~20 componentes que
  la usan), `packages/ui-core/src/dashboard/index.tsx`, `packages/ui-core/package.json` (nueva
  dependencia `tailwind-merge` si la fase de diseño la confirma).
- **No afectado:** ningún endpoint de backend; vistas de `apps/*` solo si la auditoría encuentra
  que alguna pasó una `className` que dependía del bug de especificidad para verse "bien" por
  accidente (caso borde a verificar, no se espera).
- **Dependencias:** posible nueva dependencia `tailwind-merge` en `packages/ui-core`; sin cambios
  de build fuera de ese paquete.
