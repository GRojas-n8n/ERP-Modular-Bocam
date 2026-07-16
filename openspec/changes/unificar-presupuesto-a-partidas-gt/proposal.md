## Why

Hoy conviven dos sistemas de saldo presupuestal desacoplados sobre la
misma Orden de Compra: uno fino por partida real del contrato
(`SaldoPartida` en Gerencia Técnica, ligado a `Concepto`) y uno grueso por
capítulo de proyecto (`PresupuestoAsignado` en Finanzas, sin ninguna
relación con la partida real). Compras compromete **ambos en paralelo**
al generar una OC, sin que estén enlazados — pueden desincronizarse, y
Finanzas obliga a un usuario a crear manualmente un "presupuesto" que no
corresponde a ninguna partida real del contrato que ya existe en GT.

El usuario (dueño del producto) pidió explícitamente que los presupuestos
se manejen por partida del contrato, para que cada partida tenga su
propio presupuesto y las requisiciones se carguen a su partida
correspondiente — eso ya existe en GT (`Concepto` + `SaldoPartida`), pero
Finanzas nunca lo usa. Aparte, la nómina (fiscal y complementaria) es un
gasto recurrente que afecta a todo el proyecto y no encaja en el control
por partida — hoy no se conecta a ningún control presupuestal en
absoluto (verificado: cero referencias a presupuesto/partida en
`apps/personal`).

## What Changes

- `PresupuestoAsignado` (Finanzas) deja de ser una bolsa manual libre por
  capítulo para los 4 capítulos ligados a obra
  (`MATERIALES`/`SUBCONTRATOS`/`EQUIPOS`/`INDIRECTOS`): se agrega
  `concepto_id`/`concepto_clave` (UUID desnormalizado, sin FK cruzada,
  mismo patrón que `Requisicion.concepto_id` y `DetallePagoOC.concepto_id`
  ya usado en el repo) y pasa a **sincronizarse automáticamente 1:1 desde
  `Concepto`/`SaldoPartida` de GT** cuando GT aprueba un `PresupuestoBase`,
  en vez de crearse a mano. `POST /api/v1/finanzas/presupuestos` deja de
  aceptar la creación manual para estos 4 capítulos — **BREAKING** para
  ese subconjunto del endpoint (ver design.md para compatibilidad).
- El capítulo `MANO_OBRA` de `PresupuestoAsignado` se conserva **tal cual
  existe hoy** (bolsa a nivel proyecto, creación manual, sin
  `concepto_id`) — es exactamente el modelo que necesita la nómina. Se
  conecta por primera vez a los eventos que Personal YA publica
  (`personal.nomina_autorizada`, `personal.nomina_pagada`, sin cambios en
  `apps/personal`) para comprometer/ejercer contra ese presupuesto de
  proyecto.
- `POST /comparativas/:id/convertir-oc` (Compras) deja de requerir que el
  frontend envíe `presupuesto_id` manualmente — se resuelve automático a
  partir del `concepto_id` de la requisición origen (ya se calcula en el
  código, solo no se usaba para esto). El selector manual de presupuesto
  en `ComparativaDetail` (spec `presupuesto-resolucion-oc`) deja de ser
  necesario para OCs ligadas a una partida.
- El doble-commit de OC (Finanzas + GT en paralelo) se simplifica: GT
  (`SaldoPartida`) pasa a ser la única fuente de verdad para el gate de
  bloqueo; Finanzas sincroniza su copia local vía evento en vez de un
  segundo POST directo desde Compras — elimina el riesgo de
  desincronización descrito en el Why.
- Migración de datos: los `PresupuestoAsignado` reales ya creados en
  producción bajo capítulos ligados a obra (no `MANO_OBRA`) requieren un
  script de reconciliación (ver design.md) — no se borran a ciegas.

## Capabilities

### New Capabilities
- `presupuesto-mano-obra-proyecto`: define el bolsón de presupuesto a
  nivel proyecto para nómina (fiscal y complementaria), separado del
  control por partida, comprometido/ejercido automáticamente vía los
  eventos `personal.nomina_autorizada` y `personal.nomina_pagada` ya
  existentes.

### Modified Capabilities
- `presupuesto-tope-partida`: la fila de "Nómina autorizada/pagada" en el
  ciclo de vida de `SaldoPartida` (GT) se retira — la nómina ya NO
  compromete saldo de partida, compromete el nuevo presupuesto de mano de
  obra a nivel proyecto en Finanzas.
- `presupuesto-resolucion-oc`: el selector manual de presupuesto deja de
  ser necesario cuando la requisición tiene `concepto_id` — se resuelve
  automáticamente, incluyendo que `convertir-oc` ya no exige
  `presupuesto_id` en el body en ese caso. El selector manual y el envío
  de `presupuesto_id` quedan solo como fallback para requisiciones sin
  `concepto_id` (si existieran).

## Impact

- **Servicios afectados**: `apps/finanzas` (schema + endpoints de
  presupuestos + nuevo subscriber de eventos de nómina), `apps/compras`
  (flujo de `convertir-oc`, resolución automática de presupuesto,
  simplificación del doble-commit), `apps/gerencia-tecnica` (nuevo evento
  al crear `SaldoPartida`, ajuste de spec — sin cambio de schema),
  `apps/app-shell` (quitar/simplificar el selector manual de presupuesto
  en `ComparativaDetail`).
- **No afectado**: `apps/personal` (los eventos de nómina que necesita
  este change ya existen, sin cambios), `anticipo-proyecto`/`ProyectoFinanzas`
  (es la fuente de pago, ortogonal al techo presupuestal).
- **Migración de datos requerida** en producción — ver design.md.
- Requiere redeploy VPS de `finanzas`, `compras`, `gerencia-tecnica` y
  `app-shell` tras merge, en ese orden (ver tasks.md).
