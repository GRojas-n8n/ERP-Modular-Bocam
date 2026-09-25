## Context

En una sesión real de producción con `projects: []`, la aplicación estableció
`currentProjectId = null`, pero `InsumosView` llamó a
`GET /api/v1/gerencia-tecnica/presupuestos`. El JWT usa `proyecto_id: ""` para
este modo. Como `admin` está clasificado como rol de nivel tenant,
`requireProjectAccess()` llamó `next()` antes de exigir proyecto. Finalmente, el
endpoint omitió `whereClause.proyecto_id` y devolvió información de todo el
tenant.

Control de Obra mostró correctamente `SIN DATOS DE PROYECTO`. Compras y Finanzas
mostraron estados vacíos, pero mantuvieron acciones de creación; forman parte de
la auditoría porque una pantalla vacía no demuestra que el backend esté
rechazando el contexto ausente.

## Goals / Non-Goals

**Goals:**

- Cerrar la lectura y escritura accidental de datos project-scoped sin proyecto.
- Mantener sin regresión los modos globales de tenant que sí están documentados.
- Asegurar defensa en profundidad en frontend, middleware, endpoint y consulta.
- Cubrir el caso con cero proyectos y el caso de un proyecto eliminado durante
  una sesión existente.

**Non-Goals:**

- Eliminar o reclasificar los 72 conceptos observados.
- Cambiar los permisos funcionales de `admin` dentro de un proyecto válido.
- Suprimir los modos globales legítimos de Finanzas, Contabilidad o Personal.
- Ejecutar escrituras de diagnóstico en producción.

## Decisions

### 1. Separar acceso tenant-level de presencia obligatoria de proyecto

`requireProjectAccess()` seguirá resolviendo si el usuario puede acceder a un
proyecto. Se agregará un guard explícito para rutas project-scoped que primero
rechace `proyectoId` vacío. Un rol tenant-level puede omitir la lista de
asignaciones cuando opera sobre un proyecto válido, pero no puede omitir el
proyecto mismo en una ruta project-scoped.

### 2. No usar filtros opcionales en endpoints project-scoped

Una ruta project-scoped debe construir siempre una condición explícita
`proyecto_id = proyectoId`. Si el valor falta, la ruta termina antes de consultar
la base. No se acepta `{}` como fallback ni se depende solo de RLS.

### 3. El frontend bloquea carga y limpia estado

Al quedar `currentProjectId = null`, cada vista project-scoped cancela nuevas
cargas, limpia datos derivados del proyecto anterior y muestra un estado seguro
sin botones de crear, importar, aprobar, pagar o programar. Esto evita la fuga
visual, pero no sustituye los controles del backend.

### 4. Los modos globales se permiten por capacidad, no por rol genérico

Las rutas tenant-level existentes permanecen globales solo cuando su
especificación lo declara. La auditoría producirá una matriz de ruta → alcance
(`project-scoped`, `tenant-scoped`, `catálogo compartido`) para impedir que la
misma ambigüedad reaparezca.

## Verification Strategy

1. Tests unitarios del middleware: `admin` con proyecto vacío es rechazado por el
   guard project-scoped; el mismo usuario con proyecto válido continúa.
2. Integración de Gerencia Técnica: un JWT con `proyecto_id: ""` recibe 403 y no
   ejecuta una consulta global; proyectos A y B permanecen aislados.
3. Frontend: `currentProjectId = null` no dispara la petición, limpia un
   presupuesto previamente renderizado y oculta acciones mutantes.
4. Regresión: Finanzas/Contabilidad/Personal conservan sus endpoints globales
   documentados, sin aplicarles el guard por accidente.
5. Smoke autenticado en un entorno seguro y después en producción: cuenta sin
   proyectos ve el guard en todos los módulos project-scoped y ninguna respuesta
   contiene datos de proyecto.

## Risks

- Aplicar el guard globalmente rompería capacidades tenant-level legítimas.
  Mitigación: montarlo por router/ruta y respaldarlo con la matriz de alcance.
- Corregir solo Gerencia Técnica dejaría variantes del mismo patrón en otros
  servicios. Mitigación: auditoría estática y tests negativos por módulo.
- El frontend podría conservar estado React al perder el proyecto durante una
  sesión. Mitigación: prueba explícita de transición proyecto válido → `null`.
