## Context

`apps/asistente/src/routes/chat.ts` construye hoy el runner así:

```ts
const runner = anthropic.beta.messages.toolRunner({ model, max_tokens, system, messages, tools, ... });
const finalMessage = await runner.runUntilDone();
```

`runUntilDone()` resuelve una sola promesa con el mensaje final del turno completo — no hay
forma de observar qué tool se está ejecutando mientras el turno avanza. El SDK de Anthropic
soporta construir el runner con `stream: true`; al iterarlo, cada elemento ya no es un
mensaje resuelto sino un **stream** de eventos de esa iteración del turno (un turno puede
tener varias iteraciones si Claude encadena tool calls). Cada stream expone los eventos
estándar de Messages API streaming (`content_block_start`, `content_block_delta`,
`content_block_stop`, `message_delta`, `message_stop`) más `stream.finalMessage()` para
obtener el mensaje completo de esa iteración.

El nombre de la tool invocada llega en `content_block_start` cuando
`content_block.type === 'tool_use'` (campo `content_block.name`), **antes** de que la tool
termine de ejecutarse — esa es la señal exacta que hoy falta para reemplazar el texto fijo
"Analizando tu pregunta…" con "Consultando Compras…", ya que cada tool en
`apps/asistente/src/tools/index.ts` corresponde 1:1 a un microservicio.

En el frontend, `ChatAsistente.tsx` usa `asistenteApi.enviarMensajeChat` (envoltura de
`api.post`, instancia de axios con interceptor que inyecta `Authorization: Bearer <JWT>` —
`apps/app-shell/src/lib/api.ts:56`). El navegador no puede leer un stream a través de una
promesa axios estándar; `EventSource` nativo sí sabe leer `text/event-stream`, pero **no
soporta headers custom** (no hay forma de mandar el Bearer token), así que no es una opción
para este endpoint autenticado.

## Goals / Non-Goals

**Goals:**
- El usuario ve, mientras el turno se resuelve, qué módulo del ERP se está consultando en
  cada momento (no solo un spinner genérico).
- El comportamiento final (respuesta, `parcial`, `servicios_fallidos`, auditoría, timeout de
  45s, manejo de `refusal`) es idéntico al actual — el streaming es una capa de presentación
  de progreso, no un cambio de la lógica de negocio del turno.
- El cliente sigue autenticando con el mismo JWT Bearer que ya usa el resto de la app.

**Non-Goals:**
- No se expone streaming token-por-token del texto de la respuesta final (esto es sobre
  progreso de *qué tool se invoca*, no sobre renderizado incremental de la prosa de Claude —
  eso sería un change aparte si se quisiera).
- No se cambia el modelo, el system prompt, el registro de tools, ni el rollout restringido a
  `admin`.
- No se introduce Server-Sent Events como patrón general de la app — se usa puntualmente en
  este endpoint porque es el caso de uso (progreso de un turno largo); otros endpoints siguen
  siendo request/response normales.

## Decisions

**D1 — El backend expone el progreso vía SSE (`text/event-stream`) sobre el mismo endpoint
`POST /api/v1/asistente/chat`, no un endpoint nuevo.**
Alternativas consideradas:
- *WebSocket dedicado*: agrega infraestructura (upgrade de conexión, manejo de reconexión)
  para un caso de uso que es fundamentalmente un stream unidireccional de progreso sobre una
  única petición — SSE ya cubre esto de forma más simple y sin dependencias nuevas.
- *Polling* (el cliente pregunta "¿en qué vas?" cada N ms): requiere estado de progreso
  persistido en el backend (Redis) para un turno que dura como máximo 45s — más complejidad
  que el streaming nativo del SDK, que ya expone la señal sin guardar nada adicional.

Se elige SSE sobre el mismo POST porque el SDK de Anthropic ya entrega los eventos
necesarios vía streaming, y Express soporta responder chunked sin librerías adicionales.

**D2 — El frontend usa `fetch()` nativo + `response.body.getReader()`, no `EventSource`.**
`EventSource` no permite mandar el header `Authorization: Bearer <JWT>` que este endpoint
requiere (`requireRoles('admin')`). `fetch()` sí permite headers custom y expone
`response.body` como `ReadableStream`, suficiente para parsear manualmente los frames
`data: {...}\n\n` de SSE. Alternativa descartada: pasar el JWT como query param para poder
usar `EventSource` — se rechaza porque expone el token en logs de servidor/proxy (Caddy) y en
el historial de red del navegador, un riesgo de seguridad innecesario cuando `fetch()` ya
resuelve el problema sin ese trade-off.

**D3 — El backend reenvía solo 3 tipos de evento propios (no el stream crudo del SDK):
`tool_start` (nombre de la tool/módulo), `tool_end`, y `final` (payload idéntico al JSON
actual).**
Reenviar el stream crudo de Anthropic acoplaría el frontend al formato interno del SDK
(tipos de bloque, índices, deltas de texto que no se usan). Un formato propio y mínimo
(`{ type: 'tool_start' | 'tool_end' | 'final' | 'error', ... }`) mantiene el frontend
desacoplado de la librería del SDK y es lo único que la UI necesita.

**D4 — El mapeo nombre-de-tool → nombre-de-módulo-visible se hace en el backend, no en el
frontend.**
El backend ya conoce la relación 1:1 tool↔microservicio (`tools/index.ts`); centralizar el
mapeo ahí evita que el frontend tenga que mantener su propia tabla de traducción que puede
desincronizarse si se agrega una tool nueva.

**D5 — Hallazgo durante la implementación: el status HTTP de la respuesta SHALL ser siempre
200, incluso en timeout/error.**
El diseño original (y el spec.md inicial) asumía que un timeout seguiría respondiendo 503
"sin importar cuántos eventos de progreso se hayan transmitido". Eso es técnicamente
imposible con SSE: los headers (`Content-Type: text/event-stream`, status 200) se envían
`res.flushHeaders()` antes de empezar a iterar el runner, así que para cuando ocurre un
timeout o cualquier otro error, el status code ya está comprometido en 200 y no puede
cambiarse. La solución adoptada: todo error (timeout u otro) se transmite como un frame
`{ type: 'error', message: '...' }` con el mismo mensaje que antes iba en el body del 503,
mantiene el status 200. El frontend (tarea 3.5) debe tratar ese frame igual que antes trataba
una respuesta no-200. Corregido en `specs/progreso-en-vivo-chat-asistente/spec.md`.

## Risks / Trade-offs

- [Un turno que nunca invoca tools (`invocaciones.length === 0`, ver `chat.ts:119-123`) no
  emite ningún `tool_start` — el usuario seguiría viendo solo el estado de carga sin progreso
  intermedio] → Mitigación: es el comportamiento correcto, no un bug — si Claude responde sin
  consultar ningún módulo, no hay "progreso" que mostrar; el frontend mantiene un mensaje de
  carga genérico como fallback para ese caso.
- [Timeout de 45s (`TURNO_TIMEOUT_MS`) debe seguir aplicando sobre el turno completo, no
  reiniciarse por cada evento de streaming] → Mitigación: el `AbortController` ya existente
  se pasa igual al runner con `stream: true`; no cambia su alcance.
- [Un cliente que pierde la conexión a media transmisión (cierra la pestaña, red inestable)
  deja el turno del backend corriendo sin nadie escuchando] → Mitigación: mismo riesgo que ya
  existe hoy con una petición JSON normal interrumpida — no es un riesgo nuevo introducido por
  streaming; el backend ya tiene su propio timeout independiente del cliente.
- [Proxies intermedios (Caddy) podrían bufferear la respuesta SSE en vez de reenviarla chunk
  por chunk] → Mitigación: tarea de verificación explícita en tasks.md contra el entorno real
  (local y VPS) antes de dar el change por completo; si Caddy buferea, se agrega
  `flush_interval` o el header `X-Accel-Buffering: no` según corresponda.

## Migration Plan

Sin migración de datos. Cambio de contrato interno entre `chat.ts` y `ChatAsistente.tsx` —
ambos se despliegan juntos (mismo PR). Verificación: probar el chat con login real de admin
en local (skill `run-app-shell`), confirmar que "Consultando [módulo]…" aparece y cambia
según la tool invocada, y que el turno final (`respuesta`, `parcial`,
`servicios_fallidos`) es idéntico al comportamiento actual. Rollback: revertir el PR — no hay
estado persistente nuevo que limpiar (Redis de `session-store.ts` no cambia de formato).

## Open Questions

- ¿Caddy en el VPS reenvía SSE sin bufferear por defecto, o necesita configuración explícita
  (`flush_interval`)? Se verifica como tarea antes de desplegar a producción.
