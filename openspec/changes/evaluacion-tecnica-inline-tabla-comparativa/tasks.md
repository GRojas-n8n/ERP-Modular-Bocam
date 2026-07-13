## 1. Tests que reproducen la interacción esperada (deben fallar primero)

- [ ] 1.1 Test de componente en `ComparativaDetail.evaluacion-inline-tabla.test.tsx`: un
      renglón sin especificaciones muestra un botón "Evaluar ▾" en la columna de resumen
      (no requiere el botón "Registrar Evaluación Técnica →" / modal para evaluar).
- [ ] 1.2 Test: al hacer clic en "Evaluar ▾" de un renglón con 3 proveedores, se expande
      una `<tr>` con 3 bloques de evaluación C/NC/DA/? — mismo criterio que ya cubría
      `ComparativaDetail.evaluacion-por-proveedor.test.tsx` para el modal, ahora contra la
      sub-fila.
- [ ] 1.3 Test: guardar una línea sin "?" (todas C/NC/DA) llama a `PATCH
      /comparativas/:id/evaluar` solo con las evaluaciones de esa línea, sin tocar otras
      líneas no guardadas.
- [ ] 1.4 Test: marcar "?" en un proveedor de cualquier línea oculta/deshabilita el botón
      de guardado individual de esa línea y muestra el botón agregado "Guardar y Crear
      Revisión" a nivel de tabla.
- [ ] 1.5 Test: el botón agregado "Guardar y Crear Revisión" envía en una sola llamada a
      `POST /comparativas/:id/revision-con-preguntas` todas las evaluaciones pendientes
      (incluyendo los "?" de distintas líneas), no una llamada por línea.
- [ ] 1.6 Confirmar que los tests 1.1-1.5 fallan contra el código actual (con modal) antes
      de implementar.

## 2. Frontend — sub-fila expandible

- [ ] 2.1 Agregar estado de expansión por línea (ej. `Set<string>` de `linea.id`
      expandidas) en `ComparativaDetail.tsx`.
- [ ] 2.2 Reemplazar el botón "Registrar Evaluación Técnica →" (que abría el modal) por un
      botón "Evaluar ▾" / "▲" en la columna de resumen de cada renglón sin
      especificaciones, que alterna la expansión de esa línea.
- [ ] 2.3 Renderizar, para líneas sin specs expandidas, una `<tr>` adicional con `colSpan`
      sobre el ancho de la tabla — mismo patrón visual que ya usan las sub-filas de
      especificaciones (`ComparativaDetail.tsx:2089`) — con un bloque C/NC/DA/? +
      comentario/pregunta por proveedor de `linea.evaluacionesPorProveedor`.
- [ ] 2.4 Reutilizar `evalForm`/`preguntasEval` (ya keyed por `` `${linea.id}:${provId}` ``
      desde `fix-evaluacion-tecnica-por-proveedor`) para el estado de esta sub-fila — sin
      cambios en su forma.

## 3. Frontend — guardado mixto

- [ ] 3.1 Botón "Guardar" dentro de cada sub-fila: si ninguna decisión de esa línea es
      "?", llama `PATCH /comparativas/:id/evaluar` solo con las evaluaciones de esa línea.
- [ ] 3.2 Si alguna decisión de esa línea es "?", el botón de guardado individual de esa
      línea se oculta/deshabilita y se muestra el aviso "Se guardará con el resto de
      preguntas ↓" (igual mensaje que ya usa el modal actual).
- [ ] 3.3 Botón agregado a nivel de tabla ("Guardar y Crear Revisión"), visible mientras
      exista al menos un "?" pendiente en cualquier línea sin specs — recorre todas las
      líneas con datos en `evalForm` y llama una sola vez a
      `POST /comparativas/:id/revision-con-preguntas` con todas las evaluaciones
      (validaciones de comentario/pregunta obligatorios ya existentes se mantienen).
- [ ] 3.4 Verificar que los tests 1.3-1.5 pasan.

## 4. Frontend — retirar el modal

- [ ] 4.1 Eliminar `showEvalPanel` y todo su bloque JSX (el modal completo).
- [ ] 4.2 Eliminar el `useEffect` de inicialización del modal — su lógica de inicializar
      `evalForm`/`preguntasEval` desde `evaluacionesPorProveedor` se dispara ahora al
      expandir una sub-fila (o al montar el componente, ya que ahora conviven varias
      líneas evaluables sin flujo modal que las aísle).
- [ ] 4.3 Actualizar/retirar tests que dependían del modal
      (`ComparativaDetail.evaluacion-por-proveedor.test.tsx`,
      `ComparativaDetail.acceso-admin-evaluacion.test.tsx`) para que verifiquen la sub-fila
      en vez de "Registrar Evaluación Técnica →" — sin perder cobertura de acceso por rol
      (`showEvalTecnicaBtn` pasa a controlar la visibilidad del botón "Evaluar ▾").

## 5. Verificación

- [ ] 5.1 `npx tsc -b` en `apps/app-shell` (comando real del build de Docker) sin errores.
- [ ] 5.2 Suite completa `apps/app-shell` (`vitest run`) en verde, sin regresión — en
      particular `firma-seleccion`, `acceso-residencia`, `evaluacion-especificacion`
      (matriz, no debe verse afectada).
- [ ] 5.3 Verificación manual en navegador: evaluar un renglón con 3 proveedores sin "?"
      y guardar solo esa línea; luego marcar "?" en otro renglón y confirmar que el
      guardado agregado crea una sola revisión nueva, no una por línea.

## 6. Cierre

- [ ] 6.1 Sincronizar `openspec/specs/cotizacion-compras-ux/spec.md` con la spec delta de
      este change al archivar.
