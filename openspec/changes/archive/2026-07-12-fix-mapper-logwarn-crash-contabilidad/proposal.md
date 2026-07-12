## Why

El workflow de CI `Backend E2E Criticas` lleva fallando de forma consistente
(30/30 corridas recientes en `main`, verificado con `gh run list`) por un bug
preexistente y no relacionado a ningún cambio reciente: cuando el mapeador de
pólizas de `apps/contabilidad` no encuentra una cuenta contable en el
catálogo (`CuentaContable`), intenta registrar una advertencia con
`logWarn(null as any, ...)` — pero `logWarn` es un logger pensado para rutas
HTTP de Express (lee `req.securityContext`/`req.observabilityContext`) y se
está invocando desde código que procesa eventos de RabbitMQ, donde no existe
ningún `req`. El resultado es un `TypeError: Cannot read properties of null
(reading 'securityContext')` que aborta silenciosamente el procesamiento del
evento completo (no solo la línea de póliza afectada), y el mensaje de
advertencia que se intentaba emitir nunca llega a verse.

## What Changes

- `apps/contabilidad/src/mapper.ts`: las 3 llamadas a `logWarn(null as any,
  ...)` dejan de usar el logger HTTP-scoped y usan `console.warn` con el
  mismo patrón de log estructurado (`JSON.stringify`) que ya usan los demás
  manejadores de eventos de `apps/contabilidad/src/main.ts` — consistente
  con que este código corre en un contexto de evento, no de request HTTP.
- El fallo de una línea de póliza por cuenta no encontrada en el catálogo ya
  no aborta el resto del procesamiento del evento (`handlePagoRegistradoEvent`
  y similares) — se registra la advertencia y se continúa, tal como el
  código ya intentaba hacer antes de que el logger crasheara.
- CI (`.github/workflows/backend-e2e.yml`): agrega un paso que aplica
  `apps/contabilidad/prisma/seed_catalogo_cuentas.sql` al schema
  `contabilidad` de la base de CI, después de `Push Prisma schemas` — hoy el
  catálogo de cuentas contables llega vacío a CI (nunca se sembró), lo que
  hacía que el bug del logger se disparara en cada corrida.

## Capabilities

### New Capabilities
- `resiliencia-eventos-contabilidad`: el procesamiento de eventos de
  contabilidad no debe abortar por completo cuando una línea de póliza
  individual no puede resolverse (p. ej. cuenta contable faltante en el
  catálogo) — se registra y se continúa.

### Modified Capabilities
(ninguna — no existe spec previo cubriendo este comportamiento)

## Impact

- **Backend (`apps/contabilidad`)**: `src/mapper.ts` (`resolveCuentaId`,
  `persistMovimientos`) — 3 llamadas a `logWarn`.
- **CI**: `.github/workflows/backend-e2e.yml` — nuevo paso de seed del
  catálogo de cuentas contables antes de correr los tests de integración
  inter-módulo.
- Sin cambios de schema/migraciones. El bug del logger es real e
  independiente del estado del catálogo: crashearía en cualquier entorno
  (incluido producción) si alguna vez falta una cuenta del catálogo al
  resolver una línea de póliza — hoy se manifiesta de forma consistente en
  CI porque ahí el catálogo nunca se siembra (no hay evidencia de que
  producción tenga el mismo vacío, pero tampoco se verificó en este change;
  el fix del logger es correcto de todas formas).
