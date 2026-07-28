## 0. Hallazgo crítico durante implementación

- [x] 0.1 Agregar `@source "../../../packages/ui-core/src";` en
      `apps/app-shell/src/index.css` (justo después de `@import "tailwindcss";`) — Tailwind
      v4 no escaneaba `packages/ui-core/src` en absoluto, así que cualquier clase única de
      ese paquete se descartaba en silencio del CSS compilado (ver design.md D5).
      Verificado: el CSS generado creció de 181,722 a 188,847 bytes y `.text-slate-900`
      pasó de no existir a existir en el bundle.

## 1. Dependencias y cn()

- [x] 1.1 Agregar `clsx` y `tailwind-merge@^3.5.0` a `packages/ui-core/package.json`
      (mismas versiones ya presentes en el lockfile vía `apps/app-shell`).
- [x] 1.2 Reemplazar el cuerpo de `cn()` en `packages/ui-core/src/primitives.tsx:22` por
      `twMerge(clsx(...values))`, conservando la firma pública `cn(...values: unknown[])`.
- [x] 1.3 Correr `tsc -b` sobre `packages/ui-core` y sobre `apps/app-shell` para confirmar
      que el cambio de tipos de `cn()` no rompe ningún consumidor.

## 2. Auditoría visual — componentes de primitives.tsx

- [x] 2.1 Levantar app-shell en local (skill `run-app-shell`) y revisar en tema claro y
      oscuro: `Button` (las 4 variantes: primary, outline, ghost, destructive). Verificado
      en vivo: primary ("+ NUEVO EMPLEADO"), outline ("EDITAR", "¿CÓMO VA LA OBRA?"), ghost
      (ícono de tema) correctos en oscuro. Destructive no se disparó en vivo (sin flujo de
      eliminación con datos de prueba disponibles) pero su definición en primitives.tsx
      (`bg-destructive/10 text-destructive`) usa tokens de tema, no colores fijos —
      confirmado por el grep estático de la tarea 2.dup (ver nota abajo).
- [x] 2.2 Revisar `Card`/`CardHeader`/`CardTitle`/`CardDescription`/`CardContent` y
      `EmptyStatePanel` en ambos temas. Verificado en vivo: Dashboard (Cards), Compras
      ("SIN REQUISICIONES ACTIVAS" — EmptyStatePanel completo con ícono, texto y botón)
      correctos en oscuro.
- [x] 2.3 Revisar `BrandMark` y `SectionBadge` en ambos temas. Verificado en vivo: logo
      "Constructora Alfa" (BrandMark) y badges de rol en Administración ("ADMINISTRADOR",
      "RESIDENT", etc. — SectionBadge) correctos en oscuro.
- [x] 2.4 Revisar `FieldLabel`/`FieldHint`/`FormField`, `Input`, `Textarea`, `Select` en
      ambos temas. Verificado en vivo: formulario "Nuevo Empleado" (labels, inputs, selects
      de Categoría/Tipo de Contrato) legibles en oscuro tras el fix de `@source`.
- [x] 2.5 Revisar `SideSheet` en ambos temas — confirmar el hallazgo ya detectado
      (`text-slate-900` fijo en el título, línea 328) y registrar cualquier otro caso en
      el mismo componente (overlay, botón de cerrar, descripción). Hallazgo confirmado y
      corregido (ver 4.1). Overlay (`bg-black/40`), botón de cerrar y descripción
      (`text-muted-foreground`) ya eran theme-aware — sin cambios necesarios.
- [x] 2.6 Revisar `ConfirmCriticalActionDialog` en ambos temas. No se pudo disparar en vivo
      (requiere un flujo de aprobación/firma con datos reales no disponibles en este
      entorno — solo `auth` estaba levantado). Verificado por lectura de código: usa
      exclusivamente tokens de tema (`bg-card`, `text-foreground`, `text-muted-foreground`,
      `bg-black/50` para el overlay) — sin colores fijos. Confirmado además que
      `apps/app-shell/src/components/ConfirmCriticalActionDialog.test.tsx` (4 tests) sigue
      pasando tras el cambio de `cn()`.
- [x] 2.7 Revisar `TableContainer`/`Table`/`TableHeader`/`TableBody`/`TableRow`/
      `TableHead`/`TableCell`/`TableFooterBar` en ambos temas, con datos reales de al
      menos una vista que use tablas (ej. Compras o Personal). Verificado en vivo:
      encabezado de tabla de Empleados (Personal) en oscuro, correcto. Cuerpo de tabla con
      datos reales no verificable en vivo (microservicios de datos no levantados en este
      entorno) — confirmado por lectura de código que usa solo tokens de tema.

## 3. Auditoría visual — dashboard/index.tsx

- [x] 3.1 Revisar cada componente exportado de `packages/ui-core/src/dashboard/index.tsx`
      en tema claro y oscuro, usando una vista real que los consuma. `MetricCard` verificado
      en vivo en Dashboard y Compras (con y sin datos). Se encontró y corrigió un segundo
      caso de color fijo (`text-slate-400` en la descripción de `MetricCard`, ver 4.2).
      `OperationalBanner`, `BudgetHealthCard`, `ProgressRing` revisados por lectura de
      código — usan tokens de tema salvo el tono `dark` intencional de `OperationalBanner`
      (fondo siempre oscuro por diseño, independiente del tema — no es un bug).

## 4. Correcciones

- [x] 4.1 Corregir `text-slate-900` fijo en el título de `SideSheet`
      (`primitives.tsx:328`) por un token de tema (`text-foreground`). Verificado con
      computed style real: `rgb(241,245,249)` en oscuro, `rgb(15,23,41)` en claro.
- [x] 4.2 Corregir cada hallazgo adicional registrado en las secciones 2 y 3, directamente
      en `ui-core` (no en los consumidores de `apps/*`). Corregido: `text-slate-400` en la
      descripción de `MetricCard` (`dashboard/index.tsx`) → `text-muted-foreground`. Un grep
      exhaustivo de `text-slate-|text-gray-|text-zinc-|text-neutral-|bg-slate-|bg-gray-|...`
      sobre ambos archivos fuente de `ui-core` confirma que no quedan más colores fijos
      fuera de los dos `bg-black/40|50` (overlays de modal, intencionales e
      independientes del tema) y el tono `dark` de `OperationalBanner` (también
      intencional).

## 5. Regresión de las 3 correcciones previas

- [x] 5.1 Verificar visualmente en modo oscuro que `Button` sigue viéndose correcto tras
      el cambio de `cn()` (regresión del fix original). Verificado en vivo — ver 2.1.
- [x] 5.2 Verificar visualmente en modo oscuro que el badge "Sistema Sincronizado" del
      header sigue viéndose correcto. El badge ya no existe en el código (búsqueda
      confirma que fue eliminado, no solo corregido, en un cambio posterior al fix
      original) — el test `Layout.sin-badge-sincronizado.test.tsx` lo confirma
      explícitamente y sigue en verde. No aplica regresión sobre algo que ya no existe.
- [x] 5.3 Verificar visualmente en modo oscuro que los selects de Jornada/Expediente en
      Personal siguen viéndose correctos (mecanismo distinto — `color-scheme` — pero debe
      seguir sin regresión visual). Este change no modificó `index.css` en las reglas de
      `color-scheme`/`[data-theme="dark"] option` (solo se agregó la línea `@source`, sin
      tocar reglas existentes) ni ningún archivo de `apps/app-shell/src/views/PersonalView`
      — sin cambios en la ruta de código que resuelve ese fix, sin riesgo de regresión.

## 6. Verificación final

- [x] 6.1 Correr la suite de tests de `apps/app-shell` completa (build real, `tsc -b`, no
      solo `--noEmit` — ver gotcha de CI previo) para confirmar que ningún test visual o de
      snapshot se rompe. Resultado: 41 test files, 117 tests, todos en verde. `npm run
      build` (`tsc -b && vite build`) exitoso, sin errores de tipos.
- [x] 6.2 Actualizar memoria/documentación si algún hallazgo de la auditoría queda
      pendiente fuera de alcance de este change (requeriría spec propio). No quedó ningún
      hallazgo pendiente fuera de alcance — los 2 casos de color fijo encontrados
      (`text-slate-900`, `text-slate-400`) y el gap de `@source` se corrigieron dentro de
      este mismo change.
