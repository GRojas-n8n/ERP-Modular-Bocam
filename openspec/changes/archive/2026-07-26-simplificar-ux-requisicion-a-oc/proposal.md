## Why

El flujo Requisición → Invitación a Cotizar → Cuadro Comparativo → Evaluación
Técnica → Evaluación Económica → Orden de Compra cruza 3 pantallas
(`ResidenciaView.tsx`, `ComprasView.tsx`, `ComparativaDetail.tsx`) y toma entre
28 y 42 clics en el caso feliz (1 ítem, 2 proveedores, sin preguntas). Parte de
esa fricción viene de que el mismo dato se captura y edita en más de un lugar
sin una fuente de verdad única — especificación técnica del ítem, ficha
técnica del insumo y selección de proveedores se piden dos veces en pantallas
distintas, lo que además rompe trazabilidad (ej. Compras puede agregar al
Cuadro Comparativo un proveedor que nunca fue invitado formalmente). Reducir
esa duplicación baja clics y elimina una fuente real de datos inconsistentes
entre `RequisicionItem`, `ComparativaLinea` y `SolicitudCotizacion`.

## What Changes

- La especificación técnica del ítem (marca/modelo + detalle) capturada por
  el Residente en `RequisicionItem` deja de copiarse a `ComparativaLinea` al
  crear el Cuadro Comparativo. El Cuadro la muestra en modo lectura como
  referencia; si necesita corregirse, se edita en la Requisición (mientras
  la Requisición no esté `COMPRADA`) y el Cuadro la refleja al vuelo. **BREAKING**
  para quien dependa hoy de editar `marca_modelo_ref`/`especificaciones_requeridas`
  directamente desde `ComparativaDetail.tsx`.
- La ficha técnica por insumo tiene un único punto de carga: el formulario de
  Nueva Requisición (Residencia). El botón de carga duplicado dentro del
  Cuadro Comparativo se retira; ahí la ficha se muestra solo para
  consulta/descarga.
- El picker de proveedores se unifica: el mismo componente que Compras usa
  para invitar a cotizar (Paso 2) se reutiliza para dar de alta proveedores
  dentro del Cuadro Comparativo (Paso 3), eliminando el tope fijo de 3 y la
  selección redundante. Un proveedor agregado directamente en el Cuadro sin
  haber pasado por la invitación queda marcado explícitamente como
  "agregado sin invitación" para no perder trazabilidad.
- Para roles con permiso simultáneo de aprobar requisiciones e invitar
  proveedores (`procurement`, `admin`), "Aprobar Requisición" y "Abrir panel
  de invitación a cotizar" se colapsan en una sola acción/pantalla en vez de
  dos clics en dos vistas separadas.
- Las notas para proveedores capturadas por el Residente en
  `Requisicion.observaciones` dejan de copiarse una sola vez como valor
  inicial editable de `SolicitudCotizacion.notas`; el panel de invitación
  muestra el valor vigente de la Requisición en el momento del envío (no un
  snapshot desactualizado si el Residente la edita después de crearla y
  antes de que Compras invite).

**Fuera de alcance de este change:** el loop de revisión con letra
(A→B→C…) que se dispara cuando Residente o GT marcan `?` en un renglón no se
modifica aquí — es un cambio de máquina de estados más profundo que merece su
propio spec.

## Capabilities

### New Capabilities
- `especificacion-tecnica-fuente-unica`: el Cuadro Comparativo referencia (no
  copia) la especificación técnica capturada en la Requisición; una sola
  superficie de edición mientras la Requisición no esté cerrada.
- `ficha-tecnica-carga-unica`: único punto de carga de ficha técnica por
  insumo (Nueva Requisición); el Cuadro Comparativo la muestra solo en modo
  lectura.
- `seleccion-proveedores-unificada`: mismo componente de selección de
  proveedores para invitar a cotizar y para dar de alta en el Cuadro
  Comparativo, con marca visible de "agregado sin invitación" cuando aplique.

### Modified Capabilities
- `solicitud-cotizacion-proveedores`: el requirement de notas para
  proveedores pasa de copiar `Requisicion.observaciones` una sola vez a
  leerlo en vivo al momento de enviar la invitación; y se agrega la acción
  combinada de aprobar+invitar para roles con ambos permisos.

## Impact

- **Backend `compras` (3002):** `apps/compras/src/main.ts` — endpoints
  `POST /requisiciones/:id/solicitud-cotizacion` (dejar de copiar notas),
  `POST /comparativas` (dejar de copiar especificación a `ComparativaLinea`),
  `PUT /comparativas/:id/lineas/:insumoId` (retirar edición de spec ahí),
  `PATCH /requisiciones/:id/aprobar` (posible endpoint combinado
  aprobar+preparar-invitación). Prisma schema de `compras` no cambia de forma
  (los campos de `ComparativaLinea` se dejan de escribir, no se eliminan
  todavía, para no romper cuadros ya existentes en `BORRADOR`).
- **Frontend `app-shell`:** `ResidenciaView.tsx` (único punto de carga de
  ficha técnica, edición de spec post-creación), `ComprasView.tsx` (acción
  combinada aprobar+invitar, picker de proveedores compartido),
  `ComparativaDetail.tsx` (spec y ficha en modo lectura, reutilización del
  picker de proveedores).
- **gerencia-tecnica (3001):** sin cambios de contrato; sigue siendo
  consultado solo para catálogo/fichas/presupuesto (backend-to-backend ya
  permitido).
- Sin cambios de infraestructura, RabbitMQ, ni nuevas tablas.
