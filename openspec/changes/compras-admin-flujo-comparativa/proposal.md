## Why

En la certificación M11 (19 nov 2026, proyecto PRUEBA-M11) el usuario `admin` firmó el cuadro comparativo
(`POST /comparativas/:id/firmar`, roles `residencia` y `admin`) pero `PATCH /comparativas/:id/enviar-gt` respondió
403 `AUTH_FORBIDDEN`: su `requireRoles` no incluye `admin`. Después `admin` sí pudo aprobar en GT
(`PATCH /revisar-gt`). El rol administrador queda atorado a la mitad de un flujo que puede iniciar y terminar.
Las bandejas `GET /comparativas/pendientes-evaluacion` y `GET /comparativas/pendientes-gt` tienen la misma omisión.

## What Changes

- `PATCH /api/v1/compras/comparativas/:id/enviar-gt`: agrega `admin` a los roles permitidos.
- `GET /api/v1/compras/comparativas/pendientes-evaluacion` y `GET /api/v1/compras/comparativas/pendientes-gt`:
  agregan `admin`.
- Prueba en `test/e2e/seguridad.e2e.test.ts`: con token `admin`, las tres rutas no responden 403.

## Impact

- Servicio: `apps/compras` únicamente. Sin migración, sin cambio de contrato ni de eventos.
- Los demás roles conservan exactamente sus permisos.
