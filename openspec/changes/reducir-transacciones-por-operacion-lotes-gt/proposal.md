## Why

`createTenantContext()` (`apps/gerencia-tecnica/src/db.ts:70-133`) es el único de los 10 microservicios de este repo (Compras, Finanzas, Personal, Contabilidad, Control de Proyectos, Almacén, Calidad, Seguridad, Ventas, Auth — todos verificados) que envuelve **cada operación de Prisma individualmente** en su propia `basePrisma.$transaction(...)`. Los otros 10 usan el mismo patrón entre sí: `createTenantContext(context, callback)` — una sola transacción, `set_config()` una vez, el callback ejecuta todas las operaciones que necesite dentro de esa misma transacción. Gerencia Técnica quedó fuera de ese patrón: su `createTenantContext(ctx)` devuelve un cliente y cada llamada (`db.insumo.update()`, etc.) abre y cierra su propia transacción por separado.

El costo real: cuatro endpoints hacen un loop de operaciones secuenciales contra ese cliente, cada iteración pagando el overhead completo de una transacción nueva (`BEGIN`, `SET TRANSACTION ISOLATION LEVEL`, 2× `set_config`, la query real, `COMMIT` — hasta 5 round-trips por fila):
- `POST /insumos/importar-lote` — loop "actualizar existentes" (`main.ts:414`), hasta 5000 filas (cap ya existente en el endpoint).
- `POST /composicion-apu` — loop anidado concepto×insumo (`main.ts:765-811`), sin cap explícito; un archivo APU real puede traer "cientos de insumos por partida" en decenas de conceptos (ver `openspec/specs/pre-req-gt`), fácilmente miles de iteraciones — cada una con `findUnique` + `update`/`create` (hasta 2 transacciones por fila).
- El endpoint deprecado `POST /presupuestos/:presupuesto_id/composicion-apu` (`main.ts:830-899`) — copia casi idéntica del loop anterior, mismo problema.
- `PUT /insumos/clasificacion-bulk` (`main.ts:1467-1503`) — sin cap explícito, un `update` por fila.

No hay `connection_limit`/`pool_timeout` configurado en ningún `.env` de servicio, ni override de `max_connections` en `docker-compose.yml` (Postgres queda en el default de 100). Con 12 microservicios compitiendo por ese límite, miles de transacciones cortas y secuenciales en un solo request de Gerencia Técnica es exactamente el tipo de patrón que agota el pool bajo carga concurrente — un riesgo real de timeout/500 en producción con archivos APU grandes, no solo una ineficiencia teórica.

## What Changes

- Se agrega `withTenantTransaction(ctx, callback, opts?)` a `apps/gerencia-tecnica/src/db.ts` — mismo mecanismo que `createTenantContext(context, callback)` de los otros 10 servicios (una sola transacción, `set_config` una vez, callback recibe el cliente transaccional). **No reemplaza** `createTenantContext(ctx)` existente (49 call sites en `main.ts`, usado para operaciones individuales) — se agrega como función nueva, de uso específico para los loops identificados.
- Se agrega `withSavepoint(tx, label, fn)` — envuelve una operación dentro de un `SAVEPOINT`/`RELEASE SAVEPOINT`/`ROLLBACK TO SAVEPOINT` de Postgres. Necesario porque, al mover un loop de N transacciones independientes a 1 sola transacción, una fila que falla (constraint, FK inexistente) dejaría la transacción completa en estado abortado y arrastraría a todas las filas siguientes — el savepoint aísla el fallo de una fila sin perder la transacción compartida, preservando el comportamiento actual de "una fila mala se omite, el resto continúa".
- Los 4 loops de arriba pasan de N transacciones a 1 transacción + N savepoints (label numérico, nunca un valor de usuario, para no depender de sanitización de identificador SQL).
- Sin cambios de comportamiento observable para el cliente HTTP: mismos códigos de respuesta, mismos contadores (`creados`/`actualizados`/`omitidos`/`vinculados`), misma tolerancia a filas individuales inválidas.

## Capabilities

### New Capabilities
- `transaccion-compartida-lotes-gt`: los endpoints de importación/actualización en lote de Gerencia Técnica ejecutan sus operaciones dentro de una única transacción de Postgres por request (en vez de una transacción por fila), preservando el aislamiento de fallos por fila vía savepoints.

### Modified Capabilities
Ninguna — no hay spec previo que documente el comportamiento transaccional de estos endpoints.

## Impact

- `apps/gerencia-tecnica/src/db.ts`: nuevas funciones `withTenantTransaction`, `withSavepoint`. `createTenantContext(ctx)` no cambia.
- `apps/gerencia-tecnica/src/main.ts`: reescritura interna (no de contrato HTTP) de los 4 loops listados en Why.
- Sin cambios de schema, sin cambios en otros microservicios, sin cambios de contrato de API — cambio puramente interno de cómo se agrupan las escrituras en transacciones.
- Riesgo de regresión principal: que el aislamiento de fallos por fila deje de funcionar igual (una fila mala no debe seguir arrastrando a las demás) — cubierto explícitamente en tasks.md con un test dedicado.
