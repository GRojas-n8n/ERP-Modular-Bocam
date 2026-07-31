## 1. Tests que reproducen el bug (van primero, deben fallar en rojo)

- [x] 1.1 Test de integración backend (`apps/personal/test/integration/`): `imprimir-lote` con `empleado_ids` de un empleado NO asignado al proyecto activo responde con `excluidos` conteniendo ese id y `credenciales` vacío (test debe fallar contra el código actual, que hoy devuelve solo un array plano sin `excluidos`).
- [x] 1.2 Test de integración backend: `imprimir-lote` con una mezcla de un empleado elegible y uno no elegible responde `credenciales` solo con el elegible y `excluidos` con el no elegible.
- [x] 1.3 Test de frontend (`apps/app-shell/src/views/PersonalView.*.test.tsx`): `handleImprimirSeleccionados`, cuando el backend responde `credenciales: []`, NO invoca `window.open` y dispara un `notify({type:'error', ...})`.
- [x] 1.4 Test de frontend: cuando el backend responde `excluidos` no vacío junto con `credenciales` no vacío, sí invoca `window.open` y además dispara un `notify()` informando cuántos quedaron excluidos.

## 2. Fix backend

- [x] 2.1 En `apps/personal/src/main.ts` (~línea 1870), calcular `excluidos` = `idsSolicitados originales (antes de filtrar por elegibilidad) que no están en elegiblesDelProyecto`, usando el `empleado_ids` crudo del body (no solo el ya filtrado).
- [x] 2.2 Cambiar la forma de la respuesta a `{ credenciales: [...], excluidos: string[] }` (mantener el nombre `credenciales` para el array ya existente, agregar `excluidos`).

## 3. Fix frontend

- [x] 3.1 En `PersonalView.tsx` (`handleImprimirSeleccionados`), leer `{ credenciales, excluidos }` de la respuesta en vez de un array plano.
- [x] 3.2 Si `credenciales.length === 0`: no llamar `window.open`, mostrar `notify({type:'error', title:'Ningún empleado seleccionado pertenece al proyecto activo'})` y retornar.
- [x] 3.3 Si `excluidos.length > 0` y `credenciales.length > 0`: abrir la hoja igual con los elegibles y además `notify({type:'info' o 'error', title: \`${excluidos.length} empleado(s) excluido(s) por no pertenecer al proyecto activo\`})`.

## 4. Verificación

- [x] 4.1 Correr los tests de integración de `apps/personal` nuevos (1.1, 1.2) en verde contra Postgres real.
- [x] 4.2 Correr los tests de frontend nuevos (1.3, 1.4) en verde.
- [x] 4.3 Correr `tsc -b` de `app-shell` y `tsc --noEmit` de `personal` limpios.
- [x] 4.4 QA manual en navegador local: seleccionar un empleado no elegible del proyecto activo y confirmar que aparece el `notify` de error en vez de una hoja en blanco. Confirmado con Playwright real (2026-07-29): al seleccionar a "Juan Qa Pérez Qa" (sin asignación de proyecto) y click "Imprimir credenciales", apareció el texto "proyecto activo" del notify y NO se generaron errores nuevos de consola; no se disparó ninguna descarga/ventana de impresión en blanco.

## 5. Cierre

- [x] 5.1 Commit directo en `main` (`be43572`, 2026-07-30), sin branch/PR
      intermedio — mismo patrón que `fix-rbac-endpoints-personal-sin-rol`.
- [x] 5.2 Verificar en producción y archivar. **Resultado:** el commit
      `be43572` ya estaba incluido en el deploy exitoso de `personal`
      del 2026-07-31T02:43 (build desde HEAD de `main`, que ya lo
      contenía). Confirmado 2026-07-31 dentro del contenedor real
      (`bocam-vps-personal`, tras el rebuild de la tarea de verificación
      del RBAC fix) que `dist/apps/personal/src/main.js` línea ~1902
      calcula `excluidos` y lo devuelve junto con `credenciales`.
