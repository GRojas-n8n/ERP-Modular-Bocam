## Why

Hallazgo H4a de la certificación M11 (19 nov 2026). La póliza `PASIVO_PROYECTADO` que Contabilidad crea con
`compras.oc_creada` guarda `proveedor_id` (un UUID) como beneficiario. El evento trae `proveedor_nombre` desde
`oc-creada-con-nombre-proveedor` (#193), pero Contabilidad no lo usa. En pantalla y en reportes el pasivo aparece
a nombre de un identificador, no del proveedor.

## What Changes

- Handler de `compras.oc_creada`: `beneficiario = proveedor_nombre` (recortado a 255). Si el evento no lo trae
  (eventos anteriores a #193), se conserva `proveedor_id`.
- `OrdenCompraCreadaPayload` declara los campos aditivos `proveedor_nombre`, `subtotal` e `iva` (opcionales).
- Script `scripts/contabilidad/backfill-beneficiario-pasivo-proyectado.sql`: rellena las pólizas existentes con la
  razón social exportada de Compras a CSV. Simulación por defecto; aplica con `-v aplicar=1`.
- Prueba: `compras.oc-creada.integration.test.ts` verifica el beneficiario.

## Impact

- Servicio: `apps/contabilidad` únicamente. Sin migración.
- La separación de IVA (H4b) queda fuera: espera la cuenta que defina el contador.
