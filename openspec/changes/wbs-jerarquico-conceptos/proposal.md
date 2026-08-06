## Why

El sistema se vende como si estandarizara el catálogo de conceptos (WBS) "en todas tus obras", pero `Concepto` (`apps/gerencia-tecnica/prisma/schema.prisma:115-139`) es una lista plana por proyecto: sin jerarquía (no hay capítulo/partida, solo un `Concepto` suelto) y sin ninguna restricción de unicidad de `clave` — ni siquiera dentro del mismo proyecto. `POST /api/v1/gerencia-tecnica/presupuestos` (`src/main.ts:503-544`) crea los conceptos tal cual vienen del archivo importado, sin verificar si la `clave` ya existe en ese presupuesto o en otro proyecto del mismo tenant, y sin agruparlos en capítulos. El único catálogo maestro real y reutilizable entre obras es `Insumo` (único por `tenant_id + clave`, `schema.prisma:60-86`) — los conceptos (las partidas que realmente se cobran) no tienen el mismo tratamiento. Esto significa que dos residentes en dos obras distintas del mismo cliente pueden usar la misma clave para conceptos diferentes (o claves distintas para el mismo concepto), exactamente el tipo de inconsistencia que la promesa de venta dice resolver.

## What Changes

- **Backend (`gerencia-tecnica`)**: `Concepto` gana `capitulo_id` (FK opcional a un modelo nuevo `Capitulo`), para representar la descomposición jerárquica real de un presupuesto de obra (Capítulo → Concepto — convención estándar de presupuestos de construcción tipo OPUS, ej. "01 PRELIMINARES", "02 CIMENTACIÓN").
- **Backend (`gerencia-tecnica`)**: nuevo modelo `Capitulo` (`tenant_id`, `proyecto_id`, `presupuesto_id`, `clave`, `nombre`, `orden`), poblado al importar un presupuesto si el archivo trae columna de capítulo.
- **Backend (`gerencia-tecnica`)**: `Concepto` gana la restricción `@@unique([tenant_id, proyecto_id, presupuesto_id, clave])` — hoy no existe ninguna, y `POST /presupuestos` puede crear dos conceptos con la misma clave en el mismo presupuesto sin avisar. El alcance es por `presupuesto_id` (una versión del presupuesto), no por proyecto completo, porque `GET /presupuesto/activo` confirma que un proyecto tiene varias versiones de presupuesto a lo largo del tiempo que reutilizan legítimamente las mismas claves.
- **Backend (`gerencia-tecnica`)**: nuevo modelo `ConceptoCatalogo` (`tenant_id`, `clave` único por tenant, `descripcion`, `unidad_medida`), catálogo maestro reutilizable entre proyectos del mismo tenant — mismo patrón que ya usa `Insumo`. Al importar un presupuesto nuevo, si la `clave` de un concepto ya existe en `ConceptoCatalogo` del tenant, se usa su `descripcion`/`unidad_medida` como referencia y se advierte si el archivo importado trae valores distintos (en vez de crear silenciosamente un concepto con datos divergentes bajo la misma clave); si no existe, se agrega al catálogo para las próximas obras.
- **BREAKING (validación)**: `POST /api/v1/gerencia-tecnica/presupuestos` rechaza con 422 un presupuesto que trae dos conceptos con la misma `clave` en el mismo lote (hoy los crea a ambos sin avisar).

## Capabilities

### New Capabilities
- `catalogo-maestro-conceptos`: catálogo de conceptos reutilizable entre proyectos del mismo tenant (`ConceptoCatalogo`), con validación de consistencia clave↔descripción/unidad al importar un presupuesto nuevo.
- `jerarquia-capitulos-presupuesto`: estructura de capítulos (`Capitulo`) dentro de un presupuesto, con conceptos agrupados jerárquicamente en vez de una lista plana.

### Modified Capabilities
(ninguna spec existente de `openspec/specs/` cubre hoy la carga de presupuestos de conceptos con detalle suficiente para requerir un delta — la spec `permisos-catalogo-gerencia-tecnica` solo cubre RBAC, no la estructura de datos.)

## Impact

- `apps/gerencia-tecnica/prisma/schema.prisma` — modelos nuevos `Capitulo`, `ConceptoCatalogo`; `Concepto` gana `capitulo_id` y el índice único `[tenant_id, proyecto_id, clave]`; migración.
- `apps/gerencia-tecnica/src/main.ts` — `POST /presupuestos` (línea ~503-544): resolver/crear capítulos, validar unicidad de clave dentro del lote, consultar/actualizar `ConceptoCatalogo`.
- No se modifica `control-proyectos` en este change: `frente_trabajo` (texto libre en `ProgramacionObra`) queda fuera de alcance — es un microservicio distinto y su relación con `Capitulo` de GT, si se decide más adelante, necesita su propio spec (regla de un spec por microservicio).
- No se modifica el contrato de `GET /presupuesto/activo` que ya consume `control-proyectos` (los conceptos que devuelve siguen teniendo los mismos campos; `capitulo_id`/`capitulo` se agregan como campos nuevos opcionales, no reemplazan ninguno existente — no rompe a los consumidores actuales).
- Tests nuevos en `apps/gerencia-tecnica`: unicidad de clave dentro de un lote y entre lotes del mismo proyecto, resolución del catálogo maestro al importar, creación/actualización de capítulos.
