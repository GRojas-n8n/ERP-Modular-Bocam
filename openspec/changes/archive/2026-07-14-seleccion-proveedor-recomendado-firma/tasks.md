## 1. Backend — validación de la segunda opción

- [x] 1.1 Test: `PUT .../seleccion` con `segunda_opcion_proveedor_id` ajeno
      al cuadro → 400, no persiste.
- [x] 1.2 Test: `PUT .../seleccion` con `segunda_opcion_proveedor_id` igual
      a `primera_opcion_proveedor_id` → 400, no persiste.
- [x] 1.3 Test: `PUT .../seleccion` sin `segunda_opcion_proveedor_id` sigue
      guardando `null` sin exigirla (no regresión).
- [x] 1.4 Implementar ambas validaciones en `PUT .../seleccion`.
- [x] 1.5 Test: `POST .../firmar` con `segunda_opcion_proveedor_id` que tiene
      un renglón `NC` → 400 `SEGUNDA_OPCION_INVALIDA_NC`, no firma.
- [x] 1.6 Test: `POST .../firmar` con `segunda_opcion_proveedor_id` que tiene
      un renglón `?` → mismo 400.
- [x] 1.7 Test: `POST .../firmar` sin `segunda_opcion_proveedor_id` → sin
      cambios de comportamiento (no regresión).
- [x] 1.8 Implementar la validación en `POST .../firmar`, espejo de la que
      ya existe para la primera opción.

## 2. Frontend — reposición y gate del botón de firma

- [x] 2.1 Mover los dos `<select>` de 1ª/2ª opción al inicio del bloque
      "Veredicto del Residente", antes del textarea de veredicto. Eliminada
      la sección separada anterior.
- [x] 2.2 Conservado el botón "Guardar selección" como acción independiente
      dentro del bloque fusionado (sigue llamando a `PUT .../seleccion`,
      no se fusiona con `handleGuardarVeredicto`).
- [x] 2.3 Agregado `!!comp.primera_opcion_proveedor_id` a `veredictoListo`.
- [x] 2.4 Test (RTL): veredicto y sugeridos completos pero sin selección
      guardada → el botón de firma no se renderiza (`showFirmaBtn` es un
      show/hide, no un `disabled`).
- [x] 2.5 Test (RTL): selección + veredicto + sugeridos + todos los
      renglones evaluados → el botón de firma se renderiza.

## 3. Verificación

- [x] 3.1 Ejecutar todos los tests nuevos y confirmar que pasan; `tsc --noEmit`
      limpio en `apps/compras` y `apps/app-shell`. 20/20 unit + 21/21
      integración (5 archivos, incluye los de los 2 changes previos de esta
      sesión) + 25/25 vitest, sin ninguna regresión.
- [x] 3.2 Confirmado que el flujo de firma existente (sin segunda opción) no
      tiene regresión — probado explícitamente en 1.7.
- [x] 3.3 Verificación manual: guardar 1ª y 2ª opción, verificar que el
      botón de firma se habilita solo cuando corresponde, firmar y confirmar
      bloqueo. **PENDIENTE** — requiere backend completo levantado; no hay
      navegador automatizado disponible en este entorno.
      Verificado con Playwright real (`residente@alfa.bocam.com`) contra
      un CuadroComparativo real en EN_EVALUACION_TECNICA con 2 proveedores
      ya evaluados 'C' (script Prisma de un solo uso, borrado tras
      usarlo). Confirmado: el botón "Firmar y Bloquear →" NO existe sin
      selección+veredicto; tras "Guardar selección" (1ª y 2ª opción) y
      "Guardar veredicto" (con proveedor sugerido), el botón aparece;
      clic → modal → checkbox de confirmación → `POST .../firmar`
      responde 200 (bloqueo real, no simulado).
