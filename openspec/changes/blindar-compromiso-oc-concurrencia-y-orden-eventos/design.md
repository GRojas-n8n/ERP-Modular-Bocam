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
- `db push` (CI) no crea el índice parcial: el workflow aplica el SQL de la migración después de `db push`. En producción lo aplica `prisma migrate deploy`.

Riesgos de la recomendación:

- La migración del índice único falla si existen duplicados: por eso la auditoría previa es obligatoria y aborta la migración sin modificar datos (ver decisión 5). En el despliegue el fallo detiene `prisma migrate deploy`.
- El SQL crudo debe respetar RLS y `set_config` de `createTenantContext` (mismo cliente transaccional).
- El advisory lock es a nivel de sesión de la transacción: solo protege mientras la transacción dura; no debe mantenerse durante llamadas HTTP.
- El tombstone crece con las cancelaciones; requiere criterio de retención.

### 3. Compras: transiciones de estado condicionadas

Las transiciones que provocan `fondos_comprometidos` y `presupuesto_insuficiente` se ejecutan como actualización condicional (`updateMany ... WHERE estado IN (...)` y comprobar el conteo), sin lectura previa:

- `fondos_comprometidos`: solo `PENDIENTE_CONFIRMACION_FINANZAS → EMITIDA`. Sobre cualquier otro estado es un no-op registrado (nunca regresa `CANCELADA`, `CANCELACION_PENDIENTE`, `PARCIALMENTE_RECIBIDA` ni `RECIBIDA`).
- `presupuesto_insuficiente`: solo desde `PENDIENTE_CONFIRMACION_FINANZAS`; una OC `EMITIDA` (o posterior) no vuelve a `ERROR_FINANZAS` por un evento tardío.

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
