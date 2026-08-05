## Why

El trigger `trg_comparativa_locked` sobre `cuadros_comparativos` (microservicio `compras`, definido en `apps/compras/prisma/migrations/manual/migration.sql`) está pensado como failsafe de inmutabilidad: bloquea `UPDATE` y `DELETE` sobre un cuadro comparativo cuyo estado sea `LOCKED`. Su función `fn_prevent_locked_comparativa_modification()` siempre termina con `RETURN NEW;`. En un trigger `BEFORE DELETE` de PostgreSQL la variable `NEW` no existe (es `NULL`), y un trigger `BEFORE` que devuelve `NULL` cancela la operación **sin lanzar ningún error**. Efecto real: **todo** `DELETE` sobre `cuadros_comparativos` se cancela en silencio, esté o no `LOCKED` — el guard de `LOCKED` sigue funcionando bien solo para `UPDATE`. El caller (Prisma/backend) no recibe ningún error y asume que el delete tuvo éxito, pero la fila permanece en la tabla. Esto puede estar enmascarando fallas hoy mismo en cualquier flujo que dependa de poder borrar un cuadro comparativo no bloqueado (p. ej. la purga administrativa de requisiciones).

## What Changes

- Corregir `fn_prevent_locked_comparativa_modification()` para que distinga `TG_OP = 'DELETE'` y devuelva `OLD` en ese caso (permitiendo que el `DELETE` prosiga cuando el cuadro no está `LOCKED`), en vez de devolver siempre `NEW`.
- El guard de inmutabilidad se preserva sin cambios de comportamiento: un `DELETE` o `UPDATE` sobre un cuadro `LOCKED` debe seguir lanzando `cannot_modify_locked_comparativa`.
- No es **BREAKING**: hoy ningún `DELETE` sobre esta tabla tiene efecto real (se cancela en silencio), así que corregirlo solo hace que la operación finalmente funcione como el código que la invoca ya asume.

## Capabilities

### New Capabilities
- `inmutabilidad-cuadro-comparativo-locked`: comportamiento correcto del trigger de base de datos que protege `cuadros_comparativos` — permite `DELETE`/`UPDATE` cuando el cuadro no está `LOCKED`, y los rechaza con error explícito cuando sí lo está.

### Modified Capabilities
(ninguna — no existía spec previo que cubriera este trigger)

## Impact

- **Código afectado**: `apps/compras/prisma/migrations/manual/migration.sql` (la función del trigger; es SQL aplicado manualmente, no una migración de Prisma con timestamp — se corrige in place y se reaplica en dev/VPS).
- **Tests**: nuevo test de integración en `apps/compras/test/integration/` que reproduce el bug en rojo primero (`DELETE` sobre un cuadro no `LOCKED` no borra la fila) y confirma en verde tras el fix, más un caso que confirma que `LOCKED` sigue bloqueando.
- **Otros microservicios**: ninguno — el trigger vive únicamente en la base de datos de `compras`.
- **Efecto colateral esperado**: la purga administrativa de requisiciones (`admin-purga`, que hace `cuadroComparativo.deleteMany`) empezará a borrar realmente esas filas en vez de fallar en silencio; no se toca esa lógica en este change, pero conviene tenerlo presente al verificar en VPS real.
