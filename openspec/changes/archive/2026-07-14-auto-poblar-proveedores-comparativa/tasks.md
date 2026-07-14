## 1. Reproducir el bug con un test que falle

- [x] 1.1 Test en `apps/app-shell/src/lib/comparativa-proveedores.test.ts`: dado un cuadro
      con `proveedoresActuales = []` (recién cargado desde backend, sin precios capturados
      aún) y `proveedoresInvitados` con 2 proveedores de la Solicitud de Cotización,
      `mergeProveedoresConSolicitud` (aún no existe) devuelve esos 2 proveedores — reproduce
      en forma de test unitario el síntoma reportado ("Continuar comparativa" muestra la
      lista vacía).
- [x] 1.2 Confirmar que el test 1.1 falla contra el código actual (la función no existe
      todavía) antes de implementar, dejando constancia del bug reproducido.

## 2. Función pura de merge (`comparativa-proveedores.ts`)

- [x] 2.1 Implementar `mergeProveedoresConSolicitud(proveedoresActuales, proveedoresInvitados, maxProveedores = MAX_PROVEEDORES_COMPARATIVO)`
      en `apps/app-shell/src/lib/comparativa-proveedores.ts`: conserva todos los
      `proveedoresActuales` (no se descartan aunque no estén en la Solicitud — cubre
      proveedores agregados manualmente del catálogo), agrega los invitados que falten por
      `id` en orden hasta llegar a `maxProveedores`, sin duplicar.
- [x] 2.2 Reescribir `seedProveedoresDesdeSolicitud` como wrapper delgado de
      `mergeProveedoresConSolicitud([], proveedoresInvitados, maxProveedores)`, preservando
      su firma y comportamiento actuales (no debe romper los 4 tests existentes en
      `comparativa-proveedores.test.ts`).
- [x] 2.3 Test: `proveedoresActuales` con 1 proveedor que no está en `proveedoresInvitados`
      (agregado manualmente del catálogo) se conserva íntegro en el resultado.
- [x] 2.4 Test: `proveedoresActuales` con 1 proveedor + 2 `proveedoresInvitados` nuevos → el
      resultado tiene los 3, sin duplicar el que ya estaba.
- [x] 2.5 Test: `proveedoresActuales` ya tiene 3 proveedores (tope alcanzado) → los
      `proveedoresInvitados` adicionales no se agregan, el resultado sigue teniendo 3.
- [x] 2.6 Test: un proveedor presente tanto en `proveedoresActuales` como en
      `proveedoresInvitados` (mismo `id`) no se duplica.
- [x] 2.7 Verificar que los tests 1.1, 2.3-2.6 y los 4 tests preexistentes pasan.

## 3. Cablear el merge en ambas ramas de `openComparativa`

- [x] 3.1 En la rama `existing` de `openComparativa` (`ComprasView.tsx:887-896`), además de
      repoblar `lineas` si están vacías, obtener la solicitud (`solicitudesMap[req.id] ??
      await loadSolicitud(req.id)`) y aplicar `mergeProveedoresConSolicitud(existing.proveedores,
      solicitud.proveedores, MAX)` sobre `proveedores`, actualizando ambos campos en el mismo
      `setComparativas`.
- [x] 3.2 Si `loadSolicitud` no encuentra Solicitud de Cotización (`null`) o lanza error, la
      apertura del cuadro NO se bloquea — se usa `existing.proveedores` sin cambios (ver
      design.md D3). `loadSolicitud` ya captura errores internamente y devuelve `null`.
- [x] 3.3 Actualizar la rama `!existing` (creación) para usar el mismo
      `mergeProveedoresConSolicitud([], ...)` a través del wrapper de la tarea 2.2, sin
      cambiar su comportamiento observable. (Ya cubierto: `seedProveedoresDesdeSolicitud`
      delega en `mergeProveedoresConSolicitud` desde la tarea 2.2, sin tocar la rama de
      creación.)
- [x] 3.4 Verificar con `tsc --noEmit` en `apps/app-shell` que no hay errores de tipos tras
      los cambios en `openComparativa`.

## 4. Verificación de integración y manual

- [x] 4.1 Test de integración/componente (si existe infraestructura para montar
      `ComprasView` o probar `openComparativa` de forma aislada): reabrir un cuadro ya
      creado con proveedores invitados en la Solicitud de Cotización muestra esos
      proveedores sin intervención manual. Implementado en
      `apps/app-shell/src/views/ComprasView.reabrir-comparativa.test.tsx` (sí existía
      infraestructura — mismo patrón que `ComprasView.ordenes-compra.test.tsx`).
- [x] 4.2 Verificación manual en navegador (Playwright, infraestructura ya instalada en
      `apps/app-shell` desde el roadmap de mejoras 2026-07-12): login como `procurement` o
      `admin` → requisición con Solicitud de Cotización enviada y al menos un proveedor
      marcado `RESPONDIO` → clic en "Iniciar comparativa" → cerrar/recargar la página →
      volver a la misma requisición → clic en "Continuar comparativa" → confirmar que los
      proveedores invitados aparecen sin tener que agregarlos a mano. **Este paso es
      obligatorio** — el change previo (`2026-07-10-unificar-pdf-cotizacion-comparativa`) se
      dio por completo sin esta verificación y esa fue la causa de que la regresión pasara
      desapercibida.
      Verificado con Playwright real (`comprador@alfa.bocam.com`) contra una
      Requisicion + SolicitudCotizacion reales sembradas vía script Prisma de
      un solo uso (2 proveedores invitados, 1 `RESPONDIO`) — script y test
      borrados tras usarlos, no comiteados. Clic en "Crear Cuadro
      Comparativo" (label actual del botón de creación, la tarea usaba el
      nombre anterior "Iniciar comparativa") → los 2 proveedores invitados
      aparecen sin agregarlos a mano. `page.reload()` (recarga real, sesión
      persistida vía localStorage) → clic en "Continuar comparativa" → los
      2 proveedores siguen ahí. Sin regresión.
- [x] 4.3 Suite completa de `apps/app-shell` (`vitest run` + `tsc --noEmit`) en verde antes
      de abrir el PR. 15/15 archivos, 45/45 tests, `tsc --noEmit` sin errores.

## 5. Cierre

- [x] 5.1 Sincronizar `openspec/specs/cotizacion-compras-ux/spec.md` con la spec delta de
      este change al archivar (requirement "El cuadro comparativo SHALL prepoblarse con los
      proveedores ya invitados" actualizado con los escenarios de reapertura).
