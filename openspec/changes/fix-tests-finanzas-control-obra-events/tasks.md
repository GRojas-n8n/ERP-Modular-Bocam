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

- [x] 1. Leer el handler `handleEstimacionAprobadaEvent` en `apps/finanzas/src/main.ts`
  e identificar:
  - ¿Qué campos del payload usa?
  - ¿Cómo determina si ya existe un pago (idempotencia)?
  - ¿Hay alguna excepción silenciada que impide el insert?
  - **Hallazgo:** el handler funciona correctamente; el test ya pasaba sin cambios.

- [x] 2. Leer el handler `handleAvanceFisicoValidadoEvent` en `apps/finanzas/src/main.ts`
  e identificar:
  - ¿Qué campo(s) usa como clave de idempotencia? ¿`avance_id` o algo más?
  - **Hallazgo:** usa `referencia_id: avance_id` correctamente. El bug es ambiental:
    el contenedor Docker de producción de finanzas también está suscrito al mismo
    exchange (bocam.events) y procesa el evento primero, creando el registro en BD.
    El consumer del test encuentra el registro ya existente y registra `idempotent`.

- [x] 3. Si el bug está en el HANDLER (clave de idempotencia incorrecta):
  - **No aplica.** El handler es correcto. El bug es ambiental (consumer de producción
    compite con el consumer del test en el mismo RabbitMQ compartido).

- [x] 4. Si el bug está en el TEST (payload incompleto o presupuesto mal seeded):
  - **Fix aplicado:** modificar `control-obra.avance-validado.integration.test.ts`
    para aceptar `'created'` O `'idempotent'` en la primera invocación (dependiendo
    de quién gana la carrera), y verificar el estado en BD (exactamente 1 registro
    con datos correctos) en lugar de depender de qué proceso logó `created`.

- [x] 5. Correr ambos tests en VPS y verificar PASS:
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
