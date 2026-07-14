## 1. Test que fija el comportamiento esperado (primero, en rojo)

- [x] 1.1 Test de integración en
      `apps/compras/test/integration/especificacion-ofrecida-proveedor.integration.test.ts`
      (patrón `startHttpApp` + Prisma real, ver `fecha-entrega-estimada-por-partida.integration.test.ts`):
      seed de requisición aprobada + cuadro comparativo `BORRADOR` con 2 proveedores;
      `PUT /comparativas/:id/cotizaciones` con `especificacion_ofrecida` distinto por
      proveedor en el mismo renglón → verificar en BD que `ComparativaDetalle.valor_ofrecido_spec`
      quedó correcto y SEPARADO por `proveedor_id` (no colapsado); un segundo caso sin el
      campo → `valor_ofrecido_spec` queda `null`, sin error. Correr contra el código
      actual y confirmar que FALLA (el campo no se persiste hoy).

## 2. Backend

- [x] 2.1 `apps/compras/src/main.ts`, `PUT /comparativas/:id/cotizaciones` (~línea 3151):
      aceptar `especificacion_ofrecida?: string` por item de `precios[]` y persistirlo en
      `valor_ofrecido_spec` al crear el `ComparativaDetalle` (trim; `null` si vacío/ausente).

## 3. Frontend — tipos y estado

- [x] 3.1 `apps/app-shell/src/components/ComparativaDetail.tsx`: en la interfaz
      `CotizacionLinea`, agregar `especOfrecida: Record<string, string>` (mismo patrón que
      `precios`/`fechasEntrega`); eliminar el campo roto `valor_ofrecido_spec?: string`
      (nunca poblado, string único incorrecto).
- [x] 3.2 `apps/app-shell/src/views/ComprasView.tsx`, función `normalizeComp` (~línea
      559-605, con 3 call sites: `comparativas`, `pendientesEval`, `pendientesGT`):
      inicializar `especOfrecida: {}` en el objeto de línea nueva, y en el loop
      `detalles.forEach` asignar `linea.especOfrecida[d.proveedor_id] = d.valor_ofrecido_spec ?? ''`.
      → También se agregó `especOfrecida: {}` en los otros 2 constructores de línea
      encontrados (`buildLineasFromReq` en ComprasView.tsx y `handleAddLinea` en
      ComparativaDetail.tsx), no previstos originalmente en la tarea pero necesarios para
      que el tipo `CotizacionLinea` compile en los 3 lugares donde se construye.

## 4. Frontend — captura (Compras)

- [x] 4.1 `ComparativaDetail.tsx`: agregar `handleUpdateEspecOfrecida(lineaId, provId, value)`
      (mismo patrón que `handleUpdateFechaEntrega`, ~línea 1078).
- [x] 4.2 En la celda de Compras (~línea 2232-2260, junto a los inputs de precio y fecha de
      entrega): agregar un `<input type="text">` (o `<textarea>` corta) para
      `especOfrecida[prov.id]`, con el mismo patrón de `locked`/`readOnly` que los otros dos
      campos de esa celda.

## 5. Frontend — envío

- [x] 5.1 `handleEnviarEvaluacion` (~línea 1131-1174): agregar `especificacion_ofrecida:
      l.especOfrecida?.[prov.id]?.trim() || undefined` a cada item de `precios` en
      `proveedoresPayload`.

## 6. Frontend — visualización Residente

- [x] 6.1 Celda modo Residente (~línea 2263-2273): reemplazar la lectura de
      `linea.valor_ofrecido_spec` (string único) por `linea.especOfrecida?.[prov.id]`,
      manteniendo el mismo estilo visual (`—` cuando está vacío).

## 7. Verificación

- [x] 7.1 Test de 1.1 en verde contra el código corregido (sin modificar el test).
- [x] 7.2 `tsc -b` en `apps/app-shell` limpio.
- [x] 7.3 Test Playwright E2E en `apps/app-shell/test/e2e/`: Compras arma un cuadro con 2
      proveedores, captura especificación ofrecida distinta para cada uno en el mismo
      renglón, envía a evaluación técnica; login como Residente y verificar que ambos
      valores se ven correctamente separados por proveedor en la tabla de evaluación.
      → Verde 2026-07-14. Hallazgo durante la escritura: el flujo manual "Agregar
      proveedor" (búsqueda en catálogo) muta `comp.estado` a `EN_PROCESO` en el estado
      local del frontend, lo que esconde el botón "Enviar a Evaluación Técnica →"
      (`showEnviarEvalBtn` exige `estado === 'BORRADOR'`) — bug preexistente, sin relación
      con este change (no se toca `handleAddProveedorFromCatalog`). El seed del test evita
      ese camino sembrando `ComparativaDetalle` placeholder por proveedor directamente
      (mismo resultado que en producción cuando los proveedores llegan fusionados desde
      una Solicitud de Cotización respondida). Documentado como hallazgo, no corregido en
      este change — candidato a spec de bug-fix aparte si se confirma que ocurre también
      con el flujo real de "Agregar proveedor" manual en producción.
- [x] 7.4 Verificación visual manual en entorno local del flujo completo (Compras captura
      → Residente ve y evalúa).
      → Cubierta por el E2E de 7.3 (recorre el flujo completo en navegador real).

## 8. Cierre

- [x] 8.1 PR contra main (branch `feat/`), CI verde, merge.
      → PR #67 mergeado (squash `4f88e2c`).
- [x] 8.2 Redeploy manual de `compras` y `app-shell` en VPS (compose build + up -d, sin
      migración de BD) y smoke 200.
      → Hecho 2026-07-14: ambos contenedores recreados 17:50-17:51 UTC, healthy;
      https://iretum.com y /api/v1/compras/health → 200.
