## Why

El módulo `asistente` (puerto 3011) ya usa la API real de Claude (`claude-sonnet-4-6`)
en tres endpoints de propósito fijo: `leer-cotizacion`, `resumen-ejecutivo` y
`alertas-predictivas` (ver `openspec/changes/archive/2026-06-03-asistente-ia`). Los
tres son "una pregunta, una respuesta" — sin conversación, sin memoria de sesión y sin
capacidad de decidir en tiempo real a qué módulos consultar. El diseño original lo
declaró explícitamente como no-objetivo ("Chatbot conversacional — sin historial de
sesión, sin RAG").

Los usuarios (Director, Superintendente, Gerencia Técnica) ya piden preguntas ad-hoc
que no encajan en ninguno de los tres endpoints fijos — por ejemplo "¿cómo va la obra
Torre Cuenca?" (requiere combinar Control de Obra + Finanzas + Gerencia Técnica) o
"¿cuántas requisiciones lleva pendientes Compras esta semana?". Hoy esas preguntas no
tienen respuesta en el asistente. Se necesita un modo conversacional con orquestación
dinámica de herramientas (tool-use) sobre los microservicios existentes, capaz de
decidir qué combinación de servicios consultar por pregunta y de degradarse con
gracia cuando alguno no responde.

## What Changes

- **NUEVO** endpoint `POST /api/v1/asistente/chat` — modo conversacional con
  tool-use dinámico. Recibe un mensaje de usuario y un `conversacion_id` opcional;
  Claude decide qué tools (uno por microservicio consultable) invocar para responder,
  puede encadenar varias llamadas, y devuelve una respuesta consolidada en lenguaje
  natural.
- **NUEVO** registro de tools de Claude, uno por microservicio consultable
  (Compras, Finanzas, Control de Obra, Gerencia Técnica, Personal, Seguridad,
  Calidad, Almacén, Ventas, Contabilidad), cada uno mapeado a una llamada
  backend-to-backend real vía `buildForwardHeaders` (mismo patrón ya usado en
  `resumen-ejecutivo`) — sin JOIN de bases de datos, solo agregación en la capa
  del asistente.
- **NUEVO** manejo estándar de degradación parcial: si uno o más microservicios
  fallan durante una consulta que combina varios, la respuesta declara
  `parcial: true` y lista qué servicios no respondieron, sin fallar la conversación
  completa.
- **NUEVO** memoria de sesión por conversación (Redis, TTL configurable) para que
  el asistente recuerde de qué obra/proyecto está hablando el usuario durante los
  siguientes turnos, con aislamiento estricto por tenant.
- **NUEVO** auditoría de consultas cross-servicio: cada turno del chat que invoque
  una o más tools queda registrado (usuario, tools invocadas, servicios consultados,
  tiempos de respuesta, `parcial`) vía `packages/observability`.
- **NUEVO** modelo Claude para este endpoint: `claude-fable-5` (los tres endpoints
  existentes de propósito fijo permanecen en `claude-sonnet-4-6`, sin cambios) — la
  justificación de esta decisión se documenta en `design.md`.
- **MODIFICADO** `apps/app-shell` — nuevo widget de chat flotante disponible para
  roles `superintendent`, `admin`, `finance` y `gerencia-tecnica`, con historial de
  la conversación activa visible en pantalla (no persistente entre sesiones de
  navegador más allá del TTL de Redis).

## Capabilities

### New Capabilities

- `asistente-conversacion-multi-servicio`: modo chat con tool-use dinámico sobre los
  microservicios del ERP, resolviendo preguntas ad-hoc que requieren combinar datos
  de más de un módulo, con memoria de sesión acotada a una conversación.
- `asistente-degradacion-parcial-cross-servicio`: contrato estándar de respuesta
  cuando uno o más microservicios consultados durante una conversación no responden,
  incluyendo qué servicios fallaron sin interrumpir la respuesta completa.
- `asistente-auditoria-consultas`: registro auditable de cada consulta cross-servicio
  del asistente (quién preguntó, qué tools/servicios se invocaron, tiempos,
  resultado parcial o completo).

### Modified Capabilities

_(ninguna — los tres endpoints existentes de `asistente` (`leer-cotizacion`,
`resumen-ejecutivo`, `alertas-predictivas`) no cambian de comportamiento ni de
modelo)_

## Impact

- **Código:** `apps/asistente/src/routes/chat.ts` (nuevo), `apps/asistente/src/tools/`
  (nuevo — un archivo de definición de tool por microservicio consultable),
  `apps/asistente/src/session-store.ts` (nuevo — memoria de conversación en Redis).
- **Frontend:** nuevo componente de chat flotante en `apps/app-shell`, nueva función
  `enviarMensajeChat(conversacionId, mensaje)` en `apps/app-shell/src/lib/api.ts`.
- **Infraestructura:** nueva dependencia de Redis para `apps/asistente` en
  `docker-compose.vps.yml` (ya existe el servicio Redis compartido — solo se agrega
  la variable `REDIS_URL` al env de `asistente`); nuevas variables `*_URL` para los
  microservicios aún no consultados por el asistente (Personal, Seguridad, Calidad,
  Almacén, Ventas, Contabilidad — revisar en `design.md` cuáles ya existen).
- **RBAC:** el endpoint `/chat` reutiliza `requireRoles('superintendent', 'admin',
  'finance')` y agrega `'gerencia-tecnica'` — sin cambios a roles existentes.
- **Costo:** nuevo consumo de API en `claude-fable-5` (tarifa superior a Sonnet);
  se cubre con rate limiting por tenant en `design.md`.
- **Sin cambios de schema Prisma en ningún microservicio existente** — el asistente
  sigue sin base de datos propia (excepto Redis para sesión de conversación, que no
  es Prisma/PostgreSQL).
