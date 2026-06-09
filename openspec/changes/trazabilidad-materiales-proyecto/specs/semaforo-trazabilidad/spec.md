# Spec — Semáforo de Trazabilidad de Materiales

## Criterios de Aceptación

**CA-1: Semáforo ROJO — insumo presupuestado sin ninguna requisición**
- Dado un insumo con `cantidad_presupuestada > 0` en al menos un ítem de req
- Y `cantidad_requisicionada == 0` (ninguna req aprobada tiene este insumo)
- Entonces el semáforo es ROJO

**CA-2: Semáforo AMARILLO — requisición creada pero OC incompleta**
- Dado un insumo con `cantidad_requisicionada > 0`
- Y `cantidad_oc_emitida < cantidad_presupuestada`
- Entonces el semáforo es AMARILLO

**CA-3: Semáforo VERDE — OC cubre el 100% del presupuesto**
- Dado un insumo con `cantidad_oc_emitida >= cantidad_presupuestada`
- Entonces el semáforo es VERDE

**CA-4: Semáforo EXTRA — insumo sin presupuesto**
- Dado un insumo cuya `cantidad_presupuestada IS NULL` (o 0) en todas sus requisiciones
- Entonces el semáforo es EXTRA (representado en gris con badge "Ext.")

**CA-5: % de avance calculado correctamente**
- `pct_avance_req = (cantidad_requisicionada / cantidad_presupuestada) * 100`
- `pct_avance_oc  = (cantidad_oc_emitida / cantidad_presupuestada) * 100`
- Si `cantidad_presupuestada = 0 o NULL`: ambos % se muestran como "—"

**CA-6: Gasto = monto comprometido en OCs emitidas**
- `monto_oc_emitida` = suma de `(precio_unitario × cantidad)` de todas las líneas de OC en estado `EMITIDA` o `ENTREGADA` para ese insumo en el proyecto

**CA-7: Filtros de la vista**
- El usuario puede filtrar por semáforo (ROJO / AMARILLO / VERDE / EXTRA / Todos)
- El usuario puede buscar por clave o descripción de insumo
