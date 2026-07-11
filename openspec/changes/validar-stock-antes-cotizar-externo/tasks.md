## 1. Backend — apps/almacen

- [x] 1.1 Implementar `GET /api/v1/almacen/stock?insumo_ids=<uuid,uuid,...>`
      en `apps/almacen/src/main.ts`: parsear `insumo_ids` (CSV), consultar
      `ItemInventario` filtrado por `tenant_id`+`proyecto_id` de la sesión
      y `insumo_id IN (...)`, responder
      `{ success: true, data: [{ insumo_id, stock_actual }] }`.
- [x] 1.2 Manejar lista vacía / parámetro ausente → `{ success: true, data: [] }`
      sin error.
- [x] 1.3 Test de integración: insumos con stock devuelven su
      `stock_actual`; insumos sin fila en `ItemInventario` no aparecen en
      la respuesta; lista vacía no lanza error.
      `apps/almacen/test/integration/stock-por-insumo.integration.test.ts`
      — 2/2 casos pasan. Requirió `prisma db push` local (BD sin migrar,
      no relacionado con este change). Se corrió también
      `almacen-api.integration.test.ts` (no tocado): 3/5 pasan, 2 fallos
      preexistentes confirmados con `git stash` (no relacionados).

## 2. Backend — apps/compras

- [x] 2.1 Agregar `ALMACEN_URL` (env var, mismo patrón que `GT_URL`,
      `apps/compras/src/main.ts:37`) y una función
      `consultarStockAlmacen(insumoIds, ctx)` que haga
      `axios.get(`${ALMACEN_URL}/stock?insumo_ids=...`)` con los mismos
      headers/timeout/`.catch(() => [])` fail-soft que la llamada
      existente a GT (línea 119-122).
      Se usó `buildForwardHeaders(req)` (packages/observability) en vez del
      patrón manual de headers de la llamada a GT — es el helper más
      moderno, ya usado en 10+ lugares de este mismo archivo.
- [x] 2.2 En `GET /api/v1/compras/requisiciones/:reqId/solicitud-cotizacion`
      (línea 843, la que se llama al abrir el panel), incluir en la
      respuesta el detalle de stock por insumo no imprevisto de la
      requisición (usando 2.1), calculado sobre los `insumo_id` reales de
      `RequisicionItem` de esa requisición.
      **Desviación del plan original**: ese endpoint devuelve 404 cuando
      NO existe todavía una solicitud de cotización — que es el caso más
      común al abrir el panel por primera vez. Meter la advertencia ahí la
      habría dejado invisible justo en el caso que más importa. Se creó un
      endpoint dedicado `GET .../requisiciones/:reqId/stock-almacen` en su
      lugar, consultado en paralelo desde el frontend al abrir el panel —
      cubre el mismo requirement del spec ("al abrir el panel"), sin tocar
      el contrato 404 existente del que depende `loadSolicitud` en el
      frontend.
- [x] 2.3 Excluir explícitamente los `RequisicionItem` con
      `es_imprevisto = true` de la lista de `insumo_id` consultados.
- [x] 2.4 Test de integración: requisición con insumos catalogados +
      imprevistos → la consulta a Almacén solo incluye los `insumo_id` de
      los catalogados; requisición solo con imprevistos → no se llama a
      Almacén.
- [x] 2.5 Test de integración: mock de `ALMACEN_URL` fallando (timeout o
      error) → el endpoint de apertura del panel sigue respondiendo 200
      sin el detalle de stock (degradación fail-soft), sin romper el resto
      de la respuesta.
      `apps/compras/test/integration/stock-almacen-antes-cotizar.integration.test.ts`
      — 3/3 casos pasan (2.4, 2.4b, 2.5). `ALMACEN_URL` se lee como const
      al importar el módulo (mismo patrón que `GT_URL`/`FINANZAS_URL`), así
      que el escenario de fallo (2.5) se simuló con el stub de Almacén
      respondiendo 500, no con una URL distinta. Se corrió también
      `orden-compra-enviar-correo.integration.test.ts` (no tocado): 5/5
      pasan, sin regresiones.

## 3. Docker / infraestructura

- [x] 3.1 Agregar `ALMACEN_URL: http://almacen:3012/api/v1/almacen` al
      bloque `environment` de `compras` en `docker-compose.vps.yml`,
      mismo patrón que `GT_URL` (línea 219).

## 4. Frontend — apps/app-shell

- [x] 4.1 En `ComprasView.tsx`, extender el estado que carga al abrir el
      panel (`handleOpenSolicitudPanel`, línea 871) para incluir el
      detalle de stock devuelto por 2.2.
      Se agregó `stockAdvertencia`/`stockConfirmado` como estado nuevo y
      una llamada a `GET .../stock-almacen` (el endpoint dedicado de 2.2)
      dentro de `handleOpenSolicitudPanel`, con `.catch` fail-soft.
- [x] 4.2 Si hay insumos con `stock_actual > 0`, renderizar una sección de
      advertencia en el panel (lista de insumo + cantidad solicitada +
      stock disponible) antes de la sección de botón de envío
      (línea ~2986-2998).
      Los nombres de insumo se resuelven contra el catálogo `insumos` (GT)
      ya cargado en el componente, mismo patrón que `buildLineasFromReq`
      (línea 807) — el endpoint de stock solo devuelve `insumo_id`, no
      descripciones.
- [x] 4.3 Reemplazar el botón "Enviar Solicitud" por un flujo de 2 pasos
      cuando hay advertencia: botón/checkbox "Entiendo, enviar de todos
      modos" que habilita el botón de envío real — sin componente modal
      nuevo, todo dentro del mismo panel (ver Decisión 4 de design.md).
- [x] 4.4 Sin insumos con stock, el panel se comporta exactamente igual
      que hoy (sin pasos ni renders nuevos) — verificar manualmente que no
      hay regresión visual/de flujo en el caso común.
      Verificado por lógica: con `stockAdvertencia = []`, la condición de
      la advertencia (`!!stockAdvertencia?.length`) es falsa y el botón de
      envío usa la misma condición que antes de este change. `tsc --noEmit`
      limpio en `apps/app-shell`.
- [ ] 4.5 Verificación manual en navegador: abrir el panel de una
      requisición con al menos un insumo con stock en Almacén, confirmar
      que aparece la advertencia con los datos correctos, confirmar
      "Enviar de todos modos" y verificar que la solicitud se envía
      normalmente (mismos correos, misma persistencia que antes de este
      change).
      **No completada** — este entorno no tiene herramienta de
      automatización de navegador (Playwright/chromium) disponible, así
      que no se pudo hacer clic real en la UI. El contrato completo
      backend↔frontend quedó verificado con tests de integración reales
      (Grupos 1-2) y el frontend compila limpio contra ese contrato exacto,
      pero falta esta verificación visual — pendiente de que el usuario la
      haga en su navegador antes de dar el change por completamente cerrado.
