# Inventario SDD — 2026-09-24

Este inventario se levantó desde `origin/main` en `a7697f2`. Los estados no se
deducen solo de casillas: combinan presencia en `main`, tareas pendientes y
evidencia escrita en cada change.

## Changes versionados en `main`

| Change | Evidencia en `main` | Estado de baseline | Siguiente gate |
|---|---|---|---|
| `accion-directa-reconocer-alerta` | `93db98c`, PR #120; 14/14 tareas | mergeado; candidato a archivo | confirmar que el despliegue vigente contiene el commit y archivar |
| `admin-proyectos-no-depende-de-usuarios` | `4ae3e88`, PR #138; 6/6 | mergeado; candidato a archivo | registrar despliegue/smoke y archivar |
| `archivar-reactivar-proyecto` | `147505f`, PR #139; 8/8 | mergeado; candidato a archivo | registrar despliegue/smoke y archivar |
| `buscador-control-presupuestal` | `5f24e12`, PR #118; 8/8 | mergeado; candidato a archivo | confirmar despliegue y archivar |
| `captura-continua-avances-bitacora` | `17f83a1`, PR #121; 15/15 | mergeado; candidato a archivo | confirmar despliegue y archivar |
| `editar-y-archivar-usuarios` | `a37d436`; 17/17 | mergeado; candidato a archivo | confirmar despliegue y archivar |
| `eliminacion-admin-archivos-importaciones-gt` | `8fb87be`, PR #126; 33/33 | mergeado; candidato a archivo | confirmar despliegue y archivar |
| `enlace-trazabilidad-control-presupuestal` | `25b15fd`, PR #119; 15/15 | mergeado; candidato a archivo | confirmar despliegue y archivar |
| `fix-500-importar-apu-explosion-filas-boilerplate` | `b9612c8`, PR #125; 19/19 | mergeado; candidato a archivo | confirmar despliegue y archivar |
| `fix-etiqueta-boton-importar-catalogo-obra` | `6c789cb`, PR #124; 7/7 | mergeado; candidato a archivo | confirmar despliegue y archivar |
| `fix-filtro-categoria-control-costos` | `ac8e89f`, PR #117; 10/10 | mergeado; candidato a archivo | confirmar despliegue y archivar |
| `navegacion-selector-concepto-avance` | `4a1fb36`, PR #123; 11/11 | mergeado; candidato a archivo | confirmar despliegue y archivar |
| `acceso-proyectos-gt-control-obra` | `58c7028`, PR #134; 11/14 | mergeado; QA pendiente | navegador real, resolver tarea 1.4 y archivar |
| `bump-dependencias-cve-multer-nodemailer-express` | `f0c6c44`, merge #142; 16/20 | mergeado; smoke pendiente | corregir tareas obsoletas de PR/merge, probar carga y correo, archivar |
| `centro-costos-confirmar-y-editar-consecutivo` | `2954611`, merge #143; 18/22 | mergeado; smoke pendiente | validar selector y flujo en producción, archivar |
| `control-presupuestal-estado-presupuesto-visible` | `ec0246d`, PR #135; 14/15 | mergeado; QA pendiente | flujo real GT/Compras |
| `explosion-insumos-mostrar-cantidades` | `d62f14b`, PR #130; 8/9 | mergeado; QA pendiente | comparar cantidades con proyecto real |
| `fix-avance-mock-mis-proyectos` | `144c8b5`, PR #132; 14/15 | mergeado; QA pendiente | comprobar avance real en navegador |
| `fix-dropdown-proyecto-transparente` | `e60ca42`, PR #131; 10/12 | mergeado; QA pendiente | Chrome real y anchos soportados |
| `fix-explosion-insumos-costo-vs-importe` | `d7fa762`, PR #129; 8/9 | mergeado; QA pendiente | importar archivo HH/HS real |
| `modal-confirmacion-antes-de-subir-archivos` | `715a529`, PR #137; 14/15 | mergeado; QA pendiente | segundo proyecto en siete flujos |
| `resaltar-selector-proyecto` | `cb27b16`, PR #133; 3/4 | mergeado; QA pendiente | temas claro/oscuro |
| `sidebar-submenu-flyout-lateral` | `68746c2`, PR #136; 10/12 | mergeado; QA pendiente | escritorio, 768–900 px y móvil |
| `purga-proyectos-demo-produccion` | PR #144 + corrección #145 (`a7697f2`); ejecución 2026-09-24 | observando | smoke autenticado, archivos huérfanos y retención hasta 2026-10-24 |
| `normalizar-baseline-sdd` | rama local aislada | implementando | validar OpenSpec y completar conciliación |

## Borradores locales preservados

Los diez borradores listados en `design.md` no están en `origin/main`. Ninguno se
copió a esta rama. Su orden de incorporación recomendado es:

1. `sanear-exposicion-infra-docs`
2. `backups-postgres-verificados`
3. `ci-tests-unitarios-y-audit`
4. `proteccion-rama-main`
5. `deploy-ssh-host-key-pinning`
6. `refresh-token-cookie-httponly`
7. `csp-report-only-caddy`
8. `timeout-inactividad-configurable-admin`
9. `limpieza-scripts-legacy-raiz`
10. `preview-editable-catalogo-explosion-apu`

## Reglas de conciliación

1. No actualizar el checkout principal mientras los borradores sigan sin rama.
2. No usar un solo PR para los diez borradores.
3. Corregir tareas obsoletas cuando Git demuestre que PR o merge ya ocurrieron.
4. Agrupar archivos únicamente cuando no modifiquen código ni especificaciones
   canónicas incompatibles.
5. Las verificaciones de navegador que alteren datos deben usar registros de
   prueba identificables y reversibles; archivar/reactivar, no eliminar.
6. El lote de archivo debe producir un diff exclusivamente documental y pasar la
   validación OpenSpec completa.
