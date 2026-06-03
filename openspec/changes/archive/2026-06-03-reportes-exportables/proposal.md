# Proposal — Reportes Exportables (PDF / Excel)

## Why

Los módulos ya producen datos correctos pero no hay manera de sacarlos del sistema en
formato imprimible o compartible. OCs, estimaciones, pre-nóminas y comparativas se ven
en pantalla pero no se pueden enviar a un proveedor, firmar o adjuntar a un expediente.

## What Changes

- **NUEVO** servicio `apps/reportes/` (puerto 3010) — microservicio dedicado a generación
  de documentos usando `pdfkit` (PDF) y `exceljs` (Excel).
- **NUEVOS** endpoints de generación bajo `/api/v1/reportes/` para los documentos más
  solicitados: OC (PDF), Pre-nómina (PDF + Excel), Comparativa de precios (PDF), Presupuesto GT (Excel).
- **NUEVOS** botones "Exportar PDF" / "Descargar Excel" en las vistas correspondientes
  del frontend (ComprasView, PersonalView, InsumosView).

## Capabilities

### New Capabilities

- `reporte-oc-pdf`: PDF de Orden de Compra con membrete del tenant, datos del proveedor,
  tabla de conceptos, totales, IVA, firma de autorización.
- `reporte-prenomina-pdf`: PDF de pre-nómina por empleado con desglose IMSS/ISR/neto.
- `reporte-prenomina-excel`: Excel descargable con una fila por empleado y todas las columnas de cálculo.
- `reporte-presupuesto-excel`: Excel del presupuesto GT con APU, conceptos, cantidades, precios.
- `reporte-comparativa-pdf`: PDF del cuadro comparativo de proveedores con el ganador marcado.

## Impact

- **Nuevo microservicio:** `apps/reportes/` (puerto 3010), Dockerfile vía `Dockerfile.backend`.
- **Frontend:** botones de exportación en ComprasView, PersonalView, InsumosView.
- **Nginx:** nuevo bloque proxy `/api/v1/reportes/`.
- **Docker-compose:** nuevo servicio `reportes`.
