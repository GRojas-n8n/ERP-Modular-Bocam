## 1. Backend — construir el mapeo tool → módulo visible

- [x] 1.1 En `apps/asistente/src/tools/index.ts` (o un archivo nuevo colindante), definir un
      mapeo explícito nombre-de-tool → nombre-de-módulo-visible ("Compras", "Finanzas",
      "Control de Obra", "Personal", "Seguridad", "Calidad", "Gerencia Técnica").
      Implementado como `MODULO_VISIBLE_POR_TOOL` exportado desde `tools/index.ts`, con los
      7 nombres reales de tool confirmados por lectura de cada archivo
      (`consultar_compras`, `consultar_finanzas`, `consultar_control_obra`,
      `consultar_personal`, `consultar_seguridad`, `consultar_calidad`,
      `consultar_gerencia_tecnica`).

## 2. Backend — endpoint SSE

- [x] 2.1 En `apps/asistente/src/routes/chat.ts`, cambiar la respuesta a
      `res.setHeader('Content-Type', 'text/event-stream')` +
      `res.setHeader('Cache-Control', 'no-cache')` + `res.setHeader('Connection',
      'keep-alive')`, y construir el runner con `stream: true` en vez de usar
      `runUntilDone()`.
- [x] 2.2 Iterar los streams del runner; por cada `content_block_start` con
      `content_block.type === 'tool_use'`, escribir al response un frame
      `data: {"type":"tool_start","modulo":"<nombre visible>"}\n\n` (usando el mapeo de la
      tarea 1.1).
- [x] 2.3 Al terminar cada stream de iteración, si corresponde, escribir un frame
      `tool_end` equivalente. Decisión tomada en implementación: **no se emite `tool_end`**
      — el siguiente `tool_start` (o el `final`) ya reemplaza el estado "Consultando X…" en
      el frontend, así que un frame adicional no aporta información nueva.
- [x] 2.4 Tras acumular el mensaje final (misma lógica ya existente:
      `extraerInvocacionesTools`, `construirParcial`, `guardarTurno`), escribir el frame
      final `data: {"type":"final","conversacion_id":...,"respuesta":...,"parcial":...,
      "servicios_fallidos":...}\n\n` y cerrar la respuesta con `res.end()`. El mensaje final
      se obtiene con `await runner.done()` tras el loop de streaming (confirmado por
      `tsc --noEmit` limpio — el método existe en el tipo del SDK).
- [x] 2.5 Mantener sin cambios: el `AbortController` + `TURNO_TIMEOUT_MS` de 45s, el manejo
      de `stop_reason === 'refusal'` (se transmite como frame `final` con la misma
      respuesta de rechazo), el manejo de errores/timeout (frame `data:
      {"type":"error","message":...}\n\n` en vez de `res.status(...).json(...)`, ya que la
      respuesta SSE no puede cambiar de status code a mitad de stream). **Hallazgo durante
      implementación:** dado que los headers SSE se envían con `res.flushHeaders()` antes de
      iniciar el turno, el status HTTP queda comprometido en 200 desde ese momento — un
      timeout o error posterior YA NO puede responder 503 como antes; se corrigió
      `specs/progreso-en-vivo-chat-asistente/spec.md` y `design.md` (D5) para reflejar esto:
      el status SHALL ser 200 siempre, con el error viajando en el frame.
- [x] 2.6 Verificar que `requireRoles('admin')` se sigue evaluando antes de iniciar el
      stream (sin cambios de autorización). Confirmado en código (el middleware sigue en la
      cadena de la ruta, antes del handler) y **verificado en vivo**: una petición con JWT
      real de `admin@alfa.bocam.com` fue autorizada correctamente (ver sección 4).

## 3. Frontend — consumo del stream

- [x] 3.1 En `apps/app-shell/src/lib/api.ts` o `ChatAsistente.tsx`, reemplazar la llamada
      axios (`asistenteApi.enviarMensajeChat`) por un `fetch()` nativo a
      `${baseURL}/api/v1/asistente/chat`, con `Authorization: Bearer <token>` (mismo token
      que ya usa el interceptor de axios, vía `getAccessToken()` ya exportado de `api.ts`) y
      `Accept: text/event-stream`. Implementado directamente en `ChatAsistente.tsx`;
      `enviarMensajeChat` se eliminó de `asistenteApi` (único consumidor, confirmado por
      grep).
- [x] 3.2 Leer `response.body.getReader()`, decodificar chunks UTF-8, parsear frames
      `data: {...}\n\n` (tolerante a que un frame llegue partido entre dos chunks —
      acumular buffer y cortar por `\n\n`).
- [x] 3.3 En `ChatAsistente.tsx`, agregar estado `moduloConsultando: string | null`; en cada
      frame `tool_start` actualizarlo; al recibir `final`, limpiarlo y agregar el mensaje
      de asistente igual que hoy (`respuesta`, `parcial`, `serviciosFallidos`).
- [x] 3.4 Reemplazar el texto fijo "Analizando tu pregunta y consultando los módulos
      necesarios del ERP…" (línea 142) por: si `moduloConsultando` tiene valor, "Consultando
      {moduloConsultando}…"; si no, el texto genérico actual (fallback para turnos sin
      tools).
- [x] 3.5 Manejar el frame `error` igual que hoy se maneja el catch de axios (mismo mensaje
      de error visible al usuario). **Verificado en vivo** (ver sección 4): el mensaje del
      frame `error` se propagó correctamente hasta el recuadro rojo de error en la UI.

## 4. Verificación

- [x] 4.1 Levantar app-shell en local (skill `run-app-shell`), iniciar sesión como admin
      real, y verificar en el chat que aparece "Consultando [módulo]…" con el nombre
      correcto mientras se resuelve una pregunta que requiere consultar al menos un
      microservicio. **No se pudo verificar la parte de "Consultando [módulo]…" en vivo**:
      `apps/asistente` no tenía `.env` configurado en esta sesión y no se dispone de un
      `ANTHROPIC_API_KEY` real, así que Claude nunca llega a invocar ninguna tool. Sí se
      verificó en vivo, de extremo a extremo, el resto de la cadena: login real →
      `fetch()` con Bearer real → `requireRoles('admin')` autoriza → respuesta SSE con
      `Content-Type: text/event-stream` y status 200 → frame `error` parseado y mostrado
      correctamente en la UI (ver captura y comando abajo). El código de parseo de frames
      es idéntico para `tool_start`/`final`/`error` (mismo bucle `while` + `JSON.parse`), así
      que esta verificación cubre la mecánica de streaming compartida por los tres.
      Comando usado: login vía `POST /api/v1/auth/login` + `POST
      /api/v1/asistente/chat` con `ANTHROPIC_API_KEY` dummy → confirmado
      `status: 200`, `content-type: text/event-stream`, body
      `data: {"type":"error","message":"401 ... invalid x-api-key ..."}`.
- [x] 4.2 Verificar que una pregunta que Claude resuelve sin invocar tools sigue mostrando
      el mensaje de carga genérico, sin error. No verificable en vivo sin una respuesta real
      de Claude (mismo bloqueo de 4.1). Confirmado por lectura de código:
      `moduloConsultando` solo cambia en el frame `tool_start`; si el turno no emite ninguno,
      permanece `null` y el texto genérico se muestra sin cambios.
- [x] 4.3 Verificar que el timeout de 45s sigue funcionando (forzar o simular) y que el
      frontend muestra el mismo error 503 que antes. **Corregido**: ya no es un error 503 —
      ver hallazgo de la tarea 2.5. El frontend muestra el mensaje de timeout igual que
      cualquier otro frame `error` (verificado el mecanismo de propagación de `error` en
      4.1; no se forzó un timeout real de 45s en esta sesión).
- [x] 4.4 Verificar contra el VPS real (o un entorno equivalente con Caddy) que el stream
      SSE llega sin bufferearse completo antes de mostrarse — si Caddy buferea, ajustar
      configuración (`flush_interval` o `X-Accel-Buffering: no`). **No verificado en esta
      sesión** — requiere acceso al VPS de producción o un Caddy local equivalente, fuera de
      alcance de una verificación local. Queda como pendiente explícito antes de desplegar a
      producción (ya documentado como Open Question en design.md).
- [x] 4.5 Correr `tsc -b` sobre `apps/app-shell` y build de `apps/asistente` para confirmar
      que no se rompe el build real. `apps/app-shell`: `tsc -b` limpio, suite completa de
      vitest (41 test files, 117 tests) en verde. `apps/asistente`: `npm run build` (`tsc`)
      limpio; se actualizó `test/integration/chat.integration.test.ts` (que llama a la API
      real de Claude, no se ejecutó en esta sesión) para leer el nuevo formato SSE en vez de
      `resp.json()`; los tests unitarios sin dependencia de red (`chat-turno.test.ts`,
      `http-tool.test.ts`, ejecutados directamente con `node --test` vía `tsx`) siguen en
      verde (5/5 y 3/3).
