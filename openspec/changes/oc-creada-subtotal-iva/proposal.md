## Why

Hallazgo H4b de la certificación M11 (19 nov 2026). La póliza `PASIVO_PROYECTADO` que Contabilidad genera con
`compras.oc_creada` carga el total de la OC (con IVA) a Materiales: el evento solo trae `total`. Para separar
costo e IVA, Contabilidad necesita `subtotal` e `iva`, que Compras ya guarda en `ordenes_compra`.

## What Changes

- `buildOcCreadaPayload` agrega `subtotal` e `iva` (números) tomados de la OC. **Aditivo**: ningún campo existente
  cambia; si la OC no los trae, se publican `null`.
- Pruebas unitarias en `src/oc-eventos.test.ts`.

## Impact

- Servicio: `apps/compras` únicamente. Sin migración ni cambio HTTP.
- Consumidores (Finanzas, Contabilidad, Gerencia Técnica) ignoran los campos nuevos hasta que los usen. Contabilidad
  los usará cuando el contador defina la cuenta de IVA (change aparte).
