## Context

El sidebar (`apps/app-shell/src/components/Layout.tsx`) define `ALL_NAV_ITEMS`: una lista de grupos de módulo, cada uno con `roles` permitidos y una lista opcional de `subItems`. Hoy "Proyectos" es un subItem único dentro del grupo "Administración" (roles `admin`, `gerencia_tecnica`, `control_proyectos`) y navega internamente a `AdminView` con `sub='proyectos'`. El grupo "Gerencia Técnica" y el grupo "Control de Obra" no tienen ese subItem. El rol `control_obra` no está en los roles permitidos de "Proyectos" en ningún lado.

## Goals / Non-Goals

**Goals:**
- Que un usuario de Gerencia Técnica o Control de Obra pueda llegar a la pantalla de Proyectos sin salir de su contexto de navegación (un click desde su propio grupo de menú).
- Que el rol `control_obra` tenga visibilidad de "Proyectos".
- Reutilizar `AdminView.tsx` y el endpoint existente sin duplicar código ni datos.

**Non-Goals:**
- No se crea una vista de Proyectos independiente por módulo.
- No se proyecta el catálogo de Proyectos hacia `gerencia-tecnica` ni otros microservicios vía RabbitMQ — sigue siendo propiedad exclusiva de `auth`.
- No se cambia el modelo de permisos general, solo se extiende la lista de roles de este ítem puntual.

## Decisions

- **Reutilizar la misma vista via navegación cross-grupo, en vez de duplicar el componente**: se agregan subItems "Proyectos" en los grupos "Gerencia Técnica" y "Control de Obra" que, al hacer click, navegan a `view='admin', sub='proyectos'` (la misma ruta que usa el subItem de Administración). Alternativa descartada: extraer un `ProyectosPanel.tsx` compartido montado en 3 vistas distintas — más código para el mismo resultado visible, sin beneficio funcional ya que la fuente de datos es una sola.
- **El resaltado de "sección activa" en el sidebar debe reflejar `admin` como view activo** aunque el click haya partido desde el grupo "Gerencia Técnica" o "Control de Obra" — evita un estado de menú inconsistente (dos grupos marcados como activos). Esto ya es el comportamiento implícito del sidebar (resalta por `currentView`), pero debe verificarse explícitamente con un test ya que es la primera vez que un subItem "salta" de grupo.
- **Extender roles del subItem de Administración y agregar `control_obra`** en los tres subItems (Administración, Gerencia Técnica, Control de Obra) para que el acceso sea consistente sin importar desde qué grupo entra el usuario.

## Risks / Trade-offs

- [Riesgo] Un usuario podría confundirse si hace click en "Proyectos" desde "Control de Obra" y termina viendo el sidebar resaltando "Administración" → Mitigación: verificar con test de UI que el subItem clickeado se marca como activo dentro de su propio grupo visualmente, o aceptar explícitamente (documentado) que el resaltado sigue al `view` real (`admin`) por simplicidad, y comunicarlo en el PR.
- [Riesgo] Extender roles de `control_obra` sobre la pantalla de Proyectos podría exponer acciones de alta/edición que hoy son exclusivas de `admin` → Mitigación: confirmar en `AdminView.tsx` que las acciones de escritura (alta/edición de proyecto) ya están protegidas por rol `admin` a nivel de UI y de API, no solo por visibilidad del menú; si no lo están, este change debe agregar esa protección antes de dar acceso de lectura amplio.

## Migration Plan

Cambio de solo frontend, sin migración de datos. Deploy estándar de `app-shell`. Sin rollback especial más allá de revertir el commit.
