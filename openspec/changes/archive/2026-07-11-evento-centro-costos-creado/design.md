## Context

`packages/event-bus/src/index.ts` es el bus compartido: exchange topic
`bocam.events` (durable), `EventBus.publish(event, opts)` y
`EventBus.subscribe(pattern, handler)`. Regla dura ya existente en el
código (`publish()` línea 153-156): **todo evento sin `tenant_id` y
`proyecto_id` en `context` se rechaza silenciosamente** (solo un
`console.error`, no lanza excepción) — no es negociable, el payload de este
evento debe traer ambos desde el primer commit.

Estado verificado por servicio (grep directo, no inferido):

| Servicio | EventBus hoy | Tabla de proyección de Proyecto |
|---|---|---|
| `auth` (publisher) | **no instalado** — no aparece en `package.json` ni en `main.ts` | — |
| `gerencia-tecnica` | propio (`event-bus.ts`), ya consume `compras.oc_creada/oc_cancelada`, `ventas.cotizacion_aceptada` | `ProyectoCostosConfig` (creación perezosa, `main.ts:1082-1090`) |
| `finanzas` | `packages/event-bus`, ya consume varios | `ProyectoFinanzas` (creación manual en endpoint de anticipo, `main.ts:1601-1619`) |
| `contabilidad` | `packages/event-bus`, mayor hub consumidor hoy | ninguna, todo FK directo |
| `control-proyectos`, `control-obra`, `compras` | `packages/event-bus`, ya consumen varios eventos | ninguna, todo FK directo |
| `almacen` | `packages/event-bus`, consume `compras.oc_recibida_total/parcial` | ninguna |
| `ventas`, `personal` | `packages/event-bus`, **solo `publish`, cero `subscribe`** | ninguna |
| `seguridad` | `eventBus.connect()` presente, **cero `subscribe`** | ninguna |
| `calidad` | **no instalado en absoluto** | ninguna |

`gerencia-tecnica` ya resuelve el `find`→`create` de `ProyectoCostosConfig`
sembrando además 10 categorías de gasto predefinidas
(`CATEGORIAS_PREDEFINIDAS`, `main.ts:1090-1099`) — ese seed debe moverse
también al handler del evento, no solo la fila de config.

No existe tabla de deduplicación de eventos en ningún consumidor. La
idempotencia real hoy se logra con `upsert`/`findUnique`+`create` sobre una
clave única de negocio (`@@unique([tenant_id, proyecto_id])`, ya presente en
`ProyectoCostosConfig` y `ProyectoFinanzas`) — no hay outbox pattern ni tabla
de eventos procesados en el codebase. Este change sigue esa misma
convención en vez de introducir un mecanismo nuevo.

## Goals / Non-Goals

**Goals:**
- Publicar `auth.centro_costos_creado` de forma confiable (best-effort
  at-least-once, ver Decisión 4) inmediatamente después de crear un
  `Proyecto`.
- Que `gerencia-tecnica` y `finanzas` dejen de depender de creación
  perezosa/manual para sus filas de proyección — se crean proactivamente al
  llegar el evento, de forma idempotente.
- Que los 9 módulos restantes (7 grupos B/C + auth-publisher no cuenta) más
  `seguridad`/`calidad` tengan un listener funcional que dé constancia de
  que el proyecto existe, sentando la base de EventBus para servicios que
  hoy no lo tienen.

**Non-Goals:**
- No se diseña aquí ninguna tabla de dominio nueva para `contabilidad`,
  `control-proyectos`, `control-obra`, `compras`, `almacen`, `ventas` o
  `personal` (Grupos B/C) — no hay un gap concreto identificado en estos 7
  servicios hoy (a diferencia de `gerencia-tecnica`/`finanzas`), así que
  diseñar una tabla ahora sería anticipar un requisito hipotético. Su
  listener es de solo registro/auditoría (`logInfo`).
- No se elimina la creación perezosa/manual existente en
  `gerencia-tecnica`/`finanzas` como código muerto — queda como fallback
  defensivo (ver Decisión 4), aunque en operación normal ya no debería
  activarse.
- No se implementa outbox pattern ni tabla de eventos-por-procesar — se
  acepta la ventana de pérdida descrita en la Decisión 4, igual que ya se
  aceptó una complejidad similar (reintento simple sin locks) en el design
  de `centro-costos-alta-formal` para el cálculo del consecutivo.
- No se toca el vocabulario ni las validaciones de negocio existentes de
  ningún consumidor — el evento es puramente aditivo.

## Decisions

### 1. Nombre del evento: `auth.centro_costos_creado`, no `administracion.centro_costos_creado`
El roadmap original del usuario usaba el prefijo `administracion.`, pero los
~16 eventos ya publicados en el sistema (`compras.oc_creada`,
`ventas.cotizacion_aceptada`, `gerencia_tecnica.partida_bloqueada`,
`personal.nomina_autorizada`, etc.) usan siempre `<módulo_publicador>.<evento>`
— el nombre real del directorio del servicio, no un dominio de negocio
genérico. `auth` es el publisher real, así que se usa `auth.centro_costos_creado`
para no introducir una segunda convención de nombres en el mismo exchange.
- **Alternativa descartada**: mantener `administracion.*` porque "sQ describe
  mejor el dominio". Se descarta por consistencia — un futuro consumidor que
  haga `subscribe('auth.*')` para depurar necesita que el nombre siga el
  patrón, y divergir aquí obliga a documentar una excepción sin beneficio
  real.

### 2. Payload del evento
```ts
interface CentroCostosCreadoPayload {
  proyecto_id: string;       // UUID, = context.proyecto_id (duplicado a propósito, ver nota)
  codigo_centro_costos: string;
  empresa_grupo: string;     // CIB | HCO | HSE | SEO
  anio_centro_costos: number;
  cliente_id: string | null;
  es_especial: boolean;
  estatus: string;           // vocabulario nuevo: ABIERTO | EN EJECUCIÓN | ...
  nombre_oficial: string;
  fecha_creacion: string;    // ISO 8601
}
```
`context.tenant_id` / `context.proyecto_id` (obligatorios por `EventBus`) ya
cubren el enrutamiento/aislamiento; `payload.proyecto_id` se duplica porque
todos los consumidores existentes (`gerencia-tecnica`, `finanzas`, etc.)
leen sus IDs desde `event.payload`, no desde `event.context`, y mantener esa
convención evita un caso especial solo para este evento.
- **Alternativa descartada**: enviar el objeto `Proyecto` completo de
  Prisma. Se descarta porque expone columnas internas/futuras sin control de
  compatibilidad — un evento es un contrato público entre servicios, no un
  dump de tabla.

### 3. Profundidad de implementación por grupo de consumidor
Grupo A (`gerencia-tecnica`, `finanzas`) reemplaza su mecanismo de creación
perezosa/manual por un `upsert` proactivo en el handler del evento — es un
reemplazo 1:1 de lógica que ya existe, bajo riesgo.
Grupos B/C/D (`contabilidad`, `control-proyectos`, `control-obra`,
`compras`, `almacen`, `ventas`, `personal`, `seguridad`, `calidad`) reciben
un listener mínimo: `logInfo` estructurado (mismo helper de auditoría que ya
usan los endpoints admin) confirmando que el proyecto fue registrado, sin
persistir una tabla nueva.
- **Alternativa descartada**: diseñar una tabla `proyecto_registro` genérica
  compartida por los 7 servicios débiles. Se descarta porque ningún caso de
  uso concreto la necesita hoy — sería exactamente el tipo de abstracción
  prematura que este proyecto evita (ver reglas del repo); si `contabilidad`
  termina necesitando provisionar una `CuentaContable` al nacer el proyecto,
  eso amerita su propio spec futuro con el dueño de ese dominio, no una
  suposición hecha aquí.

### 4. Entrega: publish después del commit, sin outbox
`apps/auth` publica el evento **después** de que el `create` de `Proyecto`
se confirma en Postgres (no dentro de la misma transacción — RabbitMQ no
participa en transacciones de Postgres). Si el proceso de `auth` muere entre
el commit y el `publish`, el evento se pierde y los consumidores nunca se
enteran hasta que algo dispare su fallback perezoso/manual (Grupo A) o hasta
que un admin corra el alta manualmente en cada servicio (Grupos B/C/D, caso
raro).
- **Mitigación**: se acepta este riesgo explícitamente — las altas de centro
  de costos son eventos de bajo volumen (mismo argumento que la Decisión 3
  del design de `centro-costos-alta-formal` para el consecutivo), y Grupo A
  conserva su mecanismo perezoso/manual como red de seguridad, así que una
  pérdida de evento en ese grupo se autocorrige en el peor caso al primer
  uso real, no queda roto permanentemente.
- **Alternativa descartada**: transactional outbox (tabla `outbox_events` +
  worker que publica y reintenta). Se descarta por complejidad no
  justificada por el volumen — no existe ese patrón en ningún otro punto del
  codebase hoy, y agregarlo solo para este evento sería inconsistente con el
  resto del sistema.

### 5. Bootstrap de EventBus en `auth`, `seguridad`, `calidad`
Los 3 servicios sin `EventBus` funcional (`auth` sin instalar,
`seguridad` conectado pero sin `subscribe`, `calidad` sin nada) siguen
exactamente el patrón ya usado por la mayoría (`contabilidad`,
`control-obra`, etc.): `createEventBus('<nombre-servicio>')` en el arranque,
`.connect()` antes de levantar el servidor HTTP, `.subscribe(pattern,
handler)` por cada evento de interés. `gerencia-tecnica` usa un
`event-bus.ts` propio en vez del paquete compartido — no se migra a
`packages/event-bus` como parte de este change (fuera de alcance, no hay
bug que lo justifique).
- **Alternativa descartada**: unificar `gerencia-tecnica` al paquete
  compartido de una vez que se está tocando el archivo. Se descarta por
  disciplina de alcance — CLAUDE.md prohíbe refactors no pedidos sobre
  código legacy sin su propio spec.

## Risks / Trade-offs

- **[Riesgo]** `calidad` y `seguridad` instalan infraestructura de mensajería
  por primera vez — un error de conexión ahí podría, en teoría, afectar la
  estabilidad del servicio si el manejo de errores no sigue el patrón
  defensivo ya usado (`EventBus.connect()` nunca lanza, solo loguea y
  reintenta con backoff).
  → **Mitigación**: reusar `createEventBus`/`.connect()` tal cual —el
    paquete ya es defensivo por diseño (ver `connect()` en
    `packages/event-bus/src/index.ts:89-140`, nunca hace throw)— y agregar
    smoke test post-deploy de que el servicio sigue `healthy` sin
    `RABBITMQ_URL` mal configurado.
- **[Riesgo]** El seed de 10 categorías predefinidas que hoy ocurre en
  `getOrCreateProyectoConfig` (`gerencia-tecnica`) se duplica si el evento
  llega Y luego se dispara el fallback perezoso para el mismo proyecto antes
  de que el evento haya sido procesado (carrera).
  → **Mitigación**: el `create` de `ProyectoCostosConfig` sigue protegido
    por `@@unique([tenant_id, proyecto_id])` (ya existe); el handler del
    evento y `getOrCreateProyectoConfig` deben compartir la misma función de
    "crear si no existe + sembrar categorías", así la segunda llamada
    (evento o fallback, la que llegue después) hace no-op sobre el
    `findUnique` en vez de duplicar categorías.
- **[Riesgo]** Evento perdido (Decisión 4) dejaría a `contabilidad` u otro
  consumidor de Grupo B/C sin registro, sin ningún mecanismo de
  reconciliación.
  → **Mitigación**: aceptado explícitamente — estos grupos son de solo
    logging en este change, no hay dato de negocio en riesgo de quedar
    inconsistente.

## Migration Plan

1. `auth`: instalar `@bocam/event-bus`, publicar el evento tras el `create`
   existente (sin cambiar el contrato del endpoint HTTP).
2. Desplegar `auth` primero y confirmar en logs que publica
   (`📤 Publicado: auth.centro_costos_creado`) al crear un proyecto de
   prueba — sin esto, no tiene sentido desplegar consumidores.
3. Desplegar Grupo A (`gerencia-tecnica`, `finanzas`) — mayor riesgo por
   reemplazar lógica existente, requiere verificación manual de que la
   creación proactiva y el fallback perezoso/manual no chocan (Riesgo 2).
4. Desplegar Grupos B/C/D en cualquier orden — listeners de solo lectura/log,
   riesgo bajo, no dependen entre sí.
5. Rollback: cada servicio es independiente (deploy por contenedor,
   `docker compose up -d <servicio>`); si un consumidor falla, se revierte
   solo ese contenedor a la imagen anterior sin afectar a `auth` ni a los
   demás consumidores — el evento seguía llegando a RabbitMQ, el consumidor
   caído simplemente no lo procesó (se pierde para Grupos B/C/D, se
   autocorrige en Grupo A vía fallback).

## Open Questions
- ¿Alguno de los 7 servicios de Grupo B/C tiene, en la práctica, una
  necesidad real de provisionar algo al nacer un proyecto (ej.
  `contabilidad` creando una `CuentaContable`) que el dueño del negocio ya
  tenga en mente? Si sí, amerita un change dedicado posterior — no se
  intenta adivinar aquí.
