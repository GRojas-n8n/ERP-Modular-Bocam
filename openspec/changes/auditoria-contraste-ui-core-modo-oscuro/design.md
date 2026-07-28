## Context

`packages/ui-core/src/primitives.tsx:22` define su propio `cn()`:

```ts
export function cn(...values: unknown[]): string {
  return values.map(toClassName).filter(Boolean).join(' ');
}
```

Es una concatenación de strings sin resolver conflictos — dos clases de Tailwind que
tocan la misma propiedad (ej. `bg-primary` de la variante base y `bg-emerald-500` pasado
por props) terminan ambas en el `className` final, y cuál gana lo decide el orden en que
Tailwind las declaró en el CSS generado, no el orden en el string ni la intención de quien
llamó al componente. Esto ya causó tres bugs idénticos corregidos por separado (Button,
badge "Sistema Sincronizado", selects de Jornada/Expediente).

Dato clave encontrado durante la investigación: `apps/app-shell/src/lib/utils.ts` **ya
tiene la solución correcta**, usada en varios componentes de `app-shell` (ej.
`SlidePanel.tsx`):

```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

`tailwind-merge@^3.5.0` y `clsx` ya están en el lockfile raíz (dependencias de
`app-shell`), así que adoptar el mismo patrón en `ui-core` no introduce una librería nueva
al monorepo — solo la declara también como dependencia directa de `packages/ui-core`.

## Goals / Non-Goals

**Goals:**
- `cn()` de `ui-core` resuelve conflictos de clases Tailwind por especificidad semántica
  (la última clase de un mismo grupo/propiedad gana), igual que ya hace `cn()` de
  `app-shell`.
- Todo componente exportado de `ui-core` es legible (contraste suficiente) en tema claro y
  oscuro, verificado visualmente uno por uno.
- El caso ya encontrado (`text-slate-900` hardcodeado en el título de `SideSheet`,
  `primitives.tsx:328`) queda corregido como parte de esta misma pasada.

**Non-Goals:**
- No se unifica `ui-core` y `app-shell` en una sola implementación de `cn()` compartida —
  son paquetes distintos con historiales de build independientes; cada uno mantiene su
  propia copia del mismo patrón. Unificarlas es una refactorización aparte, sin bug que la
  motive hoy.
- No se auditan usos de componentes de `ui-core` dentro de vistas de `apps/*` más allá de
  confirmar que las 3 correcciones puntuales previas siguen funcionando — si la auditoría
  encuentra un caso adicional específico de una vista (no del componente en sí), se
  documenta pero se corrige en un change aparte con su propio spec, según regla de
  CLAUDE.md de no tocar legacy sin spec dedicado.
- No se toca `tema-oscuro-controles-formulario` (controles nativos de formulario /
  `color-scheme`) — mecanismo distinto, ya resuelto.

## Decisions

**D1 — Adoptar `clsx` + `tailwind-merge` en `cn()` de `ui-core`, mismo patrón que
`app-shell`.**
Alternativas consideradas:
- *Reescribir `cn()` a mano con lógica de "última clase del mismo prefijo gana"*: reinventa
  lo que `tailwind-merge` ya resuelve correctamente (incluye conocimiento de qué prefijos de
  Tailwind son mutuamente excluyentes, variantes responsive/dark, arbitrary values). Más
  superficie de bugs nuevos.
- *Forzar `!important` en las clases base de cada componente*: es el patrón de parche que
  ya se usó puntualmente y es exactamente lo que se quiere dejar de hacer — invierte el
  problema (ahora el consumidor no puede nunca overridear ni con justificación real) y no
  escala a componentes nuevos.
- *Mover `ui-core` a depender de `app-shell`*: no aplica, `app-shell` es un consumidor de
  `ui-core`, no al revés; crear la dependencia inversa rompe la arquitectura de paquetes.

Se elige adoptar el patrón ya probado en producción dentro del mismo monorepo, con la
misma versión de `tailwind-merge` ya presente en el lockfile.

**D2 — La auditoría se hace componente por componente, en una tabla de hallazgos dentro de
`tasks.md`, no como código de test automatizado.**
Contraste de color es un juicio visual (¿se lee o no se lee?) que un snapshot test no
captura sin herramientas de accesibilidad (axe, contraste WCAG) que el proyecto no tiene
instaladas hoy. Se documenta cada hallazgo con archivo:línea y se corrige inline. Instalar
tooling de accesibilidad automatizado es una mejora aparte, no bloquea este change.

**D3 — Los componentes de `packages/ui-core/src/dashboard/index.tsx` se auditan en la misma
pasada, no en un change separado.**
Comparten el mismo `cn()` y el mismo riesgo de contraste; separarlos solo fragmentaría la
auditoría sin reducir el trabajo real.

**D5 — Hallazgo durante la implementación: `apps/app-shell` no escaneaba
`packages/ui-core/src` para generar CSS de Tailwind, lo cual enmascaraba el bug real de
`text-slate-900`.**
`apps/app-shell/tailwind.config.js` es un config legacy de Tailwind v3 (`content: [...]`)
que Tailwind v4 (`@tailwindcss/postcss`, sin directiva `@config` en `index.css`) **no lee en
absoluto** — v4 usa detección automática de contenido a partir del directorio base del
proceso PostCSS, que para este proyecto es `apps/app-shell/`, no la raíz del monorepo.
Se verificó empíricamente (capturando el CSS servido por Vite): `.text-slate-900` **no
existía en ningún lado del bundle compilado** antes de este fix — cualquier clase de
Tailwind usada solo dentro de `packages/ui-core/src` y no duplicada textualmente en algún
archivo de `apps/app-shell/src` se descartaba en silencio. Esto explica por qué el título de
`SideSheet` "se veía bien" en ambos temas antes de esta auditoría: al no existir la regla
`.text-slate-900`, el elemento heredaba `text-foreground` del `body` (correcto por
casualidad), enmascarando que la clase pretendida nunca se aplicaba. Fix: agregar
`@source "../../../packages/ui-core/src";` justo después de `@import "tailwindcss";` en
`apps/app-shell/src/index.css`, que le dice a Tailwind v4 explícitamente que escanee ese
directorio adicional. Verificado: el CSS generado creció ~7KB y `.text-slate-900` (y
presumiblemente otras clases únicas de `ui-core` no auditadas aún) empezaron a compilarse;
tras el fix, el título de `SideSheet` sí mostraba el color casi-negro incorrecto en modo
oscuro, confirmando el bug original — corregido a `text-foreground` en la misma pasada.
Este hallazgo es más fundamental que D1: sin este `@source`, cualquier clase nueva agregada
a `ui-core` en el futuro (incluidas las correcciones de esta misma auditoría) podría no
compilarse nunca, sin ningún error visible — solo un fallback silencioso a lo que sea que el
elemento herede.

## Risks / Trade-offs

- [Adoptar `tailwind-merge` puede cambiar el `className` final de componentes que hoy
  "casualmente" se ven bien porque el bug de orden favorece la clase correcta] → Mitigación:
  la auditoría visual cubre los 3 casos ya conocidos como corregidos explícitamente y
  recorre el resto de componentes; cualquier regresión visual se detecta en la misma pasada,
  antes de mergear.
- [`tailwind-merge` necesita conocer los prefijos/tokens de la config de Tailwind de cada
  consumidor para resolver conflictos correctamente en casos con clases custom (ej. clases
  de color por proyecto en `project-color.ts`)] → Mitigación: `tailwind-merge` sin
  configuración extendida ya maneja correctamente utilidades estándar (`bg-*`, `text-*`,
  `border-*`); solo se extiende su config si la auditoría encuentra un caso real que lo
  requiera.
- [`ui-core` se compila una sola vez y lo consumen varios `apps/*`; un error en `cn()`
  afectaría a todos los módulos a la vez] → Mitigación: es exactamente el motivo de hacer
  esto en `ui-core` (raíz) en vez de parchear cada consumidor — el radio de impacto de un
  bug futuro baja porque hay una sola implementación, no N copias divergentes.

## Migration Plan

1. Agregar `clsx` y `tailwind-merge@^3.5.0` a `packages/ui-core/package.json`.
2. Reemplazar el cuerpo de `cn()` en `primitives.tsx` por `twMerge(clsx(...values))`,
   manteniendo la firma pública `cn(...values: unknown[]): string` para no romper a los
   consumidores (`clsx` acepta el mismo rango de tipos que `toClassName` ya soportaba:
   strings, arrays, objetos con claves booleanas).
3. Recorrer visualmente cada componente exportado (lista completa en el proposal), en claro
   y oscuro, usando el flujo real de la app (no Storybook — el proyecto no lo tiene).
4. Corregir cada hallazgo en `ui-core` directamente (incluye el `text-slate-900` de
   `SideSheet` ya encontrado).
5. Verificar explícitamente que Button, badge "Sistema Sincronizado" y selects de
   Jornada/Expediente se siguen viendo correctos tras el cambio de `cn()` (regresión, no
   deben re-romperse).
6. Sin plan de rollback especial — es un paquete interno sin usuarios externos; revertir el
   commit de `cn()` basta si algo se ve mal en QA.

## Open Questions

- ¿El proyecto quiere adoptar accesibilidad automatizada (axe-core o similar) como parte de
  CI para prevenir regresiones futuras de contraste sin depender de QA visual manual? Fuera
  de alcance de este change; queda como sugerencia para uno futuro si el patrón se repite
  una cuarta vez.
