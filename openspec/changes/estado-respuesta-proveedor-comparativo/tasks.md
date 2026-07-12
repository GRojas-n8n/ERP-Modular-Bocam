## 1. Backend — exponer el estado de respuesta en GET /comparativas/:id

- [x] 1.1 Escribir test de integración (Jest + Supertest, sobre Postgres
      aislado en Docker) en `apps/compras`: dado un comparativo cuya
      requisición tiene una `SolicitudCotizacion` con 3
      `SolicitudCotizacionProveedor` (`RESPONDIO`, `DECLINO`, `PENDIENTE`),
      `GET /api/v1/compras/comparativas/:id` responde con
      `estado_respuesta_proveedor` como mapa `proveedor_id -> { estado,
      fecha_respuesta }` con los 3 estados correctos. Test debe fallar en
      rojo contra el código actual (el campo no existe en la respuesta).
      Hecho: `test/integration/estado-respuesta-proveedor-comparativo.integration.test.ts`.
- [x] 1.2 Test: un proveedor del comparativo que NO tiene
      `SolicitudCotizacionProveedor` asociado (agregado manualmente desde
      catálogo) no aparece en `estado_respuesta_proveedor` (sin entrada,
      no `null` ni `"PENDIENTE"` por default).
- [x] 1.3 Test: una requisición sin ninguna `SolicitudCotizacion` (cuadro
      armado 100% manual) responde con `estado_respuesta_proveedor: {}`,
      sin error 500.
- [x] 1.4 Implementar en `apps/compras/src/main.ts`, handler `GET
      /api/v1/compras/comparativas/:id` (~línea 2228+): tras resolver
      `cuadro`, consultar `prisma.solicitudCotizacion.findUnique({ where:
      { tenant_id_requisicion_id: { tenant_id: tenantId, requisicion_id:
      cuadro.requisicion_id } }, include: { proveedores: { select:
      { proveedor_id: true, estado: true, fecha_respuesta: true } } } })`
      en paralelo con las demás consultas dependientes de `cuadro` (mismo
      patrón que `ordenesRaw`, línea 2314-2321). Construir el mapa
      `estado_respuesta_proveedor` y adjuntarlo a la respuesta junto a
      `archivos_proveedor` (línea 2365).
- [x] 1.5 Ejecutar los tests de 1.1-1.3 y confirmar que pasan en verde.
      3/3 ok.

## 2. Frontend — mostrar el badge en el chip de proveedor

- [x] 2.1 Escribir test de componente (Vitest + Testing Library) en
      `apps/app-shell/src/components/ComparativaDetail.estado-respuesta.test.tsx`:
      dado un `comp` con `estado_respuesta_proveedor` incluyendo un
      proveedor `RESPONDIO`, el chip correspondiente muestra el badge
      "Respondió". Debe fallar en rojo (campo no existe en
      `ProveedorComp`/el chip no lo renderiza).
- [x] 2.2 Test: proveedor `DECLINO` → badge "Declinó"; proveedor
      `PENDIENTE` → badge "Pendiente".
- [x] 2.3 Test: proveedor sin entrada en `estado_respuesta_proveedor` →
      no se renderiza ningún badge de estado (verificar ausencia, no solo
      que no truene).
- [x] 2.4 Agregar `estado_respuesta?: 'PENDIENTE' | 'RESPONDIO' |
      'DECLINO'` y `fecha_respuesta?: string | null` a la interfaz
      `ProveedorComp` (`ComparativaDetail.tsx:79-82`).
- [x] 2.5 Mapear `estado_respuesta_proveedor` (nuevo campo de la
      respuesta del backend) a esos campos de `ProveedorComp` al
      construir/actualizar `comp.proveedores` (donde hoy se procesa la
      respuesta de `GET /comparativas/:id`).
- [x] 2.6 Agregar el badge visual junto al nombre en el chip (líneas
      ~1646-1682), reutilizando el patrón de colores de los badges C/NC/DA
      ya existentes en el archivo (verde/rojo/gris).
- [x] 2.7 Ejecutar los tests de 2.1-2.3 y confirmar que pasan en verde.
      3/3 ok.

## 3. Verificación de regresión

- [x] 3.1 Ejecutar toda la suite de `ComparativaDetail.*.test.tsx` y
      confirmar 0 regresiones. 7/7 ok (rama sin el commit de
      `fix-acceso-residente-evaluacion-tecnica`, aún no mergeado a main).
- [x] 3.2 Ejecutar `tsc -b` limpio en `app-shell`. Limpio, sin errores.
- [x] 3.3 Ejecutar la suite completa de Jest de `apps/compras` y confirmar
      0 regresiones. 17 archivos de integración, todos ok (incluye
      `req-imprevisto-aprobar`: 6 passed via su propio runner).
- [x] 3.4 Ejecutar la suite completa de vitest de `app-shell`. 32/32 ok,
      10/10 archivos.

## 4. Verificación manual en navegador (producción, con usuario real)

- [ ] 4.1 Con el usuario `procuracion@bocam.com.mx`: marcar un proveedor
      como "Respondió" y otro como "Declinó" en el panel de Solicitud de
      Cotización de una requisición real; abrir el Cuadro Comparativo de
      esa misma requisición y confirmar que los badges correctos aparecen
      junto a cada proveedor, y que un proveedor agregado manualmente
      (si aplica) no muestra ningún badge.
      **PENDIENTE — requiere backend completo levantado con datos reales;
      no hay navegador automatizado disponible en este entorno. Evidencia
      sustituta: 3/3 tests de `ComparativaDetail.estado-respuesta.test.tsx`
      cubren exactamente estos 3 escenarios vía React Testing Library +
      jsdom. Queda a cargo del usuario confirmar en producción real tras
      el deploy.**

## 5. Cierre

- [ ] 5.1 Redeploy manual del contenedor `compras` en el VPS (backend no
      tiene CI/CD) tras mergear a `main`.
- [ ] 5.2 Abrir PR contra `main` desde branch
      `feat/estado-respuesta-proveedor-comparativo`.
