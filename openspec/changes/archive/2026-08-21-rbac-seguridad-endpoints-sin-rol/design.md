# Análisis: consumidores reales de las 18 rutas abiertas de Seguridad

## Método

Igual que en `rbac-finanzas-lecturas`: para cada ruta se buscó (1) frontend
directo (`api.get/post/patch('/api/v1/seguridad/...')` en
`apps/app-shell/src`), (2) frontend indirecto (componentes compartidos
montados en otros módulos) y (3) backend-to-backend (`axios`/`fetch` a
`SEGURIDAD_URL` desde otro servicio).

## Mapa de consumidores

| Ruta | Consumidor | Roles que llegan hoy |
|---|---|---|
| `GET/POST/PATCH incidentes*` | ninguno | — |
| `GET/POST inspecciones` | ninguno | — |
| `GET/POST permisos`, `PATCH .../autorizar`, `PATCH .../cerrar` | ninguno | — |
| `GET/POST capacitaciones*`, `PATCH .../completar` | ninguno | — |
| `GET/POST epp`, `PATCH epp/:id/estado` | ninguno | — |
| `GET dashboard` (el genérico, no `resumen-dashboard`) | ninguno | — |
| `GET resumen-dashboard` | `DashboardView`/`useDashboardData` (home), b2b ← `asistente/resumen-ejecutivo`, `asistente/tools/seguridad.ts` (`consultar_seguridad`) | ya exige `superintendent`, `admin` — **fuera de alcance, no cambia** |

`SeguridadView.tsx` (`apps/app-shell/src/views/SeguridadView.tsx`) solo hace
`GET` de `incidentes`, `inspecciones`, `permisos`, `capacitaciones` y `epp` —
sin un solo `api.post`/`api.patch` hacia `/api/v1/seguridad`. Los botones de
creación/edición del módulo (reportar incidente, emitir permiso, programar
capacitación, registrar EPP) no están wireados a estos endpoints todavía —
mismo patrón ya documentado para `personal` en
`fix-rbac-endpoints-personal-sin-rol` (botones sin handler). Es deuda de
frontend aparte, fuera de alcance aquí.

El ítem de menú "Seguridad HSE" en `Layout.tsx:171-172` ya gatea a
`roles: ['seguridad_hse']` (+ bypass de `admin`, como todos los ítems del
menú). Es decir: el único rol que hoy puede *llegar* a `SeguridadView` por la
UI normal es `seguridad_hse` o `admin` — el conjunto propuesto no le quita
acceso a nadie que hoy lo tenga por el camino real.

## Por qué un solo conjunto para las 18 rutas

A diferencia de `rbac-finanzas-lecturas` (donde cada lectura tenía un
consumidor cruzado distinto que forzaba conjuntos distintos), aquí **no hay
ningún consumidor real** más allá de la propia vista del módulo. No hay nada
que preservar por compatibilidad, así que no hay motivo para diferenciar
lectura de escritura ni una ruta de otra: se usa el mismo conjunto que ya
protege `resumen-dashboard` (`superintendent`, `admin`), extendido con el rol
canónico del módulo que el catálogo declara `sin-backend`: `seguridad_hse`.

Se decidió explícitamente con el usuario (no tocar sin confirmar, dado que
son operaciones con implicaciones legales/STPS): `seguridad_hse`,
`superintendent`, `admin` — uniforme, sin distinguir reportar de
autorizar/cerrar.

## El rol huérfano `hse_manager`

`PATCH /permisos/:id/autorizar` (línea 363 de `main.ts`, previo al fix) es la
única ruta del archivo con una comprobación de rol — pero manual:

```ts
if (!roles.includes('admin') && !roles.includes('hse_manager') && !roles.includes('superintendent')) {
```

`hse_manager` no está en `packages/roles` (`ROLES_VALIDOS`): no es asignable
desde `AdminView`, ningún otro servicio lo exige, y no es un alias declarado.
No hay forma de que un usuario real tenga ese rol en su JWT salvo edición
manual de la base de datos. Es el mismo tipo de deriva que motivó
`catalogo-canonico-de-roles` (el bug histórico `finance` vs `finanzas`), solo
que aquí el test guardián de ese cambio no lo detectó: el guardián busca
`requireRoles\(([^)]*)\)` y `rolesAutorizados\s*=\s*\[([^\]]*)\]` por regex
sobre el código fuente, y un `roles.includes('hse_manager')` inline no calza
ninguno de los dos patrones.

Se decidió con el usuario reemplazar `hse_manager` por `seguridad_hse` al
convertir esta ruta a `requireRoles(...)`, alineándola con el resto del
change y con el catálogo. `admin` y `superintendent` no cambian.
