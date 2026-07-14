## 1. Reproducir el bug con un test que falle

- [x] 1.1 Test de componente nuevo en `ComprasView.reset-al-cambiar-proyecto.test.tsx`:
      montar `ComprasView` con `currentProjectId` inicial, abrir el detalle de un cuadro
      (`activeReqId` queda seteado), re-renderizar con un `currentProjectId` distinto —
      la vista debe volver a mostrar la lista de requisiciones, no quedarse en el detalle
      stale. Reproduce el bug (hoy `activeReqId` no se limpia).
- [x] 1.2 Confirmar que el test 1.1 falla contra el código actual antes de implementar.
      Confirmado: se queda sin renderizar ni la lista ("Sin requisiciones activas") ni el
      detalle correctamente — pantalla atorada, igual que el síntoma real reportado.

## 2. Frontend

- [x] 2.1 Agregar `useEffect(() => { setActiveReqId(null); setComparativaModo('compras'); }, [currentProjectId])`
      en `ComprasView.tsx`, junto a los demás efectos atados a `currentProjectId`.
- [x] 2.2 Verificar que el test 1.1 pasa.

## 3. Verificación

- [x] 3.1 Verificar con `npx tsc -b` en `apps/app-shell` (comando real del build de Docker)
      que no hay errores de tipos. Limpio.
- [x] 3.2 Suite completa de `apps/app-shell` (`vitest run`) en verde: 24/24 archivos, 67/67
      tests, sin regresión (un fallo aislado en `InsumosView.catalogo-scroll.test.tsx` en
      la primera corrida resultó flaky/timing — pasó solo y en una segunda corrida completa).
- [x] 3.3 Verificación manual en navegador: con un usuario con acceso a 2+ proyectos, abrir
      un cuadro comparativo, cambiar de proyecto activo, confirmar que regresa a la lista
      de requisiciones del proyecto nuevo sin pantalla en blanco ni datos mezclados.
      Verificado con Playwright real (`admin@alfa.bocam.com`, acceso a 3
      proyectos) contra una Requisicion + CuadroComparativo reales
      sembrados vía script Prisma de un solo uso (script y test borrados
      tras usarlos). Con el detalle del cuadro abierto ("Tabla de
      Cotizaciones" visible), cambio de proyecto activo vía el selector del
      header a "Puente Vehicular Monterrey Sur" → la vista regresa
      correctamente a la lista de Requisiciones del proyecto nuevo (botón
      "Nueva Requisicion" visible, detalle stale ya no presente). Sin
      pantalla en blanco.

## 4. Cierre

- [x] 4.1 Sincronizar `openspec/specs/navegacion-multi-proyecto-compras/spec.md` (nuevo) al
      archivar.
