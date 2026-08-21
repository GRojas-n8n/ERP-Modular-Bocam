## 1. Backend: extender el agregador

- [x] 1.1 Agregar `PERSONAL_URL` en `apps/control-proyectos/src/main.ts`
      (mismo patrón que `COMPRAS_URL`, línea 55).
- [x] 1.2 En `GET /dashboard/residente`, agregar una llamada B2B a
      `GET ${PERSONAL_URL}/prenominas` dentro del mismo
      `Promise.allSettled` que ya llama a Compras, propagando el header
      `Authorization` y `timeout: 3000`.
- [x] 1.3 Agregar una segunda llamada B2B a
      `GET ${PERSONAL_URL}/complementos` en el mismo `Promise.allSettled`.
- [x] 1.4 Calcular `prenominas_pendientes` filtrando la respuesta por
      `estado === 'CALCULADA' && !revisado_por_residencia` (mismo
      criterio que `kpiNomina.pendientesRevision` en
      `ResidenciaView.tsx:763`).
- [x] 1.5 Calcular `complementos_pendientes` filtrando por
      `!revisado_por_residencia`.
- [x] 1.6 Si cualquiera de las 4 llamadas B2B (Compras ×2, personal ×2)
      falla, `parcial` debe quedar en `true` — reusa la variable
      `parcial` existente, no crea una nueva por servicio.
- [x] 1.7 Incluye `prenominas_pendientes`/`complementos_pendientes` en el
      objeto de respuesta (`null` si la llamada correspondiente falló).

## 2. Frontend: carga perezosa de nómina

- [x] 2.1 Quitadas `api.get('/api/v1/personal/prenominas')` y
      `api.get('/api/v1/personal/complementos')` del `useEffect` de
      montaje.
- [x] 2.2 Nuevo `useEffect` gateado por `activeTab === 'nomina'`
      (calcado del de `equipo`) que dispara esas dos llamadas y puebla
      `prenominas`/`complementos` cuando el usuario abre la pestaña, con
      su propio `loadingNomina`.
- [x] 2.3 Panel de KPIs superior actualizado con 2 tiles nuevos
      (Prenóminas/Complementos pendientes) que leen
      `dashData.prenominas_pendientes`/`complementos_pendientes` del
      agregador — ya no dependen de las listas completas.
- [x] 2.4 Tipo de `dashData` ajustado con `prenominas_pendientes: number
      | null` y `complementos_pendientes: number | null`.
- [x] 2.5 Verificado por lectura: `kpiNomina` (dentro de la pestaña
      Nómina) sigue derivándose de `prenominas`/`complementos` (las
      listas completas, ahora cargadas lazy) — no se tocó esa lógica.

## 3. Specs

- [x] 3.1 Reescribir `openspec/specs/endpoint-dashboard-residentes/spec.md`
      (vía delta MODIFIED) para reflejar la ruta/archivo reales y los
      campos nuevos.
- [x] 3.2 Reescribir `openspec/specs/dashboard-entrada-residentes/spec.md`
      (vía delta MODIFIED) para reflejar el archivo real y el
      comportamiento lazy de Nómina.

## 4. Tests

- [x] 4.1 Test E2E en `apps/control-proyectos`
      (`test/e2e/dashboard-residente-nomina.e2e.test.ts`, stubs Express
      para Compras y personal): `personal` responde correctamente →
      `prenominas_pendientes`/`complementos_pendientes` reflejan el
      conteo esperado, `parcial: false`.
- [x] 4.2 Mismo archivo: `personal` no responde (stub devuelve 500) →
      `prenominas_pendientes`/`complementos_pendientes` en `null`,
      `parcial: true`, el resto de la respuesta no se ve afectado.
- [x] 4.3 Mismo archivo: Compras falla pero `personal` responde →
      `parcial: true` igual, y los campos de nómina sí traen datos
      (confirma que basta que falle una sola llamada B2B). Los 3 casos
      corridos contra Postgres real local, y `test:e2e:reconciliacion` +
      `test:integration` + `test:e2e:seguridad` re-corridos sin
      regresión.
- [x] 4.4 Test de frontend (`ResidenciaView.dashboard-lazy-nomina.test.tsx`):
      al montar la vista, NO se hace ninguna llamada a
      `/api/v1/personal/*`; al activar la pestaña Nómina, sí se hacen
      exactamente esas dos llamadas.

## 5. Verificación manual

- [x] 5.2 Con `personal` y `compras` apagados (solo `auth` +
      `control-proyectos` arriba): cargado Residencia en el navegador
      (Playwright headless vía skill `run-app-shell`, login como
      `residente@alfa.bocam.com`) — la vista no se bloquea, Estimaciones
      se ve bien (1 estimación pendiente), y los tiles de Prenóminas/
      Complementos muestran "—" (sin datos) mientras OCs por Recibir
      muestra "— datos parciales". Sin errores de consola nuevos más
      allá de los 500 esperados de los servicios apagados.
- [x] 5.3 Confirmado por conteo de errores 500 en consola: al cargar la
      vista (pestaña Estimaciones, por defecto) no aumentan las
      llamadas a `personal`; al hacer click en "Nómina Cuadrilla" sí
      aparecen 2 nuevos 500 (las llamadas a
      `personal/prenominas`/`personal/complementos`, que antes del
      cambio se disparaban en el montaje). La pestaña Nómina renderiza
      sin crashear ("Sin complementos salariales en este periodo.").
- [x] 5.1 Con `auth` + `control-proyectos` + `personal` arriba (Compras
      seguía apagado): el tile "Prenóminas" pasó de "—" a "1" (real, vía
      B2B) y "Complementos" a "0"; al abrir la pestaña Nómina, la lista
      completa muestra la misma prenómina (`NOM-2026-S01`, "1 sin
      revisar") — consistente con el tile del agregador. "OCs por
      Recibir" siguió en "— datos parciales" porque Compras seguía
      apagado, confirmando que cada servicio degrada
      independientemente.
