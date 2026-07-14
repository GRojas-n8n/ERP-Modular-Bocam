## 1. Tests que reproducen la interacción esperada (deben fallar primero)

- [x] 1.1 Test de componente en `ComparativaDetail.evaluacion-inline-tabla.test.tsx`: un
      renglón sin especificaciones cotizado por 3 proveedores muestra, sin ningún clic
      previo, una sub-fila con 3 bloques de evaluación C/NC/DA/? alineados bajo la columna
      de cada proveedor — mismo criterio que ya cubría
      `ComparativaDetail.evaluacion-por-proveedor.test.tsx` para el modal, ahora contra la
      sub-fila siempre visible (no requiere abrir "Registrar Evaluación Técnica →").
- [x] 1.2 Test: guardar una línea sin "?" (todas C/NC/DA) llama a `PATCH
      /comparativas/:id/evaluar` solo con las evaluaciones de esa línea, sin tocar otras
      líneas no guardadas.
- [x] 1.3 Test: marcar "?" en un proveedor de cualquier línea oculta/deshabilita el botón
      de guardado individual de esa línea y muestra el botón agregado "Guardar y Crear
      Revisión" a nivel de tabla.
- [x] 1.4 Test: el botón agregado "Guardar y Crear Revisión" envía en una sola llamada a
      `POST /comparativas/:id/revision-con-preguntas` todas las evaluaciones pendientes
      (incluyendo los "?" de distintas líneas), no una llamada por línea.
- [x] 1.5 Confirmado: los 4 tests fallaron contra el código con modal antes de implementar
      (el test 1.1 falló por `getByTestId` inexistente; el resto dependía de él).

## 2. Frontend — sub-fila siempre visible

- [x] 2.1 Quitado el botón "Registrar Evaluación Técnica →" de la barra de acciones —
      sustituido por el botón agregado "Guardar y Crear Revisión" (solo visible con algún
      "?" pendiente).
- [x] 2.2 Renderizada, para cada línea sin especificaciones capturadas con datos por
      proveedor, una `<tr>` adicional justo debajo — mismo patrón que las sub-filas de
      especificaciones (`ComparativaDetail.tsx`): `<td>` vacías para columnas no
      aplicables, y una `<td>` por proveedor con su bloque C/NC/DA/? + comentario/pregunta,
      leyendo `linea.evaluacionesPorProveedor`.
- [x] 2.3 Reutilizado `evalForm`/`preguntasEval` (keyed por `` `${linea.id}:${provId}` ``)
      para el estado de la sub-fila — inicializados en un `useEffect` de montaje (`[]`),
      no en cada cambio de `comp.lineas`, para no perder ediciones sin guardar de otras
      líneas al guardar una.

## 3. Frontend — guardado mixto

- [x] 3.1 Botón "Guardar" (`handleGuardarLineaEvaluacion`) dentro de cada sub-fila: si
      ninguna decisión de esa línea es "?", llama `PATCH /comparativas/:id/evaluar` solo
      con las evaluaciones de esa línea.
- [x] 3.2 Si alguna decisión de esa línea es "?", el botón individual se oculta y se
      muestra "Se guardará con el resto de preguntas ↓".
- [x] 3.3 Botón agregado a nivel de tabla ("Guardar y Crear Revisión"), visible mientras
      exista al menos un "?" pendiente en cualquier línea sin specs — usa
      `handleGuardarEvaluacion` (ya existente, sin cambios de fondo) para enviar en una
      sola llamada `POST /comparativas/:id/revision-con-preguntas`.
- [x] 3.4 Verificados: los tests 1.2-1.4 pasan.

## 4. Frontend — retirar el modal

- [x] 4.1 Eliminado `showEvalPanel` y todo su bloque JSX.
- [x] 4.2 Reemplazado el `useEffect` de inicialización (antes disparado por
      `showEvalPanel`) por uno de montaje único (`useEffect(..., [])`).
- [x] 4.3 Actualizados/retirados los tests que dependían del modal: eliminado
      `ComparativaDetail.evaluacion-por-proveedor.test.tsx` (superseded por
      `evaluacion-inline-tabla.test.tsx`); reescritos `acceso-admin-evaluacion.test.tsx`,
      `acceso-residencia.test.tsx` y `evaluacion-especificacion.test.tsx` para verificar la
      sub-fila siempre visible en vez del botón/modal — cobertura de acceso por rol
      preservada (`showEvalTecnicaBtn` ahora gatea si la sub-fila es editable).

## 5. Verificación

- [x] 5.1 `npx tsc -b` en `apps/app-shell` sin errores.
- [x] 5.2 Suite completa `apps/app-shell` (`vitest run`): 25 archivos / 71 tests en verde,
      sin regresión (`firma-seleccion`, `acceso-residencia`, `evaluacion-especificacion`
      todos verdes).
- [x] 5.3 Verificación manual en navegador: evaluar un renglón con 3 proveedores sin "?"
      y guardar solo esa línea; luego marcar "?" en otro renglón y confirmar que el
      guardado agregado crea una sola revisión nueva, no una por línea.
      Verificado con Playwright real (residente@alfa.bocam.com) contra un
      CuadroComparativo real en EN_EVALUACION_TECNICA sembrado vía script
      Prisma de un solo uso (proyecto Alfa, 2 renglones: 3 y 2
      proveedores — script borrado tras usarlo, no comiteado). Línea 1: las
      3 evaluaciones 'C' se guardan con `eval-guardar-linea-{id}` (`PATCH
      /comparativas/:id/evaluar`) sin crear revisión ni tocar la línea 2.
      Línea 2: un "?" oculta su botón individual y muestra el aviso
      agregado; `eval-guardar-agregado` dispara una sola llamada `POST
      /comparativas/:id/revision-con-preguntas`. Confirmado contra el
      backend (`GET /comparativas`): se crea exactamente 1 cuadro con
      `revision_padre_id` apuntando al original (revisión B, estado
      BORRADOR) — no una revisión por cada "?" pendiente — y la línea 1
      conserva su evaluación 'C' en el cuadro original (el guardado
      individual no se pisó por el agregado). Confirmado también, por
      diseño: las evaluaciones se reinician a PENDIENTE en la revisión
      nueva (ya documentado en el modal "Crear nueva revisión" —
      comportamiento esperado, no bug).
      Hallazgo menor no relacionado, fuera de alcance: la tarjeta de
      "pendientes de evaluación" (`ComprasView.tsx`) muestra
      `cc.id.slice(0,8)` en vez de `cc.codigo` porque `normalizeComp` no
      propaga el campo `codigo` del backend al estado `pendientesEval`.

## 6. Cierre

- [x] 6.1 Sincronizar `openspec/specs/cotizacion-compras-ux/spec.md` con la spec delta de
      este change al archivar.
