## 1. Catálogo

- [x] 1.1 Crear `packages/roles` sin dependencias, con `id`, `label`, `estado` (`asignable` / `sin-backend` / `alias`) y `canonico` para los alias.
- [x] 1.2 Poblarlo con los 17 roles que aparecen hoy en backend, menú y selector, clasificados.
- [x] 1.3 Registrar el workspace en `package-lock.json` — sin esto `npm ci` falla en el build de Docker.

## 2. Test guardián

- [x] 2.1 Barrido de `apps/*/src/*.ts` (`requireRoles` y `rolesAutorizados`) y de `Layout.tsx`.
- [x] 2.2 Falla si un servicio exige un rol no catalogado.
- [x] 2.3 Falla si el backend exige un rol no asignable y que no sea alias — el bug original.
- [x] 2.4 Verifica que los alias apunten a un canónico existente y que no haya ids repetidos.
- [x] 2.5 Test de que el barrido encuentra código real, para que no pase en verde por leer cadena vacía si cambia la estructura de carpetas.
- [x] 2.6 Comprobado por mutación: al quitar `warehouse` del catálogo, 3 de los 6 tests fallan nombrando `warehouse (exigido por almacen)`.

## 3. Consumidores

- [x] 3.1 `AdminView` usa `ROLES_ASIGNABLES` y `etiquetaDeRol`; se elimina su lista duplicada.
- [x] 3.2 Aviso en la interfaz al seleccionar un rol `sin-backend`.
- [x] 3.3 `apps/auth` valida `roles` con el catálogo (estricto al crear, tolerante con alias al editar) y nombra el rol no reconocido en el mensaje.
- [x] 3.4 Alias `@bocam/roles` en `vite.config.ts`, `vitest.config.ts` y `tsconfig.app.json`.

## 4. Verificación

- [x] 4.1 `packages/roles` 6/6 · `apps/auth` 37/37 · `apps/app-shell` 237/237.
- [x] 4.2 `tsc --noEmit` limpio en `packages/roles`, `apps/auth` y `apps/app-shell`.
- [x] 4.3 `npm run build -w app-shell` compila con el alias nuevo.
- [x] 4.4 Docker: `Dockerfile.backend` y `Dockerfile.app-shell` copian el repo completo, así que `packages/roles` entra sin cambios.
- [ ] 4.5 Desplegar y dar de alta un almacenista real en `iretum.com`, confirmando que entra a Almacén sin ser admin.

## 5. Nota sobre el estado de los roles

Clasificación resultante del barrido, para referencia:

| Estado | Roles |
|---|---|
| `asignable` | admin, superintendent, director, procurement, gerencia_tecnica, residencia, control_obra, control_proyectos, finanzas, personal_rh, calidad, warehouse |
| `sin-backend` | contabilidad, seguridad_hse, ventas |
| `alias` | resident (residencia), compras (procurement), technical (gerencia_tecnica) |

Los tres `sin-backend` siguen siendo asignables a propósito: los módulos existen
en el menú y quitarlos del selector escondería el problema en vez de mostrarlo.
El aviso en la interfaz hace que el administrador sepa lo que está creando.
