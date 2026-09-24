## Context

Línea base observada el 2026-09-24:

- `origin/main` apunta al merge de la corrección multidatabase de la purga.
- El checkout principal local está dos commits detrás y contiene diez directorios
  OpenSpec sin seguimiento; se consideran trabajo del titular y no se alteran.
- Tres `package.json` aparecen modificados, pero `git diff`, `--raw` y
  `--numstat` no muestran cambios de contenido; se clasifican como estado local
  de formato/fin de línea, no como implementación pendiente.
- Existen changes activos con todas sus tareas marcadas, otros con verificación
  o archivo pendiente y borradores de controles críticos todavía sin rama.
- Producción contiene bases separadas por servicio y tablas en `public`.

## Decisions

### 1. El inventario se genera desde un worktree limpio

La normalización se realiza en una rama aislada creada desde `origin/main`. No se
hace `reset`, `checkout`, `add` ni limpieza sobre el checkout principal.

### 2. Estado por evidencia, no por porcentaje de tareas

Un change solo puede clasificarse como:

| Estado | Evidencia mínima |
|---|---|
| `borrador-local` | Existe localmente, sin commit/PR |
| `especificado` | Proposal, spec, design y tasks válidos |
| `implementado` | Código y pruebas locales completos |
| `mergeado` | Commit de merge identificable en `main` |
| `desplegado` | Ejecución de CI/deploy identificable |
| `observando` | Smoke correcto; ventana de observación abierta |
| `archivable` | Verificación final y documentación completadas |
| `bloqueado` | Dependencia o decisión externa explícita |

Los estados son progresivos, excepto `bloqueado`, que puede aplicarse en
cualquier etapa.

### 3. No se publican detalles nuevos de seguridad antes de contener la exposición

El inventario detallado permanece en la rama local. La publicación se hará solo
cuando el repositorio sea privado o el contenido sensible se haya saneado.

### 4. La topología de producción es normativa

Para operaciones futuras se asume una base `bocam_*` por servicio, tablas en
`public` y ausencia de transacciones distribuidas preparadas. Toda operación
coordinada debe definir congelamiento de escrituras, orden, compensación o
restauración completa.

## Inventario inicial

### Trabajo local preservado

Los siguientes borradores existen únicamente en el checkout principal y deben
entrar en ramas separadas, sin copiarse ni mezclarse en este change:

- `backups-postgres-verificados`
- `ci-tests-unitarios-y-audit`
- `csp-report-only-caddy`
- `deploy-ssh-host-key-pinning`
- `limpieza-scripts-legacy-raiz`
- `preview-editable-catalogo-explosion-apu`
- `proteccion-rama-main`
- `refresh-token-cookie-httponly`
- `sanear-exposicion-infra-docs`
- `timeout-inactividad-configurable-admin`

### Changes que requieren conciliación

- Changes con cero tareas pendientes: comprobar merge, despliegue y verificación
  antes de archivarlos en un lote exclusivamente documental.
- Changes con una a cuatro tareas pendientes: completar exactamente sus gates de
  producción; no reimplementar lo ya mergeado.
- `purga-proyectos-demo-produccion`: operación completada; quedan la validación
  autenticada, decisión de archivos huérfanos y retención mínima del respaldo.

## Risks / Trade-offs

- Archivar en masa sin verificar puede convertir supuestos en especificaciones
  normativas falsas.
- Publicar ahora el inventario de hardening ampliaría la exposición del
  repositorio público; por eso el change se mantiene local.
- El checkout principal seguirá mostrando cambios hasta que cada borrador tenga
  una rama propia. Esto es intencional: preservar tiene prioridad sobre limpiar.
