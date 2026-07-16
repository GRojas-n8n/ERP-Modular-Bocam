## 1. Gerencia Técnica — categoria_predominante + evento de sincronización

- [x] 1.1 Test (rojo primero): aprobar un `PresupuestoBase` con conceptos
      de distinta composición APU debe persistir
      `SaldoPartida.categoria_predominante` correcto (mismo algoritmo que
      `GET /reportes/control-presupuestal`).
      → Confirmado en rojo (2 tests nuevos en
      `saldo-partida.integration.test.ts`) antes del fix.
- [x] 1.2 `apps/gerencia-tecnica/prisma/schema.prisma`: agregar columna
      `categoria_predominante String?` a `SaldoPartida` (migración
      aditiva).
      → Migración `20260716120000_add_categoria_predominante_saldo_partida`,
      aplicada local vía SQL directo + `prisma migrate resolve --applied`
      (mismo patrón que otras migraciones del repo — `prisma migrate dev`
      no es viable en entorno no interactivo).
- [x] 1.3 `apps/gerencia-tecnica/src/main.ts` (`PATCH
      /presupuestos/:id/aprobar`): calcular `categoria_predominante` por
      concepto al hacer el `upsert` de `SaldoPartida` (extraer el
      algoritmo ya usado en el reporte de control presupuestal a una
      función compartida, reutilizarlo aquí).
      → Función `categoriaPredominante` extraída a nivel de módulo,
      reutilizada por `buildControlPresupuestal` (reporte) y el endpoint
      de aprobación — una sola fuente de verdad del algoritmo.
- [x] 1.4 Test (rojo primero): al aprobar un presupuesto con N conceptos,
      se publica `gerencia_tecnica.saldo_partida_creado` con el payload
      completo (array de partidas: `concepto_id`, `concepto_clave`,
      `concepto_desc`, `monto_aprobado`, `categoria_predominante`).
      → Nuevo archivo `saldo-partida-evento.integration.test.ts` con
      RabbitMQ real (probe subscriber vía `packages/event-bus`).
      Confirmado en rojo antes del fix.
- [x] 1.5 Publicar el evento `gerencia_tecnica.saldo_partida_creado`
      (best-effort) al final del `Promise.all` de creación de
      `SaldoPartida` en el endpoint de aprobación.
- [x] 1.6 Actualizar `openspec/specs/presupuesto-tope-partida/spec.md`
      (sync de este change al archivar): requirement de creación de
      `SaldoPartida` extendido, requirement nuevo de "nómina no
      compromete partida", y editar a mano la tabla de "Ciclo de vida del
      saldo por partida" para quitar las filas de nómina (la tabla no es
      un requirement formal, no se actualiza por delta automático).
      → Delta spec ya escrito y verificado contra la implementación real;
      la sincronización a `openspec/specs/` queda para el archivado final
      del change completo (sección 7), no por sección.
- [x] 1.7 `tsc --noEmit` y suite de integración de `gerencia-tecnica` en
      verde, sin regresión.
      → `tsc --noEmit` limpio. 7 archivos de test, todos en verde
      (incluye los 2 nuevos: `saldo-partida.integration.test.ts` 11/11,
      `saldo-partida-evento.integration.test.ts` 1/1).
- [x] 1.8 PR, CI verde, merge, redeploy VPS de `gerencia-tecnica`.
      → PR #77 mergeado (squash `4f6fc9a`). Redeploy VPS 2026-07-16:
      migración aplicada limpiamente (`prisma migrate deploy`), build
      limpio, contenedor recreado, healthy, logs de arranque sin errores.

## 2. Finanzas — schema + sincronización desde GT

- [x] 2.1 `apps/finanzas/prisma/schema.prisma`: agregar
      `concepto_id String? @db.Uuid` y `concepto_clave String? @db.VarChar(100)`
      a `PresupuestoAsignado` (migración aditiva, índice en
      `concepto_id`).
      → Migración `20260716130000_add_concepto_a_presupuesto_asignado` +
      índice único `uq_presupuesto_concepto` (permite múltiples
      `concepto_id = null` — Postgres trata cada NULL como distinto).
- [x] 2.2 Test (rojo primero): al recibir
      `gerencia_tecnica.saldo_partida_creado`, Finanzas crea/actualiza
      (upsert por `concepto_id`) un `PresupuestoAsignado` por cada
      partida del payload, con `capitulo` mapeado desde
      `categoria_predominante` (`MANO_DE_OBRA→MANO_OBRA`,
      `null→INDIRECTOS`), `estatus = 'ACTIVO'`, `codigo = concepto_clave`.
      → Nuevo archivo `sincronizacion-partida-gt.integration.test.ts`,
      RabbitMQ real. Confirmado en rojo (`handler is not a function`)
      antes del fix.
- [x] 2.3 Nuevo subscriber en `apps/finanzas/src/main.ts` para
      `gerencia_tecnica.saldo_partida_creado`, idempotente (upsert por
      `(tenant_id, proyecto_id, concepto_id)`).
      → `handleSaldoPartidaCreadoEvent`, exportado.
- [x] 2.4 Test (rojo primero): `GET
      /api/v1/finanzas/presupuestos/por-concepto/:conceptoId` retorna el
      `PresupuestoAsignado` sincronizado para esa partida, 404 si no
      existe.
- [x] 2.5 Implementar el endpoint anterior.
      → Registrado ANTES de `GET /presupuestos/:id` para no ser
      capturado por ese parámetro genérico.
- [x] 2.6 Test (rojo primero): `POST /api/v1/finanzas/presupuestos` con
      `capitulo` distinto de `MANO_OBRA` retorna 422 con mensaje
      explicando la sincronización automática; con `capitulo =
      'MANO_OBRA'` sigue funcionando como hoy.
- [x] 2.7 Restringir `POST /api/v1/finanzas/presupuestos` según el punto
      anterior.
      → Efecto colateral encontrado y corregido: el test e2e existente
      `seguridad.e2e.test.ts` creaba presupuestos sin `capitulo` (default
      `MATERIALES`) para probar el límite de autoridad financiera —
      ahora chocaba con el gate nuevo (422 antes de llegar al 403
      esperado). Corregido agregando `capitulo: 'MANO_OBRA'` al body del
      test, sin cambiar su intención original.
- [x] 2.8 Test (rojo primero): `PATCH` (si existe endpoint de edición de
      presupuesto) sobre un `PresupuestoAsignado` con `concepto_id !=
      null` retorna 422 — solo lectura.
      → N/A: no existe ningún endpoint `PATCH /presupuestos/:id` en el
      código actual (verificado con grep). Nada que restringir todavía;
      si se agrega en el futuro, debe respetar la decisión 9 del design.md.
- [x] 2.9 Implementar la restricción anterior si aplica.
      → N/A, ver 2.8.
- [x] 2.10 Test (rojo primero): al recibir `personal.nomina_autorizada`,
      se crea `MovimientoPresupuestal` tipo `COMPROMISO` sobre el
      `PresupuestoAsignado` `MANO_OBRA` `ACTIVO` del proyecto; sin ese
      presupuesto, no falla, solo genera alerta/log.
- [x] 2.11 Test (rojo primero): al recibir `personal.nomina_pagada`, se
      crea `MovimientoPresupuestal` tipo `EJERCIDO`, mueve monto de
      comprometido a ejercido.
- [x] 2.12 Test (rojo primero): eventos duplicados (mismo
      `prenomina_id`) no duplican el `MovimientoPresupuestal`.
      → Los 3 tests anteriores en
      `nomina-presupuesto-mano-obra.integration.test.ts` (4 tests, incluye
      también el caso "sin presupuesto no falla"), RabbitMQ real.
      Confirmados en rojo antes del fix.
- [x] 2.13 Implementar los 2 nuevos subscribers (`personal.nomina_autorizada`,
      `personal.nomina_pagada`) — capacidad `presupuesto-mano-obra-proyecto`.
      → `handleNominaAutorizadaEvent`/`handleNominaPagadaEvent`, exportados.
      No requirió NINGÚN cambio en `apps/personal` — los eventos ya
      existían con el payload completo.
- [x] 2.14 `tsc --noEmit` y suite de integración de `finanzas` en verde
      (incluye los 2 e2e y 5 integration existentes ya cubiertos por
      sesiones anteriores), sin regresión.
      → `tsc --noEmit` limpio. 9 archivos de test (7 existentes + 2
      nuevos), todos en verde tras corregir 2.7.
- [x] 2.15 PR, CI verde, merge, redeploy VPS de `finanzas`.
      → PR #78 mergeado (squash `d536910`). Redeploy VPS 2026-07-16:
      migración aplicada limpiamente, build limpio, contenedor recreado,
      healthy, suscrito a las 3 colas nuevas
      (`gerencia_tecnica.saldo_partida_creado`, `personal.nomina_autorizada`,
      `personal.nomina_pagada`).

## 3. Compras — resolución automática de presupuesto + eliminar doble-commit

- [ ] 3.1 Test (rojo primero): `convertir-oc` con una requisición que
      tiene `concepto_id` y SIN `presupuesto_id` en el body resuelve el
      presupuesto automáticamente vía
      `GET {FINANZAS_URL}/presupuestos/por-concepto/:conceptoId` y genera
      la OC.
- [ ] 3.2 Test (rojo primero): `convertir-oc` con requisición con
      `concepto_id` pero sin presupuesto sincronizado en Finanzas (404
      del endpoint anterior) retorna 422 con mensaje claro, sin generar
      OC.
- [ ] 3.3 Test (rojo primero): `convertir-oc` con requisición SIN
      `concepto_id` sigue exigiendo `presupuesto_id` en el body (400 si
      falta) — comportamiento de fallback sin regresión.
- [ ] 3.4 Implementar la resolución automática en
      `apps/compras/src/main.ts` (`convertir-oc`): mover la resolución de
      `conceptoId` antes de la validación de `presupuesto_id`; si hay
      `conceptoId`, resolver `presupuesto_id` automáticamente; si no,
      conservar el flujo actual.
- [ ] 3.5 Test (rojo primero): tras emitir una OC ligada a partida, ya NO
      se hace el POST directo a `{FINANZAS_URL}/comprometer-fondos` desde
      Compras — el compromiso en Finanzas llega vía el evento que GT ya
      dispara al comprometer el saldo de la partida (ver tarea 3.6).
- [ ] 3.6 Quitar la llamada `POST {FINANZAS_URL}/comprometer-fondos` del
      flujo de `convertir-oc` para OCs con `conceptoId` resuelto
      (conservarla como fallback para el caso sin `concepto_id`, si
      Finanzas aún depende de ese commit directo ahí).
- [ ] 3.7 `tsc --noEmit` y suite de integración/e2e de `compras` en
      verde, sin regresión (especial atención a los tests existentes de
      `convertir-oc` y de imprevistos/texto libre).
- [ ] 3.8 PR, CI verde, merge, redeploy VPS de `compras`.

## 4. GT — publicar evento al comprometer saldo (para el espejo de Finanzas)

- [ ] 4.1 Test (rojo primero): `POST
      /api/v1/gerencia-tecnica/partidas/:concepto_id/comprometer` publica
      un evento (nuevo o reutilizando uno existente) con el monto
      comprometido y la referencia de la OC, consumible por Finanzas para
      actualizar su espejo de `monto_comprometido`.
- [ ] 4.2 Implementar la publicación del evento.
- [ ] 4.3 Test (rojo primero) en Finanzas: al recibir ese evento,
      actualiza `monto_comprometido` del `PresupuestoAsignado` con ese
      `concepto_id`, crea `MovimientoPresupuestal` tipo `COMPROMISO` con
      `referencia_entidad: 'OrdenCompra'`.
- [ ] 4.4 Implementar el subscriber en Finanzas.
- [ ] 4.5 `tsc --noEmit` y suites de integración de `gerencia-tecnica` y
      `finanzas` en verde.
- [ ] 4.6 PR, CI verde, merge, redeploy VPS de ambos servicios.

## 5. app-shell — simplificar selector de presupuesto en ComparativaDetail

- [ ] 5.1 Test (RTL, rojo primero): con una requisición que tiene
      `concepto_id`, el diálogo de "Autorizar" NO muestra ningún selector
      de presupuesto y el `POST convertir-oc` se llama sin
      `presupuesto_id`.
- [ ] 5.2 Test (RTL, rojo primero): con una requisición sin
      `concepto_id`, el comportamiento de selector manual se conserva sin
      regresión.
- [ ] 5.3 Implementar en `apps/app-shell/src/components/ComparativaDetail.tsx`:
      condicionar el selector de presupuesto a la ausencia de
      `concepto_id` en la requisición.
- [ ] 5.4 `npm run build` limpio en `app-shell`, suite de
      `ComparativaDetail.*.test.tsx` en verde sin regresión.
- [ ] 5.5 PR, CI verde, merge, redeploy VPS de `app-shell`.

## 6. Migración de datos en producción

- [ ] 6.1 Verificar contra la BD real de producción: listar todos los
      `PresupuestoAsignado ACTIVO` con capítulo distinto de `MANO_OBRA`,
      por proyecto, y para cada proyecto verificar si ya tiene
      `PresupuestoBase APROBADO` en GT (con `SaldoPartida` sincronizado
      tras el despliegue de las secciones 1-4).
- [ ] 6.2 Script de un solo uso: para proyectos donde SÍ hay
      `SaldoPartida` sincronizado equivalente, marcar
      `estatus = 'CERRADO'` en los `PresupuestoAsignado` legacy de
      capítulos ligados a obra. NO tocar `MANO_OBRA`. NO tocar proyectos
      sin presupuesto de obra aprobado en GT todavía.
- [ ] 6.3 Verificar manualmente con al menos un proyecto real en
      producción que el flujo completo funciona de punta a punta:
      aprobar presupuesto en GT → ver presupuestos sincronizados en
      Finanzas → generar una requisición con esa partida → convertir a
      OC sin selector manual → ver el compromiso reflejado en ambos
      lados.

## 7. Cierre

- [ ] 7.1 Confirmar que las 4 specs delta (`presupuesto-mano-obra-proyecto`
      nueva, `presupuesto-tope-partida` y `presupuesto-resolucion-oc`
      modificadas) están sincronizadas a `openspec/specs/` incluyendo la
      edición manual de la tabla de ciclo de vida (tarea 1.6).
      Archivar el change.
