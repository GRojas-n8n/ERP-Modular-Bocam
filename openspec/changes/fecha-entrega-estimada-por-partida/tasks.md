## 1. Backend — schema y migración

- [x] 1.1 En `apps/compras/prisma/schema.prisma`, renombrar/retipar
      `ComparativaDetalle.tiempo_entrega` (`String? @db.VarChar(50)`) a
      `fecha_entrega_estimada` (`DateTime?`).
- [x] 1.2 Generar la migración con `prisma migrate dev --name
      fecha_entrega_estimada_por_partida` contra la base de desarrollo
      local, siguiendo la convención existente en
      `apps/compras/prisma/migrations/`.
      Hecho: `prisma migrate dev` falló por un problema preexistente de
      shadow database (drift ajeno a este change — la BD local se
      mantiene vía `db push`, no vía historial de migraciones formal); se
      escribió la migración a mano siguiendo el formato exacto de las
      migraciones existentes del directorio y se aplicó con `prisma db
      execute` + `prisma migrate resolve --applied`.

## 2. Backend — endpoints

- [x] 2.1 Escribir test de integración en `apps/compras`: `PUT
      /api/v1/compras/comparativas/:id/cotizaciones` con
      `fecha_entrega_estimada` en el payload persiste la fecha en
      `ComparativaDetalle`, asociada a la línea/proveedor correcta. Test
      debe fallar en rojo contra el código actual (el campo no existe /
      se llama `tiempo_entrega` y espera texto).
      Hecho: `test/integration/fecha-entrega-estimada-por-partida.integration.test.ts`.
- [x] 2.2 Test: guardar una cotización sin `fecha_entrega_estimada` en
      alguna línea persiste el precio igual, sin error, con la fecha en
      `null`.
- [x] 2.3 Test: `POST .../revision-con-preguntas` clona
      `fecha_entrega_estimada` de `ComparativaDetalle` original al cuadro
      de la nueva revisión.
      **Hallazgo fuera de alcance**: `POST .../nueva-revision` (línea
      ~5053) está roto de forma preexistente — llama a
      `prisma.$transaction([...])` dentro de un cliente ya
      transaction-scoped (el que entrega `createTenantContext`), lo cual
      Prisma no soporta ("prisma.$transaction is not a function"). Ningún
      test existente lo ejercitaba antes de este change. Se usó
      `revision-con-preguntas` (que no tiene este bug) para probar el
      clonado en su lugar; el bug de `nueva-revision` se reporta aparte,
      no se corrige aquí (fuera del alcance de este spec).
- [x] 2.4 Implementar en `apps/compras/src/main.ts`: `PUT
      .../cotizaciones` (~línea 2966) acepta `fecha_entrega_estimada`
      (ISO date string) en vez de `tiempo_entrega`, la parsea a `Date` y
      la persiste en `ComparativaDetalle.create`.
- [x] 2.5 Actualizar los dos handlers de clonación de revisión (~línea
      5111 `nueva-revision`, ~línea 5462 `revision-con-preguntas`) para
      copiar `fecha_entrega_estimada` en vez de `tiempo_entrega`.
- [x] 2.6 Actualizar `apps/compras/prisma/seed.ts` (2 usos) para usar el
      campo nuevo con un valor `Date` en vez de texto libre.
- [x] 2.7 Actualizar `apps/compras/test/e2e/reconciliacion.e2e.test.ts`
      (1 uso) al campo nuevo.
- [x] 2.8 Ejecutar los tests de 2.1-2.3 y confirmar que pasan en verde.
      3/3 ok.

## 3. Frontend — captura en la Tabla de Cotizaciones

- [x] 3.1 Escribir test de componente en
      `apps/app-shell/src/components/ComparativaDetail.fecha-entrega.test.tsx`:
      en modo Compras, cada celda de proveedor+línea muestra un input de
      fecha; capturar un valor y guardar cotizaciones incluye
      `fecha_entrega_estimada` en el payload de `PUT .../cotizaciones`.
      Debe fallar en rojo (el input no existe hoy).
- [x] 3.2 Test: el input de fecha está deshabilitado cuando el cuadro
      está bloqueado (`locked`), igual que el input de precio en la misma
      celda.
- [x] 3.3 Renombrar `CotizacionLinea.tiempos` a `fechasEntrega` en
      `ComparativaDetail.tsx` (interfaz + inicialización en
      `handleAddLinea`).
- [x] 3.4 Agregar `handleUpdateFechaEntrega(lineaId, provId, value)`,
      espejo de `handleUpdatePrecio` (~línea 913).
- [x] 3.5 Reemplazar el texto de solo lectura `linea.tiempos?.[prov.id]
      ?? '—'` (~línea 1850) por un `<input type="date">` editable cuando
      `modo === 'compras'` y `!locked`, usando `handleUpdateFechaEntrega`.
- [x] 3.6 Incluir `fecha_entrega_estimada: l.fechasEntrega[prov.id] ||
      undefined` en `proveedoresPayload` (~línea 986-992) al guardar
      cotizaciones.
- [x] 3.7 Actualizar `ComprasView.tsx` (~línea 487, ~línea 821): mapear
      `d.fecha_entrega_estimada` en vez de `d.tiempo_entrega` al
      normalizar `comp.lineas` desde la respuesta del backend.
- [x] 3.8 Ejecutar los tests de 3.1-3.2 y confirmar que pasan en verde.
      2/2 ok.

## 4. Verificación de regresión

- [x] 4.1 Ejecutar toda la suite de `ComparativaDetail.*.test.tsx` y
      confirmar 0 regresiones. 6/6 ok.
- [x] 4.2 Ejecutar `tsc -b` limpio en `app-shell`. Limpio.
- [x] 4.3 Ejecutar la suite completa de tests de integración de
      `apps/compras` y confirmar 0 regresiones. 17 archivos, todos ok.
      `tsc --noEmit -p apps/compras/tsconfig.json` también limpio.
- [x] 4.4 Ejecutar la suite completa de vitest de `app-shell`. 31/31 ok,
      10/10 archivos.

## 5. Verificación manual en navegador (producción, con usuario real)

- [ ] 5.1 Con el usuario `procuracion@bocam.com.mx`: capturar precios y
      fechas de entrega para 2+ proveedores en un cuadro comparativo real,
      guardar, recargar la página y confirmar que las fechas persisten
      correctamente por línea/proveedor.
      **PENDIENTE — requiere backend completo levantado con datos reales;
      no hay navegador automatizado disponible en este entorno.**

## 6. Cierre

- [ ] 6.1 `prisma migrate deploy` + redeploy manual del contenedor
      `compras` en el VPS tras mergear a `main`.
- [ ] 6.2 Abrir PR contra `main` desde branch
      `feat/fecha-entrega-estimada-por-partida`.
