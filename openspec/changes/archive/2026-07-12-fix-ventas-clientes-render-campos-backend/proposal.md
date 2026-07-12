## Why

`VentasView.tsx` (tab Clientes) crashea con un Error Boundary
("Error crítico — recarga la aplicación") en cuanto la tabla recibe
clientes reales del backend — hallado corriendo un script Playwright E2E
contra el tenant Alfa (50 clientes ya sembrados en el seed de
`apps/auth`), no relacionado con ningún change reciente:

```
TypeError: Cannot read properties of undefined (reading 'toLowerCase')
  at VentasView.tsx:234 → c.nombre.toLowerCase()
```

La interfaz `Cliente` de `VentasView.tsx` espera los campos `nombre`,
`rfc`, `email`, `tipo` — pero `GET /api/v1/ventas/clientes`
(`apps/ventas/src/main.ts:37+`) siempre devuelve las columnas reales del
schema (`razon_social`, `rfc_tax_id`, `email_contacto`, `estatus`,
`codigo_cliente`), verificado con `curl` directo al endpoint. Solo
`DEMO_CLIENTES` (`lib/demoData.ts`) usa los nombres viejos — por eso el
bug nunca se manifestó en modo demo, únicamente contra un tenant real
con clientes cargados.

Esto afecta a **cualquier** tenant con al menos un cliente real — no es
un caso límite. El tab Clientes de Ventas ha estado roto contra datos
reales desde que existe (no hay evidencia de que haya funcionado nunca
contra el backend real).

## What Changes

- `apps/app-shell/src/views/VentasView.tsx`: al recibir la respuesta de
  `GET /clientes`, normalizar cada registro a la forma que la interfaz
  `Cliente` ya espera (`nombre ← razon_social`, `rfc ← rfc_tax_id`,
  `email ← email_contacto`, `id ← id_cliente`) antes de guardarlo en
  estado — mismo shape que ya producen `DEMO_CLIENTES` y el import
  masivo, para no tener que tocar la interfaz, el filtro ni el render
  existentes.

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
(ninguna — no existe spec previo cubriendo esta vista; el bug se
corrige a nivel de código, sin capability nueva que documentar)

## Impact

- **Frontend (`apps/app-shell`)**: `VentasView.tsx`, función `fetchData`
  (rama `tab === 'clientes'`).
- Sin cambios de backend ni de schema — el contrato de
  `GET /clientes` no cambia, se corrige únicamente cómo el frontend lo
  consume.
