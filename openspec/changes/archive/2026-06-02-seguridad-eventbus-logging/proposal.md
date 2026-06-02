# Proposal — Seguridad: EventBus Logging + Retry en Incidentes

## Why

El módulo `seguridad` publica 6 tipos de eventos HSE (incidente, inspección, permiso, 
capacitación) pero todos los `catch` están vacíos: si RabbitMQ no está disponible cuando
ocurre un accidente laboral, el evento se pierde silenciosamente y ningún operador lo sabe.
En términos de cumplimiento STPS, un accidente que no llega a los suscriptores (reportes,
alertas, dashboards futuros) es un riesgo legal.

El fix no requiere romper el principio de degradación elegante — la operación principal
(guardar en BD) sigue ocurriendo. Solo necesitamos: **visibilidad del fallo** y **reintento
para el evento más crítico** (incidente reportado).

## What Changes

- **MODIFICADOS** los 6 bloques `catch (_) {}` en `apps/seguridad/src/main.ts` →
  reemplazados por `catch (err) { logWarn(...) }` para que los fallos sean visibles en logs.
- **NUEVO** patrón de reintento con backoff para `INCIDENTE_REPORTADO` (el evento de mayor
  criticidad): 3 intentos con delays de 1s, 3s, 5s antes de desistir y loguear error.
- Sin cambios en schema, sin nuevas tablas, sin cambios en frontend.

## Capabilities

### New Capabilities

- `event-failure-visibility`: Los fallos de publicación de eventos en seguridad generan
  entradas `logWarn` estructuradas con `event_type`, `entity_id` y el mensaje de error.
  Operadores pueden detectar problemas de RabbitMQ en los logs del contenedor.

### Modified Capabilities

*(Ninguna spec existente cambia — es corrección de comportamiento interno)*

## Impact

- **Un solo archivo:** `apps/seguridad/src/main.ts` — 6 cambios de `catch (_) {}` a
  `catch (err) { logWarn(...) }`, más la función de reintento para incidentes.
- **Sin cambios en:** schema, BD, frontend, otros módulos, infraestructura.
- **Deploy:** solo rebuild del contenedor `seguridad`.
