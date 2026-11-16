## Why

Cuando un usuario carga mal un Catálogo de Conceptos, una Explosión de Insumos o una
Composición APU (por ejemplo un archivo OPUS con columnas mal mapeadas), hoy no existe
forma de deshacer esa importación: los endpoints de importación (`POST /presupuestos`,
`POST /insumos/importar-lote`, `POST /composicion-apu`) solo agregan/actualizan datos, y
ningún modelo (`PresupuestoBase`, `Insumo`, `ConceptoInsumo`) registra qué lote se importó,
cuándo ni quién lo hizo. La única corrección posible hoy es editar registros uno por uno o
pedir un fix manual en base de datos. Además, el borrado de fichas técnicas de insumo que sí
existe (`DELETE /insumos/:id/fichas/:fid`) está abierto a varios roles operativos
(`procurement`, `gerencia_tecnica`, `resident`/`residencia`), cuando debería quedar reservado
a quien tiene autoridad para corregir errores de carga: el rol `admin`.

## What Changes

- **BREAKING**: `DELETE /api/v1/gerencia-tecnica/insumos/:id/fichas/:fid` deja de aceptar los
  roles `procurement`, `gerencia_tecnica` y `resident`/`residencia`; solo `admin` puede
  eliminar una ficha técnica de ahora en adelante.
- Nuevo endpoint `DELETE /api/v1/gerencia-tecnica/presupuestos/:id` (roles `admin`,
  `gerencia_tecnica` y `control_proyectos`) que elimina en cascada un `PresupuestoBase`
  importado por error junto con sus `Capitulo`, `Concepto` y `ConceptoInsumo` asociados,
  permitiendo re-importar el Catálogo de Conceptos desde cero.
- Nuevo endpoint `DELETE /api/v1/gerencia-tecnica/insumos/importar-lote/:loteId` (roles
  `admin`, `gerencia_tecnica` y `control_proyectos`) para revertir un lote de Explosión de
  Insumos importado por error.
- Nuevo endpoint `DELETE /api/v1/gerencia-tecnica/composicion-apu/:conceptoId` (roles
  `admin`, `gerencia_tecnica` y `control_proyectos`) para eliminar la composición APU
  completa de un concepto y poder re-importarla.
- Nuevo campo de trazabilidad de lote (`lote_importacion_id`, `importado_por`,
  `importado_en`) en `Insumo` y `ConceptoInsumo`, generado por el backend en cada llamada a
  `importar-lote` / `composicion-apu`, para poder identificar y revertir un lote como unidad
  (en vez de solo poder borrar insumo por insumo).
- Todas las respuestas de importación (`POST /presupuestos`, `POST /insumos/importar-lote`,
  `POST /composicion-apu`) devuelven el identificador del lote/recurso creado, para que el
  frontend pueda ofrecer un botón "Deshacer importación" inmediatamente después de importar.

## Capabilities

### New Capabilities
- `eliminacion-importaciones-admin-gt`: endpoints para revertir/eliminar una importación
  completa de Catálogo de Conceptos, Explosión de Insumos o Composición APU en
  gerencia-tecnica (roles `admin`, `gerencia_tecnica`, `control_proyectos`), incluyendo la
  trazabilidad de lote necesaria para identificarlas.

### Modified Capabilities
- `fichas-tecnicas-acceso-residente`: el Residente (y Compras, Gerencia Técnica) pierden la
  capacidad de eliminar fichas técnicas; el `DELETE` de fichas queda restringido a `admin`.

## Impact

- **Código**: `apps/gerencia-tecnica/src/main.ts` (endpoints de importación y de fichas
  técnicas), `apps/gerencia-tecnica/prisma/schema.prisma` (nuevos campos de trazabilidad de
  lote en `Insumo`/`ConceptoInsumo`, posible tabla `LoteImportacion`), migraciones Prisma.
  - `packages/auth-middleware` no cambia — se reutiliza `requireRoles(...)`, ya usado en
    otros endpoints del mismo microservicio (ej. `requireRoles('admin', 'superintendent',
    'gerencia_tecnica', 'control_proyectos', 'control_obra')` en main.ts:2133).
- **Frontend**: vistas de gerencia-tecnica que ya usan estos endpoints de importación deben
  agregar el control "Deshacer importación" (visible para `admin`, `gerencia_tecnica` y
  `control_proyectos`) y dejar de mostrar el botón de eliminar ficha técnica a roles
  distintos de `admin`.
- **Datos existentes**: los lotes ya importados antes de este cambio no tendrán
  `lote_importacion_id` (queda `null`); no se revierten retroactivamente, solo las
  importaciones nuevas quedan cubiertas por el "deshacer".
- **Otros microservicios**: ninguno — este cambio es exclusivo de gerencia-tecnica.
