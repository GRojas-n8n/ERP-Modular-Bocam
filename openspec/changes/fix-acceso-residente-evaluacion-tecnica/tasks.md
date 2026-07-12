## 1. Test que reproduce el bug (primero, debe fallar en rojo)

- [x] 1.1 Crear `apps/app-shell/src/components/ComparativaDetail.acceso-residencia.test.tsx`,
      siguiendo el patrón de `ComparativaDetail.firma-seleccion.test.tsx`
      (mock de `TenantContext`, `buildComparativa` con `estado:
      'EN_EVALUACION_TECNICA'`), pero con `user.role = ['residencia']`
      (no `['resident']`) y `modo="residente"` (no `"compras"`) — la
      combinación real de un Residente de Bocam, que ningún test actual
      cubre. Incluye ya el primer test (botón "Registrar Evaluación
      Técnica" + textarea de veredicto deben estar presentes). Confirmado
      en rojo contra el código actual: `Unable to find an accessible
      element with the role "button" and name /Registrar Evaluación
      Técnica/i` — reproduce el bug tal cual.
- [x] 1.2 Test: con ese setup, renderizar el cuadro y confirmar que el
      botón "Registrar Evaluación Técnica →" / el textarea de veredicto
      (placeholder `/Describe tu evaluación general/i`) SÍ está presente
      en el documento. Confirmar que este test falla contra el código
      actual (bug reproducido) antes de tocar `ComparativaDetail.tsx`.
      Implementado como parte del mismo test de la tarea 1.1.
- [x] 1.3 Test: en el mismo setup, completar veredicto + selección de 1ª
      opción de proveedor + todos los renglones evaluados, y confirmar
      que el botón "🔒 Firmar y Bloquear →" aparece y que al hacer clic el
      estado pasa a `FIRMADO_BLOQUEADO`. Confirmar que también falla
      contra el código actual. Confirmado en rojo: falla en
      `screen.getByPlaceholderText(/Describe tu evaluación general/i)` —
      la sección de veredicto ni siquiera se renderiza para `residencia`
      en modo `residente` (cubre a la vez el bug de rol y el de
      `!isResidenteMode`).
- [x] 1.4 Test: con `user.role = []` (sin `residencia`/`resident`/
      `control_obra`/`admin`/`superintendent`), confirmar que ni el botón
      de evaluación ni la sección de veredicto aparecen — caso negativo,
      no debe fallar (ya funciona hoy, sirve de guarda de regresión).
      Confirmado: pasa en verde sin tocar el código (comportamiento
      correcto ya existente).

## 2. Fix

- [x] 2.1 En `apps/app-shell/src/components/ComparativaDetail.tsx` línea
      776, agregar `'residencia'` al arreglo de `isResident`:
      `roles.some(r => ['resident', 'residencia', 'control_obra'].includes(r))`.
- [x] 2.2 En la misma archivo, línea 2313, quitar la condición
      `&& !isResidenteMode` de la sección "Veredicto del Residente" —
      queda gateada solo por `comp.estado === 'EN_EVALUACION_TECNICA' &&
      (isResident || roles.includes('admin'))`, igual que `showFirmaBtn`
      (línea 795) que ya no depende del modo.
- [x] 2.3 Ejecutar los tests de la tarea 1 y confirmar que ahora pasan en
      verde. Confirmado: `ComparativaDetail.acceso-residencia.test.tsx` —
      3/3 tests en verde tras el fix.

## 3. Verificación de regresión

- [x] 3.1 Ejecutar toda la suite de `ComparativaDetail.*.test.tsx`
      (incluye `firma-seleccion` y `evaluacion-especificacion`) y
      confirmar 0 regresiones — en particular que el caso `modo="compras"`
      + `role: ['resident']` sigue mostrando la sección de veredicto y el
      botón de firma exactamente igual que antes. Confirmado: 7/7 tests
      en verde (3 archivos).
- [x] 3.2 Ejecutar `tsc -b` / type-check de `app-shell` limpio. Confirmado:
      sin errores.
- [x] 3.3 Ejecutar la suite completa de vitest de `app-shell` (no solo los
      archivos de Comparativa) para descartar efectos colaterales en otros
      componentes que también leen `roles`/`isResident`-like patterns.
      Confirmado: 32/32 tests en verde (10 archivos).

## 4. Verificación manual en navegador (producción, con usuario real)

- [ ] 4.1 Con el usuario real `residente@bocam.com.mx` (o
      `residenteelectrico@bocam.com.mx`), abrir un cuadro comparativo que
      ya esté en estado `EN_EVALUACION_TECNICA` desde `ComprasView → tab
      "Eval. Técnica"`, confirmar que aparece "Registrar Evaluación
      Técnica →", llenar la matriz C/NC/DA/?, el veredicto, seleccionar
      1ª opción de proveedor y firmar/bloquear con éxito.
      **PENDIENTE — sin herramienta de navegador/browser automation
      disponible en este entorno para verificación interactiva. Evidencia
      disponible en su lugar: 3/3 tests de
      `ComparativaDetail.acceso-residencia.test.tsx` renderizan el
      escenario exacto (role=['residencia'], modo="residente") vía React
      Testing Library + jsdom y confirman botón, veredicto y firma. Queda
      a cargo del usuario confirmar en producción real tras el deploy.**

## 5. Cierre

- [x] 5.1 Confirmado: `apps/compras/src/main.ts` ya incluye `'residencia'`
      en `requireRoles(...)` de todos los endpoints de evaluación
      (líneas 469, 568, 944, 2255, 3108, 3266, 3402, 3839) — sin cambios
      ni redeploy de backend necesarios. El fix es 100% frontend.
- [x] 5.2 PR abierto contra `main` desde branch
      `fix/acceso-residente-evaluacion-tecnica`.
