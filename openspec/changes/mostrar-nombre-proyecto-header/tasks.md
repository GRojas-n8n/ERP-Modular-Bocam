## 1. Test primero (TDD)

- [x] 1.1 Agregar test en `apps/app-shell/src/components/Layout.tsx` (nuevo archivo
      `Layout.nombre-proyecto-header.test.tsx`) que falla en rojo hoy: renderiza `Layout` con un
      proyecto activo cuyo `name` y `code` difieren (ej. `name: 'Torre Corporativa Norte'`,
      `code: 'TCN-2024'`) y verifica que `getByText('Torre Corporativa Norte')` existe dentro del
      botón colapsado del selector, SIN hacer click para abrir el dropdown.
- [x] 1.2 Verificar que el test existente `Layout.selector-color-proyecto.test.tsx` (que busca
      `getByText('TCN-2024')` en el botón colapsado) sigue definido y correrlo para confirmar el
      estado rojo/verde antes de tocar código de producción.

## 2. Implementación

- [x] 2.1 En `Layout.tsx` (botón colapsado del selector, líneas ~519-539), reemplazar el
      `<span>` único que muestra `currentProject?.code` por dos líneas: nombre del proyecto como
      texto principal (`currentProject?.name || 'Sin Proyecto'`) y código como texto secundario
      pequeño debajo, ambos con `truncate`.
- [x] 2.2 Ajustar el `max-w` del botón colapsado (actualmente `max-w-[180px]`) para acomodar
      nombres de proyecto más largos sin romper el layout del header en mobile/desktop.
- [x] 2.3 Confirmar que el color determinístico (`border`, `bgSoft`, `dot`) y el ícono de
      chevron del dropdown no cambian de comportamiento.

## 3. Verificación

- [x] 3.1 Correr `Layout.selector-color-proyecto.test.tsx` y el nuevo test — ambos en verde.
- [x] 3.2 Correr la suite completa de `app-shell` (`npm test` o equivalente) para descartar
      regresiones en otros tests que dependan del texto del selector de proyecto. (39 archivos,
      115 tests, todos en verde)
- [x] 3.3 Levantar `app-shell` localmente (skill `run-app-shell`) y verificar visualmente en
      navegador: el nombre del proyecto activo se ve en el header sin abrir el dropdown, en
      desktop y en una ventana angosta (mobile). Se encontró y corrigió un bug propio de la
      implementación inicial: `items-start` en el wrapper impedía que `truncate` funcionara,
      causando desborde de texto en mobile — corregido reemplazando por `flex-1` + `w-full` en
      los spans internos. Se detectó además un bug preexistente y no relacionado (el badge
      "Sistema Sincronizado" no respeta su clase `hidden` por el mismo problema de `cn()` sin
      `tailwind-merge` ya documentado para `Button`); queda fuera de alcance de este change y se
      reporta aparte.
