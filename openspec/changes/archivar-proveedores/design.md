## Context

`apps/compras` expone un único endpoint de listado, `GET /api/v1/compras/proveedores` (línea 1863 de `main.ts`), sin `requireRoles` y sin ningún filtro — hace `prisma.proveedor.findMany({ orderBy: { razon_social: 'asc' } })` completo. El frontend (`app-shell`) reutiliza esa misma respuesta tanto para:
1. La pantalla de administración del catálogo de Proveedores (donde un admin/procurement necesita ver TODO, incluidos los archivados, para poder reactivarlos), como
2. Los selectores de proveedor dentro de "Solicitud de Cotización" y "Cuadro Comparativo" (donde un proveedor archivado NO debe aparecer como invitable).

No existe un segundo endpoint de "selector" separado. Cualquier diseño tiene que resolver ese doble uso sin duplicar el endpoint.

`estatus` es un `String` libre (no enum de Prisma) con comentario `// ACTIVO, VETADO, PENDIENTE` — agregar `ARCHIVADO` no requiere migración de esquema, solo un valor nuevo válido.

## Goals / Non-Goals

**Goals:**
- Permitir archivar/activar un proveedor sin perder ni alterar su histórico (`ordenes`, `comparativas`, `documentos`, `calificaciones`, `solicitudes_cotizacion`, `evaluaciones_especificacion`).
- Que los selectores de flujos de alta dejen de ofrecer proveedores archivados por default, sin romper la vista de administración que sí necesita verlos.
- Establecer la convención de endpoints (`POST /:id/archivar`, `POST /:id/activar`) que se replicará en `personal` y `auth`.

**Non-Goals:**
- Borrado físico (`DELETE`) de la fila — explícitamente fuera de alcance en este change (ver proposal.md).
- Cambiar el significado de `VETADO`/`PENDIENTE` o cualquier otro flujo que ya usa `estatus` (ej. calificación de desempeño, crédito).
- Tocar `estatus_credito` — es un campo independiente, no relacionado con archivar.

## Decisions

**1. Reutilizar `estatus` con un valor nuevo (`ARCHIVADO`), no una columna booleana `activo` separada.**
`Proveedor` ya tiene `estatus` como el campo de estado canónico y el frontend/reportes probablemente ya lo leen. Agregar una segunda columna `activo` crearía dos fuentes de verdad (¿qué pasa si `estatus='VETADO'` y `activo=true`?). Alternativa considerada y descartada: columna `activo: Boolean` como en `auth` — se descarta aquí porque `Proveedor` ya usa un campo de estado con semántica de "string enum", a diferencia de los modelos de `auth` que no tenían ningún campo de estado previo.

**2. `GET /proveedores` filtra `ARCHIVADO` por default; parámetro `?incluir_archivados=true` lo incluye.**
Mantiene un solo endpoint (no se duplica lógica de tenant/paginación). Los selectores de Solicitud de Cotización / Cuadro Comparativo en el frontend no cambian su llamada (sin el query param, quedan filtrados automáticamente). Solo la vista de administración del catálogo agrega el query param para poder listar y reactivar archivados. Alternativa considerada: endpoint separado `GET /proveedores/archivados` — se descarta por duplicar la query y por ser innecesario dado que un query param resuelve ambos casos con un `WHERE` condicional.

**3. `POST /:id/archivar` y `POST /:id/activar` como acciones dedicadas, no `PUT /:id` con `estatus` en el body.**
El `PUT /:id` existente (línea 2052) es edición general de campos del proveedor; mezclar el cambio de ciclo de vida ahí obligaría al frontend a mandar el objeto completo solo para archivar, y complica el log de auditoría (`logInfo`) al no poder distinguir "se editó el proveedor" de "se archivó el proveedor" en el evento. Dos acciones POST explícitas, cada una gatilla su propio `logInfo`/`logError` con un código de evento distinto (`compras.proveedor.archivado` / `compras.proveedor.activado`), igual que el resto del archivo ya hace por acción (ver `compras.proveedor.creado`).

**4. RBAC: reusar `requireRoles('procurement', 'admin')`, igual que `POST /proveedores` y `PUT /proveedores/:id`.**
Es el mismo par de roles que ya gatea alta/edición del catálogo en este archivo — no hay motivo para que archivar/activar tenga una política distinta.

**5. Sin chequeo de "referencias activas" para archivar (a diferencia del borrado físico descartado en Goals).**
Archivar no borra nada — un proveedor con una comparativa en proceso puede archivarse sin problema, porque la comparativa sigue intacta y sigue mostrando el proveedor por su relación existente; solo deja de ser *invitable a procesos nuevos*. Esto es intencional y es lo que hace que la operación sea segura sin validación cruzada, a diferencia del borrado físico.

## Risks / Trade-offs

- **[Riesgo] Un proveedor archivado por error sigue siendo elegible en pantallas que no llamen a `GET /proveedores` (si hay alguna que cachee o lea `Proveedor` por otra vía) → Mitigación:** durante `tasks.md`, grep de todo uso de `prisma.proveedor.findMany`/`findFirst` en `apps/compras/src` para confirmar que el listado de selectores pasa únicamente por el endpoint filtrado, no por una query directa distinta.
- **[Riesgo] El frontend actual no filtra por `estatus` porque hoy `GET /proveedores` siempre devolvía solo activos/vetados/pendientes implícitamente (nunca había archivados) → Mitigación:** el filtro se aplica en el backend (no depende de que el frontend lo implemente), así que aun sin cambios de frontend, un proveedor archivado deja de aparecer en cualquier consumidor existente del endpoint. El frontend solo necesita el query param nuevo para la vista de administración.
- **[Trade-off] Reactivar (`activar`) no restaura ningún estado previo de `estatus_credito`/`calificacion_desempeno` — esos campos no se tocan al archivar, así que no hay nada que restaurar; se documenta para que quede explícito que `archivar`/`activar` es ortogonal a esos otros campos.

## Migration Plan

- Sin migración de base de datos (columna `estatus` ya existe como `String`).
- Deploy backend primero (endpoints nuevos + filtro), luego frontend (botones Archivar/Activar + query param en la vista de administración). El orden es seguro en cualquier dirección porque el filtro por default no rompe el comportamiento actual (hoy no existen proveedores `ARCHIVADO`).
- Rollback: revertir el commit del backend es seguro — ningún proveedor existente tendrá `estatus='ARCHIVADO'` hasta que se use el endpoint nuevo, así que no hay estado que migrar de vuelta.

## Open Questions

- Ninguna pendiente para esta primera iteración — el borrado físico queda documentado como fuera de alcance en proposal.md, no como pregunta abierta.
