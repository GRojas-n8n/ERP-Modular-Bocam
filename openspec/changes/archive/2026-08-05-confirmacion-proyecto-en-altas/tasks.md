## 1. ui-core — hacer el diálogo no descartable por accidente

- [x] 1.1 Escribir test de `ConfirmCriticalActionDialog` que verifique que, con
      `dismissible={false}`, un clic en el overlay y la tecla Escape NO cierran el diálogo ni
      llaman a `onCancel`
- [x] 1.2 Agregar el prop opcional `dismissible?: boolean` (default `true`) a
      `ConfirmCriticalActionDialogProps` (`packages/ui-core/src/primitives.tsx:349-429`); con
      `false`, ignorar el `onClick` del overlay y el listener de Escape
- [x] 1.3 Verificar que los tests existentes de las 6 acciones críticas (sin pasar `dismissible`)
      siguen pasando sin cambios de comportamiento

## 2. Compras — alta de Requisición

- [x] 2.1 Escribir test que reproduzca el estado actual (el POST de `handleSubmitRequisicion` se
      dispara sin confirmación) y falle hasta que exista el diálogo (TDD: test primero)
- [x] 2.2 Envolver `handleSubmitRequisicion` (`ComprasView.tsx:863-881`) para abrir
      `ConfirmCriticalActionDialog` (`variant='default'`, `dismissible={false}`) con el proyecto
      activo antes de llamar `api.post`; el POST solo se ejecuta al confirmar
- [x] 2.3 N/A — no existe alta manual de Orden de Compra en Compras; las OC se generan
      automáticamente al firmar un Cuadro Comparativo (`ciclo-vida-oc`), no hay formulario que
      cubrir aquí. Corregido en proposal.md y specs/ tras descubrirlo en implementación.
- [x] 2.4 Agregar `subtitle` con el nombre del proyecto activo al `SlidePanel` de alta de
      Requisición

## 3. Personal — alta de Empleado

- [x] 3.1 Escribir test que reproduzca el estado actual de `handleGuardarNuevoEmpleado`
      (`PersonalView.tsx:482-495`) sin confirmación
- [x] 3.2 Envolver `handleGuardarNuevoEmpleado` con `ConfirmCriticalActionDialog`
      (`dismissible={false}`) antes del `api.post` de alta
- [x] 3.3 Agregar `subtitle` con el proyecto activo al `SlidePanel` de alta de Empleado
      (`PersonalView.tsx:1944-1949`)

## 4. Almacén — alta de Activo

- [x] 4.1 Escribir test que reproduzca el estado actual de `handleCrearActivo`
      (`AlmacenView.tsx:242-261`, nombre real distinto al asumido en el diseño) sin confirmación
- [x] 4.2 Envolver `handleCrearActivo` con `ConfirmCriticalActionDialog` (`dismissible={false}`)
      antes del `api.post` de alta (no aplica a edición de activo existente — Almacén no tiene
      edición de activos, solo alta/baja/traspaso)
- [x] 4.3 Agregar `subtitle` con el proyecto activo al `SlidePanel` de alta de Activo
      (`AlmacenView.tsx:826`)

## 5. Control de Obra / Residencia — Avance Físico y Estimación

- [x] 5.1 Escribir test que reproduzca el estado actual de `handleCrearEstimacion`
      (`ResidenciaView.tsx:825-830`, `:879`) y del registro de avance físico sin confirmación
- [x] 5.2 Envolver ambos handlers con `ConfirmCriticalActionDialog` (`dismissible={false}`) antes
      de su `api.post` correspondiente
- [x] 5.3 Agregar `subtitle` con el proyecto activo al `SlidePanel` de "Registrar Avance"
      (`ResidenciaView.tsx:2059-2064`). "Crear Estimación" no usa `SlidePanel` — es un botón sobre
      la selección de avances en la tabla, sin panel de alta que llevar subtítulo.

## 6. Verificación cruzada y cierre

- [x] 6.1 Barrer el resto de vistas de app-shell en busca de otros handlers de alta con el mismo
      patrón (`handleGuardar*`/`handleCrear*` → `api.post` directo sin confirmación) no listados
      arriba, y aplicarles el mismo tratamiento si corresponde. Ampliado (con aprobación explícita
      del usuario) a los 9 handlers encontrados en el primer barrido:
      - `AdminView.tsx` — `handleCrearCategoria` (categoría de gasto): cubierto.
      - `CalidadView.tsx` — `handleCrearDocumento`: cubierto (diálogo + subtítulo), pero **sin
        test de integración completo** — el formulario nunca expone un input para
        `responsable_id`, campo que la propia validación exige; el botón nunca pasa la
        validación en la UI real. Bug preexistente ajeno a este change, documentado en el test,
        fuera de alcance (sin spec de bug-fix).
      - `CalidadView.tsx` — `handleCrearVersion`: cubierto (diálogo + subtítulo + test).
      - `CalidadView.tsx` — `handleCrearNC` (crear NC desde hallazgo de auditoría): cubierto
        (diálogo + test); es una acción de un clic sin formulario, no lleva subtítulo de panel.
      - `FinanzasView.tsx` — `handleGuardarPresupuesto`: cubierto (diálogo + subtítulo + test).
      - `FinanzasView.tsx` — `handleGuardarPagoOC`: cubierto (diálogo + test); el modal de
        registrar pago es un modal ad-hoc, no `SlidePanel`, sin subtítulo que agregar.
      - `PersonalView.tsx` — `handleGuardarEditarEmpleado`: **excluido deliberadamente** — es una
        edición de un empleado existente, no un alta; el requirement de spec excluye ediciones
        explícitamente.
      - `PersonalView.tsx` — `handleGuardarNuevaCuadrilla`: cubierto (diálogo + subtítulo + test).
      - `PersonalView.tsx` — `handleCrearAsignacionFrente`: cubierto (diálogo + test).
      - `PersonalView.tsx` — `handleGuardarPeriodicidad`: **excluido deliberadamente** — es un
        `PUT` de configuración de nómina del proyecto, no una alta de registro.
      - `ResidenciaView.tsx` — `handleRegistrarManual` (toggle presente/ausente por empleado):
        **excluido deliberadamente** — acción de un clic, de alta frecuencia (decenas de veces
        por día por cuadrilla), con actualización optimista de UI; agregar confirmación
        contradice el requirement de "no fricción en flujos de alta frecuencia" de `design.md`.
      - `ResidenciaView.tsx` — `handleGuardarBulk` (guardar asistencia manual masiva de una
        cuadrilla): cubierto (diálogo + test) — es una sola confirmación por envío del grupo
        completo, no por empleado.

      Hallazgos adicionales fuera de alcance de este change (no cubiertos, quedan para un change
      de seguimiento si se decide ampliar más): `CalidadView.tsx` tiene además `handleAddHallazgo`
      y dos formularios de alta con handler genérico `handleCreate` ("Nueva No Conformidad" y
      "Nueva Auditoría Interna") que no se detectaron en el patrón de nombres original. Un barrido
      más amplio con patrones `handle(Add|Submit|Solicitar|Iniciar|Abrir|Emitir|Programar)` en
      `apps/app-shell/src/views` encontró ~15 handlers adicionales (`ComprasView.handleSubmitInsumo`,
      `handleSubmitSolicitud`, `handleSubmitAsignacion`; `ControlObraView.handleSubmitBitacora`,
      `handleSubmitAvance`; `AlmacenView.handleSolicitarTraspaso`; `InsumosView.handleAbrirTakeoff`;
      etc.) sin clasificar uno por uno (alta vs. no-alta) — no evaluados en este change.
- [x] 6.2 Confirmar que ninguna ruta de edición/actualización (no alta) quedó envuelta por error
      con el diálogo de confirmación — verificado: `handleGuardarEditarEmpleado` (PATCH) y
      `handleGuardarPeriodicidad` (PUT) permanecen sin cambios, sin diálogo.
- [x] 6.3 Correr la suite de tests de `app-shell` completa y verificar que las 6 acciones críticas
      existentes (`confirmacion-accion-critica-proyecto`) siguen pasando sin cambios. Resultado:
      236/237 tests pasan; la única falla (`InsumosView.catalogo-scroll.test.tsx`) es un flake
      preexistente y no relacionado (pasa aislado, `InsumosView.tsx` no fue tocado por este change)
- [x] 6.4 Ejecutar `/run-app-shell` y verificar manualmente en el navegador al menos un flujo de
      alta, confirmando que el clic afuera y Escape no cierran el diálogo, y que solo
      "Confirmar"/"Cancelar" lo resuelven. **Parcial**: se verificó en Chromium real (vía
      Playwright, no jsdom) que el panel "Nuevo Empleado" muestra el subtítulo con el proyecto
      activo y que al hacer clic en "Guardar empleado" se abre el diálogo con el texto "Proyecto
      activo: Planta de Tratamiento Guadalajara Norte" y "¿Crear este empleado?" (screenshots
      09-form-lleno / 10-dialogo-abierto). El flujo de Requisición en Compras no se pudo probar
      porque el proyecto seed no tiene presupuesto activo (bloquea la selección de partida,
      hallazgo de datos de entorno, no del código). La verificación específica de "clic en overlay
      no cierra" / "Escape no cierra" / confirmar-crea-el-registro en navegador real quedó
      bloqueada por un rate limiter de `apps/auth` (429 `RATE_LIMIT_EXCEEDED`, ventana de 15 min
      que no se liberó dentro de la sesión tras varios intentos de login del driver). Esa parte del
      comportamiento SÍ está cubierta por tests automatizados que disparan los eventos DOM reales
      (`fireEvent.click` en el overlay, `fireEvent.keyDown` con Escape) contra el árbol de React
      real vía React Testing Library — ver `ConfirmCriticalActionDialog.test.tsx` (tests de
      `dismissible`) y los tests `*.confirmacion-crear-*.test.tsx` por módulo.
