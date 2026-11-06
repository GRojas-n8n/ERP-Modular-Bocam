## Why

Finanzas mantiene la proyección `ocs_por_pagar` (change `corregir-egreso-oc-multiproveedor`) para validar egresos
que liquidan OCs de varios proveedores. Como Finanzas no puede leer la base de Compras, necesita el nombre del
proveedor en el evento `compras.oc_creada`; sin él, la pantalla de pagos y la póliza de egreso muestran
proveedores sin nombre.

## What Changes

- `POST /comparativas/:id/convertir-oc`: la OC se crea con `include: { proveedor: { select: { razon_social } } }`.
- El payload de `compras.oc_creada` agrega `proveedor_nombre` (razón social). **Aditivo**: ningún campo existente
  cambia ni se elimina.
- Prueba de integración `oc-creada-proveedor-nombre` (dos proveedores, una OC y un evento por proveedor).

## Impact

- Servicio: `apps/compras` únicamente.
- Consumidores: Finanzas ya lee `proveedor_nombre` cuando viene (`handleOcPorPagarCreadaEvent`); los demás
  consumidores ignoran el campo nuevo.
- Sin migración ni cambio de contrato HTTP.
