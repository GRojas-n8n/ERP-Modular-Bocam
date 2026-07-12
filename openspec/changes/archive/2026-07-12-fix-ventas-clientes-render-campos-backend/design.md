## Context

`VentasView.tsx` define:

```ts
interface Cliente {
  id: string;
  nombre: string;
  rfc?: string;
  email?: string;
  telefono?: string;
  tipo?: string;
}
```

y usa esos campos tanto en el filtro de búsqueda
(`clientesFiltrados = clientes.filter(c => c.nombre.toLowerCase()...)`)
como en el render de la tabla. `fetchData` guarda la respuesta de
`GET /clientes` directo en estado sin transformar:
`setClientes(r.data.data || [])`.

`GET /api/v1/ventas/clientes` (`apps/ventas/src/main.ts:37-48`) devuelve
`prisma.cliente.findMany(...)` tal cual — las columnas reales del
modelo `Cliente` del schema: `id_cliente`, `rfc_tax_id`, `razon_social`,
`email_contacto`, `telefono`, `estatus`, `codigo_cliente`. Nunca
`nombre` ni `rfc`. Verificado con `curl` directo contra el endpoint con
un token real del tenant Alfa (50 clientes reales en el seed).

`DEMO_CLIENTES` (`lib/demoData.ts:328-333`) sí usa `nombre`/`rfc`/
`email` — coincide con la interfaz `Cliente` por casualidad de diseño,
no porque refleje el contrato real del backend. Por eso el bug nunca se
vio en modo demo.

## Goals / Non-Goals

**Goals:**
- Que el tab Clientes de `VentasView.tsx` funcione contra el backend
  real, mostrando nombre/RFC/email/teléfono correctos, sin crashear.
- No modificar el contrato de `GET /clientes` ni el schema — el bug es
  puramente de consumo en el frontend.

**Non-Goals:**
- No se corrige el campo `tipo` (badge "CLIENTE") — no tiene
  contraparte en el modelo `Cliente` del backend (ni en `DEMO_CLIENTES`,
  que tampoco lo define); se queda como fallback decorativo, sin
  cambios de comportamiento.
- No se toca `codigo_cliente` — no se muestra hoy en esta tabla ni antes
  ni después de este fix; fuera de alcance.
- No se audita el resto de `VentasView.tsx` (Cotizaciones, Facturas) por
  el mismo tipo de mismatch — fuera de alcance de este fix puntual; si
  se sospecha el mismo patrón ahí, es un hallazgo para un change aparte.

## Decisions

### D1 — Normalizar en el punto de ingestión (`fetchData`), no cambiar la interfaz `Cliente`
Se mapea la respuesta cruda del backend a la forma que la interfaz
`Cliente` ya espera, en el mismo lugar donde hoy se hace
`setClientes(r.data.data || [])`. Alternativa descartada: cambiar la
interfaz `Cliente` (y el filtro/render) para usar los nombres reales del
backend (`razon_social`, `rfc_tax_id`) — tocaría más superficie
(filtro, 5 celdas de la tabla, `DEMO_CLIENTES`) para el mismo resultado;
normalizar en la ingestión es un cambio de una sola línea, aislado, y
dejar `DEMO_CLIENTES` intacto evita tener que sincronizar los nombres de
campo de los datos demo con el backend real.

## Risks / Trade-offs

- **[Riesgo] Otras vistas de este archivo (Cotizaciones/Facturas)
  podrían tener el mismo mismatch, sin haberlo verificado en este
  change** → Mitigación: fuera de alcance (ver Non-Goals); se deja
  como nota para revisión futura, no se investiga aquí para mantener
  este fix acotado y de bajo riesgo.

## Migration Plan

- Sin cambios de schema ni de backend.
- Branch `fix/ventas-clientes-render-campos-backend`.
- Deploy: solo frontend — se despliega al mergear a `main` (sin
  rebuild de contenedores backend necesario).
- Rollback: revertir el commit — cambio aislado a un `.map()` en un
  solo componente.

## Open Questions

- Ninguna abierta.
