# Design — Seguridad: EventBus Logging

## Context

El módulo `seguridad` tiene 6 puntos de `eventBus.publish()`, todos con `catch (_) {}`.
La degradación elegante es correcta por principio — el registro en BD ya ocurrió.
El problema es la opacidad: un operador que mira los logs no sabe si los eventos llegaron.

## Goals

1. Visibilidad: cada fallo de `eventBus.publish()` genera un `logWarn` estructurado
2. Resiliencia adicional para `INCIDENTE_REPORTADO`: reintento automático con backoff

## Non-Goals

- Outbox pattern / tabla de eventos pendientes (complejidad innecesaria para este módulo)
- Reintento para todos los eventos (solo para el más crítico)
- Cambios en RabbitMQ o en el package `event-bus`

## Decisiones

**D1 — logWarn, no logError**
Un fallo de EventBus no es un error de negocio (la operación principal está confirmada).
Es una advertencia operacional. Se usa `logWarn` de `@bocam/observability`.

**D2 — Reintento solo para INCIDENTE_REPORTADO**
Este es el único evento con implicaciones legales STPS. Los demás (inspección, permiso,
capacitación) se registran en BD y pueden reconstruirse. El patrón:
```typescript
async function publishConReintento(evento, maxIntentos = 3) {
  const delays = [1000, 3000, 5000];
  for (let i = 0; i < maxIntentos; i++) {
    try {
      await eventBus.publish(evento);
      return; // éxito
    } catch (err) {
      if (i < maxIntentos - 1) {
        await new Promise(r => setTimeout(r, delays[i]));
      } else {
        logWarn(req, 'seguridad', 'seguridad.eventbus.incidente_fallido',
          'No se pudo publicar INCIDENTE_REPORTADO tras 3 intentos', { error: String(err) });
      }
    }
  }
}
```

**D3 — Los otros 5 eventos usan logWarn directo (sin reintento)**
```typescript
} catch (err: any) {
  logWarn(req, 'seguridad', 'seguridad.eventbus.fallo',
    `No se pudo publicar evento ${SeguridadEvents.X}`, { error: err.message });
}
```
