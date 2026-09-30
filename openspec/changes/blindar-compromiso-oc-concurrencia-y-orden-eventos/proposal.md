## Why

Prerrequisito técnico de #182 (`fix-oc-creada-presupuesto-id`, lote B2 de `auditar-consumidores-eventbus-sin-perdida-silenciosa`). Al añadir `presupuesto_id` a `compras.oc_creada`, Finanzas y Contabilidad procesarán por primera vez ese evento, y el compromiso presupuestal de una OC pasará a tener hasta tres caminos concurrentes. La auditoría de repositorio del 2026-09-30 encontró que hoy ese compromiso **no está protegido contra la concurrencia ni contra el desorden de eventos**:

- **Tres caminos de compromiso.** (1) `POST /finanzas/comprometer-fondos` (OC sin partida); (2) `gerencia_tecnica.partida_comprometida` (OC con partida, publicado por GT antes de responder a Compras); (3) `compras.oc_creada` (hoy descartado). Los tres usan la misma clave lógica `(referencia_modulo='compras', referencia_entidad='OrdenCompra', referencia_id=oc_id, tipo)`, pero la guarda es un `findFirst` seguido de `create` en una transacción `READ COMMITTED`, sin restricción única. La tabla `movimientos_presupuestales` solo tiene la clave primaria, una FK y tres índices no únicos. Dos consumidores en colas distintas pueden ver "no existe" a la vez y crear ambos el compromiso.
- **Desorden creación/cancelación.** `oc_creada` y `oc_cancelada` viajan por colas distintas. Si la cancelación se procesa primero, la liberación no encuentra compromiso (o, peor, libera el de otra OC porque solo compara con el agregado del presupuesto) y la creación tardía deja un compromiso permanente sobre una OC cancelada.
- **Estados de la OC.** En Compras, `finanzas.fondos_comprometidos` hace `update estado = EMITIDA` salvo que ya lo sea (regresa `CANCELADA`, `RECIBIDA` o `PARCIALMENTE_RECIBIDA` a `EMITIDA`), y `finanzas.presupuesto_insuficiente` fuerza `ERROR_FINANZAS` sobre cualquier estado distinto de `ERROR_FINANZAS`.
- **Eventos idempotentes con datos falsos.** Cuando el compromiso ya existe, el handler de `oc_creada` republica `fondos_comprometidos` con `monto_disponible_restante: 0`, un valor inventado.

Evidencia productiva (solo lectura, 2026-09-30, `bocam_finanzas`): la tabla `movimientos_presupuestales` está **vacía** en producción (0 filas, 0 presupuestos asignados). No hay duplicados que reparar hoy; tampoco hay evidencia empírica del comportamiento, solo el análisis del código. En otros entornos puede haber datos.

## What Changes

Esta fase es solo documental: define invariantes, alternativas, pruebas obligatorias y la migración segura. No se implementa código, migraciones ni restricciones.

- Invariantes del compromiso y la liberación por OC, y del estado de la OC ante eventos tardíos.
- Comparación de alternativas técnicas y recomendación.
- Pruebas obligatorias con PostgreSQL real.
- Plan de migración con auditoría previa de duplicados.

## Capabilities

### New Capabilities

- `compromiso-oc-consistente`: el compromiso y la liberación presupuestal de una OC son únicos, ordenados y consistentes con el estado de la OC ante concurrencia y eventos fuera de orden.

### Modified Capabilities

(ninguna)

## Impact

- Fase futura: `apps/finanzas` (handlers y endpoints de compromiso/liberación, migración Prisma) y `apps/compras` (handlers de `fondos_comprometidos` y `presupuesto_insuficiente`). Cada servicio con su propio PR, pruebas primero.
- Las migraciones de Finanzas se aplican con `prisma migrate deploy` en el despliegue del backend: una migración que falle detiene el despliegue.
- Bloquea el despliegue de #182 (junto con la aprobación contable) y no afecta a B1.
