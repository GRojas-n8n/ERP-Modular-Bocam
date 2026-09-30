## Context

Flujo actual del compromiso de una OC (`convertir-oc`, Compras):

```
OC creada → (con partida) EMITIDA → HTTP GT /comprometer ─► GT publica partida_comprometida ─► Finanzas: COMPROMISO
          → (sin partida) HTTP Finanzas /comprometer-fondos ─► COMPROMISO (+ publica fondos_comprometidos)
          → publica compras.oc_creada (hoy descartado; tras #182 ─► Finanzas: COMPROMISO o "idempotente")
Cancelación: HTTP Finanzas /liberar-fondos → LIBERACION, luego publica compras.oc_cancelada ─► Finanzas: LIBERACION
```

Hechos verificados en el repositorio y en producción (solo lectura):

- `movimientos_presupuestales`: PK, FK a `presupuestos_asignados` e índices no únicos (`referencia_id`, `(tenant_id, presupuesto_id)`, `(tenant_id, proyecto_id)`). Sin restricción de unicidad sobre la clave lógica. Datos en producción: 0 filas.
- `createTenantContext` (Finanzas) abre `$transaction` interactiva de Prisma con el aislamiento por defecto (`read committed`, confirmado en el servidor) y `set_config` para RLS. Ningún handler usa `SELECT ... FOR UPDATE`, advisory locks ni `isolationLevel`.
- Las actualizaciones de `monto_comprometido` / `monto_disponible` usan `increment`/`decrement` atómicos, pero la suficiencia se decide con una lectura previa sin bloqueo.
- El handler de `oc_cancelada` compara `monto_comprometido` del presupuesto contra el monto a liberar; no comprueba que exista un `COMPROMISO` de esa OC.
- En Compras, `OC_STATUS`: `PENDIENTE_CONFIRMACION_FINANZAS`, `ERROR_FINANZAS`, `EMITIDA`, `PARCIALMENTE_RECIBIDA`, `RECIBIDA`, `CANCELACION_PENDIENTE`, `CANCELADA`.

## Goals / Non-Goals

**Goals**

- Que los invariantes de la spec se cumplan por construcción (base de datos), no por convención del código.
- Comportamiento definido ante eventos fuera de orden y repetidos.
- Migración segura para entornos con datos.

**Non-Goals**

- Decidir el tratamiento contable del pasivo (lo decide el responsable contable, ver formulario).
- Cambiar el contrato de `oc_creada` (lo hace #182).
- Implementar nada en esta fase.

## Decisions

### 1. Alternativas técnicas

| Alternativa | Qué garantiza | Costo / riesgos |
|---|---|---|
| **A. Índice único parcial + inserción atómica** (`INSERT ... ON CONFLICT DO NOTHING RETURNING`) sobre `(tenant_id, referencia_modulo, referencia_entidad, referencia_id, tipo)` para `tipo IN ('COMPROMISO','LIBERACION')` y `referencia_entidad = 'OrdenCompra'` | Como máximo un compromiso y una liberación por OC, aunque concurran N caminos; lo impone la BD y cubre caminos futuros | Migración con auditoría previa de duplicados; Prisma no expresa `ON CONFLICT` sobre índices parciales, requiere SQL crudo (`$queryRaw`); un `create` que viole la restricción aborta la transacción en Postgres, por lo que no sirve el patrón `try/catch P2002` dentro de la misma transacción. Por sí sola no resuelve el orden creación/cancelación. |
| **B. Advisory lock por OC** (`pg_advisory_xact_lock` sobre la OC al inicio de cada handler/endpoint) | Serializa los caminos de una misma OC, incluido el orden creación/cancelación; sin migración | Depende de que **todos** los caminos lo adquieran (disciplina, no garantía de BD); un camino nuevo sin lock reabre la carrera. |
| **C. Aislamiento `SERIALIZABLE`** | El motor detecta las anomalías | Exige reintentar los fallos `40001` en todos los handlers; riesgo de contención sobre la fila del presupuesto; cambio amplio en `createTenantContext`. |
| **D. Tabla de estado por OC** (`(tenant_id, oc_id)` con estado: sin compromiso / comprometida / liberada / cancelada previa), con `SELECT ... FOR UPDATE` o `ON CONFLICT` | Una única fuente de verdad con máquina de estados explícita; cubre el desorden | Tabla y migración nuevas, backfill y más superficie. |
| **E. Tombstone de cancelación anterior a la creación** (fila que marca "OC cancelada, ignora una creación tardía") | Define el comportamiento de `cancelada` antes de `creada` | Sola no resuelve la concurrencia; necesita A o B para ser atómica. |

### 2. Recomendación: A + B + E (tabla de tombstone), sin C ni D completa

1. **A** impone en la BD "máximo un `COMPROMISO` y una `LIBERACION` por OC", con inserción atómica; los tres caminos de compromiso y los dos de liberación pasan por la misma función de inserción.
2. **B** (advisory lock por `(tenant, oc_id)`) serializa la decisión creación/cancelación **dentro** de la transacción, de modo que "¿hay compromiso? ¿hay tombstone/liberación?" y la inserción se evalúen sin intercalarse.
3. **E** registra la cancelación cuya creación aún no llegó (tombstone) para que una creación posterior sea un no-op definido y una liberación sin compromiso no consuma el compromiso de otra OC. Se implementa como tabla mínima `(tenant_id, oc_id)` con PK, no como una fila ficticia en `movimientos_presupuestales`, para no contaminar los totales.
4. Se descarta **C** por el costo de reintentos y contención, y **D** como sobredimensionada mientras A+B+E cubran los invariantes; se reevalúa si aparecen más estados.

**Decisión aprobada por el titular (2026-09-30):** índice único parcial para `COMPROMISO` y `LIBERACION`; inserción atómica; advisory transaction lock por tenant + OC; tombstone para cancelación anterior a creación; **sin** `SERIALIZABLE`; **sin** llamadas HTTP mientras se mantiene el lock (el llamador publica eventos después del commit); **sin** eliminación automática de tombstones en este change.

Concreciones de la implementación (primer PR, Finanzas):

- Alcance del índice: además de los tipos `COMPROMISO`/`LIBERACION`, se limita a `referencia_modulo='compras'` y `referencia_entidad='OrdenCompra'`, porque el endpoint genérico de movimientos y la nómina (`personal`/`PreNomina`) usan `COMPROMISO` con otras referencias y no comparten esta regla.
- El saldo del presupuesto se actualiza con un `UPDATE` condicional atómico (`monto_disponible >= monto`) y, si no alcanza, la transacción se aborta (el movimiento insertado no persiste). Esto además evita el sobrecompromiso entre OC distintas que concurren sobre el mismo presupuesto (observado en las pruebas previas a la implementación: 2000 comprometidos sobre un presupuesto de 1000).
- La liberación usa el monto y el presupuesto del `COMPROMISO` exacto de esa OC, no los del payload.
- `POST comprometer-fondos` responde `409` si la OC ya fue cancelada; `POST liberar-fondos` sobre una OC sin compromiso responde `201` con `monto_liberado: 0` y registra el tombstone (antes respondía `500`).
- Alcance del índice confirmado por el titular (2026-09-30): solo `referencia_modulo='compras'`, `referencia_entidad='OrdenCompra'` y tipos `COMPROMISO`/`LIBERACION`; no se amplía a movimientos genéricos ni a nómina. Los tombstones se conservan sin limpieza automática en este change.
- Atomicidad de la migración: el script va dentro de `BEGIN`/`COMMIT` y el precheck es lo primero, antes de cualquier DDL. `prisma migrate deploy` y `prisma db execute` envían el script en un solo lote (ya atómico de forma implícita); el `BEGIN`/`COMMIT` explícito protege a los runners sentencia por sentencia como `psql -f`, que es lo que usa el CI. Comprobado con un fallo inyectado después del precheck (una función con otro tipo de retorno hace fallar `CREATE OR REPLACE FUNCTION`): con `BEGIN`/`COMMIT` no queda índice ni tabla; sin ellos y con un runner sentencia por sentencia sí quedan (índice y tabla).
- Ejecutable con el rol de runtime: `prisma migrate deploy` corre en el contenedor del servicio con su `FINANZAS_DATABASE_URL` (rol de runtime), que no es dueño de las funciones `current_tenant_id()` / `current_proyecto_id()` (las aplica `rls-policies.sql` como superusuario). Por eso la migración ya no usa `CREATE OR REPLACE FUNCTION`: crea esas funciones solo si no existen. Una prueba ejecuta la migración con un rol dueño de las tablas y no de las funciones; con la versión anterior falla. Sigue siendo requisito que ese rol sea dueño de `movimientos_presupuestales` y tenga `CREATE` sobre el esquema (ver el preflight de despliegue).
- `referencia_id` NULL: el índice solo cubre `referencia_id IS NOT NULL`, así que un movimiento de OC sin referencia lo evadiría (el endpoint genérico acepta referencias arbitrarias). Se cierra con un CHECK `chk_movimiento_oc_referencia_id` (COMPROMISO/LIBERACION de compras/OrdenCompra exigen `referencia_id`) y el precheck de la migración rechaza datos previos que lo incumplan. Además, ningún camino llega al INSERT con una OC sin UUID válido: los endpoints responden `400` (`FIN_INVALID_REFERENCE`) y los handlers registran `invalid_payload` y no hacen nada.
- Paridad: las sentencias RLS del tombstone en la migración y en `rls-policies.sql` son idénticas (lo verifica una prueba estática); el CI aplica el archivo canónico de la migración con `psql -f`, sin copia inline (también verificado por una prueba estática).
- `db push` (CI) no crea el índice parcial: el workflow aplica el SQL de la migración después de `db push`. En producción lo aplica `prisma migrate deploy`.

Entornos persistentes y preflight de la migración: el VPS es el único entorno persistente activo demostrado. El stack QNAP de preproducción (`docker-compose.qnap.yml`, `scripts/qnap`) y `docker-compose.prod.yml` se clasifican como históricos/no verificados: no se consideran bloqueantes. Si vuelven a utilizarse, antes de aplicar la migración deberán ejecutar, sobre su base de Finanzas, (a) el conteo de grupos duplicados de `COMPROMISO`/`LIBERACION` para `compras`/`OrdenCompra` (`GROUP BY tenant_id, referencia_modulo, referencia_entidad, referencia_id, tipo HAVING count(*) > 1`) y (b) el conteo de movimientos de ese alcance con `referencia_id IS NULL`, ambos con resultado 0, y comprobar que el rol de runtime es dueño de `movimientos_presupuestales`, tiene `CREATE` sobre el esquema y que existen las funciones `current_tenant_id()` / `current_proyecto_id()`. El "staging" que aparece en `docker-compose.vps.yml` es un *profile* de compose dentro del mismo VPS, no otro entorno.

Comportamiento de `liberar-fondos` sin compromiso (documentado): registra el tombstone, libera 0, responde `201` con `idempotente: true`, `no_op: true`, `motivo: 'SIN_COMPROMISO'`, `tombstone_registrado: true`, `monto_liberado: 0` y `movimiento_id: ''`, no publica `fondos_liberados` y deja un log estructurado `finanzas.liberar_fondos.no_op_sin_compromiso` sin montos ni datos de negocio sensibles. Antes respondía `500` y dejaba la OC en `CANCELACION_PENDIENTE`.

Caminos idempotentes y publicación de eventos (Finanzas):

| Camino | Antes | Ahora |
|---|---|---|
| `POST comprometer-fondos`, compromiso ya existente | publicaba `fondos_comprometidos` (`idempotente: true`, saldo 0 ficticio) | **no publica**; la respuesta HTTP lleva el saldo real |
| `oc_creada`, compromiso ya existente | ídem | **no publica** |
| `oc_creada` / `partida_comprometida` / `comprometer-fondos` con OC ya cancelada | (no contemplado) | no publica; HTTP responde `409` |
| `partida_comprometida`, compromiso ya existente | no publicaba | igual |
| `POST liberar-fondos`, liberación ya existente | publicaba `fondos_liberados` (`idempotente: true`, datos reales) | igual (publica) |
| `oc_cancelada`, liberación ya existente | publicaba `fondos_liberados` (`idempotente: true`, datos reales) | igual (publica) |
| `liberar-fondos` / `oc_cancelada` sin compromiso | HTTP `500`; evento sin publicar | no publica |

Riesgo registrado: mientras los publicadores sigan siendo fire-and-forget (change aparte), republicar ante un duplicado era una recuperación accidental de un `fondos_comprometidos` perdido. Al dejar de republicar, si el primer `fondos_comprometidos` se pierde, Contabilidad (que lo usa para conciliar el pasivo proyectado) no lo recibirá de nuevo. Se acepta porque el evento republicado llevaba un saldo ficticio; se cierra con el change de confiabilidad de publicadores (outbox), que debe cubrir `fondos_comprometidos`.

Riesgos de la recomendación:

- La migración del índice único falla si existen duplicados: por eso la auditoría previa es obligatoria y aborta la migración sin modificar datos (ver decisión 5). En el despliegue el fallo detiene `prisma migrate deploy`.
- El SQL crudo debe respetar RLS y `set_config` de `createTenantContext` (mismo cliente transaccional).
- El advisory lock es a nivel de sesión de la transacción: solo protege mientras la transacción dura; no debe mantenerse durante llamadas HTTP.
- El tombstone crece con las cancelaciones; requiere criterio de retención.

### 3. Compras: transiciones de estado condicionadas (implementadas en el segundo PR)

Las transiciones que provocan los eventos de Finanzas se ejecutan como actualización condicional atómica (`updateMany ... WHERE id_orden AND tenant_id AND proyecto_id AND estado IN (lista blanca)`), sin lectura previa como protección. El evento solo puede afectar a **su misma OC, tenant y proyecto**. Si el conteo actualizado es cero se registra un no-op con el estado actual, sin modificarlo y sin efectos secundarios:

- `fondos_comprometidos` → `EMITIDA`, desde `PENDIENTE_CONFIRMACION_FINANZAS` o `ERROR_FINANZAS`, y solo si el evento representa un compromiso confirmado por Finanzas (trae `movimiento_id` y `monto_comprometido` > 0; de lo contrario se descarta como `invalid_payload`). Desde `ERROR_FINANZAS` se conserva la auto-recuperación (decisión del titular): Finanzas confirma un compromiso real, p. ej. tras un timeout de la llamada HTTP, y la alerta de error de la OC se marca resuelta en la misma transacción. Sobre cualquier otro estado es un no-op.
- `presupuesto_insuficiente` → `ERROR_FINANZAS`, solo desde `PENDIENTE_CONFIRMACION_FINANZAS`. La alerta y la publicación de `compras.oc_error_finanzas` ocurren solo cuando la transición se aplicó (antes se publicaba siempre, incluso en un no-op).
- `fondos_liberados` → `CANCELADA`, solo desde `CANCELACION_PENDIENTE`. Flujo real comprobado en el código: `POST ordenes-compra/:id/cancelar` fija `CANCELACION_PENDIENTE` **antes** de llamar a `liberar-fondos`; si Finanzas responde, la ruta fija `CANCELADA` y publica `oc_cancelada`; el evento `fondos_liberados` de Finanzas puede llegar antes o después de ese último paso (en ambos casos es `applied` o idempotente). `reconciliar-finanzas` reanuda una OC que quedó en `CANCELACION_PENDIENTE`. Una OC sin `presupuesto_id` se cancela sin pasar por Finanzas. Por tanto ningún camino legítimo espera que `fondos_liberados` cancele una OC en otro estado. `CANCELADA` repetida es idempotente y sin efectos.


### 10. Estados de la OC y matriz de transiciones (Compras)

`OrdenCompra.estado` es un `String` libre (sin enum ni restricción en BD); su comentario en el esquema está desactualizado. Fuente de verdad en código: `apps/compras/src/oc-estados.ts`.

Estados que Compras asigna: `PENDIENTE_CONFIRMACION_FINANZAS`, `ERROR_FINANZAS`, `EMITIDA`, `PARCIALMENTE_RECIBIDA`, `RECIBIDA`, `CANCELACION_PENDIENTE`, `CANCELADA`. Heredados sin escritor (existen en el esquema o en dashboards, ningún camino de Compras los asigna): `BORRADOR` (valor por defecto del esquema), `PENDIENTE`, `APROBADA`; `COBRADA` solo aparece como guarda en la ruta de cancelación y en la UI (viene de Ventas).

**Nombre canónico:** el valor almacenado es `PENDIENTE_CONFIRMACION_FINANZAS`. `PENDIENTE_FINANZAS` es únicamente el nombre del identificador en el código (`OC_STATUS.PENDIENTE_FINANZAS`); el literal `PENDIENTE_FINANZAS` no existe como valor en ninguna parte (una prueba lo verifica). No se renombró nada.

Matriz (✅ permitida · ❌ prohibida / no-op · = no-op idempotente). Las tres primeras columnas (eventos de Finanzas) las impone este PR con pruebas; las demás describen el comportamiento existente de las rutas HTTP, que no se modifica aquí:

| Estado origen | `fondos_comprometidos` → EMITIDA | `presupuesto_insuficiente` → ERROR_FINANZAS | `fondos_liberados` → CANCELADA | Cancelación (ruta) | Recepción parcial (ruta) | Recepción total (ruta) | Error de Finanzas (`convertir-oc`) |
|---|---|---|---|---|---|---|---|
| `PENDIENTE_CONFIRMACION_FINANZAS` | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ → ERROR_FINANZAS |
| `ERROR_FINANZAS` | ✅ (resuelve la alerta) | = | ❌ | ✅ | ❌ | ❌ | — |
| `EMITIDA` | = | ❌ | ❌ | ✅ | ✅ → PARCIALMENTE_RECIBIDA | ✅ → RECIBIDA | — |
| `PARCIALMENTE_RECIBIDA` | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ → RECIBIDA | — |
| `RECIBIDA` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | — |
| `CANCELACION_PENDIENTE` | ❌ | ❌ | ✅ | ✅ → CANCELADA (reconciliación); repetir la cancelación ❌ | ❌ | ❌ | — |
| `CANCELADA` | ❌ | ❌ | = | = | ❌ | ❌ | — |
| `BORRADOR`, `PENDIENTE`, `APROBADA` (heredados) | ❌ | ❌ | ❌ | (la ruta los admite) | ❌ | ❌ | — |

Ningún evento de Finanzas modifica una OC de otro tenant o proyecto, ni de otra OC.

Riesgos pendientes (rutas HTTP, fuera de este PR): cancelación, recepción y reconciliación siguen usando lectura previa seguida de actualización; la concurrencia entre recepción y liberación queda cubierta desde el lado del evento (el evento tardío no afecta a la recepción), no desde el de la ruta.

### 4. Eventos idempotentes

Si el compromiso o la liberación ya existían, el handler NO republica un evento con valores inventados. Se acepta una de dos: no publicar, o publicar con `monto_disponible_restante` real leído del presupuesto y la marca `idempotente: true`. Se decide en el diseño detallado, considerando que el camino por partida no publica `fondos_comprometidos` y Contabilidad lo usa para conciliar.

### 5. Migración

1. Auditoría de duplicados por la clave lógica (solo lectura, recuento agrupado). Si hay duplicados: la migración aborta con mensaje y no modifica datos; la limpieza se decide aparte con el titular.
2. Crear el índice (única parcial) solo si la auditoría da 0.
3. Rollback: `DROP INDEX` (y de la tabla de tombstone) sin pérdida de datos de negocio; se prueba explícitamente.
4. Producción hoy tiene 0 filas; los demás entornos se auditan antes.

## Risks / Trade-offs

- Sin A, la carrera vuelve con el primer camino nuevo; sin B, el orden creación/cancelación sigue indefinido.
- Endurecer Finanzas antes de #182 no cambia la contabilidad: la aprobación contable sigue siendo un bloqueo independiente.
- El change no elimina el riesgo, ya existente, de un `oc_cancelada` procesado sin compromiso previo; lo cierra (invariante de liberación) pero cambia su comportamiento: hoy devuelve `monto_liberado: 0` sin publicar; después registrará el tombstone.

## Evidencia de despliegue (2026-09-30)

| Hecho | Evidencia |
|---|---|
| #185 (Finanzas) fusionado | merge `8da1afe` (11:09 -0600) |
| Primer intento del deploy fallido | run `36749362201`, intento 1: falló en `Configurar llave SSH` (`ssh-keyscan`, exit 1) antes de cualquier acción en producción; `Smoke Test Playwright` `skipped` |
| Reintento | mismo run, intento 2: `Build + Deploy backend` y smoke en `success` (smoke: 2 passed) |
| Migración | `20260930120000_blindar_compromiso_oc` aplicada; índice único parcial, CHECK, tombstone y RLS verificados |
| #186 (Compras) fusionado | merge `e823fa0` (11:58 -0600) |
| Deploy de #186 | run `36755222127` (`push`, sha `e823fa0`), `success`: detección de servicios, build + deploy backend y smoke |
| Estado posterior | Compras y Finanzas healthy; dispatcher del outbox de Compras activo (`COMPRAS_OUTBOX_DISPATCHER=on`), `/ready` en `ok`; 10 colas de Finanzas y RabbitMQ vacías |
| Datos | sin órdenes de compra, movimientos, tombstones ni filas pendientes del outbox; no se crearon datos de prueba |
| Respaldos | conservados (incluido `pre-pr185`) |

### Smoke del run `36755222127`: análisis

Comando: `npm run test:smoke` → `playwright test --config=playwright.smoke.config.ts` (`testMatch: **/*.smoke.spec.ts`), ejecutado por `smoke-test-playwright.yml`, reutilizado como job final por `deploy-vps-backend.yml` y `deploy-vps.yml`. Salida: `Running 2 tests using 1 worker`; `✓ 1 login y dashboard cargan sin errores tras el deploy`; `✓ 2 sin proyecto activo, los módulos project-scoped quedan bloqueados sin consultar datos`; `2 passed (5.2s)`.

Comparación (mismo workflow reutilizable, mismo comando, mismo spec):

| Deploy | Run | Pruebas ejecutadas |
|---|---|---|
| #177 (frontend) | `36642004793` | 2 passed |
| #169 (backend) | `36645918565` | 2 passed |
| #185 (backend, reintento) | `36749362201` | 2 passed |
| #186 (backend) | `36755222127` | 2 passed |

Conclusión: **no se omitió ningún smoke**. El único job visible se llama «Login + dashboard (Playwright)» (nombre del job en `smoke-test-playwright.yml`), pero ejecuta las dos pruebas del spec, incluida `sin proyecto activo`. Clasificación: **reporte incompleto** (nombre de job que describe solo la primera prueba); descartados filtro accidental, prueba no descubierta, regresión de configuración y diferencia backend/frontend (ambos invocan el mismo workflow). Mejora opcional y separada (fuera de este change): renombrar el job a algo como «Smoke post-deploy (Playwright)».

