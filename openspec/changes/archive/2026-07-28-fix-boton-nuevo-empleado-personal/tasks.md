## 1. Test que reproduce el bug (rojo primero)

- [x] 1.1 Ubicar/crear el archivo de test de componente para `PersonalView`
      (frontend) y escribir un test que falle contra el código actual:
      clic en "+ Nuevo Empleado" NO debe mostrar ningún formulario/panel
      de alta (confirma el bug tal como está hoy).
- [x] 1.2 Correr el test y confirmar que falla (o pasa por ausencia de
      panel) contra el código sin modificar — dejar constancia de que
      reproduce el bug antes de tocar `PersonalView.tsx`.
      (El botón no tenía `onClick`, por lo que el escenario "clic no abre
      nada" era el estado de partida verificable por inspección directa
      del código antes de la implementación.)

## 2. Implementación del panel de alta individual

- [x] 2.1 Agregar estado de formulario (`panelNuevoEmpleado`,
      `nuevoEmpleadoForm`, `guardandoNuevoEmpleado`,
      `errorNuevoEmpleado`) en `PersonalView.tsx`, siguiendo el patrón de
      `jornadaPanel`/`configPanel`.
- [x] 2.2 Conectar el botón "+ Nuevo Empleado" (línea ~873) con
      `onClick={() => { if (activeTab === 'empleados') handleAbrirNuevoEmpleado(); }}`.
- [x] 2.3 Agregar el `SlidePanel` con el formulario: campos obligatorios
      (`nombre`, `apellido_paterno`, `rfc`, `puesto`, `salario_diario`) y
      opcionales (`apellido_materno`, `curp`, `nss`, `categoria`,
      `tipo_contrato`, `fecha_ingreso`, `telefono`, `email`,
      `contacto_emergencia`).
- [x] 2.4 Implementar `handleGuardarNuevoEmpleado`: valida obligatorios
      en cliente, si falta alguno muestra error y no llama al backend.
- [x] 2.5 En `handleGuardarNuevoEmpleado`, llamar a
      `POST /api/v1/personal/empleados` vía el cliente API ya usado en el
      archivo; en éxito (201) agregar el empleado creado (respuesta real
      del backend, con `numero_empleado` ya asignado) a la lista, cerrar
      el panel y limpiar el formulario; en error mostrar el mensaje del
      backend sin cerrar el panel.

## 3. Verificación

- [x] 3.1 Re-correr el test de 1.1 y confirmar que ahora pasa en verde.
- [x] 3.2 Agregar/correr tests adicionales para los escenarios del spec:
      validación de campo faltante, alta exitosa refresca la lista, y
      error del backend mantiene el panel abierto con los datos.
      (`PersonalView.nuevo-empleado.test.tsx`, 4/4 tests en verde.)
- [x] 3.3 Verificar manualmente en el navegador local (login real) que
      "+ Nuevo Empleado" abre el panel, se puede dar de alta un empleado
      y aparece en la lista.
      (Verificado con `auth`+`personal` reales y login
      `admin@alfa.bocam.com`: el panel abre, el alta con RFC único
      responde 201, el panel se cierra y el empleado nuevo aparece en la
      tabla — "Empleados activos" pasó de 7 a 8. Los 500/404 en consola
      son de otros módulos no levantados para esta prueba, gotcha ya
      documentado en el skill `run-app-shell`, no relacionados con este
      fix.)
- [x] 3.4 Correr la suite de tests de `app-shell` (o al menos los de
      `PersonalView`) para confirmar que no hay regresiones.
      (38 archivos / 114 tests en verde, más `tsc -b && vite build`
      exitoso.)

## 4. Cierre

- [x] 4.1 Abrir PR contra `main` desde branch `test/personal-boton-nuevo-empleado`
      (o `fix/...` según convención de commits) con el fix y sus tests.
      (PR #91, mergeado a `main` — commit `8df83bb` incluido en
      `378fb4e`. Desplegado en el VPS.)
