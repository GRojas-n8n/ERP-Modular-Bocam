## 1. Test que reproduce el bug (rojo primero)

- [x] 1.1 Crear `apps/compras/test/integration/trigger-delete-cuadro-comparativo.integration.test.ts` siguiendo el patrón de conexión directa a Postgres de `rls-idor-cuadro-comparativo.integration.test.ts` (mismo `DATABASE_URL`/`PrismaClient` apuntando a `bocam_erp?schema=compras`, sin necesidad de levantar el servidor HTTP porque el bug vive en el trigger de base de datos, no en un endpoint).
- [x] 1.2 Caso A: insertar un `CuadroComparativo` con `estado: 'BORRADOR'` (UUIDs fabricados para `tenant_id`/`proyecto_id`/`requisicion_id` ya que no hay FK saliente desde `cuadros_comparativos` hacia esas tablas) y ejecutar `DELETE FROM cuadros_comparativos WHERE id_cuadro = $1` vía `prisma.$executeRawUnsafe`; verificar con un `findUnique` posterior que la fila fue eliminada. Confirmar que este caso falla en rojo contra el código actual (la fila sigue existiendo, sin error lanzado).
- [x] 1.3 Caso B: insertar un `CuadroComparativo` con `estado: 'LOCKED'` y ejecutar el mismo `DELETE`; verificar que la promesa rechaza con un error que incluye `cannot_modify_locked_comparativa` y que la fila sigue existiendo. Confirmar que este caso ya pasa en verde contra el código actual (no se rompe con el fix).
- [x] 1.4 Caso C (regresión de UPDATE, ya cubierto implícitamente por el guard existente): intentar un `UPDATE cuadros_comparativos SET notas = 'x' WHERE id_cuadro = $1 AND estado = 'LOCKED'` sobre una fila LOCKED y verificar que sigue rechazándose igual que antes del fix.
- [x] 1.5 Correr el archivo con `node -r ts-node/register/transpile-only apps/compras/test/integration/trigger-delete-cuadro-comparativo.integration.test.ts` contra Postgres local y confirmar que 1.2 falla (rojo) y 1.3/1.4 pasan, antes de tocar el trigger. Confirmado: caso A en rojo (`AssertionError`, la fila seguía existiendo), casos B y C ya en verde.

## 2. Fix del trigger

- [x] 2.1 Editar `apps/compras/prisma/migrations/manual/migration.sql`: en `fn_prevent_locked_comparativa_modification()`, agregar `IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;` antes del `RETURN NEW;` final (después del chequeo de `LOCKED`), según el diseño en `design.md`.
- [x] 2.2 Reaplicar el script contra la base de Postgres local (`psql` directo contra el schema `compras` vía `docker exec bocam-postgres`, con `SET search_path TO compras;`).
- [x] 2.3 Volver a correr el test de la sección 1 y confirmar que los 3 casos (A, B, C) pasan en verde. Confirmado en verde; también se ajustó la limpieza de fixtures del propio test (`borrarCuadroLockedParaLimpieza`, usa `DISABLE/ENABLE TRIGGER` porque una fila LOCKED tampoco se puede des-bloquear vía UPDATE, por diseño del guard).

## 3. Verificación en VPS real

- [x] 3.1 Reaplicar el mismo script corregido contra la base real de `compras` en el VPS (`git pull` en `/root/ERP-Modular-Bocam` + `docker exec bocam-vps-postgres psql -U bocam_admin -d bocam_compras` con el contenido de `migration.sql`, mismo procedimiento manual con el que se instaló el trigger originalmente).
- [x] 3.2 En el VPS, correr `SELECT pg_get_functiondef('fn_prevent_locked_comparativa_modification'::regproc);` de solo lectura y confirmar que el cuerpo activo ya incluye la rama `TG_OP = 'DELETE'`. Confirmado.
- [x] 3.3 Confirmar `git status` limpio fuera de `apps/compras/prisma/migrations/manual/migration.sql`, el nuevo test, y `openspec/changes/fix-trigger-delete-cuadro-comparativo/`. Commit `f4fff20` pusheado a `main` y ya reflejado en el VPS.

## 4. Cierre

- [x] 4.1 Commit directo a `main` (`f4fff20`, siguiendo el patrón de commits recientes de bug-fix en el historial; no se abrió PR).
- [x] 4.2 Archivar el change en OpenSpec una vez verificado en VPS real.
