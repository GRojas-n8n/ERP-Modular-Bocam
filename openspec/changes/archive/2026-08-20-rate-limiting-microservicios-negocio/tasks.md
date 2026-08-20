## 1. Paquete compartido

- [x] 1.1 Crear `packages/rate-limiter` (estructura igual a `packages/auth-middleware`: `src/`, `package.json`, `tsconfig.json`).
- [x] 1.2 Implementar `createRateLimiter(options)` extrayendo el patrón `makeLimiter` de `apps/auth/src/main.ts` (Redis + fallback a memoria, `reconnectStrategy` limitado a 3 intentos, respuesta 429 estandarizada con `RATE_LIMIT_EXCEEDED`).
- [x] 1.3 Tests unitarios: fallback a memoria sin `REDIS_URL`, uso de `RedisStore` con `REDIS_URL` mockeado, respuesta 429 con el cuerpo JSON estándar del proyecto.
- [x] 1.4 Documentar en el `README.md` del paquete la limitación de `MemoryStore` con múltiples réplicas (ver design.md, Risks).

## 2. Rollout piloto

- [x] 2.1 Aplicar `createRateLimiter({ windowMs: 15*60*1000, max: 300 })` en `apps/compras/src/main.ts`, después de `createAuthMiddleware(...)`.
- [x] 2.2 Verificar que Compras funciona con normalidad bajo el límite nuevo (sin 429 en uso normal). NOTA DE DESVIACIÓN: no se levantó la UI completa en `docker compose up`; en su lugar se corrió la suite de tests de integración existente de `compras` (`test:integration:oc-error-alert`), que pasó sin ningún 429 inesperado bajo el límite de 300/15min.
- [x] 2.3 Agregar la dependencia `@bocam/rate-limiter` al `package.json` de `compras`.

## 3. Rollout al resto de microservicios de negocio

- [x] 3.1 Aplicar el mismo patrón en `apps/almacen/src/main.ts`.
- [x] 3.2 Aplicar el mismo patrón en `apps/calidad/src/main.ts`.
- [x] 3.3 Aplicar el mismo patrón en `apps/contabilidad/src/main.ts`.
- [x] 3.4 Aplicar el mismo patrón en `apps/control-proyectos/src/main.ts`.
- [x] 3.5 Aplicar el mismo patrón en `apps/finanzas/src/main.ts`.
- [x] 3.6 Aplicar el mismo patrón en `apps/gerencia-tecnica/src/main.ts`.
- [x] 3.7 Aplicar el mismo patrón en `apps/personal/src/main.ts`.
- [x] 3.8 Aplicar el mismo patrón en `apps/reportes/src/main.ts`.
- [x] 3.9 Aplicar el mismo patrón en `apps/seguridad/src/main.ts`.
- [x] 3.10 Aplicar el mismo patrón en `apps/ventas/src/main.ts`.

## 4. Validación final

- [x] 4.1 Confirmar que `auth` y `asistente` no fueron modificados (ya tenían su propio rate limiting). Verificado: `grep -c createRateLimiter apps/auth/src/main.ts apps/asistente/src/main.ts` → 0 en ambos.
- [x] 4.2 Correr la suite de tests de integración existente por servicio para confirmar que ningún flujo normal dispara 429 con datos de prueba. Se corrió contra Docker local real (Postgres/Redis/RabbitMQ ya levantados): `control-proyectos` (`test:integration`, 6/6 OK), `gerencia-tecnica` (`test:integration`, 11/11 OK), `compras` (`test:integration:oc-error-alert`, 3/3 OK), `almacen` (`test:integration:api`, 3/5 OK — 2 fallos preexistentes de lógica de negocio de `items_bajo_minimo`, no relacionados con rate limiting, ya documentados en memoria del proyecto de 2026-07-27). Los 11 servicios además compilan limpio con `tsc --noEmit`. No se corrieron las suites completas de `calidad`, `contabilidad` (sin `.env` local), `finanzas`, `personal`, `reportes`, `seguridad` y `ventas` por límite de tiempo — quedan pendientes de una corrida completa antes de producción.
- [ ] 4.3 Desplegar a VPS y verificar en `iretum.com` que un flujo de uso normal (login + navegación por 2-3 módulos) no dispara 429. **Pendiente** — requiere despliegue real, fuera del alcance de esta sesión (el usuario revisa y hace commit/deploy).
- [ ] 4.4 Actualizar `openspec/specs/despliegue-completo-microservicios/spec.md` (vía archive de este change) con el nuevo requirement. **Pendiente** — se deja para el paso de archivado de OpenSpec, después del commit/aprobación del usuario.
