## ADDED Requirements

### Requirement: La purga SHALL eliminar un proyecto de todas las bases de servicio
La herramienta de producción SHALL eliminar, para cada proyecto indicado, todas las filas de todas las tablas de las bases `bocam_*` que lleven `proyecto_id`, incluyendo previamente las filas hijas que las referencien mediante claves foráneas `RESTRICT` o `NO ACTION`, y finalmente el registro del proyecto en `bocam_auth.public.proyectos`. Cada base SHALL usar su propia transacción verificable; `bocam_auth` SHALL procesarse al final.

#### Scenario: Purga de un proyecto con datos en varios módulos
- **WHEN** se purga un proyecto que tiene filas en varias bases de servicio, con cadenas de FK `RESTRICT`
- **THEN** después de la purga no queda ninguna fila con ese `proyecto_id` en ninguna base ni fila hija huérfana, y el registro del proyecto ya no existe en `bocam_auth.public.proyectos`

#### Scenario: Otros proyectos permanecen intactos
- **WHEN** se purga el proyecto A y existe el proyecto B en el mismo tenant y en otros tenants
- **THEN** los conteos de filas por tabla de B y de los demás tenants son idénticos antes y después de la purga

#### Scenario: Falla dentro de una base
- **WHEN** ocurre un error durante el borrado transaccional de una base
- **THEN** esa base revierte por completo y la herramienta se detiene antes de procesar las bases siguientes

#### Scenario: Falla después de confirmar una base anterior
- **WHEN** una base posterior falla después de que otra base ya confirmó su transacción
- **THEN** la aplicación permanece en mantenimiento y el operador restaura el conjunto completo de respaldos antes de reabrir escrituras

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

### Requirement: La ejecución real SHALL exigir superusuario, mantenimiento, confirmación y respaldo completo verificado
La herramienta SHALL rechazar `--ejecutar` cuando: la conexión no sea de superusuario; el conjunto de `--confirmar` no coincida exactamente con los códigos resueltos; se pidan más de 10 proyectos; no se confirme la ventana de mantenimiento; no se confirme una copia fuera de la VPS; o falte un respaldo reciente y verificable de cada base requerida y de los roles globales. Los proyectos SHALL identificarse por `codigo_centro_costos` y tenant, nunca por patrones.

#### Scenario: Conexión sin superusuario
- **WHEN** la herramienta se conecta con un rol que no es superusuario
- **THEN** aborta antes de leer o borrar datos con un mensaje que indica que RLS podría ocultar filas

#### Scenario: Confirmación que no coincide
- **WHEN** `--confirmar` omite uno de los códigos solicitados o incluye uno adicional
- **THEN** rechaza la ejecución y no elimina nada

#### Scenario: Conjunto de respaldos incompleto
- **WHEN** falta el dump de cualquier base requerida, roles globales, checksum, copia externa confirmada o `pg_restore --list` falla
- **THEN** rechaza la ejecución real y permite solo dry-run

#### Scenario: Código inexistente
- **WHEN** uno de los códigos solicitados no existe en el tenant indicado
- **THEN** aborta sin eliminar nada, indicando el código no encontrado

#### Scenario: Demasiados proyectos
- **WHEN** se solicitan más de 10 proyectos en una corrida
- **THEN** rechaza la solicitud

### Requirement: La purga SHALL ejecutar un preflight completo y verificar cada base antes de confirmarla
Antes de modificar datos, la herramienta SHALL ejecutar el dry-run en todas las bases. Durante la ejecución, antes de confirmar cada transacción SHALL verificar que no queda ninguna fila objetivo en esa base y que los demás proyectos permanecen intactos; ante cualquier diferencia SHALL revertir esa base, detener la corrida y mantener el mantenimiento activo.

#### Scenario: Verificación exitosa
- **WHEN** el proyecto queda sin filas y los demás conteos coinciden
- **THEN** la transacción de esa base se confirma y la herramienta continúa según el orden definido, dejando `bocam_auth` al final

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

### Requirement: El procedimiento SHALL incluir mantenimiento y un ensayo obligatorio del clúster completo
El runbook `docs/operacion/purga-proyectos-demo.md` SHALL exigir detener escrituras, respaldar todas las bases y roles globales, restaurar el conjunto en un PostgreSQL desechable sin acceso a red, ejecutar allí la purga real y revisar el resumen antes de tocar producción. También SHALL documentar criterios de parada, restauración completa ante fallo parcial y conservación del respaldo hasta que el titular confirme la normalidad.

#### Scenario: Ensayo antes de producción
- **WHEN** el titular sigue el runbook
- **THEN** ejecuta primero la purga en la copia aislada y solo continúa a producción si el ensayo termina sin errores y con las verificaciones en verde

#### Scenario: Aislamiento del ensayo
- **WHEN** corre el contenedor del ensayo
- **THEN** no tiene acceso a la red ni comparte volúmenes con producción
