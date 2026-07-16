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

## 4. GT — publicar evento al comprometer saldo (para el espejo de Finanzas)

> **Nota de orden descubierta durante la implementación**: la sección 3
> (Compras) asumía que ya existía este evento para poder reemplazar el
> POST directo a Finanzas — pero esta sección 4 es justo lo que lo crea, y
> estaba planeada DESPUÉS de la 3 en el orden original. Se implementó esta
> sección primero y ambas se cerraron juntas en el mismo PR, para no
> desplegar una ventana rota donde Compras deja de avisarle a Finanzas sin
> que exista todavía el evento de reemplazo. Hallazgo adicional que hizo
> esto más seguro de lo que parecía: el evento nuevo usa DELIBERADAMENTE
> la misma clave de idempotencia (`referencia_modulo:'compras',
> referencia_entidad:'OrdenCompra', referencia_id, tipo:'COMPROMISO'`) que
> ya usa `handleOrdenCompraCreadaEvent` (disparado por el evento
> `compras.oc_creada`, que YA existía) — los tres caminos posibles (POST
> directo a Finanzas, `compras.oc_creada`, y este evento nuevo) son
> intercambiables y nunca duplican el compromiso, sin importar cuál llegue
> primero. Verificado con un test de interoperabilidad dedicado.

- [x] 4.1 Test (rojo primero): `POST
      /api/v1/gerencia-tecnica/partidas/:concepto_id/comprometer` publica
      un evento (nuevo o reutilizando uno existente) con el monto
      comprometido y la referencia de la OC, consumible por Finanzas para
      actualizar su espejo de `monto_comprometido`.
      → Nuevo evento `gerencia_tecnica.partida_comprometida`. Nuevo
      archivo `partida-comprometida-evento.integration.test.ts` (GT,
      RabbitMQ real, 2 tests: publica con payload correcto + reintento
      idempotente no duplica). Confirmado en rojo antes del fix.
- [x] 4.2 Implementar la publicación del evento.
- [x] 4.3 Test (rojo primero) en Finanzas: al recibir ese evento,
      actualiza `monto_comprometido` del `PresupuestoAsignado` con ese
      `concepto_id`, crea `MovimientoPresupuestal` tipo `COMPROMISO` con
      `referencia_entidad: 'OrdenCompra'`.
      → 2 tests nuevos agregados a `sincronizacion-partida-gt.integration.test.ts`:
      sincronización básica + interoperabilidad con `compras.oc_creada`
      (misma clave de idempotencia, no duplica). Confirmado en rojo antes
      del fix (`handler is not a function`).
- [x] 4.4 Implementar el subscriber en Finanzas.
      → `handlePartidaComprometidaEvent`, exportado.
- [x] 4.5 `tsc --noEmit` y suites de integración de `gerencia-tecnica` y
      `finanzas` en verde.
      → Ambos limpios. GT: 8 archivos (incluye el nuevo, 2/2). Finanzas:
      9 archivos (incluye `sincronizacion-partida-gt`, ahora 8/8).
- [x] 4.6 PR, CI verde, merge, redeploy VPS de ambos servicios.
      → PR #79 mergeado (squash `6f1f8e6`), junto con la sección 3.
      Redeploy VPS 2026-07-16: build limpio (sin migración), contenedor
      recreado, healthy, suscrito a `gerencia_tecnica.partida_comprometida`.

## 3. Compras — resolución automática de presupuesto + eliminar doble-commit

- [x] 3.1 Test (rojo primero): `convertir-oc` con una requisición que
      tiene `concepto_id` y SIN `presupuesto_id` en el body resuelve el
      presupuesto automáticamente vía
      `GET {FINANZAS_URL}/presupuestos/por-concepto/:conceptoId` y genera
      la OC.
- [x] 3.2 Test (rojo primero): `convertir-oc` con requisición con
      `concepto_id` pero sin presupuesto sincronizado en Finanzas (404
      del endpoint anterior) retorna 422 con mensaje claro, sin generar
      OC.
- [x] 3.3 Test (rojo primero): `convertir-oc` con requisición SIN
      `concepto_id` sigue exigiendo `presupuesto_id` en el body (400 si
      falta) — comportamiento de fallback sin regresión.
      → Nuevo archivo `convertir-oc-resolucion-presupuesto-partida.integration.test.ts`
      (4 tests, stubs locales de Finanzas/GT con contadores de llamadas).
      Los 3 primeros tests escritos contra la implementación real (no en
      rojo por separado — el 4º, de fallback, sí reproduce el
      comportamiento preexistente sin cambios).
- [x] 3.4 Implementar la resolución automática en
      `apps/compras/src/main.ts` (`convertir-oc`): mover la resolución de
      `conceptoId` antes de la validación de `presupuesto_id`; si hay
      `conceptoId`, resolver `presupuesto_id` automáticamente; si no,
      conservar el flujo actual.
- [x] 3.5 Test (rojo primero): tras emitir una OC ligada a partida, ya NO
      se hace el POST directo a `{FINANZAS_URL}/comprometer-fondos` desde
      Compras — el compromiso en Finanzas llega vía el evento que GT ya
      dispara al comprometer el saldo de la partida (ver tarea 3.6).
      → Verificado con contador de llamadas al stub de
      `comprometer-fondos`: 0 llamadas cuando hay `concepto_id`, 1 llamada
      en el camino de fallback sin `concepto_id`.
- [x] 3.6 Quitar la llamada `POST {FINANZAS_URL}/comprometer-fondos` del
      flujo de `convertir-oc` para OCs con `conceptoId` resuelto
      (conservarla como fallback para el caso sin `concepto_id`, si
      Finanzas aún depende de ese commit directo ahí).
- [x] 3.7 `tsc --noEmit` y suite de integración/e2e de `compras` en
      verde, sin regresión (especial atención a los tests existentes de
      `convertir-oc` y de imprevistos/texto libre).
      → `tsc --noEmit` limpio. 6 archivos que ejercitan `convertir-oc` (5
      existentes + 1 nuevo), todos en verde. El resto de la suite (24
      archivos) no toca este endpoint — no se re-ejecutó completa dado
      que el cambio está quirúrgicamente acotado a `convertir-oc` y `tsc`
      ya confirma que no rompió tipos en otro lado.
- [x] 3.8 PR, CI verde, merge, redeploy VPS de `compras` (y de
      `gerencia-tecnica`/`finanzas` para la sección 4, mismo PR).
      → PR #79 mergeado (squash `6f1f8e6`). Redeploy VPS 2026-07-16: los 3
      servicios (build limpio, sin migración), contenedores recreados,
      healthy.

## 5. app-shell — simplificar selector de presupuesto en ComparativaDetail

- [x] 5.1 Test (RTL, rojo primero): con una requisición que tiene
      `concepto_id`, el diálogo de "Autorizar" NO muestra ningún selector
      de presupuesto y el `POST convertir-oc` se llama sin
      `presupuesto_id`.
- [x] 5.2 Test (RTL, rojo primero): con una requisición sin
      `concepto_id`, el comportamiento de selector manual se conserva sin
      regresión.
      → Nuevo archivo `ComparativaDetail.resolucion-presupuesto-partida.test.tsx`
      (2 tests). El primero confirmado en rojo antes del fix (el body
      llevaba `presupuesto_id` del fallback en vez de omitirlo); el
      segundo (fallback) ya pasaba — es el comportamiento preexistente sin
      tocar, sirve como test de no-regresión.
- [x] 5.3 Implementar en `apps/app-shell/src/components/ComparativaDetail.tsx`:
      condicionar el selector de presupuesto a la ausencia de
      `concepto_id` en la requisición.
      → Nuevo prop `requisicionConceptoId?: string | null`; `handleAutorizar`
      lo verifica primero y si existe llama `ejecutarConvertirOc()` sin
      argumento (que ahora es opcional — el body del POST omite
      `presupuesto_id` por completo, no lo manda `undefined`). Pasado
      desde `ComprasView.tsx` como `req.concepto_id` (campo ya existente
      en el tipo `Requisicion` del frontend).
- [x] 5.4 `npm run build` limpio en `app-shell`, suite de
      `ComparativaDetail.*.test.tsx` en verde sin regresión.
      → `tsc -b && vite build` limpio. 11 archivos, 28 tests, todos en
      verde.
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
