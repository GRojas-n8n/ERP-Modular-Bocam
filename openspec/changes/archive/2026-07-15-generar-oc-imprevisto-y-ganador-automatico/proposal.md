## Why

Reporte del usuario en producción (flujo completo real: Residente crea requisición →
Compras crea Cuadro Comparativo → evaluación técnica → evaluación económica GT):
Gerencia Técnica aprobó, pero Compras no ve la Orden de Compra para enviar al proveedor
ganador. Investigado directo en producción (logs + BD), dos causas confirmadas:

1. **`es_ganador` nunca se marca en la práctica.** El sistema tiene DOS mecanismos
   independientes para identificar al proveedor ganador que nunca se sincronizan:
   `CuadroComparativo.primera_opcion_proveedor_id` (elegido por el Residente al firmar) y
   `ComparativaDetalle.es_ganador` (botones A/B/C en la tabla de precios de Compras,
   requerido por `convertir-oc` para generar la OC). El segundo debe marcarse ANTES de que
   el cuadro llegue a `APROBADO_GT`, porque en ese estado la tabla de precios se bloquea
   (`locked` incluye `'APROBADO_GT'`) — nadie le indica a Compras que ese clic es
   necesario, y una vez bloqueado ya no hay forma de hacerlo. Confirmado en producción:
   cuadro real con `primera_opcion_proveedor_id` y `aprobacion_gt` correctos, pero
   `es_ganador: false` en las 3 filas — `convertir-oc` falla con "No hay renglones
   aprobados... con proveedor ganador seleccionado."

2. **Los renglones de requisición "Imprevisto" (texto libre, sin `insumo_id` de
   catálogo) no pueden generar Orden de Compra en absoluto.** Confirmado por el usuario:
   esto NO es un caso raro — es una regla de negocio real de Bocam: todo imprevisto debe
   vincularse a una partida real del catálogo (para cargarse a un presupuesto), pero el
   material en sí puede no existir en el catálogo de insumos (por eso se captura como
   texto libre). El código actual (`convertir-oc`, desde el change
   `cotizar-items-texto-libre-comparativa`) excluye explícitamente cualquier renglón sin
   `insumo_id` — documentado como Non-Goal en su momento, pero bloquea un caso de uso real
   y frecuente. `OrdenCompraItem.insumo_id` es además `NOT NULL` en el esquema, por lo que
   ni siquiera es posible intentarlo sin migración.

## What Changes

- **Backend — auto-selección de ganador:** al finalizar la aprobación GT
  (`PATCH /comparativas/:id/revisar-gt`, cuando el resultado es `APROBADO_GT`), el sistema
  marca automáticamente `es_ganador = true` en el/los renglón(es) del proveedor
  correspondiente — sin depender de un clic manual de Compras. Regla de selección por
  renglón: preferir `primera_opcion_proveedor_id` si su `aprobacion_gt` es C/DA/APROBADO
  para ese renglón; si no, `segunda_opcion_proveedor_id` si aplica; si ninguno de los dos
  aplica a ese renglón, el proveedor aprobado con menor `precio_ofertado`.
- **Backend — soporte de OC para renglones de texto libre:** `convertir-oc` ya no
  excluye renglones sin `insumo_id` — los incluye usando `detalle_req_id` (cantidad real
  desde `RequisicionItem`, descripción/unidad denormalizadas al momento de crear la OC).
- **Esquema (migración Prisma):** `OrdenCompraItem.insumo_id` pasa a nullable; se agregan
  `detalle_req_id` (nullable), `descripcion_libre` (nullable) y `unidad_libre` (nullable).
- **PDF de OC:** `buildOcPdfPayload` usa `descripcion_libre`/`unidad_libre` cuando
  `insumo_id` es nulo, en vez de "Insumo no encontrado en catálogo".
- **Corrección puntual:** el cuadro de producción ya bloqueado (`CC-1784053191713`) se
  corrige manualmente (script de un solo uso) para fijar `es_ganador` en el proveedor
  correcto, y se re-ejecuta `convertir-oc` para esa requisición ya con el fix desplegado.

## Capabilities

### Modified Capabilities
- `cotizacion-compras-ux`: la generación de Orden de Compra ya no requiere selección
  manual de ganador ni excluye renglones de texto libre/imprevisto.

## Impact

- **Backend**: `apps/compras/src/main.ts` (`revisar-gt`, `convertir-oc`),
  `apps/compras/src/requisicion-cobertura.ts`, `apps/compras/src/orden-compra-pdf-payload.ts`.
- **BD**: migración Prisma en `apps/compras` — 1 columna pasa a nullable, 3 columnas
  nuevas nullable en `ordenes_compra_items`. Sin pérdida de datos, sin downtime requerido
  (columnas nuevas nullable, no bloquea escrituras existentes).
- **Redeploy VPS**: `compras` requiere migración (`prisma migrate deploy`) antes del
  restart del contenedor.
- **Urgencia**: el usuario tiene pruebas en producción con usuarios reales programadas en
  ~2 horas — este fix debe quedar desplegado y verificado antes de esa ventana.
