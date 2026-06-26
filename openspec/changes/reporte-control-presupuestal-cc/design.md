## Context

El sistema tiene la cadena de trazabilidad completa en BD:

```
GT.Concepto (presupuesto)
  └─ Compras.Requisicion.concepto_id
       └─ Compras.OrdenCompra.requisicion_id (→ OC con total)
            └─ Finanzas.DetallePagoOC.oc_id (→ monto_aplicado)
```

Sin embargo, `DetallePagoOC` (Finanzas) solo guarda `oc_id`, sin `concepto_id`. Para agregar pagado por partida desde Finanzas, hay que añadir ese campo al modelo o forzar B2B encadenado (Finanzas → Compras → GT).

Los servicios involucrados usan bases de datos separadas; no puede haber JOINs cruzados. La regla del proyecto permite llamadas B2B entre backends con fallback `parcial: true` cuando un servicio no responde.

## Goals / Non-Goals

**Goals:**
- Agregar `concepto_id` desnormalizado a `DetallePagoOC` para que Finanzas pueda agregar pagado por partida sin depender en runtime de Compras
- Exponer endpoint de reporte en GT que consolide presupuesto + comprometido + pagado en una sola respuesta
- Exponer sub-endpoints ligeros en Compras y Finanzas solo para consumo B2B del reporte
- Proveer exportación PDF y XLSX via servicio Reportes (puerto 3010)
- Mostrar el reporte en GT (tab "Control Presupuestal") y un widget compacto en Compras

**Non-Goals:**
- No proyectar via RabbitMQ (el reporte es on-demand; la complejidad no justifica la proyección)
- No modificar el flujo de aprobación de OCs ni de pagos
- No incluir compromisos de RRHH (mano de obra) en esta iteración — dato no disponible en formato comparable
- No implementar caché de resultados (los datos son lo suficientemente rápidos con índices existentes)

## Decisions

### D1: Desnormalizar `concepto_id` en `DetallePagoOC` (vs. B2B encadenado)

**Decisión:** Agregar `concepto_id` (Uuid, nullable) y `concepto_clave` (VarChar, nullable) a `DetallePagoOC` en Finanzas, desnormalizados como ya lo están `oc_folio` y `proveedor`.

**Alternativa descartada:** Finanzas llama B2B a Compras por cada pago para obtener `concepto_id` — introduce latencia en el flujo de creación de pagos y acopla fuertemente ambos servicios en runtime.

**Rationale:** El patrón ya existe en el mismo modelo (`oc_folio`, `proveedor` son desnormalizados). El campo se pasa desde el frontend que ya tiene el contexto de la OC y, por ende, del concepto. Los pagos legacy quedan con `concepto_id = null` y aparecen como "Sin partida" en el reporte sin romper nada.

### D2: B2B síncrono GT → Compras + GT → Finanzas (vs. proyección RabbitMQ)

**Decisión:** El endpoint `/api/v1/gerencia-tecnica/reportes/control-presupuestal` hace dos llamadas B2B paralelas (Promise.all) y devuelve `parcial: true` si alguna falla.

**Alternativa descartada:** Mantener una tabla `resumen_presupuestal` en GT actualizada via eventos — requiere suscribir a múltiples tópicos (`compras.oc_*`, `finanzas.pago_*`), manejar orden y deduplicación. Para un reporte consultado con baja frecuencia, la complejidad no vale.

**Rationale:** El reporte es gerencial, no un widget en tiempo real. Las llamadas B2B con `Promise.all` son sub-100ms en la misma red Docker. Si Compras o Finanzas están caídos, se devuelve el presupuesto base más la advertencia `parcial: true`.

### D3: Endpoint de reporte en GT (no en Reportes como orquestador)

**Decisión:** La lógica de agregación vive en GT. El servicio Reportes solo recibe los datos ya procesados para renderizar PDF/XLSX.

**Rationale:** GT es el dueño del presupuesto base (Concepto). Toda la lógica de negocio del reporte (qué es presupuestado, cómo calcular disponible) pertenece a GT. Reportes es un renderizador agnóstico de datos.

### D4: Sub-endpoints B2B protegidos por header de servicio

Los endpoints `/compras/reportes/ocs-por-concepto` y `/finanzas/reportes/pagado-por-concepto` requieren el header `X-Internal-Service: gerencia-tecnica` además del JWT normal. Esto evita que sean expuestos al frontend directamente.

## Risks / Trade-offs

- **Datos de pago legacy sin `concepto_id`**: Los pagos creados antes de este change aparecerán como "Sin partida" en el reporte. Se documenta como deuda conocida; mitigación: en la vista se muestra un conteo de "pagos sin clasificar" para que el equipo sea consciente del gap.
- **Latencia B2B en reporte**: Si Compras o Finanzas tienen alta carga, el reporte puede ser lento. Mitigación: `Promise.all` en paralelo + timeout de 5s con fallback `parcial: true`.
- **Concepto vs. Categoría de gasto**: El presupuesto se agrega por Concepto (partida específica del APU), no por Categoría de gasto (MATERIALES, MANO_DE_OBRA, etc.). El filtro por categoría se aplica post-consulta agrupando los conceptos según el `tipo_insumo` predominante de su composición APU.
- **OCs sin `requisicion_id`**: OCs creadas fuera del flujo estándar (borrador manual sin req) no tienen `concepto_id` trazable. Aparecen en el total del proyecto pero no asignadas a partida. Mitigación: se reportan como "Sin partida" igual que los pagos legacy.

## Migration Plan

1. **Finanzas schema**: Agregar `concepto_id`/`concepto_clave` a `DetallePagoOC` → `prisma migrate deploy` en finanzas container (additive, safe)
2. **Compras**: Agregar endpoint B2B `/reportes/ocs-por-concepto` → deploy (no schema change)
3. **GT**: Agregar endpoint `/reportes/control-presupuestal` → deploy (no schema change)
4. **Reportes**: Agregar handler de export → deploy
5. **Frontend**: Actualizar `GerenciaTecnicaView.tsx` y `ComprasView.tsx` → rebuild app-shell

**Rollback**: Todos los cambios son aditivos. El rollback consiste en revertir el commit y hacer deploy. La columna `concepto_id` en `DetallePagoOC` puede quedar vacía sin afectar operaciones existentes.

## Open Questions

- ¿El widget de resumen en Compras debe incluir alerta visual cuando comprometido > X% del presupuesto? Propuesta: badge rojo cuando comprometido > 90% del presupuestado por partida.
- ¿El reporte debe mostrar partidas con presupuesto = 0 (conceptos sin importe asignado)? Propuesta: no, filtrar solo conceptos con `importe > 0`.
