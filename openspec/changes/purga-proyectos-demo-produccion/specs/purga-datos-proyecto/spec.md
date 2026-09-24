## ADDED Requirements

### Requirement: La purga SHALL eliminar un proyecto y todos sus datos en todos los esquemas de servicio
La herramienta de purga SHALL eliminar, para cada proyecto indicado, todas las filas de todas las tablas de los esquemas de servicio (`auth`, `compras`, `gerencia_tecnica`, `control_proyectos`, `finanzas`, `contabilidad`, `personal`, `almacen`, `calidad`, `seguridad`) que lleven la columna `proyecto_id` con el identificador del proyecto, incluyendo previamente las filas hijas que las referencien mediante claves foráneas `RESTRICT` o `NO ACTION`, y finalmente el registro del proyecto en `auth.proyectos`. Todo el borrado de un proyecto SHALL ejecutarse en una única transacción.

#### Scenario: Purga de un proyecto con datos en varios módulos
- **WHEN** se purga un proyecto que tiene filas en `compras`, `gerencia_tecnica`, `finanzas` y `personal`, con cadenas de FK `RESTRICT`
- **THEN** después de la purga no queda ninguna fila con ese `proyecto_id` en ningún esquema de servicio ni fila hija huérfana, y el registro del proyecto ya no existe en `auth.proyectos`

#### Scenario: Otros proyectos permanecen intactos
- **WHEN** se purga el proyecto A y existe el proyecto B en el mismo tenant y en otros tenants
- **THEN** los conteos de filas por tabla de B y de los demás tenants son idénticos antes y después de la purga

#### Scenario: Falla a mitad del borrado
- **WHEN** ocurre cualquier error durante el borrado de un proyecto
- **THEN** la transacción se revierte por completo y no queda ninguna fila eliminada de ese proyecto

#### Scenario: Esquema con FK compuesta o ciclo
- **WHEN** el cálculo del cierre de borrado encuentra una clave foránea compuesta o un ciclo de dependencias
- **THEN** la herramienta aborta antes de eliminar nada e informa qué tabla y restricción lo causan

### Requirement: La purga SHALL ejecutarse en modo dry-run por defecto y reportar filas por tabla
Sin el indicador explícito `--ejecutar`, la herramienta SHALL ejecutar el mismo procedimiento de borrado dentro de una transacción, SHALL reportar por esquema y tabla el número de filas que se eliminarían (incluidas las eliminadas por `CASCADE`) y SHALL revertir la transacción, sin modificar ningún dato.

#### Scenario: Dry-run
- **WHEN** se invoca la herramienta sin `--ejecutar`
- **THEN** imprime el listado de filas por esquema y tabla, termina con código 0 y la base queda exactamente igual que antes

#### Scenario: Dry-run que revela una violación de FK
- **WHEN** el borrado simulado viola una clave foránea no contemplada
- **THEN** el dry-run falla con código distinto de cero e identifica la restricción, sin modificar datos

### Requirement: La ejecución real SHALL exigir superusuario, confirmación por código y respaldo verificado
La herramienta SHALL rechazar `--ejecutar` cuando: la conexión no sea de superusuario; el conjunto de `--confirmar` no coincida exactamente con los códigos de Centro de Costos resueltos; se pidan más de 10 proyectos; o no se proporcione `--respaldo` con un archivo de `pg_dump` de menos de 24 horas que pase `pg_restore --list`. Los proyectos SHALL identificarse por `codigo_centro_costos` y tenant, nunca por patrones.

#### Scenario: Conexión sin superusuario
- **WHEN** la herramienta se conecta con un rol que no es superusuario
- **THEN** aborta antes de leer o borrar datos con un mensaje que indica que RLS podría ocultar filas

#### Scenario: Confirmación que no coincide
- **WHEN** `--confirmar` omite uno de los códigos solicitados o incluye uno adicional
- **THEN** rechaza la ejecución y no elimina nada

#### Scenario: Sin respaldo válido
- **WHEN** falta `--respaldo`, el archivo tiene más de 24 horas, o `pg_restore --list` falla
- **THEN** rechaza la ejecución real y permite solo dry-run

#### Scenario: Código inexistente
- **WHEN** uno de los códigos solicitados no existe en el tenant indicado
- **THEN** aborta sin eliminar nada, indicando el código no encontrado

#### Scenario: Demasiados proyectos
- **WHEN** se solicitan más de 10 proyectos en una corrida
- **THEN** rechaza la solicitud

### Requirement: La purga SHALL verificar la integridad antes de confirmar y revertir ante cualquier diferencia
Antes de confirmar la transacción de cada proyecto, la herramienta SHALL verificar que no queda ninguna fila con su `proyecto_id` en los esquemas de servicio y que los conteos por tabla de todos los demás proyectos son idénticos a los medidos antes del borrado; ante cualquier diferencia SHALL revertir la transacción y terminar con código distinto de cero.

#### Scenario: Verificación exitosa
- **WHEN** el proyecto queda sin filas y los demás conteos coinciden
- **THEN** la transacción se confirma y la herramienta reporta éxito con el resumen por esquema

#### Scenario: Diferencia en otro proyecto
- **WHEN** el conteo de cualquier tabla de otro proyecto cambia durante la purga
- **THEN** la transacción se revierte y la herramienta termina con error

### Requirement: La purga SHALL generar un manifiesto de archivos y una bitácora
Antes de eliminar, la herramienta SHALL escribir un manifiesto con las rutas de archivos referenciadas por las filas a eliminar (columnas de ruta detectadas por nombre) sin borrar ningún archivo de los volúmenes, y tras una ejecución real SHALL registrar en `docs/operacion/purgas/` la fecha, los códigos purgados, las filas eliminadas por esquema y el nombre y SHA-256 del respaldo, sin datos de negocio.

#### Scenario: Manifiesto de archivos huérfanos
- **WHEN** las filas a eliminar referencian archivos de fichas técnicas o cotizaciones
- **THEN** el manifiesto lista sus rutas y ningún archivo se elimina automáticamente

#### Scenario: Bitácora de una ejecución real
- **WHEN** finaliza una purga real exitosa
- **THEN** existe un registro con fecha, códigos, filas por esquema y respaldo, sin nombres de proveedores, montos ni datos personales

### Requirement: El procedimiento SHALL incluir un ensayo obligatorio sobre una copia aislada
El runbook `docs/operacion/purga-proyectos-demo.md` SHALL exigir, antes de ejecutar en producción, restaurar el respaldo recién tomado en un contenedor PostgreSQL desechable sin acceso a red, ejecutar allí la purga real, revisar el resumen y comprobar que la aplicación opera contra la copia, y SHALL documentar los criterios de parada y la conservación del respaldo hasta que el titular confirme la normalidad.

#### Scenario: Ensayo antes de producción
- **WHEN** el titular sigue el runbook
- **THEN** ejecuta primero la purga en la copia aislada y solo continúa a producción si el ensayo termina sin errores y con las verificaciones en verde

#### Scenario: Aislamiento del ensayo
- **WHEN** corre el contenedor del ensayo
- **THEN** no tiene acceso a la red ni comparte volúmenes con producción
