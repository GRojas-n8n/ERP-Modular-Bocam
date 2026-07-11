## 1. Publisher — apps/auth

- [x] 1.1 Agregar `@bocam/event-bus` como dependencia de `apps/auth`
      (`package.json`) — no está instalado hoy.
      **Nota**: `packages/*` se consumen vía import relativo
      (`../../../packages/event-bus/src`), no como paquete npm publicado —
      lo que se agregó a `package.json` fue `amqplib`/`@types/amqplib`
      (dependencia real de `packages/event-bus/src`), igual que en
      `contabilidad`.
- [x] 1.2 Inicializar `createEventBus('auth')` + `.connect()` en el arranque
      del servicio, antes de levantar el servidor HTTP (mismo patrón que
      `contabilidad`/`control-obra`). `eventBus.close()` agregado también a
      los handlers de `SIGINT`/`SIGTERM`.
- [x] 1.3 En `POST /api/v1/auth/admin/proyectos` (`apps/auth/src/main.ts`),
      tras confirmar el `create` del `Proyecto`, publicar
      `auth.centro_costos_creado` con `context.tenant_id`/`context.proyecto_id`
      y el payload definido en `design.md` (`proyecto_id`,
      `codigo_centro_costos`, `empresa_grupo`, `anio_centro_costos`,
      `cliente_id`, `es_especial`, `estatus`, `nombre_oficial`,
      `fecha_creacion`).
- [x] 1.4 Confirmar que un fallo de `publish` (canal no disponible) NO
      revierte ni bloquea la respuesta HTTP 201 de creación del proyecto
      (test: mockear `EventBus.publish` para que retorne `false` y verificar
      que el endpoint sigue respondiendo éxito).
      Verificado con test que hace que `publish` lance una excepción: el
      proyecto se sigue creando y persistiendo en BD, la respuesta sigue
      siendo 201.
- [x] 1.5 Test de integración: crear un proyecto vía el endpoint y verificar
      que se llama a `publish` con el `event_type`/payload correctos.
      `apps/auth/test/integration/evento-centro-costos-creado.integration.test.ts`
      — exporta `eventBus` desde `main.ts` para poder reemplazar
      `.publish` por un spy en memoria (sin depender de RabbitMQ real).
      2/2 tests pasan; se corrió también el test existente
      `centro-costos-alta.integration.test.ts` sin regresiones.

## 2. Consumidor: gerencia-tecnica (reemplaza creación perezosa)

- [x] 2.1 Extraer la lógica de `getOrCreateProyectoConfig`
      (`apps/gerencia-tecnica/src/main.ts:1082-1099`, incluye el seed de las
      10 `CATEGORIAS_PREDEFINIDAS`) a una función reutilizable que tanto el
      handler del evento como el `getOrCreate` perezoso existente puedan
      invocar, sin duplicar código.
      **Nota**: ya estaba extraída como función standalone en el código
      existente — no requirió refactor, solo invocarla desde el nuevo
      handler.
- [x] 2.2 Suscribir `auth.centro_costos_creado` en el `event-bus.ts` propio
      de gerencia-tecnica, invocando la función extraída en 2.1.
      Nuevo handler `handleCentroCostosCreadoEvent` (junto a
      `handleCotizacionAceptadaEvent`, `main.ts`) suscrito en `bootstrap()`
      junto a las otras 3 suscripciones existentes.
- [x] 2.3 Test: evento nuevo para un `proyecto_id` sin actividad previa crea
      `ProyectoCostosConfig` + siembra las 10 categorías.
- [x] 2.4 Test: si `ProyectoCostosConfig` ya existe (creado antes por el
      fallback perezoso), el handler del evento no duplica la fila ni las
      categorías.
      `apps/gerencia-tecnica/test/integration/evento-centro-costos-creado.integration.test.ts`
      — 3 casos: evento nuevo (2.3), reentrega del mismo evento 3 veces
      (2.4), y el escenario explícito del spec donde el fallback perezoso
      (vía GET real `/categorias-gasto`) toca el proyecto ANTES de que
      llegue el evento (2.4b) — los 3 pasan. Se corrió también
      `ventas-a-obra.integration.test.ts` (no tocado): falla por un
      desajuste preexistente de schema (`gerencia_tecnica` hardcodeado en
      SQL crudo vs `schema=public` del Postgres local), confirmado
      no-relacionado con este change (`git status` del archivo limpio).

## 3. Consumidor: finanzas (reemplaza creación manual)

- [x] 3.1 Suscribir `auth.centro_costos_creado` en `apps/finanzas` (usa
      `packages/event-bus`, ya tiene otras suscripciones en `main.ts:2366`
      como referencia de patrón).
- [x] 3.2 Handler: `upsert` de `ProyectoFinanzas` por `(tenant_id,
      proyecto_id)` con `anticipo_total = 0` / `anticipo_usado = 0` solo si
      no existe — no sobreescribir si ya existe (creada por el flujo manual
      de `POST /api/v1/finanzas/proyectos/:id/anticipo`).
      Nuevo `handleCentroCostosCreadoEvent` (`main.ts`, antes de
      `handleOrdenCompraCreadaEvent`) con `upsert` cuyo `update: {}` es
      intencionalmente un no-op — nunca sobreescribe valores reales.
- [x] 3.3 Test: proyecto nuevo crea la fila con valores en 0.
- [x] 3.4 Test: proyecto con anticipo ya registrado manualmente antes de que
      llegue el evento no pierde esos valores.
      `apps/finanzas/test/integration/evento-centro-costos-creado.integration.test.ts`
      — a diferencia de auth/gerencia-tecnica, los tests de `finanzas` ya
      seguían el patrón de publicar/consumir sobre RabbitMQ real (no invocar
      el handler directo), así que este test lo siguió por consistencia con
      el resto del módulo. 2/2 casos pasan; se corrió también
      `control-obra.avance-validado.integration.test.ts` (no tocado) sin
      regresiones.

## 4. Consumidores de registro liviano (Grupos B/C)

- [x] 4.1 `contabilidad`: suscribir `auth.centro_costos_creado`, `logInfo`
      estructurado con `tenant_id`/`proyecto_id`/`codigo_centro_costos`.
      **Nota**: `logInfo` de `packages/observability` requiere un `req`
      (Express) — no es usable en un handler de evento. Se usó el mismo
      patrón `console.log(JSON.stringify({action:...}))` que ya usan los
      demás handlers de evento de este mismo archivo (`handleNominaPagadaEvent`
      etc.), no `logInfo`. Se agregó `CENTRO_COSTOS_CREADO` a
      `ContabilidadConsumedEvents` (types.ts) por consistencia con el enum
      existente. Sin efecto en dominio contable — Open Question del
      design.md sobre provisión de `CuentaContable` queda pendiente para un
      change futuro.
- [x] 4.2 `control-proyectos`: ídem 4.1.
- [x] 4.3 `control-obra`: ídem 4.1.
- [x] 4.4 `compras`: ídem 4.1.
- [x] 4.5 `almacen`: ídem 4.1.
- [x] 4.6 `ventas`: ídem 4.1 — primer `subscribe` del servicio, verificar
      que el `EventBus` ya inicializado (usado hoy solo para `publish`,
      `main.ts:181`) soporta agregar un `subscribe` sin romper el publish
      existente.
      Confirmado: `eventBus.connect()` + `eventBus.subscribe(...)` conviven
      sin problema con el `publish` existente de `ventas.cotizacion_aceptada`.
- [x] 4.7 `personal`: ídem 4.6 (primer `subscribe`, hoy solo `publish` en
      `main.ts:564,607`).
      Test: `apps/<servicio>/test/integration/evento-centro-costos-creado.integration.test.ts`
      en cada uno de los 7 servicios (invocación directa del handler
      exportado + captura de `console.log`, sin necesitar RabbitMQ real ya
      que son handlers puros sin I/O) — 7/7 pasan, todos compilan limpio
      (`tsc --noEmit`).

## 5. Bootstrap de EventBus: seguridad y calidad

- [x] 5.1 `seguridad`: agregar el primer `subscribe('auth.centro_costos_creado',
      ...)` sobre el `eventBus.connect()` ya existente
      (`main.ts:651`) — `logInfo` de registro, mismo patrón que grupo 4.
      (Igual que en 4.1, se usó `console.log(JSON.stringify(...))`, no
      `logInfo` — ese helper requiere `req` de Express.) Verificado contra
      RabbitMQ local real: conecta y se suscribe sin error
      (`📥 Suscrito: auth.centro_costos_creado`).
- [x] 5.2 `calidad`: agregar `@bocam/event-bus` como dependencia nueva
      (`package.json`), inicializar `createEventBus('calidad')` +
      `.connect()` en el arranque, y suscribir
      `auth.centro_costos_creado` con `logInfo` de registro.
      Instalado `amqplib`/`@types/amqplib` (igual que en 1.1, `calidad` no
      tenía ninguna dependencia de mensajería). `startServer()` en este
      servicio se ejecuta sin guardia `require.main === module` (se corre
      siempre al importar el módulo) — se respetó ese patrón existente en
      vez de introducir uno nuevo.
- [x] 5.3 Verificar que ambos servicios siguen arrancando y respondiendo
      `/health` con normalidad si `RABBITMQ_URL` no está configurado en su
      entorno (comportamiento defensivo de `EventBus.connect()`).
      Verificado manualmente (script temporal, eliminado): `calidad` con
      conexión a RabbitMQ fallando (credenciales inválidas del entorno
      local) — servidor arrancó, `/health` respondió 200. `seguridad`
      arrancó y conectó/suscribió correctamente contra RabbitMQ local real.
      Se corrió también `workflow-nc.integration.test.ts` de `calidad` (no
      tocado, tras aplicar `prisma db push` local para las tablas
      faltantes): 3/4 pasan, 1 falla preexistente de RBAC no relacionada
      con este change (confirmado con `git stash`).

## 6. Despliegue y verificación en producción (orden del Migration Plan)

- [ ] 6.1 Desplegar `apps/auth` primero (contiene el publisher). Verificar
      en logs del VPS que publica (`📤 Publicado: auth.centro_costos_creado`)
      al crear un proyecto de prueba real en producción.
- [ ] 6.2 Desplegar `gerencia-tecnica` y `finanzas` (Grupo A). Verificar en
      BD que, al crear un proyecto de prueba, aparecen `ProyectoCostosConfig`
      (con 10 categorías) y `ProyectoFinanzas` (en 0) sin intervención
      manual.
- [ ] 6.3 Desplegar el resto de los consumidores (Grupos B/C/D:
      `contabilidad`, `control-proyectos`, `control-obra`, `compras`,
      `almacen`, `ventas`, `personal`, `seguridad`, `calidad`). Verificar en
      logs de cada uno que reciben y confirman (`ack`) el evento del mismo
      proyecto de prueba.
- [ ] 6.4 Limpiar cualquier dato de prueba creado durante 6.1-6.3 en todas
      las bases tocadas.
- [ ] 6.5 Actualizar memoria/roadmap del usuario: punto 3 del roadmap de 21
      puntos pasa de pendiente a completado.
