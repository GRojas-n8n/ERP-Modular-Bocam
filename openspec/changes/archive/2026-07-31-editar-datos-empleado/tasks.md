## 1. Backend — tests primero (TDD)

- [x] 1.1 Escribir test que reproduce el gap actual: `PATCH /api/v1/personal/empleados/:id`
      con campos generales (`nombre`, `puesto`, etc.) en el body devuelve 200 pero
      NO los persiste (test debe fallar hoy, confirmando el bug/gap antes de tocar código)
- [x] 1.2 Escribir test: PATCH con campo obligatorio vacío (ej. `rfc: ''`) responde
      400 `PER_MISSING_FIELDS` y no modifica el registro
- [x] 1.3 Escribir test: PATCH con `rfc` nuevo que ya pertenece a otro empleado del
      mismo tenant responde 400 `PER_RFC_DUPLICADO` y no modifica ningún registro
- [x] 1.4 Escribir test: PATCH con `rfc` nuevo sin colisión actualiza el empleado y
      responde 200 con el `rfc` nuevo
- [x] 1.5 Escribir test: PATCH sin el campo `rfc` en el body no dispara el chequeo
      de unicidad (solo actualiza los campos enviados)
- [x] 1.6 Escribir test: PATCH sin rol `personal_rh` ni `admin` responde 403 y no
      modifica el empleado
- [x] 1.7 Escribir test: PATCH con campos generales + campos de jornada en el mismo
      body actualiza ambos grupos correctamente (no rompe el contrato existente de
      jornada)

## 2. Backend — implementación

- [x] 2.1 Extender la desestructuración del handler `PATCH /api/v1/personal/empleados/:id`
      (`apps/personal/src/main.ts` línea ~288) para incluir `nombre`,
      `apellido_paterno`, `apellido_materno`, `rfc`, `curp`, `nss`, `puesto`,
      `salario_diario`, `telefono`, `email`, `contacto_emergencia`
- [x] 2.2 Agregar validación: si alguno de los campos obligatorios
      (`nombre`, `apellido_paterno`, `rfc`, `puesto`, `salario_diario`) viene
      presente en el body pero vacío, responder 400 `PER_MISSING_FIELDS`
- [x] 2.3 Agregar chequeo de unicidad de `rfc` (excluyendo el propio
      `id_empleado`) antes del `update`; responder 400 `PER_RFC_DUPLICADO` si
      choca
- [x] 2.4 Extender el objeto `data` del `prisma.empleado.update(...)` con el mismo
      patrón `...(campo !== undefined ? { campo } : {})` ya usado para los campos
      de jornada
- [x] 2.5 Correr los tests de 1.1–1.7 y confirmar que pasan en verde

## 3. Frontend — tests primero (TDD)

- [x] 3.1 Crear `PersonalView.editar-empleado.test.tsx` siguiendo el patrón de
      `PersonalView.nuevo-empleado.test.tsx`
- [x] 3.2 Test: clic en "Editar" sobre una fila abre el panel con los campos
      precargados con los datos actuales de ese empleado (test debe fallar hoy —
      el botón no existe)
- [x] 3.3 Test: intentar guardar con un campo obligatorio vacío muestra error y no
      llama al backend
- [x] 3.4 Test: edición exitosa llama a `PATCH /api/v1/personal/empleados/:id`,
      cierra el panel y refleja el cambio en la fila de la tabla sin recargar toda
      la lista
- [x] 3.5 Test: si el backend responde error (incluye caso `PER_RFC_DUPLICADO`),
      el panel permanece abierto con los datos ingresados y muestra el mensaje de
      error

## 4. Frontend — implementación

- [x] 4.1 Agregar estado `editarEmpleadoForm` (mismo shape que `nuevoEmpleadoForm`)
      y `editarEmpleadoPanel: { empleado: Empleado } | null` en `PersonalView.tsx`
- [x] 4.2 Agregar botón "Editar" en la fila de la tabla de Empleados, junto a
      "Jornada" y "Deducciones"
- [x] 4.3 Implementar `handleAbrirEditarEmpleado(empleado)` que precarga
      `editarEmpleadoForm` con los datos actuales y abre el panel
- [x] 4.4 Implementar `handleGuardarEdicionEmpleado()`: valida campos
      obligatorios en el frontend, llama al `PATCH`, en éxito actualiza el
      empleado en el array local (`setEmpleados` mapeando por `id_empleado`,
      mismo patrón que `handleSaveConfigJornada`) y cierra el panel; en error
      mantiene el panel abierto y muestra el mensaje
- [x] 4.5 Agregar el `SlidePanel` de edición reutilizando el layout de campos del
      panel "Nuevo Empleado" (mismos `FormField`/`Input`/`Select`)
- [x] 4.6 Correr los tests de 3.1–3.5 y confirmar que pasan en verde

## 5. Verificación end-to-end

- [x] 5.1 Levantar el entorno local (ver skill `run-app-shell`), iniciar sesión
      con un usuario `personal_rh` real
- [x] 5.2 En el navegador: editar un empleado existente (cambiar `puesto` y
      `telefono`), guardar, y confirmar que la fila de la tabla se actualiza sin
      recargar la página
- [x] 5.3 En el navegador: intentar editar el `rfc` de un empleado al RFC de otro
      empleado existente y confirmar que se muestra el error sin cerrar el panel
- [x] 5.4 Confirmar que "Jornada" y "Deducciones" siguen funcionando sin regresión
      (mismo endpoint PATCH que ahora tiene más campos)

## 6. Cierre

- [x] 6.1 Correr suite completa de tests de `personal` y `app-shell` en verde
- [x] 6.2 Commit con mensaje `feat(personal): edición de datos generales de
      empleado existente` (`5785053`)
- [x] 6.3 Deploy a VPS vía `git push origin main` → `deploy-vps-backend.yml` +
      `deploy-vps.yml` (ambos automatizados, no manual por SSH). `personal` y
      `app-shell` quedaron `healthy`; smoke test de Playwright contra
      producción en verde en ambos workflows. Verificado además por SSH:
      commit `5785053` desplegado, `PER_RFC_DUPLICADO` presente en el
      `main.js` compilado del contenedor, `PATCH /empleados/:id` responde 401
      sin auth (ruta viva). No se verificó con login real de un usuario
      `personal_rh` de producción — no se dispone de esas credenciales; la
      verificación de código+comportamiento vía SSH y smoke test se consideró
      suficiente para este cambio de bajo riesgo (sin migración de esquema).
- [x] 6.4 Archivar el change con `openspec archive editar-datos-empleado` tras
      verificación real
