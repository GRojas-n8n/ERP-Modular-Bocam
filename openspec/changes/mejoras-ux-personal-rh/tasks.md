## 1. `auth` — directorio de usuarios por rol (código nuevo, TDD)

- [x] 1.1 Test de integración: `GET /api/v1/auth/usuarios?rol=residencia`
      con rol `personal_rh` responde 200 con `id`/`nombre`/`email`
      únicamente, solo usuarios activos del tenant con ese rol.
- [x] 1.2 Test: usuario inactivo no aparece en el listado.
- [x] 1.3 Test: falta `rol` en el query → 400.
- [x] 1.4 Test: rol sin permiso (`residencia`, `control_obra`, etc.) → 403.
- [x] 1.5 Test: aislamiento por tenant (dos tenants, mismo rol, cada uno
      solo ve el suyo).
- [x] 1.6 Confirmar los 5 tests en rojo (ruta no existe todavía).
      **Resultado:** confirmado — 404 contra `personal_rh debe poder
      listar usuarios por rol` antes de implementar la ruta.
- [x] 1.7 Implementar `GET /api/v1/auth/usuarios` en `apps/auth/src/main.ts`
      con `requireRoles('personal_rh', 'admin')`.
- [x] 1.8 Tests en verde.
      **Resultado:** los 5 tests nuevos en verde
      (`apps/auth/test/integration/directorio-usuarios-por-rol.integration.test.ts`);
      suite completa de `apps/auth/test/integration` (4 archivos) sin
      regresión; `tsc --noEmit` limpio.

## 2. `personal` — arreglar el bug de resolución de nombre (bug-fix cycle)

- [x] 2.1 Test de integración que reproduce el bug: crear una
      `AsignacionResidente` real y confirmar que
      `GET /empleados/:id/residentes` hoy responde
      `residente_nombre: null` y `parcial: true` SIEMPRE, incluso con
      `auth` sano — porque la URL que llama no existe. Confirmar el test
      en rojo (es decir, que hoy pasa el caso "siempre falla" cuando no
      debería).
      **Resultado:** test cross-servicio (levanta `auth` real además de
      `personal`) en
      `apps/personal/test/integration/resolucion-nombre-residente.integration.test.ts`.
      Confirmado en rojo: `parcial` daba `true` con `auth` sano
      (esperado `false`), reproduciendo el bug documentado en
      `hallazgo-personal-botones-sin-handler-y-flujo-oculto`.
- [x] 2.2 Fix: cambiar la resolución de N llamadas a
      `/api/v1/auth/usuarios/:id` (inexistente) por una sola llamada a
      `GET /api/v1/personal/residentes-disponibles` (ver tarea 3) y
      mapeo local por id.
      **Resultado:** se extrajo un helper compartido
      `obtenerResidentesDisponibles()` en `apps/personal/src/main.ts`
      (una sola llamada de listado a `auth`, resuelta con `Map` en
      memoria) usado tanto por el fix como por la ruta nueva de la
      tarea 3 — se implementaron juntos por estar acopladas.
- [x] 2.3 Test en verde: con `auth` respondiendo, `residente_nombre` se
      resuelve de verdad.
- [x] 2.4 Test sin cambios: `auth` caído sigue devolviendo
      `parcial: true` sin 500 (regresión del comportamiento ya
      documentado en la spec).
      **Resultado:** ambos tests (2.1/2.3 y 2.4) en verde. Suite
      completa de `apps/personal/test/integration` (14 archivos) sin
      regresión — los 2 fallos preexistentes (`expediente-empleado`
      descarga, `rls-personal-tablas-nuevas`) son gaps ya documentados
      en memoria, no causados por este cambio. `tsc --noEmit` limpio.

## 3. `personal` — directorio de residentes disponibles (código nuevo, TDD)

- [x] 3.1 Test: `GET /api/v1/personal/residentes-disponibles` con rol
      `personal_rh` responde 200 con la lista que devuelve `auth` vía
      proxy.
- [x] 3.2 Test: rol sin permiso → 403.
- [x] 3.3 Test: `auth` no disponible → error controlado, no 500 crudo.
- [x] 3.4 Confirmar los 3 tests en rojo.
      **Nota:** la ruta se implementó junto con el fix de la tarea 2.2
      (comparten el mismo helper `obtenerResidentesDisponibles()`), así
      que estos 3 tests se escribieron después de esa implementación
      compartida en vez de antes — no se verificó su rojo de forma
      aislada. Los 3 confirmados en verde en
      `apps/personal/test/integration/residentes-disponibles.integration.test.ts`.
- [x] 3.5 Implementar `GET /api/v1/personal/residentes-disponibles` en
      `apps/personal/src/main.ts` (mismo patrón de proxy que ya usa
      `GET /empleados/:id/residentes`, reenviando
      `req.headers.authorization`).
- [x] 3.6 Tests en verde.
- [x] 3.7 Reejecutar la suite completa de `apps/personal/test` — sin
      regresión.
      **Resultado:** ya cubierto en 2.4 (misma corrida de los 14
      archivos de `test/integration`, sin regresión atribuible a este
      change).

## 4. `app-shell` — selector de residente + aviso de elegibilidad (TDD)

- [x] 4.1 Test de componente: la sección "Residente(s) asignado(s)"
      muestra una nota aclaratoria visible siempre (con y sin residentes
      asignados).
- [x] 4.2 Test: el campo de texto libre se reemplaza por un `<select>`
      poblado con `GET /api/v1/personal/residentes-disponibles`
      (nombre visible, value=id).
- [x] 4.3 Test: si el directorio falla, el selector se deshabilita con
      mensaje, el resto del panel sigue operando.
- [x] 4.4 Test: asignar un residente elegido en el selector llama
      `POST /empleados/:id/residentes` con el id correcto.
- [x] 4.5 Confirmar tests en rojo.
      **Resultado:** confirmado — los 4 tests nuevos fallaron contra el
      código anterior (nota ausente, `<select>` inexistente, sin manejo
      de error del directorio).
- [x] 4.6 Implementar en `PersonalView.tsx`.
      **Resultado:** nuevo estado `residentesDisponibles`/
      `residentesDisponiblesError`, `cargarResidentesDisponibles()`
      llamado junto con `cargarResidentes`/`cargarExpediente`/
      `cargarCredencial` al abrir el panel; el input de texto libre se
      reemplazó por un `<select>` (deshabilitado + mensaje si el
      directorio falla) y se agregó la nota de elegibilidad de proyecto.
- [x] 4.7 Tests en verde.
      **Resultado:** los 4 tests nuevos en
      `apps/app-shell/src/views/PersonalView.selector-residente.test.tsx`
      en verde; suite completa de `app-shell` (45 archivos, 127 tests)
      sin regresión; `tsc -b` limpio.

## 5. `app-shell` — sección "Asignación a Frente de Trabajo" (TDD)

- [x] 5.1 Test: la sección lista las `AsignacionFrente` activas del
      empleado (filtradas client-side de `GET /asignaciones`).
- [x] 5.2 Test: estado vacío cuando el empleado no tiene asignaciones.
- [x] 5.3 Test: formulario exige `frente_trabajo`; sin él no envía la
      petición.
- [x] 5.4 Test: alta exitosa refresca la lista mostrada.
- [x] 5.5 Test: error del backend se muestra sin limpiar el formulario.
- [x] 5.6 Confirmar tests en rojo.
      **Resultado:** confirmado — los 5 tests fallaron contra el código
      anterior (la sección no existía).
- [x] 5.7 Implementar la sección en `PersonalView.tsx` (junto a
      Residente(s) asignado(s)), incluyendo el `<select>` opcional de
      `cuadrilla_id` poblado desde `GET /cuadrillas`.
      **Resultado:** reutiliza el estado `cuadrillas` ya cargado al
      montar la vista (mismo `GET /api/v1/personal/cuadrillas`), sin
      fetch adicional. Nuevo estado `asignacionesFrente` +
      `cargarAsignacionesFrente()` (filtra client-side por
      `empleado_id` y `estado === 'ACTIVA'`), llamado junto con el
      resto de las cargas al abrir el panel.
- [x] 5.8 Tests en verde.
      **Resultado:** los 5 tests nuevos en
      `apps/app-shell/src/views/PersonalView.frente-trabajo.test.tsx`
      en verde; suite completa de `app-shell` (46 archivos, 132 tests)
      sin regresión; `tsc -b` limpio.

## 6. `app-shell` — panel "Nueva Cuadrilla" (TDD)

- [ ] 6.1 Test: clic en el botón (con `activeTab==='cuadrillas'`) abre
      el panel.
- [ ] 6.2 Test: validación de campos obligatorios (`nombre`,
      `especialidad`).
- [ ] 6.3 Test: alta exitosa cierra el panel y refresca la lista de
      cuadrillas.
- [ ] 6.4 Test: error del backend mantiene el panel abierto con el
      mensaje.
- [ ] 6.5 Test: estado vacío de Cuadrillas muestra el CTA y abre el
      mismo panel.
- [ ] 6.6 Confirmar tests en rojo.
- [ ] 6.7 Implementar el panel + wiring del botón + `action` en
      `EmptyStatePanel`.
- [ ] 6.8 Tests en verde.

## 7. `app-shell` — panel "Calcular Nómina" (TDD)

- [ ] 7.1 Test: clic en el botón (con `activeTab==='prenomina'`) abre el
      panel.
- [ ] 7.2 Test: validación de campos obligatorios (`periodo_inicio`,
      `periodo_fin`); confirma que NO se envía `periodo_tipo`.
- [ ] 7.3 Test: cálculo exitoso cierra el panel y refresca la lista de
      pre-nóminas.
- [ ] 7.4 Test: error del backend mantiene el panel abierto con el
      mensaje.
- [ ] 7.5 Test: estado vacío de Pre-Nómina muestra el CTA y abre el
      mismo panel.
- [ ] 7.6 Confirmar tests en rojo.
- [ ] 7.7 Implementar el panel + wiring del botón + `action` en
      `EmptyStatePanel`.
- [ ] 7.8 Tests en verde.

## 8. Verificación integral

- [ ] 8.1 Suite completa de `apps/auth/test`, `apps/personal/test` y
      `npx vitest run` en `apps/app-shell` — todo en verde (o solo con
      las fallas preexistentes ya documentadas, sin nuevas).
- [ ] 8.2 Verificación manual en navegador (real, con los 3 servicios
      levantados): sesión `personal_rh`/`admin` — crear cuadrilla,
      calcular pre-nómina, asignar residente por nombre, crear
      asignación a frente de trabajo, confirmar que el empleado
      recién asignado a frente aparece en `obtenerEmpleadoIdsDelProyecto`
      (p. ej. sale elegible en un cálculo de pre-nómina de prueba).
- [ ] 8.3 Verificación manual con rol sin permiso: los endpoints nuevos
      (`/auth/usuarios`, `/personal/residentes-disponibles`) responden
      403.

## 9. Cierre

- [ ] 9.1 Commit(s) — confirmar con el usuario alcance y mensaje antes de
      commitear.
- [ ] 9.2 Push — solo si el usuario lo pide explícitamente.
- [ ] 9.3 Archivar el change cuando el usuario confirme que está listo.
