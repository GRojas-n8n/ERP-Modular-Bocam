## Context

Hoy `AvanceFisico` se registra por concepto (`POST /avances`), pasa a `VALIDADO` por un superintendente y luego se agrupa en una `Estimacion` vía `estimacion_id`. `EstimacionesTab` lista un renglón por avance y solo tiene KPIs de conteo, autorizado y pagado. No existe monto contratado en control-proyectos (vive en el presupuesto activo de gerencia-tecnica, ya consultado por `resolverConceptoDelCatalogo`).

## Goals / Non-Goals

**Goals:**
- Registrar avances por estimación y por concepto en un paso.
- Mostrar contratado / estimado / cobrado / restante por cobrar.
- Eliminar la repetición de conceptos en la vista.

**Non-Goals:**
- Cambiar el workflow de validación/aprobación de estimaciones.
- Reportes por periodo mensual/semanal (queda habilitado por el dato, no incluido).
- Tocar código legacy fuera de las rutas y vistas listadas.

## Decisions

1. **Referencia, no reemplazo del vínculo existente.** Se agrega `AvanceFisico.estimacion_referencia_id` (nullable, sin FK; la estimación se valida en código). `estimacion_id` sigue significando "incluido en la estimación". Alternativa descartada: reutilizar `estimacion_id` — mezclaría "medido en" con "facturado en" y rompería la validación de avances ya asignados.
2. **Lote transaccional.** `POST /avances/lote` recibe `{ estimacion_referencia_id, items: [{concepto_id, cantidad_periodo}] }`, aplica la misma resolución de catálogo y cálculo de acumulado que `POST /avances`, todo en una transacción (todo o nada). Periodo = periodo de la estimación. Alternativa: N llamadas a `POST /avances` desde el cliente — sin atomicidad y con acumulados inconsistentes.
3. **Agregación en backend.** `GET /avances/resumen-por-concepto` devuelve por concepto: contratado, acumulado, % y desglose por estimación/periodo. `GET /estimaciones/totales` devuelve `{contratado, estimado, cobrado, restante, parcial}`. El frontend solo llama a control-proyectos (regla de dashboards).
4. **Definición de totales.** contratado = Σ(cantidad×PU) del presupuesto activo; estimado = Σ subtotal de estimaciones no `RECHAZADA`; cobrado = Σ subtotal de `FACTURADA` (consistente con el KPI "Total Pagado" actual); restante por cobrar = contratado − cobrado. Si gerencia-tecnica falla: `parcial: true` y contratado/restante `null`.
5. **Compatibilidad.** `POST /avances` individual y la creación de estimación no cambian.

## Risks / Trade-offs

- [Interpretación del punto 1 del feedback ("avance propio en base a lo cobrado")] → se implementa como avance por estimación de referencia con cantidades prellenadas de esa estimación, editables; confirmar con el residente.
- [Estimaciones sin subtotal (BORRADOR con 0)] → cuentan 0, sin error.
- [Migración en tabla legacy] → solo columna nullable + índice; sin backfill.

## Migration Plan

Migración Prisma aditiva; desplegar backend antes que frontend; rollback = revertir frontend, la columna nullable queda inerte.

## Open Questions

- ¿"Cobrado" = FACTURADA solamente, o también APROBADA_FINANCIERA?
- ¿Los avances del lote también requieren validación del superintendente (asumido: sí, mismo flujo)?
- ¿El residente edita las cantidades prellenadas o solo confirma lo cobrado?
