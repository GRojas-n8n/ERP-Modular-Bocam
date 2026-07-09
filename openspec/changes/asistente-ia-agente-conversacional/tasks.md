## 1. Session store (Redis)

- [x] 1.1 Agregar `REDIS_URL` al env de `apps/asistente` en `docker-compose.vps.yml` (reutilizar el servicio Redis compartido ya existente)
- [x] 1.2 Crear `apps/asistente/src/session-store.ts` — funciones `getConversacion(tenantId, conversacionId)`, `guardarTurno(tenantId, conversacionId, mensajes)`, `crearConversacionId()`. Clave Redis: `asistente:conversacion:{tenant_id}:{conversacion_id}`. TTL: 30 minutos, renovado en cada turno.
- [ ] 1.3 Test unitario: dos tenants con el mismo `conversacion_id` (colisión improbable pero forzada en el test) no comparten historial

## 2. Registro de tools por microservicio

- [ ] 2.1 Crear `apps/asistente/src/tools/` con un archivo de definición de tool por microservicio ya wireado: `compras.ts`, `finanzas.ts`, `control-obra.ts`, `personal.ts`, `seguridad.ts`, `calidad.ts`
- [ ] 2.2 Crear `apps/asistente/src/tools/gerencia-tecnica.ts` (nuevo — agregar `GERENCIA_TECNICA_URL` al env)
- [ ] 2.3 Cada tool: envuelve una llamada `GET` de solo lectura vía `buildForwardHeaders`, con timeout individual de 5s y manejo de error que devuelve `tool_result` con `is_error: true` en vez de lanzar excepción
- [ ] 2.4 Crear `apps/asistente/src/tools/index.ts` — registro central que exporta el array de tools para pasar al Tool Runner
- [ ] 2.5 Test por tool: llamada exitosa, timeout, y error HTTP 5xx del microservicio consultado

## 3. Endpoint `/chat`

- [ ] 3.1 Crear `apps/asistente/src/prompts.ts` — agregar system prompt de `/chat`: rol, dominio permitido (rechazar preguntas fuera de dominio sin invocar tools), catálogo de tools disponibles, instrucción explícita de no inventar cifras, instrucción de reportar degradación parcial. Marcar con `cache_control: {type: "ephemeral"}`
- [ ] 3.2 Crear `apps/asistente/src/routes/chat.ts` — `POST /api/v1/asistente/chat` con `requireRoles('admin', 'superintendent', 'finance', 'gerencia-tecnica')`
- [ ] 3.3 Implementar el loop con `client.beta.messages.toolRunner(...)` (modelo `claude-fable-5`), incluyendo `fallbacks: [{model: "claude-opus-4-8"}]` con beta `server-side-fallback-2026-06-01`
- [ ] 3.4 Integrar `session-store.ts`: recuperar historial si hay `conversacion_id`, generar uno nuevo si no, reenviar historial completo en cada turno
- [ ] 3.5 Timeout total del turno: 45s
- [ ] 3.6 Rate limiter dedicado para `/chat`: 20 mensajes / 15 minutos / tenant (`express-rate-limit`, `MemoryStore`, independiente del rate limiter de los otros tres endpoints)
- [ ] 3.7 Manejar `stop_reason: "refusal"` explícitamente (verificar antes de leer `content`), con log de auditoría del rechazo

## 4. Degradación parcial

- [ ] 4.1 Consolidar resultados de tools de un mismo turno con `Promise.allSettled` cuando Claude invoca varias en paralelo
- [ ] 4.2 Construir la bandera `parcial` y la lista de servicios fallidos a partir de los `tool_result` con `is_error: true` del turno
- [ ] 4.3 Test: turno con 3 tools invocadas, 1 falla → respuesta con `parcial: true` y el servicio fallido identificado
- [ ] 4.4 Test: turno con todas las tools exitosas → `parcial: false`

## 5. Auditoría

- [ ] 5.1 Emitir evento de auditoría por turno vía `packages/observability` — usuario, `tenant_id`, `conversacion_id`, tools invocadas, tiempo de respuesta por tool, `parcial`
- [ ] 5.2 Registrar por separado los turnos resueltos sin invocar ninguna tool (preguntas fuera de dominio)
- [ ] 5.3 Test: verificar que el evento de auditoría se emite antes de devolver la respuesta al usuario

## 6. Frontend — widget de chat

- [ ] 6.1 Agregar `enviarMensajeChat(conversacionId, mensaje)` en `apps/app-shell/src/lib/api.ts` — `POST /api/v1/asistente/chat`
- [ ] 6.2 Crear componente de chat flotante en `apps/app-shell`, visible solo para roles `admin`, `superintendent`, `finance`, `gerencia-tecnica`
- [ ] 6.3 Mostrar indicador de "consultando [servicio]..." mientras se resuelve el turno, no solo un spinner genérico
- [ ] 6.4 Mostrar aviso visual cuando la respuesta trae `parcial: true`, listando qué no se pudo consultar
- [ ] 6.5 Historial de conversación visible solo durante la sesión activa del navegador (sin persistencia más allá del TTL de Redis)

## 7. Infraestructura y despliegue

- [ ] 7.1 Confirmar en el panel de Anthropic que la organización usada en producción cumple el requisito de retención de datos de 30 días que exige `claude-fable-5` (bloqueante — sin esto todas las llamadas devuelven 400)
- [ ] 7.2 Agregar variables `GERENCIA_TECNICA_URL` (y las de servicios adicionales que se decidan en el Open Question de `design.md`) al bloque `asistente` en `docker-compose.vps.yml`
- [ ] 7.3 Desplegar `/chat` restringido a rol `admin` primero (feature flag por rol en el propio `requireRoles`, sin variable de entorno separada)
- [ ] 7.4 Validar costo real y tasa de degradación parcial durante la primera semana en producción antes de ampliar a los demás roles
- [ ] 7.5 Ampliar `requireRoles` a `superintendent`, `finance`, `gerencia-tecnica` una vez validado

## 8. Tests de integración

- [ ] 8.1 Test end-to-end: pregunta que requiere combinar 2 servicios → respuesta consolidada correcta
- [ ] 8.2 Test end-to-end: pregunta fuera de dominio → respuesta de alcance sin invocar tools ni consumir rate limit de tools
- [ ] 8.3 Test end-to-end: segundo mensaje de una conversación existente usa el contexto del primero (ej. "¿y el presupuesto?" después de preguntar por una obra específica)
- [ ] 8.4 Test de aislamiento multi-tenant: `conversacion_id` de un tenant no es accesible ni continuable desde otro tenant
- [ ] 8.5 Test de rate limiting: tenant que excede 20 mensajes/15min recibe 429 sin llamar a Claude
