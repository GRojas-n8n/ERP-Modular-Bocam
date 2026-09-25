# Inventario SDD — 2026-09-24

Este inventario se levantó desde `origin/main` en `a7697f2`. Los estados no se
deducen solo de casillas: combinan presencia en `main`, tareas pendientes y
evidencia escrita en cada change.

## Changes versionados en `main`

| Change | Evidencia en `main` | Estado de baseline | Siguiente gate |
|---|---|---|---|
| `accion-directa-reconocer-alerta` | `93db98c`, PR #120; 14/14 tareas | archivado | `archive/2026-09-25-accion-directa-reconocer-alerta`; despliegue frontend `33131315093`; código presente en el bundle productivo |
| `admin-proyectos-no-depende-de-usuarios` | `4ae3e88`, PR #138; 6/6 | archivado | `archive/2026-09-25-admin-proyectos-no-depende-de-usuarios`; despliegue frontend `33219886726`; código presente en el bundle productivo |
| `archivar-reactivar-proyecto` | `147505f`, PR #139; 8/8 | archivado | `archive/2026-09-25-archivar-reactivar-proyecto`; despliegue frontend `33220311304`; código presente en el bundle productivo |
| `buscador-control-presupuestal` | `5f24e12`, PR #118; 8/8 | archivado | `archive/2026-09-25-buscador-control-presupuestal`; despliegue frontend `33131315093`; código presente en el bundle productivo |
| `captura-continua-avances-bitacora` | `17f83a1`, PR #121; 15/15 | archivado | `archive/2026-09-25-captura-continua-avances-bitacora`; despliegue frontend `33131315093`; código presente en el bundle productivo |
| `editar-y-archivar-usuarios` | `a37d436`; 17/17 | archivado | `archive/2026-09-25-editar-y-archivar-usuarios`; despliegue auth `33214674401` (sin migraciones pendientes) + frontend `33220311304`; código presente en el bundle productivo |
| `eliminacion-admin-archivos-importaciones-gt` | `8fb87be`, PR #126; 33/33 | archivado | `archive/2026-09-25-eliminacion-admin-archivos-importaciones-gt`; despliegue GT `33188212285` (aplicó `20260828151711_add_lote_importacion_insumos`) + frontend `33188212218`; código presente en el bundle productivo |
| `enlace-trazabilidad-control-presupuestal` | `25b15fd`, PR #119; 15/15 | archivado | `archive/2026-09-25-enlace-trazabilidad-control-presupuestal`; despliegue frontend `33131315093`; código presente en el bundle productivo |
| `fix-500-importar-apu-explosion-filas-boilerplate` | `b9612c8`, PR #125; 19/19 | archivado | `archive/2026-09-25-fix-500-importar-apu-explosion-filas-boilerplate`; despliegue GT `33143581908` + frontend `33143581916`; código presente en el bundle productivo |
| `fix-etiqueta-boton-importar-catalogo-obra` | `6c789cb`, PR #124; 7/7 | archivado | `archive/2026-09-25-fix-etiqueta-boton-importar-catalogo-obra`; despliegue frontend `33137980628`; código presente en el bundle productivo |
| `fix-filtro-categoria-control-costos` | `ac8e89f`, PR #117; 10/10 | archivado | `archive/2026-09-25-fix-filtro-categoria-control-costos`; despliegue frontend `33131315093`; código presente en el bundle productivo |
| `navegacion-selector-concepto-avance` | `4a1fb36`, PR #123; 11/11 | archivado | `archive/2026-09-25-navegacion-selector-concepto-avance`; despliegue frontend `33131315093`; código presente en el bundle productivo |
| `acceso-proyectos-gt-control-obra` | `58c7028`, PR #134; 11/14 | mergeado; QA pendiente | navegador real, resolver tarea 1.4 y archivar |
| `bump-dependencias-cve-multer-nodemailer-express` | `f0c6c44`, merge #142; 16/20 | mergeado; smoke pendiente | corregir tareas obsoletas de PR/merge, probar carga y correo, archivar |
| `centro-costos-confirmar-y-editar-consecutivo` | `2954611`, merge #143; 18/22 | mergeado; smoke pendiente | validar selector y flujo en producción, archivar |
| `control-presupuestal-estado-presupuesto-visible` | `ec0246d`, PR #135; 14/15 | mergeado; QA pendiente | flujo real GT/Compras |
| `explosion-insumos-mostrar-cantidades` | `d62f14b`, PR #130; 8/9 | mergeado; QA pendiente | comparar cantidades con proyecto real |
| `fix-avance-mock-mis-proyectos` | `144c8b5`, PR #132; 14/15 | mergeado; QA pendiente | comprobar avance real en navegador |
| `fix-dropdown-proyecto-transparente` | `e60ca42`, PR #131; 12/12; QA producción 2026-09-24 | archivado | `archive/2026-09-24-fix-dropdown-proyecto-transparente` |
| `fix-explosion-insumos-costo-vs-importe` | `d7fa762`, PR #129; 8/9 | mergeado; QA pendiente | importar archivo HH/HS real |
| `modal-confirmacion-antes-de-subir-archivos` | `715a529`, PR #137; 14/15 | mergeado; QA pendiente | segundo proyecto en siete flujos |
| `resaltar-selector-proyecto` | `cb27b16`, PR #133; 4/4; QA producción 2026-09-24 | archivado | `archive/2026-09-24-resaltar-selector-proyecto` |
| `sidebar-submenu-flyout-lateral` | `68746c2`, PR #136; 12/12; QA producción 2026-09-24 | archivado | `archive/2026-09-24-sidebar-submenu-flyout-lateral` |
| `purga-proyectos-demo-produccion` | PR #144 + corrección #145 (`a7697f2`); ejecución 2026-09-24 | observando | smoke autenticado, archivos huérfanos y retención hasta 2026-10-24 |
| `bloquear-datos-sin-proyecto-activo` | PR #146 (`ecc7d12`), #147, #148, #150; smoke productivo `36075808520`; 18/18 tareas | archivado | `archive/2026-09-25-bloquear-datos-sin-proyecto-activo`; specs canónicas conciliadas |
| `normalizar-baseline-sdd` | rama local aislada | implementando | validar OpenSpec y completar conciliación |

## Conciliación 3.1 — 2026-09-25

Los 12 changes versionados con cero tareas pendientes se archivaron en un lote exclusivamente documental. Evidencia usada:

1. **Merge:** cada commit es ancestro de `origin/main`.
2. **Despliegue:** el job `Build + Deploy` del run indicado terminó en éxito. El job `Smoke Test Playwright` de esos runs falló por un error de consola `403` en login+dashboard, ajeno a los cambios (ruido conocido); el smoke posterior `36075758665` quedó en verde. Los servicios backend usan `prisma migrate deploy`, verificado en los logs.
3. **Producción, solo lectura:** `https://iretum.com/assets/index-BcFl6w47.js` (build de `260d3c0`) contiene las cadenas de interfaz introducidas por cada change de frontend. No se ejecutó ninguna petición autenticada ni mutante.
4. **Límite de la evidencia:** producción no tiene proyectos tras la purga, por lo que no se ejercitaron de punta a punta los flujos con datos (deshacer importaciones, archivar usuarios, captura continua). Esa verificación funcional queda respaldada por las pruebas de cada change y por la verificación manual en desarrollo registrada en sus tareas.
5. **Especificaciones:** los deltas se sincronizaron con el CLI. Para poder aplicarlos se normalizó la estructura mínima (`Purpose`/`Requirements`) de cuatro specs históricas sin modificar sus requisitos, y se redactaron los `Purpose` de las siete capacidades nuevas.

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
