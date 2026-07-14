## Context

Investigado antes de diseñar (`apps/compras/prisma/schema.prisma`): la
mayoría de las relaciones "hijo" ya tienen `onDelete: Cascade`
(`RequisicionItem`, `OrdenCompraItem`, `RecepcionOC`/`RecepcionOCItem`, y
todo lo colgado de `CuadroComparativo`: `ComparativaDetalle`,
`ComparativaLinea`, `AclaracionComparativa`, `EvaluacionEspecificacion`,
`ComparativaProveedorArchivo`, `AuditoriaDesbloqueoComparativa`). Pero varias
relaciones **cruzadas entre agregados** son UUIDs sueltos sin `@relation`
declarada (ninguna FK real a nivel Postgres):
- `CuadroComparativo.requisicion_id` → no hay FK hacia `Requisicion`.
- `SolicitudCotizacion.requisicion_id` → no hay FK hacia `Requisicion`.
- `OrdenCompra.requisicion_id` → no hay FK hacia `Requisicion`.
- `EspecificacionDetalleReq.detalle_id` → no hay FK hacia `RequisicionItem`.
- `AlertaOcError.oc_id` → no hay FK hacia `OrdenCompra`.

Y las relaciones que SÍ apuntan a `Proveedor` (`OrdenCompra.proveedor`,
`ComparativaDetalle.proveedor`, `EvaluacionEspecificacion.proveedor`,
`SolicitudCotizacionProveedor.proveedor`) **no tienen `onDelete: Cascade`**
— son `RESTRICT` por default: Postgres rechaza borrar un `Proveedor`
mientras cualquiera de esas filas lo siga referenciando.

También existe el patrón ya usado en `cancelar-OC`
(`main.ts:3831-3905`) para liberar fondos comprometidos en Finanzas
(`POST ${FINANZAS_URL}/liberar-fondos`) — se reutiliza para la purga.

## Goals / Non-Goals

**Goals:**
- Borrado selectivo (checkboxes), nunca "borrar toda la categoría".
- Ninguna Requisición/OC/Proveedor desaparece dejando basura huérfana en
  las tablas sin FK real listadas arriba.
- Nunca se borra en cascada silenciosa algo que el admin no seleccionó
  explícitamente (ej. borrar un Proveedor no debe arrastrar OCs que el
  admin no marcó).
- Acción admin-only, protegida en servidor, con confirmación explícita y
  registro de auditoría.

**Non-Goals:**
- No incluye `Proyectos` ni `Usuarios` (decisión ya tomada, fuera de
  alcance — radio de impacto cruza 11 microservicios).
- No es borrado lógico (soft-delete) — es borrado físico real, porque el
  propósito explícito es "reiniciar flujos de trabajo" con datos limpios,
  no ocultar registros que seguirían contando en reportes/dashboards.
- No purga `Clientes` (`apps/ventas`) — change aparte,
  `panel-purga-datos-prueba-ventas`.

## Decisions

**1. Orden de borrado por tipo — children-first dentro del propio agregado,
bloqueo explícito en las referencias cruzadas sin FK.**

```
Purgar Requisición (id):
  1. Buscar OrdenCompra(s) con requisicion_id = id
     → si el admin NO las incluyó también en `ordenes_compra`, BLOQUEAR
       con 409: "Esta requisición tiene N orden(es) de compra generada(s);
       inclúyelas también en la selección o bórralas primero."
       (Solo las OC bloquean — son el único documento con valor de
       negocio propio en esta cadena; el CuadroComparativo y la
       SolicitudCotizacion son artefactos internos del propio proceso de
       purga de la Requisición, no algo que el admin selecciona aparte.)
     → si no existen o ya fueron incluidas, continuar.
  2. Borrar SolicitudCotizacion asociadas a la requisición (cascada
     automática a SolicitudCotizacionProveedor) — manual (sin FK), pero
     sin exigir selección aparte: son hijas conceptuales de la
     Requisición.
  3. Borrar AnotacionEspecificacion donde cuadro_id IN (cuadros de esta
     requisición) O especificacion_id IN (especificaciones de esta
     requisición) — manual, sin FK hacia ninguno de los dos; si no se
     limpia aquí queda huérfana sin importar el orden de los pasos 4/5.
  4. Borrar CuadroComparativo(s) asociados a la requisición (cascada
     automática limpia todo lo colgado: ComparativaDetalle,
     EvaluacionEspecificacion, ComparativaLinea, AclaracionComparativa,
     ComparativaProveedorArchivo, AuditoriaDesbloqueoComparativa) — mismo
     criterio que el punto 2: hijo conceptual, no selección aparte. DEBE ir
     antes del paso 5: `EvaluacionEspecificacion.especificacion_id` tiene
     FK RESTRICT hacia `EspecificacionDetalleReq` y solo cascada desde el
     lado de `CuadroComparativo` — si se borra la especificación primero,
     Postgres rechaza el borrado mientras la evaluación siga viva.
  5. Borrar EspecificacionDetalleReq donde detalle_id IN (RequisicionItem
     ids de esta requisición) — manual, sin FK.
  6. Borrar Requisicion (cascada automática a RequisicionItem).

Purgar Orden de Compra (id):
  1. Si tiene presupuesto_id: POST liberar-fondos a Finanzas (best-effort —
     un fallo se registra como advertencia pero NO bloquea el borrado,
     a diferencia de cancelar-OC que sí bloquea; el propósito es limpiar
     datos de prueba, no una cancelación formal con conciliación estricta).
  2. Borrar AlertaOcError donde oc_id = id — manual, sin FK.
  3. Borrar OrdenCompra (cascada automática a OrdenCompraItem, RecepcionOC
     y RecepcionOCItem).

Purgar Proveedor (id):
  1. Verificar (dentro de la misma transacción del lote, DESPUÉS de
     aplicar las purgas de Requisiciones/OC ya seleccionadas) que no
     queden filas en OrdenCompra, ComparativaDetalle,
     EvaluacionEspecificacion, SolicitudCotizacionProveedor,
     CalificacionProveedor, DocumentoProveedor, ComparativaProveedorArchivo
     referenciando a este proveedor.
     → si quedan, BLOQUEAR con 409 listando cuántas y de qué tipo.
  2. Borrar CalificacionProveedor, DocumentoProveedor (datos propios del
     proveedor sin relación con otras entidades del lote — se pueden
     limpiar directo, no representan "otro dato" que el admin no pidió
     borrar).
  3. Borrar Proveedor.
```

**2. Un solo endpoint transaccional, no uno por entidad.**
`POST /api/v1/compras/admin/purga` recibe
`{ requisiciones: string[], ordenes_compra: string[], proveedores: string[] }`
y aplica TODO el lote en una única transacción Prisma en el orden:
Requisiciones → OC → Proveedores (así una Requisición y su OC seleccionadas
juntas se resuelven sin bloquearse mutuamente). Si cualquier bloqueo de
integridad ocurre a mitad del lote, la transacción completa hace rollback —
no hay borrados parciales.

**3. Confirmación por palabra escrita, no contraseña.**
El requerimiento ofrecía ambas opciones ("ej. ... o la contraseña"). Se
elige la palabra escrita (`ELIMINAR`) porque la contraseña requeriría un
endpoint nuevo de re-verificación de credenciales fuera del alcance de este
change, y el objetivo (evitar un clic accidental) se cumple igual con texto
exacto + conteo visible antes de confirmar.

**4. Auditoría vía el logging existente, sin tabla nueva.**
`logInfo(req, 'compras', 'compras.admin.purga_ejecutada', ...)` con el
detalle de IDs borrados por tipo, usuario y timestamp — mismo mecanismo que
ya usa todo `apps/compras` (Sentry/observability), sin introducir una tabla
de auditoría nueva solo para esto.

## Risks / Trade-offs

- **[Riesgo] Borrado físico es irreversible.** → Mitigación: confirmación
  explícita + conteo visible + bloqueo de integridad en vez de cascada
  silenciosa + auditoría de qué se borró. No hay mitigación técnica que
  reemplace la responsabilidad del admin al confirmar — es la naturaleza
  del requerimiento (herramienta de purga real, no papelera de reciclaje).
- **[Riesgo] Liberar fondos en Finanzas falla silenciosamente.** →
  Mitigación: se registra como advertencia en la respuesta (`advertencias:
  [...]`), visible en el modal de resultado, aunque no bloquea el borrado.
- **[Trade-off] Bloqueo en vez de cascada total automática.** Podría ser
  más "conveniente" cascadear todo automáticamente (ej. borrar un Proveedor
  y que arrastre sus OCs sin preguntar), pero se prioriza que el admin vea
  exactamente qué se va a borrar antes de confirmarlo — más lento de usar,
  más seguro en un entorno con datos reales mezclados con datos de prueba.

## Migration Plan

- Sin migración de schema.
- Deploy: rebuild `apps/compras` + `apps/app-shell`, sin downtime.
- Sin flag de rollout — el endpoint ya nace protegido por rol `admin`.

## Open Questions

(ninguna — alcance acotado con las 2 decisiones ya tomadas con el usuario)
