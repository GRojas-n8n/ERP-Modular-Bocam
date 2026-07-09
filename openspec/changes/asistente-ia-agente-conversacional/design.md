## Context

`apps/asistente` (puerto 3011) es un microservicio sin base de datos propia y sin
Prisma — un proxy inteligente que llama a los demás microservicios vía HTTP con el
JWT del usuario propagado (`buildForwardHeaders`, de `packages/observability`) y
enriquece los datos con Claude. Hoy expone tres endpoints de propósito fijo
(`leer-cotizacion`, `resumen-ejecutivo`, `alertas-predictivas`), todos en
`claude-sonnet-4-6`, todos "una pregunta, una respuesta" sin estado entre llamadas.

Ya está wireado a seis servicios vía variables de entorno en
`docker-compose.vps.yml`: `COMPRAS_URL`, `FINANZAS_URL`, `CONTROL_OBRA_URL`,
`PERSONAL_URL`, `SEGURIDAD_URL`, `CALIDAD_URL`. La producción real corre 14
microservicios de backend (`auth`, `gerencia-tecnica`, `finanzas`, `compras`,
`control-obra`, `personal`, `seguridad`, `ventas`, `contabilidad`,
`contabilidad-sat-worker`, `calidad`, `reportes`, `asistente`, `almacen`,
`control-proyectos`) — más de los 12 documentados originalmente en `CLAUDE.md`,
porque `ventas` (puerto 3012) y `control-proyectos` (puerto 3013) se agregaron
en changes posteriores.

Este change agrega un cuarto endpoint, `POST /api/v1/asistente/chat`, que requiere
un patrón distinto a los tres existentes: un loop de tool-use multi-turno donde
Claude decide dinámicamente qué microservicios consultar, en vez de un fetch fijo
predefinido por endpoint.

## Goals / Non-Goals

**Goals:**

1. Responder preguntas ad-hoc en lenguaje natural que combinan datos de 2+
   microservicios, sin que el usuario tenga que saber cuáles.
2. Degradarse con gracia: si un microservicio consultado falla, la conversación
   continúa con los datos disponibles y una nota explícita de qué faltó.
3. Mantener contexto de conversación (qué obra/proyecto se está discutiendo)
   durante una sesión de chat, con aislamiento estricto por tenant.
4. Dejar auditoría de qué se consultó y cuándo, para trazabilidad ante finanzas
   y dirección.

**Non-Goals:**

- No reemplaza los tres endpoints existentes (`leer-cotizacion`,
  `resumen-ejecutivo`, `alertas-predictivas`) — siguen en `claude-sonnet-4-6`
  sin cambios.
- No es un chatbot de soporte general — el system prompt restringe el dominio a
  datos operativos del ERP; preguntas fuera de dominio se rechazan con un mensaje
  fijo, sin gastar una llamada a tools.
- No ejecuta acciones de escritura — todas las tools son de solo lectura
  (`GET`). Ninguna decisión financiera u operativa se toma automáticamente.
- No persiste conversaciones más allá del TTL de Redis — no es un historial
  permanente ni un sistema de tickets.
- No cubre inicialmente `ventas`, `contabilidad`, `almacen` ni
  `control-proyectos` como tools — ver Open Questions.

## Decisions

**D1 — Modelo `claude-fable-5` para `/chat`, `claude-sonnet-4-6` sin cambios en
los tres endpoints existentes.**
Los tres endpoints existentes son extracción/análisis de un solo paso con un
prompt fijo — Sonnet 4.6 ya los resuelve bien y no hay razón para migrarlos.
`/chat` es cualitativamente distinto: requiere decidir dinámicamente qué
combinación de tools invocar ante una pregunta ambigua, encadenar varias
llamadas cuando la primera respuesta no basta, y razonar sobre degradación
parcial sin instrucciones paso a paso. Es el perfil de tarea agéntica de
tool-use donde Fable 5 rinde mejor que Sonnet (ver `shared/agent-design.md` del
skill `claude-api`: diseño de superficie de tools, orquestación multi-turno).
Alternativa considerada — mantener todo en `claude-sonnet-4-6`: se descartó
porque en pruebas informales de prompts similares, Sonnet resuelve bien tools
individuales pero es menos fiable decidiendo cadenas de 2-3 tools ante preguntas
ambiguas tipo "¿cómo va la obra X?". Alternativa considerada — `claude-opus-4-8`:
opción intermedia en costo; queda como candidato de downgrade si el costo de
Fable 5 en producción resulta desproporcionado (ver Risks).

**D2 — Tool Runner del SDK de Anthropic (beta) en vez de loop manual.**
`client.beta.messages.toolRunner(...)` maneja el ciclo llamar→ejecutar
tool→reinyectar resultado→repetir. Se prefiere sobre un loop manual porque no
hay necesidad de control fino que el Tool Runner no exponga (aprobación humana,
transporte custom) y reduce código de infraestructura propio.

**D3 — Memoria de conversación en Redis, atada al tenant desde el servidor.**
Cada conversación se identifica con `conversacion_id` (UUID generado por el
servidor en el primer mensaje, nunca aceptado desde el cliente sin validar).
Clave Redis: `asistente:conversacion:{tenant_id}:{conversacion_id}`. Valor:
array de mensajes (la API de Claude es stateless — se reenvía el historial
completo en cada turno). TTL: 30 minutos de inactividad. El `tenant_id` se toma
siempre del JWT verificado, nunca de un campo del body — evita que una
conversación de un tenant sea legible o continuable desde otro.

**D4 — Cada tool envuelve una llamada backend-to-backend existente, con timeout
corto e independiente.**
Igual patrón que `resumen-ejecutivo` (`buildForwardHeaders` + `Promise.allSettled`
para llamadas paralelas cuando el turno invoca varias tools a la vez), pero cada
tool individual tiene su propio timeout de 5s. Si una tool falla o excede el
timeout, se devuelve `tool_result` con `is_error: true` y un mensaje breve —
Claude decide cómo continuar (reportar el dato faltante, reintentar con otra
tool, o responder con lo que ya tiene). La degradación parcial es así una
consecuencia del propio loop de tool-use, no un chequeo aparte después.

**D5 — Rate limiting específico para `/chat`, más estricto que los otros tres
endpoints.**
20 mensajes / 15 minutos / tenant (vs. 10 req/15min de los otros tres, que son
operaciones más pesadas pero mucho menos frecuentes). Mismo mecanismo ya usado
(`express-rate-limit` con `MemoryStore`).

**D6 — Fallback automático ante `refusal` con `claude-opus-4-8`.**
Aunque el dominio (datos operativos de una constructora) es improbable de
disparar los clasificadores de seguridad de Fable 5, se activa por defecto el
parámetro server-side `fallbacks` (beta `server-side-fallback-2026-06-01`,
`fallbacks: [{model: "claude-opus-4-8"}]`) para que un `stop_reason: "refusal"`
puntual no interrumpa la conversación del usuario.

**D7 — Prompt del sistema marcado como cacheable.**
El system prompt (rol, dominio permitido, instrucciones de degradación parcial,
catálogo de tools disponibles) se marca con `cache_control: {type: "ephemeral"}`
— mismo patrón que ya usan los tres endpoints existentes (`prompts.ts`).

## Risks / Trade-offs

| Riesgo | Mitigación |
|---|---|
| Costo de `claude-fable-5` (tarifa superior a Sonnet) en un endpoint conversacional de alto volumen potencial | Rate limit 20 msg/15min/tenant; medir costo real en los primeros 30 días; downgrade a `claude-opus-4-8` documentado como plan B si el costo no se justifica |
| Latencia de un turno que encadena varias tools (ida y vuelta con Claude por cada llamada) | Timeout total de turno 45s; timeout individual de tool 5s; UI muestra qué se está consultando (no solo un spinner genérico) |
| La organización de Anthropic no cumple el requisito de retención de datos de 30 días que exige Fable 5 (bloquearía el endpoint con 400 en toda llamada) | Verificar la configuración de retención antes de activar en producción — ver Open Questions |
| Fuga de contexto entre tenants si `conversacion_id` no queda correctamente atado al tenant | `tenant_id` siempre del JWT verificado, nunca del body; tests de aislamiento obligatorios en `tasks.md` |
| Alucinación de cifras no verificadas en la respuesta | System prompt explícito: "solo reporta datos devueltos por las tools invocadas en este turno, nunca inventes cifras ni asumas datos de turnos anteriores sin volver a consultarlos si el usuario pregunta por datos actuales" |
| Refusal inesperado del clasificador de seguridad de Fable 5 en una pregunta legítima | Fallback automático a `claude-opus-4-8` vía `fallbacks` (D6) |

## Migration Plan

1. Desplegar `/chat` restringido inicialmente a rol `admin` únicamente (feature
   flag por rol, no por variable de entorno separada) para validar costo y
   calidad de respuestas en producción real antes de abrir a
   `superintendent`/`finance`/`gerencia-tecnica`.
2. Ampliar a los roles completos listados en `proposal.md` una vez validado
   costo y tasa de degradación parcial en el primer despliegue.
3. **Rollback:** quitar el widget de chat del frontend y/o retirar la ruta
   `/chat` de `main.ts` — no afecta a los tres endpoints existentes, que son
   módulos de ruta independientes.

## Open Questions

- ¿La organización de Anthropic usada en producción cumple el requisito de
  retención de datos de 30 días que exige `claude-fable-5`? Debe confirmarse
  antes de desplegar — si no, todas las llamadas a `/chat` devuelven 400 sin
  importar el payload.
- ¿El chat debe cubrir `ventas`, `contabilidad`, `almacen` y
  `control-proyectos` desde el lanzamiento, o se lanza con el subconjunto ya
  wireado (`compras`, `finanzas`, `control-obra`, `personal`, `seguridad`,
  `calidad`) más `gerencia-tecnica` (nuevo), dejando el resto para un change
  posterior?
- ¿Se requiere exportar el log de auditoría de conversaciones (PDF/CSV) para
  cumplimiento, o basta con el registro en `packages/observability`?
