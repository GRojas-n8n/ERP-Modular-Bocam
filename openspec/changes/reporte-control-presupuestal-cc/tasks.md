## 1. Finanzas — Schema y migración

- [x] 1.1 Agregar `concepto_id String? @db.Uuid` y `concepto_clave String? @db.VarChar(100)` a `DetallePagoOC` en `apps/finanzas/prisma/schema.prisma`
- [x] 1.2 Ejecutar `npx prisma migrate dev --name add-concepto-to-detalle-pago` en finanzas para generar el archivo de migración
- [x] 1.3 Actualizar `POST /api/v1/finanzas/pagos` en `apps/finanzas/src/main.ts` para aceptar y persistir `concepto_id`/`concepto_clave` opcionales en cada detalle

## 2. Finanzas — Endpoint B2B pagado-por-concepto

- [x] 2.1 Agregar middleware de validación del header `X-Internal-Service` en `apps/finanzas/src/main.ts`
- [x] 2.2 Implementar `GET /api/v1/finanzas/reportes/pagado-por-concepto?proyectoId=<uuid>` que agrupa `SUM(monto_aplicado)` por `concepto_id` (incluyendo `null`) — acceso solo con header interno

## 3. Compras — Endpoint B2B ocs-por-concepto

- [x] 3.1 Agregar validación del header `X-Internal-Service: gerencia-tecnica` en ruta de reportes en `apps/compras/src/main.ts`
- [x] 3.2 Implementar `GET /api/v1/compras/reportes/ocs-por-concepto?proyectoId=<uuid>` que hace JOIN `ordenes_compra → requisiciones` y agrega `SUM(total)` por `concepto_id` de la req, para estados `EMITIDA`, `PARCIALMENTE_RECIBIDA`, `RECIBIDA`

## 4. GT — Endpoint principal de reporte

- [x] 4.1 Implementar función `buildControlPresupuestal(proyectoId, tenantId, categoria?)` en `apps/gerencia-tecnica/src/` que:
  - Obtiene `PresupuestoBase` activo (estado IN [APROBADO, LIBERADO, CONGELADO]) y sus `Conceptos` + `ConceptoInsumos`
  - Llama en paralelo (`Promise.all`) a Compras B2B y Finanzas B2B con timeout de 5s
  - Calcula `categoria_predominante` por concepto desde sus `ConceptoInsumos`
  - Agrega `comprometido`, `pagado`, `disponible`, `pct_ejercido` por concepto
  - Retorna estructura completa con flag `parcial`
- [x] 4.2 Registrar `GET /api/v1/gerencia-tecnica/reportes/control-presupuestal` que llama a `buildControlPresupuestal` con los query params del request
- [x] 4.3 Registrar `POST /api/v1/gerencia-tecnica/reportes/control-presupuestal/export` que obtiene los datos via `buildControlPresupuestal` y llama B2B a Reportes (puerto 3010) para generar PDF/XLSX

## 5. Reportes — Handler de exportación

- [x] 5.1 Implementar handler `POST /api/v1/reportes/control-presupuestal/export` en `apps/reportes/src/` que acepta `{ formato: "PDF"|"XLSX", datos: { ... } }` y retorna el buffer del archivo
- [x] 5.2 Template PDF: encabezado con nombre del proyecto + CC, tabla de partidas con columnas Clave/Descripción/Categoría/Presupuestado/Comprometido/Pagado/Disponible/% Ejercido, totales al pie
- [x] 5.3 Template XLSX: misma estructura en hoja "Control Presupuestal" con formato de moneda en las columnas numéricas

## 6. Frontend — GT: Tab Control Presupuestal

- [x] 6.1 Agregar tab `"control-presupuestal"` al tipo `TabId` y al array de tabs en `GerenciaTecnicaView.tsx`
- [x] 6.2 Implementar componente `<TabControlPresupuestal />` (o inline en la vista) con la tabla de partidas, barra de progreso por fila y badge "En riesgo"
- [x] 6.3 Agregar selector de filtro por categoría (TODAS/MATERIAL/MANO_DE_OBRA/EQUIPO/SUBCONTRATO/INDIRECTO)
- [x] 6.4 Agregar fila "[Sin partida]" al final cuando el reporte incluye montos sin `concepto_id`
- [x] 6.5 Agregar banner de advertencia cuando `parcial: true`
- [x] 6.6 Implementar botones "Exportar PDF" y "Exportar Excel" que llaman a `POST /api/v1/gerencia-tecnica/reportes/control-presupuestal/export` y descargan el archivo via `URL.createObjectURL`

## 7. Frontend — Compras: Widget resumen

- [x] 7.1 Agregar widget `<PresupuestoResumenWidget />` en `ComprasView.tsx` en la tab de trazabilidad que llama a `GET /api/v1/gerencia-tecnica/reportes/control-presupuestal?proyectoId=<cc_activo>`
- [x] 7.2 Mostrar totales: Presupuestado, Comprometido, Pagado, Disponible, % Ejercido global
- [x] 7.3 Badge rojo "Presupuesto en riesgo" cuando `total_comprometido > total_presupuestado * 0.85`

## 8. Frontend — Flujo de pago: pasar concepto_id

- [x] 8.1 En el componente de registro de pago en `ComprasView.tsx` o `FinanzasView.tsx`, al seleccionar una OC para pagar, resolver el `concepto_id`/`concepto_clave` de la OC (via `requisicion_id → concepto_id` disponible en los datos de la OC cargados) y pasarlo en el body del `POST /api/v1/finanzas/pagos`

## 9. E2E y verificación en VPS

- [ ] 9.1 Ejecutar `prisma migrate deploy` en el container `finanzas` en VPS — verificar que la migración agrega columnas sin errores
- [ ] 9.2 Verificar `GET /api/v1/gerencia-tecnica/reportes/control-presupuestal?proyectoId=<uuid>` retorna datos correctos con el proyecto de prueba en iretum.com
- [ ] 9.3 Verificar que el tab "Control Presupuestal" aparece en GT y la tabla carga con datos del presupuesto
- [ ] 9.4 Verificar exportación PDF descarga un archivo válido desde iretum.com
- [ ] 9.5 Verificar exportación XLSX descarga un archivo válido desde iretum.com
- [ ] 9.6 Verificar que el widget resumen de presupuesto aparece en ComprasView tab trazabilidad
