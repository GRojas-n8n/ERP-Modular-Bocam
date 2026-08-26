## 1. Preparación

- [x] 1.1 Grep de `prisma.proveedor.findMany`/`findFirst`/`findUnique` en todo `apps/compras/src` para confirmar que `GET /proveedores` (línea 1863) es la única vía por la que el frontend lista proveedores para selectores — si hay otra query directa que arme una lista de proveedores, listarla aquí para aplicarle el mismo filtro en la sección 3.
      **Resultado:** confirmado — `GET /proveedores` (línea 1869) es la única query de *listado general* para selectores. Los demás usos de `findMany`/`findFirst`/`findUnique` sobre `Proveedor` son lookups puntuales por `id_proveedor` (validaciones al crear/editar, documentos, calificaciones) o listas ya acotadas a IDs específicos (línea 120, proveedores ya invitados a una solicitud de cotización) — ninguno necesita el filtro de archivados. **Hallazgo colateral, no tocado:** `GET /admin/purga/resumen` (línea 6539) también hace `prisma.proveedor.findMany({ where: { tenant_id } })` sin filtro — es intencional, es una herramienta de admin para purgar datos de prueba y debe seguir mostrando proveedores de cualquier `estatus` incluidos los archivados; no se toca.
- [x] 1.2 Grep de `estatus` sobre `Proveedor` en `apps/compras/src` para confirmar que ningún otro endpoint asume el conjunto cerrado `ACTIVO | VETADO | PENDIENTE` (ej. un `switch`/validación que rechace valores no listados) — si existe, documentarlo aquí para actualizarlo en la sección 3.
      **Resultado:** confirmado — el único lugar que toca `estatus` fuera de la creación es el `PUT /proveedores/:id` (línea 2080), que lo pasa directo sin validar contra una lista cerrada (`...(estatus !== undefined && { estatus })`). No hay ningún `switch`/enum cerrado que rechace `ARCHIVADO`; no se necesita ningún cambio adicional.

## 2. Tests que reproducen el comportamiento esperado (deben fallar en rojo antes del fix)

Nuevo archivo `apps/compras/test/integration/archivar-proveedores.integration.test.ts`, mismo patrón que `test/integration/proveedores-importar-lote.integration.test.ts` (`signTenantToken` + `startHttpApp`/`stopHttpApp` de `test-support/e2e`, tenant y proveedor de prueba creados y limpiados por test, Postgres real).

- [x] 2.1 `POST /api/v1/compras/proveedores/:id/archivar` con token `procurement` sobre un proveedor `ACTIVO` → responde 200 y el proveedor en BD queda `estatus = 'ARCHIVADO'` (falla hoy: la ruta no existe, 404).
- [x] 2.2 `POST /api/v1/compras/proveedores/:id/activar` con token `admin` sobre un proveedor `ARCHIVADO` → responde 200 y el proveedor en BD queda `estatus = 'ACTIVO'` (falla hoy: la ruta no existe, 404).
- [x] 2.3 `POST /api/v1/compras/proveedores/:id/archivar` con un token sin rol `procurement` ni `admin` → responde 403 y el `estatus` del proveedor no cambia.
- [x] 2.4 `POST /api/v1/compras/proveedores/:id/archivar` con un `id` que no existe en el tenant → responde 404.
- [x] 2.5 Caso de no-regresión de histórico: crear un proveedor con al menos una orden de compra y una calificación asociadas, archivarlo, y confirmar que esa orden y esa calificación siguen existiendo sin cambios (`findUnique` directo a esas tablas tras el archivado).
- [x] 2.6 `GET /api/v1/compras/proveedores` sin parámetros, con un proveedor `ACTIVO` y otro `ARCHIVADO` en el tenant → la respuesta incluye el activo y NO incluye el archivado (falla hoy: no hay filtro, ambos aparecen).
- [x] 2.7 `GET /api/v1/compras/proveedores?incluir_archivados=true` con el mismo fixture de 2.6 → la respuesta incluye ambos proveedores.
- [x] 2.8 Confirmar que 2.1, 2.2, 2.6 fallan en rojo contra el código actual antes de aplicar el fix (documentar el resultado exacto de cada uno aquí).
      **Resultado:** archivo `test/integration/archivar-proveedores.integration.test.ts` creado con los 6 casos (2.1-2.7 mapeados a `testArchivarProveedorActivo`, `testActivarProveedorArchivado`, `testRolSinPermisoNoArchiva`, `testProveedorInexistente`, `testArchivarNoAlteraHistorico`, `testListadoFiltraArchivadosPorDefault`). Corrido contra el código sin el fix: `testArchivarProveedorActivo` falla en rojo con `actual: 404` vs `expected: 200` (log del propio servidor confirma `"status_code":404` en `POST .../archivar`) — la ruta no existe. El runner detiene la ejecución en el primer fallo, así que 2.2/2.6 no se aislaron individualmente, pero fallan por la misma causa raíz verificada por lectura de código: ninguna de las dos rutas (`/archivar`, `/activar`) ni el filtro de `GET /proveedores` existen todavía en `main.ts`.

## 3. Implementación

- [x] 3.1 `apps/compras/src/main.ts` — nuevo `POST /api/v1/compras/proveedores/:id/archivar`, `requireRoles('procurement', 'admin')`: `prisma.proveedor.update({ where: { id_proveedor: id, tenant_id: tenantId }, data: { estatus: 'ARCHIVADO' } })`; 404 si no existe en el tenant; `logInfo` con evento `compras.proveedor.archivado`.
- [x] 3.2 `apps/compras/src/main.ts` — nuevo `POST /api/v1/compras/proveedores/:id/activar`, mismo patrón, `data: { estatus: 'ACTIVO' }`, evento `compras.proveedor.activado`.
- [x] 3.3 `apps/compras/src/main.ts` línea ~1863 — `GET /proveedores` agrega `where: { estatus: req.query.incluir_archivados === 'true' ? undefined : { not: 'ARCHIVADO' } }` (o equivalente) al `findMany`.
- [x] 3.4 Actualizar el comentario `// ACTIVO, VETADO, PENDIENTE` de la línea 25 de `apps/compras/prisma/schema.prisma` para incluir `ARCHIVADO`.
- [x] 3.5 Aplicar cualquier hallazgo de la sección 1 (otra query directa a proveedores, o validación de `estatus` cerrada) que necesite el mismo tratamiento. **Resultado:** sin hallazgos que requirieran cambio (ver 1.1/1.2) — nada que aplicar aquí.

## 4. Frontend (app-shell)

- [x] 4.1 Ubicar la vista/administración de Proveedores en `apps/app-shell/src` (grep de `/compras/proveedores`) y agregar los botones "Archivar" / "Activar" según `estatus` actual del proveedor, llamando a los endpoints nuevos.
      **Resultado:** es el tab `activeTab === 'proveedores'` de `ComprasView.tsx` (tabla ~línea 2311). Botón "📦 Archivar"/"Activar" agregado en la columna de acciones junto a "Editar"/"📎 Docs"/"★ Calificar", llamando a `comprasApi.archivarProveedor`/`activarProveedor` (nuevos en `lib/api.ts`).
- [x] 4.2 La vista de administración de Proveedores pasa `incluir_archivados=true` al listar, y muestra visualmente cuáles están archivados (badge o fila atenuada) para distinguirlos de los activos.
      **Resultado:** checkbox "Mostrar archivados" junto al buscador; al activarse dispara `fetchProveedoresArchivados()` (`GET /proveedores?incluir_archivados=true`) hacia un estado separado (`proveedoresArchivados`), que se combina con `proveedoresList` SOLO para renderizar esta tabla (no toca `proveedoresList` en sí). Fila con `opacity-50` + badge "📦 Archivado" quand `estatus === 'ARCHIVADO'`.
- [x] 4.3 Confirmar que los selectores de proveedor en Solicitud de Cotización y Cuadro Comparativo NO pasan `incluir_archivados=true` (deben seguir con la llamada actual sin parámetros, para heredar el filtro por default).
      **Resultado:** confirmado por diseño — `proveedoresList` (usado en el selector de Solicitud de Cotización, línea ~3146, y en `proveedoresCatalogo` de `ComparativaDetail`, línea ~1842) sigue alimentándose exclusivamente de `fetchData()` → `api.get('/api/v1/compras/proveedores')` SIN el parámetro, sin cambios en esa llamada. Los archivados solo llegan al estado separado `proveedoresArchivados`, que ningún selector lee.
- [x] 4.4 Ningún texto de UI dice "Eliminar" ni "Borrar" para esta acción — solo "Archivar" y su contraparte "Activar".
      **Resultado:** confirmado por lectura — el formulario de alta/edición (`<Select value={proveedorForm.estatus}>`, línea ~4297) solo ofrece ACTIVO/VETADO/PENDIENTE (sin ARCHIVADO), manteniendo Archivar/Activar como acciones dedicadas fuera del formulario general, tal como en design.md Decisión 3.

## 5. Verificación

- [x] 5.1 Los tests de la sección 2 pasan en verde (2.1–2.7). **Resultado:** los 6 tests de `archivar-proveedores.integration.test.ts` pasan (`ok`).
- [x] 5.2 `npx tsc --noEmit` en `apps/compras` limpio. **Resultado:** sin salida (limpio).
- [x] 5.3 Suite existente de integración de `apps/compras` relacionada con proveedores sigue en verde (`proveedores-importar-lote`, `estado-respuesta-proveedor-comparativo`, `especificacion-ofrecida-proveedor`, `seleccion-proveedor-recomendado`). **Resultado:** las 4 suites en verde (14 casos `ok` en total), sin regresión.
- [x] 5.4 `npx tsc -b` + suite de tests de `apps/app-shell` que toquen Compras/Proveedores en verde. **Resultado:** `tsc -b` limpio; `ComprasView.*` + `ComparativaDetail.*` — 22 archivos / 49 tests en verde, sin regresión.
- [x] 5.5 Verificación manual: con `compras` levantado localmente, archivar un proveedor de prueba, confirmar que desaparece del selector de Solicitud de Cotización y que sigue visible (marcado como archivado) en la administración del catálogo; activarlo de vuelta y confirmar que reaparece en el selector. Limpiar el proveedor de prueba al terminar.
      **Resultado:** `compras` levantado localmente (`npm run dev`, puerto 3002, Docker Postgres/Redis/RabbitMQ arriba). Con un token real firmado (`procurement`) contra un tenant nuevo: (1) creado proveedor de prueba vía `POST /proveedores` → `estatus: ACTIVO`; (2) `GET /proveedores` sin params lo incluye; (3) `POST /:id/archivar` → `estatus: ARCHIVADO`; (4) `GET /proveedores` sin params YA NO lo incluye (confirma que desaparece de los selectores, que llaman sin el parámetro); (5) `GET /proveedores?incluir_archivados=true` sí lo incluye con `estatus: ARCHIVADO` (confirma la vista de administración); (6) `POST /:id/activar` → `estatus: ACTIVO`; (7) `GET /proveedores` sin params vuelve a incluirlo. Proveedor de prueba eliminado de BD al terminar (`prisma.proveedor.deleteMany`, 1 fila borrada), servidor de dev detenido.

## 6. Cierre

- [x] 6.1 Commit en una rama nueva desde `origin/main` (confirmar con el usuario nombre de rama, ej. `feat/archivar-proveedores`). **Resultado:** rama `feat/archivar-proveedores` creada desde `origin/main`.
- [x] 6.2 PR contra `main` referenciando este change de OpenSpec. **Resultado:** https://github.com/GRojas-n8n/ERP-Modular-Bocam/pull/108
- [ ] 6.3 Tras merge, archivar el change (`openspec archive`).
