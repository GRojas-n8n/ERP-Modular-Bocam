## Why

El chat del Asistente IA (`apps/asistente/src/routes/chat.ts`) resuelve cada turno con
`anthropic.beta.messages.toolRunner(...).runUntilDone()` — un único request/response sin
streaming. Mientras el turno se resuelve, `ChatAsistente.tsx` (línea 138-144) muestra un
mensaje fijo: "Analizando tu pregunta y consultando los módulos necesarios del ERP…". El
propio código documenta la razón (`ChatAsistente.tsx:14-16`, `chat.ts` no tiene comentario
equivalente): sin streaming no hay señal intermedia de qué tool se está invocando en tiempo
real, así que el frontend no puede mostrar "Consultando Compras…" en vez del texto genérico.

El registro de tools (`apps/asistente/src/tools/index.ts`) ya es 1 tool por microservicio
(Compras, Finanzas, Control de Obra, Personal, Seguridad, Calidad, Gerencia Técnica) — el
nombre de la tool invocada ya identifica el módulo exacto que se está consultando. El SDK de
Anthropic (`@anthropic-ai/sdk`) soporta iterar streams por cada turno del Tool Runner
(`toolRunner({..., stream: true})`, iterando cada elemento como un stream de eventos en vez
de un mensaje ya resuelto); el evento `content_block_start` con `content_block.type ===
'tool_use'` llega con el nombre de la tool antes de que termine de ejecutarse, que es
exactamente la señal que falta hoy.

## What Changes

- `POST /api/v1/asistente/chat` (`apps/asistente/src/routes/chat.ts`) cambia de responder
  JSON único a responder como stream SSE (`Content-Type: text/event-stream`), reenviando
  eventos de progreso mientras el turno avanza: cuándo empieza a invocar una tool (con el
  nombre del módulo), cuándo esa tool termina, y un evento final con la respuesta completa
  (mismo payload `{ conversacion_id, respuesta, parcial, servicios_fallidos }` que hoy).
- El backend deja de usar `runner.runUntilDone()` y en su lugar construye el runner con
  `stream: true`, iterando sus streams internos para reenviar el progreso al cliente
  mientras acumula el mensaje final (mismo comportamiento de auditoría, timeout de 45s, y
  manejo de `stop_reason === 'refusal'` que existen hoy — sin cambios de esa lógica).
- `ChatAsistente.tsx` deja de usar `asistenteApi.enviarMensajeChat` vía axios (que no puede
  leer un stream en el navegador) y en su lugar usa `fetch()` nativo con
  `response.body.getReader()` para leer los eventos SSE conforme llegan, mostrando
  "Consultando [nombre del módulo]…" en vez del texto fijo actual, con el mismo token JWT
  Bearer que ya inyecta el interceptor de axios (`EventSource` nativo no soporta headers de
  autorización, por eso no se usa).
- **BREAKING (interno, no observable para roles no-admin):** la firma de
  `asistenteApi.enviarMensajeChat` deja de ser una llamada axios que retorna una promesa con
  el JSON completo; el consumo pasa a ser un stream. Es el único componente que la usa
  (`ChatAsistente.tsx`), así que el cambio no tiene otros call sites que migrar.
- **NO** se cambia el modelo, el system prompt, el registro de tools, el timeout de 45s, el
  manejo de degradación parcial (`parcial`/`servicios_fallidos`), ni el rollout restringido a
  `admin` — todo eso pertenece a `asistente-ia-agente-conversacional` y no cambia aquí.

## Capabilities

### New Capabilities
- `progreso-en-vivo-chat-asistente`: el chat del Asistente IA muestra en tiempo real qué
  módulo del ERP se está consultando durante la resolución de un turno, en vez de un mensaje
  de carga genérico y fijo.

### Modified Capabilities
(ninguna — no hay spec existente para el endpoint `/chat` en `openspec/specs/`; la
capability nueva cubre el comportamiento observable que cambia)

## Impact

- **Afectado:** `apps/asistente/src/routes/chat.ts` (respuesta SSE en vez de JSON único),
  `apps/app-shell/src/components/ChatAsistente.tsx` (consumo del stream, UI de progreso).
- **No afectado:** `apps/asistente/src/tools/*`, `apps/asistente/src/chat-turno.ts`
  (`extraerInvocacionesTools`, `construirParcial` — se siguen usando sobre el mensaje final
  acumulado, no cambian), `apps/asistente/src/session-store.ts`, el rol `admin`-only del
  rollout, ningún otro microservicio.
- **Dependencias:** ninguna nueva librería — `stream: true` en `toolRunner` y SSE nativo de
  Express/fetch ya están disponibles en las versiones actuales de `@anthropic-ai/sdk` y del
  navegador.
