## Context

`Layout.tsx` renderiza el selector de proyecto activo en el header de `app-shell`. El botón
colapsado (líneas ~519-539) hoy solo muestra `currentProject?.code`. El dropdown (líneas ~542-584)
ya muestra `project.name` y `project.code` por cada fila, pero eso solo es visible cuando el
usuario abre el menú. El tipo `Project` consumido por `user.projects` ya expone `name` y `code`
(usado en el dropdown), así que no hace falta tocar `TenantContext.tsx` ni el backend.

## Goals / Non-Goals

**Goals:**
- El nombre del proyecto activo debe ser legible en el botón colapsado sin abrir el dropdown.
- Mantener el indicador de color determinístico por proyecto ya existente (borde, dot, bg suave).
- No romper el layout del header en pantallas angostas (el header ya usa `truncate` y `max-w`
  en varios elementos hermanos).

**Non-Goals:**
- No se rediseña el dropdown (ya cumple el requisito de mostrar nombre + código).
- No se cambia el mecanismo de cambio de proyecto ni el JWT de scope.
- No se agrega persistencia ni preferencia de usuario sobre qué mostrar.

## Decisions

- **Mostrar nombre como texto principal, código como secundario**: en vez de reemplazar `code`
  por `name` sin más, se muestra `currentProject?.name` como texto principal y se conserva el
  `code` en tamaño menor (p. ej. `text-[9px] uppercase opacity-70`, mismo patrón tipográfico que
  ya usa el dropdown para el código). Alternativa descartada: mostrar solo el nombre y eliminar el
  código — se descarta porque varias partes de la UI (breadcrumbs, confirmaciones) siguen
  refiriéndose al proyecto por código corto y perderlo del header quita una referencia rápida ya
  aprendida por los usuarios.
- **Ajustar `max-w-[180px]` del botón colapsado**: el ancho fijo actual fue calibrado para un
  código corto (3-6 caracteres). Se amplía moderadamente (p. ej. `max-w-[220px]` a
  `max-w-[260px]` según breakpoint) y se apoya en `truncate` ya presente para nombres largos, en
  vez de introducir un tooltip nuevo — mantiene el patrón visual existente del componente.
- **Sin cambios en `TenantContext.tsx`**: `name` ya viaja en el objeto `Project` (se confirma
  porque el dropdown ya lo consume en la línea ~570); no hace falta ampliar el contrato de datos.

## Risks / Trade-offs

- [Nombres de proyecto muy largos podrían truncarse en pantallas angostas] → Mitigación: se
  reutiliza `truncate` + `max-w` ya usado en el resto del header; el código corto queda como
  respaldo visual si el nombre se corta.
- [Ensanchar el botón podría empujar otros elementos del breadcrumb en `sm`/`md`] → Mitigación:
  verificar visualmente en mobile y desktop (el header ya usa `min-w-0` y `shrink-0` en los
  elementos hermanos para absorber este tipo de cambios); ajustar breakpoints si se detecta
  desbordamiento durante QA manual.
