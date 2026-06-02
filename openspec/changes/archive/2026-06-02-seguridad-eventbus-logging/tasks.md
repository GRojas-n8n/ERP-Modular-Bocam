# Tasks — Seguridad: EventBus Logging

## 1. Función helper de reintento

- [ ] 1.1 Agregar función `publishConReintento` en `apps/seguridad/src/main.ts` según design.md:
  3 intentos con delays [1000, 3000, 5000] ms. Usa `logWarn` del package observability
  si los 3 intentos fallan.

## 2. INCIDENTE_REPORTADO — reintento

- [ ] 2.1 Reemplazar el bloque `catch (_) { /* degradación elegante */ }` del evento
  `INCIDENTE_REPORTADO` (~línea 108) por una llamada a `publishConReintento(...)`.

## 3. Otros 5 eventos — logWarn

- [ ] 3.1 `INCIDENTE_CERRADO` (~línea 168): reemplazar `catch (_) {}` por
  `catch (err: any) { logWarn(req, 'seguridad', 'seguridad.eventbus.fallo', 'No se pudo publicar INCIDENTE_CERRADO', { error: err.message }); }`

- [ ] 3.2 `INSPECCION_COMPLETADA` (~línea 246): mismo patrón.

- [ ] 3.3 `PERMISO_TRABAJO_EMITIDO` (~línea 328): mismo patrón.

- [ ] 3.4 `PERMISO_TRABAJO_CERRADO` (~línea 384): mismo patrón.

- [ ] 3.5 `CAPACITACION_COMPLETADA` (~línea 487): mismo patrón.

## 4. Deploy

- [ ] 4.1 Build y redeploy: `docker compose build --no-cache seguridad && docker compose up -d seguridad`
- [ ] 4.2 Verificar que el contenedor arranca sin errores.
- [ ] 4.3 Crear un incidente de prueba y confirmar en los logs que no hay errores de EventBus
  (o que aparece el `logWarn` si RabbitMQ está caído).
