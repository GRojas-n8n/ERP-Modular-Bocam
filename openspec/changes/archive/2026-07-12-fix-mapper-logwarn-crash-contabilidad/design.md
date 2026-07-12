## Context

`apps/contabilidad/src/mapper.ts` construye las líneas de póliza de partida
doble (`persistMovimientos`) para cada asiento contable generado desde un
evento (pago registrado, OC creada, transferencia presupuestal, etc.). Para
cada línea resuelve el `id_cuenta` de la clave contable correspondiente
(`resolveCuentaId`) contra el catálogo `CuentaContable`.

Cuando una clave no existe en el catálogo, el código ya estaba diseñado para
degradar con gracia: registrar una advertencia y omitir esa línea
(`if (!cuenta) { logWarn(...); return null; }`, seguido de
`if (!cuentaCargoId || !cuentaAbonoId) { logWarn(...); continue; }` en
`persistMovimientos`). El problema es que usa `logWarn(null as any, ...)`
— `logWarn` (de `packages/observability/src/index.ts`) es un logger
HTTP-scoped: internamente hace `req.securityContext` y `req.observabilityContext`
sin optional chaining en el primer acceso relevante
(`extractBaseContext`). Al pasarle `null`, lanza
`TypeError: Cannot read properties of null (reading 'securityContext')`
— justo el bug que el `try/catch` de degradación con gracia estaba tratando
de evitar.

Este código corre exclusivamente desde consumidores de eventos RabbitMQ
(`handlePagoRegistradoEvent` y los demás handlers en `main.ts`), nunca desde
una ruta Express — no existe ningún `req` disponible en ese contexto.

El bug se manifiesta de forma reproducible en CI porque
`.github/workflows/backend-e2e.yml` aplica los schemas de Prisma
(`prisma db push`) pero nunca siembra `cuentas_contables` — el catálogo
llega vacío a cada corrida, así que la primera línea de póliza generada por
cualquier test de integración dispara el `if (!cuenta)` y crashea. Verificado
localmente: reproducido el mismo stack trace ejecutando
`test:integration:finanzas-pago-cfdi` contra una base local recién migrada
sin sembrar.

## Goals / Non-Goals

**Goals:**
- Que una cuenta contable faltante en el catálogo se registre como
  advertencia y la línea se omita, sin abortar el resto del procesamiento
  del evento (comportamiento que el código ya intentaba tener).
- Que el CI aplique el mismo catálogo base que se usa en desarrollo/producción,
  para que los tests ejerciten el camino real (líneas de póliza creadas) en
  vez del camino de degradación (líneas omitidas por catálogo vacío).

**Non-Goals:**
- No se rediseña `logWarn`/`logInfo`/`logError` de `packages/observability`
  para soportar un modo "sin request" — siguen siendo loggers HTTP-scoped;
  el código de eventos usa `console.warn` directo, como ya hacen todos los
  demás manejadores de eventos en `apps/contabilidad/src/main.ts`
  (patrón `console.warn(JSON.stringify({...}))`).
- No se audita ni se corrige el catálogo de cuentas en producción — fuera de
  alcance de este fix (ver nota en proposal.md, Impact).
- No se agregan cuentas nuevas al catálogo — `seed_catalogo_cuentas.sql` ya
  cubre las 8 claves que usa `buildMovimientosForPoliza` (1100, 1200, 2100,
  2200, 4100, 5100, 5110, 6100).

## Decisions

### D1 — Reemplazar `logWarn(null as any, ...)` por `console.warn(JSON.stringify(...))`
Mismo patrón estructurado que ya usan `handlePagoRegistradoEvent` y los
demás handlers de eventos en `main.ts` para sus propios `invalid_payload`
warnings (`console.warn(JSON.stringify({ action, ... }))`). No se introduce
un patrón nuevo — se alinea `mapper.ts` con la convención ya establecida
para código que corre fuera del ciclo de vida de un request HTTP.
Alternativa descartada: crear una variante de `logWarn` que acepte
`context` en vez de `req` (p. ej. `logWarnFromContext(context, ...)`) —
sobre-ingeniería para 3 call-sites; el patrón `console.warn` ya es el
establecido en el mismo archivo (`main.ts`) para este tipo de evento.

### D2 — Sembrar el catálogo de cuentas en CI después de `prisma db push`
Agregar un paso en `.github/workflows/backend-e2e.yml` que ejecute
`apps/contabilidad/prisma/seed_catalogo_cuentas.sql` contra el schema
`contabilidad` de `bocam_ci`, inmediatamente después del paso existente
"Push Prisma schemas". El archivo ya es idempotente (`ON CONFLICT (clave) DO
NOTHING`) y ya está pensado para ejecutarse tras un `db push` fresco (según
su propio comentario: "Ejecutar UNA VEZ tras el primer db push en VPS").
Se usa `psql` (ya disponible en el runner `ubuntu-latest`) apuntando a la
misma URL de `bocam_ci?schema=contabilidad` que usa el paso de `db push`.
Alternativa descartada: mockear/stubear `resolveCuentaId` en los tests —
oscurecería el propósito real de los tests de integración (verificar que
las pólizas de partida doble se generan correctamente end-to-end).

## Risks / Trade-offs

- **[Riesgo] El catálogo de producción podría tener claves faltantes que
  nunca se detectaron porque el crash silencioso ocultaba el warning.** →
  Mitigación: fuera de alcance verificarlo en este change (no hay acceso de
  escritura directa a producción documentado para esta tarea), pero el fix
  del logger hace que, de ahora en adelante, cualquier clave faltante quede
  visible en los logs en vez de abortar el procesamiento completo del
  evento — mejora estrictamente la observabilidad sin cambiar el
  comportamino de negocio.
- **[Riesgo] Agregar el seed a CI podría enmascarar futuras regresiones
  reales en `resolveCuentaId`** (si CI ya no ejercita nunca el camino "cuenta
  no encontrada") → Mitigación: el fix de D1 es independiente de D2 — un
  test futuro que specifically quiera cubrir el camino de degradación puede
  seguir usando una clave inventada que no está en el seed.

## Migration Plan

- Sin migración de datos, sin cambios de schema.
- Branch `fix/mapper-logwarn-crash-contabilidad`.
- Deploy: `apps/contabilidad` requiere rebuild/restart manual del contenedor
  en el VPS (sin CI/CD, igual que el resto del backend) — aunque el fix es
  de bajo riesgo (reemplaza una llamada de logging que hoy crashea por una
  que no crashea), se despliega en el ciclo normal, sin urgencia de
  hotfix inmediato ya que no afecta a usuarios reales hoy.
- El cambio a `backend-e2e.yml` toma efecto en el siguiente push/PR sin
  pasos adicionales.
- Rollback: revertir el commit — cambio aditivo/defensivo, sin riesgo de
  romper datos existentes.

## Open Questions

- Ninguna abierta.
