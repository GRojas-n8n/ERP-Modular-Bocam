## Context

`apps/gerencia-tecnica` tiene tres vías de importación masiva y ninguna deja rastro de "lote":

- `POST /presupuestos` (main.ts:528) crea un `PresupuestoBase` con sus `Capitulo`/`Concepto` —
  este SÍ tiene un agregado natural (`PresupuestoBase`), así que revertir el Catálogo de
  Conceptos es borrar ese registro en cascada.
- `POST /insumos/importar-lote` (main.ts:319) crea/actualiza filas sueltas de `Insumo`, sin
  ningún identificador común entre las filas de una misma carga.
- `POST /composicion-apu` (main.ts:711) crea/actualiza filas sueltas de `ConceptoInsumo`
  colgando de un `Concepto` que ya existe (no se crea un agregado nuevo).

Además, `Insumo` y `Concepto` no son "propiedad" exclusiva de una importación: un insumo
importado en un lote puede terminar referenciado por una Requisición, una OC o el
`ConceptoInsumo` de otro concepto. Borrar sin verificar eso puede destruir datos operativos
reales (no solo el error de carga).

## Goals / Non-Goals

**Goals:**
- Dar a `admin` una forma de deshacer una importación reciente en los tres flujos
  (Catálogo de Conceptos, Explosión de Insumos, Composición APU).
- Evitar borrar datos que ya se usaron fuera de la importación errónea (avances,
  estimaciones, bitácoras, requisiciones, OC).
- Reutilizar el patrón de permisos existente (`requireRoles('admin')`, ya usado en
  `DELETE /insumos/:id`) sin introducir un mecanismo de roles nuevo.

**Non-Goals:**
- No se construye un sistema genérico de "auditoría de cambios" para todo el microservicio,
  solo el mínimo necesario para identificar y revertir un lote de importación.
- No se revierten retroactivamente lotes importados antes de este cambio (quedan con
  `lote_importacion_id = null` y solo se pueden corregir manualmente, como hoy).
- No se toca el flujo de fichas técnicas más allá del cambio de roles en el `DELETE`
  (no se rediseña la subida/descarga).

## Decisions

1. **Tabla `LoteImportacion` solo para Explosión de Insumos, no para los otros dos flujos.**
   Se agrega un modelo `LoteImportacion` (`id`, `tenant_id`, `importado_por`,
   `importado_en`, `cantidad_registros`, `estado` [`activo` | `revertido`]). Cada llamada a
   `POST /insumos/importar-lote` crea una fila aquí y estampa su `id` como
   `lote_importacion_id` en cada `Insumo` que toca.
   - Alternativa descartada: generar solo un UUID en memoria y devolverlo sin persistir
     metadata — se descarta porque no permitiría listar lotes revertibles en una UI futura
     ni saber quién/cuándo importó sin cruzar timestamps a mano.
   - `Composición APU` NO necesita esta tabla: `DELETE /composicion-apu/:conceptoId` ya
     identifica exactamente qué borrar por el `concepto_id` (no hace falta un id de lote
     adicional). Se descarta agregar `lote_importacion_id` a `ConceptoInsumo` por ser
     complejidad sin uso real.

2. **Catálogo de Conceptos se revierte borrando el `PresupuestoBase`, sin tabla de lote
   nueva.** Ya es un agregado 1:1 con "una importación", así que no necesita
   `LoteImportacion`; su propio `id` cumple ese rol. Además, el schema ya declara
   `onDelete: Cascade` de `PresupuestoBase` → `Capitulo`/`Concepto` y de `Concepto` →
   `ConceptoInsumo`, así que un solo `db.presupuestoBase.delete()` basta — Postgres
   propaga el cascade de forma transitiva, sin necesidad de borrar cada tabla a mano.

3. **Bloqueo por uso real (409) antes de permitir el borrado, usando SOLO datos locales de
   gerencia-tecnica** — igual que el patrón ya usado en `gestion-documentos` (CA-5: no se
   borra un documento con versión `VIGENTE`):
   - `DELETE /presupuestos/:id` → 409 si algún `Concepto` del presupuesto tiene un
     `SaldoPartida` con `monto_comprometido > 0` o `monto_ejercido > 0` (ya se generó OC o
     pago sobre esa partida), o si existe `CompraProyectada` para alguno de sus conceptos.
   - `DELETE /insumos/importar-lote/:loteId` → 409 si algún `Insumo` del lote está
     referenciado por un `ConceptoInsumo` fuera del lote, o por una `CompraProyectada`.
   - `DELETE /composicion-apu/:conceptoId` → sin bloqueo adicional: solo borra
     `ConceptoInsumo`, no el `Concepto` ni los `Insumo` del catálogo, así que no hay riesgo
     de romper referencias externas.

   **Limitación conocida y aceptada** (decisión explícita del usuario): avances físicos,
   estimaciones y bitácoras viven en el microservicio `control-proyectos`, no en
   gerencia-tecnica (confirmado en main.ts:229-230 — es control-proyectos quien consulta a
   GT por B2B, no al revés). Este change **no** agrega una llamada B2B a control-proyectos
   para verificarlos: solo bloquea con la señal financiera que GT ya tiene proyectada
   (`SaldoPartida`, `CompraProyectada`). Un avance físico puro, registrado en
   control-proyectos sin haber generado todavía compromiso financiero en GT, **no** bloqueará
   el borrado con este change. Verificar avances/bitácoras cruzando con control-proyectos
   queda fuera de alcance y sería un change futuro aparte (afectaría a un segundo
   microservicio).

4. **Revertir un lote de insumos usa soft-delete (`activo: false`), igual que
   `DELETE /insumos/:id` (main.ts:482), no borrado físico.** Es consistente con el único
   precedente de borrado de `Insumo` que ya existe en el microservicio, y evita el riesgo de
   violar la FK `ConceptoInsumo.insumo_id` (que no tiene `onDelete: Cascade`) si el chequeo
   de "en uso" tuviera algún hueco. El `LoteImportacion` se marca `revertido` para que no se
   pueda revertir dos veces.

5. **Permisos: reutilizar `requireRoles(...)`, sin rol nuevo.** El `DELETE` de fichas
   técnicas cambia de `requireRoles(...ROLES_FICHAS_UPLOAD)` a `requireRoles('admin')`
   (queda exclusivo de administración, sin roles operativos). Los tres `DELETE` de
   importaciones (presupuesto, lote de insumos, composición APU) usan
   `requireRoles('admin', 'gerencia_tecnica', 'control_proyectos')` — el mismo patrón de
   roles que ya comparten otros endpoints de gerencia-tecnica para operaciones de alto
   impacto (ej. `requireRoles('admin', 'superintendent', 'gerencia_tecnica',
   'control_proyectos', 'control_obra')` en main.ts:2133). Se excluye `superintendent` y
   `control_obra` de estos tres DELETE porque el pedido explícito es limitar la reversión de
   importaciones a quien las genera (Gerencia Técnica) y a quien gestiona el proyecto/CC
   (Control de Proyectos), además de `admin`.

## Risks / Trade-offs

- [Perder la capacidad de deshacer lotes viejos] → Aceptado como Non-Goal; se documenta en
  el proposal que solo las importaciones posteriores a este cambio son reversibles por lote.
- [Migración de Prisma agrega columnas nullable a tablas grandes (`Insumo`,
  `ConceptoInsumo`)] → Son columnas nullable sin default computado, migración de bajo riesgo
  (no reescribe datos existentes).
- [Un admin, gerencia_tecnica o control_proyectos podría revertir un lote por error y perder
  trabajo legítimo hecho encima] → Mitigado por el bloqueo 409 cuando hay uso real fuera del
  lote; el resto del riesgo se acepta porque los tres roles habilitados son quienes generan
  o son dueños del catálogo/presupuesto, no roles operativos externos (procurement,
  residencia, control_obra quedan fuera).
- [Compras/Gerencia Técnica/Residencia pierden la capacidad de borrar fichas técnicas que
  antes tenían] → Cambio de comportamiento intencional (**BREAKING**, documentado en el
  proposal); si algún flujo real dependía de que Compras corrigiera su propia ficha mal
  subida, ese caso pasa a requerir intervención de `admin`.

## Nota de implementación: RLS de la tabla nueva

`apps/gerencia-tecnica/prisma/rls-policies.sql` es un script separado (no gestionado por
Prisma) que este microservicio ya mantiene para RLS — ver
`fix-rls-gerencia-tecnica-tablas-sin-cobertura` (2026-07-26), que corrigió exactamente esta
misma clase de gap (tabla nueva sin `ENABLE`/`FORCE ROW LEVEL SECURITY` ni política). Se
agregó `lotes_importacion` a ese script con una política solo-tenant (mismo patrón que
`fichas_tecnicas_insumo`), aplicada contra la base de dev. Pendiente para el deploy real:
aplicar `rls-policies.sql` contra `bocam_gerencia_tecnica` en el VPS después de la migración
(paso ya establecido en el runbook de deploy de este servicio).

## Migration Plan

1. Migración Prisma: crear tabla `LoteImportacion`; agregar `lote_importacion_id` nullable
   (FK opcional a `LoteImportacion`) solo a `Insumo`.
2. Deploy del backend con los tres nuevos endpoints `DELETE` + el cambio de roles en el
   `DELETE` de fichas técnicas.
3. Deploy del frontend con el botón "Deshacer importación" (visible para `admin`,
   `gerencia_tecnica`, `control_proyectos`) y el ocultamiento del botón de eliminar ficha
   técnica para roles distintos de `admin`.
4. Rollback: si el cambio de roles en fichas técnicas causa fricción operativa inesperada,
   revertir solo ese `requireRoles(...)` a la lista anterior es un cambio de una línea,
   independiente de los endpoints nuevos (que pueden quedar activos sin problema).

## Open Questions

- ¿El bloqueo 409 de `DELETE /presupuestos/:id` debe listar qué conceptos tienen avances
  (para que quien revierte sepa qué revisar), o basta con un mensaje genérico? (asumido:
  mensaje genérico por ahora, se puede enriquecer después sin romper el contrato).

## Nota fuera de alcance (para un change futuro)

El usuario mencionó que, más adelante, el alta/baja/modificación de proyecto (donde se
genera el Centro de Costos) también debería poder hacerla Gerencia Técnica y Control de
Proyectos, no solo Administrador. Eso vive en `apps/auth` (o el microservicio que gestione
`Proyecto`/CC), no en gerencia-tecnica, así que queda **fuera de este change** y requiere su
propio spec cuando se decida abordarlo. Como referencia: `apps/auth/src/main.ts:45` ya
define `ROLES_ALTA_CENTRO_COSTOS = ['admin', 'gerencia_tecnica', 'control_proyectos']` para
el alta — habría que revisar si baja/modificación usan esa misma constante o una distinta.
