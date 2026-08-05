## Context

`cuadros_comparativos` (compras) tiene un trigger `BEFORE UPDATE OR DELETE` (`trg_comparativa_locked`) creado a mano vía `apps/compras/prisma/migrations/manual/migration.sql` — no es una migración de Prisma con timestamp, así que no se re-aplica sola con `prisma migrate deploy`; se ejecutó una vez directamente contra cada base (dev/VPS). La función actual:

```sql
CREATE OR REPLACE FUNCTION fn_prevent_locked_comparativa_modification()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.estado = 'LOCKED' THEN
    RAISE EXCEPTION 'cannot_modify_locked_comparativa: cuadro % está LOCKED', OLD.id_cuadro;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

En PostgreSQL, un trigger `BEFORE` fila-por-fila comunica su decisión con el valor de retorno: `NULL` cancela la operación en esa fila sin error; una fila (`NEW` para INSERT/UPDATE, `OLD` para DELETE) la deja proceder. Como `NEW` no existe en contexto `DELETE`, `RETURN NEW` es siempre `RETURN NULL` ahí — cancela cualquier DELETE, LOCKED o no, sin lanzar excepción.

## Goals / Non-Goals

**Goals:**
- El trigger debe permitir `DELETE` sobre un cuadro comparativo cuyo estado no sea `LOCKED`.
- El trigger debe seguir rechazando (con excepción explícita) `UPDATE` o `DELETE` sobre un cuadro `LOCKED`, sin cambiar el mensaje/código de error existente (`cannot_modify_locked_comparativa`) del que ya dependen los tests y el manejo de errores del backend.

**Non-Goals:**
- No se convierte este trigger en una migración de Prisma con timestamp — se mantiene como script manual (mismo patrón que hoy), solo se corrige su contenido. Formalizarlo como migración versionada es una mejora de infraestructura separada, fuera de alcance.
- No se toca la lógica de `admin-purga` (`apps/compras/src/main.ts`) que hace `cuadroComparativo.deleteMany` — el bug de orden de FKs ahí (`evaluaciones_especificacion`) es un hallazgo distinto y ya documentado aparte; este change solo corrige el trigger.

## Decisions

**Distinguir por `TG_OP` en vez de un segundo trigger separado.** Se usa la variable implícita `TG_OP` (`'INSERT' | 'UPDATE' | 'DELETE'`) dentro de la misma función para decidir qué devolver, en vez de crear un trigger `BEFORE DELETE` separado de uno `BEFORE UPDATE`. Alternativa considerada: dos triggers distintos, uno por operación. Se descarta porque duplicaría el `IF OLD.estado = 'LOCKED'` y el texto del error en dos lugares, aumentando el riesgo de que diverjan en el futuro; una sola función con una rama por `TG_OP` es el patrón estándar de Postgres para este caso y mantiene una sola fuente de verdad para el mensaje de error.

```sql
CREATE OR REPLACE FUNCTION fn_prevent_locked_comparativa_modification()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.estado = 'LOCKED' THEN
    RAISE EXCEPTION 'cannot_modify_locked_comparativa: cuadro % está LOCKED', OLD.id_cuadro;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Editar el script manual in place, no crear una migración Prisma nueva.** Se sigue el mismo patrón ya documentado en el propio archivo (`ALTER TABLE ... DISABLE/ENABLE TRIGGER` para reaplicar). El fix se aplica reemplazando la función con `CREATE OR REPLACE FUNCTION` (ya es el patrón del archivo original), así que reaplicar el script completo en cualquier entorno es idempotente y no requiere deshabilitar el trigger primero.

## Risks / Trade-offs

- **[Riesgo] El fix habilita DELETEs que antes fallaban en silencio** → algún flujo en producción podría estar "confiando" (sin saberlo) en que el DELETE no tiene efecto real. Mitigación: el proposal documenta explícitamente el efecto colateral esperado en `admin-purga`; se verifica en VPS real después del deploy, no solo con tests locales.
- **[Riesgo] Reaplicar el script manual requiere acceso directo a la base de cada entorno** (dev local + VPS) porque no está versionado como migración Prisma → fácil de olvidar en algún entorno. Mitigación: el paso de verificación en tasks.md incluye confirmar explícitamente el `pg_get_functiondef` de la función en el VPS real, no solo en local.

## Migration Plan

1. Corregir la función en `apps/compras/prisma/migrations/manual/migration.sql`.
2. Reaplicar el script contra la base de dev local (`psql` directo, usando `CREATE OR REPLACE FUNCTION` — no requiere `DROP TRIGGER`/`DISABLE TRIGGER` porque la definición del trigger en sí no cambia, solo el cuerpo de la función).
3. Correr los tests de integración nuevos en verde localmente.
4. Reaplicar el mismo script contra la base real de `compras` en el VPS (mismo procedimiento manual ya usado la primera vez que se instaló este trigger).
5. Verificar en el VPS con una consulta de solo lectura (`SELECT pg_get_functiondef('fn_prevent_locked_comparativa_modification'::regproc)`) que la función activa ya contiene la rama `TG_OP = 'DELETE'`.

**Rollback:** si algo sale mal, restaurar la versión anterior de la función con el mismo patrón `CREATE OR REPLACE FUNCTION` (revertir el archivo y reaplicar). No hay migración de esquema que revertir — solo el cuerpo de una función.

## Open Questions

Ninguna — el fix es acotado y el comportamiento correcto está completamente determinado por el contrato ya documentado en el propio trigger (bloquear solo `LOCKED`).
