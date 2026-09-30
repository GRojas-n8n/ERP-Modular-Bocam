## 1. Evidencia previa

- [x] 1.1 Trazar los caminos de compromiso y liberación en `convertir-oc`, Finanzas y GT (revisión de repositorio, 2026-09-30).
- [x] 1.2 Consulta productiva agregada de solo lectura: duplicados de `COMPROMISO` y `LIBERACION`, compromisos sin liberación, liberaciones sin compromiso, restricciones e índices, aislamiento. Resultado: tabla vacía (0 filas); solo índices no únicos; `read committed`.
- [ ] 1.3 **Titular:** auditar los mismos conteos en los demás entornos con datos antes de la migración.

## 2. Pruebas obligatorias (PostgreSQL real, sin simular el motor; una por escenario)

Primer PR (Finanzas): `compromiso-oc-concurrencia.integration.test.ts` (16 pruebas), `compromiso-oc-rls.integration.test.ts` (7) y `compromiso-oc-migracion.integration.test.ts` (8). Antes de implementar, la suite (12 pruebas en ese momento, sin la migración) falló 11 de 12 con el código previo: duplicados reales de `COMPROMISO` y `LIBERACION`, sobrecompromiso y falta de tombstone; con la implementación pasa 16/16.

- [x] 2.1 HTTP `comprometer-fondos` y evento `oc_creada` concurrentes sobre la misma OC → un solo `COMPROMISO`, un solo incremento de `monto_comprometido` (pruebas 1 y 3).
- [x] 2.2 `partida_comprometida` y `oc_creada` concurrentes → un solo `COMPROMISO` (prueba 2).
- [x] 2.3 Duplicado del mismo evento (secuencial y concurrente) → un solo efecto (pruebas 1 y 4).
- [x] 2.4 Cancelación antes de creación → sin compromiso residual tras procesar ambas; la creación tardía es un no-op (prueba 5; concurrente en 10c).
- [x] 2.5 Creación después de cancelación (misma OC ya cancelada) → sin compromiso nuevo, por evento y por HTTP (`409`) (prueba 6).
- [x] 2.6 `fondos_comprometidos` tardío sobre una OC `CANCELADA` (y sobre `RECIBIDA`/`PARCIALMENTE_RECIBIDA`/`CANCELACION_PENDIENTE` y los estados heredados) → el estado no cambia (segundo PR, `oc-transiciones-eventos-finanzas`, incluida la matriz completa de estados).
- [x] 2.7 `presupuesto_insuficiente` tardío sobre una OC `EMITIDA`, en recepción, recibida o cancelada → el estado no cambia, sin alerta ni publicación (segundo PR).
- [x] 2.8 Liberación sin compromiso de esa OC → no libera; no consume el compromiso de otra OC del mismo presupuesto (pruebas 8 y 9).
- [x] 2.9 Dos cancelaciones concurrentes (HTTP y evento) → una sola `LIBERACION` (prueba 7).
- [x] 2.10 Evento idempotente → no republica datos falsos (prueba 4).
- [x] 2.11 Migración: con duplicados preexistentes aborta sin modificar nada; sin duplicados crea el índice; el rollback deja el esquema original (prueba 11). Verificada además con `prisma migrate deploy` real sobre un esquema con la línea base previa (sin deriva respecto a `schema.prisma`).
- [x] 2.12 Presupuesto insuficiente, incluida la concurrencia entre OC distintas (pruebas 10a y 10b).
- [x] 2.13 Creación y cancelación concurrentes de la misma OC → estado final consistente (prueba 10c).
- [x] 2.14 El índice único rechaza el segundo `COMPROMISO`/`LIBERACION` aun sin lock, y no afecta a otros tipos ni entidades (prueba 10d).
- [x] 2.15 RLS: el flujo funciona con un rol sin `BYPASSRLS` y tablas con `FORCE RLS`; los tenants y proyectos se aíslan; el tombstone es inmutable; la unicidad incluye `tenant_id` (`compromiso-oc-rls`).
- [x] 2.16 Mutaciones (suite actual de 16 + 7): sin el índice fallan 12 de 16; sin el advisory lock falla la 10c; sin el tombstone fallan 5, 6 y 8; sin validación de UUID falla la 10e; sin el CHECK falla la 10f; sin `BEGIN`/`COMMIT` falla la prueba estática de transacción explícita.
- [x] 2.17 Migración atómica: transacción explícita, precheck antes de cualquier DDL (también rechaza movimientos de OC sin `referencia_id`), fallo inyectado posterior al precheck sin esquema parcial (esquema descartable) y control positivo idempotente (`compromiso-oc-migracion`, 8 pruebas, incluida la ejecución con un rol dueño de las tablas pero no de las funciones RLS, como el rol de runtime de producción).
- [x] 2.18 Paridad de RLS entre la migración y `rls-policies.sql`, y uso del SQL canónico en el CI (pruebas estáticas).
- [x] 2.19 Referencias de OC inválidas se rechazan antes del INSERT (400 / `invalid_payload`) y el CHECK cierra el NULL (pruebas 10e y 10f).

- [x] 2.20 Compras (segundo PR, 18 pruebas en `oc-transiciones-eventos-finanzas`): matriz tabla-dirigida sobre 7 estados canónicos + 3 heredados para los tres eventos; eventos concurrentes sin estados divergentes; evento duplicado idempotente; transición válida; cancelación concurrente vs evento tardío; `ERROR_FINANZAS → EMITIDA` solo con compromiso confirmado de la misma OC, tenant y proyecto; `fondos_liberados` solo desde `CANCELACION_PENDIENTE` (repetido idempotente, tardío sobre EMITIDA/ERROR_FINANZAS/PARCIALMENTE_RECIBIDA/RECIBIDA, otro tenant/proyecto, dos liberaciones concurrentes con un solo efecto aplicado, recepción concurrente con liberación tardía). Rojo previo de lo nuevo: 6 de 7 fallaban. Mutaciones: sin la condición de estado fallan 12/18; sin filtro de tenant/proyecto fallan 2; lista blanca de `fondos_liberados` ampliada a EMITIDA/ERROR_FINANZAS fallan 3; sin exigir compromiso confirmado falla 1; lectura previa + actualización por id fallan 2; sin resolver la alerta fallan 2.

## 3. Implementación (por PR y servicio)

- [x] 3.1 Migración de Finanzas: comprobación de duplicados, índice único parcial, tabla de tombstone con RLS forzado (`20260930120000_blindar_compromiso_oc`, con `rollback.sql`).
- [x] 3.2 Finanzas: inserción atómica y advisory lock por OC en los tres caminos de compromiso y los dos de liberación (`apps/finanzas/src/compromiso-oc.ts`).
- [x] 3.3 Compras: transiciones condicionadas de `fondos_comprometidos`, `presupuesto_insuficiente` y `fondos_liberados` (`oc-estados.ts`, `transicionarEstadoOc`; segundo PR).
- [x] 3.4 Finanzas: eventos idempotentes sin datos falsos (`oc_creada` ya no republica `fondos_comprometidos` cuando el compromiso existía).

## 4. Cierre

- [x] 4.1 Suite completa en verde en CI para el primer PR (Finanzas): `backend-e2e` y Cobertura RLS en verde en #185 (concurrencia 14/14 y RLS 7/7 ejecutadas en el job; el `MIGRACION_ABORTADA` que aparece en el log de Postgres es el escenario deliberado de duplicados de la prueba 11). Falta el segundo PR (Compras).
- [ ] 4.2 Confirmar que #182 puede reanudarse (junto con la aprobación contable).
- [ ] 4.3 Archivar el change.
