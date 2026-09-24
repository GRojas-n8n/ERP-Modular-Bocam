## 1. Preservación y línea base

- [x] 1.1 Actualizar referencias remotas sin modificar archivos locales.
- [x] 1.2 Crear un worktree limpio desde el `origin/main` desplegado.
- [x] 1.3 Inventariar archivos modificados, borradores OpenSpec, ramas y worktrees.
- [x] 1.4 Confirmar que los tres `package.json` marcados no tienen diferencias de contenido.
- [x] 1.5 Declarar los diez borradores locales como trabajo preservado; no moverlos, agregarlos ni borrarlos.

## 2. Normalización documental

- [x] 2.1 Crear proposal, design, spec y tasks para el gobierno del baseline SDD.
- [x] 2.2 Corregir la especificación de purga para reflejar bases separadas y transacción por base.
- [x] 2.3 Registrar la ejecución real y separar verificaciones completadas de pendientes.
- [x] 2.4 Generar la matriz completa de changes activos con evidencia de merge y siguiente acción (`inventory.md`).
- [x] 2.5 Validar estrictamente `normalizar-baseline-sdd` y `purga-proyectos-demo-produccion` con el CLI oficial de OpenSpec.

## 3. Conciliación

- [ ] 3.1 Revisar los changes con cero tareas pendientes contra `main` y producción.
- [ ] 3.2 Preparar un lote documental de archivo únicamente para los changes con evidencia completa.
- [x] 3.3 Preservar cada borrador local en su rama independiente `codex/draft-*`, sin publicarla ni mezclar implementaciones.
- [x] 3.4 Actualizar el checkout principal por avance rápido a `a7697f2`, conservando intactos los archivos originales y con los borradores ya respaldados en ramas.

## 4. Cierre de la purga

- [x] 4.1 Registrar respaldo, dry-run, ensayo aislado, ejecución, verificación de base y salud de servicios.
- [ ] 4.2 Validar con sesión autenticada que selector, Administración y dashboards operan normalmente.
- [ ] 4.3 Decidir si se eliminan los 15 archivos potencialmente huérfanos.
- [ ] 4.4 Conservar el respaldo hasta al menos 2026-10-24 y confirmar normalidad antes de archivarlo.

## 5. Entrega

- [x] 5.1 Revisar el diff y `git diff --check`: solo contiene documentación y metadatos OpenSpec, sin errores de whitespace.
- [ ] 5.2 Mantener la rama local hasta que el repositorio sea privado o se sanee la exposición.
- [ ] 5.3 Tras cumplir 3 y 4, archivar este change y `purga-proyectos-demo-produccion`.
