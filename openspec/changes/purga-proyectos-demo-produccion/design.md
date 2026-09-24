## Context

Verificado sobre la base de desarrollo local (mismo esquema Prisma que producción), 2026-09-24:

| Esquema | Tablas con `proyecto_id` | Tablas totales |
|---|---|---|
| almacen | 3 | 5 |
| auth | 2 | 8 |
| calidad | 3 | 6 |
| compras | 18 | 23 |
| contabilidad | 4 | 5 |
| control_proyectos | 10 | 11 |
| finanzas | 6 | 8 |
| gerencia_tecnica | 10 | 16 |
| personal | 8 | 15 |
| seguridad | 6 | 7 |

- Claves foráneas (todas las de los 10 esquemas): 36 `CASCADE`, 13 `RESTRICT`/`NO ACTION`, 8 `SET NULL`. No hay FKs entre esquemas.
- Una sola base con un esquema por servicio; producción usa `postgres:15-alpine` en el contenedor `bocam-vps-postgres`, con `POSTGRES_USER` superusuario. La aplicación se conecta con un rol sin `BYPASSRLS`; las tablas con `tenant_id` tienen RLS forzado.
- `auth.proyectos` (`Proyecto`) tiene `@@unique([tenant_id, codigo_centro_costos])`; `user_project_access` referencia al proyecto.
- El archivado de proyectos existe (PR #139), pero el titular pidió eliminación definitiva.
- No hay respaldos verificados en producción (change `backups-postgres-verificados` pendiente).
- Los archivos subidos viven en los volúmenes `vps_calidad_uploads`, `vps_personal_uploads`, `vps_fichas_uploads`, `vps_docs_proveedores`, `vps_cotizaciones_uploads`; las filas de BD guardan su ruta.

## Goals / Non-Goals

**Goals:**
- Eliminar por completo uno o varios proyectos y sus datos en todos los esquemas, sin dejar filas huérfanas ni tocar datos de otros proyectos.
- Que sea **imposible** ejecutarlo sin respaldo verificado, sin confirmación por código y sin haber visto el dry-run.
- Que un fallo a mitad de camino no deje estado parcial.
- Dejar evidencia (bitácora) de qué se borró y con qué respaldo.

**Non-Goals:**
- No es una función de la aplicación ni de CI; es una herramienta operativa.
- No borra archivos de los volúmenes ni claves de Redis.
- No elimina usuarios, clientes ni catálogos globales del tenant.
- No reescribe ni "limpia" tablas de auditoría.

## Decisions

**1. PL/pgSQL en la propia base, no un script de aplicación (Prisma/Node).**
La conexión de la aplicación no tiene `BYPASSRLS` y sus scripts han fallado en silencio; además Prisma no expone el grafo de FKs. Con SQL sobre `pg_constraint` el orden de borrado se calcula de la definición real del esquema y sigue siendo correcto si se agregan tablas. Se ejecuta con `docker exec … psql` como el superusuario del contenedor.

**2. Borrado guiado por el catálogo: cierre de FKs `RESTRICT`/`NO ACTION`.**
Algoritmo `purgar_filas(tabla, predicado)`:
1. Para cada FK `RESTRICT`/`NO ACTION` que referencia `tabla`: llamar `purgar_filas(hija, hija.fk IN (SELECT pk FROM tabla WHERE predicado))` primero (recursivo, con conjunto de visitados y profundidad máxima para detectar ciclos → abortar).
2. `DELETE FROM tabla WHERE predicado`.
Las FKs `CASCADE` y `SET NULL` las resuelve PostgreSQL. Las FKs **compuestas** no se soportan: si se detecta una, la función aborta con mensaje explícito (mejor fallar que borrar mal). Alternativa descartada: `SET session_replication_role = replica` (desactiva triggers de FK): permitiría borrar en cualquier orden pero dejaría huérfanas las filas hijas sin `proyecto_id`.

**3. Selección de tablas: todas las que tengan una columna `proyecto_id`.**
Descubiertas dinámicamente en los 10 esquemas de servicio (lista explícita de esquemas; nunca `public` ni esquemas del sistema). En `auth` se elimina además la fila de `proyectos` (`id_proyecto`) y sus dependientes (`user_project_access` cae por FK).

**4. Una transacción por corrida (todos los proyectos pedidos o ninguno); dry-run = ejecutar y `ROLLBACK`.**
Así el dry-run recorre exactamente el mismo camino que la ejecución real (incluidas las violaciones de FK, que un cálculo aparte podría no anticipar). Conteos: se toma `count(*)` de cada tabla afectada **antes y después** dentro de la transacción; la diferencia incluye los efectos de `CASCADE` (que `GET DIAGNOSTICS` no reportaría). Tras una ejecución real el resultado se confirma con `COMMIT` solo si pasan las verificaciones del punto 6.

**5. Guardas de seguridad, todas bloqueantes.**
- Superusuario: `SELECT current_setting('is_superuser')` debe ser `on`; si no, aborta antes de tocar nada (evita el "0 filas en silencio" por RLS).
- Identificación por `codigo_centro_costos` y tenant; `--confirmar` debe repetir exactamente los códigos resueltos (mismo conjunto, sin sobrantes ni faltantes).
- Máximo 10 proyectos por corrida.
- `--ejecutar` es opcional y nunca implícito; sin él solo hay dry-run.
- **Respaldo obligatorio**: `--respaldo` apunta a un `.dump` con antigüedad < 24 h que pase `pg_restore --list`; se registra su SHA-256. Sin respaldo válido no se permite `--ejecutar`.

**6. Verificación posterior dentro de la transacción, con rollback ante cualquier diferencia.**
(a) Para cada proyecto purgado: 0 filas con ese `proyecto_id` en todas las tablas. (b) Los conteos por tabla y por `proyecto_id` de **todos los demás proyectos** son idénticos a los tomados antes. (c) No quedan filas hijas huérfanas de las tablas tocadas (las FKs lo garantizan; se comprueba con un conteo). Si algo falla: `ROLLBACK` y código de salida ≠ 0.

**7. Manifiesto de archivos, sin borrado automático.**
Antes de borrar, se recolectan valores de columnas cuyo nombre indique ruta de archivo (`ruta`, `ruta_archivo`, `storage_path`, `file_path`, `url_archivo`, coincidencia por patrón) en las filas a eliminar, y se escriben a un manifiesto. Borrar archivos en volúmenes es irreversible y ajeno a la transacción de base; queda como paso manual revisado.

**8. Ensayo obligatorio sobre una copia sin red.**
El runbook exige restaurar el respaldo recién tomado en un contenedor `postgres:15-alpine --network none`, correr allí la purga con `--ejecutar`, y revisar filas por esquema y la verificación posterior. Solo entonces se ejecuta en producción. Se reutiliza el mismo mecanismo de `restore-verify.sh` de `backups-postgres-verificados` cuando exista; mientras tanto, los comandos equivalentes están en el runbook.

**9. Tests con PostgreSQL desechable.**
Un test de integración (`node --test` que invoca `psql`) siembra dos proyectos con datos en varios esquemas del esquema real (usando el `schema.prisma` aplicado con `prisma db push` sobre una base vacía), incluyendo cadenas `RESTRICT`, `CASCADE` y `SET NULL`; purga uno y verifica: cero filas del purgado, conteos idénticos del otro, dry-run sin cambios, rechazo sin superusuario, rechazo sin `--confirmar` correcto, rechazo sin respaldo válido, y aborto ante FK compuesta o ciclo. Se omite si no hay `psql`/PostgreSQL disponible.

**10. Bitácora sin datos de negocio.**
`docs/operacion/purgas/AAAA-MM-DD-*.md` con: fecha, operador, códigos purgados, filas eliminadas por esquema, nombre y SHA-256 del respaldo, resultado de las verificaciones. Sin nombres de proveedores, montos ni datos personales.

## Risks / Trade-offs

- **Irreversible sin respaldo:** mitigado por la puerta de respaldo, el ensayo y el dry-run; aun así, el respaldo debe conservarse hasta que el titular confirme que el sistema opera bien tras la purga.
- **Referencias fuera del esquema relacional** (colas de RabbitMQ, claves de Redis, tablas de auditoría append-only, JSON con IDs de proyecto): pueden quedar menciones históricas al `proyecto_id`; documentado, sin impacto funcional esperado. El ensayo incluye abrir la aplicación contra la copia y confirmar que no falla por referencias colgantes.
- **Ciclos de FK o FKs compuestas** en el esquema: la función aborta; hoy el catálogo no las tiene según la revisión, pero un esquema futuro podría; el test lo cubre.
- **Bloqueos:** la transacción toma bloqueos de fila sobre muchas tablas; se ejecuta en ventana de bajo uso y con la aplicación en operación normal (los datos a purgar son de proyectos de práctica, sin actividad).
- **Seleccionar el proyecto equivocado:** la confirmación por código y el listado previo con nombre/estatus/filas por tabla son la defensa; la lista exacta la entrega el titular y se anexa al PR.
- **"Demo" es un juicio humano:** la herramienta no puede saber si un proyecto tiene datos reales; por eso muestra las filas por tabla (p. ej. pagos, nómina) y exige confirmación explícita.
- **Archivos huérfanos en volúmenes:** ocupan espacio pero no afectan el sistema; se limpian manualmente con el manifiesto.
