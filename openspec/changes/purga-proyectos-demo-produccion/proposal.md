## Why

En producción (iretum.com) existen proyectos que se crearon como ejemplo y práctica durante la capacitación. El titular decidió **eliminarlos definitivamente** (no solo archivarlos) para dejar el sistema limpio antes de operar con datos reales, y aceptó que esto exige un respaldo previo.

Eliminar un proyecto no es un `DELETE` simple, por cómo está construido el sistema (verificado sobre la base de desarrollo, que tiene el mismo esquema):

- **Los datos de un proyecto están repartidos en 10 esquemas de PostgreSQL** (`auth`, `compras`, `gerencia_tecnica`, `control_proyectos`, `finanzas`, `contabilidad`, `personal`, `almacen`, `calidad`, `seguridad`), con **70 tablas** que llevan `proyecto_id`. No hay claves foráneas entre esquemas (una base por servicio, sin JOINs cruzados), así que borrar el proyecto en `auth` deja huérfanos todos los datos en los demás.
- **Dentro de cada esquema hay 13 claves foráneas `RESTRICT`** (bloquean un `DELETE` del padre mientras existan hijos), 36 `CASCADE` y 8 `SET NULL`. Un borrado ingenuo falla a medias o deja el estado inconsistente.
- **RLS**: si la conexión no es superusuario, un `DELETE` afecta silenciosamente 0 filas (ya ocurrió con los scripts `adminPrisma`; ver memoria del proyecto). Un script de purga que "termina bien" sin borrar nada, o que borra solo una parte, es el peor resultado.
- **No existe hoy ningún respaldo verificado** de la base de producción (ver change `backups-postgres-verificados`, aún sin aplicar). Una purga sin respaldo previo es irreversible.
- **Los archivos subidos** (fichas técnicas, cotizaciones, documentos de proveedores y de personal, adjuntos de calidad) viven en volúmenes Docker y quedarían huérfanos en disco.

## What Changes

Una herramienta operativa de un solo propósito, con dry-run por defecto, guardas explícitas y ensayo obligatorio sobre una copia, ejecutada por el titular en la VPS (no por CI ni por la aplicación):

- **`scripts/ops/purga-proyecto/purga-proyecto.sql`**: función PL/pgSQL que, dado un `proyecto_id`, calcula a partir del catálogo de PostgreSQL (`pg_constraint`) el **cierre de borrado**: para cada tabla con `proyecto_id`, elimina primero recursivamente las filas hijas que la referencian con FK `RESTRICT`/`NO ACTION` (las `CASCADE` y `SET NULL` las resuelve la base), y luego las filas del proyecto; finalmente elimina el registro del proyecto en `auth`. Todo en **una sola transacción por proyecto**.
- **Dry-run por defecto**: ejecuta la purga completa dentro de la transacción, mide el número de filas eliminadas por tabla (contando tablas antes/después, lo que incluye los cascades) y hace `ROLLBACK`. El borrado real requiere `--ejecutar` y la confirmación descrita abajo.
- **Guardas**:
  - Aborta si la conexión no es superusuario (`is_superuser <> on`), para evitar el "0 filas en silencio" por RLS.
  - El proyecto se identifica por **`codigo_centro_costos` + tenant**, nunca por un patrón; el script muestra código, nombre, estatus y las filas por tabla, y para ejecutar exige repetir cada código con `--confirmar CODIGO1,CODIGO2` idéntico a lo resuelto.
  - Máximo 10 proyectos por corrida.
  - **Puerta de respaldo**: exige `--respaldo <ruta>` a un archivo `pg_dump` con menos de 24 h, que pase `pg_restore --list` y cuyo SHA-256 se registra; sin él, no ejecuta (solo dry-run).
  - Verificación posterior en la misma transacción: cero filas con ese `proyecto_id` en todos los esquemas, y **los conteos por tabla de los demás proyectos son idénticos a los de antes**; si cualquiera falla, `ROLLBACK`.
- **Manifiesto de archivos**: antes de borrar, escribe la lista de rutas de archivos que referencian las filas a eliminar (columnas de ruta detectadas por nombre) en un archivo, para que el titular decida borrar los archivos huérfanos de los volúmenes (no se borran automáticamente).
- **Ensayo obligatorio**: el procedimiento del runbook exige restaurar el respaldo en un contenedor PostgreSQL desechable **sin red**, ejecutar allí la purga real, y revisar el resultado antes de tocar producción.
- **Bitácora**: la herramienta genera un registro en `docs/operacion/purgas/` (fecha, códigos, filas por esquema, nombre y SHA-256 del respaldo, sin datos de negocio) para dejar constancia.
- **Runbook** `docs/operacion/purga-proyectos-demo.md` con el procedimiento completo, comandos exactos y criterios de parada.
- **Tests** sobre PostgreSQL desechable con dos proyectos sembrados en varios esquemas (incluyendo FKs `RESTRICT`, `CASCADE` y `SET NULL`): tras purgar uno, el otro queda intacto y del purgado no queda ninguna fila.

## Capabilities

### New Capabilities
- `purga-datos-proyecto`: procedimiento operativo controlado para eliminar definitivamente un proyecto y todos sus datos en todos los módulos, con respaldo previo verificado, ensayo, dry-run por defecto y verificación de integridad.

### Modified Capabilities
(ninguna)

## Impact

- **Nuevo:** `scripts/ops/purga-proyecto/{purga-proyecto.sql, purga-proyecto.sh, tests}`, `docs/operacion/purga-proyectos-demo.md`, carpeta `docs/operacion/purgas/` para la bitácora.
- **No cambia** ningún servicio, esquema, migración ni la interfaz de usuario. **No** agrega un botón de "eliminar proyecto" a la aplicación (queda como decisión futura ligada a la memoria "alta/baja de proyecto por GT/Control de Proyectos").
- **Dependencias de orden:** requiere un respaldo verificado. Si `backups-postgres-verificados` aún no está aplicado, el runbook incluye el `pg_dump` puntual equivalente con las mismas verificaciones; este change SHALL NOT ejecutarse en producción sin él.
- **Acciones del titular (necesarias):** entregar la **lista exacta de proyectos a eliminar** (códigos de Centro de Costos), ejecutar el respaldo y el ensayo en la VPS, revisar el dry-run y confirmar la ejecución real. Yo no tengo ni debo tener acceso a la base de producción.
- **Riesgo:** irreversible una vez ejecutado sin respaldo; mitigado por el respaldo obligatorio, el ensayo sobre copia, el dry-run por defecto, la confirmación por código y la verificación posterior con rollback.
- **Fuera de alcance:** eliminar usuarios de ejemplo, borrar archivos de los volúmenes (solo manifiesto), limpiar cachés de Redis (expiran solos), tablas de auditoría/bitácora append-only y mensajes históricos de RabbitMQ (se documentan como referencias que pueden permanecer), y cualquier borrado por interfaz.
