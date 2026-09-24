## 1. Prerrequisitos (Titular)

- [x] 1.1 **Titular:** entregar la **lista exacta de proyectos a eliminar** (código de Centro de Costos y nombre de cada uno) y confirmar el tenant. Se anexa al PR; ningún proyecto fuera de esa lista se toca.
- [ ] 1.2 **Titular:** confirmar que ninguno de esos proyectos tiene datos reales que deban conservarse (revisar el dry-run de la tarea 6.2).
- [x] 1.3 Crear rama `chore/purga-proyectos-demo-produccion` desde `main` actualizado.

## 2. Tests primero (rojo) — sobre PostgreSQL desechable

- [x] 2.1 Levantar un PostgreSQL 15 desechable (contenedor local) y aplicar los `schema.prisma` de los 10 servicios con `prisma db push` sobre una base vacía; crear el rol de conexión de la aplicación sin `BYPASSRLS` y aplicar `rls-policies.sql`.
- [x] 2.2 Escribir el test de integración (`node --test` que invoca `psql`; se omite si no hay PostgreSQL) con fixtures de dos proyectos A y B (y un segundo tenant) con filas en `compras`, `gerencia_tecnica`, `finanzas`, `personal` y `control_proyectos`, incluyendo cadenas `RESTRICT`, `CASCADE` y `SET NULL`.
- [x] 2.3 Casos del test: purga de A deja cero filas de A y B/otro tenant idénticos; dry-run no cambia nada y reporta filas por tabla; rechazo sin superusuario (conexión con el rol de la aplicación); rechazo con `--confirmar` distinto; rechazo con código inexistente; rechazo con más de 10 proyectos; rechazo sin `--respaldo` válido o con respaldo viejo; fallo simulado a mitad de camino revierte todo; FK compuesta/ciclo sintético aborta antes de borrar; verificación posterior detecta un cambio inyectado en B y revierte.
- [x] 2.4 Confirmar que todos fallan (no existe aún la herramienta).

## 3. Implementación

- [x] 3.1 `scripts/ops/purga-proyecto/purga-proyecto.sql`: función `purgar_filas(tabla, predicado)` recursiva sobre `pg_constraint` (FK `RESTRICT`/`NO ACTION`), detección de ciclos y FKs compuestas, descubrimiento de tablas con `proyecto_id` en la lista fija de 10 esquemas.
- [x] 3.2 Conteos antes/después por tabla (incluye cascades), verificación posterior (cero filas del proyecto; demás proyectos idénticos) y `ROLLBACK` ante cualquier diferencia; dry-run = ejecutar + `ROLLBACK`.
- [x] 3.3 `scripts/ops/purga-proyecto/purga-proyecto.sh` (POSIX `sh`, `set -eu`): parseo de `--tenant`, `--codigos`, `--confirmar`, `--respaldo`, `--ejecutar`; guardas (superusuario, coincidencia exacta de códigos, máximo 10, respaldo < 24 h + `pg_restore --list` + SHA-256); invoca `docker exec … psql` con la función.
- [x] 3.4 Manifiesto de archivos (columnas de ruta por patrón de nombre) escrito antes de borrar, sin borrar archivos.
- [x] 3.5 Generación de la bitácora en `docs/operacion/purgas/` sin datos de negocio.
- [x] 3.6 Hacer pasar todos los tests de la sección 2; `shellcheck` sobre el `.sh`.

## 4. Runbook

- [x] 4.1 Escribir `docs/operacion/purga-proyectos-demo.md`: prerrequisitos, comandos exactos, respaldo puntual (`pg_dump -Fc` + `pg_restore --list` + `sha256sum`) si `backups-postgres-verificados` aún no existe, ensayo en contenedor `--network none`, dry-run, ejecución real, verificación post-purga (abrir la aplicación, selector de proyectos, dashboards), manifiesto de archivos, criterios de parada, conservación del respaldo, y cómo restaurar si algo sale mal.
- [x] 4.2 Añadir `docs/operacion/purgas/README.md` con el formato de la bitácora.

## 5. PR

- [ ] 5.1 PR contra `main` con CI verde. El test de PostgreSQL desechable corre en CI solo si se cablea (opcional; si no, se adjunta la salida local al PR).
- [ ] 5.2 Merge. **No ejecuta nada en producción**: solo publica la herramienta y el runbook.

## 6. Ejecución en producción (Titular, con asistencia)

- [ ] 6.1 **Titular:** tomar el respaldo completo en la VPS y verificarlo (`pg_restore --list`, SHA-256); copiarlo fuera de la VPS.
- [ ] 6.2 **Titular:** ejecutar el **dry-run** en producción con la lista de 1.1 y compartir el resumen (filas por esquema); confirmar que son proyectos de práctica.
- [ ] 6.3 **Titular:** ensayo — restaurar el respaldo en un contenedor sin red y ejecutar la purga real allí; compartir el resumen y confirmar que la aplicación abre contra la copia.
- [ ] 6.4 **Titular:** ejecución real en producción con `--ejecutar --confirmar <códigos> --respaldo <ruta>`; guardar la bitácora generada.
- [ ] 6.5 Verificación posterior: los proyectos ya no aparecen en el selector ni en Administración; los demás proyectos y sus dashboards responden igual; sin errores nuevos en los registros de los servicios.
- [ ] 6.6 **Titular:** revisar el manifiesto de archivos y decidir si borra los archivos huérfanos de los volúmenes.
- [ ] 6.7 Conservar el respaldo previo hasta que el titular confirme la normalidad (mínimo 30 días).

## 7. Cierre

- [ ] 7.1 Archivar el change (`/opsx:archive`).
- [ ] 7.2 Anotar en memoria: fecha de la purga, códigos eliminados, ubicación y SHA-256 del respaldo, y que la herramienta queda disponible para futuras purgas.

## 8. Corrección por topología real de producción

- [x] 8.1 Verificar directamente que producción usa una base `bocam_*` por servicio y tablas en `public`.
- [x] 8.2 Bloquear el wrapper monobase para ejecución directa en producción.
- [x] 8.3 Implementar resolución exacta en `bocam_auth` y purga transaccional por base, con auth al final.
- [x] 8.4 Exigir dump verificado por base, globals, copia externa confirmada y mantenimiento confirmado.
- [x] 8.5 Añadir pruebas multidatabase con proyecto objetivo, otro proyecto del tenant y otro tenant.
- [x] 8.6 Actualizar el runbook con respaldo y ensayo del clúster completo.
- [ ] 8.7 Publicar la corrección, ejecutar dry-run y ensayo aislado en producción.
