## Context

Las tres pestañas viven en el mismo componente (`InsumosView.tsx`), controlado por un `activeTab` derivado de la prop `activeSubView`, que a su vez viene de `currentSubView` en `App.tsx` (estado del shell, no de `InsumosView`). Como `InsumosView` no se desmonta al cambiar de sub-pestaña (solo cambia qué bloque JSX se renderiza), el estado local de cada pestaña (por ejemplo `trazExpanded`, un `Set<string>` de `concepto_id` expandidos) sobrevive un cambio de pestaña y vuelta.

`ControlPresupuestalTabla` es un componente compartido entre `InsumosView` (Control Presupuestal) y `ControlObraView` (Presupuesto por Partida, solo lectura para `control_proyectos`) — ver `trazabilidad-partida-frontend`. Solo `InsumosView` tiene una pestaña "Trazabilidad" a la que saltar.

## Goals / Non-Goals

**Goals:**
- Permitir saltar de una fila de partida en Control Presupuestal o Control de Costos a la misma partida en Trazabilidad, sin perder de vista cuál partida se estaba consultando.
- Mantener `ControlPresupuestalTabla` funcional sin cambios para `ControlObraView`, que no tiene pestaña de Trazabilidad.

**Non-Goals:**
- No se implementa el salto inverso (Trazabilidad → Control Presupuestal/Costos) en este cambio.
- No se persiste el destino del salto entre recargas de página (`currentSubView` en `App.tsx` ya no persiste hoy tampoco).

## Decisions

- **Callback opcional en `ControlPresupuestalTabla`:** se agrega `onVerTrazabilidad?: (conceptoId: string) => void` como prop. Si no se pasa, no se renderiza la acción — así `ControlObraView` no necesita ningún cambio. Alternativa descartada: crear una variante separada del componente solo para InsumosView, lo cual duplicaría JSX que hoy es compartido a propósito (ver `trazabilidad-partida-frontend`, "Componente compartido entre GT y CP").
- **Navegación de pestaña vía la prop existente `onSubNavigate`:** se agrega esta prop (nueva) a `InsumosView`, análoga a la que ya reciben otras vistas (`ControlObraView`, `ComprasView`, etc. reciben `activeSubView`; el patrón de pasar también el setter ya existe en el shell vía `setCurrentSubView`). `App.tsx` pasa `onSubNavigate={setCurrentSubView}` al montar `InsumosView`.
- **Pre-expansión vía estado "pendiente":** al hacer clic en "Ver en Trazabilidad", además de cambiar de sub-pestaña se guarda el `concepto_id` en un estado `trazPendingExpand`. El render de la pestaña Trazabilidad, al montar/activarse, si `trazPendingExpand` coincide con una fila cargada, la agrega a `trazExpanded` y limpia el pendiente. Esto evita depender de timing de fetch (la partida puede tardar en cargar si es la primera vez que se visita la pestaña).

## Risks / Trade-offs

- [Riesgo] Si la partida no existe en el reporte de Trazabilidad (por ejemplo, sin datos de `CompraProyectada` para ese concepto), el "pendiente" nunca encuentra coincidencia y no pasa nada visible → Mitigación: no es un error silencioso grave (el usuario ya está en la pestaña correcta, solo no ve la fila expandida); se documenta como comportamiento esperado en la spec, no se agrega manejo especial.
- [Trade-off] Se agrega una prop nueva a `InsumosView` (`onSubNavigate`) que hoy no existe — es un cambio de superficie pública del componente, pero acotado y sin romper el uso actual (prop opcional).
