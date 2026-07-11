## Context

`apps/compras` ya hace una llamada B2B real hacia `apps/gerencia-tecnica`
para resolver el catálogo de insumos al armar los correos de solicitud de
cotización (`apps/compras/src/main.ts:119-122`):

```ts
axios.get(`${GT_URL}/insumos`, {
  headers: { authorization: opts.authHeader, 'x-tenant-id': opts.tenantHeader, 'x-proyecto-id': opts.proyectoHeader },
  timeout: 5000,
}).then(r => (r.data?.data ?? []) as any[]).catch(() => [] as any[]);
```

`GT_URL` se inyecta en `docker-compose.vps.yml` como URL interna del
cluster Docker (`GT_URL: http://gerencia-tecnica:3001/api/v1/gerencia-tecnica`,
línea 219) — no hay `ALMACEN_URL` equivalente todavía.

`ItemInventario` (`apps/almacen/prisma/schema.prisma:21-40`) usa el mismo
`insumo_id` (UUID) que `RequisicionItem.insumo_id`
(`apps/compras/prisma/schema.prisma:132`) — ambos apuntan al catálogo MDM
servido por gerencia-tecnica. El match es directo por UUID, sin
fuzzy-matching por nombre/clave.

`RequisicionItem` no tiene ningún campo de cantidad parcial/pendiente
(`cantidad_presupuestada` es un snapshot de presupuesto, no de
surtido) — la única cantidad relevante para comparar contra `stock_actual`
es `cantidad` (la cantidad total solicitada del ítem).

El panel de "Solicitar Cotización" en `apps/app-shell/src/views/ComprasView.tsx`
es un slide-out panel controlado por `solicitudPanelReqId`
(líneas 2711-2999), no un modal. El codebase de `app-shell` **no tiene**
ningún componente de confirmación reutilizable (`window.confirm`,
`ConfirmDialog`, etc.) — cualquier interstitial de confirmación debe
construirse como estado dentro del mismo panel, no como un modal nuevo.

## Goals / Non-Goals

**Goals:**
- Compras ve, antes de enviar una solicitud de cotización externa, qué
  insumos de la requisición ya tienen stock disponible en el proyecto
  activo y cuánto.
- El flujo normal (sin insumos con stock) no gana ningún paso ni clic
  adicional.
- Un fallo del servicio de Almacén nunca bloquea el envío de la solicitud
  de cotización.

**Non-Goals:**
- No se valida stock de ítems `es_imprevisto` (no tienen `insumo_id`) —
  quedan fuera, no se tratan como "sin stock".
- No se descuenta ni reserva stock al mostrar la advertencia — es
  puramente informativo, ninguna transacción de Almacén se dispara desde
  este flujo.
- No se rediseña el panel de solicitud de cotización más allá de agregar
  la sección de advertencia — no se migra a modal, no se reordena el
  resto del formulario.
- No se implementa un componente de confirmación genérico reutilizable
  para todo `app-shell` — el interstitial de este change es local al
  panel de Compras, sin pretender ser un patrón de UI nuevo del sistema
  (evita la abstracción prematura que señala CLAUDE.md).

## Decisions

### 1. Endpoint nuevo en Almacén: `GET /api/v1/almacen/stock?insumo_ids=...`
Se crea un endpoint dedicado en vez de extender `GET
/api/v1/almacen/inventario` (que hoy solo soporta `?q=` de texto libre y
está pensado para la vista de inventario, no para consultas batch por ID).
Responde `{ success: true, data: [{ insumo_id, stock_actual }] }`, scoped
por `tenant_id`+`proyecto_id` de la sesión — mismo patrón de auth que el
resto de endpoints de `apps/almacen`. Los `insumo_id` sin fila en
`ItemInventario` simplemente no aparecen en la respuesta (equivalente a
`stock_actual = 0`, el llamador no necesita distinguir "cero" de "no
existe").
- **Alternativa descartada**: extender `/inventario` con un parámetro
  `insumo_ids`. Se descarta porque ese endpoint ya devuelve campos
  pensados para UI de inventario (`bajo_minimo`, `agotado`, búsqueda de
  texto) que no aplican a una consulta B2B interna — mezclar ambos usos en
  un mismo endpoint acopla un cambio de contrato público a una necesidad
  interna.

### 2. Dónde se dispara la consulta de stock: al abrir el panel, no al enviar
La consulta a Almacén se hace en el mismo punto donde hoy se cargan los
datos de la solicitud existente (`GET
.../requisiciones/:reqId/solicitud-cotizacion`, ya se llama al abrir el
panel vía `handleOpenSolicitudPanel`, línea 871) — se añade la consulta de
stock a esa misma respuesta o como llamada paralela, para que la
advertencia ya esté visible mientras Compras arma la solicitud, no como
sorpresa al momento de enviar.
- **Alternativa descartada**: consultar el stock solo al hacer clic en
  "Enviar". Se descarta porque agregaría una espera de red justo en el
  momento del envío (peor percepción de latencia) y porque Compras
  se beneficia de ver la advertencia mientras todavía está eligiendo
  proveedores y plazos, no después.

### 3. Umbral de advertencia: `stock_actual > 0`, no comparado contra `cantidad`
Se advierte si hay CUALQUIER stock disponible (`stock_actual > 0`), sin
comparar contra la `cantidad` solicitada del ítem. Mostrar "hay 3, se
piden 50" ya es información suficiente para que Compras decida — no se
oculta la advertencia solo porque el stock disponible sea menor a lo
solicitado (en ese caso también puede convenir surtir parcialmente de
almacén y cotizar solo la diferencia, decisión de negocio que el sistema
no debe tomar por Compras).
- **Alternativa descartada**: solo advertir si `stock_actual >= cantidad`
  (stock suficiente para cubrir todo el pedido). Se descarta porque
  ocultaría información útil en el caso común de stock parcial.

### 4. Confirmación in-panel, no modal nuevo
Cuando hay insumos con stock, el botón de envío existente ("Enviar
Solicitud", línea 2988-2997) se reemplaza por un flujo de 2 pasos dentro
del mismo panel: primero aparece la sección de advertencia (lista de
insumos con stock) con un checkbox u botón secundario "Entiendo, enviar de
todos modos" que habilita el botón de envío real. Sin insumos con stock,
el botón de envío se comporta exactamente igual que hoy (sin pasos
nuevos).
- **Alternativa descartada**: introducir un componente `ConfirmDialog`
  genérico reutilizable. Se descarta por disciplina de alcance — no existe
  hoy en el codebase y crearlo para un solo caso de uso es la abstracción
  prematura que este proyecto evita; si un futuro change necesita
  confirmaciones modales en más lugares, ese es el momento de extraerlo.

### 5. Degradación ante fallo de Almacén: igual que el patrón con GT
Mismo `.catch(() => [])` fail-soft ya usado para la llamada a
gerencia-tecnica — un timeout o error de Almacén hace que la consulta de
stock devuelva "sin datos", el panel no muestra advertencia, y el envío de
la solicitud de cotización procede sin bloqueo. Se acepta explícitamente
que en ese escenario Compras no se entera de que había stock — mismo
trade-off ya aceptado por el patrón existente, no se introduce un
mecanismo de reintento ni de alerta separada.

## Risks / Trade-offs

- **[Riesgo]** Si Almacén está caído de forma prolongada, la advertencia
  de stock deja de aparecer sistemáticamente sin que nadie lo note (fail
  silencioso).
  → **Mitigación**: aceptado — mismo comportamiento que la integración ya
    existente con gerencia-tecnica; no se agrega monitoreo especial en
    este change, sería sobre-ingeniería para una advertencia informativa.
- **[Riesgo]** El endpoint nuevo de Almacén queda sin autenticación B2B
  dedicada (usa el mismo JWT del usuario de Compras reenviado, igual que
  la llamada a GT) — un cambio futuro en el middleware de auth de Almacén
  podría romper esta integración sin que sea obvio desde Compras.
  → **Mitigación**: mismo patrón y mismo riesgo ya aceptado para la
    llamada existente a GT; no es un riesgo nuevo introducido por este
    change.

## Open Questions
- ¿El endpoint de stock de Almacén debería excluir el stock ya
  "comprometido"/reservado para otra requisición? Hoy `ItemInventario` no
  tiene ningún campo de reserva — se asume que `stock_actual` es el valor
  correcto a mostrar en este change; si el negocio pide reservas más
  adelante, es un change aparte.
