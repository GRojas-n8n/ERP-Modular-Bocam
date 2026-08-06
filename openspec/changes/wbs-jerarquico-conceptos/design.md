## Context

`Concepto` (`apps/gerencia-tecnica/prisma/schema.prisma:115-139`) es hoy una tabla plana: cada fila pertenece a un `PresupuestoBase` (que a su vez pertenece a un proyecto), sin ningún campo de agrupación jerárquica y sin restricción de unicidad sobre `clave` — ni el schema (`@@index`, no `@@unique`) ni el endpoint `POST /presupuestos` (`src/main.ts:503-544`, que mapea `conceptos` del body 1:1 a filas nuevas sin ninguna verificación) impiden dos conceptos con la misma clave en el mismo presupuesto. El único catálogo maestro real del módulo es `Insumo` (`schema.prisma:60-86`), único por `tenant_id + clave`, sin `proyecto_id` — se reutiliza entre obras del mismo tenant. `Concepto` no tiene el mismo tratamiento.

## Goals / Non-Goals

**Goals:**
- Un presupuesto nuevo no puede crear dos conceptos con la misma clave sin que el sistema lo rechace.
- Los conceptos de un presupuesto se agrupan en capítulos (Capítulo → Concepto), reflejando la estructura real de un presupuesto de obra tipo OPUS.
- Existe un catálogo maestro de conceptos por tenant (`ConceptoCatalogo`), consultado al importar un presupuesto nuevo, para detectar cuando una clave ya usada en otra obra trae una descripción o unidad distinta.

**Non-Goals:**
- No se modifica `control-proyectos` ni su campo `frente_trabajo` (texto libre en `ProgramacionObra`) — es un microservicio distinto; su relación con `Capitulo` de GT queda para un change futuro con su propio spec.
- No se fuerza un formato de `clave` (regex, longitud, etc.) — el negocio no ha definido un estándar de nomenclatura; este change solo garantiza unicidad, no formato.
- No se migran/reagrupan retroactivamente los conceptos ya existentes en capítulos — `capitulo_id` es nullable y los conceptos históricos quedan sin capítulo asignado (`null`), visible como "Sin capítulo" en vez de inventar una agrupación que nadie definió.
- No se bloquea la importación de un presupuesto solo porque una clave ya existe en `ConceptoCatalogo` con datos distintos — se advierte (ver Decision 3), no se rechaza, porque un catálogo puede legítimamente evolucionar entre obras (un concepto se redefine con el tiempo) y bloquear frenaría trabajo real sin que el negocio lo haya pedido.

## Decisions

**1. `Capitulo` se scopea por proyecto/presupuesto, no por tenant — a diferencia de `ConceptoCatalogo`, que sí es a nivel tenant.**
La estructura de capítulos de un presupuesto (cuántos hay, cómo se numeran) puede variar legítimamente de una obra a otra incluso dentro del mismo tenant (una obra de pavimentación no tiene los mismos capítulos que una de edificación). Lo que sí debe ser consistente entre obras es el significado de cada *concepto* individual (misma clave = mismo trabajo), que es lo que resuelve `ConceptoCatalogo`. Forzar capítulos compartidos a nivel tenant obligaría a un catálogo de capítulos rígido que no corresponde a cómo se arman los presupuestos reales.

**2. Unicidad de `clave` es `@@unique([tenant_id, proyecto_id, presupuesto_id, clave])` — dentro de un mismo `PresupuestoBase`, no por proyecto completo ni por tenant como `Insumo`.**
`GET /presupuesto/activo` (`src/main.ts:229-261`) confirma que un proyecto tiene múltiples `PresupuestoBase` a lo largo del tiempo (`version` incrementa, se ordena por `created_at desc` para tomar "el activo") — cada revisión de presupuesto es un `PresupuestoBase` nuevo que, en la práctica, vuelve a declarar el mismo catálogo de conceptos de la obra (mismas claves, cantidades/precios actualizados). Restringir la unicidad a nivel de todo el proyecto (`[tenant_id, proyecto_id, clave]`) rompería el flujo normal de crear una versión 2 de un presupuesto que reutiliza las claves de la versión 1 — bloquearía exactamente el caso de uso correcto. Restringir la unicidad a nivel de un solo `PresupuestoBase` (una sola versión) sí resuelve el problema real encontrado en la auditoría (dos conceptos con la misma clave en el *mismo* lote importado) sin romper el versionado. Lo que se comparte entre obras/versiones es la *definición* (clave→descripción/unidad), que vive en `ConceptoCatalogo`, no la fila transaccional `Concepto`.

**3. Divergencia clave↔descripción contra el catálogo maestro: se advierte, no se bloquea (a diferencia de la unicidad dentro del mismo lote, que sí se rechaza con 422).**
Dos niveles de severidad distintos: (a) dos conceptos con la misma clave en el *mismo* presupuesto es inequívocamente un error de captura — no hay ningún escenario de negocio válido para eso, se rechaza. (b) una clave que ya existía en otra obra con una descripción/unidad distinta puede ser una evolución legítima del catálogo (specs de materiales cambian, unidades se estandarizan distinto con el tiempo) — se guarda la advertencia en la respuesta del `POST /presupuestos` (`advertencias: [...]`, mismo patrón ya usado en `apps/compras/src/main.ts` para advertencias de OC) para que quien importa decida, sin bloquear el flujo.

**4. Migración del índice único requiere investigar duplicados existentes antes de aplicarse — no se asume que la base esté limpia.**
`Concepto` nunca tuvo esta restricción, así que es posible que ya existan filas con `clave` duplicada dentro de un mismo `presupuesto_id` en producción (aunque el alcance por-versión de Decision 2 hace esto mucho menos probable que un alcance por-proyecto). Aplicar `@@unique` directamente rompería la migración si eso ocurre. Primera tarea de implementación (bloqueante): correr una consulta de duplicados contra la BD real antes de generar la migración; si aparecen, decidir con el dueño del producto cómo resolverlos (fusionar cantidades, renombrar una clave) antes de continuar — no se resuelven automáticamente sin decisión de negocio, porque fusionar mal un concepto duplicado alteraría montos ya aprobados.

**5. `ConceptoCatalogo` no reemplaza los campos de `Concepto` — es solo referencia/detección de divergencia, el precio/cantidad siguen viniendo del presupuesto real.**
Mismo principio ya usado en el fix de `estimaciones-avance-fisico-residente` (precio congelado al momento de creación): el precio de un concepto es del presupuesto aprobado de esa obra, nunca se reemplaza por un valor "de catálogo" — `ConceptoCatalogo` solo guarda `descripcion`/`unidad_medida` para detectar inconsistencias, no `precio_unitario` ni `cantidad`.

## Risks / Trade-offs

- **[Riesgo, ver Decision 4] Duplicados existentes en producción pueden bloquear la migración.** → Mitigación: tarea de investigación previa obligatoria antes de generar la migración (sección 1 de tasks.md).
- **[Trade-off] Advertir sin bloquear en divergencias de catálogo (Decision 3) puede dejar pasar errores reales de captura si nadie lee las advertencias.** → Aceptado: bloquear agresivamente en el primer despliegue, sin datos históricos de qué tan seguido ocurre esto en la práctica, arriesga frenar cargas de presupuesto legítimas. Se puede endurecer a bloqueo en un change futuro si las advertencias muestran un patrón claro de error real.
- **[Riesgo] `capitulo_id` nullable en conceptos históricos deja el dashboard con una categoría "Sin capítulo" para todo lo capturado antes de este change.** → Aceptado explícitamente en Non-Goals; no se inventa una agrupación retroactiva.

## Migration Plan

- Investigación previa (bloqueante): query de duplicados de `(tenant_id, proyecto_id, clave)` en `conceptos` contra la BD real de producción.
- Migración de schema en `gerencia-tecnica`: modelos nuevos `Capitulo` y `ConceptoCatalogo`; `Concepto` gana `capitulo_id` (nullable) y el índice único `[tenant_id, proyecto_id, clave]` (solo si la investigación previa confirma que no hay duplicados, o después de resolverlos).
- Deploy: un solo servicio (`gerencia-tecnica`). No requiere coordinar con `control-proyectos` — el contrato de `GET /presupuesto/activo` solo gana campos opcionales nuevos.
- Rollback: revertir el commit; sin backfill de `capitulo_id` que perder.

## Open Questions

Ninguna pendiente de decisión técnica — la única pregunta abierta real (qué hacer si la investigación de duplicados encuentra filas existentes) es una decisión de negocio caso por caso, documentada como bloqueante en Decision 4 y en tasks.md, no una pregunta de diseño de este documento.
