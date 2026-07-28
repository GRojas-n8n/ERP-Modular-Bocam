## 1. Diagnóstico

- [x] 1.1 Reproducir el reporte del usuario ("cuadros con selector...
      fondo claro, letra clara, no se ve") — ubicación ambigua al
      principio, se pidió y obtuvo una captura real de producción que
      confirmó Recursos Humanos → Empleados → Deducciones → Expediente.
- [x] 1.2 Descartar el selector de proyecto del header (dropdown custom,
      no `<select>` nativo) como causa — verificado por inspección de
      estilos computados en Chromium headless, background correcto
      (`rgb(25, 35, 52)`, coincide con `--card` oscuro).
- [x] 1.3 Encontrar la causa raíz #1: el proyecto nunca declaraba
      `color-scheme` en ningún lado (`grep` confirmó cero coincidencias).
- [x] 1.4 Encontrar la causa raíz #2, tras el primer fix: los dos
      `<select>` de `PersonalView.tsx` (Jornada, Expediente) eran los
      únicos de todo el proyecto sin `bg-*`/`text-foreground` propios
      (confirmado por búsqueda de todos los `<select>` del repo).
- [x] 1.5 Encontrar la causa raíz #3, tras el segundo fix (con captura
      real de producción del usuario): el popup de `<option>` seguía
      claro pese a `color-scheme: dark` ya heredado correctamente
      (confirmado con `getComputedStyle`) — limitación de Chrome real no
      reproducible en Chromium headless.

## 2. Implementación

- [x] 2.1 `apps/app-shell/src/index.css`: `color-scheme: light` en
      `:root`, `color-scheme: dark` en `[data-theme="dark"]`.
- [x] 2.2 `apps/app-shell/src/views/PersonalView.tsx`: `bg-muted/30
      text-foreground appearance-none` en el `<select>` de "Tipo de
      jornada" (línea ~1724) y en el `<select>` de "Tipo de documento"
      del Expediente (línea ~1920).
- [x] 2.3 `apps/app-shell/src/index.css`: regla
      `[data-theme="dark"] option { background-color: hsl(var(--popover));
      color: hsl(var(--popover-foreground)); }`.

## 3. Verificación

- [x] 3.1 `npx vitest run` tras cada uno de los 3 cambios — 41 archivos /
      117 tests en verde en cada paso (un fallo aislado en una corrida
      resultó no reproducible al repetir la suite completa).
- [x] 3.2 Verificación visual en Chromium headless (vía driver Playwright
      del skill `run-app-shell`, con un comando `eval` agregado ad-hoc
      para leer `getComputedStyle`) del selector de proyecto, del control
      cerrado de "Tipo de documento", y de los `<option>` — confirmó cada
      fix a nivel de estilos computados.
- [x] 3.3 Verificación visual real del usuario en producción, dos rondas:
      primera ronda (solo `color-scheme`) — usuario reportó que seguía
      igual, con captura que ubicó el problema exacto; segunda ronda
      (los 3 fixes aplicados) — usuario confirmó "ya lo revisé, ahora sí
      se ve bien".

## 4. Cierre

- [x] 4.1 3 commits, cada uno en su propio PR contra `main`, mergeados en
      la sesión: PR #92 (`color-scheme`, commit `462ce4d`), PR #93
      (selects sin fondo, commit `0d5a395`), PR #94 (estilos de `option`,
      commit `7bcb465`).
- [x] 4.2 Desplegado al VPS tras cada merge (`git pull` + `docker compose
      -f docker-compose.vps.yml build app-shell && up -d app-shell`),
      contenedor `bocam-vps-app-shell` verificado healthy y con hash de
      bundle actualizado en cada uno de los 3 despliegues.
- [x] 4.3 Spec creado retroactivamente (este change) porque el fix se
      hizo reactivamente a partir de un reporte de bug, sin seguir el
      ciclo spec-primero de `CLAUDE.md` — documentado siguiendo el mismo
      patrón que otros changes retroactivos ya archivados en este repo
      (ej. `2026-07-27-fix-auth-callbacks-sat-contabilidad`).
