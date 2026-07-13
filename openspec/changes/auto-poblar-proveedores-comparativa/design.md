## Context

`openComparativa` (`apps/app-shell/src/views/ComprasView.tsx:884-931`) tiene dos ramas:

1. **Cuadro nuevo** (`!existing`): crea el `CuadroComparativo` en backend
   (`POST /comparativas`, idempotente) y siembra `proveedoresIniciales` desde
   `SolicitudCotizacionProveedor` vía `seedProveedoresDesdeSolicitud`
   (`apps/app-shell/src/lib/comparativa-proveedores.ts`) — pero solo como estado local de
   React (`newComp.proveedores`), nunca persistido.
2. **Cuadro existente** (`existing`): solo repuebla `lineas` si están vacías. Nunca toca
   `proveedores`.

`proveedores` en el estado normalizado (`normalizeComp`, `ComprasView.tsx:531-571`) se
deriva exclusivamente de `ComparativaDetalle` (via `detalles.forEach(d =>
provMap.set(d.proveedor_id, ...))`) — filas que solo existen cuando alguien ya capturó un
precio (`PUT .../cotizaciones`). Por diseño existente, `proveedores` es un valor **derivado
y volátil** hasta que hay precios reales; no hay (ni se propone agregar) una tabla que
persista "proveedor invitado al cuadro" de forma independiente de `ComparativaDetalle`.

Esto significa que cualquier solución debe recalcular el prepoblado **en cada apertura**,
no solo una vez — coherente con el patrón ya usado para `lineas` en la rama `existing`.

## Goals / Non-Goals

**Goals:**
- El prepoblado de proveedores invitados sobrevive a recarga de página y a reapertura de un
  cuadro ya creado ("Continuar comparativa"), no solo a la creación inicial.
- No perder proveedores que ya tienen precios reales capturados (`ComparativaDetalle`
  existente) al fusionar con los invitados en `SolicitudCotizacion`.
- Mantener el tope de 3 proveedores por cuadro (`MAX_PROVEEDORES_COMPARATIVO`).
- Cero cambios de schema — el fix es de flujo/orquestación en el frontend.

**Non-Goals:**
- No se cambia el filtro por estado (`RESPONDIO`/`PENDIENTE`/`DECLINO`): hoy
  `seedProveedoresDesdeSolicitud` no filtra por estado, solo corta a los primeros 3
  invitados. Cambiar ese criterio de negocio (p. ej. excluir `DECLINO`) queda fuera de
  alcance de este bug-fix — es una decisión de producto aparte, no una regresión.
- No se persiste "proveedor invitado al cuadro" en backend como entidad propia. Seguimos
  derivando `proveedores` de `ComparativaDetalle` + el merge local con `SolicitudCotizacion`
  en cada apertura, igual que hoy para `lineas`.
- No se toca el badge de estado de respuesta (`RESPONDIO`/`DECLINO`/`PENDIENTE`) por
  proveedor en `ComparativaDetail` — ya cubierto por un requirement aparte en
  `cotizacion-compras-ux` (estado-respuesta-proveedor-comparativo, PR #38).

## Decisions

### D1: Extraer el merge a una función pura reutilizable, aplicarla en ambas ramas

Se extrae la lógica de "fusionar proveedores ya persistidos (con precios reales) +
proveedores invitados en la Solicitud de Cotización, respetando el tope" a una función pura
nueva en `apps/app-shell/src/lib/comparativa-proveedores.ts`, p. ej.
`mergeProveedoresConSolicitud(proveedoresActuales, proveedoresInvitados, max)`:
- Conserva todos los `proveedoresActuales` (los que ya tienen `ComparativaDetalle` — no se
  descartan aunque no estén en la Solicitud, ej. agregados manualmente del catálogo).
- Agrega los invitados que falten, en orden, hasta llegar a `max`.
- No duplica por `id`.

`seedProveedoresDesdeSolicitud` (creación desde cero) se convierte en el caso particular
`mergeProveedoresConSolicitud([], invitados, max)` — se mantiene como wrapper delgado para
no romper su firma actual ni los tests 2.1/2.2 ya existentes.

**Alternativa descartada**: persistir proveedores en backend al crear el cuadro (nueva tabla
o campo). Se descarta porque el modelo actual ya trata `proveedores` como derivado de
`ComparativaDetalle`, cambiarlo es un cambio de schema más invasivo para un bug de
"se pierde el prepoblado visual", y el merge en frontend resuelve el síntoma real sin tocar
contratos de API existentes.

### D2: Ambas ramas de `openComparativa` llaman a `loadSolicitud`/usan `solicitudesMap` y aplican el merge antes de `setComparativas`/`setActiveReqId`

- Rama `existing`: además de repoblar `lineas` si están vacías, obtener la solicitud
  (`solicitudesMap[req.id] ?? await loadSolicitud(req.id)`) y aplicar
  `mergeProveedoresConSolicitud(existing.proveedores, solicitud.proveedores, max)`,
  actualizando `proveedores` en el mismo `setComparativas` que ya actualiza `lineas`.
- Rama `!existing`: sin cambios de comportamiento, solo usa el wrapper `D1`.
- Si no hay `SolicitudCotizacion` para la requisición (`loadSolicitud` devuelve `null`), el
  merge es un no-op — se preserva el comportamiento actual sin invitación previa.

### D3: No bloquear la apertura si `loadSolicitud` falla

Igual que en la rama de creación (`ComprasView.tsx:900-904` ya usa `try/catch` alrededor del
`POST`), si `loadSolicitud` lanza error (red, 403, etc.), se abre el cuadro con los
proveedores que ya tenía (`existing.proveedores` sin cambios) en vez de bloquear la UI —
el prepoblado es una mejora de UX, no un requisito duro para poder trabajar el cuadro.

## Risks / Trade-offs

- **[Riesgo]** El merge se recalcula en cada `openComparativa`, incluyendo una llamada a
  `loadSolicitud` que no existía antes en la rama `existing` → latencia adicional al abrir un
  cuadro ya creado.
  **[Mitigación]** Ya existe `solicitudesMap` como caché en memoria (`ComprasView.tsx:398`);
  se reutiliza antes de llamar a `loadSolicitud`, igual que ya hace la rama de creación.
- **[Riesgo]** Si un cuadro ya tiene 3 proveedores con precios reales capturados
  (`ComparativaDetalle`) y la Solicitud tiene proveedores invitados adicionales, estos
  últimos no se agregan (tope de 3) — Compras seguiría sin ver a ese 4º proveedor.
  **[Mitigación]** Es el mismo límite de negocio ya vigente (`MAX_PROVEEDORES_COMPARATIVO`),
  no una regresión nueva; fuera de alcance de este bug-fix ampliar el tope.
- **[Trade-off]** Se mantiene `proveedores` como valor derivado/no persistido en vez de
  moverlo a una fuente de verdad en backend — significa que el mismo síntoma podría repetirse
  si en el futuro se agrega otra ruta de apertura del cuadro sin pasar por
  `openComparativa`/el merge. Se documenta explícitamente para que futuras rutas de acceso al
  cuadro (si se agregan) recuerden aplicar el mismo merge.

## Migration Plan

No aplica migración de datos (sin cambios de schema). Despliegue normal de frontend
(`apps/app-shell`), sin coordinación con backend. Rollback: revertir el commit del PR, sin
efectos secundarios en datos ya persistidos.

## Open Questions

Ninguna — las decisiones de alcance (D1-D3) cubren los escenarios encontrados en la prueba
manual de producción del usuario administrador.
