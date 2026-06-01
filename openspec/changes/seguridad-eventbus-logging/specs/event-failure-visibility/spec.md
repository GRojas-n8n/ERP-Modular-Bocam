# Spec: Event Failure Visibility

## CA-1 — Fallo de publicación genera logWarn
- Cuando `eventBus.publish()` lanza una excepción, el módulo registra un `logWarn`
  estructurado con: `event_type`, `entity_id` (del payload), y el mensaje del error.
- El `logWarn` es visible en los logs del contenedor (`docker compose logs seguridad`).

## CA-2 — Reintento para INCIDENTE_REPORTADO
- El evento `seguridad.incidente_reportado` tiene 3 intentos con delays 1s, 3s, 5s.
- Si los 3 fallan, se registra `logWarn` con nivel de severidad indicando que se intentó
  3 veces sin éxito.
- Los demás eventos tienen solo 1 intento + logWarn si falla.

## CA-3 — La operación principal no se ve afectada
- El registro en base de datos ya ocurrió antes del `try/catch` del eventBus.
- El reintento ocurre de forma asíncrona después de que la respuesta HTTP fue enviada
  al cliente (no bloquea la respuesta).
- Si los 3 reintentos de INCIDENTE_REPORTADO fallan, el cliente ya recibió su `201`.
