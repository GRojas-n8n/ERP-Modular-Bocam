## Why

La verificación autenticada posterior a la purga del 2026-09-24 confirmó que el
usuario no tiene proyectos accesibles y que Administración muestra
`SIN PROYECTOS REGISTRADOS`. Sin embargo, Gerencia Técnica → Catálogo de Obra
mostró 72 conceptos y un presupuesto en estado `BORRADOR` mientras el encabezado
indicaba `Sin Proyecto`.

La causa está confirmada en el código desplegado:

- `requireProjectAccess()` permite continuar inmediatamente a los roles de nivel
  tenant, incluido `admin`, aunque `securityContext.proyectoId` esté vacío.
- `GET /api/v1/gerencia-tecnica/presupuestos` construye un filtro vacío cuando no
  hay `proyectoId`, lo que convierte una consulta propia de proyecto en un listado
  de todos los presupuestos visibles del tenant.
- `InsumosView.fetchPresupuesto()` ejecuta esa consulta aun cuando
  `currentProjectId` es `null` y no limpia el presupuesto previamente cargado.

El problema no es solo visual: una cuenta administrativa puede leer datos
operativos sin un contexto de proyecto válido. Además, la pantalla conserva
acciones de escritura como importar o aprobar presupuesto, aunque esta revisión
no las ejecutó. El hallazgo bloquea el cierre de la purga y debe resolverse como
un cambio de seguridad y aislamiento antes de considerar sana la operación.

## What Changes

- Definir explícitamente qué rutas son de alcance de proyecto y exigir en ellas
  un `proyectoId` no vacío incluso para roles de nivel tenant.
- Conservar el modo global únicamente en capacidades documentadas como
  tenant-level; ser `admin` no convierte automáticamente una ruta de proyecto en
  una consulta global.
- Hacer que los endpoints de Gerencia Técnica rechacen la ausencia de proyecto
  activo con un error estable y nunca sustituyan el filtro por `{}`.
- Impedir que las vistas de proyecto hagan peticiones cuando no existe un
  proyecto activo, limpiar cualquier estado anterior y mostrar una pantalla de
  selección/ausencia de proyecto sin acciones de escritura.
- Auditar los demás módulos y endpoints para localizar el mismo patrón
  `if (proyectoId) where...` o equivalentes que amplíen el alcance al faltar el
  contexto.
- Agregar pruebas de regresión de frontend, middleware, API y aislamiento entre
  proyectos antes de implementar la corrección.

## Capabilities

### New Capabilities

- `datos-operativos-requieren-proyecto-activo`: las vistas y rutas operativas de
  alcance de proyecto no leen ni modifican datos si falta un proyecto activo y
  autorizado.

### Modified Capabilities

- `aislamiento-proyecto-por-modulo`: aclara que los roles de nivel tenant pueden
  usar capacidades globales explícitas, pero no omitir el contexto en endpoints
  definidos como project-scoped.

## Impact

- `packages/auth-middleware`: guard reutilizable de proyecto obligatorio o
  composición equivalente con `requireProjectAccess()`.
- `apps/gerencia-tecnica/src/main.ts`: rutas de presupuestos y auditoría de las
  demás rutas project-scoped.
- `apps/app-shell/src/views/InsumosView.tsx`: guard de vista, limpieza de estado y
  supresión de acciones sin proyecto.
- Otros microservicios: auditoría dirigida; cualquier corrección adicional debe
  quedar enumerada en `design.md` antes de implementarse.
- Producción: no se cambia nada durante esta etapa. La rama se mantiene local
  hasta completar diseño, tests, revisión y la política de publicación segura.
