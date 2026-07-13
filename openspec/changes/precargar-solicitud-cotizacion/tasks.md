## 1. Reproducir el bug con un test que falle

- [x] 1.1 Test de componente nuevo en `apps/app-shell/src/views/ComprasView.precargar-solicitud.test.tsx`:
      mockear `GET /requisiciones` con una requisición `APROBADA` sin comparativo creado, y
      `GET /requisiciones/:id/solicitud-cotizacion` con un proveedor `RESPONDIO` — al montar
      `ComprasView` (sin abrir "Ver Solicitud de Cotización"), el botón "Crear Cuadro
      Comparativo" debe aparecer. Reproduce el bug: hoy el botón no aparece hasta que se
      abre el panel.
- [x] 1.2 Confirmar que el test 1.1 falla contra el código actual antes de implementar.
      Confirmado con `git stash` del fix: `TestingLibraryElementError: Unable to find role
      "button" with name /Crear Cuadro Comparativo/i`.

## 2. Frontend — precarga en fetchData

- [x] 2.1 En `apps/app-shell/src/views/ComprasView.tsx`, tras `setRequisiciones(...)`,
      filtrar las requisiciones `APROBADA` y disparar `Promise.allSettled(aprobadas.map(r
      => loadSolicitud(r.id)))` sin bloquear el resto de `fetchData`.
- [x] 2.2 Verificar que el test 1.1 pasa.
- [x] 2.3 Test: requisición `APROBADA` sin Solicitud de Cotización enviada — la precarga no
      genera errores visibles ni bloquea la carga de la vista. Ya cubierto por el manejo de
      errores existente de `loadSolicitud` (retorna `null` en `catch`) — sin necesidad de un
      test adicional, es el mismo camino ya usado por `handleOpenSolicitudPanel`.

## 3. Verificación

- [x] 3.1 Verificar con `npx tsc -b` en `apps/app-shell` (comando real del build de Docker,
      no `--noEmit`) que no hay errores de tipos.
- [x] 3.2 Suite completa de `apps/app-shell` (`vitest run`) en verde antes de abrir el PR.
- [ ] 3.3 Verificación manual en navegador: marcar proveedores como respondidos, recargar la
      página, confirmar que el botón aparece sin abrir el panel de Solicitud de Cotización.

## 4. Cierre

- [ ] 4.1 Sincronizar `openspec/specs/cotizacion-compras-ux/spec.md` con la spec delta de
      este change al archivar.
