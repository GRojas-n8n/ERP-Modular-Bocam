## Context

`apps/personal/src/main.ts` (RH) y `apps/app-shell/src/views/PersonalView.tsx`
(su vista) crecieron a base de features puntuales; el botón "+" del header
solo terminó cableado para una de sus tres pestañas, y la sección de
asignación de residente se implementó (spec `asignacion-residente-empleado`)
sin verificar que la ruta de `auth` que necesitaba para resolver nombres
existiera de verdad. `auth` expone un único listado de usuarios
(`GET /api/v1/auth/admin/users`) gated a `admin`, pensado para
administración de cuentas, no para poblar selectores desde otros
microservicios.

El patrón ya establecido para llamadas backend-a-backend está en el mismo
archivo (`GET /empleados/:id/residentes` llamando a `auth` con el
`Authorization` del usuario original) — este change lo reutiliza en vez de
inventar uno nuevo.

## Goals / Non-Goals

**Goals:**
- Que los tres botones/CTAs de RH (Nueva Cuadrilla, Calcular Nómina,
  Asignar residente) hagan lo que dicen que hacen.
- Que "Residente(s) asignado(s)" muestre nombres reales, no UUIDs.
- Que exista una forma real, desde la UI, de hacer elegible a un empleado
  para asistencia/nómina de un proyecto sin pasar por Cuadrillas.
- Exponer el mínimo de superficie nueva en `auth` necesaria para esto —
  no una API de administración de usuarios de propósito general.

**Non-Goals:**
- No se toca el flujo de préstamo de empleado (spec 02) ni se le agrega UI
  en este change — sigue siendo backend-only, es un change aparte si se
  decide darle UI.
- No se corrigen los inputs legacy sin `htmlFor`/`id` fuera de los
  paneles/secciones nuevas de este change (decidido con el usuario:
  alcance visual acotado).
- No se reorganiza el layout general del panel de detalle de empleado —
  la sección nueva de Frente de Trabajo se añade junto a la de Residentes,
  sin reordenar lo demás.
- No se construye un mecanismo de búsqueda/paginación en el selector de
  residentes — la lista de usuarios con rol `residencia` por tenant es
  chica (decenas, no miles); un `<select>` simple basta.

## Decisions

- **Ruta nueva en `auth` en vez de abrir `/admin/users` a más roles.**
  Alternativa considerada: cambiar `requireAdminRole` por
  `requireRoles('admin', 'personal_rh')` en la ruta existente. Se
  descarta porque esa ruta devuelve `proyectos_acceso` y otros campos de
  administración de cuentas — exponerla a `personal_rh` filtraría más de
  lo necesario para un selector. La ruta nueva
  (`GET /api/v1/auth/usuarios?rol=<rol>`) devuelve solo `id`, `nombre`,
  `email`, y respeta el principio de mínima exposición.
- **El proxy vive en `personal`, no se llama a `auth` desde `app-shell`.**
  Es la regla ya establecida del proyecto ("una vista solo llama a su
  propio servicio") y el patrón que ya existe en el mismo archivo para
  resolver `residente_nombre`. `GET /api/v1/personal/residentes-disponibles`
  reenvía el `Authorization` del usuario, igual que la llamada existente.
- **Resolver nombres con una llamada de listado, no N llamadas por id.**
  El código actual hace un `fetch` por cada `AsignacionResidente` (además
  de apuntar a una URL inexistente). Con la ruta nueva de listado, una
  sola llamada trae todos los residentes del tenant y se resuelve con un
  `Map` en memoria — más simple y más barato que arreglar el bug
  manteniendo N llamadas.
- **La sección de Frente de Trabajo se agrega junto a la de Residentes,
  no reemplaza nada.** Alternativa considerada: fusionar ambos flujos en
  un solo formulario ("asignar residente Y frente en un paso"). Se
  descarta por alcance — el usuario pidió el panel de Frente de Trabajo
  como pieza aparte, con una nota que conecta ambos conceptualmente, no
  una fusión de flujos (que cambiaría el modelo de datos backend, fuera
  de alcance).
- **El `<select>` de residentes no reemplaza la validación de backend.**
  El backend sigue aceptando `residente_id` como string libre en
  `POST /empleados/:id/residentes` (no se agrega validación de que el id
  exista en `auth` con rol `residencia` — eso ya lo cubre spec 02 y no es
  parte de este change). El selector es una mejora de UX en la captura,
  no un candado nuevo de integridad.

## Risks / Trade-offs

- [Riesgo: la ruta nueva de `auth` podría filtrar usuarios de otros
  tenants si se olvida el scoping] → Mitigación: usar el mismo patrón
  `req.securityContext.tenantId` que ya usan todas las rutas de `auth`
  (`GET /admin/users` lo hace así), con test de integración que verifique
  aislamiento por tenant.
- [Riesgo: si `auth` no responde, el selector de residentes queda vacío y
  bloquea la asignación] → Mitigación: mismo patrón de degradación que ya
  existe (`parcial: true`) — si el fetch a `residentes-disponibles` falla,
  el selector se deshabilita con un mensaje, sin romper el resto del
  panel de empleado.
- [Riesgo: cobertura de tests insuficiente en paneles nuevos de frontend]
  → Mitigación: TDD estricto por panel, mínimo 80% en los archivos
  nuevos/tocados, siguiendo el patrón de
  `PersonalView.nuevo-empleado.test.tsx`.

## Migration Plan

- Sin migración de datos — no hay cambios de schema en ningún servicio.
- Orden de despliegue: `auth` primero (ruta nueva, aditiva), luego
  `personal` (proxy + fix, aditiva), luego `app-shell` (consume ambas).
  Cada paso es retrocompatible si se despliega antes que el siguiente.
- Rollback: revertir el commit de cada servicio de forma independiente —
  ninguno depende de que el otro esté desplegado para seguir funcionando
  (si `app-shell` viejo corre contra `personal` nuevo, simplemente no usa
  la ruta nueva; si `app-shell` nuevo corre contra `auth` viejo, el
  selector de residentes se degrada a "sin datos" sin romper nada más).
