## 1. `auth` — directorio de usuarios por rol (código nuevo, TDD)

- [ ] 1.1 Test de integración: `GET /api/v1/auth/usuarios?rol=residencia`
      con rol `personal_rh` responde 200 con `id`/`nombre`/`email`
      únicamente, solo usuarios activos del tenant con ese rol.
- [ ] 1.2 Test: usuario inactivo no aparece en el listado.
- [ ] 1.3 Test: falta `rol` en el query → 400.
- [ ] 1.4 Test: rol sin permiso (`residencia`, `control_obra`, etc.) → 403.
- [ ] 1.5 Test: aislamiento por tenant (dos tenants, mismo rol, cada uno
      solo ve el suyo).
- [ ] 1.6 Confirmar los 5 tests en rojo (ruta no existe todavía).
- [ ] 1.7 Implementar `GET /api/v1/auth/usuarios` en `apps/auth/src/main.ts`
      con `requireRoles('personal_rh', 'admin')`.
- [ ] 1.8 Tests en verde.

## 2. `personal` — arreglar el bug de resolución de nombre (bug-fix cycle)

- [ ] 2.1 Test de integración que reproduce el bug: crear una
      `AsignacionResidente` real y confirmar que
      `GET /empleados/:id/residentes` hoy responde
      `residente_nombre: null` y `parcial: true` SIEMPRE, incluso con
      `auth` sano — porque la URL que llama no existe. Confirmar el test
      en rojo (es decir, que hoy pasa el caso "siempre falla" cuando no
      debería).
- [ ] 2.2 Fix: cambiar la resolución de N llamadas a
      `/api/v1/auth/usuarios/:id` (inexistente) por una sola llamada a
      `GET /api/v1/personal/residentes-disponibles` (ver tarea 3) y
      mapeo local por id.
- [ ] 2.3 Test en verde: con `auth` respondiendo, `residente_nombre` se
      resuelve de verdad.
- [ ] 2.4 Test sin cambios: `auth` caído sigue devolviendo
      `parcial: true` sin 500 (regresión del comportamiento ya
      documentado en la spec).

## 3. `personal` — directorio de residentes disponibles (código nuevo, TDD)

- [ ] 3.1 Test: `GET /api/v1/personal/residentes-disponibles` con rol
      `personal_rh` responde 200 con la lista que devuelve `auth` vía
      proxy.
- [ ] 3.2 Test: rol sin permiso → 403.
- [ ] 3.3 Test: `auth` no disponible → error controlado, no 500 crudo.
- [ ] 3.4 Confirmar los 3 tests en rojo.
- [ ] 3.5 Implementar `GET /api/v1/personal/residentes-disponibles` en
      `apps/personal/src/main.ts` (mismo patrón de proxy que ya usa
      `GET /empleados/:id/residentes`, reenviando
      `req.headers.authorization`).
- [ ] 3.6 Tests en verde.
- [ ] 3.7 Reejecutar la suite completa de `apps/personal/test` — sin
      regresión.

## 4. `app-shell` — selector de residente + aviso de elegibilidad (TDD)

- [ ] 4.1 Test de componente: la sección "Residente(s) asignado(s)"
      muestra una nota aclaratoria visible siempre (con y sin residentes
      asignados).
- [ ] 4.2 Test: el campo de texto libre se reemplaza por un `<select>`
      poblado con `GET /api/v1/personal/residentes-disponibles`
      (nombre visible, value=id).
- [ ] 4.3 Test: si el directorio falla, el selector se deshabilita con
      mensaje, el resto del panel sigue operando.
- [ ] 4.4 Test: asignar un residente elegido en el selector llama
      `POST /empleados/:id/residentes` con el id correcto.
- [ ] 4.5 Confirmar tests en rojo.
- [ ] 4.6 Implementar en `PersonalView.tsx`.
- [ ] 4.7 Tests en verde.

## 5. `app-shell` — sección "Asignación a Frente de Trabajo" (TDD)

- [ ] 5.1 Test: la sección lista las `AsignacionFrente` activas del
      empleado (filtradas client-side de `GET /asignaciones`).
- [ ] 5.2 Test: estado vacío cuando el empleado no tiene asignaciones.
- [ ] 5.3 Test: formulario exige `frente_trabajo`; sin él no envía la
      petición.
- [ ] 5.4 Test: alta exitosa refresca la lista mostrada.
- [ ] 5.5 Test: error del backend se muestra sin limpiar el formulario.
- [ ] 5.6 Confirmar tests en rojo.
- [ ] 5.7 Implementar la sección en `PersonalView.tsx` (junto a
      Residente(s) asignado(s)), incluyendo el `<select>` opcional de
      `cuadrilla_id` poblado desde `GET /cuadrillas`.
- [ ] 5.8 Tests en verde.

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
