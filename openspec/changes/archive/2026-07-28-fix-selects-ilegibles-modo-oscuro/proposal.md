## Why

Reporte directo del usuario: "en los cuadros con selector, en el modo
oscuro, el fondo de ese cuadro es claro y la letra también y no se ve".
Ubicación confirmada con captura real de producción: Recursos Humanos →
Empleados → Deducciones → Expediente.

Investigación encontró dos causas independientes, ambas necesarias para
el arreglo completo:

1. El proyecto nunca declaraba `color-scheme` en CSS. Sin eso, el
   navegador pinta el control cerrado y el popup nativo de un `<select>`
   con su paleta clara por defecto, sin importar el tema de la app. Con
   `text-foreground` (claro en modo oscuro) heredado, el resultado es
   texto claro sobre fondo blanco nativo — ilegible.
2. Dos `<select>` de `PersonalView.tsx` ("Tipo de jornada" en el panel
   Config. Jornada, y "Tipo de documento" en Expediente dentro del panel
   Deducciones) resultaron ser los únicos de todo el proyecto sin
   `bg-*`/`text-foreground` propios — solo `border`. Con eso, ni
   `color-scheme` bastaba: sin fondo declarado, el control cerrado seguía
   saliendo con blanco nativo.

Verificado con captura real de producción en modo oscuro tras el primer
fix (`color-scheme`) que el control cerrado ya se veía bien pero el popup
de opciones seguía en gris claro — Chromium no propaga `color-scheme`
heredado al popup de un `<select>`, solo respeta el color/fondo puesto
explícitamente en cada `<option>`.

## What Changes

- `apps/app-shell/src/index.css`: `color-scheme: light` en `:root`,
  `color-scheme: dark` en `[data-theme="dark"]`.
- `apps/app-shell/src/views/PersonalView.tsx`: los dos `<select>` sin
  fondo propio reciben `bg-muted/30 text-foreground appearance-none`,
  igual que el resto de selects del proyecto.
- `apps/app-shell/src/index.css`: regla `[data-theme="dark"] option { ... }`
  forzando `background-color`/`color` desde `--popover`/`--popover-foreground`
  — necesaria porque el popup de `<option>` no hereda `color-scheme` de
  forma confiable en Chrome real (sí en Chromium headless, lo que hizo
  que la primera verificación diera falso positivo).

## Capabilities

### New Capabilities
- `tema-oscuro-controles-formulario`: requisitos de legibilidad de
  controles de formulario nativos (`<select>`) en modo oscuro — no existía
  spec previo para el theming de controles nativos del navegador.

### Modified Capabilities
(ninguna)

## Impact

- **Código**: `apps/app-shell/src/index.css`,
  `apps/app-shell/src/views/PersonalView.tsx`.
- **Tests**: sin tests nuevos — es un fix puramente visual/CSS, verificado
  por inspección de estilos computados en Chromium headless
  (`getComputedStyle`) y, para el popup de `<option>`, por confirmación
  visual directa del usuario en producción (limitación conocida: el popup
  nativo de `<select>` no se renderiza igual en Chromium headless que en
  Chrome real, así que no se pudo verificar por captura automatizada).
  `npx vitest run` completo (117 tests) se mantuvo en verde en cada paso.
- **Desplegado**: 3 commits mergeados a `main` y desplegados al VPS
  (`docker compose -f docker-compose.vps.yml build app-shell && up -d
  app-shell`) en la misma sesión, confirmados healthy y con el hash de
  bundle actualizado en cada paso.

## Non-Goals

No se auditó ni corrigió el resto de `<select>` del proyecto — todos los
demás ya declaraban `bg-*` propio (`bg-muted/50`, `bg-card`,
`bg-background`, etc.), confirmado por búsqueda exhaustiva antes de
cerrar el change. Tampoco se migró ningún `<select>` nativo a un
componente de listbox custom — se evaluó como alternativa más robusta
pero de mayor alcance (manejo de teclado, accesibilidad, estado de
apertura) frente al fix mínimo de CSS, que resolvió el reporte real.
