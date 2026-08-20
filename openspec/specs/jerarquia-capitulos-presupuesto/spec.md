# jerarquia-capitulos-presupuesto Specification

## Purpose

Los conceptos de un `PresupuestoBase` se agrupan en capítulos (`Capitulo`),
reflejando la descomposición jerárquica real de un presupuesto de obra en
vez de una lista plana. La clave de un concepto es única dentro de un mismo
`PresupuestoBase`, pero se permite reutilizarla legítimamente entre
versiones sucesivas del presupuesto de un mismo proyecto.

## Requirements

### Requirement: Conceptos agrupados en capítulos dentro de un presupuesto
El sistema SHALL permitir agrupar los conceptos de un `PresupuestoBase` en
capítulos (`Capitulo`), reflejando la descomposición jerárquica real de un
presupuesto de obra, en vez de una lista plana de conceptos sin
agrupación.

#### Scenario: Importación de presupuesto con capítulos
- **WHEN** `POST /api/v1/gerencia-tecnica/presupuestos` recibe conceptos
  con una referencia de capítulo (clave y nombre)
- **THEN** el sistema crea o reutiliza el `Capitulo` correspondiente a ese
  presupuesto y asocia cada `Concepto` a su `capitulo_id`

#### Scenario: Concepto sin capítulo especificado
- **WHEN** un concepto importado no trae referencia de capítulo
- **THEN** el sistema lo crea con `capitulo_id = null` (sin agrupación),
  sin rechazar la importación

### Requirement: Unicidad de clave de concepto dentro de un mismo presupuesto
El sistema SHALL rechazar con `422` la creación de un presupuesto (`PresupuestoBase`)
que contenga dos o más conceptos con la misma `clave` dentro del mismo lote
importado. Esta restricción aplica por `presupuesto_id` (una versión de
presupuesto), no por proyecto completo: un proyecto tiene múltiples
`PresupuestoBase` a lo largo del tiempo (`version` 1, 2, 3...) y cada
revisión reutiliza legítimamente las claves de conceptos de la versión
anterior — eso no es un error.

#### Scenario: Dos conceptos con la misma clave en el mismo lote
- **WHEN** el body de `POST /api/v1/gerencia-tecnica/presupuestos` trae dos
  o más conceptos con la misma `clave`
- **THEN** el sistema responde `422` indicando la clave duplicada y no crea
  ningún concepto de ese lote

#### Scenario: Misma clave reutilizada en una versión nueva del presupuesto
- **WHEN** se crea un `PresupuestoBase` nuevo (versión 2) para un proyecto
  que ya tenía un `PresupuestoBase` previo (versión 1) con conceptos de la
  misma `clave`
- **THEN** el sistema crea los conceptos de la versión 2 normalmente — la
  restricción de unicidad no aplica entre versiones distintas del mismo
  proyecto
