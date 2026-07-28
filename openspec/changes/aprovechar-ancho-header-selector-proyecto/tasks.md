## 1. Test primero (TDD)

- [x] 1.1 Agregar test en `Layout.tsx` que confirme que el texto "Sistema sincronizado" ya NO se
      renderiza en el header (rojo hoy, porque el badge todavía existe).
- [x] 1.2 Confirmar que los tests existentes (`Layout.selector-color-proyecto.test.tsx`,
      `Layout.nombre-proyecto-header.test.tsx`) no dependen del badge y siguen en verde tras el
      cambio.

## 2. Implementación

- [x] 2.1 Eliminar el bloque `<SectionBadge>...Sistema sincronizado</SectionBadge>` de `Layout.tsx`
      (líneas ~597-601) y quitar `SectionBadge` del import (queda sin uso en el archivo).
- [x] 2.2 Agregar `flex-1` a la cadena de contenedores del lado izquierdo del header (div raíz,
      div del breadcrumb, wrapper `relative` del botón) para que el espacio liberado se
      redistribuya hacia el selector.
- [x] 2.3 Reemplazar el `max-w-[180px] sm:max-w-[260px]` del botón colapsado por
      `max-w-full lg:max-w-[480px]`, manteniendo `truncate` como respaldo.

## 3. Verificación

- [x] 3.1 Correr la suite completa de `app-shell` — 40 archivos, 116 tests, todo en verde.
- [x] 3.2 Levantar `app-shell` localmente y verificar visualmente en navegador (desktop y mobile):
      el badge ya no aparece, el selector de proyecto usa el espacio libre, y el nombre se
      trunca correctamente en mobile sin superponerse a otros elementos.
