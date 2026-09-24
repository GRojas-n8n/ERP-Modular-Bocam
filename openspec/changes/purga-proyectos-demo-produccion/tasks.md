## 1. Prerrequisitos (Titular)

- [x] 1.1 **Titular:** entregar la **lista exacta de proyectos a eliminar** (código de Centro de Costos y nombre de cada uno) y confirmar el tenant. Se anexa al PR; ningún proyecto fuera de esa lista se toca.
- [x] 1.2 **Titular:** confirmar que ninguno de esos proyectos tiene datos reales que deban conservarse (revisar el dry-run de la tarea 6.2). **Confirmado el 2026-09-24 tras revisar 1,926 filas objetivo.**
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

- [x] 5.1 PR contra `main` con CI verde. PR inicial #144 y corrección multidatabase #145; ambos con gates requeridos en verde.
- [x] 5.2 Merge. La herramienta inicial y su corrección se publicaron en `main`; el merge no ejecutó la purga.

## 6. Ejecución en producción (Titular, con asistencia)

- [x] 6.1 **Titular:** respaldo completo de las 12 bases y roles globales, validado con `pg_restore --list` y SHA-256, y copiado fuera de la VPS. Identificador: `pre-purga-20260924-195212`.
- [x] 6.2 **Titular:** dry-run ejecutado en producción con la lista confirmada: 1,926 filas y 15 referencias potenciales a archivos; sin cambios.
- [x] 6.3 **Titular:** ensayo completado sobre la restauración de las 12 bases en un contenedor sin red; purga y verificaciones en verde.
- [x] 6.4 **Titular:** ejecución real completada el 2026-09-24 20:05 UTC; bitácora y manifiesto copiados fuera de la VPS.
- [ ] 6.5 Verificación posterior completa.
  - [x] Base de datos: cero proyectos objetivo y cero filas con sus identificadores en las 12 bases.
  - [x] Operación: todos los contenedores saludables, cero reinicios, HTTPS 200 y sin errores críticos recientes.
  - [ ] Sesión autenticada: confirmar selector de proyectos, Administración y dashboards de proyectos conservados.
- [ ] 6.6 **Titular:** revisar el manifiesto de archivos y decidir si borra los archivos huérfanos de los volúmenes.
- [ ] 6.7 Conservar el respaldo previo hasta que el titular confirme la normalidad, como mínimo hasta 2026-10-24.

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
- [x] 8.7 Publicar la corrección, ejecutar dry-run y ensayo aislado en producción. PR #145, merge `a7697f2`; ejecución validada el 2026-09-24.

## 9. Evidencia de ejecución

- Ventana de mantenimiento iniciada con escrituras de aplicación detenidas.
- Respaldo: 12 dumps en formato custom + roles globales + manifiesto SHA-256; copia externa verificada byte a byte.
- Dry-run: 1,926 filas distribuidas entre autenticación, compras, control de proyectos, finanzas, gerencia técnica y personal.
- Ensayo: restauración completa y purga real en contenedor `--network none`.
- Producción: transacción verificable por base, `bocam_auth` al final; resultado exitoso en las 12 bases.
- Postcondición: cero registros objetivo; servicios saludables y `https://iretum.com/` con HTTP 200.
- Pendientes: validación autenticada, decisión sobre 15 archivos potencialmente huérfanos y retención del respaldo hasta 2026-10-24.
