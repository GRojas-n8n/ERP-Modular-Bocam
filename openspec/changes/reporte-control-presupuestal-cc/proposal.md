## Why

El sistema tiene toda la cadena de trazabilidad capturada (presupuesto GT → requisición con `concepto_id` → OC → pago en Finanzas), pero no existe un reporte que cierre el círculo: cuánto se presupuestó por partida, cuánto se comprometió en OCs activas y cuánto se ha pagado efectivamente. Sin este reporte, el control de costos es invisible para GT, Compras y Dirección.

## What Changes

- Nuevo endpoint B2B interno en **Compras**: `GET /api/v1/compras/reportes/ocs-por-concepto` — agrega totales de OCs activas por `concepto_id`
- Nuevo endpoint B2B interno en **Finanzas**: `GET /api/v1/finanzas/reportes/pagado-por-concepto` — agrega pagos por `concepto_id` (requiere agregar `concepto_id` al schema de `DetallePagoOC`)
- Nuevo endpoint principal en **GT**: `GET /api/v1/gerencia-tecnica/reportes/control-presupuestal` — agrega presupuesto (local) + comprometido (B2B Compras) + pagado (B2B Finanzas) por partida/concepto
- Schema change en **Finanzas**: se agrega `concepto_id` y `concepto_clave` a `DetallePagoOC` (nullable, desnormalizado igual que `oc_folio`)
- Nuevo endpoint de exportación en **Reportes** (puerto 3010): `POST /api/v1/reportes/control-presupuestal/export`
- Vista frontend en **GT**: tab "Control Presupuestal" con tabla partidas y gráfica de avance
- Panel resumen en **Compras**: widget de alerta de comprometido vs presupuesto

## Capabilities

### New Capabilities

- `control-presupuestal-endpoint`: Endpoint GT que agrega presupuestado + comprometido + pagado por partida (concepto) para un CC/proyecto. Llama B2B a Compras y Finanzas. Incluye los sub-endpoints internos en Compras y Finanzas.
- `detalle-pago-concepto`: Schema change en Finanzas — `DetallePagoOC` agrega `concepto_id` (Uuid, nullable) y `concepto_clave` (VarChar, nullable) desnormalizados, más migración y actualización del endpoint POST /pagos para aceptar y persistir estos campos.
- `frontend-control-presupuestal`: Dos superficies frontend — tab "Control Presupuestal" en GT (`GerenciaTecnicaView.tsx`) y widget resumen en Compras (`ComprasView.tsx`). Exportable a PDF/Excel desde `reportes` (puerto 3010).

### Modified Capabilities

- `pago-oc`: `DetallePagoOC` agrega `concepto_id`/`concepto_clave` opcionales; POST /finanzas/pagos acepta estos campos en `detalles[]`. Comportamiento existente sin cambio cuando los campos son omitidos.

## Impact

- **apps/finanzas**: Prisma schema (`DetallePagoOC`), migración nueva, `POST /api/v1/finanzas/pagos` acepta campos adicionales, nuevo `GET /api/v1/finanzas/reportes/pagado-por-concepto`
- **apps/compras**: Nuevo `GET /api/v1/compras/reportes/ocs-por-concepto` (solo B2B, rol interno)
- **apps/gerencia-tecnica**: Nuevo `GET /api/v1/gerencia-tecnica/reportes/control-presupuestal`
- **apps/reportes**: Nuevo handler `POST /api/v1/reportes/control-presupuestal/export` (PDF + XLSX)
- **apps/app-shell**: `GerenciaTecnicaView.tsx` + `ComprasView.tsx`
- **No hay cambios en RabbitMQ**: el reporte es on-demand, sin proyección de eventos
- **Compatibilidad**: `concepto_id` es nullable — registros de pago legacy sin `concepto_id` siguen funcionando; solo quedan sin clasificar en el reporte
