## Why

Desde `centro-costos-alta-formal` (archivado 2026-07-10), `apps/auth` es la
única fuente de verdad de qué proyectos/centros de costos existen, pero
ningún otro microservicio se entera cuando nace uno. (Nota de nomenclatura:
el roadmap original del usuario lo llamó `administracion.centro_costos_creado`,
pero la convención real del código es `<módulo_publicador>.<evento>` —
ej. `compras.oc_creada`, `ventas.cotizacion_aceptada`,
`gerencia_tecnica.partida_bloqueada` — así que este change usa
`auth.centro_costos_creado` para ser consistente con los ~16 eventos ya
existentes.) Cada módulo resuelve
esto por su cuenta y de forma inconsistente: `gerencia-tecnica` crea
`ProyectoCostosConfig` de forma perezosa en el primer uso
(`main.ts:1083-1090`, `find` → `create` on-demand), `finanzas` crea
`ProyectoFinanzas` solo cuando alguien registra el primer anticipo
(`main.ts:1601-1619`, con un fallback `?? { anticipo_total: 0, ... }` que
delata que la fila normalmente no existe), y el resto de los módulos no
tiene ninguna señal de que un proyecto nuevo existe hasta que llega el
primer dato transaccional relacionado. Este change publica el evento que
quedó explícitamente diferido en el change anterior (punto 3 del roadmap del
usuario) para que el ciclo de vida de un centro de costos sea explícito y
proactivo en vez de inferido perezosamente.

## What Changes

- `apps/auth` **instala `@bocam/event-bus` por primera vez** (no lo tiene
  hoy, verificado en `package.json` y `main.ts`) y publica
  `auth.centro_costos_creado` en el exchange `bocam.events`
  (topic, ya existente) inmediatamente después de confirmar la creación de
  un `Proyecto` en `POST /api/v1/auth/admin/proyectos`.
- `gerencia-tecnica` y `finanzas` (Grupo A — huecos reales) reemplazan su
  creación perezosa/manual de la fila de proyección de proyecto por creación
  proactiva al recibir el evento, vía `upsert` idempotente sobre la clave
  natural (mismo patrón que `ProyectoObraVinculado` en gerencia-tecnica).
- `contabilidad`, `control-proyectos`, `control-obra` y `compras` (Grupo B)
  agregan un listener que registra la existencia del proyecto para las
  validaciones/reportes que ya hacen sobre `proyecto_id`, sin tabla de
  proyección nueva salvo que el spec de cada uno la justifique.
- `almacen`, `ventas` y `personal` (Grupo C) agregan un listener liviano
  (registro/log) — para `ventas` y `personal` es su primer consumidor de
  eventos, hoy solo publican.
- `seguridad` y `calidad` (Grupo D) **instalan el EventBus por primera vez**
  siguiendo el patrón ya establecido en `packages/event-bus/src`
  (`createEventBus`, `.connect()`, `.subscribe()`) y lo usan para consumir
  este evento — `seguridad` ya tiene `eventBus.connect()` sin ningún
  `subscribe`; `calidad` no tiene EventBus en absoluto.
- **BREAKING**: ninguno — el evento es aditivo; los flujos existentes
  (creación perezosa/manual) siguen funcionando como fallback si el evento
  no ha llegado aún (ej. reconexión de RabbitMQ), no se eliminan como parte
  de este change.

## Capabilities

### New Capabilities
- `evento-centro-costos-creado`: publicación del evento
  `auth.centro_costos_creado` desde `apps/auth` y su consumo por
  los 11 microservicios de negocio, incluyendo el payload del evento, la
  garantía de entrega (at-least-once + upsert idempotente en el consumidor)
  y el bootstrap de EventBus en `seguridad` y `calidad`.

### Modified Capabilities
(ninguna — no existe spec previo para la publicación/consumo de eventos de
centro de costos; los specs de dominio de cada módulo consumidor no cambian
sus requisitos, solo ganan un mecanismo de sincronización adicional)

## Impact

- **Backend `apps/auth`**: **no tiene `@bocam/event-bus` instalado hoy**
  (verificado: no aparece en `package.json` ni se importa en `main.ts`) — se
  instala desde cero, igual que en `calidad`, y se usa para publicar el
  evento tras el `create` de `POST /api/v1/auth/admin/proyectos`.
- **Backend `apps/gerencia-tecnica`**: `src/main.ts` / `src/event-bus.ts`
  (nuevo `subscribe('auth.centro_costos_creado', ...)`, reemplaza
  el `find`→`create` perezoso de `ProyectoCostosConfig`).
- **Backend `apps/finanzas`**: `src/main.ts` (nuevo subscribe, reemplaza la
  creación manual de `ProyectoFinanzas` en el endpoint de anticipo).
- **Backend `apps/contabilidad`, `apps/control-proyectos`,
  `apps/control-obra`, `apps/compras`**: nuevo `subscribe` sobre su
  `EventBus` ya existente.
- **Backend `apps/almacen`, `apps/ventas`, `apps/personal`**: nuevo
  `subscribe` — primer consumidor de eventos en `ventas` y `personal`.
- **Backend `apps/seguridad`**: primer `subscribe` real (ya tiene
  `eventBus.connect()` sin uso).
- **Backend `apps/calidad`**: instalación de `@bocam/event-bus` desde cero
  (dependencia nueva en `package.json`, inicialización en `main.ts`).
- **Infraestructura**: ninguna — reutiliza el exchange `bocam.events` y el
  patrón `packages/event-bus/src` ya desplegados; no requiere cambios en
  `docker-compose.vps.yml`.
