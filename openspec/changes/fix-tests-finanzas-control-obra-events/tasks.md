# fix-tests-finanzas-control-obra-events — Tasks

## Contexto

Dos tests de integración de finanzas que prueban eventos de control-obra fallan
al correr contra la BD real del VPS.

---

### Bug A — `control-obra.event.integration.test.ts`

**Error:** El evento `control_obra.estimacion_aprobada` ES recibido por el consumer,
pero el handler `handleEstimacionAprobadaEvent` no crea el registro `programaPagos`.
El `waitFor` agota el timeout sin encontrar el pago.

**Observado en logs:** No aparece `"action":"finanzas.event.estimacion_aprobada.created"`.
Solo se ve la recepción del evento.

**Hipótesis:**
1. El handler lanza una excepción silenciosa (falta registro presupuesto, campo incorrecto, etc.)
2. El handler espera un campo en el payload que el test no envía (ej. `partida_id`)
3. La BD del VPS tiene constrains que rechazan el insert (ej. un campo NOT NULL nuevo)

---

### Bug B — `control-obra.avance-validado.integration.test.ts`

**Error:** El evento `control_obra.avance_fisico_validado` es recibido pero el handler
retorna acción `idempotent` en lugar de `created`, a pesar de que `avanceId = randomUUID()`.

**Observado en logs:**
```
{"action":"finanzas.event.avance_fisico_validado.idempotent","avance_id":"f20ffe60-...","id_pago":"4c2414ca-..."}
```

**El handler encontró un `id_pago` existente para un `avanceId` que debería ser único.**

**Hipótesis:**
1. La llave de idempotencia del handler NO usa `avance_id` sino otro campo
   (ej. `presupuesto_id` o `concepto`), lo que provoca falsos positivos
2. El handler tiene un bug: busca por `referencia_id = presupuesto_id` en vez de `avance_id`

---

## Tasks

- [ ] 1. Leer el handler `handleEstimacionAprobadaEvent` en `apps/finanzas/src/main.ts`
  e identificar:
  - ¿Qué campos del payload usa?
  - ¿Cómo determina si ya existe un pago (idempotencia)?
  - ¿Hay alguna excepción silenciada que impide el insert?

- [ ] 2. Leer el handler `handleAvanceFisicoValidadoEvent` en `apps/finanzas/src/main.ts`
  e identificar:
  - ¿Qué campo(s) usa como clave de idempotencia? ¿`avance_id` o algo más?
  - Si usa otro campo (ej. `presupuesto_id`), el test necesita un presupuesto diferente
    por cada invocación, o el handler necesita corregir la clave

- [ ] 3. Si el bug está en el HANDLER (clave de idempotencia incorrecta):
  - Escribir spec de bug separado en `openspec/changes/fix-handler-avance-idempotencia/`
  - El fix al handler puede romper la idempotencia real en producción → requiere análisis

- [ ] 4. Si el bug está en el TEST (payload incompleto o presupuesto mal seeded):
  - Agregar los campos faltantes al payload del evento en el test
  - Asegurar que el `cleanupTenantData` incluye todos los registros creados por el handler

- [ ] 5. Correr ambos tests en VPS y verificar PASS:
  ```bash
  DATABASE_URL=postgresql://bocam_admin:S77S.52p-016t4t5n7nt@172.18.0.3:5432/bocam_finanzas \
  RABBITMQ_URL=amqp://bocam_broker:OTRO_PASSWORD_SEGURO_5678@172.18.0.8:5672 \
  JWT_SECRET=bocam-e2e-secret \
  node -r ./node_modules/ts-node/register/transpile-only \
    apps/finanzas/test/integration/control-obra.event.integration.test.ts

  DATABASE_URL=postgresql://bocam_admin:S77S.52p-016t4t5n7nt@172.18.0.3:5432/bocam_finanzas \
  RABBITMQ_URL=amqp://bocam_broker:OTRO_PASSWORD_SEGURO_5678@172.18.0.8:5672 \
  JWT_SECRET=bocam-e2e-secret \
  node -r ./node_modules/ts-node/register/transpile-only \
    apps/finanzas/test/integration/control-obra.avance-validado.integration.test.ts
  ```
